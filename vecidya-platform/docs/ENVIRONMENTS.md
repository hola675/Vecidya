## Verificación anónima de Mi Vecidya (2026-10-19)

**HTTP RAN 2026-10-19T22:25Z**, solo GET anónimo, sin datos ni sesión: `/` respondió 200 y el footer sirvió `Versión pública 0.6.1` + `© 2026 Vecidya`; `/app`, `/app/business-profile` y `/app/internal` redirigieron a `/login`; `/app/miniweb` y `/app/crm` respondieron 404; `/licencias` y `/vecindario/vecidya` respondieron 200. No se siguieron redirecciones con sesión ni se modificó producción. Esto demuestra que las rutas MiniWeb/CRM del código local actual no están presentes en la superficie pública observada en esa fecha; no comprueba acceso autenticado ni cambios de datos públicos.

El package local también informa `0.6.1`, pero coincidencia de versión no demuestra igualdad de SHA o de código desplegado. Último deploy documentado sigue siendo el Worker público `vecidya-platform`, Version ID `8bf2c1c4-d6cb-47ca-ae74-01de28392d67`, conforme al release histórico; no se consultó API de deployments. No deploy, migración remota o acceso autenticado en este checkpoint.

## Codespaces y GitHub Actions — estado (2026-10-19)

`.devcontainer/devcontainer.json` permanece como configuración propuesta para Codespaces (Node 24, pnpm 11.21.0 e instalación congelada); no se verificó la apertura/ejecución de Codespaces. Los workflows `diagnostic-funnel-01d1.yml`, `vecidya-ci.yml` y `vecidya-licensing.yml` se retiran del repositorio por decisión autorizada. No hay CI GitHub Actions configurada por estos archivos; no se ejecutaron checks, tests ni builds al retirarlos. Esta operación no cambia Workers, bindings, despliegues ni D1, y no reactiva integraciones Cloudflare.

# Entornos

## DIAG-QA-03B-RELEASE-CLOSE — preflight remoto read-only (2026-10-23)

El usuario autorizó consultas read-only y autenticó Wrangler. Corte `2026-10-23T20:07Z`, cuenta Soporte `8a13de3ea584f9055f78565b9860c125`: staging `vecidya-staging` (ID `d4af6ebc-97c5-42f6-ad3a-51551021e591`) tiene ledger `0000–0009`, bookmark `000000a2-00000000-0000510d-11214e7e452494055c9de3bae86eaa70`, Worker `c7f7ee8b-e528-42d5-840c-ad7b4c9a9454` desplegado 2026-09-23; producción `vecidya-prod` (ID `8edc3f04-258e-4c29-9f33-76fec3d25042`) tiene ledger `0000–0010`, bookmark `000004f3-00000000-0000510d-aeb269208862ec0e0e67cafeedacec28`, Worker `8bf2c1c4-d6cb-47ca-ae74-01de28392d67` desplegado 2026-10-11. El código necesita `0000–0023`; ninguna escritura remota se hizo. El GET anónimo a `/` y `/diagnostico` falló con HTTP `000` por `CRYPT_E_REVOCATION_OFFLINE` de Schannel; no cuenta como verificación de publicación. Se conservan flags cerrados en configuración, sin afirmar que los valores desplegados fueron leídos. Matriz completa y razón del NO-GO en `DATABASE.md`.

## DIAG-PRIVACY-PURGE-01 — automatización preparada, switches cerrados (2026-10-22)

`wrangler.jsonc` programa Cron diario `17 3 * * *` (UTC) para el Worker base, pero `DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_ENABLED=false` y `DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_APPROVED=false` evitan todo borrado en producción hasta aprobación y cambio autorizado de ambos. Staging no registra Cron y mantiene ambos valores en `false`. Desarrollo puede habilitar ambos solo para ensayos con `AUTHZ_D1_PERSIST_TO` dirigido a una D1 temporal. Esto es configuración de código, no cron desplegado ni ejecución publicada: sin deploy, D1 remota o HTTP público. No usar `--remote`.

## DIAG-V3-FUNNEL-01C — pruebas locales (2026-10-12)

**DIAG-FUNNEL-PROD-01 — integrado en código; no publicado.** `wrangler.jsonc` mantiene `DIAGNOSTIC_REPORT_FUNNEL_ENABLED=false` en producción y staging. Las páginas/APIs identificadas requieren flag; desarrollo utiliza buzón fake y no Gmail real. La entrega real no se probó. La cadena versionada D1 llega a `0023`; último estado remoto documentado producción `0000–0010` es DOC histórico y no se confirmó durante este checkpoint por falta de autenticación. No migración, deploy ni HTTP público nuevo.

## DIAG-V3-REL-002 — release 0.6.1

- Versión `package.json`: `0.6.1`. `pnpm run typecheck` y `pnpm run build`: **PASS** antes de publicar.
- Alcance: catálogo visual público, sustitución de assets en Diagnóstico/Licencias/Addons/Servicios, copy comercial compartido y eliminación del texto HTML duplicado del estado diagnóstico.
- Deploy de producción ejecutado con `pnpm exec wrangler deploy` desde `main`, commit `7d0b1bd` (2026-10-10, hora de La Habana). Worker `vecidya-platform`, Version ID `8bf2c1c4-d6cb-47ca-ae74-01de28392d67`; se cargaron 39 assets y quedaron activos los triggers `vecidya.com/*` y `www.vecidya.com/*`.
- Migraciones: ninguna. D1 `vecidya-prod`: sin cambios. Secrets: sin cambios. Staging: sin cambios. `origin/main` apunta a `7d0b1bd`; su reflog local registra actualización por push a las 23:35 -04. Este agente no ejecutó `git push`.
- **HTTP anónimo**, 2026-10-10 23:40 (La Habana) / 2026-10-11 03:40 UTC: `/`, `/diagnostico`, `/licencias`, `/addons` y `/servicios` → `200`; `www.vecidya.com/` → `301` a `https://vecidya.com/`; `/app` → `302` a `/login`. Las cinco páginas públicas contienen `© 2026 Vecidya` y la versión `0.6.1`.
- Resultado: `0.6.1` publicada, comprobada por HTTP. Este despliegue no cierra Gate B: la candidata sigue inactiva y `GATE_B_PARTIAL` permanece.

## DIAG-V3-REL-001 — release 0.6.0

- Estado previo al deploy: release candidate local autorizado; publicación pública pendiente de verificación HTTP anónima.
- Núcleo: planner v2, schema 2, question bank v1, scoring v1, overall index v2, metodología 3.0, hard cap 24.
- Alcance: solo diagnóstico V3 y documentación mínima de release. Sin migraciones, sin cambios D1, sin GHL y sin arquitectura comercial nueva.
- La publicación solo se declarará después de verificar el commit desplegado en `https://vecidya.com/diagnostico` y las rutas públicas requeridas.

Última reconciliación: 2026-09-26 (deploy de `v0.5.7` — G6, Version ID `f7fc35a6-cb4f-48f0-ba73-5d2eea3c34f0`; `0010` aplicada en `vecidya-prod` en G7 a las 18:13Z, sin redeploy). Anterior: 2026-09-26 (deploy de `v0.5.6` — DIAG-003, puntaje global y exportación a PDF del Diagnóstico — en producción; antes, `v0.5.5` — precio público de licencias en USD —; staging sigue en `v0.4.1`).

Niveles de evidencia usados en este documento: **`CONFIG`** `wrangler.jsonc`/código, **`RAN`** comando ejecutado en local, **`HTTP`** petición anónima de solo lectura a los dominios publicados, fecha indicada por release, **`REMOTE`** consulta o escritura D1 remota autorizada, **`DOC`** afirmación histórica no reverificada.

## Veredicto sobre producción

`vecidya.com` sirve **`v0.6.1`** desde el Worker `vecidya-platform` con `vecidya-prod`, Version ID **`8bf2c1c4-d6cb-47ca-ae74-01de28392d67`** (2026-10-11T03:40Z). La comprobación HTTP anónima fechada está registrada arriba. La D1 remota conserva `0000`–`0010`; este deploy no aplicó migraciones. El párrafo siguiente describe el corte anterior (`0.5.7`).

`vecidya.com` sirvió **`v0.5.7`** desde el Worker `vecidya-platform` con `vecidya-prod`, Version ID **`f7fc35a6-cb4f-48f0-ba73-5d2eea3c34f0`** (2026-09-26T17:51Z). `LEARN-META-001` quedó resuelto en producción. La D1 remota tiene `0000`–`0010` aplicadas desde G7 (2026-09-26T18:13Z). El párrafo siguiente describe el corte anterior (`0.5.6`).

`vecidya.com` sirve ahora desde `vecidya-prod` mediante el Worker `vecidya-platform`, desplegado como Version ID `582a5c38-d1d4-4f3c-8ba5-e9424717fcb3` (`v0.5.6`, tercer corte — reordena el resultado del Diagnóstico y lo hace más compacto; ver «Deploy (3.º...)» abajo). El smoke HTTP anónimo (rutas públicas, versión, puntaje global y exportación a PDF del Diagnóstico, `www`, rutas privadas protegidas) pasó el 2026-09-26.

## G7 — Migración `0010` en `vecidya-prod` (2026-09-26, sin redeploy)

- **Autorización:** el usuario autorizó en G7 aplicar exclusivamente `0010_licensing-foundation` sobre `vecidya-prod`, sin redeploy ni cambios de código.
- **Pre-flight:** `main` en `ca208ea`, sincronizado con `origin`, working tree limpio. `DB` → `vecidya-prod` (`8edc3f04-258e-4c29-9f33-76fec3d25042`). `migrations list --remote`: solo `0010` pendiente. SQL sin cambios desde `406268c` (SHA-256 `3c936593e7f31147d7ccb308fe9c436eb84aa28887af703549b643605f87fe7e`), puramente aditivo. Ninguna de las 6 tablas existía.
- **PRE_MIGRATION_BOOKMARK:** `000000c2-00000000-000050f2-004d78b46378f119dd422e95a4ce30e4` (2026-09-26T18:12:52Z). Solo para restauración de emergencia; no se usó.
- **Apply:** `pnpm wrangler d1 migrations apply vecidya-prod --remote` (con `CLOUDFLARE_ACCOUNT_ID` de la cuenta de soporte), 18:13:50Z–18:13:55Z, 15 sentencias, `0010` ✅.
- **Verificación `REMOTE` (solo lectura):**
  - «No migrations to apply»; `d1_migrations.id = 11`.
  - 6 tablas con columnas, tipos, `NOT NULL` y PK idénticos al SQL; 6 índices con DDL idéntico; 6 claves foráneas (`CASCADE` y `NO ACTION` según el SQL).
  - `license_price`: Cuadra 3900, Barrio 5900 y Ciudad 8900 centavos USD, mensuales y activos.
  - `portfolio_pricing_tier`: 1→0, 2→1000, 3–4→1500 y 5+→2000 bps.
  - Cada semilla existe exactamente una vez; las 4 tablas sin semillas están vacías; `foreign_key_check` sin violaciones; las tablas existentes siguen legibles (18 usuarios, 13 organizaciones, 8 perfiles).
- **Smoke HTTP anónimo (18:15Z):** `/`, `/diagnostico`, `/aprende`, un artículo, `/login`, `/licencias` y `/vecindario` → 200. `/app`, `/app/internal` y `api/platform/organizations/:id/license` (GET y POST) → 302 `/login`. `/__health/db` → 200 `ok`. Pie «Versión pública 0.5.7».
- **Worker:** sin redeploy; `wrangler deployments list` sigue mostrando `f7fc35a6-cb4f-48f0-ba73-5d2eea3c34f0` (17:51:17Z, 100 %). KV, bindings y secretos sin cambios. Versión sin cambios (`0.5.7`).
- **Resultado:** `G7 PASS`; `LICENSE-MIGRATION-001` cerrada.

## Deploy `0.5.7` — G6: reconciliar producción con `main` (2026-09-26)

- **Autorización:** el usuario aprobó DIAG-V3-01, TYPECHECK-001 y REPO-EOL-001 y pidió publicarlos de forma controlada por `LEARN-META-001`. Después pidió «aplica migraciones y despliega».
- **Commits publicados:** `c60979f`, `0887707`, `905d310`, `d0235d8`, `bdae3fc`, `b0264ce` y `f5ab660` (`0.5.7`). Push sin force; `origin/main` = `f5ab660`. Los seis primeros ya estaban en `origin` cuando se hizo el push: alguien los subió entre el pre-flight y el push.
- **Pre-flight:** `main`, 0 commits por detrás; el rango no toca migraciones, `wrangler.jsonc` ni bindings. `--dry-run`: Worker `vecidya-platform`, rutas `vecidya.com/*` y `www.vecidya.com/*`, `DB=vecidya-prod`, 6 variables, KV vacío, secretos requeridos sin cambios (solo nombres). Preview: **no aplica** (sin `preview_urls` ni flujo de versiones configurado; staging en `0.4.1` con G4 pendiente).
- **Rollback identificado:** `582a5c38-d1d4-4f3c-8ba5-e9424717fcb3` (`0.5.6`, 01:56Z). No hizo falta.
- **Deploy:** `pnpm wrangler deploy` (con `CLOUDFLARE_ACCOUNT_ID` de la cuenta de soporte solo para el comando), 17:50:11Z–17:51:17Z, **Version ID `f7fc35a6-cb4f-48f0-ba73-5d2eea3c34f0`**.
- **HTTP anónimo de solo lectura** (`curl --ssl-no-revoke`, 17:42Z antes / 17:51Z después):

  | Comprobación | Antes (`0.5.6`) | Después (`0.5.7`) |
  | --- | --- | --- |
  | `<title>` de los 4 artículos de Aprende | «Artículo no encontrado \| Vecidya» | título real del artículo |
  | `robots` de los artículos | `noindex, nofollow` | `index, follow` |
  | canonical de los artículos | `https://vecidya.com/aprende` | URL individual del artículo |
  | description de los artículos | «El artículo que buscas no está disponible.» | descripción propia |
  | `/aprende/slug-que-no-existe-g6` | 404 «Página no encontrada» | 404 «Página no encontrada» (sin cambios) |
  | Pie de `/` | «Versión pública 0.5.6» | «Versión pública 0.5.7» |
  | `/`, `/diagnostico`, `/diagnostico?perfil=creator`, `/aprende`, `/login`, `/licencias`, `/sobre-nosotros` | — | 200 |
  | `/app` · `www` | — | 302 → `/login` · 301 → apex |

- **Smoke en navegador (Playwright MCP, anónimo, sin escrituras):** 14/14. Incluye la puerta «Artista o creador de contenido» → `?perfil=creator`, el perfil preseleccionado con la etiqueta nueva, un recorrido completo con resultado («Sistema en marcha», 81 %), prioridades, porcentajes, PDF, sin desborde a 1366/390, login renderizado y sin errores JavaScript. `/sobre-nosotros` muestra «Director Comercial». El Edge lanzado por el arnés local no puede abrir destinos remotos en esta máquina (`ERR_ADDRESS_INVALID`), de ahí el uso del navegador MCP.
- **Migraciones:** `wrangler d1 migrations list DB --remote` → solo `0010_licensing-foundation.sql` pendiente. SQL revisado: puramente aditivo. Bookmark Time Travel previo `000000c0-00000000-000050f2-bd6dcf14fcf9dc39fcf5be2110c39253`. **El `apply` remoto fue bloqueado por el clasificador de permisos del agente y no se ejecutó**: `vecidya-prod` no cambió (`LICENSE-MIGRATION-001`, G7).
- **Resultado:** `0.5.7 PRODUCTION PASS`. La reindexación de los artículos depende de los buscadores; Vecidya ya sirve las señales correctas.

## Deploy `0.5.6` — DIAG-003 puntaje global y exportación a PDF (2026-09-26)

- **Autorización:** el usuario pidió explícitamente el bloque (corrigiendo el nombre pegado de un plan externo de «DIAG-002» al identificador real disponible, `DIAG-003`, ya que DIAG-002/002B/002C estaban cerrados), luego «Disnostico Assest.png sald e asui lso res icnos con el mcp» (usar ese archivo con el MCP `motonexo-assets` para los iconos en vez de SVG dibujados a mano), «recura limpiar y boror lso assesa que no se utlizan» y «y despliega cueno termines».
- **Commits publicados:** `feat(diagnostic): add overall score, visual status and PDF export (DIAG-003)`, un commit de corrección visual y el commit de documentación de este release.
- **Gate:** `typecheck`, `build` y `git diff --check` PASS (solo avisos CRLF/LF preexistentes); `test:unit` **135/135** (84 del motor del Diagnóstico, +9 sobre las 75 previas); `diagnostic-experience-check.mjs` PASS en 1366/768/390/360 (deep links, aislamiento, a11y, recorrido de negocio, resultado, puntaje global visible, porcentaje por dimensión, exportación a PDF, sin superposición de filas). `product-experience-a-public-review-check.mjs` falla en `px-a` por el falso positivo preexistente `TEST-UX003-PXA` (coincide con la clase CSS `.admin-review-context`, ajena a este bloque; ver `STATUS.md`).
  - Reconstruido en el propio corte del deploy: el bundle de `/diagnostico` contiene `diagnostic-overall-score`, `diagnostic-status__score` y «Descargar mi diagn[óstico]»; el CSS contiene `diagnostic-print-header`, `diagnostic-overall-score__value`, `@media print` y el selector corregido `dd span.diagnostic-dimensions__bar`.
  - Migraciones: NINGUNA.
- **Regresión visual encontrada tras el primer deploy (RAN, Playwright, 2026-09-26):** el usuario reportó por captura que «Tus dimensiones» se veía roto en un ancho intermedio. Reproducido con Playwright en 600–1366px: el icono de estado y el porcentaje de cada dimensión se apilaban verticalmente y se dibujaban fuera de su fila, superpuestos con la dimensión siguiente. Causa: un selector preexistente `.diagnostic-dimensions dd span` (pensado solo para la barra) tiene mayor especificidad que la nueva clase `.diagnostic-dimensions__value` y le imponía `display:block; height:0.55rem`, apilando el icono (`img`, bloque) sobre el porcentaje (`strong`, bloque) en vez de mantenerlos en línea; el desbordamiento fue puramente de pintado (la caja de layout de la fila no crecía), por lo que `assertNoOverflow` (que solo mide el borde derecho contra el viewport) no lo detectaba. Corregido acotando el selector a `dd span.diagnostic-dimensions__bar`. Se agregó una regresión E2E que falla si `.diagnostic-dimensions__value` deja de ser un contenedor flex o si el icono y el porcentaje dejan de estar en la misma línea; confirmada en RED contra el bug y GREEN tras el fix.
- **Deploy (1.º, con el bug):** `pnpm wrangler deploy` a las 2026-09-26T01:09Z aprox. Version ID `1ce335f5-b7dd-422a-80a4-9ac9a6a9ff33`.
- **Deploy (2.º, con la corrección):** `--dry-run` confirmó `DB=vecidya-prod` y `APP_ENV=production`. `pnpm wrangler deploy` a las 2026-09-26T01:34Z aprox. Version ID **`f6c3c25e-16fe-4fa4-8b15-ad00fe352bc0`**. Staging, secrets y D1 remota no se tocaron (este bloque no usa D1).
- **HTTP anónimo de solo lectura** (`curl --ssl-no-revoke`):

  | Comprobación | Antes (01:32Z, `0.5.5`) | Después del 2.º deploy (01:34Z) |
  | --- | --- | --- |
  | Pie de `/` | «Versión pública 0.5.6» (1.º deploy) | «Versión pública 0.5.6» |
  | `/diagnostico` | `200` | `200` |
  | CSS: `diagnostic-print-header` / `diagnostic-overall-score__value` / `@media print` / `dd span.diagnostic-dimensions__bar` | — | 1 / 1 / 1 / 1 |
  | `/assets/selected/icons/status/diagnostic-status-priority.webp` | — | `200` |
  | `www` | — | `301` |
  | `/app` | — | `302` |
  | Verificación visual (Playwright, 1366/900/761/390) | roto (icono+% apilados y superpuestos) | correcto en las 4 anchuras |

- **Reestructuración del resultado pedida por el usuario tras el 2.º deploy:** «necesitamos mejorar [la] estructura del resultado del diagnóstico, para hacerlo más compacto y organizado... y las recomendaciones de planes y servicios de Vecidya sería al final, después de los botones..., y mejorar la estructura visual y ancho del resultado» (mensaje con errores de tipeo, interpretado y confirmado por el sentido). Cambios: la sección «Encaje con Vecidya» (licencia/servicios/addons/Aprende) se movió a después de la fila de botones de acción, como lo último del resultado; el título del resultado (`h2`) dejó de compartir el tamaño tipo-portada de las preguntas (`clamp(2rem,4vw,3.5rem)`) y bajó a `clamp(1.6rem,2.6vw,2.35rem)`; los párrafos del resultado pasaron de `max-width:44rem` a `58rem` (menos líneas, mejor uso del ancho de la tarjeta); el espaciado entre secciones bajó de `1.2rem` a `1rem`; y `@media print` recibió su propio ajuste más compacto (gap, tamaño de título y márgenes reducidos) para que el PDF generado quede más denso. Verificado visualmente con Playwright en pantalla (1366/390) y en vista de impresión (`emulateMedia("print")`) antes de desplegar.
- **Deploy (3.º, con la reestructuración):** `--dry-run` confirmó `DB=vecidya-prod` y `APP_ENV=production`. `pnpm wrangler deploy` a las 2026-09-26T01:56Z aprox. Version ID **`582a5c38-d1d4-4f3c-8ba5-e9424717fcb3`**. Staging, secrets y D1 remota no se tocaron.
- **HTTP anónimo de solo lectura del 3.º corte** (`curl --ssl-no-revoke`):

  | Comprobación | Antes (01:53Z, `0.5.6`, 2.º corte) | Después (01:56Z) |
  | --- | --- | --- |
  | Pie de `/` | «Versión pública 0.5.6» | «Versión pública 0.5.6» |
  | `/diagnostico` | `200` | `200` |
  | CSS: `diagnostic-result h2{font-size:1.6rem!important}` (regla de impresión) / `max-width:32ch` (título de pantalla) / `max-width:58rem` (párrafos) | — | 1 / 1 / 1 |
  | `www` | — | `301` |
  | `/app` | — | `302` |

- **Resultado:** `0.5.6 PRODUCTION PASS` (3.º corte).

## Deploy `0.5.5` — Precio público de licencias en USD (2026-09-25)

- **Autorización:** el usuario pidió explícitamente agregar el precio en USD de las licencias y, en un mensaje aparte, «y despliega». Antes de implementar se confirmó con el usuario (pregunta directa) que los montos a usar eran los `$39`/`$59`/`$89` ya existentes como referencia comercial, y que esto era una decisión de negocio real (no un borrador para ver cómo se vería).
- **Commit publicado:** `87ca30b` (`feat(licenses): publish USD monthly prices for Cuadra, Barrio and Ciudad`).
- **Gate:** `typecheck` y `build` PASS; `test:unit` 105/105 (sin cambios, este bloque no tocó unitarias). E2E: `licenses`, `commercial-review`, `addons` y `join-contact` PASS; `px-a` falla por el falso positivo preexistente `TEST-UX003-PXA` (coincide con la clase CSS `.admin-review-context`, no con copy de este cambio; confirmado que ninguno de los archivos tocados contiene la palabra «review»).
  - Reconstruido en el propio corte del deploy (`server-build-Du8SIYrb.js`, `root-BOdyOL4F.css`): contenía `"0.5.5"`, la plantilla del precio (`` USD ${license.priceUsd}/mes ``) y la regla `.license-card__price`.
  - Migraciones: NINGUNA.
- **Deploy:** `--dry-run` confirmó `DB=vecidya-prod` y `APP_ENV=production`. `pnpm wrangler deploy` a las 2026-09-25T23:20:06Z. Version ID **`cebd0a92-3560-4298-8a3b-5df0c6209477`**. Staging, secrets y D1 remota no se tocaron.
- **HTTP anónimo de solo lectura** (`curl --ssl-no-revoke`):

  | Comprobación | Antes (23:19Z, `0.5.4`) | Después (23:21Z) |
  | --- | --- | --- |
  | Pie de `/` | «Versión pública 0.5.4» | «Versión pública 0.5.5» |
  | `/licencias`: `USD 39/mes` / `USD 59/mes` / `USD 89/mes` | 0 / 0 / 0 | 1 / 1 / 1 |
  | `/licencias`: «Aún no hay precios públicos» / «Precio mensual de referencia en USD» | — / — | 0 / 1 |
  | 17 rutas públicas, `/login`, `/register`, `/api/auth/ok` | — | `200` |
  | `/app`, `/app/organization`, `/app/internal` | — | `302` |
  | `www` | — | `301` |

- **Resultado:** `0.5.5 PRODUCTION PASS`.

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
| **Public / Production** | `vecidya-platform` (top-level) | `vecidya-prod` `8edc3f04-258e-4c29-9f33-76fec3d25042` | `https://vecidya.com`, `https://www.vecidya.com` (301 → apex), `vecidya-platform.soporte-8a1.workers.dev` | **Publicado y verificado**; `v0.5.5`, Version ID `cebd0a92-3560-4298-8a3b-5df0c6209477` (2026-09-25); smoke HTTP anónimo PASS | `CONFIG` `HTTP` `REMOTE` |

## Qué código está publicado

El despliegue público vigente es el Version ID `f7fc35a6-cb4f-48f0-ba73-5d2eea3c34f0` (`v0.5.7`, 2026-09-26T17:51Z; el anterior fue `582a5c38-d1d4-4f3c-8ba5-e9424717fcb3`, `v0.5.6`) `CONFIG`/`HTTP`:

- `/app/internal/maintenance/auth-bootstrap` y `/app/internal/maintenance/password-rotation` devuelven **404**.
- `/app/internal` sin sesión devuelve la pantalla de login; el acceso autenticado de `hola@vecidya.com` fue comprobado manualmente en producción en `/app` y `/app/internal`.
- La D1 remota reporta migraciones `0000`–`0009` aplicadas `REMOTE`.

Conclusión: el código `0.5.7` está desplegado en el Worker público y el binding reportado por Wrangler es `vecidya-prod`. La D1 remota tiene `0000`–`0010` aplicadas (`REMOTE`, 2026-09-26T18:13Z, G7); el esquema de licenciamiento ya coincide con el código publicado. `vecidya-staging` sigue preservada como D1 independiente de staging.

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

**DIAG-V3-13 (2026-10-02):** el diagnóstico público pasó al motor V3, cliente-only. `DIAGNOSTIC_RECOVERY_HMAC_KEY`, el binding KV `DIAGNOSTIC_SNAPSHOTS` y el ratelimit `DIAGNOSTIC_RECOVERY_RATE_LIMITER` se eliminaron de `wrangler.jsonc` junto con el backend que los usaba (nunca desplegado — ver `STATUS.md` `DIAG-V3-RECOVERY-SECRET-001`/`DIAG-V3-KV-PLACEHOLDER-001`, cerradas por superseded). El diagnóstico ya no tiene requisitos de secretos, KV ni rate limit propios.

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
