/**
 * MiniWeb V2 — horario autónomo.
 * No importar business-hours-rules, business-profile ni lectores V1.
 * Datos nuevos, introducidos explícitamente por el titular en el editor V2.
 */
export type V2Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export const V2_WEEKDAYS: readonly V2Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export type V2TimeRange = { start: string; end: string };
export type V2DayHours = { day: V2Weekday; closed: boolean; ranges: V2TimeRange[] };
export type V2HoursSection = {
  schemaVersion: 2;
  title: string;
  timezone: string;
  days: V2DayHours[];
  note: string | null;
};
export type V2HoursValidation = { valid: true; value: V2HoursSection } | { valid: false; errors: string[] };

const clock = /^([01]\d|2[0-3]):[0-5]\d$/;
function minutes(value: string): number {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

/** Empty by design. Never accepts or reads a legacy hours source. */
export function createEmptyV2HoursSection(): V2HoursSection {
  return {
    schemaVersion: 2,
    title: "Horario",
    timezone: "",
    days: V2_WEEKDAYS.map((day) => ({ day, closed: true, ranges: [] })),
    note: null,
  };
}

export function validateV2HoursSection(value: V2HoursSection): V2HoursValidation {
  const errors: string[] = [];
  if (value.schemaVersion !== 2) errors.push("schemaVersion must be 2");
  if (!value.title.trim() || value.title.length > 120) errors.push("Invalid title");
  if (!value.timezone.trim() || value.timezone.length > 100) errors.push("Timezone required");
  if (value.note !== null && value.note.length > 500) errors.push("Note too long");
  if (value.days.length !== 7 || new Set(value.days.map((d) => d.day)).size !== 7
      || value.days.some((d) => !V2_WEEKDAYS.includes(d.day))) errors.push("Exactly seven distinct weekdays required");
  for (const day of value.days) {
    if (day.closed && day.ranges.length) errors.push(day.day + ": closed day cannot have ranges");
    if (day.ranges.length > 4) errors.push(day.day + ": too many ranges");
    const ranges: { start: number; end: number }[] = [];
    for (const range of day.ranges) {
      if (!clock.test(range.start) || !clock.test(range.end)) {
        errors.push(day.day + ": invalid time");
        continue;
      }
      const start = minutes(range.start);
      const end = minutes(range.end);
      if (start >= end) errors.push(day.day + ": range must end after start");
      ranges.push({ start, end });
    }
    ranges.sort((a, b) => a.start - b.start);
    for (let i = 1; i < ranges.length; i++) {
      if (ranges[i].start < ranges[i - 1].end) errors.push(day.day + ": overlapping ranges");
    }
  }
  return errors.length ? { valid: false, errors } : { valid: true, value };
}
