"""Aggregate raw PaySim transactions into per-customer behavioral features.

PaySim simulates ~30 days (steps are hours, 1..744) of mobile-money activity.
nameOrig is always the paying customer; nameDest is either another customer
("C...") or a merchant ("M..."). We treat outgoing activity (grouped by
nameOrig) as the user's own transactional footprint, matching the semantics
of transaction-service's senderId, and separately fold in what each customer
received (grouped by nameDest where the recipient is itself a customer).
"""
import numpy as np
import pandas as pd

OUTGOING_TYPE_COLUMNS = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]


def aggregate_paysim_by_customer(paysim: pd.DataFrame) -> pd.DataFrame:
    outgoing = (
        paysim.groupby("nameOrig")
        .agg(
            tx_count_30d=("amount", "count"),
            total_amount_30d=("amount", "sum"),
            avg_amount_30d=("amount", "mean"),
            std_amount_30d=("amount", "std"),
            max_amount_30d=("amount", "max"),
            first_step=("step", "min"),
            last_step=("step", "max"),
            distinct_counterparties_30d=("nameDest", "nunique"),
        )
        .rename_axis("customer_id")
    )
    outgoing["std_amount_30d"] = outgoing["std_amount_30d"].fillna(0.0)

    type_counts = (
        paysim.groupby(["nameOrig", "type"], observed=True)
        .size()
        .unstack(fill_value=0)
        .rename_axis("customer_id")
    )
    for col in OUTGOING_TYPE_COLUMNS:
        if col not in type_counts.columns:
            type_counts[col] = 0
    tx_total = type_counts.sum(axis=1).replace(0, np.nan)
    outgoing["cash_out_ratio"] = (type_counts["CASH_OUT"] + type_counts["DEBIT"]) / tx_total
    outgoing["transfer_ratio"] = type_counts["TRANSFER"] / tx_total
    outgoing["payment_ratio"] = type_counts["PAYMENT"] / tx_total
    outgoing["cash_in_ratio"] = type_counts["CASH_IN"] / tx_total
    outgoing[["cash_out_ratio", "transfer_ratio", "payment_ratio", "cash_in_ratio"]] = outgoing[
        ["cash_out_ratio", "transfer_ratio", "payment_ratio", "cash_in_ratio"]
    ].fillna(0.0)

    is_customer_dest = paysim["nameDest"].str.startswith("C")
    incoming = (
        paysim[is_customer_dest]
        .groupby("nameDest")
        .agg(inbound_count_30d=("amount", "count"), inbound_amount_30d=("amount", "sum"))
        .rename_axis("customer_id")
    )

    customers = outgoing.join(incoming, how="left")
    customers[["inbound_count_30d", "inbound_amount_30d"]] = customers[
        ["inbound_count_30d", "inbound_amount_30d"]
    ].fillna(0.0)

    customers["inbound_outbound_ratio"] = customers["inbound_amount_30d"] / customers[
        "total_amount_30d"
    ].replace(0, np.nan)
    customers["inbound_outbound_ratio"] = customers["inbound_outbound_ratio"].fillna(0.0).clip(upper=10)

    return customers[
        [
            "tx_count_30d",
            "avg_amount_30d",
            "std_amount_30d",
            "max_amount_30d",
            "distinct_counterparties_30d",
            "inbound_outbound_ratio",
            "cash_out_ratio",
            "transfer_ratio",
            "first_step",
            "last_step",
        ]
    ].reset_index(drop=True)
