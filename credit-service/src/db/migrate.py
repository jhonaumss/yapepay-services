"""Self-provisioning migration, mirroring the Node services' db/migrate.ts:
create the service's own database on the shared Aurora cluster (if missing),
then its tables. Run as the first step of the container's CMD.
"""
import psycopg2

from .. import config


def _ensure_database() -> None:
    admin = psycopg2.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        dbname="postgres",
        sslmode="require" if config.DB_SSL else "disable",
    )
    admin.autocommit = True
    try:
        with admin.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (config.DB_NAME,))
            if cur.fetchone() is None:
                cur.execute(f'CREATE DATABASE "{config.DB_NAME}"')
                print(f"Created database: {config.DB_NAME}")
    finally:
        admin.close()


def migrate() -> None:
    _ensure_database()
    conn = psycopg2.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        dbname=config.DB_NAME,
        sslmode="require" if config.DB_SSL else "disable",
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS credit_evaluation (
                    evaluation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL,
                    idempotency_key UUID NOT NULL UNIQUE,
                    application_json JSONB NOT NULL,
                    probability_of_default DOUBLE PRECISION NOT NULL,
                    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 1000),
                    risk_category VARCHAR(10) NOT NULL CHECK (risk_category IN ('BAJO','MEDIO','ALTO')),
                    decision VARCHAR(10) NOT NULL CHECK (decision IN ('APROBADO','RECHAZADO')),
                    user_segment VARCHAR(20) NOT NULL,
                    confidence_level VARCHAR(10) NOT NULL,
                    explanation_factors_json JSONB NOT NULL,
                    model_version VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );
                """
            )
            cur.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_credit_eval_user
                ON credit_evaluation(user_id, created_at DESC);
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS transaction_event (
                    tx_id UUID NOT NULL,
                    user_id UUID NOT NULL,
                    counterparty_id UUID NOT NULL,
                    amount NUMERIC(15,2) NOT NULL,
                    currency CHAR(3) NOT NULL,
                    direction VARCHAR(3) NOT NULL CHECK (direction IN ('IN','OUT')),
                    transaction_type VARCHAR(20) NOT NULL,
                    occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    PRIMARY KEY (tx_id, user_id)
                );
                """
            )
            cur.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_tx_event_user
                ON transaction_event(user_id, occurred_at DESC);
                """
            )
        conn.commit()
        print("Migration completed successfully - credit-service")
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
