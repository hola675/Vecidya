import type { ReactNode } from "react";

import type { BusinessHoursEntry } from "../../../../db/business-hours-rules";
import type { MiniWebConfiguration, MiniWebModuleConfig } from "../../../features/miniweb/registry";
import { AboutModule } from "../modules/about";
import { ContactModule } from "../modules/contact";
import { HeroModule } from "../modules/hero";
import { HoursModule } from "../modules/hours";
import { LocationModule } from "../modules/location";
import type { PublicBusinessProfile } from "../../public-business-profile-view";

type ModuleProps = { profile: PublicBusinessProfile; hours: BusinessHoursEntry[]; preview: boolean; contactEnabled: boolean };
type ModuleRenderer = (props: ModuleProps) => ReactNode;

const moduleRenderers: Partial<Record<MiniWebModuleConfig["type"], ModuleRenderer>> = {
  hero: ({ profile, preview, contactEnabled }) => <HeroModule profile={profile} preview={preview} contactEnabled={contactEnabled} />,
  about: ({ profile }) => <AboutModule profile={profile} />,
  contact: ({ profile, preview }) => <ContactModule profile={profile} preview={preview} />,
  hours: ({ hours }) => <HoursModule hours={hours} />,
  location: ({ profile }) => <LocationModule profile={profile} />,
};

export function DefaultMiniWebTemplate({ configuration, modules, profile, hours, preview = false }: {
  configuration: MiniWebConfiguration;
  modules: MiniWebModuleConfig[];
  profile: PublicBusinessProfile;
  hours: BusinessHoursEntry[];
  preview?: boolean;
}) {
  const contactEnabled = modules.some((module) => module.type === "contact");
  const contentModules = modules.filter((module) => module.type !== "hero");
  const hasAbout = contentModules.some((module) => module.type === "about");

  const renderModule = (module: MiniWebModuleConfig) => {
    const renderer = moduleRenderers[module.type];
    if (!renderer) return null;
    return (
      <div className={`miniweb-template__module miniweb-template__module--${module.type}`} data-miniweb-module={module.type} key={module.type}>
        {renderer({ profile, hours, preview, contactEnabled })}
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
