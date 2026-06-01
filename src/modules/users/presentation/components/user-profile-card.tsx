import Image from "next/image";
import {
  Mail,
  Phone,
  CalendarClock,
  RotateCcw,
  PencilLine,
} from "lucide-react";
import type { User } from "@/domain/entities/user.entity";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  user: User;
  appointmentsCount: number;
  isLoading: boolean;
  onRefresh: () => void;
  onEditClick: () => void;
};

export function UserProfileCard({
  user,
  appointmentsCount,
  isLoading,
  onRefresh,
  onEditClick,
}: Props) {
  return (
    <Card className="glass-card border-none shadow-2xl overflow-hidden rounded-3xl sticky top-24">
      <div className="h-24 bg-gradient-to-r from-[var(--gold-soft)] to-[var(--gold)]" />
      <CardContent className="p-8 -mt-12 text-center">
        <div className="relative inline-block group">
          <div className="size-32 rounded-full bg-white p-1 border-4 border-white shadow-xl relative overflow-hidden">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                fill
                sizes="128px"
                unoptimized
                className="rounded-full object-cover"
              />
            ) : (
              <div className="size-full rounded-full bg-[var(--quartz-soft)] flex items-center justify-center font-display text-5xl text-[var(--gold)]">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-display text-3xl font-bold text-[var(--ink)]">
            {user.name}
          </h3>
          <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-[0.3em] mt-1">
            Miembro Exclusivo
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--quartz-soft)]/50 border border-[var(--line)]/50">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-[var(--gold)]" />
              <div className="text-left">
                <p className="text-[9px] font-bold text-[var(--ink-soft)] uppercase tracking-wider">
                  Email
                </p>
                <p className="text-xs font-semibold text-[var(--ink)] flex-1 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--quartz-soft)]/50 border border-[var(--line)]/50">
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-[var(--gold)]" />
              <div className="text-left">
                <p className="text-[9px] font-bold text-[var(--ink-soft)] uppercase tracking-wider">
                  Teléfono
                </p>
                <p className="text-xs font-semibold text-[var(--ink)] flex-1 truncate">
                  {user.phone || "No registrado"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--quartz-soft)]/50 border border-[var(--line)]/50">
            <div className="flex items-center gap-3">
              <CalendarClock className="size-4 text-[var(--gold)]" />
              <div className="text-left">
                <p className="text-[9px] font-bold text-[var(--ink-soft)] uppercase tracking-wider">
                  Citas Totales
                </p>
                <p className="text-xs font-semibold text-[var(--ink)] flex-1 truncate">
                  {appointmentsCount} rituales
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">
          <Button
            variant="ghost"
            className="rounded-xl border border-[var(--line)] h-12"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RotateCcw
              className={cn("size-4 mr-2", isLoading && "animate-spin")}
            />
            Recargar
          </Button>
          <Button
            variant="luxury"
            className="rounded-xl h-12 font-bold shadow-lg"
            onClick={onEditClick}
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
  );
}
