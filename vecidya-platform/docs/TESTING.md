# Pruebas

Última reconciliación: 2026-09-22 (EMAIL-001 RELEASE READY). Evidencia: `pnpm run test:email` pasó 4/4 y `pnpm run test:e2e` pasó 17/17 contra el Worker local; la entrega real Gmail no se ha probado. También se conserva la verificación histórica de producción `/login → /app → /app/internal` del 2026-09-21. Este documento distingue lo que la documentación *afirma* de lo que las pruebas *protegen*.

## Estado de la infraestructura de pruebas

- No hay framework de pruebas ni CI (`.github/` no existe), ni pruebas unitarias o de integración (`tests/unit` y `tests/integration` solo tienen `.gitkeep`). `package.json` incluye `test:e2e`, un runner secuencial de los E2E locales aplicables.
- Solo existe `tests/e2e/`: 24 scripts `.mjs` (Node + `fetch`, algunos con Playwright) y 4 `.ps1`. Cada script usa un `assert()` propio que lanza; el éxito imprime una línea `PASS: …`. Ningún archivo tiene cabecera de uso.
- Son **solo Windows** (`cmd.exe /d /c pnpm.cmd wrangler d1 execute … --local`).
- Los scripts Playwright usan Microsoft Edge si existe, luego `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, luego Chromium empaquetado (requiere `playwright install`).

## Cómo ejecutar (solo local)

```powershell
cd vecidya-platform
pnpm wrangler d1 migrations apply DB --local     # una vez; D1 local debe tener 0000–0009
pnpm run dev                                     # terminal 1: Worker en http://localhost:5173
$env:BASE_URL = "http://localhost:5173"          # terminal 2 (es el valor por defecto)
node tests/e2e/<archivo>.mjs                     # una a la vez: comparten puerto y D1 local
```

Requisitos: `BETTER_AUTH_SECRET` en `.dev.vars` (no versionado), Node ≥22.12. `organization-invitations-check` espera `503` si Gmail OAuth no está configurado. `tests/email/mail-adapter.test.ts` usa el proveedor fake y nunca contacta Gmail. Variable opcional `D1_DATABASE_NAME` (por defecto `DB`).

Los scripts locales fallan antes de registrar usuarios si `BASE_URL` no es HTTP en `localhost` o `127.0.0.1`. Las pruebas remotas requieren además `RUN_REMOTE_E2E=1`, `TARGET_ENV=staging`, `D1_NAME=vecidya-staging` y HTTPS sobre un hostname que empiece por `vecidya-platform-staging.` y termine en `.workers.dev`. Rechazan explícitamente `vecidya.com`, `www.vecidya.com`, `vecidya-platform.soporte-8a1.workers.dev` y `vecidya-prod`; siguen fuera de `test:e2e`.

## Alias usados en la documentación

| Alias | Archivo (`tests/e2e/`) | Fase |
| --- | --- | --- |
| `acct` | `account-personal-settings-check.mjs` | 7A |
| `bpx` | `business-profile-experience-check.mjs` | 7C |
| `services-exp` | `services-experience-check.mjs` | 7D |
| `admin-shell` | `admin-shell-check.mjs` | 8A |
| `admin-bp` | `admin-business-profiles-check.mjs` | 8C |
| `admin-orgs` | `admin-organizations-check.mjs` | 8B |
| `admin-int` | `admin-integrations-check.mjs` | 8E |
| `psa` | `platform-service-administration-check.mjs` | 4A/4B/4C/5A/8D |
| `members` | `organization-members-check.mjs` (+ `-setup`, `-apply-fixture`, `-stable-check.ps1`) | 7B.1 |
| `invitations` | `organization-invitations-check.mjs` | 7B.2 |
| `pg-c1` | `public-growth-c1-real-profile-readiness-check.mjs` | PUBLIC-GROWTH-001 C1 |
| `px-a` | `product-experience-a-public-review-check.mjs` | PRODUCT-EXPERIENCE-001 A |
| `px-b` | `product-experience-b-client-app-check.mjs` | PRODUCT-EXPERIENCE-001 B |
| `pe-b` | `product-evolution-001-b-multi-organization-check.mjs` | PRODUCT-EVOLUTION-001 B |
| `c1` | `product-evolution-001-c1-contact-presence-check.mjs` | PRODUCT-EVOLUTION-001 C1 |
| `c2` | `product-evolution-001-c2-business-operations-check.mjs` | PRODUCT-EVOLUTION-001 C2 |
| `d1` | `product-evolution-001-d1-admin-governance-check.mjs` | PRODUCT-EVOLUTION-001 D1 |
| `rp001a` | `rp-001a-local-real-proof-check.mjs` | RP-001A — Real Proof local |

## Resultado de la ejecución de 2026-09-20

`typecheck` PASS, `build` PASS (`RAN`). E2E locales:

| Prueba | Resultado | Tiempo | Notas |
| --- | --- | --- | --- |
| `acct` | **PASS** | 2 s | |
| `bpx` | **PASS** | 2 s | |
| `services-exp` | **PASS** | 8 s | |
| `admin-shell` | **PASS** | 10 s | |
| `admin-bp` | **PASS** | 8 s | |
| `pg-c1` | **PASS** | 7 s | |
| `px-a` | **PASS** | 45 s | |
| `px-b` | **PASS** | — | Login, publicación, aislamiento y responsive 1366/390/360 verificados. |
| `pe-b` | **PASS** | 14 s | |
| `c1` | **PASS** | 17 s | Deja fixtures |
| `c2` | **PASS** | 30 s | |
| `d1` | **PASS** | 14 s | |

Resultado RR-001: **17 PASS / 0 FAIL / 0 SKIP** ejecutadas por `pnpm run test:e2e` sobre D1 local limpia. Las dos pruebas remotas no forman parte del runner.

### RP-001A — ejecución local controlada

`node tests/e2e/rp-001a-local-real-proof-check.mjs` → **PASS**. Creó tres organizaciones piloto locales con un owner compartido, confirmó membresía y cambio de contexto, guardó los tres casos como borradores, bloqueó publicaciones incompletas, verificó 404/ausencia de JSON-LD en perfiles no publicados, exclusión de Vecindario y rechazo cross-tenant. El script elimina sus organizaciones, perfiles y usuarios al finalizar; la consulta posterior dejó 0 filas `rp001a-*`.

Los tres casos permanecieron sin publicar porque los datos no confirmados se dejaron vacíos o `MISSING / UNCONFIRMED`. Remote D1, publicación remota y producción no fueron tocadas.

## Clasificación de seguridad de los 28 archivos

| Clase | Archivos | Regla |
| --- | --- | --- |
| **Local, ejecutable** | `test:e2e` ejecuta secuencialmente los scripts `.mjs` locales aplicables; `rp001a` se ejecuta explícitamente para no mezclar pilotos con la suite general | Una a la vez, con `pnpm run dev` |
| **Local, corregidas** | `admin-int`, `admin-orgs`, `invitations`, `members`, `members-apply-fixture`, `psa`, `business-profile-tenancy-check.ps1`, `public-business-profile-check.ps1` | Usan el binding local `DB` |
| **REMOTAS — excluidas** (2) | `remote-staging-e2e.mjs`, `remote-staging-seo-check.mjs` | Requieren `RUN_REMOTE_E2E=1`, `TARGET_ENV=staging`, Worker dedicado `vecidya-platform-staging` y `D1_NAME=vecidya-staging`; rechazan producción y nunca las ejecuta `test:e2e` |
| **Helper** (1) | `organization-members-setup.mjs` | Requiere `MEMBERS_FIXTURE_FILE` |

Los dos `.ps1` de navegador dependen de `npx --yes agent-browser` (sin fijar versión) y de referencias `@eN` codificadas.

## Cobertura real por categoría

`Ejecutable` = protegida por una prueba local versionada; la ejecución de cierre se registra con `RAN`.

| Categoría | Protegida por (ejecutable) | Brecha |
| --- | --- | --- |
| Auth | registro por API en 17 scripts; `get-session` en `acct`; login UI en `c2`; 302 anónimo en `d1` | Sin pruebas de credenciales inválidas, duplicados, contraseña débil, reset, verificación de email, expiración de sesión, límites; logout solo en `px-b` (roto); persistencia de sesión no probada entre reinicios |
| Organizaciones | crear/activar en casi todos; multi-org en `pe-b` | Renombrar, eliminar, unicidad de slug, `GET /api/organizations/:id` |
| Permisos | matrices 403 en `admin-shell`, `admin-bp`, `d1`; roles de perfil en `bpx`/`c1` | `/api/organizations/:id/authorization`; unicidad de membresía (TECH-002); matriz 7B.1 (stale) |
| Aislamiento tenant | fuerte en perfil (`pe-b`, `bpx`, `c1`, `c2`, `pg-c1`) y servicios (`services-exp`, `pe-b`) | Miembros/integraciones solo en scripts stale |
| Business profile | `bpx`, `pg-c1`, `c1`, `c2`, `pe-b`, `d1` | Subida de logo (no existe); publicación vía API |
| Servicios | `services-exp`, `pe-b` | Escritura admin (4B/8D) stale |
| Admin interna | `admin-shell` (8A), `admin-bp` (8C), `d1` | 8B, 8E y API de servicios stale; nada ejecutable cubre `/organizations`, `/integrations` ni escritura de servicios |
| Web pública | `px-a`: `/`, `/vecindario`, perfil, `/servicios`, `/diagnostico`, `/contacto` (200, título, descripción, canonical, patrones prohibidos, overflow 1366/390/360) | `/unete`, `/sobre-nosotros`, `/que-debes-saber`, `/privacidad`, páginas 404, `www`→apex |
| Vecindario | `q` y categoría en `pg-c1`, `px-a`; exclusión de borradores/suspendidos en `c1`, `d1` | Filtro de ciudad, filtros combinados y estado vacío solo en `.ps1` stale |
| Diagnóstico | solo 200/sin overflow/patrones prohibidos en `px-a` | **Motor sin pruebas**: puntuación, ramificación, siete puertas, `mailto`, «cero llamadas `/api/`». Las funciones `scoreAnswers`, `getApplicableQuestions`, `getDiagnosticMailto` no se exportan (no son unit-testables como están) |
| SEO | meta/canonical en 6 rutas (`px-a`); JSON-LD `LocalBusiness` en `px-a`, `c1`, `c2`, `pg-c1` | `sitemap.xml`, `robots.txt`, `favicon.ico`: **0 pruebas**; SEO remoto solo en script remoto |
| Responsive | overflow en `px-a`, `c1`, `c2` (perfil y editor a 360) | Sin tablet, regresión visual ni axe/a11y |
| Gobierno y auditoría | `d1` (verificar, suspender, badge, 404, exclusión, auditoría) | Paginación/orden de auditoría; efecto de suspensión en sitemap |
| Multi-org | `pe-b`, `bpx`, `services-exp` | Invitar a un miembro existente a una segunda organización |
| Invitaciones | `invitations` (stale; imprime «PASS PARCIAL»: inyecta filas y `email_verified` por SQL) | Entrega real y aceptación de extremo a extremo |
| Integraciones | `psa`, `admin-int` (stale) | Ninguna ejecutable |
| Staging remoto | script remoto (no ejecutar) | Sin ensayo seguro |
| Piloto real | `rp001a` | Validación local controlada de los tres nombres documentados; no publica datos y no sustituye autorización, datos confirmados ni prueba remota |

## Afirmaciones de la documentación vs pruebas

Ver la tabla «Fases: estado declarado vs reconciliado» en [STATUS.md](STATUS.md). En resumen: las fases de Business Profile, Servicios (cliente), Cuenta, Admin 8A/8C, multi-org y `PRODUCT-EVOLUTION-001` B/C1/C2/D1 tienen prueba ejecutable; 4B/4C/5A/7B.1/7B.2/8B/8D/8E dependen de scripts stale; Diagnóstico, `PUBLIC-WEB-CONTENT-001`, `PUBLIC-GROWTH-001` A/B/C2, PX-B, E1 y 1C/1D/1E descansan en QA no versionado, cobertura indirecta o un script roto.

## Brechas propuestas (solo listado; ver deuda `TEST-*` en STATUS)

1. Ejecutar y estabilizar `test:e2e` desde una D1 local limpia.
2. Mantener `DB` como binding único en los scripts locales.
3. Mantener guardas de `BASE_URL` local y la intención explícita para los dos remotos.
4. Pruebas para `/sitemap.xml`, `/robots.txt`, `/favicon.ico`, `/unete`, `/sobre-nosotros`, `/que-debes-saber`, `/privacidad`, 404 y `www`→apex.
5. Extraer y probar el motor del Diagnóstico (unitario) o cubrirlo con Playwright.
6. Pruebas de auth negativas, `/api/organizations/:id[/authorization]` y unicidad de membresía.
7. Limpieza de fixtures en los 11 scripts que no limpian.
8. Pruebas unitarias de módulos puros (`db/business-hours-rules.ts`, `db/business-profile-rules.ts`, validaciones, autorización).
9. `test:e2e` ya existe; queda pendiente una decisión sobre CI y sustituir `agent-browser` por Playwright.
10. Extender `rp001a` únicamente cuando se resuelvan nombre, identidad y marca; cualquier publicación remota requiere un bloque separado y autorización explícita.
