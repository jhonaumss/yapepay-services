import os

from dotenv import load_dotenv

load_dotenv()

PORT = int(os.environ.get("PORT", "8000"))
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = int(os.environ.get("DB_PORT", "5433"))
DB_USER = os.environ.get("DB_USER", "yapepay")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "yapepay123")
DB_NAME = os.environ.get("DB_NAME", "yapepay_credit")
DB_SSL = os.environ.get("DB_SSL", "false") == "true"

SQS_QUEUE_URL = os.environ.get("SQS_QUEUE_URL")

S3_MODEL_BUCKET = os.environ.get("S3_MODEL_BUCKET")

# MLFLOW_TRACKING_URI itself and REGISTERED_MODEL_NAME come from
# training.src.config — single source of truth shared with the training
# pipeline (see src/ml/model_loader.py). MLFLOW_MODEL_ALIAS is serving-only:
# training always registers as "candidate", credit-service reads whichever
# alias this environment should serve (normally "production").
MLFLOW_MODEL_ALIAS = os.environ.get("MLFLOW_MODEL_ALIAS", "production")

COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID")
INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY")

RATE_LIMIT_MAX_REQUESTS = int(os.environ.get("RATE_LIMIT_MAX_REQUESTS", "10"))
RATE_LIMIT_WINDOW_SECONDS = int(os.environ.get("RATE_LIMIT_WINDOW_SECONDS", "60"))
