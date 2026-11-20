# Dirección artística — Crystal Depth

Versión R1.0 (candidata) · 2026-11-19 · Decisiones rectoras aprobadas; integración y certificación visual final pendientes. No apta para producción.


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

### 5. Tipografía, espacio y forma

Usar la familia existente (Inter → Segoe UI → system-ui) sin introducir una nueva dependencia. Jerarquía: titular corto y reconocible, subtítulo útil, párrafos legibles (línea ideal ~55–75 caracteres), microcopy contextual. No usar mayúsculas espaciadas para bloques de lectura. Mantener retícula y ritmo coherentes por secciones, evitando tarjetas anidadas sin función; usar grupos visuales con un propósito por bloque. Estado `disabled`, validación, tooltip y aviso han de expresarse con texto y foco accesibles.

### 6. Assets y Vico

Solo fuentes oficiales de `vecidya-platform/public/assets/` y sus derivados controlados: no generar un Vico alternativo, no inventar fotografías de clientes, no descargar iconos de terceros sin derechos. Las 11 vistas Crystal de iconos son *propuestas*, no sustituciones oficiales. Las 140 entradas de catálogo son inventario de consulta, no autorización para usarlas todas en producción. Preservar originales, verificar resolución, formato, texto alternativo, licencia y peso de los derivados.

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
