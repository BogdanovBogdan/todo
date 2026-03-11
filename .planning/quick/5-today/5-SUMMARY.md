---
phase: quick-5
plan: 5
subsystem: today
tags: [copy, clipboard, duration, formatting]
key-files:
  modified:
    - app/(app)/today/_components/copy-tasks-button.tsx
decisions:
  - formatDuration added as pure helper inside component file — no shared utility needed for single-use case
metrics:
  duration: "5m"
  completed_date: "2026-03-11"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 5: Include Estimated Duration in Copy Output Summary

**One-liner:** Clipboard copy now appends `[30m]` / `[1h]` / `[1h 30m]` duration suffix to tasks that have an estimate set.

## What Was Done

Updated `CopyTasksButton` to:
1. Accept `estimatedDuration: number | null` on each task in the `tasks` prop.
2. Apply a pure `formatDuration(seconds)` helper: `<60m → "Xm"`, `>=1h no remainder → "Xh"`, `>=1h with remainder → "Xh Ym"`.
3. Format each task line as `• Title [duration]` when estimate exists, or `• Title` when it does not.

`today-columns.tsx` required no changes — the store tasks already carry `estimatedDuration`.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- File exists: `app/(app)/today/_components/copy-tasks-button.tsx` — FOUND
- Commit `56278ef` — FOUND
- `pnpm build` — exited 0, no TypeScript errors
