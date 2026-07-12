"""Read-side of the materialized feature store: turns transaction_event rows
into the transactional features the model expects, with an explicit
cold-start path for users with no history at all (perfil 2.2/6.3).
"""
from datetime import datetime, timezone
from typing import Optional

from training.src import config as train_cfg

from ..db import repository


def get_transactional_features(user_id: str) -> tuple[dict, bool]:
    """Returns (features, is_cold_start)."""
    row = repository.get_transactional_features(user_id)
    if row is None:
        return {
            "tx_count_30d": 0,
            "avg_amount_30d": 0.0,
            "std_amount_30d": 0.0,
            "inbound_outbound_ratio": 0.0,
            "cash_out_ratio": 0.0,
            "transfer_ratio": 0.0,
            "distinct_counterparties_30d": 0,
            "account_tenure_days": 0,
        }, True

    first_seen: Optional[datetime] = row.pop("first_seen")
    if first_seen is not None:
        if first_seen.tzinfo is None:
            first_seen = first_seen.replace(tzinfo=timezone.utc)
        tenure_days = (datetime.now(timezone.utc) - first_seen).days
    else:
        tenure_days = 0
    row["account_tenure_days"] = tenure_days
    return row, False


def resolve_user_segment(tx_count_30d: int, account_tenure_days: int) -> tuple[str, str]:
    """Mirrors training/src/dataset_builder.py's segmentation exactly —
    imported thresholds, not re-declared, so the two can't drift apart."""
    if account_tenure_days < train_cfg.NUEVO_MAX_TENURE_DAYS or tx_count_30d < train_cfg.NUEVO_MAX_TX_COUNT:
        segment = "NUEVO"
    elif (
        account_tenure_days >= train_cfg.ESTABLECIDO_MIN_TENURE_DAYS
        and tx_count_30d >= train_cfg.ESTABLECIDO_MIN_TX_COUNT
    ):
        segment = "ESTABLECIDO"
    else:
        segment = "EN_TRANSICION"
    confidence = {"NUEVO": "BAJA", "EN_TRANSICION": "MEDIA", "ESTABLECIDO": "ALTA"}[segment]
    return segment, confidence
