# Roadmap

Última reconciliación: 2026-10-01 (DIAG-V3-12 Professional Diagnostic PDF Report cerrada y congelada en su commit local de cierre; piso tipográfico de 8,5 pt). Anterior, mismo día: (DIAG-V3-12 implementada localmente y pendiente de revisión). Anterior, mismo día: (DIAG-V3-11 Methodology & Credibility cerrada y congelada en su commit local de cierre; las fases posteriores se renumeran: el PDF pasa a DIAG-V3-12). Anterior, mismo día: (DIAG-V3-10B Adaptive Diagnostic Frontend cerrada y congelada en su commit local de cierre `76cb24a`; `DIAG-V3-ANSWER-ORDER-01` resuelta). Anterior, mismo día: (DIAG-V3-10B implementada localmente y pendiente de revisión; motor congelado en `1ed2bda`). Anterior, mismo día: (DIAG-V3-10 Overall Digital Presence & Recommendation Engine cerrada y congelada en su commit local de cierre; DIAG-V3-09 cerrada en el commit local `cee6ec9`; el frontend adaptativo pasa a DIAG-V3-10B). Anterior, mismo día: (DIAG-V3-09 Result Experience & UI implementada localmente y pendiente de revisión; 08G cerrada en el commit local `4bfc6c9`; 09 y 10 renumeradas por instrucción del usuario). Anterior, mismo día: (DIAG-V3-08G implementada localmente y pendiente de revisión; 08F + 08F.1 cerradas en el commit local `da24dee`). Anterior, mismo día: (DIAG-V3-08F.1: escalas de respuesta cerradas y capa de lenguaje congelada, pendiente de revisión). Anterior, mismo día: (DIAG-V3-08E.1–08E.3 cerradas en el commit local `0bd6a73` con el motor congelado; DIAG-V3-08F, auditoría de lenguaje, implementada localmente y pendiente de revisión; 08G Natural Narrative no iniciada). Anterior: 2026-09-28 (DIAG-V3-08 cerrada técnicamente, pendiente de aprobación: analítica de eventos anónima del Diagnóstico — `diagnostic_event`, migración `0013`, sin endpoint público ni dashboard, sin scheduler de purga todavía; solo local, sin deploy). Anterior: 2026-09-27 (DIAG-V3-06 cerrada técnicamente, pendiente de aprobación: persistencia anónima del Diagnóstico y gate de privacidad `DIAG-V3-PRIVACY-01` resuelto localmente). Anterior, 2026-09-26 (DIAG-V3-02 cerrada técnicamente, pendiente de aprobación: registro declarativo de preguntas). Anterior, mismo día: (G6 cerrado: `0.5.7` LIVE, `f7fc35a6-cb4f-48f0-ba73-5d2eea3c34f0`; DIAG-V3-01 aprobada y publicada; DIAG-V3-02 pendiente de aprobación; G7 PASS: `0010` aplicada en producción el mismo día). Anterior, mismo día: (DIAG-V3-01 cerrada técnicamente y pendiente de aprobación; TYPECHECK-001 y REPO-EOL-001 cerrados en local; `LEARN-META-001` espera deploy). Anterior, mismo día: (DIAG-V3 autorizado como bloque por fases; DIAG-V3-00 y el micro-checkpoint de terminología cerrados; DIAG-V3-01 pendiente de aprobación). Anterior, mismo día: (DIAG-003 CERRADA y LIVE en `0.5.6`: puntaje global, clasificación visual de 3 niveles adicional, porcentaje visible por dimensión/prioridad y exportación a PDF en el Diagnóstico). Anterior: 2026-09-25 (AUTHZ-BA-001 CERRADA y LIVE en `0.5.2`; INVITE-001 CERRADA en `0.5.3`; INVITE-UI-001 CERRADA y LIVE en `0.5.4`; el precio público de licencias en USD LIVE en `0.5.5`; LICENSE-STRATEGY-001 CERRADA solo local (sin deploy, por instrucción explícita); siguiente bloque propuesto por el usuario `ACCOUNT-001 — Registration & Multi-Business Portfolio`, no autorizado; gestión de usuarios en Admin con decisiones tomadas y sin iniciar).

Este documento contiene **solo trabajo futuro**. Nada aquí está implementado ni autorizado por existir en esta lista: cada bloque requiere autorización explícita del usuario. Lo ya hecho vive en [CHANGELOG.md](CHANGELOG.md) y [STATUS.md](STATUS.md).

## Decisiones que solo puede tomar el usuario

| # | Decisión | Por qué bloquea |
| --- | --- | --- |
| G2 | Confirmar si `b1` eliminó `archive/` y `resources/assets` a propósito y cómo recuperar la biblioteca de assets (`git show ec79b22^:resources/assets/…`) | Bloquea Visual System Expansion |
| G3 | Datos y decisiones del piloto: email real de Edgar, nombre público de «Asesorar-T», autorización o ajuste de marca SURA, WhatsApp/web/redes/logo si se quieren mostrar | `PILOT-IDENTITY-001`, `PILOT-NAME-ASESORAR-T`, `PILOT-BRAND-SURA` |
| G4 | Autorizar deploy y migraciones remotas `0007`–`0009` sobre `vecidya-staging` | `PUBLISH-GAP-001`; sin esto nada de lo construido el 2026-09-07 llega al dominio público |
| G5 | — | PROD-001C completó la verificación autenticada |
| G6 | — | Cerrada 2026-09-26: `0.5.7` LIVE y `LEARN-META-001` resuelta |
| G7 | — | Cerrada 2026-09-26: `0010` aplicada en `vecidya-prod` (18:13Z) y verificada; `LICENSE-MIGRATION-001` resuelta |

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
| 21 | **DIAG-V3 Diagnostic Engine V3** | Evolucionar el motor actual a un diagnóstico adaptativo (arquetipo, nicho, etapa, evidencia, confianza, resultado versionado, PDF ≤ 3 páginas); detalle en «Diagnóstico» | autorizado por el usuario 2026-09-26, **fase a fase**: cada fase exige aprobación explícita |

**Corrección 1 — RR-001 precede Real Proof.** La evidencia mostró prerrequisitos técnicos: pruebas stale por el nombre D1 obsoleto, PX-B roto, selección de organización al login, limpieza de sesiones tras retirar membresía y protección server-side de perfiles publicados. RR-001 quedó cerrado antes de PERF-001 y permanece separado del deploy y del piloto.

**Corrección 2 — Contenido (6) antes de Interconexión (7).** Las conexiones «Artículo → Diagnóstico/Servicio» y «Diagnóstico → contenido relacionado» no pueden existir sin artículos: hoy hay cero. Interconectar primero produciría enlaces a un hub vacío.

**Nota de estado.** UX-001B.1–UX-001B.10 y UX-001C quedan **CLOSED / PASS técnico local / release ready** en `0.3.0`. UX-002.1 queda **PASS DOCUMENTAL** y UX-002.2–UX-002.7 **PASS técnico local / release ready**. REL-003.1 queda histórica como `0.3.0` LIVE. OPS-001 queda **PASS DOCUMENTAL**, con la cuenta real HighLevel pendiente; GHL continúa pausado y no se inicia OPS-002. DIAG-002/DIAG-002B/DIAG-002C y UX-003.1–003.5 están desplegados como `0.4.1` en staging y producción; la evidencia HTTP anónima está registrada en `ENVIRONMENTS.md`. UX-003.3, UX-003.6 y UX-003.7 continúan pendientes.

**UX-003** fue autorizado por solicitud directa del usuario el 2026-09-23. Se completaron localmente mejoras responsive a Login, dashboard, Admin Home, navegación de las subpáginas cliente y contexto operativo del detalle de negocios. No se cierra el bloque: equipo/invitaciones, listas administrativas, filtros, prueba visual autenticada y QA accesible aún requieren trabajo.

## UX-002 — evolución comercial

## DIAG-V3 — R3 certificado; R4 siguiente

R3-FINAL certifica 38 disposiciones (21 `EVIDENCE_MIGRATED`, 15 `CONTEXT_ONLY`, 2 `LATER_REVIEW`, 0 sin clasificar), freezes de neutralidad y separación contexto/evidencia, y el comando frozen/legacy reproducible de diez suites (240/240). La historia de conteos 234/235 permanece no atribuible a un manifiesto preservado; 240 es el baseline forward del comando documentado, no una equivalencia retrospectiva. La candidata permanece inactiva y el runtime productivo 85/version 1 congelado.

**R4 — Dimension Applicability: NEXT, NO INICIADA.** El siguiente bloque puede definir aplicabilidad por actividad/etapa/modelo/evidencia, incluida recurrencia/recompra, Measurement y mecanismos explícitos de donación/membresía, bajo autorización de fase. R3-FINAL no modifica esas reglas, no reintroduce DEFER y no implementa applicability. El banco productivo sigue congelado hasta una activación expresamente autorizada.

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

Secuencia conceptual: **VIS-001A → VIS-001B → VIS-002B → VIS-001C solo si se justifica → evaluar Rive → retomar App/Admin mediante autorización separada**. VIS-001A, VIS-001B y VIS-002B están cerrados en local (2026-09-24). **STOP tras VIS-002B**: no se inicia VIS-001C automáticamente, no se instala Motion/framer-motion/GSAP/Lottie/Three/Lenis, y no hay push ni deploy sin autorización explícita. Queda pendiente revisión visual y técnica del usuario antes de continuar.

### VIS-002B — Cross-Surface Brand Integration — CERRADA (local, 2026-09-24)

Objetivo cumplido: integrar los tres assets 3D de marca aprobados por el usuario (símbolo, wordmark, lockup) más los dos de Batch 01 generados a partir de los prompts del checkpoint, en las cuatro familias de layout compartidas (`PublicLayout`, `AuthShell`, `ClientAreaShell`, `AdminShell`), sin abrir Batch 02, sin tocar `/sobre-nosotros`, sin auditoría nueva de Public y sin tocar `AUTHZ-BA-001`/`INVITE-001`.

1. **Loop cerrado ejecutado completo:** inventario físico de `../Assets Generados/` → clasificación (APPROVED / APPROVED AFTER OPTIMIZATION) → integración de lo ya aprobado primero → QA en runtime → Asset Gap Audit → Batch 01 (2 assets, prompts entregados y STOP) → el usuario los generó → inspección → optimización → integración → QA responsive/a11y/performance.
2. **Assets finales integrados** (`public/assets/selected/brand/`, `public/brand/`): símbolo 3D (favicon/pestaña, header y footer públicos, sidebars de App y Admin, panel de Auth, empty-state de `/app`), wordmark (footer público, recortado a su proporción real 3:1 solo con CSS `object-fit:cover` porque las herramientas de resize disponibles no preservan aspecto no cuadrado), lockup completo (panel de Auth), más las dos ilustraciones de Batch 01 (conexión de servicios en `/app/services`; lupa+pin reutilizada en las 6 páginas de Admin). El símbolo plano se conserva únicamente donde sigue siendo la elección correcta: el watermark de fondo de `.diagnostic-hero` (un 3D perdería el detalle al 14% de opacidad).
3. **Sin assets reservados sin usar:** los tres assets originales y los dos de Batch 01 quedan completamente integrados.
4. **Deuda separada, no corregida aquí:** `SETUP-CARD-WRAP-001` (envoltura de texto preexistente en `/app` a ~768px, sin relación con este trabajo).

Evidencia de cierre: `pnpm run typecheck` PASS, `pnpm run build` PASS, `git diff --check` PASS. Verificado en runtime real (Playwright contra el Worker local) en las 4 familias de layout — Público, Auth, App, Admin —, incluida una sesión `platform_admin` real, en 1366/768/390/360. Versión local `0.5.1` (PATCH: cambio visual visible e integrado, sin capacidad nueva). No push automático de este cierre; deploy no autorizado.

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

DIAG-002 cerró el motor 2.0 y DIAG-002B lo endureció semánticamente (27 pruebas semánticas, 6 estados, lenguaje de comprobación, licencia alineada con lo que incluye cada nivel, vocabulario de addons unificado) y quedó publicado en `0.4.0`. DIAG-002C cerró las tres decisiones de producto que quedaban (sin Barrio «opcional», servicio ≠ licencia, vocabulario público de addons «IA conversacional»/«Automatizaciones», Home con cuatro puertas y «organización» solo dentro del Diagnóstico); no queda ninguna ambigüedad de producto abierta en DIAG-002 y sus cambios se publicaron como `0.4.1`. DIAG-003 (`0.5.6`, LIVE) añadió puntaje global (`overallScore`), una clasificación visual de 3 niveles adicional a los 4 niveles de madurez existentes, porcentaje visible por dimensión/prioridad (cerrando una brecha real de accesibilidad) y exportación a PDF por impresión del navegador. Trabajo futuro real: persistencia solo tras consentimiento explícito, política de retención, schema/migración, autorización tenant si se asocia a usuario u organización, revisión legal, pruebas de privacidad y exportación/eliminación (`LEGAL-PRIV-001`); auditoría axe automatizada; recorridos E2E de los perfiles profesional, creador, proyecto y organización (hoy cubiertos en unitarias). La persistencia, los recorridos por perfil y el PDF quedan absorbidos por DIAG-V3.

**Matriz de dependencias (DIAG-V3-02, derivada desde DIAG-V3-03).** 23 de las 26 preguntas tienen una condición de aplicabilidad; solo `profile`, `goal` y `stage` aplican siempre (con perfil elegido). Ninguna dependencia salta hacia adelante: toda pregunta de la que depende una condición se pregunta antes. Desde DIAG-V3-03, esta tabla ya no es metadata declarada a mano: `collectDependencies(rule)` la calcula recorriendo el árbol de cada regla declarativa en `ROUTING_RULES`, así que una regla que cambie sin actualizar su dependencia (el riesgo que documentaba `DIAG-V3-CYCLE-001`) ya no puede ocurrir.

| Pregunta | Depende de |
| --- | --- |
| `profile`, `goal`, `stage` | (siempre aplicable con perfil) |
| `team`, `assets`, `validation`, `sources`, `contact_path` | `stage` |
| `clarity_presence`, `control` | `assets` |
| `offer_clarity` | `stage`, `profile`, `assets` |
| `proof_professional`, `proof_business`, `proof_creator`, `proof_org`, `discoverability`, `audience`, `reach` | `profile`/`stage` (según pregunta) |
| `capture`, `response`, `follow_up`, `post_sale`, `measurement` | `stage`, `sources` |
| `pipeline`, `repetitive` | `stage`, `sources`, `capture` |
| `responsibilities` | `team`, `stage`, `sources` |

El grafo completo (`getDependencyGraph()`) es acíclico: toda dependencia precede a la pregunta que la usa, verificado por `registry.test.ts` y, desde DIAG-V3-03, también por `routing.test.ts` sobre el grafo derivado de `ROUTING_RULES`.

#### DIAG-V3 — Diagnostic Engine V3

Estrategia aprobada tras DIAG-V3-00: **evolucionar → generalizar → versionar → desacoplar** el motor de `app/features/diagnostic`, sin reemplazarlo y conservando el comportamiento y las pruebas actuales mientras sean compatibles con los nuevos contratos. Las capas se mantienen separadas: routing ≠ scoring ≠ resultado ≠ presentación ≠ persistencia ≠ analítica. Los IDs `DIAG-001`, `DIAG-002` y `DIAG-003` pertenecen al historial y no se reutilizan.

| Fase | Alcance | Estado |
| --- | --- | --- |
| DIAG-V3-00 | Auditoría del estado actual | CERRADA (ver `STATUS.md`) |
| — | Micro-checkpoint de terminología | CERRADO; LIVE `0.5.7` (`c60979f`) |
| DIAG-V3-01 | Domain contracts: tipos versionados (`DiagnosticVersion`, `QuestionId`, `QuestionVersion`, `EntityType`, `OperationalArchetype`, `Niche`, `GrowthStage`, `CustomerModel`, `PrimaryGoal`, `PrimaryFriction`, `DimensionId`, `Evidence`, `DiagnosticContext`, `DiagnosticResult`) y **mapeo explícito** de los IDs actuales, sin cambiar el comportamiento observable. Ejemplo de riesgo: el `growing` actual («estable y quiero crecer») no equivale al `growing` de V3 (volumen creciente) | CERRADA, aprobada y LIVE `0.5.7` (`905d310`) |
| DIAG-V3-02 | Registro declarativo de preguntas (`QUESTION_DEFINITIONS`), opciones tipadas por pregunta (`DIAG-V3-DEBT-01`), `inquiriesArrive`/`selectedValues` unificadas (`DIAG-V3-DEBT-02`) y matriz de dependencias de `applies` (ver «Diagnóstico») | CERRADA técnicamente (solo local), pendiente de aprobación |
| DIAG-V3-03 Routing engine | Motor de reglas declarativo (`ROUTING_RULES` + `evaluateRule`) que sustituye las 23 closures `applies`; `dependsOn` derivado, no declarado; 0 cambio de comportamiento (ver «Diagnóstico» y `STATUS.md`) | CERRADA técnicamente (solo local), pendiente de aprobación |
| DIAG-V3-04 | Scoring + evidencia; primer productor de `DiagnosticEvidence` (`evidence.ts` deriva de `Contribution`, ya existente en `scoring.ts`); trazas `explainDimensionScore`/`explainOverallScore`; insumos de confianza por dimensión; BUG-01 caracterizado (conclusión C, sin corrección); `result.ts` sin tocar | CERRADA técnicamente (solo local), pendiente de aprobación |
| DIAG-V3-05 | Result engine: `classifyState`/`generateIssues`/`prioritize`/recomendaciones se reorganizan en `explain*` trazables (`explainStateClassification`, `explainContradictions`, `explainPrioritization`, `explainRecommendations`, `explainResult`), sin cambiar comportamiento; `DIAG-V3-BUG-01` fortalecido (CHARACTERIZED / NOT FIXED, sigue sin corrección); tabla de disposición de `DiagnosticResultV3` (ver `CHANGELOG.md`); `DIAG-V3-UX-01` (cuándo `overallScore` puede retenerse) queda `UNRESOLVED`, no decidido | CERRADA técnicamente (solo local), pendiente de aprobación |
| Gate | **PRIVACY + DATA CONTRACT** (`DIAG-V3-PRIVACY-01`, `LEGAL-PRIV-001`): qué se guarda, por qué, dónde y cuánto tiempo; qué sigue anónimo; qué va temporalmente a KV y qué llega a D1; diagnósticos abandonados; «Guardar para después»; expiración; recovery token; eliminación; textos públicos; `/privacidad`; aviso o consentimiento | **RESUELTO localmente en DIAG-V3-06** (`DIAG-V3-PRIVACY-01` en `STATUS.md`); `LEGAL-PRIV-001` (revisión legal formal) sigue abierta, no bloquea más fases locales |
| DIAG-V3-06 | Persistencia Browser → KV → D1; auditoría `DIAG-V3-06-C1` del transporte del `writeToken` | **APROBADA** (2026-09-27); commits `32741f3`/`cbcf702`/`3a1b52a`/`9c7185a` en `main`/`origin/main` |
| DIAG-V3-07 | Save & Resume: recovery code anónimo, snapshot durable en D1, rotación de `writeToken` en recuperación | Autorizada (2026-09-27), en curso |
| DIAG-V3-08 | Analítica (eventos, sweep de expiración) | **CERRADA técnicamente, pendiente de aprobación** (2026-09-28); solo local, sin deploy. Sweep de expiración sigue sin scheduler (diferido explícitamente por el spec, ver Open Debt en `STATUS.md`) |
| DIAG-V3-08B | Niche Intelligence & Adaptive Question Bank: nichos, modelos de negocio, arquetipos, banco productivo 80, planner adaptativo y Contradictions & Confirmation V1 | 08B.0–08B.5 CERRADAS técnicamente (solo local, pendientes de aprobación formal); 08B.3 cerró el contenido, 08B.4 el planner y 08B.5 el engine trigger-only con confirmations aún fixture-only |
| DIAG-V3-08C | Contextual Scoring V3: observaciones independientes, directness, confianza y explainability; el contexto afecta applicability, no fabrica capacidad | **Cerrada y aprobada** (commit local `51a7230`): el scoring usa la evidencia que recoge el planner adaptativo, sin umbral universal ni set-cover; sin evidencia directa devuelve `null`. No conectada a comportamiento público |
| DIAG-V3-08D | Constraints & Priorities: restricciones con evidencia, dependencias entre dimensiones, relevancia por goal/friction/etapa y hasta tres prioridades con certeza | **Cerrada y aprobada** (commit local `bfe97fb`). No conectada a comportamiento público |
| DIAG-V3-08D.1 | Targeted Evidence Enrichment: necesidad material de evidencia en el planner, hard cap 20 con ruta base 18, `materialAppliesWhen`, 3 preguntas justificadas, `helpIntent` y política de prioridad para fricción declarada | **Cerrada** (commit local `a96ce99`); motor diagnóstico congelado. No conectada a comportamiento público |
| DIAG-V3-08E | Semantic Diagnostic Facts: hechos estructurados con procedencia sobre el motor congelado | **Cerrada** (commit local `d927f39`); capa congelada |
| DIAG-V3-08E.1 | Final Evidence Completion: auditoría de contextos alcanzables, 2 preguntas (Clarity, Foundation), alcance material de Trust/Readiness, cap base que excluye extras materiales | **Cerrada** (commit local `0bd6a73`). Su conflicto de presupuesto se resolvió en 08E.2 |
| DIAG-V3-08E.2 | Route Completeness & Final Engine Stabilization: bandas 18/20/24, gating por ciclo de vida, necesidad material acotada, `helpIntent` de rutas materiales | **Cerrada** (commit local `0bd6a73`). Hallazgo de `q2_goal` resuelto en 08E.3 |
| DIAG-V3-08E.3 | Goal Taxonomy Alignment & Final Engine Freeze: `q2_goal` con las 8 metas del motor, camino de evidencia por meta, fixtures golden válidos | **Cerrada** (commit local `0bd6a73`, `feat(diagnostic): finalize adaptive diagnostic engine`): banco, planner, evidencia, scoring, restricciones, prioridades y Semantic Facts congelados |
| DIAG-V3-08F | Language, Terminology & Question Semantics Audit: modelo de terminología por perfil, render determinista con variantes, `hint`, ayuda «qué/cómo/por qué», auditoría de las 85 preguntas y contrato de lenguaje de resultados | **Cerrada** (commit local `da24dee`); capa de lenguaje congelada. Sin cambio de motor ni de `ANSWER_SEMANTICS`. Sus dos refinamientos de escala se cerraron en 08F.1 |
| DIAG-V3-08F.1 | Answer Scale Closure & Language Freeze: nivel intermedio en `q2_reputation_flow` y taxonomía de fuentes en `q2_ecommerce_traffic_sources` (ambas versión 2); congelación de la capa de lenguaje | **Cerrada** (commit local `da24dee`, junto con 08F). Sin cambio de rutas ni de resultados golden |
| DIAG-V3-08G | Natural Narrative: redacción del resultado sobre los Semantic Facts usando el contrato de lenguaje de 08F (certeza, categorías, continuidad de etapa, términos por perfil) | **Cerrada** (commit local `4bfc6c9`, `feat(diagnostic): add deterministic result narrative`); capa de narrativa congelada. Sin recomendaciones tácticas |
| DIAG-V3-09 | Result Experience & UI: resultado V3 sobre el `DiagnosticNarrative` (resumen, restricción, prioridades, 8 áreas con porcentaje + estado + confianza, evidencia, ayuda, pre-lanzamiento) | **Cerrada** (commit local `cee6ec9`, `feat(diagnostic): add diagnostic result experience`). Solo vista previa local; sin integración pública ni cambio de versión |
| DIAG-V3-10 | Overall Digital Presence & Recommendation Engine: índice y estado general (semáforo con cobertura y confianza), recomendaciones por prioridad, catálogo de soluciones y emparejamiento con el catálogo comercial canónico; correcciones de presentación del resultado | **Cerrada y congelada** (commit local de cierre `feat(diagnostic): add overall status and recommendations`). Iconos finales pendientes (briefs en `status-assets.ts`); sin precios, checkout, PDF ni integración pública |
| DIAG-V3-10B | Adaptive Diagnostic Frontend: cuestionario adaptativo V3 (planner por lotes, render con términos por perfil, pista y ayuda, progreso por etapas, volver/editar con reconciliación, persistencia local, cierre con el pipeline congelado y resultado V3) | **Cerrada y congelada** (commit local de cierre `feat(diagnostic): add adaptive v3 questionnaire flow`), con resultado independiente del orden de respuesta (`DIAG-V3-ANSWER-ORDER-01` resuelta). Solo en la ruta privada `/__dev/diagnostico/v3`; `/diagnostico` sigue con QBV1. El corte público (reemplazo de QBV1, carga diferida del motor y persistencia en servidor si se decide) queda para un bloque posterior |
| DIAG-V3-11 | Methodology & Credibility: metodología 1.0 (ocho áreas, índice, confianza, ruta adaptativa, prioridades, separación comercial, límites), fuentes externas por área, modelo de citas y reglas de versión; nivel A en «Cómo se evaluó» y página completa | **Cerrada y congelada** (commit local de cierre `feat(diagnostic): add methodology and credibility layer`), con 8 fuentes verificadas y dos áreas sostenidas solo por criterio de Vecidya. Solo en la ruta privada `/__dev/diagnostico/metodologia`; sin cambio de motor ni de versión. El texto de privacidad para producción espera la arquitectura del corte público |
| DIAG-V3-12 | PDF con objetivo de tres páginas (cuatro como excepción, nunca por debajo del piso tipográfico) mediante un view model derivado de `DiagnosticResult` (`DIAG-V3-PDF-01`), con una sección breve de referencias de la metodología | **Cerrada y congelada** (commit local de cierre `feat(diagnostic): add v3 diagnostic pdf report`). Solo en la ruta privada `/__dev/diagnostico/informe`. Queda para el corte público: dónde vive la ruta del informe, si además se genera en servidor (Workers no tiene Chromium sin un binding de navegador), el texto de privacidad y una validación PDF/UA dedicada |
| DIAG-V3-13 | Public Diagnostic Cutover: reemplazo público de QBV1 por V3, metodología e informe públicos, privacidad cliente-only y retirada del backend experimental no desplegado | **CERRADA técnicamente (2026-10-02)**; su publicación se ejecuta bajo `DIAG-V3-REL-001` tras FIX-03A/B/C/D y FIX-04A, con verificación HTTP anónima obligatoria. No incluye COMMERCIAL/GHL |
| DIAG-V3-14 | Accesibilidad, rendimiento y seguridad | No iniciada |
| DIAG-V3-15 | Validación en staging | No iniciada |
| DIAG-V3-16 | Producción | No iniciada |

Reglas del bloque:

- **Cada fase deja el proyecto funcional**: `typecheck`, pruebas, `build` y flujo actual en verde, y un checkpoint reversible por separado. Si una fase necesita romperlos temporalmente, se divide. La fase N+1 no empieza sin la aprobación de N.
- **Persistencia:** implementada desde DIAG-V3-06 (solo local, sin deploy), tras resolver el gate de privacidad — no se implementó de forma silenciosa. KV es estado de trabajo temporal (snapshot coalescido desde el navegador, sin escribir por cada clic; consistencia eventual, máximo 1 escritura/s por clave, lecturas stale, sin garantía de concurrencia entre dispositivos ni entre pestañas — `revision` es solo trazabilidad). D1 es el histórico; la analítica de eventos anónima ya existe desde DIAG-V3-08 (`diagnostic_event`, solo local, sin deploy). Esas responsabilidades no se intercambian; un fallo al finalizar en D1 no borra el estado recuperable en KV ni en el navegador, y la finalización es idempotente y transaccional (verificado con rollback atómico real de `database.batch()` de D1 ante una colisión de restricción).
- **Terminología:** «Cliente/Clientes» para el concepto comercial (empresa o persona atendida por Vecidya) cuando exista; «Cuenta» para autenticación. No se hacen reemplazos globales de `account`. Dentro de las preguntas del Diagnóstico, el sujeto (clientes, pacientes, personas interesadas, empresas, personas que apoyan) lo decide el modelo de terminología de DIAG-V3-08F, nunca un reemplazo global de palabras.
- **Fuera de alcance de V3 por ahora:** IA generativa decidiendo el diagnóstico, machine learning, CRM, campañas, nurturing, emails automáticos, cuentas obligatorias y BI complejo.
- **DIAG-V3-08B/08C no son opcionales.** 08B aporta nichos, modelos de negocio, arquetipos, banco productivo (80 preguntas; 83 tras DIAG-V3-08D.1) y planner. 08C establece la base de evidencia/score contextual sobre la evidencia que recoge el planner adaptativo; una dimensión sin evidencia directa devuelve `null` en lugar de un porcentaje inventado. Goal/friction/stage no se usan como multiplicadores cosméticos. DIAG-V3-06/07 dejan contratos anteriores listos, pero no sustituyen esa evidencia.

### Contenido editorial

Primeros contenidos reales recomendados para `Qué debes saber`: qué significa formalizar un negocio; qué necesita realmente un negocio para empezar en digital; página web vs redes sociales; qué es SEO local; SEO, GEO y búsqueda con IA; qué es un CRM y cuándo lo necesitas; cómo evitar perder consultas y seguimientos; qué controlar de tu dominio y cuentas; qué métricas importan a un pequeño negocio; qué información debería encontrar alguien sobre ti. Todo artículo exige autor real, fecha, intención, fuentes cuando use datos, enlaces internos útiles y cero relleno SEO. Decidir el nombre único de la sección («Aprende» vs «Qué debes saber»).

### SEO/GEO

Antes de nuevas fases SEO, gate remoto: host canónico y redirect, canonical, robots y sitemap (y su prueba), indexabilidad, `og:image`/`og:url`, titles y descriptions, JSON-LD (`Organization`, perfiles; sin `Article`/`Review`/ratings ficticios) y coherencia del origen (canonical fijo vs origen de la request).

### Perfiles públicos

No convertir `BusinessProfile` en perfil universal por arrastre del Diagnóstico. Requiere especificación, política de identidad, autenticidad, moderación, reclamación de perfiles, schema y ADR. Pendientes de Business Profile ya identificados: despublicar, galería/R2, categorías normalizadas, CTA contextual, badge de verificación en la tarjeta, logo sin URL externa. Cambio explícito de slug de un perfil ya guardado: debe ser una acción deliberada, con advertencia sobre enlaces, SEO, QR y URLs compartidas, y preferiblemente con redirección del slug anterior (historial o alias con schema y migración propios). No está autorizado; hoy SLUG-005B solo impide que la URL cambie por accidente.

### UX-003 — App y Admin: fases pendientes

Definición de alcance consolidada desde la auditoría UX-003.0 (documento de fase retirado en REL-004A; su contenido único vive aquí y en `STATUS.md`). Entregadas y publicadas en `0.4.1`: UX-003.1 (arquitectura de información del área cliente), UX-003.2 (dashboard y experiencia de perfil), UX-003.4 (operaciones de Admin Home) y UX-003.5 (contexto de revisión del detalle de negocio). Quedan:

- **UX-003.3 — Organización y equipo.** Estabilizar el lenguaje de roles, los controles de miembros, los estados de invitación y el contexto multi-organización. Dependía de `AUTHZ-BA-001` (CERRADA en `0.5.2`) y depende de `INVITE-001`: no se rediseña el flujo de invitación mientras la aceptación verificada siga rota. `ORG-UI-001` y `ORG-UI-002` ya quedaron **resueltos por UX-003.9** (ver abajo); lo que queda de esta fase es específicamente invitaciones/roles/multi-org.
- **UX-003.6 — Ajustes e integraciones.** Solo después de una decisión explícita de proveedor. Metadata tenant-scoped, nunca duplicación de CRM; facturación permanece como bloque separado.
- **UX-003.7 — QA de App y Admin.** Cobertura de auth negativa, revisión axe/accesibilidad, responsive 1366/768/390/360, matriz tenant y validación en runtime local; incluye `ADMIN-A11Y-001` y las tres pruebas desalineadas `TEST-UX003-*`.

Transversal a las fases anteriores: `ADMIN-SCALE-001` (búsqueda, filtros, paginación y densidad en la administración interna — **parcialmente resuelto por UX-003.9** para Organizaciones y Negocios; Servicios/Integraciones/Auditoría siguen pendientes) y las acciones de ciclo de vida que aún no existen (despublicar un perfil, motivo de suspensión, ajustes completos de seguridad de cuenta).

### UX-003.8 — Authenticated App + Admin Visual Baseline — PASS local (2026-09-24)

Auditoría en runtime con sesión real (usuario QA local `qa.visual@vecidya.local`, `owner` de `Vecidya QA Local` + `platform_admin`), sin cambios de código. Se eligió el número `.8` porque `.1/.2/.4/.5` ya están asignados a fases publicadas en `0.4.1`; no reutiliza esos identificadores. Confirmó que `platform_admin` no contamina la experiencia normal de `/app` (un solo usuario QA es suficiente) y recorrió 11 de las 14 rutas privadas (se omitió `/app/invitations/:id`, que exige una invitación real). Halló `ORG-UI-002` (nuevo, arriba) y reprodujo visualmente `ADMIN-SCALE-001` (lista de Organizaciones con más de 60 tarjetas de fixtures de pruebas E2E sin limpiar, `TEST-CLEANUP-001`, sin paginación ni filtros). Detalle completo, matriz visual y capturas (fuera de Git, `screenshots/ux-003-baseline/`, ignorado) en el reporte de la sesión 2026-09-24.

### UX-003.9 — App + Admin Experience Upgrade — PASS técnico local (2026-09-24)

Autorizada explícitamente el mismo día sobre el baseline de UX-003.8, con permiso de modificar UI/CSS/componentes/copy/navegación (no schema, no GHL, no Motion). Cambios reales:

- **Shell de Client App unificado:** `ClientAreaShell` pasó de navegación horizontal (usada por 4 de 5 rutas) a un sidebar agrupado (Inicio · Mi negocio: Perfil/Servicios · Organización: Equipo · Cuenta) con selector de organización y menú de usuario, igual que ya tenía `/app`. `app.tsx` se migró a ese mismo shell (antes tenía uno propio, duplicado); se creó `server/auth/client-workspace.server.ts` para no repetir la consulta de organizaciones/usuario/`platform_admin` en cada loader.
- **`/app` rediseñado:** saludo por hora, acción principal derivada de `businessProfile`/`completion` reales (Crear/Completar/Revisar para publicar/Administrar perfil — nunca un estado inventado), resumen de estado (perfil, servicios, equipo) y accesos rápidos con iconos.
- **`ORG-UI-001`/`ORG-UI-002` resueltos** (ver `STATUS.md`), verificados en runtime a 390×844: «Tu cuenta» visible, sin superposición del nombre/rol.
- **AdminShell:** iconos en la navegación (reutilizando los mismos SVG que ya usaban las cards de Admin Home) y pie con usuario/«Platform Admin»/«Volver al espacio cliente»/cerrar sesión, que antes no existían.
- **Admin Home con datos reales:** conteos de organizaciones/perfiles/servicios/integraciones vía las mismas queries ya usadas en otras vistas (sin queries nuevas más allá de un `count()` de servicios pendientes) y sección «Requiere atención» condicionada a datos reales (nada se muestra si no hay nada que revisar).
- **`ADMIN-SCALE-001` parcialmente resuelto:** Organizaciones y Negocios pasaron de tarjetas gigantes a tablas densas con búsqueda y filtro client-side; verificado filtrando 566→1 resultado en runtime. Servicios, Integraciones y Auditoría **no se tocaron** (quedan en tarjetas, con menor pero real fixture pollution).
- **P3 cerrados:** `pattern="[a-z0-9-]+"` corregido a una expresión válida en navegadores modernos; `<title>` añadido a `/app/organization`, `/app/internal/businesses` y el detalle de negocio en Admin.
- **Un ajuste encontrado durante la propia implementación:** el primer intento de revalidar el selector de organización usaba `navigate()` + `window.location.reload()`; se corrigió a `useRevalidator()` (mismo patrón que ya usa `/app/account`), más simple y correcto.

Validación: `typecheck`, `build`, `git diff --check` PASS; `test:unit` 75/75 PASS; E2E `admin-shell`, `bpx` (business-profile-experience), `admin-bp` (admin-business-profiles), `admin-orgs`, `members` (organization-members), `c1`, `c2`, `d1` PASS. `px-b` (`product-experience-b-client-app-check.mjs`) falló de forma reproducible en un paso distinto al que documentaba `TEST-UX003-PXB`; verificado manualmente tres veces (incluida una reproducción con el mismo ejecutable Edge que usa el script) que el flujo real funciona — no se identificó como regresión de producto, pero tampoco se depuró la causa raíz del script; permanece como `TEST-UX003-PXB` actualizado en `STATUS.md`. Versión local `0.4.2` → **`0.5.0`** (MINOR: nueva capacidad de UI, sin cambios de ruta/schema/backend). Capturas antes/después en `screenshots/ux-003-baseline/` (fuera de Git). Sin push, sin deploy.

**STOP tras UX-003.9.** No se inicia Motion, Rive, GHL ni deploy. Próxima fase propuesta: **UX-003.3** (invitaciones/roles/multi-org, ya priorizada arriba) — no autorizada aquí.

### Administración interna

Auditar servicios e integraciones (`AUDIT-COVERAGE-001`); mostrar en el detalle de negocio los datos de contacto antes de verificar (`ADMIN-UI-001`); alta/baja de `platform_admin` sin SQL (`PLATFORM-ADMIN-001`); motivo de suspensión; gestión de usuarios y moderación solo si el piloto crece más allá de negocios elegidos por Vecidya.

### Invitaciones (7B.2)

OAuth Gmail y entrega real ya están demostrados por EMAIL-001. AUTHZ-BA-001 cerró la frontera de autorización e INVITE-001 cerró el flujo funcional: invitación → registro o login → verificación → aceptar → organización correcta (ver `CHANGELOG.md`). Queda:

- **`INVITE-UI-001` — acabado visual: CERRADA y LIVE en `0.5.4`.**
- **Capacidades futuras, no implementadas y distintas entre sí:** *reenviar* (Better Auth lo soporta con `resend: true` en `invite-member`), *rechazar* (`reject-invitation`, hoy 404 por HTTP) y *eliminar* una invitación del historial (Better Auth 1.7.5 no lo ofrece; cancelar solo cambia el estado). Abrir un endpoint de Better Auth por HTTP exige añadirlo a `server/auth/organization-http-surface.ts`, con su prueba.

### Gestión de usuarios en Admin (pedida por el usuario el 2026-09-25; no iniciada)

El usuario pidió poder crear y eliminar usuarios a mano desde la administración de Vecidya. Hoy `/app/internal` no gestiona usuarios. Decisiones tomadas por el usuario el 2026-09-25:

- **Crear:** el usuario recibe un enlace por correo para fijar su propia contraseña. Vecidya nunca conoce ni comunica contraseñas.
- **Eliminar = desactivar:** bloquea el acceso y cierra sus sesiones, conserva datos y auditoría, y es reversible. No hay borrado definitivo. Queda por definir qué pasa con las organizaciones donde es el único owner.
- **Límites:** autoridad exclusiva de `platform_admin` y cada acción auditada en `platform_audit_log`.
- **Usuario ≠ miembro:** un usuario es la cuenta; la membresía (owner, admin o member) es por organización.

Relacionada con `PLATFORM-ADMIN-001`. Falta decidir en qué punto de la secuencia entra.

Relacionada con `PLATFORM-ADMIN-001`.

### Integraciones

OPS-001 define GHL como infraestructura externa y el contrato `ghl_location_id`, sin integración activa. OPS-002, Google, Meta, WhatsApp y otros solo con decisión explícita; guardan únicamente metadata tenant-scoped justificada y nunca duplican el CRM.

### Producción

PROD-001 y EMAIL-001 están cerrados en sus alcances; `app.vecidya.com`/`admin.vecidya.com`, el smoke remoto, secretos adicionales y cualquier manejo posterior de `vecidya-staging` requieren autorización independiente.

**`0.5.1` está LIVE en producción (REL-005B, 2026-09-24).** Secuencia fijada por el usuario el 2026-09-25, con cada bloque pendiente de su propia autorización: **`AUTHZ-BA-001` (CERRADA, LIVE `0.5.2`) → `INVITE-001` (CERRADA, `0.5.3`) → `INVITE-UI-001` (CERRADA, LIVE `0.5.4`) → **`LICENSE-STRATEGY-001` (CERRADA, solo local, 2026-09-25)** → `AUTH-ABUSE-001` → `MEDIA-001A` R2 Foundation (buckets, binding, metadata, autorización, subida y borrado) → `MEDIA-001B` logo gestionado por Vecidya → `MEDIA-001C` galería y carrusel → QA de publicación autónoma**. `AUTH-ABUSE-001` sigue antes de R2 porque crear organizaciones y subir archivos son las dos operaciones de autoservicio con coste; ahora puede apoyarse en el modelo de `billing_account`/`organization_license` que dejó LICENSE-STRATEGY-001 (existe el modelo de «plan activo»; falta hacerlo cumplir: `organization/create` sigue sin tope). El usuario propuso además `ACCOUNT-001 — Registration & Multi-Business Portfolio` (registro pensando en «mis negocios» y «negocios donde colaboro», con los hooks de portafolio) como bloque futuro; no está autorizado, no se inicia automáticamente. La gestión de usuarios en Admin está pedida y decidida, pero sin posición en la secuencia. Objetivo: que cada cliente construya y publique su propio espacio con identidad e imágenes reales. R2 va después de cerrar la autorización, porque subir y borrar archivos persistentes exige primero el aislamiento tenant. La secuencia operativa vigente es `PROD-001 → EMAIL-001 → OPS-001 → LEGAL / REAL PROOF → GHL pilot → licenses → UX evolution`.

## Fuera de alcance permanente

- CRM propio que duplique GHL.
- Migración directa de la arquitectura Astro Legacy.
- Datos comerciales ficticios.
- Marketing político persuasivo, segmentación electoral o manipulación de audiencias.
