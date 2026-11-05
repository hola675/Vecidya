# F06 — Revisión de cobertura real del E2E MiniWeb V2

Fecha 2026-11-05. Fuente: tests/e2e/miniweb-v2-conversion-check.mjs, tramo líneas 220–final, SHA d382616454dfbccc0188693657c20cf31eb44c13. Solo lectura, sin ejecución.

## Cobertura observada en código
- Prueba de escape XSS en HTML publicado.
- Inserta ampliación Cuadra y comprueba publicación posterior HTTP 200.
- Matriz 5 familias × 3 variantes × 3 viewports (390×844, 768×1024, 1440×900): 45 capturas fullPage y manifest.json.
- Comprueba ausencia de overflow horizontal, 11 secciones visibles, un H1, un destino #contacto visible, alt en imágenes presentes, esquemas href, contraste aproximado >=4.5, reduced motion, y navegación Tab a algún enlace.
- Comprueba persistencia de consentimiento y procedencia V1, ausencia de importación de horarios, y que no se altera publicación V1.
- Usa fixtures SQL directos para los 15 sitios visuales: crea sitio y publicación, no realiza el flujo completo de publicación de cada familia/variante mediante API.
- Las imágenes de la matriz visual son referencias sintéticas sin asegurar media real; la condición alt es vacuamente cierta si no hay elementos img. La captura no certifica render de medios reales.
- Los 45 screenshots se escriben en carpeta temporal .playwright-mcp/miniweb-v2-vis01-... y se conserva manifest allí; revisar artefactos CI/retención.
- No hay prueba axe-core ni lector de pantalla en el tramo inspeccionado; el contraste calculado usa variables CSS y aproximaciones, no una auditoría WCAG completa.

## Hallazgos nuevos
MW2-031 (P1, QA): cobertura visual 45 combinaciones usa fixtures insertados por SQL, no publicación real API por combinación. Requiere prueba representativa end-to-end del flujo de publicación por familia/variante y matriz visual humana. No implica fallo funcional.
MW2-032 (P1, accesibilidad): controles de accesibilidad parciales (alt presente, contraste aproximado, Tab, reduced-motion). Falta axe/semántica completa/teclado/lector de pantalla/zoom y contrastes reales en gradientes. Vinculado MW2-003.
MW2-033 (P2, evidencia): las capturas/manifest se generan en carpeta local .playwright-mcp; verificar persistencia y publicación de artefactos en CI. Sin pipeline verificado no hay trazabilidad de imágenes.
MW2-034 (P2, media): los fixtures visuales usan IDs sintéticos y no verifican carga de imágenes reales en cada familia; planificar pruebas R2 con imágenes autorizadas y alt no vacío. No confundir con otras pruebas de revocación de media existentes.

## Pendientes y criterios de cierre
P-CI-16: ejecutar y conservar matriz 45 capturas con SHA, hashes y revisión humana.
P-CI-17: completar axe y pruebas manuales teclado/lector/zoom.
P-CI-18: verificar carga y comportamiento de imágenes reales por familia/variante.
P-CI-19: confirmar artefactos CI y retención de manifest/screenshots.
P-CI-20: verificar publicación por API para muestras representativas de cada familia/variante.

F01, F02, F06 continúan abiertas; no se han ejecutado pruebas ni desplegado cambios.
