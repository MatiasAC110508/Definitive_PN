import type { Metadata } from "next";
import { ServiceCatalogPage } from "@/modules/services/presentation/service-catalog-page";

export const metadata: Metadata = {
  title: "Servicios de belleza",
  description:
    "Explora depilación láser diodo, Hollywood Peeling, uñas premium y masajes con reserva online.",
};

export default function ServicesPage() {
  return <ServiceCatalogPage />;
}
