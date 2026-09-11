# ParkOps — Parking Management System

A full-stack parking lot management web app: zones and spots, vehicle
check-in/check-out with automatic fee calculation, monthly subscribers who
park for free, and revenue reports. Built as a portfolio project with
[Claude Code](https://claude.com/claude-code) as part of an AI-assisted
development workflow.

## Features

- **Auth-gated app** (NextAuth / Auth.js, credentials login, JWT sessions).
- **Zones & spots admin**: organize the facility into zones, add/remove
  individual spots, each with a type (regular, handicap, reserved,
  motorcycle).
- **Check-in / check-out**: pick a zone and a free spot is assigned
  automatically; check out by plate or from the live dashboard. The fee is
  computed from a configurable hourly rate, a grace period, and a daily cap.
- **Monthly subscribers**: vehicles on the subscriber list are recognized at
  check-in and park for free while their subscription is valid.
- **Live dashboard**: real-time occupancy per zone, and a table of currently
  parked vehicles with elapsed time and running fee ticking client-side.
- **Reports**: closed-session history (filterable by plate/date range) and a
  daily revenue chart for the last two weeks.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev), TypeScript (strict).
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) components.
- [Prisma ORM](https://www.prisma.io) — SQLite for zero-config local dev, PostgreSQL-ready for production (see below).
- [NextAuth.js / Auth.js v5](https://authjs.dev) with the Credentials provider.
- [Zod](https://zod.dev) for input validation; mutations use Next.js Server Actions.
- [Vitest](https://vitest.dev) for unit tests on the core billing logic.

## Running locally

Requires Node.js 22+.

```bash
npm install                    # also generates the Prisma client (postinstall)
cp .env.example .env          # defaults already work for local SQLite dev
npx prisma migrate dev         # creates prisma/dev.db and applies the schema
npm run seed                   # demo user, zones/spots, subscribers, history
npm run dev                    # http://localhost:3001
```

> If you ran `npm install` before pulling this fix and hit `Cannot find module '.../generated/prisma/client'`, just run `npx prisma generate` once (or `npm install` again) to fix it.

**Demo login:** `admin@parking.demo` / `admin123`

## Testing

```bash
npm test          # unit tests (fee calculation, formatting) — Vitest
npm run lint       # ESLint
npm run build      # production build / type-check
```

There's also a Playwright smoke test (`smoke-test.mjs`) that drives the
running dev server through the full flow — login, check-in, check-out,
subscriber billing, reports, and every admin page. It's a manual E2E check,
not part of `npm test`:

```bash
npm run dev &                  # in one terminal
node smoke-test.mjs            # in another, once the server is up
```

## Project structure

```
prisma/schema.prisma       Data model (SQLite locally, Postgres-ready)
prisma/seed.ts             Demo data
src/lib/parking.ts         Core fee-calculation logic (pure, unit-tested)
src/lib/actions/*          Server Actions (auth-checked mutations)
src/lib/data.ts            Read queries used by pages
src/app/(app)/*            Auth-gated pages (dashboard, reports, admin)
src/app/login              Login page
```

## Deploying to production

The app is written against SQLite for zero-config local dev, but the schema
and queries avoid SQLite-only features so switching to PostgreSQL (Supabase,
Vercel Postgres, Neon, etc.) is a small, contained change:

1. **Swap the Prisma datasource provider** in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
2. **Swap the driver adapter** in `src/lib/prisma.ts` (and `prisma/seed.ts`)
   from `@prisma/adapter-better-sqlite3` to `@prisma/adapter-pg`:
   ```ts
   import { PrismaPg } from "@prisma/adapter-pg";
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   ```
   (`npm install @prisma/adapter-pg pg`)
3. Point `DATABASE_URL` at your Postgres connection string, then run:
   ```bash
   npx prisma migrate deploy
   ```
4. Set `AUTH_SECRET` (generate with `openssl rand -base64 32`) and
   `NEXTAUTH_URL` (your production URL) as environment variables.
5. Deploy to [Vercel](https://vercel.com): connect this GitHub repo in the
   Vercel dashboard (it auto-detects Next.js), add the environment variables
   above, and deploy — or run `vercel --prod` locally with the Vercel CLI.

## License

MIT — see [LICENSE](./LICENSE).
