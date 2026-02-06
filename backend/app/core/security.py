"""
JWT verification service for validating Better Auth tokens.

Verifies JWT tokens issued by Better Auth frontend using EdDSA (Ed25519) algorithm.
Fetches and caches JWKS from the frontend for token verification.
"""
import time
from datetime import datetime, timezone
from typing import Optional

import httpx
import jwt
from jwt import PyJWKClient
from pydantic import BaseModel

from app.core.config import get_settings

settings = get_settings()

# Cache for JWKS client
_jwks_client: Optional[PyJWKClient] = None
_jwks_client_created_at: float = 0
JWKS_CACHE_TTL = 3600  # 1 hour


class JWTPayload(BaseModel):
    """JWT token payload structure from Better Auth."""

    sub: str  # User ID
    email: str
    name: Optional[str] = None
    iat: Optional[int] = None  # Issued at
    exp: Optional[int] = None  # Expiration


def get_jwks_client() -> PyJWKClient:
    """
    Get or create a cached JWKS client for the frontend.

    Returns:
        PyJWKClient instance for fetching signing keys
    """
    global _jwks_client, _jwks_client_created_at

    current_time = time.time()

    # Refresh cache if expired or not initialized
    if _jwks_client is None or (current_time - _jwks_client_created_at) > JWKS_CACHE_TTL:
        jwks_url = f"{settings.frontend_url}/api/auth/jwks"
        _jwks_client = PyJWKClient(jwks_url)
        _jwks_client_created_at = current_time

    return _jwks_client


def verify_jwt_token(token: str) -> Optional[JWTPayload]:
    """
    Verify and decode a JWT token from Better Auth.

    Args:
        token: The JWT token string from Authorization header

    Returns:
        JWTPayload if valid, None if invalid or expired
    """
    try:
        # Get the signing key from JWKS
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA"],
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
