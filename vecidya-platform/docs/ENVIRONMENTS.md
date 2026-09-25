# Entornos

Última reconciliación: 2026-09-25 (deploy de `v0.5.4` — INVITE-UI-001 — en producción; antes, `v0.5.3` — INVITE-001 y canal de WhatsApp —; staging sigue en `v0.4.1`).

Niveles de evidencia usados en este documento: **`CONFIG`** `wrangler.jsonc`/código, **`RAN`** comando ejecutado en local, **`HTTP`** petición anónima de solo lectura a los dominios publicados, fecha indicada por release, **`REMOTE`** consulta o escritura D1 remota autorizada, **`DOC`** afirmación histórica no reverificada.

## Veredicto sobre producción

`vecidya.com` sirve ahora desde `vecidya-prod` mediante el Worker `vecidya-platform`, desplegado como Version ID `cce6aa0b-7988-4525-81c1-f44a5ef3accd` (`v0.5.4`). El smoke HTTP anónimo (rutas públicas, versión, CSS de equipo, `www`, rutas privadas protegidas, allowlist de Better Auth, invitación sin sesión y WhatsApp público) pasó el 2026-09-25.

## Deploy `0.5.4` — INVITE-UI-001 (2026-09-25)

- **Autorización:** el usuario autorizó explícitamente el deploy de la candidata `0.5.4`, con el mismo criterio que REL-005B, y pidió detener el bloque al cerrar la release (sin iniciar `AUTH-ABUSE-001` ni `MEDIA-001A`).
- **Commits publicados:** `a7a4961` (`feat(invites): polish team invitation experience`) y `0b0797e` (`chore(release): 0.5.4 candidate`), sobre `3af9331` (`v0`, cambio de asset ajeno a este bloque).
- **Gate:** validación completa registrada en `TESTING.md`: `typecheck`, `build` y `git diff --check` PASS; `test:unit` 105/105; `team-ui` 91/91; `invite-flow` 28/28; `authz` 143/143; `acct` y `c2` PASS; `invitations` PASS PARCIAL; `members` PASS con calentamiento (copia no versionada).
  - Reconstruido en el propio corte del deploy (`server-build-Bl9oLdXA.js`, `root-Ov9cK09F.css`): contenía `"0.5.4"`, la UI de equipo (`Invitaciones pendientes`) y el canal de WhatsApp; el CSS contenía `invitation-section` y `role-guide`.
  - Migraciones: NINGUNA (sin cambios en `db/schema`, `db/migrations` ni `wrangler.jsonc` desde `0.5.3`).
- **Deploy:** `--dry-run` confirmó `DB=vecidya-prod` y `APP_ENV=production`. `pnpm wrangler deploy` a las 2026-09-25T18:15:33Z. Version ID **`cce6aa0b-7988-4525-81c1-f44a5ef3accd`**. Staging, secrets y D1 remota no se tocaron.
- **HTTP anónimo de solo lectura** (`curl --ssl-no-revoke`):

  | Comprobación | Antes (18:14Z, `0.5.3`) | Después (23:00Z) |
  | --- | --- | --- |
  | Pie de `/` | «Versión pública 0.5.3» | «Versión pública 0.5.4» |
  | CSS de `/login`: `invitation-section` / `role-guide` | `root-C4A-bG9s.css`, 0 / 0 | `root-Ov9cK09F.css` (= bundle local), 1 / 1 |
  | `/app/invitations/<id>` sin sesión | — | `200` con «Crear cuenta» |
  | `/contacto`: grupo / canal | — | 0 / 2 |
  | 15 rutas públicas, `/login`, `/register`, `/api/auth/ok` | — | `200` |
  | `/app`, `/app/organization`, `/app/internal` | `302` | `302` → `/login` |
  | `www` | — | `301` |
  | `organization/list` / `list-invitations` / `get-full-organization` | — | `401` / `404` / `404` (allowlist intacta) |

- **Checks manuales pendientes del usuario** (login y cambio de organización; invitación real con correo controlado): **NOT PERFORMED**, sin cuenta ni buzón controlados disponibles — no bloquean el cierre, según indicó el usuario.
- **Resultado:** `0.5.4 PRODUCTION PASS`.

## Deploy `0.5.3` — INVITE-001 y canal de WhatsApp (2026-09-25)

- **Autorización:** el usuario eligió «desplegar al pasar todo» al preguntarle cómo seguir. El texto de INVITE-001 que pegó decía «NO deploy»; prevaleció su respuesta directa, y así se le informa.
- **Commit publicado:** `aee3081` (`chore(release): 0.5.3`), sobre `7a74685` (INVITE-001) y `b3f9443` (canal de WhatsApp).
- **Gate:** validación final completa en `TESTING.md`: `typecheck`, `build` y `git diff --check` PASS; `test:unit` 100/100; `invite-flow` 28/28; `authz` 143/143; 11 E2E de regresión PASS; `invitations` PASS PARCIAL; `pe-b` con deuda conocida.
  - El bundle reconstruido desde `aee3081` (`server-build-CMX_3QBf.js`) contenía `"0.5.3"` y el canal, no contenía `chat.whatsapp.com` e incluía `safe-redirect` en el cliente.
  - Migraciones: NINGUNA.
- **Deploy:** `--dry-run` confirmó `DB=vecidya-prod` y `APP_ENV=production`. Version ID **`8dfe3c1d-208e-4aaa-bd91-62409b18e252`**. Staging, secrets y D1 remota no se tocaron.
- **HTTP anónimo de solo lectura** (`curl --ssl-no-revoke`):

  | Comprobación | Antes (16:07Z, `0.5.2`) | Después (16:09Z) |
  | --- | --- | --- |
  | Pie de `/` | «Versión pública 0.5.2» | «Versión pública 0.5.3» |
  | `/contacto`: enlaces `chat.whatsapp.com` / canal / `wa.me` | 2 / 0 / — | 0 / 2 / 3 |
  | Home: canal (pie + `sameAs`) / grupo | 0 / — | 2 / 0 |
  | `/app/invitations/<id>` sin sesión | `302` → `/login` | `200` con «Crear cuenta» y `redirectTo` a la invitación |
  | 13 rutas públicas, `/api/auth/ok` | — | `200` |
  | `/app`, `/app/organization`, `/app/internal` | — | `302` |
  | `www` | — | `301` |
  | `organization/list` / `organization/list-invitations` | — | `401` / `404` (allowlist intacta) |

- **Pendiente del usuario:** una invitación real de extremo a extremo en producción (correo real → registro → correo de verificación real → aceptar), que en local no puede ejecutarse. El smoke autenticado de login y cambio de organización sigue pendiente desde `0.5.2`.

## Deploy `0.5.2` — AUTHZ-BA-001 (2026-09-25)

- **Autorización:** el usuario pidió explícitamente desplegar a producción durante el bloque («despliega a producción… hazlo ahora y después sigues»).
- **Commit publicado:** `e9e413a` (`fix(auth): harden organization authorization`), versión `package.json` `0.5.2`. Allowlist HTTP del plugin Organization, borrado de organizaciones deshabilitado y guardas de recurso para miembros e invitaciones.
- **Gate previo (RAN 2026-09-25):** `typecheck`, `build` y `git diff --check` PASS. `authz` 143/143. `test:unit` 87/87. E2E de regresión 14 PASS e `invitations` PASS PARCIAL. Fallos solo de deuda conocida: `members` (`TEST-D1-RESET-001`, PASS con calentamiento en copia no versionada) y `pe-b` (`TEST-UX003-PEB`). El bundle contenía la allowlist, `disableOrganizationDeletion: true` y `"0.5.2"`. Migraciones: NINGUNA (sin cambios en `db/schema`, `db/migrations` ni `wrangler.jsonc`).
- **Deploy:** `wrangler deploy --dry-run` confirmó `DB=vecidya-prod` y `APP_ENV=production`. Después `pnpm wrangler deploy`, con `CLOUDFLARE_ACCOUNT_ID=8a13de3ea584f9055f78565b9860c125` solo para el comando. Version ID **`1c99089b-f095-499d-9958-bad360693a33`**; triggers `vecidya.com/*`, `www.vecidya.com/*` y workers.dev. Staging, secrets, D1 remota y datos no se tocaron.
- **HTTP anónimo de solo lectura:** `curl --ssl-no-revoke`, porque schannel no podía consultar la revocación (`CRYPT_E_REVOCATION_OFFLINE`); el certificado se sigue validando.

  | Comprobación | Antes (2026-09-25T14:54Z, `0.5.1`) | Después (2026-09-25T14:56Z) |
  | --- | --- | --- |
  | Pie de `/` | «Versión pública 0.5.1» | «Versión pública 0.5.2» |
  | `/`, `/licencias`, `/addons`, `/servicios`, `/vecindario`, `/vecindario/vecidya`, `/diagnostico`, `/aprende`, `/contacto`, `/privacidad`, `/sitemap.xml`, `/robots.txt` | `200` en `/` | `200` las 12 |
  | `/app`, `/app/organization`, `/app/internal` | `302` en `/app` | `302` las 3 |
  | `www.vecidya.com` | — | `301` |
  | `/api/auth/ok` | `200` | `200` |
  | `GET /api/auth/organization/list` (permitido) | `401` | `401` |
  | `GET /api/auth/organization/list-invitations`, `get-full-organization` | `401` (el endpoint existía) | `404` |
  | `GET /api/auth/organization/list-members`, `get-invitation` | — | `404` |

- **Pendiente:** smoke autenticado del login (`list` + `set-active`) y del cambio de organización en producción, con la sesión del propio usuario. En local lo cubren `c2` (login UI) y `authz`.

## Deploy `0.5.1` — REL-005B (2026-09-24)

- **Commit publicado:** `55f9700` (`fix(profile): keep saved public slugs stable`), versión `package.json` `0.5.1`. Incluye VIS-001B, UX-003.8/003.9, VIS-002B, `bc93a31` (slug automático), QA-005A y SLUG-005B.
- **Gate previo (RAN 2026-09-24):**
  - `typecheck`, `build` y `git diff --check` PASS.
  - E2E críticos PASS: `slug-life`, `services-exp`, `pg-c1`, `bpx` y `commercial-review`.
  - Migraciones: **NINGUNA**. Desde `41986a4` (`0.4.1`) no cambian `db/schema`, `db/migrations` ni `wrangler.jsonc`.
  - `wrangler deploy --dry-run` confirmó `DB=vecidya-prod` y `APP_ENV=production`.
- **Cuenta de Cloudflare:** la sesión de Wrangler de esta máquina ve dos cuentas, y en modo no interactivo el primer intento abortó antes de subir nada. La cuenta correcta (`Soporte@vecidya.com`, `CLOUDFLARE_ACCOUNT_ID=8a13de3ea584f9055f78565b9860c125`) se confirmó con `wrangler deployments list --name vecidya-platform`, de solo lectura: su último deployment era `eec3de6a…` (`0.4.1`). La variable se fijó solo para el comando, sin cambiar configuración versionada.
- **Deploy** (`pnpm wrangler deploy`, 2026-09-24T23:51:01Z–23:52:28Z, exit 0):
  - Version ID `195b737c-d838-4c64-96a2-a6fd195ee018`; 50 assets nuevos o modificados (57 ya existentes).
  - Bindings `env.DB (vecidya-prod)`, `APP_URL`/`BETTER_AUTH_URL` `https://vecidya.com`, `APP_ENV=production` y variables de correo sin cambios.
  - Triggers `vecidya.com/*`, `www.vecidya.com/*` y `vecidya-platform.soporte-8a1.workers.dev`.
- **HTTP anónimo (2026-09-24T23:53Z):**
  - Todas las rutas del bloque responden `200`: `/`, `/login`, `/vecindario`, `/vecindario/vecidya`, `/servicios`, `/diagnostico`, `/licencias`, `/addons`, `/aprende`, `/contacto`, `/sobre-nosotros`, `/privacidad`, `/robots.txt`, `/sitemap.xml` y `/forgot-password`.
  - `/app` y `/app/internal` → `302` a `/login`. `www` → `301` al apex, conservando la ruta.
  - Pie «Versión pública 0.5.1». Auth no muestra pie de versión, igual que en `0.4.1`.
  - Canonical y `og:url` de `/vecindario/vecidya` sin cambios (`https://vecidya.com/vecindario/vecidya`).
  - Assets de VIS-002B con `200` y el mismo tamaño que en local; `/favicon.ico` → `302` a `vecidya-icon-3d.png`; CSS y JS de entrada `200`.
- **Visual:**
  - Anónimo, con el navegador del MCP de Playwright a 1366: `/login` con el lockup 3D y el favicon 3D, sin overflow.
  - Con la sesión que el propio usuario inició (sin manejar credenciales), solo lectura:
    - `/app`: símbolo 3D y «Versión App 0.5.1».
    - `/app/services`: empty-state real con la ilustración de Batch 01.
    - `/app/business-profile`: slug `vecidya` intacto, `maxLength` 80.
    - `/app/internal`: marca 3D y «Versión Admin 0.5.1».
    - `/app/internal/organizations`: empty-state provocado con el filtro client-side, sin peticiones de red.
  - A 390 px en producción: `/`, `/app/services` y `/vecindario/vecidya` sin overflow. Imágenes no diferidas cargadas; la única imagen «sin cargar» de la Home era `loading="lazy"`, a 3879 px, y carga al acercarse (`200 image/webp`). Pie `0.5.1`, canonical intacta.
- **Hallazgo tras el deploy:** el usuario reportó defectos en la gestión de invitaciones. Se verificó que son anteriores a `0.5.1` (`INVITE-001`, `INVITE-UI-001` en `STATUS.md`).
- **Comprobación de red:** `curl` usa `--ssl-no-revoke` por un fallo local de consulta de revocación (schannel `CRYPT_E_REVOCATION_OFFLINE`). No se desactivó ninguna otra verificación TLS.
- **Migraciones remotas:** NO ejecutadas. **Secrets:** NO modificados. **Staging:** no tocado, sigue en `0.4.1`. **Datos productivos:** no modificados.

## Deploy `0.4.1` — DIAG-002C + UX-003.1–003.5

- Commit publicado: `41986a4` (`feat(ux): improve client and admin experience`); versión `package.json`: `0.4.1`.
- Validación: `pnpm run typecheck`, `pnpm run build`, `pnpm run test:unit` (75/75 PASS) y `git diff --cached --check` PASS.
- Staging: Worker `vecidya-platform-staging`, Version ID `c7f7ee8b-e528-42d5-840c-ad7b4c9a9454` (versión #35), `DB=vecidya-staging`, `APP_ENV=staging`, URL `https://vecidya-platform-staging.soporte-8a1.workers.dev`. El deploy publicó el Worker y `workers.dev`; Wrangler informó que el trigger `vecidya.com/*` ya pertenece a producción y no pudo reasignarse.
- Producción: Worker `vecidya-platform`, Version ID `eec3de6a-6711-4eff-91de-b413406e3618`, `DB=vecidya-prod`, `APP_ENV=production`, rutas `vecidya.com/*` y `www.vecidya.com/*`.
- HTTP anónimo `2026-09-23`: `/`, `/login`, `/contacto` y el SVG de WhatsApp respondieron `200` en ambos entornos; Home y Contacto muestran `v0.4.1`; `/app` y `/app/internal` respondieron `302` hacia `/login` sin sesión.
- Migraciones remotas: **NO ejecutadas**. Secrets: **NO modificados**.
## Deploy `0.4.0` — DIAG-002B + UX-003.1/003.4

- Autorización: deploy explícitamente solicitado por el usuario el 2026-09-23.
- Validación previa `RAN`: `pnpm run typecheck`, `pnpm run build`, `pnpm run test:unit` (70/70 PASS) y `git diff --check` PASS.
- Staging: `vecidya-platform-staging`, Version ID `57c2f319-7de4-4995-a4ba-2a10db82fa7a`, `DB=vecidya-staging`, `APP_ENV=staging`, URL `https://vecidya-platform-staging.soporte-8a1.workers.dev`.
- Producción: `vecidya-platform`, Version ID `8c7d38e6-d560-4f27-9a40-b9d102033eff`, `DB=vecidya-prod`, `APP_ENV=production`, `vecidya.com` y `www.vecidya.com`.
- HTTP anónimo `2026-09-23`: `/`, `/login`, `/robots.txt`, `/sitemap.xml`, `/contacto`, `/diagnostico`, `/aprende`, `/licencias`, `/addons`, `/servicios`, `/privacidad` respondieron `200` en ambos entornos; `/app` y `/app/internal` respondieron `302` sin sesión; CSS principal respondió `200`.
- Migraciones remotas: **NO ejecutadas**. Secrets: **NO modificados**.
- Wrangler informó que el trigger de zona de staging no pudo reasignarse porque `vecidya.com/*` ya pertenece al Worker de producción; el Worker staging y su URL `workers.dev` quedaron desplegados correctamente.

## WhatsApp comunidad y contacto — `v0.3.0`

- Staging: `vecidya-platform-staging`, Version ID `35c0961f-ccdd-4c76-a7d3-5bd347132a91`, desplegado el 2026-09-23 desde el build validado; `https://vecidya-platform-staging.soporte-8a1.workers.dev/contacto` respondió HTTP `200` y mostró los enlaces comercial y comunitario.
- Producción: `vecidya-platform`, Version ID `5d7278d3-6db6-4378-b497-39dc82f0aeb8`; `https://vecidya.com/contacto` respondió HTTP `200` y mostró los enlaces comercial y comunitario.
- Staging conserva el aviso operativo de ruta de zona ya existente: el patrón de dominio está asignado al Worker de producción; el Worker staging queda verificable en `workers.dev`.
- No se ejecutaron migraciones, no se modificaron secrets y la versión permanece `0.3.0`.

## Corrección de assets estáticos — `v0.3.0`

- Incidente detectado por comprobación visual del operador: un despliegue anterior no incluyó CSS, JavaScript ni assets de `public/`, por ausencia de la sección `assets` en `wrangler.jsonc`; las páginas respondían HTML `200` pero se mostraban sin estilos y con imágenes `404`.
- Corrección aplicada: `assets.directory = ./build/client`, regeneración de tipos (`pnpm run cf-typegen`), build y redespliegue.
- Staging corregido: Version ID `742c4f5b-f8c7-4634-8dba-9fae522cacbb`.
- Producción corregida: Version ID `cd3f247e-64dc-4ca8-aff1-92ce137c0de0`.
- HTTP anónimo posterior: `/`, `/contacto`, CSS, PNG de marca, ilustración WebP e icono WhatsApp respondieron `200` en producción.

## REL-003.1 — publicación de `v0.3.0`

- Fuente local: `vecidya-platform/package.json` = `0.3.0`.
- Estado: **LIVE / PUBLICADA**, con deploy autorizado posterior al push de `ca629eb`.
- Staging: Worker `vecidya-platform-staging`, Version ID `934810c2-db8d-4126-960a-cd302d1d45cb`, URL `https://vecidya-platform-staging.soporte-8a1.workers.dev`; `DB=vecidya-staging`, `APP_ENV=staging`, fotografías nuevas verificadas por hash.
- Producción: Worker `vecidya-platform`, Version ID `fd6d0a4c-da2f-437f-8074-75a989050633`, `DB=vecidya-prod`, `APP_ENV=production`; `vecidya.com` y `www.vecidya.com` siguen en las rutas configuradas, fotografías nuevas verificadas por hash.
- El primer intento con `--env staging` usó el `build/server/wrangler.json` generado y resolvió el Worker top-level; se corrigió con `wrangler deploy build/server/index.js --config wrangler.jsonc --env staging`. No se ejecutaron migraciones ni se modificaron secrets.
- Git: push confirmado `origin/main=ca629eb`; el commit documental posterior de esta evidencia queda local hasta nueva autorización de push.
- Smoke HTTP anónimo de producción PASS el 2026-09-23 para rutas públicas, artículo Aprende, versión `0.3.0`, sitemap, robots y redirect legado.

## Matriz de entornos

| Entorno | Worker | D1 | Dominio / URL | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| **Local** | `react-router dev` con el plugin de Cloudflare (`pnpm run dev`) | Emulada por Miniflare en `.wrangler/state/v3/d1` (binding `DB`); migraciones `0000`–`0009` aplicadas | `http://localhost:*` | Operativo | `RAN` `d1_migrations` local contiene 10 filas (`0000`–`0009`) |
| **Development** (remoto) | Ninguno versionado | `vecidya-dev` remoto existe, pero no está configurado ni debe usarse | Ninguno | **Abandonado / sin uso** | `CONFIG` |
| **Staging** | `vecidya-platform-staging` (`env.staging`, `workers_dev: true`) | `vecidya-staging` `d4af6ebc-97c5-42f6-ad3a-51551021e591` | `https://vecidya-platform-staging.soporte-8a1.workers.dev` | **Publicado y verificado**; `v0.4.1`, Version ID `c7f7ee8b-e528-42d5-840c-ad7b4c9a9454`; trigger de rutas de zona no se reasignó por conflicto existente, workers.dev operativo | `CONFIG` `HTTP` `REMOTE` |
| **Public / Production** | `vecidya-platform` (top-level) | `vecidya-prod` `8edc3f04-258e-4c29-9f33-76fec3d25042` | `https://vecidya.com`, `https://www.vecidya.com` (301 → apex), `vecidya-platform.soporte-8a1.workers.dev` | **Publicado y verificado**; `v0.5.4`, Version ID `cce6aa0b-7988-4525-81c1-f44a5ef3accd` (2026-09-25); smoke HTTP anónimo PASS | `CONFIG` `HTTP` `REMOTE` |

## Qué código está publicado

El despliegue público vigente es el Version ID `cce6aa0b-7988-4525-81c1-f44a5ef3accd` (`v0.5.4`, 2026-09-25; el anterior fue `8dfe3c1d-208e-4aaa-bd91-62409b18e252`, `v0.5.3`) `CONFIG`/`HTTP`:

- `/app/internal/maintenance/auth-bootstrap` y `/app/internal/maintenance/password-rotation` devuelven **404**.
- `/app/internal` sin sesión devuelve la pantalla de login; el acceso autenticado de `hola@vecidya.com` fue comprobado manualmente en producción en `/app` y `/app/internal`.
- La D1 remota reporta migraciones `0000`–`0009` aplicadas `REMOTE`.

Conclusión: el código `0.5.4` está desplegado en el Worker público, el binding reportado por Wrangler es `vecidya-prod` y no se ejecutaron migraciones (las migraciones `0000`–`0009` ya estaban aplicadas y `0.5.4` no añade ninguna). `vecidya-staging` sigue preservada como D1 independiente de staging.

## Repositorio Git

El repositorio Git se reconstruirá desde el snapshot actual de `main` y se publicará en el repositorio nuevo. El snapshot excluye dependencias generadas (`node_modules`, `.wrangler`, `build`, `dist`, `coverage`) y secretos (`.env*`, `.dev.vars`) mediante `.gitignore`.

## Variables y secretos

| Variable | Propósito | Requerida por código | Origen actual |
| --- | --- | --- | --- |
| `BETTER_AUTH_SECRET` | Firma/seguridad de Better Auth | Sí (`server/auth.server.ts` lanza error si falta) | Secreto remoto gestionado fuera de Git; local en `.dev.vars` (ignorado por Git). Declarado en `wrangler.jsonc` → `secrets.required` |
| `BETTER_AUTH_URL` | Origen canónico de navegador | No (fallback: origen de la request) | `wrangler.jsonc` → `vars` = `https://vecidya.com` |
| `APP_URL` | Origen del enlace de invitación | Solo para entrega de invitaciones | `wrangler.jsonc` → `vars` = `https://vecidya.com` |
| `EMAIL_PROVIDER` | Proveedor transaccional activo | Sí para envío | `gmail` en producción; `fake` en `env.staging` |
| `EMAIL_FROM` | Remitente verificado | Sí para envío | `hola@vecidya.com` |
| `EMAIL_REPLY_TO` | Respuestas transaccionales | No | `hola@vecidya.com` |
| `GMAIL_OAUTH_CLIENT_ID` | Cliente OAuth Gmail | Sí para Gmail | Secreto Cloudflare configurado por el operador; valor no leído |
| `GMAIL_OAUTH_CLIENT_SECRET` | Cliente OAuth Gmail | Sí para Gmail | Secreto Cloudflare configurado por el operador; valor no leído |
| `GMAIL_OAUTH_REFRESH_TOKEN` | Autorización offline de `hola@vecidya.com` | Sí para Gmail | Secreto Cloudflare configurado por el operador; valor no leído |

Con la configuración OAuth completa, el envío Gmail queda listo para validación real posterior al deploy; el proveedor fake solo existe para pruebas/local staging y no entrega correo. Ninguna variable secreta se envía al cliente. No hay variables de GHL, Meta, Stripe ni WhatsApp. `worker-configuration.d.ts` se regenera con `pnpm run cf-typegen` a partir de `wrangler.jsonc`; nunca a partir de `.env` o `.dev.vars`. Los valores de secretos no se leen, imprimen ni versionan.

## Recursos no habilitados

- **R2**: no habilitado en la cuenta consultada ni declarado en `wrangler.jsonc`. El logo del perfil se almacena como URL de texto, no como archivo subido.
- **Durable Objects, Queues, Workflows**: existen los directorios `worker/durable-objects`, `worker/queues`, `worker/workflows` sin contenido; no hay bindings.
- **Correo del dominio**: el MX de `vecidya.com` apunta a Google `DOC`; no se modificó.
- **Cloudflare Pages** `vecidya` (`vecidya.pages.dev`): existía según la auditoría 10A `DOC`; no forma parte de este repositorio.

## Reglas

1. Producción/Public usa `vecidya-prod`; staging conserva `vecidya-staging` y el Worker dedicado está publicado en su URL `workers.dev`.
2. Los secretos se gestionan fuera de Git; no se leen ni se imprimen archivos `.env*` ni `.dev.vars`.
3. Ninguna prueba destructiva apunta a producción pública. Las pruebas `remote-staging-*` exigen `RUN_REMOTE_E2E=1`, `TARGET_ENV=staging`, el Worker dedicado `vecidya-platform-staging` y `D1_NAME=vecidya-staging`; rechazan producción (ver `TESTING.md`).
4. Los despliegues requieren autorización explícita; `wrangler deploy` despliega directamente al dominio público.
5. Las migraciones se validan en local antes de cualquier aplicación remota; `--remote` requiere autorización explícita.
6. Los comandos D1 locales usan el **binding** `DB` (`pnpm wrangler d1 execute DB --local …`), no el nombre obsoleto `vecidya-dev`.
7. `vecidya-prod` está conectada al Worker público; no se eliminó ni modificó destructivamente `vecidya-staging`.

## EMAIL-001C — release de producción

- Deploy autorizado de `vecidya-platform` desde el commit `6b351c4`: Version ID `c38ce78b-648c-438c-a796-f20f7bf8e4b3`, `2026-09-22`. Wrangler confirmó `env.DB (vecidya-prod)`, `APP_ENV=production`, `EMAIL_PROVIDER=gmail`, `EMAIL_FROM=hola@vecidya.com` y `EMAIL_REPLY_TO=hola@vecidya.com`.
- Secretos top-level presentes por nombre: `BETTER_AUTH_SECRET`, `GMAIL_OAUTH_CLIENT_ID`, `GMAIL_OAUTH_CLIENT_SECRET`, `GMAIL_OAUTH_REFRESH_TOKEN`. Sus valores no fueron leídos.
- No se ejecutaron migraciones, no se modificó D1 y no se usaron versiones individuales de secretos.
- Solicitud de `forgot-password` para `hola@vecidya.com` respondió HTTP `200` genérico en producción. Gmail API send y recepción en inbox quedan **PASS**, confirmados por el operador; no se completó el reset ni se mutó la contraseña.

## PROD-001 / PROD-001B — baseline y cutover

- Backup completo de `vecidya-staging` realizado fuera del repositorio el 2026-09-21 antes de la clonación. El SQL no entra en Git.
- `vecidya-prod` fue creada con UUID `8edc3f04-258e-4c29-9f33-76fec3d25042` y recibió migraciones `0000`–`0009` más los datos exportados de la D1 pública. Los conteos de las 17 tablas inventariadas coincidieron y se verificaron invariantes de identidad, organización, membresía owner, platform admin activo y perfil publicado.
- Deploy autorizado de `vecidya-platform` a `vecidya-prod`: Version ID `2b655f6b-b2ad-461d-9231-fdb96221dfd0`, 2026-09-21. Wrangler mostró `env.DB (vecidya-prod)` y `APP_ENV=production`.
- Smoke anónimo PASS: `/`, `/vecindario`, `/vecindario/vecidya`, `/login`, `/robots.txt`, `/sitemap.xml`, `www` → apex y footer `0.1.2`.
- Smoke autenticado manual autorizado PASS: `hola@vecidya.com`, `/login → /app → /app/internal`. `/app/business-profile`, `/app/organization` y `/app/internal/businesses` no fueron rechecados en este smoke.

## Política de versionado y publicación

- La fuente única de versión es `package.json → version` (`vecidya-platform/package.json`). El pie compartido `app/components/platform-footer.tsx` la muestra en las páginas públicas, `/app` y `/app/internal`, junto con `© 2026 Vecidya`.
- Cambiar la versión requiere actualizar `package.json`, validar `typecheck` y `build`, y registrar el cambio en [CHANGELOG.md](CHANGELOG.md).
- Una versión solo se declara **publicada** después de un deploy autorizado y una comprobación HTTP anónima fechada contra `vecidya.com`; el commit, el bundle local o la configuración de Wrangler no sustituyen esa evidencia.
- La ficha de publicación debe conservar: versión, fecha, Worker/ruta, estado de migraciones, resultado HTTP y bloqueos. Si la D1 remota no puede verificarse, se marca `NO VERIFICADO` y no se publican perfiles dependientes.

## PERF-001 — estado de publicación

- Versión fuente/local esperada: `0.1.1` (`vecidya-platform/package.json`).
- Deploy `v0.1.1`: **SÍ**, Version ID observado `f8936f89-ef27-4d50-ae56-1b6e4ba35fed`.
- D1 remota: migraciones `0000`–`0009` aplicadas; no se aplicaron migraciones durante este bloque de acceso.

## AUTH-BOOTSTRAP-001 — acceso administrativo temporal

- La cuenta existente `hola@vecidya.com` quedó con `platform_admin`/`active` y membresía `owner` de la organización `Vecidya` `REMOTE`.
- `soporte@vecidya.com` fue eliminado junto con sus sesiones, credenciales y membresías en cascada; la consulta posterior devuelve 0 filas `REMOTE`.
- Se desplegó temporalmente una recuperación protegida por secreto Cloudflare; el secreto fue eliminado después del login validado y las rutas temporales devuelven 404 `HTTP`.
- Login, `/app` y `/app/internal` fueron comprobados manualmente con `hola@vecidya.com`; la contraseña no se documenta.
- Version impact: **NONE**. No se aplicaron migraciones remotas.

## RP-001A — validación local

- El fixture `rp-001a-local-real-proof-check.mjs` usa exclusivamente el Worker y D1 local; crea tres organizaciones controladas, no conserva datos al finalizar y dejó 0 filas de fixture en la comprobación posterior.
- Remote D1: **NOT TOUCHED**. Pilot publication: **NOT PERFORMED**. Deploy y verificación de producción: **NOT PERFORMED**.
