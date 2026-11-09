# Reconciliación Diagnóstico V9 — 2026-11-09

**Estado:** en curso; sin publicación ni cambios operativos.
**Rama de integración:** `reconcile/vecidya-20261109`.

## Evidencia de integración

- PR #231: F07-L1/L2 (borrador local y replay transitorio).
- PR #232: contrato/ADR F07-L3.
- PR #236: implementación de finalización firmada F07-L3 integrada en `main@4ead64a0` según historial y PR #240.
- PR #240: actualización documental de ocho archivos, pendiente de resolver compatibilidad con la base actual; no debe fusionarse a la fuerza.

## Gate operativo pendiente

F07-L3 permanece **PARTIAL/fail-closed** hasta configurar y emparejar `keyId`, clave pública registrada y Worker Secret privado en el entorno objetivo, y repetir allí la prueba HTTP de firma/verificación. La integración del código no equivale a certificación ni despliegue. No almacenar claves privadas en Git.

## Ramas que requieren reconciliación antes de borrado remoto

1. `docs/diagnostic-v9-f07-l3-reconcile-20261108`: revisar los ocho archivos del PR #240 y aplicar solo actualizaciones documentales vigentes.
2. `feat/diagnostic-v9-f07-l3`: comparar semánticamente contra la implementación de PR #236 y rescatar diferencias exclusivas, si existen.
3. `docs/diag-v9-lexicon-logic-plan-04`: contrastar cambios del roadmap con la planificación vigente.
4. `feat/diagnostic-sector-taxonomy-02`: comprobar componentes, sectores, contratos y pruebas frente a `main`.

## Condiciones de cierre

- Verificar diferencias semánticas y CI de la rama de reconciliación.
- Fusionar a `main` solo cuando esté validado y aprobado.
- Confirmar commit de merge en `main` antes de borrar cualquier rama remota.
- Registrar por rama: integrada, sustituida o conservada con motivo.

## Avance comprobado — 2026-11-09

- PR #240: sus ocho parches documentales se trasladaron a la rama de reconciliación y se comprobó que los fragmentos resultantes están presentes (8/8). La PR original no se ha fusionado.
- `feat/diagnostic-v9-f07-l3`: los diez archivos principales de attestation/resultado/API/pruebas y los dos archivos de rutas revisados coinciden exactamente por SHA de blob con `main` (12/12). Falta contrastar documentación y cualquier cambio restante antes de borrar la rama.
- `feat/diagnostic-sector-taxonomy-02`: los tres módulos nuevos y sus tres pruebas coinciden exactamente por SHA de blob con `main` (6/6). `business-profile.tsx` y `vecidya-polish.css` difieren; requieren revisión semántica, no reemplazo directo.
- `docs/diag-v9-lexicon-logic-plan-04`: `ROADMAP.md` difiere de `main`; falta verificar si sus 58 líneas históricas ya fueron integradas o sustituidas.
- Estado de seguridad: sin merge a `main`, sin deploy, sin eliminación remota. PR #241 permanece en borrador.

## Resolución de diferencias semánticas — revisión adicional 2026-11-09

- **Taxonomía / perfil:** la rama antigua usa `BusinessSectorPicker` en `business-profile.tsx`, pero `main` emplea un selector nativo en un editor por pasos con campos ocultos/deshabilitados fuera del paso activo. No reemplazar el archivo actual por el antiguo: revertiría el contrato de navegación y guardado. La integración de `BusinessSectorPicker` en ese flujo es una decisión UX separada, con pruebas propias; se conserva como deuda, no como cherry-pick seguro.
- **Taxonomía / CSS:** las reglas `SECTOR-UX-03` del selector ya están presentes en `main` (bloque `.business-sector-picker`), aunque el SHA del archivo completo difiere por cambios posteriores. No copiar el CSS antiguo.
- **Léxico / ROADMAP:** `docs/diag-v9-lexicon-logic-plan-04` añade al principio un plan `DIAG-V9-LEX-GRAPH-04` de 2026-10-26 marcado `PLANNED, NO IMPLEMENTADO`, con tope histórico de **24** interacciones; la documentación V9 posterior registra **29**. No insertar el texto histórico como plan vigente ni declarar completados P0–P5. Conservar la rama hasta decidir si archivar/adaptar el plan al contrato actual.
- **Consecuencia:** los tres archivos divergentes están clasificados; ninguno es apto para sustitución completa automática. El cierre de estas ramas requiere decisión semántica y pruebas, no igualdad de SHA.

## MiniWeb/App Mini — inventario inicial verificado

- `feat/app-mini-imp-09`: compare muestra un commit histórico exclusivo pero ningún archivo diferente frente a la rama de reconciliación. Verificar historia de merge antes de borrado.
- `feat/app-mini-imp-10`: solo diferencias documentales en `PROJECT_STATE.md` y `STATUS.md`; requieren evaluación histórica.
- `feat/app-mini-v2a-variant-registry`, `feat/app-mini-v2b-dual-reader`, `feat/app-mini-v2c-visual-entitlements` y `feat/app-mini-v2d-verified-license-reader`: los cuatro módulos centrales respectivos coinciden exactamente por SHA de blob con `main`. Los tres primeros tienen diferencias documentales históricas; V2D conserva también pruebas a verificar.
- No inferir que una rama está completamente integrada solo porque un módulo coincide. Mantener todas las ramas remotas hasta revisión de pruebas, documentación y merge de PR #241.

## Lote adicional: seis ramas MiniWeb, Aprende y React 418 — 2026-11-09

- `feat/miniweb-v2-hours-contract`: `hours.ts` tiene SHA distinto al de `main`; comprobar evolución del contrato y tests antes de considerar rescate.
- `feat/miniweb-v2-section-contract-hours-isolation`: `sections.ts` difiere y `migrate.ts` no existe en `main` en esa ruta. No reintroducir migración sin análisis de arquitectura y dependencias.
- `feat/aprende-article-art-01`: `learn-illustrations.ts` coincide exactamente por SHA con `main`. Falta comprobar los demás archivos y recursos WebP.
- `fix/aprende-progress-controls`: comparar contra su sucesora `fix/aprende-progress-controls-main` y `main`; no fusionar ambas indiscriminadamente.
- `fix/aprende-progress-controls-main`: `learn-progress-controls.tsx` coincide exactamente con `main`. Faltan las rutas, estilos y pruebas.
- `fix/react-418-hydration-local-repro`: `platform-date-format.ts` difiere del contenido de `main`; revisar si el arreglo ya fue ampliado o reemplazado.

**Cierre del lote:** seis ramas inspeccionadas a nivel de comparación de commits; seis archivos centrales contrastados con SHA. No equivalen a seis ramas completamente reconciliadas. No se han ejecutado pruebas ni se ha autorizado borrado de ramas sin integración verificada.

## Administración y pruebas locales — lote de seis ramas

- `docs/admin-org-pagination-status`: un commit exclusivo; cambios documentales en seis archivos. Revisar actualidad antes de trasladar.
- `feat/platform-admin-org-access`: tres commits exclusivos, diferencias en ~40 archivos de aplicación, D1, consultas, documentación y pruebas; riesgo de sustituir arquitectura más reciente. No hacer merge automático.
- `fix/admin-audit-pagination`: un commit exclusivo; `internal-audit.tsx` difiere de `main`. Comprobar paginación actual y consulta SQL.
- `fix/admin-organizations-pagination`: un commit exclusivo, pero su diff incluye decenas de archivos de agentes, scripts, plantillas, recursos y `third_party/a-team`, además del cambio administrativo. **Rama de alto riesgo de contaminación de alcance**; no fusionar sin aislar y auditar archivos pertinentes.
- `fix/business-profile-section-scroll`: tres commits exclusivos; `business-profile.tsx` difiere de `main`. El editor actual por pasos impide sustituir el archivo antiguo sin revisión de navegación y guardado.
- `fix/local-platform-e2e`: 14 commits exclusivos; los archivos `app/features/miniweb/neighborhood.ts` y `tests/e2e/windows-job-runner.ps1` coinciden exactamente con `main`, pero los otros cambios no están certificados.

**Evidencia:** comparación de commits de seis ramas y SHA de seis archivos relevantes. No hubo merge a `main`, deploy, ni borrado remoto. Estas seis ramas no están declaradas completamente integradas.

## Recuperación documental MiniWeb V2 — 35/35 archivos

- `docs/miniweb-v2-auditoria-perfeccionista`: se trasladaron **35 archivos nuevos** desde `vecidya-platform/docs/auditorias/miniweb-v2/` a esta rama de reconciliación, preservando el contenido histórico sin modificar runtime, D1 ni R2.
- Evidencia destacada: plan de ocho fases, inventario V1/V2, registro MW2-001..039, matrices de permisos y pruebas, ensayos SQLite sobre migración 0045, CI y rollback. Los resultados son históricos y no equivalen a nueva certificación.
- `backup/miniweb-v2-pre-main-sync-20261029` y `docs/app-mini-master-plan-v1`: compare entre sí devuelve `identical` (0 ahead / 0 behind); duplican exactamente el mismo commit de referencia. No borrar aún hasta evaluar su documentación/artefactos no presentes en main.
- `docs/app-mini-v2-merge-reconcile-20261030`, `docs/chat-integration-reconcile`, `docs/release-0-8-5-20261028`, `docs/release-0-8-5-integrate` y `docs/release-0-9-0-20261028`: diffs predominantemente documentales históricos; pendiente cotejar vigencia.
- Estado tras rescate: 35 archivos de auditoría más ocho documentos V9 y este registro; **sin merge a main, sin pruebas CI nuevas, sin deploy ni borrado remoto**.

## Verificación correctiva de planes App Mini — 2026-11-09

- Se verificaron individualmente cinco archivos `plans/app-mini/`: `PLAN-V1.md`, `CONTRATO-VARIANTES-V2.md`, `SERVICIOS-PAGOS-PLAN-V1.md`, `prototypes/miniweb-tiers-comparison.html` y `prototypes/test-miniweb-tiers.mjs`. Sus SHA de blob coinciden exactamente en `main`, `reconcile/vecidya-20261109` y `docs/app-mini-master-plan-v1`. **Ya están integrados en main; no recrear ni sustituir.**
- Advertencia metodológica: `compare_commits` sobre ramas históricas divergadas mostró esos archivos como `added` aunque la consulta directa `fetch_file(ref=main)` confirmó su presencia con SHA idéntico. Para cierre, contrastar siempre blobs actuales y no interpretar la lista del compare como prueba de ausencia.
- La auditoría MiniWeb V2 recuperada conserva SHA idéntico a la rama fuente en muestras `README.md`, `PLAN-MAESTRO.md`, `HALLAZGOS.md` y `VERIFICACION-ZIP-V3-LIMPIO-Y-TRAZABILIDAD-2026-11-05.md`. La comprobación total 35/35 por SHA sigue pendiente, aunque los 35 archivos se crearon satisfactoriamente.

## Certificación de rescate documental y contraste Aprende — 2026-11-09

- Se cotejaron **35/35** archivos Markdown de `docs/miniweb-v2-auditoria-perfeccionista` contra `reconcile/vecidya-20261109` por SHA de blob. **35 MATCH, 0 MISMATCH**. Esto certifica copia documental idéntica, no pruebas de runtime ni D1.
- `feat/aprende-article-art-01`: `app/content/learn.ts` y `tests/unit/learn-content.test.ts` coinciden exactamente con `main`; `tests/e2e/aprende-public-qa-check.mjs` difiere respecto a esa rama antigua.
- `fix/aprende-progress-controls-main`: `app/app.css`, `app/components/learn-progress-controls.tsx`, `app/routes/learn-article.tsx` y `tests/e2e/aprende-public-qa-check.mjs` coinciden por SHA con `main`. La rama predecesora `fix/aprende-progress-controls` tiene una versión diferente del componente, superada por la posterior en estos archivos.
- Los recursos binarios WebP de Aprende no se pudieron verificar mediante `fetch_file`: el conector intenta decodificar como UTF-8 y devuelve `UnicodeDecodeError`. **No declarar imágenes verificadas** sin API de árbol Git/metadata binaria o checkout.
