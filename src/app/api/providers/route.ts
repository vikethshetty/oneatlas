import { getProviders } from "@/backend/controllers/providers.controller";

export function GET() {
  return getProviders();
}
