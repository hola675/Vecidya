## MiniWeb V2 IMP-02 — persistencia aislada (checkpoint local)

Migraciones `0034`–`0035` crean `miniweb_v2_site`, `miniweb_v2_draft` y `miniweb_v2_publication`, separadas de V1. El borrador tiene revisión CAS; publicación copia un documento inmutable y actualiza el puntero activo mediante batch D1. Las tablas están tenant-scoped por `organization_id`; las consultas reciben la organización explícita y no resuelven membresía por sí mismas, por lo que solo deben llamarse tras guard server-side. Las familias repetibles no tienen índice único. Verificación local: ambas migraciones aplicadas a D1 local limpia; typecheck/build pendientes de registrar al cierre. Sin remoto.
# Base de datos

## Migración productiva 0029 — release 0.8.2 (2026-10-26)

**RAN:** antes de aplicar, D1 `vecidya-prod` (ID `8edc3f04-258e-4c29-9f33-76fec3d25042`) tenía ledger `0000–0028`, 0 licencias `status <> 'cancelled'` y 0 grupos duplicados por organización. Bookmark Time Travel previo: `000005d6-00000000-00005110-e126be1931ae402266769c42a3897da5`. El 2026-10-26T17:24Z se aplicó mediante Wrangler remoto únicamente `0029_organization-license-single-current.sql`; consulta posterior confirma el ledger y el índice parcial `organization_license_one_current_unique`. Staging no se modificó. Rollback específico del índice: `DROP INDEX IF EXISTS organization_license_one_current_unique`. No restaurar el bookmark salvo emergencia evaluada, ya que reemplazaría escrituras posteriores.

## PROD-RELEASE-0.8.4 — ledger remoto sin pendientes (2026-10-27)

El release 0.8.4 no añade archivos de migración ni cambia el esquema. `pnpm exec wrangler d1 migrations list DB --remote` consultó el binding de producción `vecidya-prod` con la cuenta Soporte y respondió `No migrations to apply`. No se ejecutó una aplicación remota ni se escribieron datos.

## PROD-RELEASE-0.8.1 — sin cambios D1 (2026-10-26)

El release directo de `0.8.1` no contiene migraciones ni realizó lecturas/escrituras remotas D1. La última verificación documentada de producción, `2026-10-25`, registró ledger `0000–0028`; este release no lo altera. No se infiere una nueva verificación del ledger a partir del deploy de Worker.

## DIAG-D1-RELEASE-01 / APP-MINI-02C — ledger remoto vigente (última verificación 2026-10-24)

**Actualización de PR #139:** se añadió `0029_organization-license-single-current.sql`; Drizzle journal/snapshot y una D1 limpia `0000–0029` se verificaron localmente. El corte histórico siguiente corresponde al 2026-10-24; la aplicación productiva posterior del 2026-10-26 está registrada arriba.

**Resultado: `0000–0026` aplicadas en staging y producción.** Tras registrar bookmarks Time Travel previos, el 2026-10-24 se aplicaron las migraciones remotas `0024–0026`; el postflight Wrangler devolvió «No migrations to apply» para ambos D1 (`vecidya-staging`, `vecidya-prod`). Los bookmarks previos e IDs están en `ENVIRONMENTS.md`. El postflight SQL anterior de producción confirmó QA-03B con `changed_db=false` y cero filas escritas; `PRAGMA integrity_check`/`foreign_key_check` remotos siguen bloqueados por D1 API (`SQLITE_AUTH`), por lo que no se afirma esa validación remota. El Worker desplegado sigue en `0.7.0`; los cambios de #49/#50 no se publican hasta habilitar R2 y completar el deploy.

**Vigencia:** Cloudflare API confirmó el 2026-10-26 la existencia de ambos buckets R2 y que staging ya tiene un binding D1, pero no se consultó el ledger D1 en esta revalidación. Los datos `0000–0026` anteriores son DOC/RAN históricos, no acreditan el ledger actual ni el estado de `0027–0028`. Reconciliar ambos ledgers con el release owner antes de cualquier migración o despliegue; no aplicar ni reaplicar migraciones en este checkpoint.

### Matriz de migraciones versionadas

| Orden | Migración | Área y efecto de esquema/datos | Riesgo y control de compatibilidad |
| --- | --- | --- | --- |
| 0011 | `0011_diagnostic-persistence-foundation.sql` | Diagnóstico: agrega `diagnostic_session`, respuestas y resultado con índices y cascada sesión→hijos. | Tablas nuevas; no actualiza datos previos. No borrar sesiones para “limpiar” una migración. |
| 0012 | `0012_diagnostic-save-resume.sql` | Diagnóstico: snapshot de reanudación, digest único e índice de expiración. | Tabla nueva vinculada a sesión con `ON DELETE CASCADE`; versiones históricas se leen según el contrato existente. |
| 0013 | `0013_diagnostic-analytics-foundation.sql` | Diagnóstico: eventos e índices; añade cuatro contadores/fechas a `diagnostic_session`. | Aditiva; defaults `0` conservan filas ya existentes. No añade purga de analítica anónima. |
| 0014 | `0014_diagnostic-identification.sql` | Diagnóstico: solicitudes, snapshot, challenges, grants y opt-ins; índices de lookup y expiración. | Nuevas tablas personales/operacionales, cascadas por request y challenge. Sin backfill de datos previos. |
| 0015 | `0015_diagnostic-request-fingerprint.sql` | Diagnóstico: añade `request_fingerprint_hash NOT NULL DEFAULT ''`. | En requests creados entre 0014 y 0015 el default no reconstruye la huella; el código debe tratar el reintento como discrepante, nunca duplicar ni sobrescribir. Confirmar el comportamiento con filas preexistentes. |
| 0016 | `0016_diagnostic-recovery-challenge-purpose.sql` | Diagnóstico: añade `purpose DEFAULT 'verification'` a challenges. | Aditiva; challenges históricos quedan clasificados como verificación para conservar compatibilidad. |
| 0017 | `0017_miniweb-core.sql` | MiniWeb: `miniweb_site` y `miniweb_module`, índices únicos y cascada de organización/sitio. | Tablas nuevas sin backfill; la ausencia de configuración continúa usando el default virtual legado. Aplicar aunque no sea Diagnóstico: la cadena es global y ordenada. |
| 0018 | `0018_diagnostic-funnel-aggregates.sql` | Diagnóstico: tabla de agregado anónimo con CHECK de versión/evento/conteo y columna provisional `diagnostic_report_access.first_opened_at`. | No enlaza agregado con identidad. Columna puente la usa solo la transición siguiente; un Worker intermedio que la lea no puede convivir con 0019. |
| 0019 | `0019_diagnostic-funnel-request-first-open.sql` | Diagnóstico: añade `identified_diagnostic_request.first_report_opened_at`, backfill con `MIN(first_opened_at)` por solicitud y elimina la columna provisional del grant. | Única contracción detectada. Preserva la primera fecha disponible, pero elimina la columna anterior; abortar si la versión publicada la consulta. Certificada con dos grants sintéticos desordenados. |
| 0020 | `0020_platform-admin-training.sql` | Administración: asignaciones de Aprende, progreso e historial con índices y FK. | Tablas nuevas sin semillas ni backfill; cascadas de asignación/progreso/historial y referencias históricas a usuario. |
| 0021 | `0021_platform-organization-lifecycle-invitations.sql` | Administración/Auth: ciclo de organización e invitaciones de owner; índices de estado, digest y unicidad parcial de invitación pendiente por organización. | Tablas nuevas sin backfill. Verificar que versión SQLite/D1 soporta el índice parcial; pasó en Wrangler local. |
| 0022 | `0022_business-profile-publication-snapshot.sql` | Perfil público: snapshot versionado con revisión draft, versión publicada, slug único, schema y JSON por organización. | Aditiva, sin backfill; los perfiles legacy se materializan al primer cambio/publicación. FK con cascade de organización. |
| 0023 | `0023_business-profile-publication-draft-revision-token.sql` | Perfil/MiniWeb: token de escritura CAS para asociar mutaciones a la revisión de draft. | Aditiva; protege escrituras concurrentes y no hace backfill. |
| 0024 | `0024_business-offerings-faq.sql` | MiniWeb: tablas tenant-scoped `business_offering` (servicios/productos) y `business_faq`, con orden, estado activo e índices por organización. | Aditiva, sin seed/backfill; FK con cascade de organización. Aplicada en D1 efímera `0000–0024` y en staging/producción el 2026-10-24. |
| 0025 | `0025_business-media-assets.sql` | Metadatos tenant-scoped de medios (object key único, tipo, MIME permitido, tamaño, texto alternativo y fecha); blobs quedan en R2. | Aditiva, FK con cascade de organización, sin backfill. Aplicada en D1 efímera `0000–0025` y en staging/producción el 2026-10-24. Buckets R2 aún no provisionados. |
| 0026 | `0026_business-media-purpose.sql` | Clasifica medios como portada, galería, logo o icono; la operación de subida limita la portada vigente por organización. | Aditiva sobre `0025`, default `gallery`; sin backfill. Aplicada en D1 efímera `0000–0026` y en staging/producción el 2026-10-24. |
| 0027 | `0027_business-media-draft-removal.sql` | Añade `is_active` para retirar medios del próximo snapshot sin borrar un objeto que aún usa la publicación vigente. | Aditiva, default `true` conserva todas las filas existentes. Producción confirmó ledger `0000–0028` el 2026-10-25; staging sin evidencia de aplicación. |
| 0028 | `0028_miniweb-offering-image.sql` | Añade `business_offering.image_asset_id` nullable para referenciar una imagen tenant-scoped del negocio desde cada oferta. | Aditiva y sin backfill; las referencias solo pueden asignarse a imágenes activas de la organización por la API protegida. Aplicada a producción el 2026-10-25; staging no se modificó. |
| 0029 | `0029_organization-license-single-current.sql` | Índice único parcial sobre `organization_license(organization_id)` mientras `status <> 'cancelled'`. | Evita más de una licencia vigente por organización bajo concurrencia; aplicada en D1 local y producción el 2026-10-26 tras preflight sin duplicados. Staging no se modificó. |
| 0030 | `0030_business-profile-tiktok-youtube.sql` | Redes sociales | Añade `business_profile.tiktok_url` y `business_profile.youtube_url`, opcionales; aplicada a producción el 2026-10-28 (ver `ENVIRONMENTS.md`). |
| 0031 | `0031_learn-access-grant.sql` | Grants Aprende | Añade un grant por `member.id`, con actor y fecha; FK a `member` en cascada para revocarlo al retirar la membresía y FK a `user` para auditar al owner. Sin backfill; no concede grants automáticamente. |
| 0032 | `0032_learn-personal-progress.sql` | Aprende personal | Añade progreso por `(user_id, guide_id)`, checks por sección con cascada al progreso de la guía y favoritos separados; FK a `user` en cascada. Versiones, `reset_epoch`, revisión editorial y fechas. Sin backfill ni datos de organización. |
| 0033 | `0033_learn-sync-operations.sql` | Aprende sync | Conserva tombstones/versiones para check y favorito; añade cursor de dispositivo y recibos idempotentes con unique `(user, device, sequence)`. Sin backfill; defaults conservan checks y favoritos de 0032. |

### Migración local — `0033_learn-sync-operations` (checkpoint F5)

**Alcance:** conservar tombstones `unchecked` y `unfavorite` con versiones por target; agregar recibos idempotentes y cursor por dispositivo para `client_sequence`. Los recibos no guardan contenido editorial, solo operación/resultado/versión. La cola local y el endpoint descartan operaciones con más de 30 días. El Worker implementa purga diaria por lotes de recibos con más de 90 días usando el índice `created_at`; no elimina progreso, favoritos ni cursores de dispositivo. El cursor acepta secuencias estrictamente crecientes con huecos para que descartar operaciones vencidas no bloquee cambios posteriores.

La purga programada requiere que `LEARN_OPERATION_RECEIPT_PURGE_ENABLED` y `LEARN_OPERATION_RECEIPT_PURGE_APPROVED` sean ambos `true`. La configuración de producción mantiene ambos en `false` hasta completar la revisión legal, de privacidad y costo; la validación local puede habilitarlos explícitamente. La base operativa 90/30 fue aceptada por el usuario, pero no constituye aprobación legal ni habilita producción.

**Riesgo y rollback:** aditivo, con defaults que interpretan checks/favoritos F4 existentes como activos. Revertir el Worker y conservar las columnas/tablas; no borrar progreso ni recibos. Wrangler local aplicó migraciones `0000–0033` y la certificación Worker/D1 F5 verificó sync, replay, dispositivos independientes y barrera de reset. Ningún D1 remoto se inspecciona o modifica.

**Gate pendiente fuera del código:** revisión de privacidad, retención, aviso y exportación/borrado antes de activar sync/importación en producción. La purga técnica local está implementada, pero no habilitada en producción; no inferir consentimiento legal a partir de una acción de UI.

### Plan de migración — `0032_learn-personal-progress`

**Riesgo:** bajo; tres tablas nuevas aditivas, sin backfill ni cambios al esquema existente. La clave de usuario impide compartir progreso entre cuentas; los checks tienen FK compuesta a la fila personal de guía y se eliminan al reiniciar. Los favoritos viven en tabla aparte, así que un reinicio o pérdida de entitlement no los borra.

**Aplicación y rollback:** probar toda la cadena `0000–0032` en D1 local efímera. Si se revierte el Worker, dejar las tablas y cualquier dato personal inactivo; no hacer `DROP TABLE` ni purgar progreso. No aplicar esta migración en staging o producción en este checkpoint.

**Verificación:** confirmar ledger hasta `0032`, creación de las tres tablas, relación/cascada de secciones, usuario propietario y separación entre favoritos y progreso; `PRAGMA foreign_key_check` vacío en D1 local. No se consulta ni modifica D1 remota.

### Plan de migración — `0031_learn-access-grant`

**Riesgo:** bajo, aditivo. La migración solo crea `organization_learn_access_grant`; no altera tablas existentes ni modifica filas. El grant se identifica por la membresía Better Auth aceptada, no por correo, rol `admin` ni `billing_account`.

**Aplicación y rollback:** generar con Drizzle y probar la cadena completa desde una D1 local vacía. El rollback de aplicación consiste en revertir el Worker y dejar la tabla sin uso; no eliminar grants existentes automáticamente. Si en un entorno aislado se decide retirar el esquema antes de guardar datos, `DROP TABLE organization_learn_access_grant` revierte la estructura. En entornos compartidos/remotos no se aplicará ni se eliminará sin autorización y revisión de datos; nunca usar `drizzle-kit push`.

**Verificación:** ledger `0000–0031`, `PRAGMA foreign_key_check`, cascada al retirar una membresía, unicidad de `member_id`, rechazo de grant cross-organization en el servicio y auditoría atómica de conceder/revocar. La evidencia de D1 local de este checkpoint se registra en `TESTING.md`; ninguna D1 remota se consulta ni modifica.

No se detectan `DROP TABLE`, borrados de filas ni renombrados; `0019` es la única contracción (`DROP COLUMN`). `0010` contiene seeds de tres precios y cuatro tiers; las migraciones posteriores no los actualizan. Integridad de seeds, datos sintéticos, relaciones, índices y snapshot/token se verificó localmente.

### Evidencia local ejecutada

- `node tests/e2e/diagnostic-d1-release-check.mjs`: PASS desde D1 sintética exactamente en 0010, aplicando `0011–0023`, con ledger exacto, integridad/FK SQLite, índices, seeds, backfill mínimo de 0019, snapshot `0022` y token `0023`. No usa `--remote`.
- D1 local nueva con `pnpm exec wrangler d1 migrations apply DB --local`: `0000–0023` aplicadas en orden; sin errores.
- `pnpm run test:unit` 1652/1652; `pnpm run test:email` 12/12 (fake); typecheck y build PASS. `diagnostic-v3-qa03b-check.mjs` PASS (seis recorridos, reanudación, concurrencia e informe HTML); `miniweb-core-check.mjs` PASS 33/33; `platform-admin-global-certification-check.mjs` PASS con D1 efímera, invitaciones, auth/roles, lifecycle, licenciamiento de perfil, training y MiniWeb.
- `platform-licensing-check.mjs` no llegó a sus aserciones: el harness intenta registro público sin invitación y recibe `403` («El registro requiere una invitación válida»). Se considera incompatibilidad conocida del arnés con la política actual de registro; no un fallo de las migraciones ni un PASS de licenciamiento. La matriz de licencias y el gate de perfil sí se ejercitaron en pruebas unitarias y en la certificación integrada de administración.
- La prueba incremental detectó limitación de D1 local: Wrangler deniega `PRAGMA` vía su endpoint; por eso las comprobaciones SQLite se ejecutan sobre el archivo de persistencia local después de cerrar Wrangler. No afecta la base compartida ni remota.

### Ejecución y controles remotos (actualizado 2026-10-24)

El primer corte observó `0000–0010` y aplicó `0011–0023` (2026-10-23). El 2026-10-24 se aplicaron `0024–0026` en ambos objetivos después de guardar bookmarks nuevos. Postflight con `CLOUDFLARE_ACCOUNT_ID` explícito y `migrations list` confirmó cero pendientes en staging y producción. La inspección de esquema QA-03B previa confirmó que 0019 quedó aplicado; `PRAGMA` remoto sigue sin permiso del API, por lo que integridad/FK remotas no se certifican aquí.

| Gate | Staging | Producción |
| --- | --- | --- |
| Identidad y preflight | Confirmar explícitamente cuenta, binding/ID, entorno, versión del D1 storage, SHA de Worker desplegado y ledger real; inspeccionar esquema/índices/filas solo con autorización de lectura. | Repetir el mismo preflight para el objetivo explícito. La evidencia de staging no se extrapola. |
| Compatibilidad | Confirmar que el Worker activo no consulta `diagnostic_report_access.first_opened_at`; probar la versión nueva en local con flags cerrados. Staging conserva `EMAIL_PROVIDER=fake`, flags funnel/purga `false` y no tiene Cron. | Abortar si no se identifica el Worker activo o si lee la columna retirada en 0019. Mantener el Worker anterior durante el cambio solo si esa compatibilidad está demostrada; Wrangler advierte que D1 puede no estar disponible durante cada aplicación. |
| Backup | Capturar y guardar el bookmark inmediato de Time Travel; comprobar `version: production`. Preparar además export/copia fuera de la base si la política de recuperación lo exige. | Repetir antes de operar. Registrar persona operadora, hora UTC, ID del target, bookmark y destino de copia sin incluir PII en el PR. |
| Aplicación | `0011–0026` aplicadas; `migrations list` del 2026-10-24 sin pendientes. | `0011–0026` aplicadas; `migrations list` del 2026-10-24 sin pendientes. |
| Postflight | Ledger/schema sin pendientes; configuración de staging con correo fake, flags cerrados y sin Cron. Rutas públicas verificadas. | Ledger/schema QA-03B verificado; conteos agregados preactivación cero. Funnel y switches de purga quedaron activos por autorización explícita; Cron diario `03:17 UTC`. PRAGMA remoto denegado por D1 API (`SQLITE_AUTH`), sin certificación remota de FK/integridad. |

**Abortar** ante target ambiguo, ledger/esquema distinto, filas huérfanas, backup/bookmark no verificable, Worker que dependa de columna retirada, error en cualquier migración, checks de postflight fallidos, o migración no prevista. Wrangler revierte la sentencia fallida, pero migraciones anteriores exitosas pueden seguir aplicadas: registrar el ledger parcial y no repetir a ciegas.

**Rollback de aplicación:** desplegar de vuelta el SHA anterior con los flags cerrados y mantener las tablas/columnas ya añadidas. No crear migraciones down improvisadas. **Recuperación de datos/schema:** Time Travel restaura toda la base, sobrescribe cambios posteriores al bookmark y cancela consultas en vuelo; exige aprobación específica, ventana de mantenimiento y evaluación de escrituras posteriores. Anotar el bookmark anterior y el bookmark de deshacer que devuelve la operación; preferir recuperación hacia una copia/export cuando sea viable para preservar escrituras posteriores. Ver [Time Travel y backups de D1](https://developers.cloudflare.com/d1/reference/time-travel/) y [comandos Wrangler D1](https://developers.cloudflare.com/d1/wrangler-commands/). No se ensayó restore.

**Backlog de purga preactivación (completado):** se consultaron solo conteos agregados por tabla, sin listar identidades, correos, tokens ni informes. Las seis categorías de expirados/huérfanos devolvieron cero (`changed_db=false`, cero filas escritas). La autorización legal y operativa para la política configurada (solicitud/informe 30 días, challenge 24 horas) fue confirmada por el usuario; producción ya tiene activos ambos switches y Cron diario a las 03:17 UTC. Staging conserva flags cerrados y no tiene Cron. Primera ejecución productiva programada posterior al deploy: `2026-10-24T03:17Z`; no se invocó manualmente `scheduled()` en producción.

### Autorizaciones pendientes exactas

1. **Cerrado:** lectura/preflight y escritura de migraciones `0011–0023` en staging y producción, conforme a la autorización del usuario del 2026-10-23.
2. **Cerrado:** deploy QA-03B `0.7.0` en ambos entornos y HTTP anónimo fechado; producción `517126e4-a3cd-4309-8501-5a49d57cd15f`. Ver `ENVIRONMENTS.md`.
3. **Cerrado:** autorización de activación de funnel/Gmail y purga en producción; el usuario confirmó aprobación de la política legal de retención. Conteos agregados previos a la activación: cero en las seis categorías de vencidos/huérfanos.
4. La validación de entrega Gmail de extremo a extremo sigue pendiente; no se envió correo real como parte de este checkpoint.

El entorno local de certificación usó D1 aislada y D1 temporal sintética hasta `0023`. En remoto solo se aplicaron las migraciones aprobadas; no se insertaron datos de prueba ni se hizo restore. No se envió correo real. Funnel/purga quedaron activos solo en producción; staging conserva los switches cerrados.

## DIAG-FUNNEL-PROD-01 — compatibilidad D1 y migración pendiente (2026-10-22)

No se modifica schema ni se genera migración en este checkpoint. La ruta identificada lee solicitud, snapshot, challenge, grant y preferencias (0014–0016); `getAuthorizedReport` también lee `first_report_opened_at` de 0019. Los incrementos agregados de 0018 son best-effort y no bloquean la solicitud si fallan. Para preservar la secuencia global no se pueden saltar migraciones intermedias, incluida 0017 de MiniWeb.

| Migraciones | Contenido pertinente | Local | Remoto documentado |
| --- | --- | --- | --- |
| `0000–0010` | Base y licencias | Cadena versionada | Producción `vecidya-prod`: aplicadas según última evidencia, 2026-10-11 |
| `0011–0013` | Persistencia, reanudación y analítica diagnóstica histórica | Aplicadas en la D1 efímera de certificación previa; no se revalidaron ahora | No aplicadas según último estado documentado |
| `0014–0016` | Solicitud/snapshot/challenge/grant/opt-ins, huella idempotente y propósito de recovery | Aplicadas en D1 efímera previa; no se tocó la D1 local compartida ahora | No aplicadas según último estado documentado |
| `0017` | Core MiniWeb, incluida por secuencia global | Aplicada en D1 efímera previa | No aplicada según último estado documentado |
| `0018–0019` | Agregados funnel y first-open por solicitud | Aplicadas en D1 efímera previa | No aplicadas según último estado documentado |
| `0020–0021` | Capacitación por organización e invitación/lifecycle de owner | Aplicadas en D1 efímera local del checkpoint PLATFORM-ADMIN-GLOBAL y repetidas para DIAG-PRIVACY-PURGE-01 | No aplicadas según último estado documentado |

**Matriz y rollback propuestos, no ejecutados:** validar desde D1 aislada vacía la secuencia completa `0000–0021`, foreign keys, índices, seed count y lectura/escritura del embudo; capturar un bookmark/backup antes de cualquier aplicación autorizada; aplicar en orden en un checkpoint aparte; confirmar ledger y esquema antes de habilitar el flag. El rollback operativo inicial es volver `DIAGNOSTIC_REPORT_FUNNEL_ENABLED=false` y conservar datos/esquema; no se prepararon migraciones descendentes ni se probó restauración. No aplicar a `vecidya-prod` o staging sin autorización expresa.

La retención de solicitud/snapshot/grant es 30 días en código y el challenge vence hasta en 24 horas; el usuario confirmó aprobación legal para esos plazos. Expirar bloquea acceso pero no elimina físicamente filas por sí mismo. DIAG-PRIVACY-PURGE-01 incorpora `scheduled()` diario a las 03:17 UTC y batch acotado de hasta 100 filas por tabla. Producción tiene ambos switches activos; staging permanece desactivado y sin Cron. La primera ejecución productiva posterior a la activación está programada para `2026-10-24T03:17Z`.

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


## PLATFORM-ADMIN-GLOBAL — persistencia (2026-10-22)

La migración `0020_platform-admin-training.sql` agrega `organization_training_assignment`, `organization_training_progress` y `organization_training_progress_history`. La primera asocia una organización con un `slug` existente de Aprende (único por organización); la segunda guarda el estado declarado por usuario y asignación (único por par); la tercera conserva cambios de estado, actor y motivo opcional. Asignación/corrección interna escribe `platform_audit_log` en el mismo batch D1. El progreso propio escribe su historial, pero no una auditoría global de lectura.

`0020` agrega capacitación y `0021_platform-organization-lifecycle-invitations.sql` agrega el lifecycle y la invitación de propietario con digest, expiración y unicidad de invitación pendiente por organización. El ciclo enumera solo `pending_owner`, `owner_invited`, `active` y `suspended`; `closed` no se ha creado. `0021` se genera desde `db/schema/auth.ts`; la cadena local hasta `0021` se aplicó en D1 aislada del worktree, sin D1 remota. La aceptación ejecuta consumo condicional, membership, ciclo y auditoría mediante un solo `D1Database.batch`.

La asignación general se implementa; no hay asignación individual ni transferencia de owner. El progreso propio usa historial separado; el progreso corregido por platform admin escribe historial y `platform_audit_log`. La retención global de auditoría y la certificación de carreras siguen pendientes.

## APP-CLIENTE-00-PUBLISH-001 — snapshot público (2026-10-23)

`0022_business-profile-publication-snapshot.sql` agrega `business_profile_publication`, una fila por organización con revisión draft, versión publicada, slug publicado único, versión de schema, snapshot JSON y timestamp. `0023_business-profile-publication-draft-revision-token.sql` agrega `draft_write_token` para asociar mutaciones de perfil, horarios y MiniWeb al CAS que incrementó la revisión. La tabla tiene FK a `organization` con `ON DELETE CASCADE`; no se hace backfill global. Los perfiles legacy se materializan al primer cambio/publicación de esa organización.

El snapshot de versión 4 contiene un DTO allowlisted de perfil, horarios, configuración MiniWeb, ofertas/FAQ, referencias de medios, branding e imágenes asignadas a ofertas (sin claves R2). El parser mantiene compatibilidad con versiones 1–3; las versiones anteriores migran en lectura con referencias nuevas vacías. Guardar incrementa revisión y modifica el draft en el mismo batch nativo D1; publicación incrementa versión pública y revisión, escribe el snapshot y actualiza el estado/configuración pública/auditoría con comprobaciones condicionales. Los loaders de draft cercan datos con revisión antes/después y reintentan hasta tres veces; sin estabilidad responden `409`. Una inicialización legacy puede completar condicionalmente una fila vacía solo en su revisión inicial. Una fila de publicación existente sin snapshot válido falla cerrada para perfil, directorio y sitemap; sin fila de publicación, el contenido legacy continúa disponible hasta que una mutación materialice el snapshot antes de cambiar el draft. Una revisión obsoleta o carrera pierde el token y recibe `409`. La entrega R2 requiere que el ID esté en el snapshot vigente y que el objeto y sus metadatos pertenezcan a la organización del perfil. La migración `0028` y la cadena `0000–0028` se aplicaron desde cero a una D1 efímera local para esta implementación. No se aplicaron migraciones a ninguna D1 compartida o remota.


Última reconciliación: **2026-10-24 (APP-MINI-02F, local).** La cadena `0000`–`0028` se aplicó en D1 efímera aislada desde cero. `0022`/`0023` mantienen snapshot público versionado y control de revisión; `0024` añade ofertas y FAQ; `0025`/`0026` añaden medios y propósito; `0027` agrega retirada lógica de medios para draft; `0028` añade referencia opcional de imagen a `business_offering`. D1 compartida y remotas no se migraron. La última verificación remota documentada permanece en `0000–0026`; consultar `ENVIRONMENTS.md` para límites y evidencia de producción.

## APP-MINI-02A — configuración modular

`db/schema/miniweb.ts` añade dos tablas, sin migración masiva:

- `miniweb_site`: una fila por `organization_id` (índice único), `template_key`/versión y `layout_variant` draft, snapshot de configuración publicada versionado y timestamps. La fila se crea al guardar/publicar configuración, nunca por una lectura virtual.
- `miniweb_module`: filas draft por sitio/tipo (índice único `(miniweb_site_id, module_type)`), versión, `enabled`, `sort_order`, variante y `settings_json`. En 02A `settings_json` se valida como `null`; no se acepta contenido ejecutable ni JSON arbitrario.

Ambas relaciones usan cascade al borrar la organización/sitio; índice por sitio y orden. El snapshot publicado contiene solo configuración estructural, no duplica perfil, horarios ni gobernanza. Los módulos y las plantillas se validan contra registries versionados en código; la ausencia de snapshot/fila resuelve el default virtual compatible con perfiles legacy, pero un snapshot no nulo inválido falla cerrado a `hero`. La migración generada es `0017_miniweb-core.sql`; el ledger local sigue pendiente por la migración anterior `0016` ajena a este checkpoint. Ninguna D1 remota se modificó.

## FUNNEL-01C — datos de informe identificado (local)

`db/schema/diagnostic-identification.ts` define solicitud identificada, snapshot serializado/hash/versionado, challenges de correo con digest/expiración/intentos, grants con digest, dos registros independientes de opt-in y el agregado FUNNEL-01D.1 (36 tablas en el schema Drizzle). `identified_diagnostic_request.first_report_opened_at` deduplica por solicitud, incluso tras recovery; al borrar la solicitud la marca desaparece con su dominio, mientras el agregado permanece sin FK. Las FK de snapshot, challenge, acceso y consentimientos usan `ON DELETE CASCADE`. Email/teléfono/nombre e informe solo existen en sus tablas operacionales de desarrollo; no se copian al agregado. IP no se persiste y cookie se guarda solo como digest.

| Migración | Propósito | D1 local | Remoto |
| --- | --- | --- | --- |
| `0014_diagnostic-identification.sql` | Solicitud, snapshot, challenge, grant, opt-ins A/B/C | Aplicada `RAN` 2026-10-12 | No aplicada |
| `0015_diagnostic-request-fingerprint.sql` | Huella ligada a idempotency key y contenido | Aplicada `RAN` 2026-10-12 | No aplicada |
| `0016_diagnostic-recovery-challenge-purpose.sql` | Distingue challenge `verification` de `access_recovery` con default de compatibilidad `verification` | Aplicada solo en D1 temporal aislada de C1.3; shared local ledger pendiente | No aplicada |
| `0018_diagnostic-funnel-aggregates.sql` | Agregado FUNNEL-01D.1 y marca inicial provisional en grant | Aplicada a D1 temporal de checkpoint | No aplicada |
| `0019_diagnostic-funnel-request-first-open.sql` | Marca first-open por solicitud; backfill con `MIN(first_opened_at)` y retiro del campo por grant | Aplicada a D1 temporal aislada 01D.1-R | No aplicada |

La expiración invalida consultas de informe y `purgeExpiredIdentifiedReports()` ejecuta en lotes limitados de 100: grants revocados/vencidos/inaccesibles, snapshots/challenges vencidos y huérfanos y preferencias de solicitudes vencidas/huérfanas. La solicitud solo se elimina cuando no quedan hijos, evitando cascadas no acotadas; las tandas posteriores continúan sin perder progreso. Un fallo de D1 revierte el batch y la siguiente ejecución puede reintentarlo. El Cron llama a este mismo helper y registra solo conteos agregados. Los dos switches destructivos están activos en producción por autorización explícita; en staging están `false` y no hay Cron. La ruta manual anterior es local/dev. B/C bajo solicitud vigente se conservan; una solicitud vencida se elimina con su rama mediante los sweeps. Los plazos configurados son 30 días/24 horas y cuentan con aprobación legal confirmada por el usuario. No migrar/reinterpretar sesiones anteriores ni vincular el agregado anónimo.

**Revisión de derechos:** `PATCH` de revocación y `DELETE` voluntario viven en la acción del informe identificado y requieren `Origin` same-origin, cookie grant, solicitud/snapshot/grant vigentes y coincidencia de request ID. Revocación solo cambia `revoked_at IS NULL` a timestamp (monótona e idempotente) en B/C seleccionadas; no elimina el informe ni el agregado. El borrado elimina request y dependencias operacionales en cascade tras volver a validar grant y expiraciones en el DELETE; no elimina `diagnostic_funnel_aggregate`, que carece de FK/IDs personales. Errores no revelan si otro UUID o email existe. La interfaz solo está disponible cuando el funnel está habilitado.

**Propuesta para aprobación humana (no es política vigente):** A — identidad, solicitud y snapshot del informe: 30 días desde emisión; eliminación voluntaria: inmediata al pedido autorizado. Challenges: máximo 24 h y borrado tras vencimiento/consumo/revocación; grants: hasta expiración de request/snapshot (máximo técnico 30 d) o revocación, luego sweep. B/C — mantener solo estado/fecha de revocación mientras la solicitud vive y borrarlos con A al vencer; antes de decidir verificar si se exige conservar evidencia de consentimiento por más tiempo. Agregados diarios por versión/evento podrían conservarse solo después de confirmar que no existe ruta de reidentificación y sin llave de unión. Excepciones legales y cualquier periodo distinto requieren revisión profesional antes de habilitar.

## DIAG-V3-FUNNEL-01C.2 — matriz temporal, recuperación y derechos (2026-10-13)

La corrida final de la matriz usó un Worker Vite y una D1 efímera aislada en `%LOCALAPPDATA%\Temp\kilo\vecidya-funnel-01c2-final2-d1`; se aplicaron migraciones solo allí. El E2E limpió sus solicitudes QA por ID y el buzón por requestId. Una lectura posterior encontró dos solicitudes/snapshots/challenges de correo distinto al alias de prueba, sin grants; se conservaron sin modificación por no tener procedencia conocida. Un temp previo con dos fixtures QA se limpió solo tras comprobar que no había otras filas. La D1 local compartida no se usó para purga ni limpieza en este checkpoint. No se añadió schema ni se accedió a D1 remota.

| Entidad vigente | Finalidad | Expiración/acceso actual | Retención física / decisión |
| --- | --- | --- | --- |
| `identified_diagnostic_request` + hashes de idempotencia/huella | A: calcular y entregar el informe solicitado; identidad de contacto necesaria para verificación | La solicitud vencida no autoriza; 30 días parametrizados | Purga en cascada de la solicitud expirada; 30 días son provisionales, falta aprobación |
| `diagnostic_report_snapshot` | A: conservar resultado exacto del motor ya calculado, incluidas puntuación/confianza y evidencias | Solo se lee con grant y si solicitud, snapshot y grant están vigentes; 30 días | Se elimina con solicitud; no recalcular al identificar/verificar/reintentar |
| `verified_email_challenge` | A: confirmar control del email y recuperación de acceso, con `purpose` explícito | Digest, TTL provisional de hasta 24 h y no mayor que request/snapshot, intentos/estado; cada challenge solo se consume una vez | Purga conforme al ciclo de la solicitud; no almacenar token en claro |
| `diagnostic_report_access` | A: autorizar lectura del snapshot | Digest en cookie HttpOnly; estado revocado/vencido/solicitud vencida bloquea; TTL hasta 30 días | Cascade al borrar solicitud; expiración de acceso no equivale a borrar la solicitud |
| `commercial_contact_intent` (B, opt-in separado) | Contacto comercial opcional | Revocación `PATCH` del informe con grant vigente; `revoked_at` monotónico | Relacionado por FK/cascade; conservar mientras la solicitud vive, plazo final pendiente de responsable/privacidad |
| `diagnostic_research_intent` (C, opt-in separado) | Investigación/mejora voluntaria | Revocación `PATCH` independiente del informe con grant vigente | Relacionado por FK/cascade; conservar mientras la solicitud vive, plazo final pendiente de responsable/privacidad |

**Derechos implementados en la página identificada, detrás del gate del funnel:** `PATCH` same-origin con cookie HttpOnly/SameSite=Strict y grant vigente, request ID coincidente y actualizaciones atómicas monotónicas de `revoked_at`; no acepta solo UUID ni cambia el snapshot. La retirada no reautoriza una finalidad, no borra A y no sincroniza con GHL. `DELETE` voluntario revalida grant/request/snapshot en la propia sentencia y elimina el árbol operacional en cascade. Agregados sin FK/ID se conservan. No enumerar si email o UUID existen. La ejecución solo está disponible localmente hasta autorizar el flag.

**Recuperación aprobada e implementada solo en dev/local:** si el POST de verificación consume el challenge y persiste un grant pero se pierde la respuesta, repetir el token devuelve `404` y no duplica grants. La persona puede pedir otro enlace desde el error; el POST de reenvío admite `verification_pending` o `verified`, devuelve el mismo `202 {accepted:true}` sin PII/ID, limita por IP/request y solo envía al email ya guardado cuando solicitud/snapshot siguen vigentes. El challenge de recovery tiene `purpose=access_recovery`; el POST explícito lo consume una vez y en el mismo batch revoca grants anteriores e inserta uno nuevo cuyo expiry no excede el del request/snapshot. El snapshot no se recalcula. La página, ruta y buzón simulados son dev-only; no se implementó proveedor real y el flujo no se publica.

No hay plazo final de retención aprobado para A/B/C, evidencia de consentimiento, analytics ni revisión de derechos. 24 h/30 d son parámetros técnicos de prueba, no política legal ni operativa.

E2E C1.3 (2026-10-16): `PASS` en Worker/D1 temporal vacía, incluyendo expiración exacta de recovery si request/snapshot vencen, enlace consumido/reemitido, GET/prefetch, dos pestañas, un solo grant activo con grants anteriores revocados, hash/versiones del snapshot idénticas y cleanup final con cero filas. Unitarias `1557/1557`, typecheck/build y E2E 01B también `PASS`. Sin correo real, cambio a D1 compartida ni aplicación de migración remota.

## DIAG-V3-FUNNEL-01C.3 — recovery local después de una respuesta perdida (2026-10-16)

**Contrato aprobado e implementado solo para Worker local/dev; no habilita uso real.** La migración `0016_diagnostic-recovery-challenge-purpose.sql` agrega `purpose` al challenge (`verification` por default o `access_recovery`). El POST existente de reenvío acepta solicitudes `verification_pending` o `verified`, pero responde el mismo `202 {accepted:true}` sin PII/ID para cualquier UUID válido; solo en la segunda situación intenta enviar al email ya guardado un challenge `access_recovery`, si solicitud y snapshot siguen vigentes. Se limita por IP y request ID. El proveedor continúa siendo el buzón simulado y la ruta de email/verificación sigue en el conjunto dev-only.

El challenge requiere la acción explícita POST desde la página. GET, prefetch y abrir el enlace no consumen. En el batch de canje, `purpose` y estado esperado de la solicitud se validan junto con sus expiraciones; `now >= expiresAt` cierra acceso. Para recovery el batch revoca todos los grants previos y crea uno nuevo, con `expiresAt <= min(expiración de solicitud, snapshot, TTL de grant)`. Replay/concurrencia del mismo challenge no duplica el grant; un token viejo de `verification` no incrementa los intentos del challenge de recovery vigente. El informe/snapshot no se recalcula ni modifica: D1 E2E compara digest, motor y versiones antes/después.

E2E local confirmó respuesta perdida tras commit, cookie ausente, `202` genérico de recovery, reto nuevo en mailbox simulado, dos pestañas consumiendo un solo challenge, revocación atómica del grant previo, exactamente un grant activo, recuperación del mismo request/snapshot y ausencia de reenvío cuando request o snapshot vencieron. Las pruebas usaron D1 efímera con `0016` y D1 local, sin correo real, cron, integración GHL ni migración remota. Gestión/revocación de B/C y borrado con retención de evidencia quedan pendientes de aprobación operativa/privacidad.

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
| `business_profile` | perfil comercial (borrador/publicado) | organization (cascade) | **único `organization_id`**; **único `slug` (global)** | `organization_id`, 1:1 | `0003`; `0007` (whatsapp, redes); `0030` (TikTok, YouTube); `0008` (`service_mode`, `service_area`) |
| `business_hours` | horario por día (1–7 ISO), `is_closed` | organization (cascade) | único `(organization_id, day_of_week)` | `organization_id` | `0008` |
| `business_profile_governance` | verificación y estado de plataforma; solo escribe `platform_admin` | business_profile (cascade); `verified_by`/`suspended_by` → user (**sin acción**) | único `business_profile_id` | indirecta vía perfil; propiedad de plataforma | `0009` |
| `miniweb_site` | configuración draft de plantilla/layout y snapshot publicado de configuración estructural | organization (cascade) | único `organization_id` | `organization_id`, 1:1 | `0017` (ledger pendiente) |
| `miniweb_module` | módulos draft activables/ordenables; settings limitados y validados | miniweb_site (cascade) | único `(miniweb_site_id, module_type)`; índice por sitio/orden/tipo | vía `miniweb_site.organization_id` | `0017` (ledger pendiente) |
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
- **Titular elegido por Admin.** Un `platform_admin` activo puede asignar o transferir la facturación
  a cualquier usuario existente; no se infiere la cuenta desde la membresía ni se restringe al dueño
  operativo de la organización. La API valida la existencia de organización y usuario. Las
  transferencias requieren los IDs observados de licencia y cuenta, y actualizan la licencia junto
  con una sola auditoría únicamente si gana el CAS; un estado obsoleto devuelve `409`.
- **Grandfathering real, no solo documental.** `organization_license.price_id` referencia una fila
  concreta de `license_price`. Cuando se publica un precio nuevo para un plan (`effective_from`
  posterior, el anterior pasa a `status = 'retired'`), las licencias ya contratadas siguen
  resolviendo su precio por el `price_id` guardado, nunca por `plan_code` + fecha actual. Verificado
  `RAN` en `platform-licensing-check.mjs`.
- **Un cambio de plan crea una fila nueva.** `changeOrganizationLicensePlan` no muta `plan_code` en
  la fila existente: la cancela (`status = 'cancelled'`, `ends_at`) y crea una fila `active` con el
  nuevo plan y su precio vigente. `0029` impone `organization_license_one_current_unique`, índice
  único parcial por organización sobre toda fila cuyo estado no sea `cancelled` (incluye `pending`,
  `active` y `suspended`). La base, no una consulta previa/UI, arbitra asignaciones simultáneas. La
  API devuelve `409` ante la carrera; el cambio de plan exige el ID observado para rechazar formularios
  obsoletos. Creación/cambio y su audit row permanecen en un batch D1 atómico.
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

**Límite del modelo:** `ends_at` registra una finalización/cambio administrativo; no hay `expires_at`,
renovación automática, checkout, cobro ni scheduler de licencias. La vigencia comercial por ciclo
queda fuera de implementación hasta una decisión compatible con el catálogo y facturación.

### Decisión y contrato aprobado — cancelación manual e historial (2026-10-26)

Decisiones del usuario: las licencias son manuales, sin renovación automática ni vencimiento; cancelar
es inmediato; una licencia cancelada puede reactivarse en la misma fila conservando su `id`; al
reactivarla debe recuperar el estado previo (`pending`, `active` o `suspended`). El historial requerido
es una cronología auditada con fecha, actor y valores anterior/nuevo. La cancelación no representa
reembolso ni movimiento de dinero.

Sin agregar endpoint, el `POST /api/platform/organizations/{organizationId}/license` protegido por
sesión `platform_admin` activa y `organization:license:update` aceptará `operation: "cancel"` con
`currentLicenseId`; cancela inmediatamente la licencia vigente y audita el estado anterior →
`cancelled` en la misma operación CAS. El cuerpo inválido o campos requeridos ausentes responden
`400`; sin sesión se conserva el comportamiento del guard existente; rol/plataforma sin autorización
responden `403`; organización/licencia objetivo inexistente responde `404`; cambios obsoletos o
transiciones no permitidas responden `409`; errores inesperados conservan el manejo `500` existente.
El éxito responde `200` con `{ id, status }`.

`operation: "reactivate"` conserva el formato existente y admite la licencia suspendida (a activa) o
cancelada por esta operación (al estado guardado en el evento de cancelación). Cambios obsoletos o
transiciones no permitidas responden `409`; una licencia cancelada por cambio de plan no es
reactivable mediante este flujo. El identificador no cambia y no se crea una nueva fila. Cancelar y
reactivar actualizan `organization_license` y su evento de auditoría en un batch D1 atómico; CAS usa
ID de licencia, organización y estado observado.

La pantalla `/app/internal/licenses` presentará los eventos `organization_license.*` de cada negocio
en orden cronológico, con fecha, nombre del actor, acción y valores legibles anterior/nuevo. Incluirá
asignación, cambio de plan, cambio de estado, cancelación y transferencia. No se propone una migración:
la auditoría existente (`platform_audit_log`) será la fuente de la cronología; la cancelación añadirá
el evento `organization_license.cancelled` (`previous_value` = estado previo, `new_value` =
`cancelled`). La vista queda bajo las mismas guardas de Admin; valores técnicos sin etiqueta conocida
se mostrarán de forma segura con su nombre de acción.

Implementado localmente sin migración: cancelación inmediata con CAS y auditoría; reactivación de la
misma fila solo cuando el evento demuestra cancelación administrativa, restaurando el estado previo;
cronología completa por negocio con actor/fecha/valores. Sin proveedor de cobro, vencimiento ni
renovación automática. E2E del Worker/D1 local y navegador PASS; ver `TESTING.md`.

## Migraciones

`_journal.json` tiene entradas consecutivas `0000`–`0031`, incluidos los checkpoints concurrentes `0016` Diagnóstico y `0017` MiniWeb. `0030` se aplicó a producción el 2026-10-28; `0031` se generó desde el schema y se probó en D1 local aislada. El ledger remoto no se consultó en este checkpoint.

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
| 0016 | `0016_diagnostic-recovery-challenge-purpose.sql` | FUNNEL-01C.3 | `verified_email_challenge.purpose` |
| 0017 | `0017_miniweb-core.sql` | APP-MINI-02A | `miniweb_site`, `miniweb_module` |
| 0018 | `0018_diagnostic-funnel-aggregates.sql` | FUNNEL-01D.1 | `diagnostic_funnel_aggregate`; columna de grant inicial supersedida en 0019 |
| 0019 | `0019_diagnostic-funnel-request-first-open.sql` | FUNNEL-01D.1-R | `identified_diagnostic_request.first_report_opened_at`; elimina `diagnostic_report_access.first_opened_at` |

Estado de aplicación: cadena `0000`–`0019` ejecutada en D1 temporal nueva. **Reverificada 2026-10-19** desde el worktree aislado APP-CLIENTE-00, partiendo de ledger vacío; las 20 migraciones aplicaron en orden sin error y el E2E MiniWeb completó allí 33/33. El ledger/D1 local del checkout compartido no se alteró; el estado remoto no se consultó ni modificó y no se usó `--remote`. La nota histórica sobre posibles pendientes locales `0016`/`0017` aplica al checkout previo, no a la D1 efímera del último corte.

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

## Analítica histórica DIAG-V3-08 (no reutilizada en FUNNEL-01D.1)

El esquema/contrato `diagnostic_event` que se documenta a continuación corresponde únicamente al subsistema histórico DIAG-V3-08. FUNNEL-01D.1 no lee ni escribe esa tabla, no reutiliza sus rutas/eventos ni sus identificadores de sesión/recorrido. El agregado nuevo y sus seis eventos quedan documentados en “Analítica agregada FUNNEL-01D.1” más abajo.

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

## Analítica agregada FUNNEL-01D.1 (local, contrato 1)

FUNNEL-01D.1 no lee ni escribe `diagnostic_event` ni reutiliza taxonomía/rutas DIAG-V3-08. `diagnostic_funnel_aggregate` es agregado sin FK ni eventos crudos: clave `(event_day, diagnostic_version, contract_version, event_type)`, `event_count` positivo. SQL y Drizzle restringen versión a `diag-v3-public-v1`, contrato a `1` y evento a las seis claves cerradas. `0019` conserva por solicitud el `MIN(first_opened_at)` existente entre grants; tras ese backfill, elimina el marcador por grant.

| Métrica/evento | Unidad | Origen | Exactitud |
| --- | --- | --- | --- |
| `diagnostic_started` | Activaciones de «Empezar diagnóstico» | Navegador → POST dev-only | Estimada; repeticiones/manipulación posibles |
| `diagnostic_completed` | Reproducciones correctas que generan resumen | Worker tras replay exitoso | Confirmada; retry recalculado cuenta otro evento |
| `detailed_report_cta_clicked` | Activaciones del CTA de informe completo | Navegador → POST dev-only | Estimada; no equivale a solicitud |
| `identified_request_created` | Solicitudes nuevas aceptadas y persistidas | Worker después del batch D1 | Confirmada; retry idempotente no incrementa |
| `email_verified` | Primera transición de verificación aceptada | Worker tras canje/grant correcto | Confirmada; reenvío/recovery/replay no incrementan |
| `detailed_report_first_opened` | Primer load autorizado, después de comprobar integridad | Worker/grant | Confirmada; marcador + contador atómicos, visitas posteriores no cuentan |

Inicios/finalizaciones son eventos, no personas únicas; CTAs no tienen deduplicación persistente. Contadores diarios/versionados no comparten cohorte: sus cocientes son orientativos, no tasa exacta. El POST de navegador admite solo los dos eventos estimados, limita frecuencia por rate limiter, rechaza claves extra y fija fecha/versión en servidor. Lectura y escritura exigen `import.meta.env.DEV` y host loopback. Incrementos usan `INSERT … ON CONFLICT … event_count + 1`, atómicos ante concurrencia. Operaciones server-side cuentan solo tras transición confirmada. Fallo de analítica se captura best-effort y no invalida resumen, solicitud ni acceso; puede causar subconteo.

No se almacenan respuestas/preguntas, scores/dimensiones/evidencias/prioridades, contacto, IDs de request/session/grant, IP, user-agent o fingerprints. El `diagnostic_version` es constante coarse-grained, no hash ni identificador de visitante. B es una finalidad separada y no representa conversión.

Solo desarrollo local expone lectura/escritura. La lectura omite celdas con menos de cinco eventos y devuelve fecha, versión, tipo y cantidad; no hay dashboard ni superficie pública productiva. Consulta equivalente:

```sql
SELECT event_day AS date, diagnostic_version AS version, event_type AS event, event_count AS count
FROM diagnostic_funnel_aggregate
WHERE event_count >= 5
ORDER BY event_day, diagnostic_version, event_type;
```

**Retención propuesta, no aprobada:** mantener agregados 30 días y retirarlos solo por purga local explícita; no hay scheduler ni plazo aprobado. Se suprimen celdas pequeñas (<5). Esta fase no habilita recopilación pública ni constituye aprobación de privacidad.

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
6. El Worker público usa `vecidya-prod` desde el cutover registrado el 2026-10-02; `vecidya-staging` es un entorno separado y no debe tratarse como el D1 público. Ver `ENVIRONMENTS.md` para la fecha y evidencia de publicación. Cualquier migración remota requiere autorización explícita.
7. Todo recurso con `organization_id` se consulta filtrando por la organización verificada (membresía) y nunca por un identificador del cliente sin verificar.
