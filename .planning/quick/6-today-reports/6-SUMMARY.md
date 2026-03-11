---
phase: quick-6
plan: 1
subsystem: today
tags: [copy, clipboard, formatting, consistency]
dependency_graph:
  requires: []
  provides: [reports-style clipboard output from today page]
  affects: [app/(app)/today/_components/copy-tasks-button.tsx]
tech_stack:
  added: []
  patterns: [consistent dd.mm date format, completion emoji per task]
key_files:
  modified:
    - app/(app)/today/_components/copy-tasks-button.tsx
decisions:
  - Today header omits total time (⏳) because there is no aggregate tracked time on the today view — date only
metrics:
  duration: ~5 min
  completed: 2026-03-11
---

# Quick Task 6: Align Today Copy Format with Reports Style Summary

**One-liner:** Updated today's clipboard output to use dd.mm dates, [est: Xh Ym] labels, and ✅/❌ completion status — matching the reports page format exactly.

## What Was Done

Updated `CopyTasksButton` in `app/(app)/today/_components/copy-tasks-button.tsx`:

1. Widened `tasks` Props type to include `completed: boolean` — already provided by `todayTasks` (full Task objects from task store)
2. Replaced `Intl.DateTimeFormat` English locale formatting with simple `dd.mm` string splitting
3. Header changed from `📅 March 11, 2026` to `📅 11.03`
4. Per-task lines now include completion emoji (✅/❌) and `[est: Xh Ym]` label when estimate exists
5. `formatDuration` helper unchanged

## Output Format (Before vs After)

**Before:**
```
📅 March 11, 2026

• Buy groceries [30m]
• Write report
```

**After:**
```
📅 11.03

• Buy groceries [est: 30m] ❌
• Write report ✅
```

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Hash | Description |
|------|-------------|
| 12fec8a | feat(quick-6): align today copy format with reports style |

## Self-Check: PASSED

- File exists: `app/(app)/today/_components/copy-tasks-button.tsx` — confirmed
- Build: Compiled successfully with no TypeScript errors
- Commit 12fec8a — confirmed in git log
