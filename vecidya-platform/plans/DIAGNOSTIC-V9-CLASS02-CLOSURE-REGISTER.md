# Diagnostic V9 — CLASS-02 Closure Register

**Versión:** 0.1.0  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · CLASS-02 PARCIAL / NO CERTIFICADA  
**Rama auditada:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Propósito

Consolidar el cierre **documental** de CLASS-02 sin convertir lectura estática, existencia de pruebas o diseño SQL en certificación funcional.

El plan maestro sigue siendo autoritativo: la existencia de rutas, migraciones, tests o protecciones no implica certificación; persistencia, identidad, recuperación, organización, historial y seguridad deben quedar certificados antes del lanzamiento. Bajo `PLAN_ONLY` no se ejecutan pruebas, SQL, CI, merges ni despliegues.

## 2. Estado ejecutivo

**CLASS-02 = PARCIAL / NO CERTIFICADA.**

La clase ya posee trazabilidad documental suficiente para identificar:

- fuentes explícitas y bridges de atributos legacy;
- límites de señales de monetización y modelo de negocio;
- composición del banco y ausencia censada de producers secundarios en el alcance revisado;
- entrypoints, exports y rutas públicas reales;
- separación entre sesión V3/localStorage y runs V9 persistidos;
- banco fijado del replay V9;
- cinco versiones persistidas y verificadas;
- ledger de eventos, secuencia, snapshots y replay;
- migraciones V9 `0030..0035`;
- identidad personal, ownership, claim anónimo y asociación a organización;
- cobertura de pruebas SQLite ya escrita;
- gaps focales exactos que impiden certificación.

No existe autorización actual para convertir esa evidencia en PASS mediante ejecución.

## 3. Registro de evidencia CLASS-02

| Área | Documento principal | Estado documental |
|---|---|---|
| Bridge de atributos legacy | `DIAGNOSTIC-V9-CLASS02-LEGACY-ATTRIBUTE-BRIDGE.md` | Documentado |
| Fuentes explícitas de atributos | `DIAGNOSTIC-V9-CLASS02-EXPLICIT-ATTRIBUTE-SOURCES.md` | Documentado |
| Entidad/monetización/delivery | `DIAGNOSTIC-V9-CLASS02-ENTITY-MONETIZATION-DELIVERY-SOURCES.md` | Documentado |
| Procedencia monetización/operación | `DIAGNOSTIC-V9-CLASS02-MONETIZATION-OPERATIONAL-PROVENANCE.md` | Documentado |
| Consumidores de monetización | `DIAGNOSTIC-V9-CLASS02-MONETIZATION-CONSUMER-TRACE.md` + `...CONSUMER-CENSUS.md` | Documentado, alcance censado |
| Gates híbridos | `DIAGNOSTIC-V9-CLASS02-BUSINESS-MODEL-HYBRID-GATES.md` | Documentado |
| Conflictos secondary | `DIAGNOSTIC-V9-CLASS02-SECONDARY-SIGNAL-CONFLICTS.md` | Documentado |
| Boundary del engine | `DIAGNOSTIC-V9-CLASS02-ENGINE-SIGNAL-BOUNDARY.md` | Documentado |
| Producers secundarios | `DIAGNOSTIC-V9-CLASS02-SECONDARY-PRODUCER-FOCAL-CENSUS.md` + `...PRODUCTION-BANK-SECONDARY-CENSUS.md` | Censo focal, no global |
| Registro/entrypoints | `DIAGNOSTIC-V9-CLASS02-ENTRYPOINT-REGISTRY-TRACE.md` | Documentado |
| Export/session/bank | `DIAGNOSTIC-V9-CLASS02-PUBLIC-EXPORT-SESSION-BANK.md` | Documentado |
| Rutas públicas | `DIAGNOSTIC-V9-CLASS02-PUBLIC-ROUTES-RESOLVED.md` | Resuelto; corrige búsqueda anterior |
| Ciclo de APIs V9 | `DIAGNOSTIC-V9-CLASS02-API-RUN-LIFECYCLE-TRACE.md` | Documentado |
| Banco/replay/versiones | `DIAGNOSTIC-V9-CLASS02-PINNED-BANK-REPLAY-VERSIONS.md` | Documentado |
| Integridad de eventos | `DIAGNOSTIC-V9-CLASS02-AUDIT-EVENT-INTEGRITY.md` | Documentado |
| Trigger SQL 0030 | `DIAGNOSTIC-V9-CLASS02-MIGRATION-0030-TRIGGERS.md` | Resuelto estáticamente |
| Ownership/autorización | `DIAGNOSTIC-V9-CLASS02-OWNERSHIP-AUTHORIZATION-MATRIX.md` v0.1.1 | Documentado; AUTH-01..13 definidos |
| Pruebas existentes/hardening | `DIAGNOSTIC-V9-CLASS02-EXISTING-TEST-COVERAGE.md` v0.1.1 | Inventariado; no ejecutado |

### Nota sobre documento superado

`DIAGNOSTIC-V9-CLASS02-SESSION-PUBLIC-ROUTE-GAP.md` registró que no se había localizado la ruta pública porque se buscó `app/routes/diagnostico.tsx`. El inventario posterior demostró que la ruta real es `app/routes/diagnostic.tsx` y que `app/routes.ts` registra `/diagnostico`, `/diagnostico/v9` y `/diagnostico/v9/:runId`. Para estado actual debe prevalecer `DIAGNOSTIC-V9-CLASS02-PUBLIC-ROUTES-RESOLVED.md`.

## 4. Contratos estáticos que ya pueden considerarse trazados

### 4.1 Sesión V3 y ejecución V9 son contratos distintos

`qbv2-session.ts` conserva estado cliente/localStorage y por defecto usa `QUESTION_BANK_V2`. La ejecución pública V9 utiliza runs persistidos, eventos auditados y servicios de servidor. No usar compatibilidad de sesión V3 como sustituto de compatibilidad de runs V9.

### 4.2 Banco efectivo del replay

`worker-replay-v9.server.ts` y `v9-finalization.server.ts` fijan `QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2`. La finalización compara el scoring de la orquestación de resultado con las dimensiones obtenidas por replay y rechaza divergencia.

### 4.3 Versionado

Los runs persisten y los servicios comparan:

1. `bank_version`
2. `engine_version`
3. `scoring_version`
4. `recommendation_version`
5. `consent_version`

Una discrepancia no continúa silenciosamente.

### 4.4 Ledger, secuencia e inmutabilidad

La combinación de servicio + migraciones documenta:

- eventId idempotente por workspace;
- secuencia `expectedSeq + 1`;
- trigger de `0030` que exige `last_seq = NEW.seq - 1`;
- actualización de `last_seq` tras inserción;
- eventos inmutables;
- historial ordenado y fail-closed ante huecos;
- snapshots con SHA-256 y frontera auditada;
- resultados y estados terminales endurecidos por `0035`.

### 4.5 Identidad, propiedad y organización

La propiedad del diagnóstico es personal y distinta del workspace y de la organización. Para usuario autenticado, los servicios comparan `user_id`; para visitante, exigen identidad anónima no reclamada y credencial válida. El vínculo a organización exige:

1. sesión autenticada;
2. `requireMembership` sobre la organización solicitada;
3. propiedad personal del run;
4. inserción condicionada que vuelve a verificar ownership.

El código actual considera membresía simple suficiente para vincular el propio diagnóstico; no se observó requisito adicional de rol owner/admin en ese camino.

### 4.6 Recuperación anónima con V9 público deshabilitado

El claim de historial no depende de `isV9PublicRuntimeAvailable`. La UI de historial permite reclamar runs existentes aunque la creación/continuación V9 esté deshabilitada. Esto es comportamiento implementado; falta ratificarlo como política de producto.

## 5. Hardening SQL V9 inventariado

| Migración | Estado fuente |
|---|---|
| 0030 audit | Secuencia, ledger, snapshots/results base |
| 0031 identity/ownership | Identidades, ownership, org-links, claims |
| 0032 claim guards | Un pending claim por identidad + timestamp coherente |
| 0033 owner assignment guards | Ownership compatible con estado/tipo de identidad |
| 0034 identity claim integrity | Marca de claim coherente e inmutable |
| 0035 result finalization guards | Completed exige resultado; terminal/result inmutables |

**Límite:** no se verificó aplicación efectiva de `0030..0035` en D1 de staging/producción.

## 6. Cobertura de pruebas ya escrita — NO EJECUTADA

Existen pruebas SQLite focales para:

- ownership user/anonymous;
- claim y carrera de finalización;
- credenciales;
- vínculo a organización;
- creación atómica de run+owner;
- rollback de creación;
- append de eventos con ownership;
- event ingestion, replay, idempotencia y mismatch;
- recuperación de estado;
- finalización y guards de resultado;
- disponibilidad pública y cinco versiones.

La mera existencia del test no es PASS y no certifica el SHA actual.

## 7. Bloqueos exactos de certificación

### B02-01 — Ejecución focal no autorizada
No hay evidencia PASS de la matriz CLASS-02 en el SHA actual bajo la autorización vigente.

### B02-02 — AUTH-03
Falta caso explícito: usuario distinto del propietario intenta `finalizeOwnedDiagnosticRunV9`; debe fallar sin crear resultado.

### B02-03 — AUTH-08
Falta fault injection explícito durante la transferencia de claim para demostrar ausencia de estado parcial ante fallo intermedio.

### B02-04 — AUTH-10
La protección `requireMembership` está verificada estáticamente, pero falta prueba focal de la action `/app/diagnosticos` con propietario del run sin membresía en la organización.

### B02-05 — AUTH-11
Está cubierta la idempotencia normal, pero falta retry exacto del mismo evento **después** de completar el run.

### B02-06 — AUTH-13
El comportamiento de claim con `DIAGNOSTIC_V9_PUBLIC_ENABLED=false` está identificado, pero falta prueba route-level y ratificación de política.

### B02-07 — Mismatch en finalización
Existen checks de versión y pruebas de mismatch en otros servicios; falta confirmar prueba focal específica sobre finalización owned.

### B02-08 — Migraciones desplegadas
No se ha comprobado que `0030..0035` estén aplicadas y activas en un entorno autorizado.

## 8. Gate de cierre futuro

CLASS-02 solo podrá pasar a **CERTIFICADA** cuando, como mínimo:

1. B02-02..B02-07 tengan prueba focal equivalente;
2. se ejecute únicamente el conjunto focal pertinente sobre el SHA final;
3. resultados sean PASS y queden asociados al commit probado;
4. se confirme aplicación de migraciones `0030..0035` en el entorno objetivo;
5. se ratifique política AUTH-13;
6. cualquier fallo abra una corrección separada y vuelva a ejecutar exclusivamente la matriz afectada;
7. no se use un PASS histórico de otro SHA como certificación del HEAD.

## 9. Comando preparado, no ejecutado

El conjunto focal existente está documentado en `DIAGNOSTIC-V9-CLASS02-EXISTING-TEST-COVERAGE.md`. Bajo `PLAN_ONLY` queda solo como receta futura. No se ejecuta desde este registro.

## 10. Transición a CLASS-03

La documentación de CLASS-02 puede considerarse suficientemente madura para **preparar** CLASS-03 en paralelo documental, pero no para declarar CLASS-02 cerrada.

El siguiente trabajo documental debe:

- identificar el contrato exacto de CLASS-03 en el plan/compatibilidad;
- inventariar fuentes y consumidores antes de inferir cambios;
- reutilizar las distinciones establecidas aquí: fuente vs inferencia, sesión V3 vs run V9, banco candidate vs producción, static evidence vs PASS;
- mantener `PLAN_ONLY`.

## Changelog

- **0.1.0 / 2026-10-31:** registro consolidado de cierre documental CLASS-02; evidencia, contratos, hardening, cobertura existente, ocho bloqueos y gate futuro de certificación.
