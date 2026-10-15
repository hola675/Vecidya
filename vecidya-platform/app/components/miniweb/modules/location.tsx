import type { PublicBusinessProfile } from "../../public-business-profile-view";

const serviceModeLabels: Record<string, string> = {
  in_person: "Presencial",
  remote: "Remoto / virtual",
  hybrid: "Presencial y remoto",
};

export function LocationModule({ profile }: { profile: PublicBusinessProfile }) {
  const details = [
    ["Categoría", profile.category],
    ["Ciudad", profile.city],
    ["País", profile.country],
    ["Modalidad", profile.serviceMode ? serviceModeLabels[profile.serviceMode] ?? profile.serviceMode : null],
    ["Área de atención", profile.serviceArea],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]?.trim()));

  if (!details.length) return null;
  return (
    <section aria-labelledby="miniweb-location-title" className="public-v2-card public-business-profile__details">
      <h2 id="miniweb-location-title">Ubicación y modalidad</h2>
      <dl>
        {details.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
