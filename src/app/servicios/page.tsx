import type { Metadata } from "next";
import { ServiceCatalogPage } from "@/modules/services/presentation/service-catalog-page";

export const metadata: Metadata = {
  title: "Servicios de uñas",
  description:
    "Explora uñas acrílicas, manicure, pedicure, nail art y spa de uñas con reserva online.",
};

export default function ServicesPage() {
  return <ServiceCatalogPage />;
}
