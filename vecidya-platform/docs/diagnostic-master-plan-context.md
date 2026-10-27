# Diagnóstico Vecidya — Plan maestro recuperado

Estado: referencia de planificación; no equivale a certificación de producción.

## Objetivo
Consolidar el diagnóstico en un sistema único, comprensible, adaptativo, basado en evidencia y compatible con sesiones históricas. Mantener V8/producción sin cambios mientras se certifica V9.

## Plan maestro V1
1. Inventariar bancos, consumidores, rutas, adaptadores y legacy.
2. Auditar todas las preguntas, respuestas, duplicados, lenguaje y semántica; decisiones KEEP/REMOVE/DEFER.
3. Unificar contratos de preguntas, evaluación, puntuación, recomendaciones e informes, preservando compatibilidad.
4. Certificar ramas, elegibilidad, dependencias y recorridos por contexto.
5. Probar regresiones, sesiones históricas, replay, informes y experiencia completa.
6. Retirar legacy únicamente después de demostrar equivalencia.
7. Cerrar seguridad, UX, documentación y aceptación verificable.

## DIAG-V9-LEX-GRAPH-04
- P0: inventario, opciones, variantes, referencias, duplicados y ciclos del grafo.
- P1: revisión editorial y semántica pregunta por pregunta, evidencia, neutralidad y contexto.
- P2: dependencias, alcanzabilidad, elegibilidad, contradicciones y recorridos.
- P3: simplificación y reducción de preguntas redundantes sin perder evidencia.
- P4: cubrir vacíos de información solo cuando aporten valor diagnóstico.
- P5: certificación integral del banco, motor, replay, sectores y comprensión humana; verificar límite de 24 interacciones donde aplique.

## Estado y reglas de ejecución
- Banco candidato V9: 77 preguntas, 387 opciones, 15 variantes (corte histórico, verificar contra HEAD).
- P1c contratos y P1d propuesta gastronómica v2 probados; P1e identidad probada, restauración histórica pendiente.
- Último CI PR #171: fixture de restauración con preguntas de contexto ausentes del banco productivo; requiere banco candidato adecuado.
- Los identificadores P1a–P1g de trabajos de compatibilidad NO equivalen a las etapas P0–P5 del plan editorial.
- CI focalizada solo sobre cambios V9; no ejecutar suite general por defecto en PR V9. Preservar V8, no activar V9, no fusionar ni desplegar sin aprobación y certificación.
- Cada cierre exige cambios mínimos, pruebas específicas, commit, evidencia y documentación. Diferenciar implementado, probado, integrado y desplegado.

## Próxima ejecución
1. Corregir fixture con definiciones del banco candidato para q2_operational_status y q2_niche_food_hospitality; verificar opciones reales y elegibilidad.
2. Certificar P1e, versionado de respuestas y replay histórico.
3. Reconciliar matriz editorial KEEP/REMOVE/DEFER y grafo P0–P5.
4. Validar motor, informe, UX y compatibilidad integral antes de cualquier activación.
