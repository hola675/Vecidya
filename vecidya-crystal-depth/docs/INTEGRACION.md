# Guía de integración y uso por agentes — Crystal Depth R1.5–R3

## Catálogo de fondos propuestos R4 — instrucciones para generar, no imágenes publicadas

**Fuente estructurada:** `assets/pattern-registry.json → backgroundAssetBriefs`. Este catálogo contiene **ocho briefs aprobados para evaluación**, no archivos creados ni licencia de uso concedida. Cada agente debe escoger un fondo únicamente cuando refuerce el objetivo de la pantalla, no por rellenar espacio.

| ID para arte | Destino | Prioridad | Material y directriz |
|---|---|---|---|
| `vx-bg-public-home` | Inicio | P1 | Escena nocturna/diurna modular con vacío izquierdo para mensaje HTML; Vico oficial separado |
| `vx-bg-public-services` | Servicios | P2 | Plataformas y conexiones geométricas sin representar funciones no disponibles |
| `vx-bg-directory` | Vecindario | P2 | Barrio abstracto periférico; filtros y resultados sobre superficie sólida |
| `vx-bg-learn` | Aprende | P2 | Capas editoriales externas al cuerpo de lectura; párrafos siempre sólidos |
| `vx-bg-diagnostic` | Diagnóstico | P3 | Orientación y halo en cabecera; respuestas y resultados sin decoración |
| `vx-bg-client` | Mi Vecidya | P1 | Halo cian mínimo fuera de tarjetas; texto contrastado con tokens `--v-*` |
| `vx-bg-miniweb-editor` | Editor MiniWeb V2 | P2 | Profundidad en **el marco del editor**, jamás sobre el sitio del negocio |
| `vx-bg-internal` | Admin | P3 | Solo textura/cabecera; tablas, alertas y controles sólidos |

### Entrega de un asset por parte del agente de diseño

Antes de implementarlo, registrar archivo original, autoría y licencia, dimensiones, variante claro/oscuro y escritorio/móvil, WebP optimizado, peso final, región de contenido libre, alternativa CSS sin imagen y comportamiento con `prefers-reduced-motion`. Verificar contraste sobre el *fondo compuesto*, 320/390/768/1366/1920 px, rendimiento y aprobación humana. Un color o escena no activa licencias, diagnósticos, CRM o publicaciones.

En `/app` la prioridad inmediata es contraste del contenido de «Tu siguiente paso». MiniWeb es un **editor solid** con vista previa contextual; el fondo es envolvente y nunca altera la marca del cliente. Las ocho propuestas no sustituyen la galería de 140 assets existentes ni autorizan generación masiva automática.

---



## Contrato de lectura para agentes — consolidación posterior a R3 (2026-11-20)

**Estado verificado en Git:** R1.5–R1.9, R2-A y R3 están integrados en `main` (PR #261–#267; merge R3 `b069103b`). Las frases históricas del documento que dicen «candidato», «en rama» o «no exportado» describen el momento de la fase original y **no prevalecen sobre el código actual**. R2 visual integral y publicación verificable continúan pendientes. La aprobación creativa de la biblioteca **no autoriza** activar tema oscuro en toda la plataforma ni un deploy.

### Fuente de verdad, desde mayor a menor prioridad
1. `AGENTS.md`, `vecidya-platform/docs/GOVERNANCE.md` y guardas/contratos del backend.
2. Código de la ruta, exportaciones de `app/components/ui.tsx`, `app/components/visual-contract.tsx`, `app/components/experience-system.tsx`, `app/components/public-v2.tsx`, y tokens `--v-*` de `premium-foundation.css` y `visual-system.css`.
3. `vecidya-platform/docs/design-system/VECIDYA-UI-UX.md` y documentación vigente de la capacidad.
4. `assets/pattern-registry.json` (material, intención, escenas, movimiento, agentes, compatibilidad y mapa de adopción).
5. `biblioteca.html`, escenas e imágenes del laboratorio como **demostración**, nunca como React distribuible.

**Discrepancia reconciliada:** `PageHeading`, `AdminFilterBar`, `ConsentStatus`, `SharedStatusPanel`, `DiagnosticMetricCard` y `DiagnosticTrend` están implementados como componentes presentacionales en `app/components/visual-contract.tsx`. Antes de utilizarlos, abrir el archivo y comprobar sus propiedades reales: el registry no es contrato TypeScript. `access-denied` falta como ejemplo independiente en la demo R1.3, pero ya es estado de la composición React; lo sigue decidiendo el servidor.

### Matriz de aplicación por superficie
| Área | Lo que quiere conseguir el visitante | Regla compositiva | Fuente real y condiciones |
|---|---|---|---|
| Inicio / Servicios | Comprender valor y elegir siguiente acción | L0 ambiental, L1/L2 contexto, Focal solo en hero, Quiet en apoyo; L4 siempre HTML | Rutas públicas, navegación canónica, `PublicHeroArt`, `Card`, `Button`; no copiar escenas con CTA rasterizado |
| Vecindario | Encontrar y comparar negocios | Quiet para tarjetas y filtros, Solid para resultados legibles; no ocultar el buscador detrás de efectos | `SearchFilters` y datos reales; no inventar disponibilidad, reseñas ni categorías |
| Aprende | Leer, aprender y avanzar | Solid dominante, Quiet para índice y lecturas vinculadas; ilustraciones separadas de texto | Editorial real y recursos originales; no añadir scroll animations que oculten párrafos |
| Diagnóstico | Responder y entender evidencias | Solid para opciones y resultados; atmósfera muy secundaria | No cambiar preguntas, puntuación, cobertura, confianza, privacidad ni almacenamiento |
| Mi Vecidya | Gestionar tareas y negocio | Solid para formularios, Quiet para ayuda contextual; una acción principal | Shell cliente y permisos efectivos; mostrar borrador/publicación reales |
| Admin | Operar, filtrar y auditar | Solid en tablas, métricas, permisos y errores; Quiet solo en controles auxiliares | Shell interno, filtros GET, `platform_admin` y datos autorizados; no camuflar 403 |
| Editor MiniWeb | Preparar, previsualizar y publicar | Solid para edición; Quiet para vista previa; respetar la marca del negocio | `/app/miniweb-v2`, snapshots, revisiones y permisos reales; MiniWeb pública NO hereda tema Vecidya |
| Planes | Comparar capacidades comprobables | Quiet + un único foco; comparación de lectura sólida | Catálogo comercial y entitlements reales, integración GHL externa diferenciada |

### Secuencia exigida para cada implementación
1. **Leader:** delimitar ruta, propietario, objetivo, datos reales, restricciones de permisos y estado de publicación; asignar subagentes, nunca delegar la autoridad final.
2. **UX/UI:** seleccionar `intentRouting`, material Focal/Quiet/Solid, receta `sceneRecipes` si existe, y describir L0–L5 sin introducir escenas innecesarias.
3. **Editorial:** revisar título, instrucciones, errores, CTA y estado vacío con lenguaje comprensible e inequívoco, sin alterar el significado o la capacidad comercial.
4. **Frontend:** localizar componente/exportación y consumidores existentes; reutilizar tokens `--v-*`; si algo no existe, registrar brecha en vez de inventar API o copiar CSS `vx-r1-*`.
5. **Calidad:** probar funcionalidad, estado vacío/carga/error/denegado/éxito, teclado/foco, 320/390/768/1366/1920, reduced-motion y contraste real; zoom 200 % y lector de pantalla requieren evidencia independiente.
6. **Leader:** revisar diff y límites, asociar resultado a SHA, confirmar typecheck/build y pruebas afectadas, abrir PR. Merge, publicación en Cloudflare y activación global de tema son decisiones separadas.

### Contrato de escena y material
- **Focal** = `Card surface="highlight"` cuando corresponde; un hero puede tener composición distinta. No usar para tablas ni texto largo.
- **Quiet** = `Card surface="glass"` como soporte secundario, y **Solid** = `Card surface="solid"` en trabajo/lectura. `depth` es una dimensión distinta (`quiet/rest/raised/floating`).
- L0 fondo estacionario, L1 ilustración contextual, L2 estructura, L3 soporte material, L4 texto/datos/controles HTML reales y L5 foco visual. Eliminar L1/L2/L5 si no aportan información.
- El fondo no aporta texto necesario ni controles. Si faltan recursos multimedia, conservar una composición útil y legible. `prefers-reduced-motion` manda sobre controles de animación.
- Los 140 assets son catálogo de opciones, no lista de recursos obligatorios. Validar archivo fuente, licencia, dimensiones, variantes, transparencia y `alt`; optimizar derivados sin eliminar originales referenciados.
- Los flags de `app/lib/visual-rollout.ts` son reversión **por código**: Inicio, Vecindario, Servicios, Admin Negocios y editor MiniWeb ya están activos; pilotos de Aprende y shell cliente comienzan apagados. No son autorización ni switches remotos.

### Entrega que puede aceptar el agente líder
```text
Área / ruta:
Objetivo comprobable:
Intención, material y capas L0–L5:
Código y componentes reales inspeccionados:
Assets oficiales (origen, dimensiones, alt):
Archivos modificados y razón:
Permisos/datos/licencias afectados: ninguno | detalle autorizado
Estados y accesibilidad comprobados:
Pruebas RAN / NO_VERIFICADO, SHA y logs:
Revisión visual humana y defectos abiertos:
PR, condición de reversión y estado de despliegue:
```

**Antialucinación:** ningún patrón, captura, badge o ejemplo declara la función implementada. No declarar «premium terminado», «WCAG PASS», «publicado», «CRM conectado» o «guardado» sin evidencia específica. Respetar el límite documental de `AGENTS.md`: actualizar documentos existentes y no crear otro documento canónico por fase.

---


**Corte:** 2026-11-20 · **Estado:** R1.2–R1.4 integrados en `main`; R1.5 es compatibilidad de laboratorio en rama. Sin migración automática del frontend ni despliegue comprobado. **Propósito:** permitir que Kilo Code, subagentes y desarrolladores interpreten solicitudes y seleccionen patrones consistentes, sin usar el laboratorio como si fuera un paquete React listo.

## Personalizador MiniWeb de laboratorio — R1.6 (2026-11-20)

En `biblioteca.html#miniweb-customizer` hay una vista previa real en HTML/CSS que permite ajustar **experiencia compositiva Base/Pro/Premium, paleta y tres colores libres (principal, acento y fondo), tipografía, disposición, alineación, posición de imagen, tamaño de título/texto, espaciados, radios y altura de portada**. Los controles cambian únicamente variables CSS de la muestra mediante `assets/miniweb-customizer.js`, aisladas por `.mw-lab__preview`; los estilos viven en `styles/miniweb-customizer.css`.

- **Base/Cuadra**: hero dividido, rejilla uniforme y contacto directo; presentación completa.
- **Pro/Barrio**: hero asimétrico y retícula editorial; no se inventan formularios CRM ni automatizaciones.
- **Premium/Ciudad**: hero inmersivo y ritmo de bloques más narrativo; tampoco simula módulos multiproceso.
- **Igual calidad básica**: las tres conservan tipografía legible, estructura, CTA de ejemplo accesible y recursos completos; se diferencian por composición, no por eliminar funciones de Cuadra.
- **Color personalizado** permite afinar colores hexadecimales con un selector visual; el laboratorio avisa si el contraste estimado de texto o botón cae por debajo de 4,5:1. La revisión final debe medir los fondos compuestos reales y todos los estados.
- **Restaurar** vuelve a la vista inicial sin mutar datos.
- **Copiar propuesta para agentes** produce JSON con `schema: vecidya-crystal-miniweb-visual-brief-v1` y `scope: concept-only-not-a-product-configuration`. Es un **brief visual**, no un formato válido para la API, el snapshot o el renderer MiniWeb V2.
- El ejemplo usa el negocio sintético **Estudio Aurora**, sin clientes reales. No hay login, localStorage, solicitudes de red, guardado, publicación, pago ni concesión de licencia.

### Interpretación obligatoria para implementadores

1. Leer `assets/pattern-registry.json → miniwebCustomizationLab`; comprobar límites admitidos de cada campo y variantes.
2. Comparar el componente/selector deseado con el **editor real** en `vecidya-platform/app/routes/miniweb-v2-editor.tsx` y el renderer/snapshot vigente. El nombre de este archivo es orientativo: localizar la exportación real, no asumir que existe por la ruta aquí escrita.
3. Antes de almacenar estilos personalizados: diseñar **schema versionado y validación server-side**, aislamiento por organización, preview exacto, propiedades permitidas y migración de borradores anteriores. Un campo del lab no autoriza persistir CSS arbitrario.
4. Usar tokens semánticos y variantes permitidas, no inyección de CSS, HTML ni URLs de recursos sin validar; garantizar contraste, longitud de texto, fallback sin imágenes, navegación y movimiento reducido.
5. Probar guardar/recargar/revertir y publicación real únicamente en entorno autorizado, sin cambiar derechos `Cuadra/Barrio/Ciudad` ni mezclar identidades de negocios.
6. QA focal del lab: `node --test vecidya-crystal-depth/tests/r1-contract.test.mjs` desde raíz y `node vecidya-crystal-depth/tests/r2-browser-qa.mjs` según instalación Chromium del proyecto. Comparar 390 y 1366 px, restauración, tema, scroll y ausencia de errores de JS.

**Estado:** implementado solo en biblioteca, para demostración y decisión de diseño. No se ha añadido un editor personalizable de producción ni activado estilos en MiniWeb pública.

---

## 1. Punto de entrada obligatorio para agentes

Antes de intervenir una pantalla, leer en este orden:

1. `AGENTS.md` (raíz), `vecidya-platform/docs/GOVERNANCE.md`, `STATUS.md` y `PROJECT_STATE.md`; comprobar estado, rama y límites del checkpoint.
2. **Fuente de verdad del producto:** `vecidya-platform/docs/design-system/VECIDYA-UI-UX.md`, `app/styles/premium-foundation.css`, `app/styles/visual-system.css` y componentes React actuales.
3. `vecidya-crystal-depth/assets/pattern-registry.json → platformCompatibility`: comprobar primero que el material y componente sugeridos ya existen y coinciden con sus exportaciones.
4. `vecidya-crystal-depth/docs/DIRECCION-ARTISTICA.md`: intención visual, materiales y composición L0–L5; no sustituye tokens de producción.
5. `vecidya-crystal-depth/biblioteca.html#guia` y `#idioma`: demostraciones para comparar; no copiar directamente HTML/CSS a React.

**Regla fundamental:** `pattern-registry.json` expresa intención visual R1, no permisos, esquema, API, derechos, contratos publicados ni servicios activados. Para esas decisiones manda el código y los documentos canónicos de plataforma y negocio.

## 2. Protocolo para interpretar cualquier consulta

```text
PETICIÓN: "Mejora la sección X de Vecidya".
1) Identificar destino: marketing / Vecindario / Diagnóstico / Aprende / MiniWeb / app / Admin / licencias.
2) Identificar tarea principal: atraer / encontrar / leer / decidir / editar / operar.
3) Buscar intención exacta o la más cercana en assets/pattern-registry.json → intentRouting.
4) Elegir material: focal (narrativa), quiet (soporte), solid (trabajo/datos).
5) Componer L0–L5 solo donde aporten sentido; ninguna escena debe bloquear L4.
6) Consultar asset real y su origen, licencia, calidad, texto alternativo y tamaño.
7) Confirmar funcionalidades/entitlements efectivas y límites de CRM GHL.
8) Localizar componente real; adaptar tokens/variantes sin duplicar componentes.
9) Diseñar y probar estados: default, hover, focus, active, disabled, loading, empty, error, success.
10) Verificar accesibilidad, tamaño táctil, responsive, reduced-motion, fallback sin blur.
11) Ejecutar QA focal + typecheck/build si cambia plataforma; documentar evidencias del SHA.
12) Abrir PR; NO merge ni deploy sin autorización independiente.
```

Cuando una consulta abarque varias áreas, **dividir en checkpoints por ruta y riesgo**, no implementar simultáneamente cambios visuales, de permisos y de backend. Si la intención no figura en el registro, usar `solid` para lectura/operación por defecto, describir la nueva necesidad y solicitar evaluación de diseño; no inventar un cuarto material.

## 3. Tabla orientadora: intención → patrón → precaución

| Solicitud que puede recibir un agente | Intención `intentRouting` | Material inicial | Riesgo crítico |
|---|---|---|---|
| "Portada premium" / "efecto 3D" | `portada-marketing` | Focal + Quiet | El texto debe ser HTML y Vico un asset separado |
| "Mejorar búsqueda Vecindario" | `buscar-negocios` | Quiet + Solid | No inventar datos, categorías ni resultados |
| "Hacer más claro el diagnóstico" | `diagnosticar` | Solid | No modificar scoring, preguntas ni privacidad |
| "Rediseñar Aprende" | `contenido-editorial` | Solid + Quiet | Lectura larga y semántica editorial dominan |
| "Editor del MiniWeb" | `editar-miniweb` | Solid + Quiet | Borrador/revisión/publicación sin pérdida de datos |
| "Dashboard, equipo, licencias" | `administrar-plataforma` | Solid | No saltarse permisos ni disfrazar estados |
| "Mostrar diferencias entre planes" | `comparar-licencias` | Quiet + un único foco | Cuadra completo; no atribuir GHL no operativo |
| "Formulario conectado a CRM" | `captacion-comercial` | Solid + CTA | GHL externo, integración real por verificar |

## 4. Reglas visuales programables

- `focal` → `vx-r1-focal` (solo demostración de laboratorio): fondo compositivo, bisel de mayor relieve, reflejo contenido; no para lectura densa.
- `quiet` → `vx-r1-quiet`: superficies de apoyo y navegación.
- `solid` → `vx-r1-solid`: campos, tablas y paneles con contraste estable.
- El tema oscuro es el estado inicial de la biblioteca; claro es alternativo. Ambos requieren pruebas individuales y no se infieren mediante `filter: invert()`.
- Mantener una sola receta geométrica por familia; naranja es acción de marca, verde confirmación, ámbar atención y rojo error. Un estado combina icono/texto/contexto, jamás solo color.
- No poner controles en fondos WebP, ni mensajes dentro de escenas rasterizadas. Preservar Vico oficial y fuentes originales.
- La ambientación L0 puede ser estacionaria; L1–L5 se componen según la sección. Reducir complejidad y paralaje en móvil o `prefers-reduced-motion`.

### Selección de assets

`assets/library-catalog.js` enumera 140 fuentes catalogadas de `vecidya-crystal-depth/assets/library-assets/` con vistas previas. No confundir vista previa con original; un link `Abrir original` puede requerir el árbol del repositorio para resolver. `assets/pattern-registry.json` orienta por intención, pero la ruta concreta del asset se valida contra archivos existentes, su variante original y la página destino. Las 11 propuestas Crystal PNG no constituyen una sustitución automática de iconos.

## 4.1. Movimiento R1.1: interpretación de solicitudes de animación

Si el cliente solicita **transiciones, animaciones, efectos o navegación fluida**, el agente debe seleccionar un preset de `assets/pattern-registry.json → motion.presets`. Esto se evalúa después de elegir el material, nunca en vez de verificar un componente real.

| Intención | Preset | Comportamiento y límite |
| --- | --- | --- |
| Entrar a una portada | `page-enter` | Aparición única de hero, aprox. 580 ms; no retrasa contenido ni SEO |
| Recorrer una página | `section-reveal` | Transform y opacidad 340–480 ms al entrar en viewport; si JS falla, contenido visible |
| Activar botones/tarjetas/pestañas | `ui-feedback` | 150–260 ms; no modificar layout, función, foco ni estado real |
| Escena comercial o Vico | `ambient-drift` | Órbitas y halos decorativos entre 9–14 s, con pausa; evitar en datos densos |
| Navegación entre secciones | `section-navigation` | Scroll suave opt-in en anclas; movimiento reducido usa scroll instantáneo |

**Cómo consumirlo:** la sección `biblioteca.html#movimiento` contiene ejemplos interactivos, selector de intensidad, pausa/reanudación y repetición de la escena. El CSS de referencia está en `styles/motion-system.css` y su mejora JS en `assets/motion-system.js`; **no son aún componentes React adoptados por la plataforma**. Los datos, diagnósticos, MiniWeb editor y Admin usan contenido quiet/solid y evitan efectos continuos.

**Accesibilidad:** `prefers-reduced-motion: reduce` prevalece sobre controles de laboratorio. El navegador sin JavaScript o sin `IntersectionObserver` presenta la página completa, sin ocultar secciones. Mantener foco visible, controles de pausa en efectos de más de 5 s, movimientos no esenciales y ausencia de scroll forzado. En móvil, eliminar órbitas costosas y reducir amplitud. Nunca simular un cambio de página que no haya ocurrido ni capturar el scroll del usuario.

**Certificación obligatoria de adopción:** R2 navegador con tema claro/oscuro, 320/390/768/1366/1920 px, reduced-motion, cero overflow, estados y permiso real; antes de integrar rutas React es necesario especificar transición opt-in por ruta, compatibilidad con foco/historial, web vitals y rollback.

## 4.2. Recetas de página R1.2: de la consulta a una composición concreta

El catálogo `assets/pattern-registry.json → sceneRecipes` incluye **cuatro composiciones didácticas**. Visualizarlas en `biblioteca.html#composiciones` antes de seleccionar assets y movimientos. Son modelos de presentación, no rutas, editores ni funcionalidades implementadas.

| Cuando la petición dice… | Receta | Superficie dominante | Movimiento permitido | Qué no hacer |
| --- | --- | --- | --- | --- |
| «Haz la portada más profesional» | `publico` | Focal en portada, Quiet en apoyo | Entrada única y ambiente pausado | Dibujar CTA o textos dentro de la imagen |
| «Mejora búsqueda y negocios» | `vecindario` | Quiet + Solid | Hover/foco breve, secciones discretas | Inventar listados y mover resultados mientras se leen |
| «Que Aprende sea comprensible» | `aprende` | Solid + Quiet | Aparición breve por sección | Movimiento permanente bajo párrafos o jerarquía ilegible |
| «Da mejor aspecto a MiniWeb» | `miniweb` | Solid en editor, Quiet en vista previa | Respuesta breve a controles reales | Simular publicación, conceder prestaciones por plan o perder datos |

**Flujo mínimo del agente:** interpretar destino → consultar `intentRouting` → elegir `sceneRecipes` → localizar imágenes oficiales → escoger `motion.presets` compatibles → comprobar permisos y rutas reales → componer React solo cuando haya autorización. Cada receta indica `status: demo-only-not-route`; ninguna puede activar un producto por sí misma.

Las cuatro muestras usan pestañas seleccionables mediante ratón y teclado (flechas, Inicio y Fin), respetan movimiento reducido y muestran los cuatro contenidos sin JavaScript. Son **componentes demostrativos** en `styles/scene-composer.css` y `assets/scene-composer.js`; no exportar esos estilos como CSS global de la plataforma ni introducir un segundo router.

**Empaquetado aislado:** el script `scripts/build-cloudflare.mjs` construye el sitio de demostración sin desplegar, reescribe assets y conserva los documentos didácticos referenciados por la propia página. La CI ejecuta el empaquetado y comprueba archivos, pero esa aprobación no autoriza conectar producción a Cloudflare.

## 4.3. Estados de interacción R1.3: no mentir a quien usa el producto

Cuando se soliciten formularios, búsquedas, paneles o flujos con cambios de datos, consultar `assets/pattern-registry.json → interactionRecipes` y `biblioteca.html#flujos`.

| Estado | Comportamiento obligatorio |
| --- | --- |
| `idle` | Mostrar acción y contexto antes de usarla. |
| `loading` | Espera solo si hay tarea real; evitar duplicados, no inventar progreso. |
| `empty` | Explicar por qué no hay resultados y ofrecer siguiente paso. |
| `error` | Mantener entradas y dar recuperación segura, sin secretos. |
| `success` | Confirmar **solo** después de respuesta verificable del backend o integración externa. |

Los textos del laboratorio declaran su naturaleza simulada; nunca copiar literalmente `Acción confirmada` a una implementación sin completar el contrato de persistencia. Conservar estados de foco, etiquetas y región viva accesible; respetar `prefers-reduced-motion`. No usar efectos decorativos como indicadores de envío real.

## 4.4. Encargo reutilizable por subagente — R1.4

El asistente de `biblioteca.html#guia` ofrece cuatro especialidades: **frontend**, **editorial**, **UX/UI** y **calidad**. La selección de una especialidad **no elige al líder**: este asigna y coordina el trabajo, y el colaborador recibe un borrador con la intención, el material, la escena si está documentada, restricciones y criterios de verificación.

El brief se construye desde `pattern-registry.json` (rutas `intentRouting`, `sceneRecipes`, `motion.presets` e `interactionRecipes`). Si el registro no puede cargarse, se genera solo la orientación básica derivada de las opciones visibles; no se asegura que esté completa y se debe consultar la fuente antes de implementar.

**Rol editorial:** corregir redacción y estructura para que una persona sin experiencia técnica comprenda qué se le pregunta, qué hará cada acción y qué pasará después. Evitar enunciados vagos, tecnicismos y expresiones que admitan varias interpretaciones; jamás cambiar una prestación o una regla de negocio para hacer atractivo el texto. El agente editorial no decide permisos, arquitectura ni priorización del equipo.

**Seguridad editorial y técnica:** no inventar datos de clientes, resultados, integraciones GHL o publicación de MiniWeb. Los permisos reales y los componentes de la plataforma son la fuente canónica. Revisar y adaptar el borrador antes de pegarlo en Kilo Code; copiar no significa ejecutar acciones.

## 4.5. Traductor de material a frontend existente — R1.5

**Jerarquía de autoridad:** código y contratos de `vecidya-platform/app/` → sistema visual aprobado de plataforma → `platformCompatibility` como mapeo de consulta → demos de Crystal Depth. Una sugerencia del laboratorio **nunca reemplaza** un token o componente real.

| Crystal Depth | Selección React orientadora | Profundidad recomendada | Restricción |
| --- | --- | --- | --- |
| **Focal** | `Card surface="highlight"` | `depth="raised"` | Solo contexto editorial corto; heroes pueden usar `PublicHeroArt` en vez de Card. |
| **Quiet** | `Card surface="glass"` | `depth="quiet"` o `"rest"` | Panel secundario con semántica real de navegación o acción. |
| **Solid** | `Card surface="solid"` | `depth="rest"` | Formularios, tablas, editores, administración y contenido largo. |

**Contratos que ya existen:** `Button(tone)`, `Card(surface,depth)`, `Badge(tone)`, `Alert(role="alert")`, `Icon(name)`, `JourneyGuide(area)`, `MetricCard(value)`, `ProgressMeter(value)`, `ComparisonBars(values)`, además de `EmptyState` y `SearchFilters` públicos. Los shells son `PublicLayout`, `ClientAreaShell` y `AdminShell`. Antes de crear una variante, localizar sus consumidores para no duplicar funciones.

**Tokens:** `--v-blue-950`, `--v-blue-700`, `--v-cyan-500`, `--v-orange-500`, `--v-ink`, `--v-muted`, `--v-radius-card`, `--v-space-4`, `--v-duration-fast`, `--v-duration-interaction`. Ver valores vigentes en `premium-foundation.css`; los de `pattern-registry.json` son una instantánea comprobada por test, no una segunda hoja CSS. El foco naranja y los estados semánticos de React prevalecen sobre amber y sombras de la demo.

**Reglas de marca y navegación:** `PUBLIC_NAVIGATION_LINKS` decide nombres y destinos de la web pública. El HTML de Crystal no introduce rutas ni modifica el menú React. La plataforma está actualmente en modo claro; cambiar toda Vecidya a oscuro requiere contrato opt-in por shell y aceptación por pantalla. La fuente de MiniWeb pública es la identidad del negocio; no imponer el tema Vecidya a su página.

**Brecha de estados:** el sistema visual de la plataforma también exige **acceso denegado**. El laboratorio R1.3 todavía no tiene esa muestra; `platformCompatibility.stateParity` la registra y la reserva para R1.6. El motivo de denegación se deriva de autorización real del servidor, no de una animación ni de un resultado vacío.

**Pendientes (NO IMPLEMENTADOS como primitivos compartidos):** `PageHeading` P1, `AdminFilterBar` P1, `ConsentStatus` P1, `DiagnosticMetricCard` P2 y `DiagnosticTrend` P2 son candidatos de la guía oficial. `SharedStatusPanel` es propuesta adicional para unificar loading/empty/error/success, pero debe partir de `EmptyState` y `Alert` existentes sin duplicarlos. Los contratos de datos, consentimiento y métricas siguen bajo el backend existente.

**Trabajo de un agente:** leer la ruta y shell actual → seleccionar componente existente → usar tokens `--v-*` → verificar interfaz y variantes tipadas → adaptar únicamente los estilos necesarios → QA focal y evidencia del SHA → revisión y PR. La sección 12 es una referencia operativa, no una migración realizada.

## 5. MiniWeb V2 y licencias: contrato de interfaz, no habilitación

`Cuadra`: web profesional completa y editable por organización, con plantilla sectorial legible. `Barrio`: hereda Cuadra; composición orientada a captar consultas y gestionar seguimiento cuando su integración GHL esté operativa. `Ciudad`: hereda Barrio; variaciones de composiciones multiproceso cuando esos procesos estén realmente disponibles. Las diferencias deben responder al valor del producto, **no** a reducir artificialmente la calidad de Cuadra.

La matriz comercial vigente en `vecidya-platform/docs/business/VECIDYA_PRODUCT_CATALOG.md` y los entitlements reales del backend mandan sobre cualquier mock visual. Cambiar de plantilla MiniWeb debe conservar contenido. No crear un CRM paralelo a GHL ni afirmar que los complementos están activos por mostrar una pantalla.

## 6. Contrato de entrega y QA para agentes

Entregar en cada checkpoint un resumen con `alcance`, `intención`, `patrón`, `assets verificados`, `archivos propios`, `pruebas ejecutadas`, `riesgos pendientes`, `commit/PR` y `estado de producción`. Si una prueba no se ejecuta, documentar `NO VERIFICADO`; jamás copiar un PASS anterior como propio.

**Gates de R2 (pendientes):** contraste WCAG en fondos compuestos, zoom 200 %, lectores de pantalla, navegación teclado, 320/390/768/1366/1920 px, foco, estados de error, reduced-motion, ausencia de blur, compatibilidad del tema claro y validación visual humana. El laboratorio puede tener muestras funcionales sin haber pasado estas certificaciones.

### Plantilla corta de instrucción para Kilo Code

```text
Antes de modificar esta pantalla de Vecidya, lee AGENTS.md, los documentos canónicos afectados,
vecidya-crystal-depth/docs/DIRECCION-ARTISTICA.md,
vecidya-crystal-depth/docs/INTEGRACION.md y
vecidya-crystal-depth/assets/pattern-registry.json.
Identifica la intención de interfaz y aplica la receta focal/quiet/solid correspondiente.
Usa assets oficiales y los componentes React ya existentes. Preserva permisos, datos,
contratos de diagnóstico, entitlements y separación Vecidya/GHL.
Prueba solo lo relevante al checkpoint y documenta el SHA; abre PR sin desplegar.
```

## 7. Orden de adopción tras aprobación

1. Aprobar visualmente el laboratorio R1 y su diseño de tokens (aún pendiente).
2. R2: certificar contrastes, responsive, interacción, assets, accesibilidad y documentación.
3. Comparar CSS guía R1 con el sistema ya implementado `visual-system.css`; incorporar nuevos tokens **opt-in**, sin duplicar ni sustituir globalmente su semántica.
4. Crear variantes React tipadas de componentes existentes; no romper el contrato de `Button`, `Card` ni su accesibilidad.
5. Migrar pantallas por lotes pequeños; certificar por ruta y documentar.
6. Solo con autorización y contratos operativos, habilitar controles por licencia en MiniWeb, respetando organización y publicación.

**Estado:** esta entrega no modifica `vecidya-platform/`, no crea migraciones, no altera permisos ni licencia y no despliega.

## Vico — selección y ubicación de imágenes oficiales (checkpoint 2026-11-20)

Cuando la tarea requiera Vico o una de sus escenas, el subagente deberá:
1. Consultar `assets/pattern-registry.json → vicoVisualIdentity` y `biblioteca.html#vico`, donde los diez recursos de la categoría Vico proceden del catálogo original.
2. Identificar ruta y función visual reales. La infografía `home-vecidya-companion-v4.webp` no contiene a Vico y no es una variante del personaje; nunca utilizarla como reemplazo de `vico-home.webp`.
3. Leer el registro de la imagen original y su uso en `vecidya-platform/app/assets/public-assets.ts`, `app/components/public-hero-art.tsx`, Inicio o Aprende, según corresponda. La vista previa WebP de 240 px no reemplaza el recurso original.
4. Componer Vico (L5) y la escena (L1) como capas independientes, sin incrustar texto, datos, CTAs o estado comercial. Mantener proporciones y no estirar ni invertir imágenes.
5. Verificar fondo oscuro/claro, cuadro de transparencia, recorte móvil, tamaño real, `alt` contextual o decorativo, movimiento reducido y rendimiento. No presumir alpha ni acabado perfecto solo por tener un archivo WebP.
6. Entregar ruta, fuente, intención, composición, captura del mismo SHA, fallos y estado de aprobación humana. Sin evidencia, marcar `NO_VERIFICADO`, nunca `PASS`.

**Separación de marca:** Vico identifica a Vecidya; no se inserta como marca del sitio de los negocios ni se ofrece por defecto como personaje de las MiniWeb. Las diez imágenes del personaje se mantienen originales, y ninguna modificación del visor constituye una migración a React.



### Independencia de assets — 2026-11-23

La biblioteca conserva localmente los 140 recursos catalogados en `assets/library-assets/`. Las entradas de `assets/library-catalog.js`, las escenas de `assets/pattern-registry.json` y `biblioteca.html` deben apuntar a esa copia. No se deben introducir nuevas rutas runtime hacia `vecidya-platform/public/assets/`.
