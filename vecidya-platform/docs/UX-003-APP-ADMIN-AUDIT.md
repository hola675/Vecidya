# UX-003.0 — APP & ADMIN CURRENT STATE AUDIT

**Fecha:** 2026-09-23
**Estado de entrada:** Vecidya `0.3.0` publicada; código local `0.4.0` por DIAG-002; UX-001 y UX-002 cerradas; OPS-001 documental; GHL pausado.
**Alcance actualizado (2026-09-23):** auditoría y entregas de UI UX-003.1/003.2/003.4/003.5 para Login, inicio y subpáginas del cliente, Home/detalle de Admin. `0.4.0` ya LIVE; los cambios nuevos forman el release candidate `0.4.1`. Sin cambios de permisos, schema, migraciones, GHL ni CRM.

> **Evidencia.** `CODE` = fuente inspeccionada; `TEST` = prueba versionada; `DOC` = documentación no reverificada en este corte. Este informe prioriza `CODE` y `TEST`.

## 1. Executive summary

La superficie privada existe y está separada en dos productos operativos:

- **Client App:** `/app` es un centro de organización, perfil comercial, miembros y servicios de Vecidya. No es CRM y no contiene contactos, oportunidades, pipelines, inbox ni conversaciones.
- **Internal Admin:** `/app/internal*` es una consola de plataforma protegida exclusivamente por `platform_member.role=platform_admin` y `status=active`. Permite consultar organizaciones, negocios, integraciones y auditoría, asignar estados de servicios y gobernar perfiles.

La base técnica de tenancy es sólida en las rutas revisadas: sesión, membresía/permiso y organización activa se comprueban server-side; la autoridad de plataforma es una tabla separada de `member.role`. La principal excepción arquitectónica pendiente es el tráfico `/api/auth/*` entregado directamente a Better Auth, fuera de la matriz propia (`AUTHZ-BA-001`).

La App actual es funcional pero todavía de **portal base**, no de centro completo de relación: cuenta solo permite cambiar nombre, servicios son solo lectura, no existe selección guiada de siguiente acción, el perfil no puede despublicarse y las invitaciones dependen de correo externo. Admin tiene más superficie real de la que comunica su Home: la Home conserva copy de «SIGUIENTE BLOQUE» aunque ya existen rutas de organizaciones, negocios, integraciones y auditoría.

**Conclusión:** el primer trabajo UX-003 debe ser IA y jerarquía de la App, seguido por la densificación operativa del Admin. No se recomienda construir billing, checkout ni capacidades CRM en esta fase.

## 2. Preflight

| Campo | Resultado |
| --- | --- |
| Branch | `main` |
| HEAD | `732d6c2be8277537af12d35f1baddfdba63945d5` |
| Ahead/behind | `0 / 0` respecto a `origin/main` |
| Working tree | Modificado antes de esta auditoría; contiene cambios de la release/DIAG/OPS previos y archivos no rastreados. Este informe no los altera. |
| Git mutado | No |
| Producción / remoto | No tocados |
| Versión | Impacto `NONE`; producción pública `0.3.0`, fuente local `0.4.0` |

## 3. Route inventory

### 3.1 Client App

| Route | Purpose | User type | Auth / role | Data source | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/app` | Dashboard, organización activa, resumen de perfil/servicios/miembros, crear organización, logout | Cualquier usuario autenticado | `requireSession`; puede no tener organización | `user`, `organization`, `member`, `business_profile`, `organization_service` | **ACTIVE / PARTIAL** | Es la única ruta con shell App; después del login se fija la primera organización válida. |
| `/app/account` | Nombre y datos básicos de cuenta | Usuario autenticado | `requireSession` | Better Auth `user`/`session` | **ACTIVE / PARTIAL** | Email, contraseña, MFA y eliminación son texto pendiente. |
| `/app/organization` | Miembros, roles, invitaciones | Owner/admin/member | `member:read`; mutaciones por permiso | `member`, `invitation`, Better Auth Organization | **ACTIVE / PARTIAL** | Delivery de invitaciones bloqueada sin correo transaccional configurado; test principal stale. |
| `/app/business-profile` | Editar, guardar y publicar perfil; contacto, redes, modalidad, cobertura y horarios | Owner/admin editan; member consulta | `requireOrganization` + permisos `business-profile:*` | `business_profile`, `business_hours`, `business_profile_governance` | **ACTIVE** | No existe despublicar; suspensión platform se muestra como solo lectura. |
| `/app/services` | Servicios asignados y estado | Miembro de organización activa | `requireSession` + organización activa | `organization_service`, `service_catalog` | **ACTIVE / PARTIAL** | Solo lectura; no compra, solicita ni cambia licencia. |
| `/app/invitations/:invitationId` | Aceptar invitación | Usuario autenticado invitado | `requireSession`; Better Auth valida email/verificación | `invitation`, `member`, `user` | **PARTIAL / BLOCKED** | Aceptación real depende de verificación y delivery Gmail (`INVITE-001`). |

### 3.2 Internal Admin

Todas las rutas siguientes usan `requirePlatformAdmin`, que exige sesión y fila `platform_member` activa con rol `platform_admin` (`CODE`).

| Route | Purpose | User type | Auth / role | Data source | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/app/internal` | Entrada y accesos operativos | Platform admin | `requirePlatformAdmin` | Sin datos; tarjetas estáticas | **ACTIVE / DUPLICATED COPY** | Comunica organizaciones/negocios/integraciones como «siguiente bloque», aunque las rutas ya existen. |
| `/app/internal/services` | Asignar servicio y cambiar estado por organización | Platform admin | `requirePlatformAdmin` | `organization`, `service_catalog`, `organization_service` | **ACTIVE / PARTIAL** | Mutación real; no auditoría ni timestamps `activated_at`/`ended_at`. |
| `/app/internal/organizations` | Listado global y métricas resumidas | Platform admin | `requirePlatformAdmin` | `organization`, owner `user`, perfil, servicios, integraciones | **ACTIVE** | Sin filtros, paginación ni acciones. |
| `/app/internal/organizations/:organizationId` | Detalle read-only de organización | Platform admin | `requirePlatformAdmin` | organización, miembros, perfil, servicios, integraciones | **ACTIVE** | Consulta global; enlaces a operaciones existentes. |
| `/app/internal/businesses` | Listado global de Business Profiles | Platform admin | `requirePlatformAdmin` | `business_profile`, governance, servicios | **ACTIVE** | Draft/published, completitud y badges; read-only. |
| `/app/internal/businesses/:businessProfileId` | Detalle y gobierno del perfil | Platform admin | `requirePlatformAdmin` | perfil, governance, servicios, `platform_audit_log` | **ACTIVE / PARTIAL** | Verificar, retirar verificación, suspender y reactivar. No muestra todos los campos de contacto/presencia/operación. |
| `/app/internal/integrations` | Overview de conexiones genéricas | Platform admin | `requirePlatformAdmin` | `integration_connection`, organización | **ACTIVE / FOUNDATION ONLY** | Read-only; no conecta proveedor ni modifica datos. |
| `/app/internal/audit` | Últimas acciones de gobierno | Platform admin | `requirePlatformAdmin` | `platform_audit_log` | **ACTIVE / PARTIAL** | Máximo 200; audita gobierno de perfiles, no servicios ni integraciones. |

### 3.3 API privada relevante

`/api/organizations/:id`, `authorization`, `members`, `invitations`, `business-profile` e `integrations` usan sesión y membresía/permiso según operación. Las APIs `/api/platform/organizations/:id/services` e `/integrations` usan `requirePlatformAdmin`. `/api/auth/*` queda bajo Better Auth por diseño actual, pero no pasa por la matriz propia: es una brecha de reconciliación de autorización, no una capacidad UX.

Sin sesión, las rutas privadas y APIs responden `302 → /login`, no `401` (`CODE`, `STRUCTURE.md`).

## 4. Role model

| Modelo | Fuente real | Capacidades observadas | Acceso no autorizado |
| --- | --- | --- | --- |
| **Platform admin** | `platform_member.role=platform_admin` y `status=active` | Admin global, asignaciones de servicios, lectura cross-organization, gobierno de perfiles y auditoría | `403`; no se deriva de `member.role`. |
| **Organization owner** | `member.role=owner` por organización | Todos los permisos propios: organización, miembros, perfil, publicación; no plataforma | `403` en rutas/API sin permiso; Better Auth Organization conserva endpoints propios. |
| **Organization admin** | `member.role=admin` por organización | Igual que owner salvo eliminar organización | `403` en acciones no permitidas. |
| **Organization member** | `member.role=member` por organización | Lectura de organización, miembros y perfil; no mutación de perfil/roles/invitaciones | `403` en mutaciones. |
| **Normal authenticated user** | Sesión sin membresía activa | `/app`, cuenta y creación de organización; `/app` muestra estado sin organización | `/app/organization` y `/app/business-profile` requieren organización y fallan `403`. |
| **Anonymous** | Sin sesión | Superficie pública y auth | Redirect a `/login` para privado. |

La organización activa (`session.active_organization_id`) es contexto, no ownership. Un usuario puede tener varias organizaciones y roles distintos en cada una. El login fija la primera membresía válida; el selector permite cambiarla (`CODE`, `TEST pe-b/px-b`).

## 5. Client App current state

### Entrada y estados

- Usuario con organización: recibe saludo, rol, organización activa, estado del perfil, completitud, servicios y número de miembros.
- Usuario sin organización: recibe un estado vacío y formulario para crear la primera organización.
- Usuario con organización sin perfil: CTA «Crear perfil».
- Perfil borrador: CTA «Editar perfil» y porcentaje/pendientes.
- Perfil publicado: CTA «Ver página pública».
- Owner/admin/member: la navegación es igual; las restricciones aparecen dentro de las páginas. La ruta de perfil sí distingue edición frente a consulta.
- Logout: `authClient.signOut()` y navegación a `/login`.
- Sesión expirada: los loaders vuelven a redirigir a `/login`; no hay estado específico de sesión expirada.

### Módulos existentes

| Módulo actual | Clasificación | Evidencia |
| --- | --- | --- |
| Inicio / overview | **USEFUL / NEEDS REWORK** | Resumen correcto, pero mezcla onboarding, estado y gestión en una sola página. |
| Mi cuenta | **USEFUL / PARTIAL** | Solo nombre editable; capacidades restantes declaradas fuera de fase. |
| Mi negocio | **USEFUL / ACTIVE** | Editor amplio y publicación; necesita mejor orientación y control de ciclo de vida. |
| Mi organización | **USEFUL / PARTIAL** | Miembros/roles/invitaciones; dependencia de correo y test stale. |
| Servicios | **USEFUL / READ-ONLY** | Lista asignaciones; no es billing ni catálogo comercial. |
| Integraciones | **NOT PRESENTE EN UI CLIENTE** | Solo existe API de lectura tenant y overview interno. No debe inventarse un módulo de proveedor. |
| Billing / checkout / addons | **NOT IMPLEMENTED** | No hay tablas, rutas ni pagos. |
| Diagnóstico | **PUBLIC, no App** | `/diagnostico` es anónimo y efímero; no persiste resultados. |

### Problemas de propósito

1. La App no tiene un «siguiente paso» único contextual: el usuario ve varias cards equivalentes.
2. Organización, perfil y servicios están separados por rutas hermanas sin shell compartido; todas usan enlace «Volver» a `/app`.
3. No hay navegación de App hacia Admin, correctamente por frontera de responsabilidad.
4. El portal comunica servicios asociados, no licencias, facturación ni compras, coherente con el alcance actual pero incompleto como experiencia futura.
5. La copia «presencia digital para negocios locales» queda más estrecha que el modelo de organización/múltiples perfiles que soporta el código; requiere decisión editorial, no cambio automático.

## 6. Admin current state

Admin puede encontrar organizaciones, negocios, servicios, integraciones y auditoría mediante navegación lateral. Puede:

- consultar organizaciones, owner, miembros, perfil, servicios e integraciones;
- consultar drafts y publicados con completitud;
- verificar/retirar verificación, suspender/reactivar perfiles;
- asignar estados de servicios por organización;
- consultar las últimas 200 acciones de gobierno.

Admin **no puede** hoy listar o gestionar usuarios globales, transferir ownership, editar perfiles tenant, suspender organizaciones, gestionar catálogo, conceder/revocar `platform_admin` por UI, actualizar/eliminar integraciones, registrar motivo de suspensión, gestionar apelaciones ni enviar moderación.

### Densidad operativa

La CSS usa grids y cards densas en listados, badges de estado y layouts de dos/cuatro columnas que colapsan en móvil. Sin embargo:

- `/app/internal/services` renderiza una card completa por organización y repite el catálogo en cada card; escala mal con muchas organizaciones.
- Organizaciones, negocios e integraciones no tienen filtros, búsqueda ni paginación.
- Auditoría es una lista de 200 entradas sin filtros, cursor o exportación.
- La Home admin mantiene cuatro tarjetas grandes de marketing/roadmap en vez de KPIs o cola operativa.
- El detalle de negocio omite teléfono, email público, web, WhatsApp, redes, modalidad y horarios, justo los datos que una revisión operativa necesita (`ADMIN-UI-001`).

Esto confirma que el Admin debe evolucionar hacia una consola de información, estado, filtros y acciones, no hacia una réplica de la web pública.

## 7. App/Admin responsibility matrix

| Action | Client | Org admin/owner | Platform admin |
| --- | --- | --- | --- |
| Edit own business profile | Owner/admin; member read-only | Sí, tenant-scoped | No edición tenant implementada |
| Manage own team | No | Owner/admin | No UI global |
| Publish profile | Owner/admin, campos mínimos | Sí, dentro de su organización | Gobierno separado; no publica en nombre del tenant |
| Unpublish profile | No | No implementado | No implementado; suspensión no equivale a despublicar |
| Change license | No | No implementado | No catálogo/licencias implementado |
| View assigned services | Sí, solo lectura | Sí, solo lectura | Sí; puede asignar/cambiar estado |
| Manage another organization | No | No | Lectura global; acciones limitadas a servicios/gobierno |
| Suspend business profile | No | No | Sí, con auditoría |
| Platform moderation | No | No | Verificar/suspender/reactivar perfil |
| Internal support | Contacto externo; no inbox | No | No sistema de soporte; lectura operativa limitada |
| CRM contacts/opportunities/conversations | No | No | **Fuera de Vecidya; futuro GHL** |

## 8. Business profile lifecycle

```text
User autenticado
  → crea Organization (Better Auth; creador = owner)
  → owner/admin guarda Business Profile
  → status = draft
  → validación mínima (display_name, slug, short_description, category)
  → owner/admin publica
  → status = published
  → Vecindario /vecindario/:slug y sitemap lo consumen
  → platform_admin puede verificar o suspender
```

- Creación: la App usa `authClient.organization.create`; el primer miembro es owner (`CODE`).
- Perfil: `saveBusinessProfileForOrganization` crea o actualiza el único perfil de la organización.
- Publicación: `publishBusinessProfileForOrganization` solo después de validación; un perfil publicado no puede guardarse incompleto.
- Despublicación: no existe acción tenant ni admin de «unpublish». Suspender oculta el perfil públicamente, pero es una acción de gobierno distinta.
- Verificación/suspensión: solo `platform_admin`, en tablas `business_profile_governance` y `platform_audit_log`, en batch atómico.
- Source of truth: `business_profile` + `business_hours` para contenido/operación; `business_profile_governance` para estado platform; consultas públicas filtran `published` y no suspendido.

## 9. Services / licenses / addons / subscriptions

| Element | App | Admin | Clasificación |
| --- | --- | --- | --- |
| `service_catalog` | Lectura indirecta vía asignaciones | Listado y asignación de 3 servicios | **IMPLEMENTED / PARTIAL**; no auditoría ni lifecycle timestamps confiables |
| `organization_service` | Lectura de estado | Upsert de estado `pending/active/suspended/ended` | **IMPLEMENTED / PARTIAL** |
| Licencias Cuadra/Barrio/Ciudad | No | No | **NOT IMPLEMENTED internamente**; existen como experiencia/documentación pública |
| Addons | No | No | **NOT IMPLEMENTED** |
| Subscriptions / billing / checkout / Stripe | No | No | **NOT IMPLEMENTED** |

El catálogo UX-002 no debe confundirse con gestión operativa existente. No se debe construir billing en UX-003.

## 10. Data / source-of-truth map

| Feature | D1 table(s) | Server logic | UI | Role check |
| --- | --- | --- | --- | --- |
| Identity/session | `user`, `session`, `account`, `verification` | Better Auth, `requireSession` | Login, account, app | Session |
| Organizations | `organization`, `member` | Better Auth + `organization.server.ts` | `/app`, `/app/organization` | Session + membership/role; `/api/auth/*` follow-up |
| Memberships/invitations | `member`, `invitation` | Better Auth + organization route/API | `/app/organization`, invitation route | `member:read/invite/remove/role:update` |
| Active organization | `session.active_organization_id` + membership lookup | `getActiveOrganization`, `requireOrganization` | Switcher de `/app` | Session + verified membership |
| Business Profile | `business_profile` | profile queries + validation | `/app/business-profile`, public profile | `business-profile:read/update/publish` |
| Hours | `business_hours` | business-hours queries/rules | Profile editor/public profile | Profile update permission |
| Platform governance | `business_profile_governance`, `platform_audit_log` | governance queries + `applyGovernanceAction` | Admin business detail/audit | `requirePlatformAdmin` |
| Services | `service_catalog`, `organization_service` | organization-services queries; internal action | App services/admin services | Session/membership for client; platform admin for writes |
| Integrations metadata | `integration_connection` | integration queries/API | Internal overview; tenant API | Membership for tenant read; platform admin for platform writes |
| Platform authority | `platform_member` | `requirePlatformAdmin` | No management UI | Active `platform_admin` only |

No tables or schema were changed by this audit.

## 11. Current tests

| Area | Classification | Evidence |
| --- | --- | --- |
| App shell/dashboard, login, multi-org, tenant isolation | **CURRENT / RAN** | `px-b` is documented as covering login, `/app`, selector, isolation and responsive; `pe-b` PASS. |
| Business Profile editor/public lifecycle | **CURRENT / RAN** | `bpx`, `c1`, `c2`, `pg-c1`, `d1`. |
| Account | **CURRENT / RAN** | `acct` PASS; scope only name update. |
| Organization members | **STALE / PARTIAL** | `organization-members-check.mjs` exists but documented as stale in current baseline; matrix is still represented in code. |
| Invitations | **STALE / PARTIAL / BLOCKED** | `organization-invitations-check.mjs` validates guards and fixture path; Gmail delivery/complete acceptance not proven. |
| Admin shell and business governance | **CURRENT / RAN** | `admin-shell`, `admin-bp`, `d1` PASS. |
| Admin organizations | **STALE** | `admin-orgs` exists but current docs classify it stale/non-executable. |
| Admin integrations | **STALE** | `admin-int` exists but no current executable coverage. |
| Admin services | **STALE / PARTIAL** | `psa` covers historical path but is stale; writes lack audit coverage. |
| Accessibility | **PARTIAL** | Native controls, focus and responsive checks exist for App/profile/public; no axe audit and no equivalent dedicated Admin audit. |
| Negative auth/session expiry | **MISSING** | No dedicated invalid credentials, session expiry, logout regression, or full API authorization suite. |
| Billing/licensing | **NOT APPLICABLE / NOT IMPLEMENTED** | No routes, schema or tests. |

## 12. UX findings

### P1

1. **Admin Home is stale relative to real capability.** It labels organizations, businesses and integrations as future while navigation and routes are active. This damages trust and hides operations. Evidence: `internal.tsx`, `admin-shell.tsx`.
2. **Admin does not expose enough operational context in business detail.** Contact/presence/operations are absent before verification; an operator cannot review the full public surface from one place. Evidence: `internal-business-profile-detail.tsx`, `ADMIN-UI-001`.
3. **Services admin scales as repeated cards, not an operational table.** No filtering/search/pagination; each organization repeats all catalog services. Evidence: `internal-services.tsx`.
4. **Client next action is ambiguous.** Overview presents profile, services, organization and setup cards with equal visual weight. There is no contextual task state beyond completion percentage.
5. **Organization invitations are not a reliable completed journey.** UI exists, but delivery and acceptance are externally blocked; copy correctly discloses this but the flow is not production-complete.

### P2

1. Client subroutes are sibling pages without a shared shell; the back-link pattern increases navigation cost.
2. App role labels expose raw `owner/admin/member` strings instead of localized operational language.
3. Organization and integration list views are card-heavy and lack filters; appropriate for current tiny data, not future platform operations.
4. Audit list is readable but lacks filters, actor/action/date context controls and pagination.
5. The client brand copy is narrower than the multi-organization model and should be reconciled before IA work.

## 13. Accessibility findings

**Positive evidence (`CODE`/`TEST`):** skip link in App; native labels/inputs; `aria-current` in navigation; `role=status`/`role=alert` for feedback; progressbar semantics in profile; responsive CSS at 760/430px; App/profile E2E responsive paths at 1366/390/360; focus/keyboard coverage in existing client/public scripts.

**Gaps:** no automated axe pass; Admin has no dedicated keyboard/focus/landmark regression; admin navigation becomes a wrapped horizontal list on mobile rather than a compact disclosure; long lists and dense service controls need an explicit 360/390 audit; error recovery for expired sessions is not surfaced as a focused message. These are audit findings, not claims that every current page fails.

## 14. Security / tenancy findings

### PASS evidence

- `requireSession`, `getActiveOrganization`, `requireMembership` and `requireOrganizationPermission` execute server-side.
- Tenant queries use `organization_id`; URL organization IDs are checked against membership.
- Platform authority is independent (`platform_member`) and inactive admins receive `403`.
- Governance actions follow session → platform guard → resource lookup → mutation → audit batch.
- Existing E2E verifies cross-tenant profile/service isolation and platform-admin boundary.

### P1 / P2 follow-up

- **P1 `AUTHZ-BA-001`:** Better Auth default Organization endpoints under `/api/auth/*` do not pass through the project matrix. Confirm and constrain owner create/update/delete semantics before expanding App organization UX.
- **P1 `INVITE-001`:** invitation delivery and verified acceptance remain blocked by external email configuration.
- **P2 `AUDIT-COVERAGE-001`:** service assignment and integration creation are not in `platform_audit_log`; `activated_at`/`ended_at` are not written.
- **P2 `PLATFORM-ADMIN-001`:** no permanent UI/API workflow exists to manage `platform_member` authority.
- No P0 was found in this read-only audit. This is not a penetration test.

## 15. Technical debt

- Stale tests and inconsistent current documentation around 8B/8D/8E/7B.1/7B.2.
- Admin Home copy and historical phase labels not reconciled with active routes.
- No scale primitives (search, filters, pagination, bulk context) for Admin.
- No profile unpublish action or suspension reason.
- No complete account security settings UX.
- Organization UI contains a documented `organization.userId` comparison defect and offers `owner` in a role selector that may conflict with Better Auth policy; needs dedicated verification before redesign (`ORG-UI-001`).
- Integrations are metadata foundation only; no provider client, credentials or GHL integration exists.

## 16. Recommended UX-003 phases

1. **UX-003.1 — Client App Information Architecture**: reconcile App shell, route hierarchy, role-aware navigation, empty/first-run states and next-action model. No billing or CRM.
2. **UX-003.2 — Client Dashboard & Business Experience**: make profile lifecycle, completeness, publication and public preview the primary customer journey; decide unpublish separately.
3. **UX-003.3 — Organization / Team Experience**: stabilize role language, member controls, invitation states and multi-organization context after `AUTHZ-BA-001`/`INVITE-001` decisions.
4. **UX-003.4 — Internal Admin Operations**: replace stale Home copy with operational overview; define filters, density, status and navigation patterns.
5. **UX-003.5 — Admin Business Management**: expose the full review context (contact/presence/operations), governance reasons and safe lifecycle actions without editing tenant data.
6. **UX-003.6 — Settings / Integrations Readiness**: only after explicit provider decisions; metadata-only and tenant-scoped, never CRM duplication. Billing remains a separate authorized phase.
7. **UX-003.7 — App & Admin QA**: current tests, auth-negative coverage, axe/accessibility review, 1366/768/390/360 responsive checks, tenant matrix and local runtime validation.

## 17. Out of scope and version

- GHL, CRM, contacts, opportunities, conversations, pipelines, billing, checkout, Stripe, migrations and public redesign: **not touched**.
- No authorization matrices, tenant guards, data writes or provider connections changed.
- Version `0.4.0` (DIAG-002B + UX-003.1/003.4) was already deployed to staging/production. New Client subnavigation and Admin review context are `0.4.1`, awaiting release.

## 18. Validation and first implementation

- `pnpm run typecheck`: PASS after Login, App and Admin UI changes.
- `pnpm run build`: PASS; local Cloudflare build reports that optional Gmail OAuth secrets are not configured, unrelated to this UI work.
- Local Worker HTTP: `/login`, CSS bundle and existing discovery illustration all returned `200`; server-rendered Login includes the new layout and heading.
- Integrated browser discovery returned no available browser. No authenticated visual session was possible; App/Admin visual conclusions are limited to source, responsive CSS and build output.
- Authenticated E2E scripts were not run because available Admin E2E scripts create persistent local D1 fixtures and the local database has documented cleanup debt. No DB data was modified.
- `git diff --check`: PASS.
- UX changes use current SVG markup and versioned illustrations; no dependency, new binary asset, schema, migration, secret, push or deploy was added.

## 19. Final report

| Item | Result |
| --- | --- |
| Status | **UX-003.0 audit retained; UX-003.1/003.2/003.4/003.5 UI deliveries — PASS build/typecheck, authenticated visual review pending** |
| Routes | 6 Client App routes + 8 Internal Admin routes, plus private API surface inventoried |
| Roles | Platform admin, owner, admin, member, authenticated user without org, anonymous reconciled |
| Client App | Dashboard hierarchy, translated role labels, accessible completion progress and shared navigation across account/organization/profile/services implemented |
| Admin | Home links to active operations; business detail exposes stored public contact, presence and hours as read-only review context; list density/filter work remains pending |
| Business lifecycle | Organization → draft profile → validated publish → public Vecindario; suspension separate; unpublish absent |
| Source of truth | D1 tables and server queries mapped; no schema changes |
| Security | Tenant guards present; `AUTHZ-BA-001` remains P1 follow-up |
| UX findings | P1: stale Admin Home, missing admin context, scale model, ambiguous client next action, invitation incompleteness; P2: shell, labels, filters, audit ergonomics |
| Accessibility | Good native foundations; missing axe/Admin dedicated coverage |
| Tests | Current, stale, partial and missing coverage classified |
| P0 | None found in this read-only audit |
| P1 | `AUTHZ-BA-001`, `INVITE-001`, Admin Home/detail/scale, Client IA |
| P2 | Audit coverage, platform-admin management, labels, filters, shell and a11y depth |
| Recommended phases | UX-003.1 through UX-003.7 as above |
| Git | `main`, HEAD `732d6c2`, 0/0, pre-existing dirty tree; no Git mutation |
| Version | `0.3.0` public; version impact `NONE` |
