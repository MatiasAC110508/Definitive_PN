import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<TData>(data: TData, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<TData>(data: TData) {
  return NextResponse.json({ data }, { status: 201 });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}

export function validationError(error: ZodError) {
  return apiError("La información enviada no es válida.", 422, error.flatten());
}
