"""
SQLModel base configuration and model exports.

All models should be imported here for Alembic to detect them.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import SQLModel, Field


def utc_now() -> datetime:
    """Get current UTC datetime."""
    return datetime.now(timezone.utc)


class BaseModel(SQLModel):
    """
    Base model with common fields.

    Provides:
    - UUID primary key
    - Created/updated timestamps
    """
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    created_at: datetime = Field(
        default_factory=utc_now,
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=utc_now,
        nullable=False,
        sa_column_kwargs={"onupdate": utc_now},
    )


# Import all models here for Alembic autogenerate
from app.models.task import Task

__all__ = ["BaseModel", "Task", "utc_now"]
