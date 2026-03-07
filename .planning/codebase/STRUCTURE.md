# Directory Structure

**Analysis Date:** 2026-03-07

## Top-Level Layout

```
todo/
├── app/                        # Next.js App Router root
│   ├── (app)/                  # Protected route group (authenticated)
│   ├── (auth)/                 # Public route group (login)
│   ├── api/                    # REST API routes
│   ├── layout.tsx              # Root HTML shell
│   └── page.tsx                # Root redirect → /inbox
├── db/                         # Database schema and client
├── lib/                        # Shared business logic
│   ├── actions/                # Next.js Server Actions (all mutations)
│   ├── stores/                 # Zustand client stores
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Pure utility functions
├── auth.ts                     # Full NextAuth config (server, with DB adapter)
├── auth.config.ts              # Edge-compatible NextAuth config (middleware only)
├── drizzle.config.ts           # Drizzle Kit config for migrations
├── middleware.ts               # NextAuth middleware (route protection)
└── proxy.ts                    # Dev proxy helper
```

## App Directory

### Route Groups

**`app/(app)/`** — All authenticated pages
```
app/(app)/
├── _components/                # Shared components for (app) layout
│   ├── add-task-form.tsx       # Task creation form (server action)
│   ├── bottom-nav.tsx          # Mobile bottom navigation
│   ├── date-picker.tsx         # Reusable date picker component
│   ├── date-sync.tsx           # Client: syncs browser timezone to cookies
│   ├── sidebar-nav.tsx         # Desktop sidebar navigation
│   ├── task-item.tsx           # Single task row with checkbox, title, timer
│   ├── task-modal.tsx          # Task detail modal (edit title, due date, estimate)
│   ├── task-store-initializer.tsx  # RSC→Zustand bridge (seeds store from server data)
│   ├── task-title-button.tsx   # Inline editable task title
│   └── timer/
│       ├── timer-bar.tsx       # Persistent timer bar shown at bottom of layout
│       ├── timer-button.tsx    # Start/pause/stop timer button
│       ├── timer-context.tsx   # TimerProvider + useTimer hook (global timer state)
│       └── timer-notification.tsx  # Browser notification on pomodoro complete
├── inbox/
│   ├── _components/
│   │   └── inbox-task-list.tsx # Inbox task list with reorder support
│   ├── loading.tsx             # Suspense loading skeleton
│   └── page.tsx                # Inbox page (all tasks without due date)
├── reports/
│   ├── _components/
│   │   ├── copy-day-button.tsx         # Copy day summary to clipboard
│   │   ├── delete-time-logs-button.tsx # Delete time log entries
│   │   └── editable-task-duration.tsx  # Inline-editable log duration
│   ├── loading.tsx
│   └── page.tsx                # Reports page (time log summaries by period)
├── timer/
│   ├── _components/
│   │   ├── delete-log-button.tsx   # Delete a time log from timer page
│   │   ├── editable-duration.tsx   # Inline-editable duration for timer page
│   │   └── log-actions.tsx         # Action buttons for a log entry
│   ├── loading.tsx
│   └── page.tsx                # Timer page (running timer + today's logs)
├── today/
│   ├── _components/
│   │   ├── copy-tasks-button.tsx   # Copy today's tasks to clipboard
│   │   ├── reschedule-button.tsx   # Move overdue tasks to today
│   │   └── today-columns.tsx       # Two-column layout (overdue / today)
│   ├── loading.tsx
│   └── page.tsx                # Today page (tasks due today + overdue)
└── layout.tsx                  # (app) layout: auth guard + TimerProvider + nav chrome
```

**`app/(auth)/`** — Public authentication pages
```
app/(auth)/
└── login/
    └── page.tsx                # Google OAuth login page
```

**`app/api/`** — REST endpoints
```
app/api/
└── time-logs/
    └── route.ts                # POST /api/time-logs — keepalive fallback for tab-close
```

## Database (`db/`)

```
db/
├── index.ts                    # Drizzle client (postgres.js connection)
└── schema.ts                   # Table definitions: tasks, timeLogs, projects, users, accounts, sessions, verificationTokens
```

**Key tables:**
- `tasks` — `id`, `title`, `description`, `estimatedDuration` (seconds), `dueDate`, `completed`, `completedAt`, `userId`, `projectId`, `order`
- `timeLogs` — `id`, `taskId`, `userId`, `startTime`, `duration` (seconds), `type` ("pomodoro" | "stopwatch")
- `projects` — `id`, `userId`, `name`, `isDefault`

## Lib Directory (`lib/`)

```
lib/
├── actions/
│   ├── tasks.ts                # CRUD + reorder + completion server actions
│   ├── time-logs.ts            # saveTimeLog, deleteTimeLog, updateTimeLogDuration
│   └── users.ts                # saveUserTimezone
├── stores/
│   └── task-store.ts           # Zustand store: task list + optimistic mutations
├── types/
│   └── task.ts                 # TaskWithTimeLogs type (task joined with logs)
└── utils/
    ├── time.ts                 # parseEstimate, formatDuration, formatSeconds, secondsToHHMM
    └── tz.ts                   # getDayBoundsUTC, getWeekBoundsUTC (timezone-aware date math)
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth full config with Drizzle adapter + Google provider |
| `auth.config.ts` | Edge-compatible auth config for middleware (no DB) |
| `middleware.ts` | Route protection via NextAuth middleware |
| `drizzle.config.ts` | Points to `db/schema.ts`, reads `DATABASE_URL` |
| `app/(app)/layout.tsx` | Auth gate + TimerProvider + navigation shell |
| `app/(app)/_components/timer/timer-context.tsx` | Global timer state (743 lines) |
| `lib/stores/task-store.ts` | Zustand task store with optimistic updates |
| `lib/actions/tasks.ts` | All task mutations (create, update, delete, reorder) |
| `db/schema.ts` | Full database schema |

## Naming Conventions for Files/Folders

- Route group names: lowercase with hyphens (`(app)`, `(auth)`)
- `_components/` prefix: scoped shared components (not routes)
- Page files always named `page.tsx`, layouts `layout.tsx`, loading states `loading.tsx`
- Component files: kebab-case matching the primary export (`task-item.tsx` → `TaskItem`)
- Action files: kebab-case, domain-named (`time-logs.ts`, `tasks.ts`)
- Store files: kebab-case with `-store` suffix (`task-store.ts`)
- Utility files: short descriptive names (`time.ts`, `tz.ts`)

---

*Structure analysis: 2026-03-07*
