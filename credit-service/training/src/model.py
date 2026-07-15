"""XGBoost PD model + the business-rule layer that turns a probability into
the three outputs the perfil asks for: score, risk category and decision.
"""
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import average_precision_score, roc_auc_score, roc_curve

from . import config

XGB_PARAMS = dict(
    n_estimators=300,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=5,
    reg_lambda=1.0,
    eval_metric="auc",
    early_stopping_rounds=30,
    random_state=config.RANDOM_SEED,
    # XGBoost handles NaN (missing GMSC values) natively — no imputer needed.
    missing=np.nan,
)


def train_model(X_train, y_train, X_val, y_val) -> xgb.XGBClassifier:
    model = xgb.XGBClassifier(**XGB_PARAMS)
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    return model


def predict_pd(model: xgb.XGBClassifier, X: pd.DataFrame) -> np.ndarray:
    return model.predict_proba(X)[:, 1]


def pd_to_score(pd_values: np.ndarray) -> np.ndarray:
    """0-1000 score: higher score = lower risk (perfil 1.3)."""
    return np.clip(np.round(1000 * (1 - pd_values)), 0, 1000).astype(int)


def pd_to_risk_category(pd_values: np.ndarray) -> np.ndarray:
    return np.select(
        [pd_values < config.RISK_BAJO_MAX_PD, pd_values < config.RISK_MEDIO_MAX_PD],
        ["BAJO", "MEDIO"],
        default="ALTO",
    )


def compute_affordability(
    debt_to_income_with_new_loan: np.ndarray,
    estimated_assets_value: np.ndarray,
    requested_amount: np.ndarray,
) -> np.ndarray:
    """True if the applicant clears the flat DTI ceiling outright, OR their
    assets alone would cover the requested amount. A DTI ratio alone bypasses
    the model because it's ~unlearnable from GMSC (see
    config.MAX_DEBT_TO_INCOME_WITH_NEW_LOAN) — but used by itself it
    systematically dings applicants who've simply had more time to
    accumulate life-stage debt (confirmed: it rejected GMSC's *safest* age
    band, 40-60, most often). The asset escape hatch mirrors real-world
    collateral/net-worth underwriting instead of judging on DTI alone."""
    dti_ok = np.asarray(debt_to_income_with_new_loan) < config.MAX_DEBT_TO_INCOME_WITH_NEW_LOAN
    assets_cover_request = np.asarray(estimated_assets_value) >= np.asarray(
        requested_amount
    ) * config.MIN_ASSET_COVERAGE_RATIO
    return dti_ok | assets_cover_request


def max_term_for_age(age):
    """Smooth term-availability ceiling by age instead of feeding age into
    the PD model — prices "how long a commitment can we responsibly offer",
    not "how risky is this person" (the standard, defensible way real
    personal-loan underwriting accounts for age). Full
    config.MAX_TERM_MONTHS_CAP up to TERM_TAPER_START_AGE, then a linear
    taper down to TERM_MONTHS_FLOOR by TERM_TAPER_END_AGE — no cliff at a
    single age, which is deliberate: a hard cutoff at 60 rejected ~30% of
    that whole age band outright (anyone who happened to request a term past
    the cutoff) and blew up the age_band fairness gap instead of shrinking
    it. Enforced as a request-time validation (see CreditApplication in
    schemas.py) rather than folded into pd_to_decision, so a term/age
    mismatch is a 422 the applicant can immediately correct — never a
    RECHAZADO credit decision, and never mixed into the fairness audit's
    approval-rate metric."""
    age = np.asarray(age)
    span = config.TERM_TAPER_END_AGE - config.TERM_TAPER_START_AGE
    progress = np.clip((age - config.TERM_TAPER_START_AGE) / span, 0.0, 1.0)
    taper = config.MAX_TERM_MONTHS_CAP - progress * (config.MAX_TERM_MONTHS_CAP - config.TERM_MONTHS_FLOOR)
    result = np.round(taper).astype(int)
    return int(result) if result.ndim == 0 else result


def pd_to_decision(pd_values: np.ndarray, affordable: np.ndarray) -> np.ndarray:
    """PD threshold AND the affordability gate — either one alone can reject."""
    approved = (pd_values < config.APPROVAL_PD_THRESHOLD) & np.asarray(affordable, dtype=bool)
    return np.where(approved, "APROBADO", "RECHAZADO")


def ks_statistic(y_true: np.ndarray, pd_values: np.ndarray) -> float:
    fpr, tpr, _ = roc_curve(y_true, pd_values)
    return float(np.max(np.abs(tpr - fpr)))


def evaluate(model: xgb.XGBClassifier, X: pd.DataFrame, y: pd.Series, affordable: np.ndarray) -> dict:
    pd_values = predict_pd(model, X)
    decisions = pd_to_decision(pd_values, affordable)
    approved = decisions == "APROBADO"
    return {
        "roc_auc": float(roc_auc_score(y, pd_values)),
        "average_precision": float(average_precision_score(y, pd_values)),
        "ks_statistic": ks_statistic(y.to_numpy(), pd_values),
        "approval_rate": float(approved.mean()),
        "default_rate_among_approved": float(y[approved].mean()) if approved.any() else 0.0,
    }
