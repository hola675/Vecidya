## Vico — identidad y diez imágenes del personaje (actualización 2026-11-20)

**Contrato de uso verificable:** `assets/pattern-registry.json → vicoVisualIdentity`. En `biblioteca.html#vico` existe un explorador de los **10 registros Vico** ya catalogados en `assets/library-catalog.js`, sin duplicar imágenes. El visor muestra el original, sus dimensiones, destino recomendado y sus límites, permite simular fondos oscuros/claros/cuadrícula, posición, escala y escena contextual independiente. No cambia arte ni plataformas y no es un generador de imágenes.

### Gramática de identidad
- **Vico personaje (L5):** una pieza individual apropiada al tema. Mantener rasgos, silueta, colores, perspectiva y proporción original. Jamás estirar, reflejar, cortar partes esenciales o recolorear por programa sin una nueva variante aprobada.
- **Escena ambiental (L1):** imagen contextual independiente, subordinada a título y CTA. Vico puede acompañar la escena, pero no queda soldado a ella como screenshot. Permite recolocar/ocultar cada imagen en pantallas pequeñas.
- **Infografía complementaria de Inicio:** `home-vecidya-companion-v4.webp` contiene elementos del ecosistema digital, pero **no al personaje Vico**. Se conserva en `Ilustraciones` y no debe contarse ni tratarse como pose del personaje.
- **Variante por propósito:** Inicio (bienvenida + personaje), Vecindario (descubrimiento), Diagnóstico (orientación), Servicios (explicación), Licencias (comparación), Complementos (capacidades), Aprende (guía), Contacto (bienvenida), Nosotros (historia) y Únete (incorporación). No elegir al azar por color o agrado.
- **MiniWeb de clientes:** Vico identifica a Vecidya, no a la empresa que contrata MiniWeb; el negocio conserva su propia marca. El editor puede enlazar a ayuda Vecidya, pero no insertar Vico como hero automático del sitio del cliente.
- **Semántica:** no convertir expresiones de Vico en resultados de diagnóstico, aprobaciones, permisos, estado comercial ni confirmación de guardado. No incrustar texto, formularios, acciones o marcas de terceros dentro del archivo rasterizado.

### Controles para revisar cada imagen
Verificar a escala real y móvil: transparencia/halo, recorte completo, brazos y accesorios, bordes en claro/oscuro, profundidad coherente, peso visual, contraste del contenido independiente, `object-fit:contain`, ausencia de píxeles transparentes usados como margen que reduzca excesivamente el tamaño del personaje, `width/height` proporcionados, `loading` adecuado, texto alternativo contextual (decorativa `alt=""` si el mismo concepto ya está explicado) y `prefers-reduced-motion`. **Dimensiones WebP catalogadas no certifican transparencia, ausencia de defectos ni calidad subjetiva:** esos resultados requieren abrir los originales o revisar capturas del navegador.

Los agentes deben conservar los originales y optimizar solo derivados trazables. Cualquier rediseño de pose, accesorio o expresión exige un encargo de imagen nuevo y aprobación de identidad, distinto del trabajo de implementación CSS.

### Inspección visual inicial de originales (2026-11-20)

Se reabrieron los 10 archivos WebP originales y la ilustración complementaria por separado. La cabecera WebP `VP8X` declara **canal alfa presente en los diez archivos de Vico**; esto verifica una característica del formato, no que cada píxel transparente sea perfecto.

| Prioridad | Original / grupo | Observación visual | Criterio de corrección |
|---|---|---|---|
| Alta | `vico-home.webp` | Se aprecian franjas y restos de gradiente alrededor del personaje, visibles especialmente al contrastar el fondo. | Evaluar máscara alfa y residuos sin regenerar ni alterar rasgos; derivado nuevo solo tras aprobación |
| Alta | `vico-diagnostico.webp` | Se observan bandas rectangulares de fondo en torno al personaje y al objeto que sostiene. | Revisar bordes/halo sobre superficies oscuras y claras con píxel real |
| Media | `vico-vecindario.webp`, `vico-licencias.webp`, `vico-servicios.webp`, `vico-addons.webp` | Composición rica en objetos pequeños: pierde detalle cuando se usa como miniatura. | Conservar hero suficiente, no imponer tamaños mínimos ficticios sin medir |
| Media | Conjunto de 10 poses | Se observan halos luminosos y algunos bordes abruptos alrededor de silueta/accesorios en distintas piezas. | Verificar visualmente en claro/oscuro y a zoom; no asumir máscara limpia por el flag alfa |
| Identidad conservada | Las diez poses | Coinciden en personaje de zorro naranja, chaqueta azul, acentos de Vecidya y acabado tridimensional. | Mantener coherencia de ojos, orejas, ropa y perspectiva; no sustituir por mascotas alternas |
| Reclasificación confirmada | `home-vecidya-companion-v4.webp` | Es una infografía del ecosistema Vecidya y **no contiene al personaje**. | Categoria `Ilustraciones`, no `Vico`; sigue disponible para el Inicio |

**Límite de esta revisión:** los hallazgos son observaciones visuales de los archivos originales. No se ejecutó un análisis de máscara por píxel, no se produjeron derivados limpios y no se ha certificado una composición en todas las resoluciones de producción.

### Diagnóstico alfa reproducible en Chromium — segundo checkpoint

El explorador `biblioteca.html#vico` incorpora ahora **Comparación mitad clara/mitad oscura** y el control **Analizar píxeles alfa**. El navegador lee únicamente la imagen original seleccionada, crea una copia temporal en un canvas de hasta **512 px por lado largo**, y calcula un mapa de alfa y un informe local. Ningún pixel del WebP original se modifica ni se sube a un servidor.

- El mapa de diagnóstico representa `alfa 0` como negro, `alfa 255` como blanco y los valores intermedios como grises. No es un derivado publicado, un recorte autorizado ni una nueva ilustración.
- El informe `vecidya-vico-alpha-audit-v1` registra dimensiones reales y de muestreo, porcentajes por cinco rangos de alfa, límites de área visible (`alfa >= 16`) y actividad de alfa en una franja perimetral del 4 %. Estos indicadores **no demuestran** por sí mismos si un brillo es intencional o si hay fondo residual.
- **QA sin duplicar harness:** `tests/r2-browser-qa.mjs` analiza las diez imágenes a 1366 px, guarda el artifact temporal `qa-artifacts/vico-alpha-audit.json` y captura comparaciones de Inicio y Diagnóstico; los resultados no se incluyen como binarios permanentes en Git.
- **Aceptación de cualquier limpieza futura:** conservar la pose y el arte original, comparar lado a lado a tamaño real sobre claro/oscuro, cuantificar cambios de alfa sin eliminar sombras/reflejos intencionales y usar ruta derivada versionada; modificar la referencia productiva solo tras aprobación explícita.

`NO_VERIFICADO` sigue siendo el estado de una **limpieza física del recurso**, pues todavía no hay un derivado validado. Un test PASS de algoritmo alfa no significa que desaparecieron los defectos artísticos.

### Resultado cuantitativo de los diez originales (Chromium R2)

En el workflow **Crystal Depth contract QA** del commit `1fe034ce` (ejecución `44845058860`, navegador PASS) se analizaron diez WebP originales. Estos resultados proceden de un muestreo Canvas de hasta 512 px en el lado largo; son medidas de **transparencia**, no de calidad artística.

| Recurso | Alfa = 0 | Alfa 1–15 | Alfa 16–191 | Alfa 192–254 | Borde 4 % con alfa >= 16 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Inicio | 44,8 % | 1,4 % | 1,5 % | 52,3 % | 5,6 % |
| Diagnóstico | 44,7 % | 1,3 % | 1,5 % | 52,5 % | 7,3 % |
| Vecindario | 49,5 % | 1,7 % | 1,5 % | 47,3 % | 9,3 % |
| Servicios | 45,5 % | 2,8 % | 3,4 % | 48,3 % | 4,0 % |
| Licencias | 48,6 % | 2,1 % | 1,7 % | 47,5 % | 10,0 % |
| Complementos | 47,3 % | 2,5 % | 2,2 % | 48,0 % | 7,8 % |
| Aprende | 44,2 % | 1,3 % | 1,1 % | 53,3 % | 4,7 % |
| Contacto | 44,7 % | 1,6 % | 2,0 % | 51,7 % | 14,6 % |
| Nosotros | 47,2 % | 1,8 % | 1,8 % | 49,2 % | 7,3 % |
| Únete | 47,8 % | 2,6 % | 2,0 % | 47,6 % | 6,2 % |

**Precaución:** el histograma del navegador encontró 0 % exacto en alfa 255 para las diez piezas. No equivale a que el personaje sea visualmente transparente: el contenido casi opaco está en alfa 192–254. La actividad perimetral puede ser una oreja, una mano, una sombra o una franja residual; no se puede etiquetar automáticamente como defecto. La medición se ejecutó correctamente: [workflow de evidencia](https://github.com/hola675/Vecidya/actions/runs/44845058860).

### Propuesta temporal de limpieza sin sobrescribir la fuente

El laboratorio incorpora un **umbral alfa de comparación** (8, 16, 32 o 64). Solo en una copia Canvas reducida elimina los píxeles cuya opacidad sea mayor que cero y menor que el umbral. Muestra el porcentaje afectado y ofrece un **PNG de evaluación** descargable manualmente. El original WebP y las rutas productivas permanecen intactos.

Este procedimiento puede ayudar a quitar residuos translúcidos tenues, pero **no elimina franjas opacas, no identifica bordes falsos ni garantiza mejora visual**. Si Inicio o Diagnóstico conservan sus defectos en una comparación sobre claro y oscuro, se requiere segmentación/edición artística controlada con referencia al original, no aumentar el umbral hasta destruir reflejos. El PNG del laboratorio se limita a 512 px por lado largo y **no sirve como reemplazo de producción**.

La prueba Chromium existente también genera, en artifacts temporales, las muestras `vico-home-alpha16-EVALUACION.png` y `vico-diagnostico-alpha16-EVALUACION.png` junto a capturas de comparación. Son referencias para revisión artística, no archivos destinados a `public/assets/selected`.

### Registro de revisión
- `CODE`: catálogo de 10 referencias originales WebP del personaje: ocho rutas con `PublicHeroArt`, Inicio y Aprende; la infografía complementaria está catalogada aparte.
- `CODE`: `public-assets.ts` y `public-hero-art.tsx` utilizan personajes y escenas independientes para ocho páginas, con usos adicionales en Inicio y Aprende.
- `PENDIENTE`: inspección artística individual de los 10 originales, validación humana sobre captura, diferencias en 320/390/768/1366/1920, zoom 200 % y revisión en móvil real. No declarar esos controles PASS sin evidencia.
- **Changelog 2026-11-20:** matriz de selección y visor de 10 imágenes. Revisión visual directa detectó que `home-vecidya-companion-v4.webp` no muestra a Vico y corrigió su clasificación; algunos contornos presentan halos o residuos aparentes, pendientes de diagnóstico técnico y eventual limpieza autorizada. Ningún asset sustituido.

---

# Dirección artística — Crystal Depth

Dirección original R1.0 (2026-11-19); ampliación R1.5 de compatibilidad (2026-11-20). R1.2–R1.4 integradas como biblioteca; migración del frontend y certificación visual integral pendientes.


## R1 — Dirección artística consolidada (decisiones del responsable: 2026-11-19)

**Aprobado:** oscuro principal con claro alternativo; protagonismo del vidrio en escenas y discreción en contenido operativo; calidad visual premium común a Cuadra/Barrio/Ciudad, con progresión por composición/capacidad real; la biblioteca funciona como laboratorio interno, revisión y aprobación. **No aprobado:** importar estilos en producción, modificar derechos de licencia, alterar datos/rutas, activar GHL ni desplegar. Esta especificación y sus muestras implementan R1 en el laboratorio; no declaran certificación WCAG.

### 1. Tres ejes independientes

- **Material** determina geometría, opacidad, elevación y reflejo. No determina por sí solo significado semántico.
- **Intención** determina acción/información/éxito/aviso/error; siempre con etiqueta y estado textual. El naranja de marca no reemplaza al ámbar de advertencia.
- **Escena** determina el ambiente L0, contexto L1/L2 y protagonista L5. Nunca debe ser necesaria para comprender el contenido L4.

No crear seis sistemas de materiales por color: las seis muestras comparten receta. En lugares de lectura intensa, la superficie pasa a sólida aunque el resto de la página conserve Crystal.

### 2. Semántica y tokens R1 (referencia de laboratorio, no tokens aún publicados de la plataforma)

| Token | Valor | Uso / precaución |
|---|---|---|
| `color.background.dark` | `#06172F` | Base oscura; evitar negro puro que aplane el espacio |
| `color.surface.dark` | `#0D2E54` | Superficie base de lectura; componentes locales pueden necesitar aún más opacidad |
| `color.text.dark` | `#F3F8FF` | Texto principal sobre superficie oscura verificada |
| `color.text.muted.dark` | `#BDD6F0` | Secundario solo sobre base oscura suficientemente uniforme |
| `color.background.light` | `#F1F7FE` | Versión clara diseñada, no inversión automática |
| `color.surface.light` | `#FFFFFF` | Formularios/tablas y contenido largo en claro |
| `color.text.light` | `#123766` | Texto principal en claro |
| `color.brand.orange` | `#FF9B27` | Acento/CTA principal; texto oscuro sobre naranja |
| `color.brand.orangeInk` | `#09275C` | Texto propuesto sobre naranja sólido; verificar composición real |
| `color.accent.cyan` | `#51E3FF` | Luz/énfasis, no texto pequeño sin comprobación |
| `color.focus.dark` | `#FFDA8B` | Foco visible en superficies oscuras |
| `radius.card` | `23px` | Tarjetas; los controles tienen sus radios propios |
| `radius.large` | `34px` | Escenarios o contenedores de gran escala |

Los tokens canónicos para lectura automatizada viven en `../assets/pattern-registry.json`. CSS funcional del laboratorio: `../styles/r1-guidance.css`. No atribuirles condición de biblioteca de React lista para publicar.

**Contraste:** texto normal ≥ 4,5:1, texto grande ≥ 3:1, componentes no textuales relevantes ≥ 3:1 en su estado visual real. Probar el fondo compuesto *después* de aplicar alfa, gradiente, fotografía y blur. Nunca deducir contraste por el color hexadecimal nominal si la superficie es translúcida.

### 3. Escala de material, no una escala de precio

| Material | Roles | Iluminación | Contextos |
|---|---|---|---|
| `focal` · Crystal Focal | Narrativa, entrada, escena, CTA destacado | Reflexión y profundidad visibles | Hero, beneficios, páginas de licencias |
| `quiet` · Crystal Quiet | Soporte e interacción frecuente | Bisel suave, desenfoque moderado | Cards, navegación, resumen no denso |
| `solid` · Solid Readable | Trabajo y lectura | Prácticamente sin efecto | Formularios, tablas, diagnóstico, edición, admin |

**Cuadra:** una web completa, bonita y útil, sin barreras artificiales de calidad. **Barrio:** hereda calidad y añade narrativa de captación acorde con las funciones realmente configuradas. **Ciudad:** hereda calidad y puede componer flujos multiproceso cuando estén implementados. No prometer ampliaciones de plantilla o CRM como desplegadas por el mero hecho de mostrar esta propuesta.

### 4. Gramática de escena

1. L0 ambiente estacionario: gradiente de baja frecuencia, sin recuadros de contenido ni texto rasterizado; no desplazar el fondo de forma que impida lectura.
2. L1 contexto: una ilustración oficial pertinente al propósito, no la misma mascota en todas las secciones.
3. L2 estructura: plataformas/contornos/líneas que enlazan elementos dentro de la misma perspectiva.
4. L3 material: contenedores que separan el contenido del contexto.
5. L4 contenido: título, texto, botones, datos, estados, foco y navegación; siempre legibles sin fondo.
6. L5 foco: Vico o ilustración destacada con tamaño/perspectiva coherentes; no superponer sobre formularios.

Una página puede compartir L0 estacionario, pero cada sección usa su propia composición de L1–L5, alternando respiros editoriales con escenas focales. Los fondos ambientales no llevan texto, botones ni capturas de componentes que deban ser interactivos. En móvil simplificar L1/L2, limitar efectos costosos y preservar el orden semántico DOM.

### 4.1. Dirección de movimiento — R1.1 (2026-11-20)

**Principio:** la profundidad puede tener movimiento, pero el contenido nunca debe depender de él. La ambientación L0–L3 admite deriva lenta y pausa; el contenido L4, formularios, tablas y editores no se desplaza de forma continua. Vico L5 puede tener una entrada corta en portada, pero no saltar repetidamente durante la lectura.

- `page-enter`: hero en 580–700 ms, entrada única con opacidad y desplazamiento moderado; no bloquear interacción ni SEO.
- `section-reveal`: elementos editoriales en 340–480 ms al ingresar en viewport, con activación progresiva solo si el navegador lo admite. Sin JavaScript, todo visible.
- `ui-feedback`: 150–260 ms; estados de botones, pestañas y tarjetas con elevación máxima recomendada 2–4 px. Sin efectos engañosos de carga.
- `ambient-drift`: escenas de luz, órbitas, reflejos; ciclo de 9–14 s, pausa visible y sin movimiento en datos densos o móvil cuando resulte costoso.
- `section-navigation`: enlaces de ancla preservan navegación, historial, foco y scroll; `prefers-reduced-motion` elimina suavizado.

Familias `standard`, `subtle` y `static`. Un ajuste de usuario no puede desactivar el movimiento reducido del SO. La escena no incluye información textual solo en imagen, evita flash/parpadeo y no cambia el tamaño de bloques mediante animaciones. Transición entre rutas React queda como especificación futura opt-in; no se implementa todavía en la plataforma.

**Archivos de referencia:** `styles/motion-system.css`, `assets/motion-system.js`, `assets/pattern-registry.json → motion` y sección `biblioteca.html#movimiento`. Certificar en navegador real, no mediante capturas históricas ni prueba exclusivamente estática.

### 4.2. Composición de páginas — R1.2 (2026-11-20)

La identidad premium se mantiene al pasar entre cuatro tareas distintas; cambia la función visual del cristal, no la calidad general de la experiencia:

| Contexto | Material protagonista | Jerarquía y asset oficial | Movimiento |
| --- | --- | --- | --- |
| Sitio público | Focal en el hero, Quiet en paneles | Narrativa, CTA HTML y escena `home-scene.webp` | Entrada única, fondo ambiental pausado |
| Vecindario | Quiet + Solid | Filtros y datos reales sobre `neighborhood-scene.webp` | Feedback breve, resultados inmóviles |
| Aprende | Solid + Quiet | Lectura clara y `learn-journey-scene.webp` subordinada | Revelado leve de secciones, sin parallax de texto |
| MiniWeb V2 | Solid en edición, Quiet en previsualización | Estados reales de edición, escena de contexto `services-scene.webp` | Sin movimientos continuos en el editor |

**Demostración interactiva:** `biblioteca.html#composiciones`. Navegación de cuatro tabs con selección por teclado, soporte de preferencia de movimiento reducido, tema claro/oscuro y degradación legible sin JavaScript. El selector de contexto `#r1-intent` solo enlaza a uno de esos cuatro ejemplos cuando la intención coincide exactamente. Diagnóstico, Admin, licencias y GHL conservan su guía de materiales, pero no reciben escenas inventadas.

**Contrato legible por agentes:** `assets/pattern-registry.json → sceneRecipes`; esquema funcional en `styles/scene-composer.css` y `assets/scene-composer.js`. Las composiciones no crean rutas, no conceden prestaciones de planes, no gestionan publicación MiniWeb ni reemplazan componentes React. Su adopción productiva exige una tarea específica de integración después de la revisión de laboratorio.

### 4.3. Un único lenguaje entre biblioteca y plataforma — R1.5 (2026-11-20)

La decisión artística **no añade otro juego de tokens React**. `premium-foundation.css` aporta la paleta y escala de `--v-*`; `visual-system.css` define `v-surface`, `data-surface`, `data-depth`, `v-stack`, `v-cluster`, `v-grid` y `v-section-heading`. Crystal Depth traduce Focal→highlight, Quiet→glass y Solid→solid **solo como orientación de composición**; cada superficie React conserva su semántica y profundidad independiente.

**Diferencias explícitas:** React usa tema claro, foco naranja `--v-orange-500`, `--v-radius-card: 1.25rem` y movimiento `--v-duration-fast: 160ms` / `--v-duration-interaction: 220ms`. Crystal Depth muestra oscuro de base, foco y radios de laboratorio, y entradas narrativas más lentas. No homologar por renombrar ni intercambiar valores hex; primero definir variaciones por shell y estado. La MiniWeb pública pertenece visualmente al negocio.

**Biblioteca viva, no framework nuevo:** `pattern-registry.json → platformCompatibility` cruza materiales, tokens, componentes, rutas y componentes aún pendientes; `biblioteca.html#idioma` hace visible el mapeo. Para que el sistema sea único, los agentes deben consumir primero componentes React y evitar crear nuevos `Button`, `Card`, `Badge`, `Alert` o estilos globales redundantes.

**Decisiones abiertas:** si habrá tema oscuro en la plataforma; contrato de encabezados compartidos; filtro/paginación Admin; estados de consentimiento; métricas/series con evidencia; composición MiniWeb por planes reales; y reconciliación futura de reglas CSS heredadas con `--v-*`. Todas requieren adopción pequeña por ruta y QA. No tienen permiso automático de publicación.

### 5. Tipografía, espacio y forma

Usar la familia existente (Inter → Segoe UI → system-ui) sin introducir una nueva dependencia. Jerarquía: titular corto y reconocible, subtítulo útil, párrafos legibles (línea ideal ~55–75 caracteres), microcopy contextual. No usar mayúsculas espaciadas para bloques de lectura. Mantener retícula y ritmo coherentes por secciones, evitando tarjetas anidadas sin función; usar grupos visuales con un propósito por bloque. Estado `disabled`, validación, tooltip y aviso han de expresarse con texto y foco accesibles.

### 6. Assets y Vico

Solo fuentes oficiales de `vecidya-crystal-depth/assets/library-assets/` y sus derivados controlados: no generar un Vico alternativo, no inventar fotografías de clientes, no descargar iconos de terceros sin derechos. Las 11 vistas Crystal de iconos son *propuestas*, no sustituciones oficiales. Las 140 entradas de catálogo son inventario de consulta, no autorización para usarlas todas en producción. Preservar originales, verificar resolución, formato, texto alternativo, licencia y peso de los derivados.

### 7. Matriz mínima de aceptación R1→R2

- [ ] Escritorio/móvil: 320, 390, 768, 1366 y 1920 px; cero desbordamientos imprevistos.
- [ ] Oscuro por defecto y claro alternativo sin estados invisibles.
- [ ] Contraste por composición real; no solo cálculo de tokens aislados.
- [ ] Navegación por teclado, etiqueta, foco, diálogo, validación y mensajes correctos.
- [ ] Controles táctiles de 44 px cuando corresponda; zoom al 200 % y lector de pantalla en R2.
- [ ] `prefers-reduced-motion`, modo sin `backdrop-filter`, carga con imágenes fallidas.
- [ ] No introducir cambios funcionales, entitlements, datos, permisos, rutas ni CRM en una migración visual.
- [ ] Validación fechada y aprobaciones explícitas antes de cualquier despliegue.

**Pendiente de aprobación:** visual final de R1 y certificación R2 con capturas/comprobaciones reales. Documentar hallazgos contra el commit exacto, no arrastrar el PASS de v0.7 a esta revisión.

## Objetivo

Diseñar escenas digitales con identidad Vecidya, profundidad ambiental y materiales cristalinos coherentes. La biblioteca debe mostrar componentes reales y utilizables, no una pila indiferenciada de tarjetas ni un laboratorio de controles como producto principal.

## Principios de diseño

1. **Materia antes que color:** conservar bisel, espesor, reflejo, refracción perceptual, transparencia, sombra de contacto y elevación al variar azul, blanco, naranja, amarillo, verde o rojo.
2. **Jerarquía por planos:** fondo ambiental → ilustración de contexto → estructuras de apoyo → superficies translúcidas → contenidos y controles → elementos protagonistas.
3. **Una escena por sección:** cada fondo aporta contexto, dirección de lectura, iluminación y continuidad.
4. **Legibilidad:** en formularios y tablas, limitar destellos, controlar contraste y priorizar lectura sobre espectacularidad.
5. **Identidad:** utilizar exclusivamente Vico y activos oficiales verificados; no sustituir por robot u otra mascota.
6. **Escalabilidad:** preparar composición responsive, movimiento reducido y alternativas cuando no haya blur.
7. **MiniWeb2:** los materiales futuros deben poder personalizarse por cliente sin imponer la identidad gráfica de Vecidya.
8. **Referencia de acabado:** las imágenes de escritorio proporcionadas por el usuario fijan la guía de luz azul, acentos cian/naranja, reflejos y vidrio dimensional. El fondo ambiental generado y elegido por el usuario complementa el sitio; Vico, tarjetas, paneles y controles siguen siendo elementos independientes y reales.

## Sistema de capas

- **L0 Ambiente:** fondo cromático, profundidad atmosférica, viñeta suave y luz global.
- **L1 Contexto:** escenarios urbanos, negocios, mapas o ilustraciones temáticas.
- **L2 Estructura:** paneles de soporte, plataformas, anillos, marcos y conexiones.
- **L3 Materia:** vidrio con volumen, biseles, reflejos y translucidez.
- **L4 Contenido:** textos, iconos, métricas y controles de interacción.
- **L5 Foco:** elementos protagonistas, Vico o ilustraciones narrativas, con oclusión correcta.

## Familias de materiales por uso

| Material | Uso preferente | Riesgo a controlar |
|---|---|---|
| Azul cristal | navegación, paneles, información | saturación excesiva |
| Blanco hielo | lectura, formularios, superficies claras | contraste insuficiente |
| Naranja | CTA y acentos de marca | exceso de atención |
| Amarillo | avisos y acentos puntuales | confusión con advertencias |
| Verde | confirmación y éxito | depender solo del color |
| Rojo | error y peligro | ruido visual y accesibilidad |

## Composición de páginas

- **Inicio público:** escena de negocios locales, profundidad de entorno y CTA legible.
- **Vecindario:** mapa/territorio y perfiles conectados, tarjetas integradas en escena.
- **MiniWeb2:** editor sobrio y funcional, vista previa rica y materiales configurables.
- **Panel interno:** jerarquía de datos, sombras discretas y estados inequívocos.
- **Diagnóstico:** no alterar preguntas ni flujos; priorizar claridad de formularios.

## Criterios de aprobación visual

- Reconocimiento inmediato de marca y mascota correcta.
- Espesor, reflejos, bisel y elevación creíbles en los seis tonos.
- Continuidad de iluminación entre fondo, tarjetas e ilustraciones.
- Contraste suficiente en texto y controles, en escritorio y móvil.
- Consistencia de iconografía y escala de profundidad.
- Componentes funcionales independientes de sus fondos.
- Diseño visual evaluado antes de producir componentes definitivos.

## Observaciones críticas sobre el primer concepto

La lámina visual inicial es exploratoria: incluye un robot que NO corresponde a Vico. También exagera el resplandor en controles densos. No debe usarse como referencia de marca aprobada ni copiarse literalmente a producción. En esta iteración se reemplazó la tienda dibujada en CSS y el pin emoji por Vico y los activos oficiales.

## Resultado de las seis revisiones críticas

La biblioteca se revisó después de implementar. En esta iteración se repitieron las seis pasadas en navegador y se corrigieron los defectos detectados:

1. **Identidad:** se retiraron la tienda dibujada en CSS, el pin emoji y el muestrario de glifos genéricos. La escena principal usa Vico y el símbolo Vecidya oficiales; la galería ofrece once variantes PNG Crystal para iconos de diagnóstico/servicio/estado y conserva sus originales en el repositorio. WhatsApp se rasteriza desde su SVG oficial.
2. **Composición:** el fondo ambiental aprobado se mantiene como una capa independiente. Vico, las 140 muestras de asset, tarjetas flotantes, controles y escenas se renderizan como elementos HTML/CSS que conservan escala propia y reflujo responsive. Las ilustraciones completas se presentan dentro de placas de catálogo y no sustituyen controles.
3. **Materia:** las seis variantes comparten biseles, cantos, reflejos, transparencia y sombras de elevación. Se eliminó la excepción de fondo y sombra del tono hielo, incluido el fallback sin `backdrop-filter`; el tono solo cambia la luz y el color. Hielo usa texto oscuro y los demás tonos mantienen texto claro.
4. **Iluminación:** se adoptó azul eléctrico con líneas cian y naranja, horizonte reflectante y sombras por plano. Se redujo la intensidad en formularios, tablas y mensajes para proteger lectura.
5. **Accesibilidad y responsive (Chromium local):** salto al contenido, foco visible, nombres y etiquetas, pestañas con flechas/Home/End, diálogo nativo/Escape, validación local, estados textuales, navegación y búsqueda por teclado comprobados. Viewports 320/360/390/768/1024/1366/1920 px; la tabla mantiene lectura dentro de un scroller horizontal propio. Movimiento reducido y contraste aumentado están definidos en CSS; no sustituyen lector de pantalla, zoom 200 % ni auditoría WCAG.
6. **Viabilidad técnica (Chromium y estática):** HTML, CSS y JavaScript nativos; fondos WebP, 128 miniaturas WebP optimizadas, doce PNG locales (once propuestas y el PNG de WhatsApp) e índice para 140 activos. Tema, búsqueda, categorías, orden, vacío, formulario, diálogo, pestañas y anclas funcionaron localmente; favicon oficial y consola limpia en la carga final. Sin cambios de plataforma/MiniWeb2 ni dependencias nuevas. `node --check assets/library-catalog.js` y `git diff --check` pasan.

La aprobación final del usuario sigue pendiente para la fuerza del vidrio en ambos temas, el encuadre de Vico en pantallas estrechas, la escena clara, la familia de iconos PNG y la presentación de los 140 activos. La inspección de código y navegador no acredita aprobación estética. Esta revisión no autoriza integración.

## Changelog

- v0.6: seis revisiones técnicas e interactivas repetidas en navegador; tono hielo unificado y responsive comprobado localmente.
- v0.5: catálogo completo con filtros y metadatos, once iconos Crystal propuestos y nuevas muestras de acordeón; pendiente verificación visual en navegador.
- v0.4: tema claro/oscuro y variantes de fondo; seis revisiones estáticas documentadas.
- v0.3: biblioteca visual premium, fondo ambiental aprobado y activos oficiales.
- v0.2: dirección artística, capas, materiales, revisión crítica y criterios de aprobación.

- R1.0 (2026-11-19): decisiones aprobadas, gramática de materiales, tokens, escena, contraste, reglas de licencias y gates de aceptación para agentes. Biblioteca aún no integrada.


### Regla de autonomía de recursos — 2026-11-23

Los recursos visuales que formen parte de Crystal Depth deben existir dentro de `vecidya-crystal-depth/assets/library-assets/` antes de ser referenciados por la biblioteca. La plataforma puede conservar el original canónico, pero la biblioteca no debe depender de su ruta para renderizar, revisar o publicar.
