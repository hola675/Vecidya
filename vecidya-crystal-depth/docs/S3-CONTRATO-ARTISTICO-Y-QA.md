# S3 · Contrato artístico y QA previo — Crystal World

**Versión individual:** 1.1.0 · **Última modificación:** 2026-11-23  
**Estado:** especificación de control; **no** certifica ningún nuevo recurso.  
**Fuentes:** seis referencias Crystal World aprobadas por el responsable, S1/S2 aprobadas y visibles en Cloudflare Pages, inventario `assets/s3-replacement-manifest.json`.

## 1. Decisión y alcance

Regenerar los doce recursos canónicos S3 desde cero, preservar las funciones originales y los originales como respaldo, y sustituir **solo después** de pasar inspección visual individual y aprobación del responsable. El paquete S3 v1 previo fue **rechazado 12/12**; no reutilizarlo, no generar láminas que se hagan pasar por recursos individuales, ni gastar generaciones sin un objetivo específico y contrastable.

## 2. Correspondencia canónica (NUNCA sustituir por categorías genéricas)

| ID | Recurso real | Función visual | Entrega prevista |
|---|---|---|---|
| S3-01 | Diagnóstico · negocio | Identificación de negocio | Nuevo icono funcional 48 × 48 o vector escalable, semántica negocio |
| S3-02 | Diagnóstico · creador | Actividad creadora | Nuevo icono funcional, semántica creación |
| S3-03 | Diagnóstico · profesional | Profesional independiente | Nuevo icono funcional, semántica profesional |
| S3-04 | Diagnóstico · proyecto | Proyecto o iniciativa | Nuevo icono funcional, semántica proyecto |
| S3-05 | Servicio · presencia digital | Presencia en web | Nuevo icono funcional, semántica presencia digital |
| S3-06 | Servicio · formalización | Documento/formalización | Nuevo icono funcional, semántica formalización |
| S3-07 | Servicio · estructura | Organización y procesos | Nuevo icono funcional, semántica estructura |
| S3-08 | Servicio · visibilidad | Descubrimiento/visibilidad | Nuevo icono funcional, semántica visibilidad |
| S3-09 | Interfaz · búsqueda | Ilustración protagonista de búsqueda | Objeto 3D aislado con alfa auténtica |
| S3-10 | Interfaz · negocio verificado | Negocio con certificación | Diorama 3D aislado y estado verificable representado simbólicamente |
| S3-11 | Interfaz · ubicación Vecidya | Marcador de ubicación | Objeto 3D aislado; no alterar emblema corporativo sin fuente verificada |
| S3-12 | Interfaz · WhatsApp | Servicio externo WhatsApp | Icono reconocible, conservar geometría y marca; no reinterpretar identidad |

No usar sustitutos ficticios como «restauración», «compras», «eventos», «alianzas» o cualquier etiqueta que no corresponda a la categoría original.

## 3. Estándar visual obligatorio

Comparar **contra los seis referentes aprobados** y al menos dos escenas S1/S2 ya aprobadas, no contra los candidatos SVG rechazados. El estilo exige volumen 3D amable o geometría vectorial deliberadamente consistente, materiales de vidrio azul refractado, biseles y canto luminoso, luces cian y naranja de fuente plausible, reflejos selectivos, sombras de contacto y contraste suficiente. Evitar iconos planos con solo gradiente, degradados opacos rectangulares, neones que destruyan el detalle y vitrinas/dioramas idénticos en funciones diferentes.

**Tamaños:** L4 requiere legibilidad a 24/32/48 px (en vez de reducir una escena 3D gigante); L5 puede tener una ilustración premium 3D detallada de 1254 px o superior y rendir a 160/320 px. La entrega puede utilizar técnicas distintas por rol, pero **los doce serán recursos nuevos**.

**Alfa:** todo no-fondo debe ser realmente transparente. Export WebP RGBA para escenas L5 o SVG con `viewBox` limpio y sin `<rect>` de fondo para L4; comprobar sobre fondos S1 oscuro, claro y damero, halos, sombras residuales, bordes y nitidez.

**L0–L5:** L0 fondos S1, L1 escena, L2 rutas/profundidad, L3 superficies, L4 controles HTML/CSS/JS con SVG operativos y accesibles, L5 iconos decorativos principales sobre transparencia; jamás poner texto interactivo ni reseñas ficticias en el raster.

## 4. Puerta antidesperdicio antes de una generación

1. Analizar archivo fuente, uso real, escalas, semántica y referencias de cada ID; conservar la tabla canónica.
2. Decidir qué cambios concretos exige cada recurso y comprobar si pueden construirse o mejorarse sin usar generación de imágenes.
3. Si la generación es indispensable, generar un **recurso individual** con una especificación explícita; nunca una lámina con doce etiquetas ni varias variantes especulativas.
4. **Antes de seguir**, abrir el arte nuevo y evaluar semántica correcta, material 3D, textura, perspectiva, alfa y compatibilidad con fondos S1; rechazar fallos en silencio sin integrarlos.
5. Guardar SHA-256, tamaño, dimensiones, previews claros/oscuros, validación pequeña y grande, y evaluación artística individual.
6. Presentar un lote con todos sus elementos efectivamente inspeccionados; **solo tras aprobación explícita** activar catálogo y publicar con rollback.

**Fallos de calidad son BLOQUEANTES.** `build OK`, `SVG parse PASS` y `SHA PASS` no equivalen a calidad visual. Mantener el gasto en generación mínimo.

## 5. Estado comprobado

- Biblioteca pública: https://vecidya-biblioteca.pages.dev/biblioteca, operativa con 140 registros; S1 (5/5) y S2 (10/10) visibles según revisión en navegador.
- S3: 12 recursos originales disponibles en catálogo, 12 candidatos anteriores rechazados, **0 aprobados, 0 sustituidos**.
- Pendientes: diseño/producción adecuada, QA individual, visto bueno del usuario, build y comprobación en Cloudflare.

## Historial resumido

- **1.0.0 — 2026-11-23:** contrato de calidad, mapa semántico 12/12 y política de gasto mínimo antes de producir S3.

## 6. Auditoría reproducible antes de generar

El nuevo script `scripts/auditar_s3_originales.mjs` inspecciona las doce rutas S3 del catálogo, las doce vistas previas y los tamaños relevantes. Genera una galería local (sin tocar imágenes ni catálogo):

```powershell
cd D:\Proyectos\Vecidya
git pull --ff-only origin main
cd .\vecidya-crystal-depth
node scripts/auditar_s3_originales.mjs
Start-Process .\qa\s3\originales\index.html
```

La prueba aún **no ha sido ejecutada en el equipo del usuario**. No marcar como PASS antes de obtener la salida. Los ocho iconos de diagnóstico y servicios son SVG 48×48, WhatsApp SVG 24×24, y las tres ilustraciones principales tienen 1254×1254.

**Hallazgo de arquitectura:** `vecidya-platform/app/assets/public-assets.ts` mapea estos mismos recursos originales. Una activación en `vecidya-crystal-depth/assets/library-catalog.js` cambia la biblioteca únicamente, no el consumo de la plataforma. La migración a la aplicación real debe constituir una fase separada con regresión y rollback, y los símbolos funcionales y externos deben retener su semántica. Verificar el uso exacto de cada recurso antes de reemplazar llamadas de producción.

## Historial
- **1.1.0 — 2026-11-23:** auditoría previa reproducible y dependencia con el mapeo de assets de la plataforma.
