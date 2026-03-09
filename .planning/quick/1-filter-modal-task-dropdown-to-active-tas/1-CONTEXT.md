# Quick Task 1: Filter modal task dropdown to active tasks only - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Task Boundary

In the "Add report item entry" modal, the task dropdown should only show active (incomplete) tasks. Currently the Reports page fetches all tasks including completed ones and passes them to AddTimeLogButton. Change the query to filter WHERE completed = false.

</domain>

<decisions>
## Implementation Decisions

### Task filter
- Show only tasks where `completed = false`
- No dueDate restriction — include all incomplete tasks regardless of due date

### Claude's Discretion
- Whether to update the existing `allTasks` query in `reports/page.tsx` or add a separate query
- No UI changes needed — just the data source

</decisions>

<specifics>
## Specific Ideas

No specific requirements — straightforward filter addition to the existing query.

</specifics>
