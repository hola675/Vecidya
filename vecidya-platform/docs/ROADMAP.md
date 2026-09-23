# Roadmap

Última reconciliación: 2026-09-23 (REL-003.1 `0.3.0` LIVE; follow-up de verificación/invitaciones permanece separado).

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
| 3 | **OPS-001** | Operación y observabilidad post-separación | EMAIL-001 |
| 4 | Pilot Data & Authorizations | Resolver G3; sin código | OPS-001 / usuario |
| 5 | **Real Proof (E2)** | Publicar vecinos reales con datos autorizados | 4, G3 |
| 6 | **UX-001B.1 / UX-001B.2** | Arquitectura visual e implementación de Home, assets y metadata social | Independiente de 4–5; **cerrado / PASS técnico local** |
| 7 | **UX-001B.3** | Vecindario: búsqueda, filtros, cards, estados vacíos, responsive y accesibilidad | UX-001B.2 — **cerrado / PASS técnico local** |
| 8 | **UX-001B.4** | Perfil público: micrositio del negocio, datos publicados, CTA, SEO y responsive | UX-001B.3 — **cerrado / PASS técnico local** |
| 9 | **UX-001B.5** | Servicios: presentación pública de capacidades Vecidya y alcance honesto | UX-001B.4 — **cerrado / PASS técnico local** |
| 10 | **UX-001B.6** | Diagnóstico: interacción, progreso, accesibilidad y resultado sobre el motor actual | UX-001B.5 — **cerrado / PASS técnico local** |
| 11 | **UX-001B.7** | Únete + Contacto: entrada institucional y conversación pública | UX-001B.6 — **cerrado / PASS técnico local** |
| 12 | **UX-001B.8** | Sobre nosotros: historia, personas y credibilidad institucional | UX-001B.7 — **cerrado / PASS técnico local** |
| 13 | **UX-001B.9** | Aprende: contenido educativo público y SEO honesto | UX-001B.8 — **cerrado / PASS técnico local** |
| 14 | **UX-001B.10** | Legal & Trust: privacidad, términos y señales de confianza | UX-001B.9 — **cerrado / PASS técnico local** |
| 15 | Visual System Expansion | Ampliar sistema visual y assets fuera de Home | G2 |
| 16 | Educational Content | Primeros contenidos reales | UX-001B.9 y autor/fuentes reales |
| 17 | Ecosystem Interconnection | Diagnóstico → contenido/servicio; perfil → relacionados; artículo → diagnóstico/servicio | 5 (vecinos) y 16 (artículos) |
| 18 | Business Profile / UX | Campos, cobertura E2E, a11y y SEO del perfil público | UX-001B.4 y Real Proof |

**Corrección 1 — RR-001 precede Real Proof.** La evidencia mostró prerrequisitos técnicos: pruebas stale por el nombre D1 obsoleto, PX-B roto, selección de organización al login, limpieza de sesiones tras retirar membresía y protección server-side de perfiles publicados. RR-001 quedó cerrado antes de PERF-001 y permanece separado del deploy y del piloto.

**Corrección 2 — Contenido (6) antes de Interconexión (7).** Las conexiones «Artículo → Diagnóstico/Servicio» y «Diagnóstico → contenido relacionado» no pueden existir sin artículos: hoy hay cero. Interconectar primero produciría enlaces a un hub vacío.

**Nota de estado.** UX-001B.1, UX-001B.2, UX-001B.3, UX-001B.4, UX-001B.5, UX-001B.6, UX-001B.7, UX-001B.8, UX-001B.9, UX-001B.10 y UX-001C quedan **CLOSED / PASS técnico local / release ready** en `0.3.0`. UX-002.1 queda **PASS DOCUMENTAL** y UX-002.2–UX-002.7 quedan **PASS técnico local / release ready**. REL-003.1 confirma `0.3.0` **LIVE** en staging y producción con smoke HTTP anónimo PASS, sin migraciones ni cambios de secrets. El siguiente bloque, aún no iniciado, es OPS-001 — GHL Pilot Foundation.

## UX-002 — evolución comercial

### UX-002.1 Product Catalog Foundation — PASS DOCUMENTAL

La matriz maestra está en [business/VECIDYA_PRODUCT_CATALOG.md](business/VECIDYA_PRODUCT_CATALOG.md). Separa licencias, addons, servicios y consumos externos; define la evolución por necesidad; distingue diagnóstico inicial/profesional; y registra Aprende y la frontera HighLevel. No hubo cambios de código, rutas, schema, precios públicos, pagos ni integraciones.

### UX-002.2 Licencias Experience — PASS técnico local

`/licencias` está implementada con hero, definición de licencia, tres niveles, comparador de capacidades, evolución por necesidad, addons, FAQ y CTA a Diagnóstico. Las referencias `USD 39/mes`, `USD 59/mes` y `USD 89/mes` se muestran explícitamente como referencias comerciales; no hay checkout, pagos ni suscripciones.

### UX-002.3 Addons Experience — PASS técnico local

`/addons` está implementada con hero, definición, categorías de Comunicación, Automatización, Inteligencia Artificial e Integraciones, cards de capacidades, reglas de elección y CTA de Diagnóstico. No publica precios de addons, no activa consumos, checkout ni integración GHL.

### UX-002.4 Services Experience — PASS técnico local

`/servicios` está actualizada con seis áreas profesionales: Organización del negocio, Formalización de base, Presencia digital, Automatización, Inteligencia artificial y Marketing y crecimiento. La sección de relación separa licencia, addon, servicio y consumo externo; no hay precios generales, checkout, integración GHL ni capacidades ficticias.

### UX-002.5 Diagnostic Experience 2.0 — PASS técnico local

El resultado conserva el scoring y añade situación actual, observaciones, prioridades, camino recomendado y mapeo orientativo a Licencia, Addon, Servicio y Aprende. No hay persistencia, checkout ni recomendación de precio agresiva.

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

UX-001B.6 queda cerrado para la experiencia local. Sin persistencia hasta cumplir: consentimiento explícito, política de retención, schema/migración, autorización tenant si se asocia a usuario u organización, revisión legal, pruebas de privacidad, exportación/eliminación. La cobertura futura del scoring debe ser unitaria y cubrir las siete ramas; no forma parte de B.6.

### Contenido editorial

Primeros contenidos reales recomendados para `Qué debes saber`: qué significa formalizar un negocio; qué necesita realmente un negocio para empezar en digital; página web vs redes sociales; qué es SEO local; SEO, GEO y búsqueda con IA; qué es un CRM y cuándo lo necesitas; cómo evitar perder consultas y seguimientos; qué controlar de tu dominio y cuentas; qué métricas importan a un pequeño negocio; qué información debería encontrar alguien sobre ti. Todo artículo exige autor real, fecha, intención, fuentes cuando use datos, enlaces internos útiles y cero relleno SEO. Decidir el nombre único de la sección («Aprende» vs «Qué debes saber»).

### SEO/GEO

Antes de nuevas fases SEO, gate remoto: host canónico y redirect, canonical, robots y sitemap (y su prueba), indexabilidad, `og:image`/`og:url`, titles y descriptions, JSON-LD (`Organization`, perfiles; sin `Article`/`Review`/ratings ficticios) y coherencia del origen (canonical fijo vs origen de la request).

### Perfiles públicos

No convertir `BusinessProfile` en perfil universal por arrastre del Diagnóstico. Requiere especificación, política de identidad, autenticidad, moderación, reclamación de perfiles, schema y ADR. Pendientes de Business Profile ya identificados: despublicar, galería/R2, categorías normalizadas, CTA contextual, badge de verificación en la tarjeta, logo sin URL externa.

### Administración interna

Auditar servicios e integraciones (`AUDIT-COVERAGE-001`); mostrar en el detalle de negocio los datos de contacto antes de verificar (`ADMIN-UI-001`); alta/baja de `platform_admin` sin SQL (`PLATFORM-ADMIN-001`); motivo de suspensión; gestión de usuarios y moderación solo si el piloto crece más allá de negocios elegidos por Vecidya.

### Invitaciones (7B.2)

OAuth Gmail y entrega real ya están demostrados por EMAIL-001; queda completar el camino de verificación de email para que un invitado pueda aceptar (`INVITE-001`).

### Integraciones

GHL, Google, Meta, WhatsApp y otros solo con decisión explícita; guardan únicamente metadata tenant-scoped justificada y nunca duplican el CRM.

### Producción

PROD-001 y EMAIL-001 están cerrados en sus alcances; `app.vecidya.com`/`admin.vecidya.com`, el smoke remoto, secretos adicionales y cualquier manejo posterior de `vecidya-staging` requieren autorización independiente. La secuencia operativa vigente es `PROD-001 → EMAIL-001 → OPS-001 → LEGAL / REAL PROOF → GHL pilot → licenses → UX evolution`.

## Fuera de alcance permanente

- CRM propio que duplique GHL.
- Migración directa de la arquitectura Astro Legacy.
- Datos comerciales ficticios.
- Marketing político persuasivo, segmentación electoral o manipulación de audiencias.
