# Diagnostic V9 — W4/F03 Budget 24+5

**Versión:** 0.2.0  
**Fecha:** 2026-11-01  
**Estado:** W4/F03 DONE_WITH_EVIDENCE · F04–F10 PLAN_ONLY  
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

### Budget/session/replay — PASS
SHA: `68fb6a8a7e3a04d1346527ae9b6222740454d1a4`  
Run: `41330844707`  
Job: `124920421628`

- **31 tests / 31 pass / 0 fail**.
- cubre 24+5, consentimiento no contable, aceptación/rechazo/withdraw, hard cap 29;
- cubre stop temprano <24 y ausencia de extensión falsa al boundary 24;
- cubre edición sin reembolso, resume/restore, transcript replay, Worker replay, D1 replay, ingestión y run-state;
- general typecheck/build/unit regression: **SKIPPED**.

### Graph/context — PASS
SHA: `68fb6a8a7e3a04d1346527ae9b6222740454d1a4`  
Run: `41330844766`  
Job: `124920421548`

- **31 tests / 31 pass / 0 fail**;
- C03/C05/C07/C08 y full-bank graph;
- dependencias faltantes quedan pending;
- neutralidad no autoriza specialist;
- pending no consume budget.

### Fallo útil corregido
En SHA `2dcedbc1465cc0734662db273cd032704da9b52f`, run `41330302766`, job `124919227554`, el gate obtuvo **29/30**. La reescritura de replay había perdido la comprobación de canonicalidad del evento classification; un `nicheQuestionId` manipulado podía reconstruirse desde sector/niche.

Corrección en `932ca6d8b9e2b76dd24fae543d0adef0b8de11d9`: cada evento replayado debe coincidir exactamente con su evento canónico reconstruido o falla cerrado.

### Casos de UI diferidos a F08
- cambio de idioma: actualmente no es un evento diagnóstico y por tanto no puede incrementar el contador; se certificará en UI/E2E F08;
- “aclaración” como turno separado: no existe superficie/event kind hoy; si se añade, deberá consumir interacción y tendrá prueba propia.

No bloquean el core F03 porque ninguna de las dos superficies existe actualmente en el motor de sesión.

## Changelog

- **0.2.0 / 2026-11-01:** W4/F03 cerrado; budget/replay 31/31 y graph 31/31; canonical replay fail-closed corregido; F04+ vuelve a PLAN_ONLY.
- **0.1.0 / 2026-11-01:** contrato 24+5, consentimiento persistente, hard cap 29 y replay; pendiente evidencia focal.
