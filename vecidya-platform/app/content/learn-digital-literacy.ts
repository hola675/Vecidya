import type { LearnArticle } from "./learn";

/**
 * APRENDE-EDITORIAL-04A: alfabetización digital transversal.
 * Estas guías amplían Aprende más allá de la operación empresarial sin convertirlo
 * en un catálogo de herramientas. Permanecen en revisión editorial hasta aprobación.
 */
export const learnDigitalLiteracyArticles: LearnArticle[] = [
  {
    slug: "el-que-mucho-abarca-poco-aprieta-prioridades-digitales",
    category: "Tecnología explicada",
    title: "El que mucho abarca, poco aprieta: cómo elegir tus prioridades digitales",
    intro: "Abrir más cuentas, instalar más aplicaciones o empezar cinco proyectos a la vez no garantiza avanzar. Aprende a elegir pocas mejoras que puedas entender, mantener y comprobar.",
    excerpt: "Una guía para decidir qué atender primero en tu vida digital o en tu negocio sin acumular herramientas, canales y pendientes.",
    enPocasPalabras: [
      "Empieza por el problema que más se repite, no por la herramienta de moda.",
      "Elige pocas prioridades que puedas mantener y deja por escrito qué puede esperar.",
      "Revisa el resultado antes de añadir otra aplicación, canal o automatización.",
    ],
    image: "/assets/learn/diagram-como-empezar.svg",
    imageAlt: "Tres pasos sencillos representan comprender un problema, elegir una prioridad y comprobar el resultado antes de añadir más tecnología.",
    editorialDraft: false,
    relatedSlugs: [
      "como-elegir-herramientas-digitales-sin-llenar-la-empresa-de-aplicaciones",
      "como-empezar-a-digitalizar-un-negocio-desde-cero",
      "domina-la-tecnologia-sin-que-te-domine",
    ],
    cta: {
      label: "Revisar mi punto de partida",
      to: "/diagnostico",
      copy: "Si estás pensando en tu negocio, el Diagnóstico puede ayudarte a identificar prioridades antes de sumar herramientas.",
    },
    sections: [
      {
        heading: "Qué significa «el que mucho abarca, poco aprieta» en lo digital",
        paragraphs: [
          "El refrán no significa que debas conformarte con poco. Significa que tu atención, tu tiempo y tu capacidad para mantener sistemas son limitados. Cuando intentas cambiar demasiadas cosas al mismo tiempo, resulta más difícil saber qué funciona, qué quedó incompleto y qué necesita corregirse.",
          "Esto puede ocurrir en un negocio que abre cinco redes sociales sin poder actualizarlas, pero también en una persona que instala varias aplicaciones de organización y termina anotando cada pendiente en un lugar diferente.",
        ],
        blocks: [
          {
            type: "callout",
            tone: "tip",
            title: "Priorizar también es decidir qué no harás todavía",
            text: "Una lista corta de prioridades solo funciona si dejas otras ideas para después. Posponer conscientemente no es abandonar: es proteger el tiempo necesario para terminar lo importante.",
          },
        ],
      },
      {
        heading: "Antes de elegir una herramienta, describe el problema",
        paragraphs: [
          "Una herramienta es una posible respuesta, no el punto de partida. Si escribes primero qué está ocurriendo, a quién afecta y qué resultado necesitas, podrás comparar soluciones más sencillas.",
        ],
        blocks: [
          {
            type: "steps",
            label: "Cuatro preguntas para encontrar una prioridad",
            items: [
              {
                title: "¿Qué problema se repite?",
                detail: "Describe una situación observable: «olvido responder consultas», «no encuentro mis archivos» o «publicamos horarios diferentes». Evita empezar con «necesito una app».",
              },
              {
                title: "¿Qué ocurre si no lo resuelves?",
                detail: "Distingue una molestia pequeña de un problema que hace perder información, tiempo, dinero o confianza.",
              },
              {
                title: "¿Cuál sería una mejora suficiente?",
                detail: "Define un resultado sencillo y comprobable. Quizá baste con encontrar un archivo en menos tiempo o tener un único horario vigente.",
              },
              {
                title: "¿Qué puedes mantener de verdad?",
                detail: "Ten en cuenta el tiempo, las personas responsables, el costo, la seguridad y el esfuerzo de mantener la solución actualizada.",
              },
            ],
          },
        ],
      },
      {
        heading: "Ejemplo personal: cinco aplicaciones para una sola lista",
        paragraphs: [
          "Este caso es inventado y sirve para mostrar cómo reducir herramientas antes de buscar otra solución.",
        ],
        blocks: [
          {
            type: "example",
            title: "Lucía quiere organizar sus pendientes",
            hypothetical: true,
            context: "Lucía guarda recordatorios en una aplicación de notas, un calendario, mensajes que se envía a sí misma, una lista de tareas y capturas de pantalla.",
            problem: "Cuando necesita recordar algo, primero debe averiguar dónde lo apuntó. Instalar otra aplicación aumentaría los lugares que tiene que revisar.",
            approach: "Durante una semana elige una sola lista para las tareas que necesitan acción y deja el calendario únicamente para compromisos con fecha u hora.",
            actions: [
              "Reúne los pendientes activos sin copiar información personal que ya no necesita.",
              "Elige un solo lugar para las tareas y otro, si hace falta, para las citas con fecha.",
              "Deja de crear recordatorios nuevos en las otras aplicaciones durante la prueba.",
              "Al terminar la semana, comprueba qué olvidó, qué encontró con facilidad y qué regla necesita ajustar.",
            ],
            lesson: "La mejora no vino de instalar una sexta aplicación, sino de reducir lugares y acordar para qué sirve cada uno.",
          },
        ],
      },
      {
        heading: "Ejemplo de negocio: estar en todas las redes no es una estrategia",
        paragraphs: [
          "Un negocio puede necesitar varios canales, pero cada canal nuevo exige contenido, respuestas, información vigente y una persona responsable.",
        ],
        blocks: [
          {
            type: "example",
            title: "Una cafetería intenta publicar en cinco redes",
            hypothetical: true,
            context: "La cafetería abre cuentas en cinco plataformas porque otras empresas también están allí. Dos personas publican cuando tienen tiempo.",
            problem: "Algunas cuentas muestran horarios antiguos, otras no reciben respuesta y el equipo dedica más tiempo a copiar publicaciones que a mantener correcta la información principal.",
            approach: "El equipo revisa dónde llegan consultas útiles y decide mantener primero dos canales que puede atender bien, además de su información básica de ubicación y horario.",
            actions: [
              "Anota qué función cumple cada canal: informar, responder consultas, mostrar trabajos o recibir pedidos.",
              "Comprueba cuáles reciben actividad que el negocio realmente puede atender.",
              "Corrige primero nombre, horario, ubicación y contacto en los canales que seguirá manteniendo.",
              "Deja las demás cuentas sin nuevas promesas hasta decidir si existe tiempo y responsable para sostenerlas.",
            ],
            lesson: "Más canales pueden ampliar el trabajo sin mejorar la experiencia. La prioridad es mantener bien los canales que sí cumplen una función.",
          },
        ],
      },
      {
        heading: "Cómo elegir tres prioridades sin convertirlas en una lista infinita",
        paragraphs: [
          "Tres no es un número mágico. Es una forma práctica de obligarte a comparar. En una situación urgente quizá solo haya una prioridad; en un proyecto más grande puede haber varias, pero conviene limitar el trabajo simultáneo.",
        ],
        blocks: [
          {
            type: "definitions",
            items: [
              {
                term: "Ahora",
                definition: "Problema que afecta una actividad importante y tiene una siguiente acción concreta.",
              },
              {
                term: "Después",
                definition: "Mejora útil que puede esperar hasta comprobar o terminar el trabajo actual.",
              },
              {
                term: "No por ahora",
                definition: "Idea que parece interesante, pero todavía no responde a una necesidad clara o no puedes mantenerla.",
              },
            ],
          },
          {
            type: "list",
            items: [
              "Prioriza seguridad, acceso o pérdida de información cuando exista un riesgo inmediato.",
              "Después atiende los errores que se repiten y dificultan completar una tarea importante.",
              "Prefiere una mejora que puedas probar y revisar frente a un cambio enorme sin criterio de éxito.",
              "No añadas una herramienta únicamente porque incluye muchas funciones; pregunta cuáles usarás realmente.",
            ],
          },
        ],
      },
      {
        heading: "Cuándo sí tiene sentido ampliar",
        paragraphs: [
          "Simplificar no significa quedarse siempre con lo mínimo. Una herramienta nueva, otro canal o una automatización pueden estar justificados cuando la forma actual ya no permite trabajar con claridad.",
          "Antes de ampliar, comprueba que el problema existe, que la solución anterior se está utilizando correctamente y que alguien podrá mantener el nuevo sistema.",
        ],
        blocks: [
          {
            type: "callout",
            tone: "caution",
            title: "No conviertas la simplicidad en inmovilismo",
            text: "Si el método actual causa errores frecuentes, no escala con el equipo o crea un riesgo que ya conoces, mantenerlo solo por ser sencillo tampoco es una buena decisión. Priorizar significa cambiar con una razón.",
          },
        ],
      },
      {
        heading: "Una práctica de diez minutos",
        paragraphs: [
          "Escribe cinco problemas o ideas digitales que tengas pendientes. Al lado de cada una responde: qué problema resuelve, qué ocurre si espera, quién la mantendrá y cómo sabrás si mejoró algo. Elige la primera solo después de comparar esas respuestas.",
        ],
        blocks: [
          {
            type: "summary",
            items: [
              "Describe el problema antes de buscar la herramienta.",
              "Elige pocas prioridades que puedas terminar y mantener.",
              "Comprueba el resultado antes de añadir otra capa de tecnología.",
            ],
          },
        ],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [
          {
            type: "faq",
            items: [
              {
                question: "¿Tengo que limitarme siempre a tres prioridades?",
                answer: "No. El número es una ayuda para ordenar. Ajusta el trabajo simultáneo a tu tiempo, riesgo y capacidad real.",
              },
              {
                question: "¿Cerrar una cuenta o dejar una herramienta siempre es mejor?",
                answer: "No. Primero revisa si contiene información, accesos o datos que debas conservar, exportar o eliminar de forma segura.",
              },
              {
                question: "¿Cómo sé si una nueva herramienta merece la pena?",
                answer: "Relaciona la herramienta con un problema concreto, prueba el flujo en pequeño y compara el resultado con la forma de trabajar anterior.",
              },
            ],
          },
        ],
      },
      {
        heading: "Fuentes y alcance",
        paragraphs: [
          "Estas referencias apoyan el enfoque de priorizar según necesidades, capacidad y riesgo. No establecen un número universal de herramientas ni una receta para todos los negocios.",
        ],
        blocks: [
          {
            type: "sources",
            items: [
              {
                label: "OCDE — Empowering SMEs in the age of AI (2026)",
                url: "https://www.oecd.org/en/publications/empowering-smes-in-the-age-of-ai_bf5a9816-en.html",
                scope: "El informe describe barreras de adopción digital como tiempo, mantenimiento y habilidades, y señala que la integración estratégica de IA sigue siendo desigual. La muestra del estudio no es representativa de todas las pymes.",
              },
              {
                label: "NIST — Cybersecurity Framework 2.0",
                url: "https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20",
                scope: "Marco voluntario para comprender, evaluar, priorizar y comunicar riesgos de ciberseguridad en organizaciones de distintos tamaños; no prescribe una única forma de lograr los resultados.",
              },
              {
                label: "W3C WAI — Writing for Web Accessibility",
                url: "https://www.w3.org/WAI/tips/writing/",
                scope: "Recomienda contenido claro, conciso, bien estructurado y con instrucciones comprensibles; se utiliza aquí como referencia para la forma educativa de Aprende.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "domina-la-tecnologia-sin-que-te-domine",
    category: "Tecnología explicada",
    title: "Domina la tecnología: úsala con intención sin dejar que decida por ti",
    intro: "La tecnología puede ahorrar trabajo, conectar personas y resolver problemas. También puede llenarte de notificaciones, decisiones automáticas y dependencias que no entiendes. Aprende a conservar el control.",
    excerpt: "Criterios sencillos para usar aplicaciones, IA, cuentas y automatizaciones sin entregarles decisiones que todavía te corresponden.",
    enPocasPalabras: [
      "Usa una herramienta porque resuelve una necesidad, no porque reclame constantemente tu atención.",
      "Conserva accesos, opciones de recuperación y una forma de continuar si el servicio falla.",
      "La IA y la automatización pueden ayudar, pero las decisiones importantes necesitan límites y revisión humana.",
    ],
    image: "/assets/learn/diagram-como-proteger.svg",
    imageAlt: "Una persona mantiene el control de sus cuentas, decisiones y copias mientras utiliza distintas herramientas digitales.",
    editorialDraft: false,
    relatedSlugs: [
      "el-que-mucho-abarca-poco-aprieta-prioridades-digitales",
      "como-proteger-cuentas-contrasenas-estafas-negocio",
      "como-hacer-copias-de-seguridad-de-tu-negocio",
      "que-puede-hacer-una-inteligencia-artificial-por-un-negocio",
    ],
    cta: {
      label: "Revisar mi situación digital",
      to: "/diagnostico",
      copy: "Para un negocio, el Diagnóstico puede ayudar a distinguir qué capacidad necesita atención y qué puede esperar.",
    },
    sections: [
      {
        heading: "La tecnología es una herramienta, no quien decide tus prioridades",
        paragraphs: [
          "Una aplicación puede recordarte una tarea, recomendarte contenido, redactar un texto o ejecutar una regla. Eso no significa que conozca por sí sola qué es importante para ti, qué información es correcta o qué riesgo estás dispuesto a aceptar.",
          "Mantener el control significa saber para qué utilizas una herramienta, qué datos recibe, qué decisiones le permites tomar y qué harás si deja de funcionar.",
        ],
        blocks: [
          {
            type: "callout",
            tone: "tip",
            title: "Haz una pregunta sencilla",
            text: "Si mañana esta herramienta desapareciera, ¿sabrías recuperar tu información, entrar en tus cuentas importantes y continuar la tarea esencial de otra manera?",
          },
        ],
      },
      {
        heading: "Cuatro preguntas antes de depender de una herramienta",
        paragraphs: [
          "No necesitas comprender todo el funcionamiento interno de una aplicación para usarla con criterio. Sí conviene entender las decisiones que afectan tu información y tu capacidad de continuar.",
        ],
        blocks: [
          {
            type: "definitions",
            items: [
              {
                term: "Necesidad",
                definition: "Qué problema concreto estás intentando resolver y qué ocurriría sin la herramienta.",
              },
              {
                term: "Datos",
                definition: "Qué información introduces, quién puede acceder a ella y si realmente hace falta compartirla.",
              },
              {
                term: "Control",
                definition: "Quién administra la cuenta, puede cambiar configuraciones, aprobar acciones y recuperar el acceso.",
              },
              {
                term: "Salida",
                definition: "Cómo exportarías información, cancelarías el servicio o continuarías si deja de estar disponible.",
              },
            ],
          },
        ],
      },
      {
        heading: "Ejemplo personal: las notificaciones empiezan a dirigir el día",
        paragraphs: [
          "Este escenario es hipotético y no supone que todas las notificaciones sean negativas.",
        ],
        blocks: [
          {
            type: "example",
            title: "Diego revisa el teléfono cada pocos minutos",
            hypothetical: true,
            context: "Diego tiene activadas notificaciones de redes sociales, noticias, compras, juegos, correo y varias aplicaciones que casi no utiliza.",
            problem: "Cada aviso parece pedir atención inmediata. Al final del día le cuesta distinguir los mensajes importantes del resto.",
            approach: "Revisa qué avisos necesitan realmente interrumpirlo y deja los demás para momentos en los que decide abrir la aplicación.",
            actions: [
              "Mantiene alertas para llamadas y mensajes de personas o servicios que requieren respuesta rápida.",
              "Desactiva promociones y avisos que puede consultar cuando él decida.",
              "Agrupa la revisión de correo y otras aplicaciones en momentos concretos si su trabajo lo permite.",
              "Después de una semana comprueba si perdió algo importante y ajusta las excepciones.",
            ],
            lesson: "Controlar la tecnología también significa decidir cuándo puede interrumpirte, en lugar de aceptar cada configuración predeterminada.",
          },
        ],
      },
      {
        heading: "Ejemplo de negocio: una automatización no debe tener la última palabra",
        paragraphs: [
          "Automatizar una tarea repetitiva puede ahorrar trabajo, pero hay acciones que necesitan contexto o una persona responsable.",
        ],
        blocks: [
          {
            type: "example",
            title: "Un salón prepara recordatorios de citas",
            hypothetical: true,
            context: "Un salón de belleza quiere reducir el tiempo que dedica a recordar citas y considera enviar mensajes automáticos.",
            problem: "La agenda puede contener una cita modificada, una cancelación reciente o una preferencia de contacto que la regla no interpreta correctamente.",
            approach: "El salón empieza automatizando un recordatorio interno para revisar las citas del día siguiente antes de activar mensajes externos.",
            actions: [
              "Comprueba qué dato de la agenda activa el recordatorio y quién corrige una cita equivocada.",
              "Prueba con casos ficticios de cita confirmada, cancelada y modificada.",
              "Mantiene una forma clara de detener la regla si aparecen mensajes incorrectos.",
              "Solo amplía la automatización cuando puede supervisar el resultado y cumplir las reglas de contacto aplicables.",
            ],
            lesson: "Automatizar no significa abandonar el control. Una acción más delicada puede empezar con apoyo interno y revisión humana.",
          },
        ],
      },
      {
        heading: "Protege primero las cuentas que te permiten recuperar las demás",
        paragraphs: [
          "Tu correo principal suele participar en la recuperación de otras cuentas. También pueden ser críticos el gestor de contraseñas, la cuenta del dispositivo, el dominio de un negocio o una plataforma donde administras accesos.",
          "La protección exacta depende del servicio, pero hay hábitos generales que reducen riesgos sin exigir conocimientos técnicos avanzados.",
        ],
        blocks: [
          {
            type: "steps",
            label: "Hábitos básicos de control digital",
            items: [
              {
                title: "Usa contraseñas diferentes",
                detail: "Evita reutilizar la misma contraseña en servicios importantes. Un gestor de contraseñas puede ayudarte a mantener credenciales únicas.",
              },
              {
                title: "Activa autenticación multifactor cuando esté disponible",
                detail: "Añade una comprobación adicional al inicio de sesión. Guarda los métodos de recuperación de forma segura.",
              },
              {
                title: "Desconfía de la urgencia inesperada",
                detail: "Si un mensaje exige iniciar sesión o entregar un código inmediatamente, abre el servicio desde su aplicación o dirección conocida en vez de usar el enlace recibido.",
              },
              {
                title: "Mantén el software actualizado",
                detail: "Las actualizaciones pueden corregir fallos de seguridad y funcionamiento. Utiliza mecanismos oficiales y conserva compatibilidad con tu trabajo.",
              },
            ],
          },
        ],
      },
      {
        heading: "Usar IA sin dejar de pensar",
        paragraphs: [
          "Una IA puede ayudarte a resumir, generar opciones o preparar un borrador. Su respuesta no se convierte en un hecho por estar escrita con seguridad. Cuando una decisión tenga consecuencias para otras personas, dinero, privacidad, seguridad o compromisos del negocio, revisa la fuente y conserva responsabilidad humana.",
        ],
        blocks: [
          {
            type: "list",
            items: [
              "Pide borradores u opciones cuando eso te ahorre trabajo, pero comprueba nombres, cifras, fechas y condiciones.",
              "No introduzcas información personal, confidencial o credenciales si la tarea no la necesita.",
              "Distingue una sugerencia de una decisión: pregunta qué evidencia necesitarías para actuar.",
              "Si no puedes explicar por qué aceptaste una recomendación importante, todavía necesitas revisar el proceso.",
            ],
          },
        ],
      },
      {
        heading: "Conserva una salida: copias, recuperación y plan alternativo",
        paragraphs: [
          "Depender de una herramienta no siempre es malo. El problema aparece cuando una cuenta perdida, una caída del servicio o un cambio de condiciones deja sin alternativa una tarea importante.",
        ],
        blocks: [
          {
            type: "list",
            items: [
              "Comprueba quién controla el correo y los métodos de recuperación de las cuentas importantes.",
              "Conserva copias de la información que no podrías reconstruir con facilidad y prueba que puedas recuperarlas.",
              "Averigua cómo exportar tus datos antes de necesitarlos con urgencia.",
              "En un negocio, documenta quién administra cada servicio y qué procedimiento se usa si falla.",
            ],
          },
        ],
      },
      {
        heading: "Una práctica para recuperar el control",
        paragraphs: [
          "Elige una aplicación que uses todos los días. Escribe para qué la utilizas, qué datos contiene, qué notificaciones puede enviarte, cómo recuperarías la cuenta y qué harías durante un día si no estuviera disponible. Corrige primero la respuesta que más te preocupe.",
        ],
        blocks: [
          {
            type: "summary",
            items: [
              "Decide para qué sirve cada herramienta y cuándo merece tu atención.",
              "Protege accesos y conserva opciones de recuperación o continuidad.",
              "Delega tareas, no la responsabilidad de comprobar decisiones importantes.",
            ],
          },
        ],
      },
      {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        blocks: [
          {
            type: "faq",
            items: [
              {
                question: "¿Usar menos tecnología siempre es mejor?",
                answer: "No. La meta es usar la necesaria con un propósito claro. Una herramienta adicional puede ser útil si resuelve un problema que el método actual no puede manejar bien.",
              },
              {
                question: "¿Debo dejar de usar recomendaciones automáticas o IA?",
                answer: "No necesariamente. Úsalas como apoyo, conoce sus límites y aumenta la revisión cuando la decisión tenga consecuencias importantes.",
              },
              {
                question: "¿Esto sirve también para una empresa?",
                answer: "Sí. En una empresa se añaden responsables, permisos, privacidad, continuidad y reglas internas, pero el principio sigue siendo comprender qué delegas y conservar control sobre lo importante.",
              },
            ],
          },
        ],
      },
      {
        heading: "Fuentes y alcance",
        paragraphs: [
          "Estas fuentes ofrecen prácticas generales de seguridad, priorización y claridad. No sustituyen políticas internas ni requisitos específicos de un país o sector.",
        ],
        blocks: [
          {
            type: "sources",
            items: [
              {
                label: "CISA — Secure Our World resources",
                url: "https://www.cisa.gov/resources-tools/resources/secure-our-world-cybersecurity-awareness-month-resources",
                scope: "Recursos activos de CISA para individuos, familias y pequeñas y medianas empresas sobre phishing, contraseñas, autenticación multifactor, actualizaciones y otras prácticas de seguridad digital.",
              },
              {
                label: "NIST — Cybersecurity Framework 2.0",
                url: "https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20",
                scope: "Marco para que organizaciones de cualquier tamaño comprendan, evalúen, prioricen y comuniquen riesgos de ciberseguridad; no prescribe una única tecnología.",
              },
              {
                label: "W3C WAI — Writing for Web Accessibility",
                url: "https://www.w3.org/WAI/tips/writing/",
                scope: "Recomienda instrucciones claras, lenguaje comprensible y contenido conciso; principios que Aprende aplica al explicar tecnología.",
              },
            ],
          },
        ],
      },
    ],
  },
];
