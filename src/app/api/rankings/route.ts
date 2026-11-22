import { getRankings } from "@/backend/controllers/rankings.controller";

export function GET(request: Request) {
  return getRankings(request);
}
