import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/modules/auth/presentation/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar Contraseña",
  description: "Restablece tu contraseña para acceder a Perfect Nails.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
