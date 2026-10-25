import type { ReactNode } from "react";

import type { BusinessHoursEntry } from "../../../../db/business-hours-rules";
import type { MiniWebConfiguration, MiniWebModuleConfig } from "../../../features/miniweb/registry";
import { AboutModule } from "../modules/about";
import { ContactModule } from "../modules/contact";
import { HeroModule } from "../modules/hero";
import { HoursModule } from "../modules/hours";
import { LocationModule } from "../modules/location";
import { FaqModule } from "../modules/faq";
import { OfferingsModule } from "../modules/offerings";
import type { PublicBusinessProfile } from "../../public-business-profile-view";
import type { BusinessFaqItem, BusinessOffering } from "../../../features/miniweb/content";
import type { MiniWebMediaAsset } from "../../../features/miniweb/render";

type ModuleProps = { profile: PublicBusinessProfile; hours: BusinessHoursEntry[]; offerings: BusinessOffering[]; faqs: BusinessFaqItem[]; media: MiniWebMediaAsset[]; preview: boolean; contactEnabled: boolean };
type ModuleRenderer = (props: ModuleProps) => ReactNode;

const moduleRenderers: Partial<Record<MiniWebModuleConfig["type"], ModuleRenderer>> = {
  hero: ({ profile, preview, contactEnabled, media }) => <HeroModule profile={profile} preview={preview} contactEnabled={contactEnabled} cover={media.find((asset) => asset.purpose === "cover" && asset.mediaType === "image")} />,
  about: ({ profile }) => <AboutModule profile={profile} />,
  contact: ({ profile, preview }) => <ContactModule profile={profile} preview={preview} />,
  hours: ({ hours }) => <HoursModule hours={hours} />,
  location: ({ profile }) => <LocationModule profile={profile} />,
  services: ({ offerings }) => <OfferingsModule offerings={offerings} kind="service" />,
  products: ({ offerings }) => <OfferingsModule offerings={offerings} kind="product" />,
  faq: ({ faqs }) => <FaqModule items={faqs} />,
  gallery: ({ media }) => <section aria-labelledby="miniweb-gallery-title" className="miniweb-gallery"><h2 id="miniweb-gallery-title">Galería</h2><div className="miniweb-gallery__grid">{media.filter((asset) => asset.purpose === "gallery").map((asset) => asset.mediaType === "image" ? <figure key={asset.id}><img src={asset.publicUrl} alt={asset.altText} loading="lazy" /></figure> : <figure key={asset.id}><video controls preload="metadata" aria-label={asset.altText}><source src={asset.publicUrl} type={asset.contentType} /></video><figcaption>{asset.altText}</figcaption></figure>)}</div></section>,
};

export function DefaultMiniWebTemplate({ configuration, modules, profile, hours, offerings, faqs, media, preview = false }: {
  configuration: MiniWebConfiguration;
  modules: MiniWebModuleConfig[];
  profile: PublicBusinessProfile;
  hours: BusinessHoursEntry[];
  offerings: BusinessOffering[];
  faqs: BusinessFaqItem[];
  media: MiniWebMediaAsset[];
  preview?: boolean;
}) {
  const contactEnabled = modules.some((module) => module.type === "contact");
  const contentModules = modules.filter((module) => module.type !== "hero");
  const hasAbout = contentModules.some((module) => module.type === "about");

  const renderModule = (module: MiniWebModuleConfig) => {
    const renderer = moduleRenderers[module.type];
    if (!renderer) return null;
    return (
      <div className={`miniweb-template__module miniweb-template__module--${module.type}`} data-miniweb-module={module.type} id={`miniweb-section-${module.type}`} key={module.type}>
      {renderer({ profile, hours, offerings, faqs, media, preview, contactEnabled })}
      </div>
    );
  };

  const hero = modules.find((module) => module.type === "hero");
  return (
    <div className="public-page public-business-profile" data-miniweb-template={configuration.templateKey} data-miniweb-template-version={configuration.templateVersion}>
      {hero ? renderModule(hero) : null}
      <div className={`public-business-profile__grid${hasAbout ? "" : " public-business-profile__grid--single miniweb-template__sections--single"} miniweb-template__sections`}>
        {contentModules.map(renderModule)}
      </div>
    </div>
  );
}
