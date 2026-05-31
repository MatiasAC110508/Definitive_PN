import { NextRequest } from "next/server";
import { createProductController } from "@/presentation/controllers/admin.controller";

export async function POST(request: NextRequest) {
  return createProductController(request);
}
