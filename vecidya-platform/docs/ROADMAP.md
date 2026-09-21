# Roadmap

Última reconciliación: 2026-09-21 (PROD-001C, PROD-001 cerrado).

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
| 6 | Home Experience Reduction | Reducir texto y mostrar producto real en Home | Independiente de 4–5; puede ir en paralelo |
| 7 | Visual System Expansion | Ampliar sistema visual y assets | G2 |
| 8 | Educational Content | Primeros artículos reales | Autor y fuentes reales |
| 9 | Ecosystem Interconnection | Diagnóstico → contenido/servicio; perfil → relacionados; artículo → diagnóstico/servicio | 5 (vecinos) y 8 (artículos) |
| 10 | Vecindario / Business Profile / UX | Descubrimiento, campos, cobertura E2E, a11y y SEO | 5–9 |

**Corrección 1 — RR-001 precede Real Proof.** La evidencia mostró prerrequisitos técnicos: pruebas stale por el nombre D1 obsoleto, PX-B roto, selección de organización al login, limpieza de sesiones tras retirar membresía y protección server-side de perfiles publicados. RR-001 quedó cerrado antes de PERF-001 y permanece separado del deploy y del piloto.

**Corrección 2 — Contenido (6) antes de Interconexión (7).** Las conexiones «Artículo → Diagnóstico/Servicio» y «Diagnóstico → contenido relacionado» no pueden existir sin artículos: hoy hay cero. Interconectar primero produciría enlaces a un hub vacío.

**Nota de paralelismo.** Home (3) es 100 % estático y no depende de datos ni de backend; puede avanzar mientras el usuario resuelve los datos del piloto (1), que es el cuello de botella (depende de terceros). Visual (4) depende de la decisión G2.

## Siguiente bloque recomendado: EMAIL-001

- **Objetivo**: construir la fundación de correo transaccional según autorización independiente.
- **Alcance**: únicamente EMAIL-001; PROD-001 queda cerrado.
- **Fuera de alcance**: despliegue del Worker staging dedicado, pruebas destructivas y cambios de producción no relacionados.

## Trabajo futuro por área

### Real Proof / piloto

`RP-001A — Local Real-Proof Validation` queda en **PASS LOCAL**: el fixture controlado reproduce las tres organizaciones documentadas como borradores, bloquea publicación incompleta y confirma aislamiento sin datos privados versionados. `E2 — Remote Pilot Publication` sigue pendiente y requiere G3/G4. Perfil A (SURA) permanece `BLOCKED` hasta acreditar la marca o ajustar nombre/copy; B requiere confirmar el nombre; C presenta `MODEL MISMATCH / PARTIAL` por su naturaleza de ecosistema/comunidad. No se añade schema nuevo ni una guarda de marcas en RP-001A; `PUBLIC-GROWTH-001 C2` se cierra solo con vecinos externos publicados.

### Diagnóstico

Sin persistencia hasta cumplir: consentimiento explícito, política de retención, schema/migración, autorización tenant si se asocia a usuario u organización, revisión legal, pruebas de privacidad, exportación/eliminación. Antes: corregir `DIAG-001` y proteger el motor con pruebas.

### Contenido editorial

Primeros contenidos reales recomendados para `Qué debes saber`: qué significa formalizar un negocio; qué necesita realmente un negocio para empezar en digital; página web vs redes sociales; qué es SEO local; SEO, GEO y búsqueda con IA; qué es un CRM y cuándo lo necesitas; cómo evitar perder consultas y seguimientos; qué controlar de tu dominio y cuentas; qué métricas importan a un pequeño negocio; qué información debería encontrar alguien sobre ti. Todo artículo exige autor real, fecha, intención, fuentes cuando use datos, enlaces internos útiles y cero relleno SEO. Decidir el nombre único de la sección («Aprende» vs «Qué debes saber»).

### SEO/GEO

Antes de nuevas fases SEO, gate remoto: host canónico y redirect, canonical, robots y sitemap (y su prueba), indexabilidad, `og:image`/`og:url`, titles y descriptions, JSON-LD (`Organization`, perfiles; sin `Article`/`Review`/ratings ficticios) y coherencia del origen (canonical fijo vs origen de la request).

### Perfiles públicos

No convertir `BusinessProfile` en perfil universal por arrastre del Diagnóstico. Requiere especificación, política de identidad, autenticidad, moderación, reclamación de perfiles, schema y ADR. Pendientes de Business Profile ya identificados: despublicar, galería/R2, categorías normalizadas, CTA contextual, badge de verificación en la tarjeta, logo sin URL externa.

### Administración interna

Auditar servicios e integraciones (`AUDIT-COVERAGE-001`); mostrar en el detalle de negocio los datos de contacto antes de verificar (`ADMIN-UI-001`); alta/baja de `platform_admin` sin SQL (`PLATFORM-ADMIN-001`); motivo de suspensión; gestión de usuarios y moderación solo si el piloto crece más allá de negocios elegidos por Vecidya.

### Invitaciones (7B.2)

Requiere (1) configurar `RESEND_API_KEY`/`EMAIL_FROM` y demostrar entrega real, y (2) definir el camino de verificación de email (o desactivar `requireEmailVerificationOnInvitation` con decisión de seguridad) para que un invitado pueda aceptar (`INVITE-001`).

### Integraciones

GHL, Google, Meta, WhatsApp y otros solo con decisión explícita; guardan únicamente metadata tenant-scoped justificada y nunca duplican el CRM.

### Producción

PROD-001 prepara `vecidya-prod` y la separación de configuración, pero el cutover público, smoke remoto, `app.vecidya.com`/`admin.vecidya.com`, secretos productivos dedicados y cualquier manejo posterior de `vecidya-staging` requieren autorización independiente. La secuencia operativa prevista es `PROD-001 → EMAIL-001 → OPS-001 → LEGAL / REAL PROOF → GHL pilot → licenses → UX evolution`.

## Fuera de alcance permanente

- CRM propio que duplique GHL.
- Migración directa de la arquitectura Astro Legacy.
- Datos comerciales ficticios.
- Marketing político persuasivo, segmentación electoral o manipulación de audiencias.
