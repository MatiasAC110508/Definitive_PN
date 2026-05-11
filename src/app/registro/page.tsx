import type { Metadata } from "next";
import { RegisterForm } from "@/modules/auth/presentation/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea una cuenta en Perfect Nails para confirmar reservas online.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
