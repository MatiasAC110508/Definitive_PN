"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Appointment } from "@/domain/entities/appointment.entity";
import type { BeautyService } from "@/domain/entities/service.entity";
import type { User } from "@/domain/entities/user.entity";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/presentation/components/motion/reveal";

import { UserRescheduleModal } from "./components/user-reschedule-modal";
import { UserProfileModal } from "./components/user-profile-modal";
import { UserAppointmentsCard } from "./components/user-appointments-card";
import { UserHistoryCard } from "./components/user-history-card";
import { UserProfileCard } from "./components/user-profile-card";

type UserDashboardProps = {
  appointments: Appointment[];
  services: BeautyService[];
  user: User;
};

type ApiEnvelope<T> = {
  data?: T;
  error?: { message?: string };
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function UserDashboard({
  appointments: initialAppointments,
  services,
  user: initialUser,
}: UserDashboardProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = (await res.json()) as ApiEnvelope<{
          appointments: Appointment[];
        }>;
        setAppointments(data.data?.appointments ?? []);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    name: initialUser.name || "",
    email: initialUser.email || "",
    phone: initialUser.phone || "",
    image: initialUser.image || "",
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refreshData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setAppointments(initialAppointments),
      0,
    );
    return () => window.clearTimeout(timeoutId);
  }, [initialAppointments]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setUser(initialUser);
      setProfileData({
        name: initialUser.name || "",
        email: initialUser.email || "",
        phone: initialUser.phone || "",
        image: initialUser.image || "",
      });
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [initialUser]);

  const upcoming = appointments.filter((app) => app.status !== "CANCELLED");
  const history = appointments.filter((app) => app.status === "CANCELLED");

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  async function safeJson<T>(response: Response): Promise<ApiEnvelope<T>> {
    const text = await response.text();
    try {
      return JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      return { error: { message: "Error inesperado del servidor." } };
    }
  }

  async function cancelAppointment(id: string) {
    setIsActionLoading(id);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      const payload = await safeJson(response);
      if (!response.ok)
        throw new Error(payload.error?.message || "Error del servidor");

      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "CANCELLED" } : app,
        ),
      );
      toast.success("Cita cancelada correctamente.");
    } catch (error) {
      toast.error(getErrorMessage(error, "No pudimos cancelar la cita."));
    } finally {
      setIsActionLoading(null);
    }
  }

  async function rescheduleAppointment() {
    if (!selectedAppointment) return;
    setIsActionLoading(selectedAppointment.id);
    try {
      const response = await fetch(
        `/api/appointments/${selectedAppointment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startAt: selectedAppointment.startAt }),
        },
      );

      const payload = await safeJson(response);
      if (!response.ok)
        throw new Error(payload.error?.message || "Error al reagendar");

      setAppointments((prev) =>
        prev.map((app) =>
          app.id === selectedAppointment.id
            ? { ...app, startAt: selectedAppointment.startAt }
            : app,
        ),
      );
      toast.success("Cita reagendada con éxito.");
      setIsRescheduleModalOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo cambiar el horario."));
    } finally {
      setIsActionLoading(null);
    }
  }

  async function deleteAppointment(id: string) {
    setIsActionLoading(id);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        setAppointments((prev) => prev.filter((app) => app.id !== id));
        toast.success("Registro eliminado.");
        return;
      }

      const payload = await safeJson(response);
      if (!response.ok)
        throw new Error(payload.error?.message || "Error al eliminar");

      setAppointments((prev) => prev.filter((app) => app.id !== id));
      toast.success("Registro eliminado.");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo eliminar."));
    } finally {
      setIsActionLoading(null);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error("Error al actualizar");

      const data = await response.json();
      setUser(data.data.user);
      toast.success("Perfil actualizado con éxito.");
      setIsProfileModalOpen(false);
    } catch {
      toast.error("No se pudo actualizar tu perfil.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setProfileData({ ...profileData, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  function serviceName(serviceId: string) {
    return (
      services.find((s) => s.id === serviceId)?.name ?? "Servicio Perfect Nails"
    );
  }

  return (
    <div className="pt-[4.5rem]">
      <UserRescheduleModal
        isOpen={isRescheduleModalOpen}
        onOpenChange={setIsRescheduleModalOpen}
        selectedAppointment={selectedAppointment}
        isActionLoading={isActionLoading}
        onDateChange={(newDateStr) => {
          if (selectedAppointment) {
            setSelectedAppointment({
              ...selectedAppointment,
              startAt: new Date(newDateStr).toISOString(),
            });
          }
        }}
        onReschedule={rescheduleAppointment}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        profileData={profileData}
        setProfileData={setProfileData}
        isSubmitting={isSubmitting}
        onSubmit={handleProfileSubmit}
        onImageChange={handleImageChange}
      />

      <section className="marble-surface px-4 py-20 sm:px-6 lg:px-8 border-b border-[var(--line)]">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <Badge variant="gold" className="mb-4">
              Socia VIP
            </Badge>
            <h1 className="font-display text-6xl font-semibold text-[var(--ink)] tracking-tight">
              Bienvenida, {user.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
              Tu espacio privado para gestionar rituales de belleza, reagendar
              citas y explorar tu historial en Perfect Nails.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-10">
          <UserAppointmentsCard
            upcoming={upcoming}
            isActionLoading={isActionLoading}
            onCancelClick={cancelAppointment}
            onRescheduleClick={(app) => {
              setSelectedAppointment(app);
              setIsRescheduleModalOpen(true);
            }}
            serviceNameFormatter={serviceName}
          />

          <UserHistoryCard
            history={history}
            isActionLoading={isActionLoading}
            onDeleteClick={deleteAppointment}
            serviceNameFormatter={serviceName}
          />
        </div>

        <div className="space-y-8">
          <UserProfileCard
            user={user}
            appointmentsCount={appointments.length}
            isLoading={isLoading}
            onRefresh={refreshData}
            onEditClick={() => setIsProfileModalOpen(true)}
          />
        </div>
      </section>
    </div>
  );
}
