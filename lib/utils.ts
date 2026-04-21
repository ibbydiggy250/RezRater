import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function average(numbers: number[]) {
  if (numbers.length === 0) {
    return 0;
  }

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

export function formatRating(value: number) {
  if (!value) {
    return "N/A";
  }

  return `${value.toFixed(1)} / 5`;
}

export function formatDateLabel(value: string | null) {
  if (!value) {
    return "No reviews";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function isSbuEmail(email: string) {
  return email.toLowerCase().endsWith("@stonybrook.edu");
}

export function isRatingValue(value: string) {
  return ["1", "2", "3", "4", "5"].includes(value);
}
