"use client";

import { RotateCcw } from "lucide-react";
import type { Appointment } from "@/domain/entities/appointment.entity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate, formatTime } from "@/lib/formatters";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAppointment: Appointment | null;
  isActionLoading: string | null;
  onDateChange: (newDateStr: string) => void;
  onReschedule: () => void;
};

export function UserRescheduleModal({
  isOpen,
  onOpenChange,
  selectedAppointment,
  isActionLoading,
  onDateChange,
  onReschedule,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border border-white/70 bg-white/[0.96] p-0 flex flex-col max-h-[90vh] overflow-hidden shadow-[0_28px_90px_rgba(18,16,20,0.18)]">
        <div className="p-8 pb-0 shrink-0">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2 text-[var(--ink)]">
              <RotateCcw className="size-5 text-[var(--gold)]" />
              Reagendar Cita
            </DialogTitle>
            <DialogDescription className="text-[var(--ink-soft)]">
              Selecciona una nueva fecha y hora para tu ritual de belleza.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 p-8 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
              Nueva Fecha y Hora
            </Label>
            <Input
              type="datetime-local"
              className="h-12 rounded-xl border-[var(--line)] bg-[var(--quartz-soft)]/30"
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>

          {selectedAppointment?.startAt && (
            <div className="p-4 rounded-2xl bg-[var(--quartz-soft)] border border-[var(--gold-soft)]/20 text-sm">
              <p className="font-semibold text-[var(--gold)] mb-1">
                Nuevo horario propuesto:
              </p>
              <p className="text-[var(--ink)]">
                {formatDate(selectedAppointment.startAt, "EEEE d 'de' MMMM")} a
                las {formatTime(selectedAppointment.startAt)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-[var(--line)] p-8 pt-6">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="gold"
            className="flex-1 font-bold shadow-lg shadow-[var(--gold-soft)]/20"
            disabled={
              !selectedAppointment || isActionLoading === selectedAppointment.id
            }
            onClick={onReschedule}
          >
            {isActionLoading === selectedAppointment?.id
              ? "Procesando..."
              : "Confirmar Cambio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
