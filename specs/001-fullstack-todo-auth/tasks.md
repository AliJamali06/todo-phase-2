# Tasks: Phase II Full-Stack Todo Web Application

**Input**: Design documents from `/specs/001-fullstack-todo-auth/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.yaml ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` (FastAPI) and `frontend/` (Next.js)
- Backend paths: `backend/app/`, `backend/tests/`, `backend/alembic/`
- Frontend paths: `frontend/app/`, `frontend/components/`, `frontend/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**Agent**: phase2-orchestrator (coordination), db-architect, ui-engineer

- [X] T001 [P] Create `backend/` directory structure per plan.md (app/, tests/, alembic/)
- [X] T002 [P] Create `frontend/` directory structure per plan.md (app/, components/, lib/)
- [X] T003 Initialize Python project with FastAPI dependencies in `backend/requirements.txt`
- [X] T004 Initialize Next.js 16+ project with TypeScript in `frontend/package.json`
- [X] T005 [P] Create `backend/.env.example` with DATABASE_URL, BETTER_AUTH_SECRET placeholders
- [X] T006 [P] Create `frontend/.env.example` with BETTER_AUTH_SECRET, NEXT_PUBLIC_API_URL placeholders
- [X] T007 [P] Create `backend/CLAUDE.md` with agent guidance for backend development
- [X] T008 [P] Create `frontend/CLAUDE.md` with agent guidance for frontend development
- [X] T009 Configure Tailwind CSS in `frontend/tailwind.config.ts`

**Checkpoint**: Both project skeletons exist with dependency files. No servers running yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Agents**: db-architect, orm-engineer, api-engineer

### Database & ORM Foundation

- [X] T010 Configure Neon PostgreSQL connection in `backend/app/db/session.py` with pooled connections
- [X] T011 Create SQLModel base configuration in `backend/app/models/__init__.py`
- [X] T012 Create Settings class with Pydantic BaseSettings in `backend/app/core/config.py`
- [X] T013 [P] Setup Alembic configuration in `backend/alembic.ini` and `backend/alembic/env.py`

### FastAPI Application Foundation

- [X] T014 Create FastAPI app entry point in `backend/app/main.py` with CORS middleware
- [X] T015 Create API router structure in `backend/app/api/__init__.py`
- [X] T016 Create error response schemas in `backend/app/schemas/error.py` per api.yaml
- [X] T017 Create base dependency injection file in `backend/app/api/deps.py`

### Next.js Application Foundation

- [X] T018 Configure Next.js App Router in `frontend/next.config.ts`
- [X] T019 Create root layout in `frontend/app/layout.tsx` with Tailwind
- [X] T020 [P] Create base UI components: `frontend/components/ui/button.tsx`
- [X] T021 [P] Create base UI components: `frontend/components/ui/input.tsx`
- [X] T022 [P] Create base UI components: `frontend/components/ui/card.tsx`

**Checkpoint**: Backend starts with `uvicorn app.main:app --reload` showing docs at /docs. Frontend starts with `npm run dev` showing blank page.

---

## Phase 3: User Story 1 - User Registration and Login (Priority: P1) 🎯 MVP

**Goal**: Users can register, login, and logout with secure JWT-based sessions

**Independent Test**: Register → Logout → Login → Verify session → Logout

**Agents**: auth-specialist (Better Auth), jwt-bridge-agent (FastAPI verification)

**Requirements**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-016

### Tests for User Story 1

- [X] T023 [P] [US1] Create auth test fixtures in `backend/tests/conftest.py` (mock JWT, test user)
- [X] T024 [P] [US1] Integration test: valid registration in `backend/tests/integration/test_auth.py`
- [X] T025 [P] [US1] Integration test: valid login in `backend/tests/integration/test_auth.py`
- [X] T026 [P] [US1] Integration test: invalid credentials rejected in `backend/tests/integration/test_auth.py`
- [X] T027 [P] [US1] Integration test: expired/invalid token rejected in `backend/tests/integration/test_auth.py`

### Frontend Authentication (Better Auth)

- [X] T028 [US1] Configure Better Auth server in `frontend/lib/auth.ts` with JWT plugin
- [X] T029 [US1] Create Better Auth client hooks in `frontend/lib/auth-client.ts`
- [X] T030 [US1] Create Better Auth API route in `frontend/app/api/auth/[...all]/route.ts`
- [X] T031 [US1] Create auth layout in `frontend/app/(auth)/layout.tsx`
- [X] T032 [P] [US1] Create login form component in `frontend/components/auth/login-form.tsx`
- [X] T033 [P] [US1] Create register form component in `frontend/components/auth/register-form.tsx`
- [X] T034 [US1] Create login page in `frontend/app/(auth)/login/page.tsx`
- [X] T035 [US1] Create register page in `frontend/app/(auth)/register/page.tsx`

### Backend JWT Verification

- [X] T036 [US1] Implement JWT verification service in `backend/app/core/security.py` (decode, validate, extract user_id)
- [X] T037 [US1] Create `get_current_user` dependency in `backend/app/api/deps.py` using security.py
- [X] T038 [US1] Create user profile endpoint GET `/api/users/me` in `backend/app/api/routes/users.py`

### Route Protection

- [X] T039 [US1] Create middleware for route protection in `frontend/middleware.ts`
- [X] T040 [US1] Create protected layout in `frontend/app/(app)/layout.tsx` with auth check

**Checkpoint**: User can register at /register, login at /login, see profile at /api/users/me, logout. All without task functionality.

---

## Phase 4: User Story 2 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can create tasks and view their personal task list

**Independent Test**: Login → Create task → Refresh → Verify task persists → Verify other user cannot see it

**Agents**: orm-engineer (Task model), api-engineer (endpoints), ui-engineer (components), api-client-agent

**Requirements**: FR-007, FR-008, FR-013, FR-014, FR-017

### Tests for User Story 2

- [X] T041 [P] [US2] Integration test: create task in `backend/tests/integration/test_tasks.py`
- [X] T042 [P] [US2] Integration test: list user's tasks in `backend/tests/integration/test_tasks.py`
- [X] T043 [P] [US2] Integration test: user isolation (user A cannot see user B's tasks) in `backend/tests/integration/test_isolation.py`
- [X] T044 [P] [US2] Integration test: unauthenticated request rejected in `backend/tests/integration/test_tasks.py`

### Backend Task Model & API

- [X] T045 [US2] Create Task SQLModel in `backend/app/models/task.py` per data-model.md
- [X] T046 [US2] Create Alembic migration for task table in `backend/alembic/versions/001_create_task_table.py`
- [X] T047 [US2] Create Task Pydantic schemas (TaskCreate, TaskRead, TaskListResponse) in `backend/app/schemas/task.py`
- [X] T048 [US2] Implement POST `/api/todos` (create task) in `backend/app/api/routes/tasks.py`
- [X] T049 [US2] Implement GET `/api/todos` (list tasks) in `backend/app/api/routes/tasks.py`
- [X] T050 [US2] Register task router in `backend/app/main.py`

### Frontend API Client

- [X] T051 [US2] Create typed API client with JWT injection in `frontend/lib/api/client.ts`
- [X] T052 [US2] Create TypeScript types matching api.yaml in `frontend/lib/api/types.ts`
- [X] T053 [US2] Create task API functions (createTask, listTasks) in `frontend/lib/api/tasks.ts`

### Frontend Task UI

- [X] T054 [P] [US2] Create task-item component in `frontend/components/tasks/task-item.tsx`
- [X] T055 [P] [US2] Create task-list component in `frontend/components/tasks/task-list.tsx`
- [X] T056 [P] [US2] Create task-form component for new tasks in `frontend/components/tasks/task-form.tsx`
- [X] T057 [US2] Create dashboard page with task list in `frontend/app/(app)/dashboard/page.tsx`
- [X] T058 [US2] Create todos page in `frontend/app/(app)/todos/page.tsx`

**Checkpoint**: User can login, create tasks, see their task list, refresh and tasks persist. User A cannot see User B's tasks.

---

## Phase 5: User Story 3 - Mark Tasks Complete/Incomplete (Priority: P2)

**Goal**: Users can toggle task completion status

**Independent Test**: Create task → Mark complete → Verify visual change → Refresh → Verify persists → Toggle back

**Agents**: api-engineer, ui-engineer

**Requirements**: FR-009, FR-018

### Tests for User Story 3

- [X] T059 [P] [US3] Integration test: toggle task complete in `backend/tests/integration/test_tasks.py`
- [X] T060 [P] [US3] Integration test: completion status persists in `backend/tests/integration/test_tasks.py`

### Backend Toggle Endpoint

- [X] T061 [US3] Implement PATCH `/api/todos/{taskId}/complete` in `backend/app/api/routes/tasks.py`

### Frontend Toggle UI

- [X] T062 [US3] Add toggleComplete function in `frontend/lib/api/tasks.ts`
- [X] T063 [US3] Update task-item component with checkbox toggle in `frontend/components/tasks/task-item.tsx`
- [X] T064 [US3] Add visual styling for completed tasks (strikethrough, muted) in task-item

**Checkpoint**: User can mark tasks complete/incomplete. State persists across page refresh.

---

## Phase 6: User Story 4 - Edit Task Details (Priority: P2)

**Goal**: Users can edit task titles

**Independent Test**: Create task → Edit title → Save → Verify change → Cancel edit → Verify no change

**Agents**: api-engineer, ui-engineer

**Requirements**: FR-010

### Tests for User Story 4

- [X] T065 [P] [US4] Integration test: update task title in `backend/tests/integration/test_tasks.py`
- [X] T066 [P] [US4] Integration test: empty title rejected in `backend/tests/integration/test_tasks.py`
- [X] T067 [P] [US4] Integration test: cannot edit another user's task in `backend/tests/integration/test_isolation.py`

### Backend Update Endpoint

- [X] T068 [US4] Create TaskUpdate schema in `backend/app/schemas/task.py` (title optional, completed optional)
- [X] T069 [US4] Implement PUT `/api/todos/{taskId}` in `backend/app/api/routes/tasks.py`
- [X] T070 [US4] Implement GET `/api/todos/{taskId}` for single task fetch in `backend/app/api/routes/tasks.py`

### Frontend Edit UI

- [X] T071 [US4] Add updateTask function in `frontend/lib/api/tasks.ts`
- [X] T072 [US4] Add inline edit mode to task-item component in `frontend/components/tasks/task-item.tsx`
- [X] T073 [US4] Add validation feedback for empty title

**Checkpoint**: User can edit task titles. Empty titles are rejected. Changes persist.

---

## Phase 7: User Story 5 - Delete Tasks (Priority: P2)

**Goal**: Users can delete tasks they no longer need

**Independent Test**: Create task → Delete → Verify removed → Refresh → Verify still gone

**Agents**: api-engineer, ui-engineer

**Requirements**: FR-011, FR-015

### Tests for User Story 5

- [X] T074 [P] [US5] Integration test: delete task in `backend/tests/integration/test_tasks.py`
- [X] T075 [P] [US5] Integration test: delete returns 404 for non-existent task in `backend/tests/integration/test_tasks.py`
- [X] T076 [P] [US5] Integration test: cannot delete another user's task in `backend/tests/integration/test_isolation.py`

### Backend Delete Endpoint

- [X] T077 [US5] Implement DELETE `/api/todos/{taskId}` in `backend/app/api/routes/tasks.py`

### Frontend Delete UI

- [X] T078 [US5] Add deleteTask function in `frontend/lib/api/tasks.ts`
- [X] T079 [US5] Add delete button to task-item component in `frontend/components/tasks/task-item.tsx`
- [X] T080 [US5] Add confirmation before delete (optional but recommended)

**Checkpoint**: User can delete tasks. Deleted tasks do not reappear. Cannot delete other users' tasks.

---

## Phase 8: User Story 6 - View All Tasks with Filter Options (Priority: P3)

**Goal**: Users can filter tasks by completion status

**Independent Test**: Create mixed tasks → Filter incomplete → Verify only incomplete shown → Filter complete → Verify only complete shown → All → Verify all shown

**Agents**: api-engineer, ui-engineer

**Requirements**: FR-012

### Tests for User Story 6

- [X] T081 [P] [US6] Integration test: filter by completed=true in `backend/tests/integration/test_tasks.py`
- [X] T082 [P] [US6] Integration test: filter by completed=false in `backend/tests/integration/test_tasks.py`

### Backend Filter Support

- [X] T083 [US6] Add `completed` query parameter to GET `/api/todos` in `backend/app/api/routes/tasks.py`

### Frontend Filter UI

- [X] T084 [US6] Create task-filter component in `frontend/components/tasks/task-filter.tsx`
- [X] T085 [US6] Integrate filter with task list on todos page
- [X] T086 [US6] Update listTasks function to support completed filter in `frontend/lib/api/tasks.ts`

**Checkpoint**: User can filter by all/complete/incomplete. Filters work correctly.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and documentation

**Agents**: integration-tester, phase2-orchestrator

- [X] T087 [P] Run full backend test suite: `pytest backend/tests/ -v`
- [X] T088 [P] Run Alembic migrations on fresh database to verify schema
- [X] T089 Validate all endpoints match `specs/001-fullstack-todo-auth/contracts/api.yaml`
- [X] T090 Run quickstart.md validation (follow all steps, verify success)
- [X] T091 [P] Security review: verify JWT validation on all protected endpoints
- [X] T092 [P] Security review: verify user isolation in all task queries
- [X] T093 [P] Add loading states to frontend components
- [X] T094 [P] Add error handling UI for failed API calls
- [X] T095 Update `specs/001-fullstack-todo-auth/quickstart.md` if any setup steps changed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational - BLOCKS US2-US6 (auth required)
- **US2 (Phase 4)**: Depends on US1 (auth) - Can proceed after US1
- **US3-US6 (Phases 5-8)**: Depend on US2 (tasks exist) - Can run in parallel after US2
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1: Auth) ← MVP Gate 1
    ↓
Phase 4 (US2: Create/View) ← MVP Gate 2
    ↓
┌───────────────────┬───────────────────┬───────────────────┐
↓                   ↓                   ↓                   ↓
Phase 5 (US3)    Phase 6 (US4)    Phase 7 (US5)    Phase 8 (US6)
(Complete)       (Edit)           (Delete)          (Filter)
└───────────────────┴───────────────────┴───────────────────┘
                            ↓
                    Phase 9 (Polish)
```

### Agent Assignments by Phase

| Phase | Primary Agent(s) | Support Agent(s) |
|-------|------------------|------------------|
| 1 | db-architect, ui-engineer | phase2-orchestrator |
| 2 | db-architect, orm-engineer, api-engineer | - |
| 3 | auth-specialist, jwt-bridge-agent | ui-engineer |
| 4 | orm-engineer, api-engineer | api-client-agent, ui-engineer |
| 5-8 | api-engineer, ui-engineer | - |
| 9 | integration-tester | phase2-orchestrator |

### Parallel Opportunities

**Within Phase 1:**
- T001, T002 (directory creation)
- T005, T006, T007, T008 (env and CLAUDE.md files)

**Within Phase 2:**
- T020, T021, T022 (UI components)
- T013 (Alembic) independent of T014-T017 (API)

**Within Phase 3 (US1):**
- T023-T027 (all tests)
- T032, T033 (auth form components)

**Within Phase 4 (US2):**
- T041-T044 (all tests)
- T054, T055, T056 (task UI components)

**Phases 5-8 (after US2):**
- All four user stories can run in parallel with different team members

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup ✓
2. Complete Phase 2: Foundational ✓
3. Complete Phase 3: US1 (Auth) → **MVP Gate 1: Users can register/login**
4. Complete Phase 4: US2 (Tasks) → **MVP Gate 2: Users can create/view tasks**
5. **STOP and VALIDATE**: Full MVP is functional

### Incremental Delivery (after MVP)

1. Add US3 (Complete toggle) → Test independently
2. Add US4 (Edit) → Test independently
3. Add US5 (Delete) → Test independently
4. Add US6 (Filter) → Test independently
5. Complete Phase 9: Polish

---

## Traceability Matrix

| Task Range | User Story | Requirements |
|------------|------------|--------------|
| T023-T040 | US1 | FR-001 to FR-006, FR-016 |
| T041-T058 | US2 | FR-007, FR-008, FR-013, FR-014, FR-017 |
| T059-T064 | US3 | FR-009, FR-018 |
| T065-T073 | US4 | FR-010 |
| T074-T080 | US5 | FR-011, FR-015 |
| T081-T086 | US6 | FR-012 |

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after US1+US2
- Commit after each task or logical group
- Tests MUST fail before implementation (red-green cycle)
- All task queries MUST include `WHERE user_id = current_user.id` for isolation
