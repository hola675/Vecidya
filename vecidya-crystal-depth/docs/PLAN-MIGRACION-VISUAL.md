## R1.5 — Roadmap para un solo lenguaje de diseño (2026-11-20)

**Situación verificada:** R1.2 (PR #257), R1.3 (PR #259) y R1.4 (PR #260) están fusionadas en `main`. En `vecidya-platform/` ya existen los tokens `--v-*`, las superficies y profundidades `v-surface`, los componentes React compartidos, la navegación pública canónica y los shells público/cliente/Admin. La plataforma sigue clara como base; Crystal Depth oscuro es laboratorio. No se ha publicado una migración visual React derivada de la biblioteca.

**R1.5 (este checkpoint) — contrato de compatibilidad, sin mutación de producto:** `assets/pattern-registry.json → platformCompatibility`, visor `#idioma`, documentación orientada a la fuente de verdad y pruebas focales que consultan `app/components/ui.tsx`, `experience-system.tsx`, `public-v2.tsx`, `premium-foundation.css`, `visual-system.css`, navegación y shells. Resultado exigido: que ninguna receta llame componente existente a una propuesta, y que los tokens coincidan con la plataforma. Estado actual: implementado en rama, sujeto a CI y revisión PR; no inferir publicación.

### Próximos bloques y dependencias

| Checkpoint | Trabajo que falta | Entrega esperada | Límite / gate |
| --- | --- | --- | --- |
| **R1.6** | Diseñar contratos mínimos para `PageHeading`, `AdminFilterBar`, `ConsentStatus`, `DiagnosticMetricCard` y `DiagnosticTrend`; decidir si `SharedStatusPanel` amplía `EmptyState` y `Alert` | Variantes tipadas de los componentes existentes, evitando duplicaciones | API concreta, accesibilidad, datos verídicos y propietarios de ruta |
| **R1.7** | Aplicación pública: Inicio/Servicios, Vecindario, Aprende y Licencias; reconciliar `app.css` heredado con `--v-*` sin regresión visual | Un PR por familia de pantalla con variantes de Card, Button, iconografía, textos y estados coherentes | No rediseñar todas las rutas de golpe; QA por 320/390/768/1366/1920 y tema claro |
| **R1.8** | Shell de Mi Vecidya y Admin, tablas, filtros, navegación y métricas | Un contrato operativo más denso y legible con filtros, empty/error/loading reales | Permisos y privacidad, GET/reset/paginación, sin métricas inventadas |
| **R1.9** | Editor y página pública MiniWeb, planes y límites Vecidya/GHL | Materiales en editor/vista previa y reglas de marca que respeten personalización del negocio | No asumir entitlements, no aplicar estilo Vecidya global a MiniWeb pública, no crear CRM paralelo |
| **R2** | Certificación visual integral, AA en superficies reales, zoom 200 %, lector de pantalla, modo reducido, teclado y rendimiento | Evidencia por pantalla y aceptación humana antes de despliegue | PASS del contrato no equivale a WCAG completa |
| **R3** | Adopción opt-in, verificación de despliegue y retirada controlada de duplicaciones históricas | Migración progresiva, rollback por ruta y estado del entorno público verificado | Deploy y cambios de producción requieren aprobación independiente |

### Decisiones todavía no cerradas

1. **Tema global:** por ahora no forzar oscuro en la plataforma; validar si se requiere por shell, si es opt-in y su persistencia.
2. **Variantes de superficie:** Focal ≈ highlight, Quiet ≈ glass y Solid ≈ solid; la profundidad es independiente y el hero puede no ser una Card.
3. **Propiedad de componentes:** no recrear controles ya exportados; los componentes propuestos por la guía no se declaran disponibles antes de implementarlos.
4. **Estados y mensajes:** identidad editorial, etiquetas, error/éxito, consentimiento y mensajes vacíos; mostrar estados solo con evidencia real.
5. **MiniWeb y GHL:** no aplicar el tema de Vecidya a páginas de negocios ni atribuir funciones CRM externas a la plataforma.
6. **CSS heredado:** inventariar overrides `app.css`, `*-premium.css` y reglas `--v-*` antes de cualquier sustitución global.

**Regla de cierre:** la única autoridad de componentes/tokens productivos es el código y la guía de `vecidya-platform/`. El JSON R1.5 documenta equivalencias verificables y la biblioteca las ejemplifica; no se importan estilos de laboratorio a producción. Mantener el PR focal y la CI sobre el HEAD exacto.

---

## R1.4 — Encargos para los subagentes (2026-11-20)

**Checkpoint en rama de trabajo:** a partir del merge verificado de PR #259 en `main`. Borradores de instrucciones por especialidad generados desde el registro de patrones, no de prompts duplicados. Se incorporan al selector existente de ocho intenciones, sin página adicional ni automatización de operaciones.

**QA focal:** misma batería Node + Chromium. Validar roles, opción sin escena, lectura del registro, copia de un texto revisable y degradación básica cuando el JSON esté indisponible. Adjuntar evidencias del SHA del nuevo PR.

**Límite:** no se modifica `vecidya-platform/`, no se instalan ni activan agentes, no se cambia jerarquía del equipo; el editorial continúa bajo liderazgo general. Sin deploy implícito.

---

## R1.3 — Biblioteca de estados de UI (2026-11-20)

**En implementación aislada:** explorador de cinco estados de interfaz (`idle/loading/empty/error/success`), `interactionRecipes` y pruebas focales. Rama de trabajo reutilizada tras la integración verificada de R1.2 en `main` mediante PR #257. La R1.3 no modifica rutas ni backend.

**Regla de integración:** el estado de éxito solo responde a evidencia real, y loading/error/empty deben explicar la situación sin inventar información. Mantener los mismos tests Node y Chromium; no crear arneses históricos adicionales.

**Pendiente:** comprobar CI final y revisión visual opcional. No autoriza deploy ni integración en componentes React de producción.

---

## R1.2 — Composición de páginas, enrutamiento y empaquetado (2026-11-20)

**Implementado únicamente en PR #257 (rama de laboratorio):** sección `#composiciones` con cuatro previews, tabs accesibles, claro/oscuro, transiciones ligeras, `prefers-reduced-motion` y fallback sin JS. El enrutador de ocho intenciones enlaza solo las cuatro composiciones con correspondencia exacta; para Diagnóstico, Admin, licencias y CRM informa que no existe preview propia.

- **Contrato agente:** `assets/pattern-registry.json → sceneRecipes`, `docs/INTEGRACION.md`, `docs/DIRECCION-ARTISTICA.md`. El diseño es referencia, no permisos, licencia ni ruta publicada.
- **Cloudflare aislado:** cambios de `main` sincronizados **dentro de la rama R1.2** mediante commit de dos padres; PR #257 de nuevo fusionable. El build conserva guías didácticas enlazadas y copia assets oficiales; ejecutarlo en CI no es un deploy.
- **QA ejecutada:** [R2 Chromium run 44765171200](https://github.com/hola675/Vecidya/actions/runs/44765171200) **46 PASS, 0 fallos** en versión previa a enlace directo; [R2 Chromium run 44765610916](https://github.com/hola675/Vecidya/actions/runs/44765610916) **47 PASS, 0 fallos** y empaquetado estático con **140 assets**. No heredar esos resultados al último HEAD: se reejecuta CI para las mejoras del enrutador y documentación.
- **Documentación consolidada:** README, dirección artística, integración y este plan; no se crean informes de QA nuevos por cada ejecución. Las capturas se conservan como artifact temporal de GitHub.
- **Pendiente no bloqueante para seguir iterando laboratorio:** revisión humana de capturas, zoom 200 %, lector de pantalla, contrastes sobre gradientes/transparencias y rendimiento en hardware lento. No declarar R2 visual integral aprobado ni fusionar/publicar sin la decisión del responsable.

**Siguiente checkpoint:** expandir patrones comunes a más pantallas **solo después de estabilizar** el contrato y mantener sincronización con `main`; integración React de una ruta específica requiere aprobación separada y pruebas sobre esa ruta.

---

## R1.1 / R2 — Movimiento y navegador real (20-11-2026)

**Estado de laboratorio:** implementado en la rama del PR #257, sin merge ni despliegue. Cinco presets para agentes (`page-enter`, `section-reveal`, `ui-feedback`, `ambient-drift`, `section-navigation`) con muestras, intensidad, pausa, repetición y degradación estática. No modifica componentes productivos React.

**Evidencia ejecutada:**
- **RAN/CI:** [Crystal Depth contract QA · 44674472281](https://github.com/hola675/Vecidya/actions/runs/44674472281), PASS: prueba Node de contrato y **30 pruebas de Chromium sin fallos**. Se verificaron 320, 390, 768, 1366, 1920 px, tema alternativo, enrutador de MiniWeb/Diagnóstico, búsqueda y estado vacío, diálogo/Escape, teclado, controles de movimiento y `prefers-reduced-motion`.
- **Corrección:** desbordamiento horizontal de 5 px a 320/390 debido a texto largo de insignias; CSS limita el ancho del `small` y permite su ajuste. Repetido en Chromium y PASS en los cinco anchos.
- **CAPTURAS:** [artifact de Chromium en GitHub](https://github.com/hola675/Vecidya/actions/runs/44674472281/artifacts/14601034734), diez archivos subidos de la ejecución; caduca según política de retención CI.
- **PRUEBAS EN CÓDIGO:** `tests/r1-contract.test.mjs` y `tests/r2-browser-qa.mjs`; CI dedicada `.github/workflows/crystal-depth-quality.yml`. No acumulamos capturas en el árbol: se guardan como artifacts temporales.
- **Ajustes:** `styles/motion-system.css`, `assets/motion-system.js`, sección de demostración `#movimiento` y contrato `assets/pattern-registry.json → motion`. Las animaciones son opt-in y no ocultan contenido sin JS.

**R2 todavía no certifica:** revisión humana del acabado de todas las capturas, prueba con lector de pantalla, zoom 200 %, contraste en gradientes/transparencias reales y rendimiento en dispositivos lentos. No etiquetar como WCAG completa ni habilitar integración/deploy.

**Regla de SHA:** comprobar nuevamente el estado de CI después del último commit del PR; los resultados anteriores son evidencia de su ejecución concreta, no certificación automática de modificaciones futuras.

---

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
