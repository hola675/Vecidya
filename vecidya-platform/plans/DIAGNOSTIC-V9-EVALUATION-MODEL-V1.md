# Diagnóstico V9 — Modelo de evaluación (propuesta)

Versión 0.1.0 | 2026-10-29 | PR #162 | Estado: pendiente de validación editorial y técnica.

## Fuentes revisadas
- app/features/diagnostic/qbv2-dimensions.ts
- app/features/diagnostic/qbv2-coverage.ts
- app/features/diagnostic/qa03b/v9-editorial-review-matrix.ts
- app/features/diagnostic/qa03b/v9-candidate-scoring.ts
- app/features/diagnostic/qa03b/v9-candidate-planner.ts
- docs/diagnostic-v9-question-answer-migration-protocol.md

## Dimensiones actuales y nombres sugeridos
| ID del código | Etiqueta V9 sugerida | Precaución |
|---|---|---|
| clarity_positioning | Claridad de la oferta | Claridad no equivale a ventas |
| digital_foundation | Presencia digital | Aplicabilidad por etapa |
| discovery | Descubrimiento y alcance | No exigir publicidad pagada |
| trust_reputation | Confianza y reputación | Sin reseñas no equivale a mala reputación |
| conversion_access | Contacto y siguiente acción | Conversión no equivale siempre a compra |
| relationship_recurrence | Relación y continuidad | No penalizar actividades sin recurrencia |
| measurement_optimization | Medición y mejora | No exigir herramientas complejas |
| digital_readiness | Capacidad de ejecución digital | No inferir salud general del negocio |

## Separación de conceptos
Contexto (sector, estado, modalidad, objetivos, comprador y beneficiario) define elegibilidad; no debe otorgar puntuación por sí solo. Evidencia directa, evidencia de apoyo y contexto deben conservar roles diferentes. Desconocido, ausencia, no aplicable, no publicado y falta de respuesta no son equivalentes. Si falta evidencia, reportar insuficiencia, no inventar cero.

## Correspondencia inicial con preguntas del código
| Dimensión | Ejemplos de preguntas existentes |
|---|---|
| Claridad | q2_retail_product_visibility; q2_b2b_qualification; q2_startup_problem_clarity |
| Presencia | q2_local_presence_consistency; q2_ecommerce_product_discovery |
| Descubrimiento | q2_local_discovery; q2_b2b_lead_source; q2_ecommerce_traffic_sources |
| Confianza | q2_reputation_flow; q2_professional_authority_signals |
| Contacto | q2_service_response_speed; q2_appointments_booking_friction; q2_ecommerce_checkout_friction |
| Relación | q2_appointments_rebooking; q2_ecommerce_cart_followup; q2_local_repeat_customers |
| Medición | q2_ecommerce_traffic_sources; q2_b2b_lead_source |
| Capacidad | q2_hospitality_peak_capacity; contexto q2_process_systemization |

Esta correspondencia es ilustrativa, NO la auditoría completa de 77 preguntas y 387 opciones. El contexto q2_process_systemization no prueba evidencia directa de capacidad.

## Dependencia técnica comprobada
v9-candidate-scoring.ts importa qbv2-contextual-scoring, qbv2-coverage, qbv2-dimensions, qbv2-evidence-v3, qbv2-candidate-calibration, qbv2-rules y qbv2-contract. v9-candidate-planner.ts también utiliza contratos y scoring QBV2. No declarar autonomía V9.

## Reglas candidatas de evaluación
1. Validar opciones y versiones; excluir respuestas inválidas tras cambiar sector o nicho.
2. Determinar aplicabilidad antes de puntuar.
3. Separar evidencia directa, apoyo y contexto; documentar cualquier doble lectura.
4. Tratar unknown, none, not_applicable, not_published y unanswered por separado.
5. Mostrar cobertura, confianza y contradicciones sin ocultar insuficiencia.
6. Priorizar por brecha, objetivo y factibilidad mediante reglas explicables; pesos y umbrales PENDIENTES.
7. Permitir planes útiles para negocios en preparación, sin inventar ventas.
8. Reproducir resultados con versiones del banco, reglas y calibración.

## Escenarios de prueba focalizados
Negocio local activo sin web; emprendimiento sin ventas; organización con beneficiarios distintos de compradores; servicios con citas; e-commerce sin permiso de seguimiento; restaurante sin oferta publicada; negocio en pausa; cambio de nicho; evidencias contradictorias o insuficientes.

## Decisiones pendientes
D01: conservar los ocho IDs y migrarlos a contratos V9 independientes. D02: aprobar etiquetas públicas. D03: definir cuándo usar score numérico frente a descripción cualitativa. D04: calibración y confianza. D05: orden de prioridades. D06: cobertura mínima para informe. Ninguna decisión se considera aprobada por la creación de este documento.

## Próximo lote editorial
Revisar q2_entity, q2_has_customers, q2_operational_status, q2_customer_buyer, q2_monetization, q2_regularity, q2_demand_trend y q2_capacity_signal. Extraer opciones, condiciones y evidencia antes de cambiar contratos. No tocar Aprende, MiniWeb ni GHL.

## Changelog
0.1.0: matriz de dimensiones, reglas y escenarios basada en código existente. Solo documentación; sin pruebas ejecutadas ni cambios runtime.
