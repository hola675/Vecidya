# Integración futura — Vecidya Crystal Depth

## Estado verificado

El repositorio usa TypeScript/React y CSS. Existen vecidya-platform/app/components/ui.tsx, app/styles/premium-foundation.css, app/styles/home-premium.css y app/assets/public-assets.ts.

## Principios

1. Mantener la identidad de Vecidya y separar material de color.
2. El cristal debe permitir apreciar el fondo, pero preservar contraste y legibilidad.
3. Las escenas de página deben tener planos ambientales, vidrio, controles y assets protagonistas.
4. Mantener intactos los formularios y las preguntas del diagnóstico.
5. No imponer la identidad Vecidya a los sitios públicos de clientes MiniWeb2.
6. Respetar prefers-reduced-motion, foco visible y alternativas sin backdrop-filter.

## Ruta de implementación propuesta

- Validar el laboratorio y la especificación de materiales.
- Añadir tokens opt-in a la base de estilos existente.
- Construir variantes React tipadas, sin reemplazar contratos de Button y Card.
- Auditar los módulos y el registro de MiniWeb2 antes de exponer controles de material en su editor.
- Catalogar y optimizar assets (SVG oficial se conserva en la plataforma; esta biblioteca presenta ocho propuestas Crystal en PNG y exporta WhatsApp como PNG para su galería).
- Migrar pantallas una a una y verificar compilación, accesibilidad y regresiones.

No se ha desplegado ni ejecutado la batería de pruebas de la aplicación.

## Estado de Crystal Depth — 2026-11-12

Existe una biblioteca visual independiente en vecidya-crystal-depth/biblioteca.html, con estilos propios, temas claro/oscuro, muestras funcionales y activos oficiales referenciados desde el catálogo actual. Los fondos generados optimizados y PNG de iconos propuestos se conservan dentro de vecidya-crystal-depth/assets/.

Esta entrega no modifica ni importa componentes de la plataforma o MiniWeb2. La biblioteca todavía necesita aprobación visual integral; no representa una migración, publicación o validación de producción.
