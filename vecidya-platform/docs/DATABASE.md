# Base de datos

Última reconciliación: 2026-09-21 (AUTH-BOOTSTRAP-001). Evidencia: schema (`db/schema/`), las 10 migraciones SQL, `db/migrations/meta/`, consultas, D1 local y D1 remota (`d1_migrations` = 10 filas, `0000`–`0009`).

## Responsabilidades

- `db/schema/` (TypeScript/Drizzle) es la fuente de verdad; `drizzle-kit generate` produce SQL en `db/migrations/`; Wrangler lo aplica a D1.
- `db/client.server.ts` es el único punto de creación del cliente Drizzle; `db/queries/` contiene las consultas reutilizables.
- Todas las tablas de negocio y plataforma están declaradas en `db/schema/auth.ts` (15 tablas); `platform_meta` está en `db/schema/platform-meta.ts`. Total: **16 tablas**.

## Modelo vigente

```text
user ──< member >── organization ──1:1── business_profile ──1:0..1── business_profile_governance
  │                      │                    └── business_hours (7 filas máx., por organization_id)
  │                      ├──< organization_service >── service_catalog
  │                      ├──< integration_connection
  │                      └──< invitation
  ├──< session (active_organization_id → organization, sin FK)
  ├──< account
  └──1:0..1── platform_member          (autoridad de plataforma, independiente de member)
platform_audit_log (actor → user, organization_id → organization)   platform_meta   verification
```

### Entidades

| Tabla | Propósito | Relaciones (onDelete) | Únicos / índices | Frontera tenant | Migración |
| --- | --- | --- | --- | --- | --- |
| `platform_meta` | key/value de plataforma | — | PK `key` | global | `0000` |
| `user` | identidad (`email_verified` por defecto falso) | — | único `email` | global | `0001` |
| `session` | sesión con `token` y `active_organization_id` | `user_id` → user (cascade); `active_organization_id` **sin FK** | único `token`; índice `user_id` | usuario; apunta a una organización | `0001` (+ `ALTER` en `0002`) |
| `account` | credenciales/tokens de proveedor de Better Auth | `user_id` → user (cascade) | índice `user_id` | usuario | `0001` |
| `verification` | tokens de verificación de Better Auth | — | índice `identifier` | global | `0001` |
| `organization` | **el tenant**; `slug`, `logo`, `metadata` | — | único `slug` (global) | raíz del tenant | `0002` |
| `member` | vínculo usuario–organización; `role` texto (`owner/admin/member`) | organization (cascade), user (cascade) | **único `(organization_id, user_id)`**; índices por columna | `organization_id` | `0002`; índice único añadido en `0003` |
| `invitation` | invitaciones (email, rol, estado, expiración) | organization (cascade), inviter (cascade) | índices `organization_id`, `email` | `organization_id` | `0002` |
| `business_profile` | perfil comercial (borrador/publicado) | organization (cascade) | **único `organization_id`**; **único `slug` (global)** | `organization_id`, 1:1 | `0003`; `0007` (whatsapp, redes); `0008` (`service_mode`, `service_area`) |
| `business_hours` | horario por día (1–7 ISO), `is_closed` | organization (cascade) | único `(organization_id, day_of_week)` | `organization_id` | `0008` |
| `business_profile_governance` | verificación y estado de plataforma; solo escribe `platform_admin` | business_profile (cascade); `verified_by`/`suspended_by` → user (**sin acción**) | único `business_profile_id` | indirecta vía perfil; propiedad de plataforma | `0009` |
| `platform_audit_log` | registro de acciones de gobierno (actor, acción, entidad, valor previo/nuevo) | actor → user (**sin acción**), organization (**sin acción**) | índices `(entity_type, entity_id)`, `organization_id`, `created_at` | `organization_id` (desnormalizado) | `0009` |
| `service_catalog` | catálogo de servicios Vecidya (`code`, `name`, `status`) | — | único `code` | global | `0004` (con 3 filas sembradas) |
| `organization_service` | asignación de servicio a organización (`pending/active/suspended/ended`) | organization (cascade), service (**sin acción**) | único `(organization_id, service_id)` | `organization_id` | `0004` |
| `platform_member` | autoridad de plataforma (`platform_admin`/`staff`; `active`/`inactive`) | user (cascade) | único `user_id` | global; **separada de `member`** | `0005` |
| `integration_connection` | metadata de conexión externa por tenant | organization (cascade) | **único `(provider, external_id)` global**; índice `organization_id` | `organization_id` | `0006` |

Notas de integridad:

- Ningún enum (`role`, `status`, `platform_status`, `service_mode`, …) tiene `CHECK`; se validan solo en la aplicación (lectura para `platform_member`: no existe ruta de escritura).
- D1 aplica claves foráneas: los FK «sin acción» hacia `user` y `organization` (`0009`, `organization_service.service_id`) impedirán borrar un usuario u organización referenciados por auditoría/gobierno (deducido del schema, no ejecutado).
- No hay aislamiento por fila a nivel de base de datos: el aislamiento tenant depende de `WHERE organization_id` en cada consulta y de las guardas de ruta.
- `session.active_organization_id` no es propiedad ni membresía: solo selecciona contexto.

## Multi-organización (evidencia de schema y consultas)

**Soportado: un usuario → varias organizaciones → un perfil por organización.**

1. `member` solo es único por `(organization_id, user_id)`; no hay restricción de una organización por usuario ni `organizationLimit` en Better Auth.
2. Cada organización creada convierte al creador en `owner`, sin tope (los usuarios sin email verificado también pueden crear).
3. `business_profile.organization_id` es único: 0 o 1 perfil por organización; `slug` es único global.
4. `business_hours`, `organization_service` e `integration_connection` se anclan a `organization_id`.
5. **Organization role ≠ Platform Admin privilege**: `platform_member` es otra tabla, única por usuario; ninguna consulta ni guarda deriva autoridad de plataforma de `member.role`.

Probado por `pe-b` (aislamiento de perfil y servicios entre dos organizaciones del mismo usuario), `bpx`, `c1`, `c2` y `d1` (ver [TESTING.md](TESTING.md)).

## Migraciones

`_journal.json` tiene 10 entradas coherentes con los 10 archivos SQL, y los snapshots `0000`–`0009` forman una cadena `prevId` sin roturas. **No hay deriva** entre schema, SQL y snapshots (comparación columna a columna).

| # | Archivo | Propósito | Cambios |
| --- | --- | --- | --- |
| 0000 | `0000_init_platform_meta.sql` | Metadata de plataforma | `platform_meta` |
| 0001 | `0001_auth_core.sql` | Auth core de Better Auth | `user`, `session`, `account`, `verification` |
| 0002 | `0002_organization_tenancy.sql` | Tenancy | `organization`, `member`, `invitation`, `session.active_organization_id` |
| 0003 | `0003_business-profile-foundation.sql` | Perfil comercial | `business_profile`; índice único de membresía |
| 0004 | `0004_client-services-foundation.sql` | Servicios | `service_catalog` (+3 filas: `presence`, `marketing`, `crm`; INSERT añadido a mano), `organization_service` |
| 0005 | `0005_platform-service-administration.sql` | Autoridad de plataforma | `platform_member` |
| 0006 | `0006_integration-foundation.sql` | Integraciones genéricas | `integration_connection` |
| 0007 | `0007_business-profile-contact-presence.sql` | Contacto y presencia | `business_profile`: `whatsapp`, `instagram_url`, `facebook_url`, `linkedin_url` (opcionales) |
| 0008 | `0008_business-profile-operations.sql` | Operaciones | `business_profile`: `service_mode`, `service_area`; tabla `business_hours` |
| 0009 | `0009_platform-profile-governance.sql` | Gobierno de plataforma | `business_profile_governance`, `platform_audit_log` |

Estado de aplicación: **local y remoto `0000`–`0009`** (verificado `RAN`/`REMOTE` el 2026-09-21). No se aplicaron migraciones remotas durante AUTH-BOOTSTRAP-001; el bloque modificó únicamente datos de acceso autorizados.

Detalles de diseño vigentes:

- `0007`: WhatsApp se guarda normalizado (`+` y 8–15 dígitos; sin asumir país) para construir `https://wa.me/<dígitos>`; redes validadas contra su host.
- `0008`: la ausencia de fila en `business_hours` significa «día sin definir», distinto de `is_closed = true`; `business_hours` se ancla a `organization_id`, no a `business_profile_id`. El reemplazo de los 7 días es delete+insert **no atómico**.
- `0009`: gobierno y auditoría se separan de `business_profile` para que ninguna escritura tenant los toque; cada acción escribe gobierno + auditoría en un único `database.batch([...])`. Las consultas públicas hacen `LEFT JOIN` con gobierno y excluyen `platform_status = 'suspended'` (sin fila = activo).

## Seeds y datos iniciales

- `db/seeds/platform-meta.server.ts` define `seedPlatformMeta` pero **nunca se invoca**; ningún script ni test inserta `platform_meta`. El procedimiento de inicialización que prometía la documentación anterior **no existe**.
- Los únicos datos sembrados son las 3 filas de `service_catalog` en `0004` (nombres institucionales, sin precios: no hay columnas de precio/moneda en ninguna tabla).
- No hay seeds ni fixtures de organizaciones, usuarios, `platform_member` ni negocios reales en el repositorio.

## Health check

`/__health/db` lee solo `platform_meta` y valida `platform_name = Vecidya`; no escribe. Como nada inserta esas filas, devuelve 503 en una D1 recién migrada. Es público y devuelve `environment: "LOCAL"` fijo. La ruta pública respondió 200 el 2026-09-20 (la D1 remota tiene las filas insertadas manualmente).

## Reglas operativas

1. D1 es la persistencia SQL; Local y Public/Staging son bases distintas.
2. Comandos locales con el **binding**: `pnpm wrangler d1 migrations apply DB --local`, `pnpm wrangler d1 execute DB --local --command "…"`. El nombre `vecidya-dev` es obsoleto.
3. Nunca `--remote` sin autorización explícita.
4. No usar `drizzle-kit push` como flujo normal.
5. Nunca modificar manualmente un schema remoto ni guardar secretos en Git.
6. El D1 `vecidya-staging` sirve hoy el dominio público; producción independiente requiere recursos propios y autorización (`PROD-INDEPENDENT-001`).
7. Todo recurso con `organization_id` se consulta filtrando por la organización verificada (membresía) y nunca por un identificador del cliente sin verificar.
