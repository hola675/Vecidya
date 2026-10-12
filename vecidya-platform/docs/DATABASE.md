# Base de datos

Última reconciliación: **2026-10-12 (DIAG-V3-FUNNEL-01C; schema nuevo y migraciones 0014–0015 aplicadas solo en D1 local).** `0011`–`0013` son historial local retirado del runtime público y permanecen en journal. `vecidya-prod` no recibió estas migraciones y, conforme al último corte remoto documentado, sigue en `0010`.

## FUNNEL-01C — datos de informe identificado (local)

`db/schema/diagnostic-identification.ts` agrega seis tablas (33 tablas en el schema Drizzle actual): solicitud identificada, snapshot serializado/hash/versionado, challenges de correo con digest/expiración/intentos, concesiones de acceso con digest y dos registros independientes de opt-in. Las FK de snapshot, challenge, acceso y consentimientos usan `ON DELETE CASCADE`; borrar la solicitud limpia el conjunto. La huella de idempotencia permite detectar una misma clave con payload distinto. Email/teléfono/nombre e informe quedan en D1 local para el flujo de desarrollo; IP no se persiste. La cookie de acceso solo se guarda como digest.

| Migración | Propósito | D1 local | Remoto |
| --- | --- | --- | --- |
| `0014_diagnostic-identification.sql` | Solicitud, snapshot, challenge, grant, opt-ins A/B/C | Aplicada `RAN` 2026-10-12 | No aplicada |
| `0015_diagnostic-request-fingerprint.sql` | Huella ligada a idempotency key y contenido | Aplicada `RAN` 2026-10-12 | No aplicada |

La expiración invalida consultas de informe, pero `purgeExpiredIdentifiedReports` aún no tiene scheduler/llamador automático. 30 días de solicitud/snapshot/acceso y 24 horas del challenge son valores de prueba provisionales, no política aprobada. No migrar/reinterpretar sesiones anteriores ni conectar analítica/GHL.

## LEGACY-00 — disposición D1 diagnóstica

Baseline `50026d0`, sin operaciones remotas. Según evidencia documental vigente, D1 remota sigue en `0010` y D1 local tiene `0011`–`0013`. `db/schema/diagnostic.ts` sigue exportado desde `db/schema/index.ts`; no se encontraron imports desde `app/` para las queries/server legacy.

| Ruta | Clase | Consumidores/pruebas | Riesgo |
| --- | --- | --- | --- |
| `db/schema/diagnostic.ts`, export de `db/schema/index.ts` | `REMOVE_AFTER_CUTOVER` | Schema Drizzle usado por `drizzle.config.ts` | 5 tablas legacy locales; retirar exige decidir DB local y validar schema/codegen. |
| `db/queries/diagnostic-sessions.server.ts`, `diagnostic-save-resume.server.ts`, `diagnostic-analytics*.server.ts`, `server/diagnostic/**` | `REMOVE_AFTER_CUTOVER` / `INVESTIGATE` | Sin import desde app versionada localizado | Revisar tests/scripts/config/bindings antes; ausencia de import no prueba ausencia de operación manual. |
| SQL y snapshots `0011`–`0013`, `meta/_journal.json` | `ARCHIVE` | Cadena Drizzle y estado local 0013 | Inmutables: no borrar migraciones aplicadas. Limpieza de tablas requiere migración nueva compensatoria aprobada. |

LEGACY-00 no consultó ni modificó D1 y no afirma que `0011`–`0013` estén en remoto.

## Responsabilidades

- `db/schema/` (TypeScript/Drizzle) es la fuente de verdad; `drizzle-kit generate` produce SQL en `db/migrations/`; Wrangler lo aplica a D1.
- `db/client.server.ts` es el único punto de creación del cliente Drizzle; `db/queries/` contiene las consultas reutilizables.
- Las tablas de auth/tenancy/gobierno están en `db/schema/auth.ts` (16 tablas); `platform_meta` está en `db/schema/platform-meta.ts` (1); licenciamiento multi-negocio está en `db/schema/licensing.ts` (6, LICENSE-STRATEGY-001); persistencia del Diagnóstico está en `db/schema/diagnostic.ts` (5: 3 de DIAG-V3-06, `diagnostic_saved_snapshot` de DIAG-V3-07 y `diagnostic_event` de DIAG-V3-08). Total: **28 tablas**.

## DIAG-V3-FUNNEL-01A — propuesta de datos (no implementada)

El diagnóstico público actual corre en el navegador; su sesión anónima de respuestas vive solo en `localStorage` durante 14 días. El diseño F3 recomendado procesa las respuestas de forma stateless en el Worker para devolver exclusivamente `AnonymousDiagnosticSummaryV1`; no crea fila de sesión anónima ni guarda respuestas/resultados detallados anónimos. Los esquemas/migraciones de DIAG-V3-06/07/08 no se reutilizan por defecto: describen una foundation retirada del flujo público, aunque permanezca en el árbol y en la D1 local histórica. FUNNEL-01A no altera esos artefactos.

| Entidad candidata | Contenido mínimo | Relación y control | Ciclo de vida propuesto |
| --- | --- | --- | --- |
| `identified_diagnostic_request` | UUID, `diagnosticIdentity`, versiones de cuestionario/metodología/reporte, nombre responsable, email normalizado, negocio/proyecto opcional, teléfono opcional, estado y finalidad A | Sin `organization_id`; relación con snapshot por UUID; email no forma parte del ID público | Propuesta: 30 días desde emisión; pendiente de decisión legal/producto |
| `diagnostic_report_snapshot` | JSON de `PersonalizedDetailedReportV1`, score y salida exacta, identidad del motor, fecha de cálculo, expiración | FK a solicitud; lectura solo con grant verificado; sin respuestas crudas por defecto | Propuesta: mismo vencimiento que la solicitud, 30 días; borrado en cascada |
| `diagnostic_report_access_grant` | UUID, solicitud, digest del token de un uso, emisión/expiración/consumo | Digest solamente; TTL propuesto 24 h; rate limit en emitir, reenviar y consumir | Expirado/consumido no concede acceso; purga junto con solicitud o sweep dedicado |
| `commercial_contact_intent` | Solicitud, opción B, versión exacta del texto/aviso, timestamp, fuente, estado revocada/activa | Fila separada, solo se crea si B se marca; idempotencia y retirada; no es oportunidad/cliente | Mientras la preferencia siga válida, con retención final a aprobar |
| `diagnostic_analytics_event` | Tipo, instante de servidor, versión y valores coarse-grained allowlisted; opcional run ID seudónimo | Silo sin FK a solicitud/contacto/snapshot; jamás respuestas, PII, IP o UA | Propuesta: crudos seudónimos ≤30 días; después agregado no identificable |

`researchParticipation` (C) requiere un consentimiento separado, versión de aviso, alcance de reutilización y fecha de retirada. No se debe reusar la preferencia comercial B para investigación, ni considerar A como consentimiento para ninguna de las dos.

No almacenar `AnonymousDiagnostic` como entidad persistente sin necesidad aprobada. Al pedir detalle el Worker vuelve a recibir las respuestas y la identidad de contrato, recalcula y escribe solicitud + snapshot de manera transaccional/idempotente; las respuestas se descartan tras calcular. La identificación y los reportes son recursos personales de acceso público solicitado, no recursos de organización; cualquier consola staff requiere sesión, rol/permiso, recurso y auditoría de propósito. No aceptar ID de solicitud como autorización: el acceso depende de grant verificado de vida corta. No escribir tokens, email, teléfono, respuestas o documento en logs.

Idempotencia propuesta: clave aleatoria por intento, guardada como HMAC/digest y limitada por TTL; mismo reintento devuelve el mismo estado y no crea doble solicitud o grant. Edición de respuestas invalida la revisión completada y exige nuevo cálculo bajo identidad declarada. Rate limiting de borde por endpoint reduce spam sin persistir IP en D1; cualquier observación de IP en logs debe estar desactivada o minimizada según revisión legal. Un run ID aleatorio para analítica sigue siendo dato seudónimo: no vincularlo a solicitudes o emails. Para borrado, purgar solicitud, snapshot, grants e intención relacionada en cascada y aplicar una purga verificable para eventos vencidos; la exportación debe incluir la solicitud, permisos y reporte disponible.

Los plazos anteriores son propuestas técnicas, no una política vigente ni una declaración de cumplimiento. Antes de schema/migración/endpoint deben aprobarse la base legal de A, B y C, los avisos, plazos finales, respuesta a solicitudes de acceso/borrado y acceso de soporte.

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
| `diagnostic_session` | ciclo de vida de una sesión anónima del Diagnóstico; `id` ES el identificador público (no un rowid interno); `token_hash` = `SHA-256(writeToken)`, nunca el token en claro | — (sin FK entrantes; `diagnostic_answer`/`diagnostic_result` referencian `id`) | índices `status`, `last_activity_at` | ninguna (anónimo; sin `user`/`organization`) | `0011` |
| `diagnostic_answer` | respuestas ACTIVAS finales de un diagnóstico completado (nunca una descartada por routing); una fila por pregunta | `session_id` → diagnostic_session (**cascade**) | único `(session_id, question_id)`; índice `session_id` | ninguna | `0011` |
| `diagnostic_result` | resultado canónico recalculado en servidor; `structured_result_json` = `DiagnosticResult` real del motor, `dimension_results_json` = `DimensionResult[]` con evidencia real; `completion_hash` = idempotencia | `session_id` → diagnostic_session (**cascade**) | único `session_id`; índice `completion_hash` | ninguna | `0011` |
| `diagnostic_saved_snapshot` | checkpoint durable de "Guardar para después" (DIAG-V3-07); 1 fila por sesión (PK = `session_id`, se reemplaza en cada save, nunca se acumulan filas históricas); `recovery_lookup_digest` = `HMAC-SHA-256(secret, code)`, nunca el recovery code en claro; se borra en la misma transacción que completar la sesión | `session_id` → diagnostic_session (**cascade**, también PK) | único `recovery_lookup_digest`; índice `expires_at` | ninguna (anónimo) | `0012` |
| `diagnostic_event` | evento de analítica anónimo (DIAG-V3-08); `id` autoincrement solo para orden de inserción, nunca expuesto; `event_uuid` es la clave de idempotencia real (spec §9) — un reintento del cliente con el mismo UUID nunca produce una segunda fila; `answer_kind` distingue categorías (`answered`/`unknown`/`not_applicable`, o `NULL`), nunca el `OptionId`/valor de respuesta real; `route_signature` es el SHA-256 de `questionBankVersion` + `routingVersion` + la lista ordenada de IDs de preguntas aplicables (`route-signature.ts`), no la respuesta en sí | `session_id` → diagnostic_session (**cascade**) | único `event_uuid`; índices `session_id`, `(event_type, question_id)`, `retention_until` | ninguna (anónimo) | `0013` |

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
| 0011 | `0011_diagnostic-persistence-foundation.sql` | Persistencia del Diagnóstico (DIAG-V3-06) | `diagnostic_session`, `diagnostic_answer`, `diagnostic_result` |
| 0012 | `0012_diagnostic-save-resume.sql` | Save & Resume del Diagnóstico (DIAG-V3-07) | `diagnostic_saved_snapshot` |
| 0013 | `0013_diagnostic-analytics-foundation.sql` | Analítica del Diagnóstico (DIAG-V3-08) | `diagnostic_event`; 4 columnas nuevas en `diagnostic_session` (`save_count`, `resume_count`, `last_saved_at`, `last_resumed_at`) |
| 0014 | `0014_diagnostic-identification.sql` | Solicitud identificada/informe (FUNNEL-01C) | 6 tablas con cascade y opt-ins separados |
| 0015 | `0015_diagnostic-request-fingerprint.sql` | Idempotencia ligada al contenido (FUNNEL-01C) | `identified_diagnostic_request.request_fingerprint_hash` |

Estado de aplicación: **local `0000`–`0015`** (0014/0015 aplicadas `RAN` el 2026-10-12); **remoto (`vecidya-prod`) `0000`–`0010`** (0010 aplicada en G7; `0011`–`0015` no aplicadas; no se ejecutó `--remote`). Esquema y semillas de `0010` verificados contra el SQL; `vecidya-staging` no se tocó.

## Persistencia del Diagnóstico (DIAG-V3-06)

Anónima por defecto: ninguna de las tres tablas nuevas tiene columna de usuario, organización, IP ni user-agent; `diagnostic_session.id` es el identificador público aleatorio de la sesión, no un `member`/`user` vinculado. `token_hash` es `SHA-256` del write token; el token en claro nunca se persiste.

- **`diagnostic_session`**: ciclo de vida (`status`: `STARTED`/`IN_PROGRESS`/`SAVED`/`COMPLETED`/`EXPIRED`, esta fase solo produce los tres primeros), las cinco versiones persistidas (`diagnostic_version`, `question_bank_version`, `routing_version`, `scoring_version`, `result_schema_version`), `profile`/`stage`/`goal` solo cuando ya están resueltos (nunca `entity`/`archetype`/`niche`/`primaryFriction`: el motor actual no los produce), `revision` (trazabilidad, no CAS distribuido), `current_question_id`, contadores de progreso y `snapshot_expires_at` (TTL del snapshot de KV, no la retención del resultado).
- **`diagnostic_answer`**: respuestas ACTIVAS finales de un diagnóstico completado, escritas una sola vez en la transacción de finalización; único `(session_id, question_id)` evita duplicados ante un reintento.
- **`diagnostic_result`**: `structured_result_json` es exactamente `DiagnosticResult` (Result Engine de DIAG-V3-05), nunca un objeto armado por la UI; `dimension_results_json` conserva `DimensionResult[]` (evidencia real + insumos de confianza) tal como los produce el motor. **Decisión documentada:** no se creó una tabla `diagnostic_dimension_result` separada porque nada en esta fase necesita consultar por dimensión en SQL — normalizarla ahora sería dogma, no necesidad; queda disponible normalizarla después si una fase futura lo requiere, sin haber perdido el dato. `completion_hash` (SHA-256 del payload canónico) es la clave de idempotencia de finalización, no una restricción `UNIQUE` global: dos sesiones distintas con el mismo contenido no son un conflicto entre sí.
- **Completación transaccional e idempotente**: `completeDiagnosticSession` (`db/queries/diagnostic-sessions.server.ts`) valida, deriva las respuestas activas y recalcula el resultado completo con el motor real (`explainResult`), y persiste answers+result+session en un único `database.batch(...)`. Verificado en vivo (`diagnostic-persistence-check.mjs`) que una violación de restricción a mitad del batch revierte TODAS las sentencias — ningún `diagnostic_answer` quedó insertado cuando el `diagnostic_result` colisionó deliberadamente. Repetir la misma finalización (mismo hash canónico) devuelve el resultado ya guardado; dos finalizaciones concurrentes de la misma sesión se resuelven de la misma forma, capturando la violación de la restricción única en vez de propagar un error.
- **KV (`DIAGNOSTIC_SNAPSHOTS`) es exclusivamente snapshot temporal de trabajo**, nunca base histórica ni fuente de concurrencia: TTL de 7 días, escrituras coalescidas (≈cada 5 respuestas o al cruzar de sección, nunca más de 1/segundo a la misma key), y borrado solo después de confirmar D1 (best-effort: un fallo de borrado no revierte ni invalida la finalización, el snapshot simplemente expira por TTL). El `id` del `kv_namespaces` en `wrangler.jsonc` es un placeholder local explícito (`remote: false`); no se creó ningún namespace remoto (`DIAG-V3-KV-PLACEHOLDER-001` en `STATUS.md`).
- **Límites explícitos**: sin edición concurrente real entre dos dispositivos/pestañas; sin lectura-tras-escritura garantizada en KV; sin scheduler de expiración/abandono todavía (ver Open Debt en `STATUS.md`; analítica de eventos anónima ya existe desde DIAG-V3-08, ver más abajo).

## Save & Resume del Diagnóstico (DIAG-V3-07)

- **`diagnostic_saved_snapshot`**: checkpoint durable de "Guardar para después", separado de `diagnostic_answer` (que representa respuestas ACTIVAS de una sesión ya COMPLETADA, nunca un checkpoint intermedio) — mezclarlas habría sobrecargado una tabla con dos semánticas distintas. `active_answers_json` es el mismo contrato serializable que usan Browser Store/KV; las cinco versiones se copian de la sesión al guardar, para poder detectar una versión incompatible en la recuperación sin depender de que `diagnostic_session` no haya cambiado entre medio. `canonical_hash` (SHA-256 de sesión+versiones+progreso+respuestas activas, `buildCanonicalSavePayload`) es el mecanismo de idempotencia de SAVE: un retry con el mismo contenido exacto no mina un recovery code nuevo, solo extiende `expires_at` — la única forma de minar uno nuevo sin cambiar respuestas es `regenerateCode: true`, disparado por un botón dedicado en la UI cuando la persona indica explícitamente que perdió el código anterior (spec §36; nunca automático).
- **`recovery_lookup_digest`** es `HMAC-SHA-256(DIAGNOSTIC_RECOVERY_HMAC_KEY, "recover:" + código normalizado)` — nunca el código en claro, y un dominio criptográfico propio, distinto del hash sin clave de `writeToken` (`session-security.server.ts`). El índice único permite ubicar la sesión directamente por el digest (`recoverDiagnosticSession`), sin escanear la tabla. Verificado en vivo (`diagnostic-save-resume-check.mjs`) que el código en claro no aparece en ninguna columna de esta tabla ni en el blob de KV.
- **Escritura del primer SAVE vía `INSERT … ON CONFLICT (session_id) DO UPDATE`** (`saveDiagnosticSession`, `db/queries/diagnostic-save-resume.server.ts`), no un insert-o-update decidido leyendo primero la fila en la aplicación: dos SAVE concurrentes del primer guardado de la misma sesión (doble clic, dos pestañas) ya no compiten por una violación de la restricción de la PK — hallazgo de la revisión independiente de DIAG-V3-07, antes producía un 500 sin control tras agotar los reintentos pensados para colisiones de `recovery_lookup_digest`. Si `completeDiagnosticSession` marca la sesión `COMPLETED` en la misma ventana que un SAVE concurrente, la fila que ese SAVE pudiera haber escrito se borra de inmediato al detectar el conflicto (compensación explícita en la misma función, no un best-effort separado) — nunca queda un snapshot huérfano de una sesión completada.
- **Recuperación rota `writeToken` siempre**: `recoverDiagnosticSession` genera un `writeToken` nuevo, actualiza `token_hash` y pasa `status` de `SAVED` a `IN_PROGRESS`; el `writeToken` anterior queda rechazado de inmediato (verificado con una llamada real inmediatamente después). La comprobación de expiración/versión ocurre ANTES de cualquier escritura: un código expirado o incompatible nunca toca `token_hash` ni `status`. El recovery code NO se invalida ni rota automáticamente en la recuperación — sigue siendo válido hasta completar/expirar/una regeneración explícita (ver arriba).
- **Completar borra el saved snapshot en la MISMA transacción** que marca `COMPLETED` (`database.batch` de `completeDiagnosticSession`, no un paso best-effort separado como el borrado de KV): una vez completada, ninguna recuperación puede reabrir la sesión.
- **Retención**: `SAVED_SNAPSHOT_RETENTION_DAYS = 30` (`app/features/diagnostic/contracts.ts`), mayor que el autosave temporal de KV (7 días) porque es una decisión explícita de la persona. Expiración perezosa (comprobada en `recoverDiagnosticSession`, sin sweep todavía — ver Open Debt en `STATUS.md`).
- **Rate limiting**: `DIAGNOSTIC_RECOVERY_RATE_LIMITER` (binding nativo de Workers, `wrangler.jsonc`, 10 intentos/60s por IP) protege `POST /api/diagnostic/recover` contra fuerza bruta; es una defensa coarse-grained, no un contador transaccional perfecto, y no distingue IPs detrás de un NAT/proxy compartido. No se guarda IP en D1: el binding la usa internamente en el edge de Cloudflare. Verificado en vivo con una ráfaga real que sí produce `429`.

## Analítica del Diagnóstico (DIAG-V3-08)

- **`diagnostic_event`**: un evento de analítica anónimo por fila, `id` autoincrement solo para preservar orden de inserción (nunca expuesto a cliente ni usado como identidad pública). `event_uuid` (generado en el navegador) es la clave real de idempotencia — un reintento del cliente con el mismo UUID nunca produce una segunda fila (índice único). `analytics_schema_version` permite versionar la forma del evento igual que las cinco versiones ya persistidas en `diagnostic_session`. `event_type` es uno de los 6 tipos declarados (`QUESTION_SHOWN`, `ANSWER_SUBMITTED`, `ANSWER_CHANGED`, `QUESTION_INVALIDATED`, `SECTION_ENTERED`, `SAVE_OFFERED`) más `SAME_BROWSER_RESUMED`; `answer_kind` distingue únicamente una categoría — exactamente uno de `answered`, `unknown`, `not_applicable` (`ANSWER_KINDS`, `app/features/diagnostic/analytics.ts`) o `NULL` —, nunca el `OptionId`/valor de respuesta real elegido por la persona. `route_signature` (`computeRouteSignature`, `app/features/diagnostic/route-signature.ts`) es el SHA-256 hexadecimal de `questionBankVersion` + `routingVersion` + la lista ORDENADA de IDs de las preguntas aplicables en ese momento (sin reordenar: el mismo conjunto en otro orden es otra ruta). No codifica perfil, objetivo ni momento ni ninguna respuesta: esas respuestas solo influyen en QUÉ preguntas son aplicables, y la firma se define sobre esa lista de IDs y las dos versiones. Sirve para segmentar métricas por ruta sin reconstruir estado; no es un mecanismo de seguridad. `received_at` es hora de recepción del servidor (spec §62), nunca la hora que reporte el cliente. `retention_until` es la fecha objetivo de purga (política de 180 días, `ANALYTICS_EVENT_RETENTION_DAYS`); **deliberadamente no hay ningún scheduler que la aplique todavía** — `purgeExpiredAnalyticsEvents` (`db/queries/diagnostic-analytics.server.ts`) existe como código, pero no tiene ningún llamador en producción ni en desarrollo, y ninguna prueba comitida la ejecuta: `diagnostic-analytics-check.mjs` solo ejecuta contra la D1 local una réplica SQL de su predicado (`retention_until < now`), no la función (ver `DIAG-V3-08-PURGE-SCHEDULER-001` y `DIAG-V3-08-METRICS-EXEC-001` en `STATUS.md`).
- **Deliberadamente NO almacenado en `diagnostic_event`**: `write_token` (ni en claro ni con hash — el endpoint lo usa solo para autorizar la escritura, nunca lo persiste); ningún valor de respuesta real (`OptionId`/texto libre); IP; user-agent; ningún identificador de persona.
- **Cuatro columnas nuevas en `diagnostic_session`** (migración `0013`, aditiva, no toca ninguna columna existente): `save_count`/`resume_count` (enteros, incrementados por `saveDiagnosticSession`/`recoverDiagnosticSession` respectivamente) y `last_saved_at`/`last_resumed_at` (timestamps del último SAVE/RESUME real). Alimentan `diagnosticAnalytics.saveResume` sin necesidad de escanear `diagnostic_event` para una métrica que ya vive naturalmente en la sesión.
- **El abandono es siempre derivado**, calculado en el momento de la consulta por `diagnosticAnalytics.lifecycle`/`dropoffByQuestion` a partir de los eventos reales y del estado de `diagnostic_session` — nunca una columna `abandoned` en ninguna tabla. Una sesión con un `diagnostic_saved_snapshot` vigente nunca cuenta como abandonada (hallazgo I3 de la revisión independiente).
- **Consultas parametrizadas**: `db/queries/diagnostic-analytics-metrics.server.ts` usa exclusivamente el query builder de Drizzle y `sql` con plantillas etiquetadas — nunca concatenación de strings — para las 8 funciones de `diagnosticAnalytics` (incluidas las que usan SQL crudo para agregaciones que Drizzle no expresa directamente).

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
