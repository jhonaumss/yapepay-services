"""Combine GMSC (real, financial/demographic) with PaySim-derived transactional
features (real behavior patterns, synthetically assigned to GMSC rows) plus a
handful of fields GMSC simply doesn't have (education, employment status,
loan request terms). The join itself is synthetic — documented in the
perfil's own stated limitations — but every individual signal it's built from
is either real (GMSC, PaySim aggregates) or a clearly-labeled simulation.
"""
import numpy as np
import pandas as pd

from . import config


def _age_band(age: pd.Series) -> pd.Series:
    return pd.cut(
        age,
        bins=[0, 25, 40, 60, 200],
        labels=["<25", "25-40", "40-60", "60+"],
        right=False,
    ).astype(str)


def _synthesize_employment(monthly_income: pd.Series, rng: np.random.Generator) -> pd.Series:
    has_income = monthly_income.fillna(0) > 0
    result = np.empty(len(monthly_income), dtype=object)
    n_with_income = int(has_income.sum())
    n_without_income = len(monthly_income) - n_with_income
    result[has_income.values] = rng.choice(
        ["DEPENDIENTE", "INDEPENDIENTE"], size=n_with_income, p=[0.7, 0.3]
    )
    result[~has_income.values] = rng.choice(
        ["DESEMPLEADO", "INDEPENDIENTE", "DEPENDIENTE"], size=n_without_income, p=[0.7, 0.2, 0.1]
    )
    return pd.Series(result, index=monthly_income.index)


def build_training_dataset() -> pd.DataFrame:
    from .data_loading import load_gmsc, load_paysim
    from .paysim_features import aggregate_paysim_by_customer

    rng = np.random.default_rng(config.RANDOM_SEED)

    gmsc = load_gmsc()
    n = len(gmsc)

    paysim_customers = aggregate_paysim_by_customer(load_paysim())
    sampled_idx = rng.integers(0, len(paysim_customers), size=n)
    tx_features = paysim_customers.iloc[sampled_idx].reset_index(drop=True)

    df = pd.concat([gmsc.reset_index(drop=True), tx_features], axis=1)

    # Account tenure is generated independently of the 30-day PaySim window
    # (which only ever captures *recent* activity) — skewed toward newer
    # accounts, as expected for a growing P2P wallet.
    df["account_tenure_days"] = rng.exponential(scale=150, size=n).clip(0, 900).round(0)

    # Self-reported "had previous default" checkbox: derived from GMSC's real
    # per-row delinquency counts (unlike requested_amount/term_months below,
    # this one *is* correlated with the label) with a self-report error rate,
    # since applicants won't always disclose this accurately.
    true_default_history = (
        (df["times_90d_late"] > 0) | (df["times_60_89d_late"] > 0) | (df["times_30_59d_late"] > 0)
    )
    self_report_noise = rng.random(n) < 0.10
    df["had_previous_default"] = (true_default_history.to_numpy() ^ self_report_noise).astype(int)

    df["age_band"] = _age_band(df["age"])
    df["employment_status"] = _synthesize_employment(df["monthly_income"], rng)
    # Purely random and independent of the target — fairness-only, never fed to the model.
    df["education_level"] = rng.choice(
        ["SECUNDARIA", "TECNICO", "UNIVERSITARIO", "POSGRADO"],
        size=n,
        p=[0.35, 0.30, 0.28, 0.07],
    )
    df["purpose"] = rng.choice(
        ["CONSUMO", "NEGOCIO", "EMERGENCIA", "EDUCACION", "OTRO"],
        size=n,
        p=[0.40, 0.20, 0.15, 0.15, 0.10],
    )
    df["term_months"] = rng.choice([3, 6, 12, 18, 24, 36], size=n, p=[0.10, 0.15, 0.25, 0.20, 0.20, 0.10])

    income_for_ratio = df["monthly_income"].fillna(df["monthly_income"].median()).clip(lower=1)
    df["requested_amount"] = (income_for_ratio * rng.uniform(1, 6, size=n)).round(-1)
    df["requested_to_income_ratio"] = (df["requested_amount"] / income_for_ratio).clip(upper=50)
    new_installment = df["requested_amount"] / df["term_months"]
    # fillna(median), not fillna(0): missing debt_ratio in GMSC correlates with
    # missing monthly_income, which is exactly the population _synthesize_employment
    # draws DESEMPLEADO from — treating unknown debt as "zero debt" systematically
    # flattered that group's affordability and blew up the fairness gate
    # (employment_status demographic_parity_difference 0.10 -> 0.35, see promote.py
    # rejection). The population median is a neutral stand-in, same pattern as
    # bureau_defaults elsewhere in this pipeline.
    debt_ratio_for_dti = df["debt_ratio"].fillna(df["debt_ratio"].median())
    df["debt_to_income_with_new_loan"] = (
        debt_ratio_for_dti + new_installment / income_for_ratio
    ).clip(upper=50)

    # estimated_assets_value: GMSC has no assets field, so this is synthetic —
    # but anchored to real_estate_loans (a real GMSC bureau signal, i.e. does
    # this person actually hold a mortgage/property loan) rather than pure
    # noise, so it stands in for the net worth that a flat DTI ratio ignores.
    # Feeds model.compute_affordability(), never the model itself (see
    # config.AFFORDABILITY_ONLY_COLUMNS).
    has_real_estate = df["real_estate_loans"].fillna(0) > 0
    df["estimated_assets_value"] = np.where(
        has_real_estate,
        income_for_ratio * rng.uniform(3, 12, size=n),
        income_for_ratio * rng.uniform(0, 2, size=n),
    ).round(-1)

    df["user_segment"] = np.select(
        [
            (df["account_tenure_days"] < config.NUEVO_MAX_TENURE_DAYS)
            | (df["tx_count_30d"] < config.NUEVO_MAX_TX_COUNT),
            (df["account_tenure_days"] >= config.ESTABLECIDO_MIN_TENURE_DAYS)
            & (df["tx_count_30d"] >= config.ESTABLECIDO_MIN_TX_COUNT),
        ],
        ["NUEVO", "ESTABLECIDO"],
        default="EN_TRANSICION",
    )
    confidence_map = {"NUEVO": "BAJA", "EN_TRANSICION": "MEDIA", "ESTABLECIDO": "ALTA"}
    df["confidence_level"] = df["user_segment"].map(confidence_map)

    return df


def split_columns(df: pd.DataFrame):
    """Return (X_model, fairness_df, rules_df, y) — keeping training features,
    fairness-audit-only attributes and eligibility-gate-only attributes from
    ever mixing, per perfil 5.4."""
    X = df[config.MODEL_FEATURE_COLUMNS].copy()
    fairness_df = df[config.FAIRNESS_ONLY_COLUMNS].copy()
    rules_df = df[config.BUSINESS_RULE_ONLY_COLUMNS].copy()
    y = df[config.TARGET_COLUMN].copy()
    return X, fairness_df, rules_df, y
