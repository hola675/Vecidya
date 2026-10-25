# Auditoría inicial UI/UX — Mi Vecidya y Vecidya Admin

Fecha: 2026-10-24
Base: rama `main` de `hola675/Vecidya`.
Estado: inventario estático inicial; **no** equivale a pruebas visuales, E2E ni certificación de accesibilidad.

## Alcance verificado

Archivos inspeccionados:
- `app/routes.ts`
- `app/routes/app.tsx`
- `app/routes/internal.tsx`
- `app/components/client-area-shell.tsx`
- `app/components/admin-shell.tsx`

Las rutas reales de administración comienzan por `/app/internal`, no por `/internal`. Las rutas cliente comienzan por `/app`.

## Hallazgos y prioridades

| Prioridad | Superficie | Evidencia en código | Intervención propuesta |
| --- | --- | --- | --- |
| P1 | Cliente | El selector de organización llama a `authClient.organization.setActive` sin comprobar `result.error`. | Mostrar error contextual y permitir reintento; preservar selección activa hasta confirmación. |
| P1 | Cliente | El formulario de creación de organización en `app.tsx` solicita nombre y slug directamente. | Evaluar slug sugerido/validado, explicaciones breves y errores junto a cada campo, sin alterar contrato de servidor. |
| P2 | Cliente | Menú lateral sitúa Mi MiniWeb antes de Mi negocio. | Ordenar por secuencia de configuración verificada; comprobar dependencias y permisos antes de mover enlaces. |
| P2 | Administración | Nueve enlaces administrativos aparecen como una lista continua. | Agrupar visualmente por operación, gestión y control, conservando destinos, roles y aria-current. |
| P2 | Administración | La portada combina KPIs, explicación de modelo, pendientes, guía, barras y múltiples tarjetas. | Priorizar pendientes y acciones frecuentes; reducir repetición y mantener acceso a todas las funciones. |
| P2 | Ambas | Hay drawer móvil con foco, inert y cierre. | Conservar implementación y validar teclado, lector de pantalla, reflow y reduced motion antes de modificarla. |

## Principios de rediseño

1. Mostrar primero el siguiente paso útil, basado en estado real y permisos.
2. Usar pestañas solo para vistas hermanas de una misma entidad; utilizar rutas cuando cambia el objeto de trabajo.
3. Formularios cortos, etiquetas explícitas, ayudas cercanas al campo y errores accionables.
4. Opciones avanzadas mediante divulgación progresiva; no ocultar requisitos obligatorios.
5. Mantener jerarquía de navegación, encabezados, estados vacíos, guardado y cancelación consistentes.
6. Priorizar tareas del cliente sobre métricas decorativas; priorizar operaciones pendientes y trazabilidad en Admin.
7. Validar 320, 390, 768, 1024 y 1440 px; teclado, foco, contraste y reducción de movimiento.
8. No modificar permisos, facturación, publicación, APIs, migraciones ni integración GHL como parte de cambios visuales.

## Orden de implementación

- UX-01: selector de organización y errores; formularios de alta y configuración.
- UX-02: navegación y orientación cliente, estructura de secciones y rutas.
- UX-03: navegación agrupada y jerarquía de dashboard interno.
- UX-04: consistencia de componentes y responsive.
- UX-05: pruebas unitarias/E2E, inspección visual por ruta, documentación y PR.

## Límites

Esta auditoría es preliminar y solo se apoya en los cinco archivos citados. Quedan pendientes la lectura de formularios y estilos completos, pruebas con navegador, verificación de permisos, ejecución de tests y revisión de todos los estados de cada ruta. No declarar correcciones ni PASS sin evidencia.
