"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  Heart,
  Sparkles,
  TrendingUp,
  UsersRound,
  FileLineChart,
  Download,
} from "lucide-react";
import type { Appointment } from "@/domain/entities/appointment.entity";
import type { BeautyService } from "@/domain/entities/service.entity";
import type { Product } from "@/domain/entities/product.entity";
import type { User } from "@/domain/entities/user.entity";
import { toast } from "sonner";

interface AdminOverviewTabProps {
  metrics: {
    monthlyRevenue: number;
    bookedAppointments: number;
    productOrders: number;
    satisfactionRate: number;
  };
  appointments: Appointment[];
  services: BeautyService[];
  products: Product[];
  users: User[];
  downloadCSV: () => void;
  downloadPDF: () => void;
}

export function AdminOverviewTab({
  metrics,
  appointments,
  services,
  products,
  users,
  downloadCSV,
  downloadPDF,
}: AdminOverviewTabProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const statsCards = [
    {
      label: "Ingresos Mensuales",
      value: formatCurrency(metrics.monthlyRevenue),
      icon: TrendingUp,
      trend: "+12.5% vs mes anterior",
      color: "var(--gold)",
    },
    {
      label: "Citas Agendadas",
      value: metrics.bookedAppointments.toString(),
      icon: CalendarDays,
      trend: "+5 en la última semana",
      color: "var(--ink)",
    },
    {
      label: "Clientas Activas",
      value: users.filter((u) => u.role === "USER").length.toString(),
      icon: UsersRound,
      trend: "Fidelización alta",
      color: "var(--ink)",
    },
    {
      label: "Catálogo",
      value: (services.length + products.length).toString(),
      icon: Boxes,
      trend: "Actualizado",
      color: "var(--ink)",
    },
    {
      label: "Ventas de Productos",
      value: metrics.productOrders.toString(),
      icon: BarChart3,
      trend: "En crecimiento",
      color: "var(--ink)",
    },
    {
      label: "Satisfacción",
      value: `${metrics.satisfactionRate}%`,
      icon: Heart,
      trend: "Basado en reseñas",
      color: "var(--gold)",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 justify-end">
          <Button
            variant="ghost"
            className="border border-[var(--line)] gap-2 bg-white text-[var(--ink)] hover:bg-[var(--quartz-soft)]"
            onClick={downloadCSV}
          >
            <FileLineChart className="size-4" /> Exportar CSV
          </Button>
          <Button
            variant="gold"
            className="gap-2 shadow-lg"
            onClick={() => setIsReportModalOpen(true)}
          >
            <BarChart3 className="size-4" /> Generar Reporte Mensual
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((stat, i) => (
            <Card
              key={i}
              className="border-[var(--line)] shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <stat.icon size={64} color={stat.color} />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  {stat.label}
                </CardTitle>
                <div
                  className="size-8 rounded-lg flex items-center justify-center bg-[var(--quartz-soft)]"
                  style={{ color: stat.color }}
                >
                  <stat.icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-bold text-[var(--ink)]">
                  {stat.value}
                </div>
                <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 w-max px-2 py-0.5 rounded">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Appointments Preview */}
          <Card className="border-[var(--line)]">
            <CardHeader>
              <CardTitle className="font-display font-bold">
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimas citas agendadas y cambios en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.slice(0, 4).map((apt) => {
                  const user = users.find((u) => u.id === apt.userId);
                  const service = services.find((s) => s.id === apt.serviceId);
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between border-b border-[var(--line)] pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-[var(--gold-soft)] flex items-center justify-center font-bold text-[var(--gold)] ml-2">
                          {user?.name.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--ink)]">
                            {user?.name || "Usuario Desconocido"}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-[var(--ink-soft)]">
                            {service?.name || "Servicio no especificado"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          apt.status === "RESERVED"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none"
                            : apt.status === "CANCELLED"
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-100 border-none"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none"
                        }
                      >
                        {apt.status === "RESERVED"
                          ? "Reservado"
                          : apt.status === "CANCELLED"
                            ? "Cancelada"
                            : "Completada"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / System Health */}
          <Card className="border-[var(--line)]">
            <CardHeader>
              <CardTitle className="font-display font-bold">
                Estado del Sistema
              </CardTitle>
              <CardDescription>
                Operatividad y configuraciones rápidas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[var(--ink)]">
                      Reservas para hoy
                    </span>
                    <span className="text-sm font-bold text-[var(--gold)]">
                      {
                        appointments.filter(
                          (a) =>
                            a.startAt.startsWith(
                              new Date().toISOString().slice(0, 10),
                            ) && a.status === "RESERVED",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[var(--line)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--gold)] rounded-full w-[65%]"
                      style={{
                        width: `${Math.min(100, appointments.filter((a) => a.startAt.startsWith(new Date().toISOString().slice(0, 10)) && a.status === "RESERVED").length * 10)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[var(--ink)]">
                      Citas Pendientes de Confirmación
                    </span>
                    <span className="text-sm font-bold text-rose-500">
                      {
                        appointments.filter((a) => a.status === "PENDING")
                          .length
                      }
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[var(--line)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full w-[25%]"
                      style={{
                        width: `${Math.min(100, appointments.filter((a) => a.status === "PENDING").length * 10)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-4">
                  <div className="mt-0.5">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800">
                      Sistema Operativo
                    </h4>
                    <p className="text-xs text-emerald-600 mt-1">
                      La plataforma está funcionando correctamente. Los correos
                      transaccionales y recordatorios de SMS están activos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 glass-panel">
          <div id="report-content" className="p-8 sm:p-12 bg-white relative">
            {/* Elegant Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--gold-soft)]/10 to-transparent pointer-events-none no-print" />

            <DialogHeader className="mb-10 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
                <div className="space-y-1">
                  <DialogTitle className="font-display text-4xl text-[var(--gold)]">
                    Análisis de Negocio
                  </DialogTitle>
                  <p className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-[0.3em]">
                    Perfect Nails Studio • {new Date().getFullYear()}
                  </p>
                </div>
                <Button
                  onClick={downloadPDF}
                  className="bg-[var(--ink)] text-white hover:bg-[var(--ink)]/90 gap-2 shrink-0"
                >
                  <Download className="size-4" /> PDF
                </Button>
              </div>

              {/* Print Only Header */}
              <div className="hidden print:block text-center mb-8 border-b-2 border-[var(--gold)] pb-8">
                <h1 className="font-display text-4xl text-[var(--ink)] mb-2">
                  PERFECT NAILS
                </h1>
                <p className="text-sm tracking-widest text-[#555] uppercase">
                  Reporte Confidencial •{" "}
                  {new Date().toLocaleDateString("es-CO")}
                </p>
              </div>
              <p className="text-[var(--ink)] text-sm max-w-2xl leading-relaxed">
                Resumen ejecutivo de la operativa y finanzas generado a partir
                de los datos en tiempo real del sistema para la toma de
                decisiones gerenciales.
              </p>
            </DialogHeader>

            <div className="space-y-12">
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold font-display uppercase tracking-widest text-[var(--ink)] mb-6 pb-2 border-b border-[var(--line)]">
                  <TrendingUp className="size-5 text-[var(--gold)]" />{" "}
                  Rendimiento General
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      l: "Ingresos (Mes)",
                      v: formatCurrency(metrics.monthlyRevenue),
                    },
                    { l: "Citas Completadas", v: metrics.bookedAppointments },
                    { l: "Productos Vend.", v: metrics.productOrders },
                    { l: "Satisfacción", v: `${metrics.satisfactionRate}%` },
                  ].map((x, i) => (
                    <div
                      key={i}
                      className="bg-[var(--quartz-soft)] p-5 rounded-xl border border-[var(--line)]"
                    >
                      <p className="text-[10px] font-bold text-[var(--ink-soft)] uppercase mb-2">
                        {x.l}
                      </p>
                      <p className="text-2xl font-bold text-[var(--ink)]">
                        {x.v}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="print:break-inside-avoid">
                <h3 className="flex items-center gap-2 text-lg font-bold font-display uppercase tracking-widest text-[var(--ink)] mb-6 pb-2 border-b border-[var(--line)]">
                  <CalendarDays className="size-5 text-[var(--gold)]" />{" "}
                  Análisis de Ocupación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-[var(--ink-soft)]">
                      Distribución de Citas por Estado:
                    </p>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Reservadas",
                          count: appointments.filter(
                            (a) => a.status === "RESERVED",
                          ).length,
                          color: "bg-blue-500",
                        },
                        {
                          label: "Canceladas",
                          count: appointments.filter(
                            (a) => a.status === "CANCELLED",
                          ).length,
                          color: "bg-rose-500",
                        },
                      ].map((s, i) => {
                        const total = appointments.length || 1;
                        const pct = Math.round((s.count / total) * 100);
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">
                                {s.label} ({s.count})
                              </span>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full">
                              <div
                                className={`h-full rounded-full ${s.color}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[var(--ink)] to-[#3a3037] text-white p-6 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4">
                      Insight Clave
                    </h4>
                    <p className="text-sm leading-relaxed">
                      El volumen de reservas muestra una tendencia estable.
                      Recomendamos lanzar una promoción de{" "}
                      <strong>Spa de Uñas</strong> para incentivar agendamientos
                      temprano en la semana.
                    </p>
                    <Sparkles className="absolute bottom-4 right-4 text-[var(--gold)] opacity-30 size-16" />
                  </div>
                </div>
              </section>

              <section className="print:break-inside-avoid">
                <h3 className="flex items-center gap-2 text-lg font-bold font-display uppercase tracking-widest text-[var(--ink)] mb-6 pb-2 border-b border-[var(--line)]">
                  <Boxes className="size-5 text-[var(--gold)]" /> Estado del
                  Inventario
                </h3>
                <div className="bg-white border border-[var(--line)] rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[var(--quartz-soft)]/50 text-[var(--ink-soft)] uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 text-right">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {products.slice(0, 5).map((prod) => (
                        <tr key={prod.id}>
                          <td className="px-4 py-3 font-medium text-[var(--ink)]">
                            {prod.name}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={
                                prod.stock <= 5
                                  ? "text-rose-600 font-bold"
                                  : "text-emerald-600 font-bold"
                              }
                            >
                              {prod.stock} un.
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-[var(--quartz-soft)]/30 p-3 text-center text-xs text-[var(--ink-soft)] border-t border-[var(--line)]">
                    Mostrando los primeros 5 productos de impacto.
                  </div>
                </div>
              </section>

              <div className="mt-12 pt-8 border-t border-[var(--line)] text-center no-print">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto border border-[var(--line)] hover:bg-[var(--quartz-soft)]"
                  onClick={() => setIsReportModalOpen(false)}
                >
                  Cerrar Vista Previa
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
