---
id: 001
title: Phase II Constitution Initial Adoption
stage: constitution
date: 2026-01-23
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: ALIjamali
command: /sp.constitution
labels: ["constitution", "governance", "phase2", "initial-setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (governance document)
---

## Prompt

Project: Phase II — Full-Stack Multi-User Todo Web Application (Spec-Driven, Agentic Workflow)

Goal:
Transform console-based todo app into a full-stack web application using AI-native,
spec-driven development with Claude Code + Spec-Kit Plus.

Core Principles:
- Spec-First Development (no implementation without approved spec)
- Strict agent role separation
- No manual coding by human
- Reproducible, reviewable AI-driven workflow
- All changes must reference Spec-Kit documents

Technology Constraints:
Frontend:
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS

Backend:
- Python FastAPI
- SQLModel ORM
- Neon Serverless PostgreSQL

Authentication:
- Better Auth (Next.js)
- JWT-based authentication for FastAPI verification
- Shared secret via environment variable BETTER_AUTH_SECRET

Architecture Rules:
- Monorepo structure must follow Spec-Kit layout
- Specs live in /specs/*
- Implementation must reference specs using @specs/ paths
- Frontend and backend have separate CLAUDE.md guidelines

Security Rules:
- All API endpoints must require valid JWT token
- Backend must verify JWT and extract user identity
- All database queries must be filtered by authenticated user
- No task can be accessed across users

Agent Governance Model:

Orchestrator Agent:
- Plans phases and task breakdown
- Assigns work to sub-agents
- Never writes implementation code
- Ensures all work follows specs

Sub-Agents:
- Must only operate in their domain
- Must not modify other layers
- Must not bypass specs
- Must report results back to orchestrator

Agent Domains:
- Frontend agents only modify /frontend
- Backend agents only modify /backend
- Database agents only modify schema and models
- Auth agents only modify auth flow and verification logic

Spec Compliance:
- Feature behavior must match:
  @specs/features/task-crud.md
  @specs/features/authentication.md

- API behavior must match:
  @specs/api/rest-endpoints.md

- Database schema must match:
  @specs/database/schema.md

- UI structure must match:
  @specs/ui/components.md
  @specs/ui/pages.md

Change Management:
- If requirement is unclear, update spec first
- Do not guess or invent features
- All deviations must be written into specs before implementation

Testing Expectations:
- Integration testing must validate:
  - Auth enforcement
  - User isolation
  - CRUD operations
- No feature is complete without API + DB + UI consistency

Success Criteria:
- Multi-user task system working end-to-end
- JWT-secured API with Better Auth frontend
- Persistent storage in Neon PostgreSQL
- All work traceable to specs
- Agents respected domain boundaries
- Phase II accepted without manual code edits

## Response snapshot

Created Phase II Full-Stack Todo App Constitution v1.0.0 with 10 core principles:

1. **Spec-First Development** - No implementation without approved spec
2. **Strict Agent Role Separation** - Domain boundaries enforced
3. **No Manual Human Coding** - All code by AI agents
4. **Technology Stack Compliance** - Next.js, FastAPI, Neon, Better Auth
5. **Architecture Rules** - Spec-Kit monorepo structure
6. **Security Rules** - JWT auth, user isolation, no cross-user access
7. **Agent Governance Model** - Orchestrator + sub-agent hierarchy
8. **Spec Compliance** - Implementation must match specs
9. **Change Management** - Update specs before deviating
10. **Testing Expectations** - Integration tests required

Added sections for Technology Constraints table, Architecture Rules with directory structure,
Agent Domain Boundaries matrix, and Governance with amendment process.

## Outcome

- ✅ Impact: High - Establishes foundational governance for Phase II development
- 🧪 Tests: N/A (governance document, no code tests)
- 📁 Files: 1 file modified (.specify/memory/constitution.md)
- 🔁 Next prompts: Create specs for features (task-crud, authentication), API contracts
- 🧠 Reflection: Constitution provides clear boundaries for 9 defined agents; enables parallel development

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (manual review required)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate constitution against first feature implementation
