"""
Pydantic schemas for task API requests and responses.

Based on api.yaml contract definitions.
"""
import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field, field_validator


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Task title (1-255 characters, cannot be empty)",
        examples=["Buy groceries"],
    )

    @field_validator("title")
    @classmethod
    def title_not_whitespace(cls, v: str) -> str:
        """Ensure title is not just whitespace."""
        stripped = v.strip()
        if not stripped:
            raise ValueError("Title cannot be empty or whitespace only")
        return stripped


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="Updated title",
    )
    completed: Optional[bool] = Field(
        default=None,
        description="Completion status",
    )

    @field_validator("title")
    @classmethod
    def title_not_whitespace(cls, v: Optional[str]) -> Optional[str]:
        """Ensure title is not just whitespace if provided."""
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError("Title cannot be empty or whitespace only")
            return stripped
        return v


class TaskRead(BaseModel):
    """Schema for task API response."""

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    """Schema for paginated task list response."""

    items: List[TaskRead]
    total: int = Field(description="Total number of tasks matching filter")
    limit: int = Field(default=100)
    offset: int = Field(default=0)
