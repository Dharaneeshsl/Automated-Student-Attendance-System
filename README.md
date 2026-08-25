# AttendEase

AttendEase is a student attendance management app built with a **React 19** front end
and a **Cloudflare Workers + D1** backend (Hono). It covers the full attendance
lifecycle: student management, manual + simulated face-recognition attendance,
reporting, and CSV export.

## Features

- **Student management** — create, edit, deactivate (soft delete), search, and capture
  a live face photo from the device camera (stored compressed in D1).
- **Attendance tracking** — manual mark-present plus simulated face recognition,
  with per-date filtering and the ability to remove a mistaken record.
- **Reporting & CSV export** — date-range and per-student filters, attendance-rate
  summaries, and one-click CSV download.
- **Dashboard** — live statistics (total students, today, this week, attendance rate).
- **Health check** — `GET /api/health` for ops/monitoring readiness.
- **Database-level integrity** — a unique index prevents duplicate attendance per
  student per date.

## Tech stack

- Frontend: React 19, React Router 7, Tailwind CSS, Lucide icons
- Backend: Hono (runs on Cloudflare Workers)
- Database: Cloudflare D1 (SQLite)
- Validation: Zod (shared schemas between client and server)
- Tooling: Vite, Wrangler, TypeScript, ESLint

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (recommended)
- Cloudflare Wrangler CLI (bundled via devDependencies)

## Local development

```bash
npm install
npm run db:local   # apply migrations to the local D1 (Miniflare)
npm run seed:local # (optional) load demo students + attendance
npm run dev        # start the Vite dev server
```

> Note: The dev server relies on Miniflare/Cloudflare tooling. If you see
> proxy-related errors, ensure your environment allows local fetches or disable
> proxy settings for local development.

## Database setup (Cloudflare D1)

This project uses a D1 database. The id is pinned in `wrangler.jsonc`.

```bash
# Apply migrations to the local Miniflare D1
npm run db:local

# Apply migrations to the remote (production/staging) D1
npm run db:remote
```

Seed demo data (optional, idempotent — safe to run repeatedly):

```bash
npm run seed:local     # local
npm run seed:remote    # remote
```

## Scripts

```bash
npm run dev         # start Vite dev server
npm run build       # typecheck + production build
npm run lint        # lint the codebase
npm run check       # typecheck + build + wrangler dry-run deploy
npm run deploy      # deploy to Cloudflare Workers
npm run db:local    # apply D1 migrations locally
npm run db:remote   # apply D1 migrations remotely
npm run seed:local  # seed demo data locally
npm run seed:remote # seed demo data remotely
```

## Environment variables

Create a `.env` file from `.env.example` (only needed for remote deploys):

```bash
cp .env.example .env
```

| Variable                | Required | Purpose                                  |
| ----------------------- | -------- | ---------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | remote   | Cloudflare account id                    |
| `CLOUDFLARE_API_TOKEN`  | remote   | API token (Workers + D1 edit permissions)|

Local development works without any env vars.

## API endpoints

| Method | Endpoint               | Description                                        |
| ------ | ---------------------- | -------------------------------------------------- |
| GET    | `/api/health`          | Health status + timestamp                          |
| GET    | `/api/students`        | List active students                               |
| GET    | `/api/students/:id`    | Get a single student                               |
| POST   | `/api/students`        | Create a student                                   |
| PUT    | `/api/students/:id`    | Update a student                                   |
| DELETE | `/api/students/:id`    | Deactivate a student (soft delete)                 |
| GET    | `/api/attendance`      | List attendance (`date`, `date_from`, `date_to`, `student_id`) |
| POST   | `/api/attendance`      | Mark attendance                                    |
| DELETE | `/api/attendance/:id`  | Remove an attendance record                        |
| GET    | `/api/stats`           | Dashboard statistics                               |

## Deployment (Cloudflare Workers)

1. Configure `.env` with your Cloudflare credentials.
2. Deploy:

```bash
npm run deploy
```

Ensure `wrangler.jsonc` points to the correct database binding for your target
environment.

## Production-readiness checklist

- ✅ Migrations applied and DB seeded with test data
- ✅ Health check returns `status: ok`
- ✅ CRUD flows verified: students, attendance, reports
- ✅ CSV export validated
- ✅ Camera photo capture validated
- ✅ Lint and build pass
- ✅ Deploy dry-run succeeds (`npm run check`)

## Project structure

```
src/
  worker/            # Hono backend (Cloudflare Workers)
    index.ts
  react-app/         # React frontend
    pages/           # Dashboard, Students, Attendance, Reports, NotFound
    components/      # Navbar, StatsCard, RecentAttendance
  shared/            # Zod schemas + shared types
migrations/          # D1 migrations (schema + unique index)
scripts/             # seed.sql demo data
```
