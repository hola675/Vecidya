import type { MiniWebV2Document, V2Image } from "./sections";
/** Lista cerrada de medios que la publicación V2 realmente referencia. Nunca expone el borrador. */
export function publishedMiniWebV2ImageIds(document: MiniWebV2Document): Set<string> {
  const images: V2Image[] = [];
  for (const section of document.sections) {
    if (!section.visible) continue;
    switch (section.type) {
      case "hero": if (section.content.image) images.push(section.content.image); break;
      case "about": section.content.blocks.forEach((item) => { if (item.image) images.push(item.image); }); break;
      case "services": case "products": section.content.items.forEach((item) => { if (item.image) images.push(item.image); }); break;
      case "gallery": images.push(...section.content.images); break;
      case "team": section.content.people.filter((person) => person.consented).forEach((person) => { if (person.image) images.push(person.image); }); break;
      case "certifications": section.content.items.forEach((item) => { if (item.document) images.push(item.document); }); break;
    }
  }
  return new Set(images.map((image) => image.assetId));
}
export function miniWebV2ImageUrl(siteId: string, assetId: string): string {
  return `/media/miniweb/${encodeURIComponent(siteId)}/${encodeURIComponent(assetId)}`;
}
