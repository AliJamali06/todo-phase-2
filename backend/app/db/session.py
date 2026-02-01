"""
Database session configuration for Neon PostgreSQL.

Uses synchronous SQLAlchemy to avoid greenlet dependency issues on Windows.
"""
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool

from app.core.config import get_settings

settings = get_settings()

# Convert async URL to sync URL for psycopg2
# postgresql+asyncpg:// -> postgresql://
sync_database_url = settings.database_url.replace("+asyncpg", "")

# Create sync engine with NullPool for serverless (Neon)
engine = create_engine(
    sync_database_url,
    echo=settings.debug,
    poolclass=NullPool,  # Use NullPool for serverless - creates fresh connection per request
)

# Create session factory
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency that yields database sessions.

    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            pass
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """Initialize database connection (for startup checks)."""
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            conn.commit()
        print("Database connection successful")
    except Exception as e:
        print(f"WARNING: Database connection failed: {e}")
        print("Backend will start but database operations will fail until connection is fixed")


def close_db() -> None:
    """Close database connections (for shutdown)."""
    engine.dispose()
