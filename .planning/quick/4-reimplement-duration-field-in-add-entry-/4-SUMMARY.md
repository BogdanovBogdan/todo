---
phase: quick
plan: "4"
subsystem: reports
tags: [ui, duration-picker, popover]
key-files:
  modified:
    - app/(app)/reports/_components/add-time-log-modal.tsx
decisions:
  - Used inline DurationPicker component matching EstimatePicker pattern exactly, including mousedown outside-click, type="time" input, Save/Clear buttons, and purple/gray color states
metrics:
  completed: "2026-03-10"
---

# Quick Task 4: Reimplement Duration Field in Add Entry Summary

Duration inputs in AddTimeLogModal replaced with a DurationPicker popover component matching the EstimatePicker pattern from task-modal.tsx.

## What Changed

Removed the two separate `type="number"` inputs (hours + minutes) along with their `hours` and `minutes` state variables. Replaced with a single `DurationPicker` component and a `durationSeconds: number` state (initialized to 0).

`DurationPicker` manages its own `open`/`inputValue` state. The trigger button shows `h:mm` formatted value or `--:--` when empty, styled gray when empty and purple when a value is set. Clicking opens an absolute-positioned popover with a `type="time"` input, Save button (parses HH:MM string to seconds), and Clear button (only shown when value > 0). Outside-click closes via mousedown listener, Enter key saves, Escape closes.

The `handleSubmit` function is unchanged — it still passes `duration: durationSeconds` to `saveTimeLog`.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `app/(app)/reports/_components/add-time-log-modal.tsx` exists and contains DurationPicker
- Commit 6058689 exists
