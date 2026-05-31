"use client";

import { useState } from "react";
import { Schedule } from "@/domain/entities/schedule.entity";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminSchedulesTabProps {
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
}

const dayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function AdminSchedulesTab({
  schedules,
  setSchedules,
}: AdminSchedulesTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local updating (unpersisted until saved)
  function handleScheduleTimeChange(
    id: string,
    field: "startTime" | "endTime",
    value: string,
  ) {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  function updateSchedule(id: string, updates: Partial<Schedule>) {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  }

  async function saveAllSchedules() {
    setIsSubmitting(true);
    try {
      // In a real application, we would hit a bulk update API
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Horarios actualizados correctamente.");
    } catch {
      toast.error("Error al actualizar horarios.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-[var(--line)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-2xl">
              Horarios de Operación
            </CardTitle>
            <CardDescription>
              Define cuándo está abierto Perfect Nails para reservas.
            </CardDescription>
          </div>
          <Button
            variant="gold"
            size="sm"
            onClick={saveAllSchedules}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--line)] bg-white/50 transition-all hover:border-[var(--gold)]"
            >
              {/* Row 1: Day name + badge */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--ink)]">
                  {dayNames[schedule.dayOfWeek % 7]}
                </span>
                <Badge
                  variant={schedule.isActive ? "gold" : "dark"}
                  className="w-20 justify-center"
                >
                  {schedule.isActive ? "Activo" : "Cerrado"}
                </Badge>
              </div>

              {/* Row 2: Times + toggle button */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                  <Clock className="size-4 text-[var(--ink-soft)] shrink-0" />
                  <Input
                    className="w-full max-w-[100px] h-9 bg-white"
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) =>
                      handleScheduleTimeChange(
                        schedule.id,
                        "startTime",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <span className="text-[var(--ink-soft)] font-medium">a</span>
                <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                  <Clock className="size-4 text-[var(--ink-soft)] shrink-0" />
                  <Input
                    className="w-full max-w-[100px] h-9 bg-white"
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) =>
                      handleScheduleTimeChange(
                        schedule.id,
                        "endTime",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "font-bold shrink-0",
                    schedule.isActive
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-emerald-600 hover:bg-emerald-50",
                  )}
                  onClick={() =>
                    updateSchedule(schedule.id, {
                      isActive: !schedule.isActive,
                    })
                  }
                >
                  {schedule.isActive ? "Cerrar" : "Abrir"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
