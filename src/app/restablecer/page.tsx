import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/modules/auth/presentation/reset-password-form";

export const metadata: Metadata = {
  title: "Restablecer Contraseña",
  description: "Establece tu nueva contraseña para Perfect Nails.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
