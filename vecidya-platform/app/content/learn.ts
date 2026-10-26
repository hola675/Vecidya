import { learnBusinessOperationsArticles } from "./learn-business-operations";
import { learnOperations02Articles } from "./learn-operations-02";
import { learnManagement03Articles } from "./learn-management-03";
import { learnDigitalLiteracyArticles } from "./learn-digital-literacy";
import { learnTechnical04BArticles } from "./learn-technical-04b";
import { learnEmail04BArticles } from "./learn-email-04b";

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
  relatedSlugs?: string[];
  enPocasPalabras: [string, string, string];
  editorialDraft?: boolean;
  cta: { label: string; to: string; copy: string };
  sections: { heading: string; paragraphs: string[]; bullets?: string[]; blocks?: LearnBlock[] }[];
};

export const learnCategories = [
  { name: "Negocios digitales", description: "Presencia, organización y primeros pasos." },
  { name: "Automatización", description: "Procesos, seguimiento y tiempo mejor aprovechado." },
  { name: "Inteligencia Artificial", description: "Usos reales de IA para negocios y equipos." },
  { name: "CRM y clientes", description: "Contactos, oportunidades y conversaciones con contexto." },
  { name: "Tecnología explicada", description: "Conceptos digitales explicados sin jerga." },
  { name: "Gestión y equipos", description: "Coordinar personas, sedes, información y varios negocios sin perder claridad." },
] as const;

export const learnArticles: LearnArticle[] = [
  {
    slug: "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo",
    category: "CRM y clientes",
    title: "¿Qué es un CRM y por qué un negocio pequeño puede necesitarlo?",
    intro: "¿Te ha pasado que prometes responder y luego no encuentras el mensaje? Un CRM ayuda a conservar el contexto y los próximos pasos, pero una lista sencilla puede bastar para empezar.",
    excerpt: "Entiende qué organiza un CRM, cuándo una tabla es suficiente y qué información conviene guardar.",
    enPocasPalabras: [
      "Empieza con una lista sencilla si todavía puedes seguir bien las consultas.",
      "Registra qué necesita la persona, quién responde y cuál es el siguiente paso.",
      "Considera un CRM cuando coordinar conversaciones y pendientes deja de ser fácil.",
    ],
    image: "/assets/learn/diagram-crm.svg",
    imageAlt: "Una consulta se registra con contexto y puede continuar, retomarse después o cerrarse, según lo que ocurra",
    relatedSlugs: ["organizar-consultas-mensajes-llamadas-formularios", "como-responder-la-primera-consulta-de-un-cliente"],
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar capacidades digitales; no es un CRM ni crea una base de contactos." },
    editorialDraft: false,
    sections: [
      {
        heading: "Qué significa CRM en el trabajo diario",
        paragraphs: [
          "CRM viene de customer relationship management, o gestión de relaciones con clientes. En la práctica, sirve para que el negocio pueda recuperar el contexto de una conversación y saber qué falta hacer.",
          "El valor no está en guardar muchos datos. Está en poder responder preguntas simples: quién escribió, qué necesita, qué se acordó, quién sigue el caso y cuándo revisarlo.",
        ],
        blocks: [{
          type: "callout",
          tone: "tip",
          title: "La herramienta no sustituye el proceso",
          text: "Una agenda, una hoja o un CRM pueden funcionar si el equipo sabe qué registrar y revisa los pendientes. Comprar software sin acordar ese hábito solo mueve el desorden.",
        }],
      },
      {
        heading: "Contacto, consulta/interesado, oportunidad y cliente",
        paragraphs: ["No todas las personas están en el mismo momento. Usar palabras distintas ayuda a no tratar una pregunta como si ya fuera una venta."],
        blocks: [{
          type: "definitions",
          items: [
            { term: "Contacto", definition: "Persona o entidad con la que existe una vía de comunicación. Tener un contacto no significa que haya pedido una oferta." },
            { term: "Consulta/interesado", definition: "Contacto que hizo una pregunta o solicitud concreta y necesita una respuesta." },
            { term: "Oportunidad", definition: "Posibilidad de trabajo o compra con un siguiente paso acordado. No es una venta segura." },
            { term: "Cliente", definition: "Persona o entidad que ya contrató, compró o recibió el servicio según la definición del negocio." },
          ],
        }],
      },
      {
        heading: "Qué información mínima conviene organizar",
        paragraphs: ["Guarda lo que ayuda a responder y cumplir un acuerdo. Si un dato no tiene una finalidad clara, probablemente no haga falta pedirlo."],
        blocks: [{
          type: "list",
          items: [
            "Nombre o referencia suficiente para reconocer la conversación.",
            "Canal de respuesta proporcionado por la persona.",
            "Motivo breve de la consulta.",
            "Último acuerdo o respuesta relevante.",
            "Siguiente acción, responsable y fecha cuando corresponda.",
          ],
        }],
      },
      {
        heading: "Cuándo basta una lista y cuándo mirar un CRM",
        paragraphs: [
          "Una lista puede ser suficiente si pocas personas gestionan las consultas, encuentran el contexto con facilidad y revisan los pendientes sin duplicarlos.",
          "Un CRM puede tener sentido cuando varias personas atienden canales distintos, se pierden conversaciones, aparecen registros duplicados o deja de estar claro quién debe responder.",
        ],
        blocks: [{
          type: "steps",
          label: "Prueba primero el método",
          items: [
            { title: "Elige un tipo de consulta", detail: "Por ejemplo, solicitudes de presupuesto que requieren respuesta posterior." },
            { title: "Usa pocos estados", detail: "Nueva, esperando respuesta, pendiente de una condición y cerrada pueden ser suficientes para empezar." },
            { title: "Escribe la próxima acción", detail: "Sustituye «hacer seguimiento» por una acción concreta que alguien pueda completar." },
            { title: "Revisa durante un periodo", detail: "Observa dónde se duplican, se pierden o se quedan sin responsable los pendientes." },
            { title: "Escala solo si hace falta", detail: "Si la lista deja de ser confiable, compara herramientas con permisos, exportación y costos que puedas mantener." },
          ],
        }],
      },
      {
        heading: "Ejemplo: un taller que pierde consultas",
        paragraphs: ["Caso hipotético para separar el problema organizativo de la herramienta."],
        blocks: [{
          type: "example",
          title: "Un pequeño taller de bicicletas",
          hypothetical: true,
          context: "La persona que atiende recibe consultas por teléfono y mensajería mientras repara bicicletas.",
          problem: "Al final del día cuesta recordar quién preguntó por una reparación y a quién había que responder cuando llegara una pieza.",
          approach: "El taller prueba primero una lista sencilla con una fuente de información común, pocos estados y una persona responsable de revisar pendientes.",
          actions: [
            "Registrar nombre o referencia, canal, motivo breve y fecha.",
            "Escribir el siguiente paso con una acción concreta.",
            "Asignar responsable cuando intervengan varias personas.",
            "Revisar los pendientes al final del día y cerrar los casos resueltos.",
          ],
          lesson: "El orden viene del método de seguimiento. Si esa lista se vuelve difícil de sostener, entonces tiene sentido comparar un CRM.",
        }],
      },
      {
        heading: "Protege los datos y los accesos",
        paragraphs: [
          "No registres información sensible o comentarios personales que no hagan falta para atender la solicitud. Limita quién puede ver o modificar los registros y revisa los accesos cuando alguien cambia de función.",
        ],
        blocks: [{
          type: "callout",
          tone: "caution",
          title: "Guardar más no significa atender mejor",
          text: "Pide y conserva solo la información necesaria para el trabajo. La finalidad, retención y derechos aplicables dependen del contexto y de la normativa correspondiente.",
        }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿Todo negocio necesita un CRM?", answer: "No. Si una agenda o lista simple permite recuperar el contexto y atender los pendientes, puedes empezar ahí y reevaluar cuando deje de ser fiable." },
            { question: "¿Una hoja de cálculo es un CRM?", answer: "Puede resolver parte del seguimiento, aunque no tenga las funciones de un sistema especializado. Lo importante es si sostiene el proceso real." },
            { question: "¿Un CRM hará el seguimiento automáticamente?", answer: "No por definición. Algunas herramientas permiten tareas o automatizaciones, pero alguien debe configurar reglas, revisar excepciones y mantener los datos." },
            { question: "¿Cómo se guardan mis datos en el CRM de Vecidya?", answer: "Los registros se guardan en una subcuenta asignada a tu organización. Puedes importar y exportar datos. Al finalizar la licencia tienes 30 días para copiarlos; después se elimina la subcuenta. Vecidya no conserva una copia paralela." },
          ],
        }],
      },
      {
        heading: "Fuentes y orientación adicional",
        paragraphs: ["Estas referencias ayudan a pensar en privacidad y organización; no sustituyen requisitos aplicables a cada país."],
        blocks: [{
          type: "sources",
          items: [
            { label: "NIST Privacy Framework", url: "https://www.nist.gov/privacy-framework", scope: "Marco voluntario para identificar y gestionar riesgos de privacidad." },
            { label: "ICO — Advice for small and medium organisations", url: "https://ico.org.uk/for-organisations/advice-for-small-organisations/", scope: "Orientación para organizaciones pequeñas en el contexto regulatorio del Reino Unido." },
          ],
        }, {
          type: "summary",
          items: [
            "Organiza primero el contexto y los próximos pasos.",
            "Usa una herramienta más compleja solo cuando el método sencillo deje de sostener el trabajo.",
            "Guarda únicamente los datos necesarios y controla quién puede acceder.",
          ],
        }],
      },
    ],
  },
  {
    slug: "como-probar-un-asistente-de-ia-con-supervision-humana",
    category: "Inteligencia Artificial",
    title: "Cómo probar un asistente de IA con supervisión humana",
    intro: "Aprende a preparar una fuente confiable, detectar respuestas inventadas y probar un asistente con límites claros antes de usarlo con personas reales.",
    excerpt: "Una guía para probar IA en pequeño, revisar errores y decidir cuándo debe intervenir una persona.",
    enPocasPalabras: [
      "Empieza con una tarea pequeña y una fuente de información revisada.",
      "Comprueba respuestas inventadas, datos sensibles y preguntas fuera de alcance.",
      "Mantén revisión humana y detén la prueba si los errores superan lo aceptable.",
    ],
    image: "/assets/learn/diagram-ai.svg",
    imageAlt: "Un asistente de IA responde desde una fuente revisada y deriva los casos dudosos a una persona.",
    relatedSlugs: ["que-puede-hacer-una-inteligencia-artificial-por-un-negocio"],
    editorialDraft: false,
    cta: {
      label: "Revisar mis necesidades",
      to: "/diagnostico",
      copy: "Identifica primero el problema y comprueba qué necesitas antes de contratar herramientas.",
    },
    sections: [
      {
        heading: "Empieza por una tarea pequeña",
        paragraphs: [
          "Un asistente de IA no necesita empezar atendiendo todo. Elige una tarea de bajo riesgo, como responder preguntas sobre horario, ubicación o servicios que el negocio ya puede confirmar.",
          "Si el proceso actual es confuso, ordénalo primero. La IA puede acelerar una respuesta, pero no corrige una fuente desactualizada ni una regla que nadie entiende.",
        ],
        blocks: [{
          type: "callout",
          tone: "tip",
          title: "Prueba una pregunta concreta",
          text: "Define qué preguntas puede responder, qué información puede usar y en qué casos debe pasar la conversación a una persona.",
        }],
      },
      {
        heading: "Prepara una fuente que puedas revisar",
        paragraphs: [
          "No cargues documentos por cantidad. Empieza con información vigente y con una persona responsable de mantenerla.",
        ],
        blocks: [{
          type: "steps",
          label: "Preparación básica",
          items: [
            { title: "Delimita el alcance", detail: "Escribe qué temas puede responder y cuáles quedan fuera." },
            { title: "Elige la fuente", detail: "Usa información confirmada, como horarios, servicios y condiciones públicas." },
            { title: "Quita datos innecesarios", detail: "No incluyas historiales completos, credenciales ni información sensible si la tarea no los necesita." },
            { title: "Añade excepciones", detail: "Indica qué debe hacer cuando falta una respuesta o los datos se contradicen." },
          ],
        }],
      },
      {
        heading: "Una respuesta segura no siempre es correcta",
        paragraphs: [
          "Los modelos generativos pueden redactar con seguridad una afirmación falsa, completar vacíos con suposiciones o repetir información antigua. Esa posibilidad suele llamarse respuesta inventada o confabulación.",
          "La revisión debe centrarse en hechos que importan: nombres, fechas, precios, disponibilidad, condiciones y cualquier compromiso con una persona.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Comprueba la respuesta contra la fuente original.",
            "Prueba preguntas ambiguas, fuera de alcance y con datos incompletos.",
            "Registra qué errores se repiten y qué preguntas terminan en revisión humana.",
            "No permitas que el asistente confirme algo que la fuente no puede demostrar.",
          ],
        }],
      },
      {
        heading: "Ejemplo: una academia prueba antes de atender a personas reales",
        paragraphs: ["Caso hipotético para convertir una prueba de IA en pasos fáciles de comprobar."],
        blocks: [{
          type: "example",
          title: "Preguntas frecuentes con límites visibles",
          hypothetical: true,
          context: "Una academia recibe preguntas sobre horarios, ubicación y cómo solicitar información de los cursos.",
          problem: "El equipo teme que el asistente invente precios, plazas disponibles o condiciones que cambian según el curso.",
          approach: "Prepara una fuente corta con información pública revisada y prueba el asistente únicamente con preguntas de ensayo.",
          actions: [
            "Escribir preguntas frecuentes y respuestas confirmadas.",
            "Añadir preguntas que no pueda resolver para comprobar que las transfiere.",
            "Revisar cada respuesta y registrar los errores antes de usarlo con personas reales.",
            "Detener o reducir el alcance si aparecen respuestas inventadas o datos que no deberían compartirse.",
          ],
          lesson: "Una prueba útil no demuestra que la IA sirve para todo. Comprueba una tarea, sus límites y la capacidad del equipo para supervisarla.",
        }],
      },
      {
        heading: "Protege los datos y define quién revisa",
        paragraphs: [
          "Antes de introducir datos, revisa qué servicio los procesa, quién puede acceder y qué condiciones de almacenamiento o retención aplica. La respuesta depende del proveedor y de la jurisdicción.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Usa la mínima información necesaria y elimina datos identificables cuando no hagan falta.",
            "No introduzcas contraseñas ni información sensible sin una razón y evaluación claras.",
            "Define quién revisa errores, actualiza la fuente y puede detener la prueba.",
            "Consulta las obligaciones de privacidad aplicables a tu caso; esta guía no sustituye asesoría legal.",
          ],
        }, {
          type: "callout",
          tone: "caution",
          title: "No asumas privacidad por defecto",
          text: "Revisa las condiciones del producto y la configuración concreta antes de introducir información de clientes o del negocio.",
        }],
      },
      {
        heading: "Cómo decidir si el piloto continúa",
        paragraphs: [
          "Una prueba piloto sirve para aprender sobre una tarea concreta. Compara lo observado con la forma de trabajar anterior y con los límites que fijaste antes de empezar.",
        ],
        blocks: [{
          type: "summary",
          items: [
            "Calidad: revisa cuántas respuestas coinciden con la fuente y cuántas necesitan corrección.",
            "Límites: comprueba si reconoce preguntas fuera de alcance y las deriva correctamente.",
            "Trabajo real: cuenta también el tiempo de revisión, mantenimiento y corrección.",
            "Decisión: continúa, ajusta o detén la prueba según la evidencia; no amplíes solo porque algunas respuestas salieron bien.",
          ],
        }],
      },
      {
        heading: "Fuentes y alcance",
        paragraphs: [
          "Estas referencias ayudan a identificar riesgos y controles de una prueba de IA. No garantizan resultados ni sustituyen requisitos legales locales.",
        ],
        blocks: [{
          type: "sources",
          items: [
            { label: "NIST AI Risk Management Framework (AI RMF 1.0)", url: "https://www.nist.gov/itl/ai-risk-management-framework", scope: "Marco voluntario para gestionar riesgos durante el diseño, uso y evaluación de sistemas de IA." },
            { label: "NIST AI 600-1: Generative Artificial Intelligence Profile", url: "https://doi.org/10.6028/NIST.AI.600-1", scope: "Describe riesgos de IA generativa como confabulación, privacidad y relación entre personas y sistemas." },
            { label: "ICO — Guidance on AI and data protection", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/", scope: "Orientación del Reino Unido sobre IA y protección de datos; comprueba las reglas aplicables en tu jurisdicción." },
          ],
        }],
      },
    ],
  },
  {
    slug: "que-puede-hacer-una-inteligencia-artificial-por-un-negocio",
    category: "Inteligencia Artificial",
    title: "¿Qué puede hacer una inteligencia artificial por un negocio?",
    intro: "La IA puede ayudarte a preparar borradores, ordenar información o responder preguntas repetidas. También puede equivocarse, así que empieza por una tarea pequeña que una persona pueda revisar.",
    excerpt: "Conoce usos sencillos de IA, qué límites poner y cuándo una decisión debe seguir en manos humanas.",
    enPocasPalabras: [
      "Usa IA para apoyar tareas concretas, no para sustituir decisiones que necesitan contexto.",
      "Trabaja con información confirmada y revisa nombres, cifras, fechas y condiciones.",
      "Empieza en pequeño y no compartas datos sensibles si la tarea no los necesita.",
    ],
    image: "/assets/learn/diagram-ai.svg",
    imageAlt: "Una consulta se convierte en un borrador de IA que una persona revisa antes de responder o transferir",
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar procesos y prioridades digitales; no instala asistentes ni activa herramientas de IA." },
    relatedSlugs: ["como-probar-un-asistente-de-ia-con-supervision-humana"],
    sections: [
      {
        heading: "Qué significa usar IA en un negocio",
        paragraphs: [
          "Inteligencia artificial es un nombre amplio para sistemas que procesan información y producen resultados como clasificaciones, recomendaciones o contenido.",
          "En un negocio pequeño, un uso razonable puede ser pedir un borrador o clasificar preguntas. La persona responsable sigue comprobando la información y decide qué hacer con el resultado.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "Inteligencia artificial", definition: "Sistemas que procesan datos para producir resultados con distintos métodos y grados de autonomía." },
            { term: "IA generativa", definition: "Sistemas que producen contenido nuevo, como texto o imágenes, a partir de instrucciones y contexto." },
            { term: "Asistente", definition: "Una interfaz que usa IA para ayudar en tareas concretas; sus capacidades dependen de las fuentes, permisos y configuración." },
          ],
        }, {
          type: "callout",
          tone: "caution",
          title: "Una respuesta fluida puede estar equivocada",
          text: "Comprueba hechos, fechas, precios y compromisos antes de usar un resultado. La seguridad con la que escribe un sistema no demuestra que la información sea verdadera.",
        }],
      },
      {
        heading: "Tareas pequeñas donde puede ayudar",
        paragraphs: ["Empieza por trabajos que una persona pueda revisar rápido y que no conviertan una sugerencia en una decisión irreversible."],
        blocks: [{
          type: "list",
          items: [
            "Preparar un primer borrador de respuesta con información confirmada.",
            "Resumir un texto que el equipo ya tiene permitido utilizar.",
            "Proponer variantes de una publicación para que alguien elija y corrija.",
            "Clasificar preguntas frecuentes antes de pasarlas a la persona responsable.",
            "Extraer una lista de tareas de notas que no contengan datos sensibles innecesarios.",
          ],
        }],
      },
      {
        heading: "Qué no conviene delegar sin supervisión",
        paragraphs: [
          "Una IA no debería aprobar por sí sola precios, descuentos, disponibilidad, decisiones sobre personas, seguridad o derechos. Tampoco debe inventar datos que falten.",
          "Si la tarea afecta dinero, privacidad, salud, seguridad o un compromiso con otra persona, aumenta la intervención humana y conserva la fuente original.",
        ],
      },
      {
        heading: "Ejemplo: responder preguntas frecuentes sin inventar",
        paragraphs: ["Caso hipotético para mostrar un uso limitado y revisable."],
        blocks: [{
          type: "example",
          title: "Un taller recibe siempre las mismas preguntas",
          hypothetical: true,
          context: "El taller recibe mensajes sobre horario, ubicación y tipos de servicio mientras el equipo está trabajando.",
          problem: "Responder cada pregunta interrumpe el trabajo, pero una IA podría inventar un precio o confirmar una reparación que nadie ha evaluado.",
          approach: "El negocio usa una hoja o fuente de información revisada con horarios, ubicación y servicios. La IA prepara una respuesta solo con esa fuente y transfiere lo que no pueda resolver.",
          actions: [
            "Una persona revisa la información que puede usar el asistente.",
            "Se prueban preguntas claras, ambiguas y fuera de alcance.",
            "Una persona verifica las respuestas antes de ampliar el uso.",
            "Los precios, diagnósticos y compromisos siguen requiriendo revisión humana.",
          ],
          lesson: "La IA puede ahorrar redacción dentro de límites claros; no necesita fingir conocimiento cuando la fuente no tiene la respuesta.",
        }],
      },
      {
        heading: "Cómo hacer una primera prueba",
        paragraphs: [
          "Usa información pública o datos de ensayo. Define qué debe responder, qué debe rechazar y quién revisa. La guía relacionada «Cómo probar un asistente de IA con supervisión humana» profundiza en pilotos, errores y privacidad.",
        ],
        blocks: [{
          type: "steps",
          label: "Prueba inicial",
          items: [
            { title: "Elige una tarea", detail: "Que sea frecuente, de bajo riesgo y fácil de revisar." },
            { title: "Prepara una fuente", detail: "Usa información vigente y asigna quién la mantiene." },
            { title: "Prueba errores", detail: "Incluye preguntas ambiguas, datos faltantes y casos fuera de alcance." },
            { title: "Revisa el resultado", detail: "Comprueba qué corrigió la persona y si el sistema reconoce cuándo no sabe." },
          ],
        }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿La IA puede responder a clientes sin revisión?", answer: "Depende del riesgo y del alcance. Empieza con límites estrictos y una fuente autorizada; una persona debe revisar las decisiones o compromisos importantes." },
            { question: "¿Puedo copiar conversaciones de clientes para entrenar un asistente?", answer: "No por defecto. Revisa autorización, privacidad y condiciones del proveedor; empieza con datos anonimizados o sintéticos cuando sea posible." },
            { question: "¿Qué opciones de inteligencia artificial ofrece Vecidya?", answer: "IA Conversacional e IA de Voz son complementos opcionales para Barrio o Ciudad; no se activan por defecto. Apoyan respuestas, clasificación inicial o atención por voz." },
            { question: "¿Cómo se cobra el consumo de IA?", answer: "El cargo mensual va separado del consumo del proveedor: tokens (unidades de texto procesado) y, para voz, minutos/telefonía. Se acuerdan alcance, límites de uso y supervisión." },
          ],
        }],
      },
      {
        heading: "Fuentes y orientación adicional",
        paragraphs: ["Estos marcos ayudan a identificar riesgos y preguntas; no garantizan resultados ni sustituyen requisitos legales locales."],
        blocks: [{
          type: "sources",
          items: [
            { label: "NIST AI Risk Management Framework (AI RMF 1.0)", url: "https://www.nist.gov/itl/ai-risk-management-framework", scope: "Marco voluntario para gestionar riesgos durante diseño, uso y evaluación de sistemas de IA." },
            { label: "NIST AI 600-1 — Generative AI Profile", url: "https://doi.org/10.6028/NIST.AI.600-1", scope: "Perfil sobre riesgos de IA generativa como confabulación, privacidad y relación entre personas y sistemas." },
            { label: "ICO — Guidance on AI and data protection", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/", scope: "Orientación del Reino Unido sobre IA y protección de datos; verifica las reglas de tu jurisdicción." },
          ],
        }, {
          type: "summary",
          items: [
            "Elige una tarea pequeña y fácil de revisar.",
            "Usa información confirmada y protege los datos.",
            "Mantén decisiones importantes bajo responsabilidad humana.",
          ],
        }],
      },
    ],
  },
  {
    slug: "publicidad-digital-como-preparar-una-primera-campana",
    category: "Negocios digitales",
    title: "Publicidad digital: cuándo anunciarte y cómo preparar una primera campaña",
    intro: "Una campaña no arregla una oferta confusa. Antes de pagar por alcance, define qué quieres probar, prepara el destino y decide qué señal revisarás.",
    excerpt: "Aprende a preparar una prueba publicitaria pequeña sin confundir clics con clientes ni asumir resultados.",
    enPocasPalabras: [
      "Los anuncios compran distribución, no ventas garantizadas.",
      "Comprueba oferta, destino, presupuesto y capacidad de respuesta antes de lanzar.",
      "Mide una prueba limitada y decide después si continuar, ajustar o parar.",
    ],
    image: "/assets/learn/diagram-presence-digital.svg",
    imageAlt: "Canales digitales conectados para informar y recibir consultas",
    relatedSlugs: ["antes-de-hacer-publicidad-organiza-tu-presencia-digital", "analitica-web-que-medir-en-tu-negocio"],
    editorialDraft: false,
    cta: { label: "Revisar mi presencia digital", to: "/diagnostico", copy: "Ordena primero la información y los canales de tu negocio antes de invertir." },
    sections: [
      {
        heading: "Qué estás comprando cuando pagas publicidad",
        paragraphs: [
          "La presencia orgánica reúne contenidos y perfiles que mantienes sin pagar por cada impresión o clic. La publicidad pagada compra distribución dentro de una plataforma.",
          "Google Ads y Meta Ads permiten configurar objetivos, audiencias, ubicaciones y presupuestos, pero la entrega y el resultado dependen de muchas condiciones. Pagar no garantiza ventas, clientes ni una posición orgánica.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "Objetivo", definition: "La acción que quieres observar, como recibir consultas sobre un servicio concreto." },
            { term: "Presupuesto", definition: "El límite de gasto que el negocio puede asumir como prueba." },
            { term: "Página de destino", definition: "La página o contenido al que llega la persona después de pulsar el anuncio." },
            { term: "Indicador", definition: "Una señal que ayuda a revisar la prueba, sin convertirla automáticamente en una venta o beneficio." },
          ],
        }],
      },
      {
        heading: "Qué revisar antes de Google Ads o Meta Ads",
        paragraphs: [
          "Una campaña funciona mejor como experimento acotado cuando la oferta ya existe y el negocio puede responder. Si todavía hay información contradictoria o contacto roto, corrige eso primero.",
        ],
        blocks: [{
          type: "steps",
          label: "Preparación mínima antes de lanzar",
          items: [
            { title: "Define una oferta", detail: "Anuncia un servicio, producto o actividad que puedas explicar y confirmar." },
            { title: "Elige una acción", detail: "Decide qué debería hacer la persona: preguntar, reservar, llamar o comprar, según lo que realmente puedas atender." },
            { title: "Comprueba el destino", detail: "Abre la página de destino desde un móvil y verifica que coincide con el anuncio y que el contacto funciona." },
            { title: "Fija presupuesto y periodo", detail: "Usa un límite que el negocio pueda asumir sin depender de recuperar el gasto." },
            { title: "Define indicadores", detail: "Anota qué señales revisarás y qué decisión tomarás si el resultado no justifica continuar." },
          ],
        }],
      },
      {
        heading: "Prepara una página de destino sencilla",
        paragraphs: [
          "La página de destino debe continuar la misma promesa del anuncio. Si anuncias una clase, un servicio o un producto, la persona debería encontrar esa información sin tener que adivinar dónde está.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Explica qué ofreces y para quién.",
            "Muestra condiciones importantes, zona, disponibilidad o límites que puedas confirmar.",
            "Usa una acción principal clara y funcional.",
            "Pide solo los datos necesarios.",
            "Comprueba carga, lectura y formulario desde un móvil.",
          ],
        }, {
          type: "callout",
          tone: "caution",
          title: "No pagues por enviar personas a una ruta rota",
          text: "Si el formulario falla, el teléfono no se atiende o la oferta no está clara, más tráfico puede aumentar el problema en vez de resolverlo.",
        }],
      },
      {
        heading: "Indicadores básicos para revisar la prueba",
        paragraphs: [
          "Elige indicadores relacionados con tu objetivo y registra el periodo. No atribuyas todos los cambios a la campaña si también cambiaron horarios, temporada, precio o disponibilidad.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Impresiones o vistas: indican exposición, no compras.",
            "Clics: muestran interacción con el anuncio, no intención confirmada.",
            "Consultas útiles: mensajes, llamadas o formularios que sí corresponden a la oferta.",
            "Atención: cuántas consultas pudo responder el negocio y qué errores aparecieron.",
            "Resultado y coste: ventas o reservas confirmadas cuando puedas relacionarlas de forma razonable con la prueba.",
          ],
        }],
      },
      {
        heading: "Ejemplo: una campaña con una sola pregunta",
        paragraphs: ["Caso hipotético; los resultados no representan una promesa ni una campaña real."],
        blocks: [{
          type: "example",
          title: "Una librería prueba interés por un club de lectura",
          hypothetical: true,
          context: "La librería ya tiene horarios y contacto actualizados y quiere saber si una campaña local genera consultas sobre un club de lectura.",
          problem: "Si mide solo clics, no sabrá si las personas entendieron la actividad ni si el equipo pudo responder.",
          approach: "Define un periodo y presupuesto pequeños, una página de destino con la información confirmada y un indicador principal: consultas identificables sobre el club.",
          actions: [
            "Comprobar la página y el contacto desde un teléfono.",
            "Lanzar la campaña con presupuesto y fechas definidos.",
            "Registrar consultas atendidas además de impresiones y clics.",
            "Pausar o ajustar si la información cambia, el contacto falla o el resultado no justifica continuar.",
          ],
          lesson: "La campaña sirve para aprender sobre una hipótesis concreta. Un aumento de clics no demuestra por sí solo ventas o rentabilidad.",
        }],
      },
      {
        heading: "Cuándo no necesitas anuncios todavía",
        paragraphs: [
          "Si la oferta no está clara, el negocio no puede atender más consultas o los canales muestran datos distintos, puedes mejorar primero sin anuncios.",
          "También puedes detener una campaña. Haber invertido una cantidad no obliga a seguir gastando si la prueba no responde a la pregunta que querías resolver.",
        ],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿Cuánto presupuesto necesito?", answer: "No hay una cifra universal. Define un límite que puedas asumir como prueba y revisa las condiciones de la plataforma y de tu mercado." },
            { question: "¿Qué plataforma es mejor?", answer: "Depende de dónde esté tu público, qué acción buscas y qué formatos puedes mantener. No elijas solo porque otra empresa use esa plataforma." },
            { question: "¿Una conversión publicitaria registrada equivale a una venta?", answer: "No siempre. Una conversión publicitaria es una acción importante configurada para medir una campaña; puede ser una consulta, una reserva u otro evento, no necesariamente una venta." },
            { question: "¿Debo aumentar presupuesto si hay muchos clics?", answer: "No automáticamente. Revisa consultas, capacidad de atención, resultados confirmados y coste antes de ampliar." },
          ],
        }],
      },
      {
        heading: "Fuentes oficiales y alcance",
        paragraphs: ["Estas fuentes explican políticas y herramientas de plataformas. No garantizan aprobación ni resultados comerciales."],
        blocks: [{
          type: "sources",
          items: [
            { label: "Destination requirements — Google Ads Policies", url: "https://support.google.com/adspolicy/answer/6368661", scope: "Política de Google Ads sobre destinos funcionales y coherentes." },
            { label: "Meta — How to choose the right ad objective", url: "https://www.facebook.com/business/help/1438417719786914", scope: "Ayuda oficial de Meta sobre objetivos de campaña y configuraciones posibles." },
            { label: "Meta Advertising Standards", url: "https://www.facebook.com/business/help/488043719226449", scope: "Estándares publicitarios de Meta; las reglas pueden cambiar." },
            { label: "Google Analytics — Set up a key event", url: "https://support.google.com/analytics/answer/12966437", scope: "Ejemplo oficial para registrar eventos clave; medir un evento no prueba causalidad comercial." },
            { label: "Google Analytics — Privacy controls", url: "https://support.google.com/analytics/answer/9019185", scope: "Controles del producto para recopilación y retención; no determina qué obligación legal aplica a un caso concreto." },
          ],
        }, {
          type: "summary",
          items: [
            "Define qué quieres probar antes de elegir la plataforma.",
            "Prepara destino, presupuesto e indicadores antes de lanzar.",
            "Revisa resultados y decide si continuar, ajustar o detener la prueba.",
          ],
        }],
      },
    ],
  },
  {
    slug: "como-mantener-actualizada-y-confiable-tu-presencia-digital",
    category: "Negocios digitales",
    title: "Cómo mantener actualizada y confiable tu presencia digital",
    intro: "Aprende a revisar datos comerciales, contacto, reseñas, accesibilidad y seguridad en los canales que ya utilizas.",
    excerpt: "Crea una rutina para mantener horarios, contacto, reseñas, accesibilidad y seguridad coherentes en los canales que sí atiendes.",
    enPocasPalabras: ["Comprueba que horarios, servicios y contacto coincidan entre canales.","No inventes reseñas ni afirmaciones para ganar confianza.","Revisa accesibilidad, privacidad y seguridad antes de ampliar tu presencia."],
    image: "/assets/learn/diagram-presence-digital.svg",
    imageAlt: "Sitio web, perfil de empresa y red social muestran de forma coherente la oferta, la zona de atención y el contacto.",
    relatedSlugs: ["antes-de-hacer-publicidad-organiza-tu-presencia-digital"],
    editorialDraft: false,
    sections: [
      {
        heading: "Qué información debe estar al día",
        paragraphs: [
          "No todos los canales tienen que usar exactamente las mismas palabras, pero los datos importantes deben ser compatibles. Si un sitio dice una cosa y una ficha pública dice otra, el visitante no sabe cuál creer."
        ],
        blocks: [
          {
            type: "list",
            items: [
              "Nombre comercial y una descripción clara de lo que haces.",
              "Horario vigente, incluidas excepciones que ya conozcas.",
              "Dirección o zona de servicio, según cómo atiendas.",
              "Teléfono, correo, mensajería y enlaces que realmente utilizas.",
              "Servicios, productos, precios o condiciones cuando los publiques."
            ]
          }
        ]
      },
      {
        heading: "Elige una referencia y una persona responsable",
        paragraphs: [
          "La información se mantiene mejor cuando sabes dónde consultar el dato correcto y quién comunica un cambio. No tiene que ser una plataforma compleja: puede ser una ficha interna controlada o una lista breve."
        ],
        blocks: [
          {
            type: "steps",
            label: "Un procedimiento sencillo de actualización",
            items: [
              {
                title: "Haz un inventario de los canales activos",
                detail: "Incluye tu web, perfil de empresa, redes, directorios y enlaces que todavía compartes en tarjetas o mensajes."
              },
              {
                title: "Registra el dato vigente",
                detail: "Anota el horario, teléfono, dirección o zona de servicio y quién puede confirmar cada cambio."
              },
              {
                title: "Actualiza los canales que mantienes",
                detail: "Corrige primero los datos que pueden causar una llamada perdida, una visita equivocada o una consulta sin respuesta."
              },
              {
                title: "Comprueba y deja constancia",
                detail: "Abre cada destino como visitante y registra dónde se hizo el cambio, sobre todo si otra persona debe revisarlo."
              }
            ]
          }
        ]
      },
      {
        heading: "Prueba la experiencia como visitante",
        paragraphs: [
          "No basta con ver la información en el panel de administración. Recorre la ruta que seguiría una persona que todavía no conoce tu negocio."
        ],
        blocks: [
          {
            type: "list",
            items: [
              "Abre la página desde un teléfono y, cuando sea posible, sin iniciar sesión.",
              "Pulsa los enlaces de llamada, mensaje, mapa, reserva o solicitud de presupuesto.",
              "Comprueba que el destino corresponda con el texto del botón y que el formulario confirme el envío.",
              "Lee el contenido en pantalla pequeña: usa títulos claros, texto legible y enlaces que expliquen adónde llevan.",
              "Confirma que alguien pueda recibir y atender las consultas que el canal promete aceptar."
            ]
          },
          {
            type: "callout",
            tone: "tip",
            title: "Una comprobación vale más que un botón bonito",
            text: "Si el botón dice «Solicitar presupuesto», debe permitir enviar una solicitud real. Corrige los destinos rotos y retira los canales que ya no puedes atender."
          }
        ]
      },
      {
        heading: "Accesibilidad, privacidad y seguridad básicas",
        paragraphs: ["Una presencia útil debe poder consultarse y utilizarse en distintos dispositivos y por personas con distintas necesidades. La lista siguiente recoge comprobaciones iniciales inspiradas en las pautas W3C; no es una auditoría formal ni una certificación WCAG 2.2 AA."],
        blocks: [{ type: "list", items: [
          "Comprueba que el texto tenga tamaño legible, contraste suficiente y no dependa solo del color para indicar una acción o estado.",
          "Usa títulos descriptivos, nombres comprensibles para enlaces y botones, texto alternativo útil para imágenes informativas y subtítulos cuando el video contenga información hablada relevante.",
          "Prueba teclado y móvil: que los controles puedan enfocarse, no queden tapados y funcionen sin gestos difíciles; evita páginas que obliguen a desplazarse horizontalmente para leer texto normal.",
          "Publica solo los datos personales necesarios para atender. No expongas documentos internos, listas de clientes, números privados ni información sensible en páginas o imágenes.",
          "Usa conexiones seguras cuando se envíen datos, protege las cuentas con contraseñas únicas y autenticación disponible, limita permisos y elimina accesos que ya no se necesiten.",
          "Antes de instalar herramientas de medición (analítica), píxeles de seguimiento o formularios, identifica qué datos recogen, qué proveedor los procesa, cuánto tiempo se guardan y qué avisos, opciones o base legal requiere tu jurisdicción.",
        ] }, { type: "callout", tone: "caution", title: "Las reglas legales dependen del caso", text: "Las políticas de anuncios de Google o Meta son reglas de sus plataformas; no sustituyen la legislación sobre privacidad, cookies, accesibilidad, promociones o comunicaciones comerciales de tu país." }],
      },
      {
        heading: "Rutina de mantenimiento breve",
        paragraphs: [
          "Elige una frecuencia que puedas cumplir y vuelve a revisar los datos cuando ocurra un cambio importante, como un nuevo horario, teléfono, servicio o zona atendida. No existe un calendario universal que sirva para todos los negocios."
        ],
        blocks: [
          {
            type: "summary",
            items: [
              "Revisa los datos esenciales y los enlaces que el público usa para contactarte.",
              "Actualiza primero los canales activos y retira los que ya no puedes mantener.",
              "Asigna una persona responsable y comprueba los cambios como visitante."
            ]
          }
        ]
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{
          type: "summary",
          items: [
            "Haz una lista de los canales que realmente mantienes y asigna quién actualiza cada uno.",
            "Corrige primero los datos que pueden provocar una visita, llamada o consulta equivocada.",
            "Prueba contacto, accesibilidad y seguridad como visitante antes de abrir otro canal.",
          ],
        }],
      },
      {
        heading: "Fuentes y alcance",
        paragraphs: [
          "Estas fuentes ayudan a mantener información pública útil y comprensible. La guía no es una auditoría técnica ni una evaluación formal de accesibilidad; los requisitos concretos dependen de la actividad y la jurisdicción."
        ],
        blocks: [
          {
            type: "sources",
            items: [
              {
                label: "Google Business Profile Help — Edit your Business Profile",
                url: "https://support.google.com/business/answer/3039617",
                scope: "Ayuda oficial para editar información, horarios, teléfono, web, descripción y servicios. Elegibilidad y disponibilidad pueden variar."
              },
              {
                label: "Google Search Central — SEO Starter Guide",
                url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
                scope: "Recomendaciones para que el contenido, los títulos y los enlaces sean comprensibles y útiles; no garantiza posiciones de búsqueda."
              },
              {
                label: "W3C WAI — Writing for Web Accessibility",
                url: "https://www.w3.org/WAI/tips/writing/",
                scope: "Consejos para organizar la información, usar títulos claros y escribir instrucciones fáciles de comprender; no certifica la accesibilidad de un sitio."
              }
            ]
          }
        ]
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [
          {
            type: "summary",
            items: [
              "Haz una lista de tus canales públicos y de los datos que podrían estar desactualizados.",
              "Corrige nombre, horario, ubicación y contacto antes de ampliar tu presencia.",
              "Comprueba los enlaces y asigna a alguien la siguiente revisión."
            ]
          }
        ]
      }
    ]
  },
  {
    slug: "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
    category: "Negocios digitales",
    title: "Antes de hacer publicidad, organiza tu presencia digital",
    intro: "Antes de pagar anuncios, comprueba algo más básico: si una persona llega hoy a tus canales, ¿entiende qué haces, a quién atiendes y cómo contactarte?",
    excerpt: "Ordena la información esencial, elige canales que puedas mantener y comprueba el recorrido de contacto antes de invertir en publicidad.",
    enPocasPalabras: [
      "Explica con claridad qué ofreces, a quién atiendes y en qué zona trabajas.",
      "Mantén coherentes horarios, contacto y servicios en los canales que realmente atiendes.",
      "La publicidad puede dar visibilidad, pero no arregla información contradictoria ni un contacto que no funciona.",
    ],
    image: "/assets/learn/diagram-presence-digital.svg",
    imageAlt: "Lista de preparación que conecta una oferta clara, información correcta, contacto y capacidad de respuesta antes de invertir en anuncios.",
    relatedSlugs: [
      "publicidad-digital-como-preparar-una-primera-campana",
      "como-mantener-actualizada-y-confiable-tu-presencia-digital",
      "perfil-empresa-google-completar-y-mantener-actualizado",
      "redes-sociales-o-pagina-web-que-necesita-tu-negocio",
      "analitica-web-que-medir-en-tu-negocio",
      "como-responder-la-primera-consulta-de-un-cliente",
      "como-pedir-resenas-reales-y-responder-criticas"
    ],
    cta: {
      label: "Revisar mi punto de partida",
      to: "/diagnostico",
      copy: "Usa esta lista para identificar qué necesitas corregir antes de invertir en anuncios."
    },
    editorialDraft: false,
    sections: [
      {
        heading: "Qué es una presencia digital útil",
        paragraphs: [
          "Tu presencia digital es el conjunto de lugares donde una persona puede reconocer tu negocio, entender qué ofreces y saber cómo seguir. Puede incluir un sitio web, un Perfil de Empresa, una red social o un directorio.",
          "Tener más canales no significa tener más confianza. Ningún canal garantiza visibilidad, reputación, consultas ni ventas. Lo importante es que la información principal sea correcta y que exista una forma real de contacto.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "Información básica", definition: "Nombre, actividad, público, ubicación o zona de servicio, horarios, contacto y servicios que puedes confirmar." },
            { term: "Canal principal", definition: "Lugar que el negocio revisa y mantiene de verdad, no una cuenta abierta que nadie atiende." },
            { term: "Coherencia", definition: "Que los datos importantes no se contradigan entre el sitio web, el Perfil de Empresa y las redes sociales activas." },
          ],
        }, {
          type: "callout",
          tone: "tip",
          title: "Empieza por lo que una persona necesita saber",
          text: "Antes de pensar en diseño, seguidores o anuncios, comprueba si alguien puede entender qué haces, si atiendes su zona y qué debe hacer para contactarte.",
        }],
      },
      {
        heading: "Ordena la información antes de elegir más canales",
        paragraphs: [
          "Escribe primero una versión breve y verificable de tu negocio. Así podrás actualizar los canales sin inventar una descripción distinta en cada uno.",
        ],
        blocks: [{
          type: "steps",
          label: "Base mínima de presencia digital",
          items: [
            { title: "Explica qué haces", detail: "Usa palabras concretas sobre el servicio o producto. Evita frases que suenan bien pero no ayudan a entender la actividad." },
            { title: "Di a quién atiendes", detail: "Aclara el público o tipo de necesidad que puedes atender cuando eso ayude a evitar consultas equivocadas." },
            { title: "Define la zona de servicio", detail: "Indica dónde atiendes, si recibes personas en un local o si trabajas a domicilio o por internet." },
            { title: "Confirma horarios y contacto", detail: "Publica solo teléfonos, mensajes, formularios y horarios que alguien revise y pueda mantener." },
            { title: "Nombra un responsable", detail: "Decide quién corrige la información cuando cambien horarios, servicios, ubicación o canales." },
          ],
        }],
      },
      {
        heading: "Elige canales que puedas mantener",
        paragraphs: [
          "No necesariamente necesitas sitio web, Perfil de Empresa y varias redes sociales al mismo tiempo. Elige según cómo te buscan las personas, qué puedes mantener y qué función cumple cada canal.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Un sitio web puede reunir información estable y ofrecer una referencia propia.",
            "Un Perfil de Empresa puede ayudar a mostrar datos locales cuando el negocio es elegible y mantiene la ficha actualizada.",
            "Una red social puede mostrar actividad y trabajos recientes, pero exige revisar mensajes y datos del perfil.",
            "Un canal sin responsable puede crear más confusión que utilidad si conserva horarios, precios o enlaces antiguos.",
          ],
        }],
      },
      {
        heading: "Ejemplo hipotético: un taller piensa en anunciarse",
        paragraphs: ["Este caso es inventado y sirve para separar un problema de presencia de una decisión publicitaria."],
        blocks: [{
          type: "example",
          title: "El taller Rueda Clara quiere lanzar una campaña",
          hypothetical: true,
          context: "El taller tiene un sitio web sencillo, un perfil público y una red social. Quiere reservar presupuesto para una campaña local.",
          problem: "La información está incompleta y se contradice: un canal muestra un horario antiguo, otro no explica la zona de servicio y el enlace de contacto lleva a una cuenta que casi nadie revisa.",
          approach: "Antes de pagar publicidad, una persona responsable compara los canales, corrige los datos confirmados y prueba el contacto desde un móvil.",
          actions: [
            "Escribir una versión única de servicios, público, zona de servicio, horarios y contacto.",
            "Corregir las contradicciones en los canales que el taller seguirá manteniendo.",
            "Probar desde móvil que el enlace, formulario o teléfono llega a quien debe responder.",
            "Solo después decidir si la campaña tiene un objetivo y un presupuesto que el negocio puede asumir.",
          ],
          lesson: "El ejemplo no demuestra que una campaña vaya a vender más. Muestra que primero conviene reparar la ruta que recibirá a las personas.",
        }],
      },
      {
        heading: "Checklist para revisar tu presencia digital",
        paragraphs: ["Haz esta revisión cada vez que cambie una información importante y antes de una campaña."],
        blocks: [{
          type: "list",
          items: [
            "Nombre: usa la forma con la que el público reconoce realmente el negocio.",
            "Público: explica a quién atiendes cuando sea relevante para entender la oferta.",
            "Ubicación o zona: deja claro dónde prestas el servicio.",
            "Horarios: corrige horarios normales y cambios especiales.",
            "Contacto: prueba teléfono, mensajes, formulario o correo desde un móvil.",
            "Servicios: publica solo los que puedes confirmar y explica límites importantes.",
            "Coherencia: compara sitio web, Perfil de Empresa y red social para detectar contradicciones.",
            "Móvil: comprueba que la información principal se lee y que los enlaces funcionan.",
            "Accesibilidad: usa texto legible, estructura clara y alternativas para información visual importante.",
            "Privacidad: pide solo los datos necesarios y explica el uso cuando corresponda.",
            "Responsable: deja claro quién actualiza la información y quién responde consultas.",
            "Medición: decide qué señal observarás, sin confundir visitas con clientes o resultados garantizados.",
          ],
        }],
      },
      {
        heading: "Cuándo pensar en publicidad",
        paragraphs: [
          "Google Ads y Meta Ads permiten comprar distribución, pero pagar no garantiza resultados. Antes de anunciarte, comprueba que la oferta, la capacidad de respuesta y la página de destino o sitio web estén listos.",
          "Un negocio no necesita anuncios por obligación. Puede seguir mejorando su presencia sin anuncios si todavía tiene información confusa, una ruta de contacto rota o no puede atender más consultas.",
          "Evita testimonios inventados, reseñas inventadas o afirmaciones que no puedas respaldar. Si decides anunciarte, la guía relacionada de primera campaña explica presupuesto, destino e indicadores con más detalle.",
        ],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿Necesito estar en todas las redes?", answer: "No. Mantener pocos canales actualizados puede ser más útil que abrir muchos que luego muestran datos antiguos." },
            { question: "¿Necesito una página web antes de anunciarme?", answer: "No necesariamente. Depende del canal y del objetivo, pero necesitas un destino permitido, claro y funcional donde la persona pueda entender la oferta y actuar." },
            { question: "¿Un Perfil de Empresa mejora automáticamente mi posición?", answer: "No. Mantener datos correctos ayuda a informar, pero no garantiza una posición, visibilidad o cantidad de clientes." },
            { question: "¿Cómo mejoro mi reputación?", answer: "Empieza por información real, atención coherente y opiniones auténticas. No compres ni inventes reseñas o testimonios." },
            { question: "¿Qué debo medir?", answer: "Elige una señal vinculada al objetivo: por ejemplo, consultas que el negocio pudo atender. Una visita o clic no equivale por sí solo a una venta." },
          ],
        }],
      },
      {
        heading: "Fuentes oficiales y alcance",
        paragraphs: ["Las referencias siguientes ayudan a comprobar políticas y buenas prácticas. No constituyen una promesa de resultados ni sustituyen requisitos aplicables a cada país o actividad."],
        blocks: [{
          type: "sources",
          items: [
            { label: "SEO Starter Guide — Google Search Central", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", scope: "Guía oficial sobre contenido, rastreo, títulos, enlaces e imágenes; no ofrece una fórmula que garantice posiciones." },
            { label: "Edit your Business Profile — Google Business Profile Help", url: "https://support.google.com/business/answer/3039617", scope: "Ayuda oficial para mantener información del Perfil de Empresa; elegibilidad y revisión dependen del caso." },
            { label: "Destination requirements — Google Ads Policies", url: "https://support.google.com/adspolicy/answer/6368661", scope: "Política de Google Ads sobre destinos funcionales y coherentes; no garantiza aprobación ni resultados." },
            { label: "Meta — Advertising Standards", url: "https://www.facebook.com/business/help/488043719226449", scope: "Centro oficial de Meta sobre estándares publicitarios; las políticas pueden cambiar." },
            { label: "WCAG 2.2 Quick Reference — W3C WAI", url: "https://www.w3.org/WAI/WCAG22/quickref/", scope: "Referencia del W3C para criterios y técnicas de accesibilidad web." },
            { label: "Google Analytics — Set up a key event", url: "https://support.google.com/analytics/answer/12966437", scope: "Ejemplo oficial de medición en Analytics; una medición configurada no demuestra causalidad comercial." },
          ],
        }, {
          type: "summary",
          items: [
            "Explica con claridad qué haces, a quién atiendes y dónde.",
            "Mantén coherentes horarios, servicios y contacto en los canales activos.",
            "Corrige primero la base y decide después si una campaña tiene sentido.",
          ],
        }],
      },
    ],
  },
  {
    slug: "como-probar-y-supervisar-automatizaciones-sin-perder-datos",
    category: "Automatización",
    title: "Cómo probar y supervisar automatizaciones sin perder datos",
    intro: "Una automatización útil también necesita controles para duplicados, fallos, privacidad y supervisión humana.",
    excerpt: "Aprende a probar una regla, detectar duplicados, decidir cuándo interviene una persona y conservar una salida segura.",
    enPocasPalabras: [
      "Prueba casos normales, duplicados y errores antes de activar una automatización.",
      "Define qué situaciones requieren intervención humana y quién es responsable.",
      "Conserva una forma de pausar, revisar y volver al proceso manual.",
    ],
    image: "/assets/learn/diagram-automation.svg",
    imageAlt: "Una automatización pasa por pruebas, revisión humana y una salida manual antes de usarse en el trabajo real.",
    relatedSlugs: ["automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio"],
    editorialDraft: false,
    cta: {
      label: "Revisar mis necesidades",
      to: "/diagnostico",
      copy: "Identifica primero el problema y comprueba qué necesitas antes de contratar herramientas.",
    },
    sections: [
      {
        heading: "Primero prueba la regla, no la confianza",
        paragraphs: [
          "Una automatización puede funcionar muchas veces y fallar justo cuando recibe un dato incompleto, un evento repetido o varios reintentos. Por eso no basta con comprobar el caso perfecto.",
          "Antes de usarla con clientes, dinero o información importante, prepara casos de ensayo y define qué resultado esperas observar.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "Duplicado", definition: "La misma tarea o acción aparece más de una vez porque el evento se procesó de nuevo." },
            { term: "Reintento", definition: "Un nuevo intento después de un fallo. Debe comprobar primero si la acción anterior ya ocurrió." },
            { term: "Excepción", definition: "Un caso que la regla no puede resolver con seguridad y que necesita revisión." },
          ],
        }],
      },
      {
        heading: "Prueba también lo que no debería ocurrir",
        paragraphs: [
          "Un flujo seguro necesita saber cuándo continuar y cuándo detenerse. Si una regla solo se prueba con datos correctos, no sabrás cómo responde ante un duplicado, un dato vacío o una confirmación que tarda.",
        ],
        blocks: [{
          type: "steps",
          label: "Prueba mínima antes de activar",
          items: [
            { title: "Caso normal", detail: "Usa un ejemplo válido y comprueba que se produzca una sola acción." },
            { title: "Evento duplicado", detail: "Envía el mismo caso dos veces y verifica que no se duplique el efecto." },
            { title: "Dato incompleto", detail: "Quita un dato necesario y confirma que la regla se detiene o pide revisión." },
            { title: "Fallo y reintento", detail: "Simula un error y comprueba que el reintento no repita una acción que quizá ya ocurrió." },
            { title: "Proceso manual", detail: "Comprueba que el equipo pueda continuar de forma manual si decides pausar la automatización." },
          ],
        }],
      },
      {
        heading: "Cuándo debe intervenir una persona",
        paragraphs: [
          "La intervención humana no es un fracaso del sistema. Es una decisión de diseño cuando la regla no tiene suficiente contexto o la acción puede tener consecuencias importantes.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Dos datos se contradicen o falta información necesaria.",
            "No puedes confirmar si una acción anterior ya se completó.",
            "La acción afecta dinero, seguridad, datos sensibles o un compromiso con una persona.",
            "Alguien pide ayuda humana o cuestiona una respuesta automática.",
            "Aparecen errores repetidos, duplicados o excepciones que nadie está resolviendo.",
          ],
        }, {
          type: "callout",
          tone: "caution",
          title: "Pon nombre al responsable",
          text: "Antes de activar, define quién revisa excepciones, quién puede pausar la regla y qué hará el equipo mientras el flujo esté detenido.",
        }],
      },
      {
        heading: "Ejemplo: un recordatorio aparece dos veces",
        paragraphs: ["Caso hipotético para practicar duplicados, reintentos y revisión manual."],
        blocks: [{
          type: "example",
          title: "Una consulta genera dos recordatorios",
          hypothetical: true,
          context: "Un negocio crea una regla interna para avisar cuando una solicitud lleva un día sin respuesta.",
          problem: "Si el sistema vuelve a procesar el mismo disparador después de un fallo, puede crear dos tareas para una sola consulta.",
          approach: "El equipo usa una referencia estable para reconocer la solicitud y prueba un evento normal, uno repetido y uno incompleto antes de activar.",
          actions: [
            "Crear una consulta ficticia y comprobar que aparece un solo recordatorio.",
            "Repetir el mismo disparador y verificar que no se crea una segunda tarea.",
            "Simular un fallo de confirmación y revisar si la primera tarea ya existe antes del reintento.",
            "Enviar a revisión humana cualquier caso en el que no se pueda confirmar qué ocurrió.",
          ],
          lesson: "Supervisar una automatización significa comprobar también duplicados y recuperación, no solo que la regla se ejecute.",
        }],
      },
      {
        heading: "Protege datos y preferencias",
        paragraphs: [
          "Usa solo la información necesaria para la tarea y limita quién puede verla. Si un identificador interno basta, no copies conversaciones, teléfonos o datos sensibles sin necesidad.",
          "Si la automatización contacta a una persona, respeta sus preferencias y las reglas aplicables al canal. Un dato de contacto no significa por sí solo permiso ilimitado para mensajes promocionales.",
        ],
        blocks: [{
          type: "callout",
          tone: "tip",
          title: "Empieza por automatizaciones internas",
          text: "Un aviso al equipo suele ser más fácil de revisar y revertir que una acción externa. Amplía el alcance solo cuando puedas supervisar el resultado.",
        }],
      },
      {
        heading: "Cómo detener y revisar sin perder el trabajo",
        paragraphs: [
          "Antes de activar, decide cómo pausarás la regla y qué proceso manual la sustituirá. También conviene registrar lo mínimo necesario para saber qué ocurrió y qué tareas generó.",
          "No todo se puede revertir. Un mensaje enviado o una compra procesada pueden requerir una corrección humana. Por eso las acciones difíciles de deshacer necesitan más control antes de ejecutarse.",
        ],
        blocks: [{
          type: "summary",
          items: [
            "Prueba evento normal, duplicado, dato incompleto y fallo antes de activar.",
            "Define una persona responsable de excepciones y una forma clara de pausar.",
            "Conserva el proceso manual y revisa preferencias, datos y efectos antes de ampliar.",
          ],
        }],
      },
      {
        heading: "Fuentes y alcance",
        paragraphs: [
          "Estas referencias ayudan a pensar en privacidad, seguridad y comunicaciones. No sustituyen las obligaciones de tu país ni la documentación de las herramientas que utilices.",
        ],
        blocks: [{
          type: "sources",
          items: [
            { label: "NIST Privacy Framework", url: "https://www.nist.gov/privacy-framework", scope: "Marco voluntario para identificar y gestionar riesgos de privacidad en organizaciones." },
            { label: "NIST Cybersecurity Framework 2.0", url: "https://www.nist.gov/cyberframework", scope: "Marco para gestionar riesgos de ciberseguridad, responsabilidades y controles de forma proporcional." },
            { label: "ICO — Electronic mail marketing", url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/", scope: "Orientación del Reino Unido sobre comunicaciones electrónicas y preferencias; verifica las reglas de tu jurisdicción." },
          ],
        }],
      },
    ],
  },
  {
    slug: "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio",
    category: "Automatización",
    title: "Automatizaciones: ahorrar tiempo sin complicar tu negocio",
    intro: "Si repites una tarea muchas veces, quizá puedas automatizar una parte. Empieza por un proceso que ya entiendes y conserva siempre una forma manual de continuar.",
    excerpt: "Aprende a describir una automatización sencilla, decidir cuándo necesita revisión humana y probarla sin depender de que todo salga perfecto.",
    enPocasPalabras: [
      "Automatiza una tarea repetitiva que ya sabes hacer manualmente.",
      "Define qué la dispara, qué condición debe cumplirse y quién revisa las excepciones.",
      "Prueba duplicados y fallos, y conserva una forma de detener o revertir el flujo.",
    ],
    image: "/assets/learn/diagram-automation.svg",
    imageAlt: "Flujo de automatización: un evento se evalúa mediante una condición y puede ejecutar una acción o pasar a revisión humana si no se cumple",
    cta: { label: "Consultar servicios", to: "/servicios", copy: "La implementación de una automatización personalizada puede formar parte de un servicio profesional; su alcance debe confirmarse previamente." },
    relatedSlugs: ["como-probar-y-supervisar-automatizaciones-sin-perder-datos"],
    sections: [
      {
        heading: "Qué significa automatizar",
        paragraphs: [
          "Automatizar es configurar una regla para que un sistema haga un paso cuando ocurre algo definido. No significa eliminar a las personas ni dejar que una herramienta decida situaciones que no entiende.",
          "Empieza por una tarea que el equipo ya puede hacer de forma manual. Si el proceso cambia cada vez o depende de mucho contexto, primero aclara cómo se decide.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "Disparador o evento", definition: "Lo que inicia la regla, por ejemplo registrar una nueva solicitud." },
            { term: "Condición", definition: "La comprobación que decide si la acción debe continuar." },
            { term: "Acción", definition: "El paso que el sistema realiza, como crear una tarea interna." },
            { term: "Excepción", definition: "Caso que sale de la regla normal y necesita una persona responsable." },
          ],
        }, {
          type: "callout",
          tone: "tip",
          title: "Automatiza una parte, no todo el problema",
          text: "Una buena primera automatización suele quitar un paso repetitivo y deja las decisiones dudosas en revisión humana.",
        }],
      },
      {
        heading: "Cómo elegir una tarea adecuada",
        paragraphs: [
          "Busca una actividad repetida, con datos claros y un resultado fácil de comprobar. Evita empezar por decisiones delicadas sobre dinero, personas o compromisos que todavía necesitan interpretación.",
        ],
        blocks: [{
          type: "steps",
          label: "Describe el flujo antes de configurarlo",
          items: [
            { title: "Escribe el disparador", detail: "Define exactamente qué evento inicia el flujo." },
            { title: "Añade la condición", detail: "Especifica qué debe ser verdadero para continuar y qué dato se usa para comprobarlo." },
            { title: "Define la acción", detail: "Describe un resultado concreto, no «hacer seguimiento» sin explicar qué ocurre." },
            { title: "Nombra un responsable", detail: "Aclara quién revisa los casos dudosos, los errores y el resultado." },
            { title: "Conserva la alternativa manual", detail: "Escribe cómo continuará el trabajo si la automatización se detiene." },
          ],
        }],
      },
      {
        heading: "Ejemplo principal: una reposición necesita revisión humana",
        paragraphs: ["Caso hipotético. El objetivo es automatizar un aviso interno, no una compra."],
        blocks: [{
          type: "example",
          title: "Un tostador local revisa existencias",
          hypothetical: true,
          context: "La tienda registra ventas y una persona responsable revisa qué productos necesitan reposición.",
          problem: "Puede pasar tiempo antes de notar una cantidad baja, pero una devolución o corrección también puede cambiar el registro.",
          approach: "El evento es un cambio de cantidad; la condición comprueba si el producto está activo y necesita revisión; la acción crea una tarea interna, nunca un pedido automático.",
          actions: [
            "Evento: registrar una venta, devolución o ajuste cambia la cantidad.",
            "Condición: comprobar que el dato es válido, que el producto está activo y que no existe ya una tarea abierta.",
            "Responsable: la persona de compras cuenta físicamente y decide si corresponde reponer.",
            "Excepción y comprobación: si falta un dato o la condición es dudosa, enviar a revisión humana y registrar qué ocurrió.",
            "Si falla: continuar con el procedimiento manual y comprobar antes de reintentar para no crear un duplicado.",
          ],
          lesson: "Una automatización sencilla puede avisar sin convertir una señal incompleta en una decisión de compra.",
        }],
      },
      {
        heading: "Ejemplo comercial: recordar sin interpretar el silencio",
        paragraphs: ["Caso hipotético para distinguir un recordatorio interno de un mensaje automático a una persona."],
        blocks: [{
          type: "example",
          title: "Una cotización tiene una fecha de seguimiento",
          hypothetical: true,
          context: "Una persona pidió una cotización y acordó que el negocio revisaría el caso unos días después.",
          problem: "Una regla podría enviar mensajes aunque la persona ya haya respondido, pedido una pausa o cambiado sus preferencias de contacto.",
          approach: "El sistema crea primero un recordatorio interno. Antes de cualquier mensaje externo, una persona revisa el contexto y las preferencias.",
          actions: [
            "Crear la tarea en la fecha acordada.",
            "Leer la conversación y comprobar si el caso sigue abierto.",
            "Revisar las preferencias y requisitos del canal antes de contactar.",
            "Cerrar o posponer la tarea si el mensaje ya no corresponde.",
          ],
          lesson: "Automatizar un recordatorio no autoriza a interpretar el silencio ni a contactar indefinidamente.",
        }],
      },
      {
        heading: "Prueba fallos antes de depender del flujo",
        paragraphs: [
          "Prueba con datos ficticios o anonimizados: caso normal, dato vacío, evento repetido, fallo del servicio y reintento. Comprueba qué ocurre si la acción se ejecuta dos veces.",
          "Si una acción puede producir un efecto difícil de deshacer, añade más revisión. La inteligencia artificial puede ayudar a clasificar o redactar, pero una salida generada no sustituye la comprobación de la condición ni la responsabilidad del negocio.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Evita duplicados usando una referencia que permita reconocer si el trabajo ya existe.",
            "Decide cuándo un reintento es seguro y cuándo primero debes comprobar si el intento anterior sí se completó.",
            "Mantén registros suficientes para saber qué disparador, condición y acción se ejecutaron.",
            "Define cómo pausar el flujo y cómo revertir un efecto cuando sea seguro hacerlo.",
          ],
        }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿Qué conviene automatizar primero?", answer: "Una tarea repetitiva, de bajo riesgo, con datos claros y una forma sencilla de comprobar el resultado." },
            { question: "¿Debo automatizar una decisión que hoy nadie tiene clara?", answer: "No. Aclara primero el proceso manual y quién decide cada excepción." },
            { question: "¿Qué pasa si el sistema falla?", answer: "Usa la alternativa manual, registra el incidente y comprueba el estado antes de reintentar." },
            { question: "¿Puedo usar IA dentro de una automatización?", answer: "Sí en tareas adecuadas, pero aumenta la revisión cuando una respuesta pueda inventar información o crear un compromiso." },
            { question: "¿Puedo enviar mensajes automáticos?", answer: "Depende del canal, las preferencias de la persona y las reglas aplicables. No conviertas una consulta en permiso ilimitado de contacto." },
          ],
        }],
      },
      {
        heading: "Fuentes y orientación adicional",
        paragraphs: ["Estas referencias orientan sobre privacidad, seguridad y comunicaciones; no sustituyen requisitos locales."],
        blocks: [{
          type: "sources",
          items: [
            { label: "NIST Privacy Framework", url: "https://www.nist.gov/privacy-framework", scope: "Marco voluntario para identificar y gestionar riesgos de privacidad." },
            { label: "NIST Cybersecurity Framework (CSF) 2.0", url: "https://www.nist.gov/cyberframework", scope: "Marco para gestionar riesgos de ciberseguridad y definir controles proporcionales." },
            { label: "Electronic mail marketing — ICO", url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/", scope: "Orientación del Reino Unido sobre marketing por correo electrónico; verifica las reglas de tu jurisdicción." },
          ],
        }, {
          type: "summary",
          items: [
            "Describe el proceso manual antes de automatizar.",
            "Prueba el caso normal, los duplicados y los fallos.",
            "Conserva revisión humana, una alternativa manual y una forma de detener el flujo.",
          ],
        }],
      },
    ],
  },
  {
    slug: "como-elegir-y-cambiar-proveedor-de-dominio-y-hosting",
    category: "Tecnología explicada",
    title: "Cómo elegir proveedor de dominio y hosting sin perder el control",
    intro: "Antes de contratar o renovar, separa dominio, DNS, web y correo. Compara el costo completo, quién controla las cuentas y cómo podrías salir del servicio si deja de servirte.",
    excerpt: "Aprende qué revisar antes de contratar dominio, hosting o correo y evita depender de una cuenta que no controla tu negocio.",
    enPocasPalabras: [
      "Separa dominio, DNS, alojamiento y correo: pueden ser servicios y proveedores diferentes.",
      "Compara renovación, soporte, copias, exportación y salida; no solo el precio de entrada.",
      "El negocio debe poder recuperar las cuentas importantes y saber quién tiene permiso para cambiarlas.",
    ],
    image: "/assets/learn/diagram-domain-dns-hosting.svg",
    imageAlt: "Una persona compara dominio, DNS, alojamiento y correo antes de elegir quién administrará cada servicio.",
    relatedSlugs: [
      "dominio-hosting-sitio-web-como-funcionan",
      "como-cambiar-proveedor-dominio-hosting-sin-perder-web-correo",
    ],
    editorialDraft: false,
    cta: {
      label: "Revisar mis necesidades",
      to: "/diagnostico",
      copy: "Identifica primero qué necesita tu negocio antes de contratar una herramienta o servicio nuevo.",
    },
    sections: [
      {
        heading: "Empieza por separar los servicios",
        paragraphs: [
          "Cuando una oferta dice «dominio y hosting», puede incluir varias piezas bajo una sola factura. Aun así, conviene saber qué hace cada una y quién la administra.",
          "El dominio es el nombre registrado; el DNS indica dónde encontrar servicios; el alojamiento publica la web; el correo mantiene los buzones. Pueden estar juntos o con proveedores distintos.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "Dominio", definition: "Nombre que registras por periodos y que necesita renovación para seguir bajo tu control." },
            { term: "DNS", definition: "Configuración que conecta el dominio con servicios como la web y el correo." },
            { term: "Hosting o alojamiento", definition: "Servicio donde se publica y ejecuta la página web." },
            { term: "Correo profesional", definition: "Buzones que usan tu dominio y que pueden contratarse de forma independiente al alojamiento web." },
          ],
        }],
      },
      {
        heading: "Quién debe conservar el control administrativo",
        paragraphs: [
          "Un proveedor o profesional puede ayudarte a configurar la web, pero el negocio debería poder identificar la cuenta principal, recuperar el acceso y saber quién puede renovar, transferir o modificar servicios críticos.",
          "Usa un correo administrativo que permanezca bajo control del negocio, activa las medidas de seguridad disponibles y evita que una única persona externa sea la única vía para recuperar el dominio.",
        ],
        blocks: [{
          type: "callout",
          tone: "caution",
          title: "Ayuda técnica no exige entregar la cuenta principal",
          text: "Si el servicio permite usuarios o accesos delegados, da a cada colaborador el permiso que necesita. Evita compartir la contraseña del correo o de recuperación.",
        }],
      },
      {
        heading: "Qué revisar antes de contratar o renovar",
        paragraphs: [
          "Compara el servicio que necesitas y el costo de mantenerlo. Un precio promocional puede no coincidir con la renovación ni incluir todo lo que usarás.",
        ],
        blocks: [{
          type: "steps",
          label: "Lista breve para comparar proveedores",
          items: [
            { title: "Aclara qué incluye", detail: "Pregunta por dominio, DNS, alojamiento, correo, certificado de seguridad de la web (TLS), copias y soporte. No des por hecho que vienen juntos." },
            { title: "Lee la renovación", detail: "Comprueba precio del siguiente periodo, moneda, impuestos, renovación automática y condiciones si el dominio vence." },
            { title: "Confirma quién será el registrante", detail: "Verifica qué persona o entidad queda vinculada al registro y qué correo recibe los avisos importantes." },
            { title: "Pregunta cómo salir", detail: "Averigua cómo exportar la web y los datos, transferir el dominio, cancelar el servicio y descargar comprobantes." },
            { title: "Revisa soporte y recuperación", detail: "Comprueba cómo se recupera la cuenta, qué canales de soporte existen y qué ocurre si falla un pago o cambia el responsable." },
          ],
        }],
      },
      {
        heading: "Qué costos conviene comparar",
        paragraphs: [
          "No existe una tarifa universal. Lo importante es comparar el mismo conjunto de servicios y el mismo periodo.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Registro y renovación del dominio.",
            "Alojamiento de la web y límites del plan.",
            "Buzones de correo profesional.",
            "Copias, restauración, migración o soporte adicional.",
            "Servicios opcionales que puedan cobrarse aparte.",
          ],
        }],
      },
      {
        heading: "Ejemplo: una oferta barata que no incluye todo",
        paragraphs: ["Caso hipotético para practicar la comparación sin depender de un precio concreto."],
        blocks: [{
          type: "example",
          title: "Una peluquería compara dos propuestas para publicar su web",
          hypothetical: true,
          context: "Una propuesta tiene una cuota inicial más baja y otra parece más cara, pero la segunda incluye copias y soporte que la primera cobra por separado.",
          problem: "Si la dueña compara solo el precio anunciado, no sabrá cuánto cuesta mantener la web ni quién controla el dominio y el correo.",
          approach: "Escribe cada pieza en una tabla sencilla: dominio, renovación, alojamiento, correo, copias, soporte, responsable y procedimiento de salida.",
          actions: [
            "Confirmar qué servicios necesita realmente el negocio y cuáles son opcionales.",
            "Anotar el costo de renovación y los cargos separados que puedan aplicar.",
            "Comprobar quién tendrá la cuenta principal y cómo se recuperará el acceso.",
            "Preguntar cómo se exportan los datos y qué pasos exige cancelar o transferir.",
          ],
          lesson: "La opción más conveniente no se decide por una cifra aislada. Se compara el costo completo, el control y la capacidad de cambiar más adelante.",
        }],
      },
      {
        heading: "Si ya tienes un dominio y no sabes quién lo administra",
        paragraphs: [
          "Busca facturas, avisos de renovación, documentos del negocio y el gestor de contraseñas. Para ciertos dominios, ICANN Lookup puede ayudar a identificar el registrador, aunque no muestra necesariamente quién tiene acceso a la cuenta ni dónde está alojada la web.",
          "Cuando recuperes el acceso, anota el registrante, el correo de recuperación, la fecha de renovación y quién administra el DNS. No cambies registros a ciegas solo por haber localizado el registrador.",
        ],
      },
      {
        heading: "Si necesitas cambiar de proveedor",
        paragraphs: [
          "Elegir y migrar no son la misma tarea. Para un cambio real, primero identifica qué depende del dominio, prepara el nuevo servicio y comprueba web y correo antes de cancelar el anterior.",
          "La guía relacionada «Cómo cambiar de proveedor sin perder tu dominio, tu web ni el correo» desarrolla esa migración paso a paso.",
        ],
        blocks: [{
          type: "callout",
          tone: "tip",
          title: "No mezcles la decisión de compra con la migración",
          text: "Primero decide si el proveedor nuevo responde a tu necesidad. Después prepara el traslado con inventario, copia, pruebas y una forma de volver atrás.",
        }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿Registrar un dominio incluye también la página web?", answer: "No necesariamente. Dominio, alojamiento y correo son servicios distintos aunque un proveedor pueda venderlos juntos." },
            { question: "¿El proveedor debe ser dueño del dominio?", answer: "No es necesario para prestar soporte. El negocio debe entender quién figura como registrante y conservar una forma verificable de recuperar y administrar la cuenta." },
            { question: "¿Cómo sé cuánto costará después del primer año?", answer: "Revisa el precio de renovación y los cargos de los servicios que realmente usarás. Las promociones iniciales no describen siempre el costo posterior." },
            { question: "¿Qué hago si no sé quién controla mi dominio?", answer: "Busca avisos y comprobantes, identifica el registrador cuando sea posible y usa sus canales oficiales de recuperación antes de cambiar DNS o registrar otro nombre." },
            { question: "¿Puedo cambiar solo el hosting?", answer: "Sí. El dominio, DNS, alojamiento y correo pueden administrarse por separado. Planifica el cambio para no afectar servicios que seguirán donde están." },
            { question: "¿HTTPS demuestra que el proveedor o la web son confiables?", answer: "No. HTTPS protege la conexión con el dominio validado; no certifica la calidad del proveedor, la empresa o el contenido." },
          ],
        }],
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{
          type: "summary",
          items: [
            "Haz una lista de los servicios que realmente necesitas.",
            "Compara renovación, soporte, copias, control y salida, no solo el precio inicial.",
            "Deja el dominio y los métodos de recuperación bajo control verificable del negocio.",
          ],
        }],
      },
      {
        heading: "Fuentes y alcance",
        paragraphs: [
          "Estas referencias respaldan conceptos de registro, renovación, DNS y TLS. Las tarifas y procedimientos concretos dependen del proveedor, la extensión y el contrato.",
        ],
        blocks: [{
          type: "sources",
          items: [
            { label: "Information for Domain Name Registrants — ICANN", url: "https://www.icann.org/registrants", scope: "Define al registrante y su relación con el registrador e incluye recursos para localizar información sobre dominios." },
            { label: "ICANN Lookup", url: "https://lookup.icann.org/en", scope: "Ayuda a consultar datos públicos de registro y a identificar el registrador cuando corresponda; no identifica necesariamente el hosting ni quién accede a la cuenta." },
            { label: "The Domain Name Registration Process — ICANN", url: "https://www.icann.org/resources/pages/domain-name-registration-process-2023-11-02-en", scope: "Describe registrantes, registradores, operadores de registro y revendedores y aclara que las relaciones comerciales dependen de acuerdos concretos." },
            { label: "Domain Name Renewals and Expiration FAQs — ICANN", url: "https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en", scope: "Explica aspectos generales de renovación y vencimiento; los detalles dependen de la extensión y del registrador." },
            { label: "RFC 1035 — Domain Names: Implementation and Specification", url: "https://datatracker.ietf.org/doc/html/rfc1035", scope: "Especifica registros DNS como A, NS, CNAME y MX." },
            { label: "Transport Layer Security (TLS) — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security", scope: "Explica cómo TLS protege la comunicación web y qué papel cumple el certificado." },
          ],
        }],
      },
    ],
  },
  {
    slug: "dns-https-y-correo-como-se-conecta-tu-dominio",
    category: "Negocios digitales",
    title: "DNS, HTTPS y correo: cómo se conectan las piezas de tu dominio",
    intro: "Tu dominio puede apuntar a una web, proteger la conexión con HTTPS y recibir correo mediante servicios distintos. Esta guía te ayuda a ver el mapa sin convertirte en administrador de sistemas.",
    excerpt: "Entiende qué conecta DNS, qué protege HTTPS y por qué el correo puede seguir otro camino aunque use el mismo dominio.",
    enPocasPalabras: [
      "DNS indica dónde encontrar los servicios asociados a tu dominio.",
      "HTTPS protege la conexión con la web; no demuestra por sí solo que el negocio sea confiable.",
      "Web y correo pueden usar proveedores y registros diferentes, así que conviene comprobarlos por separado.",
    ],
    image: "/assets/learn/diagram-domain-dns-hosting.svg",
    imageAlt: "Esquema de un dominio que conecta por separado una página web segura y un servicio de correo.",
    relatedSlugs: [
      "dominio-hosting-sitio-web-como-funcionan",
      "https-certificados-tls-que-protegen-y-que-no",
      "correo-profesional-dominio-registros-mx-txt",
    ],
    editorialDraft: false,
    cta: {
      label: "Revisar mi situación",
      to: "/diagnostico",
      copy: "Comprueba qué servicio necesitas entender o corregir antes de cambiar configuraciones.",
    },
    sections: [
      {
        heading: "Piensa en el dominio como una dirección con varias rutas",
        paragraphs: [
          "Registrar un dominio no crea por sí solo una web ni un buzón. El dominio es el nombre; DNS publica indicaciones para que otros sistemas sepan dónde encontrar distintos servicios asociados a ese nombre.",
          "Una misma organización puede registrar el dominio con una empresa, alojar la web con otra y usar un proveedor de correo distinto. Eso es normal: lo importante es saber quién administra cada pieza.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "DNS", definition: "Sistema que publica información para localizar servicios asociados a un nombre de dominio." },
            { term: "Web", definition: "El sitio se publica en un alojamiento o plataforma y suele utilizar registros como A, AAAA o CNAME para conectarse al dominio." },
            { term: "Correo", definition: "Los buzones utilizan su propia configuración; los registros MX indican dónde debe recibirse el correo del dominio." },
            { term: "HTTPS", definition: "Versión segura de la conexión web mediante TLS. Protege los datos en tránsito entre navegador y servidor." },
          ],
        }],
      },
      {
        heading: "Qué ocurre cuando escribes la dirección de una web",
        paragraphs: [
          "El navegador consulta DNS para averiguar a qué servicio debe dirigirse. Los registros concretos dependen de cómo haya configurado el proveedor la página.",
          "No necesitas memorizar A, AAAA, CNAME o NS para usar un dominio. Sí conviene guardar la configuración que funciona y seguir las instrucciones del proveedor cuando conectes o cambies una web.",
        ],
        blocks: [{
          type: "callout",
          tone: "tip",
          title: "Cambiar DNS no mueve la web",
          text: "Modificar una indicación de DNS puede hacer que las visitas lleguen a otro servicio, pero no copia archivos, contenido ni bases de datos.",
        }],
      },
      {
        heading: "Qué aporta HTTPS",
        paragraphs: [
          "HTTPS usa TLS para proteger la comunicación entre el navegador y el servidor y para comprobar que el certificado presentado corresponde al nombre solicitado.",
          "El candado no demuestra que una empresa sea legítima, que una oferta sea verdadera ni que el sitio esté libre de riesgos. Para entender certificados, advertencias y límites de HTTPS, continúa con la guía específica relacionada.",
        ],
        blocks: [{
          type: "callout",
          tone: "caution",
          title: "No ignores una advertencia del navegador",
          text: "Si el navegador indica un problema de certificado, corrige la configuración del sitio. No pidas a visitantes que desactiven la advertencia o compartan datos de todos modos.",
        }],
      },
      {
        heading: "Por qué el correo puede fallar aunque la web funcione",
        paragraphs: [
          "La página y el correo pueden compartir el mismo dominio y, aun así, depender de registros y proveedores diferentes. Una web puede abrir correctamente mientras los mensajes dejan de llegar.",
          "El correo utiliza registros como MX y TXT y puede incorporar mecanismos como SPF, DKIM y DMARC. Esta guía solo presenta el mapa; la guía especializada explica qué hace cada uno y cómo cambiar su configuración con menos riesgo.",
        ],
        blocks: [{
          type: "callout",
          tone: "tip",
          title: "Separa las comprobaciones",
          text: "Después de cambiar DNS, prueba la web y el correo por separado. Que una de las dos cosas funcione no confirma la otra.",
        }],
      },
      {
        heading: "Ejemplo: una página nueva deja el correo fuera del mapa",
        paragraphs: ["Caso hipotético para entender por qué conviene conservar los registros que todavía utiliza otro servicio."],
        blocks: [{
          type: "example",
          title: "Una tienda conecta su dominio a una nueva plataforma",
          hypothetical: true,
          context: "La tienda publica una web nueva, pero mantiene sus buzones con el proveedor que ya utilizaba.",
          problem: "Al conectar la web se reemplaza toda la zona DNS y desaparecen los registros del correo. La página abre, pero los mensajes dejan de entrar.",
          approach: "El equipo recupera la configuración anterior, identifica qué registros pertenecen a la web y cuáles al correo y aplica únicamente los cambios confirmados por cada proveedor.",
          actions: [
            "Guardar una copia de la zona DNS antes de modificarla.",
            "Identificar qué registros necesita la web y cuáles mantiene el proveedor de correo.",
            "Cambiar solo los valores necesarios y conservar los demás hasta entender su función.",
            "Probar la página, el envío y la recepción de correo después del cambio.",
          ],
          lesson: "Un dominio conecta varios servicios. Cambiar uno sin revisar los demás puede romper algo que parecía no estar relacionado.",
        }],
      },
      {
        heading: "Qué revisar antes de cambiar algo",
        paragraphs: [],
        blocks: [{
          type: "steps",
          label: "Mapa mínimo de tu dominio",
          items: [
            { title: "Quién registra el dominio", detail: "Anota la cuenta que controla la renovación y la recuperación del nombre." },
            { title: "Quién administra DNS", detail: "Comprueba dónde se editan los registros y guarda una copia antes de modificarla." },
            { title: "Dónde está la web", detail: "Identifica la plataforma o alojamiento que publica el sitio." },
            { title: "Dónde está el correo", detail: "Confirma el proveedor de buzones y qué registros necesita." },
            { title: "Quién puede recuperar cada cuenta", detail: "Evita depender de una cuenta personal de alguien que ya no participa en el negocio." },
          ],
        }],
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{
          type: "summary",
          items: [
            "Dibuja por separado dominio, DNS, web y correo y anota quién controla cada pieza.",
            "Usa la guía específica de HTTPS si el problema es el certificado o la conexión segura.",
            "Usa la guía de correo profesional antes de cambiar MX, TXT, SPF, DKIM o DMARC.",
          ],
        }],
      },
      {
        heading: "Fuentes y alcance",
        paragraphs: [
          "Esta guía es un mapa conceptual. No proporciona valores de configuración para proveedores concretos. Los RFC del IETF explican DNS y MDN resume el papel de TLS en la web. La guía de correo relacionada trata SPF, DKIM y DMARC, pero sus valores deben obtenerse del proveedor que realmente utilices.",
        ],
        blocks: [{
          type: "sources",
          items: [
            { label: "RFC 1034 — Domain Names: Concepts and Facilities", url: "https://datatracker.ietf.org/doc/html/rfc1034", scope: "Describe los conceptos fundamentales de resolución de nombres, servidores DNS y caché." },
            { label: "RFC 1035 — Domain Names: Implementation and Specification", url: "https://datatracker.ietf.org/doc/html/rfc1035", scope: "Especifica registros DNS como A, NS, CNAME y MX. Es una referencia técnica, no una guía de proveedor." },
            { label: "Transport Layer Security (TLS) — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security", scope: "Explica cómo TLS protege conexiones web y el papel del certificado del servidor." },
          ],
        }],
      },
      {
        heading: "Lista de comprobación",
        paragraphs: [],
        blocks: [
          {
            type: "summary",
            items: [
              "Identifica quién administra DNS, web y correo antes de cambiar una configuración.",
              "Conserva una copia de los registros y aplica solo valores confirmados.",
              "Prueba por separado la página, la recepción y el envío de correo."
            ]
          }
        ]
      }
    ]
  },
  {
    slug: "dominio-hosting-sitio-web-como-funcionan",
    category: "Tecnología explicada",
    title: "Dominio, hosting y sitio web: qué es cada cosa y cómo funcionan juntos",
    intro: "Una persona escribe una dirección y aparece tu página. Para entender qué ocurre no necesitas ser técnico: basta distinguir el nombre, el lugar donde vive la web y la configuración que los conecta.",
    excerpt: "Entiende dominio, DNS, alojamiento, HTTPS y correo sin confundir servicios ni perder el control de las cuentas.",
    enPocasPalabras: [
      "El dominio es el nombre que registras; el sitio web es el contenido que ve la persona.",
      "El alojamiento mantiene la web y el DNS ayuda al navegador a encontrar el servidor correcto.",
      "Conserva quién administra cada servicio y cuándo debe renovarse.",
    ],
    image: "/assets/learn/diagram-domain-dns-hosting.svg",
    imageAlt: "Recorrido de una persona al escribir una dirección: el navegador puede consultar DNS si no tiene una respuesta vigente en caché, conecta con el servidor web y recibe la página solicitada.",
    relatedSlugs: [
      "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
      "dns-https-y-correo-como-se-conecta-tu-dominio",
      "como-elegir-y-cambiar-proveedor-de-dominio-y-hosting",
      "como-cambiar-proveedor-dominio-hosting-sin-perder-web-correo",
    ],
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico puede ayudarte a priorizar necesidades digitales; no registra dominios ni administra DNS o alojamiento." },
    sections: [
      {
        heading: "Las piezas principales de una web",
        paragraphs: [
          "Un sitio web no es lo mismo que su dirección. Puedes cambiar el alojamiento sin cambiar el dominio, y puedes conservar el dominio aunque rehagas por completo la página.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "Dominio", definition: "Nombre registrado, como ejemplo.com. Se administra mediante un registrador y necesita renovación según el contrato." },
            { term: "Sitio web", definition: "Páginas, imágenes, código y datos que una persona ve o utiliza." },
            { term: "Hosting o alojamiento", definition: "Servicio que mantiene la web disponible en un servidor web." },
            { term: "DNS", definition: "Sistema que ayuda a relacionar el nombre con los servicios que deben responder." },
            { term: "HTTPS y TLS", definition: "Protegen la conexión entre el navegador y el servidor cuando el certificado es válido para el nombre usado." },
            { term: "Correo profesional", definition: "Buzones que usan tu dominio y que pueden funcionar con un proveedor distinto al hosting." },
          ],
        }],
      },
      {
        heading: "Qué ocurre cuando escribes una dirección",
        paragraphs: [
          "El navegador necesita saber a qué servidor web debe conectarse. Puede consultar DNS para obtener la información necesaria, salvo que ya tenga una respuesta vigente en caché. Esa caché evita repetir la misma consulta en cada solicitud mientras la respuesta siga siendo válida.",
          "Después, el navegador se conecta al servidor. Si usa HTTPS, TLS protege la comunicación y el certificado ayuda a comprobar que el servidor responde para el nombre solicitado. HTTPS no demuestra que el negocio sea bueno ni que el contenido sea cierto.",
        ],
        blocks: [{
          type: "callout",
          tone: "tip",
          title: "Piensa en una dirección y un edificio",
          text: "El dominio es el nombre que escribes; DNS ayuda a encontrar dónde ir; el hosting es la infraestructura donde vive la web. La comparación es solo una ayuda: técnicamente son servicios distintos.",
        }],
      },
      {
        heading: "Registrar un dominio no compra toda la web",
        paragraphs: [
          "Registrar un dominio te da el derecho de usar ese nombre durante el periodo contratado, sujeto a las reglas aplicables. El registrador administra esa relación; el registrante es la persona u organización vinculada al registro.",
          "El dominio puede tener su DNS con otra empresa, la web en otro hosting y el correo profesional en un tercer servicio. Por eso conviene anotar quién administra cada pieza y la fecha de renovación.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Guarda el nombre del registrador y la cuenta de recuperación.",
            "Anota quién controla DNS, alojamiento y correo.",
            "Revisa la renovación antes del vencimiento.",
            "No compartas la contraseña principal si puedes usar accesos separados.",
          ],
        }],
      },
      {
        heading: "Ejemplo práctico: publicar una primera página",
        paragraphs: ["Caso hipotético para ver cómo se conectan las piezas sin asumir un proveedor concreto."],
        blocks: [{
          type: "example",
          title: "Una profesional publica su página de servicios",
          hypothetical: true,
          context: "Una profesional quiere un dominio propio para mostrar servicios y recibir consultas. Todavía no sabe si dominio, registro, hosting, DNS y correo deben contratarse juntos.",
          problem: "Si una sola cuenta externa controla todo y nadie documenta la renovación, puede ser difícil recuperar el dominio o cambiar de hosting más adelante.",
          approach: "Registra el dominio con datos controlados por su negocio, identifica quién administrará el DNS y publica la web en el hosting elegido. Después comprueba HTTPS y documenta la renovación.",
          actions: [
            "Confirmar el registrador y quién figura como registrante del dominio.",
            "Elegir el hosting y anotar qué registros DNS pide para conectar la web.",
            "Publicar y probar la página desde un navegador, incluida la versión con HTTPS.",
            "Separar la configuración del correo profesional si usa otro proveedor.",
            "Guardar accesos, responsables y fecha de renovación.",
          ],
          lesson: "Dominio, registro, hosting, DNS, HTTPS y renovación están relacionados, pero no son la misma compra ni tienen que depender del mismo proveedor.",
        }],
      },
      {
        heading: "Si no sabes quién administra el dominio",
        paragraphs: [
          "Busca facturas y avisos de renovación. Para determinados dominios, ICANN Lookup puede ayudarte a identificar el registrador. Eso no te dice necesariamente quién tiene la contraseña, quién administra el DNS o dónde está el hosting.",
          "Recupera el acceso mediante los canales oficiales antes de cambiar configuraciones importantes.",
        ],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿Quién administra o controla mi dominio?", answer: "Revisa la cuenta del registrador, los avisos de renovación y los datos del registrante. ICANN Lookup puede ayudar a identificar el registrador en los casos compatibles." },
            { question: "¿Necesito hosting si ya compré el dominio?", answer: "Necesitas alguna forma de publicar la web. Puede ser un hosting contratado por separado o una plataforma que incluya alojamiento." },
            { question: "¿El correo profesional viene con el hosting?", answer: "No necesariamente. Puede estar incluido, venderse aparte o funcionar con otro proveedor." },
            { question: "¿DNS guarda los archivos de mi web?", answer: "No. DNS ayuda a localizar servicios; los archivos y datos de la página se mantienen en el alojamiento u otra infraestructura." },
            { question: "¿HTTPS significa que la empresa es confiable?", answer: "No. HTTPS protege la conexión con el dominio validado; no certifica la empresa, el contenido ni una compra." },
            { question: "¿Puedo cambiar de hosting sin perder el dominio?", answer: "Sí. Prepara el nuevo alojamiento, cambia la configuración necesaria y comprueba los servicios antes de cancelar el anterior." },
          ],
        }],
      },
      {
        heading: "Fuentes y orientación adicional",
        paragraphs: ["Estas referencias respaldan los conceptos de registro, DNS y TLS. Los pasos concretos dependen del proveedor y del dominio."],
        blocks: [{
          type: "sources",
          items: [
            { label: "Information for Domain Name Registrants — ICANN", url: "https://www.icann.org/registrants", scope: "Explica el papel del registrante y del registrador e incluye recursos para dominios." },
            { label: "ICANN Lookup", url: "https://lookup.icann.org/en", scope: "Ayuda a consultar información de registro cuando corresponda; no identifica necesariamente hosting ni acceso a la cuenta." },
            { label: "RFC 1034 — Domain Names: Concepts and Facilities", url: "https://datatracker.ietf.org/doc/html/rfc1034", scope: "Describe resolvers, servidores de nombres, datos autoritativos y caché en DNS." },
            { label: "RFC 1035 — Domain Names: Implementation and Specification", url: "https://datatracker.ietf.org/doc/html/rfc1035", scope: "Especifica registros DNS y el funcionamiento básico del sistema." },
            { label: "Transport Layer Security (TLS) — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security", scope: "Explica TLS, HTTPS y el papel del certificado en la conexión web." },
          ],
        }, {
          type: "summary",
          items: [
            "Distingue dominio, DNS, hosting, web y correo.",
            "Documenta quién controla cada servicio y cuándo se renueva.",
            "Consulta las guías especializadas antes de cambiar proveedor o tocar DNS.",
          ],
        }],
      },
    ],
  },
  {
    slug: "https-certificados-tls-que-protegen-y-que-no",
    category: "Tecnología explicada",
    title: "HTTPS y certificados TLS: qué protegen y qué no",
    intro: "Ves un candado junto a la dirección de una página. ¿Eso quiere decir que la tienda es confiable? No necesariamente. Aprende qué protege la conexión y qué hacer si aparece una advertencia.",
    excerpt: "Entiende HTTPS sin tecnicismos: qué protege, qué no demuestra y qué revisar en una web de negocio.",
    enPocasPalabras: [
      "HTTPS protege la comunicación entre tu navegador y una página.",
      "Un candado no garantiza que el vendedor, la oferta o el contenido sean confiables.",
      "Si aparece una advertencia de seguridad, no la ignores: revisa la dirección y corrige la causa.",
    ],
    image: "/assets/learn/diagram-domain-dns-hosting.svg",
    imageAlt: "Una conexión segura protege el trayecto entre un navegador y un sitio web, pero no demuestra la honestidad del negocio.",
    relatedSlugs: [
      "dns-https-y-correo-como-se-conecta-tu-dominio",
      "dominio-hosting-sitio-web-como-funcionan",
      "como-proteger-cuentas-contrasenas-estafas-negocio",
    ],
    cta: {
      label: "Revisar mi punto de partida digital",
      to: "/diagnostico",
      copy: "El Diagnóstico ayuda a revisar capacidades digitales; no certifica ni audita la seguridad de un sitio web.",
    },
    sections: [
      {
        heading: "Qué significa HTTPS en palabras sencillas",
        paragraphs: [
          "Cuando visitas una página, tu navegador y el servidor intercambian información. HTTPS protege ese trayecto mediante TLS: cifra la comunicación y ayuda al navegador a comprobar que está hablando con el dominio que aparece en la dirección.",
          "Esa protección es importante cuando envías un formulario, inicias sesión o haces una compra. Pero solo cubre la conexión. No garantiza qué hará el sitio con los datos después de recibirlos.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "HTTPS", definition: "La forma protegida de comunicar una página web con tu navegador." },
            { term: "TLS", definition: "La tecnología que cifra la conexión y permite comprobar el certificado presentado por el servidor." },
            { term: "Certificado", definition: "Credencial digital que ayuda al navegador a verificar que la conexión corresponde al nombre web que solicitaste." },
          ],
        }],
      },
      {
        heading: "El candado no significa «este negocio es confiable»",
        paragraphs: [
          "Una página fraudulenta también puede usar HTTPS en su propio dominio. El certificado ayuda a comprobar con qué dominio te conectaste; no revisa la identidad comercial, la calidad de un producto ni si una oferta es verdadera.",
          "Antes de compartir datos o pagar, mira la dirección completa y comprueba por otros medios quién está detrás del sitio. Un nombre parecido al original puede seguir teniendo un certificado válido para ese nombre distinto.",
        ],
        blocks: [{
          type: "callout",
          tone: "caution",
          title: "Protege la conexión, no la intención",
          text: "HTTPS dificulta que terceros lean o modifiquen lo que viaja entre tu navegador y el sitio. No convierte una página desconocida en legítima.",
        }],
      },
      {
        heading: "Qué hacer si aparece una advertencia",
        paragraphs: [
          "Si el navegador avisa que la conexión no es privada o que existe un problema con el certificado, no introduzcas contraseñas, datos personales ni información de pago hasta aclararlo.",
          "La causa puede ser una renovación pendiente, un nombre mal configurado, una fecha incorrecta en el dispositivo u otro problema técnico. Como visitante, no necesitas adivinar cuál: lo prudente es detenerte y confirmar la dirección.",
        ],
        blocks: [{
          type: "list",
          items: [
            "No pulses una opción para continuar solo porque tienes prisa.",
            "Comprueba que escribiste la dirección correcta y que no llegaste desde un enlace extraño.",
            "Si administras la web, anota el texto del aviso y pide revisar certificado, dominio y renovación.",
            "Después de corregirlo, prueba de nuevo desde otro navegador o dispositivo.",
          ],
        }],
      },
      {
        heading: "Ejemplo: una clínica cambia de proveedor",
        paragraphs: ["Caso hipotético para ver cómo actuar sin convertir al visitante en técnico."],
        blocks: [{
          type: "example",
          title: "La web abre con una advertencia de seguridad",
          hypothetical: true,
          context: "Una clínica cambia la plataforma donde publica horarios y recibe solicitudes de cita.",
          problem: "Algunas personas ven una advertencia del navegador al abrir la página.",
          approach: "La clínica no pide a nadie que ignore el aviso. La persona responsable contacta al proveedor y revisa la configuración antes de volver a pedir que se use el formulario.",
          actions: [
            "Anotar la dirección afectada y el mensaje de error sin incluir datos de pacientes.",
            "Comprobar que el certificado cubre el dominio usado y que la renovación está activa.",
            "Revisar que las páginas y recursos importantes carguen también mediante HTTPS.",
            "Probar el recorrido completo desde otro dispositivo antes de dar el problema por resuelto.",
          ],
          lesson: "La corrección se hace en el sitio. Pedir a visitantes que ignoren una advertencia traslada el riesgo a la persona equivocada.",
        }],
      },
      {
        heading: "Qué revisar en la web de tu negocio",
        paragraphs: [
          "No necesitas inspeccionar todos los detalles del protocolo. Lo útil es saber quién mantiene el certificado, cómo se renueva y qué comprobar después de un cambio de dominio o proveedor.",
        ],
        blocks: [{
          type: "steps",
          label: "Comprobación básica",
          items: [
            { title: "Abre la dirección que publicas", detail: "Comprueba que el dominio esperado carga con HTTPS y sin advertencias." },
            { title: "Prueba las variantes que usas", detail: "Si publicas direcciones con y sin www, confirma que ambas llegan al sitio correcto." },
            { title: "Prueba formularios y páginas importantes", detail: "Comprueba desde teléfono y computadora los recorridos que usan tus clientes." },
            { title: "Aclara la renovación", detail: "Anota qué proveedor la gestiona y quién recibe avisos si algo falla." },
            { title: "Mantén otros controles", detail: "Actualizaciones, accesos limitados, autenticación multifactor y copias siguen siendo necesarios aunque HTTPS funcione." },
          ],
        }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{
          type: "faq",
          items: [
            { question: "¿Un sitio con HTTPS es necesariamente confiable?", answer: "No. HTTPS protege la conexión con el dominio; no verifica la honestidad del negocio ni la calidad del contenido." },
            { question: "¿Qué hago si aparece una advertencia?", answer: "No introduzcas datos ni continúes a la fuerza. Comprueba la dirección y, si administras el sitio, corrige la configuración." },
            { question: "¿HTTPS protege los datos guardados por la empresa?", answer: "Protege el trayecto. La forma en que el sitio almacena, usa y elimina los datos requiere controles adicionales." },
            { question: "¿Tengo que comprar siempre un certificado aparte?", answer: "No. Muchos servicios lo incluyen o lo gestionan automáticamente. Comprueba qué cubre tu proveedor y cómo funciona la renovación." },
          ],
        }],
      },
      {
        heading: "Fuentes y siguiente paso",
        paragraphs: [
          "Estas fuentes explican TLS y los avisos de seguridad. Son referencias técnicas y de navegador; no sustituyen una auditoría de seguridad completa.",
        ],
        blocks: [{
          type: "sources",
          items: [
            { label: "Transport Layer Security (TLS) — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security", scope: "Explica HTTPS, TLS, certificados y autenticación del servidor en la web." },
            { label: "Mixed content — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content", scope: "Describe qué ocurre cuando una página HTTPS intenta cargar recursos mediante HTTP." },
            { label: "Warning about invalid TLS certificates — Chrome Help", url: "https://support.google.com/chrome/answer/6098869", scope: "Ayuda oficial sobre avisos de conexión y certificado en Chrome; la interfaz puede variar." },
            { label: "RFC 8446 — TLS 1.3", url: "https://datatracker.ietf.org/doc/html/rfc8446", scope: "Estándar técnico del IETF para TLS 1.3; no es una guía de configuración de un proveedor concreto." },
          ],
        }, {
          type: "summary",
          items: [
            "Comprueba la dirección completa y no ignores avisos del navegador.",
            "Recuerda que HTTPS protege la conexión, no garantiza la confiabilidad del negocio.",
            "Si administras una web, documenta quién mantiene el certificado y cómo se renueva.",
          ],
        }],
      },
    ],
  },
  {
    slug: "analitica-web-que-medir-en-tu-negocio",
    category: "Tecnología explicada",
    title: "Analítica web básica: qué debes medir en tu negocio",
    intro: "Tu página recibió visitas, pero ¿alguien preguntó por un servicio? Los números sirven cuando ayudan a responder una pregunta concreta, no cuando solo se ven grandes.",
    excerpt: "Aprende a distinguir visitas de resultados útiles y a medir solo lo que te ayuda a tomar una decisión.",
    enPocasPalabras: [
      "Una visita no es una consulta ni una venta.",
      "Elige primero la pregunta que quieres responder y después la métrica.",
      "Compara pocos datos, con el mismo criterio, y evita conclusiones basadas en una cifra aislada.",
    ],
    image: "/assets/learn/diagram-analytics.svg",
    imageAlt: "Un recorrido sencillo separa visitas, acciones y resultados confirmados por el negocio.",
    relatedSlugs: [
      "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
      "publicidad-digital-como-preparar-una-primera-campana",
    ],
    cta: {
      label: "Revisar mi punto de partida digital",
      to: "/diagnostico",
      copy: "El Diagnóstico ayuda a ordenar prioridades digitales; no recopila ni evalúa las métricas de analítica de tu sitio.",
    },
    sections: [
      {
        heading: "Empieza por una pregunta, no por un tablero",
        paragraphs: [
          "La analítica web registra señales de cómo se usa un sitio. Esas señales son útiles cuando responden una pregunta concreta: ¿encuentran el horario?, ¿el formulario funciona?, ¿llegan consultas que el negocio puede atender?",
          "Una cifra grande sin contexto no dice si el negocio va bien. Antes de instalar otra herramienta, escribe qué decisión cambiaría según el resultado.",
        ],
        blocks: [{
          type: "callout",
          tone: "tip",
          title: "Si el número no cambia ninguna decisión, quizá no necesites medirlo",
          text: "Empieza con la información mínima que te permita detectar un problema o comprobar una mejora.",
        }],
      },
      {
        heading: "Visitas, acciones y resultados no son lo mismo",
        paragraphs: [
          "Una persona puede visitar una página varias veces. Un clic puede no terminar en un formulario enviado. Y un formulario enviado puede no convertirse en una cita o una venta.",
        ],
        blocks: [{
          type: "definitions",
          items: [
            { term: "Visita o sesión", definition: "Actividad agrupada según las reglas de la herramienta. No equivale necesariamente a una persona única." },
            { term: "Interacción", definition: "Una acción observada, como pulsar un botón o abrir una página." },
            { term: "Evento clave", definition: "En Google Analytics, un evento que marca una acción especialmente importante para el negocio, como una solicitud válida según tu configuración." },
            { term: "Conversión publicitaria", definition: "Una acción importante utilizada para medir el rendimiento de campañas. Puede partir de un evento clave y no significa necesariamente una venta." },
            { term: "Resultado confirmado", definition: "Algo que el negocio puede verificar fuera de la herramienta, como una reserva atendida o un pedido válido." },
          ],
        }],
      },
      {
        heading: "Elige pocos indicadores que puedas comprobar",
        paragraphs: [
          "Para un negocio pequeño puede bastar con combinar una señal de uso del sitio con un resultado que el equipo pueda confirmar. No necesitas medir cada clic.",
        ],
        blocks: [{
          type: "steps",
          label: "Una forma sencilla de empezar",
          items: [
            { title: "Define la acción útil", detail: "Por ejemplo: encontrar el horario, pedir una cotización o reservar." },
            { title: "Comprueba que el recorrido funciona", detail: "Abre la página y prueba el botón o formulario desde un teléfono." },
            { title: "Separa resultados válidos", detail: "Distingue consultas reales de pruebas, spam y duplicados." },
            { title: "Compara periodos parecidos", detail: "Evita comparar una semana con campaña y otra sin ella sin anotar la diferencia." },
            { title: "Haz una mejora pequeña", detail: "Cambia una cosa que puedas explicar y observa si mejora el resultado que elegiste." },
          ],
        }],
      },
      {
        heading: "Ejemplo: más visitas, pero los pedidos no cambian",
        paragraphs: ["Caso hipotético; no representa resultados reales ni promete más ventas."],
        blocks: [{
          type: "example",
          title: "Una cafetería revisa su formulario de pedidos",
          hypothetical: true,
          context: "La cafetería publica el menú y un formulario para pedidos para llevar.",
          problem: "Las visitas aumentan, pero el equipo no ve más pedidos confirmados y descubre envíos duplicados.",
          approach: "En vez de celebrar las visitas, prueba el formulario en móvil y separa visitas, envíos y pedidos que realmente se pudieron atender.",
          actions: [
            "Definir qué cuenta como pedido válido y excluir pruebas y duplicados.",
            "Comprobar que cada envío llega al canal que revisa el equipo.",
            "Comparar periodos equivalentes y anotar si hubo campaña, cambio de horario o problema técnico.",
            "Corregir primero el fallo observable antes de buscar una explicación más compleja.",
          ],
          lesson: "Las visitas describen exposición. Para tomar decisiones necesitas relacionarlas con acciones y resultados que el negocio pueda confirmar.",
        }],
      },
      {
        heading: "Evita conclusiones rápidas",
        paragraphs: [
          "Una herramienta describe lo que registró; no siempre explica por qué ocurrió. También puede perder datos por bloqueadores, errores o cambios de configuración.",
        ],
        blocks: [{
          type: "list",
          items: [
            "Muestra también el volumen: una tasa puede cambiar mucho cuando hay pocos casos.",
            "Origen incierto (atribución): que una venta ocurra después de un clic no demuestra que la campaña haya causado la compra.",
            "Anota cambios de temporada, precio, horario o disponibilidad antes de comparar.",
            "Usa la misma definición durante la comparación; dos herramientas pueden contar visitas de manera distinta.",
          ],
        }, {
          type: "callout",
          tone: "caution",
          title: "Un dato incompleto no es un dato falso",
          text: "La medición web siempre tiene límites. Toma decisiones proporcionales y confirma con información operativa cuando sea posible.",
        }],
      },
      {
        heading: "Mide con privacidad proporcional",
        paragraphs: [
          "No envíes nombres, teléfonos, texto libre o datos sensibles a una herramienta de analítica si la pregunta puede responderse sin ellos. Revisa qué cookies, identificadores, conservación y accesos utiliza el servicio.",
          "Las reglas de consentimiento y privacidad dependen de la jurisdicción y de la configuración concreta. Esta guía no sustituye asesoría legal.",
        ],
        blocks: [{
          type: "summary",
          items: [
            "Escribe la decisión que quieres tomar antes de elegir una métrica.",
            "Distingue visitas, acciones observadas y resultados confirmados.",
            "Empieza con pocos indicadores y compara periodos equivalentes.",
            "Recoge la mínima información necesaria para responder la pregunta.",
          ],
        }],
      },
      {
        heading: "Fuentes y alcance",
        paragraphs: [
          "Las definiciones dependen del producto de analítica. Estas referencias ayudan a comprobar qué registra Google Analytics y qué consideraciones de privacidad publica su proveedor.",
        ],
        blocks: [{
          type: "sources",
          items: [
            { label: "About events — Google Analytics Help", url: "https://support.google.com/analytics/answer/9322688", scope: "Explica eventos e interacciones en Google Analytics; la configuración determina qué se registra." },
            { label: "Conversions vs. key events — Google Analytics Help", url: "https://support.google.com/analytics/answer/13965727", scope: "Distingue los eventos clave usados para analizar acciones importantes de las conversiones utilizadas para medir campañas publicitarias." },
            { label: "Google Analytics policies", url: "https://support.google.com/analytics/answer/6004245", scope: "Políticas publicadas por Google Analytics, incluidas restricciones sobre información de identificación personal." },
            { label: "ICO — Cookies and similar technologies", url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/", scope: "Orientación británica sobre cookies; comprueba las reglas aplicables a tu ubicación y actividad." },
          ],
        }],
      },
    ],
  },
  {
    slug: "conectar-herramientas-digitales-sin-complicar-tu-negocio",
    category: "Tecnología explicada",
    title: "Cómo conectar herramientas digitales sin complicar tu negocio",
    intro: "Una persona llena un formulario, pero su mensaje se pierde antes de llegar a quien debe responder. Conectar herramientas puede ayudar, si sabes qué información pasa de un lugar a otro.",
    excerpt: "Entiende cómo comparten datos las aplicaciones y qué comprobar antes de conectarlas.",
    enPocasPalabras: ["Conecta herramientas solo cuando resuelvas un problema concreto.","Decide dónde está la información correcta y qué pasa si falla la conexión.","Prueba con ejemplos antes de usar datos reales."],
    image: "/assets/learn/diagram-integrations.svg",
    imageAlt: "Dos herramientas intercambian solo los datos acordados mediante una conexión revisada, con una persona que verifica duplicados y errores.",
    relatedSlugs: ["automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio", "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo"],
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar procesos y capacidades; no conecta cuentas ni sincroniza registros entre plataformas." },
    sections: [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás describir qué dato debe pasar de una herramienta a otra, cuál mantiene la versión correcta y qué debería ocurrir si la conexión falla.", "Práctica: dibuja dos cajas para dos herramientas que ya uses. Escribe una sola información que tendría sentido compartir, quién la puede cambiar y cómo detectarías un duplicado."],
        blocks: [{ type: "callout", tone: "tip", title: "Conecta una necesidad, no aplicaciones por costumbre", text: "Si no puedes nombrar qué dato se mueve, para qué y quién corrige un error, todavía falta definir el proceso antes de integrarlo." }],
      },
      {
        heading: "Qué significa integrar dos herramientas",
        paragraphs: [
          "Integrar herramientas es intercambiar datos o coordinar tareas. Por ejemplo, al recibir una solicitud de cotización, el negocio puede añadir los datos necesarios a una lista de pendientes y avisar a quien responde.",
          "Una integración no sincroniza todo por defecto. Define qué sistema origina cada dato, qué se comparte, cuándo, quién accede y cómo se corrige un fallo. Automatizar un proceso confuso solo acelera la confusión.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "Integración", definition: "Conexión configurada para transferir información o coordinar una operación entre sistemas bajo reglas acordadas." },
          { term: "API", definition: "Interfaz de programación de aplicaciones: reglas y operaciones que permiten a un programa solicitar o enviar datos a otro servicio, normalmente con permisos y formatos definidos." },
          { term: "Webhook", definition: "Aviso automático que un servicio envía a una dirección web cuando ocurre un evento, para que otro sistema pueda reaccionar sin consultar continuamente." },
          { term: "CSV", definition: "Formato de texto tabular que representa filas y campos separados por delimitadores. Sirve para intercambiar o importar/exportar registros, pero no mantiene una conexión automática." },
          { term: "Fuente de verdad", definition: "El sistema o registro que el negocio acuerda tratar como referencia vigente para un dato concreto, como el precio publicado o el estado de una reserva." },
        ] }],
      },
      {
        heading: "API, webhook y CSV: tres formas diferentes de intercambiar datos",
        paragraphs: ["La disponibilidad depende del proveedor, el plan y los permisos."],
        blocks: [{ type: "list", items: [
          "API: permite solicitar o enviar datos cuando se necesitan, por ejemplo consultar horarios o crear un registro autorizado.",
          "Webhook: avisa a otra aplicación cuando ocurre algo —como un nuevo formulario— para que reaccione.",
          "CSV: una persona exporta, revisa e importa una tabla. Sirve para cargas puntuales, no sincroniza cambios.",
          "Conector integrado: simplifica la configuración, pero revisa campos, permisos, costos y errores.",
        ] }],
      },
      {
        heading: "Ejemplos sencillos para un negocio local",
        paragraphs: ["Ejemplos: una cafetería recibe pedidos, un estudio de yoga gestiona reservas, o un profesional responde cotizaciones. Empieza por el paso repetido que deseas mejorar."],
        blocks: [{ type: "example", title: "Un estudio de yoga recibe una solicitud de clase de prueba", hypothetical: true,
          context: "Un estudio recibe solicitudes de clase de prueba por formulario y revisa el correo una vez al día.",
          problem: "Algún mensaje se pierde y no se sabe quién responde o si hay cupo.",
          approach: "El estudio evalúa avisar al responsable con datos mínimos; confirma la disponibilidad manualmente.",
          actions: [
            "Transfiere solo los datos necesarios y usa una referencia estable para reconocer el envío.",
            "Verifica permisos, autenticación y reintentos antes de activar el webhook.",
            "Confirma que alguien compruebe el cupo antes de prometer una reserva.",
          ],
          lesson: "La conexión puede mostrar pendientes, pero no debe inventar disponibilidad ni sustituir la confirmación necesaria.",
        }],
      },
      {
        heading: "Cómo evitar duplicados, conflictos y pérdida de datos",
        paragraphs: ["Formularios repetidos, importaciones y reintentos pueden duplicar registros. Prueba eventos repetidos, campos vacíos y fallos parciales."],
        blocks: [{ type: "steps", label: "Controles antes de sincronizar datos", items: [
          { title: "Elige un identificador estable", detail: "Define cómo reconocer el mismo registro; nombre o correo pueden repetirse o cambiar." },
          { title: "Asigna fuente y dirección", detail: "Decide qué sistema manda sobre cada campo y si los cambios van en una o ambas direcciones." },
          { title: "Prevé errores y reintentos", detail: "Confirma cómo evitar procesar dos veces un envío tras una respuesta perdida." },
          { title: "Haz copia y prueba", detail: "Ensaya duplicados, campos vacíos, acentos, comas en CSV y desconexiones antes de usar datos reales." },
          { title: "Compara y conserva una salida", detail: "Revisa muestras y conteos; acuerda cómo pausar y recuperar el dato correcto." },
        ] }],
      },
      {
        heading: "Qué revisar antes de conectar plataformas",
        paragraphs: ["Una integración puede conceder acceso y mover datos entre proveedores. Limita los permisos al objetivo."],
        blocks: [{ type: "list", items: [
          "Finalidad: qué tarea mejora y quién atiende fallos.",
          "Campos y permisos: qué se comparte y quién puede leerlo o cambiarlo.",
          "Privacidad: reglas aplicables, conservación, ubicación y accesos.",
          "Límites y costos: frecuencia, cuotas, archivos y funciones del plan.",
          "Operación: alertas, responsable, exportación y cómo pausar o desconectar.",
          "Pruebas: datos válidos, repetidos, incompletos y fallos; confirma el destino.",
        ] }, { type: "callout", tone: "caution", title: "No conectes por comodidad sin revisar el acceso", text: "Un conector puede obtener permisos sobre contactos, archivos o calendarios. Usa accesos individuales y mínimos; no compartas contraseñas ni claves de API en hojas, correos o código público." }],
      },
      {
        heading: "Cuándo conviene empezar con CSV o con un paso manual",
        paragraphs: ["CSV puede bastar para importar una lista ocasionalmente. Comprueba columnas, acentos y comillas; conserva el original y valida la importación antes de borrar los datos de origen.",
          "Con poco volumen, revisar a mano puede ser más seguro. API o webhook convienen si la tarea se repite, los sistemas tienen reglas claras y alguien supervisa errores; no todos los planes lo permiten."],
        blocks: [{ type: "faq", items: [
          { question: "¿API y webhook son lo mismo?", answer: "No. Una API recibe solicitudes; un webhook suele avisar cuando ocurre un evento." },
          { question: "¿CSV sincroniza cambios automáticamente?", answer: "No. Es un archivo; para reflejar cambios debes exportar e importar de nuevo." },
        ] }],
      },
      {
        heading: "Fuentes oficiales y alcance",
        paragraphs: ["Los mecanismos concretos dependen del servicio. Estas referencias oficiales explican conceptos y formatos técnicos; consulta también la documentación vigente de las aplicaciones que vas a conectar."],
        blocks: [{ type: "sources", items: [
          { label: "An overview of HTTP — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", scope: "Describe la comunicación entre clientes y servidores web; permisos y operaciones dependen de cada API." },
          { label: "Webhooks — GitHub Docs", url: "https://docs.github.com/en/webhooks/about-webhooks", scope: "Ejemplo oficial de webhooks que explica avisos por evento y la entrega a una dirección receptora; no es una especificación de todos los proveedores." },
          { label: "RFC 4180: Common Format and MIME Type for CSV Files", url: "https://datatracker.ietf.org/doc/html/rfc4180", scope: "Documento informativo del IETF sobre convenciones comunes de CSV, encabezados, comillas y campos con comas." },
          { label: "OWASP API Security Top 10", url: "https://owasp.org/API-Security/", scope: "Riesgos de seguridad habituales en APIs, incluidos controles de autorización y exposición excesiva de datos; referencia para equipos técnicos." },
        ] }],
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{ type: "summary", items: [
          "Describe el paso repetido y el dato mínimo que realmente debe pasar de un sistema al otro.",
          "Decide la fuente de verdad, dirección, permisos y responsable antes de elegir API, webhook o CSV.",
          "Haz copia y prueba datos repetidos, incompletos y errores en un entorno controlado.",
          "Comprueba conteos y resultados, y conserva una forma de pausar o revertir la conexión.",
        ] }],
      },
    ],
  },
  {
    slug: "perfil-empresa-google-completar-y-mantener-actualizado",
    category: "Negocios digitales",
    title: "Tu Perfil de Empresa en Google: qué completar y mantener actualizado",
    intro: "Alguien busca un negocio como el tuyo y quiere comprobar horario, lugar y contacto. Una ficha correcta puede ayudarle, pero antes debes saber si tu actividad puede tenerla.",
    excerpt: "Revisa quién puede crear la ficha y cómo mantener datos, fotos y horarios verdaderos.",
    enPocasPalabras: ["Comprueba primero si tu negocio puede tener un Perfil de Empresa en Google.","Si puedes crearlo, revisa horario, contacto y fotos reales.","Mantenerlo actualizado orienta a las personas, pero no garantiza visitas."],
    image: "/assets/learn/diagram-presence-digital.svg",
    imageAlt: "El Perfil de Empresa forma parte de una presencia coherente junto con el sitio web y otros canales digitales.",
    relatedSlugs: ["antes-de-hacer-publicidad-organiza-tu-presencia-digital"],
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar capacidades digitales; no gestiona ni verifica Perfiles de Empresa de Google." },
    sections: [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, sabrás qué información de un Perfil de Empresa conviene mantener al día y cómo comprobar la ficha como la ve una persona que busca tu negocio.", "Práctica: anota nombre, horario, teléfono, ubicación o zona y servicio principal. Marca cuál podría estar desactualizado y quién debería confirmarlo antes de publicarlo."],
        blocks: [{ type: "callout", tone: "tip", title: "Míralo como visitante", text: "La ficha debe ayudar a una persona a encontrar información real. Comprueba datos y enlaces desde fuera de la cuenta de administración." }],
      },
      {
        heading: "Qué es y quién puede utilizar un perfil",
        paragraphs: [
          "El Perfil de Empresa es una ficha para negocios elegibles en Google Search y Maps. Puede mostrar nombre, ubicación o zona, horarios, contacto y novedades.",
          "En general, es para negocios que reciben clientes en un local o se desplazan para atenderlos, no para empresas exclusivamente en línea. Comprueba las normas vigentes antes de crearla.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "Negocio con atención presencial", definition: "Actividad que recibe clientes en un local o se desplaza a su ubicación; un negocio de área de servicio puede ocultar su dirección." },
        ] }],
      },
      {
        heading: "Completa lo básico con información real",
        paragraphs: ["Usa solo los campos que correspondan y comprueba cómo verá la ficha una persona."],
        blocks: [{ type: "list", items: [
          "Nombre: el que usas en el local y otros espacios. No agregues palabras promocionales o una ciudad que no forme parte del nombre.",
          "Categoría: elige la opción disponible más específica para la actividad principal y pocas categorías secundarias pertinentes.",
          "Ubicación: indica dónde recibes clientes. Si trabajas desde casa y visitas a clientes, revisa cómo ocultar la dirección y mostrar la zona atendida.",
          "Contacto: publica un teléfono del negocio y un sitio web que representen esa ubicación o servicio; prueba ambos.",
          "Horarios: indica las horas reales e incluye cambios por festivos o temporada.",
          "Servicios: añade solo los que ofreces y puedes mantener actualizados.",
        ] }],
      },
      {
        heading: "Fotos, reseñas y publicaciones requieren cuidado",
        paragraphs: ["Sube fotos actuales, nítidas y fieles al local, productos o servicio; usa solo imágenes propias o autorizadas. Google también puede mostrar fotos de clientes y no garantiza que la portada elegida sea la que aparezca.",
          "Pide reseñas auténticas sin ofrecer premios por ellas. Responde con cortesía y sin revelar datos privados. Usa las publicaciones disponibles para informar novedades reales y retira las que vencieron."],
        blocks: [{ type: "callout", tone: "caution", title: "Una ficha completa no promete una posición", text: "La información ayuda a las personas a saber qué haces. No asegura aparecer primero, recibir más llamadas ni conseguir ventas; la presentación en Search y Maps depende de la plataforma y otros factores." }],
      },
      {
        heading: "Ejemplo hipotético: una peluquería actualiza su ficha",
        paragraphs: ["Ejemplo educativo; no describe un negocio real ni un cambio aplicado por Vecidya."],
        blocks: [{ type: "example", title: "Una peluquería atiende con cita y recibe consultas en el local", hypothetical: true,
          context: "La peluquería recibe clientes, ofrece corte y coloración y cambia el horario algunos sábados.",
          problem: "La ficha todavía muestra un teléfono y fotos antiguos.",
          approach: "La encargada comprueba su elegibilidad y compara los datos con lo que el negocio ya publica.",
          actions: [
            "Corrige la categoría, el teléfono, el horario y los servicios; añade fotos autorizadas.",
            "Al cambiar el horario especial, actualízalo y revisa la ficha como visitante.",
            "Comprueba desde otro dispositivo que el teléfono, el enlace y el horario coinciden con lo que el negocio atiende realmente.",
          ],
          lesson: "La ficha comunica información que el negocio puede verificar; mantenerla ordenada no permite prometer una posición en Google ni un aumento de clientela.",
        }],
      },
      {
        heading: "Errores frecuentes y una rutina de mantenimiento",
        paragraphs: ["Un dato impreciso puede hacer perder una llamada o provocar un desplazamiento innecesario. Una revisión breve después de cada cambio importante ayuda a corregirlo."],
        blocks: [{ type: "steps", label: "Revisa mensualmente y después de cambios", items: [
          { title: "Comprueba elegibilidad", detail: "Consulta las normas antes de crear una ficha o añadir otra ubicación." },
          { title: "Compara canales", detail: "Contrasta nombre, zona, contacto y horarios con el sitio." },
          { title: "Revisa accesos y duplicados", detail: "Retira accesos innecesarios; busca una ficha existente antes de crear otra." },
          { title: "Actualiza contenido", detail: "Corrige fotos y avisos vencidos; responde reseñas con respeto." },
          { title: "Prueba los enlaces", detail: "Comprueba la ruta y el contacto desde un teléfono." },
        ] }, { type: "summary", items: [
          "Confirma elegibilidad y publica datos reales.",
          "Actualiza horarios, servicios, fotos y avisos; responde reseñas sin revelar datos.",
          "Comprueba que la información coincida con la web.",
          "No prometas posiciones ni resultados.",
        ] }],
      },
      {
        heading: "Mantén los datos coherentes con tu web",
        paragraphs: ["Mantén iguales en la web y el perfil el nombre, la zona, los horarios, el teléfono y los servicios vigentes. Actualiza ambos cuando algo cambie."],
        blocks: [{ type: "callout", tone: "tip", title: "Comprueba el recorrido completo", text: "Abre el perfil como visitante, sigue el enlace a tu web y confirma que los datos coincidan y el contacto funcione." }],
      },
      {
        heading: "Fuentes oficiales",
        paragraphs: ["Las funciones y reglas pueden cambiar y variar por categoría o país. Confirma siempre el contenido de ayuda vigente para tu caso."],
        blocks: [{ type: "sources", items: [
          { label: "Guidelines for representing your business on Google — Google Business Profile Help", url: "https://support.google.com/business/answer/3038177?hl=en", scope: "Requisitos de elegibilidad, representación del negocio, nombre, categorías, dirección, áreas de servicio y horarios." },
          { label: "Edit your Business Profile on Google — Google Business Profile Help", url: "https://support.google.com/business/answer/3039617?hl=en", scope: "Ayuda para actualizar la información de una ficha; opciones disponibles dependen del negocio y la interfaz vigente." },
          { label: "Manage your Business Profile photos & videos — Google Business Profile Help", url: "https://support.google.com/business/answer/6103862?hl=en", scope: "Requisitos, tipos, estado de publicación y administración de fotos y videos." },
          { label: "Tips to get more reviews — Google Business Profile Help", url: "https://support.google.com/business/answer/3474122?hl=en", scope: "Prácticas de reseñas auténticas, respuestas profesionales y prohibición de incentivos por reseñas." },
          { label: "Create & manage posts on your Business Profile — Google Business Profile Help", url: "https://support.google.com/business/answer/7342169?hl=en", scope: "Publicaciones disponibles, su revisión y recomendaciones para mantenerlas completas y pertinentes." },
        ] }],
      },
    ],
  },
  {
    slug: "organizar-consultas-mensajes-llamadas-formularios",
    category: "CRM y clientes",
    title: "Cómo organizar mensajes, llamadas y formularios sin perder consultas",
    intro: "Recibes mensajes por una red, llamadas y formularios. ¿Cómo recuerdas a quién debes responder? Empieza con una lista de pendientes clara.",
    excerpt: "Organiza mensajes, llamadas y formularios sin perder el siguiente paso.",
    enPocasPalabras: ["Reúne las consultas pendientes en un solo lugar.","Deja claro quién responde y qué hará después.","Atender una solicitud no da permiso automático para enviar publicidad."],
    image: "/assets/learn/diagram-crm.svg",
    imageAlt: "Una consulta se registra, recibe un responsable y un próximo paso hasta resolverse o cerrarse.",
    relatedSlugs: ["que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo"],
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar procesos; no es un CRM ni recibe o conserva consultas de clientes." },
    sections: [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás reunir consultas de varios canales sin perder el mensaje original, asignar responsable y dejar visible cuál es el siguiente paso.", "Práctica: toma una consulta ficticia y registra solo cinco datos: canal, motivo, estado, responsable y próxima acción. Comprueba si otra persona entendería qué falta hacer."],
        blocks: [{ type: "callout", tone: "tip", title: "El registro debe permitir continuar", text: "Si otra persona puede abrir el caso y saber qué ocurrió y qué sigue sin buscar en cinco lugares, el método está cumpliendo su función." }],
      },
      {
        heading: "Usa un registro común sin importar el canal",
        paragraphs: [
          "Elige un lugar autorizado donde el equipo compruebe qué pidió la persona y si ya tiene respuesta. No hace falta copiar toda la conversación: basta el contexto útil y su referencia original.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "Consulta", definition: "Pregunta o solicitud concreta que necesita una respuesta." },
          { term: "Próximo paso", definition: "Acción pendiente con responsable y fecha de revisión." },
        ] }],
      },
      {
        heading: "Registra solo lo necesario para responder",
        paragraphs: ["Recoge solo los datos que ayudan a atender la solicitud."],
        blocks: [{ type: "list", items: [
          "Nombre o referencia suficiente para reconocer la consulta.",
          "Canal que usó y forma de respuesta elegida.",
          "Motivo resumido con hechos; evita detalles sensibles innecesarios.",
          "Fecha, estado y último acuerdo relevante.",
          "Próxima acción, responsable y fecha para retomarla.",
        ] }],
      },
      {
        heading: "Asigna a una persona y un siguiente paso claro",
        paragraphs: ["Acuerda pocos estados claros, por ejemplo «nueva», «esperando», «pendiente interno» y «resuelta»."],
        blocks: [{ type: "steps", label: "Rutina sencilla de seguimiento", items: [
          { title: "Al recibirla", detail: "Regístrala y asigna quién responde." },
          { title: "Al cerrar el día", detail: "Revisa pendientes y pon responsable y fecha." },
          { title: "Al retomarla", detail: "Lee el contexto y responde por el canal acordado." },
          { title: "Al resolverla", detail: "Actualiza el estado y conserva solo lo necesario." },
        ] }],
      },
      {
        heading: "Ejemplo hipotético: un taller de reparación recibe consultas",
        paragraphs: ["Ejemplo hipotético; no describe un negocio real."],
        blocks: [{ type: "example", title: "Una reparación solicitada por teléfono y formulario", hypothetical: true,
          context: "Un taller recibe llamadas y formularios de cotización mientras repara vehículos.",
          problem: "Dos personas responden a la misma consulta y otra queda pendiente de confirmar una pieza.",
          approach: "El equipo registra el canal, asigna responsable y conserva el mensaje original como referencia.",
          actions: [
            "Anotar el trabajo y el canal elegido para responder.",
            "Asignar quién confirma la pieza y cuándo revisar el pendiente.",
            "Buscar una consulta abierta antes de crear otro registro.",
          ],
          lesson: "Una lista clara coordina respuestas, pero una cotización no autoriza promociones posteriores.",
        }],
      },
      {
        heading: "Evita duplicados y elige una herramienta proporcional",
        paragraphs: ["Busca por referencia antes de crear; no fusiones personas solo por un nombre compartido. Una hoja de cálculo protegida puede bastar si el equipo actualiza los pendientes. Un CRM puede ayudar cuando varias personas necesitan historial común o se pierden asignaciones. Compara permisos, exportación, conservación, soporte y coste antes de migrar."],
        blocks: [{ type: "callout", tone: "tip", title: "Acordar un registro principal evita dos versiones", text: "Define cuál lista es la referencia y cómo se corrigen duplicados. No registres la misma consulta en hojas, correos y sistemas distintos sin indicar cuál está vigente." }],
      },
      {
        heading: "Responder una consulta no equivale a consentimiento comercial",
        paragraphs: ["Responder una consulta por el canal elegido no equivale a consentimiento para enviar después ofertas o boletines. Mantén separado cualquier permiso comercial, registra solo lo expresado claramente y sigue las reglas de tu jurisdicción; esta guía no es asesoría legal."],
        blocks: [{ type: "callout", tone: "caution", title: "Una consulta no autoriza promociones", text: "El teléfono compartido para recibir una respuesta no demuestra permiso para una campaña comercial." }],
      },
      {
        heading: "Qué puedes poner en marcha hoy",
        paragraphs: [],
        blocks: [{ type: "sources", items: [
          { label: "NIST Privacy Framework", url: "https://www.nist.gov/privacy-framework", scope: "Marco voluntario para identificar y gestionar riesgos de privacidad; no es una ley universal." },
          { label: "Electronic and telephone marketing — ICO", url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/", scope: "Orientación del Reino Unido que distingue comunicaciones de servicio de marketing directo y describe las reglas PECR; los requisitos varían según jurisdicción." },
        ] }, { type: "summary", items: [
          "Reúne consultas en un registro autorizado y limita los datos.",
          "Asigna responsable, estado y próxima acción a cada pendiente.",
          "Busca duplicados y empieza con una hoja si resuelve la necesidad.",
          "Separa la respuesta solicitada del permiso para promociones futuras.",
        ] }],
      },
    ],
  },
  {
    slug: "preparar-respuestas-publicaciones-ia-sin-perder-control",
    category: "Inteligencia Artificial",
    title: "Cómo utilizar IA para preparar respuestas y publicaciones sin perder el control",
    intro: "¿Quieres ayuda para responder un mensaje o escribir una publicación? La IA puede preparar el primer borrador. La información real y la decisión de publicarlo siguen siendo tuyas.",
    excerpt: "Aprende a pedir un borrador útil, proteger datos y revisar cada frase antes de enviarla.",
    enPocasPalabras: ["La IA prepara borradores; tú confirmas los datos.","Dile qué información puede utilizar y qué no debe inventar.","Revisa y aprueba todo mensaje antes de enviarlo o publicarlo."],
    image: "/assets/learn/diagram-ai.svg",
    imageAlt: "La IA prepara un borrador que una persona revisa antes de responder o publicar.",
    relatedSlugs: ["que-puede-hacer-una-inteligencia-artificial-por-un-negocio"],
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar procesos; no genera ni aprueba respuestas o publicaciones con IA." },
    sections: [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás pedir a una IA un borrador usando datos confirmados, detectar información inventada y decidir qué debe revisar una persona antes de publicar o responder.", "Práctica: escribe una instrucción para preparar un aviso de horario usando solo dos datos confirmados. Añade una regla explícita: si falta información, debe señalarlo en vez de inventarla."],
        blocks: [{ type: "callout", tone: "tip", title: "Un borrador no es una aprobación", text: "La prueba está completa cuando puedes identificar qué parte produjo la IA y qué datos confirmó una persona antes de usar el texto." }],
      },
      {
        heading: "Pide un borrador con una instrucción clara",
        paragraphs: [
          "Indica la tarea, el público, el tono, la extensión, los datos confirmados y qué hacer si falta información.",
          "La IA genera texto, pero puede inventar datos o enlaces. El resultado es un borrador, no una fuente comprobada ni un mensaje listo para enviar.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "Borrador de IA", definition: "Texto preliminar que una persona debe revisar antes de usar." },
          { term: "Instrucción o prompt", definition: "Pedido que define tarea, contexto, formato y límites." },
        ] }],
      },
      {
        heading: "Ejemplo hipotético: responder y preparar un aviso",
        paragraphs: ["Ejemplo hipotético; la herramienta no confirma ni publica datos por el negocio."],
        blocks: [{ type: "example", title: "Una panadería prepara respuestas y publicaciones de temporada", hypothetical: true,
          context: "La dueña de una panadería quiere responder sobre el horario del sábado y anunciar un producto de temporada.",
          problem: "Un borrador podría usar el horario anterior o inventar disponibilidad y descuentos.",
          approach: "Comparte datos públicos confirmados y pide un texto que no invente ni publique nada.",
          actions: [
            "Pide una respuesta breve usando solo el horario confirmado.",
            "Pide un aviso del producto disponible y marca lo que falte confirmar.",
            "Verifica horario y menú; corrige y aprueba antes de publicar.",
          ],
          lesson: "La IA redacta; la dueña confirma los datos y aprueba el texto.",
        }],
      },
      {
        heading: "Dos instrucciones que puedes adaptar",
        paragraphs: ["Rellena corchetes con datos autorizados; no pegues una conversación privada."],
        blocks: [{ type: "list", items: [
          "Instrucción adaptable 1: «Redacta una respuesta de hasta 60 palabras sobre [horario público], con tono [cercano/profesional]. Usa solo ese dato; no inventes precios ni disponibilidad. Si falta algo, dime qué confirmar. Devuelve un borrador para revisar; no lo envíes».",
          "Instrucción adaptable 2: «Propón dos publicaciones breves para [producto confirmado] en [fecha]. Incluye [siguiente paso]. No inventes descuentos ni promesas. Marca lo pendiente con [CONFIRMAR] y entrega borradores para revisión humana».",
        ] }],
      },
      {
        heading: "Da contexto sin compartir datos sensibles",
        paragraphs: ["Usa datos públicos aprobados, como horario o servicios; reemplaza nombres por roles y elimina teléfonos, correos, historial y detalles que identifiquen a clientes.",
          "Revisa las condiciones y controles del proveedor. No pegues contraseñas, datos de salud, financieros o mensajes privados sin autorización y evaluación previa; quitar el nombre no siempre anonimiza."],
      },
      {
        heading: "Revisa exactitud, tono y destino antes de publicar",
        paragraphs: ["Contrasta nombres, fechas, precios, disponibilidad y enlaces con fuentes vigentes. Comprueba tono, privacidad y que no prometa resultados o promociones no aprobadas."],
        blocks: [{ type: "steps", label: "Revisión humana de cada borrador", items: [
          { title: "Verifica datos y enlaces", detail: "Contrasta con una fuente actual; elimina lo que no puedas confirmar." },
          { title: "Revisa público y tono", detail: "Confirma que el canal y el lenguaje encajan con la respuesta o publicación." },
          { title: "Aprueba como persona responsable", detail: "Corrige y decide si enviar; si falta información, confirma antes de publicar." },
        ] }],
      },
      {
        heading: "Errores frecuentes y límites de la IA",
        paragraphs: ["Un texto fluido aún puede equivocarse. La IA no conoce cambios recientes ni lo que puedes cumplir: confirma cada afirmación."],
        blocks: [{ type: "list", items: [
          "Pedir algo «atractivo» sin objetivo ni límites.",
          "Copiar hechos, citas, enlaces o condiciones sin verificarlos.",
          "Compartir detalles de clientes que no hacen falta.",
          "Enviar o publicar automáticamente sin aprobación humana.",
        ] }, { type: "summary", items: [
          "Define tarea, público, tono y datos aprobados.",
          "Pide que marque lo pendiente y no invente datos.",
          "Una persona verifica y aprueba antes de publicar.",
        ] }],
      },
      {
        heading: "Fuentes oficiales y orientación",
        paragraphs: ["Los controles dependen del proveedor; revisa los del servicio que utilices."],
        blocks: [{ type: "sources", items: [
          { label: "NIST AI 600-1: Generative Artificial Intelligence Profile", url: "https://doi.org/10.6028/NIST.AI.600-1", scope: "Marco del NIST de Estados Unidos que identifica riesgos de IA generativa, como información inexacta, privacidad y supervisión; no es una ley universal." },
          { label: "Prompt engineering — OpenAI API Guide", url: "https://developers.openai.com/api/docs/guides/prompt-engineering", scope: "Documentación oficial actual de OpenAI sobre cómo estructurar instrucciones y evaluar prompts; las recomendaciones pueden variar entre modelos y servicios." },
          { label: "Data controls in ChatGPT — OpenAI Help Center", url: "https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt", scope: "Describe los controles de datos disponibles en ChatGPT. Otros productos, espacios de trabajo o proveedores pueden tener controles y condiciones diferentes." },
        ] }],
      },
    ],
  },
  {
    "slug": "como-empezar-a-digitalizar-un-negocio-desde-cero",
    "category": "Negocios digitales",
    "title": "Quiero llevar mi negocio a internet: ¿por dónde empiezo?",
    "intro": "No necesitas comprar cinco programas ni abrir todas las redes. Empieza por entender qué haces hoy, qué te cuesta trabajo y qué podrías resolver con una herramienta sencilla.",
    "excerpt": "Una ruta práctica para dar tus primeros pasos digitales sin gastar por impulso.",
    "enPocasPalabras": [
      "Digitalizar no es comprar aplicaciones: es trabajar mejor con ayuda de ellas.",
      "Elige un problema real antes de decidir qué herramienta necesitas.",
      "Empieza con una mejora pequeña que puedas mantener."
    ],
    "image": "/assets/learn/diagram-como-empezar.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: ordenar el trabajo, elegir una tarea y comprobar si la mejora funciona.",
    "relatedSlugs": [
      "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
      "dominio-hosting-sitio-web-como-funcionan"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Revisar mi situación",
      "to": "/diagnostico",
      "copy": "Puedes analizar tu punto de partida antes de contratar herramientas."
    },
    "sections": [
      {
        heading: "Tu objetivo: elegir el primer paso digital",
        paragraphs: ["Al terminar, podrás elegir una primera mejora digital a partir de un problema real del negocio y evitar empezar comprando herramientas que todavía no necesitas.", "Práctica: escribe una tarea que hoy te hace perder tiempo o información. Propón la mejora más pequeña que podrías probar con lo que ya tienes."],
        blocks: [{ type: "callout", tone: "tip", title: "Empieza por una fricción concreta", text: "«Quiero digitalizarme» es demasiado amplio. «Quiero dejar de perder solicitudes de cita» ya permite pensar en una mejora comprobable." }],
      },
      {
        "heading": "Empieza por una necesidad concreta",
        "paragraphs": [
          "Anotas pedidos en papeles, contestas mensajes desde tu teléfono y publicas cuando tienes un rato. Te dicen que debes digitalizarte, pero nadie te explica qué significa.",
          "Digitalizar es usar herramientas para hacer más fácil una parte del trabajo: ordenar pedidos, encontrar documentos, compartir horarios o responder una pregunta."
        ]
      },
      {
        "heading": "Tres decisiones antes de empezar",
        "paragraphs": [
          "Estos conceptos sirven para tomar decisiones. No hace falta memorizar palabras difíciles."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Herramienta digital",
                "definition": "Un recurso como el correo, una hoja de cálculo, una página web o una aplicación que te ayuda con una tarea."
              },
              {
                "term": "Proceso",
                "definition": "Los pasos que sigues para hacer un trabajo, desde recibir una solicitud hasta resolverla."
              },
              {
                "term": "Mejora útil",
                "definition": "Algo que reduce confusión o tiempo perdido y que puedes mantener sin depender de un experto."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza por la opción más sencilla que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Elige una dificultad",
                "detail": "Anota algo que se repite: pedidos extraviados, horarios desactualizados o tareas olvidadas."
              },
              {
                "title": "Prueba una solución sencilla",
                "detail": "Empieza con una lista, un calendario compartido o una ficha pública. No necesitas todo a la vez."
              },
              {
                "title": "Revisa qué cambió",
                "detail": "Comprueba si ahora encuentras mejor la información o resuelves más fácilmente esa tarea."
              },
              {
                "title": "Conserva lo que funciona",
                "detail": "Explica el método a quien trabaje contigo antes de añadir otra herramienta."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo sencillo: una peluquería con horarios confusos",
        "paragraphs": [
          "Situación imaginaria que sirve para practicar, no un caso real ni un resultado garantizado."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una peluquería con horarios confusos",
            "hypothetical": true,
            "context": "Una dueña responde repetidas veces cuándo abre y cómo pedir cita.",
            "problem": "Algunas personas tienen el horario antiguo y otras escriben cuando el negocio está cerrado.",
            "approach": "Actualiza el horario público y acuerda un único canal de consultas antes de pagar por reservas automáticas.",
            "actions": [
              "Anota el horario real y cuándo responde mensajes.",
              "Corrige el mismo dato en todos los perfiles que usa.",
              "Prueba con una amiga si encuentra el horario correcto."
            ],
            "lesson": "Lo digital empieza por información clara, no por una compra."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No busques hacerlo perfecto desde el primer día. Evitar estos tropiezos ya es avanzar."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Abrir perfiles que luego no podrás atender.",
              "Pagar una aplicación sin saber qué problema resuelve.",
              "Confiar en que una herramienta hará el trabajo sin responsables."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Elige hoy una fricción concreta que te haga perder tiempo, información o claridad.",
          "Prueba una sola mejora pequeña con las herramientas que ya tienes antes de comprar otra.",
          "Revisa después qué cambió y decide si mantener, ajustar o abandonar esa solución.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Tengo que aprender programación?",
                "answer": "No. La mayoría de las tareas básicas se realizan con herramientas comunes y hábitos de organización."
              },
              {
                "question": "¿Necesito una página web desde el primer día?",
                "answer": "No siempre. Primero define qué necesita encontrar una persona interesada y cómo mantener esa información."
              },
              {
                "question": "¿Qué hago si solo tengo un teléfono?",
                "answer": "Puedes empezar con tareas sencillas desde el móvil. Protege el acceso y haz copias de tus archivos importantes."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas referencias aportan orientación general. Si una decisión afecta leyes, dinero o datos delicados, verifica las obligaciones de tu país y sector."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Competencias digitales — Unión Internacional de Telecomunicaciones",
                "url": "https://www.itu.int/itu-d/reports/statistics/global-connectivity-report-2025/",
                "scope": "Explica áreas de habilidades que van más allá de saber abrir aplicaciones."
              },
              {
                "label": "Marco DigComp — Comisión Europea",
                "url": "https://esco.ec.europa.eu/en/about-esco/escopedia/escopedia/european-digital-competence-framework-citizens-digcomp",
                "scope": "Organiza las habilidades para buscar información, comunicarse, crear, protegerse y resolver problemas."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "que-necesita-un-negocio-para-usar-internet-y-herramientas",
    "category": "Tecnología explicada",
    "title": "¿Qué equipo e internet necesitas para trabajar en digital?",
    "intro": "¿Hace falta una computadora cara? ¿Cuántas aplicaciones deberías instalar? Antes de gastar, revisa qué tareas harás y qué conexión tienes.",
    "excerpt": "Aprende a elegir teléfono, computadora, conexión y herramientas según tareas reales.",
    "enPocasPalabras": [
      "Empieza con el dispositivo que permite hacer bien tu trabajo.",
      "Una conexión confiable importa más que tener muchos programas.",
      "Protege el equipo y prepara una alternativa cuando se vaya internet."
    ],
    "image": "/assets/learn/diagram-que-necesita.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: definir la tarea, usar equipo suficiente y preparar una alternativa si falla la conexión.",
    "relatedSlugs": [
      "como-empezar-a-digitalizar-un-negocio-desde-cero",
      "dominio-hosting-sitio-web-como-funcionan"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Conocer los primeros pasos",
      "to": "/aprende",
      "copy": "Puedes seguir con otras guías básicas antes de invertir en tecnología."
    },
    "sections": [
      {
        heading: "Tu objetivo: preparar el trabajo digital",
        paragraphs: ["Al terminar, podrás relacionar una tarea digital con el equipo, la conexión y el plan alternativo que realmente necesita, sin asumir que debes comprar lo más potente.", "Práctica: elige una tarea —responder mensajes, cobrar, editar documentos o hacer videollamadas— y anota qué dispositivo, conexión y alternativa mínima necesita."],
        blocks: [{ type: "callout", tone: "tip", title: "Compra para la tarea", text: "El equipo adecuado es el que sostiene tu trabajo con fiabilidad. Más potencia o más aplicaciones no son una mejora si no resuelven una necesidad concreta." }],
      },
      {
        "heading": "Qué tareas necesitas resolver",
        "paragraphs": [
          "Un pequeño taller usa un teléfono para mensajes y fotos de sus trabajos. Una persona le recomienda comprar un equipo costoso para 'ponerse al día'.",
          "La pregunta útil no es cuál es el equipo más moderno, sino qué tareas necesitas cumplir: recibir pedidos, escribir presupuestos, guardar archivos o atender videollamadas."
        ]
      },
      {
        "heading": "Equipo, conexión y aplicaciones cumplen funciones distintas",
        "paragraphs": [
          "Estos conceptos sirven para tomar decisiones. No hace falta memorizar palabras difíciles."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Dispositivo",
                "definition": "El teléfono, tableta o computadora con el que realizas una tarea."
              },
              {
                "term": "Conexión",
                "definition": "La forma de acceder a internet, como una red móvil o una conexión fija."
              },
              {
                "term": "Aplicación",
                "definition": "Un programa para una tarea concreta. Instalar más no significa trabajar mejor."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza por la opción más sencilla que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Anota las tareas",
                "detail": "Separa mensajes, fotos, facturas, tablas y reuniones. Mira cuál cuesta más hacer."
              },
              {
                "title": "Revisa lo que tienes",
                "detail": "Comprueba si el equipo actual es suficiente y recibe actualizaciones de seguridad."
              },
              {
                "title": "Prueba la conexión",
                "detail": "Verifica si envías archivos o atiendes llamadas de manera estable en tu lugar de trabajo."
              },
              {
                "title": "Prepara una alternativa",
                "detail": "Decide qué datos necesitas sin conexión y cómo atenderás cuando falle internet."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo sencillo: una costurera que trabaja desde el móvil",
        "paragraphs": [
          "Situación imaginaria que sirve para practicar, no un caso real ni un resultado garantizado."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una costurera que trabaja desde el móvil",
            "hypothetical": true,
            "context": "Recibe fotos de prendas, confirma trabajos y anota medidas autorizadas.",
            "problem": "Las fotos se mezclan con archivos personales y cuesta recuperar una solicitud.",
            "approach": "Antes de comprar computadora, crea carpetas de trabajo y una lista de pedidos sin datos innecesarios.",
            "actions": [
              "Separa carpetas por mes o pedido.",
              "Anota el estado de cada encargo en una lista protegida.",
              "Comprueba si puede encontrar un pedido antiguo sin buscar en todas sus conversaciones."
            ],
            "lesson": "Organizar lo que ya tiene puede aportar más que comprar otro equipo."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No busques hacerlo perfecto desde el primer día. Evitar estos tropiezos ya es avanzar."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Elegir equipos por moda en vez de necesidades.",
              "Compartir el teléfono sin bloqueo ni cuentas separadas.",
              "Depender de una sola conexión para todas las tareas críticas."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Relaciona cada tarea importante con el dispositivo y la conexión mínimos que necesita.",
          "Comprueba batería, actualizaciones, espacio y acceso antes de asumir que necesitas equipo nuevo.",
          "Escribe una alternativa para la tarea esencial si internet o el dispositivo dejan de funcionar.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Un teléfono es suficiente para empezar?",
                "answer": "En muchos casos sí, si puedes realizar las tareas con claridad y seguridad."
              },
              {
                "question": "¿Siempre necesito internet?",
                "answer": "Algunas tareas funcionan sin conexión, pero enviar datos o sincronizarlos requiere conectividad."
              },
              {
                "question": "¿Qué pasa si se corta la electricidad?",
                "answer": "Ten un plan realista para conservar información y avisar a quienes esperan respuesta, sin prometer disponibilidad constante."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas referencias aportan orientación general. Si una decisión afecta leyes, dinero o datos delicados, verifica las obligaciones de tu país y sector."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Competencias digitales — UIT",
                "url": "https://www.itu.int/itu-d/reports/statistics/global-connectivity-report-2025/",
                "scope": "Explica por qué usar internet no implica dominar todas las habilidades digitales."
              },
              {
                "label": "Protección de equipos — FTC",
                "url": "https://www.ftc.gov/es/guia-para-negocios/protegiendo-pequenos-negocios/ciberseguridad",
                "scope": "Recomienda actualizaciones, bloqueo y protección de dispositivos de trabajo."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "correo-para-mi-negocio-como-usarlo-sin-perder-mensajes",
    "category": "Tecnología explicada",
    "title": "¿Cómo usar el correo de tu negocio sin perder mensajes?",
    "intro": "Un correo es mucho más que una dirección para registrarte en aplicaciones. También puede servir para recibir documentos, dar seguimiento y mantener las cuentas de tu negocio bajo control.",
    "excerpt": "Organiza el correo y las cuentas de trabajo con hábitos fáciles de recordar.",
    "enPocasPalabras": [
      "Usa un correo que controles para las cuentas importantes del negocio.",
      "Escribe asuntos claros y guarda los documentos donde puedas encontrarlos.",
      "No compartas contraseñas: da acceso a cada persona cuando el servicio lo permita."
    ],
    "image": "/assets/learn/diagram-correo-para.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: recibir el mensaje, conservar su contexto y responder con claridad.",
    "relatedSlugs": [
      "como-empezar-a-digitalizar-un-negocio-desde-cero",
      "como-proteger-cuentas-contrasenas-estafas-negocio"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Seguir aprendiendo",
      "to": "/aprende",
      "copy": "Puedes continuar con seguridad y organización de archivos."
    },
    "sections": [
      {
        heading: "Tu objetivo: ordenar el correo del negocio",
        paragraphs: ["Al terminar, podrás organizar el correo para encontrar conversaciones importantes, distinguir la versión vigente de un documento y dejar pendientes visibles.", "Práctica: imagina tres correos sobre una misma compra. Decide qué asunto usarías, dónde guardarías el documento vigente y cómo marcarías que todavía falta responder."],
        blocks: [{ type: "callout", tone: "tip", title: "El correo debe conservar contexto", text: "Si puedes encontrar la conversación correcta y saber qué falta hacer sin abrir decenas de mensajes, tu organización está ayudando." }],
      },
      {
        "heading": "Qué necesitas encontrar cuando llega un correo",
        "paragraphs": [
          "Un cliente envía un documento importante. Tres días después no lo encuentras porque quedó entre promociones y mensajes de aplicaciones.",
          "Un correo organizado te ayuda a responder y guardar pruebas de acuerdos. No hace falta escribir de manera complicada."
        ]
      },
      {
        "heading": "Tres hábitos para no perder mensajes",
        "paragraphs": [
          "Estos conceptos sirven para tomar decisiones. No hace falta memorizar palabras difíciles."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Correo electrónico",
                "definition": "Un mensaje que llega a una dirección y permite adjuntar archivos."
              },
              {
                "term": "Asunto",
                "definition": "La frase breve que explica de qué trata el mensaje: por ejemplo, «Presupuesto de reparación — bicicleta»."
              },
              {
                "term": "Cuenta de recuperación",
                "definition": "Una forma segura de recuperar acceso si olvidas la contraseña de la cuenta principal."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza por la opción más sencilla que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Separa lo importante",
                "detail": "Usa etiquetas o carpetas para consultas, proveedores y documentos."
              },
              {
                "title": "Escribe asuntos útiles",
                "detail": "Evita asuntos como «Hola». Nombra la tarea o el pedido."
              },
              {
                "title": "Responde con un paso claro",
                "detail": "Indica qué recibiste y qué información falta, sin prometer fechas que no puedas cumplir."
              },
              {
                "title": "Protege la cuenta",
                "detail": "Activa verificación adicional, revisa recuperación y conserva el acceso a nombre del negocio."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo sencillo: un proveedor envió dos presupuestos",
        "paragraphs": [
          "Situación imaginaria que sirve para practicar, no un caso real ni un resultado garantizado."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Un proveedor envió dos presupuestos",
            "hypothetical": true,
            "context": "Una tienda compara dos propuestas de compra.",
            "problem": "Los correos quedaron mezclados y se envía por error una versión antigua.",
            "approach": "Se organiza el hilo por proveedor y se guarda la propuesta vigente en una carpeta con fecha.",
            "actions": [
              "Busca por el nombre del proveedor y por el asunto.",
              "Identifica la propuesta correcta por su fecha.",
              "Responde en el mismo hilo confirmando cuál se está revisando."
            ],
            "lesson": "Un asunto y una carpeta pueden evitar errores costosos."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No busques hacerlo perfecto desde el primer día. Evitar estos tropiezos ya es avanzar."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Dar la contraseña a otra persona por mensaje.",
              "Usar el correo privado de alguien como único dueño de la cuenta del negocio.",
              "Abrir enlaces urgentes sin comprobar quién los envió."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Identifica qué cuenta del negocio debe recibir avisos y recuperaciones importantes.",
          "Usa asuntos y carpetas que permitan encontrar la conversación y el documento vigente.",
          "Revisa accesos y métodos de recuperación para que una salida del equipo no bloquee el correo.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Necesito un correo con dominio propio?",
                "answer": "No para dar tus primeros pasos. Puede ser útil más adelante, pero lo importante es controlar y proteger la cuenta."
              },
              {
                "question": "¿Qué hago si recibo mensajes sospechosos?",
                "answer": "No abras enlaces por presión. Contacta al proveedor por una dirección que ya conocías."
              },
              {
                "question": "¿Puedo enviar promociones a toda mi libreta?",
                "answer": "No asumas que una dirección de contacto es permiso para campañas; consulta las reglas aplicables y las preferencias de las personas."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas referencias aportan orientación general. Si una decisión afecta leyes, dinero o datos delicados, verifica las obligaciones de tu país y sector."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Protección frente al fraude — CISA",
                "url": "https://www.cisa.gov/secure-our-world",
                "scope": "Ayuda a reconocer mensajes engañosos y proteger el acceso a cuentas."
              },
              {
                "label": "Ciberseguridad para pequeños negocios — FTC",
                "url": "https://www.ftc.gov/es/guia-para-negocios/protegiendo-pequenos-negocios/ciberseguridad",
                "scope": "Consejos para proteger correo y datos de la empresa."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-proteger-cuentas-contrasenas-estafas-negocio",
    "category": "Tecnología explicada",
    "title": "¿Cómo evitar que te roben una cuenta o te engañen por mensaje?",
    "intro": "Recibes un aviso urgente: «Tu cuenta será bloqueada, entra aquí». Antes de pulsar el enlace, aprende a reconocer señales de engaño y a proteger las cuentas de tu negocio.",
    "excerpt": "Contraseñas únicas, verificación adicional y señales de estafa explicadas sin tecnicismos.",
    "enPocasPalabras": [
      "No reutilices contraseñas; considera un gestor de contraseñas confiable.",
      "Activa la verificación en dos pasos en las cuentas importantes.",
      "Si un mensaje te mete prisa, verifica por el canal oficial antes de actuar."
    ],
    "image": "/assets/learn/diagram-como-proteger.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: usar una clave diferente, añadir un segundo control y verificar avisos sospechosos.",
    "relatedSlugs": [
      "correo-para-mi-negocio-como-usarlo-sin-perder-mensajes",
      "como-hacer-copias-de-seguridad-de-tu-negocio"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Ver más guías básicas",
      "to": "/aprende",
      "copy": "Proteger una cuenta también es una habilidad digital que se aprende."
    },
    "sections": [
      {
        heading: "Tu objetivo: reconocer engaños y proteger cuentas",
        paragraphs: ["Al terminar, podrás reconocer señales comunes de suplantación, proteger cuentas importantes y verificar un aviso urgente sin entregar tu contraseña o un código de acceso.", "Práctica: imagina que recibes «tu cuenta se cerrará hoy». Escribe qué comprobarías desde la aplicación o sitio oficial antes de pulsar el enlace del mensaje."],
        blocks: [{ type: "callout", tone: "tip", title: "La urgencia no demuestra autenticidad", text: "Una petición inesperada de contraseña o código merece verificación por un canal conocido, aunque el mensaje parezca venir de una empresa real." }],
      },
      {
        "heading": "Qué señales pueden indicar un engaño",
        "paragraphs": [
          "Llega un mensaje que parece de un servicio conocido. Dice que perderás la cuenta en una hora y te pide contraseña o código.",
          "Las estafas suelen aprovechar la urgencia. Una cuenta protegida y un hábito de verificación reducen riesgos, aunque no los eliminan por completo."
        ]
      },
      {
        "heading": "Tres hábitos que protegen tus cuentas",
        "paragraphs": [
          "Estos conceptos sirven para tomar decisiones. No hace falta memorizar palabras difíciles."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Contraseña única",
                "definition": "Una clave diferente para cada cuenta. Reutilizarla expone varias si una se filtra."
              },
              {
                "term": "Verificación en dos pasos",
                "definition": "Un segundo control para acceder: por ejemplo, una aplicación de autenticación o llave de seguridad."
              },
              {
                "term": "Suplantación",
                "definition": "Cuando alguien finge ser una empresa o persona para robar información o conseguir dinero."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza por la opción más sencilla que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Cambia claves repetidas",
                "detail": "Empieza por correo, redes, cobros y servicios donde guardas datos."
              },
              {
                "title": "Activa la verificación adicional",
                "detail": "Guarda los métodos de recuperación en un lugar protegido."
              },
              {
                "title": "Verifica avisos urgentes",
                "detail": "Abre la aplicación o web oficial por tu cuenta, sin seguir el enlace sospechoso."
              },
              {
                "title": "Prepara la recuperación",
                "detail": "Mantén actualizados los métodos autorizados para recuperar acceso y revísalos periódicamente."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo sencillo: el supuesto aviso de una red social",
        "paragraphs": [
          "Situación imaginaria que sirve para practicar, no un caso real ni un resultado garantizado."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "El supuesto aviso de una red social",
            "hypothetical": true,
            "context": "Una emprendedora recibe un mensaje: «Te cerramos tu página hoy».",
            "problem": "El enlace lleva a una página que pide contraseña y un código de acceso.",
            "approach": "En vez de entrar, abre directamente la aplicación conocida y comprueba notificaciones.",
            "actions": [
              "No responde al mensaje ni comparte el código.",
              "Accede desde la aplicación oficial que ya utiliza.",
              "Si detecta actividad extraña, cambia el acceso y solicita ayuda por el soporte oficial."
            ],
            "lesson": "La prisa del mensaje no demuestra que sea verdadero."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No busques hacerlo perfecto desde el primer día. Evitar estos tropiezos ya es avanzar."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Compartir códigos de verificación con quien llama.",
              "Usar la misma clave en correo, banco y redes.",
              "Pagar para recuperar una cuenta sin verificar el canal."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Cambia primero las contraseñas reutilizadas de las cuentas que permiten recuperar las demás.",
          "Activa una segunda comprobación de acceso y guarda los métodos de recuperación.",
          "Practica verificar avisos urgentes desde la aplicación o dirección oficial, no desde el enlace recibido.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Es suficiente una contraseña larga?",
                "answer": "Es una buena base, pero conviene usar claves únicas y verificación adicional."
              },
              {
                "question": "¿Qué hago si ya envié mi contraseña?",
                "answer": "Cámbiala desde el servicio oficial, cierra sesiones si puedes y revisa accesos y recuperación. Busca asistencia especializada si corresponde."
              },
              {
                "question": "¿La verificación en dos pasos elimina todas las estafas?",
                "answer": "No. Reduce riesgos de acceso no autorizado, pero debes seguir comprobando mensajes y solicitudes."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas referencias aportan orientación general. Si una decisión afecta leyes, dinero o datos delicados, verifica las obligaciones de tu país y sector."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Protege tu mundo digital — CISA",
                "url": "https://www.cisa.gov/secure-our-world",
                "scope": "Pasos oficiales sobre contraseñas, verificación adicional y mensajes sospechosos."
              },
              {
                "label": "Ciberseguridad para negocios — FTC",
                "url": "https://www.ftc.gov/business-guidance/small-businesses/cybersecurity",
                "scope": "Guía para pequeñas empresas sobre suplantación, protección de datos y personal."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-hacer-copias-de-seguridad-de-tu-negocio",
    "category": "Tecnología explicada",
    "title": "Si se rompe tu teléfono, ¿cómo recuperas los archivos del negocio?",
    "intro": "Piensa en tus fotos, presupuestos, documentos y listas de pedidos. Si hoy pierdes el teléfono, ¿podrías volver a encontrarlos? Una copia de seguridad puede evitar un problema grande.",
    "excerpt": "Carpetas sencillas, copias protegidas y una prueba de recuperación para archivos de trabajo.",
    "enPocasPalabras": [
      "Organiza los documentos antes de copiarlos para encontrarlos después.",
      "Mantén una copia protegida que no dependa del mismo teléfono.",
      "Prueba a recuperar un archivo: una copia que nunca se comprobó podría fallar."
    ],
    "image": "/assets/learn/diagram-como-hacer.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: organizar archivos, guardar otra copia y probar que la recuperación funciona.",
    "relatedSlugs": [
      "como-empezar-a-digitalizar-un-negocio-desde-cero",
      "como-proteger-cuentas-contrasenas-estafas-negocio"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Ver otras guías prácticas",
      "to": "/aprende",
      "copy": "Puedes seguir con el uso seguro de otras herramientas cotidianas."
    },
    "sections": [
      {
        heading: "Tu objetivo: recuperar archivos importantes",
        paragraphs: ["Al terminar, podrás decidir qué archivos no puedes permitirte perder, crear una copia separada y comprobar que realmente sabes recuperarla.", "Práctica: elige un archivo importante. Anota dónde está el original, dónde estaría la copia y qué pasos seguirías para recuperarlo si el dispositivo principal dejara de funcionar."],
        blocks: [{ type: "callout", tone: "tip", title: "Una copia sirve si puedes recuperarla", text: "Guardar archivos en otro lugar es solo la mitad del trabajo. Prueba periódicamente que la copia existe, se abre y contiene la versión que necesitas." }],
      },
      {
        "heading": "Qué archivos necesitas recuperar",
        "paragraphs": [
          "Una persona cambia de teléfono y descubre que las fotos de sus productos solo estaban en el equipo anterior.",
          "Guardar documentos en carpetas o en internet ayuda, pero una copia de seguridad es una segunda versión que puedas recuperar cuando algo falla."
        ]
      },
      {
        "heading": "Copia, sincronización y recuperación no son lo mismo",
        "paragraphs": [
          "Estos conceptos sirven para tomar decisiones. No hace falta memorizar palabras difíciles."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Carpeta",
                "definition": "Un lugar para reunir archivos relacionados: fotos, presupuestos o facturas."
              },
              {
                "term": "Almacenamiento en la nube",
                "definition": "Un servicio que guarda archivos en servidores a los que puedes acceder con tu cuenta y permisos."
              },
              {
                "term": "Copia de seguridad",
                "definition": "Una versión adicional y protegida para recuperar información si se pierde o daña la principal."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza por la opción más sencilla que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Identifica lo importante",
                "detail": "Escoge documentos y archivos que necesitarías para seguir trabajando."
              },
              {
                "title": "Ordénalos con nombres simples",
                "detail": "Por ejemplo, «presupuestos-2026» y un archivo con fecha y servicio, sin incluir datos sensibles en nombres públicos."
              },
              {
                "title": "Guarda otra copia protegida",
                "detail": "Utiliza un servicio confiable o dispositivo separado según la sensibilidad de los datos."
              },
              {
                "title": "Haz una prueba",
                "detail": "Abre una copia desde otro dispositivo autorizado y comprueba que puedes recuperar un archivo."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo sencillo: una tienda pierde las fotos de temporada",
        "paragraphs": [
          "Situación imaginaria que sirve para practicar, no un caso real ni un resultado garantizado."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una tienda pierde las fotos de temporada",
            "hypothetical": true,
            "context": "Una tienda toma fotos de sus productos con un teléfono.",
            "problem": "El teléfono falla y las imágenes no existen en otra parte.",
            "approach": "Crea carpetas por colección y copias periódicas en un lugar seguro.",
            "actions": [
              "Guarda una carpeta de fotografías originales.",
              "Crea una copia fuera del teléfono que utiliza a diario.",
              "Comprueba que puede abrir y recuperar una imagen de la copia."
            ],
            "lesson": "La prueba de recuperación es tan importante como pulsar «guardar»."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No busques hacerlo perfecto desde el primer día. Evitar estos tropiezos ya es avanzar."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Pensar que sincronizar siempre equivale a tener una copia independiente.",
              "Guardar toda la información en un único teléfono.",
              "Compartir carpetas con permisos más amplios de los necesarios."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Elige los archivos que no podrías reconstruir con facilidad y confirma dónde está el original.",
          "Crea una copia separada y protegida con una frecuencia que puedas mantener.",
          "Restaura un archivo de prueba para comprobar que la copia realmente sirve.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿La nube es obligatoria?",
                "answer": "No. Puedes usar otros medios protegidos, pero necesitas una copia separada y una forma segura de acceder a ella."
              },
              {
                "question": "¿Con qué frecuencia hago copias?",
                "answer": "Depende de cuánto cambien tus datos y cuánto puedes permitirte perder. Decide una rutina realista."
              },
              {
                "question": "¿Puedo guardar datos de clientes?",
                "answer": "Guarda solo lo necesario, protege el acceso y cumple las reglas aplicables a tus datos."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas referencias aportan orientación general. Si una decisión afecta leyes, dinero o datos delicados, verifica las obligaciones de tu país y sector."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Ciberseguridad básica — FTC",
                "url": "https://www.ftc.gov/es/guia-para-negocios/protegiendo-pequenos-negocios/ciberseguridad",
                "scope": "Recomienda copias periódicas, actualizaciones y accesos limitados."
              },
              {
                "label": "Organizar archivos — Google Drive Help",
                "url": "https://support.google.com/drive/answer/2375091?hl=en",
                "scope": "Explica carpetas y nombres de archivos para encontrar información."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "hojas-de-calculo-para-organizar-un-negocio-pequeno",
    "category": "Tecnología explicada",
    "title": "¿Para qué sirve una hoja de cálculo en un negocio pequeño?",
    "intro": "No hace falta ser experto en números. Una tabla sencilla puede ayudarte a recordar pedidos, ordenar gastos o revisar existencias sin depender de la memoria.",
    "excerpt": "Aprende a crear tu primera tabla útil con columnas claras, datos mínimos y revisiones simples.",
    "enPocasPalabras": [
      "Cada fila representa un registro; cada columna guarda un dato concreto.",
      "Empieza con pocas columnas que realmente usarás.",
      "Una tabla ordenada ayuda a revisar pendientes, pero no sustituye una contabilidad profesional cuando hace falta."
    ],
    "image": "/assets/learn/diagram-hojas-de.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: registrar datos, revisar pendientes y mantener la tabla actualizada.",
    "relatedSlugs": [
      "organizar-consultas-mensajes-llamadas-formularios",
      "como-hacer-copias-de-seguridad-de-tu-negocio"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Seguir con otras herramientas",
      "to": "/aprende",
      "copy": "Puedes explorar guías sobre datos, comunicación y organización."
    },
    "sections": [
      {
        heading: "Tu objetivo: crear una hoja de cálculo útil",
        paragraphs: ["Al terminar, podrás decidir cuándo una hoja de cálculo basta para organizar un proceso sencillo y cómo estructurarla para que otra persona pueda mantenerla.", "Práctica: piensa en pedidos, citas o inventario. Define qué representa cada fila, qué cuatro columnas necesitas y quién actualizará el estado."],
        blocks: [{ type: "callout", tone: "tip", title: "Una tabla necesita una regla de uso", text: "La hoja no organiza el negocio por sí sola. Debe estar claro qué se registra, quién lo actualiza y cuál es la versión vigente." }],
      },
      {
        "heading": "Qué tarea puede resolver una hoja de cálculo",
        "paragraphs": [
          "En una libreta tienes encargos, pagos pendientes y una lista de materiales. Encontrar el estado de un pedido te lleva demasiado tiempo.",
          "Una hoja de cálculo es como una libreta organizada en casillas. Puedes buscar, ordenar y sumar sin tener que crear un programa."
        ]
      },
      {
        "heading": "Tres reglas para mantener la tabla confiable",
        "paragraphs": [
          "Estos conceptos sirven para tomar decisiones. No hace falta memorizar palabras difíciles."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Fila",
                "definition": "Una línea que representa un pedido, producto u otra unidad de trabajo."
              },
              {
                "term": "Columna",
                "definition": "El tipo de dato que guardas: fecha, tarea, importe o estado."
              },
              {
                "term": "Filtro",
                "definition": "Una forma de ver solo las filas que cumplen una condición, como «pendiente»."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza por la opción más sencilla que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Elige una sola tarea",
                "detail": "Por ejemplo, el seguimiento de pedidos. No mezcles todo el negocio en una sola tabla."
              },
              {
                "title": "Prepara cuatro columnas",
                "detail": "Fecha, pedido, responsable y estado pueden ser suficientes para empezar."
              },
              {
                "title": "Registra ejemplos sin datos privados",
                "detail": "Prueba con pedidos ficticios antes de introducir información real."
              },
              {
                "title": "Revísala cada semana",
                "detail": "Corrige errores, elimina duplicados y protege el acceso."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo sencillo: una panadería controla encargos",
        "paragraphs": [
          "Situación imaginaria que sirve para practicar, no un caso real ni un resultado garantizado."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una panadería controla encargos",
            "hypothetical": true,
            "context": "Recibe pedidos de tartas para distintos días.",
            "problem": "No siempre está claro cuáles siguen pendientes.",
            "approach": "Usa una tabla simple: fecha, tipo de encargo, estado y persona responsable.",
            "actions": [
              "Anota cada encargo autorizado en una fila.",
              "Marca «pendiente», «en preparación» o «entregado».",
              "Filtra los pedidos pendientes para revisar los siguientes."
            ],
            "lesson": "La tabla sirve cuando alguien se responsabiliza de mantenerla al día."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No busques hacerlo perfecto desde el primer día. Evitar estos tropiezos ya es avanzar."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Crear veinte columnas que nadie completa.",
              "Compartir toda la tabla con personas que no necesitan verla.",
              "Confundir una lista operativa con facturación o registros contables exigidos por ley."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Elige un solo proceso sencillo para organizar, como pedidos, citas o pendientes.",
          "Define qué representa cada fila y conserva solo las columnas que el equipo utilizará.",
          "Acordad quién actualiza la tabla y cuándo se revisan registros incompletos o vencidos.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Necesito pagar por una hoja de cálculo?",
                "answer": "No necesariamente. Hay opciones gratuitas y de pago; compara privacidad, acceso y facilidad de uso."
              },
              {
                "question": "¿Tengo que aprender fórmulas?",
                "answer": "No para empezar. Primero domina filas, columnas, ordenar y filtrar."
              },
              {
                "question": "¿Puedo gestionar pagos solo con esa tabla?",
                "answer": "Puede servir de apoyo, pero revisa qué registros y comprobantes exige tu actividad y la normativa local."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas referencias aportan orientación general. Si una decisión afecta leyes, dinero o datos delicados, verifica las obligaciones de tu país y sector."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Tareas básicas en Excel — Microsoft Support",
                "url": "https://support.microsoft.com/es-es/excel/basic-tasks-in-excel",
                "scope": "Explica filas, columnas, tablas y fórmulas elementales."
              },
              {
                "label": "Organizar datos y protegerlos — FTC",
                "url": "https://www.ftc.gov/business-guidance/small-businesses/cybersecurity",
                "scope": "Pautas generales para limitar accesos y proteger datos de trabajo."
              }
            ]
          }
        ]
      }
    ]
  },

  {
    "slug": "redes-sociales-o-pagina-web-que-necesita-tu-negocio",
    "category": "Negocios digitales",
    "title": "¿Redes sociales o página web? Cómo elegir sin gastar de más",
    "intro": "Publicas en redes, pero la gente sigue preguntando por horarios y servicios. ¿Necesitas una web? Primero averigua qué información no encuentran.",
    "excerpt": "Aprende qué resuelven las redes y una web, con ejemplos cercanos y sin gastar por impulso.",
    "enPocasPalabras": [
      "Las redes ayudan a conversar; una página web reúne datos que deben encontrarse fácilmente.",
      "No necesitas un sitio enorme: explica qué haces, dónde atiendes y cómo contactarte.",
      "Escoge canales que puedas mantener, no los que estén de moda."
    ],
    "image": "/assets/learn/diagram-redes-sociales.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: mostrar novedades, reunir información estable y facilitar una forma de contacto.",
    "relatedSlugs": [
      "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
      "dominio-hosting-sitio-web-como-funcionan"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Revisar mi presencia digital",
      "to": "/diagnostico",
      "copy": "Puedes revisar qué necesita tu negocio antes de crear más canales."
    },
    "sections": [
      {
        heading: "Tu objetivo: elegir el canal adecuado",
        paragraphs: ["Al terminar, podrás decidir qué función cumple una red social, una página web o una ficha de negocio y elegir solo los canales que puedas mantener.", "Práctica: escribe tres necesidades —que te descubran, que entiendan tus servicios y que te contacten— y asigna a cada una el canal que hoy podría cumplirla mejor."],
        blocks: [{ type: "callout", tone: "tip", title: "Cada canal debe tener un trabajo", text: "Si no puedes explicar para qué mantienes un canal y quién lo actualiza, abrirlo puede añadir trabajo sin mejorar la experiencia de tus clientes." }],
      },
      {
        "heading": "Qué quieres que haga quien te encuentra",
        "paragraphs": [
          "Alguien ve una foto de tu trabajo. Le interesa, pero no encuentra qué ofreces, dónde atiendes ni cómo pedir información.",
          "El problema no siempre es la falta de una página web. Puede ser que los datos importantes estén escondidos entre publicaciones."
        ]
      },
      {
        "heading": "Qué aporta cada canal",
        "paragraphs": [
          "No necesitas memorizar definiciones. Estos ejemplos te ayudan a decidir qué hacer."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Redes sociales",
                "definition": "Lugares para compartir novedades, enseñar tu trabajo y conversar; una publicación puede quedar enterrada."
              },
              {
                "term": "Página web",
                "definition": "Un lugar estable para reunir servicios, horarios, ubicación y contacto."
              },
              {
                "term": "Ficha de negocio",
                "definition": "Una presentación breve con datos esenciales y un enlace que puedas compartir."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza con algo pequeño que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Escucha las preguntas",
                "detail": "Anota las dudas más repetidas de tus visitantes."
              },
              {
                "title": "Ordena la información",
                "detail": "Escribe qué haces, dónde atiendes y cómo se consulta disponibilidad."
              },
              {
                "title": "Elige el canal",
                "detail": "Empieza con una ficha o página pequeña si eso resuelve la necesidad."
              },
              {
                "title": "Prueba desde un teléfono",
                "detail": "Pide a alguien que encuentre tu contacto sin que le des pistas."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo cotidiano: una profesora de guitarra que recibe siempre las mismas preguntas",
        "paragraphs": [
          "Caso imaginario para practicar; no describe a un cliente real ni garantiza resultados."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una profesora de guitarra que recibe siempre las mismas preguntas",
            "hypothetical": true,
            "context": "Publica videos tocando guitarra y recibe mensajes sobre clases.",
            "problem": "Cada semana explica si enseña a principiantes y cómo preguntar por horarios.",
            "approach": "Mantiene sus videos y prepara una ficha con información fácil de consultar.",
            "actions": [
              "Escribe «Clases de guitarra para principiantes, en línea».",
              "Indica cómo consultar disponibilidad sin prometer horarios libres.",
              "Comparte ese enlace y revisa qué dudas quedan."
            ],
            "lesson": "Las redes ayudan a conocer su trabajo y la ficha ayuda a entenderlo."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No necesitas hacerlo perfecto desde el principio. Estos tropiezos suelen complicar el trabajo."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Abrir muchos perfiles que luego nadie atiende.",
              "Crear una web con páginas vacías o datos contradictorios.",
              "Prometer ventas solo porque ahora existe una página."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Asigna una función a cada canal que ya mantienes: descubrir, explicar, contactar o comprar.",
          "Pausa o corrige los canales que no puedes actualizar antes de abrir otros.",
          "Prueba como visitante si la información principal y el contacto se encuentran con facilidad.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Una web me traerá más clientes?",
                "answer": "No hay garantía. Puede facilitar que alguien te entienda y te contacte, pero el resultado depende de muchos factores."
              },
              {
                "question": "¿Debo cerrar mis redes?",
                "answer": "No. Pueden complementarse si tienes tiempo para mantenerlas."
              },
              {
                "question": "¿Necesito una tienda en línea?",
                "answer": "Solo si vender y gestionar pedidos por internet forma parte de tus necesidades reales."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas fuentes ofrecen orientaciones generales. Para obligaciones sobre dinero, publicidad o datos, comprueba también las reglas de tu país y actividad."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "SEO para principiantes — Google Search Central",
                "url": "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
                "scope": "Consejos para que la información de una página sea fácil de entender y encontrar."
              },
              {
                "label": "Escritura clara — W3C WAI",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Recomienda titulares útiles y explicaciones sencillas."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-explicar-lo-que-vendes-para-que-te-entiendan",
    "category": "Negocios digitales",
    "title": "¿Qué vendes exactamente? Explícalo para que te entiendan",
    "intro": "«Ofrecemos soluciones integrales de calidad». Suena importante, pero ¿qué significa? Una buena presentación debería decir qué haces sin obligar a adivinar.",
    "excerpt": "Cambia frases vacías por explicaciones concretas que suenen cercanas y verdaderas.",
    "enPocasPalabras": [
      "Di qué haces, para quién y cómo pueden preguntarte.",
      "Cambia palabras vagas por ejemplos reales de tu trabajo.",
      "Pide a alguien que no te conozca que te diga qué entendió."
    ],
    "image": "/assets/learn/diagram-como-explicar.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: decir qué haces, explicar para quién y ofrecer un siguiente paso.",
    "relatedSlugs": [
      "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
      "redes-sociales-o-pagina-web-que-necesita-tu-negocio"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Consultar sobre mi negocio",
      "to": "/contacto",
      "copy": "Si buscas comunicar mejor tu trabajo, podemos conversar sobre tu necesidad."
    },
    "sections": [
      {
        heading: "Tu objetivo: explicar tu oferta con claridad",
        paragraphs: ["Al terminar, podrás explicar en una frase qué haces, para quién y cuál es el siguiente paso sin esconder la oferta detrás de eslóganes vagos.", "Práctica: completa «Ayudo a ___ a resolver ___ mediante ___». Después añade qué debe hacer la persona si quiere preguntar o comprar."],
        blocks: [{ type: "callout", tone: "tip", title: "La claridad vence al adjetivo", text: "Si alguien que no conoce tu negocio puede decir qué ofreces y para quién después de leer una frase, la explicación está haciendo su trabajo." }],
      },
      {
        "heading": "Empieza por la pregunta del cliente",
        "paragraphs": [
          "«Transformamos experiencias mediante soluciones innovadoras». Un cliente que no te conoce quizá no pueda imaginar qué vendes.",
          "«Reparamos computadoras y explicamos el problema antes de hacer cambios». La segunda frase es más directa y permite entender el trabajo."
        ]
      },
      {
        "heading": "Tres datos para explicar lo que ofreces",
        "paragraphs": [
          "No necesitas memorizar definiciones. Estos ejemplos te ayudan a decidir qué hacer."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Qué haces",
                "definition": "El servicio o producto concreto que ofreces."
              },
              {
                "term": "Para quién",
                "definition": "Las personas o negocios que realmente puedes atender."
              },
              {
                "term": "Siguiente paso",
                "definition": "Lo que alguien puede hacer después de leer: consultar, pedir información o reservar si está disponible."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza con algo pequeño que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Escribe un verbo simple",
                "detail": "Reparo, enseño, preparo, pinto, diseño o vendo."
              },
              {
                "title": "Explica a quién atiendes",
                "detail": "No hace falta afirmar que eres para todo el mundo."
              },
              {
                "title": "Aclara lugar o modalidad",
                "detail": "Cuenta si trabajas por cita, a domicilio, en línea o en un local."
              },
              {
                "title": "Muestra el contacto real",
                "detail": "Utiliza un canal que puedas atender y revisa el enlace."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo cotidiano: una pastelera que quiere explicar sus pedidos",
        "paragraphs": [
          "Caso imaginario para practicar; no describe a un cliente real ni garantiza resultados."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una pastelera que quiere explicar sus pedidos",
            "hypothetical": true,
            "context": "Publica fotos de pasteles hechos por encargo.",
            "problem": "Su perfil dice «endulzamos sueños», pero no explica si acepta pedidos.",
            "approach": "Presenta la actividad real, sin inventar plazos, cantidades ni precios.",
            "actions": [
              "Escribe «Preparamos pasteles personalizados por encargo».",
              "Cuenta dónde se entregan o recogen, si lo tiene definido.",
              "Indica cómo consultar disponibilidad."
            ],
            "lesson": "Una frase más concreta ayuda a que la persona haga la pregunta correcta."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No necesitas hacerlo perfecto desde el principio. Estos tropiezos suelen complicar el trabajo."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Escribir solo adjetivos como «líder», «mejor» o «innovador».",
              "Prometer resultados que no se pueden demostrar.",
              "Esconder el contacto detrás de frases confusas."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Reescribe tu descripción usando qué haces, para quién y qué problema ayudas a resolver.",
          "Añade un ejemplo concreto que sustituya una frase vaga o un adjetivo sin evidencia.",
          "Pide a alguien que no conozca el negocio que te diga qué entendió y cuál sería el siguiente paso.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Necesito publicar mis precios?",
                "answer": "Depende del servicio. Si varían, puedes explicar cómo se prepara un presupuesto."
              },
              {
                "question": "¿Y si hago muchas cosas?",
                "answer": "Empieza por lo que tu público necesita entender primero y organiza lo demás."
              },
              {
                "question": "¿Debo usar palabras técnicas?",
                "answer": "Solo cuando ayuden. Si alguien no las conoce, explícalas con un ejemplo."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas fuentes ofrecen orientaciones generales. Para obligaciones sobre dinero, publicidad o datos, comprueba también las reglas de tu país y actividad."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Escritura accesible — W3C",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Recomienda palabras claras, párrafos breves y enlaces descriptivos."
              },
              {
                "label": "Contenido útil — Google Search Central",
                "url": "https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=es",
                "scope": "Consejos para crear información centrada en las preguntas de las personas."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-responder-la-primera-consulta-de-un-cliente",
    "category": "CRM y clientes",
    "title": "Te escribieron por tu negocio: cómo responder sin sonar a robot",
    "intro": "Llega un «Hola, ¿cuánto cuesta?». ¿Mandas una lista enorme o contestas solo «depende»? Una respuesta útil puede ser breve, amable y honesta.",
    "excerpt": "Aprende a atender preguntas reales sin mensajes largos ni promesas que no puedes cumplir.",
    "enPocasPalabras": [
      "Saluda y responde primero lo que realmente sabes.",
      "Si faltan datos, pregunta solo lo necesario para orientar.",
      "Termina con un paso claro y respeta si la persona no continúa."
    ],
    "image": "/assets/learn/diagram-como-responder.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: escuchar la consulta, responder con claridad y acordar qué ocurrirá después.",
    "relatedSlugs": [
      "organizar-consultas-mensajes-llamadas-formularios",
      "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Conversar con Vecidya",
      "to": "/contacto",
      "copy": "Si necesitas ordenar las consultas de tu negocio, podemos conversar sobre el punto de partida."
    },
    "sections": [
      {
        heading: "Tu objetivo: responder una primera consulta",
        paragraphs: ["Al terminar, podrás responder una primera consulta con lo que sabes, pedir solo la información que falta y cerrar con un siguiente paso claro.", "Práctica: responde a «¿cuánto cuesta?» sin inventar un precio. Incluye una respuesta útil, una pregunta necesaria y qué ocurrirá después."],
        blocks: [{ type: "callout", tone: "tip", title: "No necesitas fingir certeza", text: "Una respuesta útil puede reconocer lo que todavía no sabes. Pedir el dato correcto es mejor que prometer un precio o plazo sin información suficiente." }],
      },
      {
        "heading": "Entiende qué necesita saber la persona",
        "paragraphs": [
          "Te escriben: «Hola, ¿hacen reparaciones?». Un «sí» no ayuda mucho; enviar todo el catálogo puede cansar a la persona.",
          "Puedes contestar: «¡Hola! Sí, hacemos ese tipo de reparaciones. ¿Qué equipo tienes y qué le sucede? Así podemos orientarte»."
        ]
      },
      {
        "heading": "Tres partes de una respuesta útil",
        "paragraphs": [
          "No necesitas memorizar definiciones. Estos ejemplos te ayudan a decidir qué hacer."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Consulta",
                "definition": "Una persona pide información: todavía no es una venta."
              },
              {
                "term": "Respuesta útil",
                "definition": "Información que contesta la pregunta y deja claro qué falta."
              },
              {
                "term": "Seguimiento",
                "definition": "Revisar el siguiente paso que se acordó, sin insistir sin motivo."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza con algo pequeño que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Reconoce la pregunta",
                "detail": "Saluda y menciona brevemente lo que necesita."
              },
              {
                "title": "Responde lo que sabes",
                "detail": "Da el horario, tipo de servicio o condición que esté confirmada."
              },
              {
                "title": "Pide un dato si hace falta",
                "detail": "Pregunta solo aquello que permita orientar mejor."
              },
              {
                "title": "Cierra con claridad",
                "detail": "Cuenta cuándo o cómo puedes continuar, si puedes cumplirlo."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo cotidiano: un taller y la pregunta por el ventilador",
        "paragraphs": [
          "Caso imaginario para practicar; no describe a un cliente real ni garantiza resultados."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Un taller y la pregunta por el ventilador",
            "hypothetical": true,
            "context": "Un taller recibe «¿Cuánto cuesta reparar mi ventilador?».",
            "problem": "No ha revisado el equipo y desconoce el costo.",
            "approach": "Reconoce lo que falta y pide la información imprescindible.",
            "actions": [
              "Da las gracias por escribir.",
              "Pregunta qué modelo tiene y qué falla.",
              "Explica cómo se revisa el equipo y prepara el presupuesto sin inventar el precio."
            ],
            "lesson": "La conversación puede avanzar sin fingir certeza."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No necesitas hacerlo perfecto desde el principio. Estos tropiezos suelen complicar el trabajo."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Hacer demasiadas preguntas antes de contestar algo útil.",
              "Enviar bloques de texto copiados que no responden al caso.",
              "Mandar promociones a una persona que solo pidió información."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Prepara una estructura flexible: saludo, respuesta conocida, pregunta necesaria y siguiente paso.",
          "Evita pedir información que no necesitas para orientar esa consulta.",
          "Cuando quede algo pendiente, registra quién debe responder y qué se acordó.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Cuánto debería tardar en responder?",
                "answer": "Depende de tu horario. Comunica tiempos que puedas cumplir."
              },
              {
                "question": "¿Puedo usar respuestas automáticas?",
                "answer": "Pueden ayudar con horarios o confirmaciones, pero deben ser correctas y permitir atención humana cuando haga falta."
              },
              {
                "question": "¿Y si dejan de escribir?",
                "answer": "Respeta su decisión; no envíes mensajes repetidos sin una razón acordada."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas fuentes ofrecen orientaciones generales. Para obligaciones sobre dinero, publicidad o datos, comprueba también las reglas de tu país y actividad."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Escribir para la accesibilidad — W3C",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Ayuda a comunicar mensajes breves y claros."
              },
              {
                "label": "Protección de datos — FTC",
                "url": "https://www.ftc.gov/business-guidance/resources/start-security-guide-business",
                "scope": "Recuerda guardar solo datos necesarios para una tarea."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "fotos-y-publicaciones-utiles-sin-ser-disenador",
    "category": "Negocios digitales",
    "title": "¿Qué publicar de tu negocio si no eres diseñador?",
    "intro": "Una foto bonita no explica todo. A veces basta una imagen clara y dos frases que respondan qué vendes, para quién y cómo pedir información.",
    "excerpt": "Ideas fáciles para hacer fotos, escribir publicaciones y mantener la información útil y accesible.",
    "enPocasPalabras": [
      "Publica información que resuelva una duda, no solo contenido para llenar el perfil.",
      "Usa fotos reales con buena luz y permiso cuando corresponda.",
      "Incluye un texto claro: qué muestras, para quién sirve y qué se puede hacer después."
    ],
    "image": "/assets/learn/diagram-fotos-y.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: enseñar algo real, explicar el servicio y ofrecer una forma de contacto.",
    "relatedSlugs": [
      "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
      "como-explicar-lo-que-vendes-para-que-te-entiendan"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Leer otras guías de Aprende",
      "to": "/aprende",
      "copy": "Puedes mejorar tu presencia con prácticas sencillas y verificables."
    },
    "sections": [
      {
        heading: "Tu objetivo: publicar información clara y útil",
        paragraphs: ["Al terminar, podrás preparar una publicación sencilla donde la imagen muestre algo real y el texto explique qué está viendo la persona y qué puede hacer después.", "Práctica: elige un servicio o producto real. Describe qué foto ayudaría a entenderlo, una frase concreta para acompañarla y una llamada a la acción proporcionada."],
        blocks: [{ type: "callout", tone: "tip", title: "La imagen debe aportar información", text: "Una foto útil muestra el trabajo, producto o contexto. El texto debe completar lo que la imagen no explica, no sustituirlo por adjetivos vacíos." }],
      },
      {
        "heading": "Qué debe entender quien ve la publicación",
        "paragraphs": [
          "Publicas una fotografía de un producto y la acompañas con «¡Lo mejor para ti!». Alguien interesado sigue sin saber tamaño, uso o cómo consultarlo.",
          "Una publicación útil puede mostrar el objeto con buena luz, contar para qué sirve y explicar el siguiente paso."
        ]
      },
      {
        "heading": "Tres piezas para comunicar con claridad",
        "paragraphs": [
          "No necesitas memorizar definiciones. Estos ejemplos te ayudan a decidir qué hacer."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Foto útil",
                "definition": "Una imagen real, nítida y que ayuda a entender el producto o el trabajo."
              },
              {
                "term": "Texto alternativo",
                "definition": "Una breve descripción para personas que no pueden ver la imagen cuando la plataforma lo permite."
              },
              {
                "term": "Llamada a la acción",
                "definition": "Una invitación sencilla y auténtica: por ejemplo, «Consulta disponibilidad por este canal»."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza con algo pequeño que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Piensa en una pregunta",
                "detail": "Elige una duda que recibes de verdad."
              },
              {
                "title": "Muestra algo reconocible",
                "detail": "Fotografía el producto o trabajo con luz clara, fondo que no distraiga y sin datos privados."
              },
              {
                "title": "Escribe como hablarías",
                "detail": "Usa una frase directa y comprensible."
              },
              {
                "title": "Revisa en móvil",
                "detail": "Comprueba que la imagen, el texto y el enlace se entienden desde un teléfono."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo cotidiano: una zapatería muestra un nuevo servicio",
        "paragraphs": [
          "Caso imaginario para practicar; no describe a un cliente real ni garantiza resultados."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una zapatería muestra un nuevo servicio",
            "hypothetical": true,
            "context": "El negocio ofrece reparación de suelas.",
            "problem": "Publica una imagen con el texto «excelencia y pasión» que no explica el servicio.",
            "approach": "Muestra una reparación real con permiso y escribe qué trabajo se hizo.",
            "actions": [
              "Fotografía el antes y después solo si es auténtico y autorizado.",
              "Escribe «Reparamos suelas gastadas; consulta si tu calzado admite reparación».",
              "Explica dónde pueden preguntar y evita prometer resultados idénticos."
            ],
            "lesson": "Una prueba visual honesta y una frase clara sirven más que muchos adjetivos."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No necesitas hacerlo perfecto desde el principio. Estos tropiezos suelen complicar el trabajo."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Usar fotografías ajenas sin permiso.",
              "Editar imágenes hasta que el producto parezca algo que no es.",
              "Publicar todos los días información repetida que no ayuda."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Elige una duda real de tus clientes y decide qué imagen ayudaría a responderla.",
          "Usa una foto propia o autorizada que muestre el producto, servicio o contexto con claridad.",
          "Escribe un texto breve que explique qué se ve y qué puede hacer la persona después.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Necesito una cámara profesional?",
                "answer": "No necesariamente. La buena luz, el enfoque y una descripción clara ayudan más que el equipo caro."
              },
              {
                "question": "¿Debo publicar a diario?",
                "answer": "No hay una frecuencia universal. Elige una rutina que puedas sostener con información valiosa."
              },
              {
                "question": "¿Puedo usar IA para las imágenes?",
                "answer": "Si lo haces, evita presentar como reales escenas, productos o resultados que no lo son. Revisa permisos y contexto."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas fuentes ofrecen orientaciones generales. Para obligaciones sobre dinero, publicidad o datos, comprueba también las reglas de tu país y actividad."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Imágenes y textos alternativos — W3C",
                "url": "https://www.w3.org/WAI/tutorials/images/informative/",
                "scope": "Cómo describir la información que transmite una imagen."
              },
              {
                "label": "Contenido útil — Google",
                "url": "https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=es",
                "scope": "Prioriza contenido que las personas puedan utilizar y entender."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-vender-por-internet-sin-perder-el-control-pedidos-pagos",
    "category": "Negocios digitales",
    "title": "¿Cómo empezar a recibir pedidos por internet sin complicarte?",
    "intro": "Vender por internet no empieza instalando una tienda. Empieza cuando sabes explicar el producto, confirmar el pedido, cobrar de forma segura y cumplir lo prometido.",
    "excerpt": "Organiza pedidos, entregas, cobros y atención antes de abrir una tienda en línea.",
    "enPocasPalabras": [
      "Aclara el producto, el precio confirmado, la entrega y las condiciones antes de cobrar.",
      "Utiliza servicios de pago confiables y verifica sus costos y requisitos.",
      "Lleva un registro de pedidos y explica cómo resolver cambios o problemas."
    ],
    "image": "/assets/learn/diagram-como-vender.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: confirmar el pedido, cobrar con cuidado y cumplir la entrega acordada.",
    "relatedSlugs": [
      "hojas-de-calculo-para-organizar-un-negocio-pequeno",
      "como-responder-la-primera-consulta-de-un-cliente"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Explorar soluciones para mi negocio",
      "to": "/servicios",
      "copy": "Puedes revisar servicios según tu necesidad; no todos requieren una tienda en línea."
    },
    "sections": [
      {
        heading: "Tu objetivo: organizar pedidos de principio a fin",
        paragraphs: ["Al terminar, podrás describir un pedido desde la consulta hasta la confirmación del pago y dejar claros disponibilidad, total, entrega y comprobante.", "Práctica: simula un pedido sencillo. Escribe qué debes confirmar antes del pago, cómo comprobarías que se recibió y qué información conservarías para cumplirlo."],
        blocks: [{ type: "callout", tone: "tip", title: "Cobrar es una parte del pedido", text: "Antes de pedir un pago, confirma qué compra la persona, cuánto cuesta en total, qué disponibilidad existe y qué ocurrirá después." }],
      },
      {
        "heading": "El recorrido completo de un pedido",
        "paragraphs": [
          "Alguien ve un producto y quiere comprarlo. Falta confirmar si está disponible, cuánto cuesta entregarlo y cómo pagarlo.",
          "Abrir una tienda no resuelve esas preguntas. Antes necesitas un proceso entendible para aceptar, preparar y completar un pedido."
        ]
      },
      {
        "heading": "Tres comprobaciones antes de vender en línea",
        "paragraphs": [
          "No necesitas memorizar definiciones. Estos ejemplos te ayudan a decidir qué hacer."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Pedido",
                "definition": "Una solicitud concreta de producto o servicio con detalles y confirmación."
              },
              {
                "term": "Proveedor de pagos",
                "definition": "Un servicio que procesa cobros según sus condiciones y requisitos."
              },
              {
                "term": "Comprobante",
                "definition": "Una constancia que ayuda a documentar la operación según las reglas aplicables."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza con algo pequeño que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Explica la oferta",
                "detail": "Describe características, precio confirmado, disponibilidad y costo de envío cuando corresponda."
              },
              {
                "title": "Define el pedido",
                "detail": "Decide qué datos mínimos hacen falta y quién lo confirma."
              },
              {
                "title": "Elige cómo cobrar",
                "detail": "Revisa proveedor, comisiones, seguridad, devoluciones y requisitos locales sin guardar datos de tarjeta por tu cuenta."
              },
              {
                "title": "Acompaña la entrega",
                "detail": "Confirma condiciones, actualiza el estado y atiende problemas o devoluciones conforme a tus obligaciones."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo cotidiano: una artesana vende libretas por mensaje",
        "paragraphs": [
          "Caso imaginario para practicar; no describe a un cliente real ni garantiza resultados."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una artesana vende libretas por mensaje",
            "hypothetical": true,
            "context": "Publica fotografías de libretas hechas a mano.",
            "problem": "Algunos clientes creen que el precio incluye entrega y que todos los diseños están disponibles.",
            "approach": "Aclara existencias, opciones, costo total y plazo antes de aceptar el pago.",
            "actions": [
              "Envía la descripción real, disponibilidad y total acordado.",
              "Confirma método de pago admitido mediante proveedor reconocido.",
              "Registra pedido, comprobante y entrega según corresponda."
            ],
            "lesson": "Un proceso claro evita confusiones aunque todavía no tengas una tienda completa."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No necesitas hacerlo perfecto desde el principio. Estos tropiezos suelen complicar el trabajo."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Cobrar antes de comprobar que podrás cumplir.",
              "Pedir datos completos de tarjeta por mensajes.",
              "Copiar condiciones de devolución de otro país sin revisar las propias."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Dibuja el recorrido desde la consulta hasta la confirmación del pedido y detecta dónde podría perderse información.",
          "Confirma producto, total, disponibilidad y entrega antes de solicitar el pago.",
          "Conserva un registro del pedido y del comprobante suficiente para resolver cambios o incidencias.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Necesito una tienda en línea para empezar?",
                "answer": "No siempre; un proceso de pedidos bien explicado puede servir mientras compruebas la demanda."
              },
              {
                "question": "¿Qué medios de pago debo aceptar?",
                "answer": "Depende de tu país, proveedor, clientes y requisitos legales. Compara las opciones disponibles y seguras."
              },
              {
                "question": "¿Puedo prometer una fecha de entrega cualquiera?",
                "answer": "No. Solo confirma plazos que puedas respaldar; las obligaciones concretas cambian según la jurisdicción."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas fuentes ofrecen orientaciones generales. Para obligaciones sobre dinero, publicidad o datos, comprueba también las reglas de tu país y actividad."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Buenas prácticas de venta a distancia — FTC",
                "url": "https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule",
                "scope": "Ejemplo de requisitos estadounidenses sobre promesas de entrega y reembolsos; consulta normas locales."
              },
              {
                "label": "Protección de datos en negocios — FTC",
                "url": "https://www.ftc.gov/business-guidance/resources/start-security-guide-business",
                "scope": "Recomienda limitar los datos que se recopilan y almacenan."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "datos-de-clientes-que-puedes-pedir-y-como-protegerlos",
    "category": "CRM y clientes",
    "title": "¿Qué datos deberías pedir a un cliente y cuáles no?",
    "intro": "Para atender una consulta tal vez necesites un nombre y un medio de respuesta. Eso no significa que debas pedir dirección, documento, fecha de nacimiento o información privada.",
    "excerpt": "Aprende a pedir lo mínimo necesario, explicar para qué se usa y protegerlo con responsabilidad.",
    "enPocasPalabras": [
      "Pide solo lo necesario para atender la solicitud concreta.",
      "Aclara para qué usarás los datos y quién podrá verlos.",
      "Responder una consulta no equivale a aceptar publicidad ni campañas."
    ],
    "image": "/assets/learn/diagram-datos-de.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: pedir lo mínimo, explicar para qué se usa y proteger los datos.",
    "relatedSlugs": [
      "organizar-consultas-mensajes-llamadas-formularios",
      "como-proteger-cuentas-contrasenas-estafas-negocio"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Leer sobre protección digital",
      "to": "/aprende",
      "copy": "Puedes seguir aprendiendo antes de decidir qué datos guardar."
    },
    "sections": [
      {
        heading: "Tu objetivo: pedir solo los datos necesarios",
        paragraphs: ["Al terminar, podrás revisar un formulario o conversación y distinguir los datos necesarios para atender la solicitud de los que estás pidiendo sin una finalidad clara.", "Práctica: imagina un formulario para preguntar por una clase. Tacha cualquier campo que no necesites para entender la consulta y responderla."],
        blocks: [{ type: "callout", tone: "tip", title: "Menos datos también puede ser mejor servicio", text: "Pedir solo lo necesario reduce trabajo, exposición y dudas para la persona. Cada dato debería tener una razón comprensible." }],
      },
      {
        "heading": "Qué necesitas saber para atender la consulta",
        "paragraphs": [
          "Un formulario para preguntar horarios pide fecha de nacimiento y dirección completa. ¿De verdad hacen falta?",
          "Los datos personales merecen cuidado. Antes de pedirlos, explica qué tarea realizarás con ellos y si podrías resolverla con menos información."
        ]
      },
      {
        "heading": "Tres reglas para pedir menos datos",
        "paragraphs": [
          "No necesitas memorizar definiciones. Estos ejemplos te ayudan a decidir qué hacer."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Dato personal",
                "definition": "Información que identifica o puede identificar a una persona."
              },
              {
                "term": "Finalidad",
                "definition": "La razón concreta por la que pides un dato."
              },
              {
                "term": "Acceso limitado",
                "definition": "Dar acceso a los datos solo a quienes realmente necesitan utilizarlos."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza con algo pequeño que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Define la tarea",
                "detail": "Por ejemplo, devolver una llamada o preparar un presupuesto."
              },
              {
                "title": "Pide lo indispensable",
                "detail": "Quizá baste un nombre y un canal de respuesta; evita campos sin motivo."
              },
              {
                "title": "Explica el uso",
                "detail": "Indica con palabras claras para qué se utilizará la información."
              },
              {
                "title": "Protege y revisa",
                "detail": "Controla quién accede, cuánto se conserva y cómo se elimina según las reglas aplicables."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo cotidiano: una persona pregunta por clases",
        "paragraphs": [
          "Caso imaginario para practicar; no describe a un cliente real ni garantiza resultados."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una persona pregunta por clases",
            "hypothetical": true,
            "context": "Un profesor recibe una consulta sobre horarios.",
            "problem": "Su formulario pide domicilio, documento y varios datos no relacionados con la pregunta.",
            "approach": "Reduce el formulario al nombre de referencia, mensaje y medio de respuesta si hacen falta.",
            "actions": [
              "Elimina preguntas no necesarias para la consulta.",
              "Explica cuándo y por qué responderá.",
              "Guarda solo lo necesario y limita el acceso al responsable."
            ],
            "lesson": "Un formulario más corto también puede ser más respetuoso con las personas."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No necesitas hacerlo perfecto desde el principio. Estos tropiezos suelen complicar el trabajo."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Guardar documentos personales sin necesidad.",
              "Compartir listados de clientes en grupos sin control.",
              "Usar una consulta para enviar publicidad sin revisar el permiso y las normas aplicables."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Revisa un formulario o conversación real y elimina campos que no tengan una finalidad clara.",
          "Explica para qué se usará la información y limita quién puede acceder a ella.",
          "Separa la atención de una consulta de cualquier permiso adicional para publicidad o campañas.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Puedo guardar teléfonos de quienes preguntaron?",
                "answer": "Depende de la finalidad, el aviso y las reglas aplicables. Guarda solo lo necesario para atenderles."
              },
              {
                "question": "¿Qué hago cuando ya no necesito un dato?",
                "answer": "Revisa tus obligaciones de conservación y elimina lo que puedas de manera segura."
              },
              {
                "question": "¿Debo usar la misma política en todos los países?",
                "answer": "No. Las leyes y obligaciones cambian; busca orientación local si manejas información sensible."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas fuentes ofrecen orientaciones generales. Para obligaciones sobre dinero, publicidad o datos, comprueba también las reglas de tu país y actividad."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Start with Security — FTC",
                "url": "https://www.ftc.gov/business-guidance/resources/start-security-guide-business",
                "scope": "Explica por qué conviene recoger y guardar solo datos necesarios."
              },
              {
                "label": "Marco de privacidad — NIST",
                "url": "https://www.nist.gov/privacy-framework",
                "scope": "Orientación general sobre riesgos para las personas al utilizar información."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-pedir-resenas-reales-y-responder-criticas",
    "category": "CRM y clientes",
    "title": "¿Cómo pedir opiniones reales sin comprar reseñas?",
    "intro": "Una opinión ayuda cuando cuenta una experiencia verdadera. Inventar reseñas o pagar solo por comentarios positivos puede dañar la confianza y contravenir reglas.",
    "excerpt": "Aprende a pedir opiniones de forma respetuosa, responder críticas y evitar reseñas engañosas.",
    "enPocasPalabras": [
      "Pide opiniones auténticas sin exigir que sean positivas.",
      "No publiques reseñas inventadas, ni siquiera si una IA las redacta.",
      "Responde las críticas con calma, sin revelar información privada."
    ],
    "image": "/assets/learn/diagram-como-pedir.svg",
    "imageAlt": "Tres tarjetas muestran una secuencia: invitar a opinar, aceptar críticas y usar lo aprendido para mejorar.",
    "relatedSlugs": [
      "perfil-empresa-google-completar-y-mantener-actualizado",
      "datos-de-clientes-que-puedes-pedir-y-como-protegerlos"
    ],
    "editorialDraft": false,
    "cta": {
      "label": "Seguir aprendiendo",
      "to": "/aprende",
      "copy": "Una buena reputación se construye cumpliendo y atendiendo, no inventando testimonios."
    },
    "sections": [
      {
        heading: "Tu objetivo: gestionar opiniones auténticas",
        paragraphs: ["Al terminar, podrás pedir una opinión sin presionar por una valoración positiva y responder una crítica sin revelar información privada ni discutir públicamente.", "Práctica: redacta una solicitud neutral de reseña y una respuesta breve a una crítica por demora. Evita premios condicionados, datos del cliente y afirmaciones defensivas."],
        blocks: [{ type: "callout", tone: "tip", title: "Pide experiencia, no una puntuación", text: "Una solicitud honesta invita a contar lo ocurrido. No debe exigir una valoración positiva ni convertir un incentivo en pago por una opinión favorable." }],
      },
      {
        "heading": "Qué hace útil una reseña auténtica",
        "paragraphs": [
          "Un proveedor ofrece venderte cincuenta opiniones de cinco estrellas para mejorar tu perfil. Suena fácil, pero esas reseñas no describen experiencias reales.",
          "La confianza depende de lo que haces y de cómo respondes, también cuando algo sale mal."
        ]
      },
      {
        "heading": "Tres principios para solicitar y responder opiniones",
        "paragraphs": [
          "No necesitas memorizar definiciones. Estos ejemplos te ayudan a decidir qué hacer."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Reseña",
                "definition": "Una opinión de una persona sobre su experiencia con un negocio."
              },
              {
                "term": "Testimonio",
                "definition": "Una recomendación presentada para apoyar la reputación de un producto o servicio."
              },
              {
                "term": "Opinión falsa",
                "definition": "Un comentario que inventa una experiencia o presenta como independiente a alguien que no lo es."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo ponerlo en práctica",
        "paragraphs": [
          "Empieza con algo pequeño que puedas comprobar y mantener."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Pasos para empezar",
            "items": [
              {
                "title": "Cumple primero",
                "detail": "La mejor base para una buena opinión es un trabajo bien realizado."
              },
              {
                "title": "Pide con respeto",
                "detail": "Invita a valorar la experiencia sin presionar y siguiendo las normas de la plataforma."
              },
              {
                "title": "Acepta críticas",
                "detail": "Escucha el problema y responde con hechos sin discutir públicamente datos privados."
              },
              {
                "title": "Corrige lo necesario",
                "detail": "Usa los comentarios para revisar procesos reales del negocio."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo cotidiano: una cafetería recibe una reseña negativa",
        "paragraphs": [
          "Caso imaginario para practicar; no describe a un cliente real ni garantiza resultados."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una cafetería recibe una reseña negativa",
            "hypothetical": true,
            "context": "Una persona comenta que esperó demasiado.",
            "problem": "La dueña quiere responder discutiendo los detalles de la compra.",
            "approach": "Agradece el aviso, reconoce la experiencia sin revelar información y ofrece revisar la situación por un canal adecuado.",
            "actions": [
              "Responde con calma y sin insultos.",
              "No publica datos privados ni acusa al cliente.",
              "Revisa internamente qué ocurrió con los tiempos de espera."
            ],
            "lesson": "Responder con respeto puede ser más útil que intentar borrar toda crítica."
          }
        ]
      },
      {
        "heading": "Errores que puedes evitar",
        "paragraphs": [
          "No necesitas hacerlo perfecto desde el principio. Estos tropiezos suelen complicar el trabajo."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Comprar reseñas o inventar clientes.",
              "Premiar solamente las valoraciones positivas.",
              "Publicar datos personales al responder una queja."
            ]
          },
          {
            "type": "summary",
            "items": [
          "Pide la opinión después de una experiencia real y usa una invitación neutral.",
          "No condiciones premios, descuentos o ventajas a que la valoración sea positiva.",
          "Responde las críticas sin revelar datos privados y lleva el problema operativo al canal adecuado.",
        ]
          }
        ]
      },
      {
        "heading": "Preguntas frecuentes",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Puedo pedir una reseña después de un servicio?",
                "answer": "Sí, respetando las reglas de la plataforma y evitando presiones o incentivos engañosos."
              },
              {
                "question": "¿Y si una opinión es injusta?",
                "answer": "Puedes responder con respeto y usar el procedimiento oficial de la plataforma cuando haya incumplimientos."
              },
              {
                "question": "¿Puedo usar testimonios creados por IA?",
                "answer": "No los presentes como experiencias reales de personas que nunca existieron."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas fuentes ofrecen orientaciones generales. Para obligaciones sobre dinero, publicidad o datos, comprueba también las reglas de tu país y actividad."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Guía de opiniones y testimonios — FTC",
                "url": "https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers",
                "scope": "Explica normas de Estados Unidos sobre reseñas falsas e incentivos; revisa la normativa local."
              },
              {
                "label": "Políticas de representación de negocios — Google",
                "url": "https://support.google.com/business/answer/3038177",
                "scope": "Orientaciones oficiales para mantener la información de un perfil empresarial fiel a la realidad."
              }
            ]
          }
        ]
      }
    ]
  },

  ...learnDigitalLiteracyArticles,
  ...learnTechnical04BArticles,
  ...learnEmail04BArticles,
  ...learnBusinessOperationsArticles,
  ...learnOperations02Articles,
  ...learnManagement03Articles,
];


export const learnPathways = [
  {
    title: "Empieza desde cero",
    description: "Entiende qué necesitas, organiza tus cuentas y aprende a proteger lo importante.",
    slugs: [
      "como-empezar-a-digitalizar-un-negocio-desde-cero",
      "que-necesita-un-negocio-para-usar-internet-y-herramientas",
      "correo-para-mi-negocio-como-usarlo-sin-perder-mensajes",
      "como-proteger-cuentas-contrasenas-estafas-negocio",
      "como-hacer-copias-de-seguridad-de-tu-negocio",
    ],
  },
  {
    title: "Usa la tecnología con criterio",
    description: "Comprende primero, prioriza lo importante y conserva el control de tus herramientas y decisiones.",
    slugs: [
      "el-que-mucho-abarca-poco-aprieta-prioridades-digitales",
      "domina-la-tecnologia-sin-que-te-domine",
      "como-proteger-cuentas-contrasenas-estafas-negocio",
      "como-hacer-copias-de-seguridad-de-tu-negocio",
      "que-puede-hacer-una-inteligencia-artificial-por-un-negocio",
    ],
  },
  {
    title: "Que te encuentren y te entiendan",
    description: "Presenta tu negocio con palabras claras y elige dónde mostrarlo.",
    slugs: [
      "como-explicar-lo-que-vendes-para-que-te-entiendan",
      "redes-sociales-o-pagina-web-que-necesita-tu-negocio",
      "fotos-y-publicaciones-utiles-sin-ser-disenador",
      "perfil-empresa-google-completar-y-mantener-actualizado",
      "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
      "como-mantener-actualizada-y-confiable-tu-presencia-digital",
      "publicidad-digital-como-preparar-una-primera-campana",
    ],
  },
  {
    title: "Atiende, vende y genera confianza",
    description: "Responde bien, organiza pedidos y protege la confianza de tus clientes.",
    slugs: [
      "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo",
      "organizar-consultas-mensajes-llamadas-formularios",
      "como-responder-la-primera-consulta-de-un-cliente",
      "hojas-de-calculo-para-organizar-un-negocio-pequeno",
      "como-vender-por-internet-sin-perder-el-control-pedidos-pagos",
      "datos-de-clientes-que-puedes-pedir-y-como-protegerlos",
      "como-pedir-resenas-reales-y-responder-criticas",
    ],
  },
  {
    title: "Mejora sin complicarte",
    description: "Cuando tengas una base clara, aprende a medir, automatizar y usar IA con criterio.",
    slugs: [
      "analitica-web-que-medir-en-tu-negocio",
      "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio",
      "que-puede-hacer-una-inteligencia-artificial-por-un-negocio",
      "conectar-herramientas-digitales-sin-complicar-tu-negocio",
      "como-probar-y-supervisar-automatizaciones-sin-perder-datos",
      "como-probar-un-asistente-de-ia-con-supervision-humana",
      "preparar-respuestas-publicaciones-ia-sin-perder-control",
    ],
  },
  {
    title: "Coordina equipos y varios negocios",
    description: "Aprende a gestionar sedes, responsabilidades, herramientas y resultados sin mezclar información.",
    slugs: [
      "como-coordinar-varias-sedes-o-negocios-sin-duplicar-trabajo",
      "quien-puede-ver-cambiar-y-publicar-en-tu-empresa",
      "como-elegir-herramientas-digitales-sin-llenar-la-empresa-de-aplicaciones",
      "como-comparar-resultados-de-sedes-sin-mezclar-las-cifras",
    ],
  },
  {
    title: "Trabaja mejor cada día",
    description: "Organiza tareas, productos, formación y proyectos digitales sin complicar los procesos.",
    slugs: [
      "como-organizar-tareas-y-responsables-en-tu-equipo",
      "como-controlar-inventario-sin-perder-productos-ni-datos",
      "como-capacitar-al-equipo-en-herramientas-digitales",
      "cuando-necesita-tu-empresa-un-sistema-erp",
      "como-empezar-proyecto-digital-sin-detener-negocio",
    ],
  },
  {
    title: "Dirige y mejora con criterio",
    description: "Presupuestos, compras, continuidad y decisiones con datos e IA bajo supervisión.",
    slugs: [
      "como-preparar-presupuesto-para-herramientas-digitales",
      "como-ordenar-compras-proveedores-y-aprobaciones-en-una-empresa",
      "que-hacer-si-falla-internet-o-el-sistema-de-tu-negocio",
      "como-usar-inteligencia-artificial-en-una-empresa-con-supervision",
      "como-saber-si-una-mejora-tecnologica-funciona-en-tu-empresa",
    ],
  },
  {
    title: "Entiende y administra tu sitio web",
    description: "Primero distingue las piezas de una web; después aprende sobre DNS, correo, proveedores y renovaciones.",
    slugs: [
      "dominio-hosting-sitio-web-como-funcionan",
      "dns-https-y-correo-como-se-conecta-tu-dominio",
      "correo-profesional-dominio-registros-mx-txt",
      "https-certificados-tls-que-protegen-y-que-no",
      "como-elegir-y-cambiar-proveedor-de-dominio-y-hosting",
      "como-cambiar-proveedor-dominio-hosting-sin-perder-web-correo",
    ],
  },
] as const;

export function getLearnArticle(slug: string) {
  return learnArticles.find((article) => article.slug === slug);
}
