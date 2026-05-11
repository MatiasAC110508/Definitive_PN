import { NextRequest } from "next/server";
import { createUserController } from "@/presentation/controllers/admin.controller";

export async function POST(request: NextRequest) {
  return createUserController(request);
}
