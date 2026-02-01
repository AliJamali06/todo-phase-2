"""
JWT verification service for validating Better Auth tokens.

Verifies JWT tokens issued by Better Auth frontend and extracts user claims.
"""
from datetime import datetime, timezone
from typing import Optional

from jose import jwt, JWTError
from pydantic import BaseModel

from app.core.config import get_settings

settings = get_settings()


class JWTPayload(BaseModel):
    """JWT token payload structure from Better Auth."""

    sub: str  # User ID
    email: str
    name: Optional[str] = None
    iat: Optional[int] = None  # Issued at
    exp: Optional[int] = None  # Expiration


def verify_jwt_token(token: str) -> Optional[JWTPayload]:
    """
    Verify and decode a JWT token from Better Auth.

    Args:
        token: The JWT token string from Authorization header

    Returns:
        JWTPayload if valid, None if invalid or expired
    """
    try:
        # Decode the token using the shared secret
        # Better Auth uses HS256 by default
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=["HS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "require_sub": True,
            },
        )

        # Better Auth JWT structure includes sub (user ID)
        # and may include email in different locations
        sub = payload.get("sub")
        if not sub:
            return None

        # Try to get email from different possible locations
        email = payload.get("email")
        if not email:
            # Better Auth might store user data in a nested structure
            user_data = payload.get("user", {})
            if isinstance(user_data, dict):
                email = user_data.get("email")

        # If still no email, use sub as placeholder
        if not email:
            email = f"{sub}@user.local"

        # Get name from payload or user data
        name = payload.get("name")
        if not name:
            user_data = payload.get("user", {})
            if isinstance(user_data, dict):
                name = user_data.get("name")

        return JWTPayload(
            sub=sub,
            email=email,
            name=name,
            iat=payload.get("iat"),
            exp=payload.get("exp"),
        )

    except JWTError as e:
        # Log the error for debugging
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
