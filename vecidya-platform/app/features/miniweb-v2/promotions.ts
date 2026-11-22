import type { MiniWebV2Document, MiniWebV2Section, V2Promotion } from "./sections";

export function isMiniWebV2PromotionActive(promotion: V2Promotion, todayUtc: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(todayUtc) || Number.isNaN(Date.parse(`${todayUtc}T00:00:00.000Z`)) || new Date(`${todayUtc}T00:00:00.000Z`).toISOString().slice(0, 10) !== todayUtc) return false;
  return promotion.endsOn !== null && (promotion.startsOn === null || promotion.startsOn <= todayUtc) && promotion.endsOn >= todayUtc;
}

/** Public loader data omits hidden sections, non-consented people/reviews and out-of-window promotions. */
export function createPublicMiniWebV2Document(document: MiniWebV2Document, todayUtc: string): MiniWebV2Document {
  const sections: MiniWebV2Section[] = [];
  for (const section of document.sections) {
    if (!section.visible) continue;
    switch (section.type) {
      case "products": {
        const promotions = section.content.promotions?.filter((promotion) => isMiniWebV2PromotionActive(promotion, todayUtc));
        if (!section.content.items.length && !promotions?.length) break;
        sections.push(promotions ? { ...section, content: { ...section.content, promotions } } : section);
        break;
      }
      case "team": {
        const people = section.content.people.filter((person) => person.consented);
        if (!people.length) break;
        sections.push({ ...section, content: { ...section.content, people } });
        break;
      }
      case "testimonials": {
        const items = section.content.items.filter((item) => item.consented);
        if (!items.length) break;
        sections.push({ ...section, content: { ...section.content, items } });
        break;
      }
      default:
        sections.push(section);
    }
  }
  return { ...document, sections };
}
