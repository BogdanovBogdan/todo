# Phase 1: Manual Log Entry - Research

**Researched:** 2026-03-09
**Domain:** Next.js App Router — Client Component modal form + Server Action mutation + searchable combobox
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Modal dialog opened via a "+ Add entry" text button in the Reports page header (alongside the period selector)
- Modal title: "Add report item entry"
- After saving: modal closes, Reports page refreshes to show the new entry
- No floating action button, no inline form
- Shows all tasks (both incomplete and completed) — allows logging time against finished work
- Tasks ordered alphabetically
- Searchable/filterable: user types to narrow the list (not a native browser select)
- Task is required — entry cannot be saved without selecting a task
- Single `h:mm` field (consistent with existing `EditableTaskDuration` format)
- Duration is optional — can be left blank
- When blank, entry is saved with `duration = 0`
- Placeholder text: "h:mm (optional)"
- Note: `saveTimeLog` action currently rejects `duration < 1` — needs updating to accept 0 for manual entries
- Date field only — no time-of-day field (time within a day is irrelevant for Reports grouping)
- Defaults to today's local date when modal opens
- Any date can be selected (not restricted to current viewed period)
- Implementation stores `startTime` as noon (12:00:00) of the selected date in the user's local timezone, ensuring correct period bucket regardless of UTC offset

### Claude's Discretion
- Exact styling of the modal (width, padding, button colors — follow existing app patterns)
- Form validation error display (inline vs summary)
- The searchable task input implementation (custom combobox vs library)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LOG-01 | User can open a "Add entry" form from the Reports page | Reports page header is a Server Component — button must be inside a new Client Component wrapper that owns modal open/close state |
| LOG-02 | User can select an existing task when creating a manual log entry | New `fetchAllUserTasks` Server Action needed; task list passed as prop or fetched server-side then handed to Client Component |
| LOG-03 | User can set a start date and time for the manual log entry | Existing `DatePicker` component is directly reusable; `startTime` stored as local-noon UTC via `dateStrToLocal` pattern |
| LOG-04 | User can optionally set a duration (hh:mm) for the manual entry | Duration field uses `h:mm` format; `parseEstimate` in `lib/utils/time.ts` parses `h:mm` → seconds; `saveTimeLog` must allow `duration = 0` |
| LOG-05 | Manual log entry is saved with type "stopwatch" and appears in Reports | `saveTimeLog` called with `type: "stopwatch"`; `revalidatePath("/", "layout")` already in the action triggers Reports refresh |
</phase_requirements>

---

## Summary

This phase adds a manual time-log creation form to the Reports page. All primitives are already present in the codebase: the `saveTimeLog` Server Action handles the insert, the `DatePicker` component handles date selection, and the `revalidatePath` call in the action will automatically refresh the Reports page after save.

The two non-trivial pieces are (1) lifting the "+ Add entry" button into a Client Component without breaking the Reports Server Component, and (2) implementing a searchable task combobox. The Reports page is currently a pure async Server Component — the button must be extracted into its own small Client Component (a "client island") that owns modal state. The task list for the combobox is best fetched server-side in the Reports page and passed as props to the modal, keeping the modal component props-driven and testable.

The only mutation change required is a one-line relaxation in `saveTimeLog`: change `if (data.duration < 1) return` to `if (data.duration < 0) return` so that `duration = 0` is accepted for entries where the user leaves the field blank.

**Primary recommendation:** Build a `AddTimeLogButton` Client Component island in `app/(app)/reports/_components/` that renders the "+ Add entry" button and mounts the `AddTimeLogModal` when clicked. The Reports Server Component fetches all user tasks and passes them as a prop to `AddTimeLogButton`.

---

## Standard Stack

### Core (all already installed — no new dependencies needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | Client Component modal, state, transitions | Already in project |
| Next.js Server Actions | 16.1.6 | `saveTimeLog` mutation + `revalidatePath` | Established project pattern for all writes |
| `react-day-picker` | 9.13.2 | Date field via existing `DatePicker` component | Already used project-wide |
| Tailwind CSS v4 | 4.x | Modal styling | Established project styling |

### Supporting (Claude's Discretion — searchable combobox)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Custom combobox (no library) | — | Filtered task list | Preferred: task list is simple string data, project has no headless UI dependency, custom implementation is ~40 lines |
| `@headlessui/react` combobox | latest | Accessible combobox with keyboard nav | Use only if accessibility requirements demand it — adds a dependency |

**Recommendation:** Implement a custom combobox. The task list is a flat array of `{ id, title }`. A controlled `<input>` that filters the array and renders a `<ul>` of options is sufficient and keeps the bundle lean. The `TaskModal` component in this project already manages similar floating dropdown state manually.

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended File Structure

```
app/(app)/reports/
├── page.tsx                          # Server Component — fetches tasks, passes to button
└── _components/
    ├── add-time-log-button.tsx       # NEW: Client island — owns modal open state, receives tasks as prop
    ├── add-time-log-modal.tsx        # NEW: Client Component — 3-field form, calls saveTimeLog
    ├── copy-day-button.tsx           # existing
    ├── delete-time-logs-button.tsx   # existing
    └── editable-task-duration.tsx    # existing

lib/actions/
└── time-logs.ts                      # MODIFY: relax duration guard in saveTimeLog
```

### Pattern 1: Client Island for Server Component Page Header

The Reports page is an `async` Server Component. Adding interactive state (modal open/close) requires extracting that concern into a named Client Component placed inside the page's JSX.

**What:** A small `"use client"` component that owns boolean `isOpen` state and renders both the trigger button and the modal.

**When to use:** Any time a Server Component page needs a single interactive element without converting the whole page to a Client Component.

```typescript
// app/(app)/reports/_components/add-time-log-button.tsx
"use client"

import { useState } from "react"
import { AddTimeLogModal } from "./add-time-log-modal"

interface Task {
  id: string
  title: string
}

interface Props {
  tasks: Task[]
  todayStr: string
}

export function AddTimeLogButton({ tasks, todayStr }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
      >
        + Add entry
      </button>
      {open && (
        <AddTimeLogModal
          tasks={tasks}
          todayStr={todayStr}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
```

### Pattern 2: Server Component passing data to Client Island

The Reports page already fetches tasks for its own display. A dedicated Server Action `fetchAllUserTasks` (or an inline query) provides the task list to the button component as a prop.

**What:** Fetch all user tasks alphabetically in `reports/page.tsx` and pass as `tasks` prop to `AddTimeLogButton`.

**When to use:** When a Client Component needs server-side data that its parent Server Component can cheaply fetch. Avoids client-side data fetching and keeps the Client Component pure (no direct DB access).

```typescript
// In reports/page.tsx — add fetch alongside existing queries
const allTasks = await db
  .select({ id: tasks.id, title: tasks.title })
  .from(tasks)
  .where(eq(tasks.userId, session!.user!.id!))
  .orderBy(asc(tasks.title))
```

Note: `asc` must be imported from `drizzle-orm` — it is not yet imported in `reports/page.tsx`.

### Pattern 3: startTime as local-noon UTC

The `timeLogs.startTime` column is `timestamp` (UTC). The Reports page groups logs by local date using `toLocalDateStr(log.startTime, tz)`. To ensure a manually-entered date always lands in the correct local-day bucket regardless of user UTC offset, store `startTime` as UTC noon of the selected date.

The existing `dateStrToLocal` utility in `lib/utils/tz.ts` already creates a local-noon Date:

```typescript
// lib/utils/tz.ts — dateStrToLocal (already exists)
export function dateStrToLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)  // local noon
}
```

This returns a `Date` constructed from local midnight + 12 hours. When passed to Drizzle's insert, it stores as a UTC timestamp. `toLocalDateStr` on read converts it back to local date string — it will always match the day the user selected.

**Important:** The `DatePicker` component's `onChange` callback delivers a `YYYY-MM-DD` string (via `localDateToStr`). Pass that string to `dateStrToLocal` to get the `startTime` Date for the insert.

### Pattern 4: Duration field — h:mm format

The existing `parseEstimate` utility in `lib/utils/time.ts` already parses `h:mm` → seconds:

```typescript
// lib/utils/time.ts — parseEstimate (already exists)
// Parses "1:30", "01:30" → seconds. Returns null for empty/invalid.
export function parseEstimate(input: string): number | null {
  const s = input.trim()
  if (!s) return null
  const m = s.match(/^(\d{1,2}):(\d{2})$/)
  if (m) return (parseInt(m[1]) * 60 + parseInt(m[2])) * 60
  return null
}
```

For the manual entry form: if the field is empty → `duration = 0`. If the field has a value → `parseEstimate(value) ?? 0`. Show an inline validation error if the field is non-empty but fails to parse.

### Pattern 5: saveTimeLog mutation update

The current guard `if (data.duration < 1) return` silently ignores `duration = 0`. Change to `if (data.duration < 0) return` to accept 0.

Also add `revalidatePath("/", "layout")` after the insert — **it is currently missing from `saveTimeLog`** (the other actions call it but `saveTimeLog` does not). Without this, the Reports page will not refresh after save.

```typescript
// lib/actions/time-logs.ts — saveTimeLog (modified)
export async function saveTimeLog(data: {
  taskId: string
  startTime: Date
  duration: number
  type: "pomodoro" | "stopwatch"
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (data.duration < 0) return  // changed from < 1

  await db.insert(timeLogs).values({
    taskId: data.taskId,
    userId: session.user.id,
    startTime: data.startTime,
    duration: data.duration,
    type: data.type,
  })

  revalidatePath("/", "layout")  // added — was missing
}
```

### Pattern 6: Modal structure — follow TaskModal

`app/(app)/_components/task-modal.tsx` is the project's established modal pattern:
- Fixed backdrop `div` with `bg-black/40 z-40` that closes modal on click
- Modal panel at `z-50` with `stopPropagation` to prevent backdrop click
- Desktop: centered panel with `max-w-2xl` and `max-h-[85vh]`
- Mobile: bottom sheet with `rounded-t-2xl` and `animate-slide-up`
- Close button (×) in top-right corner

For the simpler "Add entry" form, a centered panel without the mobile bottom-sheet split is acceptable (the form has only 3 fields). Follow the backdrop + panel structure but use a narrower width like `max-w-md`.

### Pattern 7: useTransition for server action calls

All Client Components in this project call Server Actions inside `startTransition`:

```typescript
// Pattern from delete-time-logs-button.tsx
const [isPending, startTransition] = useTransition()

function handleSave() {
  startTransition(async () => {
    await saveTimeLog(...)
    onClose()
  })
}
```

Disable the submit button while `isPending` is true.

### Anti-Patterns to Avoid

- **Converting reports/page.tsx to a Client Component:** The page does multiple DB queries. Keep it as a Server Component. Use the Client Island pattern instead.
- **Fetching tasks inside the modal Client Component:** No client-side data fetching library exists. Pass tasks as props from the Server Component.
- **Using a native `<select>` for task selection:** Locked decision specifies searchable/filterable combobox, not a native select.
- **Calling `router.refresh()` in the modal:** `revalidatePath` in `saveTimeLog` handles invalidation. `router.refresh()` is only needed if `revalidatePath` is not called in the action (see `delete-time-logs-button.tsx` which calls both — defensive but not necessary if action already revalidates).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date picking | Custom calendar | `DatePicker` component (`app/(app)/_components/date-picker.tsx`) | Already in the project, uses `react-day-picker` v9, handles positioning via portal |
| h:mm → seconds | Custom parser | `parseEstimate` from `lib/utils/time.ts` | Already handles `h:mm` and `hh:mm` formats, returns null for invalid |
| Local-date → UTC timestamp | Custom timezone math | `dateStrToLocal` from `lib/utils/tz.ts` | Already handles local noon, tested across the codebase |
| UTC timestamp → local date string | Custom formatting | `toLocalDateStr` from `lib/utils/tz.ts` | Used by Reports page — consistent bucketing |
| Modal backdrop + z-index | Custom approach | Follow `TaskModal` pattern verbatim | Established approach, handles mobile/desktop |
| Server action pending state | Custom loading flag | `useTransition` hook | Standard React 19 / Next.js pattern used throughout project |

---

## Common Pitfalls

### Pitfall 1: saveTimeLog missing revalidatePath

**What goes wrong:** After saving, the Reports page does not update — the new entry is invisible until the user navigates away and back.

**Why it happens:** `saveTimeLog` in `lib/actions/time-logs.ts` currently has NO `revalidatePath` call. Other actions (`updateAggregatedDuration`, `deleteTimeLogs`, etc.) do call it, but `saveTimeLog` was originally only called from the timer which uses `keepalive` fetch — cache invalidation was not needed there.

**How to avoid:** Add `revalidatePath("/", "layout")` to `saveTimeLog` as part of this phase.

**Warning signs:** Save succeeds (no error), modal closes, but entry does not appear without a hard refresh.

### Pitfall 2: UTC offset causing wrong day bucket

**What goes wrong:** User selects "March 9" but the entry appears under "March 8" or "March 10" in Reports.

**Why it happens:** If `startTime` is stored as UTC midnight (00:00:00 UTC), users west of UTC will see the log bucketed to the previous day (e.g., UTC midnight = March 8 23:00 in UTC-1).

**How to avoid:** Use `dateStrToLocal(dateStr)` which creates `new Date(y, m-1, d, 12, 0, 0)` — local noon. Local noon is always within the target calendar day across all realistic UTC offsets (UTC-12 to UTC+14).

**Warning signs:** Entry appears under wrong date, especially noticeable for users in negative UTC offsets.

### Pitfall 3: Reports page header is Server Component — can't add useState there

**What goes wrong:** Developer tries to add `useState(false)` directly to `reports/page.tsx` and gets a build error: "useState only works in Client Components."

**Why it happens:** `reports/page.tsx` is an `async function` (Server Component) and cannot use React hooks.

**How to avoid:** Extract the button + modal into `AddTimeLogButton` Client Component. The Reports Server Component renders `<AddTimeLogButton tasks={...} todayStr={todayStr} />`.

### Pitfall 4: todayStr not available in Client Component for DatePicker default

**What goes wrong:** The DatePicker in the modal defaults to `new Date()` which gives server time, not the user's local date (can be off by up to ±1 day).

**Why it happens:** `todayStr` is computed server-side in `reports/page.tsx` from the `local_today` cookie. Client Components don't have direct access to it.

**How to avoid:** Pass `todayStr` as a prop from the Server Component to `AddTimeLogButton`, which forwards it to the modal. The modal initialises the date field `useState(todayStr)`.

### Pitfall 5: Duration field accepts h:mm but EditableTaskDuration uses h:mm:ss

**What goes wrong:** User is confused by two different duration format conventions in the same Reports page.

**Why it happens:** `EditableTaskDuration` displays and edits in `h:mm:ss`. The manual entry form is locked to `h:mm` (per CONTEXT.md "consistent with EditableTaskDuration format" refers to the short estimate format in `formatEstimate`/`parseEstimate`, not the full `h:mm:ss` log display).

**How to avoid:** The manual entry field uses `h:mm` (hours:minutes only) matching `parseEstimate`. Placeholder: "h:mm (optional)". This is locked in CONTEXT.md.

### Pitfall 6: Task combobox closing behavior

**What goes wrong:** Clicking a task option closes the dropdown but then the backdrop click handler fires and closes the modal too.

**Why it happens:** Mouse event propagation from the dropdown option bubbles to the modal backdrop.

**How to avoid:** Use `stopPropagation` on the modal panel click (same pattern as `TaskModal`). The dropdown itself should close on option selection; use `onMouseDown` (not `onClick`) for outside-click detection as used in `DatePicker`.

---

## Code Examples

### Fetching all tasks for combobox in reports/page.tsx

```typescript
// Source: drizzle-orm pattern consistent with existing page queries
import { asc } from "drizzle-orm"

const allTasks = await db
  .select({ id: tasks.id, title: tasks.title })
  .from(tasks)
  .where(eq(tasks.userId, session!.user!.id!))
  .orderBy(asc(tasks.title))
```

Pass to Client Component:
```tsx
<AddTimeLogButton tasks={allTasks} todayStr={todayStr} />
```

### Custom searchable combobox (no library)

```typescript
// Pattern consistent with existing dropdown implementations (DatePicker, EstimatePicker)
const [query, setQuery] = useState("")
const [dropdownOpen, setDropdownOpen] = useState(false)
const [selectedTask, setSelectedTask] = useState<{ id: string; title: string } | null>(null)

const filtered = tasks.filter((t) =>
  t.title.toLowerCase().includes(query.toLowerCase())
)
```

Render:
```tsx
<input
  value={selectedTask ? selectedTask.title : query}
  onChange={(e) => {
    setQuery(e.target.value)
    setSelectedTask(null)
    setDropdownOpen(true)
  }}
  onFocus={() => setDropdownOpen(true)}
  placeholder="Search tasks..."
  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
/>
{dropdownOpen && filtered.length > 0 && (
  <ul className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl max-h-48 overflow-y-auto z-10">
    {filtered.map((task) => (
      <li
        key={task.id}
        onMouseDown={() => {  // onMouseDown not onClick to fire before input blur
          setSelectedTask(task)
          setQuery("")
          setDropdownOpen(false)
        }}
        className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
      >
        {task.title}
      </li>
    ))}
  </ul>
)}
```

### Calling saveTimeLog from modal

```typescript
// useTransition pattern from delete-time-logs-button.tsx
const [isPending, startTransition] = useTransition()

function handleSubmit() {
  if (!selectedTask) return  // task required

  const durationSeconds = durationStr.trim()
    ? (parseEstimate(durationStr.trim()) ?? null)
    : 0

  if (durationStr.trim() && durationSeconds === null) {
    setError("Duration must be h:mm format, e.g. 1:30")
    return
  }

  const startTime = dateStrToLocal(dateStr)  // local noon → UTC

  startTransition(async () => {
    await saveTimeLog({
      taskId: selectedTask.id,
      startTime,
      duration: durationSeconds ?? 0,
      type: "stopwatch",
    })
    onClose()
  })
}
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| `saveTimeLog` with `duration < 1` guard | Relax to `duration < 0` | Required for this phase — 0 is valid for no-duration entries |
| Reports page header: period selector only | Add "+ Add entry" button | New Client Component island in the header row |
| Task list: only fetched where needed | Add alphabetical `allTasks` fetch to Reports page | Additional DB query on Reports page load |

**No deprecated patterns to work around in this phase.**

---

## Open Questions

1. **`saveTimeLog` missing `revalidatePath` — is the existing REST endpoint (`POST /api/time-logs`) also affected?**
   - What we know: The `/api/time-logs` route is a keepalive fallback used by the timer on tab close. Adding `revalidatePath` to `saveTimeLog` won't affect the REST route (it calls the action which will now revalidate).
   - What's unclear: Whether the REST route should also revalidate (likely irrelevant — timer close is a background operation and the user won't be on Reports).
   - Recommendation: Add `revalidatePath` only to the Server Action. The REST route is a background save with no user-visible refresh expectation.

2. **`allTasks` query performance on Reports page load**
   - What we know: The query is a simple `SELECT id, title FROM tasks WHERE user_id = ?` with an ORDER BY.
   - What's unclear: User task counts. For a personal task manager they are likely small (< 1000).
   - Recommendation: Add query without worrying about pagination. If task counts become large in a future phase, add pagination then.

---

## Validation Architecture

No test suite is configured for this project (confirmed: `TESTING.md` and `STACK.md` both note testing is not set up). Validation is manual.

### Manual Validation Checklist

| REQ | Validation Step |
|-----|-----------------|
| LOG-01 | Navigate to /reports, confirm "+ Add entry" button is visible in the header row next to the period selector |
| LOG-02 | Click button, confirm modal opens titled "Add report item entry"; type in task field, confirm list filters; select a task |
| LOG-03 | Confirm date field defaults to today; change to a different date; confirm the saved entry appears under that date in Reports |
| LOG-04 | Leave duration blank, save — confirm entry is created with duration shown as "—"; enter "1:30", save — confirm 1:30:00 shown |
| LOG-05 | After save, confirm modal closes and new entry is visible in Reports under the correct day bucket |

---

## Sources

### Primary (HIGH confidence)
- Direct codebase reading: `lib/actions/time-logs.ts`, `lib/utils/tz.ts`, `lib/utils/time.ts`, `app/(app)/_components/date-picker.tsx`, `app/(app)/_components/task-modal.tsx`, `app/(app)/reports/page.tsx`, `app/(app)/reports/_components/editable-task-duration.tsx`, `app/(app)/reports/_components/delete-time-logs-button.tsx`, `db/schema.ts`
- `.planning/codebase/CONVENTIONS.md` — naming, import order, Tailwind patterns
- `.planning/codebase/STACK.md` — versions confirmed (Next.js 16.1.6, React 19.2.3, react-day-picker 9.13.2)
- `.planning/phases/01-manual-log-entry/01-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)
- No external sources required — all implementation patterns derive from existing codebase code

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project; no new dependencies
- Architecture: HIGH — patterns extracted directly from existing components in the same codebase
- Pitfalls: HIGH — `revalidatePath` omission and UTC offset issues identified by direct code reading

**Research date:** 2026-03-09
**Valid until:** Stable — Next.js App Router, Drizzle, react-day-picker APIs are stable; re-verify if major version bumps occur
