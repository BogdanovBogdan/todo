# Roadmap: Todo — Personal Task Manager with Time Tracking

## Milestones

- ✅ **v1.0 Manual time log entry** — Phase 1 (shipped 2026-03-11)
- 🚧 **v1.1 Day-scoped time in reports** — Phase 2 (in progress)

## Phases

<details>
<summary>✅ v1.0 Manual time log entry (Phase 1) — SHIPPED 2026-03-11</summary>

- [x] Phase 1: Manual Log Entry (2/2 plans) — completed 2026-03-09

See full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 Day-scoped time in reports (In Progress)

**Milestone Goal:** Fix the estimate indicator in Reports log items to show time tracked on the specific day, not the all-time total.

#### Phase 2: Day-scoped Estimate Indicator

**Goal**: Users see accurate daily progress in the Reports log — how much time they tracked a task on that specific day, compared to the task estimate
**Depends on**: Phase 1
**Requirements**: REP-01
**Success Criteria** (what must be TRUE):
  1. The estimate indicator below a task title in the Reports log shows tracked time for that day only, not cumulative all-time total
  2. When a task has logs on multiple days, each day's row shows only that day's tracked duration
  3. A task with zero duration logged on a given day shows 0 tracked (not a non-zero carry-forward)
  4. Percentage/bar progress reflects day-specific duration vs task estimate
**Plans**: 1 plan

Plans:
- [ ] 02-01-PLAN.md — Fix estimate indicator sub-row to use day-scoped `task.duration`

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Manual Log Entry | v1.0 | 2/2 | Complete | 2026-03-09 |
| 2. Day-scoped Estimate Indicator | v1.1 | 0/1 | Not started | - |
