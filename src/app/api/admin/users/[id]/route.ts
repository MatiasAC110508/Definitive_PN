import { NextRequest } from "next/server";
import { deleteUserController, updateUserController } from "@/presentation/controllers/admin.controller";

type Params = { id: string };

export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  return updateUserController(request, id);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  return deleteUserController(request, id);
}
