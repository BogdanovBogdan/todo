# Technology Stack

**Analysis Date:** 2026-03-07

## Languages

**Primary:**
- TypeScript 5.x - All source files (`.ts`, `.tsx`)

**Secondary:**
- CSS (via Tailwind v4 utility classes) - Styling

## Runtime

**Environment:**
- Node.js 22.14.0 (pinned in `.nvmrc`)

**Package Manager:**
- pnpm (configured in `package.json` with `onlyBuiltDependencies: ["esbuild"]`)
- Lockfile: present (`pnpm-lock.yaml`)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router
- React 19.2.3 - UI rendering
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS
- `@tailwindcss/postcss` 4.x - PostCSS integration (configured in `postcss.config.mjs`)

**Build/Dev:**
- Next.js dev server (`pnpm dev`)
- ESLint 9.x with `eslint-config-next` (Core Web Vitals + TypeScript rules, configured in `eslint.config.mjs`)
- TypeScript compiler (strict mode, target ES2017)

**Testing:**
- Not configured

## Key Dependencies

**Critical:**
- `next-auth` 5.0.0-beta.30 - Authentication (NextAuth v5 beta)
- `@auth/drizzle-adapter` 1.11.1 - Persists NextAuth sessions/accounts to PostgreSQL via Drizzle
- `drizzle-orm` 0.45.1 - Type-safe ORM for PostgreSQL queries
- `postgres` 3.4.8 - PostgreSQL client (used directly by Drizzle)

**UI:**
- `lucide-react` 0.575.0 - Icon library
- `react-day-picker` 9.13.2 - Date picker component

**State:**
- `zustand` 5.0.11 - Client-side state store (`lib/stores/task-store.ts`)

**Utilities:**
- `date-fns` 4.1.0 - Date formatting and manipulation
- `agentation` 2.2.1 - Purpose not surfaced in core files

**Dev:**
- `drizzle-kit` 0.31.9 - Migration generator, DB studio, schema push tool
- `dotenv` 17.3.1 - Loads `.env.local` for drizzle-kit CLI commands

## Configuration

**Environment:**
- Secrets stored in `.env.local` (not committed)
- Required vars: `DATABASE_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`
- `drizzle.config.ts` loads `.env.local` explicitly via dotenv for CLI commands

**Build:**
- `next.config.ts` - Minimal Next.js config (no custom options set)
- `tsconfig.json` - Strict TypeScript, `@/*` path alias maps to project root
- `postcss.config.mjs` - PostCSS with `@tailwindcss/postcss` plugin

## Platform Requirements

**Development:**
- Node.js 22.14.0
- PostgreSQL database (connection via `DATABASE_URL`)
- Google OAuth app credentials

**Production:**
- Node.js server (Next.js `pnpm start`)
- PostgreSQL database accessible via `DATABASE_URL`
- Google OAuth credentials in environment

---

*Stack analysis: 2026-03-07*
