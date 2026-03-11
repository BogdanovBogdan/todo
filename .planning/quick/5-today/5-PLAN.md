---
phase: quick-5
plan: 5
type: execute
wave: 1
depends_on: []
files_modified:
  - app/(app)/today/_components/copy-tasks-button.tsx
  - app/(app)/today/_components/today-columns.tsx
autonomous: true
requirements: [QUICK-5]
must_haves:
  truths:
    - "Copied text includes estimated duration for tasks that have one set"
    - "Tasks without estimated duration copy without any duration suffix"
    - "Duration is formatted readably (e.g. 30m, 1h, 1h 30m)"
  artifacts:
    - path: "app/(app)/today/_components/copy-tasks-button.tsx"
      provides: "Updated copy logic with duration formatting"
  key_links:
    - from: "today-columns.tsx"
      to: "copy-tasks-button.tsx"
      via: "tasks prop includes estimatedDuration field"
---

<objective>
When copying today's tasks to clipboard, include the estimated duration alongside each task title.

Purpose: The clipboard output is used for daily planning notes. Missing duration means the user must manually look up estimates.
Output: Updated CopyTasksButton that formats and appends estimated duration to each task line.
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
  <name>Task 1: Include estimatedDuration in copy output</name>
  <files>app/(app)/today/_components/copy-tasks-button.tsx, app/(app)/today/_components/today-columns.tsx</files>
  <action>
Update `copy-tasks-button.tsx`:
- Change `Props` interface: `tasks: { title: string; estimatedDuration: number | null }[]`
- Add a pure helper `formatDuration(seconds: number): string` that converts seconds to a human-readable string:
  - Less than 3600 seconds: `"${Math.round(seconds / 60)}m"` (e.g. "30m")
  - 3600 or more and no remainder minutes: `"${hours}h"` (e.g. "1h")
  - 3600 or more with remainder minutes: `"${hours}h ${remainderMins}m"` (e.g. "1h 30m")
- In `handleCopy`, update the task mapping line to:
  `tasks.map((t) => t.estimatedDuration ? \`• ${t.title} [${formatDuration(t.estimatedDuration)}]\` : \`• ${t.title}\`)`

Update `today-columns.tsx`:
- The `tasks` objects from `useTaskStore` already have `estimatedDuration`. No changes needed to the data source.
- The two `CopyTasksButton` call sites pass `todayTasks` which comes from `useTaskStore` — verify TypeScript is satisfied. If the store type already includes `estimatedDuration`, no change is required. If TypeScript complains, the prop is already in the object so no additional data fetching is needed.
  </action>
  <verify>
    Run `pnpm build` — must complete with no TypeScript errors.
    Manual check: open Today page, copy tasks, paste into a text editor and confirm tasks with estimates show "[30m]" style suffix, tasks without estimates show no suffix.
  </verify>
  <done>
    Clipboard output includes duration in brackets for tasks that have an estimate. Tasks without estimate are unaffected. Build passes clean.
  </done>
</task>

</tasks>

<verification>
`pnpm build` exits 0. No TypeScript errors in modified files.
</verification>

<success_criteria>
Copying today's tasks produces lines like:
  • Write tests [45m]
  • Review PR
  • Deploy release [1h]
Tasks with no estimated duration copy without any duration annotation.
</success_criteria>

<output>
After completion, create `.planning/quick/5-today/5-SUMMARY.md`
</output>
