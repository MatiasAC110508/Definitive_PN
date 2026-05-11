import { NextRequest } from "next/server";
import { updateAppointmentController, deleteAppointmentController } from "@/presentation/controllers/admin.controller";

type Params = { id: string };

export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  return updateAppointmentController(request, id);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  return deleteAppointmentController(request, id);
}
