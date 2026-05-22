import { Suspense } from "react";
import { BookingWorkspace } from "@/modules/appointments/presentation/booking-workspace";
import { getAppointmentRepository, getServiceRepository } from "@/infrastructure/repositories/repository-factory";
import { getBusinessDateString } from "@/lib/business-time";

export async function BookingPage() {
  const today = getBusinessDateString();
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
