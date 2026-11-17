# Diagnostic V9 — CURRENT STATUS

**Versión:** 1.8.0
**Fecha:** 2026-11-17
**Estado:** F07-L1/L2 Y F07-L3 INTEGRADOS EN MAIN · PRIVACY-GATE-01 VALIDADO LOCALMENTE, PENDIENTE PR · F07-L3 OPERACIÓN PARCIAL/FAIL-CLOSED, CLAVES PENDIENTES · NO PUBLICADO
**Repositorio:** `hola675/Vecidya`
**Main observado:** `origin/main@76fad3ebc4ea1540e66d348c0f45f11c6b37e32c`; incluye PR #255 y #236. El trabajo local se inició en `cbdb73e` y requiere sincronización final antes de PR.

## 0. Estado operativo actual

- **F07-L1/L2:** integrados por PR #231 en `main@cbebe22a`; focales 10/10 y 5/5, typecheck/build locales y CI PASS. El draft anónimo es local por 7 días; replay es transitorio y no crea ledger individual D1.
- **F07-L3-ADR:** integrado por PR #232 en `main@03d2ba4c`; JCS/RFC 8785, SHA-256, Ed25519, keyId, Worker Secret, rotación/revocación, timestamps y TTL 24 h.
- **F07-L3 implementación:** PR #236 integra replay/finalización firmada en memoria, endpoint transitorio con rate limit, resultado local 24 h, verificación criptográfica y eliminación del draft tras persistir el resultado. No crea migraciones ni escrituras D1.
- **Validación RAN:** `pnpm run typecheck` PASS; `pnpm run build` PASS; focales V9 9/9 PASS (attestation/final-result/replay); `git diff --check` PASS.
- **Gates pendientes:** configurar `DIAGNOSTIC_V9_ATTESTATION_PRIVATE_KEY_PKCS8` como Worker Secret y añadir su clave pública/keyId al registry versionado antes de habilitar finalización. La clave registry está vacía en esta rama; por diseño el navegador rechaza resultados sin clave conocida. No correr deploy.
- **Runtime Worker RAN:** `pnpm exec react-router dev --host 127.0.0.1` escuchó tras fallback de `Request.cf`; guardas 405/403/415/503. Smoke local con clave efímera: POST finalizable 200, digest/firma verificados, sin `answers`; el runner restauró vars y registry temporales.
- **Siguiente gate:** provisionar `keyId`/clave pública y Worker Secret emparejados en el entorno objetivo, luego repetir smoke HTTP firmado allí. F05-01 queda después de L3 PASS; este paso requiere operar en el entorno objetivo y no se ejecutó en este checkpoint.
- **Publicación:** ninguna; cero migraciones remotas y cero deploy.

### PRIVACY-GATE-01 — candidato local (no integrado)
- **Política vigente aclarada 2026-11-16, que reemplaza el texto del 2026-11-14:** ningún diagnóstico persiste respuestas, valores elegidos, transcript, identidad/run individual ni resultado en D1, completo o incompleto. Solo se permiten métricas agregadas/coarse-grained no reidentificables. Entrevista/replay/finalización transitorios; resultado firmado local 24 h, draft local siete días.
- El candidato bloquea fail-closed las escrituras legacy de identidad/run/eventos/finalización/claim y asociaciones a organizaciones, sin depender del flag público V9. Las lecturas de ejecuciones históricas completadas son read-only, owner-only, conservan versiones originales y no mutan/recalculan D1. Se preservan rutas, migraciones y filas existentes; no se ejecutan borrados. `/diagnostico` no crea identidad D1 al entrar.
- La persistencia terminal consentida no está implementada: falta el contrato F07-L4 y deben definirse acceso/retención/borrado/backups para F07-L5. No reusar la API legacy que guarda evento por cada respuesta.
- Limpieza de borrador vencido: bajo LockManager compartido se confirma el valor antes de borrar; sin LockManager o si `removeItem` falla, se informa que no pudo confirmarse el borrado. Si falla el pedido de lock para una escritura, el cambio nuevo queda solo en memoria. El fallback optimista preexistente cuando Web Locks no existe no certifica exclusión entre pestañas.
- **RAN 2026-11-17:** 40/40 unitarias focales, E2E Worker/D1 efímera con lectura histórica owner-only y no-mutación, typecheck/build/diff-check PASS. La suite completa permanece NO VERIFICADA; no se repitió el intento previo que excedió 600000 ms. Sin cambios Cloudflare, secretos, migración remota, deploy o publicación. Aplicación sigue `0.9.2`.

## Evidencia integrada previa

- F07-L1: borrador local versionado, TTL derivado de `updatedAt + 7 días`, idempotencia/revisión, cambios entre pestañas y fallback en memoria; no hace identity/run/event D1.
- F07-L2: replay canónico transitorio, versiones/TTL de 7 días, validación de transcript y límite 24+5; no acepta score del cliente ni persiste respuestas.
- F07-L3: el server elimina valores no JSON de la representación antes de JCS, firma los claims con Ed25519 y valida digest, expiración de 24 h, skew máximo de 60 s y revocación. El resultado no incluye `answers` ni transcript.
## 1. Regla de autoridad

Este archivo responde “¿dónde estamos ahora?”. Si un documento histórico contradice este status, prevalecen: código/HEAD → este archivo → hoja humana A–H → scope post-aprobación → reportes Wn → backlog → packs DEC/Master histórico.

## 2. Decisiones

- DEC-A: APPROVED.
- DEC-B: APPROVED_WITH_FALLBACK.
- DEC-C: APPROVED_WITH_FALLBACK.
- DEC-D: APPROVED.
- DEC-E: política vigente 2026-11-16: incompletos y completos no persisten Q/A en D1; solo métricas agregadas no reidentificables. Replay transitorio, resultado local TTL 24 h. Esta aclaración supersede la propuesta del 2026-11-14 de persistencia terminal consentida.
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

El siguiente scope en ese snapshot era **F07-L1**; está completado e integrado por PR #231. La secuencia actual sigue condicionada al gate operativo F07-L3 descrito arriba.

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
- integrada por PR #236: replay/finalización autoritativa, resultado canónico sin answers/transcript, attestation JCS/SHA-256/Ed25519 y resultado local 24h;
- cliente verifica firma, digest, expiración, skew y revocación antes de leer/aceptar el resultado;
- endpoint sin persistencia D1, protegido por origen y rate limit, falla cerrado cuando faltan secreto o clave pública versionada;
- **PARTIAL, no PASS:** Worker Secret y key registry no provisionados; Cloudflare local completó la firma de una sesión con una clave de prueba efímera y el verificador confirmó digest/firma; la configuración se restauró al finalizar.

### F07-L3-ADR
- integrado en PR #232 / `main@03d2ba4c`;
- JCS (RFC 8785), SHA-256, Ed25519, UUIDv4, `keyId`, Worker Secret, rotación/revocación, 24h y skew 60s.

## 8. Deuda explícita

- 59 rewrites editoriales y 13 candidatos 82/90 siguen fuera del runtime inicial.
- backup ≤30 días requiere certificación operativa antes de promesa pública.
- prototipo D1 histórico requiere inventario/cleanup policy.
- mantener prohibida la persistencia individual de respuestas/resultados; definir allowlist de métricas agregadas y su retención. Para filas legacy, definir retención, acceso read-only y efecto en backups antes de F07-L4/L5; no borrar sin gate separado.
- verificar en entorno autorizado que el flag/gate remoto no habilite los endpoints legacy; el estado remoto no se verificó.
- F08 debe cubrir idioma/aclaración UI, accesibilidad, seguridad, concurrencia, carga y errores.

## 9. Handoff

F07-L1/L2, ADR L3 e implementación F07-L3 están integrados; PR #236 quedó en `main@4ead64a0`. PRIVACY-GATE-01 está validado localmente pero no integrado; sincronizar con `origin/main@76fad3eb`, abrir/revisar PR y exigir CI. F07-L3 sigue PARTIAL: faltan `keyId`/clave pública y Worker Secret emparejados y smoke autorizado. Mantener prohibición de D1 individual; los gates futuros F07-L4/L5 definirán métricas agregadas permitidas y política para registros legacy históricos, nunca storage nuevo de Q/A.

## 10. Qué significa “terminado”

V9 solo queda terminado después de: L1-L6 + F05/F06 + F08 PASS + cutover F09 + staging/piloto/aceptación/producción F10 + postdeploy verificable.

## Changelog

- **1.5.0 / 2026-11-04:** PR #232 integrado en `main@03d2ba4c`; implementación candidata F07-L3 en rama, typecheck/build PASS, focal 9/9; secret/key registry y validación Worker local pendientes.

- **1.6.0 / 2026-11-08:** PR #236 integró F07-L3 en `main@4ead64a0`; se actualiza el snapshot a `origin/main@8ae0052c`. Se mantiene PARTIAL/fail-closed hasta completar claves operativas y smoke en el entorno objetivo; no hubo configuración remota ni deploy.

- **1.8.0 / 2026-11-17:** `origin/main` observado en `76fad3eb` tras PR #255; la aclaración 2026-11-16 prohíbe persistencia individual D1 incluso al completar. PRIVACY-GATE-01 añade lecturas históricas owner-only read-only, gatea escrituras legacy y pasa 40 focales, Worker/D1 local E2E, typecheck/build/diff-check. Pendiente PR, suite completa, claves operativas y cualquier deploy.

- **1.7.0 / 2026-11-14:** se alinea snapshot con `origin/main@cbdb73e`; registra el criterio de persistencia terminal consentida y candidato local. Ese criterio queda supersedido por la aclaración humana posterior del 2026-11-16.

- **1.4.0 / 2026-11-04:** F07-L1/L2 integrados por PR #231 en main@cbebe22a; ADR #232 pasó su head anterior pero fue actualizado para incluir #231 y requiere CI del nuevo head. F07-L3 sigue pendiente.

- **1.3.0 / 2026-11-03:** F07-L2 adapter transitorio PASS 5/5; TTL servidor 7d; F07-L1 commits `66218b7e` y `1a9e590b`, focal 10/10; build PASS; typecheck global sigue fallando en módulos no modificados.
- **1.2.0 / 2026-11-03:** F07-L1 local draft implementado; prueba focal 9/9 PASS; build PASS; typecheck global falla en módulos no modificados; handoff autoriza continuar F07-L2.
- **1.1.0 / 2026-11-03:** W1R cerrado: main reconciliado en merge commit `9240bf29...`, behind 0 y PR mergeable; handoff preparado para F07-L1 por otro agente.
- **1.0.2 / 2026-11-03:** el snapshot Git queda explícitamente marcado como referencia temporal, evitando tratar un SHA documental autorreferente como HEAD operativo.
- **1.0.1 / 2026-11-03:** snapshot Git final de consolidación actualizado a HEAD `10c3e404...`, ahead 761 / behind 15.
- **1.0.0 / 2026-11-03:** creado como fuente operativa canónica tras revisión punta-a-punta y cierre de contradicciones documentales.
