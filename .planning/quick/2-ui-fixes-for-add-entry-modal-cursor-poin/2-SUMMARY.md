---
phase: quick-2
plan: 1
subsystem: reports-ui
tags: [ui, modal, cursor, accessibility, contrast]
dependency_graph:
  requires: []
  provides: [add-time-log-modal-ux-polish]
  affects: [reports-page]
tech_stack:
  added: []
  patterns: [stopPropagation on inner card not outer wrapper, Tailwind cursor-pointer, text-gray-900 for input contrast]
key_files:
  created: []
  modified:
    - app/(app)/reports/_components/add-time-log-modal.tsx
decisions:
  - stopPropagation moved to white card div — outer flex wrapper had it, swallowing all backdrop clicks
  - cursor-pointer added before disabled:cursor-not-allowed so disabled state still overrides correctly
metrics:
  duration: 5min
  completed_date: "2026-03-10"
---

# Quick Task 2: UI Fixes for Add Entry Modal Summary

**One-liner:** Five targeted CSS/structure fixes to AddTimeLogModal — backdrop click-to-close, pointer cursors on both buttons, high-contrast input text, and duration label/placeholder correction.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Fix all five UI issues in AddTimeLogModal | 2a9415e | app/(app)/reports/_components/add-time-log-modal.tsx |

## What Was Built

All five UI issues resolved in a single file edit to `add-time-log-modal.tsx`:

1. **Backdrop click-to-close (Fix 1):** `onClick={(e) => e.stopPropagation()}` was on the outer flex wrapper (`fixed inset-0 flex ...`), which caused it to swallow all click events before they could reach the backdrop div. Moved `stopPropagation` to the white card div instead — now clicks outside the card bubble up and trigger `onClose`.

2. **Close button cursor (Fix 2):** Added `cursor-pointer` to the close button (X) className.

3. **Input text contrast (Fix 3):** Added `text-gray-900` to both the task search input and the duration input className strings for dark, readable text.

4. **Save button cursor (Fix 4):** Added `cursor-pointer` to the save button, placed before `disabled:cursor-not-allowed` so the disabled override still takes effect.

5. **Duration label and placeholder (Fix 5):** Changed label from `Duration` to `Duration (optional)`. Changed placeholder from `h:mm (optional)` to `h:mm`. Duration input remains `type="text"`.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

Build passed: `pnpm build` exits 0 with all 10 pages generated successfully.

## Self-Check: PASSED

- File exists: app/(app)/reports/_components/add-time-log-modal.tsx — FOUND
- Commit 2a9415e exists — FOUND
