"""
Test fixtures and configuration for pytest.

Provides mock JWT tokens, test users, and database session fixtures.
"""
import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import AsyncGenerator, Dict

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.session import get_db
from app.core.config import get_settings

settings = get_settings()

# Test database URL (in-memory SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session factory
test_session_maker = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Test user data
class TestUser:
    """Test user factory."""

    @staticmethod
    def create(
        user_id: str | None = None,
        email: str = "test@example.com",
        name: str = "Test User",
    ) -> Dict[str, str]:
        return {
            "id": user_id or str(uuid.uuid4()),
            "email": email,
            "name": name,
        }


def create_test_jwt(
    user_id: str,
    email: str,
    name: str | None = None,
    expires_delta: timedelta = timedelta(minutes=15),
    expired: bool = False,
) -> str:
    """
    Create a test JWT token.

    Args:
        user_id: User ID for 'sub' claim
        email: User email
        name: User display name
        expires_delta: Token validity duration
        expired: If True, create an already-expired token

    Returns:
        Encoded JWT token string
    """
    now = datetime.now(timezone.utc)

    if expired:
        exp = now - timedelta(hours=1)
    else:
        exp = now + expires_delta

    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }

    if name:
        payload["name"] = name

    return jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")


@pytest.fixture
def test_user() -> Dict[str, str]:
    """Fixture providing a test user."""
    return TestUser.create()


@pytest.fixture
def test_user_b() -> Dict[str, str]:
    """Fixture providing a second test user for isolation tests."""
    return TestUser.create(
        email="userb@example.com",
        name="User B",
    )


@pytest.fixture
def auth_headers(test_user: Dict[str, str]) -> Dict[str, str]:
    """Fixture providing authorization headers with valid JWT."""
    token = create_test_jwt(
        user_id=test_user["id"],
        email=test_user["email"],
        name=test_user["name"],
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_user_b(test_user_b: Dict[str, str]) -> Dict[str, str]:
    """Fixture providing authorization headers for second user."""
    token = create_test_jwt(
        user_id=test_user_b["id"],
        email=test_user_b["email"],
        name=test_user_b["name"],
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def expired_auth_headers(test_user: Dict[str, str]) -> Dict[str, str]:
    """Fixture providing authorization headers with expired JWT."""
    token = create_test_jwt(
        user_id=test_user["id"],
        email=test_user["email"],
        expired=True,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def invalid_auth_headers() -> Dict[str, str]:
    """Fixture providing authorization headers with invalid JWT."""
    return {"Authorization": "Bearer invalid.token.here"}


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    """Override database dependency for tests."""
    async with test_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Fixture providing a test database session."""
    # Import models to register them
    from sqlmodel import SQLModel
    from app.models import *  # noqa: F401, F403

    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with test_session_maker() as session:
        yield session

    # Drop tables after test
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Fixture providing an async HTTP client for testing."""
    # Override the database dependency
    app.dependency_overrides[get_db] = lambda: db_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
