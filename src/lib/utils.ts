import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names and lets the later Tailwind class win, e.g. `cn("h-8", "h-12")` gives `h-12`. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
