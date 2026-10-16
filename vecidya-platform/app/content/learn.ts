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
        paragraphs: ["La IA puede ayudar con partes acotadas del trabajo. Estos ejemplos son posibilidades generales, no resultados garantizados; cualquier complemento requiere definir su alcance, configuración y supervisión."],
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
        paragraphs: ["El siguiente escenario es hipotético. No describe un cliente real, una configuración ya activa ni resultados obtenidos por Vecidya."],
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
          { question: "¿La inteligencia artificial siempre mejora un proceso?", answer: "No. Puede añadir errores, revisión, costos y riesgos. Compárala con una regla o plantilla y conserva la opción de no adoptarla." },
          { question: "¿Un asistente conoce por sí solo los horarios o servicios del negocio?", answer: "No automáticamente. Necesita una fuente autorizada y vigente; una persona debe actualizarla y revisar las respuestas." },
          { question: "¿Un asistente de voz es más capaz que un chatbot?", answer: "No. Voz y texto son canales distintos; sus capacidades dependen del modelo, los datos y los permisos." },
          { question: "¿Puedo copiar conversaciones de clientes para entrenar un asistente?", answer: "No por defecto. Revisa autorización, privacidad y condiciones del proveedor; empieza con respuestas aprobadas y preguntas anonimizadas o sintéticas." },
          { question: "¿La IA puede aprobar por sí sola un precio o una decisión delicada?", answer: "No. Una persona debe verificar y asumir decisiones sobre dinero, seguridad, derechos o compromisos con clientes." },
          { question: "¿Qué opciones de inteligencia artificial ofrece Vecidya?", answer: "IA Conversacional e IA de Voz son complementos opcionales para Barrio o Ciudad; no se activan por defecto. Apoyan respuestas, clasificación inicial o atención por voz." },
          { question: "¿Cómo se cobra el consumo de IA?", answer: "El cargo mensual se cobra aparte del consumo del proveedor (tokens; minutos/telefonía para voz). Se acuerdan alcance, límites y supervisión; la disponibilidad depende de la configuración." },
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
    intro: "La presencia digital es el conjunto de lugares y señales donde una persona puede conocer un negocio, entender qué ofrece y decidir cómo acercarse. Organizarla puede ayudar a ofrecer información clara, pero no obliga a anunciarse ni garantiza descubrimiento o ventas.",
    excerpt: "Aclara tu oferta, ordena los canales, comprueba el contacto y decide con evidencia si la publicidad tiene sentido.",
    image: "/assets/learn/diagram-presence-digital.svg",
    imageAlt: "Tres canales digitales —sitio web, perfil de empresa y redes sociales— muestran de forma coherente una oferta, una zona de atención y opciones de contacto",
    cta: { label: "Conocer el Diagnóstico", to: "/diagnostico", copy: "Si quieres ordenar prioridades, el Diagnóstico de presencia digital puede servir como punto de partida; no promete visibilidad, clientes ni resultados comerciales." },
    sections: [
      {
        heading: "Qué significa tener presencia digital",
        paragraphs: [
          "La presencia digital reúne los lugares y la información mediante los que una persona puede reconocer un negocio, entender qué hace y encontrar cómo comunicarse. Puede incluir un sitio web, un perfil en un directorio o buscador, páginas de redes sociales, mapas, una tienda en línea y contenido que el propio negocio publica.",
          "No es un único perfil ni una campaña. Es el conjunto de información que controlas o mantienes en distintos canales y la experiencia que encuentra alguien al pasar de uno a otro. No tienes que estar en todas las plataformas: el punto de partida depende de cómo compran, consultan o reciben atención tus clientes y de quién podrá mantener cada canal actualizado.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "Presencia digital", definition: "Los canales, datos y contenidos donde el negocio se presenta y ofrece formas de conocerlo o contactarlo." },
          { term: "Visibilidad", definition: "La posibilidad de que una persona encuentre o vea información del negocio en un canal, búsqueda, recomendación o contenido. Depende de muchos factores; estar presente no asegura aparecer en un lugar específico." },
          { term: "Reputación", definition: "Las impresiones y señales que otras personas forman a partir de su experiencia, información disponible y comunicación del negocio. No se puede fabricar con testimonios o reseñas inventados." },
          { term: "Publicidad", definition: "Distribución pagada de un mensaje a través de una plataforma o medio, con presupuesto, segmentación y configuración determinados." },
        ] }, { type: "callout", tone: "tip", title: "Son conceptos relacionados, no equivalentes", text: "Abrir un perfil crea un punto de presencia, no garantiza visibilidad. Tener alcance no demuestra confianza. Una campaña compra distribución según su configuración, no una venta ni una posición orgánica." }],
      },
      {
        heading: "Antes de elegir canales: define tu negocio con claridad",
        paragraphs: ["Primero describe la actividad en palabras que una persona ajena al negocio pueda entender. Esa definición ayuda a mantener coherencia en el sitio, los perfiles y cualquier anuncio, y permite detectar promesas que el negocio no puede cumplir."],
        blocks: [{ type: "steps", label: "Cuatro decisiones para aclarar tu oferta", items: [
          { title: "Qué ofreces", detail: "Nombra productos o servicios concretos, qué incluyen y qué no. Separa lo disponible ahora de lo que podrías ofrecer más adelante. Si el precio depende de una evaluación, explica cómo pedirla sin publicar una tarifa ficticia." },
          { title: "A quién atiendes", detail: "Describe a las personas o negocios para quienes la oferta es adecuada y qué necesidad resuelve. Evita afirmar que atiendes a todo el mundo si hay límites reales de capacidad, especialidad o elegibilidad." },
          { title: "Dónde y cómo prestas el servicio", detail: "Indica si atiendes en un local, visitas zonas concretas, haces entregas, trabajas en línea o combinas modalidades. No publiques una dirección de atención si no recibes clientes allí." },
          { title: "Cuál es el siguiente paso", detail: "Elige una acción realista: llamar, escribir, pedir una cotización, reservar o visitar. Explica qué información conviene compartir y en qué plazo habitual responderá el equipo, solo si puede sostenerlo." },
        ] }],
      },
      {
        heading: "Organiza la información comercial básica",
        paragraphs: ["Reúne una fuente de referencia breve para que quien atiende, actualiza perfiles o prepara una página use los mismos datos. No hace falta redactar un plan de marketing: basta con acordar lo que debe ser correcto antes de publicarlo."],
        blocks: [{ type: "list", items: [
          "Nombre público del negocio y una descripción sencilla de su actividad.",
          "Productos o servicios disponibles, alcance, condiciones relevantes y cómo pedir información adicional.",
          "Tipo de cliente y necesidad atendida, sin promesas universales ni atributos no comprobados.",
          "Dirección pública si corresponde, área real de servicio y modalidades de atención.",
          "Horarios habituales, horarios especiales y fechas en las que el negocio estará cerrado.",
          "Canales de contacto que sí funcionan, quién los revisa y cuándo suele responder.",
          "Fotos propias y actuales, con permiso cuando aparezcan personas, propiedades o contenido de terceros.",
          "Una persona responsable de confirmar cambios y retirar información vencida.",
        ] }],
      },
      {
        heading: "Qué canales convienen según el negocio",
        paragraphs: ["Elige pocos canales que correspondan a la forma en que las personas buscan y compran tu oferta. Un negocio de atención por cita puede priorizar información local y reservas; una tienda puede necesitar catálogo, disponibilidad y compra; un servicio a domicilio debe aclarar su cobertura; una actividad de recomendación puede mantener una página social activa. Son ejemplos, no una receta universal."],
        blocks: [{ type: "list", items: [
          "Empieza por el lugar que tus clientes usan para informarse o contactarte y que alguien del equipo pueda atender con regularidad.",
          "Para una operación local, un perfil de empresa en un servicio de mapas o búsqueda puede presentar datos del local o del área atendida si la plataforma y el tipo de actividad son elegibles.",
          "Una red social tiene sentido cuando el formato ayuda a mostrar productos, procesos, novedades o responder preguntas y el negocio puede mantener esa actividad.",
          "Un sitio web puede reunir información que controlas —servicios, cobertura, condiciones, preguntas y contacto—, pero no es requisito universal para vender ni reemplaza la atención o una oferta clara.",
          "Si solo necesitas compartir un horario y un teléfono vigentes, comenzar con un perfil correcto puede ser más proporcionado que encargar un proyecto web completo.",
        ] }, { type: "callout", tone: "caution", title: "No abras canales que nadie va a mantener", text: "Un perfil desactualizado o un mensaje sin atender puede crear confusión. Es mejor una presencia sencilla y consistente que muchas cuentas activas solo en apariencia." }],
      },
      {
        heading: "Sitio web, perfil de empresa y redes sociales",
        paragraphs: ["Cada canal cumple una función distinta; pueden complementarse, pero ninguno es obligatorio para todos los negocios ni garantiza por sí solo que te encuentren."],
        blocks: [{ type: "definitions", items: [
          { term: "Sitio web", definition: "Un conjunto de páginas bajo un dominio que el negocio puede organizar para explicar su propuesta, presentar información detallada y facilitar una acción. Requiere mantenimiento, seguridad y actualizaciones; publicar una web no implica posicionamiento ni tráfico." },
          { term: "Perfil de empresa", definition: "Una ficha administrada dentro de una plataforma —por ejemplo, un servicio de búsqueda o mapas— con datos como nombre, categoría, ubicación o área, horario, teléfono, web y servicios compatibles. Su disponibilidad y campos dependen de las reglas de la plataforma, la elegibilidad y la verificación." },
          { term: "Red social", definition: "Una cuenta o página dentro de una plataforma social para publicar contenido y comunicarse allí. El negocio depende de las funciones, normas y distribución de esa plataforma y debe revisar sus mensajes y datos con regularidad." },
        ] }, { type: "paragraph", text: "La página web está bajo mayor control editorial del negocio, aunque depende del proveedor de alojamiento y del mantenimiento. El perfil vive dentro de un servicio ajeno con reglas propias. Las redes facilitan publicar y conversar en su entorno, pero no sustituyen una fuente de información estable. Escoge según el objetivo operativo y la capacidad de mantener cada espacio." }],
      },
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
          "Antes de instalar analítica, píxeles o formularios, identifica qué datos recogen, qué proveedor los procesa, cuánto tiempo se guardan y qué avisos, opciones o base legal requiere tu jurisdicción.",
        ] }, { type: "callout", tone: "caution", title: "Las reglas legales dependen del caso", text: "Las políticas de anuncios de Google o Meta son reglas de sus plataformas; no sustituyen la legislación sobre privacidad, cookies, accesibilidad, promociones o comunicaciones comerciales de tu país." }],
      },
      {
        heading: "Ejemplo hipotético: un taller local que considera anunciarse",
        paragraphs: ["Este caso es hipotético. No presenta resultados de ventas, estadísticas ni una configuración real de anuncios."],
        blocks: [{ type: "example", title: "El taller de bicicletas Rueda Clara", hypothetical: true,
          context: "El taller publica ocasionalmente en redes sociales, recibe consultas por mensajes y teléfono y está pensando pagar una campaña para atraer más solicitudes de reparación.",
          problem: "Al revisar los canales, algunas publicaciones dicen que atiende con cita, el perfil antiguo muestra un horario distinto y no queda claro si hace reparaciones a domicilio. Un enlace de contacto abre una cuenta que ya no revisan. Si llegaran más visitas, las personas podrían no saber si el taller les sirve o cómo obtener respuesta.",
          approach: "Antes de comprar alcance, el equipo reúne la información que puede confirmar, corrige los canales principales y prueba el recorrido de consulta desde un teléfono. No supone que una página web o una campaña sean obligatorias: primero resuelve la contradicción y el contacto fallido.",
          actions: [
            "Información mínima: servicios de reparación que realmente acepta, tipos de bicicleta que atiende, si trabaja con cita, dirección del local y si ofrece o no visitas a domicilio.",
            "Público y zona: definir a quién puede atender y el área práctica que cubre, sin anunciarse en lugares donde no presta servicio.",
            "Canales: elegir el perfil local y una red social que sí mantienen; valorar una página sencilla solo si necesitan explicar servicios, condiciones o reservas que no caben bien en esos perfiles.",
            "Actualización: corregir horarios, teléfono, descripción y enlaces en los espacios que usan; retirar o actualizar el perfil viejo y las publicaciones que prometen servicios no confirmados.",
            "Prueba: abrir cada enlace desde un teléfono sin sesión iniciada, llamar o enviar una consulta de prueba y comprobar quién recibe el mensaje y quién se hace cargo de responder.",
            "Responsabilidad: acordar una persona y un horario realista para revisar llamadas y mensajes, y qué hará cuando una consulta no corresponda al servicio.",
            "Decisión: si la información es coherente, la acción de contacto funciona y el taller puede atender solicitudes adicionales, puede considerar una prueba pequeña con objetivo, duración, zona, presupuesto y criterio de pausa definidos. Si todavía hay enlaces rotos o falta capacidad de respuesta, conviene seguir corrigiendo antes de pagar por más visitas.",
          ],
          lesson: "El caso no demuestra que los anuncios vayan a generar clientes. Muestra que primero se puede corregir una base operativa, y después decidir con cautela si medir una campaña responde a una necesidad concreta.",
        }],
      },
      {
        heading: "Presencia orgánica y publicidad pagada",
        paragraphs: ["La presencia orgánica incluye el sitio web, contenido informativo y perfiles de empresa que una organización mantiene sin pagar por distribuir cada impresión o clic. Puede requerir tiempo, trabajo y costes de creación o mantenimiento; no es automáticamente gratuita ni asegura aparecer en búsquedas o feeds.",
          "La publicidad pagada permite comprar distribución en sistemas como Google Ads o las campañas de Meta. El anunciante define un presupuesto y opciones de campaña, pero la entrega depende de la configuración, subasta o competencia, elegibilidad, audiencia, ubicación, calidad de los recursos y políticas vigentes. Pagar no compra una cantidad garantizada de clientes, una posición orgánica ni un resultado comercial.",
          "Son vías que pueden coexistir: el contenido puede explicar el servicio a largo plazo y una campaña puede probar distribución pagada en un periodo definido. Las herramientas gratuitas y los servicios contratados no son equivalentes: una herramienta puede exigir tiempo, conocimientos o mantenimiento; un servicio profesional puede aportar trabajo especializado, con coste y alcance que se deben acordar."] ,
        blocks: [{ type: "callout", tone: "tip", title: "Distingue canal de resultado", text: "Una visita, una impresión o un clic indican actividad en un canal. No equivalen a una consulta adecuada, una cita atendida, una venta ni rentabilidad." }],
      },
      {
        heading: "Qué revisar antes de Google Ads o Meta Ads",
        paragraphs: ["Primero decide qué necesidad atendería la campaña: hacer que más personas conozcan una actividad, recibir consultas, obtener reservas o vender un producto. Las plataformas ofrecen objetivos y configuraciones distintas; elegir uno no corrige la oferta, los datos o la experiencia de contacto."],
        blocks: [{ type: "steps", label: "Revisión antes de invertir en publicidad", items: [
          { title: "Confirma el objetivo del negocio", detail: "Define qué acción tendría valor y cómo se distinguiría de una visita o interacción superficial. Evita usar «más ventas» como única definición si aún no tienes claro quién responde o qué servicio promocionas." },
          { title: "Revisa oferta, disponibilidad y cobertura", detail: "Comprueba que lo anunciado existe, que puedes atender la demanda y que la zona o audiencia elegida coincide con tu operación y condiciones." },
          { title: "Verifica el destino y el contacto", detail: "Abre la página o perfil enlazado en un teléfono, revisa si carga, corresponde al anuncio y permite encontrar información útil sin pasos confusos. Prueba el formulario, teléfono, mensajería o reserva de principio a fin." },
          { title: "Lee políticas y requisitos vigentes", detail: "Revisa las políticas de anuncios y destinos de Google o Meta, las restricciones de tu sector, las reglas de marcas e imágenes y las normas locales aplicables. La aprobación depende de cada plataforma y no equivale a validación legal." },
          { title: "Acuerda presupuesto y límite", detail: "Define un monto que el negocio puede asumir como coste de prueba, el periodo y las condiciones de pausa. Incluye gastos de configuración, creatividad, servicio, herramientas e impuestos cuando correspondan." },
          { title: "Decide cómo observarás la prueba", detail: "Selecciona una o pocas acciones medibles, confirma que la medición funciona y revisa privacidad y permisos antes de instalar etiquetas, píxeles o compartir datos personales." },
        ] }],
      },
      {
        heading: "Prepara una página de destino y una acción clara",
        paragraphs: ["Una página de destino es el contenido al que llega una persona después de pulsar un enlace o un anuncio. Puede ser una página de un sitio web, una página de servicio o, según el canal y la política vigente, otro destino admitido. No es obligatorio construir una página independiente para cada campaña, pero el destino debe servir a la oferta que se anuncia."],
        blocks: [{ type: "list", items: [
          "Presenta el mismo servicio, producto, ubicación o condición que mencionaba el anuncio; evita destinos genéricos que no ayudan a decidir.",
          "Explica en lenguaje directo para quién es la oferta, qué incluye, qué límites aplican y cómo pedir el siguiente paso.",
          "Muestra una acción principal comprensible y funcional, como llamar, enviar una consulta, reservar o comprar. No acumules botones con destinos contradictorios.",
          "Comprueba que el formulario no pida datos innecesarios, indique los campos requeridos y confirme qué sucedió al enviarlo.",
          "Revisa que la página abra en móvil, cargue con una conexión corriente, no esconda información esencial y tenga enlaces vigentes a privacidad o condiciones cuando sean necesarios.",
          "Haz una prueba de extremo a extremo: clic, destino correcto, acción completada, aviso recibido y persona responsable asignada.",
        ] }, { type: "callout", tone: "caution", title: "La política de destino es una condición de plataforma", text: "Google Ads publica requisitos sobre destinos funcionales, accesibles y coherentes con el anuncio. Las plataformas pueden revisar o rechazar anuncios; una lista de comprobación no garantiza aprobación." }],
      },
      {
        heading: "Indicadores básicos que sí ayudan a aprender",
        paragraphs: ["Mide solo lo que corresponda al objetivo y a tu capacidad. Elige una línea de base sencilla, anota el periodo y compara fuentes y periodos equivalentes; no atribuyas cada cambio a una campaña si también cambiaron horarios, oferta, temporada o disponibilidad."],
        blocks: [{ type: "list", items: [
          "Encontrabilidad: vistas o impresiones reportadas por el canal, consultas de búsqueda relevantes y visitas a la página. Son señales de exposición, no prueba de compra.",
          "Interés: clics en enlaces, llamadas iniciadas, mensajes recibidos, formularios enviados o solicitudes de ruta cuando sean pertinentes. Comprueba que los eventos se registren correctamente y no cuentes pruebas como consultas reales.",
          "Atención: consultas que el negocio pudo atender, tiempo hasta responder, solicitudes que sí corresponden a la oferta y citas efectivamente reservadas o atendidas.",
          "Resultado y coste: ventas confirmadas o servicios contratados, coste de publicidad y otros gastos relevantes, anotando cómo se atribuyó cada resultado y qué quedó sin confirmar.",
          "Calidad y privacidad: errores de medición, datos que no necesitabas, formularios fallidos, solicitudes no deseadas y correcciones necesarias.",
        ] }, { type: "paragraph", text: "No necesitas implementar analítica compleja para empezar. Un registro manual y proporcionado puede bastar cuando hay pocas consultas. Si usas herramientas de terceros, revisa sus definiciones y límites: una conversión registrada no siempre demuestra causalidad ni equivale a ingreso." }],
      },
      {
        heading: "Problemas que la publicidad no resuelve",
        paragraphs: ["Más distribución puede amplificar tanto información correcta como errores existentes. Antes de pagar por atraer visitas, resuelve las barreras que hagan difícil entender, confiar o contactar al negocio."],
        blocks: [{ type: "list", items: [
          "Oferta confusa, incompleta, no disponible o dirigida a una zona donde no atiendes.",
          "Horarios, dirección, teléfono, enlaces o precios que se contradicen entre perfiles.",
          "Un formulario que no envía, un número que nadie contesta o un canal sin responsable.",
          "Poca capacidad para atender consultas o cumplir los plazos y condiciones prometidos.",
          "Una página lenta, ilegible en móvil, difícil de navegar o que no explica qué pasa después del contacto.",
          "Falta de permisos o claridad sobre privacidad, uso de imágenes, condiciones de la oferta o medición de datos.",
          "Un problema de precio, calidad, inventario, servicio o reputación que necesita una mejora operativa, no más exposición.",
        ] }, { type: "callout", tone: "caution", title: "No compres tráfico para probar una ruta rota", text: "Si el negocio todavía no puede explicar la oferta o atender a quien pregunta, corrige primero esa condición. La campaña no la resuelve por sí misma." }],
      },
      {
        heading: "Cuándo puede tener sentido probar anuncios",
        paragraphs: ["Una prueba pagada puede ser razonable cuando existe una oferta concreta, el negocio sabe a quién puede atender y en qué zona, el destino y el contacto funcionan, alguien responderá y hay presupuesto que puede destinarse a aprender sin comprometer gastos esenciales."],
        blocks: [{ type: "steps", label: "Acuerdo de prueba publicitaria", items: [
          { title: "Escribe una hipótesis concreta", detail: "Por ejemplo: «Queremos comprobar si personas de esta zona que buscan este servicio envían una solicitud que el equipo puede atender». Una hipótesis no es una predicción de ventas." },
          { title: "Elige una variable principal", detail: "Decide qué mensaje, zona, audiencia o destino vas a observar. Cambiar muchas cosas a la vez dificulta interpretar lo ocurrido." },
          { title: "Define límites antes de publicar", detail: "Establece presupuesto máximo, periodo, horario de atención, criterios para pausar y quién tiene permisos de cuenta. Usa preferentemente una cuenta publicitaria propiedad del negocio y registra quién puede acceder." },
          { title: "Revisa el recorrido y la medición", detail: "Comprueba el anuncio, el destino, los enlaces, la acción de contacto y el registro de resultados. Si la medición requiere cookies, etiquetas o datos personales, revisa primero las reglas aplicables." },
          { title: "Decide qué hacer con lo observado", detail: "Al cerrar la prueba, compara los datos con la línea de base y separa lo confirmado de lo que no se puede atribuir. Continúa, ajusta o detén; no escales solo porque hubo impresiones o clics." },
        ] }],
      },
      {
        heading: "Si todavía no necesitas anuncios",
        paragraphs: ["No anunciarse puede ser la mejor decisión actual. Puedes avanzar en la información, el servicio y la forma de atender sin pagar por distribución."],
        blocks: [{ type: "summary", items: [
          "Confirma qué ofreces, a quién atiendes, dónde operas y cuál es el siguiente paso posible.",
          "Actualiza el perfil o canal que ya usan tus clientes; elimina datos y enlaces antiguos.",
          "Publica contenido útil sobre servicios, condiciones, cobertura o preguntas reales, solo si puedes mantenerlo vigente.",
          "Asegura un medio de contacto funcional y acuerda quién atenderá las consultas.",
          "Observa cómo llegan las consultas actuales y qué dudas o fricciones se repiten, sin recoger más información personal de la necesaria.",
          "Vuelve a considerar anuncios solo cuando haya una pregunta concreta que una prueba pagada pueda ayudar a explorar.",
        ] }],
      },
      {
        heading: "Cómo se relaciona esta guía con Vecidya",
        paragraphs: ["Los conceptos anteriores aplican a cualquier negocio. En el producto Vecidya, el Diagnóstico de presencia digital ayuda a revisar información y prioridades; no publica anuncios ni garantiza alcance. MiniWeb organiza en un formato público los datos de perfil disponibles para el negocio, y Vecindario permite explorar perfiles públicos de negocios. Que una función exista en la plataforma no significa que toda licencia incluya el mismo alcance o que un perfil esté publicado: la disponibilidad depende del catálogo vigente, la configuración y los datos que el negocio mantenga."],
        blocks: [{ type: "list", items: [
          "Consulta el catálogo de Vecidya para distinguir licencias, capacidades, servicios profesionales y costes de uso; un servicio de web o publicidad puede contratarse de forma independiente según su alcance y condiciones.",
          "Un diagnóstico puede ayudarte a ordenar preguntas y prioridades, pero no reemplaza la comprobación de la oferta, enlaces, políticas, privacidad o capacidad real de atender.",
          "Antes de contratar apoyo, acuerda entregables, quién será propietario de cuentas y contenidos, presupuesto de medios, accesos, medición y criterios de cierre.",
          "Una página, perfil o servicio de presencia digital no garantiza posición en buscadores, nuevos clientes ni ventas.",
        ] }, { type: "faq", items: [
          { question: "¿MiniWeb o Vecindario garantizan que me encuentren más personas?", answer: "No. MiniWeb y Vecindario ayudan a presentar información pública del negocio según las capacidades, configuración y datos disponibles. La visibilidad depende también de la plataforma, la consulta, la competencia y otros factores; no se garantizan impresiones, clientes ni ventas." },
          { question: "¿El Diagnóstico crea o administra mis campañas?", answer: "No. El Diagnóstico de presencia digital ayuda a revisar capacidades y prioridades; no equivale a configurar ni gestionar campañas publicitarias." },
          { question: "¿Qué licencia necesito para anunciarme?", answer: "La necesidad depende de los servicios y capacidades contratados, no de una regla general de publicidad. Revisa el catálogo vigente y acuerda el alcance del trabajo con quien prestará el servicio." },
        ] }],
      },
      {
        heading: "Checklist para revisar tu presencia digital",
        paragraphs: ["Marca cada punto como «listo», «necesita corrección» o «no aplica» según el negocio. No sumes puntos ni conviertas la lista en una puntuación: sirve para ordenar acciones y no sustituye el Diagnóstico oficial de Vecidya."],
        blocks: [{ type: "list", items: [
          "□ Nombre e identidad: el nombre público es correcto y las fotos o marcas que usas están autorizadas.",
          "□ Oferta y público: se entiende qué productos o servicios ofreces, para quién y con qué condiciones principales.",
          "□ Ubicación o zona de servicio: la dirección se muestra solo si atiendes allí; la cobertura describe zonas que realmente puedes atender.",
          "□ Horarios: las horas habituales, cambios temporales y cierres están actualizados donde el público consulta.",
          "□ Contacto: teléfono, mensajería, formulario, reservas y enlaces funcionan desde un teléfono.",
          "□ Descripción de servicios o productos: está completa, es comprensible y no promete algo no disponible.",
          "□ Coherencia: nombre, horario, servicio, ubicación, condiciones y enlaces no se contradicen entre plataformas.",
          "□ Experiencia móvil: el texto se lee, la página abre y la acción principal puede completarse sin pasos inesperados.",
          "□ Accesibilidad básica: títulos claros, enlaces descriptivos, teclado, contraste y alternativas de imágenes se revisan; esto no acredita conformidad WCAG.",
          "□ Privacidad y seguridad: publicas solo datos necesarios, proteges cuentas, revisas permisos y conoces qué miden formularios o herramientas instaladas.",
          "□ Responsable: alguien sabe quién recibe las consultas, cuándo las revisa y qué hacer con una excepción.",
          "□ Medición proporcional: observas una o pocas acciones útiles sin instalar herramientas o recopilar más datos de los necesarios.",
        ] }, { type: "callout", tone: "tip", title: "Qué corregir primero", text: "Empieza por bloqueos que podrían desviar o perder a una persona: enlace roto, teléfono incorrecto, horario contradictorio, oferta que no se entiende o consulta que nadie atiende. Después prioriza lo demás según tu objetivo y capacidad." }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{ type: "faq", items: [
          { question: "¿Necesito una página web para vender?", answer: "No necesariamente. El canal adecuado depende de tu oferta, tus clientes y cómo operas. Un perfil o una forma directa de contacto puede ser suficiente para ciertos negocios; una web es útil cuando necesitas organizar información o acciones que otros canales no cubren bien." },
          { question: "¿Sin anuncios nadie puede encontrar mi negocio?", answer: "No. Las personas también pueden llegar por búsqueda orgánica, perfiles, recomendaciones, redes, comunidad, señalización y otros medios. Ningún canal garantiza que te encuentren; elige y mantén los que tengan sentido para tu actividad." },
          { question: "¿La publicidad aumenta las ventas?", answer: "No se puede asegurar. La campaña distribuye un mensaje bajo ciertas condiciones; las ventas dependen de la oferta, el público, el momento, la experiencia, la atención y otros factores. Evalúa con una prueba acotada si tienes una pregunta concreta." },
          { question: "¿Qué hago si todavía no tengo reseñas?", answer: "No las inventes ni compres testimonios. Presenta información verificable sobre el negocio, usa imágenes propias autorizadas y permite que las experiencias reales se compartan voluntariamente conforme a las políticas y reglas aplicables." },
          { question: "¿Debo abrir una cuenta en cada red social?", answer: "No. Prioriza los espacios que tu público utiliza y que alguien puede mantener y atender. Revisa también las condiciones y funciones actuales de cada plataforma." },
          { question: "¿Cuánto debo invertir en una primera campaña?", answer: "No hay una cifra universal. Define el límite según el presupuesto que puedas asumir, el coste total, el periodo, el objetivo y la capacidad para atender la demanda. No uses fondos necesarios para obligaciones esenciales como presupuesto de aprendizaje." },
          { question: "¿Puedo medir campañas sin instalar analítica?", answer: "A veces sí: puedes registrar consultas recibidas, preguntar de forma neutral cómo conocieron el negocio o usar reportes básicos de la plataforma. Cada método tiene límites; recoge solo lo necesario y revisa requisitos de privacidad antes de instalar herramientas." },
          { question: "¿Qué diferencia hay entre reglas de anuncios y obligaciones legales?", answer: "Las políticas de Google o Meta condicionan el uso de sus servicios y la revisión de anuncios. Las obligaciones legales dependen de tu país, sector, datos y actividad; cumplir la política de una plataforma no demuestra por sí solo cumplimiento legal." },
        ] }],
      },
      {
        heading: "Fuentes oficiales y alcance",
        paragraphs: ["Las fuentes siguientes se consultaron para preparar esta guía. Las recomendaciones editoriales y de organización son prácticas generales; los requisitos de plataforma se identifican como políticas y no deben confundirse con asesoría legal. Las reglas cambian y pueden variar por sector, formato o país: comprueba las versiones vigentes antes de actuar."],
        blocks: [{ type: "sources", items: [
          { label: "SEO Starter Guide — Google Search Central", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", scope: "Recomendaciones de Google Search sobre contenido útil, rastreo, títulos, enlaces e imágenes. La guía dice explícitamente que no hay una fórmula que garantice el primer puesto ni que toda recomendación aplique a todo sitio." },
          { label: "Edit your Business Profile — Google Business Profile Help", url: "https://support.google.com/business/answer/3039617", scope: "Ayuda oficial para editar información como nombre, dirección o área de servicio, horarios, teléfono, web, descripción y servicios. Disponibilidad, elegibilidad, verificación y revisión pueden variar." },
          { label: "Destination requirements — Google Ads Policies", url: "https://support.google.com/adspolicy/answer/6368661", scope: "Política de Google Ads sobre destinos funcionales, accesibles, coherentes y fáciles de usar. Es una condición de la plataforma, no una garantía de aprobación ni un requisito legal universal." },
          { label: "How to choose the right ad objective in Meta Ads Manager", url: "https://www.facebook.com/business/help/1438417719786914", scope: "Ayuda oficial de Meta que relaciona objetivos de campaña con metas como awareness, tráfico, leads o ventas. Describe opciones de configuración; no certifica el resultado que logrará una campaña." },
          { label: "About Meta Advertising Standards", url: "https://www.facebook.com/business/help/488043719226449", scope: "Centro de ayuda de Meta para sus estándares publicitarios y políticas relacionadas. Las normas de la plataforma pueden cambiar y no sustituyen el marco legal aplicable." },
          { label: "WCAG 2.2 Quick Reference — W3C WAI", url: "https://www.w3.org/WAI/WCAG22/quickref/", scope: "Referencia rápida del W3C para consultar criterios WCAG 2.2 y técnicas. Esta guía no ha sido objeto de una evaluación completa y no declara conformidad ni certificación WCAG 2.2 AA." },
          { label: "Tutorial: Set up a key event — Google Analytics Help", url: "https://support.google.com/analytics/answer/12966437", scope: "Ejemplo técnico oficial de Google para registrar un evento clave en Analytics. Una configuración de medición no prueba por sí misma causalidad comercial; evalúa datos, consentimiento y obligaciones antes de implementarla." },
          { label: "Privacy controls in Google Analytics — Google Analytics Help", url: "https://support.google.com/analytics/answer/9019185", scope: "Controles específicos del producto para configurar recopilación, retención y funciones publicitarias en Analytics. La página orienta sobre opciones técnicas, no decide qué base legal aplica a tu caso." },
        ] }],
      },
      {
        heading: "Qué hacer ahora",
        paragraphs: [],
        blocks: [{ type: "summary", items: [
          "Escribe en una frase qué ofreces, a quién atiendes y dónde prestas el servicio.",
          "Actualiza los datos comerciales y el canal principal que ya usas; comprueba sus enlaces desde móvil.",
          "Corrige primero información contradictoria, contacto roto y consultas sin responsable.",
          "Elige un indicador proporcional al objetivo y conserva sus límites y periodo de observación.",
          "Invierte en anuncios solo si hay una hipótesis concreta, un destino listo, capacidad de atender y presupuesto acotado; si no, sigue mejorando la base sin anuncios.",
        ] }],
      },
    ],
  },
  {
    slug: "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio",
    category: "Automatización",
    title: "Automatizaciones: ahorrar tiempo sin complicar tu negocio",
    intro: "Una automatización bien delimitada ejecuta pasos repetibles cuando ocurre algo y se cumplen ciertas condiciones. Aprenderás a elegir un proceso, probarlo y supervisarlo sin delegar decisiones que requieren criterio humano.",
    excerpt: "Aprende a identificar, documentar, probar y supervisar automatizaciones sencillas, con ejemplos operativos y comerciales.",
    image: "/assets/learn/diagram-automation.svg",
    imageAlt: "Flujo de automatización: un evento se evalúa mediante una condición y puede ejecutar una acción o pasar a revisión humana si no se cumple",
    cta: { label: "Consultar servicios", to: "/servicios", copy: "La implementación de una automatización personalizada puede formar parte de un servicio profesional; su alcance debe confirmarse previamente." },
    sections: [
      {
        heading: "Qué significa automatizar una tarea",
        paragraphs: [
          "Una automatización es una instrucción configurada para que un sistema realice uno o más pasos cuando detecta un evento y se cumplen unas condiciones. Por ejemplo, al recibir una entrega registrada, añadir una tarea de revisión a una lista compartida. La persona define la regla; el sistema ejecuta el paso previsto.",
          "Automatizar no significa que el negocio funcione sin personas ni que una herramienta entienda todas las situaciones. Sirve para reducir pasos manuales repetidos y previsibles. El resultado depende de que el proceso esté claro, los datos sean correctos y alguien revise las excepciones.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "Proceso manual", definition: "Una persona observa qué ocurrió, decide qué corresponde según el procedimiento y realiza el siguiente paso. Puede ser adecuado cuando el volumen es bajo o el caso necesita criterio." },
          { term: "Automatización", definition: "Una regla explícita ejecuta una acción predefinida al ocurrir un evento y cumplirse unas condiciones. No interpreta por sí sola lo que la regla no contempla." },
          { term: "Inteligencia artificial (IA)", definition: "Técnicas de software que producen resultados como clasificaciones, predicciones o borradores a partir de datos. El resultado puede variar o equivocarse; no es lo mismo que una regla fija." },
        ] }, { type: "callout", tone: "tip", title: "Automatizar e incorporar IA son decisiones distintas", text: "Un aviso por correo a una persona responsable puede seguir una regla convencional, sin IA. La IA solo tiene sentido si hace falta interpretar o generar contenido y hay una forma segura de revisar ese resultado." }],
      },
      {
        heading: "La secuencia: evento → condición → acción",
        paragraphs: ["Antes de elegir una herramienta, describe la lógica con palabras cotidianas. La condición es importante: un evento no siempre debe producir una acción. Si faltan datos o el caso no cumple la regla, el flujo necesita una salida segura, normalmente una revisión humana."],
        blocks: [{ type: "steps", label: "Partes de una automatización", items: [
          { title: "Evento o disparador", detail: "Algo observable inicia la comprobación: por ejemplo, alguien registra que se vendió la última unidad disponible. Debe quedar claro qué sistema o persona registra el evento y cuándo." },
          { title: "Condición", detail: "La regla decide si se debe continuar. Puede comprobar que la cantidad registrada sea cero, que el artículo esté activo y que no exista ya un aviso abierto para ese producto." },
          { title: "Acción", detail: "Si las condiciones se cumplen, el sistema hace un paso acotado: por ejemplo, crea una tarea de reposición en una lista interna y la asigna a la persona responsable." },
          { title: "Excepción y cierre", detail: "Si la información es incompleta, contradictoria o el paso falla, el flujo no debe fingir éxito. Registra el problema y deriva la revisión a una persona." },
        ] }, { type: "callout", tone: "caution", title: "No todos los eventos deben llegar a la acción", text: "La condición y la salida alternativa evitan avisos innecesarios, duplicados o acciones incorrectas. Dibuja también el camino de «no» y el de «no se pudo comprobar»." }],
      },
      {
        heading: "Cómo reconocer una tarea repetitiva",
        paragraphs: ["Observa el trabajo cotidiano durante unos días o ciclos completos. Anota cada vez que se repita el mismo paso, qué lo inicia, qué información se consulta y qué excepciones aparecen. No hace falta medirlo todo: primero busca un problema concreto y verificable."],
        blocks: [{ type: "steps", label: "Inventario breve de tareas", items: [
          { title: "Registra el paso, no solo el área", detail: "En vez de «inventario», escribe «cuando se termina una caja, revisar existencias y avisar a quien compra». Así se puede evaluar qué parte es repetible." },
          { title: "Cuenta cuándo ocurre", detail: "Anota una frecuencia aproximada, cuánto tarda el paso y si genera esperas, interrupciones, omisiones o correcciones. No presupongas que automatizarlo ahorrará tiempo." },
          { title: "Describe entradas y resultado", detail: "¿Qué dato se necesita? ¿Dónde aparece? ¿Qué significa terminar bien? Si las personas hacen el paso de maneras distintas, aclara primero cuál es el procedimiento acordado." },
          { title: "Recoge excepciones reales", detail: "Anota casos frecuentes que cambian el resultado: producto descontinuado, registro tardío, dato dudoso, ausencia de responsable o aviso que ya estaba abierto." },
        ] }],
      },
      {
        heading: "Qué conviene automatizar y qué conviene dejar manual",
        paragraphs: ["Una buena primera candidata suele ser frecuente, estable, basada en datos disponibles y fácil de revisar. La decisión no depende de que una tarea parezca moderna: compara el coste y el riesgo de configurar y mantener la regla con el problema observable que resolvería."],
        blocks: [{ type: "list", items: [
          "Candidatas posibles: crear un aviso interno cuando se registre una condición clara, ordenar una tarea en una lista o recordar a una persona del equipo una fecha acordada.",
          "Deja manual la tarea si ocurre rara vez, cambia mucho de caso a caso, depende de una conversación o requiere valorar contexto que no está registrado.",
          "No delegues sin controles una decisión de salud, seguridad, crédito, derechos, precio especial o compromiso contractual; define la revisión por alguien competente.",
          "Si una regla sencilla resuelve el problema, no añadas IA ni conexiones adicionales solo porque estén disponibles.",
          "Si todavía no puedes explicar el proceso a una persona nueva, ordénalo primero. Automatizar pasos confusos puede hacer que el error se repita más deprisa.",
        ] }, { type: "callout", tone: "tip", title: "Empieza por una parte pequeña", text: "A veces conviene automatizar solo el aviso y dejar la comprobación y la decisión de compra a una persona. Una intervención parcial y verificable es mejor que un proceso completo sin supervisión." }],
      },
      {
        heading: "Documenta el proceso antes de configurar nada",
        paragraphs: ["Una descripción breve evita traducir una costumbre ambigua a reglas rígidas. Escríbela con quienes realizan el trabajo y acuerden cómo reconocer un resultado correcto."],
        blocks: [{ type: "steps", label: "Ficha del proceso antes de automatizar", items: [
          { title: "Objetivo y límite", detail: "Indica qué problema observable quieres atender y qué queda fuera. Ejemplo: avisar al responsable de revisar reposición; no elegir proveedor ni hacer una compra automáticamente." },
          { title: "Evento y origen del dato", detail: "Nombra el hecho que inicia el flujo y quién o qué lo registra. Evita disparadores vagos, como «cuando haga falta», sin un dato que permita comprobarlo." },
          { title: "Condiciones y exclusiones", detail: "Especifica los criterios de continuar, no continuar y pedir revisión. Incluye cuándo un artículo está inactivo, falta información o ya existe una tarea abierta." },
          { title: "Acción, responsable y plazo", detail: "Escribe el paso exacto, quién recibe o realiza la tarea y cuándo debe atenderla. La automatización tiene una persona dueña, aunque no pulse cada botón." },
          { title: "Errores, duplicados y reintentos", detail: "Define qué debe registrarse cuando una acción falla, cómo evitar crearla dos veces y cuándo se permite volver a intentarla sin duplicar efectos." },
          { title: "Prueba, medida y parada", detail: "Anota casos de prueba, cómo confirmar el resultado, qué indicador observarás y quién puede pausar, corregir o retirar la automatización." },
        ] }],
      },
      {
        heading: "Ejemplo principal: reposición de bolsas de café",
        paragraphs: ["Este caso es hipotético y operativo: organiza una tarea interna. No depende de contactos, seguimiento comercial ni de un CRM, y no representa una configuración activa de Vecidya."],
        blocks: [{ type: "example", title: "Un pequeño tostador local prepara su reposición", hypothetical: true,
          context: "En una tienda pequeña, quien vende bolsas de café también registra las ventas en una hoja sencilla. La persona encargada de compras revisa existencias dos veces por semana.",
          problem: "Cuando una variedad se agota entre revisiones, el equipo puede notarlo tarde. Sin embargo, una venta devuelta o un registro corregido también puede cambiar la cantidad; comprar en automático sería arriesgado.",
          approach: "Se automatiza solamente una tarea interna: avisar a la persona encargada de revisar una posible reposición. La decisión de contar físicamente, elegir cantidad y hacer el pedido sigue siendo humana.",
          actions: [
            "Evento: al guardar una venta, devolución o ajuste de inventario, la cantidad registrada de una variedad cambia.",
            "Condición: la variedad está marcada como activa, la cantidad es igual a cero y no hay ya una tarea de reposición abierta para esa variedad.",
            "Acción: crear una sola tarea interna titulada «Contar y revisar reposición de [variedad]», con fecha de hoy y asignada a la persona responsable de compras. No enviar un mensaje al cliente ni emitir una orden de compra.",
            "Responsable: la encargada de compras confirma la cantidad en el estante, revisa entregas pendientes y decide si corresponde solicitar producto; después marca la tarea como resuelta o explica por qué no se repone.",
            "Resultado esperado: cuando la condición se cumple, aparece una tarea visible para revisión; el resultado no es una compra automática ni una promesa de que nunca habrá faltantes.",
            "Excepciones: si falta la variedad, la cantidad no es numérica, el producto está inactivo o el sistema no puede verificar si ya existe una tarea, no se crea otra tarea a ciegas: se registra el caso para revisión manual.",
            "Comprobación: revisar el registro del evento, el valor evaluado, la tarea creada o la razón por la que no se creó. Confirmar además que un segundo evento equivalente no haya duplicado la tarea.",
            "Si falla: la persona revisa el inventario con el procedimiento manual habitual, registra la incidencia y avisa a quien mantiene el flujo. No se repite la acción hasta confirmar que el primer intento no creó ya la tarea.",
          ],
          lesson: "Para dibujar el equivalente de tu negocio, escribe una caja para el evento, un rombo para la condición, una caja para la acción y dos salidas: «sí» continúa; «no», «dato dudoso» o «error» conducen a una revisión o al proceso manual. Añade en cada paso el dato utilizado y quién responde por el resultado.",
        }],
      },
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
        heading: "Un ejemplo comercial breve: recordatorio acordado",
        paragraphs: ["Este segundo ejemplo es hipotético y sirve para distinguir una automatización operativa de una comercial. No implica que el flujo esté configurado o activado en Vecidya."],
        blocks: [{ type: "example", title: "Recordar una cotización solicitada", hypothetical: true,
          context: "Una persona pide una cotización y acuerda que el negocio le escriba el martes si aún no tiene respuesta.",
          problem: "El equipo quiere recordar el acuerdo sin contactar a quien ya respondió, pidió una pausa o prefirió no recibir más mensajes.",
          approach: "Una regla puede crear un recordatorio interno para revisar el caso. En una versión que prepara un mensaje externo, una persona comprueba primero el contexto y las preferencias; la regla no interpreta por sí sola el silencio como permiso ilimitado.",
          actions: [
            "Evento: llega la fecha de revisión acordada y el registro de la cotización sigue abierto.",
            "Condiciones: no hay respuesta registrada, no se canceló la solicitud y las preferencias permiten ese contacto por el canal indicado.",
            "Acción operativa: crear una tarea interna para que la persona responsable revise la conversación. Si se prepara un mensaje, dejarlo en borrador hasta la revisión humana.",
            "Excepción: si falta el permiso requerido, existe una baja, el estado no está actualizado o hay una queja, no enviar; asignar revisión y respetar la exclusión.",
            "Diferencia clave: reposición avisa al equipo para organizar una operación; este seguimiento afecta una relación comercial y requiere contexto y control adicional sobre comunicación externa.",
          ],
          lesson: "Un recordatorio interno y un mensaje comercial no son la misma acción. Cada canal y jurisdicción puede tener reglas propias; comprueba preferencias y requisitos aplicables antes de contactar.",
        }],
      },
      {
        heading: "Errores frecuentes que conviene evitar",
        paragraphs: [],
        blocks: [{ type: "list", items: [
          "Automatizar antes de acordar el proceso o sin definir qué significa terminar correctamente.",
          "Suponer que cada evento debe producir una acción, sin condiciones ni camino de excepción.",
          "Permitir reintentos ilimitados o repetir acciones sin comprobar si el primer intento surtió efecto.",
          "Conectar la regla directamente a un mensaje externo, compra o decisión sensible sin revisión proporcional al riesgo.",
          "Olvidar quién mantiene los datos, recibe fallos, atiende tareas y puede pausar el flujo.",
          "Probar solo el caso ideal y no comprobar duplicados, datos ausentes, bajas o confirmaciones tardías.",
          "Medir solo los pasos automáticos e ignorar configuración, revisión, correcciones, costes y excepciones.",
          "Atribuir ahorros garantizados o generalizar una prueba pequeña a todo el negocio.",
        ] }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{ type: "faq", items: [
          { question: "¿Necesito saber programar para automatizar una tarea?", answer: "No siempre. Algunas herramientas permiten configurar reglas visualmente; otras requieren apoyo técnico. En ambos casos necesitas definir el proceso, los datos, las excepciones, las pruebas y la persona responsable." },
          { question: "¿Automatización e inteligencia artificial son lo mismo?", answer: "No. Una automatización convencional sigue reglas explícitas. La IA genera o interpreta resultados variables. Pueden combinarse, pero esa combinación requiere más pruebas y supervisión." },
          { question: "¿Qué parte del negocio conviene automatizar primero?", answer: "Una tarea frecuente, estable, de riesgo acotado y con resultado fácil de comprobar. Empieza por un aviso o registro interno; no automatices una decisión que aún no puedes describir claramente." },
          { question: "¿Qué hago si la automatización falla o repite una acción?", answer: "Pausa la rama afectada, comprueba si el primer intento produjo efecto y atiende manualmente los casos pendientes. Registra la incidencia, evita reintentos a ciegas y prueba la corrección antes de reactivar." },
          { question: "¿Puedo enviar recordatorios automáticos a clientes?", answer: "Depende del propósito, canal, preferencias registradas y requisitos aplicables. Comprueba bajas y permisos antes del envío; considera mantener el mensaje en borrador para que una persona revise el contexto." },
          { question: "¿Una función que aparece en el catálogo ya está activa para mi negocio?", answer: "No. El catálogo describe capacidades comerciales, no confirma que estén contratadas, configuradas o activas. Verifica el contrato y la configuración efectiva de tu caso." },
          { question: "¿Qué ofrece Vecidya para automatizar?", answer: "El catálogo distingue automatizaciones CRM estándar para Barrio, multiproceso para Ciudad y trabajo personalizado como servicio profesional. La disponibilidad depende del contrato, alcance y configuración; figurar en el catálogo no significa estar activado." },
        ] }],
      },
      {
        heading: "Fuentes y orientación adicional",
        paragraphs: ["Estas referencias apoyan la gestión de privacidad, seguridad y comunicaciones. Cada una corresponde a un marco o jurisdicción concreta y no determina por sí sola las obligaciones de tu negocio."],
        blocks: [{ type: "sources", items: [
          { label: "NIST Privacy Framework", url: "https://www.nist.gov/privacy-framework", scope: "Marco voluntario del NIST de Estados Unidos para identificar y gestionar riesgos de privacidad. Útil como guía de preguntas; no es una ley universal." },
          { label: "NIST Cybersecurity Framework (CSF) 2.0", url: "https://www.nist.gov/cyberframework", scope: "Marco del NIST para gestionar riesgos de ciberseguridad. Sus prácticas pueden orientar controles de acceso y supervisión, pero no sustituyen requisitos locales." },
          { label: "Electronic mail marketing", url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/", scope: "Orientación de la autoridad ICO del Reino Unido sobre marketing por correo electrónico y preferencias. Se refiere al marco británico; verifica las reglas de tu jurisdicción y canal." },
        ] }],
      },
      {
        heading: "Qué puedes hacer ahora",
        paragraphs: [],
        blocks: [{ type: "summary", items: [
          "Anota una tarea repetida y el problema observable que causa; no prometas ahorros antes de medir.",
          "Documenta evento, condiciones, acción, responsable, excepciones y alternativa manual.",
          "Prueba casos normales, datos inválidos, duplicados y fallos con registros ficticios o anonimizados.",
          "Define quién revisa, qué indicador comparar y cómo pausar, corregir o revertir los efectos cuando sea seguro.",
          "Si el proceso contacta clientes, comprueba preferencias y requisitos del canal antes de enviar mensajes.",
        ] }],
      },
    ],
  },
];

export function getLearnArticle(slug: string) {
  return learnArticles.find((article) => article.slug === slug);
}
