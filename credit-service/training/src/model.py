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


def pd_to_decision(pd_values: np.ndarray) -> np.ndarray:
    return np.where(pd_values < config.APPROVAL_PD_THRESHOLD, "APROBADO", "RECHAZADO")


def ks_statistic(y_true: np.ndarray, pd_values: np.ndarray) -> float:
    fpr, tpr, _ = roc_curve(y_true, pd_values)
    return float(np.max(np.abs(tpr - fpr)))


def evaluate(model: xgb.XGBClassifier, X: pd.DataFrame, y: pd.Series) -> dict:
    pd_values = predict_pd(model, X)
    decisions = pd_to_decision(pd_values)
    approved = decisions == "APROBADO"
    return {
        "roc_auc": float(roc_auc_score(y, pd_values)),
        "average_precision": float(average_precision_score(y, pd_values)),
        "ks_statistic": ks_statistic(y.to_numpy(), pd_values),
        "approval_rate": float(approved.mean()),
        "default_rate_among_approved": float(y[approved].mean()) if approved.any() else 0.0,
    }
