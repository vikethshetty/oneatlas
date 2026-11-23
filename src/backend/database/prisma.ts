import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const prismaGlobal = globalThis as unknown as { oneatlasPrisma?: PrismaClient };

export function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!prismaGlobal.oneatlasPrisma) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5_000,
      query_timeout: 12_000,
      statement_timeout: 12_000,
    });
    attachDatabasePool(pool);
    const adapter = new PrismaPg(pool);
    prismaGlobal.oneatlasPrisma = new PrismaClient({ adapter });
  }

  return prismaGlobal.oneatlasPrisma;
}
