# Portal de acceso en `crm.vecidya.com`

El portal es un **Cloudflare Worker con Static Assets**, independiente del Worker principal `vecidya-platform`.

## Configuración Git deploy (Workers & Pages → Workers)

- Repository: `hola675/Vecidya`
- Branch: rama de integración para preview temporal, o `main` **solo después de fusionar y validar los cambios**
- Root directory: `vecidya-platform`
- Build command: `exit 0`
- Deploy command: `npx wrangler deploy --config wrangler.crm-portal.jsonc`

El archivo exclusivo `wrangler.crm-portal.jsonc` publica `./crm-portal`; no utiliza `build/client`, ni `workers/app.ts`, ni modifica rutas existentes del dominio principal.

## Custom domain
Cuando el Worker haya desplegado correctamente, entrar en Workers & Pages → `vecidya-crm-portal` → Settings → Domains & Routes → Add → Custom Domain → `crm.vecidya.com`. Revisar DNS previo y HTTPS.

## Comprobaciones
1. `workers.dev` del Worker CRM muestra `index.html`.
2. Botón «Entrar en Mi Vecidya» apunta a `https://vecidya.com/login?redirectTo=%2Fapp%2Fcrm`.
3. `crm.vecidya.com` presenta certificado TLS válido.
4. `vecidya.com` sigue usando su Worker principal sin cambios.
5. `/app/crm` únicamente estará disponible en la web principal tras fusionar y desplegar el PR.

Si se crea un **Cloudflare Pages** real en lugar de un Worker, configurar el output estático con `vecidya-platform/crm-portal` y no ejecutar `wrangler deploy`. No combinar ambos procedimientos.

Ningún servicio de esta fase solicita credenciales de HighLevel ni cambia Better Auth o las cookies de `vecidya.com`.
