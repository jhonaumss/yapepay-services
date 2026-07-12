"""Entrypoint: build the dataset, train, evaluate, audit fairness, log to
MLflow. Run with `python -m src.train` from credit-service/training/.
"""
import json

import pandas as pd
from sklearn.model_selection import train_test_split

from . import config, model
from .dataset_builder import build_training_dataset, split_columns
from .explainability import build_explainer, explain_row
from .fairness import audit_fairness
from .mlflow_logging import log_training_run


def main() -> None:
    print("Building training dataset (GMSC + PaySim-derived features)...")
    df = build_training_dataset()
    X, fairness_df, y = split_columns(df)
    print(f"Dataset shape: {X.shape}, default rate: {y.mean():.4f}")

    X_train, X_temp, y_train, y_temp, fair_train, fair_temp = train_test_split(
        X, y, fairness_df, test_size=0.30, random_state=config.RANDOM_SEED, stratify=y
    )
    X_val, X_test, y_val, y_test, fair_val, fair_test = train_test_split(
        X_temp, y_temp, fair_temp, test_size=0.50, random_state=config.RANDOM_SEED, stratify=y_temp
    )

    print("Training XGBoost model...")
    clf = model.train_model(X_train, y_train, X_val, y_val)

    test_pd = model.predict_pd(clf, X_test)
    decisions = model.pd_to_decision(test_pd)
    metrics = model.evaluate(clf, X_test, y_test)
    print("Test metrics:", json.dumps(metrics, indent=2))

    print("Running fairness audit on the test set...")
    fairness_report = audit_fairness(pd.Series(decisions, index=fair_test.index), fair_test)
    for column, result in fairness_report.items():
        print(f"  {column}: demographic_parity_difference={result['demographic_parity_difference']:.4f}")

    print("Building SHAP explainer and sanity-checking one explanation...")
    explainer = build_explainer(clf)
    sample_factors = explain_row(explainer, X_test.iloc[[0]])
    print("Sample explanation:", sample_factors)

    bureau_defaults = X_train[config.BUREAU_DEFAULTED_FEATURES].median().to_dict()
    print("Bureau-field defaults (thin-file fallback):", bureau_defaults)

    print(f"Logging run to MLflow at {config.MLFLOW_TRACKING_URI} ...")
    run_info = log_training_run(
        model=clf,
        params={**model.XGB_PARAMS, "approval_pd_threshold": config.APPROVAL_PD_THRESHOLD},
        metrics=metrics,
        fairness_report=fairness_report,
        feature_columns=config.MODEL_FEATURE_COLUMNS,
        bureau_defaults=bureau_defaults,
    )
    print(f"Done. MLflow run_id={run_info['run_id']}, model_version={run_info['model_version']}")

    if config.S3_DATA_BUCKET:
        # Lets ml-train.yml's promote job (a separate ECS task invocation)
        # find this run without scraping ECS task logs.
        import boto3

        pointer = json.dumps(run_info)
        boto3.client("s3").put_object(
            Bucket=config.S3_DATA_BUCKET, Key="training-runs/latest.json", Body=pointer.encode()
        )
        print(f"Wrote pointer to s3://{config.S3_DATA_BUCKET}/training-runs/latest.json: {pointer}")


if __name__ == "__main__":
    main()
