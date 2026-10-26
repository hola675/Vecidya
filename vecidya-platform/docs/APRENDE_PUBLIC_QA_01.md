# APRENDE-PUBLIC-QA-01 — validación pública, visual y de publicación

**Fecha:** 2026-10-26
**Rama:** test/aprende-public-qa-01
**Base:** main tras el merge del PR #138 (4dcc27f).
**Alcance:** pruebas no destructivas en localhost; ninguna aprobación editorial ni despliegue.

## Motivo

La suite histórica tests/e2e/learn-experience-check.mjs espera 38 artículos, siete itinerarios y marcadores de borrador públicamente visibles. Esas expectativas ya no representan la regla aprobada en main: **48 guías en catálogo, 30 guías públicas y 18 borradores protegidos**. Se mantienen nueve itinerarios editoriales y solo aparecen itinerarios públicos con tres o más guías accesibles. Una prueba E2E desactualizada no debe ser el gate de la versión nueva.

## Implementación

- tests/e2e/aprende-public-qa-check.mjs: Playwright comprueba SSR, rutas públicas, indexación, acceso a artículos, búsqueda con normalización de acentos, filtro de categorías, estados vacíos, itinerarios, índice del artículo, relacionados, imágenes, teclado y anchos 320/390/768/1366.
- La prueba importa el catálogo real y contrasta **30 URLs públicas con 200 y 18 borradores con 404**. No crea usuarios, no altera datos y rechaza cualquier BASE_URL distinto de localhost o 127.0.0.1 por HTTP.
- Sitemap y robots.txt: comprueba las 30 URLs aprobadas y que ninguno de los 18 borradores aparezca. El sitemap reutiliza getPublicLearnArticles como regla compartida.
- tests/e2e/run-local-e2e.mjs: sustituye en el ejecutor la prueba antigua con cifras obsoletas por el nuevo checkpoint. La prueba antigua queda como referencia histórica.
- .github/workflows/aprende-public-qa.yml: instala Chromium y corre Playwright contra servidor local efímero, con APP_ENV=test, sin credenciales de producción ni despliegue. Capturas PNG, informe JSON y log del servidor se adjuntan a Actions durante 14 días.
- Comando pnpm test:e2e:aprende-public: ejecuta el checkpoint contra el servidor local ya levantado.

## Condiciones de aceptación

1. CI general y Aprende quality sin regresión TypeScript, build o unitarias.
2. Playwright PASS en cuatro anchos, sin desbordamiento horizontal ni errores JavaScript.
3. Catálogo e itinerarios enlazan solo artículos accesibles; resultados filtrados incluyen noindex, follow.
4. Ningún borrador en índice, búsqueda, itinerarios, relacionados o sitemap; URL directa responde 404.
5. Capturas del listado y artículo adjuntas para inspección humana visual.
6. Revisión Codex y reporte reproducible en PR. No fusionar con fallos conocidos.

## Límites y decisiones reservadas

- El CI **no demuestra** que el código esté desplegado en producción.
- Las capturas automatizadas no sustituyen inspección humana de calidad estética, legibilidad e ilustraciones.
- Enlaces externos HTTPS: auditarlos por separado con el workflow manual Aprende external links audit.
- No cambia editorialDraft de las 18 guías sin aprobación, ni Cloudflare D1, R2, auth, GHL o Diagnóstico.
- No hay despliegue ni modificación de datos remotos.

## Evidencia

Completar con el HEAD exacto y las URLs de GitHub Actions tras la ejecución. Los resultados del PR #138 no sustituyen los de este checkpoint.
