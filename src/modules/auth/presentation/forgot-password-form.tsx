"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/application/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/modules/auth/presentation/auth-shell";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: ForgotPasswordSchema) {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "Ocurrió un error.");
        return;
      }

      setSubmitted(true);
      toast.success(data.data?.message || "Correo enviado correctamente.");
    } catch {
      toast.error("Error de conexión al servidor.");
    }
  }

  if (submitted) {
    return (
      <AuthShell
        title="Correo Enviado"
        description="Si el correo electrónico está registrado, te hemos enviado un enlace para que puedas establecer una nueva contraseña."
        footer={
          <Link href="/login" className="font-semibold text-[var(--gold)]">
            Volver a Ingresar
          </Link>
        }
      >
        <div className="text-center">
          <p className="text-sm text-[var(--ink-soft)] mb-6">
            Por favor, revisa tu bandeja de entrada y la carpeta de spam o
            correo no deseado.
          </p>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setSubmitted(false)}
          >
            Intentar con otro correo
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Recuperar Contraseña"
      description="Ingresa tu correo para enviarte un enlace de recuperación."
      footer={
        <>
          ¿La recordaste?{" "}
          <Link href="/login" className="font-semibold text-[var(--gold)]">
            Volver
          </Link>
        </>
      }
    >
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-rose-700">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : null}
          Enviar Enlace
        </Button>
      </form>
    </AuthShell>
  );
}
