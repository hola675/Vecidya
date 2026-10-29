# V9 — Decisiones editoriales propuestas: demanda y capacidad

**PLAN_ONLY · v1.0.0 · 2026-10-29**

## Alcance y fuentes

Inspección estática del banco candidato unificado V9. Fuentes: `qbv2-reviewed-context.ts` blob `2a12864d51e46529177fc39bc32814202fcaf3b9`; `qbv2-reviewed-operational-context.ts` blob `f16dff79f681612292144fae134239d43a916556`; `qa03b/bank.ts` blob `b4772d73e1d8b5044ba2011088db978c364097f0`. No se ejecutaron pruebas ni funciones.

## q2_demand_trend — KEEP condicional / HOLD de inferencias

Versión 2; tipo `single`; `routingRole=adaptive`; módulo `maturity`. Pregunta: «En los últimos meses, ¿cómo ha cambiado tu actividad?». Pista: clientes, ventas, citas o pedidos según negocio; evitar interpretar una sola semana. Variantes existentes: terminología clínica (pacientes/citas) y nonprofit (personas atendidas/apoyadas).

| value | Significado declarado | Señal producida |
|---|---|---|
| `increasing` | Ha aumentado | `demandTrend=increasing_observed` |
| `flat` | Similar | `demandTrend=flat_observed` |
| `decreasing` | Ha disminuido | `demandTrend=decreasing_observed` |
| `unknown` | No lo sé/no lo he revisado | `demandTrendUnknown=true` |

**Propuesta:** KEEP de identidad y opciones hasta revisión cognitiva. La dirección de actividad no es una prueba de madurez digital: demanda decreciente puede tener causas externas y creciente no prueba procesos digitales. No crear evidencia de puntuación por simple dirección. Validar significado por modalidad, especialmente proyectos sin transacciones y nonprofit. HOLD de cualquier nueva interpretación o `evidenceV3` sin revisión.

## q2_capacity_signal — KEEP condicional / HOLD de inferencias

Versión 2; tipo `multi`; `routingRole=adaptive`; módulo `maturity`. Pregunta: «En los últimos meses, ¿cuál de estas situaciones ha pasado en tu actividad?».

| value | Significado declarado | Señal producida |
|---|---|---|
| `capacity_pressure` | Más trabajo del que se puede atender bien | `reviewedCapacityPressure=true` |
| `capacity_expanded` | Más horarios, personal, espacio o recursos | `reviewedCapacityExpansion=true` |
| `stable` | Capacidad suficiente | `reviewedCapacityPressure=false` y `reviewedCapacityExpansion=false`; **excluyente** |
| `unknown` | No estoy seguro | `reviewedCapacityUnknown=true`; **excluyente** |

**Propuesta:** KEEP de selección múltiple para presión + expansión simultáneas. No equiparar expansión con mejora digital ni presión con debilidad digital. Revisar comprensión de «capacidad suficiente» cuando la actividad es baja; validar que `stable` no se combina con presión/expansión. HOLD de nuevas puntuaciones o cambios semánticos.

## Elegibilidad y versión

Ambas preguntas requieren `q2_regularity=regular` en su definición de origen. Además, `qa03b/bank.ts` las incluye en `historicalInteractionQuestions` y agrega guardia `q2_operational_status=operating` y `q2_has_customers=yes`. No trasladar conclusiones a prelaunch o pausa. Los IDs y versiones permanecen intactos mientras no se apruebe un cambio de significado.

## Cierre focal de las cuatro preguntas con revisión semántica

- `q2_demand_trend`: KEEP condicional; revisar significado por modalidad, sin inferir madurez digital.
- `q2_capacity_signal`: KEEP condicional; conservar multiselección y neutralidad.
- `q2_food_menu_visibility`: HOLD de semántica `not_applicable`; separar ausencia de canal de falta de oferta visible.
- `q2_ecommerce_cart_followup`: KEEP condicional de v2; conservar permiso de contacto y neutralidad.

Estas son **propuestas**, no aprobaciones humanas ni cambios del banco. La próxima puerta es revisar las demás filas de la matriz y probar cobertura por escenario solo cuando se autorice. Sin código, pruebas, CI ni despliegue.
