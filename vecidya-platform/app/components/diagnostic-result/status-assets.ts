import type { OverallState } from "../../features/diagnostic";
import { publicAssets } from "../../assets/public-assets";

/**
 * DIAG-V3 — ilustraciones 3D del estado general, elegidas por la clasificación del índice de presencia.
 */
export type StatusAssetBrief = {
  readonly slot: string;
  readonly src: string | null;
  readonly meaning: string;
  readonly visualDirection: readonly string[];
  readonly avoid: readonly string[];
};

const FAMILY_AVOID = ["personas o caras", "caras tristes o felices", "pulgares, trofeos o medallas", "triángulos de advertencia como ilustración principal", "texto dentro de la imagen"] as const;

export const STATUS_ASSETS: Readonly<Record<OverallState, StatusAssetBrief>> = {
  low: {
    slot: "diagnostic-status-low",
    src: publicAssets.illustrations.diagnosticStatusLow,
    meaning: "La base digital existe solo en parte o tiene huecos estructurales importantes.",
    visualDirection: ["estructura estable pero incompleta", "módulos digitales sin conectar o sin terminar", "base visible sobre la que todavía falta construir", "familia de color cálida y contenida"],
    avoid: FAMILY_AVOID,
  },
  developing: {
    slot: "diagnostic-status-developing",
    src: publicAssets.illustrations.diagnosticStatusDeveloping,
    meaning: "Hay una base funcional y todavía se están construyendo capacidades importantes.",
    visualDirection: ["módulos conectados que avanzan hacia arriba", "ecosistema digital parcialmente completo", "sensación de progreso, no de alerta", "familia de color ámbar contenida"],
    avoid: FAMILY_AVOID,
  },
  solid: {
    slot: "diagnostic-status-solid",
    src: publicAssets.illustrations.diagnosticStatusSolid,
    meaning: "Una base digital conectada y bien establecida.",
    visualDirection: ["ecosistema estable y conectado", "señal clara de completitud o verificación", "módulos alineados sobre una base firme", "familia de color verde contenida"],
    avoid: FAMILY_AVOID,
  },
};
