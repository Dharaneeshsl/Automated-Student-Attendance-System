# AttendEase

AttendEase is a student attendance management app built with a React front end and a Cloudflare Workers + D1 backend.

## Features
- Student management (create, edit, deactivate)
- Attendance tracking (manual + simulated recognition)
- Reporting and CSV exports
- Health check endpoint for ops readiness

## Prerequisites
- Node.js 18+ (recommended)
- npm 9+ (recommended)
- Cloudflare Wrangler CLI (bundled via devDependencies)

## Local Development
```bash
npm install
npm run dev
```

> Note: The dev server relies on Miniflare/Cloudflare tooling. If you see proxy-related errors, ensure your environment allows local fetches or disable proxy settings for local development.

## Database Setup (Cloudflare D1)
This project uses a D1 database. Apply migrations with Wrangler:

```bash
npx wrangler d1 migrations apply 01985c5e-bd1d-71b6-8fb3-00492bfae37b --local
```

To run against a remote D1 instance (production/staging), remove `--local` and ensure your Wrangler credentials are configured.

## Scripts
```bash
npm run dev        # start Vite dev server
npm run build      # typecheck + production build
npm run lint       # lint the codebase
npm run check      # typecheck + build + wrangler dry-run deploy
```

## API Endpoints
- `GET /api/health` — returns health status and timestamp
- `GET /api/students` — list active students
- `POST /api/students` — create student
- `PUT /api/students/:id` — update student
- `DELETE /api/students/:id` — deactivate student
- `GET /api/attendance` — list attendance (query by `date`/`student_id`)
- `POST /api/attendance` — mark attendance
- `GET /api/stats` — dashboard statistics

## Product Readiness Checklist (Recommended)
- ✅ Migrations applied and DB seeded with test data
- ✅ Health check returns `status: ok`
- ✅ CRUD flows verified: students, attendance, reports
- ✅ CSV export validated
- ✅ Lint and build pass
- ✅ Deploy dry-run succeeds (`npm run check`)

## Deployment (Cloudflare Workers)
```bash
npx wrangler deploy
```

Ensure `wrangler.jsonc` points to the correct database binding for your target environment.
