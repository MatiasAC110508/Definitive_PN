import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Centralized class merging keeps all Tailwind composition predictable.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
