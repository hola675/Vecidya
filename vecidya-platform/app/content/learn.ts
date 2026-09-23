export type LearnArticle = {
  slug: string;
  category: string;
  title: string;
  intro: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  cta: { label: string; to: string; copy: string };
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
};

export const learnCategories = [
  { name: "Negocios digitales", description: "Presencia, organización y primeros pasos." },
  { name: "Automatización", description: "Procesos, seguimiento y tiempo mejor aprovechado." },
  { name: "Inteligencia Artificial", description: "Usos reales de IA para negocios y equipos." },
  { name: "CRM y clientes", description: "Contactos, oportunidades y conversaciones con contexto." },
  { name: "Tecnología explicada", description: "Conceptos digitales explicados sin jerga." },
] as const;

export const learnArticles: LearnArticle[] = [
  {
    slug: "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo",
    category: "CRM y clientes",
    title: "¿Qué es un CRM y por qué un negocio pequeño puede necesitarlo?",
    intro: "Un CRM ayuda a recordar quién llegó, qué necesita y cuál es el siguiente paso, sin depender de la memoria o de una hoja perdida.",
    excerpt: "Contactos, seguimiento y organización explicados con un ejemplo sencillo.",
    image: "/assets/learn/diagram-crm.svg",
    imageAlt: "Diagrama de una persona interesada que se convierte en cliente con seguimiento",
    cta: { label: "Quiero organizar mis clientes", to: "/diagnostico?objetivo=organize", copy: "El diagnóstico ayuda a ubicar si hoy necesitas ordenar contactos, oportunidades o canales." },
    sections: [
      { heading: "El problema no es tener pocos contactos", paragraphs: ["Cuando las consultas llegan por distintos canales, el reto es conservar el contexto: qué preguntó cada persona, cuándo responder y qué se acordó.", "Un CRM reúne esa información en un solo lugar. No hace que el negocio venda automáticamente; hace visible el trabajo que ya necesita hacerse."] },
      { heading: "¿Qué guarda un CRM?", paragraphs: ["Como mínimo, una ficha de contacto, notas, tareas y el estado de una oportunidad. Así puedes distinguir entre alguien que apenas preguntó y una conversación que ya necesita seguimiento."], bullets: ["Quién es la persona y cómo prefiere contactarte.", "Qué necesita y qué conversación tuvieron.", "Cuál es el siguiente paso y quién debe hacerlo."] },
      { heading: "Cuándo tiene sentido", paragraphs: ["Si pierdes consultas, respondes dos veces lo mismo o no sabes qué conversaciones están abiertas, puede ser el momento de ordenar el seguimiento. Si todavía recibes muy pocas consultas, primero conviene aclarar tu presencia y tu propuesta."] },
    ],
  },
  {
    slug: "que-puede-hacer-una-inteligencia-artificial-por-un-negocio",
    category: "Inteligencia Artificial",
    title: "¿Qué puede hacer una inteligencia artificial por un negocio?",
    intro: "La IA puede ayudar a responder, clasificar y preparar tareas, pero funciona mejor cuando el negocio ya sabe qué quiere resolver.",
    excerpt: "Chat, voz y automatización: usos reales antes de elegir una herramienta.",
    image: "/assets/learn/diagram-ai.svg",
    imageAlt: "Diagrama de un mensaje que pasa por un asistente de IA y llega a seguimiento",
    cta: { label: "Explorar si IA tiene sentido", to: "/diagnostico", copy: "No toda operación necesita IA. El diagnóstico ayuda a separar una necesidad real de una moda." },
    sections: [
      { heading: "IA no es una respuesta para todo", paragraphs: ["Un asistente puede contestar preguntas frecuentes, transcribir una llamada o preparar una respuesta. Pero necesita información clara, límites y una persona responsable de revisar los casos importantes.", "La pregunta útil no es «¿dónde pongo IA?», sino «¿qué tarea repetitiva o qué demora quiero reducir?». "] },
      { heading: "Tres usos que sí se pueden explicar", paragraphs: ["En un negocio pequeño, la IA suele aportar valor cuando acompaña un proceso que ya existe."], bullets: ["Chat: orientar a una persona con preguntas frecuentes.", "Voz: atender o resumir conversaciones con un criterio definido.", "Automatización: clasificar una consulta y dejar listo el siguiente paso."] },
      { heading: "Empieza por una tarea", paragraphs: ["Define qué entra, qué puede responder el sistema y cuándo debe intervenir una persona. Medir una tarea concreta es más seguro que automatizar todo de una vez."] },
    ],
  },
  {
    slug: "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
    category: "Negocios digitales",
    title: "Antes de hacer publicidad, organiza tu presencia digital",
    intro: "La publicidad puede llevar más personas hacia tu negocio, pero no puede aclarar por sí sola qué haces, cómo contactarte o qué esperar.",
    excerpt: "La información y los canales son la base antes de invertir en alcance.",
    image: "/assets/selected/illustrations/illus-storefront-digital-profile.webp",
    imageAlt: "Ilustración de una presencia digital organizada",
    cta: { label: "Revisar mi punto de partida", to: "/diagnostico", copy: "Antes de aumentar el alcance, identifica qué parte de tu presencia necesita claridad." },
    sections: [
      { heading: "La primera visita importa", paragraphs: ["Cuando alguien descubre un negocio, busca respuestas rápidas: qué ofrece, para quién es, dónde opera y cómo dar el siguiente paso. Si esa información está dispersa, cada visita cuesta más confianza."] },
      { heading: "Una base mínima", paragraphs: ["No necesitas estar en todos los canales. Necesitas que los principales cuenten la misma historia y tengan una acción clara."], bullets: ["Una descripción breve y comprensible.", "Un canal de contacto que sí puedas atender.", "Información actualizada sobre ubicación, horarios o cobertura."] },
      { heading: "Publicidad después", paragraphs: ["Cuando la base está lista, la publicidad puede probar mensajes y audiencias con menos desperdicio. Si todavía no está lista, el diagnóstico puede ayudarte a priorizar antes de invertir."] },
    ],
  },
  {
    slug: "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio",
    category: "Automatización",
    title: "Automatizaciones: ahorrar tiempo sin complicar tu negocio",
    intro: "Una automatización útil conecta un evento con una regla y una acción. No reemplaza el criterio: elimina pasos repetitivos.",
    excerpt: "Recordatorios, procesos y seguimiento con una regla sencilla.",
    image: "/assets/learn/diagram-automation.svg",
    imageAlt: "Diagrama de un evento que activa una regla y una acción automática",
    cta: { label: "Hablar sobre un proceso", to: "/servicios", copy: "Si sabes qué tarea se repite, Servicios puede ayudarte a pensar una forma proporcional de ordenarla." },
    sections: [
      { heading: "La fórmula es simple", paragraphs: ["Primero ocurre un evento: llega un formulario, cambia un estado o se acerca una cita. Después se evalúa una regla y finalmente se ejecuta una acción, como crear una tarea o enviar un recordatorio."] },
      { heading: "Qué conviene automatizar primero", paragraphs: ["Empieza por un paso frecuente, claro y fácil de revisar. Los recordatorios y la clasificación inicial suelen ser mejores candidatos que las decisiones sensibles."], bullets: ["Confirmaciones y recordatorios.", "Asignación de tareas con responsable.", "Avisos cuando una conversación lleva demasiado tiempo sin respuesta."] },
      { heading: "Automático no significa invisible", paragraphs: ["Toda automatización necesita una salida: alguien debe poder revisar, corregir y detener el proceso. La claridad del flujo importa tanto como la herramienta que lo ejecuta."] },
    ],
  },
];

export function getLearnArticle(slug: string) {
  return learnArticles.find((article) => article.slug === slug);
}
