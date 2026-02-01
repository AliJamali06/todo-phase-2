"""
Alembic migrations environment configuration.

Uses SYNCHRONOUS connection for migrations to avoid greenlet issues on Windows/Python 3.13.
"""
from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from sqlalchemy.engine import Connection

from alembic import context

# Import SQLModel metadata
from sqlmodel import SQLModel

# Import all models to register them with SQLModel metadata
from app.models import *  # noqa: F401, F403

# Import settings for database URL
from app.core.config import get_settings

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the SQLModel metadata for autogenerate support
target_metadata = SQLModel.metadata

# Get database URL from settings
settings = get_settings()

# Convert async URL to sync for migrations
db_url = settings.database_url_unpooled or settings.database_url
# Remove async driver prefix if present
db_url_sync = db_url.replace("postgresql+asyncpg://", "postgresql://")


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This configures the context with just a URL and not an Engine.
    Calls to context.execute() emit the given string to the script output.
    """
    context.configure(
        url=db_url_sync,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode using synchronous engine.

    This avoids greenlet dependency issues on Windows/Python 3.13.
    """
    connectable = create_engine(
        db_url_sync,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
