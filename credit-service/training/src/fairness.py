"""Fairness audit (perfil 2.2 / 4.1): approval-rate parity across the
fairness-only control variables. These columns are never fed to the model
(see dataset_builder.split_columns / config.FAIRNESS_ONLY_COLUMNS) — this
module only checks whether the model's *decisions* end up correlated with
them.
"""
import pandas as pd
from fairlearn.metrics import MetricFrame, demographic_parity_difference, demographic_parity_ratio


def audit_fairness(decisions: pd.Series, fairness_df: pd.DataFrame) -> dict:
    approved = (decisions == "APROBADO").astype(int)
    report = {}
    for column in fairness_df.columns:
        sensitive = fairness_df[column]
        frame = MetricFrame(
            metrics={"approval_rate": lambda yt, yp: yp.mean()},
            y_true=approved,
            y_pred=approved,
            sensitive_features=sensitive,
        )
        report[column] = {
            "approval_rate_by_group": frame.by_group["approval_rate"].to_dict(),
            "demographic_parity_difference": float(
                demographic_parity_difference(approved, approved, sensitive_features=sensitive)
            ),
            "demographic_parity_ratio": float(
                demographic_parity_ratio(approved, approved, sensitive_features=sensitive)
            ),
        }
    return report
