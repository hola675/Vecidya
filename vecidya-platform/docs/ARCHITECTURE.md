# Arquitectura de Vecidya

Última reconciliación: 2026-09-21 (PROD-001 pre-cutover). Describe decisiones y fronteras **vigentes**; lo futuro está marcado `FUTURE` y no debe leerse como implementado.

## Arquitectura actual

Vecidya Platform es una aplicación SSR de React Router ejecutada en Cloudflare Worker (`workers/app.ts`). Better Auth usa Drizzle sobre D1 (binding `DB`). La configuración separa producción (`vecidya-platform` + `vecidya-prod`) de staging (`vecidya-platform-staging` + `vecidya-staging`); el cutover público todavía no se ha desplegado.

```text
Browser
  ↓
Worker (workers/app.ts: redirect www → apex, contexto Cloudflare)
  ↓
React Router SSR (loaders/actions, 39 rutas)
  ↓
Better Auth + helpers de servidor (server/)
  ↓
Drizzle ORM (db/queries/)
  ↓
Cloudflare D1 (producción: vecidya-prod; staging: vecidya-staging)
```

## Fronteras de seguridad

- Las rutas privadas requieren sesión. Sin sesión, páginas **y APIs** responden **302 → `/login`** (nunca 401).
- Todo recurso con `organizationId` requiere membresía verificada; el `organizationId` de la URL nunca se confía sin comprobar `member`, y la organización de sesión se revalida contra `member` en cada request.
- Las operaciones tenant-scoped requieren un permiso de la matriz propia, salvo lecturas que solo exigen membresía (`GET /api/organizations/:id`, `…/integrations`, `/app`, `/app/services`).
- La administración interna usa `platform_member` (rol `platform_admin` y estado `active`); no deriva autoridad de `member.role`. `staff` existe en el schema pero no otorga ninguna capacidad.
- Un owner/admin/member de organización no obtiene privilegios de plataforma por ese rol.

### Helpers de autorización

| Helper | Comprueba | Fallo |
| --- | --- | --- |
| `requireSession` | sesión de Better Auth | redirect 302 |
| `getActiveOrganization` | sesión + membresía de `session.active_organization_id` | `null` si no hay; 403 si la membresía ya no existe |
| `requireOrganization` | organización activa no nula | 403 |
| `requireMembership` | sesión + fila `member` para `(usuario, organización de la URL)` | 403 (igual exista o no la organización: sin oráculo de existencia) |
| `requireOrganizationPermission` | membresía + permiso del rol | 403 |
| `requirePlatformAdmin` | fila `platform_member` activa con rol `platform_admin` | 403 |

`requireRole` y `requirePermission` existen sin uso.

### Matriz de roles (`server/auth/authorization.server.ts`)

| Rol | Permisos |
| --- | --- |
| `owner` | los diez: `organization:read/update/delete`, `member:read/invite/remove/role:update`, `business-profile:read/update/publish` |
| `admin` | todos menos `organization:delete` |
| `member` | `organization:read`, `member:read`, `business-profile:read` |

`organization:update` y `organization:delete` están declarados pero ninguna ruta propia los consume.

### Dos sistemas de autorización en paralelo

`/api/auth/*` entrega todo el tráfico a Better Auth (`api-auth.ts`). Los endpoints por defecto del plugin Organization (`/api/auth/organization/*`: crear, actualizar, eliminar organización; invitar, quitar, cambiar rol) se gobiernan **solo** por el RBAC por defecto de Better Auth, no por la matriz propia. Consecuencias abiertas: creación de organizaciones sin límite ni verificación de email, y posible actualización/eliminación por un `owner` fuera de las rutas propias (hipótesis, `AUTHZ-BA-001`). Los endpoints propios de miembros e invitaciones delegan además en Better Auth (doble comprobación).

## Modelo de producto

- `organization` es el tenant. `member` vincula usuario y organización con rol por organización.
- `business_profile` pertenece a una organización (0 o 1) y se publica por `slug` global.
- `business_hours` y `organization_service` e `integration_connection` se anclan a `organization_id`.
- `service_catalog` es el catálogo global de servicios Vecidya (3 filas); los asigna solo `platform_admin`.
- `integration_connection` guarda metadata genérica de conexión por tenant, no datos CRM ni credenciales.
- `platform_member` modela la autoridad interna de Vecidya.
- `business_profile_governance` y `platform_audit_log` modelan el poder de plataforma sobre un perfil (verificación, suspensión) y su rastro; viven separadas de `business_profile` para que ninguna escritura tenant (`saveBusinessProfileForOrganization`, `publishBusinessProfileForOrganization`) pueda tocarlas ni revertirlas. Toda mutación de gobierno sigue `sesión → requirePlatformAdmin → búsqueda del recurso → mutación → auditoría` (batch atómico).

## Multi-organización

```text
User
 ├── Member → Organization A ── BusinessProfile A
 └── Member → Organization B ── BusinessProfile B
```

Un usuario puede pertenecer y ser owner de varias organizaciones, con rol independiente en cada una. `session.active_organization_id` selecciona el contexto tenant en las páginas `/app`; **no** modela propiedad. Cambiar de organización activa no altera membresías. Las APIs usan la organización de la URL (verificada), no la activa. Probado por `pe-b` (ver [TESTING.md](TESTING.md)).

Comportamiento vigente: el flujo de login usa las operaciones soportadas `organization.list` y `organization.setActive` para fijar la primera organización con membresía válida; `afterRemoveMember` limpia sesiones que aún apunten a la organización retirada (`MULTIORG-LOGIN-001`, `MULTIORG-STALE-001`, resueltos y probados por E2E).

## Web pública

La web pública consume contenido institucional estático y perfiles publicados reales (`status = published` y no suspendidos). `BusinessProfile` es comercial: que el Diagnóstico admita otros tipos de presencia no convierte el modelo en un perfil universal. El canonical es fijo (`https://vecidya.com`); sitemap, robots y JSON-LD usan el origen de la request. El Diagnóstico es 100 % cliente: sin API, sin persistencia, sin CRM.

## Límite Vecidya ↔ GHL

Vecidya es responsable de cuentas, usuarios, organizaciones, membresías, perfiles de negocio, web pública, directorio, portal de cliente, servicios propios y metadata tenant-scoped de integraciones.

GHL es el system of record de contactos, leads, oportunidades, pipelines, conversaciones comerciales, citas CRM, workflows, automatizaciones y seguimiento. **Hoy no existe ninguna integración con GHL** (0 líneas de código; solo documentación). Vecidya no implementará un CRM paralelo sin una decisión arquitectónica posterior. (Consolida el antiguo `ADR-0001`.)

## Legacy

`legacy/vecidya-web-prototype/` (ignorado por Git y ausente de este clon) fue referencia de contenido, SEO y assets; sus componentes Astro no son la base de la plataforma. (Consolida el antiguo `ADR-0002`.)

## Decisiones de diseño vigentes

- Gobierno y auditoría en tablas separadas del perfil (`0009`).
- Horarios anclados a `organization_id`; «sin fila» = día sin definir (`0008`).
- `service_area` como texto libre (sin geocodificación, radios ni polígonos); `city`/`country` = ubicación de referencia.
- Logo como URL de texto; sin R2.
- Sin aislamiento por fila en la base de datos: el aislamiento es responsabilidad de cada consulta y guarda.
- Producción y staging tienen D1 independientes preparados; `vecidya.com` continúa usando el binding público anterior hasta el cutover autorizado (`PROD-INDEPENDENT-001`).

## FUTURE (no implementado; requiere fase explícita)

Integración con GHL y otros proveedores (Google, Meta, WhatsApp API); envío y verificación de email transaccional; R2 y subida de imágenes; Durable Objects, Queues y Workflows; perfiles universales (`Business`, `Professional`, `Creator`, `Organization`, `Project`, `Public Figure`; requiere ADR, privacidad, moderación, schema y autorización); persistencia del Diagnóstico (consentimiento, retención, schema, autorización tenant, revisión legal); producción independiente y subdominios `app.`/`admin.`; despublicar perfiles, motivos de suspensión y apelaciones; auditoría de servicios e integraciones; rate limiting durable.
