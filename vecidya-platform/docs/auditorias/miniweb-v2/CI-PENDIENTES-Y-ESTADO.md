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
