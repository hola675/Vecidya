# Plan de verificación MiniWeb V2

Estado: por ejecutar. Las pruebas citadas en PR previos son evidencia histórica, no resultados nuevos.

| Gate | Escenario | Evidencia requerida |
| --- | --- | --- |
| G01 | D1: publicación fallida y reserva de cupo | Comparación de slots, snapshots y punteros antes/después |
| G02 | D1: dos publicaciones concurrentes y reintento | Un único resultado válido, capacidad respetada |
| G03 | Tenants: IDs de otro negocio en editor/API/media | 403/404 y ninguna filtración |
| G04 | Roles: lector, admin, owner y licencia | Permisos consistentes en UI y servidor |
| G05 | Editor: edición mientras se guarda, 409 y navegación | Sin pérdida silenciosa de contenido |
| G06 | Diseño: 5 familias × 3 variantes | Contenido conservado y responsive |
| G07 | Medios: subida, publicación, borrado y acceso público | Sin imagen rota ni referencia cruzada |
| G08 | V1→V2: importación repetida y omisiones | Informe de conversión y datos íntegros |
| G09 | SEO, sitemap, Vecindario, enlaces existentes | URLs y metadatos correctos |
| G10 | Accesibilidad | Teclado, lector, contraste, zoom, movimiento |
| G11 | D1/R2 staging y recuperación | Backup, restore y rollback ensayados |
| G12 | Retirada V1 | Cero consumidores activos y rutas compatibles |

## Protocolo

1. Registrar SHA y entorno exactos.
2. Preparar fixtures aisladas, sin datos personales.
3. Ejecutar pruebas focales y regresión completa.
4. Adjuntar salida, capturas y comparación de estado.
5. Clasificar hallazgo como reproducido, descartado o pendiente.
6. Solo entonces proponer corrección mínima con pruebas.

No modificar producción ni migraciones remotas sin aprobación.
