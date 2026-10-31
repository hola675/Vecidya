# V9 — Resolución focal de remote_service
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Evidencia
- qa03b/bank.ts: q2_delivery contiene remote_service sin produces, frente a modalidades canónicas con deliveryMode.
- signals.ts: CANONICAL_DELIVERY_MODES contiene physical_location, appointments, travels, online_checkout, retail y onsite; no contiene remote_service.
- signals.ts: DELIVERY_MODE_TO_ARCHETYPE asigna online_checkout a ecommerce y declara explícitamente que servicios remotos genéricos no tienen mapeo.
- qbv2-engine.ts: deriveSignalsV2 solo agrega las producciones de option.produces; si no existen, no emite señal.
- context-resolver.ts: resolve delivery utiliza deliveryModes y señales primarias, no convierte cualquier canal remoto en ecommerce.

## Conclusión
La ausencia de produces en remote_service es consistente con el contrato canónico vigente. No hay evidencia para tratarla como bug. La respuesta describe modalidad de interacción, pero no demuestra por sí misma arquetipo operativo ni checkout digital. No añadir produces sin decisión explícita de modelo.

## Criterios de aceptación propuestos
1. remote_service solo no produce deliveryMode ni ecommerce.
2. online_checkout explícito sí produce deliveryMode component=online_checkout y puede contribuir a ecommerce.
3. remote_service junto con appointments conserva únicamente las señales declaradas por appointments.
4. Un sector o monetización no debe transformarse implícitamente en modo de entrega.
5. Cambios de versión deben preservar valores y evitar inferir madurez digital por canal remoto.

## Estado
Lectura estática; no se ejecutaron pruebas ni se modificó código. Hallazgo anterior reclasificado: de anomalía a comportamiento coherente con el contrato, sujeto a confirmación focal.

## Changelog
0.1.0: resuelto análisis de remote_service y criterios de aceptación.