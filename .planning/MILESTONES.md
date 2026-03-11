# Milestones

## v1.1 Day-scoped time in reports (Shipped: 2026-03-11)

**Phases completed:** 1 phase, 1 plan
**Files modified:** 1 (`app/(app)/reports/page.tsx` — 1 line changed)
**Timeline:** 2026-03-11 (same day)

**Key accomplishments:**
- Fixed estimate indicator sub-row in Reports to show day-specific tracked time (`task.duration`) instead of all-time cumulative (`totalTracked`)
- Color thresholds, isDone flag, and ✅/❌ icon intentionally left as all-time — correct split for planning vs completion tracking

**Archive:** `.planning/milestones/v1.1-ROADMAP.md`

---

## v1.0 Manual time log entry (Shipped: 2026-03-11)

**Phases completed:** 1 phase, 2 plans
**Files modified:** 12 (1038 insertions, 23 deletions)
**Timeline:** 2026-03-09 → 2026-03-10 (1 day)

**Key accomplishments:**
- Fixed `saveTimeLog` action to accept `duration=0` and added `revalidatePath` for cache invalidation
- Created `AddTimeLogModal` — searchable task combobox, DatePicker, optional h:mm duration field
- Created `AddTimeLogButton` client island owning modal open/close state
- Wired full E2E manual log entry flow into Reports page header
- Post-milestone quick fixes: filtered dropdown to active tasks, fixed backdrop close, replaced duration inputs with `DurationPicker` popover

**Archive:** `.planning/milestones/v1.0-ROADMAP.md`

---
