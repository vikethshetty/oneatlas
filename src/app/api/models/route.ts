import { createModel, getModels } from "@/backend/controllers/models.controller";

export function GET() {
  return getModels();
}

export function POST(request: Request) {
  return createModel(request);
}