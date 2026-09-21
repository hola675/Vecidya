# Estado de implementación

Última reconciliación: **2026-09-21 (AUTH-BOOTSTRAP-001)**. Evidencia: código, schema, migraciones, 17 E2E locales, deploy `v0.1.1`, consultas D1 remotas y comprobación autenticada de `hola@vecidya.com`. Vocabulario y niveles de evidencia: [GOVERNANCE.md](GOVERNANCE.md). Detalle por tema: [PROJECT_STATE.md](PROJECT_STATE.md), [TESTING.md](TESTING.md), [ENVIRONMENTS.md](ENVIRONMENTS.md).

## Veredicto

Vecidya es una plataforma SSR sobre Cloudflare Workers con auth, multi-organización, perfil comercial por organización, directorio público, administración interna con gobierno y una web pública completa. RR-001 queda en **PASS técnico local** y PERF-001 en **PASS**: `typecheck`, `build`, `git diff --check` y 17/17 E2E locales pasan sobre D1 limpia. La versión `0.1.1` está desplegada; el dominio público continúa usando la D1 compartida `vecidya-staging`.

Lo publicado en `vecidya.com` corresponde a `v0.1.1` (Version ID `f8936f89-ef27-4d50-ae56-1b6e4ba35fed`), y la D1 remota reporta migraciones `0000`–`0009`. `vecidya.com` se sirve desde el D1 `vecidya-staging`: **no hay producción independiente**. Hay **un solo vecino real publicado (Vecidya, dogfooding)**; el piloto con negocios reales no está publicado y está bloqueado por decisiones y datos pendientes.

## Matriz de capacidades

`PASS` = código + UI + datos + prueba versionada ejecutada que la protege. `PARTIAL` = existe pero incompleta, sin prueba ejecutable, o solo local. `BLOCKED` = impedida por dependencia externa o decisión. Columna *Publicado*: `sí` (comprobado por HTTP 2026-09-21), `no` (solo local), `n/a`.

| Capacidad | Código | UI | DB | Test | Publicado | Estado | Nota clave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Auth (registro, login, logout, sesión) | sí | sí | sí | indirecto | sí | **PARTIAL** | Sin reset de contraseña ni verificación de email; sin pruebas de credenciales inválidas; logout solo en el test PX-B (roto) |
| Organizaciones | sí | sí | sí | sí | sí | **PASS** | Renombrar/eliminar sin pruebas; Better Auth expone endpoints propios (`AUTHZ-BA-001`) |
| Miembros y roles | sí | sí | sí | stale | sí | **PARTIAL** | Único test (7B.1) usa el nombre D1 obsoleto → no ejecutable |
| Multi-org (arquitectura y aislamiento) | sí | sí | sí | sí | sí | **PASS** | 1 usuario → N organizaciones → 1 perfil por organización; probado por `pe-b` |
| Multi-org (experiencia) | sí | parcial | — | sí (RAN 2026-09-20) | sí | **PASS técnico local** | Login fija la primera organización válida y al retirar membresía se limpian sesiones activas |
| Business Profile (núcleo) | sí | sí | sí | sí | sí | **PASS** | Creación, edición, slug único, publicación, aislamiento |
| BP: contacto y presencia (`0007`) | sí | sí | sí | sí | **sí** | **PASS** | WhatsApp, Instagram, Facebook, LinkedIn |
| BP: operaciones (`0008`) | sí | sí | sí | sí | **sí** | **PASS** | Modalidad, cobertura, horarios (`business_hours`) |
| BP: gestión por API | sí | — | — | sí (RAN 2026-09-20) | sí | **PASS técnico local** | La capa server-side rechaza dejar incompleto un perfil publicado; no existe despublicar |
| Servicios (cliente) | sí | sí | sí | sí | sí | **PASS** | Solo lectura para el cliente; catálogo de 3 servicios sembrado |
| Servicios (administración) | sí | sí | sí | stale | sí | **PARTIAL** | Test 4B/8D no ejecutable; sin auditoría; `activated_at` nunca se escribe |
| Servicios públicos (`/servicios`) | sí | sí | n/a | 200/overflow | sí | **PASS** | Contenido estático sin precios; no lee `service_catalog` |
| Vecindario (lista, búsqueda, filtros, perfil) | sí | sí | sí | sí | sí | **PASS** | Búsqueda solo por nombre; sin paginación; filtro de ciudad sin prueba ejecutable |
| Diagnóstico | sí | sí | n/a | solo 200/overflow | sí | **PARTIAL** | Anónimo, efímero, cliente; motor sin pruebas; defectos de puntuación (`DIAG-001`) |
| Web pública (rutas y contenido) | sí | sí | n/a | 6 rutas | sí | **PASS** | 10 URLs en sitemap; defectos de calidad en `UX-PUBLIC-001` |
| SEO/GEO | sí | n/a | n/a | parcial | sí | **PARTIAL** | Sin `og:image`; sitemap/robots sin pruebas; canonical fijo |
| Administración interna (base) | sí | sí | sí | parcial | sí | **PARTIAL** | 8A/8C pasan; 8B/8E/servicios stale |
| Gobierno de perfiles (verificar/suspender/auditar) | sí | sí | sí | sí | **sí** | **PASS** | `0009`; solo `platform_admin` activo |
| Integraciones (metadata genérica) | sí | solo lectura | sí | stale | sí | **PARTIAL (foundation)** | Registro tenant-scoped; sin cliente de proveedor |
| GHL | no | no | no | no | no | **NOT IMPLEMENTED** | Solo texto en documentación |
| Invitaciones (7B.2) | sí | sí | sí | stale | sí | **BLOCKED** | Entrega sin probar y aceptación imposible sin verificación de email (`INVITE-001`) |
| Experiencia de app cliente (`/app`) | sí | sí | sí | sí (RAN 2026-09-20) | sí | **PASS técnico local** | PX-B pasa en desktop y móvil; quedan las deudas de producto fuera de RR-001 |
| Contenido educativo real | no | hub vacío | n/a | n/a | sí (vacío) | **NOT IMPLEMENTED** | 0 artículos; `/que-debes-saber` es un hub sin contenido |
| Legal / privacidad | sí (`/privacidad`) | sí | n/a | no | sí | **PARTIAL** | Revisión legal completa pendiente antes de persistir/captar |
| Real Proof (negocios reales) | sí (validación local) | sí (solo local) | sí | `rp001a` | 1 (dogfooding) | **BLOCKED para publicación remota** | RP-001A valida tres casos controlados sin publicar; siguen bloqueados datos/autorizaciones y G4 |
| Producción independiente | no | no | no | no | no | **NOT IMPLEMENTED** | Público = staging |

## Fases: estado declarado vs reconciliado

«Reconciliado» aplica el criterio de evidencia de este corte. La evidencia histórica detallada (Version IDs, QA remotos) permanece en [CHANGELOG.md](CHANGELOG.md).

| Fase(s) | Estado declarado | Estado reconciliado | Motivo |
| --- | --- | --- | --- |
| 1A Bootstrap, 1B D1/Drizzle | PASS TÉCNICO | PASS | `typecheck`/`build` pasan; migraciones `0000`–`0009` aplican en local |
| 1C Auth, 1D Organizations, 1E Authorization | IMPLEMENTADA | PARTIAL | Sin prueba dedicada; matriz 1E no reproducible; solo cobertura indirecta |
| 2A App Shell, 2B Business Profile, 2C Perfil público | PASS TÉCNICO / CERRADA | PASS | `bpx`, `public-growth-c1`, `pe-b`, `c1`, `c2`, `px-a` pasan |
| 3A Web pública base | PASS TÉCNICO | PARTIAL | `/unete` sin prueba local |
| 3B.1 Directorio, 3B.2 Búsqueda/filtros | PASS TÉCNICO | PARTIAL | `q`/categoría protegidos; ciudad y estado vacío solo en script `.ps1` obsoleto |
| 4A Servicios cliente | PASS TÉCNICO | PASS | `services-experience` pasa |
| 4B Servicios (admin), 4C Portal, 5A Integraciones | PASS TÉCNICO | PARTIAL | Prueba única usa nombre D1 obsoleto; no ejecutable |
| 6A/6B Contenido y pulido público | PASS TÉCNICO | PARTIAL | Overflow/meta de 6 rutas; sitemap/robots/a11y sin pruebas |
| 7A Cuenta | PASS TÉCNICO | PASS | `account-personal-settings` pasa |
| 7B.1 Miembros y roles | PASS TÉCNICO | PARTIAL | Test stale; «TEST-002 resuelta» contradicha |
| 7B.2 Invitaciones | EN PROGRESO / BLOQUEADA | BLOCKED | Ver `INVITE-001` |
| 7C Perfil (pulido), 7D Servicios (experiencia) | PASS TÉCNICO | PASS | `bpx`, `services-experience` pasan |
| 8A Shell admin, 8C Admin de negocios | PASS TÉCNICO | PASS | `admin-shell`, `admin-business-profiles` pasan |
| 8B Organizaciones (admin), 8D Servicios (admin), 8E Integraciones | PASS TÉCNICO | PARTIAL | Tests stale; código presente |
| 9 Product Hardening | PASS TÉCNICO | PARTIAL | Health read-only OK; «D1 local limpia» no se sostiene (11 scripts no limpian) |
| 10A–10C Staging remoto | PASS TÉCNICO | PASS (histórico) | Evidencia remota histórica; las pruebas remotas **no se ejecutaron** en este corte |
| Public Experience V2, SEO/GEO, Structured Data | CERRADA / PASS | PASS | JSON-LD `Organization` y `LocalBusiness` en código; sin `Review`/`Article` |
| DIAG-RUNTIME-001 | PASS TÉCNICO | PARTIAL | Sin prueba del motor; afirmaciones «siete puertas», «cero API» sin protección |
| PUBLIC-WEB-CONTENT-001, PUBLIC-GROWTH-001 A/B | CERRADA / PASS | PARTIAL | Cierre con QA no versionado; verificable por código, sin pruebas |
| PUBLIC-GROWTH-001 C1 Real Profile Readiness | PASS TÉCNICO | PASS | `public-growth-c1` pasa |
| PUBLIC-GROWTH-001 C2 First Real Neighbors | EN PROGRESO | EN PROGRESO | Vecidya publicada (HTTP 200 + sitemap); 0 vecinos externos |
| PUBLIC-PROD-DIRECT-001 | CERRADA | PASS | `wrangler.jsonc` top-level; apex 200, `www` 301 |
| PRODUCT-EXPERIENCE-001 A | PASS TÉCNICO LOCAL | PASS | `product-experience-a` pasa (45 s) |
| PRODUCT-EXPERIENCE-001 B | EN ESPERA | PARTIAL | Test de 260 líneas existe pero falla (defectos del script) |
| PRODUCT-EVOLUTION-001 A | PASS DOCUMENTAL | PASS | Auditoría; confirmada por este baseline |
| PRODUCT-EVOLUTION-001 B Multi-Business | PASS TÉCNICO | PASS | `pe-b` pasa |
| PRODUCT-EVOLUTION-001 C1 Contacto y presencia | PASS TÉCNICO | PASS | `c1` pasa; desplegado en `v0.1.1` |
| PRODUCT-EVOLUTION-001 C2 Operaciones | PASS TÉCNICO | PASS | `c2` pasa; desplegado en `v0.1.1` |
| PRODUCT-EVOLUTION-001 D1 Gobierno | PASS TÉCNICO | PASS | `d1` pasa; desplegado en `v0.1.1` |
| PRODUCT-EVOLUTION-001 E1 Piloto local | PASS TÉCNICO LOCAL | NO REPRODUCIBLE | Ningún test ni fixture en el repo; el commit `179784a` solo cambió documentación |
| DOC-RECON-001 → Baseline 2026-09-20 | PASS DOCUMENTAL | PASS DOCUMENTAL | 13 documentos activos (máx. 20) |
| PERF-001 Image & Asset Optimization | PASS TÉCNICO | PASS | 14 raster activos migrados a WebP; 18,649,999 → 4,369,378 bytes; `v0.1.1` desplegado |
| RP-001A Real Proof / Local Validation | EN ESPERA | **PASS LOCAL** | Tres organizaciones piloto controladas; borradores, publicación incompleta, Vecindario, JSON-LD no publicado y aislamiento verificados; publicación remota no realizada |

## Open Debt

Prioridad: **A** alta, **M** media, **B** baja. Cada fila cita evidencia; `hipótesis` = deducida de lectura de código o de la librería, no ejecutada.

### Riesgo de continuidad y publicación

| ID | Descripción | Evidencia | Prio | Estado |
| --- | --- | --- | --- | --- |
| `PROD-INDEPENDENT-001` | No hay producción independiente: `vecidya.com` usa el D1 `vecidya-staging`; sin `app.`/`admin.`, R2 ni secretos productivos dedicados | `wrangler.jsonc`; ENVIRONMENTS | A | NO INICIADA |
| `REMOTE-TEST-RISK-001` | `remote-staging-e2e.mjs` y `remote-staging-seo-check.mjs` ejecutan `wrangler d1 execute --remote` contra el D1 que sirve `vecidya.com`; sus guardas también aceptan la URL workers.dev del Worker público | `tests/e2e/remote-staging-*.mjs:28-75` | A | ABIERTA (no ejecutar) |
| `PUBLISH-GAP-001` | El código y las migraciones `0007`–`0009` ya están publicados/aplicados; el piloto externo continúa requiriendo autorización y datos reales confirmados | ENVIRONMENTS; deploy `v0.1.1` 2026-09-21 | A | RESUELTA para plataforma / pendiente para piloto |
| `REPO-HYGIENE-001` | `vecidya-platform.zip` (37,9 MB, snapshot de 2026-08-27 sin migraciones `0007`–`0009`) versionado; `b1` eliminó ~1.250 archivos (`archive/`, biblioteca `resources/assets`) sin registro documental; ramas `feature/*` y un worktree `.kilo` desactualizados | `git show --stat ec79b22`; `git ls-files` | M | ABIERTA |

### Piloto y Real Proof

| ID | Descripción | Evidencia | Prio | Estado |
| --- | --- | --- | --- | --- |
| `PILOT-IDENTITY-001` | No existe cuenta real de Edgar ni su email confirmado | PROJECT_STATE histórico; ningún fixture en repo | A | BLOQUEADA (dato del usuario) |
| `PILOT-NAME-ASESORAR-T` | Dos variantes candidatas del nombre público sin confirmación | CHANGELOG 2026-09-07 E1 | A | BLOQUEADA (decisión del usuario) |
| `PILOT-BRAND-SURA` | Sin acreditación confirmada para asociar «Edgar \| Asesor de Seguros SURA» a la marca; el código no tiene guarda de marcas y el badge público «Perfil verificado por Vecidya» podría reforzar una afiliación implícita | `public-v2.tsx:204`; sin validación de nombres | A | BLOQUEADA (autorización de tercero) |
| `PILOT-REPRO-001` | El procedimiento E1 efímero fue reemplazado por un fixture local controlado reproducible; no contiene datos privados confirmados ni publica pilotos | `tests/e2e/rp-001a-local-real-proof-check.mjs`; ejecución RP-001A 2026-09-20 | M | **RESUELTA para validación local** |
| `PII-CHECK-001` | El número `+573244321864` aparece como ejemplo en el editor (`business-profile.tsx:215`), en un mensaje de error y en un test; confirmar que es ficticio | grep | M | ABIERTA |

### Producto y arquitectura

| ID | Descripción | Evidencia | Prio | Estado |
| --- | --- | --- | --- | --- |
| `INVITE-001` (ex `7B.2-DELIVERY`) | Invitaciones: (1) entrega Resend nunca probada, `RESEND_API_KEY`/`EMAIL_FROM` no declarados; (2) `requireEmailVerificationOnInvitation: true` y ninguna ruta envía/verifica email → un invitado no puede aceptar sin editar `email_verified` en SQL (así lo hace el test) | `server/auth-plugins.server.ts:8`; `organization-invitations-check.mjs:81` | A | BLOQUEADA |
| `MULTIORG-LOGIN-001` | Login fija la primera organización válida mediante `organization.list` + `organization.setActive` | `app/routes/login.tsx`; E2E `px-b`/`pe-b` | A | RESUELTA (RAN 2026-09-20) |
| `MULTIORG-STALE-001` | Al retirar una membresía se limpian las sesiones del usuario que aún apuntan a esa organización | `server/auth-plugins.server.ts` `afterRemoveMember`; E2E `members` | M | RESUELTA (RAN 2026-09-20) |
| `AUTHZ-BA-001` | Los endpoints por defecto de Better Auth (`/api/auth/organization/*`: crear/actualizar/eliminar organización, etc.) no pasan por la matriz propia; creación de organizaciones sin límite ni verificación de email; sin configuración de rate limiting (memoria por isolate) | `api-auth.ts`; `auth-plugins.server.ts` | M | ABIERTA (hipótesis: falta verificar qué puede hacer un `owner` vía Better Auth) |
| `BP-API-001` | La persistencia server-side rechaza cualquier actualización que dejaría incompleto un perfil publicado; no existe «despublicar» ni redirección al cambiar slug | `db/queries/business-profile.server.ts`; E2E `bpx` | M | RESUELTA (RAN 2026-09-20) |
| `AUDIT-COVERAGE-001` | `platform_audit_log` solo registra las 4 acciones de gobierno; la asignación de servicios y la creación de integraciones no se auditan; `activated_at`/`ended_at` nunca se escriben | `platform-governance.server.ts:73-86`; `internal-services.tsx` | M | ABIERTA |
| `PLATFORM-ADMIN-001` | La cuenta operativa `hola@vecidya.com` ya tiene `platform_admin` activo, pero no existe flujo permanente de gestión/recuperación de administradores; el bootstrap efímero fue retirado | D1 remota 2026-09-21; rutas temporales 404 | M | ABIERTA (gestión permanente pendiente) |
| `ADMIN-UI-001` | El detalle de negocio no muestra logo, WhatsApp, redes, modalidad ni horarios (verifica sin ver contactos); `internal.tsx` conserva copy «SIGUIENTE BLOQUE»; enlaces «Ver página pública» a perfiles suspendidos dan 404 | `internal-business-profile-detail.tsx`; `internal.tsx:38-50` | B | ABIERTA |
| `ORG-UI-001` | `organization.tsx:136` compara con `organization.userId`, inexistente → «Tu cuenta» nunca aparece; ofrece rol `owner` que Better Auth rechaza (hipótesis) | código | B | ABIERTA |
| `INTEGRATION-001` | POST de integraciones sin manejo de duplicado (500); `(provider, external_id)` único global; cualquier miembro lee `metadata`; sin update/delete | `api-platform-integrations.ts`; schema | B | ABIERTA |
| `LEGAL-PRIV-001` | Persistir diagnóstico/captación/perfiles ampliados requiere revisión legal; `/privacidad` es solo base pública | PROJECT_STATE | A | NO INICIADA |

### Experiencia pública

| ID | Descripción | Evidencia | Prio | Estado |
| --- | --- | --- | --- | --- |
| `DIAG-001` | Diagnóstico: respuestas de un perfil anterior siguen puntuando tras volver y cambiar el perfil; solo genera 1 «oportunidad»; la dimensión `organizacion` solo baja; resultado sin enlaces a Servicios/Vecindario/contenido; ids de dimensión sin acento en pantalla | `diagnostic.tsx:276-487,649,670` | M | ABIERTA |
| `CONTENT-EDU-001` | `/que-debes-saber` es un hub sin artículos (4 tarjetas no clicables); Home promete «SEO/GEO» que no aparece; `/aprende` no existe (el menú de escritorio dice «Aprende» y enlaza a `/que-debes-saber`) | `knowledge.tsx:45-56`; `home.tsx:160` | M | ABIERTA |
| `UX-PUBLIC-001` | 8 páginas anidan un segundo `<main>`; sin `og:image`/`og:url`/Twitter; ninguna página pública enlaza a `/register`; `alt` de `VisualSection` oculto por `aria-hidden`; imágenes sin `width/height/loading`; overflow de emails/URLs largos en perfil sin `overflow-wrap`; 3 assets sin uso con nombres de reseñas/ratings | greps; `public-layout.tsx:23` | M | ABIERTA |
| `INTERCONNECT-001` | Perfil → Servicios/Diagnóstico/Contacto es un CTA fijo no contextual; sin negocios/contenido relacionados; Diagnóstico sin salida contextual (ver mapa en PROJECT_STATE) | código | M | ABIERTA (trabajo de roadmap) |
| `HOME-STATIC-001` | Home es 100 % copy estático (~600 palabras, 2 ilustraciones); sin búsqueda ni vecinos; el buscador del Vecindario solo filtra por nombre aunque su placeholder sugiere rubros; sin paginación | `home.tsx`; `business-profile.server.ts:78` | M | ABIERTA (roadmap) |

### Pruebas

| ID | Descripción | Evidencia | Prio | Estado |
| --- | --- | --- | --- | --- |
| `TEST-D1-NAME` | Los scripts locales usan el binding D1 `DB`; no quedan referencias activas a `vecidya-dev` en `tests/e2e` | `tests/e2e`; runner 17/17 PASS | M | RESUELTA (RAN 2026-09-20) |
| `TEST-PXB-001` | PX-B corrigió locators, lifecycle por viewport, fixture local y overflow responsive en organización | `product-experience-b-client-app-check.mjs`; `app/app.css`; runner PASS | M | RESUELTA (RAN 2026-09-20) |
| `TEST-GAPS-001` | No hay pruebas unitarias ni de integración, ni script `test`, ni CI. Sin protección: motor del Diagnóstico, `sitemap.xml`/`robots.txt`/`favicon`, credenciales inválidas, `/unete`, `/sobre-nosotros`, `/que-debes-saber`, `/privacidad`, `www`→apex, `/api/organizations/:id/authorization` | `docs/TESTING.md` | M | ABIERTA |
| `TEST-SAFETY-001` | Los scripts locales validan `BASE_URL`; los remotos requieren intención explícita y hostname workers.dev | `tests/e2e/test-safety.mjs`; pruebas negativas PASS | M | RESUELTA (RAN 2026-09-20) |
| `TEST-CLEANUP-001` | 11 scripts dejan fixtures en la D1 local (perfiles publicados, `platform_admin`); pueden hacer inestables las aserciones del directorio | `TESTING.md` | B | ABIERTA |

### Configuración

| ID | Descripción | Evidencia | Prio | Estado |
| --- | --- | --- | --- | --- |
| `ENV-EXAMPLE-001` | `.env.example` no se pudo inspeccionar en este corte (lectura bloqueada); no está reconciliado con las variables reales | intento de lectura denegado | B | ABIERTA |

## Deuda resuelta o reclasificada

| ID | Resolución |
| --- | --- |
| TECH-001 a TECH-004, DOC-001, DIAG-DEPLOY-001 | Resueltas (evidencia previa; código actual las sostiene) |
| TEST-001, TEST-002 | **Reabiertas** como `TEST-D1-NAME`: la afirmación «runner estabilizado» ya no se sostiene con el D1 actual |
| `7B.2-DELIVERY` | Reemplazada por `INVITE-001`, que añade el bloqueo de verificación de email |
| Piloto: «no hay deuda de datos» | Sustituida por `PILOT-*` |
