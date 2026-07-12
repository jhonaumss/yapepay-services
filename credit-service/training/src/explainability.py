"""Per-request explainability (perfil RF3 / 5.3 step 5): SHAP factors
translated into the labels the API returns, with graceful degradation if SHAP
itself fails (perfil RNF: explainability failure must not block the score).
"""
import numpy as np
import pandas as pd
import shap
import xgboost as xgb

FEATURE_LABELS_ES = {
    "age": "Edad",
    "monthly_income": "Ingreso mensual",
    "debt_ratio": "Relación deuda/ingreso",
    "revolving_utilization": "Utilización de líneas de crédito",
    "open_credit_lines": "Líneas de crédito abiertas",
    "real_estate_loans": "Préstamos hipotecarios/inmobiliarios",
    "times_90d_late": "Atrasos de 90+ días",
    "times_30_59d_late": "Atrasos de 30-59 días",
    "times_60_89d_late": "Atrasos de 60-89 días",
    "number_of_dependents": "Número de dependientes",
    "tx_count_30d": "Cantidad de transacciones (30 días)",
    "avg_amount_30d": "Monto promedio por transacción",
    "std_amount_30d": "Variabilidad del monto transaccional",
    "inbound_outbound_ratio": "Relación ingresos/egresos",
    "cash_out_ratio": "Proporción de retiros",
    "transfer_ratio": "Proporción de transferencias P2P",
    "distinct_counterparties_30d": "Diversidad de contrapartes",
    "account_tenure_days": "Antigüedad de la cuenta",
    "requested_to_income_ratio": "Monto solicitado / ingreso",
    "debt_to_income_with_new_loan": "Deuda/ingreso proyectada con el nuevo crédito",
}


def build_explainer(model: xgb.XGBClassifier) -> shap.TreeExplainer:
    return shap.TreeExplainer(model)


def explain_row(explainer: shap.TreeExplainer, x_row: pd.DataFrame, top_k: int = 5) -> list[dict]:
    """Returns [{factor, impact, direction}] for a single-row DataFrame, or an
    empty list if SHAP fails — callers must still return the score."""
    try:
        shap_values = explainer.shap_values(x_row)
        values = np.asarray(shap_values)[0]
    except Exception:
        return []

    total = np.sum(np.abs(values)) or 1.0
    order = np.argsort(-np.abs(values))[:top_k]
    factors = []
    for i in order:
        column = x_row.columns[i]
        impact = float(values[i]) / total
        factors.append(
            {
                "factor": FEATURE_LABELS_ES.get(column, column),
                "impact": round(abs(impact), 4),
                "direction": "NEGATIVO" if values[i] > 0 else "POSITIVO",
            }
        )
    return factors
