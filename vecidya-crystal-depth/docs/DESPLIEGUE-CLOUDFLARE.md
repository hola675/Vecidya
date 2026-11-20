# Despliegue automático de Crystal Depth en Cloudflare Workers

**Versión:** 1.0.0 · 2026-11-19

Este proyecto es una biblioteca visual independiente: **no despliega ni modifica la plataforma principal**. Se publica únicamente la carpeta estática preparada en `vecidya-crystal-depth/dist/`.

## Conectar el Worker existente

En Cloudflare > Workers & Pages > **vecidya-desig** > Settings > Builds > Connect:

| Campo | Configuración |
| --- | --- |
| Git account | `hola675` |
| Repository | `Vecidya` |
| Production branch | `main` |
| Root directory | `vecidya-crystal-depth` |
| Disable builds | **Desactivado** |
| Build command | `node scripts/build-cloudflare.mjs` |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler preview` |

**No conectar desde la raíz del repositorio.** Workers ejecuta los comandos desde `Root directory`. El nombre definido en `wrangler.jsonc` coincide con el Worker existente `vecidya-desig`.

En Settings > Builds > Build watch paths, configurar:

- Include: `vecidya-crystal-depth/*`
- Include: `vecidya-platform/public/assets/*`

Esto evita despliegues por cambios irrelevantes de otros proyectos; permite desplegar también cuando cambian los activos oficiales utilizados por la biblioteca.

## Qué hace el build

1. Crea `dist/` desde cero (sin alterar la fuente original).
2. Copia `index.html`, `biblioteca.html`, `styles/` y `assets/`.
3. Detecta las referencias a `../vecidya-platform/public/assets/` en la biblioteca y el catálogo.
4. Copia **solo** esos archivos oficiales a `dist/assets/platform/` y reescribe las rutas en los archivos publicados.
5. Falla explícitamente si falta un activo referido; no despliega un sitio con esos recursos rotos.

La biblioteca original sigue usando las rutas compartidas del monorepositorio para la revisión local. No se incorporan copias de las imágenes oficiales al código fuente ni se publican `docs/`, scripts ni otras carpetas internas.

## Comprobación local

Desde la raíz del repositorio:

```bash
cd vecidya-crystal-depth
node --check scripts/build-cloudflare.mjs
node scripts/build-cloudflare.mjs
npx wrangler dev
```

Abrir `/` y `/biblioteca`, probar búsqueda, estilos, imágenes y enlaces de la galería. `/biblioteca.html` se normaliza a `/biblioteca` mediante Cloudflare Workers Static Assets.

## Publicación y control

- El merge en `main` puede activar el primer despliegue si la conexión Git ya existe.
- Cada nuevo push a `main` que toque los directorios vigilados vuelve a ejecutar el build y el deploy.
- Comprobar la versión publicada y los recursos de la galería en **Deployments**.
- Conservar el historial de versiones del Worker para poder revertir ante errores. Revisar que el dominio existente siga asociado a `vecidya-desig`.
- El build no modifica DNS ni crea un nuevo Worker o dominio.
