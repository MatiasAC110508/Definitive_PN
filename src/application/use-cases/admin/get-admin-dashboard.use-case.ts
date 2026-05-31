import type { Appointment } from "@/domain/entities/appointment.entity";
import type { AppointmentRepository } from "@/domain/repositories/appointment.repository";
import type { ProductRepository } from "@/domain/repositories/product.repository";
import type { ServiceRepository } from "@/domain/repositories/service.repository";
import type { UserRepository } from "@/domain/repositories/user.repository";
import type { ISaleRepository } from "@/domain/repositories/sale.repository";

export type AdminDashboardData = {
  metrics: {
    monthlyRevenue: number;
    bookedAppointments: number;
    productOrders: number;
    satisfactionRate: number;
  };
  recentAppointments: Appointment[];
  counts: {
    services: number;
    products: number;
    users: number;
  };
};

/**
 * Application Use Case for retrieving high-level business metrics for the admin.
 */
export class GetAdminDashboardUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private serviceRepository: ServiceRepository,
    private productRepository: ProductRepository,
    private userRepository: UserRepository,
    private saleRepository: ISaleRepository,
  ) {}

  /**
   * Orchestrates the retrieval of metrics, appointments, and counts.
   * This data is strictly for administrative use.
   */
  async execute(): Promise<AdminDashboardData> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [appointments, services, products, users, sales] = await Promise.all([
      this.appointmentRepository.findAll(),
      this.serviceRepository.findAll(),
      this.productRepository.findAll(),
      this.userRepository.findAll(),
      this.saleRepository.findAll(),
    ]);

    // Calculate real monthly metrics
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyAppointments = appointments.filter(apt => 
      new Date(apt.startAt) >= startOfMonth && apt.status !== "CANCELLED"
    );

    const monthlySales = sales.filter(sale => new Date(sale.createdAt) >= startOfMonth);
    const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.amount, 0);
    const productOrders = sales.filter(s => s.saleType === "PRODUCT" && new Date(s.createdAt) >= startOfMonth).length;

    // We don't have a ReviewRepository yet, so we'll approximate satisfaction 
    // from cancellation rates (as it's better than hardcoding 98) 
    // or keep a static baseline if there are no appointments.
    const totalApts = appointments.length;
    const cancelledApts = appointments.filter(a => a.status === "CANCELLED").length;
    const satisfactionRate = totalApts > 0 ? Math.round(((totalApts - cancelledApts) / totalApts) * 100) : 100;

    return {
      metrics: {
        monthlyRevenue,
        bookedAppointments: monthlyAppointments.length,
        productOrders,
        satisfactionRate,
      },
      recentAppointments: appointments
        .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()),
      counts: {
        services: services.length,
        products: products.length,
        users: users.length,
      },
    };
  }
}
