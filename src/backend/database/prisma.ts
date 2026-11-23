import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const prismaGlobal = globalThis as unknown as { oneatlasPrisma?: PrismaClient };

export function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!prismaGlobal.oneatlasPrisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5_000,
      query_timeout: 12_000,
      statement_timeout: 12_000,
    });
    prismaGlobal.oneatlasPrisma = new PrismaClient({ adapter });
  }

  return prismaGlobal.oneatlasPrisma;
}
