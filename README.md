# OneAtlas.dev

An AI model discovery directory built with Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

## Project structure

```text
oneatlas/
├── src/app/                      Thin Next.js page and API routing entry points
├── src/frontend/                 All page UI, components, feature logic, and browser API clients
├── src/backend/
│   ├── auth/                     Signed admin sessions and shared rate limiting
│   ├── controllers/              HTTP request and response handling by feature
│   ├── services/                 Catalog, provider, and ranking business logic
│   ├── repositories/             Prisma database queries
│   ├── validation/               API payload validation
│   └── database/                 Prisma client setup
├── src/shared/types/             Data contracts shared by frontend and backend
├── src/generated/prisma/          Generated Prisma Client (ignored by Git)
├── prisma/                        Schema, migrations, and seed data
└── public/                         Static assets
```

## Request flow

Frontend feature → browser API client → thin Next.js route → backend controller → service → repository → Prisma → PostgreSQL.

Next.js requires route entry files under `src/app`. Those files only connect URLs to controllers; UI code belongs in `src/frontend`, and server logic belongs in `src/backend`.

## Features

- Search and category filters on the model directory
- Keyboard search shortcut (`Ctrl+K` / `⌘K`) and a retry action when catalog loading fails
- Model detail pages at `/models/[slug]`
- Side-by-side comparison for up to three models at `/compare`
- Provider directory at `/providers` and provider pages at `/providers/[slug]`
- Category-filtered model rankings at `/rankings`
- Editable OneAtlas editorial scores (0–100) in the catalog admin
- Catalog management screen at `/admin` with secure admin sessions
- Public model reads and protected catalog write endpoints

## Local development

1. Create `.env` in the project root and set `DATABASE_URL` to your PostgreSQL connection string. Keep `.env` local; Git ignores it.
2. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD` (at least 12 characters), and `ADMIN_SESSION_SECRET` (at least 32 characters) in `.env`.
3. Install dependencies with `npm install` and start with `npm run dev`.

Sign in at `/admin`. The server issues an eight-hour HttpOnly, same-site cookie; the password is never kept in the page or sent with catalog changes. Login and write requests are same-origin checked and rate-limited using PostgreSQL buckets keyed by a keyed hash of the client address.

Generate a session secret locally with `node -p "require('node:crypto').randomBytes(32).toString('base64url')"`. On self-hosted deployments, configure the trusted reverse proxy to overwrite `x-forwarded-for` or `x-real-ip`; the rate limiter uses those headers to identify clients.

## API

- `GET /api/models` lists models.
- `GET /api/models/[slug]` returns a model.
- `GET /api/providers` lists providers and their catalog counts.
- `GET /api/providers/[slug]` returns a provider and its models.
- `GET /api/rankings?category=Chat` returns models ordered by editorial score.
- `GET /api/admin/session` reports whether the admin session is active.
- `POST /api/admin/session` signs in and creates a session.
- `DELETE /api/admin/session` ends the session.
- `POST /api/models` creates a model.
- `PUT /api/models/[slug]` replaces a model's catalog fields.
- `DELETE /api/models/[slug]` deletes a model.

Catalog write endpoints require an active admin session. Invalid fields receive `400`, missing or expired sessions receive `401`, excessive requests receive `429`, and unavailable auth or database services receive `503`.

## Database commands

- `npm run db:generate` generates Prisma Client.
- `npm run db:migrate` applies pending development migrations.
- `npm run db:deploy` applies checked-in migrations to a production database.
- `npm run db:seed` inserts the starter model catalog.
- `npm test` runs validation and admin-session unit tests.
- `npm run lint` runs ESLint.

Run `npm run db:migrate` after pulling schema changes locally. Scores are set by a catalog editor in `/admin`; unscored models remain out of the rankings. Starter ranking scores in `prisma/seed.ts` are illustrative editorial values, not independent benchmark results.

## Deployment

The app is ready to deploy as a standard Next.js application (for example, on Vercel) with a managed PostgreSQL database. Add `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a unique random `ADMIN_SESSION_SECRET` to the host's encrypted environment settings; never upload `.env`. Apply migrations with `npm run db:deploy` before promoting the new application version, then let the host run `npm run build`. GitHub Actions runs Prisma generation, lint, unit tests, and a production build. The repository still needs to be linked to the hosting account and the production database provisioned by the project owner.
