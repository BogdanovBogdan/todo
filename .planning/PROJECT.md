# Todo — Personal Task Manager with Time Tracking

## What This Is

Personal task management app with built-in time tracking (Pomodoro + Stopwatch). Users manage tasks across Today/Inbox views, track time against tasks, and review time logs in Reports — including manual log entry. Built for solo use with Google OAuth authentication.

## Core Value

Every minute of work is tracked and visible — tasks drive focus, time logs prove effort.

## Requirements

### Validated

- ✓ User can create, complete, and delete tasks with due dates and time estimates
- ✓ User can view tasks in Today (due today + overdue) and Inbox (all tasks) views
- ✓ User can track time against tasks via Pomodoro (25 min) and Stopwatch modes
- ✓ Timer state persists across page navigations and browser tabs
- ✓ User can view time logs grouped by day on the Timer page
- ✓ User can edit and delete time log entries
- ✓ User can view time reports grouped by period (week/month) on the Reports page
- ✓ User can copy daily summary to clipboard from Reports
- ✓ Timezone-aware date handling — dates computed from user's local timezone
- ✓ User can manually add a time log entry from the Reports page — v1.0
- ✓ Manual entry supports task selection (active tasks), start date, optional duration — v1.0
- ✓ Manually added entries saved as type "stopwatch" and appear in Reports — v1.0
- ✓ Estimate indicator in Reports log item shows day-specific tracked time vs estimate — v1.1

### Active

<!-- Next milestone scope — define with /gsd:new-milestone -->

### Out of Scope

- Free-text task name in manual log entry — only existing tasks, keeps data consistent
- Manual entry on Timer page — Reports is the natural home for log management
- Custom type selection for manual entries — stopwatch is appropriate default
- Day-specific ✅/❌ completion status — all-time progress is the right basis for task completion — v1.1

## Context

- Next.js 16 App Router, TypeScript strict, Tailwind v4, PostgreSQL + Drizzle ORM, ~4050 LOC
- All mutations via Server Actions (`lib/actions/`), no REST layer for writes
- Time logs stored in `timeLogs` table: `taskId`, `userId`, `startTime`, `duration` (seconds), `type`
- Reports page shows logs grouped by day/period with manual entry support
- `AddTimeLogModal` uses combobox pattern (onMouseDown + onBlur setTimeout 200ms) for dropdown dismiss
- `DurationPicker` popover for h:mm duration input (reimplemented from numeric inputs after quick task)

## Constraints

- **Tech stack**: Next.js Server Actions for mutations — no new REST endpoints
- **Auth**: All actions require authenticated session via `auth()` from NextAuth
- **Types**: `timeLogs.type` is `"pomodoro" | "stopwatch"` — manual entries use `"stopwatch"`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Manual log entry on Reports page | Natural home for log management; Timer is for active tracking | ✓ Good — confirmed right placement |
| Duration optional | User may not know exact duration; can edit later | ✓ Good — zero-duration entries work correctly |
| Fixed type = stopwatch | Manual entries are not pomodoro sessions | ✓ Good — consistent with existing type system |
| DurationPicker popover over numeric inputs | Better UX, consistent with EstimatePicker pattern | ✓ Good — implemented in quick-4 |
| Filter task dropdown to active tasks only | Prevent logging to completed tasks | ✓ Good — implemented in quick-1 |
| Indicator sub-row uses task.duration (day-scoped); color/icon use totalTracked (all-time) | Split makes display accurate for planning while completion status remains all-time | ✓ Good — v1.1 |

---
*Last updated: 2026-03-11 after v1.1 milestone*
