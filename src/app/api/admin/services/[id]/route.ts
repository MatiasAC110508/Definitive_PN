import { NextRequest } from "next/server";
import {
  updateServiceController,
  deleteServiceController,
} from "@/presentation/controllers/admin.controller";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return updateServiceController(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return deleteServiceController(request, id);
}
