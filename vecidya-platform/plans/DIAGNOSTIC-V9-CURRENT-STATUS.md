# Diagnostic V9 — CURRENT STATUS

**Versión:** 1.2.0
**Fecha:** 2026-11-03
**Estado:** F07-L1/L2 EN PR DRAFT · F07-L3-ADR DOCUMENTADO EN ESTE CHECKPOINT · F07-L3 NEXT
**Repositorio:** `hola675/Vecidya`
**PR runtime:** [#231](https://github.com/hola675/Vecidya/pull/231) (open, draft, mergeable; no integrado)
**Base:** `origin/main@9c159a32abdf01a341e9a97e5c1c1ac99191cf54`
**Rama ADR:** `docs/diagnostic-v9-f07-l3-adr`

## 0. Estado operativo actual

- **F07-L1:** implementado en PR #231; focal 10/10 PASS, build PASS. Typecheck global FAIL por cinco módulos de scoring/calibración no modificados. Detalle de SHA y alcance en la descripción del PR.
- **F07-L2:** implementado en PR #231; focal 5/5 PASS; replay transitorio reutiliza Worker/scorer, valida TTL de 7 días y no persiste respuestas individuales.
- **F07-L3-ADR:** el contrato de versión/ID, canonicalización, digest/firma, custodia/rotación, TTL y skew se registra en `docs/ARCHITECTURE.md` en este checkpoint. No se ha implementado firma ni finalización.
- **PR #231:** abierta como draft; GitHub informa `mergeable=true`; el commit `d105e7547a2b45f63ec598444779d5c64e43ed44` no tiene checks/statuses asociados en la consulta actual. El PR no está integrado.
- **Siguiente:** F07-L3 requiere que este contrato esté integrado y autorización/implementación en checkpoint separado. Ningún deploy ni migración remota.

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

El siguiente scope después de W1R fue F07-L1; L1/L2 están ahora en PR #231 y el siguiente gate es F07-L3-ADR.

## 6. Secuencia canónica restante

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

### F07-L3-ADR
- contrato documentado en `docs/ARCHITECTURE.md`; Ed25519, SHA-256 y JCS (RFC 8785);
- TTL máximo 24 h, `issuedAt`/`expiresAt`, tolerancia de skew 60 s sin extensión de expiración;
- custodia Worker Secret y registro versionado de claves públicas; rotación verify-only y revocación de comprometidas.

### F07-L3 (pendiente)
- finalizar autoritativamente y generar resultado canónico firmado;
- conservar solo el resultado local hasta 24 h y eliminar draft al finalizar;
- certificar importación/uso de claves y verificación fail-closed en Worker runtime.

## 8. Deuda explícita

- 59 rewrites editoriales y 13 candidatos 82/90 siguen fuera del runtime inicial.
- backup ≤30 días requiere certificación operativa antes de promesa pública.
- prototipo D1 histórico requiere inventario/cleanup policy.
- F08 debe cubrir idioma/aclaración UI, accesibilidad, seguridad, concurrencia, carga y errores.

## 9. Handoff

W1R quedó cerrado antes de los lotes runtime. F07-L1 y F07-L2 están en el PR #231 (draft, no merge). Este checkpoint documenta F07-L3-ADR; el siguiente lote es F07-L3, condicionado a la integración de los prerequisitos y autorización de su checkpoint.

## 10. Qué significa “terminado”

V9 solo queda terminado después de: L1-L6 + F05/F06 + F08 PASS + cutover F09 + staging/piloto/aceptación/producción F10 + postdeploy verificable.

## Changelog

- **1.2.0 / 2026-11-03:** estado reconciliado con PR #231 y se documenta el contrato F07-L3-ADR; no incluye firma ni finalización.

- **1.1.0 / 2026-11-03:** W1R cerrado: main reconciliado en merge commit `9240bf29...`, behind 0 y PR mergeable; handoff preparado para F07-L1 por otro agente.
- **1.0.2 / 2026-11-03:** el snapshot Git queda explícitamente marcado como referencia temporal, evitando tratar un SHA documental autorreferente como HEAD operativo.
- **1.0.1 / 2026-11-03:** snapshot Git final de consolidación actualizado a HEAD `10c3e404...`, ahead 761 / behind 15.
- **1.0.0 / 2026-11-03:** creado como fuente operativa canónica tras revisión punta-a-punta y cierre de contradicciones documentales.
