import { learnBusinessOperationsArticles } from "./learn-business-operations";
import { learnOperations02Articles } from "./learn-operations-02";
import { learnManagement03Articles } from "./learn-management-03";
import { learnDigitalLiteracyArticles } from "./learn-digital-literacy";
import { learnTechnical04BArticles } from "./learn-technical-04b";

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
    intro: "Aprende a preparar información confiable, detectar respuestas incorrectas y evaluar una prueba limitada.",
    excerpt: "Aprende a preparar información confiable, detectar respuestas incorrectas y evaluar una prueba limitada.",
    enPocasPalabras: ["Usa información revisada y evita compartir datos sensibles.","Comprueba respuestas inventadas y errores con una persona responsable.","Evalúa una prueba pequeña antes de ampliar su uso."],
    image: "/assets/learn/diagram-ai.svg",
    imageAlt: "Ilustración conceptual del tema de esta guía",
    relatedSlugs: ["que-puede-hacer-una-inteligencia-artificial-por-un-negocio"],
    editorialDraft: false,
    cta: { label: "Revisar mis necesidades", to: "/diagnostico", copy: "Identifica primero el problema y comprueba qué necesitas antes de contratar herramientas." },
    sections: [
      { heading: "Objetivo y práctica", paragraphs: ["Al terminar podrás identificar los riesgos y decisiones de este proceso y explicar qué comprobar antes de actuar.", "Ejercicio: describe un caso de tu negocio sin datos personales, elige una comprobación y define cuándo revisarás el resultado."] },
      {
        heading: "Cómo preparar información confiable para un asistente",
        paragraphs: ["El resultado no mejora por cargar más documentos sin orden. Empieza con una fuente pequeña, vigente y con una persona responsable de mantenerla."],
        blocks: [{ type: "steps", label: "Pasos para preparar una fuente de respuestas", items: [
          { title: "Delimita el uso", detail: "Especifica qué preguntas debe atender y qué debe rechazar o transferir. Empieza por una tarea de bajo riesgo." },
          { title: "Elige una fuente autorizada", detail: "Usa información que el negocio pueda confirmar —por ejemplo, horarios y servicios— y asigna quién la mantiene actualizada." },
          { title: "Escribe respuestas y excepciones", detail: "Separa hechos confirmados, condiciones y preguntas que requieren revisión. Incluye qué hacer si una respuesta no está en la fuente." },
          { title: "Quita lo que no necesita", detail: "No cargues historiales completos de clientes, credenciales ni datos sensibles solo porque la herramienta permita hacerlo." },
          { title: "Prueba preguntas conocidas y difíciles", detail: "Incluye preguntas claras, ambiguas, fuera de alcance y con información contradictoria. Comprueba que no invente y que transfiera cuando corresponde." },
        ] }],
      },
      {
        heading: "Errores, respuestas inventadas e información desactualizada",
        paragraphs: ["Los modelos generativos pueden producir una afirmación falsa con tono seguro, completar vacíos con suposiciones o combinar datos de forma incorrecta. También pueden repetir material viejo si la fuente no se mantiene."],
        blocks: [{ type: "callout", tone: "caution", title: "La fluidez no demuestra que sea cierto", text: "Una respuesta bien redactada no es una fuente de verificación. Contrasta nombres, fechas, precios, condiciones y cualquier afirmación concreta con el material vigente del negocio antes de usarla." }, { type: "list", items: [
          "Pide al sistema que reconozca cuando no encuentra respuesta, en lugar de completar el vacío.",
          "Verifica citas, enlaces, cálculos y resúmenes contra la fuente original.",
          "Mantén una persona responsable de corregir las respuestas y retirar información vencida.",
          "Registra los errores y las transferencias para decidir si el alcance debe cambiarse o detenerse.",
        ] }],
      },
      {
        heading: "Protección de datos y manejo prudente de información",
        paragraphs: ["Antes de introducir datos en una herramienta, averigua qué servicio los procesa, qué condiciones se aplican y quién puede acceder a ellos. La respuesta depende del proveedor, del producto, de la configuración y de la jurisdicción; no existe una garantía universal por el simple hecho de usar IA."],
        blocks: [{ type: "list", items: [
          "Envía la mínima información necesaria para la tarea; elimina nombres y datos identificables cuando no hagan falta.",
          "No ingreses contraseñas, datos financieros, información de salud ni conversaciones privadas sin autorización y evaluación previa.",
          "Revisa las condiciones del proveedor sobre uso de entradas, almacenamiento, retención, acceso, exportación y eliminación.",
          "Define quién puede usar la herramienta, qué puede compartir y cómo reportará un incidente o resultado inadecuado.",
          "Consulta las obligaciones de privacidad y tratamiento de datos aplicables a tu país y a tu caso concreto.",
        ] }, { type: "callout", tone: "caution", title: "No asumas que una conversación es privada por defecto", text: "La guía del ICO citada abajo pertenece al Reino Unido y advierte que su orientación está en revisión. Sirve como referencia, no sustituye las normas ni la asesoría de tu jurisdicción." }],
      },
      {
        heading: "Cómo diseñar una prueba piloto pequeña y medible",
        paragraphs: ["Una prueba sirve para averiguar si una tarea concreta mejora con esa herramienta en esas condiciones. No demuestra que la IA funcione para todo el negocio ni anticipa resultados de otros casos."],
        blocks: [{ type: "steps", label: "Pasos para probar IA de forma controlada", items: [
          { title: "Escoge una tarea frecuente y de bajo riesgo", detail: "Describe el trabajo actual y quién lo realiza. Si el proceso no está claro, ordénalo primero sin IA." },
          { title: "Anota un punto de comparación", detail: "Registra cómo se resuelve hoy la tarea, cuánto trabajo requiere y qué errores o demoras quieres observar. No supongas que la herramienta reducirá esos valores." },
          { title: "Establece límites antes de probar", detail: "Define fuente autorizada, datos permitidos, casos que debe transferir, quién revisará y qué condiciones obligan a detener la prueba." },
          { title: "Prueba con casos de ensayo", detail: "Usa ejemplos sintéticos o anonimizados que cubran preguntas frecuentes, ambigüedades, casos fuera de alcance y datos faltantes." },
          { title: "Supervisa una prueba acotada", detail: "Mantén revisión humana, registra correcciones y vigila el uso de datos. El periodo y el tamaño de la muestra deben corresponder al riesgo y la capacidad del negocio." },
          { title: "Decide con evidencia", detail: "Compara lo observado con los criterios que fijaste. Continúa, ajusta o detén el piloto; no extiendas el resultado más allá de los casos probados." },
        ] }],
      },
      {
        heading: "Cómo evaluar resultados sin atribuir beneficios no comprobados",
        paragraphs: ["Mide solo aspectos relacionados con la tarea y compara datos equivalentes antes y durante el piloto. Los indicadores no son promesas ni se deben interpretar fuera de su muestra."],
        blocks: [{ type: "list", items: [
          "Calidad: cuántas respuestas revisadas coinciden con la fuente aprobada y cuántas contienen información sin respaldo.",
          "Seguridad del flujo: si reconoce preguntas fuera de alcance y transfiere a una persona cuando debe hacerlo.",
          "Trabajo del equipo: tiempo real de revisión y corrección frente al proceso manual comparable.",
          "Operación: fallos, quejas, costos observados y esfuerzo para mantener actualizada la fuente.",
          "Privacidad: qué datos se ingresaron, si respetaron la regla acordada y si hubo incidentes o accesos indebidos.",
        ] }, { type: "paragraph", text: "Guarda la muestra, el periodo, los criterios y las limitaciones de la prueba. Si no hay evidencia suficiente o los errores superan el límite que fijó el negocio, ajusta o detén el piloto en vez de presentar una mejora como comprobada." }],
      },
      {
        heading: "Ejemplo: probar antes de atender a personas reales",
        paragraphs: ["Caso hipotético para convertir los límites de una prueba de IA en decisiones fáciles de comprobar."],
        blocks: [{
          type: "example",
          title: "Una academia prueba un asistente para preguntas frecuentes",
          hypothetical: true,
          context: "Una academia recibe muchas preguntas sobre horarios, ubicación y cómo solicitar información de los cursos.",
          problem: "El equipo quiere responder más rápido, pero teme que el asistente invente precios, plazas disponibles o condiciones que cambian según el curso.",
          approach: "Preparan una fuente corta con información pública revisada y prueban el asistente solo con preguntas de ensayo. Los precios, disponibilidad y decisiones de matrícula siguen en manos del equipo.",
          actions: [
            "Escribir diez preguntas frecuentes y sus respuestas confirmadas, con una persona responsable de mantenerlas.",
            "Añadir preguntas ambiguas y fuera de alcance para comprobar que el asistente reconoce cuándo no sabe responder.",
            "Revisar cada respuesta de la prueba y registrar los errores antes de permitir cualquier uso con personas reales.",
            "Detener o reducir el alcance si aparecen respuestas inventadas, datos que no deberían compartirse o errores repetidos.",
          ],
          lesson: "Una prueba útil no intenta demostrar que la IA sirve para todo. Comprueba una tarea pequeña, sus límites y la capacidad del equipo para supervisarla.",
        }],
      },
      { heading: "Resumen para aplicar", paragraphs: ["Usa información revisada y evita compartir datos sensibles.","Comprueba respuestas inventadas y errores con una persona responsable.","Evalúa una prueba pequeña antes de ampliar su uso."] },
      {
        heading: "Fuentes y alcance",
        paragraphs: ["Los marcos y guías siguientes ayudan a identificar riesgos y preguntas para una prueba. No son garantías de resultados ni reemplazan requisitos legales locales."],
        blocks: [{ type: "sources", items: [
          { label: "NIST AI Risk Management Framework (AI RMF 1.0)", url: "https://www.nist.gov/itl/ai-risk-management-framework", scope: "Marco voluntario del NIST de Estados Unidos para gestionar riesgos durante el diseño, uso y evaluación de sistemas de IA. La página oficial indica que la versión 1.0 está en revisión." },
          { label: "NIST AI 600-1: Generative Artificial Intelligence Profile", url: "https://doi.org/10.6028/NIST.AI.600-1", scope: "Perfil del NIST que describe riesgos de IA generativa como confabulación, privacidad y configuración de la relación entre personas y sistemas." },
          { label: "Guidance on AI and data protection", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/", scope: "Orientación del ICO del Reino Unido sobre IA y protección de datos. La propia página advierte que su guía está en revisión; no define obligaciones para otros países." },
        ] }],
      },    ],
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
            { question: "¿Una conversión —una acción marcada como importante— equivale a una venta?", answer: "No siempre. Depende de cómo esté configurada la medición y de qué evento se esté contando." },
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
    excerpt: "Aprende a revisar datos comerciales, contacto, reseñas, accesibilidad y seguridad en los canales que ya utilizas.",
    enPocasPalabras: ["Comprueba que horarios, servicios y contacto coincidan entre canales.","No inventes reseñas ni afirmaciones para ganar confianza.","Revisa accesibilidad, privacidad y seguridad antes de ampliar tu presencia."],
    image: "/assets/learn/diagram-presence-digital.svg",
    imageAlt: "Esquema educativo de servicios y canales digitales",
    relatedSlugs: ["antes-de-hacer-publicidad-organiza-tu-presencia-digital"],
    editorialDraft: false,
    cta: { label: "Revisar mi situación", to: "/diagnostico", copy: "Comprueba qué necesita tu negocio antes de contratar o publicar." },
    sections: [
      { heading: "Qué aprenderás", paragraphs: ["Aprende a revisar datos comerciales, contacto, reseñas, accesibilidad y seguridad en los canales que ya utilizas.", "Ejercicio: elige un canal o servicio que ya utilizas, identifica qué debes comprobar y anota quién se encargará de revisarlo."] },
      {
        heading: "Mantén los mismos datos en todos los canales",
        paragraphs: ["Compara los puntos donde el público puede encontrar información: nombre comercial, descripción, servicios disponibles, ubicación o cobertura, horarios, precios o condiciones cuando se publiquen y formas de contacto. La información no tiene que estar redactada palabra por palabra igual, pero sí ser compatible y actual."],
        blocks: [{ type: "steps", label: "Revisión de coherencia entre canales", items: [
          { title: "Haz una lista de tus espacios públicos", detail: "Incluye el sitio, el perfil de empresa, las redes sociales, directorios relevantes y enlaces que siguen apareciendo en materiales impresos o mensajes." },
          { title: "Compara datos que pueden causar una visita o una consulta equivocada", detail: "Revisa nombre, teléfono, enlace, horario, dirección, zona atendida, servicios y condiciones. Corrige primero lo que podría hacer perder una llamada, una cita o un desplazamiento." },
          { title: "Comprueba que cada afirmación siga vigente", detail: "Quita servicios que ya no se ofrecen, promociones vencidas, precios desactualizados y fotos que ya no representan el lugar o el producto." },
          { title: "Define cómo se actualizarán los cambios", detail: "Asigna una persona y un procedimiento para modificar los canales cuando cambien horarios, cobertura, personal, servicios o formas de contacto." },
        ] }],
      },
      {
        heading: "Facilita que te encuentren y se comuniquen",
        paragraphs: ["Una persona debe poder reconocer rápidamente que llegó al negocio correcto, entender si atiende su necesidad y elegir una forma de contacto que funcione. Prueba la ruta completa como visitante, no solo como administrador de la cuenta."],
        blocks: [{ type: "list", items: [
          "Usa el nombre público correcto y una descripción concreta, sin llenar perfiles de palabras clave o servicios no prestados.",
          "Escribe enlaces completos y comprueba que abran el destino correcto, sobre todo el botón de llamada, reserva, mapa, mensaje o solicitud de cotización.",
          "Revisa los canales desde un teléfono, con la sesión cerrada y una conexión móvil; confirma que el texto se lea y los controles se puedan usar.",
          "Si recibes consultas por teléfono, mensajería o formulario, confirma que el equipo pueda recibirlas y que alguien sepa quién debe contestar.",
          "Explica qué sucede después del contacto: qué datos básicos pedirás, quién responderá y si hace falta reservar o acudir al local.",
        ] }, { type: "callout", tone: "tip", title: "La acción debe describir lo que ocurrirá", text: "Un botón «Solicitar una cotización» debe llevar a un medio que realmente permita pedirla. Evita botones que parecen activos, enlaces rotos y formularios que no confirman el envío." }],
      },
      {
        heading: "Confianza sin reseñas o testimonios inventados",
        paragraphs: ["La confianza no se construye simulando aprobación. Preséntate con claridad y utiliza únicamente información que puedas respaldar. No escribas reseñas ficticias, no atribuyas frases a clientes que no las dieron ni uses estrellas o cifras sin una fuente verificable."],
        blocks: [{ type: "list", items: [
          "Muestra quién presta el servicio y cómo contactar al negocio, dentro de lo que sea pertinente y seguro publicar.",
          "Explica con precisión qué incluye un servicio, sus condiciones conocidas, límites, cobertura y pasos para solicitarlo.",
          "Usa fotografías propias, actuales y representativas; pide autorización para publicar imágenes identificables y respeta derechos de terceros.",
          "Si compartes comentarios o casos reales, confirma que sean auténticos, pertinentes, autorizados y presentados sin alterar su sentido. Identifica patrocinios o incentivos cuando corresponda según la normativa aplicable.",
          "Atiende dudas y reclamaciones con respeto. No prometas resultados, certificaciones o garantías que no puedas demostrar.",
          "Si aún no tienes reseñas, no es necesario inventarlas: ofrece información verificable y deja que cada cliente decida si desea compartir su experiencia en los espacios permitidos.",
        ] }],
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
        heading: "Ejemplo: corregir una información antes de abrir otro canal",
        paragraphs: ["Caso hipotético para mostrar una revisión sencilla de presencia digital."],
        blocks: [{
          type: "example",
          title: "Un taller cambia su horario de los sábados",
          hypothetical: true,
          context: "Un taller de reparación reduce su horario de los sábados. Su sitio web muestra el nuevo horario, pero una red social y una ficha pública conservan el anterior.",
          problem: "Una persona puede desplazarse cuando el taller ya está cerrado y encontrar información distinta según el canal que consulte.",
          approach: "El responsable identifica los canales que el taller mantiene de verdad, corrige primero los datos esenciales y anota dónde debe revisar el horario cuando vuelva a cambiar.",
          actions: [
            "Comparar nombre, teléfono, dirección o zona de servicio y horario en los canales activos.",
            "Actualizar el horario incorrecto y comprobar cada cambio como lo vería un visitante.",
            "Retirar o corregir enlaces a cuentas que el negocio ya no atiende.",
            "Asignar quién revisará estos datos cuando cambien horarios, servicios o formas de contacto.",
          ],
          lesson: "La confianza empieza por información coherente y mantenida. Abrir otro canal no corrige los datos antiguos de los que ya existen.",
        }],
      },
      { heading: "Lista de comprobación", paragraphs: ["Comprueba que horarios, servicios y contacto coincidan entre canales.","No inventes reseñas ni afirmaciones para ganar confianza.","Revisa accesibilidad, privacidad y seguridad antes de ampliar tu presencia."] },
      {
        heading: "Fuentes y alcance",
        paragraphs: ["Las fuentes siguientes se consultaron para preparar esta guía. Las recomendaciones editoriales y de organización son prácticas generales; los requisitos de plataforma se identifican como políticas y no deben confundirse con asesoría legal. Las reglas cambian y pueden variar por sector, formato o país: comprueba las versiones vigentes antes de actuar."],
        blocks: [{ type: "sources", items: [
          { label: "SEO Starter Guide — Google Search Central", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", scope: "Recomendaciones de Google Search sobre contenido útil, rastreo, títulos, enlaces e imágenes. La guía dice explícitamente que no hay una fórmula que garantice el primer puesto ni que toda recomendación aplique a todo sitio." },
          { label: "Edit your Business Profile — Google Business Profile Help", url: "https://support.google.com/business/answer/3039617", scope: "Ayuda oficial para editar información como nombre, dirección o área de servicio, horarios, teléfono, web, descripción y servicios. Disponibilidad, elegibilidad, verificación y revisión pueden variar." },
          { label: "WCAG 2.2 Quick Reference — W3C WAI", url: "https://www.w3.org/WAI/WCAG22/quickref/", scope: "Referencia rápida del W3C para consultar criterios WCAG 2.2 y técnicas. Esta guía no ha sido objeto de una evaluación completa y no declara conformidad ni certificación WCAG 2.2 AA." },
        ] }],
      },    ],
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
    imageAlt: "Tres canales digitales —sitio web, perfil de empresa y redes sociales— muestran de forma coherente una oferta, una zona de atención y opciones de contacto",
    cta: { label: "Conocer el Diagnóstico", to: "/diagnostico", copy: "Si quieres ordenar prioridades, el Diagnóstico de presencia digital puede servir como punto de partida; no promete visibilidad, clientes ni resultados comerciales." },
    relatedSlugs: ["publicidad-digital-como-preparar-una-primera-campana", "como-mantener-actualizada-y-confiable-tu-presencia-digital"],
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
    excerpt: "Una automatización útil también necesita controles para duplicados, fallos, privacidad y supervisión humana.",
    enPocasPalabras: ["Prueba los casos normales y los errores antes de activar.","Define quién interviene cuando el proceso falla.","Conserva una forma segura de detener y revisar la automatización."],
    image: "/assets/learn/diagram-automation.svg",
    imageAlt: "Ilustración conceptual del tema de esta guía",
    relatedSlugs: ["automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio"],
    editorialDraft: false,
    cta: { label: "Revisar mis necesidades", to: "/diagnostico", copy: "Identifica primero el problema y comprueba qué necesitas antes de contratar herramientas." },
    sections: [
      { heading: "Objetivo y práctica", paragraphs: ["Al terminar podrás identificar los riesgos y decisiones de este proceso y explicar qué comprobar antes de actuar.", "Ejercicio: describe un caso de tu negocio sin datos personales, elige una comprobación y define cuándo revisarás el resultado."] },
      {
        heading: "Errores, duplicados y reintentos",
        paragraphs: ["Una automatización puede activarse dos veces, recibir un dato incompleto, no encontrar el registro esperado o fallar al ejecutar una acción. El flujo debe poder distinguir entre «no se ejecutó» y «se ejecutó, pero no llegó la confirmación». Repetir sin comprobar puede crear dos avisos o dos pedidos."],
        blocks: [{ type: "definitions", items: [
          { term: "Duplicado", definition: "Dos registros o acciones representan el mismo hecho o tarea, por ejemplo dos avisos abiertos de reposición para una misma variedad y evento." },
          { term: "Reintento", definition: "Una nueva tentativa tras un fallo. Solo es segura cuando se ha comprobado qué ocurrió en el intento anterior o existe una protección contra repetir el mismo efecto." },
          { term: "Registro de ejecución", definition: "Una constancia mínima de cuándo se evaluó la regla, qué resultado tuvo y si la acción se confirmó o requiere revisión. Debe tener acceso y retención proporcionados." },
        ] }, { type: "list", items: [
          "Identifica de forma estable el evento o la tarea para detectar que ya fue procesado, cuando la herramienta lo permita.",
          "Antes de reintentar, comprueba si el efecto ya ocurrió. No repitas automáticamente acciones externas —como enviar un mensaje o realizar un cargo— solo porque la confirmación tardó.",
          "Limita los reintentos y registra el resultado. Si persiste el error, pausa esa rama y asigna una revisión en vez de repetir sin límite.",
          "Avisa a una persona cuando falte información, el resultado sea contradictorio o no puedas confirmar si una acción se completó.",
        ] }],
      },
      {
        heading: "Cuándo necesita intervenir una persona",
        paragraphs: ["La intervención humana no es solo un último recurso. Puede ser una condición deliberada antes de una acción con consecuencias, la forma de resolver datos dudosos o el control de calidad de una regla nueva."],
        blocks: [{ type: "list", items: [
          "La regla no reconoce el caso, la fuente está desactualizada o dos datos se contradicen.",
          "La acción afecta dinero, seguridad, derechos, información sensible o una relación importante con otra persona.",
          "Alguien pide hablar con una persona, cuestiona un mensaje o comunica una situación urgente.",
          "El sistema informa un error, no confirma la acción o detecta un duplicado.",
          "Una persona responsable revisa muestras y registros durante el piloto, incluso cuando las ejecuciones habituales parecen correctas.",
        ] }, { type: "callout", tone: "caution", title: "Asigna una persona dueña", text: "Antes de activar la regla, acuerda quién recibe excepciones, con qué frecuencia revisa el registro y quién tiene permiso para pausarla. Sin esa responsabilidad, un aviso puede terminar en una bandeja que nadie atiende." }],
      },
      {
        heading: "Protege la información y las preferencias de contacto",
        paragraphs: ["Un flujo operativo interno puede necesitar pocos datos. No copies nombres, teléfonos, mensajes o información sensible si basta un identificador de producto o una tarea asignada. Consulta qué datos conserva cada herramienta, quién accede, cómo se exportan o eliminan y durante cuánto tiempo."],
        blocks: [{ type: "list", items: [
          "Recoge y transmite solo la información necesaria; limita permisos a las personas que mantienen o ejecutan el proceso.",
          "Protege las cuentas y revisa medidas de acceso, registros, conservación, exportación y eliminación ofrecidas por las herramientas involucradas.",
          "Si el flujo contacta a clientes, usa solo el canal, propósito y frecuencia permitidos. Un dato de contacto o una compra previa no equivalen por sí solos a autorización para mensajes promocionales.",
          "Respeta bajas, preferencias y restricciones del canal. Mantén una lista de exclusión donde corresponda y evita que una automatización reintroduzca a quien pidió no recibir comunicaciones.",
          "Verifica normas de privacidad y comunicaciones comerciales de tu jurisdicción. Esta guía es educativa y no reemplaza asesoría legal.",
        ] }, { type: "callout", tone: "caution", title: "Empieza con avisos internos", text: "Un aviso al equipo suele tener menos consecuencias que contactar automáticamente a una persona externa. Si vas a enviar mensajes, revisa consentimiento o base aplicable, identidad, contenido, horarios, frecuencia y mecanismo de baja antes de la prueba real." }],
      },
      {
        heading: "Prueba antes de usarla en el trabajo real",
        paragraphs: ["Una prueba controlada comprueba si la regla responde como se espera en casos normales y excepcionales. Hazla con registros ficticios o anonimizados y, cuando sea posible, en un entorno separado que no envíe comunicaciones ni ejecute compras."],
        blocks: [{ type: "steps", label: "Lista de prueba antes de activar", items: [
          { title: "Prepara casos que deben continuar", detail: "Usa un evento válido con todas las condiciones satisfechas y comprueba que se produzca una sola acción asignada correctamente." },
          { title: "Prepara casos que deben detenerse", detail: "Prueba una cantidad positiva, un producto inactivo, un dato vacío o inválido y una tarea ya abierta. Confirma que no aparezca una acción improcedente." },
          { title: "Fuerza un fallo recuperable", detail: "Comprueba qué muestra la herramienta cuando no puede leer el dato o completar la acción. La excepción debe quedar visible para alguien responsable." },
          { title: "Prueba doble evento y confirmación tardía", detail: "Envía el mismo caso dos veces y simula una respuesta demorada. Verifica que no se duplique el efecto ni se reintente a ciegas." },
          { title: "Compara resultado con el proceso manual", detail: "Una persona verifica la salida esperada, el responsable, los permisos y los registros. No conectes el flujo a clientes ni a operaciones irreversibles durante esta etapa." },
          { title: "Activa gradualmente y vigila", detail: "Si las pruebas salen bien, empieza con un alcance pequeño, conserva una alternativa manual y define quién revisará ejecuciones y excepciones durante el periodo acordado." },
        ] }],
      },
      {
        heading: "Mide si aporta valor y conserva una forma de detenerla",
        paragraphs: ["Antes de probar, apunta cómo funciona hoy el mismo proceso y qué cambio sería útil. Compara periodos y casos equivalentes; considera también el tiempo de revisión, mantenimiento, errores y coste de herramientas. Una diferencia observada en una muestra no garantiza que se repita en todos los casos."],
        blocks: [{ type: "list", items: [
          "Operación: eventos detectados, acciones completadas y casos que requirieron intervención manual.",
          "Calidad: acciones incorrectas, tareas duplicadas, datos faltantes y tiempo hasta identificar el problema.",
          "Trabajo total: configuración, revisión, corrección y mantenimiento frente a los pasos manuales que permanecen.",
          "Impacto y coste: incidentes, quejas, uso de proveedores y esfuerzo de quien responde por el flujo.",
        ] }, { type: "paragraph", text: "Define de antemano una persona con permiso para pausar el flujo, cómo avisará al equipo y qué procedimiento manual lo sustituirá. Para revertir efectos, conserva una manera de localizar tareas o registros generados y deshacerlos solo cuando hacerlo sea seguro. Un mensaje enviado o una compra procesada no siempre se puede retirar: en esos casos, prepara una corrección y una respuesta humana." }, { type: "callout", tone: "tip", title: "Pausar también es un resultado válido", text: "Detén la automatización si aparecen errores repetidos, acciones duplicadas, datos expuestos, destinatarios incorrectos o excepciones sin atender. Investiga, corrige y repite las pruebas antes de reactivarla." }],
      },
      {
        heading: "Ejemplo: detectar un recordatorio duplicado antes de automatizar más",
        paragraphs: ["Caso hipotético para practicar supervisión, reintentos y salida manual."],
        blocks: [{
          type: "example",
          title: "Una consulta genera dos recordatorios",
          hypothetical: true,
          context: "Un negocio crea una regla interna para avisar al equipo cuando una solicitud lleva un día sin respuesta.",
          problem: "Si el sistema reintenta después de un fallo, podría crear dos tareas para la misma consulta y dos personas terminarían trabajando sobre el mismo pendiente.",
          approach: "Antes de ampliar el flujo, el equipo prueba qué ocurre cuando el mismo evento llega dos veces y define una referencia única para reconocer la consulta ya registrada.",
          actions: [
            "Crear casos de ensayo con un evento normal, un evento repetido y un dato incompleto.",
            "Comprobar que el segundo evento no crea otra tarea cuando ya existe una abierta para la misma referencia.",
            "Registrar qué ocurrió y permitir que una persona resuelva manualmente los casos dudosos.",
            "Mantener un interruptor o procedimiento para detener la regla sin perder la lista de pendientes existente.",
          ],
          lesson: "Supervisar una automatización significa comprobar también duplicados, errores y recuperación, no solo el caso perfecto.",
        }],
      },
      { heading: "Resumen para aplicar", paragraphs: ["Prueba los casos normales y los errores antes de activar.","Define quién interviene cuando el proceso falla.","Conserva una forma segura de detener y revisar la automatización."] },
      {
        heading: "Fuentes y alcance",
        paragraphs: ["Estas referencias apoyan la gestión de privacidad, seguridad y comunicaciones. Cada una corresponde a un marco o jurisdicción concreta y no determina por sí sola las obligaciones de tu negocio."],
        blocks: [{ type: "sources", items: [
          { label: "NIST Privacy Framework", url: "https://www.nist.gov/privacy-framework", scope: "Marco voluntario del NIST de Estados Unidos para identificar y gestionar riesgos de privacidad. Útil como guía de preguntas; no es una ley universal." },
          { label: "NIST Cybersecurity Framework (CSF) 2.0", url: "https://www.nist.gov/cyberframework", scope: "Marco del NIST para gestionar riesgos de ciberseguridad. Sus prácticas pueden orientar controles de acceso y supervisión, pero no sustituyen requisitos locales." },
          { label: "Electronic mail marketing", url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/", scope: "Orientación de la autoridad ICO del Reino Unido sobre marketing por correo electrónico y preferencias. Se refiere al marco británico; verifica las reglas de tu jurisdicción y canal." },
        ] }],
      },    ],
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
            { title: "Aclara qué incluye", detail: "Pregunta por dominio, DNS, alojamiento, correo, certificado TLS, copias y soporte. No des por hecho que vienen juntos." },
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
    title: "DNS, HTTPS y correo: cómo se conecta tu dominio",
    intro: "Distingue los registros DNS, el alojamiento, el certificado HTTPS y el correo profesional sin confundir sus funciones.",
    excerpt: "Distingue los registros DNS, el alojamiento, el certificado HTTPS y el correo profesional sin confundir sus funciones.",
    enPocasPalabras: ["El DNS ayuda a localizar servicios asociados a un dominio.","HTTPS protege la conexión, pero no garantiza que el negocio sea legítimo.","El correo y la web pueden usar proveedores y configuraciones diferentes."],
    image: "/assets/learn/diagram-domain-dns-hosting.svg",
    imageAlt: "Esquema educativo de servicios y canales digitales",
    relatedSlugs: ["dominio-hosting-sitio-web-como-funcionan"],
    editorialDraft: false,
    cta: { label: "Revisar mi situación", to: "/diagnostico", copy: "Comprueba qué necesita tu negocio antes de contratar o publicar." },
    sections: [
      { heading: "Qué aprenderás", paragraphs: ["Distingue los registros DNS, el alojamiento, el certificado HTTPS y el correo profesional sin confundir sus funciones.", "Ejercicio: elige un canal o servicio que ya utilizas, identifica qué debes comprobar y anota quién se encargará de revisarlo."] },
      {
        heading: "DNS: cómo se conecta el nombre con el alojamiento",
        paragraphs: [
          "La zona DNS de un dominio contiene registros que indican qué resolver o servidor debe responder por cada tipo de consulta. El dominio puede registrarse con una empresa, delegar DNS en otra y alojar el sitio en una tercera. Cambiar una de estas relaciones no mueve automáticamente las otras.",
          "Cuando un proveedor dice «conecta tu dominio», puede pedir que cambies los servidores de nombres (NS) para que su servicio DNS responda por el dominio, o que conserves los NS actuales y agregues registros específicos. Sigue los valores que indique el proveedor que aloja el sitio; los nombres y pantallas exactos dependen de cada servicio.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "A y AAAA", definition: "Registros que asocian un nombre de host con una dirección IPv4 (A) o IPv6 (AAAA), según la configuración indicada por el alojamiento." },
          { term: "CNAME", definition: "Un alias que hace que un nombre consulte otro nombre, en lugar de guardar directamente una dirección IP. Sus usos permitidos dependen de las reglas de DNS y del proveedor." },
          { term: "NS", definition: "Indica qué servidores de nombres son autoritativos para una zona DNS. Cambiar los NS delega la administración de los registros a otro servicio DNS; no traslada los archivos del sitio." },
          { term: "MX", definition: "Indica a qué servidores se debe dirigir el correo entrante para un dominio. Es distinto de los registros que hacen que una página web se cargue." },
          { term: "TXT", definition: "Permite publicar texto asociado a un nombre. Puede usarse para verificar un servicio o publicar políticas de correo; conserva los valores que tus servicios activos necesitan." },
          { term: "Hosting o alojamiento", definition: "Servicio donde funciona y se publica la web; puede ser distinto del proveedor que administra el DNS." },
          { term: "HTTPS y TLS", definition: "HTTPS es la conexión web protegida mediante TLS. Ayuda a cifrar la comunicación y a comprobar el servidor para el nombre usado; no certifica que el negocio o su contenido sean confiables." },
        ] }],
      },
      {
        heading: "Hosting: dónde funciona la web",
        paragraphs: [
          "El alojamiento web proporciona infraestructura y, según el servicio, herramientas para publicar el sitio. Puede encargarse de parte del mantenimiento del servidor o dejar más tareas a quien lo administra. No hay un paquete universal: revisa qué incluye el plan y qué debes mantener tú.",
          "Un mismo sitio puede cambiar de alojamiento sin cambiar de dominio. Para que las visitas lleguen al nuevo servidor, normalmente se prepara y prueba el sitio, se configura el nuevo servicio y luego se actualizan los registros DNS correspondientes. El plazo para que la nueva respuesta se vea en todas las redes depende de los TTL, cachés y configuración; no es una garantía de un número fijo de minutos.",
        ],
        blocks: [{ type: "list", items: [
          "Pregunta quién actualiza el software del servidor y qué soporte está incluido.",
          "Comprueba si hay copias de seguridad, cuánto tiempo se conservan y cómo puedes restaurarlas.",
          "Aclara cómo exportar los archivos y datos del sitio si cambias de proveedor.",
          "Verifica si el plan incluye un certificado TLS y si cubre todos los nombres que usarás.",
        ] }],
      },
      {
        heading: "HTTPS y el certificado TLS",
        paragraphs: [
          "HTTPS es HTTP transportado sobre TLS. TLS protege la comunicación entre el navegador y el servidor: cifra los datos durante el tránsito y permite comprobar que el servidor presenta un certificado válido para el nombre solicitado. El proveedor de alojamiento puede automatizar parte de la emisión y renovación del certificado, o puede pedir configuración adicional.",
          "Ver HTTPS en la dirección no prueba que la empresa sea legítima, que el contenido sea correcto, que el sitio esté libre de software malicioso ni que una compra sea conveniente. Protege la conexión con el dominio comprobado; no sustituye revisar quién opera el sitio, cómo usa tus datos y qué ofrece.",
        ],
        blocks: [{ type: "callout", tone: "tip", title: "Comprueba la dirección completa", text: "Después de publicar, verifica que la variante con https:// carga sin una advertencia del navegador, que los nombres que necesitas —con o sin www— apuntan al sitio esperado y que la versión segura se usa también en los enlaces y recursos de la página." }],
      },
      {
        heading: "Correo profesional y hosting web no son lo mismo",
        paragraphs: [
          "El hosting web entrega páginas y funciones de un sitio. El correo profesional proporciona buzones y servicios para enviar o recibir mensajes con tu dominio. Se pueden contratar con la misma empresa o con proveedores distintos; pagar uno no implica necesariamente tener el otro.",
          "El correo usa su propia configuración DNS. Los registros MX dirigen el correo entrante; otros registros, como TXT, pueden ayudar a publicar políticas de autenticación o verificar el servicio. Si cambias los servidores DNS o la zona, conserva los registros que el proveedor de correo necesita. Si solo cambias el registro de la web, el correo puede seguir funcionando siempre que sus registros continúen correctos.",
        ],
        blocks: [{ type: "callout", tone: "caution", title: "No borres los registros del correo al conectar la web", text: "Antes de sustituir una zona DNS o cambiar los NS, guarda una copia de los registros actuales y confirma cuáles corresponden al correo. Una página puede cargar correctamente mientras el correo deja de recibir mensajes." }],
      },
      {
        heading: "Ejemplo: la web funciona, pero el correo deja de recibir",
        paragraphs: ["Caso hipotético para entender por qué cambiar DNS exige revisar más de un servicio."],
        blocks: [{
          type: "example",
          title: "Una tienda conecta su dominio a una nueva web",
          hypothetical: true,
          context: "Una tienda cambia de plataforma web. Para conectar el dominio, alguien sustituye la configuración DNS completa sin copiar los registros anteriores.",
          problem: "La nueva página abre correctamente, pero horas después el negocio descubre que no está recibiendo correo en sus direcciones habituales.",
          approach: "El equipo compara la zona anterior con la nueva, identifica los registros que necesita el proveedor de correo y restaura únicamente los valores confirmados por ese servicio.",
          actions: [
            "Revisar qué cambió en los servidores de nombres y en los registros A, AAAA, CNAME, MX y TXT.",
            "Consultar las instrucciones vigentes del proveedor de correo en vez de adivinar valores.",
            "Probar por separado la web, la recepción y el envío de correo después de corregir la zona.",
            "Guardar una copia de la configuración estable y documentar quién administra DNS, web y correo.",
          ],
          lesson: "Que la página cargue no demuestra que todos los servicios del dominio estén bien. Web y correo dependen de registros diferentes que deben comprobarse por separado.",
        }],
      },
      { heading: "Lista de comprobación", paragraphs: ["El DNS ayuda a localizar servicios asociados a un dominio.","HTTPS protege la conexión, pero no garantiza que el negocio sea legítimo.","El correo y la web pueden usar proveedores y configuraciones diferentes."] },
      {
        heading: "Fuentes y alcance",
        paragraphs: ["Estas referencias técnicas explican DNS y TLS. Los RFC del IETF describen registros y resolución de nombres; MDN explica TLS en la web. Esta guía introduce el correo a nivel de MX y TXT, pero no enseña a configurar SPF, DKIM ni DMARC: para esos mecanismos deben consultarse las instrucciones vigentes del proveedor de correo antes de cambiar registros."],
        blocks: [{ type: "sources", items: [
          { label: "RFC 1034: Domain Names — Concepts and Facilities", url: "https://datatracker.ietf.org/doc/html/rfc1034", scope: "Estándar del IETF que describe resolvers, servidores de nombres, datos autoritativos y caché/TTL en DNS. Consultado el 17 de octubre de 2026." },
          { label: "RFC 1035: Domain Names — Implementation and Specification", url: "https://datatracker.ietf.org/doc/html/rfc1035", scope: "Especifica registros como A, NS, CNAME y MX. No es una guía de configuración para un proveedor concreto. Consultado el 17 de octubre de 2026." },
          { label: "RFC 3596: DNS Extensions to Support IP Version 6", url: "https://datatracker.ietf.org/doc/html/rfc3596", scope: "Define la extensión de DNS para consultas y registros de direcciones IPv6 (AAAA). Consultado el 17 de octubre de 2026." },
          { label: "Transport Layer Security (TLS) — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security", scope: "Explica cómo TLS protege conexiones HTTP y cómo el certificado participa en la autenticación del servidor. Consultado el 17 de octubre de 2026." },
        ] }],
      },
    ],
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
    intro: "Ves un candado junto a la dirección de una página. ¿Eso quiere decir que la tienda es confiable? No necesariamente. Aprende qué protege la conexión y qué no.",
    excerpt: "Descubre qué significa HTTPS, qué hacer ante una advertencia y cómo revisar una web.",
    enPocasPalabras: ["HTTPS protege la comunicación entre tu navegador y una página.","Un candado no garantiza que el vendedor sea de confianza.","Revisa cualquier aviso de seguridad antes de introducir datos."],
    image: "/assets/learn/diagram-domain-dns-hosting.svg",
    imageAlt: "Una persona navega por una conexión HTTPS hacia un servidor web; TLS protege el trayecto, pero no verifica la honestidad del negocio.",
    relatedSlugs: ["dominio-hosting-sitio-web-como-funcionan", "antes-de-hacer-publicidad-organiza-tu-presencia-digital"],
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar capacidades digitales; no certifica ni audita la seguridad de un sitio web." },
    sections: [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «HTTPS y certificados TLS: qué protegen y qué no», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        heading: "HTTP y HTTPS: la diferencia es la protección del trayecto",
        paragraphs: [
          "HTTP permite que un navegador solicite páginas a un servidor. HTTPS es ese intercambio protegido por TLS: los datos viajan cifrados y el navegador comprueba que el certificado corresponda al dominio solicitado.",
          "El cifrado dificulta que alguien en la red lea o modifique los datos durante el tránsito. No protege lo que ocurre en el dispositivo o el servidor; tampoco corrige contraseñas inseguras, una aplicación vulnerable ni el uso indebido de la información recibida.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "HTTP", definition: "Protocolo de comunicación usado para solicitar y entregar páginas y otros recursos web." },
          { term: "HTTPS", definition: "HTTP protegido mediante TLS; ofrece cifrado de la conexión y autenticación del servidor para el nombre web visitado." },
          { term: "TLS", definition: "Protocolo que negocia parámetros de seguridad y cifra los datos transmitidos entre dos extremos. Es el sucesor de SSL, nombre antiguo que todavía aparece en algunas conversaciones." },
          { term: "Certificado TLS", definition: "Credencial digital que vincula un nombre web con una clave pública y contiene información de validez y emisor. El navegador verifica su cadena de confianza, vigencia y correspondencia con el nombre solicitado." },
        ] }],
      },
      {
        heading: "Qué demuestra —y qué no— el certificado",
        paragraphs: [
          "El certificado permite validar la conexión con el dominio que aparece en la dirección; no comprueba la identidad legal de su dueño ni la calidad de sus productos. Una página fraudulenta también puede tener HTTPS en su propio dominio.",
          "Revisa el nombre completo —puede incluir letras o una extensión engañosa— y confirma que llegaste desde una fuente conocida. Antes de pagar, comprueba la empresa y sus condiciones. No ignores avisos del navegador.",
        ],
        blocks: [{ type: "callout", tone: "caution", title: "El candado protege la conexión, no garantiza confianza", text: "No uses HTTPS como prueba de que una oferta, empresa, descarga o formulario sea legítimo. La seguridad también depende del sitio, sus sistemas, sus prácticas y de lo que tú decides compartir." }],
      },
      {
        heading: "Avisos y errores frecuentes que puedes reconocer",
        paragraphs: ["Si aparece un aviso de conexión privada o certificado, detente: no introduzcas datos ni desactives la protección. El visitante no puede confirmar la causa sin revisar la configuración."],
        blocks: [{ type: "list", items: [
          "Certificado vencido: el servidor no lo renovó a tiempo.",
          "El nombre no coincide: el certificado cubre otro dominio, por ejemplo la versión con www, pero no la dirección abierta.",
          "Configuración incompleta: puede faltar un certificado intermedio o variar entre servidores.",
          "Reloj del dispositivo incorrecto: la fecha equivocada puede hacer que un certificado vigente parezca vencido o aún no válido.",
          "Contenido mixto: una página HTTPS carga algún recurso —como una imagen o un script— por HTTP. El navegador puede bloquearlo o advertir que la página no está completamente protegida.",
          "Interferencia de red: una red pública o un filtro pueden interrumpir la conexión. No aceptes excepciones si no conoces la causa.",
        ] }],
      },
      {
        heading: "Ejemplo hipotético: una clínica local recibe un aviso",
        paragraphs: ["Caso hipotético con fines educativos; no describe una empresa ni un incidente real."],
        blocks: [{ type: "example", title: "La web abre con una advertencia de seguridad", hypothetical: true,
          context: "Una clínica cambia de proveedor para publicar horarios y recibir solicitudes de cita.",
          problem: "Visitantes ven una advertencia de certificado o un recurso marcado como inseguro.",
          approach: "La responsable no pide a pacientes que ignoren el aviso; contacta a quien administra la web para revisar el certificado y los enlaces.",
          actions: [
            "Anota el dominio, el texto del aviso y la dirección afectada; no incluyas datos de pacientes en capturas.",
            "Pide revisar vigencia, nombre cubierto, renovación, cadena de certificados y recursos HTTP.",
            "Al corregirlo, vuelve a probar enlaces y formulario desde otro navegador y otra red.",
          ],
          lesson: "No normalizar el aviso evita que visitantes compartan datos en una conexión que el navegador no valida. La causa se corrige en el sitio, no cambiando una opción del visitante.",
        }],
      },
      {
        heading: "Qué comprobar en la web de tu negocio",
        paragraphs: ["Revisa la configuración periódicamente y después de cambiar dominio o proveedor. HTTPS es solo una parte del mantenimiento de seguridad."],
        blocks: [{ type: "steps", label: "Comprobaciones básicas de HTTPS", items: [
          { title: "Prueba las direcciones publicadas", detail: "Comprueba dominio con y sin www; todas deben abrir el sitio correcto sin avisos." },
          { title: "Confirma certificado y renovación", detail: "Pregunta qué nombres cubre, quién renueva y cómo se detecta un fallo. Nunca compartas claves privadas." },
          { title: "Revisa recursos y recorridos", detail: "Verifica que imágenes, formularios y páginas importantes carguen con HTTPS desde teléfono y computadora." },
          { title: "Mantén otros controles", detail: "Actualiza el sitio, limita accesos, usa autenticación multifactor y conserva copias probadas." },
        ] }, { type: "callout", tone: "tip", title: "Una prueba rápida no es una auditoría", text: "Ver la página y consultar la fecha del certificado detecta algunos fallos visibles. No sustituye una revisión técnica de la aplicación, el servidor, las cuentas, los pagos y el tratamiento de datos." }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{ type: "faq", items: [
          { question: "¿Un sitio HTTPS es necesariamente confiable?", answer: "No. TLS protege el trayecto y valida el dominio, no la honestidad del negocio ni la seguridad integral del sitio." },
          { question: "¿Qué hago si aparece un aviso de conexión?", answer: "No introduzcas datos ni continúes a la fuerza. Confirma la dirección y, si administras el sitio, pide revisar el certificado." },
          { question: "¿El candado protege mi formulario?", answer: "Protege la transmisión; el sitio también debe procesar y conservar los datos de forma segura." },
        ] }],
      },
      {
        heading: "Fuentes oficiales y alcance",
        paragraphs: ["Estas fuentes explican el funcionamiento del protocolo y las advertencias del navegador. Una verificación visible de certificado no equivale a una evaluación de seguridad integral."],
        blocks: [{ type: "sources", items: [
          { label: "Transport Layer Security (TLS) — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security", scope: "Explicación técnica de HTTPS, TLS, certificados y autenticación del servidor." },
          { label: "Mixed content — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content", scope: "Describe recursos HTTP incluidos en páginas HTTPS y cómo pueden afectar la seguridad." },
          { label: "Warning about invalid TLS certificates — Chrome Help", url: "https://support.google.com/chrome/answer/6098869", scope: "Ayuda oficial para entender avisos de conexión y certificado en Chrome; la interfaz puede variar según versión." },
          { label: "RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3", url: "https://datatracker.ietf.org/doc/html/rfc8446", scope: "Estándar técnico del IETF para TLS 1.3; no es una guía de configuración específica de hosting." },
        ] }],
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{ type: "summary", items: [
          "Comprueba que la dirección completa sea la esperada y no ignores avisos del navegador.",
          "Recuerda: TLS protege el trayecto y valida el dominio, no la confiabilidad comercial del sitio.",
          "Si administras una web, revisa certificados, renovación, variantes del dominio y recursos HTTP.",
          "Combina HTTPS con mantenimiento, accesos controlados, copias y un manejo prudente de datos.",
        ] }],
      },
    ],
  },
  {
    slug: "analitica-web-que-medir-en-tu-negocio",
    category: "Tecnología explicada",
    title: "Analítica web básica: qué debes medir en tu negocio",
    intro: "Tu página recibió visitas, pero ¿alguien preguntó por un servicio? Los números sirven cuando ayudan a responder una pregunta concreta, no cuando solo se ven grandes.",
    excerpt: "Aprende a distinguir visitas de consultas y a revisar datos sin sacar conclusiones apresuradas.",
    enPocasPalabras: ["Una visita no es una consulta ni una venta.","Elige una acción útil y comprueba si tu página facilita realizarla.","Mide lo necesario y evita conclusiones basadas en pocos datos."],
    image: "/assets/learn/diagram-analytics.svg",
    imageAlt: "Diagrama que muestra cómo una parte de las visitas realiza interacciones y una parte de esas interacciones completa una conversión definida por el negocio.",
    relatedSlugs: ["antes-de-hacer-publicidad-organiza-tu-presencia-digital", "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio"],
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a ordenar prioridades digitales; no recopila ni evalúa las métricas de analítica de tu sitio." },
    sections: [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Analítica web básica: qué debes medir en tu negocio», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        heading: "Qué es la analítica web",
        paragraphs: [
          "La analítica web recopila y organiza señales de cómo las personas encuentran y usan un sitio: páginas consultadas, acciones observadas y metas completadas. Cada herramienta define qué registra y cómo lo cuenta.",
          "Empieza con una pregunta concreta: ¿se encuentra el horario?, ¿llegan solicitudes útiles? Una cifra sin contexto no indica si el negocio va bien; la meta puede ser una llamada, una reserva o informar con claridad.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "Visita o sesión", definition: "Una agrupación de actividad de un navegador o usuario durante un periodo definido por la herramienta. No siempre equivale a una persona ni se cuenta igual entre productos." },
          { term: "Interacción", definition: "Una acción observada dentro del sitio, como abrir una página, pulsar un botón, reproducir un video o iniciar un formulario. El evento depende de cómo se configuró la medición." },
          { term: "Conversión", definition: "Una acción que el negocio decide considerar un resultado relevante, como completar una reserva o enviar una solicitud válida. No significa necesariamente una venta." },
          { term: "Tasa de conversión", definition: "La proporción de una base elegida —por ejemplo, sesiones— que completa la conversión definida en el mismo periodo y bajo reglas coherentes." },
        ] }],
      },
      {
        heading: "Visitas, interacciones y conversiones no son lo mismo",
        paragraphs: ["En la web de una peluquería, una visita puede abrir la página de reservas; una interacción, pulsar «elegir horario»; una conversión, completar una reserva válida. Son pasos distintos, no sinónimos."],
        blocks: [{ type: "list", items: [
          "Una persona puede generar varias visitas; vistas no equivale a personas únicas.",
          "Un clic no demuestra que el formulario terminara o que la solicitud llegara.",
          "Una página de confirmación no siempre equivale a una cita atendida o una venta pagada.",
          "Define qué cuenta, qué se excluye y cómo confirmarás que la acción ocurrió.",
        ] }],
      },
      {
        heading: "Indicadores sencillos para empezar",
        paragraphs: ["Elige pocos indicadores ligados a una pregunta. Quizá baste revisar formularios recibidos, llamadas o reservas confirmadas, sin instalar otra herramienta."],
        blocks: [{ type: "steps", label: "Selección inicial de indicadores web", items: [
          { title: "Define el objetivo", detail: "Anota la acción útil: encontrar el horario, pedir una cotización o reservar." },
          { title: "Mide descubrimiento", detail: "Revisa si se consultan páginas o enlaces clave y confirma que funcionen." },
          { title: "Cuenta resultados confirmables", detail: "Separa formularios válidos, llamadas o reservas de pruebas, spam y duplicados." },
          { title: "Compara periodos equivalentes", detail: "Anota campañas, temporada o cambios de sitio; presenta volumen y tasa." },
          { title: "Prueba una mejora", detail: "Aclara un campo o paso y observa si cambia la calidad de las solicitudes." },
        ] }],
      },
      {
        heading: "Ejemplo hipotético: una cafetería revisa sus pedidos",
        paragraphs: ["Ejemplo hipotético; no representa resultados reales ni promete más ventas."],
        blocks: [{ type: "example", title: "Más visitas no siempre significan más pedidos", hypothetical: true,
          context: "Una cafetería publica el menú y un formulario de pedidos para llevar.",
          problem: "Suben las visitas, pero no los pedidos que el equipo confirma. Hay envíos duplicados y se desconoce si el formulario funciona en móvil.",
          approach: "El equipo separa visitas, clics y pedidos válidos y prueba el formulario desde un teléfono.",
          actions: [
            "Define un pedido válido y separa pruebas, spam y duplicados.",
            "Confirma que el formulario llegue al canal revisado por el equipo.",
            "Compara semanas equivalentes y revisa casos reales antes de atribuir un cambio al sitio.",
          ],
          lesson: "Las visitas describen exposición, no pedidos. Revisar envíos reales y su contexto evita atribuir cada variación al sitio.",
        }],
      },
      {
        heading: "Cómo interpretar datos sin sacar conclusiones equivocadas",
        paragraphs: ["Una métrica describe lo que una herramienta registró; no explica por qué ocurrió ni representa necesariamente a todo el público."],
        blocks: [{ type: "list", items: [
          "Pocas observaciones: una o dos solicitudes cambian mucho la tasa. Muestra también el volumen.",
          "Atribución incierta: llegar desde una red social antes de comprar no demuestra que esa publicación causó la compra.",
          "Cambios simultáneos: campañas, temporada y errores pueden coincidir. Anota qué cambió antes de atribuir un efecto.",
          "Registro incompleto: bloqueadores o fallos impiden observar algunas acciones. Un evento ausente no prueba que nadie actuó.",
          "Definiciones distintas: herramientas agrupan sesiones y usuarios de manera diferente. Compara tendencias con la misma configuración.",
        ] }, { type: "callout", tone: "tip", title: "Acompaña cada número con una pregunta", text: "Escribe qué cuenta, de dónde viene, qué limitación tiene y qué decisión cambiaría. Si ninguna decisión depende del indicador, quizá no necesites recopilarlo." }],
      },
      {
        heading: "Privacidad y errores frecuentes",
        paragraphs: ["La analítica puede revelar hábitos o incluir identificadores. Las obligaciones dependen del país y la configuración; esta guía no es asesoría legal."],
        blocks: [{ type: "list", items: [
          "Recoge lo mínimo; no envíes nombres, teléfonos, texto libre o datos sensibles a informes.",
          "Revisa cookies, identificadores, conservación, accesos y condiciones del proveedor.",
          "Explica la medición y configura consentimiento u otra base conforme a las reglas aplicables.",
          "No confundas consentimiento analítico con permiso de publicidad o contacto comercial.",
          "Comprueba si estadísticas agregadas bastan antes de añadir seguimiento individual.",
        ] }, { type: "callout", tone: "caution", title: "No todo indicador merece ser recopilado", text: "Más datos implican más configuración, revisión y responsabilidad. Si no puedes explicar el propósito, quién accede y cuánto tiempo se guarda, simplifica la medición antes de activarla." }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{ type: "faq", items: [
          { question: "¿Necesito una herramienta especializada?", answer: "No siempre. Pedidos, llamadas o estadísticas agregadas pueden bastar para responder preguntas sencillas." },
          { question: "¿Más visitas significan más ventas?", answer: "No. Revisa si las acciones observadas son válidas y si el negocio puede confirmar los resultados." },
        ] }],
      },
      {
        heading: "Fuentes oficiales y alcance",
        paragraphs: ["Las definiciones dependen de cada producto de analítica. Estas referencias oficiales ayudan a comprobar qué mide una herramienta y qué consideraciones de datos y privacidad publica su proveedor."],
        blocks: [{ type: "sources", items: [
          { label: "About events — Google Analytics Help", url: "https://support.google.com/analytics/answer/9322688", scope: "Explica eventos de Google Analytics y ejemplos de interacciones; el modelo y la configuración de la propiedad determinan qué se registra." },
          { label: "About conversions — Google Analytics Help", url: "https://support.google.com/analytics/answer/9267568", scope: "Describe cómo se marcan eventos importantes como conversiones en Google Analytics; no define por sí mismo qué resultado comercial debe importar a cada negocio." },
          { label: "Google Analytics policies", url: "https://support.google.com/analytics/answer/6004245", scope: "Políticas publicadas por Google Analytics, incluidas restricciones sobre información de identificación personal. Comprueba la versión vigente y tus obligaciones locales." },
          { label: "Cookies and similar technologies — ICO", url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/", scope: "Orientación de la autoridad británica sobre cookies bajo PECR; consulta las reglas de la jurisdicción donde operas y donde se encuentran tus visitantes." },
        ] }],
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{ type: "summary", items: [
          "Escribe la decisión que quieres tomar antes de elegir una métrica o herramienta.",
          "Distingue visitas, acciones observadas y resultados confirmados por el negocio.",
          "Empieza con pocos indicadores, periodos comparables y una revisión manual de casos.",
          "Minimiza datos personales, revisa la configuración y conserva solo lo que puedas justificar.",
        ] }],
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
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Cómo conectar herramientas digitales sin complicar tu negocio», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
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
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Tu Perfil de Empresa en Google: qué completar y mantener actualizado», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
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
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Cómo organizar mensajes, llamadas y formularios sin perder consultas», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
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
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Cómo utilizar IA para preparar respuestas y publicaciones sin perder el control», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
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
          { label: "Prompt engineering — OpenAI API Guide", url: "https://platform.openai.com/docs/guides/prompt-engineering", scope: "Ejemplo de documentación de un proveedor sobre cómo estructurar instrucciones; funciones y recomendaciones pueden variar entre modelos y servicios." },
          { label: "Data Controls FAQ — OpenAI Help Center", url: "https://help.openai.com/en/articles/7730893-data-controls-faq", scope: "Describe controles de datos en productos de OpenAI; revisa los controles y términos del proveedor específico que utilizas." },
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
    "imageAlt": "Problema real; Prueba pequeña; Mejora útil",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Quiero llevar mi negocio a internet: ¿por dónde empiezo?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Anotas pedidos en papeles, contestas mensajes desde tu teléfono y publicas cuando tienes un rato. Te dicen que debes digitalizarte, pero nadie te explica qué significa.",
          "Digitalizar es usar herramientas para hacer más fácil una parte del trabajo: ordenar pedidos, encontrar documentos, compartir horarios o responder una pregunta."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Digitalizar no es comprar aplicaciones: es trabajar mejor con ayuda de ellas.",
              "Elige un problema real antes de decidir qué herramienta necesitas.",
              "Empieza con una mejora pequeña que puedas mantener."
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
                "url": "https://www.itu.int/itu-d/reports/statistics/2025/11/17/gcr-2025-chapter-5/",
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
    "imageAlt": "Tu tarea; Equipo suficiente; Plan alternativo",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Qué equipo e internet necesitas para trabajar en digital?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Un pequeño taller usa un teléfono para mensajes y fotos de sus trabajos. Una persona le recomienda comprar un equipo costoso para 'ponerse al día'.",
          "La pregunta útil no es cuál es el equipo más moderno, sino qué tareas necesitas cumplir: recibir pedidos, escribir presupuestos, guardar archivos o atender videollamadas."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Empieza con el dispositivo que permite hacer bien tu trabajo.",
              "Una conexión confiable importa más que tener muchos programas.",
              "Protege el equipo y prepara una alternativa cuando se vaya internet."
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
                "url": "https://www.itu.int/itu-d/reports/statistics/2025/11/17/gcr-2025-chapter-5/",
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
    "imageAlt": "Cuenta propia; Mensajes claros; Acceso seguro",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Cómo usar el correo de tu negocio sin perder mensajes?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Un cliente envía un documento importante. Tres días después no lo encuentras porque quedó entre promociones y mensajes de aplicaciones.",
          "Un correo organizado te ayuda a responder y guardar pruebas de acuerdos. No hace falta escribir de manera complicada."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Usa un correo que controles para las cuentas importantes del negocio.",
              "Escribe asuntos claros y guarda los documentos donde puedas encontrarlos.",
              "No compartas contraseñas: da acceso a cada persona cuando el servicio lo permita."
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
    "imageAlt": "Contraseña única; Verificación adicional; Comprobar antes",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Cómo evitar que te roben una cuenta o te engañen por mensaje?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Llega un mensaje que parece de un servicio conocido. Dice que perderás la cuenta en una hora y te pide contraseña o código.",
          "Las estafas suelen aprovechar la urgencia. Una cuenta protegida y un hábito de verificación reducen riesgos, aunque no los eliminan por completo."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "No reutilices contraseñas; considera un gestor de contraseñas confiable.",
              "Activa la verificación en dos pasos en las cuentas importantes.",
              "Si un mensaje te mete prisa, verifica por el canal oficial antes de actuar."
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
    "imageAlt": "Organizar; Guardar copia; Probar recuperación",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Si se rompe tu teléfono, ¿cómo recuperas los archivos del negocio?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Una persona cambia de teléfono y descubre que las fotos de sus productos solo estaban en el equipo anterior.",
          "Guardar documentos en carpetas o en internet ayuda, pero una copia de seguridad es una segunda versión que puedas recuperar cuando algo falla."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Organiza los documentos antes de copiarlos para encontrarlos después.",
              "Mantén una copia protegida que no dependa del mismo teléfono.",
              "Prueba a recuperar un archivo: una copia que nunca se comprobó podría fallar."
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
    "imageAlt": "Filas; Columnas; Revisión semanal",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Para qué sirve una hoja de cálculo en un negocio pequeño?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "En una libreta tienes encargos, pagos pendientes y una lista de materiales. Encontrar el estado de un pedido te lleva demasiado tiempo.",
          "Una hoja de cálculo es como una libreta organizada en casillas. Puedes buscar, ordenar y sumar sin tener que crear un programa."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Cada fila representa un registro; cada columna guarda un dato concreto.",
              "Empieza con pocas columnas que realmente usarás.",
              "Una tabla ordenada ayuda a revisar pendientes, pero no sustituye una contabilidad profesional cuando hace falta."
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
    "imageAlt": "Redes; Web sencilla; Información clara",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Redes sociales o página web? Cómo elegir sin gastar de más», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Alguien ve una foto de tu trabajo. Le interesa, pero no encuentra qué ofreces, dónde atiendes ni cómo pedir información.",
          "El problema no siempre es la falta de una página web. Puede ser que los datos importantes estén escondidos entre publicaciones."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Las redes ayudan a conversar; una página web reúne datos que deben encontrarse fácilmente.",
              "No necesitas un sitio enorme: explica qué haces, dónde atiendes y cómo contactarte.",
              "Escoge canales que puedas mantener, no los que estén de moda."
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
    "imageAlt": "Servicio; Público; Siguiente paso",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Qué vendes exactamente? Explícalo para que te entiendan», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "«Transformamos experiencias mediante soluciones innovadoras». Un cliente que no te conoce quizá no pueda imaginar qué vendes.",
          "«Reparamos computadoras y explicamos el problema antes de hacer cambios». La segunda frase es más directa y permite entender el trabajo."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Di qué haces, para quién y cómo pueden preguntarte.",
              "Cambia palabras vagas por ejemplos reales de tu trabajo.",
              "Pide a alguien que no te conozca que te diga qué entendió."
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
    "imageAlt": "Escuchar; Responder; Acordar",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Te escribieron por tu negocio: cómo responder sin sonar a robot», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Te escriben: «Hola, ¿hacen reparaciones?». Un «sí» no ayuda mucho; enviar todo el catálogo puede cansar a la persona.",
          "Puedes contestar: «¡Hola! Sí, hacemos ese tipo de reparaciones. ¿Qué equipo tienes y qué le sucede? Así podemos orientarte»."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Saluda y responde primero lo que realmente sabes.",
              "Si faltan datos, pregunta solo lo necesario para orientar.",
              "Termina con un paso claro y respeta si la persona no continúa."
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
    "imageAlt": "Pregunta real; Foto clara; Mensaje útil",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Qué publicar de tu negocio si no eres diseñador?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Publicas una fotografía de un producto y la acompañas con «¡Lo mejor para ti!». Alguien interesado sigue sin saber tamaño, uso o cómo consultarlo.",
          "Una publicación útil puede mostrar el objeto con buena luz, contar para qué sirve y explicar el siguiente paso."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Publica información que resuelva una duda, no solo contenido para llenar el perfil.",
              "Usa fotos reales con buena luz y permiso cuando corresponda.",
              "Incluye un texto claro: qué muestras, para quién sirve y qué se puede hacer después."
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
    "imageAlt": "Pedido claro; Cobro seguro; Entrega real",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Cómo empezar a recibir pedidos por internet sin complicarte?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Alguien ve un producto y quiere comprarlo. Falta confirmar si está disponible, cuánto cuesta entregarlo y cómo pagarlo.",
          "Abrir una tienda no resuelve esas preguntas. Antes necesitas un proceso entendible para aceptar, preparar y completar un pedido."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Aclara el producto, el precio confirmado, la entrega y las condiciones antes de cobrar.",
              "Utiliza servicios de pago confiables y verifica sus costos y requisitos.",
              "Lleva un registro de pedidos y explica cómo resolver cambios o problemas."
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
    "imageAlt": "Dato necesario; Uso claro; Acceso limitado",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Qué datos deberías pedir a un cliente y cuáles no?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Un formulario para preguntar horarios pide fecha de nacimiento y dirección completa. ¿De verdad hacen falta?",
          "Los datos personales merecen cuidado. Antes de pedirlos, explica qué tarea realizarás con ellos y si podrías resolverla con menos información."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Pide solo lo necesario para atender la solicitud concreta.",
              "Aclara para qué usarás los datos y quién podrá verlos.",
              "Responder una consulta no equivale a aceptar publicidad ni campañas."
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
    "imageAlt": "Opinión real; Respuesta respetuosa; Confianza",
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
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Cómo pedir opiniones reales sin comprar reseñas?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La pregunta detrás del problema",
        "paragraphs": [
          "Un proveedor ofrece venderte cincuenta opiniones de cinco estrellas para mejorar tu perfil. Suena fácil, pero esas reseñas no describen experiencias reales.",
          "La confianza depende de lo que haces y de cómo respondes, también cuando algo sale mal."
        ]
      },
      {
        "heading": "Tres ideas que conviene conocer",
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
              "Pide opiniones auténticas sin exigir que sean positivas.",
              "No publiques reseñas inventadas, ni siquiera si una IA las redacta.",
              "Responde las críticas con calma, sin revelar información privada."
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
      "https-certificados-tls-que-protegen-y-que-no",
      "como-elegir-y-cambiar-proveedor-de-dominio-y-hosting",
      "como-cambiar-proveedor-dominio-hosting-sin-perder-web-correo",
    ],
  },
] as const;

export function getLearnArticle(slug: string) {
  return learnArticles.find((article) => article.slug === slug);
}
