"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  Store,
  Box,
  Users2,
  CalendarDays,
  Cog,
  DollarSign,
} from "lucide-react";
import type { Appointment } from "@/domain/entities/appointment.entity";
import type { Sale } from "@/domain/entities/sale.entity";
import type { BeautyService } from "@/domain/entities/service.entity";
import type { Product } from "@/domain/entities/product.entity";
import type { Schedule } from "@/domain/entities/schedule.entity";
import type { User } from "@/domain/entities/user.entity";
import { toast } from "sonner";
import { AdminOverviewTab } from "./components/admin-overview-tab";
import { AdminAppointmentsTab } from "./components/admin-appointments-tab";
import { AdminUsersTab } from "./components/admin-users-tab";
import { AdminProductsTab } from "./components/admin-products-tab";
import { AdminServicesTab } from "./components/admin-services-tab";
import { AdminSchedulesTab } from "./components/admin-schedules-tab";
import { AdminSalesTab } from "./components/admin-sales-tab";

interface Metrics {
  monthlyRevenue: number;
  bookedAppointments: number;
  productOrders: number;
  satisfactionRate: number;
}

interface AdminDashboardProps {
  metrics: Metrics;
  appointments: Appointment[];
  services: BeautyService[];
  products: Product[];
  users: User[];
  schedules: Schedule[];
  sales: Sale[];
}

export function AdminDashboard({
  metrics,
  appointments: initialAppointments,
  services,
  products,
  users: initialUsers,
  schedules: initialSchedules,
  sales: initialSales,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Shared Data State
  const [appointmentsList, setAppointmentsList] = useState(initialAppointments);
  const [usersList, setUsersList] = useState(initialUsers);
  const [schedulesList, setSchedulesList] = useState(initialSchedules);
  const [productsList, setProductsList] = useState(products);
  const [servicesList, setServicesList] = useState(services);
  const [salesList, setSalesList] = useState(initialSales);

  function downloadCSV() {
    const headers = ["ID", "Clienta", "Servicio", "Fecha", "Estado"];
    const rows = appointmentsList.map((a) => [
      a.id,
      usersList.find((u) => u.id === a.userId)?.name || "N/A",
      servicesList.find((s) => s.id === a.serviceId)?.name || "N/A",
      a.startAt,
      a.status,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `reporte_perfect_nails_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel (CSV) descargado con éxito.");
  }

  function downloadPDF() {
    const reportElement = document.getElementById("report-content");
    if (!reportElement) {
      toast.error("No se encontró el contenido del reporte.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=900");
    if (!printWindow) {
      toast.error("Por favor permite las ventanas emergentes.");
      return;
    }

    // Capture current styles to ensure consistency
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("");
        } catch {
          return "";
        }
      })
      .join("\n");

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte Perfect Nails</title>
          <style>
            ${styles}
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; margin: 0; padding: 1.5cm; }
              #report-content { width: 100% !important; margin: 0 !important; padding: 0 !important; }
            }
            body { padding: 40px; background: white; }
          </style>
        </head>
        <body>
          <div id="report-content">
            ${reportElement.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.info("Generando reporte...");
  }

  return (
    <div className="pt-[4.5rem]">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-[#f8f9fa] px-4 py-16 sm:px-6 lg:px-8 border-b-0">
        <Image
          src="/images/backgrounds/reception.png"
          alt="Reception Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-100 pointer-events-none"
        />
        {/* Strong white top overlay for perfect text legibility, fading to background color */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/60 to-[#f8f9fa] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge className="bg-[var(--gold)] text-white hover:bg-[var(--gold)]/90 mb-4">
              Admin Suite
            </Badge>
            <h1 className="font-display text-6xl font-semibold text-[var(--ink)] tracking-tight">
              Panel de Control
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
              Gestión integral de citas, clientas y métricas de rendimiento para
              Perfect Nails.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="gold"
              className="border-[var(--line)]"
              onClick={() => setActiveTab("appointments")}
            >
              <CalendarIcon className="mr-2 size-4" />
              Gestión de Agenda
            </Button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="flex w-full overflow-x-auto md:grid md:grid-cols-6 lg:w-[850px] h-auto p-1 bg-[var(--quartz-soft)] rounded-xl border border-[var(--line)] gap-0.5">
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 px-3 text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] data-[state=active]:text-[var(--gold)] flex items-center justify-center gap-2 shrink-0 md:shrink flex-1"
            >
              <Store className="size-4 hidden sm:block" /> General
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 px-3 text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] data-[state=active]:text-[var(--gold)] flex items-center justify-center gap-2 relative shrink-0 md:shrink flex-1"
            >
              <CalendarDays className="size-4 hidden sm:block" /> Citas
              {appointmentsList.filter((a) => a.status === "PENDING").length >
                0 && (
                <span className="absolute top-2 left-2 size-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 px-3 text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] data-[state=active]:text-[var(--gold)] flex items-center justify-center gap-2 shrink-0 md:shrink flex-1"
            >
              <Users2 className="size-4 hidden sm:block" /> Usuarios
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 px-3 text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] data-[state=active]:text-[var(--gold)] flex items-center justify-center gap-2 shrink-0 md:shrink flex-1"
            >
              <Box className="size-4 hidden sm:block" /> Productos
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 px-3 text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] data-[state=active]:text-[var(--gold)] flex items-center justify-center gap-2 shrink-0 md:shrink flex-1"
            >
              <Store className="size-4 hidden sm:block" /> Servicios
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 px-3 text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] data-[state=active]:text-[var(--gold)] flex items-center justify-center gap-2 shrink-0 md:shrink flex-1"
            >
              <DollarSign className="size-4 hidden sm:block" /> Ventas
            </TabsTrigger>
            <TabsTrigger
              value="schedules"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 px-3 text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] data-[state=active]:text-[var(--gold)] flex items-center justify-center gap-2 shrink-0 md:shrink flex-1"
            >
              <Cog className="size-4 hidden sm:block" /> Ajustes
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="animate-in fade-in slide-in-from-bottom-4 duration-400"
          >
            <AdminOverviewTab
              metrics={metrics}
              appointments={appointmentsList}
              services={servicesList}
              products={productsList}
              users={usersList}
              downloadCSV={downloadCSV}
              downloadPDF={downloadPDF}
            />
          </TabsContent>

          <TabsContent
            value="appointments"
            className="animate-in fade-in slide-in-from-bottom-4 duration-400"
          >
            <AdminAppointmentsTab
              appointments={appointmentsList}
              setAppointments={setAppointmentsList}
              services={servicesList}
              users={usersList}
            />
          </TabsContent>

          <TabsContent
            value="users"
            className="animate-in fade-in slide-in-from-bottom-4 duration-400"
          >
            <AdminUsersTab
              users={usersList}
              setUsers={setUsersList}
              appointments={appointmentsList}
            />
          </TabsContent>

          <TabsContent
            value="products"
            className="animate-in fade-in slide-in-from-bottom-4 duration-400"
          >
            <AdminProductsTab
              products={productsList}
              setProducts={setProductsList}
            />
          </TabsContent>

          <TabsContent
            value="services"
            className="animate-in fade-in slide-in-from-bottom-4 duration-400"
          >
            <AdminServicesTab
              services={servicesList}
              setServices={setServicesList}
            />
          </TabsContent>

          <TabsContent
            value="sales"
            className="animate-in fade-in slide-in-from-bottom-4 duration-400"
          >
            <AdminSalesTab sales={salesList} setSales={setSalesList} />
          </TabsContent>

          <TabsContent
            value="schedules"
            className="animate-in fade-in slide-in-from-bottom-4 duration-400"
          >
            <AdminSchedulesTab
              schedules={schedulesList}
              setSchedules={setSchedulesList}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
