import type { Appointment, AppointmentSlot } from "@/domain/entities/appointment.entity";
import type { Schedule } from "@/domain/entities/schedule.entity";
import {
  formatDateTimeInputInBusinessTime,
  getDayOfWeekFromDateString,
  zonedDateTimeToUtc,
} from "@/lib/business-time";

function getMinutesFromTime(time: string) {
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function getBusinessDateAndMinutes(value: Date) {
  const [date, time] = formatDateTimeInputInBusinessTime(value).split("T");

  return {
    date,
    minutes: getMinutesFromTime(time),
  };
}

/**
 * Domain Service responsible for calculating appointment availability.
 * It follows business rules to determine if a specific time slot is free or booked.
 */
export class AvailabilityService {
  assertWithinBusinessHours(startAt: Date, endAt: Date, schedule: Schedule | null) {
    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      endAt.getTime() <= startAt.getTime()
    ) {
      throw new Error("INVALID_APPOINTMENT_DATE");
    }

    if (!schedule?.isActive) {
      throw new Error("BUSINESS_CLOSED");
    }

    const start = getBusinessDateAndMinutes(startAt);
    const end = getBusinessDateAndMinutes(endAt);

    if (
      start.date !== end.date ||
      schedule.dayOfWeek !== getDayOfWeekFromDateString(start.date)
    ) {
      throw new Error("APPOINTMENT_OUTSIDE_BUSINESS_HOURS");
    }

    const opensAt = getMinutesFromTime(schedule.startTime);
    const closesAt = getMinutesFromTime(schedule.endTime);

    if (start.minutes < opensAt || end.minutes > closesAt) {
      throw new Error("APPOINTMENT_OUTSIDE_BUSINESS_HOURS");
    }
  }

  isWithinBusinessHours(startAt: Date, endAt: Date, schedule: Schedule | null) {
    try {
      this.assertWithinBusinessHours(startAt, endAt, schedule);
      return true;
    } catch {
      return false;
    }
  }

  findConflict(
    startAt: Date,
    endAt: Date,
    appointments: Appointment[],
  ): Appointment | undefined {
    const slotStart = startAt.getTime();
    const slotEnd = endAt.getTime();

    return appointments.find((apt) => {
      if (apt.status === "CANCELLED") return false;

      const aptStart = new Date(apt.startAt).getTime();
      const aptEnd = new Date(apt.endAt).getTime();

      return aptStart < slotEnd && aptEnd > slotStart;
    });
  }

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
      const startAt = zonedDateTimeToUtc(date, timeLabel);
      const endAt = new Date(startAt.getTime() + serviceDurationMinutes * 60000);

      if (!this.isWithinBusinessHours(startAt, endAt, schedule)) {
        continue;
      }

      // Rule: Cannot book slots in the past
      if (startAt.getTime() < now.getTime()) {
        continue; // Skip this slot as already passed
      }

      // Verify if this time window overlaps with any existing, active reservation
      const overlapping = this.findConflict(startAt, endAt, appointments);

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
