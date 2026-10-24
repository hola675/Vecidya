import { learnBusinessOperationsArticles } from "./learn-business-operations";
import { learnOperations02Articles } from "./learn-operations-02";
import { learnManagement03Articles } from "./learn-management-03";

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
    intro: "¿Te ha pasado que prometes responderle a alguien y luego no encuentras su mensaje? Un CRM ayuda a organizar consultas y próximos pasos, pero una lista sencilla puede bastar para empezar.",
    excerpt: "Descubre cómo recordar pendientes, cuándo basta una tabla y en qué momento tiene sentido usar un CRM.",
    enPocasPalabras: ["Empieza con una lista sencilla si todavía puedes llevar bien tus consultas.","Anota qué necesita la persona y qué harás después.","Un CRM ayuda cuando coordinar el seguimiento se vuelve difícil."],
    image: "/assets/learn/diagram-crm.svg",
    imageAlt: "Una consulta se registra con contexto y puede continuar, retomarse después o cerrarse, según lo que ocurra",
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar capacidades digitales; no es un CRM ni crea una base de contactos." },
    editorialDraft: false,
    sections: [
      {
        heading: "Qué podrás hacer al terminar",
        paragraphs: ["Identificarás qué información mínima necesitas para seguir una consulta, distinguirás entre una lista sencilla y un CRM, y podrás elegir una primera mejora sin comprar una herramienta por impulso."],
        blocks: [{ type: "steps", label: "Ejercicio de dos minutos", items: [
          { title: "Recuerda una consulta pendiente", detail: "Sin escribir datos personales, piensa qué información te faltó para responderla." },
          { title: "Formula la próxima acción", detail: "Completa mentalmente: «La persona necesita…, el siguiente paso es… y lo revisará…»." },
          { title: "Elige el soporte más sencillo", detail: "Decide si una lista controlada basta o si necesitas coordinar a varias personas y canales." },
        ] }],
      },
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
    intro: "¿Te gustaría recibir ayuda para escribir un mensaje o ordenar preguntas repetidas? La inteligencia artificial puede preparar borradores, pero hay que comprobar lo que dice.",
    excerpt: "Conoce tareas pequeñas para probar IA, cómo evitar errores y qué decisiones conviene mantener en manos humanas.",
    enPocasPalabras: ["La IA puede preparar borradores, pero también puede equivocarse.","Prueba primero una tarea pequeña y fácil de revisar.","No compartas datos privados ni dejes decisiones importantes sin supervisión."],
    image: "/assets/learn/diagram-ai.svg",
    imageAlt: "Una consulta se convierte en un borrador de IA que una persona revisa antes de responder o transferir",
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico ayuda a revisar procesos y prioridades digitales; no instala asistentes ni activa herramientas de IA." },
    sections: [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Qué puede hacer una inteligencia artificial por un negocio?», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
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
    intro: "Antes de pagar anuncios, hazte una pregunta: si alguien llega hoy a tu perfil, ¿entiende qué haces y cómo contactarte? Empieza por ordenar esa información.",
    excerpt: "Revisa tus datos, canales y contacto antes de decidir si vale la pena invertir en publicidad.",
    enPocasPalabras: ["Antes de pagar anuncios, explica claramente qué ofreces.","Comprueba horarios, canales y datos en todos tus perfiles.","La publicidad no arregla una página confusa o difícil de contactar."],
    image: "/assets/learn/diagram-presence-digital.svg",
    imageAlt: "Tres canales digitales —sitio web, perfil de empresa y redes sociales— muestran de forma coherente una oferta, una zona de atención y opciones de contacto",
    cta: { label: "Conocer el Diagnóstico", to: "/diagnostico", copy: "Si quieres ordenar prioridades, el Diagnóstico de presencia digital puede servir como punto de partida; no promete visibilidad, clientes ni resultados comerciales." },
    sections: [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Antes de hacer publicidad, organiza tu presencia digital», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
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
    intro: "¿Repites la misma tarea todos los días? Algunas se pueden hacer de forma automática. Antes de intentarlo, conviene tener claros los pasos y los posibles errores.",
    excerpt: "Aprende a escoger una tarea repetitiva, probarla sin riesgos y mantener una forma de detenerla.",
    enPocasPalabras: ["Automatiza una tarea repetitiva que ya sabes hacer manualmente.","Decide qué la inicia y cuándo debe intervenir alguien.","Prueba los errores posibles y conserva una forma de detenerla."],
    image: "/assets/learn/diagram-automation.svg",
    imageAlt: "Flujo de automatización: un evento se evalúa mediante una condición y puede ejecutar una acción o pasar a revisión humana si no se cumple",
    cta: { label: "Consultar servicios", to: "/servicios", copy: "La implementación de una automatización personalizada puede formar parte de un servicio profesional; su alcance debe confirmarse previamente." },
    sections: [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Automatizaciones: ahorrar tiempo sin complicar tu negocio», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
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
  {
    slug: "dominio-hosting-sitio-web-como-funcionan",
    category: "Tecnología explicada",
    title: "Dominio, hosting y sitio web: qué es cada cosa y cómo funcionan juntos",
    intro: "Una persona escribe la dirección de tu negocio y aparece tu página. ¿Cómo sucede eso? Te explicamos el dominio, el alojamiento y la conexión entre ambos sin enredos.",
    excerpt: "Entiende las piezas de una web y qué accesos conviene conservar a tu nombre.",
    enPocasPalabras: ["El dominio es la dirección que escriben las personas; el sitio es lo que ven.","El alojamiento guarda la web y el DNS conecta la dirección con el servidor.","Conserva el acceso y las fechas de renovación de cada servicio."],
    image: "/assets/learn/diagram-domain-dns-hosting.svg",
    imageAlt: "Recorrido de una persona al escribir una dirección: el navegador puede consultar DNS si no tiene una respuesta vigente en caché, conecta con el servidor web y recibe la página solicitada.",
    relatedSlugs: ["antes-de-hacer-publicidad-organiza-tu-presencia-digital"],
    cta: { label: "Revisar mi punto de partida digital", to: "/diagnostico", copy: "El Diagnóstico puede ayudarte a priorizar necesidades digitales; no registra dominios ni administra DNS o alojamiento." },
    sections: [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «Dominio, hosting y sitio web: qué es cada cosa y cómo funcionan juntos», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        heading: "Dominio, hosting y sitio web: tres piezas distintas",
        paragraphs: [
          "Un dominio es un nombre fácil de recordar que se usa dentro de una dirección web, como el nombre que aparece después de https://. El hosting —o alojamiento web— es un servicio que mantiene un servidor disponible para entregar los archivos o la aplicación del sitio. El sitio web es el contenido y el software que las personas ven y utilizan.",
          "Una analogía útil: el dominio se parece a una dirección, el DNS a una guía que ayuda a ubicar un destino y el hosting a un local donde funciona el negocio. La comparación tiene límites: Internet no consulta una libreta central única, una dirección no es una propiedad física y los servicios pueden cambiarse o contratarse por separado.",
        ],
        blocks: [{ type: "definitions", items: [
          { term: "Nombre de dominio", definition: "Un nombre legible, compuesto por etiquetas y una extensión —por ejemplo, un nombre terminado en .com— que permite identificar una ubicación dentro del sistema de nombres de Internet. No contiene por sí mismo la página web." },
          { term: "Registro de dominio", definition: "El servicio y el acuerdo por los que un registrador tramita y mantiene el derecho de uso de un nombre durante un periodo renovable, sujeto a sus condiciones y a las reglas de la extensión. No es una compra perpetua del nombre." },
          { term: "Titular o registrante", definition: "La persona u organización que figura como responsable contractual de la registración. Según ICANN, el registrante gestiona la configuración del dominio a través de su registrador." },
          { term: "Hosting o alojamiento", definition: "Un servicio que ejecuta o almacena los componentes de un sitio en uno o más servidores y los entrega cuando reciben solicitudes. La capacidad, las copias de seguridad y el soporte dependen del plan y del proveedor." },
          { term: "Servidor web", definition: "El software y la infraestructura que reciben solicitudes HTTP/HTTPS para un sitio y envían respuestas, como una página o un archivo. El servidor puede ser administrado por el proveedor de hosting." },
          { term: "Sitio web", definition: "El conjunto de páginas, archivos y funciones que el servidor entrega para una dirección. Un sitio puede existir en una dirección temporal del proveedor antes de conectar un dominio propio." },
          { term: "DNS", definition: "El Sistema de Nombres de Dominio responde consultas sobre nombres, por ejemplo qué dirección de red corresponde a un host. DNS encuentra información de ubicación; no guarda ni entrega por sí mismo el contenido de la página." },
          { term: "Registrador", definition: "La empresa con la que se registra y administra un dominio. El operador de registro mantiene los datos de una extensión; un revendedor puede ofrecer la registración junto con otros servicios." },
        ] }],
      },
      {
        heading: "Del nombre que escribes a la página que ves",
        paragraphs: [
          "La imagen muestra el recorrido simplificado de una visita. Si escribes una dirección como https://negocio.example/horarios, el navegador separa el nombre del host de la ruta solicitada. Antes de preguntar por DNS, puede revisar respuestas guardadas por el propio navegador, el sistema operativo o el resolver de la red.",
          "Si no encuentra una respuesta vigente, el navegador usa un resolver DNS. Ese resolver puede responder desde su propia caché o consultar otros servidores DNS hasta obtener la información autoritativa. Con una dirección de red, el navegador establece una conexión con el servidor; si la dirección usa HTTPS, negocia TLS y solicita la página. El servidor responde con el contenido y el navegador lo presenta.",
          "La flecha punteada de retorno en el diagrama representa la dirección que DNS devuelve al navegador. Después, el navegador hace una solicitud distinta al servidor web; DNS no transporta el contenido de la página.",
          "No se hace necesariamente una consulta DNS nueva en cada visita ni por cada imagen o archivo: las respuestas pueden conservarse mientras su tiempo de vida (TTL) siga vigente, y el navegador puede reutilizar una conexión. DNS ayuda a localizar el servidor; la solicitud al servidor es la que pide la página.",
        ],
        blocks: [{ type: "callout", tone: "tip", title: "DNS localiza; el servidor entrega", text: "Si una persona entra a una página y luego abre otra sección del mismo sitio, el navegador normalmente puede seguir usando la resolución guardada o la conexión existente. Una consulta nueva puede ser necesaria cuando no hay una respuesta vigente, pero no es un paso obligatorio para cada solicitud web." }],
      },
      {
        heading: "Qué significa registrar un dominio",
        paragraphs: [
          "Para registrar un nombre, normalmente se elige una extensión, se comprueba disponibilidad y se solicita la registración a un registrador o a un revendedor. Para muchas extensiones genéricas existen acuerdos y políticas de ICANN; las extensiones de país pueden tener reglas propias. Comprueba siempre las condiciones de la extensión y del registrador concreto.",
          "El registrador atiende la relación de servicio con el titular. El operador de registro mantiene los datos de los nombres de una extensión y publica la delegación DNS. Un revendedor puede vender el dominio como parte de un paquete. La página de ICANN explica estos papeles para el proceso que describe; no convierte a ICANN en la empresa que vende o administra tu dominio.",
          "El registro y el hosting son servicios distintos. Pagar un dominio te permite mantener ese nombre registrado durante el periodo acordado; no garantiza que ya exista un sitio, que tengas correo profesional ni que el proveedor aloje tus archivos. Algunas empresas los incluyen en un paquete, pero conviene revisar qué parte es opcional y cómo se renueva.",
        ],
        blocks: [{ type: "callout", tone: "caution", title: "Un dominio no se compra para siempre", text: "La registración tiene una vigencia y debe renovarse según el contrato y las reglas de la extensión. Si se vence, el nombre puede dejar de funcionar y, después de los periodos aplicables, quedar disponible para que otra persona lo registre." }],
      },
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
        heading: "Ejemplo práctico: una profesional publica su primera página",
        paragraphs: ["Este caso es hipotético y educativo. No representa un negocio real, una configuración activa de Vecidya ni una recomendación de compra a un proveedor."],
        blocks: [{ type: "example", title: "Una profesional de reparación de bicicletas organiza su presencia web", hypothetical: true,
          context: "Una profesional independiente quiere publicar una página sencilla con los servicios que ofrece, su zona de atención y una forma clara de contacto.",
          problem: "No sabe si debe pagar un dominio, un hosting y un correo por separado, quién debe controlar las cuentas ni qué conservar si más adelante cambia de proveedor.",
          approach: "Primero define el objetivo de la página y compara un servicio gestionado que publique el sitio con una dirección propia del proveedor frente a contratar un dominio y alojamiento por separado. Revisa el alcance y las condiciones antes de elegir; no presupone precios ni un resultado comercial.",
          actions: [
            "Elige un nombre corto y fácil de comunicar; comprueba su disponibilidad con un registrador y verifica que el nombre y la extensión sean adecuados para el negocio.",
            "Registra el dominio a nombre de la persona o entidad que debe conservar su control. Usa una dirección de correo que el negocio controle para los avisos y recuperación de la cuenta.",
            "Decide dónde se alojará el sitio. Pregunta qué incluye el servicio: publicación, soporte, copias, certificado TLS, exportación y renovación. El registro del dominio no crea el sitio ni contrata automáticamente el alojamiento.",
            "Sigue la guía técnica del proveedor para conectar el dominio: delega DNS o actualiza los registros indicados. Antes, guarda los valores actuales y conserva MX/TXT si ya existe correo con ese dominio.",
            "Verifica HTTPS en el nombre elegido, prueba la página en un teléfono y en una computadora, revisa enlaces, formulario y datos de contacto, y comprueba que la dirección cargue el contenido esperado.",
            "Guarda en un lugar seguro quién es el registrante, el registrador, el proveedor DNS, el alojamiento y el correo; conserva accesos individuales, recuperación, instrucciones, comprobantes y fechas de renovación. No compartas una contraseña común con quien te ayuda.",
            "Si la página deja de funcionar, revisa primero la fecha del dominio, el estado del hosting, los NS y registros DNS, la vigencia TLS y si hubo un cambio reciente. Anota el mensaje de error y contacta al proveedor correspondiente sin borrar la zona ni cancelar otro servicio a ciegas.",
          ],
          lesson: "La presencia web funciona con servicios que se coordinan, pero no son inseparables. Saber quién mantiene cada pieza, cómo se renueva y cómo salir del servicio evita que una sola cuenta perdida deje al negocio sin página, dominio o correo.",
        }],
      },
      {
        heading: "Qué ocurre si cambias de proveedor",
        paragraphs: [
          "«Cambiar de proveedor» puede significar cambiar solo el alojamiento, trasladar la administración DNS, cambiar el correo o transferir el registro a otro registrador. Son operaciones distintas. Una transferencia de registrador cambia quién administra el contrato del dominio; no copia el sitio ni migra el buzón de correo.",
          "Para mover la web, prepara los archivos y datos en el nuevo alojamiento, configura TLS y prueba el sitio antes de actualizar DNS. Conserva los registros de correo y verificación. Mantén el alojamiento anterior mientras compruebas que el nuevo funciona y que los resolvers dejan de usar las respuestas anteriores; cancela el servicio antiguo solo cuando sepas qué depende de él.",
          "Cambiar los NS significa que otra zona DNS pasa a ser autoritativa. Antes de hacerlo, replica los registros necesarios del sitio, correo y otros servicios. Cambiar solo el A/AAAA o CNAME de la web puede ser suficiente en algunos casos, pero usa los valores y pasos oficiales del proveedor nuevo.",
        ],
        blocks: [{ type: "list", items: [
          "Dominio a otro registrador: revisa elegibilidad, bloqueos, código de transferencia, renovación y efectos contractuales con ambos registradores.",
          "Sitio a otro hosting: migra y prueba el contenido; el nombre de dominio no se transfiere automáticamente.",
          "DNS a otro proveedor: copia registros web, correo y verificación antes de cambiar la delegación.",
          "Correo a otro servicio: migra buzones y actualiza los registros de correo sin interrumpir la web.",
        ] }],
      },
      {
        heading: "Quién debe tener el control administrativo del dominio",
        paragraphs: [
          "Para un negocio, suele ser más claro que la persona o entidad responsable figure como registrante y controle la cuenta de registración. Un profesional puede ayudar a configurar DNS o el sitio, pero conviene que la empresa mantenga acceso verificable y pueda cambiar de proveedor sin depender de una única persona externa.",
          "Usa un correo administrativo que siga bajo control del negocio, activa medidas de seguridad disponibles —por ejemplo, autenticación multifactor—, mantén actualizados los datos de recuperación y limita permisos a cada colaborador. Guarda por separado el nombre del registrador y del proveedor DNS: pueden ser distintos.",
        ],
        blocks: [{ type: "callout", tone: "caution", title: "No entregues el control para recibir ayuda técnica", text: "Pide una cuenta individual o un acceso delegado si el servicio lo permite. No compartas contraseñas de correo ni de recuperación; acuerda quién puede cambiar el DNS, renovar, transferir o cancelar el dominio y cómo recuperar el acceso cuando termina la colaboración." }],
      },
      {
        heading: "Qué revisar antes de contratar o renovar",
        paragraphs: ["Compara el servicio que necesitas y el coste de conservarlo, no solo el precio promocional de la primera factura. Los términos y tarifas dependen del proveedor, la extensión, el periodo, el país y los servicios adicionales."],
        blocks: [{ type: "steps", label: "Lista de revisión para contratar o renovar", items: [
          { title: "Identifica cada servicio", detail: "Separa registro del dominio, DNS, hosting de la web, correo, certificado TLS, copias y soporte. Pregunta cuáles están incluidos y cuáles son opcionales." },
          { title: "Lee el precio de renovación", detail: "Revisa tarifa del siguiente periodo, moneda, impuestos, fechas, renovación automática y cargos por restaurar un dominio vencido. Las tarifas pueden diferir de una promoción inicial." },
          { title: "Confirma quién será el registrante", detail: "Comprueba qué persona o entidad aparece en el contrato, qué correo recibe los avisos y quién puede recuperar la cuenta." },
          { title: "Comprueba el control y la salida", detail: "Pregunta cómo editar DNS, exportar archivos y datos, transferir el dominio, cancelar el servicio y descargar tus comprobantes." },
          { title: "Valora continuidad y soporte", detail: "Averigua cómo se solicitan copias, recuperación y soporte, qué límites aplica el plan y qué ocurre si vence una tarjeta o cambia el responsable." },
          { title: "Anota fechas y responsables", detail: "Guarda la próxima renovación, el método de aviso, el contacto de soporte y la persona que puede responder si el sitio o correo deja de funcionar." },
        ] }],
      },
      {
        heading: "Qué costos pueden aparecer",
        paragraphs: ["No existe un costo único aplicable a todos los dominios o sitios. La oferta puede separar cada servicio o agrupar varios; confirma importes y condiciones directamente con quien emite el contrato."],
        blocks: [{ type: "list", items: [
          "Registro y renovación del dominio: varían por extensión, registrador, periodo y condiciones. La tarifa de renovación puede ser distinta de la promoción inicial.",
          "Alojamiento web: depende del tipo de servicio, capacidad, tráfico, soporte y funciones incluidas.",
          "Correo profesional: puede cobrarse por buzón, capacidad o plan, y es independiente del alojamiento web aunque se venda en paquete.",
          "Certificado TLS: algunos servicios lo incluyen o automatizan; otros ofrecen opciones adicionales o configuración distinta. Comprueba qué nombres y renovaciones cubre.",
          "Servicios opcionales: copias adicionales, privacidad de datos de registración donde esté disponible, seguridad, migración o soporte especializado pueden tener condiciones propias.",
        ] }],
      },
      {
        heading: "Errores frecuentes que conviene evitar",
        paragraphs: [],
        blocks: [{ type: "list", items: [
          "Creer que registrar el dominio ya incluye una página web, hosting y correo.",
          "Poner el dominio a nombre o bajo el correo personal de un tercero sin conservar acceso del negocio.",
          "Cambiar los servidores DNS sin copiar los registros que usa el correo u otros servicios activos.",
          "Cancelar el hosting anterior antes de probar el nuevo sitio y comprobar sus datos.",
          "Mirar solo el precio inicial y no anotar la fecha ni las condiciones de renovación.",
          "Suponer que ver HTTPS demuestra que el negocio es confiable o que el contenido es seguro.",
          "Confundir un registro DNS con los archivos del sitio: DNS indica dónde consultar, no migra el contenido.",
          "Esperar a que la página falle para descubrir quién tiene las credenciales o quién recibe los avisos del registrador.",
        ] }],
      },
      {
        heading: "Qué necesita realmente un negocio pequeño para empezar",
        paragraphs: [
          "Empieza por definir qué información quieres publicar y quién la mantendrá actualizada. Para una página sencilla necesitas una forma de publicarla —en un hosting propio o en una plataforma que lo gestione— y una dirección que pueda abrir tu público. Un dominio propio es una opción de identidad y control que se registra aparte, salvo que un paquete lo incluya con condiciones claras.",
          "Una plataforma de presencia digital o un minisitio puede reducir la configuración técnica si se ocupa de publicar y mantener partes de la página. Eso no significa automáticamente que incluya un dominio personalizado, correo profesional, control completo de DNS o exportación: confirma esas capacidades y cómo llevarías tus datos si cambias de servicio.",
          "El correo profesional es opcional para publicar una web, aunque el negocio puede necesitarlo para comunicarse. Si lo contratas, verifica por separado quién administra los buzones y quién conserva los registros MX/TXT. No contrates una pieza solo porque aparece en un paquete si todavía no resuelve una necesidad real.",
        ],
        blocks: [{ type: "summary", items: [
          "Aclara si necesitas una página, un dominio propio, correo profesional o una combinación; son servicios distintos.",
          "Comprueba qué proveedor administra el dominio, la zona DNS, el hosting y el correo antes de cambiar nada.",
          "Asegúrate de que el registrante y el correo de recuperación estén bajo control del negocio.",
          "Activa y prueba HTTPS, conserva los registros de correo y apunta las fechas y costes de renovación.",
          "Guarda accesos individuales, comprobantes, soporte y copias; no canceles un servicio hasta verificar qué depende de él.",
        ] }],
      },
      {
        heading: "Ya tienes un dominio pero no sabes quién lo administra",
        paragraphs: [
          "Empieza por buscar el nombre exacto en comprobantes, mensajes de renovación, gestor de contraseñas y documentos del negocio. Pregunta a quien configuró el sitio cuál es el registrador y quién es el registrante; pide que te indiquen la cuenta y los servicios, no que te envíen contraseñas por un canal inseguro.",
          "Si no sabes qué registrador mantiene un dominio genérico, consulta ICANN Lookup. El resultado ayuda a identificar al registrador, pero no necesariamente al proveedor de hosting, al administrador DNS ni a la persona con acceso a la cuenta. Contacta al registrador por sus canales oficiales y sigue su proceso de verificación y recuperación.",
          "Cuando recuperes acceso, verifica los datos del registrante, el correo de recuperación, la fecha de renovación, el estado de transferencia y los servidores NS. Guarda una copia de la zona DNS antes de modificarla. No registres un nombre duplicado ni cambies los NS a ciegas mientras el sitio o el correo dependan de la configuración actual.",
        ],
        blocks: [{ type: "steps", label: "Pasos para recuperar el control con cuidado", items: [
          { title: "Busca el registrador", detail: "Consulta ICANN Lookup cuando aplique y compara el resultado con facturas o avisos anteriores." },
          { title: "Identifica al registrante", detail: "Revisa el contrato o solicita al registrador el procedimiento para verificar qué persona u organización tiene los derechos de registro." },
          { title: "Recupera una cuenta segura", detail: "Usa los canales oficiales del registrador, confirma correo y teléfono de recuperación y activa controles de seguridad disponibles." },
          { title: "Documenta antes de cambiar", detail: "Anota renovación, NS y registros existentes; identifica qué sitio, correo y servicios dependen de esa zona." },
          { title: "Actualiza responsabilidades", detail: "Deja el acceso bajo control del negocio y proporciona permisos individuales a quienes apoyen el mantenimiento." },
        ] }],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [{ type: "faq", items: [
          { question: "Si registro un dominio, ¿ya tengo un sitio web?", answer: "No. El registro reserva el uso del nombre durante el periodo contratado. También necesitas un sitio y un servicio que lo publique, o una plataforma que los incluya claramente." },
          { question: "¿El hosting incluye siempre correo profesional?", answer: "No. La web y el correo son servicios distintos. Revisa si el plan incluye buzones y quién administra los registros MX y las cuentas." },
          { question: "¿Necesito una consulta DNS nueva en cada visita?", answer: "No necesariamente. El navegador, el sistema y los resolvers pueden usar respuestas en caché mientras sigan vigentes; una conexión existente también puede reutilizarse." },
          { question: "¿HTTPS significa que el sitio o el negocio son confiables?", answer: "No. HTTPS protege la conexión con el dominio y permite autenticarlo mediante TLS. No demuestra que la empresa sea legítima ni que la información o las ofertas sean verdaderas." },
          { question: "¿Puedo cambiar el hosting sin transferir mi dominio?", answer: "Sí. El registro del dominio y el alojamiento son servicios separados. Para que el nombre llegue al nuevo sitio quizá debas actualizar DNS, pero una transferencia de registrador no migra la web." },
          { question: "¿Cambiar los servidores DNS puede afectar el correo?", answer: "Sí, si la nueva zona no conserva los registros MX y otros valores que usa tu proveedor de correo. Guarda la configuración actual y verifica los registros antes de delegar DNS." },
          { question: "¿Qué hago si no sé quién administra mi dominio?", answer: "Busca facturas y avisos de renovación; usa ICANN Lookup para identificar al registrador cuando aplique y solicita recuperación por sus canales oficiales. El resultado no identifica necesariamente a quien aloja la web." },
          { question: "¿Debo contratar dominio, hosting y correo con una sola empresa?", answer: "No hay una respuesta universal. Un paquete puede simplificar facturas o configuración; servicios separados pueden dar más flexibilidad. Compara el coste de renovación, el control, el soporte y la salida." },
          { question: "¿Cuánto cuesta registrar y mantener un dominio?", answer: "Depende de la extensión, el registrador, el periodo, la región y los servicios adicionales. Revisa la tarifa de renovación, impuestos y cargos de recuperación directamente en las condiciones vigentes." },
        ] }],
      },
      {
        heading: "Fuentes y orientación adicional",
        paragraphs: ["Estas referencias oficiales respaldan los conceptos generales. ICANN describe políticas y procesos que dependen de la extensión y del contrato; los RFC del IETF son estándares técnicos, y MDN explica el uso web de TLS."],
        blocks: [{ type: "sources", items: [
          { label: "Information for Domain Name Registrants — ICANN", url: "https://www.icann.org/registrants", scope: "Define al registrante, explica que gestiona el dominio a través del registrador e incluye ICANN Lookup. Consultado el 17 de octubre de 2026; las políticas aplicables dependen de la extensión." },
          { label: "ICANN Lookup — herramienta de búsqueda de datos de registro", url: "https://lookup.icann.org/en", scope: "Permite consultar información de registro de dominios genéricos y ayuda a identificar al registrador; no identifica necesariamente el hosting ni a quien accede a la cuenta. Consultado el 17 de octubre de 2026." },
          { label: "The Domain Name Registration Process — ICANN", url: "https://www.icann.org/resources/pages/domain-name-registration-process-2023-11-02-en", scope: "Describe registrantes, registradores, operadores de registro y revendedores, y señala que tarifas, transferencias y renovaciones dependen de los acuerdos. Consultado el 17 de octubre de 2026." },
          { label: "Domain Name Renewals and Expiration FAQs — ICANN", url: "https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en", scope: "Recomienda comprobar vencimiento, condiciones de renovación, contactos y tarifas; describe periodos que pueden aplicar a dominios vencidos. Consultado el 17 de octubre de 2026." },
          { label: "RFC 1034: Domain Names — Concepts and Facilities", url: "https://datatracker.ietf.org/doc/html/rfc1034", scope: "Estándar del IETF que describe resolvers, servidores de nombres, datos autoritativos y caché/TTL en DNS. Consultado el 17 de octubre de 2026." },
          { label: "RFC 1035: Domain Names — Implementation and Specification", url: "https://datatracker.ietf.org/doc/html/rfc1035", scope: "Especifica registros como A, NS, CNAME y MX. No es una guía de configuración para un proveedor concreto. Consultado el 17 de octubre de 2026." },
          { label: "RFC 3596: DNS Extensions to Support IP Version 6", url: "https://datatracker.ietf.org/doc/html/rfc3596", scope: "Define la extensión de DNS para consultas y registros de direcciones IPv6 (AAAA). Consultado el 17 de octubre de 2026." },
          { label: "Transport Layer Security (TLS) — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security", scope: "Explica cómo TLS protege conexiones HTTP y cómo el certificado participa en la autenticación del servidor. Consultado el 17 de octubre de 2026." },
        ] }],
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
    title: "Que te encuentren y te entiendan",
    description: "Presenta tu negocio con palabras claras y elige dónde mostrarlo.",
    slugs: [
      "como-explicar-lo-que-vendes-para-que-te-entiendan",
      "redes-sociales-o-pagina-web-que-necesita-tu-negocio",
      "fotos-y-publicaciones-utiles-sin-ser-disenador",
      "perfil-empresa-google-completar-y-mantener-actualizado",
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
] as const;

export function getLearnArticle(slug: string) {
  return learnArticles.find((article) => article.slug === slug);
}
