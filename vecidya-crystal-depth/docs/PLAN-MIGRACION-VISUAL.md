## R2 — Certificación focal y evidencia reproducible (2026-11-20)

**Estado:** QA de contratos R1 validado; **R2 visual integral ABIERTO**. El PR #257 permanece en borrador, sin integración ni despliegue.

- **CODE/TEST:** añadido test focal sin dependencias en `tests/r1-contract.test.mjs` y workflow condicionado a cambios de la biblioteca. Comprueba atributos de tema, ejecuta la alternancia claro/oscuro, recorre 8/8 casos del enrutador y sus tres salidas, materiales/capas/IDs, cuatro pares de contraste sólido, foco/reduced-motion declarados y catálogo de 140 assets en 17 categorías.
- **RAN/CI:** [Crystal Depth contract QA · run 44672412869](https://github.com/hola675/Vecidya/actions/runs/44672412869) **PASS** sobre `fc0d7961`.
- **RAN/estático:** enrutador ejecutado 8/8 PASS; oscuro → claro → oscuro y `aria-checked` PASS. Contraste de texto oscuro principal sobre sólido ≈12,81:1 y texto azul de marca sobre naranja sólido ≈6,85:1; **no extrapolar a fondos con alfa o gradientes**.
- **Browser de preview externa:** carga de biblioteca R1, las tres intensidades, guía y galería visibles. No se certificaron DevTools, responsive preciso, zoom, contrastes compuestos ni lectores de pantalla. Un reporte automático discrepó con atributos y resultados que constan en código y ejecución determinista; se priorizó esta última evidencia.
- **RAN/Chromium local de referencia:** el HTML **0.7**, sin nuevos bloques R1, no mostró desbordamiento global a 320, 390, 768, 1366 y 1920 px, mostró 140 tarjetas y no registró errores JS. Navegación por Tab con foco de 3 px y skip-link visible. **Esto NO certifica R1 completa.**
- **R2 pendiente:** capturas reales R1 en cinco anchos, contraste efectivo en transparencia, zoom 200 %, lector de pantalla, teclado R1, fallos de assets, rendimiento y revisión humana.

**Regla:** tras un nuevo commit se exige PASS y evidencia del HEAD actualizado; no heredar un PASS anterior. No fusionar ni desplegar hasta nueva autorización y gates satisfechos.

---

## R1 — Implementación aislada en la biblioteca (2026-11-19)

**Hecho en rama de revisión:** tema oscuro predeterminado, claro alternativo, tres materiales Focal/Quiet/Solid; sección didáctica con selector de intención y copia de instrucciones; contrato JSON para agentes; dirección artística y guía de integración ampliadas.

**No certificado en R1:** contraste WCAG sobre fondos compuestos, captura visual de la rama, zoom 200 %, lector de pantalla, CI y nuevas pruebas responsivas. No reutilizar pruebas de v0.7 como si validaran los cambios R1.

**Sin autorización ni cambio:** plataforma, MiniWeb V2, rutas productivas, datos, licencias efectivas, GHL, migraciones, despliegue o merge.

### Gates siguientes, independientes y por orden

1. **R1 revisión humana:** aprobar composición, claridad, materiales, Vico, iconos y variantes claro/oscuro.
2. **R2 certificación de biblioteca:** comprobar 320/390/768/1366/1920 px, contrastes reales, foco y teclado, zoom 200 %, lector de pantalla, reduced-motion, alternativa sin blur y rendimiento; corregir y repetir pruebas sobre SHA final.
3. **R3 integración mínima opt-in:** reconciliar tokens R1 con `vecidya-platform/docs/design-system/VECIDYA-UI-UX.md` y `visual-system.css`, no importar CSS del laboratorio globalmente; preparar variantes tipadas React.
4. **R4 migración por páginas:** inicio, servicios, licencias, aprende, diagnóstico y Vecindario; cada grupo con QA propio. No mezclar cambio visual y semántica del diagnóstico.
5. **R5 aplicación interna y MiniWeb V2:** editor, preview, assets, publicación y permisos conservados; adaptar plantillas sectoriales sin pérdida de contenido.
6. **R6 progresión por licencia:** adoptar diferencias Cuadra/Barrio/Ciudad solo tras contrato comercial, backend de derechos e integraciones efectivas, sin duplicar GHL.
7. **R7 despliegue:** únicamente por autorización específica, con evidencia HTTP fechada y rollback.

---

# Plan de cambios visuales — sin modificación prematura de producción

Versión 0.6 · Estado: biblioteca visual local verificada en navegador; integración de la plataforma no iniciada ni autorizada.

## Fase 1: inventario y referencia — completada para esta iteración

Se contrastaron componentes y activos oficiales existentes, incluido el registro app/assets/public-assets.ts. El inventario recorre los 140 archivos de `public/assets/`: 116 en `selected/`, 20 en `catalog/` y cuatro imágenes del equipo. Once iconos tienen vistas Crystal PNG propuestas; WhatsApp se exporta a PNG para la galería. Las fuentes originales no se sustituyen ni se editan.

## Fase 2: aprobación visual — revisión técnica completada; aprobación integral pendiente

Se implementó la biblioteca y se repitieron seis pasadas de identidad, composición, material, luz, accesibilidad y viabilidad técnica en Chromium local. Interacciones y siete viewports (320–1920 px) comprobados; ver `DIRECCION-ARTISTICA.md`. El usuario aprobó la primera escena generada como referencia de estilo. La escena clara, los iconos Crystal y la galería completa aún requieren aprobación visual; no se autoriza integración.

## Fase 3: biblioteca — implementada localmente

biblioteca.html, styles/crystal-depth.css y styles/themes.css contienen superficies, temas claro/oscuro, botones, pestañas, acordeón, formularios, tabla, estados, diálogo, filtros por categoría, orden y búsqueda. Las seis variantes comparten geometría y receta de sombra, incluido el tono hielo. `assets/library-catalog.js` indexa 140 fuentes con dimensiones y `assets/catalog-previews/` sirve 128 miniaturas WebP optimizadas; los originales se abren por separado. Hay dos fondos WebP y doce PNG locales. Esta biblioteca usa HTML/CSS/JavaScript nativo y todavía no es un paquete de componentes de la plataforma.

## Fase 4: integración controlada — pendiente, fuera del alcance actual

La integración requiere una solicitud y aprobación visual separadas. Si se autoriza, aplicar cambios opt-in por sección, conservar contratos y flujos de botones, formularios, diagnóstico, rutas y MiniWeb2, y ejecutar las validaciones de plataforma correspondientes.

## Matriz inicial

| Superficie | Objetivo | Prioridad | Estado |
|---|---|---|---|
| Inicio público | escena narrativa y hero | alta | pendiente de aprobación |
| Vecindario | composición territorial y tarjetas | alta | pendiente de aprobación |
| MiniWeb2 editor | materiales configurables | alta | requiere auditoría del registro |
| Panel interno | tarjetas y datos | media | pendiente |
| Diagnóstico | claridad sin alterar flujo | crítica | protegido |

## Condición de avance

No migrar visualmente ninguna pantalla hasta contar con diseño aprobado, referencia de assets correcta, inventario de componentes afectados y plan de reversión.

## Changelog

- v0.6: seis revisiones técnicas/interactivas repetidas; unificación del material hielo y comprobación responsive local.
- v0.5: inventario completo filtrable, metadatos, acordeón y once propuestas de iconos Crystal; integración y aprobación visual pendientes.
- v0.4: tema claro/oscuro, fondo claro propuesto y revisión de evidencia.
- v0.3: biblioteca local implementada; la integración sigue pendiente.
- v0.2: secuencia de aprobación y matriz inicial, sin migración.
