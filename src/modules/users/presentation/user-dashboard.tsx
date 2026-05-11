"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  CalendarClock, 
  History, 
  RotateCcw, 
  UserRound, 
  XCircle, 
  Sparkles, 
  CheckCircle2, 
  Camera, 
  PencilLine,
  Mail,
  Phone,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import type { Appointment } from "@/domain/entities/appointment.entity";
import type { BeautyService } from "@/domain/entities/service.entity";
import type { User } from "@/domain/entities/user.entity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { formatDate, formatTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Reveal } from "@/presentation/components/motion/reveal";

type UserDashboardProps = {
  appointments: Appointment[];
  services: BeautyService[];
  user: User;
};

const statusLabels = {
  RESERVED: "Reservada",
  PENDING: "Pendiente",
  CANCELLED: "Cancelada",
};

export function UserDashboard({ appointments: initialAppointments, services, user: initialUser }: UserDashboardProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // Manual refresh function
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.data.appointments);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure data is fresh on mount
  useEffect(() => {
    void refreshData();
  }, []);

  // Sync state with props when server-side data changes
  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  useEffect(() => {
    setUser(initialUser);
    setProfileData({
      name: initialUser.name || "",
      phone: initialUser.phone || "",
      image: initialUser.image || "",
    });
  }, [initialUser]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: initialUser.name || "",
    phone: initialUser.phone || "",
    image: initialUser.image || "",
  });

  const upcoming = appointments.filter((appointment) => appointment.status !== "CANCELLED");
  const history = appointments.filter((appointment) => appointment.status === "CANCELLED");

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  async function safeJson(response: Response) {
    const text = await response.text();
    try {
      return JSON.parse(text);
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
      if (!response.ok) throw new Error(payload.error?.message || "Error del servidor");

      setAppointments((prev) => 
        prev.map((app) => app.id === id ? { ...app, status: "CANCELLED" as any } : app)
      );
      toast.success("Cita cancelada correctamente.");
    } catch (error: any) {
      toast.error(error.message || "No pudimos cancelar la cita.");
    } finally {
      setIsActionLoading(null);
    }
  }

  async function rescheduleAppointment(id: string, newStartAt: string) {
    setIsActionLoading(id);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt: newStartAt }),
      });

      const payload = await safeJson(response);
      if (!response.ok) throw new Error(payload.error?.message || "Error al reagendar");

      setAppointments((prev) => 
        prev.map((app) => app.id === id ? { ...app, startAt: newStartAt } : app)
      );
      toast.success("Cita reagendada con éxito.");
      setIsRescheduleModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "No se pudo cambiar el horario.");
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
      if (!response.ok) throw new Error(payload.error?.message || "Error al eliminar");

      setAppointments((prev) => prev.filter((app) => app.id !== id));
      toast.success("Registro eliminado.");
    } catch (error: any) {
      toast.error(error.message || "No se pudo eliminar.");
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
    } catch (error) {
      toast.error("No se pudo actualizar tu perfil.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  function serviceName(serviceId: string) {
    return services.find((service) => service.id === serviceId)?.name ?? "Servicio Perfect Nails";
  }

  return (
    <div className="pt-[4.5rem]">
      {/* Reschedule Modal */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2 text-[var(--ink)]">
              <RotateCcw className="size-5 text-[var(--gold)]" />
              Reagendar Cita
            </DialogTitle>
            <DialogDescription className="text-[var(--ink-soft)]">
              Selecciona una nueva fecha y hora para tu ritual de belleza.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Nueva Fecha y Hora</Label>
              <Input 
                type="datetime-local" 
                className="h-12 rounded-xl border-[var(--line)] bg-[var(--quartz-soft)]/30"
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => {
                  if (selectedAppointment) {
                    setSelectedAppointment({
                      ...selectedAppointment,
                      startAt: new Date(e.target.value).toISOString()
                    });
                  }
                }}
              />
            </div>
            
            {selectedAppointment?.startAt && (
              <div className="p-4 rounded-2xl bg-[var(--quartz-soft)] border border-[var(--gold-soft)]/20 text-sm">
                <p className="font-semibold text-[var(--gold)] mb-1">Nuevo horario propuesto:</p>
                <p className="text-[var(--ink)]">
                  {formatDate(selectedAppointment.startAt, "EEEE d 'de' MMMM")} a las {formatTime(selectedAppointment.startAt)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsRescheduleModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              variant="gold" 
              className="flex-1 font-bold shadow-lg shadow-[var(--gold-soft)]/20"
              disabled={!selectedAppointment || isActionLoading === selectedAppointment.id}
              onClick={() => {
                if (selectedAppointment) {
                  void rescheduleAppointment(selectedAppointment.id, selectedAppointment.startAt);
                }
              }}
            >
              {isActionLoading === selectedAppointment?.id ? "Procesando..." : "Confirmar Cambio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Edit Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
          <div className="bg-[var(--gold)] p-8 text-[var(--ink)]">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <PencilLine className="size-6" />
                </div>
                <div>
                  <DialogTitle className="font-display text-3xl">Personalizar Perfil</DialogTitle>
                  <DialogDescription className="text-[var(--ink)]/60">
                    Tu imagen e información para una experiencia exclusiva.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleProfileSubmit} className="p-8 space-y-6 bg-white">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="size-28 rounded-full bg-[var(--quartz-soft)] border-4 border-[var(--gold-soft)] overflow-hidden shadow-xl">
                  {profileData.image ? (
                    <img src={profileData.image} alt="Profile" className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-4xl font-display text-[var(--gold)]">
                      {profileData.name.charAt(0)}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 size-10 bg-[var(--ink)] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--gold)] transition-colors shadow-lg border-2 border-white">
                  <Camera className="size-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <p className="mt-3 text-[10px] text-[var(--ink-soft)] font-bold uppercase tracking-widest">Foto de Perfil</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Nombre Completo</Label>
                <Input 
                  id="name" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} 
                  className="h-12 rounded-xl border-[var(--line)] bg-[var(--quartz-soft)]/30"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Teléfono de Contacto</Label>
                <Input 
                  id="phone" 
                  value={profileData.phone} 
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} 
                  className="h-12 rounded-xl border-[var(--line)] bg-[var(--quartz-soft)]/30"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsProfileModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" variant="gold" disabled={isSubmitting} className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-[var(--gold-soft)]/20">
                {isSubmitting ? "Guardando..." : "Actualizar Perfil"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <section className="marble-surface px-4 py-20 sm:px-6 lg:px-8 border-b border-[var(--line)]">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <Badge variant="gold" className="mb-4">Socia VIP</Badge>
            <h1 className="font-display text-6xl font-semibold text-[var(--ink)] tracking-tight">
              Bienvenida, {user.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
              Tu espacio privado para gestionar rituales de belleza, reagendar citas y explorar tu historial en Perfect Nails.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-10">
          <Card className="glass-card overflow-hidden rounded-3xl border-none shadow-xl">
            <CardHeader className="border-b border-[var(--line)]/50 pb-4 bg-[var(--quartz-soft)]/30">
              <CardTitle className="flex items-center gap-2 text-2xl font-display">
                <CalendarClock aria-hidden="true" className="size-5 text-[var(--gold)]" />
                Próximos Encuentros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcoming.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex size-16 items-center justify-center rounded-full bg-[var(--quartz-soft)] mb-6">
                    <Sparkles className="size-8 text-[var(--gold)] opacity-40" />
                  </div>
                  <h3 className="font-display text-3xl font-semibold">Sin citas activas</h3>
                  <p className="mt-3 text-[var(--ink-soft)]">
                    Tu agenda está libre por ahora. ¿Qué tal un ritual de spa?
                  </p>
                  <Button asChild className="mt-8" variant="gold">
                    <Link href="/reservar">Reservar ahora</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--line)]/50">
                  {upcoming.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="group flex flex-col gap-6 p-6 transition-colors hover:bg-white/40 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-5">
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--line)] bg-white p-3 min-w-[70px] shadow-sm">
                          <span className="text-[10px] font-bold uppercase tracking-tighter text-[var(--gold)]">
                            {formatDate(appointment.startAt, "MMM")}
                          </span>
                          <span className="text-3xl font-display font-bold">
                            {formatDate(appointment.startAt, "d")}
                          </span>
                        </div>
                        <div>
                          <Badge 
                            className={cn(
                              "mb-2 font-bold rounded-full",
                              appointment.status === "RESERVED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                            )}
                            variant="outline"
                          >
                            {appointment.status === "RESERVED" ? <CheckCircle2 className="mr-1 size-3" /> : null}
                            {statusLabels[appointment.status as keyof typeof statusLabels]}
                          </Badge>
                          <h2 className="font-display text-3xl font-semibold text-[var(--ink)]">
                            {serviceName(appointment.serviceId)}
                          </h2>
                          <div className="flex items-center gap-2 mt-1 text-sm text-[var(--ink-soft)]">
                            <span className="capitalize">{formatDate(appointment.startAt, "EEEE")}</span>
                            <span>·</span>
                            <span>{formatTime(appointment.startAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button 
                          variant="luxury" 
                          size="sm" 
                          className="bg-white/80 rounded-xl"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setIsRescheduleModalOpen(true);
                          }}
                        >
                          <RotateCcw className="mr-2 size-4" />
                          Reagendar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isActionLoading === appointment.id}
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl"
                          onClick={() => void cancelAppointment(appointment.id)}
                        >
                          {isActionLoading === appointment.id ? (
                            <RotateCcw className="mr-2 size-4 animate-spin" />
                          ) : (
                            <XCircle className="mr-2 size-4" />
                          )}
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--line)] rounded-3xl shadow-lg">
            <CardHeader className="bg-[var(--quartz-soft)]/10">
              <CardTitle className="flex items-center gap-2 text-xl font-display">
                <History aria-hidden="true" className="size-5 text-[var(--gold)]" />
                Historial de Belleza
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--ink-soft)] italic opacity-60">
                  Tu historial aparecerá aquí tras completar tu primera cita.
                </div>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {history.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-6 text-sm hover:bg-[var(--quartz-soft)]/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-[var(--gold)]" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg">{serviceName(appointment.serviceId)}</span>
                          <span className="text-[10px] text-[var(--ink-soft)] uppercase font-bold">
                            {formatDate(appointment.startAt, "d MMM, yyyy")}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isActionLoading === appointment.id}
                        className="size-10 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                        onClick={() => void deleteAppointment(appointment.id)}
                      >
                        {isActionLoading === appointment.id ? (
                          <RotateCcw className="size-4 animate-spin" />
                        ) : (
                          <XCircle className="size-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-card border-none shadow-2xl overflow-hidden rounded-3xl sticky top-24">
            <div className="h-24 bg-gradient-to-r from-[var(--gold-soft)] to-[var(--gold)]" />
            <CardContent className="p-8 -mt-12 text-center">
              <div className="relative inline-block group">
                <div className="size-32 rounded-full bg-white p-1 border-4 border-white shadow-xl relative overflow-hidden">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="size-full rounded-full object-cover" />
                  ) : (
                    <div className="size-full rounded-full bg-[var(--quartz-soft)] flex items-center justify-center font-display text-5xl text-[var(--gold)]">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-display text-3xl font-bold text-[var(--ink)]">{user.name}</h3>
                <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-[0.3em] mt-1">Miembro Exclusivo</p>
              </div>

              <div className="mt-8 grid gap-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--quartz-soft)]/50 border border-[var(--line)]/50">
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 text-[var(--gold)]" />
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-[var(--ink-soft)] uppercase tracking-wider">Email</p>
                      <p className="text-xs font-semibold text-[var(--ink)]">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--quartz-soft)]/50 border border-[var(--line)]/50">
                  <div className="flex items-center gap-3">
                    <Phone className="size-4 text-[var(--gold)]" />
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-[var(--ink-soft)] uppercase tracking-wider">Teléfono</p>
                      <p className="text-xs font-semibold text-[var(--ink)]">{user.phone || "No registrado"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--quartz-soft)]/50 border border-[var(--line)]/50">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="size-4 text-[var(--gold)]" />
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-[var(--ink-soft)] uppercase tracking-wider">Citas Totales</p>
                      <p className="text-xs font-semibold text-[var(--ink)]">{appointments.length} rituales</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <Button 
                  variant="ghost" 
                  className="rounded-xl border border-[var(--line)] h-12"
                  onClick={refreshData}
                  disabled={isLoading}
                >
                  <RotateCcw className={cn("size-4 mr-2", isLoading && "animate-spin")} />
                  Recargar
                </Button>
                <Button 
                  variant="luxury" 
                  className="rounded-xl h-12 font-bold shadow-lg" 
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <PencilLine className="mr-2 size-4" />
                  Editar
                </Button>
              </div>

              {/* Secret Debug Info (Only for development) */}
              <div className="mt-6 pt-4 border-t border-dashed border-[var(--line)] opacity-20 hover:opacity-100 transition-opacity">
                <p className="text-[8px] text-left font-mono">ID: {user.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
