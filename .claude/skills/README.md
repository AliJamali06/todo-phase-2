# Skills Registry - Phase II Full-Stack Todo App

## Overview

This directory contains skill definitions for the Phase II Full-Stack Todo App. Skills are capabilities that can be assigned to agents to enable specific tasks.

## Stack

- **Frontend:** Next.js 16 App Router + Tailwind
- **Backend:** FastAPI + SQLModel
- **Database:** Neon PostgreSQL
- **Auth:** Better Auth with JWT
- **Spec:** Spec-Kit Plus

## Skill Groups

| Group | Skills Count | Directory |
|-------|--------------|-----------|
| Planning | 6 | `planning/` |
| Database | 5 | `database/` |
| Backend | 5 | `backend/` |
| Authentication | 5 | `authentication/` |
| Frontend | 5 | `frontend/` |

## Skill Definition Format

Each skill file follows this structure:

```yaml
skill_id: unique_identifier
name: Human Readable Name
group: skill_group
version: 1.0.0

purpose: |
  Description of what this skill enables

tasks:
  - Task 1 this skill enables
  - Task 2 this skill enables

agents:
  - agent_name_1
  - agent_name_2

dependencies:
  - other_skill_id (if any)

artifacts:
  inputs:
    - Input artifact types
  outputs:
    - Output artifact types
```

## Usage

Skills are referenced by agents during task execution. An agent must have a skill registered to perform tasks that require that skill's capabilities.

## Index

See `_index.yaml` for the complete skill registry.
