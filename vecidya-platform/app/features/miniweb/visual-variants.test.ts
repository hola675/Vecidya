import { describe, expect, it } from "vitest";

import {
  getMiniWebVisualVariant,
  isMiniWebVisualTierSufficient,
  MINIWEB_VISUAL_VARIANT_KEYS,
  MINIWEB_VISUAL_VARIANTS,
} from "./visual-variants";

describe("APP-MINI-V2A registro de variantes visuales", () => {
  it("conserva tres variantes con identidad y composición distintas", () => {
    expect(MINIWEB_VISUAL_VARIANT_KEYS).toEqual(["base", "pro", "premium"]);
    expect(MINIWEB_VISUAL_VARIANTS.base.minimumTier).toBe("cuadra");
    expect(MINIWEB_VISUAL_VARIANTS.pro.minimumTier).toBe("barrio");
    expect(MINIWEB_VISUAL_VARIANTS.premium.minimumTier).toBe("ciudad");
    expect(new Set(MINIWEB_VISUAL_VARIANT_KEYS.map((key) => MINIWEB_VISUAL_VARIANTS[key].composition.hero)).size).toBe(3);
  });

  it("rechaza variantes desconocidas sin herencia de propiedades del prototipo", () => {
    expect(getMiniWebVisualVariant("base")?.key).toBe("base");
    expect(getMiniWebVisualVariant("standard")).toBeNull();
    expect(getMiniWebVisualVariant("__proto__")).toBeNull();
    expect(getMiniWebVisualVariant("constructor")).toBeNull();
  });

  it("compara correctamente el orden de niveles sin conceder derechos", () => {
    expect(isMiniWebVisualTierSufficient("cuadra", "cuadra")).toBe(true);
    expect(isMiniWebVisualTierSufficient("cuadra", "barrio")).toBe(false);
    expect(isMiniWebVisualTierSufficient("barrio", "ciudad")).toBe(false);
    expect(isMiniWebVisualTierSufficient("ciudad", "barrio")).toBe(true);
    expect(isMiniWebVisualTierSufficient("ciudad", "cuadra")).toBe(true);
  });
});
