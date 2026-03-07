# Testing

**Analysis Date:** 2026-03-07

## Framework

**No test suite configured.** The project has no testing framework installed.

- No Jest, Vitest, Playwright, or any other test runner
- No test files (`*.test.ts`, `*.spec.ts`, `*.test.tsx`) anywhere in the codebase
- No test scripts in `package.json` (`pnpm test` is not defined)
- `CLAUDE.md` explicitly states: "No test suite is configured."

## Current QA Approach

Quality is ensured through:

1. **TypeScript strict mode** — `"strict": true` in `tsconfig.json` catches type errors at compile time
2. **ESLint** — `eslint-config-next/core-web-vitals` + TypeScript rules enforced via `pnpm lint`
3. **Manual testing** — dev server via `pnpm dev`
4. **Production build verification** — `pnpm build` catches build-time errors

## If Tests Were Added

The natural fit for this codebase would be:

**Unit tests** (Vitest recommended for Next.js):
- `lib/utils/time.ts` — `parseEstimate`, `formatDuration`, `formatSeconds` are pure functions, easy to unit test
- `lib/utils/tz.ts` — `getDayBoundsUTC`, `getWeekBoundsUTC` are pure functions with timezone logic
- Timer reducer in `timer-context.tsx` — `useReducer` reducer is a pure function

**Integration tests** (Vitest + testing-library):
- Server actions in `lib/actions/` — require DB mocking
- Zustand store in `lib/stores/task-store.ts` — state management logic

**E2E tests** (Playwright):
- Auth flow (Google OAuth — hard to test without mocking)
- Task CRUD (create, complete, delete)
- Timer start/stop/pomodoro flow
- Reports page time log display

## Key Testability Notes

- **Pure utilities are easily testable:** `lib/utils/time.ts` and `lib/utils/tz.ts` have no side effects
- **Server actions require DB:** All `lib/actions/*.ts` functions call the DB directly — would need either a test DB or mocking `db/index.ts`
- **Timer context is complex:** `timer-context.tsx` mixes `setInterval`, `localStorage`, storage events, and server action calls — significant mock setup required
- **Optimistic store:** `task-store.ts` is testable in isolation if `lib/actions/tasks.ts` is mocked

---

*Testing analysis: 2026-03-07*
