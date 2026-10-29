# V9 — Semántica de reglas para cierre de cobertura

PLAN_ONLY · v1.0.0 · 2026-10-29

Fuentes verificadas: `app/features/diagnostic/qbv2-rules.ts` (blob `ffca84ac10af29983a2ed82c3e6395e8302e794f`), `app/features/diagnostic/qa03b/bank.ts` (blob `b4772d73e1d8b5044ba2011088db978c364097f0`).

## Hallazgos de fuente

1. `AnswerRefV2` y `ContextRef` son capas distintas. `contextResolvedEquals` y `contextResolvedIn` requieren campo resuelto; `contextUnresolved` detecta lo contrario.
2. `evaluateRuleV2Trace` es el evaluador existente y devuelve resultado booleano con traza de subreglas. No crear un segundo evaluador.
3. `eq` compara una respuesta escalar exacta; `in` solo acepta respuesta de tipo string. Para multiselección existen `multiIntersects` y `multiExcluding`.
4. `archetypeIncludes` consulta componentes, no igualdad exacta con el arquetipo global. Importa para C09 híbrido.
5. `collectAnswerDependencies` y `collectContextDependencies` permiten documentar referencias, pero un grafo sintáctico no demuestra alcanzabilidad de una rama.
6. En `qa03b/bank.ts`, `evolve` añade `operating+history` a preguntas de interacción histórica, `operating` a procesos actuales y guardia de comprador B2B al módulo B2B. Aplica guardias tanto a `appliesWhen` como a `materialAppliesWhen` cuando existen.

## Criterio de cierre

Para C03, C05 y C08, no confundir referencia de respuesta, contexto resuelto y selección efectiva. Registrar en futuras trazas: respuestas, contexto resuelto, evaluación de cada guardia, preguntas seleccionadas, evidencia por dimensión y abstenciones. Para C09, probar componentes híbridos con `archetypeIncludes`.

El banco candidato V9 no es el flujo público activado. Este documento no ejecuta `evaluateRuleV2Trace` ni certifica escenarios. No hay cambios de código, tests, CI ni despliegue.
