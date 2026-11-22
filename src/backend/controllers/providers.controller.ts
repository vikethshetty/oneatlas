import { getProvider, listProviders } from "@/backend/services/model.service";

export async function getProviders() {
  try {
    const data = await listProviders();
    return Response.json({ data, count: data.length });
  } catch {
    return Response.json({ error: "Provider directory unavailable. Check the database connection." }, { status: 503 });
  }
}

export async function getProviderBySlug(slug: string) {
  try {
    const data = await getProvider(slug);
    return data ? Response.json({ data }) : Response.json({ error: "Provider not found." }, { status: 404 });
  } catch {
    return Response.json({ error: "Provider directory unavailable." }, { status: 503 });
  }
}
