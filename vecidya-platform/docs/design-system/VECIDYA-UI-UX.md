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
