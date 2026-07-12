# Build context: repo root (docker build -f credit-service/Dockerfile .)
# training/src is copied in too — the service imports its feature-schema,
# business-rule thresholds and SHAP helpers directly (see src/ml, src/features)
# so serving can never silently drift from what the model was trained on.
# training/data/ (raw datasets, local mlflow.db) is excluded via .dockerignore.

FROM python:3.11-slim AS runtime
WORKDIR /app

# libgomp1: required by xgboost's OpenMP runtime on Debian slim images.
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

COPY credit-service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY credit-service/src ./src
COPY credit-service/training/__init__.py ./training/__init__.py
COPY credit-service/training/src ./training/src

# training/data/ isn't copied in (see note above) — data_loading.py creates it
# at runtime when downloading raw CSVs from S3, so appuser needs write access.
RUN useradd --system --create-home appuser \
    && mkdir -p training/data \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"

CMD ["/bin/sh", "-c", "python -m src.db.migrate && exec uvicorn src.main:app --host 0.0.0.0 --port 8000"]
