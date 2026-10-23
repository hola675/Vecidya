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

export function MiniWebRenderer({ configuration, profile, hours, offerings = [], faqs = [], media = [], preview = false }: {
  configuration: MiniWebConfiguration;
  profile: MiniWebPublicProfile;
  hours: BusinessHoursEntry[];
  offerings?: BusinessOffering[];
  faqs?: BusinessFaqItem[];
  media?: MiniWebMediaAsset[];
  preview?: boolean;
}) {
  const available = MINIWEB_TEMPLATE_REGISTRY[configuration.templateKey]?.availability === "available";
  const templateKey = available ? configuration.templateKey : DEFAULT_MINIWEB_TEMPLATE_KEY;
  const safeConfiguration = available ? configuration : {
    ...configuration,
    templateKey,
    templateVersion: MINIWEB_TEMPLATE_REGISTRY[templateKey].version,
  };
  const modules = getRenderableMiniWebModules(safeConfiguration, profile, hours, offerings, faqs, media);
  const Template = templateRenderers[templateKey as keyof typeof templateRenderers];

  return <Template configuration={safeConfiguration} modules={modules} profile={profile} hours={hours} offerings={offerings} faqs={faqs} media={media} preview={preview} />;
}
