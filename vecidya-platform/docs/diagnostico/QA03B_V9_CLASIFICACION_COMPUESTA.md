# QA-03B — Fase 6: clasificación compuesta V9

**Estado:** prototipo aislado; no importado por la sesión pública, la UI ni el Worker V8.  
**PR:** #127.  
**CI:** GitHub Actions run 40245691731 — typecheck, build, regresión Diagnóstico/Aprende y **1.767/1.767** pruebas unitarias PASS.

## Problema

El banco candidato puede sustituir preguntas genéricas por preguntas específicas cuando conoce un nicho. Preguntar sector y luego nicho en dos pantallas añadiría esfuerzo aunque ambas decisiones formen parte de una sola clasificación del negocio.

## Contrato probado

`applyClassificationInteractionV9` recibe una sola interacción de usuario y produce respuestas explícitas:
- `q2_sector=<grupo>`
- `q2_niche_<grupo>=<especialidad|other|unknown>` cuando el sector tiene selector.

No se infiere el nicho. Para sectores con especialidades registradas, la interacción no puede terminar sin una especialidad, `other` o `unknown`. Para sectores sin selector, enviar un nicho falla cerrado.

## Edición e invalidación

Cambiar sector:
1. elimina todos los `q2_niche_*` anteriores;
2. escribe el nuevo sector y, cuando corresponde, su nuevo nicho;
3. ejecuta la reconciliación R5;
4. elimina respuestas especializadas que ya no son elegibles.

Ejemplo certificado: restaurante + `q2_food_menu_visibility` → cambio a `b2b_services/marketing_agency` elimina tanto el nicho de hostelería como la respuesta sobre menú.

## Presupuesto por interacción

El planner candidato acepta un seam opcional `answeredInteractionCount` **solo en la función que recibe un banco explícito**. El wrapper público `buildCandidateQuestionPlanV3` ignora ese campo.

Cuando sector+nicho fueron capturados atómicamente:
- hay dos claves de respuesta auditables;
- `countVisibleInteractionsV9` las contabiliza como una sola interacción;
- el route budget usa el número visible y conserva `hardMax=24`.

Esto permite mantener trazabilidad sin penalizar al usuario por el detalle de clasificación.

## Replay

Cada evento V9 registra sector, nicho y los IDs de preguntas correspondientes. El replay:
- vuelve a ejecutar la validación de sector/nicho;
- reconstruye las respuestas;
- comprueba que el ID compañero coincide;
- devuelve `null` ante un evento manipulado.

## Aislamiento V8

Se mantienen sin cambios:
- `QUESTION_BANK_ID = reviewed-evidence-v8`
- `SESSION_SCHEMA = 8`
- `SESSION_KEY = vecidya.diagnostic.v3.candidate.session.8`

El entry público del planner descarta el campo de interacción V9 aunque un llamador interno intentara pasarlo.

## Siguiente fase

Crear una sesión V9 **con identidad, schema, storage key y replay propios**, todavía sin conectar la UI pública:
- banco candidato de 77 definiciones;
- política `utility_first`;
- ledger de interacciones compuestas;
- parser fail-closed;
- migración: ninguna sesión V8 se reinterpreta como V9;
- edición/replay y límites por interacciones visibles;
- luego componente UI sector→especialidad en una sola pantalla y E2E.
