import { PublicBusinessHeader, type PublicBusinessProfile } from "../../public-business-profile-view";

export function HeroModule({ profile, preview, contactEnabled }: {
  profile: PublicBusinessProfile;
  preview: boolean;
  contactEnabled: boolean;
}) {
  return <PublicBusinessHeader profile={profile} preview={preview} showContactActions={contactEnabled} />;
}
