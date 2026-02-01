# Data Model: Phase II Full-Stack Todo Web Application

**Feature Branch**: `001-fullstack-todo-auth`
**Date**: 2026-01-23
**Status**: Complete

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
├─────────────────────────────────────────────────────────────┤
│ id           : UUID (PK)                                    │
│ email        : VARCHAR(255) UNIQUE NOT NULL                 │
│ name         : VARCHAR(255)                                 │
│ created_at   : TIMESTAMPTZ NOT NULL DEFAULT now()           │
│ updated_at   : TIMESTAMPTZ NOT NULL DEFAULT now()           │
├─────────────────────────────────────────────────────────────┤
│ Note: Password hash managed by Better Auth in separate      │
│ tables (user, session, account). This is the application's  │
│ view of user data synced from Better Auth.                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         TASK                                 │
├─────────────────────────────────────────────────────────────┤
│ id           : UUID (PK)                                    │
│ user_id      : UUID (FK → USER.id) NOT NULL                 │
│ title        : VARCHAR(255) NOT NULL                        │
│ completed    : BOOLEAN NOT NULL DEFAULT false               │
│ created_at   : TIMESTAMPTZ NOT NULL DEFAULT now()           │
│ updated_at   : TIMESTAMPTZ NOT NULL DEFAULT now()           │
├─────────────────────────────────────────────────────────────┤
│ Indexes:                                                    │
│   - idx_task_user_id (user_id)                              │
│   - idx_task_user_completed (user_id, completed)            │
│                                                             │
│ Constraints:                                                │
│   - fk_task_user FOREIGN KEY (user_id) REFERENCES user(id)  │
│   - chk_title_not_empty CHECK (length(trim(title)) > 0)     │
└─────────────────────────────────────────────────────────────┘
```

## Better Auth Tables (Auto-managed)

Better Auth automatically creates and manages these tables. The backend reads from them but does not write directly.

```
┌─────────────────────────────────────────────────────────────┐
│                    BETTER_AUTH.USER                          │
├─────────────────────────────────────────────────────────────┤
│ id           : TEXT (PK)                                    │
│ email        : TEXT UNIQUE NOT NULL                         │
│ name         : TEXT                                         │
│ image        : TEXT                                         │
│ created_at   : TIMESTAMPTZ                                  │
│ updated_at   : TIMESTAMPTZ                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   BETTER_AUTH.SESSION                        │
├─────────────────────────────────────────────────────────────┤
│ id           : TEXT (PK)                                    │
│ user_id      : TEXT (FK → user.id)                          │
│ token        : TEXT UNIQUE                                  │
│ expires_at   : TIMESTAMPTZ                                  │
│ created_at   : TIMESTAMPTZ                                  │
│ updated_at   : TIMESTAMPTZ                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   BETTER_AUTH.ACCOUNT                        │
├─────────────────────────────────────────────────────────────┤
│ id           : TEXT (PK)                                    │
│ user_id      : TEXT (FK → user.id)                          │
│ provider_id  : TEXT                                         │
│ account_id   : TEXT                                         │
│ password     : TEXT (hashed)                                │
│ created_at   : TIMESTAMPTZ                                  │
│ updated_at   : TIMESTAMPTZ                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Entity Definitions

### User Entity

**Purpose**: Represents an authenticated user who owns tasks.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier, matches Better Auth user.id |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| name | VARCHAR(255) | NULLABLE | Display name (optional) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Account creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last modification timestamp |

**Business Rules**:
- Email must be unique across all users
- User ID must match the ID from Better Auth (synced on first login)
- User cannot be deleted while tasks exist (or cascade delete tasks)

**Relationships**:
- One User has many Tasks (1:N)

---

### Task Entity

**Purpose**: Represents a todo item owned by a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| user_id | UUID | FK, NOT NULL | Owner reference |
| title | VARCHAR(255) | NOT NULL, CHECK | Task description |
| completed | BOOLEAN | NOT NULL, DEFAULT false | Completion status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last modification timestamp |

**Business Rules**:
- Title cannot be empty or whitespace-only
- Title maximum length: 255 characters
- Task must belong to exactly one user
- Completed defaults to false on creation
- updated_at must be refreshed on any modification

**Relationships**:
- Many Tasks belong to one User (N:1)

**Validation Rules**:
- `title`: required, min 1 char (trimmed), max 255 chars
- `completed`: boolean only (no null)
- `user_id`: must reference existing user

---

## State Transitions

### Task States

```
                    ┌──────────────┐
      create()      │              │
   ───────────────▶ │  INCOMPLETE  │
                    │ (completed   │
                    │   = false)   │
                    │              │
                    └──────┬───────┘
                           │
              toggle()     │     toggle()
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               │
    ┌──────────────┐                       │
    │              │                       │
    │   COMPLETE   │ ──────────────────────┘
    │ (completed   │
    │   = true)    │
    │              │
    └──────────────┘

    At any state:
    - edit() → title changes, state preserved
    - delete() → task removed permanently
```

---

## SQLModel Schemas

### User Schemas

```python
# Base schema (shared fields)
class UserBase(SQLModel):
    email: EmailStr
    name: str | None = None

# Response schema (API output)
class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# Table model (database)
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: list["Task"] = Relationship(back_populates="user")
```

### Task Schemas

```python
# Base schema (shared fields)
class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)

# Create schema (API input)
class TaskCreate(TaskBase):
    pass

# Update schema (API input, all optional)
class TaskUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    completed: bool | None = None

# Response schema (API output)
class TaskRead(TaskBase):
    id: uuid.UUID
    user_id: uuid.UUID
    completed: bool
    created_at: datetime
    updated_at: datetime

# Table model (database)
class Task(TaskBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: User = Relationship(back_populates="tasks")
```

---

## Database Indexes

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| task | idx_task_user_id | user_id | Fast lookup of user's tasks |
| task | idx_task_user_completed | user_id, completed | Filtered queries by completion status |
| user | (unique constraint) | email | Prevent duplicate emails |

---

## Migration Strategy

### Initial Schema Migration

1. Better Auth tables created automatically on first auth request
2. Application tables (task) created via Alembic migration
3. User sync: On first API call after login, create/update User record from JWT claims

### Migration Files

```
alembic/versions/
├── 001_create_task_table.py     # Task table with user_id FK
└── 002_add_indexes.py           # Performance indexes
```

**Note**: User table may be managed by Better Auth or synced separately. The `user_id` in Task references the Better Auth user ID.
