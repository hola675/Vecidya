# Product

<!-- impeccable:product-schema 1 -->

> Registro de verdad de producto para el trabajo de diseño (skill `impeccable`). No describe estado de implementación: eso vive en `docs/STATUS.md` y `docs/PROJECT_STATE.md`, que prevalecen ante cualquier diferencia. Los títulos de sección siguen el esquema de la skill; el contenido está en español. Creado el 2026-10-01 con autorización del usuario.

## Platform

web

## Users

- **Principales:** negocios locales y profesionales de habla hispana en Latinoamérica (mercado confirmado por el usuario, 2026-10-01). Incluye servicios en la zona, servicios con citas, prácticas clínicas y profesionales, comercio físico, tiendas en línea, venta a empresas, creadores de contenido y organizaciones sin fines de lucro, en cualquier etapa: desde una idea sin lanzar hasta un negocio en marcha.
- **Su trabajo:** entender dónde están digitalmente y qué los frena, ordenar su base, ser encontrados, convertir el interés en clientes y darles seguimiento, sin tener que convertirse en expertos en herramientas.
- **Internos:** el equipo de Vecidya, que administra organizaciones, perfiles publicados, servicios e integraciones desde el área interna.

## Product Purpose

Vecidya ayuda a negocios locales y profesionales a construir su presencia digital y a formar parte de un directorio público, el **Vecindario**. El recorrido empieza con un **Diagnóstico** anónimo que explica la situación del negocio, lo que funciona, lo que limita y qué conviene atender primero. Continúa con **licencias** que acompañan la evolución del negocio y con servicios personalizados cuando hacen falta. El éxito es que el negocio entienda su situación con honestidad y avance de forma ordenada, no que contrate más de lo que necesita.

## Positioning

Una comunidad digital (el Vecindario) más un diagnóstico honesto que nunca inventa datos, más licencias que evolucionan con el negocio: **Cuadra** (ordenar), **Barrio** (captar y dar seguimiento) y **Ciudad** (automatizar y escalar). Vecidya no es otro CRM: HighLevel (GHL) sigue siendo el sistema de contactos, oportunidades, conversaciones, automatizaciones y seguimiento. Posicionamiento confirmado por el usuario el 2026-10-01.

## Operating Context

- **Web pública:** Inicio, Vecindario (`/vecindario` y un perfil por negocio publicado), Diagnóstico (`/diagnostico`), Licencias, Addons, Servicios, Aprende (artículos educativos), Únete, Contacto, Sobre nosotros y Privacidad.
- **Diagnóstico:** anónimo, sin cuenta; se puede guardar y retomar con un código de recuperación. El resultado V3 (DIAG-V3) se presenta como un informe, no como un tablero.
- **Área de cliente** (`/app`): una organización por cuenta, con perfil comercial, servicios, equipo e invitaciones.
- **Área interna** (`/app/internal`): gobierno de organizaciones, perfiles, servicios, integraciones y auditoría.
- **Contratación:** por contacto directo (correo `hola@vecidya.com` o WhatsApp). No hay checkout ni cobro automático.

## Capabilities and Constraints

- La capacidad real de cada función está en `docs/STATUS.md`; este archivo no la repite. Pagos, checkout y la integración con HighLevel **no** están implementados.
- **Límites permanentes:** sin CRM paralelo a GHL; sin negocios, testimonios, métricas, reseñas, calificaciones ni datos comerciales ficticios; sin asociar un negocio a una marca de terceros sin autorización; todo recurso de una organización verifica sesión, membresía y permiso.
- **Idioma:** español. La terminología depende del tipo de negocio (perfiles de lenguaje congelados en `app/features/diagnostic/qbv2-terminology.ts`): «pacientes» solo en salud con práctica con licencia, lenguaje no comercial en organizaciones sin fines de lucro, y antes del lanzamiento no se habla de clientes existentes.
- **Diagnóstico:** en V3 el porcentaje de presencia digital es un resumen (promedio de las áreas con lectura, con cobertura y confianza aparte; sin porcentaje si hay pocas áreas o antes del lanzamiento) y nunca decide prioridades; la certeza nunca sube (confirmado / hay señales / sin información); un área sin evidencia nunca se presenta como debilidad; las ofertas de Vecidya aparecen solo al final, ligadas a una prioridad y con su explicación; metodología con fuentes citadas solo en vista privada (DIAG-V3-11), todavía sin publicar.
- **Versión y publicación:** la versión es la de `package.json`. Las páginas públicas, `/app` y `/app/internal` muestran el pie compartido con la versión y «© 2026 Vecidya». «Publicado» exige un deploy autorizado y una verificación HTTP anónima con fecha.

## Brand Commitments

- Nombre **Vecidya**; vocabulario propio: Vecindario, Aprende, licencias Cuadra · Barrio · Ciudad.
- Precios públicos de licencias en USD/mes (`$39`, `$59`, `$89`), publicados en `/licencias` desde el 2026-09-25. Los precios de addons y servicios no están definidos y no se inventan.
- **Voz:** español claro y directo; honesta sobre la incertidumbre; nunca alarmista ni culpabilizadora (el Diagnóstico tiene frases duras prohibidas); orientación, no auditoría ni certificación; puede decir que el negocio todavía no necesita nada.
- Los recursos de marca vigentes están en `public/` y `app/assets/public-assets.ts`.

## Evidence on Hand

- Un perfil real publicado: `/vecindario/vecidya`.
- Equipo real y fotos en `/sobre-nosotros`; artículos de Aprende con autor real.
- 12 personas golden del Diagnóstico (`app/features/diagnostic/qbv2-personas.ts`): son fixtures de prueba, **no** clientes ni casos reales.
- **Ausencias que no se fabrican:** testimonios, reseñas, calificaciones, logos o casos de clientes, métricas de resultados, cifras de uso y alianzas con marcas.

## Product Principles

1. **La honestidad antes que la persuasión:** la certeza nunca se exagera y la falta de evidencia se dice como tal.
2. **Primero entender, luego actuar:** el Diagnóstico explica dónde está el negocio y qué atender primero antes de ofrecer nada.
3. **Crecer por etapas:** cada licencia responde a una necesidad real del momento del negocio, no a un paquete máximo.
4. **No duplicar sistemas:** HighLevel conserva el CRM; Vecidya cubre presencia, comunidad, diagnóstico y gobierno de la cuenta.
5. **El lenguaje del negocio de cada quien:** el producto habla en los términos del tipo de negocio y de su etapa.

## Accessibility & Inclusion

WCAG 2.2 AA (confirmado por el usuario el 2026-10-01): contraste AA, foco visible, operación completa con teclado, objetivos táctiles adecuados, `prefers-reduced-motion` respetado y estados que nunca dependen solo del color. Diseño mobile-first sin desplazamiento horizontal.
