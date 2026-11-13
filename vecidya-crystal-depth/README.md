# Vecidya Crystal Depth

**Estado:** biblioteca visual 0.7, revisión local. No está integrada en Vecidya ni en MiniWeb2.

Sitio independiente de componentes HTML/CSS funcionales, escenas ambientales e iconos en capas separadas. Abre por defecto en tema claro y permite alternar a oscuro. La escena generada aprobada por el usuario se integra como fondo, no como captura ni como contenido de los componentes. La galería recorre los 140 assets de `public/assets/`, con búsqueda, 17 categorías y tres órdenes.

## Abrir

- Abrir `biblioteca.html` directamente en el navegador.
- Abrir `index.html` para que redirija a la biblioteca.
- Para servir desde la raíz del repositorio, iniciar un servidor HTTP estático y visitar `/vecidya-crystal-depth/biblioteca.html`.

No requiere dependencias. Marca, Vico y las ilustraciones originales se conservan. Once iconos usan propuestas PNG Crystal en la vista de biblioteca; WhatsApp se rasteriza a PNG. Los dos fondos ambientales generados optimizados residen en `assets/`.

Para revisar en un navegador Chromium con todos los assets relativos disponibles, inicia un servidor estático desde la raíz del repositorio y abre `/vecidya-crystal-depth/biblioteca.html`. También se puede abrir el HTML directamente; el servidor facilita la resolución de los activos oficiales en `vecidya-platform/public/assets/`.

## Archivos

- `biblioteca.html`: navegación, tarjetas, acordeón, formularios, pestañas, tabla, estados, diálogo y galería filtrable.
- `styles/crystal-depth.css` y `styles/themes.css`: material, componentes responsive y temas claro/oscuro.
- `assets/library-catalog.js`: índice estático de 140 assets oficiales, sus categorías, dimensiones y vistas Crystal.
- `assets/catalog-previews/`: 128 miniaturas WebP optimizadas; cada tarjeta enlaza al original con su formato y dimensiones.
- `assets/crystal-depth-hero.webp` y `assets/crystal-depth-hero-light.webp`: escenas ambientales aprobadas como referencia de estilo.
- `assets/icons/`: PNG separados para once propuestas Crystal y WhatsApp rasterizado desde su activo oficial.
- `docs/DIRECCION-ARTISTICA.md`: dirección artística y seis revisiones críticas.
- `docs/PLAN-MIGRACION-VISUAL.md` y `docs/INTEGRACION.md`: límites de integración.

## Verificación y límites

El 2026-11-13, Chromium local comprobó navegación, pestañas con teclado, alternador de tema, búsqueda y filtros, orden, estado vacío, validación del formulario, diálogo/Escape y enlaces internos. Se revisaron 320, 360, 390, 768, 1024, 1366 y 1920 px; la tabla conserva un scroller horizontal propio en móvil. La carga final no registró errores de consola. `node --check assets/library-catalog.js` y `git diff --check` pasan. Las seis revisiones críticas están en `docs/DIRECCION-ARTISTICA.md`.

Esto no equivale a certificación WCAG, revisión con lector de pantalla/zoom 200 % ni aprobación visual final. Requieren aprobación humana la intensidad del material en claro/oscuro, encuadre móvil de Vico, escena clara, propuestas PNG Crystal y presentación de la galería completa. No cambia la plataforma, MiniWeb2, rutas ni flujos, y no autoriza migración ni publicación.

## Changelog

- 2026-11-13 — 0.7: interacciones y responsive revisados en Chromium; tono hielo unificado con sombras/material; favicon oficial.
- 2026-11-12 — 0.6: galería completa de 140 assets con búsqueda, 17 categorías, orden, dimensiones y once iconos PNG Crystal; acordeón accesible.
- 2026-11-12 — 0.5: tema claro inicial con alternador oscuro, escenas ambientales clara/oscura e iconos PNG Crystal.
- 2026-11-12 — 0.4: biblioteca premium navegable, sistema de superficies, interacciones locales y escena ambiental aprobada.
- 2026-11-12 — 0.1–0.3: laboratorio y primeras muestras aisladas.
