import { NextRequest } from "next/server";
import { updateScheduleController } from "@/presentation/controllers/admin.controller";

type Params = { id: string };

export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  return updateScheduleController(request, id);
}
