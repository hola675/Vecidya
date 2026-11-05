# Revisión CI-02 — 2026-11-05

Estado: inspección de código; pruebas no ejecutadas.

## Corrección de alcance MW2-015

La prueba unitaria tests/unit/miniweb-v2-publication-query.test.ts usa un stub D1, pero no es la única cobertura. tests/e2e/miniweb-v2-conversion-check.mjs (SHA d382616454dfbccc0188693657c20cf31eb44c13) sí usa Worker Wrangler, D1 y R2 locales. Contiene verificaciones de publicación, revocación de imágenes, aislamiento de organización, licencia suspendida, concurrencia con cupos limitados, extensión de capacidad, HTML escapado, SEO/sitemap y capturas Playwright 5 familias × 3 variantes × 3 viewports. No se ha ejecutado aquí. Falta verificar si cubre el fallo lógico parcial MW2-001.

## MW2-017 — Omisión en runner E2E general (P1, confirmado)

tests/e2e/run-local-e2e.mjs (SHA 45e12dfc1408965ead844263a497b85c6660a8d8) enumera 37 scripts y no incluye miniweb-v2-conversion-check.mjs. package.json sí ofrece test:e2e:miniweb-v2-conversion. Comprobar pipelines reales; añadir gate dedicado o incorporar la prueba sin alterar accidentalmente tiempos de CI.

## MW2-018 — Certificación local no equivale a DEV remoto (P1, gate)

El E2E V2 usa Wrangler local y persistencia efímera. Es integración local válida, no prueba automática del Worker DEV desplegado. Definir smoke DEV remoto, con aprobación antes de cualquier despliegue.

## Próximos pasos

1. Localizar workflows GitHub y checks asociados a main.
2. Leer el resto del E2E V2 y comprobar pruebas de fallo parcial de slot.
3. Revisar esquema D1, migraciones, transacciones y pruebas de capacidad.
4. Vincular cada gate con el script que lo cubre y la evidencia de ejecución.
5. Mantener pendiente toda prueba no ejecutada y toda dependencia no inspeccionada.
