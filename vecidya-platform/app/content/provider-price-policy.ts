import { minimumPriceCents } from "../lib/commercial-pricing";

/**
 * COM-PRICING-20 — margen bruto objetivo mínimo: 20 % del precio de venta.
 * El coste incluye todos los cargos directos del proveedor facturados a Vecidya
 * antes de aplicar el margen (incluidas comisiones efectivas), sin duplicar importes.
 * El cálculo se aplica sobre cargos agregados en centavos enteros.
 * No es motor de facturación y no determina impuestos o derechos de revender.
 */
export const PROVIDER_TARGET_MARGIN_PERCENT = 20 as const;

/** Importe resultante de un coste total de proveedor validado, redondeado al centavo superior. */
export function providerResaleCents(directCostCents: number): number {
  if (!Number.isSafeInteger(directCostCents) || directCostCents < 0) {
    throw new RangeError("Se requiere un coste directo no negativo en centavos enteros.");
  }
  const total = minimumPriceCents(directCostCents, PROVIDER_TARGET_MARGIN_PERCENT * 100);
  if (!Number.isSafeInteger(total)) throw new RangeError("Coste fuera de rango.");
  return total;
}

export function formatProviderResaleUsd(directCostCents: number): string {
  return (providerResaleCents(directCostCents) / 100).toFixed(2);
}

/** Referencias oficiales, NO recibos de la cuenta real de Vecidya. */
export const PROVIDER_BASELINE_USD_CENTS = {
  whatsappBusinessMonthly: 1_000,
  aiGrowthSharedMonthly: 5_000,
  aiUnlimitedSharedMonthly: 9_700,
} as const;
