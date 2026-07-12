"""Central configuration for the credit-risk training pipeline.

Nothing here talks to AWS: paths default to local files so the pipeline runs
standalone during development.
"""
import os
from pathlib import Path

TRAINING_DIR = Path(__file__).resolve().parent.parent
RAW_DATA_DIR = TRAINING_DIR / "data" / "raw"
PROCESSED_DATA_DIR = TRAINING_DIR / "data" / "processed"

GMSC_TRAINING_CSV = RAW_DATA_DIR / "give-me-some-credit" / "cs-training.csv"
PAYSIM_CSV = RAW_DATA_DIR / "paysim" / "paysim.csv"

# Raw CSVs aren't committed to git (too large) and don't exist inside the
# training container run by ml-train.yml. When set, data_loading.py downloads
# them from S3 (uploaded once, manually, alongside the model artifacts bucket
# — see data/README.md) instead of reading the local dev paths above.
S3_DATA_BUCKET = os.environ.get("S3_DATA_BUCKET")
S3_DATA_PREFIX = os.environ.get("S3_DATA_PREFIX", "raw-data")

RANDOM_SEED = 42

# --- Cold-start segmentation thresholds (perfil 2.2 / 6.3) ---------------
NUEVO_MAX_TENURE_DAYS = 30
NUEVO_MAX_TX_COUNT = 5
ESTABLECIDO_MIN_TENURE_DAYS = 90
ESTABLECIDO_MIN_TX_COUNT = 20

# --- Business-rule thresholds on the model's predicted PD ----------------
# Configurable, not hardcoded in the model itself: risk category cutoffs and
# the approval decision boundary (perfil 1.3 / 6.2 RF2).
RISK_BAJO_MAX_PD = 0.10
RISK_MEDIO_MAX_PD = 0.30
APPROVAL_PD_THRESHOLD = 0.25

# --- MLflow --------------------------------------------------------------
# No dedicated MLflow tracking *server* — this project's infra keeps things to
# a single shared RDS instance (each service gets its own logical database,
# see database-stack.ts) rather than standing up extra always-on compute.
# MLflow's client library talks to Postgres directly as its backend store;
# S3 holds the actual model/artifact files. Locally (no MLFLOW_DB_HOST), it
# falls back to a local sqlite file so the pipeline runs standalone.
MLFLOW_EXPERIMENT_NAME = "credit-risk-scoring"
DEFAULT_MLFLOW_TRACKING_URI = f"sqlite:///{(TRAINING_DIR / 'mlflow.db').as_posix()}"


def _resolve_mlflow_tracking_uri() -> str:
    explicit = os.environ.get("MLFLOW_TRACKING_URI")
    if explicit:
        return explicit
    mlflow_db_host = os.environ.get("MLFLOW_DB_HOST")
    if not mlflow_db_host:
        return DEFAULT_MLFLOW_TRACKING_URI
    user = os.environ["MLFLOW_DB_USER"]
    password = os.environ["MLFLOW_DB_PASSWORD"]
    port = os.environ.get("MLFLOW_DB_PORT", "5432")
    dbname = os.environ.get("MLFLOW_DB_NAME", "yapepay_mlflow")
    return f"postgresql://{user}:{password}@{mlflow_db_host}:{port}/{dbname}"


MLFLOW_TRACKING_URI = _resolve_mlflow_tracking_uri()
MLFLOW_ARTIFACT_LOCATION = os.environ.get(
    "MLFLOW_ARTIFACT_LOCATION", (TRAINING_DIR / "mlruns_artifacts").as_uri()
)
REGISTERED_MODEL_NAME = "credit-risk-model"

# Model features actually fed to the classifier, grouped by where credit-service
# gets the value at inference time. Order matters — it must match exactly
# between training and inference (see credit-service/src/ml/inference.py).
FORM_DERIVED_FEATURES = [
    "age",
    "monthly_income",
    "debt_ratio",
    "requested_to_income_ratio",
    "debt_to_income_with_new_loan",
]
TRANSACTIONAL_FEATURES = [
    "tx_count_30d",
    "avg_amount_30d",
    "std_amount_30d",
    "inbound_outbound_ratio",
    "cash_out_ratio",
    "transfer_ratio",
    "distinct_counterparties_30d",
    "account_tenure_days",
]
# GMSC credit-bureau-style fields our own application form never collects
# (perfil 4.2: no real bureau integration). credit-service fills these from
# BUREAU_DEFAULTS_FILENAME (training-set medians, exported below) instead of
# leaving them NaN for every request — the standard "thin-file" fallback.
BUREAU_DEFAULTED_FEATURES = [
    "revolving_utilization",
    "open_credit_lines",
    "real_estate_loans",
    "times_90d_late",
    "times_30_59d_late",
    "times_60_89d_late",
    "number_of_dependents",
]
MODEL_FEATURE_COLUMNS = FORM_DERIVED_FEATURES + TRANSACTIONAL_FEATURES + BUREAU_DEFAULTED_FEATURES
BUREAU_DEFAULTS_FILENAME = "bureau_defaults.json"

# Present only for the fairness audit (perfil 5.4: kept separate from training features).
FAIRNESS_ONLY_COLUMNS = ["age_band", "employment_status", "education_level"]

TARGET_COLUMN = "serious_dlqin2yrs"
