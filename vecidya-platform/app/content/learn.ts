export type LearnBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; label: string; items: { title: string; detail: string }[] }
  | { type: "definitions"; items: { term: string; definition: string }[] }
  | {
      type: "example";
      title: string;
      hypothetical: true;
      context: string;
      problem: string;
      approach: string;
      actions: string[];
      lesson: string;
    }
  | { type: "callout"; tone: "tip" | "caution"; title: string; text: string }
  | { type: "faq"; items: { question: string; answer: string }[] }
  | { type: "sources"; items: { label: string; url: string; scope: string }[] }
  | { type: "summary"; items: string[] };

export type LearnArticle = {
  slug: string;
  category: string;
  title: string;
  intro: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  cta: { label: string; to: string; copy: string };
  sections: { heading: string; paragraphs: string[]; bullets?: string[]; blocks?: LearnBlock[] }[];
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
    intro: "Un CRM es una forma de organizar contactos y conversaciones para saber qué necesita cada persona y cuál es el siguiente paso, sin depender solo de la memoria.",
    excerpt: "Aprende qué información organizar, cuándo basta una hoja de cálculo y cómo crear una rutina de seguimiento proporcional.",
    image: "/assets/learn/diagram-crm.svg",
    imageAlt: "Una consulta se registra con contexto y puede continuar, retomarse después o cerrarse, según lo que ocurra",
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar capacidades digitales; no es un CRM ni crea una base de contactos." },
    sections: [
      {
        heading: "Qué significa CRM en el trabajo diario",
        paragraphs: [
          "CRM viene de customer relationship management, que suele traducirse como gestión de las relaciones con clientes. Describe tanto una manera de organizar la relación con las personas como las herramientas que ayudan a llevarla a la práctica.",
          "En un negocio pequeño, el propósito básico no es acumular datos ni automatizar cada conversación. Es poder recuperar el contexto: quién se comunicó, qué estaba buscando, qué se respondió y qué acción acordaron. Una agenda, una tabla o un software pueden servir; importa que el método sea comprensible y se mantenga actualizado.",
        ],
        blocks: [{ type: "callout", tone: "tip", title: "La herramienta no es el proceso", text: "Un CRM no responde por el negocio ni garantiza una venta. Ayuda a registrar y coordinar tareas que las personas responsables todavía deben definir y realizar." }],
      },
      {
        heading: "Contacto, consulta, oportunidad y cliente no son lo mismo",
        paragraphs: ["Usar palabras distintas para momentos distintos evita tratar a toda persona como si estuviera lista para comprar. No todas las consultas se convierten en una oportunidad y no toda oportunidad termina en cliente."],
        blocks: [{ type: "definitions", items: [
          { term: "Contacto", definition: "Una persona o entidad con la que el negocio tiene o podría tener comunicación. Guardar un contacto no significa que haya solicitado una oferta." },
          { term: "Consulta", definition: "Una pregunta o petición concreta recibida por algún canal, como una llamada, un mensaje o un formulario." },
          { term: "Oportunidad", definition: "Una posibilidad de trabajo o compra que merece un siguiente paso acordado. Es un estado de seguimiento, no una venta segura." },
          { term: "Cliente", definition: "Una persona o entidad que ya contrató, compró o recibió el servicio, según cómo el negocio defina esa relación." },
        ] }],
      },
      {
        heading: "Qué información conviene organizar",
        paragraphs: ["Empieza por los datos que ayudan a responder o cumplir un acuerdo. Si un campo no sirve para una tarea concreta, probablemente no haga falta pedirlo ni guardarlo."],
        blocks: [{ type: "list", items: [
          "Nombre o identificador suficiente para reconocer la conversación.",
          "Canal y dato de contacto que la persona proporcionó para esa comunicación.",
          "Motivo de la consulta, expresado con notas breves y objetivas.",
          "Estado actual y último contacto relevante, con fecha cuando sea útil.",
          "Siguiente acción concreta, responsable y fecha acordada si corresponde.",
        ] }, { type: "callout", tone: "caution", title: "Guarda lo necesario, no todo lo posible", text: "Evita registrar información sensible, opiniones subjetivas o detalles personales que no hagan falta para atender la solicitud. Limita quién puede ver los registros." }],
      },
      {
        heading: "Cuándo basta una agenda o una hoja de cálculo",
        paragraphs: ["Una herramienta sencilla puede ser suficiente si una sola persona gestiona pocas consultas, puede encontrar el contexto con facilidad y recuerda revisar los próximos pasos. No hay un número universal de contactos a partir del cual sea obligatorio adoptar un CRM."],
        blocks: [{ type: "list", items: [
          "La información cabe en una lista pequeña con acceso controlado.",
          "No se duplican registros ni se pierden conversaciones entre canales.",
          "Cada pendiente tiene una próxima acción comprensible.",
          "La revisión manual es breve y no interrumpe otras tareas importantes.",
        ] }, { type: "callout", tone: "tip", title: "Empieza por el problema observable", text: "Si una agenda compartida ya permite saber qué falta hacer, puedes mejorar primero ese hábito. Cambiar de herramienta sin acordar un proceso solo traslada el desorden." }],
      },
      {
        heading: "Cuándo puede justificarse un CRM",
        paragraphs: ["Considera una herramienta especializada cuando el método actual ya no permite mantener el contexto o coordinar el trabajo. La decisión debe responder a un problema frecuente, no a la idea de que todo negocio necesita el mismo software."],
        blocks: [{ type: "list", items: [
          "Varias personas responden las mismas consultas y necesitan compartir el historial.",
          "Hay que volver a buscar información en mensajes, cuadernos y archivos distintos.",
          "Se acumulan pendientes porque no está claro quién hace el siguiente contacto.",
          "El volumen o la complejidad hacen difícil revisar manualmente qué conversaciones siguen abiertas.",
        ] }, { type: "paragraph", text: "Antes de elegir, comprueba el coste total, facilidad de uso, exportación y eliminación de datos, permisos, soporte, integraciones que realmente necesitas y cómo saldrías de la herramienta si deja de servirte." }],
      },
      {
        heading: "De consulta a próximo paso: un ejemplo hipotético",
        paragraphs: ["Este escenario es ilustrativo: no describe un cliente real ni atribuye resultados a una herramienta."],
        blocks: [{ type: "example", title: "Un pequeño taller de bicicletas", hypothetical: true,
          context: "La persona que atiende el taller recibe consultas por teléfono y mensajería mientras repara bicicletas.",
          problem: "Al final del día, cuesta recordar quién preguntó por una reparación, qué información se pidió y a quién había que responder cuando llegara una pieza.",
          approach: "El taller prueba una lista sencilla, disponible solo para quien gestiona las consultas. Cada fila representa una conversación y el equipo acuerda usar pocos estados: nueva, esperando respuesta, pendiente de una pieza y cerrada.",
          actions: [
            "Anotar nombre, canal de respuesta, motivo breve de la consulta y fecha de entrada.",
            "Registrar el último acuerdo y escribir el siguiente paso en forma de acción: por ejemplo, «avisar cuando llegue la pieza».",
            "Asignar quién lo hará y cuándo revisarlo, si el paso depende de otra persona o de una fecha.",
            "Al terminar el día, revisar pendientes; al cerrar la conversación, actualizar el estado y conservar solo la información que todavía haga falta.",
          ],
          lesson: "La mejora organizativa está en el acuerdo de registrar y revisar los pendientes. Si esa lista se vuelve difícil de mantener o compartir, el taller puede comparar herramientas; no necesita empezar por un CRM complejo.",
        }],
      },
      {
        heading: "Cómo empezar a organizar las consultas",
        paragraphs: ["Primero prueba el flujo con un formato sencillo. Así descubrirás qué información utiliza de verdad el equipo antes de configurar campos y automatizaciones."],
        blocks: [{ type: "steps", label: "Pasos para organizar las consultas", items: [
          { title: "Define qué conversación vas a registrar", detail: "Por ejemplo, solicitudes de presupuesto que requieren una respuesta posterior. No mezcles de entrada consultas, clientes actuales y comunicaciones que no necesitan seguimiento." },
          { title: "Elige dónde guardar el registro", detail: "Usa una agenda o tabla compartida con permisos adecuados si resuelve la necesidad. Si no, prueba un CRM que permita organizar contactos, notas y próximas acciones sin funciones innecesarias." },
          { title: "Acuerda pocos estados", detail: "Usa nombres que el equipo entienda y que indiquen qué hacer, como «nueva», «esperando respuesta» o «cerrada». Define cuándo cambia cada estado." },
          { title: "Registra la siguiente acción", detail: "Especifica una tarea que alguien pueda completar. «Hacer seguimiento» es ambiguo; «responder con disponibilidad el jueves» deja claro qué falta." },
          { title: "Revisa y ajusta", detail: "Tras usar el método durante un periodo de prueba, elimina campos que nadie usa y resuelve dónde aparecen duplicados o pendientes sin responsable." },
        ] }],
      },
      {
        heading: "Una rutina sencilla de seguimiento",
        paragraphs: ["El seguimiento útil depende de los acuerdos y del contexto de la conversación. No existe una frecuencia universal que sirva para todos los negocios o personas."],
        blocks: [{ type: "steps", label: "Rutina de revisión de consultas", items: [
          { title: "Al recibir una consulta", detail: "Registra el motivo y responde o acuerda cuándo volverás con una respuesta." },
          { title: "Antes de terminar la jornada", detail: "Revisa los pendientes con fecha próxima y asigna dueño a los que no lo tengan." },
          { title: "Cuando toque retomar", detail: "Lee el contexto antes de escribir. Comparte una respuesta o actualización útil, no un mensaje repetido sin información nueva." },
          { title: "Si no hay respuesta", detail: "Respeta la preferencia de contacto y las reglas aplicables. Evita insistir indefinidamente; registra el cierre o la pausa según el proceso acordado." },
          { title: "Al resolver o cerrar", detail: "Actualiza el estado y conserva el historial solo durante el tiempo y para los fines que correspondan." },
        ] }],
      },
      {
        heading: "Errores frecuentes que conviene evitar",
        paragraphs: [],
        blocks: [{ type: "list", items: [
          "Comprar primero y decidir después qué proceso debería resolver el CRM.",
          "Crear demasiados estados o campos que nadie mantiene.",
          "Registrar la misma conversación en varios lugares sin definir cuál es la fuente vigente.",
          "Dejar pendientes sin responsable, fecha o acción concreta.",
          "Confundir un registro de interés con consentimiento para publicidad o con una venta probable.",
          "Automatizar mensajes antes de revisar su contenido, destinatarios, frecuencia y mecanismo para detenerlos.",
          "Guardar datos personales sin un propósito claro, acceso limitado o una regla de conservación.",
        ] }],
      },
      {
        heading: "Precauciones al manejar datos personales",
        paragraphs: ["Un registro con nombre, teléfono, correo, mensajes u otros identificadores puede contener datos personales. Las obligaciones concretas dependen del país, del tipo de dato, del propósito y de la forma en que se trata; esta guía no sustituye asesoría legal."],
        blocks: [{ type: "list", items: [
          "Explica y define para qué necesitas cada dato; recoge solo lo pertinente.",
          "Limita el acceso a quienes necesitan consultar o actualizar los registros.",
          "Protege las cuentas y dispositivos, y revisa cómo el proveedor almacena, exporta y elimina la información.",
          "Define cuánto tiempo conservarás cada tipo de registro y cómo eliminarás lo que ya no necesites.",
          "Revisa las solicitudes de las personas y los requisitos de privacidad y marketing aplicables en tu jurisdicción antes de usar datos para nuevas finalidades.",
        ] }, { type: "callout", tone: "caution", title: "Revisa las reglas de tu jurisdicción", text: "Las referencias siguientes ofrecen marcos de gestión y orientación publicados en otros contextos regulatorios; no determinan por sí solos las obligaciones legales de tu negocio." }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{ type: "faq", items: [
          { question: "¿Necesito un CRM si trabajo por mi cuenta?", answer: "No necesariamente. Si una agenda o lista simple te permite recuperar el contexto y atender los pendientes, puedes empezar ahí. Reevalúa cuando el método deje de ser confiable o fácil de sostener." },
          { question: "¿Una hoja de cálculo es un CRM?", answer: "Puede cumplir algunas tareas de organización de contactos y seguimiento, pero no ofrece por sí sola todas las funciones de un sistema especializado. La diferencia práctica es si tu método resuelve el trabajo que realmente tienes." },
          { question: "¿Un CRM hará el seguimiento automáticamente?", answer: "No por definición. Algunos productos ofrecen tareas o automatizaciones, pero alguien debe diseñarlas, revisar sus condiciones y atender excepciones. La disponibilidad depende del producto y su configuración." },
          { question: "¿Vecidya guarda mis consultas en un CRM?", answer: "No. Vecidya gestiona su plataforma y la presencia digital según las capacidades implementadas; la integración con HighLevel/GHL no está implementada. Este artículo explica organización CRM en general y no afirma que el Diagnóstico almacene contactos." },
        ] }],
      },
      {
        heading: "Fuentes y orientación adicional",
        paragraphs: ["Estas referencias ayudan a profundizar en la gestión del riesgo de privacidad. Sus marcos o normas se aplican en sus propios contextos; consulta la autoridad y legislación correspondiente a tu país."],
        blocks: [{ type: "sources", items: [
          { label: "NIST Privacy Framework", url: "https://www.nist.gov/privacy-framework", scope: "Instituto estadounidense NIST. Marco voluntario para identificar y gestionar riesgos de privacidad; no es una ley aplicable a todos los países." },
          { label: "Advice for small and medium organisations", url: "https://ico.org.uk/for-organisations/advice-for-small-organisations/", scope: "Oficina del Comisionado de Información del Reino Unido (ICO). Orientación para organizaciones pequeñas bajo el contexto regulatorio británico." },
        ] }],
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{ type: "summary", items: [
          "Anota dónde llegan hoy las consultas y qué información necesitas para atenderlas.",
          "Prueba una lista pequeña con estado, contexto y próximo paso; limita el acceso y los datos recopilados.",
          "Revisa los pendientes con una frecuencia que el equipo pueda sostener.",
          "Considera un CRM cuando puedas señalar qué problema de coordinación o seguimiento resolvería.",
        ] }],
      },
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
