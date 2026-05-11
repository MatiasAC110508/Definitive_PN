import { NextRequest } from "next/server";
import {
  availabilityController,
  createAppointmentController,
  listAppointmentsController,
} from "@/presentation/controllers/appointment.controller";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.has("date")) {
    return availabilityController(request);
  }

  return listAppointmentsController();
}

export async function POST(request: NextRequest) {
  return createAppointmentController(request);
}
