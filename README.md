# OneAtlas.dev

An AI model discovery directory built with Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

## Project structure

```text
app repository root
├── src/
│   ├── app/                    Next.js routes, layouts, styles, and API handlers
│   │   └── api/models/         Model catalog API
│   ├── components/             Shared interface components
│   ├── features/models/        Model explorer and model types
│   ├── lib/db/                 Prisma client
│   └── generated/prisma/       Generated Prisma Client (ignored by Git)
├── prisma/                     Database schema, migrations, and seed
├── public/                     Static assets
└── project config files        Next.js, TypeScript, ESLint, and npm
```

## Local development

1. Create `.env` in the project root and set `DATABASE_URL` to your PostgreSQL connection string. Keep `.env` local; Git ignores it.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

## Database commands

- `npm run db:generate` generates Prisma Client.
- `npm run db:migrate` applies pending migrations to the development database.
- `npm run db:seed` inserts the starter model catalog.

The homepage reads the model catalog from `GET /api/models`.