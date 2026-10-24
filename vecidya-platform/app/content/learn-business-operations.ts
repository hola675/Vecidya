import type { LearnArticle } from "./learn";

/** Biblioteca empresarial: borradores editoriales, sujetos a revisión humana. */
export const learnBusinessOperationsArticles: LearnArticle[] = [
  {
    "slug": "como-coordinar-varias-sedes-o-negocios-sin-duplicar-trabajo",
    "category": "Gestión y equipos",
    "title": "¿Tienes varias sedes o negocios? Organízalos sin duplicar trabajo",
    "intro": "Una sucursal cambia su horario, otra publica un precio antiguo y la oficina central recibe tres versiones del mismo informe. Cuando crece la operación, el reto ya no es tener más aplicaciones: es saber quién hace qué y dónde está la información correcta.",
    "excerpt": "Aprende a coordinar marcas, sucursales y negocios diferentes con responsables claros, datos separados y tareas compartidas.",
    "enPocasPalabras": [
      "Decide qué debe ser igual en todas las sedes y qué necesita decidir cada una.",
      "Nombra responsables y conserva un lugar claro para los datos y documentos importantes.",
      "Comparte procesos cuando ayude, pero no mezcles clientes, permisos ni cifras de negocios distintos."
    ],
    "image": "/assets/learn/diagram-integrations.svg",
    "imageAlt": "Diagrama de distintas herramientas conectadas que ilustra la coordinación de información entre áreas.",
    "editorialDraft": false,
    "relatedSlugs": [
      "conectar-herramientas-digitales-sin-complicar-tu-negocio",
      "hojas-de-calculo-para-organizar-un-negocio-pequeno"
    ],
    "cta": {
      "label": "Explorar el Diagnóstico",
      "to": "/diagnostico",
      "copy": "Antes de incorporar sistemas nuevos, identifica qué parte de la organización necesita más claridad."
    },
    "sections": [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Tienes varias sedes o negocios? Organízalos sin duplicar trabajo», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "La señal de que necesitas ordenar el trabajo",
        "paragraphs": [
          "Un equipo crece de una tienda a tres locales, o una empresa comienza a administrar marcas distintas. Lo que antes se resolvía hablando directamente ahora depende de horarios, personas y documentos repartidos.",
          "No necesitas cambiar todo de golpe. Empieza por un problema repetido: por ejemplo, publicar horarios correctos en todos los canales."
        ]
      },
      {
        "heading": "Qué conviene compartir y qué mantener separado",
        "paragraphs": [
          "Tener varias sedes no significa que todos deban ver o cambiarlo todo. Hay datos útiles para toda la organización y otros que pertenecen a una operación concreta."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Información compartida",
                "definition": "Puede incluir la descripción oficial de una marca, reglas generales, plantillas o una guía común de atención."
              },
              {
                "term": "Información de cada sede",
                "definition": "Puede incluir su horario real, equipo responsable, disponibilidad o datos operativos de ese local."
              },
              {
                "term": "Información de negocios diferentes",
                "definition": "Si gestionas marcas o empresas separadas, define quién puede acceder a los datos de cada una. No los unas solo porque tengan el mismo administrador."
              }
            ]
          }
        ]
      },
      {
        "heading": "Un ejemplo: tres tiendas y un horario equivocado",
        "paragraphs": [
          "Situación inventada para explicar la diferencia entre coordinar y centralizar todo."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Tres sucursales de una misma empresa",
            "hypothetical": true,
            "context": "Una empresa tiene tres tiendas. Cada encargado anuncia sus horarios en distintos canales.",
            "problem": "La sede del centro cambia los domingos, pero la publicación general muestra el horario de todas como si fuera igual.",
            "approach": "La empresa comparte la identidad y normas de comunicación, pero cada local confirma sus horarios y una persona comprueba la publicación.",
            "actions": [
              "Anota el horario oficial de cada local y quién puede modificarlo.",
              "Prepara una plantilla con nombre, dirección, horario y contacto de cada sede.",
              "Asigna a alguien la revisión de cambios antes de publicar información común."
            ],
            "lesson": "Compartir una forma de trabajar no obliga a mezclar información que es diferente."
          }
        ]
      },
      {
        "heading": "Cinco decisiones que evitan confusiones",
        "paragraphs": [
          "Una hoja clara con responsables suele aportar más que una herramienta complicada que nadie entiende."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Primeras decisiones para coordinar varias operaciones",
            "items": [
              {
                "title": "Identifica qué administras",
                "detail": "Distingue sedes de una misma empresa, marcas diferentes y empresas legalmente separadas."
              },
              {
                "title": "Define quién responde por cada dato",
                "detail": "Horario, ofertas, atención, documentos y resultados deben tener una persona o equipo responsable."
              },
              {
                "title": "Elige dónde está la versión correcta",
                "detail": "Evita varias copias sin saber cuál usar. Pon fecha o responsable de actualización cuando convenga."
              },
              {
                "title": "Ajusta permisos",
                "detail": "Quien necesita consultar no siempre debe poder cambiar o borrar."
              },
              {
                "title": "Revisa y corrige",
                "detail": "Establece una revisión periódica y una forma sencilla de informar errores."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo empezar según tu situación",
        "paragraphs": [
          "Si tienes un negocio y dos personas, puede bastar una lista compartida y normas simples.",
          "Si coordinas varias sedes, necesitas distinguir qué cambia por local y quién autoriza la información común.",
          "Si administras varias marcas o empresas, añade límites de acceso, responsables por negocio e informes que mantengan el origen de cada cifra."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Empieza por un problema que se repite, no por comprar sistemas.",
              "Comparte criterios y procedimientos; separa datos y permisos cuando corresponda.",
              "Prueba el método con una sede antes de extenderlo al resto."
            ]
          }
        ]
      },
      {
        "heading": "Preguntas habituales",
        "paragraphs": [],
        "blocks": [
          {
            "type": "faq",
            "items": [
              {
                "question": "¿Hace falta un programa especial para administrar varias sedes?",
                "answer": "No siempre. Depende del número de personas, la frecuencia de los cambios y los riesgos de equivocarse. Empieza documentando el proceso."
              },
              {
                "question": "¿Puedo usar un solo perfil público para todos mis locales?",
                "answer": "Depende de los canales, reglas y necesidades de cada sede. Lo importante es que dirección, horarios y contacto no confundan a quien busca el local."
              },
              {
                "question": "¿Qué pasa si dos empresas tienen un mismo propietario?",
                "answer": "Compartir propietario no convierte sus datos en un solo negocio. Revisa la autorización y separa información, acceso y responsabilidades cuando corresponda."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para ampliar",
        "paragraphs": [
          "Son referencias generales sobre digitalización y organización, no instrucciones legales específicas."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "OCDE — Digitalización de las pymes",
                "url": "https://www.oecd.org/en/topics/digitalisation-of-smes.html",
                "scope": "Analiza cómo cambian las necesidades digitales con los recursos, los procesos y la madurez de cada organización; no recomienda comprar herramientas indiscriminadamente."
              },
              {
                "label": "NIST — Cybersecurity Framework 2.0",
                "url": "https://www.nist.gov/cyberframework",
                "scope": "Marco de referencia adaptable para definir responsabilidades, proteger información, detectar problemas y recuperarse; no equivale a una certificación."
              },
              {
                "label": "W3C — Escribir para que se entienda",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Consejos de claridad y accesibilidad para que información, instrucciones y enlaces sean fáciles de leer."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "quien-puede-ver-cambiar-y-publicar-en-tu-empresa",
    "category": "Gestión y equipos",
    "title": "¿Quién puede ver, cambiar o publicar? Pon orden en los accesos",
    "intro": "Un empleado necesita actualizar el horario, pero no debería borrar la lista completa de clientes. Un antiguo colaborador sigue teniendo acceso. Son situaciones cotidianas que puedes prevenir con reglas claras.",
    "excerpt": "Distingue permisos de consulta, edición y administración para una persona, un equipo o varias empresas.",
    "enPocasPalabras": [
      "Dale a cada persona acceso solo a lo necesario para hacer su trabajo.",
      "Separa ver información, modificarla, publicarla y administrar accesos.",
      "Revisa permisos cuando alguien cambia de función, sale del equipo o se incorpora a otra sede."
    ],
    "image": "/assets/learn/diagram-crm.svg",
    "imageAlt": "Diagrama ilustrativo de información y responsabilidades que deben mantenerse organizadas.",
    "editorialDraft": false,
    "relatedSlugs": [
      "como-proteger-cuentas-contrasenas-estafas-negocio",
      "datos-de-clientes-que-puedes-pedir-y-como-protegerlos"
    ],
    "cta": {
      "label": "Consultar tus prioridades",
      "to": "/diagnostico",
      "copy": "Puedes empezar revisando cómo se trabaja hoy y qué controles serían proporcionales a tu organización."
    },
    "sections": [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Quién puede ver, cambiar o publicar? Pon orden en los accesos», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "Compartir una contraseña no es trabajar en equipo",
        "paragraphs": [
          "Cuando varias personas usan la misma cuenta, puede ser difícil saber quién cambió algo o quitar acceso a una sola persona.",
          "Siempre que una herramienta permita cuentas individuales, es preferible que cada quien tenga la suya y sus permisos."
        ]
      },
      {
        "heading": "Tres niveles de acceso fáciles de entender",
        "paragraphs": [
          "No todos necesitan las llaves de todo el edificio."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Consultar",
                "definition": "Puede ver información necesaria, sin cambiarla."
              },
              {
                "term": "Editar o atender",
                "definition": "Puede actualizar datos o responder consultas dentro de su responsabilidad."
              },
              {
                "term": "Administrar",
                "definition": "Puede conceder o retirar permisos y modificar configuraciones que afectan a más personas. Reserva este acceso para quien deba usarlo."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo: una empresa con dos sucursales",
        "paragraphs": [
          "Ejemplo hipotético, no una descripción de un cliente."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una foto de producto no necesita permiso para cambiar usuarios",
            "hypothetical": true,
            "context": "Una empresa tiene dos tiendas, un equipo de ventas y una persona que gestiona publicaciones.",
            "problem": "El equipo usa una cuenta general que también permite cambiar usuarios y borrar información de otras sedes.",
            "approach": "Cada persona recibe un acceso acorde con su tarea y las publicaciones importantes tienen una revisión responsable.",
            "actions": [
              "Crea cuentas individuales cuando el servicio lo permita.",
              "Permite que quien publica edite contenido, no gestione todas las cuentas.",
              "Revisa permisos y registra quién debe confirmar cambios sensibles."
            ],
            "lesson": "Las personas pueden trabajar juntas sin compartir la misma contraseña ni tener acceso a todo."
          }
        ]
      },
      {
        "heading": "El proceso que puedes aplicar sin complicarte",
        "paragraphs": [
          "Es válido tanto para dos colaboradores como para varios departamentos."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Cinco pasos para gestionar permisos",
            "items": [
              {
                "title": "Anota las herramientas",
                "detail": "Correo, web, redes, archivos, pagos y cualquier sistema que utilice la empresa."
              },
              {
                "title": "Asigna responsables",
                "detail": "Decide quién solicita accesos y quién los aprueba."
              },
              {
                "title": "Entrega lo necesario",
                "detail": "Empieza con acceso limitado y amplía solo cuando una tarea lo justifique."
              },
              {
                "title": "Protege las cuentas",
                "detail": "Usa contraseñas distintas y verificación en dos pasos cuando esté disponible."
              },
              {
                "title": "Retira y revisa",
                "detail": "Cuando cambien personas o funciones, actualiza los permisos sin demora."
              }
            ]
          }
        ]
      },
      {
        "heading": "Qué cambia cuando hay varios negocios",
        "paragraphs": [
          "Un equipo local puede necesitar ver solo su propia sede. La dirección quizá requiera informes agregados, sin necesidad de acceder a todos los datos personales de cada negocio.",
          "Cuando distintas empresas comparten propietario o proveedor, define por escrito qué información se puede compartir. No presupongas que la propiedad común otorga todos los permisos."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "caution",
            "title": "No confundas comodidad con autorización",
            "text": "Que una persona pueda entrar técnicamente a una cuenta no significa que esté autorizada a usar todos sus datos. Respeta las responsabilidades y las normas aplicables."
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
                "question": "¿Todos los encargados deben ser administradores?",
                "answer": "No necesariamente. Puedes darles permisos para atender y actualizar su área sin permitir cambios globales."
              },
              {
                "question": "¿Qué hago si una persona deja la empresa?",
                "answer": "Retira sus accesos, revisa cuentas y recupera los recursos que administraba. Evita depender de claves personales de esa persona."
              },
              {
                "question": "¿Sirve una hoja para controlar los accesos?",
                "answer": "Una lista protegida de sistemas, responsables y fechas de revisión puede servir para empezar; nunca guardes contraseñas en una hoja compartida."
              }
            ]
          }
        ]
      },
      {
        "heading": "Qué puedes hacer hoy",
        "paragraphs": [
          "No necesitas esperar a un incidente para empezar."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Haz una lista de las cuentas que usa tu equipo.",
              "Marca cuáles tienen permisos de administrador y justifica cada uno.",
              "Revisa las cuentas que ya no deberían tener acceso."
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para profundizar",
        "paragraphs": [
          "El control de accesos debe adaptarse al riesgo y a las leyes de cada organización."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "NIST — Cybersecurity Framework 2.0",
                "url": "https://www.nist.gov/cyberframework",
                "scope": "Marco de referencia adaptable para definir responsabilidades, proteger información, detectar problemas y recuperarse; no equivale a una certificación."
              },
              {
                "label": "NIST — Guía de inicio de ciberseguridad",
                "url": "https://csrc.nist.gov/pubs/sp/1300/final",
                "scope": "Explica cómo empezar a manejar riesgos digitales con medios proporcionales al negocio."
              },
              {
                "label": "W3C — Escribir para que se entienda",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Consejos de claridad y accesibilidad para que información, instrucciones y enlaces sean fáciles de leer."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-elegir-herramientas-digitales-sin-llenar-la-empresa-de-aplicaciones",
    "category": "Gestión y equipos",
    "title": "¿Tu empresa usa demasiadas aplicaciones? Elige las que sí ayudan",
    "intro": "Un equipo tiene tres agendas, dos hojas para los pedidos y varias aplicaciones que hacen lo mismo. Antes de sumar otra suscripción, comprueba qué tarea necesitas resolver y quién la realizará.",
    "excerpt": "Aprende a evaluar herramientas digitales según su utilidad, costo completo, seguridad y facilidad de uso para equipos de cualquier tamaño.",
    "enPocasPalabras": [
      "Empieza por la tarea que quieres mejorar, no por una lista de funciones impresionantes.",
      "Cuenta el costo real: suscripción, tiempo de aprender, mantenimiento y posibles consumos externos.",
      "Antes de comprar para toda la empresa, prueba con un equipo y define cómo salir si no funciona."
    ],
    "image": "/assets/learn/diagram-integrations.svg",
    "imageAlt": "Ilustración de herramientas conectadas para explicar por qué conviene evitar aplicaciones duplicadas.",
    "editorialDraft": false,
    "relatedSlugs": [
      "conectar-herramientas-digitales-sin-complicar-tu-negocio",
      "como-coordinar-varias-sedes-o-negocios-sin-duplicar-trabajo"
    ],
    "cta": {
      "label": "Ver por dónde empezar",
      "to": "/diagnostico",
      "copy": "Primero conviene saber qué necesidad real debería resolver una herramienta."
    },
    "sections": [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Tu empresa usa demasiadas aplicaciones? Elige las que sí ayudan», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "Más programas no significan una empresa más organizada",
        "paragraphs": [
          "Una aplicación puede ser muy buena y aun así no servirte. Tal vez exige un proceso que tu equipo no necesita o duplica lo que ya tienes.",
          "La pregunta útil es sencilla: ¿qué se nos hace difícil hoy y cómo sabremos si esto mejora?"
        ]
      },
      {
        "heading": "Lo que cuesta una herramienta no siempre está en el precio",
        "paragraphs": [
          "La cuota mensual es solo una parte. También cuentan el tiempo para aprender, quién mantiene la información y qué ocurre cuando algo falla.",
          "Si hay varias sucursales o empresas, comprueba cómo separa datos, cuentas, responsables y facturas."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Costo visible",
                "definition": "Precio de la licencia o servicio y los consumos que aparecen en la oferta."
              },
              {
                "term": "Costo de trabajo",
                "definition": "Horas de preparación, formación, revisión de errores y mantenimiento."
              },
              {
                "term": "Costo de cambio",
                "definition": "Esfuerzo para exportar información, cambiar a otra herramienta y continuar trabajando."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo: tres formas distintas de anotar pedidos",
        "paragraphs": [
          "Caso imaginario para practicar una decisión."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una empresa con dos canales y tres listas",
            "hypothetical": true,
            "context": "Recibe pedidos por una página y mensajes, y el equipo mantiene listas distintas.",
            "problem": "Se duplican pedidos y nadie sabe cuál lista es la correcta.",
            "approach": "Antes de comprar un sistema, el equipo acuerda una forma única de identificar pedidos y responsables.",
            "actions": [
              "Dibuja el recorrido desde la consulta hasta la entrega.",
              "Decide quién puede añadir, cambiar y cerrar un pedido.",
              "Prueba una única solución con un grupo reducido y compara los errores."
            ],
            "lesson": "La herramienta debe apoyar un proceso claro; no sustituir la decisión sobre quién es responsable."
          }
        ]
      },
      {
        "heading": "Siete preguntas antes de contratar",
        "paragraphs": [
          "Úsalas en una reunión breve, no como una auditoría interminable."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Preguntas para elegir mejor",
            "items": [
              {
                "title": "¿Qué problema resuelve?",
                "detail": "Descríbelo sin mencionar nombres de aplicaciones."
              },
              {
                "title": "¿Quién la usará?",
                "detail": "Incluye a quien atiende, administra y revisa resultados, no solo a quien compra."
              },
              {
                "title": "¿Qué información necesita?",
                "detail": "Comprueba si requiere datos personales, archivos o acceso a sistemas sensibles."
              },
              {
                "title": "¿Qué tenemos ya?",
                "detail": "Revisa si una herramienta actual puede resolverlo sin duplicaciones."
              },
              {
                "title": "¿Cuánto cuesta mantenerla?",
                "detail": "Suma licencia, formación, soporte y posibles cargos por uso."
              },
              {
                "title": "¿Cómo sabremos si ayuda?",
                "detail": "Elige un resultado observable, como menos errores o menos trabajo repetido."
              },
              {
                "title": "¿Cómo salimos si no sirve?",
                "detail": "Confirma cómo exportar datos, cancelar servicios y mantener el trabajo."
              }
            ]
          }
        ]
      },
      {
        "heading": "La prueba cambia con la complejidad de tu organización",
        "paragraphs": [
          "En un negocio pequeño puedes probar la herramienta con una tarea real, usando datos de ejemplo cuando sea posible.",
          "En una empresa con varias áreas, reúne a quienes usarán y administrarán el sistema. Si hay distintas sedes, prueba los permisos y la información que cada una puede ver.",
          "En un grupo de negocios, revisa además la separación de datos y los costos por entidad; compartir proveedor no exige mezclar las operaciones."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Escribe el problema antes de comparar productos.",
              "Prueba con personas reales del equipo, sin exponer datos de clientes.",
              "Elige la opción que facilita trabajar y que puedas mantener."
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
                "question": "¿La herramienta más completa es la mejor?",
                "answer": "No. Puede ser innecesariamente difícil o costosa para el trabajo real. Valora lo que tu equipo necesita hoy."
              },
              {
                "question": "¿Conviene comprar todo en un solo proveedor?",
                "answer": "Depende. Puede simplificar la operación, pero revisa las dependencias, permisos, costos y capacidad de exportar información."
              },
              {
                "question": "¿Debo automatizar todo para aprovechar una aplicación?",
                "answer": "No. Primero estabiliza las tareas. Algunas decisiones deben seguir en manos de personas."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Las cifras y experiencias del estudio no son una garantía de ahorro para tu empresa."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "OCDE — Digitalización para la competitividad (2025)",
                "url": "https://www.oecd.org/en/publications/sme-digitalisation-for-competitiveness_197e3077-en.html",
                "scope": "Investigación comparativa sobre herramientas, habilidades, seguridad y barreras de adopción en pequeñas y medianas empresas; no representa a todas las empresas del mundo."
              },
              {
                "label": "OCDE — Digitalización de las pymes",
                "url": "https://www.oecd.org/en/topics/digitalisation-of-smes.html",
                "scope": "Analiza cómo cambian las necesidades digitales con los recursos, los procesos y la madurez de cada organización; no recomienda comprar herramientas indiscriminadamente."
              },
              {
                "label": "NIST — Cybersecurity Framework 2.0",
                "url": "https://www.nist.gov/cyberframework",
                "scope": "Marco de referencia adaptable para definir responsabilidades, proteger información, detectar problemas y recuperarse; no equivale a una certificación."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-comparar-resultados-de-sedes-sin-mezclar-las-cifras",
    "category": "Gestión y equipos",
    "title": "¿Qué sede está funcionando mejor? Aprende a comparar sin confundirte",
    "intro": "Una sucursal recibe el doble de consultas que otra. ¿Eso significa que trabaja mejor? No necesariamente: quizá atiende más personas, tiene otro horario o recibe preguntas distintas. Comparar números exige entender qué estás contando.",
    "excerpt": "Descubre cómo reunir indicadores por sede, equipo o negocio sin mezclar cifras ni convertir una tabla en una conclusión apresurada.",
    "enPocasPalabras": [
      "Antes de comparar, explica qué significa cada número y de dónde viene.",
      "No confundas consultas, citas, ventas, personas y mensajes: pueden medir cosas diferentes.",
      "Mira cada sede por separado antes de revisar el conjunto y anota qué falta conocer."
    ],
    "image": "/assets/learn/diagram-analytics.svg",
    "imageAlt": "Gráfico de indicadores de un negocio para ilustrar la comparación de resultados entre áreas.",
    "editorialDraft": false,
    "relatedSlugs": [
      "analitica-web-que-medir-en-tu-negocio",
      "como-coordinar-varias-sedes-o-negocios-sin-duplicar-trabajo"
    ],
    "cta": {
      "label": "Explorar el Diagnóstico",
      "to": "/diagnostico",
      "copy": "Una buena decisión empieza por saber qué datos tienes y qué aún debes comprobar."
    },
    "sections": [
      {
        heading: "Qué aprenderás y cómo practicarlo",
        paragraphs: ["Al terminar, podrás explicar con tus palabras «¿Qué sede está funcionando mejor? Aprende a comparar sin confundirte», reconocer una situación en la que resulta útil y elegir un primer paso razonable.", "Ejercicio breve: identifica un problema real, propone una acción pequeña y decide qué señal observable te permitirá comprobar si mejoró. No incluyas datos personales ni asumas que necesitas contratar una herramienta."],
        blocks: [{ type: "callout", tone: "tip", title: "Autoevaluación", text: "Explica la idea central a alguien sin utilizar tecnicismos. Si necesitas ayuda, revisa el ejemplo y los pasos antes de tomar una decisión." }],
      },
      {
        "heading": "Una cifra suelta puede contar una historia equivocada",
        "paragraphs": [
          "Una tienda recibe cien consultas y otra cincuenta. Parece claro cuál funciona mejor, hasta que descubres que la primera recibe el triple de visitantes y abre más horas.",
          "Los números ayudan a hacer preguntas. No sustituyen entender el trabajo real."
        ]
      },
      {
        "heading": "Qué debe significar cada indicador",
        "paragraphs": [
          "Antes de sumar resultados, acuerda qué cuenta cada equipo."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Consulta",
                "definition": "Pregunta que recibe el negocio. Una persona puede enviar varias consultas."
              },
              {
                "term": "Cita o pedido",
                "definition": "Acción que se solicita o confirma; no todas las consultas terminan en una cita o pedido."
              },
              {
                "term": "Venta",
                "definition": "Operación que se concreta bajo el criterio definido por la empresa, sin confundirla con un mensaje o promesa."
              },
              {
                "term": "Periodo",
                "definition": "Tiempo que estás comparando. Un mes no siempre tiene las mismas jornadas o condiciones que otro."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo: dos locales, resultados diferentes",
        "paragraphs": [
          "Números inventados para practicar, no datos de clientes."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "No declares ganadora a una sede solo por tener más mensajes",
            "hypothetical": true,
            "context": "Dos locales venden productos parecidos en zonas distintas.",
            "problem": "El local A recibe cien mensajes y el B cincuenta, pero todavía no sabemos cuántas personas atendieron o qué preguntaron.",
            "approach": "Revisa el horario de atención, cuántas consultas fueron útiles y qué condiciones afectaron la comparación.",
            "actions": [
              "Comprueba que ambos llamen «consulta» a lo mismo.",
              "Usa el mismo periodo y registra diferencias de horario o tamaño.",
              "Anota lo que no se midió y evita atribuir las diferencias a una sola causa."
            ],
            "lesson": "Comparar exige definiciones comunes y contexto. Más actividad no demuestra mejores resultados."
          }
        ]
      },
      {
        "heading": "Cómo crear un resumen que sí sirva",
        "paragraphs": [
          "Empieza con pocos datos y aumenta el detalle cuando haga falta."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Cuatro pasos para comparar sedes",
            "items": [
              {
                "title": "Elige una pregunta",
                "detail": "Por ejemplo, «¿En qué sede quedan más consultas sin respuesta?»."
              },
              {
                "title": "Define qué contar",
                "detail": "Consulta recibida, consulta respondida, pendiente y periodo, sin duplicar mensajes."
              },
              {
                "title": "Separa el origen",
                "detail": "Guarda la sede, marca o empresa de cada registro antes de sumar."
              },
              {
                "title": "Revisa con las personas responsables",
                "detail": "Pregunta qué cambió en horarios, campañas, personal o procesos antes de concluir."
              }
            ]
          }
        ]
      },
      {
        "heading": "Qué pasa cuando administras varias empresas",
        "paragraphs": [
          "En varias sucursales de una misma empresa puedes usar definiciones comunes y mostrar los resultados por sede y en conjunto.",
          "Con empresas distintas, define si se pueden reunir cifras agregadas y quién está autorizado a verlas. No combines datos personales ni resultados de empresas sin acuerdo.",
          "Si los servicios o mercados son diferentes, compara procesos equivalentes antes de enfrentar cifras que no tienen el mismo significado."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "caution",
            "title": "No confundas mensajes con personas",
            "text": "Un mismo cliente puede enviar varios mensajes. Sumarlos como si fueran personas únicas crea una impresión engañosa."
          }
        ]
      },
      {
        "heading": "Una pequeña rutina que mejora las decisiones",
        "paragraphs": [
          "Reserva una revisión regular con las personas que conocen los datos. Pregunta qué se aprendió y qué se intentará mejorar.",
          "Si faltan datos, dilo. Una decisión honesta puede ser revisar un proceso antes de comprar un sistema nuevo."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Define los indicadores por escrito y usa el mismo criterio.",
              "Separa los datos por sede o negocio y conserva su contexto.",
              "Usa los resultados para preguntar y aprender, no para culpar a un equipo."
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
                "question": "¿Qué sede vende mejor si una tiene más consultas?",
                "answer": "No se puede saber solo con ese dato. Necesitas entender cuáles consultas se convierten en operaciones, en qué periodo y bajo qué condiciones."
              },
              {
                "question": "¿Sirve una hoja de cálculo?",
                "answer": "Puede servir si defines bien los datos, proteges el archivo y evitas duplicaciones. Más adelante quizá necesites informes automatizados."
              },
              {
                "question": "¿Puedo juntar datos de empresas diferentes?",
                "answer": "Depende de los acuerdos, permisos y normas aplicables. Aun al mostrar totales, conserva el origen de los datos."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para profundizar",
        "paragraphs": [
          "Son referencias sobre adopción digital y análisis, no una fórmula universal para evaluar empleados."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Eurostat — Digitalización de empresas (2026)",
                "url": "https://ec.europa.eu/eurostat/en/web/interactive-publications/digitalisation-2026",
                "scope": "Presenta indicadores y diferencias de adopción de tecnología entre empresas europeas de distintos tamaños; los datos no describen necesariamente tu país."
              },
              {
                "label": "OCDE — Digitalización para la competitividad (2025)",
                "url": "https://www.oecd.org/en/publications/sme-digitalisation-for-competitiveness_197e3077-en.html",
                "scope": "Investigación comparativa sobre herramientas, habilidades, seguridad y barreras de adopción en pequeñas y medianas empresas; no representa a todas las empresas del mundo."
              },
              {
                "label": "W3C — Escribir para que se entienda",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Consejos de claridad y accesibilidad para que información, instrucciones y enlaces sean fáciles de leer."
              }
            ]
          }
        ]
      }
    ]
  }
];
