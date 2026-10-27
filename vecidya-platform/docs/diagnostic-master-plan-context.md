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

## Auditoría de dependencias — 2026-10-27
Inspección de código sobre esta rama; no certifica runtime ni producción.

| Archivo | Evidencia observada | Consecuencia |
|---|---|---|
| qa03b/specialty-candidate-bank.ts | Importa qbv2-contract, qbv2-rules y lotes QBV2 C/D/F | El banco V9 aún no es autónomo; migrar definiciones revisadas a contratos propios. |
| qa03b/specialty-branches-wave1.ts | Importa qbv2-contract, qbv2-rules y el banco candidato anterior; construye 77 preguntas | Revisar sustituciones de preguntas genéricas y reglas de elegibilidad en un grafo V9 propio. |
| qbv2-session.ts | Banco por defecto QUESTION_BANK_V2; utiliza motor, planificador, scoring, narrativa y ofertas QBV2 | No sirve como núcleo definitivo del motor nuevo. |
| qa03b/v9-food-menu-v2-proposal.ts | Sustituye not_applicable por not_published y cambia evidencia a weak | Revisar editorialmente y probar en V9, sin depender de restaurar respuestas históricas. |
| docs/diagnostic-v9-p1e-session-audit.md | Exige compatibilidad histórica para sustituir la pregunta | Recomendación histórica supersedida para el objetivo actual; la importación antigua será opcional y externa. |

### Orden de trabajo corregido, centrado en preguntas y respuestas
1. **Catálogo de preguntas**: extraer cada pregunta, versión, módulo, contexto, ayudas y opciones del candidato; detectar duplicados, respuestas ambiguas y huecos.
2. **Matriz editorial KEEP/REMOVE/REWRITE/DEFER**: justificar cada decisión por utilidad diagnóstica y calidad de evidencia; conservar trazabilidad de versiones.
3. **Grafo de preguntas**: documentar condiciones, rutas, preguntas sustitutivas y sectores; comprobar alcanzabilidad, contradicciones y límite de interacciones.
4. **Contrato de banco V9**: especificación nueva independiente de QBV2, con validador estático, identificadores estables y evidencias explícitas.
5. **Motor V9**: selección adaptativa, estado de sesión propio, scoring basado en evidencia, recomendaciones y reporte; sin importaciones de QBV2.
6. **Certificación funcional**: escenarios de negocios y recorridos end-to-end sobre V9; sustitución controlada del motor anterior.

**No bloquear** el trabajo de banco/motor por P1e, PR #172 o replay de sesiones antiguas. No fusionar ni desplegar antes de certificar. Mantener CI focalizada sobre los archivos modificados.

## Plan de ejecución actualizado — 2026-10-27

**Estado comprobado:** PR maestro #162, rama `feat/diagnostic-v9-lex-graph-p1b` hacia `main`; 50 commits ahead / 0 behind al verificar, antes de los commits de esta actualización. V8 productivo intacto. CI actual sin resultado verificable.

### Secuencia obligatoria y definición de terminado

| Orden | Entregable | Criterio de cierre |
|---|---|---|
| 1 — P1 clasificación | Fichas completas de entidad, clientes/beneficiarios, estado, sector, objetivo y nicho | Cada opción y variante revisada, decisión KEEP/REWRITE/REMOVE/ADD/DEFER registrada; casos sin ventas y en pausa cubiertos |
| 2 — P2 sustituciones | Rutas dental, restaurante/café/food truck y agencia | Elegibilidad genérica/especializada sin pérdidas ni duplicados; pruebas focalizadas ejecutadas y verificadas |
| 3 — P1 banco | 77 preguntas / 387 respuestas / 15 variantes como inventario inicial | Recuento actualizado y auditoría editorial por opción; resolver `not_applicable` frente a `not_published`; sin aprobaciones inferidas |
| 4 — P3/P4 optimización | Simplificación y huecos justificados | Evidencia conservada; no añadir preguntas sin necesidad; recorridos dentro de 24 interacciones donde aplique |
| 5 — P5 autonomía | Contrato, banco, motor, sesión, evaluación, recomendaciones e informe V9 | Sin dependencias QBV2 en el núcleo; pruebas end-to-end, seguridad, comprensión y aceptación verificables |
| 6 — Corte controlado | Reemplazo del flujo anterior | Solo tras certificación y autorización; rollback previsto, V8 preservado hasta entonces |

### Cambios confirmados desde el corte anterior
- Corrección de exclusión genérica para preguntas especializadas gastronómicas, B2B y odontológicas en `specialty-branches-wave1.ts`.
- Nuevos tests de cobertura contextual y de opciones/semántica básica de clasificación, todavía sin CI confirmada.
- Primer registro de huecos editoriales en `diagnostic-v9-p1-lote-01-clasificacion-y-huecos.md`.
- La propuesta gastronómica v2 permanece aislada; no se exige migración de sesiones históricas como requisito del motor V9.

**Política:** un solo PR de trabajo, commits pequeños, pruebas focalizadas, evidencia antes de declarar PASS, no merge ni despliegue prematuro. Este plan no constituye certificación.

### Seguimiento del plan — 2026-10-27

P2 clasificacion: implementada la validacion del replay, la limpieza de respuestas especializadas al cambiar de nicho y la proteccion del conteo visible contra eventos antiguos, selectores incorrectos y valores de especialidad no validos. Pruebas de regresion incorporadas al workflow focalizado. **Pendiente ejecucion CI verificable; P2 no cerrado.**

Proximo cierre: obtener resultados de pruebas focalizadas, resolver fallos, revisar recorridos por sector y continuar la matriz editorial por respuesta. Mantener V8 intacto y PR #162 sin fusionar.

### Control P2: clasificacion incompleta — 2026-10-27

El prototipo requiere sector y especialidad explicitos para descontar una interaccion conjunta. Se agrego una comprobacion de presencia del sector (c9a9c6a) y una prueba para respuestas incompletas (90590bb). El criterio de salida sigue siendo CI focalizada ejecutada y revisada, no solo tests registrados. No activar V9 ni modificar V8.

## Lotes de implementación — seguimiento 2026-10-27

| Lote | Objetivo | Evidencia y puerta de salida |
|---|---|---|
| L1 — P2 clasificación | Sector y especialidad como interacción única; replay y limpieza de respuestas al reclasificar | Correcciones y regresiones registradas; falta ejecución CI verificable |
| L2 — P2 presupuesto | Conteo de interacciones, eventos antiguos o inválidos y piso histórico | Pruebas de valores, selectores y cambios sucesivos; añadida prueba de piso histórico en 24; falta ejecución |
| L3 — P1 editorial | Revisar preguntas y opciones de clasificación, con decisiones explícitas por respuesta | 77 preguntas y 387 opciones inventariadas; no atribuir aprobación humana |
| L4 — P2/P3 rutas | Comprobar sustituciones genéricas, elegibilidad y simplificación de recorridos | Escenarios por sector y límite visible; pendiente de certificar |
| L5 — P5 autonomía | Separar contratos, banco, motor, sesión y evaluación de QBV2 | Bloqueado hasta completar contratos y evidencia; no activar V9 |

**CI:** el job focalizado V9 ahora incluye el archivo de pruebas de clasificación y un paso de `pnpm typecheck` antes de los contratos. No se ha confirmado ejecución PASS. El plan requiere cerrar cada lote con código, pruebas ejecutadas, resultados y riesgos; commits por sí solos no cierran etapas.

**Política de corte:** mantener PR #162 como draft, V8 intacto, sin merge ni despliegue hasta certificación y autorización.

### L3 P1 editorial — deteccion de evidencia incompleta (2026-10-27)

La matriz editorial V9 ahora marca `missing_evidence_mapping` cuando una opcion de una pregunta migrada no tiene lectura en alguna dimension declarada (`63def58`). Se incorporo prueba sintetica que retira una lectura para exigir el flag (`b693fed`). Esta alerta es diagnostica: no altera el banco, las puntuaciones ni las decisiones editoriales; no equivale a aprobacion humana. Pendiente: ejecutar el job focalizado y revisar sus resultados antes de cerrar el lote.
