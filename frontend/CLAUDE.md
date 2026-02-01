# Frontend Agent Guidance

## Domain Boundaries

This is the **Next.js frontend** for the Phase II Todo Application.

### Allowed Paths
- `frontend/app/` - App Router pages and layouts
- `frontend/components/` - React components
- `frontend/lib/` - Utilities and API client

### Forbidden Paths
- `backend/` - Backend code (api-engineer domain)
- `specs/` - Read-only specifications

## Architecture Rules

### Authentication (Better Auth)
- Use Better Auth for all authentication
- JWT tokens are managed by Better Auth session
- Extract JWT from session for API calls

### Route Protection
- Use `middleware.ts` for route protection
- Protected routes under `(app)/` group
- Public routes under `(auth)/` group

### API Client
- Always include JWT in Authorization header
- Use typed API client from `lib/api/client.ts`
- Handle 401 responses with redirect to login

## Code Patterns

### Server Components
```typescript
// app/(app)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Server-side data fetching
}
```

### Client Components
```typescript
"use client";

import { useSession } from "@/lib/auth-client";

export function TaskList() {
  const { data: session } = useSession();
  // Client-side interactivity
}
```

### API Calls
```typescript
import { apiClient } from "@/lib/api/client";

// JWT automatically included from session
const tasks = await apiClient.get("/todos");
```

## Component Hierarchy

```
app/
├── (auth)/           # Public auth pages
│   ├── login/
│   └── register/
├── (app)/            # Protected pages
│   ├── layout.tsx    # Auth check wrapper
│   ├── dashboard/
│   └── todos/
└── api/auth/[...all]/ # Better Auth API routes
```

## Security Checklist

Before committing, verify:
- [ ] No sensitive data in client components
- [ ] Protected routes check auth in layout
- [ ] API client includes auth token
- [ ] Form inputs are validated
- [ ] Error states don't expose system details
