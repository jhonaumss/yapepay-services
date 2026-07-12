"""Tests the feature-building + scoring logic in src/ml/inference.py without
needing a live MLflow server or trained model — a stub model/explainer is
enough since we're testing our own glue code, not XGBoost/SHAP themselves."""
import numpy as np

from src.ml.inference import evaluate
from src.ml.model_loader import ModelBundle
from src.schemas import CreditApplication


class _StubModel:
    def __init__(self, pd_value: float):
        self._pd_value = pd_value

    def predict_proba(self, X):
        return np.array([[1 - self._pd_value, self._pd_value]])


class _StubExplainer:
    def shap_values(self, x_row):
        return np.zeros((1, x_row.shape[1]))


def _make_bundle(pd_value: float) -> ModelBundle:
    from training.src import config as train_cfg

    return ModelBundle(
        model=_StubModel(pd_value),
        explainer=_StubExplainer(),
        feature_columns=train_cfg.MODEL_FEATURE_COLUMNS,
        bureau_defaults={col: 0.0 for col in train_cfg.BUREAU_DEFAULTED_FEATURES},
        model_version="credit-risk-model:test",
    )


def _application(**overrides) -> CreditApplication:
    kwargs = dict(
        age=30,
        educationLevel="UNIVERSITARIO",
        employmentStatus="DEPENDIENTE",
        monthlyIncome=2000,
        employmentYears=3,
        requestedAmount=1000,
        termMonths=12,
    )
    kwargs.update(overrides)
    return CreditApplication(**kwargs)


_COLD_START_FEATURES = {
    "tx_count_30d": 0,
    "avg_amount_30d": 0.0,
    "std_amount_30d": 0.0,
    "inbound_outbound_ratio": 0.0,
    "cash_out_ratio": 0.0,
    "transfer_ratio": 0.0,
    "distinct_counterparties_30d": 0,
    "account_tenure_days": 0,
}


def test_low_pd_yields_high_score_and_approval():
    bundle = _make_bundle(pd_value=0.02)
    result = evaluate(_application(), _COLD_START_FEATURES, bundle)
    assert result["risk_category"] == "BAJO"
    assert result["decision"] == "APROBADO"
    assert result["score"] > 900


def test_high_pd_yields_low_score_and_rejection():
    bundle = _make_bundle(pd_value=0.6)
    result = evaluate(_application(), _COLD_START_FEATURES, bundle)
    assert result["risk_category"] == "ALTO"
    assert result["decision"] == "RECHAZADO"
    assert result["score"] < 500


def test_cold_start_user_segmented_as_nuevo():
    bundle = _make_bundle(pd_value=0.1)
    result = evaluate(_application(), _COLD_START_FEATURES, bundle)
    assert result["user_segment"] == "NUEVO"
    assert result["confidence_level"] == "BAJA"


def test_established_user_segmented_correctly():
    bundle = _make_bundle(pd_value=0.1)
    established_features = {**_COLD_START_FEATURES, "tx_count_30d": 25, "account_tenure_days": 120}
    result = evaluate(_application(), established_features, bundle)
    assert result["user_segment"] == "ESTABLECIDO"
    assert result["confidence_level"] == "ALTA"
