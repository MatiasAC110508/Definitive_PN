import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date, pattern = "d 'de' MMMM") {
  return format(new Date(value), pattern, { locale: es });
}

export function formatTime(value: string | Date) {
  return format(new Date(value), "h:mm a", { locale: es });
}
