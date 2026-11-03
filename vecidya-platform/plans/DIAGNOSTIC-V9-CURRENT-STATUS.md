# Diagnostic V9 — CURRENT STATUS

**Versión:** 1.3.0
**Fecha:** 2026-11-03
**Estado:** F07-L1/L2 DONE_WITH_EVIDENCE · F07-L3-ADR NEXT · RUNTIME PARCIAL
**Repositorio:** `hola675/Vecidya`  
**Base:** `origin/main@9c159a32abdf01a341e9a97e5c1c1ac99191cf54`
**Rama:** `feat/diagnostic-v9-f07-l1`

## 0. Checkpoint actual — F07-L1

- **Estado:** `DONE_WITH_EVIDENCE` para los gates focales L1; el flujo queda limitado a `readyToFinalize`, sin finalización.
- **SHA inicial:** `9c159a32abdf01a341e9a97e5c1c1ac99191cf54`.
- **Commits L1:** `66218b7ed8f27be9bb247475ca8e192a42f193f1` (feature) y `1a9e590b2e31c0959dc4d83532c5c5c9db06aae7` (confirmación optimista post-write y prueba de carrera).
- **Archivos runtime:** `app/features/diagnostic/v9/local-draft.ts`, `local-draft.client.ts`, `app/routes/diagnostic-v9.tsx` y `diagnostic-v9-run.tsx`; prueba `tests/unit/diagnostic/diagnostic-v9-local-draft.test.ts`.
- **Prueba focal RAN:** `node --experimental-strip-types --import ./tests/unit/register-ts.mjs --test ./tests/unit/diagnostic/diagnostic-v9-local-draft.test.ts` — PASS 10/10, exit 0; dos reintentos tras corregir Node strip-only y el fixture 24+5.
- **Build RAN:** `pnpm run build` — PASS, exit 0.
- **Typecheck RAN:** `pnpm run typecheck` — FAIL (exit 2) por errores en `qa03b/v9-candidate-scoring.ts`, `v9-finalization.server.ts`, `v9/graph-evaluation.ts`, `v9/scoring-calibration-registry.ts` y `v9/scoring-evidence-registry.ts`; ninguno de los diagnósticos corresponde a archivos editados en L1.
- **Git:** commit L1 `66218b7ed8f27be9bb247475ca8e192a42f193f1`; diff check del lote completo pendiente; cero migraciones, cero endpoints modificados, el flujo de borrador no hace solicitudes D1 y cero deploy.
- **Implementación:** local draft versionado; TTL se deriva de `updatedAt + 7 días`; lectura no escribe; escrituras válidas avanzan revisión; exact retry idempotente; conflicto preserva revisión más nueva; `navigator.locks` con fallback; memoria continúa si storage falla; inicio sin identity/run y UI con reanudación/edición local.
- **F07-L2:** `DONE_WITH_EVIDENCE`; adapter `transient-replay.server.ts` delega el replay/scoring al Worker canónico en memoria, fija la versión de scoring pública actual, rechaza >7 días e incomplete/tampering, no retorna sesión persistida ni score del cliente. Focal `diagnostic-v9-transient-replay.test.ts` — PASS 5/5, exit 0. Sin binding D1, escrituras ni logs raw.
- **Sigue:** F07-L3-ADR antes de cualquier código de attestation/finalización.
- **Riesgos/STOP:** typecheck global sigue fallando en scoring legacy/V9 no tocado; el flujo todavía no finaliza ni genera resultado y debe permanecer bajo el gate V9 existente.

## 0A. Checkpoint actual — F07-L2

- **Estado:** `DONE_WITH_EVIDENCE`.
- **SHA del commit L2:** `8dcaad032a39c46adfd69e40fba315867a8501cd`.
- **Archivos:** `app/features/diagnostic/v9/transient-replay.server.ts`; `tests/unit/diagnostic/diagnostic-v9-transient-replay.test.ts`.
- **Prueba RAN:** `node --experimental-strip-types --import ./tests/unit/register-ts.mjs --test ./tests/unit/diagnostic/diagnostic-v9-transient-replay.test.ts` — PASS 5/5, exit 0.
- **Contrato:** exige versión pública actual de scoring, TTL servidor de 7 días desde `updatedAt`, sesión `completing` con queue vacía, replay autoritativo, resultado sólo en memoria y errores estables sin detalles ni raw answers.
- **D1/deploy:** la función no recibe binding/env y no importa repositorios; cero escrituras D1, cero endpoint agregado, cero deploy.
- **Build/typecheck:** build PASS exit 0; typecheck global FAIL exit 2 por los módulos no modificados listados arriba.
- **Sigue:** F07-L3-ADR antes de código de attestation/finalización.

## 1. Regla de autoridad

Este archivo responde “¿dónde estamos ahora?”. Si un documento histórico contradice este status, prevalecen: código/HEAD → este archivo → hoja humana A–H → scope post-aprobación → reportes Wn → backlog → packs DEC/Master histórico.

## 2. Decisiones

- DEC-A: APPROVED.
- DEC-B: APPROVED_WITH_FALLBACK.
- DEC-C: APPROVED_WITH_FALLBACK.
- DEC-D: APPROVED.
- DEC-E: RATIFICADO; E3/E4/E5=24h/E6 personal/E8=30d objetivo/E9 possession/E-Q1-B.
- DEC-F: APPROVED.
- DEC-G: APPROVED.
- DEC-H: APPROVED_WITH_FALLBACK.

Las decisiones no autorizan runtime automáticamente.

## 3. Fases cerradas con evidencia histórica

| Fase | Estado | Nota |
|---|---|---|
| W1/F00 | DONE_WITH_EVIDENCE histórico | 43/43 PASS; main fue ancestro al cierre 2026-11-01 |
| W2/F01 | DONE_WITH_EVIDENCE | 3/3 PASS |
| W3/F02 | DONE_WITH_FALLBACK | baseline 77; 59 rewrites + 13 candidatos pendientes |
| W4/F03 | DONE_WITH_EVIDENCE | 24+5; 31/31 + 31/31 |
| W5/F04 | DONE_WITH_EVIDENCE | scoring/correlation/calibration; 32/32 |

## 4. Estado Git observado antes de esta consolidación

- PR #162: open, draft.
- snapshot Git de referencia tomado durante la consolidación documental; revalidar HEAD antes de ejecutar cualquier lote.
- branch vs main: diverged.
- snapshot observado durante consolidación: ahead 761 / behind 15.
- merge-base observado: `e92c10e9ebcbb87768661eb383f16564340e63cf`.
- GitHub reportó `mergeable=false` en ese snapshot.

Estos conteos son volátiles. Revalidar inmediatamente antes de ejecutar.

## 5. Estado Git / W1R

**W1R = DONE_WITH_EVIDENCE.**

- merge commit de reconciliación: `9240bf29f50fa7e72406c72b9bb39fc2252282de`;
- `main` quedó como ancestro de la rama V9;
- compare posterior: ahead 764 / behind 0;
- PR #162 pasó a `mergeable=true`;
- los cuatro overlaps se resolvieron semánticamente sin mezclar implementación F07.

El siguiente scope de implementación es **F07-L1**.

## 6. Secuencia restante canónica

`W1R → F07-L1 → F07-L2 → F07-L3-ADR → F07-L3 → F05-01 → F06-01/F06-02 → F05-02 → F07-L4 → F07-L5 → F07-L6 → F08 → F09 → F10`

Motivo del orden: L4/L5/L6 no deben cerrar persistencia de un informe hasta que F05/F06 definan el contrato definitivo del producto.

## 7. Contratos ya corregidos

### F07-L1
- ruta inicial anónima no crea identity/run D1;
- draft local-only;
- TTL derivado de `updatedAt + 7d`;
- leer no renueva;
- draft no acepta `completed`;
- cero D1 de respuestas individuales.

### F07-L2
- replay autoritativo transitorio;
- servidor aplica TTL máximo 7d, no 14d heredado;
- cero D1 individual;
- no raw answers en logs/analytics.

### F07-L3
- resultado local 24h;
- attestation verificable;
- ADR técnico pendiente: version/id, serialization, digest, algoritmo, key id, rotación/custodia, skew y claves retiradas.

## 8. Deuda explícita

- 59 rewrites editoriales y 13 candidatos 82/90 siguen fuera del runtime inicial.
- backup ≤30 días requiere certificación operativa antes de promesa pública.
- prototipo D1 histórico requiere inventario/cleanup policy.
- F08 debe cubrir idioma/aclaración UI, accesibilidad, seguridad, concurrencia, carga y errores.

## 9. Handoff

El plan/base se fusionó a `main@9c159a32`. F07-L1 ya se implementó en la rama indicada en la sección 0 y su prueba focal pasó 9/9.

Próximo scope: **F07-L2** replay transitorio, autorizado por el handoff de implementación de este checkpoint. Debe continuar en orden, reutilizar `worker-replay-v9.server.ts` sin duplicar scoring y aplicar TTL servidor de 7 días.

## 10. Qué significa “terminado”

V9 solo queda terminado después de: L1-L6 + F05/F06 + F08 PASS + cutover F09 + staging/piloto/aceptación/producción F10 + postdeploy verificable.

## Changelog

- **1.3.0 / 2026-11-03:** F07-L2 adapter transitorio PASS 5/5; TTL servidor 7d; F07-L1 commits `66218b7e` y `1a9e590b`, focal 10/10; build PASS; typecheck global sigue fallando en módulos no modificados.
- **1.2.0 / 2026-11-03:** F07-L1 local draft implementado; prueba focal 9/9 PASS; build PASS; typecheck global falla en módulos no modificados; handoff autoriza continuar F07-L2.
- **1.1.0 / 2026-11-03:** W1R cerrado: main reconciliado en merge commit `9240bf29...`, behind 0 y PR mergeable; handoff preparado para F07-L1 por otro agente.
- **1.0.2 / 2026-11-03:** el snapshot Git queda explícitamente marcado como referencia temporal, evitando tratar un SHA documental autorreferente como HEAD operativo.
- **1.0.1 / 2026-11-03:** snapshot Git final de consolidación actualizado a HEAD `10c3e404...`, ahead 761 / behind 15.
- **1.0.0 / 2026-11-03:** creado como fuente operativa canónica tras revisión punta-a-punta y cierre de contradicciones documentales.
