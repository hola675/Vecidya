import { PublicBusinessHeader, type PublicBusinessProfile } from "../../public-business-profile-view";

export function HeroModule({ profile, preview, contactEnabled, cover, iconUrl }: {
  profile: PublicBusinessProfile;
  preview: boolean;
  contactEnabled: boolean;
  cover?: { publicUrl: string; altText: string };
  iconUrl?: string;
}) {
  return <><PublicBusinessHeader profile={profile} preview={preview} showContactActions={contactEnabled} iconUrl={iconUrl} />{cover ? <img className="miniweb-cover" src={cover.publicUrl} alt={cover.altText} /> : null}</>;
}
