# V9 — CLASS-02: frontera de generación de señales del motor
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Evidencia focal
qbv2-engine.ts blob 3ee64669b626c954495d5b194da6e07a42f252d1, líneas 46–69. deriveSignalsV2(activeAnswers, bank) construye mapa por question.id del banco inyectado; ignora respuestas sin pregunta en el banco; excluye preguntas con contradictionRole.type=confirms; selecciona opciones por valor de respuesta y agrega exclusivamente option.produces; entrega entradas a foldSignalProductions. resolveWithNicheHints toma el resultado, calcula pistas de nicho si hay declaredNicheId y llama resolveDiagnosticContext(signals,nicheHints).

## Implicaciones para CLASS-02
- No se detectó en esta ruta generación espontánea de secondaryMonetizationMechanism: requiere un option.produces que indique monetizationMechanism con slot secondary.
- La existencia del tipo secondary y de la rama hybrid en el resolvedor no prueba disponibilidad en la entrevista.
- El banco es parámetro de deriveSignalsV2: el comportamiento depende de qué banco sea inyectado; no extrapolar V8 a V9.
- Las confirmaciones de contradicción se conservan para su rol semántico, pero no reescriben contexto por esta vía.
- La resolución de pistas de nicho no se debe confundir con un productor de monetización.

## Alcance y límite
Inspección de una ruta focal del motor; no es un censo exhaustivo de todos los puntos de entrada ni de inyecciones directas de DiagnosticSignalsV3. No se ejecutaron pruebas ni se verificó comportamiento runtime.

## Criterios pendientes
1. Identificar todos los callers de resolveDiagnosticContext y foldSignalProductions.
2. Distinguir fixtures/tests de caminos productivos que inyectan señales manualmente.
3. Verificar que el registro productivo y bancos candidatos no se mezclan al restaurar sesiones.
4. Definir casos de aceptación de señales secundarias y conflictos solo después de cerrar censo.

## Changelog
0.1.0: cadena de producción de señales en qbv2-engine y límites del banco inyectado.