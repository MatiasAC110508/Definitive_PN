"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  Star,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { Sale } from "@/domain/entities/sale.entity";

export function AdminSalesTab({
  sales,
  setSales,
}: {
  sales: Sale[];
  setSales: (sales: Sale[]) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    amount: "",
    description: "",
    saleType: "OTHER" as "SERVICE" | "PRODUCT" | "PACKAGE" | "OTHER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      toast.error("El monto y la descripción son obligatorios.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      if (!res.ok) throw new Error("Error al registrar la venta");
      const data = await res.json();

      setSales([data.sale, ...sales]);
      toast.success("Venta registrada exitosamente");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Ocurrió un error inesperado al registrar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSale = async () => {
    if (!saleToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/sales/${saleToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar venta");

      setSales(sales.filter((s) => s.id !== saleToDelete));
      toast.success("Venta eliminada correctamente");
      setSaleToDelete(null);
    } catch (error) {
      toast.error("No se pudo eliminar la venta.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getSaleTypeColor = (type: string) => {
    switch (type) {
      case "SERVICE":
        return "text-blue-600 bg-blue-50";
      case "PRODUCT":
        return "text-emerald-600 bg-emerald-50";
      case "PACKAGE":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
            Registro de Ventas
          </h2>
          <p className="text-sm font-light text-[var(--ink-soft)]/80">
            Administra ventas vía WhatsApp o manuales para un correcto tracking
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-end mr-4">
            <span className="text-xs uppercase tracking-widest text-[var(--ink-soft)]/60 font-bold">
              Total Registrado
            </span>
            <span className="font-display text-xl font-bold text-[var(--gold)]">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <Button
            onClick={() => {
              setFormData({
                customerName: "",
                amount: "",
                description: "",
                saleType: "OTHER",
              });
              setIsModalOpen(true);
            }}
            className="bg-[var(--ink)] hover:bg-[var(--ink)]/90 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full md:w-auto"
          >
            <Plus className="size-4 mr-2" /> Nueva Venta
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[var(--gold)]/30"
          >
            <div className="flex justify-between items-start mb-4">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSaleTypeColor(sale.saleType)}`}
              >
                {sale.saleType}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSaleToDelete(sale.id)}
                className="size-8 text-[var(--ink-soft)]/40 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <h3 className="font-display font-semibold text-xl text-[var(--ink)] mb-1">
              {formatCurrency(sale.amount)}
            </h3>
            <p className="text-sm text-[var(--ink-soft)] mb-4">
              {sale.description}
            </p>

            <div className="mt-auto space-y-2 text-xs text-[var(--ink-soft)] font-light border-t border-[var(--line)] pt-4">
              <div className="flex items-center gap-2">
                <Star className="size-3.5 text-[var(--gold)]" />
                <span className="truncate">
                  {sale.customerName || "Cliente anónimo"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[var(--ink-soft)]/60">
                <Calendar className="size-3.5" />
                <span>{new Date(sale.createdAt).toLocaleString("es-CO")}</span>
              </div>
            </div>
          </div>
        ))}

        {sales.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-[var(--line)] rounded-2xl p-12 text-center text-[var(--ink-soft)]/60 bg-white/50">
            <TrendingUp className="size-12 mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-lg text-[var(--ink-soft)] mb-1">
              No hay ventas manuales registradas
            </p>
            <p className="text-sm font-light">
              Comienza registrando tus ventas por WhatsApp para mantener tus
              finanzas al día.
            </p>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display text-2xl font-semibold text-[var(--ink)]">
              Registrar Venta Manual
            </DialogTitle>
            <DialogDescription>
              Añade el ingreso de una venta realizada por otros canales (ej.
              WhatsApp).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                Detalle / Descripción{" "}
                <span className="text-[var(--gold)] text-lg leading-none">
                  *
                </span>
              </Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ej. Uñas Acrílicas + Pedicure"
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Monto Cobrado (COP){" "}
                  <span className="text-[var(--gold)] text-lg leading-none">
                    *
                  </span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-soft)]" />
                  <Input
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="250000"
                    className="pl-9 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ MozAppearance: "textfield" }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 flex-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                Cliente (Opcional)
              </Label>
              <Input
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder="Ej. Maria Perez (310...)"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                Tipo de Venta
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { id: "SERVICE", label: "Servicio" },
                  { id: "PRODUCT", label: "Producto" },
                  { id: "PACKAGE", label: "Paquete" },
                  { id: "OTHER", label: "Otro" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, saleType: t.id as any })
                    }
                    className={`py-2 px-3 text-sm font-semibold rounded-lg border transition-all ${
                      formData.saleType === t.id
                        ? "bg-[var(--gold-soft)]/20 border-[var(--gold)] text-[var(--gold)]"
                        : "bg-white border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--gold)]/50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="gold" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Registrar Ingreso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!saleToDelete}
        onOpenChange={(open) => !open && setSaleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará la venta definitivamente y restará el dinero del
              registro total.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void deleteSale();
              }}
              className="bg-rose-600 focus:ring-rose-600 hover:bg-rose-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
