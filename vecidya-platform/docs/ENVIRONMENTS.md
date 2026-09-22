# Entornos

Última reconciliación: 2026-09-22 (EMAIL-001, RELEASE READY; sin deploy).

Niveles de evidencia usados en este documento: **`CONFIG`** `wrangler.jsonc`/código, **`RAN`** comando ejecutado en local, **`HTTP`** petición anónima de solo lectura al dominio público el 2026-09-21, **`REMOTE`** consulta o escritura D1 remota autorizada, **`DOC`** afirmación histórica no reverificada.

## Veredicto sobre producción

`vecidya.com` sirve ahora desde `vecidya-prod` mediante el Worker `vecidya-platform`, desplegado como Version ID `2b655f6b-b2ad-461d-9231-fdb96221dfd0`. El smoke HTTP anónimo y la verificación manual autorizada `/login → /app → /app/internal` pasaron.

## Matriz de entornos

| Entorno | Worker | D1 | Dominio / URL | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| **Local** | `react-router dev` con el plugin de Cloudflare (`pnpm run dev`) | Emulada por Miniflare en `.wrangler/state/v3/d1` (binding `DB`); migraciones `0000`–`0009` aplicadas | `http://localhost:*` | Operativo | `RAN` `d1_migrations` local contiene 10 filas (`0000`–`0009`) |
| **Development** (remoto) | Ninguno versionado | `vecidya-dev` remoto existe, pero no está configurado ni debe usarse | Ninguno | **Abandonado / sin uso** | `CONFIG` |
| **Staging** | `vecidya-platform-staging` (`env.staging`, `workers_dev: true`) | `vecidya-staging` `d4af6ebc-97c5-42f6-ad3a-51551021e591` | URL workers.dev dedicada aún pendiente de provisionar/verificar | **Preparado; no desplegado en este bloque** | `CONFIG` `REMOTE` |
| **Public / Production** | `vecidya-platform` (top-level) | `vecidya-prod` `8edc3f04-258e-4c29-9f33-76fec3d25042` | `https://vecidya.com`, `https://www.vecidya.com` (301 → apex), `vecidya-platform.soporte-8a1.workers.dev` | **Publicado y verificado**; `v0.1.2`, Version ID `2b655f6b-b2ad-461d-9231-fdb96221dfd0`; auth manual PASS | `CONFIG` `HTTP` `REMOTE` `DOC` |

## Qué código está publicado

El despliegue público vigente es el Version ID `2b655f6b-b2ad-461d-9231-fdb96221dfd0` (`v0.1.2`, 2026-09-21) `CONFIG`/`HTTP`:

- `/app/internal/maintenance/auth-bootstrap` y `/app/internal/maintenance/password-rotation` devuelven **404**.
- `/app/internal` sin sesión devuelve la pantalla de login; el acceso autenticado de `hola@vecidya.com` fue comprobado manualmente en producción en `/app` y `/app/internal`.
- La D1 remota reporta migraciones `0000`–`0009` aplicadas `REMOTE`.

Conclusión: el código `0.1.2` y las migraciones `0000`–`0009` están desplegados en el Worker público y el binding reportado por Wrangler es `vecidya-prod`. `vecidya-staging` sigue preservada como D1 independiente de staging.

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

1. Producción/Public usa `vecidya-prod`; staging conserva `vecidya-staging` con Worker dedicado aún no desplegado en este bloque.
2. Los secretos se gestionan fuera de Git; no se leen ni se imprimen archivos `.env*` ni `.dev.vars`.
3. Ninguna prueba destructiva apunta a producción pública. Las pruebas `remote-staging-*` exigen `RUN_REMOTE_E2E=1`, `TARGET_ENV=staging`, el Worker dedicado `vecidya-platform-staging` y `D1_NAME=vecidya-staging`; rechazan producción (ver `TESTING.md`).
4. Los despliegues requieren autorización explícita; `wrangler deploy` despliega directamente al dominio público.
5. Las migraciones se validan en local antes de cualquier aplicación remota; `--remote` requiere autorización explícita.
6. Los comandos D1 locales usan el **binding** `DB` (`pnpm wrangler d1 execute DB --local …`), no el nombre obsoleto `vecidya-dev`.
7. `vecidya-prod` está conectada al Worker público; no se eliminó ni modificó destructivamente `vecidya-staging`.

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
