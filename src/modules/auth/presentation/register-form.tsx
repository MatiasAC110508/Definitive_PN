"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerSchema, type RegisterSchema } from "@/application/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/modules/auth/presentation/auth-shell";

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: RegisterSchema) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: { message?: string } };
      toast.error(payload.error?.message ?? "No pudimos crear tu cuenta.");
      return;
    }

    toast.success("Cuenta creada. Revisa tu correo para confirmar el email.");
    router.push("/login");
  }

  return (
    <AuthShell
      title="Crear cuenta"
      description="Regístrate para reservar citas, recibir confirmaciones y gestionar tu historial."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-[var(--gold)]">
            Ingresar
          </Link>
        </>
      }
    >
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-xs text-rose-700">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-xs text-rose-700">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" autoComplete="tel" {...form.register("phone")} />
          {form.formState.errors.phone ? (
            <p className="text-xs text-rose-700">{form.formState.errors.phone.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-rose-700">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
          Crear cuenta
        </Button>
      </form>
    </AuthShell>
  );
}
