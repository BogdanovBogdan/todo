# Phase 1: Manual Log Entry - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a form on the Reports page to manually create time log entries. User picks an existing task, selects a date, and optionally sets a duration. Entry is saved with type "stopwatch" and appears in Reports under the correct day.

Creating new tasks, editing existing entries, or managing entry types are all out of scope.

</domain>

<decisions>
## Implementation Decisions

### Form placement
- Modal dialog opened via a "+ Add entry" text button in the Reports page header (alongside the period selector)
- Modal title: "Add report item entry"
- After saving: modal closes, Reports page refreshes to show the new entry
- No floating action button, no inline form

### Task selection
- Shows all tasks (both incomplete and completed) — allows logging time against finished work
- Tasks ordered alphabetically
- Searchable/filterable: user types to narrow the list (not a native browser select)
- Task is required — entry cannot be saved without selecting a task

### Duration input
- Single `h:mm` field (consistent with existing `EditableTaskDuration` format)
- Optional — can be left blank
- When blank, entry is saved with `duration = 0`
- Placeholder text: "h:mm (optional)"
- Note: `saveTimeLog` action currently rejects `duration < 1` — needs updating to accept 0 for manual entries

### Date field
- Date field only — no time-of-day field (time within a day is irrelevant for Reports grouping)
- Defaults to today's local date when modal opens
- Any date can be selected (not restricted to current viewed period)
- Implementation stores `startTime` as noon (12:00:00) of the selected date in the user's local timezone, ensuring correct period bucket regardless of UTC offset

### Claude's Discretion
- Exact styling of the modal (width, padding, button colors — follow existing app patterns)
- Form validation error display (inline vs summary)
- The searchable task input implementation (custom combobox vs library)

</decisions>

<specifics>
## Specific Ideas

- Button label is exactly "+ Add entry" (text only, no icon)
- The form is a 3-field form: Task, Date, Duration — in that order

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `saveTimeLog` (lib/actions/time-logs.ts): Handles insert to timeLogs table. Needs minor update to allow `duration = 0` for manual entries (currently rejects < 1)
- `DatePicker` (app/(app)/_components/date-picker.tsx): Existing date picker component, may be reusable for the date field
- `revalidatePath("/", "layout")`: Already called in mutations — Reports page will auto-refresh after insert

### Established Patterns
- Server Actions for all mutations — no REST endpoints for writes
- Client components use `useTransition` for pending state during server action calls
- Inline editing established via `EditableTaskDuration` (click-to-edit, blur-to-save)
- Tailwind v4, gray/white color scheme, `rounded-xl border border-gray-100` card style
- All actions gate on `auth()` session check

### Integration Points
- New "Add entry" button goes in Reports page header (`app/(app)/reports/page.tsx`) — needs client component wrapper or a separate header component
- The modal form will be a Client Component inside `app/(app)/reports/_components/`
- Task list for the dropdown: Reports page currently doesn't fetch all user tasks — the form component or its parent will need to fetch them (via a new Server Action or passed as props from the Reports Server Component)
- `saveTimeLog` in `lib/actions/time-logs.ts` is the mutation to call — update to allow `duration = 0`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-manual-log-entry*
*Context gathered: 2026-03-09*
