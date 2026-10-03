import type { DigitalDimensionId } from "./qbv2-coverage";
import { DIMENSION_NARRATIVE } from "./qbv2-narrative-phrases";
import { OVERALL_INDEX_MODEL, OVERALL_INDEX_VERSION, OVERALL_STATUS_LABELS } from "./qbv2-overall";
import { ROUTE_HARD_CAP } from "./qbv2-planner";

/**
 * DIAG-V3-11 — Methodology & Credibility. Explica el diagnóstico congelado; no lo crea ni lo modifica. Es solo datos:
 * ninguna función de scoring, prioridades o recomendaciones lee este módulo, y las fuentes externas viven aquí, nunca
 * en el código de dominio. Las etiquetas de las áreas y los números del contrato (bandas, mínimos, máximo de la ruta)
 * se leen del motor, así que el texto no puede contradecirlo; `METHODOLOGY_ENGINE_CONTRACT` fija esos valores para que
 * un cambio del motor obligue a revisar la metodología y su versión (prueba en `qbv2-methodology.test.ts`).
 */

/** Versión de la metodología, independiente de la versión de la aplicación (`package.json`). */
export const METHODOLOGY_VERSION = "2.0" as const;

/** Valores del motor que la metodología describe. Si el motor cambia, cambia la metodología y su versión. */
export const METHODOLOGY_ENGINE_CONTRACT = {
  overallIndexVersion: OVERALL_INDEX_VERSION,
  bands: OVERALL_INDEX_MODEL.bands,
  minScoredDimensions: OVERALL_INDEX_MODEL.minScoredDimensions,
  minCoverage: OVERALL_INDEX_MODEL.minCoverage,
  routeHardCap: ROUTE_HARD_CAP,
  maxPriorities: 3,
} as const;

// ── Contrato ────────────────────────────────────────────────────────────────

/**
 * Tipo de cada afirmación, para no presentar como principio externo lo que es una regla propia:
 * `internal_rule` describe el comportamiento del motor (verificable en código), `external_principle` resume una
 * fuente externa, `product_interpretation` es una decisión o lectura de Vecidya y `limitation` lo que no se puede afirmar.
 */
export const METHODOLOGY_CLAIM_TYPES = ["internal_rule", "external_principle", "product_interpretation", "limitation"] as const;
export type MethodologyClaimType = (typeof METHODOLOGY_CLAIM_TYPES)[number];

export type MethodologyClaim = {
  readonly id: string;
  readonly type: MethodologyClaimType;
  readonly text: string;
  /** Solo en `external_principle`: fuentes que lo respaldan. */
  readonly sourceIds?: readonly string[];
  /** Solo en `internal_rule`: dónde se verifica en el código. */
  readonly verifiedIn?: string;
};

export const METHODOLOGY_SOURCE_TYPES = ["official_platform_documentation", "government_statistics", "intergovernmental_research", "academic_research", "industry_research"] as const;
export type MethodologySourceType = (typeof METHODOLOGY_SOURCE_TYPES)[number];

/**
 * Una fuente solo respalda principios sobre lo que mide un área; nunca la fórmula, las bandas ni el orden de prioridades.
 * Solo se acepta una fuente cuyo contenido relevante se pudo leer: `excerpt` guarda, literal y en su idioma, el pasaje que
 * respalda el principio (verificado el día `verifiedOn`). Si solo se puede leer el título o un avance, la fuente no se usa.
 */
export type MethodologySource = {
  readonly id: string;
  readonly title: string;
  readonly organization: string;
  readonly url: string;
  readonly publishedAt?: string;
  readonly language: "es" | "en";
  readonly sourceType: MethodologySourceType;
  readonly supports: readonly { readonly dimension: DigitalDimensionId; readonly principle: string }[];
  readonly excerpt: string;
  readonly verifiedOn: string;
};

export type DimensionMethodology = {
  readonly id: DigitalDimensionId;
  /** Etiqueta final del resultado (`DIMENSION_NARRATIVE`), nunca una copia. */
  readonly label: string;
  readonly evaluates: string;
  /** Preguntas del banco que observan el área; la UI muestra su tema (`QUESTION_TOPICS`). */
  readonly evidenceQuestionIds: readonly string[];
  readonly high: string;
  readonly low: string;
  readonly notMeaning: string;
  /**
   * `external_principle` con sus fuentes cuando hay una fuente verificada; si no, `product_interpretation` (criterio
   * de Vecidya). No toda área necesita una cita externa: la credibilidad viene de atribuir bien, no de contar fuentes.
   */
  readonly whyItMatters: MethodologyClaim;
};

export type MethodologySectionId =
  | "overview" | "dimensions" | "area_score" | "overall_index" | "confidence" | "adaptive_route" | "evidence_roles"
  | "missing_information" | "priorities" | "recommendations" | "limitations" | "calculation_and_data" | "sources" | "versioning";

export type MethodologySection = {
  readonly id: MethodologySectionId;
  readonly title: string;
  /** Nivel A: explicación breve en lenguaje sencillo. */
  readonly simple: string;
  /** Nivel B: detalle para quien quiere entender el método. */
  readonly detail: readonly MethodologyClaim[];
};

// ── Fuentes externas ────────────────────────────────────────────────────────

/**
 * Selección (DIAG-V3-11): documentación oficial de plataformas, estadística pública e investigación institucional o
 * académica, solo donde respalda un principio que el área realmente observa. Ninguna valida la fórmula de Vecidya.
 * Retiradas en el cierre por no poder leer su contenido relevante (solo título o avance): HBR «The Short Life of Online
 * Sales Leads» y HBR «Zero Defections». Sus áreas quedan como criterio de Vecidya, sin cambio de motor.
 */
export const METHODOLOGY_SOURCES: readonly MethodologySource[] = [
  {
    id: "google-local-ranking", title: "Consejos para mejorar el posicionamiento local en Google", organization: "Google (Ayuda de Perfil de Empresa)",
    url: "https://support.google.com/business/answer/7091?hl=es", language: "es", sourceType: "official_platform_documentation",
    supports: [
      { dimension: "digital_foundation", principle: "Las empresas con información completa y precisa tienen más probabilidades de aparecer en los resultados de búsqueda local." },
      { dimension: "discovery", principle: "El posicionamiento local depende de la relevancia, la distancia y la prominencia." },
      { dimension: "trust_reputation", principle: "La cantidad de reseñas y valoraciones positivas influye en el posicionamiento local." },
    ],
    excerpt: "Las empresas que proporcionan información completa y precisa tienen más probabilidades de aparecer en los resultados de búsqueda local. […] Cuantas más reseñas y valoraciones positivas, mejor será el posicionamiento local de una empresa.",
    verifiedOn: "2026-10-01",
  },
  {
    id: "google-seo-starter", title: "Guía de optimización en buscadores (SEO) para principiantes", organization: "Google Search Central",
    url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=es", language: "es", sourceType: "official_platform_documentation",
    supports: [
      { dimension: "digital_foundation", principle: "Organizar un sitio de forma lógica ayuda a buscadores y personas a entender cómo se relacionan sus páginas." },
      { dimension: "discovery", principle: "La gran mayoría de las páginas nuevas que Google encuentra llegan a través de enlaces." },
    ],
    excerpt: "La gran mayoría de las páginas nuevas que Google encuentra cada día se hacen a través de enlaces […] puede ser útil organizarlo de forma lógica, ya que puede ayudar a los buscadores y a los usuarios a entender cómo se relacionan tus páginas con el resto del sitio.",
    verifiedOn: "2026-10-01",
  },
  {
    id: "google-helpful-content", title: "Crear contenido útil, fiable y centrado en las personas", organization: "Google Search Central",
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=es", language: "es", sourceType: "official_platform_documentation",
    supports: [
      { dimension: "clarity_positioning", principle: "El contenido debe crearse pensando primero en las personas y dejar claro quién está detrás." },
      { dimension: "trust_reputation", principle: "De los elementos que se esperan de un contenido (experiencia, conocimiento, autoridad y fiabilidad), la fiabilidad es el más importante." },
    ],
    excerpt: "el contenido dirigido a personas es contenido que se crea pensando principalmente en los usuarios […] la fiabilidad es el más importante […] ¿Se muestra claramente a los visitantes quién ha creado el contenido?",
    verifiedOn: "2026-10-01",
  },
  {
    id: "spiegel-reviews", title: "How Online Reviews Influence Sales", organization: "Spiegel Research Center, Northwestern University",
    url: "https://spiegel.medill.northwestern.edu/how-online-reviews-influence-sales/", publishedAt: "2017", language: "en", sourceType: "academic_research",
    supports: [{ dimension: "trust_reputation", principle: "Mostrar reseñas se asocia con una mayor probabilidad de compra." }],
    excerpt: "The purchase likelihood for a product with five reviews is 270% greater than the purchase likelihood of a product with no reviews.",
    verifiedOn: "2026-10-01",
  },
  {
    id: "google-analytics-key-events", title: "Diferencias entre las conversiones y los eventos clave en Google Analytics", organization: "Google (Ayuda de Analytics)",
    url: "https://support.google.com/analytics/answer/13965727?hl=es", language: "es", sourceType: "official_platform_documentation",
    supports: [{ dimension: "measurement_optimization", principle: "Conviene medir las acciones especialmente importantes para el éxito del negocio." }],
    excerpt: "Un evento clave es un evento que mide una acción que es especialmente importante para el éxito de tu empresa.",
    verifiedOn: "2026-10-01",
  },
  {
    id: "google-ads-conversions", title: "Acerca de la medición de conversiones", organization: "Google (Ayuda de Google Ads)",
    url: "https://support.google.com/google-ads/answer/1722022?hl=es", language: "es", sourceType: "official_platform_documentation",
    supports: [{ dimension: "measurement_optimization", principle: "Medir conversiones permite descubrir qué campañas y anuncios son más eficaces." }],
    excerpt: "Las conversiones te proporcionan estadísticas sobre el rendimiento de tus campañas. […] Descubrir cuáles son las palabras clave, los anuncios, los grupos de anuncios y las campañas más eficaces",
    verifiedOn: "2026-10-01",
  },
  {
    id: "oecd-sme-digital", title: "The Digital Transformation of SMEs", organization: "OCDE", url: "https://doi.org/10.1787/bdb9256a-en", publishedAt: "2021-02",
    language: "en", sourceType: "intergovernmental_research",
    supports: [{ dimension: "digital_readiness", principle: "Las pequeñas y medianas empresas van por detrás en la adopción digital, en todas las áreas tecnológicas." }],
    excerpt: "SMEs lag in digital adoption, in all technology areas, but tend to digitalise some business functions first: general administration and marketing operations.",
    verifiedOn: "2026-10-01",
  },
  {
    id: "eurostat-dii", title: "Glossary: Digital Intensity Index (DII)", organization: "Eurostat (Comisión Europea)",
    url: "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Digital_Intensity_Index_(DII)", language: "en", sourceType: "government_statistics",
    supports: [{ dimension: "digital_readiness", principle: "La intensidad digital de una empresa se mide con un indicador compuesto a partir del uso de tecnologías y prácticas digitales concretas." }],
    excerpt: "The digital intensity index (DII) is a composite indicator, derived from the EU survey on ICT usage and e-commerce in enterprises.",
    verifiedOn: "2026-10-01",
  },
];

// ── Las ocho áreas ──────────────────────────────────────────────────────────

const claim = (id: string, type: MethodologyClaimType, text: string, extra: Pick<MethodologyClaim, "sourceIds" | "verifiedIn"> = {}): MethodologyClaim => ({ id, type, text, ...extra });
const principle = (id: string, text: string, sourceIds: readonly string[]) => claim(`why:${id}`, "external_principle", text, { sourceIds });
/** Sin fuente externa verificada: criterio propio de Vecidya, presentado como tal. */
const criterion = (id: string, text: string) => claim(`why:${id}`, "product_interpretation", text);

/** Definiciones derivadas de los mappings de evidencia, los Semantic Facts y el lenguaje del resultado (orden canónico). */
export const DIMENSION_METHODOLOGY: Readonly<Record<DigitalDimensionId, DimensionMethodology>> = {
  clarity_positioning: {
    id: "clarity_positioning", label: DIMENSION_NARRATIVE.clarity_positioning.label,
    evaluates: "Si alguien que no te conoce entiende rápido qué ofreces, para quién es y cuál es el siguiente paso.",
    evidenceQuestionIds: ["q2_presence_offer_clarity", "q2_retail_product_visibility", "q2_b2b_qualification", "q2_startup_problem_clarity", "q2_startup_offer_readiness"],
    high: "Tu propuesta se entiende sin explicaciones adicionales y deja claro qué hacer después.",
    low: "Quien llega puede no entender qué ofreces o para quién, y se pierde antes de dar un paso.",
    notMeaning: "No evalúa la calidad de tu producto o servicio ni tu diseño gráfico: solo qué tan claro se entiende lo que ofreces.",
    whyItMatters: principle("clarity_positioning", "Google recomienda crear contenido pensado primero en las personas y dejar claro quién está detrás.", ["google-helpful-content"]),
  },
  digital_foundation: {
    id: "digital_foundation", label: DIMENSION_NARRATIVE.digital_foundation.label,
    evaluates: "Si tienes un lugar propio y actualizado en internet, con tus datos de contacto y horarios correctos.",
    evidenceQuestionIds: ["q2_presence_digital_base", "q2_local_presence_consistency", "q2_ecommerce_product_discovery"],
    high: "Tienes una base propia y actualizada sobre la que se apoyan las demás áreas.",
    low: "Tu presencia depende de perfiles que no controlas o tiene datos desactualizados que pueden confundir a quien te busca.",
    notMeaning: "No es una revisión técnica de tu sitio (velocidad, seguridad o posicionamiento): se basa en lo que respondes sobre él.",
    whyItMatters: principle("digital_foundation", "Google indica que las empresas con información completa y precisa tienen más probabilidades de aparecer en búsquedas locales, y que organizar un sitio de forma lógica ayuda a buscadores y personas a entenderlo.", ["google-local-ranking", "google-seo-starter"]),
  },
  discovery: {
    id: "discovery", label: DIMENSION_NARRATIVE.discovery.label,
    evaluates: "Por qué vías te descubre la gente nueva y si dependes demasiado de una sola.",
    evidenceQuestionIds: ["q2_local_discovery", "q2_professional_referral_dependency", "q2_ecommerce_acquisition_dependency", "q2_b2b_lead_source", "q2_creator_channel_concentration"],
    high: "Te encuentran por varias vías y sabes de dónde llegan las personas nuevas.",
    low: "Llegan pocas personas nuevas o casi todas por un solo canal; si ese canal falla, la llegada se frena.",
    notMeaning: "No mide tu posición en buscadores ni el alcance de tus publicaciones: se basa en lo que sabes y respondes sobre cómo te encuentran.",
    whyItMatters: principle("discovery", "Google explica que el posicionamiento local depende de la relevancia, la distancia y la prominencia, y que la gran mayoría de las páginas nuevas que encuentra llegan a través de enlaces.", ["google-local-ranking", "google-seo-starter"]),
  },
  trust_reputation: {
    id: "trust_reputation", label: DIMENSION_NARRATIVE.trust_reputation.label,
    evaluates: "Si quien te evalúa encuentra pruebas visibles de confianza: reseñas recientes, recomendaciones, casos o testimonios.",
    evidenceQuestionIds: ["q2_reputation_flow", "q2_professional_authority_signals"],
    high: "Llegan opiniones nuevas y hay pruebas visibles que ayudan a decidir.",
    low: "Hay pocas pruebas visibles o llegan con poca frecuencia, así que quien no te conoce tiene menos razones para confiar.",
    notMeaning: "No mide tu reputación real ni la calidad de tu trabajo, y no comprueba que las reseñas sean auténticas: solo si hay pruebas visibles y con qué frecuencia llegan.",
    whyItMatters: principle("trust_reputation", "Una investigación del Spiegel Research Center (Northwestern University) asocia mostrar reseñas con una mayor probabilidad de compra, y Google señala que las reseñas influyen en la prominencia local.", ["spiegel-reviews", "google-local-ranking"]),
  },
  conversion_access: {
    id: "conversion_access", label: DIMENSION_NARRATIVE.conversion_access.label,
    evaluates: "Si las personas interesadas pueden dar el paso sin trabas (escribir, reservar, comprar o donar) y si reciben respuesta a tiempo.",
    evidenceQuestionIds: ["q2_conversion_interest_to_action", "q2_service_response_speed", "q2_appointments_booking_method", "q2_ecommerce_checkout_friction", "q2_creator_conversion"],
    high: "La mayoría de quienes se interesan logra dar el paso y recibe respuesta pronto.",
    low: "Parte del interés se pierde antes de concretarse: respuestas lentas, pasos confusos o pagos que no se terminan.",
    notMeaning: "No es una tasa de conversión medida con datos: es una estimación a partir de lo que respondes.",
    whyItMatters: criterion("conversion_access", "El interés que no encuentra un paso claro ni una respuesta a tiempo puede perderse antes de concretarse; por eso el diagnóstico observa ese paso."),
  },
  relationship_recurrence: {
    id: "relationship_recurrence", label: DIMENSION_NARRATIVE.relationship_recurrence.label,
    evaluates: "Si das seguimiento a quien ya mostró interés o ya te compró, y si esas personas vuelven o te recomiendan.",
    evidenceQuestionIds: ["q2_followup_general_process", "q2_professional_followup_after_consult", "q2_appointments_confirmation_reminders", "q2_retail_customer_capture", "q2_ecommerce_repeat_purchase"],
    high: "Hay un seguimiento constante y las personas vuelven o te recomiendan.",
    low: "Se pierden oportunidades por falta de seguimiento, o quien ya te conoce no tiene un motivo o un canal para volver.",
    notMeaning: "No mide la satisfacción de tus clientes: mide si existe seguimiento y continuidad.",
    whyItMatters: criterion("relationship_recurrence", "Sin seguimiento, el interés y las relaciones que ya existen pueden perderse; por eso el diagnóstico observa si hay continuidad con quien ya te conoce."),
  },
  measurement_optimization: {
    id: "measurement_optimization", label: DIMENSION_NARRATIVE.measurement_optimization.label,
    evaluates: "Si sabes de dónde llegan las personas nuevas, cuántos contactos terminan en un resultado y si usas esa información para decidir.",
    evidenceQuestionIds: ["q2_measurement_source_confidence", "q2_measurement_outcome_tracking", "q2_measurement_decision_review", "q2_ecommerce_cart_visibility"],
    high: "Sabes qué funciona y comparas resultados para decidir.",
    low: "Decides sin saber bien qué canal o acción trae resultados, así que es difícil mejorar a propósito.",
    notMeaning: "No revisa tus herramientas de analítica ni la exactitud de tus datos: se basa en lo que sabes y respondes.",
    whyItMatters: principle("measurement_optimization", "Google Analytics recomienda medir las acciones especialmente importantes para el éxito del negocio, y Google Ads explica que medir conversiones permite descubrir qué campañas son más eficaces.", ["google-analytics-key-events", "google-ads-conversions"]),
  },
  digital_readiness: {
    id: "digital_readiness", label: DIMENSION_NARRATIVE.digital_readiness.label,
    evaluates: "Si el trabajo diario está organizado para sostener más actividad: información en un lugar compartido, responsabilidades claras, poca dependencia de una sola persona y tareas repetitivas que ya se hacen solas.",
    evidenceQuestionIds: ["q2_operations_information_base", "q2_operations_automation_adoption", "q2_operations_process_ownership", "q2_operations_dependency", "q2_b2b_status_visibility"],
    high: "Tu operación puede absorber más actividad sin depender de la memoria o de una sola persona.",
    low: "El trabajo depende de tareas manuales, información dispersa o una persona clave, y eso limita cuánto puedes crecer.",
    notMeaning: "No recomienda automatizar por automatizar ni evalúa qué herramientas usas: mide si tu base de trabajo sostiene lo que haces hoy.",
    whyItMatters: principle("digital_readiness", "La OCDE señala que las pequeñas y medianas empresas van por detrás en la adopción digital en todas las áreas tecnológicas, y Eurostat mide la intensidad digital de las empresas con un indicador compuesto de prácticas digitales concretas.", ["oecd-sme-digital", "eurostat-dii"]),
  },
};

// ── Secciones ───────────────────────────────────────────────────────────────

const { bands, minScoredDimensions, minCoverage, routeHardCap, maxPriorities } = METHODOLOGY_ENGINE_CONTRACT;
const coverageWords = minCoverage === 1 / 3 ? "un tercio" : `${Math.round(minCoverage * 100)} %`;
const quoted = (text: string) => `«${text}»`;

/** Cadena de una recomendación, con las mismas etiquetas que «¿Por qué te recomendamos esto?» del resultado. */
export const RECOMMENDATION_CHAIN = ["Lo que respondiste", "Lo que encontramos", "La prioridad", "La mejora recomendada", "El tipo de solución", "Cómo puede ayudar Vecidya, si corresponde"] as const;

export const METHODOLOGY_SECTIONS: readonly MethodologySection[] = [
  {
    id: "overview", title: "Qué es este diagnóstico",
    simple: "Es una evaluación estructurada de tu presencia digital en ocho áreas, a partir de tus respuestas. Sirve para decidir por dónde empezar; no es una auditoría ni una certificación.",
    detail: [
      claim("overview.deterministic", "internal_rule", "El resultado se calcula con reglas fijas del diagnóstico: las mismas respuestas dan siempre el mismo resultado.", { verifiedIn: "qbv2-session.ts#runDiagnosticPipelineV3" }),
      claim("overview.order_independent", "internal_rule", "El orden en que respondes no cambia el resultado. Volver atrás, editar o retomar más tarde lleva al mismo resultado si las respuestas finales son las mismas.", { verifiedIn: "qbv2-contextual-scoring.ts#deriveContextualEvidence" }),
      claim("overview.areas_choice", "product_interpretation", "Las ocho áreas cubren lo que hace falta para que alguien te encuentre, entienda lo que ofreces, confíe, dé el paso y vuelva, y la base de trabajo que lo sostiene. Es una selección de Vecidya, no un estándar externo; varias áreas se apoyan además en principios de fuentes públicas."),
    ],
  },
  {
    id: "dimensions", title: "Las ocho áreas",
    simple: "Siempre se muestran las ocho, en el mismo orden. Cada una se lee con las respuestas que la observan.",
    detail: [],
  },
  {
    id: "area_score", title: "Qué significa el porcentaje de un área",
    simple: "El porcentaje estima qué tan desarrollada se ve esa capacidad según tus respuestas. No es una calificación ni una probabilidad.",
    detail: [
      claim("score.reading", "internal_rule", "Cada respuesta se traduce en una lectura de la capacidad que observa, de ausente a sólida, y el porcentaje del área resume esas lecturas.", { verifiedIn: "qbv2-contextual-scoring.ts#ANSWER_SEMANTICS" }),
      claim("score.direct_first", "internal_rule", "Las respuestas que observan el área directamente cuentan más que las que la apoyan de forma indirecta: estas pueden matizar el porcentaje, pero nunca imponerse.", { verifiedIn: "qbv2-contextual-scoring.ts#SCORING_MODEL" }),
      claim("score.needs_direct", "internal_rule", "Sin al menos una respuesta que observe el área directamente, el área no recibe porcentaje.", { verifiedIn: "qbv2-contextual-scoring.ts#weightedScore" }),
      claim("score.context_neutral", "internal_rule", "Tu objetivo, tu principal freno y la etapa de tu negocio deciden qué se pregunta y qué va primero, pero nunca cambian un porcentaje.", { verifiedIn: "qbv2-contextual-scoring.ts#applicability" }),
      claim("score.multi_once", "internal_rule", "Marcar varias opciones en una pregunta cuenta como una sola respuesta, no como varias.", { verifiedIn: "qbv2-contextual-scoring.ts#ContextualEvidence.observationId" }),
    ],
  },
  {
    id: "overall_index", title: "Tu presencia digital en un número",
    simple: "El porcentaje de presencia digital resume, con el mismo peso, las áreas que aplican a tu situación y tienen lectura. Las áreas sin lectura no cuentan como cero.",
    detail: [
      claim("overall.equal_weight", "internal_rule", "Va de 0 a 100 y es el promedio, con el mismo peso, de las áreas aplicables con lectura.", { verifiedIn: "qbv2-overall.ts#computeDigitalPresenceIndex" }),
      claim("overall.excluded", "internal_rule", "Las áreas que no aplican o que no se pudieron evaluar quedan fuera del cálculo; nunca cuentan como cero.", { verifiedIn: "qbv2-overall.ts#computeDigitalPresenceIndex" }),
      claim("overall.minimum", "internal_rule", `Solo se calcula con al menos ${minScoredDimensions} áreas con lectura, y si estas son al menos ${coverageWords} de las que aplican. Si no, se muestra ${quoted(OVERALL_STATUS_LABELS.insufficient)}.`, { verifiedIn: "qbv2-overall.ts#OVERALL_INDEX_MODEL" }),
      claim("overall.prelaunch", "internal_rule", "Antes del lanzamiento no se calcula: la mayoría de las áreas todavía no se pueden observar y un porcentaje daría una precisión que no existe.", { verifiedIn: "qbv2-overall.ts#computeDigitalPresenceIndex" }),
      claim("overall.bands", "internal_rule", `El estado se decide con el promedio exacto, antes de redondear: hasta ${bands.developingFrom - 1}, ${quoted(OVERALL_STATUS_LABELS.low)}; desde ${bands.developingFrom} y hasta ${bands.solidFrom - 1}, ${quoted(OVERALL_STATUS_LABELS.developing)}; desde ${bands.solidFrom}, ${quoted(OVERALL_STATUS_LABELS.solid)}.`, { verifiedIn: "qbv2-overall.ts#bandFor" }),
      claim("overall.display", "internal_rule", "El número visible se redondea, salvo cuando el redondeo lo llevaría a otro estado: entonces se muestra el entero inferior, para que el número y el estado nunca se contradigan.", { verifiedIn: "qbv2-overall.ts#displayScoreFor" }),
      claim("overall.material_caveat", "internal_rule", "Si el promedio es alto pero un área muestra un freno importante, la prioridad se explica aparte sin cambiar la banda global.", { verifiedIn: "qbv2-overall.ts#classifyOverallState" }),
      claim("overall.confidence_caveat", "internal_rule", "Si el promedio es alto pero la confianza general es limitada, la confianza se muestra por separado como lectura preliminar sin cambiar la banda global.", { verifiedIn: "qbv2-overall.ts#classifyOverallState" }),
      claim("overall.number_kept", "internal_rule", "Los caveats no cambian el porcentaje ni el código MAL, REGULAR o BIEN: explican qué conviene confirmar o atender.", { verifiedIn: "qbv2-overall.ts#classifyOverallState" }),
      claim("overall.not_standard", "product_interpretation", "Es un resumen propio de Vecidya para orientar; no es una medida estandarizada ni comparable con la de otras herramientas."),
      claim("overall.not_eurostat", "limitation", `No es el Índice de Intensidad Digital de Eurostat. Esa fuente respalda el principio general de medir la adopción digital de una empresa por prácticas concretas, pero no valida la escala de 0 a 100, los límites de ${bands.developingFrom} y ${bands.solidFrom}, las ocho áreas ni las reglas de prioridad de Vecidya.`),
    ],
  },
  {
    id: "confidence", title: "Porcentaje y confianza no son lo mismo",
    simple: "El porcentaje dice lo que sugieren tus respuestas; la confianza dice cuánta evidencia respalda esa lectura. Un 100\u00a0% con confianza limitada no equivale a un 100\u00a0% con confianza alta.",
    detail: [
      claim("confidence.levels", "internal_rule", "La confianza tiene tres niveles: alta, media y limitada.", { verifiedIn: "qbv2-contextual-scoring.ts#confidenceFor" }),
      claim("confidence.more_direct", "internal_rule", "Sube con más respuestas que observan el área directamente; las respuestas indirectas ayudan, pero no pueden sustituirlas.", { verifiedIn: "qbv2-contextual-scoring.ts#CONFIDENCE_MODEL" }),
      claim("confidence.penalties", "internal_rule", "Baja cuando respondes «No sé» o cuando las respuestas sobre una misma área apuntan en direcciones opuestas.", { verifiedIn: "qbv2-contextual-scoring.ts#confidenceFor" }),
      claim("confidence.overall", "internal_rule", "La confianza general combina cuántas áreas aplicables tienen lectura y qué tan respaldada está cada una.", { verifiedIn: "qbv2-overall.ts#computeOverallConfidence" }),
      claim("confidence.preliminary", "internal_rule", "Un porcentaje con confianza limitada se presenta como lectura preliminar.", { verifiedIn: "qbv2-overall.ts#buildDigitalPresenceStatus" }),
      claim("confidence.not_statistical", "limitation", "No es un intervalo de confianza estadístico ni una probabilidad: describe cuánta evidencia hubo en tu recorrido."),
    ],
  },
  {
    id: "adaptive_route", title: "Por qué no recibiste todas las preguntas",
    simple: "Vecidya no hace las mismas preguntas a todos. Según tu tipo de negocio, tu etapa, tu objetivo, tu principal freno y tus respuestas, pregunta lo que importa para tu situación y omite lo que no aplica.",
    detail: [
      claim("route.context_first", "internal_rule", "Primero se entiende tu situación: qué haces, cómo llega lo que ofreces a quien lo recibe, en qué etapa estás, qué quieres lograr y qué te frena.", { verifiedIn: "qbv2-planner.ts#buildQuestionPlan" }),
      claim("route.deepens", "internal_rule", "Después se profundiza en las áreas más relevantes para ese contexto. Si una respuesta cambia el contexto, las preguntas que dejan de aplicar se descartan y no cuentan.", { verifiedIn: "qbv2-session.ts#submitAnswerV3" }),
      claim("route.expands", "internal_rule", "El recorrido se alarga solo cuando hace falta más información para interpretar un área importante, como la relacionada con tu objetivo o tu principal freno.", { verifiedIn: "qbv2-planner.ts#materialEvidenceNeeds" }),
      claim("route.length", "internal_rule", `Por eso la cantidad de preguntas varía. El recorrido nunca supera ${routeHardCap} preguntas.`, { verifiedIn: "qbv2-planner.ts#ROUTE_HARD_CAP" }),
      claim("route.prelaunch", "internal_rule", "Antes del lanzamiento no se pregunta por resultados que todavía no pueden existir.", { verifiedIn: "context-resolver.ts (ciclo de vida)" }),
      claim("route.not_asked", "internal_rule", "Un área sobre la que no se preguntó no se considera débil: queda sin lectura.", { verifiedIn: "qbv2-priorities.ts (sin lectura = falta de evidencia)" }),
    ],
  },
  {
    id: "evidence_roles", title: "Qué papel cumple cada respuesta",
    simple: "No todas las respuestas cumplen el mismo papel: algunas observan un área directamente, otras la matizan y otras solo describen tu situación.",
    detail: [
      claim("roles.direct", "internal_rule", "Evidencia directa: observa la capacidad que se evalúa; por ejemplo, con qué frecuencia llegan reseñas nuevas, para la confianza visible.", { verifiedIn: "qbv2-coverage.ts#EVIDENCE_DIRECTNESS" }),
      claim("roles.supporting", "internal_rule", "Contexto de apoyo: matiza la lectura de un área sin poder decidirla por sí solo.", { verifiedIn: "qbv2-contextual-scoring.ts#SCORING_MODEL" }),
      claim("roles.context", "internal_rule", "Contexto de tu negocio: tipo de negocio, etapa, objetivo y principal freno. Decide qué se pregunta y qué se prioriza, sin cambiar ningún porcentaje.", { verifiedIn: "qbv2-contextual-scoring.ts#CONTEXT_ONLY_QUESTION_IDS" }),
      claim("roles.uncertain", "internal_rule", "Incertidumbre: «No sé» no cuenta ni a favor ni en contra; baja la confianza y queda como algo por confirmar.", { verifiedIn: "qbv2-contextual-scoring.ts#CAPABILITY_CONTRIBUTION" }),
      claim("roles.not_applicable", "internal_rule", "No aplica: una respuesta que no aplica a tu caso no cuenta como debilidad.", { verifiedIn: "qbv2-contextual-scoring.ts#CAPABILITY_CONTRIBUTION" }),
    ],
  },
  {
    id: "missing_information", title: "La falta de información no es una debilidad",
    simple: "Lo que no sabes, lo que no aplica y lo que no se evaluó nunca se trata como algo que está mal.",
    detail: [
      claim("missing.null", "internal_rule", "Un área sin lectura no vale cero: queda fuera del promedio y se explica aparte.", { verifiedIn: "qbv2-overall.ts#computeDigitalPresenceIndex" }),
      claim("missing.unknown", "internal_rule", "«No sé» no es una mala respuesta: se señala como algo por confirmar.", { verifiedIn: "qbv2-semantic-facts.ts (respondent_uncertain)" }),
      claim("missing.not_applicable", "internal_rule", "Lo que no aplica a tu situación no es una debilidad.", { verifiedIn: "qbv2-contextual-scoring.ts#applicability" }),
      claim("missing.not_assessed", "internal_rule", "Lo que no se evaluó en tu recorrido tampoco: simplemente no hay lectura. Si es un área importante para ti, la prioridad es confirmarla antes de actuar.", { verifiedIn: "qbv2-priorities.ts (evidence_gap)" }),
    ],
  },
  {
    id: "priorities", title: "Cómo se decide qué va primero",
    simple: "El área con el porcentaje más bajo no es automáticamente la primera prioridad. El orden considera qué tan fuerte es cada freno, su relación con tu objetivo y tu principal freno, y si un área bloquea a otra.",
    detail: [
      claim("priorities.relevance", "internal_rule", "Primero van los frenos relacionados con lo que quieres lograr o con lo que señalaste como freno.", { verifiedIn: "qbv2-priorities.ts#GOAL_RELEVANCE" }),
      claim("priorities.prerequisites", "internal_rule", "Un área que es requisito de otra puede ir antes, como la claridad de la oferta antes de atraer a más personas, pero solo con evidencia suficiente.", { verifiedIn: "qbv2-priorities.ts#DIMENSION_DEPENDENCIES" }),
      claim("priorities.severity", "internal_rule", "Se distingue un freno importante de uno moderado, y lo confirmado de lo probable.", { verifiedIn: "qbv2-priorities.ts#SEVERITY_BANDS" }),
      claim("priorities.verify", "internal_rule", "Si un área importante para ti no tiene evidencia suficiente, la prioridad es confirmarla antes de actuar.", { verifiedIn: "qbv2-priorities.ts (evidence_gap)" }),
      claim("priorities.lowest_score", "internal_rule", "El porcentaje más bajo solo desempata cuando todo lo demás es igual.", { verifiedIn: "qbv2-priorities.ts#deriveConstraintsAndPriorities" }),
      claim("priorities.max", "internal_rule", `Se muestran como máximo ${maxPriorities} prioridades.`, { verifiedIn: "qbv2-priorities.ts#SLOTS" }),
    ],
  },
  {
    id: "recommendations", title: "Recomendaciones y opciones de Vecidya",
    simple: "Las recomendaciones del diagnóstico se calculan antes de comprobar si Vecidya ofrece un servicio relacionado. Lo que Vecidya ofrece nunca cambia tus prioridades.",
    detail: [
      claim("recommendations.chain", "internal_rule", `Cada recomendación sigue la misma cadena de ${RECOMMENDATION_CHAIN.length} pasos, en este orden: una opción de Vecidya solo puede aparecer en el último.`, { verifiedIn: "qbv2-offerings.ts#matchCommercialOfferings" }),
      claim("recommendations.separation", "internal_rule", "El catálogo de Vecidya se consulta al final de esa cadena; las prioridades y las recomendaciones no lo conocen.", { verifiedIn: "qbv2-priorities.ts, qbv2-recommendations.ts y qbv2-solutions.ts no importan qbv2-offerings.ts" }),
      claim("recommendations.not_every", "internal_rule", "No todo tiene una oferta de Vecidya. Cuando no la hay, se dice y se describe la solución para que avances con quien prefieras.", { verifiedIn: "qbv2-offerings.ts (not_in_catalog)" }),
      claim("recommendations.license_is_the_recommendation", "internal_rule", "La licencia es lo que el diagnóstico recomienda: se propone a partir de la capacidad detectada y no como una posibilidad a medias. Los servicios y los addons son opciones que se ofrecen cuando el análisis las respalda.", { verifiedIn: "qbv2-offerings.ts (recommended_license, optional_service, optional_addon)" }),
      claim("recommendations.supported_only", "internal_rule", "Una opción de Vecidya aparece solo si corresponde a una recomendación del diagnóstico. Si primero hay que confirmar algo, los servicios y addons se muestran como opción preliminar y condicionada; la licencia mantiene su condición de recomendación y solo se matiza la certeza.", { verifiedIn: "qbv2-offerings.ts (verify_first)" }),
      claim("recommendations.prelaunch", "internal_rule", "Antes del lanzamiento no se propone ninguna licencia ni addon; como mucho, servicios para preparar el lanzamiento.", { verifiedIn: "qbv2-offerings.ts (prelaunch_no_license)" }),
      claim("recommendations.single_license", "internal_rule", "Se propone como máximo una licencia por resultado, la de la prioridad más alta, sin subir de nivel para vender más.", { verifiedIn: "qbv2-offerings.ts (single_license)" }),
      claim("recommendations.addons", "internal_rule", "Los addons se presentan como opcionales y se indica cuándo requieren una licencia.", { verifiedIn: "qbv2-offerings.ts#offeringDependencies" }),
      claim("recommendations.useful_without", "product_interpretation", "El resultado sirve aunque no contrates nada."),
    ],
  },
  {
    id: "limitations", title: "Lo que el diagnóstico no puede afirmar",
    simple: "Es una orientación basada en tus respuestas. Tiene límites, y conviene conocerlos.",
    detail: [
      claim("limits.self_reported", "limitation", "Se basa en lo que respondes: no comprueba por su cuenta tus perfiles, tu sitio ni tus datos."),
      claim("limits.not_audit", "limitation", "No es una auditoría de todos tus activos digitales ni una revisión técnica."),
      claim("limits.depth", "limitation", "No todas las áreas se evalúan con la misma profundidad en cada recorrido; algunas pueden quedar con lectura preliminar o sin lectura."),
      claim("limits.inputs", "limitation", "Las recomendaciones dependen de la información que diste; si tu situación cambia, el resultado también puede cambiar."),
      claim("limits.external", "limitation", "No mide condiciones externas como tu competencia, tu mercado o la temporada."),
      claim("limits.outcomes", "limitation", "No asegura resultados de negocio: orienta por dónde conviene empezar."),
    ],
  },
  {
    id: "calculation_and_data", title: "Cómo se calcula y qué pasa con tus respuestas",
    simple: "El resultado se calcula mediante reglas deterministas del diagnóstico. Ninguna inteligencia artificial juzga tu negocio por su cuenta.",
    detail: [
      claim("data.no_ai", "internal_rule", "El cálculo no usa inteligencia artificial: aplica las mismas reglas a todas las respuestas.", { verifiedIn: "app/features/diagnostic/qbv2-*.ts sin llamadas de red ni a modelos" }),
      claim("data.private_preview", "internal_rule", "En esta versión de prueba, tus respuestas se guardan solo en este navegador: no se envían a un servidor ni se registran en analítica.", { verifiedIn: "qbv2-session.ts#DiagnosticSessionStoreV3" }),
    ],
  },
  {
    id: "sources", title: "Fuentes",
    simple: "Las fuentes respaldan por qué importan varias de las áreas. Donde no hay una fuente verificada, la página lo indica como criterio de Vecidya. Ninguna fuente valida la fórmula, que es propia.",
    detail: [],
  },
  {
    id: "versioning", title: "Cambios en la metodología",
    simple: `Esta es la versión ${METHODOLOGY_VERSION} de la metodología. Un cambio en la forma de calcular abre una versión mayor (de 1.0 a 2.0); un cambio en lo que mide un área, en las recomendaciones o en las fuentes, una versión menor (de 1.0 a 1.1).`,
    detail: [],
  },
];

/**
 * Privacidad: lo anterior describe la vista privada actual (solo `localStorage`, sin backend ni analítica nueva).
 * El texto de privacidad para producción depende de la arquitectura del corte público y queda pendiente.
 */
export const METHODOLOGY_PRIVACY = { scope: "private_preview", productionCopy: null, pending: "Arquitectura del corte público (persistencia y analítica) por decidir." } as const;

// ── Gobierno de versiones ───────────────────────────────────────────────────

export type MethodologyChangeRule = { readonly change: string; readonly increment: "major" | "minor" | "none" };

/** Qué cambios exigen una nueva versión de la metodología. Las correcciones de copy o visuales sin cambio de significado no. */
export const METHODOLOGY_CHANGE_RULES: readonly MethodologyChangeRule[] = [
  { change: "Fórmula del porcentaje de un área o lectura de las respuestas", increment: "major" },
  { change: "Fórmula del porcentaje general, mínimos de evidencia o límites de los estados", increment: "major" },
  { change: "Modelo de confianza o reglas de orden de las prioridades", increment: "major" },
  { change: "Áreas evaluadas (añadir, quitar o fusionar)", increment: "major" },
  { change: "Definición de lo que evalúa un área o de qué preguntas la observan", increment: "minor" },
  { change: "Reglas de recomendación, de tipo de solución o de opciones de Vecidya", increment: "minor" },
  { change: "Fuentes añadidas, retiradas o reasignadas", increment: "minor" },
  { change: "Corrección de redacción, ortografía o presentación sin cambio de significado", increment: "none" },
];

// ── Resumen para el resultado ───────────────────────────────────────────────

/** «Cómo se evaluó» del resultado: cuatro explicaciones breves (nivel A) y el enlace a la metodología completa. */
export const RESULT_METHOD_NOTES = [
  "Cada porcentaje estima qué tan desarrollada se ve un área según tus respuestas; no es una calificación.",
  "La confianza indica cuánta evidencia respalda cada porcentaje: un porcentaje alto con confianza limitada es una lectura preliminar.",
  "No todos reciben las mismas preguntas: el recorrido se adapta a tu situación, y un área sin lectura no cuenta como débil.",
  "Las prioridades no siguen el porcentaje más bajo: consideran qué tan fuerte es cada freno, tu objetivo, tu principal freno y qué áreas dependen de otras.",
] as const;

export const METHODOLOGY_LINK_LABEL = "Ver metodología y fuentes";
