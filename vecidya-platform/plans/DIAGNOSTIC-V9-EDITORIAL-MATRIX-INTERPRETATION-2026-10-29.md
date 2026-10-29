# V9 — Interpretación de la matriz editorial (PLAN_ONLY)

Versión 1.0.0 — 2026-10-29.

## Fuente canónica

Banco: `QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2` en `qa03b/specialty-branches-wave1.ts`, blob `ec605156f2e974d7b463f44ae76475f8ede1f0e9`. Contiene aserciones en código para 77 entradas y 77 IDs únicos; **no ejecutadas en esta auditoría**.

Matriz: `qa03b/v9-editorial-review-matrix.ts`, blob `5ce3b2520b4a9c4e569aa7a34962a008b46613ab`. La función `buildCandidateEditorialMatrixV9()` usa el banco candidato V9 y expone `rows` y `summary`.

## Salida existente y lectura correcta

Cada fila expone: `id`, `version`, `grade`, `module`, `prompt`, `hint`, `options`, `variants`, `answerDependencies`, `contextDependencies`, `evidenceMigration`, `structuralIssues`, `decision`, `decisionReason`, `nextAction`. Cada opción incluye `value`, `label`, `kind`, `exclusive`, `produces`, `readsAs` y `reviewFlags`.

El resumen ofrece `questions`, `options`, `variants`, `revised`, `semanticReview`, `pendingHumanReview`, `answersWithEvidence`, `answersWithoutEvidence` y `reviewFlags`. No se han obtenido valores de ejecución en esta revisión.

- `answersWithoutEvidence`: cuenta opciones sin `readsAs`, pero las preguntas de clasificación/enrutamiento pueden carecer legítimamente de evidencia de madurez.
- `neutral_with_evidence`: alerta para inspeccionar la lectura de una respuesta neutral; no demuestra penalización, pues puede mapear a `uncertainty` o `not_applicable`.
- `missing_evidence_mapping`: se genera para una pregunta `migrated` cuando alguna dimensión declarada carece de lectura para la opción; revisión prioritaria, sin presumir puntuación.
- `long_label`: umbral heurístico de 110 caracteres; no prueba mala comprensión.
- `ambiguous_choice`: heurística léxica; no prueba ambigüedad real.
- `grade`: auditoría estructural, no aprobación editorial.
- `pending_human_review`: valor predeterminado, no defecto confirmado.

## Cola de cierre

1. Materializar las 77 filas de la matriz existente, opciones completas y resumen con SHA; contrastar IDs y versiones contra el banco candidato.
2. Separar preguntas de clasificación/enrutamiento de preguntas con evidencia de madurez.
3. Revisar `missing_evidence_mapping` y después alertas neutrales, sin asignar debilidad a desconocimiento o no aplicabilidad.
4. Revisar las cuatro preguntas `needs_semantic_review`: `q2_demand_trend`, `q2_capacity_signal`, `q2_food_menu_visibility`, `q2_ecommerce_cart_followup`.
5. Mantener las cuatro `copy_revised` como redacción revisada, no aprobación cognitiva: `q2_monetization`, `q2_regularity`, `q2_buyer_recipient_relation`, `q2_reputation_flow`.
6. Contrastar C01–C10 y las ocho dimensiones con recorridos y suficiencia antes de certificar cobertura.
7. Después de cerrar el banco, preparar variantes editoriales ES/EN sin cambiar identidad semántica ni exceder 24+5.

**Límites:** documento de planificación. No se ejecutan pruebas, CI, scorer ni cambios de código. V8 se utiliza solo como procedencia histórica; no es el banco objetivo.
