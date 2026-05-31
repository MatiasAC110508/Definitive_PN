import { NextRequest } from "next/server";
import {
  updateServiceController,
  deleteServiceController,
} from "@/presentation/controllers/admin.controller";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return updateServiceController(request, params.id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return deleteServiceController(request, params.id);
}
