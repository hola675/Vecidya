# Clasificación de assets · Vecidya Crystal Depth

**Versión:** 1.0.0 · **Última modificación:** 2026-11-23  
**Origen:** `assets/library-catalog.js` · 140 recursos locales.  
**Contrato estructurado:** `assets/asset-classification.json`.

## Alcance y nivel de evidencia

Esta clasificación examina las **140 fichas del catálogo**, nombres, formatos, dimensiones, proporciones y rutas. **No** acredita una revisión visual detallada de píxeles, transparencia, legibilidad interna, colorimetría, licencias ni composición exacta de cada imagen. Cada recurso se etiqueta `pendiente-inspeccion-visual-individual` hasta completar esa comprobación. No se modifican los originales.

## Familias funcionales

| Familia | Total | Función |
|---|---:|---|
| Identidad y equipo | 9 | Marca, firmas y fotografía institucional |
| Vico | 10 | Personaje oficial en contextos propios |
| Fondos y decoración | 5 | Ambiente estacionario y adorno contextual |
| Escenas narrativas | 10 | Ilustración focal de sección |
| Ilustraciones de producto | 14 | Contexto, onboarding y estados de interfaz |
| Iconografía | 12 | Significado de función, servicio o acción |
| Diagnóstico y estados | 14 | Resultado, dimensiones, clasificación visual |
| Funciones y planes | 17 | Comunicación comercial y comparativa |
| Contenido educativo | 48 | Portadas vinculadas a artículos de Aprende |
| Redes sociales | 1 | Metadatos OG y vista previa de enlaces |
| **Total** | **140** | |

## Directrices de diseño y funcionalidad

1. **Identidad:** distinguir marca institucional de fotografía de personas. Mantener originales aprobados, sin convertir Vico en marca de clientes MiniWeb.
2. **Vico:** diez variantes de contexto. Auditar contorno, alfa y encuadre sin redibujar automáticamente ni crear personajes alternativos.
3. **Fondos:** cuatro fondos 1672×941 y una decoración 1672×941; adecuados como capas estacionarias. Evitar situar texto sobre áreas de alto detalle y ofrecer fallback CSS.
4. **Escenas:** diez imágenes entre 318 y 437 píxeles de anchura; usarlas como ilustración contenida. No estirarlas al ancho completo de una portada de escritorio.
5. **Ilustraciones de producto:** no sustituir estados reales por ilustraciones; las escenas de dashboard son narrativas, no datos verificados.
6. **Iconos:** separar nueve SVG operativos (ocho 48×48 y uno 24×24) de tres imágenes de 1254×1254 para representación ilustrativa. No colocar los últimos como controles de 16–24 px sin evaluar su legibilidad.
7. **Diagnóstico:** tres PNG de resultados, tres iconos de estados, ocho dimensiones. La representación visual no determina ni inventa la evaluación.
8. **Funciones y planes:** comparar las parejas PNG/WebP de Cuadra/Barrio/Ciudad; seleccionar entrega web tras validar equivalencia visual y peso, sin eliminar la variante fuente prematuramente.
9. **Aprende:** 48 portadas con relaciones de aspecto distintas; preservar el motivo principal en recortes móviles y usar texto HTML aparte, no depender de letras dentro del archivo.
10. **Redes:** SVG OG 1200×630 destinado a previsualización; comprobar compatibilidad y alternativa rasterizada cuando haga falta.

## Alertas de QA por prioridad

**Alta:** visualización móvil de portadas editoriales especialmente panorámicas; ampliación de escenas de baja resolución; confusión entre icono decorativo y control operativo; fidelidad visual de Vico.

**Media:** paridad PNG/WebP de planes, consistencia entre estados de diagnóstico, contraste sobre fondos, alfa y bordes de objetos, posible peso excesivo de imágenes 1254×1254 usadas a tamaño pequeño.

**Proceso de aceptación:** inspección visual por recurso → contraste con propósito y página destino → responsive y recorte → accesibilidad/alt → peso/performance → origen/licencia → aprobación o corrección no destructiva.

## Integración futura

La clasificación es ortogonal a las 17 categorías editoriales: **categoría** describe el tema, **familia** el rol de diseño, **contexto** dónde se puede usar y **propósito** la función. Mantener los 140 archivos originales en `assets/library-assets/` y evitar rutas runtime hacia la plataforma.

### Historial de cambios

- **1.0.0 (2026-11-23):** inventario completo de 140 fichas, diez familias, taxonomía doble y alertas deterministas iniciales.
