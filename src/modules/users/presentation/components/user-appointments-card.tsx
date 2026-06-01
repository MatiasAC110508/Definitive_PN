import Link from "next/link";
import {
  CalendarClock,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { Appointment } from "@/domain/entities/appointment.entity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type Props = {
  upcoming: Appointment[];
  isActionLoading: string | null;
  onRescheduleClick: (appointment: Appointment) => void;
  onCancelClick: (id: string) => void;
  serviceNameFormatter: (serviceId: string) => string;
};

const statusLabels = {
  PAID: "Pagada",
  COMPLETED: "Completada",
  NO_SHOW: "No Asistió",
  PENDING: "Pendiente",
  CANCELLED: "Cancelada",
};

export function UserAppointmentsCard({
  upcoming,
  isActionLoading,
  onRescheduleClick,
  onCancelClick,
  serviceNameFormatter,
}: Props) {
  return (
    <Card className="glass-card overflow-hidden rounded-3xl border-none shadow-xl">
      <CardHeader className="border-b border-[var(--line)]/50 pb-4 bg-[var(--quartz-soft)]/30">
        <CardTitle className="flex items-center gap-2 text-2xl font-display">
          <CalendarClock
            aria-hidden="true"
            className="size-5 text-[var(--gold)]"
          />
          Próximos Encuentros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {upcoming.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex size-16 items-center justify-center rounded-full bg-[var(--quartz-soft)] mb-6">
              <Sparkles className="size-8 text-[var(--gold)] opacity-40" />
            </div>
            <h3 className="font-display text-3xl font-semibold">
              Sin citas activas
            </h3>
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
                        appointment.status === "PENDING"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-100",
                      )}
                      variant="default"
                    >
                      {appointment.status === "PENDING" ? (
                        <CheckCircle2 className="mr-1 size-3" />
                      ) : null}
                      {
                        statusLabels[
                          appointment.status as keyof typeof statusLabels
                        ]
                      }
                    </Badge>
                    <h2 className="font-display text-3xl font-semibold text-[var(--ink)]">
                      {serviceNameFormatter(appointment.serviceId)}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-[var(--ink-soft)]">
                      <span className="capitalize">
                        {formatDate(appointment.startAt, "EEEE")}
                      </span>
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
                    onClick={() => onRescheduleClick(appointment)}
                  >
                    <RotateCcw className="mr-2 size-4" />
                    Reagendar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isActionLoading === appointment.id}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl"
                    onClick={() => onCancelClick(appointment.id)}
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
  );
}
