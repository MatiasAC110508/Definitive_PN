import { NextRequest } from "next/server";
import { listProductsController } from "@/presentation/controllers/catalog.controller";

export async function GET(request: NextRequest) {
  return listProductsController(request);
}
