"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import type { AppointmentSlot } from "@/domain/entities/appointment.entity";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type WeeklyGridProps = {
  days: string[];
  serviceId: string;
  onSlotSelect: (date: string, slot: AppointmentSlot) => void;
  selectedSlotId?: string;
};

type DaySlots = {
  date: string;
  slots: AppointmentSlot[];
  loading: boolean;
};

const businessHours = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

export function WeeklyGrid({ days, serviceId, onSlotSelect, selectedSlotId }: WeeklyGridProps) {
  const [weeklyData, setWeeklyData] = useState<DaySlots[]>([]);

  useEffect(() => {
    let active = true;

    async function loadWeeklySlots() {
      const initialData = days.map((date) => ({ date, slots: [], loading: true }));
      setWeeklyData(initialData);

      const promises = days.map(async (date) => {
        const response = await fetch(`/api/appointments?date=${date}&serviceId=${serviceId}`);
        const payload = (await response.json()) as { data?: { slots: AppointmentSlot[] } };
        return { date, slots: payload.data?.slots ?? [], loading: false };
      });

      const results = await Promise.all(promises);
      if (active) {
        setWeeklyData(results);
      }
    }

    void loadWeeklySlots();

    return () => {
      active = false;
    };
  }, [days, serviceId]);

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-white/40 backdrop-blur-sm">
      <div className="min-w-[800px]">
        {/* Header: Days */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-[var(--line)]">
          <div className="bg-white/50 p-4" />
          {days.map((date) => (
            <div key={date} className="border-l border-[var(--line)] bg-white/50 p-4 text-center">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
                {formatDate(`${date}T00:00:00`, "EEEE")}
              </span>
              <span className="mt-1 block font-display text-lg font-semibold text-[var(--ink)]">
                {formatDate(`${date}T00:00:00`, "d MMM")}
              </span>
            </div>
          ))}
        </div>

        {/* Body: Hours x Days */}
        <div className="relative">
          {businessHours.map((hour) => (
            <div key={hour} className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-[var(--line)]">
              {/* Hour Label */}
              <div className="flex items-center justify-center bg-white/30 p-4 text-xs font-bold text-[var(--ink-soft)]">
                {hour}
              </div>

              {/* Day Columns */}
              {weeklyData.map((day) => {
                const slot = day.slots.find((s) => s.label === hour);
                const isSelected = selectedSlotId === slot?.id;
                const isAvailable = slot?.status === "AVAILABLE";

                return (
                  <div key={day.date} className="relative min-h-20 border-l border-[var(--line)] p-1">
                    {day.loading ? (
                      <div className="flex h-full items-center justify-center opacity-20">
                        <Loader2 className="size-4 animate-spin" />
                      </div>
                    ) : slot ? (
                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => onSlotSelect(day.date, slot)}
                        className={cn(
                          "premium-focus flex h-full w-full flex-col items-center justify-center rounded-md border p-2 text-center transition-all",
                          isAvailable
                            ? isSelected
                              ? "border-[var(--gold)] bg-[var(--gold)] text-white shadow-md scale-[1.02]"
                              : "border-emerald-100 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/80"
                            : "cursor-not-allowed border-zinc-100 bg-zinc-50/50 text-zinc-400"
                        )}
                      >
                        {isAvailable ? (
                          <>
                            <span className="text-[10px] font-bold">DISPONIBLE</span>
                            <span className="mt-1 text-xs font-semibold opacity-80">{hour}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="mb-1 size-3 opacity-30" />
                            <span className="text-[10px] font-medium opacity-60">OCUPADO</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] font-medium text-zinc-300">
                        CERRADO
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
