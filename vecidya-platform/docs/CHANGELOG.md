# Changelog

## 2026-09-22 — UX-001B.8 About Experience (`v0.3.0`, PASS técnico local)

- Rehecha `/sobre-nosotros` desde una lógica de confianza: propósito real, origen del problema, personas visibles, forma de trabajar y punto de vista sobre lo digital.
- Incorporadas las fotos reales entregadas de Yoan y Edgar como WebP optimizados: imagen conjunta desktop/mobile y perfiles individuales; no se alteró la identidad de las personas ni se añadieron credenciales no verificadas.
- Los CTAs finales mantienen la separación de B.7: Diagnóstico para orientarse y Contacto para hablar con Vecidya.
- Añadido `about-experience-check.mjs` con equipo, propósito, metadata, keyboard focus, ausencia de métricas ficticias y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.7 Join + Contact Experience (`v0.3.0`, PASS técnico local)

- Separadas las responsabilidades de `/unete` y `/contacto`: Únete explica cómo empezar con dos caminos; Contacto declara el email como canal directo real.
- `/unete` conserva la ilustración de onboarding, reduce el contexto necesario a cinco puntos y el proceso a tres pasos, sin registro, checkout ni promesas operativas.
- `/contacto` mantiene `mailto:hola@vecidya.com`, añade guidance breve, expectativas honestas y enlace a privacidad sin simular teléfono, WhatsApp, chat, booking o formulario persistente.
- Añadido `join-contact-experience-check.mjs` con metadata, H1, CTAs, mailto, privacidad, keyboard focus y responsive 1366/768/390/360; la deuda C2 de horarios permanece independiente.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.6 Diagnostic Experience (`v0.3.0`, PASS técnico local)

- Mejorada `/diagnostico` con selector visual coherente con Home, preguntas con jerarquía clara, `Pregunta X de Y`, progreso accesible y etapas visibles.
- Añadidos foco al encabezado de cada pregunta, navegación anterior/siguiente, estados seleccionados con `aria-pressed`, soporte de teclado y reinicio sin persistencia.
- El resultado ahora explica posición, confianza, dimensiones con labels humanos, fortalezas, oportunidades y próximos focos; las prioridades compatibles enlazan a anchors reales de `/servicios`.
- Corregida la contaminación de respuestas al cambiar de perfil: se limpian respuestas dependientes sin alterar el algoritmo de scoring para respuestas equivalentes.
- Añadido `diagnostic-experience-check.mjs` con selector, keyboard, progreso, back/next, resultado, reinicio y responsive 1366/768/390/360. La deuda C2 de horarios permanece independiente y fuera de alcance.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.5 Services Experience (`v0.3.0`, PASS técnico local)

- Rehecha `/servicios` como guía de decisión: hero breve, selector por necesidades, cuatro áreas core y proceso de tres pasos.
- Cada servicio comunica problema, resultado, apoyo posible y un CTA real; Organización y crecimiento se conserva como área secundaria sin inventar oferta.
- Reutilizados los cuatro SVG de Servicios aprobados en B.2; no se añadieron assets, precios, checkout, paquetes ni structured data comercial.
- Actualizada la prueba pública para validar H1 único, selector, anchors, CTAs, ausencia de «SERVICIOS COMPRABLES» y responsive en 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.4 Public Business Profile (`v0.3.0`, PASS técnico local)

- Mejorada la experiencia de `/vecindario/:slug` como presencia pública del negocio: identidad, ubicación, CTA primario, descripción, detalles operativos, horarios, contacto y redes reales.
- Los canales de contacto conservan la jerarquía WhatsApp → teléfono → website → email, con URLs seguras y nombres accesibles. Los paneles sin datos no se renderizan.
- Los horarios se agrupan visualmente con etiquetas de días y valores de tiempo sin introducir “abierto ahora” ni inferencias de timezone.
- JSON-LD `LocalBusiness` mantiene solo datos existentes e incorpora el website real en `sameAs`; no se agregan reviews, ratings, geo ni servicios comerciales ficticios.
- Actualizadas pruebas de perfil publicado, draft, opcionales vacíos, JSON-LD y cierre contextual. Validado con E2E de perfil, E2E público, Playwright responsive, typecheck, build y diff-check.
- Se mantiene `0.3.0`; no hubo deploy, migraciones remotas ni cambios en `vecidya-prod`.

## 2026-09-22 — UX-001B.3 Vecindario Experience (`v0.3.0`, PASS técnico local)

- Rediseñado `/vecindario` como superficie de descubrimiento: header breve, búsqueda por nombre, filtros exactos de categoría/ciudad, resumen de filtros activos y grid responsive.
- Reutilizada `BusinessCardV2` entre Home y Vecindario; se mantiene información pública mínima y no se agregan badges, rankings ni datos ficticios.
- Diferenciados los estados vacíos de directorio sin perfiles y búsqueda filtrada sin coincidencias.
- La búsqueda escapa `%`, `_` y `\\` para evitar que caracteres LIKE actúen como comodines.
- Validado con E2E público, QA responsive local, `pnpm run typecheck`, `pnpm run build` y `git diff --check`.
- Se mantiene `0.3.0`; no hubo deploy, migraciones remotas ni cambios en `vecidya-prod`.

## 2026-09-22 — UX-001B.2 Public Home Implementation (`v0.3.0`, PASS técnico local)

- Reemplazada la Home extensa por seis bloques de experiencia: Hero/producto, Vecindario real, Diagnóstico interactivo, Servicios visuales, transformación y CTA final.
- La Home lee hasta tres perfiles publicados desde D1 mediante la query pública existente, excluye borradores/suspendidos y mantiene estado honesto cuando no hay perfiles.
- Añadidos ocho SVG individuales: cuatro iconos de Diagnóstico y cuatro iconos de Servicios. Añadida imagen Open Graph institucional `1200×630` (`og-vecidya-public.svg`). No se integraron assets de reviews/ratings.
- Unificada la etiqueta pública `Aprende` en desktop, móvil y footer; añadidas `og:url`, `og:image` y Twitter Cards; corregido el landmark principal de la Home.
- Validado con `pnpm run typecheck`, `pnpm run build`, `git diff --check`, `product-experience-a-public-review-check.mjs` (PASS) y QA Playwright Edge en 1366/768/390/360 sin overflow.
- `0.3.0` queda local/release ready; no hubo deploy, migraciones remotas ni cambio de producción (`0.2.0`).

## 2026-09-22 — EMAIL-001D Password Reset Production E2E (`v0.2.0`, PASS)

- Evidencia manual autorizada del operador para `hola@vecidya.com`: correo real recibido, enlace de producción abierto, formulario `reset-password` ejecutado y contraseña modificada correctamente.
- Flujo verificado: `forgot-password → Gmail real → enlace de recuperación de producción → reset-password → contraseña modificada`.
- EMAIL-001 permanece **PASS / CLOSED** en `v0.2.0`. La autenticación posterior con la nueva contraseña no se afirma sin evidencia separada.
- Verificación de email con cuenta secundaria e invitación completa (entrega + aceptación) permanecen **PENDING / follow-up**.

## 2026-09-22 — EMAIL-001C Production Release (`v0.2.0`, PASS)

- Publicado el commit `6b351c4` en `vecidya-platform` top-level sobre `vecidya-prod`; Version ID `c38ce78b-648c-438c-a796-f20f7bf8e4b3`.
- Smoke público PASS: rutas principales, `forgot-password`, `reset-password`, `verify-email`, `robots.txt`, `sitemap.xml` y `www` → apex; footer público reporta `0.2.0`.
- Solicitud productiva de reset para `hola@vecidya.com` respondió `200` con mensaje genérico; el operador confirmó recepción en inbox. Gmail OAuth refresh, API send y entrega real quedan **PASS**. El detalle del reset E2E fue reconciliado en EMAIL-001D.
- No se modificó D1, no se ejecutaron migraciones ni E2E remotos destructivos, y no se expusieron valores de secretos. Verificación autenticada de esta release e invitaciones requieren una sesión/cuenta controlada y permanecen como follow-up explícito.

## 2026-09-22 — EMAIL-001 Gmail Release Ready (`v0.2.0`, no publicada)

- Confirmada la configuración top-level de producción: `EMAIL_PROVIDER=gmail`, `EMAIL_FROM=hola@vecidya.com` y `EMAIL_REPLY_TO=hola@vecidya.com`.
- Confirmados, sin leer ni versionar sus valores, los secretos requeridos por el código: `GMAIL_OAUTH_CLIENT_ID`, `GMAIL_OAUTH_CLIENT_SECRET` y `GMAIL_OAUTH_REFRESH_TOKEN`.
- Retiradas las rutas y el módulo de bootstrap OAuth temporal; el refresh token ya no se obtiene desde una superficie pública de Vecidya.
- Validación local y E2E ejecutados en este corte. Estado: **RELEASE READY**; no se declara delivery Gmail PASS, no se ejecutó deploy ni push.

## 2026-09-21 — Actualización de dependencias (local, no publicada)

- Actualizadas las dependencias directas de React Router, React, Better Auth, Cloudflare/Vite, TypeScript, tipos de Node/React, Playwright, Wrangler y Drizzle Kit; el lockfile queda sincronizado con pnpm 11.21.0.
- Añadidos overrides seguros para `qs` y `morgan`, corrigiendo sus avisos transitivos conocidos. Permanece un aviso moderado de `esbuild@0.18.20` heredado por `@esbuild-kit` de Drizzle Kit; no se fuerza una versión incompatible con ese loader.
- Validado con `pnpm install --frozen-lockfile`, `pnpm run typecheck`, `pnpm run build`, `pnpm run test:email`, `pnpm audit` y `git diff --check`. No hubo deploy ni cambio de versión publicada.

## 2026-09-21 — EMAIL-001 Gmail Transactional Email Foundation (parcial, no publicada)

- Sustituido el camino activo de Resend por un adaptador server-only provider-independent preparado para Gmail API, con MIME UTF-8 texto/HTML, `Reply-To`, validación de headers y clasificación segura de errores.
- Integrados los callbacks de Better Auth para verificación de email y reset de contraseña, además de UI mínima para solicitar reset, cambiar contraseña y verificar/resolicitar correo, sin activar verificación obligatoria global para no bloquear usuarios existentes.
- Añadido proveedor fake exclusivamente para pruebas/local staging y cuatro pruebas unit-like del adaptador. No se configuraron OAuth client/refresh token, no se enviaron correos Gmail y no hubo deploy ni bump de versión.

## 2026-09-21 — PROD-001 Production Separation & Post-Recovery Baseline (`v0.1.2`, pre-cutover)

- Respaldada fuera del repositorio la D1 pública `vecidya-staging` y verificados su inventario, migraciones `0000`–`0009` e invariantes de identidad, organización, membresía, autoridad de plataforma y perfil publicado.
- Creada `vecidya-prod` (`8edc3f04-258e-4c29-9f33-76fec3d25042`) y clonada mediante migraciones más exportación de datos, con paridad de conteos y relaciones críticas comprobada.
- Preparada la separación explícita de Wrangler: producción apunta al nuevo D1 y `env.staging` conserva `vecidya-staging`; se añadió `APP_ENV` y fallback de origen para staging.
- Endurecidas las pruebas remotas: requieren intención explícita, `TARGET_ENV=staging`, Worker dedicado `vecidya-platform-staging` y `D1_NAME=vecidya-staging`; rechazan hosts y D1 productivos.
- `v0.1.2` es versión de código preparada, no publicada. No hubo deploy, cutover, rotación de secretos ni mutación destructiva de `vecidya-staging`.

## 2026-09-21 — PROD-001B Production Cutover (`v0.1.2`)

- Desplegado `vecidya-platform` con Version ID `2b655f6b-b2ad-461d-9231-fdb96221dfd0`; Wrangler confirmó `DB=vecidya-prod`, UUID `8edc3f04-258e-4c29-9f33-76fec3d25042`, `APP_ENV=production` y rutas `vecidya.com`/`www.vecidya.com`.
- Smoke HTTP anónimo PASS para `/`, `/vecindario`, `/vecindario/vecidya`, `/login`, `/robots.txt`, `/sitemap.xml`, redirect `www` → apex y footer público `0.1.2`.
- `vecidya-staging` permanece existente y preservada; no se ejecutaron E2E remotos destructivos ni se rotaron secretos.

## 2026-09-21 — PROD-001C Authenticated Production Verification

- Verificación manual autorizada en `https://vecidya.com` con `hola@vecidya.com`: login PASS, `/app` PASS y `/app/internal` PASS.
- El flujo `/login → /app → /app/internal` confirmó sesión, organización activa y autorización `platform_admin` contra la producción ya conectada a `vecidya-prod`.
- `/app/business-profile`, `/app/organization` y `/app/internal/businesses` no fueron rechecados en este smoke; no bloquean el cierre de la separación de producción.
- PROD-001 queda **CERRADA**. Version impact: **NONE**. No se ejecutó deploy adicional.

## 2026-09-21 — AUTH-BOOTSTRAP-001 / acceso administrativo

- Recuperada la cuenta existente `hola@vecidya.com` mediante un bootstrap efímero protegido por secreto Cloudflare, usando el hashing y adapter de Better Auth; la contraseña no se guardó en texto plano ni en documentación.
- Comprobados manualmente el login, `/app` y `/app/internal`; `hola` quedó como `platform_admin` activo y `owner` de `Vecidya`.
- Eliminado `soporte@vecidya.com` de la D1 pública junto con sus sesiones, credenciales y membresía en cascada; no quedaron filas de soporte.
- Retiradas las rutas temporales de recuperación y rotación; eliminado el secreto bootstrap. Version ID final: `f8936f89-ef27-4d50-ae56-1b6e4ba35fed`; migraciones remotas no ejecutadas; version impact: **NONE**.

## 2026-09-20 — RP-001A Real Proof / Local Validation

- Añadido `tests/e2e/rp-001a-local-real-proof-check.mjs` como procedimiento reproducible y efímero para validar localmente los tres casos documentados (Edgar/SURA, Asesorar-T y Agrofanescol) sin versionar secretos, datos privados ni publicar pilotos.
- Validado: organizaciones y membresías locales, cambio de contexto, aislamiento cross-tenant, borradores, bloqueo de publicación incompleta, exclusión de Vecindario y ausencia de JSON-LD en perfiles no publicados. Los datos desconocidos permanecen vacíos o `MISSING / UNCONFIRMED`.
- RP-001A: **PASS LOCAL**. Remote D1, publicación remota, deploy y verificación de producción: **NOT PERFORMED**. Version impact: **NONE**.

## 2026-09-20 — PERF-001 Image & Asset Optimization (`v0.1.1`)

- Optimización compatible de assets visuales: inventario inicial de 18 raster PNG, conversión selectiva de 14 assets activos a WebP y conservación del ícono canónico de marca y 3 recursos seleccionados sin uso.
- Reducción de `18,649,999` a `4,369,378` bytes: ahorro de `14,280,621` bytes (`13.619 MiB`, `76.57 %`). Se actualizaron las referencias TS/TSX/CSS, se declararon dimensiones de contenido y se aplicó lazy loading únicamente below-the-fold.
- Validación local: typecheck, build, `git diff --check`, 17 E2E heredados y QA visual desktop/móvil sin imágenes rotas ni overflow. Deploy: **NO**; producción: **NOT PERFORMED**.

## 2026-09-20 — Política de versionado visible

- Añadido `PlatformFooter`, con versión derivada de `package.json` y copyright `© 2026 Vecidya`, compartido por páginas públicas, `/app` y administración interna.
- La política operativa de versiones y publicaciones queda documentada en `AGENTS.md` y `ENVIRONMENTS.md`: una versión publicada exige deploy autorizado y comprobación HTTP anónima fechada.

## 2026-09-20 — Migración a repositorio limpio

- El proyecto actual se separa del historial anterior para publicar un snapshot inicial limpio en `adsmanager-dev/Vecidya`.
- Se conservan código, documentación, configuración, migraciones y pruebas versionadas; se excluyen dependencias generadas, artefactos de build y secretos mediante `.gitignore`.

## 2026-09-20 — RR-001 Release Readiness & Test Baseline

- Corregidos los tests locales stale para usar el binding D1 `DB`, añadido `test:e2e` secuencial y guardas que rechazan destinos remotos; las pruebas remotas exigen `RUN_REMOTE_E2E=1` y permanecen fuera del runner local.
- Corregido PX-B: locators, cliente de sesión, fixture de logo local, repetición por viewport y overflow responsive real de `/app/organization` en 360 px. El flujo de login fija la primera organización mediante Better Auth y la API protege perfiles publicados contra actualizaciones incompletas; el retiro de membresías limpia sesiones activas obsoletas.
- Validación RR-001: `pnpm run test:e2e` **17 PASS / 0 FAIL / 0 SKIP** sobre D1 local limpia; `pnpm run typecheck` PASS; `pnpm run build` PASS; `git diff --check` PASS. No hubo deploy, push, D1 remoto ni migraciones remotas.

## 2026-09-20 — Baseline 2026-09-20 (auditoría y reconciliación)

- Auditoría de solo lectura del repositorio real (código, schema, 10 migraciones, 39 rutas, 25 archivos de prueba, configuración, historial Git) y reconciliación de toda la documentación contra ese código. No se implementó producto, no se creó schema ni migraciones, no se desplegó, no se usó `--remote` y no se tocaron datos reales.
- Validación ejecutada: `git diff --check` limpio; `pnpm run typecheck` PASS; `pnpm run build` PASS; D1 local con migraciones `0000`–`0009`; 12 pruebas E2E locales, **11 PASS / 1 FAIL** (`px-b`: defectos del propio script). Las 2 pruebas remotas y las 9 con nombre D1 obsoleto no se ejecutaron. Detalle en `TESTING.md`.
- Estado público verificado con peticiones anónimas de solo lectura: todas las rutas públicas 200; `/aprende` 404; `www` → apex 301; rutas privadas y APIs 302 → `/login`; `/app/internal/audit` 404. Conclusión: el sitio público **no** contiene el código de `0007`–`0009` (2026-09-07); el sitemap lista 10 URLs con un único vecino real (Vecidya).
- Hallazgos principales: `main` está 35 commits por delante de `origin/main`; `vecidya.com` corre sobre infraestructura staging; 8 archivos de prueba usan el D1 obsoleto `vecidya-dev`; las dos pruebas remotas escriben en la D1 pública; el login no fija organización activa; las invitaciones no pueden aceptarse sin verificación de email; el piloto de Edgar no es reproducible desde el repositorio; el test de app cliente (`px-b`) nunca completa; el Diagnóstico y el sitemap/robots no tienen pruebas. Ver `STATUS.md → Open Debt`.
- Documentación: 13 documentos activos (máximo 20). `STATUS.md` pasa de una tabla de fases con evidencia en celdas a matriz de capacidades + fases declaradas vs reconciliadas + Open Debt; `PROJECT_STATE.md` recoge inventario de Home, campos de Business Profile, capacidades de Admin, piloto y mapa de producto (actual vs FUTURE); `STRUCTURE.md` incorpora el inventario de las 39 rutas; `DATABASE.md` documenta las 16 tablas y elimina narrativa obsoleta de `vecidya-dev`; `ENVIRONMENTS.md` separa Local/Development/Staging/Public/Production; `ARCHITECTURE.md` documenta los dos sistemas de autorización y lo FUTURE; `ROADMAP.md` queda solo con trabajo futuro y un nuevo orden; **nuevo** `TESTING.md` (vacío real: no existía inventario ni instrucciones de pruebas); `docs/README.md` se fusionó en `vecidya-platform/README.md`; `GOVERNANCE.md` sube el límite de 15 a 20, añade vocabulario de capacidades y niveles de evidencia.
- Correcciones a afirmaciones anteriores (la historia no se reescribe; se anota aquí): la entrada de 2026-09-07 «PRODUCT-EVOLUTION-001 Bloque A» afirmó que los documentos canónicos no contenían afirmaciones contradichas por el código — el baseline halló varias (README de plataforma, conteo de pruebas con `vecidya-dev`, selector de organización, «integraciones read-only»); «verificado con datos reales» del bloque E1 no es reproducible; «TEST-002 runner estabilizado» ya no se sostiene.

## 2026-09-07 — Reestructuración del árbol `b1` (commit `ec79b22`, sin documentar en su momento)

- Eliminó del control de versiones ~1.250 archivos: `archive/` (snapshots históricos y experimentos), `resources/assets/` (biblioteca fuente de assets de marca) y `resources/README.md`. Recuperables desde el historial (`git show ec79b22^:resources/assets/…`). Dejó obsoletas las referencias de `README.md` y `AGENTS.md` a esos directorios (corregidas en el baseline).
- Añadió `vecidya-platform/vecidya-platform.zip` (37,9 MB; snapshot de 2026-08-27 que no incluye `0007`–`0009`; sin archivos de secretos por nombre) y el script `product-experience-b-client-app-check.mjs` (nunca terminó de pasar; ver `TEST-PXB-001`).

## 2026-09-07 — Commit `179784a` «test: validate real business pilot readiness»

- A pesar del prefijo `test:`, modificó solo cuatro Markdown (`CHANGELOG`, `PROJECT_STATE`, `ROADMAP`, `STATUS`); no añadió ninguna prueba ni fixture del piloto.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque E1

- `Real Business Pilot — Local Real-Data Readiness`: construidos localmente, con fixtures efímeros eliminados al finalizar, los tres negocios reales de Edgar como organizaciones independientes (Edgar owner de las tres): "Edgar | Asesor de Seguros SURA", "Asesorar-T" y "Agrofanescol". Sin código, schema ni migraciones nuevas — bloque de validación de datos reales sobre la arquitectura ya cerrada (Bloques B, C1, C2, D1).
- Ningún dato faltante fue inventado: sin WhatsApp (no asumido del teléfono confirmado), sin email, sin sitio web, sin redes sociales, sin horarios, sin cobertura, sin logo. No se realizó investigación externa automática.
- Verificado con datos reales: aislamiento multi-organización sostenido entre las tres organizaciones; perfil público, filtro por categoría y JSON-LD (sin `sameAs` ni WhatsApp inventados) correctos; gobierno de plataforma (verificar, badge público, suspender → 404 y exclusión del directorio, reactivar, audit log) ejecutado sobre un caso real.
- No se creó ninguna cuenta real de Edgar: no se dispone de su email real y no se inventó uno; se usó una identidad de fixture local claramente sintética, eliminada al finalizar. Este es un bloqueo real registrado para `Bloque E2`, no una omisión.
- Clasificación de readiness: Organización A (`Edgar | Asesor de Seguros SURA`) queda `BLOCKED` por riesgo de implicar afiliación oficial con SURA sin acreditación confirmada — no por falta de datos de contacto. Organización B (`Asesorar-T`) queda `PARTIAL`, bloqueada específicamente por tener dos nombres públicos candidatos sin confirmación explícita del usuario. Organización C (`Agrofanescol`) queda `PARTIAL`, publicable honestamente; sirvió además como stress test de dominio: su naturaleza de ecosistema/comunidad agropecuaria encaja de forma imperfecta en el modelo `BusinessProfile` actual (categoría y CTA únicos para un negocio, no para una comunidad con múltiples facetas) — evidencia registrada, sin crear `CommunityProfile` ni ningún tipo de perfil nuevo.
- Registrada la deuda `PILOT-IDENTITY-001` (email real de Edgar pendiente), `PILOT-NAME-ASESORAR-T` (nombre público pendiente de confirmación) y `PILOT-BRAND-SURA` (autorización de marca pendiente) en `PROJECT_STATE.md`.
- Sin deploy, sin escritura remota, sin `--remote`. `pnpm run typecheck`, `pnpm run build` y `git diff --check` no encontraron cambios de código que validar, consistente con que este bloque no tocó código de producto.
- Bloque cierra con `REMOTE PILOT AUTHORIZATION REQUIRED`: `Bloque E2 — Remote Pilot Publication` no se ejecuta sin autorización explícita del usuario y sin resolver `PILOT-IDENTITY-001`.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque D1

- `Admin Governance Foundation`: añadida migración aditiva `0009_platform-profile-governance.sql` con dos tablas nuevas, deliberadamente separadas de `business_profile` (no columnas adicionales) para que ninguna escritura tenant pueda tocarlas: `business_profile_governance` (verificación `unverified`/`verified`, estado de plataforma `active`/`suspended`) y `platform_audit_log` (actor, acción, entidad, organización, valor previo/nuevo, timestamp).
- Cada acción de gobierno (verificar, retirar verificación, suspender, reactivar) escribe la fila de gobierno y su fila de auditoría en un único `database.batch([...])` atómico de D1, evitando el estado "perfil cambió pero audit no existe".
- `/app/internal/businesses/:id` gana las cuatro acciones administrativas, mostrando solo las válidas según el estado actual (nunca "Verificar" sobre un perfil ya verificado, nunca "Suspender" sobre uno ya suspendido), con confirmación del navegador para suspender/reactivar por su impacto en visibilidad pública.
- Nueva página `/app/internal/audit` (y nueva entrada de navegación en `AdminShell`) lista la actividad administrativa global; el detalle de cada perfil muestra además su propia actividad contextual.
- Perfiles suspendidos dejan de listarse en `/vecindario` y su página pública devuelve 404 real (sin JSON-LD), vía `LEFT JOIN` con `business_profile_governance` en las consultas públicas (`getPublishedBusinessProfileBySlug`, `listPublishedBusinessProfiles`, `getPublishedBusinessProfileFilterOptions`). El tenant conserva sus datos, ve una señal de solo lectura "Estado de plataforma: Suspendido" en `/app/business-profile`, y republicar no revierte la suspensión porque esa tabla nunca la escribe.
- Perfiles verificados muestran "✓ Perfil verificado por Vecidya" en su página pública y un badge en el listado interno; el copy evita cualquier claim de garantía, certificación legal, solvencia o recomendación comercial. Ninguna propiedad JSON-LD de "verified" se inventó.
- Toda mutación de gobierno sigue `session → requirePlatformAdmin → resource lookup → mutation → audit`; probado con HTTP directo que un owner o admin de organización sin `platform_member` recibe 403, y que un `platform_admin` con `status=inactive` también recibe 403.
- Añadido `tests/e2e/product-evolution-001-d1-admin-governance-check.mjs`, cubriendo las 20 verificaciones del bloque (autorización, verificación, suspensión, reactivación) contra Worker+D1 local real; fixtures eliminados al finalizar.
- Corregido, solo en `admin-shell-check.mjs` y `admin-business-profiles-check.mjs` (las dos regresiones requeridas por este bloque), un identificador de D1 local obsoleto (`vecidya-dev`) heredado de antes de `PUBLIC-PROD-DIRECT-001`; el binding real es `DB`. El mismo defecto persiste en otros 6 tests no tocados, registrado como deuda en `PROJECT_STATE.md`.
- Reconfirmadas sin romperlas las regresiones de Business Profile, multi-organización, Contact & Presence (C1) y Business Operations (C2).
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin gestión de usuarios, ban, transferencia de ownership, impersonation, permisos administrativos granulares, appeals, emails de moderación, galería, R2, reviews, CRM, GHL ni Agency.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque C2

- `Real Business Profile — Business Operations`: añadida migración aditiva `0008_business-profile-operations.sql` con `service_mode` y `service_area` (opcionales) en `business_profile`, y tabla nueva `business_hours` (una fila por día de la semana, ancla `organization_id`, índice único `(organization_id, day_of_week)`). Sin coordenadas, radios, polígonos, geocoding ni mapas interactivos, conforme al alcance mínimo definido.
- Confirmado en auditoría previa que `city`/`country` representan la ubicación de referencia del negocio (mostrada y usada como filtro del Vecindario), sin contradicción respecto al nuevo `service_area`; no fue necesario redefinir su semántica.
- Elegida la alternativa de campo de texto libre para `service_area` (en vez de tabla hija) tras comprobar que los cinco casos objetivo (negocio local, profesional regional, servicio departamental, servicio nacional, híbrido presencial+remoto) se expresan correctamente sin estructura adicional.
- `business_hours` admite día abierto, día cerrado explícito (`is_closed`) y día sin definir (ausencia de fila); no admite dos turnos por día, festivos ni excepciones temporales, fuera de alcance de este bloque.
- `/app/business-profile` añade la sección "Cómo y dónde atiendes" (modalidad + cobertura) en el formulario principal, y una sección "Horarios" independiente con guardado propio (`intent=save-hours`) que reemplaza el set completo de 7 días en cada guardado.
- `/vecindario/:slug` muestra Cómo atiende/Cobertura solo cuando existen y compacta horarios agrupando días consecutivos con horario idéntico (p. ej. "Lun–Vie · 09:00–18:00"), sin fabricar continuidad sobre días sin definir ni mostrar bloques vacíos.
- JSON-LD `LocalBusiness` añade `areaServed` (Text, mapeo válido según Schema.org) y `openingHoursSpecification` únicamente con días realmente abiertos; los días cerrados o sin definir no se emiten.
- `BusinessCardV2` (tarjetas del Vecindario) queda sin cambios y sin filtros nuevos, tal como se definió el alcance.
- Añadido `tests/e2e/product-evolution-001-c2-business-operations-check.mjs`: validación y rechazo de modalidad/horarios inválidos, trim de cobertura, guardado/actualización/reload de horarios en sus tres estados (abierto, cerrado, ausente), aislamiento tenant de los tres campos en el editor privado, jerarquía y compactación del perfil público, JSON-LD sin datos vacíos, y ausencia de overflow horizontal en el editor de horarios (360px) y el perfil público (360/390/desktop); fixtures locales eliminados al finalizar.
- Reconfirmadas sin modificarlas las regresiones de Business Profile, Contact & Presence (C1) y aislamiento tenant multi-organización.
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin galería, R2, verificación, moderación, audit log, reservas, calendario, CRM, GHL ni Agencia.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque C1

- `Real Business Profile — Contact & Presence`: añadida migración aditiva `0007_business-profile-contact-presence.sql` con cuatro columnas opcionales en `business_profile`: `whatsapp`, `instagram_url`, `facebook_url`, `linkedin_url`. Sin datos existentes modificados, sin reset de perfiles, sin campos requeridos nuevos, aplicada únicamente en D1 local.
- WhatsApp se normaliza a formato internacional (`+<8-15 dígitos>`, tolerando espacios/guiones/paréntesis en la entrada) y el perfil público genera el enlace `https://wa.me/<dígitos>` sin asumir indicativo de país.
- Instagram, Facebook y LinkedIn se validan como URL HTTPS/HTTP contra el host esperado de cada plataforma (`instagram.com`, `facebook.com`/`fb.com`, `linkedin.com`); rechazan esquemas inseguros y hosts ajenos.
- `/app/business-profile` añade la sección "Contacto y presencia digital" sin duplicar teléfono/email/web ya existentes.
- `/vecindario/:slug` prioriza WhatsApp → Teléfono → Web como CTA principal (sin cinco acciones con el mismo peso) y muestra Instagram/Facebook/LinkedIn como enlaces secundarios de presencia digital, solo cuando existen.
- JSON-LD `LocalBusiness` añade `sameAs` únicamente con las redes reales publicadas, sin arreglos vacíos; WhatsApp no se transforma en `sameAs`.
- `BusinessCardV2` (tarjetas del Vecindario) queda sin cambios, tal como se definió el alcance.
- Añadido `tests/e2e/product-evolution-001-c1-contact-presence-check.mjs`: validación y rechazo de valores inválidos (UI y API), guardado y reload, aislamiento tenant de los campos nuevos entre dos organizaciones, jerarquía de CTA pública, `wa.me` correcto sin asumir Colombia, `sameAs` sin huecos, y ausencia de overflow horizontal en 360 px/390 px/desktop.
- Reconfirmadas sin modificarlas las regresiones de Business Profile, aislamiento tenant multi-organización y readiness del perfil público real.
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin horarios, galería, R2, cobertura geográfica avanzada, verificación, moderación, reviews, CRM, GHL ni Agencia.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque B

- Cerrada `Multi-Business Foundation`: formalizó documentalmente en `ARCHITECTURE.md` la arquitectura multi-organización que ya existía en código (`member` no restringe un usuario a una sola organización; `session.active_organization_id` selecciona contexto sin modelar ownership).
- Añadido `tests/e2e/product-evolution-001-b-multi-organization-check.mjs`: un mismo usuario propietario de dos organizaciones publica `BusinessProfile` y `organization_service` aislados por tenant, cambia de organización activa, `/app` y el selector reflejan la organización activa, el contexto se restaura al volver a la primera organización, y mutaciones de control en una organización no contaminan la otra en ninguna dirección.
- Auditado el selector de organización de `/app`; funciona correctamente (lista todas las organizaciones del usuario y marca la activa) y se conserva sin cambios (KEEP).
- Reconfirmadas sin modificarlas las regresiones existentes de Business Profile (`business-profile-experience-check.mjs`) y Services (`services-experience-check.mjs`).
- Reconciliado `ROADMAP.md` para que `PRODUCT-EVOLUTION-001` quede como secuencia activa inmediata y `PRODUCT-EXPERIENCE-001 B` pase a en espera; `Real Proof`/vecinos externos se reposiciona como piloto posterior a Business Profile/Admin Readiness.
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin schema, migración, roles nuevos, segundo sistema de tenancy, `agency`, cambios en Admin ni deploy.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque A

- Ejecutada auditoría de convergencia de producto (`Current Product Convergence Audit`) sobre el estado real de `main`, exclusivamente de lectura: sin cambios de código, schema, migraciones, configuración, assets, CSS, rutas, tests, datos ni documentación.
- Confirmado con evidencia ejecutable que multi-organización por usuario, cambio de organización activa, aislamiento tenant de `BusinessProfile`/`organization_service` y separación de `platform_member` respecto a `member.role` ya existen y funcionan en el código actual; los ocho documentos canónicos auditados no contenían afirmaciones contradichas por el código.
- Identificados gaps reales sin implementarlos: Home pública sin búsqueda ni datos reales, `BusinessProfile` sin WhatsApp/redes sociales/horarios/galería/cobertura/verificación, y Administración interna sin moderación, verificación ni audit log.
- Entregado el informe de auditoría directamente en la conversación, sin crear Markdown nuevo.

## 2026-08-27 — PRODUCT-EXPERIENCE-001 Bloque A

- Abierta la revisión funcional `PRODUCT-EXPERIENCE-001 — Web + Client + Agency Review`.
- `PUBLIC-GROWTH-001 Bloque C2` permanece abierto para vecinos externos, pero deja de bloquear el desarrollo general.
- El perfil público ahora conecta explícitamente hacia `Vecindario`, `Servicios`, `Diagnóstico` y `Contacto` como recorrido de producto.
- Añadido E2E local del recorrido `Home → Vecindario → perfil Vecidya → Servicios → Diagnóstico → Contacto` en desktop 1366 y móvil 390/360 px, con búsqueda, filtro, CTAs, email, web, metadata, JSON-LD y ausencia de patrones ficticios.
- Corregida la referencia histórica a D1 remoto sin perfiles publicados para que no contradiga el estado actual de Vecidya publicada.
- Sin schema, migraciones, CRM, métricas, ratings, perfiles inventados ni cambios de arquitectura.

## 2026-08-27 — PUBLIC-PROD-DIRECT-001

- Reconfigurado `wrangler.jsonc` para que `wrangler deploy` publique directamente el Worker top-level `vecidya-platform` en `vecidya.com/*` y `www.vecidya.com/*`.
- Eliminado `env.staging` como destino operativo del dominio público para evitar despliegues ambiguos con bindings dev/staging.
- Movidos `DB=vecidya-staging`, `APP_URL=https://vecidya.com` y `BETTER_AUTH_URL=https://vecidya.com` a top-level.
- Regenerado `worker-configuration.d.ts` desde la configuración pública directa.
- Movidas las rutas públicas desde `vecidya-platform-staging` hacia `vecidya-platform`; `wrangler deploy` normal quedó validado con Version ID `6cca1801-d638-4b6f-9849-ae9681716e6a`.

## 2026-08-27 — PUBLIC-GROWTH-001 Bloque C2

- Publicada Vecidya como primer vecino real de dogfooding en `https://vecidya.com/vecindario/vecidya`.
- Creadas cuentas reales `soporte@vecidya.com` y `hola@vecidya.com`; ambas quedaron como `admin` de la organización Vecidya y `platform_admin active` para administración interna.
- El perfil público usa datos autorizados: categoría `Servicios digitales y desarrollo empresarial`, Medellín, Colombia, email `hola@vecidya.com`, web `https://vecidya.com` y logo aprobado.
- Validado en remoto `/vecindario/vecidya`, búsqueda, filtro por categoría, asset de logo, JSON-LD `LocalBusiness`, acceso privado y acceso a administración interna con ambas cuentas.
- Desplegado el Worker público `vecidya-platform-staging` como deploy de bloque; Version ID `3159c989-1034-444d-b2e0-8d4ccd7357a4`.
- C2 permanece abierta: Vecidya valida dogfooding, pero el cierre requiere vecinos externos reales.

## 2026-08-27 — PUBLIC-GROWTH-001 Bloque C1

- Ejecutado `Real Profile Readiness` para comprobar el flujo usuario → organización → BusinessProfile → publicación → Vecindario.
- Añadido gate E2E local para validar creación, edición, publicación, slug único, aislamiento tenant por API, exclusión de borradores, filtros del directorio, perfil público, campos opcionales ausentes y JSON-LD `LocalBusiness`.
- Protegida la escritura de `BusinessProfile` contra slugs usados por otra organización antes de llegar a la restricción de D1, devolviendo error 400 claro.
- Confirmado que el schema actual es suficiente para los primeros perfiles comerciales reales; no hubo migraciones, CRM, persistencia nueva, perfiles universales, datos ficticios ni deploy.

## 2026-08-26 — PUBLIC-GROWTH-001 Bloque B

- `/servicios` pasa de descripciones comprimidas a fichas comprables por área.
- Cada servicio presenta `Problema`, `Cómo puede ayudar Vecidya`, `Qué puedes recibir` y `Cuándo tiene sentido`.
- Los entregables se describen como posibilidades reales según situación, sin crear paquetes cerrados, precios, garantías comerciales ni datos ficticios.
- Reforzada la regla consultiva: primero se entiende la necesidad, después se decide si tecnología, CRM, automatización o integración aporta valor.
- Sin cambios de arquitectura, CRM, schema, auth, persistencia, datos ni rutas.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `64e41d4b-0471-4357-b7ab-a99be99a2406`.

## 2026-08-26 — PUBLIC-GROWTH-001 Bloque A

- Abierta la etapa `PUBLIC-GROWTH-001` con foco en conversión del Diagnóstico, no en rediseño global.
- `/diagnostico` comunica antes de empezar qué recibirá la persona: posición digital, fortalezas, oportunidades y hasta tres próximos pasos.
- Eliminado el contador de respuestas activas del panel inicial para evitar lenguaje técnico/debug.
- Reforzado el cierre del resultado con resumen de posición digital y área prioritaria.
- Cambiado el CTA principal del resultado a `mailto:hola@vecidya.com` prellenado en cliente con tipo de presencia, posición digital, área prioritaria y objetivo marcado.
- Se mantiene el alcance del Diagnóstico: sin cambios de preguntas, branching, scoring, persistencia, schema, auth, API, CRM ni almacenamiento de respuestas.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `60ee26d1-76ac-4e48-8b25-6fc683f116a1`.

## 2026-08-26 — DIAG-RUNTIME-001 scoring polish

- Revisado el motor del Diagnóstico con combinaciones múltiples por tipo de presencia.
- Ajustado scoring para que objetivos como visibilidad, confianza, contactos, claridad y comunidad impacten sus dimensiones correspondientes.
- Corregidos obstáculos que antes pesaban poco o nada en resultado: pocos contactos y falta de tiempo.
- Añadidas prioridades específicas para respuestas débiles por perfil: prueba profesional ausente, baja consistencia de creador, canal comunitario ausente, transparencia pública dudosa y ubicación no clara.
- Priorizados los próximos pasos críticos para que no queden ocultos por el límite de tres recomendaciones.
- Verificado en local y remoto que las combinaciones no muestran `NaN`, `undefined`, más de tres próximos pasos ni overflow móvil.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `746b2749-4ff0-48d9-8f5a-8ced8d9676ad`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque E

- Ejecutado el QA final público sin añadir features, rediseño, copy nuevo, schema, auth, tenancy, CRM, persistencia ni datos ficticios.
- Verificadas por HTTP real las rutas `/`, `/diagnostico`, `/vecindario`, `/servicios`, `/que-debes-saber`, `/sobre-nosotros`, `/unete`, `/contacto` y `/privacidad` con status 200, metadata, canonical, Open Graph, footer global nuevo y ausencia de patrones prohibidos.
- Verificado `www.vecidya.com` con redirect 301 a `https://vecidya.com/`.
- Verificados `/robots.txt`, `/sitemap.xml`, sitemap sin rutas privadas, `Organization` JSON-LD y ausencia de `Review`, ratings o artículos ficticios.
- Verificada matriz responsive remota en 360 px, 390 px, tablet y desktop sin overflow horizontal y con un H1 por ruta.
- Verificados enlaces internos, `mailto:hola@vecidya.com`, login/register y empty state del Vecindario.
- Verificado Diagnóstico en las siete puertas de entrada, volver/cambiar respuesta, multiselección, opciones exclusivas, resultado, confianza, CTAs y máximo tres próximos pasos.
- D1 remoto confirma cero perfiles publicados y seis perfiles en draft, por lo que el perfil publicado remoto queda no verificable sin inventar inventario; `/vecindario/:slug` inexistente devuelve 404.
- `PUBLIC-WEB-CONTENT-001` queda cerrada con evidencia técnica vigente y deploy público `b76963a4-6b11-42f0-838a-afa49365e4fe`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque D2

- Implementada la experiencia visual del ecosistema público restante sin tocar Home, motor de Diagnóstico, schema, auth, tenancy, CRM ni persistencia.
- Ajustado hotfix visual de Home para separar el hero del bloque Vecindario y evitar que ambos se perciban pegados en escritorio.
- Vecindario gana hero de exploración, búsqueda protagonista, empty state honesto y CTA para negocios sin crear inventario artificial.
- Perfil público queda preparado para datos completos o escasos con jerarquía visual, logo/fallback, contacto existente y detalles publicados reales.
- Servicios refuerza la lectura `problema → Vecidya → resultado` y publica la corrección “No vendemos tecnología innecesaria”.
- Aprende, Nosotros, Únete y Contacto reciben estructura visual más coherente con categorías editoriales futuras, equipo/propósito, rutas de inicio y canal real de correo.
- Verificado footer global compartido en rutas públicas y ausencia de la cadena antigua “Comunidad digital para negocios locales.”.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `b76963a4-6b11-42f0-838a-afa49365e4fe`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque D1

- Iniciado el salto visual de Home y Diagnóstico sin cambiar narrativa, motor, datos, auth, schema, tenancy ni persistencia.
- Home incorpora más lenguaje visual Vecidya mediante mapas, pines, fondos por intención y jerarquía diferenciada para Diagnóstico, Servicios, Para quién y Aprende.
- Diagnóstico mejora su experiencia visual con panel de estado, progreso lineal, etapas, tarjetas de respuesta con selección explícita, estados interactivos y resultados diferenciados por dimensiones, fortalezas, oportunidades y próximos pasos.
- Se mantiene una pregunta por pantalla, respuestas efímeras en cliente y ausencia de captación o persistencia.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `835f2ea0-2917-4088-adb4-17421484870e`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque C

- Aplicada consistencia transversal sin crear documentos nuevos ni tocar schema, auth, tenancy, CRM o persistencia del diagnóstico.
- Actualizada la definición corta global de Vecidya en footer y metadata base.
- Corregido el CTA final de Home para evitar tres botones principales compitiendo en el bloque oscuro: Diagnóstico y Vecindario quedan como acciones; Contacto queda como enlace contextual.
- Añadido redirect permanente `www.vecidya.com` → `vecidya.com` en la frontera del Worker para evitar copias públicas divergentes.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `8d3bd7f7-4d05-443a-a251-5d914cb6ec63`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque B

- Aplicado copy público definitivo sin rediseño visual ni cambios de CSS.
- Home conecta Vecindario, problema, Diagnóstico, Servicios, público objetivo, Aprende, FAQ y CTA final.
- Servicios se reescribió con estructura `Problema → Vecidya → Resultado` y se corrigió “No vendemos tecnología innecesaria”.
- Únete separa autodiagnóstico y conversación directa como rutas de inicio.
- Contacto queda centrado en hablar con Vecidya por correo, con Diagnóstico como alternativa previa.
- Aprende incorpora la taxonomía editorial inicial: empezar, organizar y entender.
- Vecindario y perfiles públicos mantienen el criterio de datos reales y alinean CTAs con Diagnóstico/Contacto.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `396530d8-3cb8-448b-969f-9a91f9d571a4`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque A

- Reconciliado el estado documental de `/diagnostico`: ya está publicado en `vecidya.com` como autodiagnóstico anónimo y efímero sin persistencia.
- Cerrada la deuda abierta `DIAG-DEPLOY-001` en la documentación activa; producción final con D1 propio sigue fuera de alcance.
- Integrado Diagnóstico en la narrativa de Home como punto de partida entre problema, servicios y siguientes pasos.
- Corregidos CTAs de Servicios y Contacto para que “diagnóstico” apunte a `/diagnostico`, no a `/unete`.
- Reposicionada Únete como ruta para iniciar proceso o hablar con Vecidya después de entender el punto de partida.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `5d0c3158-d7df-44f3-ba76-d1438235ddff`.

## 2026-08-26 — DOC-RECON-001

- Reconciliada la documentación activa a 14 archivos Markdown, por debajo del máximo de 15 solicitado.
- Consolidado el contenido vigente de fases, ADRs, planes, diagnóstico, web pública, SEO/GEO, staging, privacidad, navegación, assets y saneamiento de confianza en `PROJECT_STATE.md`, `STATUS.md`, `ARCHITECTURE.md` y `ROADMAP.md`.
- Eliminadas fuentes Markdown duplicadas, históricas o reemplazadas para evitar estados paralelos.
- Actualizadas las reglas de gobierno para no crear nuevos documentos de fase, ADRs, planes o reportes Markdown sin autorización explícita.

## Estado consolidado previo

- Public Experience V2 quedó cerrada con PASS técnico/documental.
- SEO/GEO público quedó implementado con robots, sitemap, favicon y structured data base.
- La entrega pública previa quedó desplegada en `vecidya-platform-staging`, `vecidya.com` y `www.vecidya.com` sobre D1 `vecidya-staging`.
- `PUBLIC-TRUST-SANITIZATION-001` despublicó perfiles de prueba visibles y saneó copy/assets públicos donde no existían reviews o ratings reales.
- `DIAG-RUNTIME-001` implementó `/diagnostico` como autodiagnóstico anónimo y efímero; el estado vigente está reconciliado en la entrada `PUBLIC-WEB-CONTENT-001 Bloque A`.
- `/privacidad`, `/sobre-nosotros`, `/que-debes-saber` y la navegación pública están implementadas.
- `7B.2` invitaciones sigue bloqueada por configuración externa de correo y demostración de delivery real.
