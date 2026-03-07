# Codebase Concerns

**Analysis Date:** 2026-03-07

## Tech Debt

**No middleware authentication — auth bypass risk:**
- Issue: `proxy.ts` exports a `proxy` function that does nothing (calls `NextResponse.next()` unconditionally). This is not used as the actual Next.js middleware. Auth is enforced only in the `(app)` layout server component (`app/(app)/layout.tsx`). API routes that exist outside the `(app)` layout (e.g., hypothetical future routes) would not be protected at the edge.
- Files: `proxy.ts`, `app/(app)/layout.tsx`, `auth.config.ts`
- Impact: The NextAuth `authorized` callback in `auth.config.ts` is never wired up to a real middleware file. Any route added outside `(app)` is publicly accessible by default. The existing API route at `app/api/time-logs/route.ts` does re-check session, but edge-level redirect-to-login is absent.
- Fix approach: Rename `proxy.ts` to `middleware.ts` (or create `middleware.ts`) that calls `auth(authConfig)` from `next-auth/middleware`, wiring the `authorized` callback. Alternatively, keep layout-level guards and ensure every API route does its own session check.

**Optimistic task ID mismatch (temp ID never reconciled):**
- Issue: `AddTaskForm` creates a task optimistically with a client-generated `tempId = crypto.randomUUID()`. On success the server inserts the real task with its own DB-generated UUID. The temp task is never replaced with the real task — it just stays in the Zustand store until the next RSC revalidation overwrites it via `TaskStoreInitializer`.
- Files: `app/(app)/_components/add-task-form.tsx`, `app/(app)/_components/task-store-initializer.tsx`
- Impact: Between task creation and the next navigation/render, the temp task has a fake ID. If the user tries to start a timer, open the modal, or toggle the temp task before revalidation completes, the action will 404 on the server.
- Fix approach: Return the real task from `createTask` server action, then call `addTask` with the real object after the server call resolves.

**Zustand store not scoped to user — multi-tab/multi-account risk:**
- Issue: `useTaskStore` in `lib/stores/task-store.ts` is a module-level singleton. Switching accounts without a hard reload would leave stale tasks from the previous session visible.
- Files: `lib/stores/task-store.ts`, `app/(app)/_components/task-store-initializer.tsx`
- Impact: Low risk for a single-user personal app; becomes a bug if Google OAuth allows fast account switching.
- Fix approach: Reset store on auth change or scope store per userId.

**`projects` table exists but is unused:**
- Issue: `db/schema.ts` defines a `projects` table and `tasks.projectId` foreign key, but no code reads, writes, or filters by project. The column always stores `null`.
- Files: `db/schema.ts`
- Impact: Dead schema weight. Any future project feature must account for existing tasks with `projectId = null`.
- Fix approach: Either remove the table/column (migration required) or implement the feature.

**`formatDuration` duplicated across three files:**
- Issue: The `h:mm:ss` formatter appears independently in `app/(app)/reports/page.tsx`, `app/(app)/timer/page.tsx`, and `app/(app)/reports/_components/editable-task-duration.tsx`.
- Files: `app/(app)/reports/page.tsx`, `app/(app)/timer/page.tsx`, `app/(app)/reports/_components/editable-task-duration.tsx`
- Impact: Any change to duration formatting must be made in three places.
- Fix approach: Extract to `lib/utils/time.ts` alongside existing time utilities.

**`formatDate` in `task-item.tsx` computes "today" relative to browser clock:**
- Issue: Uses `new Intl.DateTimeFormat("en-CA").format(new Date())` instead of the authoritative `local_today` cookie set by `DateSync`. These can diverge when the cookie has not yet been set or is stale (e.g., the day ticks over while the app is open).
- Files: `app/(app)/_components/task-item.tsx`
- Impact: "Today" / "Tomorrow" / "Yesterday" labels can be wrong for up to ~24 hours after a day boundary.
- Fix approach: Thread `todayStr` from the server component into `TaskItem`.

**`tz.ts` uses `ru-RU` locale for `formatInTz`:**
- Issue: `lib/utils/tz.ts` uses `"ru-RU"` locale in `new Intl.DateTimeFormat("ru-RU", ...)`. This produces Cyrillic weekday abbreviations (пн, вт, ср…) visible to all users in reports.
- Files: `lib/utils/tz.ts`
- Impact: Incorrect locale for non-Russian users. Development artifact.
- Fix approach: Change `"ru-RU"` to `"en-US"`.

**Timer aria-label in Russian:**
- Issue: `app/(app)/_components/task-item.tsx` has `aria-label="Остановить таймер"` and `aria-label="Запустить таймер"` while all other aria-labels are in English.
- Files: `app/(app)/_components/task-item.tsx`
- Fix approach: Change to `"Stop timer"` / `"Start timer"`.

## Security Considerations

**No input length limits on task titles or descriptions:**
- Risk: `createTask`, `updateTaskTitle`, `updateTaskDescription` accept free-form text with no maximum length. The DB column is `text` (unbounded).
- Files: `lib/actions/tasks.ts`
- Recommendations: Add `MAX_TITLE_LENGTH` (e.g., 500 chars) and `MAX_DESCRIPTION_LENGTH` (e.g., 10,000 chars) guards.

**Keepalive endpoint does not verify `taskId` ownership:**
- Risk: `POST /api/time-logs` inserts a time log for any `taskId` in the body. A user knowing another user's `taskId` UUID can log time against it (attributed to their own userId but referencing a foreign task).
- Files: `app/api/time-logs/route.ts`
- Recommendations: Add a query to confirm `tasks.userId === session.user.id` before inserting.

**`rescheduleOverdueTasks` uses a client-supplied date string as the filter:**
- Risk: `todayStr` is passed in from the client and used in a `lt(tasks.dueDate, todayStr)` DB filter. A user could pass `"2099-01-01"` to reschedule all future tasks.
- Files: `lib/actions/tasks.ts`, `app/(app)/today/_components/reschedule-button.tsx`
- Recommendations: Compute `todayStr` server-side from the `local_today` cookie rather than accepting it from the caller.

**`DATABASE_URL` crash risk at startup:**
- Risk: `db/index.ts` uses `process.env.DATABASE_URL!` with a non-null assertion. Missing env var throws with an unhelpful error.
- Files: `db/index.ts`
- Recommendations: Add explicit guard: `if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")`.

## Performance Bottlenecks

**Timer page loads up to 500 time log rows unconditionally:**
- Problem: `app/(app)/timer/page.tsx` fetches `.limit(500)` rows regardless of `daysToShow` (default: 3). Client-side pagination operates on a pre-fetched result set.
- Files: `app/(app)/timer/page.tsx`
- Improvement: Add a date-range `WHERE` clause scoped to the visible window.

**Reports page executes 3 sequential DB queries:**
- Problem: Three independent `await db...` calls are not parallelized.
- Files: `app/(app)/reports/page.tsx`
- Improvement: Use `Promise.all([...])` for the first two queries.

**`getTaskTrackedTime` fires on every `TaskModal` open:**
- Problem: Each modal open fires a server action DB call with no caching.
- Files: `app/(app)/_components/task-modal.tsx`, `lib/actions/time-logs.ts`
- Improvement: Include aggregated `trackedTime` in the task query from server render.

**`TaskStoreInitializer` runs `setTasks` on every render:**
- Problem: `useEffect` with no dependency array runs after every render, overwriting optimistic state.
- Files: `app/(app)/_components/task-store-initializer.tsx`
- Improvement: Compare by length + latest `updatedAt` and only call `setTasks` when data actually changes.

## Fragile Areas

**Timer state is all client-side; paused timers have no keepalive path:**
- Files: `app/(app)/_components/timer/timer-context.tsx`, `app/api/time-logs/route.ts`
- Why fragile: Running timers save via `fetch keepalive` on tab close. Paused timers have no keepalive — session restores on next visit but no log is saved until `stop()` is explicitly called.
- Safe modification: Test the tab-close path for both running and paused states. The `PersistedTimer` shape must remain stable across deployments.

**Cross-tab timer sync can produce duplicate logs:**
- Files: `app/(app)/_components/timer/timer-context.tsx`
- Why fragile: If two tabs both call `stop()` before one receives the storage event, two time logs are saved for the same session. No lock mechanism in localStorage.

**`updateAggregatedDuration` silently clamps on bad input:**
- Files: `lib/actions/time-logs.ts`
- Why fragile: If `newTotal < sumOfOthers`, result is clamped to 1 second rather than surfacing an error. UI shows a duration that doesn't match what the user typed.
- Safe modification: Return an error state to the client when new total is less than immutable sum of other logs.

## Dependencies at Risk

**`next-auth` 5.0.0-beta.30:**
- Risk: Pre-release beta. APIs may change before stable release; breaking changes between minor beta versions are common.
- Migration plan: Pin to exact version. Review changelog carefully before upgrading to stable.

**`next` 16.1.6:**
- Risk: Very recent major version. The `next-auth` beta may not be fully compatible across all edge cases.

## Missing Critical Features

**No error boundaries:**
- Problem: No React error boundaries exist. If any client component throws, the entire app unmounts.

**No loading state for most task store mutations:**
- Problem: `toggleTask`, `updateTitle`, `updateDueDate` etc. silently fail if the network is down. Only `AddTaskForm` has failure recovery.

## Test Coverage Gaps

**Entire codebase has no tests:**
- Risk: All logic — server actions, timer state machine, timezone utilities, report aggregation — is unverified.
- Priority areas: `lib/utils/tz.ts` (timezone math powers all date grouping), timer reducer in `timer-context.tsx` (significant branching), `rescheduleOverdueTasks` (data integrity risk).

---

*Concerns audit: 2026-03-07*
