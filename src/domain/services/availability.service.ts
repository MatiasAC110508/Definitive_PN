import type { Appointment, AppointmentSlot } from "@/domain/entities/appointment.entity";
import type { Schedule } from "@/domain/entities/schedule.entity";

/**
 * Domain Service responsible for calculating appointment availability.
 * It follows business rules to determine if a specific time slot is free or booked.
 */
export class AvailabilityService {
  /**
   * Generates a list of time slots for a given day based on business hours,
   * current bookings, and the specific duration of the service requested.
   * 
   * @param date - The target date (YYYY-MM-DD)
   * @param appointments - Existing appointments for that day to check for conflicts
   * @param schedule - The business opening/closing hours for that day
   * @param serviceDurationMinutes - How long the requested service takes
   */
  buildDailySlots(
    date: string,
    appointments: Appointment[],
    schedule: Schedule,
    serviceDurationMinutes: number = 60,
  ): AppointmentSlot[] {
    // If the business is closed on this day, return no slots
    if (!schedule.isActive) return [];

    const slots: AppointmentSlot[] = [];
    const startHour = parseInt(schedule.startTime.split(":")[0]);
    const endHour = parseInt(schedule.endTime.split(":")[0]);

    const now = new Date();

    // We generate potential starting slots every hour
    for (let hour = startHour; hour < endHour; hour++) {
      const timeLabel = `${hour.toString().padStart(2, "0")}:00`;
      const startAt = new Date(`${date}T${timeLabel}:00.000`);
      const endAt = new Date(startAt.getTime() + serviceDurationMinutes * 60000);

      // Rule: Cannot book slots in the past
      if (startAt.getTime() < now.getTime()) {
        continue; // Skip this slot as it's already passed
      }

      // Verify if this time window (start to end) overlaps with any existing, active reservation
      const overlapping = appointments.find((apt) => {
        // Cancelled appointments do not block availability
        if (apt.status === "CANCELLED") return false;
        
        const aptStart = new Date(apt.startAt).getTime();
        const aptEnd = new Date(apt.endAt).getTime();
        const slotStart = startAt.getTime();
        const slotEnd = endAt.getTime();

        // Standard overlap condition: (StartA < EndB) && (EndA > StartB)
        return aptStart < slotEnd && aptEnd > slotStart;
      });

      slots.push({
        id: `${date}-${timeLabel}`,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        label: timeLabel,
        status: overlapping ? "RESERVED" : "AVAILABLE",
        serviceId: overlapping?.serviceId,
      });
    }

    return slots;
  }
}
