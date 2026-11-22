import assert from "node:assert/strict";
import { test } from "node:test";
import {
  adminAuthIsConfigured,
  adminSessionCookie,
  createAdminSession,
  isAdminRequest,
  isSameOriginRequest,
  verifyAdminCredentials,
} from "./admin-auth";

const keys = ["ADMIN_USERNAME", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"] as const;

function withAdminConfig(run: () => void) {
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  process.env.ADMIN_USERNAME = "test-admin";
  process.env.ADMIN_PASSWORD = "test-password-strong";
  process.env.ADMIN_SESSION_SECRET = "test-session-secret-that-is-more-than-32-characters";
  try { run(); }
  finally {
    for (const key of keys) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("admin credentials require configured values and match exactly", () => {
  withAdminConfig(() => {
    assert.equal(adminAuthIsConfigured(), true);
    assert.equal(verifyAdminCredentials("test-admin", "test-password-strong"), true);
    assert.equal(verifyAdminCredentials("test-admin", "wrong-password"), false);
    assert.equal(verifyAdminCredentials("other-admin", "test-password-strong"), false);
  });
});

test("admin sessions accept valid signatures and reject tampering or expiry", () => {
  withAdminConfig(() => {
    const now = 1_000_000;
    const token = createAdminSession(now);
    const requestFor = (value: string) => new Request("https://oneatlas.test/api/models", {
      headers: { cookie: `oneatlas_admin_session=${value}` },
    });

    assert.equal(isAdminRequest(requestFor(token), now), true);
    assert.equal(isAdminRequest(requestFor(token), now + 8 * 60 * 60 * 1000), false);
    const last = token.at(-1) === "A" ? "B" : "A";
    assert.equal(isAdminRequest(requestFor(`${token.slice(0, -1)}${last}`), now), false);
    assert.match(adminSessionCookie(token, true), /; HttpOnly; SameSite=Strict; Max-Age=28800; Secure$/);
  });
});

test("admin mutations require a matching request origin", () => {
  assert.equal(isSameOriginRequest(new Request("https://oneatlas.test/api/admin/session", {
    method: "POST", headers: { origin: "https://oneatlas.test" },
  })), true);
  assert.equal(isSameOriginRequest(new Request("https://oneatlas.test/api/admin/session", {
    method: "POST", headers: { origin: "https://attacker.test" },
  })), false);
  assert.equal(isSameOriginRequest(new Request("https://oneatlas.test/api/admin/session", { method: "POST" })), false);
});
