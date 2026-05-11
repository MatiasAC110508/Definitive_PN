import type { Metadata } from "next";
import { BookingPage } from "@/modules/appointments/presentation/booking-page";

export const metadata: Metadata = {
  title: "Reservar cita",
  description:
    "Agenda servicios de uñas con vista diaria, semanal, disponibilidad por hora y confirmación visual.",
};

export default function BookPage() {
  return <BookingPage />;
}
