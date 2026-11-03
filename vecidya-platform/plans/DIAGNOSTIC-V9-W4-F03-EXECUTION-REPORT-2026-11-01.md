# Diagnostic V9 — W4/F03 Execution Report — 2026-11-01

**Estado:** DONE_WITH_EVIDENCE  
**Scope autorizado:** W4/F03 únicamente  
**Sin autorización:** F04–F10, merge a main, deploy, producción

## 1. Estado inicial

- main: `e92c10e9ebcbb87768661eb383f16564340e63cf`
- HEAD inicial F03: `e37f743a6f3d36a59ded9efb5f56d51e56c2f191`
- PR #162: open / draft / mergeable
- branch detrás de main: 0

## 2. Contrato 24+5 implementado

- base: 24 interacciones;
- extensión opcional: 5;
- máximo absoluto: 29;
- consentimiento explícito antes de turno 25;
- consentimiento no cuenta;
- rechazo/withdraw finaliza sin preguntas extra;
- extensión solo para evidencia crítica;
- stop temprano;
- edición no consume ni reembolsa;
- replay conserva contador y consentimiento.

Nuevo módulo puro:
`app/features/diagnostic/v9/route-budget.ts`.

## 3. Aislamiento V8

`buildCandidateQuestionPlanFromBankV3` recibe un seam V9 `absoluteHardMax`.

- caller V8 no lo usa → sigue hard cap 24;
- wrapper V9 puede usar 29;
- no se cambió `ROUTE_HARD_CAP` legacy.

## 4. Versionado V9

Por cambio semántico de sesión:
- session schema: 9 → 10;
- storage key: `.9` → `.10`;
- engine: `qa03b-v9-utility-first-interactions-v3-extension`;
- replay: `qa03b-worker-replay-v8-candidate-extension`.

Sesiones viejas no se reinterpretan silenciosamente.

## 5. Consentimiento y auditoría

Nuevo evento:
`extension_consent`

Decisiones:
- accepted;
- rejected;
- withdrawn.

Integrado en:
- session transcript;
- API event normalization;
- D1 audit replay;
- Worker replay;
- run-state projection;
- UI pública.

## 6. Hallazgo durante el gate

Primer focal:
- SHA `2dcedbc1465cc0734662db273cd032704da9b52f`;
- run `41330302766`;
- job `124919227554`;
- **29/30 PASS**.

Defecto:
la nueva función de transcript replay reconstruía classification por sector/niche pero no comprobaba que el evento reconstruido fuera byte-semánticamente canónico. Un `nicheQuestionId` manipulado podía pasar esa capa.

Fix:
`932ca6d8b9e2b76dd24fae543d0adef0b8de11d9`.

Ahora cada evento replayado debe coincidir exactamente con el evento canónico que genera la sesión o falla cerrado.

## 7. Evidencia final de código F03

SHA:
`68fb6a8a7e3a04d1346527ae9b6222740454d1a4`

### Budget/session/replay
- run `41330844707`;
- job `124920421628`;
- **31/31 PASS, 0 FAIL**;
- general typecheck/build/unit regression: SKIPPED.

Incluye:
- 24 + 5 = 29;
- gap crítico en 24;
- accept/reject/withdraw;
- hard stop 29;
- early stop <24;
- no fake extension cuando evidencia ya es suficiente;
- edit sin reembolso;
- transcript/parser fail-closed;
- Worker replay;
- D1 replay;
- ingestión;
- restore/run-state;
- ownership/finalization de la ruta focal existente.

### Graph/context
- run `41330844766`;
- job `124920421548`;
- **31/31 PASS, 0 FAIL**.

Incluye:
- full-bank graph;
- C03/C05/C07/C08;
- pending dependencies;
- neutralidad;
- guards specialty;
- pending no consume budget.

## 8. Casos diferidos

No existen actualmente como eventos del motor:
- cambio de idioma;
- clarification turn separado.

Se difieren a F08/UI:
- idioma debe seguir sin consumir interacción;
- si se crea un turno de aclaración que requiera decisión, deberá consumir uno y tener prueba focal.

## 9. No modificado

- scoring/calibration F04;
- correlation F04;
- recommendations F05/F06;
- final identified store F07;
- migrations remotas;
- V8 hard cap;
- main;
- staging/producción.

## 10. Estado posterior

**F03-01 = DONE_WITH_EVIDENCE**  
**F03-02 = DONE_WITH_EVIDENCE**

**W4/F03 = DONE_WITH_EVIDENCE.**

Siguiente scope recomendado:
**W5/F04 — motor, correlación, calibration registry y scoring**, solo tras nueva autorización explícita.
