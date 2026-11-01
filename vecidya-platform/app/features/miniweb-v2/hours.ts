/**
 * MiniWeb V2 — horario autónomo.
 * No importar business-hours-rules, business-profile ni lectores V1.
 * Datos nuevos, introducidos explícitamente por el titular en el editor V2.
 */
export type V2Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export const V2_WEEKDAYS: readonly V2Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export type V2TimeRange = { start: string; end: string };
export type V2DayHours = { day: V2Weekday; closed: boolean; ranges: V2TimeRange[] };
export type V2HoursException = { date: string; closed: boolean; ranges: V2TimeRange[]; note: string | null };
export type V2HoursSection = {
  schemaVersion: 2;
  title: string;
  timezone: string;
  days: V2DayHours[];
  note: string | null;
  exceptions: V2HoursException[];
};
export type V2HoursValidation = { valid: true; value: V2HoursSection } | { valid: false; errors: string[] };

const clock = /^([01]\d|2[0-3]):[0-5]\d$/;
const clockEnd = /^(?:([01]\d|2[0-3]):[0-5]\d|24:00)$/;
function minutes(value: string): number {
  if (value === "24:00") return 1440;
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

/** Represent an overnight opening interval as its two local-calendar-day parts. */
export function splitV2OvernightRange(start: string, end: string): [V2TimeRange, V2TimeRange] {
  if (!clock.test(start) || !clockEnd.test(end) || end === "24:00" || minutes(start) <= minutes(end)) throw new TypeError("Expected a valid overnight range");
  return [{ start, end: "24:00" }, { start: "00:00", end }];
}

/** Empty by design. Never accepts or reads a legacy hours source. */
export function createEmptyV2HoursSection(): V2HoursSection {
  return {
    schemaVersion: 2,
    title: "Horario",
    timezone: "",
    days: V2_WEEKDAYS.map((day) => ({ day, closed: true, ranges: [] })),
    note: null,
    exceptions: [],
  };
}

export function validateV2HoursSection(value: V2HoursSection, options: { requireTimezone?: boolean } = { requireTimezone: true }): V2HoursValidation {
  const candidate = value as unknown as Record<string, unknown>;
  const errors: string[] = [];
  if (!candidate || candidate.schemaVersion !== 2 || typeof candidate.title !== "string" || typeof candidate.timezone !== "string" || !Array.isArray(candidate.days)) return { valid: false, errors: ["Invalid hours section shape"] };
  const days = candidate.days as V2DayHours[];
  const exceptions = candidate.exceptions;
  if (!candidate.title.trim() || candidate.title.length > 120) errors.push("Invalid title");
  if ((options.requireTimezone !== false || candidate.timezone.trim()) && (candidate.timezone.length > 100 || !isValidTimeZone(candidate.timezone))) errors.push("Valid IANA timezone required");
  if (candidate.note !== null && (typeof candidate.note !== "string" || candidate.note.length > 500)) errors.push("Note too long");
  if (days.length !== 7 || days.some((d) => !d || typeof d !== "object") || new Set(days.map((d) => d?.day)).size !== 7
      || days.some((d) => !V2_WEEKDAYS.includes(d?.day))) errors.push("Exactly seven distinct weekdays required");
  for (const day of days) {
    if (!day || typeof day !== "object" || typeof day.day !== "string" || typeof day.closed !== "boolean" || !Array.isArray(day.ranges)) { errors.push("Invalid day entry"); continue; }
    if (day.closed && day.ranges.length) errors.push(day.day + ": closed day cannot have ranges");
    if (day.ranges.length > 4) errors.push(day.day + ": too many ranges");
    const ranges: { start: number; end: number }[] = [];
    for (const range of day.ranges) {
      if (!range || typeof range !== "object" || typeof range.start !== "string" || typeof range.end !== "string" || !clock.test(range.start) || !clockEnd.test(range.end)) {
        errors.push(day.day + ": invalid time");
        continue;
      }
      const start = minutes(range.start);
      const end = minutes(range.end);
      if (start === end) errors.push(day.day + ": start and end cannot be equal");
      ranges.push({ start, end: end > start ? end : end + 1440 });
    }
    ranges.sort((a, b) => a.start - b.start);
    for (let i = 1; i < ranges.length; i++) {
      if (ranges[i].start < ranges[i - 1].end) errors.push(day.day + ": overlapping ranges");
    }
  }
  // Check weekly intervals on a circular timeline so an overnight shift cannot overlap
  // the following day's first shift, including the Sunday-to-Monday boundary.
  const weekly = days.filter((day) => day && typeof day === "object" && V2_WEEKDAYS.includes(day.day) && Array.isArray(day.ranges)).flatMap((day) => day.ranges.filter((r) => r && typeof r.start === "string" && typeof r.end === "string" && clock.test(r.start) && clockEnd.test(r.end) && r.start !== r.end).map((r) => {
    const start = V2_WEEKDAYS.indexOf(day.day) * 1440 + minutes(r.start);
    const end = V2_WEEKDAYS.indexOf(day.day) * 1440 + minutes(r.end) + (minutes(r.end) < minutes(r.start) ? 1440 : 0);
    return { start, end };
  }));
  const circular = [...weekly, ...weekly.map((r) => ({ start: r.start + 10080, end: r.end + 10080 }))].sort((a, b) => a.start - b.start);
  for (let i = 1; i < circular.length; i++) if (circular[i].start < circular[i - 1].end) errors.push("Overnight ranges overlap another day");
  if (!Array.isArray(exceptions) || exceptions.length > 366) errors.push("At most 366 dated exceptions are allowed");
  else {
    const dates = new Set<string>();
    for (const exception of exceptions) {
      if (!exception || typeof exception !== "object") { errors.push("Invalid exception entry"); continue; }
      const entry = exception as V2HoursException;
      if (typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !isCalendarDate(entry.date)) errors.push("Invalid exception date");
      if (typeof entry.date === "string" && dates.has(entry.date)) errors.push("Duplicate exception date");
      if (typeof entry.date === "string") dates.add(entry.date);
      if (typeof entry.closed !== "boolean" || !Array.isArray(entry.ranges) || entry.ranges.length > 4 || (entry.closed && entry.ranges.length > 0)) errors.push("Invalid exception schedule");
      if (Array.isArray(entry.ranges)) for (const range of entry.ranges) if (!range || typeof range.start !== "string" || typeof range.end !== "string" || !clock.test(range.start) || !clockEnd.test(range.end) || range.start === range.end) errors.push("Invalid exception time range");
      if (Array.isArray(entry.ranges)) {
        const intervals = entry.ranges.filter((range) => range && typeof range.start === "string" && typeof range.end === "string" && clock.test(range.start) && clockEnd.test(range.end) && range.start !== range.end).map((range) => ({ start: minutes(range.start), end: minutes(range.end) > minutes(range.start) ? minutes(range.end) : minutes(range.end) + 1440 })).sort((a, b) => a.start - b.start);
        for (let i = 1; i < intervals.length; i++) if (intervals[i].start < intervals[i - 1].end) errors.push("Overlapping exception ranges");
        if (intervals.length > 1 && intervals[0].start + 1440 < intervals[intervals.length - 1].end) errors.push("Overlapping exception ranges");
      }
      if (entry.note !== null && (typeof entry.note !== "string" || entry.note.length > 500)) errors.push("Exception note too long");
    }
  }
  return errors.length ? { valid: false, errors } : { valid: true, value };
}

export function isValidTimeZone(timezone: string): boolean {
  try { new Intl.DateTimeFormat("en", { timeZone: timezone }).format(0); return true; } catch { return false; }
}

function isCalendarDate(date: string): boolean {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/** Resolve the business-local date for an instant; DST transitions are delegated to IANA tzdata. */
export function getV2LocalDate(instant: Date, timezone: string): string | null {
  if (!isValidTimeZone(timezone)) return null;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(instant);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
