# Diagnostic V9 — alcance condicional de implementación post-aprobación

**Versión:** 1.1.0  
**Fecha:** 2026-11-03  
**Estado:** PLAN_ONLY · CONDICIONAL · NO AUTORIZA CÓDIGO/PR/CI/DEPLOY  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Objetivo

Definir el orden de ejecución que se recomienda **solo si** el responsable aprueba DEC-A…H y después levanta PLAN_ONLY de forma explícita y acotada.

Este documento:
- no cambia estados A–H;
- no autoriza comandos;
- no ejecuta pruebas;
- no autoriza merge;
- no autoriza migraciones;
- no autoriza staging/producción.

Fuente de decisión: `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md`.

## 1A. Jerarquía documental canónica

Para resolver contradicciones históricas, prevalece este orden:
1. código/HEAD y estado Git actual;
2. `DIAGNOSTIC-V9-CURRENT-STATUS.md` para estado operativo;
3. `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md` para decisiones humanas;
4. este documento para secuencia y scopes;
5. reportes Wn por SHA/run para evidencia histórica;
6. backlog F00–F10 para tareas;
7. paquetes DEC y Master Plan como análisis/histórico cuando contradigan status posterior.

A–H están ratificadas según la hoja humana. `PLAN_ONLY` controla autorización de runtime, no el estado de las decisiones.

## 2. Principio de ejecución

Cada lote futuro debe seguir:

`inspección SHA → scope mínimo → cambio acotado → prueba focal → evidencia/log → commit → reevaluar gate`.

No usar suites generales como primera prueba.  
No mezclar limpieza legacy, UI, migraciones y scoring en un mismo lote.

## 3. Orden recomendado de waves

### W0 — ratificación humana
Sin código.

Salida:
- A–H con estado humano;
- fallbacks registrados;
- alcance exacto de PLAN_ONLY levantado;
- tareas autorizadas identificadas.

STOP:
- cualquier DEC sigue OPEN/ambigua sin fallback.

---

### W1 — F00: reconciliación Git y migraciones — DONE_WITH_EVIDENCE HISTÓRICO

W1/F00 fue ejecutado el 2026-11-01 con main ancestro, migraciones V9 renumeradas a 0038–0043 y 43/43 pruebas focales PASS. Esa evidencia permanece válida para el SHA ejecutado.

### W1R — revalidación Git obligatoria antes de nuevo runtime

El cierre histórico de W1 no congela `main`. En la revisión 2026-11-03 la rama volvió a estar diverged respecto a `main`; ahead/behind debe reconsultarse inmediatamente antes de ejecutar.

W1R debe, antes de F07-L1:
- reconsultar `main`, PR #162, HEAD, ahead/behind y merge-base;
- revisar commits nuevos de main y overlap con archivos/dependencias del próximo lote;
- verificar nuevas migraciones/journal;
- si existe overlap material, reconciliar main→V9 en lote Git separado, con backup/ref y pruebas focales;
- no mezclar sincronización Git con implementación F07-L1.

Gate W1R:
- base actual conocida y registrada;
- ningún cambio concurrente material desconocido en scope L1/L2;
- secuencia de migraciones trazable;
- si se integra main, cero pérdida de productos adyacentes y main vuelve a ser ancestro.

STOP:
- conflicto transversal fuera del scope;
- migración aplicada que exija reconciliación forward-compatible;
- cambios en contratos V9 que invaliden D21/D23.

---
### W2 — F01: frontera autónoma V9 — DONE_WITH_EVIDENCE

Objetivo:
- mapa de imports/exports/consumidores;
- REPLACE/SHARED/ADAPTER/RETAIN/DELETE_AFTER_CUT;
- núcleo futuro V9 sin runtime QBV2/V8.

Incluye ADRs:
- storage de resultados identificados;
- separación borrador local / procesamiento / analítica;
- registry de versiones.

Pruebas focales:
- búsqueda estática de imports;
- ciclos;
- consumidores de contratos compartidos.

Gate alcanzado:
- cada dependencia legacy censada tiene destino;
- allowlist estática impide drift silencioso;
- ningún store se asume por conveniencia;
- registry objetivo definido;
- prueba focal 3/3 PASS en run 41325376095.

Estado posterior:
- F02–F10 permanecen PLAN_ONLY.

---

### W3 — F02: banco editorial canónico — DONE_WITH_FALLBACK

Aplicar DEC-A/C:

1. 77 baseline;
2. implementar KEEP/REWRITE aprobados con versionado;
3. mantener ADD 82/90 pending salvo aprobación individual;
4. real-estate sin sustitución hasta gate;
5. ES/EN y neutralidad.

Pruebas focales:
- IDs/versions únicos;
- opciones válidas;
- unknown/N-A/other/unanswered;
- routing specialist/fallback;
- copy ES/EN por ítems modificados.

Gate alcanzado con fallback:
- manifest V9-owned `diagnostic-v9-canonical-77-baseline-v1`;
- 18 KEEP + 59 rewrite_pending;
- 13 extensiones excluidas;
- ningún pending ADD activado;
- 29/29 PASS;
- las definiciones ejecutables siguen usando adapter hasta F03/F04.

---

### W4 — F03: grafo y presupuesto 24+5 — DONE_WITH_EVIDENCE

Aplicar DEC-F:

- planner ordinario 0–24;
- gate de evidencia crítica;
- consentimiento no contable;
- extensión 25–29;
- contador idempotente;
- reanudación sin reinicio;
- stop temprano.

Pruebas focales mínimas:
- termina <24 cuando suficiente;
- turno 24 suficiente;
- turno 24 gap crítico;
- consentimiento rechazado;
- consentimiento aceptado;
- stop en 26 al resolver;
- hard stop 29;
- cambio idioma;
- reanudación;
- edición sin doble conteo;
- aclaración nueva sí cuenta.

Gate alcanzado:
- ningún camino V9 >29;
- extensión solo con preguntas críticas de evidencia/contexto, no supporting/refinement comercial;
- consentimiento no cuenta;
- edición no reembolsa;
- stop temprano probado;
- replay local/Worker/D1 reproduce contador y consentimiento;
- budget/session/replay: 31/31 PASS;
- graph/context: 31/31 PASS.

Diferidos a F08 por no existir hoy como eventos del motor:
- cambio de idioma;
- aclaración explícita como turno independiente.

---

### W5 — F04: motor, correlación y calibración — DONE_WITH_EVIDENCE

Orden interno obligatorio:

#### W5.1 — DEC-D
- constructKey;
- overlapGroup;
- eventKey/periodKey;
- fail-closed;
- deduplicación antes del scorer.

#### W5.2 — DEC-B registry
Crear contrato:
`scoring_version → calibration identity/version`.

Prohibir defaults implícitos en:
- Worker replay;
- finalization;
- result pipeline.

#### W5.3 — score
- direct-required;
- supporting capped;
- neutral=null;
- applicability;
- >=3 + >=60%;
- global null cuando insuficiente.

Pruebas focales:
- mismo hecho/dos IDs;
- eventos distintos;
- conflicto;
- supporting-only;
- 0/1/2 directas;
- N/A/unknown;
- run histórico con calibration vieja;
- mismatch version;
- replay/finalization parity.

Gate alcanzado:
- scoring autónomo V9 sin imports runtime QBV2/QA03B;
- registry V9-owned cubre 40 mappings migrados del bank77;
- mismo hecho/dos IDs solo deduplica con correlación explícita;
- eventos distintos permanecen independientes;
- conflicto/unmapped = fail-closed;
- direct-required, supporting cap y neutral=null;
- v4 exige >=3 dimensiones y >=60% aplicables;
- runs históricos v1-v4 resuelven calibración explícita; versión desconocida falla cerrado;
- Worker/finalization/result identity incluyen scoring/calibration reproducibles;
- gate focal: 32/32 PASS en run 41334411521 / job 124931051762.

---

### W6 — F07: sesión, privacidad e identidad — DEC-E RATIFICADO / IMPLEMENTACIÓN PENDIENTE

DEC-E queda ratificado a nivel de producto/arquitectura, sin levantar PLAN_ONLY.

Decisiones vigentes:
- E1: borrador anónimo exclusivamente local;
- E2: TTL del borrador incompleto = 7 días desde último guardado válido;
- E3: replay/procesamiento autoritativo transitorio, sin ledger individual anónimo persistente en D1;
- E4: comprobante verificable; el guardado identificado verifica el resultado original y no recalcula scoring;
- E5: resultado anónimo finalizado local con TTL = 24 horas;
- E6: propiedad personal; vínculo organizativo voluntario sin acceso automático de otros miembros;
- E7: informe identificado mientras exista la cuenta, con eliminación voluntaria;
- E8: backups con expiración máxima objetivo de 30 días, pendiente de certificación operativa;
- E9: reclamación por posesión del paquete; primera reclamación autenticada válida, atómica e idempotente;
- E10: analítica anónima únicamente agregada, no reconstructiva;
- E-Q1-B: D1 puede usar tablas separadas para informes identificados, aisladas de la analítica anónima agregada.

#### W6.1 / F07-L1 — borrador local — READY_AFTER_W1R
- reutilizar `CandidateSessionV9Prototype` como fuente de verdad;
- envelope local mínimo versionado, sin duplicar timestamp de autoridad;
- TTL = `session.updatedAt + 7 días`; leer no renueva TTL;
- store de borrador acepta solo `in_progress` y `completing`, nunca `completed`;
- parser V9 fail-closed;
- concurrencia/revision controlada;
- almacenamiento no disponible => continuar en memoria sin prometer recuperación;
- `diagnostic-v9.tsx` deja de crear identidad anónima y run D1 para iniciar el flujo anónimo;
- cero escrituras D1 durante borrador;
- no tocar scoring, banco, calibración ni migraciones.

Pruebas focales previstas:
- LOCAL-11…LOCAL-25;
- restauración;
- expiración;
- corrupción/tampering;
- storage unavailable;
- conflicto cross-tab;
- consentimiento 24+5;
- clear;
- cero persistencia D1.

#### W6.2 / F07-L2 — replay transitorio
- adaptar replay V9 autoritativo existente;
- validar identidad de motor/banco/replay/scoring;
- reconstruir transcript y ruta;
- rechazar sesiones con `now - session.updatedAt > 7 días`; el TTL Worker heredado de 14 días no gobierna este flujo;
- procesar sin ledger anónimo duradero;
- resultado reproducible;
- cero raw answers en analítica.

Pruebas focales:
- REPLAY-21…REPLAY-32.

#### W6.3 / F07-L3 — finalización y comprobante
- finalización autoritativa;
- resultado canónico verificable;
- TTL local 24 h;
- integridad criptográfica;
- rotación/custodia de claves;
- no confundir integridad con identidad/propiedad.

Pruebas focales:
- FIN-21…;
- TOKEN-21…;
- PRIV de no persistencia.

#### W6.4 / F07-L4 — informe identificado
- tablas D1 separadas según E-Q1-B;
- owner personal obtenido de sesión autenticada;
- save idempotente y transaccional;
- primera reclamación por posesión;
- no recalcular resultado;
- org link voluntario sin lectura automática.

Pruebas focales:
- SAVE-21…;
- AUTH-23…;
- concurrencia y cross-user.

#### W6.5 / F07-L5 — retención y eliminación
- eliminación de datos activos y dependencias;
- cierre de cuenta;
- backups ≤30 días, sujeto a prueba real;
- restauración no debe resucitar datos eliminados;
- inventario/limpieza de datos anónimos históricos del prototipo;
- política de analítica agregada pendiente de plazo operativo.

Pruebas focales:
- RET-21…;
- PRIV-26….

#### W6.6 / F07-L6 — integración focal
Recorrido a certificar:
`anónimo → borrador local → 24+5 → replay transitorio → resumen → login opcional → claim/save → consulta → eliminación`.

Gate W6:
- cero acceso cruzado;
- cero ledger anónimo reconstructivo en D1;
- cero respuestas crudas en analytics;
- claim no recalcula;
- resultado identificado conserva identidad/versiones;
- fallos de red y concurrencia no duplican;
- DEC-E sigue separado de GHL;
- pruebas focales registradas sobre SHA exacto.

Condiciones operativas pendientes que NO reabren DEC-E:
- demostrar purga/restauración de backups dentro de 30 días;
- concretar algoritmo, custodia y rotación de claves;
- implementar claim atómico;
- fijar plazo de retención de analítica agregada;
- inventariar datos históricos del prototipo;
- cerrar textos finales de privacidad/consentimiento.

---

### W6-D21 — paquete ejecutable condicionado de F07-L1

**Estado:** READY_FOR_SCOPED_AUTHORIZATION · PLAN_ONLY · NO IMPLEMENTADO.

Objetivo: preparar un único lote que cambie el borrador anónimo de persistencia remota a persistencia local, sin avanzar a replay transitorio/finalización/informe.

#### Funciones/contratos a crear

Archivo propuesto `app/features/diagnostic/v9/local-draft.ts`:
- `DIAGNOSTIC_V9_LOCAL_DRAFT_STORAGE_VERSION = 1`;
- `DIAGNOSTIC_V9_LOCAL_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000`;
- `DiagnosticV9LocalDraftEnvelope`;
- `parseDiagnosticV9LocalDraft(raw, now)`;
- `buildDiagnosticV9LocalDraftEnvelope(session)`;
- no usar `expiresAt` como segunda fuente de verdad; derivar expiración de `session.updatedAt + DIAGNOSTIC_V9_LOCAL_DRAFT_TTL_MS`;
- si se conserva un campo derivado por ergonomía, validarlo contra ese cálculo y nunca confiar en él aislado;
- delegar validación estructural a `parseCandidateSessionV9Prototype`;
- rechazar `status === "completed"` en el store de borrador de 7 días.

Archivo propuesto `app/features/diagnostic/v9/local-draft.client.ts`:
- `DiagnosticV9StorageLike`;
- `DiagnosticV9LocalDraftStore`;
- `readResult(now)` con estados explícitos `found | empty | expired | invalid | unavailable`;
- `write(session)` con `revision`, `sessionId` y repetición exacta;
- `clear()`;
- `navigator.locks` cuando exista;
- fallback optimista sin overwrite silencioso.

#### Contratos existentes a reutilizar sin duplicar

- `CandidateSessionV9Prototype`;
- `createCandidateSessionV9Prototype`;
- `parseCandidateSessionV9Prototype`;
- `currentCandidateQuestionIdV9`;
- `submitCandidateAnswerV9Prototype`;
- `submitClassificationV9Prototype`;
- `editCandidateAnswerV9Prototype`;
- `editClassificationV9Prototype`;
- `submitExtensionConsentV9Prototype`;
- límites y estados de `route-budget`.

No crear un segundo modelo de answers/queue/interactionCount.

#### Integración UI permitida

`app/routes/diagnostic-v9.tsx` y `app/routes/diagnostic-v9-run.tsx` forman conjuntamente la frontera L1. La ruta de inicio debe dejar de crear identidad anónima y `run` D1 para comenzar una entrevista anónima; la ruta de ejecución debe eliminar los POST/GET de persistencia de cada respuesta en el flujo local.

Durante L1:
- el flujo local puede llegar hasta `readyToFinalize`;
- la finalización transitoria pertenece a L2/L3 y no se implementa por inferencia;
- el nuevo flujo no debe publicarse como reemplazo completo si todavía no puede finalizar;
- si hace falta, conservarlo detrás del gate V9 existente o de una frontera interna no pública hasta L2/L3;
- corregir el copy que hoy afirma que las respuestas “se guardan en Vecidya” para que no contradiga DEC-E cuando el flujo local se active.

#### Archivos permitidos

- `app/features/diagnostic/v9/local-draft.ts` — nuevo;
- `app/features/diagnostic/v9/local-draft.client.ts` — nuevo;
- `app/routes/diagnostic-v9.tsx` — cambio mínimo para iniciar una sesión local sin `anonymous-identity` ni POST `/api/diagnostic/v9/runs`;
- `app/routes/diagnostic-v9-run.tsx` — cambio mínimo de frontera local;
- `tests/unit/diagnostic/diagnostic-v9-local-draft.test.ts` — nuevo;
- opcional `tests/unit/diagnostic/diagnostic-v9-local-session.test.ts` únicamente si la integración UI/controlador requiere separar lógica testeable.

Cualquier archivo adicional requiere reevaluación de scope antes de editar.

#### Archivos/áreas prohibidos en L1

- `db/migrations/**`;
- endpoints `api-diagnostic-v9-*` salvo lectura de contexto, sin edición; L1 elimina su uso en el camino anónimo pero no los borra;
- scoring/calibration/correlation;
- banco canónico y planner;
- Worker replay/finalization;
- auth/claim/organizations;
- GHL;
- Aprende/Servicios;
- V8/legacy cleanup;
- configuración de deploy/Workers.

#### Pruebas focales obligatorias

LOCAL-11…LOCAL-25:
- creación/restauración;
- TTL derivado de `updatedAt` antes/después de 7 días;
- JSON corrupto;
- versión/motor/banco/replay incompatible;
- transcript manipulado;
- localStorage unavailable;
- conflicto de revisión/cross-tab;
- clear;
- lectura no renueva TTL;
- escritura válida actualiza `updatedAt` y por derivación la expiración;
- estado `completed` no puede persistirse en draft store;
- ruta de inicio anónima no crea identidad/run D1;
- consentimiento de extensión preservado;
- límite 24+5 preservado;
- cero llamadas de persistencia D1 en el camino local probado.

Comando focal previsto, revalidado contra `package.json`:

`node --experimental-strip-types --import ./tests/unit/register-ts.mjs --test tests/unit/diagnostic/diagnostic-v9-local-draft.test.ts`

Si existe el segundo archivo focal autorizado, ejecutarlo de forma explícita en el mismo comando o en una segunda invocación focal. No ejecutar `pnpm test:unit` general para cerrar L1.

Typecheck/build solo se amplían si el cambio de la ruta TSX los hace necesarios para demostrar compilación, registrando esa ampliación como verificación del scope tocado y no como suite general de regresión.

#### Rollback L1

Rollback de código:
1. revertir únicamente el/los commits de F07-L1;
2. no hay migración que revertir;
3. no hay datos D1 nuevos que limpiar;
4. la ruta remota actual permanece como baseline hasta el cutover posterior;
5. no borrar claves legacy ajenas al contrato V9.

Rollback de datos locales:
- el store V9 solo puede eliminar su propia clave;
- nunca migrar/eliminar automáticamente claves de otro contrato;
- un payload incompatible se descarta/aisla según el contrato L1 sin reinterpretarlo.

#### Gate de cierre F07-L1

L1 solo se declara PASS si:
- el borrador anónimo probado es local-only;
- TTL = 7 días desde último guardado válido;
- lectura no prolonga retención;
- parser/replay V9 fail-closed conserva identidades;
- conflicto no sobrescribe revisión más nueva;
- almacenamiento bloqueado no rompe la sesión en memoria;
- no hay escritura individual D1 durante la fase de borrador probada;
- scoring/banco/calibración no cambiaron;
- pruebas focales pasan sobre SHA registrado;
- no se afirma finalización completa: L2/L3 siguen pendientes.

STOP:
- cualquier necesidad de migración;
- necesidad de modificar scoring/bank;
- dependencia obligatoria de run D1 para continuar el borrador;
- scope adicional no previsto;
- fallo que solo pueda “arreglarse” ampliando hacia L2–L6 sin autorización.

---

### W6-D22 — preflight final y contrato de autorización F07-L1

**Estado:** PLAN_ONLY · PREFLIGHT CERRADO · EJECUCIÓN NO AUTORIZADA.

Snapshot Git verificado el 2026-11-03:
- PR maestro: **#162**;
- PR: abierto, draft, no merged;
- base: `main`;
- rama: `feat/diagnostic-v9-lex-graph-p1b`;
- HEAD observado: `ea14c3c91da20256e6a4245c09d7f555a007afe0`;
- merge-base observado: `e92c10e9ebcbb87768661eb383f16564340e63cf`;
- comparación `main...rama`: **diverged**;
- ahead: **736** commits;
- behind: **15** commits;
- GitHub reporta `mergeable=false` en este snapshot.

Interpretación:
- el estado diverged/behind debe revalidarse justo antes de ejecutar L1;
- `mergeable=false` no se usa por sí solo para afirmar conflicto semántico en F07-L1;
- si `main` cambió archivos permitidos o dependencias directas de L1, STOP y reevaluación;
- no integrar `main` ni resolver conflictos como efecto lateral de autorizar F07-L1.

#### Scope congelado que puede autorizarse

La autorización de F07-L1 solo cubre:
1. `app/features/diagnostic/v9/local-draft.ts`;
2. `app/features/diagnostic/v9/local-draft.client.ts`;
3. cambio mínimo en `app/routes/diagnostic-v9-run.tsx` si es necesario para demostrar el flujo local;
4. `tests/unit/diagnostic/diagnostic-v9-local-draft.test.ts`;
5. opcional `tests/unit/diagnostic/diagnostic-v9-local-session.test.ts` si la separación de lógica lo exige.

Queda fuera:
- L2–L6;
- migraciones/D1;
- endpoints de run/finalization/claim;
- scoring/bank/calibration;
- auth/org/GHL;
- cutover, CI general, staging o deploy.

#### Revalidación obligatoria inmediatamente antes del primer cambio

1. leer HEAD actual de la rama;
2. comparar `main...rama`;
3. verificar que los archivos permitidos no recibieron cambios concurrentes inesperados;
4. comprobar `package.json` y loader TS de tests;
5. comprobar que `CandidateSessionV9Prototype` y `parseCandidateSessionV9Prototype` mantienen el contrato esperado;
6. registrar SHA inicial del lote.

Si cualquiera de esos contratos cambió materialmente respecto a D21, no se empieza implementación: se vuelve a PLAN_ONLY para ajustar el scope.

#### Evidencia mínima exigida al cierre

Registrar:
- SHA inicial;
- archivos modificados;
- diff limitado al allowlist;
- comando(s) focal(es);
- exit code;
- número de pruebas PASS/FAIL;
- cualquier reintento;
- SHA final del lote;
- confirmación explícita de cero migraciones, cero D1 y cero deploy.

No reutilizar como evidencia los PASS históricos de W1–W5 para afirmar que L1 pasó.

#### Texto de autorización suficiente

Para levantar PLAN_ONLY únicamente en este lote, una autorización humana debe ser inequívoca, por ejemplo:

`AUTORIZO F07-L1 únicamente. Implementa el borrador local según W6-D21/D22, ejecuta pruebas focalizadas y no avances a F07-L2 ni a migraciones/deploy.`

Una respuesta genérica como `continúa`, `sigue` o `next` **no levanta PLAN_ONLY**.

#### Estado posterior esperado

Si L1 obtiene autorización y PASS:
- marcar `F07-L1 = DONE_WITH_EVIDENCE`;
- registrar SHA/comandos/resultados;
- volver a `PLAN_ONLY`;
- preparar preflight separado de F07-L2;
- no asumir autorización encadenada.

---

### W6-D23 — paquete ejecutable condicionado de F07-L2

**Estado:** PLAN_ONLY · DISEÑO CERRADO · EJECUCIÓN NO AUTORIZADA.

Objetivo: preparar el replay/procesamiento autoritativo transitorio que recibirá una sesión V9 completa/finalizable desde el navegador, la reconstruirá con contratos canónicos y producirá el core diagnóstico sin crear un ledger individual anónimo persistente.

#### Hallazgos verificados del runtime actual

`worker-replay-v9.server.ts` ya:
- valida envelope exacto;
- exige identidad de motor, banco, answer schema, session schema, session key y replay version;
- resuelve explícitamente `scoringVersion`;
- rechaza sesiones expiradas/incompletas;
- usa `parseCandidateSessionV9Prototype`;
- reconstruye eventos autoritativamente;
- compara answers, IDs respondidos, transcript y contador;
- valida límite absoluto 24+5;
- calcula scoring y overall con registry/calibration explícitos;
- devuelve un `core` versionado.

El test existente `qa03b-worker-replay-v9.test.ts` ya cubre:
- replay autoritativo;
- scoring histórico explícito;
- versión desconocida fail-closed;
- envelopes V8/híbridos rechazados;
- tampering de transcript/contador/answers;
- expiración;
- sesión incompleta.

#### Problemas a corregir/aislar en L2

1. `QA03B_V9_WORKER_TTL_MS` actual = 14 días. Para el flujo transitorio F07-L2, el servidor debe aplicar explícitamente un máximo de 7 días desde `session.updatedAt`; el valor heredado de 14 días no es válido como gate de este flujo ni implica retención servidor.
2. El módulo está bajo `qa03b/` y conserva naming legacy; L2 no debe duplicar scoring ni moverlo de forma masiva. Se recomienda un adapter V9-owned pequeño que encapsule el contrato transitorio.
3. El test actual mezcla replay puro con repositorios D1/finalization histórica. L2 necesita pruebas focales nuevas que demuestren explícitamente **cero persistencia** en el camino transitorio.
4. L2 no crea todavía el comprobante criptográfico ni guarda informes; eso pertenece a L3/L4.

#### Contrato propuesto a crear

Archivo propuesto:
`app/features/diagnostic/v9/transient-replay.server.ts`

Responsabilidades:
- definir `TransientReplayRequestV9`;
- construir/validar el envelope desde identidades V9 canónicas;
- delegar en `replayQa03bSessionV9Core` o una extracción mínima equivalente;
- mapear errores internos a fallos transitorios estables;
- no recibir ni depender de `runId`, owner, organization o claim;
- no escribir D1;
- no escribir logs con respuestas/transcript;
- devolver únicamente core + identidades/versiones necesarias para L3.

No crear un segundo scorer ni una segunda lógica de route replay.

#### Endpoint futuro permitido dentro de L2

Ruta propuesta:
`app/routes/api-diagnostic-v9-finalize-anonymous.ts`

En L2, si se autoriza junto al adapter, solo puede:
- aceptar POST same-origin;
- content-type JSON;
- límite estricto de payload;
- rate limit;
- validar body con contrato exacto;
- invocar transient replay;
- devolver core transitorio/error;
- no crear run;
- no crear identity;
- no escribir events/snapshots/results;
- no emitir todavía attestation persistible si eso exige decisiones L3.

Si se prefiere separar endpoint de adapter, el endpoint puede diferirse a L3. Esa elección se fija en la autorización del lote, no por inferencia.

#### Archivos permitidos en una futura autorización L2

Mínimo:
- `app/features/diagnostic/v9/transient-replay.server.ts` — nuevo;
- `tests/unit/diagnostic/diagnostic-v9-transient-replay.test.ts` — nuevo.

Opcionales, solo si el scope autorizado los incluye:
- `app/routes/api-diagnostic-v9-finalize-anonymous.ts` — nuevo;
- prueba focal de la ruta.

Lectura/reutilización permitida sin edición:
- `qa03b/worker-replay-v9.server.ts`;
- `qa03b/v9-session-prototype.ts`;
- scoring/calibration/correlation registries;
- route-budget.

Editar `worker-replay-v9.server.ts` requiere justificación explícita de por qué el adapter no puede aislar el cambio.

#### Archivos/áreas prohibidos en L2

- `db/migrations/**`;
- `v9-event-ingestion.server.ts`;
- `v9-audit-repository.ts`;
- `v9-identity-repository.ts`;
- claim/org/auth persistence;
- informe identificado;
- comprobante/token firmado de L3;
- GHL/Aprende/Servicios;
- cutover/deploy;
- refactors amplios de naming QA03B.

#### Pruebas focales L2

REPLAY-21…REPLAY-32:
- sesión finalizable válida → core válido;
- sesión con `updatedAt` >7 días → `expired`;
- pregunta/evento fuera de ruta → rechazo;
- edit válido conserva contador;
- rechazo extensión finaliza sin extra;
- aceptación extensión nunca supera 29;
- scoringVersion desconocida → fail-closed;
- evidencia insuficiente legítima no se convierte automáticamente en error;
- transcript/answers/contador manipulados → rechazo;
- misma sesión + mismas versiones → resultado semánticamente equivalente;
- cero escrituras D1;
- replay funciona aunque D1 no esté disponible;
- errores no incluyen raw answers/transcript.

Pruebas adicionales de frontera HTTP si endpoint entra en L2:
- método/origin/content-type;
- tamaño máximo;
- payload con claves extra;
- rate limit;
- respuesta sin cache sensible.

#### Comando focal previsto

`node --experimental-strip-types --import ./tests/unit/register-ts.mjs --test tests/unit/diagnostic/diagnostic-v9-transient-replay.test.ts`

Si se modifica el replay existente por necesidad, añadir explícitamente:
`tests/unit/diagnostic/qa03b-worker-replay-v9.test.ts`

No ejecutar la suite general por rutina.

#### Gate de cierre F07-L2

L2 solo puede marcarse PASS si:
- el core se reconstruye autoritativamente desde una sesión V9 válida;
- no confía en score/result aportado por cliente;
- no crea ledger/run/identity anónimo persistente;
- no depende de D1 para completar el replay;
- versiones desconocidas o híbridas fallan cerrado;
- 24+5 permanece intacto;
- scoring/calibration no se duplican;
- logs/errores no exponen respuestas;
- pruebas focales pasan sobre SHA registrado.

#### Rollback L2

- revertir únicamente commits L2;
- sin migraciones ni limpieza D1;
- L1 local permanece intacto;
- el endpoint, si se añadió, se retira junto al adapter;
- no modificar ni borrar el replay histórico existente para efectuar rollback.

#### STOP

Detener y volver a PLAN_ONLY si:
- se requiere persistencia individual anónima para hacer replay;
- se necesita una migración;
- el adapter exige cambiar scoring/calibration;
- el scope deriva hacia attestation/claim/informe;
- aparece dependencia de D1 no contemplada;
- el cambio requiere refactor amplio de QA03B/V8.

La autorización de L1 no autoriza L2. L2 requiere una autorización independiente después de que L1 esté DONE_WITH_EVIDENCE.

---

### Secuencia canónica restante — corrige dependencia W6/W7

La numeración de waves se conserva por trazabilidad, pero la dependencia ejecutable desde este punto es:

1. **W1R** — revalidación/sincronización Git;
2. **F07-L1** — borrador anónimo local;
3. **F07-L2** — replay transitorio;
4. **F07-L3** — finalización + attestation verificable;
5. **F05-01** — resumen anónimo sobre el resultado canónico;
6. **F06-01/F06-02** — prioridades, acciones, Aprende/Servicios; GHL sigue opcional/separado;
7. **F05-02** — contrato definitivo del informe identificado;
8. **F07-L4** — save/claim/owner sobre un contrato de informe ya definido;
9. **F07-L5** — retención, eliminación, cierre de cuenta y backup semantics;
10. **F07-L6** — recorrido integrado E2E;
11. **F08** — certificación integrada;
12. **F09** — cutover V8→V9;
13. **F10** — staging, piloto, aceptación, producción y postdeploy.

**Regla de dependencia:** F07-L4/L5/L6 no pueden cerrarse antes de F05/F06 porque no debe persistirse como definitivo un informe cuyo contrato de producto aún no está cerrado.

**F07-L3 ADR técnico obligatorio antes de implementar:** definir attestation version/id, canonical serialization, digest, algoritmo, key id, custodia/rotación, issuedAt/expiresAt (24 h), clock skew y verificación de claves retiradas. Esto concreta E4 y no reabre DEC-E.

---
### W7 — F05/F06: resultado, prioridades y enriquecimiento

#### F05
- resumen anónimo;
- informe detallado autenticado;
- misma evaluación base;
- evidencia/limitaciones;
- versiones.

#### F06
Aplicar DEC-F/G:
- ranking multicriterio sin pesos inventados;
- acción autónoma;
- Aprende read-only;
- servicios Vecidya read-only;
- GHL opcional y consentido.

Pruebas focales:
- mismo diagnóstico con/sin catálogo;
- recurso despublicado;
- catálogo vacío;
- servicio retirado;
- GHL offline;
- goal sugerido no confirmado;
- goal confirmado;
- dependency ordering.

Gate:
- score/prioridad invariantes frente a catálogos;
- acción útil sin compra.

---

### W8 — F08: certificación integrada

Solo después de W1–W7.

Pruebas:
- C01–C10;
- ES/EN;
- sector/nicho change;
- pause/prelaunch/no-sales;
- hybrid;
- replay;
- seguridad/autorización;
- 24+5;
- accesibilidad;
- reduced motion;
- errores y concurrencia;
- payload/rate limits;
- regresión delimitada de consumidores.

Aquí sí puede autorizarse un gate más amplio, pero debe registrar:
- SHA;
- comandos;
- exit code;
- logs;
- fallos/reintentos;
- entorno.

Gate:
- cero críticos/altos;
- resultados reproducibles;
- rollback probado a nivel de código/flag.

---

### W9 — F09: conmutación V8→V9

Solo con F08 PASS y aprobación de corte.

- switch controlado;
- V8 conservado como rollback inicial;
- smoke focal;
- referencias residuales;
- retirar legacy únicamente después de demostrar cero consumidores.

Nunca:
- borrar migraciones históricas;
- limpiar legacy antes del switch certificado.

---

### W10 — F10: staging, piloto y producción

Orden:
1. staging;
2. migraciones;
3. smoke real;
4. piloto representativo;
5. revisar métricas/logs;
6. rollback real;
7. aceptación;
8. autorización explícita;
9. producción;
10. postdeploy.

Producción no se infiere de CI/staging.

## 4. Matriz bloqueo → wave

| Bloqueo actual | Wave que lo resuelve |
|---|---|
| v2/v4 calibration binding | RESUELTO W5 — registry explícito y replay histórico |
| doble conteo/correlación | RESUELTO W5 — correlation fail-closed antes del scorer |
| local-only vs ledger D1 | W2 contrato cerrado; implementación W6 |
| hard cap 24 vs 24+5 | RESUELTO W4 — core 31/31 PASS |
| migraciones 0030–0035 | W1 |
| restore/versioning | W2 registry objetivo cerrado; implementación W3/W5 |
| A–H sin aprobación | W0 |
| CLASS-01…04 sin PASS actual | W3–W8 |

## 5. Próximo scope y autorización

Antes de cualquier runtime nuevo se ejecuta **W1R** como gate Git separado. W1R no autoriza cambios de producto.

Después de W1R, el primer scope runtime elegible es **F07-L1 solamente**, con:
- `local-draft.ts` y `local-draft.client.ts`;
- `diagnostic-v9.tsx` para eliminar creación previa de identidad/run D1 en anónimo;
- `diagnostic-v9-run.tsx` para sesión local;
- tests LOCAL focales;
- cero migraciones, scoring, finalization, claim, GHL o deploy.

Cada lote posterior requiere autorización independiente según la secuencia canónica anterior.
## 6. Regla de pruebas focalizadas

El comando exacto NO se fija en este documento porque debe verificarse contra los scripts disponibles en el checkout del SHA de ejecución.

Para cada cambio:
1. localizar test existente más cercano;
2. ejecutar solo ese archivo/grupo;
3. si no existe, añadir el test focal correspondiente dentro del scope autorizado;
4. ampliar solo cuando un gate de integración lo requiera.

No usar “todos los tests” como rutina de cierre de cada commit.

## 7. READY_FOR_AGENT

Estado actual:

**READY_FOR_F07-L1_HANDOFF · W1R DONE · NO RUNTIME IMPLEMENTADO**

Para declarar READY_FOR_AGENT de F07-L1 deben cumplirse todos:
- W1R ya cerrado en `9240bf29f50fa7e72406c72b9bb39fc2252282de`;
- el siguiente agente debe trabajar únicamente F07-L1;
- scope dentro del allowlist D21 corregido;
- comandos focales revalidados en checkout;
- ningún cambio material del parser/session contract;
- no incluir L2+, migraciones ni deploy por inferencia.
## 8. Estado general para terminar V9

| Bloque | Estado | Falta principal |
|---|---|---|
| W0 / A–H | RATIFICADO | no reabrir decisiones |
| W1/F00 | DONE histórico | W1R por nueva divergencia con main |
| W2/F01 | DONE_WITH_EVIDENCE | revalidación solo si dependencias cambian |
| W3/F02 | DONE_WITH_FALLBACK | baseline 77 vigente; 59 rewrites + 13 candidatos siguen deuda explícita |
| W4/F03 | DONE_WITH_EVIDENCE | integración final F08 |
| W5/F04 | DONE_WITH_EVIDENCE | integración final F08 |
| F07-L1 | diseño corregido | W1R + autorización + implementación |
| F07-L2 | diseño corregido | TTL servidor 7d + implementación |
| F07-L3 | diseño | ADR attestation + implementación |
| F05/F06 | pendiente | resumen, prioridades, recomendaciones e informe definitivo |
| F07-L4/L5/L6 | pendiente | save/claim, privacidad/retención, E2E después de F05/F06 |
| F08 | pendiente | certificación integral + typecheck/build |
| F09 | pendiente | cutover + rollback |
| F10 | pendiente | staging→piloto→aceptación→producción |

Regla de pruebas:
- por lote: tests focales;
- al cerrar una wave de runtime: typecheck del scope integrado;
- cierre W6/F07 integrado: tests focales acumulados + typecheck + build;
- F08: matriz integrada/regresión delimitada + typecheck + build + seguridad/accesibilidad/concurrencia.

La deuda editorial F02 no se oculta: producción inicial solo puede usar baseline 77 si esa condición permanece explícita en el release gate; promover rewrites/82/90 exige sus propios gates/versiones.
## Changelog

- **1.1.0 / 2026-11-03:** W1R cerrado con main ancestro/behind 0; documento listo para handoff a F07-L1.
- **1.0.0 / 2026-11-03:** revisión punta-a-punta: W1R obligatorio, jerarquía documental, L1 incluye start route y TTL derivado de updatedAt, draft prohíbe completed, L2 TTL servidor 7d, secuencia F07-L1→L3→F05/F06→L4-L6, ADR attestation, gates de pruebas y deuda editorial explícita.
- **0.9.0 / 2026-11-03:** W6-D23 añadido: paquete condicionado F07-L2 con adapter transitorio, alcance, pruebas REPLAY, zero-D1 gate, rollback y STOP; PLAN_ONLY continúa.
- **0.8.0 / 2026-11-03:** W6-D22 añadido: snapshot Git/PR, divergencia main...rama, revalidación obligatoria, scope congelado, evidencia y contrato de autorización explícita para F07-L1; sigue PLAN_ONLY.
- **0.7.0 / 2026-11-03:** W6-D21 añadido: paquete ejecutable condicionado F07-L1 con funciones, allowlist/denylist de archivos, comando de test focal, gate y rollback; PLAN_ONLY sigue vigente.
- **0.6.0 / 2026-11-03:** DEC-E ratificado; W6 desglosado en F07-L1…L6; F07-L1 preparado para autorización acotada; actualizado el camino restante W6→W10 sin levantar PLAN_ONLY.
- **0.5.0 / 2026-11-01:** W5/F04 cerrado con evidencia focal 32/32; F05+ permanece no autorizado.
- **0.4.0 / 2026-11-01:** W4/F03 cerrado con evidencia; W5/F04 es el siguiente scope no autorizado.
- **0.3.0 / 2026-11-01:** W3/F02 cerrado con fallback; W4/F03 pasa a ser el próximo scope no autorizado.
- **0.2.0 / 2026-11-01:** W1 y W2 cerrados con evidencia; W3/F02 es el siguiente scope no autorizado.
- **0.1.0 / 2026-11-01:** waves W0–W10, relación con F00–F10, gates P0 y scope incremental recomendado.
