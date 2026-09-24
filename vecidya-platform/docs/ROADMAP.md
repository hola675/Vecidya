# Roadmap

Última reconciliación: 2026-09-24 (VIS-001A y VIS-001B cerrados en local, versión local `0.4.2`; DIAG-002C + UX-003.1–003.5 siguen publicados en `0.4.1`; OPS-001 documental; follow-up de verificación/invitaciones permanece separado).

Este documento contiene **solo trabajo futuro**. Nada aquí está implementado ni autorizado por existir en esta lista: cada bloque requiere autorización explícita del usuario. Lo ya hecho vive en [CHANGELOG.md](CHANGELOG.md) y [STATUS.md](STATUS.md).

## Decisiones que solo puede tomar el usuario

| # | Decisión | Por qué bloquea |
| --- | --- | --- |
| G2 | Confirmar si `b1` eliminó `archive/` y `resources/assets` a propósito y cómo recuperar la biblioteca de assets (`git show ec79b22^:resources/assets/…`) | Bloquea Visual System Expansion |
| G3 | Datos y decisiones del piloto: email real de Edgar, nombre público de «Asesorar-T», autorización o ajuste de marca SURA, WhatsApp/web/redes/logo si se quieren mostrar | `PILOT-IDENTITY-001`, `PILOT-NAME-ASESORAR-T`, `PILOT-BRAND-SURA` |
| G4 | Autorizar deploy y migraciones remotas `0007`–`0009` sobre `vecidya-staging` | `PUBLISH-GAP-001`; sin esto nada de lo construido el 2026-09-07 llega al dominio público |
| G5 | — | PROD-001C completó la verificación autenticada |

## Secuencia recomendada (derivada de la evidencia del baseline)

Sobre la hipótesis inicial (baseline → datos del piloto → Real Proof → Home → Visual → Interconexión → Vecindario → Business Profile → Contenido → QA → producción) la auditoría obliga a **dos correcciones**, explicadas abajo.

| # | Bloque | Objetivo | Depende de |
| --- | --- | --- | --- |
| 1 | **PROD-001 / PROD-001B / PROD-001C** | Separar D1, backup, paridad, guards, cutover y verificación autenticada | cerrado |
| 2 | **EMAIL-001** | Correo y verificación transaccional | PROD-001 y decisiones de correo |
| 3 | **OPS-001** | Fundar y validar documentalmente el piloto HighLevel | EMAIL-001 — **PASS DOCUMENTAL; cuenta real pendiente** |
| 4 | Pilot Data & Authorizations | Resolver G3; sin código | OPS-001 / usuario |
| 5 | **OPS-002** | Implementar el piloto GHL mínimo tras autorización | OPS-001, cuenta/cliente/datos |
| 6 | **Real Proof (E2)** | Publicar vecinos reales con datos autorizados | 4, G3 |
| 7 | **UX-001B.1 / UX-001B.2** | Arquitectura visual e implementación de Home, assets y metadata social | Independiente de 4–6; **cerrado / PASS técnico local** |
| 8 | **UX-001B.3** | Vecindario: búsqueda, filtros, cards, estados vacíos, responsive y accesibilidad | UX-001B.2 — **cerrado / PASS técnico local** |
| 9 | **UX-001B.4** | Perfil público: micrositio del negocio, datos publicados, CTA, SEO y responsive | UX-001B.3 — **cerrado / PASS técnico local** |
| 10 | **UX-001B.5** | Servicios: presentación pública de capacidades Vecidya y alcance honesto | UX-001B.4 — **cerrado / PASS técnico local** |
| 11 | **UX-001B.6** | Diagnóstico: interacción, progreso, accesibilidad y resultado sobre el motor actual | UX-001B.5 — **cerrado / PASS técnico local** |
| 12 | **UX-001B.7** | Únete + Contacto: entrada institucional y conversación pública | UX-001B.6 — **cerrado / PASS técnico local** |
| 13 | **UX-001B.8** | Sobre nosotros: historia, personas y credibilidad institucional | UX-001B.7 — **cerrado / PASS técnico local** |
| 14 | **UX-001B.9** | Aprende: contenido educativo público y SEO honesto | UX-001B.8 — **cerrado / PASS técnico local** |
| 15 | **UX-001B.10** | Legal & Trust: privacidad, términos y señales de confianza | UX-001B.9 — **cerrado / PASS técnico local** |
| 16 | Visual System Expansion | Ampliar sistema visual y assets fuera de Home | G2; motion visual inicial de Home implementado localmente en 2026-09-23, expansión pendiente |
| 17 | Educational Content | Primeros contenidos reales | UX-001B.9 y autor/fuentes reales |
| 18 | Ecosystem Interconnection | Diagnóstico → contenido/servicio; perfil → relacionados; artículo → diagnóstico/servicio | 6 (vecinos) y 17 (artículos) |
| 19 | Business Profile / UX | Campos, cobertura E2E, a11y y SEO del perfil público | UX-001B.4 y Real Proof |
| 20 | **VIS-001 UI/UX visual audit implementation** | AuthShell compartido; foundations visuales; mejoras públicas específicas a Home, navegación, licencias, addons, Aprende y Vecindario; revisión responsive/accesible de todas las páginas priorizadas | autorizado por solicitud del usuario 2026-09-23; revisión pegada |

**Corrección 1 — RR-001 precede Real Proof.** La evidencia mostró prerrequisitos técnicos: pruebas stale por el nombre D1 obsoleto, PX-B roto, selección de organización al login, limpieza de sesiones tras retirar membresía y protección server-side de perfiles publicados. RR-001 quedó cerrado antes de PERF-001 y permanece separado del deploy y del piloto.

**Corrección 2 — Contenido (6) antes de Interconexión (7).** Las conexiones «Artículo → Diagnóstico/Servicio» y «Diagnóstico → contenido relacionado» no pueden existir sin artículos: hoy hay cero. Interconectar primero produciría enlaces a un hub vacío.

**Nota de estado.** UX-001B.1–UX-001B.10 y UX-001C quedan **CLOSED / PASS técnico local / release ready** en `0.3.0`. UX-002.1 queda **PASS DOCUMENTAL** y UX-002.2–UX-002.7 **PASS técnico local / release ready**. REL-003.1 queda histórica como `0.3.0` LIVE. OPS-001 queda **PASS DOCUMENTAL**, con la cuenta real HighLevel pendiente; GHL continúa pausado y no se inicia OPS-002. DIAG-002/DIAG-002B/DIAG-002C y UX-003.1–003.5 están desplegados como `0.4.1` en staging y producción; la evidencia HTTP anónima está registrada en `ENVIRONMENTS.md`. UX-003.3, UX-003.6 y UX-003.7 continúan pendientes.

**UX-003** fue autorizado por solicitud directa del usuario el 2026-09-23. Se completaron localmente mejoras responsive a Login, dashboard, Admin Home, navegación de las subpáginas cliente y contexto operativo del detalle de negocios. No se cierra el bloque: equipo/invitaciones, listas administrativas, filtros, prueba visual autenticada y QA accesible aún requieren trabajo.

## UX-002 — evolución comercial

## VIS-001 — siguiente trabajo visual y gates

**VIS-001A (auditoría documental, 2026-09-23) y VIS-001B (Foundations Implementation, autorizada y ejecutada 2026-09-24) están cerrados en local.** VIS-001A no cambió producto. VIS-001B sí modificó código: corrigió los tres defectos concretos que la auditoría dejó identificados y consolidó foundation CSS existente, sin nuevas librerías, sin rediseño y sin tocar rutas, modelo comercial, backend ni GHL. Detalle de cierre más abajo. No confundir con VIS-001C (Motion Pilot), que sigue sin autorizar.

### Conflictos que deben reconciliarse antes de ampliar alcance

- **Entrada histórica:** `package.json` y el lockfile fijan fuente `0.4.1`; `ENVIRONMENTS.md` registra HTTP de producción del 2026-09-23. El commit local `032208e` ya contiene AuthShell compartido y motion CSS, sin publicación documentada. No partir de una UI anterior ni inferir publicación porque coincide el número de versión; VIS-001A no repite el smoke remoto.
- **G2 sigue pendiente de decisión:** la fila G2 y la fila 16 conservan el bloqueo histórico de Visual System Expansion. `resources/assets` y `archive` no están en el árbol actual; `public/assets/selected`, `public/assets/about`, `public/assets/learn` y `public/brand` sí proporcionan recursos al código. No se demostró que sustituyan toda la biblioteca histórica ni que haga falta recuperarla. Además, `git cat-file -t ec79b22` falla en este clon: la receta histórica de recuperación no es ejecutable aquí. No cerrar G2, recuperar ni versionar assets automáticamente. La auditoría de lo existente no exige esa recuperación; cualquier expansión de biblioteca sigue detrás de G2.
- **App/Admin:** el encabezado y `STATUS.md` registran entregas UX-003.1/.2/.4/.5, mientras la nota general usa el intervalo ambiguo «003.1–003.5» y declara 003.3 pendiente. `PROJECT_STATE.md` aún conserva descripciones antiguas de shells; la tabla inicial mantiene G4 por migraciones que `STATUS.md` da por publicadas. Estos conflictos se reportan, no se resuelven por inferencia en VIS-001A. Equipo/invitaciones, listas, filtros y QA autenticada siguen separados; no se autorizan aquí. GHL permanece pausado.

### VIS-001B — Foundations Implementation — CERRADA (local, 2026-09-24)

Objetivo cumplido: normalizar la foundation existente sin cambiar familia tipográfica, paleta, modelo comercial, contenido editorial, rutas, backend ni assets, y sin nuevas librerías.

1. **Tokens y tipografía:** se conservaron los valores de `--ink`/`--blue`/`--blue-dark`/`--orange`; los duplicados literales de esos tres colores (29 ocurrencias) se alias-earon a sus tokens. Se consolidaron 60 usos de pesos de fuente arbitrarios (650/750/850/950) a pesos reales (700/800), verificado empíricamente: en Arial, 600–750 renderiza idéntico y 800–950 renderiza idéntico (medición de ancho de glifo en navegador), por lo que el cambio no altera la jerarquía visual. No se introdujo una escala tipográfica nueva ni se tocó la familia de fuente.
2. **Cascada y accesibilidad — corregido y verificado:** el bloque Auth duplicado (`app.css:123–149` y `3886–3917`) se eliminó a una sola declaración. La animación de entrada de `.auth-layout > .auth-card` se movió a `@media (prefers-reduced-motion: no-preference)` (mismo patrón que el resto del archivo) en vez de intentar cancelarla con `.auth-card{animation:none}`, que perdía la guerra de especificidad; verificado en navegador con `prefers-reduced-motion: reduce` real (Playwright): `animationName` y `transform` resuelven a `none`. La deduplicación además reveló que `.auth-brand` resolvía a texto blanco (última de tres declaraciones con la misma especificidad), invisible sobre la tarjeta blanca de `/verify-email`; se corrigió acotando la variante blanca a `.auth-welcome .auth-brand` y verificando el color computado (`rgb(20, 43, 74)`) en runtime.
3. **Contratos visuales:** `Button`/`Card`/`Badge`/`Alert` (`app/components/ui.tsx`) y el contrato de interacción existente (hover ≤1–2px, `transition: none` bajo reduced motion) ya cumplían el criterio; no requirieron cambio. Header/Footer públicos revisados (tokens, foco, hover, versión desde `package.json`): sin hallazgos. Ningún rediseño de App/Admin.
4. **Hallazgos reproducidos y corregidos:** anclas de categorías de Addons (apuntaban a ids inexistentes) corregidas con anclas invisibles posicionadas dentro de la primera tarjeta de cada categoría, verificado con navegación real por hash; grid compacto de Vecindario (1–2 resultados) corregido con una regla `@media (max-width: 760px)` de igual especificidad para forzar una columna en móvil, verificado en runtime a 500px y 1368px. El estado vacío compartido (`.empty-state` sin imagen, `app.css`, consumido por `services-app.tsx` y `internal-audit.tsx`) sí pudo corregirse a nivel de foundation con `:has()` sin tocar lógica de App/Admin — reproducido (el texto quedaba confinado a una columna de 4.25rem/68px) y verificado corregido en runtime, sin necesidad de follow-up UX-003.
5. **Sin rediseño:** no se tocó composición de Login/Registro/About/Aprende; solo foundation compartida.

Evidencia de cierre: `pnpm run typecheck` PASS, `pnpm run build` PASS (CSS `142.86 kB → 143.12 kB` gzip, sin regresión significativa), `pnpm run test:unit` 75/75 PASS, `git diff --check` PASS (solo avisos de fin de línea CRLF/LF preexistentes), E2E `addons-experience-check.mjs`, `licenses-experience-check.mjs`, `commercial-experience-review-check.mjs` y `public-growth-c1-real-profile-readiness-check.mjs` PASS (cubren 1366/768/390/360). Verificación en runtime real (Playwright + Chrome DevTools contra el Worker local) para reduced motion, anclas, grid y contraste. QA visual manual (no exhaustiva en las 4 resoluciones) en Home, Licencias, Addons, Servicios, Aprende, Diagnóstico, Login, Registro y Verificar correo; zoom 200% y axe automatizado no se ejecutaron (`VIS-001B-QA-001` en `STATUS.md`). Versión local `0.4.2`; no desplegada. No push, no deploy.

### VIS-001C — Motion Pilot (condicional; no autorizado)

- **CSS primero:** hover/focus, color, fondo, borde, sombra, desplazamiento 1–3 px, flechas, tap y progreso simple. Entradas y stagger sencillos tampoco justifican automáticamente una librería.
- **Candidato JS/Motion:** presencia con salida, layout dinámico o secuencia coordinada cuyo comportamiento no se resuelva bien con CSS. Exigir un caso concreto y comparación contra CSS/JS nativo; comprobar compatibilidad de las APIs contra las dependencias reales antes de proponer instalación. View Transitions/AnimateView no están aprobados por la versión de React.
- **Diseño provisional, no tokens definitivos:** micro 120–220 ms, componente 250–400 ms, sección 400–650 ms; desplazamiento de entrada 8–20 px, stagger 60–100 ms, hover 1–3 px y tap hasta 0.98. Probar `ease-out` o la curva existente `cubic-bezier(.2,.75,.25,1)` en la UI real; secuencias cortas, sin ocultar contenido esencial ni retrasar interacción.
- **Fallback obligatorio:** con reduced motion, contenido visible, flujos independientes de animación, sin parallax ni autoplay decorativo, sin transformaciones residuales y con transiciones eliminadas o mínimas. Los loops CSS actuales de 4.5/7 s necesitan evaluación de pausa y coste fuera de viewport antes de añadir más; no se encontró control de pausa en `app/`.
- **Rendimiento:** medir baseline y delta de JS/CSS transferido, assets, LCP/CLS/INP y coste de ejecución en móvil. Cargar solo lo necesario por ruta; pausar decoraciones fuera de viewport. Ningún presupuesto numérico queda certificado por esta auditoría.

### Gates posteriores: identidad animada y vídeo (no autorizados)

- **Rive: NOT INSTALLED / NOT APPROVED.** Requiere pieza `.riv` propia aprobada, objetivo concreto, fallback estático, peso medido, responsive, reduced motion y comparación antes/después, además de autorización del runtime. Rutas, puntos, pins y conexiones ya aparecen en los assets actuales; derivar de ellos la identidad, sin reinterpretar el logo.
- **Vídeo:** no añadir todavía. Una propuesta futura debe incluir WebM/MP4, poster, muted, playsinline, carga condicionada, alternativa estática, peso medido y variante móvil cuando aplique. Nunca contenido esencial ni GIF pesado. Rive, vídeo y dotLottie son assets/runtime especializados, no sustitutos generales de CSS.
- **Estados honestos:** ninguna ilustración o animación puede presentar «Publicado», éxito, verificación o conexión operativa sin estado real que lo respalde.

Secuencia conceptual: **VIS-001A → VIS-001B → VIS-001C solo si se justifica → evaluar Rive → retomar App/Admin mediante autorización separada**. VIS-001A y VIS-001B están cerrados en local (2026-09-24). **STOP tras VIS-001B**: no se inicia VIS-001C automáticamente, no se instala Motion/framer-motion/GSAP/Lottie/Three/Lenis, y no hay push ni deploy sin autorización explícita. Queda pendiente revisión visual y técnica del usuario antes de continuar.

### UX-002.1 Product Catalog Foundation — PASS DOCUMENTAL

La matriz maestra está en [business/VECIDYA_PRODUCT_CATALOG.md](business/VECIDYA_PRODUCT_CATALOG.md). Separa licencias, addons, servicios y consumos externos; define la evolución por necesidad; distingue diagnóstico inicial/profesional; y registra Aprende y la frontera HighLevel. No hubo cambios de código, rutas, schema, precios públicos, pagos ni integraciones.

### UX-002.2 Licencias Experience — PASS técnico local

`/licencias` está implementada con hero, definición de licencia, tres niveles, comparador de capacidades, evolución por necesidad, addons, FAQ y CTA a Diagnóstico. Los importes comerciales de trabajo no se muestran al público; no hay checkout, pagos ni suscripciones.

### UX-002.3 Addons Experience — PASS técnico local

`/addons` está implementada con hero, definición, categorías de Comunicación, Automatización, Inteligencia Artificial e Integraciones, cards de capacidades, reglas de elección y CTA de Diagnóstico. No publica precios de addons, no activa consumos, checkout ni integración GHL.

### UX-002.4 Services Experience — PASS técnico local

`/servicios` está actualizada con seis áreas profesionales: Organización del negocio, Formalización de base, Presencia digital, Automatización, Inteligencia artificial y Marketing y crecimiento. La sección de relación separa licencia, addon, servicio y consumo externo; no hay precios generales, checkout, integración GHL ni capacidades ficticias.

### UX-002.5 Diagnostic Experience 2.0 — PASS técnico local

El resultado conserva el scoring y añade situación actual, observaciones, prioridades, camino recomendado y mapeo orientativo a Licencia, Addon, Servicio y Aprende. No hay persistencia, checkout ni recomendación de precio agresiva. Sustituido por DIAG-002B, publicado en `0.4.0`; la persistencia continúa fuera de alcance.

### UX-002.6 Content & Learn Experience — PASS técnico local

Se añadieron cinco categorías y cuatro artículos estáticos reales atribuidos a Yoan Ortiz, con diagramas SVG educativos, tarjetas en `/aprende`, páginas `/aprende/:slug`, índice, CTAs contextuales, metadata canonical/Open Graph y sitemap. No se añadió CMS ni persistencia editorial.

### UX-002.7 Commercial Experience Review — PASS técnico local

Se auditó el recorrido `Aprende → Diagnóstico → Licencias → Addons → Servicios → Contacto`, con CTAs cruzados, navegación desktop/móvil, separación entre licencia/addon/servicio/consumo, referencias de precio etiquetadas, ausencia de GHL/HighLevel público, sitemap con rutas públicas y exclusión de rutas privadas. `commercial-experience-review-check.mjs` pasó en 1366/768/390/360 junto con las regresiones de las experiencias comerciales. Las brechas SEO/a11y globales preexistentes permanecen en `STATUS.md` y no bloquean este cierre local.

## Bloque actual: EMAIL-001C (PASS)

- **Objetivo**: EMAIL-001 queda cerrado para el núcleo transaccional; verificación de cuenta e invitaciones siguen como follow-up separado.
- **Alcance**: únicamente EMAIL-001; PROD-001 queda cerrado.
- **Fuera de alcance futuro**: repetir resets, pruebas destructivas, migraciones D1, despliegue staging y verificación de invitaciones con cuentas no controladas.

## Trabajo futuro por área

### Real Proof / piloto

`RP-001A — Local Real-Proof Validation` queda en **PASS LOCAL**: el fixture controlado reproduce las tres organizaciones documentadas como borradores, bloquea publicación incompleta y confirma aislamiento sin datos privados versionados. `E2 — Remote Pilot Publication` sigue pendiente y requiere G3/G4. Perfil A (SURA) permanece `BLOCKED` hasta acreditar la marca o ajustar nombre/copy; B requiere confirmar el nombre; C presenta `MODEL MISMATCH / PARTIAL` por su naturaleza de ecosistema/comunidad. No se añade schema nuevo ni una guarda de marcas en RP-001A; `PUBLIC-GROWTH-001 C2` se cierra solo con vecinos externos publicados.

### Diagnóstico

DIAG-002 cerró el motor 2.0 y DIAG-002B lo endureció semánticamente (27 pruebas semánticas, 6 estados, lenguaje de comprobación, licencia alineada con lo que incluye cada nivel, vocabulario de addons unificado) y quedó publicado en `0.4.0`. Trabajo futuro real: persistencia solo tras consentimiento explícito, política de retención, schema/migración, autorización tenant si se asocia a usuario u organización, revisión legal, pruebas de privacidad y exportación/eliminación (`LEGAL-PRIV-001`); auditoría axe automatizada; recorridos E2E de los perfiles profesional, creador, proyecto y organización (hoy cubiertos en unitarias). DIAG-002C cerró las tres decisiones de producto que quedaban (sin Barrio «opcional», servicio ≠ licencia, vocabulario público de addons «IA conversacional»/«Automatizaciones», Home con cuatro puertas y «organización» solo dentro del Diagnóstico); no queda ninguna ambigüedad de producto abierta en DIAG-002 y sus cambios se publicaron como `0.4.1`.

### Contenido editorial

Primeros contenidos reales recomendados para `Qué debes saber`: qué significa formalizar un negocio; qué necesita realmente un negocio para empezar en digital; página web vs redes sociales; qué es SEO local; SEO, GEO y búsqueda con IA; qué es un CRM y cuándo lo necesitas; cómo evitar perder consultas y seguimientos; qué controlar de tu dominio y cuentas; qué métricas importan a un pequeño negocio; qué información debería encontrar alguien sobre ti. Todo artículo exige autor real, fecha, intención, fuentes cuando use datos, enlaces internos útiles y cero relleno SEO. Decidir el nombre único de la sección («Aprende» vs «Qué debes saber»).

### SEO/GEO

Antes de nuevas fases SEO, gate remoto: host canónico y redirect, canonical, robots y sitemap (y su prueba), indexabilidad, `og:image`/`og:url`, titles y descriptions, JSON-LD (`Organization`, perfiles; sin `Article`/`Review`/ratings ficticios) y coherencia del origen (canonical fijo vs origen de la request).

### Perfiles públicos

No convertir `BusinessProfile` en perfil universal por arrastre del Diagnóstico. Requiere especificación, política de identidad, autenticidad, moderación, reclamación de perfiles, schema y ADR. Pendientes de Business Profile ya identificados: despublicar, galería/R2, categorías normalizadas, CTA contextual, badge de verificación en la tarjeta, logo sin URL externa.

### UX-003 — App y Admin: fases pendientes

Definición de alcance consolidada desde la auditoría UX-003.0 (documento de fase retirado en REL-004A; su contenido único vive aquí y en `STATUS.md`). Entregadas y publicadas en `0.4.1`: UX-003.1 (arquitectura de información del área cliente), UX-003.2 (dashboard y experiencia de perfil), UX-003.4 (operaciones de Admin Home) y UX-003.5 (contexto de revisión del detalle de negocio). Quedan:

- **UX-003.3 — Organización y equipo.** Estabilizar el lenguaje de roles, los controles de miembros, los estados de invitación y el contexto multi-organización. Depende de `AUTHZ-BA-001` e `INVITE-001`: no se rediseña el flujo de invitación mientras la entrega y la aceptación verificada sigan bloqueadas por correo externo. Incluye corregir `ORG-UI-001`.
- **UX-003.6 — Ajustes e integraciones.** Solo después de una decisión explícita de proveedor. Metadata tenant-scoped, nunca duplicación de CRM; facturación permanece como bloque separado.
- **UX-003.7 — QA de App y Admin.** Cobertura de auth negativa, revisión axe/accesibilidad, responsive 1366/768/390/360, matriz tenant y validación en runtime local; incluye `ADMIN-A11Y-001` y las tres pruebas desalineadas `TEST-UX003-*`.

Transversal a las fases anteriores: `ADMIN-SCALE-001` (búsqueda, filtros, paginación y densidad en la administración interna) y las acciones de ciclo de vida que aún no existen (despublicar un perfil, motivo de suspensión, ajustes completos de seguridad de cuenta).

### Administración interna

Auditar servicios e integraciones (`AUDIT-COVERAGE-001`); mostrar en el detalle de negocio los datos de contacto antes de verificar (`ADMIN-UI-001`); alta/baja de `platform_admin` sin SQL (`PLATFORM-ADMIN-001`); motivo de suspensión; gestión de usuarios y moderación solo si el piloto crece más allá de negocios elegidos por Vecidya.

### Invitaciones (7B.2)

OAuth Gmail y entrega real ya están demostrados por EMAIL-001; queda completar el camino de verificación de email para que un invitado pueda aceptar (`INVITE-001`).

### Integraciones

OPS-001 define GHL como infraestructura externa y el contrato `ghl_location_id`, sin integración activa. OPS-002, Google, Meta, WhatsApp y otros solo con decisión explícita; guardan únicamente metadata tenant-scoped justificada y nunca duplican el CRM.

### Producción

PROD-001 y EMAIL-001 están cerrados en sus alcances; `app.vecidya.com`/`admin.vecidya.com`, el smoke remoto, secretos adicionales y cualquier manejo posterior de `vecidya-staging` requieren autorización independiente. La secuencia operativa vigente es `PROD-001 → EMAIL-001 → OPS-001 → LEGAL / REAL PROOF → GHL pilot → licenses → UX evolution`.

## Fuera de alcance permanente

- CRM propio que duplique GHL.
- Migración directa de la arquitectura Astro Legacy.
- Datos comerciales ficticios.
- Marketing político persuasivo, segmentación electoral o manipulación de audiencias.
