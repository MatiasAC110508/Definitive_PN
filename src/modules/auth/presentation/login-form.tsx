"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginSchema, type LoginSchema } from "@/application/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/modules/auth/presentation/auth-shell";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/panel";
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: LoginSchema) {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      toast.error("Correo o contraseña incorrectos.");
      return;
    }

    toast.success("Bienvenida a Perfect Nails.");
    router.push((result?.url ?? callbackUrl) as Route);
    router.refresh();
  }

  return (
    <AuthShell
      title="Ingresar"
      description="Accede para confirmar reservas, ver historial y gestionar tu perfil."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-[var(--gold)]">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-xs text-rose-700">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-rose-700">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
}
