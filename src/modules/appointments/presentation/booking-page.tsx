import { Suspense } from "react";
import { BookingWorkspace } from "@/modules/appointments/presentation/booking-workspace";
import { getAppointmentRepository, getServiceRepository } from "@/infrastructure/repositories/repository-factory";

export async function BookingPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [services, slots] = await Promise.all([
    getServiceRepository().findAll(),
    getAppointmentRepository().getAvailability(today),
  ]);

  return (
    <Suspense fallback={null}>
      <BookingWorkspace initialDate={today} services={services} initialSlots={slots} />
    </Suspense>
  );
}
