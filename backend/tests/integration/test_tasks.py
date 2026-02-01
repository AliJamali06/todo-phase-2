"""
Integration tests for task CRUD endpoints.

Tests create, read, update, delete, and toggle operations.
"""
import pytest
from httpx import AsyncClient


class TestCreateTask:
    """Test suite for task creation (POST /api/todos)."""

    @pytest.mark.asyncio
    async def test_create_task_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Create task with valid data returns 201 (T041)."""
        response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "Test task"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test task"
        assert data["completed"] is False
        assert "id" in data
        assert "user_id" in data
        assert "created_at" in data

    @pytest.mark.asyncio
    async def test_create_task_without_auth(
        self,
        client: AsyncClient,
    ):
        """Test: Create task without auth returns 401 (T044)."""
        response = await client.post(
            "/api/todos",
            json={"title": "Test task"},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_create_task_empty_title(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Create task with empty title returns 422."""
        response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": ""},
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_task_no_title(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Create task without title returns 422."""
        response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={},
        )

        assert response.status_code == 422


class TestListTasks:
    """Test suite for listing tasks (GET /api/todos)."""

    @pytest.mark.asyncio
    async def test_list_tasks_empty(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: List tasks returns empty list when no tasks (T042)."""
        response = await client.get("/api/todos", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    @pytest.mark.asyncio
    async def test_list_tasks_after_create(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: List tasks includes created tasks (T042)."""
        # Create a task
        await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "Task 1"},
        )

        # List tasks
        response = await client.get("/api/todos", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["title"] == "Task 1"

    @pytest.mark.asyncio
    async def test_list_tasks_without_auth(
        self,
        client: AsyncClient,
    ):
        """Test: List tasks without auth returns 401 (T044)."""
        response = await client.get("/api/todos")

        assert response.status_code == 401


class TestToggleTaskComplete:
    """Test suite for toggling task completion (PATCH /api/todos/{id}/complete)."""

    @pytest.mark.asyncio
    async def test_toggle_task_complete(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Toggle task marks it complete (T059)."""
        # Create a task
        create_response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "Toggle test"},
        )
        task_id = create_response.json()["id"]

        # Toggle completion
        response = await client.patch(
            f"/api/todos/{task_id}/complete",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is True

    @pytest.mark.asyncio
    async def test_toggle_task_complete_twice(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Toggle twice returns to incomplete (T060)."""
        # Create a task
        create_response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "Toggle twice test"},
        )
        task_id = create_response.json()["id"]

        # Toggle to complete
        await client.patch(f"/api/todos/{task_id}/complete", headers=auth_headers)

        # Toggle back to incomplete
        response = await client.patch(
            f"/api/todos/{task_id}/complete",
            headers=auth_headers,
        )

        assert response.status_code == 200
        assert response.json()["completed"] is False


class TestUpdateTask:
    """Test suite for updating tasks (PUT /api/todos/{id})."""

    @pytest.mark.asyncio
    async def test_update_task_title(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Update task title succeeds (T065)."""
        # Create a task
        create_response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "Original title"},
        )
        task_id = create_response.json()["id"]

        # Update title
        response = await client.put(
            f"/api/todos/{task_id}",
            headers=auth_headers,
            json={"title": "Updated title"},
        )

        assert response.status_code == 200
        assert response.json()["title"] == "Updated title"

    @pytest.mark.asyncio
    async def test_update_task_empty_title(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Update task with empty title returns 422 (T066)."""
        # Create a task
        create_response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "Original title"},
        )
        task_id = create_response.json()["id"]

        # Try to update with empty title
        response = await client.put(
            f"/api/todos/{task_id}",
            headers=auth_headers,
            json={"title": ""},
        )

        assert response.status_code == 422


class TestDeleteTask:
    """Test suite for deleting tasks (DELETE /api/todos/{id})."""

    @pytest.mark.asyncio
    async def test_delete_task_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Delete task returns 204 (T074)."""
        # Create a task
        create_response = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "To delete"},
        )
        task_id = create_response.json()["id"]

        # Delete the task
        response = await client.delete(
            f"/api/todos/{task_id}",
            headers=auth_headers,
        )

        assert response.status_code == 204

        # Verify it's gone
        get_response = await client.get(
            f"/api/todos/{task_id}",
            headers=auth_headers,
        )
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_task(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Delete nonexistent task returns 404 (T075)."""
        import uuid

        fake_id = str(uuid.uuid4())
        response = await client.delete(
            f"/api/todos/{fake_id}",
            headers=auth_headers,
        )

        assert response.status_code == 404


class TestFilterTasks:
    """Test suite for filtering tasks (GET /api/todos?completed=)."""

    @pytest.mark.asyncio
    async def test_filter_completed_tasks(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Filter by completed=true returns only completed tasks (T081)."""
        # Create tasks
        task1_resp = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "Task 1"},
        )
        task1_id = task1_resp.json()["id"]

        await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "Task 2"},
        )

        # Complete task 1
        await client.patch(f"/api/todos/{task1_id}/complete", headers=auth_headers)

        # Filter for completed
        response = await client.get(
            "/api/todos?completed=true",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "Task 1"
        assert data["items"][0]["completed"] is True

    @pytest.mark.asyncio
    async def test_filter_incomplete_tasks(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test: Filter by completed=false returns only incomplete tasks (T082)."""
        # Create tasks
        task1_resp = await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "Task 1"},
        )
        task1_id = task1_resp.json()["id"]

        await client.post(
            "/api/todos",
            headers=auth_headers,
            json={"title": "Task 2"},
        )

        # Complete task 1
        await client.patch(f"/api/todos/{task1_id}/complete", headers=auth_headers)

        # Filter for incomplete
        response = await client.get(
            "/api/todos?completed=false",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "Task 2"
        assert data["items"][0]["completed"] is False
