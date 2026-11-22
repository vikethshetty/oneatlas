import { adminAuthIsConfigured, isAdminRequest, isSameOriginRequest } from "@/backend/auth/admin-auth";
import { consumeRateLimit } from "@/backend/auth/rate-limit";
import {
  CatalogConflictError,
  createModel as createCatalogModel,
  getModel as getCatalogModel,
  listModels,
  ModelNotFoundError,
  removeModel,
  updateModel as updateCatalogModel,
} from "@/backend/services/model.service";
import { parseModelInput } from "@/backend/validation/model-input";
import type { ModelWriteInput } from "@/backend/validation/model-input";

async function requireAdmin(request: Request): Promise<Response | null> {
  if (!adminAuthIsConfigured()) {
    return Response.json({ error: "Admin sign-in is not configured." }, { status: 503 });
  }
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Same-origin request required." }, { status: 403 });
  }
  try {
    const limit = await consumeRateLimit("admin-write", request, 60, 60 * 1000);
    if (!limit.allowed) {
      return Response.json(
        { error: "Too many catalog changes. Try again shortly." },
        { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
      );
    }
  } catch {
    return Response.json({ error: "Catalog writes are temporarily unavailable." }, { status: 503 });
  }
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Admin sign-in required." }, { status: 401 });
  }
  return null;
}

function operationError(error: unknown) {
  if (error instanceof ModelNotFoundError) return Response.json({ error: error.message }, { status: 404 });
  if (error instanceof CatalogConflictError) return Response.json({ error: error.message }, { status: 409 });
  return Response.json({ error: "Catalog operation failed." }, { status: 503 });
}

export async function getModels() {
  try {
    const data = await listModels();
    return Response.json({ data, count: data.length });
  } catch {
    return Response.json(
      { error: "Model catalog unavailable. Check the database connection." },
      { status: 503 },
    );
  }
}

export async function getModel(slug: string) {
  try {
    const data = await getCatalogModel(slug);
    return data
      ? Response.json({ data })
      : Response.json({ error: "Model not found." }, { status: 404 });
  } catch {
    return Response.json({ error: "Model catalog unavailable." }, { status: 503 });
  }
}

export async function createModel(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Request body must be valid JSON." }, { status: 400 }); }

  const parsed = parseModelInput(body, true);
  if (!parsed.ok || !parsed.value.slug) {
    return Response.json({ error: parsed.ok ? "slug is required." : parsed.message }, { status: 400 });
  }

  try {
    const data = await createCatalogModel(parsed.value as ModelWriteInput & { slug: string });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return operationError(error);
  }
}

export async function updateModel(request: Request, slug: string) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Request body must be valid JSON." }, { status: 400 }); }

  const parsed = parseModelInput(body, false);
  if (!parsed.ok) return Response.json({ error: parsed.message }, { status: 400 });

  try {
    const data = await updateCatalogModel(slug, parsed.value);
    return Response.json({ data });
  } catch (error) {
    return operationError(error);
  }
}

export async function deleteModel(request: Request, slug: string) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    await removeModel(slug);
    return new Response(null, { status: 204 });
  } catch (error) {
    return operationError(error);
  }
}
