# Entornos

Última reconciliación: 2026-09-21 (AUTH-BOOTSTRAP-001, `v0.1.1` desplegado).

Niveles de evidencia usados en este documento: **`CONFIG`** `wrangler.jsonc`/código, **`RAN`** comando ejecutado en local, **`HTTP`** petición anónima de solo lectura al dominio público el 2026-09-21, **`REMOTE`** consulta o escritura D1 remota autorizada, **`DOC`** afirmación histórica no reverificada.

## Veredicto sobre producción

`vecidya.com` **se sirve desde infraestructura staging**. El Worker público `vecidya-platform` usa el D1 `vecidya-staging` `CONFIG`. **No existe producción independiente**: no hay D1 productivo separado, ni `app.`/`admin.vecidya.com`, ni secretos productivos dedicados, ni R2 (`CONFIG`, `DOC`). Las palabras «producción pública» en documentos antiguos significaban «el dominio público real», no «infraestructura productiva independiente».

## Matriz de entornos

| Entorno | Worker | D1 | Dominio / URL | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| **Local** | `react-router dev` con el plugin de Cloudflare (`pnpm run dev`) | Emulada por Miniflare en `.wrangler/state/v3/d1` (binding `DB`); migraciones `0000`–`0009` aplicadas | `http://localhost:*` | Operativo | `RAN` `d1_migrations` local contiene 10 filas (`0000`–`0009`) |
| **Development** (remoto) | Ninguno versionado | `vecidya-dev` remoto (creado en Foundation 1B; la auditoría 10A halló pendientes `0003`–`0006`) | Ninguno | **Abandonado / sin uso**: ya no aparece en `wrangler.jsonc` y no se reutiliza como staging | `DOC` no reverificado |
| **Staging** | `vecidya-platform-staging` existió y sirvió el dominio público hasta `PUBLIC-PROD-DIRECT-001` (2026-08-27); ya no está definido en `wrangler.jsonc` | `vecidya-staging` `d4af6ebc-97c5-42f6-ad3a-51551021e591` | — | Su D1 sigue siendo la base de datos del entorno público | `CONFIG` `DOC` no se verificó si el Worker `-staging` sigue existiendo en la cuenta |
| **Public** | `vecidya-platform` (top-level, `workers_dev: true`) | `vecidya-staging` (mismo D1 anterior) | `https://vecidya.com`, `https://www.vecidya.com` (301 → apex), `vecidya-platform.soporte-8a1.workers.dev` | **Publicado**; `v0.1.1`, Version ID `f8936f89-ef27-4d50-ae56-1b6e4ba35fed` | `CONFIG` `HTTP` `REMOTE` |
| **Production** independiente | — | — | `app.vecidya.com`, `admin.vecidya.com` no existen | **NO PROVISIONADO** | `CONFIG` un único D1 declarado; sin R2, sin subdominios |

## Qué código está publicado

El despliegue público vigente es el Version ID `f8936f89-ef27-4d50-ae56-1b6e4ba35fed` (`v0.1.1`, 2026-09-21) `CONFIG`/`RAN`. Comprobación anónima el 2026-09-21 `HTTP` de que las rutas temporales de recuperación fueron retiradas:

- `/app/internal/maintenance/auth-bootstrap` y `/app/internal/maintenance/password-rotation` devuelven **404**.
- `/app/internal` sin sesión devuelve la pantalla de login; el acceso autenticado de `hola@vecidya.com` fue comprobado manualmente en `/app` y `/app/internal`.
- La D1 remota reporta migraciones `0000`–`0009` aplicadas `REMOTE`.

Conclusión: el código actual y las migraciones `0007`–`0009` están desplegados en el Worker público y aplicados en `vecidya-staging`; no existe producción independiente.

## Repositorio Git

El repositorio Git se reconstruirá desde el snapshot actual de `main` y se publicará en el repositorio nuevo. El snapshot excluye dependencias generadas (`node_modules`, `.wrangler`, `build`, `dist`, `coverage`) y secretos (`.env*`, `.dev.vars`) mediante `.gitignore`.

## Variables y secretos

| Variable | Propósito | Requerida por código | Origen actual |
| --- | --- | --- | --- |
| `BETTER_AUTH_SECRET` | Firma/seguridad de Better Auth | Sí (`server/auth.server.ts` lanza error si falta) | Secreto remoto gestionado fuera de Git; local en `.dev.vars` (ignorado por Git). Declarado en `wrangler.jsonc` → `secrets.required` |
| `BETTER_AUTH_URL` | Origen canónico de navegador | No (fallback: origen de la request) | `wrangler.jsonc` → `vars` = `https://vecidya.com` |
| `APP_URL` | Origen del enlace de invitación | Solo para entrega de invitaciones | `wrangler.jsonc` → `vars` = `https://vecidya.com` |
| `RESEND_API_KEY` | Proveedor transaccional (Resend) | Solo para entrega de invitaciones | **No configurada** en el repo; estado remoto no verificado |
| `EMAIL_FROM` | Remitente verificado | Solo para entrega de invitaciones | **No configurada** en el repo; estado remoto no verificado |

Sin `RESEND_API_KEY` + `EMAIL_FROM` + `APP_URL` el envío de invitaciones responde `503` explícito. Ninguna variable se envía al cliente. No hay variables de GHL, Google, Meta, Stripe ni WhatsApp. `worker-configuration.d.ts` se regenera con `pnpm run cf-typegen` a partir de `wrangler.jsonc`; nunca a partir de `.env` o `.dev.vars`. `.env.example` está versionado pero **no se inspeccionó en este corte** (lectura bloqueada por regla de permisos); su contenido no está reconciliado con esta tabla.

## Recursos no habilitados

- **R2**: no habilitado en la cuenta consultada ni declarado en `wrangler.jsonc`. El logo del perfil se almacena como URL de texto, no como archivo subido.
- **Durable Objects, Queues, Workflows**: existen los directorios `worker/durable-objects`, `worker/queues`, `worker/workflows` sin contenido; no hay bindings.
- **Correo del dominio**: el MX de `vecidya.com` apunta a Google `DOC`; no se modificó.
- **Cloudflare Pages** `vecidya` (`vecidya.pages.dev`): existía según la auditoría 10A `DOC`; no forma parte de este repositorio.

## Reglas

1. Cada entorno usa bindings y recursos independientes; hoy Local y Development/Staging están separados, pero Public y Staging **comparten D1** (deuda `PROD-INDEPENDENT-001`).
2. Los secretos se gestionan fuera de Git; no se leen ni se imprimen archivos `.env*` ni `.dev.vars`.
3. Ninguna prueba destructiva apunta a producción pública. Las pruebas `remote-staging-*` apuntan al dominio público y no deben ejecutarse sin autorización (ver `TESTING.md`).
4. Los despliegues requieren autorización explícita; `wrangler deploy` despliega directamente al dominio público.
5. Las migraciones se validan en local antes de cualquier aplicación remota; `--remote` requiere autorización explícita.
6. Los comandos D1 locales usan el **binding** `DB` (`pnpm wrangler d1 execute DB --local …`), no el nombre obsoleto `vecidya-dev`.
7. No se crean recursos productivos adicionales sin fase correspondiente.

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
