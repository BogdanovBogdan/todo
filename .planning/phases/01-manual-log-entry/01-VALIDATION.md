---
phase: 1
slug: manual-log-entry
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test suite configured in this project |
| **Config file** | none |
| **Quick run command** | Manual browser verification |
| **Full suite command** | Manual browser verification |
| **Estimated runtime** | ~2 minutes manual walkthrough |

---

## Sampling Rate

- **After every task commit:** Visual check in browser (`pnpm dev`)
- **After every plan wave:** Full manual checklist below
- **Before `/gsd:verify-work`:** All manual checklist items must pass
- **Max feedback latency:** One wave (~2-3 tasks)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | LOG-05 | manual | `pnpm dev` → visit /reports | ❌ manual-only | ⬜ pending |
| 1-01-02 | 01 | 1 | LOG-01 | manual | `pnpm dev` → visit /reports, check button | ❌ manual-only | ⬜ pending |
| 1-01-03 | 01 | 1 | LOG-02, LOG-03, LOG-04 | manual | `pnpm dev` → open modal, fill form | ❌ manual-only | ⬜ pending |
| 1-01-04 | 01 | 1 | LOG-01–05 | manual | `pnpm dev` → end-to-end save flow | ❌ manual-only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test framework to install. All validation is manual.

*Existing infrastructure covers all phase requirements (manual-only).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| "+ Add entry" button visible in Reports header | LOG-01 | No test suite | Navigate to /reports, confirm button appears next to period selector |
| Modal opens with title "Add report item entry" | LOG-01 | No test suite | Click button, confirm modal appears with correct title |
| Task combobox filters as user types | LOG-02 | No test suite | Type in task field, confirm list narrows; select a task |
| Date field defaults to today | LOG-03 | No test suite | Open modal, confirm date shows today's date |
| Entry saved under selected date in Reports | LOG-03 | No test suite | Pick a past date, save, navigate to that period, confirm entry appears |
| Duration blank → entry saved with "—" display | LOG-04 | No test suite | Leave duration empty, save, confirm entry shows "—" for tracked time |
| Duration "1:30" → entry shows 1h 30m | LOG-04 | No test suite | Enter "1:30", save, confirm duration shown as "1:30:00" in Reports |
| Entry appears under correct day after save | LOG-05 | No test suite | Save entry, confirm modal closes and entry is visible in Reports without page reload |
| Entry type is "stopwatch" | LOG-05 | No test suite | Check DB or confirm entry behaves like stopwatch entries (editable duration, deletable) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency acceptable (manual verification after each task)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
