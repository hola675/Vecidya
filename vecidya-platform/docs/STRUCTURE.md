# Estructura del código

## LEGAL-UX-01 — rutas y componentes añadidos (2026-10-19; rama)

| Ruta/source | Clase | Función | Estado |
| --- | --- | --- | --- |
| `/privacidad` → `app/routes/privacy.tsx` | Pública / estática | Guía de privacidad de datos, publicación, Diagnóstico público, derechos y contacto | Código en rama; no publicado |
| `/terminos` → `app/routes/terms.tsx` | Pública / estática nueva | Condiciones de uso generales con FAQ y límites de responsabilidad orientativa | Código en rama; revisión legal y QA pendientes |
| `app/components/legal-page.tsx` | Presentación compartida | Cabecera, navegación por secciones y contacto de las páginas legales | Código en rama |
| `app/components/public-layout.tsx`, `app/routes/register.tsx` | Navegación | Enlaces a privacidad y condiciones sin nuevas casillas de consentimiento | Código en rama |

El estilo `legal-*` sustituye al CSS antiguo `privacy-*` en `app/app.css`. Sin rutas protegidas, API, schema, migraciones, integraciones externas ni consentimiento nuevo.


Última reconciliación: 2026-10-16 (FUNNEL-01D.1-R local; `0018`/`0019`, lectura/emisión/fixtures loopback dev-only). Rutas verificadas contra `app/routes.ts`; la tabla describe código local, no producción. Columna *Pub.* conserva evidencia HTTP/versiones históricas. Abreviaturas: [TESTING.md](TESTING.md).

## LEGACY-00 — inventario de rutas (baseline `50026d0`)

Resultado `LEGACY_INVENTORY_READY`; auditoría sin eliminación. La clasificación por grupos, consumers, riesgos y estados está en [ARCHITECTURE.md](ARCHITECTURE.md#vecidya-legacy-00--inventario-y-consolidación-2026-10-12). Se excluyó el trabajo local sin commit del baseline y se preservó. QA-03B, RESULT-UX-02 y FUNNEL-01B no se reabren; ACT-04 no se ejecuta.

| Ruta/source | Clase | Imports y pruebas | Riesgo |
| --- | --- | --- | --- |
| `/diagnostico` | `KEEP` | `diagnostic.tsx` → `AnonymousDiagnosticFlow` → session V3/key 2; E2E `diagnostic`, `funnel-01b` | Necesario para FUNNEL-01B; aún sin deploy. |
| `/api/diagnostic/anonymous-summary` | `KEEP` | Replay Worker con bank/planner/session V3; E2E `funnel-01b` | DTO allowlisted; no es backend QA-03B. |
| `/api/diagnostic/funnel-analytics` | `DEV ONLY` | `api-diagnostic-funnel-analytics.ts`; agregado `diagnostic_funnel_aggregate` | Solo se registra cuando `NODE_ENV=development`; GET suprime `<5`, POST admite dos eventos con rate limit y host loopback. Bundle isolation pendiente de validación. |
| `/diagnostico/metodologia` | `KEEP` | metodologia → `qbv2-methodology`; E2E methodology | Versión y contenido aún ligados al V3 público. |
| `/diagnostico/informe` source `diagnostico-informe.tsx`, sin `route()` | `KEEP` barrera | Leído por `diagnostic-report.test.ts` y readiness | Source no registrado, pero test protege la no exposición. |
| `/__dev/diagnostico/v3`, `/resultado/*`, `/metodologia`, `/informe/*` | `ARCHIVE` / `REMOVE_AFTER_CUTOVER` | Previews/golden y E2E V3 | Sólo dev; mantener para comparación hasta sustitución. |
| `/__dev/diagnostico/candidate*` | `KEEP` / `INVESTIGATE` | ACT root, manifiesto + ACT-01–03 | Identidad separada QA-03B; destino ACT-04 pendiente. |
| `/__dev/diagnostico/qa03b*` | `KEEP` | QA-03B bank/session/pipeline + suites QA | Candidata certificada; rutas dev-only. |
| APIs persistence/recovery/analytics sin route registration | `REMOVE_AFTER_CUTOVER` / `INVESTIGATE` | No importadores app localizados; evidencia DIAG-V3-13 | Revisar Worker config, tests y scripts antes de retirar. |

HEAD contiene 16 archivos fuente de ruta relacionados con diagnóstico; el registro público vigente conserva `/diagnostico`, metodología y anonymous-summary API. Rutas `__dev` dependen de `NODE_ENV=development` y guardas loader; contar archivo no equivale a ruta registrada.

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
    │   ├── platform-authorization.server.ts          requirePlatformAdmin
    │   ├── business-profile-validation.server.ts, integration-connection-validation.server.ts
    │   ├── email/mail.server.ts, invitation.server.ts adaptador Gmail + invitaciones
    │   ├── cloudflare-context.ts
    │   └── payments/, permissions/, services/, validation/   solo .gitkeep
    ├── db/
    │   ├── schema/auth.ts (15 tablas), schema/platform-meta.ts, schema/index.ts
    │   ├── migrations/         0000–0009 + meta/ (snapshots y _journal)
    │   ├── queries/            10 módulos de consulta
    │   ├── seeds/platform-meta.server.ts    nunca se invoca
    │   ├── client.server.ts    único punto de creación del cliente Drizzle
    │   └── business-profile-rules.ts, business-hours-rules.ts
    ├── workers/app.ts          entry point del Worker (+ redirect www → apex)
    ├── worker/                 durable-objects/, queues/, workflows/ vacíos
    ├── public/                 assets/selected/** + assets/catalog/** (PNG comerciales y estados diagnósticos) y brand/vecidya-app-icon.png
    ├── tests/e2e/              33 `.mjs` + 4 `.ps1` (ver TESTING.md); tests/unit/ (7 suites del Diagnóstico + 2 archivos de personas + 1 suite de slug de Business Profile + 2 hooks de resolución TS); integration/ vacío
    ├── docs/                   14 archivos Markdown tras consolidar los seis informes de fase; 12 pertenecen al inventario canónico de GOVERNANCE.md y 2 son anexos preexistentes (CRM_PORTAL_01 y VECIDYA-UI-UX)
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
| `/vecindario` | `directory.tsx` | D1 lista+filtros | — | funcional | `px-a`, `pg-c1`, `d1` | sí |
| `/vecindario/:slug` | `public-business-profile.tsx` + `components/miniweb/miniweb-renderer.tsx` | perfil/horarios allowlisted + snapshot modular | — | template compatible, módulos ordenados; conserva 404 si no publicado/suspendido | `bpx`, `slug-life`, `miniweb-core` | APP-MINI-02A local; migración `0017` pendiente del ledger |
| `/diagnostico` | `diagnostic.tsx` + `AnonymousDiagnosticFlow` | respuestas en localStorage; Worker calcula resumen V3; solicitud identificada dev-only y snapshot D1 local | — | FUNNEL-01B/01C local; no publicado | `diagnostic`, `funnel-01b`, `funnel-01c` | publicación previa sin FUNNEL-01B; requiere deploy para actualizar |
| `/diagnostico/metodologia` | `diagnostico-metodologia.tsx` | metodología evergreen | — | funcional | methodology | sí (histórico) |
| `/diagnostico/verificar` | `dev-diagnostic-verify-email.tsx` | fragmento efímero + confirmación explícita | No | solo desarrollo; email simulado | `funnel-01c` | no |
| `/diagnostico/informe/:requestId` | `dev-diagnostic-identified-report.tsx` | cookie opaca + grant/snapshot D1 local; DELETE con autorización de acceso | No | solo desarrollo; sin exportación PDF | `funnel-01c` | no |
| `/sobre-nosotros` | `about.tsx` | estático + WebP humanos | — | funcional | `about` | sí |
| `/aprende` | `knowledge.tsx` | estático | — | funcional local / release ready; 5 categorías y 4 artículos | `learn`, `commercial-review` | sí local; deploy pendiente |
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
| `/app/invitations/:invitationId` | `invitation.tsx` | pública; detalles solo para el destinatario (`db/invitation-rules.ts`); aceptar lo hace Better Auth con el correo verificado de la sesión | la de la invitación | invitación + organización (D1), Better Auth | funcional: estados controlados 200/403/404/410 (INVITE-001) | `invite-flow`, `invitations`, `authz` | sí |
| `/app/business-profile` | `business-profile.tsx` | `requireOrganization` + `business-profile:read/update/publish` | activa | perfil, horarios | editor agrupado y preview privado inline; sin ruta ni cambio de permisos | `bpx`, `slug-life`, `pe-b`, `authz` | base `0007`/`0008` desplegada; APP-MINI-01 local |
| `/app/miniweb` | `miniweb-editor.tsx` | organización activa + `business-profile:read` | activa y revalidada | registry, draft/snapshot, DTO de preview | plantilla actual, cinco módulos disponibles, activar/ordenar, preview privada/publicar config | `miniweb-core` | local; migración `0017` pendiente del ledger |
| `/app/services` | `services-app.tsx` | `requireSession` + `getActiveOrganization` | activa | `organization_service` | funcional (solo lectura) | `services-exp`, `pe-b`, `authz` | sí |

### INTERNAL ADMIN (8) — todas con `requirePlatformAdmin`

| Ruta | Archivo | Datos | Mutaciones | E2E | Pub. |
| --- | --- | --- | --- | --- | --- |
| `/app/internal` | `internal.tsx` | tarjetas | — | `admin-shell` | sí |
| `/app/internal/services` | `internal-services.tsx` | orgs, catálogo, asignaciones | upsert de estado (sin auditoría) | `psa` (stale) | sí |
| `/app/internal/organizations` | `internal-organizations.tsx` | organizaciones | — | `admin-orgs` (stale) | sí |
| `/app/internal/organizations/:organizationId` | `internal-organization-detail.tsx` | detalle | — | `admin-orgs` (stale) | sí |
| `/app/internal/businesses` | `internal-businesses.tsx` | perfiles | — | `admin-bp` | sí |
| `/app/internal/businesses/:businessProfileId` | `internal-business-profile-detail.tsx` | detalle + gobierno + auditoría | verificar/retirar/suspender/reactivar (`0009`) | `admin-bp`, `d1` | sí (sin acciones de gobierno) |
| `/app/internal/integrations` | `internal-integrations.tsx` | conexiones | — | `admin-int` (stale) | sí |
| `/app/internal/audit` | `internal-audit.tsx` | `platform_audit_log` (últimas 200) | — | `d1` | **no** (404 público) |

### API (15)

| Ruta | Archivo | Métodos | Guarda | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/auth/*` | `api-auth.ts` | todos | Better Auth (público por diseño). Del plugin Organization solo responden por HTTP `create`, `list`, `set-active` y `accept-invitation`; los otros 18 dan 404 (hook `before` en `auth.server.ts`, AUTHZ-BA-001) | funcional | `authz`, `unit-authz`; registro/sesión indirectos | sí (allowlist solo local hasta el próximo deploy) |
| `/api/diagnostic/anonymous-summary` | `api-diagnostic-anonymous-summary.ts` | POST | solo origen same-origin; valida forma, tamaño y replay de ruta V3 | funcional local; no escribe D1/KV ni registra respuestas; devuelve solo resumen V1 `no-store` | `funnel-01b` | no (sin deploy) |
| `/api/diagnostic/report-requests` | `api-diagnostic-report-requests.ts` | POST | dev-only, same-origin, tamaño, rate limit, identity y replay V3 | D1 local; solicitud/snapshot/challenge/opt-ins; respuesta sin informe; fake email en memoria | `funnel-01c` | no |
| `/api/diagnostic/report-requests/:requestId/resend` | `api-diagnostic-report-request-resend.ts` | POST | dev-only, same-origin, pendiente y rate limit | reemplaza challenge; correo simulado | `funnel-01c` | no |
| `/api/diagnostic/email/verify` | `api-diagnostic-email-verify.ts` | POST | dev-only, same-origin, token digest, expiración, intentos y canje atómico | concede cookie opaca una vez; no-store | `funnel-01c` | no |
| `/api/organizations/:id` | `api-organization.ts` | GET | `requireMembership` | funcional | `authz` | sí |
| `…/authorization` | `api-organization-authorization.ts` | GET, POST | `organization:read`; POST comprueba el permiso pedido | funcional; JSON inválido → 500 | `authz` (matriz 3 roles × 10 permisos) | sí |
| `…/members` | `api-organization-members.ts` | GET; acciones | `member:read`/`member:role:update`/`member:remove` + `requireOrganizationMemberTarget` + Better Auth | funcional | `authz`, `members` (`TEST-D1-RESET-001`) | sí |
| `…/invitations` | `api-organization-invitations.ts` | GET; acciones | `member:invite`; cancelar + `requireOrganizationInvitationTarget` | 503 si no hay correo configurado | `authz`, `invitations` | sí |
| `…/business-profile` | `api-business-profile.ts` | GET, POST | `business-profile:read/update` | funcional; omite reglas de publicación y horarios | `bpx`, `c1`, `c2`, `px-b`, `authz` | sí |
| `…/miniweb-config` | `api-miniweb-config.ts` | GET, POST | compara organización activa con `:organizationId`; `business-profile:read/update/publish`; valida registry | tenant-scoped; GET virtual no persiste, save/publish separan draft y snapshot | `miniweb-core` | local; sin deploy |
| `…/integrations` | `api-organization-integrations.ts` | GET | solo membresía (cualquier rol, incluye `metadata`) | funcional | `authz` (403 sin membresía), `psa` | sí |
| `/api/platform/organizations/:id/services` | `api-platform-services.ts` | GET, POST | `requirePlatformAdmin` | funcional; org inexistente → 500 FK | `psa`, `authz` (403 para owner/admin/member de la organización) | sí |
| `/api/platform/organizations/:id/integrations` | `api-platform-integrations.ts` | GET, POST | `requirePlatformAdmin` | funcional; duplicado → 500 | `psa` (stale) | sí |
| `/api/platform/organizations/:id/license` | `api-platform-licensing.ts` | GET, POST | `requirePlatformAdmin` | funcional; sin checkout, sin cobro automático (LICENSE-STRATEGY-001) | `platform-licensing` | no (solo local; `0010` sin aplicar a remoto) |

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
- **MiniWeb modular**: `features/miniweb/registry.ts` (registries y validación versionada), `features/miniweb/render.ts` (resolución virtual/contenido útil), `features/miniweb/public-model.ts` (DTO allowlisted y publicación), `db/schema/miniweb.ts` + `db/queries/miniweb.server.ts`, `components/miniweb/` (compositor, template actual y renderers concretos). No almacena contenido ni artefactos del editor libre.
- **Consultas**: `db/queries/` (perfil, horarios, servicios, integraciones, organizaciones, gobierno y vistas de plataforma). Toda consulta tenant filtra por `organization_id`.
- **UI compartida**: `components/public-v2.tsx` (tarjeta, perfil, JSON-LD, secciones visuales), `components/public-layout.tsx` (shell público, metadatos, navegación), `components/admin-shell.tsx`, `components/ui.tsx`.
- **Resultado del Diagnóstico V3** (`components/diagnostic-result/`, DIAG-V3-09/10): `diagnostic-result` (composición, lectura rápida y método plegado), `result-hero` (hero y tres tarjetas), `presence-status` (estado general), `action-path` (línea temporal), `status-assets.ts` (iconos WebP semánticos), `focus-section` (prioridades reusadas en el detalle), `reading-sections` (fortalezas, áreas, señales cruzadas e incertidumbre hasta cuatro puntos visibles), `dimension-overview` (rejilla 4/2/1, conteos descriptivos y tarjetas plegables accesibles), `indicators` (estado, porcentaje, confianza, certeza), `disclosures` (ayuda y evidencia), `presentation.ts` (mapeo de presentación sin JSX) y `result-debug-panel` (solo la vista previa local). Consume el `DiagnosticNarrative` y el `DiagnosticOutcome`; `/diagnostico` lo renderiza desde `DiagnosticFlow` y `dev-diagnostic-result.tsx` conserva la vista previa golden local. Capa de decisión en `features/diagnostic/`: `qbv2-overall` (índice y estado general), `qbv2-recommendations`, `qbv2-solutions` y `qbv2-offerings` (catálogo comercial y `buildDiagnosticOutcome`).
- **Cuestionario y resumen anónimo V3** (`components/diagnostic-flow/`, DIAG-V3-10B/FUNNEL-01B): `anonymous-diagnostic-flow` (sesión pública, persistencia del cuestionario y sidecar de resumen V1), `anonymous-summary-screen` (allowlist visible), `diagnostic-flow` (flujo de vista detallada/dev), `question-step`, `flow-screens` y `flow-copy.ts`. `api-diagnostic-anonymous-summary.ts` reejecuta la sesión V3 y emite solo la proyección del resumen. Sesión de dominio en `features/diagnostic/qbv2-session.ts`.
- **Metodología del Diagnóstico V3** (`components/diagnostic-methodology/`, DIAG-V3-11): `methodology-article` (`MethodologyArticle`: «Lo esencial», índice, secciones, ocho áreas, cadena de recomendación, fuentes numeradas y tabla de versiones) y `METHODOLOGY_PATH`. Los datos viven en `features/diagnostic/qbv2-methodology.ts`, que se importa directamente (no está en el barrel del dominio).
- **Fachada candidata de diagnóstico (inactiva)**: `features/diagnostic/qbv2-candidate-pipeline.ts` compone planner, resultado candidate y la identidad/manifiesto; permanece fuera de `features/diagnostic/index.ts` y de imports públicos. No reemplaza `qbv2-session.ts` ni es consumida por la ruta pública. El resultado candidate no coincide con `DiagnosticResultV3`.
- **Embudo candidato FUNNEL-01A (no activado)**: `features/diagnostic/qa03b/qbv2-candidate-funnel.ts` proyecta el resultado QA-03B a una allowlist de resumen y valida el formulario sin enviar datos; `qbv2-candidate-funnel-preview.ts` compone dos muestras sintéticas. La UI solo vive en la ruta privada local y no importa desde páginas públicas.
- **Informe PDF del Diagnóstico V3** (`components/diagnostic-report/`, DIAG-V3-12): `report-model` (`DiagnosticReportV1`, `buildDiagnosticReport`, `reportFileName`, papeles A4/Carta), `diagnostic-report` (`DiagnosticReport`: bloques, reparto en hojas fijas y densidad) y `report-path` (`REPORT_PATH`). El modelo acepta narrative/outcome legacy; requiere adaptación antes de recibir el candidato. Activo de marca para impresión: `public/assets/selected/brand/brand-symbol-report.webp` (96 px).

## Placeholders sin implementación

`app/features/{admin,auth,billing,business,chat,community,notifications,projects,support}` (solo `features/diagnostic` tiene código), `app/layouts`, `server/{payments,permissions,services,validation}`, `worker/{durable-objects,queues,workflows}`, `tests/integration`. No deben citarse como capacidades.

## Archivos de configuración

- `wrangler.jsonc`: Worker `vecidya-platform`, rutas `vecidya.com/*` y `www.vecidya.com/*`, producción top-level con `APP_ENV=production` y D1 `DB=vecidya-prod`; `env.staging` define `vecidya-platform-staging`, `APP_ENV=staging` y `DB=vecidya-staging`; `secrets.required` (`BETTER_AUTH_SECRET`).
- `react-router.config.ts`: `ssr: true`. `vite.config.ts`: React Router, Tailwind 4 y plugin de Cloudflare. `drizzle.config.ts`: schema `db/schema/index.ts`, salida `db/migrations`, dialecto SQLite.
- `tsconfig.json`, `tsconfig.cloudflare.json`, `tsconfig.node.json`; `pnpm-workspace.yaml` (build de `esbuild`/`workerd`, excepciones de `minimumReleaseAge` para Better Auth).
