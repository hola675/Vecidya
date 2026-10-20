/** Medidas de presentación: nunca fabrican datos ni determinan permisos o resultados comerciales. */
export function nonNegativeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/** Porcentaje de una magnitud cuya base real existe; las interfaces deben indicar esa base. */
export function clampPercentage(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
}

/** Anchura relativa (0–100), NO una tasa de conversión ni un porcentaje de usuarios. */
export function relativeBarWidth(value: number, maximum: number): number {
  const max = nonNegativeCount(maximum);
  return max > 0 ? clampPercentage(nonNegativeCount(value) / max * 100) : 0;
}

export function formatCount(value: number): string {
  return nonNegativeCount(value).toLocaleString("es-CO");
}
