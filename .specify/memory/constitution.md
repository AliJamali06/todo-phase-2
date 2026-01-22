<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version change: 0.0.0 → 1.0.0 (MAJOR - Initial constitution adoption)

Modified principles: N/A (new constitution)

Added sections:
- Core Principles (10 principles)
- Technology Constraints
- Architecture Rules
- Agent Governance Model
- Governance

Removed sections: None (template placeholders replaced)

Templates requiring updates:
- .specify/templates/plan-template.md ✅ Compatible (Constitution Check section exists)
- .specify/templates/spec-template.md ✅ Compatible (Requirements section aligns)
- .specify/templates/tasks-template.md ✅ Compatible (Phase structure supports agent model)

Follow-up TODOs: None
=============================================================================
-->

# Phase II Full-Stack Todo App Constitution

## Core Principles

### I. Spec-First Development

All implementation work MUST be preceded by an approved specification document.

- No feature implementation may begin without a corresponding spec in `/specs/`
- Specifications MUST define acceptance criteria before code is written
- Implementation MUST reference specs using `@specs/` paths
- If requirements are unclear, the spec MUST be updated first—never guess or invent features

**Rationale**: Specifications serve as the single source of truth, ensuring all agents and
stakeholders share the same understanding of requirements before any work begins.

### II. Strict Agent Role Separation

Each agent MUST operate exclusively within its designated domain.

- Frontend agents MUST only modify `/frontend` directory
- Backend agents MUST only modify `/backend` directory
- Database agents MUST only modify schema and model definitions
- Auth agents MUST only modify authentication flow and verification logic
- Agents MUST NOT modify files outside their domain boundaries
- Cross-domain changes require orchestrator coordination

**Rationale**: Clear boundaries prevent conflicts, ensure accountability, and enable
parallel work streams without interference.

### III. No Manual Human Coding

All code changes MUST be produced by AI agents following the spec-driven workflow.

- Human role is limited to: specification approval, review, and acceptance testing
- All implementation MUST be traceable to agent execution logs
- Manual code edits invalidate the reproducibility guarantee
- Hotfixes require spec documentation before agent implementation

**Rationale**: Reproducible, AI-driven development ensures consistency and enables
full auditability of all changes.

### IV. Technology Stack Compliance

All implementations MUST use the approved technology stack without deviation.

**Frontend**:
- Next.js 16+ with App Router (required)
- TypeScript (required)
- Tailwind CSS (required)

**Backend**:
- Python FastAPI (required)
- SQLModel ORM (required)
- Neon Serverless PostgreSQL (required)

**Authentication**:
- Better Auth for Next.js frontend (required)
- JWT-based verification for FastAPI backend (required)
- Shared secret via `BETTER_AUTH_SECRET` environment variable (required)

**Rationale**: A fixed technology stack reduces decision fatigue, ensures agent
expertise, and simplifies integration testing.

### V. Architecture Rules

The codebase MUST follow Spec-Kit monorepo structure and conventions.

- Specifications MUST live in `/specs/*` directory
- Implementation MUST reference specifications using `@specs/` paths
- Frontend and backend MUST have separate `CLAUDE.md` guidance files
- Project structure MUST follow Spec-Kit layout conventions
- All architectural decisions MUST be documented in ADRs

**Rationale**: Consistent architecture enables agents to navigate the codebase
predictably and ensures long-term maintainability.

### VI. Security Rules

All API endpoints and data access MUST enforce authentication and user isolation.

- All API endpoints MUST require a valid JWT token (no exceptions for data endpoints)
- Backend MUST verify JWT signature using shared secret
- Backend MUST extract user identity from verified JWT claims
- All database queries MUST filter by authenticated user ID
- No task/data may be accessed across user boundaries
- Secrets MUST never be committed to version control

**Rationale**: Multi-tenant security is non-negotiable; user data isolation prevents
data leakage and ensures privacy compliance.

### VII. Agent Governance Model

Agents operate under a hierarchical coordination model with clear responsibilities.

**Orchestrator Agent**:
- Plans phases and task breakdown
- Assigns work to sub-agents based on domain
- MUST NOT write implementation code directly
- Ensures all work follows approved specifications
- Resolves cross-agent conflicts and dependencies

**Sub-Agents**:
- MUST only operate within their assigned domain
- MUST NOT modify other layers or bypass specifications
- MUST report results back to orchestrator upon completion
- MUST flag blockers for orchestrator resolution

**Rationale**: Hierarchical governance ensures coordinated execution while maintaining
clear accountability and preventing scope creep.

### VIII. Spec Compliance

All implementations MUST match their corresponding specification documents.

**Feature behavior MUST match**:
- `@specs/features/task-crud.md`
- `@specs/features/authentication.md`

**API behavior MUST match**:
- `@specs/api/rest-endpoints.md`

**Database schema MUST match**:
- `@specs/database/schema.md`

**UI structure MUST match**:
- `@specs/ui/components.md`
- `@specs/ui/pages.md`

**Rationale**: Spec compliance ensures predictable behavior and enables automated
validation of implementation correctness.

### IX. Change Management

All deviations from specifications MUST be documented before implementation.

- If a requirement is unclear, update the spec first
- Do not guess or invent features not in specifications
- All deviations MUST be written into specs before implementation begins
- Breaking changes require spec versioning and migration documentation
- ADRs MUST document significant architectural decisions

**Rationale**: Proactive change documentation prevents drift between specs and
implementation, maintaining system integrity.

### X. Testing Expectations

Integration testing MUST validate all critical system behaviors.

**Required validations**:
- Authentication enforcement (valid/invalid tokens)
- User isolation (cross-user access prevention)
- CRUD operations (create, read, update, delete)
- API + Database + UI consistency

**Completion criteria**:
- No feature is complete without passing integration tests
- Tests MUST cover happy path and error scenarios
- Test results MUST be traceable to spec acceptance criteria

**Rationale**: Comprehensive testing ensures the system works as specified and
prevents regressions across the full stack.

## Technology Constraints

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Frontend Framework | Next.js | 16+ | App Router required |
| Frontend Language | TypeScript | Latest | Strict mode enabled |
| Frontend Styling | Tailwind CSS | Latest | Utility-first approach |
| Backend Framework | FastAPI | Latest | Async endpoints |
| Backend ORM | SQLModel | Latest | Pydantic integration |
| Database | Neon PostgreSQL | Serverless | Connection pooling required |
| Auth (Frontend) | Better Auth | Latest | JWT plugin enabled |
| Auth (Backend) | PyJWT | Latest | HS256 algorithm |

## Architecture Rules

### Directory Structure

```
/
├── frontend/           # Next.js application (ui-engineer, api-client-agent)
│   ├── app/            # App Router pages and layouts
│   ├── components/     # React components
│   ├── lib/            # Utilities and API client
│   └── CLAUDE.md       # Frontend agent guidance
├── backend/            # FastAPI application (api-engineer, orm-engineer)
│   ├── app/            # Application code
│   │   ├── api/        # Route handlers
│   │   ├── models/     # SQLModel definitions
│   │   ├── schemas/    # Pydantic schemas
│   │   └── core/       # Configuration and security
│   ├── tests/          # Backend tests
│   └── CLAUDE.md       # Backend agent guidance
├── specs/              # Specification documents
│   ├── features/       # Feature specifications
│   ├── api/            # API contracts
│   ├── database/       # Schema definitions
│   └── ui/             # UI specifications
└── .specify/           # Spec-Kit configuration
```

### Agent Domain Boundaries

| Agent | Allowed Paths | Forbidden Actions |
|-------|---------------|-------------------|
| phase2-orchestrator | Read all, write specs/ | Write implementation code |
| db-architect | backend/app/db/, alembic/ | Modify API routes |
| orm-engineer | backend/app/models/, backend/app/schemas/ | Modify database directly |
| api-engineer | backend/app/api/, backend/app/schemas/ | Modify models |
| auth-specialist | frontend/lib/auth*, frontend/app/api/auth/ | Modify backend auth |
| jwt-bridge-agent | frontend/lib/api/, backend/app/core/security.py | Modify auth config |
| ui-engineer | frontend/app/, frontend/components/ | Modify API client |
| api-client-agent | frontend/lib/api/ | Modify UI components |
| integration-tester | tests/, Read all | Modify implementation |

## Agent Governance Model

### Execution Flow

1. **User** provides feature request or approves specification
2. **Orchestrator** decomposes into tasks and assigns to agents
3. **Sub-agents** execute within domain boundaries
4. **Sub-agents** report completion to orchestrator
5. **Orchestrator** coordinates integration and validates
6. **Integration-tester** validates end-to-end behavior
7. **User** performs acceptance testing

### Escalation Rules

- Unclear requirements → Orchestrator asks user for clarification
- Cross-domain conflicts → Orchestrator mediates resolution
- Spec violations detected → Work halts until spec is corrected
- Security concerns → Immediate escalation to user

## Governance

This constitution supersedes all other development practices for Phase II.

**Amendment Process**:
1. Proposed changes MUST be documented with rationale
2. Changes require user approval before adoption
3. Version MUST be incremented according to semver rules
4. All agents MUST be notified of constitution changes

**Compliance**:
- All PRs/reviews MUST verify constitution compliance
- Complexity MUST be justified against these principles
- Violations MUST be flagged and corrected before merge

**Versioning Policy**:
- MAJOR: Principle removal or incompatible governance change
- MINOR: New principle added or existing principle expanded
- PATCH: Clarifications, wording improvements, typo fixes

**Version**: 1.0.0 | **Ratified**: 2026-01-23 | **Last Amended**: 2026-01-23
