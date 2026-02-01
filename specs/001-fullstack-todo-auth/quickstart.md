# Quickstart: Phase II Full-Stack Todo Web Application

**Feature Branch**: `001-fullstack-todo-auth`
**Date**: 2026-01-23

## Prerequisites

- Node.js 20+ (for Next.js frontend)
- Python 3.11+ (for FastAPI backend)
- Neon PostgreSQL account (free tier available)
- Git

## 1. Clone and Setup

```bash
# Clone repository
git clone <repo-url>
cd todo-phase-2

# Checkout feature branch
git checkout 001-fullstack-todo-auth
```

## 2. Environment Configuration

### Create Environment Files

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env.local
```

### Configure Neon Database

1. Create a Neon project at https://console.neon.tech
2. Copy the connection string from the dashboard
3. Add to `backend/.env`:

```env
# Pooled connection for queries
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Direct connection for migrations
DATABASE_URL_UNPOOLED=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### Configure Better Auth Secret

Generate a secure secret and add to BOTH frontend and backend:

```bash
# Generate secret
openssl rand -base64 32
```

Add to `frontend/.env.local`:
```env
BETTER_AUTH_SECRET=your-generated-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Add to `backend/.env`:
```env
BETTER_AUTH_SECRET=your-generated-secret  # Same as frontend!
```

## 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

**Verify**: Open http://localhost:8000/docs to see API documentation.

## 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Verify**: Open http://localhost:3000 to see the application.

## 5. Verify Full Stack

### Test Authentication Flow

1. Open http://localhost:3000/register
2. Create an account with email and password
3. You should be redirected to the dashboard
4. Verify you're logged in (user info displayed)

### Test Task Operations

1. Create a new task using the input form
2. Verify task appears in the list
3. Mark task as complete (toggle checkbox)
4. Edit task title
5. Delete task
6. Verify all changes persist after page refresh

### Test User Isolation

1. Create tasks with User A
2. Logout and create User B account
3. Verify User B cannot see User A's tasks

## 6. Running Tests

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Integration Tests

```bash
# Run full integration test suite
pytest tests/integration/ -v --tb=short
```

## Common Issues

### Database Connection Failed

- Verify Neon project is active (not suspended)
- Check connection string format
- Ensure SSL mode is enabled (`?sslmode=require`)

### JWT Verification Failed

- Verify `BETTER_AUTH_SECRET` is identical in frontend and backend
- Check token expiration (15 min default)
- Ensure clock sync between frontend and backend servers

### CORS Errors

- Backend should allow `http://localhost:3000` origin
- Check `CORS_ORIGINS` in backend config

## Project Structure

```
todo-phase-2/
├── frontend/                 # Next.js 16+ App
│   ├── app/                  # App Router pages
│   │   ├── (auth)/           # Auth pages (login, register)
│   │   ├── (app)/            # Protected app pages
│   │   └── api/auth/         # Better Auth API routes
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   │   ├── auth.ts           # Better Auth config
│   │   ├── auth-client.ts    # Auth client hooks
│   │   └── api/              # API client
│   └── .env.local            # Environment variables
│
├── backend/                  # FastAPI App
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   ├── core/             # Config, security
│   │   ├── models/           # SQLModel definitions
│   │   └── schemas/          # Pydantic schemas
│   ├── tests/                # Test suite
│   ├── alembic/              # Database migrations
│   └── .env                  # Environment variables
│
└── specs/                    # Specifications
    └── 001-fullstack-todo-auth/
        ├── spec.md           # Feature spec
        ├── plan.md           # Implementation plan
        ├── research.md       # Technical decisions
        ├── data-model.md     # Database schema
        └── contracts/        # API contracts
```

## API Endpoints Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/logout | Yes | Logout |
| GET | /api/todos | Yes | List tasks |
| POST | /api/todos | Yes | Create task |
| GET | /api/todos/{id} | Yes | Get task |
| PUT | /api/todos/{id} | Yes | Update task |
| DELETE | /api/todos/{id} | Yes | Delete task |
| PATCH | /api/todos/{id}/complete | Yes | Toggle complete |
| GET | /api/users/me | Yes | Get profile |

## Next Steps

After verifying the quickstart works:

1. Run `/sp.tasks` to generate implementation tasks
2. Review tasks.md for phase-by-phase breakdown
3. Begin implementation with Phase 1 (Foundation)
