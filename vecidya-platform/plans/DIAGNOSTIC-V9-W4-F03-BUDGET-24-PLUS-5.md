# Diagnostic V9 — W4/F03 Budget 24+5

**Versión:** 0.1.0  
**Fecha:** 2026-11-01  
**Estado:** W4/F03 AUTHORIZED · PENDING_FOCAL · F04–F10 PLAN_ONLY  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Contrato implementado

- 24 interacciones ordinarias.
- Al llegar a 24 se inspecciona evidencia crítica restante.
- Sin gap crítico: finalizar sin pedir extensión.
- Con gap crítico: `extensionConsent=pending`.
- El consentimiento no incrementa `interactionCount`.
- `accepted`: hasta cinco interacciones adicionales, únicamente preguntas críticas.
- `rejected` o `withdrawn`: cierre con `extension_declined`.
- Hard cap absoluto: 29.
- Ediciones no consumen ni reembolsan interacciones.
- Replay reconstruye la decisión de consentimiento y verifica el contador.

## 2. Evidencia crítica F03

Una pregunta restante se considera crítica para abrir la extensión cuando:
- confirma una contradicción pendiente; o
- aporta evidencia directa a una dimensión aplicable aún sin resolución; o
- aporta contexto requerido/unlock necesario para una dimensión insuficiente.

Supporting/refinement sin impacto crítico no abre el tramo 25–29.

## 3. Aislamiento

El planner V8 conserva su hard cap 24.

El seam `absoluteHardMax` solo se usa desde el wrapper V9 y está acotado a 29.

## 4. Versionado

El nuevo contrato cambia la forma persistida de sesión/replay:
- session schema 9 → 10;
- storage key `.9` → `.10`;
- engine identity → `qa03b-v9-utility-first-interactions-v3-extension`;
- replay → `qa03b-worker-replay-v8-candidate-extension`.

No se acepta una sesión 24-only anterior como si ya tuviera consentimiento 24+5.

## 5. Event contract

Nuevo evento auditado:
`extension_consent`

Payload:
- `decision=accepted|rejected|withdrawn`.

No contiene respuestas y no cuenta como interacción.

## 6. UI pública

Al llegar a 24 con gap crítico:
- se explica por qué se ofrecen hasta cinco preguntas;
- aceptar/rechazar es explícito;
- rechazo permite finalizar;
- durante extensión se muestra el número restante y se puede retirar consentimiento.

## 7. Replay

La decisión de consentimiento se valida en:
- transcript local;
- Worker replay;
- D1 audit replay;
- ingestión server-side.

El Worker admite máximo 29 y rechaza rutas superiores.

## 8. Fuera de alcance

No se modifica:
- calibración/scoring F04;
- ranking de recomendaciones F05/F06;
- store final F07;
- migraciones;
- deploy/staging/producción.

## 9. Gate focal

Pendiente ejecutar exclusivamente:
- `qa03b-v9-extension-budget.test.ts`;
- `qa03b-v9-session-prototype.test.ts`;
- `qa03b-worker-replay-v9.test.ts`;
- `qa03b-v9-event-ingestion-sqlite.test.ts`;
- `qa03b-v9-run-state-sqlite.test.ts`.

La suite general permanece fuera del primer gate.

## Changelog

- **0.1.0 / 2026-11-01:** contrato 24+5, consentimiento persistente, hard cap 29 y replay; pendiente evidencia focal.
