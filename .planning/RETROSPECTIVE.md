# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

---

## Milestone: v1.0 — Manual time log entry

**Shipped:** 2026-03-11
**Phases:** 1 | **Plans:** 2 | **Quick tasks:** 4

### What Was Built
- `AddTimeLogModal` — searchable task combobox, DatePicker, `DurationPicker` popover
- `AddTimeLogButton` client island wired into Reports page header
- `saveTimeLog` action fixed to accept `duration=0` + `revalidatePath` for cache invalidation
- Full E2E manual log entry flow: open modal → select task → pick date → optional duration → save → appears in Reports

### What Worked
- Client island pattern (stateful island + stateless modal) kept component boundaries clean
- Server Component fetching `allTasks` and passing as props — no client-side fetching
- Combobox pattern (onMouseDown + onBlur setTimeout 200ms) — solid pattern for dropdown dismiss
- Quick tasks caught and fixed real issues post-implementation (backdrop close, duration UX, task filter)

### What Was Inefficient
- Duration field went through 2 iterations: numeric inputs → `DurationPicker` popover (quick-3 + quick-4)
- Could have planned `DurationPicker` from the start by looking at the existing `EstimatePicker` pattern
- Verification/VERIFICATION.md step was skipped — had to retroactively address in audit

### Patterns Established
- **Client island pattern:** `[Feature]Button` owns state, `[Feature]Modal` is pure presentational
- **Combobox dismiss:** `onMouseDown` on list items + `onBlur` with `setTimeout(200ms)` on input
- **DurationPicker:** PopOver-based h:mm input, consistent with `EstimatePicker` — use for any duration field

### Key Lessons
1. Check existing similar components (EstimatePicker, DatePicker) before implementing duration/date UX from scratch
2. Run `/gsd:verify-work` after phase execution — VERIFICATION.md is a useful artifact for audits
3. Quick tasks are a good safety net for catching UX issues that slip through planning

### Cost Observations
- Model: 100% sonnet (claude-sonnet-4-6)
- Sessions: ~3 (planning, execution, quick fixes)
- Notable: Phase executed in ~25 min total; quick tasks added another ~30 min of polish

---

## Milestone: v1.1 — Day-scoped time in reports

**Shipped:** 2026-03-11
**Phases:** 1 | **Plans:** 1 | **Quick tasks:** 0

### What Was Built
- Single-line fix in `app/(app)/reports/page.tsx`: `formatDuration(totalTracked)` → `formatDuration(task.duration)` in estimate indicator sub-row
- Intentional split: displayed time is day-scoped (`task.duration`), color/icon remain all-time (`totalTracked`)

### What Worked
- Minimal scope — user stated goal precisely, requirements captured in 1 REQ-ID
- No research needed — the fix was a data source correction, no domain uncertainty
- Verification score 4/4 on first pass — simple change, easy to verify

### What Was Inefficient
- Full GSD workflow (milestone → plan → execute → verify) for a 1-line change has overhead
- `/gsd:quick` would have been appropriate here instead

### Patterns Established
- **Indicator split pattern:** Display time uses day-scoped aggregate; color/completion thresholds use all-time — documented in Key Decisions

### Key Lessons
1. For single-line bug fixes, consider `/gsd:quick` over full milestone cycle
2. The existing `task.duration` was already day-scoped — it was already computed correctly, just referenced in the wrong place

### Cost Observations
- Model: 100% sonnet (claude-sonnet-4-6)
- Sessions: 1 (milestone + plan + execute in one session)
- Notable: Execution ~5 min; milestone overhead ~20 min — ratio suggests `/gsd:quick` for this class of fix

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~3 | 1 | First milestone — baseline established |
| v1.1 | 1 | 1 | Micro-fix — full pipeline overkill, use /gsd:quick next time |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 0 | manual-only | 0 |
| v1.1 | 0 | manual-only | 0 |

### Top Lessons (Verified Across Milestones)

1. Check existing patterns before implementing new UI components
2. Run verification step after each phase — don't skip it
3. Match workflow scale to task size — 1-line fixes belong in `/gsd:quick`, not full milestones
