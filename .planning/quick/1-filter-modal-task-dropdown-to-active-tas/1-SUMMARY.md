---
phase: quick-1
plan: 1
subsystem: reports
tags: [filter, drizzle, query, ux]
dependency_graph:
  requires: []
  provides: [filtered-allTasks-query]
  affects: [AddTimeLogButton]
tech_stack:
  added: []
  patterns: [drizzle-orm-where-and]
key_files:
  created: []
  modified:
    - app/(app)/reports/page.tsx
decisions:
  - "Filter allTasks to completed=false only — completed tasks are irrelevant when logging new time entries"
metrics:
  duration: "3min"
  completed_date: "2026-03-10"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 1: Filter modal task dropdown to active tasks only Summary

**One-liner:** allTasks query in reports/page.tsx now filters WHERE completed = false, hiding completed tasks from the Add entry modal dropdown.

## What Was Done

Added `eq(tasks.completed, false)` condition to the `allTasks` query used to populate the task dropdown in the "Add entry" modal on the Reports page. The `and` and `eq` imports were already present — only the `.where()` clause was changed.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add completed = false filter to allTasks query | 8e92dba | app/(app)/reports/page.tsx |

## Verification

- Build passes: `pnpm build` exits 0
- TypeScript: no type errors
- `completedByDueDate` and `logs` queries untouched

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] `app/(app)/reports/page.tsx` modified with `eq(tasks.completed, false)` condition
- [x] Commit 8e92dba exists
- [x] Build passed (no errors)
