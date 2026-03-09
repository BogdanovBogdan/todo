---
phase: 01-manual-log-entry
plan: "01"
subsystem: ui
tags: [react, next.js, server-actions, forms, drizzle]

# Dependency graph
requires: []
provides:
  - saveTimeLog server action accepts duration >= 0 with revalidatePath
  - AddTimeLogModal client component with task combobox, date picker, duration field
affects:
  - 01-02 (AddTimeLogButton island mounts this modal)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server action mutation + revalidatePath('/','layout') for cache invalidation"
    - "Combobox with onBlur+setTimeout(200ms) for dropdown dismiss without killing onMouseDown"
    - "dateStrToLocal for YYYY-MM-DD string to local noon Date conversion"
    - "parseEstimate for optional h:mm -> seconds with null-means-invalid semantics"

key-files:
  created:
    - app/(app)/reports/_components/add-time-log-modal.tsx
  modified:
    - lib/actions/time-logs.ts

key-decisions:
  - "Duration guard changed from < 1 to < 0 to allow zero-duration manual entries"
  - "DatePicker reused as-is — renders as a button, not a plain input, which is acceptable for this form"
  - "Modal uses type=stopwatch for all manual entries per project decision"

patterns-established:
  - "Combobox pattern: onMouseDown on list items + onBlur setTimeout(200ms) on input"
  - "Modal error display: show error inline below the specific failing field"

requirements-completed:
  - LOG-02
  - LOG-03
  - LOG-04
  - LOG-05

# Metrics
duration: 20min
completed: 2026-03-09
---

# Phase 01 Plan 01: Fix saveTimeLog and Create AddTimeLogModal Summary

**saveTimeLog mutation fixed to accept duration=0 with cache revalidation, plus AddTimeLogModal component with task combobox, date picker, and optional h:mm duration field**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-09T16:39:35Z
- **Completed:** 2026-03-09T16:59:15Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Fixed `saveTimeLog` guard from `< 1` to `< 0` so manual entries with no duration (blank field = 0 seconds) are accepted
- Added missing `revalidatePath("/", "layout")` call after `db.insert()` so the Reports page refreshes after every manual save
- Created `AddTimeLogModal` — a full client component with a searchable task combobox, DatePicker integration, and optional h:mm duration input
- Inline validation errors for missing task selection and malformed duration format

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix saveTimeLog** - `8067594` (fix)
2. **Task 2: Create AddTimeLogModal** - `c82d94d` (feat)

## Files Created/Modified
- `lib/actions/time-logs.ts` - Duration guard relaxed to `< 0`; `revalidatePath("/", "layout")` added after insert
- `app/(app)/reports/_components/add-time-log-modal.tsx` - New client component: 3-field form exporting `AddTimeLogModal`

## Decisions Made
- `DatePicker` from `app/(app)/_components/date-picker.tsx` is a button-based calendar picker (not a plain text input). Used as-is — acceptable for this form style.
- Duration error shown below the Duration field; task error shown below the Task field — both inline.
- `onChange` on DatePicker passes `string | null`; when null (date cleared) the state falls back to `todayStr` to keep the field always valid.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `AddTimeLogModal` is ready to be mounted by the `AddTimeLogButton` island (plan 01-02)
- `saveTimeLog` correctly handles duration=0, triggers cache revalidation
- No blockers for plan 02

## Self-Check: PASSED

- FOUND: lib/actions/time-logs.ts
- FOUND: app/(app)/reports/_components/add-time-log-modal.tsx
- FOUND: .planning/phases/01-manual-log-entry/01-01-SUMMARY.md
- FOUND commit: 8067594 (fix saveTimeLog)
- FOUND commit: c82d94d (feat AddTimeLogModal)

---
*Phase: 01-manual-log-entry*
*Completed: 2026-03-09*
