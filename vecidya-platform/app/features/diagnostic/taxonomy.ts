import {
  toNicheId,
  type BusinessModel,
  type CustomerBuyer,
  type CustomerReach,
  type EntityType,
  type GrowthStage,
  type NicheDefinition,
  type NicheGroup,
  type OperationalArchetype,
  type PrimaryFriction,
  type PrimaryGoal,
} from "./contracts";

/**
 * Registro de dominio de DIAG-V3-08B.0 (taxonomía y contratos).
 *
 * Este archivo no cambia el comportamiento del motor: es la capa inspeccionable (§21) que responde
 * "qué valores existen, con qué etiqueta y definición" para cada concepto cerrado de `contracts.ts`.
 * No es copy de UI: los `label`/`definition` son para documentación interna, tests y una futura UI de
 * DIAG-V3-09, no texto final revisado editorialmente (eso llega en 08B.7).
 *
 * Cada registro se autoriza como `Record<T, ...>` (no un array validado en tiempo de ejecución): la
 * indexación exacta por cada valor de la lista cerrada hace que TypeScript rechace en compilación un
 * valor faltante o sobrante, sin ningún `throw` al cargar el módulo. Se evita así el riesgo que
 * encontró la revisión de código independiente de esta fase: el módulo se importa a través del barrel
 * `index.ts` (`export * from "./taxonomy"`), y ese barrel lo usan rutas fuera del Diagnóstico (p. ej.
 * la página pública que solo necesita `buildDiagnosticPath`) — un `throw` al cargar este módulo por un
 * registro incompleto habría podido tumbar esas rutas, no solo el Diagnóstico.
 */

export type TaxonomyEntry<T extends string> = {
  readonly id: T;
  readonly label: string;
  /** Una frase: qué significa este valor y, cuando hay riesgo de confusión, qué NO significa. */
  readonly definition: string;
};

function toEntries<T extends string>(labels: Record<T, Omit<TaxonomyEntry<T>, "id">>): readonly TaxonomyEntry<T>[] {
  return (Object.keys(labels) as T[]).map((id) => ({ id, ...labels[id] }));
}

/** Mismo chequeo que usan los tests de `taxonomy.test.ts` sobre los registros reales y sobre `NICHE_REGISTRY` (mutación C, §40). */
export function hasDuplicateIds<T extends string>(entries: readonly { id: T }[]): boolean {
  const ids = entries.map((entry) => entry.id);
  return new Set(ids).size !== ids.length;
}

// ── EntityType ───────────────────────────────────────────────────────────────

export const ENTITY_TYPE_REGISTRY: readonly TaxonomyEntry<EntityType>[] = toEntries<EntityType>({
  business: { label: "Negocio", definition: "Una empresa u operación comercial establecida con al menos otra persona remunerada además de quien responde." },
  individual: { label: "Persona independiente", definition: "Una sola persona que ofrece su trabajo, sin más personal remunerado (ver frontera en `contracts.ts`)." },
  organization: { label: "Organización", definition: "Un grupo formal sin fines de lucro, comunitario o institucional." },
  project: { label: "Proyecto o idea", definition: "Algo que todavía no opera como negocio establecido; puede no tener clientes reales aún." },
});

// ── BusinessModel ────────────────────────────────────────────────────────────

export const BUSINESS_MODEL_REGISTRY: readonly TaxonomyEntry<BusinessModel>[] = toEntries<BusinessModel>({
  services: { label: "Servicios", definition: "Cobra por trabajo o tiempo entregado, incluyendo trabajo creativo/de agencia por encargo; no requiere una credencial legal para ejercer (esa frontera es lo que distingue de `professional_services`)." },
  products: { label: "Productos", definition: "Vende bienes físicos o digitales fabricados o adquiridos para reventa, con o sin local/inventario físico como canal — cubre tanto una tienda con vitrina como una tienda exclusivamente en línea; el mecanismo de entrega (local físico vs. en línea) lo describe `OperationalArchetype`, no este valor." },
  professional_services: { label: "Servicios profesionales", definition: "Servicios que requieren una credencial o licencia legal para ejercer (legal, contable, médica), entregados por proyecto, consulta o retención." },
  creator_audience: { label: "Creador de audiencia", definition: "Monetiza atención/contenido (patrocinios, productos digitales, membresías de audiencia), no un catálogo de servicios o productos tradicional." },
  membership: { label: "Membresía o suscripción", definition: "Ingreso recurrente por acceso continuo, ya sea consumo (gimnasio, club) o software (SaaS); deliberadamente amplio en esta fase — no se separa todavía B2C de SaaS porque ninguna pregunta lo consume aún (ver revisión de dominio de DIAG-V3-08B.0)." },
  nonprofit: { label: "Sin fines de lucro", definition: "El objetivo primario no es la ganancia sino una misión (donaciones, participación, membresía social)." },
  hybrid: { label: "Híbrido", definition: "Combina dos o más modelos de forma real y relevante (p. ej. productos + membresía); no es un valor de relleno para la incertidumbre — ver `Unresolved` para eso." },
});

// ── OperationalArchetype ─────────────────────────────────────────────────────

export const OPERATIONAL_ARCHETYPE_REGISTRY: readonly TaxonomyEntry<OperationalArchetype>[] = toEntries<OperationalArchetype>({
  local: { label: "Local físico", definition: "Opera desde una ubicación física sin que citas o inventario de reventa sean el eje central (p. ej. gimnasio, spa, taller)." },
  appointments: { label: "Por citas", definition: "La operación gira en torno a reservar bloques de tiempo; no-shows y confirmación son relevantes." },
  local_service: { label: "Servicio local a domicilio", definition: "Se desplaza a atender clientes fuera de un local propio — a una dirección fija (plomería, electricidad) o a ubicaciones variables dentro de un área (food truck, catering); no es una ubicación fija que el cliente visita." },
  professional: { label: "Profesional independiente", definition: "Una persona con expertise especializada que trabaja por proyecto/consulta, con o sin citas formales." },
  ecommerce: { label: "Comercio electrónico", definition: "La venta ocurre en un checkout en línea; el inventario físico/exhibición no es el canal principal." },
  retail: { label: "Comercio minorista físico", definition: "El cliente visita un local con inventario/exhibición física para comprar; se distingue de `local` porque el catálogo/inventario es el eje operativo, no solo la ubicación." },
  hospitality: { label: "Hospitalidad", definition: "Restaurantes, cafés y negocios de consumo/estadía en el lugar, con o sin reservas." },
  b2b: { label: "Negocio a negocio", definition: "El comprador es otra empresa/organización, con ciclo de decisión y pipeline propios." },
  creator: { label: "Creador de audiencia", definition: "La operación gira en torno a contenido/audiencia propia, no un local ni un pipeline de ventas B2B." },
  organization: { label: "Organización", definition: "Opera con una estructura formal orientada a misión/comunidad, no primariamente a ingresos (ver tensión documentada en `contracts.ts`: describe estructura, no mecanismo de entrega, a diferencia del resto de esta lista)." },
  startup: { label: "Proyecto nuevo", definition: "Sin operación establecida todavía; la validación y el lanzamiento son la prioridad, no la retención." },
  hybrid: { label: "Híbrido", definition: "Combina dos o más archetypes de forma real (p. ej. `retail` + `ecommerce`); no es sinónimo de `unresolved` — ver mutación F." },
});

// ── NicheGroup ───────────────────────────────────────────────────────────────

export const NICHE_GROUP_REGISTRY: readonly TaxonomyEntry<NicheGroup>[] = toEntries<NicheGroup>({
  health_wellness: { label: "Salud y bienestar", definition: "Atención médica, dental, mental o de bienestar físico." },
  beauty_personal_care: { label: "Belleza y cuidado personal", definition: "Estética, peluquería, spa no clínico." },
  legal: { label: "Legal", definition: "Servicios de abogacía y asesoría jurídica." },
  financial_tax_insurance: { label: "Finanzas, impuestos y seguros", definition: "Contabilidad, preparación de impuestos, seguros y asesoría financiera." },
  professional_services: { label: "Servicios profesionales", definition: "Consultoría, arquitectura, diseño y otros servicios de expertise no cubiertos por otro grupo más específico." },
  home_services: { label: "Servicios para el hogar", definition: "Plomería, electricidad, limpieza, jardinería y similares a domicilio." },
  automotive: { label: "Automotriz", definition: "Talleres, venta y mantenimiento de vehículos." },
  real_estate: { label: "Bienes raíces", definition: "Venta, renta y gestión de propiedades." },
  food_hospitality: { label: "Alimentos y hospitalidad", definition: "Restaurantes, cafés, hoteles y servicios de alojamiento/consumo, incluyendo negocios móviles (food trucks)." },
  retail: { label: "Comercio minorista", definition: "Tiendas físicas con inventario para venta directa." },
  ecommerce: { label: "Comercio electrónico", definition: "Venta principalmente en línea, sin local físico como canal primario." },
  education_coaching: { label: "Educación y coaching", definition: "Enseñanza, formación y acompañamiento personal/profesional." },
  creative_media: { label: "Creativo y medios", definition: "Producción audiovisual, diseño gráfico, fotografía y medios entregados por encargo a un cliente — se distingue de `creator` en que el activo es el encargo, no una audiencia propia." },
  creator: { label: "Creador de contenido", definition: "Agrupa por mecanismo de monetización (audiencia propia), no por tema de contenido — ver justificación completa en `contracts.ts`." },
  b2b_services: { label: "Servicios B2B", definition: "Agencias, software o servicios vendidos principalmente a otras empresas." },
  technology_software: { label: "Tecnología y software", definition: "Productos o servicios de software propio." },
  nonprofit_community: { label: "Sin fines de lucro y comunidad", definition: "Organizaciones con misión social, comunitaria o benéfica." },
  other: { label: "Otro", definition: "No encaja claramente en ningún grupo anterior; nunca se asigna automáticamente (ver mutación E), solo cuando el nicho declarado no coincide con ningún grupo conocido." },
});

// ── GrowthStage ──────────────────────────────────────────────────────────────

export const GROWTH_STAGE_REGISTRY: readonly TaxonomyEntry<GrowthStage>[] = toEntries<GrowthStage>({
  idea: { label: "Idea", definition: "Sin operación ni clientes reales todavía; la validación es la señal, no la infraestructura." },
  starting: { label: "Arrancando", definition: "Primeras operaciones o primeros clientes reales, con procesos todavía inmaduros o manuales." },
  operating: { label: "Operando", definition: "Actividad estable y repetible; no necesariamente creciendo, pero funcionando de forma consistente." },
  growing: { label: "Creciendo", definition: "Aumento demostrable de demanda, volumen o capacidad (observable), no la sola intención de crecer. Frontera con `operating` pendiente de operacionalizar en DIAG-V3-08B.3 (ver `contracts.ts`)." },
  scaling: { label: "Escalando", definition: "El crecimiento se sostiene con procesos, equipo o sistemas repetibles, no con esfuerzo heroico puntual." },
});

// ── CustomerModel (reach / buyer) ────────────────────────────────────────────

export const CUSTOMER_REACH_REGISTRY: readonly TaxonomyEntry<CustomerReach>[] = toEntries<CustomerReach>({
  local: { label: "Local", definition: "Sirve a un área geográfica acotada (ciudad, barrio)." },
  regional: { label: "Regional", definition: "Sirve a varias ciudades o una región, sin ser nacional ni global." },
  online: { label: "En línea / global", definition: "Sirve sin límite geográfico relevante, principalmente a través de canales digitales." },
  mixed: { label: "Mixto", definition: "Combina alcance local con alcance regional/en línea de forma real, no por incertidumbre." },
});

export const CUSTOMER_BUYER_REGISTRY: readonly TaxonomyEntry<CustomerBuyer>[] = toEntries<CustomerBuyer>({
  b2c: { label: "A consumidor final", definition: "El comprador es una persona que decide por sí misma." },
  b2b: { label: "A otra empresa", definition: "El comprador es una empresa u organización, con ciclo de decisión propio." },
  mixed: { label: "Mixto", definition: "Vende a ambos de forma real, no por incertidumbre sobre cuál predomina." },
});

// ── PrimaryGoal ──────────────────────────────────────────────────────────────

export const PRIMARY_GOAL_REGISTRY: readonly TaxonomyEntry<PrimaryGoal>[] = toEntries<PrimaryGoal>({
  be_found: { label: "Ser encontrado", definition: "Quiere que más personas lo descubran; el problema es de visibilidad, no de conversión." },
  explain: { label: "Explicar mejor la oferta", definition: "Quiere comunicar con más claridad qué hace y para quién." },
  trust: { label: "Generar confianza", definition: "Quiere que quienes ya lo encuentran confíen más antes de decidir." },
  opportunities: { label: "Recibir más oportunidades", definition: "Quiere aumentar el volumen de consultas u oportunidades entrantes." },
  stop_losing: { label: "Dejar de perder oportunidades", definition: "Ya recibe oportunidades pero se están perdiendo antes de cerrarse." },
  organize: { label: "Ordenar procesos", definition: "Quiere ordenar contactos, tareas o procesos internos." },
  automate: { label: "Automatizar", definition: "Quiere automatizar o delegar trabajo repetitivo." },
  measure: { label: "Medir resultados", definition: "Quiere entender qué está funcionando y qué no." },
});

// ── PrimaryFriction ──────────────────────────────────────────────────────────

export const PRIMARY_FRICTION_REGISTRY: readonly TaxonomyEntry<PrimaryFriction>[] = toEntries<PrimaryFriction>({
  visibility: { label: "Visibilidad", definition: "Nadie encuentra el negocio: poco o ningún tráfico o consultas de entrada." },
  trust: { label: "Confianza", definition: "Lo encuentran pero dudan antes de avanzar: falta de prueba social, reputación o claridad de la oferta." },
  conversion: { label: "Conversión", definition: "Llegan consultas pero pocas se cierran; el problema está en la oferta o la negociación, no en el volumen de entrada ni en el seguimiento." },
  follow_up: { label: "Seguimiento", definition: "Las consultas se pierden por falta de respuesta o proceso, antes de llegar a evaluarse; distinto de `conversion`, donde sí se evalúan pero no se cierran." },
  operations: { label: "Operación interna", definition: "El cuello de botella es interno: desorganización, trabajo repetitivo manual, falta de datos para decidir, o retención/postventa débil (ver nota sobre `post_sale_loop` en `contracts.ts`)." },
  scale: { label: "Capacidad de crecer", definition: "Ya funciona de forma repetible pero no soporta más volumen sin romperse (capacidad, equipo, procesos)." },
});

// ── Catálogo inicial de nichos (DIAG-V3-08B.0 §11) ──────────────────────────

/**
 * Catálogo representativo, NO el catálogo final (eso es DIAG-V3-08B.3). Suficiente para validar la
 * arquitectura: al menos un nicho por familia relevante para negocios locales/digitales, cubriendo
 * health/legal/finance/automotive/hospitality/retail/ecommerce/B2B/creator/nonprofit (§29). `NicheId`
 * es un conjunto abierto (marca nominal sobre `string`), así que a diferencia de los registros de
 * arriba no puede validarse con un `Record` exhaustivo — la comprobación de IDs únicos vive en
 * `taxonomy.test.ts` (tiempo de test), no en un `throw` al cargar este módulo.
 */
function niche(id: string, label: string, group: NicheGroup, archetypeHints: readonly [OperationalArchetype, ...OperationalArchetype[]]): NicheDefinition {
  const nicheId = toNicheId(id);
  if (!nicheId) throw new Error(`NICHE_REGISTRY: «${id}» no es un NicheId válido`);
  return { id: nicheId, label, group, archetypeHints };
}

export const NICHE_REGISTRY: readonly NicheDefinition[] = [
  niche("dentist", "Dentista", "health_wellness", ["appointments"]),
  niche("primary_care", "Medicina general", "health_wellness", ["appointments"]),
  niche("psychiatry", "Psiquiatría", "health_wellness", ["appointments"]),
  niche("medspa", "Medspa / estética médica", "health_wellness", ["appointments"]),
  niche("hair_salon", "Salón de belleza", "beauty_personal_care", ["appointments", "local"]),
  niche("barbershop", "Barbería", "beauty_personal_care", ["appointments", "local"]),
  niche("law_firm", "Bufete de abogados", "legal", ["professional", "b2b"]),
  niche("tax_preparation", "Preparación de impuestos", "financial_tax_insurance", ["professional", "appointments"]),
  niche("insurance_agency", "Agencia de seguros", "financial_tax_insurance", ["professional", "b2b"]),
  niche("consulting", "Consultoría", "professional_services", ["professional", "b2b"]),
  niche("hvac", "Climatización (HVAC)", "home_services", ["local_service"]),
  niche("plumbing", "Plomería", "home_services", ["local_service"]),
  niche("auto_repair", "Taller mecánico", "automotive", ["local"]),
  niche("real_estate_agent", "Agente inmobiliario", "real_estate", ["professional", "appointments"]),
  niche("restaurant", "Restaurante", "food_hospitality", ["hospitality"]),
  niche("cafe", "Cafetería", "food_hospitality", ["hospitality"]),
  niche("food_truck", "Food truck", "food_hospitality", ["local_service", "hospitality"]),
  niche("clothing_store", "Tienda de ropa", "retail", ["retail"]),
  niche("online_store", "Tienda en línea", "ecommerce", ["ecommerce"]),
  niche("coach", "Coach / mentor", "education_coaching", ["professional", "creator"]),
  niche("photographer", "Fotógrafo por encargo", "creative_media", ["professional", "local_service"]),
  niche("content_creator", "Creador de contenido", "creator", ["creator"]),
  niche("marketing_agency", "Agencia de marketing", "b2b_services", ["b2b"]),
  niche("software_startup", "Startup de software", "technology_software", ["startup", "b2b"]),
  niche("nonprofit_org", "Organización sin fines de lucro", "nonprofit_community", ["organization"]),
] as const;

/**
 * Busca la familia de un nicho conocido en el catálogo. Nunca asigna `other` automáticamente
 * (mutación E, §40): un nicho fuera del catálogo devuelve `undefined`, no un grupo adivinado.
 */
export function lookupNicheGroup(id: NicheDefinition["id"]): NicheGroup | undefined {
  return NICHE_REGISTRY.find((entry) => entry.id === id)?.group;
}

/** Los hints de archetype de un nicho conocido, o `undefined` si no está en el catálogo. Nunca un hecho resuelto (§19-20). */
export function lookupNicheArchetypeHints(id: NicheDefinition["id"]): readonly OperationalArchetype[] | undefined {
  return NICHE_REGISTRY.find((entry) => entry.id === id)?.archetypeHints;
}
