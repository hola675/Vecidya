# Plan de cambios visuales — sin modificación prematura de producción

Versión 0.5 · Estado: biblioteca visual local ampliada; integración de la plataforma no iniciada ni autorizada.

## Fase 1: inventario y referencia — completada para esta iteración

Se contrastaron componentes y activos oficiales existentes, incluido el registro app/assets/public-assets.ts. El inventario recorre los 140 archivos de `public/assets/`: 116 en `selected/`, 20 en `catalog/` y cuatro imágenes del equipo. Once iconos tienen vistas Crystal PNG propuestas; WhatsApp se exporta a PNG para la galería. Las fuentes originales no se sustituyen ni se editan.

## Fase 2: aprobación visual — revisión interna completada; aprobación integral pendiente

Se implementó la biblioteca y se revisaron seis pasadas de identidad, composición, material, luz, accesibilidad y viabilidad técnica. El usuario aprobó la primera escena generada como referencia de estilo. La escena clara, los iconos Crystal y la colección completa necesitan aprobación visual; la inspección interactiva de escritorio/móvil sigue pendiente porque el navegador bloqueó localhost en esta sesión.

## Fase 3: biblioteca — implementada localmente

biblioteca.html, styles/crystal-depth.css y styles/themes.css contienen superficies, temas claro/oscuro, botones, pestañas, acordeón, formularios, tabla, estados, diálogo, filtros por categoría, orden y búsqueda. `assets/library-catalog.js` indexa 140 fuentes con dimensiones y `assets/catalog-previews/` sirve 128 miniaturas WebP optimizadas; los originales se abren por separado. Hay dos fondos WebP y doce PNG locales. Esta biblioteca usa HTML/CSS/JavaScript nativo y todavía no es un paquete de componentes de la plataforma.

## Fase 4: integración controlada — pendiente, fuera del alcance actual

La integración requiere una solicitud y aprobación visual separadas. Si se autoriza, aplicar cambios opt-in por sección, conservar contratos y flujos de botones, formularios, diagnóstico, rutas y MiniWeb2, y ejecutar las validaciones de plataforma correspondientes.

## Matriz inicial

| Superficie | Objetivo | Prioridad | Estado |
|---|---|---|---|
| Inicio público | escena narrativa y hero | alta | pendiente de aprobación |
| Vecindario | composición territorial y tarjetas | alta | pendiente de aprobación |
| MiniWeb2 editor | materiales configurables | alta | requiere auditoría del registro |
| Panel interno | tarjetas y datos | media | pendiente |
| Diagnóstico | claridad sin alterar flujo | crítica | protegido |

## Condición de avance

No migrar visualmente ninguna pantalla hasta contar con diseño aprobado, referencia de assets correcta, inventario de componentes afectados y plan de reversión.

## Changelog

- v0.5: inventario completo filtrable, metadatos, acordeón y once propuestas de iconos Crystal; integración y aprobación visual pendientes.
- v0.4: tema claro/oscuro, fondo claro propuesto y revisión de evidencia.
- v0.3: biblioteca local implementada; la integración sigue pendiente.
- v0.2: secuencia de aprobación y matriz inicial, sin migración.
