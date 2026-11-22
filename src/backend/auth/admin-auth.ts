import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "oneatlas_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function safeEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function adminAuthIsConfigured() {
  return Boolean(
    process.env.ADMIN_USERNAME?.trim() &&
    (process.env.ADMIN_PASSWORD?.length ?? 0) >= 12 &&
    secret().length >= 32,
  );
}

export function verifyAdminCredentials(username: string, password: string) {
  if (!adminAuthIsConfigured()) return false;
  const usernameMatches = safeEqual(username, process.env.ADMIN_USERNAME ?? "");
  const passwordMatches = safeEqual(password, process.env.ADMIN_PASSWORD ?? "");
  return usernameMatches && passwordMatches;
}

export function createAdminSession(now = Date.now()) {
  if (!adminAuthIsConfigured()) throw new Error("Admin authentication is not configured.");
  const payload = `v1.${now + ADMIN_SESSION_TTL_SECONDS * 1000}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readSessionCookie(request: Request) {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  const cookie = cookies.map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return cookie?.slice(SESSION_COOKIE.length + 1) ?? "";
}

export function isAdminRequest(request: Request, now = Date.now()) {
  if (!adminAuthIsConfigured()) return false;
  const [version, expiryText, suppliedSignature, extra] = readSessionCookie(request).split(".");
  if (version !== "v1" || extra !== undefined || !/^\d+$/.test(expiryText ?? "")) return false;

  const expiry = Number(expiryText);
  if (!Number.isSafeInteger(expiry) || expiry <= now) return false;
  const expected = createHmac("sha256", secret()).update(`${version}.${expiryText}`).digest("base64url");
  return safeEqual(suppliedSignature ?? "", expected);
}

export function adminSessionCookie(token: string, secure = process.env.NODE_ENV === "production") {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_SESSION_TTL_SECONDS}${secure ? "; Secure" : ""}`;
}

export function clearAdminSessionCookie(secure = process.env.NODE_ENV === "production") {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure ? "; Secure" : ""}`;
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
