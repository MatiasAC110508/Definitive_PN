import { History, RotateCcw, XCircle } from "lucide-react";
import type { Appointment } from "@/domain/entities/appointment.entity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/formatters";

type Props = {
  history: Appointment[];
  isActionLoading: string | null;
  onDeleteClick: (id: string) => void;
  serviceNameFormatter: (serviceId: string) => string;
};

export function UserHistoryCard({
  history,
  isActionLoading,
  onDeleteClick,
  serviceNameFormatter,
}: Props) {
  return (
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
              <div
                key={appointment.id}
                className="flex items-center justify-between p-6 text-sm hover:bg-[var(--quartz-soft)]/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-[var(--gold)]" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">
                      {serviceNameFormatter(appointment.serviceId)}
                    </span>
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
                  onClick={() => onDeleteClick(appointment.id)}
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
  );
}
