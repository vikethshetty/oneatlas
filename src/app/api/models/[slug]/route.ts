import {
  deleteModel,
  getModel,
  updateModel,
} from "@/backend/controllers/models.controller";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  return getModel(slug);
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  return updateModel(request, slug);
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  return deleteModel(request, slug);
}