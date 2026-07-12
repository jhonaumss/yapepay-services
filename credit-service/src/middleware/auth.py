"""Cognito JWT verification — same scheme as the Node services'
auth.middleware.ts (Cognito access tokens have no `aud` claim; issuer-only
validation), ported to a FastAPI dependency.
"""
from dataclasses import dataclass

import jwt
from fastapi import Depends, Header, HTTPException
from jwt import PyJWKClient

from .. import config

_ISSUER = f"https://cognito-idp.{config.AWS_REGION}.amazonaws.com/{config.COGNITO_USER_POOL_ID}"
_jwks_client = PyJWKClient(f"{_ISSUER}/.well-known/jwks.json", cache_keys=True)


@dataclass
class CurrentUser:
    user_id: str
    roles: list[str]


def get_current_user(authorization: str = Header(default="")) -> CurrentUser:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.removeprefix("Bearer ")

    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=_ISSUER,
            options={"verify_aud": False},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {exc}") from exc

    return CurrentUser(user_id=payload["sub"], roles=payload.get("cognito:groups", []))


def require_role(*roles: str):
    def _dependency(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if not any(r in user.roles for r in roles):
            raise HTTPException(status_code=403, detail="Forbidden: insufficient permissions")
        return user

    return _dependency


def require_internal_key(x_internal_key: str = Header(default="")) -> None:
    if not config.INTERNAL_API_KEY or x_internal_key != config.INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
