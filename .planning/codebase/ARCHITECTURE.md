# Architecture

**Analysis Date:** 2026-03-07

## Pattern Overview

**Overall:** Server-centric Next.js App Router with thin client state layer

**Key Characteristics:**
- Pages are async React Server Components that fetch data directly from the database using Drizzle ORM
- All mutations go through Next.js Server Actions (`"use server"`) — no REST API layer for writes
- Client state is minimal: Zustand store for tasks (optimistic UI) and React Context + `useReducer` for timer
- Cache invalidation is coarse-grained: every mutation calls `revalidatePath("/", "layout")` to purge all page caches
- No client-side data fetching library (no SWR, React Query, etc.)

## Layers

**Routing / Pages Layer:**
- Purpose: Fetch data as async server components, compose UI from client components
- Location: `app/(app)/today/page.tsx`, `app/(app)/inbox/page.tsx`, `app/(app)/timer/page.tsx`, `app/(app)/reports/page.tsx`
- Contains: Async server components that query the DB directly, pass data as props to client components
- Depends on: `db/index.ts`, `db/schema.ts`, `auth.ts`, `lib/utils/tz.ts`
- Used by: Next.js router

**Layout / Shell Layer:**
- Purpose: Auth guard, global providers, navigation chrome
- Location: `app/(app)/layout.tsx`, `app/layout.tsx`
- Contains: `TimerProvider` wrapping all authenticated routes, nav components, auth session check
- Depends on: `auth.ts`, timer context, nav components
- Used by: All `(app)` route pages

**Server Actions Layer:**
- Purpose: All data mutations — the only write path from client to database
- Location: `lib/actions/tasks.ts`, `lib/actions/time-logs.ts`, `lib/actions/users.ts`
- Contains: `"use server"` functions that authenticate, validate, mutate DB, and call `revalidatePath`
- Depends on: `db/index.ts`, `auth.ts`, `lib/utils/time.ts`
- Used by: Client components (task store, timer context, route-specific components)

**Client State Layer:**
- Purpose: Optimistic UI for tasks; persistent timer state across navigation
- Location: `lib/stores/task-store.ts` (Zustand), `app/(app)/_components/timer/timer-context.tsx` (React Context + useReducer)
- Contains: Task store dispatches optimistic updates then fires server actions; timer context manages running/paused/idle state with localStorage persistence
- Depends on: `lib/actions/tasks.ts`, `lib/actions/time-logs.ts`
- Used by: All client components within `(app)` route group

**Database Layer:**
- Purpose: Schema definition and DB client
- Location: `db/schema.ts`, `db/index.ts`
- Contains: Drizzle table definitions; postgres.js client instantiation
- Depends on: `DATABASE_URL` env var
- Used by: Server Actions, page server components

**Utility Layer:**
- Purpose: Shared pure functions
- Location: `lib/utils/time.ts`, `lib/utils/tz.ts`, `lib/types/task.ts`
- Contains: Time parsing/formatting, timezone conversion helpers, shared TypeScript interfaces
- Depends on: Nothing (pure functions)
- Used by: Pages, server actions, client components

## Data Flow

**Read Flow (Page Load):**

1. Next.js router renders the async page server component (e.g., `app/(app)/today/page.tsx`)
2. Page calls `auth()` to get the user session
3. Page reads timezone and current date from cookies set by `DateSync` client component
4. Page queries PostgreSQL directly via `db.query.*` or `db.select(...)` with Drizzle
5. Page renders `<TaskStoreInitializer tasks={...} />` to sync server data into the Zustand store
6. Page renders client components which subscribe to the Zustand store for display

**Write Flow (Mutation):**

1. Client component calls a server action (e.g., `useTaskStore.getState().toggleTask(id, true)`)
2. Zustand store applies optimistic update immediately to local state
3. Store calls the corresponding server action (e.g., `actions.toggleTask(id, completed)`)
4. Server action authenticates, validates, writes to PostgreSQL
5. Server action calls `revalidatePath("/", "layout")` to invalidate all cached pages
6. Next.js re-renders affected server components on next navigation or `router.refresh()`

**Timer State Flow:**

1. User clicks start on a task → `TimerProvider.start()` is called
2. Timer state saved to `localStorage` under key `todo_timer_session`
3. `useReducer` dispatches `START` action; `setInterval` ticks every second dispatching `TICK`
4. On stop: `saveTimeLog()` server action called to persist duration; localStorage cleared; `router.refresh()` called
5. On page reload: `useEffect` restores timer state from localStorage on mount
6. Cross-tab sync via `window.addEventListener("storage", ...)` keeps multiple tabs in sync

**Tab-close Fallback Flow:**

1. Timer is running when user closes tab
2. `fetch("/api/time-logs", { keepalive: true })` saves the log via the REST fallback endpoint
3. On next visit, `TimerProvider` detects completed/expired pomodoro in localStorage and saves the log via server action

**Timezone Sync Flow:**

1. `DateSync` client component fires on mount
2. Reads browser `Intl.DateTimeFormat().resolvedOptions().timeZone`
3. Sets cookies `local_today` (YYYY-MM-DD) and `user_tz` (IANA timezone)
4. Calls `saveUserTimezone()` server action if timezone changed
5. Server-rendered pages read these cookies to produce timezone-correct output

**State Management:**

- Task list: Zustand store (`lib/stores/task-store.ts`) — optimistic, seeded by `TaskStoreInitializer` after each RSC render
- Timer: React Context + `useReducer` in `TimerProvider` — persisted to `localStorage`
- Page data: Next.js server component cache — invalidated via `revalidatePath`
- Timezone/date: HTTP cookies (`local_today`, `user_tz`) — set client-side, read server-side

## Key Abstractions

**TaskStoreInitializer:**
- Purpose: Bridge between RSC data fetching and client-side Zustand store
- Examples: `app/(app)/_components/task-store-initializer.tsx`
- Pattern: Renders null; calls `useTaskStore.getState().setTasks(tasks)` in an effect with no dependency array so it syncs on every RSC re-render

**TimerProvider:**
- Purpose: Global timer state shared across all authenticated routes
- Examples: `app/(app)/_components/timer/timer-context.tsx`
- Pattern: React Context wrapping `(app)` layout with `useReducer` for state + localStorage for persistence + cross-tab sync via storage events

**Server Actions as the Write API:**
- Purpose: All mutations; no REST endpoints for writes (except the keepalive fallback)
- Examples: `lib/actions/tasks.ts`, `lib/actions/time-logs.ts`
- Pattern: Each action calls `auth()` first to verify session, then validates, writes DB, calls `revalidatePath`

**Zustand Task Store with Optimistic Updates:**
- Purpose: Immediate UI response without waiting for server round-trips
- Examples: `lib/stores/task-store.ts`
- Pattern: Each store method updates local state immediately, then fires the corresponding server action fire-and-forget

## Entry Points

**Root Page:**
- Location: `app/page.tsx`
- Triggers: Any visit to `/`
- Responsibilities: Immediate redirect to `/inbox`

**App Layout:**
- Location: `app/(app)/layout.tsx`
- Triggers: All authenticated routes
- Responsibilities: Auth guard (redirects to `/login` if no session), wraps children in `TimerProvider`, renders `DateSync`, `TimerNotification`, `SidebarNav`, `BottomNav`, `TimerBar`

**Middleware (Auth):**
- Location: Auth guard in `auth.config.ts` via NextAuth middleware
- Triggers: Every request (edge runtime)
- Responsibilities: Route protection — non-logged-in users redirected to `/login`; uses edge-compatible config without DB imports

**REST Fallback:**
- Location: `app/api/time-logs/route.ts`
- Triggers: `fetch` with `keepalive: true` when tab closes mid-timer
- Responsibilities: Accepts `POST` with `{taskId, startTime, duration, type}` and inserts a time log

## Error Handling

**Strategy:** Minimal — server actions throw `Error("Unauthorized")` for auth failures; client components mostly let errors surface uncaught

**Patterns:**
- Server actions check `session?.user?.id` and throw `new Error("Unauthorized")` if missing
- Server actions use early returns for invalid/empty inputs (e.g., `if (!title) return`)
- Timer localStorage operations are wrapped in try/catch with empty catch blocks to prevent storage errors from crashing the UI
- No global error boundary beyond Next.js default error pages

## Cross-Cutting Concerns

**Logging:** None — no logging framework; errors surface through Next.js default error handling
**Validation:** Inline in server actions — early returns for empty/invalid inputs; no schema validation library (no Zod)
**Authentication:** Every server action calls `auth()` from `@/auth` as its first step; the middleware handles route-level protection via `auth.config.ts`

---

*Architecture analysis: 2026-03-07*
