# Estructura del código

**APP-MINI-02B (integrado en 0.8.3):** `app/routes/business-profile.tsx` mantiene el formulario de perfil sin campo URL de logo; `app/routes/miniweb-editor.tsx` administra el logo en Archivos e identidad. `app/routes/public-business-profile.tsx`, `app/components/miniweb/miniweb-renderer.tsx` y `db/queries/business-profile.server.ts` resuelven medios desde el snapshot publicado para cabecera, identidad y tarjeta Vecindario. Sin rutas nuevas ni cambios a guardas.

**APP-MINI-02C (candidato 0.8.4):** `DefaultMiniWebTemplate` presenta las secciones en flujo vertical uniforme, en el orden persistido; la cabecera muestra la portada como imagen dentro del marco y el logo por encima, sin repetir el icono junto al título. La vista previa comparte la plantilla pública y los controles ↑/↓ de Secciones.

**APP-MINI-02D (ajuste local del editor):** `miniweb-editor.tsx` presenta errores y confirmaciones antes del título de página; la barra sticky mantiene visible el último aviso y los enlaces públicos navegan en la pestaña actual. `ClientAreaShell` asigna `app-shell--miniweb` para compactar el espacio vertical del sidebar en escritorio y mantener ancho de drawer móvil fluido; la regla queda aislada de las demás rutas. Cada paso abre un diálogo contextual; Contenido muestra los módulos activos y mantiene accesos contextuales a sus dependencias. La vista de entrada resume la publicación y ofrece acceso directo a Diseño y Vista previa. La ruta Mi negocio compacta grupos de formulario y horarios con reglas scoped, conservando el guardado conjunto del perfil y el guardado independiente de horarios. No modifica rutas, loaders, guardas ni persistencia.

## UX-COHERENCE-03 — componentes compartidos (2026-10-19)

Actualización APP-MINI-REDESIGN-01 (2026-10-23): `app/routes/app.tsx` y `app/routes/internal.tsx` conservan loaders y guardas; `client-area-shell.tsx` e `admin-shell.tsx` incorporan estados de drawer móvil y cierre al navegar. CSS de home/admin está scoped; no se agregan rutas ni tokens globales. E2E local valida las dos rutas y drawers en 320/390/768/1366 px. La revisión WCAG/axe completa queda pendiente.

| Ruta / módulo | Uso nuevo | Límite |
| --- | --- | --- |
| `app/components/experience-system.tsx` | Guía, métrica, progreso, comparación por barras | Solo presentación; sin acceso a datos ni autorización |
| `app/lib/experience-metrics.ts` | Escala relativa, porcentaje y recuento finito | Puro; no crea ni estima métricas |
| `/` → `routes/home.tsx` | Guía pública Descubre → Comprende → Decide | Sin conversiones, testimonios ni cifras ficticias |
| `/app` → `routes/app.tsx` | Guía contextual y barra del perfil con datos de organización activa | Guardas del loader y tenant intactos |
| `/app/internal` → `routes/internal.tsx` | Métricas actuales, comparación de pendientes y guía operativa | Guardia `requirePlatformAdmin` intacta |
| `/app/internal/diagnostic-analytics` | Eventos agregados, barras y tendencia con cero real | No cohortes ni datos personales; mismo acceso protegido |
| `public-layout.tsx`, `client-area-shell.tsx`, `admin-shell.tsx` | Símbolo y retornos visuales coherentes | Solo navegación entre zonas, sin elevación de privilegios |

CSS transversal `experience-*` en `app/app.css`, responsive y modo de movimiento reducido; no se añaden nuevas rutas.


## LEGAL-UX-01 — rutas y componentes añadidos (2026-10-19; rama)

| Ruta/source | Clase | Función | Estado |
| --- | --- | --- | --- |
| `/privacidad` → `app/routes/privacy.tsx` | Pública / estática | Guía de privacidad de datos, publicación, Diagnóstico público, derechos y contacto | Código en rama; no publicado |
| `/terminos` → `app/routes/terms.tsx` | Pública / estática nueva | Condiciones de uso generales con FAQ y límites de responsabilidad orientativa | Código en rama; revisión legal y QA pendientes |
| `app/routes/sitemap.ts` | Sitemap | Incluye `/terminos` junto a `/privacidad` | Código en rama |
| `app/components/legal-page.tsx` | Presentación compartida | Cabecera, navegación por secciones y contacto de las páginas legales | Código en rama |
| `app/components/public-layout.tsx`, `app/routes/register.tsx` | Navegación | Enlaces a privacidad y condiciones sin nuevas casillas de consentimiento | Código en rama |

El estilo `legal-*` sustituye al CSS antiguo `privacy-*` en `app/app.css`. Sin rutas protegidas, API, schema, migraciones, integraciones externas ni consentimiento nuevo.


Última reconciliación: 2026-10-23 (QA-03B release-close local). Rutas verificadas contra `app/routes.ts`; la tabla describe código local, no producción. ACT-04 ya está integrado, pero sin HTTP público fechado. Columna *Pub.* conserva evidencia histórica. Abreviaturas: [TESTING.md](TESTING.md).

## LEGACY-00 — inventario de rutas (baseline `50026d0`)

Inventario original `LEGACY_INVENTORY_READY` (baseline 2026-10-12); no equivale a aprobación de limpieza. ACT-04 ahora está integrado: QA-03B es el runtime público en código. La matriz detallada conserva nombres/consumidores del baseline y debe revalidarse en el checkpoint futuro de limpieza tras deploy y cierre de rollback. No borrar por prefijo o nombre.

| Ruta/source | Clase | Imports y pruebas | Riesgo |
| --- | --- | --- | --- |
| `/diagnostico` | `KEEP` | `diagnostic.tsx` → `CandidateDiagnosticFlow` QA-03B → replay Worker; E2E `diagnostic-act-04`, `diagnostic-v3-qa03b` | QA-03B público; CTA de informe condicionado por `DIAGNOSTIC_REPORT_FUNNEL_ENABLED`. |
| `/api/diagnostic/anonymous-summary` | `KEEP` | Replay Worker QA-03B con validación de identidad, schema, bank y transcript | DTO allowlisted; conserva adaptador V3 para rollback. |
| `/api/diagnostic/funnel-analytics` | `DEV ONLY` | `api-diagnostic-funnel-analytics.ts`; agregado `diagnostic_funnel_aggregate` | Solo se registra cuando `NODE_ENV=development`; GET suprime `<5`, POST admite dos eventos con rate limit y host loopback. Bundle isolation pendiente de validación. |
| `/__dev/diagnostico/lifecycle/scheduled-purge` | `DEV ONLY` | Ejecuta el mismo helper gated que `workers/app.ts → scheduled()` para D1 local temporal; prueba concurrente/fallo/repetición | Solo loopback + same-origin en development; no se registra en production. |
| `scheduled()` Worker | Evento Cron | `server/identified-report-purge.server.ts` → `purgeExpiredIdentifiedReports()` | Cron base `17 3 * * *`; dos switches destructivos `false`; staging sin Cron. No desplegado. |
| `/diagnostico/metodologia` | `KEEP` | metodología QA-03B; E2E ACT-04 | Implementación integrada; sin evidencia HTTP pública nueva. |
| `/diagnostico/informe` source `diagnostico-informe.tsx`, sin `route()` | `KEEP` barrera | Leído por `diagnostic-report.test.ts` y readiness | Source no registrado, pero test protege la no exposición. |
| `/__dev/diagnostico/v3`, `/resultado/*`, `/metodologia`, `/informe/*` | `ARCHIVE` / `REMOVE_AFTER_CUTOVER` | Previews/golden y E2E V3 | Sólo dev; mantener para comparación hasta sustitución. |
| `/__dev/diagnostico/candidate*` | `KEEP` / `INVESTIGATE` | ACT root, manifiesto + ACT-01–03 | Dev-only; inspeccionar sus consumidores en el futuro barrido posterior a release. |
| `/__dev/diagnostico/qa03b*` | `KEEP` | QA-03B bank/session/pipeline + suites QA | Candidata certificada; rutas dev-only. |
| APIs persistence/recovery/analytics sin route registration | `REMOVE_AFTER_CUTOVER` / `INVESTIGATE` | No importadores app localizados; evidencia DIAG-V3-13 | Revisar Worker config, tests y scripts antes de retirar. |

El registro vigente conserva `/diagnostico` y metodología QA-03B junto a anonymous-summary API con compatibilidad V3 para rollback. El informe identificado sigue gobernado por su flag y las rutas `__dev` dependen de `NODE_ENV=development` y guardas loader; contar archivos no equivale a ruta registrada ni a permiso de borrado.

Medición desde blobs Git: `app/features/diagnostic` contiene 116 fuentes y 1.359.978 bytes; `qa03b/**` son 21/203.991 bytes; las dos familias `qbv2-candidate-*` suman 25/276.821 bytes brutos. Esas cantidades se traslapan con dependencias compartidas y no equivalen a reducción de bundle/instalación. La estimación condicional por identidad está en [ARCHITECTURE.md](ARCHITECTURE.md#estimación-de-retirada-potencial).

## Mapa del repositorio

```text
D:\Proyectos\Vecidya            (raíz Git)
├── AGENTS.md, README.md
└── vecidya-platform/           (único producto activo)
    ├── app/                    interfaz React Router
    │   ├── routes.ts           registro público/app/API + rutas dev condicionales
    │   ├── routes/             archivos registrados y fuentes no registradas
    │   ├── components/         public-layout, public-v2, public-business-profile-view, admin-shell, ui, diagnostic-result/, diagnostic-flow/ (V3 público + ACT + QA-03B), diagnostic-methodology/, diagnostic-report/ (adaptador compartido)
    │   ├── assets/public-assets.ts   manifiesto de assets públicos
    │   ├── content/public-copy.ts    acciones y fronteras comerciales compartidas
    │   ├── lib/auth-client.ts  cliente Better Auth
    │   ├── root.tsx, entry.server.tsx, app.css (Tailwind 4 + estilos propios)
    │   ├── features/diagnostic/ superficie mixta DIAG-002/QBV1, V3 público, ACT y QA-03B; ver clasificaciones LEGACY-00
    │   └── layouts/            solo .gitkeep
    ├── server/                 lógica exclusiva del servidor
    │   ├── auth.server.ts, auth-plugins.server.ts   Better Auth + plugin Organization
    │   ├── auth/session.server.ts, auth/authorization.server.ts, auth/organization-http-surface.ts (allowlist HTTP del plugin Organization)
    │   ├── platform-authorization.server.ts          guards platform_admin y staff de solo lectura
    │   ├── business-profile-validation.server.ts, integration-connection-validation.server.ts
    │   ├── email/mail.server.ts, invitation.server.ts adaptador Gmail + invitaciones
    │   ├── cloudflare-context.ts
    │   └── payments/, permissions/, services/, validation/   solo .gitkeep
    ├── db/
    │   ├── schema/auth.ts (18 tablas), schema/platform-meta.ts, schema/index.ts
    │   ├── migrations/         0000–0020 + meta/ (snapshots y _journal)
    │   ├── queries/            módulos de consulta; platform-training.server.ts
    │   ├── seeds/platform-meta.server.ts    nunca se invoca
    │   ├── client.server.ts    único punto de creación del cliente Drizzle
    │   └── business-profile-rules.ts, business-hours-rules.ts
    ├── workers/app.ts          entry point del Worker (+ redirect www → apex)
    ├── worker/                 durable-objects/, queues/, workflows/ vacíos
    ├── public/                 assets/selected/** + assets/catalog/** (PNG comerciales y estados diagnósticos) y brand/vecidya-app-icon.png
    ├── tests/e2e/              33 `.mjs` + 4 `.ps1` (ver TESTING.md); tests/unit/ (7 suites del Diagnóstico + 2 archivos de personas + 1 suite de slug de Business Profile + 2 hooks de resolución TS); integration/ vacío
    ├── docs/                   15 archivos Markdown tras consolidar los seis informes de fase; 12 pertenecen al inventario canónico de GOVERNANCE.md y 3 son anexos (CRM_PORTAL_01, VECIDYA-UI-UX y APRENDE_EDITORIAL_AUDIT_04B.md)
    ├── wrangler.jsonc, drizzle.config.ts, react-router.config.ts, vite.config.ts,
    │   tsconfig*.json, better-auth.config.ts, worker-configuration.d.ts (generado)
    └── vecidya-platform.zip    snapshot binario obsoleto versionado (deuda REPO-HYGIENE-001)
```

`legacy/` (ignorado por Git), `archive/` y `resources/` (eliminados del árbol en `ec79b22`) no forman parte de este clon.

`db/schema/auth.ts` contiene **todas** las tablas de negocio y plataforma, no solo las de auth. `server/` no tiene una capa `validation/` ni `permissions/` real: las reglas viven en archivos `*.server.ts` sueltos y en `server/auth/authorization.server.ts`.

## Inventario de rutas

### PUBLIC (18)

| Ruta | Archivo | Datos | Auth | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | `home.tsx` | estático | — | funcional | `px-a` (200/meta/overflow) | sí |
| `/licencias` | `licenses.tsx` | estático | — | Cuadra declara sin CRM, seguimiento ni automatizaciones | `licenses` | cambios APP-MINI-01 locales; deploy pendiente |
| `/addons` | `addons.tsx` | estático | — | funcional local / release ready | `addons` | sí local; deploy pendiente |
| `/servicios` | `services.tsx` | estático | — | funcional | `px-a` (200/overflow) | sí |
| `/unete` | `join.tsx` | estático | — | funcional | `join-contact` | sí |
| `/contacto` | `contact.tsx` | estático (`mailto`, WhatsApp directo `wa.me` y canal oficial de WhatsApp; sin grupo comunitario desde 2026-09-25) | — | funcional | `px-a`, `join-contact` | sí |
| `/vecindario` | `directory.tsx` + `db/queries/business-profile.server.ts` | perfiles publicados y snapshot público; filtros de categoría, ciudad/área, modalidad, oferta y módulos visibles | — | APP-MINI-02E en progreso: la búsqueda y las tarjetas derivan especialidades/ofertas desde contenido publicado; no leen borradores | `miniweb-core`, `public-growth-c1` | typecheck/build y MiniWeb E2E 112/112 PASS local; sin HTTP pública ni deploy |
| `/vecindario/:slug` | `public-business-profile.tsx` + `components/miniweb/miniweb-renderer.tsx` | snapshot público de perfil, horarios, configuración, ofertas, FAQ y medios | — | 02C integrado; entrega de medios depende de IDs del snapshot y del gate de R2 no aprovisionado; 02D editor integrado | `bpx`, `slug-life`, `miniweb-core` | D1 remota documentada `0000–0026`; D1 local de certificación `0000–0027`; sin deploy de esta fuente |
| `/diagnostico` | `diagnostic.tsx` + `CandidateDiagnosticFlow` | sesión QA-03B en localStorage; Worker calcula resumen allowlisted; solicitud identificada solo si el flag está activo | — | QA-03B local; funnel identificado preparado y cerrado en prod/staging | `diagnostic-act-04`, `diagnostic-v3-qa03b-check.mjs` | sin publicación nueva |
| `/diagnostico/metodologia` | `diagnostico-metodologia.tsx` | metodología evergreen | — | funcional | methodology | sí (histórico) |
| `/diagnostico/verificar` | `dev-diagnostic-verify-email.tsx` | token del fragmento, confirmación explícita, grant/cookie; gate del flag; `PlatformFooter` en página y ErrorBoundary | No | desarrollo fake; Gmail fuera de DEV si el gate se habilita | `diagnostic-v3-qa03b-check.mjs`, isolation check | no, flag false |
| `/diagnostico/informe/:requestId` | `dev-diagnostic-identified-report.tsx` | cookie opaca + grant/snapshot D1; DELETE/PATCH same-origin; `PlatformFooter` en página y ErrorBoundary, oculto al imprimir | No | HTML identificado bajo gate; sin exportación PDF | `diagnostic-v3-qa03b-check.mjs`, isolation check | no, flag false |
| `/sobre-nosotros` | `about.tsx` | estático + WebP humanos | — | funcional | `about` | sí |
| `/aprende` | `knowledge.tsx` | estático | — | APRENDE-EDITORIAL-FINAL-02 candidato: 6 categorías, 48 guías auditadas, 18 borradores pendientes de aprobación explícita, 9 itinerarios; Comprende → Prioriza → Decide; búsqueda de contenido completo | `learn`, `commercial-review` | Aprende quality #123 y Main integration quality #189 PASS; sin merge/deploy |
| `/aprende/:slug` | `learn-article.tsx` | estático | — | funcional local / release ready; artículo, índice, CTA y metadata | `learn`, `commercial-review` | sí local; deploy pendiente |
| `/que-debes-saber` | `knowledge-legacy.tsx` | alias estático | — | funcional; canonical `/aprende` | ninguno | sí |
| `/privacidad` | `privacy.tsx` | estático | — | funcional; datos, límites y contacto claros | `legal-trust` | sí |
| `/robots.txt` | `robots.ts` | estático | — | funcional | ninguno | sí |
| `/sitemap.xml` | `sitemap.ts` | D1 + catálogo editorial | — | funcional; incluye artículos y excluye rutas privadas | `commercial-review` | sí local; deploy pendiente |
| `/favicon.ico` | `favicon.ts` | redirect 302 → `/brand/vecidya-app-icon.png` | — | funcional | ninguno | sí |

### AUTH (2)

| Ruta | Archivo | Auth | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- |
| `/login` | `login.tsx` | ninguna (no redirige si ya hay sesión) | funcional | UI en `c2`; API remota | sí |
| `/register` | `register.tsx` | ninguna | funcional; sin enlaces desde la web pública | UI solo en `.ps1` obsoletos; registro por API en 17 scripts | sí |

### CLIENT APP (7)

| Ruta | Archivo | Guarda | Organización | Datos | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/app` | `app.tsx` | `requireSession` + `getActiveOrganization` | activa (revalidada; stale o ajena → 403) | org, perfil, servicios, miembros | progreso, publicación y siguiente acción reales; sin métricas CRM | `bpx`, `pe-b`, `px-b` (roto), `authz` | APP-MINI-01 local |
| `/app/account` | `account.tsx` | `requireSession` + `getActiveOrganization` | activa (stale o ajena → 403) | usuario | funcional (solo nombre) | `acct`, `authz` | sí |
| `/app/organization` | `organization.tsx` | activa + `member:read`; acciones con permiso propio + recurso de la organización (`requireOrganizationMemberTarget`, `requireOrganizationInvitationTarget`); cancelar solo si la invitación sigue pendiente | activa | miembros, invitaciones pendientes vigentes e historial | funcional; UI pulida (INVITE-UI-001, `0.5.4` local) | `team-ui`, `authz`, `invite-flow`, `members` (`TEST-D1-RESET-001`) | sí |
| `/app/training` | `organization-training.tsx` | organización activa + `organization:read`; el progreso se fija al usuario de sesión | activa y revalidada | asignaciones Aprende de la organización + estado propio | lectura y auto-reporte declarado; local | capacitación plataforma | local |
| `/app/invitations/:invitationId` | `invitation.tsx` | pública; detalles solo para el destinatario (`db/invitation-rules.ts`); aceptar lo hace Better Auth con el correo verificado de la sesión | la de la invitación | invitación + organización (D1), Better Auth | funcional: estados controlados 200/403/404/410 (INVITE-001) | `invite-flow`, `invitations`, `authz` | sí |
| `/app/business-profile` | `business-profile.tsx` | `requireOrganization` + `business-profile:read/update/publish` | activa | perfil, horarios | editor agrupado y preview privado inline; sin ruta ni cambio de permisos | `bpx`, `slug-life`, `pe-b`, `authz` | base `0007`/`0008` desplegada; APP-MINI-01 local |
| `/app/miniweb` | `miniweb-editor.tsx` | organización activa + `business-profile:read`; escrituras con `business-profile:update/publish` por API | activa y revalidada | registry, contenido draft, ofertas/FAQ, medios y snapshot v4 | módulos, edición y selección de imagen por oferta, biblioteca de logo/icono/portada/galería, preview privada y publicación explícita | `miniweb-core-check.mjs` 120/120 local | 02F local; migración `0028` solo local, sin deploy |
| `/app/services` | `services-app.tsx` | `requireSession` + `getActiveOrganization` | activa | `organization_service` | funcional (solo lectura) | `services-exp`, `pe-b`, `authz` | sí |

### INTERNAL ADMIN — lecturas con `requirePlatformReadAccess`; mutaciones con `requirePlatformAdminAction`

| Ruta | Archivo | Datos | Mutaciones | E2E | Pub. |
| --- | --- | --- | --- | --- | --- |
| `/app/internal` | `internal.tsx` | tarjetas | — | `admin-shell` | sí |
| `/app/internal/services` | `internal-services.tsx` | orgs, catálogo, asignaciones | asigna/actualiza estado, fechas y audit batch | `platform-service-administration-check.mjs` | sí (local comprobado) |
| `/app/internal/organizations` | `internal-organizations.tsx` | espacios de trabajo (organizaciones internas) | — | `platform-service-administration-check.mjs` | sí (local comprobado) |
| `/app/internal/organizations/new` | `internal-organization-create.tsx` | alta con invitación owner | `organization:create` | crea org/lifecycle/invitación/audit y envía una vez | local |
| `/app/internal/organizations/:organizationId` | `internal-organization-detail.tsx` | detalle | `requirePlatformReadAccess` | organizaciones para staff y admin | local |
| `/app/internal/organizations/:organizationId/miniweb` | `internal-organization-miniweb.tsx` | configuración JSON MiniWeb | `miniweb:save` / `miniweb:publish` | guardar draft y publicación explícita auditados | local |
| `/app/internal/organizations/:organizationId/training` | `internal-organization-training.tsx` | artículos y avance de capacitación | `requirePlatformAdmin` en loader/action | asigna contenido Aprende y corrige progreso con motivo | local |
| `/app/internal/licenses` | `internal-licenses.tsx` | licencias por negocio, agrupadas por cliente | `requirePlatformAdmin`; acción `organization:license:update` | asignar/cambiar/suspender/reactivar; auditoría del control plane | local |
| `/app/owner-invitations/:invitationId` | `platform-owner-invitation.tsx` | aceptación owner | sesión, digest, email verificado y consumo único | membership + lifecycle + audit en batch | local |
| `/app/internal/businesses` | `internal-businesses.tsx` | perfiles | — | `admin-bp` | sí |
| `/app/internal/businesses/:businessProfileId` | `internal-business-profile-detail.tsx` | detalle + gobierno + auditoría | `business_profile:governance`; CAS + auditoría atómica | `admin-bp`, `d1` | sí |
| `/app/internal/integrations` | `internal-integrations.tsx` | conexiones | — | `admin-int` (stale) | sí |
| `/app/internal/audit` | `internal-audit.tsx` | `platform_audit_log` (filtros URL, 50 por página, orden fecha/ID) | — | `platform-service-administration-check.mjs` | sí (local comprobado) |

**Certificación funcional Admin (PR #139, local):** `platform-service-administration-check.mjs` carga las 14 rutas internas con una identidad sintética `platform_admin`, y comprueba anónimo `302`, plataforma inactiva `403`, cambios de servicio/auditoría, integración duplicada `409`, aislamiento tenant y concurrencia de licencias. Chromium cubre shell Servicios/Auditoría a 1366 y 390 px. No certifica aún cada mutación UI, lector de pantalla/axe, zoom 200 %, fallos de red ni versión/esquema remoto. Ver matriz por ruta en `TESTING.md` y deuda en `STATUS.md`.

### API (15)

| Ruta | Archivo | Métodos | Guarda | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/auth/*` | `api-auth.ts` | todos | Better Auth (público por diseño). Del plugin Organization solo responden por HTTP `create`, `list`, `set-active` y `accept-invitation`; los otros 18 dan 404 (hook `before` en `auth.server.ts`, AUTHZ-BA-001) | funcional | `authz`, `unit-authz`; registro/sesión indirectos | sí (allowlist solo local hasta el próximo deploy) |
| `/api/diagnostic/anonymous-summary` | `api-diagnostic-anonymous-summary.ts` | POST | solo origen same-origin; valida forma, tamaño y replay de ruta V3 | funcional local; no escribe D1/KV ni registra respuestas; devuelve solo resumen V1 `no-store` | `funnel-01b` | no (sin deploy) |
| `/api/diagnostic/report-requests` | `api-diagnostic-report-requests.ts` | POST | same-origin, tamaño, rate limit, QA-03B identity/replay; feature gate | D1 snapshot/challenge/opt-ins; Gmail fuera de DEV; respuesta sin informe | `diagnostic-v3-qa03b-check.mjs` | no, flag false |
| `/api/diagnostic/report-requests/:requestId/resend` | `api-diagnostic-report-request-resend.ts` | POST | same-origin, solicitud/status/expiry y rate limit; feature gate | reemplaza challenge atómicamente; respuesta genérica; Gmail fuera de DEV | `diagnostic-v3-qa03b-check.mjs` | no, flag false |
| `/api/diagnostic/email/verify` | `api-diagnostic-email-verify.ts` | POST | same-origin, token digest, expiración, intentos, canje atómico y feature gate | concede cookie opaca una vez; no-store | `diagnostic-v3-qa03b-check.mjs` | no, flag false |
| `/api/organizations/:id` | `api-organization.ts` | GET | `requireMembership` | funcional | `authz` | sí |
| `…/authorization` | `api-organization-authorization.ts` | GET, POST | `organization:read`; POST comprueba el permiso pedido | funcional; JSON inválido → 500 | `authz` (matriz 3 roles × 10 permisos) | sí |
| `…/members` | `api-organization-members.ts` | GET; acciones | `member:read`/`member:role:update`/`member:remove` + `requireOrganizationMemberTarget` + Better Auth | funcional | `authz`, `members` (`TEST-D1-RESET-001`) | sí |
| `…/invitations` | `api-organization-invitations.ts` | GET; acciones | `member:invite`; cancelar + `requireOrganizationInvitationTarget` | 503 si no hay correo configurado | `authz`, `invitations` | sí |
| `…/business-profile` | `api-business-profile.ts` | GET, POST | `business-profile:read/update` | funcional; omite reglas de publicación y horarios | `bpx`, `c1`, `c2`, `px-b`, `authz` | sí |
| `…/miniweb-config` | `api-miniweb-config.ts` | GET, POST | compara organización activa con `:organizationId`; `business-profile:read/update/publish`; valida registry | tenant-scoped; GET virtual no persiste, save/publish separan draft y snapshot | `miniweb-core` | local; sin deploy |
| `…/business-media` y `…/business-media/:assetId` | `api-organization-business-media*.ts` | POST, GET, DELETE | organización activa, membership y `business-profile:read/update`; CAS para incorporar/retirar medios | privado salvo que el ID esté en el snapshot publicado; asset y referencia siempre de la misma organización | `miniweb-core-check.mjs` | R2 local simulado; bucket remoto sin provisión |
| `/media/business/:slug/:assetId` | `api-public-business-media.ts` | GET anónimo | perfil publicado + asset incluido en medios u oferta activa del snapshot vigente | la URL de draft devuelve 404; publicación explícita habilita entrega | `miniweb-core-check.mjs` | local; sin HTTP pública ni deploy |
| `…/integrations` | `api-organization-integrations.ts` | GET | solo membresía (cualquier rol, incluye `metadata`) | funcional | `authz` (403 sin membresía), `psa` | sí |
| `/api/platform/organizations/:id/services` | `api-platform-services.ts` | GET, POST | lectura `requirePlatformAdmin`; POST `organization:service:update` | audit + timestamps en batch; org inexistente aún puede producir error FK | `platform-service-administration-check.mjs`, `authz` | sí |
| `/api/platform/organizations/:id/integrations` | `api-platform-integrations.ts` | GET, POST | lectura `requirePlatformAdmin`; POST `organization:integration:create` | duplicado global devuelve `409`; insert + audit batch | `platform-service-administration-check.mjs` | sí |
| `/api/platform/organizations/:id/license` | `api-platform-licensing.ts` | GET, POST | lectura `requirePlatformAdmin`; escritura `organization:license:update` | parcial unique D1; cambios de plan CAS por `currentLicenseId`; sin checkout/renovación automática | `platform-service-administration-check.mjs`; `platform-licensing-check.mjs` | migración `0029` solo local |
| `/api/platform/organizations/:id/training` | `api-platform-training.ts` | GET, POST | `requirePlatformAdmin`; target organización explícito | asignación y corrección auditada de progreso | en curso | local |
| `/api/organizations/:id/training` | `api-organization-training.ts` | GET, POST | `requireOrganizationPermission(..., organization:read)`; solo usuario de membership | lectura y auto-reporte propios; sin userId aceptado del cliente | en curso | local |

Sin autenticación, las rutas privadas y de API responden **302 → `/login`** (nunca 401).

### SYSTEM (1)

| Ruta | Archivo | Notas | Pub. |
| --- | --- | --- | --- |
| `/__health/db` | `health-db.ts` | Lee solo `platform_meta`; **público**; `environment` fijo en `"LOCAL"`; devuelve 503 en una D1 recién migrada porque nada inserta `platform_meta` | sí (200) |

Solo desarrollo (no se cuentan en la tabla de rutas ni entran en el build): `/__dev/diagnostico/resultado/:personaId?` → `dev-diagnostic-result.tsx`, vista previa del resultado V3 con las 12 personas golden (DIAG-V3-09), y `/__dev/diagnostico/v3` → `dev-diagnostic-v3.tsx`, cuestionario adaptativo V3 completo hasta el resultado (DIAG-V3-10B; `?debug=1` muestra la sesión), y `/__dev/diagnostico/metodologia` → `dev-diagnostic-methodology.tsx`, metodología y fuentes del diagnóstico V3 (DIAG-V3-11), y `/__dev/diagnostico/informe/:personaId?` → `dev-diagnostic-report.tsx`, informe PDF de una persona golden o del diagnóstico guardado en el navegador (DIAG-V3-12; `paper`, `print`, `debug`, `stress`, `date`), y `/__dev/diagnostico/candidate` → `dev-diagnostic-candidate.tsx`, cuestionario candidate-only ACT-01; `/__dev/diagnostico/candidate/metodologia` → `dev-diagnostic-candidate-methodology.tsx` y `/__dev/diagnostico/candidate/informe` → `dev-diagnostic-candidate-report.tsx`, superficies ACT-02. `routes.ts` las registra solo con `NODE_ENV=development`, sus loaders responden 404 fuera de `import.meta.env.DEV` y el build productivo se verifica sin el harness ni módulos candidate.

FUNNEL-01A añade solo desarrollo `/__dev/diagnostico/qa03b/embudo` (`routes/dev-diagnostic-qa03b-funnel.tsx`): estados, resumen allowlistado y validación local de identificación. La ruta se incorpora a la lista condicional de `routes.ts` solo con `NODE_ENV=development`; no añade endpoint ni aparece en las rutas públicas o en el build productivo.

FUNNEL-01B separa el flujo público `AnonymousDiagnosticFlow` de `DiagnosticFlow` y su informe detallado. `POST /api/diagnostic/anonymous-summary` vuelve a validar y calcular el cuestionario con el motor V3 público; persiste solo el sidecar versionado del resumen en el navegador. `/diagnostico/informe` no aparece en el registro local de rutas; `routes/diagnostico-informe.tsx`, componentes y generador PDF permanecen en el repositorio sin cambio y la vista golden sigue disponible solo en desarrollo. La ruta pública eliminada en este checkout puede continuar en la versión desplegada hasta un deploy autorizado.

## Módulos clave

- **Diagnóstico** (`app/features/diagnostic/`, puro, sin React): `types` (dominio), `profiles` (5 perfiles y listas cerradas), `questions` (26 preguntas con propósito, dimensiones, pesos y `applies`), `answers` (selección, exclusivas, cambio de perfil y `deriveActiveAnswers`), `flow` (secciones y progreso), `routing` (DSL declarativo de reglas, DIAG-V3-03), `scoring` (7 dimensiones normalizadas y confianza), `evidence` (`DiagnosticEvidence` real, DIAG-V3-04), `result` (estado, hallazgos, prioridades con dependencias, fortalezas; trazas `explainStateClassification`/`explainContradictions`/`explainPrioritization`, DIAG-V3-05), `recommendations` (licencia por capacidad, servicios, addons, Aprende; trazas `explain*` con procedencia, DIAG-V3-05), `facts` (`ResultFacts`/`explainResult`: hechos intermedios estructurados y único mecanismo de explicación del resultado completo, DIAG-V3-05), `catalog` (referencias reales), `deep-link` (`perfil`/`objetivo`), `contracts` (versiones, IDs cerrados, `Resolution<T>` y conceptos V3; DIAG-V3-01), `mappings` (traducción explícita legacy → V3), `save-eligibility` (`canOfferSaveForLater`, condición determinista de "Guardar para después", DIAG-V3-07) e `index` (`runDiagnostic` como envoltorio de `explainResult`, `buildContactMailto`). Persistencia server-side: `server/diagnostic/session-security.server.ts` (`writeToken`), `server/diagnostic/recovery-code.server.ts` (recovery code de Save & Resume, DIAG-V3-07), `db/queries/diagnostic-sessions.server.ts` y `db/queries/diagnostic-save-resume.server.ts`. `questions.ts` es la fuente canónica del registro (`QUESTION_DEFINITIONS`) y de su aplicabilidad (`APPLICABILITY`, DIAG-V3-02); `contracts.typecheck.ts` solo contiene afirmaciones de compilación y no entra en el bundle. `routes/diagnostic.tsx` solo renderiza; `components/public-v2.tsx` genera las puertas de Home con `buildDiagnosticPath`.
- **Autorización**: `server/auth/session.server.ts` (`requireSession`, `getActiveOrganization`, `requireOrganization`, `requireMembership`), `server/auth/authorization.server.ts` (matriz de roles, `requireOrganizationPermission` y las guardas de recurso `requireOrganizationMemberTarget`/`requireOrganizationInvitationTarget`), `server/auth/organization-http-surface.ts` (allowlist HTTP del plugin Organization), `server/platform-authorization.server.ts` (`requirePlatformAdmin`). `requireRole` y `requirePermission` existen sin uso. Frontera completa en [ARCHITECTURE.md](ARCHITECTURE.md).
- **MiniWeb modular**: `features/miniweb/registry.ts` (registries y validación versionada), `features/miniweb/content.ts` (límites y validación de ofertas/FAQ e imagen opcional), `features/miniweb/render.ts` (resolución virtual/contenido útil), `db/schema/miniweb.ts`, `db/queries/miniweb.server.ts` y `miniweb-content.server.ts`, `components/miniweb/` (compositor, template actual y renderers concretos). Ofertas/FAQ son texto estructurado por negocio; el editor no acepta HTML/CSS libre.
- **Consultas**: `db/queries/` (perfil, horarios, servicios, integraciones, organizaciones, gobierno y vistas de plataforma). Toda consulta tenant filtra por `organization_id`.
- **UI compartida**: `components/public-v2.tsx` (tarjeta, perfil, JSON-LD, secciones visuales), `components/public-layout.tsx` (shell público, metadatos, navegación), `components/admin-shell.tsx`, `components/ui.tsx`.
- **Resultado del Diagnóstico V3** (`components/diagnostic-result/`, DIAG-V3-09/10): `diagnostic-result` (composición, lectura rápida y método plegado), `result-hero` (hero y tres tarjetas), `presence-status` (estado general), `action-path` (línea temporal), `status-assets.ts` (iconos WebP semánticos), `focus-section` (prioridades reusadas en el detalle), `reading-sections` (fortalezas, áreas, señales cruzadas e incertidumbre hasta cuatro puntos visibles), `dimension-overview` (rejilla 4/2/1, conteos descriptivos y tarjetas plegables accesibles), `indicators` (estado, porcentaje, confianza, certeza), `disclosures` (ayuda y evidencia), `presentation.ts` (mapeo de presentación sin JSX) y `result-debug-panel` (solo la vista previa local). Consume el `DiagnosticNarrative` y el `DiagnosticOutcome`; `/diagnostico` lo renderiza desde `DiagnosticFlow` y `dev-diagnostic-result.tsx` conserva la vista previa golden local. Capa de decisión en `features/diagnostic/`: `qbv2-overall` (índice y estado general), `qbv2-recommendations`, `qbv2-solutions` y `qbv2-offerings` (catálogo comercial y `buildDiagnosticOutcome`).
- **Flujo público de Diagnóstico QA-03B** (`components/diagnostic-flow/`, `DIAG-VISUAL-ASSETS-01`): `qa03b-diagnostic-flow` persiste/reanuda la sesión versionada y solicita replay al Worker; `qa03b-result` muestra resumen general, acciones y `diagnostic-area-overview` con ocho tarjetas accesibles. `api-diagnostic-anonymous-summary.ts` valida/reconstruye QA-03B y emite `anonymous-diagnostic-summary-v2` (o mantiene la proyección V3 legacy independiente). `diagnostic-result/presentation.ts` aporta el mapa allowlisted de las ilustraciones locales; el informe usa la misma salida del replay.
- **Metodología del Diagnóstico V3** (`components/diagnostic-methodology/`, DIAG-V3-11): `methodology-article` (`MethodologyArticle`: «Lo esencial», índice, secciones, ocho áreas, cadena de recomendación, fuentes numeradas y tabla de versiones) y `METHODOLOGY_PATH`. Los datos viven en `features/diagnostic/qbv2-methodology.ts`, que se importa directamente (no está en el barrel del dominio).
- **Fachada candidata de diagnóstico (inactiva)**: `features/diagnostic/qbv2-candidate-pipeline.ts` compone planner, resultado candidate y la identidad/manifiesto; permanece fuera de `features/diagnostic/index.ts` y de imports públicos. No reemplaza `qbv2-session.ts` ni es consumida por la ruta pública. El resultado candidate no coincide con `DiagnosticResultV3`.
- **Contrato y solicitud identificada QA-03B**: `features/diagnostic/qa03b/qbv2-candidate-funnel.ts` proyecta el replay a una allowlist anónima v2 y valida el DTO de solicitud; `/api/diagnostic/report-requests` conserva el acceso identificado detrás de la verificación autorizada existente. `qbv2-candidate-funnel-preview.ts` sigue siendo una muestra sintética de desarrollo.
- **Informe PDF del Diagnóstico V3** (`components/diagnostic-report/`, DIAG-V3-12): `report-model` (`DiagnosticReportV1`, `buildDiagnosticReport`, `reportFileName`, papeles A4/Carta), `diagnostic-report` (`DiagnosticReport`: bloques, reparto en hojas fijas y densidad) y `report-path` (`REPORT_PATH`). El modelo acepta narrative/outcome legacy; requiere adaptación antes de recibir el candidato. Activo de marca para impresión: `public/assets/selected/brand/brand-symbol-report.webp` (96 px).

## Placeholders sin implementación

`app/features/{admin,auth,billing,business,chat,community,notifications,projects,support}` (solo `features/diagnostic` tiene código), `app/layouts`, `server/{payments,permissions,services,validation}`, `worker/{durable-objects,queues,workflows}`, `tests/integration`. No deben citarse como capacidades.

## Archivos de configuración

- `wrangler.jsonc`: Worker `vecidya-platform`, rutas `vecidya.com/*` y `www.vecidya.com/*`, producción top-level con `APP_ENV=production` y D1 `DB=vecidya-prod`; `env.staging` define `vecidya-platform-staging`, `APP_ENV=staging` y `DB=vecidya-staging`; `secrets.required` (`BETTER_AUTH_SECRET`).
- `react-router.config.ts`: `ssr: true`. `vite.config.ts`: React Router, Tailwind 4 y plugin de Cloudflare. `drizzle.config.ts`: schema `db/schema/index.ts`, salida `db/migrations`, dialecto SQLite.
- `tsconfig.json`, `tsconfig.cloudflare.json`, `tsconfig.node.json`; `pnpm-workspace.yaml` (build de `esbuild`/`workerd`, excepciones de `minimumReleaseAge` para Better Auth).
