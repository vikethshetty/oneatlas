# PostgreSQL and Prisma

Prisma 7 and its PostgreSQL driver are installed. The schema and API are ready; the local database URL is still needed before the first migration can run.

1. Create a `.env` file in the project root and set `DATABASE_URL` to your PostgreSQL connection string. `.env` is ignored by Git.
2. Run `npm run db:generate`.
3. Run `npm run db:migrate -- --name init` to create the `Provider` and `Model` tables.
4. Run `npm run db:seed` to load the starter catalog.
5. Start the app with `npm run dev`; the database-backed endpoint is `GET /api/models`.

The API response keeps the original `{ data, count }` shape so the interface can move to database data without changing the contract.
