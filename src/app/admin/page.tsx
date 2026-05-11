import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/modules/admin/presentation/admin-dashboard";
import { GetAdminDashboardUseCase } from "@/application/use-cases/admin/get-admin-dashboard.use-case";
import {
  getAppointmentRepository,
  getProductRepository,
  getScheduleRepository,
  getServiceRepository,
  getUserRepository,
} from "@/infrastructure/repositories/repository-factory";
import { getCurrentSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Panel administrativo",
  description: "Administra agenda, horarios, servicios, productos y usuarios.",
};

export default async function AdminPage() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/panel");
  }

  const [schedules, dashboardData] = await Promise.all([
    getScheduleRepository().findAll(),
    new GetAdminDashboardUseCase(
      getAppointmentRepository(),
      getServiceRepository(),
      getProductRepository(),
      getUserRepository(),
    ).execute(),
  ]);

  const [allServices, allProducts, allUsers] = await Promise.all([
    getServiceRepository().findAll(),
    getProductRepository().findAll(),
    getUserRepository().findAll(),
  ]);

  return (
    <AdminDashboard
      appointments={dashboardData.recentAppointments}
      metrics={dashboardData.metrics}
      products={allProducts}
      schedules={schedules}
      services={allServices}
      users={allUsers}
    />
  );
}
