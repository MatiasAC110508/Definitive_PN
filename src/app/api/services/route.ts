import { listServicesController } from "@/presentation/controllers/catalog.controller";

export async function GET() {
  return listServicesController();
}
