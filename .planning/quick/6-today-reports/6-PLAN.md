---
phase: quick-6
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - app/(app)/today/_components/copy-tasks-button.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Copied text from today page uses dd.mm date format matching reports"
    - "Each task line shows completion status (checkmark or cross)"
    - "Estimated duration is shown as est: Xh Ym in parentheses"
  artifacts:
    - path: "app/(app)/today/_components/copy-tasks-button.tsx"
      provides: "Updated copy format aligned with reports style"
  key_links:
    - from: "today-columns.tsx"
      to: "copy-tasks-button.tsx"
      via: "todayTasks prop (includes completed field)"
      pattern: "tasks={todayTasks}"
---

<objective>
Align the text copied from the Today page to match the format used on the Reports page.

Purpose: Consistent clipboard output regardless of where the user copies from — same date style, same per-task structure.
Output: Updated copy-tasks-button.tsx with reports-style formatting.
</objective>

<execution_context>
@/Users/bogdan/.claude/get-shit-done/workflows/execute-plan.md
@/Users/bogdan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/(app)/today/_components/copy-tasks-button.tsx
@app/(app)/reports/_components/copy-day-button.tsx
</context>

<interfaces>
<!-- Current CopyTasksButton Props -->
interface Props {
  tasks: { title: string; estimatedDuration: number | null }[]
  todayStr: string  // YYYY-MM-DD
}

<!-- Reports CopyDayButton output format (target style) -->
// Header:  📅 11.03 | ⏳ 3h 45m
// Per task: • Task title [est: 2h 30m] ✅
//           • Task title 2 ❌

<!-- Task store Task type has `completed: boolean` field -->
<!-- today-columns.tsx passes `todayTasks` which are full Task objects, so `completed` is available -->
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Update CopyTasksButton to use reports-style format</name>
  <files>app/(app)/today/_components/copy-tasks-button.tsx</files>
  <action>
Update the Props interface and handleCopy logic:

1. Widen the `tasks` type to include `completed: boolean`:
   ```ts
   tasks: { title: string; estimatedDuration: number | null; completed: boolean }[]
   ```

2. Change date formatting from full English ("March 11, 2026") to `dd.mm` style matching reports:
   ```ts
   const [, mm, dd] = todayStr.split('-')
   const dateFormatted = `${dd}.${mm}`
   ```
   Remove the `Intl.DateTimeFormat` block — it is no longer needed.

3. Update the header line to match reports format — no total time (today has no aggregate tracked time), just the date:
   ```ts
   `📅 ${dateFormatted}`
   ```

4. Update per-task line format to include completion status and estimate label:
   ```ts
   const status = t.completed ? '✅' : '❌'
   const estimatePart = t.estimatedDuration
     ? ` [est: ${formatDuration(t.estimatedDuration)}]`
     : ''
   return `• ${t.title}${estimatePart} ${status}`
   ```

Keep the `formatDuration` helper unchanged. Keep the empty-tasks guard and button JSX unchanged.
  </action>
  <verify>
Open /today in the browser, copy tasks, paste — verify output looks like:
```
📅 11.03

• Buy groceries [est: 30m] ❌
• Write report ✅
```
  </verify>
  <done>
Clipboard text from today page uses dd.mm date, shows ✅/❌ per task, shows est: label for estimates — matching reports style.
  </done>
</task>

</tasks>

<verification>
Manual smoke test: visit /today, click Copy, paste into a text editor and confirm format matches reports output style (dd.mm date, completion emoji, est: label).
</verification>

<success_criteria>
Copied text from today and reports pages share the same visual language — same date format, same per-task structure with completion status and estimate callout.
</success_criteria>

<output>
After completion, create `.planning/quick/6-today-reports/6-SUMMARY.md`
</output>
