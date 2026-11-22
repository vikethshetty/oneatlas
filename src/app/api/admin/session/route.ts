import {
  createAdminSessionForRequest,
  deleteAdminSession,
  getAdminSession,
} from "@/backend/controllers/admin-auth.controller";

export function GET(request: Request) {
  return getAdminSession(request);
}

export function POST(request: Request) {
  return createAdminSessionForRequest(request);
}

export function DELETE(request: Request) {
  return deleteAdminSession(request);
}
