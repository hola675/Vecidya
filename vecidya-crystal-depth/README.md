# Vecidya Crystal Depth

**Estado:** R1.2, R1.3 y R1.4 integradas en `main` (PR #257, #259 y #260). R1.5 es el contrato de compatibilidad entre la biblioteca y el frontend real; en rama de revisión. La biblioteca no se importa como código React ni certifica despliegue.

Sitio independiente de componentes HTML/CSS funcionales, escenas ambientales e iconos en capas separadas. Abre por defecto en **tema oscuro** y permite alternar a claro. La escena generada aprobada por el usuario se integra como fondo, no como captura ni como contenido de los componentes. La galería recorre los 140 assets de `public/assets/`, con búsqueda, 17 categorías y tres órdenes.

## Vico — explorador de identidad y originales (2026-11-20)

La sección `biblioteca.html#vico` reúne las **10 imágenes oficiales del personaje Vico** ya incluidas entre los 140 assets, sin copiar ni generar archivos adicionales. Permite seleccionar imagen, comparar fondo oscuro/claro/cuadrícula de transparencia, escala, posición y escena contextual independiente; muestra propósito, dimensiones y enlace directo al original.

- `assets/vico-workbench.js`: selección desde `window.vecidyaCrystalCatalog`, diez destinos por ruta, copia de ficha JSON para agentes (orientación; no API).
- `styles/vico-workbench.css`: visor responsive, foco de teclado, estado seleccionado y movimiento reducido.
- `assets/pattern-registry.json → vicoVisualIdentity`: inventario y restricciones interpretables.
- `docs/DIRECCION-ARTISTICA.md → Vico`: carácter, composición y QA requerida.
- `tests/r1-contract.test.mjs` y `tests/r2-browser-qa.mjs`: suites ya existentes, ampliadas con inventario y comparación en Chromium.

**Límites:** conserva originales, no genera ni redibuja a Vico, no aplica Vico como marca de los MiniWeb de clientes, no realiza despliegues y no certifica calidad artística o transparencia sin inspección de capturas. El catálogo sigue en 140 entradas. La infografía `home-vecidya-companion-v4.webp` está correctamente clasificada en `Ilustraciones`, porque no contiene al personaje.

## Entrada didáctica para agentes

La biblioteca es un **manual de decisiones visuales**, no solo una galería. Antes de modificar una pantalla de Vecidya:

1. Leer `AGENTS.md` de la raíz y las reglas de gobierno de la plataforma.
2. Consultar `docs/INTEGRACION.md` para interpretar la consulta y elegir un patrón; `docs/DIRECCION-ARTISTICA.md` para tokens, contraste y composición L0–L5.
3. Buscar intención, materiales y restricciones en `assets/pattern-registry.json` (JSON estructurado para agentes).
4. Abrir `biblioteca.html#guia`, explorar las tres intensidades Crystal y usar el recomendador de patrones.
5. Contrastar componentes y capacidades reales en `vecidya-platform/`, hacer QA focal y abrir PR sin desplegar.

**R1 aprobada conceptualmente:** oscuro principal, claro alternativo; cristal focal en escenas, discreto en paneles y sólido en datos; calidad premium compartida entre Cuadra/Barrio/Ciudad con progresión por composiciones/capacidades efectivas; laboratorio interno como sistema de aprobación. **R1 no activa derechos comerciales, CRM ni nuevas plantillas por sí sola.**

## Transiciones y animaciones R1.1 (laboratorio)

La sección `biblioteca.html#movimiento` muestra **cinco recetas** reutilizables por agentes: portada, revelado de sección, respuesta de componente, ambiente de escena y navegación contextual. Incluye controles de intensidad, pausa y repetición, con `prefers-reduced-motion` que impide la animación incluso si el usuario activa el ejemplo. Los estados estáticos son completos.

- `styles/motion-system.css`: tiempos y easing, halo/órbitas, entradas, tarjetas y responsive.
- `assets/motion-system.js`: mejora progresiva de secciones, preferencias del SO, pausa y replay.
- `assets/pattern-registry.json → motion`: contrato legible por agentes, usos, limitaciones y QA.
- `tests/r2-browser-qa.mjs`: Chromium real, captura de cinco tamaños, temas, teclado, selector, controles de movimiento y modo reducido. El pipeline publica capturas como artifact solo al ejecutar la CI.

**Los cambios R1.1 no migran componentes de React, no alteran operaciones de MiniWeb, CRM ni Admin y no autorizan deploy.**

## Páginas y composiciones R1.2 (laboratorio)

La sección `biblioteca.html#composiciones` ofrece cuatro escenas de pantalla interactivas y aisladas: sitio público, Vecindario, Aprende y MiniWeb V2. Cada una usa material y transición pertinentes. Los tabs soportan teclado y sin JavaScript las cuatro composiciones siguen legibles. Los ejemplos no publican rutas, modifican datos ni conceden prestaciones de licencia.

- `styles/scene-composer.css`: composición responsive, claro/oscuro y transición breve.
- `assets/scene-composer.js`: selector de escenas con foco y movimiento reducido.
- `assets/pattern-registry.json → sceneRecipes`: referencias y restricciones oficiales.
- `tests/r2-browser-qa.mjs`: batería Chromium y capturas visuales.

## Estados y flujos R1.3 (laboratorio)

La sección `biblioteca.html#flujos` simula cinco estados sin red ni mutaciones: `idle`, `loading`, `empty`, `error` y `success`. El ejemplo distingue explícitamente la confirmación visual de una operación verdadera. Proporciona textos de ayuda, estado accesible, color no exclusivo y movimiento reducido.

- `assets/interaction-flows.js`: simulación local sin API, sin almacenamiento y sin envíos.
- `styles/interaction-flows.css`: superficies `solid` y composición responsive.
- `assets/pattern-registry.json → interactionRecipes`: contrato de cinco estados para agentes.
- `tests/r1-contract.test.mjs` y `tests/r2-browser-qa.mjs`: QA focal sobre la misma batería existente.

La guía no promete que una acción está guardada ni que un CRM está conectado. Integrar un estado de éxito en producción requiere una respuesta real y verificable de la operación.

## Encargos para subagentes R1.4 (laboratorio)

La sección `biblioteca.html#guia` genera un **borrador revisable y copiable** para cuatro especialidades del equipo: frontend, editorial, UX/UI y calidad. Parte de la intención elegida y de `assets/pattern-registry.json`, por lo que combina material, reglas críticas, escena oficial si existe, movimiento permitido, estados y restricciones. No inventa una composición cuando la intención no la tiene.

El subagente **editorial es un colaborador del agente líder**, responsable de textos naturales y comprensibles para cualquier persona, sin ambigüedades ni promesas comerciales no verificadas. La previsualización conserva un borrador básico si el JSON no está disponible (por ejemplo, al abrir el HTML con `file://`). No es una orden automática y la persona debe revisar el texto antes de asignarlo.

- `assets/agent-brief.js`: composición de instrucciones por especialidad, sin llamadas a APIs de producto.
- `assets/pattern-registry.json → agentBrief`: roles y límites de actuación.
- `tests/r1-contract.test.mjs` y `tests/r2-browser-qa.mjs`: QA focal reutilizando la batería ya existente.

## Un solo lenguaje con el frontend React — R1.5

La sección `biblioteca.html#idioma` muestra correspondencias **verificadas sobre el código** y generadas desde `assets/pattern-registry.json → platformCompatibility`, evitando una segunda fuente de componentes.

- Fuente canónica de tokens: `vecidya-platform/app/styles/premium-foundation.css` (variables `--v-*`).
- Superficies, profundidad y retícula reales: `vecidya-platform/app/styles/visual-system.css`.
- Componentes existentes: `app/components/ui.tsx`, `experience-system.tsx` y patrones públicos de `public-v2.tsx`. La plataforma posee los shells y los destinos de navegación.
- Correspondencia orientadora: **Focal → Card highlight**, **Quiet → Card glass**, **Solid → Card solid**. La profundidad es independiente. No sustituye el diseño real de una ruta ni crea componentes nuevos.
- **Tema:** la plataforma actual usa claro; oscuro de Crystal Depth sigue siendo exploración artística. El naranja, radios, focus y tiempos de la plataforma prevalecen.
- **Faltantes:** `PageHeading`, `AdminFilterBar`, `ConsentStatus`, `DiagnosticMetricCard`, `DiagnosticTrend` están propuestos en la guía oficial pero no exportados como primitivos compartidos; `SharedStatusPanel` es propuesta por evaluar, no implementada.
- **Fronteras:** nunca aplicar estilos globales a MiniWeb pública de negocios, no duplicar GHL/CRM ni alterar scoring, permisos, publicaciones o licencias.

La CI focal contrasta el registro con archivos reales de la plataforma. Las pruebas muestran coincidencia estructural, **no equivalencia visual certificada**.

## Abrir

- Abrir `biblioteca.html` directamente en el navegador.
- Abrir `index.html` para que redirija a la biblioteca.
- Para servir desde la raíz del repositorio, iniciar un servidor HTTP estático y visitar `/vecidya-crystal-depth/biblioteca.html`.

No requiere dependencias. Marca, Vico y las ilustraciones originales se conservan. Once iconos usan propuestas PNG Crystal en la vista de biblioteca; WhatsApp se rasteriza a PNG. Los dos fondos ambientales generados optimizados residen en `assets/`.

Para revisar en un navegador Chromium con todos los assets relativos disponibles, inicia un servidor estático desde la raíz del repositorio y abre `/vecidya-crystal-depth/biblioteca.html`. También se puede abrir el HTML directamente; el servidor facilita la resolución de los activos oficiales en `vecidya-platform/public/assets/`.

## Archivos

- `biblioteca.html`: navegación, tarjetas, acordeón, formularios, pestañas, tabla, estados, diálogo y galería filtrable.
- `styles/crystal-depth.css` y `styles/themes.css`: material, componentes responsive y temas claro/oscuro.
- `assets/pattern-registry.json`: enrutamiento de intenciones, materiales, tokens, niveles y gates de QA.
- `styles/r1-guidance.css`: visualizaciones R1 y contrastes por material, aislados de producción.
- `assets/library-catalog.js`: índice estático de 140 assets oficiales, sus categorías, dimensiones y vistas Crystal.
- `assets/catalog-previews/`: 128 miniaturas WebP optimizadas; cada tarjeta enlaza al original con su formato y dimensiones.
- `assets/crystal-depth-hero.webp` y `assets/crystal-depth-hero-light.webp`: escenas ambientales aprobadas como referencia de estilo.
- `assets/icons/`: PNG separados para once propuestas Crystal y WhatsApp rasterizado desde su activo oficial.
- `docs/DIRECCION-ARTISTICA.md`: dirección artística y seis revisiones críticas.
- `docs/PLAN-MIGRACION-VISUAL.md` y `docs/INTEGRACION.md`: límites de integración.

## Pruebas de contrato automatizadas R1

```bash
node --test vecidya-crystal-depth/tests/r1-contract.test.mjs
```

Ejecutar desde la raíz del repositorio con Node.js 22 o superior. Este test focal **sin dependencias** comprueba tema oscuro inicial, alternancia reversible, `aria-checked`, ocho intenciones del guía, uso/antiuso de los tres materiales, unicidad de IDs, tokens sólidos con contraste ≥4,5:1, presencia de foco y `reduced-motion` en el CSS, y el catálogo de 140 assets y 17 categorías. La CI dedicada `.github/workflows/crystal-depth-quality.yml` se activa en PR que modifiquen esta biblioteca.

**Alcance de evidencia:** estas comprobaciones no verifican visualmente el render de todos los estados, contrastes sobre fondos compuestos, zoom 200 %, lector de pantalla, performance ni UX móvil. Continúan pendientes del gate R2.

## Verificación y límites

**Los cambios R1 requieren una nueva certificación y no heredan la validación de 0.7.** El 2026-11-13, Chromium local comprobó navegación, pestañas con teclado, alternador de tema, búsqueda y filtros, orden, estado vacío, validación del formulario, diálogo/Escape y enlaces internos. Se revisaron 320, 360, 390, 768, 1024, 1366 y 1920 px; la tabla conserva un scroller horizontal propio en móvil. La carga final no registró errores de consola. `node --check assets/library-catalog.js` y `git diff --check` pasan. Las seis revisiones críticas están en `docs/DIRECCION-ARTISTICA.md`.

Esto no equivale a certificación WCAG, revisión con lector de pantalla/zoom 200 % ni aprobación visual final. Requieren aprobación humana la intensidad del material en claro/oscuro, encuadre móvil de Vico, escena clara, propuestas PNG Crystal y presentación de la galería completa. No cambia la plataforma, MiniWeb2, rutas ni flujos, y no autoriza migración ni publicación.

## Changelog

- 2026-11-20 — R1.2: cuatro composiciones de página, transición y navegación de muestras, contrato de agentes y QA focal; solo biblioteca.

- 2026-11-19 — R1 candidata: oscuro predeterminado, materiales por función, guía visual para agentes, registro JSON de patrones y reglas de calidad; no integrado ni desplegado.

- 2026-11-13 — 0.7: interacciones y responsive revisados en Chromium; tono hielo unificado con sombras/material; favicon oficial.
- 2026-11-12 — 0.6: galería completa de 140 assets con búsqueda, 17 categorías, orden, dimensiones y once iconos PNG Crystal; acordeón accesible.
- 2026-11-12 — 0.5: tema claro inicial con alternador oscuro, escenas ambientales clara/oscura e iconos PNG Crystal.
- 2026-11-12 — 0.4: biblioteca premium navegable, sistema de superficies, interacciones locales y escena ambiental aprobada.
- 2026-11-12 — 0.1–0.3: laboratorio y primeras muestras aisladas.

## Despliegue aislado en Cloudflare Workers (preparado, pendiente de activación)

La biblioteca puede asociarse al Worker existente `vecidya-desig` sin tocar la plataforma principal. El despliegue automatizado **no está confirmado** hasta conectar GitHub en Cloudflare, integrar estos cambios en `main` y comprobar la web publicada.

En Cloudflare > Workers & Pages > `vecidya-desig` > Settings > Builds > Connect:

| Campo | Valor |
| --- | --- |
| Cuenta / repositorio | `hola675 / Vecidya` |
| Production branch | `main` |
| Root directory | `vecidya-crystal-depth` |
| Disable builds | Desactivado |
| Build command | `node scripts/build-cloudflare.mjs` |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler preview` |

En **Build watch paths**, incluir `vecidya-crystal-depth/*` y `vecidya-platform/public/assets/*`. Esto limita los builds a los cambios de la biblioteca y de los recursos compartidos que utiliza.

`scripts/build-cloudflare.mjs` genera `dist/` desde cero, copia solo los archivos web de Crystal Depth y las referencias utilizadas de `vecidya-platform/public/assets/`, y reescribe las rutas relativas para que funcionen en la raíz del dominio. Las imágenes siguen almacenadas una sola vez en el código fuente del monorepositorio. Si falta una imagen oficial referida, el build falla. `wrangler.jsonc` configura solamente los activos estáticos del Worker `vecidya-desig`; no declara rutas ni modifica DNS.

Verificación local (desde `vecidya-crystal-depth/`):

```sh
node --check scripts/build-cloudflare.mjs
node scripts/build-cloudflare.mjs
npx wrangler dev
```

Revisar `/` y `/biblioteca`, todos los iconos, la galería y sus enlaces. Tras el primer despliegue, verificar Cloudflare **Deployments**, el dominio existente y una comprobación HTTP pública fechada; guardar una versión anterior para reversión. Ningún push a `main` despliega automáticamente mientras la conexión Git no esté activada.

**Changelog de la preparación:** 2026-11-19 — build estático aislado y configuración Wrangler para GitHub → Cloudflare; sin deploy, sin integración en la plataforma, sin cambios DNS.
