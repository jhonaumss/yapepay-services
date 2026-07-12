"""Fixed-window rate limit per user, in-memory. credit-service runs as a
single Fargate task in this project's infra (see services-stack.ts —
desiredCount starts at 0/1, no autoscaling, matching the dev environment's
cost-conscious "no ElastiCache" convention), so a per-process counter is
correct here — it would need to move to Redis/a shared store only if this
service is ever scaled to more than one replica.
"""
import time
from collections import defaultdict

from fastapi import Depends, HTTPException

from .. import config
from .auth import CurrentUser, get_current_user

_request_log: dict[str, list[float]] = defaultdict(list)


def enforce_rate_limit(user: CurrentUser = Depends(get_current_user)) -> None:
    now = time.monotonic()
    window_start = now - config.RATE_LIMIT_WINDOW_SECONDS
    timestamps = [t for t in _request_log[user.user_id] if t > window_start]
    timestamps.append(now)
    _request_log[user.user_id] = timestamps

    if len(timestamps) > config.RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(status_code=429, detail="Too many requests, please try again later")
