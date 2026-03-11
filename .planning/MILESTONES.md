# Milestones

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
