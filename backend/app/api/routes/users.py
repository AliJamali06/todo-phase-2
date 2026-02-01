"""
User profile endpoints.

All endpoints require JWT authentication.
"""
from fastapi import APIRouter

from app.api.deps import AuthenticatedUser

router = APIRouter()


@router.get("/me")
def get_current_user_profile(current_user: AuthenticatedUser):
    """
    Get the current authenticated user's profile.

    Returns user information extracted from JWT claims.
    """
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
    }
