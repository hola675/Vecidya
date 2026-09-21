# Estructura del código

Última reconciliación: 2026-09-20 (Baseline 2026-09-20). Rutas verificadas contra `app/routes.ts`: **39 rutas, 39 archivos, ninguno huérfano ni faltante**. Columna *Pub.*: comprobación HTTP anónima 2026-09-20 (`sí` = responde como se espera; para rutas privadas, `sí` = existe y redirige a `/login`; `no` = no está en el Worker público). Abreviaturas de pruebas: ver [TESTING.md](TESTING.md).

## Mapa del repositorio

```text
D:\Proyectos\Vecidya            (raíz Git)
├── AGENTS.md, README.md
└── vecidya-platform/           (único producto activo)
    ├── app/                    interfaz React Router
    │   ├── routes.ts           tabla de 39 rutas
    │   ├── routes/             39 archivos (uno por ruta)
    │   ├── components/         public-layout, public-v2, admin-shell, ui
    │   ├── assets/public-assets.ts   manifiesto de assets públicos
    │   ├── lib/auth-client.ts  cliente Better Auth
    │   ├── root.tsx, entry.server.tsx, app.css (Tailwind 4 + estilos propios)
    │   ├── features/*          9 carpetas solo con .gitkeep (placeholders)
    │   └── layouts/            solo .gitkeep
    ├── server/                 lógica exclusiva del servidor
    │   ├── auth.server.ts, auth-plugins.server.ts   Better Auth + plugin Organization
    │   ├── auth/session.server.ts, auth/authorization.server.ts
    │   ├── platform-authorization.server.ts          requirePlatformAdmin
    │   ├── business-profile-validation.server.ts, integration-connection-validation.server.ts
    │   ├── email/invitation.server.ts                adaptador Resend
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
    ├── tests/e2e/              28 archivos (ver TESTING.md); unit/ e integration/ vacíos
    ├── docs/                   13 documentos canónicos con los READMEs
    ├── wrangler.jsonc, drizzle.config.ts, react-router.config.ts, vite.config.ts,
    │   tsconfig*.json, better-auth.config.ts, worker-configuration.d.ts (generado)
    └── vecidya-platform.zip    snapshot binario obsoleto versionado (deuda REPO-HYGIENE-001)
```

`legacy/` (ignorado por Git), `archive/` y `resources/` (eliminados del árbol en `ec79b22`) no forman parte de este clon.

`db/schema/auth.ts` contiene **todas** las tablas de negocio y plataforma, no solo las de auth. `server/` no tiene una capa `validation/` ni `permissions/` real: las reglas viven en archivos `*.server.ts` sueltos y en `server/auth/authorization.server.ts`.

## Inventario de rutas

### PUBLIC (13)

| Ruta | Archivo | Datos | Auth | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | `home.tsx` | estático | — | funcional | `px-a` (200/meta/overflow) | sí |
| `/servicios` | `services.tsx` | estático | — | funcional | `px-a` (200/overflow) | sí |
| `/unete` | `join.tsx` | estático | — | funcional | ninguno local (solo remoto) | sí |
| `/contacto` | `contact.tsx` | estático (`mailto`) | — | funcional | `px-a` | sí |
| `/vecindario` | `directory.tsx` | D1 lista+filtros | — | funcional | `px-a`, `pg-c1`, `d1` | sí |
| `/vecindario/:slug` | `public-business-profile.tsx` | D1 perfil+horarios | — | funcional (404 si no publicado/suspendido); UI de `0007`–`0009` desplegada | `px-a`, `c1`, `c2`, `d1`, `pg-c1` | sí (perfil `vecidya`) |
| `/diagnostico` | `diagnostic.tsx` | cliente | — | funcional; motor sin pruebas | `px-a` (solo 200/overflow) | sí |
| `/sobre-nosotros` | `about.tsx` | estático | — | funcional | ninguno | sí |
| `/que-debes-saber` | `knowledge.tsx` | estático | — | hub vacío | ninguno | sí |
| `/privacidad` | `privacy.tsx` | estático | — | funcional | ninguno | sí |
| `/robots.txt` | `robots.ts` | estático | — | funcional | ninguno | sí |
| `/sitemap.xml` | `sitemap.ts` | D1 (publicados no suspendidos) | — | funcional | ninguno | sí (10 URLs) |
| `/favicon.ico` | `favicon.ts` | redirect 302 → `/brand/vecidya-app-icon.png` | — | funcional | ninguno | sí |

### AUTH (2)

| Ruta | Archivo | Auth | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- |
| `/login` | `login.tsx` | ninguna (no redirige si ya hay sesión) | funcional | UI en `c2`; API remota | sí |
| `/register` | `register.tsx` | ninguna | funcional; sin enlaces desde la web pública | UI solo en `.ps1` obsoletos; registro por API en 17 scripts | sí |

### CLIENT APP (6)

| Ruta | Archivo | Guarda | Organización | Datos | Estado | E2E | Pub. |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/app` | `app.tsx` | `requireSession` + `getActiveOrganization` | activa (revalidada) | org, perfil, servicios, miembros | funcional; org activa nula tras login | `pe-b`, `px-b` (roto) | sí |
| `/app/account` | `account.tsx` | `requireSession` | — | usuario | funcional (solo nombre) | `acct` | sí |
| `/app/organization` | `organization.tsx` | activa + `member:read`; acciones con permisos propios | activa | miembros, invitaciones | funcional; invitar depende de Resend | `members` (stale) | sí |
| `/app/invitations/:invitationId` | `invitation.tsx` | `requireSession` | la de la invitación | Better Auth | bloqueada (verificación de email) | `invitations` (stale) | sí |
| `/app/business-profile` | `business-profile.tsx` | `requireOrganization` + `business-profile:read/update/publish` | activa | perfil, horarios | funcional; secciones `0007`/`0008` desplegadas | `bpx`, `c1`, `c2`, `pe-b` | sí |
| `/app/services` | `services-app.tsx` | `requireSession` + `getActiveOrganization` | activa | `organization_service` | funcional (solo lectura) | `services-exp`, `pe-b` | sí |

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
| `/api/auth/*` | `api-auth.ts` | todos | Better Auth (público por diseño) | funcional; expone endpoints por defecto de Better Auth | indirecto | sí |
| `/api/organizations/:id` | `api-organization.ts` | GET | `requireMembership` | funcional | ninguno | sí |
| `…/authorization` | `api-organization-authorization.ts` | GET, POST | `organization:read` | funcional; JSON inválido → 500 | ninguno | sí |
| `…/members` | `api-organization-members.ts` | GET; acciones | `member:read`/`member:role:update`/`member:remove` + Better Auth | funcional | `members` (stale) | sí |
| `…/invitations` | `api-organization-invitations.ts` | GET; acciones | `member:invite` | 503 si no hay correo configurado | `invitations` (stale) | sí |
| `…/business-profile` | `api-business-profile.ts` | GET, POST | `business-profile:read/update` | funcional; omite reglas de publicación y horarios | `bpx`, `c1`, `c2`, `px-b` | sí |
| `…/integrations` | `api-organization-integrations.ts` | GET | solo membresía (cualquier rol, incluye `metadata`) | funcional | `psa` (stale) | sí |
| `/api/platform/organizations/:id/services` | `api-platform-services.ts` | GET, POST | `requirePlatformAdmin` | funcional; org inexistente → 500 FK | `psa` (stale) | sí |
| `/api/platform/organizations/:id/integrations` | `api-platform-integrations.ts` | GET, POST | `requirePlatformAdmin` | funcional; duplicado → 500 | `psa` (stale) | sí |

Sin autenticación, las rutas privadas y de API responden **302 → `/login`** (nunca 401).

### SYSTEM (1)

| Ruta | Archivo | Notas | Pub. |
| --- | --- | --- | --- |
| `/__health/db` | `health-db.ts` | Lee solo `platform_meta`; **público**; `environment` fijo en `"LOCAL"`; devuelve 503 en una D1 recién migrada porque nada inserta `platform_meta` | sí (200) |

## Módulos clave

- **Autorización**: `server/auth/session.server.ts` (`requireSession`, `getActiveOrganization`, `requireOrganization`, `requireMembership`), `server/auth/authorization.server.ts` (matriz de roles y `requireOrganizationPermission`), `server/platform-authorization.server.ts` (`requirePlatformAdmin`). `requireRole` y `requirePermission` existen sin uso.
- **Consultas**: `db/queries/` (perfil, horarios, servicios, integraciones, organizaciones, gobierno y vistas de plataforma). Toda consulta tenant filtra por `organization_id`.
- **UI compartida**: `components/public-v2.tsx` (tarjeta, perfil, JSON-LD, secciones visuales), `components/public-layout.tsx` (shell público, metadatos, navegación), `components/admin-shell.tsx`, `components/ui.tsx`.

## Placeholders sin implementación

`app/features/{admin,auth,billing,business,chat,community,notifications,projects,support}`, `app/layouts`, `server/{payments,permissions,services,validation}`, `worker/{durable-objects,queues,workflows}`, `tests/unit`, `tests/integration`. No deben citarse como capacidades.

## Archivos de configuración

- `wrangler.jsonc`: Worker `vecidya-platform`, rutas `vecidya.com/*` y `www.vecidya.com/*`, producción top-level con `APP_ENV=production` y D1 `DB=vecidya-prod`; `env.staging` define `vecidya-platform-staging`, `APP_ENV=staging` y `DB=vecidya-staging`; `secrets.required` (`BETTER_AUTH_SECRET`).
- `react-router.config.ts`: `ssr: true`. `vite.config.ts`: React Router, Tailwind 4 y plugin de Cloudflare. `drizzle.config.ts`: schema `db/schema/index.ts`, salida `db/migrations`, dialecto SQLite.
- `tsconfig.json`, `tsconfig.cloudflare.json`, `tsconfig.node.json`; `pnpm-workspace.yaml` (build de `esbuild`/`workerd`, excepciones de `minimumReleaseAge` para Better Auth).
