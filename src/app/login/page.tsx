import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/modules/auth/presentation/login-form";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Accede a tu cuenta Perfect Nails para reservar y administrar tus citas.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
