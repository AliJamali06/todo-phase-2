"""
JWT verification service for validating tokens.

Verifies JWT tokens using HS256 algorithm with shared secret.
"""
from datetime import datetime, timezone
from typing import Optional

import jwt
from pydantic import BaseModel

from app.core.config import get_settings

settings = get_settings()


class JWTPayload(BaseModel):
    """JWT token payload structure."""

    sub: str  # User ID
    email: str
    name: Optional[str] = None
    iat: Optional[int] = None  # Issued at
    exp: Optional[int] = None  # Expiration


def verify_jwt_token(token: str) -> Optional[JWTPayload]:
    """
    Verify and decode a JWT token.

    Args:
        token: The JWT token string from Authorization header

    Returns:
        JWTPayload if valid, None if invalid or expired
    """
    try:
        # Decode and verify the token using the shared secret
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=["HS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "require": ["sub", "exp"],
            },
        )

        # Extract claims from payload
        sub = payload.get("sub")
        if not sub:
            return None

        # Get email from payload
        email = payload.get("email")
        if not email:
            # Fallback if email not in token
            email = f"{sub}@user.local"

        # Get name from payload
        name = payload.get("name")

        return JWTPayload(
            sub=sub,
            email=email,
            name=name,
            iat=payload.get("iat"),
            exp=payload.get("exp"),
        )

    except jwt.ExpiredSignatureError:
        if settings.debug:
            print("JWT verification failed: Token expired")
        return None
    except jwt.InvalidTokenError as e:
        if settings.debug:
            print(f"JWT verification failed: {e}")
        return None
    except Exception as e:
        if settings.debug:
            print(f"Unexpected error during JWT verification: {e}")
        return None


def is_token_expired(payload: JWTPayload) -> bool:
    """
    Check if a token has expired.

    Args:
        payload: The decoded JWT payload

    Returns:
        True if expired, False otherwise
    """
    if payload.exp is None:
        return True

    expiration = datetime.fromtimestamp(payload.exp, tz=timezone.utc)
    return datetime.now(timezone.utc) > expiration
