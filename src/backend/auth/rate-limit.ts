import { createHmac } from "node:crypto";
import { getPrismaClient } from "@/backend/database/prisma";

type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export async function consumeRateLimit(
  scope: string,
  request: Request,
  limit: number,
  windowMs: number,
  now = Date.now(),
): Promise<RateLimitResult> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Rate-limit hashing is not configured.");

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  const key = createHmac("sha256", secret).update(`${scope}:${address}`).digest("hex");
  const currentTime = new Date(now);
  const nextReset = new Date(now + windowMs);
  const rows = await getPrismaClient().$queryRaw<Array<{ count: number; resetAt: Date }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${nextReset})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${currentTime} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${currentTime} THEN ${nextReset}
        ELSE "RateLimitBucket"."resetAt"
      END
    RETURNING "count", "resetAt"
  `;

  if (Math.random() < 0.01) {
    try {
      await getPrismaClient().$executeRaw`
        DELETE FROM "RateLimitBucket" WHERE "resetAt" < ${new Date(now - 24 * 60 * 60 * 1000)}
      `;
    } catch {
      // Expired buckets are harmless; cleanup must not block a valid request.
    }
  }

  const bucket = rows[0];
  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt.getTime() - now) / 1000)),
  };
}
