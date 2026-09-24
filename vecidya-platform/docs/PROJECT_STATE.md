# VECIDYA — Estado del proyecto

Última reconciliación: **2026-09-24 (`0.4.2` local; `0.4.1` sigue LIVE en staging y producción; DIAG-002C + UX-003.1–003.5; VIS-001B Foundations Implementation cerrado en local)**. Rama `main`. Producto activo: `vecidya-platform/`. Versión fuente/local: `0.4.2`; versión desplegada en producción: `0.4.1`, Version ID `eec3de6a-6711-4eff-91de-b413406e3618`; staging Version ID `c7f7ee8b-e528-42d5-840c-ad7b4c9a9454`. `0.4.2` no está desplegada.

Este documento es el snapshot técnico completo. El estado corto y la deuda están en [STATUS.md](STATUS.md); entornos y publicación en [ENVIRONMENTS.md](ENVIRONMENTS.md); rutas y módulos en [STRUCTURE.md](STRUCTURE.md); pruebas en [TESTING.md](TESTING.md). Niveles de evidencia: [GOVERNANCE.md](GOVERNANCE.md).

VIS-001A (auditoría documental) y VIS-001B (Foundations Implementation) están cerrados en local. VIS-001B corrigió tres defectos reproducidos en código y navegador: la animación de entrada de `.auth-card` nunca se desactivaba con `prefers-reduced-motion: reduce` porque `.auth-shell{animation:none}` perdía la guerra de especificidad contra `.auth-layout > .auth-card`; las anclas de categoría de `/addons` apuntaban a ids inexistentes; y el grid compacto de `/vecindario` (1–2 resultados) ignoraba la columna única móvil por el mismo problema de especificidad. También: se deduplicó por completo el bloque Auth de `app.css` (dos declaraciones casi idénticas de `.auth-shell`/`.auth-layout`/`.auth-card`), lo que además reveló y corrigió un defecto de contraste real (`.auth-brand` resolvía a texto blanco sobre la tarjeta blanca de `verify-email`, invisible, por ser la última de tres declaraciones con la misma especificidad); se consolidaron 60 usos de pesos de fuente arbitrarios (650/750/850/950, verificados empíricamente como renderizado idéntico a 700/800 en Arial) a pesos reales soportados; se alias-earon duplicados literales de `--ink`/`--blue`/`--blue-dark` a sus tokens; y se corrigió con `:has()` el estado vacío compartido (`.empty-state`) que confinaba el texto a una columna de 4.25rem cuando no había imagen (reproducido y verificado en runtime, sin tocar lógica de App/Admin). Login, Registro y recuperación siguen compartiendo `AuthShell`. `typecheck`, `build`, `test:unit` (75/75) y los E2E `addons`, `licenses`, `commercial-review` y `pg-c1` pasaron contra el Worker local real; visual QA manual cubrió Home, Licencias, Addons, Servicios, Aprende, Diagnóstico, Login, Registro y Verificar correo en 1366 y una muestra en 390. Estos cambios no alteran rutas, arquitectura comercial, scoring, GHL, D1 ni auth backend, y no están publicados. Véase [STATUS.md](STATUS.md) y [ROADMAP.md](ROADMAP.md).

## Resumen ejecutivo

Vecidya Platform es una aplicación SSR de React Router sobre Cloudflare Workers, Better Auth, Drizzle ORM y D1. Cubre identidad, organizaciones, membresías, permisos, perfil comercial (uno por organización), servicios Vecidya, directorio público (Vecindario), Diagnóstico anónimo, administración interna con gobierno de perfiles y una web pública institucional. Vecidya **no es un CRM**: GHL es el system of record comercial y hoy no existe ninguna integración con GHL.

Publicado en `vecidya.com` (verificado HTTP el 2026-09-22 y autenticación histórica manual): la web pública completa y **un** perfil real (`/vecindario/vecidya`), ahora sobre `vecidya-prod`; migraciones `0000`–`0009` están presentes. EMAIL-001 añadió evidencia manual autorizada del flujo `forgot-password → Gmail real → enlace de producción → reset-password → contraseña modificada` para `hola@vecidya.com`; la autenticación posterior con la nueva contraseña no fue declarada sin evidencia separada.

## Stack real

- Node `>=22.12.0` (probado con 24.15.0); pnpm `11.21.0`.
- React `19.3.0`, React Router `8.4.0` (SSR), TypeScript `7.0.2`, Vite `8.3.0`, Tailwind CSS `4.3.3`.
- Cloudflare Workers (`workers/app.ts`), D1, Wrangler `4.135.0`.
- Better Auth `1.7.5` (email + contraseña, plugin Organization) con Drizzle ORM `0.45.2`.
- Playwright `1.63.0` (E2E) y `node:test` con type stripping para pruebas unitarias (`tests/unit`, `tests/email`). Sin framework externo ni CI.

## Límites permanentes

- Vecidya no es un CRM paralelo a GHL. GHL conserva contactos, leads, oportunidades, pipelines, conversaciones, citas CRM, workflows, automatizaciones y seguimiento.
- Legacy aporta referencias, no arquitectura.
- Sin negocios, testimonios, métricas, reviews, ratings ni datos comerciales ficticios.
- Todo recurso de organización verifica sesión, membresía, rol o permiso y operación.
- No se asume autorización de asociación con marcas de terceros.

## Producto público

### Catálogo comercial UX-002.1

La matriz comercial de referencia está documentada en [business/VECIDYA_PRODUCT_CATALOG.md](business/VECIDYA_PRODUCT_CATALOG.md). Define las fronteras entre licencia, addon, servicio y consumo externo; documenta Cuadra, Barrio y Ciudad; separa diagnóstico inicial y profesional; fija la estructura editorial de Aprende; y registra la frontera prevista con HighLevel.

Este catálogo es **diseño comercial documental**, no una capacidad implementada. Los precios (`$39`, `$59`, `$89`) no están facturados ni conectados a checkout. OPS-001 añade una fundación documental de HighLevel: la cuenta real y el plan contratado siguen **NOT VERIFIED**, la plataforma actual sigue sin integrar HighLevel y no implementa un CRM paralelo.

### Recorrido y CTAs

Todas las rutas públicas responden 200 (`HTTP` 2026-09-20). `/aprende` es la ruta canónica de la experiencia educativa; `/que-debes-saber` permanece como alias legado.

| Ruta | Datos | Estado | Notas |
| --- | --- | --- | --- |
| `/` | Estático (loader solo devuelve `origin`) | Funcional | ~600 palabras, 2 ilustraciones, JSON-LD `Organization` |
| `/vecindario` | D1 (`listPublishedBusinessProfiles`, opciones de filtro) | Funcional | GET `q`, `category`, `city`; sin paginación |
| `/vecindario/:slug` | D1 (perfil + horarios) | Funcional | 404 real si no publicado/suspendido; JSON-LD `LocalBusiness` |
| `/servicios` | Estático (5 fichas) | Funcional | Sin precios, paquetes ni garantías (grep) |
| `/licencias` | Estático | Funcional local / release ready | Cuadra, Barrio y Ciudad; comparador, evolución, addons, FAQ y CTA; consulta de disponibilidad, sin importes públicos ni checkout |
| `/addons` | Estático | Funcional local / release ready | Categorías de comunicación, automatización, IA e integraciones; cards de capacidades y separación comercial; sin precios ni checkout |
| `/diagnostico` | Cliente: motor puro `app/features/diagnostic` + `useState`; entrada contextual `?perfil=` y `?objetivo=` | Funcional y publicada (`0.4.1`) | Ver sección |
| `/unete` | Estático | Funcional | Dos entradas: Diagnóstico o Contacto; preparación breve y tres pasos; sin registro |
| `/contacto` | Estático | Funcional | Email `hola@vecidya.com`, guidance contextual, privacidad y Diagnóstico; sin formulario ni canales ficticios |
| `/sobre-nosotros` | Estático | Funcional | Propósito, historia, equipo real, forma de trabajar y punto de vista; fotos WebP optimizadas |
| `/aprende` | Estático | Funcional local / release ready | Centro de conocimiento, 5 categorías, 4 artículos, tarjetas, CTA y metadata |
| `/aprende/:slug` | Estático | Funcional local / release ready | Artículo con autor Yoan Ortiz, imagen educativa, índice, CTA relacionado y metadata canonical/OG |
| `/que-debes-saber` | Redirect 301 | Funcional | Compatibilidad legado hacia la experiencia canónica `/aprende`; no compite como página indexable |
| `/privacidad` | Estático | Funcional | Datos actuales, uso/control, límites, derechos y email de contacto; sin entidad legal inventada |
| `/robots.txt`, `/sitemap.xml`, `/favicon.ico` | sitemap: D1 | Funcional | Sitemap: 11 rutas + perfiles publicados no suspendidos (hoy 12 URLs); favicon: redirect 302 |

CTAs con función separada: Diagnóstico (punto de partida), Vecindario (descubrir), Únete (iniciar proceso), Contacto (hablar). **Ninguna página pública enlaza a `/register`** (solo `/login` lo hace).

### Revisión comercial UX-002.7

- El recorrido público queda auditado como `Aprende → Diagnóstico → Licencias → Addons → Servicios → Contacto`: Aprende explica, Diagnóstico orienta, Licencias presentan una base continua, Addons amplían capacidades, Servicios comunican trabajo personalizado y Contacto abre conversación.
- CTAs verificados: Aprende → Diagnóstico/Contacto; Diagnóstico → Licencias/Addons/Servicios/Aprende/Contacto; Licencias → Diagnóstico/Servicios/Addons; Addons → Diagnóstico/Licencias/Servicios; Servicios → Diagnóstico/Contacto/Licencias/Addons.
- La separación comercial permanece explícita: licencia ≠ servicio, addon ≠ consumo y herramienta ≠ resultado. Los importes de trabajo de Cuadra/Barrio/Ciudad no se publican; no hay checkout, pagos ni suscripciones.
- La auditoría no encontró GHL/HighLevel en la superficie pública ni rutas privadas (`/app`, `/app/internal`, `/api`, `/login`, `/register`) en el sitemap. Header y footer mantienen navegación pública real, incluido Nosotros, Aprende, Diagnóstico, Servicios, Licencias, Addons, Contacto y Legal.
- Validación versionada: `commercial-experience-review-check.mjs` PASS en 1366/768/390/360; las brechas SEO globales preexistentes (robots/favicon dedicados y a11y completa) siguen registradas en `STATUS.md`.

### Únete + Contacto (`join.tsx`, `contact.tsx`)

- UX-001B.7 separa responsabilidades: `/unete` responde cómo empezar y ofrece dos caminos (no sé qué necesito → Diagnóstico; sé qué necesito → Contacto), mientras `/contacto` responde cómo hablar y declara email como único canal directo disponible.
- `/unete` conserva `illus-business-onboarding-form.webp` como apoyo visual, lista cinco piezas de contexto útiles y reduce el proceso a tres pasos sin prometer SLA, llamadas, registro, compra o propuesta automática.
- `/contacto` mantiene `mailto:hola@vecidya.com`, explica qué enviar, qué esperar, enlaza `/privacidad` y no muestra teléfono, WhatsApp, chat, booking ni formulario persistente.

### Aprende (`knowledge.tsx`, `learn-article.tsx`)

- UX-001B.9 establece `/aprende` como ruta canónica y mantiene `/que-debes-saber` como alias. La página diferencia aprendizaje de Servicios y Diagnóstico: explica cómo entender y mejorar la presencia digital.
- UX-002.6 convierte `/aprende` en un centro de conocimiento estático: cinco categorías iniciales y cuatro artículos reales escritos/atribuidos a Yoan Ortiz, con tarjetas, excerpt, imagen y enlaces a `/aprende/:slug`.
- Cada artículo incluye problema, explicación sencilla, ejemplos, siguiente paso, índice accesible, CTA contextual a Diagnóstico o Servicios, metadata canonical/Open Graph y aparece en sitemap. Los diagramas propios viven en `public/assets/learn/` como SVG optimizados.
- El contenido se mantiene deliberadamente sin CMS, autores dinámicos, fechas editoriales inventadas, comentarios, newsletter, buscador avanzado o cursos.

### Legal & Trust (`privacy.tsx`, `public-layout.tsx`)

- UX-001B.10 reorganiza `/privacidad` como una explicación pública breve: datos de cuenta/organización/perfil/correo, uso y control, límites actuales y contacto para revisión o corrección.
- El footer conserva enlaces reales a Privacidad, Contacto, Nosotros y Aprende. No existe `/terminos`; no se creó un documento legal ficticio ni se añadió un enlace roto.
- La página mantiene `robots=index, follow`, canonical `/privacidad`, Open Graph institucional y mailto `hola@vecidya.com`; cualquier futura captura persistente queda explícitamente condicionada a definir finalidad, acceso, retención y eliminación.

### Sobre nosotros (`about.tsx`)

- UX-001B.8 presenta primero el propósito y una foto conjunta real de Yoan y Edgar; después explica el problema que origina Vecidya, muestra ambos perfiles individuales, convierte valores en comportamientos concretos y cierra con Diagnóstico/Contacto.
- Assets humanos incorporados en `public/assets/about/`: `team-yoan-edgar.webp`, `team-yoan-edgar-mobile.webp`, `yoan-profile.webp` y `edgar-profile.webp`, convertidos desde los PNG entregados a WebP sin alterar identidad ni añadir datos comerciales.
- No se inventan años de experiencia, clientes, premios, equipo adicional o métricas. La página permanece SSR, sin structured data nuevo ni persistencia.

### Home: arquitectura UX-001B.2 (`home.tsx`)

La Home `0.3.0` muestra producto real antes de explicarlo. Lee hasta tres perfiles públicos desde D1 mediante `listPublishedBusinessProfiles`, respetando `status = published` y la exclusión de perfiles suspendidos. No requiere sesión, no expone datos privados y mantiene un estado honesto con cero perfiles. La release fue publicada y verificada por HTTP anónimo el 2026-09-23.

| # | Sección | Objetivo | ~Palabras | CTA → destino | Visual | Conexión |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Hero / Product Entry | Propuesta breve y entrada al producto | corto | «Explorar el Vecindario»; «Hacer mi diagnóstico» | `illus-mobile-local-discovery` + fondo hero | Vecindario, Diagnóstico |
| 2 | Vecindario real | Preview de hasta 3 perfiles publicados | D1 público | «Explorar todo el Vecindario» | `BusinessCardV2`, logos y fallback | Perfiles publicados |
| 3 | Diagnóstico interactivo | Cuatro puertas iniciales | Ruta existente `/diagnostico` | Selección → Diagnóstico | 4 SVG de Diagnóstico | Diagnóstico |
| 4 | Servicios visuales | Cuatro servicios prioritarios | Estático real | «Ver todos los servicios» | 4 SVG de Servicios | Servicios |
| 5 | Cómo ayuda Vecidya | Información dispersa → presencia clara | Estático conceptual | CTA final | `illus-storefront-digital-profile` | Transformación |
| 6 | CTA final | Una decisión principal | Estático | Diagnóstico primario; Vecindario secundario | Fondo oscuro existente | Diagnóstico, Vecindario |
| 7 | Footer | Navegación secundaria, legal y versión | Estático | Enlaces existentes | Marca canónica | Navegación |

La Home redujo la estructura de diez bloques a seis bloques de experiencia más footer. Se retiraron de la Home los bloques independientes de audiencia, biblioteca, proceso y FAQ; sus páginas no fueron eliminadas.

### Vecindario

- UX-001B.3 implementa una superficie de descubrimiento SSR con header breve, búsqueda honesta por nombre, filtros GET, resumen de filtros activos y grid de cards compartido con Home.
- Lista: `<form method="get">` renderizado en servidor sin JS; `q` busca **solo sobre `displayName`** y escapa `%`, `_` y `\\` para tratarlos literalmente; `category` y `city` por igualdad exacta con opciones DISTINCT de perfiles publicados; tira de categorías (máx. 8, alfabética).
- Orden `displayName ASC, slug ASC`; **sin paginación ni límite**.
- Excluye borradores y perfiles suspendidos (lista, opciones de filtro, perfil por slug y sitemap).
- Tarjeta: logo o ícono, categoría, nombre, ciudad/país, descripción corta, «Ver perfil». Sin badge de verificado, contacto ni horarios en la tarjeta.
- Estados vacíos diferenciados para directorio sin perfiles y búsquedas filtradas sin coincidencias; ambos conservan una acción honesta hacia Diagnóstico.
- Slug: igualdad exacta sensible a mayúsculas; sin redirección si cambia.
- Perfil UX-001B.4: identidad protagonista, categoría, ubicación, descripción solo si existe, CTA primario dinámico (WhatsApp → teléfono → web → email), canales completos, redes reales, detalles operativos solo disponibles, horarios agrupados con etiquetas/datos legibles y cierre contextual con Vecindario/Diagnóstico. Sin negocios relacionados, servicios comerciales inventados ni contenido relacionado.
- JSON-LD `LocalBusiness`: `name`, `url`, `description`, `image`, `telephone`, `email`, `address` (localidad/país), `sameAs` (sitio web y redes reales), `areaServed`, `openingHoursSpecification` (solo días abiertos). No emite WhatsApp, categoría, `geo`, `priceRange`, reviews ni ratings.
- Lo que es funcional hoy: filtrado, búsqueda por nombre y perfiles reales. Categoría y ciudad son filtros exactos; no se promete geolocalización, distancia, relevancia ni búsqueda textual por rubro.

### Diagnóstico (`diagnostic.tsx` + `app/features/diagnostic/`, DIAG-002)

Confirmado por código (greps de `fetch`, `localStorage`, `sessionStorage`, `cookie`, `indexedDB`, `<form`, `/api/`, `ghl`, `crm` en la ruta y en el motor: 0 coincidencias): **anónimo, efímero, solo cliente, sin persistencia, sin API, sin CRM/GHL, sin email obligatorio**. La `0.4.1` publicada sirve DIAG-002C; no se ejecutaron migraciones ni cambios de secrets.

- **Motor puro** en `app/features/diagnostic/` (`types`, `profiles`, `questions`, `answers`, `flow`, `scoring`, `result`, `recommendations`, `deep-link`, `catalog`, `index`): sin React ni red; `runDiagnostic(answers)` es determinista y la ruta solo renderiza.
- **Perfiles**: `business`, `professional`, `creator`, `project`, `organization`. «Idea» pasó a ser un momento (`stage`) y «candidatura o figura pública» se retiró por no tener un mapeo honesto a producto.
- **Contexto**: objetivo (9 opciones), momento (idea, lanzamiento, ocasional, regular, estable/crecimiento) y equipo por rangos (solo yo, 2–5, 6–10, 11–25, +25). El contexto ramifica y pondera relevancia; nunca aporta evidencia ni decide la licencia.
- **Preguntas**: 26 en el banco; recorrido mínimo 6 (idea), típico 13–16, máximo 19. Cada pregunta documenta `purpose`, dimensiones, pesos y condición `applies`. Multiselección con exclusivas: «nada de esto» puntúa 0 de forma sustantiva, «no estoy seguro» es incertidumbre; «no aplica» no puntúa ni afecta la confianza.
- **Puntuación**: 7 dimensiones (claridad, presencia, alcance, confianza, contacto, seguimiento, medición) de 0 a 100 normalizadas sobre la evidencia aplicable y respondida (`null` = sin evaluar); niveles inicial/parcial/sólida/consolidada.
- **Estado** por reglas, no por promedio (DIAG-002B): punto de partida (no opera) → base en construcción (claridad baja; o presencia baja / sin consultas, con resumen distinto si el proceso ya funciona) → operación activa con datos por confirmar (llegan consultas pero registro/seguimiento son «no lo sé») → operación activa con fugas (contacto o seguimiento bajos, o una fuga grave concreta como «no hay seguimiento» aunque el resto sea fuerte) → sistema en marcha → sistema consolidado. El estado cita las respuestas que lo originan. **Confianza** separada de la debilidad: cobertura, respuestas «no lo sé», dimensiones sin evidencia y contradicciones declaradas (idea + primera venta; actividad regular + sin consultas; presencia clara + propuesta sin resumir), con razones en texto.
- **Prioridades**: hallazgos con gravedad × clase (fundacional > fuga comercial > confianza/alcance > cuello de botella > madurez) × relevancia del objetivo × confianza, con dependencias (`after`: automatizar no encabeza si la captura o el seguimiento fallan); máximo 3, cada una con «por qué» citando la respuesta dada y «qué hacer» sin contratar nada. Un hallazgo derivado de «no lo sé» usa títulos de comprobación («Confirmar si…», «Averiguar…»), nunca de ausencia; «presencia escasa» y «no apareces en Google» no se duplican; «varios canales» solo es brecha si las consultas no quedan registradas; un negocio local con buen proceso y sin reseñas recibe «pedir reseñas». Las fortalezas de dimensión exigen evidencia ≥ 2, sin dudas y sin brecha grave confirmada en la misma dimensión. Una **nota de objetivo** explica los prerrequisitos cuando el objetivo declarado (automatizar, medir, que te encuentren, confianza) no puede abordarse aún.
- **Encaje Vecidya** (DIAG-002C): una licencia solo se recomienda cuando la necesidad diagnosticada exige una capacidad recurrente del sistema, alineada con lo que incluye cada nivel en `/licencias`: Ciudad = automatizar y controlar (captura y seguimiento definidos más señal de repetición, equipo u objetivo); Barrio = captar y seguir (brecha sustantiva de seguimiento o respuesta con consultas reales); Cuadra = ordenar (brecha de registro/pipeline, o consultas reales casi sin base pública propia). Sin consultas, sin operación, o con registro y seguimiento ya resueltos y ninguna necesidad recurrente, el resultado es «Ninguna necesaria por ahora» aunque un servicio o una lectura sí ayuden (no existe «Barrio opcional»). Una prioridad fundacional limita la licencia a Cuadra; las dudas no deciden licencia. Servicio ≠ licencia: hasta 2 servicios solo por prioridad real (nunca derivados de la licencia; sin relleno cuando no hay prioridades), addons solo con prerrequisitos y licencia ≥ Barrio, hasta 2 artículos de Aprende por slug real; enlaces a `/licencias#<nivel>` y `/addons#<addon>`. Vocabulario público de addons: «WhatsApp», «SMS», «Telefonía», «Automatizaciones», «IA conversacional», «AI Voice», «Integraciones». Home mantiene cuatro puertas por decisión; «organización» se elige dentro de `/diagnostico` o por `?perfil=organization`.
- **Deep link** canónico `/diagnostico?perfil=<business|professional|creator|project|organization>` y opcional `objetivo=<goal>`; lista cerrada, valores inválidos → inicio normal, nada de la URL se renderiza. Home (4 puertas) y el artículo de CRM (`?objetivo=organize`) entran con contexto; al cambiar de perfil dentro del flujo la URL se actualiza con `replace`; «Rehacer diagnóstico» vuelve a `/diagnostico` limpio.
- **Aislamiento**: cambiar de perfil descarta las demás respuestas y `deriveActiveAnswers` filtra cualquier respuesta no aplicable antes de puntuar (probado en unitarias y E2E).
- **UI**: `fieldset`/`legend` con radios y checkboxes nativos, foco en cada pregunta nueva, stepper por secciones más `progressbar` con `aria-valuetext`, un único H1, reduced motion; resultado con estado, cómo llegamos, confianza, dimensiones, fortalezas, brechas, prioridades, siguientes pasos, encaje y límites explícitos; `mailto:hola@vecidya.com` prellenado con perfil, momento, objetivo, estado, prioridad y siguiente paso, sin respuestas crudas.
- **Resultado (jerarquía DIAG-002B)**: estado y resumen → línea de confianza → nota de objetivo (si aplica) → prioridades con la principal destacada → siguientes pasos en orden (incluye «Después: …» para lo que depende de las prioridades) → cómo llegamos y confianza → dimensiones por nivel (sin números visibles) con fortalezas y brechas → encaje Vecidya → límites → contacto. Los activos ya no alimentan «contacto» ni «confianza» (salvo dominio y correo propio); las reseñas pesan más que las demás señales de un negocio.
- **Pruebas**: `pnpm run test:unit` (70 pruebas del motor: 43 de DIAG-002 y 27 semánticas de DIAG-002B) y `diagnostic-experience-check.mjs` (deep links, Home → Profesional, aislamiento, a11y, recorrido de negocio, resultado, anclas, reinicio y responsive 1366/768/390/360).

### Servicios (`/servicios`)

UX-001B.5 convirtió la página en una guía de decisión SSR. UX-002.4 la actualiza como catálogo de servicios profesionales: Organización del negocio, Formalización de base, Presencia digital, Automatización, Inteligencia artificial y Marketing y crecimiento. Cada área comunica problema, resultado, apoyos posibles y CTA real a `/contacto`; el diagnóstico queda como entrada para quien aún no sabe qué necesita. La sección de relación separa licencia, addon, servicio y consumo externo. No hay precios, checkout ni lenguaje de compra y **no lee `service_catalog`**: el catálogo privado sigue siendo un modelo distinto del contenido público.

### SEO, navegación y accesibilidad (evidencia de código)

- Meta por ruta con `publicMeta`: título `X | Vecidya`, descripción, `index, follow`, `og:title/description/type/locale/url/image` y Twitter Cards con imagen Open Graph institucional; canonical **fijo** `https://vecidya.com`. UX-002.7 verifica Open Graph, canonical, robots, favicon, alias legado y sitemap en el smoke público. Sitemap, robots y URLs de JSON-LD usan el origen de la request (en `workers.dev` serían inconsistentes con el canonical).
- Robots: `Allow: /`; `Disallow: /app, /api, /login, /register`; sitemap sin `lastmod`.
- `www.vecidya.com` → 301 → apex (`workers/app.ts`).
- Navegación: desktop (Vecindario, Licencias, Aprende, Diagnóstico, Servicios, Nosotros, Contacto) + «Acceder» y «Únete a Vecidya»; móvil `<details>` con Escape y retorno de foco; footer agrupado en Explorar, Empezar y Legal, sin rutas inexistentes. Addons se descubre desde Licencias, el footer y el menú móvil. El inicio usa el logo como entrada y las búsquedas filtradas del Vecindario son `noindex`.
- Accesibilidad: skip-link, `:focus-visible`, `aria-label` en navegaciones, `prefers-reduced-motion`, breakpoints 430/760/820/900 px. UX-001B.2 corrige el landmark de Home/PublicLayout, añade un H1 único, dimensiones de imágenes, foco heredado y navegación keyboard-friendly para las cuatro opciones del Diagnóstico. UX-002.7 añade verificación de un único `<main>`, alt/dimensiones de imágenes, overflow y navegación cross-page en los cuatro viewports.
- Assets: 14 WebP activos + 4 PNG conservados (ícono de marca canónico y 3 recursos seleccionados sin uso); PERF-001 redujo `18,649,999` a `4,369,378` bytes (`76.57 %`). UX-001B.2 añade 8 SVG livianos y `og-vecidya-public.svg` (1200×630, 2,291 bytes), sin usar assets de reviews/ratings ni el icono PNG de búsqueda de 808.6 KB.

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
| Adaptador Gmail transaccional (`server/email/mail.server.ts`) | **PASS en producción; Gmail API send, entrega real y password reset E2E confirmados; verificación/invitaciones separadas** |
| GHL | **OPS-001 DOCUMENTAL** (capacidad/contrato definido; cuenta real NOT VERIFIED; 0 código) |
| Google, Meta, WhatsApp API, Stripe, Twilio | **NOT FOUND** |
| WhatsApp/Instagram/Facebook/LinkedIn en perfil | Campos y enlaces (`wa.me`), no integración |

Vecidya es responsable de cuentas, organizaciones, membresías, permisos, perfiles, servicios, directorio, experiencia pública, portal y metadata de integraciones. GHL será el system of record de contactos, leads, oportunidades, pipelines, conversaciones, citas, workflows, automatizaciones y seguimiento. OPS-001 define un piloto mínimo de una location, pero no lo ejecuta. No se implementa un CRM paralelo.

## Mapa de producto

### Conexiones actuales

```text
Home ──► Vecindario ──► Perfil ──(CTA fijo)──► Vecindario | Servicios | Diagnóstico | Contacto
Home ──► Servicios ──► Diagnóstico | Contacto
Home ──► Diagnóstico (puertas con ?perfil=) ──► Resultado ──► Aprende (artículo) | Servicios (#anchor) | Licencias | Addons | mailto prellenado | Contacto | Rehacer
Home ──► Contacto (solo enlace contextual del CTA final)
Home ──► Aprende (4 artículos) ──► Diagnóstico (artículo CRM con ?objetivo=organize) | Servicios | Contacto
Vecindario (lista) ──► Diagnóstico | Contacto (estado vacío)
App: sesión ──► /app ──► organización activa (selector) ──► Perfil (/app/business-profile) ──► página pública
                                                     └─────► Servicios (/app/services)
Internal Admin: /app/internal ──► Organizaciones | Negocios (gobierno) | Servicios | Integraciones | Auditoría
```

### Conexiones deseadas — todas FUTURE (no existen)

Perfil → negocios relacionados · Perfil → contenido relacionado · Artículo → Servicio contextual (hoy CTA fijo) · Home → vecinos reales/búsqueda · Perfil → CTA contextual al negocio · Web pública → registro. (Diagnóstico → contenido/servicio contextual y Home/artículo → Diagnóstico con contexto existen desde DIAG-002.)

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
