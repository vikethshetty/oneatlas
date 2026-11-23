import { listRankedModels } from "@/backend/services/model.service";

const categories = ["Chat", "Image", "Code", "Audio", "Video", "Embedding", "Speech", "Rerank"];

export async function getRankings(request: Request) {
  const category = new URL(request.url).searchParams.get("category") ?? undefined;
  if (category && !categories.includes(category)) {
    return Response.json({ error: "Unsupported model category." }, { status: 400 });
  }
  try {
    const data = await listRankedModels(category);
    return Response.json({ data, count: data.length, methodology: "OneAtlas editorial scores (0–100)" });
  } catch {
    return Response.json({ error: "Rankings unavailable. Check the database connection." }, { status: 503 });
  }
}
