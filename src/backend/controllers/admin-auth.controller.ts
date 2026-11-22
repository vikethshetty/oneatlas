import { consumeRateLimit } from "@/backend/auth/rate-limit";
import {
  adminAuthIsConfigured,
  adminSessionCookie,
  clearAdminSessionCookie,
  createAdminSession,
  isAdminRequest,
  isSameOriginRequest,
  verifyAdminCredentials,
} from "@/backend/auth/admin-auth";

function json(data: unknown, status = 200, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("cache-control", "no-store, max-age=0");
  return Response.json(data, { status, headers: responseHeaders });
}

export function getAdminSession(request: Request) {
  if (!adminAuthIsConfigured()) return json({ error: "Admin sign-in is not configured." }, 503);
  return json({ authenticated: isAdminRequest(request) });
}

export async function createAdminSessionForRequest(request: Request) {
  if (!adminAuthIsConfigured()) return json({ error: "Admin sign-in is not configured." }, 503);
  if (!isSameOriginRequest(request)) return json({ error: "Same-origin request required." }, 403);

  let limit;
  try {
    limit = await consumeRateLimit("admin-login", request, 8, 15 * 60 * 1000);
  } catch {
    return json({ error: "Sign-in is temporarily unavailable." }, 503);
  }
  if (!limit.allowed) {
    return json({ error: "Too many sign-in attempts. Try again later." }, 429, { "retry-after": String(limit.retryAfterSeconds) });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return json({ error: "Request body must be valid JSON." }, 400); }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return json({ error: "Username and password are required." }, 400);
  }

  const input = body as Record<string, unknown>;
  if (typeof input.username !== "string" || typeof input.password !== "string") {
    return json({ error: "Username and password are required." }, 400);
  }
  if (input.username.length > 200 || input.password.length > 500) {
    return json({ error: "Invalid username or password." }, 401);
  }
  if (!verifyAdminCredentials(input.username, input.password)) {
    return json({ error: "Invalid username or password." }, 401);
  }

  const token = createAdminSession();
  return json({ authenticated: true }, 200, { "set-cookie": adminSessionCookie(token) });
}

export function deleteAdminSession(request: Request) {
  if (!isSameOriginRequest(request)) return json({ error: "Same-origin request required." }, 403);
  return new Response(null, {
    status: 204,
    headers: { "set-cookie": clearAdminSessionCookie(), "cache-control": "no-store, max-age=0" },
  });
}
