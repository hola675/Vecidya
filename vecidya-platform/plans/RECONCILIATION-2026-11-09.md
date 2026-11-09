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
