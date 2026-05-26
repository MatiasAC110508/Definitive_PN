import { ServiceCatalogClient } from "@/modules/services/presentation/service-catalog-client";
import { getServiceRepository } from "@/infrastructure/repositories/repository-factory";

export async function ServiceCatalogPage() {
  const services = await getServiceRepository().findAll();
  return <ServiceCatalogClient services={services} />;
}
