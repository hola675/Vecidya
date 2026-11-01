import { publicAssets } from "../assets/public-assets";

const heroArt = {
  neighborhood: { scene: publicAssets.illustrations.neighborhoodScene, vico: publicAssets.illustrations.vicoNeighborhood, sceneAlt: "Locales de barrio conectados por rutas digitales." , vicoAlt: "Vico explora el Vecindario." },
  diagnostic: { scene: publicAssets.illustrations.diagnosticScene, vico: publicAssets.illustrations.vicoDiagnostic, sceneAlt: "Capas de evaluación que organizan señales y próximos pasos." , vicoAlt: "Vico acompaña el Diagnóstico." },
  licenses: { scene: publicAssets.illustrations.licensesScene, vico: publicAssets.illustrations.vicoLicenses, sceneAlt: "Tres niveles progresivos de organización digital." , vicoAlt: "Vico presenta las licencias Vecidya." },
  services: { scene: publicAssets.illustrations.servicesScene, vico: publicAssets.illustrations.vicoServices, sceneAlt: "Módulos conectados que representan un servicio digital." , vicoAlt: "Vico acompaña los servicios Vecidya." },
  addons: { scene: publicAssets.illustrations.addonsScene, vico: publicAssets.illustrations.vicoAddons, sceneAlt: "Capacidades digitales conectadas para complementar un sistema." , vicoAlt: "Vico presenta los complementos." },
  about: { scene: publicAssets.illustrations.aboutScene, vico: publicAssets.illustrations.vicoAbout, sceneAlt: "Dos personas colaboran para planificar una solución digital." , vicoAlt: "Vico acompaña la historia de Vecidya." },
  contact: { scene: publicAssets.illustrations.contactScene, vico: publicAssets.illustrations.vicoContact, sceneAlt: "Canales de contacto conectados para iniciar una conversación." , vicoAlt: "Vico te da la bienvenida al contacto." },
  join: { scene: publicAssets.illustrations.joinScene, vico: publicAssets.illustrations.vicoJoin, sceneAlt: "Lista de preparación junto a pasos para empezar." , vicoAlt: "Vico acompaña tu inicio en Vecidya." },
} as const;

export function PublicHeroArt({ page }: { page: keyof typeof heroArt }) {
  const art = heroArt[page];
  return (
    <div className={`public-hero-art public-hero-art--${page}`}>
      <img alt={art.sceneAlt} className="public-hero-art__scene" decoding="async" height={360} src={art.scene} width={480} />
      <img alt={art.vicoAlt} className="public-hero-art__vico" decoding="async" height={1536} src={art.vico} width={1024} />
    </div>
  );
}
