from contextlib import contextmanager

from psycopg2.pool import ThreadedConnectionPool

from .. import config

_pool: ThreadedConnectionPool | None = None


def _get_pool() -> ThreadedConnectionPool:
    # Built lazily (not at import time) so the module can be imported — and
    # /health can respond — even before the DB is reachable, matching the
    # Node services' lazy `pg.Pool` behavior.
    global _pool
    if _pool is None:
        _pool = ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            host=config.DB_HOST,
            port=config.DB_PORT,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            dbname=config.DB_NAME,
            sslmode="require" if config.DB_SSL else "disable",
        )
    return _pool


@contextmanager
def get_connection():
    pool = _get_pool()
    conn = pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)
