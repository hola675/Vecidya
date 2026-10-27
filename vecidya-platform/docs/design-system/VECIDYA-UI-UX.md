# Vecidya — sistema de diseño UI/UX (v0.1, implementación incremental)

## Referencias investigadas
- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill): catálogo de patrones, contraste, tipografía, accesibilidad, dashboards y reglas por stack. Referencia, **no dependencia instalada**.
- [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design): dirección visual específica, calidad de interacción y composición; referencia, **no dependencia instalada**.

Estas referencias informan criterios, pero la fuente de verdad son los componentes, tokens, marca y restricciones **existentes en Vecidya**. No copiar estilos ni sustituir el branding.

## Arquitectura visual
1. **Pública**: editorial, cercana, clara. Explicar valor de presencia digital, beneficios, límites y CTA sin promesas absolutas.
2. **Mi Vecidya**: orientada a tareas. Un objetivo primario por pantalla, progreso real del perfil y próximos pasos.
3. **App Internal**: densa pero legible. Jerarquía: título/contexto → filtros → KPI → tendencia → tabla → acciones. Separar claramente agregados anónimos y PII.
4. **Diagnóstico**: preservar contexto metodológico, estado de evidencia y confianza; no convertir cocientes de eventos en conversiones por usuario.

### MiniWeb pública
- La portada es una imagen de contenido que llena el marco de identidad; el logo queda superpuesto y conserva su propio fondo para mantener legibilidad.
- La cabecera no repite un icono de marca junto al nombre cuando el logo ya está visible.
- Las secciones se apilan en una sola columna y siguen exactamente el orden guardado en el editor. No se asignan posiciones por tipo de módulo, así cada negocio mantiene control de su composición sin huecos artificiales.

- Los encabezados de sección tienen peso visual claro y separación breve respecto del contenido que presentan. Los módulos sin contenido publicable se omiten.

### Configuración privada de MiniWeb
- Presentar un paso activo por vez en un panel de ancho controlado; reducir separaciones verticales del lateral de Mi Vecidya solo en escritorio y esta ruta, para mantener pie, navegación y organización visibles desde 768 px de altura.
- Mantener en móvil el drawer de navegación de cliente con un ancho máximo de 19 rem y margen visible tras el scrim; no acoplar su ancho a la columna estrecha de escritorio.
- Mantener los controles de paso compactos, con áreas táctiles mínimas de 44 px; distinguir visualmente el paso actual sin duplicar estados ARIA.
- Colocar avisos de guardado/error antes del título y mantenerlos visibles al desplazarse, bajo la barra global; conservar los enlaces de salida en la misma pestaña para respetar el aviso de cambios sin guardar.
- Mantener scroll-margin suficiente bajo el encabezado sticky y revisar mensajes, tabs y acciones a 390 px para evitar overflow horizontal.

## Reglas compartidas
- Reutilizar `AdminShell`, `ClientAreaShell`, `Card`, `Badge`, `Icon` y tokens existentes.
- Tipografía, azul/naranja y marca Vecidya ya establecidas; no introducir paletas arbitrarias, fuentes remotas ni librerías visuales sin evaluación.
- Contenedores fluidos; tablas con scroll horizontal etiquetado y alternativas de lectura; evitar texto cortado, zoom roto o columnas imposibles en 320–375 px.
- Contraste WCAG AA, foco visible, `aria-current`, títulos semánticos, errores comunicados, objetivos táctiles de al menos 44 px donde sea posible.
- Gráficos: título, escala explícita, leyenda, rango temporal, fuente y tabla accesible. No usar solo color; valores cero se presentan como cero, no como línea engañosa.
- Respetar `prefers-reduced-motion`; evitar animaciones decorativas en dashboards.
- Estados obligatorios: sin datos, cargando, error, acceso denegado y éxito. Nunca mostrar datos ficticios como reales.
- Privacidad: métricas agregadas por día y PII en vistas separadas; `no-store` para rutas privadas; control server-side de roles.
- GHL aplazado: no introducir conexiones ni nomenclatura CRM en flujos de Vecidya.

## Componentes y patrones a consolidar
- `DiagnosticMetricCard`: número, unidad, descripción de fuente/periodo y vacío.
- `DiagnosticTrend`: serie diaria, eje temporal y tabla alternativa; responsive.
- `AdminFilterBar`: GET, criterios visibles, reset y paginación conservada.
- `ConsentStatus`: texto explícito autorizado/no autorizado; no inferir consentimiento por registro.
- `PageHeading`: eyebrow, título, explicación, acción contextual.

## Criterios de revisión para próximas fases
- 320, 375, 768, 1024 y 1440 px; zoom 200%; teclado y lector de pantalla.
- Contraste y reducción de movimiento; densidad y wrapping.
- Sin dependencias nuevas salvo justificación; CSS localizado y componentes existentes.
- Validación de estados reales en D1 y controles de acceso antes de publicar.

**Estado:** guía implementada en rama; no implica auditoría visual, certificación ni instalación de skills externas.

### Formularios de Mi negocio
- Agrupar campos por intención, limitar texto de ayuda a 66ch y controles a un ancho de lectura cómodo; priorizar dos columnas para datos cortos y una para textos largos.
- Reducir padding y separación en estado, grupos y horarios manteniendo controles de teclado, foco visible y áreas táctiles.
- Mantener la distinción de guardado del perfil y los horarios; la compacidad visual no debe cambiar sus contratos.
