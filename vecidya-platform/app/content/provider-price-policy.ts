/**
 * Política comercial de repercusión de costes externos (COM-PRICING-20-01).
 *
 * Recargo del 20 % sobre el coste real facturado a Vecidya, sin inventar fees
 * mensuales para funciones ya incluidas en una licencia.
 *
 * Trabaja con el importe agregado de la factura/cargo (centavos enteros), NO con
 * unidades de consumo fraccionarias. Las comisiones/surcharges que se cobran a
 * Vecidya se incorporan al coste antes de aplicar el 20 %; nunca se duplican.
 * Este módulo no realiza facturación ni determina impuestos.
 */
export const PROVIDER_MARKUP_PERCENT = 20 as const;

/** Redondeo hacia arriba al centavo para nunca facturar por debajo de 20 %. */
export function providerResaleCents(providerChargedCents: number): number {
  if (!Number.isSafeInteger(providerChargedCents) || providerChargedCents < 0) {
    throw new RangeError("Se requiere un coste externo no negativo en centavos enteros.");
  }
  const total = Math.ceil(providerChargedCents * (100 + PROVIDER_MARKUP_PERCENT) / 100);
  if (!Number.isSafeInteger(total)) throw new RangeError("Coste fuera de rango.");
  return total;
}

export function formatProviderResaleUsd(providerChargedCents: number): string {
  return (providerResaleCents(providerChargedCents) / 100).toFixed(2);
}

/**
 * Costes recurrentes de referencia comprobables mediante fuentes oficiales.
 * No son evidencia de facturación en la cuenta Vecidya; confirmar coste final.
 *
 * WhatsApp: 10 USD/mes por subcuenta habilitada, independientemente del uso.
 * La IA es una SUSCRIPCIÓN COMPARTIDA por localización, no un coste por
 * cada widget/agente o por cada complemento de voz y conversación.
 */
export const PROVIDER_BASELINE_USD_CENTS = {
  whatsappBusinessMonthly: 1000,
  aiGrowthSharedMonthly: 5000,
  aiUnlimitedSharedMonthly: 9700,
} as const;
