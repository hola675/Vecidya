# QA-03B — Fase 7: sesión y replay V9 aislados

**Estado:** prototipo certificado en código, no conectado a UI pública ni Worker.  
**PR:** #129.  
**CI:** GitHub Actions run 40246367864 — typecheck, build, regresión Diagnóstico/Aprende y **1.774/1.774** pruebas unitarias PASS.

## Identidades V9 candidatas

| Contrato | V9 candidato |
| --- | --- |
| Session schema | `9` |
| Storage key | `vecidya.diagnostic.v3.candidate.session.9` |
| Question bank | `qa03b-specialty-branches-v9-candidate-77` |
| Engine | `qa03b-v9-utility-first-interactions-v1` |
| Replay | `qa03b-worker-replay-v7-candidate` |

V8 conserva `reviewed-evidence-v8`, schema 8 y su propia clave. Los parsers se rechazan mutuamente.

## Presupuesto por esfuerzo real

V9 mantiene un `interactionCount` histórico:
- una pregunta normal nueva suma 1;
- sector + especialidad enviados atómicamente suman 1 aunque creen dos claves de respuesta;
- editar una respuesta o la clasificación no suma otra interacción;
- invalidar una respuesta por un cambio posterior **no resta** la interacción ya consumida;
- a 24 interacciones, el planner queda en hard cap aunque haya menos de 24 respuestas activas.

Esto corrige el riesgo detectado en la certificación de rutas: V8 limita principalmente el estado activo; V9 puede limitar el esfuerzo realmente visto por la persona.

## Transcript V9

Dos eventos:
- `answer`: questionId, value, mode `answer/edit`;
- `classification`: sector+nicho explícitos y sus IDs, mode `answer/edit`.

El replay reconstruye respuestas e interacciones. Una edición de clasificación:
1. no aumenta `interactionCount`;
2. elimina el nicho anterior;
3. escribe el nuevo nicho;
4. ejecuta R5;
5. invalida respuestas especializadas incompatibles.

## Parser fail-closed

Se rechaza:
- schema/engine/bank/replay incorrectos;
- interactionCount no entero, negativo o >24;
- IDs respondidos inconsistentes con `answers`;
- queue duplicada, desconocida o ya respondida;
- transcript que no reproduce exactamente las respuestas;
- conteo del transcript distinto de `interactionCount`;
- evento de clasificación manipulado;
- estado que al replanificar cambia answers, queue, status o terminal reason.

## Aislamiento público

El seam de `answeredInteractionCount` existe solo para el planner con banco explícito. `buildCandidateQuestionPlanV3`, usado por V8, lo descarta deliberadamente. Ningún cliente puede suministrar un banco o contador al flujo público actual.

## Siguiente fase

1. Componente UI candidato para sector→especialidad en una sola pantalla, con teclado, lector de pantalla, móvil y `other/unknown`.
2. Integrar solo con `CandidateSessionV9Prototype`, nunca con V8.
3. Worker replay V9 separado que valide identidad, transcript, banco 77, interacción histórica y resultado.
4. E2E: iniciar, guardar/reanudar, editar sector, invalidar rama, alcanzar hard cap, replay y resultado.
5. Staging con storage V9 separado; no migrar automáticamente sesiones V8.
6. Solo después decidir cutover/rollout y política para sesiones V8 aún vigentes.
