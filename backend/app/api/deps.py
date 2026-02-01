"""
FastAPI dependencies for authentication and database access.

Provides reusable dependencies for route handlers.
"""
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import verify_jwt_token, JWTPayload
from app.schemas.error import ErrorCode

# Security scheme for JWT Bearer token
security = HTTPBearer(auto_error=False)

# Type aliases for cleaner function signatures
DbSession = Annotated[Session, Depends(get_db)]
AuthCredentials = Annotated[HTTPAuthorizationCredentials | None, Depends(security)]


class CurrentUser:
    """
    Represents the authenticated user from JWT claims.

    Attributes:
        id: User UUID from JWT 'sub' claim
        email: User email from JWT claims
        name: User display name from JWT claims (optional)
    """

    def __init__(self, payload: JWTPayload):
        self.id: UUID = UUID(payload.sub)
        self.email: str = payload.email
        self.name: str | None = payload.name


def get_current_user(
    credentials: AuthCredentials,
) -> CurrentUser:
    """
    Dependency that validates JWT and returns the current user.

    Extracts user information from verified JWT claims.
    NEVER accepts user_id from URL parameters or request body.

    Args:
        credentials: HTTP Bearer credentials from Authorization header

    Returns:
        CurrentUser object with verified user information

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_code": ErrorCode.UNAUTHORIZED,
                "message": "Authentication required",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = verify_jwt_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_code": ErrorCode.INVALID_TOKEN,
                "message": "Invalid or expired token",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    return CurrentUser(payload)


# Type alias for current user dependency
AuthenticatedUser = Annotated[CurrentUser, Depends(get_current_user)]
