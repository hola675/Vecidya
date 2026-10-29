# MI VECIDYA + MINIWEB PREMIUM V2 — PLAN MAESTRO V1

**ID:** APP-MINI-PLAN-V1 · **Fecha:** 2026-10-28 · **Estado:** planificación documental, NO implementado · **Repositorio:** `hola675/Vecidya` · **Producto:** `vecidya-platform/`.

**Alcance de este checkpoint:** únicamente este plan en `plans/`. No cambia aplicación, D1, licencias, CRM, producción ni configuración remota. No autoriza merge ni deploy.

> **Evidencia:** `APROBADO` = decisión explícita del usuario; `CODE` = inspección estática de `main`; `DOC` = documentación del repositorio no revalidada en ejecución; `PROPUESTA` = diseño pendiente de validación; `TEST` = prueba efectivamente ejecutada (ninguna nueva). **Marcas:** `[x]` documentado/comprobado dentro de su alcance, `[~]` parcial o pendiente de decisión, `[ ]` no implementado, `[!]` bloqueo. Ningún `[x]` documental acredita software terminado.

## 0. Objetivo y principios

**APROBADO:** Convertir Mi Vecidya en una aplicación coherente, accesible y fácil para personas sin experiencia tecnológica, y MiniWeb en un constructor visual premium de plantillas y secciones personalizables. Complejidad interna, simplicidad externa. Permitir crear, editar, publicar y mantener periódicamente una página sin programar.

**APROBADO:** Vecidya gestiona presencia digital, perfiles, MiniWeb, medios, publicación y configuración de su aplicación. GHL conserva sus funciones CRM; no duplicar CRM, automatizaciones ni contactos de GHL. Usar **licencia**, no membresía. Sin datos comerciales inventados.

**PROPUESTA:** Objetivo WCAG 2.2 AA, enfoque mobile-first, SSR, rendimiento medido, componentes semánticos, teclado, movimiento reducido, contraste verificable, privacidad, autorización server-side por organización, progresión de divulgación y diseño consistente por tokens. Evitar HTML/CSS/JS arbitrarios de usuarios.

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

## 12. Registro de avance

- **2026-10-28 — [x] DEC-07:** downgrade aprobado: conservar snapshot público y exigir plantilla autorizada antes de nuevos cambios de diseño/publicación; reglas y pruebas focales especificadas. Sin código, merge ni deploy.\n- **2026-10-28 — [x] F0 documental parcial:** contraste CODE de `licenses.tsx` y `registry.ts`; identificada deuda de alineación comercial, sin pruebas ni implementación.\n- **2026-10-28 — [x] DEC-06:** distribución progresiva Cuadra → Barrio → Ciudad confirmada, matriz conceptual y controles server-side definidos; catálogo específico y política de downgrade pendientes.\n- **2026-10-28 — [x] DECISIONES:** DEC-01–DEC-05 confirmadas e incorporadas al contrato funcional; pendientes operativos documentados. Sin merge ni deploy.\n- **2026-10-28 — [x] DOCUMENTACIÓN:** consolidación inicial de requisitos aprobados, inspección estática y propuestas en plan único. **[ ] CÓDIGO:** ninguna fase implementada por este checkpoint. **[ ] TEST:** ninguna prueba nueva ejecutada. **[ ] PRODUCCIÓN:** sin cambios.
