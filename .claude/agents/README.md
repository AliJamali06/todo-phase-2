# Agents Registry - Phase II Full-Stack Todo App

## Overview

This directory contains agent definitions for the Phase II Full-Stack Todo App. Each agent has specific responsibilities and is assigned skills from `.claude/skills/` to accomplish its tasks.

## Stack

- **Frontend:** Next.js 16 App Router + Tailwind
- **Backend:** FastAPI + SQLModel
- **Database:** Neon PostgreSQL
- **Auth:** Better Auth with JWT
- **Spec:** Spec-Kit Plus

## Agent Categories

| Category | Agents | Purpose |
|----------|--------|---------|
| Main | 1 | Orchestration and coordination |
| Backend | 3 | API, ORM, and database work |
| Auth | 2 | Authentication and JWT handling |
| Frontend | 2 | UI and API client work |
| Testing | 1 | Integration testing |

## Agent Hierarchy

```
phase2-orchestrator (Main)
├── Backend
│   ├── api-engineer
│   ├── orm-engineer
│   └── db-architect
├── Auth
│   ├── auth-specialist
│   └── jwt-bridge-agent
├── Frontend
│   ├── ui-engineer
│   └── api-client-agent
└── Testing
    └── integration-tester
```

## Agent Definition Format

Each agent file follows this structure:

```yaml
agent_id: unique_identifier
name: Human Readable Name
category: agent_category
version: 1.0.0

role: |
  Brief description of the agent's role

responsibilities:
  - Responsibility 1
  - Responsibility 2

skills:
  - skill_id_1
  - skill_id_2

coordination:
  reports_to: parent_agent_id
  collaborates_with: [agent_id_1, agent_id_2]

boundaries:
  can_do:
    - Permitted actions
  cannot_do:
    - Restricted actions
```

## Coordination Model

1. **Orchestrator** receives tasks and decomposes them
2. **Orchestrator** delegates to specialized agents
3. **Specialized agents** execute using assigned skills
4. **Agents** report completion back to orchestrator
5. **Orchestrator** coordinates handoffs between agents

## Index

See `_index.yaml` for the complete agent registry.
