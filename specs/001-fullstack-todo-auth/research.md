# Research: Phase II Full-Stack Todo Web Application

**Feature Branch**: `001-fullstack-todo-auth`
**Date**: 2026-01-23
**Status**: Complete

## Executive Summary

This document captures research findings and architectural decisions for implementing the Phase II Full-Stack Todo Web Application. All technology choices align with the project constitution and are optimized for the spec-driven, agent-based development workflow.

---

## Decision 1: JWT Validation Strategy in FastAPI

**Decision**: Use dependency injection pattern (not middleware)

**Rationale**:
- Dependency injection allows per-route control over authentication requirements
- Enables optional authentication for future public endpoints
- Aligns with FastAPI's native patterns and best practices
- Easier to test with dependency overrides
- Constitution allows this pattern for backend agents

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Global middleware | Cannot have unauthenticated routes; less flexible |
| Route decorators | Not native to FastAPI; adds complexity |
| Manual token check in each route | Code duplication; error-prone |

**Implementation Pattern**:
```python
# Dependency function in backend/app/api/deps.py
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Verify JWT, extract user_id, fetch user
    pass

# Usage in routes
@router.get("/todos")
async def list_todos(current_user: User = Depends(get_current_user)):
    pass
```

---

## Decision 2: User ID Source of Truth

**Decision**: Extract user ID from JWT claims (`sub` claim), never from URL parameters

**Rationale**:
- JWT is cryptographically signed; cannot be tampered with
- URL parameters can be manipulated by malicious users
- Aligns with security rule: "Backend MUST extract user identity from verified JWT claims"
- Single source of truth prevents IDOR vulnerabilities

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| URL parameter (e.g., /users/{id}/todos) | Security risk; requires additional validation |
| Session storage | Adds server state; complicates serverless deployment |
| Request header (custom) | JWT already provides this; redundant |

**Implementation Pattern**:
- JWT payload includes `sub` (user_id), `email`, `name`
- Backend extracts `user_id` from verified token
- All queries filter by `current_user.id` from dependency

---

## Decision 3: API Route Structure

**Decision**: Resource-based REST routes with implicit user context from JWT

**Rationale**:
- Cleaner URLs: `/api/todos` instead of `/api/users/{id}/todos`
- User context always derived from JWT, not URL
- Standard REST conventions for CRUD operations
- Aligns with spec functional requirements

**API Structure**:
```
POST   /api/auth/register     # Public: Create account
POST   /api/auth/login        # Public: Authenticate
POST   /api/auth/logout       # Protected: End session

GET    /api/todos             # Protected: List user's todos
POST   /api/todos             # Protected: Create todo
GET    /api/todos/{id}        # Protected: Get single todo
PUT    /api/todos/{id}        # Protected: Update todo
DELETE /api/todos/{id}        # Protected: Delete todo
PATCH  /api/todos/{id}/complete  # Protected: Toggle completion

GET    /api/users/me          # Protected: Current user profile
```

---

## Decision 4: Database Connection Strategy for Neon

**Decision**: Use connection pooling with Neon's serverless driver

**Rationale**:
- Neon is serverless PostgreSQL; connections are expensive to establish
- Connection pooling reduces cold start latency
- Neon provides built-in connection pooler (PgBouncer-compatible)
- Aligns with constitution's Neon PostgreSQL requirement

**Configuration**:
- Use `DATABASE_URL` with pooled connection string for queries
- Use `DATABASE_URL_UNPOOLED` for migrations (Alembic)
- Pool size: 5-10 connections (appropriate for serverless)
- Connection timeout: 30 seconds
- SSL mode: require

**Implementation Pattern**:
```python
# backend/app/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True
)
```

---

## Decision 5: Error Handling Patterns

**Decision**: Structured error responses with consistent format across frontend and backend

**Rationale**:
- Consistent error format simplifies frontend error handling
- Error codes enable programmatic error handling
- User-friendly messages for display
- Detailed errors logged server-side, not exposed to client

**Error Response Format**:
```json
{
  "error_code": "TASK_NOT_FOUND",
  "message": "The requested task does not exist",
  "details": null
}
```

**HTTP Status Code Mapping**:
| Status | Usage |
|--------|-------|
| 400 | Validation errors, bad request |
| 401 | Missing or invalid JWT |
| 403 | Valid JWT but insufficient permissions |
| 404 | Resource not found (or not owned by user) |
| 422 | Pydantic validation error |
| 500 | Internal server error |

**Security Note**: For tasks not owned by user, return 404 (not 403) to prevent enumeration attacks.

---

## Decision 6: Better Auth Configuration

**Decision**: Use email/password authentication with JWT plugin

**Rationale**:
- Simplest auth method for Phase II scope
- JWT plugin enables stateless backend verification
- Better Auth handles session management on frontend
- Shared secret enables cross-service JWT verification

**Configuration Requirements**:
- Enable email/password provider
- Enable JWT plugin with custom claims (userId, email)
- Configure session duration: 7 days
- Configure JWT expiration: 15 minutes (with refresh)
- Set `BETTER_AUTH_SECRET` in both frontend and backend

---

## Decision 7: Frontend-Backend Token Flow

**Decision**: Frontend fetches JWT from Better Auth session, passes as Bearer token to FastAPI

**Rationale**:
- Decouples auth provider from backend
- Standard Authorization header pattern
- Works with Server Components and Client Components
- Backend validates independently (no session sharing)

**Flow**:
1. User authenticates via Better Auth (frontend)
2. Better Auth issues JWT, stores in session
3. Frontend API client extracts JWT from session
4. Frontend sends `Authorization: Bearer <token>` header
5. FastAPI validates JWT using shared secret
6. FastAPI extracts user_id from `sub` claim

---

## Decision 8: SQLModel Schema Design

**Decision**: Separate table models from API schemas

**Rationale**:
- Table models have database-specific concerns (relations, defaults)
- API schemas focus on validation and serialization
- Enables different shapes for create/read/update operations
- Follows SQLModel best practices

**Model Hierarchy**:
```
UserBase (shared fields)
├── UserCreate (registration input)
├── UserRead (API response)
└── User (table model, table=True)

TaskBase (shared fields)
├── TaskCreate (creation input)
├── TaskUpdate (update input)
├── TaskRead (API response)
└── Task (table model, table=True)
```

---

## Decision 9: Testing Strategy

**Decision**: pytest for backend, integration tests for critical paths

**Rationale**:
- pytest is FastAPI's recommended testing framework
- Integration tests validate full request/response cycle
- Constitution requires: auth enforcement, user isolation, CRUD operations
- Focus on API tests (frontend tests out of initial scope)

**Test Categories**:
| Category | Purpose | Example |
|----------|---------|---------|
| Auth Tests | Token validation | Request without token returns 401 |
| Isolation Tests | User separation | User A cannot see User B's tasks |
| CRUD Tests | Operations work | Create task returns 201 with task data |
| Edge Case Tests | Error handling | Empty title returns 422 |

---

## Technology Version Locks

Based on constitution requirements and compatibility research:

| Technology | Version | Notes |
|------------|---------|-------|
| Python | 3.11+ | Required for FastAPI async features |
| Node.js | 20+ | Required for Next.js 16 |
| Next.js | 16+ | App Router required |
| FastAPI | 0.109+ | Latest stable |
| SQLModel | 0.0.16+ | Latest stable |
| Better Auth | 1.0+ | JWT plugin required |
| PostgreSQL | 15+ | Neon default version |
| Tailwind CSS | 3.4+ | Latest stable |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Neon cold start latency | Medium | Low | Connection pooling; warm-up queries |
| JWT expiration during session | Medium | Medium | Refresh token flow; graceful re-auth |
| Better Auth API changes | Low | Medium | Pin version; monitor changelog |
| Agent domain boundary violations | Low | High | Constitution enforcement; code review |

---

## Open Questions Resolved

1. **Q**: Should auth routes be public or protected?
   **A**: `/register` and `/login` are public; `/logout` is protected (requires valid token)

2. **Q**: How to handle concurrent edits?
   **A**: Last write wins; no locking mechanism in Phase II scope

3. **Q**: Soft delete vs hard delete for tasks?
   **A**: Hard delete in Phase II; soft delete is out of scope

4. **Q**: How to handle session expiration?
   **A**: Better Auth handles frontend session; JWT expiration triggers re-auth
