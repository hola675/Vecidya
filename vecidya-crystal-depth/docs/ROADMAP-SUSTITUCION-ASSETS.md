# Roadmap de sustitución de assets — Vecidya Crystal World

**Versión:** 1.0.0 · **Última actualización:** 2026-11-23  
**Estado:** Dirección artística aprobada por el responsable; producción de nuevos assets pendiente.  
**Proyecto:** `vecidya-crystal-depth/` — laboratorio y biblioteca independiente.

## 1. Decisión y secuencia obligatoria

**PRIMERO sustituir y mejorar los recursos existentes; DESPUÉS producir assets adicionales.** El objetivo no es sumar 24 imágenes mientras las 140 actuales sigan desalineadas. Se sustituirán los recursos que no cumplan la nueva dirección Crystal World sin alterar identidades oficiales, evidencias reales o datos de interfaz.

Aprobación del 2026-11-23: usar las **seis imágenes de referencia aportadas en la conversación** como familia artística aprobada: identidad vertical, iconos de servicios flotantes, vecindario vertical, fondo panorámico oscuro, Vico en ecosistema horizontal y fondo panorámico claro. Las imágenes de referencia deben custodiarse como fuentes de comparación; esta aprobación **no equivale** a autorización para reemplazar el logotipo oficial por una reinterpretación automática, ni certifica exportaciones o producción.

**Regla antialucinación:** ningún recurso se marca sustituido, publicado, eliminado u optimizado sin archivo real, comparación y evidencia. Estado actual del roadmap: planificado, sin generaciones ni purgas.

## 2. Lenguaje visual aprobado — Vecidya Crystal World

- **Narrativa:** vecindario digital local, caminos luminosos que conectan comercios y servicios, espacios panorámicos con horizonte, paneles de cristal; Vico únicamente en comunicación institucional Vecidya.
- **Paleta base contractual:** `#06172F` azul noche, `#0D2E54` superficie oscura, `#F1F7FE` claro, `#F3F8FF` texto, `#123766` texto claro, `#FF9B27` naranja marca, `#51E3FF` cian.
- **Tokens candidatos para iluminación**, pendientes de contraste y validación: `#09275C` azul profundo, `#0754C9` azul eléctrico, `#00A8FF` azul brillante, `#FFBD35` dorado de luz. No sustituir tokens semánticos de error/advertencia por el naranja corporativo.
- **Materiales:** Crystal Focal para héroes/escenas; Crystal Quiet para tarjetas/paneles livianos; Solid Readable para lectura, inputs, tablas y datos. Los tres son componentes del mismo sistema, no estilos incompatibles.
- **Formas:** volúmenes 3D ilustrados y amables, bordes redondeados y biselados, vidrio azul translúcido, iluminación físicamente consistente, reflejos contenidos, sombras suaves. Nada de iconos planos mezclados arbitrariamente con objetos 3D.
- **Geometría:** arcos perimetrales, horizontes abiertos, rutas orbitales cian/naranja, punto focal independiente del área de texto, profundidad L0–L5. Nunca incrustar CTA o contenido web editable en el raster.
- **Composición:** fondos panorámicos 16:9 con zona libre para HTML; variantes móviles 3:4/4:5 reencuadradas, no simple estiramiento. Escenas y personajes preferentemente separados del ambiente.
- **Movimiento:** ambiente opcional y reducido; nunca parallax imprescindible, ni movimiento durante lectura/formularios.

## 3. Plan de sustitución: 140 recursos inventariados

Los números describen **registros existentes que deben revisarse**, no número final de imágenes nuevas ni promesa de que todas se regenerarán. La tipología final por recurso será `sustituir`, `optimizar`, `mantener` o `retirar-tras-aprobacion`.

| Ola | Prioridad | Familia y cantidad actual | Intervención |
|---|---|---|---|
| S0 | Bloqueante | Baseline de 140 | Mapa exacto de rutas/usos y checklist visual, inventario SHA, pesos y relaciones; congelar referencias |
| S1 | P0 | **Fondos y decoración (5)** | Rehacer 4 fondos/ambientes prioritarios con variantes oscuro/claro y revisar 1 decoración; composiciones reutilizables y texto legible |
| S2 | P0 | **Escenas narrativas (10)** | Rehacer escenas de las secciones; aumentar resolución útil, aislar protagonista y espacio negativo |
| S3 | P1 | **Iconografía (12)** | Separar 9 SVG operativos de 3 ilustraciones grandes; uniformar familia tridimensional solo donde corresponde, sin reemplazar controles SVG por imágenes pesadas |
| S4 | P1 | **Funciones y planes (17)** | 11 ilustraciones de funciones y 6 variantes de planes; consolidar versión optimizada cuando la equivalencia esté verificada |
| S5 | P1 | **Diagnóstico y estados (14)** | 3 resultados, 3 estados y 8 dimensiones: imágenes coherentes, legibles y sin inventar métricas ni evaluaciones |
| S6 | P2 | **Ilustraciones de producto (14)** | Rehacer solo las incoherentes: onboarding, dashboards, móvil, relaciones, estados; separar capturas ficticias de datos reales |
| S7 | P2 | **Vico (10)** | Prioridad editorial alta para máscaras defectuosas, pero generación artística condicionada a fidelidad exacta del personaje. Crear derivados aprobados, no sustituir anatomía/vestuario sin revisión humana |
| S8 | P2 | **Aprende (48)** | Unificar estilo editorial, jerarquía y recortes; lotes temáticos, empezando por portadas de mayor tráfico o peor resultado visual demostrado |
| S9 | P3 protegido | **Identidad y equipo (9)** | 5 assets de marca: preservar geometría/logo canónico, crear derivados para tamaños/usos; 4 fotos de equipo: mantener originales, optimizar según permisos; NO regenerar fotografías de personas con IA como si fueran reales |
| S10 | P3 | **Redes (1)** | Rehacer vista previa OG solo cuando estén cerradas las reglas del logotipo y la composición aprobada |
| — | — | **140 recursos** | Aceptación por lote y sustitución incremental |

**Orden operativo:** S0 → S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8 → S9 → S10. Las alertas de Vico Inicio/Diagnóstico pueden tratarse en paralelo antes de publicar escenas que lo utilicen; no se mezclan cambios sin aprobación.

## 4. Desglose de las primeras tres olas

### S0 — Auditoría y mapeo (140/140)
- Para cada asset: fuente local, SHA-256 o blob Git, dimensiones, alfa, bytes, referencias en HTML/CSS/JS/JSON, entorno de uso, ficha de diseño, estado de aprobación.
- Identificar duplicados **binarios** y **visuales** por separado; imágenes con nombres similares no son automáticamente duplicados.
- Registro de migración: `original → candidato → aprobado → activo → retirado`; mantener historial independiente del archivo visual.
- Seleccionar 1 pieza piloto para validar iluminación, tratamiento de vidrio, integración con texto y fallback antes de generar masivamente.

### S1 — Fondos y decoración (5)
- Candidatos explícitos: `bg-hero-soft-map-wave.webp`, `bg-network-route-pins.webp`, `bg-section-map-wave-dark.webp`, `bg-soft-map-orange-blue.webp` y `decor-reviews-location-card.png`.
- Rediseñar primero una **pareja maestra** de ambiente nocturno y diurno basada en las referencias 4 y 6; después variaciones por contexto. Evitar reemplazar los cuatro fondos por un mismo archivo con nombres diferentes.
- Exportaciones objetivo: escritorio 1920×1080 o superior cuando la composición lo permita; móvil 960×1280 de composición propia. Export WebP sRGB optimizado y fallback CSS. Tamaños finales determinados por prueba real, sin umbral ficticio universal.

### S2 — Escenas narrativas (10)
- Nombres base: `home-scene`, `about-scene`, `services-scene`, `diagnostic-scene`, `neighborhood-scene`, `learn-journey-scene`, `licenses-scene`, `contact-scene`, `join-scene`, `addons-scene`.
- Priorizar `home`, `neighborhood`, `services`, `learn` y `diagnostic`; después restantes cinco.
- Los originales actuales de aprox. 318–437 px de ancho **no** se deben ampliar sin nuevo arte o tratamiento adecuado.
- Protagonista/escena y fondo deben ser separables; aplicar `object-fit:contain` cuando corresponda; alt contextual.

### S3 — Iconos (12)
- Separar iconos vectoriales de interfaz de objetos 3D ilustrativos. Una imagen de 1254×1254 no se convierte automáticamente en un icono de 20 px.
- Escalar el nuevo vocabulario cristalino a: negocio, mapa/ubicación, calendario, conversación, medición, integraciones; reutilización semántica, sin representar funciones no existentes.
- Mantener SVG donde prima nitidez y accesibilidad; WebP para ilustración 3D y PNG solo por transparencia/compatibilidad justificada.

## 5. Política de preservación, optimización y purga

1. **Jamás sobrescribir el original** durante elaboración. Guardar candidato con ID/versionado separado.
2. WebP para escenas, fondos, ilustraciones y vistas previas aprobadas; SVG para pictogramas vectoriales. Mantener originales no WebP como fuente o cuando el formato sea técnicamente mejor.
3. Validar parecido, función, dimensión, peso, transparencia, contraste, mobile, `prefers-reduced-motion`, licencia/origen y coherencia con la marca. No certificar calidad artística solo por convertir a WebP.
4. Reemplazar referencias en biblioteca con cambios focalizados y pruebas; si se utiliza en la plataforma, **esa migración es otro checkpoint** y requiere autorización y QA propios.
5. Conservar el original en carpeta de legado/archivo trazable con manifiesto y fecha hasta aprobación, despliegue controlado, evaluación y capacidad de reversión.
6. **Purgar únicamente** duplicados y versiones obsoletas verificadas sin consumidores; primero comprobar referencias por búsqueda global y manifest, luego borrar en commit separado. No purgar fotos reales, marca oficial ni archivos usados por otras aplicaciones.
7. No introducir vínculos a `vecidya-platform/public/assets`; todo lo usado en la biblioteca debe residir en `vecidya-crystal-depth/assets/`.

## 6. Criterios de salida y métricas

Por lote: (a) inventario y diseño validados; (b) arte aprobado; (c) export correcto; (d) ruta local/manifest actualizado; (e) capturas 320/390/768/1366/1920 y 200 % zoom cuando aplique; (f) fallbacks y accesibilidad; (g) sin regresión de build ni enlaces rotos; (h) trazabilidad, rollback y aprobación explícita.

Registrar por recurso estados separados:
- `inventariado`
- `brief-aprobado`
- `generado-candidato`
- `qa-tecnico-aprobado`
- `qa-visual-aprobado`
- `referencia-sustituida`
- `publicado-verificado`
- `original-archivado`
- `original-purgado`

Los contadores del roadmap deben derivar del manifiesto real, nunca de estimaciones.

## 7. Solo DESPUÉS: ampliación de la biblioteca

**Nuevo pack inicial previsto: 24 recursos** — 6 fondos/variantes adicionales, 4 escenarios de vecindario, 6 objetos 3D aislados, 4 capas ambientales y 4 composiciones de marketing. No iniciar esta fase hasta tener las familias S1–S8 revisadas y las sustituciones prioritarias aprobadas. Evitar duplicar material generado durante la sustitución: si un objeto ya existe con calidad suficiente, se reutiliza y se descuenta del pack nuevo.

## 8. Alcance de la aprobación del usuario

Aprobado: identidad visual Crystal World y **prioridad de reemplazar lo existente antes de ampliar el catálogo**, con enfoque de escenas independientes, WebP optimizado cuando sea adecuado, QA visual y purga de copias innecesarias después de validar.

No aprobado automáticamente: despliegue, integración productiva, reinterpretación del logotipo/personaje o sustitución de fotografías reales, borrado inmediato de originales, cambio comercial o funcional de Vecidya.

## Historial de cambios

- **1.0.0 — 2026-11-23:** aprobación artística registrada; roadmap por olas, 140 activos con preservación y 24 nuevas piezas subordinadas a sustitución.
