import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/diagnostic";

type AnswerValue = string | string[];
type Answers = Record<string, AnswerValue>;
type QuestionType = "single" | "multi" | "scale" | "yes_no_unknown";
type ProfileType = "business" | "professional" | "creator" | "project" | "organization" | "public_figure" | "idea";
type Dimension = "identidad" | "presencia" | "visibilidad" | "confianza" | "conexion" | "comunidad" | "evolucion" | "organizacion";

type Question = {
  id: string;
  stage: string;
  eyebrow: string;
  prompt: string;
  helper: string;
  type: QuestionType;
  options: { value: string; label: string; exclusive?: boolean }[];
  applies?: (answers: Answers) => boolean;
};

const diagnosticDeliverables = [
  "Tu posición digital actual",
  "Fortalezas que ya puedes aprovechar",
  "Oportunidades de mejora",
  "Hasta 3 próximos pasos priorizados",
];

const profileTypes: Record<ProfileType, string> = {
  business: "Un negocio o empresa",
  professional: "Mi perfil profesional",
  creator: "Mi marca o trabajo como creador",
  project: "Un proyecto o iniciativa",
  organization: "Una organización o comunidad",
  public_figure: "Una candidatura o figura pública",
  idea: "Todavía estoy construyendo mi idea",
};

const profileIcons: Partial<Record<ProfileType, string>> = {
  business: publicAssets.icons.diagnosticBusiness,
  professional: publicAssets.icons.diagnosticProfessional,
  project: publicAssets.icons.diagnosticProject,
  creator: publicAssets.icons.diagnosticCreator,
};

const questions: Question[] = [
  {
    id: "profile",
    stage: "Identidad",
    eyebrow: "PRIMERA PUERTA",
    prompt: "¿Qué quieres hacer visible?",
    helper: "Esto adapta el diagnóstico a tu realidad, no a un formulario genérico.",
    type: "single",
    options: Object.entries(profileTypes).map(([value, label]) => ({ value, label })),
  },
  {
    id: "goal",
    stage: "Identidad",
    eyebrow: "OBJETIVO",
    prompt: "¿Qué te gustaría mejorar principalmente?",
    helper: "Elige lo que más pesa ahora. Después podrás revisar tus respuestas.",
    type: "single",
    options: [
      { value: "visibility", label: "Que más personas me encuentren" },
      { value: "trust", label: "Generar más confianza" },
      { value: "contacts", label: "Recibir más contactos u oportunidades" },
      { value: "clarity", label: "Explicar mejor lo que hago" },
      { value: "community", label: "Construir comunidad" },
      { value: "unknown", label: "Entender qué necesito realmente" },
    ],
  },
  {
    id: "assets",
    stage: "Presencia",
    eyebrow: "PRESENCIA ACTUAL",
    prompt: "¿Dónde existe hoy tu presencia digital?",
    helper: "Marca los lugares reales. Si eliges ninguna o no sé, limpiaremos las demás opciones.",
    type: "multi",
    options: [
      { value: "website", label: "Sitio web" },
      { value: "social", label: "Redes sociales" },
      { value: "google", label: "Google o mapas" },
      { value: "directory", label: "Directorios o perfiles públicos" },
      { value: "whatsapp", label: "Solo WhatsApp o mensajería" },
      { value: "none", label: "No tengo presencia todavía", exclusive: true },
      { value: "unknown", label: "No estoy seguro", exclusive: true },
    ],
  },
  {
    id: "clarity",
    stage: "Confianza",
    eyebrow: "CLARIDAD",
    prompt: "¿Una persona nueva entiende rápido qué haces y cómo contactarte?",
    helper: "No se trata de juzgar tu presencia, sino de detectar fricción.",
    type: "yes_no_unknown",
    options: [
      { value: "yes", label: "Sí" },
      { value: "no", label: "No" },
      { value: "unknown", label: "No estoy seguro" },
    ],
  },
  {
    id: "obstacle",
    stage: "Evolución",
    eyebrow: "OBSTÁCULO",
    prompt: "¿Cuál es el principal obstáculo que sientes hoy?",
    helper: "Esta respuesta ayuda a priorizar el resultado final.",
    type: "single",
    options: [
      { value: "not_found", label: "No me encuentran" },
      { value: "unclear", label: "No explico bien lo que hago" },
      { value: "few_contacts", label: "No llegan contactos suficientes" },
      { value: "messy_contacts", label: "Llegan contactos desordenados" },
      { value: "no_time", label: "No tengo tiempo para ordenarlo" },
      { value: "where_start", label: "No sé por dónde empezar" },
    ],
  },
  {
    id: "contact_channels",
    stage: "Conexión",
    eyebrow: "CONTACTO",
    prompt: "¿Qué canales usan las personas para contactarte hoy?",
    helper: "Una presencia útil necesita una acción siguiente clara.",
    type: "multi",
    applies: (answers) => answers.profile !== "idea",
    options: [
      { value: "phone", label: "Teléfono o llamadas" },
      { value: "whatsapp", label: "WhatsApp o mensajería" },
      { value: "email", label: "Correo electrónico" },
      { value: "social", label: "Redes sociales" },
      { value: "external_form", label: "Formulario o agenda externa" },
      { value: "none", label: "Ninguno claro", exclusive: true },
    ],
  },
  {
    id: "business_location",
    stage: "Visibilidad",
    eyebrow: "NEGOCIO",
    prompt: "¿Tu negocio tiene una ubicación o zona de atención clara?",
    helper: "Para lo local, la ubicación suele cambiar la prioridad.",
    type: "yes_no_unknown",
    applies: (answers) => answers.profile === "business",
    options: [
      { value: "yes", label: "Sí" },
      { value: "no", label: "No" },
      { value: "unknown", label: "No estoy seguro" },
    ],
  },
  {
    id: "professional_proof",
    stage: "Confianza",
    eyebrow: "AUTORIDAD",
    prompt: "¿Dónde muestras tu trabajo o experiencia?",
    helper: "No inventamos autoridad: buscamos señales reales que ya existan.",
    type: "multi",
    applies: (answers) => answers.profile === "professional",
    options: [
      { value: "portfolio", label: "Portafolio o casos" },
      { value: "linkedin", label: "LinkedIn o perfil profesional" },
      { value: "credentials", label: "Credenciales o experiencia pública" },
      { value: "recommendations", label: "Recomendaciones reales" },
      { value: "none", label: "No lo muestro", exclusive: true },
      { value: "unknown", label: "No estoy seguro", exclusive: true },
    ],
  },
  {
    id: "creator_consistency",
    stage: "Comunidad",
    eyebrow: "CREADOR",
    prompt: "¿Publicas con alguna consistencia?",
    helper: "La constancia ayuda, pero no reemplaza claridad ni camino de contacto.",
    type: "scale",
    applies: (answers) => answers.profile === "creator",
    options: [
      { value: "never", label: "Nunca" },
      { value: "sometimes", label: "A veces" },
      { value: "often", label: "Frecuentemente" },
      { value: "constant", label: "De forma constante" },
    ],
  },
  {
    id: "project_stage",
    stage: "Evolución",
    eyebrow: "PROYECTO",
    prompt: "¿En qué etapa está tu proyecto?",
    helper: "Un proyecto temprano necesita claridad antes que piezas digitales complejas.",
    type: "single",
    applies: (answers) => answers.profile === "project",
    options: [
      { value: "idea", label: "Solo tengo la idea" },
      { value: "validating", label: "Estoy validando si interesa" },
      { value: "shown", label: "Ya lo mostré a algunas personas" },
      { value: "community", label: "Ya tengo primera comunidad o usuarios" },
      { value: "growing", label: "Ya funciona y quiero hacerlo crecer" },
    ],
  },
  {
    id: "community_channel",
    stage: "Comunidad",
    eyebrow: "COMUNIDAD",
    prompt: "¿Dónde se informa o reúne hoy la comunidad?",
    helper: "Buscamos el canal oficial y la forma de participar.",
    type: "multi",
    applies: (answers) => answers.profile === "organization",
    options: [
      { value: "website", label: "Web o página central" },
      { value: "social", label: "Redes sociales" },
      { value: "chat", label: "Grupo de mensajería" },
      { value: "events", label: "Eventos o encuentros" },
      { value: "email", label: "Correo" },
      { value: "none", label: "No hay canal claro", exclusive: true },
    ],
  },
  {
    id: "public_transparency",
    stage: "Confianza",
    eyebrow: "TRANSPARENCIA",
    prompt: "¿Tu información pública es clara y verificable?",
    helper: "En perfiles públicos sensibles, Vecidya solo orienta presencia y transparencia.",
    type: "yes_no_unknown",
    applies: (answers) => answers.profile === "public_figure",
    options: [
      { value: "yes", label: "Sí" },
      { value: "no", label: "No" },
      { value: "unknown", label: "No estoy seguro" },
    ],
  },
  {
    id: "idea_next_step",
    stage: "Evolución",
    eyebrow: "IDEA",
    prompt: "¿Qué sería un avance pequeño esta semana?",
    helper: "Si todavía estás construyendo, el resultado debe ayudarte a ordenar, no a correr.",
    type: "single",
    applies: (answers) => answers.profile === "idea",
    options: [
      { value: "proposal", label: "Escribir una propuesta breve" },
      { value: "profile", label: "Crear un perfil básico" },
      { value: "channels", label: "Ordenar canales" },
      { value: "feedback", label: "Pedir opinión" },
      { value: "talk", label: "Hablar con Vecidya" },
    ],
  },
  {
    id: "urgency",
    stage: "Resultado",
    eyebrow: "URGENCIA",
    prompt: "¿Qué tan urgente es mejorar esto?",
    helper: "La urgencia ajusta el tono del siguiente paso, no crea una promesa automática.",
    type: "scale",
    options: [
      { value: "exploring", label: "Estoy explorando" },
      { value: "this_month", label: "Este mes" },
      { value: "soon", label: "Lo necesito pronto" },
      { value: "critical", label: "Es crítico" },
    ],
  },
];

const stageOrder = ["Identidad", "Presencia", "Confianza", "Conexión", "Comunidad", "Evolución", "Resultado"];
const dimensions: Dimension[] = ["identidad", "presencia", "visibilidad", "confianza", "conexion", "comunidad", "evolucion", "organizacion"];
const dimensionLabels: Record<Dimension, string> = {
  identidad: "Identidad",
  presencia: "Presencia",
  visibilidad: "Visibilidad",
  confianza: "Confianza",
  conexion: "Conexión",
  comunidad: "Comunidad",
  evolucion: "Evolución",
  organizacion: "Organización",
};

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Diagnóstico Vecidya",
    "Autodiagnóstico anónimo para entender tu presencia digital, visibilidad, confianza y próximos pasos sin guardar respuestas.",
    "/diagnostico",
  );
}

function includesAnswer(answer: AnswerValue | undefined, value: string) {
  return Array.isArray(answer) ? answer.includes(value) : answer === value;
}

function getApplicableQuestions(answers: Answers) {
  return questions.filter((question) => !question.applies || question.applies(answers));
}

function scoreAnswers(answers: Answers, applicableQuestions: Question[]) {
  const scores: Record<Dimension, number> = Object.fromEntries(dimensions.map((dimension) => [dimension, 46])) as Record<Dimension, number>;
  let confidenceHits = 0;
  let confidenceTotal = 0;
  const strengths = new Set<string>();
  const opportunities = new Set<string>();
  const priorities = new Set<string>();
  const primaryPriorities = new Set<string>();

  const add = (dimension: Dimension, amount: number) => {
    scores[dimension] = Math.max(18, Math.min(92, scores[dimension] + amount));
  };
  const prioritize = (item: string, primary = false) => {
    priorities.add(item);
    if (primary) primaryPriorities.add(item);
  };

  for (const question of applicableQuestions) {
    const answer = answers[question.id];
    if (!answer) continue;

    confidenceTotal += 1;
    if (!includesAnswer(answer, "unknown")) confidenceHits += 1;
  }

  const profile = answers.profile as ProfileType | undefined;
  const assets = answers.assets;
  const contactChannels = answers.contact_channels;
  const hasUsefulMultiAnswer = (answer: AnswerValue | undefined): answer is string[] => Array.isArray(answer) && answer.length > 0 && !answer.includes("none") && !answer.includes("unknown");

  if (profile) {
    add("identidad", 10);
    strengths.add(`Definiste el tipo de presencia principal: ${profileTypes[profile].toLowerCase()}.`);
  }

  if (answers.goal && answers.goal !== "unknown") {
    add("evolucion", 10);
    if (answers.goal === "visibility") add("visibilidad", 8);
    if (answers.goal === "trust") add("confianza", 8);
    if (answers.goal === "contacts") add("conexion", 8);
    if (answers.goal === "clarity") add("identidad", 6);
    if (answers.goal === "community") add("comunidad", 8);
    strengths.add("Tienes una prioridad inicial para orientar el avance.");
  } else if (answers.goal === "unknown") {
    prioritize("Aclarar qué quieres conseguir antes de construir nuevas piezas digitales.");
  }

  if (hasUsefulMultiAnswer(assets)) {
    add("presencia", 12);
    add("visibilidad", assets.includes("google") || assets.includes("directory") ? 9 : 3);
    if (assets.includes("website")) add("confianza", 4);
    if (assets.includes("whatsapp")) add("conexion", 4);
    strengths.add("Ya tienes al menos un lugar donde tu presencia puede encontrarse.");
  }

  if (includesAnswer(assets, "none")) {
    add("presencia", -14);
    add("visibilidad", -10);
    prioritize("Crear una base pública mínima con identidad, explicación y contacto.", true);
  }

  if (includesAnswer(assets, "unknown")) {
    add("confianza", -4);
    prioritize("Verificar qué presencia existe hoy y quién puede actualizarla.");
  }

  if (answers.clarity === "yes") {
    add("confianza", 12);
    add("conexion", 8);
    strengths.add("Tu propuesta parece entendible para una persona nueva.");
  } else if (answers.clarity === "no") {
    add("confianza", -12);
    prioritize("Escribir una explicación breve de quién eres, qué haces y cómo avanzar contigo.", true);
  } else if (answers.clarity === "unknown") {
    opportunities.add("Conviene revisar si una persona externa entiende tu presencia sin explicación adicional.");
  }

  if (hasUsefulMultiAnswer(contactChannels)) {
    add("conexion", 12);
    strengths.add("Las personas tienen una vía concreta para contactarte.");
    if (contactChannels.length > 2) {
      add("organizacion", -7);
      prioritize("Ordenar los canales de contacto para no perder oportunidades.", true);
    }
  }

  if (includesAnswer(contactChannels, "none")) {
    add("conexion", -14);
    prioritize("Definir una acción clara de contacto o participación.", true);
  }

  if (answers.obstacle === "not_found") {
    add("visibilidad", -12);
    prioritize("Mejorar cómo te descubren las personas correctas.");
  }
  if (answers.obstacle === "unclear") {
    add("identidad", -8);
    add("confianza", -8);
    prioritize("Ordenar el mensaje principal antes de ampliar canales.", true);
  }
  if (answers.obstacle === "few_contacts") {
    add("conexion", -10);
    add("visibilidad", -5);
    prioritize("Revisar si la presencia actual deja claro cómo contactarte y por qué hacerlo ahora.", true);
  }
  if (answers.obstacle === "messy_contacts") {
    add("organizacion", -12);
    prioritize("Separar conversación inicial de seguimiento para reducir desorden.", true);
  }
  if (answers.obstacle === "no_time") {
    add("organizacion", -8);
    add("evolucion", -5);
    prioritize("Reducir la presencia a una base mantenible antes de sumar canales o tareas.", true);
  }
  if (answers.obstacle === "where_start") {
    add("evolucion", -8);
    prioritize("Definir un primer avance pequeño y verificable.");
  }

  if (answers.business_location === "yes") add("visibilidad", 9);
  if (answers.business_location === "no") prioritize("Aclarar ubicación, zona de atención o alcance del servicio.", true);
  if (answers.business_location === "unknown") {
    add("visibilidad", -4);
    prioritize("Confirmar si la ubicación o zona de atención debe aparecer en tu presencia pública.", true);
  }

  if (hasUsefulMultiAnswer(answers.professional_proof)) {
    add("confianza", 12);
    strengths.add("Ya cuentas con señales públicas para respaldar tu experiencia.");
  }
  if (includesAnswer(answers.professional_proof, "none")) {
    add("confianza", -10);
    prioritize("Publicar una señal real de experiencia: caso, portafolio, credencial o recomendación verificable.", true);
  }
  if (includesAnswer(answers.professional_proof, "unknown")) {
    add("confianza", -4);
    prioritize("Revisar qué evidencia profesional existe y cuál conviene mostrar primero.", true);
  }

  if (answers.creator_consistency === "often" || answers.creator_consistency === "constant") {
    add("comunidad", 12);
    add("visibilidad", 7);
    strengths.add("Tu ritmo de publicación puede sostener descubrimiento y comunidad.");
  }
  if (answers.creator_consistency === "never" || answers.creator_consistency === "sometimes") {
    add("comunidad", -8);
    prioritize("Definir un ritmo de publicación sostenible antes de intentar crecer audiencia.", true);
  }

  if (answers.project_stage === "idea" || answers.project_stage === "validating") {
    add("evolucion", -4);
    prioritize("Explicar propósito, público inicial y próximo paso antes de crecer canales.", true);
  }
  if (answers.project_stage === "community" || answers.project_stage === "growing") {
    add("comunidad", 8);
    add("evolucion", 8);
    strengths.add("El proyecto ya tiene señales de validación o crecimiento que pueden ordenarse.");
  }

  if (hasUsefulMultiAnswer(answers.community_channel)) {
    add("comunidad", 12);
    strengths.add("La comunidad ya tiene algún punto de encuentro o información.");
  }
  if (includesAnswer(answers.community_channel, "none")) {
    add("comunidad", -12);
    add("conexion", -6);
    prioritize("Definir un canal oficial donde la comunidad pueda informarse o participar.", true);
  }

  if (answers.public_transparency === "no" || answers.public_transparency === "unknown") {
    add("confianza", -8);
    prioritize("Revisar transparencia, coherencia y verificabilidad antes de automatizar recomendaciones.", true);
  }
  if (answers.public_transparency === "yes") {
    add("confianza", 10);
    strengths.add("Tu información pública ya tiene señales de claridad y verificabilidad.");
  }

  if (answers.idea_next_step) {
    add("evolucion", 8);
    prioritize("Convertir la idea en una propuesta breve que pueda revisarse esta semana.", true);
  }

  if (answers.urgency === "critical" || answers.urgency === "soon") {
    prioritize("Priorizar lo que reduzca fricción ahora: claridad, contacto y presencia mínima.");
  }

  if (!strengths.size) strengths.add("Ya diste el primer paso: ubicar tu situación antes de construir más.");
  if (!opportunities.size) opportunities.add("La siguiente mejora debe concentrarse en claridad, confianza o contacto según tus respuestas.");

  const average = Math.round(dimensions.reduce((sum, dimension) => sum + scores[dimension], 0) / dimensions.length);
  const confidence = confidenceTotal === 0 ? "baja" : confidenceHits / confidenceTotal >= 0.78 ? "alta" : confidenceHits / confidenceTotal >= 0.55 ? "media" : "baja";
  const position = average < 40 ? "Punto de partida" : average < 55 ? "Base en construcción" : average < 70 ? "Presencia activa" : average < 82 ? "Sistema en crecimiento" : "Presencia madura";
  const cta = answers.obstacle === "not_found"
    ? "Quiero que más personas me encuentren"
    : answers.obstacle === "messy_contacts"
      ? "Quiero organizar mis oportunidades"
      : answers.profile === "idea" || answers.project_stage === "idea"
        ? "Quiero definir mi siguiente paso"
        : "Quiero una orientación profesional";

  return {
    average,
    confidence,
    position,
    strengths: [...strengths].slice(0, 3),
    opportunities: [...opportunities].slice(0, 3),
    priorities: [...primaryPriorities, ...priorities].filter((item, index, list) => list.indexOf(item) === index).slice(0, 3),
    scores,
    cta,
  };
}

function formatAnswer(questionId: string, answer: AnswerValue | undefined) {
  if (!answer) return "Sin respuesta";
  const values = Array.isArray(answer) ? answer : [answer];
  const question = questions.find((item) => item.id === questionId);
  return values
    .map((value) => question?.options.find((option) => option.value === value)?.label ?? value)
    .join(", ");
}

function getDiagnosticMailto(result: ReturnType<typeof scoreAnswers>, answers: Answers) {
  const profile = answers.profile as ProfileType | undefined;
  const subject = `Quiero revisar mi diagnostico Vecidya: ${result.position}`;
  const body = [
    "Hola Vecidya,",
    "",
    "Acabo de completar el diagnostico y quiero revisar como avanzar.",
    "",
    `Tipo de presencia: ${profile ? profileTypes[profile] : "Sin definir"}`,
    `Posicion digital: ${result.position}`,
    `Area prioritaria: ${result.priorities[0] ?? "Por definir"}`,
    `Objetivo marcado: ${formatAnswer("goal", answers.goal)}`,
    "",
    "No estoy enviando mis respuestas completas ni se esta guardando informacion en Vecidya.",
  ].join("\n");

  return `mailto:hola@vecidya.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function getRecommendationLink(item: string) {
  if (/encontr|descubr|visibilidad/i.test(item)) return "/servicios#visibilidad";
  if (/mensaje|explicación|presencia pública|canales|contacto|base pública/i.test(item)) return "/servicios#presencia-digital";
  if (/organizar|seguimiento|desorden/i.test(item)) return "/servicios#estructuracion";
  if (/formaliz|responsabilidad/i.test(item)) return "/servicios#formalizacion";
  return null;
}

export default function Diagnostic() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const applicableQuestions = useMemo(() => getApplicableQuestions(answers), [answers]);
  const currentQuestion = applicableQuestions[step];
  const result = useMemo(() => scoreAnswers(answers, applicableQuestions), [answers, applicableQuestions]);
  const complete = step >= applicableQuestions.length;
  const currentStage = complete ? "Resultado" : currentQuestion.stage;
  const progress = complete ? 100 : Math.round((step / applicableQuestions.length) * 100);
  const contactHref = complete ? getDiagnosticMailto(result, answers) : "mailto:hola@vecidya.com";
  const questionNumber = complete ? applicableQuestions.length : step + 1;

  const answerQuestion = (question: Question, value: string) => {
    setAnswers((current) => {
      if (question.id === "profile") return { profile: value };
      if (question.type !== "multi") return { ...current, [question.id]: value };

      const option = question.options.find((item) => item.value === value);
      const previous = Array.isArray(current[question.id]) ? current[question.id] as string[] : [];
      const next = previous.includes(value) ? previous.filter((item) => item !== value) : [...previous, value];

      if (option?.exclusive) return { ...current, [question.id]: next.includes(value) ? [value] : [] };

      return {
        ...current,
        [question.id]: next.filter((item) => !question.options.find((choice) => choice.value === item)?.exclusive),
      };
    });
  };

  const canContinue = complete || Boolean(currentQuestion && answers[currentQuestion.id] && (!Array.isArray(answers[currentQuestion.id]) || (answers[currentQuestion.id] as string[]).length));

  const goNext = () => {
    if (!canContinue) return;
    setStep((current) => Math.min(current + 1, getApplicableQuestions(answers).length));
  };

  const goBack = () => setStep((current) => Math.max(0, current - 1));
  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  useEffect(() => {
    questionHeadingRef.current?.focus();
  }, [complete, currentQuestion?.id]);

  return (
    <PublicLayout>
      <main className="public-page diagnostic-page">
        <section className="diagnostic-hero">
          <div>
            <p className="eyebrow">DIAGNÓSTICO VECIDYA</p>
            <h1>Entiende qué mejorar primero.</h1>
            <p>
              Responde unas preguntas breves y recibe una orientación inmediata
              sobre cómo te encuentran, qué confianza generas y qué paso conviene
              priorizar. No necesitas dejar tu correo para ver el resultado.
            </p>
          </div>
          <div className="diagnostic-hero__panel">
            <img alt="" aria-hidden="true" decoding="async" height={1254} src={publicAssets.icons.vecidyaPin} width={1254} />
            <span>Recibirás</span>
            <ul>
              {diagnosticDeliverables.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="diagnostic-shell" aria-labelledby="diagnostic-title">
          <nav className="diagnostic-progress" aria-label="Etapas del diagnóstico">
            {stageOrder.map((stage) => (
              <span aria-current={stage === currentStage ? "step" : undefined} className={stage === currentStage ? "is-active" : undefined} key={stage}>{stage}</span>
            ))}
          </nav>
          <div
            aria-label={`Pregunta ${questionNumber} de ${applicableQuestions.length}`}
            aria-valuemax={applicableQuestions.length}
            aria-valuemin={0}
            aria-valuenow={complete ? applicableQuestions.length : step}
            className="diagnostic-meter"
            role="progressbar"
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <p aria-live="polite" className="diagnostic-progress-label">
            {complete ? "Diagnóstico completo" : `Pregunta ${questionNumber} de ${applicableQuestions.length} · ${currentStage}`}
          </p>

          {!complete && currentQuestion ? (
            <article className="diagnostic-question">
              <p className="eyebrow">{currentQuestion.stage} · {currentQuestion.eyebrow}</p>
              <h2 id="diagnostic-title" ref={questionHeadingRef} tabIndex={-1}>{currentQuestion.prompt}</h2>
              <p id="diagnostic-helper">{currentQuestion.helper}</p>
              <div className={`diagnostic-options diagnostic-options--${currentQuestion.type}`}>
                {currentQuestion.options.map((option) => {
                  const selected = includesAnswer(answers[currentQuestion.id], option.value);
                  const icon = currentQuestion.id === "profile" ? profileIcons[option.value as ProfileType] : undefined;
                  return (
                    <button
                      aria-pressed={selected}
                      aria-describedby="diagnostic-helper"
                      className={selected ? "is-selected" : undefined}
                      key={option.value}
                      onClick={() => answerQuestion(currentQuestion, option.value)}
                      type="button"
                    >
                      {icon ? <img alt="" aria-hidden="true" className="diagnostic-option__icon" height={36} src={icon} width={36} /> : null}
                      <span className="diagnostic-option__mark" aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="diagnostic-actions">
                <button className="button button--secondary" disabled={step === 0} onClick={goBack} type="button">Volver</button>
                <button className="button button--primary" disabled={!canContinue} onClick={goNext} type="button">Continuar</button>
              </div>
            </article>
          ) : (
            <article className="diagnostic-result">
              <p className="eyebrow">TU DIAGNÓSTICO</p>
              <h2 ref={questionHeadingRef} tabIndex={-1}>{result.position}</h2>
              <p>
                Esta orientación resume tu punto de partida, lo que ya funciona y
                dónde conviene concentrar el próximo avance. Confianza del
                diagnóstico: <strong>{result.confidence}</strong>.
              </p>

              <div className="diagnostic-scoreline" aria-label={`Posición digital estimada ${result.average} de 100`}>
                <span style={{ width: `${result.average}%` }} />
              </div>

              <section className="diagnostic-result-summary" aria-label="Resumen del resultado">
                <div>
                  <span>Posición digital</span>
                  <strong>{result.position}</strong>
                </div>
                <div>
                  <span>Área prioritaria</span>
                  <strong>{result.priorities[0] ?? "Definir el siguiente paso"}</strong>
                </div>
              </section>

              <div className="diagnostic-result-grid">
                <section className="diagnostic-result-card diagnostic-result-card--dimensions">
                    <h3>Tus dimensiones</h3>
                    <dl className="diagnostic-dimensions">
                      {dimensions.map((dimension) => (
                        <div key={dimension}>
                          <dt>{dimensionLabels[dimension]}</dt>
                          <dd><span style={{ width: `${result.scores[dimension]}%` }} />{result.scores[dimension]}</dd>
                        </div>
                      ))}
                  </dl>
                </section>
                <section className="diagnostic-result-card diagnostic-result-card--strengths">
                  <h3>Tus fortalezas</h3>
                  <ul>{result.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section className="diagnostic-result-card diagnostic-result-card--opportunities">
                  <h3>Oportunidades</h3>
                  <ul>{result.opportunities.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section className="diagnostic-result-card diagnostic-result-card--steps">
                  <h3>Tus próximos focos</h3>
                  <ol>{result.priorities.map((item) => {
                    const href = getRecommendationLink(item);
                    return <li key={item}>{href ? <Link to={href}>{item}</Link> : item}</li>;
                  })}</ol>
                </section>
              </div>

              <div className="diagnostic-result__cta">
                <a className="button button--primary" href={contactHref}>{result.cta}</a>
                <Link className="button button--secondary" to="/contacto">Quiero revisar esto con Vecidya</Link>
                <button className="button button--secondary" onClick={restart} type="button">Rehacer diagnóstico</button>
              </div>
            </article>
          )}
        </section>
      </main>
    </PublicLayout>
  );
}
