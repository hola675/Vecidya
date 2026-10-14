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
        heading: "Contacto, consulta/interesado, oportunidad y cliente",
        paragraphs: ["Usar palabras distintas para momentos distintos evita tratar a toda persona como si estuviera lista para comprar. No todas las consultas se convierten en una oportunidad y no toda oportunidad termina en cliente."],
        blocks: [{ type: "definitions", items: [
          { term: "Contacto", definition: "Una persona o entidad con la que el negocio tiene o podría tener comunicación. Guardar un contacto no significa que haya solicitado una oferta." },
          { term: "Consulta/interesado", definition: "Un contacto que manifestó interés al enviar una pregunta o solicitud concreta, por ejemplo mediante una llamada, un mensaje o un formulario. Requiere una respuesta, pero todavía no es necesariamente una oportunidad ni un cliente." },
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
          { question: "¿Cómo se guardan mis datos en el CRM de Vecidya?", answer: "Los contactos, conversaciones y demás registros del CRM se guardan en una subcuenta asignada a tu organización, accesible a las personas autorizadas para esa cuenta. Desde allí puedes importar y exportar tus contactos y otros datos. Al finalizar tu licencia, tienes 30 días para copiar o exportar la información que necesites; al vencer ese plazo, se elimina la subcuenta y los datos que contiene. Vecidya no conserva una copia paralela de esos registros ni los comparte con otros clientes." },
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
    intro: "La inteligencia artificial puede apoyar tareas concretas, como preparar un borrador o clasificar consultas. Su utilidad depende de la información disponible, los límites definidos y la revisión humana; no es una respuesta automática para todo negocio.",
    excerpt: "Distingue IA de automatización, evalúa usos cotidianos y aprende a probar un asistente con límites claros.",
    image: "/assets/learn/diagram-ai.svg",
    imageAlt: "Una consulta se convierte en un borrador de IA que una persona revisa antes de responder o transferir",
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar procesos y prioridades digitales; no instala asistentes ni activa herramientas de IA." },
    sections: [
      {
        heading: "Qué es la inteligencia artificial en un negocio",
        paragraphs: [
          "Inteligencia artificial, o IA, es un nombre amplio para sistemas de software que procesan información y producen resultados como clasificaciones, predicciones, recomendaciones o contenido. El grado de automatización cambia según la herramienta: que un producto use IA no significa que pueda actuar sin una persona.",
          "En un negocio, utilizar IA significa encargarle una parte delimitada de una tarea, por ejemplo preparar un primer borrador. El negocio sigue siendo responsable de la información que proporciona, de revisar el resultado y de decidir qué hacer con él.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "Inteligencia artificial", definition: "Sistemas que procesan datos para producir resultados —como una recomendación o una clasificación— con distintos métodos y grados de autonomía." },
          { term: "IA generativa", definition: "Una clase de IA que crea contenido nuevo, por ejemplo texto, imágenes o audio, a partir de instrucciones y datos. Puede generar una respuesta convincente que sea falsa, incompleta o desactualizada." },
          { term: "Automatización convencional", definition: "Una regla definida de antemano que conecta un evento con una acción: si llega un formulario, crear una tarea. No necesita un modelo de IA para funcionar." },
          { term: "Asistente conversacional", definition: "Una interfaz que intercambia mensajes o voz con una persona. Puede usar respuestas programadas, IA generativa o una combinación; el formato de conversación no revela por sí solo cómo funciona." },
        ] }],
      },
      {
        heading: "IA generativa, automatización y asistentes no son lo mismo",
        paragraphs: ["Separar el método de la interfaz ayuda a elegir algo proporcional. Una tarea puede usar automatización sin IA, IA sin diálogo o una conversación atendida por una persona."],
        blocks: [{ type: "list", items: [
          "Regla automática: al recibir una solicitud, registrar la fecha y avisar al responsable. La regla y la acción están definidas previamente.",
          "IA generativa: preparar un borrador de respuesta a partir de una pregunta y material aprobado. Una persona comprueba que el borrador corresponda al caso.",
          "Chatbot: conversar mediante mensajes escritos. Puede seguir opciones fijas, usar un modelo generativo o combinar ambas cosas.",
          "Asistente de voz: conversar mediante audio. Puede incluir reconocimiento de voz y respuesta hablada, con reglas o IA detrás; sigue necesitando límites y una vía de atención humana.",
        ] }, { type: "callout", tone: "tip", title: "El canal no determina la capacidad", text: "Un asistente de voz no es necesariamente más inteligente que un chatbot. Lo que puede hacer depende del modelo, sus instrucciones, los datos permitidos y las acciones que se le hayan habilitado." }],
      },
      {
        heading: "Qué tareas puede apoyar",
        paragraphs: ["La IA puede ayudar con partes acotadas del trabajo. Estos ejemplos son posibilidades generales, no funciones que Vecidya ofrezca ni resultados garantizados."],
        blocks: [{ type: "list", items: [
          "Atención: proponer un borrador basado en preguntas frecuentes aprobadas, resumir una consulta o sugerir a qué persona transferirla.",
          "Administración: resumir notas no sensibles, preparar una lista de tareas o ayudar a ordenar información para que alguien la compruebe.",
          "Marketing: proponer ideas, títulos o versiones iniciales de un texto; la persona responsable verifica datos, tono, derechos y promesas.",
          "Organización: agrupar mensajes por tema, encontrar patrones en datos autorizados o convertir una instrucción en una lista preliminar de pasos.",
        ] }],
      },
      {
        heading: "Qué sigue necesitando intervención humana",
        paragraphs: ["Una persona debe decidir qué usos son apropiados, revisar respuestas importantes y atender las excepciones. No es suficiente con que alguien pulse «aprobar» sin leer."],
        blocks: [{ type: "list", items: [
          "Confirmar precios, disponibilidad, condiciones, diagnósticos o compromisos con clientes.",
          "Resolver casos ambiguos, reclamos, situaciones urgentes o solicitudes que no estén cubiertas por la información aprobada.",
          "Revisar comunicaciones sobre salud, dinero, asuntos legales, seguridad u otras decisiones de alto impacto.",
          "Autorizar el uso de datos personales y responder por la decisión final del negocio.",
        ] }, { type: "callout", tone: "caution", title: "No delegues una decisión sensible por conveniencia", text: "Si un error puede afectar derechos, seguridad, dinero o una relación importante, mantén la decisión en manos de una persona competente y aplica las reglas de tu jurisdicción." }],
      },
      {
        heading: "Un taller de bicicletas y sus consultas de servicio",
        paragraphs: ["El siguiente escenario es hipotético. No describe un cliente real, no atribuye resultados y no representa una herramienta de IA disponible en Vecidya."],
        blocks: [{ type: "example", title: "Responder dudas frecuentes sin inventar un diagnóstico", hypothetical: true,
          context: "Un pequeño taller recibe mensajes sobre horarios, ubicación, tipos de servicio y cómo solicitar una cita mientras el equipo está reparando bicicletas.",
          problem: "Responder preguntas repetidas interrumpe el trabajo, pero un asistente que invente un precio, confirme una cita no disponible o diagnostique una falla podría confundir a la persona.",
          approach: "El negocio prueba un asistente de texto de alcance limitado, conectado únicamente a una hoja de preguntas y respuestas revisada por el taller. El asistente puede orientar sobre horario, ubicación y servicios descritos allí; no completa datos que falten.",
          actions: [
            "Incluir solo datos aprobados por el taller: horarios, dirección, servicios disponibles y forma de solicitar una cita.",
            "Si preguntan por una tarifa que no aparece en la fuente, una falla mecánica, una fecha disponible o una excepción, no estimar ni confirmar: explicar que una persona debe revisarlo.",
            "No pedir contraseñas, datos financieros ni detalles personales que no sean necesarios para dirigir la consulta.",
            "Al comenzar la prueba, hacer que una persona revise cada borrador antes de enviarlo y corrija la fuente cuando encuentre información incompleta o vencida.",
          ],
          lesson: "El asistente ayuda a preparar una respuesta dentro de límites visibles; no reemplaza al equipo, no confirma trabajos y transfiere las preguntas que no puede responder desde la fuente aprobada.",
        }],
      },
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
        heading: "Cuándo no conviene implementar IA",
        paragraphs: ["No usar IA también puede ser la decisión correcta. Una hoja de cálculo, una plantilla de respuesta o una regla automática pueden resolver el problema de forma más sencilla."],
        blocks: [{ type: "list", items: [
          "La tarea ocurre rara vez o el paso manual es más fácil de revisar.",
          "El proceso cambia tanto que todavía no puede describirse ni supervisarse.",
          "Una respuesta incorrecta podría causar daño y no hay una persona disponible para hacerse cargo.",
          "La información necesaria es sensible, no está autorizada para ese proveedor o no puedes explicar cómo se conservará.",
          "No hay una fuente fiable, responsable de mantenerla ni un procedimiento para corregir errores.",
          "El piloto no aporta evidencia suficiente para justificar su costo, complejidad o riesgo.",
        ] }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{ type: "faq", items: [
          { question: "¿La inteligencia artificial siempre mejora un proceso?", answer: "No. Puede añadir errores, tareas de revisión, costo o exposición de datos. Compara un uso acotado con la forma actual de trabajar y conserva la opción de no implementarlo." },
          { question: "¿Un asistente conoce por sí solo los horarios o servicios del negocio?", answer: "No necesariamente. Solo puede responder con fiabilidad si recibe una fuente adecuada y vigente o si la herramienta tiene acceso autorizado a ella. La persona responsable debe actualizar y revisar esa información." },
          { question: "¿Un asistente de voz es más capaz que un chatbot?", answer: "No por ser de voz. El canal cambia —audio frente a texto—, pero sus capacidades y límites dependen del sistema, los datos y las acciones permitidas." },
          { question: "¿Puedo copiar conversaciones de clientes para entrenar un asistente?", answer: "No lo hagas por defecto. Evalúa necesidad, autorización, minimización y condiciones del proveedor; suele ser más prudente empezar con respuestas de negocio aprobadas y preguntas de prueba anonimizadas o sintéticas." },
          { question: "¿La IA puede aprobar por sí sola un precio o una decisión delicada?", answer: "No es recomendable. Una persona responsable debe comprobar la información y asumir las decisiones que afectan dinero, seguridad, derechos o compromisos con clientes." },
          { question: "¿Vecidya ofrece un asistente de IA en Aprende?", answer: "No. Este artículo es educativo; no anuncia ni activa un asistente, chatbot, agente de voz o automatización de IA de Vecidya." },
        ] }],
      },
      {
        heading: "Fuentes y orientación adicional",
        paragraphs: ["Los marcos y guías siguientes ayudan a identificar riesgos y preguntas para una prueba. No son garantías de resultados ni reemplazan requisitos legales locales."],
        blocks: [{ type: "sources", items: [
          { label: "NIST AI Risk Management Framework (AI RMF 1.0)", url: "https://www.nist.gov/itl/ai-risk-management-framework", scope: "Marco voluntario del NIST de Estados Unidos para gestionar riesgos durante el diseño, uso y evaluación de sistemas de IA. La página oficial indica que la versión 1.0 está en revisión." },
          { label: "NIST AI 600-1: Generative Artificial Intelligence Profile", url: "https://doi.org/10.6028/NIST.AI.600-1", scope: "Perfil del NIST que describe riesgos de IA generativa como confabulación, privacidad y configuración de la relación entre personas y sistemas." },
          { label: "Guidance on AI and data protection", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/", scope: "Orientación del ICO del Reino Unido sobre IA y protección de datos. La propia página advierte que su guía está en revisión; no define obligaciones para otros países." },
        ] }],
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{ type: "summary", items: [
          "Describe una sola tarea y comprueba primero si una regla, plantilla o proceso claro la resolvería sin IA.",
          "Si pruebas IA, limita el alcance, usa información aprobada y protege los datos personales.",
          "Define de antemano respuestas prohibidas, señales de transferencia y quién revisa los resultados.",
          "Compara el piloto con el proceso actual usando evidencia; continúa, ajusta o detén según los resultados reales.",
        ] }],
      },
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
