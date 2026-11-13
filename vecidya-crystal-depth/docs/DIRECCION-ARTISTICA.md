# Dirección artística — Crystal Depth

Versión 0.5 · 2026-11-12 · Estado: biblioteca local ampliada; falta confirmación interactiva y aprobación visual integral, no apta para producción.

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

La biblioteca se revisó después de implementar, y se corrigieron los defectos encontrados en cada pasada:

1. **Identidad:** se retiraron la tienda dibujada en CSS, el pin emoji y el muestrario de glifos genéricos. La escena principal usa Vico y el símbolo Vecidya oficiales; la galería ofrece once variantes PNG Crystal para iconos de diagnóstico/servicio/estado y conserva sus originales en el repositorio. WhatsApp se rasteriza desde su SVG oficial.
2. **Composición:** el fondo ambiental aprobado se mantiene como una capa independiente. Vico, las 140 muestras de asset, tarjetas flotantes, controles y escenas se renderizan como elementos HTML/CSS que conservan escala propia y reflujo responsive. Las ilustraciones completas se presentan dentro de placas de catálogo y no sustituyen controles.
3. **Materia:** las seis variantes comparten bisel, canto inferior, reflejo, transparencia y elevación. El hielo usa texto oscuro; los demás tonos mantienen texto claro.
4. **Iluminación:** se adoptó azul eléctrico con líneas cian y naranja, horizonte reflectante y sombras por plano. Se redujo la intensidad en formularios, tablas y mensajes para proteger lectura.
5. **Accesibilidad (revisión de código):** se añadieron salto al contenido, foco visible, etiquetas y nombres accesibles, pestañas con flechas/Home/End, diálogo nativo, validación local, estados con texto, navegación por sección, búsqueda con Escape, reglas responsive, movimiento reducido y alternativa sin blur. La comprobación visual interactiva está pendiente por bloqueo del navegador a localhost en esta sesión.
6. **Viabilidad técnica (revisión estática):** HTML, CSS y JavaScript nativos; fondos WebP, 128 miniaturas WebP optimizadas, doce PNG locales (once propuestas y el PNG de WhatsApp) e índice con dimensiones de origen y vista para los 140 assets de `public/assets/`. La tarjeta abre el original separado. Búsqueda, categorías, orden y acordeón son funcionales por código. No hay cambios de plataforma, MiniWeb2 ni dependencias nuevas. La sintaxis, rutas y diff se comprobaron localmente; interacción visual y breakpoints aún necesitan verificación en navegador.

La aprobación final del usuario sigue pendiente para la fuerza del vidrio, el encuadre de Vico en pantallas estrechas, la nueva escena clara, la familia de iconos PNG y el tratamiento general del inventario de assets. Esta revisión no autoriza integración.

## Changelog

- v0.5: catálogo completo con filtros y metadatos, once iconos Crystal propuestos y nuevas muestras de acordeón; pendiente verificación visual en navegador.
- v0.4: tema claro/oscuro y variantes de fondo; seis revisiones estáticas documentadas.
- v0.3: biblioteca visual premium, fondo ambiental aprobado y activos oficiales.
- v0.2: dirección artística, capas, materiales, revisión crítica y criterios de aprobación.
