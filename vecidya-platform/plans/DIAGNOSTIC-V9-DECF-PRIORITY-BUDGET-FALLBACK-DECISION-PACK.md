# Diagnostic V9 — DEC-F: priorización, presupuesto adaptativo y fallbacks

**Versión:** 0.1.1  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · RATIFICADO VÍA HOJA A–H · IMPLEMENTACIÓN NO AUTORIZADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## Nota de autoridad documental

El estado de decisión de este paquete es histórico y queda **supersedido para status** por `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md`. Las propuestas, riesgos y criterios técnicos de este archivo siguen siendo referencia; cualquier frase interna “NO APROBADO”, “READY_FOR_HUMAN_REVIEW” u “OPEN” describe el momento de redacción original y **no reabre** la decisión humana ya registrada. PLAN_ONLY sigue vigente para runtime.

## 1. Objetivo

DEC-F debe convertir decisiones de producto ya aprobadas en un contrato técnico futuro sin confundirlas con el algoritmo actual.

Decisiones de producto ya aprobadas:
- D-V9-004: entrevista adaptativa, objetivo hasta 24 interacciones.
- D-V9-006: priorización explicable combinando impacto, urgencia, esfuerzo y objetivos.
- D-V9-019: máximo de cinco interacciones adicionales consentidas por evidencia crítica.
- D-V9-020: cada turno nuevo de pregunta/aclaración que requiere decisión cuenta; navegación, consentimiento y cambio de idioma no cuentan.
- fallbacks genéricos se conservan cuando la especialización no aplica.

No se modifica planner, Worker, ranking ni recomendaciones.

## 2. Fuentes técnicas principales

- `qbv2-planner.ts` — blob `f1ebeb00b076700437b80ea82742fb1de315a831`.
- `qa03b/qbv2-candidate-planner.ts` — blob `ae1b29aa403cea34d4ac75966f7dd6ab739a8f31`.
- `qa03b/v9-candidate-planner.ts` — blob `99f6513b4c3fbb868a654e96adc1b1973b84d8de`.
- `qbv2-priorities.ts` — blob `13f63fab62d6250fa06783a70bde29eb191083f1`.
- `qbv2-recommendations.ts` — blob `8477df4b08ab3fa5bd94c0c6392119eddd1adb8c`.
- `qa03b/qbv2-candidate-recommendations.ts` — blob `ff1c989a2ab34fbae2fe37aa45f2c2c9c96b5b3f`.
- `qa03b/worker-replay-v9.server.ts` — blob `f77b1d3c5946b75d465e0a24a89411a3d62cfe31`.
- plan maestro D-V9-004/006/019/020.

## 3. Planner actual: qué prioriza realmente

El planner candidato ordena preguntas por una jerarquía técnica:

1. confirmation
2. required_context
3. unlock_routing
4. goal_or_friction
5. cross_cutting_evidence
6. specialized_evidence
7. prospective_evidence
8. refinement

Después desempata mediante:
- relevancia de dimensiones para goal/friction;
- prioridad editorial critical/high/normal/refinement;
- ID alfabético estable.

En modo `utility_first` añade señales de utilidad contextual/evidence, pero sigue siendo un selector de preguntas, no el algoritmo de ranking de acciones del informe.

**Conclusión:** el planner actual es explicable y determinista, pero no implementa por sí mismo el modelo de prioridad de acciones aprobado en D-V9-006.

## 4. Ranking de constraints/recomendaciones actual

`deriveConstraintsAndPriorities`:
- detecta hasta tres prioridades;
- usa severidad de la brecha;
- relevancia de goal/friction;
- dependencias entre dimensiones;
- confianza/certidumbre;
- precedencia habilitadora;
- desempate determinista.

`buildDiagnosticRecommendations` deriva:
- rank 1–3;
- mode `improve|verify|prepare|reduce_dependency`;
- urgency `high|medium|verify`;
- evidence/sourceQuestionIds;
- prerequisites;
- framing por certeza.

### Lo que NO está demostrado en ese ranking
No se localizó un factor explícito y separado de:
- **impacto esperado**;
- **esfuerzo estimado**;
- **alineación con objetivos confirmados** como estado distinto de goal histórico;
- una matriz multicriterio que combine los cuatro factores aprobados D-V9-006.

La ausencia de una cadena textual “effort” en la búsqueda focal no prueba por sí sola que nunca exista en el repo, pero el algoritmo principal inspeccionado no expone ese factor en su tipo ni en su comparator.

**Decisión:** tratar D-V9-006 como política aprobada aún no materializada de forma completa en el ranking inspeccionado.

## 5. Presupuesto técnico actual

`qbv2-planner.ts`:
- `ROUTE_HARD_CAP = 24`;
- base 1–18;
- material extension 19–20;
- evidence completion reserve 21–24.

`v9-candidate-planner.ts`:
- `CANDIDATE_ROUTE_HARD_CAP_V3 = ROUTE_HARD_CAP`;
- clampa `interactionCount` y `hardMax` a 24.

`worker-replay-v9.server.ts`:
- rechaza `interactionCount > 24`;
- rechaza una ruta cuyo `routeLength > 24`.

## 6. Bloqueo P0 — política 24+5 vs hard cap 24

La política aprobada D-V9-019/020 define:
- hasta 24 turnos ordinarios;
- hasta 5 adicionales;
- máximo global 29;
- solo por evidencia crítica;
- consentimiento explícito antes del turno 25;
- contador global que no se reinicia;
- detenerse antes si la evidencia queda resuelta.

El runtime V9 inspeccionado sigue limitado a 24.

**Conclusión:** existe una **brecha de implementación estática** entre política de producto y contrato técnico actual.

No es una autorización para elevar el hard cap: antes debe existir máquina de estados de consentimiento, definición de evidencia crítica y replay del contador 24+5.

## 7. Propuesta DEC-F1 — presupuesto por fases

### Tramo ordinario
- turnos contabilizados: 0–24;
- terminar antes cuando ya no quedan preguntas útiles críticas;
- no intentar alcanzar 24 por cuota.

### Gate excepcional
Al llegar a 24:
- si no falta evidencia crítica → finalizar;
- si falta evidencia crítica resoluble → solicitar consentimiento;
- rechazo → finalizar con insuficiencia declarada;
- aceptación → abrir presupuesto excepcional.

### Tramo excepcional
- máximo 5 turnos nuevos;
- contador global 25–29;
- solo preguntas/aclaraciones que resuelvan el vacío crítico;
- detenerse tan pronto se resuelva;
- nunca extender por score, cobertura estética, interés comercial o por “completar el banco”.

## 8. Propuesta DEC-F2 — definición operativa de evidencia crítica

Una evidencia faltante es crítica solo si se cumplen TODAS:

1. afecta una conclusión que el informe pretende emitir;
2. la dimensión es aplicable según DEC-A;
3. existe una pregunta/aclaración aprobada por DEC-C;
4. la nueva observación no duplica otra según DEC-D;
5. puede cambiar entre:
   - emitir nivel vs abstenerse;
   - una prioridad material vs verify-first;
   - una recomendación permitida vs no permitida;
6. la persona puede responder razonablemente sin exigir datos privados/externalidades no disponibles.

No es crítica solo porque:
- falte una dimensión;
- aumente coverage;
- pueda elevar confianza;
- desbloquee una solución comercial;
- el score global quede más “bonito”.

## 9. Propuesta DEC-F3 — ranking multicriterio futuro

Separar dos sistemas:

### A. Selección de preguntas
Optimiza carga de entrevista y evidencia útil.

### B. Ranking de acciones
Ordena recomendaciones del resultado.

Para B, D-V9-006 requiere cuatro factores visibles:

#### Impacto
Categoría cualitativa basada en la brecha y dependencias demostradas.
No ROI ni porcentaje inventado.

#### Urgencia
Contextual:
- bloqueo actual;
- pérdida/impedimento observado;
- dependencia de otra acción;
- necesidad declarada.

No usar presión comercial.

#### Esfuerzo
Categoría estimada solo si existe base suficiente:
- bajo / medio / alto / desconocido, por ejemplo.
Debe ser una estimación declarada, no un hecho.

#### Objetivo
Solo objetivos **confirmados** según D-V9-009.
Una sugerencia no confirmada no altera ranking.

## 10. Propuesta de orden sin pesos numéricos iniciales

Hasta calibrar el multicriterio:

1. filtrar acciones sin evidencia;
2. respetar dependencias habilitadoras;
3. separar `verify` de `improve/prepare`;
4. priorizar urgencia material sustentada;
5. usar alineación con objetivo confirmado;
6. usar impacto cualitativo;
7. usar esfuerzo como desempate/factibilidad;
8. determinismo final por ID estable.

**Propuesta:** no inventar pesos 40/30/20/10 ni similares en DEC-F.

Si producto desea pesos, requieren un DEC-F posterior versionado y casos C01–C10.

## 11. Fallbacks

### Specialty fallback
Dental/food/agency:
- specialist solo cuando todos sus gates son verdaderos;
- genérica conserva elegibilidad cuando specialist no está confirmado.

Real estate:
- mantener `q2_professional_intake_flow`;
- no activar sustitución pending.

### Recommendation fallback
- evidencia insuficiente → `verify`;
- prelaunch → `prepare`;
- no solución concreta cuando el matcher no tiene base;
- informe sigue siendo útil sin producto/servicio Vecidya.

### Budget fallback
- sin pregunta crítica útil → finalizar;
- sin consentimiento → finalizar;
- al agotar 29 → abstener dimensiones insuficientes.

## 12. Unidad de interacción aprobada

Cuenta:
- cada turno nuevo de pregunta o aclaración presentado que requiere decisión;
- “No sé”;
- “Prefiero omitir”.

No cuenta:
- navegación;
- consentimiento;
- cambio de idioma;
- animación;
- progreso;
- re-render;
- edición de pregunta ya contabilizada;
- retry técnico.

Aclaración semánticamente nueva sí cuenta.

Esta política todavía necesita representación idempotente en eventos/runtime.

## 13. Persistencia/replay requerida para 24+5

El replay futuro debe reproducir:
- contador único;
- IDs de turnos ya contados;
- momento de alcanzar 24;
- evidencia crítica declarada;
- consentimiento ofrecido/aceptado/rechazado/retirado;
- turnos excepcionales usados;
- causa de parada;
- edición sin doble conteo.

No basta derivar el contador de `Object.keys(answers).length`.

## 14. Casos futuros de aceptación — NO EJECUTADOS

| ID | Caso | Esperado |
|---|---|---|
| F01 | evidencia suficiente en 17 | termina en 17 |
| F02 | suficiente en 24 | no pide extensión |
| F03 | gap crítico en 24 | solicita consentimiento, no cuenta como turno |
| F04 | consentimiento rechazado | termina en 24 |
| F05 | aceptado + resuelto en 2 | termina en 26 |
| F06 | persiste tras 5 | termina en 29 con abstención |
| F07 | cambio idioma/reanudación | contador no se reinicia |
| F08 | edición de respuesta | no consume turno nuevo |
| F09 | aclaración nueva | consume turno |
| F10 | pregunta duplicada/N-A | no se usa para gastar extensión |
| F11 | goal sugerido no confirmado | no altera ranking |
| F12 | goal confirmado | puede alterar alineación del ranking |
| F13 | acción de alto impacto pero dependencia previa | habilitadora puede ir primero |
| F14 | esfuerzo desconocido | no inventar cifra; desempate explícito |
| F15 | sin solución evidence-backed | recommendation puede existir con solution=null |
| F16 | replay | mismo contador, prioridades y terminalReason |

## 15. Decisión humana requerida

DEC-F puede pasar a APPROVED si se confirma:

1. separación selector de preguntas vs ranking de acciones;
2. presupuesto ordinario 24 + excepcional 5 ya aprobado como contrato futuro;
3. definición de evidencia crítica;
4. máquina conceptual de consentimiento;
5. cuatro factores de D-V9-006 sin pesos inventados;
6. objetivos solo confirmados;
7. dependencias habilitadoras;
8. fallbacks specialist/genérico/verify/prepare;
9. persistencia/replay del contador;
10. corrección futura del hard cap 24 únicamente después de aprobar el contrato de extensión.

## 16. Estado

**DEC-F = READY_FOR_HUMAN_REVIEW / NO APROBADO.**

Bloqueos principales:
- hard cap técnico 24 contradice el contrato futuro 24+5;
- ranking actual no materializa explícitamente los cuatro factores de D-V9-006.

## Changelog

- **0.1.1 / 2026-11-03:** estado de decisión reconciliado con hoja humana A–H; el contenido técnico permanece como referencia histórica y PLAN_ONLY sigue vigente.

- **0.1.0 / 2026-11-01:** paquete DEC-F; ranking actual, política multicriterio, evidencia crítica, 24+5 y brechas de implementación.
