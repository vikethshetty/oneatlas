import { getPrismaClient } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const models = await getPrismaClient().model.findMany({
      include: { provider: true },
      orderBy: { name: "asc" },
    });

    const data = models.map((model) => ({
      name: model.name,
      id: model.slug,
      provider: model.provider.name,
      category: model.category,
      description: model.description,
      context: model.context,
      pricing: model.pricing,
      badge: model.badge,
      mark: model.mark,
      tone: model.tone,
    }));

    return Response.json({ data, count: data.length });
  } catch {
    return Response.json(
      { error: "Model catalog unavailable. Configure the database and apply migrations." },
      { status: 503 },
    );
  }
}
