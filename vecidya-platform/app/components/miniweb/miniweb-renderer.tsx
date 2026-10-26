import type { BusinessHoursEntry } from "../../../db/business-hours-rules";
import { getRenderableMiniWebModules } from "../../features/miniweb/render";
import { DEFAULT_MINIWEB_TEMPLATE_KEY, MINIWEB_TEMPLATE_REGISTRY, type MiniWebConfiguration } from "../../features/miniweb/registry";
import type { PublicBusinessProfile } from "../public-business-profile-view";
import { DefaultMiniWebTemplate } from "./templates/default";
import type { BusinessFaqItem, BusinessOffering } from "../../features/miniweb/content";
import type { MiniWebMediaAsset } from "../../features/miniweb/render";

type MiniWebPublicProfile = PublicBusinessProfile;

const templateRenderers = {
  [DEFAULT_MINIWEB_TEMPLATE_KEY]: DefaultMiniWebTemplate,
};

export function MiniWebRenderer({ configuration, profile, hours, offerings = [], faqs = [], media = [], preview = false, heroCover }: {
  configuration: MiniWebConfiguration;
  profile: MiniWebPublicProfile;
  hours: BusinessHoursEntry[];
  offerings?: BusinessOffering[];
  faqs?: BusinessFaqItem[];
  media?: MiniWebMediaAsset[];
  preview?: boolean;
  heroCover?: { publicUrl: string; altText: string };
}) {
  const identityMedia = media.filter((asset) => asset.mediaType === "image");
  const renderedProfile = {
    ...profile,
  logoUrl: identityMedia.find((asset) => asset.purpose === "logo")?.publicUrl ?? (preview ? profile.logoUrl : null),
  };
  const available = MINIWEB_TEMPLATE_REGISTRY[configuration.templateKey]?.availability === "available";
  const templateKey = available ? configuration.templateKey : DEFAULT_MINIWEB_TEMPLATE_KEY;
  const safeConfiguration = available ? configuration : {
    ...configuration,
    templateKey,
    templateVersion: MINIWEB_TEMPLATE_REGISTRY[templateKey].version,
  };
  const modules = getRenderableMiniWebModules(safeConfiguration, renderedProfile, hours, offerings, faqs, media);
  const Template = templateRenderers[templateKey as keyof typeof templateRenderers];

  const templateMedia = heroCover ? [...media.filter((asset) => asset.purpose !== "cover"), { id: "published-cover", mediaType: "image" as const, purpose: "cover" as const, contentType: "image/webp", altText: heroCover.altText, publicUrl: heroCover.publicUrl }] : media;
  return <Template configuration={safeConfiguration} modules={modules} profile={renderedProfile} hours={hours} offerings={offerings} faqs={faqs} media={templateMedia} preview={preview} />;
}
