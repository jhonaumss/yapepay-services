"""Loads the aliased model (default "production") from the MLflow registry
once at process startup and keeps it resident in memory — the whole reason
credit-service runs on Fargate instead of Lambda (perfil 5.1).
"""
import json
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import mlflow
import shap
import xgboost as xgb

from training.src import config as train_cfg
from training.src.explainability import build_explainer

from .. import config


@dataclass
class ModelBundle:
    model: xgb.XGBClassifier
    explainer: shap.TreeExplainer
    feature_columns: list[str]
    bureau_defaults: dict
    model_version: str


_bundle: Optional[ModelBundle] = None


def load_model_bundle() -> ModelBundle:
    global _bundle
    if _bundle is not None:
        return _bundle

    mlflow.set_tracking_uri(train_cfg.MLFLOW_TRACKING_URI)
    client = mlflow.MlflowClient()
    model_version = client.get_model_version_by_alias(train_cfg.REGISTERED_MODEL_NAME, config.MLFLOW_MODEL_ALIAS)

    model_uri = f"models:/{train_cfg.REGISTERED_MODEL_NAME}@{config.MLFLOW_MODEL_ALIAS}"
    model = mlflow.xgboost.load_model(model_uri)

    with tempfile.TemporaryDirectory() as tmp:
        features_path = client.download_artifacts(model_version.run_id, "feature_columns.json", tmp)
        feature_columns = json.loads(Path(features_path).read_text())

        defaults_path = client.download_artifacts(model_version.run_id, "bureau_defaults.json", tmp)
        bureau_defaults = json.loads(Path(defaults_path).read_text())

    explainer = build_explainer(model)

    _bundle = ModelBundle(
        model=model,
        explainer=explainer,
        feature_columns=feature_columns,
        bureau_defaults=bureau_defaults,
        model_version=f"{train_cfg.REGISTERED_MODEL_NAME}:v{model_version.version}",
    )
    return _bundle
