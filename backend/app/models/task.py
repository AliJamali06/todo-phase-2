"""
Task SQLModel for database persistence.

Represents a todo item owned by a user.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import SQLModel, Field


def utc_now() -> datetime:
    """Get current UTC datetime."""
    return datetime.now(timezone.utc)


class Task(SQLModel, table=True):
    """
    Task model representing a todo item.

    Each task belongs to exactly one user (identified by user_id).
    All queries MUST filter by user_id to ensure isolation.
    """

    __tablename__ = "task"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    user_id: uuid.UUID = Field(
        nullable=False,
        index=True,
        description="Owner user ID from JWT",
    )
    title: str = Field(
        min_length=1,
        max_length=255,
        nullable=False,
        description="Task title (1-255 characters)",
    )
    completed: bool = Field(
        default=False,
        nullable=False,
        description="Completion status",
    )
    created_at: datetime = Field(
        default_factory=utc_now,
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=utc_now,
        nullable=False,
    )

    def toggle_complete(self) -> None:
        """Toggle the completion status."""
        self.completed = not self.completed
        self.updated_at = utc_now()

    def update_title(self, new_title: str) -> None:
        """Update the task title."""
        self.title = new_title
        self.updated_at = utc_now()
