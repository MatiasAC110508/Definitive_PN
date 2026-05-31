import { NextRequest } from "next/server";
import { deleteProductController, updateProductController } from "@/presentation/controllers/admin.controller";

type Params = { id: string };

export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  return updateProductController(request, id);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  return deleteProductController(request, id);
}
