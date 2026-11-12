# Plan de cambios visuales — sin modificación prematura de producción

Versión 0.4 · Estado: biblioteca visual local implementada; integración de la plataforma no iniciada ni autorizada.

## Fase 1: inventario y referencia — completada para esta iteración

Se contrastaron componentes y activos oficiales existentes, incluido el registro app/assets/public-assets.ts. Se verificaron Vico, el símbolo de marca, escenas y siete iconos oficiales; se crearon ocho propuestas Crystal como PNG y WhatsApp se exportó a PNG desde su SVG oficial. No se sustituyeron ni editaron archivos de plataforma.

## Fase 2: aprobación visual — revisión interna completada; aprobación integral pendiente

Se implementó la biblioteca y se revisaron seis pasadas de identidad, composición, material, luz, accesibilidad y viabilidad técnica. El usuario aprobó la primera escena generada como referencia de estilo. La escena clara y los iconos son propuestas por aprobar; la inspección interactiva de escritorio/móvil sigue pendiente porque el navegador bloqueó localhost en esta sesión.

## Fase 3: biblioteca — implementada localmente

biblioteca.html, styles/crystal-depth.css y styles/themes.css contienen superficies, temas claro/oscuro, botones, pestañas, formularios, tabla, estados, diálogo, búsqueda y reglas responsive. Hay dos fondos ambientales WebP y nueve PNG bajo assets/. Marca, Vico, escenas y siete iconos siguen enlazados desde el catálogo original. Esta biblioteca usa HTML/CSS/JavaScript nativo y todavía no es un paquete de componentes de la plataforma.

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

- v0.4: tema claro/oscuro, fondo claro propuesto, nueve iconos PNG y revisión de evidencia; integración y aprobación visual pendientes.
- v0.3: biblioteca local implementada; la integración sigue pendiente.
- v0.2: secuencia de aprobación y matriz inicial, sin migración.
