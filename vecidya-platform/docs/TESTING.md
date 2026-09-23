# Pruebas

Última reconciliación: 2026-09-23 (REL-004; DIAG-002C; DIAG-002B; DIAG-002; REL-003.1; UX-003.1/003.4).

**Evidencia REL-004 sobre `b59d614` = release `0.4.1` (RAN 2026-09-23):** `pnpm run typecheck` PASS, `pnpm run build` PASS, `pnpm run test:unit` **75/75 PASS**, `git diff --check` PASS. E2E: los **25 scripts** locales se ejecutaron (11 por `pnpm run test:e2e`, que aborta en el primer fallo, y los 14 restantes uno a uno): **21 PASS, 1 PASS PARCIAL** (`organization-invitations-check.mjs`, delivery Gmail externo no ejecutado) y **3 FAIL**, los tres en alcance UX-003 y ninguno en el Diagnóstico: `px-a` (`TEST-UX003-PXA`), `px-b` (`TEST-UX003-PXB`) y `pe-b` (`TEST-UX003-PEB`); ver Open Debt en [STATUS.md](STATUS.md). `diagnostic-experience-check.mjs` PASS en 1366/768/390/360. Smoke HTTP anónimo de producción `0.4.1` PASS para `/`, `/diagnostico`, `/diagnostico?perfil=organization`, `/licencias`, `/addons`, `/servicios`, `/aprende`, `/contacto`, `/vecindario`, `/privacidad`, `/robots.txt` y `/sitemap.xml`.

Evidencia DIAG-002C (RAN 2026-09-23): `pnpm run test:unit` **75/75 PASS** (5 nuevas: G/I → ninguna licencia, servicio ≠ licencia, Barrio/Ciudad positivos y sin dudas ni sin consultas, vocabulario de addons único, «organización» + cuatro puertas de Home); `diagnostic` en 1366/768/390/360 y el resto de la superficie pública reejecutados (el runner completo no llega al final: aborta en `px-a`, ver evidencia REL-004 arriba). Evidencia DIAG-002B (RAN 2026-09-23): `pnpm run test:unit` **70/70 PASS** (27 semánticas nuevas: monotonía, aislamiento por pregunta, multiselección, irrelevancia sistemática sobre 19 personas × 26 preguntas, metamórficas, pares, contradicciones, estados límite, fortalezas, licencia, coherencia interna); `diagnostic-experience-check.mjs` PASS en 1366/768/390/360 con la jerarquía reordenada; `pnpm run test:e2e` **25/25 PASS**; typecheck, build y diff-check PASS. Evidencia DIAG-002 (RAN 2026-09-23): `pnpm run test:unit` **43/43 PASS**; `diagnostic-experience-check.mjs` PASS en 1366/768/390/360; `px-a`, `commercial-review`, `learn`, `licenses`, `addons`, `join-contact`, `about` y `pg-c1` reejecutados tras el cambio (ver STATUS). Evidencia REL-003.1: runner E2E local completo ejecutado con **25 scripts**: 24 PASS y `organization-invitations-check.mjs` PASS PARCIAL por delivery Gmail externo no ejecutado; `commercial-experience-review-check.mjs` PASS en 1366/768/390/360; typecheck, build y diff-check PASS. Smoke HTTP anónimo de producción `0.3.0` PASS el 2026-09-23 para rutas públicas, artículo Aprende, sitemap, robots y redirect legado. Evidencia UX-003 (`RAN`): typecheck/build PASS y `/login`, CSS e ilustración responden 200 en Worker local. Browser integrado no disponible; scripts autenticados omitidos para preservar D1 local.

## Estado de la infraestructura de pruebas

- No hay framework de pruebas externo ni CI (`.github/` no existe). `tests/unit/diagnostic/` contiene siete suites `node:test` (75 pruebas) del motor del Diagnóstico más dos archivos de personas (`personas.ts`, `adversarial-personas.ts`), ejecutables con `pnpm run test:unit` sin Worker ni D1; `tests/unit/register-ts.mjs` y `ts-resolve-hooks.mjs` resuelven importaciones relativas sin extensión sobre el type stripping de Node (≥22.12 con `--experimental-strip-types`). `tests/integration` sigue vacío. `package.json` incluye además `test:e2e` (runner secuencial de los E2E locales aplicables) y `test:email`.
- Solo existe `tests/e2e/`: 29 scripts `.mjs` (Node + `fetch`, algunos con Playwright) y 4 `.ps1`. Cada script usa un `assert()` propio que lanza; el éxito imprime una línea `PASS: …`. Ningún archivo tiene cabecera de uso.
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

`pnpm run test:unit` no necesita Worker ni D1: ejecuta en Node las 75 pruebas del motor del Diagnóstico (`tests/unit/diagnostic`).

Requisitos: `BETTER_AUTH_SECRET` en `.dev.vars` (no versionado), Node ≥22.12. `organization-invitations-check` espera `503` si Gmail OAuth no está configurado. `tests/email/mail-adapter.test.ts` usa el proveedor fake y nunca contacta Gmail. Variable opcional `D1_DATABASE_NAME` (por defecto `DB`).

Los scripts locales fallan antes de registrar usuarios si `BASE_URL` no es HTTP en `localhost` o `127.0.0.1`. Las pruebas remotas requieren además `RUN_REMOTE_E2E=1`, `TARGET_ENV=staging`, `D1_NAME=vecidya-staging` y HTTPS sobre un hostname que empiece por `vecidya-platform-staging.` y termine en `.workers.dev`. Rechazan explícitamente `vecidya.com`, `www.vecidya.com`, `vecidya-platform.soporte-8a1.workers.dev` y `vecidya-prod`; siguen fuera de `test:e2e`.

## Alias usados en la documentación

| Alias | Archivo (`tests/e2e/`) | Fase |
| --- | --- | --- |
| `acct` | `account-personal-settings-check.mjs` | 7A |
| `bpx` | `business-profile-experience-check.mjs` | 7C |
| `services-exp` | `services-experience-check.mjs` | 7D |
| `diagnostic` | `diagnostic-experience-check.mjs` | UX-001B.6 / UX-002.5 / DIAG-002 |
| `unit-diag` | `tests/unit/diagnostic/*.test.ts` (`pnpm run test:unit`) | DIAG-002 |
| `join-contact` | `join-contact-experience-check.mjs` | UX-001B.7 |
| `about` | `about-experience-check.mjs` | UX-001B.8 |
| `learn` | `learn-experience-check.mjs` | UX-001B.9 |
| `commercial-review` | `commercial-experience-review-check.mjs` | UX-002.7 |
| `legal-trust` | `legal-trust-experience-check.mjs` | UX-001B.10 |
| `licenses` | `licenses-experience-check.mjs` | UX-002.2 |
| `addons` | `addons-experience-check.mjs` | UX-002.3 |
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

`typecheck` PASS, `build` PASS (`RAN`). E2E locales (REL-003): **24 PASS / 1 PASS PARCIAL / 0 FAIL / 0 SKIP**, 25 scripts ejecutados contra Worker local. El resultado parcial corresponde exclusivamente a `organization-invitations-check.mjs`: el camino de autorización y aceptación se valida, pero la entrega Gmail externa no se ejecuta sin configuración/autorización de correo.

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
| **Local, ejecutable** | `test:unit` (Node, sin servidor ni D1); `test:e2e` ejecuta secuencialmente los scripts `.mjs` locales aplicables; `rp001a` se ejecuta explícitamente para no mezclar pilotos con la suite general | Unitarias en cualquier momento; E2E una a la vez, con `pnpm run dev` |
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
| Web pública | `px-a` + `join-contact` + `about` + `learn` + `licenses` + `addons` + `commercial-review`: recorrido comercial completo con 200, metadata, CTAs cruzados, mailto, autoría, referencias comerciales explícitas, separación addon/servicio/consumo, ausencia de GHL público, exclusión de rutas privadas del sitemap, overflow y responsive 1366/768/390/360; UX-001B.2 además valida Home con hasta 3 perfiles D1, 4 choices y 4 servicios; UX-001C cubre filtros noindex, alias 301 y sitemap | `/privacidad` fuera de smoke dedicado, páginas 404, `robots.txt`, `favicon.ico`, `www`→apex y auditoría a11y completa |
| Vecindario | `q` y categoría en `pg-c1`, `px-a`; exclusión de borradores/suspendidos en `c1`, `d1` | Filtro de ciudad, filtros combinados y estado vacío solo en `.ps1` stale |
| Diagnóstico | `unit-diag` (75: contrato de deep link con inyecciones y perfiles retirados, exclusivas de multiselección, cambio de perfil y aislamiento de ramas, secuencia y longitud por perfil × momento, cotas [0,100] y determinismo, «no lo sé» ≠ «no», «no aplica» sin penalización, dimensiones sin evidencia, confianza, escenarios A–E y patrón generalizado del piloto, invariantes sobre 1.125 combinaciones, Ciudad solo con captura y seguimiento, catálogo real contra `/licencias`, `/servicios`, `/addons` y `learn.ts`; DIAG-002B añade `semantics.test.ts`: monotonía por pregunta ordinal con orden declarado, aislamiento por pregunta, multiselección monótona, irrelevancia sistemática, metamórficas «no lo sé» → evidencia, pares seguimiento/registro, «varios canales» condicionado al registro, activos sin contaminar contacto/confianza, Google sin contradicción, ramificación sin consultas, contradicciones declaradas, estados límite A/B/H/I/K, fortalezas con evidencia, licencia Cuadra/Barrio/Ciudad/none, objetivo sin prerrequisitos, reseñas, coherencia interna; DIAG-002C añade: operación sana sin necesidad recurrente → ninguna licencia (G, I), servicio sin licencia y servicios nunca derivados de la licencia, Barrio/Ciudad positivos y nunca sobre dudas ni sin consultas, sin «opcional» en ninguna razón de licencia, vocabulario de addons único, «organización» como perfil y deep link con Home de cuatro puertas); `diagnostic` (deep links por perfil y objetivo, valores inválidos, Home → Profesional, aislamiento al cambiar de perfil, fieldset/radios, teclado, foco, `progressbar`, recorrido de negocio, resultado explicable con prioridad principal destacada y niveles sin números, anclas de licencia y addon, `mailto` sin respuestas crudas, reinicio y responsive 1366/768/390/360); `px-a` cubre 200/meta/overflow | Sin auditoría axe automatizada; los otros cuatro perfiles solo se recorren en unitarias; persistencia fuera de alcance |
| SEO | `commercial-review` verifica meta/canonical, `og:image`, robots, favicon, alias legado 301, sitemap y exclusión de rutas privadas; JSON-LD `LocalBusiness` en `px-a`, `c1`, `c2`, `pg-c1` | SEO remoto solo en script remoto; canonical usa dominio público fijo por diseño |
| Responsive | `commercial-review` verifica overflow, imágenes dimensionadas, un único `<main>` y recorrido comercial en 1366/768/390/360; `px-a`, `c1`, `c2` cubren perfil/editor | Sin auditoría axe automatizada ni regresión visual por comparación de screenshots |
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
5. ~~Extraer y probar el motor del Diagnóstico (unitario)~~ Resuelto por DIAG-002 (`tests/unit/diagnostic`, 43 pruebas).
6. Pruebas de auth negativas, `/api/organizations/:id[/authorization]` y unicidad de membresía.
7. Limpieza de fixtures en los 11 scripts que no limpian.
8. Pruebas unitarias de módulos puros (`db/business-hours-rules.ts`, `db/business-profile-rules.ts`, validaciones, autorización).
9. `test:e2e` ya existe; queda pendiente una decisión sobre CI y sustituir `agent-browser` por Playwright.
10. Extender `rp001a` únicamente cuando se resuelvan nombre, identidad y marca; cualquier publicación remota requiere un bloque separado y autorización explícita.
