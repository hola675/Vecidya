import { PublicBusinessHeader, type PublicBusinessProfile } from "../../public-business-profile-view";

export function HeroModule({ profile, preview, contactEnabled, cover, iconUrl, logoUrl }: {
  profile: PublicBusinessProfile;
  preview: boolean;
  contactEnabled: boolean;
  cover?: { publicUrl: string; altText: string };
  iconUrl?: string;
  logoUrl?: string;
}) {
  return <PublicBusinessHeader profile={{ ...profile, logoUrl: logoUrl ?? null }} preview={preview} showContactActions={contactEnabled} iconUrl={iconUrl} cover={cover} />;
}
