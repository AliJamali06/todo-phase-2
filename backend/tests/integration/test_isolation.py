"""
Integration tests for user isolation.

Verifies that users can only access their own tasks.
"""
import pytest
from httpx import AsyncClient


class TestUserIsolation:
    """Test suite for user isolation (T043, T067, T076)."""

    @pytest.mark.asyncio
    async def test_user_cannot_see_other_user_tasks(
        self,
        client: AsyncClient,
        auth_headers: dict,
        auth_headers_user_b: dict,
    ):
        """Test: User A cannot see User B's tasks (T043)."""
        # User A creates a task
        await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "User A's task"},
        )

        # User B lists tasks
        response = await client.get("/api/todos", headers=auth_headers_user_b)

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["items"] == []

    @pytest.mark.asyncio
    async def test_user_cannot_get_other_user_task(
        self,
        client: AsyncClient,
        auth_headers: dict,
        auth_headers_user_b: dict,
    ):
        """Test: User B cannot GET User A's task by ID (T043)."""
        # User A creates a task
        create_response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "User A's task"},
        )
        task_id = create_response.json()["id"]

        # User B tries to get the task
        response = await client.get(
            f"/api/todos/{task_id}",
            headers=auth_headers_user_b,
        )

        # Should return 404 (not 403) to prevent enumeration
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_user_cannot_update_other_user_task(
        self,
        client: AsyncClient,
        auth_headers: dict,
        auth_headers_user_b: dict,
    ):
        """Test: User B cannot update User A's task (T067)."""
        # User A creates a task
        create_response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "User A's task"},
        )
        task_id = create_response.json()["id"]

        # User B tries to update the task
        response = await client.put(
            f"/api/todos/{task_id}",
            headers=auth_headers_user_b,
            json={"title": "Hacked!"},
        )

        # Should return 404
        assert response.status_code == 404

        # Verify the original task is unchanged
        verify_response = await client.get(
            f"/api/todos/{task_id}",
            headers=auth_headers,
        )
        assert verify_response.json()["title"] == "User A's task"

    @pytest.mark.asyncio
    async def test_user_cannot_delete_other_user_task(
        self,
        client: AsyncClient,
        auth_headers: dict,
        auth_headers_user_b: dict,
    ):
        """Test: User B cannot delete User A's task (T076)."""
        # User A creates a task
        create_response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "User A's task"},
        )
        task_id = create_response.json()["id"]

        # User B tries to delete the task
        response = await client.delete(
            f"/api/todos/{task_id}",
            headers=auth_headers_user_b,
        )

        # Should return 404
        assert response.status_code == 404

        # Verify the task still exists
        verify_response = await client.get(
            f"/api/todos/{task_id}",
            headers=auth_headers,
        )
        assert verify_response.status_code == 200

    @pytest.mark.asyncio
    async def test_user_cannot_toggle_other_user_task(
        self,
        client: AsyncClient,
        auth_headers: dict,
        auth_headers_user_b: dict,
    ):
        """Test: User B cannot toggle User A's task completion."""
        # User A creates a task
        create_response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "User A's task"},
        )
        task_id = create_response.json()["id"]

        # User B tries to toggle the task
        response = await client.patch(
            f"/api/todos/{task_id}/complete",
            headers=auth_headers_user_b,
        )

        # Should return 404
        assert response.status_code == 404

        # Verify the task is still incomplete
        verify_response = await client.get(
            f"/api/todos/{task_id}",
            headers=auth_headers,
        )
        assert verify_response.json()["completed"] is False

    @pytest.mark.asyncio
    async def test_separate_users_have_separate_task_lists(
        self,
        client: AsyncClient,
        auth_headers: dict,
        auth_headers_user_b: dict,
    ):
        """Test: Each user sees only their own tasks."""
        # User A creates tasks
        await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "User A Task 1"},
        )
        await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "User A Task 2"},
        )

        # User B creates a task
        await client.post(
            "/api/todos",
            headers=auth_headers_user_b,
            json={"title": "User B Task 1"},
        )

        # User A should see 2 tasks
        response_a = await client.get("/api/todos", headers=auth_headers)
        assert response_a.json()["total"] == 2

        # User B should see 1 task
        response_b = await client.get("/api/todos", headers=auth_headers_user_b)
        assert response_b.json()["total"] == 1
        assert response_b.json()["items"][0]["title"] == "User B Task 1"
