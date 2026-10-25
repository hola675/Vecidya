import type { BusinessOffering } from "../../../features/miniweb/content";
import type { MiniWebMediaAsset } from "../../../features/miniweb/render";

export function OfferingsModule({ offerings, kind, media = [] }: { offerings: readonly BusinessOffering[]; kind: BusinessOffering["kind"]; media?: readonly MiniWebMediaAsset[] }) {
  const items = offerings.filter((item) => item.isActive && item.kind === kind && item.title.trim() && item.description.trim());
  if (!items.length) return null;
  const title = kind === "service" ? "Servicios" : "Productos";
  return (
    <section aria-label={title} className="miniweb-content-list">
      <h2>{title}</h2>
      <div className="miniweb-content-list__items">
        {items.map((item, index) => {
          const image = item.imageAssetId ? media.find((asset) => asset.id === item.imageAssetId && asset.mediaType === "image") : null;
          return (
            <article className="miniweb-content-list__item" key={`${item.sortOrder}-${index}`}>
              {image ? <img alt={image.altText} loading="lazy" src={image.publicUrl} /> : null}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.priceLabel ? <p className="miniweb-content-list__price">{item.priceLabel}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
