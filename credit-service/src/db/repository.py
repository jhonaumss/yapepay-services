import json
from typing import Optional
from uuid import UUID

from psycopg2.extras import Json, RealDictCursor

from .client import get_connection


def find_by_idempotency_key(user_id: str, idempotency_key: str) -> Optional[dict]:
    with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT * FROM credit_evaluation WHERE idempotency_key = %s AND user_id = %s",
            (idempotency_key, user_id),
        )
        return cur.fetchone()


def insert_evaluation(
    user_id: str,
    idempotency_key: str,
    application: dict,
    probability_of_default: float,
    score: int,
    risk_category: str,
    decision: str,
    user_segment: str,
    confidence_level: str,
    explanation_factors: list[dict],
    model_version: str,
) -> dict:
    with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO credit_evaluation (
                user_id, idempotency_key, application_json, probability_of_default,
                score, risk_category, decision, user_segment, confidence_level,
                explanation_factors_json, model_version
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                user_id,
                idempotency_key,
                Json(application),
                probability_of_default,
                score,
                risk_category,
                decision,
                user_segment,
                confidence_level,
                Json(explanation_factors),
                model_version,
            ),
        )
        return cur.fetchone()


def get_by_id(evaluation_id: str) -> Optional[dict]:
    with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM credit_evaluation WHERE evaluation_id = %s", (evaluation_id,))
        return cur.fetchone()


def list_by_user(user_id: str, cursor: Optional[str], page_size: int) -> tuple[list[dict], int]:
    with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        if cursor:
            cur.execute(
                """
                SELECT * FROM credit_evaluation
                WHERE user_id = %s AND created_at < %s
                ORDER BY created_at DESC LIMIT %s
                """,
                (user_id, cursor, page_size),
            )
        else:
            cur.execute(
                "SELECT * FROM credit_evaluation WHERE user_id = %s ORDER BY created_at DESC LIMIT %s",
                (user_id, page_size),
            )
        rows = cur.fetchall()
        cur.execute("SELECT COUNT(*) AS total FROM credit_evaluation WHERE user_id = %s", (user_id,))
        total = cur.fetchone()["total"]
        return rows, total


def insert_transaction_event(
    tx_id: str,
    user_id: str,
    counterparty_id: str,
    amount: float,
    currency: str,
    direction: str,
    transaction_type: str,
) -> None:
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO transaction_event
                (tx_id, user_id, counterparty_id, amount, currency, direction, transaction_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (tx_id, user_id) DO NOTHING
            """,
            (tx_id, user_id, counterparty_id, amount, currency, direction, transaction_type),
        )


def get_transactional_features(user_id: str) -> Optional[dict]:
    """Aggregate this user's last 30 days of activity on demand — avoids
    maintaining incremental counters that could drift from the raw event log.
    Returns None if the user has no transaction history at all (true cold start).
    """
    with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
                COUNT(*) FILTER (WHERE direction = 'OUT') AS tx_count_30d,
                COALESCE(AVG(amount) FILTER (WHERE direction = 'OUT'), 0) AS avg_amount_30d,
                COALESCE(STDDEV(amount) FILTER (WHERE direction = 'OUT'), 0) AS std_amount_30d,
                COALESCE(SUM(amount) FILTER (WHERE direction = 'OUT'), 0) AS total_amount_30d,
                COALESCE(SUM(amount) FILTER (WHERE direction = 'IN'), 0) AS total_inbound_30d,
                COUNT(DISTINCT counterparty_id) FILTER (WHERE direction = 'OUT') AS distinct_counterparties_30d,
                COUNT(*) FILTER (WHERE direction = 'OUT' AND transaction_type IN ('PAYMENT_QR', 'REVERSAL')) AS cash_out_count,
                COUNT(*) FILTER (WHERE direction = 'OUT' AND transaction_type = 'P2P_TRANSFER') AS transfer_count
            FROM transaction_event
            WHERE user_id = %s AND occurred_at > NOW() - INTERVAL '30 days'
            """,
            (user_id,),
        )
        agg = cur.fetchone()

        cur.execute(
            "SELECT MIN(occurred_at) AS first_seen FROM transaction_event WHERE user_id = %s",
            (user_id,),
        )
        first_seen = cur.fetchone()["first_seen"]

        if not agg or agg["tx_count_30d"] == 0 and first_seen is None:
            return None

        tx_count = agg["tx_count_30d"] or 0
        total_out = float(agg["total_amount_30d"] or 0)
        total_in = float(agg["total_inbound_30d"] or 0)

        return {
            "tx_count_30d": tx_count,
            "avg_amount_30d": float(agg["avg_amount_30d"] or 0),
            "std_amount_30d": float(agg["std_amount_30d"] or 0),
            "inbound_outbound_ratio": min(total_in / total_out, 10) if total_out > 0 else 0.0,
            "cash_out_ratio": (agg["cash_out_count"] or 0) / tx_count if tx_count else 0.0,
            "transfer_ratio": (agg["transfer_count"] or 0) / tx_count if tx_count else 0.0,
            "distinct_counterparties_30d": agg["distinct_counterparties_30d"] or 0,
            "first_seen": first_seen,
        }
