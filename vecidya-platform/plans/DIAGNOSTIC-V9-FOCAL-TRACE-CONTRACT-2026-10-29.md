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
