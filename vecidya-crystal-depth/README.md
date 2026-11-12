# Vecidya Crystal Depth

**Estado:** biblioteca visual 0.5, revisión local. No está integrada en Vecidya ni en MiniWeb2.

Sitio independiente de componentes HTML/CSS funcionales, escenas ambientales e iconos en capas separadas. Abre por defecto en tema claro y permite alternar a oscuro. La escena generada aprobada por el usuario se integra como fondo, no como captura ni como contenido de los componentes.

## Abrir

- Abrir `biblioteca.html` directamente en el navegador.
- Abrir `index.html` para que redirija a la biblioteca.
- Para servir desde la raíz del repositorio, iniciar un servidor HTTP estático y visitar `/vecidya-crystal-depth/biblioteca.html`.

No requiere dependencias. La galería referencia marca, Vico, escenas y siete iconos del catálogo oficial. Ocho propuestas de iconos Crystal y una exportación PNG de WhatsApp residen en `assets/icons/`. Los dos fondos ambientales generados optimizados residen en `assets/`.

## Archivos

- `biblioteca.html`: navegación, tarjetas, formularios, pestañas, tabla, estados, diálogo y galería filtrable.
- `styles/crystal-depth.css` y `styles/themes.css`: material, componentes responsive y temas claro/oscuro.
- `assets/crystal-depth-hero.webp` y `assets/crystal-depth-hero-light.webp`: escenas ambientales aprobadas como referencia de estilo.
- `assets/icons/`: PNG separados para ocho propuestas Crystal y WhatsApp rasterizado desde su activo oficial.
- `docs/DIRECCION-ARTISTICA.md`: dirección artística y seis revisiones críticas.
- `docs/PLAN-MIGRACION-VISUAL.md` y `docs/INTEGRACION.md`: límites de integración.

## Verificación y límites

La inspección estática local comprueba sintaxis JavaScript, existencia de referencias y limpieza del diff. En esta sesión el navegador bloqueó la URL local, así que los cambios recientes de tema, búsqueda, diálogo y respuesta móvil aún requieren confirmación visual e interactiva. No cambia la plataforma, MiniWeb2, rutas ni flujos, y no autoriza migración ni publicación.

## Changelog

- 2026-11-12 — 0.5: tema claro inicial con alternador oscuro, escenas ambientales clara/oscura, iconos PNG Crystal y corrección de conteo de galería.
- 2026-11-12 — 0.4: biblioteca premium navegable, sistema de superficies, interacciones locales y escena ambiental aprobada.
- 2026-11-12 — 0.1–0.3: laboratorio y primeras muestras aisladas.
