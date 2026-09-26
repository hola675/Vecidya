# Changelog

## 2026-09-26 — G7: migración `0010` en producción (sin redeploy)

- `0010_licensing-foundation` aplicada en `vecidya-prod` con `wrangler d1 migrations apply vecidya-prod --remote` (18:13:50Z–18:13:55Z). Era la única pendiente; el SQL no cambió desde `406268c` y es puramente aditivo.
- Bookmark Time Travel previo: `000000c2-00000000-000050f2-004d78b46378f119dd422e95a4ce30e4` (no usado).
- Verificado en remoto: ninguna migración pendiente; 6 tablas, 6 índices y 6 FK idénticos al SQL; precios Cuadra/Barrio/Ciudad `USD 39/59/89` y 4 tramos de portafolio, cada uno una vez; sin violaciones de FK. Smoke HTTP PASS; rutas protegidas siguen en 302 `/login`; `/__health/db` `ok`.
- Sin redeploy (el Worker sigue en `f7fc35a6`), sin cambios de código, KV, bindings, secretos ni versión (`0.5.7`). Cierra `LICENSE-MIGRATION-001`. Nueva deuda menor: `HEALTH-ENV-001`.

## 2026-09-26 — Release `0.5.7` (G6: reconciliar producción con `main`, LIVE)

- **Publicado:** `pnpm wrangler deploy` a las 17:51Z, Version ID `f7fc35a6-cb4f-48f0-ba73-5d2eea3c34f0`, commit `f5ab660`. Rollback identificado, no usado: `582a5c38-d1d4-4f3c-8ba5-e9424717fcb3`.
- **`LEARN-META-001` resuelta en producción:** antes, los 4 artículos de Aprende salían como «Artículo no encontrado», `noindex, nofollow` y canonical a `/aprende`; ahora tienen título real, `index, follow`, canonical individual y descripción propia. El slug inexistente sigue en 404.
- **Smoke de producción:** HTTP y navegador 14/14 (Home, puerta «Artista o creador de contenido», «Director Comercial», Diagnóstico completo, login, `/app` 302, `www` 301, sin errores JS).
- **Migración `0010`:** pendiente en `vecidya-prod`. El usuario pidió aplicarla, pero el clasificador de permisos del agente bloqueó el `apply` remoto; D1 sin cambios (`LICENSE-MIGRATION-001`, G7).

- **Versión:** `0.5.6` → `0.5.7` (PATCH). Sigue el precedente del proyecto: cada release publicado recibe su versión, y un PATCH es un cambio visible sin capacidad nueva (`0.5.1`). Este release lleva la corrección de producción `LEARN-META-001`, dos cambios de texto visibles (terminología) y cambios internos sin efecto observable (DIAG-V3-01, TYPECHECK-001, REPO-EOL-001).
- **Contenido:** `c60979f`, `0887707`, `905d310`, `d0235d8`, `bdae3fc`, `b0264ce` y este commit. Sin migraciones, bindings, secretos, D1 ni KV.

## 2026-09-26 — DIAG-V3-01 Domain contracts, TYPECHECK-001 y REPO-EOL-001 (solo local, sin deploy)

- **DIAG-V3-01 (`905d310`, cerrada técnicamente y pendiente de aprobación):**
  - `contracts.ts` define:
    - `DiagnosticVersion`: «2.0» es el motor actual; `DiagnosticVersionV3` es `never` hasta que exista un motor V3.
    - `QuestionVersion`, y las listas cerradas `QUESTION_IDS`, `ISSUE_IDS` y `CORE_DIMENSION_IDS`.
    - `Resolution<T>`, una unión discriminada `resolved | unresolved` con motivo y candidatos.
    - Los conceptos V3 `EntityType`, `BusinessModel`, `OperationalArchetype`, `NicheId` (nominal y validado), `GrowthStage`, `CustomerModel` (alcance × comprador), `PrimaryGoal`, `PrimaryFriction`, `DiagnosticEvidence` y `DimensionConfidence`, más `DiagnosticContextV3` y `DiagnosticResultV3`.
  - `mappings.ts` traduce legacy → V3 sin casts:
    - Etapa: solo «idea» se resuelve; el `growing` actual queda sin resolver frente al `growing` V3.
    - Perfil → entidad + arquetipo, solo donde la equivalencia es segura.
    - «unsure» es la ausencia declarada de un objetivo.
  - `Answers`, `Question.id` e `Issue.id`/`after` usan IDs tipados: solo cambian anotaciones y el resultado añade `version`.
  - La caracterización se fijó sobre `0887707` antes del cambio y sigue idéntica. Se añaden 14 pruebas de contrato y 13 afirmaciones de compilación.
- **TYPECHECK-001 (`d0235d8`), por instrucción del usuario («0 errores ni warnings heredados»):**
  - `pnpm run typecheck` ejecutaba `tsc` sin `-b` sobre un tsconfig «solution» y no comprobaba ningún archivo. Ahora usa `tsc -b` e incluye `db/` y los archivos de configuración raíz.
  - Corregidos 20 TS6307, 5 errores reales y 1 TS2883. Uno de ellos era un **defecto de producción** (`LEARN-META-001`): `meta({ data })` no recibe datos en React Router 8, así que cada artículo de Aprende se publica como «Artículo no encontrado», con `noindex, nofollow` (HTTP 2026-09-26T16:40Z). Se añade la regresión en `learn-experience-check.mjs`.
  - Better Auth perdía la inferencia de `activeOrganizationId` cuando el array de plugins salía de una función. Ahora el plugin se crea con un factory y `plugins: [...]` va en línea, con la misma política compartida con el CLI.
- **REPO-EOL-001 (`bdae3fc`):** `.gitattributes` `* text=auto eol=lf`. El working tree se normalizó sin cambios de contenido versionado.
- **Validación:**
  - Estáticas: `test:unit` 150/150, `test:email` 4/4, `typecheck` 0 errores, `build` PASS y `git diff --check` PASS.
  - E2E PASS: `diagnostic`, `learn`, `authz` 143/143, `team-ui` 91/91, `acct`, `bpx` y `admin-business-profiles`.
  - E2E que fallan como en la base: `px-a` y `pe-b` (deuda conocida). `invite-flow` es intermitente en ambos lados (`TEST-INVITE-FLAKY-001`).
- **Sin** cambios de routing, scoring, resultados visibles, PDF, D1, KV, endpoints ni versión. `LEARN-META-001` sigue en producción hasta un deploy autorizado.

## 2026-09-26 — DIAG-V3-00 Auditoría del Diagnóstico y micro-checkpoint de terminología (solo local, sin deploy)

Abre el bloque **DIAG-V3 (Diagnostic Engine V3)**, autorizado por el usuario fase a fase. El prefijo `DIAG-V3-XX` evita reutilizar `DIAG-001/002/003`, que ya pertenecen al historial.

- **DIAG-V3-00 (auditoría de solo lectura, aprobada):** baseline sobre `bb8ba3b` en verde (`test:unit` 135/135, 84 del Diagnóstico; `test:email` 4/4; `typecheck`; `build`; E2E `diagnostic` en 4 viewports). Se trazó el flujo real (entrada por deep link → 26 preguntas filtradas por `applies` → scoring por 7 dimensiones → estado, prioridades y recomendación → sin almacenamiento) y se comparó con el plan V3. Conclusión aceptada: V3 evoluciona el motor existente, no lo reemplaza. Hallazgos registrados en `STATUS.md` (`DIAG-V3-BUG-01`, `-DEBT-01`, `-DEBT-02`, `-UX-01`, `-PDF-01` y `-PRIVACY-01`); el PDF actual mide 4–5 páginas.
- **Terminología (`c60979f`):** la etiqueta visible del perfil `creator` pasa de «Mi marca o trabajo como creador» (Diagnóstico) y «Creador» (puerta de Home) a «Artista o creador de contenido», conservando el ID `creator`. En `/nosotros`, «Gerente Comercial» pasa a «Director Comercial». Solo cambió el E2E que dependía de esas etiquetas. «Cuentas → Clientes» no se aplicó: todas las apariciones actuales de «cuenta» son de autenticación o internas (`billing_account`); la regla queda en `ROADMAP.md`.
- **Documentación:** `ROADMAP.md` registra DIAG-V3 con sus fases, el gate PRIVACY + DATA CONTRACT antes de DIAG-V3-06 y las restricciones de KV. Se corrigen dos desviaciones verificadas: `AGENTS.md` decía 13 documentos canónicos y hay 15 versionados; `TESTING.md` y `TEST-GAPS-001` decían 75 pruebas del Diagnóstico y son 84.
- **Sin cambios de** routing, scoring, resultado, PDF, esquema, migraciones, bindings ni versión (`package.json` sigue en `0.5.6`, que es la versión en producción; la versión sube con el próximo release autorizado).

## 2026-09-26 — DIAG-003 Puntaje global y exportación a PDF (`0.5.6`, LIVE)

Corrige el nombre de un plan externo pegado por el usuario («DIAG-002») al identificador real disponible: DIAG-002/DIAG-002B/DIAG-002C ya estaban cerrados y LIVE, así que este bloque se abrió como `DIAG-003`, aditivo sobre el motor existente (`app/features/diagnostic`) y sin reabrir ninguna decisión ya cerrada de DIAG-002B.

- **`overallScore` (0-100):** `computeOverallScore()` en `scoring.ts` pondera el `score` de cada dimensión evaluada por su propio `evidence`, la misma metodología que ya usa `scoreDimensions()` un nivel abajo — no un promedio simple. Una dimensión débil con poca evidencia no domina el puntaje global (verificado con una persona base de 7/7 dimensiones en 100 y solo `confianza` debilitada a 33: `overallScore` queda en 91, «buen estado», mientras `confianza` sola sería «prioridad»).
- **Clasificación visual de 3 niveles, aditiva:** `visualStatusFor(score)` devuelve `priority` (<50) / `developing` (50-74) / `healthy` (≥75) para colorear cualquier porcentaje (global, por dimensión, por prioridad). Es un sistema **nuevo y separado** del de 4 niveles de madurez ya existente (`levelFor`/`DimensionLevel`, `inicial`/`parcial`/`solida`/`consolidada`): no lo sustituye ni cambia su lógica, solo aporta color/icono a la UI.
- **Porcentaje visible (cierra una brecha de accesibilidad real):** DIAG-002B había decidido deliberadamente no mostrar números en las dimensiones («niveles sin números visibles»); en la práctica esto dejaba el porcentaje real solo insinuado por el ancho de una barra, invisible para cualquiera que no pueda comparar anchos con precisión. Este bloque lo revierte: cada dimensión y cada prioridad muestra su porcentaje como texto (`<strong>NN%</strong>`) con `aria-label` equivalente, además del icono de estado.
- **Prioridades reutilizadas, no recalculadas:** el plan pegado por el usuario proponía «las 3 dimensiones con menor puntuación» como prioridades; el motor ya calcula `result.priorities` de forma más sofisticada (gravedad × clase × relevancia del objetivo × confianza, con dependencias, tope de 3) desde DIAG-002B. Se mantuvo ese cálculo intacto y solo se le agregó una insignia de estado (icono + porcentaje) mostrando la dimensión afectada por cada prioridad.
- **Puntaje global destacado:** un bloque «Tu diagnóstico: NN%» cerca del inicio del resultado, con icono de estado.
- **Exportación a PDF sin dependencias nuevas:** un botón «Descargar mi diagnóstico (PDF)» llama a `window.print()` sobre un bloque `@media print` dedicado (oculta cabecera/pie/stepper/CTAs, agrega una cabecera de impresión con marca y fecha, evita cortes de página dentro de tarjetas y fuerza el color de fondo de badges/barras). Decisión explícita: ninguna librería de generación de PDF, coherente con el minimalismo ya establecido del proyecto (sin gestor de estado, sin kit de UI).
- **Iconos reales, no dibujados a mano:** el usuario corrigió el enfoque a mitad de bloque («usa los iconos de Diagnóstico Assets con el MCP») tras ver un primer intento con 3 SVG dibujados a mano; se extrajeron 3 iconos reales (rostros 3D rojo/amarillo/verde) del sprite `Disnostico Assest.png` que el usuario proveyó, vía el MCP `motonexo-assets` (`extract_assets` directo sobre el original, sin `repair_transparency` — los píxeles de borde ya eran transparentes; un primer intento con `repair_transparency` a radio 10 sí destruyó detalles faciales y se descartó), normalizados a canvas cuadrado y convertidos a WebP (192×192, ~5.5-5.9 KB cada uno). Los 3 SVG dibujados a mano se eliminaron una vez wireados los WebP reales.
- **Limpieza de assets (a pedido explícito del usuario):** verificadas cero referencias a los SVG eliminados antes de borrarlos; borrados los archivos intermedios de la extracción (`diagnostico-status-repaired.png`, `diagnostico-status-extracted/`, `diagnostico-status-extracted-v2/`, `diagnostico-status-final/`) fuera del árbol del producto, en la carpeta de staging del usuario. Auditoría de `public-assets.ts` encontró 13 claves preexistentes sin ningún uso en código, ajenas a este bloque (fondos, ilustraciones, diagramas de Aprende); no se tocaron por disciplina de alcance — quedan registradas como `ASSET-UNUSED-001` en `STATUS.md`.
- **Defecto real encontrado y corregido dentro del mismo bloque, tras el primer deploy:** el usuario reportó por captura que «Tus dimensiones» se veía roto. Reproducido con Playwright en 600-1366px: el icono de estado y el porcentaje de cada dimensión se apilaban verticalmente y se pintaban fuera de su fila, superpuestos con la siguiente — un defecto de pintado (overflow visual, no de layout) que el chequeo de overflow existente (compara solo el borde derecho contra el viewport) no detecta. Causa: un selector preexistente `.diagnostic-dimensions dd span` (pensado solo para la barra de progreso) tiene más especificidad CSS que la nueva clase `.diagnostic-dimensions__value` y le forzaba `display:block; height:0.55rem`, apilando el icono (bloque) sobre el porcentaje (bloque) en vez de dejarlos en línea. Corregido acotando el selector a `dd span.diagnostic-dimensions__bar`. Se añadió una regresión E2E dedicada (confirmada en RED contra el defecto reintroducido a propósito y GREEN tras el fix) antes de redesplegar.
- **TDD:** `computeOverallScore`/`visualStatusFor` con 9 pruebas nuevas (`scoring.test.ts`, RED con el export faltante → GREEN); `diagnostic-experience-check.mjs` con la aserción heredada de DIAG-002 «sin números de puntuación» reemplazada (quedó en RED contra el nuevo porcentaje visible, por diseño) y nuevas aserciones de puntaje global, porcentaje por dimensión/prioridad, iconos y botón de PDF.
- **Pruebas:** `test:unit` pasa de 126 a **135** (84 del motor del Diagnóstico). `diagnostic-experience-check.mjs` PASS en 1366/768/390/360.
- **Validación:** `typecheck`, `build` y `git diff --check` PASS. Sin migraciones (este bloque no toca D1).
- **Reestructuración del resultado, a pedido del usuario tras el 2.º deploy:** la sección «Encaje con Vecidya» (licencia/servicios/addons/Aprende) se movió a después de la fila de botones de acción («Revisar con Vecidya», «Ir a Contacto», «Descargar PDF», «Rehacer»), como lo último del resultado. El título del resultado dejó de usar el tamaño tipo-portada compartido con las preguntas del recorrido y bajó a `clamp(1.6rem,2.6vw,2.35rem)`; los párrafos del resultado pasaron de `max-width:44rem` a `58rem` (menos líneas envueltas, mejor uso del ancho de la tarjeta); el espaciado entre secciones bajó de `1.2rem` a `1rem`; y `@media print` recibió su propio ajuste (gap, título y márgenes más chicos) para un PDF más denso. Verificado con Playwright en pantalla (1366/390) y en vista de impresión antes de desplegar.
- **Deploy** (autorizado explícitamente por el usuario: «y despliega cuando termines», luego «y desplie cuando corrijas» tras el defecto, luego la reestructuración): tres cortes bajo `0.5.6` — el primero (Version ID `1ce335f5-b7dd-422a-80a4-9ac9a6a9ff33`) publicó la funcionalidad completa pero con el defecto visual descrito arriba, encontrado por el usuario después del deploy; el segundo (`f6c3c25e-16fe-4fa4-8b15-ad00fe352bc0`) publica la corrección; el tercero (Version ID **`582a5c38-d1d4-4f3c-8ba5-e9424717fcb3`**) publica la reestructuración del resultado. HTTP anónimo antes/después de cada corte en `ENVIRONMENTS.md`. Resultado final: **`0.5.6 PRODUCTION PASS`**.
- **Deliberadamente fuera de alcance:** auditoría axe automatizada (`DIAG-002-A11Y-AXE` sigue abierta); persistencia con consentimiento; limpieza de los 13 assets preexistentes sin uso ajenos a este bloque.

## 2026-09-25 — LICENSE-STRATEGY-001 Multi-Business Licensing & Pricing Foundation (solo local, sin deploy)

Cierra la foundation del modelo de licencias multi-negocio: separa quién paga (`billing_account`) de la membresía de Better Auth, versiona el precio de cada plan (grandfathering real), configura el descuento por portafolio como datos en vez de `if`s, y prepara —sin implementar el cálculo— un motor de promociones. Sin checkout, sin proveedor de cobro, sin UI de Admin nueva y sin deploy, todo por instrucción explícita del bloque.

- **Principio:** 1 organización = 1 negocio = 1 licencia. La cantidad de organizaciones de una persona nunca depende del plan de ninguna de ellas.
- **`billing_account` ≠ `member`:** pertenecer a una organización (incluida una invitación aceptada) nunca hace que su licencia cuente para el portafolio de otra persona. En V1, una persona controla como máximo un `billing_account` (único `owner_user_id`).
- **6 tablas nuevas** (`db/schema/licensing.ts`, migración `0010`, 23 tablas totales): `billing_account`, `license_price` (versión de precio con `effective_from`/`effective_to`, 3 filas sembradas: Cuadra `USD 39/mes`, Barrio `USD 59/mes`, Ciudad `USD 89/mes`, las mismas que publica `/licencias`), `organization_license` (conserva su `price_id` contratado), `portfolio_pricing_tier` (4 filas sembradas: 1→0%, 2→10%, 3-4→15%, 5+→20%, la escalera aprobada por el usuario), `promotion` y `billing_account_promotion`. Todo en centavos enteros y basis points; ningún `float`.
- **Calculador puro** (`db/pricing/calculator.ts`, sin acceso a base de datos, determinístico): 21 pruebas unitarias, incluidos los montos exactos del usuario (1 Cuadra $39.00, 2 Cuadra $70.20, 3 Cuadra $99.45, 5 Cuadra $156.00, Cuadra+Barrio $88.20, Cuadra+Barrio+Ciudad $158.95), líneas no activas excluidas, y las reglas de promoción: expirada o aún no vigente no se aplica, un mínimo de organizaciones no cumplido no se aplica, una promoción no apilable nunca se combina con otra —ni con una apilable—, y dos apilables sí se suman. `free_license` queda representable en el schema desde V1 pero su cálculo no está implementado, tal como autorizaba el encargo.
- **Grandfathering real:** una licencia ya contratada resuelve su precio por el `price_id` que guarda, nunca por `plan_code` + fecha actual. Publicar un precio nuevo no cambia lo que ya paga quien contrató antes.
- **Cambio de plan sin mutar en el sitio:** `changeOrganizationLicensePlan` cancela la fila vigente (conserva historial) y crea una nueva; nunca toca otras organizaciones del mismo `billing_account`.
- **Solo `platform_admin`:** `/api/platform/organizations/:id/license` (mismo patrón que `/services` e `/integrations`) asigna, cambia de plan, suspende/reactiva y transfiere de `billing_account`, auditado en `platform_audit_log`. Crear una organización no activa una licencia pagada por sí sola.
- **Hallazgo de build:** una ruta de React Router no puede importar directamente un módulo `db/` sin sufijo `.server`, aunque sea puro y sin efectos secundarios (el análisis de fronteras servidor/cliente lo rechaza igual). Se resolvió envolviendo el calculador en la capa `.server`. Detalle en `TESTING.md`.
- **Hallazgo de limpieza de fixtures:** `billing_account.owner_user_id` y `platform_audit_log.organization_id`/`actor_user_id` no cascadan desde `user`/`organization` (a propósito: conservan historial de facturación y auditoría). El orden correcto de borrado es auditoría → organización → billing_account → usuario.
- **Pruebas:** `tests/unit/licensing/calculator.test.ts` (21) y `tests/e2e/platform-licensing-check.mjs` (`platform-licensing`, 27, en `test:e2e`). `test:unit` pasa de 105 a 126. Regresión (`authz`, `psa`, `admin-shell`, `admin-orgs`, `acct`) PASS sin cambios.
- **Validación:** `typecheck`, `build` y `git diff --check` PASS. Migración `0010` aplicada y verificada **solo en D1 local**; no se tocó D1 remota.
- **Deliberadamente fuera de alcance:** UI de Admin (ver `LICENSE-ADMIN-UI-001`), checkout, proveedor de cobro, entitlement enforcement (todavía no se bloquea ninguna capacidad por plan) y aplicar `0010` a remoto.
- **Deuda:** `LICENSE-STRATEGY-001` CERRADA. Nuevas: `LICENSE-ADMIN-UI-001`, `LICENSE-REMOTE-MIGRATION-001`. `AUTH-ABUSE-001` se actualiza: el modelo de «plan activo» ya existe, pero `organization/create` todavía no hace cumplir ningún límite.
- **Siguiente bloque propuesto por el usuario:** `ACCOUNT-001 — Registration & Multi-Business Portfolio`. No autorizado; no se inicia automáticamente.

## 2026-09-25 — Precio público de licencias en USD (`0.5.5`, LIVE)

A pedido explícito del usuario, que confirmó moneda, periodicidad y que es precio real listo para publicar (no un borrador): `/licencias` deja de decir «Aún no hay precios públicos» y muestra el precio mensual de cada licencia.

- **Montos:** Cuadra `USD 39/mes`, Barrio `USD 59/mes`, Ciudad `USD 89/mes`. Son los mismos que ya existían como referencia comercial en `docs/business/VECIDYA_PRODUCT_CATALOG.md` desde UX-002.1 (`$39`/`$59`/`$89`, sin moneda confirmada); ese documento se actualiza para reflejar que ahora son precio público, no borrador.
- **Qué no cambia:** sigue sin existir contratación en línea, checkout ni cobro automático. La nota bajo el título lo aclara y el CTA de cada tarjeta sigue siendo «Consultar disponibilidad» hacia `/contacto`. Addons y servicios siguen sin precio público (`docs/business/VECIDYA_PRODUCT_CATALOG.md` los deja «por definir»); este cambio es solo de licencias.
- **TDD:** `licenses-experience-check.mjs` y `commercial-experience-review-check.mjs` se editaron primero para exigir el precio público y quedaron en RED contra el código anterior (que todavía afirmaba la ausencia de precios). Al mostrar el precio como interpolación de texto simple con `strong`/`span`, el HTML separaba «USD 39» de «/mes» con la etiqueta intermedia y el primer intento de implementación seguía en RED; se resolvió componiendo el texto como una sola cadena (`` `USD ${precio}/mes` ``) antes de interpolarlo, evitando el mismo problema de nodos de texto partidos por comentarios de hidratación ya visto en INVITE-UI-001. GREEN después.
- **Deploy:** autorizado explícitamente por el usuario. Commit `87ca30b`, Version ID **`cebd0a92-3560-4298-8a3b-5df0c6209477`** (2026-09-25T23:20:06Z), sin migraciones. HTTP anónimo antes/después: pie `0.5.4` → `0.5.5`; `/licencias` sin precios → con los tres precios y sin el texto «Aún no hay precios públicos». Resultado: **`0.5.5 PRODUCTION PASS`**. Detalle completo en `ENVIRONMENTS.md`.

## 2026-09-25 — INVITE-UI-001 Team & Invitation UX (`0.5.4`, LIVE)

Pule `/app/organization` sin tocar la lógica de INVITE-001 ni la matriz de AUTHZ-BA-001. Las acciones del servidor conservan las mismas guardas y llamadas a Better Auth; solo cambian la presentación, el feedback y el texto de éxito al crear.

- **Formulario «Invitar miembro»:** reutiliza `.form-grid`, `.field-note` y `Button` («Enviar invitación»). Lleva «Correo electrónico» y «Rol» (Administrador o Miembro, con Miembro por defecto) y el texto de apoyo «La persona recibirá un correo con un enlace para unirse a tu organización.». `.invite-form` no tenía ninguna regla CSS: por eso se veía roto.
- **Ayuda de roles derivada de la matriz real:** el loader pasa `getPermissionsForRole(...)` y `app/lib/team-labels.ts` lo redacta. Administrador: «Puede editar y publicar el perfil del negocio y gestionar el equipo: invitar personas, cambiar roles y retirar miembros.» Miembro: «Puede ver el perfil del negocio y quién forma parte del equipo, sin hacer cambios.»
- **Roles y estados en español:** Propietario, Administrador y Miembro; Pendiente, Aceptada, Cancelada, Expirada y Rechazada. Los valores internos no cambian.
- **Pendientes e historial separados:**
  - Pendientes vigentes: correo, rol, «Enviada el … · vence el …», estado y «Cancelar invitación», con nombre accesible que incluye el correo.
  - Historial (aceptadas, canceladas y expiradas) debajo, sin acciones.
  - Estados vacíos «Todavía no tienes invitaciones pendientes.» y «Aún no hay invitaciones anteriores.».
- **Feedback junto a la tarjeta de la acción** (`role="status"` para éxito, `Alert` con `role="alert"` para error): «Invitación cancelada.», «Rol actualizado.» y los errores. Al crear dice «Invitación creada para …» y ya no «enviada», porque Better Auth no informa si el correo falló (`INVITE-DELIVERY-SILENT-001`). El formulario se vacía tras crear.
- **Texto obsoleto retirado:** «No se simula la entrega: el proveedor de correo está pendiente.» y «Las invitaciones requieren correo transaccional real.».
- **Miembros:** nombre, correo, «Tu cuenta» y rol en español. Los controles de rol y retirada solo aparecen a quien tiene el permiso, y nunca en filas de propietario (Better Auth protege al owner). «Propietario» solo se ofrece si quien mira es propietario. El servidor sigue decidiendo: ocultar no es la guarda.
- **Responsive y jerarquía:** los títulos de tarjeta y de sección tenían el tamaño del texto normal por el reset de Tailwind; ahora `1.4rem` y `800`. En móvil (≤900 px) la identidad va a lo ancho y los badges y controles en línea; la regla nueva usa `.members-list > .member-row` para no depender del orden de la cascada. La cabecera de la tarjeta se envuelve.
- **Pruebas:**
  - `tests/e2e/organization-team-ui-check.mjs` (`team-ui`, en `test:e2e`): 91 comprobaciones en 1366/768/390/360, feedback, vistas de admin y de member y organización vacía.
  - `tests/unit/invitations/team-labels.test.ts` (5).
  - El RED de `team-ui` quedó en 14/16 tras corregir el arnés: Playwright exige declarar `secure` en la cookie `__Secure-` de Better Auth.
  - En el GREEN, 81/91 al principio, por dos motivos: el nombre accesible del selector envuelto en su etiqueta incluía la opción elegida («Rol Miembro»), resuelto con `aria-label="Rol"`; y la lectura del historial justo tras cancelar era una carrera de renderizado, resuelta con una espera explícita. Luego 91/91.
- **Deploy** (autorizado explícitamente por el usuario, mismo criterio que REL-005B): commits `a7a4961` y `0b0797e`, Version ID **`cce6aa0b-7988-4525-81c1-f44a5ef3accd`** (2026-09-25T18:15:33Z), sin migraciones. HTTP anónimo: pie `0.5.4`; CSS de `/login` con `invitation-section`/`role-guide` (misma huella que el bundle local); invitación sin sesión `200` con «Crear cuenta»; allowlist de AUTHZ intacta; WhatsApp sin grupo. Detalle en `ENVIRONMENTS.md`. Resultado: **`0.5.4 PRODUCTION PASS`**.
- **Checks manuales pendientes del usuario** (login y cambio de organización; invitación real con correo controlado): **NOT PERFORMED**, sin cuenta ni buzón controlados; no bloquean el cierre, según indicó el usuario.

## 2026-09-25 — INVITE-001 Functional Invitation & Onboarding Flow (`0.5.3`)

Cierra el flujo funcional de invitaciones sin rediseño visual (`INVITE-UI-001` sigue abierta) y sin tocar la matriz de AUTHZ-BA-001.

- **Reproducción previa (RAN, Better Auth 1.7.5):**
  - Sin sesión, `302 /login` y la invitación se perdía.
  - Con cuenta equivocada, sin verificar, cancelada, expirada, ya aceptada o inexistente, la página daba `500` «Error inesperado».
  - Better Auth responde el mismo `400 INVITATION_NOT_FOUND` a cancelada, expirada, aceptada e inexistente.
  - El registro navegaba fijo a `/app` sin enviar verificación, y recargar tras aceptar daba `500`.
- **Flujo nuevo:**
  - `/app/invitations/:id` resuelve el estado con reglas puras (`db/invitation-rules.ts`) leyendo la invitación en D1. Aceptar sigue siendo exclusivo de Better Auth.
  - Sin sesión: «Crear cuenta» e «Iniciar sesión» con `redirectTo`, restringido a rutas `/app` (`app/lib/safe-redirect.ts`).
  - Registro desde una invitación: envía el enlace de verificación con retorno a la invitación e informa si el envío funcionó. La página permite reenviarlo; si el correo no está configurado responde `503` con un mensaje honesto.
  - Aceptar lleva a `/app` con la organización invitada activa. La membresía toma el rol invitado, nunca owner.
  - Ya aceptada: «Ya formas parte de…» y un botón que activa la organización.
- **Errores controlados:** cuenta equivocada `403`, con el correo enmascarado y sin organización ni estado; inexistente `404`; cancelada, rechazada o expirada `410`, con «Esta invitación fue cancelada.» y «Esta invitación ha expirado.». Solo un fallo inesperado del servidor llega al mensaje genérico.
- **Cancelación:**
  - Solo cuentan como pendientes, y solo se pueden cancelar, las invitaciones pendientes y vigentes. El resto aparece en un historial con su estado.
  - Cancelar algo que ya no está pendiente devuelve `409` por API y un error controlado en la página; Better Auth, por su cuenta, lo volvería a marcar como cancelado. No se borra ninguna invitación.
  - Invitar a un correo que ya tiene invitación pendiente, o que ya es miembro, se explica con precisión en vez de culpar al correo.
- **Pruebas:**
  - `tests/e2e/organization-invitation-flow-check.mjs` (`invite-flow`, en `test:e2e`): RED 20/23 y GREEN 28/28. Recorre en navegador el usuario nuevo y el usuario existente.
  - `tests/unit/invitations/invitation-rules.test.ts` (13). `test:unit` pasa de 87 a 100.
- **Límite honesto:** en local el proveedor `fake` descarta el correo y el token lo firma el secreto, así que el clic de verificación se simuló con `email_verified = 1`. La entrega real de la verificación no se ejecutó.
- **Deploy** («desplegar al pasar todo», respuesta directa del usuario): commit `aee3081`, Version ID **`8dfe3c1d-208e-4aaa-bd91-62409b18e252`**, sin migraciones. HTTP anónimo: pie `0.5.3`; invitación sin sesión de `302` a `200` con «Crear cuenta»; allowlist intacta. Detalle en `ENVIRONMENTS.md`.
- **Deuda:** `INVITE-001` CERRADA. `INVITE-UI-001` parcialmente resuelta. Nueva `INVITE-DELIVERY-SILENT-001`: Better Auth se traga los fallos de Gmail al invitar. Reenviar, rechazar y eliminar quedan como capacidades futuras. La regla de propiedad por plan del usuario se incorpora a `AUTH-ABUSE-001`.

## 2026-09-25 — WhatsApp público: sin grupo comunitario, con canal oficial (`0.5.3`, LIVE)

A pedido del usuario:

- **Grupo retirado:** el grupo comunitario de WhatsApp (`chat.whatsapp.com`) desapareció de todas las páginas públicas.
- **Canal añadido:** el usuario creó el canal oficial `https://whatsapp.com/channel/0029VbEBsKH2phHMnAgPOT1f`, que ocupa su lugar:
  - columna «Síguenos → Canal de WhatsApp» en el pie de todas las páginas públicas;
  - sección «Canal de WhatsApp» en `/contacto`, que aclara que es un canal de difusión y que para escribir están el WhatsApp directo y el correo;
  - `sameAs` del JSON-LD `Organization` de la Home.
- **Sin cambios:** el contacto directo (`wa.me`), con «WhatsApp Vecidya» en el pie y «WhatsApp directo» en `/contacto`.
- **Prueba:** `join-contact` exige ahora ningún enlace al grupo, el canal en el pie y en `/contacto` con `target="_blank"` y `rel="noreferrer"`, y el canal en `sameAs`. Quedó RED en cada paso antes de implementarlo y GREEN después, en 1366/768/390/360. Capturas revisadas a 1366 y 390.

## 2026-09-25 — AUTHZ-BA-001 Better Auth Authorization Boundary (`0.5.2`, LIVE)

Cierra la frontera sesión → organización activa → membresía → rol → recurso antes de invitaciones completas y R2. Sin invitaciones nuevas (`INVITE-001`), sin R2, sin schema ni migraciones.

- **Causa raíz (RAN, TDD):** el plugin Organization de Better Auth exponía por HTTP sus 22 endpoints y solo aplicaba su RBAC por defecto. La prueba nueva `authz` falló en rojo 22/143 contra `0.5.1`:
  - un `member` leía las invitaciones de su organización por `list-invitations` y `get-full-organization`, cuando la matriz propia lo reserva a owner/admin;
  - un `owner` renombraba y **borraba** la organización. La cascada borra perfil, horarios, servicios e integraciones asignados por la plataforma;
  - `leave`, `invite-member` (creaba la invitación aunque el correo no estuviera configurado), `cancel-invitation`, `update-member-role` y `remove-member` funcionaban sin pasar por las rutas propias;
  - cancelar una invitación no comprobaba que fuera de la organización de la ruta: un owner de A y C cancelaba invitaciones de C desde la ruta de A. No había escalada, porque Better Auth exige permiso en la organización de la invitación;
  - en `/app/organization`, un ID de miembro de otra organización lo rechazaba Better Auth, pero la página respondía 200 con un error genérico.
- **Corrección:**
  - Allowlist HTTP de denegación por defecto (`server/auth/organization-http-surface.ts`), aplicada con un hook `before` de Better Auth sobre la ruta ya resuelta. Por HTTP solo responden `create`, `list`, `set-active` y `accept-invitation`; los otros 18 devuelven 404. Las llamadas `auth.api.*` de las rutas propias no se ven afectadas.
  - `disableOrganizationDeletion`: no existe flujo de borrado.
  - Guardas comunes de recurso `requireOrganizationMemberTarget` y `requireOrganizationInvitationTarget`, usadas por la API y la página. Un ID inexistente y uno ajeno dan el mismo 403.
- **Verificado sin cambios:** `activeOrganizationId` no concede acceso. Stale, ajena inyectada o inexistente → 403. `set-active` ajeno → 403. `/update-session` no puede fijarla (400). `create` ignora un `userId` ajeno. La aceptación está ligada al correo verificado del destinatario.
- **Pruebas:** `tests/e2e/organization-authorization-check.mjs` (`authz`, 143 comprobaciones, en `test:e2e`, limpia sus fixtures) y `tests/unit/auth/organization-http-surface.test.ts` (6, fija la allowlist contra el plugin instalado). `test:unit` pasa de 81 a 87.
- **Validación:** `typecheck`, `build` y `git diff --check` PASS. `authz` GREEN 143/143. `test:unit` 87/87. E2E de regresión 14 PASS e `invitations` PASS PARCIAL. `members` cae por `TEST-D1-RESET-001`; con un calentamiento de red en una copia no versionada, PASS. `pe-b` falla por `TEST-UX003-PEB`. Detalle en `TESTING.md`.
- **Deploy autorizado explícitamente por el usuario durante el bloque:** commit `e9e413a`, Version ID **`1c99089b-f095-499d-9958-bad360693a33`** (2026-09-25T14:56Z), `DB=vecidya-prod`. Sin migraciones ni cambios de secrets; staging no tocado. HTTP anónimo antes/después en `ENVIRONMENTS.md`: pie `0.5.2`, 12 rutas públicas `200`, privadas `302`, `www` `301`, `list` `401`, y `list-invitations`, `get-full-organization`, `list-members` y `get-invitation` pasan de `401` a `404`.
- **Deuda:** `AUTHZ-BA-001` CERRADA. Nuevas: `AUTH-ABUSE-001` (creación ilimitada de organizaciones y rate limiting en memoria, separadas de la frontera tenant) y `TEST-LOCALHOST-001` (`ETIMEDOUT` del arnés por IPv6).

## 2026-09-24 — REL-005B Production Release `0.5.1` (LIVE)

Publicación autorizada explícitamente por el usuario de la candidata `0.5.1` validada (commit `55f9700`), sin features, refactors, migraciones ni limpieza de deuda.

- **Gate previo:** `main` sincronizado 0/0 y árbol limpio. `typecheck`, `build` y `git diff --check` PASS. E2E críticos PASS: `slug-life`, `services-exp`, `pg-c1`, `bpx` y `commercial-review`. Migraciones: NINGUNA (sin cambios en `db/schema`, `db/migrations` ni `wrangler.jsonc` desde `0.4.1`). `wrangler deploy --dry-run` confirmó `DB=vecidya-prod` y `APP_ENV=production`.
- **Deploy:** `pnpm wrangler deploy`, Version ID **`195b737c-d838-4c64-96a2-a6fd195ee018`** (2026-09-24T23:52Z), triggers `vecidya.com/*` y `www.vecidya.com/*`. El primer intento abortó sin subir nada porque la sesión de Wrangler ve dos cuentas. La cuenta correcta se confirmó con `wrangler deployments list` (solo lectura) y se pasó con `CLOUDFLARE_ACCOUNT_ID` solo para ese comando. Staging, secrets y datos productivos no se tocaron.
- **Verificación en producción:**
  - HTTP anónimo: 15 rutas `200`, `/app` y `/app/internal` → `302` a login, `www` → `301`, pie «Versión pública 0.5.1».
  - `/vecindario/vecidya`: canonical y `og:url` intactos.
  - Assets de VIS-002B `200` con el mismo tamaño que en local, y favicon 3D.
  - Visual con la sesión que inició el propio usuario, en solo lectura: App, Servicios (empty-state real), Perfil (slug `vecidya` intacto) y Admin (marca 3D, «Versión Admin 0.5.1», empty-state con filtro client-side, sin peticiones de red).
  - Detalle en `ENVIRONMENTS.md`.
- **Reportado por el usuario tras el deploy, clasificado como anterior a `0.5.1`:** la gestión de invitaciones está mal. El correo sale, pero aceptar da «Error inesperado», el formulario se ve roto, las canceladas no desaparecen y sigue un texto obsoleto sobre el proveedor de correo. Un análisis de solo lectura (código de la app y de Better Auth 1.7.5) lo documenta en `INVITE-001` e `INVITE-UI-001`. No se corrigió: queda fuera de la release y requiere un bloque autorizado.
- Deuda preservada sin tocar: `SETUP-CARD-WRAP-001`, `AUTH-LOCKUP-CONTRAST-001`, `AUTHZ-BA-001`, `INVITE-001` y `TEST-D1-RESET-001`.

## 2026-09-24 — SLUG-005B Stable Public Slug Policy & Release Unblock (`0.5.1` local; release candidate)

Corrige el único bloqueante real de `0.5.1` detectado en QA-005A, sin funcionalidad nueva ni cambio de versión: la candidata nunca llegó a producción y no hay motivo para abrir `0.5.2`.

- **Política autorizada por el usuario, `SLUG-EDIT-001` RESUELTA:**
  - Mientras el perfil nunca se ha guardado con éxito, el nombre visible sugiere el slug. Se mantienen el override manual y la reanudación al vaciarlo.
  - Tras el primer guardado exitoso, sea borrador o publicado, el slug queda estable: cambiar nombre, descripción, categoría, contacto u horarios no lo toca.
  - La condición es `suggestsSlug = !profile` y se deriva del perfil persistido que devuelven loader y action. La protección se activa en la misma sesión, sin recargar, y un guardado rechazado (por ejemplo, una colisión) sigue sugiriendo.
  - Sin redirecciones, historial de slugs, schema ni migraciones. El cambio explícito de slug con redirección queda como trabajo futuro no autorizado en `ROADMAP.md`.
- **Longitud, `SLUG-LEN-001` RESUELTA:**
  - `slugifyBusinessName` pasa de la ruta a `db/business-profile-rules.ts`. Recorta a `businessProfileSlugMaxLength` (80) y quita el guion final.
  - La constante es ahora la única fuente del límite: la usan el generador, el `maxLength` del input y `parseBusinessProfileForm` (antes era un `80` repetido en dos sitios).
  - Los slugs escritos a mano no se recortan.
- **El servidor sigue siendo la autoridad:** formato, longitud y unicidad global sin cambios. Una colisión se rechaza con 400 «El slug ya está en uso…» y no se añade sufijo automático.
- **Pruebas nuevas, en TDD (RED y luego GREEN):**
  - `tests/unit/business-profile/slug.test.ts`, con 6 pruebas: normalización, tildes, símbolos, vacío, recorte y aceptación por la validación real del servidor. `test:unit` pasa de 75 a 81.
  - `tests/e2e/business-profile-slug-lifecycle-check.mjs`, incluido en `test:e2e`: perfil nuevo, borrador y publicado estables sin recargar y tras recargar, URL pública original 200 con el nombre nuevo y canónica intacta, sin ruta nueva, colisión y longitud. Limpia sus fixtures y espera la hidratación de React, porque en un Worker en frío falló una vez al rellenar antes de hidratar.
- **Deuda de pruebas nueva, `TEST-D1-RESET-001` (M):** tras una escritura externa en la D1 local con `wrangler d1 execute --local`, la primera petición al Worker de desarrollo recibe `ECONNRESET`. Los scripts sin reintento de red (`members` y `px-b`) caen antes de sus aserciones. No es de producto: `members` pasa con un reintento. No se corrigió aquí.
- **Validación:** `typecheck`, `build` y `git diff --check` PASS; `test:unit` 81/81. E2E: 22 PASS, `invitations` PASS PARCIAL, y fallos solo en deuda conocida y ajena (`px-a`, `pe-b`, `px-b`) y en `members` (`TEST-D1-RESET-001`). Detalle en `TESTING.md`.
- **Git:** antes del fix se publicó `a4485dd` (QA-005A) en `origin/main`, con autorización explícita.

`SETUP-CARD-WRAP-001`, `AUTH-LOCKUP-CONTRAST-001`, `AUTHZ-BA-001` e `INVITE-001` quedan sin tocar. Sin deploy, sin `--remote` y sin migraciones. Producción sigue en `0.4.1`: la última evidencia HTTP es del 2026-09-23.

## 2026-09-24 — QA-005A v0.5.1 Release Readiness & Test Signal Cleanup (`0.5.1` local; RELEASE BLOCKED)

Bloque de QA sin funcionalidad nueva ni cambio de versión (`0.5.1`), con el objetivo de decidir si `0.5.1` es candidata limpia a release. Resultado: **no lo es todavía**. Un defecto real del slug automático, `SLUG-EDIT-001`, bloquea la release.

- **`SERVICES-EXP-TAGLINE-001` RESUELTA, solo en el test:**
  - Causa confirmada: `services-experience-check.mjs` escaneaba el HTML completo, y la tagline del sidebar de `ClientAreaShell` («Presencia digital para negocios locales», UX-003.9) contiene el nombre del servicio «Presencia digital». En el HTML de B había 1 coincidencia, en el sidebar, y 0 de «CRM»: no había fuga. El escaneo total también dejaba sin efecto la aserción positiva de A.
  - Las aserciones de tenant pasan a leer solo las tarjetas `.service-card` de la lista `aria-label="Servicios de la organización"` dentro del `<main>` de la ruta, con el `<h1>` de la organización activa y el conjunto exacto nombre/estado por organización.
  - Producto sin cambios. `services-exp` 2/2 PASS. La lógica se verificó offline inyectando tarjetas de A en el HTML real de B: FAIL como corresponde, 5/5 escenarios.
  - No se pudo demostrar la detección con una mutación viva del loader: el clasificador de permisos la bloqueó y se revirtió sin ejecutarse.
- **Slug automático (`bc93a31`) validado:**
  - Correcto en normalización (tildes, `ñ`, mayúsculas, espacios, símbolos), entrada inutilizable (slug vacío; el `required` nativo bloquea), override manual y reanudación al vaciarlo, y edición tras recarga (el slug publicado no cambia).
  - Colisión: la unicidad es global y solo server-side. El servidor devuelve 400 con un mensaje claro y el cliente no añade sufijo automático.
  - **Defecto `SLUG-EDIT-001` (A, bloqueante):** `useRef(Boolean(profile?.slug))` solo se evalúa al montar. Si el perfil se crea o publica en esa misma montura, editar el nombre reescribe el slug y al guardar cambia la URL pública: la anterior pasa a 404, sin redirección. Reproducido 2/2 en Edge.
  - **Defecto `SLUG-LEN-001` (B):** el slug asignado por script no respeta `maxLength`. Un nombre de más de 80 caracteres termina en un rechazo del servidor con mensaje genérico.
  - No se corrigieron: cambiarían comportamiento de producto y la política del slug, que queda para decisión del usuario.
- **Regresión:** E2E 11/11 PASS (`services-exp`, `bpx`, `admin-shell`, `admin-orgs`, `admin-bp`, `admin-int`, `commercial-review`, `c1`, `c2`, `d1`, `pg-c1`); `typecheck`, `build` y `git diff --check` PASS.
- **Responsive, accesibilidad y assets:** smoke 1366/768/390/360 en Login, `/app`, `/app/services`, `/app/business-profile` y Admin. Sin overflow, imágenes cargadas y con `alt` correcto, sin errores de assets y sin originales pesados cargados.
  - `SETUP-CARD-WRAP-001` sin cambios; sigue fuera de alcance.
  - Observación nueva `AUTH-LOCKUP-CONTRAST-001` (B): bajo contraste del lockup 3D sobre el panel oscuro de Auth, con la exención WCAG para logotipos.
  - La ilustración con fondo blanco del Login es opaca por diseño (WebP sin alpha) y ya estaba desde `0.4.1`.
- **Documentación reconciliada:** `STATUS.md`, `TESTING.md` y `ROADMAP.md` (gate de release). En `PROJECT_STATE.md`, la cabecera pasa de `0.5.0` a `0.5.1`, que había quedado desfasada tras VIS-002B, y se anota el slug autogenerado.

`AUTHZ-BA-001` e `INVITE-001` quedan sin tocar. Sin deploy, sin `--remote` y sin migraciones. Producción sigue en `0.4.1`: la última evidencia HTTP es del 2026-09-23.

## 2026-09-24 — VIS-002B CLOSED (`0.5.0` → `0.5.1` local, PATCH)

Cierre formal de VIS-002B. El usuario aceptó el checkpoint final y decidió explícitamente **no abrir Batch 02**: los cinco assets ya integrados (símbolo, wordmark, lockup, y los dos de Batch 01) cubren una necesidad real; generar más ahora sería relleno visual sin justificación de la sección 17 de la propia spec.

- **Versión:** `0.5.0` → `0.5.1` (PATCH — cambio visual visible e integrado, sin capacidad nueva) en `package.json`, única fuente canónica. `platform-footer.tsx` la lee dinámicamente (`packageJson.version`); no hay valores hardcodeados en componentes. No aplica cambio en `pnpm-lock.yaml` (no registra la versión del paquete raíz).
- **Test de cierre corregido:** `commercial-experience-review-check.mjs` aseraba el nombre de archivo exacto del favicon plano anterior; se actualizó al nuevo `vecidya-icon-3d.png` porque prueba directamente un cambio intencional de este trabajo, no deuda histórica ajena.
- **Hallazgo durante la validación final — no es de VIS-002B:** `services-experience-check.mjs` falla de forma reproducible por un falso positivo preexistente de UX-003.9 (`client-area-shell.tsx:70` imprime la tagline «Presencia digital para negocios locales» en el sidebar de toda página `/app`, y el test comprueba ese substring literal creyendo que solo aparecería si hubiera fuga de datos entre organizaciones). Verificado manualmente que no hay fuga real de servicios entre tenants. Registrado como `SERVICES-EXP-TAGLINE-001` en `STATUS.md`; no corregido aquí para no ampliar el alcance de VIS-002B.
- **`vecidya-app-icon.png` (PNG plano original) se conserva deliberadamente**, aunque ya no lo usa ningún componente de `app/`: sigue siendo la fuente de la imagen Open Graph (`og-vecidya-public.svg`) y de dos fixtures de prueba (`px-a`, `px-b`). No es un asset huérfano.
- **Confirmado sin variantes descartadas en `public/`:** `git status --short public/` limpio antes de este commit; los únicos archivos nuevos son los seis derivados finales ya committeados en el checkpoint anterior.
- **Datos QA locales preservados** (`qa-vis002b@developer.serveryogoms.com`, `platform_admin`, organización de prueba): el esquema confirma riesgo real de cascada (`platform_audit_log.organizationId`/`actorUserId` sin `onDelete: cascade`; borrar `user`/`organization` tocaría `session`, `account`, `member`, `invitation`, `platform_member`, `business_profile`, etc.). Por la regla explícita del usuario («si hay duda, no limpiar»), se preservan; no bloquea el cierre.

`RAN` (contra Worker local reiniciado tras una caída del proceso anterior, sin causa fatal visible en su log): `pnpm run typecheck` PASS, `pnpm run build` PASS, `git diff --check` PASS. E2E de cierre — **6/7 PASS**: `admin-shell-check`, `admin-organizations-check`, `admin-business-profiles-check`, `admin-integrations-check`, `business-profile-experience-check`, `commercial-experience-review-check` (confirma la corrección del favicon); **1 FAIL** `services-experience-check` (`SERVICES-EXP-TAGLINE-001`, ver arriba, reproducido 2/2, diagnosticado como falso positivo no relacionado, no reparado). Smoke visual final (Playwright, Worker local) en `/login`, `/app`, `/app/services` y Admin (`overview`, `organizations`) en 1366/768/390/360: sin overflow nuevo, sin clipping, alpha correcto, sin fondos accidentales, sin halos, texto accesible, `alt=""` en todo lo decorativo, sin regresiones. `SETUP-CARD-WRAP-001` permanece `PREEXISTING / OUT OF SCOPE`, no corregido.

No deploy. `0.5.1` es únicamente local/Git tras este cierre.

## 2026-09-24 — VIS-002B Cross-Surface Brand Integration, checkpoint 1 (`0.5.0` local)

Primer checkpoint del loop cerrado de assets (auditar → integrar lo existente → QA en runtime → identificar huecos → pedir batch ≤4 → STOP).

- **Inventario de `../Assets Generados/`:** tres assets 3D aprobados por el usuario — `Icono.png` (símbolo, 1254×1254), `nombre.png` (wordmark, 2172×724) y `Marca.png` (lockup + tagline, 1254×1254), los tres PNG con alpha real confirmado. Se detectó fringing rojo residual (halo de recorte de fondo) en `Icono.png`/`Marca.png`; un intento de corrección automática con la herramienta `repair_transparency` (radios 2 y 15) corrompió la imagen en vez de limpiarla y se descartó sin tocar los originales — el defecto es imperceptible en los tamaños de uso actuales (≤512px) y queda como debt cosmético menor si se usa en un tamaño mayor.
- **Derivado optimizado creado:** `public/assets/selected/brand/brand-symbol-3d.webp` (512×512, alpha real, 99 KB — 86% más liviano que el PNG plano de 691 KB que reemplaza en estos dos usos) vía `resize_asset`, sin degradar el alpha.
- **Integración (solo assets ya aprobados, sin generar nada nuevo):**
  - `auth-shell.tsx`: el icono plano de 2.2rem del brand panel de Auth pasa al símbolo 3D a 3.4rem con `drop-shadow`, manteniendo el texto «Vecidya» en HTML (no se hornea en la imagen).
  - `app.tsx`: el empty-state «Crea tu primera organización» (sin organización activa) pasa del icono plano al símbolo 3D — caso explícitamente recomendado por la especificación para empty states.
  - `admin-shell.tsx`: el marcador de marca, que era únicamente una letra «V» sin imagen (`.admin-brand__mark`), pasa a reutilizar el símbolo plano ya aprobado con el mismo patrón `.brand-symbol-frame`/`.brand-symbol` que ya usa `client-area-shell.tsx` — unifica el tratamiento entre sidebar de App y de Admin en vez de duplicar estilos; CSS muerta de `.admin-brand__mark` eliminada.
  - Wordmark (`nombre.png`) y lockup completo (`Marca.png`) quedan **aprobados y reservados sin integrar**: no hay hueco concreto hoy (`/sobre-nosotros` ya usa una foto en su hero) y la regla de la especificación es no integrar una imagen solo porque existe.
- **QA en runtime (Playwright contra Worker local):** `/login` before/after real vía `git stash`/`pop` en 1366 y 390 (mejora visible, sin regresión, sin overflow). `/app` empty-state en 1366/768/360 con una cuenta QA creada por el flujo de registro real (`qa-vis002b@developer.serveryogoms.com`, solo local). Admin **no verificado en runtime**: elevar la cuenta QA a `platform_admin` vía `wrangler d1 execute DB --local` fue bloqueado por el clasificador de permisos de la sesión (`ADMIN-BRAND-RUNTIME-001`); el cambio se apoya en revisión de código y en el mismo patrón ya verificado en App.
- **Hallazgo fuera de alcance:** `.setup-card`/`.organization-form` en `/app` envuelve texto palabra por palabra solo en ~768px, preexistente y no relacionado con este cambio (`SETUP-CARD-WRAP-001`); no se corrigió para no ampliar el alcance de VIS-002B.
- **AUTHZ-BA-001 e INVITE-001 sin tocar**, como exige la especificación.

`RAN`: `typecheck`, `build`, `git diff --check` PASS. Sin cambios de ruta, schema, backend, GHL ni dependencias nuevas. Sin bump de versión (cambio integrado pero checkpoint intermedio, no cierre de VIS-002B). Sin push, sin deploy.

**Extensión del mismo checkpoint (mismo día, a pedido explícito del usuario):**

- **Favicon / pestaña / header y footer públicos pasan al símbolo 3D:** nuevo derivado `public/brand/vecidya-icon-3d.png` (512×512 PNG, alpha real, 149 KB) referenciado desde `root.tsx` (`<link rel="icon">`), `favicon.ts` (redirect) y `public-layout.tsx` (header 32px + footer). Decisión explícita del usuario, quien prefirió el 3D sobre la marca plana en estos cuatro puntos pese a que la propia VIS-002B recomienda plano para tamaños tan pequeños — verificado en runtime (1366/390) que sigue siendo legible.
- **Wordmark (`nombre.png`) integrado en el footer público**, reemplazando el icono+texto por `public/assets/selected/brand/brand-wordmark.webp` (1024×1024 con letterbox transparente — las herramientas de resize disponibles fuerzan lienzo cuadrado y no existe una que preserve el aspecto 3:1 original). Recorte al wordmark real resuelto solo con CSS (`object-fit:cover` sobre una caja `84×32`, proporción 3:1 idéntica al contenido), sin volver a tocar el archivo — verificado en captura de primer plano que no queda banda transparente visible.
- **Lockup completo (`Marca.png`) integrado en el brand panel de Auth**, reemplazando el icono+«Vecidya» en `auth-shell.tsx` por `public/assets/selected/brand/brand-lockup-tagline.webp` (512×512, 124 KB) a 10rem, con `alt` descriptivo (deja de ser decorativo porque ya no hay texto HTML equivalente al lado). No es redundante con el encabezado existente del panel («Tu presencia, más clara y organizada.») porque son dos textos distintos, no una repetición.
- Los tres assets aprobados en el checkpoint 1 quedan así completamente integrados; ninguno permanece reservado sin uso.

`RAN`: `typecheck`, `build` PASS.

**Batch 01 recibido y cerrado (mismo día):** el usuario generó y entregó los dos assets propuestos en el checkpoint 1 (`Assets1.png` → conexión de servicios, `Asset2.png` → lupa+pin) directamente en `../Assets Generados/`. Ambos inspeccionados (1254×1254, alpha real, sin artefactos visibles, familia visual coherente con el símbolo aprobado) y clasificados **APPROVED** sin necesidad de fix. Optimizados a `illus-services-empty-connection.webp` (384×384, 60,9 KB) e `illus-admin-empty-search.webp` (320×320, 49,7 KB) en `public/assets/selected/illustrations/`:

- **P1 resuelto:** `/app/services` (`services-app.tsx`) — empty-state «Sin servicios» pasa de texto puro al icono de conexión; verificado en runtime (1366/390) con la organización QA recién creada (`qa-barrio-centro`, cero servicios asignados, estado real).
- **P2 resuelto:** `/app/internal/organizations`, `/app/internal/businesses`, `/app/internal/integrations` y `/app/internal/audit` (6 variantes de empty-state en total, incluidas las 2 páginas que no estaban en el checkpoint 1) pasan del mismo icono de lupa+pin.

`RAN`: `typecheck`, `build`, `git diff --check` PASS. Sin bump de versión (checkpoint intermedio). Sin push, sin deploy.

**`ADMIN-BRAND-RUNTIME-001` resuelto (autorización explícita del usuario):** el usuario autorizó el `INSERT` en `platform_member` que el clasificador de permisos había bloqueado antes; verificado en runtime real (Playwright, sesión `platform_admin` real) en `/app/internal` (overview), `/app/internal/organizations` y `/app/internal/businesses` (empty-state «SIN RESULTADOS» disparado con un filtro real de 608/109 registros) en 1366 y 390 — marca, iconos e integración correctos, sin regresión.

**Icono 3D también en los sidebars de App y Admin** (a pedido explícito del usuario, con capturas anotadas): `client-area-shell.tsx` y `admin-shell.tsx` pasan de `vecidya-app-icon.png` (plano) a `brand-symbol-3d.webp`, reutilizando `.brand-symbol-frame`/`.brand-symbol`. Se ajustó esa clase compartida (`app.css`): el `transform: scale(1.38)` que recortaba el marco blanco propio del PNG plano sobre-recortaba el símbolo 3D (que ya ocupa casi todo su lienzo); se reemplazó por `object-fit: contain` al 78% del marco. De paso, el título del sidebar de Admin pasa de «Vecidya Admin» a «Vecidya» (el contexto de administración ya lo da el subtítulo «Operaciones de plataforma»), coherente con usar siempre el mismo nombre de marca.

`RAN`: `typecheck`, `build` PASS. Verificado en runtime (Playwright) en `/app` y `/app/internal`, 1366 y 390.

**Confirmación de plataforma completa (mismo día, a pedido del usuario):** recorrido sistemático de las 4 familias de layout (`PublicLayout`, `AuthShell`, `ClientAreaShell`, `AdminShell`) verificando uso correcto de los 5 assets de marca. Resultado: consistente en las 15 superficies revisadas (Home; Login y Registro; `/app`, `/app/services`, `/app/business-profile`; las 6 páginas de Admin incluidas Integraciones con datos reales y Auditoría con «SIN ACTIVIDAD» real). Único ajuste encontrado: el `logo` de JSON-LD `Organization` en `home.tsx` seguía apuntando al PNG plano antiguo (`vecidya-app-icon.png`); se actualizó a `vecidya-icon-3d.png` para consistencia. `public/assets/selected/brand/brand-symbol-primary.webp` (plano) se mantiene intencionalmente como el único uso restante, en el watermark de fondo de `.diagnostic-hero` (`app.css:2504`) — un 3D a 14% de opacidad perdería el detalle, así que el plano es la elección correcta ahí, no una omisión.

`RAN`: `typecheck`, `build` PASS. Sin bump de versión. Sin push, sin deploy.

## 2026-09-24 — Autogeneración de slug en Perfil de negocio (fuera de VIS-002B)

A pedido explícito del usuario, sin relación con el trabajo visual: en `/app/business-profile`, el campo «Slug» se autogenera a partir de «Nombre visible» mientras el usuario no edite el slug directamente (normaliza acentos/ñ, minúsculas, guiones; cumple el mismo patrón `[a-z0-9]+(-[a-z0-9]+)*` que ya exigía el input). En cuanto el usuario toca el campo Slug manualmente, se «bloquea» y deja de sobrescribirse con cambios posteriores al nombre; si lo vacía, se reanuda la autogeneración. Implementado sin convertir el formulario a controlado (sigue usando `Form`/`defaultValue` de React Router; solo el campo slug se referencia via `useRef` para leer/escribir su valor).

Verificado en runtime (Playwright): «Café La Esquina Ñoño» → `cafe-la-esquina-nono`; edición manual del slug bloquea la autogeneración correctamente.

`RAN`: `typecheck`, `build` PASS. Sin cambios de servidor/validación (la normalización servidor en `business-profile-validation.server.ts` no se tocó). Sin push, sin deploy.

## 2026-09-24 — UX-003.8 Authenticated App + Admin Visual Baseline + UX-003.9 App + Admin Experience Upgrade (`0.5.0` local)

UX-003.8 auditó Client App e Internal Admin con una sesión real (usuario QA local `qa.visual@vecidya.local`: registro, organización y `platform_admin` creados por los flujos reales, no por INSERT manual salvo el propio `platform_member`, cuyo esquema se inspeccionó primero). Sin cambios de código. Confirmó que `platform_admin` no contamina la experiencia normal de `/app`; recorrió 11 de 14 rutas privadas; encontró `ORG-UI-002` y reprodujo `ADMIN-SCALE-001` con datos reales (566 organizaciones, 98 perfiles de fixtures E2E sin limpiar). Capturas y `storageState` de sesión quedaron fuera de Git.

UX-003.9, autorizada el mismo día sobre ese baseline, sí modificó código:

- **Shell de Client App unificado:** las 5 rutas (`/app`, `/app/business-profile`, `/app/organization`, `/app/services`, `/app/account`) comparten ahora `ClientAreaShell` (sidebar agrupado con iconos, selector de organización, menú de usuario) en vez de dos shells distintos (uno con sidebar solo en `/app`, otro con navegación horizontal en las demás). Nuevo helper `server/auth/client-workspace.server.ts` evita repetir la consulta de organizaciones/`platform_admin` en cada loader.
- **`/app` rediseñado:** acción principal derivada de datos reales (Crear/Completar/Revisar para publicar/Administrar perfil), resumen de estado (perfil, servicios, equipo) y accesos rápidos.
- **`ORG-UI-001` y `ORG-UI-002` resueltos:** el marcador «Tu cuenta» ahora compara contra el id de usuario correcto; `.member-row` dejó de colapsar a 0px en móvil (dos media queries con la misma especificidad competían por el mismo selector — el mismo patrón que VIS-001B ya había corregido tres veces en Addons, Vecindario y reduced motion).
- **AdminShell:** iconos en la navegación y pie con usuario/«Platform Admin»/cerrar sesión, ausentes antes.
- **Admin Home con datos reales:** conteos de organizaciones/perfiles/servicios/integraciones (reutilizando queries ya existentes) y sección «Requiere atención» condicionada a datos reales, sin incidencias inventadas.
- **`ADMIN-SCALE-001` parcialmente resuelto:** Organizaciones y Negocios pasaron de tarjetas repetidas a tablas densas con búsqueda y filtro client-side (verificado filtrando 566→1 en runtime). Servicios, Integraciones y Auditoría quedan pendientes del mismo tratamiento.
- **P3:** regex inválida del slug de organización corregida; `<title>` añadido donde faltaba (`/app/organization`, lista y detalle de negocio en Admin).

`RAN`: `typecheck`, `build`, `git diff --check` PASS; `test:unit` 75/75 PASS; E2E `admin-shell`, `bpx`, `admin-bp`, `admin-orgs`, `members`, `c1`, `c2`, `d1` PASS. `px-b` falló en un punto distinto al que documentaba `TEST-UX003-PXB`; verificado manualmente (tres veces, una con el mismo ejecutable Edge del script) que el flujo real funciona correctamente — se registra como script poco fiable, no como regresión confirmada. Sin cambios de ruta, schema, backend, GHL ni dependencias nuevas. Versión local `0.4.2` → `0.5.0` (MINOR). Sin push, sin deploy.

## 2026-09-24 — VIS-001A Visual Foundations Audit (documental) + VIS-001B Foundations Implementation (`0.4.2` local)

VIS-001A confirmó el baseline real (`0.4.1`; React 19.3.0, React Router 8.4.0, Vite 8.3.0, Tailwind 4.3.3, TypeScript 7.0.2), que Motion/framer-motion no es necesario todavía (los efectos previstos se resuelven con CSS) y que Rive sigue bloqueado (no instalado, sin `.riv` aprobado). Fue solo lectura, sin cambios de código.

VIS-001B, autorizada y ejecutada el mismo día, corrigió tres defectos concretos que la auditoría dejó reproducibles en código y confirmó en navegador (Playwright + Chrome DevTools contra el Worker local):

- **Reduced motion roto:** `.auth-card{animation:none}` perdía la guerra de especificidad contra `.auth-layout > .auth-card`, así que la animación de entrada nunca se desactivaba con `prefers-reduced-motion: reduce`. Se movió la animación a `@media (prefers-reduced-motion: no-preference)` (mismo patrón ya usado en Home); verificado que `animationName`/`transform` resuelven a `none` bajo reduced motion real.
- **Anclas de Addons sin destino:** las cuatro categorías (`#comunicacion`, `#automatizacion`, `#inteligencia-artificial`, `#integraciones`) apuntaban a ids inexistentes. Se añadieron anclas invisibles (`position:absolute`, sin alterar el grid) en la primera tarjeta de cada categoría; verificado con navegación real por hash y sin regresión visual.
- **Grid compacto de Vecindario:** con 1–2 resultados, `.directory-page-v2--compact .directory-grid-v2` (dos columnas de 26rem) ganaba por especificidad a la regla móvil de una columna. Se añadió una regla de igual especificidad dentro de `@media (max-width: 760px)`; verificado 1 columna a 500px y 2 columnas a 1368px.

Al deduplicar el bloque Auth de `app.css` (dos declaraciones casi idénticas de `.auth-shell`/`.auth-layout`/`.auth-card`) apareció un cuarto defecto no listado en la auditoría: `.auth-brand` resolvía a texto blanco por ser la última de tres declaraciones con la misma especificidad, dejando el wordmark «Vecidya» invisible sobre la tarjeta blanca de `/verify-email`. Se corrigió acotando la variante blanca a `.auth-welcome .auth-brand`; verificado color computado `rgb(20, 43, 74)` en runtime.

Además: el estado vacío compartido (`.empty-state` sin imagen) confinaba el texto a una columna de 4.25rem/68px cuando `services-app.tsx` o `internal-audit.tsx` no renderizaban imagen — reproducido y corregido a nivel de foundation con `:has()`, sin tocar lógica de App/Admin (no quedó como follow-up UX-003, a diferencia de lo previsto en la auditoría). Se consolidaron 60 usos de pesos de fuente arbitrarios (650/750/850/950 → 700/800), verificado empíricamente sin diferencia de renderizado en Arial, y 29 duplicados literales de `--ink`/`--blue`/`--blue-dark` se alias-earon a sus tokens. Sin cambio de paleta, familia tipográfica, modelo comercial, rutas, backend ni nuevas dependencias.

`RAN`: `typecheck`, `build` (CSS `142.86 kB → 143.12 kB` gzip, sin regresión), `test:unit` 75/75, `git diff --check`, y E2E `addons`, `licenses`, `commercial-review` y `pg-c1` PASS (cubren 1366/768/390/360). QA visual manual (no exhaustiva) en Home, Licencias, Addons, Servicios, Aprende, Diagnóstico, Login, Registro y Verificar correo. Versión local `0.4.2` (impacto PATCH: solo correcciones y consolidación CSS, sin capacidad nueva). Sin push, sin deploy.

## 2026-09-23 — REL-004A Restore Git Traceability for `v0.4.1` (documental)

Recuperación de la fuente de verdad. No modifica producto.

- **`origin/main` sincronizado:** publicados `41986a4`, `b59d614` y `142b9c1` con `git push origin main` (`732d6c2..142b9c1`), sin force push, rebase ni reescritura de historia. La rama queda 0 adelante / 0 atrás en ese punto.
- **Tag anotado `v0.4.1`** creado sobre `b59d614`, el árbol realmente desplegado, y publicado en el remoto; `142b9c1` (reconciliación documental) queda deliberadamente después del commit etiquetado. No se fabricó ningún commit `0.4.0` artificial.
- **Auditoría de fase retirada:** `docs/UX-003-APP-ADMIN-AUDIT.md` no se promueve a documento canónico. Su contenido único se consolidó en `ROADMAP.md` (alcance de las fases pendientes UX-003.3, UX-003.6 y UX-003.7) y en `STATUS.md` (`ADMIN-SCALE-001`, `ADMIN-A11Y-001`); el resto ya estaba cubierto por deuda existente. El documento sigue recuperable desde `41986a4`. Documentos canónicos: 15.
- **Artefactos locales:** `.serena/` (estado de herramienta, nada versionado) pasa a `.gitignore`. `vecidya-platform/screenshots/` **no** se ignoró: 16 capturas ya están versionadas en `032208e` y 18 no, de modo que la decisión queda registrada como `REPO-SCREENSHOTS-001` en lugar de aplicarse a ciegas.
- Sin deploy y sin mutación de producción. Las tres pruebas `TEST-UX003-*` siguen abiertas y se corrigen en UX-003.6, no aquí.

## 2026-09-23 — VIS-001 Visual audit and UX/UI improvements (en progreso local)

- Iniciado el shell compartido para login, registro y recuperación de contraseña, preservando handlers y autenticación actuales.
- Home, navegación, footer público y legibilidad de metadatos reciben ajustes visuales; Licencias deja de mostrar referencias de precio de trabajo como importes públicos y Addons aclara disponibilidad en un solo punto.
- Aprende cambia la composición de cinco categorías y Vecindario centra/compacta uno o dos resultados y nombra los filtros activos.
- Validado localmente con `typecheck` y `build`; capturas full-page desktop/móvil en `screenshots/` para Login, Registro, Home, Licencias, Addons, Aprende, Vecindario y Nosotros. Sin publicar.

## 2026-09-23 — REL-004 Release Reconciliation `0.4.1` (documental)

Reconciliación de trazabilidad del release ya publicado. No modifica producto: sin cambios de motor, UX, páginas públicas, scoring, recomendaciones ni pruebas.

- **Contenido real de `0.4.1`** (61 archivos en `41986a4` + 5 documentos en `b59d614`): DIAG-002 (motor de Diagnóstico extraído a `app/features/diagnostic`), DIAG-002B (hardening semántico), DIAG-002C (cierre de decisiones de producto), UX-003.1–003.5 (Login, dashboard, shell del área cliente, Home Admin y detalle de negocio), OPS-001 (fundación documental GHL), comunidad/contacto WhatsApp y la corrección de `assets.directory` en `wrangler.jsonc`.
- **Brechas de trazabilidad registradas, no reescritas:** el commit `41986a4` lleva el mensaje `feat(ux): improve client and admin experience`, que describe solo uno de los cuatro bloques que contiene; y la versión salta de `0.3.0` a `0.4.1` sin que exista ningún commit `0.4.0`, pese a que `0.4.0` llegó a desplegarse en staging y producción desde un árbol sin commit.
- **Validación sobre `b59d614`** (`RAN` 2026-09-23): `typecheck`, `build`, `git diff --check` PASS; `test:unit` 75/75 PASS; 25 scripts E2E ejecutados con 21 PASS, 1 PASS PARCIAL (invitaciones, Gmail externo) y 3 FAIL de alcance UX-003 (`px-a`, `px-b`, `pe-b`), registrados como deuda `TEST-UX003-*`. Smoke HTTP anónimo de producción `0.4.1` PASS en 12 rutas públicas.
- **Correcciones documentales:** matriz de capacidades del Diagnóstico actualizada a DIAG-002C y 75 pruebas, con el encaje comercial marcado como publicado; recuento de documentos canónicos corregido a 16 y señalado que `UX-003-APP-ADMIN-AUDIT.md` no figura en la tabla canónica ni consta su autorización.
- Sin push y sin deploy. `origin/main` permanece en `732d6c2` (`0.3.0`), dos commits por detrás del código publicado.

## 2026-09-23 — DIAG-002C Product Decision Closure (`0.4.1`, LIVE)

- Licencia solo por necesidad recurrente real: una operación con registro y seguimiento resueltos y sin capacidad recurrente pendiente recibe «Ninguna necesaria por ahora» aunque un servicio o una lectura ayuden (escenarios G e I dejan de recibir «Barrio opcional»); sin consultas tampoco hay licencia; Barrio exige brecha sustantiva de seguimiento; Ciudad conserva sus prerrequisitos; una prioridad fundacional limita a Cuadra.
- Servicio ≠ licencia, protegido por invariantes: los servicios solo se derivan de prioridades reales y nunca de la licencia; un servicio puede recomendarse con licencia «ninguna».
- Vocabulario público canónico de addons: «IA conversacional» y «Automatizaciones» (con «WhatsApp», «SMS», «Telefonía», «AI Voice» e «Integraciones») unificado en `/addons`, el motor del Diagnóstico y el catálogo comercial; identificadores internos sin cambio; los nombres anteriores solo permanecen en entradas históricas de este CHANGELOG.
- Decisión registrada: Home mantiene cuatro puertas (Negocio, Profesional, Proyecto, Creador); «organización» sigue siendo perfil del motor y `/diagnostico?perfil=organization` sigue válido. Deuda `DIAG-002-HOME-DOORS` cerrada como intencional.
- Pruebas: 5 unitarias nuevas (`test:unit` 75/75); E2E de Addons actualizado al nombre público. Incluido en `0.4.1`; `test:unit` 75/75 PASS; publicado en staging y producción (evidencia en `ENVIRONMENTS.md`).

## 2026-09-23 — Release `0.4.1` DIAG-002C + UX-003 App y Admin (`LIVE`)

- Añadido shell compartido con navegación activa a Cuenta, Organización, Perfil y Servicios; oculta destinos de organización cuando el usuario todavía no pertenece a una.
- El detalle Admin del perfil ahora reúne contacto, sitio, WhatsApp, redes, modalidad, área y horarios guardados para revisión, en modo solo lectura.
- Estilos responsive para desktop y móvil; la navegación conserva landmarks y foco visibles, y sus transiciones respetan movimiento reducido.
- Publicado en staging: `vecidya-platform-staging`, Version ID `c7f7ee8b-e528-42d5-840c-ad7b4c9a9454` (versión #35); en producción: `vecidya-platform`, Version ID `eec3de6a-6711-4eff-91de-b413406e3618`.
- Staging sigue accesible por `workers.dev`; Wrangler no pudo reasignar el trigger de zona `vecidya.com/*` porque ya pertenece al Worker de producción. Sin migraciones remotas ni cambios de secrets.
- Sin cambios de permisos, escrituras, schema, migraciones, datos, dependencias ni proveedores. `test:unit` 75/75 PASS; `typecheck`, `build` y `git diff --check` PASS. Smoke anónimo `2026-09-23`: `/`, `/login`, `/contacto` y SVG WhatsApp `200`; Home/Contacto muestran `v0.4.1`; `/app` y `/app/internal` redirigen a `/login` con `302` en staging y producción.

## 2026-09-23 — Deploy `0.4.0` a staging y producción (`LIVE`)

- Deploy autorizado explícitamente del estado local `0.4.0` (DIAG-002B + primera entrega UX-003.1/003.4) en `vecidya-platform-staging` y `vecidya-platform`.
- Staging: Version ID `57c2f319-7de4-4995-a4ba-2a10db82fa7a`; producción: Version ID `8c7d38e6-d560-4f27-9a40-b9d102033eff`.
- Validación previa: `pnpm run typecheck`, `pnpm run build`, `pnpm run test:unit` (70/70 PASS) y `git diff --check` PASS.
- Smoke HTTP anónimo PASS el 2026-09-23 en ambos entornos para rutas públicas, CSS principal, `/robots.txt` y `/sitemap.xml`; `/app` y `/app/internal` devuelven `302` sin sesión.
- No se ejecutaron migraciones remotas ni se modificaron secrets. Staging continúa accesible por `workers.dev`; su trigger de zona no se reasignó por conflicto con producción.

## 2026-09-23 — DIAG-002B Semantic, Decision & Result Integrity Hardening (`v0.4.0`, PASS técnico local)

- Revisión hostil del recorrido pregunta → respuesta → evidencia → dimensión → estado → prioridad → recomendación → CTA sobre el grafo ejecutable del motor; 17 defectos semánticos reproducidos primero como pruebas y corregidos después.
- Evidencia: los activos ya no fabrican «contacto» (WhatsApp Business) ni «confianza» (web, Google); las reseñas pesan más en la prueba de un negocio; medición, responsabilidades y posventa solo se preguntan cuando llegan consultas.
- Estado: seis estados por reglas; una fuga grave concreta no queda enmascarada por el promedio; sin consultas no se afirma «captas y das seguimiento»; «operación activa con datos por confirmar» cuando registro y seguimiento son «no lo sé»; el estado cita las respuestas que lo originan.
- Hallazgos: sin duplicados entre «presencia escasa» y «no apareces en Google»; «varios canales» solo es brecha sin registro; «pedir reseñas» para negocios con buen proceso y sin reseñas; los hallazgos derivados de «no lo sé» usan lenguaje de comprobación; fortalezas de dimensión solo con evidencia suficiente, sin dudas y sin brecha grave confirmada.
- Contradicciones declaradas (idea + primera venta, actividad regular + sin consultas, presencia clara + propuesta sin resumir) bajan la confianza y se explican; nota de objetivo cuando automatizar, medir, ser encontrado o generar confianza requieren prerrequisitos.
- Licencia alineada con lo que incluye cada nivel: Cuadra cubre una brecha solo de registro; Barrio exige brecha de seguimiento con consultas reales; Ciudad exige captura y seguimiento definidos; una prioridad fundacional limita a Cuadra; las dudas no deciden licencia; sin servicio de relleno cuando no hay prioridades.
- Resultado reordenado (estado → prioridad principal destacada → siguientes pasos → evidencia → dimensiones por nivel sin números → encaje), enunciados por perfil en posventa, anclas reales a `/licencias#<nivel>` (ids añadidos a las tarjetas) y `/addons#<addon>`.
- Vocabulario de addons unificado: `/addons` es la fuente de verdad pública; el catálogo comercial conserva «AI Chat» y «Automatización inteligente» como alias históricos.
- Pruebas: `semantics.test.ts` (27) con personas adversariales A–L; `pnpm run test:unit` 70/70; `diagnostic-experience-check.mjs` actualizado; runner E2E local 25/25; typecheck, build y diff-check PASS. Mismo release candidate `0.4.0`; sin push ni deploy.

## 2026-09-23 — UX-003.1/003.4: primera mejora de App y Admin (`0.4.0`, local)

- Login reorganizado con composición responsive, ilustración existente, foco visible y jerarquía del formulario; el flujo de Better Auth no se alteró.
- Dashboard de cliente prioriza el perfil, muestra completitud con `progressbar` accesible y traduce roles al español.
- Home Admin ahora enlaza organizaciones, perfiles, servicios, integraciones y auditoría existentes; incorpora una ilustración ya versionada.
- Añadidos motion de entrada e interacción para las superficies autenticadas, con `prefers-reduced-motion`; sin librerías, assets binarios, migraciones, cambios de datos, deploy ni push.
- Typecheck y build PASS; login, CSS e imagen dieron HTTP 200 local. Revisión de navegador y E2E autenticado pendientes (Browser integrado no disponible; scripts usan D1 local).

## 2026-09-23 — Pulido de motion en Home (`0.4.0`, local)

- Añadidas entradas breves al copy y la ilustración principal, flotación sutil del pin y realces de interacción en opciones de Diagnóstico y tarjetas del Vecindario, usando el arte ya versionado.
- Las animaciones solo se activan cuando el usuario no solicita movimiento reducido; no se añadieron dependencias, datos, assets nuevos ni cambios de publicación.
- Pendiente ejecutar validación visual y typecheck/build para este cambio; producción continúa en `0.3.0`.

## 2026-09-23 — DIAG-002 Professional Diagnostic Engine (`v0.4.0`, PASS técnico local)

- Extraído el motor del Diagnóstico a `app/features/diagnostic/` (tipos, perfiles, banco de 26 preguntas con propósito y evidencia por opción, respuestas con aislamiento de ramas, secuencia por secciones, puntuación normalizada, estado por reglas, prioridades con dependencias, recomendaciones y contrato de deep link); `diagnostic.tsx` solo renderiza.
- Cinco perfiles (negocio, profesional, creador, proyecto, organización); «idea» pasa a ser un momento y se retira «candidatura o figura pública». Contexto de momento, equipo por rangos y objetivo; recorrido mínimo 6, típico 13–16 y máximo 19 preguntas.
- Siete dimensiones (claridad, presencia, alcance, confianza, contacto, seguimiento, medición) de 0 a 100 sobre evidencia aplicable; «no lo sé» reduce la confianza sin puntuar como «no»; «no aplica» no puntúa ni afecta la confianza; las dimensiones sin evidencia se muestran como «sin evaluar».
- Resultado explicable: estado, cómo llegamos, confianza separada, dimensiones, fortalezas, brechas, hasta tres prioridades con «por qué» (citando la respuesta) y «qué hacer», siguientes pasos en orden y encaje Vecidya (licencia por capacidad, que puede ser «ninguna todavía»; servicios, addons y artículos reales verificados por prueba).
- Contrato canónico `/diagnostico?perfil=<perfil>` con `objetivo=` opcional y lista cerrada; Home (Negocio, Profesional, Proyecto, Creador) y el artículo de CRM entran con contexto sin repetir la selección; valores inválidos caen al inicio normal.
- UI con `fieldset`/`legend`, radios y checkboxes nativos, stepper por secciones, `progressbar` con `aria-valuetext`, foco en cada pregunta, reduced motion y límites explícitos del diagnóstico; `mailto` prellenado sin respuestas crudas.
- Nuevas pruebas: `pnpm run test:unit` (node:test, 43 pruebas: contrato, exclusivas, aislamiento, secuencia, cotas, determinismo, escenarios A–E, invariantes sobre 1.125 combinaciones, catálogo real) y `diagnostic-experience-check.mjs` reescrito (deep links, Home, aislamiento, a11y, resultado, responsive 1366/768/390/360).
- Investigación aplicada y citada en el reporte: marco DMA de la Comisión Europea (normalización por dimensión), Pew Research (opción «no sé»), HBR 2011 (respuesta a leads), guía de ranking local de Google, GOV.UK «one thing per page», NN/g (carga cognitiva), W3C WAI (agrupación de controles) y datos de longitud de encuestas de SurveyMonkey.
- Versión `0.3.0` → `0.4.0` (MINOR, compatible: `/diagnostico` sin parámetros sigue funcionando). Sin persistencia, cookies, `localStorage`, CRM, GHL, migraciones, secretos, push ni deploy.

## 2026-09-23 — Comunidad y contacto WhatsApp (`v0.3.0`, LIVE)

- Añadido el enlace autorizado del grupo de WhatsApp de Vecidya/Vecindario en el footer público y en `/contacto`.
- Incorporado un icono SVG de WhatsApp accesible y CTAs externos que abren el grupo en una pestaña nueva.
- Añadido el WhatsApp comercial directo `https://wa.me/573244321864` como canal de contacto con Vecidya, separado del grupo comunitario.
- No se modificaron precios, modelo de datos, integración GHL, secretos, migraciones ni versión.
- Desplegado en staging (`vecidya-platform-staging`, Version ID `35c0961f-ccdd-4c76-a7d3-5bd347132a91`) y producción (`vecidya-platform`, Version ID `5d7278d3-6db6-4378-b497-39dc82f0aeb8`).
- HTTP anónimo de `/contacto` respondió `200` en staging y producción; ambos enlaces fueron encontrados en el HTML servido.

## 2026-09-23 — Corrección de assets de publicación (`v0.3.0`, LIVE)

- Corregido el despliegue de CSS, JavaScript y assets públicos: `wrangler.jsonc` ahora declara `assets.directory = ./build/client`.
- El incidente se detectó visualmente porque el HTML respondía `200`, pero los recursos estáticos devolvían `404`; no fue una caída del Worker ni un cambio de datos.
- Regenerados tipos Cloudflare, ejecutados build y `git diff --check`; redesplegados staging (`742c4f5b-f8c7-4634-8dba-9fae522cacbb`) y producción (`cd3f247e-64dc-4ca8-aff1-92ce137c0de0`).
- Comprobación HTTP anónima posterior PASS en producción para HTML, CSS, logo PNG, ilustración WebP, icono WhatsApp y `/contacto`.

## 2026-09-23 — OPS-001 GHL Pilot Foundation (`v0.3.0`, PASS DOCUMENTAL)

- Creado `docs/OPS-001-GHL-PILOT-FOUNDATION.md` con inventario de capacidades HighLevel, clasificación de costes, validación documental de Cuadra/Barrio/Ciudad, definición de configuración estándar, mapa de fuente de verdad, modelo de subaccount/location, piloto mínimo y contrato futuro.
- Verificada documentación oficial vigente de HighLevel: Starter USD 97/mes/3 subcuentas, Unlimited USD 297/mes, Agency Pro USD 497/mes, WhatsApp USD 10/location/mes, AI Employee Growth USD 50/location/mes y Unlimited USD 97/location/mes; consumos de telefonía, mensajería e IA permanecen separados.
- La cuenta contratada, plan real, ciclo de facturación, Labs, límites y capacidades habilitadas quedan `NOT VERIFIED` por falta de acceso autenticado; no se presentan referencias públicas como contratación de Vecidya.
- No se crearon tablas, migraciones, OAuth, API calls, webhooks, secretos, CRM propio, checkout, billing automático, páginas, precios públicos ni cambios de producción. La versión se mantiene en `0.3.0`.

## 2026-09-23 — Actualización de fotografía del equipo (`v0.3.0`, LIVE)

- Reemplazadas las fotografías de Yoan Ortiz, Edgar y el equipo por los assets entregados en `C:\Users\Admin\Downloads\fotos`.
- Convertidas a WebP optimizado y conservadas las rutas públicas existentes para no romper referencias.
- Ajustadas las dimensiones declaradas de las imágenes en `/sobre-nosotros` para evitar layout shift.
- Publicado en staging (Version ID `934810c2-db8d-4126-960a-cd302d1d45cb`) y producción (Version ID `fd6d0a4c-da2f-437f-8074-75a989050633`); assets verificados por hash en ambos entornos.

## 2026-09-23 — REL-003.1 Publish `0.3.0` (`LIVE`)

- Push autorizado completado: `origin/main` apunta a `ca629eb`.
- Staging publicado en `vecidya-platform-staging`, Version ID `58365cf8-2e1b-4b7a-b131-8631d9e96f22`, con `DB=vecidya-staging` y `APP_ENV=staging`; la URL workers.dev responde 200.
- Producción publicada en `vecidya-platform`, Version ID `26358c8b-70c4-41f3-8f10-34d1bd60916f`, con `DB=vecidya-prod` y `APP_ENV=production`; `vecidya.com` responde `0.3.0`.
- Smoke HTTP anónimo PASS para rutas públicas, artículo de Aprende, sitemap, robots, canonical/metadata y redirect `/que-debes-saber → /aprende`; no se ejecutaron migraciones ni se modificaron secrets.
- El trigger de zona de staging no se reasignó por conflicto con la ruta existente de producción; el Worker staging queda operativo en `workers.dev`.

## 2026-09-23 — REL-003 Release 0.3.0 Gate (`v0.3.0`, READY TO PUBLISH)

- Reconciliada la documentación canónica para distinguir la release candidate local `0.3.0` de la producción publicada `0.2.0`.
- Ejecutados typecheck, build, diff-check, runner E2E local completo (25 scripts: 24 PASS y 1 PASS PARCIAL por delivery Gmail externo) y smoke responsive/SEO público.
- Confirmadas ausencia de CRM propio, GHL activo, checkout, pagos, Stripe, secretos versionados y migraciones nuevas; el catálogo comercial mantiene la separación Licencia/Addon/Servicio/Consumo y Cuadra/Barrio/Ciudad.
- REL-003 queda **READY TO PUBLISH**. No hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod`.

## 2026-09-23 — Public hardening follow-up (`v0.3.0`)

- Corregidas brechas públicas de accesibilidad y robustez: imágenes del header con dimensiones explícitas, datos de perfil con `overflow-wrap` y auditoría de un único `<main>`, alt/dimensiones, metadata y overflow.
- Ampliado `commercial-experience-review-check.mjs` para verificar `robots.txt`, `favicon.ico`, alias `/que-debes-saber`, `og:image`, sitemap y rutas privadas excluidas.
- `UX-PUBLIC-001` queda resuelta en el alcance público; las pruebas de auth negativa, APIs privadas, CI y auditoría axe permanecen fuera de UX-002 y documentadas como brechas separadas.

## 2026-09-23 — UX-002.7 Commercial Experience Review (`v0.3.0`, PASS técnico local)

- Auditado el recorrido comercial completo `Aprende → Diagnóstico → Licencias → Addons → Servicios → Contacto` sin crear nuevas páginas ni activar funcionalidades comerciales.
- Verificados CTAs cruzados, navegación pública desktop/móvil, separación Licencia/Addon/Servicio/Consumo, referencias Cuadra/Barrio/Ciudad etiquetadas y ausencia de GHL/HighLevel público.
- Añadido `commercial-experience-review-check.mjs` al runner local: sitemap, metadata, exclusión de `/app`, `/api`, `/login` y `/register`, overflow y responsive 1366/768/390/360.
- Añadido «Nosotros» a la navegación desktop para completar la entrada institucional; no se modificó el modelo de datos.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-23 — UX-002.6 Content & Learn Experience (`v0.3.0`, PASS técnico local)

- Evolucionada `/aprende` a centro de conocimiento con cinco categorías y cuatro artículos iniciales atribuidos a Yoan Ortiz.
- Añadidas páginas `/aprende/:slug` con introducción, problema, explicación sencilla, ejemplos, índice accesible, siguiente paso y CTA contextual a Diagnóstico o Servicios.
- Añadidos tres diagramas educativos SVG para CRM, IA y automatización; se reutiliza una ilustración existente para presencia digital.
- Añadidas metadata canonical/Open Graph por artículo y entradas dinámicas en `sitemap.xml`; sin CMS, newsletter, comentarios, cursos ni datos comerciales ficticios.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-23 — UX-002.5 Diagnostic Experience 2.0 (`v0.3.0`, PASS técnico local)

- Evolucionado el resultado de `/diagnostico` sin modificar el algoritmo de scoring: ahora muestra situación actual, observaciones, prioridades y un camino recomendado.
- Añadido mapeo orientativo a licencia Cuadra/Barrio/Ciudad, addons posibles, servicios útiles y hub educativo `/aprende`.
- Conservados posición, confianza, dimensiones, fortalezas, oportunidades, CTAs, reinicio, anonimato, carácter efímero y ausencia de persistencia.
- Actualizada metadata SEO y ampliado el E2E responsive para validar el nuevo resultado y sus enlaces comerciales.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-22 — UX-002.4 Services Experience (`v0.3.0`, PASS técnico local)

- Actualizada `/servicios` para presentar servicios profesionales de Organización del negocio, Formalización de base, Presencia digital, Automatización, Inteligencia artificial y Marketing y crecimiento.
- Añadida la separación pública entre Licencia, Addon, Servicio y Consumo externo, con enlaces a `/licencias` y `/addons` y CTA de Diagnóstico.
- Sustituido el lenguaje de catálogo genérico por resultados, problemas y apoyos posibles; no se publican precios generales ni se expone GHL como producto.
- Ampliado el E2E público para validar las áreas nuevas, el modelo comercial y los enlaces de navegación.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-22 — UX-002.3 Addons Experience (`v0.3.0`, PASS técnico local)

- Añadida la ruta pública `/addons` con hero de expansión, definición de addon, categorías de Comunicación, Automatización, Inteligencia Artificial e Integraciones y cards de capacidades.
- Explicada la diferencia entre licencia, addon, servicio y consumo externo; los consumos variables permanecen separados y no se publican precios de addons.
- Conectada la experiencia con Diagnóstico, Licencias y Servicios; reutilizados el sistema visual y los iconos existentes, sin integración GHL activa.
- Añadido `addons-experience-check.mjs` para metadata, sitemap, categorías, cards, CTAs, keyboard focus y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-22 — UX-002.2 Licencias Experience (`v0.3.0`, PASS técnico local)

- Añadida la ruta pública `/licencias` con hero, definición de licencia, tarjetas Cuadra/Barrio/Ciudad, comparador responsive, evolución por necesidad, addons, FAQ y CTA de Diagnóstico.
- Las referencias `USD 39/mes`, `USD 59/mes` y `USD 89/mes` se muestran como referencias comerciales, sin presentarlas como precio publicado ni activar checkout, pagos o suscripciones.
- Reutilizados el sistema visual, iconos existentes, metadata institucional, navegación pública y footer; no se generaron assets nuevos.
- Añadido `licenses-experience-check.mjs` para metadata, CTAs, accesibilidad básica, comparador desktop/móvil y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-22 — UX-002.1 Product Catalog Foundation (`v0.3.0`, PASS documental)

- Creado `docs/business/VECIDYA_PRODUCT_CATALOG.md` como matriz comercial maestra de licencias Cuadra, Barrio y Ciudad.
- Separadas las categorías licencia, addon, servicio y consumo externo; documentadas las reglas de evolución por necesidad, el diagnóstico inicial/profesional, Aprende y los mapas comerciales.
- Registrada HighLevel como infraestructura externa prevista, con la referencia Starter entregada, sin declarar integración activa ni crear CRM propio.
- No se modificaron páginas públicas, precios publicados, componentes, rutas, schema, migraciones, checkout, push ni deploy.

## 2026-09-22 — UX-001C Public Experience Polish (`v0.3.0`, PASS técnico local)

- Auditada y pulida la experiencia pública como un único recorrido: navegación desktop priorizada, estado activo exacto, menú móvil con Escape/retorno de foco y footer agrupado en Explorar, Empezar y Legal.
- Los resultados filtrados del Vecindario conservan canonical base y pasan a `noindex, follow`; `/que-debes-saber` redirige permanentemente a `/aprende` y deja de competir como ruta indexable.
- Actualizado el E2E público responsive para cubrir noindex, redirect legado y exclusión del alias en sitemap; no se añadieron páginas, funcionalidades, migraciones ni assets nuevos.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-22 — UX-001B.10 Legal & Trust Experience (`v0.3.0`, PASS técnico local)

- Reorganizada `/privacidad` como una experiencia clara de confianza: datos actuales, uso/control, límites, derechos y contacto.
- Confirmado `mailto:hola@vecidya.com`, canonical `/privacidad`, robots indexables y Open Graph institucional.
- El footer conserva enlaces reales a Privacidad, Contacto, Nosotros y Aprende; no se creó `/terminos` porque no existe contenido legal aprobado para esa página.
- Añadido `legal-trust-experience-check.mjs` con 200, metadata, footer, mailto, ausencia de enlaces legales ficticios, keyboard focus y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas.

## 2026-09-22 — Cierre de regresión C2 Business Operations (`v0.3.0`)

- Corregido el render SSR de los horarios compactados del perfil público: la etiqueta completa (`Lun–Vie · 09:00–18:00`) se emite como una unidad legible y estable para HTML/E2E.
- `product-evolution-001-c2-business-operations-check.mjs` vuelve a **PASS** en validación privada, perfil público, JSON-LD y responsive del editor/perfil.
- No se modificaron schema, migraciones, scoring, rutas públicas ni versión; no hubo push ni deploy.

## 2026-09-22 — UX-001B.9 Learn Experience (`v0.3.0`, PASS técnico local)

- Establecida `/aprende` como ruta canónica educativa y conservado `/que-debes-saber` como alias legado; la navegación pública ahora apunta a `/aprende` y el sitemap usa la canonical.
- Rehecha la experiencia con hero, cuatro temas conceptuales, estado editorial honesto sin artículos ficticios, criterio de contenido y CTAs a Diagnóstico/Contacto.
- Reutilizada la ilustración de prioridades existente; no se añadieron CMS, artículos, autores, fechas, lectores, comentarios ni structured data editorial.
- Añadido `learn-experience-check.mjs` con H1, metadata, CTAs, estado vacío, keyboard focus y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.8 About Experience (`v0.3.0`, PASS técnico local)

- Rehecha `/sobre-nosotros` desde una lógica de confianza: propósito real, origen del problema, personas visibles, forma de trabajar y punto de vista sobre lo digital.
- Incorporadas las fotos reales entregadas de Yoan y Edgar como WebP optimizados: imagen conjunta desktop/mobile y perfiles individuales; no se alteró la identidad de las personas ni se añadieron credenciales no verificadas.
- Los CTAs finales mantienen la separación de B.7: Diagnóstico para orientarse y Contacto para hablar con Vecidya.
- Añadido `about-experience-check.mjs` con equipo, propósito, metadata, keyboard focus, ausencia de métricas ficticias y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.7 Join + Contact Experience (`v0.3.0`, PASS técnico local)

- Separadas las responsabilidades de `/unete` y `/contacto`: Únete explica cómo empezar con dos caminos; Contacto declara el email como canal directo real.
- `/unete` conserva la ilustración de onboarding, reduce el contexto necesario a cinco puntos y el proceso a tres pasos, sin registro, checkout ni promesas operativas.
- `/contacto` mantiene `mailto:hola@vecidya.com`, añade guidance breve, expectativas honestas y enlace a privacidad sin simular teléfono, WhatsApp, chat, booking o formulario persistente.
- Añadido `join-contact-experience-check.mjs` con metadata, H1, CTAs, mailto, privacidad, keyboard focus y responsive 1366/768/390/360; la deuda C2 de horarios permanece independiente.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.6 Diagnostic Experience (`v0.3.0`, PASS técnico local)

- Mejorada `/diagnostico` con selector visual coherente con Home, preguntas con jerarquía clara, `Pregunta X de Y`, progreso accesible y etapas visibles.
- Añadidos foco al encabezado de cada pregunta, navegación anterior/siguiente, estados seleccionados con `aria-pressed`, soporte de teclado y reinicio sin persistencia.
- El resultado ahora explica posición, confianza, dimensiones con labels humanos, fortalezas, oportunidades y próximos focos; las prioridades compatibles enlazan a anchors reales de `/servicios`.
- Corregida la contaminación de respuestas al cambiar de perfil: se limpian respuestas dependientes sin alterar el algoritmo de scoring para respuestas equivalentes.
- Añadido `diagnostic-experience-check.mjs` con selector, keyboard, progreso, back/next, resultado, reinicio y responsive 1366/768/390/360. La deuda C2 de horarios permanece independiente y fuera de alcance.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.5 Services Experience (`v0.3.0`, PASS técnico local)

- Rehecha `/servicios` como guía de decisión: hero breve, selector por necesidades, cuatro áreas core y proceso de tres pasos.
- Cada servicio comunica problema, resultado, apoyo posible y un CTA real; Organización y crecimiento se conserva como área secundaria sin inventar oferta.
- Reutilizados los cuatro SVG de Servicios aprobados en B.2; no se añadieron assets, precios, checkout, paquetes ni structured data comercial.
- Actualizada la prueba pública para validar H1 único, selector, anchors, CTAs, ausencia de «SERVICIOS COMPRABLES» y responsive en 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.4 Public Business Profile (`v0.3.0`, PASS técnico local)

- Mejorada la experiencia de `/vecindario/:slug` como presencia pública del negocio: identidad, ubicación, CTA primario, descripción, detalles operativos, horarios, contacto y redes reales.
- Los canales de contacto conservan la jerarquía WhatsApp → teléfono → website → email, con URLs seguras y nombres accesibles. Los paneles sin datos no se renderizan.
- Los horarios se agrupan visualmente con etiquetas de días y valores de tiempo sin introducir “abierto ahora” ni inferencias de timezone.
- JSON-LD `LocalBusiness` mantiene solo datos existentes e incorpora el website real en `sameAs`; no se agregan reviews, ratings, geo ni servicios comerciales ficticios.
- Actualizadas pruebas de perfil publicado, draft, opcionales vacíos, JSON-LD y cierre contextual. Validado con E2E de perfil, E2E público, Playwright responsive, typecheck, build y diff-check.
- Se mantiene `0.3.0`; no hubo deploy, migraciones remotas ni cambios en `vecidya-prod`.

## 2026-09-22 — UX-001B.3 Vecindario Experience (`v0.3.0`, PASS técnico local)

- Rediseñado `/vecindario` como superficie de descubrimiento: header breve, búsqueda por nombre, filtros exactos de categoría/ciudad, resumen de filtros activos y grid responsive.
- Reutilizada `BusinessCardV2` entre Home y Vecindario; se mantiene información pública mínima y no se agregan badges, rankings ni datos ficticios.
- Diferenciados los estados vacíos de directorio sin perfiles y búsqueda filtrada sin coincidencias.
- La búsqueda escapa `%`, `_` y `\\` para evitar que caracteres LIKE actúen como comodines.
- Validado con E2E público, QA responsive local, `pnpm run typecheck`, `pnpm run build` y `git diff --check`.
- Se mantiene `0.3.0`; no hubo deploy, migraciones remotas ni cambios en `vecidya-prod`.

## 2026-09-22 — UX-001B.2 Public Home Implementation (`v0.3.0`, PASS técnico local)

- Reemplazada la Home extensa por seis bloques de experiencia: Hero/producto, Vecindario real, Diagnóstico interactivo, Servicios visuales, transformación y CTA final.
- La Home lee hasta tres perfiles publicados desde D1 mediante la query pública existente, excluye borradores/suspendidos y mantiene estado honesto cuando no hay perfiles.
- Añadidos ocho SVG individuales: cuatro iconos de Diagnóstico y cuatro iconos de Servicios. Añadida imagen Open Graph institucional `1200×630` (`og-vecidya-public.svg`). No se integraron assets de reviews/ratings.
- Unificada la etiqueta pública `Aprende` en desktop, móvil y footer; añadidas `og:url`, `og:image` y Twitter Cards; corregido el landmark principal de la Home.
- Validado con `pnpm run typecheck`, `pnpm run build`, `git diff --check`, `product-experience-a-public-review-check.mjs` (PASS) y QA Playwright Edge en 1366/768/390/360 sin overflow.
- `0.3.0` queda local/release ready; no hubo deploy, migraciones remotas ni cambio de producción (`0.2.0`).

## 2026-09-22 — EMAIL-001D Password Reset Production E2E (`v0.2.0`, PASS)

- Evidencia manual autorizada del operador para `hola@vecidya.com`: correo real recibido, enlace de producción abierto, formulario `reset-password` ejecutado y contraseña modificada correctamente.
- Flujo verificado: `forgot-password → Gmail real → enlace de recuperación de producción → reset-password → contraseña modificada`.
- EMAIL-001 permanece **PASS / CLOSED** en `v0.2.0`. La autenticación posterior con la nueva contraseña no se afirma sin evidencia separada.
- Verificación de email con cuenta secundaria e invitación completa (entrega + aceptación) permanecen **PENDING / follow-up**.

## 2026-09-22 — EMAIL-001C Production Release (`v0.2.0`, PASS)

- Publicado el commit `6b351c4` en `vecidya-platform` top-level sobre `vecidya-prod`; Version ID `c38ce78b-648c-438c-a796-f20f7bf8e4b3`.
- Smoke público PASS: rutas principales, `forgot-password`, `reset-password`, `verify-email`, `robots.txt`, `sitemap.xml` y `www` → apex; footer público reporta `0.2.0`.
- Solicitud productiva de reset para `hola@vecidya.com` respondió `200` con mensaje genérico; el operador confirmó recepción en inbox. Gmail OAuth refresh, API send y entrega real quedan **PASS**. El detalle del reset E2E fue reconciliado en EMAIL-001D.
- No se modificó D1, no se ejecutaron migraciones ni E2E remotos destructivos, y no se expusieron valores de secretos. Verificación autenticada de esta release e invitaciones requieren una sesión/cuenta controlada y permanecen como follow-up explícito.

## 2026-09-22 — EMAIL-001 Gmail Release Ready (`v0.2.0`, no publicada)

- Confirmada la configuración top-level de producción: `EMAIL_PROVIDER=gmail`, `EMAIL_FROM=hola@vecidya.com` y `EMAIL_REPLY_TO=hola@vecidya.com`.
- Confirmados, sin leer ni versionar sus valores, los secretos requeridos por el código: `GMAIL_OAUTH_CLIENT_ID`, `GMAIL_OAUTH_CLIENT_SECRET` y `GMAIL_OAUTH_REFRESH_TOKEN`.
- Retiradas las rutas y el módulo de bootstrap OAuth temporal; el refresh token ya no se obtiene desde una superficie pública de Vecidya.
- Validación local y E2E ejecutados en este corte. Estado: **RELEASE READY**; no se declara delivery Gmail PASS, no se ejecutó deploy ni push.

## 2026-09-21 — Actualización de dependencias (local, no publicada)

- Actualizadas las dependencias directas de React Router, React, Better Auth, Cloudflare/Vite, TypeScript, tipos de Node/React, Playwright, Wrangler y Drizzle Kit; el lockfile queda sincronizado con pnpm 11.21.0.
- Añadidos overrides seguros para `qs` y `morgan`, corrigiendo sus avisos transitivos conocidos. Permanece un aviso moderado de `esbuild@0.18.20` heredado por `@esbuild-kit` de Drizzle Kit; no se fuerza una versión incompatible con ese loader.
- Validado con `pnpm install --frozen-lockfile`, `pnpm run typecheck`, `pnpm run build`, `pnpm run test:email`, `pnpm audit` y `git diff --check`. No hubo deploy ni cambio de versión publicada.

## 2026-09-21 — EMAIL-001 Gmail Transactional Email Foundation (parcial, no publicada)

- Sustituido el camino activo de Resend por un adaptador server-only provider-independent preparado para Gmail API, con MIME UTF-8 texto/HTML, `Reply-To`, validación de headers y clasificación segura de errores.
- Integrados los callbacks de Better Auth para verificación de email y reset de contraseña, además de UI mínima para solicitar reset, cambiar contraseña y verificar/resolicitar correo, sin activar verificación obligatoria global para no bloquear usuarios existentes.
- Añadido proveedor fake exclusivamente para pruebas/local staging y cuatro pruebas unit-like del adaptador. No se configuraron OAuth client/refresh token, no se enviaron correos Gmail y no hubo deploy ni bump de versión.

## 2026-09-21 — PROD-001 Production Separation & Post-Recovery Baseline (`v0.1.2`, pre-cutover)

- Respaldada fuera del repositorio la D1 pública `vecidya-staging` y verificados su inventario, migraciones `0000`–`0009` e invariantes de identidad, organización, membresía, autoridad de plataforma y perfil publicado.
- Creada `vecidya-prod` (`8edc3f04-258e-4c29-9f33-76fec3d25042`) y clonada mediante migraciones más exportación de datos, con paridad de conteos y relaciones críticas comprobada.
- Preparada la separación explícita de Wrangler: producción apunta al nuevo D1 y `env.staging` conserva `vecidya-staging`; se añadió `APP_ENV` y fallback de origen para staging.
- Endurecidas las pruebas remotas: requieren intención explícita, `TARGET_ENV=staging`, Worker dedicado `vecidya-platform-staging` y `D1_NAME=vecidya-staging`; rechazan hosts y D1 productivos.
- `v0.1.2` es versión de código preparada, no publicada. No hubo deploy, cutover, rotación de secretos ni mutación destructiva de `vecidya-staging`.

## 2026-09-21 — PROD-001B Production Cutover (`v0.1.2`)

- Desplegado `vecidya-platform` con Version ID `2b655f6b-b2ad-461d-9231-fdb96221dfd0`; Wrangler confirmó `DB=vecidya-prod`, UUID `8edc3f04-258e-4c29-9f33-76fec3d25042`, `APP_ENV=production` y rutas `vecidya.com`/`www.vecidya.com`.
- Smoke HTTP anónimo PASS para `/`, `/vecindario`, `/vecindario/vecidya`, `/login`, `/robots.txt`, `/sitemap.xml`, redirect `www` → apex y footer público `0.1.2`.
- `vecidya-staging` permanece existente y preservada; no se ejecutaron E2E remotos destructivos ni se rotaron secretos.

## 2026-09-21 — PROD-001C Authenticated Production Verification

- Verificación manual autorizada en `https://vecidya.com` con `hola@vecidya.com`: login PASS, `/app` PASS y `/app/internal` PASS.
- El flujo `/login → /app → /app/internal` confirmó sesión, organización activa y autorización `platform_admin` contra la producción ya conectada a `vecidya-prod`.
- `/app/business-profile`, `/app/organization` y `/app/internal/businesses` no fueron rechecados en este smoke; no bloquean el cierre de la separación de producción.
- PROD-001 queda **CERRADA**. Version impact: **NONE**. No se ejecutó deploy adicional.

## 2026-09-21 — AUTH-BOOTSTRAP-001 / acceso administrativo

- Recuperada la cuenta existente `hola@vecidya.com` mediante un bootstrap efímero protegido por secreto Cloudflare, usando el hashing y adapter de Better Auth; la contraseña no se guardó en texto plano ni en documentación.
- Comprobados manualmente el login, `/app` y `/app/internal`; `hola` quedó como `platform_admin` activo y `owner` de `Vecidya`.
- Eliminado `soporte@vecidya.com` de la D1 pública junto con sus sesiones, credenciales y membresía en cascada; no quedaron filas de soporte.
- Retiradas las rutas temporales de recuperación y rotación; eliminado el secreto bootstrap. Version ID final: `f8936f89-ef27-4d50-ae56-1b6e4ba35fed`; migraciones remotas no ejecutadas; version impact: **NONE**.

## 2026-09-20 — RP-001A Real Proof / Local Validation

- Añadido `tests/e2e/rp-001a-local-real-proof-check.mjs` como procedimiento reproducible y efímero para validar localmente los tres casos documentados (Edgar/SURA, Asesorar-T y Agrofanescol) sin versionar secretos, datos privados ni publicar pilotos.
- Validado: organizaciones y membresías locales, cambio de contexto, aislamiento cross-tenant, borradores, bloqueo de publicación incompleta, exclusión de Vecindario y ausencia de JSON-LD en perfiles no publicados. Los datos desconocidos permanecen vacíos o `MISSING / UNCONFIRMED`.
- RP-001A: **PASS LOCAL**. Remote D1, publicación remota, deploy y verificación de producción: **NOT PERFORMED**. Version impact: **NONE**.

## 2026-09-20 — PERF-001 Image & Asset Optimization (`v0.1.1`)

- Optimización compatible de assets visuales: inventario inicial de 18 raster PNG, conversión selectiva de 14 assets activos a WebP y conservación del ícono canónico de marca y 3 recursos seleccionados sin uso.
- Reducción de `18,649,999` a `4,369,378` bytes: ahorro de `14,280,621` bytes (`13.619 MiB`, `76.57 %`). Se actualizaron las referencias TS/TSX/CSS, se declararon dimensiones de contenido y se aplicó lazy loading únicamente below-the-fold.
- Validación local: typecheck, build, `git diff --check`, 17 E2E heredados y QA visual desktop/móvil sin imágenes rotas ni overflow. Deploy: **NO**; producción: **NOT PERFORMED**.

## 2026-09-20 — Política de versionado visible

- Añadido `PlatformFooter`, con versión derivada de `package.json` y copyright `© 2026 Vecidya`, compartido por páginas públicas, `/app` y administración interna.
- La política operativa de versiones y publicaciones queda documentada en `AGENTS.md` y `ENVIRONMENTS.md`: una versión publicada exige deploy autorizado y comprobación HTTP anónima fechada.

## 2026-09-20 — Migración a repositorio limpio

- El proyecto actual se separa del historial anterior para publicar un snapshot inicial limpio en `adsmanager-dev/Vecidya`.
- Se conservan código, documentación, configuración, migraciones y pruebas versionadas; se excluyen dependencias generadas, artefactos de build y secretos mediante `.gitignore`.

## 2026-09-20 — RR-001 Release Readiness & Test Baseline

- Corregidos los tests locales stale para usar el binding D1 `DB`, añadido `test:e2e` secuencial y guardas que rechazan destinos remotos; las pruebas remotas exigen `RUN_REMOTE_E2E=1` y permanecen fuera del runner local.
- Corregido PX-B: locators, cliente de sesión, fixture de logo local, repetición por viewport y overflow responsive real de `/app/organization` en 360 px. El flujo de login fija la primera organización mediante Better Auth y la API protege perfiles publicados contra actualizaciones incompletas; el retiro de membresías limpia sesiones activas obsoletas.
- Validación RR-001: `pnpm run test:e2e` **17 PASS / 0 FAIL / 0 SKIP** sobre D1 local limpia; `pnpm run typecheck` PASS; `pnpm run build` PASS; `git diff --check` PASS. No hubo deploy, push, D1 remoto ni migraciones remotas.

## 2026-09-20 — Baseline 2026-09-20 (auditoría y reconciliación)

- Auditoría de solo lectura del repositorio real (código, schema, 10 migraciones, 39 rutas, 25 archivos de prueba, configuración, historial Git) y reconciliación de toda la documentación contra ese código. No se implementó producto, no se creó schema ni migraciones, no se desplegó, no se usó `--remote` y no se tocaron datos reales.
- Validación ejecutada: `git diff --check` limpio; `pnpm run typecheck` PASS; `pnpm run build` PASS; D1 local con migraciones `0000`–`0009`; 12 pruebas E2E locales, **11 PASS / 1 FAIL** (`px-b`: defectos del propio script). Las 2 pruebas remotas y las 9 con nombre D1 obsoleto no se ejecutaron. Detalle en `TESTING.md`.
- Estado público verificado con peticiones anónimas de solo lectura: todas las rutas públicas 200; `/aprende` 404; `www` → apex 301; rutas privadas y APIs 302 → `/login`; `/app/internal/audit` 404. Conclusión: el sitio público **no** contiene el código de `0007`–`0009` (2026-09-07); el sitemap lista 10 URLs con un único vecino real (Vecidya).
- Hallazgos principales: `main` está 35 commits por delante de `origin/main`; `vecidya.com` corre sobre infraestructura staging; 8 archivos de prueba usan el D1 obsoleto `vecidya-dev`; las dos pruebas remotas escriben en la D1 pública; el login no fija organización activa; las invitaciones no pueden aceptarse sin verificación de email; el piloto de Edgar no es reproducible desde el repositorio; el test de app cliente (`px-b`) nunca completa; el Diagnóstico y el sitemap/robots no tienen pruebas. Ver `STATUS.md → Open Debt`.
- Documentación: 13 documentos activos (máximo 20). `STATUS.md` pasa de una tabla de fases con evidencia en celdas a matriz de capacidades + fases declaradas vs reconciliadas + Open Debt; `PROJECT_STATE.md` recoge inventario de Home, campos de Business Profile, capacidades de Admin, piloto y mapa de producto (actual vs FUTURE); `STRUCTURE.md` incorpora el inventario de las 39 rutas; `DATABASE.md` documenta las 16 tablas y elimina narrativa obsoleta de `vecidya-dev`; `ENVIRONMENTS.md` separa Local/Development/Staging/Public/Production; `ARCHITECTURE.md` documenta los dos sistemas de autorización y lo FUTURE; `ROADMAP.md` queda solo con trabajo futuro y un nuevo orden; **nuevo** `TESTING.md` (vacío real: no existía inventario ni instrucciones de pruebas); `docs/README.md` se fusionó en `vecidya-platform/README.md`; `GOVERNANCE.md` sube el límite de 15 a 20, añade vocabulario de capacidades y niveles de evidencia.
- Correcciones a afirmaciones anteriores (la historia no se reescribe; se anota aquí): la entrada de 2026-09-07 «PRODUCT-EVOLUTION-001 Bloque A» afirmó que los documentos canónicos no contenían afirmaciones contradichas por el código — el baseline halló varias (README de plataforma, conteo de pruebas con `vecidya-dev`, selector de organización, «integraciones read-only»); «verificado con datos reales» del bloque E1 no es reproducible; «TEST-002 runner estabilizado» ya no se sostiene.

## 2026-09-07 — Reestructuración del árbol `b1` (commit `ec79b22`, sin documentar en su momento)

- Eliminó del control de versiones ~1.250 archivos: `archive/` (snapshots históricos y experimentos), `resources/assets/` (biblioteca fuente de assets de marca) y `resources/README.md`. Recuperables desde el historial (`git show ec79b22^:resources/assets/…`). Dejó obsoletas las referencias de `README.md` y `AGENTS.md` a esos directorios (corregidas en el baseline).
- Añadió `vecidya-platform/vecidya-platform.zip` (37,9 MB; snapshot de 2026-08-27 que no incluye `0007`–`0009`; sin archivos de secretos por nombre) y el script `product-experience-b-client-app-check.mjs` (nunca terminó de pasar; ver `TEST-PXB-001`).

## 2026-09-07 — Commit `179784a` «test: validate real business pilot readiness»

- A pesar del prefijo `test:`, modificó solo cuatro Markdown (`CHANGELOG`, `PROJECT_STATE`, `ROADMAP`, `STATUS`); no añadió ninguna prueba ni fixture del piloto.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque E1

- `Real Business Pilot — Local Real-Data Readiness`: construidos localmente, con fixtures efímeros eliminados al finalizar, los tres negocios reales de Edgar como organizaciones independientes (Edgar owner de las tres): "Edgar | Asesor de Seguros SURA", "Asesorar-T" y "Agrofanescol". Sin código, schema ni migraciones nuevas — bloque de validación de datos reales sobre la arquitectura ya cerrada (Bloques B, C1, C2, D1).
- Ningún dato faltante fue inventado: sin WhatsApp (no asumido del teléfono confirmado), sin email, sin sitio web, sin redes sociales, sin horarios, sin cobertura, sin logo. No se realizó investigación externa automática.
- Verificado con datos reales: aislamiento multi-organización sostenido entre las tres organizaciones; perfil público, filtro por categoría y JSON-LD (sin `sameAs` ni WhatsApp inventados) correctos; gobierno de plataforma (verificar, badge público, suspender → 404 y exclusión del directorio, reactivar, audit log) ejecutado sobre un caso real.
- No se creó ninguna cuenta real de Edgar: no se dispone de su email real y no se inventó uno; se usó una identidad de fixture local claramente sintética, eliminada al finalizar. Este es un bloqueo real registrado para `Bloque E2`, no una omisión.
- Clasificación de readiness: Organización A (`Edgar | Asesor de Seguros SURA`) queda `BLOCKED` por riesgo de implicar afiliación oficial con SURA sin acreditación confirmada — no por falta de datos de contacto. Organización B (`Asesorar-T`) queda `PARTIAL`, bloqueada específicamente por tener dos nombres públicos candidatos sin confirmación explícita del usuario. Organización C (`Agrofanescol`) queda `PARTIAL`, publicable honestamente; sirvió además como stress test de dominio: su naturaleza de ecosistema/comunidad agropecuaria encaja de forma imperfecta en el modelo `BusinessProfile` actual (categoría y CTA únicos para un negocio, no para una comunidad con múltiples facetas) — evidencia registrada, sin crear `CommunityProfile` ni ningún tipo de perfil nuevo.
- Registrada la deuda `PILOT-IDENTITY-001` (email real de Edgar pendiente), `PILOT-NAME-ASESORAR-T` (nombre público pendiente de confirmación) y `PILOT-BRAND-SURA` (autorización de marca pendiente) en `PROJECT_STATE.md`.
- Sin deploy, sin escritura remota, sin `--remote`. `pnpm run typecheck`, `pnpm run build` y `git diff --check` no encontraron cambios de código que validar, consistente con que este bloque no tocó código de producto.
- Bloque cierra con `REMOTE PILOT AUTHORIZATION REQUIRED`: `Bloque E2 — Remote Pilot Publication` no se ejecuta sin autorización explícita del usuario y sin resolver `PILOT-IDENTITY-001`.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque D1

- `Admin Governance Foundation`: añadida migración aditiva `0009_platform-profile-governance.sql` con dos tablas nuevas, deliberadamente separadas de `business_profile` (no columnas adicionales) para que ninguna escritura tenant pueda tocarlas: `business_profile_governance` (verificación `unverified`/`verified`, estado de plataforma `active`/`suspended`) y `platform_audit_log` (actor, acción, entidad, organización, valor previo/nuevo, timestamp).
- Cada acción de gobierno (verificar, retirar verificación, suspender, reactivar) escribe la fila de gobierno y su fila de auditoría en un único `database.batch([...])` atómico de D1, evitando el estado "perfil cambió pero audit no existe".
- `/app/internal/businesses/:id` gana las cuatro acciones administrativas, mostrando solo las válidas según el estado actual (nunca "Verificar" sobre un perfil ya verificado, nunca "Suspender" sobre uno ya suspendido), con confirmación del navegador para suspender/reactivar por su impacto en visibilidad pública.
- Nueva página `/app/internal/audit` (y nueva entrada de navegación en `AdminShell`) lista la actividad administrativa global; el detalle de cada perfil muestra además su propia actividad contextual.
- Perfiles suspendidos dejan de listarse en `/vecindario` y su página pública devuelve 404 real (sin JSON-LD), vía `LEFT JOIN` con `business_profile_governance` en las consultas públicas (`getPublishedBusinessProfileBySlug`, `listPublishedBusinessProfiles`, `getPublishedBusinessProfileFilterOptions`). El tenant conserva sus datos, ve una señal de solo lectura "Estado de plataforma: Suspendido" en `/app/business-profile`, y republicar no revierte la suspensión porque esa tabla nunca la escribe.
- Perfiles verificados muestran "✓ Perfil verificado por Vecidya" en su página pública y un badge en el listado interno; el copy evita cualquier claim de garantía, certificación legal, solvencia o recomendación comercial. Ninguna propiedad JSON-LD de "verified" se inventó.
- Toda mutación de gobierno sigue `session → requirePlatformAdmin → resource lookup → mutation → audit`; probado con HTTP directo que un owner o admin de organización sin `platform_member` recibe 403, y que un `platform_admin` con `status=inactive` también recibe 403.
- Añadido `tests/e2e/product-evolution-001-d1-admin-governance-check.mjs`, cubriendo las 20 verificaciones del bloque (autorización, verificación, suspensión, reactivación) contra Worker+D1 local real; fixtures eliminados al finalizar.
- Corregido, solo en `admin-shell-check.mjs` y `admin-business-profiles-check.mjs` (las dos regresiones requeridas por este bloque), un identificador de D1 local obsoleto (`vecidya-dev`) heredado de antes de `PUBLIC-PROD-DIRECT-001`; el binding real es `DB`. El mismo defecto persiste en otros 6 tests no tocados, registrado como deuda en `PROJECT_STATE.md`.
- Reconfirmadas sin romperlas las regresiones de Business Profile, multi-organización, Contact & Presence (C1) y Business Operations (C2).
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin gestión de usuarios, ban, transferencia de ownership, impersonation, permisos administrativos granulares, appeals, emails de moderación, galería, R2, reviews, CRM, GHL ni Agency.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque C2

- `Real Business Profile — Business Operations`: añadida migración aditiva `0008_business-profile-operations.sql` con `service_mode` y `service_area` (opcionales) en `business_profile`, y tabla nueva `business_hours` (una fila por día de la semana, ancla `organization_id`, índice único `(organization_id, day_of_week)`). Sin coordenadas, radios, polígonos, geocoding ni mapas interactivos, conforme al alcance mínimo definido.
- Confirmado en auditoría previa que `city`/`country` representan la ubicación de referencia del negocio (mostrada y usada como filtro del Vecindario), sin contradicción respecto al nuevo `service_area`; no fue necesario redefinir su semántica.
- Elegida la alternativa de campo de texto libre para `service_area` (en vez de tabla hija) tras comprobar que los cinco casos objetivo (negocio local, profesional regional, servicio departamental, servicio nacional, híbrido presencial+remoto) se expresan correctamente sin estructura adicional.
- `business_hours` admite día abierto, día cerrado explícito (`is_closed`) y día sin definir (ausencia de fila); no admite dos turnos por día, festivos ni excepciones temporales, fuera de alcance de este bloque.
- `/app/business-profile` añade la sección "Cómo y dónde atiendes" (modalidad + cobertura) en el formulario principal, y una sección "Horarios" independiente con guardado propio (`intent=save-hours`) que reemplaza el set completo de 7 días en cada guardado.
- `/vecindario/:slug` muestra Cómo atiende/Cobertura solo cuando existen y compacta horarios agrupando días consecutivos con horario idéntico (p. ej. "Lun–Vie · 09:00–18:00"), sin fabricar continuidad sobre días sin definir ni mostrar bloques vacíos.
- JSON-LD `LocalBusiness` añade `areaServed` (Text, mapeo válido según Schema.org) y `openingHoursSpecification` únicamente con días realmente abiertos; los días cerrados o sin definir no se emiten.
- `BusinessCardV2` (tarjetas del Vecindario) queda sin cambios y sin filtros nuevos, tal como se definió el alcance.
- Añadido `tests/e2e/product-evolution-001-c2-business-operations-check.mjs`: validación y rechazo de modalidad/horarios inválidos, trim de cobertura, guardado/actualización/reload de horarios en sus tres estados (abierto, cerrado, ausente), aislamiento tenant de los tres campos en el editor privado, jerarquía y compactación del perfil público, JSON-LD sin datos vacíos, y ausencia de overflow horizontal en el editor de horarios (360px) y el perfil público (360/390/desktop); fixtures locales eliminados al finalizar.
- Reconfirmadas sin modificarlas las regresiones de Business Profile, Contact & Presence (C1) y aislamiento tenant multi-organización.
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin galería, R2, verificación, moderación, audit log, reservas, calendario, CRM, GHL ni Agencia.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque C1

- `Real Business Profile — Contact & Presence`: añadida migración aditiva `0007_business-profile-contact-presence.sql` con cuatro columnas opcionales en `business_profile`: `whatsapp`, `instagram_url`, `facebook_url`, `linkedin_url`. Sin datos existentes modificados, sin reset de perfiles, sin campos requeridos nuevos, aplicada únicamente en D1 local.
- WhatsApp se normaliza a formato internacional (`+<8-15 dígitos>`, tolerando espacios/guiones/paréntesis en la entrada) y el perfil público genera el enlace `https://wa.me/<dígitos>` sin asumir indicativo de país.
- Instagram, Facebook y LinkedIn se validan como URL HTTPS/HTTP contra el host esperado de cada plataforma (`instagram.com`, `facebook.com`/`fb.com`, `linkedin.com`); rechazan esquemas inseguros y hosts ajenos.
- `/app/business-profile` añade la sección "Contacto y presencia digital" sin duplicar teléfono/email/web ya existentes.
- `/vecindario/:slug` prioriza WhatsApp → Teléfono → Web como CTA principal (sin cinco acciones con el mismo peso) y muestra Instagram/Facebook/LinkedIn como enlaces secundarios de presencia digital, solo cuando existen.
- JSON-LD `LocalBusiness` añade `sameAs` únicamente con las redes reales publicadas, sin arreglos vacíos; WhatsApp no se transforma en `sameAs`.
- `BusinessCardV2` (tarjetas del Vecindario) queda sin cambios, tal como se definió el alcance.
- Añadido `tests/e2e/product-evolution-001-c1-contact-presence-check.mjs`: validación y rechazo de valores inválidos (UI y API), guardado y reload, aislamiento tenant de los campos nuevos entre dos organizaciones, jerarquía de CTA pública, `wa.me` correcto sin asumir Colombia, `sameAs` sin huecos, y ausencia de overflow horizontal en 360 px/390 px/desktop.
- Reconfirmadas sin modificarlas las regresiones de Business Profile, aislamiento tenant multi-organización y readiness del perfil público real.
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin horarios, galería, R2, cobertura geográfica avanzada, verificación, moderación, reviews, CRM, GHL ni Agencia.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque B

- Cerrada `Multi-Business Foundation`: formalizó documentalmente en `ARCHITECTURE.md` la arquitectura multi-organización que ya existía en código (`member` no restringe un usuario a una sola organización; `session.active_organization_id` selecciona contexto sin modelar ownership).
- Añadido `tests/e2e/product-evolution-001-b-multi-organization-check.mjs`: un mismo usuario propietario de dos organizaciones publica `BusinessProfile` y `organization_service` aislados por tenant, cambia de organización activa, `/app` y el selector reflejan la organización activa, el contexto se restaura al volver a la primera organización, y mutaciones de control en una organización no contaminan la otra en ninguna dirección.
- Auditado el selector de organización de `/app`; funciona correctamente (lista todas las organizaciones del usuario y marca la activa) y se conserva sin cambios (KEEP).
- Reconfirmadas sin modificarlas las regresiones existentes de Business Profile (`business-profile-experience-check.mjs`) y Services (`services-experience-check.mjs`).
- Reconciliado `ROADMAP.md` para que `PRODUCT-EVOLUTION-001` quede como secuencia activa inmediata y `PRODUCT-EXPERIENCE-001 B` pase a en espera; `Real Proof`/vecinos externos se reposiciona como piloto posterior a Business Profile/Admin Readiness.
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin schema, migración, roles nuevos, segundo sistema de tenancy, `agency`, cambios en Admin ni deploy.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque A

- Ejecutada auditoría de convergencia de producto (`Current Product Convergence Audit`) sobre el estado real de `main`, exclusivamente de lectura: sin cambios de código, schema, migraciones, configuración, assets, CSS, rutas, tests, datos ni documentación.
- Confirmado con evidencia ejecutable que multi-organización por usuario, cambio de organización activa, aislamiento tenant de `BusinessProfile`/`organization_service` y separación de `platform_member` respecto a `member.role` ya existen y funcionan en el código actual; los ocho documentos canónicos auditados no contenían afirmaciones contradichas por el código.
- Identificados gaps reales sin implementarlos: Home pública sin búsqueda ni datos reales, `BusinessProfile` sin WhatsApp/redes sociales/horarios/galería/cobertura/verificación, y Administración interna sin moderación, verificación ni audit log.
- Entregado el informe de auditoría directamente en la conversación, sin crear Markdown nuevo.

## 2026-08-27 — PRODUCT-EXPERIENCE-001 Bloque A

- Abierta la revisión funcional `PRODUCT-EXPERIENCE-001 — Web + Client + Agency Review`.
- `PUBLIC-GROWTH-001 Bloque C2` permanece abierto para vecinos externos, pero deja de bloquear el desarrollo general.
- El perfil público ahora conecta explícitamente hacia `Vecindario`, `Servicios`, `Diagnóstico` y `Contacto` como recorrido de producto.
- Añadido E2E local del recorrido `Home → Vecindario → perfil Vecidya → Servicios → Diagnóstico → Contacto` en desktop 1366 y móvil 390/360 px, con búsqueda, filtro, CTAs, email, web, metadata, JSON-LD y ausencia de patrones ficticios.
- Corregida la referencia histórica a D1 remoto sin perfiles publicados para que no contradiga el estado actual de Vecidya publicada.
- Sin schema, migraciones, CRM, métricas, ratings, perfiles inventados ni cambios de arquitectura.

## 2026-08-27 — PUBLIC-PROD-DIRECT-001

- Reconfigurado `wrangler.jsonc` para que `wrangler deploy` publique directamente el Worker top-level `vecidya-platform` en `vecidya.com/*` y `www.vecidya.com/*`.
- Eliminado `env.staging` como destino operativo del dominio público para evitar despliegues ambiguos con bindings dev/staging.
- Movidos `DB=vecidya-staging`, `APP_URL=https://vecidya.com` y `BETTER_AUTH_URL=https://vecidya.com` a top-level.
- Regenerado `worker-configuration.d.ts` desde la configuración pública directa.
- Movidas las rutas públicas desde `vecidya-platform-staging` hacia `vecidya-platform`; `wrangler deploy` normal quedó validado con Version ID `6cca1801-d638-4b6f-9849-ae9681716e6a`.

## 2026-08-27 — PUBLIC-GROWTH-001 Bloque C2

- Publicada Vecidya como primer vecino real de dogfooding en `https://vecidya.com/vecindario/vecidya`.
- Creadas cuentas reales `soporte@vecidya.com` y `hola@vecidya.com`; ambas quedaron como `admin` de la organización Vecidya y `platform_admin active` para administración interna.
- El perfil público usa datos autorizados: categoría `Servicios digitales y desarrollo empresarial`, Medellín, Colombia, email `hola@vecidya.com`, web `https://vecidya.com` y logo aprobado.
- Validado en remoto `/vecindario/vecidya`, búsqueda, filtro por categoría, asset de logo, JSON-LD `LocalBusiness`, acceso privado y acceso a administración interna con ambas cuentas.
- Desplegado el Worker público `vecidya-platform-staging` como deploy de bloque; Version ID `3159c989-1034-444d-b2e0-8d4ccd7357a4`.
- C2 permanece abierta: Vecidya valida dogfooding, pero el cierre requiere vecinos externos reales.

## 2026-08-27 — PUBLIC-GROWTH-001 Bloque C1

- Ejecutado `Real Profile Readiness` para comprobar el flujo usuario → organización → BusinessProfile → publicación → Vecindario.
- Añadido gate E2E local para validar creación, edición, publicación, slug único, aislamiento tenant por API, exclusión de borradores, filtros del directorio, perfil público, campos opcionales ausentes y JSON-LD `LocalBusiness`.
- Protegida la escritura de `BusinessProfile` contra slugs usados por otra organización antes de llegar a la restricción de D1, devolviendo error 400 claro.
- Confirmado que el schema actual es suficiente para los primeros perfiles comerciales reales; no hubo migraciones, CRM, persistencia nueva, perfiles universales, datos ficticios ni deploy.

## 2026-08-26 — PUBLIC-GROWTH-001 Bloque B

- `/servicios` pasa de descripciones comprimidas a fichas comprables por área.
- Cada servicio presenta `Problema`, `Cómo puede ayudar Vecidya`, `Qué puedes recibir` y `Cuándo tiene sentido`.
- Los entregables se describen como posibilidades reales según situación, sin crear paquetes cerrados, precios, garantías comerciales ni datos ficticios.
- Reforzada la regla consultiva: primero se entiende la necesidad, después se decide si tecnología, CRM, automatización o integración aporta valor.
- Sin cambios de arquitectura, CRM, schema, auth, persistencia, datos ni rutas.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `64e41d4b-0471-4357-b7ab-a99be99a2406`.

## 2026-08-26 — PUBLIC-GROWTH-001 Bloque A

- Abierta la etapa `PUBLIC-GROWTH-001` con foco en conversión del Diagnóstico, no en rediseño global.
- `/diagnostico` comunica antes de empezar qué recibirá la persona: posición digital, fortalezas, oportunidades y hasta tres próximos pasos.
- Eliminado el contador de respuestas activas del panel inicial para evitar lenguaje técnico/debug.
- Reforzado el cierre del resultado con resumen de posición digital y área prioritaria.
- Cambiado el CTA principal del resultado a `mailto:hola@vecidya.com` prellenado en cliente con tipo de presencia, posición digital, área prioritaria y objetivo marcado.
- Se mantiene el alcance del Diagnóstico: sin cambios de preguntas, branching, scoring, persistencia, schema, auth, API, CRM ni almacenamiento de respuestas.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `60ee26d1-76ac-4e48-8b25-6fc683f116a1`.

## 2026-08-26 — DIAG-RUNTIME-001 scoring polish

- Revisado el motor del Diagnóstico con combinaciones múltiples por tipo de presencia.
- Ajustado scoring para que objetivos como visibilidad, confianza, contactos, claridad y comunidad impacten sus dimensiones correspondientes.
- Corregidos obstáculos que antes pesaban poco o nada en resultado: pocos contactos y falta de tiempo.
- Añadidas prioridades específicas para respuestas débiles por perfil: prueba profesional ausente, baja consistencia de creador, canal comunitario ausente, transparencia pública dudosa y ubicación no clara.
- Priorizados los próximos pasos críticos para que no queden ocultos por el límite de tres recomendaciones.
- Verificado en local y remoto que las combinaciones no muestran `NaN`, `undefined`, más de tres próximos pasos ni overflow móvil.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `746b2749-4ff0-48d9-8f5a-8ced8d9676ad`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque E

- Ejecutado el QA final público sin añadir features, rediseño, copy nuevo, schema, auth, tenancy, CRM, persistencia ni datos ficticios.
- Verificadas por HTTP real las rutas `/`, `/diagnostico`, `/vecindario`, `/servicios`, `/que-debes-saber`, `/sobre-nosotros`, `/unete`, `/contacto` y `/privacidad` con status 200, metadata, canonical, Open Graph, footer global nuevo y ausencia de patrones prohibidos.
- Verificado `www.vecidya.com` con redirect 301 a `https://vecidya.com/`.
- Verificados `/robots.txt`, `/sitemap.xml`, sitemap sin rutas privadas, `Organization` JSON-LD y ausencia de `Review`, ratings o artículos ficticios.
- Verificada matriz responsive remota en 360 px, 390 px, tablet y desktop sin overflow horizontal y con un H1 por ruta.
- Verificados enlaces internos, `mailto:hola@vecidya.com`, login/register y empty state del Vecindario.
- Verificado Diagnóstico en las siete puertas de entrada, volver/cambiar respuesta, multiselección, opciones exclusivas, resultado, confianza, CTAs y máximo tres próximos pasos.
- D1 remoto confirma cero perfiles publicados y seis perfiles en draft, por lo que el perfil publicado remoto queda no verificable sin inventar inventario; `/vecindario/:slug` inexistente devuelve 404.
- `PUBLIC-WEB-CONTENT-001` queda cerrada con evidencia técnica vigente y deploy público `b76963a4-6b11-42f0-838a-afa49365e4fe`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque D2

- Implementada la experiencia visual del ecosistema público restante sin tocar Home, motor de Diagnóstico, schema, auth, tenancy, CRM ni persistencia.
- Ajustado hotfix visual de Home para separar el hero del bloque Vecindario y evitar que ambos se perciban pegados en escritorio.
- Vecindario gana hero de exploración, búsqueda protagonista, empty state honesto y CTA para negocios sin crear inventario artificial.
- Perfil público queda preparado para datos completos o escasos con jerarquía visual, logo/fallback, contacto existente y detalles publicados reales.
- Servicios refuerza la lectura `problema → Vecidya → resultado` y publica la corrección “No vendemos tecnología innecesaria”.
- Aprende, Nosotros, Únete y Contacto reciben estructura visual más coherente con categorías editoriales futuras, equipo/propósito, rutas de inicio y canal real de correo.
- Verificado footer global compartido en rutas públicas y ausencia de la cadena antigua “Comunidad digital para negocios locales.”.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `b76963a4-6b11-42f0-838a-afa49365e4fe`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque D1

- Iniciado el salto visual de Home y Diagnóstico sin cambiar narrativa, motor, datos, auth, schema, tenancy ni persistencia.
- Home incorpora más lenguaje visual Vecidya mediante mapas, pines, fondos por intención y jerarquía diferenciada para Diagnóstico, Servicios, Para quién y Aprende.
- Diagnóstico mejora su experiencia visual con panel de estado, progreso lineal, etapas, tarjetas de respuesta con selección explícita, estados interactivos y resultados diferenciados por dimensiones, fortalezas, oportunidades y próximos pasos.
- Se mantiene una pregunta por pantalla, respuestas efímeras en cliente y ausencia de captación o persistencia.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `835f2ea0-2917-4088-adb4-17421484870e`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque C

- Aplicada consistencia transversal sin crear documentos nuevos ni tocar schema, auth, tenancy, CRM o persistencia del diagnóstico.
- Actualizada la definición corta global de Vecidya en footer y metadata base.
- Corregido el CTA final de Home para evitar tres botones principales compitiendo en el bloque oscuro: Diagnóstico y Vecindario quedan como acciones; Contacto queda como enlace contextual.
- Añadido redirect permanente `www.vecidya.com` → `vecidya.com` en la frontera del Worker para evitar copias públicas divergentes.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `8d3bd7f7-4d05-443a-a251-5d914cb6ec63`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque B

- Aplicado copy público definitivo sin rediseño visual ni cambios de CSS.
- Home conecta Vecindario, problema, Diagnóstico, Servicios, público objetivo, Aprende, FAQ y CTA final.
- Servicios se reescribió con estructura `Problema → Vecidya → Resultado` y se corrigió “No vendemos tecnología innecesaria”.
- Únete separa autodiagnóstico y conversación directa como rutas de inicio.
- Contacto queda centrado en hablar con Vecidya por correo, con Diagnóstico como alternativa previa.
- Aprende incorpora la taxonomía editorial inicial: empezar, organizar y entender.
- Vecindario y perfiles públicos mantienen el criterio de datos reales y alinean CTAs con Diagnóstico/Contacto.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `396530d8-3cb8-448b-969f-9a91f9d571a4`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque A

- Reconciliado el estado documental de `/diagnostico`: ya está publicado en `vecidya.com` como autodiagnóstico anónimo y efímero sin persistencia.
- Cerrada la deuda abierta `DIAG-DEPLOY-001` en la documentación activa; producción final con D1 propio sigue fuera de alcance.
- Integrado Diagnóstico en la narrativa de Home como punto de partida entre problema, servicios y siguientes pasos.
- Corregidos CTAs de Servicios y Contacto para que “diagnóstico” apunte a `/diagnostico`, no a `/unete`.
- Reposicionada Únete como ruta para iniciar proceso o hablar con Vecidya después de entender el punto de partida.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `5d0c3158-d7df-44f3-ba76-d1438235ddff`.

## 2026-08-26 — DOC-RECON-001

- Reconciliada la documentación activa a 14 archivos Markdown, por debajo del máximo de 15 solicitado.
- Consolidado el contenido vigente de fases, ADRs, planes, diagnóstico, web pública, SEO/GEO, staging, privacidad, navegación, assets y saneamiento de confianza en `PROJECT_STATE.md`, `STATUS.md`, `ARCHITECTURE.md` y `ROADMAP.md`.
- Eliminadas fuentes Markdown duplicadas, históricas o reemplazadas para evitar estados paralelos.
- Actualizadas las reglas de gobierno para no crear nuevos documentos de fase, ADRs, planes o reportes Markdown sin autorización explícita.

## Estado consolidado previo

- Public Experience V2 quedó cerrada con PASS técnico/documental.
- SEO/GEO público quedó implementado con robots, sitemap, favicon y structured data base.
- La entrega pública previa quedó desplegada en `vecidya-platform-staging`, `vecidya.com` y `www.vecidya.com` sobre D1 `vecidya-staging`.
- `PUBLIC-TRUST-SANITIZATION-001` despublicó perfiles de prueba visibles y saneó copy/assets públicos donde no existían reviews o ratings reales.
- `DIAG-RUNTIME-001` implementó `/diagnostico` como autodiagnóstico anónimo y efímero; el estado vigente está reconciliado en la entrada `PUBLIC-WEB-CONTENT-001 Bloque A`.
- `/privacidad`, `/sobre-nosotros`, `/que-debes-saber` y la navegación pública están implementadas.
- `7B.2` invitaciones sigue bloqueada por configuración externa de correo y demostración de delivery real.
