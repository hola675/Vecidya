export type BusinessHoursEntry = {
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
};

export const dayOfWeekLabels: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

const dayOfWeekShortLabels: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  7: "Dom",
};

function signature(entry: BusinessHoursEntry) {
  return entry.isClosed ? "closed" : `${entry.opensAt}-${entry.closesAt}`;
}

/**
 * Groups consecutive days (Mon..Sun) that share the exact same schedule into a
 * single readable line. A missing day (no entry) breaks the run instead of
 * being silently treated as "same as neighbor", since the business never
 * declared it.
 */
export function compactBusinessHours(entries: BusinessHoursEntry[]) {
  const byDay = new Map(entries.map((entry) => [entry.dayOfWeek, entry]));
  const groups: { firstDay: number; lastDay: number; entry: BusinessHoursEntry }[] = [];

  for (let day = 1; day <= 7; day += 1) {
    const entry = byDay.get(day);
    if (!entry) continue;

    const last = groups.at(-1);
    if (last && last.lastDay === day - 1 && signature(last.entry) === signature(entry)) {
      last.lastDay = day;
    } else {
      groups.push({ firstDay: day, lastDay: day, entry });
    }
  }

  return groups.map((group) => {
    const label = group.firstDay === group.lastDay
      ? dayOfWeekShortLabels[group.firstDay]
      : `${dayOfWeekShortLabels[group.firstDay]}–${dayOfWeekShortLabels[group.lastDay]}`;
    const value = group.entry.isClosed ? "Cerrado" : `${group.entry.opensAt}–${group.entry.closesAt}`;
    return `${label} · ${value}`;
  });
}
