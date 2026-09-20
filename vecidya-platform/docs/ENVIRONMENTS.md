# Entornos

Última reconciliación: 2026-09-20 (Baseline 2026-09-20).

Niveles de evidencia usados en este documento: **`CONFIG`** `wrangler.jsonc`/código, **`RAN`** comando ejecutado en local, **`HTTP`** petición anónima de solo lectura al dominio público el 2026-09-20, **`DOC`** afirmación histórica de la documentación **no reverificada** (no hubo acceso a Cloudflare remoto en este corte).

## Veredicto sobre producción

`vecidya.com` **se sirve desde infraestructura staging**. El Worker público `vecidya-platform` usa el D1 `vecidya-staging` `CONFIG`. **No existe producción independiente**: no hay D1 productivo separado, ni `app.`/`admin.vecidya.com`, ni secretos productivos dedicados, ni R2 (`CONFIG`, `DOC`). Las palabras «producción pública» en documentos antiguos significaban «el dominio público real», no «infraestructura productiva independiente».

## Matriz de entornos

| Entorno | Worker | D1 | Dominio / URL | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| **Local** | `react-router dev` con el plugin de Cloudflare (`pnpm run dev`) | Emulada por Miniflare en `.wrangler/state/v3/d1` (binding `DB`); migraciones `0000`–`0009` aplicadas | `http://localhost:*` | Operativo | `RAN` `d1_migrations` local contiene 10 filas (`0000`–`0009`) |
| **Development** (remoto) | Ninguno versionado | `vecidya-dev` remoto (creado en Foundation 1B; la auditoría 10A halló pendientes `0003`–`0006`) | Ninguno | **Abandonado / sin uso**: ya no aparece en `wrangler.jsonc` y no se reutiliza como staging | `DOC` no reverificado |
| **Staging** | `vecidya-platform-staging` existió y sirvió el dominio público hasta `PUBLIC-PROD-DIRECT-001` (2026-08-27); ya no está definido en `wrangler.jsonc` | `vecidya-staging` `d4af6ebc-97c5-42f6-ad3a-51551021e591` | — | Su D1 sigue siendo la base de datos del entorno público | `CONFIG` `DOC` no se verificó si el Worker `-staging` sigue existiendo en la cuenta |
| **Public** | `vecidya-platform` (top-level, `workers_dev: true`) | `vecidya-staging` (mismo D1 anterior) | `https://vecidya.com`, `https://www.vecidya.com` (301 → apex), `vecidya-platform.soporte-8a1.workers.dev` | **Publicado**; código anterior al 2026-09-07 (ver abajo) | `CONFIG` `HTTP` apex 200; `www` 301 → `https://vecidya.com/` |
| **Production** independiente | — | — | `app.vecidya.com`, `admin.vecidya.com` no existen | **NO PROVISIONADO** | `CONFIG` un único D1 declarado; sin R2, sin subdominios |

## Qué código está publicado

El despliegue público vigente documentado es el Version ID `6cca1801-d638-4b6f-9849-ae9681716e6a` (2026-08-27, `PUBLIC-PROD-DIRECT-001`) `DOC`. Comprobación anónima el 2026-09-20 `HTTP` de que **el código de 2026-09-07 no está publicado**:

- `/app/internal/audit` devuelve **404**, igual que una ruta inexistente, mientras que rutas protegidas existentes (`/app/internal`, `/app/internal/businesses`, `/app/internal/integrations`, `/app/business-profile`) devuelven 302 → `/login`.
- El CSS público desplegado no contiene los selectores añadidos por los commits de contacto/presencia (`public-business-profile__social-links`), horarios (`public-business-profile__hours`) ni gobierno (`public-business-profile__verified`, `admin-governance`, `admin-audit-log`).
- El HTML de `/vecindario/vecidya` no contiene `wa.me`, «Cómo atiende», «Horarios» ni «verificado por Vecidya».

Conclusión: migraciones `0007`, `0008` y `0009` y las funcionalidades asociadas (WhatsApp/redes, modalidad/cobertura/horarios, verificación/suspensión/auditoría) existen **solo en local**. La D1 remota `vecidya-staging` no se consultó; la documentación histórica indica que `0007` se aplicó solo en local y no registra `0008`/`0009` remotos.

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
