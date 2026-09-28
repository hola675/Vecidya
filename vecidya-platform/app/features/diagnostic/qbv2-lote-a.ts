import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { eqV2 } from "./qbv2-rules";

/**
 * DIAG-V3-08B.3 — Lote A: `core`/`classification`/`maturity`/`goal_friction` (fundación universal).
 *
 * Regla de producto obligatoria para todo 08B.3 (checkpoint del usuario, no repetirla en cada lote):
 * el cuestionario NO se organiza por nicho/profesión (§1-13 del checkpoint). Estas preguntas resuelven
 * SECTOR AMPLIO (`NicheGroup`) + modelo operativo + señales observables — nunca "¿eres dentista?". El
 * `NicheId` específico sigue siendo un dato interno opcional (§8-9): puede quedar `unresolved` sin que
 * eso degrade el diagnóstico. Todas las preguntas de este lote son universales (`appliesWhen` ausente o
 * encadenado a otra respuesta universal de este mismo lote, nunca a un archetype/nicho) — el contenido
 * ESPECIALIZADO por archetype es Lote B en adelante.
 *
 * Añade a `GOLDEN_QUESTIONS_V2` (que ya cubre `q2_entity`/`q2_other_staff`/`q2_monetization`/
 * `q2_delivery` en `core`/`classification`, `q2_has_customers`/`q2_regularity`/`q2_demand_trend` en
 * `maturity`, y `q2_goal`/`q2_friction` en `goal_friction`) las señales de fundación que faltaban:
 * sector (`nicheGroup`), alcance/comprador (`customerReach`/`customerBuyer`, sin los cuales
 * `CustomerModel` nunca se resuelve), y la operacionalización de `systemization`/`capacityPressure`/
 * `capacityExpansion` (checkpoint original §12: "growing" vs "operating" no puede depender de un solo
 * eje `demandTrend`).
 */
export const LOTE_A_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_sector",
    version: 1,
    module: "core",
    type: "single",
    prompt: "¿A qué sector se parece más lo que haces?",
    helper: "Elige la categoría más amplia que aplique; las siguientes preguntas ajustan los detalles.",
    purpose: ["anchor", "classification"],
    priority: "high",
    options: [
      { value: "health_wellness", label: "Salud y bienestar", produces: [{ kind: "nicheGroup", value: "health_wellness", provenance: "explicit_declaration" }] },
      { value: "beauty_personal_care", label: "Belleza y cuidado personal", produces: [{ kind: "nicheGroup", value: "beauty_personal_care", provenance: "explicit_declaration" }] },
      { value: "legal", label: "Legal", produces: [{ kind: "nicheGroup", value: "legal", provenance: "explicit_declaration" }] },
      { value: "financial_tax_insurance", label: "Finanzas, impuestos o seguros", produces: [{ kind: "nicheGroup", value: "financial_tax_insurance", provenance: "explicit_declaration" }] },
      { value: "professional_services", label: "Servicios profesionales (consultoría, diseño, arquitectura y similares)", produces: [{ kind: "nicheGroup", value: "professional_services", provenance: "explicit_declaration" }] },
      { value: "home_services", label: "Servicios para el hogar (plomería, climatización, limpieza y similares)", produces: [{ kind: "nicheGroup", value: "home_services", provenance: "explicit_declaration" }] },
      { value: "automotive", label: "Automotriz", produces: [{ kind: "nicheGroup", value: "automotive", provenance: "explicit_declaration" }] },
      { value: "real_estate", label: "Bienes raíces", produces: [{ kind: "nicheGroup", value: "real_estate", provenance: "explicit_declaration" }] },
      { value: "food_hospitality", label: "Alimentos y hospitalidad (restaurantes, cafés, hospedaje)", produces: [{ kind: "nicheGroup", value: "food_hospitality", provenance: "explicit_declaration" }] },
      { value: "retail", label: "Comercio o tienda física", produces: [{ kind: "nicheGroup", value: "retail", provenance: "explicit_declaration" }] },
      { value: "ecommerce", label: "Comercio electrónico (venta en línea)", produces: [{ kind: "nicheGroup", value: "ecommerce", provenance: "explicit_declaration" }] },
      { value: "education_coaching", label: "Educación o coaching", produces: [{ kind: "nicheGroup", value: "education_coaching", provenance: "explicit_declaration" }] },
      { value: "creative_media", label: "Creativo o medios", produces: [{ kind: "nicheGroup", value: "creative_media", provenance: "explicit_declaration" }] },
      { value: "creator", label: "Creador de contenido o audiencia propia", produces: [{ kind: "nicheGroup", value: "creator", provenance: "explicit_declaration" }] },
      { value: "b2b_services", label: "Servicios para otras empresas (B2B)", produces: [{ kind: "nicheGroup", value: "b2b_services", provenance: "explicit_declaration" }] },
      { value: "technology_software", label: "Tecnología o software", produces: [{ kind: "nicheGroup", value: "technology_software", provenance: "explicit_declaration" }] },
      { value: "nonprofit_community", label: "Organización sin fines de lucro o comunidad", produces: [{ kind: "nicheGroup", value: "nonprofit_community", provenance: "explicit_declaration" }] },
      // Escape hatch legítimo (§18 de 08B.0/08B.1): "other" solo se resuelve por declaración explícita, nunca por defecto.
      { value: "other", label: "Ninguna de las anteriores", produces: [{ kind: "nicheGroupOther", value: true, provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_customer_reach",
    version: 1,
    module: "classification",
    type: "single",
    prompt: "¿Dónde están principalmente tus clientes?",
    purpose: ["classification"],
    priority: "high",
    options: [
      { value: "local", label: "En mi zona o ciudad", produces: [{ kind: "customerReach", value: "local", provenance: "explicit_declaration" }] },
      { value: "regional", label: "En varias ciudades de mi región o país", produces: [{ kind: "customerReach", value: "regional", provenance: "explicit_declaration" }] },
      { value: "online", label: "En cualquier lugar; todo ocurre en línea", produces: [{ kind: "customerReach", value: "online", provenance: "explicit_declaration" }] },
      { value: "mixed", label: "Una mezcla de zona local y alcance más amplio", produces: [{ kind: "customerReach", value: "mixed", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_customer_buyer",
    version: 1,
    module: "classification",
    type: "single",
    prompt: "¿Quién es principalmente tu comprador?",
    purpose: ["classification"],
    priority: "high",
    options: [
      { value: "b2c", label: "Personas, como consumidor final", produces: [{ kind: "customerBuyer", value: "b2c", provenance: "explicit_declaration" }] },
      { value: "b2b", label: "Otras empresas", produces: [{ kind: "customerBuyer", value: "b2b", provenance: "explicit_declaration" }] },
      { value: "mixed", label: "Ambos, en proporciones similares", produces: [{ kind: "customerBuyer", value: "mixed", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_team_systemization",
    version: 1,
    module: "maturity",
    type: "single",
    prompt: "¿Ya tienes procesos y responsabilidades definidas para el trabajo del día a día (aunque el equipo seas solo tú), o cada tarea se resuelve de forma improvisada según va surgiendo?",
    purpose: ["maturity"],
    priority: "normal",
    // Encadenada a otra respuesta UNIVERSAL de este mismo lote (§67 answer applicability): solo tiene
    // sentido preguntar por sistematización una vez que hay operación real con clientes.
    appliesWhen: eqV2("q2_has_customers", "yes"),
    options: [
      { value: "defined", label: "Sí, hay procesos y responsabilidades claras", produces: [{ kind: "systemization", value: true, provenance: "observed_fact" }] },
      { value: "adhoc", label: "No, cada cosa se resuelve según va surgiendo", produces: [{ kind: "systemization", value: false, provenance: "observed_fact" }] },
      { value: "unsure", label: "No lo había pensado de esa forma", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_capacity_signal",
    version: 1,
    module: "maturity",
    type: "multi",
    prompt: "En los últimos meses, ¿cuál de estas describe lo que ha pasado con tu capacidad para atender la demanda? (elige todas las que apliquen)",
    helper: "Piensa en los últimos 2-3 periodos, no en una sola semana buena o mala.",
    purpose: ["maturity"],
    priority: "normal",
    // Misma cadena que q2_demand_trend (hermana, mismo padre): solo aplica una vez que la operación ya es regular.
    appliesWhen: eqV2("q2_regularity", "regular"),
    options: [
      { value: "waitlist_growing", label: "La lista de espera o el trabajo pendiente ha ido creciendo", produces: [{ kind: "capacityPressure", value: true, provenance: "observed_fact" }] },
      { value: "expanded", label: "Contraté o expandí capacidad (más personas, más espacio, más horas) para cubrir la demanda", produces: [{ kind: "capacityExpansion", value: true, provenance: "observed_fact" }] },
      {
        value: "stable",
        label: "Ninguna de las anteriores: mi capacidad se ha mantenido estable",
        exclusive: true,
        produces: [
          { kind: "capacityPressure", value: false, provenance: "observed_fact" },
          { kind: "capacityExpansion", value: false, provenance: "observed_fact" },
        ],
      },
      { value: "unknown", label: "No estoy seguro", kind: "unknown", exclusive: true },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
] as const;
