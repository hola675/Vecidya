# Vecidya Crystal Depth

**Estado:** dirección artística R1 candidata (2026-11-19), en revisión. No integrada en Vecidya ni MiniWeb2.

Sitio independiente de componentes HTML/CSS funcionales, escenas ambientales e iconos en capas separadas. Abre por defecto en **tema oscuro** y permite alternar a claro. La escena generada aprobada por el usuario se integra como fondo, no como captura ni como contenido de los componentes. La galería recorre los 140 assets de `public/assets/`, con búsqueda, 17 categorías y tres órdenes.

## Entrada didáctica para agentes

La biblioteca es un **manual de decisiones visuales**, no solo una galería. Antes de modificar una pantalla de Vecidya:

1. Leer `AGENTS.md` de la raíz y las reglas de gobierno de la plataforma.
2. Consultar `docs/INTEGRACION.md` para interpretar la consulta y elegir un patrón; `docs/DIRECCION-ARTISTICA.md` para tokens, contraste y composición L0–L5.
3. Buscar intención, materiales y restricciones en `assets/pattern-registry.json` (JSON estructurado para agentes).
4. Abrir `biblioteca.html#guia`, explorar las tres intensidades Crystal y usar el recomendador de patrones.
5. Contrastar componentes y capacidades reales en `vecidya-platform/`, hacer QA focal y abrir PR sin desplegar.

**R1 aprobada conceptualmente:** oscuro principal, claro alternativo; cristal focal en escenas, discreto en paneles y sólido en datos; calidad premium compartida entre Cuadra/Barrio/Ciudad con progresión por composiciones/capacidades efectivas; laboratorio interno como sistema de aprobación. **R1 no activa derechos comerciales, CRM ni nuevas plantillas por sí sola.**

## Transiciones y animaciones R1.1 (laboratorio)

La sección `biblioteca.html#movimiento` muestra **cinco recetas** reutilizables por agentes: portada, revelado de sección, respuesta de componente, ambiente de escena y navegación contextual. Incluye controles de intensidad, pausa y repetición, con `prefers-reduced-motion` que impide la animación incluso si el usuario activa el ejemplo. Los estados estáticos son completos.

- `styles/motion-system.css`: tiempos y easing, halo/órbitas, entradas, tarjetas y responsive.
- `assets/motion-system.js`: mejora progresiva de secciones, preferencias del SO, pausa y replay.
- `assets/pattern-registry.json → motion`: contrato legible por agentes, usos, limitaciones y QA.
- `tests/r2-browser-qa.mjs`: Chromium real, captura de cinco tamaños, temas, teclado, selector, controles de movimiento y modo reducido. El pipeline publica capturas como artifact solo al ejecutar la CI.

**Los cambios R1.1 no migran componentes de React, no alteran operaciones de MiniWeb, CRM ni Admin y no autorizan deploy.**

## Abrir

- Abrir `biblioteca.html` directamente en el navegador.
- Abrir `index.html` para que redirija a la biblioteca.
- Para servir desde la raíz del repositorio, iniciar un servidor HTTP estático y visitar `/vecidya-crystal-depth/biblioteca.html`.

No requiere dependencias. Marca, Vico y las ilustraciones originales se conservan. Once iconos usan propuestas PNG Crystal en la vista de biblioteca; WhatsApp se rasteriza a PNG. Los dos fondos ambientales generados optimizados residen en `assets/`.

Para revisar en un navegador Chromium con todos los assets relativos disponibles, inicia un servidor estático desde la raíz del repositorio y abre `/vecidya-crystal-depth/biblioteca.html`. También se puede abrir el HTML directamente; el servidor facilita la resolución de los activos oficiales en `vecidya-platform/public/assets/`.

## Archivos

- `biblioteca.html`: navegación, tarjetas, acordeón, formularios, pestañas, tabla, estados, diálogo y galería filtrable.
- `styles/crystal-depth.css` y `styles/themes.css`: material, componentes responsive y temas claro/oscuro.
- `assets/pattern-registry.json`: enrutamiento de intenciones, materiales, tokens, niveles y gates de QA.
- `styles/r1-guidance.css`: visualizaciones R1 y contrastes por material, aislados de producción.
- `assets/library-catalog.js`: índice estático de 140 assets oficiales, sus categorías, dimensiones y vistas Crystal.
- `assets/catalog-previews/`: 128 miniaturas WebP optimizadas; cada tarjeta enlaza al original con su formato y dimensiones.
- `assets/crystal-depth-hero.webp` y `assets/crystal-depth-hero-light.webp`: escenas ambientales aprobadas como referencia de estilo.
- `assets/icons/`: PNG separados para once propuestas Crystal y WhatsApp rasterizado desde su activo oficial.
- `docs/DIRECCION-ARTISTICA.md`: dirección artística y seis revisiones críticas.
- `docs/PLAN-MIGRACION-VISUAL.md` y `docs/INTEGRACION.md`: límites de integración.

## Pruebas de contrato automatizadas R1

```bash
node --test vecidya-crystal-depth/tests/r1-contract.test.mjs
```

Ejecutar desde la raíz del repositorio con Node.js 22 o superior. Este test focal **sin dependencias** comprueba tema oscuro inicial, alternancia reversible, `aria-checked`, ocho intenciones del guía, uso/antiuso de los tres materiales, unicidad de IDs, tokens sólidos con contraste ≥4,5:1, presencia de foco y `reduced-motion` en el CSS, y el catálogo de 140 assets y 17 categorías. La CI dedicada `.github/workflows/crystal-depth-quality.yml` se activa en PR que modifiquen esta biblioteca.

**Alcance de evidencia:** estas comprobaciones no verifican visualmente el render de todos los estados, contrastes sobre fondos compuestos, zoom 200 %, lector de pantalla, performance ni UX móvil. Continúan pendientes del gate R2.

## Verificación y límites

**Los cambios R1 requieren una nueva certificación y no heredan la validación de 0.7.** El 2026-11-13, Chromium local comprobó navegación, pestañas con teclado, alternador de tema, búsqueda y filtros, orden, estado vacío, validación del formulario, diálogo/Escape y enlaces internos. Se revisaron 320, 360, 390, 768, 1024, 1366 y 1920 px; la tabla conserva un scroller horizontal propio en móvil. La carga final no registró errores de consola. `node --check assets/library-catalog.js` y `git diff --check` pasan. Las seis revisiones críticas están en `docs/DIRECCION-ARTISTICA.md`.

Esto no equivale a certificación WCAG, revisión con lector de pantalla/zoom 200 % ni aprobación visual final. Requieren aprobación humana la intensidad del material en claro/oscuro, encuadre móvil de Vico, escena clara, propuestas PNG Crystal y presentación de la galería completa. No cambia la plataforma, MiniWeb2, rutas ni flujos, y no autoriza migración ni publicación.

## Changelog

- 2026-11-19 — R1 candidata: oscuro predeterminado, materiales por función, guía visual para agentes, registro JSON de patrones y reglas de calidad; no integrado ni desplegado.

- 2026-11-13 — 0.7: interacciones y responsive revisados en Chromium; tono hielo unificado con sombras/material; favicon oficial.
- 2026-11-12 — 0.6: galería completa de 140 assets con búsqueda, 17 categorías, orden, dimensiones y once iconos PNG Crystal; acordeón accesible.
- 2026-11-12 — 0.5: tema claro inicial con alternador oscuro, escenas ambientales clara/oscura e iconos PNG Crystal.
- 2026-11-12 — 0.4: biblioteca premium navegable, sistema de superficies, interacciones locales y escena ambiental aprobada.
- 2026-11-12 — 0.1–0.3: laboratorio y primeras muestras aisladas.
