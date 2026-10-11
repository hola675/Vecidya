import type { OverallState } from "../../features/diagnostic";
import { publicAssets } from "../../assets/public-assets";

/**
 * DIAG-V3 — assets visuales del estado general, elegidos por la clasificación del índice de presencia.
 * El asset contiene el nombre del estado; la lectura accesible continúa en el HTML.
 */
export type StatusAssetBrief = {
  readonly slot: string;
  readonly src: string | null;
  readonly meaning: string;
  readonly visualDirection: readonly string[];
  readonly avoid: readonly string[];
};

const FAMILY_AVOID = ["personas o caras", "caras tristes o felices", "pulgares, trofeos o medallas", "triángulos de advertencia como ilustración principal"] as const;

export const STATUS_ASSETS: Readonly<Record<OverallState, StatusAssetBrief>> = {
  low: {
    slot: "diagnostic-status-low",
    src: publicAssets.icons.diagnosticStatusPriority,
    meaning: "La base digital existe solo en parte o tiene huecos estructurales importantes.",
    visualDirection: ["estructura estable pero incompleta", "módulos digitales sin conectar o sin terminar", "base visible sobre la que todavía falta construir", "familia de color cálida y contenida"],
    avoid: FAMILY_AVOID,
  },
  developing: {
    slot: "diagnostic-status-developing",
    src: publicAssets.icons.diagnosticStatusDeveloping,
    meaning: "Hay una base funcional y todavía se están construyendo capacidades importantes.",
    visualDirection: ["módulos conectados que avanzan hacia arriba", "ecosistema digital parcialmente completo", "sensación de progreso, no de alerta", "familia de color ámbar contenida"],
    avoid: FAMILY_AVOID,
  },
  solid: {
    slot: "diagnostic-status-solid",
    src: publicAssets.icons.diagnosticStatusHealthy,
    meaning: "Una base digital conectada y bien establecida.",
    visualDirection: ["ecosistema estable y conectado", "señal clara de completitud o verificación", "módulos alineados sobre una base firme", "familia de color verde contenida"],
    avoid: FAMILY_AVOID,
  },
};
