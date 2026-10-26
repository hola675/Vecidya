import { PublicBusinessHeader, type PublicBusinessProfile } from "../../public-business-profile-view";

export function HeroModule({ profile, preview, contactEnabled, cover, logoUrl }: {
  profile: PublicBusinessProfile;
  preview: boolean;
  contactEnabled: boolean;
  cover?: { publicUrl: string; altText: string };
  logoUrl?: string;
}) {
  return <PublicBusinessHeader profile={{ ...profile, logoUrl: logoUrl ?? null }} preview={preview} showContactActions={contactEnabled} cover={cover} />;
}
