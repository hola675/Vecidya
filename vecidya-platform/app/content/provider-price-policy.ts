/**
 * COM-PRICING-20 — piso interno de margen bruto, no motor de facturación.
 * La meta autorizada es margen bruto >=20% del precio de venta
 * incluyendo TODOS los costes directos, no un recargo de 20% sobre costes.
 * Las herramientas incluidas en Barrio/Ciudad no reciben fees artificiales.
 */
export const PROVIDER_TARGET_MARGIN_PERCENT = 20 as const;

/** Precio mínimo teórico a partir del cargo directo verificado, en centavos. */
export function providerResaleCents(directCostCents: number): number {
  if (!Number.isSafeInteger(directCostCents) || directCostCents < 0) {
    throw new RangeError("Se requiere un coste directo no negativo en centavos enteros.");
  }
  const result = Math.ceil(directCostCents / (1 - PROVIDER_TARGET_MARGIN_PERCENT / 100));
  if (!Number.isSafeInteger(result)) throw new RangeError("Coste fuera de rango.");
  return result;
}

export function formatProviderResaleUsd(directCostCents: number): string {
  return (providerResaleCents(directCostCents) / 100).toFixed(2);
}

/** Referencias de proveedor; NO acreditan costes reales de la cuenta Vecidya. */
export const PROVIDER_BASELINE_USD_CENTS = {
  whatsappBusinessMonthly: 1_000,
  aiGrowthSharedMonthly: 5_000,
  aiUnlimitedSharedMonthly: 9_700,
} as const;
