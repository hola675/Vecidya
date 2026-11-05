# CI — Estado consolidado y pendientes (2026-11-05)

F01 y F06 EN CURSO. Registros MW2-001 a MW2-018. Sin pruebas ejecutadas ni cambios de producto.

## Evidencia comprobada
- tests/e2e/miniweb-v2-conversion-check.mjs ejecuta Worker, D1 y R2 locales; contiene casos de licencia, concurrencia, media, SEO, aislamiento y capturas visuales 5×3×3. Evidencia de código, NO de ejecución.
- tests/e2e/run-local-e2e.mjs enumera 37 scripts; no incluye conversión V2. Hallazgo MW2-017.
- package.json define script dedicado test:e2e:miniweb-v2-conversion.
- Test unitario publication-query usa stub; existe E2E real local, por lo que MW2-015 queda limitado al stub y escenario parcial no comprobado.
- E2E local no sustituye Worker DEV desplegado (MW2-018).
- No existen archivos .github/workflows/ci.yml ni ci.yaml en las rutas comprobadas. Búsquedas de código por miniweb-v2-conversion, actions/checkout y pnpm install no devolvieron coincidencias; no demuestra ausencia de CI.

## Pendientes explícitos (no cerrar sin prueba)
P-CI-01: localizar TODOS los workflows y checks de main, incluidos nombres no convencionales y protecciones de rama.
P-CI-02: comprobar si la prueba V2 corre por CI alternativo o solo manual.
P-CI-03: diseñar y ejecutar test D1 real de reserva parcial de cupo, sin afectar datos remotos.
P-CI-04: revisar tramo final de E2E conversión y salidas/capturas; determinar assertions exactas.
P-CI-05: revisar migraciones y esquema de slots, claves y restricciones; definir reversión.
P-CI-06: preparar smoke DEV por URL y registrar SHA/fecha/resultado después de despliegue autorizado.
P-CI-07: completar matriz test→invariante→entorno→gate.
P-CI-08: sincronizar documento INTEGRACION-CONTINUA.md con esta segunda revisión; pendiente técnico si no se puede editar.
P-CI-09: inventariar consumidores V1/V2, enlaces, SEO y dependencias inversas.
P-CI-10: validar accesibilidad y revisión humana de capturas, no solo métricas automatizadas.

## Decisiones de calidad
P0 y P1 bloqueantes sin resolver impiden certificación; observaciones menores también se registran. No convertir hipótesis en bug confirmado. No modificar main, producción, V1 ni datos.

## Actualización de seguimiento — 2026-11-05

- P-CI-08: **CERRADO DOCUMENTALMENTE**: `INTEGRACION-CONTINUA.md` incorpora CI-02 y F01-03. No implica certificación de CI.
- P-CI-05: **PARCIAL**: leídos journal y migraciones 0034–0037 y 0044–0045; faltan ensayo de upgrade 0045 con datos, aplicación remota y rollback.
- P-CI-01: se consultaron los estados combinados del commit histórico `d8ecfe4e`; el endpoint devolvió `statuses: []`. **No demuestra ausencia de GitHub Actions/check runs**, ni identifica el HEAD actual de main. Pendiente inventario real.
- P-CI-03: **ABIERTO**: escenarios D1 [1,0,0] y [1,1,0] sin ejecutar.
- P-CI-09: **PARCIAL**: editor V2 enlaza explícitamente a `/app/miniweb`; aún falta mapa de consumidores completo.
- Pendiente adicional P-CI-11: decidir política de licencia suspendida (MW2-027).
- Pendiente adicional P-CI-12: verificar UX de `?site=` inexistente o ajeno (MW2-028).

## 2026-11-05 — Apertura de matriz F02

- P-CI-03: matriz diseñada, **ejecución pendiente**; ver `MATRIZ-PRUEBAS-D1-F02.md`.
- Nuevo P-CI-13: reproducir guardado parcial [1,0] (MW2-029).
- Nuevo P-CI-14: reproducir fallo de inicialización después de crear sitio (MW2-030).
- Nuevo P-CI-15: ejecutar matriz de 16 casos con evidencia SHA/entorno, sin datos remotos.

## 2026-11-05 — Revisión E2E visual F06

- P-CI-04: **PARCIAL/CÓDIGO INSPECCIONADO**: leído tramo final de E2E, incluidas aserciones, 45 screenshots, manifest y limpieza. Falta ejecutar y revisar tramo inicial completo en detalle.
- P-CI-16: ejecutar y conservar 45 capturas con SHA y revisión humana.
- P-CI-17: axe, teclado completo, lector de pantalla y zoom.
- P-CI-18: imágenes R2 reales y estados de fallo por familia/variante.
- P-CI-19: retención y publicación de artefactos CI.
- P-CI-20: pruebas de publicación por API para familias/variantes representativas.

## 2026-11-05 — CI sobre HEAD real

- P-CI-01: **PARCIAL**. HEAD main 4cf1872efaf9a8c81c297a37f41d86796bab5d58; combined statuses vacíos, no prueba ausencia de checks.
- P-CI-21: consultar check runs del HEAD por API específica.
- P-CI-22: verificar CI externo y workflows no convencionales.
- P-CI-23: vincular matriz F02 con gates identificados.
- Referencia: `REVISION-CI-HEAD-F06.md`.

## 2026-11-05 — Resultado ejecutado migración 0045

- P-CI-05: ensayo SQLite en memoria **PARCIAL**. T-MIG-01 (tabla vacía) PASS; T-MIG-02 (tabla poblada) FAIL por ADD NOT NULL sin default. Pendiente replicar en D1 local y diseñar corrección segura.
- P-CI-24: definir y verificar migración segura para datos existentes, sin tocar remoto hasta aprobación.
- P-CI-25: verificar historial real de 0045 en staging/prod, solo lectura con autorización.
- Evidencia: `REPRODUCCION-SQLITE-MIGRACION-0045.md`.

## 2026-11-05 — Apertura F07

- P-CI-09: **PARCIAL**: rutas V1/V2 confirmadas en `app/routes.ts`, ver `MAPA-RUTAS-Y-CORTE-F07.md`. Pendiente inventario exhaustivo de referencias, clientes externos, redirecciones y consumidores.
- Se abren P-F07-01..10 en documento F07, sin duplicar numeración CI.
- MW2-035/036 pendientes de certificación; V1 no se retira.

## 2026-11-05 — Seguridad y permisos V1/V2

- P-F07-11..15 añadidos en `MATRIZ-PERMISOS-V1-V2-F07.md`: panel interno, roles, 10 pruebas auth, payloads y auditoría.
- P-CI-09: **PARCIAL**: inventario ampliado con panel interno V1, API V1/V2, medios y rutas públicas; consumidores externos y árbol completo aún pendientes.
- Pendiente F06-AUTH: ejecutar T-AUTH-01..10 con organizaciones aisladas y evidencia de HTTP/status; no confundir lectura de código con autorización certificada.
