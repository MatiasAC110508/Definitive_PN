import type { Appointment } from "@/domain/entities/appointment.entity";
import type { AppointmentRepository } from "@/domain/repositories/appointment.repository";
import type { ProductRepository } from "@/domain/repositories/product.repository";
import type { ServiceRepository } from "@/domain/repositories/service.repository";
import type { UserRepository } from "@/domain/repositories/user.repository";

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
  ) {}

  /**
   * Orchestrates the retrieval of metrics, appointments, and counts.
   * This data is strictly for administrative use.
   */
  async execute(): Promise<AdminDashboardData> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [appointments, services, products, users] = await Promise.all([
      this.appointmentRepository.findAll(),
      this.serviceRepository.findAll(),
      this.productRepository.findAll(),
      this.userRepository.findAll(),
    ]);

    // Calculate real monthly metrics
    const monthlyAppointments = appointments.filter(apt => 
      new Date(apt.startAt) >= firstDayOfMonth && apt.status !== "CANCELLED"
    );

    const monthlyRevenue = monthlyAppointments.reduce((sum, apt) => {
      const service = services.find(s => s.id === apt.serviceId);
      return sum + (service?.price || 0);
    }, 0);

    return {
      metrics: {
        monthlyRevenue,
        bookedAppointments: monthlyAppointments.length,
        productOrders: products.length, // Placeholder for actual orders
        satisfactionRate: 98,
      },
      recentAppointments: appointments
        .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
        .slice(0, 10),
      counts: {
        services: services.length,
        products: products.length,
        users: users.length,
      },
    };
  }
}
