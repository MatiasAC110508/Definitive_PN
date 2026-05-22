export const BUSINESS_TIME_ZONE = "America/Bogota";

function getDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function getPartsInTimeZone(date: Date, timeZone = BUSINESS_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

function getTimeZoneOffsetMs(timeZone: string, date: Date) {
  const parts = getPartsInTimeZone(date, timeZone);
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return localAsUtc - date.getTime();
}

export function getBusinessDateString(date = new Date()) {
  const parts = getPartsInTimeZone(date);
  return [
    parts.year.toString().padStart(4, "0"),
    parts.month.toString().padStart(2, "0"),
    parts.day.toString().padStart(2, "0"),
  ].join("-");
}

export function getDayOfWeekFromDateString(date: string) {
  const { year, month, day } = getDateParts(date);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addDaysToDateString(date: string, days: number) {
  const { year, month, day } = getDateParts(date);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

export function zonedDateTimeToUtc(
  date: string,
  time: string,
  timeZone = BUSINESS_TIME_ZONE,
) {
  const { year, month, day } = getDateParts(date);
  const [hour, minute = 0] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  const offset = getTimeZoneOffsetMs(timeZone, utcGuess);
  const utcDate = new Date(utcGuess.getTime() - offset);
  const adjustedOffset = getTimeZoneOffsetMs(timeZone, utcDate);

  if (adjustedOffset !== offset) {
    return new Date(utcGuess.getTime() - adjustedOffset);
  }

  return utcDate;
}

export function businessDateTimeInputToIso(value: string) {
  const [date, time] = value.split("T");
  return zonedDateTimeToUtc(date, time).toISOString();
}

export function formatDateTimeInputInBusinessTime(value: string | Date) {
  const parts = getPartsInTimeZone(new Date(value));
  return `${parts.year.toString().padStart(4, "0")}-${parts.month
    .toString()
    .padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}T${parts.hour
    .toString()
    .padStart(2, "0")}:${parts.minute.toString().padStart(2, "0")}`;
}
