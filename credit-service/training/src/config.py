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

# Affordability gate, independent of the PD model: requested_amount/term_months
# are synthesized in dataset_builder.py after the GMSC label is already fixed,
# so debt_to_income_with_new_loan carries ~no learned signal about default risk
# and the model alone can't be trusted to reject an unaffordable request.
# 0.50 mirrors the common subprime-underwriting DTI ceiling (debt_ratio + new
# installment, both expressed as fractions of income).
MAX_DEBT_TO_INCOME_WITH_NEW_LOAN = 0.50

# A flat DTI ceiling alone systematically dings applicants who've simply had
# more time to accumulate life-stage debt (mortgage, established credit
# lines) — confirmed as the cause of the age_band fairness regression
# (40-60, GMSC's *safest* age band by true default rate, was rejected most
# often). Assets covering the requested amount outright waive the DTI cap,
# same as real-world collateral/net-worth underwriting.
MIN_ASSET_COVERAGE_RATIO = 1.0

# Age no longer feeds the PD model directly (see MODEL_FEATURE_COLUMNS below)
# — raw age as a predictive risk input is exactly what fair-lending
# frameworks (ECOA/Reg B and equivalents) restrict, and it was doing real
# work in the model even though employment_status/education_level were
# already excluded for the same reason. Used only here, to cap how long a
# repayment commitment gets offered (model.max_term_for_age) — standard
# personal-loan underwriting (shorter remaining income-stability horizon ->
# shorter max term), pricing a term limit rather than a risk score.
# TERM_TAPER_END_AGE matches CreditApplication.age's own ge/le=75 ceiling.
# A hard cutoff at a single age (tried first) rejected ~30% of the 60+ band
# outright and blew up the age_band fairness gap instead of shrinking it —
# this tapers smoothly instead, and is enforced as request-time validation
# (schemas.py), never folded into the ML decision or fairness audit.
MAX_TERM_MONTHS_CAP = 36
TERM_TAPER_START_AGE = 60
TERM_TAPER_END_AGE = 75
TERM_MONTHS_FLOOR = 12

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
    "monthly_income",
    "debt_ratio",
    "requested_to_income_ratio",
    "debt_to_income_with_new_loan",
    "had_previous_default",
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

# Present only for the affordability gate (model.compute_affordability) — kept
# out of MODEL_FEATURE_COLUMNS: requested_amount/estimated_assets_value have
# no real-world analog in GMSC for the model to learn from.
BUSINESS_RULE_ONLY_COLUMNS = ["estimated_assets_value", "requested_amount"]

TARGET_COLUMN = "serious_dlqin2yrs"
