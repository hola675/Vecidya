# Vecidya Crystal Depth Design System

**Estado:** laboratorio aislado V0.1. No integrado en la aplicación.

Sistema de materiales translúcidos, iluminación, relieve y profundidad reutilizable para Vecidya y, tras validación, MiniWeb2.

## Estructura

- `index.html`: laboratorio HTML interactivo, sin dependencias.
- `styles/crystal-depth.css`: tokens y clases opt-in para materiales, tarjetas y botones.
- `assets/icons/`: iconos SVG originales de demostración.
- `docs/INTEGRACION.md`: fases de integración y restricciones.

## Uso

Abrir `index.html` en un navegador. Ajustar los controles y copiar los tokens CSS. Para integrar, importar `styles/crystal-depth.css` y aplicar `vx-crystal-theme` al contenedor y `vx-crystal-surface` a las superficies seleccionadas.

**No se modifican** los estilos, rutas, formularios, diagnósticos ni el editor MiniWeb2 existentes.

## Changelog

- 2026-11-12 — V0.1: estructura independiente, tokens de material, laboratorio y documentación inicial.
