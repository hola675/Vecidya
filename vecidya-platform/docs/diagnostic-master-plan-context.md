# Diagnóstico Vecidya — Plan maestro recuperado

Estado: referencia de planificación; no equivale a certificación de producción.

## Objetivo
Consolidar el diagnóstico en un sistema único, comprensible, adaptativo, basado en evidencia sin dependencias del motor ni del banco legacy. Mantener V8/producción sin cambios mientras se certifica V9.

## Plan maestro V1
1. Inventariar bancos, consumidores, rutas, adaptadores y legacy.
2. Auditar todas las preguntas, respuestas, duplicados, lenguaje y semántica; decisiones KEEP/REMOVE/DEFER.
3. Construir contratos propios y un motor nuevo unificado de preguntas, evaluación, puntuación, recomendaciones e informes.
4. Certificar ramas, elegibilidad, dependencias y recorridos por contexto.
5. Probar recorridos completos nuevos, consistencia del grafo, resultados, informes y experiencia de principio a fin.
6. Sustituir el motor legacy tras certificar el nuevo sistema autónomo; la importación histórica, si se solicita, será un adaptador opcional separado.
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
- P1c contratos y P1d propuesta gastronómica v2 probados; P1e fue una línea exploratoria de compatibilidad histórica; no bloquea el motor nuevo.
- Último CI PR #171: fixture de restauración con preguntas de contexto ausentes del banco productivo; requiere banco candidato adecuado.
- Los identificadores P1a–P1g de trabajos de compatibilidad NO equivalen a las etapas P0–P5 del plan editorial.
- CI focalizada solo sobre cambios V9; no ejecutar suite general por defecto en PR V9. No acoplar V9 a V8; preservar producción hasta el reemplazo certificado, no activar V9, no fusionar ni desplegar sin aprobación y certificación.
- Cada cierre exige cambios mínimos, pruebas específicas, commit, evidencia y documentación. Diferenciar implementado, probado, integrado y desplegado.

## Próxima ejecución
1. Inventariar el motor nuevo y sus dependencias reales; identificar cualquier importación desde el banco o motor legacy.
2. Consolidar un banco V9 único, con contratos y reglas autónomas; revisar KEEP/REMOVE/DEFER y grafo P0–P5.
3. Implementar y probar motor V9 completo: planificación, elegibilidad, evidencia, evaluación, recomendaciones e informe.
4. Certificar escenarios de negocios y recorridos completos sobre el nuevo motor; reemplazar el anterior mediante corte controlado.
5. Tratar importación histórica únicamente como módulo opcional externo, nunca como condición de cierre.
