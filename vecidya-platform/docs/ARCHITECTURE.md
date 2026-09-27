# Arquitectura de Vecidya

Última reconciliación: 2026-09-25 (LICENSE-STRATEGY-001: foundation de licenciamiento multi-negocio, solo local; AUTHZ-BA-001: frontera con Better Auth; INVITE-001: aceptación de invitaciones). Describe decisiones y fronteras **vigentes**; lo futuro está marcado `FUTURE` y no debe leerse como implementado.

## Arquitectura actual

Vecidya Platform es una aplicación SSR de React Router ejecutada en Cloudflare Worker (`workers/app.ts`). Better Auth usa Drizzle sobre D1 (binding `DB`). La configuración separa producción (`vecidya-platform` + `vecidya-prod`) de staging (`vecidya-platform-staging` + `vecidya-staging`); producción está desplegada y verificada, mientras el Worker staging dedicado aún no se ha desplegado.

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
- Un ID de recurso recibido del cliente (miembro, invitación) debe pertenecer a la organización verificada; si no existe o es de otra organización, la respuesta es el mismo 403.
- `activeOrganizationId` solo selecciona contexto: no concede autorización. Una organización activa sin membresía (stale o ajena) responde 403.
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
| `requireOrganizationMemberTarget` | el miembro indicado pertenece a la organización (se usa después del permiso) | 403 |
| `requireOrganizationInvitationTarget` | la invitación indicada pertenece a la organización (se usa después del permiso) | 403 |
| `requirePlatformAdmin` | fila `platform_member` activa con rol `platform_admin` | 403 |

`requireRole` y `requirePermission` existen sin uso.

### Matriz de roles (`server/auth/authorization.server.ts`)

| Rol | Permisos |
| --- | --- |
| `owner` | los diez: `organization:read/update/delete`, `member:read/invite/remove/role:update`, `business-profile:read/update/publish` |
| `admin` | todos menos `organization:delete` |
| `member` | `organization:read`, `member:read`, `business-profile:read` |

`organization:update` y `organization:delete` están declarados, pero no hay ninguna operación que los use: renombrar no existe y el borrado está deshabilitado (ver abajo). La matriz completa (3 roles × 10 permisos) la protege el E2E `authz`.

### Frontera con Better Auth (AUTHZ-BA-001)

`/api/auth/*` entrega el tráfico a Better Auth (`api-auth.ts`). Hasta `0.5.1`, el plugin Organization exponía por HTTP todos sus endpoints y bastaba su RBAC por defecto: un `member` leía invitaciones y un `owner` renombraba o borraba la organización sin pasar por la matriz propia. Desde AUTHZ-BA-001 hay una sola autoridad:

- **Allowlist HTTP.** Un hook `before` (`server/auth.server.ts`) aplica `server/auth/organization-http-surface.ts`. Por HTTP solo responden `create`, `list`, `set-active` y `accept-invitation`. Los otros 18 endpoints del plugin instalado devuelven 404, y también cualquiera que aparezca al actualizar Better Auth. El hook evalúa la ruta ya resuelta del endpoint, así que variantes de URL (barra final, `%2F`) no lo esquivan. Las llamadas `auth.api.*` del servidor no llegan por HTTP y no se bloquean.
- **Sin borrado.** `disableOrganizationDeletion` está activo. La cascada borraría perfil, horarios, servicios e integraciones asignados por la plataforma, y `platform_audit_log` no admite cascada.
- **Mutaciones solo por rutas propias**, en este orden: sesión → membresía en la organización de la URL o activa → permiso de la matriz → el recurso pertenece a esa organización → Better Auth, que vuelve a comprobar.

| Operación | Entrada | Vecidya comprueba | Better Auth 1.7.5 comprueba (fuente leída) |
| --- | --- | --- | --- |
| Crear organización | HTTP `create` | — | sesión; el owner es siempre la sesión (ignora un `userId` del cuerpo) |
| Listar organizaciones | HTTP `list` | — | solo las del usuario |
| Activar organización | HTTP `set-active` | revalida la membresía en cada request | membresía; ajena o inexistente → 403 y limpia la activa |
| Perfil, servicios, equipo (páginas) | `/app/*` | `getActiveOrganization` + permiso | — |
| Miembros: listar, rol, quitar | `/api/organizations/:id/members`, `/app/organization` | membresía + permiso + miembro de la organización | membresía, RBAC y reglas de owner |
| Invitaciones: listar, crear, cancelar | `/api/organizations/:id/invitations`, `/app/organization` | membresía + `member:invite` + invitación de la organización | listar: solo membresía; crear y cancelar: RBAC sobre la organización de la invitación |
| Aceptar invitación | HTTP `accept-invitation`, `/app/invitations/:id` | la página resuelve el estado leyendo la invitación en D1 (`db/invitation-rules.ts`). Sin sesión no revela nada; a otra cuenta solo le muestra el correo enmascarado. Aceptar siempre lo hace Better Auth | correo de la sesión = invitado, correo verificado, pendiente y vigente |
| Cancelar invitación (estado) | rutas propias | solo si sigue pendiente y vigente; si no, 409 o error controlado | ninguno: `cancel-invitation` volvería a cancelar una aceptada o cancelada |
| Abandonar, renombrar, borrar | — | 404 por HTTP (sin UI); borrado deshabilitado | `leave` no ejecuta los hooks de retirada |
| Fijar `activeOrganizationId` | `/update-session` | — | rechazado: el campo es `input: false` |

Login y registro aceptan `redirectTo` solo hacia rutas internas de `/app` (`app/lib/safe-redirect.ts`), para que el retorno a una invitación no sirva de open redirect. Retirar un miembro por la ruta propia limpia sus sesiones activas (`afterRemoveMember`). Si aun así queda un ID stale (escritura fuera de banda), las guardas responden 403. Límite de creación de organizaciones y rate limiting quedan fuera de esta frontera (`AUTH-ABUSE-001`).

## Licenciamiento multi-negocio (LICENSE-STRATEGY-001, foundation)

1 organización = 1 negocio = 1 licencia. `billing_account` (quien paga) es una entidad propia,
independiente de `member`: pertenecer a una organización nunca hace que su licencia cuente para el
portafolio de otra persona. Detalle completo del modelo, las tablas, el calculador puro
(`db/pricing/calculator.ts`) y el grandfathering de precio en [DATABASE.md](DATABASE.md#licenciamiento-multi-negocio-license-strategy-001).
Solo `platform_admin` puede asignar, cambiar de plan, suspender/reactivar o transferir una licencia
(`/api/platform/organizations/:id/license`, mismo patrón que `/services` e `/integrations`); no hay
checkout, cobro automático ni proveedor de pago integrado. Migración `0010` aplicada solo en local.

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

La web pública consume contenido institucional estático y perfiles publicados reales (`status = published` y no suspendidos). `BusinessProfile` es comercial: que el Diagnóstico admita otros tipos de presencia no convierte el modelo en un perfil universal. El canonical es fijo (`https://vecidya.com`); sitemap, robots y JSON-LD usan el origen de la request. Desde DIAG-002 el motor (`app/features/diagnostic/`) es puro y está separado de la UI; los parámetros `perfil` y `objetivo` de la URL se validan contra una lista cerrada, solo preseleccionan una elección explícita del usuario y nunca aportan evidencia ni alteran la puntuación. El Diagnóstico es anónimo por defecto; desde DIAG-V3-06 tiene persistencia local/temporal/histórica opcional (ver más abajo), sin exigir cuenta ni datos de identidad.

## Diagnóstico: contratos y versionado (DIAG-V3-01)

- El motor es puro y determinista. Su contrato vive en `app/features/diagnostic/contracts.ts`; `DiagnosticVersion` identifica algoritmo y forma del resultado (`"2.0"` = motor actual). Ningún resultado puede declararse V3 hasta que exista una versión `3.x`.
- Las preguntas, los hallazgos y las dimensiones son listas cerradas: `Answers` solo admite claves de `QUESTION_IDS`, y retirar o renombrar un ID rompe la compilación de las reglas que lo usan.
- Un concepto aún desconocido es `Resolution<T>` `unresolved` con motivo y candidatos; nunca se rellena con un valor por defecto. Los conceptos del motor actual se traducen a V3 solo en `mappings.ts`, y un mismo nombre no implica el mismo significado (el `growing` actual ≠ el `growing` V3).
- Las fronteras de datos no confiables usan guardas de lista cerrada sin dependencias (`isOneOf`, `isQuestionId`, `toNicheId`), el mismo patrón que `isProfileId`.

## Diagnóstico: persistencia (DIAG-V3-06, solo local, sin deploy)

- **Arquitectura:** `Browser` (localStorage, `DiagnosticBrowserStore`) → `KV temporal` (snapshot de trabajo, TTL 7 días, nunca fuente fuerte de concurrencia ni lectura-tras-escritura garantizada) → `D1 histórico` (`diagnostic_session`/`diagnostic_answer`/`diagnostic_result`, migración `0011`). Cada capa tiene una responsabilidad distinta y no se intercambian: KV nunca es la fuente de verdad de un resultado completado, y un fallo al finalizar en D1 nunca borra el estado recuperable en el navegador.
- **Anónimo por defecto:** ninguna tabla nueva tiene columna de usuario, organización, IP ni user-agent. `sessionId` es un UUID v4 público generado por el servidor; `writeToken` es un secreto de 256 bits (aparte del `sessionId`) que el navegador recibe una sola vez — D1 solo guarda `SHA-256(writeToken)`, nunca el token en claro. Autorizar una escritura exige `sessionId` + `writeToken` válido; el `sessionId` solo nunca basta.
- **Modelo de amenaza del `writeToken` (auditoría DIAG-V3-06-C1):** es una credencial de capacidad anónima guardada en `localStorage` vía `DiagnosticBrowserStore` — no una cuenta ni una cookie de sesión. Cualquier JavaScript same-origin puede leerla; un XSS en el sitio podría secuestrar la sesión del Diagnóstico (leer/escribir esas respuestas concretas), pero el token no contiene identidad de la persona ni acceso a ningún otro dato. El hardening de CSP/XSS es responsabilidad general del sitio, no un mecanismo propio de esta credencial. Se entrega en claro exactamente una vez, en la respuesta de `POST /api/diagnostic/sessions` (con `Cache-Control: no-store`); ninguna respuesta posterior de snapshot, finalización o error lo repite, y D1 solo persiste `SHA-256(writeToken)`.
- **El servidor nunca confía en el cliente:** `validateAnswersPayload` deniega por defecto cualquier `QuestionId`/`OptionId` fuera del registro actual; la finalización (`completeDiagnosticSession`) siempre recalcula el resultado completo con el mismo motor (`explainResult`, DIAG-V3-05) a partir de las respuestas, nunca de un `result`/`overallScore` enviado por el cliente. La finalización es transaccional (`database.batch` único) e idempotente por hash canónico del payload (SHA-256): repetir la misma finalización devuelve el resultado ya guardado; una distinta sobre una sesión completada es un conflicto explícito (409), nunca una sobreescritura silenciosa.
- **Única diferencia de UI:** restauración automática en el mismo navegador tras recargar (sesión no completada, versión persistida compatible); cero rediseño. Un deep link (`?perfil=`/`?objetivo=`) solo tiene prioridad sobre lo resumido cuando lo contradice explícitamente.
- **Versiones persistidas** (`QuestionBankVersion`/`RoutingVersion`/`ScoringVersion`/`ResultSchemaVersion`, en `contracts.ts`), separadas de `DiagnosticVersion` y de la versión de la aplicación (`package.json`): identifican qué lógica puede reconstruir un dato histórico. Una sesión con una versión distinta a la vigente produce un error controlado, nunca un cast ni una ejecución mixta.
- **Límites explícitos, documentados y sin resolver todavía:** sin edición concurrente real entre dos dispositivos o pestañas (`revision` es solo trazabilidad); sin scheduler de expiración/abandono (`DIAG-V3-08`); sin analítica de eventos (`DIAG-V3-08`). `kv_namespaces` en `wrangler.jsonc` usa un id placeholder local (nunca un namespace remoto real) — crear uno real es un prerrequisito de cualquier deploy futuro, no de esta fase (`DIAG-V3-KV-PLACEHOLDER-001`).

## Diagnóstico: Save & Resume (DIAG-V3-07, solo local, sin deploy)

- **Mecanismo:** sesión → SAVE (D1 durable, `diagnostic_saved_snapshot`) → recovery code → RECOVER (rota `writeToken`) → RESUME. Sin cuenta, sin email, sin teléfono. El auto-resume same-browser de DIAG-V3-06 sigue funcionando igual, sin cambios: Save & Resume es un mecanismo adicional para continuar desde OTRO navegador/dispositivo, no un reemplazo.
- **Modelo de amenaza del recovery code:** es una credencial de capacidad anónima — no cifra las respuestas, no contiene identidad, y quien lo tenga puede continuar ese diagnóstico concreto (igual amenaza conceptual que el `writeToken`, dominio criptográfico separado). Se muestra en la UI exactamente una vez por código minado, nunca se persiste en `localStorage` ni se recupera después. Nunca viaja por URL/query string; siempre `POST` con el código en el body, con `Cache-Control: no-store` en la respuesta.
- **Elegibilidad de "Guardar para después"** (`canOfferSaveForLater`, `app/features/diagnostic/save-eligibility.ts`): determinista y pura — `profile`/`goal`/`stage` resueltos y ≥35% de las preguntas APLICABLES vigentes respondidas (denominador real, no un conteo fijo que la matriz de dependencias pudiera desalinear). Es una condición de UI, no de autorización: el servidor acepta un SAVE válido independientemente de si la UI lo habría ofrecido.
- **Idempotencia de SAVE, y qué pasa si se pierde el código sin copiarlo:** un retry con el MISMO contenido exacto (mismo `canonical_hash`) nunca mina un código nuevo — solo confirma `status=SAVED` y extiende la retención; la UI muestra en su lugar un aviso de que ya existe un guardado, con un enlace explícito "¿Perdiste tu código? Generar uno nuevo" (`regenerateCode: true` en el body de SAVE — spec §36: la rotación del código nunca es automática, solo por esa acción deliberada). Contenido distinto SÍ mina uno nuevo automáticamente, reemplazando el digest anterior. El código en claro nunca se cachea en ningún almacén para resolver el caso de retry: la garantía de idempotencia vive en el hash canónico, no en releer un secreto ya persistido. La UI también descarta cualquier código/aviso mostrado en cuanto la persona responde algo nuevo (hallazgo de la revisión independiente): mostrar un código o un aviso de "ya guardado" que ya no corresponde a las respuestas vigentes sería la misma promesa falsa que spec §30 prohíbe para el autoguardado.
- **Rotación de `writeToken` en cada recuperación exitosa** (sin excepción): el dispositivo anterior pierde capacidad de escritura de inmediato. El recovery code NO rota automáticamente con la recuperación — sigue siendo válido hasta completar/expirar/la regeneración explícita descrita arriba. Dos `RECOVER` concurrentes con el MISMO código (spec §35, respuesta perdida y reintentada) no están serializados entre sí: ambos rotan el token de forma independiente y ambos responden 200, pero solo el que confirma último en D1 queda con el token realmente vigente — el otro se descubre inválido en su siguiente escritura y puede recuperar de nuevo con el mismo código, sin quedar bloqueado (comportamiento aceptado por diseño, no una garantía de exclusión mutua).
- **Rate limiting real, no solo de configuración:** `DIAGNOSTIC_RECOVERY_RATE_LIMITER` (binding nativo de Workers, sin recurso remoto que crear — a diferencia de KV, este binding no requiere aprovisionamiento en la cuenta de Cloudflare) limita `POST /api/diagnostic/recover` a 10 intentos/60s por IP (clave coarse-grained sobre el endpoint completo, nunca por código/digest — un atacante puede variar el código en cada intento). Limitación documentada: no distingue IPs detrás de un NAT/proxy compartido, y no es un contador transaccional perfecto; es una defensa contra abuso, no una garantía criptográfica. No se guarda IP en D1.
- **Errores sin enumeración:** formato inválido, digest inexistente y sesión ya completada devuelven la MISMA respuesta genérica (404); expirado (410) y versión incompatible (409) sí se distinguen porque ya se comprobó una credencial legítima. La UI traduce por código HTTP (`app/features/diagnostic/sync.ts`), nunca reenvía el texto de error del servidor (en inglés, mismo idioma que el resto de `api-diagnostic-*`) a una interfaz en español.
- **Escritura concurrente segura:** el primer SAVE usa `INSERT … ON CONFLICT (session_id) DO UPDATE` (`db/queries/diagnostic-save-resume.server.ts`), no un insert-o-update decidido en la aplicación — dos SAVE concurrentes del primer guardado de la misma sesión (doble clic, dos pestañas) ya no compiten por una violación de la PK. Si `completeDiagnosticSession` corre en el mismo instante que un SAVE, la fila que este último pudiera haber escrito se borra de inmediato (compensación explícita, no un best-effort) en cuanto se detecta que la sesión ya está `COMPLETED`.
- **Fuera de alcance de V1, documentado, no ignorado:** sin sweep de expiración (lazy expiry únicamente, `DIAG-V3-08`); sin analítica de eventos (`DIAG-V3-08`).

## Límite Vecidya ↔ GHL

Vecidya es responsable de cuentas, usuarios, organizaciones, membresías, perfiles de negocio, web pública, directorio, portal de cliente, servicios propios y metadata tenant-scoped de integraciones.

GHL es el system of record de contactos, leads, oportunidades, pipelines, conversaciones comerciales, citas CRM, workflows, automatizaciones y seguimiento. OPS-001 define operativamente esa frontera, el contrato futuro de `ghl_location_id` y un piloto mínimo, pero **hoy no existe ninguna integración con GHL** (0 líneas de código). La cuenta y plan reales no están verificados. Vecidya no implementará un CRM paralelo sin una decisión arquitectónica posterior. (Consolida el antiguo `ADR-0001`.)

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

Integración con GHL y otros proveedores (Google, Meta, WhatsApp API), incluida OPS-002; envío y verificación de email transaccional; R2 y subida de imágenes; Durable Objects, Queues y Workflows; perfiles universales (`Business`, `Professional`, `Creator`, `Organization`, `Project`, `Public Figure`; requiere ADR, privacidad, moderación, schema y autorización); analítica del Diagnóstico y sweep de sesiones abandonadas (`DIAG-V3-08`; Save & Resume con recovery code entre dispositivos ya existe desde DIAG-V3-07, revisión legal formal aún pendiente — `LEGAL-PRIV-001`); producción independiente y subdominios `app.`/`admin.`; despublicar perfiles, motivos de suspensión y apelaciones; auditoría de servicios e integraciones; rate limiting durable.
