# Todo — Personal Task Manager with Time Tracking

## What This Is

Personal task management app with built-in time tracking (Pomodoro + Stopwatch). Users manage tasks across Today/Inbox views, track time against tasks, and review time logs in Reports. Built for solo use with Google OAuth authentication.

## Core Value

Every minute of work is tracked and visible — tasks drive focus, time logs prove effort.

## Requirements

### Validated

<!-- Shipped and confirmed valuable — inferred from existing codebase -->

- ✓ User can create, complete, and delete tasks with due dates and time estimates
- ✓ User can view tasks in Today (due today + overdue) and Inbox (all tasks) views
- ✓ User can track time against tasks via Pomodoro (25 min) and Stopwatch modes
- ✓ Timer state persists across page navigations and browser tabs
- ✓ User can view time logs grouped by day on the Timer page
- ✓ User can edit and delete time log entries
- ✓ User can view time reports grouped by period (week/month) on the Reports page
- ✓ User can copy daily summary to clipboard from Reports
- ✓ Timezone-aware date handling — dates computed from user's local timezone

### Active

<!-- Current milestone scope -->

- [ ] User can manually add a time log entry from the Reports page
- [ ] Manual entry requires: task selection (existing tasks), start date/time
- [ ] Duration is optional when adding a manual entry
- [ ] Manually added entries are saved as type "stopwatch"

### Out of Scope

- Free-text task name in manual log entry — only existing tasks, keeps data consistent
- Manual entry on Timer page — Reports is the natural home for log management
- Custom type selection for manual entries — stopwatch is appropriate default

## Context

- Next.js 16 App Router, TypeScript strict, Tailwind v4, PostgreSQL + Drizzle ORM
- All mutations via Server Actions (`lib/actions/`), no REST layer for writes
- Time logs stored in `timeLogs` table: `taskId`, `userId`, `startTime`, `duration` (seconds), `type`
- Reports page (`app/(app)/reports/page.tsx`) already shows logs grouped by day/period
- Existing `saveTimeLog` server action in `lib/actions/time-logs.ts` handles persistence

## Constraints

- **Tech stack**: Next.js Server Actions for mutations — no new REST endpoints
- **Auth**: All actions require authenticated session via `auth()` from NextAuth
- **Types**: `timeLogs.type` is `"pomodoro" | "stopwatch"` — manual entries use `"stopwatch"`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Manual log entry on Reports page | Natural home for log management; Timer is for active tracking | — Pending |
| Duration optional | User may not know exact duration; can edit later | — Pending |
| Fixed type = stopwatch | Manual entries are not pomodoro sessions | — Pending |

---
*Last updated: 2026-03-09 — Milestone v1.0 started (manual time log entry)*
