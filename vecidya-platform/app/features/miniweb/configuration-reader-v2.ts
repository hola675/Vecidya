import {
  MAX_MINIWEB_CONFIGURATION_BYTES,
  MINIWEB_MODULE_REGISTRY,
  MINIWEB_TEMPLATE_REGISTRY,
  parseMiniWebConfigurationJson,
  type MiniWebConfiguration,
  type MiniWebModuleType,
} from "./registry";

/**
 * Lector de snapshots V1 y V2. No modifica el validador/editor/publicador V1.
 * El renderer V2 y los permisos premium se implementarán en checkpoints posteriores.
 */
export type MiniWebModuleSnapshotV2 = Readonly<{
  instanceId: string;
  type: MiniWebModuleType;
  moduleVersion: number;
  enabled: boolean;
  sortOrder: number;
  layoutVariant: "standard";
  settings: null;
}>;

export type MiniWebConfigurationV2 = Readonly<{
  version: 2;
  templateKey: "vecidya-default";
  templateVersion: 1;
  layoutVariant: "standard";
  visualVariant: "base" | "pro" | "premium";
  modules: readonly MiniWebModuleSnapshotV2[];
}>;

export type MiniWebReadConfiguration = MiniWebConfiguration | MiniWebConfigurationV2;
const activeTemplate = MINIWEB_TEMPLATE_REGISTRY["vecidya-default"];
const MAX_V2_BYTES = 16384;
const MAX_MODULES = 32;
const instancePattern = /^[a-z][a-z0-9-]{0,63}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function keysMatch(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

export function parseMiniWebReadConfigurationJson(input: unknown): MiniWebReadConfiguration | null {
  if (typeof input !== "string") return null;
  const bytes = new TextEncoder().encode(input).byteLength;
  if (bytes > MAX_V2_BYTES) return null;
  let raw: unknown;
  try { raw = JSON.parse(input); } catch { return null; }
  if (!isRecord(raw)) return null;
  if (raw.version !== 2) {
    return bytes <= MAX_MINIWEB_CONFIGURATION_BYTES ? parseMiniWebConfigurationJson(input) : null;
  }
  if (!keysMatch(raw, ["version", "templateKey", "templateVersion", "layoutVariant", "visualVariant", "modules"])
    || raw.templateKey !== "vecidya-default" || raw.templateVersion !== 1 || raw.layoutVariant !== "standard"
    || !["base", "pro", "premium"].includes(raw.visualVariant as string)
    || !Array.isArray(raw.modules) || raw.modules.length < 1 || raw.modules.length > MAX_MODULES) return null;

  const ids = new Set<string>();
  const orders = new Set<number>();
  const modules: MiniWebModuleSnapshotV2[] = [];
  for (const item of raw.modules) {
    if (!isRecord(item) || !keysMatch(item, ["instanceId", "type", "moduleVersion", "enabled", "sortOrder", "layoutVariant", "settings"])
      || typeof item.instanceId !== "string" || !instancePattern.test(item.instanceId) || ids.has(item.instanceId)
      || typeof item.type !== "string" || !Object.prototype.hasOwnProperty.call(MINIWEB_MODULE_REGISTRY, item.type)
      || MINIWEB_MODULE_REGISTRY[item.type as MiniWebModuleType].availability !== "available"
      || !activeTemplate.supportedModules.includes(item.type as MiniWebModuleType)
      || item.moduleVersion !== MINIWEB_MODULE_REGISTRY[item.type as MiniWebModuleType].version || typeof item.enabled !== "boolean"
      || !Number.isSafeInteger(item.sortOrder) || (item.sortOrder as number) < 0 || (item.sortOrder as number) >= raw.modules.length
      || orders.has(item.sortOrder as number)
      || typeof item.layoutVariant !== "string"
      || !MINIWEB_MODULE_REGISTRY[item.type as MiniWebModuleType].layoutVariants.includes(item.layoutVariant)
      || item.settings !== null) return null;
    ids.add(item.instanceId);
    orders.add(item.sortOrder as number);
    modules.push({
      instanceId: item.instanceId, type: item.type as MiniWebModuleType, moduleVersion: 1,
      enabled: item.enabled, sortOrder: item.sortOrder as number, layoutVariant: "standard", settings: null,
    });
  }
  const heroes = modules.filter((module) => module.type === "hero");
  if (heroes.length !== 1 || !heroes[0].enabled || heroes[0].sortOrder !== 0) return null;
  return {
    version: 2, templateKey: "vecidya-default", templateVersion: 1, layoutVariant: "standard",
    visualVariant: raw.visualVariant as MiniWebConfigurationV2["visualVariant"],
    modules: modules.sort((a, b) => a.sortOrder - b.sortOrder),
  };
}
