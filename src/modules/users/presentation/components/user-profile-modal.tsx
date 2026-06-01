"use client";

import Image from "next/image";
import { Camera, PencilLine } from "lucide-react";
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

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  image: string;
};

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function UserProfileModal({
  isOpen,
  onOpenChange,
  profileData,
  setProfileData,
  isSubmitting,
  onSubmit,
  onImageChange,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 flex flex-col max-h-[90vh] overflow-hidden border border-white/70 bg-white/[0.96] rounded-3xl shadow-[0_28px_90px_rgba(18,16,20,0.18)]">
        <div className="shrink-0 bg-[linear-gradient(135deg,var(--gold-soft),var(--gold))] p-8 text-[var(--ink)]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <PencilLine className="size-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-3xl">
                  Personalizar Perfil
                </DialogTitle>
                <DialogDescription className="text-[var(--ink)]/60">
                  Tu imagen e información para una experiencia exclusiva.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-6 bg-white/[0.96]"
        >
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="relative size-28 rounded-full bg-[var(--quartz-soft)] border-4 border-[var(--gold-soft)] overflow-hidden shadow-xl">
                {profileData.image ? (
                  <Image
                    src={profileData.image}
                    alt="Profile"
                    fill
                    sizes="112px"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-4xl font-display text-[var(--gold)]">
                    {profileData.name.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 size-10 bg-[var(--ink)] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--gold)] transition-colors shadow-lg border-2 border-white">
                <Camera className="size-5" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onImageChange}
                />
              </label>
            </div>
            <p className="mt-3 text-[10px] text-[var(--ink-soft)] font-bold uppercase tracking-widest">
              Foto de Perfil
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]"
              >
                Nombre Completo
              </Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="h-12 rounded-xl border-[var(--line)] bg-[var(--quartz-soft)]/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]"
              >
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className="h-12 rounded-xl border-[var(--line)] bg-[var(--quartz-soft)]/30"
                required
              />
              <p className="text-[10px] text-[var(--gold)] mt-1">
                * Cambiar el correo actualizará tu acceso al sistema.
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]"
              >
                Teléfono de Contacto
              </Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                className="h-12 rounded-xl border-[var(--line)] bg-[var(--quartz-soft)]/30"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-[var(--line)] pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-[var(--gold-soft)]/20"
            >
              {isSubmitting ? "Guardando..." : "Actualizar Perfil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
