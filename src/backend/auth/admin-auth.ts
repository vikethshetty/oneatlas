import { timingSafeEqual } from "node:crypto";

export function adminKeyIsConfigured() {
  return Boolean(process.env.ADMIN_API_KEY);
}

export function isAdminRequest(request: Request) {
  const expected = process.env.ADMIN_API_KEY;
  const supplied = request.headers.get("x-admin-key");
  if (!expected || !supplied) return false;

  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes);
}