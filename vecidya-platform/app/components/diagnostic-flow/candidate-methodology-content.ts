export const CANDIDATE_METHODOLOGY_IDENTITY_V3 = "diagnostic-methodology-3.0" as const;

export const CANDIDATE_METHODOLOGY_SECTIONS_V3 = [
  {
    id: "scope",
    title: "Qué evalúa Vecidya",
    summary: "El diagnóstico ordena evidencia sobre presencia digital, desde la claridad de la propuesta hasta la forma de medir y mejorar. La lectura describe lo que las respuestas permiten observar; no es una auditoría de todos los activos del negocio.",
    points: [
      "Las áreas dependen del tipo de actividad y de la etapa declarada. Una dimensión que no aplica o todavía no tiene contexto suficiente no se convierte en un cero.",
      "El resultado usa las respuestas activas que el plan adaptativo considera válidas. Las respuestas que dejaron de aplicar después de una edición no participan en el cálculo.",
    ],
  },
  {
    id: "adaptive",
    title: "Cómo funciona el cuestionario adaptativo",
    summary: "El cuestionario adaptativo selecciona preguntas según el contexto y la información que puede aportar cada respuesta. Puede terminar cuando no quedan preguntas útiles o cuando alcanza sus límites.",
    points: [
      "No todos los recorridos contienen las mismas preguntas ni evalúan cada área con igual profundidad.",
      "Una pregunta pertinente que no se hizo por presupuesto o límite de ruta permanece como límite de evidencia; no se interpreta como una respuesta negativa.",
    ],
  },
  {
    id: "score",
    title: "Qué significa la puntuación",
    summary: "Cuando hay evidencia suficiente, el porcentaje general resume las dimensiones con lectura mediante el modelo certificado. MAL, REGULAR y BIEN nombran bandas de ese índice; no miden el valor del negocio ni garantizan resultados.",
    points: [
      "El porcentaje, la confianza, las prioridades y la cobertura son lecturas distintas. La confianza no multiplica ni modifica la puntuación.",
      "Antes del lanzamiento, o cuando no se alcanza el mínimo de evidencia, el índice y la banda no existen: la interfaz los deja sin porcentaje y explica por qué.",
    ],
  },
  {
    id: "confidence",
    title: "Qué significa la confianza",
    summary: "La confianza expresa cuánta y qué tipo de evidencia sostiene las lecturas. No es una probabilidad de éxito ni una validación estadística de resultados empresariales.",
    points: [
      "La confianza general y la confianza de cada dimensión se presentan junto a su lectura, sin convertir una duda en una debilidad.",
      "Una lectura provisional conserva su banda cuando existe; las advertencias explican lo que conviene confirmar.",
    ],
  },
  {
    id: "coverage",
    title: "Qué áreas se pudieron evaluar",
    summary: "El informe distingue entre las áreas que corresponden a tu contexto, las que podían evaluarse en el recorrido y las que cuentan con respuestas útiles.",
    points: [
      "La cobertura incluye solo las áreas que corresponden al contexto y podían evaluarse en ese recorrido. Una cobertura completa de esas áreas no significa que se haya revisado todo el negocio.",
      "El informe distingue entre falta de preguntas pertinentes, contexto insuficiente, respuestas desconocidas o no aplicables, y áreas que quedaron sin preguntar por los límites del recorrido.",
      "Una respuesta desconocida o no aplicable no cuenta como capacidad ni como dificultad.",
    ],
  },
  {
    id: "priorities",
    title: "Cómo se detectan las prioridades",
    summary: "Las prioridades y su orden proceden de las restricciones, objetivos, dependencias y evidencia que calcula el motor candidato. Un porcentaje bajo, por sí solo, no elige qué atender primero.",
    points: [
      "Cuando varias preguntas observan un mismo aspecto, la lectura conserva las diferencias respaldadas entre sus respuestas.",
      "Una prioridad pendiente de confirmación se presenta como tal antes de recomendar una intervención.",
    ],
  },
  {
    id: "recommendations",
    title: "Recomendaciones y opciones comerciales",
    summary: "Las recomendaciones, las soluciones y la relación comercial de Vecidya son salidas separadas del motor. La licencia puede ser ninguna cuando la evidencia aún no la justifica.",
    points: [
      "Si una recomendación necesita confirmación previa, se indica esa condición. Cuando no existe una solución respaldada, se muestra que no hay una correspondencia justificada.",
      "La licencia y las ofertas se muestran según el contrato comercial candidato y su certeza. No cambian el índice, las dimensiones ni el orden de prioridades.",
    ],
  },
  {
    id: "limits",
    title: "Límites del diagnóstico",
    summary: "La candidata cuenta con certificaciones deterministas del código y sus contratos. Eso prueba reproducibilidad y consistencia interna; no prueba validez predictiva con resultados empresariales reales.",
    points: [
      "La evaluación depende de las respuestas y no inspecciona perfiles, sitios, cuentas ni datos externos por su cuenta.",
      "El recorrido puede dejar incertidumbres, áreas sin evidencia y dimensiones no observables. Conviene confirmar esos límites antes de tomar decisiones.",
    ],
  },
] as const;

export const CANDIDATE_METHODOLOGY_REPORT_NOTES_V3 = [
  "Resultado calculado a partir de las respuestas activas de esta sesión.",
  "Cuando varias preguntas observan un mismo aspecto, el resultado conserva las diferencias entre sus respuestas.",
  "La cobertura se limita a las áreas evaluables en este contexto; no equivale a una revisión completa del negocio.",
  "Las dudas y los límites de información se explican sin tratarlos como respuestas negativas.",
] as const;

export const CANDIDATE_METHODOLOGY_LIMITATIONS_V3 = [
  "Se basa en respuestas declaradas y no inspecciona por su cuenta activos o resultados del negocio.",
  "La certificación determinista confirma consistencia del motor, no validación estadística ni capacidad predictiva con resultados empresariales reales.",
  "Una cobertura completa de las dimensiones observables no equivale a una evaluación exhaustiva del negocio.",
  "Una pregunta no realizada por límite de preguntas deja un punto sin confirmar; las respuestas desconocidas o no aplicables tampoco son puntuaciones negativas.",
] as const;
