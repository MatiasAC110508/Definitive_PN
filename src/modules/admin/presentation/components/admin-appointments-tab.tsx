"use client";

import { useState, useMemo } from "react";
import type {
  Appointment,
  AppointmentStatus,
} from "@/domain/entities/appointment.entity";
import type { BeautyService } from "@/domain/entities/service.entity";
import type { User } from "@/domain/entities/user.entity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  Plus,
  MoreVertical,
  Search,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/formatters";
import { toast } from "sonner";
import {
  businessDateTimeInputToIso,
  formatDateTimeInputInBusinessTime,
} from "@/lib/business-time";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No Asistió",
};

interface AdminAppointmentsTabProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  services: BeautyService[];
  users: User[];
}

export function AdminAppointmentsTab({
  appointments,
  setAppointments,
  services,
  users,
}: AdminAppointmentsTabProps) {
  const [aptQuery, setAptQuery] = useState("");
  const [activeSegment, setActiveSegment] = useState("upcoming");

  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [aptToDelete, setAptToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [aptFormData, setAptFormData] = useState<{
    userId: string;
    serviceId: string;
    startAt: string;
    notes: string;
    status: AppointmentStatus;
  }>({
    userId: "",
    serviceId: "",
    startAt: "",
    notes: "",
    status: "PENDING",
  });

  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];
    const now = new Date().toISOString();

    if (activeSegment === "upcoming") {
      filtered = filtered.filter((a) => a.startAt >= now);
    } else if (activeSegment === "past") {
      filtered = filtered.filter((a) => a.startAt < now);
    } // "all" -> show all

    if (aptQuery) {
      filtered = filtered.filter((a) => {
        const u = users.find((u) => u.id === a.userId);
        const s = services.find((s) => s.id === a.serviceId);
        const matchUser = u?.name
          ?.toLowerCase()
          .includes(aptQuery.toLowerCase());
        const matchService = s?.name
          ?.toLowerCase()
          .includes(aptQuery.toLowerCase());
        return matchUser || matchService;
      });
    }
    return filtered.sort(
      (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
    );
  }, [appointments, aptQuery, activeSegment, services, users]);

  const hasOverlap = useMemo(() => {
    if (!aptFormData.startAt || !aptFormData.serviceId) return false;
    const durOpt = services.find(
      (s) => s.id === aptFormData.serviceId,
    )?.durationMinutes;
    if (!durOpt) return false;

    const start = new Date(
      businessDateTimeInputToIso(aptFormData.startAt),
    ).getTime();
    const end = start + durOpt * 60000;

    return appointments.some((a) => {
      if (editingApt && a.id === editingApt.id) return false;
      if (a.status === "CANCELLED") return false;
      const aStart = new Date(a.startAt).getTime();
      const aEnd = new Date(a.endAt).getTime();
      return start < aEnd && end > aStart;
    });
  }, [aptFormData, appointments, services, editingApt]);

  function openCreateAptModal() {
    setEditingApt(null);
    setAptFormData({
      userId: users[0]?.id || "",
      serviceId: services[0]?.id || "",
      startAt: formatDateTimeInputInBusinessTime(new Date()),
      notes: "",
      status: "PENDING",
    });
    setIsAptModalOpen(true);
  }

  function openEditAptModal(apt: Appointment) {
    setEditingApt(apt);
    setAptFormData({
      userId: apt.userId,
      serviceId: apt.serviceId,
      startAt: formatDateTimeInputInBusinessTime(apt.startAt),
      notes: apt.notes || "",
      status: apt.status,
    });
    setIsAptModalOpen(true);
  }

  async function handleAptSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingApt
        ? `/api/admin/appointments/${editingApt.id}`
        : "/api/admin/appointments";
      const method = editingApt ? "PATCH" : "POST";

      const duration =
        services.find((s) => s.id === aptFormData.serviceId)?.durationMinutes ||
        60;
      const startAt = businessDateTimeInputToIso(aptFormData.startAt);
      const endAt = new Date(
        new Date(startAt).getTime() + duration * 60000,
      ).toISOString();

      const payload = {
        ...aptFormData,
        startAt,
        endAt,
        durationMinutes: duration,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        const newApt = data.data.appointment;
        if (editingApt) {
          setAppointments((prev) =>
            prev.map((a) => (a.id === editingApt.id ? newApt : a)),
          );
          toast.success("Cita actualizada.");
        } else {
          setAppointments((prev) => [newApt, ...prev]);
          toast.success("Cita programada con éxito.");
        }
        setIsAptModalOpen(false);
      } else {
        toast.error(data.error?.message || "Error al procesar la cita.");
      }
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteApt() {
    if (!aptToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/appointments/${aptToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== aptToDelete));
        toast.success("Cita eliminada.");
      } else {
        toast.error(data.error?.message || "Error al eliminar.");
      }
    } catch {
      toast.error("Error de red.");
    } finally {
      setIsDeleting(false);
      setAptToDelete(null);
    }
  }

  return (
    <>
      <Card className="border-[var(--line)] overflow-hidden">
        <CardHeader className="bg-[var(--quartz-soft)]/30 border-b border-[var(--line)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display text-2xl">
                Agenda y Reservas
              </CardTitle>
              <CardDescription>
                Visualiza y administra todas las citas del salón.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex bg-white rounded-xl border border-[var(--line)] p-1 w-full sm:w-auto h-10 shrink-0 overflow-x-auto">
                {["upcoming", "past", "all"].map((seg) => (
                  <button
                    key={seg}
                    type="button"
                    onClick={() => setActiveSegment(seg)}
                    className={cn(
                      "px-3 text-xs font-bold rounded-lg transition-colors flex-1 sm:flex-none uppercase tracking-widest whitespace-nowrap",
                      activeSegment === seg
                        ? "bg-[var(--quartz)] text-[var(--ink)] shadow-sm"
                        : "text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--quartz-soft)]",
                    )}
                  >
                    {seg === "upcoming"
                      ? "Próximas"
                      : seg === "past"
                        ? "Pasadas"
                        : "Todas"}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-56 h-10 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-soft)]" />
                <Input
                  placeholder="Buscar clienta..."
                  className="pl-9 h-10 bg-white border border-[var(--line)] rounded-xl"
                  value={aptQuery}
                  onChange={(e) => setAptQuery(e.target.value)}
                />
              </div>
              <Button
                variant="gold"
                className="h-10 shrink-0"
                onClick={openCreateAptModal}
              >
                <Plus className="mr-2 size-4" /> Nueva Cita
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--quartz-soft)]/50 text-[var(--ink-soft)] uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Clienta</th>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Fecha y Hora</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-[var(--ink-soft)] text-sm"
                    >
                      No se encontraron citas
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="hover:bg-white transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[var(--ink)]">
                          {users.find((u) => u.id === apt.userId)?.name ||
                            "Invitada"}
                        </div>
                        <div className="text-[10px] text-[var(--ink-soft)]">
                          {users.find((u) => u.id === apt.userId)?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="default"
                          className="bg-[var(--quartz-soft)] border-none"
                        >
                          {services.find((s) => s.id === apt.serviceId)?.name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {formatDate(apt.startAt, "d MMM, yyyy")}
                        </div>
                        <div className="text-xs text-[var(--ink-soft)]">
                          {formatTime(apt.startAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={cn(
                            "font-bold",
                            apt.status === "PENDING" &&
                              "bg-emerald-50 text-emerald-700 border-emerald-100",
                            apt.status === "PENDING" &&
                              "bg-amber-50 text-amber-700 border-amber-100",
                            apt.status === "CANCELLED" &&
                              "bg-rose-50 text-rose-700 border-rose-100",
                          )}
                        >
                          {statusLabels[apt.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => openEditAptModal(apt)}
                            >
                              Ver / Editar Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditAptModal(apt)}
                            >
                              Reagendar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-rose-600"
                              onClick={() => setAptToDelete(apt.id)}
                            >
                              Cancelar Cita
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAptModalOpen} onOpenChange={setIsAptModalOpen}>
        <DialogContent className="sm:max-w-[550px] overflow-hidden p-0 glass-panel">
          <div className="bg-[linear-gradient(135deg,var(--ink)_0%,#241f26_58%,#3a3037_100%)] p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="size-12 rounded-2xl bg-[var(--gold)] flex items-center justify-center">
                  <CalendarDays className="size-6 text-[var(--ink)]" />
                </div>
                <div>
                  <DialogTitle className="font-display text-3xl text-white">
                    {editingApt ? "Re-agendar Cita" : "Nueva Reserva"}
                  </DialogTitle>
                  <DialogDescription className="text-white/75">
                    Gestiona la agenda con precisión y elegancia.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleAptSubmit}
            className="p-8 space-y-5 bg-transparent"
          >
            {hasOverlap && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="size-5 shrink-0 mt-0.5 text-amber-600" />
                <div className="text-sm leading-relaxed">
                  <span className="font-bold block mb-1">
                    Cruce de Horarios Detectado
                  </span>
                  El horario seleccionado se solapa con otra reserva confirmada
                  en la base de datos.
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                Clienta
              </Label>
              <Select
                value={aptFormData.userId}
                onValueChange={(val) =>
                  setAptFormData({ ...aptFormData, userId: val })
                }
              >
                <SelectTrigger className="h-12 border-[var(--line)] rounded-xl">
                  <SelectValue placeholder="Selecciona una clienta..." />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {users
                    .filter((u) => u.role !== "ADMIN")
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>{user.name}</span>
                          <span className="text-[10px] text-[var(--ink-soft)] opacity-70 ml-2 truncate max-w-[150px]">
                            {user.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                Servicio a Realizar
              </Label>
              <Select
                value={aptFormData.serviceId}
                onValueChange={(val) =>
                  setAptFormData({ ...aptFormData, serviceId: val })
                }
              >
                <SelectTrigger className="h-12 border-[var(--line)] rounded-xl">
                  <SelectValue placeholder="Selecciona un servicio..." />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center justify-between w-full pr-4">
                        <span>{service.name}</span>
                        <span className="text-xs font-bold text-[var(--gold)] ml-4">
                          {service.durationMinutes} min
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Fecha y Hora
                </Label>
                <Input
                  className="h-12 border-[var(--line)] rounded-xl"
                  type="datetime-local"
                  value={aptFormData.startAt}
                  onChange={(e) =>
                    setAptFormData({ ...aptFormData, startAt: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Estado
                </Label>
                <Select
                  value={aptFormData.status}
                  onValueChange={(val) =>
                    setAptFormData({
                      ...aptFormData,
                      status: val as AppointmentStatus,
                    })
                  }
                >
                  <SelectTrigger className="h-12 border-[var(--line)] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="PAID">Pagada</SelectItem>
                    <SelectItem value="COMPLETED">Completada</SelectItem>
                    <SelectItem value="NO_SHOW">No Asistió</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                Notas de la Reserva
              </Label>
              <textarea
                className="w-full h-20 p-4 rounded-xl border border-[var(--line)] bg-white text-sm focus:ring-2 focus:ring-[var(--gold)] outline-none transition-all resize-none"
                placeholder="Limitaciones, solicitudes especiales o color de preferencia..."
                value={aptFormData.notes}
                onChange={(e) =>
                  setAptFormData({ ...aptFormData, notes: e.target.value })
                }
              />
            </div>

            <DialogFooter className="border-t border-[var(--line)] pt-6 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAptModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="gold"
                disabled={isSubmitting || hasOverlap}
                className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-[var(--gold-soft)]/20"
              >
                {isSubmitting
                  ? "Procesando..."
                  : editingApt
                    ? "Confirmar Cambios"
                    : "Agendar Cita"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!aptToDelete}
        onOpenChange={(open) => !open && setAptToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se notificará a la clienta si es
              necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void deleteApt();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
