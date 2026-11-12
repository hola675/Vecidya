# Integración futura — Vecidya Crystal Depth

## Estado verificado

El repositorio usa TypeScript/React y CSS. Existen `vecidya-platform/app/components/ui.tsx`, `app/styles/premium-foundation.css`, `app/styles/home-premium.css` y `app/assets/public-assets.ts`.

## Principios

1. Mantener la identidad de Vecidya y separar material de color.
2. El cristal debe permitir apreciar el fondo, pero preservar contraste y legibilidad.
3. Las escenas de página deben tener planos ambientales, vidrio, controles y assets protagonistas.
4. Mantener intactos los formularios y las preguntas del diagnóstico.
5. No imponer la identidad Vecidya a los sitios públicos de clientes MiniWeb2.
6. Respetar `prefers-reduced-motion`, foco visible y alternativas sin `backdrop-filter`.

## Ruta de implementación propuesta

- Validar el laboratorio y la especificación de materiales.
- Añadir tokens opt-in a la base de estilos existente.
- Construir variantes React tipadas, sin reemplazar contratos de `Button` y `Card`.
- Auditar los módulos y el registro de MiniWeb2 antes de exponer controles de material en su editor.
- Catalogar y optimizar assets (SVG para iconos, WebP/AVIF para ilustraciones).
- Migrar pantallas una a una y verificar compilación, accesibilidad y regresiones.

No se ha desplegado ni ejecutado la batería de pruebas de la aplicación.
