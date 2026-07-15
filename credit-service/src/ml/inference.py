"""Turns a CreditApplication + this user's transactional features into a full
evaluation: PD, score, risk category, decision, segment, confidence and
explanation factors. Reuses training's business-rule functions directly
(training.src.model) so serving can never silently drift from training.
"""
import numpy as np
import pandas as pd
from training.src.explainability import explain_row
from training.src.model import pd_to_decision, pd_to_risk_category, pd_to_score, predict_pd

from ..features.feature_store import resolve_user_segment
from ..schemas import CreditApplication
from .model_loader import ModelBundle


def _form_derived_features(application: CreditApplication) -> dict:
    income = max(application.monthly_income, 1.0)
    debt_ratio = application.monthly_debt_payments / income
    requested_to_income_ratio = min(application.requested_amount / income, 50.0)
    new_installment = application.requested_amount / application.term_months
    debt_to_income_with_new_loan = min(debt_ratio + new_installment / income, 50.0)
    return {
        "age": float(application.age),
        "monthly_income": application.monthly_income,
        "debt_ratio": debt_ratio,
        "requested_to_income_ratio": requested_to_income_ratio,
        "debt_to_income_with_new_loan": debt_to_income_with_new_loan,
        "had_previous_default": int(application.had_previous_default),
    }


def evaluate(
    application: CreditApplication,
    transactional_features: dict,
    bundle: ModelBundle,
) -> dict:
    features = {
        **_form_derived_features(application),
        **transactional_features,
        **bundle.bureau_defaults,
    }
    x_row = pd.DataFrame([features])[bundle.feature_columns]

    probability_of_default = float(predict_pd(bundle.model, x_row)[0])
    pd_array = np.array([probability_of_default])
    score = int(pd_to_score(pd_array)[0])
    risk_category = str(pd_to_risk_category(pd_array)[0])
    decision = str(pd_to_decision(pd_array, x_row["debt_to_income_with_new_loan"].to_numpy())[0])

    user_segment, confidence_level = resolve_user_segment(
        tx_count_30d=int(transactional_features["tx_count_30d"]),
        account_tenure_days=int(transactional_features["account_tenure_days"]),
    )

    explanation_factors = explain_row(bundle.explainer, x_row, top_k=5)

    return {
        "probability_of_default": probability_of_default,
        "score": score,
        "risk_category": risk_category,
        "decision": decision,
        "user_segment": user_segment,
        "confidence_level": confidence_level,
        "explanation_factors": explanation_factors,
        "model_version": bundle.model_version,
    }
