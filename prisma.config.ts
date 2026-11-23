import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Use Neon’s direct endpoint for Prisma migrations. Application queries use
    // the pooled DATABASE_URL in src/backend/database/prisma.ts.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/oneatlas?schema=public",
  },
});
