/**
 * Frontend deadline utility functions.
 * Mirrors the backend deadline_service.py logic for display purposes.
 */

import { format, differenceInCalendarDays, parseISO } from "date-fns";

export function formatDeadlineDate(dateStr: string | null): string {
  if (!dateStr) return "Not set";
  return format(parseISO(dateStr), "MMM d, yyyy");
}

export function getDeadlineUrgency(
  dateStr: string | null
): "not_set" | "passed" | "due_today" | "approaching" | "pending" {
  if (!dateStr) return "not_set";
  const days = differenceInCalendarDays(parseISO(dateStr), new Date());
  if (days < 0) return "passed";
  if (days === 0) return "due_today";
  if (days <= 2) return "approaching";
  return "pending";
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return differenceInCalendarDays(parseISO(dateStr), new Date());
}

export function urgencyLabel(urgency: ReturnType<typeof getDeadlineUrgency>): string {
  switch (urgency) {
    case "passed": return "Overdue";
    case "due_today": return "Due Today";
    case "approaching": return "Due Soon";
    case "pending": return "Upcoming";
    default: return "Not Set";
  }
}

export function urgencyColor(urgency: ReturnType<typeof getDeadlineUrgency>): string {
  switch (urgency) {
    case "passed": return "text-red-700 bg-red-50 border-red-200";
    case "due_today": return "text-orange-700 bg-orange-50 border-orange-200";
    case "approaching": return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "pending": return "text-blue-700 bg-blue-50 border-blue-200";
    default: return "text-gray-500 bg-gray-50 border-gray-200";
  }
}
