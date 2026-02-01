# Backend Agent Guidance

## Domain Boundaries

This is the **FastAPI backend** for the Phase II Todo Application.

### Allowed Paths
- `backend/app/` - Application code
- `backend/tests/` - Test files
- `backend/alembic/` - Database migrations

### Forbidden Paths
- `frontend/` - Frontend code (ui-engineer domain)
- `specs/` - Read-only specifications

## Architecture Rules

### JWT Verification
- ALL task endpoints MUST use `get_current_user` dependency
- NEVER accept user_id from URL parameters or request body
- ALWAYS extract user_id from verified JWT claims (`sub` field)

### User Isolation
- ALL task queries MUST filter by `user_id = current_user.id`
- Return 404 (not 403) for tasks not owned by user (prevent enumeration)
- NEVER expose other users' task IDs or data

### Database Access
- Use async SQLModel sessions
- Always use connection pooling for queries
- Use unpooled connection for Alembic migrations only

## Code Patterns

### Dependency Injection
```python
from app.api.deps import get_current_user, get_db

@router.get("/todos")
async def list_todos(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # current_user.id is the verified user from JWT
    pass
```

### Error Responses
- Use HTTPException with standardized error codes
- Error format: `{"error_code": "CODE", "message": "Human-readable"}`
- See `app/schemas/error.py` for standard codes

### Testing
- All tests in `tests/integration/`
- Use `conftest.py` fixtures for auth and db
- Test isolation: each test gets fresh user

## Security Checklist

Before committing, verify:
- [ ] All new endpoints use `get_current_user` dependency
- [ ] All task queries include `WHERE user_id = current_user.id`
- [ ] No user_id accepted from client input
- [ ] Error messages don't leak other users' data
- [ ] Tests cover auth failure cases
