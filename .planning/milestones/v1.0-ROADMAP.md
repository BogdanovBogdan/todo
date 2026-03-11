# Roadmap: Todo — Manual Time Log Entry (v1.0)

## Overview

This milestone adds manual time log entry to the Reports page. All 5 requirements form a single coherent deliverable: a form that lets the user pick a task, set a start date/time, optionally enter a duration, and save the entry as a stopwatch log.

## Milestones

- 🚧 **v1.0 Manual time log entry** - Phase 1 (in progress)

## Phases

- [x] **Phase 1: Manual Log Entry** - User can manually add a time log entry from the Reports page (completed 2026-03-09)

## Phase Details

### Phase 1: Manual Log Entry
**Goal**: User can open a form on the Reports page, fill in task, start time, and optional duration, and save a new time log entry that appears in the report
**Depends on**: Nothing (first phase)
**Requirements**: LOG-01, LOG-02, LOG-03, LOG-04, LOG-05
**Success Criteria** (what must be TRUE):
  1. User can open an "Add entry" form directly from the Reports page
  2. User can select any existing task from a dropdown when creating the entry
  3. User can set a start date and time for the entry
  4. User can leave duration blank and still save the entry successfully
  5. After saving, the new entry appears in the Reports view under the correct date, saved as type "stopwatch"
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Fix saveTimeLog action + create AddTimeLogModal Client Component
- [ ] 01-02-PLAN.md — Create AddTimeLogButton island + wire into Reports page + human verify

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Manual Log Entry | 2/2 | Complete   | 2026-03-09 |
