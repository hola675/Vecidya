# Roadmap de sustitución de assets — Vecidya Crystal World

**Versión:** 1.4.0 · **Última actualización:** 2026-11-23  
**Estado:** S1 (5/5) y S2 (10/10) integradas en GitHub y visibles en la biblioteca Cloudflare Pages; S3 bloqueada tras rechazo artístico (0/12). CI y conformidad WCAG no certificados.  
**Proyecto:** `vecidya-crystal-depth/` — laboratorio y biblioteca independiente.

## 1. Decisión y secuencia obligatoria

**PRIMERO sustituir y mejorar los recursos existentes; DESPUÉS producir assets adicionales.** El objetivo no es sumar 24 imágenes mientras las 140 actuales sigan desalineadas. Se sustituirán los recursos que no cumplan la nueva dirección Crystal World sin alterar identidades oficiales, evidencias reales o datos de interfaz.

Aprobación del 2026-11-23: usar las **seis imágenes de referencia aportadas en la conversación** como familia artística aprobada: identidad vertical, iconos de servicios flotantes, vecindario vertical, fondo panorámico oscuro, Vico en ecosistema horizontal y fondo panorámico claro. Las imágenes de referencia deben custodiarse como fuentes de comparación; esta aprobación **no equivale** a autorización para reemplazar el logotipo oficial por una reinterpretación automática, ni certifica exportaciones o producción.

**Regla antialucinación:** ningún recurso se marca sustituido, publicado, eliminado u optimizado sin archivo real, comparación y evidencia. Estado actual verificado: 5 referencias S1 sustituidas en main; 10 escenas S2 inventariadas; no se ha purgado ningún original.

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

## Checkpoint S1 — 2026-11-23 (producción local)

- **S0:** inventario focalizado de cinco recursos y correspondencia de sustitución completados.
- **S1 / archivos:** cinco candidatos panorámicos WebP (1672×941), dos variantes móviles (960×1280) y cinco miniaturas de catálogo preparados en un paquete de conversación.
- **QA técnico local:** comprobación de decodificación y dimensiones + hashes SHA-256 de los cinco principales: PASS; prueba sintáctica del activador Node: PASS; check y sustitución del catálogo probados en repositorio *simulado*: PASS.
- **Pendiente:** instalar binarios en el repositorio real, inspección artística de todas las piezas, pruebas del frontend/build y despliegue. No declarar S1 integrada ni publicada; 0 referencias sustituidas y 0 originales purgados en GitHub.
- **Paquete local:** `Vecidya-CrystalWorld-S1-Candidatos.zip` (5 originales candidatos, 2 móviles, 5 miniaturas, manifiesto y scripts `instalar_s1.py`/`activar_s1.mjs`). Los binarios de este archivo aún no están en el repositorio.
- **Flujo de integración:** extraer paquete → ejecutar `verify_s1.py` → `instalar_s1.py <ruta-del-repo>` → `node scripts/activar_s1.mjs` (verifica) → `node scripts/activar_s1.mjs --apply` (activa local) → tests/build/capturas → commit/PR → desplegar con aprobación.

**Esta evidencia se aplica a la producción y empaquetado local, no a un despliegue de producción ni al estado del repositorio principal.**

## Incidencia QA S1 — 2026-11-23 · RECHAZO ARTÍSTICO

El usuario detectó que `decor-crystal-world-reviews-v1.webp` no se parece a las referencias Crystal World. Inspección posterior de las **7 imágenes reales** del paquete S1:

| Recurso | Decisión artística | Justificación |
|---|---|---|
| S1-01 maestro oscuro | Candidato condicionado | 3D, brillo, vecindario y profundidad coherentes; falta visual responsive y contraste |
| S1-02 maestro claro | Candidato condicionado | Coherente; falta contraste con UI |
| S1-03 portada | Revisar | Poco diferenciado respecto al maestro claro |
| S1-04 conexiones | Candidato condicionado | Mundo 3D correcto; verificar iconografía y recorte |
| S1-05 reseñas | **RECHAZADO** | Gráfico plano sin materiales, volumen ni riqueza Crystal World |
| S1-01 mobile | Corregir | Zona superior artificialmente difuminada |
| S1-02 mobile | Corregir | Zona superior artificialmente difuminada |

**Estado:** S1 **NO** está certificada visualmente, aunque el script local informara `S1 CHECK PASS` y `build OK`. El usuario activó localmente cinco referencias; eso no constituye aprobación ni publicación. No autorizar commit/push/deploy de esas sustituciones sin corregir lo rechazado y finalizar revisiones.

**Rollback de la activación local (si las únicas modificaciones de estos archivos son de `activar_s1.mjs --apply`):**
```powershell
cd D:\Proyectos\Vecidya
git diff -- vecidya-crystal-depth/assets/library-catalog.js vecidya-crystal-depth/assets/asset-classification.json
git restore -- vecidya-crystal-depth/assets/library-catalog.js vecidya-crystal-depth/assets/asset-classification.json
```
Este rollback no borra los candidatos sin seguimiento, ni los originales y no afecta el resto del repositorio. Si esos dos archivos contienen otros cambios deseados, guardarlos y revertir solo la sustitución S1.

**Nueva puerta QA obligatoria por cada asset:** 1) abrir WebP original y candidato; 2) contraste lado a lado contra las seis referencias; 3) evaluar volumen 3D, iluminación, bisel cristal, perspectiva, composición y función; 4) reportar `ACEPTADO`/`REVISAR`/`RECHAZADO` individualmente; 5) solo `ACEPTADO` permite modificar catálogo, sin implicar deploy. Los tests automáticos validan bytes/rutas, no calidad artística.

**Prioridad correctiva:** regenerar S1-05 como escena 3D integrada con negocio local y tarjetas de opiniones de cristal (sin reseñas ficticias presentadas como reales); rehacer encuadres móviles en vez de blur; diferenciar S1-03; volver a validar los siete recursos.


## Puerta obligatoria S1: transparencia + semántica de L0–L5

Decisión aprobada el 2026-11-23: **no-fondos = WebP RGBA/PNG alfa genuino**, fondos opacos permitidos. Para S1-05 (decoración reseñas/ubicación), producir protagonista aislado transparente con tienda, pin y paneles decorativos 3D: corresponde a L5 junto a elementos L1/L2 reutilizables. Las tarjetas de estrellas nunca sustituyen reseñas reales ni la capa funcional L4.

S1-01/02 y fondos S1-03/04 pueden ser opacos L0/L1. Las variantes móviles deben ser composiciones/reencuadres funcionales sin desenfoque artificial. Exigir inspección visual individual, incluso si las pruebas de presencia, integridad y build pasan. S1 queda sin certificación de producción hasta integración y QA verificables.

**Versionado:** política de calidad v1.1.0 — 2026-11-23; revisar manifest por ruta real antes de afirmar assets sustituidos.


## S1 v3: galería QA aislada (2026-11-23)

Se añadió `scripts/revisar_s1_v3.mjs` para inspección **sin activar** ni modificar el catálogo:

```powershell
cd D:\Proyectos\Vecidya
git pull --ff-only origin main
cd vecidya-crystal-depth
node scripts/revisar_s1_v3.mjs
node scripts/revisar_s1_v3.mjs --stage
Start-Process ".\qa\s1-v3\index.html"
```

El modo por defecto verifica 7 candidatos v3, cabecera RIFF/WEBP, dimensiones cuando el formato VP8X las declara, indicador alfa VP8X para S1-05 y presencia de las cinco miniaturas y rutas originales en catálogo. `--stage` crea una galería de QA independiente con comprobaciones visuales de contraste sobre claro/oscuro y texto HTML, sin activar nada. El argumento `--apply` está expresamente bloqueado; el script viejo `activar_s1.mjs` permanece bloqueado hasta aceptación artística. La galería es inspección manual, no certificación automática de accesibilidad ni de contenido real.

**Estado**: cinco sustituciones finales **pendientes** de montaje visual aprobado y registro de conformidad, aunque el usuario haya confirmado `verify_s1.py PASS 7/7`. Mantener intactas las referencias anteriores en `main`; conservar candidatos v1 como material de rollback/historia hasta completar migración y limpieza coordinada.

## S1 v3 — aprobación visual e integración segura (2026-11-23)

**Aprobación visual:** el usuario compartió captura de la galería de siete recursos y respondió «aprobado». Se registra aprobación artística de los siete candidatos v3, pero NO publicación ni certificado E2E. Los siete hashes del paquete ZIP fueron verificados, igual que la verificación técnica 7/7 comunicada por el usuario.

**Estado remoto:** en la última comprobación, main conservaba los binarios v1 y carecía de los nuevos v2/v3. No activar referencias a rutas faltantes.

### Activación local, tras sincronizar main

```powershell
cd D:\Proyectos\Vecidya
git pull --ff-only origin main
cd .\vecidya-crystal-depth
node scripts/activar_s1_v3.mjs
node scripts/activar_s1_v3.mjs --apply
node scripts/build-cloudflare.mjs
git status --short
git diff --check
```

El nuevo script comprueba la aprobación del manifiesto, 7 SHA-256, formatos y miniaturas; conserva los originales, copia una salvaguarda del catálogo y clasificación en `qa/s1-v3/backup-before-activation`, instala los siete activos de biblioteca y actualiza cinco referencias. **No hace commit, push ni deploy**. La revisión real en navegador y el test final de producción quedan pendientes.

No usar `scripts/activar_s1.mjs` de v1. S1 solo se marca como integrada cuando los binarios y el catálogo actualizado existan realmente en main y las comprobaciones posteriores estén documentadas.


## S2 — Inicio real de producción (2026-11-23)

- **Inventario S2:** diez escenas confirmadas por `assets/asset-classification.json`, originales entre 318 y 437 píxeles de ancho.
- **Nuevo manifiesto:** `assets/s2-replacement-manifest.json`, con las diez rutas, orden por lotes y QA por recurso.
- **Piloto S2-01 Inicio:** creado localmente en formato WebP RGBA 1536×1024; su hash y tamaño están registrados en el manifiesto. **No integrado ni aprobado**, y por ello no modifica catálogo ni despliegue.
- **Secuencia operativa:** validar piloto con las seis referencias; componer con fondos S1 y HTML L4; corregir alfa/encuadre si procede; producir los otros cuatro del lote prioritario; aprobar uno por uno; continuar con los cinco restantes; integrar con pruebas de build y Cloudflare.
- **Política invariable:** ilustraciones L1/L2/L5 transparentes; L0 usa fondos S1; L4 permanece HTML/CSS accesible; no generar Vico alternativo.
- **S1:** cinco recursos activos en main y siete binarios v3 presentes; pendiente la verificación del despliegue público en Cloudflare.

## S2 — producción por lotes 10/10 (2026-11-23)

- **Generación/optimización local:** diez escenas WebP **RGBA 1536×1024** creadas y verificadas tras la conversión, 10 miniaturas, manifiesto con SHA-256, galería HTML sobre damero/claro/oscuro e instalador PowerShell sin activación de catálogo.
- **Lote A (5/5):** Inicio, Vecindario, Servicios, Aprende y Diagnóstico — **aprobación artística expresada por el usuario**. 
- **Lote B (5/5 producidos, 0/5 aprobados):** Nosotros, Contacto, Únete, Licencias y Herramientas — deben recibir aprobación o rechazo explícito del usuario.
- **Integración:** 0/10 sustituciones S2 en catálogo a la fecha de este registro. Los WebP se distribuyen en `Vecidya-CrystalWorld-S2-LoteCompleto.zip` desde el chat; aún no constan subidos al repositorio.
- **Puerta de seguridad:** no activar S2 completo ni retirar los originales hasta aprobar el lote B, verificar ambas variantes de fondo, accesibilidad y build. El hecho de generar todos los archivos **no equivale** a cerrar su integración.
- **Política vigente:** transparencias para no-fondos, fondos L0 por separado, escenas en L1/L2/L5, interfaz y datos en HTML L4; imágenes de naturaleza ilustrativa no representan resultados reales.

### Instalación del lote de candidatos

```powershell
cd "$HOME\Downloads\Vecidya-CrystalWorld-S2-LoteCompleto"
.\Instalar-S2-Lote.ps1 -Repositorio "D:\Proyectos\Vecidya"
```

Este instalador solo copia los diez candidatos y diez miniaturas, validando SHA-256; deja intactas las referencias del catálogo. Consultar el manifiesto S2 para seguimiento y aprobación selectiva.

## S2 — Aprobación total y proceso final de integración (2026-11-23)

- **Decisión del usuario:** aprobación explícita de las diez escenas del lote A y lote B; el manifiesto S2 v1.2.0 recoge 10/10 aprobaciones individuales.
- **QA de los bytes del ZIP:** diez SHA-256 recalculados y comparados con `manifest.json`, diez WebP RGBA 1536×1024 decodificados con Pillow, esquinas transparentes y diez miniaturas disponibles: PASS. La aprobación visual de la persona no implica certificación del despliegue.
- **Estado de GitHub al iniciar la integración:** el catálogo aún referenciaba las diez escenas antiguas; las diez nuevas imágenes aún estaban en un ZIP externo, no en `main`. Prohibido declarar S2 integrada hasta la sincronización comprobada.
- **Herramienta nueva:** `scripts/activar_s2.mjs`, con modo de comprobación predeterminado, `--apply` explícito, 10 hashes SHA-256, validación de 140 elementos, backups, preservación de originales, cambio de diez referencias y copia a `assets/library-assets/crystal-world/s2/`.
- **Paquete final para Windows:** `Vecidya-CrystalWorld-S2-Integracion-Final.zip`. Contiene los veinte WebP, manifiesto de distribución, script `Instalar-S2-Lote.ps1`, orquestador `Finalizar-S2.ps1`, galería HTML y documentación. El orquestador comprueba, activa localmente, genera el build, y opcionalmente con `-Publicar` hace commit/push limitado a rutas S2. No ejecuta despliegue Cloudflare.
- **Pasos:** actualizar `main` en el equipo → descomprimir ZIP → `./Finalizar-S2.ps1 -Repositorio D:\Proyectos\Vecidya` → inspeccionar la biblioteca → repetir con `-Publicar` → verificar 10 nuevas rutas en GitHub y la publicación por separado.
- **Política de acabado:** no purgar los originales sin comprobar consumidores; no agregar las escenas al HTML real sin revisión de uso. Los assets no-fondo permanecen con alfa; L0 independiente, L1/L2/L5 ilustrativos, L4 contenido real accesible.

**Definición de fase terminada:** 10/10 aprobadas, 10/10 activas en catálogo en `main`, 10/10 nuevos binarios en la biblioteca y previews disponibles, build y revisión integrada PASS. El estado de despliegue se registra de forma independiente.

## Checkpoint S2 cerrado / S3 iniciada — 2026-11-23

- **S2:** confirmado en `main` el commit `39ccd0bf8ab83237f25ee64bede487b96a66f470`: diez WebP activos y diez miniaturas presentes, catálogo y clasificación de 140 entradas. Usuario aprobó 10/10; originales conservados. Manifiesto actualizado a estado integrado. Despliegue público/CI no comprobados.
- **S3:** `assets/s3-replacement-manifest.json` creado con 12 recursos exactos: nueve SVG operativos (cuatro de diagnóstico, cuatro de servicios y uno WhatsApp) y tres ilustraciones grandes (búsqueda PNG, negocio verificado WebP, pin Vecidya WebP).
- **Dos lotes con puertas de aprobación:** lote SVG funcional (auditoría, calidad a tamaños reales, accesibilidad, marca de tercero); lote 3D (rediseño solo si es necesario, alfa real, fondos S1 claro/oscuro, tamaños de uso y consistencia Crystal World). No sustituir imágenes vectoriales con renders voluminosos en controles pequeños.
- **Estado:** S3 0/12 revisados y 0/12 integrados; el manifiesto es un inventario verificable, no una certificación visual.

## S3 — evaluación inicial de lotes (2026-11-23)

- **Lote A (9 SVG):** se leyeron los nueve archivos originales exactos de GitHub: ocho iconos de 48×48 con trazos `currentColor` y el símbolo WhatsApp de 24×24 en verde. Se propone **conservar el SVG vectorial** como candidato, sin sustituirlo por renders 3D, sujeto a contraste, accesibilidad y revisión de render a escala. Ningún SVG modificado ni aprobado por el usuario aún.
- **Lote B (3 ilustraciones):** se generó un piloto independiente para S3-09 Búsqueda en PNG RGBA, exportado a WebP 1254×1254, transparencia real comprobada y revisión en claro/oscuro; está incluido en el paquete local `Vecidya-S3-Lotes-Revision.zip`. El usuario todavía debe evaluar el candidato. S3-10 Negocio verificado y S3-11 Ubicación Vecidya siguen pendientes de producción específica.
- **Control editorial:** los paneles/infografías de muestra generados durante exploración no equivalen a los SVG originales ni a assets independientes; se descartan como sustituciones. No confundir arte de presentación con archivo utilizable en el catálogo.
- **Integración:** cero cambios de S3 en catálogo, cero binarios S3 subidos a GitHub. Mantener las doce fuentes antiguas sin mutación.
- **Regla:** nueve SVG funcionales se mantienen vectoriales; los tres objetos grandes requieren alfa real y QA L5, mientras L4 conserva funcionalidad accesible.

## S3 — cambio de criterio: regeneración total (2026-11-23)

El responsable decidió explícitamente **regenerar desde cero todos los doce assets de S3** y sustituirlos, revocando la propuesta previa de conservar los nueve SVG existentes. Esto aplica a los 9 operativos y a los 3 iconos/ilustraciones grandes, sin pérdida de identidad de WhatsApp.

- **Producción local:** 12 SVG nuevos con alfa vectorial; nueve símbolos compactos 64×64 y tres ilustraciones escalables 256×256. Cada icono tiene su propio archivo, no es una lámina recortada.
- **Paquete:** `Vecidya-CrystalWorld-S3-12-Assets-Nuevos.zip` disponible en el chat. Incluye 12 SVG, manifiesto SHA-256, galería `galeria-s3.html`, `Instalar-y-Activar-S3.ps1` y `activar_s3.mjs`.
- **QA local:** parseo XML y render CairoSVG 12/12; preflight y activación en un repositorio de simulación con 140 entradas: PASS. QA visual contextual de la biblioteca en Windows pendiente, sin aprobación artística individual inferida.
- **Integración:** el script preserva originales, valida hashes, crea respaldo, activa 12 referencias y ejecuta el build desde el equipo del usuario. No se han subido aún los binarios ni cambiado las 12 referencias en `main`.
- **Uso:** extraer paquete; desde su carpeta ejecutar en PowerShell `./Instalar-y-Activar-S3.ps1 -Repositorio "D:\\Proyectos\\Vecidya" -Publicar`, solo con el catálogo en estado original. Publicación y despliegue Cloudflare son estados diferentes.
- **Nota de diseño:** SVG compacto con volumen por gradientes para L4 funcional y escenas vectoriales más detalladas para L5. La funcionalidad real permanece HTML/CSS; no incrustar contenido o botones interactivos en una ilustración.

**No declarar S3 cerrada en GitHub hasta confirmar 12/12 referencias activas, 12/12 SVG presentes en destino y miniaturas/referencias válidas y build.**

## Incidencia S3 — QA artístico rechazado y política de ahorro (2026-11-23)

**Decisión correctiva:** los doce SVG creados en el paquete `Vecidya-CrystalWorld-S3-12-Assets-Nuevos.zip` se RECHAZAN. Su validación XML, rasterización y hashes no acreditaban fidelidad visual. No usar `Instalar-y-Activar-S3.ps1`, no sustituir catálogo ni eliminar originales. Se documentó en `assets/s3-replacement-manifest.json`.

**Protocolo obligatorio antes de gastar generaciones de imágenes:** (1) revisar fuentes exactas, seis referencias aprobadas y tamaños/roles reales; (2) redactar matriz de correspondencia del inventario canónico con criterios visuales medibles; (3) utilizar un único piloto solo cuando sea indispensable, evitar láminas ambiguas con etiquetas/activos inventados; (4) revisar cada imagen generada antes de mostrarla o convertirla en asset, descartando automáticamente cualquier fallo de estilo/semántica; (5) no repetir generaciones sin un diagnóstico específico del error; (6) procesar por lote únicamente los candidatos que superen el gate y pedir aprobación artística antes de integración. El objetivo es minimizar usos innecesarios de generación.

**Criterio por capa:** SVG L4 funcional puede seguir siendo vectorial pero requiere una gramática pulida y coherente sin sustituir indebidamente un control por una ilustración pesada; L5 necesita volumen y materiales Crystal World genuinos, alfa real, QA sobre fondo claro/oscuro. No confundir la lámina de presentación con doce assets independientes.

## Verificación de Cloudflare Pages y continuación S3 — 2026-11-23

**Origen público comprobado:** https://vecidya-biblioteca.pages.dev/biblioteca. Una auditoría de navegador en modo solo lectura confirmó carga final de la biblioteca y catálogo visible `140 de 140`, sin miniaturas rotas observadas, alternancia tema claro/oscuro, búsqueda `Vico` (10 resultados), filtros por categorías y presencia visual de los recursos S1 (5) y S2 (10). No equivale a un rastreo exhaustivo de cada recurso ni certificación WCAG/performance.

**Hallazgos menores:** algunas copias editoriales siguen describiendo 140 assets como inventario original y 11 variantes Crystal propuestas, pese a existir sustituciones; un formulario de muestra emite ocasionalmente el aviso «No se completó la operación de muestra». Aislar correcciones de UI de la producción de assets.

**S3:** permanecen 0/12 sustituciones, porque el primer lote fue rechazado artísticamente. La prioridad es fijar contrato visual S3 usando las seis referencias aprobadas y las imágenes realmente publicadas de S1/S2. Evitar nuevas generaciones hasta completar análisis, matriz de correspondencia exacta 12/12 y estándares visuales y funcionales por tamaño.
