# Fase 00 — Bloqueos observados en CI (2026-10-18)

## Evidencia verificable

- [Run 39122181007](https://github.com/hola675/Vecidya/actions/runs/39122181007), commit `bc305fdd`: suite unitaria, build y migraciones D1 locales aprobaron.
- E2E 01B: `6/6 PASS`.
- E2E 01C.3: FAIL en `recovery reemite acceso sin volver a contar email_verified`: el endpoint de verificación devolvió un estado distinto de 200. **No se ha identificado todavía la causa raíz**. Revisar el código de emisión/consumo de challenges, el límite de solicitudes y los datos del fixture antes de modificar la aserción.
- Limpieza de datos personales D1 posterior a E2E: PASS. La comprobación actual **no demuestra por sí sola** que los agregados anónimos se hayan conservado: verificar explícitamente sus recuentos.
- Aislamiento productivo: FAIL porque el bundle de cliente `build/client/assets/diagnostic-CBfdrias.js` contiene la cadena `/__dev/diagnostico/`. Investigar el origen de la cadena y la inclusión en el bundle; **no eliminar la aserción sin demostrar que el código dev-only queda excluido**.

## Acciones de cierre (sin despliegue)

1. Reproducir la recuperación repetida en D1 local y registrar estado HTTP y cuerpo redactado, sin exponer tokens ni datos personales.
2. Rastrear la referencia `/__dev/diagnostico/` en el grafo de importaciones del cliente; retirar dependencias de desarrollo del bundle de producción y repetir el test de aislamiento.
3. Añadir verificación explícita de persistencia de agregados anónimos tras purgar PII en D1 local.
4. Resolver conflictos del PR #6 preservando cambios de `main` y de la rama de diagnóstico; validar unit/typecheck/build/E2E antes de integrar.
5. Mantener PR en draft y no hacer merge, deploy ni modificaciones remotas D1 hasta obtener autorización.

## Rama de conciliación

`integration/phase-00-main-reconcile` contiene copias sin conflicto de 10 archivos procedentes de `main`. Los documentos ARCHITECTURE, CHANGELOG, DATABASE, PROJECT_STATE, ROADMAP, STATUS y TESTING tienen cambios divergentes y requieren conciliación semántica, no sobrescritura.
