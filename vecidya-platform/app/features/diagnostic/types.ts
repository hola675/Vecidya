/**
 * Tipos de dominio del motor de Diagnóstico Vecidya.
 *
 * El motor es puro (sin React, sin red, sin persistencia): recibe respuestas
 * y devuelve un resultado explicable. La UI vive en `app/routes/diagnostic.tsx`.
 */

export type ProfileId = "business" | "professional" | "creator" | "project" | "organization";

export type StageId = "idea" | "launching" | "occasional" | "regular" | "growing";

export type TeamId = "only_me" | "small" | "medium" | "large" | "xl";

export type GoalId =
  | "be_found"
  | "explain"
  | "trust"
  | "opportunities"
  | "stop_losing"
  | "organize"
  | "automate"
  | "measure"
  | "unsure";

export type DimensionId = "claridad" | "presencia" | "alcance" | "confianza" | "contacto" | "seguimiento" | "medicion";

export type SectionId = "contexto" | "presencia" | "alcance" | "proceso" | "medicion";

/**
 * Clase de una opción de respuesta.
 * - `value`: respuesta sustantiva (aporta evidencia).
 * - `none`: ausencia sustantiva («nada de esto»): evidencia 0 en las dimensiones de la pregunta.
 * - `unknown`: incertidumbre («no lo sé»): no puntúa, reduce confianza.
 * - `not_applicable`: no aplica: no puntúa ni afecta la confianza.
 */
export type OptionKind = "value" | "none" | "unknown" | "not_applicable";

export type Evidence = Partial<Record<DimensionId, number>>;

export type QuestionOption = {
  value: string;
  label: string;
  kind?: OptionKind;
  /** Evidencia por dimensión en [0, 1]. Solo para `kind: "value"`. */
  evidence?: Evidence;
  /** Dimensiones sobre las que esta opción declara incertidumbre aunque sea sustantiva. */
  uncertainFor?: DimensionId[];
  /** En preguntas multi, una opción exclusiva desmarca a las demás. */
  exclusive?: boolean;
};

export type QuestionType = "single" | "multi";

export type AnswerValue = string | string[];

export type Answers = Record<string, AnswerValue>;

export type Context = {
  profile?: ProfileId;
  goal?: GoalId;
  stage?: StageId;
  team?: TeamId;
  answers: Answers;
};

export type Question = {
  id: string;
  section: SectionId;
  type: QuestionType;
  eyebrow: string;
  prompt: string;
  helper?: string;
  /** Por qué existe la pregunta (documentación interna, no se muestra). */
  purpose: string;
  /** Dimensiones que puede alimentar. Vacío si solo alimenta prioridades/recomendaciones. */
  dimensions: DimensionId[];
  /** Peso por dimensión (por defecto 1). */
  weight?: Partial<Record<DimensionId, number>>;
  /** Preguntas multi: suma de evidencia considerada «suficiente» por dimensión (por defecto, la suma máxima). */
  target?: Partial<Record<DimensionId, number>>;
  /** Dimensiones que una opción `none` pone en 0 (por defecto, todas las de la pregunta). */
  noneDimensions?: DimensionId[];
  options: QuestionOption[];
  /** Condición de aplicabilidad; ausente = aplica siempre que haya perfil. */
  applies?: (context: Context) => boolean;
  /** Redacción alternativa por perfil (misma pregunta, mismas opciones y evidencia). */
  variants?: Partial<Record<ProfileId, { prompt?: string; helper?: string }>>;
};

export type DimensionLevel = "inicial" | "parcial" | "solida" | "consolidada";

export type DimensionScore = {
  id: DimensionId;
  label: string;
  /** 0–100 o `null` cuando no hay evidencia aplicable. */
  score: number | null;
  level: DimensionLevel | null;
  /** Suma de pesos de las preguntas que aportaron evidencia. */
  evidence: number;
  /** Número de respuestas «no lo sé» que afectan a la dimensión. */
  unknown: number;
};

export type ConfidenceLevel = "alta" | "media" | "baja";

export type Confidence = {
  level: ConfidenceLevel;
  answered: number;
  applicable: number;
  unknown: number;
  reasons: string[];
};

export type StateId = "inicio" | "base" | "incierto" | "fugas" | "sistema" | "consolidado";

export type DiagnosticState = {
  id: StateId;
  label: string;
  summary: string;
  /** Explicación de cómo se llegó al estado, en lenguaje humano. */
  because: string[];
};

export type IssueKind = "foundational" | "leakage" | "trust" | "discoverability" | "bottleneck" | "maturity";

export type Issue = {
  id: string;
  kind: IssueKind;
  dimension: DimensionId;
  /** 0–1: gravedad intrínseca del hallazgo. */
  severity: number;
  /** Puntuación final tras relevancia, dependencias y confianza. */
  priority: number;
  /** true cuando el hallazgo deriva de una respuesta «no lo sé». */
  tentative: boolean;
  title: string;
  why: string;
  action: string;
  /** Ids de hallazgos que conviene resolver antes. */
  after?: string[];
  learn?: string;
  service?: string;
};

/** `dimension`: derivada del nivel de la dimensión; `answer`: derivada de una respuesta concreta. */
export type Strength = { dimension: DimensionId; kind: "dimension" | "answer"; text: string };

export type NextAction = { step: number; text: string; learn?: string; service?: string };

export type LicenseLevel = "none" | "cuadra" | "barrio" | "ciudad";

export type LicenseFit = {
  level: LicenseLevel;
  name: string;
  reason: string;
  /** Qué no conviene todavía y por qué (dependencias no cumplidas). */
  notYet?: string;
};

export type ServiceFit = { id: string; title: string; reason: string };

export type AddonFit = { id: string; name: string; reason: string };

export type LearnFit = { slug: string; title: string; reason: string };

export type Recommendation = {
  license: LicenseFit;
  services: ServiceFit[];
  addons: AddonFit[];
  learn: LearnFit[];
};

export type DiagnosticResult = {
  profile: ProfileId;
  context: { stage?: StageId; team?: TeamId; goal?: GoalId };
  state: DiagnosticState;
  confidence: Confidence;
  dimensions: DimensionScore[];
  strengths: Strength[];
  gaps: Issue[];
  priorities: Issue[];
  nextActions: NextAction[];
  recommendation: Recommendation;
  /** Nota cuando el objetivo declarado no puede abordarse directamente con la evidencia actual. */
  goalNote?: string;
};
