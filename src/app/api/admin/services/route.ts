import { NextRequest } from "next/server";
import { createServiceController } from "@/presentation/controllers/admin.controller";

export async function POST(request: NextRequest) {
  return createServiceController(request);
}
