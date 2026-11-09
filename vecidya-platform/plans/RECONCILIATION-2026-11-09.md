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
