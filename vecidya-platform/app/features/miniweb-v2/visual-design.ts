/**
 * APP-MINI-V2 · Configuración visual persistente por documento MiniWeb.
 * Solo valores enumerados o rangos acotados; nunca CSS arbitrario.
 * Los esquemas anteriores sin `design` siguen siendo válidos.
 */
import type { CSSProperties } from "react";

export type MiniWebV2Design = {
  palette: "oceano" | "bosque" | "coral" | "ciruela" | "personalizada";
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  font: "moderna" | "editorial" | "cercana";
  layout: "split" | "stacked";
  align: "left" | "center";
  imagePosition: "left" | "right";
  titleSize: number;
  bodySize: number;
  spacing: number;
  radius: number;
  heroHeight: number;
};

export const MINIWEB_V2_DESIGN_PALETTES = {
  oceano: { accentColor: "#075fcf", backgroundColor: "#f6f9fd", textColor: "#142b4e" },
  bosque: { accentColor: "#226354", backgroundColor: "#f1f6ef", textColor: "#19392f" },
  coral: { accentColor: "#9b473d", backgroundColor: "#fff4ec", textColor: "#422523" },
  ciruela: { accentColor: "#644a85", backgroundColor: "#f8f3fb", textColor: "#30213e" },
} as const;

export const MINIWEB_V2_DEFAULT_DESIGN: Readonly<MiniWebV2Design> = {
  palette: "oceano",
  ...MINIWEB_V2_DESIGN_PALETTES.oceano,
  font: "moderna", layout: "split", align: "left", imagePosition: "right",
  titleSize: 48, bodySize: 16, spacing: 24, radius: 20, heroHeight: 330,
};

export const MINIWEB_V2_DESIGN_RANGES = {
  titleSize: [26, 60], bodySize: [14, 20], spacing: [12, 42],
  radius: [0, 34], heroHeight: [260, 480],
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isHex = (value: unknown): value is string => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
const choices = {
  palette: ["oceano", "bosque", "coral", "ciruela", "personalizada"],
  font: ["moderna", "editorial", "cercana"], layout: ["split", "stacked"],
  align: ["left", "center"], imagePosition: ["left", "right"],
} as const;
function luminance(hex: string): number {
  const values = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = values.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
}
export function miniWebV2Contrast(first: string, second: string): number {
  if (!isHex(first) || !isHex(second)) return 0;
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function validateMiniWebV2Design(value: unknown): value is MiniWebV2Design {
  if (!isRecord(value)) return false;
  const keys = [...Object.keys(choices), "accentColor", "backgroundColor", "textColor", ...Object.keys(MINIWEB_V2_DESIGN_RANGES)];
  if (Object.keys(value).length !== keys.length || Object.keys(value).some((key) => !keys.includes(key))) return false;
  for (const [key, options] of Object.entries(choices)) {
    if (typeof value[key] !== "string" || !(options as readonly string[]).includes(value[key] as string)) return false;
  }
  for (const key of ["accentColor", "backgroundColor", "textColor"]) if (!isHex(value[key])) return false;
  for (const [key, [min, max]] of Object.entries(MINIWEB_V2_DESIGN_RANGES)) {
    const number = value[key];
    if (typeof number !== "number" || !Number.isSafeInteger(number) || number < min || number > max) return false;
  }
  // La página nunca debe publicar una combinación ilegible: texto normal y CTA.
  return miniWebV2Contrast(value.textColor as string, value.backgroundColor as string) >= 4.5 &&
    miniWebV2Contrast(value.textColor as string, "#ffffff") >= 4.5 &&
    miniWebV2Contrast("#ffffff", value.accentColor as string) >= 4.5;
}

export function miniWebV2DesignStyle(design: MiniWebV2Design | undefined): CSSProperties {
  if (!design) return {};
  const value = design;
  return {
    "--mw2-bg": value.backgroundColor,
    "--mw2-ink": value.textColor,
    "--mw2-accent": value.accentColor,
    "--mw2-font": value.font === "editorial" ? 'Georgia, "Times New Roman", serif'
      : value.font === "cercana" ? '"Trebuchet MS", "Segoe UI", sans-serif'
      : 'ui-sans-serif, system-ui, sans-serif',
    "--mw2-title-size": value.titleSize + "px",
    "--mw2-body-size": value.bodySize + "px",
    "--mw2-spacing": value.spacing + "px",
    "--mw2-radius": value.radius + "px",
    "--mw2-hero-height": value.heroHeight + "px",
  } as CSSProperties;
}
