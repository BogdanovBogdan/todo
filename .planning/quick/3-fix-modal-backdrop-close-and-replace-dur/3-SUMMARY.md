---
task: 3
title: Fix modal backdrop close and replace duration input with h/min fields
file: app/(app)/reports/_components/add-time-log-modal.tsx
completed: 2026-03-10
commit: 746fd00
---

# Task 3: Fix Modal Backdrop Close and Replace Duration Input

One-liner: Fixed backdrop click-to-close by moving onClick to the z-50 overlay div, and replaced the h:mm text input with separate hours/minutes number inputs.

## Changes Made

### Backdrop close fix

Root cause: The modal rendered two stacked `fixed inset-0` divs. The backdrop was `z-40` with `onClick={onClose}`, but the overlay container was `z-50` covering the same area — so all clicks landed on the overlay, not the backdrop. The overlay had no click handler, so backdrop clicks did nothing.

Fix: Removed `onClick` from the backdrop div (now purely decorative). Added `onClick={onClose}` to the z-50 overlay container instead. The inner card retains `onClick={(e) => e.stopPropagation()}` to prevent card clicks from bubbling up to the overlay.

### Duration field replacement

Replaced the single `type="text"` input (h:mm format, relying on `parseEstimate`) with two `type="number"` inputs:
- Hours: `min=0`, `max=23`, placeholder "0", suffix "h"
- Minutes: `min=0`, `max=59`, placeholder "0", suffix "min"

State: `durationStr: string` replaced by `hours: string` and `minutes: string` (both default to `""`).

Submit logic: `durationSeconds = (hours || 0) * 3600 + (minutes || 0) * 60`. Empty fields treated as 0. Removed the `parseEstimate` import and the h:mm validation error path.

## Files Modified

- `app/(app)/reports/_components/add-time-log-modal.tsx`

## Commits

| Hash | Description |
|------|-------------|
| 746fd00 | fix(reports): fix modal backdrop close and replace duration input |

## Self-Check

- [x] File exists at correct path
- [x] Commit 746fd00 present in git log
- [x] `parseEstimate` import removed (no longer used)
- [x] `isPending` still used to disable Save button
- [x] Task selection and date field unchanged
