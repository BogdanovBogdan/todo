# External Integrations

**Analysis Date:** 2026-03-07

## APIs & External Services

**OAuth Identity:**
- Google OAuth 2.0 - User sign-in via Google account
  - SDK/Client: `next-auth/providers/google` (in `auth.ts`)
  - Auth: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` env vars
  - Flow: NextAuth v5 handles the OAuth dance; tokens stored in `accounts` table

## Data Storage

**Databases:**
- PostgreSQL - Primary and only data store
  - Connection: `DATABASE_URL` env var
  - Client: `postgres` npm package (raw connection in `db/index.ts`)
  - ORM: Drizzle ORM (`drizzle-orm/postgres-js`) wrapping the postgres client
  - Schema definition: `db/schema.ts`
  - Migrations output: `drizzle/` directory
  - Tables: `users`, `accounts`, `sessions`, `verification_tokens` (NextAuth), `projects`, `tasks`, `time_logs` (app)

**File Storage:**
- None - No file or object storage integration

**Caching:**
- None - Next.js built-in fetch cache only; no Redis or external cache

## Authentication & Identity

**Auth Provider:**
- NextAuth.js v5 beta (Google OAuth only)
  - Edge-compatible config: `auth.config.ts` (used in `middleware.ts` for route protection)
  - Full server config: `auth.ts` (includes Drizzle adapter, Google provider, session callback)
  - Session persistence: Database sessions via `@auth/drizzle-adapter`
  - Route handler: `app/api/auth/[...nextauth]/route.ts`
  - Session callback adds `user.id` to session object for use in server actions

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Console only (no structured logging integration)

## CI/CD & Deployment

**Hosting:**
- Not specified in codebase configuration

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
- `AUTH_SECRET` - NextAuth secret for signing tokens/cookies

**Secrets location:**
- `.env.local` file (present but not committed; loaded by dotenv in `drizzle.config.ts` for CLI and by Next.js runtime for the app)

## Webhooks & Callbacks

**Incoming:**
- `POST /api/time-logs` - Keepalive fallback endpoint for saving time logs when user closes tab mid-timer (`app/api/time-logs/route.ts`). Called with `fetch(..., { keepalive: true })` from the timer context.
- `GET|POST /api/auth/[...nextauth]` - NextAuth OAuth callback handler (`app/api/auth/[...nextauth]/route.ts`)

**Outgoing:**
- None - No outgoing webhooks configured

---

*Integration audit: 2026-03-07*
