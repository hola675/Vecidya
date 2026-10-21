/**
 * COM-PRICING-20 — regla comercial interna (no es motor de checkout).
 * Objetivo: margen bruto >=20% del PRECIO DE VENTA, antes de impuestos.
 * Costes directos: proveedor fijo imputado, mano de obra estándar, soporte
 * imputado, transacciones y otros costes necesarios. El consumo variable
 * necesita su propia cotización/cálculo; no asumir uso gratuito.
 *
 * Sin costes directos verificables no se puede certificar el margen.
 */
export const TARGET_GROSS_MARGIN_BPS = 2_000; // 20,00 %

export function minimumPriceCents(directCostCents: number, marginBps = TARGET_GROSS_MARGIN_BPS) {
  if (!Number.isSafeInteger(directCostCents) || directCostCents < 0) {
    throw new RangeError("El coste directo debe expresarse en centavos enteros no negativos.");
  }
  if (!Number.isSafeInteger(marginBps) || marginBps < 0 || marginBps >= 10_000) {
    throw new RangeError("El margen objetivo debe estar entre 0 y menos de 100 %.");
  }
  return Math.ceil(directCostCents / (1 - marginBps / 10_000));
}

export function grossMarginBps(priceCents: number, directCostCents: number) {
  if (!Number.isSafeInteger(priceCents) || priceCents <= 0 || !Number.isSafeInteger(directCostCents) || directCostCents < 0) {
    throw new RangeError("Precio positivo y coste directo no negativo, ambos en centavos.");
  }
  return Math.round(((priceCents - directCostCents) / priceCents) * 10_000);
}

export function passesTargetGrossMargin(priceCents: number, directCostCents: number) {
  return priceCents >= minimumPriceCents(directCostCents);
}
