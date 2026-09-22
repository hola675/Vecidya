# VECIDYA — Estado del proyecto

Última reconciliación: **2026-09-22 (EMAIL-001C, deploy y Gmail confirmados)**. Rama `main`. Producto activo: `vecidya-platform/`. Versión pública desplegada vigente: `0.2.0`, Version ID `c38ce78b-648c-438c-a796-f20f7bf8e4b3`.

Este documento es el snapshot técnico completo. El estado corto y la deuda están en [STATUS.md](STATUS.md); entornos y publicación en [ENVIRONMENTS.md](ENVIRONMENTS.md); rutas y módulos en [STRUCTURE.md](STRUCTURE.md); pruebas en [TESTING.md](TESTING.md). Niveles de evidencia: [GOVERNANCE.md](GOVERNANCE.md).

## Resumen ejecutivo

Vecidya Platform es una aplicación SSR de React Router sobre Cloudflare Workers, Better Auth, Drizzle ORM y D1. Cubre identidad, organizaciones, membresías, permisos, perfil comercial (uno por organización), servicios Vecidya, directorio público (Vecindario), Diagnóstico anónimo, administración interna con gobierno de perfiles y una web pública institucional. Vecidya **no es un CRM**: GHL es el system of record comercial y hoy no existe ninguna integración con GHL.

Publicado en `vecidya.com` (verificado HTTP y manualmente el 2026-09-21): la web pública completa y **un** perfil real (`/vecindario/vecidya`), ahora sobre `vecidya-prod`; migraciones `0000`–`0009` están presentes. `hola@vecidya.com` autenticó en producción y accedió a `/app` y `/app/internal` como administrador de plataforma.

## Stack real

- Node `>=22.12.0` (probado con 24.15.0); pnpm `11.21.0`.
- React `19.3.0`, React Router `8.4.0` (SSR), TypeScript `7.0.2`, Vite `8.3.0`, Tailwind CSS `4.3.3`.
- Cloudflare Workers (`workers/app.ts`), D1, Wrangler `4.135.0`.
- Better Auth `1.7.5` (email + contraseña, plugin Organization) con Drizzle ORM `0.45.2`.
- Playwright `1.63.0` (solo pruebas). Sin framework de tests, sin CI.

## Límites permanentes

- Vecidya no es un CRM paralelo a GHL. GHL conserva contactos, leads, oportunidades, pipelines, conversaciones, citas CRM, workflows, automatizaciones y seguimiento.
- Legacy aporta referencias, no arquitectura.
- Sin negocios, testimonios, métricas, reviews, ratings ni datos comerciales ficticios.
- Todo recurso de organización verifica sesión, membresía, rol o permiso y operación.
- No se asume autorización de asociación con marcas de terceros.

## Producto público

### Recorrido y CTAs

Todas las rutas públicas responden 200 (`HTTP` 2026-09-20). `/aprende` **no existe** (404): el menú de escritorio lo llama «Aprende» pero enlaza a `/que-debes-saber`; el móvil y el footer dicen «Qué debes saber».

| Ruta | Datos | Estado | Notas |
| --- | --- | --- | --- |
| `/` | Estático (loader solo devuelve `origin`) | Funcional | ~600 palabras, 2 ilustraciones, JSON-LD `Organization` |
| `/vecindario` | D1 (`listPublishedBusinessProfiles`, opciones de filtro) | Funcional | GET `q`, `category`, `city`; sin paginación |
| `/vecindario/:slug` | D1 (perfil + horarios) | Funcional | 404 real si no publicado/suspendido; JSON-LD `LocalBusiness` |
| `/servicios` | Estático (5 fichas) | Funcional | Sin precios, paquetes ni garantías (grep) |
| `/diagnostico` | Cliente (`useState`) | Funcional | Ver sección |
| `/unete` | Estático | Funcional | Solo Diagnóstico y `mailto`; sin registro |
| `/contacto` | Estático | Funcional | Solo `mailto:hola@vecidya.com`; sin formulario |
| `/sobre-nosotros` | Estático | Funcional | Nombres de pila (Yoan, Edgar) sin fotos |
| `/que-debes-saber` | Estático | **Hub vacío** | 0 artículos; tarjetas no clicables |
| `/privacidad` | Estático | Funcional | Base pública; revisión legal pendiente |
| `/robots.txt`, `/sitemap.xml`, `/favicon.ico` | sitemap: D1 | Funcional | Sitemap: 9 rutas + perfiles publicados no suspendidos (hoy 10 URLs); favicon: redirect 302 |

CTAs con función separada: Diagnóstico (punto de partida), Vecindario (descubrir), Únete (iniciar proceso), Contacto (hablar). **Ninguna página pública enlaza a `/register`** (solo `/login` lo hace).

### Home: inventario por sección (`home.tsx`)

Ninguna sección lee D1. Sin buscador ni vecinos destacados; no enlaza a ningún `/vecindario/:slug`.

| # | Sección | Objetivo | ~Palabras | CTA → destino | Visual | Conexión |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Hero | Propuesta de valor | 45 | «Explorar el Vecindario» → `/vecindario`; «Hacer mi diagnóstico» → `/diagnostico` | `illus-mobile-local-discovery` | Vecindario, Diagnóstico |
| 2 | Vecindario | Buscar/entender/contactar | 95 | «Explorar negocios publicados» → `/vecindario` | ninguno | Vecindario |
| 3 | «Una base que se entiende» | Problema de presencia dispersa | 50 | ninguno | `illus-storefront-digital-profile` | Concepto de perfil |
| 4 | Diagnóstico | Presentarlo | 90 | «Conocer mi punto de partida» → `/diagnostico` | ninguno | Diagnóstico |
| 5 | Servicios | 4 áreas | 70 | «Conoce los servicios» → `/servicios` | ninguno | Servicios |
| 6 | Para quién | Audiencia | 60 | ninguno | ninguno | — |
| 7 | Aprende | Biblioteca | 40 | «Leer lo esencial» → `/que-debes-saber` | ninguno | Hub vacío |
| 8 | Cómo funciona | 3 pasos | 50 | ninguno | ninguno | — |
| 9 | FAQ | 4 `<details>` | 90 | ninguno | ninguno | — (sin FAQPage JSON-LD) |
| 10 | CTA final | Cierre | 50 | Diagnóstico y Vecindario (botones); Contacto (enlace) | fondo CSS | Diagnóstico, Vecindario, Contacto |

Dependencia de texto: 8 de 10 secciones son solo texto. Este inventario es la base de la fase de reducción de contenido (ver [ROADMAP.md](ROADMAP.md)).

### Vecindario

- Lista: `<form method="get">` renderizado en servidor sin JS; `q` = `LIKE %q%` **solo sobre `displayName`** (sin escapar `%`/`_`); `category` y `city` por igualdad exacta con opciones DISTINCT de perfiles publicados; tira de categorías (máx. 8, alfabética).
- Orden `displayName ASC, slug ASC`; **sin paginación ni límite**.
- Excluye borradores y perfiles suspendidos (lista, opciones de filtro, perfil por slug y sitemap).
- Tarjeta: logo o ícono, categoría, nombre, ciudad/país, descripción corta, «Ver perfil». Sin badge de verificado, contacto ni horarios en la tarjeta.
- Estado vacío con CTAs (Limpiar / Diagnóstico); su texto dice «con esos filtros» incluso sin filtros.
- Slug: igualdad exacta sensible a mayúsculas; sin redirección si cambia.
- Perfil: descripción, contacto (WhatsApp → teléfono → web como jerarquía de CTA), redes, detalles, horarios compactados; un `CTASection` fijo (Vecindario, Servicios, Diagnóstico, Contacto) **no contextual**. Sin negocios relacionados ni contenido relacionado.
- JSON-LD `LocalBusiness`: `name`, `url`, `description`, `image`, `telephone`, `email`, `address` (localidad/país), `sameAs` (solo redes reales), `areaServed`, `openingHoursSpecification` (solo días abiertos). No emite web del negocio, WhatsApp, categoría, `geo` ni `priceRange`.
- Lo que es funcional hoy: filtrado y perfiles reales. Lo que es solo presentación: los ejemplos de rubros del placeholder del buscador (no buscan por rubro).

### Diagnóstico (`diagnostic.tsx`, 680 líneas)

Confirmado por código (greps de `fetch`, `localStorage`, `sessionStorage`, `cookie`, `indexedDB`, `<form`, `/api/`, `ghl`, `crm`: 0 coincidencias): **anónimo, efímero, solo cliente, sin persistencia, sin API, sin CRM/GHL, sin email obligatorio**.

- 7 «puertas» de entrada (`business`, `professional`, `creator`, `project`, `organization`, `public_figure`, `idea`); 14 preguntas definidas, cada camino recibe 7–8; ramificación por el tipo de presencia.
- 4 preguntas de multiselección con opciones exclusivas («ninguno», «no sé»).
- Puntuación: 8 dimensiones (identidad, presencia, visibilidad, confianza, conexión, comunidad, evolución, organización), base 46, acotadas a [18, 92]; 5 posiciones; confianza alta/media/baja.
- Resultado: máx. 3 fortalezas y 3 próximos pasos (prioridades críticas primero); **siempre 1 oportunidad**; CTA adaptativo con 4 etiquetas.
- CTAs: `mailto:hola@vecidya.com` prellenado en cliente (tipo, posición, área prioritaria, objetivo; sin respuestas completas) y `/contacto`; «Rehacer». **Sin enlaces a Servicios, Vecindario ni contenido.**
- Defectos (ver `DIAG-001`): respuestas antiguas siguen puntuando si se cambia el perfil; `organizacion` solo disminuye; ids de dimensión sin acento en pantalla; ayuda que promete «revisar tus respuestas» sin pantalla de revisión.

### Servicios (`/servicios`)

Cinco servicios estáticos, cada uno con problema, cómo ayuda, tres entregables y cuándo tiene sentido: Estructuración, Formalización, Visibilidad, Presencia digital, Organización y crecimiento. CTAs: `/diagnostico` y `/contacto`. Sin precios ni paquetes; el eyebrow «SERVICIOS COMPRABLES» sugiere compra sin mecánica de compra. **No lee `service_catalog`**: el catálogo privado (3 servicios: presencia, marketing, CRM) es un modelo distinto del contenido público.

### SEO, navegación y accesibilidad (evidencia de código)

- Meta por ruta con `publicMeta`: título `X | Vecidya`, descripción, `index, follow`, `og:title/description/type/locale`, canonical **fijo** `https://vecidya.com`. Sin `og:image`, `og:url` ni Twitter cards. Sitemap, robots y URLs de JSON-LD usan el origen de la request (en `workers.dev` serían inconsistentes con el canonical).
- Robots: `Allow: /`; `Disallow: /app, /api, /login, /register`; sitemap sin `lastmod`.
- `www.vecidya.com` → 301 → apex (`workers/app.ts`).
- Navegación: desktop (Inicio, Vecindario, Diagnóstico, Aprende, Servicios, Nosotros, Contacto) + «Acceder» y «Únete a Vecidya»; móvil `<details>` con Escape y retorno de foco; footer con 9 enlaces.
- Accesibilidad: skip-link, `:focus-visible`, `aria-label` en navegaciones, `prefers-reduced-motion`, breakpoints 430/760/820/900 px. Defectos: 8 páginas con `<main>` anidado; sin `role="progressbar"`/foco en cambio de pregunta del Diagnóstico.
- Assets: 14 WebP activos + 4 PNG conservados (ícono de marca canónico y 3 recursos seleccionados sin uso); PERF-001 redujo `18,649,999` a `4,369,378` bytes (`76.57 %`). Las imágenes de contenido activo tienen dimensiones declaradas y los recursos below-the-fold usan lazy loading sin aplicarlo al visual principal/LCP.

### Política de assets visuales

- Fotografías y raster complejo deben entrar optimizados; WebP es el formato preferido cuando conserva calidad, transparencia y compatibilidad suficientes.
- SVG se conserva para vectores, iconos y gráficos que no obtienen beneficio al convertirse a bitmap.
- Se evitan originales sobredimensionados y duplicados innecesarios; antes de retirar un original se comprueban referencias, build, respuestas de assets y renderizado visual.

## Aplicación privada (`/app`)

| Ruta | Guarda | Función real |
| --- | --- | --- |
| `/app` | sesión | Organización activa, resumen de perfil y servicios, número de miembros; selector de organización (siempre visible); crear organización; cerrar sesión |
| `/app/account` | sesión | Datos de Better Auth; actualiza solo el nombre. Email/contraseña/MFA/eliminación: solo texto («no forma parte de esta fase») |
| `/app/organization` | `member:read` | Miembros, cambio de rol, quitar, invitar, cancelar invitación (invitar responde error si Gmail no está configurado) |
| `/app/business-profile` | `business-profile:read/update/publish` | Editor completo del perfil (ver matriz) |
| `/app/services` | sesión + organización activa | Lista de solo lectura de servicios asignados; sin solicitud/compra |
| `/app/invitations/:id` | sesión | Aceptar invitación (Better Auth valida email y `emailVerified`); bloqueada en la práctica (`INVITE-001`) |

Solo `/app` tiene el shell; las demás páginas son rutas hermanas con enlace «Volver». Después del login, el cliente usa `organization.list` y `organization.setActive` de Better Auth para fijar la primera organización válida; el selector permite cambiarla. No hay enlace de `/app` a `/app/internal`.

## Multi-organización

Soportado y probado (`pe-b` pasa): un usuario puede pertenecer a varias organizaciones y ser owner de varias (`member` es único por `(organization_id, user_id)`, sin límite de organizaciones); cada organización tiene como máximo un `business_profile` (índice único por `organization_id`); `slug` es único global para perfiles y para organizaciones; `session.active_organization_id` selecciona el contexto y se inicializa con la primera membresía válida; al retirar membresía se limpian sesiones activas obsoletas; toda consulta tenant filtra por la organización verificada. `platform_member` es una tabla separada que nunca se deriva de `member.role`. Detalle de aislamiento en [DATABASE.md](DATABASE.md) y [ARCHITECTURE.md](ARCHITECTURE.md).

## Business Profile: matriz de campos

`IMPL` = implementado en todas las capas aplicables. Editor = `/app/business-profile`. LD = JSON-LD.

| Campo | Schema | Validación | Editor | API | Público | Tarjeta | LD | Clase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `display_name` | `0003` | requerido ≤120 | sí | sí | sí | sí | `name` | IMPL |
| `slug` | `0003` | `^[a-z0-9]+(-[a-z0-9]+)*$` ≤80; único global | sí | sí | URL | enlace | `url` | IMPL |
| `short_description` | `0003` | ≤280; requerido para publicar | sí | sí | sí | sí | fallback | IMPL |
| `description` | `0003` | ≤5000 | sí (input de una línea) | sí | sí | no | `description` | IMPL (editor débil) |
| `category` | `0003` | ≤100 libre; requerido para publicar | sí | sí | sí | eyebrow | — | IMPL (sin LD; texto libre fragmenta filtros) |
| `city`, `country` | `0003` | ≤120 | sí | sí | sí | sí | `address` | IMPL |
| `phone` | `0003` | ≤50 sin formato | sí | sí | `tel:` | no | `telephone` | IMPL |
| `public_email` | `0003` | regex ≤254 | sí | sí | `mailto:` | no | `email` | IMPL |
| `website_url` | `0003` | http/https ≤2048 | sí | sí | botón | no | — | IMPL (sin LD) |
| `logo_url` | `0003` | http/https | sí (URL) | sí | imagen | imagen | `image` | IMPL solo como **URL de texto** (sin subida ni R2) |
| `whatsapp` | `0007` | `+` + 8–15 dígitos | sí | sí | CTA `wa.me` | no | (deliberado: no) | IMPL |
| `instagram_url`, `facebook_url`, `linkedin_url` | `0007` | host esperado | sí | sí | enlaces | no | `sameAs` | IMPL |
| `service_mode` | `0008` | enum `in_person/remote/hybrid` | sí | sí | «Cómo atiende» | no | — | IMPL |
| `service_area` | `0008` | ≤280 texto libre | sí | sí | «Cobertura» | no | `areaServed` | IMPL |
| horarios (`business_hours`) | `0008` | `HH:MM`, apertura<cierre, 1–7 | sí (sección propia) | sí | compactados | no | `openingHoursSpecification` | IMPL |
| `status` draft/published | `0003` | 4 campos obligatorios para publicar | Publicar | no puede publicar | filtro | filtro | — | IMPL; **despublicar = FUTURE** |
| verificación / suspensión | `0009` | 4 acciones solo `platform_admin` | señal de solo lectura | no | badge / 404 | excluido | (no) | IMPL; badge en tarjeta: PUBLIC MISSING |
| galería/imágenes | — | — | — | — | — | — | — | FUTURE |
| SEO title/description propios, `og:image` | — | — | — | — | — | — | — | FUTURE |

Límites conocidos: los horarios no admiten turnos partidos, nocturnos ni festivos y se reemplazan con delete+insert no atómico; `city`/`country` son ubicación de referencia (no cobertura); el loader público devuelve la fila completa (incluye `organizationId` e `id`).

## Administración interna (`/app/internal*`)

Guarda única: `requirePlatformAdmin` (fila `platform_member` con rol `platform_admin` y estado `active`; `staff` no pasa). Independiente de `member.role`: owner/admin de organización, `platform_admin` inactivo y usuarios normales reciben 403 (probado en `d1`). La cuenta operativa `hola@vecidya.com` quedó con `platform_admin` activo y `owner` de Vecidya; no existe UI ni API permanente para gestionar autoridad de plataforma.

| Ruta | Muestra | Mutaciones |
| --- | --- | --- |
| `/app/internal` | 4 tarjetas | — |
| `/services` | organizaciones, catálogo activo, asignaciones | upsert de estado (`pending/active/suspended/ended`); sin auditoría |
| `/organizations`, `/:id` | dueño, miembros (con emails), perfil, servicios, integraciones | solo lectura |
| `/businesses` | todos los perfiles (borrador y publicados), completitud | solo lectura |
| `/businesses/:id` | detalle, gobierno, servicios, últimas 20 acciones | verificar, retirar verificación, suspender, reactivar (batch atómico gobierno + auditoría; sin motivo) |
| `/integrations` | conexiones (proveedor, `externalId`, estado; `metadata` oculta) | solo lectura |
| `/audit` | últimas 200 acciones de gobierno | solo lectura |

Vecidya **no puede hoy**: listar/banear/suplantar usuarios, transferir ownership, moderar antes de publicar, suspender/eliminar organizaciones, editar un perfil tenant, gestionar el catálogo, conceder/revocar `platform_admin` mediante UI permanente, actualizar/eliminar integraciones, registrar motivo de suspensión, gestionar apelaciones ni enviar emails de moderación.

## Integraciones y frontera Vecidya ↔ GHL

| Elemento | Clasificación |
| --- | --- |
| `integration_connection` + `POST /api/platform/organizations/:id/integrations` + `GET` tenant + overview interno | **FOUNDATION ONLY**: registro de metadata; sin llamadas salientes; proveedor = cualquier kebab-case |
| Adaptador Gmail transaccional (`server/email/mail.server.ts`) | **PASS en producción; Gmail API send y entrega real confirmados; verificación/invitaciones separadas** |
| GHL | **TEXT ONLY** (solo documentación; 0 código) |
| Google, Meta, WhatsApp API, Stripe, Twilio | **NOT FOUND** |
| WhatsApp/Instagram/Facebook/LinkedIn en perfil | Campos y enlaces (`wa.me`), no integración |

Vecidya es responsable de cuentas, organizaciones, membresías, permisos, perfiles, servicios, directorio, experiencia pública, portal y metadata de integraciones. GHL será el system of record de contactos, leads, oportunidades, pipelines, conversaciones, citas, workflows, automatizaciones y seguimiento. No se implementa un CRM paralelo.

## Mapa de producto

### Conexiones actuales

```text
Home ──► Vecindario ──► Perfil ──(CTA fijo)──► Vecindario | Servicios | Diagnóstico | Contacto
Home ──► Servicios ──► Diagnóstico | Contacto
Home ──► Diagnóstico ──► Resultado ──► mailto prellenado | Contacto | Rehacer
Home ──► Contacto (solo enlace contextual del CTA final)
Home ──► Qué debes saber (hub vacío) ──► Diagnóstico | Contacto
Vecindario (lista) ──► Diagnóstico | Contacto (estado vacío)
App: sesión ──► /app ──► organización activa (selector) ──► Perfil (/app/business-profile) ──► página pública
                                                     └─────► Servicios (/app/services)
Internal Admin: /app/internal ──► Organizaciones | Negocios (gobierno) | Servicios | Integraciones | Auditoría
```

### Conexiones deseadas — todas FUTURE (no existen)

Diagnóstico → contenido relacionado · Diagnóstico → servicio contextual · Perfil → negocios relacionados · Perfil → contenido relacionado · Artículo → Diagnóstico · Artículo → Servicio · Home → vecinos reales/búsqueda · Perfil → CTA contextual al negocio · Web pública → registro.

## Piloto de negocios reales (Edgar)

RP-001A añadió `tests/e2e/rp-001a-local-real-proof-check.mjs`: crea localmente tres organizaciones con un owner sintético, deja los datos no confirmados vacíos o `MISSING / UNCONFIRMED`, prueba borradores, intenta publicar sin éxito y elimina todos los fixtures. No contiene cuenta real de Edgar, secretos ni datos privados; ningún dato del piloto está publicado.

| Negocio | Organización | Owner/membresía | Perfil local RP-001A | Publicación | Datos faltantes | Autorización pendiente | Readiness |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A «Edgar \| Asesor de Seguros SURA» | 1 org. independiente (modelo multi-org) | owner sintético local; Edgar no creado | Borrador con nombre documentado; categoría y demás campos vacíos | no | Categoría, descripción corta, ciudad/país, teléfono, WhatsApp, email, web, redes, horarios, cobertura, logo, servicios | Marca SURA: acreditación no confirmada | **BLOCKED** |
| B «Asesorar-T» | 1 org. independiente | owner sintético local | Borrador con `MISSING / UNCONFIRMED`; no se seleccionó variante pública | no | Nombre público exacto, descripción, categoría y todos los demás campos | Confirmar nombre | **BLOCKED BY MISSING DATA** |
| C «Agrofanescol» | 1 org. independiente | owner sintético local | Borrador con nombre documentado; categoría y demás campos vacíos | no | Descripción corta, categoría y todos los demás campos | — | **MODEL MISMATCH / PARTIAL** (ecosistema/comunidad con una sola categoría y CTA) |

Consideraciones de producto detectadas: sin guarda de marcas/nombres; categoría libre pero obligatoria para publicar; un solo CTA y una categoría por perfil; logo requiere URL externa; no existe acción tenant de despublicación; el cambio de organización y aislamiento local sí pasaron en RP-001A. Para publicar pilotos externos aún hacen falta: cuenta/email reales, decisiones de nombre y marca, datos confirmados y autorización explícita.

### Mapeo RP-001A: dato real → modelo actual

| Dato | Campo Vecidya | Soporte | Obligatorio | Limitación/riesgo evidenciado |
| --- | --- | --- | --- | --- |
| Identidad y pertenencia | `organization.name`, `member`, `business_profile.displayName` | Parcial | Organización, miembro y nombre visible para guardar | No hay verificación de identidad comercial; una cuenta local no prueba titularidad real |
| Nombre público estable | `business_profile.displayName`, `slug` | Parcial | Ambos para publicar | El slug es técnico; B no puede elegir variante sin confirmación |
| Categoría | `business_profile.category` | Parcial | Sí para publicar, aunque nullable en schema | Campo libre; no modela ecosistemas con múltiples facetas |
| Ubicación | `city`, `country` | Parcial | No | Sin dirección, coordenadas, radio ni geocodificación |
| Contacto y presencia | `phone`, `publicEmail`, `websiteUrl`, WhatsApp y tres URLs sociales | Sí, opcional | No | No se puede inferir ningún valor faltante; logo solo admite URL externa |
| Horarios y cobertura | `business_hours`, `serviceMode`, `serviceArea` | Sí, opcional | No | Sin zona horaria, festivos, excepciones ni múltiples turnos |
| Publicación | `status=draft/published` y gobierno de plataforma | Sí | Reglas mínimas: nombre, slug, descripción corta, categoría | No existe publicación remota ni acción tenant de despublicación en este bloque |
| Descubrimiento y SEO | Vecindario, meta pública y JSON-LD `LocalBusiness` | Sí para publicados | Solo perfiles publicados | RP-001A confirmó que borradores no aparecen ni emiten JSON-LD; no validó publicación de pilotos |

## Discrepancias documentales corregidas en este baseline

- `README` de plataforma afirmaba «no hay directorio» y «no hay UI de invitaciones»: ambos existen.
- `PROJECT_STATE` decía que 4 pruebas usan `vecidya-dev`: son 8 (+1 transitiva).
- «Selector de organización solo con más de una»: siempre se muestra.
- «Integraciones read-only»: la UI lo es; existe un POST de plataforma.
- «Admin protegida por `platform_member` activo»: exige además rol `platform_admin`.
- `DATABASE.md` y `AGENTS.md` mandaban aplicar migraciones a `vecidya-dev`: el binding es `DB` → `vecidya-staging`.
- «Producción pública» se leía como producción real: es staging.
- Piloto E1 «verificado con datos reales»: no reproducible desde el repositorio.
- Guía «máximo 15 documentos»: sustituida por máximo 20 (hoy 13).
