# credit-service training pipeline

Run locally with `python -m src.train` from this directory (see `data/README.md` for
where to put the two source CSVs). Uses a local sqlite MLflow store by default —
override `MLFLOW_TRACKING_URI` to point at the real server.

## How this runs in CI (ml-train.yml)

There is no separate training Docker image. `credit-service`'s own image (built from
`credit-service/Dockerfile`) doubles as the training image — same dependencies
(`credit-service/requirements.txt` includes everything `training/requirements.txt` needs
plus `fairlearn`), same `training/src` code. `ml-train.yml` runs it as a one-off ECS
Fargate **task** (not the long-running service) inside the VPC, with:

- `command` overridden to `python -m training.src.train`
- `MLFLOW_TRACKING_URI` set to the real internal address (`http://mlflow.yapepay.local:5000`)
  — this only works from inside the VPC, which is exactly why this runs as an ECS task
  instead of directly on the GitHub-hosted runner.
- `S3_DATA_BUCKET` set, so `data_loading.py` pulls the raw CSVs from S3 instead of
  the local `data/raw/` paths (which are gitignored and don't exist in the image).

**One-time setup**: upload the two raw CSVs to the ML artifacts bucket once:

```
aws s3 cp data/raw/give-me-some-credit/cs-training.csv s3://<bucket>/raw-data/give-me-some-credit/cs-training.csv
aws s3 cp data/raw/paysim/paysim.csv s3://<bucket>/raw-data/paysim/paysim.csv
```
