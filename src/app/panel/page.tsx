import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserDashboard } from "@/modules/users/presentation/user-dashboard";
import { 
  getAppointmentRepository, 
  getServiceRepository,
  getUserRepository 
} from "@/infrastructure/repositories/repository-factory";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi panel",
  description: "Consulta, cancela o reagenda tus citas de Perfect Nails.",
};

export default async function UserPanelPage() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel");
  }

  const [appointments, services, user] = await Promise.all([
    getAppointmentRepository().findByUser(session.user.id),
    getServiceRepository().findAll(),
    getUserRepository().findById(session.user.id),
  ]);

  if (!user) {
    redirect("/login");
  }

  return <UserDashboard appointments={appointments} services={services} user={user} />;
}
