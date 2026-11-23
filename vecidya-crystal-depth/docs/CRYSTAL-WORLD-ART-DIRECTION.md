# Contrato artístico aprobado — Vecidya Crystal World

**Versión:** 1.0.0 · **Última modificación:** 2026-11-23  
**Estado:** dirección artística aprobada; archivos generados y sustituciones aún pendientes.

## Referencias y gramática

El responsable aprobó seis imágenes de referencia entregadas en la conversación el 23 de noviembre de 2026: **(1)** lockup/símbolo institucional vertical azul-naranja, **(2)** cuatro bloques flotantes de funciones, **(3)** vecindario tridimensional de pequeños comercios conectados, **(4)** fondo panorámico oscuro con horizontes/paneles de cristal, **(5)** escena institucional horizontal de Vico y comunidad, **(6)** pareja panorámica clara del fondo espacial. Las referencias están en los archivos adjuntos a la conversación; no declaramos que estén copiadas al repositorio, ni asumimos licencias externas.

**Nombre de estilo:** Vecidya Crystal World (universo ilustrativo) + Crystal Depth (sistema de composición e interfaz).

**Lenguaje:** azul nocturno/eléctrico + cian de luz y naranja ámbar; vitrificados redondeados; bisel y volumen 3D amable; horizontes abiertos y vecindario conectado; luces con fuente y sombras coherentes; arcos perimetrales, reflejos y rutas suaves; espacios negativos para texto HTML; fondos separados de Vico, logotipo, controles y datos.

**Tokens existentes (canónicos):** `#06172F`, `#0D2E54`, `#F1F7FE`, `#F3F8FF`, `#123766`, `#FF9B27`, `#51E3FF`. Tokens **candidatos** de iluminación: `#09275C`, `#0754C9`, `#00A8FF`, `#FFBD35`; aprobarlos por contexto y contraste antes de hacerlos globales.

**Materiales y contexto:** Crystal Focal (marketing y escenas), Crystal Quiet (interacciones leves) y Solid Readable (formularios, tablas, lectura, administraciones). Mantener las capas contractuales L0 ambiente, L1 escena, L2 perspectiva, L3 superficie, L4 contenido funcional, L5 ilustración de foco.

**Vico:** conserva identidad oficial de zorro naranja, chaqueta azul, proporciones y expresiones. Nunca reconstruir un Vico alternativo como marca oficial sin aceptación individual. No convertir una ilustración de Vico en marca del MiniWeb de un tercero.

## Lo que NO debe suceder

- Usar un mismo fondo espectacular detrás de todos los formularios.
- Convertir iconografía operativa en PNG grandes o confundir maquetas de dashboards con funcionalidades reales.
- Crear texto, botones, métricas o marcas de terceros incrustados en el arte.
- Cambiar personajes, fotografías reales o la geometría del símbolo corporativo por IA sin aceptación expresa.
- Mezclar render tridimensional premium, emoji y diseño plano inconsistente en una misma familia.
- Borrar originales al exportar un candidato.

## Orden de ejecución aprobado

**Primero reemplazos S0–S10, después pack adicional de 24 assets.** El documento operativo y criterios de QA/purga son `docs/ROADMAP-SUSTITUCION-ASSETS.md`. `assets/asset-classification.json` sigue siendo el inventario 140/140, no una lista de assets ya regenerados.

## Historial de cambios

- **1.0.0 — 2026-11-23:** nueva gramática común aprobada y frontera entre dirección artística y producción.


## Política aprobada: transparencia y capas L0–L5 — 2026-11-23

**Decisión explícita del responsable:** todo asset que NO sea un fondo debe producirse como un objeto/escena aislado sobre transparencia real (canal alfa), sin rectángulo de fondo opaco ni resplandor incrustado que simule transparencia. Los fondos sí pueden ser opacos (oscuro/claro). La aprobación artística de la última imagen de tienda y reseñas es aprobación de la dirección visual, no del archivo WebP optimizado hasta verificar alfa/contornos.

**Separación técnica:** L0 fondo/atmósfera estacionaria (opaco permitido); L1 contexto de escena (preferentemente transparente si reutilizable); L2 perspectiva/rutas/arcos (transparente); L3 materiales/superficies (CSS/HTML; imágenes solo si son decorativas y transparentes); L4 contenido real e interactivo siempre HTML/CSS/JS accesible, NO texto o botones rasterizados; L5 protagonistas (Vico, tiendas, iconos 3D, elementos de reseñas) transparentes. El asset compuesto puede incluir múltiples motivos L1/L2/L5 solo cuando sea una ilustración decorativa no interactiva y conserve alfa genuina. El brillo debe conservar bordes suaves sin halos negros/blancos.

**QA obligatorio por recurso:** verificar alfa 0 en esquinas y regiones exteriores, bordes sobre fondo claro/oscuro, dimensión, WebP en modo RGBA, peso, encuadre responsive, legibilidad y correspondencia con las seis referencias; nunca equiparar extensión .webp con transparencia real. Un componente decorativo de reseñas no representa calificaciones reales; evaluaciones verdaderas deben usar datos reales en L4.

**Prioridad:** sustituir recursos actuales por lotes verificados antes de ampliar la biblioteca. Originales protegidos y reversión disponible.

### Historial
- **v1.1.0 — 2026-11-23:** regla de transparencia por tipo y responsabilidades por L0–L5, aprobadas por el responsable.
