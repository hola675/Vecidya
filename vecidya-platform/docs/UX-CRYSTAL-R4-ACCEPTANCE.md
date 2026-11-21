# UX-CRYSTAL-R4 — Aceptación visual, accesibilidad y liberación controlada
<!-- Versión: 1.0.0 | 2026-11-20 | Estado: CHECKPOINT DOCUMENTAL ABIERTO -->
## Propósito y alcance
Cerrar las deudas de UX Crystal R2 integral y preparar el gate operativo R3 sin confundir CI, merge o smoke HTTP con certificación de un despliegue. No se modifica UI, CSS, backend, esquema, datos, licencias ni configuración de Cloudflare en este checkpoint.

**Base documental Git:** `main@b069103beb396f74f8841044d77534e78e8b1d9b` (merge PR #267). R2-A fue integrado mediante PR #266; R3 mediante PR #267. Los resultados CI documentados se asocian a los SHAs exactos de sus ejecuciones, no a futuras modificaciones.
- R3: `6984c3004caad6dadf78dafaac266ec76781d92c`. [CI general](https://github.com/hola675/Vecidya/actions/runs/44823490209), [Chromium](https://github.com/hola675/Vecidya/actions/runs/44823490011), [Aprende quality](https://github.com/hola675/Vecidya/actions/runs/44823489752) y [Aprende public QA](https://github.com/hola675/Vecidya/actions/runs/44823489705), informados PASS en PR #267.
- R2-A: corrección de animación residual de Vico con reduced motion y medición de overflow por `scrollWidth`; QA de navegador en 7 anchos según PR #266.
- **No verificado aquí:** CI fresco del merge final, revisión humana exhaustiva, accesibilidad con tecnología asistiva, staging desplegado, versión real en producción, rendimiento de hardware lento y rollback en entorno real.

## Matriz de aceptación R4
Cada fila requiere responsable, fecha, commit/Version ID, dispositivo/navegador, evidencia y resultado PASS/FAIL/BLOCKED; «no ejecutado» nunca cuenta como PASS.

| ID | Superficie / verificación | Procedimiento y criterio de salida | Estado inicial |
| --- | --- | --- | --- |
| VIS-01 | Inicio, Servicios, Vecindario, Aprende y biblioteca | Revisar capturas lado a lado con ruta y anchuras 320, 390, 768, 1366 y 1920; lectura, composición, alineación, Vico, íconos y fondos compuestos sin ocultar contenido | PENDIENTE HUMANO |
| VIS-02 | MiniWeb editor y Admin Negocios autenticados | Entrar con identidades de QA de permisos reales, comprobar datos/estados y composición sin alterar autorización ni publicar contenido | PENDIENTE QA AUTENTICADO |
| A11Y-01 | Zoom 200 % | Zoom nativo del navegador (no solo viewport reducido); sin pérdida de contenido, corte, solapes que impidan operar ni scroll bidimensional evitable | PENDIENTE |
| A11Y-02 | Lector de pantalla | NVDA/VoiceOver según disponibilidad: orden de encabezados, nombres, roles, estados, errores, diálogos, navegación y anuncios reales | PENDIENTE |
| A11Y-03 | Contraste compuesto | Medir texto, iconos informativos, focos y controles sobre material Focal/Quiet/Solid con gradientes, transparencias, blur y estados reales, en temas que estén disponibles | PENDIENTE |
| A11Y-04 | Teclado y movimiento reducido | Recorrido completo con Tab/Shift+Tab/Enter/Escape, foco visible, sin trampas, reduced-motion sin animación residual; revalidar Vico | AUTOMATIZADO PARCIAL; MANUAL PENDIENTE |
| PERF-01 | Hardware/conexión limitados | Inspeccionar cargas y animaciones en CPU limitada y red lenta, LCP/CLS/INP según medición, fallback sin blur, sin saltos ni bloqueos perceptibles | PENDIENTE |
| OPS-01 | Higiene CSS | Inventariar `app.css`, `*-premium.css`, tokens `--v-*` y overrides; proponer eliminación solo tras demostrar que no quedan consumidores; evitar cambios globales en este checkpoint | PENDIENTE |
| OPS-02 | Reversión por ruta | En staging autorizado, desactivar una sola flag existente, ejecutar CI, desplegar, verificar que desaparece la mejora sin cambiar permisos, restaurar y repetir verificación | PENDIENTE STAGING |
| OPS-03 | Identidad del despliegue | Registrar commit exacto, Cloudflare Version ID, dominio/ambiente, fecha y lectura HTTP segura; no inferir SHA a partir de 200 OK | PENDIENTE STAGING |
| OPS-04 | Publicación de producción | Aprobación explícita posterior a VIS/A11Y/PERF/OPS, checklist de rollback, copia de evidencia y autorización separada | NO AUTORIZADA |

## Rutas y controles actualmente integrados
La fuente de verdad es `vecidya-platform/app/lib/visual-rollout.ts`:
- `publicHomeHeadings`, `publicDirectoryResults`, `publicServicesHeadings`, `adminBusinessSurfaces` y `miniWebEditorSolid`: true, reflejan adopciones previas.
- `futureLearnLayout` y `futureClientShell`: false; **no se consideran nuevos diseños ya activados**.
- Son flags deterministas de código, no toggles runtime. Una reversión requiere revisión, CI y despliegue autorizado.

## Formato de evidencia por fila
```text
ID:
Estado: PASS | FAIL | BLOCKED | NOT_RUN
Rama/commit:
Entorno/Cloudflare Version ID (si aplica):
Ruta + identidad de QA (sin secretos):
Viewport / zoom / navegador / sistema:
Procedimiento ejecutado:
Resultado observado:
Captura, video o log (en artefacto temporal, no en repo):
Defecto asociado / decisión de aceptación:
Responsable + fecha:
```

## Protocolo de ejecución focal y limpieza
1. Abrir un defecto reproducible asociado a una fila de matriz y registrar evidencia previa.
2. Corregir el mínimo CSS/componente/estilo implicado; nunca cambiar guardas, D1, licencias o datos para solucionar un problema visual.
3. Reutilizar `tests/e2e/public-navigation-a11y-check.mjs`, tests focales y workflows existentes; no crear arneses acumulativos.
4. Repetir prueba focal + typecheck/build y las suites afectadas sobre SHA final; inspección humana posterior.
5. Conservar artefactos temporales y referencias por ejecución; actualizar esta misma matriz y changelog, sin duplicar informes.
6. Ramas temporales por corrección, PR y merge tras gates; borrar rama cuando el merge esté verificado.

## Decisiones y límites
- Tema claro productivo continúa como base. El tema oscuro de Crystal Depth es laboratorio y requiere evaluación propia antes de una activación global.
- MiniWeb público conserva identidad del negocio; no se le impone el tema Vecidya.
- GHL es externo y no se atribuyen prestaciones CRM nuevas por cambios visuales.
- Sin deploy automático implícito, sin escritura D1 remota, sin aceptar como realizada una prueba no ejecutada.

## Changelog
- 1.0.0 (2026-11-20): primera matriz documental R4; referencias verificadas de R2/R3 y límites de aceptación.
