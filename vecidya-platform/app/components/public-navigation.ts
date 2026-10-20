/**
 * UX-WEB-NAV-02 — catálogo único de destinos visibles de la web pública.
 *
 * Los nombres comerciales son independientes de las URLs canónicas: el destino
 * técnico /addons conserva su URL mientras la interfaz muestra «Complementos».
 * No añadir aquí rutas privadas nuevas ni duplicar destinos como alias.
 */
export const PUBLIC_NAVIGATION_LINKS = {
  home: { to: "/", label: "Inicio" },
  vecindario: { to: "/vecindario", label: "Vecindario" },
  aprende: { to: "/aprende", label: "Aprende" },
  diagnostico: { to: "/diagnostico", label: "Diagnóstico" },
  licencias: { to: "/licencias", label: "Licencias" },
  servicios: { to: "/servicios", label: "Servicios" },
  complementos: { to: "/addons", label: "Complementos" },
  nosotros: { to: "/sobre-nosotros", label: "Sobre nosotros" },
  contacto: { to: "/contacto", label: "Contacto" },
  unete: { to: "/unete", label: "Únete a Vecidya" },
  privacidad: { to: "/privacidad", label: "Privacidad y datos" },
  terminos: { to: "/terminos", label: "Condiciones de uso" },
  acceder: { to: "/login", label: "Acceder" },
} as const;

const navigation = PUBLIC_NAVIGATION_LINKS;

export const PUBLIC_HEADER_PRIMARY_LINKS = [
  navigation.vecindario,
  navigation.aprende,
  navigation.diagnostico,
  navigation.contacto,
] as const;

export const PUBLIC_HEADER_SOLUTIONS_LINKS = [
  navigation.licencias,
  navigation.servicios,
  navigation.complementos,
] as const;

export const PUBLIC_MOBILE_LINKS = [
  navigation.home,
  navigation.vecindario,
  navigation.aprende,
  navigation.diagnostico,
  navigation.licencias,
  navigation.servicios,
  navigation.complementos,
  navigation.nosotros,
  navigation.contacto,
  navigation.privacidad,
  navigation.terminos,
  navigation.acceder,
  navigation.unete,
] as const;

export const PUBLIC_FOOTER_GROUPS = [
  {
    id: "explorar",
    title: "Explorar",
    links: [navigation.vecindario, navigation.aprende, navigation.diagnostico],
  },
  {
    id: "soluciones",
    title: "Soluciones",
    links: [navigation.licencias, navigation.servicios, navigation.complementos],
  },
  {
    id: "vecidya",
    title: "Vecidya",
    links: [navigation.nosotros, navigation.contacto, navigation.unete],
  },
  {
    id: "legal",
    title: "Información legal",
    links: [navigation.privacidad, navigation.terminos],
  },
] as const;
