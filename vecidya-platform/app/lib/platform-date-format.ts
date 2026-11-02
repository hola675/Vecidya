// Colombia stays on UTC-5; avoiding runtime Intl output keeps SSR and browser text identical.
const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] as const;

function toBogotaDate(value: Date | string | number) {
  return new Date(new Date(value).getTime() + BOGOTA_OFFSET_MS);
}

export function formatPlatformDate(value: Date | string | number) {
  const date = toBogotaDate(value);
  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
}

export function formatPlatformDateTime(value: Date | string | number) {
  const date = toBogotaDate(value);
  const hour24 = date.getUTCHours();
  const hour12 = hour24 % 12 || 12;
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const period = hour24 < 12 ? "a. m." : "p. m.";
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${hour12}:${minute} ${period}`;
}
