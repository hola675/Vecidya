# Plan de cambios visuales — sin modificación prematura de producción

Versión 0.2 · Estado: planificación, sin ejecución de migración.

## Fase 1: inventario y referencia

Auditar los componentes reales de `vecidya-platform/app/components/ui.tsx`, estilos `premium-foundation.css`, `home-premium.css`, recursos en `app/assets/public-assets.ts` y el registro de MiniWeb2. Identificar activos oficiales de Vico. No sustituir iconos existentes sin inventario.

## Fase 2: aprobación visual

Generar y revisar muestras de material (6 familias), componentes clave, estados y escenas de página. Evaluar con seis pasadas: identidad, composición, materia, iluminación, accesibilidad y viabilidad técnica. Registrar defectos y decisiones.

## Fase 3: biblioteca

Catalogar iconos SVG, fondos y escenas optimizados, componentes React/TypeScript, tokens y ejemplos. Cada recurso requiere nombre, propósito, variantes, estados, responsive, licencia/origen y estado de aprobación.

## Fase 4: integración controlada

Aplicar cambios opt-in por sección. Evitar selectores globales. Mantener contratos y comportamiento de botones, formularios, diagnóstico, rutas y MiniWeb2. Validar build, typecheck, pruebas de regresión, accesibilidad, contraste y rendimiento.

## Matriz inicial

| Superficie | Objetivo | Prioridad | Estado |
|---|---|---|---|
| Inicio público | escena narrativa y hero | alta | pendiente de aprobación |
| Vecindario | composición territorial y tarjetas | alta | pendiente de aprobación |
| MiniWeb2 editor | materiales configurables | alta | requiere auditoría del registro |
| Panel interno | tarjetas y datos legibles | media | pendiente |
| Diagnóstico | claridad sin alterar flujo | crítica | protegido |

## Condición de avance

No migrar visualmente ninguna pantalla hasta contar con diseño aprobado, referencia de assets correcta, inventario de componentes afectados y plan de reversión.

## Changelog

- v0.2: secuencia de aprobación y migración, matriz inicial y protección de flujos.
