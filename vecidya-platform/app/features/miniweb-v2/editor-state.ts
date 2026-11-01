import type { MiniWebV2Document } from "./sections";

export function miniWebV2EditorKey(organizationId: string, siteId: string | null) {
  return `${organizationId}:${siteId ?? "new"}`;
}

export function ensureMiniWebV2Hero(document: MiniWebV2Document | undefined): MiniWebV2Document {
  const current = document ?? { schemaVersion: 1 as const, sections: [] };
  if (current.sections.some((item) => item.type === "hero")) return current;
  let id = "hero-main";
  let suffix = 2;
  while (current.sections.some((item) => item.id === id)) id = `hero-main-${suffix++}`;
  return {
    ...current,
    sections: [
      { id, type: "hero", schemaVersion: 1, order: 0, visible: true, content: { title: "", subtitle: "", cta: null, image: null } },
      ...current.sections.map((item, index) => ({ ...item, order: index + 1 })),
    ],
  };
}
