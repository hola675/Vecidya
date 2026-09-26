# Base de datos

Última reconciliación: 2026-09-25 (LICENSE-STRATEGY-001: foundation de licenciamiento multi-negocio, solo local). Evidencia: schema (`db/schema/`), las 11 migraciones SQL, `db/migrations/meta/`, consultas, D1 local (`d1_migrations` = 11 filas, `0000`–`0010`). No aplicado a D1 remota.

## Responsabilidades

- `db/schema/` (TypeScript/Drizzle) es la fuente de verdad; `drizzle-kit generate` produce SQL en `db/migrations/`; Wrangler lo aplica a D1.
- `db/client.server.ts` es el único punto de creación del cliente Drizzle; `db/queries/` contiene las consultas reutilizables.
- Las tablas de auth/tenancy/gobierno están en `db/schema/auth.ts` (16 tablas); `platform_meta` está en `db/schema/platform-meta.ts` (1); licenciamiento multi-negocio está en `db/schema/licensing.ts` (6, LICENSE-STRATEGY-001). Total: **23 tablas**.

## Modelo vigente

```text
user ──< member >── organization ──1:1── business_profile ──1:0..1── business_profile_governance
  │                      │                    └── business_hours (7 filas máx., por organization_id)
  │                      ├──< organization_service >── service_catalog
  │                      ├──< integration_connection
  │                      ├──< invitation
  │                      └──< organization_license >── license_price
  ├──< session (active_organization_id → organization, sin FK)
  ├──< account
  ├──1:0..1── platform_member          (autoridad de plataforma, independiente de member)
  └──1:0..1── billing_account ──< organization_license          (paga; independiente de `member`)
                    └──< billing_account_promotion >── promotion
platform_audit_log (actor → user, organization_id → organization)   platform_meta   verification
portfolio_pricing_tier (configuración global, sin FK)
```

`organization_license` es el puente: una organización (negocio) tiene una licencia, y esa licencia
pertenece a un `billing_account` (quien paga), nunca al `member` de Better Auth. Detalle completo
en «Licenciamiento multi-negocio» más abajo.

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
| `billing_account` | entidad que paga licencias (persona o empresa); **no se deriva de `member`** | `owner_user_id` → user (**sin acción**) | único `owner_user_id` (V1: una persona controla un solo billing_account) | independiente del tenant | `0010` |
| `license_price` | versión de precio de un plan (`amount_cents`, moneda, vigencia) | — | índice `(plan_code, effective_from)` | global | `0010` (3 filas sembradas) |
| `organization_license` | 1 organización = 1 licencia; conserva `price_id` contratado (grandfathering) | organization (cascade); `billing_account_id`/`price_id` → billing_account/license_price (**sin acción**) | índices `organization_id`, `billing_account_id` | `organization_id` (recurso) + `billing_account_id` (facturación) | `0010` |
| `portfolio_pricing_tier` | escalera de descuento por cantidad de organizaciones activas del mismo `billing_account` | — | — | global (configuración) | `0010` (4 filas sembradas) |
| `promotion` | incentivo configurable (porcentaje/monto fijo/bundle/licencia gratis); `free_license` sin cálculo implementado todavía | — | único `code` (nulo permitido, no toda promoción tiene código) | global (configuración) | `0010` |
| `billing_account_promotion` | promoción asignada a un `billing_account` (código canjeado o asignación manual) | billing_account (cascade); `promotion_id` → promotion (**sin acción**) | índice `billing_account_id` | `billing_account_id` | `0010` |

Notas de integridad:

- Ningún enum (`role`, `status`, `platform_status`, `service_mode`, …) tiene `CHECK`; se validan solo en la aplicación (lectura para `platform_member`: no existe ruta de escritura).
- D1 aplica claves foráneas: los FK «sin acción» hacia `user` y `organization` (`0009`, `organization_service.service_id`; `0010`, `billing_account.owner_user_id`, `organization_license.billing_account_id`/`price_id`, `billing_account_promotion.promotion_id`) impiden borrar un usuario, organización, billing_account, precio o promoción todavía referenciados. **Verificado `RAN`** en `platform-licensing-check.mjs`: el orden de limpieza de fixtures debe borrar `platform_audit_log` y `billing_account` antes que `organization`/`user`, o la escritura falla con `SQLITE_CONSTRAINT_FOREIGNKEY`.
- No hay aislamiento por fila a nivel de base de datos: el aislamiento tenant depende de `WHERE organization_id` en cada consulta y de las guardas de ruta.
- `session.active_organization_id` no es propiedad ni membresía: solo selecciona contexto.

## Multi-organización (evidencia de schema y consultas)

**Soportado: un usuario → varias organizaciones → un perfil por organización.**

1. `member` solo es único por `(organization_id, user_id)`; no hay restricción de una organización por usuario ni `organizationLimit` en Better Auth.
2. Cada organización creada convierte al creador en `owner`, sin tope (los usuarios sin email verificado también pueden crear).
3. `business_profile.organization_id` es único: 0 o 1 perfil por organización; `slug` es único global.
4. `business_hours`, `organization_service` e `integration_connection` se anclan a `organization_id`.
5. **Organization role ≠ Platform Admin privilege**: `platform_member` es otra tabla, única por usuario; ninguna consulta ni guarda deriva autoridad de plataforma de `member.role`.
6. **Organization role ≠ Billing ownership**: ser `member` (incluido `owner`) de una organización no implica que su licencia pertenezca al `billing_account` de ese usuario. La cuenta que paga se asigna por una operación autorizada (`platform_admin`), nunca por membresía.

Probado por `pe-b` (aislamiento de perfil y servicios entre dos organizaciones del mismo usuario), `bpx`, `c1`, `c2` y `d1` (ver [TESTING.md](TESTING.md)).

## Licenciamiento multi-negocio (LICENSE-STRATEGY-001)

**1 organización = 1 negocio = 1 licencia.** Una persona puede administrar varias organizaciones,
y las organizaciones pueden tener planes distintos; la cantidad de organizaciones no depende del
plan de ninguna de ellas.

- **`billing_account` ≠ `member`.** Quien paga una licencia es el `billing_account`, una entidad
  propia que en V1 pertenece a un único usuario (`owner_user_id`, único). Ser `member` de una
  organización (incluida una invitación aceptada) nunca hace que su licencia cuente para el
  portafolio de otra persona: la consulta que arma el portafolio (`getLicenseLinesForBillingAccount`)
  filtra por `organization_license.billing_account_id`, no por `member`.
- **Grandfathering real, no solo documental.** `organization_license.price_id` referencia una fila
  concreta de `license_price`. Cuando se publica un precio nuevo para un plan (`effective_from`
  posterior, el anterior pasa a `status = 'retired'`), las licencias ya contratadas siguen
  resolviendo su precio por el `price_id` guardado, nunca por `plan_code` + fecha actual. Verificado
  `RAN` en `platform-licensing-check.mjs`.
- **Un cambio de plan crea una fila nueva.** `changeOrganizationLicensePlan` no muta `plan_code` en
  la fila existente: la cancela (`status = 'cancelled'`, `ends_at`) y crea una fila `active` con el
  nuevo plan y su precio vigente. Conserva historial completo y no exige una restricción `UNIQUE` de
  "una sola fila activa por organización" a nivel de base de datos — es un invariante de aplicación,
  igual que el resto de enums de este schema, protegido por `platform-licensing-check.mjs`.
- **Portafolio, no lógica repartida.** El descuento por cantidad de organizaciones vive en
  `portfolio_pricing_tier` (configuración); `db/pricing/calculator.ts` es una función pura,
  determinística y sin acceso a base de datos que recibe líneas ya resueltas + tiers + promociones y
  devuelve el desglose. Nunca usa `float`: todo en centavos enteros (`amount_cents`) y basis points
  (`discount_bps`, 1/100 de 1%).
- **Promociones configurables, no todas implementadas.** `promotion.type` admite `percentage`,
  `fixed_amount`, `fixed_bundle` (los tres calculados) y `free_license` (representable desde V1;
  su cálculo no está implementado — el calculador lo reconoce y lo ignora sin lanzar). Una
  promoción no apilable (`stackable = false`) nunca se combina con otra: si hay al menos una
  elegible no apilable, solo se aplica la de mayor descuento entre las no apilables y se ignoran
  las demás, incluidas las apilables.
- **Nada de esto cobra.** No hay proveedor de cobro (Stripe/Paddle/…), webhooks, checkout ni cobro
  automático. Crear una organización no activa una licencia pagada por sí sola: `assignOrganizationLicense`
  nace `pending` salvo que la operación autorizada la active explícitamente. Solo `platform_admin`
  puede asignar, cambiar de plan, suspender/reactivar o transferir una licencia a otro
  `billing_account` (`app/routes/api-platform-licensing.ts`, `requirePlatformAdmin`), auditado en
  `platform_audit_log` igual que el resto de acciones de gobierno.

Probado end-to-end por `platform-licensing-check.mjs` (27 comprobaciones): autorización, portafolio
de 1/2/3 organizaciones con los montos exactos aprobados por el usuario, aislamiento entre dos
`billing_account`, cambio de plan sin afectar a las organizaciones hermanas, suspender/reactivar y
grandfathering de precio. Ver [TESTING.md](TESTING.md).

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
| 0010 | `0010_licensing-foundation.sql` | Licenciamiento multi-negocio | `billing_account`, `license_price` (+3 filas sembradas: Cuadra/Barrio/Ciudad), `organization_license`, `portfolio_pricing_tier` (+4 filas sembradas: 1→0%, 2→10%, 3-4→15%, 5+→20%), `promotion`, `billing_account_promotion` |

Estado de aplicación: **local `0000`–`0010`** (verificado `RAN` el 2026-09-25); **remoto `0000`–`0009`** (verificado `REMOTE` el 2026-09-21, sin cambios desde entonces). `0010` es exclusivamente local: LICENSE-STRATEGY-001 no autoriza `--remote`.

Detalles de diseño vigentes:

- `0007`: WhatsApp se guarda normalizado (`+` y 8–15 dígitos; sin asumir país) para construir `https://wa.me/<dígitos>`; redes validadas contra su host.
- `0008`: la ausencia de fila en `business_hours` significa «día sin definir», distinto de `is_closed = true`; `business_hours` se ancla a `organization_id`, no a `business_profile_id`. El reemplazo de los 7 días es delete+insert **no atómico**.
- `0009`: gobierno y auditoría se separan de `business_profile` para que ninguna escritura tenant los toque; cada acción escribe gobierno + auditoría en un único `database.batch([...])`. Las consultas públicas hacen `LEFT JOIN` con gobierno y excluyen `platform_status = 'suspended'` (sin fila = activo).
- `0010`: sin `CHECK` en ningún enum, igual que el resto del schema. `promotion.code` es `UNIQUE` pero nulo permitido (SQLite no compara `NULL` como duplicado, así que varias promociones sin código conviven). El redondeo de basis points (`Math.round`) vive únicamente en `db/pricing/calculator.ts`, nunca en SQL.

## Seeds y datos iniciales

- `db/seeds/platform-meta.server.ts` define `seedPlatformMeta` pero **nunca se invoca**; ningún script ni test inserta `platform_meta`. El procedimiento de inicialización que prometía la documentación anterior **no existe**.
- `service_catalog` tiene 3 filas sembradas en `0004` (nombres institucionales, sin precio). `license_price` tiene 3 filas sembradas en `0010` (Cuadra `USD 39/mes`, Barrio `USD 59/mes`, Ciudad `USD 89/mes`, las mismas que publica `/licencias`). `portfolio_pricing_tier` tiene 4 filas sembradas en `0010` (la escalera 0/10/15/20%).
- No hay seeds ni fixtures de organizaciones, usuarios, `platform_member`, `billing_account` ni negocios reales en el repositorio.

## Health check

`/__health/db` lee solo `platform_meta` y valida `platform_name = Vecidya`; no escribe. Como nada inserta esas filas, devuelve 503 en una D1 recién migrada. Es público y devuelve `environment: "LOCAL"` fijo. La ruta pública respondió 200 el 2026-09-20 (la D1 remota tiene las filas insertadas manualmente).

## Reglas operativas

1. D1 es la persistencia SQL; Local y Public/Staging son bases distintas.
2. Comandos locales con el **binding**: `pnpm wrangler d1 migrations apply DB --local`, `pnpm wrangler d1 execute DB --local --command "…"`. El nombre `vecidya-dev` es obsoleto.
3. Nunca `--remote` sin autorización explícita.
4. No usar `drizzle-kit push` como flujo normal.
5. Nunca modificar manualmente un schema remoto ni guardar secretos en Git.
6. El D1 `vecidya-staging` sirve hoy el dominio público; `vecidya-prod` está provisionada y clonada, pero requiere cutover autorizado para servirlo (`PROD-INDEPENDENT-001`).
7. Todo recurso con `organization_id` se consulta filtrando por la organización verificada (membresía) y nunca por un identificador del cliente sin verificar.
