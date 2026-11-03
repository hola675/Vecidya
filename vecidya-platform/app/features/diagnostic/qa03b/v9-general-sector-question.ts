import { BUSINESS_SECTORS, BUSINESS_SECTOR_TAXONOMY_VERSION } from "../../../content/business-sectors";
import type { QuestionDefinitionV2 } from "../qbv2-contract";

/**
 * Pregunta de CLASIFICACIÓN general candidata para V9 (aún NO activada).
 *
 * Compartimos la misma fuente que Vecindario, pero conservamos `q2_sector`
 * V8 y los contratos V9 históricos hasta versionar banco, sesión y replay.
 * Ninguna respuesta produce observaciones puntuables ni infiere especialidad.
 */
export const QA03B_V9_GENERAL_SECTOR_SOURCE = BUSINESS_SECTOR_TAXONOMY_VERSION;
export const QA03B_V9_GENERAL_SECTOR_QUESTION = {
  id: "q2_sector_general",
  version: 1,
  module: "classification",
  type: "single",
  routingRole: "adaptive",
  prompt: "¿A qué se dedica principalmente tu actividad, negocio u organización?",
  hint: "Elige su actividad principal, aunque también tengas otros servicios o vendas por varios canales.",
  purpose: ["classification", "routing"],
  priority: "normal",
  evidenceMigration: "pending",
  options: [
    ...BUSINESS_SECTORS.map((sector) => ({ value: sector.id, label: sector.label })),
    { value: "unknown", label: "Todavía no lo tengo claro", kind: "unknown" },
  ],
} as const satisfies QuestionDefinitionV2;
