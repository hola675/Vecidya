import type { PublicBusinessProfile } from "../../public-business-profile-view";

export function AboutModule({ profile }: { profile: PublicBusinessProfile }) {
  if (!profile.description?.trim()) return null;
  return (
    <section aria-labelledby="miniweb-about-title" className="public-v2-card public-business-profile__description">
      <h2 id="miniweb-about-title">Qué hace este negocio</h2>
      <p>{profile.description}</p>
    </section>
  );
}
