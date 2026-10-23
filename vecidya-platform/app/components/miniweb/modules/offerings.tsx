import type { BusinessOffering } from "../../../features/miniweb/content";

export function OfferingsModule({ offerings, kind }: { offerings: readonly BusinessOffering[]; kind: BusinessOffering["kind"] }) {
  const items = offerings.filter((item) => item.isActive && item.kind === kind);
  if (!items.length) return null;
  const title = kind === "service" ? "Servicios" : "Productos";
  return (
    <section aria-label={title} className="miniweb-content-list">
      <h2>{title}</h2>
      <div className="miniweb-content-list__items">
        {items.map((item, index) => (
          <article className="miniweb-content-list__item" key={`${item.sortOrder}-${index}`}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {item.priceLabel ? <p className="miniweb-content-list__price">{item.priceLabel}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
