import { selectedValues } from "./answers";
import type { IssueId, QuestionId } from "./contracts";
import { getProfile, hasTeam, isEstablished, isOperating } from "./profiles";
import { inquiriesArrive, multiAnswer, optionLabel, singleAnswer, type MultiQuestionId } from "./questions";
import { dimensionLabels } from "./scoring";
import type {
  Answers,
  Confidence,
  Context,
  DiagnosticState,
  DimensionId,
  DimensionScore,
  GoalId,
  Issue,
  IssueKind,
  NextAction,
  ProfileId,
  Strength,
} from "./types";

/**
 * Clasificación de estado, hallazgos, prioridades, fortalezas y notas de objetivo.
 * Todo es explicable: cada hallazgo cita la respuesta que lo origina y un
 * hallazgo derivado de «no lo sé» usa lenguaje de comprobación, no de ausencia.
 */

export type Scores = Record<DimensionId, number | null>;

export function toScores(dimensions: DimensionScore[]): Scores {
  return Object.fromEntries(dimensions.map((dimension) => [dimension.id, dimension.score])) as Scores;
}

const below = (score: number | null, threshold: number) => score !== null && score < threshold;

const said = (questionId: QuestionId, answers: Answers) =>
  selectedValues(answers[questionId])
    .map((value) => `«${optionLabel(questionId, value)}»`)
    .join(", ");

/** Accessors tipados del registro: una pregunta u opción inexistente, o una pregunta del tipo equivocado, no compila. */
const one = singleAnswer;
const many = multiAnswer;

export { inquiriesArrive };

export function processSolid(answers: Answers): boolean {
  return one(answers, "capture") === "always" && one(answers, "follow_up") === "system";
}

export type ContradictionId = "idea_with_prior_sale" | "established_without_sources" | "clear_presence_unclear_offer";

export type ContradictionFact = {
  id: ContradictionId;
  message: string;
  inputs: { questionId: QuestionId; value: string }[];
};

type ContradictionRule = {
  id: ContradictionId;
  applies: (context: Context) => boolean;
  message: string;
  inputs: (context: Context) => { questionId: QuestionId; value: string }[];
};

/**
 * Las tres contradicciones actuales, formalizadas con ID estable (DIAG-V3-05 §15). Detección, peso
 * (bajan la confianza a lo sumo a "media", nunca la excluyen), efecto sobre confianza y copy quedan
 * exactamente iguales que antes de esta fase: `explainContradictions` es la única evaluación real;
 * `detectContradictions` es un envoltorio (mismo patrón que `evaluateRule`/`explainApplicability`).
 */
const CONTRADICTION_RULES: ContradictionRule[] = [
  {
    id: "idea_with_prior_sale",
    applies: (context) => context.stage === "idea" && one(context.answers, "validation") === "first",
    message:
      "Indicaste que solo tienes la idea, pero también que ya hubo una primera venta, inscripción o participante: si ya atiendes a alguien, el momento «preparando el lanzamiento» u «ocasional» describe mejor tu situación.",
    inputs: (context) => [
      { questionId: "stage", value: String(context.stage) },
      { questionId: "validation", value: String(one(context.answers, "validation")) },
    ],
  },
  {
    id: "established_without_sources",
    applies: (context) => isEstablished(context.stage) && many(context.answers, "sources").includes("none"),
    message:
      "Indicaste actividad regular, pero también que todavía no llegan consultas: si tus clientes llegan de forma directa o presencial, marca «local físico, ferias o contacto directo» para evaluar el seguimiento.",
    inputs: (context) => [
      { questionId: "stage", value: String(context.stage) },
      { questionId: "sources", value: many(context.answers, "sources").join(",") },
    ],
  },
  {
    id: "clear_presence_unclear_offer",
    applies: (context) => one(context.answers, "clarity_presence") === "yes" && one(context.answers, "offer_clarity") === "no",
    message: "Indicaste que tu presencia se entiende con claridad, pero que todavía no puedes resumir qué ofreces: conviene revisar cuál de las dos respuestas describe mejor tu caso.",
    inputs: (context) => [
      { questionId: "clarity_presence", value: String(one(context.answers, "clarity_presence")) },
      { questionId: "offer_clarity", value: String(one(context.answers, "offer_clarity")) },
    ],
  },
];

export function explainContradictions(context: Context): ContradictionFact[] {
  return CONTRADICTION_RULES.filter((rule) => rule.applies(context)).map((rule) => ({ id: rule.id, message: rule.message, inputs: rule.inputs(context) }));
}

/** Contradicciones entre respuestas: no se calculan en silencio; bajan la confianza y se explican. */
export function detectContradictions(context: Context): string[] {
  return explainContradictions(context).map((fact) => fact.message);
}

export type StateRuleId =
  | "not_operating"
  | "clarity_weak"
  | "inquiries_core_uncertain"
  | "inquiries_severe_leak"
  | "no_inquiries_base"
  | "presence_weak_base"
  | "growth_gap"
  | "consolidated";

export type StateRuleObservation = { id: StateRuleId; matched: boolean };

/**
 * Caracterización de `DIAG-V3-BUG-01` (estado: CHARACTERIZED / NOT FIXED, ver DIAG-V3-05 §9). La
 * rama `clarity_weak` evalúa `clarityWeak && (!inquiries || below(contacto,50) || below(seguimiento,50) || true)`.
 * El `|| true` final hace que el paréntesis completo sea siempre verdadero: en la práctica la rama
 * solo depende de `clarityWeak`, y `!inquiries`/`below(contacto,50)`/`below(seguimiento,50)` quedan
 * escritos pero son inalcanzables como condición de corte. `changedOutcome` es el contrafactual sin
 * el `|| true`: verdadero cuando, sin el bug, esta rama NO habría emparejado (porque hay consultas y
 * ni contacto ni seguimiento están débiles) — es decir, los casos donde el bug cambia el estado
 * resultante. No se corrige aquí: no se modifica el operador, los thresholds ni la interpretación.
 */
export type Bug01Trace = {
  clarityWeak: boolean;
  conditionWithoutBug: boolean;
  matchedWithBug: boolean;
  changedOutcome: boolean;
};

export type StateClassificationTrace = {
  observations: StateRuleObservation[];
  winningRule: StateRuleId;
  state: DiagnosticState;
  bug01: Bug01Trace;
};

/**
 * Única evaluación real de estado (DIAG-V3-05 §8). `classifyState` es un envoltorio de `.state`
 * (mismo patrón que `evaluateRule`/`evaluateRuleTrace` y `scoreDimensions`/`explainDimensionScore`):
 * no existe un segundo clasificador que reinterprete el resultado para explicarlo. La secuencia de
 * comprobaciones, el orden de evaluación de `low(...)` (que acumula texto en `because` como efecto
 * colateral, tal como hacía el código antes de esta fase) y cada mensaje quedan idénticos; lo único
 * añadido es el registro de qué regla se evaluó y cuál ganó.
 */
export function explainStateClassification(context: Context, scores: Scores, dimensions: DimensionScore[]): StateClassificationTrace {
  const { stage, answers } = context;
  const because: string[] = [];
  const observations: StateRuleObservation[] = [];
  const dimension = (id: DimensionId) => dimensions.find((item) => item.id === id);
  const inquiries = inquiriesArrive(answers);
  const low = (id: DimensionId, threshold: number) => {
    const score = scores[id];
    if (below(score, threshold)) {
      because.push(`${dimensionLabels[id]} está en el nivel «${levelText(score as number)}».`);
      return true;
    }
    return false;
  };
  const cite = (questionId: QuestionId, prefix: string) => {
    if (answers[questionId] !== undefined) because.push(`${prefix} ${said(questionId, answers)}.`);
  };
  const observe = (id: StateRuleId, matched: boolean) => {
    observations.push({ id, matched });
    return matched;
  };
  const neutralBug01: Bug01Trace = { clarityWeak: false, conditionWithoutBug: false, matchedWithBug: false, changedOutcome: false };

  if (observe("not_operating", !isOperating(stage))) {
    cite("stage", "Indicaste que");
    return {
      observations,
      winningRule: "not_operating",
      state: {
        id: "inicio",
        label: "Punto de partida",
        summary: "Todavía no hay una operación que ordenar. Lo útil ahora es definir qué ofreces y comprobarlo con personas reales antes de construir piezas digitales.",
        because,
      },
      bug01: neutralBug01,
    };
  }

  const clarityWeak = low("claridad", 35);
  const conditionWithoutBug = !inquiries || below(scores.contacto, 50) || below(scores.seguimiento, 50);
  const bug01: Bug01Trace = { clarityWeak, conditionWithoutBug, matchedWithBug: clarityWeak, changedOutcome: clarityWeak && !conditionWithoutBug };
  if (observe("clarity_weak", clarityWeak && (conditionWithoutBug || true))) {
    cite("offer_clarity", "Sobre tu propuesta respondiste");
    cite("clarity_presence", "Sobre si una persona nueva te entiende respondiste");
    return {
      observations,
      winningRule: "clarity_weak",
      state: {
        id: "base",
        label: "Base en construcción",
        summary: "Ya hay actividad, pero cuesta entender qué ofreces y a quién. Aclarar la propuesta va antes que sumar canales o herramientas: sin eso, cada consulta cuesta más.",
        because,
      },
      bug01,
    };
  }

  if (inquiries) {
    const contacto = dimension("contacto");
    const seguimiento = dimension("seguimiento");
    const coreUncertain = !seguimiento || seguimiento.score === null || seguimiento.unknown >= 2 || !contacto || contacto.score === null;
    if (observe("inquiries_core_uncertain", coreUncertain)) {
      because.push("Las respuestas «no lo sé» sobre registro, respuesta o seguimiento impiden confirmar qué pasa con las consultas después de llegar.");
      return {
        observations,
        winningRule: "inquiries_core_uncertain",
        state: {
          id: "incierto",
          label: "Operación activa con datos por confirmar",
          summary: "Llegan consultas, pero no sabemos qué pasa con ellas después. Antes de concluir si se pierden, conviene comprobar cómo se registran y quién les da seguimiento.",
          because,
        },
        bug01,
      };
    }
    // Una fuga grave concreta cuenta aunque el resto de la dimensión sea fuerte: el promedio no la puede enmascarar.
    const severeLeak =
      one(answers, "capture") === "no" || one(answers, "follow_up") === "none" || one(answers, "response") === "varies" || one(answers, "contact_path") === "none";
    const leak = [low("contacto", 50), low("seguimiento", 50)].some(Boolean) || severeLeak;
    if (observe("inquiries_severe_leak", leak)) {
      cite("capture", "Sobre el registro de consultas respondiste");
      cite("follow_up", "Sobre el seguimiento respondiste");
      cite("response", "Sobre la primera respuesta respondiste");
      return {
        observations,
        winningRule: "inquiries_severe_leak",
        state: {
          id: "fugas",
          label: "Operación activa con fugas",
          summary: "Llegan consultas, pero parte de ellas se pierde entre el primer contacto y el seguimiento. Ordenar ese tramo suele rendir más que sumar canales.",
          because,
        },
        bug01,
      };
    }
  } else {
    observe("inquiries_core_uncertain", false);
    observe("inquiries_severe_leak", false);
  }

  const presenceWeak = low("presencia", 35);
  if (presenceWeak || !inquiries) {
    if (observe("no_inquiries_base", !inquiries)) {
      cite("sources", "Sobre el origen de tus consultas respondiste");
      return {
        observations,
        winningRule: "no_inquiries_base",
        state: {
          id: "base",
          label: "Base en construcción",
          summary: "Tu presencia existe, pero todavía no genera consultas. El trabajo está en que las personas correctas te encuentren y entiendan cómo avanzar contigo; el seguimiento se evaluará cuando lleguen.",
          because,
        },
        bug01,
      };
    }
    observe("presence_weak_base", true);
    cite("assets", "Como activos funcionando marcaste");
    const solidProcess = processSolid(answers);
    return {
      observations,
      winningRule: "presence_weak_base",
      state: {
        id: "base",
        label: "Base en construcción",
        summary: solidProcess
          ? "Tu operación ya funciona: registras y das seguimiento. Lo que falta es una base pública que te permita crecer más allá del boca a boca."
          : "Ya hay actividad, pero la base pública (qué haces, dónde encontrarte y cómo contactarte) todavía no sostiene el resto.",
        because,
      },
      bug01,
    };
  }
  observe("no_inquiries_base", false);
  observe("presence_weak_base", false);

  const repetitive = one(answers, "repetitive") === "a_lot";
  const teamGap = one(answers, "responsibilities") === "no" || one(answers, "responsibilities") === "partly";
  const growthGap = [low("medicion", 50), low("alcance", 50), low("confianza", 50)].some(Boolean);
  if (repetitive) because.push(`Indicaste que el trabajo repetitivo es ${said("repetitive", answers).toLowerCase()}.`);
  if (teamGap) because.push(`Sobre responsabilidades respondiste ${said("responsibilities", answers).toLowerCase()}.`);
  if (observe("growth_gap", growthGap || repetitive || teamGap)) {
    because.push("Registro y seguimiento funcionan: las consultas no se pierden por proceso.");
    return {
      observations,
      winningRule: "growth_gap",
      state: {
        id: "sistema",
        label: "Sistema en marcha",
        summary: "Lo esencial funciona: registras y das seguimiento. Las siguientes mejoras están en medir mejor, ampliar alcance, reforzar la confianza o quitar trabajo repetitivo.",
        because,
      },
      bug01,
    };
  }

  because.push("Contacto, seguimiento, alcance, confianza y medición están en nivel sólido o consolidado.");
  observe("consolidated", true);
  return {
    observations,
    winningRule: "consolidated",
    state: {
      id: "consolidado",
      label: "Sistema consolidado",
      summary: "Presencia, contacto, seguimiento y medición funcionan de forma consistente. El siguiente paso es afinar, no reconstruir.",
      because,
    },
    bug01,
  };
}

export function classifyState(context: Context, scores: Scores, dimensions: DimensionScore[]): DiagnosticState {
  return explainStateClassification(context, scores, dimensions).state;
}

function levelText(score: number): string {
  if (score < 35) return "punto de partida";
  if (score < 65) return "en construcción";
  if (score < 85) return "funciona";
  return "consolidado";
}

export type IssueDraft = Omit<Issue, "priority">;

const kindWeight: Record<IssueKind, number> = {
  foundational: 1.25,
  leakage: 1.2,
  trust: 1,
  discoverability: 1,
  bottleneck: 0.95,
  maturity: 0.75,
};

export const goalBoost: Record<GoalId, IssueId[]> = {
  be_found: ["improve_discoverability", "check_discoverability", "diversify_sources", "build_presence"],
  explain: ["define_offer"],
  trust: ["show_proof", "ask_reviews", "post_sale_loop"],
  opportunities: ["improve_discoverability", "define_contact_path", "diversify_sources"],
  stop_losing: ["capture_inquiries", "speed_up_response", "structure_follow_up", "define_contact_path"],
  organize: ["capture_inquiries", "track_pipeline", "structure_follow_up", "assign_responsibilities"],
  automate: ["automate_repetitive", "structure_follow_up"],
  measure: ["start_measuring", "track_pipeline"],
  unsure: [],
};

export function generateIssues(context: Context, scores: Scores): IssueDraft[] {
  const { answers, profile, stage } = context;
  const issues: IssueDraft[] = [];
  const push = (issue: IssueDraft) => issues.push(issue);
  const profileDefinition = profile ? getProfile(profile) : undefined;
  const localProfile = profileDefinition?.localSearch ?? false;
  const isOrg = profile === "project" || profile === "organization";

  // Claridad
  const offer = one(answers, "offer_clarity");
  const clarity = one(answers, "clarity_presence");
  if (offer === "no" || offer === "partly" || clarity === "no" || clarity === "partly" || clarity === "unknown") {
    const tentative = clarity === "unknown" && offer !== "no" && offer !== "partly";
    const severity = offer === "no" || clarity === "no" ? 1 : tentative ? 0.5 : 0.6;
    push({
      id: "define_offer",
      kind: "foundational",
      dimension: "claridad",
      severity,
      tentative,
      title: tentative ? "Comprobar si una persona nueva entiende tu propuesta" : "Aclarar la propuesta: qué ofreces, a quién y cómo avanzar contigo",
      why: tentative
        ? `Sobre si una persona nueva entiende tu presencia respondiste ${said("clarity_presence", answers)}.`
        : `Indicaste ${[offer && said("offer_clarity", answers), clarity && said("clarity_presence", answers)].filter(Boolean).join(" y ")} al preguntar por la claridad de tu propuesta.`,
      action: tentative
        ? "Pide a dos personas ajenas que lean tu presencia y te digan en una frase qué ofreces; corrige lo que no entiendan."
        : "Escribe en tres frases qué haces, para quién y cuál es el siguiente paso, y úsalas igual en todos tus canales.",
      learn: "presence",
      service: "presencia-digital",
    });
  }

  // Validación (idea / lanzamiento)
  const validation = one(answers, "validation");
  if ((stage === "idea" || stage === "launching") && (validation === "none" || validation === "talked")) {
    push({
      id: "validate_offer",
      kind: "foundational",
      dimension: "alcance",
      severity: validation === "none" ? 0.9 : 0.6,
      tentative: false,
      title: "Comprobar con personas reales antes de construir más",
      why: `Sobre lo que ya comprobaste respondiste ${said("validation", answers)}.`,
      action: "Habla con cinco personas que podrían ser tus clientes o usuarios y anota qué preguntan y qué les frena.",
      service: "estructuracion",
    });
  }

  // Señales de alcance (se calculan antes porque la presencia escasa y «no apareces» comparten acción).
  const discoverability = one(answers, "discoverability");
  const audience = one(answers, "audience");
  const reach = one(answers, "reach");
  const sources = many(answers, "sources");
  const noInquiries = sources.includes("none");
  const discoverabilityGap =
    discoverability === "no" ? 0.9 : discoverability === "some" ? 0.5 : audience === "none" ? 0.8 : audience === "small" ? 0.5 : reach === "nobody" ? 0.8 : reach === "circle" ? 0.5 : noInquiries ? 0.8 : 0;

  // Presencia
  const assets = many(answers, "assets");
  if (assets.includes("none")) {
    push({
      id: "build_presence",
      kind: "foundational",
      dimension: "presencia",
      severity: isOperating(stage) ? 1 : 0.7,
      tentative: false,
      title: "Crear una base pública mínima",
      why: "Indicaste que todavía no tienes nada funcionando en línea.",
      action: "Empieza por una sola pieza que puedas mantener: un perfil de Google o una página breve con qué haces, dónde y cómo contactarte.",
      learn: "presence",
      service: "presencia-digital",
    });
  } else if (isOperating(stage) && below(scores.presencia, 35) && !(localProfile && discoverabilityGap >= 0.5)) {
    // Si además «no apareces cuando te buscan», esa prioridad ya pide el mismo activo (Perfil de Google): no se duplica.
    push({
      id: "build_presence",
      kind: "foundational",
      dimension: "presencia",
      severity: 0.75,
      tentative: false,
      title: "Ampliar una presencia que hoy se apoya en muy poco",
      why: `Como activos funcionando solo marcaste ${said("assets", answers)}.`,
      action: "Suma un activo propio donde puedan encontrarte y entenderte: un perfil de Google completo o una página breve.",
      learn: "presence",
      service: "presencia-digital",
    });
  }
  if (assets.includes("unknown")) {
    push({
      id: "inventory_assets",
      kind: "foundational",
      dimension: "presencia",
      severity: 0.6,
      tentative: true,
      title: "Inventariar qué existe y quién lo administra",
      why: "Indicaste que no estás seguro de qué existe o quién lo administra.",
      action: "Haz una lista de dominio, sitio, perfiles y cuentas, y anota quién tiene acceso a cada uno.",
      service: "estructuracion",
    });
  }

  const control = one(answers, "control");
  if (control === "no" || control === "partly" || control === "unknown") {
    const tentative = control === "unknown";
    push({
      id: "secure_ownership",
      kind: "foundational",
      dimension: "presencia",
      severity: control === "no" ? 0.9 : control === "partly" ? 0.6 : 0.5,
      tentative,
      title: tentative ? "Comprobar a nombre de quién están tu dominio y tu sitio" : "Asegurar el control de tu dominio y tu sitio",
      why: `Sobre el control de tus activos respondiste ${said("control", answers)}.`,
      action: tentative
        ? "Consulta con quien los administra a nombre de quién están el dominio y el sitio, y guarda las credenciales en un lugar seguro."
        : "Pide que el dominio y los accesos queden a tu nombre y guarda las credenciales en un lugar seguro.",
      service: "estructuracion",
    });
  }

  // Confianza
  const proofQuestions = ["proof_professional", "proof_business", "proof_creator", "proof_org"] as const satisfies readonly MultiQuestionId[];
  const proofId = proofQuestions.find((id) => answers[id] !== undefined);
  const proof = proofId ? many(answers, proofId) : [];
  const proofCopy: Record<ProfileId, { title: string; action: string; check: string }> = {
    professional: {
      title: "Mostrar evidencia real de tu experiencia",
      action: "Publica un caso o un portafolio breve y pide dos recomendaciones a clientes recientes.",
      check: "Busca tu nombre como lo haría un cliente y anota qué evidencia de tu experiencia aparece.",
    },
    business: {
      title: "Mostrar señales de confianza verificables",
      action: "Pide reseñas a clientes recientes y publica fotos reales y datos completos.",
      check: "Busca tu negocio como lo haría un cliente y anota qué reseñas, fotos y datos aparecen.",
    },
    creator: {
      title: "Hacer visible lo que respalda tu credibilidad",
      action: "Publica una página o perfil con resultados, colaboraciones y cómo trabajar contigo.",
      check: "Revisa tus perfiles como lo haría una marca y anota qué resultados o colaboraciones puede ver.",
    },
    project: {
      title: "Explicar quién está detrás y qué se ha hecho",
      action: "Publica quiénes están detrás, qué hacen y evidencia reciente de actividad.",
      check: "Revisa el canal principal del proyecto y anota si se ve quién está detrás y qué se ha hecho.",
    },
    organization: {
      title: "Explicar quién está detrás y qué se ha hecho",
      action: "Publica quiénes están detrás, qué hacen y evidencia reciente de actividad.",
      check: "Revisa el canal principal de la organización y anota si se ve quién está detrás y qué se ha hecho.",
    },
  };
  const copy = proofCopy[profile ?? "business"];
  if (proofId && (proof.includes("none") || proof.includes("unknown"))) {
    const tentative = proof.includes("unknown");
    push({
      id: "show_proof",
      kind: "trust",
      dimension: "confianza",
      severity: tentative ? 0.45 : 0.8,
      tentative,
      title: tentative ? "Comprobar qué señales de confianza ves publicadas" : copy.title,
      why: `Sobre las señales de confianza respondiste ${said(proofId, answers)}.`,
      action: tentative ? copy.check : copy.action,
      service: "presencia-digital",
    });
  } else if (proofId && below(scores.confianza, 35)) {
    push({
      id: "show_proof",
      kind: "trust",
      dimension: "confianza",
      severity: 0.6,
      tentative: false,
      title: copy.title,
      why: `Solo marcaste ${said(proofId, answers)} como respaldo visible.`,
      action: copy.action,
      service: "presencia-digital",
    });
  } else if ((proofId === "proof_business" || proofId === "proof_professional") && proof.length > 0 && !proof.includes("reviews") && isOperating(stage)) {
    push({
      id: "ask_reviews",
      kind: "trust",
      dimension: "confianza",
      severity: 0.5,
      tentative: false,
      title: profile === "professional" ? "Pedir recomendaciones públicas a clientes recientes" : "Pedir reseñas a clientes recientes",
      why: `Marcaste ${said(proofId, answers)} como señales de confianza, pero no reseñas ni recomendaciones públicas: en búsquedas locales y decisiones de contratación son la señal más consultada.`,
      action: "Pide una reseña o recomendación a tus últimos cinco clientes y responde a cada una públicamente.",
      learn: "presence",
      service: "presencia-digital",
    });
  }

  // Alcance
  if (discoverabilityGap > 0) {
    const whyParts = [
      discoverability && discoverability !== "unknown" && discoverability !== "na" ? `sobre búsquedas en Google respondiste ${said("discoverability", answers)}` : "",
      audience ? `describiste tu audiencia como ${said("audience", answers)}` : "",
      reach ? `sobre quién conoce el proyecto respondiste ${said("reach", answers)}` : "",
      noInquiries ? "indicaste que todavía no llegan consultas" : "",
    ].filter(Boolean);
    const lacksGoogle = localProfile && assets.length > 0 && !assets.includes("google") && !assets.includes("unknown");
    push({
      id: "improve_discoverability",
      kind: "discoverability",
      dimension: "alcance",
      severity: discoverabilityGap,
      tentative: false,
      title: profile === "creator" ? "Hacer crecer una audiencia que responda" : profile === "project" ? "Llegar a las primeras personas fuera de tu círculo" : "Aparecer cuando te buscan en tu zona",
      why: `${whyParts.join("; ")}.`.replace(/^./, (character) => character.toUpperCase()),
      action:
        profile === "creator"
          ? "Publica con un ritmo sostenible y con una llamada clara a la acción en cada pieza."
          : profile === "project"
            ? "Define un canal oficial y comparte avances con las primeras personas interesadas."
            : lacksGoogle
              ? "Crea tu Perfil de Google con categoría, zona, horarios y fotos, y pide reseñas a clientes recientes."
              : "Completa tu Perfil de Google (categoría, zona, horarios, fotos) y pide reseñas a clientes recientes.",
      learn: "presence",
      service: localProfile && !below(scores.presencia, 35) ? "visibilidad" : "presencia-digital",
    });
  }
  if (discoverability === "unknown") {
    push({
      id: "check_discoverability",
      kind: "discoverability",
      dimension: "alcance",
      severity: 0.45,
      tentative: true,
      title: "Comprobar si apareces cuando te buscan",
      why: "Indicaste que nunca has comprobado si apareces en Google.",
      action: "Busca en Google lo que ofreces más tu zona y anota si apareces y qué aparece antes que tú.",
      learn: "presence",
    });
  }
  const borrowedOnly = sources.length > 0 && sources.every((source) => source === "referrals" || source === "offline");
  if (borrowedOnly && isOperating(stage)) {
    push({
      id: "diversify_sources",
      kind: "discoverability",
      dimension: "alcance",
      severity: 0.45,
      tentative: false,
      title: "Depender menos del boca a boca",
      why: `Tus consultas llegan solo por ${said("sources", answers)}.`,
      action: "Suma un canal donde te encuentren sin recomendación previa: Google, un directorio o un perfil claro.",
      learn: "presence",
      service: "visibilidad",
    });
  }

  // Contacto y seguimiento
  const contactPath = one(answers, "contact_path");
  const capture = one(answers, "capture");
  const dispersed = contactPath === "many" && capture !== undefined && capture !== "always";
  if (contactPath === "none" || contactPath === "unclear" || dispersed) {
    push({
      id: "define_contact_path",
      kind: "leakage",
      dimension: "contacto",
      severity: contactPath === "none" ? 1 : contactPath === "unclear" ? 0.7 : 0.4,
      tentative: false,
      title: dispersed ? "Unificar canales dispersos en un lugar de registro" : "Definir una vía de contacto clara y atendida",
      why: dispersed
        ? `Sobre cómo te contactan respondiste ${said("contact_path", answers)} y sobre el registro ${said("capture", answers)}: varios canales sin un lugar común dispersan las consultas.`
        : `Sobre cómo te contactan respondiste ${said("contact_path", answers)}.`,
      action: dispersed
        ? "Mantén los canales que ya atiendes, pero lleva cada consulta al mismo lugar de registro el mismo día."
        : "Elige un canal principal, ponlo visible en todos lados y asegúrate de que alguien lo atiende.",
      service: dispersed ? "estructuracion" : "presencia-digital",
    });
  }

  if (capture === "no" || capture === "sometimes" || capture === "unknown") {
    const tentative = capture === "unknown";
    push({
      id: "capture_inquiries",
      kind: "leakage",
      dimension: "contacto",
      severity: capture === "no" ? 1 : capture === "sometimes" ? 0.65 : 0.5,
      tentative,
      title: tentative ? "Confirmar si cada consulta queda registrada" : "Registrar cada consulta en un mismo lugar",
      why: `Sobre el registro de consultas respondiste ${said("capture", answers)}.`,
      action: tentative
        ? "Pregunta a quien atiende dónde queda cada consulta; si no hay un lugar único, define uno."
        : "Anota cada consulta (quién, qué, por dónde llegó y siguiente paso) en un solo lugar, aunque sea una lista sencilla.",
      learn: "crm",
      service: "estructuracion",
    });
  }

  const response = one(answers, "response");
  if (response === "varies" || response === "days" || response === "unknown") {
    const tentative = response === "unknown";
    push({
      id: "speed_up_response",
      kind: "leakage",
      dimension: "seguimiento",
      severity: response === "varies" ? 0.85 : response === "days" ? 0.6 : 0.4,
      tentative,
      title: tentative ? "Medir cuánto tarda la primera respuesta" : "Responder antes: una consulta pierde valor en horas",
      why: `Sobre el tiempo de primera respuesta respondiste ${said("response", answers)}.`,
      action: tentative
        ? "Revisa las últimas diez consultas y anota cuánto tardó cada primera respuesta."
        : "Define quién responde, un tiempo máximo (el mismo día) y una respuesta inicial lista para enviar.",
      learn: "crm",
      service: "estructuracion",
    });
  }

  const followUp = one(answers, "follow_up");
  if (followUp === "none" || followUp === "manual" || followUp === "unknown") {
    const tentative = followUp === "unknown";
    push({
      id: "structure_follow_up",
      kind: "leakage",
      dimension: "seguimiento",
      severity: followUp === "none" ? 1 : followUp === "manual" ? 0.65 : 0.5,
      tentative,
      title: tentative ? "Averiguar qué pasa cuando no deciden a la primera" : "Definir el seguimiento cuando no deciden a la primera",
      why: `Sobre qué pasa después de la primera conversación respondiste ${said("follow_up", answers)}.`,
      action: tentative
        ? "Pregunta a quien atiende qué hace cuando alguien no decide; si depende de la memoria, acuerda un siguiente paso fijo."
        : "Acuerda un siguiente paso al cerrar cada conversación y programa un recordatorio para cumplirlo.",
      after: ["capture_inquiries"],
      learn: "crm",
      service: "estructuracion",
    });
  }

  const pipeline = one(answers, "pipeline");
  if (pipeline === "no" || pipeline === "partial") {
    push({
      id: "track_pipeline",
      kind: "bottleneck",
      dimension: "seguimiento",
      severity: pipeline === "no" ? 0.7 : 0.45,
      tentative: false,
      title: "Ver el estado de cada oportunidad abierta",
      why: `Sobre el estado de tus oportunidades respondiste ${said("pipeline", answers)}.`,
      action: "Lleva una lista con el estado de cada oportunidad (consultó, cotizó, agendó, cerró, se perdió) y revísala cada semana.",
      after: ["capture_inquiries"],
      learn: "crm",
      service: "estructuracion",
    });
  }

  const responsibilities = one(answers, "responsibilities");
  if (hasTeam(context.team) && (responsibilities === "no" || responsibilities === "partly" || responsibilities === "unknown")) {
    const tentative = responsibilities === "unknown";
    push({
      id: "assign_responsibilities",
      kind: "bottleneck",
      dimension: "seguimiento",
      severity: responsibilities === "no" ? 0.8 : responsibilities === "partly" ? 0.5 : 0.4,
      tentative,
      title: tentative ? "Confirmar quién responde y quién da seguimiento" : "Acordar quién responde y quién da seguimiento",
      why: `Sobre las responsabilidades del equipo respondiste ${said("responsibilities", answers)}.`,
      action: tentative
        ? "Pregunta al equipo quién atiende cada canal y quién cierra cada consulta; si nadie lo tiene claro, asígnalo."
        : "Asigna un responsable por canal y por consulta abierta, y deja claro quién cierra cada caso.",
      service: "formalizacion",
    });
  }

  const repetitive = one(answers, "repetitive");
  if (repetitive === "a_lot" || repetitive === "some") {
    push({
      id: "automate_repetitive",
      kind: "maturity",
      dimension: "seguimiento",
      severity: repetitive === "a_lot" ? 0.7 : 0.35,
      tentative: false,
      title: "Automatizar lo repetitivo del seguimiento",
      why: `Indicaste que el trabajo repetitivo semanal es ${said("repetitive", answers).toLowerCase()}.`,
      action: "Empieza por una sola tarea que se repite cada semana (confirmaciones o recordatorios) y automatízala.",
      after: ["capture_inquiries", "structure_follow_up"],
      learn: "automation",
      service: "automatizacion",
    });
  }

  const postSale = one(answers, "post_sale");
  if (postSale === "no" || postSale === "sometimes") {
    push({
      id: "post_sale_loop",
      kind: "trust",
      dimension: "confianza",
      severity: postSale === "no" ? 0.5 : 0.3,
      tentative: false,
      title: isOrg ? "Cerrar el ciclo después de cada actividad" : "Cerrar el ciclo después de la venta",
      why: `Sobre lo que pasa después ${isOrg ? "de una actividad" : "de una venta"} respondiste ${said("post_sale", answers)}.`,
      action: isOrg
        ? "Después de cada actividad, pide una opinión pública o envía un mensaje de seguimiento a los pocos días."
        : "Después de cada servicio, pide una reseña o envía un mensaje de seguimiento a los pocos días.",
      service: "estructuracion",
    });
  }

  // Medición
  const measurement = many(answers, "measurement");
  const dontKnowSources = sources.includes("dontknow");
  if (measurement.includes("none") || dontKnowSources || (measurement.length > 0 && measurement.length < 2)) {
    push({
      id: "start_measuring",
      kind: "maturity",
      dimension: "medicion",
      severity: dontKnowSources ? 0.7 : measurement.includes("none") ? 0.6 : 0.35,
      tentative: false,
      title: "Empezar a medir lo básico",
      why: dontKnowSources ? "Indicaste que no sabes por dónde llegan tus consultas." : `Sobre qué sabes con datos respondiste ${said("measurement", answers)}.`,
      action: "Cuenta cada semana cuántas consultas llegan, de dónde y cuántas se convierten; con eso ya puedes decidir.",
      learn: "crm",
      service: "estructuracion",
    });
  }

  return issues;
}

export const GOAL_BOOST_FACTOR = 1.3;
export const TENTATIVE_FACTOR = 0.7;
export const BLOCKED_FACTOR = 0.5;
export const BLOCKER_SEVERITY_THRESHOLD = 0.5;

/**
 * Traza de un hallazgo por la tubería de prioridad (DIAG-V3-05 §16/§17): severidad base → peso por
 * tipo → impulso de objetivo (×1.3, exclusivo de esta etapa, nunca movido a scoring) → penalización
 * por ser tentativo (×0.7) → bloqueo por dependencia sin resolver (×0.5) → prioridad final. Cada
 * factor queda visible por separado para que la prioridad resultante se pueda explicar sin
 * recalcularla con una fórmula distinta.
 */
export type PriorityTrace = {
  id: IssueId;
  baseSeverity: number;
  kindWeight: number;
  basePriority: number;
  goalBoosted: boolean;
  afterGoalBoost: number;
  tentativeApplied: boolean;
  afterTentative: number;
  blockers: IssueId[];
  blocked: boolean;
  finalPriority: number;
  issue: Issue;
};

/**
 * Única evaluación real de prioridad. `prioritize` es un envoltorio (`.map(t => t.issue)`, mismo
 * patrón que el resto del motor): no hay una segunda fórmula de prioridad para explicarla.
 */
export function explainPrioritization(drafts: IssueDraft[], context: Context): PriorityTrace[] {
  const boosted = new Set(context.goal ? goalBoost[context.goal] : []);
  const byId = new Map(drafts.map((draft) => [draft.id, draft]));

  const traces = drafts.map((draft): PriorityTrace => {
    const weight = kindWeight[draft.kind];
    const basePriority = draft.severity * weight;
    const goalBoosted = boosted.has(draft.id);
    const afterGoalBoost = goalBoosted ? basePriority * GOAL_BOOST_FACTOR : basePriority;
    const tentativeApplied = draft.tentative;
    const afterTentative = tentativeApplied ? afterGoalBoost * TENTATIVE_FACTOR : afterGoalBoost;
    const blockers = (draft.after ?? []).filter((id) => (byId.get(id)?.severity ?? 0) >= BLOCKER_SEVERITY_THRESHOLD);
    const blocked = blockers.length > 0;
    const finalPriority = Math.round((blocked ? afterTentative * BLOCKED_FACTOR : afterTentative) * 1000) / 1000;
    const why = blocked ? `${draft.why} Antes conviene resolver: ${blockers.map((id) => byId.get(id)?.title.toLowerCase()).join("; ")}.` : draft.why;
    const issue: Issue = { ...draft, why, priority: finalPriority };
    return { id: draft.id, baseSeverity: draft.severity, kindWeight: weight, basePriority, goalBoosted, afterGoalBoost, tentativeApplied, afterTentative, blockers, blocked, finalPriority, issue };
  });

  return traces.sort((a, b) => b.finalPriority - a.finalPriority || b.kindWeight - a.kindWeight || a.id.localeCompare(b.id));
}

export function prioritize(drafts: IssueDraft[], context: Context): Issue[] {
  return explainPrioritization(drafts, context).map((trace) => trace.issue);
}

export const PRIORITY_LIMIT = 3;
export const GAP_LIMIT = 6;

export function splitPriorities(issues: Issue[]): { priorities: Issue[]; gaps: Issue[] } {
  const priorities = issues.slice(0, PRIORITY_LIMIT);
  const gaps = issues.slice(PRIORITY_LIMIT).filter((issue) => issue.severity >= 0.4).slice(0, GAP_LIMIT);
  return { priorities, gaps };
}

/** Evidencia mínima (suma de pesos) y ausencia de dudas para llamar fortaleza a una dimensión. */
export const STRENGTH_MIN_EVIDENCE = 2;

/**
 * Fortalezas. Una fortaleza de dimensión exige evidencia suficiente, sin dudas y sin
 * un hallazgo grave confirmado en esa misma dimensión (una fuga concreta no convive con
 * «hay un proceso definido»). Las fortalezas de respuesta citan un hecho puntual y sí
 * pueden convivir con una brecha distinta de la misma dimensión.
 */
export function collectStrengths(context: Context, dimensions: DimensionScore[], issues: Issue[] = []): Strength[] {
  const { answers } = context;
  const strengths: Strength[] = [];
  const find = (dimension: DimensionId) => dimensions.find((item) => item.id === dimension);
  const severeIssue = (dimension: DimensionId) => issues.some((issue) => issue.dimension === dimension && !issue.tentative && issue.severity >= 0.8);
  const strong = (dimension: DimensionId) => {
    const item = find(dimension);
    return Boolean(item && item.score !== null && item.score >= 65 && item.evidence >= STRENGTH_MIN_EVIDENCE && item.unknown === 0 && !severeIssue(dimension));
  };
  const add = (dimension: DimensionId, kind: Strength["kind"], text: string) => strengths.push({ dimension, kind, text });

  if (strong("claridad")) add("claridad", "dimension", "Una persona nueva entiende qué ofreces y cómo avanzar contigo.");
  if (strong("presencia")) add("presencia", "dimension", answers.control === "yes" ? "Tienes activos digitales propios funcionando y bajo tu control." : "Tienes activos digitales propios funcionando.");
  if (strong("alcance")) add("alcance", "dimension", context.stage === "idea" || context.stage === "launching" ? "Ya comprobaste con personas reales que hay interés." : "Las personas correctas ya te encuentran por más de un canal.");
  if (strong("confianza")) add("confianza", "dimension", "Hay señales públicas que respaldan tu experiencia o tu negocio.");
  if (strong("contacto")) add("contacto", "dimension", "Las consultas llegan por una vía clara y quedan registradas.");
  if (strong("seguimiento")) add("seguimiento", "dimension", "El seguimiento no depende de la memoria: hay un proceso definido.");
  if (strong("medicion")) add("medicion", "dimension", "Tomas decisiones con datos sobre origen, volumen o conversión.");

  if (answers.response === "hour" && !strong("seguimiento")) add("seguimiento", "answer", "Respondes en menos de una hora: eso protege cada consulta nueva.");
  if (answers.post_sale === "regular" && !strong("confianza")) add("confianza", "answer", "Cierras el ciclo pidiendo reseñas o volviendo a contactar.");
  if (answers.validation === "first" && !strong("alcance")) add("alcance", "answer", "Ya hubo una primera venta, inscripción o participante: hay una señal real de interés.");
  if (answers.capture === "always" && !strong("contacto")) add("contacto", "answer", "Cada consulta queda registrada en un mismo lugar.");

  if (!strengths.length) add("claridad", "answer", "Ya diste el primer paso: ubicar tu situación antes de construir más.");
  return strengths.slice(0, 4);
}

/** Siguientes pasos en orden: primero las prioridades, después lo que depende de ellas. */
export function buildNextActions(priorities: Issue[], gaps: Issue[], context: Context, confidence: Confidence): NextAction[] {
  const actions: NextAction[] = priorities.map((issue, index) => ({ step: index + 1, text: issue.action, learn: issue.learn, service: issue.service }));
  const deferred = gaps.filter((issue) => (issue.after ?? []).some((id) => priorities.some((priority) => priority.id === id)));
  for (const issue of deferred.slice(0, 2)) {
    actions.push({ step: actions.length + 1, text: `Después: ${issue.title.toLowerCase()}. ${issue.action}`, learn: issue.learn, service: issue.service });
  }
  if (!actions.length) {
    actions.push({ step: 1, text: "Mantén lo que funciona y repite este diagnóstico cuando cambie tu momento o tu equipo." });
  }
  if (confidence.level === "baja" && actions.length < 5) {
    actions.push({ step: actions.length + 1, text: "Resuelve las dudas que dejaste abiertas y repite el diagnóstico: el resultado será más preciso." });
  }
  return actions;
}

/** Nota sobre el objetivo cuando la evidencia no permite ir directo a él. */
export function explainGoal(context: Context, issues: Issue[], scores: Scores): string | undefined {
  const { goal, answers } = context;
  const has = (id: IssueId) => issues.some((issue) => issue.id === id && !issue.tentative);
  const solid = processSolid(answers);
  if (goal === "automate" && !solid && inquiriesArrive(answers)) {
    return "Quieres automatizar o delegar, pero hoy la captura o el seguimiento no son consistentes. Automatizar sobre un proceso irregular multiplica el desorden: primero registrar cada consulta y definir el seguimiento; después, automatizar lo que se repita.";
  }
  if (goal === "measure" && (has("capture_inquiries") || answers.capture === "no")) {
    return "Quieres medir qué funciona, pero las consultas no quedan registradas en un mismo lugar. Sin registro no hay datos: el primer paso de la medición es anotar cada consulta y su origen.";
  }
  if ((goal === "be_found" || goal === "opportunities") && below(scores.claridad, 35)) {
    return "Quieres que te encuentren más, pero hoy cuesta entender qué ofreces. Traer más personas a una propuesta poco clara desperdicia cada visita: aclarar el mensaje va antes que ampliar el alcance.";
  }
  if (goal === "trust" && has("build_presence")) {
    return "Quieres generar más confianza, pero todavía no hay un lugar público donde mostrarla. Primero una base mínima; sobre ella, las reseñas y la prueba de tu trabajo.";
  }
  return undefined;
}

export function isEstablishedContext(context: Context): boolean {
  return isEstablished(context.stage);
}
