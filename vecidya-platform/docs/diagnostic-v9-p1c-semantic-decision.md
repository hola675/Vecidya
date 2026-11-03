# Diagnóstico V9 — P1c: decisión semántica sobre menú y consentimiento

Estado: **propuesta editorial, no aprobada para migración ni producción**.

## Evidencia confirmada

- `q2_food_menu_visibility` v1 pregunta si un restaurante, café o food truck permite consultar una selección actual en internet.
- Su respuesta `not_applicable` dice «Todavía no muestro la oferta en ese lugar», pero el motor interpreta esa respuesta como `not_applicable` en `clarity_positioning`.
- La ausencia de una oferta visible sí responde negativamente a la pregunta de visibilidad; no es necesariamente una exclusión legítima. Conservar la neutralidad histórica evita reclasificar sesiones v1 silenciosamente.
- `q2_ecommerce_cart_followup` v2 distingue no contactar por falta de autorización (`no_authorized_contact`, neutral) de no realizar seguimiento cuando sí es posible (`rarely`, débil). Este contrato se conserva.

## Decisión propuesta para menú

1. **No modificar v1** ni reinterpretar su evidencia histórica.
2. Preparar una **v2 separada**, previa revisión del contrato de migración y de los consumidores de `questionVersion`, donde «No muestro ningún menú o selección en internet» se interprete como ausencia de claridad, y se reserve `not_applicable` únicamente para exclusiones realmente legítimas (si existen).
3. Antes de implementar, verificar compatibilidad de sesiones guardadas, replays, informes, puntuaciones, adaptividad y el número de opciones. Una versión nueva no debe reutilizar el mismo valor para cambiar retroactivamente el significado de v1.
4. Mantener el caso en `needs_semantic_review` hasta que haya una decisión humana y pruebas de migración explícitas.

## Pruebas exigidas antes de aceptar v2

- v1 conserva los valores, `kind` y estados de evidencia originales.
- v2 distingue «oferta no publicada» de «no revisada» y de una eventual exclusión legítima.
- No hay cambios de score, recomendaciones o interpretación de respuestas antiguas sin migración explícita.
- Las combinaciones de capacidad y la neutralidad por falta de consentimiento siguen protegidas por `qa03b-v9-p1c-contract.test.ts`.

## Límites de esta entrega

Documento de decisión y pruebas de contrato únicamente. **Sin despliegue, merge, migración de datos ni cambios de runtime.**
