"use client";

import { useSearchParams, useRouter } from "next/navigation";
import type { Route } from "next";
import { useSession } from "next-auth/react";
import { CalendarDays, CheckCircle2, Clock, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { AppointmentSlot, AppointmentStatus } from "@/domain/entities/appointment.entity";
import type { BeautyService } from "@/domain/entities/service.entity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { WeeklyGrid } from "./weekly-grid";

type BookingWorkspaceProps = {
  services: BeautyService[];
  initialSlots: AppointmentSlot[];
  initialDate: string;
};

const statusLabels: Record<AppointmentStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  PENDING: "Pendiente",
  CANCELLED: "Cancelado",
};

const statusStyles: Record<AppointmentStatus, string> = {
  AVAILABLE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RESERVED: "border-rose-200 bg-rose-50 text-rose-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CANCELLED: "border-zinc-200 bg-zinc-50 text-zinc-500",
};

export function BookingWorkspace({ services, initialSlots, initialDate }: BookingWorkspaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const defaultServiceId = searchParams.get("serviceId") ?? services[0]?.id ?? "";
  const [selectedServiceId, setSelectedServiceId] = useState(defaultServiceId);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [slots, setSlots] = useState(initialSlots);
  const [view, setView] = useState<"day" | "week">("day");
  const [notes, setNotes] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedService = services.find((service) => service.id === selectedServiceId);

  const weekDays = useMemo(() => {
    const start = new Date(`${selectedDate}T00:00:00`);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date.toISOString().slice(0, 10);
    });
  }, [selectedDate]);

  useEffect(() => {
    let active = true;

    async function loadSlots() {
      setLoadingSlots(true);
      const response = await fetch(
        `/api/appointments?date=${selectedDate}&serviceId=${selectedServiceId}`,
      );
      const payload = (await response.json()) as { data?: { slots: AppointmentSlot[] } };

      if (active && payload.data?.slots) {
        setSlots(payload.data.slots);
        setSelectedSlot(null);
      }

      setLoadingSlots(false);
    }

    void loadSlots();

    return () => {
      active = false;
    };
  }, [selectedDate, selectedServiceId]);

  async function confirmBooking() {
    if (!selectedService || !selectedSlot) {
      toast.error("Selecciona servicio y horario.");
      return;
    }

    if (!session?.user) {
      router.push(`/login?callbackUrl=/reservar?serviceId=${selectedService.id}` as Route);
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: selectedService.id,
        startAt: selectedSlot.startAt,
        notes,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: { message?: string } };
      toast.error(payload.error?.message ?? "No pudimos confirmar la reserva.");
      setSubmitting(false);
      return;
    }

    toast.success("Reserva creada. Te enviaremos confirmación por correo.");
    setSubmitting(false);
    router.refresh();
    router.push("/panel");
  }

  return (
    <div className="pt-[4.5rem]">
      <section className="marble-surface px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Badge variant="gold">Agenda profesional</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight text-[var(--ink)] sm:text-6xl">
            Reserva tu cita con disponibilidad por hora
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
            Navega vista diaria o semanal, selecciona el servicio y confirma visualmente tu bloque.
            Para completar la reserva necesitas una cuenta verificada.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[320px_1fr_340px] lg:px-8">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Selecciona un servicio</Label>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedService ? (
              <div className="rounded-lg bg-[var(--quartz-soft)] p-4">
                <p className="font-display text-2xl font-semibold">{selectedService.name}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  {selectedService.description}
                </p>
                <div className="mt-4 grid gap-2 text-sm font-semibold text-[var(--ink)]">
                  <span className="flex items-center gap-2">
                    <Clock aria-hidden="true" className="size-4 text-[var(--gold)]" />
                    {selectedService.durationMinutes} minutos
                  </span>
                  <span className="flex items-center gap-2">
                    <Sparkles aria-hidden="true" className="size-4 text-[var(--gold)]" />
                    {formatCurrency(selectedService.price)}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="booking-notes">Notas para la especialista</Label>
              <Textarea
                id="booking-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Color, referencia, ocasión especial..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Calendario</CardTitle>
              <p className="text-sm text-[var(--ink-soft)]">
                {formatDate(`${selectedDate}T00:00:00`, "EEEE d 'de' MMMM")}
              </p>
            </div>
            <Tabs value={view} onValueChange={(value) => setView(value as "day" | "week")}>
              <TabsList>
                <TabsTrigger value="day">Día</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {view === "day" && (
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                {[selectedDate].map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "premium-focus min-w-32 rounded-lg border px-4 py-3 text-left transition",
                      "border-[var(--gold)] bg-[var(--ink)] text-white",
                    )}
                  >
                    <span className="block text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                      {formatDate(`${date}T00:00:00`, "EEE")}
                    </span>
                    <span className="mt-1 block font-display text-2xl font-semibold">
                      {formatDate(`${date}T00:00:00`, "d MMM")}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {view === "week" ? (
              <WeeklyGrid
                days={weekDays}
                serviceId={selectedServiceId}
                selectedSlotId={selectedSlot?.id}
                onSlotSelect={(date, slot) => {
                  setSelectedDate(date);
                  setSelectedSlot(slot);
                }}
              />
            ) : loadingSlots ? (
              <div className="grid min-h-96 place-items-center rounded-lg bg-white/60">
                <Loader2 aria-hidden="true" className="size-8 animate-spin text-[var(--gold)]" />
              </div>
            ) : (
              <div className="grid gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={slot.status !== "AVAILABLE"}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "premium-focus grid grid-cols-[80px_1fr_auto] items-center gap-3 rounded-lg border p-4 text-left transition",
                      selectedSlot?.id === slot.id
                        ? "border-[var(--gold)] bg-[#fff7df]"
                        : "border-[var(--line)] bg-white/70",
                      slot.status !== "AVAILABLE" && "cursor-not-allowed opacity-70",
                    )}
                  >
                    <span className="font-semibold">{slot.label}</span>
                    <span className="h-px bg-[var(--line)]" />
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold",
                        statusStyles[slot.status],
                      )}
                    >
                      {statusLabels[slot.status]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Confirmación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg bg-[var(--quartz-soft)] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--gold)]">
                <CalendarDays aria-hidden="true" className="size-4" />
                Resumen de reserva
              </div>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--ink-soft)]">Servicio</dt>
                  <dd className="text-right font-semibold">{selectedService?.name ?? "Pendiente"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--ink-soft)]">Fecha</dt>
                  <dd className="text-right font-semibold">
                    {formatDate(`${selectedDate}T00:00:00`)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--ink-soft)]">Hora</dt>
                  <dd className="text-right font-semibold">{selectedSlot?.label ?? "Sin elegir"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--ink-soft)]">Estado</dt>
                  <dd className="text-right font-semibold">Pendiente</dd>
                </div>
              </dl>
            </div>

            {!session?.user ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                Para confirmar tu cita debes crear una cuenta o iniciar sesión.
              </div>
            ) : null}

            <Button
              type="button"
              className="w-full"
              disabled={!selectedSlot || submitting}
              onClick={() => void confirmBooking()}
            >
              {submitting ? <Loader2 aria-hidden="true" className="animate-spin" /> : <CheckCircle2 aria-hidden="true" />}
              Confirmar reserva
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
