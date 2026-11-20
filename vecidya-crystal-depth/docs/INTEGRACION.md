# Guía de integración y uso por agentes — Crystal Depth R1.5

**Corte:** 2026-11-20 · **Estado:** R1.2–R1.4 integrados en `main`; R1.5 es compatibilidad de laboratorio en rama. Sin migración automática del frontend ni despliegue comprobado. **Propósito:** permitir que Kilo Code, subagentes y desarrolladores interpreten solicitudes y seleccionen patrones consistentes, sin usar el laboratorio como si fuera un paquete React listo.

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

`assets/library-catalog.js` enumera 140 fuentes catalogadas de `vecidya-platform/public/assets/` con vistas previas. No confundir vista previa con original; un link `Abrir original` puede requerir el árbol del repositorio para resolver. `assets/pattern-registry.json` orienta por intención, pero la ruta concreta del asset se valida contra archivos existentes, su variante original y la página destino. Las 11 propuestas Crystal PNG no constituyen una sustitución automática de iconos.

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
