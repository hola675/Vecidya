/**
 * Sección Horario MiniWeb V2. Implementación completamente nueva:
 * sin imports, consultas, adaptadores, fallback ni vínculos con horario V1.
 */
export type HoursV2DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type HoursV2Interval = Readonly<{ start: string; end: string }>;
export type HoursV2Day = Readonly<{
  day: HoursV2DayIndex;
  closed: boolean;
  intervals: readonly HoursV2Interval[];
}>;
export type HoursV2Content = Readonly<{
  schemaVersion: 2;
  timezone: string;
  days: readonly HoursV2Day[];
  notice: string;
}>;

export const HOURS_V2_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export function newHoursV2(): HoursV2Content {
  return {
    schemaVersion: 2,
    timezone: "",
    days: HOURS_V2_DAYS.map((day) => ({ day, closed: true, intervals: [] })),
    notice: "",
  };
}

export function validateHoursV2(value: HoursV2Content): string[] {
  const errors: string[] = [];
  const time = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
  if (value.schemaVersion !== 2) errors.push("invalid_version");
  if (!value.timezone.trim()) errors.push("timezone_required");
  else {
    try { new Intl.DateTimeFormat("en-US", { timeZone: value.timezone }); }
    catch { errors.push("invalid_timezone"); }
  }
  if (value.days.length !== 7) errors.push("seven_days_required");
  const seen = new Set<number>();
  for (const day of value.days) {
    if (!Number.isInteger(day.day) || day.day < 0 || day.day > 6 || seen.has(day.day)) errors.push("invalid_day");
    seen.add(day.day);
    if (day.closed && day.intervals.length) errors.push("closed_day_has_intervals");
    if (!day.closed && !day.intervals.length) errors.push("open_day_requires_interval");
    const sorted = [...day.intervals].sort((a, b) => a.start.localeCompare(b.start));
    let lastEnd = "";
    for (const interval of sorted) {
      if (!time.test(interval.start) || !time.test(interval.end) || interval.start >= interval.end) {
        errors.push("invalid_interval");
        continue;
      }
      if (lastEnd && interval.start < lastEnd) errors.push("overlapping_intervals");
      lastEnd = interval.end;
    }
  }
  return errors;
}

export function setHoursV2Day(
  current: HoursV2Content,
  dayIndex: HoursV2DayIndex,
  next: Pick<HoursV2Day, "closed" | "intervals">,
): HoursV2Content {
  return {
    ...current,
    days: current.days.map((day) => day.day === dayIndex
      ? { day: dayIndex, closed: next.closed, intervals: next.closed ? [] : [...next.intervals] }
      : day),
  };
}
