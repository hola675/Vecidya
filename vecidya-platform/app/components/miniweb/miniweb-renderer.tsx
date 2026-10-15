import type { BusinessHoursEntry } from "../../../db/business-hours-rules";
import { getRenderableMiniWebModules } from "../../features/miniweb/render";
import { DEFAULT_MINIWEB_TEMPLATE_KEY, MINIWEB_TEMPLATE_REGISTRY, type MiniWebConfiguration } from "../../features/miniweb/registry";
import type { PublicBusinessProfile } from "../public-business-profile-view";
import { DefaultMiniWebTemplate } from "./templates/default";

type MiniWebPublicProfile = PublicBusinessProfile;

const templateRenderers = {
  [DEFAULT_MINIWEB_TEMPLATE_KEY]: DefaultMiniWebTemplate,
};

export function MiniWebRenderer({ configuration, profile, hours, preview = false }: {
  configuration: MiniWebConfiguration;
  profile: MiniWebPublicProfile;
  hours: BusinessHoursEntry[];
  preview?: boolean;
}) {
  const available = MINIWEB_TEMPLATE_REGISTRY[configuration.templateKey]?.availability === "available";
  const templateKey = available ? configuration.templateKey : DEFAULT_MINIWEB_TEMPLATE_KEY;
  const safeConfiguration = available ? configuration : {
    ...configuration,
    templateKey,
    templateVersion: MINIWEB_TEMPLATE_REGISTRY[templateKey].version,
  };
  const modules = getRenderableMiniWebModules(safeConfiguration, profile, hours);
  const Template = templateRenderers[templateKey as keyof typeof templateRenderers];

  return <Template configuration={safeConfiguration} modules={modules} profile={profile} hours={hours} preview={preview} />;
}
