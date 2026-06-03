import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json(
        { error: { message: "No autorizado." } },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { message: "No se proporcionó ningún archivo." } },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: {
            message:
              "Formato no válido. Solo se permiten: JPG, PNG, WebP, AVIF, GIF.",
          },
        },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: { message: "El archivo supera el límite de 5 MB." } },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .replace(/-+/g, "-");
    const filename = `services/${timestamp}-${safeName}`;

    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: { message: "Error al subir el archivo." } },
      { status: 500 },
    );
  }
}
