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
 * `maturity` — `q2_demand_trend` YA es el productor real de `demandTrend`, incluida su rama
 * `decreasing_observed` — y `q2_goal`/`q2_friction` en `goal_friction`) las señales de fundación que
 * faltaban: sector (`nicheGroup`), alcance geográfico/comprador (`customerReach`/`customerBuyer`, sin
 * los cuales `CustomerModel` nunca se resuelve), y la operacionalización de `systemization`/
 * `capacityPressure`/`capacityExpansion` (checkpoint original §12: "growing" vs "operating" no puede
 * depender de un solo eje `demandTrend`, y `capacityPressure`/`capacityExpansion` son evidencia
 * ADICIONAL, no un sustituto de `demandTrend`).
 *
 * Domain review R1 corrigió tres puntos: (1) `CustomerReach` mezclaba geografía con canal (`"online"`
 * conflaba ambos ejes) — ver `contracts.ts` para el rediseño geográfico puro; (2) `q2_team_systemization`
 * se renombra a `q2_process_systemization`, wording sin mencionar tamaño de equipo; (3) `NicheGroup`
 * (`context-resolver.ts`) ya no deja que una fuente más específica sobrescriba en silencio una
 * declaración material incompatible de otra fuente — ver `conflicting_evidence`.
 *
 * Domain review R2 corrigió tres puntos más, antes de cerrar el lote: (1) `q2_sector` ofrecía
 * `ecommerce`/`creator`/`b2b_services` como si fueran sectores — son modelo operativo/canal, ya
 * resolubles por `q2_delivery`+monetización+`q2_customer_buyer`; retirados de las opciones (el valor de
 * `NicheGroup` sigue existiendo en el contrato para catálogo/analítica, solo deja de ofrecerse aquí como
 * elección directa). `retail` se mantiene deliberadamente: es un mercado/industria ("comercio general"),
 * no un canal — a diferencia de `ecommerce`, no describe CÓMO se vende sino QUÉ tipo de comercio es,
 * igual que `food_hospitality`/`automotive` también coexisten con su propio `OperationalArchetype` sin
 * ambigüedad real. (2) `mixed` en `q2_customer_reach` se redefine como una combinación OPERATIVAMENTE
 * real (una parte del negocio local y otra que atiende más lejos de forma habitual), no dispersión
 * geográfica incidental. (3) `q2_process_systemization` gana un estado "parcial" que no fuerza
 * `true`/`false`: la opción no produce ninguna señal (§9 del checkpoint R2), y el prompt se acorta
 * moviendo los ejemplos a la pista (`hint`, antes `helper`).
 */
export const LOTE_A_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_sector",
    version: 1,
    module: "core",
    type: "single",
    prompt: "¿En qué sector o tipo de actividad encaja mejor lo que haces?",
    hint: "Elige la categoría más amplia que aplique; las siguientes preguntas ajustan los detalles.",
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
      // "retail" se mantiene deliberadamente (domain review R2 §6): es un mercado ("comercio general"),
      // no un canal — a diferencia de "ecommerce"/"creator"/"b2b_services" (retirados abajo), no describe
      // CÓMO se vende. Un negocio de retail puede vender en línea Y/O en tienda física sin contradicción.
      { value: "retail", label: "Comercio o tienda", produces: [{ kind: "nicheGroup", value: "retail", provenance: "explicit_declaration" }] },
      { value: "education_coaching", label: "Educación o coaching", produces: [{ kind: "nicheGroup", value: "education_coaching", provenance: "explicit_declaration" }] },
      { value: "creative_media", label: "Creativo o medios", produces: [{ kind: "nicheGroup", value: "creative_media", provenance: "explicit_declaration" }] },
      { value: "technology_software", label: "Tecnología o software", produces: [{ kind: "nicheGroup", value: "technology_software", provenance: "explicit_declaration" }] },
      { value: "nonprofit_community", label: "Organización sin fines de lucro o comunidad", produces: [{ kind: "nicheGroup", value: "nonprofit_community", provenance: "explicit_declaration" }] },
      // Escape hatch legítimo (§18 de 08B.0/08B.1): "other" solo se resuelve por declaración explícita, nunca por defecto.
      { value: "other", label: "Otro sector, no encaja en los anteriores", produces: [{ kind: "nicheGroupOther", value: true, provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_customer_reach",
    version: 1,
    module: "classification",
    type: "single",
    // DIAG-V3-08F: la pista ya no remite a otra pregunta (el orden lo decide el planner); variantes para quien
    // todavía no tiene clientes y para organizaciones.
    prompt: "¿Hasta dónde llegan geográficamente tus clientes?",
    hint: "Piensa en dónde están, no en si los atiendes en línea o en persona.",
    purpose: ["classification"],
    priority: "high",
    variants: [
      { target: { terminology: ["prelaunch"] }, prompt: "¿Dónde estarán principalmente las personas a las que quieres llegar?", hint: "Piensa en dónde están, no en si las atenderás en línea o en persona." },
      { target: { terminology: ["nonprofit"] }, prompt: "¿Dónde están principalmente las personas a las que atiende tu organización?", hint: "Piensa en dónde están, no en si las atiendes en línea o en persona." },
    ],
    options: [
      { value: "local", label: "Mi zona o ciudad", produces: [{ kind: "customerReach", value: "local", provenance: "explicit_declaration" }] },
      { value: "regional", label: "Varias ciudades o mi región, sin llegar a todo el país", produces: [{ kind: "customerReach", value: "regional", provenance: "explicit_declaration" }] },
      { value: "national", label: "Todo el país", produces: [{ kind: "customerReach", value: "national", provenance: "explicit_declaration" }] },
      { value: "global", label: "Más de un país", produces: [{ kind: "customerReach", value: "global", provenance: "explicit_declaration" }] },
      {
        value: "mixed",
        label: "Las dos cosas: una parte es local y otra llega más lejos de forma habitual, no como caso aislado",
        produces: [{ kind: "customerReach", value: "mixed", provenance: "explicit_declaration" }],
      },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_customer_buyer",
    version: 1,
    module: "classification",
    type: "single",
    // DIAG-V3-08F: base sin "comprador" — también se pregunta antes del lanzamiento, cuando aún no hay compradores.
    prompt: "¿A quién se dirige principalmente lo que ofreces?",
    purpose: ["classification"],
    priority: "high",
    // Copy variant por businessModel (DIAG-V3-08B.3 Lote D C1): "comprador" es lenguaje comercial que no
    // encaja para una organización sostenida por donaciones/membresías — pero el EJE interno que mide
    // (persona vs. organización) sigue siendo útil sin cambios, así que solo cambia el prompt, nunca
    // `options`/`produces`: `customerBuyer` sigue resolviendo exactamente b2c/b2b/mixed para nonprofit.
    // El fresh domain review de C1 encontró que el prompt-variant NO bastaba solo: la opción "b2c" decía
    // "consumidor final" (lenguaje de transacción comercial), que seguía sonando fuera de lugar bajo el
    // nuevo prompt para nonprofit. En vez de ampliar `CopyVariantV2` para permitir variants por opción
    // (el mecanismo actual solo cubre `prompt`/`helper`, §4 del checkpoint: "no ampliar el contrato sin
    // necesidad"), se corrigió el label BASE a un wording universal ("Personas individuales") que
    // funciona igual de bien para un negocio comercial que para una organización sin fines de lucro —
    // sin necesitar un variant de opción en absoluto. (DIAG-V3-08F añadió `optionLabels` para casos donde una
    // etiqueta neutral no basta; aquí sigue sin hacer falta.)
    variants: [{ target: { businessModel: "nonprofit" }, prompt: "¿Con quién se relaciona principalmente tu organización?" }],
    options: [
      { value: "b2c", label: "Personas individuales", produces: [{ kind: "customerBuyer", value: "b2c", provenance: "explicit_declaration" }] },
      { value: "b2b", label: "Otras empresas u organizaciones", produces: [{ kind: "customerBuyer", value: "b2b", provenance: "explicit_declaration" }] },
      { value: "mixed", label: "Ambos, en proporciones similares", produces: [{ kind: "customerBuyer", value: "mixed", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    // Renombrada desde q2_team_systemization (domain review R1, §12-14): el nombre y el wording
    // originales sugerían tamaño de equipo. `systemization` mide procesos/documentación repetibles,
    // independiente de cuánta gente hay — un profesional solo puede tener systemization alta y una
    // empresa de 15 personas puede tener systemization baja.
    id: "q2_process_systemization",
    version: 1,
    module: "maturity",
    type: "single",
    prompt: "En las tareas que se repiten, ¿hay una forma definida de hacerlas o suelen depender de la memoria y el criterio de cada persona?",
    hint: "Piensa en responder mensajes, registrar pedidos o dar seguimiento. No depende del tamaño del equipo.",
    purpose: ["maturity"],
    priority: "normal",
    // Encadenada a otra respuesta UNIVERSAL de este mismo lote (§67 answer applicability): solo tiene
    // sentido preguntar por sistematización una vez que hay operación real con clientes.
    appliesWhen: eqV2("q2_has_customers", "yes"),
    options: [
      { value: "documented_process", label: "Hay una forma definida (documentada, con plantilla o herramienta)", produces: [{ kind: "systemization", value: true, provenance: "observed_fact" }] },
      // Estado parcial (domain review R2 §9-10): no produce NINGUNA señal, ni true ni false — un negocio
      // a medio camino no debe quedar forzado a una respuesta booleana. Distinto de "unsure": aquí la
      // persona SÍ sabe cómo funciona su negocio (es una mezcla real), no que lo desconozca.
      { value: "partial", label: "Es una mezcla: algunas tareas tienen proceso definido y otras todavía dependen de cada persona" },
      { value: "memory_dependent", label: "Depende de la memoria o el criterio de cada persona", produces: [{ kind: "systemization", value: false, provenance: "observed_fact" }] },
      { value: "unsure", label: "No lo había pensado de esa forma", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: {
      understand: "Si las tareas habituales se hacen siempre de la misma forma o dependen de quién las haga.",
      distinction: "Una forma definida existe aunque no esté escrita, si todos la siguen igual; la mezcla real es una opción válida.",
      why: "Ayuda a distinguir una operación que crece con orden de una que depende del esfuerzo de cada persona.",
    },
  },
  {
    id: "q2_capacity_signal",
    version: 1,
    module: "maturity",
    type: "multi",
    // DIAG-V3-08F: la pista anterior explicaba el modelo interno (evidencia adicional a otra pregunta); ahora solo
    // ayuda a responder.
    prompt: "En los últimos meses, ¿qué ha pasado con tu capacidad para atender la demanda? Elige todas las que apliquen.",
    hint: "Piensa en los últimos meses en conjunto, no en una semana buena o mala.",
    purpose: ["maturity"],
    priority: "normal",
    // Misma cadena que q2_demand_trend (hermana, mismo padre): solo aplica una vez que la operación ya es regular.
    appliesWhen: eqV2("q2_regularity", "regular"),
    options: [
      { value: "waitlist_growing", label: "La lista de espera o el trabajo pendiente ha ido creciendo", produces: [{ kind: "capacityPressure", value: true, provenance: "observed_fact" }] },
      { value: "expanded", label: "Amplié la capacidad (personas, espacio u horas) para atender más demanda", produces: [{ kind: "capacityExpansion", value: true, provenance: "observed_fact" }] },
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
    helpIntent: {
      understand: "Si en los últimos meses te ha faltado capacidad o la has tenido que ampliar.",
      distinction: "Puedes marcar las dos primeras a la vez; elige «Ninguna» solo si la capacidad no cambió.",
      why: "Junto con la evolución de la demanda, ayuda a distinguir una actividad estable de una que está creciendo.",
    },
  },
] as const;
