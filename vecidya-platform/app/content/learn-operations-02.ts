import type { LearnArticle } from "./learn";

/** APRENDE-OPERACIONES-02: borradores editoriales para negocios y empresas de distintas escalas. */
export const learnOperations02Articles: LearnArticle[] = [
  {
    "slug": "como-organizar-tareas-y-responsables-en-tu-equipo",
    "category": "Gestión y equipos",
    "title": "¿Quién se encarga de qué? Organiza las tareas sin perseguir a tu equipo",
    "intro": "«Pensé que eso lo hacía otra persona». Si esa frase se repite en tu negocio, quizá no falte esfuerzo: falta un acuerdo claro. Puedes empezar con una lista de pendientes que todo el equipo entienda.",
    "excerpt": "Aprende a repartir tareas, acordar fechas realistas y resolver bloqueos sin convertir el seguimiento en vigilancia.",
    "enPocasPalabras": [
      "Cada tarea necesita un resultado claro y una persona responsable.",
      "Revisa los pendientes de manera breve y periódica: busca bloqueos, no culpables.",
      "Para varias sedes, comparte criterios pero conserva responsables y prioridades de cada equipo."
    ],
    "image": "/assets/learn/diagram-tareas-equipo.svg",
    "imageAlt": "Tres tarjetas grandes muestran un trabajo sencillo: definir una tarea, nombrar responsable y comprobar el resultado.",
    "editorialDraft": true,
    "relatedSlugs": [
      "como-coordinar-varias-sedes-o-negocios-sin-duplicar-trabajo",
      "quien-puede-ver-cambiar-y-publicar-en-tu-empresa"
    ],
    "cta": {
      "label": "Revisar prioridades",
      "to": "/diagnostico",
      "copy": "Si el trabajo se enreda entre personas o sedes, empieza por identificar qué proceso necesita orden."
    },
    "sections": [
      {
        "heading": "La tarea que todos creían terminada",
        "paragraphs": [
          "En una tienda preparan una promoción. Alguien diseñó la imagen, otra persona creyó que ya estaba aprobada y nadie actualizó el horario de atención. La publicación salió con un dato incorrecto.",
          "Este ejemplo es hipotético. La lección es sencilla: estar ocupado no significa que el equipo tenga claro qué debe entregar."
        ]
      },
      {
        "heading": "Una lista útil necesita cuatro respuestas",
        "paragraphs": [
          "No empieces por elegir una aplicación. Prueba a describir cada tarea de manera que otra persona pueda entenderla."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Resultado",
                "definition": "Qué debe quedar listo: «horario revisado en el perfil de la tienda», no solo «revisar marketing»."
              },
              {
                "term": "Responsable",
                "definition": "Persona que confirma si la tarea avanza y pide ayuda cuando falta algo."
              },
              {
                "term": "Fecha acordada",
                "definition": "Momento realista para revisar o entregar; puede ajustarse con una explicación."
              },
              {
                "term": "Estado",
                "definition": "Una etiqueta sencilla: pendiente, en marcha, bloqueada o terminada."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cómo repartir trabajo sin llenar a todos de mensajes",
        "paragraphs": [
          "Puedes usar papel, una pizarra o una herramienta compartida. Lo que importa es que la información sea correcta."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Cinco pasos para poner orden",
            "items": [
              {
                "title": "Anota las tareas reales",
                "detail": "Empieza por un proyecto concreto, como actualizar el catálogo. Evita registrar actividades vagas."
              },
              {
                "title": "Define qué significa terminar",
                "detail": "Por ejemplo, «tres precios comprobados y publicados por la persona autorizada»."
              },
              {
                "title": "Nombra un responsable",
                "detail": "Puedes tener colaboradores, pero una persona debe saber quién confirma el cierre."
              },
              {
                "title": "Acordad una revisión corta",
                "detail": "Pregunta qué terminó, qué sigue y qué necesita ayuda, sin exigir informes interminables."
              },
              {
                "title": "Cierra o corrige",
                "detail": "Comprueba el resultado; si cambió el trabajo, actualiza fecha y alcance con quienes correspondan."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo: preparar una campaña sin perder información",
        "paragraphs": [
          "Caso inventado para practicar tareas, responsables y aprobaciones."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una cafetería prepara un menú de temporada",
            "hypothetical": true,
            "context": "Hay una persona que cocina, otra que atiende mensajes y otra que publica contenido.",
            "problem": "Las fotografías están listas, pero nadie confirmó productos disponibles y precios.",
            "approach": "Crean cuatro tareas pequeñas con responsables y una aprobación antes de publicar.",
            "actions": [
              "Cocina confirma qué productos pueden ofrecerse y durante qué fechas.",
              "Administración revisa y aprueba los precios vigentes.",
              "Comunicación prepara el anuncio y espera la confirmación.",
              "Atención recibe el mensaje final para responder consultas sin contradicciones."
            ],
            "lesson": "Un proceso claro evita que una publicación dependa de suposiciones."
          }
        ]
      },
      {
        "heading": "Cuando trabajan varias áreas, sucursales o marcas",
        "paragraphs": [
          "Con dos personas puede bastar una lista visible. Con varios departamentos, registra quién entrega información a quién y qué decisión requiere aprobación.",
          "Si diriges varias sedes, usa categorías comunes para el estado de los trabajos, pero deja visible a qué sede pertenece cada tarea. Si son negocios distintos, no compartas documentos sensibles solo por comodidad.",
          "Una dirección puede revisar el avance general sin leer mensajes privados o dar a todos permiso para modificar todo."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "caution",
            "title": "Seguimiento no significa vigilar personas",
            "text": "Evalúa el cumplimiento de las tareas y resuelve obstáculos. Evita recopilar datos personales o medir conversaciones privadas sin necesidad y base adecuada."
          }
        ]
      },
      {
        "heading": "Tres señales de que el sistema de tareas no está ayudando",
        "paragraphs": [
          "Si mantener la lista exige más esfuerzo que hacer el trabajo, simplifica."
        ],
        "bullets": [
          "Todas las tareas aparecen como urgentes y nadie puede priorizar.",
          "Las fechas cambian sin avisar o sin explicar qué afecta el cambio.",
          "Se marca «terminada» sin comprobar el resultado."
        ]
      },
      {
        "heading": "Una práctica de diez minutos",
        "paragraphs": [
          "Elige un pendiente real y descríbelo con cuatro datos: resultado, responsable, fecha acordada y estado. Pide a otra persona que lo lea. Si tiene que preguntar qué significa, vuelve a escribirlo."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Escribe entregables comprensibles, no órdenes vagas.",
              "Revisa obstáculos junto con el equipo; evita buscar culpables.",
              "Usa el nivel de detalle que realmente necesita tu operación."
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
                "question": "¿Necesitamos un programa de proyectos?",
                "answer": "No siempre. Si una lista compartida se entiende y se mantiene, puede ser suficiente. Un sistema más avanzado sirve cuando hay dependencias, muchas personas o varios equipos."
              },
              {
                "question": "¿Y si una tarea depende de varias personas?",
                "answer": "Divide el trabajo y aclara quién entrega cada parte y quién verifica el resultado final."
              },
              {
                "question": "¿Debo fijar una fecha a todo?",
                "answer": "Acordar cuándo revisar ayuda. No inventes fechas rígidas para trabajos cuya duración todavía necesitas conocer."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes y orientación adicional",
        "paragraphs": [
          "Estos consejos son una adaptación educativa de principios de trabajo iterativo y contenido claro; no son un método obligatorio."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "GOV.UK — Principios de trabajo iterativo",
                "url": "https://www.gov.uk/service-manual/agile-delivery/core-principles-agile",
                "scope": "Pautas de trabajo centrado en necesidades, entrega pequeña, comentarios de usuarios y mejora continua; no certifica resultados empresariales."
              },
              {
                "label": "W3C WAI — Escribir para que se entienda",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Orientaciones sobre títulos claros, párrafos breves y palabras comprensibles; no garantiza una certificación."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-controlar-inventario-sin-perder-productos-ni-datos",
    "category": "Gestión y equipos",
    "title": "¿Cuántos productos te quedan? Controla el inventario sin perderte en números",
    "intro": "Un cliente pide un producto que «debería estar en almacén», pero nadie lo encuentra. Contar no tiene por qué ser complicado: hay que saber qué entró, qué salió y dónde buscarlo.",
    "excerpt": "Aprende a registrar existencias, devoluciones, pérdidas y movimientos entre sedes con ejemplos sencillos y sin prometer un sistema perfecto.",
    "enPocasPalabras": [
      "Separa lo que recibes, vendes, utilizas, devuelves o pierdes; no todo es una venta.",
      "Usa un nombre o código coherente para cada producto y revisa físicamente las diferencias.",
      "Si hay varios almacenes, identifica dónde ocurrió cada movimiento antes de sumar existencias."
    ],
    "image": "/assets/learn/diagram-inventario.svg",
    "imageAlt": "Tres pasos grandes para controlar existencias: recibir productos, registrar los movimientos y comprobar lo que queda.",
    "editorialDraft": true,
    "relatedSlugs": [
      "hojas-de-calculo-para-organizar-un-negocio-pequeno",
      "como-coordinar-varias-sedes-o-negocios-sin-duplicar-trabajo"
    ],
    "cta": {
      "label": "Explorar el Diagnóstico",
      "to": "/diagnostico",
      "copy": "Antes de invertir en inventario digital, revisa cómo entran, salen y se comprueban los productos hoy."
    },
    "sections": [
      {
        "heading": "El producto que aparece en la lista, pero no en el estante",
        "paragraphs": [
          "Imagina que una tienda tiene anotadas ocho unidades de un artículo. En el estante hay seis. Tal vez se devolvieron dos, se trasladaron a otra sede o alguien olvidó registrar una salida.",
          "El problema no se arregla anotando «hay seis» sin averiguar qué pasó. Conviene entender los movimientos y dejar rastro de las correcciones."
        ]
      },
      {
        "heading": "Cuatro palabras que vale la pena conocer",
        "paragraphs": [
          "No necesitas estudiar contabilidad para hacer el primer control. Estas ideas ayudan a contar sin confundir cantidades."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Existencias",
                "definition": "Cantidad de unidades que hay en un lugar y en un momento concreto."
              },
              {
                "term": "Entrada",
                "definition": "Producto recibido del proveedor, devuelto al almacén o trasladado desde otra sede, según el caso."
              },
              {
                "term": "Salida",
                "definition": "Producto vendido, utilizado, dañado o enviado a otro almacén; registra el motivo."
              },
              {
                "term": "Ajuste",
                "definition": "Corrección documentada cuando lo contado no coincide con el registro. No debe esconder errores."
              }
            ]
          }
        ]
      },
      {
        "heading": "La cuenta sencilla que ayuda a encontrar diferencias",
        "paragraphs": [
          "Para un mismo producto y un mismo almacén, la idea es: lo que había + lo que entró − lo que salió = lo que debería quedar. Las devoluciones, pérdidas, reservas y traslados necesitan una regla consistente para no contarlos dos veces.",
          "Ejemplo inventado: empezaste con 10 cajas; recibiste 5 y entregaste 4. Deberían quedar 11. Si solo encuentras 9, revisa movimientos y documentos antes de corregir el saldo.",
          "El número esperado no prueba por sí solo que las unidades estén en buen estado o disponibles para vender."
        ]
      },
      {
        "heading": "Prepara un control que una persona pueda mantener",
        "paragraphs": [
          "Puedes comenzar con una hoja protegida, sin comprar una herramienta compleja."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Seis pasos para registrar existencias",
            "items": [
              {
                "title": "Identifica cada producto",
                "detail": "Usa un nombre y una unidad clara: caja, pieza, kilogramo o metro. No mezcles unidades sin conversión."
              },
              {
                "title": "Distingue los lugares",
                "detail": "Registra local, almacén o sede en cada movimiento."
              },
              {
                "title": "Anota entradas y salidas",
                "detail": "Guarda fecha, cantidad, motivo y persona responsable; añade referencias cuando existan."
              },
              {
                "title": "Marca reservas y productos dañados",
                "detail": "Una unidad existente no siempre está disponible para atender pedidos."
              },
              {
                "title": "Cuenta una muestra físicamente",
                "detail": "Empieza por los artículos que más se mueven o que generan errores."
              },
              {
                "title": "Investiga y corrige",
                "detail": "Si hay diferencias, busca el origen y registra la corrección sin borrar la historia."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo: dos tiendas que se prestan mercancía",
        "paragraphs": [
          "Situación hipotética, con cifras solo para ilustrar."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una caja que cambió de sede",
            "hypothetical": true,
            "context": "Una empresa tiene un almacén central y dos puntos de venta.",
            "problem": "El equipo anotó una salida de cinco unidades del central, pero nunca registró la recepción en la segunda tienda.",
            "approach": "Acordaron registrar el traslado con origen, destino, cantidad y confirmación de recepción.",
            "actions": [
              "Central anota envío de cinco unidades, con fecha y destino.",
              "La tienda receptora comprueba la entrega y anota que recibió cinco.",
              "Si recibe cuatro, registra la diferencia y la comunica antes de ajustar balances."
            ],
            "lesson": "Mover productos no es venderlos. Cada sede necesita saber qué tiene físicamente."
          }
        ]
      },
      {
        "heading": "Qué cambia con el tamaño y tipo de negocio",
        "paragraphs": [
          "Un taller pequeño puede controlar piezas clave y materiales usados por servicio. Una tienda con muchas referencias puede necesitar lectores de códigos y revisiones parciales frecuentes.",
          "Con varias sedes hay que manejar transferencias, autorizaciones y diferencias entre ubicaciones. En empresas con producción también pueden aparecer materias primas, productos a medio fabricar y pérdidas por proceso.",
          "Los controles fiscales y de valoración de inventario dependen de cada país y actividad; este artículo explica cantidades operativas, no sustituye la contabilidad."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "caution",
            "title": "No metas todos los datos en una tabla abierta",
            "text": "Limita quién puede cambiar existencias y conserva respaldos. Si usas una hoja colaborativa, controla permisos y evita borrar registros para «hacer cuadrar» los números."
          }
        ]
      },
      {
        "heading": "Un ejercicio para esta semana",
        "paragraphs": [
          "Elige un solo producto. Cuenta las unidades reales en un lugar. Anota los movimientos de algunos días y compara el saldo esperado con el real.",
          "Si hay diferencia, documenta una causa posible y qué falta confirmar; no inventes una explicación."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Usa nombres y unidades consistentes.",
              "Registra el motivo y la ubicación de cada movimiento.",
              "Comprueba físicamente y documenta las diferencias antes de ajustar."
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
                "question": "¿Cada cuánto tengo que contar?",
                "answer": "Depende de rotación, costo, riesgo y recursos. Puedes revisar con mayor frecuencia artículos importantes o con diferencias repetidas."
              },
              {
                "question": "¿Una hoja de cálculo es suficiente?",
                "answer": "Puede servir para pocos productos y movimientos. Cuando hay muchas ventas, sedes o integraciones, evalúa herramientas que reduzcan errores sin perder trazabilidad."
              },
              {
                "question": "¿Qué pasa con las reservas?",
                "answer": "Acuerda la diferencia entre tener una unidad físicamente y tenerla disponible para nuevos pedidos. No prometas lo que ya está reservado."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para seguir aprendiendo",
        "paragraphs": [
          "Estas referencias se usan para reforzar las decisiones sobre herramientas y controles; el método de movimiento de existencias es un ejemplo operativo, no una norma contable universal."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Gobierno de Australia — Gestionar inventario",
                "url": "https://business.gov.au/products-and-services/inventory-management/manage-your-inventory",
                "scope": "Guía pública que explica registros de entradas y devoluciones, recuentos físicos, existencias y reaprovisionamiento. Los requisitos fiscales descritos corresponden a Australia, no a todos los países."
              },
              {
                "label": "OCDE — Digitalización y competitividad de las pymes (2025)",
                "url": "https://www.oecd.org/en/publications/sme-digitalisation-for-competitiveness_197e3077-en.html",
                "scope": "Encuesta comparativa sobre necesidades de habilidades digitales y adopción en empresas participantes; no representa a todos los países ni garantiza un ahorro."
              },
              {
                "label": "NIST — Guía de ciberseguridad para pequeñas organizaciones",
                "url": "https://csrc.nist.gov/pubs/sp/1300/final",
                "scope": "Referencia voluntaria para considerar riesgos, accesos y recuperación; debe adaptarse a la actividad y las normas aplicables."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-capacitar-al-equipo-en-herramientas-digitales",
    "category": "Gestión y equipos",
    "title": "¿Tu equipo evita una herramienta nueva? Enséñala sin complicar el trabajo",
    "intro": "La empresa compró un sistema, pero la gente sigue anotando todo en papel. Antes de culpar al equipo, pregunta: ¿alguien le enseñó a usarlo con una tarea de verdad?",
    "excerpt": "Prepara una capacitación útil para personal de atención, almacén, oficina y dirección, con ejercicios breves y apoyo después de la formación.",
    "enPocasPalabras": [
      "Enseña tareas reales por puesto, no todas las funciones de una aplicación.",
      "Practicar, equivocarse con datos de ejemplo y recibir ayuda funciona mejor que mirar una presentación interminable.",
      "Acuerda quién da apoyo después y cómo comprobar que la herramienta realmente facilita trabajar."
    ],
    "image": "/assets/learn/diagram-capacitacion.svg",
    "imageAlt": "Tres momentos de una capacitación práctica: mostrar una tarea, practicar con ayuda y repetirla en el trabajo.",
    "editorialDraft": true,
    "relatedSlugs": [
      "quien-puede-ver-cambiar-y-publicar-en-tu-empresa",
      "como-elegir-herramientas-digitales-sin-llenar-la-empresa-de-aplicaciones"
    ],
    "cta": {
      "label": "Revisar cómo trabaja tu empresa",
      "to": "/diagnostico",
      "copy": "La transformación digital también depende de personas, tareas claras y apoyo continuo."
    },
    "sections": [
      {
        "heading": "El problema no siempre es que el personal «se resista»",
        "paragraphs": [
          "Una nueva aplicación parece sencilla para quien la compró, pero difícil para quien debe atender clientes mientras aprende. Tal vez nadie explicó qué mejora, cómo resolver errores o qué pasará si se pierde la conexión.",
          "Capacitar no es solo enseñar botones: es demostrar una tarea real y escuchar qué se hace difícil."
        ]
      },
      {
        "heading": "Empieza por el trabajo que cada persona tiene que hacer",
        "paragraphs": [
          "Una persona de recepción no necesita aprender lo mismo que un responsable de almacén."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Tarea frecuente",
                "definition": "Acción que esa persona repite: responder una consulta, registrar una entrada o cerrar un pedido."
              },
              {
                "term": "Guía corta",
                "definition": "Instrucciones con pasos, capturas o ejemplos claros para resolver esa tarea."
              },
              {
                "term": "Persona de apoyo",
                "definition": "Compañero o responsable que puede ayudar cuando surge un error o una duda."
              },
              {
                "term": "Prueba práctica",
                "definition": "Ejercicio que demuestra si alguien puede hacer la tarea con seguridad, no un examen para avergonzarlo."
              }
            ]
          }
        ]
      },
      {
        "heading": "Una capacitación que cabe en el día de trabajo",
        "paragraphs": [
          "No necesitas impartir todas las funciones de golpe. Distribuye el aprendizaje en prácticas cortas."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Seis pasos para preparar una formación útil",
            "items": [
              {
                "title": "Elige una tarea que importe",
                "detail": "Por ejemplo, registrar un pedido sin duplicarlo."
              },
              {
                "title": "Muestra el resultado final",
                "detail": "Enseña qué debe quedar guardado y cómo confirmar que salió bien."
              },
              {
                "title": "Haz una demostración breve",
                "detail": "Explica solo los pasos necesarios, en el idioma que usa el equipo."
              },
              {
                "title": "Deja practicar con datos ficticios",
                "detail": "Permite equivocarse sin tocar información real de clientes."
              },
              {
                "title": "Comprueba que se puede repetir",
                "detail": "Pide a la persona que complete la tarea a su ritmo, sin dar clic por ella."
              },
              {
                "title": "Ofrece ayuda y mejora la guía",
                "detail": "Anota las dudas repetidas y cambia la explicación cuando no se entienda."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo: una clínica enseña un nuevo calendario",
        "paragraphs": [
          "Caso inventado. No incluye pacientes ni datos reales de salud."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "La recepción de un centro con citas",
            "hypothetical": true,
            "context": "El equipo pasa de una agenda en papel a un calendario digital.",
            "problem": "Durante una demostración larga, nadie practicó qué hacer ante un horario ocupado o una modificación.",
            "approach": "Prueban con nombres ficticios y tres situaciones habituales.",
            "actions": [
              "Registrar una cita de ejemplo y comprobar que aparece en el día correcto.",
              "Cambiar la hora y verificar qué pasa con el horario anterior.",
              "Practicar qué hacer si no hay conexión y a quién avisar."
            ],
            "lesson": "No se trata de memorizar menús; se trata de gestionar una cita sin perjudicar la atención."
          }
        ]
      },
      {
        "heading": "Cuando capacitas a muchas personas o varias sedes",
        "paragraphs": [
          "Con un equipo pequeño, una guía de una página y una persona disponible pueden bastar.",
          "Con varias áreas, prepara una guía por función y acuerda quién puede pedir cambios en el sistema. En distintas sedes, conserva ejemplos comunes y agrega únicamente los pasos que cambian por ubicación.",
          "Si hay personas con dificultades visuales, de lectura o de conexión, ofrece formas accesibles de practicar: letra legible, instrucciones claras, demostraciones y apoyo personalizado."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "tip",
            "title": "Preguntar es parte del aprendizaje",
            "text": "Pregunta «¿en qué paso se complica?» en lugar de «¿por qué todavía no sabes?». La respuesta sirve para mejorar el material."
          }
        ]
      },
      {
        "heading": "Señales de que la formación todavía no funciona",
        "paragraphs": [
          "No basta con contar cuántas personas asistieron."
        ],
        "bullets": [
          "Quien aprendió no puede completar la tarea sin que alguien haga clic por él.",
          "Las mismas equivocaciones ocurren porque la instrucción es confusa.",
          "Los equipos vuelven a registros paralelos porque no saben qué hacer ante un fallo."
        ]
      },
      {
        "heading": "Un ejercicio de quince minutos",
        "paragraphs": [
          "Escoge la tarea digital que más preguntas genera. Escribe una guía de máximo seis pasos. Pide a una persona que no haya recibido la explicación que la siga con datos ficticios.",
          "Anota dónde se atasca y cambia la guía. Esa observación vale más que suponer que todos comprendieron."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Explica tareas, no funciones que nadie usará.",
              "Practica en un lugar seguro con datos de ejemplo.",
              "Mantén un apoyo cercano y revisa las dudas después de la sesión."
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
                "question": "¿Hay que enseñar toda la aplicación a cada persona?",
                "answer": "No. Empieza por sus responsabilidades, deja un camino para aprender más y controla permisos."
              },
              {
                "question": "¿Y si el personal prefiere papel?",
                "answer": "Investiga qué falla: conexión, claridad, accesibilidad, tiempo o confianza. No presupongas falta de interés."
              },
              {
                "question": "¿Cómo sé si sirvió la capacitación?",
                "answer": "Observa si el equipo puede realizar las tareas acordadas con menos errores y pedir ayuda cuando haga falta. Evita medir solo asistencia."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes y orientación",
        "paragraphs": [
          "Las necesidades de capacitación digital cambian por sector y organización. Los principios de lenguaje claro ayudan a explicar tareas."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "OCDE — Digitalización y competitividad de las pymes (2025)",
                "url": "https://www.oecd.org/en/publications/sme-digitalisation-for-competitiveness_197e3077-en.html",
                "scope": "Encuesta comparativa sobre necesidades de habilidades digitales y adopción en empresas participantes; no representa a todos los países ni garantiza un ahorro."
              },
              {
                "label": "W3C WAI — Escribir para que se entienda",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Orientaciones sobre títulos claros, párrafos breves y palabras comprensibles; no garantiza una certificación."
              },
              {
                "label": "NIST — Guía de ciberseguridad para pequeñas organizaciones",
                "url": "https://csrc.nist.gov/pubs/sp/1300/final",
                "scope": "Referencia voluntaria para considerar riesgos, accesos y recuperación; debe adaptarse a la actividad y las normas aplicables."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "cuando-necesita-tu-empresa-un-sistema-erp",
    "category": "Tecnología explicada",
    "title": "¿Qué es un ERP y cuándo necesita uno tu empresa?",
    "intro": "Ventas usa una hoja, almacén otra y administración vuelve a escribir los mismos datos. Tal vez necesites conectar procesos. Pero comprar un programa enorme antes de ordenar el trabajo puede complicarlo más.",
    "excerpt": "Descubre qué es un ERP con ejemplos de compras, almacén y finanzas, cómo se diferencia de un CRM y cómo decidir si conviene implementarlo.",
    "enPocasPalabras": [
      "Un ERP ayuda a coordinar información y procesos internos, como compras, inventario o finanzas.",
      "No es lo mismo que un CRM para relaciones con clientes, ni reemplaza necesariamente todos tus sistemas.",
      "Antes de contratar uno, define procesos, responsables, datos que deben coincidir y el costo completo de cambiar."
    ],
    "image": "/assets/learn/diagram-erp.svg",
    "imageAlt": "Tres áreas de la empresa —compras, almacén y administración— comparten información para coordinar el trabajo.",
    "editorialDraft": true,
    "relatedSlugs": [
      "como-elegir-herramientas-digitales-sin-llenar-la-empresa-de-aplicaciones",
      "conectar-herramientas-digitales-sin-complicar-tu-negocio"
    ],
    "cta": {
      "label": "Identificar qué necesita tu negocio",
      "to": "/diagnostico",
      "copy": "Entiende primero cómo están funcionando tus procesos y qué problema hay que resolver."
    },
    "sections": [
      {
        "heading": "La misma información escrita tres veces",
        "paragraphs": [
          "Imagina una empresa que recibe un pedido. Ventas avisa por mensaje; almacén lo anota en su tabla y administración registra el movimiento al final del día.",
          "Si alguien modifica una cantidad y olvida avisar, cada área puede terminar con una versión diferente. Coordinar esas versiones es uno de los problemas que un sistema de gestión empresarial puede ayudar a resolver."
        ]
      },
      {
        "heading": "ERP sin palabras complicadas",
        "paragraphs": [
          "ERP son las siglas en inglés de un sistema para planificar y organizar recursos de una empresa. Puedes pensarlo como un conjunto de herramientas que comparten reglas y datos de trabajo."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "ERP (gestión empresarial)",
                "definition": "Sistema que puede conectar operaciones internas como compras, existencias, producción, finanzas y otros procesos, según el producto."
              },
              {
                "term": "CRM (relación con clientes)",
                "definition": "Herramienta para ordenar contactos, consultas, oportunidades y conversaciones comerciales. No es lo mismo que llevar el almacén o la contabilidad."
              },
              {
                "term": "Integración",
                "definition": "Conexión controlada que permite que dos herramientas intercambien datos, sin obligarte siempre a reemplazarlas."
              },
              {
                "term": "Módulo",
                "definition": "Parte de un sistema dedicada a una tarea, como compras o inventario. No todas las empresas necesitan instalar todas las partes."
              }
            ]
          }
        ]
      },
      {
        "heading": "Cuándo puede ayudar de verdad",
        "paragraphs": [
          "La complejidad se nota cuando un error en un área afecta a otras."
        ],
        "bullets": [
          "Se registra el mismo pedido en varios lugares y aparecen diferencias.",
          "Compras y almacén no pueden saber con claridad qué está pendiente de recibir.",
          "Los equipos pierden tiempo reconciliando datos antes de tomar decisiones.",
          "Varias sedes necesitan reglas y cifras consistentes, con permisos adecuados."
        ]
      },
      {
        "heading": "Ejemplo: una distribuidora con dos almacenes",
        "paragraphs": [
          "Situación ficticia para comparar opciones."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "El pedido que pasó por cuatro manos",
            "hypothetical": true,
            "context": "Una distribuidora atiende pedidos que salen de dos almacenes.",
            "problem": "Ventas confirma existencias con un mensaje, el almacén prepara el pedido y administración no conoce el cambio hasta más tarde.",
            "approach": "El equipo define datos y responsabilidades comunes antes de comparar sistemas.",
            "actions": [
              "Identifica dónde se crea el pedido y quién puede modificarlo.",
              "Define cuándo se descuenta la existencia: reserva, preparación o entrega, según el proceso real.",
              "Prueba cómo una corrección de cantidad llega a almacén y administración."
            ],
            "lesson": "Un sistema ayuda si refleja el proceso real; no si solo digitaliza las confusiones."
          }
        ]
      },
      {
        "heading": "No toda empresa necesita un ERP",
        "paragraphs": [
          "Si los procesos son pocos, las herramientas actuales se entienden y las diferencias se detectan rápido, quizá puedas seguir con un control sencillo.",
          "Con varios equipos, almacenes o procesos ligados, puede tener sentido evaluar un ERP, una integración entre sistemas o módulos separados. La decisión depende de las tareas reales, el presupuesto y las capacidades de mantenimiento.",
          "Un ERP no garantiza cumplimiento contable o fiscal. Esas obligaciones dependen de tu país, el proveedor, la configuración y la revisión profesional."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "caution",
            "title": "No confundas «un solo sistema» con «acceso para todos»",
            "text": "Comprueba los permisos por sede, área, empresa y tipo de dato. Un grupo empresarial puede necesitar reportes comunes y seguir manteniendo información separada."
          }
        ]
      },
      {
        "heading": "Las preguntas que debes hacer antes de contratar",
        "paragraphs": [
          "Una demostración brillante no muestra por sí sola si el sistema encaja con tu trabajo."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Preguntas para una evaluación inicial",
            "items": [
              {
                "title": "Describe el problema actual",
                "detail": "Explica tres situaciones reales donde se duplican datos o faltan controles."
              },
              {
                "title": "Anota qué información debe coincidir",
                "detail": "Producto, pedido, proveedor, cantidades, fechas y responsables, según el proceso."
              },
              {
                "title": "Pregunta por configuración y capacitación",
                "detail": "Quién migrará datos, corregirá errores y enseñará al equipo."
              },
              {
                "title": "Calcula el costo completo",
                "detail": "Incluye licencias, puesta en marcha, integraciones, soporte y cambios posteriores."
              },
              {
                "title": "Prueba una operación de principio a fin",
                "detail": "Desde un pedido ficticio hasta una corrección, comprobando permisos y resultados."
              },
              {
                "title": "Aclara cómo recuperar la información",
                "detail": "Pregunta por exportación, cancelación, continuidad y alternativas si el proveedor falla."
              }
            ]
          }
        ]
      },
      {
        "heading": "Una prueba simple para comparar opciones",
        "paragraphs": [
          "Pide a dos personas de áreas distintas que describan cómo se hace hoy un pedido y cómo debería hacerse. Anota dónde vuelven a copiar lo mismo o dónde la información no coincide.",
          "Si la diferencia es solo que falta acordar un responsable, empezar por un ERP no siempre será la solución."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Ordena el proceso y sus datos antes de evaluar productos.",
              "Distingue gestión interna, relaciones con clientes e integraciones.",
              "Haz una prueba pequeña con costos y salida claros antes de cambiar toda la operación."
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
                "question": "¿ERP y CRM son lo mismo?",
                "answer": "No. Uno suele coordinar operaciones internas y el otro relaciones comerciales. Algunos proveedores los integran, pero mantienen funciones diferentes."
              },
              {
                "question": "¿Un ERP debe gestionar todas mis áreas?",
                "answer": "No necesariamente. Hay sistemas modulares y herramientas especializadas que pueden integrarse. Evalúa qué necesitas."
              },
              {
                "question": "¿Puedo manejar varias empresas en un solo ERP?",
                "answer": "Depende de las funciones, permisos, separación de datos y requisitos legales. Debes comprobarlo antes de contratar."
              },
              {
                "question": "¿Un ERP reemplaza la contabilidad profesional?",
                "answer": "No. Puede registrar información, pero el cumplimiento normativo y las decisiones contables requieren criterios aplicables y responsables competentes."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para profundizar",
        "paragraphs": [
          "La documentación del fabricante es un ejemplo de cómo se describen estas soluciones; no constituye una recomendación de compra."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "Microsoft Learn — Introducción a sistemas de finanzas y operaciones",
                "url": "https://learn.microsoft.com/en-us/training/modules/dynamics-365-introduction/1-introduction",
                "scope": "Formación de un proveedor sobre planificación de recursos empresariales; se usa para comprender conceptos, no recomendar su producto como única opción."
              },
              {
                "label": "OCDE — Digitalización y competitividad de las pymes (2025)",
                "url": "https://www.oecd.org/en/publications/sme-digitalisation-for-competitiveness_197e3077-en.html",
                "scope": "Encuesta comparativa sobre necesidades de habilidades digitales y adopción en empresas participantes; no representa a todos los países ni garantiza un ahorro."
              },
              {
                "label": "NIST — Guía de ciberseguridad para pequeñas organizaciones",
                "url": "https://csrc.nist.gov/pubs/sp/1300/final",
                "scope": "Referencia voluntaria para considerar riesgos, accesos y recuperación; debe adaptarse a la actividad y las normas aplicables."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "como-empezar-proyecto-digital-sin-detener-negocio",
    "category": "Gestión y equipos",
    "title": "¿Quieres mejorar un proceso digital? Empieza con una prueba pequeña",
    "intro": "«Vamos a cambiar todos los programas el lunes». Parece decidido, pero puede dejar al equipo sin saber cómo trabajar si algo falla. Una prueba pequeña y reversible suele enseñar más que un cambio general sin preparación.",
    "excerpt": "Aprende a iniciar proyectos digitales con una meta clara, personas responsables, costos, una prueba controlada y un plan para volver atrás.",
    "enPocasPalabras": [
      "Empieza por un problema real y define cómo notarías una mejora.",
      "Prueba con un proceso o equipo, usando datos de ejemplo y una salida segura.",
      "Escucha a quienes hacen el trabajo y amplía solo cuando haya evidencia suficiente."
    ],
    "image": "/assets/learn/diagram-proyecto-digital.svg",
    "imageAlt": "Un proyecto digital avanza en tres etapas: elegir problema, probar con un equipo y decidir qué ajustar.",
    "editorialDraft": true,
    "relatedSlugs": [
      "como-elegir-herramientas-digitales-sin-llenar-la-empresa-de-aplicaciones",
      "como-capacitar-al-equipo-en-herramientas-digitales"
    ],
    "cta": {
      "label": "Empezar por un diagnóstico",
      "to": "/diagnostico",
      "copy": "Antes de invertir o cambiar herramientas, conviene aclarar qué problema estás tratando de resolver."
    },
    "sections": [
      {
        "heading": "El anuncio que entusiasma a la dirección y preocupa al equipo",
        "paragraphs": [
          "Una empresa quiere cambiar su forma de atender pedidos y anuncia que desde el lunes todo se hará en un programa nuevo. El equipo no sabe cómo registrar devoluciones; nadie ha probado qué ocurre si se corta internet.",
          "La intención puede ser buena. Lo que falta es convertirla en una mejora que se pueda probar y corregir."
        ]
      },
      {
        "heading": "Un proyecto digital empieza con una pregunta",
        "paragraphs": [
          "En lugar de «queremos digitalizarlo todo», prueba «¿cómo evitamos registrar dos veces el mismo pedido?» o «¿cómo sabemos qué consultas siguen sin respuesta?».",
          "Cuanto más concreta sea la pregunta, más fácil será comprobar si la solución ayuda."
        ],
        "blocks": [
          {
            "type": "definitions",
            "items": [
              {
                "term": "Objetivo",
                "definition": "Cambio que quieres conseguir, explicado con palabras que cualquiera entienda."
              },
              {
                "term": "Prueba piloto",
                "definition": "Experimento limitado con un grupo o proceso, antes de cambiar toda la empresa."
              },
              {
                "term": "Indicador",
                "definition": "Señal observable de si el trabajo mejora; por ejemplo, diferencias detectadas, tiempo de respuesta o errores."
              },
              {
                "term": "Plan de vuelta atrás",
                "definition": "Pasos preparados para continuar trabajando si la prueba falla o necesita detenerse."
              }
            ]
          }
        ]
      },
      {
        "heading": "Seis pasos para empezar sin paralizar el negocio",
        "paragraphs": [
          "Elige una tarea que puedas observar de principio a fin."
        ],
        "blocks": [
          {
            "type": "steps",
            "label": "Ruta de un proyecto pequeño",
            "items": [
              {
                "title": "Describe el problema con un ejemplo",
                "detail": "Qué ocurrió, quién lo notó y qué consecuencia tuvo."
              },
              {
                "title": "Habla con quienes hacen la tarea",
                "detail": "Pregunta dónde se atascan; evita diseñar solo desde una oficina."
              },
              {
                "title": "Decide qué medir",
                "detail": "Elige una o dos señales, sin prometer resultados antes de observarlos."
              },
              {
                "title": "Prepara una prueba segura",
                "detail": "Usa datos ficticios y controla permisos. Reserva un proceso de respaldo si el trabajo es crítico."
              },
              {
                "title": "Recoge lo que aprendió el equipo",
                "detail": "Revisa errores, esfuerzo y excepciones que la herramienta no resolvió."
              },
              {
                "title": "Decide continuar, ajustar o detener",
                "detail": "No extiendas el cambio solo porque ya se pagó una licencia."
              }
            ]
          }
        ]
      },
      {
        "heading": "Ejemplo: una empresa con varias oficinas",
        "paragraphs": [
          "Caso hipotético para mostrar cómo limitar un cambio."
        ],
        "blocks": [
          {
            "type": "example",
            "title": "Una sola oficina prueba el nuevo registro de consultas",
            "hypothetical": true,
            "context": "Tres oficinas reciben consultas por correo y teléfono.",
            "problem": "La dirección quiere que todas usen de inmediato un sistema nuevo, pero no sabe si permite repartir responsables.",
            "approach": "Una oficina prueba con casos ficticios y un grupo pequeño, mientras se mantiene un procedimiento de respaldo.",
            "actions": [
              "Preparan cinco consultas de ejemplo, incluidas una repetida y una urgente.",
              "Comprueban asignación, permiso, corrección y devolución de una consulta.",
              "Anotan dificultades y deciden qué cambiar antes de incorporar otras oficinas."
            ],
            "lesson": "La prueba no demuestra resultados de negocio, pero descubre fallos antes de afectar a todos."
          }
        ]
      },
      {
        "heading": "Cuando el proyecto afecta varias sedes o marcas",
        "paragraphs": [
          "Si hay más equipos, define quién aprueba el cambio, quién administra accesos y cómo se conservará el origen de los datos.",
          "En un grupo de empresas, revisar informes comunes no significa permitir que cada negocio consulte registros privados del otro. Un piloto debe comprobar los límites entre unidades.",
          "En procesos críticos —por ejemplo, pagos, salud, nóminas o datos personales— el riesgo puede exigir especialistas, comprobaciones adicionales y un plan de continuidad antes de cualquier prueba."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "caution",
            "title": "Una prueba pequeña no es permiso para usar datos reales sin control",
            "text": "Evita conectar información sensible o enviar mensajes de verdad durante un experimento si no hay una necesidad legítima y controles suficientes."
          }
        ]
      },
      {
        "heading": "Cómo saber si merece la pena continuar",
        "paragraphs": [
          "Compara lo que observaste con lo que buscabas resolver. Pregunta qué nuevos problemas aparecieron y cuánto tiempo se necesita para mantener el cambio.",
          "Una prueba puede terminar con la conclusión «no conviene todavía». Eso también es aprender y puede evitar una inversión innecesaria."
        ],
        "blocks": [
          {
            "type": "summary",
            "items": [
              "Escoge un problema medible y cercano al trabajo real.",
              "Prepara la prueba con apoyo, protección de datos y alternativa segura.",
              "Decide el siguiente paso según lo aprendido, no según la presión por lanzar."
            ]
          }
        ]
      },
      {
        "heading": "Tu primer proyecto en una página",
        "paragraphs": [
          "Escribe una frase por cada pregunta: ¿qué problema resolveremos?, ¿quién participará?, ¿qué cambiaremos durante la prueba?, ¿qué dato observaremos?, ¿cómo seguiremos trabajando si falla? y ¿quién decide el resultado?",
          "Si el equipo no puede responderlas, quizá todavía falte preparación. No necesitas una presentación enorme para empezar."
        ],
        "blocks": [
          {
            "type": "callout",
            "tone": "tip",
            "title": "Escucha a quien usa la herramienta",
            "text": "El comentario más útil puede venir de la persona que atiende el teléfono o registra mercancía cada día."
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
                "question": "¿Cuánto debe durar una prueba?",
                "answer": "No hay una duración universal. Debe permitir observar tareas suficientes y excepciones importantes sin exponer al negocio innecesariamente."
              },
              {
                "question": "¿Necesito cambiar toda la empresa para probar?",
                "answer": "No. Una función, sede o equipo puede servir, siempre que la prueba represente el trabajo real y sea segura."
              },
              {
                "question": "¿Qué hago si la prueba funciona, pero al equipo le cuesta usarla?",
                "answer": "Revisa formación, accesibilidad, esfuerzo y excepciones. La adopción es parte del resultado, no un detalle para después."
              }
            ]
          }
        ]
      },
      {
        "heading": "Fuentes para profundizar",
        "paragraphs": [
          "Estas guías públicas recomiendan comprender a las personas, probar en pequeño y mejorar con evidencia. No garantizan éxito ni sustituyen normas del sector."
        ],
        "blocks": [
          {
            "type": "sources",
            "items": [
              {
                "label": "GOV.UK — Principios de trabajo iterativo",
                "url": "https://www.gov.uk/service-manual/agile-delivery/core-principles-agile",
                "scope": "Pautas de trabajo centrado en necesidades, entrega pequeña, comentarios de usuarios y mejora continua; no certifica resultados empresariales."
              },
              {
                "label": "GOV.UK — Cómo funciona una fase piloto",
                "url": "https://www.gov.uk/service-manual/agile-delivery/how-the-beta-phase-works",
                "scope": "Explica cómo probar con grupos limitados y mejorar antes de ampliar un servicio; su contexto es la administración pública británica."
              },
              {
                "label": "OCDE — Digitalización y competitividad de las pymes (2025)",
                "url": "https://www.oecd.org/en/publications/sme-digitalisation-for-competitiveness_197e3077-en.html",
                "scope": "Encuesta comparativa sobre necesidades de habilidades digitales y adopción en empresas participantes; no representa a todos los países ni garantiza un ahorro."
              },
              {
                "label": "W3C WAI — Escribir para que se entienda",
                "url": "https://www.w3.org/WAI/tips/writing/",
                "scope": "Orientaciones sobre títulos claros, párrafos breves y palabras comprensibles; no garantiza una certificación."
              }
            ]
          }
        ]
      }
    ]
  }
];
