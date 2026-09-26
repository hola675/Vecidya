# Estructura del código

Última reconciliación: 2026-09-25 (LICENSE-STRATEGY-001: foundation de licenciamiento multi-negocio, solo local; AUTHZ-BA-001: guardas de organización, miembros e invitaciones; DIAG-002; REL-003). Rutas verificadas contra `app/routes.ts`; las rutas públicas comerciales y sus pruebas de release están reconciliadas. Columna *Pub.*: comprobación local de la nueva experiencia y evidencia HTTP histórica para el resto (`sí` = responde como se espera; para rutas privadas, `sí` = existe y redirige a `/login`; `no` = no está en el Worker público). Abreviaturas de pruebas: ver [TESTING.md](TESTING.md).

## Mapa del repositorio

```text
D:\Proyectos\Vecidya            (raíz Git)
├── AGENTS.md, README.md
└── vecidya-platform/           (único producto activo)
    ├── app/                    interfaz React Router
    │   ├── routes.ts           tabla de 41 rutas
    │   ├── routes/             41 archivos (uno por ruta)
    │   ├── components/         public-layout, public-v2, admin-shell, ui
    │   ├── assets/public-assets.ts   manifiesto de assets públicos
    │   ├── lib/auth-client.ts  cliente Better Auth
    │   ├── root.tsx, entry.server.tsx, app.css (Tailwind 4 + estilos propios)
    │   ├── features/diagnostic/ motor puro del Diagnóstico (13 módulos + `contracts.typecheck.ts`; DIAG-002, DIAG-V3-01); las otras 9 carpetas de features/* solo tienen .gitkeep
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
    ├── public/                 assets/selected/** (14 WebP activos + 3 PNG conservados) y brand/vecidya-app-icon.png
    ├── tests/e2e/              33 `.mjs` + 4 `.ps1` (ver TESTING.md); tests/unit/ (7 suites del Diagnóstico + 2 archivos de personas + 1 suite de slug de Business Profile + 2 hooks de resolución TS); integration/ vacío
    ├── docs/                   14 documentos canónicos con los READMEs
    ├── wrangler.jsonc, drizzle.config.ts, react-router.config.ts, vite.config.ts,
    │   tsconfig*.json, better-auth.config.ts, worker-configuration.d.ts (generado)
    └── vecidya-platform.zip    snapshot binario obsoleto versionado (deuda REPO-HYGIENE-001)
```

`legacy/` (ignorado por Git), `archive/` y `resources/` (eliminados del árbol en `ec79b22`) no forman parte de este clon.

`db/schema/auth.ts` contiene **todas** las tablas de negocio y plataforma, no solo las de auth. `server/` no tiene una capa `validation/` ni `permissions/` real: las reglas viven en archivos `*.server.ts` sueltos y en `server/auth/authorization.server.ts`.

## Inventario de rutas

### PUBLIC (15)

| Ruta | Archivo | Datos | Auth | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | `home.tsx` | estático | — | funcional | `px-a` (200/meta/overflow) | sí |
| `/licencias` | `licenses.tsx` | estático | — | funcional local / release ready | `licenses` | sí local; deploy pendiente |
| `/addons` | `addons.tsx` | estático | — | funcional local / release ready | `addons` | sí local; deploy pendiente |
| `/servicios` | `services.tsx` | estático | — | funcional | `px-a` (200/overflow) | sí |
| `/unete` | `join.tsx` | estático | — | funcional | `join-contact` | sí |
| `/contacto` | `contact.tsx` | estático (`mailto`, WhatsApp directo `wa.me` y canal oficial de WhatsApp; sin grupo comunitario desde 2026-09-25) | — | funcional | `px-a`, `join-contact` | sí |
| `/vecindario` | `directory.tsx` | D1 lista+filtros | — | funcional | `px-a`, `pg-c1`, `d1` | sí |
| `/vecindario/:slug` | `public-business-profile.tsx` | D1 perfil+horarios | — | funcional (404 si no publicado/suspendido); UI de `0007`–`0009` desplegada | `px-a`, `c1`, `c2`, `d1`, `pg-c1` | sí (perfil `vecidya`) |
| `/diagnostico` | `diagnostic.tsx` + `features/diagnostic/` | cliente; `?perfil=`, `?objetivo=` (lista cerrada) | — | funcional y publicada (DIAG-003, `0.5.6`); motor con 99 unitarias | `diagnostic`, `unit-diag`, `px-a` (200/overflow) | sí (`0.5.7`, HTTP 2026-09-26T17:51Z) |
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

### CLIENT APP (6)

| Ruta | Archivo | Guarda | Organización | Datos | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/app` | `app.tsx` | `requireSession` + `getActiveOrganization` | activa (revalidada; stale o ajena → 403) | org, perfil, servicios, miembros | funcional | `pe-b`, `px-b` (roto), `authz` | sí |
| `/app/account` | `account.tsx` | `requireSession` + `getActiveOrganization` | activa (stale o ajena → 403) | usuario | funcional (solo nombre) | `acct`, `authz` | sí |
| `/app/organization` | `organization.tsx` | activa + `member:read`; acciones con permiso propio + recurso de la organización (`requireOrganizationMemberTarget`, `requireOrganizationInvitationTarget`); cancelar solo si la invitación sigue pendiente | activa | miembros, invitaciones pendientes vigentes e historial | funcional; UI pulida (INVITE-UI-001, `0.5.4` local) | `team-ui`, `authz`, `invite-flow`, `members` (`TEST-D1-RESET-001`) | sí |
| `/app/invitations/:invitationId` | `invitation.tsx` | pública; detalles solo para el destinatario (`db/invitation-rules.ts`); aceptar lo hace Better Auth con el correo verificado de la sesión | la de la invitación | invitación + organización (D1), Better Auth | funcional: estados controlados 200/403/404/410 (INVITE-001) | `invite-flow`, `invitations`, `authz` | sí |
| `/app/business-profile` | `business-profile.tsx` | `requireOrganization` + `business-profile:read/update/publish` | activa | perfil, horarios | funcional; secciones `0007`/`0008` desplegadas | `bpx`, `c1`, `c2`, `pe-b`, `authz` | sí |
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

### API (9)

| Ruta | Archivo | Métodos | Guarda | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/auth/*` | `api-auth.ts` | todos | Better Auth (público por diseño). Del plugin Organization solo responden por HTTP `create`, `list`, `set-active` y `accept-invitation`; los otros 18 dan 404 (hook `before` en `auth.server.ts`, AUTHZ-BA-001) | funcional | `authz`, `unit-authz`; registro/sesión indirectos | sí (allowlist solo local hasta el próximo deploy) |
| `/api/organizations/:id` | `api-organization.ts` | GET | `requireMembership` | funcional | `authz` | sí |
| `…/authorization` | `api-organization-authorization.ts` | GET, POST | `organization:read`; POST comprueba el permiso pedido | funcional; JSON inválido → 500 | `authz` (matriz 3 roles × 10 permisos) | sí |
| `…/members` | `api-organization-members.ts` | GET; acciones | `member:read`/`member:role:update`/`member:remove` + `requireOrganizationMemberTarget` + Better Auth | funcional | `authz`, `members` (`TEST-D1-RESET-001`) | sí |
| `…/invitations` | `api-organization-invitations.ts` | GET; acciones | `member:invite`; cancelar + `requireOrganizationInvitationTarget` | 503 si no hay correo configurado | `authz`, `invitations` | sí |
| `…/business-profile` | `api-business-profile.ts` | GET, POST | `business-profile:read/update` | funcional; omite reglas de publicación y horarios | `bpx`, `c1`, `c2`, `px-b`, `authz` | sí |
| `…/integrations` | `api-organization-integrations.ts` | GET | solo membresía (cualquier rol, incluye `metadata`) | funcional | `authz` (403 sin membresía), `psa` | sí |
| `/api/platform/organizations/:id/services` | `api-platform-services.ts` | GET, POST | `requirePlatformAdmin` | funcional; org inexistente → 500 FK | `psa`, `authz` (403 para owner/admin/member de la organización) | sí |
| `/api/platform/organizations/:id/integrations` | `api-platform-integrations.ts` | GET, POST | `requirePlatformAdmin` | funcional; duplicado → 500 | `psa` (stale) | sí |
| `/api/platform/organizations/:id/license` | `api-platform-licensing.ts` | GET, POST | `requirePlatformAdmin` | funcional; sin checkout, sin cobro automático (LICENSE-STRATEGY-001) | `platform-licensing` | no (solo local; `0010` sin aplicar a remoto) |

Sin autenticación, las rutas privadas y de API responden **302 → `/login`** (nunca 401).

### SYSTEM (1)

| Ruta | Archivo | Notas | Pub. |
| --- | --- | --- | --- |
| `/__health/db` | `health-db.ts` | Lee solo `platform_meta`; **público**; `environment` fijo en `"LOCAL"`; devuelve 503 en una D1 recién migrada porque nada inserta `platform_meta` | sí (200) |

## Módulos clave

- **Diagnóstico** (`app/features/diagnostic/`, puro, sin React): `types` (dominio), `profiles` (5 perfiles y listas cerradas), `questions` (26 preguntas con propósito, dimensiones, pesos y `applies`), `answers` (selección, exclusivas, cambio de perfil y `deriveActiveAnswers`), `flow` (secciones y progreso), `scoring` (7 dimensiones normalizadas y confianza), `result` (estado, hallazgos, prioridades con dependencias, fortalezas), `recommendations` (licencia por capacidad, servicios, addons, Aprende), `catalog` (referencias reales), `deep-link` (`perfil`/`objetivo`), `contracts` (versiones, IDs cerrados, `Resolution<T>` y conceptos V3; DIAG-V3-01), `mappings` (traducción explícita legacy → V3) e `index` (`runDiagnostic`, `buildContactMailto`). `contracts.typecheck.ts` solo contiene afirmaciones de compilación y no entra en el bundle. `routes/diagnostic.tsx` solo renderiza; `components/public-v2.tsx` genera las puertas de Home con `buildDiagnosticPath`.
- **Autorización**: `server/auth/session.server.ts` (`requireSession`, `getActiveOrganization`, `requireOrganization`, `requireMembership`), `server/auth/authorization.server.ts` (matriz de roles, `requireOrganizationPermission` y las guardas de recurso `requireOrganizationMemberTarget`/`requireOrganizationInvitationTarget`), `server/auth/organization-http-surface.ts` (allowlist HTTP del plugin Organization), `server/platform-authorization.server.ts` (`requirePlatformAdmin`). `requireRole` y `requirePermission` existen sin uso. Frontera completa en [ARCHITECTURE.md](ARCHITECTURE.md).
- **Consultas**: `db/queries/` (perfil, horarios, servicios, integraciones, organizaciones, gobierno y vistas de plataforma). Toda consulta tenant filtra por `organization_id`.
- **UI compartida**: `components/public-v2.tsx` (tarjeta, perfil, JSON-LD, secciones visuales), `components/public-layout.tsx` (shell público, metadatos, navegación), `components/admin-shell.tsx`, `components/ui.tsx`.

## Placeholders sin implementación

`app/features/{admin,auth,billing,business,chat,community,notifications,projects,support}` (solo `features/diagnostic` tiene código), `app/layouts`, `server/{payments,permissions,services,validation}`, `worker/{durable-objects,queues,workflows}`, `tests/integration`. No deben citarse como capacidades.

## Archivos de configuración

- `wrangler.jsonc`: Worker `vecidya-platform`, rutas `vecidya.com/*` y `www.vecidya.com/*`, producción top-level con `APP_ENV=production` y D1 `DB=vecidya-prod`; `env.staging` define `vecidya-platform-staging`, `APP_ENV=staging` y `DB=vecidya-staging`; `secrets.required` (`BETTER_AUTH_SECRET`).
- `react-router.config.ts`: `ssr: true`. `vite.config.ts`: React Router, Tailwind 4 y plugin de Cloudflare. `drizzle.config.ts`: schema `db/schema/index.ts`, salida `db/migrations`, dialecto SQLite.
- `tsconfig.json`, `tsconfig.cloudflare.json`, `tsconfig.node.json`; `pnpm-workspace.yaml` (build de `esbuild`/`workerd`, excepciones de `minimumReleaseAge` para Better Auth).
