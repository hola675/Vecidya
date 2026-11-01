# Diagnostic V9 — CLASS-05: matriz de aprobación humana A–H

**Versión:** 0.1.8  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · PROPUESTAS PARA APROBACIÓN · NO AUTORIZA EJECUCIÓN  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Uso de esta matriz

Cada fila debe terminar en uno de estos estados:

- **APPROVED**
- **APPROVED_WITH_FALLBACK**
- **DEFERRED**
- **REJECTED**
- **OPEN**
- **READY_FOR_HUMAN_REVIEW** (estado preparatorio, no aprobación)

Ninguna propuesta de esta tabla se considera aprobada por estar documentada.

## 2. DEC-A — taxonomía final de dimensiones

**Propuesta para revisión:** conservar los ocho IDs técnicos actuales como eje interno de V9 mientras se revisan etiquetas públicas y aplicabilidad por C01–C10.

**Alternativa:** reducir/combinar dimensiones si la matriz 8×10 demuestra solapamiento no justificable.

**Riesgo:** congelar demasiado pronto categorías heredadas y convertir implementación existente en verdad de producto.

**Fallback seguro:** conservar IDs técnicos internos sin prometer nombres públicos ni universalidad; abstenerse cuando applicability sea insuficiente.

**Impacto:** F02, F04, F05, F08.

**Evidencia:** CLASS-02 fuentes/consumidores; CLASS-04 matriz C01–C10; `DIAGNOSTIC-V9-DECA-DIMENSION-TAXONOMY-DECISION-PACK.md` v0.1.0.

**Estado:** READY_FOR_HUMAN_REVIEW. No aprobado.

## 3. DEC-B — calibración, score y confianza

**Propuesta para revisión:** mantener scoring numérico solo como salida condicionada a evidencia directa/aplicabilidad/cobertura; no publicar score global cuando no alcance suficiencia.

**Alternativa:** resultado solo cualitativo hasta contar con calibración validada.

**Riesgo:** presentar precisión numérica no justificada o penalizar N/A/unknown.

**Fallback seguro:** narrativa + prioridades + incertidumbre, sin score global.

**Impacto:** F04, F05, F08.

**Evidencia:** scorer actual, coverage, neutralidad, C02/C03/C05/C07/C08; `DIAGNOSTIC-V9-DECB-CALIBRATION-SCORE-DECISION-PACK.md` v0.1.0.

**Estado:** READY_FOR_HUMAN_REVIEW. No aprobado.

## 4. DEC-C — banco editorial 90

**Propuesta para revisión:** mantener banco 77 como contrato efectivo mientras las 13 preguntas adicionales se revisan una a una; activar ADD solo tras KEEP/REWRITE/REMOVE/ADD/DEFER y evidence V3 cuando corresponda.

**Alternativa:** aprobar un subconjunto menor que 90.

**Riesgo:** convertir conteo objetivo en obligación de activación.

**Fallback seguro:** 77 fijado + complementarias aisladas/pending.

**Impacto:** F02, F03, F04.

**Evidencia:** 77/82/90; CLASS-03 Real Estate; `DIAGNOSTIC-V9-DECC-EDITORIAL-BANK-90-DECISION-PACK.md` v0.1.0.

**Estado:** READY_FOR_HUMAN_REVIEW. No aprobado.

## 5. DEC-D — correlación, procedencia y replay

**Propuesta para revisión:** identidad de observación debe incluir como mínimo pregunta/version + procedencia y una regla explícita de independencia semántica; preguntas distintas que miden el mismo hecho no cuentan automáticamente como evidencia independiente.

**Alternativa:** correlación más estricta por construct/evento si se demuestra necesaria.

**Riesgo:** doble conteo de la misma realidad por IDs distintos.

**Fallback seguro:** si independencia no está demostrada, deduplicar/usar una sola fuente directa.

**Impacto:** F04, F08.

**Evidencia:** CLASS-02 scorer; CLASS-03 specialty/real-estate; replay V9; `DIAGNOSTIC-V9-DECD-OBSERVATION-CORRELATION-DECISION-PACK.md` v0.1.0.

**Estado:** READY_FOR_HUMAN_REVIEW. No aprobado.

## 6. DEC-E — informe identificado, retención y acceso

**Propuesta para revisión:** resultado anónimo útil; informe detallado autenticado; ownership personal separado de organización; asociación organizativa voluntaria con membership; retención definida explícitamente antes de producción.

**Alternativa:** informe detallado también anónimo si producto decide cambiar D-V9-005; requeriría reabrir una decisión ya aprobada, por lo que no es recomendación por defecto.

**Riesgo:** acceso cruzado, retención indefinida o vinculación organizativa implícita.

**Fallback seguro:** no exponer historial identificado hasta cerrar política; conservar resumen anónimo.

**Impacto:** F05, F07, F08, F10.

**Evidencia:** CLASS-02 ownership/claims/migrations; `DIAGNOSTIC-V9-DECE-IDENTITY-RETENTION-REPORT-DECISION-PACK.md` v0.1.0.

**Estado:** READY_FOR_HUMAN_REVIEW. No aprobado.

## 7. DEC-F — priorización, presupuesto y fallbacks

**Propuesta para revisión:** hasta tres prioridades visibles, explicables por evidencia/impacto/urgencia/esfuerzo/objetivos confirmados; entrevista 24+5; fallbacks genéricos se preservan cuando specialty no aplica.

**Alternativa:** menor número de prioridades o sin ranking numérico.

**Riesgo:** ranking opaco, extensión de entrevista para fabricar score o supresión de fallback.

**Fallback seguro:** modo verify/prepare, no solución concreta cuando evidencia no basta; terminar con budget-blocked explícito.

**Impacto:** F03, F05, F06, F08.

**Evidencia:** CLASS-03 fallbacks; CLASS-04 budgets/journeys; matcher conservador; `DIAGNOSTIC-V9-DECF-PRIORITY-BUDGET-FALLBACK-DECISION-PACK.md` v0.1.0.

**Estado:** READY_FOR_HUMAN_REVIEW. No aprobado.

## 8. DEC-G — Aprende, servicios y GHL

**Propuesta para revisión:** Aprende y servicios Vecidya como capas opcionales después del resultado; GHL solo como integración autorizada, nunca fuente obligatoria de scoring/identidad.

**Alternativa:** omitir integraciones en primera salida V9.

**Riesgo:** convertir diagnóstico en embudo comercial o hacer depender el resultado de disponibilidad externa.

**Fallback seguro:** informe completo sin Aprende/servicios/GHL.

**Impacto:** F06, F08, F10.

**Evidencia:** decisiones D-V9-007/008 y fronteras del plan; `DIAGNOSTIC-V9-DECG-LEARN-SERVICES-GHL-DECISION-PACK.md` v0.1.0.

**Estado:** READY_FOR_HUMAN_REVIEW. No aprobado.

## 9. DEC-H — main, V8, corte y rollback

**Propuesta para revisión:** reconciliar main→rama V9 en tarea aislada; mantener V8 activo; activar V9 mediante corte controlado solo tras F08; rollback probado antes de producción.

**Alternativa:** seguir V8 indefinidamente hasta nueva autorización.

**Riesgo:** pérdida de cambios de main, corte prematuro o limpieza legacy irreversible.

**Fallback seguro:** V8 permanece ruta productiva; no borrar legacy ni migraciones históricas.

**Impacto:** F00, F09, F10.

**Evidencia:** plan maestro, backlog F00–F10, PR #162 draft; `DIAGNOSTIC-V9-DECH-MAIN-CUTOVER-ROLLBACK-DECISION-PACK.md` v0.1.0.

**Estado:** READY_FOR_HUMAN_REVIEW. No aprobado.

## 10. Dependencias entre decisiones

- DEC-C depende de DEC-A para aplicabilidad editorial.
- DEC-B depende de DEC-A y DEC-D.
- DEC-F depende de DEC-A/B/C/D.
- DEC-E puede diseñarse en paralelo, pero su despliegue depende de seguridad F07/F08.
- DEC-G depende del contrato de resultado/recomendaciones de DEC-F.
- DEC-H debe cerrarse antes de cualquier corte, pero no bloquea seguir documentando A–G.

## 11. Orden recomendado de revisión humana

1. DEC-A taxonomía/aplicabilidad.
2. DEC-C banco editorial.
3. DEC-D correlación/evidencia.
4. DEC-B calibración/score.
5. DEC-F priorización/presupuesto/fallbacks.
6. DEC-E identidad/informe/retención.
7. DEC-G integraciones opcionales.
8. DEC-H integración/corte/rollback.

Este orden reduce decisiones circulares y evita calibrar preguntas no aprobadas.

## 12. Condición para levantar PLAN_ONLY

No basta aprobar una o varias filas. Para autorizar código debe existir una instrucción explícita que indique:

- qué DEC están aprobadas;
- qué fases/tareas F00–F10 quedan habilitadas;
- qué archivos/ámbitos pueden modificarse;
- qué pruebas focales pueden ejecutarse;
- si PLAN_ONLY se levanta total o parcialmente.

Hasta entonces, el estado permanece documental.

## 13. Registro de aprobación

| DEC | Estado | Aprobador | Fecha | Condiciones/Fallback | Evidencia |
|---|---|---|---|---|---|
| A | READY_FOR_HUMAN_REVIEW | — | — | No aprobado; revisar paquete DEC-A | DEC-A pack + CLASS-02/04 |
| B | READY_FOR_HUMAN_REVIEW | — | — | No aprobado; resolver binding v2/v4 y revisar paquete DEC-B | DEC-B pack + scoring/coverage |
| C | READY_FOR_HUMAN_REVIEW | — | — | No aprobado; revisar paquete DEC-C | DEC-C pack + 77/82/90 |
| D | READY_FOR_HUMAN_REVIEW | — | — | No aprobado; revisar paquete DEC-D | DEC-D pack + provenance/replay |
| E | READY_FOR_HUMAN_REVIEW | — | — | No aprobado; reconciliar ledger anónimo con D029/D033 y decidir alcance D1 | DEC-E pack + ownership/result |
| F | READY_FOR_HUMAN_REVIEW | — | — | No aprobado; hard cap técnico 24 no implementa aún 24+5 | DEC-F pack + planner/recommendations |
| G | READY_FOR_HUMAN_REVIEW | — | — | No aprobado; mantener enriquecimiento posterior al ranking y frontera GHL | DEC-G pack + D-V9-007/008 |
| H | READY_FOR_HUMAN_REVIEW | — | — | No aprobado; resolver divergencia main y colisión 0030–0035 antes de F00 | DEC-H pack + F00/F09/F10 |

## Changelog

- **0.1.8 / 2026-11-01:** DEC-H pasa a READY_FOR_HUMAN_REVIEW; PR #162 sigue dirty/divergido y se registra la colisión de migraciones 0030–0035.
- **0.1.7 / 2026-11-01:** DEC-G pasa a READY_FOR_HUMAN_REVIEW con separación Diagnóstico→Aprende→servicios→GHL y neutralidad comercial.
- **0.1.6 / 2026-11-01:** DEC-E pasa a READY_FOR_HUMAN_REVIEW; se documenta la tensión entre ledger D1 individual y borrador anónimo local/analítica agregada.
- **0.1.5 / 2026-11-01:** DEC-F pasa a READY_FOR_HUMAN_REVIEW; se documenta la brecha hard cap 24 vs política 24+5 y el ranking multicriterio pendiente.
- **0.1.4 / 2026-11-01:** DEC-B pasa a READY_FOR_HUMAN_REVIEW; se registra como bloqueo la falta de binding explícito entre scoring_version y calibración v2/v4.
- **0.1.3 / 2026-11-01:** DEC-D pasa a READY_FOR_HUMAN_REVIEW con paquete de correlación y deduplicación; sin integración runtime.
- **0.1.2 / 2026-11-01:** DEC-C pasa a READY_FOR_HUMAN_REVIEW con paquete editorial 77/82/90; no activa banco ni scoring.
- **0.1.1 / 2026-11-01:** DEC-A pasa a READY_FOR_HUMAN_REVIEW con paquete 8×10; no cambia aprobación ni PLAN_ONLY.
- **0.1.0 / 2026-10-31:** matriz A–H con propuesta, alternativa, riesgo, fallback, impacto y orden de revisión humana.
