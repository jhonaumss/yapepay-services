"""Metric gate + promotion: run as `python -m training.src.promote` inside
the training ECS task (same task definition as train.py, different command
override — see ml-train.yml). Reads the just-trained candidate from S3's
pointer file (written by train.py), compares it against the current
"production" version's logged metrics, and only then flips the "production"
alias.

This is the automatic half of perfil RF7 ("promover automáticamente...solo si
supera las métricas mínimas"); the manual half is the GitHub Environment
approval gate in ml-train.yml that must pass before this script even runs.
"""
import json
import sys
import tempfile
from pathlib import Path

import boto3
import mlflow

from . import config
from .mlflow_logging import ensure_mlflow_database

ROC_AUC_REGRESSION_TOLERANCE = 0.01
FAIRNESS_REGRESSION_TOLERANCE = 0.02


def _read_candidate_pointer() -> dict:
    body = (
        boto3.client("s3")
        .get_object(Bucket=config.S3_DATA_BUCKET, Key="training-runs/latest.json")["Body"]
        .read()
    )
    return json.loads(body)


def _max_fairness_gap(client: mlflow.MlflowClient, run_id: str) -> float:
    with tempfile.TemporaryDirectory() as tmp:
        path = client.download_artifacts(run_id, "fairness_report.json", tmp)
        report = json.loads(Path(path).read_text())
    return max(group["demographic_parity_difference"] for group in report.values())


def main() -> int:
    ensure_mlflow_database()
    mlflow.set_tracking_uri(config.MLFLOW_TRACKING_URI)
    client = mlflow.MlflowClient()

    candidate = _read_candidate_pointer()
    candidate_run = client.get_run(candidate["run_id"])
    candidate_auc = candidate_run.data.metrics["roc_auc"]
    candidate_fairness_gap = _max_fairness_gap(client, candidate["run_id"])
    print(f"Candidate v{candidate['model_version']}: roc_auc={candidate_auc:.4f}, "
          f"max_fairness_gap={candidate_fairness_gap:.4f}")

    try:
        production = client.get_model_version_by_alias(config.REGISTERED_MODEL_NAME, "production")
    except mlflow.exceptions.RestException:
        production = None

    if production is not None:
        production_run = client.get_run(production.run_id)
        production_auc = production_run.data.metrics["roc_auc"]
        production_fairness_gap = _max_fairness_gap(client, production.run_id)
        print(f"Current production v{production.version}: roc_auc={production_auc:.4f}, "
              f"max_fairness_gap={production_fairness_gap:.4f}")

        if candidate_auc < production_auc - ROC_AUC_REGRESSION_TOLERANCE:
            print(f"REJECTED: candidate roc_auc regresses beyond tolerance "
                  f"({candidate_auc:.4f} < {production_auc:.4f} - {ROC_AUC_REGRESSION_TOLERANCE})")
            return 1
        if candidate_fairness_gap > production_fairness_gap + FAIRNESS_REGRESSION_TOLERANCE:
            print(f"REJECTED: candidate fairness gap regresses beyond tolerance "
                  f"({candidate_fairness_gap:.4f} > {production_fairness_gap:.4f} + {FAIRNESS_REGRESSION_TOLERANCE})")
            return 1
    else:
        print("No existing production model — first promotion, skipping comparison.")

    client.set_registered_model_alias(
        config.REGISTERED_MODEL_NAME, "production", candidate["model_version"]
    )
    print(f"Promoted {config.REGISTERED_MODEL_NAME} v{candidate['model_version']} to production.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
