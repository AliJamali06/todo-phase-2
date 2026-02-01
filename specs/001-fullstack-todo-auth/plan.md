# Implementation Plan: Phase II Full-Stack Todo Web Application

**Branch**: `001-fullstack-todo-auth` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fullstack-todo-auth/spec.md`

## Summary

Transform the Phase I console-based todo application into a full-stack multi-user web application. The system will feature JWT-authenticated REST APIs, persistent PostgreSQL storage via Neon, and a Next.js frontend with Better Auth integration. All implementation follows spec-driven development with strict agent domain boundaries.

**Key Deliverables**:
- Next.js 16+ frontend with Better Auth authentication
- FastAPI backend with SQLModel ORM
- Neon PostgreSQL database with user-scoped task storage
- JWT-based authentication flow bridging frontend and backend

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/Node.js 20+ (frontend)
**Primary Dependencies**: FastAPI, SQLModel, Better Auth, Next.js 16+, Tailwind CSS
**Storage**: Neon Serverless PostgreSQL with connection pooling
**Testing**: pytest (backend), Vitest (frontend - optional in Phase II)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: 2s page load, 50 concurrent users
**Constraints**: JWT validation on all data endpoints, user isolation required
**Scale/Scope**: Initial deployment; no multi-region; 50 concurrent users baseline

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-First Development | ✅ PASS | spec.md created and approved before planning |
| II. Strict Agent Role Separation | ✅ PASS | Agent boundaries defined in plan (see Agent Assignments) |
| III. No Manual Human Coding | ✅ PASS | All tasks assigned to agents |
| IV. Technology Stack Compliance | ✅ PASS | Using required stack (Next.js, FastAPI, Neon, Better Auth) |
| V. Architecture Rules | ✅ PASS | Following Spec-Kit monorepo structure |
| VI. Security Rules | ✅ PASS | JWT validation on all endpoints; user isolation enforced |
| VII. Agent Governance Model | ✅ PASS | Orchestrator coordinates; sub-agents execute |
| VIII. Spec Compliance | ✅ PASS | Implementation traces to FR-001 through FR-018 |
| IX. Change Management | ✅ PASS | ADR decisions documented in research.md |
| X. Testing Expectations | ✅ PASS | Integration tests planned for auth, isolation, CRUD |

**Gate Result**: ✅ PASSED - Proceed to implementation phases

## Project Structure

### Documentation (this feature)

```text
specs/001-fullstack-todo-auth/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technical decisions (Phase 0)
├── data-model.md        # Database schema (Phase 1)
├── quickstart.md        # Setup guide (Phase 1)
├── contracts/           # API contracts (Phase 1)
│   └── api.yaml         # OpenAPI specification
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec validation
└── tasks.md             # Implementation tasks (Phase 2 - /sp.tasks)
```

### Source Code (repository root)

```text
frontend/                         # Next.js 16+ application
├── app/                          # App Router
│   ├── (auth)/                   # Auth route group (public)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (app)/                    # Protected route group
│   │   ├── dashboard/page.tsx
│   │   ├── todos/
│   │   │   ├── page.tsx          # Task list
│   │   │   └── [id]/page.tsx     # Task detail (optional)
│   │   └── layout.tsx
│   ├── api/auth/[...all]/route.ts  # Better Auth API
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing/redirect
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── auth/                     # Auth-related components
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   └── tasks/                    # Task-related components
│       ├── task-list.tsx
│       ├── task-item.tsx
│       ├── task-form.tsx
│       └── task-filter.tsx
├── lib/
│   ├── auth.ts                   # Better Auth server config
│   ├── auth-client.ts            # Better Auth client hooks
│   └── api/
│       ├── client.ts             # API client with JWT
│       ├── tasks.ts              # Task API functions
│       └── types.ts              # TypeScript types
├── middleware.ts                 # Route protection
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── .env.local.example
└── CLAUDE.md                     # Frontend agent guidance

backend/                          # FastAPI application
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app entry
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py               # Dependencies (auth, db)
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── tasks.py          # Task endpoints
│   │       └── users.py          # User endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py             # Settings
│   │   └── security.py           # JWT verification
│   ├── db/
│   │   ├── __init__.py
│   │   └── session.py            # Database session
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py               # Task SQLModel
│   └── schemas/
│       ├── __init__.py
│       ├── task.py               # Task Pydantic schemas
│       └── error.py              # Error response schemas
├── tests/
│   ├── __init__.py
│   ├── conftest.py               # Test fixtures
│   └── integration/
│       ├── __init__.py
│       ├── test_auth.py
│       ├── test_tasks.py
│       └── test_isolation.py
├── alembic/
│   ├── env.py
│   └── versions/
│       └── 001_create_task_table.py
├── alembic.ini
├── requirements.txt
├── .env.example
└── CLAUDE.md                     # Backend agent guidance
```

**Structure Decision**: Web application structure with separate `frontend/` and `backend/` directories. This aligns with the constitution's architecture rules and enables strict agent domain boundaries.

---

## Implementation Phases

### Phase 1: Foundation

**Goal**: Establish project structure, environment configuration, and database connectivity.

**Agent Assignments**:
| Task | Agent | Skills Used |
|------|-------|-------------|
| Backend project setup | db-architect | neon_connection_setup |
| Frontend project setup | ui-engineer | nextjs_app_router |
| Environment configuration | db-architect | neon_connection_setup |
| Database connection | db-architect | neon_connection_setup, postgres_schema_design |

**Deliverables**:
- `backend/` directory with FastAPI skeleton
- `frontend/` directory with Next.js 16+ skeleton
- `.env.example` files with required variables
- Database connection verified
- Base CLAUDE.md files for agent guidance

**Checkpoint**: Both servers start without errors; database connection successful.

---

### Phase 2: Authentication Integration

**Goal**: Implement Better Auth on frontend and JWT verification on backend.

**Agent Assignments**:
| Task | Agent | Skills Used |
|------|-------|-------------|
| Better Auth setup | auth-specialist | better_auth_setup |
| JWT plugin configuration | auth-specialist | jwt_plugin_configuration |
| Session management | auth-specialist | session_management |
| Backend JWT verification | jwt-bridge-agent | jwt_verification_logic |
| Token forwarding | jwt-bridge-agent | token_forwarding |
| Auth dependencies | jwt-bridge-agent | dependency_injection |

**Deliverables**:
- `frontend/lib/auth.ts` - Better Auth configuration
- `frontend/lib/auth-client.ts` - Client hooks
- `frontend/app/api/auth/[...all]/route.ts` - Auth API
- `backend/app/core/security.py` - JWT service
- `backend/app/api/deps.py` - Auth dependencies

**Checkpoint**: User can register, login, and logout. JWT is issued and verified.

---

### Phase 3: Core Todo Functionality

**Goal**: Implement task CRUD operations with user isolation.

**Agent Assignments**:
| Task | Agent | Skills Used |
|------|-------|-------------|
| Task SQLModel | orm-engineer | sqlmodel_models |
| Database migration | db-architect | postgres_schema_design |
| Task schemas | orm-engineer | sqlmodel_models |
| Task API routes | api-engineer | fastapi_routing, request_auth_guard |
| Error handling | api-engineer | http_exception_handling |
| Query optimization | api-engineer | query_optimization |
| API client | api-client-agent | api_client_with_jwt |

**Deliverables**:
- `backend/app/models/task.py` - Task model
- `backend/app/schemas/task.py` - Request/response schemas
- `backend/app/api/routes/tasks.py` - CRUD endpoints
- `frontend/lib/api/client.ts` - API client
- `frontend/lib/api/tasks.ts` - Task API functions
- Alembic migration for task table

**Checkpoint**: All CRUD operations work via API. User isolation enforced.

---

### Phase 4: UI Implementation

**Goal**: Build the user interface for authentication and task management.

**Agent Assignments**:
| Task | Agent | Skills Used |
|------|-------|-------------|
| Auth pages | ui-engineer | nextjs_app_router, server_client_components |
| Task list page | ui-engineer | tailwind_layout |
| Task components | ui-engineer | server_client_components |
| Forms | ui-engineer | form_state_management |
| Route protection | ui-engineer | nextjs_app_router |

**Deliverables**:
- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/register/page.tsx`
- `frontend/app/(app)/dashboard/page.tsx`
- `frontend/components/tasks/*` - Task components
- `frontend/middleware.ts` - Route protection

**Checkpoint**: Full user journey works: register → login → manage tasks → logout.

---

### Phase 5: Validation & Testing

**Goal**: Verify all requirements through integration testing.

**Agent Assignments**:
| Task | Agent | Skills Used |
|------|-------|-------------|
| Test setup | integration-tester | review_and_validation |
| Auth tests | integration-tester | review_and_validation |
| CRUD tests | integration-tester | review_and_validation |
| Isolation tests | integration-tester | review_and_validation |

**Deliverables**:
- `backend/tests/conftest.py` - Test fixtures
- `backend/tests/integration/test_auth.py`
- `backend/tests/integration/test_tasks.py`
- `backend/tests/integration/test_isolation.py`

**Test Coverage Requirements**:
| Category | Test Cases |
|----------|-----------|
| Auth | Valid login, invalid credentials, token expiration |
| CRUD | Create, read, update, delete operations |
| Isolation | User A cannot access User B's tasks |
| Validation | Empty title rejected, malformed requests |

**Checkpoint**: All tests pass. Security requirements verified.

---

## Agent Domain Boundaries

| Agent | Allowed Paths | Primary Responsibility |
|-------|---------------|----------------------|
| phase2-orchestrator | specs/, read all | Coordination (no code) |
| db-architect | backend/alembic/, backend/app/db/ | Database setup |
| orm-engineer | backend/app/models/, backend/app/schemas/ | Data models |
| api-engineer | backend/app/api/ | REST endpoints |
| auth-specialist | frontend/lib/auth*, frontend/app/api/auth/ | Better Auth |
| jwt-bridge-agent | frontend/lib/api/, backend/app/core/security.py | Token handling |
| ui-engineer | frontend/app/, frontend/components/ | UI components |
| api-client-agent | frontend/lib/api/ | API client |
| integration-tester | backend/tests/ | Testing |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Neon cold start latency | Medium | Low | Connection pooling configured |
| JWT expiration mid-session | Medium | Medium | Refresh token flow; graceful re-auth |
| Agent boundary violations | Low | High | CLAUDE.md guidance; PR review |
| Better Auth breaking changes | Low | Medium | Pin version in package.json |

---

## Architectural Decisions

See [research.md](./research.md) for detailed decisions on:
1. JWT validation strategy (dependency injection)
2. User ID source of truth (JWT claims)
3. API route structure (resource-based)
4. Database connection (pooled)
5. Error handling patterns

📋 **ADR Recommendation**: The JWT validation strategy and user isolation approach are architecturally significant. Consider documenting with `/sp.adr jwt-user-isolation` after implementation.

---

## Complexity Tracking

No constitution violations requiring justification. The architecture follows all principles without exceptions.

---

## Next Steps

1. Run `/sp.tasks` to generate detailed implementation tasks
2. Begin with Phase 1 (Foundation) tasks
3. Execute phases sequentially, checkpoints after each
4. Run integration tests after Phase 5

---

## Traceability Matrix

| Requirement | Phase | Agent | Verification |
|-------------|-------|-------|--------------|
| FR-001 (Register) | 2 | auth-specialist | test_auth.py |
| FR-002 (Login) | 2 | auth-specialist | test_auth.py |
| FR-003 (Issue tokens) | 2 | auth-specialist | test_auth.py |
| FR-004 (Validate tokens) | 2 | jwt-bridge-agent | test_auth.py |
| FR-005 (Logout) | 2 | auth-specialist | test_auth.py |
| FR-006 (Reject invalid) | 2 | jwt-bridge-agent | test_auth.py |
| FR-007 (Create task) | 3 | api-engineer | test_tasks.py |
| FR-008 (View own tasks) | 3 | api-engineer | test_tasks.py |
| FR-009 (Mark complete) | 3 | api-engineer | test_tasks.py |
| FR-010 (Edit task) | 3 | api-engineer | test_tasks.py |
| FR-011 (Delete task) | 3 | api-engineer | test_tasks.py |
| FR-012 (Filter tasks) | 3 | api-engineer | test_tasks.py |
| FR-013 (Task ownership) | 3 | orm-engineer | test_isolation.py |
| FR-014 (Filter by user) | 3 | api-engineer | test_isolation.py |
| FR-015 (Prevent cross-access) | 3 | api-engineer | test_isolation.py |
| FR-016 (Persist users) | 2 | auth-specialist | test_auth.py |
| FR-017 (Persist tasks) | 3 | orm-engineer | test_tasks.py |
| FR-018 (Maintain state) | 3 | orm-engineer | test_tasks.py |
