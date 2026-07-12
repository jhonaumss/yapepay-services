"""Set dummy env vars before any `src.*` module is imported — src/config.py
reads them at import time, and src/middleware/auth.py builds a PyJWKClient
(no network call yet, just URL construction) using COGNITO_USER_POOL_ID."""
import os

os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_PORT", "5433")
os.environ.setdefault("DB_NAME", "yapepay_credit_test")
os.environ.setdefault("REDIS_HOST", "localhost")
os.environ.setdefault("REDIS_PORT", "6379")
os.environ.setdefault("SQS_QUEUE_URL", "")
os.environ.setdefault("S3_MODEL_BUCKET", "dummy-bucket")
os.environ.setdefault("MLFLOW_TRACKING_URI", "sqlite:///:memory:")
os.environ.setdefault("MLFLOW_MODEL_ALIAS", "candidate")
os.environ.setdefault("COGNITO_USER_POOL_ID", "us-east-1_dummy")
os.environ.setdefault("INTERNAL_API_KEY", "dummy")
