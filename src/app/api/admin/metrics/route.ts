import { adminMetricsController } from "@/presentation/controllers/admin.controller";

export async function GET() {
  return adminMetricsController();
}
