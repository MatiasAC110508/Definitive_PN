"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/application/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/modules/auth/presentation/auth-shell";
import { useEffect } from "react";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "" },
  });

  const submitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!token) {
      toast.error("El enlace de recuperación es inválido o falta el token.");
    }
  }, [token]);

  async function onSubmit(values: ResetPasswordSchema) {
    if (!values.token) {
      toast.error("Falta el token de recuperación en la URL.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "Ocurrió un error.");
        return;
      }

      toast.success(data.data?.message || "Contraseña restablecida.");
      router.push("/login");
    } catch {
      toast.error("Error de conexión al servidor.");
    }
  }

  return (
    <AuthShell
      title="Nueva Contraseña"
      description="Establece una nueva contraseña de al menos 8 caracteres para tu cuenta."
      footer={
        <Link href="/login" className="font-semibold text-[var(--gold)]">
          Cancelar y volver
        </Link>
      }
    >
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Hidden token field for Zod validation */}
        <input type="hidden" {...form.register("token")} />

        <div className="grid gap-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-rose-700">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" disabled={submitting || !token}>
          {submitting ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : null}
          Guardar Contraseña
        </Button>
      </form>
    </AuthShell>
  );
}
