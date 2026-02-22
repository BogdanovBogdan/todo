# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint

pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Apply migrations
pnpm db:push      # Push schema changes directly
pnpm db:studio    # Open Drizzle Studio GUI
```

No test suite is configured.

## Architecture

Full-stack task management app with time tracking (Pomodoro + Stopwatch), built with Next.js App Router, TypeScript, Tailwind CSS v4, PostgreSQL, and Drizzle ORM.

### Route Groups

- `app/(app)/` — Protected authenticated routes (today, inbox, timer, reports)
- `app/(auth)/` — Public auth routes (login)
- `app/api/` — API routes (NextAuth handler, time-logs fallback endpoint)

The `(app)` layout wraps all authenticated routes. The root `page.tsx` redirects to `/inbox`.

### Data Flow

All mutations use **Next.js Server Actions** (`lib/actions/tasks.ts`, `lib/actions/time-logs.ts`). After each mutation, `revalidatePath("/", "layout")` invalidates the cache. There is no client-side data fetching library — pages fetch data directly as async server components.

A single REST endpoint `POST /api/time-logs` exists as a fallback for saving time logs when the user closes the tab mid-timer (uses `fetch` with `keepalive: true`).

### Timer State

`app/(app)/_components/timer/timer-context.tsx` provides a global `TimerProvider` wrapping the `(app)` layout. It uses `useReducer` + `localStorage` for persistence across page navigations. Timer state (running/paused/idle, elapsed seconds, associated task) is shared across all routes.

### Authentication

NextAuth.js v5 beta with Google OAuth. Two config files:
- `auth.config.ts` — Edge-compatible config (used by middleware for route protection)
- `auth.ts` — Full server config with Drizzle adapter and Google provider

### Database Schema

Key app tables in `db/schema.ts`:
- `tasks` — title, description, estimatedDuration (seconds), dueDate, completed, completedAt
- `timeLogs` — taskId, userId, startTime, duration (seconds), type ("pomodoro" | "stopwatch")
- `projects` — grouping container; each user has a default project

### Path Aliases

`@/` maps to the project root (configured in `tsconfig.json`).
