import { NextRequest } from "next/server";
import { createAppointmentController } from "@/presentation/controllers/admin.controller";

export async function POST(request: NextRequest) {
  return createAppointmentController(request);
}
