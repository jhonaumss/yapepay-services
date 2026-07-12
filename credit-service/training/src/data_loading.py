"""Raw dataset loaders. See data/README.md for provenance of both files."""
from pathlib import Path

import numpy as np
import pandas as pd

from . import config


def _resolve_path(local_path: Path, s3_key: str) -> Path:
    """Return local_path unchanged for local dev; if S3_DATA_BUCKET is set
    (ml-train.yml's ECS task), download the file there first — the container
    never ships with data/raw baked in (see credit-service/.dockerignore)."""
    if not config.S3_DATA_BUCKET:
        return local_path
    if local_path.exists():
        return local_path

    import boto3

    local_path.parent.mkdir(parents=True, exist_ok=True)
    key = f"{config.S3_DATA_PREFIX}/{s3_key}"
    print(f"[data_loading] Downloading s3://{config.S3_DATA_BUCKET}/{key} -> {local_path}")
    boto3.client("s3").download_file(config.S3_DATA_BUCKET, key, str(local_path))
    return local_path

GMSC_RENAME_MAP = {
    "SeriousDlqin2yrs": config.TARGET_COLUMN,
    "age": "age",
    "MonthlyIncome": "monthly_income",
    "DebtRatio": "debt_ratio",
    "RevolvingUtilizationOfUnsecuredLines": "revolving_utilization",
    "NumberOfOpenCreditLinesAndLoans": "open_credit_lines",
    "NumberRealEstateLoansOrLines": "real_estate_loans",
    "NumberOfTimes90DaysLate": "times_90d_late",
    "NumberOfTime30-59DaysPastDueNotWorse": "times_30_59d_late",
    "NumberOfTime60-89DaysPastDueNotWorse": "times_60_89d_late",
    "NumberOfDependents": "number_of_dependents",
}


def load_gmsc() -> pd.DataFrame:
    """Load Give Me Some Credit training data with our internal column names."""
    path = _resolve_path(config.GMSC_TRAINING_CSV, "give-me-some-credit/cs-training.csv")
    df = pd.read_csv(path, index_col=0)
    df = df.rename(columns=GMSC_RENAME_MAP)
    # RevolvingUtilization and DebtRatio contain known outlier/garbage values
    # (e.g. ratios in the thousands); treat as missing rather than clip blindly.
    df["revolving_utilization"] = df["revolving_utilization"].replace([np.inf, -np.inf], np.nan)
    df.loc[df["revolving_utilization"] > 10, "revolving_utilization"] = np.nan
    df["debt_ratio"] = df["debt_ratio"].replace([np.inf, -np.inf], np.nan)
    df.loc[df["debt_ratio"] > 10, "debt_ratio"] = np.nan
    return df.reset_index(drop=True)


PAYSIM_DTYPES = {
    "step": "int32",
    "type": "category",
    "amount": "float32",
    "nameOrig": "string",
    "oldbalanceOrg": "float32",
    "newbalanceOrig": "float32",
    "nameDest": "string",
    "oldbalanceDest": "float32",
    "newbalanceDest": "float32",
    "isFraud": "int8",
    "isFlaggedFraud": "int8",
}


def load_paysim() -> pd.DataFrame:
    """Load PaySim simulated mobile-money transactions."""
    path = _resolve_path(config.PAYSIM_CSV, "paysim/paysim.csv")
    return pd.read_csv(path, dtype=PAYSIM_DTYPES)
