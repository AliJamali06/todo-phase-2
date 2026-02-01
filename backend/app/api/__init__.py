"""
API router configuration.

Aggregates all route modules into a single router.
"""
from fastapi import APIRouter

from app.api.routes import tasks, users

api_router = APIRouter()

# Include route modules
api_router.include_router(tasks.router, prefix="/todos", tags=["tasks"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
