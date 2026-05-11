import { NextRequest } from "next/server";
import { verifyEmailController } from "@/presentation/controllers/auth.controller";

export async function GET(request: NextRequest) {
  return verifyEmailController(request);
}
