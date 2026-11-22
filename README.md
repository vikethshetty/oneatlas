# OneAtlas.dev

An AI model discovery directory built with Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

## Project structure

```text
oneatlas/
├── src/app/                      Thin Next.js page and API routing entry points
├── src/frontend/                 All page UI, components, feature logic, and browser API clients
├── src/backend/
│   ├── auth/                     Admin API-key authorization
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
- Catalog management screen at `/admin`
- Public model reads and protected catalog write endpoints

## Local development

1. Create `.env` in the project root and set `DATABASE_URL` to your PostgreSQL connection string. Keep `.env` local; Git ignores it.
2. Add a strong `ADMIN_API_KEY` value to `.env` for model management.
3. Install dependencies with `npm install` and start with `npm run dev`.

The admin key is entered into the `/admin` screen and kept in page memory. It is sent only with create, update, and delete requests.

## API

- `GET /api/models` lists models.
- `GET /api/models/[slug]` returns a model.
- `GET /api/providers` lists providers and their catalog counts.
- `GET /api/providers/[slug]` returns a provider and its models.
- `GET /api/rankings?category=Chat` returns models ordered by editorial score.
- `POST /api/models` creates a model.
- `PUT /api/models/[slug]` replaces a model's catalog fields.
- `DELETE /api/models/[slug]` deletes a model.

Write endpoints require the `x-admin-key` header matching `ADMIN_API_KEY`. Requests are validated; invalid fields receive `400`, a missing or incorrect key receives `401`, and the API returns `503` if the key or database is unavailable.

## Database commands

- `npm run db:generate` generates Prisma Client.
- `npm run db:migrate` applies pending development migrations.
- `npm run db:deploy` applies checked-in migrations to a production database.
- `npm run db:seed` inserts the starter model catalog.

Run `npm run db:migrate` after pulling the ranking-score schema change. Scores are set by a catalog editor in `/admin`; unscored models remain out of the rankings. Starter ranking scores in `prisma/seed.ts` are illustrative editorial values, not independent benchmark results. The admin API key is a single-operator development control; add account/session-based authorization and rate limits before exposing catalog writes publicly.

## Deployment

The app is ready to deploy as a standard Next.js application (for example, on Vercel) with a managed PostgreSQL database. Add `DATABASE_URL` and a strong `ADMIN_API_KEY` to the host's encrypted environment settings; never upload `.env`. Apply migrations with `npm run db:deploy` before promoting the new application version, then let the host run `npm run build`. The GitHub repository still needs to be linked to the hosting account and the production database provisioned by the project owner.
