# Diagnostic V9 — DEC-D: correlación, procedencia e independencia de observaciones

**Versión:** 0.1.0  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · RATIFICADO VÍA HOJA A–H · IMPLEMENTACIÓN NO AUTORIZADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## Nota de autoridad documental

El estado de decisión de este paquete es histórico y queda **supersedido para status** por `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md`. Las propuestas, riesgos y criterios técnicos de este archivo siguen siendo referencia; cualquier frase interna “NO APROBADO”, “READY_FOR_HUMAN_REVIEW” u “OPEN” describe el momento de redacción original y **no reabre** la decisión humana ya registrada. PLAN_ONLY sigue vigente para runtime.

## 1. Objetivo

DEC-D debe impedir que dos preguntas distintas sobre el mismo hecho inflen score o confianza, sin colapsar observaciones realmente independientes.

No se modifica scorer, banco, event schema ni replay.

## 2. Evidencia fuente

- `qa03b/v9-observation-correlation.ts` — blob `2cab48c809d3265ae57fc5ed3fac96ed6756bce3`.
- `qa03b-v9-general-dimension-probes.test.ts` — blob `e5e73b3def3c3f27e2bffef2901be0aa89d6f33b`.
- `qbv2-contextual-scoring.ts`: el core deduplica por `observationId`, pero IDs de pregunta distintos siguen contando como observaciones distintas.
- CLASS-03 Real Estate: `q2_professional_intake_flow`, `q2_real_estate_inquiry_entry` y `q2_general_first_action_path` pueden describir el mismo “primer paso”.
- CLASS-02 secondary conflicts: procedencia y questionId ganador no bastan para demostrar independencia real.

## 3. Riesgo confirmado

El scorer actual puede producir:

- pregunta A → observationId A;
- pregunta B → observationId B;

y contar dos directas aunque ambas describan el mismo hecho real.

La suite focal documenta este P0: mismos estados con IDs distintos pueden elevar confianza aun cuando el score medio no cambie.

**Decisión obligatoria:** diferente `questionId` NO demuestra independencia.

## 4. Prototipo de correlación existente

`correlateCandidateObservationsV1` exige una anotación confirmada por lectura:

- `observationId`
- `questionId`
- `dimension`
- `eventKey`
- `constructKey`
- `periodKey`
- provenance = `explicit_confirmation | verified_record`

La llave de correlación es:

`dimension + eventKey + constructKey + periodKey`.

### Comportamiento

- misma correlación + mismo state/contribution → conserva una lectura;
- prioriza direct sobre supporting sobre contextual;
- mismo grupo con estados incompatibles → conflicto;
- lectura sin correlación válida → unmapped;
- anotación duplicada/ambigua → unmapped;
- cualquier unmapped o conflicto → `scoreSafe=false`;
- eventos/periodos/constructos distintos permanecen independientes;
- una misma fuente puede contribuir a dimensiones distintas sin deduplicación cruzada.

El prototipo declara expresamente que no infiere evento, constructo o periodo desde questionId/sector/respuesta.

## 5. Límite actual

El módulo es candidate-only y su propio comentario indica que ningún caller del scoring público lo utiliza.

Por tanto:

- existe un contrato experimental;
- existen tests source;
- NO existe integración certificada en V9 finalization/scoring;
- no puede afirmarse que el doble conteo esté resuelto en runtime.

## 6. Propuesta DEC-D — modelo de dos capas

### Capa 1 — identidad editorial del constructo

Cada mapping de evidence aprobado debe declarar metadata versionada:

- `constructKey`
- `overlapGroup` opcional
- `observationScope`
- dimensión
- directness

Ejemplos de constructos:
- `offer_comprehension`
- `first_action_path`
- `pending_step_continuity`
- `presence_consistency`
- `outcome_measurement`

**Regla:** constructKey no se genera desde el ID; forma parte del contrato editorial/evidence aprobado.

### Capa 2 — identidad runtime de la observación

Cada lectura que pueda solaparse debe recibir:

- `eventKey`
- `periodKey`
- provenance de la correlación.

Fuentes permitidas propuestas:
1. **explicit_confirmation**: el flujo/usuario confirma que dos lecturas refieren al mismo hecho;
2. **verified_record**: un registro externo autorizado demuestra identidad del evento.

No usar:
- sector;
- niche;
- similitud textual;
- mismo valor;
- timestamps cercanos;
- questionId;
como prueba suficiente de mismo evento.

## 7. Política recomendada por tipo de solapamiento

### D-01 — sustitución conocida
Dental/food/agency specialty vs genérica.

**Preferencia:** exclusión mutua de routing.  
Si una especialista sustituye a la genérica, no preguntar ambas.

La mejor deduplicación es no producir la lectura duplicada.

### D-02 — general vs sectorial
Ejemplo: `q2_general_first_action_path` vs una entrada sectorial.

**Preferencia:** overlapGroup editorial + planner evita ambas salvo ganancia explícita de información.

Si ambas se preguntan, correlación obligatoria antes de scoring.

### D-03 — misma pregunta, varias dimensiones
Una respuesta puede aportar a dos dimensiones distintas.

**Regla:** no deduplicar entre dimensiones solo por compartir observationId. El prototipo ya respeta esto.

### D-04 — misma dimensión, eventos distintos
Dos hechos realmente independientes pueden aportar a la misma dimensión.

**Regla:** eventKey/periodKey diferentes → conservar ambas, sujeto a calibración de confianza.

### D-05 — mismo evento, estados contradictorios
**Regla:** fail-closed. No elegir por orden ni promediar contradicción.

## 8. Decisión sobre alcance de correlación

Existen dos estrategias posibles.

### Opción A — correlación global obligatoria
Toda evidencia scorable necesita construct/event/period.

**Ventaja:** trazabilidad máxima.  
**Coste/riesgo:** exige metadata runtime para todas las observaciones y puede bloquear scoring aunque no exista solapamiento conocido.

### Opción B — correlación obligatoria en overlap groups + identidad editorial global
Todas las evidence mappings tienen constructKey; event/period correlation estricta se exige donde exista overlapGroup o posibilidad real de doble lectura.

**Ventaja:** conserva fail-closed en los puntos de riesgo sin sobrecargar cada lectura independiente.

**Propuesta DEC-D:** **Opción B**.

Para evidencia fuera de overlapGroup, la independencia procede del contrato editorial aprobado del constructo, no de que el questionId sea distinto.

## 9. Propuesta de `periodKey`

No usar mes calendario por defecto.

El periodo debe ser parte del contrato de la pregunta/observación, por ejemplo:
- `current_state`
- `current_operating_period`
- `recent_comparable_activity`
- un intervalo explícito solicitado por una pregunta futura.

Si no existe referencia temporal explícita y es necesaria para decidir independencia, la correlación queda unresolved.

## 10. Propuesta de `eventKey`

Para observaciones de un incidente específico:
- identificador server-side del incidente/registro, o
- correlationGroupId generado cuando el flujo confirma el mismo evento.

Para preguntas de estado general:
- no fabricar un evento puntual;
- usar observationScope/period aprobado;
- deduplicar por constructo+scope+period cuando el contrato indique que ambas leen el mismo estado global.

Esto requiere ampliar el prototipo conceptual antes de implementación.

## 11. Replay y persistencia

La correlación que afecte scoring debe ser reproducible.

Por tanto, el resultado final necesita poder reconstruir:
- metadata editorial versionada;
- correlation annotation efectiva;
- fuente/provenance;
- qué lectura fue accepted;
- cuáles fueron deduplicated;
- conflictos/unmapped.

No basta recalcular con heurísticas nuevas durante replay.

## 12. Relación con DEC-A/C/B

- **DEC-A** define fronteras de dimensiones/constructos.
- **DEC-C** aprueba preguntas y mappings.
- **DEC-D** decide cuándo dos mappings son el mismo hecho.
- **DEC-B** calibra score/confianza DESPUÉS de deduplicación.

Orden obligatorio:
`A → C → D → B`.

## 13. Reglas propuestas para aprobación humana

1. questionId distinto nunca prueba independencia.
2. sector/nicho nunca prueba identidad de evento.
3. substitution conocida se resuelve preferentemente por routing.
4. todo mapping aprobado recibe constructKey versionado.
5. overlapGroup identifica familias con riesgo de doble observación.
6. en overlapGroup, correlación debe ser explícita/verificada o la lectura no es score-safe.
7. conflictos del mismo evento fallan cerrado.
8. una misma fuente puede aportar a dimensiones distintas cuando el mapping lo declara.
9. correlation metadata que afecta score debe persistir/reproducirse en replay.
10. no activar probes generales hasta que sus overlap groups estén definidos.

## 14. Casos de aceptación futuros — NO EJECUTADOS

| ID | Caso | Esperado |
|---|---|---|
| D01 | genérica + specialist mismo hecho | una accepted, otra deduplicated |
| D02 | genérica + specialist eventos distintos | ambas accepted |
| D03 | mismo evento, mismo constructo, periodos distintos | independientes |
| D04 | mismo evento/constructo/periodo con estados distintos | conflict + scoreSafe=false |
| D05 | falta correlation en overlapGroup | scoreSafe=false |
| D06 | anotación duplicada | fail-closed |
| D07 | direct + supporting mismo hecho | conservar direct |
| D08 | una respuesta → dos dimensiones | ambas dimensiones preservadas |
| D09 | cambio de sector invalida correlation stale | no reutilizar annotation |
| D10 | replay | accepted/dedup/conflicts idénticos al original |

## 15. Decisión humana requerida

DEC-D puede pasar a APPROVED si se confirma:

- modelo de dos capas;
- Opción B de alcance;
- constructKey + overlapGroup como metadata editorial;
- correlation runtime explícita/verificada en grupos de riesgo;
- fail-closed de conflictos/unmapped;
- persistencia/replay de la decisión de correlación.

Hasta entonces, los 8 probes generales y cualquier nueva evidence potencialmente solapada permanecen pending.

## Changelog

- **0.1.0 / 2026-11-01:** paquete DEC-D; riesgo P0, prototipo existente, modelo de dos capas, opción B y matriz D01–D10.
