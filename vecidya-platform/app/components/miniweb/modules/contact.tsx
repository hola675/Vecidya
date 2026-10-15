import { PublicBusinessContact, type PublicBusinessProfile } from "../../public-business-profile-view";

export function ContactModule({ profile, preview }: { profile: PublicBusinessProfile; preview: boolean }) {
  return <PublicBusinessContact profile={profile} preview={preview} />;
}
