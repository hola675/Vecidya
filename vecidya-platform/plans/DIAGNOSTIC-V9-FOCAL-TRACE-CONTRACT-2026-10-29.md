# V9 — Contrato de trazas focales para cierre

PLAN_ONLY · v1.0.0 · 2026-10-29

## Objetivo
Definir una sola evidencia de cierre por escenario, reutilizando el banco candidato V9 y el evaluador existente. No crear un segundo motor ni inferir aprobaciones editoriales.

## Datos mínimos de una traza futura
- Escenario e identificador estable.
- Respuestas de clasificación, actividad, historial, nicho y objetivos.
- Contexto resuelto, incluido estado unresolved.
- Preguntas elegibles, preguntas seleccionadas y motivo de exclusión.
- Resultado de appliesWhen y materialAppliesWhen mediante evaluateRuleV2Trace.
- Sustitución especializada o genérica, cuando proceda.
- Evidencia por dimensión, respuestas neutrales y abstenciones.
- Presupuesto de preguntas, incluyendo consentimiento si supera 24.

## Casos prioritarios
C03: actividad pausada; comprobar que no se exigen mediciones de actividad actual y que la pausa no se convierte en debilidad digital.
C05: organización operativa sin donaciones ni cuotas; verificar exclusión de preguntas de donación y membresía, y cobertura alternativa de participación.
C08: restaurante operativo sin presencia digital fiable; comprobar que las preguntas de claridad condicionadas a presencia no generan un falso negativo.
C07: comercio electrónico con carrito visible y sin contacto autorizado; la respuesta no_authorized_contact de q2_ecommerce_cart_followup es not_applicable, no debilidad.

## Puerta de aceptación
No marcar un escenario como PASS hasta contar con recorrido real, dimensiones justificadas, abstenciones correctas y selección adaptativa dentro del presupuesto. Un grafo de dependencias o un inventario de 77 IDs no bastan.

## Fuentes
app/features/diagnostic/qbv2-rules.ts
app/features/diagnostic/qa03b/bank.ts
app/features/diagnostic/qa03b/specialty-candidate-bank.ts
app/features/diagnostic/qa03b/recovery-wave2.ts
app/features/diagnostic/qa03b/specialty-branches-wave1.ts

No se ejecutaron scripts, tests, CI, cambios de codigo ni despliegues.


## Matriz de aceptación focal — v1.1.0

La siguiente matriz especifica resultados **esperados para futura comprobación**, no resultados observados. Se mantiene el estado `ND` hasta ejecutar una traza autorizada.

| Caso | Entrada focal | Condición de aceptación | Evidencia exigida | Estado |
|---|---|---|---|---|
| C03 | `q2_operational_status` pausado; historial sí | Excluir preguntas exclusivas de actividad actual; no deducir baja madurez por pausa | Lista de elegibles/excluidas y estado por dimensión | ND |
| C05 | `q2_entity=organization`, operativa, apoyo sin donaciones/cuotas | No activar preguntas de donaciones o membresía por defecto; verificar vía alternativa de participación | Guardias de `q2_nonprofit_donation_clarity` y `q2_nonprofit_membership_lifecycle` y evidencia alternativa | ND |
| C07 | Ecommerce activo, carrito visible, contacto no autorizado | `q2_ecommerce_cart_followup` puede ser elegible, pero `no_authorized_contact` se interpreta `not_applicable` | Regla, opción y evidencia `relationship_recurrence` sin penalización | ND |
| C08 | Restaurante activo, sin presencia digital fiable/parcial | No forzar menú online ni calificar ausencia de canal como claridad débil | Guardias de `q2_food_menu_visibility` y `q2_presence_offer_clarity`; alternativa o abstención | ND |

### Reglas de decisión

- **PASS:** traza real demuestra elegibilidad, selección, mapeo y suficiencia o abstención honesta, dentro del presupuesto.
- **FAIL:** la traza muestra pregunta improcedente, penalización de neutral, mapeo incorrecto o violación del presupuesto.
- **ND:** falta recorrido ejecutado, o hay incertidumbre de alcance; una lectura estática no basta.
- **HOLD editorial:** decisión humana pendiente sobre redacción, semántica o pregunta adicional. Puede coexistir con ND técnico.

### Orden de cierre sin duplicaciones

1. Resolver decisiones editoriales específicas de C03/C05/C08 a partir de preguntas existentes, sin asumir que hay que añadir una pregunta.
2. Preparar las entradas y aserciones de prueba **focal** para estos cuatro casos, sin ejecutarlas bajo PLAN_ONLY.
3. Tras autorización, usar `evaluateRuleV2Trace` y el selector real, registrar trazas y certificar dimensiones individualmente.
4. Extender el mismo contrato a C01, C02, C04, C06, C09 y C10, sin abrir otro sistema de seguimiento.

### Changelog

- v1.1.0: matriz de aceptación C03/C05/C07/C08 y estados PASS/FAIL/ND/HOLD. Solo documentación.


## Decisiones editoriales condicionadas — v1.2.0

Estas decisiones son de **planificación**, no modificaciones aprobadas del banco ni certificación de cobertura.

| Caso | Decisión | Motivo y fuente | Condición para desbloquear |
|---|---|---|---|
| C03 | HOLD: no introducir pregunta de pausa todavía | `qa03b/bank.ts` restringe preguntas de proceso a `operating` y varias de historial a `operating+has_customers`. No hay prueba de que otras preguntas no cubran comunicación de pausa. | Traza del escenario y auditoría de evidencia alternativa; si falta, redactar propuesta neutral de información/consulta durante pausa. |
| C05 | KEEP guardias; HOLD cobertura de participación | `qa03b/specialty-candidate-bank.ts` condiciona `q2_nonprofit_donation_clarity` a `donations/mixed`; `qa03b/recovery-wave2.ts` condiciona `q2_nonprofit_membership_lifecycle` a `membership_dues/mixed`. | Verificar preguntas de acceso/participación que no dependan de cuotas o donaciones; proponer extensión solo ante vacío probado. |
| C08 | KEEP semántica de menú para presencia existente; HOLD caso sin presencia | `qa03b/specialty-branches-wave1.ts` exige presencia fiable/parcial para `q2_food_menu_visibility`; `qa03b/bank.ts` también exige presencia para la pregunta genérica de claridad de oferta. | Rastrear otras preguntas de claridad independientes del canal; si no bastan, propuesta sobre claridad de oferta sin asumir web o menú publicado. |

### Salvaguardas editoriales

- La respuesta `not_applicable` de `q2_food_menu_visibility` no debe convertirse automáticamente en debilidad: su etiqueta actual puede confundirse con ausencia de presencia digital, aunque la pregunta requiere esa presencia.
- Las respuestas `unknown` y `not_applicable` se mantienen diferenciadas de `weak`; la abstención es preferible a una puntuación ficticia.
- Ninguna de estas decisiones autoriza añadir IDs, cambiar versiones, editar opciones o activar el banco candidato.
- El cierre técnico exige una traza ejecutada con el selector real y `evaluateRuleV2Trace`; bajo PLAN_ONLY solo se definen criterios.

### Changelog

- v1.2.0: decisiones condicionadas C03/C05/C08 y puertas explícitas para evitar ampliaciones innecesarias.


## Alternativas generales examinadas — v1.3.0

**Hallazgo nuevo para C08:** `q2_local_presence_consistency` (fuente `qbv2-reviewed-local-trust.ts`, blob `80645d149de368fd43a749d09a369bc1e8ec3d4a`) pregunta si quien busca el negocio encuentra datos correctos para ubicarlo/contactarlo. Su `appliesWhen` contempla actividad activa y arquetipos local/retail/hospitality, sin exigir una respuesta previa de presencia digital. Por ello es **alternativa candidata de observación de presencia/contacto**, pero **NO sustituto demostrado de claridad de oferta**. La definición revisada marca `evidenceMigration: pending`; verificar su transformación en la capa V3 antes de atribuirle evidencia puntuable.

La pregunta `q2_presence_digital_base` (fuente `qbv2-reviewed-transversal.ts`, blob `8a389afb1fea1786ac99c553175dcdb3a56ca361`) contiene la respuesta `no_reliable_presence` y la salida neutral `not_applicable`, pero su elegibilidad original excluye `physicalCoverage` en ciertos perfiles activos; `qa03b/bank.ts` modifica su `appliesWhen`. **No afirmar** que esté disponible para C08 sin resolver el contexto y la regla final.

`q2_presence_offer_clarity` sí depende materialmente de presencia `reliable_presence/partial_presence` en `qa03b/bank.ts`. La pregunta especializada `q2_food_menu_visibility` también exige esa presencia en `qa03b/specialty-branches-wave1.ts`. Por tanto, **C08 conserva HOLD sobre claridad de oferta**, aunque existe una alternativa de observación de presencia/contacto.

**C03:** `q2_local_presence_consistency` requiere actividad activa, de modo que no cubre comunicación durante pausa. `q2_presence_digital_base` también está restringida a actividad activa o prelaunch por la capa QA03B. No deducir cobertura de pausa de estas preguntas.

**C05:** las preguntas de presencia general pueden ser candidatas para encontrar/contactar la organización, pero ninguna de las dos citadas demuestra por sí sola un mecanismo de participación. Se conserva HOLD sobre participación sin cuotas/donaciones.

### Decisión de cierre de esta revisión

- C08: **alternativa parcial identificada**, no cobertura certificada.
- C03 y C05: **sin sustituto general suficiente demostrado** en los archivos revisados.
- No agregar preguntas ni aprobar dimensiones sin revisar la evidencia V3 final y el selector adaptativo.
- Próximo análisis focal: cotejar `q2_local_presence_consistency` y `q2_presence_digital_base` contra `qbv2-reviewed-evidence.ts` y las transformaciones QA03B; después decidir si existe vacío real.

### Changelog

- v1.3.0: inspección focal de alternativas generales para C03/C05/C08; distingue presencia/contacto de claridad de oferta y participación.


## Verificación de evidencia V3 para presencia — v1.4.0

Fuente directa: `app/features/diagnostic/qbv2-reviewed-evidence.ts`, blob `d3bb5edc0b504dd0257a73fccadf38dbc777540e`. Copia editorial: `qa03b/editorial-copy.ts`, blob `4f600136c6761669e99a2d9f9302afb0f084d195`. Guardias QA03B: `qa03b/bank.ts`, blob `b4772d73e1d8b5044ba2011088db978c364097f0`.

| ID | Versión | Dimensión y directness | Mapeo V3 relevante | Restricción para cierre |
|---|---:|---|---|---|
| `q2_local_presence_consistency` | 2 | `digital_foundation/direct` | `consistent=established`, `partial=partial`, `no=weak`, `unknown=uncertainty` | Su guardia original exige actividad activa y arquetipo local/retail/hospitality. No mide claridad de oferta. |
| `q2_presence_digital_base` | 2 | `digital_foundation/direct` | `reliable_presence=established`, `partial_presence=partial`, `no_reliable_presence=missing`, `not_applicable=not_applicable`, `unknown=uncertainty` | QA03B reemplaza `appliesWhen` por actividad activa o prelaunch. `missing` no equivale a `weak` ni autoriza extrapolar otras dimensiones. |
| `q2_presence_offer_clarity` | 2 | `clarity_positioning/direct` | `clear=established`, `partial=partial`, `unclear=weak`, `not_applicable=not_applicable`, `unknown=uncertainty` | QA03B condiciona `materialAppliesWhen` a presencia fiable/parcial; la rama especializada añade una exclusión cuando aplica la pregunta de menú. |

### Consecuencias por escenario

- **C08:** hay evidencia directa de `digital_foundation` disponible en el catálogo; `clarity_positioning` sigue sin sustituto demostrado cuando falta presencia digital. **HOLD**, no certificar ni agregar pregunta sin revisar el resto del banco.
- **C03:** la actividad pausada queda fuera de la guardia QA03B de `q2_presence_digital_base`; no usarla como evidencia de comunicación durante pausa. **HOLD**.
- **C05:** la existencia de un canal de contacto no demuestra que una persona pueda participar en actividades de la organización. **HOLD**.

### Regla de interpretación

Un mapeo V3 existente **no garantiza** que la pregunta sea seleccionada ni que una dimensión alcance suficiencia en un escenario. Mantener separadas identidad, elegibilidad, selección, respuesta y evidencia. No se ejecutaron trazas ni pruebas.

### Changelog

- v1.4.0: cotejo de mapeos V3 de las tres preguntas generales de presencia y consecuencias focales C03/C05/C08.


## Cotejo focal de claridad y acceso — v1.5.0

Fuentes: `qbv2-reviewed-evidence.ts` (blob `d3bb5edc0b504dd0257a73fccadf38dbc777540e`), `qa03b/specialty-candidate-bank.ts` (blob `0bc44cddc1dc2f03230bd5ece30847fce984a12b`), `qa03b/recovery-wave2.ts` (blob `59fe5898cc98ba243b4c898b027dd22f2c1153c9`).

### Claridad de oferta: C08

El catálogo R3 contiene mapeos directos de `clarity_positioning` para `q2_presence_offer_clarity`, `q2_retail_product_visibility` y `q2_professional_intake_flow`. El piloto QA03B añade `q2_startup_problem_clarity` y `q2_startup_offer_readiness`, también directos, pero **ambos requieren `preparing`**, por lo que no son sustitutos para un restaurante ya operativo. `q2_presence_offer_clarity` exige presencia digital fiable/parcial. Las otras dos preguntas R3 requieren cotejo de elegibilidad final antes de declarar sustitución; sus nombres o dimensiones no bastan para inferir cobertura.

**Decisión C08:** HOLD focal. No reutilizar una pregunta de startup para un restaurante operativo ni atribuir a presencia/contacto la semántica de claridad de oferta.

### Acceso y participación: C05

`q2_nonprofit_donation_clarity` y `q2_nonprofit_membership_lifecycle` tienen mapeo directo de `conversion_access`, pero guardias de `donations/mixed` y `membership_dues/mixed`, respectivamente. Una organización sin esos modelos no debe recibir estas preguntas por defecto ni perder puntos por no responderlas.

El catálogo R3 también contiene evidencia `conversion_access` en `q2_service_response_speed` y `q2_appointments_booking_friction`; su pertinencia para participación comunitaria **no está demostrada** y debe contrastarse con guardias y significado de las respuestas.

**Decisión C05:** HOLD focal. No equiparar captación de clientes, citas, donaciones o cuotas con participación comunitaria sin evidencia contextual.

### Condición común

Un mapeo a una dimensión es necesario, pero no suficiente: comprobar guardias, selección, semántica de la respuesta y presupuesto. Ninguna pregunta nueva queda aprobada. No hubo ejecución de tests ni trazas.

### Changelog

- v1.5.0: cotejo focal de candidatos de `clarity_positioning` y `conversion_access`, descartando sustituciones no justificadas.


## Descarte de sustitutos por semántica — v1.6.0

Inspección estática de `qbv2-reviewed-commerce.ts`, `qbv2-reviewed-local-appointments-professional.ts` y `qbv2-reviewed-evidence.ts`. Esta decisión se refiere al significado de las preguntas; no prueba selección del banco candidato.

| ID | Guardia/objeto original | Evidencia V3 | Decisión para casos críticos |
|---|---|---|---|
| `q2_retail_product_visibility` | `activeRetail` y objetivo `explain`; pregunta qué productos vende el comercio en internet | `clarity_positioning/direct` | **NO reutilizar automáticamente para C08**: restaurante hospitality sin presencia digital no equivale a retail y el texto presupone búsqueda en internet. |
| `q2_professional_intake_flow` | `activeProfessional`; pregunta claridad del siguiente paso al contratar a un profesional | `clarity_positioning/direct` | **NO sustituto para C08**: siguiente paso profesional no es claridad de menú/oferta gastronómica. Tampoco demuestra participación comunitaria C05. |
| `q2_service_response_speed` | `activeLocalService`; pregunta respuesta oportuna a nuevos contactos | `conversion_access/direct` | **NO sustituto universal para C05**: responder contactos de servicios no demuestra vía de participación de una organización sin cuotas/donaciones. |

### Resultado editorial

- **C08:** ninguna de las tres alternativas examinadas cierra el vacío de claridad de oferta para restaurante sin presencia digital. Mantener `HOLD`; preparar una **propuesta condicionada** de pregunta independiente de canal solo si la traza final confirma insuficiencia.
- **C05:** ninguna de estas alternativas prueba acceso a participación comunitaria. Mantener `HOLD`; preparar propuesta condicionada de participación/consulta sin cuotas ni donaciones solo tras verificar el resto del banco.
- **C03:** sin cambio; requiere revisión específica de comunicación durante pausa.
- **No crear ni activar nuevas preguntas en PLAN_ONLY.** Las propuestas no constituyen aprobación editorial, de evidencia ni de versión.

### Próxima puerta de cierre

1. Revisar la elegibilidad final y la evidencia restante de las 77 preguntas, no solo las coincidencias por nombre/dimensión.
2. Emitir un dictamen por C03/C05/C08: `EXISTING` (cobertura real), `ABSTAIN` (insuficiencia honesta) o `PROPOSE` (nueva pregunta con semántica propia).
3. Autorizar por separado cualquier cambio de banco y su batería focal.

### Changelog

- v1.6.0: descartes semánticos de tres falsos sustitutos; conserva HOLD y delimita propuestas.


## Dictamen provisional de cobertura — v1.7.0

**Alcance:** lectura estática de las guardias y de los mapeos V3 ya cotejados. Un dictamen `PROPOSE` aquí **no aprueba** una pregunta nueva: indica una hipótesis editorial para evaluación posterior. No se certifica selección ni suficiencia.

| Escenario | EXISTING (lo demostrado) | ABSTAIN (límite actual) | PROPOSE (solo si confirma traza) | Dictamen |
|---|---|---|---|---|
| C03 — pausado | El banco distingue estado operativo; preguntas de actividad actual tienen guardias que impiden extrapolarlas a pausa | No se demostró pregunta elegible sobre comunicación de estado/consulta durante pausa | Pregunta neutral sobre si las personas encuentran información actualizada durante la pausa | `ABSTAIN + PROPOSE condicionado` |
| C05 — organización sin donaciones ni cuotas | Las preguntas de donación y membresía respetan sus modelos específicos; existen observaciones de presencia/contacto, que no equivalen a participación | No se demostró evidencia directa de acceso a actividades o solicitudes de participación sin aportes económicos | Pregunta sobre cómo una persona puede participar o solicitar información, sin presuposición de venta/cuotas | `ABSTAIN + PROPOSE condicionado` |
| C08 — restaurante sin presencia digital | `q2_local_presence_consistency` y `q2_presence_digital_base` aportan mapeos de `digital_foundation`; las preguntas de menú y claridad online requieren condiciones propias | No se demostró cobertura elegible de `clarity_positioning` sin presencia digital; ausencia de canal no prueba oferta poco clara | Pregunta sobre si la oferta es comprensible mediante los canales que realmente utiliza, sin imponer web o menú digital | `ABSTAIN + PROPOSE condicionado` |

### Reglas para convertir el dictamen en decisión final

1. Verificar el banco V9 **compuesto**, no solo los archivos de origen; revisar si alguna otra pregunta aporta el mismo constructo con guardias válidas.
2. Resolver las guardias con contexto real y traza del selector: `appliesWhen`, `materialAppliesWhen`, sustituciones, presupuesto y orden.
3. Exigir evidencia V3 y opciones `unknown/not_applicable` semánticamente correctas; no penalizar la ausencia de actividad, donaciones, cuotas o presencia digital cuando no corresponda.
4. Si aparece cobertura suficiente: cambiar a `EXISTING` y **no** crear pregunta.
5. Si no aparece: elevar `PROPOSE` para aprobación editorial explícita, diseño ES/EN, identidad/versionado y pruebas focales futuras.
6. Si no se puede obtener evidencia válida sin sobrecargar el recorrido: mantener `ABSTAIN`, sin fabricar un score.

### Bloqueo real de cierre

El plan está listo para decidir **qué comprobar**, pero todavía **no** para declarar `PASS` en C03/C05/C08. Bajo PLAN_ONLY no se ejecutan las trazas. El siguiente trabajo documental debe consolidar decisiones pendientes y criterios de autorización, evitando nuevas revisiones circulares de los mismos tres casos.

### Changelog

- v1.7.0: dictámenes provisionales EXISTING/ABSTAIN/PROPOSE para C03/C05/C08 y puertas explícitas de resolución.


## Puerta única de autorización — v1.8.0

**Objetivo:** dejar de ampliar la planificación circular y preparar una ejecución focal que pueda producir decisiones finales verificables. Esta sección **no autoriza ni ejecuta** trabajo de implementación.

### Alcance exacto propuesto para una autorización futura

- Leer el banco compuesto `QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2` y reutilizar `buildCandidateEditorialMatrixV9`; prohibido reconstruir preguntas V8 o crear una matriz paralela.
- Instrumentar o reutilizar el selector real y `evaluateRuleV2Trace` para observar **solo C03, C05, C07 y C08**. Capturar respuestas, contexto resuelto, elegibilidad, selección, exclusiones, evidencia V3, abstenciones y presupuesto.
- Ejecutar **tests focalizados de esos casos y funciones afectadas**, más comprobaciones estáticas mínimas necesarias. No lanzar suite general, CI, despliegue, merge ni tocar módulos ajenos sin autorización independiente.
- Conservar las 77 identidades del candidato mientras no exista decisión editorial aprobada. No activar el candidato en producción ni modificar el flujo público por esta autorización.
- Registrar evidencia por caso con estado `PASS`, `FAIL` o `ND`; ninguna prueba aislada equivale a certificación integral de V9.

### Criterios de salida por caso

| Caso | Aserción focal imprescindible | Si no hay cobertura |
|---|---|---|
| C03 | La pausa no activa preguntas exclusivas de operación ni provoca puntuación débil por sí sola | `ABSTAIN` y propuesta de comunicación durante pausa |
| C05 | Donación y membresía quedan excluidas sin modelo correspondiente; participación no se infiere de ventas | `ABSTAIN` y propuesta de participación/consulta |
| C07 | `no_authorized_contact` se trata como `not_applicable`, sin penalización de seguimiento | Corregir interpretación solo con cambio autorizado |
| C08 | Ausencia de presencia digital no se traduce en debilidad de claridad de oferta; verificar alternativa válida | `ABSTAIN` y propuesta de claridad independiente de canal |

### Decisiones que la autorización focal NO incluye

1. Añadir las tres preguntas propuestas, cambiar versiones, opciones o mapeos V3.
2. Activar el banco V9 candidato en la sesión pública, Worker, scorer o producción.
3. Certificar C01–C10, aprobar la matriz editorial completa, generar cuatro variantes ES/EN o cerrar PR #162.
4. Ejecutar pruebas globales, CI, despliegues o refactorizaciones no relacionadas.

### Secuencia de cierre posterior

1. **Autorización explícita** de ejecución focal, con alcance anterior.
2. Trazas reales C03/C05/C07/C08 y evidencia reproducible asociada al SHA probado.
3. Dictamen `EXISTING/ABSTAIN/PROPOSE` definitivo por escenario; aprobar únicamente las preguntas nuevas que se demuestren necesarias.
4. Cierre editorial de las 77 identidades y escenarios restantes C01/C02/C04/C06/C09/C10, con pruebas focales por lote.
5. Revisión final de contrato de sesión/replay, privacidad, accesibilidad, ES/EN y activación separada; después, eventual decisión sobre PR y despliegue.

### Estado de la puerta

**READY_FOR_AUTHORIZATION (plan documental)**. **NOT_EXECUTED (pruebas)**. **NOT_CERTIFIED (producto)**. Mantener PLAN_ONLY hasta instrucción expresa.

### Changelog

- v1.8.0: puerta única de autorización, límites de pruebas focales y secuencia de cierre verificable.
