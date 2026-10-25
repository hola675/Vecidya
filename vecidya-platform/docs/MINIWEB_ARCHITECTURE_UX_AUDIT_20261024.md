# Auditoría de arquitectura y rediseño — Mi MiniWeb

Fecha: 2026-10-24. Estado actualizado: implementación incremental en rama de auditoría; validación de compilación, E2E y revisión visual todavía pendientes. Los hallazgos siguientes describen la situación inicial.

## Fuentes revisadas
- app/routes/miniweb-editor.tsx
- app/routes/business-profile.tsx
- app/routes/public-business-profile.tsx
- app/components/public-layout.tsx
- app/components/miniweb/miniweb-renderer.tsx
- app/components/miniweb/templates/default.tsx
- app/components/miniweb/modules/hero.tsx
- app/features/miniweb/{registry,public-model,render,content}.ts

## Arquitectura real
Mi negocio guarda los datos maestros: nombre, slug, categoría, descripción, contacto, redes, ubicación, modalidad y horarios (horarios se guardan con acción independiente). Mi MiniWeb consume estos datos, añade configuración de módulos, ofertas de servicios/productos, preguntas frecuentes y medios. El perfil público se sirve en /vecindario/:slug y usa snapshot de publicación cuando existe. La publicación es explícita; no confundir guardar borrador con publicar.

## Hallazgos
1. El perfil público está envuelto en PublicLayout: header y footer generales de Vecidya; el negocio no domina toda la página.
2. El editor acumula diseño, estructura, contenidos, medios, preview y publicación en una pantalla extensa.
3. La plantilla Esencial es la única disponible; cuatro familias más están planificadas, no operativas.
4. El contrato de MiniWebConfiguration limita layoutVariant a standard, settings a null y no tiene tokens de color, fuentes, variantes de header/footer ni branding.
5. Nueve módulos disponibles: hero, about, contact, hours, services, gallery, location, products y faq. Cuatro planificados: articles, team, certifications, testimonials.
6. Los módulos se filtran por contenido útil antes de mostrarse al público; activar sin contenido no garantiza visibilidad.
7. Servicios/productos comparten BusinessOffering (máximo 12 ofertas totales); FAQ máximo 12. No prometer catálogos ilimitados.

## Arquitectura objetivo
- Mi negocio = fuente única de identidad, datos básicos, contacto, ubicación, horarios, redes y datos administrativos.
- Mi MiniWeb = presentación y contenido editorial adicional: tema, marca visual, portada, orden de módulos, servicios/productos, galerías, FAQ, futuras historias y equipo.
- La publicación pública debe tener header y footer del cliente, con «Creado con Vecidya» discreto y enlaces Volver al Vecindario / Vecidya.
- Preservar URL /vecindario/:slug y snapshot de publicación; no cambiar slug ni URLs existentes sin migración.
- Evitar que edición de perfil publique automáticamente cambios; conservar borrador y revisión concurrente.

## Pestañas propuestas
1. Inicio: estado, completitud y próximo paso.
2. Diseño: colores, tipografía, header, hero, footer y estilo visual.
3. Secciones: activar, ordenar y previsualizar módulos con advertencias de contenido faltante.
4. Contenido: servicios/productos, FAQ, galería y otros contenidos MiniWeb; enlaces a Mi negocio para campos maestros.
5. Publicar: preview desktop/móvil, diferencias, URL y publicación explícita.

## Extensiones priorizadas
P0: layout público independiente y marca del cliente; UX de editor por pestañas sin perder borradores.
P1: tokens de color validados y contrastes, tipografías controladas, variantes de header/hero/footer; CTA contextual; imagen de portada.
P2: bloques de testimonios y equipo con esquema, consentimiento y moderación; certificados verificables; artículos.
P3: familias de plantillas reales y estilos por sector, dominio propio si se aprueba el alcance.

## Guardrails
- No duplicar datos maestros ni integrar GHL por accidente.
- Revisar autorización, accesibilidad, SEO/JSON-LD, enlaces, SSR/hidratación, responsive, reducción de movimiento.
- Versionar configuración y ofrecer migración retrocompatible antes de introducir propiedades.
- Validar que ocultar módulos no exponga datos en HTML/JSON-LD.
- Tests: validación de configuración, snapshots, preview vs publicación, control de versiones 409, medios, permisos y E2E móvil.
- No fusionar ni desplegar sin tests y revisión.

## Avance implementado en rama de trabajo (sin despliegue)

Rama: `audit/app-internal-ux-foundation-20261024`.

- Página pública independiente de `PublicLayout`, navegación generada únicamente desde módulos con contenido visible, identificadores de sección y header/footer del negocio. Se mantienen URL, loader y JSON-LD. Se eliminó el fondo de marca genérico y el padding anidado innecesario.
- Editor de cinco pasos: Diseño, Secciones, Contenido, Vista previa y Publicar. Navegación anterior/siguiente, encabezado de ayuda, foco guiado, respetando movimiento reducido.
- Secciones con estados coherentes con el render público: disponible, lista, pendiente de contenido, inactiva. Enlaces a Mi negocio o al apartado de contenido correspondiente.
- Contenido dividido en Servicios, Productos, Preguntas y Galería/portada. Formularios plegables y estados vacíos; se preservan los límites actuales, sin modificar esquemas de datos.
- Carga de medios con selección diferenciada: portada solo admite imagen, galería admite imágenes/vídeos; el backend sigue siendo autoridad de la validación.
- Vista previa con simulación de ancho móvil y escritorio. **No equivale a prueba responsive en un navegador móvil real.**
- Publicar exige validar título y descripción de ofertas, y preguntas/respuestas; lista de preparación de módulos; borrador y publicación siguen separados.
- Se corrigió la línea base local de guardado para que las revalidaciones y las operaciones de medios no sobrescriban ediciones sin guardar.
- Confirmación de navegación SPA mediante `useBlocker` y `dialog` nativo, más `beforeunload` para recargas. El cambio de organización queda bloqueado temporalmente durante una edición.
- Pruebas unitarias **añadidas, aún no ejecutadas** en `tests/unit/miniweb/render.test.ts` y `tests/unit/miniweb/navigation.test.ts`.

## Verificaciones de aceptación pendientes (NO certificar sin ejecutarlas)

| Comprobación | Esperado | Estado |
|---|---|---|
| `pnpm typecheck` | 0 errores TypeScript/React Router | Pendiente |
| `pnpm build` | SSR y assets compilan | Pendiente |
| `pnpm test:unit` | Todos los tests pasan | Pendiente |
| E2E de MiniWeb | Crear, editar, subir, guardar, previsualizar y publicar | Pendiente |
| Resoluciones 360, 390, 768, 1024, 1366, 1920 px | Sin overflow, diálogos y controles accesibles | Pendiente |
| Navegación con teclado y lector de pantalla | Foco visible, diálogos con Escape y destino correcto | Pendiente |
| Revalidación tras guardar y subir medio | Los demás campos no guardados se preservan | Pendiente |
| Navegación SPA con borrador sucio | Permanecer / salir sin guardar | Pendiente |
| Cambio de organización durante edición | Selector deshabilitado con explicación | Pendiente |
| Configuración concurrente | El error 409 no pisa la edición local | Pendiente |
| Publicación vs. borrador | Solo snapshot publicado queda accesible anónimamente | Pendiente |
| Módulos ocultos o incompletos | No se muestran ni se enlazan desde el header | Pendiente |
| Portada y galería | Solo imagen en portada; galería opcional | Pendiente |
| Vista previa móvil | Contrastar simulación con viewport real | Pendiente |

## Exclusiones expresas de esta iteración

No se han agregado colores, tipografía, constructor libre, variantes persistidas ni plantillas nuevas. El contrato de configuración v1 exige migración/versionado antes de incorporar esas capacidades. Tampoco se han habilitado Artículos, Equipo, Certificaciones ni Testimonios.

**Decisión de entrega:** mantener en rama aislada; no fusionar `main`, no desplegar ni declarar QA certificada hasta ejecutar matriz completa.
