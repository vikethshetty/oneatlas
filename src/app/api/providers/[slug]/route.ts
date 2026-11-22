import { getProviderBySlug } from "@/backend/controllers/providers.controller";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  return getProviderBySlug(slug);
}
