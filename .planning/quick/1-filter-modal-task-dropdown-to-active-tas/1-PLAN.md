---
phase: quick-1
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - app/(app)/reports/page.tsx
autonomous: true
requirements:
  - QUICK-1
must_haves:
  truths:
    - "The Add entry modal dropdown shows only incomplete tasks"
    - "Completed tasks do not appear in the task dropdown"
  artifacts:
    - path: "app/(app)/reports/page.tsx"
      provides: "allTasks query filtered to completed = false"
      contains: "eq(tasks.completed, false)"
  key_links:
    - from: "app/(app)/reports/page.tsx"
      to: "AddTimeLogButton tasks prop"
      via: "allTasks query result"
      pattern: "completed.*false"
---

<objective>
Filter the task dropdown in the "Add report item entry" modal to show only active (incomplete) tasks.

Purpose: Prevents clutter from completed tasks in a dropdown meant for logging new time entries.
Output: Modified allTasks query in reports/page.tsx with a WHERE completed = false condition.
</objective>

<execution_context>
@/Users/bogdan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bogdan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add completed = false filter to allTasks query</name>
  <files>app/(app)/reports/page.tsx</files>
  <action>
In the `allTasks` query (lines 109-113), change the `.where()` clause from:

```ts
.where(eq(tasks.userId, session!.user!.id!))
```

to:

```ts
.where(and(eq(tasks.userId, session!.user!.id!), eq(tasks.completed, false)))
```

The `and` and `eq` imports are already present in the file's import statement. No other changes needed — the `tasks` schema column `completed` is a boolean. Do not modify the `completedByDueDate` query or the `logs` query; only the `allTasks` query used for the modal dropdown.
  </action>
  <verify>
    <automated>pnpm build</automated>
  </verify>
  <done>allTasks query includes eq(tasks.completed, false) condition; build passes with no type errors</done>
</task>

</tasks>

<verification>
After the change: open the Reports page, click "+ Add entry", open the task dropdown. Completed tasks must not appear. Incomplete tasks must appear.
</verification>

<success_criteria>
- allTasks query filters WHERE completed = false
- Build passes (pnpm build exits 0)
- Completed tasks are absent from the Add entry modal dropdown
</success_criteria>

<output>
After completion, create `.planning/quick/1-filter-modal-task-dropdown-to-active-tas/1-SUMMARY.md`
</output>
