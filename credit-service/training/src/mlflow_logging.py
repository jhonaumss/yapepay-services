"""MLflow experiment tracking + model registry (perfil 5.2/5.4).

Registers every training run as a new model version under
config.REGISTERED_MODEL_NAME with the "candidate" alias. Promotion to
"production" is a separate, manual step (ml-train.yml / Phase 5) — never
done automatically here.
"""
import json
import tempfile
from pathlib import Path
from urllib.parse import urlparse

import mlflow
import mlflow.xgboost
import psycopg2
import xgboost as xgb

from . import config


def ensure_mlflow_database() -> None:
    """MLflow's Postgres backend store needs its target database to already
    exist. Same self-provisioning pattern every other service in this project
    uses (each creates its own database on the shared RDS instance) — a
    no-op when running locally against the default sqlite fallback."""
    if not config.MLFLOW_TRACKING_URI.startswith("postgresql://"):
        return
    parsed = urlparse(config.MLFLOW_TRACKING_URI)
    db_name = parsed.path.lstrip("/")
    admin = psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        user=parsed.username,
        password=parsed.password,
        dbname="postgres",
    )
    admin.autocommit = True
    try:
        with admin.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
            if cur.fetchone() is None:
                cur.execute(f'CREATE DATABASE "{db_name}"')
                print(f"Created database: {db_name}")
    finally:
        admin.close()


def log_training_run(
    model: xgb.XGBClassifier,
    params: dict,
    metrics: dict,
    fairness_report: dict,
    feature_columns: list[str],
    bureau_defaults: dict,
) -> dict:
    ensure_mlflow_database()
    mlflow.set_tracking_uri(config.MLFLOW_TRACKING_URI)
    experiment = mlflow.get_experiment_by_name(config.MLFLOW_EXPERIMENT_NAME)
    if experiment is None:
        mlflow.create_experiment(
            config.MLFLOW_EXPERIMENT_NAME, artifact_location=config.MLFLOW_ARTIFACT_LOCATION
        )
    mlflow.set_experiment(config.MLFLOW_EXPERIMENT_NAME)

    with mlflow.start_run() as run:
        mlflow.log_params(params)
        mlflow.log_metrics(metrics)

        with tempfile.TemporaryDirectory() as tmp:
            fairness_path = Path(tmp) / "fairness_report.json"
            fairness_path.write_text(json.dumps(fairness_report, indent=2, default=str))
            mlflow.log_artifact(str(fairness_path))

            features_path = Path(tmp) / "feature_columns.json"
            features_path.write_text(json.dumps(feature_columns, indent=2))
            mlflow.log_artifact(str(features_path))

            defaults_path = Path(tmp) / config.BUREAU_DEFAULTS_FILENAME
            defaults_path.write_text(json.dumps(bureau_defaults, indent=2))
            mlflow.log_artifact(str(defaults_path))

        model_info = mlflow.xgboost.log_model(
            model,
            artifact_path="model",
            registered_model_name=config.REGISTERED_MODEL_NAME,
        )

        client = mlflow.MlflowClient()
        client.set_registered_model_alias(
            config.REGISTERED_MODEL_NAME, "candidate", model_info.registered_model_version
        )

        return {"run_id": run.info.run_id, "model_version": model_info.registered_model_version}
