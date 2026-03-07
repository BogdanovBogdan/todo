# Coding Conventions

**Analysis Date:** 2026-03-07

## Naming Patterns

**Files:**
- React components: PascalCase matching the exported component name (`task-item.tsx` exports `TaskItem`, `task-modal.tsx` exports `TaskModal`)
- Utility modules: kebab-case (`time.ts`, `tz.ts`, `task-store.ts`)
- Server action files: kebab-case, named by domain (`tasks.ts`, `time-logs.ts`, `users.ts`)
- Page/layout files: Next.js conventions (`page.tsx`, `layout.tsx`, `loading.tsx`)
- Route group `_components/` directories hold shared components scoped to that route group

**Functions:**
- Regular functions: camelCase (`parseEstimate`, `formatDuration`, `getDayBoundsUTC`)
- React components: PascalCase (`TaskItem`, `TaskModal`, `AddTaskForm`)
- Server actions: camelCase verbs (`createTask`, `toggleTask`, `updateTaskDueDate`, `deleteTask`)
- Zustand store methods: camelCase short verbs (`setTasks`, `addTask`, `toggleTask`)
- Private/internal helpers: camelCase (`revalidateTasks`, `persistTimer`, `clearPersistedTimer`, `calcDuration`)
- Reducer actions: SCREAMING_SNAKE_CASE action type strings (`"START"`, `"TICK"`, `"RESET"`)

**Variables:**
- camelCase throughout (`todayStr`, `dueDateStr`, `estimateStr`, `logIds`)
- Date strings as `string` type with pattern `YYYY-MM-DD` (called `*Str` suffix: `todayStr`, `startStr`, `endStr`)
- Boolean flags: `is*` prefix (`isTracking`, `isOpen`, `isDefault`)

**Types/Interfaces:**
- PascalCase interfaces (`TaskStore`, `TimerState`, `TimerContextValue`, `PersistedTimer`)
- Union types use string literals (`"pomodoro" | "stopwatch"`, `"idle" | "running" | "paused"`)
- Named type aliases in page files for local shapes (`type Period = "week" | "last-week" | "month"`, `type TaskRow`, `type DayData`)
- Schema table exports: camelCase matching table name (`tasks`, `timeLogs`, `projects`, `users`)

**Constants:**
- SCREAMING_SNAKE_CASE for module-level constants (`WORK_DURATION`, `STORAGE_KEY`, `PERIOD_LABELS`)

## Code Style

**Formatting:**
- No Prettier config detected — formatting is enforced by ESLint only
- 2-space indentation (consistent throughout)
- Double quotes for strings in TSX/TS files
- No trailing semicolons on multi-line object/array literals (they appear on single-line statements)
- Arrow functions for inline callbacks, `function` keyword for named functions within components and modules

**Linting:**
- ESLint with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Two deliberate `// eslint-disable-line react-hooks/exhaustive-deps` suppressions:
  - `app/(app)/_components/timer/timer-context.tsx:241` — mount-only effect for localStorage restore
  - `app/(app)/reports/_components/editable-task-duration.tsx:40` — intentional sync on prop change

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- Non-null assertions (`!`) used in server page components where session is guaranteed by layout auth check (e.g., `session!.user!.id!`)
- Explicit return types on utility functions (`function parseEstimate(input: string): number | null`)
- Interfaces preferred over type aliases for object shapes; type aliases used for unions and local shape declarations

## Import Organization

**Order:**
1. `"use client"` or `"use server"` directive (when present) — always the very first line
2. Framework imports (`react`, `next/*`)
3. Third-party libraries (`drizzle-orm`, `lucide-react`, `date-fns`)
4. Internal imports via `@/` alias, ordered: auth → db → lib/actions → lib/stores → lib/utils → lib/types → sibling components

**Path Aliases:**
- `@/` maps to project root (configured in `tsconfig.json`)
- All internal imports use `@/` — no relative `../` imports except within the same `_components/` folder (e.g., `./timer/timer-context`)

**No barrel files** — each module imports directly from its source file.

## Error Handling

**Server Actions:**
- Auth guard pattern: `if (!session?.user?.id) throw new Error("Unauthorized")` — thrown for security violations
- Early return for invalid input: `if (!title) return` or `if (duration < 1) return` — silent no-ops for bad data
- No try/catch in server actions — errors propagate to Next.js error boundaries

**Client Components:**
- Optimistic updates in `task-store.ts`: store mutation fires immediately, server action fires without await; failures are not rolled back automatically except in `add-task-form.tsx` which catches and reverts
- `localStorage` access always wrapped in `try {} catch {}` empty catch blocks (`timer-context.tsx`)
- `.catch(() => {})` used for fire-and-forget async calls that should not surface errors (e.g., `saveTimeLog(...).catch(() => {})` in timer restore)
- API route returns plain `Response` objects with status codes (`401`, `400`, `200`)

**Guard pattern in components:**
```typescript
if (!task) return null  // early null-return when data may be absent
```

## Logging

**No logging framework.** No `console.log`, `console.error`, or structured logging in production code. Silent failures are preferred for localStorage operations.

## Comments

**When to Comment:**
- Block separators using `// ─── Section Name ──` pattern (used extensively in `timer-context.tsx` and `db/schema.ts` to separate logical sections)
- JSDoc-style block comments (`/** ... */`) on exported utility functions explaining parameters and return values (e.g., `lib/utils/time.ts`, `lib/utils/tz.ts`)
- Inline comments for non-obvious logic (`// seconds, nullable`, `// adjusted for pauses`, `// Bumping this key forces the title input to remount`)

**JSDoc/TSDoc:**
- Single-line `/** comment */` on exported utility functions
- No `@param` or `@returns` tags — brief prose descriptions only

## Function Design

**Size:** Functions stay focused; large page components (`reports/page.tsx`) contain data-processing helpers defined at module scope above the default export.

**Parameters:**
- Simple primitives passed directly (`id: string`, `completed: boolean`)
- Object destructuring for multi-property arguments: `saveTimeLog(data: { taskId, startTime, duration, type })`
- `FormData` used for form-based server actions (`createTask(formData: FormData)`)

**Return Values:**
- Server actions return `void` (or implicitly `undefined`) on success; only `fetchTask` returns data
- Utility functions return typed values with `null` for absent/invalid results
- Components return `JSX.Element` or `null`

## Module Design

**Exports:**
- Named exports for all components, hooks, utilities, and actions
- No default exports except Next.js page/layout components (`export default async function TodayPage`)
- Context hook (`useTimer`) and provider (`TimerProvider`) co-located and exported from the same file (`timer-context.tsx`)

**Barrel Files:** None used. Import directly from source modules.

**Directive placement:**
- `"use server"` at top of all files in `lib/actions/`
- `"use client"` at top of interactive component files; server components have no directive

## Tailwind CSS Patterns

- Tailwind v4 with no `tailwind.config` file (configuration via CSS)
- Conditional class strings assembled with template literals using ternary: `` `text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-800"}` ``
- No `clsx`/`cn` utility — raw template literals for class composition
- Responsive prefixes: `md:` breakpoint used for desktop layouts (sidebar, modal)
- `animate-pulse` for live indicator dots

---

*Convention analysis: 2026-03-07*
