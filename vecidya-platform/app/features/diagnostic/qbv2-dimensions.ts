/** Identificadores canónicos de 08B/08C; compartidos sin importar ni registrar bancos. */
export const DIGITAL_DIMENSION_IDS = [
  "clarity_positioning",
  "digital_foundation",
  "discovery",
  "trust_reputation",
  "conversion_access",
  "relationship_recurrence",
  "measurement_optimization",
  "digital_readiness",
] as const;
export type DigitalDimensionId = (typeof DIGITAL_DIMENSION_IDS)[number];
