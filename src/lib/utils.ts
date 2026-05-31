import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Centralized class merging keeps all Tailwind composition predictable.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Converts a string to a URL-friendly slug.
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "")   // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, "-");           // spaces → hyphens
}
