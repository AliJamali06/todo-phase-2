"""
Task CRUD endpoints.

All endpoints require JWT authentication and filter tasks by current user.
User isolation is enforced: users can only access their own tasks.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select, func

from app.api.deps import AuthenticatedUser, DbSession
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskRead, TaskListResponse
from app.schemas.error import ErrorCode

router = APIRouter()


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    current_user: AuthenticatedUser,
    db: DbSession,
):
    """
    Create a new task for the authenticated user.

    The task is automatically assigned to the current user from JWT.
    """
    task = Task(
        user_id=current_user.id,
        title=task_in.title,
        completed=False,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=TaskListResponse)
def list_tasks(
    current_user: AuthenticatedUser,
    db: DbSession,
    completed: Optional[bool] = None,
    limit: int = 100,
    offset: int = 0,
):
    """
    List all tasks for the authenticated user.

    Supports filtering by completion status and pagination.
    Tasks are ordered by creation date (newest first).
    """
    # Base query - ALWAYS filter by current user
    base_query = select(Task).where(Task.user_id == current_user.id)

    # Apply completion filter if specified
    if completed is not None:
        base_query = base_query.where(Task.completed == completed)

    # Get total count
    count_query = select(func.count()).select_from(base_query.subquery())
    total_result = db.execute(count_query)
    total = total_result.scalar() or 0

    # Get paginated items
    items_query = base_query.order_by(Task.created_at.desc()).offset(offset).limit(limit)
    result = db.execute(items_query)
    items = result.scalars().all()

    return TaskListResponse(
        items=[TaskRead.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{task_id}", response_model=TaskRead)
def get_task(
    task_id: UUID,
    current_user: AuthenticatedUser,
    db: DbSession,
):
    """
    Get a single task by ID.

    Returns 404 if task doesn't exist or isn't owned by user.
    This prevents enumeration attacks.
    """
    query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = db.execute(query)
    task = result.scalar_one_or_none()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": ErrorCode.TASK_NOT_FOUND,
                "message": "The requested task does not exist",
            },
        )

    return task


@router.put("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: UUID,
    task_in: TaskUpdate,
    current_user: AuthenticatedUser,
    db: DbSession,
):
    """
    Update a task's title and/or completion status.

    Returns 404 if task doesn't exist or isn't owned by user.
    """
    query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = db.execute(query)
    task = result.scalar_one_or_none()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": ErrorCode.TASK_NOT_FOUND,
                "message": "The requested task does not exist",
            },
        )

    # Update fields if provided
    if task_in.title is not None:
        task.update_title(task_in.title)
    if task_in.completed is not None:
        task.completed = task_in.completed
        task.updated_at = Task.utc_now() if hasattr(Task, 'utc_now') else task.updated_at

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    current_user: AuthenticatedUser,
    db: DbSession,
):
    """
    Delete a task permanently.

    Returns 404 if task doesn't exist or isn't owned by user.
    """
    query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = db.execute(query)
    task = result.scalar_one_or_none()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": ErrorCode.TASK_NOT_FOUND,
                "message": "The requested task does not exist",
            },
        )

    db.delete(task)
    db.commit()
    return None


@router.patch("/{task_id}/complete", response_model=TaskRead)
def toggle_task_complete(
    task_id: UUID,
    current_user: AuthenticatedUser,
    db: DbSession,
):
    """
    Toggle the completion status of a task.

    If task is incomplete, marks it complete.
    If task is complete, marks it incomplete.
    """
    query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = db.execute(query)
    task = result.scalar_one_or_none()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": ErrorCode.TASK_NOT_FOUND,
                "message": "The requested task does not exist",
            },
        )

    task.toggle_complete()
    db.commit()
    db.refresh(task)
    return task
