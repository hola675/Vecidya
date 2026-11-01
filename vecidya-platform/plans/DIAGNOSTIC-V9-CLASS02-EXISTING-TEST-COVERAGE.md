# Diagnostic V9 — CLASS-02: cobertura de pruebas existentes y hardening SQL

**Versión:** 0.1.0  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · INVENTARIO ESTÁTICO · PRUEBAS NO EJECUTADAS  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Migraciones V9 relevantes para CLASS-02

La capa persistente V9 no termina en `0031`. El inventario real de la rama incluye:

| Migración | Blob | Garantía documental |
|---|---|---|
| `0030_diagnostic_v9_audit.sql` | `08fef3f330766a5b411d7dbfcadbb3371fc59cc9` | secuencia de eventos, `last_seq`, auditoría inmutable |
| `0031_diagnostic_v9_identity_ownership.sql` | `3cb6102757643af4d57dacb4a314847deb924536` | identidades, ownership, organizaciones y claims |
| `0032_diagnostic_v9_claim_guards.sql` | `06278ab8d538a8ca2f06489c04b62f3f2c314f38` | máximo un claim pendiente por identidad y coherencia de `completed_at` |
| `0033_diagnostic_v9_owner_assignment_guards.sql` | `0538cd59b1e629b1abf233bb7799c124abf39c13` | impide asignar ownership incompatible con estado/tipo de identidad |
| `0034_diagnostic_v9_identity_claim_integrity.sql` | `066fe83d34e5d1cfaf5d381ca5a325d7d931304e` | coherencia de marca de identidad reclamada, usuario destino existente e inmutabilidad posterior |
| `0035_diagnostic_v9_result_finalization_guards.sql` | `781513d047830a6e760b6dd1117c118acba018b1` | run completed exige resultado; estados terminales y resultados quedan inmutables |

### Detalle estático

- `0032`: índice único parcial `diagnostic_v9_one_pending_claim_per_identity`; triggers de inserción/actualización rechazan timestamps de finalización incoherentes.
- `0033`: trigger `diagnostic_v9_owner_assignment_guard` rechaza asignaciones incompatibles con identidad user/anonymous y estado de claim.
- `0034`: triggers rechazan `claimed_by_user_id/claimed_at` incoherentes, usuario destino inexistente y cambios posteriores a una reclamación consumada.
- `0035`: un run no puede pasar a `completed` sin resultado persistido; un estado terminal no puede volver a otro estado; resultados no pueden actualizarse ni eliminarse.

Estos hallazgos amplían el análisis previo de `0030` y `0031`. Siguen siendo garantías **presentes en SQL fuente**, no prueba de que las migraciones estén aplicadas en un entorno concreto.

## 2. Pruebas unitarias/SQLite ya presentes

No se ejecutó ninguna prueba. Se inspeccionaron nombres, blobs y casos definidos en la rama.

| Archivo | Blob | Cobertura observada |
|---|---|---|
| `qa03b-v9-identity-ownership-sqlite.test.ts` | `a18c6d5a8de9bafef081d68cd10b88b8997ed4a3` | separación user/anonymous y organización |
| `qa03b-v9-identity-claim-sqlite.test.ts` | `28caeacdb5f81908f2e5e024bb68d7755065ab6b` | transferencia de ownership, finalización concurrente única, guards 0032/0034 |
| `qa03b-v9-identity-claim.test.ts` | `d7d36ca330266846a3e8d73430f992a9e8da8897` | prueba de credencial y existencia del usuario destino |
| `qa03b-v9-organization-link-sqlite.test.ts` | `f0b941a63e7dc89e02aed50721fa8d7b7912ed7a` | ownership requerido e idempotencia del vínculo |
| `qa03b-v9-owned-run-create-sqlite.test.ts` | `a899194e8a706fb7a487e147621850ff795845fe` | creación run+owner, rollback, guard de identidad reclamada, evento con ownership |
| `qa03b-v9-event-ingestion-sqlite.test.ts` | `37ef28566597577b954d6387c887b841a5b5021c` | ruta canónica, retry idempotente, usuario ajeno, versiones, credencial anónima, replay/finalización |
| `qa03b-v9-run-state-sqlite.test.ts` | `ef5410070d5801ddf485c83ef1044825a2b99dde` | resume por propietario, versión incompatible, evento no elegible, secreto anónimo y aislamiento |
| `qa03b-v9-result-finalization-sqlite.test.ts` | `98b8051cae0adaff633f906e2d536bc4d9b0c6b7` | persistencia+completion, stale sequence, no partial writes, inmutabilidad de resultado/estado |
| `qa03b-v9-public-availability.test.ts` | `fa515813a857fb2a39b4ee65901dee1079e40b43` | flag público + cinco etiquetas de versión obligatorias |

## 3. Mapeo preliminar contra AUTH-01..13

Este mapeo indica **existencia de código de prueba**, no PASS.

| Caso | Evidencia de prueba existente | Gap restante |
|---|---|---|
| AUTH-01 lectura de run ajeno | `run-state-sqlite` | ejecutar focal |
| AUTH-02 evento en run ajeno | `event-ingestion-sqlite`, `owned-run-create-sqlite` | ejecutar focal |
| AUTH-03 finalizar run ajeno | no se identificó caso explícito equivalente | agregar/confirmar test focal del wrapper `finalizeOwned...` |
| AUTH-04 visitante sin prueba válida | `run-state-sqlite`, `owned-run-create-sqlite` | cubrir también ruta HTTP |
| AUTH-05 identityId ajeno | recuperación anónima/ownership en SQLite | confirmar variante exacta |
| AUTH-06 identidad ya reclamada | `owned-run-create-sqlite` + guards 0033/0034 | ejecutar focal |
| AUTH-07 claims concurrentes | `identity-claim-sqlite` | ejecutar focal |
| AUTH-08 fallo parcial de claim | `identity-claim-sqlite` valida atomicidad/concurrencia, pero no se confirmó fault injection intermedio | gap focal |
| AUTH-09 run no propio → organización | `organization-link-sqlite` | ejecutar focal |
| AUTH-10 organización sin membresía | verificación estática en `app-diagnostics.tsx`; test de servicio no cubre `requireMembership` | falta prueba route/action |
| AUTH-11 retry exacto tras completion | ingestión cubre retry; no se confirmó variante exacta después de completion | gap focal |
| AUTH-12 mismatch de versión | `event-ingestion-sqlite`, `run-state-sqlite` | ampliar/confirmar finalización |
| AUTH-13 claim con V9 disabled | comportamiento estático identificado; `public-availability.test` solo prueba el gate | falta prueba de ruta/política |

## 4. Comando focal propuesto — NO EJECUTAR bajo PLAN_ONLY

El `package.json` (blob `fd322fbf6d2c23b09376b465ae6c1d33be98b152`) usa Node test runner con `--experimental-strip-types` y `tests/unit/register-ts.mjs`.

Cuando exista autorización explícita, la matriz CLASS-02 debe ejecutarse solo sobre archivos V9 relevantes, no sobre todo `test:unit`. Forma propuesta:

```bash
node --experimental-strip-types --import ./tests/unit/register-ts.mjs --test \
  tests/unit/diagnostic/qa03b-v9-identity-ownership-sqlite.test.ts \
  tests/unit/diagnostic/qa03b-v9-identity-claim-sqlite.test.ts \
  tests/unit/diagnostic/qa03b-v9-identity-claim.test.ts \
  tests/unit/diagnostic/qa03b-v9-organization-link-sqlite.test.ts \
  tests/unit/diagnostic/qa03b-v9-owned-run-create-sqlite.test.ts \
  tests/unit/diagnostic/qa03b-v9-event-ingestion-sqlite.test.ts \
  tests/unit/diagnostic/qa03b-v9-run-state-sqlite.test.ts \
  tests/unit/diagnostic/qa03b-v9-result-finalization-sqlite.test.ts \
  tests/unit/diagnostic/qa03b-v9-public-availability.test.ts
```

No presentar este comando como evidencia de PASS hasta ejecutarlo y conservar resultados del SHA exacto probado.

## 5. Estado de CLASS-02

La infraestructura documental de persistencia, ownership, replay y hardening SQL es más completa de lo que mostraban los primeros censos. Sin embargo, CLASS-02 sigue **PARCIAL / NO CERTIFICADA** porque:

1. las pruebas existentes no se han ejecutado bajo la autorización actual;
2. faltan casos route-level para AUTH-10 y AUTH-13;
3. AUTH-03, AUTH-08 y AUTH-11 requieren confirmar cobertura exacta o añadir prueba focal;
4. no se ha verificado aplicación real de migraciones `0030..0035` en un entorno autorizado.

## Changelog

- **0.1.0 (2026-10-31):** inventario estático de migraciones V9 `0030..0035`, pruebas focales existentes, gaps AUTH y comando de ejecución propuesto sin ejecutar.
