# MI VECIDYA + MINIWEB PREMIUM V2 — PLAN MAESTRO V1

**ID:** APP-MINI-PLAN-V1 · **Fecha:** 2026-10-28 · **Estado:** planificación documental, NO implementado · **Repositorio:** `hola675/Vecidya` · **Producto:** `vecidya-platform/`.

**Alcance de este checkpoint:** únicamente este plan en `plans/`. No cambia aplicación, D1, licencias, CRM, producción ni configuración remota. No autoriza merge ni deploy.

> **Evidencia:** `APROBADO` = decisión explícita del usuario; `CODE` = inspección estática de `main`; `DOC` = documentación del repositorio no revalidada en ejecución; `PROPUESTA` = diseño pendiente de validación; `TEST` = prueba efectivamente ejecutada (ninguna nueva). **Marcas:** `[x]` documentado/comprobado dentro de su alcance, `[~]` parcial o pendiente de decisión, `[ ]` no implementado, `[!]` bloqueo. Ningún `[x]` documental acredita software terminado.

## 0. Objetivo y principios

**APROBADO:** Convertir Mi Vecidya en una aplicación coherente, accesible y fácil para personas sin experiencia tecnológica, y MiniWeb en un constructor visual premium de plantillas y secciones personalizables. Complejidad interna, simplicidad externa. Permitir crear, editar, publicar y mantener periódicamente una página sin programar.

**APROBADO:** Vecidya gestiona presencia digital, perfiles, MiniWeb, medios, publicación y configuración de su aplicación. GHL conserva sus funciones CRM; no duplicar CRM, automatizaciones ni contactos de GHL. Usar **licencia**, no membresía. Sin datos comerciales inventados.

**PROPUESTA:** Objetivo WCAG 2.2 AA, enfoque responsive diferenciado por superficie según DEC-17 (§36), SSR, rendimiento medido, componentes semánticos, teclado, movimiento reducido, contraste verificable, privacidad, autorización server-side por organización, progresión de divulgación y diseño consistente por tokens. Evitar HTML/CSS/JS arbitrarios de usuarios.

## 1. Baseline verificado y riesgos

| Fuente | Observación | Nivel |
| --- | --- | --- |
| `app/components/client-area-shell.tsx` | Sidebar actual: Inicio, Mi MiniWeb, Mi negocio, Servicios, Mi CRM, Equipo, Capacitación y Mi cuenta; selector de organización y drawer móvil | CODE |
| `app/routes/app.tsx` | Inicio con progreso de perfil, acciones, estado de servicios y equipo; no atribuirle métricas CRM | CODE |
| `app/routes/miniweb-editor.tsx` | Pestañas Diseño, Secciones, Contenido, Vista previa, Publicar; borrador, publicación, medios, dependencias del perfil | CODE |
| `app/features/miniweb/registry.ts` | Módulos por tipo, `settings: null`, `layoutVariants: ["standard"]`, configuración v1 y límite de 4096 bytes | CODE |
| `app/components/miniweb/templates/default.tsx` | Módulos ordenados y galería que mezcla imágenes/videos; horas como módulo actual | CODE |
| `app/components/public-business-profile-view.tsx` | La portada está dentro del contenedor de identidad que aloja logo; requiere separación estructural | CODE |
| `db/business-hours-rules.ts` | Horario semanal simple: día, cerrado, apertura, cierre; compactación de días consecutivos | CODE |
| `docs/STRUCTURE.md` | Describe checkpoints MiniWeb, permisos, rutas y pruebas históricas; estado local/documentado no equivale a producción | DOC |

**[!] Antes de implementar:** volver a inspeccionar `main` y ramas/PR pertinentes; comparar `fix/miniweb-cover-sections` (un commit exclusivo observado en auditoría previa), evitar rescatar código redundante. Verificar `STATUS.md`, `PROJECT_STATE.md`, `GOVERNANCE.md`, `DATABASE.md`, `TESTING.md` y rutas reales. No usar esta foto estática como certificación dinámica.

## 2. Arquitectura de experiencia de Mi Vecidya

**APROBADO:** mejorar sidebar, Inicio, configuración y navegación general; distinguir navegación global de panel contextual del constructor.

**PROPUESTA — sidebar por objetivos:** Inicio; Presencia digital (Información del negocio, Mi sitio web, Biblioteca multimedia, Publicación); Gestión (Servicios Vecidya, Equipo/permisos, Aprende, acceso CRM externo condicionado a licencia); Configuración; Ayuda. Evitar mostrar destinos sin funcionalidad real. Mantener selector de negocio activo, permisos y rutas previas mediante navegación compatible; no renombrar rutas a ciegas.

**PROPUESTA — configuración por ámbito:**
- **Cuenta (usuario):** identidad, seguridad, sesiones, idioma, accesibilidad y notificaciones solo cuando haya soporte real.
- **Organización/negocio:** datos administrativos, miembros, roles, invitaciones, licencias e integraciones; controles por permisos.
- **Sitio MiniWeb:** plantilla, identidad visual, dominio/slug según capacidad real, navegación, SEO, medios, accesibilidad y publicación.
- **Configuración contextual:** edición cotidiana en la sección seleccionada, no duplicada en Ajustes.

**PROPUESTA — Inicio:** estado real de publicación, tareas accionables, completitud, cambios pendientes, enlaces a página pública, equipo, servicios y Aprende. No inventar visitas, conversiones ni estadísticas.

## 3. Constructor visual MiniWeb: modelo funcional

**APROBADO:** modo Fácil con plantillas, asistente, lenguaje no técnico, ayuda contextual, ejemplos, textos explicativos, edición guiada y publicación sencilla; modo Avanzado para composición y estilos. Misma persistencia y controles de seguridad.

**PROPUESTA — interfaz:** canvas con selección visible; sidebar contextual Página/Secciones/Contenido/Diseño/Multimedia/Ajustes; inspector por sección Contenido/Diseño/Distribución/Avanzado; toolbar Guardar, Deshacer/Rehacer, Vista previa móvil/tableta/escritorio, Publicar. En móvil, panel inferior accesible. Cambios no guardados y bloqueo de navegación; estados vacíos, errores en contexto, recuperación de borradores. Arrastrar opcional con alternativa por botones Mover arriba/abajo.

**APROBADO:** secciones independientes con tamaños y composición únicos; orden editable, combinaciones en dos o más columnas, mezclas de contenido e imagen, paletas, fuentes, estilos y componentes.

**PROPUESTA — motor de composición:** grid semántico de 12 columnas en escritorio, reglas para tablet/móvil, anchuras 12/8/6/4 y combinaciones 40/60, 50/50, 60/40, contenido full-bleed acotado, alineación vertical, espaciado, capas y orden de lectura. Container Queries cuando proceda; no prometer que cualquier combinación será válida. Plantillas por sector como configuraciones iniciales versionadas, no código duplicado.

**PROPUESTA — biblioteca de módulos:** portada; acerca de; servicios; productos; galería de imágenes; galería de videos; horarios V2; ubicación; contacto; FAQ; CTA; equipo, testimonios, artículos y certificaciones solo tras contar con datos, moderación y publicación. Cada módulo define variantes visuales y límites de contenido. Permitir instancias repetidas donde tenga sentido mediante IDs estables (no claves por tipo).

## 4. Portada, imágenes y videos

**APROBADO:** corregir portada para que imagen panorámica, logo y datos de negocio tengan contenedores independientes, sin solapamiento incorrecto. Logo independiente con proporción preservada; portada con recorte/posición focal ajustables.

**APROBADO:** imágenes en contenido y galería adaptables al espacio sin deformación, con posición respecto al texto, tamaños, recorte, foco, composiciones variadas y personalización por sección.

**PROPUESTA — imágenes:** conservar original autorizado, dimensiones, orientación, `alt`, caption, punto focal x/y, `object-fit` contain/cover, relación de aspecto, variantes de entrega responsive, lazy-loading fuera del primer viewport, formatos optimizados y tamaños máximos. Configuración de escritorio/móvil; controles de recorte no destructivos. Verificar políticas R2 y URLs de preview/publicación antes de cambios.

**APROBADO:** separar galerías de imágenes y videos. Ofrecer mosaico, cuadrícula, collage, carrusel y vista ampliada para imágenes; tarjetas, carrusel, reproductor destacado, playlist y pantalla completa para videos.

**PROPUESTA — video:** poster, subtítulos/captions cuando existan, controles nativos o accesibles, carga diferida, límites de tamaño/duración, validación MIME, políticas de origen, reproducción manual por defecto, no autoplay con audio, movimiento reducido y fallback. **[~]** Decidir almacenamiento/transcodificación y si se permiten enlaces externos; no asumir un servicio de streaming contratado.

**PROPUESTA — carruseles:** flechas, paginación, swipe, teclado, foco, anuncio accesible de posición, pausa, no cambio automático por defecto, sin scroll-jacking. Verificar dependencia existente antes de incorporar otra.

## 5. Horarios V2 desde cero

**APROBADO:** retirar **completamente el módulo visual y editor de horarios antiguo** y crear uno nuevo; no reutilizar la UI antigua. **No borrar registros de negocios ni datos históricos sin migración y verificación.**

**PROPUESTA — modelo:** zona horaria IANA por negocio; 7 días independientes; cerrado/abierto; uno o varios intervalos por día; copiado de días laborables con posterior edición individual; descansos; excepciones por fecha (festivos, cierres, ampliaciones); validación de solapes, cruces de medianoche y consistencia; estado «Abierto ahora» solo con zona horaria y reglas fiables. Vista pública compacta, semanal, tarjetas y tabla, configurable por estilo. Separar fuente de horario del componente de presentación.

**[!]** Determinar si el horario alimenta otros consumidores (perfil público, Vecindario, validaciones, snapshot) antes de cambiar contrato o migración.

## 6. Sistema de diseño y personalización

**PROPUESTA:** tokens tipados por tema global, página y sección: fondo, superficie, título, texto, enlaces, botones, acentos, tipografías permitidas, escala tipográfica fluida, ancho, padding, gap, radio, borde, sombra, alineación, animación sutil. Controles por opciones acotadas con contraste automático y previsualización. Combinaciones premium curadas por sector; edición avanzada sin exponer CSS libre.

**PROPUESTA:** identidad visual coherente entre panel y páginas públicas sin imponer el tema de la marca Vecidya a cada negocio. Respetar preferencia de movimiento reducido, orden DOM/visual y tamaños táctiles.

## 7. Contratos backend y seguridad (diseño, no código)

**PROPUESTA:** configuración `MiniWebConfigurationV2` versionada con `schemaVersion`, `templateId/version`, `themeTokens`, `page` (una única página con secciones; sin multipágina en V2), `sections` con `instanceId`, `type`, `variant`, `contentRef`, `layout`, `styleOverrides`, `responsiveOverrides`, `visibility`; JSON validado en servidor con límites de tamaño, profundidad, cantidad de bloques y valores allowlist. No extender el límite de 4096 bytes sin medir D1, snapshot y API.

**PROPUESTA:** datos de contenido estructurados y medios con IDs y permisos; separación entre contenido reutilizable y apariencia; borrador y snapshot público inmutable/versionado; guardado optimista con revisión y conflictos explícitos; autorización por organización y rol en cada endpoint; auditoría de publicación; migración de v1 a v2 compatible, lectura dual temporal y rollback. No ejecutar D1 remota ni romper contratos publicados.

**PROPUESTA:** reutilizar React Router, TypeScript, Cloudflare Workers, D1/Drizzle, R2 y componentes existentes; evaluar bibliotecas accesibles de primitivas/carrusel sin adoptar dependencias automáticamente. Arquitectura de registro de módulos y plantillas en lugar de duplicar páginas.

## 8. Fases, dependencias y entregables

| Fase | Estado | Entregable | Gate focal |
| --- | --- | --- | --- |
| F0 Auditoría y decisiones | [~] | Inventario de rutas, schema, PRs, media, CSS, permisos, dependencias y decisiones abiertas | Matriz CODE/DOC/TEST y contratos aprobados |
| F1 Shell Mi Vecidya | [ ] | Sidebar, Inicio, selector y configuración por ámbitos | Navegación móvil/teclado, cambio de org, guardas |
| F2 Contrato MiniWeb V2 | [ ] | Registry, IDs, validadores, compatibilidad de snapshots y migración local | Tests unitarios schema y aislamiento |
| F3 Portada e identidad | [ ] | Cover independiente, logo, composición responsive y editor focal | E2E portada y capturas 320/390/768/1366 |
| F4 Multimedia | [ ] | Biblioteca, imágenes responsive, galerías separadas, carrusel y video | Upload seguro, preview/público, teclado, rendimiento |
| F5 Horarios V2 | [ ] | Retiro de UI antigua, nuevo modelo y editor semanal/excepciones | Casos de solape, TZ, DST, compatibilidad |
| F6 Diseño y composición | [ ] | Tokens, variantes, grid, posicionamiento y temas | Render SSR, contraste, responsive, persistencia |
| F7 Editor Fácil/Avanzado | [ ] | Inspector, ayudas, asistente, deshacer, estados y previews | Flujo principiante, accesibilidad y guardado |
| F8 Publicación y mantenimiento | [ ] | Revisión, snapshots, historial de versiones y restauración aprobados, actualización periódica | No filtrar borradores, concurrencia y autorización |
| F9 Certificación y release | [ ] | Evidencia focal por superficie, QA de regresión relevante y handoff | Typecheck, build, diff-check, aprobación merge/deploy |

**Dependencias:** F0 → F2; F1 puede avanzar tras F0 con PR aislado; F2 → F3/F4/F5/F6; F3–F6 → F7 → F8 → F9. Evitar migración D1 y frontend incompatible en un mismo corte sin feature gate/rollback.

## 9. Plan de pruebas focalizadas y calidad

**PROPUESTA:** pruebas unitarias de schemas, horarios (DST, medianoche, excepciones), layouts y sanitización; E2E MiniWeb de preview/publicación y aislamiento por organización; pruebas de selector y drawer, foco/teclado, alt/captions, reduced motion, controles de carrusel, carga y errores; capturas de variantes en móvil/tableta/escritorio; tests de snapshots y migración D1 **local**. Por PR: pruebas estrictamente del alcance + typecheck/build/diff-check cuando aplique. No disparar CI general ni tests remotos sin necesidad/autorización; documentar evidencia real sin inventar PASS.

**Rendimiento:** presupuesto a definir con mediciones: LCP, CLS, INP, peso de imagen/video, carga diferida y tamaño del bundle. **Accesibilidad:** objetivo WCAG 2.2 AA, evaluación automatizada + revisión manual de flujos críticos. No afirmar conformidad sin auditoría.

## 10. Decisiones confirmadas y cuestiones técnicas pendientes

**Confirmación explícita del usuario — 2026-10-28 (APROBADO):**

| ID | Decisión vinculante | Implicación para implementación |
| --- | --- | --- |
| DEC-01 | **MiniWeb V2 será de una sola página**, compuesta por secciones | Un único documento público por negocio; no crear rutas multipágina, menús de páginas ni contratos `pages[]` en V2 |
| DEC-02 | **Videos subidos a Vecidya y enlaces externos** | Dos orígenes de medios con validación, autorización, reproductor y tratamiento de privacidad diferenciados; evaluar YouTube/Vimeo como proveedores permitidos, no aprobados individualmente aún |
| DEC-03 | **Múltiples galerías de imágenes y de videos** en una misma página | Secciones con `instanceId` estable; no indexar solo por tipo; orden, contenido y diseño independientes |
| DEC-04 | **Distribución progresiva de plantillas por licencia: Cuadra → Barrio → Ciudad** | Cuadra: catálogo esencial; Barrio: catálogo esencial + diseños avanzados; Ciudad: catálogo anterior + catálogo completo. Resolver entitlement en servidor por organización/licencia; conservar página pública publicada ante downgrade y exigir plantilla autorizada para nuevos cambios de diseño/publicaciones (DEC-07) |
| DEC-05 | **Historial de versiones y restauración** | Snapshot inmutable por publicación, metadatos autor/fecha/revisión, restauración como **nuevo borrador** y publicación posterior explícita; autorización, retención y cuota por definir |

**Reglas obligatorias derivadas:** nunca autorizar plantillas únicamente desde el frontend; no exponer borradores ni archivos privados en snapshots públicos; la restauración no sobrescribe automáticamente una publicación ni permite acceso entre organizaciones; los enlaces externos deben usar allowlist y protección frente a URLs maliciosas; las subidas deben validar tipo/tamaño y permisos en servidor.

**[~] Cuestiones de diseño pendientes de evidencia y/o decisión:**
1. Horarios V2: confirmar alcance inicial de turnos nocturnos, excepciones y zona horaria; propuesta: incluirlos.
2. Videos: definir límites por licencia, tamaño, duración, almacenamiento/transcodificación y proveedores externos concretos tras revisar infraestructura/costes.
3. Plantillas: **jerarquía progresiva aprobada** Cuadra (esenciales), Barrio (+ avanzadas), Ciudad (+ catálogo completo). Pendiente catalogar IDs y diseños concretos, verificar el contrato comercial vigente y aplicar DEC-07 al downgrade y definir por separado expiración/suspensión. No inventar precios, cupos ni nuevas prestaciones comerciales.
4. Historial: definir cantidad/retención de versiones y permisos de restauración, con costes y auditoría.
5. Medios: definir cuota operativa por negocio y política de borrado/retención según R2 y licencias.

**No bloquean la documentación:** estas cuestiones se resolverán en F0 y antes de las migraciones o controles comerciales afectados; no inferir respuestas del silencio del usuario.

### DEC-06 — Catálogo progresivo de plantillas (APROBADO, 2026-10-28)

- **Cuadra:** acceso al conjunto base de plantillas esenciales.
- **Barrio:** acceso acumulativo a Cuadra y a plantillas de composición avanzada.
- **Ciudad:** acceso acumulativo a Cuadra, Barrio y el catálogo premium completo.
- **No regresión:** una licencia superior incluye las plantillas de niveles inferiores; las capacidades de contenido, almacenamiento, dominios y medios **no** quedan diferenciadas automáticamente por esta decisión.
- **Backend propuesto:** catálogo versionado con `templateId`, `version`, `minimumLicenseTier` y estado; entitlement efectivo resuelto en servidor a partir de la licencia real de la organización, no de un parámetro cliente. Validar al seleccionar, guardar y publicar; no revelar borradores ni activos ajenos.
- **Frontend propuesto:** mostrar plantillas disponibles y bloqueadas con explicaciones claras de la licencia necesaria; no ocultar de forma engañosa plantillas ya utilizadas. Previsualización segura sin habilitar publicación no autorizada.
- **Compatibilidad:** conservar el render de páginas ya publicadas si cambia el entitlement hasta que se apruebe una política de transición; nunca degradar silenciosamente la apariencia, eliminar contenido ni despublicar automáticamente.
- **Pendiente F0:** mapear nombres/IDs reales y condiciones comerciales de Cuadra/Barrio/Ciudad; decidir política de expiración/suspensión y disponibilidad de preview; downgrade resuelto en DEC-07; verificar que el modelo de licencias permite jerarquía acumulativa. **Esta decisión no autoriza migraciones ni cambios de precio.**

### DEC-07 — Política de reducción de licencia (APROBADO, 2026-10-28)

**Decisión:** si una organización reduce su licencia (por ejemplo, de Ciudad a Cuadra), **la página pública ya publicada conserva su diseño y contenido sin degradación automática**. Para efectuar **nuevos cambios de diseño o nuevas publicaciones**, el negocio debe elegir una plantilla autorizada por su licencia efectiva. No despublicar ni sustituir automáticamente la plantilla premium anterior.

**Reglas funcionales y de seguridad:**
1. **Lectura pública:** el snapshot publicado permanece renderizable aunque su `templateId` ya no esté autorizado para nuevas publicaciones; esto no concede acceso al editor premium.
2. **Borrador y edición:** conservar contenido, medios y versiones históricas. Permitir consultar el estado del sitio y preparar la migración de diseño sin destruir datos; bloquear guardar/aplicar cambios de diseño premium y cualquier nueva publicación mientras el borrador use una plantilla no autorizada. No confundir edición de datos del negocio con una publicación MiniWeb.
3. **Nueva publicación:** resolver en backend el nivel de licencia **efectivo** de la organización al momento de publicar; validar la plantilla de destino y su estado `available`. Si no está autorizada, rechazar la publicación con error comprensible y acción guiada «Elegir plantilla disponible». La validación del frontend es solo ayuda.
4. **Restauración:** recuperar una versión histórica como borrador, **sin publicar automáticamente**. Si la versión restaurada usa una plantilla superior, conservar su contenido y exigir cambiar a una plantilla permitida antes de publicar.
5. **Cambio de plantilla:** proponer mapeo de secciones y contenidos compatibles, vista previa y confirmación explícita. No eliminar contenido incompatible de forma silenciosa; conservar copia recuperable.
6. **Aislamiento y auditoría:** verificar sesión, organización, rol/permiso, licencia efectiva, pertenencia de recursos y concurrencia; auditar cambios de licencia, intentos de publicación denegados y publicaciones/restauraciones efectivas según política vigente.
7. **Pruebas focalizadas obligatorias:** downgrade Ciudad→Cuadra con página publicada premium inalterada; rechazo de nueva publicación premium; cambio a Esencial y publicación autorizada; restauración de versión premium sin bypass; aislamiento tenant; carreras entre cambio de licencia y publicación; no regresión de página pública.

**Alcance preciso:** «nuevos cambios de diseño o publicación» no significa borrar, ocultar ni bloquear la visualización de contenido existente. Las actualizaciones de datos de perfil independientes de la publicación MiniWeb deben seguir sus permisos propios. **[~]** F0 debe concretar si hay un modo de edición de contenido sin republicación y el tratamiento de expiración/suspensión por causas distintas del downgrade; esta decisión no define esas políticas.

**Estado:** `APROBADO` como contrato de producto; `[ ]` backend/frontend/tests no implementados. No ejecutar migraciones ni cambios comerciales sin checkpoint aprobado.

## 11. Gobernanza y handoff

- Revisar `AGENTS.md`, `docs/GOVERNANCE.md`, `STATUS.md`, `PROJECT_STATE.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `DATABASE.md`, `TESTING.md` antes de ejecutar.
- Trabajar en ramas/worktrees aislados por checkpoint `feat/app-mini-<checkpoint>`; verificar `git status`, `git branch -vv`, `git fetch origin`. No tocar otros agentes.
- Cada PR: alcance pequeño, tests focalizados, typecheck/build si hay código, documentación canónica reconciliada, commit y revisión. Sin merge ni deploy sin aprobación explícita.
- Actualizar el avance **en este documento**, sin crear informes de fase dispersos. No confundir `DOC` con `TEST`.

## 13. F0 — contraste comercial y registro de plantillas (CODE / DOC / PROPUESTA)

**CODE (inspección estática 2026-10-28):**
- `app/routes/licenses.tsx`: la tabla comparativa declara «MiniWeb y Vecindario» **incluidos en Cuadra, Barrio y Ciudad**; no distingue plantillas. La activación se coordina por contacto, sin checkout automático.
- `app/features/miniweb/registry.ts`: `vecidya-default` («Esencial») está `available`; `services-studio`, `catalog-store`, `gastronomy-table` y `professional-profile` están `planned`. Sus `layoutVariants` son `standard`; el registro no contiene `minimumLicenseTier`.
- `docs/PROJECT_STATE.md` (DOC): informa de un release 0.9.0 y cambios de plataforma recientes; antes de implementar, actualizar el baseline de `main` y revisar la migración `0030` y permisos de `platform_admin`. Este plan no acredita una nueva prueba HTTP ni validación de producción.

**Conclusión:** DEC-06 es una decisión **nueva de producto**, no una prestación existente. La comunicación comercial debe seguir siendo veraz: MiniWeb sigue incluido en las tres licencias, mientras la **amplitud del catálogo de plantillas** será progresiva cuando se implemente y publique la diferenciación. No alterar por inferencia el alcance CRM de las licencias.

**PROPUESTA — contrato del catálogo:**
- `TemplateTier = "cuadra" | "barrio" | "ciudad"`; relación de inclusión acumulativa, validada contra licencias reales del backend, sin confiar en claims del navegador.
- Cada plantilla tiene ID estable, versión, categoría, miniatura, variantes, requisitos de módulos, estado `planned|available|retired` y nivel mínimo; solo `available` se puede seleccionar/publicar.
- La plantilla Esencial existente permanece como base de compatibilidad de Cuadra; **no** asignar las cuatro familias planificadas a niveles específicos sin una decisión editorial y pruebas visuales.
- Resolver entitlement para selección, guardado, preview privado y publicación; preservar el snapshot público anterior ante downgrade y exigir selección de plantilla permitida antes de una nueva publicación (**DEC-07 aprobado**).
- Sin catálogo comercial actualizado y pruebas de autorización, no habilitar restricciones nuevas en producción. Las páginas existentes no se migran ni degradan silenciosamente.

**[!] Gate comercial F0:** reconciliar `app/content/commercial-detail.ts`, `docs/business/VECIDYA_PRODUCT_CATALOG.md`, páginas de licencias y texto de la interfaz con el catálogo real, sin cambiar precios ni promesas CRM. Solicitar aprobación explícita de la redacción comercial antes de publicar.

**[~] Gate técnico F0:** inspeccionar cómo se resuelve hoy la licencia efectiva, expiración y cambio de nivel, así como snapshot, API y cache; después definir pruebas de permisos para Cuadra/Barrio/Ciudad, sin suponer jerarquía implementada.

## 14. Handoff de siguiente checkpoint

1. Auditar licencias/entitlements, media R2 y snapshots actuales en el HEAD de implementación; listar contratos, rutas y pruebas focales.
2. Proponer matriz concreta de plantillas; implementar DEC-07 solo tras auditar licencia efectiva, snapshots y rutas de publicación.
3. Aislar PR de contrato/registro antes de introducir UI de plantillas bloqueadas.
4. No iniciar cambios de producción, D1 remota, merge o deploy sin autorización.

## 15. F0 — hallazgos de contratos existentes y migración segura (CODE)

**Inspección estática adicional 2026-10-28, sin pruebas nuevas:**
- `app/content/commercial-detail.ts` declara expresamente que su catálogo es **comunicación comercial, no fuente de entitlements técnicos**. Cuadra incluye MiniWeb; Barrio hereda Cuadra; Ciudad hereda Barrio. El control técnico de plantillas debe leer el servicio real de licencias, no este archivo.
- `app/routes/miniweb-editor.tsx` usa `requireOrganizationPermission(..., "business-profile:read")`, devuelve `canEdit/canPublish` según rol `owner|admin`, carga borrador, `draftRevision`, `publishedConfiguration`, media, horarios y snapshot. Es un indicador del modelo de permisos actual, **no** certifica las acciones de escritura; auditar sus endpoints por separado.
- `app/features/miniweb/registry.ts`: configuración v1 con `modules[]` identificados por `type`, `settings:null`, una sola variante `standard` y máximo 4096 bytes. La validación de plantillas actualmente comprueba `available` y versión, pero **no** un nivel de licencia.
- `db/schema/miniweb.ts`: `miniweb_site` es único por organización; `miniweb_module` tiene índice único `(miniweb_site_id,module_type)`, incompatible con múltiples instancias del mismo tipo. `business_media_asset` ya está ligado a organización y R2 mediante `object_key`, con `purpose`, `media_type`, `content_type`, `size_bytes`, `alt_text`, `is_active`.

**Impactos y secuencia recomendada:**
1. **Múltiples galerías:** migrar el identificador de módulo desde `type` a `instanceId`, mantener `type` como categoría y retirar el índice único por tipo solo tras introducir la nueva restricción por instancia; migración local con backfill estable y rollback/compatibilidad de snapshots v1.
2. **Videos externos:** modelar un origen `uploaded|external` con URL normalizada y allowlist de proveedores; no confundir `object_key` de R2 con URLs de terceros ni almacenar credenciales en snapshots.
3. **Plantillas por licencia:** resolver entitlement desde el sistema operativo de licencias y añadir validación de plantilla al guardado/publicación; mantener el render de snapshots históricos en modo lectura aun si la plantilla deja de estar habilitada para nuevas publicaciones.
4. **Historial:** el snapshot publicado actual y `draftRevision` **no demuestran** que exista un historial recuperable de versiones. Diseñar registro inmutable con organización, autor, fecha, versión, hash y operación de restauración a borrador; confirmar retención y coste antes de migrar.
5. **Seguridad:** distinguir guardas de lectura del editor de permisos de edición/publicación; revisar endpoints y transacciones contra cambios concurrentes de licencia, publicación y medios.
6. **No romper datos existentes:** migraciones aditivas y pruebas de v1→v2 en D1 local; no cambiar índice ni serialización pública hasta que el lector dual y las pruebas focales funcionen.

**Gate F0 pendiente:** localizar rutas de escritura/publicación, queries de snapshots, tablas de licencia efectiva y API de media; ejecutar pruebas focales únicamente cuando se implemente el checkpoint correspondiente. Estos hallazgos son `CODE` por lectura, **no `TEST`**.

## 16. F0 — concurrencia de publicación, cuotas y compatibilidad (CODE)

**CODE inspeccionado en `db/queries/business-publication.server.ts`:**
- `BUSINESS_PUBLICATION_SCHEMA_VERSION = 4`; el parser trata snapshots heredados y distingue medios/branding por versión. V2 deberá mantener lectura de snapshots anteriores y definir una versión nueva sin reinterpretar JSON histórico.
- `readConsistentBusinessDraftState` compara revisiones antes/después de cargar; `commitBusinessDraftMutation` usa revisión esperada y token de escritura para detectar conflictos `409`.
- `publishBusinessPublicationForOrganization` construye un snapshot y actualiza `business_profile_publication.snapshot_json`, incrementando `published_version` y registrando auditoría cuando recibe actor. El campo se **sobrescribe**: la versión numérica y la auditoría no constituyen por sí mismas un historial restaurable.
- El publish hace compare-and-swap sobre `draft_revision` y `published_version`; **no se observa en esta función** una comprobación de licencia efectiva/plantilla. No afirmar ausencia global sin auditar las rutas invocadoras.
- El esquema de snapshots contiene perfil, horarios, configuración, contenido, medios e identidad; la restauración debe coordinar todas estas dependencias y no solo `configuration`.

**CODE inspeccionado en `db/queries/business-media.server.ts`:** límite por archivo `MAX_BUSINESS_MEDIA_BYTES = 32 MiB` y almacenamiento activo por organización `MAX_BUSINESS_MEDIA_STORAGE_BYTES = 100 MiB`. Son límites técnicos actuales, **no** cuotas comerciales aprobadas por licencia. No prometer que soportan videos largos; estudiar duración, procesamiento, coste y entrega antes de ampliar.

**Riesgo crítico DEC-07:** el control de licencia para guardar/publicar no debe evaluarse solo al cargar el editor. La licencia puede cambiar entre lectura, validación y commit; diseñar un chequeo vinculado a la mutación, con consistencia transaccional o bloqueo verificable, y pruebas de carrera downgrade↔publish. Un snapshot público histórico debe seguir siendo legible aunque el catálogo actual marque la plantilla `retired`.

**Plan focal F2/F8:**
1. Extraer función de entitlement tenant-scoped y contrato de decisión `canSelect/canSaveDesign/canPublish`; distinguir lectura pública y restauración.
2. Guardar cada publicación en una tabla de historial inmutable **en la misma transacción/batch consistente** que cambia el snapshot actual, con versión, actor, hash, fecha y organización; confirmar el comportamiento real de `batch` y pruebas de fallos antes de afirmar atomicidad.
3. Restaurar una versión como nuevo borrador bajo control de revisión, conservar datos/medios y no publicar sin nueva acción autorizada.
4. Probar snapshot v1/v2/3/4, versión V2 futura, downgrade y publicación concurrente, historial, restauración, medios ausentes y aislamiento entre organizaciones.
5. Auditar rutas API de escritura y publicación por su nombre real en el árbol; las rutas tentativas no fueron encontradas por path y **no** se presume que no existan.

**Evidencia:** lectura estática CODE; no se ejecutaron tests, CI, migraciones ni despliegue.

## 17. F0 — rutas reales, autorización y licencias multi-organización (CODE / DOC)

**CODE verificado en `app/routes.ts`:**
- `/api/organizations/:organizationId/miniweb-config` → `app/routes/api-miniweb-config.ts` (GET, POST save/publish).
- `/api/organizations/:organizationId/business-media` → `api-organization-business-media.ts` y `.../:assetId` → `api-organization-business-media-asset.ts`.
- `/media/business/:slug/:assetId` → `api-public-business-media.ts`.
- `/api/platform/organizations/:organizationId/license` → `api-platform-licensing.ts`; administración interna de licencias también disponible.

**CODE en endpoints inspeccionados:**
- `api-miniweb-config.ts`: comprueba organización activa y permisos `business-profile:read` (GET), `business-profile:update` (save), `business-profile:publish` (publish). Llama a `saveMiniWebConfigurationForOrganization` y `publishBusinessPublicationForOrganization`; **en el código inspeccionado no aparece consulta de licencia efectiva en la ruta**. El control de entitlement V2 debe cubrir ambos intents y la mutación subyacente, no solo el editor.
- `api-organization-business-media.ts`: upload requiere permiso `business-profile:update`, revisiones CAS y registro tenant-scoped. Auditar por separado borrado/lectura pública y referencias R2 antes de diseñar nuevas galerías.
- `api-platform-licensing.ts`: `getOrganizationLicense(database, organizationId)` ofrece un punto de lectura para la licencia de la organización; los cambios requieren `organization:license:update` de plataforma y comparan `currentLicenseId` en operaciones. Revisar implementación/estados/fechas antes de decidir entitlement; **no importar directamente una ruta de administración como dependencia del editor**.
- `app/content/commercial-detail.ts` no es una fuente técnica de permisos.

**Corrección aprobada (DEC-08):** la propuesta anterior de publicaciones secundarias amparadas sin cupos queda sustituida. Una o varias licencias activas Cuadra/Barrio/Ciudad conceden un único bloque base de 3 MiniWeb; solo Cuadras adicionales de ampliación suman otros bloques de 3. Barrio/Ciudad incluyen una sola vez el beneficio Cuadra y conceden CRM exclusivamente a su organización asignada. El catálogo histórico requiere conciliación. La atribución de plantillas avanzadas se resolvió en DEC-10 (compartidas por titular) y la suspensión/expiración en DEC-09 (congelación pública y desactivación administrativa).

**Cierre parcial:** el inventario de rutas ya está localizado. Pendientes inspeccionar `getOrganizationLicense`, estados efectivos, acceso público a medios, baja de activos, y transacciones; no afirmar implementación ni tests.

## 18. DEC-08 — Cupos base únicos y ampliación exclusiva mediante Cuadra (CORREGIDO Y APROBADO, 2026-10-29)

- Publicar requiere licencia activa y cupo. El titular obtiene **un único bloque base de 3 MiniWeb** al disponer de al menos una licencia activa Cuadra, Barrio o Ciudad.
- **Barrio y Ciudad NO acumulan cupos:** tener ambas mantiene el bloque base de 3. Cada una habilita CRM solo para su organización asignada.
- **Solo las licencias Cuadra adicionales adquiridas para ampliar capacidad** añaden bloques de 3 MiniWeb. No sumar automáticamente una Cuadra ya utilizada como licencia base ni convertir Barrio/Ciudad en bloques adicionales.
- Ejemplos inequívocos: 1 Cuadra = 3; 1 Barrio = 3; 1 Ciudad = 3; Barrio + Ciudad = 3; Barrio + Ciudad + 1 Cuadra adicional = 6; Barrio + Ciudad + 2 Cuadra adicionales = 9. Más de 6 requiere otra Cuadra adicional.
- El control técnico debe distinguir **bloque base ya concedido** de **Cuadras de ampliación**, para impedir doble cómputo. CRM y cupos se resuelven separadamente; ninguna organización hereda CRM ajeno.
- Pendientes de diseño: cómo registrar y clasificar una Cuadra base frente a Cuadra de ampliación cuando cambian licencias; plantillas premium en organizaciones sin CRM propio; suspensión/expiración, exceso de cupos y transferencias.
- Pruebas focales: Barrio + Ciudad = 3; Barrio + Ciudad + Cuadra adicional = 6; no duplicación al cambiar licencias; publicación concurrente sobre último cupo; aislamiento por titular.
- **Estado:** decisión aprobada; sin implementación ni tests.

## 19. F0 — compatibilidad del esquema de licencias y propuesta de capacidad (CODE / DISEÑO)

**CODE verificado** en `db/schema/licensing.ts` y `db/queries/licensing.server.ts`:
- `billing_account` tiene un `owner_user_id` único. La frontera económica es el titular de facturación, **no** las membresías de Better Auth.
- `organization_license` vincula cada licencia a una organización y tiene un índice único parcial para una licencia no cancelada por organización. No modela directamente la compra de varias Cuadras de ampliación sin crear organizaciones ficticias o alterar la semántica de CRM.
- Estados disponibles: `pending`, `active`, `suspended`, `cancelled`. Existen `activated_at` y `ends_at`; comprobar ambos al definir licencia efectiva, no usar solo el texto de estado.
- `getLicenseLinesForBillingAccount` lista licencias del mismo `billing_account` y no deriva derechos de `member`.
- `api-platform-licensing.ts` opera asignación, cambio, cancelación, suspensión, reactivación y transferencia mediante `platform_admin`; no existe checkout autoservicio en esta ruta.

**Propuesta técnica F2, no implementada:**
1. Mantener `organization_license` para la licencia y CRM de cada organización, sin romper su unicidad ni la auditoría.
2. Añadir entidad explícita de **Cuadra de ampliación de capacidad** vinculada a `billing_account`, con identificador, estado efectivo, fechas, referencia contractual y auditoría. No representar la ampliación como licencia CRM de una organización ficticia.
3. Resolver `baseSlots = 3` cuando el titular tenga al menos una licencia Cuadra/Barrio/Ciudad efectiva; en caso contrario `baseSlots = 0`. Resolver `extraSlots = 3 × ampliaciones Cuadra efectivas`; total = base + extra. La Cuadra base **no se cuenta otra vez** como ampliación. Validar también los estados de las ampliaciones.
4. Registrar asignación de cada MiniWeb publicado a la cuenta titular y consumir un cupo por organización; definir explícitamente transferencias de titular, downgrade y sobrecupo antes de migrar.
5. El servidor debe verificar capacidad al publicar, con prueba de carrera sobre el último cupo; no basta un contador en UI ni una consulta separada sin protección contra concurrencia.
6. El CRM Barrio/Ciudad se autoriza **por licencia de la organización destino**, nunca por cupos disponibles del titular.
7. La matriz de plantillas premium DEC-06 sigue vigente y DEC-10 aprueba compartir el nivel visual máximo entre organizaciones del titular, sin compartir CRM.

**Bloqueos antes de implementar:** modelo comercial/operativo de compra de ampliaciones (sin checkout automático actual), tratamiento de sobrecupo por suspensión/expiración, y migración de organizaciones ya publicadas. **Evidencia CODE + propuesta**, sin pruebas ni migraciones.


## 21. Plan ejecutable por fases — decisiones, entregables y criterios de salida (2026-10-29)

**Objetivo:** pasar de auditoría a implementación sin bloquear todo el proyecto por decisiones secundarias. Cada fase entrega un PR acotado, pruebas focalizadas de archivos y contratos afectados, evidencia reproducible y revisión de compatibilidad con el HEAD actualizado. No lanzar suites generales ni editar áreas ajenas. No fusionar ni desplegar sin autorización.

### F0 — Cierre de contratos y compatibilidad
**Entregables:** matriz de decisiones DEC-01–08; inventario de endpoints, tablas, permisos y snapshots; contrato de cupos por cuenta; política de referencias de medios; matriz de riesgos y compatibilidad. **Salida:** ninguna ambigüedad impide implementar el núcleo. Las decisiones comerciales aún abiertas se aíslan detrás de reglas conservadoras y no se publican como hechos.

### F1 — Mi Vecidya: navegación y experiencia
**Entregables:** shell móvil/escritorio, selector de organización con contexto persistente, panel de estado, rutas de MiniWeb y negocio, vacíos/errores/carga accesibles. **Salida:** usuario cambia de organización sin fuga de datos y encuentra edición/publicación en máximo dos pasos de navegación. Pruebas focales de rutas, permisos y componentes.

### F2A — Licencias y capacidad MiniWeb
**Contrato aprobado:** bloque base único de 3 MiniWeb si existe al menos una licencia activa Cuadra/Barrio/Ciudad; Barrio y Ciudad no suman bloques; solo Cuadras de ampliación explícitas añaden 3 cada una. CRM Barrio/Ciudad exclusivo de la organización asignada.
**Diseño propuesto:** conservar organization_license; añadir registro de ampliaciones ligado a billing_account, estado y fechas; resolver capacidad en servidor; registrar titular de cada publicación y ocupación; controlar concurrencia del último cupo; denegar nuevas publicaciones sin cupo sin borrar snapshots previos. **Salida:** matriz 0/3/6/9, aislamiento por cuenta, cambios de titular y carreras validados con tests focales. **Dependencia:** F0, no F1.

### F2B — Modelo MiniWeb V2 y snapshots
**Entregables:** versionado de configuración; módulos con instanceId estable para galerías repetidas; migración reversible de V1; tabla de versiones publicadas inmutables; restauración histórica a borrador; CAS por revisión y versión publicada. **Salida:** V1 sigue leyendo, V2 permite módulos repetidos y publicaciones anteriores no se sobrescriben. Pruebas de migración, concurrencia y restore.

### F3 — Identidad visual
**Entregables:** portada, logo e identidad como elementos independientes; recorte y encuadre responsivo; fallback accesible. **Salida:** cambiar portada no mueve ni altera logo; visual móvil/escritorio validado.

### F4 — Medios, videos y galerías
**Evidencia CODE:** DELETE marca is_active=0 con CAS, no borra R2; ruta pública entrega solo medios referenciados en snapshot actual, aun si están inactivos; cuota suma también inactivos; caché compartida hasta 86400 s.
**Entregables:** galerías múltiples por instanceId; subida y validación de archivos; URLs de video externas con proveedores permitidos; orden independiente; referencias históricas; política de retención y GC seguro. **Salida:** borrar del borrador no rompe publicación; restore histórico detecta faltantes; ningún asset de otro tenant es accesible; cuota no se libera ficticiamente.

### F5 — Horarios
**Entregables:** editor semanal claro, días cerrados, validación de intervalos y presentación compacta en perfil público. **Salida:** misma interpretación entre formulario, snapshot y página publicada; casos límite cubiertos.

### F6 — Plantillas y niveles
**Entregables:** Cuadra esencial, Barrio avanzado, Ciudad completo, vista previa responsiva y enforcement en servidor. **Salida:** no se habilitan plantillas premium por modificar payload; downgrade mantiene snapshot publicado (DEC-07). **DEC-10 aprobada:** el nivel visual máximo Cuadra/Barrio/Ciudad se comparte entre todas las organizaciones autorizadas del mismo billing_account, aunque no tengan CRM propio. El CRM permanece exclusivamente en su organización licenciada. Validar nivel visual compartido en servidor, sin sumar cupos por Barrio/Ciudad.

### F7 — Editor simple/avanzado
**Entregables:** ordenación de secciones, edición inline, ajustes progresivos, deshacer cambios de borrador y vista previa fiel. **Salida:** un usuario sin conocimientos técnicos completa un MiniWeb desde móvil; guardado y validaciones no alteran publicación.

### F8 — Publicación, historial y restauración
**Entregables:** revisión final, validación de licencia/cupo/plantilla, publicación atómica, historial de versiones, restore a borrador y republicación explícita. **Salida:** ningún cambio de borrador altera página pública; concurrencia de cupos y versiones rechaza operaciones conflictivas; rollback operativo documentado.

### F9 — QA y preparación de entrega
**Entregables:** pruebas focales acumuladas por contratos afectados, accesibilidad teclado/móvil, seguridad multi-tenant, migración y reversión, observabilidad y checklist de despliegue. **Salida:** evidencias ligadas a SHA y aprobación explícita antes de merge/deploy.

### Reglas para evitar huecos
- **Propietario de dato:** billing_account gobierna cupos; organization gobierna contenido; organization_license gobierna CRM; publicación conserva snapshot y referencias.
- **Cambios de licencia:** expiración, suspensión, transferencia y exceso de cupos requieren una política expresa; mientras tanto, proteger lo ya publicado y bloquear nuevas publicaciones cuando no exista capacidad, sin borrados automáticos.
- **Compatibilidad:** todo cambio de esquema debe tener estrategia de lectura V1, backfill, verificación y reversión.
- **Carreras:** proteger en servidor publicación, asignación de cupos, cambios de licencia y restore; no confiar en UI.
- **Concurrencia de agentes:** comprobar HEAD/PR antes de tocar archivos, commits pequeños y no modificar código fuera de fase.
- **Criterio de avance:** si falta una decisión no esencial, documentar supuesto conservador reversible y continuar las fases independientes; si afecta facturación, permisos o borrado irreversible, no implementarla como regla definitiva sin aprobación.

## 22. F2A/F2B — especificación de implementación y pruebas focales (diseño, 2026-10-29)

### F2A. Separación de licencias CRM y ampliaciones Cuadra

**CODE:** `db/schema/licensing.ts` contiene `billing_account` (titular único), `organization_license` (organización, plan, estado y fechas) y unicidad parcial de licencia no cancelada por organización. `db/queries/licensing.server.ts` dispone de lectura por cuenta y por organización. La API de licencias es de administración de plataforma.

**Diseño para PR F2A-1 (migración aditiva):** crear `billing_miniweb_capacity_extension` con `id`, `billing_account_id`, `kind='cuadra_extra'`, `status`, `starts_at`, `ends_at`, `created_at`, `updated_at`, referencia externa de compra opcional y metadatos de auditoría. El registro de ampliación no se asigna a una organización y no concede CRM. Mantener intacto `organization_license`. No crear licencia ficticia de organización.

**Diseño para PR F2A-2 (resolver):** servicio puro y consulta DB que calculan `hasBase = existe licencia Cuadra/Barrio/Ciudad efectiva para billing_account`, `base = hasBase ? 3 : 0`, `extra = 3 × ampliaciones Cuadra efectivas`. Una Cuadra base dentro de `organization_license` nunca cuenta también como extensión. La extensión solo es utilizable si existe base efectiva, salvo decisión comercial posterior. Rechazar estados `pending`, `suspended`, `cancelled` y fechas fuera de vigencia. El CRM se sigue resolviendo por licencia activa de la organización objetivo.

**Diseño para PR F2A-3 (ocupación y publicación):** introducir asociación verificable de organización publicada con cuenta de facturación, más una reserva/ocupación única por organización. La primera publicación ocupa un cupo; republicar la misma organización no consume otro. Una nueva publicación de otra organización debe verificar disponibilidad y reservar en la misma operación serializable/atómica que el cambio de publicación. Resolver cambios de titular con operación administrativa auditada. Prohibir inferir titular de membresía.

**Política provisional operativa no comercial:** si hay menos capacidad que publicaciones existentes, no eliminar ni despublicar snapshots automáticamente; bloquear **nuevas ocupaciones** y registrar exceso para resolución administrativa. El comportamiento de republicación de organizaciones excedidas queda sujeto a decisión expresa; no convertir la propuesta en derecho contractual.

**Pruebas F2A exclusivamente focales:** ninguna licencia=0; solo Barrio=3; Barrio+Ciudad=3; solo Ciudad=3; solo Cuadra=3; Barrio+Ciudad+1 extensión Cuadra=6; +2 extensiones=9; ampliación suspendida no cuenta; CRM de Barrio no se filtra a otra organización; miembros de cuentas ajenas no suman cupos; dos publicaciones simultáneas con un cupo libre no pueden ambas ocuparlo; republicar no consume cupo.

### F2B. Contrato MiniWeb y versiones inmutables

**CODE:** `app/features/miniweb/registry.ts` usa módulos por `type`, catálogo Esencial disponible y familias adicionales `planned`. `db/queries/business-publication.server.ts` declara `BUSINESS_PUBLICATION_SCHEMA_VERSION=4`, acepta snapshots legacy 1–4 y normaliza medios y branding. El snapshot actual debe mantenerse legible.

**Diseño para PR F2B-1 (configuración):** formato V2 con `instanceId` estable por módulo, `type`, `moduleVersion`, `enabled`, `sortOrder`, `layoutVariant`, `settings` validado; eliminar unicidad por `moduleType` solo después de migración compatible. Migración V1→V2 genera IDs deterministas para módulos existentes; galerías nuevas usan IDs únicos. No cambiar el significado de datos legacy.

**Diseño para PR F2B-2 (historial):** tabla append-only `business_publication_version` con `organization_id`, `version`, `schema_version`, `snapshot_json`, `published_at`, `actor_user_id`, hash/checksum opcional; índice único `(organization_id, version)`. Publicar agrega nueva versión y actualiza puntero actual con CAS en una operación atómica. Nunca sobrescribir filas históricas. Backfill del snapshot actual como versión inicial histórica sin duplicar si se repite.

**Diseño para PR F2B-3 (restauración):** restaurar copia del snapshot elegido a **nuevo borrador**, verificando propiedad de medios, integridad de IDs, vigencia de plantilla y esquema; no modificar publicación pública hasta una acción explícita de publicar. Proteger conflictos de revisión y versiones. Medios históricos desactivados pueden ser públicos si el snapshot actual los referencia; no hacer GC de R2 mientras los referencie cualquier versión retenida.

**Pruebas F2B focales:** parseo de snapshots v1–v4; migración idempotente; dos galerías del mismo tipo con `instanceId` distintos; publicación append-only; CAS conflictivo; restaurar sin publicar; medios históricos inactivos; aislamiento tenant.

### Orden de PR y puertas de salida

1. **F2A-1** migración aditiva + rollback documentado → revisión de esquema.
2. **F2A-2** resolver puro + tests de matriz → verificación de derechos.
3. **F2A-3** ocupación atómica + tests de carreras → habilitar control en publicación, no solo UI.
4. **F2B-1** contrato V2 + lector V1 → compatibilidad.
5. **F2B-2** historial append-only + backfill idempotente → integridad.
6. **F2B-3** restauración a borrador + medios retenidos → seguridad.

**Sin bloquear fases visuales:** F1 y F3 pueden implementarse en paralelo sin depender de compra de ampliaciones. F6/F8 no se dan por terminadas hasta conectar el resolver de derechos y la publicación atómica. Todo diseño pendiente de decisión comercial queda identificado como propuesta, no como requisito aprobado.


## 23. Cierre de diseño transversal Mi Vecidya ↔ MiniWeb ↔ Servicios y pagos (2026-10-29)

**Checkpoint:** el plan funcional F0–F9 existe, pero **no está cerrado como especificación lista para implementar íntegramente**; no hay migraciones, componentes ni pruebas nuevas de estas fases. El módulo de pagos B0–B8 se diseña en `SERVICIOS-PAGOS-PLAN-V1.md` y no sustituye las fases MiniWeb.

### Contrato de integración común (propuesta)
1. **Identidad:** `user` inicia sesión; `billing_account` define titular económico; `organization` define negocio y aislamiento de contenido; `organization_license` define CRM por organización; `billing_miniweb_capacity_extension` define capacidad Cuadra adicional; `organization_subscription` representa add-ons y servicios; ninguna tabla sustituye otra.
2. **Lectura de derechos:** resolver central `effectiveEntitlements(billingAccountId, organizationId, at)` devuelve cupos base, ampliaciones, ocupaciones, licencia CRM de la organización, nivel de plantilla autorizado, complementos activos y estados. Debe basarse en **activación efectiva**, no en pedido, pago aislado o simple asignación administrativa.
3. **Publicación:** verifica en servidor permisos, licencia/capacidad, plantilla y revisión de borrador en el momento de la operación; registra ocupación y versión histórica de forma atómica. No deducir derechos de la UI ni de un recibo de pago.
4. **Facturación:** suscripciones, facturas y pagos son hechos económicos distintos de derechos de uso y activación GHL. El dashboard muestra los tres estados por separado: contratado, activado y pagado.
5. **Conservación:** baja, impago o downgrade no destruyen automáticamente borradores, snapshots, medios ni facturas; acciones destructivas requieren política y auditoría. La publicación existente en downgrade conserva DEC-07.
6. **Administración:** gestión interna Vecidya asigna contratos y servicios, verifica activación externa y registra cambios; Mi Vecidya muestra únicamente datos autorizados. El CRM externo sigue gestionando conversaciones y operaciones CRM.

### Puertas de cierre de diseño F0
| Tema | Situación | Salida exigida |
| --- | --- | --- |
| Capacidad 3/6/9 | DEC-08 aprobada | Migración de organizaciones publicadas y asignación de titular sin duplicar Cuadras |
| Plantillas Cuadra/Barrio/Ciudad | DEC-06 aprobada en niveles | IDs y variantes reales, licencia efectiva de organización secundaria |
| Downgrade | DEC-07 aprobada | Validación transaccional contra cambios concurrentes de licencia |
| Suspensión/expiración | Pendiente decisión comercial | Política expresa de visualización, edición, publicación, recuperación y sobrecupo |
| Multimedia histórica | CODE auditado | Retención, referencias a snapshots, GC y cuotas verificables |
| Videos externos | Función aprobada | Lista de proveedores, seguridad de URL, embebido y privacidad |
| Horarios | UX propuesta | Zona horaria, intervalos, excepciones, migración de reglas existentes |
| Editor premium | Alcance funcional aprobado | Esquemas de settings, tokens, módulos, versiones y catálogo concreto |
| B0–B8 pagos | Plan separado iniciado | Reutilizar billing_account y org, nunca acoplar publicación a UI de cobro |
| QA | No ejecutado | Tests focales por contrato y evidencia vinculada a SHA |

**Orden de trabajo priorizado:** cerrar decisiones de F0 que afecten derechos y retención; especificar modelo MiniWeb V2 y migraciones F2B; cerrar matriz de plantillas y estados; terminar F1/F3/F4/F5/F6/F7/F8 como historias verificables; después avanzar B1–B8 sin duplicar la capa de derechos. F1 y F3 pueden avanzar en paralelo cuando no toquen contratos aún abiertos.

**No asumir aprobación por silencio:** para suspensiones, expiración, transferencia de titular, borrado histórico o acceso premium de organizaciones secundarias, preparar alternativas y solicitar decisión antes de implementar una política irreversible. Ninguna de estas pendientes impide seguir diseñando UI y contratos seguros.


## 24. DEC-09 — Vencimiento, suspensión y desactivación manual de MiniWeb (APROBADO, 2026-10-29)

**Decisión explícita del titular:** cuando la licencia venza o quede suspendida, el MiniWeb ya publicado **permanece visible al público**; el usuario no puede editar ni volver a publicar hasta regularizar su situación. Si no habrá renovación, un **administrador de plataforma Vecidya** puede desactivar posteriormente la publicación mediante una acción administrativa expresa.

### Máquina de estados de publicación (contrato de diseño)
- `draft`: sin publicación pública, contenido editable solo si licencia y permisos efectivos lo permiten.
- `published`: publicación vigente, accesible públicamente, edición/publicación según permisos y licencia.
- `published_frozen`: snapshot público **continúa visible** por vencimiento/suspensión; prohibidos cambios de MiniWeb y republicaciones; conservar borrador, historial y medios. Los cambios de datos de negocio ajenos a MiniWeb mantienen sus reglas de autorización independientes.
- `unpublished_by_admin`: publicación oculta al público por decisión explícita de platform_admin ante no renovación; **no borrar** snapshot, versiones ni archivos. La ruta pública no debe mostrar una página activa; respuesta HTTP y SEO deben definirse y probarse.
- `reactivated`: tras regularización de licencia, se recupera la capacidad de edición y publicación según derechos actuales; no restaurar automáticamente un MiniWeb previamente desactivado por admin sin revisión/autorización administrativa.

### Acción administrativa de desactivación
**Requisitos:** permiso específico `miniweb:publication:deactivate` de platform_admin, organización objetivo, motivo `non_renewal`, confirmación explícita, actor y timestamp, referencia de licencia y versión publicada, registro de auditoría. Operación idempotente, protegida con revisión/CAS y aislamiento por organización. Una desactivación no puede modificar publicaciones de otras organizaciones ni eliminar facturas. La reactivación administrativa requiere permiso separado y validación de licencia/cupo/plantilla; no equivale a restaurar un snapshot histórico en borrador.

### Integración con Servicios y pagos
- Vencimiento/suspensión del contrato y estado de pago son **hechos distintos**: una factura pendiente no desactiva automáticamente el MiniWeb si no existe transición de licencia autorizada.
- El dashboard muestra licencia vencida/suspendida, MiniWeb público congelado y, si procede, desactivación administrativa; conserva cargos, recibos e historial.
- No hacer de la UI de pagos fuente de derechos. El backend consulta el estado efectivo de licencia y la decisión administrativa de publicación.

### Casos de prueba focales obligatorios
1. Vencimiento o suspensión conserva la misma versión pública y bloquea guardar/publicar MiniWeb.
2. Regularización recupera edición/publicación solo si la publicación no fue desactivada por admin.
3. Admin desactiva por no renovación; la URL deja de servir contenido activo sin borrar versiones ni medios.
4. Usuario normal, miembro de organización y soporte sin permiso no pueden desactivar/reactivar.
5. Desactivación repetida es idempotente; carrera entre publicar y desactivar no deja estado inconsistente.
6. Restauración administrativa exige derechos efectivos y no publica un borrador sin acción expresa.
7. La baja de una organización no afecta MiniWeb ni facturas de otras del mismo titular.

**No aprobados ni inventados:** días automáticos de gracia, avisos por plazo fijo, fecha automática de desactivación, borrado definitivo, penalizaciones ni reactivación automática tras desactivación manual. El administrador decide cuándo proceder una vez confirmada la no renovación.

**Estado:** DEC-09 aprobada y documentada. Backend, permisos, UI administrativa, migraciones y pruebas todavía no implementados.


## 25. F0 — Contrato de plantillas en múltiples organizaciones (análisis de decisión, 2026-10-29)

**Estado: análisis histórico de alternativas; opción B aprobada posteriormente en DEC-10.** DEC-06 asigna niveles esenciales/avanzados/premium a Cuadra/Barrio/Ciudad; DEC-08 separa **capacidad de publicación de la cuenta** (3 base +3 por Cuadra extra) del **CRM de cada organización**. Una licencia Barrio/Ciudad de la organización A no debe activar el CRM de B. Falta decidir si el **nivel visual de MiniWeb** es una ventaja compartida del titular o un derecho ligado a cada organización.

### Alternativas sin inventar derechos
- **A — nivel por organización (conservadora):** el MiniWeb de una organización sin Barrio/Ciudad propios usa plantillas esenciales, aunque el titular tenga Barrio/Ciudad para otra organización. La capacidad 3/6/9 sí es común. Pros: evita transferencias implícitas de prestaciones premium; contras: una misma cuenta verá catálogos distintos.
- **B — nivel visual compartido por titular:** todas las organizaciones publicadas con cupo del mismo billing_account acceden al máximo nivel visual de alguna licencia activa del titular. **No** se comparte CRM, automatizaciones, canales ni servicios. Pros: experiencia de diseño coherente; contras: beneficio comercial adicional no aprobado, posible efecto de downgrade sobre varias páginas.
- **C — nivel visual asignado expresamente:** el titular dispone de nivel visual de su licencia, pero una organización secundaria obtiene ese nivel solo si se le asigna un entitlement MiniWeb explícito y auditable, sin CRM. Pros: control granular; contras: nuevo contrato/flujo administrativo y regla comercial por definir.

**Recomendación técnica hasta decisión:** implementar resolver con **dos dimensiones independientes** `publicationCapacity(billingAccountId)` y `templateTier(organizationId, billingAccountId)`, sin codificar que una licencia CRM se propaga entre organizaciones. Para pruebas y diseños no definitivos usar A como comportamiento provisional de menor privilegio; **no** dar por aprobada A ni bloquear F1/F3.

### Reglas comunes a A/B/C
1. Cupos base 3 una sola vez por titular con licencia activa; Cuadra extra +3; no sumar Barrio+Ciudad (DEC-08).
2. CRM, workflows y add-ons vinculados a la organización destino; no se transfieren por compartir titular.
3. El snapshot público premium ya publicado se preserva al reducir licencia (DEC-07) o congelarse por vencimiento (DEC-09).
4. La desactivación por no renovación exige acto explícito de platform_admin (DEC-09).
5. Cualquier nivel visual premium se valida en backend al guardar/publicar y en transacción consistente con licencia/cupo; la vista previa no concede derecho.
6. El titular económico puede pagar varias organizaciones; sus facturas no conceden por sí mismas derechos de edición.
7. Si el titular pierde la licencia que sustentaba el nivel compartido (opción B), las páginas existentes permanecen visibles; nuevas publicaciones requieren reevaluar derechos.

### Pruebas focales a preparar
- Titular con Barrio A + Cuadra B: capacidad 3, CRM Barrio solo A; nivel visual B según alternativa aprobada.
- Titular con Barrio A + Ciudad C: capacidad 3, no 6; CRM por organización.
- Titular con Ciudad A + Cuadra extra: capacidad 6; sin CRM adicional.
- Downgrade/suspensión de A no modifica snapshot público de B; nueva publicación valida nivel efectivo.
- Transferencia de titular y concurrencia entre licencia/cupo/publicación no permiten elevar derechos.
- La desactivación administrativa de una organización no altera otras publicaciones.

**Decisión resuelta en DEC-10 (§26): opción B aprobada; nivel visual compartido por titular, CRM por organización, cupos DEC-08 sin acumulación Barrio/Ciudad.**


## 26. DEC-10 — Plantillas MiniWeb premium compartidas por titular (OPCIÓN B APROBADA, 2026-10-29)

**Decisión explícita:** el titular de facturación puede usar en todas sus organizaciones MiniWeb el **máximo nivel visual de plantillas** que le otorgue cualquiera de sus licencias activas Cuadra/Barrio/Ciudad. Se comparte **solo el nivel de diseño MiniWeb**, no CRM, automatizaciones, contactos, canales, add-ons ni otros servicios. DEC-08 sigue vigente: **un único bloque base de 3 publicaciones**, más +3 por cada licencia Cuadra adicional de capacidad, sin sumar cupos por Barrio+Ciudad.

### Contrato de derechos efectivo
- `billingAccountId` es la frontera para `effectiveMiniWebTemplateTier`: `max(active organization_license.plan_code)` orden `cuadra < barrio < ciudad`, considerando solo licencias efectivas vigentes del mismo titular. No elevar por `pending`, `suspended`, `cancelled` o expiradas.
- `effectivePublicationCapacity` se resuelve **por separado**: 3 si existe al menos una licencia base activa, más 3 por ampliación Cuadra extra activa. Barrio y Ciudad no suman nuevos bloques.
- `effectiveCrmEntitlement(organizationId)` sigue leyendo únicamente la licencia activa de **esa organización**. Nunca inferir CRM por nivel visual compartido ni por ser miembro de una organización del titular.
- El nivel visual compartido se aplica a organizaciones autorizadas de esa cuenta, con cupo/ocupación de publicación verificado y permisos de edición de su organización; **no** permite a un titular editar negocios ajenos solo por ser pagador.
- Para una organización sin licencia propia pero con MiniWeb amparado por el titular, el derecho de diseño deriva del nivel visual compartido; **no** se crea licencia CRM ficticia.
- Si la licencia que aportaba Ciudad/Barrio se suspende, vence o se reduce, se recalcula el máximo nivel. Los snapshots publicados premium siguen visibles sin alterarse (DEC-07/DEC-09); guardar/publicar un diseño que ya excede el nivel efectivo requiere seleccionar plantilla autorizada. Si no queda ninguna licencia activa, toda nueva edición/publicación MiniWeb queda bloqueada.
- Una desactivación administrativa por no renovación (DEC-09) prevalece sobre el nivel visual compartido: no hay reactivación automática al contratar otra licencia.

### Concurrencia, auditoría y migración
- Resolver en servidor al seleccionar plantilla, guardar y publicar; publicar exige validación consistente de `billingAccountId`, licencia efectiva, capacidad, organización y `draftRevision` en el commit. No confiar en datos de sesión o frontend cacheados.
- Registrar en la versión publicada `templateId`, `templateVersion`, `effectiveTierAtPublish` y fuente `billingAccountId` para auditoría, **sin** usar el tier histórico como permiso para nuevas publicaciones.
- Cambios de titular deben reevaluar cupos y tier, no transferir automáticamente licencias ni contenidos; conservar snapshot y señalar sobrecupo si procede. No borrar ni degradar publicaciones existentes automáticamente.
- Las cuentas y organizaciones ya publicadas requieren backfill idempotente del titular/ocupación, sin doble consumo de cupo.

### Matriz focal de aceptación
| Cuenta y licencias activas | Cupos | Plantillas para todas sus organizaciones autorizadas | CRM |
| --- | ---: | --- | --- |
| Solo Cuadra A | 3 | Esenciales | Sin CRM |
| Barrio A + Cuadra B | 3 | Esenciales + avanzadas en A y B | Barrio solo A |
| Ciudad A + Barrio B | 3 | Esenciales + avanzadas + premium en A y B | Ciudad solo A; Barrio solo B |
| Ciudad A + Cuadra extra | 6 | Premium en organizaciones autorizadas del titular | Ciudad solo A |
| Barrio A + Ciudad B + 2 Cuadras extra | 9 | Premium en todas las autorizadas | CRM solo A y B según su licencia |
| Ciudad A suspendida + Barrio B activa | 3 | Avanzadas para nuevos cambios; premium ya publicado se conserva | Barrio solo B |
| Todas las licencias vencidas | 0 disponibles para nueva publicación | Sin nuevas ediciones/publicaciones; snapshots congelados visibles | Sin CRM efectivo |

**No implica:** comprar CRM para organizaciones secundarias, cupos adicionales por subir a Barrio/Ciudad, cambios en precios de licencias, publicación automática, permiso de administrador sobre otras organizaciones ni borrado de diseños al bajar de nivel.

**Estado:** decisión de producto aprobada y documentada; resolver, migraciones, editor y pruebas aún no implementados. Esta decisión **resuelve la alternativa B del §25**.


## 27. F2B — Contrato de migración V1→V2 y publicación histórica (especificación técnica, 2026-10-29)

**Base inspeccionada en rama documental:** `app/features/miniweb/registry.ts` valida la configuración mediante claves exactas `version/templateKey/templateVersion/layoutVariant/modules`; cada módulo acepta `type/moduleVersion/enabled/sortOrder/layoutVariant/settings`, y el esquema actual impide repetir tipos por límite y reglas de validación. `db/queries/business-publication.server.ts` acepta snapshots schema 1–4, normaliza media y branding y conserva `draftRevision` y `publishedVersion`. Este contrato **no** implementa todavía V2.

### Configuración V2 propuesta
```ts
type MiniWebConfigV2 = {
  version: 2;
  templateKey: string;
  templateVersion: number;
  layoutVariant: string;
  modules: Array<{
    instanceId: string; // identidad estable, distinta de type y sortOrder
    type: string;
    moduleVersion: number;
    enabled: boolean;
    sortOrder: number;
    layoutVariant: string;
    settings: unknown; // validador discriminado por type + moduleVersion
  }>;
};
```
**Reglas:** `instanceId` único por documento, inmutable al reordenar; `sortOrder` entero continuo 0..n-1; `type` puede repetirse solo para módulos declarados `repeatable` (galerías de imagen y video); portada/hero conserva unicidad y posición inicial; `settings` sin claves desconocidas ni HTML ejecutable; límites de número de módulos y tamaño del payload por definir con mediciones. No extender V1 cambiando su interpretación.

### Migración de borradores y publicados
1. Crear **lector dual**: V1 y V2; convertir V1 a V2 en memoria para editor sin escribir automáticamente ni modificar publicación.
2. Generar IDs V1 deterministas y estables desde `organizationId` + índice/posición original + tipo, con algoritmo versionado; IDs nuevos V2 aleatorios/únicos. Validar duplicados y colisiones; el ID no concede autorización.
3. Backfill **append-only** del snapshot actualmente publicado en `business_publication_version`, preservando el JSON y schemaVersion originales para auditoría. No reconstruir el histórico inexistente ni declarar que versiones sobrescritas antes del backfill son recuperables.
4. Guardar V2 solo por mutación explícita autorizada, con `draftRevision` CAS y validación server-side de tenant y plantilla; publicar V2 en transacción que compruebe licencia, capacidad, derechos visuales DEC-10 y estado admin DEC-09.
5. Mantener puntero público al snapshot vigente. Nueva publicación crea fila histórica inmutable y mueve puntero atómicamente; error de transacción deja intacta la publicación anterior.
6. Restauración selecciona una versión propia, copia datos a borrador V2 y señala medios faltantes/incompatibilidades; nunca publica automáticamente. Para publicación posterior se revalidan derechos actuales, no los históricos.
7. No eliminar medios de R2 mientras estén referenciados por snapshot público o versiones retenidas; separar desactivación lógica, cuota y GC físico. Definir política de retención antes de activar GC.
8. Rollback: permitir lector legacy y mantener snapshot original; si se despliega escritor V2, el rollback del código no puede asumir que versiones V2 son legibles por el binario V1: usar flag de escritura, compatibilidad de lector y plan de despliegue escalonado.

### Invariantes y casos focales
- V1 original leído sin pérdida; convertir dos veces produce mismos `instanceId`.
- Dos galerías del mismo tipo mantienen IDs y orden al guardar, mover, duplicar y publicar.
- Hero no puede duplicarse ni moverse fuera de la primera posición.
- Publicar y backfill concurrentes no crean dos versiones con mismo número.
- Restauración de versión premium en cuenta rebajada no permite bypass de DEC-07/10.
- Publicación congelada por DEC-09 no admite nuevas mutaciones MiniWeb; admin desactivada no reaparece por migración o restauración.
- Dos cuentas distintas con `organizationId` distinto nunca comparten datos ni activos.
- Snapshot publicado antes de migración conserva el mismo contenido público hasta publicación explícita.
- Un medio referenciado en cualquier versión retenida no puede eliminarse físicamente.
- Errores de backfill, migración o CAS no destruyen datos ni generan cobros.

**Pendientes de diseño con coste/impacto:** límites de videos y medios, retención temporal/cantidad de versiones, catálogo real de plantillas, estrategia HTTP/SEO de MiniWeb desactivado. No inventar cifras ni fechas. **Estado:** especificación documentada; ninguna migración, prueba o despliegue ejecutado.


## 28. F6 — Catálogo visual verificable y matriz de plantillas (2026-10-29)

**Inventario CODE real:** `app/features/miniweb/registry.ts` declara cinco `templateKey`: `vecidya-default` (Esencial, `available`), `services-studio` (Servicios, `planned`), `catalog-store` (Catálogo, `planned`), `gastronomy-table` (Gastronomía, `planned`) y `professional-profile` (Profesional, `planned`). Solo **una** está disponible hoy. Los `layoutVariants` son `standard`; **no** hay variantes premium ya construidas. La validación actual usa `version:1`, `settings:null`, unicidad de tipo y máximo 4096 bytes serializados; V2 requiere contrato nuevo, no relajar silenciosamente el validador V1.

### Matriz de catálogo objetivo (PROPUESTA, no activos ya disponibles)
| Key existente | Familia | Estado actual CODE | Tier mínimo objetivo | Primera composición de referencia |
| --- | --- | --- | --- | --- |
| `vecidya-default` | Profesional general | Disponible | Cuadra | Portada, presentación, contacto, ubicación, horarios |
| `services-studio` | Servicios | Planeada | Cuadra | Portada, servicios, beneficios, contacto |
| `catalog-store` | Catálogo | Planeada | Barrio | Portada, productos, galerías, contacto |
| `gastronomy-table` | Gastronomía | Planeada | Barrio | Portada, carta/productos, horarios, ubicación |
| `professional-profile` | Profesional | Planeada | Ciudad | Portada, credenciales, testimonios, contacto |

**Importante:** esta asignación por tier es una **propuesta de producto**, no decisión comercial ya aprobada. DEC-06 solo aprueba jerarquía Cuadra→Barrio→Ciudad; DEC-10 comparte el máximo tier entre organizaciones del titular. La familia de negocio no equivale al tier: más adelante cada familia puede tener variantes esenciales, avanzadas y premium. No anunciar las cuatro plantillas planeadas como disponibles.

### Diseño de registry V2
- Separar `templateFamily`, `templateKey`, `minimumLicenseTier`, `availability`, `version`, `layoutVariants`, `capabilities` y `previewAsset` opcional.
- `availability`: `planned`, `available`, `retired`; una versión `retired` se puede renderizar en snapshot histórico, pero no elegir para nueva publicación.
- Validar tier compartido DEC-10 en servidor para selección, guardado y publicación. El frontend muestra niveles bloqueados y motivo, sin conceder derechos.
- Mantener `vecidya-default` v1 y su render legacy; introducir diseños nuevos por versiones/keys nuevos, sin mutar la apariencia de snapshots publicados.
- Variantes de composición: hero con logo independiente y encuadre; columnas responsivas; tipografía y tokens de color; tarjetas; secciones repetibles. La configuración editable debe ser validada por esquema, no aceptar CSS/JS arbitrarios.
- Cada plantilla debe especificar fallback de imagen, navegación teclado, contraste, responsive, estructura semántica y media accesible.

### Inventario de módulos CODE y ampliación objetivo
**Disponibles:** `hero`, `about`, `contact`, `hours`, `services`, `gallery`, `location`, `products`, `faq`.
**Planeados:** `articles`, `team`, `certifications`, `testimonials`.
**V2 por especificar:** galerías de video repetibles, bloques de contenido flexible, secciones de columnas; no inventar que ya existen. `gallery` actualmente combina imágenes y videos del negocio, sin instancias repetibles.

### Gate de aceptación F6
1. Plantilla Esencial legacy renderiza idéntica en lectura y tras despliegue de registry V2.
2. Tier compartido del titular determina plantillas en organizaciones autorizadas sin compartir CRM.
3. Plantilla `planned` o `retired` no se puede seleccionar ni publicar, aunque se manipule payload.
4. Downgrade conserva snapshot público premium y bloquea nueva publicación premium (DEC-07).
5. Suspensión/vencimiento congela editor/publicación, mantiene web pública (DEC-09).
6. Diseño nuevo conserva portada/logo independientes y navegación accesible en móvil.
7. Tests focales de validador, autorización, renderer y snapshot; no suites generales.

**Estado:** inventario y contrato objetivo documentados; cuatro plantillas siguen `planned`; ninguna implementación ni prueba nueva realizada.


## 29. F7/F1 — Contrato funcional del editor y navegación Mi Vecidya (diseño, 2026-10-29)

**Objetivo:** convertir F1 y F7 en historias implementables sin alterar contratos de licencias, facturación ni publicación. Una única página MiniWeb V2 por organización (DEC-01), con módulos y composición independientes, editor simple por defecto y controles avanzados progresivos.

### F1 — Estructura de navegación y estados
- **Inicio Mi Vecidya:** organización activa, estado del perfil, MiniWeb publicado/borrador/congelado/desactivado, licencia y cupos compartidos del titular, acciones principales y tareas pendientes; no inventar métricas de tráfico.
- **Selector de organización:** cambia el contexto de trabajo sin cambiar automáticamente titular de facturación. La API revalida membresía y permiso para cada recurso; nunca usar solo el ID de URL o estado local como autorización.
- **Navegación objetivo:** `Inicio`, `Mi negocio`, `MiniWeb`, `Servicios y pagos`, `Aprende`, `Soporte`. La disponibilidad de cada entrada depende de permiso real; no duplicar funciones operativas del CRM.
- **Estados visibles:** sin organización, perfil incompleto, sin licencia base, cupos agotados, MiniWeb sin publicar, borrador con cambios, publicado, congelado por vencimiento/suspensión (DEC-09), desactivado por admin y error de carga. Cada estado presenta acción segura y motivo.

### F7 — Superficies del editor
| Zona | Contenido | Comportamiento |
| --- | --- | --- |
| Barra superior | Organización, estado, revisión, Guardar, Vista previa, Publicar | Publicar requiere validación final server-side; no prometer publicación hasta confirmación |
| Panel Secciones | Lista de módulos, añadir, duplicar si repeatable, mover, ocultar, eliminar del borrador | `instanceId` estable; hero no se elimina ni se mueve de primer lugar |
| Lienzo | Render fiel de borrador con selección y guías visuales | Vista escritorio/tableta/móvil; selección no altera datos |
| Inspector Contenido | Texto, imágenes, enlaces, datos de contacto, galerías, video, horarios | Controles tipados, sanitización y propiedad de medios |
| Inspector Diseño | Layout, paleta, tipografía, espacios, fondo, alineación, composición | Solo tokens/variantes permitidos por esquema y tier; no CSS/JS libre |
| Inspector Avanzado | Visibilidad, accesibilidad, SEO permitido, ajustes por dispositivo cuando proceda | No ofrecer controles que el renderer no soporte |
| Panel Historial | Versiones publicadas, fecha, autor, previsualizar, restaurar a borrador | Restaurar no publica ni borra versión actual |

**Modo simple:** preguntas y controles orientados al negocio, con vista previa en vivo, ajustes esenciales y CTA claros. **Modo avanzado:** inspector de composición, módulos, variantes y propiedades tipadas; alternar modo no debe perder datos ni cambiar permisos.

### Acciones y restricciones
1. **Guardar:** persiste borrador únicamente, mediante revisión/CAS; conflicto muestra comparación o recarga segura, nunca sobrescritura silenciosa.
2. **Vista previa:** render aislado de borrador; no expone URLs privadas ni concede permiso de publicación.
3. **Publicar:** pantalla de revisión con cambios, validación de licencia/cupo/tier DEC-08/10, estado DEC-09 y confirmación; snapshot público cambia solo tras commit exitoso.
4. **Deshacer/rehacer:** historial de edición de sesión con límites medidos; no reemplaza historial de versiones publicadas.
5. **Eliminar módulo:** elimina de borrador, no del snapshot público ni del R2 de inmediato. Para galería duplicada, eliminar una instancia no afecta otras.
6. **Cambio de plantilla:** previsualizar mapeo y elementos incompatibles; conservar copia recuperable; bloquear publicación premium no autorizada sin degradar snapshot vigente.
7. **Estado congelado:** permite consultar MiniWeb publicado e historial, pero no guardar, editar ni publicar; la desactivación por no renovación solo aparece en administración con permiso explícito.
8. **Accesibilidad:** acciones mover arriba/abajo además de drag-and-drop; navegación teclado; foco visible; etiquetas; anuncios de error/guardado; controles táctiles adecuados; soporte de zoom y reduced motion.

### F7 — Modelo de interacción responsiva
- **Escritorio:** panel de secciones, lienzo central, inspector lateral; barra de acciones fija sin cubrir contenido.
- **Tableta:** paneles colapsables y lienzo con ancho de vista previa seleccionable.
- **Móvil:** requisito histórico sustituido por DEC-17 (§36): el editor dentro de `/app` está bloqueado en móviles. La previsualización móvil se controla desde tableta/escritorio.
- **Guardado:** mostrar `Sin cambios`, `Cambios sin guardar`, `Guardando`, `Guardado`, `Conflicto`, `Error`; no llamar `Guardado` a un cambio solo local.
- **Salir con cambios:** confirmación accesible; recuperación de borrador solo cuando existe persistencia verificada, no prometer autosave no implementado.

### F1/F7 — Matriz de historias y pruebas focales
| Historia | Criterio de aceptación | Prueba focal |
| --- | --- | --- |
| Cambiar organización | Solo datos del negocio autorizado; permisos y cupos correctos | Aislamiento tenant y navegación |
| Crear MiniWeb | Borrador con hero obligatorio y plantilla permitida | Validación registry |
| Reordenar módulos | IDs estables, hero primero, orden continuo | Ordenación y persistencia |
| Duplicar galería | Dos instancias independientes con medios propios | V2 repeatable |
| Editar identidad | Portada y logo no se pisan; responsive | Componentes F3 |
| Editar horarios | Días/intervalos válidos, zona horaria coherente | Validación F5 |
| Guardar y publicar | Borrador no altera público; CAS y entitlements en commit | API F8 |
| Restaurar versión | Copia a borrador, publicación anterior intacta | Historial F2B |
| Licencia vencida | Publicación visible, controles de edición bloqueados | DEC-09 |
| Sin derecho premium | Vista previa explicativa, publicación rechazada | DEC-07/10 |
| Móvil sin drag | Reordenar y editar mediante botones y panel accesible | UX teclado/táctil |

**Dependencias de implementación:** F1 puede comenzar con rutas y estados tipados sin editar publicaciones; F7 requiere F2B para `instanceId`, F2A/DEC-10 para permisos, F3–F5 para controles reales y F8 para commit. No construir un editor visual que guarde un esquema que el servidor todavía no entiende.

**Estado:** especificación funcional documentada; no hay nuevas pantallas, tests ni despliegue de F1/F7 en este checkpoint.


## 30. DEC-11 — Dirección UX del editor aprobada y contratos F3–F5 (2026-10-29)

**APROBADO por el usuario:** dirección visual y funcional propuesta en §29: editor con barra superior, lista de secciones, lienzo central y panel de propiedades; modos **Simple** y **Avanzado**, previsualización escritorio/tableta/móvil, accesibilidad y diseño responsivo. La aprobación se refiere al **concepto de experiencia**, no a píxeles finales, assets, cambios comerciales ni funcionalidades ya implementadas. Mantener validaciones en servidor, misma fuente de datos entre modos y no confundir vista previa con publicación.

### F3 — Identidad visual y cabecera
- Modelo conceptual: `brand.logoAssetId`, `brand.iconAssetId`, `cover.assetId`, `cover.focalPoint{x,y}`, `cover.overlay`, `brand.colorTokens`; el contrato persistido se decidirá tras revisar tablas/medios actuales, sin duplicar fuente de verdad.
- Logo, icono y portada tienen controles y contenedores **independientes**. Cambiar portada nunca elimina ni desplaza el logo; icono/favicons no sustituyen logo.
- Portada: selección desde biblioteca autorizada, recorte/posición focal con preview móvil y escritorio, fallback sin imagen y texto accesible; sin exigir dimensiones no medidas.
- Identidad: nombre y descripción del perfil como datos estructurados, paleta con contraste comprobable, tipografía de catálogo permitido y CTA configurable solo con destinos seguros.
- El renderer publicado lee exclusivamente snapshot autorizado; edición de identidad en borrador no modifica la página pública hasta publicar. Las modificaciones de perfil fuera de MiniWeb conservan sus reglas existentes.

### F4 — Galerías, imágenes y videos
- Módulos repetibles V2 `gallery` con `instanceId` y modalidad `image`/`video`/mixta validada; cada instancia tiene título opcional, orden, disposición y selección propia de medios. Duplicar una sección **no** duplica archivos físicos ni transfiere propiedad.
- Subida de imagen/video: autorización por organización, tipo MIME real, tamaño/duración y límites a definir por coste/infraestructura, cuarentena/validación según proveedor y estado de procesamiento; nunca mostrar video fallido como publicado.
- Video externo: URL HTTPS y proveedor allowlist configurable, validación de ID canónico, iframe con permisos mínimos y privacidad; YouTube/Vimeo son **candidatos**, no proveedores aprobados automáticamente.
- Separar `assetId` de `instanceId`; referencias históricas y snapshot público se conservan. Eliminar del borrador no ejecuta borrado físico; retención/GC requiere política expresa y pruebas.
- Presentación: carrusel o cuadrícula accesible, texto alternativo en imágenes, subtítulos/transcripción cuando corresponda, control de reproducción, sin autoplay con sonido y carga diferida.

### F5 — Horarios avanzados
- Horario semanal estructurado por día con 0..N intervalos, estado cerrado, intervalos no solapados y zona horaria IANA del negocio.
- Intervalos nocturnos: definir semántica explícita `endsNextDay` o normalización a fecha siguiente; validar cruces con el día posterior y DST. No interpretar `22:00–02:00` como error ni como apertura 20 horas.
- Excepciones fechadas: cierres especiales, festivos, horario excepcional y precedencia sobre semana estándar; distinguir `cerrado` de `sin información`.
- UI simple: horario habitual por día, duplicar a otros días, cerrado y vista previa. UI avanzada: múltiples turnos, nocturnos, excepciones y zona horaria con explicación clara.
- Guardado y publicación: validar intervalos y zona en servidor; snapshot contiene interpretación estable; no inferir «abierto ahora» si faltan datos o zona horaria válida.

### Pruebas focalizadas y puertas de salida
| Área | Aceptación | Evidencia exigida al implementar |
| --- | --- | --- |
| F3 | Logo y portada independientes; fallback; preview móvil | Componentes + snapshot |
| F3 | Paleta/CTA seguros y contrastes accesibles | Validadores + accesibilidad |
| F4 | Dos galerías del mismo tipo independientes | Registry V2 + persistencia |
| F4 | URL externa maliciosa o asset ajeno rechazados | API + autorización |
| F4 | Media histórica no desaparece al editar borrador | Publicación + referencias |
| F5 | Turnos múltiples/nocturnos y excepciones coherentes | Validación + zona/DST |
| F5 | Sin datos no implica cerrado/abierto | Render público |
| F1/F7 | Editor Simple/Avanzado conserva mismo borrador | Estado + CAS |
| F1/F7 | Tableta permite mover secciones sin drag | Accesibilidad |

**Dependencias abiertas:** catálogo visual real y distribución de templates por tier (§28 es propuesta), límites económicos de video, proveedor externo permitido, cuotas/retención de media y versiones, y política de horarios frente a datos legacy. No inventar aprobación para estos puntos. **Estado:** dirección UX aprobada, especificación F3–F5 documentada, implementación/pruebas no iniciadas en este checkpoint.


## 31. F8 — Máquina de estados de publicación y restauración (2026-10-29)

**Contrato de producto:** la página pública se sirve exclusivamente desde el último snapshot publicado y autorizado para visibilidad; el borrador nunca se sirve públicamente. La visibilidad y la capacidad de editar/publicar son dimensiones **independientes** (DEC-07/09/10).

### Estados ortogonales
- **Contenido:** `never_published`, `published` (con versión y snapshot), `draft_dirty` (borrador distinto al publicado); `draft_dirty` puede coexistir con `published`.
- **Derecho de edición:** `editable`, `frozen_expired`, `frozen_suspended`, `frozen_no_base`, `restricted_tier`, `restricted_capacity`; resolver en servidor, no persistir un booleano de frontend como verdad.
- **Visibilidad pública:** `not_published`, `public`, `admin_deactivated`. `admin_deactivated` prevalece incluso si una nueva licencia entra en vigor; solo acción admin separada puede reactivar.
- **Historial:** lista append-only de versiones; `restore` produce nuevo borrador con nueva revisión, nunca modifica visibilidad ni la versión pública por sí mismo.

### Transiciones permitidas
| Acción | Precondiciones | Efecto atómico | No debe hacer |
| --- | --- | --- | --- |
| Guardar borrador | Permiso de edición, licencia efectiva, CAS revisión, módulo/medios propios | Incrementar `draftRevision` | Cambiar snapshot público |
| Primera publicación | Permiso, licencia activa, capacidad disponible, tier compartido, revisión vigente | Reservar cupo + añadir versión 1 + activar puntero público | Duplicar cupo por reintento |
| Republicación | Publicación existente autorizada, tier efectivo, CAS, no admin-deactivated | Añadir versión N+1 + mover puntero | Consumir segundo cupo |
| Restaurar versión | Permiso y acceso a versión de misma organización, licencia que permita editar | Crear borrador y marcar incompatibilidades | Publicar automáticamente |
| Vencimiento/suspensión | Cambio de licencia efectivo | Congelar edición/publicación; conservar público | Borrar contenido o despublicar |
| Downgrade de tier | Nuevo máximo del titular | Bloquear nuevas publicaciones premium incompatibles | Reescribir versión pública |
| Desactivar por no renovación | `platform_admin` con permiso explícito, motivo, confirmación, CAS | Visibilidad `admin_deactivated` + auditoría | Borrar snapshots/medios |
| Reactivar visibilidad | Acción admin separada, licencia regularizada, autorización y auditoría | Volver a `public` si snapshot íntegro | Republicar borrador o alterar versión |

**Idempotencia:** usar identificador de operación y unicidad por publicación/versionado; el mismo request no crea múltiples versiones ni consume dos cupos. **Concurrencia:** publicación, transferencia de titular, suspensión y desactivación compiten bajo transacción/bloqueo consistente; si no puede garantizarse en almacenamiento actual, no habilitar la operación hasta implementar serialización equivalente.

**Decisión operativa aún abierta:** qué hacer cuando el titular tiene más publicaciones ocupadas que cupos efectivos después de transferencias o reducciones. Política provisional segura: conservar visibilidad y bloquear nuevas ocupaciones; no asumir automáticamente derecho de republicación para todos los excedidos.

### Contrato de errores API
- `REVISION_CONFLICT`: borrador cambió; ofrecer recargar/comparar.
- `LICENSE_INACTIVE`: licencia base vencida/suspendida; sitio existente público.
- `TEMPLATE_TIER_DENIED`: plantilla supera nivel compartido vigente.
- `PUBLICATION_CAPACITY_EXCEEDED`: no hay cupo para primera publicación.
- `ADMIN_DEACTIVATED`: publicación desactivada por administración; no reactivar por edición.
- `ASSET_NOT_OWNED` / `ASSET_UNAVAILABLE`: medio ajeno o faltante.
- `PUBLISHED_VERSION_CONFLICT`: publicación cambió durante confirmación.
- `FORBIDDEN`: rol/organización no autorizados; sin revelar datos de otros tenants.

## 32. F9 — Plan de verificación focal y entrega segura (2026-10-29)

### Matriz de pruebas por cambio
| Área tocada | Pruebas obligatorias focales | Evidencia |
| --- | --- | --- |
| Licencias/capacidad | Resolver 0/3/6/9, CRM por organización, tier compartido, concurrencia | Tests de servicio y query |
| Registry V2 | V1→V2, módulos repetibles, IDs estables, hero obligatorio | Tests de validadores |
| Publicación | CAS, idempotencia, atomicidad, estados congelados/admin | Tests API/DB |
| Historial | Backfill idempotente, append-only, restore a borrador | Tests de repositorio |
| Medios | Referencias históricas, autorización, URL externa | Tests de media/seguridad |
| Editor | Guardado, selector organización, modos, responsive y teclado | Tests de componentes |
| Horarios | Intervalos, nocturnos, DST, excepciones | Tests de horario |
| Plantillas | Nivel compartido, downgrade, snapshots legacy | Tests de catálogo/renderer |

**CI focal:** seleccionar solo pruebas de archivos/contratos modificados y sus dependencias inmediatas; typecheck/build únicamente cuando corresponda al cambio y exista presupuesto de ejecución. No modificar workflows globales ni disparar suites generales por defecto. Si una verificación no se ejecuta, marcar `NO EJECUTADA` en vez de inferir éxito.

### Puertas de despliegue
1. **Antes de PR de implementación:** inventario de rutas/queries/schema reales, prueba de reversibilidad, impacto en otros agentes y límites del diff.
2. **Antes de merge:** pruebas focales vinculadas al SHA exacto, revisión de aislamiento tenant, plan de rollback y revisión de migraciones aditivas.
3. **Antes de staging:** migración de lectura dual y backfill idempotente, métricas de errores/latencia, feature flag para escritor V2 y smoke test focal.
4. **Antes de producción:** autorización explícita, verificación de snapshot legacy, control de cupos, permisos admin, restauración y monitoreo.
5. **Tras despliegue:** comprobaciones en URL DEV/staging/producción según fase; nunca declarar éxito basándose solo en comando de deploy. No ejecutar merge/deploy en este checkpoint.

### Riesgos y decisiones que bloquean acciones específicas
- **Comercial:** tier de cuatro plantillas `planned` aprobado en DEC-12 (§34); sigue pendiente su implementación y habilitación real.
- **Coste/almacenamiento:** cuota de videos, transcodificación, retención y GC aún sin valores aprobados; no habilitar subida sin límites operativos.
- **Historial:** número/tiempo de versiones y medios asociados aún no aprobado; evitar borrado físico y cobros automáticos.
- **Capacidad excedida:** DEC-13 (§34) aprueba conservar páginas y bloquear nuevas ocupaciones; republicación de excedidos no queda automáticamente autorizada.
- **SEO/visibilidad:** DEC-14 (§34) fija HTTP 404 neutro y exclusión del sitemap para `admin_deactivated`.

**Criterio de cierre del plan:** contratos y decisiones bloqueantes aprobados, matriz de rutas/tablas/servicios trazable al repo, PRs de implementación ordenados, criterios de aceptación verificables. No equivale a software terminado. **Estado:** F8/F9 especificados; implementación y pruebas aún pendientes.


## 33. F0 — Registro de decisiones finales y política provisional segura (2026-10-29)

**Objetivo:** separar lo aprobado de lo que requiere una decisión del titular antes de activar prestaciones comerciales o operaciones irreversibles. El plan funcional F0–F9 está redactado, pero el cierre de F0 **no** puede certificarse sin resolver estas cuestiones.

| ID | Asunto | Alternativa recomendada para aprobación | Hasta aprobación |
| --- | --- | --- | --- |
| DEC-12 | Distribución de plantillas existentes `planned` | Cuadra: Esencial + Servicios; Barrio: + Catálogo + Gastronomía; Ciudad: + Profesional. Crear después variantes premium por familia, sin afirmar que ya existen. | Solo Esencial `available` |
| DEC-13 | Exceso de publicaciones tras reducción/transferencia | Conservar todos los snapshots públicos; bloquear primeras publicaciones; permitir **solo** republicación de organizaciones que conserven ocupación válida y derecho efectivo, sin ampliar sobrecupo. Exceso requiere conciliación admin auditada. | No borrar ni despublicar; denegar operaciones ambiguas |
| DEC-14 | Sitio desactivado manualmente por admin | Responder HTTP 404 público con página de ausencia neutra, sin mostrar contenido ni causa privada; retirar del sitemap y noindex cuando haya respuesta HTML; reactivar solo admin. | No implementar desactivación pública sin respuesta definida |
| DEC-15 | Retención de versiones y media | Historial sin borrado físico automático durante V2 inicial; introducir cuotas y retención solo tras medir coste y aprobar política de recuperación. | Append-only; sin GC de activos referenciados |
| DEC-16 | Video subido y externo | Activar solo tras medir capacidad/coste, seguridad y política de proveedores; videos externos inicialmente restringidos a allowlist explícita aprobada. | No habilitar fuentes no verificadas ni cuotas inventadas |

**Estado histórico:** estas propuestas fueron aprobadas posteriormente por el usuario; ver §34 (DEC-12–16). La propuesta de no borrar físicamente es un guardarraíl técnico, no una promesa contractual de conservación indefinida. Ninguna política provisional autoriza cobros, nuevos límites comerciales, despublicación automática ni exposición de datos.

### Secuencia de implementación sin bloquear por decisiones pendientes
1. **PR-M1:** shell Mi Vecidya F1, selector de organización, estados solo lectura y permisos; sin cambiar publicación ni facturación.
2. **PR-M2:** schema aditivo F2A de ampliación Cuadra + resolver de cupos/tier compartido, tests focales, sin checkout.
3. **PR-M3:** lector dual y migrador puro MiniWeb V1→V2, `instanceId`, tests focales; no escribir V2 en producción.
4. **PR-M4:** historial append-only, backfill idempotente y publicación atómica con feature flag; pruebas CAS y aislamiento.
5. **PR-M5:** F3–F5 identidad, galerías/videos/horarios por entregas separadas, activar solo lo autorizado y medido.
6. **PR-M6:** F6 catálogo visual con derechos DEC-10, editor F7 simple/avanzado y responsive; integrar con API real.
7. **PR-M7:** F8 restauración y controles de admin, F9 accesibilidad/QA focal, pruebas de despliegue/rollback.

Cada PR requiere inventario de archivos, alcance acotado, tests focales y evidencias ligadas a SHA; sin merge/deploy automático. El orden puede subdividirse para evitar conflictos con otros agentes.

### Criterios de salida de diseño
- DEC-01–11 aprobadas y reflejadas en contratos; DEC-12–16 resueltas o bloqueadas explícitamente para que no se publiquen prestaciones no autorizadas.
- Migraciones de lectura dual, backfill y rollback con estrategia segura.
- Matriz de pruebas focales de F9 y responsables de datos definidos.
- No confundir **plan maestro funcional documentado** con **implementación terminada**.


## 34. DEC-12–16 — Aprobaciones finales de producto (APROBADAS, 2026-10-29)

**Aprobación explícita del titular:** se aprueban **únicamente** DEC-12, DEC-13, DEC-14, DEC-15 y DEC-16 según el registro del §33. Cualquier otra decisión abierta sigue pendiente; no interpretar silencio como aprobación.

### DEC-12 — Plantillas por licencia (APROBADA)
- **Cuadra:** Esencial (`vecidya-default`) y Servicios (`services-studio`).
- **Barrio:** incluye Cuadra, más Catálogo (`catalog-store`) y Gastronomía (`gastronomy-table`).
- **Ciudad:** incluye Barrio y Profesional (`professional-profile`).
- Esta matriz define **derechos objetivo**, no disponibilidad inmediata: en el código inspeccionado solo Esencial está `available`; las otras cuatro están `planned` hasta que se implementen, validen y habiliten. DEC-10 comparte el nivel visual máximo entre organizaciones del mismo titular, sin compartir CRM.
- No inventar variantes adicionales, precios ni cupos por la aprobación.

### DEC-13 — Sobrecupo y conciliación (APROBADA)
- Si una reducción/transferencia deja más publicaciones existentes que capacidad efectiva, **conservar los snapshots públicos** y no despublicar automáticamente.
- **Bloquear nuevas ocupaciones** mientras no exista capacidad libre. Resolver el exceso por conciliación administrativa explícita, auditada, con comprobación de titularidad y concurrencia; no borrar medios ni versiones.
- Esta decisión no concede por sí sola derecho ilimitado a republicar sitios excedidos: operaciones ambiguas deben denegarse hasta contar con reglas y autorización aplicables. La expiración total congela edición/publicación según DEC-09.

### DEC-14 — Página desactivada (APROBADA)
- Cuando `platform_admin` desactive expresamente por no renovación (DEC-09), responder **HTTP 404** con una página neutra de no disponibilidad, sin contenido del negocio ni explicación privada.
- Retirar URL del sitemap; la respuesta HTML puede incluir `noindex` como defensa adicional. No redirigir a otro negocio, no filtrar datos de cuenta, no confundir con caída de infraestructura.
- Reactivación requiere acción administrativa separada y auditada; la renovación no reactiva automáticamente.

### DEC-15 — Retención inicial (APROBADA)
- Durante la primera etapa de V2, **no borrar automáticamente versiones históricas ni archivos referenciados** por snapshots publicados o versiones retenidas.
- Medir volumen y costes antes de proponer límites de retención. Esta política no implica retención contractual indefinida, subida ilimitada, ni exención de restricciones legales de eliminación de datos.
- Registrar referencias de medios y bloquear GC destructivo hasta contar con un mecanismo de retención verificable y una política posterior aprobada.

### DEC-16 — Activación controlada de videos (APROBADA)
- Las **subidas de video** y las **fuentes externas** se habilitarán solo tras verificar capacidad, costes, límites de tamaño/duración, validación y seguridad, y proveedores explícitamente permitidos.
- No interpretar YouTube/Vimeo como aprobados por defecto; permanecen candidatos hasta decisión técnica documentada.
- Hasta pasar ese gate, el editor no prometerá una función de video disponible ni aceptará URL/proveedor arbitrario.

### Checklist de coherencia
- F2A: DEC-08/10/13 → cupos compartidos, tier visual compartido y exceso sin borrado.
- F2B/F8: DEC-09/14/15 → congelación, desactivación 404 y versiones retenidas.
- F4: DEC-16 → videos detrás de gate de coste/seguridad.
- F6: DEC-06/10/12 → catálogo progresivo aprobado, habilitación según estado real.
- F9: pruebas focales para los cinco contratos, sin suites generales ni cambios de CI ajenos.

**Estado de cierre:** DEC-01–16 aprobadas según sus respectivos alcances. La aprobación de estas decisiones **no** implica que el plan completo esté implementado ni que se hayan verificado límites de infraestructura o datos actuales. Próxima fase: inventario de rutas, servicios, esquemas y pruebas existentes para PR-M1, luego implementación focal sin merge/deploy no autorizado.


## 35. Puerta de entrada PR-M1 — navegación y estado de solo lectura (2026-10-29)

**Alcance permitido del primer PR de código:** implementar únicamente la estructura Mi Vecidya y el selector de organización, con estados MiniWeb **solo lectura**, sin modificar schema, pagos, licencias, publicaciones, media ni código de agentes ajenos. No declarar nombres de rutas existentes sin inspeccionarlos.

**Preflight obligatorio antes de editar:** leer `AGENTS.md` y gobernanza; inspeccionar rutas `app/routes`, loaders/autenticación, selector/contexto de organización, componentes y tests existentes; confirmar rama de trabajo, HEAD y archivos tocados por otros agentes. Crear rama de implementación independiente de esta rama documental y del PR #184, para no mezclar diseño con código.

**Entregables acotados:** shell de navegación, organización activa accesible, estado publicado/borrador/congelado/desactivado **derivado de API autorizada**, estados vacíos/error/carga, accesibilidad móvil y teclado. Si un estado no está respaldado por backend real, marcarlo como no disponible; no simular licencia ni cupos como efectivos.

**Criterios focales:** usuario sin organización; selector entre dos organizaciones autorizadas; rechazo de organización ajena; cambio de organización sin filtración de estado anterior; estado no disponible cuando API no informa; navegación móvil/teclado. Ejecutar únicamente tests relacionados con componentes/rutas alterados y typecheck focal cuando aplique; registrar comando y SHA.

**No incluido:** editor F7, escritor V2, ampliaciones Cuadra, pago, publicación, restore, video, nueva plantilla, cambios CI globales, merge o despliegue. Si el preflight encuentra conflictos de otros agentes, pausar el archivo conflictivo y continuar con tareas independientes.


## 36. DEC-17 — Política de dispositivos por superficie (APROBADA, 2026-10-29)

**Instrucción explícita del titular:** las aplicaciones **`/app` (Mi Vecidya)** y **`/internal` (administración interna)** son exclusivamente para **tableta y escritorio**. Su uso desde **móviles debe estar bloqueado**. En cambio, las **MiniWeb públicas** deben funcionar en **móvil, tableta y escritorio**.

### Alcance y precedencia
- **`/app` y `/internal`:** no ofrecer ni ejecutar interfaces operativas móviles. En móviles, mostrar una pantalla informativa de acceso no disponible que indique utilizar tableta o escritorio; sin navegación, formularios, acciones, editor ni información privada del panel.
- **MiniWeb público:** experiencia responsive completa en los tres tipos de dispositivo, incluyendo navegación, galerías, contacto, horarios, accesibilidad y rendimiento móvil.
- **Editor F7:** forma parte de `/app`; por tanto, **solo tableta y escritorio**. Se anulan los requisitos anteriores de editar, reordenar o publicar desde móvil en §29–30. Las vistas previas **simulan** móvil, tableta y escritorio, pero la vista previa móvil se controla desde un editor en tableta/escritorio.
- **API y seguridad:** el bloqueo visual por tamaño de pantalla no sustituye autorización, autenticación ni controles de tenant. No confiar en el user-agent como frontera de seguridad; evitar acceso a funciones operativas desde el frontend móvil y mantener permisos de servidor para todas las mutaciones.
- **Detección:** definir e implementar una regla consistente y comprobable para móvil vs tableta (ancho efectivo/capacidad de interfaz) sin bloquear accidentalmente tabletas en orientación vertical ni escritorios con ventana estrecha; la regla exacta se validará antes de codificar.
- **No extender el bloqueo** a páginas públicas como `/`, `/servicios`, `/vecindario`, `/vecindario/[slug]` ni a las MiniWeb públicas.

### Actualizaciones de aceptación
| Superficie | Móvil | Tableta | Escritorio |
| --- | --- | --- | --- |
| `/app` Mi Vecidya | **Bloqueado** | Permitido | Permitido |
| `/internal` | **Bloqueado** | Permitido | Permitido |
| Editor MiniWeb dentro de `/app` | **Bloqueado** | Permitido | Permitido |
| MiniWeb pública | **Permitido** | Permitido | Permitido |

**Pruebas focales:** acceso móvil a `/app` y `/internal` muestra bloqueo sin exponer datos; tableta vertical/horizontal y escritorio acceden con permisos válidos; editor puede previsualizar MiniWeb en móvil desde tableta/escritorio; MiniWeb pública se renderiza y utiliza correctamente en móvil/tableta/escritorio; rutas públicas ajenas no sufren regresiones.

**Estado:** política aprobada y documentada; no se ha implementado ni probado todavía el bloqueo.


## 37. F1/F6/F7 — Blueprint visual por superficie y plantilla (2026-10-29)

**Naturaleza:** propuesta de diseño detallada, NO mockups finales aprobados ni código. DEC-17 prevalece sobre cualquier mención histórica de `mobile-first` en este plan: `/app` y `/internal` son para **tableta y escritorio exclusivamente**; las MiniWeb públicas sí son responsive en móvil, tableta y escritorio.

### Sistema de experiencia compartido
- **App / Internal:** ancho útil para tabletas, navegación lateral colapsable, encabezado contextual, tarjetas de estado, paneles de trabajo y formularios con etiquetas visibles; densidad moderada y jerarquía clara. En móvil, reemplazar la experiencia por aviso neutro sin acciones operativas.
- **MiniWeb público:** navegación de pocas opciones, CTA principal inequívoco, secciones ordenadas y lectura rápida; prioridad a contenido real del negocio, imágenes optimizadas, contacto accesible y rendimiento móvil.
- **Editor F7 (solo app):** escritorio con tres áreas (secciones / lienzo / inspector); tableta con paneles colapsables o pestañas, sin exigir drag-and-drop. El selector de preview móvil no habilita edición desde un teléfono.
- **Tokens propuestos:** familias de espaciado, radios, tipografía, color semántico, estados de foco y elevación; mantener consistencia con tokens reales del repositorio, sin introducir otro design system antes de inventariar el existente.

### F1 — Inventario de pantallas objetivo
| Pantalla | Bloques principales | Acción primaria | Estados obligatorios |
| --- | --- | --- | --- |
| Inicio | organización activa, resumen perfil, MiniWeb, licencia/cupos, tareas | Continuar configuración / Editar MiniWeb | sin organización, sin licencia, publicado, borrador, congelado |
| Mi negocio | identidad, categoría, descripción, contacto, ubicación, horarios | Guardar datos del negocio | incompleto, válido, error de guardado, sin permiso |
| MiniWeb | plantilla, estado público, borrador, acceso editor, historial | Editar / Revisar publicación | nunca publicado, publicado, desactivado, cambios sin publicar |
| Biblioteca | activos por tipo, búsqueda, uso en secciones, cuota real | Seleccionar / Subir si autorizado | vacío, procesando, fallido, sin cuota, no autorizado |
| Configuración | cuenta, organización, permisos, integraciones según soporte | Guardar configuración | sin permiso, validación, error, éxito confirmado |
| Aprende/Soporte | contenidos y ayuda contextual existentes | Consultar recurso | sin contenido, carga, error |

**Regla de UX:** el selector de organización es visible y mantiene contexto; toda pantalla revalida permiso y titularidad en servidor. No mostrar cifras de consumo/cupos que el backend no pueda justificar.

### F6 — Identidad visual de las cinco plantillas
| Clave real | Nombre / nivel mínimo DEC-12 | Composición visual objetivo | Componentes destacados |
| --- | --- | --- | --- |
| `vecidya-default` | Esencial / Cuadra | Cabecera limpia, hero informativo, secciones en flujo vertical | identidad, servicios breves, horario, contacto |
| `services-studio` | Servicios / Cuadra | Hero con propuesta de valor, tarjetas de servicios y CTA visible | servicios, galería de trabajos, FAQ, contacto |
| `catalog-store` | Catálogo / Barrio | Portada de catálogo, cuadrícula de productos, categorías visuales | productos, galería, disponibilidad sin checkout inventado |
| `gastronomy-table` | Gastronomía / Barrio | Imagen editorial, menú/secciones, horarios y ubicación destacados | productos/menú, fotos, horario, ubicación |
| `professional-profile` | Profesional / Ciudad | Presentación de credenciales, servicios, trayectoria y contacto | about, servicios, certificaciones solo cuando módulo esté disponible |

**Importante:** las cinco composiciones son objetivos de diseño; actualmente solo `vecidya-default` está disponible. No mostrar certificaciones, testimonios o equipo como funcionales mientras sus módulos sigan `planned`. Ninguna plantilla debe suponer checkout, reservas o CRM nativos no existentes.

### Contratos visuales por tamaño
- **MiniWeb móvil:** contenido en una columna salvo galerías que admitan 2 columnas legibles; navegación compacta accesible, CTA visible sin tapar contenido, imágenes adaptativas, controles táctiles y foco.
- **MiniWeb tableta:** composiciones de una/dos columnas según contenido, medios con proporciones estables, navegación legible.
- **MiniWeb escritorio:** secciones con anchura máxima, rejillas y espacios generosos, sin líneas de texto excesivamente largas.
- **Editor tableta:** panel de secciones e inspector alternables, lienzo sin reducción ilegible, controles de orden por botones; no usar viewport de teléfono como modo de trabajo.
- **Bloqueo app/internal móvil:** pantalla de acceso no disponible, sin contenido operativo. Determinación técnica por validar para no confundir tableta vertical con teléfono grande ni escritorio estrecho.

### Entregables que faltan para cerrar diseño visual
1. Auditoría del sistema de diseño actual y componentes reutilizables del repositorio.
2. Wireframes revisables para las seis pantallas de F1 y los estados vacíos/bloqueados.
3. Diseños de las cinco plantillas con variantes móvil/tableta/escritorio y controles de accesibilidad.
4. Matriz final componente ↔ módulo V2 ↔ tier ↔ permiso ↔ API, sin prometer módulos `planned`.
5. Aprobación visual explícita antes de construir el catálogo nuevo; DEC-11 aprueba el **concepto del editor**, no estas composiciones de plantilla.

**Estado:** blueprint propuesto y documentado, sin renders, tests, implementación ni despliegue.

## 12. Registro de avance

- **2026-10-29 — [x] F0 esquema de licencias CODE:** cuenta de facturación única por titular, licencia actual por organización, estados y API admin; propuesta de Cuadra de ampliación separada, sin implementación.
- **2026-10-29 — [x] DEC-08 corregida:** Barrio/Ciudad no acumulan cupos; bloque base único de 3 y ampliaciones exclusivamente por Cuadras adicionales. Sin código, tests, merge ni deploy.
- **2026-10-29 — [x] F0 rutas CODE:** identificadas rutas reales y permisos save/publish, punto de lectura de licencia y tensión multi-organización del catálogo; pendiente decidir nivel de plantillas de organizaciones secundarias. Sin ejecución.
- **2026-10-29 — [x] F0 publicación y cuotas CODE:** snapshot schema 4, CAS por revisión/token, sobrescritura de publicación, cuotas técnicas 32 MiB/100 MiB; pendiente inventario de rutas y licencia efectiva. Sin ejecución.
- **2026-10-28 — [x] F0 contratos CODE:** inspección de oferta comercial, loader del editor, configuración v1 y schema D1; identificada incompatibilidad del índice único por tipo con galerías múltiples. Sin ejecución ni migraciones.
- **2026-10-28 — [x] DEC-07:** downgrade aprobado: conservar snapshot público y exigir plantilla autorizada antes de nuevos cambios de diseño/publicación; reglas y pruebas focales especificadas. Sin código, merge ni deploy.
- **2026-10-28 — [x] F0 documental parcial:** contraste CODE de `licenses.tsx` y `registry.ts`; identificada deuda de alineación comercial, sin pruebas ni implementación.
- **2026-10-28 — [x] DEC-06:** distribución progresiva Cuadra → Barrio → Ciudad confirmada, matriz conceptual y controles server-side definidos; catálogo específico y política de downgrade pendientes.
- **2026-10-28 — [x] DECISIONES:** DEC-01–DEC-05 confirmadas e incorporadas al contrato funcional; pendientes operativos documentados. Sin merge ni deploy.
- **2026-10-28 — [x] DOCUMENTACIÓN:** consolidación inicial de requisitos aprobados, inspección estática y propuestas en plan único. **[ ] CÓDIGO:** ninguna fase implementada por este checkpoint. **[ ] TEST:** ninguna prueba nueva ejecutada. **[ ] PRODUCCIÓN:** sin cambios.
