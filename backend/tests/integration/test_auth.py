"""
Integration tests for authentication endpoints.

Tests JWT validation, token expiration, and user profile endpoint.
"""
import pytest
from httpx import AsyncClient


class TestAuthentication:
    """Test suite for authentication functionality."""

    @pytest.mark.asyncio
    async def test_get_user_profile_with_valid_token(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: dict,
    ):
        """Test: Valid JWT returns user profile (T024)."""
        response = await client.get("/api/users/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_user["id"]
        assert data["email"] == test_user["email"]
        assert data["name"] == test_user["name"]

    @pytest.mark.asyncio
    async def test_get_user_profile_without_token(
        self,
        client: AsyncClient,
    ):
        """Test: Request without token returns 401 (T026)."""
        response = await client.get("/api/users/me")

        assert response.status_code == 401
        data = response.json()
        assert data["detail"]["error_code"] == "UNAUTHORIZED"

    @pytest.mark.asyncio
    async def test_get_user_profile_with_invalid_token(
        self,
        client: AsyncClient,
        invalid_auth_headers: dict,
    ):
        """Test: Invalid token returns 401 (T026)."""
        response = await client.get("/api/users/me", headers=invalid_auth_headers)

        assert response.status_code == 401
        data = response.json()
        assert data["detail"]["error_code"] == "INVALID_TOKEN"

    @pytest.mark.asyncio
    async def test_get_user_profile_with_expired_token(
        self,
        client: AsyncClient,
        expired_auth_headers: dict,
    ):
        """Test: Expired token returns 401 (T027)."""
        response = await client.get("/api/users/me", headers=expired_auth_headers)

        assert response.status_code == 401
        data = response.json()
        assert data["detail"]["error_code"] == "INVALID_TOKEN"

    @pytest.mark.asyncio
    async def test_user_profile_different_users(
        self,
        client: AsyncClient,
        auth_headers: dict,
        auth_headers_user_b: dict,
        test_user: dict,
        test_user_b: dict,
    ):
        """Test: Different tokens return different user profiles."""
        # User A
        response_a = await client.get("/api/users/me", headers=auth_headers)
        assert response_a.status_code == 200
        assert response_a.json()["email"] == test_user["email"]

        # User B
        response_b = await client.get("/api/users/me", headers=auth_headers_user_b)
        assert response_b.status_code == 200
        assert response_b.json()["email"] == test_user_b["email"]


class TestHealthEndpoints:
    """Test health and root endpoints (no auth required)."""

    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """Test: Health endpoint returns healthy status."""
        response = await client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    @pytest.mark.asyncio
    async def test_root_endpoint(self, client: AsyncClient):
        """Test: Root endpoint returns API info."""
        response = await client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "docs" in data
