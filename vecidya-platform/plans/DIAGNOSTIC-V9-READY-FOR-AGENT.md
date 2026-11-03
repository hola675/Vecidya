# Diagnóstico V9 — READY_FOR_AGENT

**Versión:** 1.0.0  
**Fecha:** 2026-11-03  
**Estado:** NOT_READY_FOR_RUNTIME · PLAN_ONLY · W1R REQUIRED  
**Repositorio:** `hola675/Vecidya` · **PR:** #162 · **Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Estado canónico

- A–H: ratificadas por el responsable; no reabrir.
- W1/F00: DONE_WITH_EVIDENCE histórico; requiere W1R porque `main` volvió a avanzar.
- W2/F01: DONE_WITH_EVIDENCE.
- W3/F02: DONE_WITH_FALLBACK; baseline 77, 59 rewrites + 13 candidatos fuera del runtime.
- W4/F03: DONE_WITH_EVIDENCE; 24+5.
- W5/F04: DONE_WITH_EVIDENCE; scorer/correlation/calibration.
- DEC-E: ratificado y refinado.
- runtime restante: PLAN_ONLY.

## 2. Lectura obligatoria y autoridad

1. `DIAGNOSTIC-V9-CURRENT-STATUS.md` — estado operativo actual.
2. `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md` — decisiones humanas.
3. `DIAGNOSTIC-V9-POST-APPROVAL-IMPLEMENTATION-SCOPE.md` — secuencia/scopes.
4. `DIAGNOSTIC-V9-F00-F10-EXECUTION-BACKLOG.md` — tareas.
5. reportes W1–W5 — evidencia histórica por SHA/run.
6. paquetes DEC / Master Plan — análisis e historia; no prevalecen si contradicen los anteriores.

## 3. Gate previo a cualquier runtime

### W1R
- revalidar HEAD/main/PR/ahead/behind/merge-base;
- revisar overlap con el próximo scope;
- revisar migration journal;
- si hay overlap material, reconciliar main→V9 en lote Git separado;
- registrar SHA y evidencia.

Sin W1R cerrado no se declara READY para F07-L1.

## 4. Siguiente lote runtime elegible

Después de W1R: **F07-L1 solamente**.

Scope:
- `app/features/diagnostic/v9/local-draft.ts`;
- `app/features/diagnostic/v9/local-draft.client.ts`;
- `app/routes/diagnostic-v9.tsx` para iniciar local-only sin identity/run D1;
- `app/routes/diagnostic-v9-run.tsx` para entrevista local;
- tests LOCAL focales.

Invariantes:
- TTL derivado de `session.updatedAt + 7d`;
- lectura no renueva;
- draft solo `in_progress`/`completing`; `completed` inválido;
- cero D1 anónimo durante borrador;
- sin scoring/bank/migrations/finalization/claim/GHL/deploy.

## 5. Secuencia posterior

`W1R → L1 → L2 → L3-ADR → L3 → F05-01 → F06 → F05-02 → L4 → L5 → L6 → F08 → F09 → F10`

Detalles:
- L2: replay transitorio, servidor rechaza sesiones >7d.
- L3: attestation verificable + resultado local 24h; requiere ADR criptográfico.
- F05/F06: resumen, prioridades, Aprende/Servicios e informe definitivo.
- L4: save/claim/owner después del contrato del informe.
- L5: eliminación/retención/backups.
- L6: flujo integrado.

## 6. Evidencia requerida por lote

- SHA inicial/final;
- archivos modificados dentro del allowlist;
- comando focal y exit code;
- PASS/FAIL/reintentos;
- confirmación de exclusiones;
- rollback;
- volver a PLAN_ONLY al cerrar el lote.

Typecheck/build:
- no como rutina de cada microcambio;
- typecheck al cerrar wave runtime;
- typecheck + build en cierre integrado L6/W6;
- typecheck + build + E2E/regresión delimitada en F08.

## 7. STOP

Detener ante:
- cambio concurrente material;
- scope fuera de allowlist;
- necesidad de migración no autorizada;
- acceso cruzado o pérdida de datos;
- score sin evidencia suficiente;
- persistencia individual anónima en L1/L2;
- imposibilidad de rollback;
- intento de saltar dependencia F05/F06 antes de L4.

## 8. READY

**Ahora: NOT_READY_FOR_RUNTIME.**

READY_FOR_AGENT de F07-L1 solo después de:
1. W1R PASS;
2. autorización explícita de F07-L1;
3. revalidación del session/parser contract;
4. comandos focales confirmados en checkout.

## Changelog

- **1.0.0 / 2026-11-03:** documento reescrito contra el plan canónico; elimina estados A–H obsoletos, añade W1R, scope L1 corregido y secuencia L1→L3→F05/F06→L4-L6.
