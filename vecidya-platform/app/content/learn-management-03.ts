import type { LearnArticle } from "./learn";

/** APRENDE-GESTION-03: borradores educativos sobre decisiones de gestión digital. */
export const learnManagement03Articles: LearnArticle[] = [
  {
    "slug": "como-preparar-presupuesto-para-herramientas-digitales",
    "category": "Gestión y equipos",
    "title": "¿Cuánto cuesta de verdad digitalizar un proceso? Prepara un presupuesto sencillo",
    "intro": "Una aplicación anuncia un precio mensual atractivo. Luego aparecen la formación, las horas de configuración y otros cargos. Antes de comprar, conviene contar el costo completo y decidir qué problema resuelves.",
    "excerpt": "Aprende a calcular gastos visibles y ocultos de herramientas digitales, comparar alternativas y evitar sorpresas entre sedes.",
    "enPocasPalabras": [
      "No mires solo la cuota: incluye formación, tiempo de trabajo, soporte y cargos por uso.",
      "Anota quién paga, qué área usa la herramienta y cuándo vence o se renueva.",
      "Empieza con una prueba pequeña; reserva margen para imprevistos y evalúa el resultado antes de ampliar."
    ],
    "image": "/assets/learn/diagram-presupuesto-digital.svg",
    "imageAlt": "Tres tarjetas amplias representan la cuota del servicio, el tiempo de trabajo y una revisión del presupuesto total.",
    "editorialDraft": true,
    "relatedSlugs": [
      "como-elegir-herramientas-digitales-sin-llenar-la-empresa-de-aplicaciones",
      "como-saber-si-una-mejora-tecnologica-funciona-en-tu-empresa"
    ],
    "cta": {
      "label": "Revisar mis necesidades",
      "to": "/diagnostico",
      "copy": "Primero identifica qué necesita cambiar en el trabajo; después será más fácil comparar presupuestos."
    },
    "sections": [
      {
        "heading": "La suscripción barata que terminó costando más",
        "paragraphs": [
          "Un servicio anuncia un precio al mes, pero alguien debe prepararlo, enseñar a usarlo y revisar errores. Puede que la cuota sea correcta y, aun así, la decisión no convenga.",
          "El precio de una herramienta no es igual al costo de ponerla a funcionar en tu empresa. Piensa en ambos antes de contratar."
        ]
      },
      {
        "heading": "Las cuatro partes de un presupuesto claro",
        "paragraphs": [
          "Puedes empezar con una hoja y explicar cada gasto en palabras comunes."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Pago por la herramienta",
                "definition": "Suscripción, licencia, equipo, instalación o servicio contratado."
              },
              {
                "term": "Tiempo del equipo",
                "definition": "Horas dedicadas a preparar datos, aprender y supervisar la nueva forma de trabajar."
              },
              {
                "term": "Gastos variables",
                "definition": "Mensajes, espacio adicional, transacciones, uso de IA o cargos que dependen de la actividad."
              },
              {
                "term": "Revisión y salida",
                "definition": "Ayuda técnica, mejoras necesarias, exportación de archivos y cambios de proveedor."
              }
            ]
          }
        ]
      },
      {
        "heading": "Un ejemplo con números inventados",
        "paragraphs": [
          "Los importes son puramente ilustrativos; no representan precios de Vecidya ni de ningún proveedor."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una empresa revisa el costo completo de un calendario",
            "hypothetical": true,
            "context": "Dos sedes comparten citas y hoy utilizan herramientas diferentes.",
            "problem": "La cuota anunciada parece pequeña, pero nadie ha previsto capacitación ni tareas de configuración.",
            "approach": "El equipo suma la cuota estimada, el tiempo de preparación y cualquier cargo adicional antes de decidir.",
            "actions": [
              "Anota una cuota ilustrativa de 20 unidades monetarias por mes y aclara qué incluye.",
              "Calcula por separado cuántas horas internas necesitará preparar y enseñar la herramienta.",
              "Compara ese esfuerzo con el beneficio esperado y vuelve a calcular cuando tengas cifras reales."
            ],
            "lesson": "Una cuenta completa ayuda a decidir; no demuestra por sí sola un ahorro."
          }
        ]
      },
      {
        "heading": "Cómo comparar dos opciones sin perderte",
        "paragraphs": [
          "Compara la misma tarea y el mismo periodo, no dos listas de funciones distintas."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Comparación breve y transparente",
            "items": [
              {
                "title": "Escribe el problema",
                "detail": "Por ejemplo: se olvidan citas porque no existe una agenda común."
              },
              {
                "title": "Comprueba las opciones",
                "detail": "Incluye mantener el proceso actual, mejorarlo o contratar una herramienta."
              },
              {
                "title": "Cuenta todos los gastos",
                "detail": "Suma pagos iniciales, recurrentes, trabajo de adaptación y cargos variables."
              },
              {
                "title": "Identifica quién aprueba",
                "detail": "En equipos y varias sedes, deja claro quién contrata, quién usa y quién confirma el gasto."
              },
              {
                "title": "Fija una revisión",
                "detail": "Revisa cuánto se utilizó y qué problema mejoró realmente."
              }
            ]
          }
        ]
      },
      {
        "heading": "Qué cambia con varias sedes o negocios",
        "paragraphs": [
          "Si una empresa tiene varias sedes, revisa si el precio es por persona, local, transacción o conjunto; no lo supongas.",
          "Si administras empresas legalmente distintas, conserva quién paga, quién tiene acceso y a qué negocio corresponde cada gasto. Compartir proveedor no implica poder mezclar facturas o datos.",
          "Un área de compras o contabilidad puede necesitar criterios adicionales. Esta guía no reemplaza las reglas fiscales ni financieras aplicables."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "tip",
            "title": "Pregunta antes de aceptar",
            "text": "¿Qué ocurre si agrego usuarios, si el volumen crece o si cancelo? Pide condiciones confirmadas y consérvalas."
          }
        ]
      },
      {
        "heading": "Una decisión que puede esperar también es una buena decisión",
        "paragraphs": [
          "Si todavía no sabes qué tarea mejorará o no puedes mantener la herramienta, quizá convenga ordenar el proceso primero.",
          "Un presupuesto es una previsión, no una promesa. Revísalo cuando cambien precios, equipo o necesidades."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Define un problema concreto.",
              "Separa cuota, formación, uso, soporte y salida.",
              "Prueba con límites claros antes de pagar por toda la operación."
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
                "question": "¿Puedo usar una hoja de cálculo?",
                "answer": "Sí, si cuidas los accesos y mantienes importes y fechas actualizados. No guardes contraseñas ni datos sensibles innecesarios."
              },
              {
                "question": "¿Siempre conviene pagar un plan anual?",
                "answer": "No. Compara condiciones reales de cancelación, permanencia, descuentos y cambios de uso antes de comprometerte."
              },
              {
                "question": "¿Cómo comparo presupuestos de varias empresas?",
                "answer": "Registra cada negocio y sus gastos por separado; muestra totales solo cuando exista una razón y autorización para hacerlo."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes y límites",
        "paragraphs": [
          "Son orientaciones educativas, no consejos contables ni fiscales personalizados."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "SBA — Manage your business: manage your finances",
                "url": "https://www.sba.gov/counseling/manage-your-business/",
                "scope": "La página actual de SBA incluye orientación sobre registro financiero, costos y análisis costo-beneficio. Es orientación general de EE. UU., no asesoría contable o tributaria para otros países."
              },
              {
                "label": "OCDE — Digitalización de pequeñas y medianas empresas",
                "url": "https://www.oecd.org/en/topics/digitalisation-of-smes.html",
                "scope": "Material institucional sobre prioridades, recursos y barreras al adoptar tecnología. No establece una receta universal por tamaño."
              },
              {
                "label": "W3C — Consejos para escribir contenido fácil de comprender",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Sugerencias para usar palabras sencillas, títulos claros y explicaciones comprensibles."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-ordenar-compras-proveedores-y-aprobaciones-en-una-empresa",
    "category": "Gestión y equipos",
    "title": "¿Quién pidió, aprobó y recibió? Ordena las compras y los proveedores",
    "intro": "Un equipo necesita material, otro lo compra de nuevo y la factura llega sin que nadie recuerde quién autorizó el pedido. Poner orden no significa llenar formularios: significa poder seguir cada decisión.",
    "excerpt": "Organiza solicitudes, comparaciones, aprobaciones y entregas con responsabilidades claras para equipos y varias sedes.",
    "enPocasPalabras": [
      "Cada compra debe tener una necesidad concreta y una persona responsable.",
      "Separa solicitar, aprobar, recibir y registrar cuando el tamaño y riesgo lo requieran.",
      "Conserva evidencia de lo acordado y revisa cambios, devoluciones y proveedores."
    ],
    "image": "/assets/learn/diagram-compras-proveedores.svg",
    "imageAlt": "Tres tarjetas muestran una solicitud, una aprobación y una recepción comprobada.",
    "editorialDraft": true,
    "relatedSlugs": [
      "como-coordinar-varias-sedes-o-negocios-sin-duplicar-trabajo",
      "quien-puede-ver-cambiar-y-publicar-en-tu-empresa"
    ],
    "cta": {
      "label": "Identificar prioridades",
      "to": "/diagnostico",
      "copy": "Si las compras y tareas se duplican, empieza por revisar dónde falta un responsable o una decisión clara."
    },
    "sections": [
      {
        "heading": "El pedido que nadie recuerda haber autorizado",
        "paragraphs": [
          "Cuando una empresa crece, un pedido puede pasar por almacén, administración y dirección. Si nadie sabe quién decidió, aparecen errores y retrasos.",
          "No siempre necesitas un sistema de compras. Necesitas saber qué se pidió, por qué y qué sucedió después."
        ]
      },
      {
        "heading": "Cuatro momentos de una compra",
        "paragraphs": [
          "Conviene distinguir etapas incluso si una misma persona hace más de una, siempre que sea apropiado al riesgo."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Solicitud",
                "definition": "Un equipo explica qué necesita, cantidad y fecha aproximada."
              },
              {
                "term": "Aprobación",
                "definition": "La persona autorizada decide si se puede gastar y bajo qué condiciones."
              },
              {
                "term": "Compra y recepción",
                "definition": "Se acuerdan las condiciones con el proveedor y se comprueba lo que llegó."
              },
              {
                "term": "Registro",
                "definition": "Se conserva la referencia del pedido, documento correspondiente e incidencias sin divulgar información innecesaria."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo: dos sucursales necesitan el mismo material",
        "paragraphs": [
          "Situación ficticia; sirve para entender el flujo."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Dos sedes pidieron cajas al mismo tiempo",
            "hypothetical": true,
            "context": "Dos tiendas necesitan material para empaquetar pedidos.",
            "problem": "Cada una envía un mensaje distinto; la administración hace dos encargos que podrían haberse coordinado.",
            "approach": "Establecen un registro único de solicitudes, confirmación de existencias y responsable de aprobar.",
            "actions": [
              "Anotan sede, material, cantidad necesaria y fecha.",
              "Comprueban si hay existencias o pedidos ya hechos.",
              "Una persona confirma la decisión; al recibir se registra qué llegó y qué falta."
            ],
            "lesson": "El registro permite detectar duplicados sin quitar autonomía a cada tienda."
          }
        ]
      },
      {
        "heading": "Antes de aceptar un presupuesto",
        "paragraphs": [
          "No compares solo precios. Pregunta qué se entrega y cuándo."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Revisión práctica de una compra",
            "items": [
              {
                "title": "Describe la necesidad",
                "detail": "Especifica cantidad, condiciones y el resultado esperado."
              },
              {
                "title": "Comprueba opciones",
                "detail": "Pregunta por plazo, soporte, garantía si aplica y condiciones de devolución."
              },
              {
                "title": "Confirma la autorización",
                "detail": "Usa el procedimiento que corresponda a la empresa y deja rastro de la decisión."
              },
              {
                "title": "Verifica la recepción",
                "detail": "Compara lo recibido con lo acordado, registra faltantes o problemas."
              },
              {
                "title": "Cierra o corrige",
                "detail": "Confirma el estado y conserva la información necesaria para seguimiento."
              }
            ]
          }
        ]
      },
      {
        "heading": "Qué cambia entre un negocio y un grupo empresarial",
        "paragraphs": [
          "En un negocio pequeño, una lista protegida puede bastar para saber qué se compró y quién lo recibió.",
          "En una empresa con departamentos conviene que quien necesita material no sea automáticamente quien autoriza cualquier importe.",
          "Con varios negocios, define a qué entidad corresponde el pedido, quién lo paga y qué proveedores puede compartir cada una. Las normas fiscales y de contratación dependen del país y la actividad."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "caution",
            "title": "No conviertas toda compra en burocracia",
            "text": "Aplica controles proporcionados al gasto y al riesgo; un proceso innecesariamente largo también puede perjudicar el trabajo."
          }
        ]
      },
      {
        "heading": "La lista mínima que puedes preparar",
        "paragraphs": [
          "Una tabla sencilla puede contener lo indispensable para no perder el contexto."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Fecha, sede o negocio, necesidad y cantidad.",
              "Responsable, estado de aprobación y proveedor confirmado.",
              "Entrega recibida, incidencia y próximo paso."
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
                "question": "¿Debo pedir siempre varios presupuestos?",
                "answer": "Depende del importe, riesgo, políticas internas y reglas aplicables. No existe aquí una regla universal que obligue al mismo número de ofertas."
              },
              {
                "question": "¿Puede aprobar la misma persona que solicita?",
                "answer": "En operaciones pequeñas puede ocurrir; cuando el riesgo aumenta, una segunda revisión puede ayudar. Sigue las responsabilidades autorizadas."
              },
              {
                "question": "¿Qué información conviene conservar?",
                "answer": "Lo necesario para comprobar qué se acordó, el estado y la documentación exigida. Protege datos de proveedores y personas."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes y orientación",
        "paragraphs": [
          "Las recomendaciones se basan en principios de gestión, costos y trazabilidad; no fijan obligaciones legales para todas las empresas."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "SBA — Manage your business: manage your finances",
                "url": "https://www.sba.gov/counseling/manage-your-business/",
                "scope": "La página actual de SBA incluye orientación sobre registro financiero, costos y análisis costo-beneficio. Es orientación general de EE. UU., no asesoría contable o tributaria para otros países."
              },
              {
                "label": "OCDE — Digitalización de pequeñas y medianas empresas",
                "url": "https://www.oecd.org/en/topics/digitalisation-of-smes.html",
                "scope": "Material institucional sobre prioridades, recursos y barreras al adoptar tecnología. No establece una receta universal por tamaño."
              },
              {
                "label": "GOV.UK — Principios para dirigir mejoras por etapas",
                "url": "https://www.gov.uk/service-manual/agile-delivery/governance-principles-for-agile-service-delivery",
                "scope": "Orienta la entrega gradual, la asignación de responsables y la revisión de resultados; no es una regla contractual universal."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "que-hacer-si-falla-internet-o-el-sistema-de-tu-negocio",
    "category": "Tecnología explicada",
    "title": "¿Qué pasa si se cae internet o un sistema? Prepara un plan para seguir trabajando",
    "intro": "Hay pedidos pendientes y de pronto falla internet, la agenda o el sistema de cobro. Tener un plan sencillo ayuda a decidir qué hacer primero y cómo informar sin improvisar.",
    "excerpt": "Aprende a identificar servicios esenciales, preparar alternativas seguras y probar la recuperación de una empresa o varias sedes.",
    "enPocasPalabras": [
      "Anota qué actividades no pueden detenerse y cuánto tiempo podrías trabajar sin cada sistema.",
      "Prepara formas seguras de comunicar y registrar lo imprescindible durante una caída.",
      "Comprueba que las copias y los contactos de recuperación realmente funcionan; no improvises con datos privados."
    ],
    "image": "/assets/learn/diagram-continuidad-digital.svg",
    "imageAlt": "Tres tarjetas representan una interrupción, un modo alternativo de trabajo y la recuperación comprobada.",
    "editorialDraft": true,
    "relatedSlugs": [
      "como-hacer-copias-de-seguridad-de-tu-negocio",
      "como-proteger-cuentas-contrasenas-estafas-negocio"
    ],
    "cta": {
      "label": "Revisar mi situación",
      "to": "/diagnostico",
      "copy": "La prevención empieza por saber qué procesos y servicios son esenciales para trabajar."
    },
    "sections": [
      {
        "heading": "Cuando una pantalla deja de responder",
        "paragraphs": [
          "No todos los fallos son iguales: puede faltar conexión, energía, un servicio externo o acceso a una cuenta. Lo primero es mantener la seguridad de las personas y entender qué parte del trabajo se detuvo.",
          "Un buen plan no pretende evitar cualquier problema. Ayuda a responder sin empeorarlo."
        ]
      },
      {
        "heading": "Separa lo urgente de lo que puede esperar",
        "paragraphs": [
          "Empieza preguntando qué actividades dependen de un sistema."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Actividad esencial",
                "definition": "Una tarea cuya interrupción causa un problema importante: atención crítica, seguridad, pedidos ya comprometidos o comunicaciones."
              },
              {
                "term": "Alternativa temporal",
                "definition": "Forma acordada de seguir un trabajo limitado sin exponer datos ni inventar información."
              },
              {
                "term": "Recuperación",
                "definition": "Pasos para comprobar que el servicio vuelve a funcionar y reconciliar lo ocurrido durante la interrupción."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo: la agenda deja de abrir en dos sedes",
        "paragraphs": [
          "Caso hipotético, no describe un incidente real."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Dos locales, una agenda fuera de servicio",
            "hypothetical": true,
            "context": "Una empresa coordina citas desde una herramienta en línea que deja de funcionar durante la mañana.",
            "problem": "El personal no sabe qué citas confirmar y algunos piensan registrar nombres en teléfonos personales.",
            "approach": "El equipo utiliza un contacto de soporte conocido y un procedimiento alternativo limitado, sin copiar datos privados sin autorización.",
            "actions": [
              "Comunica al equipo qué sistema falló y quién coordina la respuesta.",
              "Revisa únicamente las citas disponibles por medios autorizados, sin prometer horarios no confirmados.",
              "Cuando regrese el servicio, verifica duplicados y registra qué acciones se realizaron."
            ],
            "lesson": "Continuar no significa saltarse la privacidad ni crear un segundo registro descontrolado."
          }
        ]
      },
      {
        "heading": "Prepara el plan cuando todo funciona",
        "paragraphs": [
          "No tiene que ser un manual enorme. Debe poder entenderse cuando haya presión."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Cinco preparativos esenciales",
            "items": [
              {
                "title": "Haz una lista de dependencias",
                "detail": "Internet, electricidad, agenda, archivos, cobros, comunicaciones y proveedores."
              },
              {
                "title": "Marca lo prioritario",
                "detail": "Explica qué sucede si cada elemento falla y qué actividades deben detenerse por seguridad."
              },
              {
                "title": "Asigna personas de contacto",
                "detail": "Quién decide, quién atiende al equipo y cómo se informa a clientes afectados."
              },
              {
                "title": "Define alternativas seguras",
                "detail": "Qué puede hacerse sin el sistema y qué datos jamás deben copiarse a dispositivos sin protección."
              },
              {
                "title": "Ensaya la recuperación",
                "detail": "Con un ejemplo pequeño, comprueba que contactos, respaldos y vuelta al servicio son utilizables."
              }
            ]
          }
        ]
      },
      {
        "heading": "Varias sedes necesitan un plan coordinado",
        "paragraphs": [
          "Cada sede puede tener una alternativa local, pero deben acordar quién toma decisiones que afectan a todos.",
          "Si varias empresas comparten proveedor, una caída puede afectarlas de manera distinta. Conserva responsables, comunicaciones y datos separados.",
          "Si crees que hubo acceso no autorizado o una brecha de datos, no lo trates como una simple interrupción: activa la respuesta de seguridad correspondiente y solicita ayuda especializada."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "caution",
            "title": "No sacrifiques seguridad para volver rápido",
            "text": "Si una actividad no puede realizarse con seguridad sin el sistema, detenla hasta recuperar las condiciones necesarias."
          }
        ]
      },
      {
        "heading": "Qué revisar después de la interrupción",
        "paragraphs": [
          "No basta con que vuelva a abrir la pantalla. Comprueba que los datos, estados y comunicaciones sean correctos.",
          "Anota qué falló, qué funcionó del plan, qué información se perdió o duplicó y qué cambiar antes del próximo incidente."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Identifica actividades esenciales y contactos responsables.",
              "Prepara una alternativa segura y pruébala.",
              "Revisa datos y pendientes después de recuperarte."
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
                "question": "¿Basta tener una copia de seguridad?",
                "answer": "No. También hay que saber cómo restaurarla y quién puede hacerlo sin dañar otros datos."
              },
              {
                "question": "¿Podemos anotar todo en papel mientras tanto?",
                "answer": "Solo si el proceso lo permite y existe una forma segura de proteger y reconciliar esa información."
              },
              {
                "question": "¿Qué hago si falla un proveedor externo?",
                "answer": "Consulta sus canales oficiales, informa a los equipos afectados y aplica el plan acordado. No atribuyas la causa sin pruebas."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes oficiales",
        "paragraphs": [
          "La continuidad es proporcional a la actividad y no reemplaza requisitos sectoriales de seguridad, salud o protección de datos."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Ready.gov — Preparación para interrupciones empresariales",
                "url": "https://www.ready.gov/business/emergency-plans",
                "scope": "Incluye continuidad operativa, comunicación y recuperación de sistemas. Adapta la respuesta a los riesgos y servicios de tu empresa."
              },
              {
                "label": "CISA — Recursos de seguridad para empresas pequeñas y medianas",
                "url": "https://www.cisa.gov/small-and-medium-sized-business-resources",
                "scope": "Recursos de preparación y seguridad; las obligaciones legales y técnicas concretas dependen del caso."
              },
              {
                "label": "W3C — Consejos para escribir contenido fácil de comprender",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Sugerencias para usar palabras sencillas, títulos claros y explicaciones comprensibles."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-usar-inteligencia-artificial-en-una-empresa-con-supervision",
    "category": "Inteligencia Artificial",
    "title": "Reglas claras para usar IA en tu empresa: datos, responsables y revisión",
    "intro": "Antes de permitir que un equipo use inteligencia artificial en su trabajo, acuerda qué tareas puede apoyar, qué información se puede compartir y quién revisa los resultados. Unas reglas claras evitan que cada persona tenga que adivinar los límites.",
    "excerpt": "Una guía para definir usos permitidos, proteger información, asignar responsables y saber cuándo una persona debe detener o corregir una acción de IA.",
    "enPocasPalabras": [
      "Define primero qué tareas están permitidas y qué errores serían inaceptables.",
      "No compartas datos solo porque una herramienta permita pegarlos; revisa su necesidad y las condiciones del proveedor.",
      "Asigna quién prepara, revisa y aprueba el resultado antes de usarlo con clientes o procesos importantes."
    ],
    "image": "/assets/learn/diagram-gobierno-ia.svg",
    "imageAlt": "Tres tarjetas muestran una propuesta de IA, una revisión de una persona y una decisión controlada.",
    "editorialDraft": true,
    "relatedSlugs": [
      "como-probar-un-asistente-de-ia-con-supervision-humana",
      "preparar-respuestas-publicaciones-ia-sin-perder-control",
      "como-saber-si-una-mejora-tecnologica-funciona-en-tu-empresa"
    ],
    "cta": {
      "label": "Revisar el proceso antes de activarlo",
      "to": "/contacto",
      "copy": "Si el uso afecta datos o decisiones importantes, identifica primero los límites y las personas responsables."
    },
    "sections": [
      {
        "heading": "Empieza por definir la tarea permitida",
        "paragraphs": [
          "No basta con decir que el equipo puede usar IA. Define para qué tareas se permite, qué resultado puede preparar y qué acciones no debe ejecutar por su cuenta.",
          "Una tarea limitada podría ser resumir un documento público o preparar un borrador con información aprobada. Responder a una reclamación, confirmar un precio o cambiar un registro requiere controles distintos."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Uso permitido",
                "definition": "Tarea concreta que la organización ha decidido que puede recibir ayuda de IA, con límites y responsable definidos."
              },
              {
                "term": "Revisión obligatoria",
                "definition": "Situación en la que una persona comprueba hechos, tono, datos y consecuencias antes de utilizar el resultado."
              },
              {
                "term": "Uso no permitido",
                "definition": "Tarea o dato que queda fuera de las reglas acordadas, por ejemplo introducir credenciales o dejar una decisión sensible sin revisión."
              },
              {
                "term": "Escalamiento",
                "definition": "Detener el flujo y pedir intervención a una persona cuando falta información, aparece un riesgo o el resultado contradice las reglas."
              }
            ]
          }
        ]
      },
      {
        "heading": "Decide qué información puede recibir",
        "paragraphs": [
          "El acceso de una persona a un dato no significa automáticamente que pueda copiarlo a cualquier servicio externo. Revisa el propósito, las políticas internas, las condiciones del proveedor y las reglas aplicables antes de compartir información.",
          "Como regla inicial, utiliza datos públicos o ejemplos ficticios para aprender. Trata con mayor cuidado los datos de clientes, empleados, pagos, salud, credenciales, contratos o información comercial confidencial."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Tres comprobaciones antes de introducir información",
            "items": [
              {
                "title": "Pregunta si el dato hace falta",
                "detail": "Si puedes completar la tarea sin un nombre, teléfono, documento o dato confidencial, no lo incluyas."
              },
              {
                "title": "Comprueba el servicio",
                "detail": "Revisa las condiciones de uso, opciones de privacidad, conservación y acceso que declara el proveedor para el producto concreto."
              },
              {
                "title": "Consulta si hay dudas",
                "detail": "Si el uso afecta información sensible, obligaciones contractuales o personas, detén la tarea hasta que la persona responsable confirme qué está permitido."
              }
            ]
          }
        ]
      },
      {
        "heading": "Asigna quién prepara, revisa y aprueba",
        "paragraphs": [
          "En un equipo pequeño, una misma persona puede cumplir varios papeles. Lo importante es que no quede implícito quién responde por el resultado ni quién puede autorizar una acción."
        ],
        "blocks": [
          {
            "type": "list",
            "items": [
              "Quien solicita el trabajo describe la tarea, el resultado esperado y los datos permitidos.",
              "Quien administra la herramienta configura los accesos y mantiene las instrucciones aprobadas.",
              "Quien revisa contrasta nombres, fechas, cifras, condiciones y posibles errores antes de utilizar el resultado.",
              "Quien tiene autoridad para comprometer al negocio aprueba precios, ofertas, mensajes sensibles o cambios importantes.",
              "Todo el equipo sabe a quién avisar si detecta una respuesta incorrecta o una exposición de información."
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo hipotético: un equipo prepara respuestas frecuentes",
        "paragraphs": [
          "Este caso es inventado. Ilustra cómo unas reglas internas pueden limitar errores antes de que una respuesta llegue a una persona cliente."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "El asistente propone un descuento no aprobado",
            "hypothetical": true,
            "context": "Un negocio quiere preparar respuestas para preguntas habituales sobre horarios, servicios y disponibilidad.",
            "problem": "El borrador generado menciona un descuento y una fecha de entrega que no aparecen en la información aprobada.",
            "approach": "El equipo permite preparar borradores con una lista de datos públicos revisados, pero exige aprobación humana para precios, plazos y compromisos.",
            "actions": [
              "Reunir preguntas frecuentes sin copiar conversaciones privadas reales.",
              "Marcar qué información está aprobada y qué debe quedar sin responder si no se conoce.",
              "Probar preguntas ambiguas y comprobar que la herramienta no invente precios ni disponibilidad.",
              "Nombrar a quien revisa el texto y autoriza su envío."
            ],
            "lesson": "La IA puede ayudar a redactar, pero las reglas de la organización y la aprobación de una persona determinan qué se comunica en nombre del negocio."
          }
        ]
      },
      {
        "heading": "Qué hacer cuando aparece un error",
        "paragraphs": [
          "Un proceso responsable necesita una salida clara. Si aparece un dato inventado, una respuesta inadecuada o información que no debía compartirse, no sigas usando el mismo flujo como si nada hubiera ocurrido."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Respuesta inicial ante un problema",
            "items": [
              {
                "title": "Detén la acción afectada",
                "detail": "Pausa el envío o la automatización relacionada hasta comprender el alcance del error."
              },
              {
                "title": "Informa al responsable",
                "detail": "Describe qué ocurrió, qué herramienta intervino y qué información pudo verse afectada, sin difundirla más."
              },
              {
                "title": "Corrige y comprueba",
                "detail": "Verifica la información con una fuente autorizada y corrige el mensaje o el registro donde corresponda."
              },
              {
                "title": "Ajusta las reglas",
                "detail": "Documenta qué control faltó y decide si el flujo puede retomarse, necesita cambios o debe permanecer detenido."
              }
            ]
          }
        ]
      },
      {
        "heading": "Qué decisiones necesitan una evaluación especial",
        "paragraphs": [
          "No delegues sin controles decisiones con consecuencias importantes para personas, dinero, privacidad, seguridad o compromisos de la empresa. El riesgo depende de la tarea, los datos, el proveedor y el contexto."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "caution",
            "title": "No conviertas una sugerencia en una decisión automática",
            "text": "Las decisiones sobre empleo, salud, crédito, datos sensibles o acciones difíciles de revertir requieren evaluación específica y responsables claros. Las obligaciones pueden variar por país y sector."
          },
          {
            "type": "summary",
            "items": [
              "Define los usos permitidos antes de activar una herramienta.",
              "Limita los datos y asigna quién revisa y quién aprueba.",
              "Detén el flujo cuando aparezca un error o una situación fuera de las reglas."
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
                "question": "¿Puede cada persona elegir cualquier herramienta de IA?",
                "answer": "No conviene asumirlo. La organización debe indicar qué servicios están permitidos, qué información se puede compartir y a quién consultar ante una duda."
              },
              {
                "question": "¿Toda respuesta de IA necesita revisión?",
                "answer": "La revisión depende de la tarea y sus consecuencias. Para un uso de bajo riesgo puede bastar una comprobación sencilla; los precios, compromisos, datos sensibles o decisiones importantes necesitan controles más estrictos."
              },
              {
                "question": "¿Esta guía sustituye una política legal o de seguridad?",
                "answer": "No. Es un punto de partida educativo. Las obligaciones concretas dependen de la actividad, el proveedor, los contratos y la jurisdicción."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes y contexto",
        "paragraphs": [
          "NIST ofrece marcos voluntarios para identificar y gestionar riesgos de IA. Son herramientas de trabajo, no certificaciones ni garantías de seguridad."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "NIST — AI Risk Management Framework",
                "url": "https://www.nist.gov/itl/ai-risk-management-framework",
                "scope": "Marco voluntario para reconocer, evaluar y gestionar riesgos de IA. AI RMF 1.0 continúa publicado, aunque NIST indica que está en revisión en 2026; no es una certificación ni garantiza que una herramienta sea segura."
              },
              {
                "label": "NIST — Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile",
                "url": "https://doi.org/10.6028/NIST.AI.600-1",
                "scope": "Describe riesgos asociados a IA generativa, incluidos contenido incorrecto, privacidad, supervisión y uso en organizaciones."
              },
              {
                "label": "W3C WAI — Writing for Web Accessibility",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Recomienda instrucciones claras y contenido fácil de comprender; se incluye como criterio de comunicación, no como norma de gobierno de IA."
              }
            ]
          }
        ]
      },
      {
        "heading": "Qué hacer antes de ampliar el uso",
        "paragraphs": [
          "Escribe una regla de una página para la primera tarea: qué se permite, qué datos pueden utilizarse, quién revisa y cómo detener el proceso. Vuelve a revisarla cuando cambien el proveedor, la tarea o el riesgo."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Una tarea concreta es más fácil de controlar que un permiso general para usar IA.",
              "Los datos y los responsables deben estar definidos antes de empezar.",
              "Los errores deben poder detenerse, corregirse y aprenderse sin ocultarlos."
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-saber-si-una-mejora-tecnologica-funciona-en-tu-empresa",
    "category": "Gestión y equipos",
    "title": "¿La nueva herramienta realmente ayuda? Aprende a medir una mejora digital",
    "intro": "Compraste una herramienta, el equipo la está usando y hay nuevas pantallas. Pero ¿hay menos errores, se responde mejor o solo cambió la forma de trabajar? Para saberlo necesitas comparar una situación antes y después.",
    "excerpt": "Aprende a elegir resultados útiles, probar cambios con un equipo y decidir si conviene mantenerlos, corregirlos o detenerlos.",
    "enPocasPalabras": [
      "Define el problema y cómo sabrás que mejoró antes de instalar la herramienta.",
      "Observa resultados reales, no solo usuarios registrados, clics o pantallas abiertas.",
      "Escucha al equipo, revisa errores y decide si seguir, ajustar o retirar la solución."
    ],
    "image": "/assets/learn/diagram-evaluar-mejora.svg",
    "imageAlt": "Tres tarjetas muestran la situación inicial, una prueba limitada y una decisión basada en lo aprendido.",
    "editorialDraft": true,
    "relatedSlugs": [
      "analitica-web-que-medir-en-tu-negocio",
      "como-preparar-presupuesto-para-herramientas-digitales"
    ],
    "cta": {
      "label": "Revisar prioridades",
      "to": "/diagnostico",
      "copy": "Un diagnóstico inicial puede ayudarte a identificar qué problemas conviene observar primero."
    },
    "sections": [
      {
        "heading": "Usar una aplicación no significa que el trabajo mejoró",
        "paragraphs": [
          "Una empresa cambia de agenda y celebra que todo el equipo tenga acceso. Sin embargo, las citas siguen duplicándose. Se instaló la herramienta, pero el problema no se resolvió.",
          "Medir una mejora no es vigilar a las personas: es comprobar si una nueva forma de trabajar realmente ayuda."
        ]
      },
      {
        "heading": "Empieza por una pregunta concreta",
        "paragraphs": [
          "La pregunta debe referirse al trabajo, no a la popularidad de una aplicación."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Situación inicial",
                "definition": "Cómo funciona el proceso antes del cambio, con los datos disponibles."
              },
              {
                "term": "Resultado que importa",
                "definition": "Algo que puedes observar: menos duplicados, respuestas más claras o menor tiempo de espera, según el caso."
              },
              {
                "term": "Costo de la mejora",
                "definition": "Tiempo de formación, correcciones, suscripciones y trabajo adicional."
              },
              {
                "term": "Efecto no deseado",
                "definition": "Un problema nuevo: datos repetidos, más mensajes, errores de acceso o cargas excesivas para el equipo."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo: una agenda que prometía ordenar las citas",
        "paragraphs": [
          "Números y situación hipotéticos; no demuestran un resultado de ninguna herramienta."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Dos sedes prueban una agenda común",
            "hypothetical": true,
            "context": "Una empresa quiere reducir citas duplicadas en sus locales.",
            "problem": "La herramienta nueva tiene muchas funciones, pero nadie sabe si redujo los errores.",
            "approach": "Durante una prueba, el equipo registra por el mismo criterio los duplicados antes y después, junto con cambios de horario, personal y volumen.",
            "actions": [
              "Define qué cuenta exactamente como «cita duplicada».",
              "Observa el mismo periodo o condiciones comparables y anota diferencias.",
              "Pide al equipo que explique qué problemas nuevos aparecieron antes de ampliar el uso."
            ],
            "lesson": "Los datos ayudan a aprender. Una diferencia observada no demuestra por sí sola que la herramienta fue la causa."
          }
        ]
      },
      {
        "heading": "Una prueba sencilla en seis pasos",
        "paragraphs": [
          "No necesitas un tablero enorme de indicadores. Elige pocos que respondan tu pregunta."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Una mejora con principio y revisión",
            "items": [
              {
                "title": "Nombra el problema",
                "detail": "Escribe qué ocurre y a quién afecta."
              },
              {
                "title": "Mira la situación actual",
                "detail": "Registra uno o dos indicadores y su contexto antes del cambio."
              },
              {
                "title": "Decide qué probar",
                "detail": "Selecciona un equipo, tarea o sede donde puedas trabajar sin arriesgar toda la operación."
              },
              {
                "title": "Acompaña a las personas",
                "detail": "Explica el cambio, recibe preguntas y observa dónde se atascan."
              },
              {
                "title": "Compara con cuidado",
                "detail": "Mide resultados, costos, errores y opiniones. Revisa otras causas posibles."
              },
              {
                "title": "Toma una decisión",
                "detail": "Mantén, ajusta, amplía, pausa o retira la solución y explica por qué."
              }
            ]
          }
        ]
      },
      {
        "heading": "Varias sedes no son necesariamente comparables",
        "paragraphs": [
          "Una sucursal puede atender el doble de personas o tener horarios diferentes. Un cambio en sus cifras no demuestra por sí solo que el software funcione mejor o peor.",
          "Si varios negocios comparten plataforma, mantén el origen de los datos y los permisos. Puedes analizar totales autorizados, pero no mezclar operaciones que se miden de forma distinta.",
          "Involucra a quienes trabajan con la herramienta: una aparente ganancia de velocidad puede esconder trabajo extra que no aparece en el informe."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "tip",
            "title": "Evita una conclusión precipitada",
            "text": "Si el resultado mejora al mismo tiempo que cambian personal, campañas u horarios, no atribuyas automáticamente la causa a la herramienta."
          }
        ]
      },
      {
        "heading": "No todo resultado tiene que ser una venta",
        "paragraphs": [
          "Una mejora también puede ayudar a reducir errores, responder con más claridad, recuperar documentos o proteger la información.",
          "Si todavía no hay datos suficientes, puedes ampliar la observación en vez de forzar una decisión. La falta de evidencia no significa automáticamente que el proyecto fue un fracaso."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Define el resultado antes de implementar.",
              "Compara la situación con contexto y escucha al equipo.",
              "Decide con evidencia: seguir, corregir, pausar o retirar."
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
                "question": "¿Cuántos indicadores necesito?",
                "answer": "Empieza con uno o dos que realmente expliquen el problema. Añade más solo cuando ayuden a decidir."
              },
              {
                "question": "¿Y si el equipo dice que está mejor pero los números no cambian?",
                "answer": "Explora qué mejoró: comprensión, facilidad de uso, confianza o un problema que todavía no medías."
              },
              {
                "question": "¿Qué hago si un piloto falla?",
                "answer": "Documenta por qué, protege los datos y corrige o retira la solución de forma ordenada. Aprender también es un resultado."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para profundizar",
        "paragraphs": [
          "Los indicadores son ejemplos para aprender a pensar; no son métricas obligatorias para todos los sectores."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "GOV.UK — Cómo usar resultados para mejorar un servicio",
                "url": "https://www.gov.uk/service-manual/measuring-success/using-data-to-improve-your-service-an-introduction",
                "scope": "Ejemplos de mediciones para aprender de un servicio. Los indicadores concretos deben elegirse según la actividad del negocio."
              },
              {
                "label": "GOV.UK — Principios para dirigir mejoras por etapas",
                "url": "https://www.gov.uk/service-manual/agile-delivery/governance-principles-for-agile-service-delivery",
                "scope": "Orienta la entrega gradual, la asignación de responsables y la revisión de resultados; no es una regla contractual universal."
              },
              {
                "label": "OCDE — Digitalización de pequeñas y medianas empresas",
                "url": "https://www.oecd.org/en/topics/digitalisation-of-smes.html",
                "scope": "Material institucional sobre prioridades, recursos y barreras al adoptar tecnología. No establece una receta universal por tamaño."
              }
            ]
          }
        ]
      }
    ]
  }
];
