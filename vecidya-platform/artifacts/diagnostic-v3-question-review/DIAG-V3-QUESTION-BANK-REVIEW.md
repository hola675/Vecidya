# DIAG-V3-QBANK-01 — Workbook de revisión humana del banco productivo

> Artefacto de trabajo temporal. Se genera desde el registro ejecutable `QUESTION_BANK_V2` y sus mappings/contratos asociados. No es documento canónico de producto y no contiene decisiones humanas finales. Las observaciones de auditoría se tratan como candidatos; el código ejecutable prevalece.

## Pre-flight ejecutable

| Campo | Valor | Evidencia |
| --- | --- | --- |
| Rama | `main` | GIT |
| HEAD | `ff81c2d4e4f406b99e55c3e2530c0b8ea96ad5d2` | GIT, corte de generación |
| Working tree | Limpio en el pre-flight inicial; al cierre se observaron cambios locales no relacionados y se preservaron | GIT |
| Versión de aplicación | `0.6.1` | CODE: `package.json` |
| Versión de diagnóstico contractual | `2.0` | CODE: `CURRENT_DIAGNOSTIC_VERSION` |
| Versión del planner | `2` | CODE: `ADAPTIVE_PLANNER_VERSION` |
| Schema de sesión V3 | `2` | CODE: `DIAGNOSTIC_SESSION_V3_SCHEMA` |
| Question bank productivo | `QUESTION_BANK_V2`, registro QBV2 experimental; versión persistida actual `1` | CODE: `qbv2-bank.ts`, `contracts.ts` |
| Preguntas productivas | `85` | CODE/TEST: filtro sin `purpose: confirmation` |
| Fixtures-only excluidas | `2`: `q2_confirm_primary_friction`, `q2_confirm_hybrid_friction` | CODE: `PRODUCTION_GOLDEN_QUESTIONS_V2` |
| Scoring version | `1` persistida; scoring contextual V3 usa `ANSWER_SEMANTICS`/`SCORING_MODEL` | CODE |
| Routing version | `1` | CODE: `contracts.ts` |
| Overall index version | `2` | CODE: `qbv2-overall.ts` |
| Methodology version | `3.0` | CODE: `qbv2-methodology.ts` |
| Hard cap | `24` preguntas por ruta | CODE: `ROUTE_HARD_CAP` |

### Discrepancias de versión que no se corrigen

La documentación de estado puede referir una versión local DIAG-V3 `0.6.0`, pero el ejecutable actual en `package.json` es `0.6.1`. Para este workbook se reporta el valor ejecutable. Asimismo, el banco productivo de 85 preguntas está registrado como `QUESTION_BANK_V2`, mientras `CURRENT_QUESTION_BANK_VERSION` persistida sigue en `1`; no se modifica ninguna de las dos capas.

### Cambios locales no relacionados observados al cierre

Se preservaron sin editar: `app/app.css`, `app/components/diagnostic-flow/diagnostic-flow.tsx`, `app/components/diagnostic-report/diagnostic-report.tsx`, `app/components/diagnostic-result/action-path.tsx`, `app/components/diagnostic-result/diagnostic-result.tsx`, `app/features/diagnostic/commercial-recommendation.ts`, `app/features/diagnostic/qbv2-session.ts`, `app/routes/addons.tsx`, `app/routes/diagnostico-informe.tsx`, `app/routes/home.tsx`, `app/routes/licenses.tsx`, `app/routes/services.tsx`, `tests/unit/diagnostic/commercial-recommendation.test.ts` y `tests/unit/diagnostic/diagnostic-report.test.ts`. El único cambio creado por esta tarea es el artefacto de revisión bajo `artifacts/`.

## Fuentes ejecutables inspeccionadas

- `app/features/diagnostic/qbv2-bank.ts` y `qbv2-golden.ts`
- `qbv2-lote-a.ts` … `qbv2-lote-g.ts`
- `qbv2-contract.ts`, `qbv2-engine.ts`, `qbv2-rules.ts`
- `qbv2-coverage.ts`, `qbv2-contextual-scoring.ts`, `qbv2-language.ts`
- `qbv2-planner.ts`, `qbv2-session.ts`, `qbv2-overall.ts`, `qbv2-methodology.ts`
- `contracts.ts` y exportaciones del barrel diagnóstico
- tests unitarios QBV2 de architecture, coverage, language, answer-scale, planner, routing, completion, lotes y sesión
- La auditoría editorial previa solo se refleja como metadata candidata de `QUESTION_LANGUAGE`; no se usa como fuente de labels ni reglas.

## Índice navegable

| # | ID | Short topic | Current response type | Primary function | Primary dimension | Preliminary status | Human review status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | [`q2_entity`](#01-q2_entity) | ¿Qué describe mejor lo que vas a diagnosticar? | SINGLE_SELECT | context | Contextual / routing | KEEP + REWRITE | CERRADA |
| 02 | [`q2_other_staff`](#02-q2_other_staff) | ¿Tienes a alguien más trabajando contigo de forma continua (emple… | SINGLE_SELECT | context, routing, commercial | Contextual / routing | KEEP + REWRITE | CERRADA |
| 03 | [`q2_monetization`](#03-q2_monetization) | ¿Cuál es (o será) tu principal fuente de ingresos? | SINGLE_SELECT | context, commercial | Contextual / routing | KEEP + REWRITE RESPONSES | CERRADA |
| 04 | [`q2_delivery`](#04-q2_delivery) | La forma principal en que lo que ofreces llega a quien lo recibe. | SINGLE_SELECT | context, commercial | Contextual / routing | REDESIGN + MULTI_SELECT | CERRADA CON REDISEÑO |
| 05 | [`q2_has_customers`](#05-q2_has_customers) | Si ya existe actividad real con las personas a las que se dirige … | SINGLE_SELECT | context | Contextual / routing | KEEP + REWRITE | CERRADA |
| 06 | [`q2_regularity`](#06-q2_regularity) | ¿Con qué regularidad tienes actividad con clientes (ventas, servi… | SINGLE_SELECT | context, routing | Contextual / routing | KEEP + REDESIGN ANSWERS | CERRADA |
| 07 | [`q2_demand_trend`](#07-q2_demand_trend) | En los últimos meses, ¿cómo ha cambiado la cantidad de clientes o… | SINGLE_SELECT | context, routing | Contextual / routing | KEEP + REWRITE + ADD_UNKNOWN + DEFER_TO_ADAPTIVE | CERRADA |
| 08 | [`q2_goal`](#08-q2_goal) | Lo principal que quieres mejorar ahora mismo. | SINGLE_SELECT | context | Contextual / routing | KEEP + REWRITE + ADD_OTHER | CERRADA |
| 09 | [`q2_friction`](#09-q2_friction) | El obstáculo que más pesa hoy, según tu experiencia. | SINGLE_SELECT | context | Contextual / routing | KEEP + REWRITE + ADD_UNKNOWN + DEFER_TO_ADAPTIVE | CERRADA |
| 10 | [`q2_appointments_noshow`](#10-q2_appointments_noshow) | ¿Qué tan seguido tus clientes faltan a su cita? | SINGLE_SELECT | context, routing | Contextual / routing | KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX | CERRADA |
| 11 | [`q2_ecommerce_traffic_sources`](#11-q2_ecommerce_traffic_sources) | Qué fuentes traen visitas o pedidos de forma habitual. | MULTI_SELECT | supporting, routing | Discovery | KEEP + REWRITE + KEEP_MULTI_SELECT | CERRADA |
| 12 | [`q2_b2b_pipeline`](#12-q2_b2b_pipeline) | Si existe un proceso definido para dar seguimiento a cada oportun… | SINGLE_SELECT | direct evidence, routing | Digital Readiness | KEEP + REWRITE + ADD_INTERMEDIATE + ROUTING_FIX | CERRADA |
| 13 | [`q2_local_foot_traffic`](#13-q2_local_foot_traffic) | Qué parte de quienes llegan al local lo hace por pasar cerca, sin… | SINGLE_SELECT | direct evidence, routing | Discovery | KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 14 | [`q2_sector`](#14-q2_sector) | ¿En qué sector o tipo de actividad encaja mejor lo que haces? | SINGLE_SELECT | context | Contextual / routing | KEEP + REWRITE + CLEAN_TAXONOMY | CERRADA |
| 15 | [`q2_customer_reach`](#15-q2_customer_reach) | ¿Hasta dónde llegan geográficamente tus clientes? | SINGLE_SELECT | context, commercial | Contextual / routing | KEEP + REWRITE | CERRADA |
| 16 | [`q2_customer_buyer`](#16-q2_customer_buyer) | ¿A quién se dirige principalmente lo que ofreces? | SINGLE_SELECT | context, commercial | Contextual / routing | KEEP + REWRITE | CERRADA |
| 17 | [`q2_process_systemization`](#17-q2_process_systemization) | Si las tareas habituales se hacen siempre de la misma forma o dep… | SINGLE_SELECT | context, routing | Contextual / routing | KEEP + REWRITE + DEFER_TO_ADAPTIVE | CERRADA |
| 18 | [`q2_capacity_signal`](#18-q2_capacity_signal) | Si en los últimos meses te ha faltado capacidad o la has tenido q… | MULTI_SELECT | context, routing | Contextual / routing | KEEP + REWRITE + KEEP_MULTI_SELECT + DEFER_TO_ADAPTIVE | CERRADA |
| 19 | [`q2_local_discovery`](#19-q2_local_discovery) | Por qué vía te descubre por primera vez la gente nueva de tu zona. | SINGLE_SELECT | direct evidence, supporting, routing, deepening | Discovery | KEEP + REWRITE + ADD_MIXED + ADD_OTHER + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 20 | [`q2_local_presence_consistency`](#20-q2_local_presence_consistency) | Si los datos básicos para encontrarte y contactarte están correct… | SINGLE_SELECT | direct evidence, supporting, routing | Digital Foundation | KEEP + REWRITE + ROUTING_REVIEW | CERRADA |
| 21 | [`q2_local_repeat_customers`](#21-q2_local_repeat_customers) | De las personas que ya te compraron o visitaron una vez, ¿regresa… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_REVIEW | CERRADA |
| 22 | [`q2_reputation_flow`](#22-q2_reputation_flow) | Si llegan opiniones nuevas de personas satisfechas que otros pued… | SINGLE_SELECT | direct evidence, routing, deepening | Trust & Reputation | KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 23 | [`q2_service_area_clarity`](#23-q2_service_area_clarity) | ¿Tienes definida la zona hasta donde te conviene desplazarte para… | SINGLE_SELECT | context, routing | Contextual / routing | REMOVE_CANDIDATE | CERRADA → PROPUESTA DE ELIMINACIÓN |
| 24 | [`q2_service_response_speed`](#24-q2_service_response_speed) | Cuando alguien te contacta por primera vez pidiendo tu servicio, … | SINGLE_SELECT | direct evidence, routing | Conversion & Access | KEEP + REWRITE + ROUTING_FIX | CERRADA |
| 25 | [`q2_service_quote_practice`](#25-q2_service_quote_practice) | ¿Sueles dar una cotización o estimado antes de hacer el trabajo? | SINGLE_SELECT | context, routing | Contextual / routing | REMOVE + MERGE_WITH_26 | CERRADA → ELIMINAR Y FUSIONAR |
| 26 | [`q2_service_quote_followup`](#26-q2_service_quote_followup) | Después de dar una cotización, si la persona no responde enseguid… | SINGLE_SELECT | direct evidence, routing | Conversion & Access | KEEP + REWRITE + MERGE_APPLICABILITY_FROM_Q25 + DEFER_TO_ADAPTIVE | CERRADA |
| 27 | [`q2_service_repeat_referral`](#27-q2_service_repeat_referral) | Si los clientes atendidos vuelven a llamar o recomiendan el servi… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | REMOVE | CERRADA → ELIMINAR |
| 28 | [`q2_appointments_booking_method`](#28-q2_appointments_booking_method) | Cómo se agenda hoy la mayoría de las citas. | SINGLE_SELECT | direct evidence, routing | Conversion & Access | REMOVE | CERRADA → ELIMINAR |
| 29 | [`q2_appointments_booking_friction`](#29-q2_appointments_booking_friction) | ¿Qué tan seguido cuesta encontrar un horario que le sirva a la pe… | SINGLE_SELECT | direct evidence, routing | Conversion & Access | KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 30 | [`q2_appointments_confirmation_reminders`](#30-q2_appointments_confirmation_reminders) | ¿Envías confirmaciones o recordatorios antes de la cita? | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP + REWRITE + COLLAPSE_AUTOMATION_METHOD + ADD_UNKNOWN + ADD_NOT_APPLICABLE + DEFER_TO_ADAPTIVE + ROUTING_FIX | CERRADA |
| 31 | [`q2_appointments_lead_to_booking`](#31-q2_appointments_lead_to_booking) | Qué parte de quienes preguntan por una cita termina agendándola. | SINGLE_SELECT | direct evidence, routing | Conversion & Access | KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 32 | [`q2_appointments_rebooking`](#32-q2_appointments_rebooking) | Cuando el servicio requiere que la persona vuelva (seguimiento, m… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 33 | [`q2_professional_authority_signals`](#33-q2_professional_authority_signals) | Si alguien que no te conoce encuentra pruebas para confiar antes … | SINGLE_SELECT | direct evidence, routing, deepening | Trust & Reputation | KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX | CERRADA |
| 34 | [`q2_professional_intake_flow`](#34-q2_professional_intake_flow) | Qué pasa entre el primer interés y el inicio del trabajo. | SINGLE_SELECT | direct evidence, supporting, routing | Clarity & Positioning | KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX | CERRADA |
| 35 | [`q2_professional_referral_dependency`](#35-q2_professional_referral_dependency) | Qué tanto dependen los clientes nuevos de recomendaciones persona… | SINGLE_SELECT | direct evidence, routing | Discovery | KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_SUPPORTING | CERRADA |
| 36 | [`q2_professional_followup_after_consult`](#36-q2_professional_followup_after_consult) | Después de una consulta o primera llamada, si la persona no respo… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | REMOVE + COVER_BY_Q2_FOLLOWUP_GENERAL_PROCESS | CERRADA → ELIMINAR |
| 37 | [`q2_retail_product_visibility`](#37-q2_retail_product_visibility) | ¿Alguien que quiera comprarte puede saber qué vendes y si está di… | SINGLE_SELECT | direct evidence, supporting, routing | Clarity & Positioning | KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE + REMOVE_AVAILABILITY_CONSTRUCT | CERRADA |
| 38 | [`q2_retail_customer_capture`](#38-q2_retail_customer_capture) | Después de que alguien te compra, ¿te queda alguna forma de volve… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP + REWRITE + ADD_NOT_APPLICABLE + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 39 | [`q2_retail_promotions`](#39-q2_retail_promotions) | Si las ofertas llegan a clientes que no están en la tienda en ese… | SINGLE_SELECT | direct evidence, routing | Discovery | REMOVE | CERRADA → ELIMINAR |
| 40 | [`q2_ecommerce_product_discovery`](#40-q2_ecommerce_product_discovery) | Si quien entra a la tienda en línea encuentra lo que busca sin ay… | SINGLE_SELECT | direct evidence, supporting, routing | Digital Foundation | REWRITE | PENDIENTE |
| 41 | [`q2_ecommerce_checkout_friction`](#41-q2_ecommerce_checkout_friction) | Si quien decide comprar logra terminar el pago. | SINGLE_SELECT | direct evidence, routing | Conversion & Access | KEEP | PENDIENTE |
| 42 | [`q2_ecommerce_cart_visibility`](#42-q2_ecommerce_cart_visibility) | ¿Tu tienda en línea te permite saber cuándo alguien deja producto… | SINGLE_SELECT | direct evidence, routing | Measurement & Optimization | REMOVE | CERRADA → ELIMINAR |
| 43 | [`q2_ecommerce_cart_followup`](#43-q2_ecommerce_cart_followup) | De esas personas que dejan productos sin comprar, ¿les das seguim… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | REMOVE | CERRADA → ELIMINAR |
| 44 | [`q2_ecommerce_repeat_purchase`](#44-q2_ecommerce_repeat_purchase) | Con qué frecuencia un mismo cliente vuelve a comprar. | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP + REWRITE + DEFER_TO_ADAPTIVE | CERRADA |
| 45 | [`q2_ecommerce_acquisition_dependency`](#45-q2_ecommerce_acquisition_dependency) | Si los pedidos dependen de un único canal. | SINGLE_SELECT | direct evidence, routing | Discovery | KEEP + REWRITE + DEFER_TO_ADAPTIVE + DIRECT_TO_SUPPORTING | CERRADA |
| 46 | [`q2_hospitality_flow_type`](#46-q2_hospitality_flow_type) | ¿Cómo suele llegar la mayoría de tus clientes? | SINGLE_SELECT | context, routing | Contextual / routing | REMOVE + MERGE_APPLICABILITY_INTO_Q2_HOSPITALITY_RESERVATION_NOSHOW | CERRADA → ELIMINAR |
| 47 | [`q2_hospitality_reservation_noshow`](#47-q2_hospitality_reservation_noshow) | ¿Qué tan seguido las personas no se presentan a una reserva? | SINGLE_SELECT | context, routing | Contextual / routing | KEEP + REWRITE + MERGE_APPLICABILITY_FROM_Q46 + ADD_UNKNOWN + ADD_NOT_APPLICABLE + DEFER_TO_ADAPTIVE | CERRADA |
| 48 | [`q2_hospitality_peak_capacity`](#48-q2_hospitality_peak_capacity) | En tus horas o días de más demanda, ¿qué tan seguido tienes que r… | SINGLE_SELECT | direct evidence, routing | Digital Readiness | REMOVE + COVER_BY_Q2_CAPACITY_SIGNAL | CERRADA → ELIMINAR |
| 49 | [`q2_hospitality_delivery_takeaway`](#49-q2_hospitality_delivery_takeaway) | Qué formas de consumir fuera del local ofrece hoy el negocio. | SINGLE_SELECT | direct evidence, routing | Conversion & Access | REMOVE | CERRADA → ELIMINAR |
| 50 | [`q2_b2b_lead_source`](#50-q2_b2b_lead_source) | Por qué vía llegan con más frecuencia las oportunidades de negocio. | SINGLE_SELECT | direct evidence, supporting, routing | Discovery | KEEP + REWRITE + ADD_MIXED + ADD_OTHER + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_CONTEXTUAL_SUPPORTING + REMOVE_MEASUREMENT_INFERENCE | CERRADA |
| 51 | [`q2_b2b_qualification`](#51-q2_b2b_qualification) | Cuando una empresa muestra interés, ¿tienes una forma de distingu… | SINGLE_SELECT | direct evidence, supporting, routing | Clarity & Positioning | KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + REMOVE_CLARITY_DIRECT + KEEP_CONVERSION_SUPPORTING + REMOVE_GENERIC_FRICTION | CERRADA |
| 52 | [`q2_b2b_status_visibility`](#52-q2_b2b_status_visibility) | De tus oportunidades activas ahora mismo, ¿sabes en qué estado es… | SINGLE_SELECT | direct evidence, routing | Digital Readiness | KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + REFINE_SIGNAL | CERRADA |
| 53 | [`q2_b2b_sales_cycle`](#53-q2_b2b_sales_cycle) | Cuántos contactos suele requerir cerrar una venta. | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP + REWRITE + RECLASSIFY_AS_CONTEXT + DEFER_TO_ADAPTIVE + ROUTING_FIX | CERRADA |
| 54 | [`q2_b2b_decision_makers`](#54-q2_b2b_decision_makers) | ¿Normalmente decide una sola persona, o participan varias persona… | SINGLE_SELECT | supporting, routing | Conversion & Access | REMOVE | CERRADA → ELIMINAR |
| 55 | [`q2_creator_channel_concentration`](#55-q2_creator_channel_concentration) | Cuánto depende el alcance de la audiencia de un solo canal. | SINGLE_SELECT | direct evidence, routing, commercial | Discovery | KEEP + REWRITE + DEFER_TO_ADAPTIVE + DIRECT_TO_SUPPORTING_CONTEXTUAL | CERRADA |
| 56 | [`q2_creator_audience_ownership`](#56-q2_creator_audience_ownership) | Más allá de la plataforma donde te siguen, ¿tienes una forma prop… | SINGLE_SELECT | direct evidence, routing, commercial | Relationship & Recurrence | KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 57 | [`q2_creator_content_consistency`](#57-q2_creator_content_consistency) | ¿Qué tan seguido publicas o produces contenido nuevo? | SINGLE_SELECT | supporting, routing, commercial | Discovery | REMOVE | CERRADA → ELIMINAR |
| 58 | [`q2_creator_monetization_model`](#58-q2_creator_monetization_model) | ¿De qué forma principal monetizas tu audiencia? | SINGLE_SELECT | direct evidence, routing, commercial | Digital Readiness | REMOVE_FROM_DIAGNOSTIC | CERRADA → ELIMINAR |
| 59 | [`q2_creator_conversion`](#59-q2_creator_conversion) | De las personas que siguen tu contenido, ¿qué tan seguido das el … | SINGLE_SELECT | direct evidence, routing, commercial | Conversion & Access | REMOVE | CERRADA → ELIMINAR |
| 60 | [`q2_nonprofit_support_type`](#60-q2_nonprofit_support_type) | ¿Cómo se sostiene principalmente tu organización? | SINGLE_SELECT | context, routing, commercial | Contextual / routing | KEEP + REWRITE + ADD_OTHER + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 61 | [`q2_nonprofit_donation_clarity`](#61-q2_nonprofit_donation_clarity) | Si apoyar económicamente es fácil para alguien que ya quiere hace… | SINGLE_SELECT | direct evidence, supporting, routing, commercial | Clarity & Positioning | KEEP + REWRITE + DEFER_TO_ADAPTIVE + REFINE_SIGNAL | CERRADA |
| 62 | [`q2_nonprofit_membership_lifecycle`](#62-q2_nonprofit_membership_lifecycle) | Si unirse y renovar la membresía sigue un camino claro y repetible. | SINGLE_SELECT | direct evidence, routing, commercial | Digital Readiness | KEEP + REWRITE + DEFER_TO_ADAPTIVE | CERRADA |
| 63 | [`q2_nonprofit_participation`](#63-q2_nonprofit_participation) | ¿Qué tan seguido las personas de tu comunidad participan activame… | SINGLE_SELECT | context, routing, commercial | Contextual / routing | REMOVE | CERRADA → ELIMINAR |
| 64 | [`q2_operations_process_ownership`](#64-q2_operations_process_ownership) | Cuando hay que hacer una tarea importante que se repite, ¿está cl… | SINGLE_SELECT | supporting, routing | Digital Readiness | KEEP + REWRITE + ADD_NOT_APPLICABLE + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 65 | [`q2_operations_handoffs`](#65-q2_operations_handoffs) | Cuando un trabajo pasa por más de una persona (por ejemplo, de qu… | SINGLE_SELECT | supporting, routing | Digital Readiness | KEEP + REWRITE + ADD_INTERMEDIATE + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 66 | [`q2_operations_bottleneck`](#66-q2_operations_bottleneck) | ¿Qué es lo que más limita tu capacidad para atender más trabajo a… | SINGLE_SELECT | supporting, routing | Digital Readiness | KEEP + REWRITE + RECLASSIFY_AS_CONTEXT_ROUTING + ADD_OTHER + ADD_COORDINATION + ROUTING_FIX + DEFER_TO_ADAPTIVE | CERRADA |
| 67 | [`q2_operations_manual_impact`](#67-q2_operations_manual_impact) | Cuánto te cuesta hoy el trabajo manual y repetitivo, sumando tiem… | SINGLE_SELECT | supporting, routing | Digital Readiness | KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE + CHANGE_TO_CONSTRAINT_EVIDENCE | CERRADA |
| 68 | [`q2_operations_dependency`](#68-q2_operations_dependency) | Si tú (o la persona clave) no pudieras trabajar durante dos seman… | SINGLE_SELECT | supporting, routing | Digital Readiness | KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE + TEAM_ONLY + CHANGE_TO_DEPENDENCY_EVIDENCE | CERRADA |
| 69 | [`q2_followup_general_process`](#69-q2_followup_general_process) | Cómo se retoma un pendiente o un siguiente paso para que no se pi… | SINGLE_SELECT | direct evidence, supporting, routing, deepening | Relationship & Recurrence | KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + REMOVE_METHOD_BIAS + REFINE_SIGNALS | CERRADA |
| 70 | [`q2_followup_ownership`](#70-q2_followup_ownership) | Cuando hay más de una persona involucrada, ¿está claro quién debe… | SINGLE_SELECT | direct evidence, supporting, routing | Relationship & Recurrence | KEEP + REWRITE + ADD_INTERMEDIATE + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_SUPPORTING + REMOVE_SECOND_CONSTRUCT | CERRADA |
| 71 | [`q2_followup_status_visibility`](#71-q2_followup_status_visibility) | Si los pendientes se repasan de forma activa para que ninguno que… | SINGLE_SELECT | direct evidence, supporting, routing, deepening | Relationship & Recurrence | KEEP + MAJOR_REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_SUPPORTING + CHANGE_CONSTRUCT_TO_VISIBILITY | CERRADA |
| 72 | [`q2_measurement_source_confidence`](#72-q2_measurement_source_confidence) | Si sabes por qué vía llegó cada persona nueva que empezó a trabaj… | SINGLE_SELECT | direct evidence, routing | Measurement & Optimization | KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN | CERRADA |
| 73 | [`q2_measurement_outcome_tracking`](#73-q2_measurement_outcome_tracking) | Si podrías estimar qué parte de tus contactos termina en un resul… | SINGLE_SELECT | direct evidence, routing | Measurement & Optimization | KEEP + MAJOR_REWRITE + FIX_RESPONSE_OVERLAP + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN | CERRADA |
| 74 | [`q2_measurement_decision_review`](#74-q2_measurement_decision_review) | Si los resultados se revisan contra un periodo anterior para deci… | SINGLE_SELECT | direct evidence, routing | Measurement & Optimization | KEEP + MAJOR_REWRITE + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN + CHANGE_FREQUENCY_TO_DECISION_USE | CERRADA |
| 75 | [`q2_startup_problem_clarity`](#75-q2_startup_problem_clarity) | Cuando explicas este proyecto, ¿puedes decir qué problema concret… | SINGLE_SELECT | direct evidence, supporting, routing | Clarity & Positioning | KEEP + REWRITE + REMOVE_CONVERSION_SUPPORTING + KEEP_AS_STARTUP_CORE | CERRADA |
| 76 | [`q2_startup_validation_evidence`](#76-q2_startup_validation_evidence) | Qué has comprobado sobre el problema hablando o probando con pers… | SINGLE_SELECT | supporting, routing | Clarity & Positioning | KEEP + MAJOR_REWRITE + RECLASSIFY_AS_CONTEXT_CONFIDENCE + DEFER_TO_ADAPTIVE + REMOVE_SCORING | CERRADA |
| 77 | [`q2_startup_offer_readiness`](#77-q2_startup_offer_readiness) | Si ya existe algo concreto que una persona podría aceptar o recha… | SINGLE_SELECT | direct evidence, supporting, routing | Clarity & Positioning | KEEP + REWRITE + REMOVE_CONVERSION_SUPPORTING + KEEP_AS_STARTUP_CORE | CERRADA |
| 78 | [`q2_startup_demand_signal`](#78-q2_startup_demand_signal) | Cuál es el paso más concreto que alguien ya dio hacia lo que ofre… | SINGLE_SELECT | supporting, routing | Conversion & Access | KEEP + REWRITE + MERGE_PAID_TRIAL_AND_COMMITMENT + RECLASSIFY_AS_CONTEXT + DEFER_TO_ADAPTIVE + REMOVE_SCORING | CERRADA |
| 79 | [`q2_startup_first_channel`](#79-q2_startup_first_channel) | ¿Tienes claro por qué canal intentarías llegar primero a las pers… | SINGLE_SELECT | supporting, routing | Discovery | KEEP + MAJOR_REWRITE + CHANGE_CONSTRUCT + DEFER_TO_ADAPTIVE | CERRADA |
| 80 | [`q2_startup_next_milestone`](#80-q2_startup_next_milestone) | ¿Cuál es el siguiente hito que demostraría que el proyecto avanzó… | SINGLE_SELECT | context, routing | Contextual / routing | REMOVE + DERIVE_NEXT_MILESTONE_FROM_EVIDENCE | CERRADA → ELIMINAR |
| 81 | [`q2_conversion_interest_to_action`](#81-q2_conversion_interest_to_action) | Si el interés que ya llega termina en un paso concreto: una compr… | SINGLE_SELECT | direct evidence, routing, deepening | Conversion & Access | KEEP + MAJOR_REWRITE + CHANGE_CONSTRUCT + DEFER_TO_ADAPTIVE + REFINE_ROUTING + REFINE_SIGNAL | CERRADA |
| 82 | [`q2_operations_information_base`](#82-q2_operations_information_base) | Si existe una base digital sobre la que organizar el trabajo y cr… | SINGLE_SELECT | direct evidence, routing, deepening | Digital Readiness | KEEP + MAJOR_REWRITE + CHANGE_CONSTRUCT + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN + REMOVE_TOOL_BIAS | CERRADA |
| 83 | [`q2_operations_automation_adoption`](#83-q2_operations_automation_adoption) | Qué parte del trabajo repetitivo ya se sostiene sin intervención … | SINGLE_SELECT | direct evidence, routing, deepening | Digital Readiness | REMOVE | CERRADA → ELIMINAR |
| 84 | [`q2_presence_offer_clarity`](#84-q2_presence_offer_clarity) | Si alguien de fuera entiende la oferta sin explicación adicional. | SINGLE_SELECT | direct evidence, routing, deepening | Clarity & Positioning | KEEP + MAJOR_REWRITE + REMOVE_MULTIPLE_CONSTRUCTS + DEFER_TO_ADAPTIVE + ROUTING_REFINEMENT | CERRADA |
| 85 | [`q2_presence_digital_base`](#85-q2_presence_digital_base) | Si existe una base digital propia que controlas y mantienes al día. | SINGLE_SELECT | direct evidence, routing, deepening | Digital Foundation | KEEP + MAJOR_REWRITE + REMOVE_OWNERSHIP_BIAS + DEFER_TO_ADAPTIVE + USE_AS_DIGITAL_FOUNDATION_FALLBACK | CERRADA |

## Convenciones de lectura

- Las opciones y prompts base/variant se copian del código. `Option ID` y `Valor ejecutable` conservan el identificador interno aunque coincidan.
- `DIRECT`, `SUPPORTING`, `CONTEXTUAL` provienen de `EVIDENCE_MAPPING` y `EVIDENCE_DIRECTNESS`; no son una reinterpretación editorial.
- `ROUTING_DEFECT_CANDIDATE` identifica el patrón ejecutable solicitado; no implica que se haya corregido.
- Las evaluaciones preliminares del agente son ayudas de triage, no decisiones de Yoan/ChatGPT.

## 01 — `q2_entity`

### 1. Pregunta actual

¿Qué describe mejor lo que vas a diagnosticar?

- Copy canónico ejecutable: versión semántica `1`, módulo `core`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `individual` | `individual` | Mi trabajo como profesional o persona independiente | produce {"kind":"entity","value":"individual","provenance":"explicit_declaration"} |
| `business` | `business` | Un negocio en funcionamiento | produce {"kind":"entity","value":"business","provenance":"explicit_declaration"} |
| `organization` | `organization` | Una organización sin fines de lucro o comunidad | produce {"kind":"entity","value":"organization","provenance":"explicit_declaration"} |
| `project` | `project` | Un proyecto o idea que todavía no está en marcha | produce {"kind":"entity","value":"project","provenance":"explicit_declaration"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Sin regla local: es elegible cuando el planner considera relevante su módulo.

Puede aparecer desde el conjunto inicial de elegibles del banco. No hay condición local que la bloquee; el presupuesto, el módulo y el planner pueden posponerla. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `core` y declara los propósitos `anchor, classification`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

business context and operational capacity

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Opciones con señales: entity=individual, entity=business, entity=organization, entity=project.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `individual` → {"option":"individual","kind":"entity","value":"individual","provenance":"explicit_declaration"}
- `business` → {"option":"business","kind":"entity","value":"business","provenance":"explicit_declaration"}
- `organization` → {"option":"organization","kind":"entity","value":"organization","provenance":"explicit_declaration"}
- `project` → {"option":"project","kind":"entity","value":"project","provenance":"explicit_declaration"}

### 9. Relación con otras preguntas

- `q2_sector`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_delivery`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_demand_trend`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «¿Quién responde?» no coincidía con opciones que describen qué se diagnostica.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Si trabajas por tu cuenta, elige la primera opción aunque uses un nombre comercial.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE` exclusivamente editorial, sin cambio semántico ni de IDs.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE COPY`

Decisión final:
`KEEP + REWRITE`

Pregunta final:
`¿Qué quieres evaluar hoy?`

Respuestas finales:

| Option ID | Texto final para el usuario |
| --- | --- |
| `individual` | Mi trabajo como independiente o profesional |
| `business` | Un negocio que ya está funcionando |
| `organization` | Una organización o comunidad sin fines de lucro |
| `project` | Un proyecto o idea que todavía estoy preparando |

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE_CANDIDATE`.
- Multiselección: `NO`.
- Unknown: `NO`.
- No aplica: `NO`.
- Cambio semántico: `NO`.
- Conservar los IDs, la función de routing y la lógica actual.
- Mantener la pista: «Si trabajas por tu cuenta, elige la primera opción aunque uses un nombre comercial.»
- El cambio es editorial, orientado a un lenguaje más natural para público hispanohablante latinoamericano.

## 02 — `q2_other_staff`

### 1. Pregunta actual

¿Tienes a alguien más trabajando contigo de forma continua (empleado o colaborador pagado)?

- Copy canónico ejecutable: versión semántica `1`, módulo `classification`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes` | `yes` | Sí, de forma continua | produce {"kind":"hasOtherPaidStaff","value":true,"provenance":"explicit_declaration"} |
| `no` | `no` | No, trabajo solo | produce {"kind":"hasOtherPaidStaff","value":false,"provenance":"explicit_declaration"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: eqV2(`q2_entity`, `individual`).

Aparece cuando `q2_entity` respondió exactamente `individual`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_entity`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `classification` y declara los propósitos `classification`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

business context and operational capacity

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: hasOtherPaidStaff=true, hasOtherPaidStaff=false.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `yes` → {"option":"yes","kind":"hasOtherPaidStaff","value":true,"provenance":"explicit_declaration"}
- `no` → {"option":"no","kind":"hasOtherPaidStaff","value":false,"provenance":"explicit_declaration"}

### 9. Relación con otras preguntas

- `q2_entity`: dependencia de routing explícita en la condición.
- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_delivery`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_monetization`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = MAYBE** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No cuenta un ayudante ocasional para un encargo puntual.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE` de copy, con cambio semántico menor hacia participación operativa habitual.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE COPY`

Decisión final:
`KEEP + REWRITE`

Pregunta final:
`¿Trabajas por tu cuenta o hay alguien más que trabaja contigo de forma habitual?`

Respuestas finales:

| Option ID | Texto final para el usuario |
| --- | --- |
| `no` | Trabajo por mi cuenta |
| `yes` | Hay al menos una persona que trabaja conmigo habitualmente |

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE CONDICIONAL`; solo cuando `q2_entity = individual`.
- Multiselección: `NO`.
- Unknown: `NO`.
- No aplica: `NO`.
- Cambio semántico: `MENOR`; se deja de enfatizar que la persona sea pagada y se prioriza la participación operativa habitual.
- Función final: distinguir operación individual de operación con participación habitual de otras personas, para habilitar o evitar preguntas posteriores sobre responsables, coordinación y handoffs.
- La existencia de más personas no es evidencia suficiente para recomendar Barrio o Ciudad.
- Conservar temporalmente los IDs y el routing actuales hasta implementación/recalibración.
- La presentación final propone mostrar primero `no`; verificar en implementación que el orden visible no dependa del orden interno actual `yes`/`no`.

## 03 — `q2_monetization`

### 1. Pregunta actual

¿Cuál es (o será) tu principal fuente de ingresos?

- Copy canónico ejecutable: versión semántica `1`, módulo `classification`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `time_or_project` | `time_or_project` | Cobro por tiempo o por proyecto | produce {"kind":"monetizationMechanism","slot":"primary","value":"time_or_project_work","provenance":"explicit_declaration"} |
| `goods` | `goods` | Venta de productos o mercancía | produce {"kind":"monetizationMechanism","slot":"primary","value":"goods_for_resale","provenance":"explicit_declaration"} |
| `licensed` | `licensed` | Ejercicio de una profesión con licencia (legal, contable, médica u otra) | produce {"kind":"monetizationMechanism","slot":"primary","value":"licensed_practice","provenance":"explicit_declaration"} |
| `commission` | `commission` | Comisiones por conectar o cerrar operaciones de terceros | produce {"kind":"monetizationMechanism","slot":"primary","value":"commission_or_referral","provenance":"explicit_declaration"} |
| `audience` | `audience` | Ingresos que genera mi audiencia o mi contenido | produce {"kind":"monetizationMechanism","slot":"primary","value":"own_audience_monetization","provenance":"explicit_declaration"} |
| `recurring` | `recurring` | Cuotas recurrentes (membresía o suscripción) | produce {"kind":"monetizationMechanism","slot":"primary","value":"recurring_access","provenance":"explicit_declaration"} |
| `mission` | `mission` | Sin fines de lucro: nos sostienen donaciones, fondos u otros apoyos | produce {"kind":"monetizationMechanism","slot":"primary","value":"mission_funded","provenance":"explicit_declaration"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Sin regla local: es elegible cuando el planner considera relevante su módulo.

Puede aparecer desde el conjunto inicial de elegibles del banco. No hay condición local que la bloquee; el presupuesto, el módulo y el planner pueden posponerla. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `classification` y declara los propósitos `classification`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

business context and operational capacity

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Opciones con señales: monetizationMechanism=time_or_project_work, monetizationMechanism=goods_for_resale, monetizationMechanism=licensed_practice, monetizationMechanism=commission_or_referral, monetizationMechanism=own_audience_monetization, monetizationMechanism=recurring_access, monetizationMechanism=mission_funded.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `time_or_project` → {"option":"time_or_project","kind":"monetizationMechanism","slot":"primary","value":"time_or_project_work","provenance":"explicit_declaration"}
- `goods` → {"option":"goods","kind":"monetizationMechanism","slot":"primary","value":"goods_for_resale","provenance":"explicit_declaration"}
- `licensed` → {"option":"licensed","kind":"monetizationMechanism","slot":"primary","value":"licensed_practice","provenance":"explicit_declaration"}
- `commission` → {"option":"commission","kind":"monetizationMechanism","slot":"primary","value":"commission_or_referral","provenance":"explicit_declaration"}
- `audience` → {"option":"audience","kind":"monetizationMechanism","slot":"primary","value":"own_audience_monetization","provenance":"explicit_declaration"}
- `recurring` → {"option":"recurring","kind":"monetizationMechanism","slot":"primary","value":"recurring_access","provenance":"explicit_declaration"}
- `mission` → {"option":"mission","kind":"monetizationMechanism","slot":"primary","value":"mission_funded","provenance":"explicit_declaration"}

### 9. Relación con otras preguntas

- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_delivery`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_other_staff`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_demand_trend`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. El copy exige la fuente principal; varias fuentes pueden coexistir, pero el contrato decide conservar una sola para resolver `monetizationMechanism`.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Etiquetas en primera persona presente («Vendo», «Monetizo») no valían antes del lanzamiento; ahora son sustantivos.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = MAYBE** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Si tienes varias, elige la que más pesa o pesará en tus ingresos.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE RESPONSES`. La pregunta sigue siendo single-select y principal; se rediseña el eje de respuestas para que todas describan cómo se genera el ingreso.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `COMMERCIAL_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambiar valores y señales de monetización exige localizar dependencias de `licensed`, trasladar esa clasificación a una señal correcta y recalibrar las rutas afectadas. No se elimina ningún ID ejecutable en esta fase.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE RESPUESTAS`

Decisión final:
`KEEP + REWRITE RESPONSES`

Pregunta final:
`¿De dónde viene principalmente el dinero de tu actividad?`

Variante pre-lanzamiento:
`¿De dónde vendrá principalmente el dinero de tu actividad?`

Respuestas finales propuestas:

| Option ID propuesto | Texto final para el usuario |
| --- | --- |
| `services` | Cobro por servicios o trabajo profesional |
| `goods` | Vendo productos |
| `commission` | Recibo comisiones por ventas, referidos o intermediación |
| `audience` | Genero ingresos con contenido, audiencia, publicidad o patrocinios |
| `recurring` | Cobro membresías, suscripciones o cuotas recurrentes |
| `mission` | Recibimos donaciones, fondos o aportes |
| `other` | Otra forma de generar ingresos |
| `unsure` | Todavía no lo tengo claro |

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE DE CLASIFICACIÓN`.
- Multiselección: `NO`; si existen varias fuentes, se elige la principal.
- Unknown: `SÍ` mediante `unsure`.
- Otro: `SÍ` mediante `other`.
- No aplica: `NO`.
- Problema principal: `licensed` clasifica profesión regulada, no fuente de ingresos; el eje actual está mezclado.
- Cambio semántico: `SÍ`.
- Revalidación requerida: routing + commercial + recalibration.
- La categoría `licensed` no debe eliminarse del ejecutable hasta localizar todas sus dependencias, mover la clasificación a una señal correcta y revalidar rutas.
- La pista final debe indicar: «Si tienes varias fuentes, elige la que hoy representa la mayor parte de tus ingresos. Si todavía no vendes, piensa en la que esperas que sea la principal.»

## 04 — `q2_delivery`

### 1. Pregunta actual

¿Cómo se entrega principalmente lo que ofreces?

- Copy canónico ejecutable: versión semántica `1`, módulo `classification`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `fixed_no_inventory` | `fixed_no_inventory` | En un local al que viene la gente, sin vender productos en exhibición | produce {"kind":"deliveryMode","slot":"primary","value":"fixed_location_no_inventory","provenance":"explicit_declaration"} |
| `scheduled` | `scheduled` | Con citas agendadas, entre varias personas o espacios | produce {"kind":"deliveryMode","slot":"primary","value":"scheduled_time_blocks","provenance":"explicit_declaration"} |
| `travels` | `travels` | Voy a donde está el cliente (domicilio, obra o empresa) | produce {"kind":"deliveryMode","slot":"primary","value":"travels_to_customer","provenance":"explicit_declaration"} |
| `solo_practice` | `solo_practice` | Atiendo yo como profesional, sin otro colega que haga lo mismo | produce {"kind":"deliveryMode","slot":"primary","value":"specialized_individual_practice","provenance":"explicit_declaration"} |
| `online_checkout` | `online_checkout` | El cliente compra y paga en línea | produce {"kind":"deliveryMode","slot":"primary","value":"online_checkout","provenance":"explicit_declaration"} |
| `fixed_with_inventory` | `fixed_with_inventory` | En una tienda física con productos en exhibición | produce {"kind":"deliveryMode","slot":"primary","value":"fixed_location_with_inventory","provenance":"explicit_declaration"} |
| `onsite` | `onsite` | La gente consume o se hospeda en el lugar (restaurante, café, hotel) | produce {"kind":"deliveryMode","slot":"primary","value":"onsite_consumption","provenance":"explicit_declaration"} |
| `b2b_pipeline` | `b2b_pipeline` | Vendo a otras empresas, que deciden con su propio proceso | produce {"kind":"deliveryMode","slot":"primary","value":"b2b_sales_pipeline","provenance":"explicit_declaration"} |
| `audience_content` | `audience_content` | A través de mi contenido y mi audiencia (redes, canal, comunidad) | produce {"kind":"deliveryMode","slot":"primary","value":"own_audience_content","provenance":"explicit_declaration"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Sin regla local: es elegible cuando el planner considera relevante su módulo.

Puede aparecer desde el conjunto inicial de elegibles del banco. No hay condición local que la bloquee; el presupuesto, el módulo y el planner pueden posponerla. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `classification` y declara los propósitos `classification`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

La forma principal en que lo que ofreces llega a quien lo recibe.

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Opciones con señales: deliveryMode=fixed_location_no_inventory, deliveryMode=scheduled_time_blocks, deliveryMode=travels_to_customer, deliveryMode=specialized_individual_practice, deliveryMode=online_checkout, deliveryMode=fixed_location_with_inventory, deliveryMode=onsite_consumption, deliveryMode=b2b_sales_pipeline, deliveryMode=own_audience_content.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `fixed_no_inventory` → {"option":"fixed_no_inventory","kind":"deliveryMode","slot":"primary","value":"fixed_location_no_inventory","provenance":"explicit_declaration"}
- `scheduled` → {"option":"scheduled","kind":"deliveryMode","slot":"primary","value":"scheduled_time_blocks","provenance":"explicit_declaration"}
- `travels` → {"option":"travels","kind":"deliveryMode","slot":"primary","value":"travels_to_customer","provenance":"explicit_declaration"}
- `solo_practice` → {"option":"solo_practice","kind":"deliveryMode","slot":"primary","value":"specialized_individual_practice","provenance":"explicit_declaration"}
- `online_checkout` → {"option":"online_checkout","kind":"deliveryMode","slot":"primary","value":"online_checkout","provenance":"explicit_declaration"}
- `fixed_with_inventory` → {"option":"fixed_with_inventory","kind":"deliveryMode","slot":"primary","value":"fixed_location_with_inventory","provenance":"explicit_declaration"}
- `onsite` → {"option":"onsite","kind":"deliveryMode","slot":"primary","value":"onsite_consumption","provenance":"explicit_declaration"}
- `b2b_pipeline` → {"option":"b2b_pipeline","kind":"deliveryMode","slot":"primary","value":"b2b_sales_pipeline","provenance":"explicit_declaration"}
- `audience_content` → {"option":"audience_content","kind":"deliveryMode","slot":"primary","value":"own_audience_content","provenance":"explicit_declaration"}

### 9. Relación con otras preguntas

- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_monetization`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_other_staff`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_demand_trend`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO según el contrato actual. El copy y la pista piden la forma principal/más habitual; convertirla a multi-select cambiaría el contrato de routing.

**Decisión humana posterior:** `REDESIGN + MULTI_SELECT`. En negocios híbridos pueden ser verdaderas varias modalidades; la propuesta elimina la obligación de fingir un único modelo.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Jerga interna («inventario de reventa», «proveedores/recursos», «proceso de pago») en una pregunta que decide la ruta.

**ANSWER_AXIS = CONSISTENT** en la auditoría ejecutable vigente.

**Evaluación humana posterior:** `ANSWER_AXIS = BROKEN`. Las opciones actuales mezclan modalidad de atención/entrega, forma de compra/pago, quién presta el servicio, comprador B2B y distribución por audiencia; una persona puede cumplir varias simultáneamente.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = MAYBE** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Elige la forma más habitual, aunque a veces uses otras.
- Panel de ayuda: understand=La forma principal en que lo que ofreces llega a quien lo recibe.; distinction=Elige cómo ocurre la mayoría de las veces, no cómo te gustaría que fuera.; why=Una tienda en línea, un servicio con citas y un servicio a domicilio se revisan con preguntas distintas.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REDESIGN + MULTI_SELECT`. El nuevo eje se limita a formas reales de atención o entrega y permite combinaciones híbridas.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `APPLICABILITY_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia de single-select a multi-select, elimina modalidades que pertenecen a otras preguntas y requiere migrar señales actuales sin perder rutas.

### 15. Decisión humana

Estado:
`APROBADA PARA REDISEÑO`

Decisión final:
`REDESIGN + MULTI_SELECT`

Pregunta final:
`¿De qué formas atiendes a tus clientes o entregas lo que ofreces?`

Ayuda:
`Puedes elegir más de una.`

Respuestas finales propuestas:

| Option ID propuesto | Texto final para el usuario |
| --- | --- |
| `local_service` | Mis clientes vienen a un local, oficina o espacio físico |
| `appointments` | Mis clientes reservan citas o sesiones |
| `travels` | Voy hasta donde está el cliente |
| `online` | Vendo o entrego por internet |
| `retail` | Vendo productos en una tienda física |
| `onsite` | Mis clientes consumen o usan el servicio en el lugar, como en un restaurante, café u hospedaje |
| `other` | De otra forma |
| `unsure` | No estoy seguro |

Notas Yoan/ChatGPT:

- Tipo: `MULTI_SELECT`.
- CORE/ADAPTIVE: `CORE DE CLASIFICACIÓN`.
- Unknown: `SÍ` mediante `unsure`.
- Otro: `SÍ` mediante `other`.
- Not applicable: `NO`.
- ANSWER_AXIS actual: `BROKEN`; con la propuesta: `CONSISTENT`.
- Cambio semántico: `SÍ, IMPORTANTE`.
- La combinación de opciones puede activar varios arquetipos; no obligar a elegir un único modelo híbrido.
- Eliminar de esta pregunta: `solo_practice`, `b2b_pipeline` y `audience_content`; esos conceptos tienen señales más adecuadas en `q2_other_staff`, `q2_customer_buyer`, `q2_monetization` y las preguntas de creator.
- Antes de implementar, localizar dependencias de `fixed_no_inventory`, `scheduled`, `travels`, `solo_practice`, `online_checkout`, `fixed_with_inventory`, `onsite`, `b2b_pipeline` y `audience_content`, y definir su migración al nuevo modelo.
- Los módulos esperados son: citas → appointments; internet → ecommerce; tienda física → retail; consumo en el lugar → hospitality; visita al cliente → local_service.

## 05 — `q2_has_customers`

### 1. Pregunta actual

¿Ya tienes clientes reales, o personas que compran, usan o apoyan lo que ofreces?

- Copy canónico ejecutable: versión semántica `1`, módulo `maturity`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=nonprofit`):
  - Pregunta visible: ¿Tu organización ya atiende a personas o recibe apoyo de forma real?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes` | `yes` | Sí, ya hay actividad real | produce {"kind":"hasRealCustomers","value":true,"provenance":"explicit_declaration"} |
| `no` | `no` | Todavía no: es una idea o está en preparación | produce {"kind":"hasRealCustomers","value":false,"provenance":"explicit_declaration"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Sin regla local: es elegible cuando el planner considera relevante su módulo.

Puede aparecer desde el conjunto inicial de elegibles del banco. No hay condición local que la bloquee; el presupuesto, el módulo y el planner pueden posponerla. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `maturity` y declara los propósitos `anchor, maturity`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

Si ya existe actividad real con las personas a las que se dirige lo que ofreces.

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Opciones con señales: hasRealCustomers=true, hasRealCustomers=false.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `yes` → {"option":"yes","kind":"hasRealCustomers","value":true,"provenance":"explicit_declaration"}
- `no` → {"option":"no","kind":"hasRealCustomers","value":false,"provenance":"explicit_declaration"}

### 9. Relación con otras preguntas

- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_demand_trend`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_process_systemization`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_regularity`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Clientes o transacciones» excluía organizaciones y no separaba interés de actividad real.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Cuenta solo actividad real, aunque sea poca; el interés sin un primer paso todavía no cuenta.
- Panel de ayuda: understand=Si ya existe actividad real con las personas a las que se dirige lo que ofreces.; distinction=Seguidores o personas interesadas todavía no cuentan; sí cuenta quien ya dio un primer paso real (una compra, una cita, una donación).; why=Define si el diagnóstico revisa una operación en marcha o la preparación de un lanzamiento.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE` exclusivamente editorial, sin cambio semántico del hecho que se determina.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: cambia copy y ejemplos visibles; debe conservar la señal binaria de actividad real y revalidar el routing posterior. No debería cambiar scoring porque sigue representando el mismo hecho.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE COPY`

Decisión final:
`KEEP + REWRITE`

Pregunta final:
`¿Ya hay personas que compran, usan o apoyan lo que ofreces?`

Variante nonprofit:
`¿Tu organización ya atiende personas o recibe apoyo de forma activa?`

Respuestas finales:

| Option ID | Texto final para el usuario |
| --- | --- |
| `yes` | Sí, ya hay actividad real |
| `no` | Todavía no, sigo preparando o validando la idea |

Pista:
`Cuenta una compra, una cita, una reserva, una donación o cualquier otra acción real. Solo mostrar interés o seguirte en redes todavía no cuenta.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE`.
- Multiselección: `NO`.
- Unknown: `NO`.
- No aplica: `NO`.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: si ya existe actividad real con clientes, usuarios, participantes o personas que apoyan, frente a una idea/proyecto en preparación o validación.
- Una primera compra, cita, reserva, piloto real, donación o uso cuenta como `yes`; no exige volumen ni estabilidad.
- Eliminar la expresión «clientes reales» del lenguaje visible y conservar «actividad real» explicado con ejemplos.

## 06 — `q2_regularity`

### 1. Pregunta actual

¿Con qué regularidad tienes actividad con clientes (ventas, servicios, citas o pedidos)?

- Copy canónico ejecutable: versión semántica `1`, módulo `maturity`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=nonprofit`):
  - Pregunta visible: ¿Con qué regularidad tiene actividad tu organización con las personas que atiende o que la apoyan?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `irregular` | `irregular` | De forma ocasional | produce {"kind":"operatingRegularity","value":"irregular","provenance":"observed_fact"} |
| `regular` | `regular` | De forma regular y repetible | produce {"kind":"operatingRegularity","value":"regular","provenance":"observed_fact"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: eqV2(`q2_has_customers`, `yes`).

Aparece cuando `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `maturity` y declara los propósitos `maturity`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

business context and operational capacity

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: operatingRegularity=irregular, operatingRegularity=regular.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `irregular` → {"option":"irregular","kind":"operatingRegularity","value":"irregular","provenance":"observed_fact"}
- `regular` → {"option":"regular","kind":"operatingRegularity","value":"regular","provenance":"observed_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_demand_trend`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_process_systemization`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `MISSING_UNKNOWN`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Esa actividad» dependía de la pregunta anterior, que el planner no garantiza.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = MAYBE** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `ADD_UNKNOWN`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REDESIGN ANSWERS`. La pregunta conserva su dependencia de actividad real, pero deja de forzar una dicotomía demasiado amplia.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: añade una categoría intermedia y `unknown`; debe revisarse qué preguntas posteriores requieren estabilidad real frente a actividad frecuente pero variable.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE RESPUESTAS`

Decisión final:
`KEEP + REWRITE + ADD_UNKNOWN`

Pregunta final:
`¿Con qué frecuencia tienes clientes, ventas, citas o pedidos?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `occasional` | Solo de vez en cuando |
| `irregular_active` | Tengo actividad con frecuencia, pero varía bastante |
| `regular` | Tengo actividad de forma regular y bastante estable |
| `unknown` | No lo tengo claro todavía |

Pista:
`Piensa en los últimos meses en general, no en una semana buena o mala.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE CONDICIONAL`; solo si `q2_has_customers = yes`.
- Multiselección: `NO`.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: `NO`.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: grado de continuidad y estabilidad de la actividad real, sin comparar industrias por una frecuencia fija.
- La categoría intermedia no debe mapearse automáticamente a `regular`; debe revisarse qué routing requiere estabilidad real y cuál solo actividad frecuente.

## 07 — `q2_demand_trend`

### 1. Pregunta actual

En los últimos meses, ¿cómo ha cambiado la cantidad de clientes o pedidos?

- Copy canónico ejecutable: versión semántica `1`, módulo `maturity`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=nonprofit`):
  - Pregunta visible: En los últimos meses, ¿cómo ha cambiado la cantidad de personas que atiende o que apoyan tu organización?
- Variante 2 (`terminology=clinical`):
  - Pregunta visible: En los últimos meses, ¿cómo ha cambiado la cantidad de pacientes o citas?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `increasing` | `increasing` | Ha aumentado de forma sostenida | produce {"kind":"demandTrend","value":"increasing_observed","provenance":"observed_fact"} |
| `flat` | `flat` | Se ha mantenido más o menos igual | produce {"kind":"demandTrend","value":"flat_or_unknown","provenance":"observed_fact"} |
| `decreasing` | `decreasing` | Ha disminuido | produce {"kind":"demandTrend","value":"decreasing_observed","provenance":"observed_fact"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: eqV2(`q2_regularity`, `regular`).

Aparece cuando `q2_regularity` respondió exactamente `regular`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_regularity`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `maturity` y declara los propósitos `maturity`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

business context and operational capacity

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: demandTrend=increasing_observed, demandTrend=flat_or_unknown, demandTrend=decreasing_observed.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `increasing` → {"option":"increasing","kind":"demandTrend","value":"increasing_observed","provenance":"observed_fact"}
- `flat` → {"option":"flat","kind":"demandTrend","value":"flat_or_unknown","provenance":"observed_fact"}
- `decreasing` → {"option":"decreasing","kind":"demandTrend","value":"decreasing_observed","provenance":"observed_fact"}

### 9. Relación con otras preguntas

- `q2_regularity`: dependencia de routing explícita en la condición.
- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_has_customers`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_process_systemization`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Clientes/pedidos» no encajaba en organizaciones ni en práctica clínica.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = MAYBE** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_UNKNOWN + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: separa estabilidad observada de desconocimiento y permite que el planner decida cuándo esta evidencia de madurez es necesaria.

### 15. Decisión humana

Estado:
`APROBADA CON CORRECCIÓN SEMÁNTICA`

Decisión final:
`KEEP + REWRITE + ADD_UNKNOWN + DEFER_TO_ADAPTIVE`

Pregunta final:
`En los últimos meses, ¿cómo ha cambiado tu actividad?`

Pista:
`Piensa en clientes, ventas, citas o pedidos, según tu negocio. Mira los últimos meses en general, no una semana especialmente buena o mala.`

Respuestas finales:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `increasing` | Ha aumentado |
| `flat` | Se ha mantenido más o menos igual |
| `decreasing` | Ha disminuido |
| `unknown` | No lo sé o no lo he revisado |

Variantes:

- Clinical: `En los últimos meses, ¿cómo ha cambiado la cantidad de pacientes o citas?`
- Nonprofit: `En los últimos meses, ¿cómo ha cambiado la cantidad de personas que atienden o apoyan tu organización?`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE TEMPRANA / CONTEXTO DE MADUREZ`.
- Multiselección: `NO`.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: `NO`.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: tendencia reciente de actividad: crecimiento, estabilidad, descenso o desconocimiento.
- `flat` representa estabilidad observada; `unknown` representa falta de información y nunca debe producir la misma señal que `flat`.
- Revisar conjuntamente con `q2_capacity_signal` si ambas deben activarse solo cuando cambien la interpretación o el routing.

## 08 — `q2_goal`

### 1. Pregunta actual

¿Qué te gustaría lograr primero?

- Copy canónico ejecutable: versión semántica `1`, módulo `goal_friction`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=nonprofit`):
  - Etiquetas visibles por opción: `be_found` → Que más personas nos encuentren; `opportunities` → Conseguir más apoyo, participación u oportunidades; `explain` → Que se entienda mejor qué hacemos y a quién ayudamos; `stop_losing` → Dejar de perder personas interesadas, apoyos o seguimientos
- Variante 2 (`terminology=prelaunch`):
  - Etiquetas visibles por opción: `opportunities` → Conseguir las primeras personas interesadas o los primeros clientes; `stop_losing` → Que no se pierdan las personas interesadas cuando empiece

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `be_found` | `be_found` | Que más personas me encuentren | produce {"kind":"goal","value":"be_found","provenance":"explicit_declaration"} |
| `opportunities` | `opportunities` | Recibir más consultas u oportunidades | produce {"kind":"goal","value":"opportunities","provenance":"explicit_declaration"} |
| `explain` | `explain` | Que se entienda mejor qué hago y para quién | produce {"kind":"goal","value":"explain","provenance":"explicit_declaration"} |
| `trust` | `trust` | Generar más confianza | produce {"kind":"goal","value":"trust","provenance":"explicit_declaration"} |
| `stop_losing` | `stop_losing` | Dejar de perder consultas, clientes o seguimientos | produce {"kind":"goal","value":"stop_losing","provenance":"explicit_declaration"} |
| `organize` | `organize` | Ordenar contactos, tareas y procesos | produce {"kind":"goal","value":"organize","provenance":"explicit_declaration"} |
| `automate` | `automate` | Reducir trabajo manual o repetitivo | produce {"kind":"goal","value":"automate","provenance":"explicit_declaration"} |
| `measure` | `measure` | Medir y entender qué funciona | produce {"kind":"goal","value":"measure","provenance":"explicit_declaration"} |
| `unsure` | `unsure` | Todavía no lo sé | kind=unknown · produce {"kind":"goalUnknown","value":true,"provenance":"explicit_declaration"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Sin regla local: es elegible cuando el planner considera relevante su módulo.

Puede aparecer desde el conjunto inicial de elegibles del banco. No hay condición local que la bloquee; el presupuesto, el módulo y el planner pueden posponerla. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `goal_friction` y declara los propósitos `anchor, goal`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

Lo principal que quieres mejorar ahora mismo.

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=true, N/A=false. Opciones con señales: goal=be_found, goal=opportunities, goal=explain, goal=trust, goal=stop_losing, goal=organize, goal=automate, goal=measure, goalUnknown=true.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `be_found` → {"option":"be_found","kind":"goal","value":"be_found","provenance":"explicit_declaration"}
- `opportunities` → {"option":"opportunities","kind":"goal","value":"opportunities","provenance":"explicit_declaration"}
- `explain` → {"option":"explain","kind":"goal","value":"explain","provenance":"explicit_declaration"}
- `trust` → {"option":"trust","kind":"goal","value":"trust","provenance":"explicit_declaration"}
- `stop_losing` → {"option":"stop_losing","kind":"goal","value":"stop_losing","provenance":"explicit_declaration"}
- `organize` → {"option":"organize","kind":"goal","value":"organize","provenance":"explicit_declaration"}
- `automate` → {"option":"automate","kind":"goal","value":"automate","provenance":"explicit_declaration"}
- `measure` → {"option":"measure","kind":"goal","value":"measure","provenance":"explicit_declaration"}
- `unsure` → {"option":"unsure","kind":"goalUnknown","value":true,"provenance":"explicit_declaration"}

### 9. Relación con otras preguntas

- `q2_friction`: comparte  y subcriterio declared priority and contextual constraint; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Puede haber varios objetivos, pero el contrato pide el primero/prioritario; una segunda pregunta adaptativa podría explorar objetivos secundarios si se decide necesario.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Consultas/clientes» en etiquetas no encajaba en organizaciones ni antes del lanzamiento.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Si varias aplican, elige la que más quieres mejorar ahora.
- Panel de ayuda: understand=Lo principal que quieres mejorar ahora mismo.; distinction=Si varias aplican, elige la que más quieres mejorar ahora, no todo lo que te gustaría tener.; why=Tu objetivo nos ayuda a orientar el diagnóstico hacia las áreas más relevantes para lo que quieres mejorar. No determina por sí solo si un área está bien o mal.; options=be_found: Que más personas adecuadas puedan encontrarte. | opportunities: Que lleguen más oportunidades concretas: consultas, reservas, pedidos, donaciones u otras. | explain: Que la gente entienda con facilidad qué se ofrece, para quién y por qué importa. | trust: Ganar confianza, credibilidad, autoridad o reputación ante quien evalúa. | stop_losing: Perder menos oportunidades o personas antes de concretar o por falta de seguimiento. | organize: Dar orden y consistencia a cómo se gestionan contactos, tareas y la actividad digital. | automate: Reducir el trabajo manual y repetitivo con herramientas adecuadas, si de verdad conviene. | measure: Entender qué funciona y decidir mejor a partir de resultados. | unsure: Aún no hay una prioridad clara; el diagnóstico no inventa una.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_OTHER`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: añade `other` y cambia copy; el planner debe tratar esa salida sin convertir la preferencia declarada en evidencia diagnóstica.

### 15. Decisión humana

Estado:
`APROBADA CON MEJORA DE COPY`

Decisión final:
`KEEP + REWRITE + ADD_OTHER`

Pregunta final:
`¿Qué te gustaría mejorar primero?`

Respuestas finales:

| Option ID | Texto final para el usuario |
| --- | --- |
| `be_found` | Que más personas me encuentren |
| `opportunities` | Recibir más consultas, pedidos u oportunidades |
| `explain` | Que se entienda mejor lo que ofrezco |
| `trust` | Generar más confianza |
| `stop_losing` | Dejar de perder personas interesadas por falta de seguimiento |
| `organize` | Organizar mejor mis contactos, tareas y procesos |
| `automate` | Ahorrar tiempo en tareas repetitivas |
| `measure` | Entender qué está funcionando y qué no |
| `other` | Tengo otra prioridad |
| `unsure` | Todavía no estoy seguro |

Pista:
`Si varias opciones aplican, elige la que más te gustaría mejorar ahora.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE`.
- Multiselección: `NO`.
- Unknown: `SÍ` mediante `unsure`.
- Other: `SÍ` mediante `other`.
- No aplica: `NO`.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: la prioridad que el propio usuario quiere mejorar primero.
- Regla crítica: esta respuesta es una preferencia declarada, no evidencia suficiente para determinar que una dimensión esté bien o mal. `automate` no significa que necesite Ciudad; `trust` no demuestra baja confianza digital; `be_found` no demuestra baja visibilidad.
- La respuesta debe expresar el problema en lenguaje del usuario; la solución técnica corresponde a Vecidya.

## 09 — `q2_friction`

### 1. Pregunta actual

¿Qué es lo que más te está frenando ahora mismo?

- Copy canónico ejecutable: versión semántica `1`, módulo `goal_friction`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=nonprofit`):
  - Pregunta visible: ¿Qué es lo que más está frenando a tu organización ahora mismo?
  - Etiquetas visibles por opción: `visibility` → Pocas personas nos encuentran; `trust` → Nos encuentran, pero dudan antes de apoyar o participar; `follow_up` → Se nos pierden contactos o pendientes por falta de seguimiento; `operations` → Nos falta orden interno (tareas, información o procesos); `scale` → Tenemos más demanda de la que podemos atender

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `visibility` | `visibility` | Pocas personas me encuentran | produce {"kind":"friction","value":"visibility","provenance":"explicit_declaration"} |
| `trust` | `trust` | Me encuentran, pero dudan antes de decidirse | produce {"kind":"friction","value":"trust","provenance":"explicit_declaration"} |
| `conversion` | `conversion` | Hay interés, pero pocas veces se concreta | produce {"kind":"friction","value":"conversion","provenance":"explicit_declaration"} |
| `follow_up` | `follow_up` | Se me pierden contactos o pendientes por falta de seguimiento | produce {"kind":"friction","value":"follow_up","provenance":"explicit_declaration"} |
| `operations` | `operations` | Me falta orden interno (tareas, información o procesos) | produce {"kind":"friction","value":"operations","provenance":"explicit_declaration"} |
| `scale` | `scale` | Tengo más demanda de la que puedo atender | produce {"kind":"friction","value":"scale","provenance":"explicit_declaration"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Sin regla local: es elegible cuando el planner considera relevante su módulo.

Puede aparecer desde el conjunto inicial de elegibles del banco. No hay condición local que la bloquee; el presupuesto, el módulo y el planner pueden posponerla. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `goal_friction` y declara los propósitos `anchor, friction`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

El obstáculo que más pesa hoy, según tu experiencia.

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Opciones con señales: friction=visibility, friction=trust, friction=conversion, friction=follow_up, friction=operations, friction=scale.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `visibility` → {"option":"visibility","kind":"friction","value":"visibility","provenance":"explicit_declaration"}
- `trust` → {"option":"trust","kind":"friction","value":"trust","provenance":"explicit_declaration"}
- `conversion` → {"option":"conversion","kind":"friction","value":"conversion","provenance":"explicit_declaration"}
- `follow_up` → {"option":"follow_up","kind":"friction","value":"follow_up","provenance":"explicit_declaration"}
- `operations` → {"option":"operations","kind":"friction","value":"operations","provenance":"explicit_declaration"}
- `scale` → {"option":"scale","kind":"friction","value":"scale","provenance":"explicit_declaration"}

### 9. Relación con otras preguntas

- `q2_goal`: comparte  y subcriterio declared priority and contextual constraint; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Puede haber varios frenos, pero se declara el que más pesa; una segunda pregunta adaptativa sería preferible a multi-select si se necesita contexto adicional.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`, `MISSING_UNKNOWN`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Jerga («cierro»), hipérbole («Nadie»), «consultas» (en salud significa otra cosa) y primera persona singular en organizaciones.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = MAYBE** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Elige lo que más te frena hoy, aunque haya otras cosas por mejorar.
- Panel de ayuda: understand=El obstáculo que más pesa hoy, según tu experiencia.; distinction=Elige el que más te frena ahora, no el que parece más grave en general.; why=Nos ayuda a enfocar primero las preguntas en el área donde notas más dificultad. Si las demás respuestas apuntan a otra cosa, el diagnóstico lo señala.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ADD_UNKNOWN`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_UNKNOWN + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia copy, añade incertidumbre y pasa de contexto temprano obligatorio a pregunta adaptativa elegible solo cuando aporta orientación adicional.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE FUNCIÓN Y COPY`

Decisión final:
`KEEP + REWRITE + ADD_UNKNOWN + DEFER_TO_ADAPTIVE`

Pregunta final:
`¿Cuál de estas situaciones se parece más a lo que te pasa hoy?`

Respuestas finales:

| Option ID | Texto final para el usuario |
| --- | --- |
| `visibility` | Me cuesta lograr que nuevas personas me encuentren |
| `trust` | Me encuentran, pero todavía les cuesta confiar o decidirse |
| `conversion` | Hay personas interesadas, pero pocas terminan comprando, reservando o dando el siguiente paso |
| `follow_up` | A veces pierdo personas interesadas o pendientes por falta de seguimiento |
| `operations` | Tengo información, tareas o procesos desorganizados |
| `scale` | Tengo más trabajo o demanda de la que puedo manejar bien |
| `unsure` | No estoy seguro de cuál es el principal problema |

Pista:
`Elige la que más se parezca a tu situación, aunque también tengas otras cosas por mejorar.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE`.
- Multiselección: `NO`.
- Unknown: `SÍ` mediante `unsure`.
- No aplica: `NO`.
- ANSWER_AXIS: `CONSISTENT` con la nueva redacción.
- Qué determina: la principal dificultad percibida por el usuario.
- Es percepción declarada, no evidencia suficiente para puntuar una dimensión.
- Uso recomendado: cuando `goal = unsure`, `goal = other` o el planner necesita desempatar áreas relevantes.
- Evitar preguntar `goal` y `friction` consecutivamente cuando el objetivo ya orienta suficientemente el recorrido.

## 10 — `q2_appointments_noshow`

### 1. Pregunta actual

¿Qué tan seguido tus clientes faltan a su cita?

- Copy canónico ejecutable: versión semántica `1`, módulo `appointments`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=clinical`):
  - Pregunta visible: ¿Qué tan seguido tus pacientes faltan a su cita?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `rarely` | `rarely` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces | valor operativo; no declara kind especial ni señal adicional |
| `often` | `often` | Seguido | produce {"kind":"friction","value":"operations","provenance":"derived_fact"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`appointments`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `appointments` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `appointments` y declara los propósitos `diagnostic, friction`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

appointment attendance context

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección negative, unknown=false, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=operations.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `often` → {"option":"often","kind":"friction","value":"operations","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_booking_friction`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_method`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_confirmation_reminders`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_rebooking`: comparte ; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`, `MISSING_UNKNOWN`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Pacientes» aplicaba a todo bienestar; ahora solo a práctica clínica.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = MAYBE** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Piensa en las últimas semanas, no en un día aislado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ADD_UNKNOWN`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: exige actividad real confirmada, añade `unknown` y separa una observación de asistencia de cualquier causa operacional.

### 15. Decisión humana

Estado:
`APROBADA CON CORRECCIÓN DE ROUTING, UNKNOWN Y SEMÁNTICA`

Decisión final:
`KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX`

Pregunta final:
`¿Qué tan seguido tus clientes faltan a una cita?`

Variante clinical:
`¿Qué tan seguido tus pacientes faltan a una cita?`

Respuestas finales:

| Option ID | Texto final para el usuario |
| --- | --- |
| `rarely` | Casi nunca |
| `sometimes` | Pasa algunas veces |
| `often` | Pasa con frecuencia |
| `unknown` | No lo sé o no lo he revisado |

Pista:
`Piensa en los últimos meses en general, no en una semana aislada.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE`.
- Aplicabilidad: solo si el negocio usa citas y `q2_has_customers = yes`.
- Multiselección: `NO`.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: `NO` en interfaz; el routing evita mostrarla cuando no corresponde.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: frecuencia percibida de ausencias a citas.
- Una frecuencia alta no demuestra por sí sola un problema de operaciones.
- Revisar/eliminar la señal actual `often → friction=operations`; sustituir conceptualmente por una señal específica como `appointmentAttendanceIssue=true`.
- Las causas deben determinarse con evidencia posterior sobre recordatorios, confirmaciones, booking y reprogramación.
- Sustituir `notEqV2(q2_has_customers, no)` por una condición que exija actividad real confirmada.

## 11 — `q2_ecommerce_traffic_sources`

### 1. Pregunta actual

¿De qué fuentes te llegan visitas o pedidos de forma habitual?

- Copy canónico ejecutable: versión semántica `2`, módulo `ecommerce`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `social` | `social` | Redes sociales | valor operativo; no declara kind especial ni señal adicional |
| `search` | `search` | Búsquedas en internet | valor operativo; no declara kind especial ni señal adicional |
| `ads` | `ads` | Anuncios pagados | valor operativo; no declara kind especial ni señal adicional |
| `referral` | `referral` | Recomendaciones de otras personas o sitios | valor operativo; no declara kind especial ni señal adicional |
| `marketplace` | `marketplace` | Plataformas de venta de terceros (marketplaces) | valor operativo; no declara kind especial ni señal adicional |
| `email` | `email` | Correos o boletines a quienes ya te conocen | valor operativo; no declara kind especial ni señal adicional |
| `direct` | `direct` | Visitas directas de quien ya te conoce (vuelve por su cuenta o escribe tu dirección) | valor operativo; no declara kind especial ni señal adicional |
| `other` | `other` | Otra fuente que no aparece aquí | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No sé de dónde llegan | kind=unknown · exclusiva en multi-select |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`MULTI_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`ecommerce`), eqV2(`q2_has_customers`, `yes`)).

Aparece cuando el arquetipo resuelto contiene `ecommerce` entre sus componentes y `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `ecommerce` y declara los propósitos `diagnostic`; aporta evidencia direct para Discovery, Measurement & Optimization.

### 6. Qué intenta determinar

Qué fuentes traen visitas o pedidos de forma habitual.

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..
- **SUPPORTING:** Measurement & Optimization (`measurement_optimization`). Evalúa: Origen, resultados, revisión comparativa y capacidad de aprender..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `discovery`: `email` → constraint; `direct` → constraint
- `measurement_optimization`: `social` → partial; `search` → partial; `ads` → partial; `referral` → partial; `marketplace` → partial; `email` → partial; `direct` → partial; `other` → partial; `unknown` → missing
- Selección múltiple: `discovery` usa estados por cantidad seleccionada: dependency → partial → partial → established.

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_lead_source`: comparte dimensión Discovery, Measurement & Optimization y subcriterio known source of demand and source confidence; es una pregunta vecina, no necesariamente redundante.
- `q2_local_discovery`: comparte dimensión Discovery, Measurement & Optimization y subcriterio known source of demand and source confidence; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_acquisition_dependency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_visibility`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_channel_concentration`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
No aplica: la pregunta ya es `MULTI_SELECT` en el ejecutable. Su contrato exige selección múltiple y aplica exclusividad donde se declara.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `ANSWERS_DO_NOT_MATCH_QUESTION`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Principalmente» invitaba a marcar una sola fuente, que la semántica lee como dependencia de un canal. Faltaban fuentes habituales (resuelto en DIAG-V3-08F.1: marketplaces, correo, visitas directas y «otra», versión 2).

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = YES** — Existe una opción abierta ejecutable.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Marca todas las que traen pedidos con regularidad, no solo la principal.
- Panel de ayuda: understand=Qué fuentes traen visitas o pedidos de forma habitual.; distinction=Marca cada fuente que aporta con regularidad; una que solo aportó una vez no cuenta. Si conoces la fuente pero no aparece, elige «Otra»; si no sabes de dónde llegan, «No sé».; why=Muestra de qué depende hoy la llegada de pedidos y cuánto llega de personas nuevas frente a quienes ya te conocen.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **MEDIA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + KEEP_MULTI_SELECT`. Se conserva la multiselección y se separa la evidencia de Discovery de la medición real.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia copy, incorpora WhatsApp/messaging, limita la interpretación positiva a Discovery y reduce la contribución automática a Measurement.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE COPY Y SEMÁNTICA`

Decisión final:
`KEEP + REWRITE + KEEP_MULTI_SELECT`

Pregunta final:
`¿Por cuáles canales suelen llegar personas a tu tienda online?`

Ayuda:
`Puedes elegir más de uno.`

Pista:
`Marca todos los canales que te traen personas de forma habitual. No cuentes algo que pasó solo una vez.`

Respuestas finales propuestas:

| Option ID | Texto final para el usuario |
| --- | --- |
| `social` | Redes sociales, como Instagram, Facebook o TikTok |
| `search` | Google u otros buscadores |
| `ads` | Anuncios pagados |
| `referral` | Recomendaciones de otras personas o negocios |
| `marketplace` | Marketplaces o plataformas de venta |
| `messaging` | WhatsApp u otros mensajes |
| `email` | Correos o boletines |
| `direct` | Personas que ya conocen mi tienda y entran directamente |
| `other` | Otro canal |
| `unknown` | No sé de dónde llegan |

Notas Yoan/ChatGPT:

- Tipo: `MULTI_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — ECOMMERCE / DISCOVERY`.
- Unknown: `SÍ`, exclusivo.
- Other: `SÍ`.
- No aplica: `NO` en interfaz; no debe aparecer si ecommerce no aplica.
- ANSWER_AXIS: `CONSISTENT` con la nueva redacción.
- Qué determina: canales habituales de llegada y posible concentración/diversidad de fuentes.
- Seleccionar varios canales no demuestra que el negocio mida bien su adquisición ni que tenga mejor Discovery.
- Retirar o reducir fuertemente la contribución positiva automática a Measurement; `unknown` puede señalar desconocimiento, pero la medición real corresponde a `q2_measurement_source_confidence`.
- Revisar `q2_ecommerce_acquisition_dependency` como posible pregunta derivable/redundante.
- Evaluar técnicamente el nuevo canal `messaging / WhatsApp`.

## 12 — `q2_b2b_pipeline`

### 1. Pregunta actual

¿Tienes un proceso definido para dar seguimiento a oportunidades de venta?

- Copy canónico ejecutable: versión semántica `1`, módulo `b2b`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes` | `yes` | Sí, definido y consistente | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, se hace de forma improvisada | produce {"kind":"friction","value":"follow_up","provenance":"derived_fact"} |
| `unknown` | `unknown` | No estoy seguro | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`b2b`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `b2b` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `b2b` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Digital Readiness.

### 6. Qué intenta determinar

Si existe un proceso definido para dar seguimiento a cada oportunidad de venta.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [ninguna], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=follow_up.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `yes` → strong; `no` → missing

**Señales producidas por opciones:**
- `no` → {"option":"no","kind":"friction","value":"follow_up","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_status_visibility`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_monetization_model`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_general_process`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_ownership`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_status_visibility`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si existe un proceso definido para dar seguimiento a cada oportunidad de venta.; distinction=Un proceso definido se repite igual cada vez; dar seguimiento cuando se puede no lo es.; why=Cuando una venta requiere varios contactos, el seguimiento decide cuántas oportunidades avanzan.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_INTERMEDIATE + ROUTING_FIX`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: añade un estado intermedio, exige actividad real confirmada y revalida el mapping de madurez comercial sin confundir proceso con CRM.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE RESPUESTAS Y ROUTING FIX`

Decisión final:
`KEEP + REWRITE + ADD_INTERMEDIATE + ROUTING_FIX`

Pregunta final:
`Cuando aparece una oportunidad de venta, ¿tienes una forma clara de darle seguimiento hasta saber qué pasó?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `defined` | Sí, seguimos un proceso claro y sabemos qué paso sigue |
| `partial` | Tenemos una forma de hacerlo, pero no siempre se sigue igual |
| `informal` | Cada oportunidad se maneja de forma distinta o de memoria |
| `unknown` | No estoy seguro |

Pista:
`No importa si usas una hoja, una agenda o un CRM. Lo importante es si el seguimiento se hace de una forma clara y repetible.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — B2B`.
- Aplicabilidad: solo cuando el arquetipo incluye B2B y `q2_has_customers = yes`.
- Multiselección: `NO`.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: `NO` en interfaz; el routing evita mostrarla cuando B2B no aplica.
- ANSWER_AXIS: `CONSISTENT` con la nueva escala.
- Qué determina: madurez del proceso de seguimiento de oportunidades comerciales.
- Tener proceso no significa tener CRM; no usar CRM no significa tener un proceso deficiente.
- No debe seleccionar una licencia por sí sola.
- Revisar el mapping actual `yes → strong` / `no → missing` para incorporar el estado intermedio.
- Sustituir la condición basada en `notEqV2(q2_has_customers, no)` por `q2_has_customers = yes`.

## 13 — `q2_local_foot_traffic`

### 1. Pregunta actual

¿Qué parte de quienes llegan a tu local lo hace porque pasaba cerca, sin haberlo planeado?

- Copy canónico ejecutable: versión semántica `1`, módulo `local`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `high` | `high` | Una parte importante | valor operativo; no declara kind especial ni señal adicional |
| `low` | `low` | Poca | valor operativo; no declara kind especial ni señal adicional |
| `not_applicable` | `not_applicable` | No aplica: solo atiendo con cita o membresía | kind=not_applicable |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(orV2(archetypeIncludes(`local`), archetypeIncludes(`retail`)), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `local` entre sus componentes o el arquetipo resuelto contiene `retail` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `local` y declara los propósitos `diagnostic`; aporta evidencia direct para Discovery.

### 6. Qué intenta determinar

Qué parte de quienes llegan al local lo hace por pasar cerca, sin haberte buscado antes.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=true. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `discovery`: `high` → dependency; `low` → constraint

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_local_discovery`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_local_presence_consistency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_lead_source`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_channel_concentration`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_content_consistency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `MISSING_UNKNOWN`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Mucho/Poco» no respondía a «qué parte»; «tu negocio» excluía organizaciones.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = MAYBE** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = YES** — Existe una opción ejecutable de no aplicabilidad.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Qué parte de quienes llegan al local lo hace por pasar cerca, sin haberte buscado antes.; distinction=Piensa en quienes entran sin plan previo, no en quienes ya te conocían.; why=Depender del paso por la calle es distinto a que te busquen o te recomienden.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `ADD_UNKNOWN`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia escala, aplicabilidad física, nivel de evidencia y deja de mapear automáticamente los extremos a dependencia o constraint.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE ESCALA, ROUTING Y SEMÁNTICA`

Decisión final:
`KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`De las personas nuevas que llegan a tu local, ¿cuántas entran porque lo vieron al pasar?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `most` | La mayoría |
| `some` | Una parte |
| `few` | Muy pocas o ninguna |
| `unknown` | No lo sé |

Pista:
`Piensa en personas nuevas, no en clientes que ya conocían el lugar.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — LOCAL DISCOVERY`.
- Aplicabilidad: solo si `q2_has_customers = yes`, existe ubicación física y admite llegada espontánea.
- Multiselección: `NO`.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: no se ofrece en interfaz; la no aplicabilidad se resuelve por routing.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: peso aproximado del descubrimiento casual por ubicación física.
- Cambiar evidencia recomendada de DIRECT a SUPPORTING / CONTEXTUAL.
- Mucha llegada por paso peatonal no significa por sí sola mala presencia digital; poca llegada tampoco significa buena presencia digital.
- Eliminar interpretaciones automáticas `high → dependency` y `low → constraint`; la dependencia requiere varias evidencias.
- Corregir el patrón `notEqV2(q2_has_customers, no)` exigiendo actividad confirmada y aplicabilidad física explícita.

## 14 — `q2_sector`

### 1. Pregunta actual

¿En qué sector o tipo de actividad encaja mejor lo que haces?

- Copy canónico ejecutable: versión semántica `1`, módulo `core`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `health_wellness` | `health_wellness` | Salud y bienestar | produce {"kind":"nicheGroup","value":"health_wellness","provenance":"explicit_declaration"} |
| `beauty_personal_care` | `beauty_personal_care` | Belleza y cuidado personal | produce {"kind":"nicheGroup","value":"beauty_personal_care","provenance":"explicit_declaration"} |
| `legal` | `legal` | Legal | produce {"kind":"nicheGroup","value":"legal","provenance":"explicit_declaration"} |
| `financial_tax_insurance` | `financial_tax_insurance` | Finanzas, impuestos o seguros | produce {"kind":"nicheGroup","value":"financial_tax_insurance","provenance":"explicit_declaration"} |
| `professional_services` | `professional_services` | Servicios profesionales (consultoría, diseño, arquitectura y similares) | produce {"kind":"nicheGroup","value":"professional_services","provenance":"explicit_declaration"} |
| `home_services` | `home_services` | Servicios para el hogar (plomería, climatización, limpieza y similares) | produce {"kind":"nicheGroup","value":"home_services","provenance":"explicit_declaration"} |
| `automotive` | `automotive` | Automotriz | produce {"kind":"nicheGroup","value":"automotive","provenance":"explicit_declaration"} |
| `real_estate` | `real_estate` | Bienes raíces | produce {"kind":"nicheGroup","value":"real_estate","provenance":"explicit_declaration"} |
| `food_hospitality` | `food_hospitality` | Alimentos y hospitalidad (restaurantes, cafés, hospedaje) | produce {"kind":"nicheGroup","value":"food_hospitality","provenance":"explicit_declaration"} |
| `retail` | `retail` | Comercio o tienda | produce {"kind":"nicheGroup","value":"retail","provenance":"explicit_declaration"} |
| `education_coaching` | `education_coaching` | Educación o coaching | produce {"kind":"nicheGroup","value":"education_coaching","provenance":"explicit_declaration"} |
| `creative_media` | `creative_media` | Creativo o medios | produce {"kind":"nicheGroup","value":"creative_media","provenance":"explicit_declaration"} |
| `technology_software` | `technology_software` | Tecnología o software | produce {"kind":"nicheGroup","value":"technology_software","provenance":"explicit_declaration"} |
| `nonprofit_community` | `nonprofit_community` | Organización sin fines de lucro o comunidad | produce {"kind":"nicheGroup","value":"nonprofit_community","provenance":"explicit_declaration"} |
| `other` | `other` | Otro sector, no encaja en los anteriores | produce {"kind":"nicheGroupOther","value":true,"provenance":"explicit_declaration"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Sin regla local: es elegible cuando el planner considera relevante su módulo.

Puede aparecer desde el conjunto inicial de elegibles del banco. No hay condición local que la bloquee; el presupuesto, el módulo y el planner pueden posponerla. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `core` y declara los propósitos `anchor, classification`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

business context and operational capacity

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Opciones con señales: nicheGroup=health_wellness, nicheGroup=beauty_personal_care, nicheGroup=legal, nicheGroup=financial_tax_insurance, nicheGroup=professional_services, nicheGroup=home_services, nicheGroup=automotive, nicheGroup=real_estate, nicheGroup=food_hospitality, nicheGroup=retail, nicheGroup=education_coaching, nicheGroup=creative_media, nicheGroup=technology_software, nicheGroup=nonprofit_community, nicheGroupOther=true.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `health_wellness` → {"option":"health_wellness","kind":"nicheGroup","value":"health_wellness","provenance":"explicit_declaration"}
- `beauty_personal_care` → {"option":"beauty_personal_care","kind":"nicheGroup","value":"beauty_personal_care","provenance":"explicit_declaration"}
- `legal` → {"option":"legal","kind":"nicheGroup","value":"legal","provenance":"explicit_declaration"}
- `financial_tax_insurance` → {"option":"financial_tax_insurance","kind":"nicheGroup","value":"financial_tax_insurance","provenance":"explicit_declaration"}
- `professional_services` → {"option":"professional_services","kind":"nicheGroup","value":"professional_services","provenance":"explicit_declaration"}
- `home_services` → {"option":"home_services","kind":"nicheGroup","value":"home_services","provenance":"explicit_declaration"}
- `automotive` → {"option":"automotive","kind":"nicheGroup","value":"automotive","provenance":"explicit_declaration"}
- `real_estate` → {"option":"real_estate","kind":"nicheGroup","value":"real_estate","provenance":"explicit_declaration"}
- `food_hospitality` → {"option":"food_hospitality","kind":"nicheGroup","value":"food_hospitality","provenance":"explicit_declaration"}
- `retail` → {"option":"retail","kind":"nicheGroup","value":"retail","provenance":"explicit_declaration"}
- `education_coaching` → {"option":"education_coaching","kind":"nicheGroup","value":"education_coaching","provenance":"explicit_declaration"}
- `creative_media` → {"option":"creative_media","kind":"nicheGroup","value":"creative_media","provenance":"explicit_declaration"}
- `technology_software` → {"option":"technology_software","kind":"nicheGroup","value":"technology_software","provenance":"explicit_declaration"}
- `nonprofit_community` → {"option":"nonprofit_community","kind":"nicheGroup","value":"nonprofit_community","provenance":"explicit_declaration"}
- `other` → {"option":"other","kind":"nicheGroupOther","value":true,"provenance":"explicit_declaration"}

### 9. Relación con otras preguntas

- `q2_entity`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_delivery`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_demand_trend`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = YES** — Existe una opción abierta ejecutable.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Elige la categoría más amplia que aplique; las siguientes preguntas ajustan los detalles.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + CLEAN_TAXONOMY`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: limpia categorías, elimina la duplicación entre tipo de entidad y actividad y exige localizar dependencias de `nonprofit_community`.

### 15. Decisión humana

Estado:
`APROBADA CON REESTRUCTURACIÓN DE CATEGORÍAS`

Decisión final:
`KEEP + REWRITE + CLEAN_TAXONOMY`

Pregunta final:
`¿A qué se dedica principalmente tu negocio, trabajo o proyecto?`

Variante organization:
`¿A qué se dedica principalmente tu organización?`

Pista:
`Si haces varias cosas, elige la actividad que mejor representa tu negocio hoy.`

Respuestas finales propuestas:

| Option ID | Texto final para el usuario |
| --- | --- |
| `health_wellness` | Salud y bienestar |
| `beauty_personal_care` | Belleza y cuidado personal |
| `legal` | Servicios legales |
| `financial_tax_insurance` | Finanzas, impuestos y seguros |
| `professional_services` | Servicios profesionales y consultoría |
| `home_services` | Servicios para el hogar y mantenimiento |
| `automotive` | Automotriz |
| `real_estate` | Bienes raíces |
| `food_hospitality` | Restaurantes, alimentos y hospedaje |
| `retail` | Comercio y venta de productos |
| `education_coaching` | Educación, formación y coaching |
| `creative_media` | Diseño, contenido y servicios creativos |
| `technology_software` | Tecnología y software |
| `community_social` | Servicios comunitarios, sociales o culturales |
| `other` | Otra actividad |

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE`.
- Multiselección: `NO`; representa la actividad principal.
- Unknown: `NO`.
- Other: `SÍ` mediante `other`.
- ANSWER_AXIS: `CONSISTENT`.
- `q2_entity` define qué tipo de entidad es; `q2_sector` define a qué se dedica.
- Ejemplos válidos: organization + education; organization + health_wellness; business + food_hospitality; individual + professional_services.
- Sustituir `nonprofit_community` solo después de localizar todas sus dependencias; la señal de organización proviene de `q2_entity`.
- El sector contextualiza y no selecciona licencia ni producto por sí solo.

## 15 — `q2_customer_reach`

### 1. Pregunta actual

¿Hasta dónde llegan geográficamente tus clientes?

- Copy canónico ejecutable: versión semántica `1`, módulo `classification`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=prelaunch`):
  - Pregunta visible: ¿Dónde estarán principalmente las personas a las que quieres llegar?
  - Pista visible: Piensa en dónde están, no en si las atenderás en línea o en persona.
- Variante 2 (`terminology=nonprofit`):
  - Pregunta visible: ¿Dónde están principalmente las personas a las que atiende tu organización?
  - Pista visible: Piensa en dónde están, no en si las atiendes en línea o en persona.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `local` | `local` | Mi zona o ciudad | produce {"kind":"customerReach","value":"local","provenance":"explicit_declaration"} |
| `regional` | `regional` | Varias ciudades o mi región, sin llegar a todo el país | produce {"kind":"customerReach","value":"regional","provenance":"explicit_declaration"} |
| `national` | `national` | Todo el país | produce {"kind":"customerReach","value":"national","provenance":"explicit_declaration"} |
| `global` | `global` | Más de un país | produce {"kind":"customerReach","value":"global","provenance":"explicit_declaration"} |
| `mixed` | `mixed` | Las dos cosas: una parte es local y otra llega más lejos de forma habitual, no como caso aislado | produce {"kind":"customerReach","value":"mixed","provenance":"explicit_declaration"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Sin regla local: es elegible cuando el planner considera relevante su módulo.

Puede aparecer desde el conjunto inicial de elegibles del banco. No hay condición local que la bloquee; el presupuesto, el módulo y el planner pueden posponerla. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `classification` y declara los propósitos `classification`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

business context and operational capacity

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Opciones con señales: customerReach=local, customerReach=regional, customerReach=national, customerReach=global, customerReach=mixed.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `local` → {"option":"local","kind":"customerReach","value":"local","provenance":"explicit_declaration"}
- `regional` → {"option":"regional","kind":"customerReach","value":"regional","provenance":"explicit_declaration"}
- `national` → {"option":"national","kind":"customerReach","value":"national","provenance":"explicit_declaration"}
- `global` → {"option":"global","kind":"customerReach","value":"global","provenance":"explicit_declaration"}
- `mixed` → {"option":"mixed","kind":"customerReach","value":"mixed","provenance":"explicit_declaration"}

### 9. Relación con otras preguntas

- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_delivery`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_monetization`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_other_staff`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_demand_trend`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Presuponía clientes existentes (también se pregunta antes del lanzamiento) y remitía a otra pregunta.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = MAYBE** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Piensa en dónde están, no en si los atiendes en línea o en persona.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE` de copy y definición de `mixed`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia copy y conserva `mixed` como señal explícita de operación híbrida local + no local.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE COPY Y DEFINICIÓN DE MIXED`

Decisión final:
`KEEP + REWRITE`

Pregunta final:
`¿Dónde están principalmente tus clientes?`

Variante prelaunch:
`¿Dónde están principalmente las personas a las que quieres llegar?`

Variante nonprofit:
`¿Dónde están principalmente las personas a las que atiende tu organización?`

Respuestas finales:

| Option ID | Texto final para el usuario |
| --- | --- |
| `local` | En mi ciudad o zona cercana |
| `regional` | En varias ciudades de mi región |
| `national` | En diferentes partes del país |
| `global` | En varios países |
| `mixed` | Una parte importante está en mi zona y otra fuera de ella |

Pista:
`Si atiendes varias zonas, elige dónde está la mayor parte de tus clientes. Usa la opción combinada solo si tanto tu zona como otros lugares representan una parte importante de tu actividad.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE DE CLASIFICACIÓN`.
- Multiselección: `NO`.
- Unknown: `NO`.
- Other: `NO`.
- No aplica: `NO`.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: alcance geográfico principal de las personas atendidas.
- `mixed` no se usa por casos aislados; exige presencia material tanto local como fuera de la zona.
- `local` no significa menor madurez y `global` no significa mayor madurez; la respuesta no aporta score ni selecciona licencia por sí sola.
- Separación conceptual: esta pregunta determina DÓNDE están; `q2_delivery` determina CÓMO se atiende/entrega; `q2_customer_buyer` determina A QUIÉN se vende; `q2_monetization` determina CÓMO se generan ingresos.

## 16 — `q2_customer_buyer`

### 1. Pregunta actual

¿A quién se dirige principalmente lo que ofreces?

- Copy canónico ejecutable: versión semántica `1`, módulo `classification`.
- Variantes visibles ejecutables:
- Variante 1 (`businessModel=nonprofit`):
  - Pregunta visible: ¿Con quién se relaciona principalmente tu organización?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `b2c` | `b2c` | Personas individuales | produce {"kind":"customerBuyer","value":"b2c","provenance":"explicit_declaration"} |
| `b2b` | `b2b` | Otras empresas u organizaciones | produce {"kind":"customerBuyer","value":"b2b","provenance":"explicit_declaration"} |
| `mixed` | `mixed` | Ambos, en proporciones similares | produce {"kind":"customerBuyer","value":"mixed","provenance":"explicit_declaration"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Sin regla local: es elegible cuando el planner considera relevante su módulo.

Puede aparecer desde el conjunto inicial de elegibles del banco. No hay condición local que la bloquee; el presupuesto, el módulo y el planner pueden posponerla. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `classification` y declara los propósitos `classification`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

business context and operational capacity

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Opciones con señales: customerBuyer=b2c, customerBuyer=b2b, customerBuyer=mixed.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `b2c` → {"option":"b2c","kind":"customerBuyer","value":"b2c","provenance":"explicit_declaration"}
- `b2b` → {"option":"b2b","kind":"customerBuyer","value":"b2b","provenance":"explicit_declaration"}
- `mixed` → {"option":"mixed","kind":"customerBuyer","value":"mixed","provenance":"explicit_declaration"}

### 9. Relación con otras preguntas

- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_delivery`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_monetization`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_other_staff`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_demand_trend`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Comprador» en la base no valía antes del lanzamiento.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE` de copy y definición de `mixed`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia la definición visible de `mixed` sin exigir proporciones similares y conserva tres estados simples para routing.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE COPY Y DEFINICIÓN DE MIXED`

Decisión final:
`KEEP + REWRITE`

Pregunta final:
`¿A quién está dirigido principalmente lo que ofreces?`

Respuestas finales:

| Option ID | Texto final para el usuario |
| --- | --- |
| `b2c` | Principalmente a personas |
| `b2b` | Principalmente a empresas, organizaciones o instituciones |
| `mixed` | A personas y también a empresas u organizaciones |

Pista:
`Si uno de los dos representa casi toda tu actividad, elige ese. Marca “ambos” cuando los dos formen parte habitual de tu negocio.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE DE CLASIFICACIÓN`.
- Multiselección: `NO`.
- Unknown: `NO`.
- Other: `NO`.
- No aplica: `NO`.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: orientación principal a personas, empresas/organizaciones/instituciones o ambos grupos.
- `mixed` no exige proporciones similares; ambos grupos deben formar parte habitual de la actividad.
- B2B no implica automáticamente un pipeline complejo, no selecciona una licencia y no significa 50/50.
- Una relación ocasional con una empresa no convierte el negocio en `mixed`.
- Puede conservarse el ID `mixed`; cambia su definición visible y semántica.

## 17 — `q2_process_systemization`

### 1. Pregunta actual

En las tareas que se repiten, ¿hay una forma definida de hacerlas o suelen depender de la memoria y el criterio de cada persona?

- Copy canónico ejecutable: versión semántica `1`, módulo `maturity`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `documented_process` | `documented_process` | Hay una forma definida (documentada, con plantilla o herramienta) | produce {"kind":"systemization","value":true,"provenance":"observed_fact"} |
| `partial` | `partial` | Es una mezcla: algunas tareas tienen proceso definido y otras todavía dependen de cada persona | valor operativo; no declara kind especial ni señal adicional |
| `memory_dependent` | `memory_dependent` | Depende de la memoria o el criterio de cada persona | produce {"kind":"systemization","value":false,"provenance":"observed_fact"} |
| `unsure` | `unsure` | No lo había pensado de esa forma | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: eqV2(`q2_has_customers`, `yes`).

Aparece cuando `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `maturity` y declara los propósitos `maturity`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

Si las tareas habituales se hacen siempre de la misma forma o dependen de quién las haga.

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: systemization=true, systemization=false.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `documented_process` → {"option":"documented_process","kind":"systemization","value":true,"provenance":"observed_fact"}
- `memory_dependent` → {"option":"memory_dependent","kind":"systemization","value":false,"provenance":"observed_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_capacity_signal`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_demand_trend`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_regularity`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `MISSING_UNKNOWN`, `MISSING_NOT_APPLICABLE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** La mezcla real de procesos necesitaba ayuda para no forzar una respuesta binaria.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = MAYBE** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Piensa en responder mensajes, registrar pedidos o dar seguimiento. No depende del tamaño del equipo.
- Panel de ayuda: understand=Si las tareas habituales se hacen siempre de la misma forma o dependen de quién las haga.; distinction=Una forma definida existe aunque no esté escrita, si todos la siguen igual; la mezcla real es una opción válida.; why=Ayuda a distinguir una operación que crece con orden de una que depende del esfuerzo de cada persona.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `ADD_NOT_APPLICABLE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia copy y prioridad; deja de ser una pregunta temprana obligatoria y pasa a profundización operativa cuando aporta información adicional.

### 15. Decisión humana

Estado:
`APROBADA CON SIMPLIFICACIÓN Y CAMBIO DE PRIORIDAD`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE`

Pregunta final:
`¿Cómo manejas las tareas que se repiten en tu actividad?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `defined` | Normalmente se hacen de la misma manera |
| `partial` | Algunas tienen una forma clara y otras se resuelven sobre la marcha |
| `informal` | La mayoría depende de la memoria o de cómo se resuelva en el momento |
| `unknown` | No estoy seguro |

Pista:
`Por ejemplo: responder consultas, registrar pedidos, preparar una cotización, confirmar una cita o hacer seguimiento.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — OPERACIONES`.
- Candidato adicional: `COMMERCIAL / LICENSE-FIT SUPPORTING EVIDENCE`.
- Multiselección: `NO`.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: `NO`.
- ANSWER_AXIS: `CONSISTENT` con la propuesta.
- Qué determina: qué tan repetible y consistente es la forma de realizar tareas habituales.
- No determina documentación, herramientas, CRM, necesidad de automatización ni licencia.
- Proceso claro no equivale a proceso documentado; trabajar solo no hace que deje de aplicar.
- Una respuesta informal no selecciona una licencia por sí sola.

## 18 — `q2_capacity_signal`

### 1. Pregunta actual

En los últimos meses, ¿qué ha pasado con tu capacidad para atender la demanda? Elige todas las que apliquen.

- Copy canónico ejecutable: versión semántica `1`, módulo `maturity`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `waitlist_growing` | `waitlist_growing` | La lista de espera o el trabajo pendiente ha ido creciendo | produce {"kind":"capacityPressure","value":true,"provenance":"observed_fact"} |
| `expanded` | `expanded` | Amplié la capacidad (personas, espacio u horas) para atender más demanda | produce {"kind":"capacityExpansion","value":true,"provenance":"observed_fact"} |
| `stable` | `stable` | Ninguna de las anteriores: mi capacidad se ha mantenido estable | exclusiva en multi-select · produce {"kind":"capacityPressure","value":false,"provenance":"observed_fact"}; {"kind":"capacityExpansion","value":false,"provenance":"observed_fact"} |
| `unknown` | `unknown` | No estoy seguro | kind=unknown · exclusiva en multi-select |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`MULTI_SELECT`

### 4. Cuándo aparece

Regla nativa: eqV2(`q2_regularity`, `regular`).

Aparece cuando `q2_regularity` respondió exactamente `regular`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_regularity`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `maturity` y declara los propósitos `maturity`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

Si en los últimos meses te ha faltado capacidad o la has tenido que ampliar.

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: capacityPressure=true, capacityExpansion=true, capacityPressure=false, capacityExpansion=false.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `waitlist_growing` → {"option":"waitlist_growing","kind":"capacityPressure","value":true,"provenance":"observed_fact"}
- `expanded` → {"option":"expanded","kind":"capacityExpansion","value":true,"provenance":"observed_fact"}
- `stable` → {"option":"stable","kind":"capacityPressure","value":false,"provenance":"observed_fact"}
- `stable` → {"option":"stable","kind":"capacityExpansion","value":false,"provenance":"observed_fact"}

### 9. Relación con otras preguntas

- `q2_regularity`: dependencia de routing explícita en la condición.
- `q2_demand_trend`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_has_customers`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_process_systemization`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_buyer`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.
- `q2_customer_reach`: comparte  y subcriterio business context and operational capacity; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
No aplica: la pregunta ya es `MULTI_SELECT` en el ejecutable. Su contrato exige selección múltiple y aplica exclusividad donde se declara.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** La pista visible explicaba el modelo interno y remitía a otra pregunta.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Piensa en los últimos meses en conjunto, no en una semana buena o mala.
- Panel de ayuda: understand=Si en los últimos meses te ha faltado capacidad o la has tenido que ampliar.; distinction=Puedes marcar las dos primeras a la vez; elige «Ninguna» solo si la capacidad no cambió.; why=Junto con la evolución de la demanda, ayuda a distinguir una actividad estable de una que está creciendo.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + KEEP_MULTI_SELECT + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: amplía la señal de presión más allá de listas de espera y mueve la pregunta a capacidad/operaciones adaptativa sin convertirla en score digital directo.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE COPY Y SEÑAL DE PRESIÓN`

Decisión final:
`KEEP + REWRITE + KEEP_MULTI_SELECT + DEFER_TO_ADAPTIVE`

Pregunta final:
`En los últimos meses, ¿cuál de estas situaciones ha pasado en tu actividad?`

Ayuda:
`Puedes elegir más de una.`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `capacity_pressure` | A veces tenemos más trabajo del que podemos atender bien |
| `capacity_expanded` | Hemos aumentado horarios, personal, espacio o recursos para poder atender más |
| `stable` | La capacidad que tenemos ha sido suficiente |
| `unknown` | No estoy seguro |

Pista:
`Piensa en los últimos meses. Por ejemplo, si se acumulan pendientes, tardas más en atender, trabajas más horas o has tenido que rechazar trabajo.`

Notas Yoan/ChatGPT:

- Tipo: `MULTI_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — CAPACIDAD / OPERACIONES`.
- Exclusivas: `stable`, `unknown`.
- Multiselección válida: `capacity_pressure + capacity_expanded`.
- Unknown: `SÍ`.
- No aplica: `NO` en interfaz; si no existe actividad suficiente para evaluar capacidad, el routing evita mostrarla.
- ANSWER_AXIS: `CONSISTENT` con la nueva redacción.
- Qué determina: presión real sobre capacidad y expansión de personas, tiempo, espacio o recursos.
- Presión no significa buen desempeño digital; ampliar capacidad no significa automáticamente crecimiento y ninguna señal selecciona una licencia por sí sola.
- Interpretar junto con demanda, equipo, procesos y complejidad; no recomendar Barrio/Ciudad por sí sola.

## 19 — `q2_local_discovery`

### 1. Pregunta actual

Cuando alguien de tu zona te descubre por primera vez, ¿cómo suele ocurrir con más frecuencia?

- Copy canónico ejecutable: versión semántica `1`, módulo `local`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `maps_search` | `maps_search` | Buscando en Google o en mapas | valor operativo; no declara kind especial ni señal adicional |
| `referral` | `referral` | Por recomendación de alguien | valor operativo; no declara kind especial ni señal adicional |
| `social` | `social` | Por redes sociales | valor operativo; no declara kind especial ni señal adicional |
| `walk_by` | `walk_by` | Pasando cerca, de forma directa | valor operativo; no declara kind especial ni señal adicional |
| `paid_ads` | `paid_ads` | Por un anuncio pagado | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No estoy seguro | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(orV2(archetypeIncludes(`local`), archetypeIncludes(`retail`), archetypeIncludes(`hospitality`)), notEqV2(`q2_has_customers`, `no`)). Regla material: andV2(orV2(archetypeIncludes(`local_service`), archetypeIncludes(`appointments`)), eqV2(`q2_has_customers`, `yes`)).

Aparece cuando el arquetipo resuelto contiene `local` entre sus componentes o el arquetipo resuelto contiene `retail` entre sus componentes o el arquetipo resuelto contiene `hospitality` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable nativa y tampoco se activa la condición material. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `local` y declara los propósitos `diagnostic`; aporta evidencia direct para Discovery, Measurement & Optimization. Puede seleccionarse en profundización/evidencia material.

### 6. Qué intenta determinar

Por qué vía te descubre por primera vez la gente nueva de tu zona.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..
- **SUPPORTING:** Measurement & Optimization (`measurement_optimization`). Evalúa: Origen, resultados, revisión comparativa y capacidad de aprender..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [presencia, alcance], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `discovery`: `maps_search` → established; `social` → established; `referral` → partial; `paid_ads` → partial; `walk_by` → weak
- `measurement_optimization`: `maps_search` → partial; `social` → partial; `referral` → partial; `paid_ads` → partial; `walk_by` → partial; `unknown` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_lead_source`: comparte dimensión Discovery, Measurement & Optimization y subcriterio known source of demand and source confidence; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_traffic_sources`: comparte dimensión Discovery, Measurement & Optimization y subcriterio known source of demand and source confidence; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_channel_concentration`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_acquisition_dependency`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_promotions`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Etiquetas mezclaban formas verbales distintas.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Por qué vía te descubre por primera vez la gente nueva de tu zona.; distinction=Elige la vía más frecuente, no la que te gustaría que fuera.; why=Muestra si te encuentran cuando te buscan o sobre todo por casualidad o recomendación.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `DEEPENING_ONLY`. Si se elimina se pierde una comprobación adaptativa solo cuando el planner detecta necesidad material.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `ADAPTIVE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `DEFER_TO_ADAPTIVE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_MIXED + ADD_OTHER + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia semántica y copy, añade mixed/other, elimina scoring automático por tipo de canal y exige actividad confirmada antes de preguntar.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE SEMÁNTICA, COPY Y ROUTING`

Decisión final:
`KEEP + REWRITE + ADD_MIXED + ADD_OTHER + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`¿Cómo te conoce por primera vez la mayoría de tus clientes nuevos?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `maps_search` | Buscando en Google o Google Maps |
| `referral` | Por recomendación de otra persona |
| `social` | Por redes sociales |
| `walk_by` | Porque ven el local al pasar |
| `paid_ads` | Por anuncios pagados |
| `mixed` | Por varios canales, sin uno claramente principal |
| `other` | De otra forma |
| `unknown` | No lo sé |

Pista:
`Piensa en clientes nuevos, no en quienes ya te conocen o han comprado antes.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — DISCOVERY`.
- Multiselección: `NO`.
- Unknown: `SÍ` mediante `unknown`.
- Other: `SÍ`; Mixed: `SÍ`.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: principal forma declarada en que nuevos clientes conocen el negocio.
- El canal describe cómo llega la persona, no la calidad de presencia digital. Eliminar scoring automático: maps_search no equivale a established; referral/paid_ads no equivalen a partial; walk_by no equivale a weak.
- No usar una respuesta concreta como evidencia positiva de Measurement; comprobar conocimiento real con preguntas específicas como `q2_measurement_source_confidence`.
- Routing: exigir `q2_has_customers = yes` y eliminar dependencia de `notEqV2(..., no)`.

## 20 — `q2_local_presence_consistency`

### 1. Pregunta actual

Si alguien te busca en internet ahora mismo, ¿encuentra tu dirección, horario y forma de contacto correctos y coincidentes en todos los sitios?

- Copy canónico ejecutable: versión semántica `1`, módulo `local`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=prelaunch`):
  - Pregunta visible: Si alguien buscara hoy tu negocio en internet, ¿encontraría ya tu dirección, horario y forma de contacto correctos?
  - Etiquetas visibles por opción: `no` → No, todavía no está publicado

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `consistent` | `consistent` | Sí, todo está correcto y coincide | valor operativo; no declara kind especial ni señal adicional |
| `partial` | `partial` | Una parte está desactualizada o incompleta | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, es difícil encontrar esa información | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he revisado | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: orV2(archetypeIncludes(`local`), archetypeIncludes(`retail`), archetypeIncludes(`hospitality`)).

Aparece cuando el arquetipo resuelto contiene `local` entre sus componentes o el arquetipo resuelto contiene `retail` entre sus componentes o el arquetipo resuelto contiene `hospitality` entre sus componentes. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `local` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Foundation, Discovery.

### 6. Qué intenta determinar

Si los datos básicos para encontrarte y contactarte están correctos en internet.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Digital Foundation (`digital_foundation`). Evalúa: Presencia, información esencial, acceso y continuidad de los activos digitales..
- **SUPPORTING:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [presencia, contacto], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_foundation`: `consistent` → strong; `partial` → partial; `no` → missing
- `discovery`: `consistent` → strong; `partial` → partial; `no` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_local_discovery`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_local_foot_traffic`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_lead_source`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_channel_concentration`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_content_consistency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_acquisition_dependency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Antes del lanzamiento «no encuentra nada» significa «aún no publicado».

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si los datos básicos para encontrarte y contactarte están correctos en internet.; distinction=Basta con que un dato esté desactualizado en un sitio visible para que no coincida.; why=Un dato equivocado puede hacer que alguien que ya te buscó no llegue.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ROUTING_REVIEW`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: ajusta el eje a información aplicable, revalida aplicabilidad local/digital y separa operación establecida de pre-lanzamiento.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y AJUSTE DE APLICABILIDAD`

Decisión final:
`KEEP + REWRITE + ROUTING_REVIEW`

Pregunta final:
`Cuando alguien busca tu negocio en internet, ¿encuentra información correcta y actualizada para ubicarte o contactarte?`

Respuestas finales:

| Option ID | Texto final para el usuario |
| --- | --- |
| `consistent` | Sí, la información principal está correcta y actualizada |
| `partial` | Hay algunos datos desactualizados, diferentes o incompletos |
| `no` | No, esa información es difícil de encontrar o todavía está incompleta |
| `unknown` | No lo he revisado |

Pista:
`Piensa en datos como teléfono, WhatsApp, dirección u horario, solo cuando apliquen a tu negocio. Revisa principalmente los lugares donde tus clientes suelen encontrarte.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE IMPORTANTE — LOCAL / DIGITAL FOUNDATION`.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: no se ofrece como respuesta; la aplicabilidad de cada dato se resuelve por contexto.
- ANSWER_AXIS: `CONSISTENT` con la nueva redacción.
- Evidencia: Digital Foundation → DIRECT; Discovery → SUPPORTING.
- Qué determina: si la información digital básica y aplicable está actualizada y es coherente en los principales puntos de presencia.
- No exigir dirección u horario públicos cuando no aplican; no interpretar «todos los sitios» de forma absoluta.
- La ausencia de un dato no aplicable no reduce el resultado.
- Prelaunch no debe interpretarse igual que información incorrecta de un negocio operativo; requiere routing/scoring específico.

## 21 — `q2_local_repeat_customers`

### 1. Pregunta actual

De las personas que ya te compraron o visitaron una vez, ¿regresan con cierta frecuencia?

- Copy canónico ejecutable: versión semántica `1`, módulo `local`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=nonprofit`):
  - Pregunta visible: De las personas que ya participaron o recibieron apoyo de tu organización, ¿vuelven con cierta frecuencia?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_regular` | `yes_regular` | Sí, con cierta regularidad | valor operativo; no declara kind especial ni señal adicional |
| `rarely` | `rarely` | Pocas veces | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he seguido de cerca | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(orV2(archetypeIncludes(`local`), archetypeIncludes(`retail`), archetypeIncludes(`hospitality`)), eqV2(`q2_has_customers`, `yes`)).

Aparece cuando el arquetipo resuelto contiene `local` entre sus componentes o el arquetipo resuelto contiene `retail` entre sus componentes o el arquetipo resuelto contiene `hospitality` entre sus componentes y `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `local` y declara los propósitos `diagnostic`; aporta evidencia direct para Relationship & Recurrence.

### 6. Qué intenta determinar

continuity, follow-up and return

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `yes_regular` → established; `rarely` → weak; `no` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_confirmation_reminders`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_rebooking`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_sales_cycle`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_audience_ownership`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_followup`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Te compraron» no encajaba en organizaciones.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_REVIEW`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: restringe la elegibilidad a modelos donde repetir es razonablemente esperable y evita usar recurrencia como sustituto de seguimiento.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE APLICABILIDAD Y SEMÁNTICA`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_REVIEW`

Pregunta final:
`Después de una primera compra o visita, ¿qué tan seguido tus clientes vuelven?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `regular` | Muchos vuelven con cierta regularidad |
| `sometimes` | Algunos vuelven de vez en cuando |
| `rarely` | Muy pocos vuelven |
| `unknown` | No lo sé o no lo he revisado |

Pista:
`Piensa en el comportamiento habitual de tus clientes, no en casos aislados.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — RECURRENCIA`.
- Aplicabilidad: solo si `q2_has_customers = yes` y volver a comprar, visitar o participar es razonablemente esperable para ese modelo.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: preferiblemente resolverlo por routing.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: recurrencia observada de clientes o participantes.
- Baja recurrencia no implica automáticamente mala relación; alta recurrencia no demuestra buen seguimiento.
- Mantener como evidencia de RECURRENCIA cuando aplique; no usarla como prueba suficiente de FOLLOW-UP o gestión de relación.
- No penalizar negocios donde la compra normalmente ocurre una sola vez.

## 22 — `q2_reputation_flow`

### 1. Pregunta actual

¿Qué tan seguido te llegan reseñas o recomendaciones nuevas de clientes?

- Copy canónico ejecutable: versión semántica `2`, módulo `reputation`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=clinical`):
  - Pregunta visible: ¿Qué tan seguido te llegan reseñas o recomendaciones nuevas de pacientes?
- Variante 2 (`terminology=nonprofit`):
  - Pregunta visible: ¿Qué tan seguido te llegan opiniones o recomendaciones nuevas de personas que conocen tu labor?
- Variante 3 (`terminology=creator`):
  - Pregunta visible: ¿Qué tan seguido te llegan reseñas, testimonios o recomendaciones nuevas de quienes te compran o te siguen?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `steady` | `steady` | Me llegan con cierta regularidad | valor operativo; no declara kind especial ni señal adicional |
| `occasional` | `occasional` | De vez en cuando, pero no de forma constante | valor operativo; no declara kind especial ni señal adicional |
| `rare` | `rare` | Muy rara vez o nunca | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo sé, no lo reviso seguido | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(orV2(archetypeIncludes(`local`), archetypeIncludes(`appointments`), archetypeIncludes(`professional`), archetypeIncludes(`retail`), archetypeIncludes(`hospitality`)), notEqV2(`q2_has_customers`, `no`)). Regla material: eqV2(`q2_has_customers`, `yes`).

Aparece cuando el arquetipo resuelto contiene `local` entre sus componentes o el arquetipo resuelto contiene `appointments` entre sus componentes o el arquetipo resuelto contiene `professional` entre sus componentes o el arquetipo resuelto contiene `retail` entre sus componentes o el arquetipo resuelto contiene `hospitality` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable nativa y tampoco se activa la condición material. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `reputation` y declara los propósitos `diagnostic`; aporta evidencia direct para Trust & Reputation. Puede seleccionarse en profundización/evidencia material.

### 6. Qué intenta determinar

Si llegan opiniones nuevas de personas satisfechas que otros puedan ver o escuchar.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Trust & Reputation (`trust_reputation`). Evalúa: Prueba, reputación, autoridad y claridad percibida..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [confianza], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `trust_reputation`: `steady` → established; `occasional` → partial; `rare` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_professional_authority_signals`: comparte dimensión Trust & Reputation y subcriterio proof, authority and external validation; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Pacientes» aplicaba a todo bienestar (gimnasios, spas); sin variante para organizaciones. Solo dos niveles: falta un nivel intermedio (resuelto en DIAG-V3-08F.1 con `occasional`, versión 2).

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Piensa en los últimos meses: reseñas en internet, testimonios o recomendaciones que te llegan.
- Panel de ayuda: understand=Si llegan opiniones nuevas de personas satisfechas que otros puedan ver o escuchar.; distinction=«Con cierta regularidad» es casi todos los meses; «de vez en cuando», algunos meses sí y otros no. Cuenta lo reciente, no la buena opinión general que tengan de ti.; why=Quien no te conoce suele decidir por lo que otros dicen de ti.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `DEEPENING_ONLY`. Si se elimina se pierde una comprobación adaptativa solo cuando el planner detecta necesidad material.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `ADAPTIVE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `DEFER_TO_ADAPTIVE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE`. Se separa prueba social visible de recomendaciones privadas.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia el constructo, restringe la elegibilidad a actividad real confirmada y revalida la evidencia directa del subcomponente visible social proof.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DEL CONSTRUCTO Y ROUTING`

Decisión final:
`KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`¿Tienes reseñas, testimonios u opiniones visibles de personas que ya tuvieron experiencia contigo?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `strong` | Sí, tengo varias y siguen llegando nuevas |
| `partial` | Sí, pero son pocas o llevan tiempo sin actualizarse |
| `weak` | Casi no tengo reseñas o testimonios visibles |
| `unknown` | No lo sé o no lo he revisado |

Pista:
`Piensa en reseñas de Google, testimonios en tu web, redes u otros lugares que una persona nueva pueda consultar.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — TRUST / VISIBLE PROOF`.
- Aplicabilidad: solo cuando `q2_has_customers = yes` y la prueba social visible sea relevante para la ruta.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: preferiblemente resolver por routing.
- ANSWER_AXIS: `CONSISTENT` con la nueva propuesta.
- Qué determina: existencia y actualidad aproximada de prueba social visible.
- Eliminar del constructo las recomendaciones privadas o boca a boca; pueden generar adquisición, pero no son necesariamente visibles para terceros.
- Evidencia: DIRECT para el subcomponente VISIBLE SOCIAL PROOF, no conclusión completa sobre Trust & Reputation.
- Pocas reseñas no significa mala reputación; muchas reseñas no prueban por sí solas calidad absoluta.
- Reemplazar `notEqV2(q2_has_customers, no)` por actividad real explícitamente confirmada.

## 23 — `q2_service_area_clarity`

### 1. Pregunta actual

¿Tienes definida la zona hasta donde te conviene desplazarte para atender un servicio?

- Copy canónico ejecutable: versión semántica `1`, módulo `local_service`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `defined_area` | `defined_area` | Sí, tengo una zona definida y la respeto | valor operativo; no declara kind especial ni señal adicional |
| `flexible_but_aware` | `flexible_but_aware` | Soy flexible, pero sé cuándo no me conviene ir | valor operativo; no declara kind especial ni señal adicional |
| `no_limit` | `no_limit` | No, voy a cualquier lugar sin evaluarlo | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No estoy seguro | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: archetypeIncludes(`local_service`).

Aparece cuando el arquetipo resuelto contiene `local_service` entre sus componentes. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `local_service` y declara los propósitos `diagnostic`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

service-area context

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [alcance], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_service_quote_followup`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_service_quote_practice`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_service_repeat_referral`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_service_response_speed`: comparte ; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** La opción de incertidumbre decía «No lo he definido» (un hecho); presuponía servicios ya prestados.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Se trata de hasta dónde te desplazas tú, no de dónde está tu público.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE_CANDIDATE`. No se propone reescritura para conservarla por inercia.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: retirar la pregunta exige localizar todas sus referencias y demostrar que ninguna decisión material depende de ella; el posible uso futuro queda fuera del diagnóstico principal.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN DEL DIAGNÓSTICO PRINCIPAL`

Decisión final:
`REMOVE_CANDIDATE`

Pregunta actual:
`¿Tienes definida la zona hasta donde te conviene desplazarte para atender un servicio?`

Destino:
`NO` mostrar en el diagnóstico principal.

Razón:
Mide principalmente una decisión operativa/geográfica, no el estado de la presencia digital; no genera score dimensional ni señales diagnósticas propias y parte del contexto puede obtenerse con `q2_delivery` y `q2_customer_reach`.

Notas Yoan/ChatGPT:

- CORE/ADAPTIVE: `REMOVE FROM DIAGNOSTIC`.
- No moverla a License Fit.
- Posible reutilización futura: auditoría/configuración específica de servicio local, por ejemplo «¿En qué zonas quieres recibir clientes o prestar servicios?». Usos: Google Business Profile, segmentación geográfica, campañas locales y definición operativa del área de servicio.
- Commercial / License Fit: `NO`.
- Scoring: `NO`.
- Antes de eliminar técnicamente, comprobar referencias a `q2_service_area_clarity`, `defined_area`, `flexible_but_aware` y `no_limit`. Si ninguna decisión material depende de ellas, retirar la pregunta del banco productivo.
- Objetivo UX: no preguntar algo solo porque puede ser interesante; cada pregunta debe cambiar una decisión real del diagnóstico.

## 24 — `q2_service_response_speed`

### 1. Pregunta actual

Cuando alguien te contacta por primera vez pidiendo tu servicio, ¿qué suele pasar?

- Copy canónico ejecutable: versión semántica `1`, módulo `local_service`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `fast` | `fast` | Respondo rápido, casi siempre el mismo día | valor operativo; no declara kind especial ni señal adicional |
| `delayed` | `delayed` | Respondo, pero puede tardar más de un día | valor operativo; no declara kind especial ni señal adicional |
| `some_lost` | `some_lost` | Algunos contactos se me pierden o tardo demasiado en contestar | produce {"kind":"friction","value":"follow_up","provenance":"derived_fact"} |
| `unknown` | `unknown` | No lo he medido | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`local_service`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `local_service` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `local_service` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Conversion & Access.

### 6. Qué intenta determinar

access, booking and concrete action

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento, contacto], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=follow_up.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `fast` → strong; `delayed` → partial; `some_lost` → weak

**Señales producidas por opciones:**
- `some_lost` → {"option":"some_lost","kind":"friction","value":"follow_up","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_service_quote_followup`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_method`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_checkout_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Consulta» como primer contacto se sustituye por una descripción explícita.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ROUTING_FIX`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: corrige el eje semántico del primer contacto, separa la señal de seguimiento posterior y exige actividad real confirmada.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DEL EJE Y ROUTING FIX`

Decisión final:
`KEEP + REWRITE + ROUTING_FIX`

Pregunta final:
`Cuando una persona nueva te contacta, ¿qué tan bien logras responderle a tiempo?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `strong` | Casi siempre recibe respuesta a tiempo |
| `partial` | Normalmente respondo, pero a veces me demoro |
| `weak` | A veces algunos mensajes o contactos quedan sin responder |
| `unknown` | No estoy seguro |

Pista:
`Piensa en llamadas, WhatsApp, mensajes o formularios de personas que te contactan por primera vez.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — LOCAL SERVICE / CONVERSION`.
- Aplicabilidad: solo cuando el arquetipo incluye `local_service`, `q2_has_customers = yes` y existe un primer contacto que requiere respuesta.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: preferiblemente resolver por routing.
- ANSWER_AXIS: `MIXED` actualmente; `CONSISTENT` con la propuesta.
- Qué determina: confiabilidad del primer contacto, es decir, si una persona interesada consigue respuesta sin perderse.
- Evidencia: DIRECT → Conversion & Access.
- Eliminar la señal actual `some_lost → friction=follow_up`; sustituir conceptualmente por `initial_contact_response_issue` o equivalente dentro de Conversion & Access.
- Responder el mismo día no es un umbral universal y no se exige medición formal.
- Primer contacto y seguimiento posterior son conceptos distintos; la pregunta no determina por sí sola necesidad de CRM o automatización.
- Sustituir `notEqV2(q2_has_customers, no)` por actividad real explícitamente confirmada.

## 25 — `q2_service_quote_practice`

### 1. Pregunta actual

¿Sueles dar una cotización o estimado antes de hacer el trabajo?

- Copy canónico ejecutable: versión semántica `1`, módulo `local_service`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes` | `yes` | Sí, casi siempre | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, cobro directamente o es tarifa fija | valor operativo; no declara kind especial ni señal adicional |
| `varies` | `varies` | Depende del trabajo | valor operativo; no declara kind especial ni señal adicional |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`local_service`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `local_service` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `local_service` y declara los propósitos `diagnostic, routing`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

quote-follow-up routing context

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_service_area_clarity`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_service_quote_followup`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_service_repeat_referral`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_service_response_speed`: comparte ; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ROUTING_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE + MERGE_WITH_Q2_SERVICE_QUOTE_FOLLOWUP`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION` y recalibración de la ruta por cambio en número/secuencia de preguntas.
- Motivo: su única función material era decidir si debía aparecer la pregunta posterior de seguimiento de cotizaciones.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN Y FUSIÓN`

Decisión final:
`REMOVE + MERGE_WITH_Q2_SERVICE_QUOTE_FOLLOWUP`

Pregunta actual:
`¿Sueles dar una cotización o estimado antes de hacer el trabajo?`

Destino:
No mostrar como pregunta independiente; integrar la aplicabilidad dentro de `q2_service_quote_followup`.

Nueva estrategia:
La pregunta combinada debe incluir `No suelo enviar cotizaciones antes del trabajo` como `NOT_APPLICABLE`, no como respuesta negativa.

Notas Yoan/ChatGPT:

- No aporta score, evidencia dimensional ni señal diagnóstica propia.
- La futura pregunta combinada debe exigir `local_service` y `q2_has_customers = yes`.
- Beneficio UX: 2 preguntas actuales → 1 pregunta futura.
- Antes de eliminar técnicamente, verificar referencias a `q2_service_quote_practice`, `yes`, `no`, `varies` y migrar la aplicabilidad de `q2_service_quote_followup`.
- Commercial / License Fit: `NO` por sí sola.

## 26 — `q2_service_quote_followup`

### 1. Pregunta actual

Después de dar una cotización, si la persona no responde enseguida, ¿qué tan seguido le das seguimiento?

- Copy canónico ejecutable: versión semántica `1`, módulo `local_service`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `always` | `always` | Siempre hago seguimiento | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces | valor operativo; no declara kind especial ni señal adicional |
| `rarely` | `rarely` | Casi nunca | produce {"kind":"friction","value":"follow_up","provenance":"derived_fact"} |
| `unknown` | `unknown` | No lo he pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`local_service`), inV2(`q2_service_quote_practice`, [`yes`, `varies`])).

Aparece cuando el arquetipo resuelto contiene `local_service` entre sus componentes y `q2_service_quote_practice` respondió uno de: `yes`, `varies`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_service_quote_practice`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `local_service` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Conversion & Access.

### 6. Qué intenta determinar

access, booking and concrete action

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=follow_up.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `always` → strong; `sometimes` → partial; `rarely` → missing

**Señales producidas por opciones:**
- `rarely` → {"option":"rarely","kind":"friction","value":"follow_up","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_service_quote_practice`: dependencia de routing explícita en la condición.
- `q2_service_response_speed`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_method`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_checkout_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + MERGE_APPLICABILITY_FROM_Q25 + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: absorbe la aplicabilidad de q25, cambia la evidencia principal a Relationship & Recurrence y requiere evitar duplicación con el follow-up general.

### 15. Decisión humana

Estado:
`APROBADA CON FUSIÓN DE APLICABILIDAD Y CAMBIO DE DIMENSIÓN`

Decisión final:
`KEEP + REWRITE + MERGE_APPLICABILITY_FROM_Q25 + DEFER_TO_ADAPTIVE`

Pregunta final:
`Cuando envías una cotización y la persona no responde, ¿qué haces normalmente?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `consistent` | Normalmente vuelvo a contactarla para saber si quiere continuar |
| `sometimes` | A veces vuelvo a contactarla, pero no siempre |
| `rarely` | Normalmente no vuelvo a contactarla si no responde |
| `not_applicable` | No suelo enviar cotizaciones antes del trabajo |
| `unknown` | No estoy seguro de qué pasa normalmente |

Pista:
`Si solo das cotizaciones para algunos trabajos, responde pensando en esos casos.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — FOLLOW-UP / LOCAL SERVICE`.
- Aplicabilidad: `local_service` + `q2_has_customers = yes` + necesidad material de evidencia de seguimiento/conversión.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `SÍ` mediante `not_applicable`; queda fuera del scoring.
- Other: `NO`.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: si una oportunidad pendiente después de una cotización se retoma habitualmente.
- Evidencia propuesta: Relationship & Recurrence → DIRECT; Conversion & Access → SUPPORTING.
- `rarely` puede producir conceptualmente `friction=follow_up`, con recalibración; no representa todo el sistema general de seguimiento.
- No enviar cotizaciones no es una debilidad; seguimiento no significa insistir repetidamente.
- Evitar preguntar también `q2_followup_general_process` si esta evidencia ya es suficiente, salvo necesidad real de profundización.
- Eliminar la dependencia de `q2_service_quote_practice` y usar la condición material indicada.

## 27 — `q2_service_repeat_referral`

### 1. Pregunta actual

De los clientes que ya atendiste, ¿te recomiendan con otras personas o te vuelven a llamar para otro trabajo?

- Copy canónico ejecutable: versión semántica `1`, módulo `local_service`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `both` | `both` | Sí, ambas cosas con cierta regularidad | valor operativo; no declara kind especial ni señal adicional |
| `referrals_only` | `referrals_only` | Sobre todo me recomiendan | valor operativo; no declara kind especial ni señal adicional |
| `repeat_only` | `repeat_only` | Sobre todo me vuelven a llamar | valor operativo; no declara kind especial ni señal adicional |
| `rarely` | `rarely` | Casi ninguna de las dos | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he seguido de cerca | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`local_service`), eqV2(`q2_has_customers`, `yes`)).

Aparece cuando el arquetipo resuelto contiene `local_service` entre sus componentes y `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `local_service` y declara los propósitos `diagnostic`; aporta evidencia direct para Relationship & Recurrence.

### 6. Qué intenta determinar

Si los clientes atendidos vuelven a llamar o recomiendan el servicio.
**MULTIPLE_CONSTRUCTS:** Sí. Una respuesta combina dos fenómenos distintos: que el cliente vuelva y que recomiende. La opción «ambas» reconoce la combinación, pero no permite observar cada eje por separado.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance, confianza], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `both` → strong; `repeat_only` → established; `referrals_only` → partial; `rarely` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_confirmation_reminders`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_rebooking`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_sales_cycle`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_audience_ownership`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_followup`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** UNCLEAR. La opción «ambas» permite coexistencia; antes de multi-select conviene decidir si el diagnóstico necesita dos observaciones separadas o una clasificación conjunta.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`, `MULTIPLE_CONSTRUCTS`, `RESPONSE_OPTIONS_INCOMPLETE`, `RESPONSE_OPTIONS_OVERLAP`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Referidos» es jerga; ahora «recomendaciones».

**ANSWER_AXIS = MIXED**
Una respuesta combina dos fenómenos distintos: que el cliente vuelva y que recomiende. La opción «ambas» reconoce la combinación, pero no permite observar cada eje por separado.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si los clientes atendidos vuelven a llamar o recomiendan el servicio.; distinction=Piensa en lo que pasa con la mayoría de los clientes, no en los más fieles.; why=Que vuelvan o recomienden muestra si la relación continúa después del trabajo.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **BAJA**
- Coherencia pregunta-respuestas: **MEDIA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **POR_CONFIRMAR**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `SPLIT`
- `NEEDS_DOMAIN_REVIEW`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`. No se divide ni se convierte en MULTI_SELECT.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina scoring que ordenaba incorrectamente recurrencia y recomendaciones como una sola capacidad.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN`

Decisión final:
`REMOVE`

Pregunta eliminada:
`De los clientes que ya atendiste, ¿te recomiendan con otras personas o te vuelven a llamar para otro trabajo?`

Notas Yoan/ChatGPT:

- Razón: mezcla recurrencia y recomendaciones, dos constructos distintos.
- No convertir a MULTI_SELECT ni dividir en dos preguntas.
- Recurrencia: cubrir mediante `q2_local_repeat_customers` solo cuando repetir sea natural para el negocio.
- Recomendaciones: cubrir principalmente mediante `q2_local_discovery` como fuente de descubrimiento/adquisición.
- Eliminar scoring actual: `both → strong`, `repeat_only → established`, `referrals_only → partial`, `rarely → missing`.
- CORE/ADAPTIVE: `REMOVE FROM DIAGNOSTIC`.
- Scoring: `REMOVE`. Commercial / License Fit: `NO`.
- Posible uso futuro: auditoría específica de fidelización, referidos o crecimiento boca a boca.
- Antes de eliminar técnicamente, buscar dependencias de `q2_service_repeat_referral`, `both`, `referrals_only`, `repeat_only` y `rarely`.

## 28 — `q2_appointments_booking_method`

### 1. Pregunta actual

¿Cómo se agenda hoy la mayoría de las citas?

- Copy canónico ejecutable: versión semántica `1`, módulo `appointments`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=clinical`):
  - Pregunta visible: ¿Cómo agendan hoy sus citas la mayoría de tus pacientes?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `self_book_online` | `self_book_online` | La persona reserva sola en línea | valor operativo; no declara kind especial ni señal adicional |
| `staff_manual` | `staff_manual` | Mi equipo o yo las anotamos a mano en una agenda o sistema | valor operativo; no declara kind especial ni señal adicional |
| `call_message` | `call_message` | Se acuerdan por llamada o mensaje, sin una agenda central | valor operativo; no declara kind especial ni señal adicional |
| `informal` | `informal` | No hay una forma definida; se acomodan como se puede | produce {"kind":"friction","value":"operations","provenance":"derived_fact"} |
| `unknown` | `unknown` | No estoy seguro | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`appointments`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `appointments` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `appointments` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Conversion & Access.

### 6. Qué intenta determinar

Cómo se agenda hoy la mayoría de las citas.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [contacto], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=operations.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `self_book_online` → strong; `staff_manual` → partial; `call_message` → weak; `informal` → missing

**Señales producidas por opciones:**
- `informal` → {"option":"informal","kind":"friction","value":"operations","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_booking_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_checkout_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_hospitality_delivery_takeaway`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_service_quote_followup`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `RESPONSE_OPTIONS_OVERLAP`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Lo agendamos manualmente» y «por llamada o mensaje» describían lo mismo con estados distintos.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Cómo se agenda hoy la mayoría de las citas.; distinction=Elige la vía por la que entra la mayoría, aunque existan otras; lo que distingue las opciones es si hay una agenda central.; why=Reservar con facilidad influye en cuántas personas interesadas terminan con una cita.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `NEEDS_DOMAIN_REVIEW`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina una inferencia débil que premiaba herramientas o modalidades de reserva en lugar de observar el resultado real del proceso.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN DEL DIAGNÓSTICO`

Decisión final:
`REMOVE`

Pregunta eliminada:
`¿Cómo se agenda hoy la mayoría de las citas?`

Notas Yoan/ChatGPT:

- Eliminar scoring actual: `self_book_online → strong`, `staff_manual → partial`, `call_message → weak`, `informal → missing`.
- Reserva online no equivale automáticamente a mejor conversión; agenda manual no es necesariamente peor; llamada o WhatsApp no son debilidad por sí mismos.
- La herramienta utilizada no determina licencia ni madurez operacional.
- Evidencia que la reemplaza: `q2_appointments_booking_friction`, `q2_appointments_lead_to_booking`, `q2_appointments_confirmation_reminders` y `q2_appointments_rebooking`.
- CORE/ADAPTIVE: `REMOVE FROM DIAGNOSTIC`. Scoring: `REMOVE`.
- Puede recuperarse como aclaración de implementación/configuración si existe una necesidad concreta de recomendar una solución de citas, sin usarla como puntuación de calidad.
- Antes de eliminar técnicamente, buscar dependencias de `q2_appointments_booking_method`, `self_book_online`, `staff_manual`, `call_message` e `informal`, y migrar cualquier dependencia externa al scoring.

## 29 — `q2_appointments_booking_friction`

### 1. Pregunta actual

¿Qué tan seguido cuesta encontrar un horario que le sirva a la persona, con varios mensajes o llamadas antes de confirmar?

- Copy canónico ejecutable: versión semántica `1`, módulo `appointments`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `rarely` | `rarely` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces | valor operativo; no declara kind especial ni señal adicional |
| `often` | `often` | Seguido | produce {"kind":"friction","value":"conversion","provenance":"derived_fact"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`appointments`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `appointments` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `appointments` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Conversion & Access.

### 6. Qué intenta determinar

access, booking and concrete action

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [contacto], dirección negative, unknown=false, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=conversion.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `rarely` → strong; `sometimes` → partial; `often` → weak

**Señales producidas por opciones:**
- `often` → {"option":"often","kind":"friction","value":"conversion","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_booking_method`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_checkout_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_hospitality_delivery_takeaway`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_service_quote_followup`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`, `MISSING_UNKNOWN`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Redacción regional («cuesta trabajo», «yendo y viniendo»).

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = MAYBE** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ADD_UNKNOWN`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: conserva evidencia directa de Conversion & Access, añade incertidumbre y exige actividad real confirmada y necesidad material de conversión.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE, UNKNOWN Y ROUTING FIX`

Decisión final:
`KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`Cuando alguien quiere agendar una cita, ¿qué tan seguido coordinar el horario se vuelve complicado o requiere varios intentos?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `rarely` | Casi nunca; normalmente la cita se confirma sin problema |
| `sometimes` | A veces hacen falta varios mensajes o llamadas antes de confirmar |
| `often` | Pasa con frecuencia y confirmar la cita suele tomar varios intentos |
| `unknown` | No estoy seguro |

Pista:
`Cuenta los casos donde coordinar el horario genera demora o dificultad, no una conversación normal para elegir la hora.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — APPOINTMENTS / CONVERSION`.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: `NO` en interfaz; resolver por routing.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: facilidad o dificultad de completar la coordinación hasta obtener una cita confirmada.
- Evidencia: DIRECT → Conversion & Access.
- Scoring conceptual: `rarely → strong`, `sometimes → partial`, `often → weak`, `unknown` → sin inferencia fuerte.
- `often` puede producir `friction=conversion` porque aquí se observa dificultad para completar el siguiente paso.
- No penalizar simplemente porque existan varios mensajes o llamadas: debe existir dificultad, demora o varios intentos reales para confirmar.
- Routing: appointments + `q2_has_customers = yes` + necesidad material de evidencia de conversión.
- Relación con `q2_appointments_lead_to_booking`: no preguntar ambas automáticamente; una mide proceso y la otra resultado.

## 30 — `q2_appointments_confirmation_reminders`

### 1. Pregunta actual

¿Envías confirmaciones o recordatorios antes de la cita?

- Copy canónico ejecutable: versión semántica `1`, módulo `appointments`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=clinical`):
  - Pregunta visible: ¿Envías confirmaciones o recordatorios a tus pacientes antes de la cita?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `automatic` | `automatic` | Sí, de forma automática | valor operativo; no declara kind especial ni señal adicional |
| `manual` | `manual` | Sí, pero yo o mi equipo lo hacemos a mano cada vez | valor operativo; no declara kind especial ni señal adicional |
| `none` | `none` | No enviamos nada | produce {"kind":"friction","value":"follow_up","provenance":"derived_fact"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`appointments`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `appointments` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `appointments` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Relationship & Recurrence.

### 6. Qué intenta determinar

continuity, follow-up and return

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=false, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=follow_up.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `automatic` → strong; `manual` → established; `none` → missing

**Señales producidas por opciones:**
- `none` → {"option":"none","kind":"friction","value":"follow_up","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_rebooking`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_sales_cycle`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_audience_ownership`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_followup`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_repeat_purchase`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Pacientes» aplicaba a todo bienestar; ahora solo a práctica clínica.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + COLLAPSE_AUTOMATION_METHOD + ADD_UNKNOWN + ADD_NOT_APPLICABLE + DEFER_TO_ADAPTIVE + ROUTING_FIX`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: colapsa automatic/manual, añade unknown y N/A y sustituye la inferencia de follow-up por una señal específica de recordatorio.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE SEMÁNTICA Y ROUTING`

Decisión final:
`KEEP + REWRITE + COLLAPSE_AUTOMATION_METHOD + ADD_UNKNOWN + ADD_NOT_APPLICABLE + DEFER_TO_ADAPTIVE + ROUTING_FIX`

Pregunta final:
`Cuando una cita ya está agendada, ¿qué tan seguido la persona recibe un recordatorio antes de la cita?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `consistent` | Casi siempre recibe un recordatorio |
| `sometimes` | A veces, pero no siempre |
| `rarely` | Casi nunca o nunca |
| `not_applicable` | Por el tipo de citas, normalmente no hace falta recordatorio |
| `unknown` | No estoy seguro |

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — APPOINTMENTS / CONTINUITY`.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `SÍ` mediante `not_applicable`, fuera del scoring.
- ANSWER_AXIS: `CONSISTENT`.
- Eliminar la distinción `automatic`/`manual`: el método no determina calidad; un recordatorio manual consistente puede funcionar perfectamente.
- Evidencia: DIRECT para continuidad de citas, no suficiente para toda Relationship & Recurrence.
- Scoring conceptual: `consistent → established`, `sometimes → partial`, `rarely → weak` solo cuando sea aplicable, `not_applicable → excluded`, `unknown` → sin inferencia.
- Eliminar `none → friction=follow_up`; sustituir conceptualmente por `appointment_reminder_gap`.
- Interpretar junto con `q2_appointments_noshow`; ausencia de recordatorio solo es debilidad si existe una necesidad razonable de recordarlo.
- Routing: appointments + `q2_has_customers = yes` + necesidad material de continuidad/no-show.
- Automatic/manual puede preguntarse después para definir una solución, pero no forma parte del score diagnóstico.

## 31 — `q2_appointments_lead_to_booking`

### 1. Pregunta actual

De las personas que preguntan por una cita, ¿cuántas terminan agendándola?

- Copy canónico ejecutable: versión semántica `1`, módulo `appointments`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `most` | `most` | La mayoría | valor operativo; no declara kind especial ni señal adicional |
| `about_half` | `about_half` | Más o menos la mitad | valor operativo; no declara kind especial ni señal adicional |
| `few` | `few` | Pocas | produce {"kind":"friction","value":"conversion","provenance":"derived_fact"} |
| `unknown` | `unknown` | No lo he observado | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`appointments`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `appointments` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `appointments` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Conversion & Access.

### 6. Qué intenta determinar

Qué parte de quienes preguntan por una cita termina agendándola.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [contacto], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=conversion.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `most` → strong; `about_half` → partial; `few` → weak

**Señales producidas por opciones:**
- `few` → {"option":"few","kind":"friction","value":"conversion","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_booking_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_method`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_checkout_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_hospitality_delivery_takeaway`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_service_quote_followup`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `MISSING_UNKNOWN`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Proporción sin ayuda ni pista de estimación; etiquetas distintas a la pregunta equivalente de conversión.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Una estimación aproximada basta; no hace falta un dato exacto.
- Panel de ayuda: understand=Qué parte de quienes preguntan por una cita termina agendándola.; distinction=Cuenta personas que preguntaron de verdad, no visitas a tu perfil ni seguidores.; why=Muestra si el interés que ya llega se convierte en citas.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: conserva el resultado directo de conversión, cambia copy y separa el resultado observado de sus posibles causas.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y CAMBIO DE INTERPRETACIÓN`

Decisión final:
`KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`Cuando alguien pregunta o intenta agendar una cita, ¿qué suele pasar?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `most` | La mayoría termina agendando |
| `mixed` | Unas personas agendan y otras no, sin una mayoría clara |
| `few` | Pocas terminan agendando |
| `unknown` | No lo sé o no lo he revisado |

Pista:
`Una estimación aproximada está bien. Piensa solo en personas que realmente preguntan o intentan reservar, no en seguidores o visitas al perfil.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE PRIORITARIA — APPOINTMENTS / CONVERSION`.
- Unknown: `SÍ` mediante `unknown`.
- No aplica: `NO` en interfaz; resolver por routing.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: frecuencia con que el interés real termina en una cita confirmada.
- Evidencia: DIRECT → Conversion & Access.
- Scoring conceptual: `most → strong`, `mixed → partial`, `few → weak`, `unknown` → sin inferencia.
- Sustituir `few → friction=conversion` por `interest_to_booking_gap`: detecta resultado débil, no identifica todavía la causa.
- Relación con `q2_appointments_booking_friction`: 31 mide outcome principal; 29 es deepening sobre coordinación. Si 31 = most, normalmente no preguntar 29; si 31 = mixed/few, 29 puede aparecer si hace falta investigar.
- Routing: appointments + `q2_has_customers = yes` + necesidad material de conversión.

## 32 — `q2_appointments_rebooking`

### 1. Pregunta actual

Cuando el servicio requiere que la persona vuelva (seguimiento, mantenimiento o control), ¿le ayudas a agendar la siguiente cita antes de que se vaya?

- Copy canónico ejecutable: versión semántica `1`, módulo `appointments`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=clinical`):
  - Pregunta visible: Cuando el tratamiento requiere que el paciente vuelva, ¿le ayudas a agendar la siguiente cita antes de que se vaya?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_proactive` | `yes_proactive` | Sí, lo propongo antes de que se vaya | valor operativo; no declara kind especial ni señal adicional |
| `reactive` | `reactive` | Solo si la persona lo pide | valor operativo; no declara kind especial ni señal adicional |
| `no_followup` | `no_followup` | No, queda en manos de la persona | valor operativo; no declara kind especial ni señal adicional |
| `not_applicable` | `not_applicable` | No aplica: mi servicio normalmente no requiere que regrese | kind=not_applicable |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`appointments`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `appointments` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `appointments` y declara los propósitos `diagnostic`; aporta evidencia direct para Relationship & Recurrence.

### 6. Qué intenta determinar

continuity, follow-up and return

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección neutral, unknown=false, N/A=true. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `yes_proactive` → strong; `reactive` → partial; `no_followup` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_confirmation_reminders`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_sales_cycle`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_audience_ownership`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_followup`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_repeat_purchase`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** La pista visible era una nota interna con un código de deuda.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = YES** — Existe una opción ejecutable de no aplicabilidad.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Si tu servicio normalmente no requiere que la persona vuelva, elige «No aplica».
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia el constructo de mecánica inmediata a continuidad planificada y exige actividad real confirmada y necesidad material.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE DEL CONSTRUCTO Y ROUTING FIX`

Decisión final:
`KEEP + REWRITE + ADD_UNKNOWN + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`Cuando una persona necesita volver, ¿qué suele pasar con la siguiente cita?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `proactive` | Normalmente la dejamos agendada o la retomamos después sin esperar a que la persona se acuerde |
| `partial` | A veces la proponemos o la recordamos, pero no siempre |
| `reactive` | Normalmente esperamos a que la persona vuelva a contactarnos |
| `not_applicable` | No aplica: mi servicio normalmente no requiere que la persona vuelva |
| `unknown` | No estoy seguro |

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — APPOINTMENTS / CONTINUITY`.
- Aplicabilidad: appointments + `q2_has_customers = yes` + servicio que puede requerir volver + necesidad material de continuidad.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `SÍ` mediante `not_applicable`, fuera del scoring.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: acción activa y consistente para facilitar la siguiente cita cuando el servicio requiere continuidad.
- Evidencia: DIRECT → Relationship & Recurrence.
- Scoring conceptual: `proactive → strong`, `partial → partial`, `reactive → weak`, `not_applicable → excluded`, `unknown` → sin inferencia.
- No exigir que la siguiente cita quede agendada antes de que la persona se vaya; retomarla posteriormente de forma activa y consistente también es válida.
- No requerir otra cita no es una debilidad y la respuesta no demuestra uso de CRM ni automatización.
- Relación con `q2_local_repeat_customers`: no preguntar ambas automáticamente; una mide conducta observada del cliente y esta mide acción activa del negocio.
- Sustituir la condición basada en `notEqV2(q2_has_customers, no)` por actividad real confirmada.

## 33 — `q2_professional_authority_signals`

### 1. Pregunta actual

Para alguien que te evalúa por primera vez, ¿qué tan fácil es ver pruebas de que puede confiar en ti (casos, testimonios, opiniones, credenciales o resultados)?

- Copy canónico ejecutable: versión semántica `1`, módulo `professional`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=nonprofit`):
  - Pregunta visible: Para alguien que conoce tu organización por primera vez, ¿qué tan fácil es ver pruebas de su labor (resultados, testimonios, informes o reconocimientos)?
- Variante 2 (`terminology=ecommerce, retail`):
  - Pregunta visible: Para alguien que te evalúa por primera vez, ¿qué tan fácil es ver pruebas de que puede confiar en ti (opiniones de otros compradores, reseñas o casos reales)?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `clearly_visible` | `clearly_visible` | Es fácil verlas y encontrarlas | valor operativo; no declara kind especial ni señal adicional |
| `partial` | `partial` | Existen, pero están dispersas o incompletas | valor operativo; no declara kind especial ni señal adicional |
| `not_really` | `not_really` | Casi no hay nada de esto a la vista | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he revisado desde fuera | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`professional`), notEqV2(`q2_has_customers`, `no`)). Regla material: eqV2(`q2_has_customers`, `yes`).

Aparece cuando el arquetipo resuelto contiene `professional` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable nativa y tampoco se activa la condición material. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `professional` y declara los propósitos `diagnostic`; aporta evidencia direct para Trust & Reputation. Puede seleccionarse en profundización/evidencia material.

### 6. Qué intenta determinar

Si alguien que no te conoce encuentra pruebas para confiar antes de decidir.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Trust & Reputation (`trust_reputation`). Evalúa: Prueba, reputación, autoridad y claridad percibida..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [confianza, claridad], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `trust_reputation`: `clearly_visible` → strong; `partial` → partial; `not_really` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_reputation_flow`: comparte dimensión Trust & Reputation y subcriterio proof, authority and external validation; es una pregunta vecina, no necesariamente redundante.
- `q2_professional_followup_after_consult`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_professional_intake_flow`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_professional_referral_dependency`: comparte ; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Experiencia o credenciales» presuponía una profesión, pero es evidencia material para comercio, B2B, creator y organizaciones.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si alguien que no te conoce encuentra pruebas para confiar antes de decidir.; distinction=Cuenta lo que se ve desde fuera sin preguntarte, no lo que podrías mostrar si te lo piden.; why=Quien no te conoce decide con lo que puede ver por su cuenta.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `DEEPENING_ONLY`. Si se elimina se pierde una comprobación adaptativa solo cuando el planner detecta necesidad material.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `ADAPTIVE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `DEFER_TO_ADAPTIVE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX`. Se separa autoridad/experiencia visible de social proof.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia el constructo, restringe aplicabilidad y evita duplicar reseñas/testimonios con q22.

### 15. Decisión humana

Estado:
`APROBADA CON SEPARACIÓN DE SOCIAL PROOF Y AUTHORITY`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX`

Pregunta final:
`Si alguien no te conoce, ¿puede encontrar fácilmente información que muestre tu experiencia o el trabajo que has hecho?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clearly_visible` | Sí, encuentra fácilmente ejemplos, resultados o credenciales relevantes |
| `partial` | Encuentra algunas señales, pero son pocas, están incompletas o cuesta encontrarlas |
| `not_really` | Casi no encuentra información que muestre mi experiencia o trabajo |
| `unknown` | No lo sé o no lo he revisado desde fuera |

Pista:
`No necesitas tener todo. Cuenta solo lo que tenga sentido para tu actividad: trabajos realizados, casos, resultados, experiencia, certificaciones o credenciales cuando apliquen.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — TRUST / AUTHORITY`.
- Aplicabilidad: professional + `q2_has_customers = yes` + necesidad material de confianza/autoridad.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `NO`; resolver por routing.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: visibilidad externa de experiencia, autoridad o evidencia del trabajo realizado.
- Evidencia: DIRECT → Trust & Reputation, subcomponente authority / experience visibility.
- q22 mide reseñas, testimonios y opiniones de terceros; q33 mide experiencia, trabajos, casos, resultados y credenciales. No preguntar ambas automáticamente.
- No exigir todos los tipos de prueba; credenciales solo cuando apliquen. Poca autoridad visible no significa poca capacidad profesional.
- No usar variantes ecommerce/retail como activación automática; routing: professional + actividad real confirmada + necesidad material.

## 34 — `q2_professional_intake_flow`

### 1. Pregunta actual

Cuando alguien muestra interés en trabajar contigo, ¿qué pasa antes de que se convierta en cliente?

- Copy canónico ejecutable: versión semántica `1`, módulo `professional`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=clinical`):
  - Pregunta visible: Cuando alguien muestra interés en atenderse contigo, ¿qué pasa antes de que se convierta en paciente?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `defined_consult` | `defined_consult` | Tengo un paso definido, como una consulta o llamada inicial | valor operativo; no declara kind especial ni señal adicional |
| `ad_hoc` | `ad_hoc` | Varía según el caso, sin un paso fijo | valor operativo; no declara kind especial ni señal adicional |
| `direct_no_step` | `direct_no_step` | Empezamos directo, sin ningún paso intermedio | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había pensado de esa forma | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`professional`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `professional` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `professional` y declara los propósitos `diagnostic, classification`; aporta evidencia direct para Clarity & Positioning, Conversion & Access.

### 6. Qué intenta determinar

Qué pasa entre el primer interés y el inicio del trabajo.

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Clarity & Positioning (`clarity_positioning`). Evalúa: Comprensibilidad de la oferta y del siguiente paso..
- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `clarity_positioning`: `defined_consult` → established; `ad_hoc` → partial; `direct_no_step` → constraint
- `conversion_access`: `defined_consult` → strong; `ad_hoc` → partial; `direct_no_step` → established

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_qualification`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_product_discovery`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_donation_clarity`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_product_visibility`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_offer_readiness`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Cliente» en práctica clínica.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Qué pasa entre el primer interés y el inicio del trabajo.; distinction=Describe lo que ocurre en la mayoría de los casos, no el proceso ideal.; why=Un primer paso claro ayuda a que el interés se convierta en trabajo.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX`. Se mide claridad del siguiente paso, no el mecanismo de intake.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina el sesgo que premiaba consultas intermedias y penalizaba empezar directamente; restringe la pregunta a necesidad material.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DEL CONSTRUCTO`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX`

Pregunta final:
`Cuando una persona interesada quiere avanzar contigo, ¿qué tan claro está el siguiente paso?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clear` | Está claro y normalmente puede avanzar sin dudas |
| `partial` | Generalmente se entiende, pero a veces hay que aclarar qué sigue |
| `unclear` | A menudo no está claro y se termina resolviendo sobre la marcha |
| `unknown` | No estoy seguro |

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — PROFESSIONAL / CONVERSION`.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `NO` en interfaz; resolver por routing.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: claridad del siguiente paso necesario para comenzar.
- Evidencia: Conversion & Access → DIRECT; Clarity & Positioning → SUPPORTING.
- Eliminar semántica basada en `defined_consult`, `ad_hoc` y `direct_no_step`. Tener consulta inicial no es automáticamente mejor; empezar directamente no es debilidad; más pasos no significa mejor proceso.
- Que el proceso varíe según el caso no es malo si el siguiente paso queda claro. No puntuar herramientas, formularios o CRM.
- Scoring conceptual: `clear → strong`, `partial → partial`, `unclear → weak`, `unknown` → sin inferencia.
- Routing: professional + `q2_has_customers = yes` + necesidad material de conversión/claridad.
- El mecanismo concreto puede preguntarse después solo si hace falta implementar una solución; evitar duplicación con preguntas generales de interés → siguiente acción.

## 35 — `q2_professional_referral_dependency`

### 1. Pregunta actual

¿Cuántos de tus clientes nuevos llegan por recomendación, comparado con otras vías?

- Copy canónico ejecutable: versión semántica `1`, módulo `professional`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=clinical`):
  - Pregunta visible: ¿Cuántos de tus pacientes nuevos llegan por recomendación, comparado con otras vías?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `mostly_referrals` | `mostly_referrals` | Casi todos llegan por recomendación | valor operativo; no declara kind especial ni señal adicional |
| `mixed` | `mixed` | Una mezcla real de recomendaciones y otras vías | valor operativo; no declara kind especial ni señal adicional |
| `mostly_other` | `mostly_other` | La mayoría llega por otras vías; pocos por recomendación | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he seguido de cerca | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`professional`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `professional` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `professional` y declara los propósitos `diagnostic`; aporta evidencia direct para Discovery.

### 6. Qué intenta determinar

Qué tanto dependen los clientes nuevos de recomendaciones personales.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `discovery`: `mostly_referrals` → dependency; `mixed` → strong; `mostly_other` → established

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_lead_source`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_channel_concentration`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_content_consistency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_acquisition_dependency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_traffic_sources`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** La pista afirmaba que ninguna respuesta es mejor o peor, en contradicción con la lectura de dependencia.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Responde según lo que ocurre hoy, no según lo que te gustaría.
- Panel de ayuda: understand=Qué tanto dependen los clientes nuevos de recomendaciones personales.; distinction=Compara las recomendaciones con todas las demás vías por las que te encuentran, no solo con una.; why=Muestra de qué depende hoy que lleguen clientes nuevos.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_SUPPORTING`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia la semántica de dependencia de recomendaciones a concentración aproximada y baja la evidencia de Direct a Supporting/Contextual.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE SEMÁNTICA Y DOWNGRADE DE EVIDENCIA`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_SUPPORTING`

Pregunta final:
`Además de recomendaciones, ¿te llegan clientes nuevos por otras vías de forma habitual?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `several_other` | Sí, por varias vías además de las recomendaciones |
| `one_other` | Sí, pero principalmente por una sola vía adicional |
| `mostly_referrals` | Casi todos llegan por recomendación |
| `unknown` | No lo sé o no lo he revisado |

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — PROFESSIONAL / DISCOVERY`.
- Aplicabilidad: professional + `q2_has_customers = yes` + necesidad material de concentración de fuentes.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `NO`; resolver por routing.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: si los nuevos clientes están concentrados en recomendaciones o existen otras vías habituales.
- Cambiar DIRECT → SUPPORTING / CONTEXTUAL para Discovery.
- Eliminar scoring automático `mostly_referrals → dependency`, `mixed → strong`, `mostly_other → established`.
- `mostly_referrals` puede producir conceptualmente `acquisition_concentration = referrals`, no debilidad automática; `several_other` indica diversidad, no strong automático.
- Muchas recomendaciones no significan mala presencia digital y más canales no garantizan mejor desempeño.
- No preguntar automáticamente junto con `q2_local_discovery`; esta puede profundizar si se necesita saber si la recomendación es principal o casi única.
- Routing: eliminar `notEqV2(q2_has_customers, no)` y exigir actividad real confirmada.

## 36 — `q2_professional_followup_after_consult`

### 1. Pregunta actual

Después de una consulta o primera llamada, si la persona no responde enseguida, ¿le das seguimiento?

- Copy canónico ejecutable: versión semántica `1`, módulo `professional`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `always` | `always` | Siempre | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces | valor operativo; no declara kind especial ni señal adicional |
| `rarely_never` | `rarely_never` | Casi nunca | produce {"kind":"friction","value":"follow_up","provenance":"derived_fact"} |
| `unknown` | `unknown` | No lo he pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`professional`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `professional` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `professional` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Relationship & Recurrence.

### 6. Qué intenta determinar

continuity, follow-up and return

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=follow_up.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `always` → strong; `sometimes` → partial; `rarely_never` → missing

**Señales producidas por opciones:**
- `rarely_never` → {"option":"rarely_never","kind":"friction","value":"follow_up","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_confirmation_reminders`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_rebooking`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_sales_cycle`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_audience_ownership`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_followup`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE + COVER_BY_Q2_FOLLOWUP_GENERAL_PROCESS`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina una variante específica de arquetipo y traslada la necesidad al bloque general de seguimiento.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN Y COBERTURA GENERAL`

Decisión final:
`REMOVE + COVER_BY_Q2_FOLLOWUP_GENERAL_PROCESS`

Pregunta eliminada:
`Después de una consulta o primera llamada, si la persona no responde enseguida, ¿le das seguimiento?`

Notas Yoan/ChatGPT:

- Razones: presupone consulta/primera llamada, mide solo frecuencia y duplica `q2_followup_general_process`, que distingue mejor proceso consistente, memoria y pérdida de pendientes.
- Eliminar scoring `always → strong`, `sometimes → partial`, `rarely_never → missing` y la señal específica `rarely_never → friction=follow_up`.
- Migrar la detección a `q2_followup_general_process`, activable adaptativamente cuando falte evidencia de seguimiento.
- CORE/ADAPTIVE: `REMOVE FROM PROFESSIONAL MODULE`. Commercial / License Fit: `NO`.
- No preguntar una variante profesional y luego otra general sobre el mismo pendiente.
- Antes de eliminar técnicamente, buscar dependencias de `q2_professional_followup_after_consult`, `always`, `sometimes`, `rarely_never` y `unknown`.

## 37 — `q2_retail_product_visibility`

### 1. Pregunta actual

¿Alguien que quiera comprarte puede saber qué vendes y si está disponible, antes de ir a la tienda o preguntar?

- Copy canónico ejecutable: versión semántica `1`, módulo `retail`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_clear` | `yes_clear` | Sí, es fácil saberlo desde fuera | valor operativo; no declara kind especial ni señal adicional |
| `partially` | `partially` | Solo una parte (algunos productos, no disponibilidad) | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, tiene que ir o preguntar para saberlo | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he revisado desde fuera | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`retail`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `retail` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `retail` y declara los propósitos `diagnostic`; aporta evidencia direct para Clarity & Positioning, Conversion & Access.

### 6. Qué intenta determinar

offer clarity and next action

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Clarity & Positioning (`clarity_positioning`). Evalúa: Comprensibilidad de la oferta y del siguiente paso..
- **SUPPORTING:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad, presencia], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `clarity_positioning`: `yes_clear` → strong; `partially` → partial; `no` → missing
- `conversion_access`: `yes_clear` → strong; `partially` → partial; `no` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_qualification`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_product_discovery`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_donation_clarity`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_professional_intake_flow`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_offer_readiness`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE + REMOVE_AVAILABILITY_CONSTRUCT`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: separa claridad de oferta e inventario, elimina el supporting automático a Conversion y restringe la pregunta a necesidad material de claridad.

### 15. Decisión humana

Estado:
`APROBADA CON SEPARACIÓN DE PRODUCTO E INVENTARIO`

Decisión final:
`KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE + REMOVE_AVAILABILITY_CONSTRUCT`

Pregunta final:
`Si alguien busca tu negocio en internet, ¿puede entender fácilmente qué productos vendes?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clear` | Sí, puede ver claramente qué tipo de productos vendo |
| `partial` | Puede ver algunos productos, pero no queda claro todo lo que ofrezco |
| `unclear` | No; normalmente tiene que preguntarme o ir a la tienda para saber qué vendo |
| `unknown` | No lo sé o no lo he revisado desde fuera |

Pista:
`No necesitas mostrar todo el inventario ni el stock en tiempo real. Piensa en si una persona nueva puede entender qué puede encontrar en tu negocio.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — RETAIL / OFFER CLARITY`.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `NO`; resolver por routing.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: visibilidad y comprensión externa de la oferta de productos.
- Evidencia: DIRECT → Clarity & Positioning; eliminar SUPPORTING automático → Conversion & Access.
- Eliminar disponibilidad, stock e inventario en tiempo real del constructo. No mostrar stock no es debilidad y ver productos no demuestra que comprar sea fácil.
- No preguntar automáticamente junto con `q2_presence_offer_clarity`.
- Routing: retail + `q2_has_customers = yes` + necesidad material de claridad. La disponibilidad puede preguntarse posteriormente para ecommerce/catálogo/integración.

## 38 — `q2_retail_customer_capture`

### 1. Pregunta actual

Después de que alguien te compra, ¿te queda alguna forma de volver a contactarlo (teléfono, correo, redes, programa de lealtad)?

- Copy canónico ejecutable: versión semántica `1`, módulo `retail`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `systematic` | `systematic` | Sí, de forma sistemática | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces, según el cliente | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, la compra termina ahí | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`retail`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `retail` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `retail` y declara los propósitos `diagnostic`; aporta evidencia direct para Relationship & Recurrence.

### 6. Qué intenta determinar

continuity, follow-up and return

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [contacto, seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `systematic` → strong; `sometimes` → partial; `no` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_confirmation_reminders`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_rebooking`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_sales_cycle`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_audience_ownership`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_followup`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_NOT_APPLICABLE + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia el constructo a contactabilidad real, añade N/A y restringe la pregunta a necesidad material de continuidad.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE COPY, N/A, ROUTING Y PRIORIDAD`

Decisión final:
`KEEP + REWRITE + ADD_NOT_APPLICABLE + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`Después de una compra, ¿sueles tener una forma de volver a comunicarte con ese cliente cuando tiene sentido hacerlo?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `consistent` | Sí, con la mayoría de los clientes |
| `partial` | Solo con algunos clientes |
| `no` | No, normalmente no me queda una forma directa de contacto |
| `not_applicable` | No necesito volver a contactar a mis clientes después de la compra |
| `unknown` | No estoy seguro |

Pista:
`Piensa en teléfono, WhatsApp, correo u otra vía que realmente puedas usar para comunicarte. Que alguien te siga en redes no cuenta por sí solo.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — RETAIL / CONTINUITY`.
- Aplicabilidad: retail + `q2_has_customers = yes` + necesidad material de continuidad/contactabilidad.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `SÍ` mediante `not_applicable`, fuera del scoring.
- ANSWER_AXIS: `CONSISTENT`.
- Evidencia: DIRECT → Relationship & Recurrence, únicamente para customer contactability.
- Tener el contacto no demuestra que exista seguimiento; redes no equivalen a una vía directa utilizable.
- No todos los comercios necesitan conservar datos de cada comprador.
- Routing: retail + `q2_has_customers = yes` + necesidad material; no usar `q2_has_customers != no`.

## 39 — `q2_retail_promotions`

### 1. Pregunta actual

¿Comunicas tus promociones u ofertas de forma que se enteren también tus clientes que no están en la tienda?

- Copy canónico ejecutable: versión semántica `1`, módulo `retail`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_regular` | `yes_regular` | Sí, con cierta regularidad | valor operativo; no declara kind especial ni señal adicional |
| `rarely` | `rarely` | Rara vez | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, nunca | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`retail`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `retail` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `retail` y declara los propósitos `diagnostic`; aporta evidencia direct para Discovery.

### 6. Qué intenta determinar

Si las ofertas llegan a clientes que no están en la tienda en ese momento.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `discovery`: `yes_regular` → established; `rarely` → weak; `no` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_creator_channel_concentration`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_acquisition_dependency`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_local_discovery`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_first_channel`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_lead_source`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Sujeto ambiguo entre clientes y gente en la tienda.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si las ofertas llegan a clientes que no están en la tienda en ese momento.; distinction=Un cartel dentro de la tienda no cuenta: se trata de avisar a quien no está ahí.; why=Avisar a quien ya te compró es una forma de que vuelva sin depender de que pase por la puerta.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`. No se reescribe ni se fusiona como pregunta nueva.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina scoring que confundía una táctica promocional con Discovery y evita duplicación parcial con q38.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN`

Decisión final:
`REMOVE`

Pregunta eliminada:
`¿Comunicas tus promociones u ofertas de forma que se enteren también tus clientes que no están en la tienda?`

Notas Yoan/ChatGPT:

- No hacer descuentos/promociones no es una debilidad de presencia digital.
- La pregunta trata clientes existentes, no Discovery, y evalúa una táctica concreta en lugar de una capacidad.
- Eliminar scoring `yes_regular → established`, `rarely → weak`, `no → missing` y DIRECT → Discovery.
- Cobertura futura: q38 + capacidad general de follow-up/recurrence.
- Posible uso futuro: auditoría de marketing, fidelización, campañas o remarketing.
- Antes de eliminar técnicamente, verificar referencias a `q2_retail_promotions`, `yes_regular`, `rarely` y `no`.

## 40 — `q2_ecommerce_product_discovery`

### 1. Pregunta actual

Cuando alguien llega a tu tienda en línea, ¿puede encontrar fácilmente lo que busca (categorías claras, buscador, navegación simple)?

- Copy canónico ejecutable: versión semántica `1`, módulo `ecommerce`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=prelaunch`):
  - Pregunta visible: Si ya tienes una versión de tu tienda en línea, aunque no esté abierta, ¿alguien que entra puede encontrar fácilmente lo que busca?
  - Etiquetas visibles por opción: `unknown` → Todavía no tengo tienda en línea o no lo he probado

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_easy` | `yes_easy` | Sí, es fácil de navegar | valor operativo; no declara kind especial ni señal adicional |
| `somewhat_confusing` | `somewhat_confusing` | A veces es confuso | valor operativo; no declara kind especial ni señal adicional |
| `hard_to_navigate` | `hard_to_navigate` | Es difícil encontrar las cosas | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he probado como lo haría alguien que entra por primera vez | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: archetypeIncludes(`ecommerce`).

Aparece cuando el arquetipo resuelto contiene `ecommerce` entre sus componentes. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `ecommerce` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Foundation, Clarity & Positioning, Conversion & Access.

### 6. Qué intenta determinar

Si quien entra a la tienda en línea encuentra lo que busca sin ayuda.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Digital Foundation (`digital_foundation`). Evalúa: Presencia, información esencial, acceso y continuidad de los activos digitales..
- **SUPPORTING:** Clarity & Positioning (`clarity_positioning`). Evalúa: Comprensibilidad de la oferta y del siguiente paso..
- **SUPPORTING:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_foundation`: `yes_easy` → strong; `somewhat_confusing` → partial; `hard_to_navigate` → weak
- `clarity_positioning`: `yes_easy` → strong; `somewhat_confusing` → partial; `hard_to_navigate` → weak
- `conversion_access`: `yes_easy` → strong; `somewhat_confusing` → partial; `hard_to_navigate` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_b2b_qualification`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_donation_clarity`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_professional_intake_flow`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_product_visibility`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_offer_readiness`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_problem_clarity`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Antes del lanzamiento puede no existir tienda: la única salida era «no lo he probado como cliente nuevo».

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si quien entra a la tienda en línea encuentra lo que busca sin ayuda.; distinction=Piensa en un visitante nuevo, no en cómo navegas tú tu propia tienda.; why=Si no encuentra lo que busca, el interés se pierde antes de comprar.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia evidencia, semántica o agregación de una o más dimensiones. También exige revalidar rutas y prerrequisitos.

### 15. Decisión humana

Estado:
`PENDIENTE`

Decisión final:
`—`

Pregunta final:
`—`

Respuestas finales:
`—`

Notas Yoan/ChatGPT:
`—`

## 41 — `q2_ecommerce_checkout_friction`

### 1. Pregunta actual

¿Qué tan seguido las personas empiezan a comprar pero no terminan el proceso de pago?

- Copy canónico ejecutable: versión semántica `1`, módulo `ecommerce`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `rarely` | `rarely` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces | valor operativo; no declara kind especial ni señal adicional |
| `often` | `often` | Seguido | produce {"kind":"friction","value":"conversion","provenance":"derived_fact"} |
| `unknown` | `unknown` | No lo he medido | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`ecommerce`), eqV2(`q2_has_customers`, `yes`)).

Aparece cuando el arquetipo resuelto contiene `ecommerce` entre sus componentes y `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `ecommerce` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Conversion & Access.

### 6. Qué intenta determinar

Si quien decide comprar logra terminar el pago.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [contacto], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=conversion.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `rarely` → strong; `sometimes` → partial; `often` → weak

**Señales producidas por opciones:**
- `often` → {"option":"often","kind":"friction","value":"conversion","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_booking_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_method`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_hospitality_delivery_takeaway`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_service_quote_followup`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Una estimación aproximada basta; no hace falta un dato exacto.
- Panel de ayuda: understand=Si quien decide comprar logra terminar el pago.; distinction=Piensa en compras empezadas y no terminadas, no en visitas que solo miran.; why=Una compra que se queda a medias es interés que no llega a concretarse.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia evidencia, semántica o agregación de una o más dimensiones. También exige revalidar rutas y prerrequisitos.

### 15. Decisión humana

Estado:
`PENDIENTE`

Decisión final:
`—`

Pregunta final:
`—`

Respuestas finales:
`—`

Notas Yoan/ChatGPT:
`—`

## 42 — `q2_ecommerce_cart_visibility`

### 1. Pregunta actual

¿Tu tienda en línea te permite saber cuándo alguien deja productos en el carrito sin terminar la compra?

- Copy canónico ejecutable: versión semántica `1`, módulo `ecommerce`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes` | `yes` | Sí | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No estoy seguro | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`ecommerce`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `ecommerce` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `ecommerce` y declara los propósitos `diagnostic, routing`; aporta evidencia direct para Measurement & Optimization.

### 6. Qué intenta determinar

abandoned-cart observability

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Measurement & Optimization (`measurement_optimization`). Evalúa: Origen, resultados, revisión comparativa y capacidad de aprender..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `measurement_optimization`: `yes` → established; `no` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_ecommerce_traffic_sources`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_lead_source`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_local_discovery`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_measurement_decision_review`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_measurement_outcome_tracking`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Sujeto técnico («tu tienda puede identificar»).

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina una función específica de plataforma que no representa por sí sola Measurement & Optimization.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN`

Decisión final:
`REMOVE`

Pregunta eliminada:
`¿Tu tienda en línea te permite saber cuándo alguien deja productos en el carrito sin terminar la compra?`

Notas Yoan/ChatGPT:

- Mide una función específica y no demuestra uso real de los datos.
- No distingue observación agregada de identificación/contactabilidad individual.
- Eliminar scoring `yes → established`, `no → missing` y DIRECT → Measurement & Optimization.
- Cobertura: checkout completion/friction y q2_measurement_outcome_tracking + q2_measurement_decision_review.
- Posible uso futuro: implementación de ecommerce, analytics, recuperación de carrito o automatizaciones.
- Antes de eliminar técnicamente, buscar referencias a `q2_ecommerce_cart_visibility`, `yes`, `no`, `unknown`, especialmente dependencia de `q2_ecommerce_cart_followup`.

## 43 — `q2_ecommerce_cart_followup`

### 1. Pregunta actual

De esas personas que dejan productos sin comprar, ¿les das seguimiento (correo, mensaje, recordatorio)?

- Copy canónico ejecutable: versión semántica `1`, módulo `ecommerce`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `always` | `always` | Siempre | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces | valor operativo; no declara kind especial ni señal adicional |
| `rarely` | `rarely` | Casi nunca | produce {"kind":"friction","value":"follow_up","provenance":"derived_fact"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`ecommerce`), eqV2(`q2_ecommerce_cart_visibility`, `yes`)).

Aparece cuando el arquetipo resuelto contiene `ecommerce` entre sus componentes y `q2_ecommerce_cart_visibility` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_ecommerce_cart_visibility`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `ecommerce` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Relationship & Recurrence.

### 6. Qué intenta determinar

continuity, follow-up and return

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=false, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=follow_up.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `always` → strong; `sometimes` → partial; `rarely` → missing

**Señales producidas por opciones:**
- `rarely` → {"option":"rarely","kind":"friction","value":"follow_up","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_ecommerce_cart_visibility`: dependencia de routing explícita en la condición.
- `q2_ecommerce_repeat_purchase`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_confirmation_reminders`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_rebooking`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_sales_cycle`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_audience_ownership`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina una táctica específica de recuperación de carritos que no representa Relationship & Recurrence ni seguimiento general.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN`

Decisión final:
`REMOVE`

Pregunta eliminada:
`De esas personas que dejan productos sin comprar, ¿les das seguimiento?`

Notas Yoan/ChatGPT:

- Un carrito abandonado puede pertenecer a alguien que nunca fue cliente, sin datos o permiso de contacto.
- No enviar recuperación no es debilidad automática; la táctica depende de volumen, consentimiento y conveniencia.
- Eliminar scoring `always → strong`, `sometimes → partial`, `rarely → missing`, `rarely → friction=follow_up` y DIRECT → Relationship & Recurrence.
- El resultado principal se observa en checkout completion; la recuperación puede preguntarse en implementación solo cuando exista oportunidad material y vía válida de contacto.
- CORE/ADAPTIVE: `REMOVE FROM MAIN DIAGNOSTIC`.
- Antes de eliminar técnicamente, buscar referencias a `q2_ecommerce_cart_followup`, `always`, `sometimes`, `rarely` y retirar dependencia de `q2_ecommerce_cart_visibility`.

## 44 — `q2_ecommerce_repeat_purchase`

### 1. Pregunta actual

¿Qué tan seguido un mismo cliente te vuelve a comprar?

- Copy canónico ejecutable: versión semántica `1`, módulo `ecommerce`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `frequently` | `frequently` | Con cierta frecuencia | valor operativo; no declara kind especial ni señal adicional |
| `occasionally` | `occasionally` | De vez en cuando | valor operativo; no declara kind especial ni señal adicional |
| `rarely` | `rarely` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `not_applicable` | `not_applicable` | No aplica: mi producto normalmente se compra una sola vez | kind=not_applicable |
| `unknown` | `unknown` | No lo he medido | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`ecommerce`), eqV2(`q2_has_customers`, `yes`)).

Aparece cuando el arquetipo resuelto contiene `ecommerce` entre sus componentes y `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `ecommerce` y declara los propósitos `diagnostic`; aporta evidencia direct para Relationship & Recurrence.

### 6. Qué intenta determinar

Con qué frecuencia un mismo cliente vuelve a comprar.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección neutral, unknown=true, N/A=true. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `frequently` → established; `occasionally` → partial; `rarely` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_ecommerce_cart_followup`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_confirmation_reminders`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_rebooking`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_sales_cycle`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_audience_ownership`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = YES** — Existe una opción ejecutable de no aplicabilidad.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Con qué frecuencia un mismo cliente vuelve a comprar.; distinction=Cuenta compras repetidas de la misma persona, no ventas totales.; why=Muestra si la relación continúa después de la primera compra.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: ajusta la recurrencia al ciclo natural del producto y restringe la pregunta a necesidad material.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE COPY Y APLICABILIDAD`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE`

Pregunta final:
`Cuando tus productos pueden volver a comprarse, ¿qué tan común es que un mismo cliente vuelva a comprar?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `frequent_repeat` | Es común que muchos clientes vuelvan a comprar |
| `some_repeat` | Algunos vuelven a comprar |
| `little_repeat` | Muy pocos vuelven a comprar |
| `not_applicable` | No aplica: mis productos normalmente no se compran de nuevo con frecuencia |
| `unknown` | No lo sé o no lo he revisado |

Pista:
`Piensa en lo normal para el tipo de producto que vendes, no en un periodo fijo de tiempo.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — ECOMMERCE / RECURRENCE`.
- Aplicabilidad: ecommerce + `q2_has_customers = yes` + sentido material de medir recompra.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `SÍ` mediante `not_applicable`, fuera del scoring.
- ANSWER_AXIS: `CONSISTENT`.
- Evidencia: DIRECT → Relationship & Recurrence, solo subcomponente recurrence.
- No usar un periodo fijo universal ni comparar ciclos naturales de compra diferentes.
- Poca recompra no prueba mala relación; la causa puede ser producto, precio, ciclo de reposición, competencia o experiencia.
- No generar automáticamente una fricción comercial.

## 45 — `q2_ecommerce_acquisition_dependency`

### 1. Pregunta actual

¿Tus visitas y pedidos dependen casi todos de un solo canal (por ejemplo, solo redes sociales o solo un tipo de anuncio), o vienen de varias fuentes?

- Copy canónico ejecutable: versión semántica `1`, módulo `ecommerce`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `single_channel` | `single_channel` | Casi todo depende de un solo canal | valor operativo; no declara kind especial ni señal adicional |
| `few_channels` | `few_channels` | Dos o tres canales, sin mucho más | valor operativo; no declara kind especial ni señal adicional |
| `diverse` | `diverse` | Varias fuentes reales, ninguna domina | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he revisado | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`ecommerce`), eqV2(`q2_has_customers`, `yes`)).

Aparece cuando el arquetipo resuelto contiene `ecommerce` entre sus componentes y `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `ecommerce` y declara los propósitos `diagnostic`; aporta evidencia direct para Discovery.

### 6. Qué intenta determinar

Si los pedidos dependen de un único canal.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `discovery`: `single_channel` → dependency; `few_channels` → partial; `diverse` → strong

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_creator_channel_concentration`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_local_discovery`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_promotions`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_first_channel`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_traffic_sources`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Tráfico» es jerga.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si los pedidos dependen de un único canal.; distinction=Mira de dónde vienen los pedidos reales, no dónde publicas.; why=Depender de un solo canal hace que un cambio en ese canal afecte a todas las ventas.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** SÍ. Sí, candidato. Si `q2_ecommerce_traffic_sources` ya fue respondida con una selección normalizada, el número y tipo de fuentes puede derivar una lectura de concentración; aun así no se elimina porque puede ser seleccionada materialmente y su semántica actual declara una escala explícita de dependencia.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `DEFER_TO_ADAPTIVE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + DIRECT_TO_SUPPORTING`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia visitas/pedidos a concentración real de pedidos y baja la evidencia de Direct a Supporting/Contextual.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE CONCENTRACIÓN Y DOWNGRADE DE EVIDENCIA`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + DIRECT_TO_SUPPORTING`

Pregunta final:
`Pensando en los pedidos que recibes, ¿dependen principalmente de una sola fuente o llegan por varias fuentes importantes?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `dominant_source` | La mayoría depende claramente de una sola fuente |
| `main_plus_others` | Hay una fuente principal, pero otras también traen pedidos de forma habitual |
| `several_meaningful` | Los pedidos llegan de varias fuentes importantes, sin depender claramente de una sola |
| `unknown` | No lo sé o no lo he revisado |

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — ECOMMERCE / DISCOVERY CONCENTRATION`.
- Aplicabilidad: ecommerce + `q2_has_customers = yes` + necesidad material de concentración de adquisición.
- Unknown: `SÍ` mediante `unknown`.
- ANSWER_AXIS: `CONSISTENT`.
- Evidencia: SUPPORTING / CONTEXTUAL → Discovery.
- Eliminar scoring automático `single_channel → dependency`, `few_channels → partial`, `diverse → strong`.
- Nueva interpretación: `dominant_source → concentration_risk`; `several_meaningful → diversified_sources`, sin concluir calidad de Discovery.
- Más canales no significa mejor desempeño; contar selecciones de `q2_ecommerce_traffic_sources` no permite inferir concentración. Esa pregunta puede activar esta profundización, pero no sustituirla.
- Medir pedidos reales, no simplemente visitas.
- Routing: ecommerce + `q2_has_customers = yes` + necesidad material de concentración.

## 46 — `q2_hospitality_flow_type`

### 1. Pregunta actual

¿Cómo suele llegar la mayoría de tus clientes?

- Copy canónico ejecutable: versión semántica `1`, módulo `hospitality`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `reservation` | `reservation` | Con reserva previa | valor operativo; no declara kind especial ni señal adicional |
| `walk_in` | `walk_in` | Sin reserva, llegan directo | valor operativo; no declara kind especial ni señal adicional |
| `order_ahead` | `order_ahead` | Hacen un pedido para recoger o que se lo lleven | valor operativo; no declara kind especial ni señal adicional |
| `mixed` | `mixed` | Una mezcla real de las anteriores | valor operativo; no declara kind especial ni señal adicional |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`hospitality`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `hospitality` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `hospitality` y declara los propósitos `diagnostic, routing`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

reservation versus walk-in routing context

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=false, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_hospitality_delivery_takeaway`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_hospitality_peak_capacity`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_hospitality_reservation_noshow`: comparte ; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `MISSING_UNKNOWN`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** La pista visible describía el enrutamiento, no cómo responder.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = MAYBE** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = MAYBE** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Elige cómo llega la mayoría de tus clientes en un día normal.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ROUTING_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `ADD_UNKNOWN`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE + MERGE_APPLICABILITY_INTO_Q2_HOSPITALITY_RESERVATION_NOSHOW`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: elimina una pregunta contextual cuya función material era routing y migra cualquier dependencia necesaria a q47.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN Y FUSIÓN`

Decisión final:
`REMOVE + MERGE_APPLICABILITY_INTO_Q2_HOSPITALITY_RESERVATION_NOSHOW`

Pregunta eliminada:
`¿Cómo suele llegar la mayoría de tus clientes?`

Notas Yoan/ChatGPT:

- No aporta score y mezcla reserva/walk-in con pedido anticipado.
- Su función material principal es routing; la aplicabilidad se integra en q47 mediante `not_applicable`.
- Eliminar opciones/valores `reservation`, `walk_in`, `order_ahead` y `mixed`.
- Commercial / License Fit: `NO`.
- Antes de eliminar técnicamente, buscar referencias a `q2_hospitality_flow_type`, `reservation`, `walk_in`, `order_ahead` y `mixed`, y migrar cualquier dependencia necesaria a q47.

## 47 — `q2_hospitality_reservation_noshow`

### 1. Pregunta actual

¿Qué tan seguido las personas no se presentan a una reserva?

- Copy canónico ejecutable: versión semántica `1`, módulo `hospitality`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `rarely` | `rarely` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces | valor operativo; no declara kind especial ni señal adicional |
| `often` | `often` | Seguido | produce {"kind":"friction","value":"operations","provenance":"derived_fact"} |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`hospitality`), inV2(`q2_hospitality_flow_type`, [`reservation`, `mixed`])).

Aparece cuando el arquetipo resuelto contiene `hospitality` entre sus componentes y `q2_hospitality_flow_type` respondió uno de: `reservation`, `mixed`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_hospitality_flow_type`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `hospitality` y declara los propósitos `diagnostic, friction`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

reservation attendance context

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección negative, unknown=false, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=operations.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
- `often` → {"option":"often","kind":"friction","value":"operations","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_hospitality_flow_type`: dependencia de routing explícita en la condición.
- `q2_hospitality_delivery_takeaway`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_hospitality_peak_capacity`: comparte ; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `MISSING_UNKNOWN`, `MISSING_NOT_APPLICABLE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** La pista comparaba con citas médicas y confundía.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = MAYBE** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = MAYBE** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Piensa en mesas, habitaciones u otras reservas de las últimas semanas.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `ADD_UNKNOWN`
- `ADD_NOT_APPLICABLE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + MERGE_APPLICABILITY_FROM_Q46 + ADD_UNKNOWN + ADD_NOT_APPLICABLE + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: absorbe aplicabilidad de q46, añade N/A/unknown y sustituye causalidad operacional automática por señal contextual de asistencia.

### 15. Decisión humana

Estado:
`APROBADA CON FUSIÓN DE APLICABILIDAD`

Decisión final:
`KEEP + REWRITE + MERGE_APPLICABILITY_FROM_Q46 + ADD_UNKNOWN + ADD_NOT_APPLICABLE + DEFER_TO_ADAPTIVE`

Pregunta final:
`Si aceptas reservas, ¿qué tan seguido una persona reserva y luego no se presenta?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `rarely` | Casi nunca |
| `sometimes` | A veces |
| `often` | Pasa con frecuencia |
| `not_applicable` | No acepto reservas o normalmente no trabajo con reservas |
| `unknown` | No lo sé o no lo he revisado |

Pista:
`Piensa en mesas, habitaciones u otras reservas reales de las últimas semanas o meses.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — HOSPITALITY / RESERVATION ATTENDANCE`.
- Evidencia: CONTEXTUAL / SUPPORTING; scoring no directo.
- Unknown: `SÍ` mediante `unknown`. Not applicable: `SÍ` mediante `not_applicable`.
- Eliminar `often → friction=operations`; sustituir conceptualmente por `reservation_attendance_issue`.
- Una ausencia frecuente identifica un resultado, no demuestra automáticamente su causa.
- Routing: hospitality + `q2_has_customers = yes` + necesidad material de evidencia sobre reservas/asistencia. La respuesta N/A absorbe aplicabilidad de q46.

## 48 — `q2_hospitality_peak_capacity`

### 1. Pregunta actual

En tus horas o días de más demanda, ¿qué tan seguido tienes que rechazar clientes o hacerlos esperar mucho por falta de capacidad?

- Copy canónico ejecutable: versión semántica `1`, módulo `hospitality`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `rarely` | `rarely` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces | valor operativo; no declara kind especial ni señal adicional |
| `often` | `often` | Seguido | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he seguido de cerca | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`hospitality`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `hospitality` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `hospitality` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Readiness.

### 6. Qué intenta determinar

capacity constraints

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance, seguimiento], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `rarely` → established; `sometimes` → partial; `often` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_status_visibility`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_monetization_model`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_general_process`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_ownership`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE + COVER_BY_Q2_CAPACITY_SIGNAL`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina una pregunta hospitality específica que confundía presión de capacidad con Digital Readiness y duplica q18.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN`

Decisión final:
`REMOVE + COVER_BY_Q2_CAPACITY_SIGNAL`

Pregunta eliminada:
`En tus horas o días de más demanda, ¿qué tan seguido tienes que rechazar clientes o hacerlos esperar mucho por falta de capacidad?`

Notas Yoan/ChatGPT:

- Eliminar DIRECT → Digital Readiness y scoring `rarely → established`, `sometimes → partial`, `often → weak`.
- La saturación en horas punta mide presión de capacidad, no madurez digital.
- Cobertura: `q2_capacity_signal` para capacidad suficiente, presión de trabajo/demanda y expansión de recursos.
- Commercial / License Fit: `NO` por sí sola; alta demanda no empuja automáticamente a una licencia superior.
- Antes de borrar, buscar referencias a `q2_hospitality_peak_capacity`, `rarely`, `sometimes`, `often` y `unknown`.

## 49 — `q2_hospitality_delivery_takeaway`

### 1. Pregunta actual

¿Ofreces para llevar o entrega a domicilio?

- Copy canónico ejecutable: versión semántica `1`, módulo `hospitality`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `both` | `both` | Sí, ambas cosas | valor operativo; no declara kind especial ni señal adicional |
| `takeaway_only` | `takeaway_only` | Solo para llevar | valor operativo; no declara kind especial ni señal adicional |
| `delivery_only` | `delivery_only` | Solo entrega a domicilio | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, solo se consume en el lugar | valor operativo; no declara kind especial ni señal adicional |
| `not_applicable` | `not_applicable` | No aplica: el hospedaje no ofrece alimentos ni entrega | kind=not_applicable |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`hospitality`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `hospitality` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `hospitality` y declara los propósitos `diagnostic`; aporta evidencia direct para Conversion & Access.

### 6. Qué intenta determinar

Qué formas de consumir fuera del local ofrece hoy el negocio.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance], dirección neutral, unknown=false, N/A=true. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `both` → strong; `takeaway_only` → partial; `delivery_only` → partial; `no` → constraint

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_booking_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_method`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_checkout_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_service_quote_followup`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = NO** — No existe opción `kind: unknown`; se marca según observabilidad del constructo.

**NOT_APPLICABLE_NEEDED = YES** — Existe una opción ejecutable de no aplicabilidad.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Qué formas de consumir fuera del local ofrece hoy el negocio.; distinction=Responde por lo que ofreces de forma habitual, no por algo ocasional o en pruebas.; why=Cada forma adicional de atender abre otra vía para que te compren.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina una modalidad operativa específica que se interpretaba incorrectamente como nivel de Conversion & Access.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN`

Decisión final:
`REMOVE`

Pregunta eliminada:
`¿Ofreces para llevar o entrega a domicilio?`

Notas Yoan/ChatGPT:

- Más modalidades de consumo no significan mejor negocio digital; solo consumo en local no es constraint.
- Eliminar scoring `both → strong`, `takeaway_only → partial`, `delivery_only → partial`, `no → constraint` y DIRECT → Conversion & Access.
- El contexto general de atención/entrega queda cubierto por q4.
- Posible uso futuro: aclaración de implementación hospitality sobre consumir, recoger, entregar o varias opciones, sin convertirlo en puntuación.
- Commercial / License Fit: no usar directamente.
- Antes de eliminar, buscar referencias a `q2_hospitality_delivery_takeaway`, `both`, `takeaway_only`, `delivery_only`, `no` y `not_applicable`.

## 50 — `q2_b2b_lead_source`

### 1. Pregunta actual

¿De dónde suelen llegar tus oportunidades de negocio con más frecuencia?

- Copy canónico ejecutable: versión semántica `1`, módulo `b2b`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `referrals` | `referrals` | Recomendaciones de clientes o contactos | valor operativo; no declara kind especial ni señal adicional |
| `outbound` | `outbound` | Yo los busco activamente | valor operativo; no declara kind especial ni señal adicional |
| `inbound` | `inbound` | Me contactan por mi presencia o contenido | valor operativo; no declara kind especial ni señal adicional |
| `partnerships` | `partnerships` | Alianzas con otras empresas o socios | valor operativo; no declara kind especial ni señal adicional |
| `paid` | `paid` | Publicidad pagada | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he identificado con claridad | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`b2b`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `b2b` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `b2b` y declara los propósitos `diagnostic`; aporta evidencia direct para Discovery, Measurement & Optimization.

### 6. Qué intenta determinar

Por qué vía llegan con más frecuencia las oportunidades de negocio.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..
- **SUPPORTING:** Measurement & Optimization (`measurement_optimization`). Evalúa: Origen, resultados, revisión comparativa y capacidad de aprender..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `discovery`: `inbound` → established; `referrals` → partial; `outbound` → partial; `partnerships` → partial; `paid` → partial
- `measurement_optimization`: `inbound` → partial; `referrals` → partial; `outbound` → partial; `partnerships` → partial; `paid` → partial; `unknown` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_ecommerce_traffic_sources`: comparte dimensión Discovery, Measurement & Optimization y subcriterio known source of demand and source confidence; es una pregunta vecina, no necesariamente redundante.
- `q2_local_discovery`: comparte dimensión Discovery, Measurement & Optimization y subcriterio known source of demand and source confidence; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_channel_concentration`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_content_consistency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_acquisition_dependency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Alianzas» sin sujeto.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Por qué vía llegan con más frecuencia las oportunidades de negocio.; distinction=Elige la vía que más oportunidades trae, no la que trae las más grandes.; why=Muestra si te encuentran por tu cuenta o si todo depende de buscar activamente.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_MIXED + ADD_OTHER + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_CONTEXTUAL_SUPPORTING + REMOVE_MEASUREMENT_INFERENCE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia copy y semántica, elimina jerarquía de canales y retira inferencia automática de Measurement.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE SEMÁNTICA Y EVIDENCIA`

Decisión final:
`KEEP + REWRITE + ADD_MIXED + ADD_OTHER + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_CONTEXTUAL_SUPPORTING + REMOVE_MEASUREMENT_INFERENCE`

Pregunta final:
`¿Por qué vía suelen llegar la mayoría de tus oportunidades de negocio?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `referrals` | Por recomendaciones de clientes o contactos |
| `outbound` | Nosotros contactamos directamente a posibles clientes |
| `digital_presence` | Nos encuentran por nuestra web, redes o contenido |
| `partnerships` | Llegan mediante otras empresas, profesionales o aliados |
| `paid` | Por publicidad pagada |
| `mixed` | Llegan por varias vías y ninguna domina claramente |
| `other` | Por otra vía |
| `unknown` | No lo sé o no lo he identificado |

Pista:
`Elige la vía que trae más oportunidades habitualmente, no necesariamente la que genera las ventas más grandes.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — B2B / DISCOVERY`.
- Aplicabilidad: B2B + `q2_has_customers = yes` + necesidad material de origen de oportunidades.
- Unknown: `SÍ` mediante `unknown`; Mixed: `SÍ`; Other: `SÍ`.
- Ninguna fuente es automáticamente mejor: inbound, outbound, referrals y paid son formas de adquisición, no niveles de madurez.
- Evidencia: CONTEXTUAL / SUPPORTING → Discovery; eliminar inferencia automática positiva/negativa por tipo de canal.
- Retirar aporte automático a Measurement: conocer la fuente principal no demuestra medición fiable.
- La pregunta describe origen de oportunidades, no calidad absoluta de Discovery.
- Routing: eliminar condiciones permisivas y exigir `q2_has_customers = yes` + necesidad material.

## 51 — `q2_b2b_qualification`

### 1. Pregunta actual

Cuando una empresa muestra interés, ¿tienes una forma de distinguir si es una oportunidad real o solo curiosidad?

- Copy canónico ejecutable: versión semántica `1`, módulo `b2b`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_clear` | `yes_clear` | Sí, tengo una forma clara de distinguirlo | valor operativo; no declara kind especial ni señal adicional |
| `somewhat` | `somewhat` | Más o menos, depende del caso | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, no tengo una forma de distinguirlo | produce {"kind":"friction","value":"conversion","provenance":"derived_fact"} |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`b2b`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `b2b` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `b2b` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Clarity & Positioning, Conversion & Access.

### 6. Qué intenta determinar

offer clarity and next action

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Clarity & Positioning (`clarity_positioning`). Evalúa: Comprensibilidad de la oferta y del siguiente paso..
- **SUPPORTING:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=conversion.

**Semántica ejecutable por opción/dimensión:**
- `clarity_positioning`: `yes_clear` → strong; `somewhat` → partial; `no` → missing
- `conversion_access`: `yes_clear` → strong; `somewhat` → partial; `no` → missing

**Señales producidas por opciones:**
- `no` → {"option":"no","kind":"friction","value":"conversion","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_ecommerce_product_discovery`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_donation_clarity`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_professional_intake_flow`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_product_visibility`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_offer_readiness`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Trato todo por igual» sonaba a una virtud y podía atraer respuestas por deseabilidad.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + REMOVE_CLARITY_DIRECT + KEEP_CONVERSION_SUPPORTING + REMOVE_GENERIC_FRICTION`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia el constructo de claridad de oferta a madurez de calificación, elimina Direct → Clarity y retira la fricción genérica automática.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DEL CONSTRUCTO`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + REMOVE_CLARITY_DIRECT + KEEP_CONVERSION_SUPPORTING + REMOVE_GENERIC_FRICTION`

Pregunta final:
`Cuando una empresa muestra interés, ¿qué tan claro tienes si encaja con lo que ofreces y puede avanzar?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clear` | Normalmente está claro qué oportunidades encajan y cuáles pueden avanzar |
| `partial` | Tengo algunas señales para distinguirlo, pero depende bastante del caso |
| `informal` | Normalmente lo voy descubriendo sobre la marcha |
| `unknown` | No estoy seguro |

Pista:
`No necesitas usar un formulario, CRM o sistema especial. Piensa simplemente en si tienes criterios habituales para decidir qué oportunidad vale la pena continuar.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — B2B / QUALIFICATION`.
- Aplicabilidad: B2B + `q2_has_customers = yes` + necesidad material de proceso previo al avance comercial.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `NO` en interfaz; resolver por routing.
- ANSWER_AXIS: `CONSISTENT`.
- Qué determina: claridad para identificar oportunidades que encajan y pueden avanzar.
- Evidencia: SUPPORTING → Conversion & Access; eliminar DIRECT → Clarity & Positioning.
- Scoring prudente: `clear → established/supporting positive`, `partial → partial`, `informal → weak/contextual`, `unknown` → sin inferencia.
- Eliminar `no → friction=conversion`; posible señal contextual: `qualification_clarity_gap`.
- No exigir CRM/formulario ni premiar más pasos; una oportunidad exploratoria no es mala y falta de calificación formal no demuestra pérdida de conversión.
- No preguntar automáticamente junto con `q2_b2b_pipeline`; una mide encaje/listo para avanzar y la otra seguimiento hasta saber qué pasó.

## 52 — `q2_b2b_status_visibility`

### 1. Pregunta actual

De tus oportunidades activas ahora mismo, ¿sabes en qué estado está cada una sin tener que revisar o preguntar?

- Copy canónico ejecutable: versión semántica `1`, módulo `b2b`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_clear` | `yes_clear` | Sí, lo sé con claridad | valor operativo; no declara kind especial ni señal adicional |
| `somewhat` | `somewhat` | Más o menos, con algo de esfuerzo | valor operativo; no declara kind especial ni señal adicional |
| `lose_track` | `lose_track` | No, se me pierden con facilidad | produce {"kind":"friction","value":"operations","provenance":"derived_fact"} |
| `unknown` | `unknown` | No lo he revisado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`b2b`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `b2b` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `b2b` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Digital Readiness.

### 6. Qué intenta determinar

sustainability, dependencies and process constraints

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=operations.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `yes_clear` → strong; `somewhat` → partial; `lose_track` → missing

**Señales producidas por opciones:**
- `lose_track` → {"option":"lose_track","kind":"friction","value":"operations","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_monetization_model`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_general_process`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_ownership`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_status_visibility`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Claridad total» era un extremo que empujaba a la opción intermedia; la pista remitía a otra pregunta.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Se trata de si sabes dónde está cada oportunidad ahora, no de si tienes un proceso.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + REFINE_SIGNAL`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia el copy para medir acceso a información, no memoria, y refina la señal de visibilidad sin convertirla en fricción operativa genérica.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE, ROUTING Y SEÑAL REFINADA`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + REFINE_SIGNAL`

Pregunta final:
`Cuando tienes oportunidades de venta abiertas, ¿qué tan fácil es saber en qué punto está cada una y qué queda pendiente?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clear` | Es fácil saber dónde está cada una y qué sigue |
| `partial` | Normalmente puedo saberlo, pero a veces tengo que buscar o reconstruir información |
| `lose_track` | A veces pierdo de vista en qué quedó alguna oportunidad |
| `unknown` | No estoy seguro |

Pista:
`No importa si usas memoria, notas, una hoja o un CRM. Piensa en si puedes recuperar esa información cuando la necesitas.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — B2B / OPPORTUNITY VISIBILITY`.
- Aplicabilidad: B2B + `q2_has_customers = yes` + necesidad material de control/visibilidad.
- Unknown: `SÍ` mediante `unknown`.
- Evidencia: DIRECT → Digital Readiness.
- Eliminar el requisito implícito «saberlo sin revisar»: consultar una hoja, lista o CRM no es debilidad.
- Sustituir `friction=operations` genérica por `opportunity_status_visibility_gap`.
- q12 mide proceso para seguir hasta saber qué pasó; q52 mide acceso actual al estado y pendientes. No preguntar ambas automáticamente.
- Routing: exigir actividad real confirmada y necesidad material.

## 53 — `q2_b2b_sales_cycle`

### 1. Pregunta actual

¿Qué tan seguido una venta requiere varios contactos o conversaciones antes de cerrarse?

- Copy canónico ejecutable: versión semántica `1`, módulo `b2b`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `rarely` | `rarely` | Casi nunca, se decide rápido | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces | valor operativo; no declara kind especial ni señal adicional |
| `almost_always` | `almost_always` | Casi siempre requiere varios contactos | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he seguido de cerca | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`b2b`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `b2b` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `b2b` y declara los propósitos `diagnostic`; aporta evidencia direct para Relationship & Recurrence.

### 6. Qué intenta determinar

Cuántos contactos suele requerir cerrar una venta.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `rarely` → constraint; `sometimes` → constraint; `almost_always` → constraint

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_confirmation_reminders`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_rebooking`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_audience_ownership`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_followup`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_repeat_purchase`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Cuántos contactos suele requerir cerrar una venta.; distinction=Piensa en las ventas habituales, no en la más larga ni en la más rápida.; why=Describe el contexto de venta: cuantos más contactos, más pesa el seguimiento.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + RECLASSIFY_AS_CONTEXT + DEFER_TO_ADAPTIVE + ROUTING_FIX`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: elimina scoring y usa el ciclo de venta únicamente para decidir cuánto profundizar en seguimiento/control.

### 15. Decisión humana

Estado:
`APROBADA COMO CONTEXTO DE CICLO DE VENTA`

Decisión final:
`KEEP + REWRITE + RECLASSIFY_AS_CONTEXT + DEFER_TO_ADAPTIVE + ROUTING_FIX`

Pregunta final:
`En una venta habitual, ¿suelen hacer falta varias conversaciones o contactos antes de que el cliente decida?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `usually_one` | Normalmente basta con un solo contacto o conversación |
| `sometimes_several` | A veces hacen falta varios contactos |
| `usually_several` | Normalmente hacen falta varios contactos antes de decidir |
| `varies` | Cambia mucho según el cliente o la venta |
| `unknown` | No lo sé o no lo he revisado |

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — B2B / SALES-CYCLE CONTEXT`.
- Aplicabilidad: B2B + `q2_has_customers = yes` + necesidad material de determinar peso del seguimiento.
- Evidencia: CONTEXTUAL / ROUTING; score: ninguno.
- usually_several indica que el seguimiento tiene mayor importancia material; usually_one indica proceso más corto; varies reconoce dependencia del caso.
- Más contactos no significan peor proceso y menos contactos no significan mejor proceso. No seleccionar licencia por esta respuesta.
- Usar para decidir profundidad en q12, q52 y q69, sin preguntar todo automáticamente.
- Sustituir el patrón permisivo `notEqV2(q2_has_customers, no)` por actividad confirmada.

## 54 — `q2_b2b_decision_makers`

### 1. Pregunta actual

¿Normalmente decide una sola persona, o participan varias personas en la decisión de compra?

- Copy canónico ejecutable: versión semántica `1`, módulo `b2b`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `single` | `single` | Una sola persona decide | valor operativo; no declara kind especial ni señal adicional |
| `multiple` | `multiple` | Participan varias personas | valor operativo; no declara kind especial ni señal adicional |
| `varies` | `varies` | Depende del cliente | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he identificado | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`b2b`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `b2b` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `b2b` y declara los propósitos `diagnostic`; aporta evidencia supporting para Conversion & Access.

### 6. Qué intenta determinar

buying committee context

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso supporting (la tabla de scoring limita el apoyo a la mitad del peso directo). Metadata de preparación: dimensiones candidatas [claridad], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `single` → constraint; `multiple` → constraint; `varies` → constraint

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_qualification`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_friction`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_method`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_conversion_interest_to_action`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `SCORING_REVALIDATION` si existe consumo indirecto y `COMMERCIAL_REVALIDATION` si alguna lógica la consume.
- Motivo: elimina contexto B2B sin calidad diagnóstica; la complejidad material del seguimiento queda mejor cubierta por q53.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN`

Decisión final:
`REMOVE`

Pregunta eliminada:
`¿Normalmente decide una sola persona, o participan varias personas en la decisión de compra?`

Notas Yoan/ChatGPT:

- Describe estructura de compra B2B, no calidad; una o varias personas no son estados mejores o peores.
- Eliminar SUPPORTING → Conversion & Access y cualquier scoring.
- q53 ya recoge cuánto seguimiento exige una venta.
- Commercial / License Fit: no utilizar número de decisores para elegir licencia.
- Posible uso futuro: implementación B2B sobre contactos por cuenta, roles, pipeline, propuestas o CRM.
- Antes de eliminar, buscar referencias a `q2_b2b_decision_makers`, `single`, `multiple`, `varies` y `unknown`.

## 55 — `q2_creator_channel_concentration`

### 1. Pregunta actual

De tu audiencia total, ¿qué tan concentrada está en un solo canal (por ejemplo, todo en una sola red social)?

- Copy canónico ejecutable: versión semántica `1`, módulo `creator`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `highly_concentrated` | `highly_concentrated` | Muy concentrada en un solo canal | valor operativo; no declara kind especial ni señal adicional |
| `somewhat_spread` | `somewhat_spread` | Repartida entre un par de canales | valor operativo; no declara kind especial ni señal adicional |
| `well_diversified` | `well_diversified` | Bien repartida entre varios canales reales | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he revisado | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: archetypeIncludes(`creator`).

Aparece cuando el arquetipo resuelto contiene `creator` entre sus componentes. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `creator` y declara los propósitos `diagnostic`; aporta evidencia direct para Discovery.

### 6. Qué intenta determinar

Cuánto depende el alcance de la audiencia de un solo canal.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `discovery`: `highly_concentrated` → dependency; `somewhat_spread` → partial; `well_diversified` → strong

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_ecommerce_acquisition_dependency`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_local_discovery`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_promotions`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_first_channel`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_content_consistency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_lead_source`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Cuánto depende el alcance de la audiencia de un solo canal.; distinction=Mira dónde está realmente la audiencia activa, no en cuántos canales tienes cuenta.; why=Si casi toda la audiencia está en un canal, un cambio en ese canal afecta a todo.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + DIRECT_TO_SUPPORTING_CONTEXTUAL`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia la semántica a dependencia de plataforma y baja la evidencia de Direct a Supporting/Contextual.

### 15. Decisión humana

Estado:
`APROBADA CON REDISEÑO DE SEMÁNTICA`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + DIRECT_TO_SUPPORTING_CONTEXTUAL`

Pregunta final:
`Pensando en tu audiencia activa, ¿qué tanto depende de una sola plataforma o canal?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `dominant_channel` | Casi toda mi audiencia activa está en una sola plataforma |
| `main_plus_others` | Hay una plataforma principal, pero también tengo audiencia activa en otras |
| `several_meaningful` | Tengo audiencia activa importante en varias plataformas |
| `unknown` | No lo sé o no lo he revisado |

Pista:
`Piensa en dónde están realmente las personas que te siguen o interactúan contigo, no solo en cuántas cuentas tienes abiertas.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — CREATOR / CHANNEL DEPENDENCY`.
- Unknown: `SÍ` mediante `unknown`.
- Evidencia: SUPPORTING / CONTEXTUAL → Discovery.
- Eliminar scoring automático `highly_concentrated → dependency`, `somewhat_spread → partial`, `well_diversified → strong`.
- Nuevas señales: `dominant_channel → audience_channel_concentration`, `main_plus_others` → concentración moderada, `several_meaningful` → menor concentración.
- Más canales no significan mejor; una audiencia grande en un solo canal puede ser sólida. Contar cuentas abiertas no sirve.
- No seleccionar licencia por esta respuesta.
- Routing: creator + necesidad material de dependencia de plataforma; no requiere `q2_has_customers = yes`.

## 56 — `q2_creator_audience_ownership`

### 1. Pregunta actual

Más allá de la plataforma donde te siguen, ¿tienes una forma propia de contactar a tu audiencia (correo, lista, mensaje directo) sin depender de que el algoritmo te muestre?

- Copy canónico ejecutable: versión semántica `1`, módulo `creator`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `systematic` | `systematic` | Sí, de forma sistemática | valor operativo; no declara kind especial ni señal adicional |
| `partial` | `partial` | Algo, pero no de forma consistente | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, dependo completamente de la plataforma | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`creator`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `creator` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `creator` y declara los propósitos `diagnostic`; aporta evidencia direct para Relationship & Recurrence.

### 6. Qué intenta determinar

continuity, follow-up and return

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [contacto], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `systematic` → strong; `partial` → partial; `no` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_confirmation_reminders`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_rebooking`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_sales_cycle`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_followup`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_repeat_purchase`: comparte dimensión Relationship & Recurrence y subcriterio continuity, follow-up and return; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia copy a contactabilidad directa, evita premiar herramientas y restringe la pregunta a necesidad material de continuidad.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE COPY, ROUTING Y PRIORIDAD`

Decisión final:
`KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`Además de publicar contenido, ¿tienes alguna forma de volver a comunicarte directamente con parte de tu audiencia?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `direct_consistent` | Sí, puedo contactar directamente a una parte importante de mi audiencia |
| `direct_limited` | Sí, pero solo a una parte pequeña o de forma poco organizada |
| `platform_only` | No; normalmente dependo de que vuelvan a encontrar mis publicaciones |
| `unknown` | No estoy seguro |

Pista:
`Por ejemplo: correo, WhatsApp, SMS, comunidad o una lista de miembros. Lo importante es poder comunicarte directamente, no la herramienta que uses.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — CREATOR / DIRECT AUDIENCE CONTACT`.
- Aplicabilidad: creator + necesidad material de continuidad/contactabilidad; revisar si la señal de audiencia existente debe sustituir a `q2_has_customers = yes`.
- Unknown: `SÍ` mediante `unknown`.
- Not applicable: `NO`; resolver por routing.
- ANSWER_AXIS: `CONSISTENT`.
- Evidencia: DIRECT → Relationship & Recurrence, solo subcomponente direct audience contactability.
- No exigir CRM/email ni premiar una herramienta concreta. `platform_only` indica ausencia de vía directa adicional, no mala relación con la audiencia.
- Relación con q55: q55 mide concentración de plataforma; q56 mide contacto directo. Juntas pueden evidenciar dependencia, sin seleccionar licencia automáticamente.
- Routing: eliminar `notEqV2(q2_has_customers, no)` y exigir necesidad material de evaluar continuidad/contactabilidad.

## 57 — `q2_creator_content_consistency`

### 1. Pregunta actual

¿Qué tan seguido publicas o produces contenido nuevo?

- Copy canónico ejecutable: versión semántica `1`, módulo `creator`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `consistent_schedule` | `consistent_schedule` | Con un ritmo constante | valor operativo; no declara kind especial ni señal adicional |
| `irregular` | `irregular` | De forma irregular, según el tiempo o la inspiración | valor operativo; no declara kind especial ni señal adicional |
| `rarely` | `rarely` | Muy poco | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he seguido de cerca | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: archetypeIncludes(`creator`).

Aparece cuando el arquetipo resuelto contiene `creator` entre sus componentes. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `creator` y declara los propósitos `diagnostic`; aporta evidencia supporting para Discovery.

### 6. Qué intenta determinar

content channel consistency

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso supporting (la tabla de scoring limita el apoyo a la mitad del peso directo). Metadata de preparación: dimensiones candidatas [presencia], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `discovery`: `consistent_schedule` → established; `irregular` → partial; `rarely` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_creator_channel_concentration`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_lead_source`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_acquisition_dependency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_traffic_sources`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_local_discovery`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_local_foot_traffic`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `COMMERCIAL_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina una inferencia universal de Discovery basada en frecuencia de publicación.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN`

Decisión final:
`REMOVE`

Pregunta eliminada:
`¿Qué tan seguido publicas o produces contenido nuevo?`

Notas Yoan/ChatGPT:

- Frecuencia de publicación no equivale a Discovery; cada formato tiene un ritmo natural diferente.
- Publicar más no significa necesariamente mejor y el contenido evergreen puede funcionar con baja frecuencia.
- Eliminar scoring `consistent_schedule → established`, `irregular → partial`, `rarely → weak` y SUPPORTING → Discovery.
- Commercial / License Fit: no utilizar frecuencia para seleccionar licencia.
- Posible uso futuro: auditoría de contenido/implementación sobre frecuencia, calendario, formatos, reutilización, producción y distribución.
- Antes de eliminar técnicamente, buscar referencias a `q2_creator_content_consistency`, `consistent_schedule`, `irregular`, `rarely` y `unknown`.

## 58 — `q2_creator_monetization_model`

### 1. Pregunta actual

¿De qué forma principal monetizas tu audiencia?

- Copy canónico ejecutable: versión semántica `1`, módulo `creator`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `sponsorship` | `sponsorship` | Patrocinios o colaboraciones pagadas | valor operativo; no declara kind especial ni señal adicional |
| `services` | `services` | Vendo mis servicios o consultoría | valor operativo; no declara kind especial ni señal adicional |
| `digital_products` | `digital_products` | Productos digitales (cursos, plantillas, etc.) | valor operativo; no declara kind especial ni señal adicional |
| `memberships` | `memberships` | Membresías o suscripciones | valor operativo; no declara kind especial ni señal adicional |
| `commerce` | `commerce` | Productos físicos | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | Todavía no lo tengo claro | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`creator`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `creator` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `creator` y declara los propósitos `diagnostic, classification`; aporta evidencia direct para Digital Readiness.

### 6. Qué intenta determinar

sustainability, dependencies and process constraints

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `sponsorship` → constraint; `services` → constraint; `digital_products` → constraint; `memberships` → constraint; `commerce` → constraint

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_status_visibility`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_general_process`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_ownership`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_status_visibility`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `CORE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE_FROM_DIAGNOSTIC`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `COMMERCIAL_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina clasificación creator redundante con q3 y que no diferenciaba capacidad.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN DEL DIAGNÓSTICO PRINCIPAL`

Decisión final:
`REMOVE_FROM_DIAGNOSTIC`

Pregunta eliminada:
`¿De qué forma principal monetizas tu audiencia?`

Notas Yoan/ChatGPT:

- El modelo de monetización es clasificación, no calidad ni madurez.
- Eliminar DIRECT → Digital Readiness y cualquier interpretación de tipo de monetización como capacidad.
- Cobertura principal: q3 `q2_monetization`.
- Posible uso futuro: COMMERCIAL_CLARIFICATION fuera del score para detalle creator (patrocinios, servicios, productos digitales, membresías, productos físicos, varias u otra).
- No utilizarla para escoger licencia.
- Antes de eliminar técnicamente, buscar referencias a `q2_creator_monetization_model`, `sponsorship`, `services`, `digital_products`, `memberships`, `commerce` y `unknown`.

## 59 — `q2_creator_conversion`

### 1. Pregunta actual

De las personas que siguen tu contenido, ¿qué tan seguido das el paso de ofrecerles comprar o contratar algo tuyo?

- Copy canónico ejecutable: versión semántica `1`, módulo `creator`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `regularly` | `regularly` | Con cierta regularidad | valor operativo; no declara kind especial ni señal adicional |
| `occasionally` | `occasionally` | De vez en cuando | valor operativo; no declara kind especial ni señal adicional |
| `rarely` | `rarely` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(archetypeIncludes(`creator`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el arquetipo resuelto contiene `creator` entre sus componentes y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `creator` y declara los propósitos `diagnostic`; aporta evidencia direct para Conversion & Access.

### 6. Qué intenta determinar

audience-to-action conversion

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [contacto, seguimiento], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `regularly` → established; `occasionally` → partial; `rarely` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_booking_friction`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_method`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_decision_makers`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_qualification`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `COMMERCIAL_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina frecuencia de oferta como proxy de conversión y evita duplicar q81.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN`

Decisión final:
`REMOVE`

Pregunta eliminada:
`De las personas que siguen tu contenido, ¿qué tan seguido das el paso de ofrecerles comprar o contratar algo tuyo?`

Notas Yoan/ChatGPT:

- Mide frecuencia comercial, no conversión; ofrecer más seguido no significa mejor Conversion & Access.
- Cobertura: q81 para resultado real de interés a acción; q84/claridad de oferta y q56 cuando corresponda.
- Eliminar scoring `regularly → established`, `occasionally → partial`, `rarely → weak` y DIRECT → Conversion & Access.
- No utilizar frecuencia de oferta para seleccionar licencia.
- Posible uso futuro: auditoría de monetización, lanzamientos, campañas o contenido comercial.
- Antes de eliminar técnicamente, buscar referencias a `q2_creator_conversion`, `regularly`, `occasionally`, `rarely` y `unknown`.

## 60 — `q2_nonprofit_support_type`

### 1. Pregunta actual

¿Cómo se sostiene principalmente tu organización?

- Copy canónico ejecutable: versión semántica `1`, módulo `nonprofit`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `donations` | `donations` | Donaciones | valor operativo; no declara kind especial ni señal adicional |
| `membership_dues` | `membership_dues` | Cuotas de membresía | valor operativo; no declara kind especial ni señal adicional |
| `grants` | `grants` | Fondos o subvenciones | valor operativo; no declara kind especial ni señal adicional |
| `mixed` | `mixed` | Una combinación real de las anteriores | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No estoy seguro | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`businessModel`, `nonprofit`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el contexto resolvió `businessModel` como `nonprofit` y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `nonprofit` y declara los propósitos `diagnostic, routing`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

support model applicability

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [ninguna], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_nonprofit_donation_clarity`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_membership_lifecycle`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_participation`: comparte ; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** La pista visible describía el enrutamiento, no cómo responder.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Elige la fuente de apoyo que más pesa hoy.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ROUTING_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_OTHER + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: aclara el apoyo económico, añade otra fuente y conserva la pregunta únicamente como contexto/routing material.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y CONTEXTO DE ROUTING`

Decisión final:
`KEEP + REWRITE + ADD_OTHER + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`¿De dónde viene principalmente el apoyo económico de tu organización?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `donations` | Donaciones de personas o empresas |
| `membership_dues` | Cuotas de miembros o asociados |
| `grants` | Subvenciones, fondos o ayudas de instituciones |
| `mixed` | Una combinación importante de varias de estas fuentes |
| `other` | Principalmente de otra fuente |
| `unknown` | No estoy seguro |

Pista:
`Elige la fuente que más pesa habitualmente. Si varias son importantes de verdad, elige la combinación.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE / ROUTING CONTEXT — NONPROFIT`.
- Evidencia: CONTEXTUAL / ROUTING; score ninguno.
- Unknown: `SÍ`; Other: `SÍ`; no usar la fuente para seleccionar licencia o calidad.
- Routing: nonprofit + `q2_has_customers = yes` + necesidad de aclarar apoyo económico.
- No asumir mayor madurez por varias fuentes; usar únicamente para decidir preguntas posteriores sobre donaciones/membresías/otros mecanismos.

## 61 — `q2_nonprofit_donation_clarity`

### 1. Pregunta actual

¿Alguien que quiera apoyar económicamente a tu organización puede hacerlo fácilmente, sin tener que preguntar cómo?

- Copy canónico ejecutable: versión semántica `1`, módulo `nonprofit`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_easy` | `yes_easy` | Sí, es fácil | valor operativo; no declara kind especial ni señal adicional |
| `somewhat_confusing` | `somewhat_confusing` | Existe, pero es confuso | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, tendría que preguntar cómo | produce {"kind":"friction","value":"conversion","provenance":"derived_fact"} |
| `unknown` | `unknown` | No lo he revisado desde fuera | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`businessModel`, `nonprofit`), inV2(`q2_nonprofit_support_type`, [`donations`, `mixed`])).

Aparece cuando el contexto resolvió `businessModel` como `nonprofit` y `q2_nonprofit_support_type` respondió uno de: `donations`, `mixed`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_nonprofit_support_type`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `nonprofit` y declara los propósitos `diagnostic, friction`; aporta evidencia direct para Clarity & Positioning, Conversion & Access.

### 6. Qué intenta determinar

Si apoyar económicamente es fácil para alguien que ya quiere hacerlo.

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Clarity & Positioning (`clarity_positioning`). Evalúa: Comprensibilidad de la oferta y del siguiente paso..
- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad, contacto], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner. Opciones con señales: friction=conversion.

**Semántica ejecutable por opción/dimensión:**
- `clarity_positioning`: `yes_easy` → strong; `somewhat_confusing` → partial; `no` → missing
- `conversion_access`: `yes_easy` → strong; `somewhat_confusing` → partial; `no` → missing

**Señales producidas por opciones:**
- `no` → {"option":"no","kind":"friction","value":"conversion","provenance":"derived_fact"}

### 9. Relación con otras preguntas

- `q2_nonprofit_support_type`: dependencia de routing explícita en la condición.
- `q2_b2b_qualification`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_product_discovery`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_professional_intake_flow`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_product_visibility`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_offer_readiness`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Apoyarte» personalizaba a la organización.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si apoyar económicamente es fácil para alguien que ya quiere hacerlo.; distinction=Ponte en el lugar de alguien de fuera que quiere donar hoy, sin preguntarte cómo.; why=Si donar no es sencillo, parte del apoyo que ya existe no llega.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + REFINE_SIGNAL`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: mantiene evidencia de donación, ajusta copy y cambia fricción genérica por señal específica de acceso a donación.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE, APLICABILIDAD Y SEÑAL REFINADA`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + REFINE_SIGNAL`

Pregunta final:
`Si una persona quiere hacer una donación habitual a tu organización, ¿qué tan fácil es saber cómo hacerlo y completar el proceso?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `easy` | Es claro y normalmente puede hacerlo sin ayuda |
| `partial` | Puede hacerlo, pero algunos pasos pueden resultar poco claros |
| `difficult` | Normalmente necesita preguntar o recibir ayuda para poder donar |
| `unknown` | No lo sé o no lo he revisado desde fuera |

Pista:
`Piensa en una donación normal, no en casos especiales o aportes que requieran trámites adicionales.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE PRIORITARIA — NONPROFIT / DONATION CONVERSION`.
- Aplicabilidad: nonprofit + support type en [`donations`, `mixed`] + necesidad material de evaluar donación.
- Unknown: `SÍ`; no aplicar como respuesta visible cuando el routing no corresponda.
- Evidencia: DIRECT → Conversion & Access; SUPPORTING → Clarity & Positioning.
- Scoring conceptual: `easy → strong`, `partial → partial`, `difficult → weak`, `unknown` → sin inferencia.
- Sustituir `friction=conversion` por `donation_access_friction`.
- No exigir método de pago, automatización ni cantidad de opciones; evaluar claridad y facilidad real del proceso.
- No hacerla automáticamente a toda organización; el planner debe exigir necesidad material.

## 62 — `q2_nonprofit_membership_lifecycle`

### 1. Pregunta actual

¿Tienes un proceso claro para que alguien se una o renueve su membresía?

- Copy canónico ejecutable: versión semántica `1`, módulo `nonprofit`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_clear` | `yes_clear` | Sí, es un proceso claro | valor operativo; no declara kind especial ni señal adicional |
| `somewhat` | `somewhat` | Existe, pero no es muy claro | valor operativo; no declara kind especial ni señal adicional |
| `no` | `no` | No, es informal o improvisado | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había revisado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`businessModel`, `nonprofit`), inV2(`q2_nonprofit_support_type`, [`membership_dues`, `mixed`])).

Aparece cuando el contexto resolvió `businessModel` como `nonprofit` y `q2_nonprofit_support_type` respondió uno de: `membership_dues`, `mixed`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_nonprofit_support_type`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `nonprofit` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Readiness.

### 6. Qué intenta determinar

Si unirse y renovar la membresía sigue un camino claro y repetible.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `yes_clear` → strong; `somewhat` → partial; `no` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_nonprofit_support_type`: dependencia de routing explícita en la condición.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_status_visibility`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_monetization_model`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_general_process`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_ownership`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si unirse y renovar la membresía sigue un camino claro y repetible.; distinction=Piensa en lo que vive un miembro nuevo o uno que renueva, no en lo que el equipo sabe hacer de memoria.; why=Un camino claro hace que unirse y renovar no dependa de que alguien lo recuerde.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: separa claridad/repetibilidad del método tecnológico y restringe aplicabilidad a membresías materialmente relevantes.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y APLICABILIDAD ADAPTATIVA`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE`

Pregunta final:
`Cuando una persona quiere hacerse miembro o renovar su membresía, ¿qué tan claro y repetible es el proceso?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clear` | Está claro qué hacer y normalmente se gestiona de la misma manera |
| `partial` | Hay una forma habitual, pero algunos pasos cambian o dependen del caso |
| `informal` | Normalmente se decide o resuelve sobre la marcha |
| `unknown` | No lo sé o no lo he revisado así |

Pista:
`Si hacerse miembro funciona bien pero renovar no, o al revés, elige la opción intermedia. No importa si es manual o digital; importa que sea claro y repetible.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — NONPROFIT / MEMBERSHIP PROCESS`.
- Aplicabilidad: nonprofit + support type en [`membership_dues`, `mixed`] + necesidad material de evaluar membresía.
- Unknown: `SÍ` mediante `unknown`.
- Evidencia: DIRECT → Digital Readiness / Base de trabajo.
- Scoring conceptual: `clear → strong`, `partial → partial`, `informal → weak`, `unknown` → sin inferencia.
- No exigir automatización, CRM ni herramienta; proceso manual no es malo y automatizado no es bueno automáticamente.
- Medir consistencia del proceso y no seleccionar licencia por esta respuesta sola.

## 63 — `q2_nonprofit_participation`

### 1. Pregunta actual

¿Qué tan seguido las personas de tu comunidad participan activamente (eventos, voluntariado, responder a tus llamados)?

- Copy canónico ejecutable: versión semántica `1`, módulo `nonprofit`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `regularly` | `regularly` | Con cierta regularidad | valor operativo; no declara kind especial ni señal adicional |
| `occasionally` | `occasionally` | De vez en cuando | valor operativo; no declara kind especial ni señal adicional |
| `rarely` | `rarely` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he seguido de cerca | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`businessModel`, `nonprofit`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el contexto resolvió `businessModel` como `nonprofit` y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `nonprofit` y declara los propósitos `diagnostic`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

participation-mode context

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [alcance, contacto], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_nonprofit_donation_clarity`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_membership_lifecycle`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_support_type`: comparte ; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `COMMERCIAL_REVALIDATION`
- Motivo: elimina engagement contextual sin score ni dependencia material suficiente.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN`

Decisión final:
`REMOVE`

Pregunta eliminada:
`¿Qué tan seguido las personas de tu comunidad participan activamente (eventos, voluntariado, responder a tus llamados)?`

Notas Yoan/ChatGPT:

- La frecuencia esperada depende del tipo de organización y no tiene referencia universal.
- Participación no prueba capacidad digital ni aporta directamente Discovery, Relationship, Conversion o Digital Readiness.
- No aporta score y no se observa una dependencia ejecutable suficientemente fuerte para justificar una pantalla.
- Commercial / License Fit: no utilizar participación para seleccionar licencia.
- Posible uso futuro: auditoría de comunidad sobre participación, eventos, voluntariado y convocatorias.
- Antes de eliminar técnicamente, buscar referencias a `q2_nonprofit_participation`, `regularly`, `occasionally`, `rarely` y `unknown`, confirmando que ninguna ruta real dependa de ella.

## 64 — `q2_operations_process_ownership`

### 1. Pregunta actual

Cuando hay que hacer una tarea importante que se repite, ¿está claro quién la hace, sin tener que decidirlo cada vez?

- Copy canónico ejecutable: versión semántica `1`, módulo `operations`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_clear` | `yes_clear` | Sí, está claro | valor operativo; no declara kind especial ni señal adicional |
| `somewhat` | `somewhat` | Más o menos, depende del caso | valor operativo; no declara kind especial ni señal adicional |
| `improvised` | `improvised` | No, se decide de forma improvisada | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryFriction`, `operations`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el contexto resolvió `primaryFriction` como `operations` y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `operations` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Readiness.

### 6. Qué intenta determinar

sustainability, dependencies and process constraints

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `yes_clear` → strong; `somewhat` → partial; `improvised` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_operations_bottleneck`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_dependency`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_handoffs`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_manual_impact`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `MISSING_NOT_APPLICABLE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Del negocio» excluía organizaciones.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = MAYBE** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Aplica igual si trabajas solo: se trata de la tarea, no del tamaño del equipo.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `ADD_NOT_APPLICABLE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_NOT_APPLICABLE + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: restringe la pregunta a equipos con responsabilidad distribuida y baja el peso a supporting adaptativo.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE, APLICABILIDAD Y PRIORIDAD ADAPTATIVA`

Decisión final:
`KEEP + REWRITE + ADD_NOT_APPLICABLE + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`Cuando una tarea importante se repite y puede quedar en manos de distintas personas, ¿suele estar claro quién es responsable de hacerla?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clear` | Sí, normalmente está claro quién se encarga |
| `partial` | Generalmente está claro, pero a veces hay que decidirlo |
| `unclear` | A menudo hay que decidir sobre la marcha quién se encarga |
| `not_applicable` | No aplica: normalmente esas tareas no se reparten entre varias personas |
| `unknown` | No estoy seguro |

Pista:
`No importa si usas una herramienta, una lista o simplemente un acuerdo entre ustedes. Piensa en si la responsabilidad queda clara.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — OPERATIONS / RESPONSIBILITY`.
- Aplicabilidad: `q2_other_staff = yes` + `q2_has_customers = yes` + necesidad material de responsabilidad operativa. No hacerla a quien trabaja solo salvo razón excepcional.
- Unknown: `SÍ`; Not applicable: `SÍ`, fuera del scoring.
- Evidencia: SUPPORTING → Digital Readiness.
- No puntuar tecnología ni documentación; no usar `primaryFriction` como única puerta ni elegir licencia por esta respuesta aislada.
- q17 mide cómo se manejan tareas repetidas; q64 mide quién responde. No preguntar ambas automáticamente.

## 65 — `q2_operations_handoffs`

### 1. Pregunta actual

Cuando un trabajo pasa por más de una persona (por ejemplo, de quien atiende a quien lo resuelve), ¿la información pasa completa, o se pierde o se duplica?

- Copy canónico ejecutable: versión semántica `1`, módulo `operations`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `transfers_cleanly` | `transfers_cleanly` | Pasa completa | valor operativo; no declara kind especial ni señal adicional |
| `sometimes_lost` | `sometimes_lost` | A veces se pierde o se duplica | valor operativo; no declara kind especial ni señal adicional |
| `not_applicable` | `not_applicable` | No aplica: trabajo solo, no hay traspasos entre personas | kind=not_applicable |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryFriction`, `operations`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el contexto resolvió `primaryFriction` como `operations` y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `operations` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Readiness.

### 6. Qué intenta determinar

sustainability, dependencies and process constraints

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad, seguimiento], dirección negative, unknown=true, N/A=true. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `transfers_cleanly` → strong; `sometimes_lost` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_operations_bottleneck`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_dependency`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_manual_impact`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_process_ownership`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Pregunta larga con «cliente» como único ejemplo.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = YES** — Existe una opción ejecutable de no aplicabilidad.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_INTERMEDIATE + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: añade un nivel intermedio y convierte pérdidas de información en señal específica de handoff, sin exigir software.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE, NIVEL INTERMEDIO Y ROUTING ADAPTATIVO`

Decisión final:
`KEEP + REWRITE + ADD_INTERMEDIATE + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`Cuando una tarea pasa de una persona a otra, ¿qué tan bien llega la información necesaria para continuar?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clean` | Casi siempre llega completa y la otra persona puede continuar sin problema |
| `occasional_gaps` | A veces falta algún dato o hay que volver a preguntar |
| `frequent_gaps` | Con frecuencia falta, se duplica o se pierde información |
| `not_applicable` | No aplica: el trabajo normalmente no pasa de una persona a otra |
| `unknown` | No estoy seguro |

Pista:
`Piensa en información necesaria para continuar el trabajo: datos del cliente, solicitudes, acuerdos, tareas pendientes o documentos.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — OPERATIONS / HANDOFFS`.
- Aplicabilidad: `q2_other_staff = yes` + `q2_has_customers = yes` + necesidad material de handoffs.
- Unknown: `SÍ`; Not applicable: `SÍ`, fuera del scoring.
- Evidencia: SUPPORTING → Digital Readiness.
- Scoring conceptual: clean → strong supporting; occasional_gaps → partial; frequent_gaps → weak; N/A excluido; unknown sin inferencia.
- Posible señal: `handoff_information_gap`; no convertir automáticamente en `friction=operations`.
- No exigir CRM/software ni confundir responsabilidad con traspaso. No preguntar 64 + 65 automáticamente.

## 66 — `q2_operations_bottleneck`

### 1. Pregunta actual

¿Qué es lo que más limita tu capacidad para atender más trabajo ahora mismo?

- Copy canónico ejecutable: versión semántica `1`, módulo `operations`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `one_person` | `one_person` | Depender de una sola persona (incluido yo) | valor operativo; no declara kind especial ni señal adicional |
| `manual_tasks` | `manual_tasks` | Tareas manuales que toman mucho tiempo | valor operativo; no declara kind especial ni señal adicional |
| `approvals` | `approvals` | Esperar aprobaciones o decisiones | valor operativo; no declara kind especial ni señal adicional |
| `scattered_info` | `scattered_info` | Información dispersa, difícil de encontrar | valor operativo; no declara kind especial ni señal adicional |
| `no_clear_bottleneck` | `no_clear_bottleneck` | No siento que haya un límite claro | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryFriction`, `operations`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el contexto resolvió `primaryFriction` como `operations` y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `operations` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Readiness.

### 6. Qué intenta determinar

sustainability, dependencies and process constraints

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance, seguimiento], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `no_clear_bottleneck` → established; `manual_tasks` → weak; `scattered_info` → weak; `one_person` → dependency; `approvals` → constraint

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_operations_dependency`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_handoffs`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_manual_impact`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_process_ownership`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Trabajo o clientes» y «cuello de botella» (jerga).

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Elige el límite que más se nota en el día a día.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + RECLASSIFY_AS_CONTEXT_ROUTING + ADD_OTHER + ADD_COORDINATION + ROUTING_FIX + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: elimina scoring por causa declarada y usa la respuesta para seleccionar la siguiente profundización operativa.

### 15. Decisión humana

Estado:
`APROBADA COMO CONTEXTO Y ROUTING`

Decisión final:
`KEEP + REWRITE + RECLASSIFY_AS_CONTEXT_ROUTING + ADD_OTHER + ADD_COORDINATION + ROUTING_FIX + DEFER_TO_ADAPTIVE`

Pregunta final:
`Pensando en el trabajo del día a día, ¿qué es lo que más te dificulta atender más trabajo o hacerlo con fluidez?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `one_person` | Demasiadas cosas dependen de una sola persona |
| `manual_tasks` | Hay tareas repetitivas que consumen mucho tiempo |
| `approvals` | El trabajo suele quedarse esperando decisiones o aprobaciones |
| `scattered_info` | La información necesaria está repartida o cuesta encontrarla |
| `coordination` | Coordinar tareas entre personas suele generar retrasos o confusión |
| `no_clear_limit` | No noto un problema principal de este tipo |
| `other` | Hay otro problema que pesa más |
| `unknown` | No estoy seguro |

Pista:
`Elige el problema que más se nota hoy. No tiene que ser el único.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — OPERATIONS / BOTTLENECK ROUTER`.
- Evidencia: CONTEXTUAL / ROUTING; score ninguno.
- `primaryFriction=operations` puede aumentar prioridad, pero no es requisito absoluto.
- No interpretar causa declarada como debilidad de Digital Readiness ni elegir licencia.
- Routing: actividad confirmada + necesidad material de aclarar restricción operativa; puede activarse por señales de capacidad, contradicción o baja confianza.

## 67 — `q2_operations_manual_impact`

### 1. Pregunta actual

¿El trabajo manual y repetitivo te está costando de verdad (tiempo, errores o menos capacidad para atender)?

- Copy canónico ejecutable: versión semántica `1`, módulo `operations`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `significant` | `significant` | Sí, de forma importante | valor operativo; no declara kind especial ni señal adicional |
| `somewhat` | `somewhat` | Un poco | valor operativo; no declara kind especial ni señal adicional |
| `not_really` | `not_really` | No realmente | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había medido | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryFriction`, `operations`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el contexto resolvió `primaryFriction` como `operations` y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `operations` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Readiness.

### 6. Qué intenta determinar

Cuánto te cuesta hoy el trabajo manual y repetitivo, sumando tiempo, errores y capacidad.

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `not_really` → established; `somewhat` → partial; `significant` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_operations_bottleneck`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_dependency`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_handoffs`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_process_ownership`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `MISSING_UNKNOWN`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Tres ejemplos (tiempo, errores, capacidad) para un solo juicio: se aclara que las opciones miden la intensidad.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No se trata de si haces cosas a mano, sino de si eso te está costando.
- Panel de ayuda: understand=Cuánto te cuesta hoy el trabajo manual y repetitivo, sumando tiempo, errores y capacidad.; distinction=Basta con que se note en una de las tres cosas; responde por la intensidad del costo, no por cuál de ellas.; why=Muestra si reducir trabajo manual liberaría tiempo o capacidad de verdad.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE + CHANGE_TO_CONSTRAINT_EVIDENCE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia la escala para medir impacto material, no trabajo manual por sí mismo, y mantiene la pregunta como constraint evidence adaptativa.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y EVIDENCIA DE RESTRICCIÓN`

Decisión final:
`KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE + CHANGE_TO_CONSTRAINT_EVIDENCE`

Pregunta final:
`¿Qué tanto te afectan hoy las tareas manuales y repetitivas en el trabajo diario?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `little_or_none` | Poco o nada; no generan un problema importante |
| `moderate` | Se nota algo en tiempo, errores o capacidad |
| `significant` | Me afectan bastante y limitan el trabajo de forma clara |
| `unknown` | No estoy seguro de cuánto afectan |

Pista:
`No importa que una tarea sea manual. Piensa solamente en si hoy provoca pérdida de tiempo, errores o limita lo que puedes atender.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — OPERATIONS / MANUAL WORK IMPACT`.
- Evidencia: SUPPORTING → Digital Readiness.
- Interpretación: little_or_none → no manual-work constraint; moderate → manual_work_impact=moderate; significant → manual_work_impact=high; unknown → sin inferencia.
- No interpretar little_or_none como Digital Readiness fuerte ni significant como necesidad automática de automatización.
- Routing: actividad confirmada + necesidad material de evaluar impacto; prioridad alta si q66 = manual_tasks.

## 68 — `q2_operations_dependency`

### 1. Pregunta actual

Si tú (o la persona clave) no pudieras trabajar durante dos semanas, ¿el trabajo seguiría con normalidad?

- Copy canónico ejecutable: versión semántica `1`, módulo `operations`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_would_continue` | `yes_would_continue` | Sí, seguiría con normalidad | valor operativo; no declara kind especial ni señal adicional |
| `partially` | `partially` | Solo en parte, con dificultad | valor operativo; no declara kind especial ni señal adicional |
| `no_would_stop` | `no_would_stop` | No, se detendría o se vería muy afectado | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryFriction`, `operations`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el contexto resolvió `primaryFriction` como `operations` y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `operations` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Readiness.

### 6. Qué intenta determinar

sustainability, dependencies and process constraints

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `yes_would_continue` → strong; `partially` → partial; `no_would_stop` → dependency

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_operations_bottleneck`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_handoffs`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_manual_impact`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_process_ownership`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «El negocio» excluía organizaciones.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE + TEAM_ONLY + CHANGE_TO_DEPENDENCY_EVIDENCE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: restringe a equipos y mide dependencia de persona clave, no tamaño ni madurez general.

### 15. Decisión humana

Estado:
`APROBADA CON ROUTING DE EQUIPO Y EVIDENCIA REFINADA`

Decisión final:
`KEEP + REWRITE + ROUTING_FIX + DEFER_TO_ADAPTIVE + TEAM_ONLY + CHANGE_TO_DEPENDENCY_EVIDENCE`

Pregunta final:
`Si una persona clave del equipo no pudiera trabajar durante un tiempo, ¿qué tanto podría continuar el trabajo sin depender de ella?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `continues` | La mayor parte podría continuar con normalidad |
| `partially` | Parte podría continuar, pero habría dificultades |
| `high_dependency` | Gran parte del trabajo se detendría o quedaría bloqueada |
| `unknown` | No estoy seguro |

Pista:
`Piensa en información, decisiones o tareas que solo una persona sabe o puede resolver. No se trata simplemente de que una persona sea importante.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — OPERATIONS / KEY-PERSON DEPENDENCY`.
- Routing: solo `q2_other_staff = yes` + actividad confirmada + necesidad material; si trabaja solo no se pregunta.
- Evidencia: SUPPORTING → Digital Readiness.
- Interpretación: continues → baja dependencia; partially → moderada; high_dependency → alta; unknown → sin inferencia.
- No castigar tamaño de equipo, no interpretar una persona importante como problema ni elegir licencia por esta respuesta aislada.
- q66=one_person puede elevar prioridad.

## 69 — `q2_followup_general_process`

### 1. Pregunta actual

Cuando alguien queda esperando una respuesta o un siguiente paso, ¿cómo te aseguras de retomarlo?

- Copy canónico ejecutable: versión semántica `1`, módulo `follow_up`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `defined_process` | `defined_process` | Hay un proceso definido, no depende de acordarse | valor operativo; no declara kind especial ni señal adicional |
| `manual_consistent` | `manual_consistent` | Uso recordatorios o una lista, y funciona de forma consistente | valor operativo; no declara kind especial ni señal adicional |
| `memory_dependent` | `memory_dependent` | Depende de que alguien se acuerde | valor operativo; no declara kind especial ni señal adicional |
| `sometimes_lost` | `sometimes_lost` | A veces simplemente se pierde | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryFriction`, `follow_up`), notEqV2(`q2_has_customers`, `no`)). Regla material: eqV2(`q2_has_customers`, `yes`).

Aparece cuando el contexto resolvió `primaryFriction` como `follow_up` y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable nativa y tampoco se activa la condición material. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `follow_up` y declara los propósitos `diagnostic`; aporta evidencia direct para Relationship & Recurrence, Digital Readiness. Puede seleccionarse en profundización/evidencia material.

### 6. Qué intenta determinar

Cómo se retoma un pendiente o un siguiente paso para que no se pierda.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..
- **SUPPORTING:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `defined_process` → strong; `manual_consistent` → established; `memory_dependent` → weak; `sometimes_lost` → missing
- `digital_readiness`: `defined_process` → strong; `manual_consistent` → established; `memory_dependent` → weak; `sometimes_lost` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_followup_ownership`: comparte dimensión Relationship & Recurrence, Digital Readiness y subcriterio follow-up ownership, recovery and visibility, sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_status_visibility`: comparte dimensión Relationship & Recurrence, Digital Readiness y subcriterio follow-up ownership, recovery and visibility, sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_status_visibility`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_monetization_model`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Tu negocio» excluía organizaciones.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Cómo se retoma un pendiente o un siguiente paso para que no se pierda.; distinction=La diferencia está entre un método que no depende de acordarse y la memoria de alguien.; why=Un pendiente que nadie retoma suele terminar en una persona que se va sin respuesta.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `DEEPENING_ONLY`. Si se elimina se pierde una comprobación adaptativa solo cuando el planner detecta necesidad material.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `ADAPTIVE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `DEFER_TO_ADAPTIVE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + REMOVE_METHOD_BIAS + REFINE_SIGNALS`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia de método declarado a resultado real de seguimiento y convierte la evidencia general en sustituta de varias preguntas específicas.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y SEÑALES REFINADAS`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + REMOVE_METHOD_BIAS + REFINE_SIGNALS`

Pregunta final:
`Cuando alguien queda esperando una respuesta o un siguiente paso, ¿qué suele pasar con ese pendiente?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `consistent` | Normalmente queda registrado o recordado y se retoma a tiempo |
| `mostly_consistent` | Normalmente se retoma, aunque alguna vez puede demorarse |
| `memory_dependent` | Depende bastante de que alguien se acuerde |
| `sometimes_lost` | A veces el pendiente queda sin retomar |
| `unknown` | No estoy seguro de cómo ocurre normalmente |

Pista:
`No importa si usas memoria, una lista, agenda, CRM o automatización. Piensa en si los pendientes realmente se retoman.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE PRIORITARIA — FOLLOW-UP`.
- Aplicabilidad: actividad confirmada + necesidad material de comprobar continuidad; primaryFriction=follow_up aumenta prioridad, pero no es requisito.
- Evidencia: DIRECT → Relationship & Recurrence; SUPPORTING → Digital Readiness.
- Scoring conceptual: consistent → strong; mostly_consistent → partial/established; memory_dependent → weak; sometimes_lost → missing/weak fuerte; unknown sin inferencia.
- Señales: memory_dependent → `followup_memory_dependency`; sometimes_lost → `followup_loss`.
- Manual consistente puede ser excelente; CRM/automatización no reciben mejor score por existir. Dependencia de memoria no equivale automáticamente a pérdida; «se pierde» sí es evidencia observable.
- Eliminar puertas específicas por arquetipo cuando esta pregunta cubra la necesidad.

## 70 — `q2_followup_ownership`

### 1. Pregunta actual

Cuando hay más de una persona involucrada, ¿está claro quién debe responder y cuándo se considera resuelto?

- Copy canónico ejecutable: versión semántica `1`, módulo `follow_up`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_clear` | `yes_clear` | Sí, está claro | valor operativo; no declara kind especial ni señal adicional |
| `unclear` | `unclear` | No, no siempre está claro | valor operativo; no declara kind especial ni señal adicional |
| `not_applicable` | `not_applicable` | No aplica: trabajo solo | kind=not_applicable |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryFriction`, `follow_up`), notEqV2(`q2_has_customers`, `no`)).

Aparece cuando el contexto resolvió `primaryFriction` como `follow_up` y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `follow_up` y declara los propósitos `diagnostic`; aporta evidencia direct para Relationship & Recurrence, Digital Readiness.

### 6. Qué intenta determinar

follow-up ownership, recovery and visibility; sustainability, dependencies and process constraints

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..
- **SUPPORTING:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad, seguimiento], dirección negative, unknown=true, N/A=true. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `yes_clear` → strong; `unclear` → weak
- `digital_readiness`: `yes_clear` → strong; `unclear` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_followup_general_process`: comparte dimensión Relationship & Recurrence, Digital Readiness y subcriterio follow-up ownership, recovery and visibility, sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_status_visibility`: comparte dimensión Relationship & Recurrence, Digital Readiness y subcriterio follow-up ownership, recovery and visibility, sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_status_visibility`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_monetization_model`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = YES** — Existe una opción ejecutable de no aplicabilidad.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + ADD_INTERMEDIATE + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_SUPPORTING + REMOVE_SECOND_CONSTRUCT`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: conserva solo responsabilidad, elimina el constructo de cierre y baja ambas dimensiones a supporting.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y SIMPLIFICACIÓN DEL CONSTRUCTO`

Decisión final:
`KEEP + REWRITE + ADD_INTERMEDIATE + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_SUPPORTING + REMOVE_SECOND_CONSTRUCT`

Pregunta final:
`Cuando varias personas podrían responder o dar seguimiento, ¿suele estar claro quién queda responsable?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clear` | Sí, normalmente queda claro quién debe continuarlo |
| `partial` | Generalmente está claro, aunque a veces hay dudas |
| `unclear` | A menudo no queda claro quién debe continuarlo |
| `not_applicable` | No aplica: normalmente una sola persona se encarga de estos pendientes |
| `unknown` | No estoy seguro |

Pista:
`Piensa en mensajes, solicitudes, cotizaciones o cualquier pendiente que necesite una respuesta posterior.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — FOLLOW-UP / RESPONSIBILITY`.
- Aplicabilidad: `q2_other_staff = yes` + `q2_has_customers = yes` + necesidad material de responsabilidad.
- Unknown: `SÍ`; Not applicable: `SÍ`, fuera del scoring.
- Evidencia: SUPPORTING → Relationship & Recurrence y SUPPORTING → Digital Readiness.
- Eliminar «cuándo se considera resuelto»: responsabilidad clara no equivale a seguimiento exitoso; es una causa posible, no el resultado.
- primaryFriction aumenta prioridad, no es requisito; no preguntar 69 + 70 automáticamente.

## 71 — `q2_followup_status_visibility`

### 1. Pregunta actual

¿Con qué frecuencia repasas de forma activa tus pendientes, para asegurarte de que ninguno se quedó sin resolver?

- Copy canónico ejecutable: versión semántica `1`, módulo `follow_up`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `regularly` | `regularly` | Con cierta regularidad, como parte de mi rutina | valor operativo; no declara kind especial ni señal adicional |
| `only_when_remember` | `only_when_remember` | Solo cuando me acuerdo | valor operativo; no declara kind especial ni señal adicional |
| `rarely` | `rarely` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryFriction`, `follow_up`), notEqV2(`q2_has_customers`, `no`)). Regla material: eqV2(`q2_has_customers`, `yes`).

Aparece cuando el contexto resolvió `primaryFriction` como `follow_up` y `q2_has_customers` no respondió `no`; en el ejecutor actual la ausencia también satisface esta comparación. No aparece cuando falla la condición ejecutable nativa y tampoco se activa la condición material. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** Sí. `notEqV2(q2_has_customers, no)` devuelve verdadero si la respuesta aún es undefined, por lo que la pregunta puede resultar elegible antes de ese prerrequisito. No se corrige en esta fase.

### 5. Función dentro del diagnóstico

Pertenece al módulo `follow_up` y declara los propósitos `diagnostic`; aporta evidencia direct para Relationship & Recurrence, Digital Readiness. Puede seleccionarse en profundización/evidencia material.

### 6. Qué intenta determinar

Si los pendientes se repasan de forma activa para que ninguno quede sin resolver.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Relationship & Recurrence (`relationship_recurrence`). Evalúa: Retoma de pendientes, recurrencia, rebooking y contacto propio..
- **SUPPORTING:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `relationship_recurrence`: `regularly` → established; `only_when_remember` → weak; `rarely` → missing
- `digital_readiness`: `regularly` → established; `only_when_remember` → weak; `rarely` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_followup_general_process`: comparte dimensión Relationship & Recurrence, Digital Readiness y subcriterio follow-up ownership, recovery and visibility, sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_followup_ownership`: comparte dimensión Relationship & Recurrence, Digital Readiness y subcriterio follow-up ownership, recovery and visibility, sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_pipeline`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_status_visibility`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_monetization_model`: comparte dimensión Digital Readiness y subcriterio sustainability, dependencies and process constraints; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si los pendientes se repasan de forma activa para que ninguno quede sin resolver.; distinction=Repasar cuando algo se recuerda no es lo mismo que una revisión habitual.; why=Una revisión habitual detecta lo que quedó sin respuesta antes de que se pierda.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `DEEPENING_ONLY`. Si se elimina se pierde una comprobación adaptativa solo cuando el planner detecta necesidad material.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `ADAPTIVE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `DEFER_TO_ADAPTIVE`
- `ROUTING_FIX`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + MAJOR_REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_SUPPORTING + CHANGE_CONSTRUCT_TO_VISIBILITY`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: sustituye frecuencia de revisión por visibilidad de pendientes y baja la evidencia a supporting.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE MAYOR Y CAMBIO DE CONSTRUCTO`

Decisión final:
`KEEP + MAJOR_REWRITE + DEFER_TO_ADAPTIVE + ROUTING_FIX + DIRECT_TO_SUPPORTING + CHANGE_CONSTRUCT_TO_VISIBILITY`

Pregunta final:
`Si necesitas saber qué respuestas o próximos pasos siguen pendientes, ¿qué tan fácil es identificarlos?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clear` | Es fácil ver qué sigue pendiente |
| `some_effort` | Normalmente puedo saberlo, pero tengo que revisar varias cosas |
| `difficult` | Cuesta saber con seguridad qué sigue pendiente |
| `unknown` | No estoy seguro |

Pista:
`No importa si usas memoria, agenda, una lista, CRM u otra herramienta. Piensa en si puedes identificar los pendientes cuando lo necesitas.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — FOLLOW-UP / PENDING VISIBILITY`.
- Aplicabilidad: actividad confirmada + necesidad material de visibilidad; prioridad si q69=memory_dependent/sometimes_lost o q70=unclear.
- Unknown: `SÍ`; no aplicar como respuesta visible cuando no corresponda.
- Evidencia: SUPPORTING → Relationship & Recurrence y SUPPORTING → Digital Readiness.
- Señal: `difficult → followup_visibility_gap`; no convertir en missing Relationship.
- No exigir revisión manual periódica ni premiar CRM/automatización; ver un pendiente no equivale a atenderlo. q69 conserva evidencia principal.

## 72 — `q2_measurement_source_confidence`

### 1. Pregunta actual

Cuando alguien se convierte en cliente, ¿sabes con seguridad cómo te conoció?

- Copy canónico ejecutable: versión semántica `1`, módulo `measurement`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=nonprofit`):
  - Pregunta visible: Cuando alguien empieza a apoyar o participar en tu organización, ¿sabes con seguridad cómo la conoció?
- Variante 2 (`terminology=clinical`):
  - Pregunta visible: Cuando alguien se convierte en paciente, ¿sabes con seguridad cómo te conoció?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_confident` | `yes_confident` | Sí, con seguridad | valor operativo; no declara kind especial ni señal adicional |
| `sometimes` | `sometimes` | A veces | valor operativo; no declara kind especial ni señal adicional |
| `rarely_no_idea` | `rarely_no_idea` | Casi nunca sé cómo me conoció | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryGoal`, `measure`), eqV2(`q2_has_customers`, `yes`)).

Aparece cuando el contexto resolvió `primaryGoal` como `measure` y `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `measurement` y declara los propósitos `diagnostic`; aporta evidencia direct para Measurement & Optimization.

### 6. Qué intenta determinar

Si sabes por qué vía llegó cada persona nueva que empezó a trabajar contigo o a apoyarte.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Measurement & Optimization (`measurement_optimization`). Evalúa: Origen, resultados, revisión comparativa y capacidad de aprender..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `measurement_optimization`: `yes_confident` → strong; `sometimes` → partial; `rarely_no_idea` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_measurement_decision_review`: comparte dimensión Measurement & Optimization y subcriterio measurement loop and learning; es una pregunta vecina, no necesariamente redundante.
- `q2_measurement_outcome_tracking`: comparte dimensión Measurement & Optimization y subcriterio measurement loop and learning; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_lead_source`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_visibility`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_traffic_sources`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Te compra o se convierte en cliente» no encajaba en organizaciones ni en salud; la pista remitía a otra pregunta.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Se trata de qué tan seguro estás de saberlo, no de cuál fue la vía exacta.
- Panel de ayuda: understand=Si sabes por qué vía llegó cada persona nueva que empezó a trabajar contigo o a apoyarte.; distinction=Responde por lo que sabes con seguridad, no por lo que supones.; why=Saber de dónde llega cada persona permite decidir dónde poner más esfuerzo.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia copy a confiabilidad razonable de origen y elimina la dependencia obligatoria del objetivo declarado.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y ROUTING REDISEÑADO`

Decisión final:
`KEEP + REWRITE + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN`

Pregunta final:
`Cuando llega un cliente nuevo, ¿qué tan seguido puedes saber por qué vía llegó a ti?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `usually_known` | Normalmente sé por qué vía llegó |
| `sometimes_known` | Lo sé en algunos casos, pero no siempre |
| `rarely_known` | Casi nunca puedo saberlo con claridad |
| `unknown` | No sé si esa información se registra o se pregunta |

Pista:
`Cuenta si lo preguntas, lo registras o puedes identificarlo de otra forma. No hace falta usar una herramienta especial.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — MEASUREMENT / SOURCE VISIBILITY`.
- Aplicabilidad: actividad confirmada + necesidad material de origen de nuevos clientes. primaryGoal=measure solo aumenta prioridad, no bloquea.
- Evidence: DIRECT → Measurement & Optimization.
- Scoring: usually_known → strong; sometimes_known → partial; rarely_known → weak; unknown → sin inferencia.
- No exigir tracking automático, CRM ni atribución perfecta; no inferir fuente por tipo de canal.

## 73 — `q2_measurement_outcome_tracking`

### 1. Pregunta actual

¿Podrías decir, aunque sea de forma aproximada, cuántos de tus contactos terminan en un resultado concreto (por ejemplo, una venta o un cliente nuevo)?

- Copy canónico ejecutable: versión semántica `1`, módulo `measurement`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=nonprofit`):
  - Pregunta visible: ¿Podrías decir, aunque sea de forma aproximada, cuántos de tus contactos terminan en un resultado concreto (por ejemplo, una donación, una inscripción o una participación)?
- Variante 2 (`terminology=appointments, clinical`):
  - Pregunta visible: ¿Podrías decir, aunque sea de forma aproximada, cuántos de tus contactos terminan en un resultado concreto (por ejemplo, una cita agendada)?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `yes_approx` | `yes_approx` | Sí, tengo una cifra aproximada en la que confío | valor operativo; no declara kind especial ni señal adicional |
| `rough_idea` | `rough_idea` | Solo una idea muy general, poco confiable | valor operativo; no declara kind especial ni señal adicional |
| `no_idea` | `no_idea` | No, no sabría estimarlo | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No estoy seguro de cómo responder | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryGoal`, `measure`), eqV2(`q2_has_customers`, `yes`)).

Aparece cuando el contexto resolvió `primaryGoal` como `measure` y `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `measurement` y declara los propósitos `diagnostic`; aporta evidencia direct para Measurement & Optimization.

### 6. Qué intenta determinar

Si podrías estimar qué parte de tus contactos termina en un resultado concreto.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Measurement & Optimization (`measurement_optimization`). Evalúa: Origen, resultados, revisión comparativa y capacidad de aprender..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `measurement_optimization`: `yes_approx` → established; `rough_idea` → weak; `no_idea` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_measurement_decision_review`: comparte dimensión Measurement & Optimization y subcriterio measurement loop and learning; es una pregunta vecina, no necesariamente redundante.
- `q2_measurement_source_confidence`: comparte dimensión Measurement & Optimization y subcriterio measurement loop and learning; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_lead_source`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_visibility`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_traffic_sources`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `RESPONSE_OPTIONS_OVERLAP`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «No tengo idea» y la opción de incertidumbre significaban lo mismo con estados distintos; «consultas» en salud.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hace falta un número exacto: basta con saber si podrías estimarlo.
- Panel de ayuda: understand=Si podrías estimar qué parte de tus contactos termina en un resultado concreto.; distinction=Una estimación basada en lo que registras cuenta; una impresión sin datos es una idea general.; why=Sin una estimación así no se puede saber si un cambio mejora o empeora los resultados.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `NEEDS_DOMAIN_REVIEW`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + MAJOR_REWRITE + FIX_RESPONSE_OVERLAP + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: separa capacidad de medir de resultado de conversión y distingue falta de datos de desconocimiento.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE MAYOR Y CORRECCIÓN DE RESPUESTAS`

Decisión final:
`KEEP + MAJOR_REWRITE + FIX_RESPONSE_OVERLAP + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN`

Pregunta final:
`Si quisieras saber qué parte de las personas interesadas termina en un resultado concreto, ¿podrías obtener una cifra aproximada con la información que tienes?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `reliable_estimate` | Sí, tengo información suficiente para sacar una cifra aproximada confiable |
| `partial_estimate` | Tengo algo de información, pero está incompleta y la cifra sería poco confiable |
| `not_trackable` | No registro suficiente información para poder estimarlo |
| `unknown` | No sé qué información está registrada o disponible |

Pista:
`No necesitas un sistema especial. Pueden servir pedidos, citas, notas, una hoja, un CRM u otro registro que permita comparar interés y resultado.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — MEASUREMENT / OUTCOME TRACKING`.
- Aplicabilidad: actividad confirmada + necesidad material de capacidad de medir resultados; primaryGoal=measure solo prioriza.
- Unknown: `SÍ` mediante `unknown`.
- Evidencia: DIRECT → Measurement & Optimization.
- Scoring: reliable_estimate → strong; partial_estimate → partial; not_trackable → weak; unknown → sin inferencia.
- q73 mide capacidad de medir; q81 mide resultado de conversión. No exigir software, porcentaje exacto ni memoria del usuario.

## 74 — `q2_measurement_decision_review`

### 1. Pregunta actual

¿Con qué frecuencia revisas tus números o resultados comparándolos con un periodo anterior, no solo la sensación del día a día?

- Copy canónico ejecutable: versión semántica `1`, módulo `measurement`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `regularly` | `regularly` | Con cierta regularidad | valor operativo; no declara kind especial ni señal adicional |
| `occasionally` | `occasionally` | De vez en cuando | valor operativo; no declara kind especial ni señal adicional |
| `rarely_never` | `rarely_never` | Casi nunca | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`primaryGoal`, `measure`), eqV2(`q2_has_customers`, `yes`)).

Aparece cuando el contexto resolvió `primaryGoal` como `measure` y `q2_has_customers` respondió exactamente `yes`. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `measurement` y declara los propósitos `diagnostic`; aporta evidencia direct para Measurement & Optimization.

### 6. Qué intenta determinar

Si los resultados se revisan contra un periodo anterior para decidir.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Measurement & Optimization (`measurement_optimization`). Evalúa: Origen, resultados, revisión comparativa y capacidad de aprender..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `measurement_optimization`: `regularly` → established; `occasionally` → partial; `rarely_never` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_measurement_outcome_tracking`: comparte dimensión Measurement & Optimization y subcriterio measurement loop and learning; es una pregunta vecina, no necesariamente redundante.
- `q2_measurement_source_confidence`: comparte dimensión Measurement & Optimization y subcriterio measurement loop and learning; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_lead_source`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_cart_visibility`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_traffic_sources`: comparte dimensión Measurement & Optimization; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si los resultados se revisan contra un periodo anterior para decidir.; distinction=Mirar números de vez en cuando no es lo mismo que compararlos con un periodo anterior.; why=Comparar periodos muestra si algo mejoró de verdad o solo lo parece.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **ALTA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `ESSENTIAL_DIRECT_EVIDENCE`. Si se elimina se pierde evidencia directa material de la dimensión asignada.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + MAJOR_REWRITE + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN + CHANGE_FREQUENCY_TO_DECISION_USE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: sustituye frecuencia fija por uso de resultados para aprender y decidir.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE MAYOR Y CAMBIO DE CONSTRUCTO`

Decisión final:
`KEEP + MAJOR_REWRITE + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN + CHANGE_FREQUENCY_TO_DECISION_USE`

Pregunta final:
`Cuando decides qué mantener o cambiar, ¿qué tanto te apoyas en resultados que ya has observado?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `usually_evidence_based` | Normalmente reviso resultados anteriores antes de decidir |
| `sometimes_evidence_based` | A veces reviso resultados y otras veces decido por impresión o experiencia |
| `mostly_impression` | Normalmente decido sin revisar resultados anteriores |
| `unknown` | No estoy seguro de cómo lo hago normalmente |

Pista:
`No hace falta revisar datos todas las semanas. Piensa en si, cuando toca tomar una decisión, utilizas resultados reales para comparar y aprender.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — MEASUREMENT / LEARNING LOOP`.
- Aplicabilidad: actividad confirmada + necesidad material de aprendizaje/decisión; primaryGoal=measure solo aumenta prioridad.
- Evidencia: DIRECT → Measurement & Optimization.
- Scoring: usually_evidence_based → strong; sometimes_evidence_based → partial; mostly_impression → weak; unknown → sin inferencia.
- No exigir frecuencia fija, comparación mensual, dashboard ni analytics; medir uso de evidencia para aprender. No preguntar 72/73/74 siempre.

## 75 — `q2_startup_problem_clarity`

### 1. Pregunta actual

Cuando explicas este proyecto, ¿puedes decir qué problema concreto resuelve y para quién?

- Copy canónico ejecutable: versión semántica `1`, módulo `startup`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `clear_audience_problem` | `clear_audience_problem` | Sí, puedo describir ambos con claridad | valor operativo; no declara kind especial ni señal adicional |
| `problem_clear_audience_unclear` | `problem_clear_audience_unclear` | El problema está claro, pero todavía no para quién exactamente | valor operativo; no declara kind especial ni señal adicional |
| `audience_clear_problem_unclear` | `audience_clear_problem_unclear` | Sé a quién quiero ayudar, pero no he concretado bien el problema | valor operativo; no declara kind especial ni señal adicional |
| `both_unclear` | `both_unclear` | Todavía estoy explorando las dos cosas | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había comprobado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`entity`, `project`), contextIn(`growthStage`, [`idea`, `starting`])).

Aparece cuando el contexto resolvió `entity` como `project` y el contexto resolvió `growthStage` como uno de: `idea`, `starting`. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `startup` y declara los propósitos `diagnostic`; aporta evidencia direct para Clarity & Positioning, Conversion & Access.

### 6. Qué intenta determinar

offer clarity and next action

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Clarity & Positioning (`clarity_positioning`). Evalúa: Comprensibilidad de la oferta y del siguiente paso..
- **SUPPORTING:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `clarity_positioning`: `clear_audience_problem` → strong; `problem_clear_audience_unclear` → partial; `audience_clear_problem_unclear` → partial; `both_unclear` → missing
- `conversion_access`: `clear_audience_problem` → strong; `problem_clear_audience_unclear` → partial; `audience_clear_problem_unclear` → partial; `both_unclear` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_startup_offer_readiness`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_qualification`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_product_discovery`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_donation_clarity`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_professional_intake_flow`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_product_visibility`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hace falta tener marca, web ni empresa constituida; buscamos claridad sobre la necesidad y la persona a la que sirve.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + REMOVE_CONVERSION_SUPPORTING + KEEP_AS_STARTUP_CORE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: amplía problema a necesidad/objetivo, conserva solo Clarity y la hace central dentro de startup.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y AJUSTE DE DIMENSIONES`

Decisión final:
`KEEP + REWRITE + REMOVE_CONVERSION_SUPPORTING + KEEP_AS_STARTUP_CORE`

Pregunta final:
`Cuando explicas tu proyecto, ¿tienes claro para quién es y qué quiere ayudarle a resolver o conseguir?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clear_both` | Sí, tengo claras las dos cosas |
| `audience_clear_need_unclear` | Tengo claro para quién es, pero todavía estoy definiendo qué necesidad atiende |
| `need_clear_audience_unclear` | Tengo clara la necesidad, pero todavía no exactamente para quién |
| `both_exploring` | Todavía estoy definiendo ambas cosas |
| `unknown` | No estoy seguro |

Pista:
`No necesitas tener nombre, web ni empresa creada. Piensa solo en la persona a la que quieres llegar y en qué quieres ayudarla a resolver, mejorar o conseguir.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE DENTRO DE LA RUTA STARTUP`; routing: entity=project + growthStage en [idea, starting].
- Evidencia: DIRECT → Clarity & Positioning; eliminar SUPPORTING → Conversion & Access.
- Scoring: clear_both → strong; dos estados parciales → partial; both_exploring → weak; unknown → sin inferencia.
- No penalizar proyecto temprano por no tener CRM, reseñas o recurrencia.

## 76 — `q2_startup_validation_evidence`

### 1. Pregunta actual

¿Qué has comprobado sobre el problema con las personas a las que quieres ayudar?

- Copy canónico ejecutable: versión semántica `1`, módulo `startup`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `none` | `none` | Aún no lo he comprobado con personas reales | valor operativo; no declara kind especial ni señal adicional |
| `conversations` | `conversations` | He conversado con personas del público al que quiero llegar y recogido problemas concretos | valor operativo; no declara kind especial ni señal adicional |
| `problem_test` | `problem_test` | He probado una hipótesis del problema y aprendí de las respuestas | valor operativo; no declara kind especial ni señal adicional |
| `repeated_problem` | `repeated_problem` | El mismo problema apareció de forma consistente en varias conversaciones o pruebas | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No he separado ese aprendizaje todavía | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`entity`, `project`), contextIn(`growthStage`, [`idea`, `starting`])).

Aparece cuando el contexto resolvió `entity` como `project` y el contexto resolvió `growthStage` como uno de: `idea`, `starting`. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `startup` y declara los propósitos `diagnostic`; aporta evidencia supporting para Clarity & Positioning.

### 6. Qué intenta determinar

Qué has comprobado sobre el problema hablando o probando con personas reales.

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Clarity & Positioning (`clarity_positioning`). Evalúa: Comprensibilidad de la oferta y del siguiente paso..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso supporting (la tabla de scoring limita el apoyo a la mitad del peso directo). Metadata de preparación: dimensiones candidatas [confianza], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `clarity_positioning`: `repeated_problem` → strong; `problem_test` → established; `conversations` → partial; `none` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_startup_offer_readiness`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_problem_clarity`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_qualification`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_product_discovery`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_donation_clarity`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.
- `q2_presence_offer_clarity`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `MISSING_UNKNOWN`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Niveles de aprendizaje sin ayuda; la pista remitía a otra pregunta.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Cuenta lo que aprendiste sobre el problema, no si alguien ya quiso comprar o empezar.
- Panel de ayuda: understand=Qué has comprobado sobre el problema hablando o probando con personas reales.; distinction=Cuenta lo que aprendiste de personas del público al que quieres llegar, no opiniones de amigos ni tu propia intuición.; why=Una necesidad comprobada reduce el riesgo de lanzar algo que nadie necesita.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + MAJOR_REWRITE + RECLASSIFY_AS_CONTEXT_CONFIDENCE + DEFER_TO_ADAPTIVE + REMOVE_SCORING`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: elimina scoring de claridad y usa contrastación con personas reales para modular confianza en q75.

### 15. Decisión humana

Estado:
`APROBADA COMO CONTEXTO DE CONFIANZA`

Decisión final:
`KEEP + MAJOR_REWRITE + RECLASSIFY_AS_CONTEXT_CONFIDENCE + DEFER_TO_ADAPTIVE + REMOVE_SCORING`

Pregunta final:
`Hasta ahora, ¿qué has podido comprobar hablando o probando con personas a las que quieres llegar?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `none` | Todavía no lo he comprobado con personas reales |
| `some_evidence` | He hablado con algunas personas y he recogido necesidades o situaciones concretas |
| `repeated_pattern` | La misma necesidad o situación ha aparecido varias veces con personas diferentes |
| `unknown` | No estoy seguro de qué he comprobado realmente |

Pista:
`Cuenta solo lo que hayas aprendido directamente de las personas a las que quieres llegar, no tu propia intuición ni opiniones generales.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — STARTUP / VALIDATION CONFIDENCE`.
- Evidencia: CONTEXTUAL / CONFIDENCE; score ninguno.
- Uso: refinar confianza en q75, no medir éxito del negocio, demanda o calidad de presencia.
- No exigir metodología de startup ni premiar cantidad de entrevistas. q78 mide señales de demanda por separado.

## 77 — `q2_startup_offer_readiness`

### 1. Pregunta actual

¿Qué tan concreta es la oferta que podrías poner a prueba ahora?

- Copy canónico ejecutable: versión semántica `1`, módulo `startup`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `ready_to_test` | `ready_to_test` | Puedo explicar qué recibe la persona, a cambio de qué y cómo empezar | valor operativo; no declara kind especial ni señal adicional |
| `mostly_ready` | `mostly_ready` | La idea está bastante definida, pero faltan detalles por probar | valor operativo; no declara kind especial ni señal adicional |
| `shaping` | `shaping` | Todavía estoy dando forma a lo que ofrecería | valor operativo; no declara kind especial ni señal adicional |
| `not_defined` | `not_defined` | Aún no existe una oferta concreta | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había revisado como una oferta | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`entity`, `project`), contextIn(`growthStage`, [`idea`, `starting`])).

Aparece cuando el contexto resolvió `entity` como `project` y el contexto resolvió `growthStage` como uno de: `idea`, `starting`. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `startup` y declara los propósitos `diagnostic`; aporta evidencia direct para Clarity & Positioning, Conversion & Access.

### 6. Qué intenta determinar

Si ya existe algo concreto que una persona podría aceptar o rechazar hoy.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Clarity & Positioning (`clarity_positioning`). Evalúa: Comprensibilidad de la oferta y del siguiente paso..
- **SUPPORTING:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `clarity_positioning`: `ready_to_test` → strong; `mostly_ready` → established; `shaping` → weak; `not_defined` → missing
- `conversion_access`: `ready_to_test` → strong; `mostly_ready` → established; `shaping` → weak; `not_defined` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_startup_problem_clarity`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_qualification`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_product_discovery`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_donation_clarity`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_professional_intake_flow`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_product_visibility`: comparte dimensión Clarity & Positioning, Conversion & Access y subcriterio offer clarity and next action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Una oferta concreta puede ser un servicio, producto, piloto o propuesta; no exige web, marca ni registro legal.
- Panel de ayuda: understand=Si ya existe algo concreto que una persona podría aceptar o rechazar hoy.; distinction=Responde por lo que podrías ofrecer mañana, no por la versión final que imaginas.; why=Sin una oferta concreta no se puede comprobar si alguien la aceptaría.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + REMOVE_CONVERSION_SUPPORTING + KEEP_AS_STARTUP_CORE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: mide concreción de propuesta, no acceso/conversión, y queda como núcleo de la ruta startup.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y AJUSTE DE DIMENSIONES`

Decisión final:
`KEEP + REWRITE + REMOVE_CONVERSION_SUPPORTING + KEEP_AS_STARTUP_CORE`

Pregunta final:
`Si hoy quisieras probar tu idea con una persona real, ¿qué tan claro tienes qué le ofrecerías y cuál sería el siguiente paso?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `ready_to_test` | Puedo explicar claramente qué recibiría y cómo podría empezar |
| `mostly_ready` | La propuesta está bastante clara, aunque todavía faltan algunos detalles |
| `shaping` | Tengo una idea general, pero todavía estoy definiendo qué ofrecer exactamente |
| `not_defined` | Todavía no tengo algo concreto que pueda ofrecer |
| `unknown` | No estoy seguro de qué tan definida está |

Pista:
`Puede ser un servicio, producto, piloto, experiencia o propuesta. No necesita estar terminado ni tener web o marca.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `CORE DENTRO DE LA RUTA STARTUP`.
- Routing: entity=project + growthStage en [idea, starting].
- Evidencia: DIRECT → Clarity & Positioning; eliminar SUPPORTING → Conversion & Access.
- Scoring: ready_to_test → strong; mostly_ready → established/strong moderado; shaping → partial/weak; not_defined → weak; unknown → sin inferencia.
- No exigir web, branding, empresa registrada ni producto terminado; oferta concreta no equivale a demanda ni conversión.

## 78 — `q2_startup_demand_signal`

### 1. Pregunta actual

Hasta ahora, ¿qué acción concreta de demanda ha ocurrido?

- Copy canónico ejecutable: versión semántica `1`, módulo `startup`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `none` | `none` | Ninguna acción concreta todavía | valor operativo; no declara kind especial ni señal adicional |
| `interest` | `interest` | Personas han preguntado o mostrado interés | valor operativo; no declara kind especial ni señal adicional |
| `request` | `request` | Alguien pidió una propuesta o solicitó empezar | valor operativo; no declara kind especial ni señal adicional |
| `paid_trial` | `paid_trial` | Alguien aceptó una prueba o piloto pagado | valor operativo; no declara kind especial ni señal adicional |
| `commitment` | `commitment` | Hubo una preventa, compromiso o primer cliente | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No he distinguido esas señales | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`entity`, `project`), contextIn(`growthStage`, [`idea`, `starting`])).

Aparece cuando el contexto resolvió `entity` como `project` y el contexto resolvió `growthStage` como uno de: `idea`, `starting`. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `startup` y declara los propósitos `diagnostic`; aporta evidencia direct para Conversion & Access.

### 6. Qué intenta determinar

Cuál es el paso más concreto que alguien ya dio hacia lo que ofreces.

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [alcance], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `commitment` → strong; `paid_trial` → established; `request` → partial; `interest` → weak; `none` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_appointments_booking_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_method`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_checkout_friction`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_hospitality_delivery_takeaway`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.
- `q2_service_quote_followup`: comparte dimensión Conversion & Access y subcriterio access, booking and concrete action; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `MISSING_UNKNOWN`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Interés frente a acción concreta necesitaba ayuda.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Distingue interés de una acción: solicitud, prueba pagada, preventa, compromiso o primer cliente.
- Panel de ayuda: understand=Cuál es el paso más concreto que alguien ya dio hacia lo que ofreces.; distinction=Preguntar o decir que le interesa no es lo mismo que pedir una propuesta, pagar una prueba o comprometerse.; why=Una acción concreta es una señal de demanda más fuerte que el interés declarado.
- HELP = USEFUL según la metadata ejecutable de lenguaje (recommended). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + REWRITE + MERGE_PAID_TRIAL_AND_COMMITMENT + RECLASSIFY_AS_CONTEXT + DEFER_TO_ADAPTIVE + REMOVE_SCORING`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: transforma la pregunta en confianza de etapa y elimina supporting automático a Conversion.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE Y CAMBIO DE EVIDENCIA`

Decisión final:
`KEEP + REWRITE + MERGE_PAID_TRIAL_AND_COMMITMENT + RECLASSIFY_AS_CONTEXT + DEFER_TO_ADAPTIVE + REMOVE_SCORING`

Pregunta final:
`¿Cuál es el paso más concreto que una persona ya ha dado hacia tu idea u oferta?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `none` | Todavía nadie ha dado un paso concreto |
| `interest` | Algunas personas han preguntado o mostrado interés |
| `request` | Alguien pidió más información, una propuesta o quiso probar |
| `commitment` | Alguien pagó, hizo una preventa, aceptó un piloto o se comprometió a empezar |
| `unknown` | No estoy seguro de cuál ha sido la señal más concreta |

Pista:
`Elige el paso más avanzado que realmente haya ocurrido. Mostrar interés cuenta, pero no es lo mismo que pedir avanzar o comprometerse.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — STARTUP / DEMAND EVIDENCE`.
- Evidencia: CONTEXTUAL / STARTUP-STAGE CONFIDENCE; score ninguno.
- No medir éxito del negocio ni castigar idea temprana; no confundir interés con compra.
- Complementa q76 (contraste), q77 (oferta concreta) y q79 (prueba de llegada).

## 79 — `q2_startup_first_channel`

### 1. Pregunta actual

¿Tienes claro por qué canal intentarías llegar primero a las personas adecuadas?

- Copy canónico ejecutable: versión semántica `1`, módulo `startup`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `specific_channel` | `specific_channel` | Sí, tengo un canal inicial concreto y sé por qué encaja | valor operativo; no declara kind especial ni señal adicional |
| `several_candidates` | `several_candidates` | Tengo varias opciones, pero aún no he elegido | valor operativo; no declara kind especial ni señal adicional |
| `no_channel` | `no_channel` | Todavía no sé cómo llegar | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había pensado todavía | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`entity`, `project`), contextIn(`growthStage`, [`idea`, `starting`])).

Aparece cuando el contexto resolvió `entity` como `project` y el contexto resolvió `growthStage` como uno de: `idea`, `starting`. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `startup` y declara los propósitos `diagnostic`; aporta evidencia direct para Discovery.

### 6. Qué intenta determinar

source of discovery; channel dependency

### 7. Dimensión o dimensiones afectadas

- **SUPPORTING:** Discovery (`discovery`). Evalúa: Alcance, fuentes de descubrimiento y dependencia de un único canal..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [presencia], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `discovery`: `specific_channel` → established; `several_candidates` → partial; `no_channel` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_creator_channel_concentration`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_acquisition_dependency`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_local_discovery`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_promotions`: comparte dimensión Discovery y subcriterio source of discovery, channel dependency; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_lead_source`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.
- `q2_creator_content_consistency`: comparte dimensión Discovery; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Acceso al público» es jerga.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Puede ser conversación directa, comunidad, alianzas, contenido, búsqueda u otro canal; no hace falta tenerlo montado.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `SUPPORTING_ONLY`. Si se elimina se pierde apoyo contextual/secundario, no la única lectura directa.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + MAJOR_REWRITE + CHANGE_CONSTRUCT + DEFER_TO_ADAPTIVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: sustituye elegir un canal por haber probado realmente una vía de llegada al público.

### 15. Decisión humana

Estado:
`APROBADA CON CAMBIO DE CONSTRUCTO`

Decisión final:
`KEEP + MAJOR_REWRITE + CHANGE_CONSTRUCT + DEFER_TO_ADAPTIVE`

Pregunta final:
`¿Ya has probado alguna forma de llegar a las personas a las que quieres dirigirte?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `working_channel` | Sí, ya encontré al menos una forma que consigue llegar a algunas de esas personas |
| `tested_uncertain` | He probado alguna forma, pero todavía no sé si funciona de manera consistente |
| `not_tested` | Todavía no he probado una forma concreta de llegar a ellas |
| `unknown` | No estoy seguro de qué cuenta como una prueba real |

Pista:
`Puede ser contacto directo, una comunidad, contenido, búsqueda, una alianza u otra vía. Lo importante es haberla probado con personas reales, no solo haber elegido una opción.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — STARTUP / DISCOVERY TEST`.
- Evidencia: SUPPORTING → Discovery.
- working_channel es señal supporting positiva, no Discovery fuerte; not_tested indica aspecto por desarrollar, no missing absoluto.
- Elegir canal no equivale a Discovery; no exigir redes sociales/publicidad ni premiar canal concreto.

## 80 — `q2_startup_next_milestone`

### 1. Pregunta actual

¿Cuál es el siguiente hito que demostraría que el proyecto avanzó de verdad?

- Copy canónico ejecutable: versión semántica `1`, módulo `startup`.
- Variantes visibles ejecutables:
- Variante 1 (`terminology=nonprofit`):
  - Etiquetas visibles por opción: `secure_commitment` → Conseguir un compromiso, una primera donación o los primeros participantes

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `clarify_offer` | `clarify_offer` | Definir y poder explicar una oferta concreta | valor operativo; no declara kind especial ni señal adicional |
| `talk_to_audience` | `talk_to_audience` | Hablar con personas del público al que quiero llegar y aprender de sus respuestas | valor operativo; no declara kind especial ni señal adicional |
| `run_pilot` | `run_pilot` | Hacer una prueba, piloto o primera entrega | valor operativo; no declara kind especial ni señal adicional |
| `secure_commitment` | `secure_commitment` | Conseguir una solicitud, preventa, compromiso o primer cliente | valor operativo; no declara kind especial ni señal adicional |
| `not_clear` | `not_clear` | Todavía no tengo un hito observable | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había definido así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(contextEquals(`entity`, `project`), contextIn(`growthStage`, [`idea`, `starting`])).

Aparece cuando el contexto resolvió `entity` como `project` y el contexto resolvió `growthStage` como uno de: `idea`, `starting`. No aparece cuando falla la condición ejecutable. No lee una respuesta previa directamente.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `startup` y declara los propósitos `diagnostic, goal`; no aporta evidencia dimensional directa; su valor es resolver contexto, aplicabilidad o routing.

### 6. Qué intenta determinar

declared next milestone

### 7. Dimensión o dimensiones afectadas

- **CONTEXTUAL:** no afecta una dimensión; funciona como contexto, aplicabilidad o routing.

### 8. Cómo afecta actualmente el resultado

No genera score dimensional; el resultado solo puede cambiar por el contexto/routing que resuelve. Metadata de preparación: dimensiones candidatas [claridad, alcance], dirección neutral, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
No hay estados de capacidad por opción: es una pregunta contextual/routing y no aporta score dimensional.

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_startup_demand_signal`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_first_channel`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_offer_readiness`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_problem_clarity`: comparte ; es una pregunta vecina, no necesariamente redundante.
- `q2_startup_validation_evidence`: comparte ; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Primer cliente» en un proyecto sin fines de lucro ya en marcha.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Elige un resultado observable, no solo una tarea o una intención de crecer.
- Panel de ayuda: No hay helpIntent declarado.
- HELP = NOT_NEEDED según la metadata ejecutable de lenguaje (not_needed). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **MEDIA**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `APPLICABILITY_CONTEXT`. Si se elimina se pierde contexto o routing necesario para decidir qué observar después.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `UNDECIDED`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE + DERIVE_NEXT_MILESTONE_FROM_EVIDENCE`.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: elimina una preferencia declarada y migra la recomendación al resultado derivado de q75–q79.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN DEL BANCO PRODUCTIVO`

Decisión final:
`REMOVE + DERIVE_NEXT_MILESTONE_FROM_EVIDENCE`

Pregunta eliminada:
`¿Cuál es el siguiente hito que demostraría que el proyecto avanzó de verdad?`

Notas Yoan/ChatGPT:

- Pregunta intención/hipótesis, no evidencia actual; duplica q75–q79 y no genera score.
- Migrar funcionalidad a RESULT/RECOMMENDATION: q75 débil → aclarar público/necesidad; q76 débil → contrastar con personas; q77 débil → definir oferta testeable; q78 sin señal → conseguir primera acción/compromiso; q79 sin prueba → probar llegada al público.
- Commercial / License Fit: no utilizar hito declarado para seleccionar licencia.
- Antes de eliminar, buscar referencias a `q2_startup_next_milestone`, `clarify_offer`, `talk_to_audience`, `run_pilot`, `secure_commitment`, `not_clear` y `unknown`.

## 81 — `q2_conversion_interest_to_action`

### 1. Pregunta actual

De las personas que muestran interés en lo que ofreces (preguntan, piden información o una cotización), ¿cuántas terminan comprando o contratando?

- Copy canónico ejecutable: versión semántica `1`, módulo `conversion`.
- Variantes visibles ejecutables:
- Variante 1 (`businessModel=nonprofit`):
  - Pregunta visible: De las personas que muestran interés en apoyar o participar en tu organización, ¿cuántas terminan haciéndolo?
- Variante 2 (`terminology=ecommerce, retail`):
  - Pregunta visible: De las personas que muestran interés en tus productos (preguntan, piden información o los guardan para después), ¿cuántas terminan comprando?
- Variante 3 (`terminology=b2b`):
  - Pregunta visible: De las empresas que muestran interés (piden información, una reunión o una propuesta), ¿cuántas terminan contratando?
- Variante 4 (`terminology=hospitality`):
  - Pregunta visible: De las personas que preguntan o piden información (por mensaje, teléfono o redes), ¿cuántas terminan reservando o viniendo?
- Variante 5 (`terminology=clinical`):
  - Pregunta visible: De las personas que solicitan información sobre tu atención, ¿cuántas terminan agendando una cita?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `most` | `most` | La mayoría | valor operativo; no declara kind especial ni señal adicional |
| `about_half` | `about_half` | Más o menos la mitad | valor operativo; no declara kind especial ni señal adicional |
| `few` | `few` | Pocas | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he observado | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

No tiene elegibilidad nativa; por diseño solo puede entrar por evidencia material. Regla material: andV2(eqV2(`q2_has_customers`, `yes`), notV2(archetypeIncludes(`appointments`))).

No aparece en la ruta base; solo se considera para una necesidad material del planner. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `conversion` y declara los propósitos `diagnostic`; aporta evidencia direct para Conversion & Access. Puede seleccionarse en profundización/evidencia material.

### 6. Qué intenta determinar

Si el interés que ya llega termina en un paso concreto: una compra, una contratación, una reserva o un apoyo.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Conversion & Access (`conversion_access`). Evalúa: Acceso, fricción de entrada, oferta accionable y paso de conversión..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [contacto], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `conversion_access`: `most` → strong; `about_half` → partial; `few` → weak

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_appointments_booking_friction`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_booking_method`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_appointments_lead_to_booking`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_decision_makers`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.
- `q2_b2b_qualification`: comparte dimensión Conversion & Access; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Cotización» y «comprando o contratando» no encajaban en tienda, B2B, hospitalidad ni salud.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: Una estimación aproximada basta; piensa en lo que ocurre normalmente.
- Panel de ayuda: understand=Si el interés que ya llega termina en un paso concreto: una compra, una contratación, una reserva o un apoyo.; distinction=Piensa en lo que realmente ocurre con quienes preguntan, no en cuántas personas te encuentran.; why=Muestra si el interés avanza o se queda en el camino, antes de buscar más personas interesadas.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `DEEPENING_ONLY`. Si se elimina se pierde una comprobación adaptativa solo cuando el planner detecta necesidad material.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `ADAPTIVE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `DEFER_TO_ADAPTIVE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + MAJOR_REWRITE + CHANGE_CONSTRUCT + DEFER_TO_ADAPTIVE + REFINE_ROUTING + REFINE_SIGNAL`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: sustituye tasa final de cierre por capacidad de avanzar desde intención real y queda como fallback adaptativo.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE MAYOR Y CAMBIO DE CONSTRUCTO`

Decisión final:
`KEEP + MAJOR_REWRITE + CHANGE_CONSTRUCT + DEFER_TO_ADAPTIVE + REFINE_ROUTING + REFINE_SIGNAL`

Pregunta final:
`Cuando una persona interesada quiere avanzar contigo, ¿qué suele pasar con el siguiente paso?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `smooth` | Normalmente puede avanzar sin quedarse trabada en el proceso |
| `some_friction` | Generalmente avanza, aunque a veces hacen falta aclaraciones o varios intentos |
| `frequent_friction` | Con frecuencia el proceso se complica o la persona no logra completar el siguiente paso |
| `unknown` | No lo sé o no lo he observado |

Pista:
`Piensa en personas que realmente quieren avanzar, no en todas las que preguntan por curiosidad. El siguiente paso puede ser comprar, solicitar, reservar, enviar información o iniciar el proceso, según tu actividad.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE FALLBACK — CONVERSION & ACCESS`.
- Aplicabilidad: actividad confirmada + necesidad material de Conversion & Access + no existe evidencia específica suficiente.
- Evidencia: DIRECT → Conversion & Access.
- Scoring: smooth → strong; some_friction → partial; frequent_friction → weak; unknown → sin inferencia.
- Señal: `frequent_friction → interest_to_action_friction`; no inferir causa concreta.
- Baja tasa de cierre no prueba fricción; no contar curiosos como intención real. Preferir q31/q34/q41 cuando sean suficientes y no preguntar q81 por rutina.

## 82 — `q2_operations_information_base`

### 1. Pregunta actual

¿Dónde se guarda hoy la información con la que trabajas a diario (contactos, pedidos o pendientes)?

- Copy canónico ejecutable: versión semántica `1`, módulo `operations`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `shared_system` | `shared_system` | En un sistema o herramienta digital que se usa de forma consistente | valor operativo; no declara kind especial ni señal adicional |
| `scattered_digital` | `scattered_digital` | En archivos digitales (hojas de cálculo, notas, chats), pero dispersos | valor operativo; no declara kind especial ni señal adicional |
| `paper_or_memory` | `paper_or_memory` | En papel, en mensajes sueltos o en la memoria de alguien | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(eqV2(`q2_has_customers`, `yes`), contextIn(`primaryFriction`, [`operations`, `scale`])). Regla material: eqV2(`q2_has_customers`, `yes`).

Aparece cuando `q2_has_customers` respondió exactamente `yes` y el contexto resolvió `primaryFriction` como uno de: `operations`, `scale`. No aparece cuando falla la condición ejecutable nativa y tampoco se activa la condición material. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `operations` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Readiness. Puede seleccionarse en profundización/evidencia material.

### 6. Qué intenta determinar

Si existe una base digital sobre la que organizar el trabajo y crecer.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `shared_system` → strong; `scattered_digital` → partial; `paper_or_memory` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_operations_automation_adoption`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_bottleneck`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_dependency`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_handoffs`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_manual_impact`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Dónde vive la información de tus clientes» (jerga, excluía organizaciones).

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si existe una base digital sobre la que organizar el trabajo y crecer.; distinction=Lo que importa es dónde se consulta la información en el día a día, no si existe alguna copia digital.; why=Ordenar o automatizar algo exige primero que la información esté en un solo lugar.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **MEDIA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `DEEPENING_ONLY`. Si se elimina se pierde una comprobación adaptativa solo cuando el planner detecta necesidad material.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `ADAPTIVE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `DEFER_TO_ADAPTIVE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + MAJOR_REWRITE + CHANGE_CONSTRUCT + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN + REMOVE_TOOL_BIAS`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia herramienta/lugar de almacenamiento por recuperación y confiabilidad de información.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE MAYOR Y CAMBIO DE CONSTRUCTO`

Decisión final:
`KEEP + MAJOR_REWRITE + CHANGE_CONSTRUCT + DEFER_TO_ADAPTIVE + ROUTING_REDESIGN + REMOVE_TOOL_BIAS`

Pregunta final:
`Cuando necesitas continuar un trabajo, atender a alguien o revisar un pendiente, ¿qué tan fácil es encontrar la información correcta y actualizada?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `easy_reliable` | Normalmente está clara, actualizada y puedo encontrarla fácilmente |
| `somewhat_scattered` | Puedo encontrarla, pero a veces está repartida entre varios lugares |
| `difficult_unreliable` | Con frecuencia cuesta encontrarla o no estoy seguro de cuál información está actualizada |
| `unknown` | No estoy seguro de cómo se organiza normalmente |

Pista:
`No importa si usas una hoja, notas, una agenda, un CRM u otra herramienta. Piensa en si puedes recuperar la información correcta cuando la necesitas.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — OPERATIONS / INFORMATION BASE`.
- Aplicabilidad: actividad confirmada + necesidad material de organización/recuperación.
- Evidencia: DIRECT → Digital Readiness.
- Scoring: easy_reliable → strong; somewhat_scattered → partial; difficult_unreliable → weak; unknown → sin inferencia.
- CRM no es automáticamente fuerte; hoja de cálculo no es automáticamente débil. Medir recuperación/confiabilidad, no sofisticación.
- Relación: q71 identifica pendientes; q65 traspaso entre personas; q82 recuperación general. No preguntar las tres por defecto.
- q66=scattered_info puede elevar prioridad.

## 83 — `q2_operations_automation_adoption`

### 1. Pregunta actual

De las tareas que se repiten (confirmaciones, recordatorios, respuestas frecuentes, registro de pedidos), ¿cuántas ya se hacen solas con alguna herramienta?

- Copy canónico ejecutable: versión semántica `1`, módulo `operations`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `most_automated` | `most_automated` | La mayoría ya se hace sola | valor operativo; no declara kind especial ni señal adicional |
| `some_automated` | `some_automated` | Algunas | valor operativo; no declara kind especial ni señal adicional |
| `none_automated` | `none_automated` | Ninguna, todo se hace a mano | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo había pensado así | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

Regla nativa: andV2(eqV2(`q2_has_customers`, `yes`), contextIn(`primaryFriction`, [`operations`, `scale`])). Regla material: eqV2(`q2_has_customers`, `yes`).

Aparece cuando `q2_has_customers` respondió exactamente `yes` y el contexto resolvió `primaryFriction` como uno de: `operations`, `scale`. No aparece cuando falla la condición ejecutable nativa y tampoco se activa la condición material. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `operations` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Readiness. Puede seleccionarse en profundización/evidencia material.

### 6. Qué intenta determinar

Qué parte del trabajo repetitivo ya se sostiene sin intervención manual.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Digital Readiness (`digital_readiness`). Evalúa: Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [seguimiento], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_readiness`: `most_automated` → strong; `some_automated` → partial; `none_automated` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_operations_bottleneck`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_dependency`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_handoffs`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_information_base`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.
- `q2_operations_manual_impact`: comparte dimensión Digital Readiness; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`, `MISSING_NOT_APPLICABLE`

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = MAYBE** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Qué parte del trabajo repetitivo ya se sostiene sin intervención manual.; distinction=Cuenta solo lo que ocurre sin que alguien lo dispare a mano cada vez.; why=Muestra cuánto del trabajo repetitivo todavía depende de tiempo manual.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `DEEPENING_ONLY`. Si se elimina se pierde una comprobación adaptativa solo cuando el planner detecta necesidad material.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `ADAPTIVE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `DEFER_TO_ADAPTIVE`
- `ADD_NOT_APPLICABLE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `REMOVE`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: elimina una táctica/solución específica que se puntuaba como madurez universal y queda para implementación posterior.

### 15. Decisión humana

Estado:
`APROBADA PARA ELIMINACIÓN DEL DIAGNÓSTICO PRINCIPAL`

Decisión final:
`REMOVE`

Pregunta eliminada:
`De las tareas que se repiten, ¿cuántas ya se hacen solas con alguna herramienta?`

Notas Yoan/ChatGPT:

- Eliminar DIRECT → Digital Readiness y scoring `most_automated → strong`, `some_automated → partial`, `none_automated → missing`.
- Automatización es solución/táctica, no medida universal de salud; trabajo manual no significa debilidad y más automatización no significa mejor operación.
- q67 ya mide impacto real del trabajo manual; solo después, con manual_work_impact=moderate/high, investigar tareas, simplificación, delegación u automatización.
- No usar cantidad de automatizaciones para seleccionar licencia.
- Posible uso futuro: aclaración comercial/implementación.
- Antes de eliminar, buscar referencias a `q2_operations_automation_adoption`, `most_automated`, `some_automated`, `none_automated` y `unknown`.

## 84 — `q2_presence_offer_clarity`

### 1. Pregunta actual

Cuando alguien que no te conoce ve tu página, perfil o publicación por primera vez, ¿entiende rápido qué ofreces, para quién es y por qué elegirte?

- Copy canónico ejecutable: versión semántica `1`, módulo `presence`.
- Variantes visibles ejecutables:
- Variante 1 (`businessModel=nonprofit`):
  - Pregunta visible: Cuando alguien que no conoce tu organización ve tu página, perfil o publicación por primera vez, ¿entiende rápido qué hacen, a quién ayudan y por qué apoyarlos?

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `all_clear` | `all_clear` | Sí, se entienden las tres cosas | valor operativo; no declara kind especial ni señal adicional |
| `offer_only` | `offer_only` | Se entiende qué es, pero no tanto para quién ni por qué | valor operativo; no declara kind especial ni señal adicional |
| `not_clear` | `not_clear` | No, suelen tener que preguntar para entenderlo | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he comprobado con alguien de fuera | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

No tiene elegibilidad nativa; por diseño solo puede entrar por evidencia material. Regla material: eqV2(`q2_has_customers`, `yes`).

No aparece en la ruta base; solo se considera para una necesidad material del planner. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `presence` y declara los propósitos `diagnostic`; aporta evidencia direct para Clarity & Positioning. Puede seleccionarse en profundización/evidencia material.

### 6. Qué intenta determinar

Si alguien de fuera entiende la oferta sin explicación adicional.
**MULTIPLE_CONSTRUCTS:** Sí. Pregunta simultáneamente por comprensión de la oferta, público y motivo para elegir; las respuestas agregan esos tres juicios en una sola escala.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Clarity & Positioning (`clarity_positioning`). Evalúa: Comprensibilidad de la oferta y del siguiente paso..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [claridad], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `clarity_positioning`: `all_clear` → strong; `offer_only` → partial; `not_clear` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_b2b_qualification`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.
- `q2_ecommerce_product_discovery`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.
- `q2_nonprofit_donation_clarity`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.
- `q2_professional_intake_flow`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.
- `q2_retail_product_visibility`: comparte dimensión Clarity & Positioning; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** UNCLEAR. El prompt contiene tres aspectos; una persona puede percibirlos de forma distinta. Primero debe decidirse si se divide en preguntas separadas.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `AMBIGUOUS`, `MULTIPLE_CONSTRUCTS`, `RESPONSE_OPTIONS_INCOMPLETE`, `RESPONSE_OPTIONS_OVERLAP`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Las opciones («qué ofrezco… elegirme») contradecían la variante para organizaciones.

**ANSWER_AXIS = MIXED**
Pregunta simultáneamente por comprensión de la oferta, público y motivo para elegir; las respuestas agregan esos tres juicios en una sola escala.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si alguien de fuera entiende la oferta sin explicación adicional.; distinction=Piensa en lo que entiende una persona nueva al verlo, no en lo que tú explicas cuando te preguntan.; why=Si no se entiende a la primera, quien te descubre suele seguir de largo.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **BAJA**
- Coherencia pregunta-respuestas: **MEDIA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **POR_CONFIRMAR**
- Riesgo de respuesta falsa o forzada: **MEDIO**

**QUESTION NECESSITY TEST:** `DEEPENING_ONLY`. Si se elimina se pierde una comprobación adaptativa solo cuando el planner detecta necesidad material.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `ADAPTIVE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `REWRITE`
- `SPLIT`
- `NEEDS_DOMAIN_REVIEW`
- `DEFER_TO_ADAPTIVE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + MAJOR_REWRITE + REMOVE_MULTIPLE_CONSTRUCTS + DEFER_TO_ADAPTIVE + ROUTING_REFINEMENT`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: reduce tres constructos a claridad de oferta y evita duplicar autoridad, reputación o diferenciación.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE MAYOR Y EJE ÚNICO`

Decisión final:
`KEEP + MAJOR_REWRITE + REMOVE_MULTIPLE_CONSTRUCTS + DEFER_TO_ADAPTIVE + ROUTING_REFINEMENT`

Pregunta final:
`Cuando alguien que no te conoce ve tu presencia en internet por primera vez, ¿puede entender fácilmente qué ofreces?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `clear` | Sí, normalmente se entiende sin tener que preguntar |
| `partial` | Se entiende en general, pero algunas cosas pueden quedar poco claras |
| `unclear` | Cuesta entender qué ofrezco sin pedir más explicación |
| `unknown` | No lo sé o no lo he revisado desde el punto de vista de alguien nuevo |

Pista:
`Piensa en lo que una persona entiende viendo tu web, perfil, ficha o contenido principal, antes de hablar contigo.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE — PRESENCE / OFFER CLARITY`.
- Aplicabilidad: presencia digital observable + falta de evidencia material de Clarity & Positioning.
- Evidencia: DIRECT → Clarity & Positioning.
- Scoring: clear → strong; partial → partial; unclear → weak; unknown → sin inferencia.
- Eliminar del constructo «para quién es» como requisito universal y «por qué elegirte»; no mezclar reputación/autoridad.
- Routing: si 85 indica que no existe presencia fiable, normalmente no preguntar 84.

## 85 — `q2_presence_digital_base`

### 1. Pregunta actual

Si alguien te busca en internet, ¿encuentra un lugar propio y actualizado (página web, ficha en buscadores o mapas, o similar) donde ver lo que haces y cómo contactarte?

- Copy canónico ejecutable: versión semántica `1`, módulo `presence`.
- Variantes visibles ejecutables:
No hay variantes de copy declaradas.

### 2. Respuestas actuales

| Option ID | Valor ejecutable | Texto visible exacto | Significado técnico |
| --- | --- | --- | --- |
| `own_updated` | `own_updated` | Sí, un lugar propio y actualizado | valor operativo; no declara kind especial ni señal adicional |
| `outdated` | `outdated` | Existe, pero está incompleto o desactualizado | valor operativo; no declara kind especial ni señal adicional |
| `third_party_only` | `third_party_only` | Solo perfiles en redes o plataformas que no controlo | valor operativo; no declara kind especial ni señal adicional |
| `nothing` | `nothing` | No, todavía no hay un lugar donde encontrarme | valor operativo; no declara kind especial ni señal adicional |
| `unknown` | `unknown` | No lo he revisado | kind=unknown |

> Las variantes pueden cambiar etiquetas visibles, pero el contrato mantiene los mismos valores, orden y `kind`; ver el bloque de variantes de la sección 1.

### 3. Tipo de respuesta actual

`SINGLE_SELECT`

### 4. Cuándo aparece

No tiene elegibilidad nativa; por diseño solo puede entrar por evidencia material. Regla material: answered(`q2_has_customers`).

No aparece en la ruta base; solo se considera para una necesidad material del planner. No aparece cuando falla la condición ejecutable. Referencias de respuesta/contexto: `q2_has_customers`.

**ROUTING_DEFECT_CANDIDATE:** No se detecta `notEqV2()` en esta cadena.

### 5. Función dentro del diagnóstico

Pertenece al módulo `presence` y declara los propósitos `diagnostic`; aporta evidencia direct para Digital Foundation. Puede seleccionarse en profundización/evidencia material.

### 6. Qué intenta determinar

Si existe una base digital propia que controlas y mantienes al día.

### 7. Dimensión o dimensiones afectadas

- **DIRECT:** Digital Foundation (`digital_foundation`). Evalúa: Presencia, información esencial, acceso y continuidad de los activos digitales..

### 8. Cómo afecta actualmente el resultado

La evidencia por dimensión se procesa con peso directo según la agregación declarada. Metadata de preparación: dimensiones candidatas [presencia], dirección negative, unknown=true, N/A=false. Su aplicabilidad modifica qué preguntas y evidencia puede recorrer el planner.

**Semántica ejecutable por opción/dimensión:**
- `digital_foundation`: `own_updated` → strong; `outdated` → partial; `third_party_only` → dependency; `nothing` → missing

**Señales producidas por opciones:**
— No produce señales de contexto/fricción adicionales desde opciones.

### 9. Relación con otras preguntas

- `q2_has_customers`: dependencia de routing explícita en la condición.
- `q2_ecommerce_product_discovery`: comparte dimensión Digital Foundation; es una pregunta vecina, no necesariamente redundante.
- `q2_local_presence_consistency`: comparte dimensión Digital Foundation; es una pregunta vecina, no necesariamente redundante.
- `q2_presence_offer_clarity`: comparte ; es una pregunta vecina, no necesariamente redundante.

**Análisis MULTI_SELECT para esta pregunta:**
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. Las opciones actuales describen estados mutuamente excluyentes dentro del eje declarado; no se observa una necesidad ejecutable de marcar dos a la vez.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `GOOD_AS_IS`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** «Perfil de negocio» excluía organizaciones.

No se fuerza un defecto; la metadata vigente lo clasifica como conservable, sujeto a revisión humana.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

**UNKNOWN_NEEDED = YES** — Existe una opción ejecutable de incertidumbre.

**NOT_APPLICABLE_NEEDED = NO** — No existe opción `kind: not_applicable`; revisar solo si el contexto admite una situación legítimamente fuera de alcance.

**OTHER_NEEDED = NO** — No existe una opción abierta explícita; el valor es una candidatura de revisión, no una adición.

**Revisión de routing:** ver sección 4. Si la cadena contiene `notEqV2()` sobre una respuesta previa, queda marcada como `ROUTING_DEFECT_CANDIDATE` sin modificar el ejecutable.

**Help / explicación UX ejecutable:**
- Pista: No hay hint declarado.
- Panel de ayuda: understand=Si existe una base digital propia que controlas y mantienes al día.; distinction=Un perfil en una plataforma ajena cuenta distinto que un lugar propio: piensa en cuál controlas tú.; why=Un lugar propio no depende de las reglas ni del alcance de otra plataforma.
- HELP = USEFUL según la metadata ejecutable de lenguaje (required). No expone fórmulas, puntaje ni respuesta correcta.

### 11. Evaluación preliminar del agente

- Claridad: **ALTA**
- Coherencia pregunta-respuestas: **ALTA**
- Necesidad diagnóstica: **POR_CONFIRMAR**
- Tipo de respuesta adecuado: **SÍ**
- Riesgo de respuesta falsa o forzada: **BAJO**

**QUESTION NECESSITY TEST:** `DEEPENING_ONLY`. Si se elimina se pierde una comprobación adaptativa solo cuando el planner detecta necesidad material.

**DERIVABLE_CANDIDATE:** NO. No se identifica una derivación confiable únicamente desde respuestas ya recogidas.

**CORE / ADAPTIVE CANDIDATE:** `ADAPTIVE_CANDIDATE`. Es una clasificación preliminar y no autoriza retirar ni mover la pregunta.

### 12. Opciones de revisión humana

- `KEEP`
- `DEFER_TO_ADAPTIVE`

### 13. Propuesta preliminar

La propuesta preliminar queda sustituida por la decisión humana aprobada en la sección 15: `KEEP + MAJOR_REWRITE + REMOVE_OWNERSHIP_BIAS + DEFER_TO_ADAPTIVE + USE_AS_DIGITAL_FOUNDATION_FALLBACK`.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: sustituye propiedad tecnológica por presencia mantenida y actualizada como fallback adaptativo de Digital Foundation.

### 15. Decisión humana

Estado:
`APROBADA CON REWRITE MAYOR Y ELIMINACIÓN DEL SESGO DE PROPIEDAD`

Decisión final:
`KEEP + MAJOR_REWRITE + REMOVE_OWNERSHIP_BIAS + DEFER_TO_ADAPTIVE + USE_AS_DIGITAL_FOUNDATION_FALLBACK`

Pregunta final:
`Si alguien te busca en internet, ¿encuentra al menos un lugar que mantienes actualizado con información básica para conocerte y contactarte?`

Respuestas finales propuestas:

| Option ID conceptual | Texto final para el usuario |
| --- | --- |
| `reliable_presence` | Sí, tengo al menos un lugar actualizado que mantengo de forma habitual |
| `partial_presence` | Existe, pero parte de la información está incompleta o desactualizada |
| `no_reliable_presence` | No tengo todavía un lugar en internet que mantenga actualizado |
| `unknown` | No lo sé o no lo he revisado recientemente |

Pista:
`Puede ser una web, ficha en buscadores o mapas, perfil profesional u otro lugar relevante. No importa la plataforma; importa que la información sea correcta y puedas mantenerla.`

Notas Yoan/ChatGPT:

- Tipo: `SINGLE_SELECT`.
- CORE/ADAPTIVE: `ADAPTIVE PRIORITARIA / DIGITAL FOUNDATION FALLBACK`.
- Evidencia: DIRECT → Digital Foundation.
- Scoring: reliable_presence → strong; partial_presence → partial; no_reliable_presence → weak; unknown → sin inferencia.
- Eliminar `third_party_only → dependency` automático; web propia no es requisito y ficha externa no es automáticamente inferior.
- Medir presencia + actualización + mantenibilidad; dependencia de plataforma se analiza aparte solo si es material.
- Preferir evidencia específica de q20/q40 cuando sea suficiente; no preguntar q20 + q40 + q85 por rutina.

## Matrices resumen

### A. Questions by preliminary action — KEEP candidates

`q2_entity`, `q2_other_staff`, `q2_monetization`, `q2_has_customers`, `q2_b2b_pipeline`, `q2_sector`, `q2_customer_buyer`, `q2_capacity_signal`, `q2_local_discovery`, `q2_service_response_speed`, `q2_service_quote_practice`, `q2_service_quote_followup`, `q2_appointments_rebooking`, `q2_professional_referral_dependency`, `q2_professional_followup_after_consult`, `q2_retail_product_visibility`, `q2_retail_customer_capture`, `q2_ecommerce_checkout_friction`, `q2_ecommerce_cart_followup`, `q2_ecommerce_repeat_purchase`, `q2_hospitality_peak_capacity`, `q2_hospitality_delivery_takeaway`, `q2_b2b_sales_cycle`, `q2_b2b_decision_makers`, `q2_creator_channel_concentration`, `q2_creator_audience_ownership`, `q2_creator_content_consistency`, `q2_creator_monetization_model`, `q2_creator_conversion`, `q2_nonprofit_support_type`, `q2_nonprofit_donation_clarity`, `q2_nonprofit_membership_lifecycle`, `q2_nonprofit_participation`, `q2_operations_handoffs`, `q2_operations_dependency`, `q2_followup_general_process`, `q2_followup_ownership`, `q2_followup_status_visibility`, `q2_measurement_decision_review`, `q2_startup_problem_clarity`, `q2_startup_validation_evidence`, `q2_startup_offer_readiness`, `q2_startup_demand_signal`, `q2_operations_automation_adoption`, `q2_presence_digital_base`

### A. Questions by preliminary action — REWRITE candidates

`q2_delivery`, `q2_demand_trend`, `q2_goal`, `q2_friction`, `q2_appointments_noshow`, `q2_ecommerce_traffic_sources`, `q2_customer_reach`, `q2_local_presence_consistency`, `q2_local_repeat_customers`, `q2_reputation_flow`, `q2_service_area_clarity`, `q2_service_repeat_referral`, `q2_appointments_booking_friction`, `q2_appointments_confirmation_reminders`, `q2_professional_authority_signals`, `q2_professional_intake_flow`, `q2_retail_promotions`, `q2_ecommerce_product_discovery`, `q2_ecommerce_cart_visibility`, `q2_ecommerce_acquisition_dependency`, `q2_b2b_lead_source`, `q2_b2b_qualification`, `q2_b2b_status_visibility`, `q2_operations_bottleneck`, `q2_measurement_source_confidence`, `q2_startup_first_channel`, `q2_startup_next_milestone`, `q2_conversion_interest_to_action`, `q2_operations_information_base`, `q2_presence_offer_clarity`

### A. Questions by preliminary action — SPLIT candidates

`q2_service_repeat_referral`, `q2_presence_offer_clarity`

### A. Questions by preliminary action — MERGE candidates

— Ninguna candidatura detectada.

### A. Questions by preliminary action — MULTI_SELECT candidates

`q2_ecommerce_traffic_sources`, `q2_capacity_signal`, `q2_service_repeat_referral`, `q2_presence_offer_clarity`

### A. Questions by preliminary action — REMOVE candidates

— Ninguna candidatura detectada.

### A. Questions by preliminary action — DEFER candidates

`q2_local_discovery`, `q2_reputation_flow`, `q2_professional_authority_signals`, `q2_ecommerce_acquisition_dependency`, `q2_followup_general_process`, `q2_followup_status_visibility`, `q2_conversion_interest_to_action`, `q2_operations_information_base`, `q2_operations_automation_adoption`, `q2_presence_offer_clarity`, `q2_presence_digital_base`

### A. Questions by preliminary action — ROUTING review candidates

`q2_appointments_noshow`, `q2_b2b_pipeline`, `q2_local_foot_traffic`, `q2_local_discovery`, `q2_reputation_flow`, `q2_service_response_speed`, `q2_service_quote_practice`, `q2_appointments_booking_method`, `q2_appointments_booking_friction`, `q2_appointments_confirmation_reminders`, `q2_appointments_lead_to_booking`, `q2_appointments_rebooking`, `q2_professional_authority_signals`, `q2_professional_intake_flow`, `q2_professional_referral_dependency`, `q2_professional_followup_after_consult`, `q2_retail_product_visibility`, `q2_retail_customer_capture`, `q2_retail_promotions`, `q2_ecommerce_cart_visibility`, `q2_hospitality_flow_type`, `q2_hospitality_peak_capacity`, `q2_hospitality_delivery_takeaway`, `q2_b2b_lead_source`, `q2_b2b_qualification`, `q2_b2b_status_visibility`, `q2_b2b_sales_cycle`, `q2_b2b_decision_makers`, `q2_creator_audience_ownership`, `q2_creator_monetization_model`, `q2_creator_conversion`, `q2_nonprofit_support_type`, `q2_nonprofit_participation`, `q2_operations_process_ownership`, `q2_operations_handoffs`, `q2_operations_bottleneck`, `q2_operations_manual_impact`, `q2_operations_dependency`, `q2_followup_general_process`, `q2_followup_ownership`, `q2_followup_status_visibility`

### B. Questions by response type

- SINGLE_SELECT (83): `q2_entity`, `q2_other_staff`, `q2_monetization`, `q2_delivery`, `q2_has_customers`, `q2_regularity`, `q2_demand_trend`, `q2_goal`, `q2_friction`, `q2_appointments_noshow`, `q2_b2b_pipeline`, `q2_local_foot_traffic`, `q2_sector`, `q2_customer_reach`, `q2_customer_buyer`, `q2_process_systemization`, `q2_local_discovery`, `q2_local_presence_consistency`, `q2_local_repeat_customers`, `q2_reputation_flow`, `q2_service_area_clarity`, `q2_service_response_speed`, `q2_service_quote_practice`, `q2_service_quote_followup`, `q2_service_repeat_referral`, `q2_appointments_booking_method`, `q2_appointments_booking_friction`, `q2_appointments_confirmation_reminders`, `q2_appointments_lead_to_booking`, `q2_appointments_rebooking`, `q2_professional_authority_signals`, `q2_professional_intake_flow`, `q2_professional_referral_dependency`, `q2_professional_followup_after_consult`, `q2_retail_product_visibility`, `q2_retail_customer_capture`, `q2_retail_promotions`, `q2_ecommerce_product_discovery`, `q2_ecommerce_checkout_friction`, `q2_ecommerce_cart_visibility`, `q2_ecommerce_cart_followup`, `q2_ecommerce_repeat_purchase`, `q2_ecommerce_acquisition_dependency`, `q2_hospitality_flow_type`, `q2_hospitality_reservation_noshow`, `q2_hospitality_peak_capacity`, `q2_hospitality_delivery_takeaway`, `q2_b2b_lead_source`, `q2_b2b_qualification`, `q2_b2b_status_visibility`, `q2_b2b_sales_cycle`, `q2_b2b_decision_makers`, `q2_creator_channel_concentration`, `q2_creator_audience_ownership`, `q2_creator_content_consistency`, `q2_creator_monetization_model`, `q2_creator_conversion`, `q2_nonprofit_support_type`, `q2_nonprofit_donation_clarity`, `q2_nonprofit_membership_lifecycle`, `q2_nonprofit_participation`, `q2_operations_process_ownership`, `q2_operations_handoffs`, `q2_operations_bottleneck`, `q2_operations_manual_impact`, `q2_operations_dependency`, `q2_followup_general_process`, `q2_followup_ownership`, `q2_followup_status_visibility`, `q2_measurement_source_confidence`, `q2_measurement_outcome_tracking`, `q2_measurement_decision_review`, `q2_startup_problem_clarity`, `q2_startup_validation_evidence`, `q2_startup_offer_readiness`, `q2_startup_demand_signal`, `q2_startup_first_channel`, `q2_startup_next_milestone`, `q2_conversion_interest_to_action`, `q2_operations_information_base`, `q2_operations_automation_adoption`, `q2_presence_offer_clarity`, `q2_presence_digital_base`
- MULTI_SELECT (2): `q2_ecommerce_traffic_sources`, `q2_capacity_signal`
- BOOLEAN / SCALE / OTHER: 0

### C. Questions missing uncertainty responses

`q2_regularity`, `q2_friction`, `q2_appointments_noshow`, `q2_local_foot_traffic`, `q2_appointments_booking_friction`, `q2_hospitality_flow_type`, `q2_hospitality_reservation_noshow`

### D. Questions missing N/A

`q2_process_systemization`, `q2_hospitality_reservation_noshow`, `q2_operations_process_ownership`, `q2_operations_automation_adoption`

### E. Questions with mixed/broken answer axis

`q2_service_repeat_referral`, `q2_presence_offer_clarity`

### F. Possible redundancies

`q2_ecommerce_acquisition_dependency`

### G. Possible derivable questions

`q2_ecommerce_acquisition_dependency`

### H. Questions by dimension

- Clarity & Positioning (`clarity_positioning`): `q2_professional_intake_flow`, `q2_retail_product_visibility`, `q2_ecommerce_product_discovery`, `q2_b2b_qualification`, `q2_nonprofit_donation_clarity`, `q2_startup_problem_clarity`, `q2_startup_validation_evidence`, `q2_startup_offer_readiness`, `q2_presence_offer_clarity`
- Digital Foundation (`digital_foundation`): `q2_local_presence_consistency`, `q2_ecommerce_product_discovery`, `q2_presence_digital_base`
- Discovery (`discovery`): `q2_ecommerce_traffic_sources`, `q2_local_foot_traffic`, `q2_local_discovery`, `q2_local_presence_consistency`, `q2_professional_referral_dependency`, `q2_retail_promotions`, `q2_ecommerce_acquisition_dependency`, `q2_b2b_lead_source`, `q2_creator_channel_concentration`, `q2_creator_content_consistency`, `q2_startup_first_channel`
- Trust & Reputation (`trust_reputation`): `q2_reputation_flow`, `q2_professional_authority_signals`
- Conversion & Access (`conversion_access`): `q2_service_response_speed`, `q2_service_quote_followup`, `q2_appointments_booking_method`, `q2_appointments_booking_friction`, `q2_appointments_lead_to_booking`, `q2_professional_intake_flow`, `q2_retail_product_visibility`, `q2_ecommerce_product_discovery`, `q2_ecommerce_checkout_friction`, `q2_hospitality_delivery_takeaway`, `q2_b2b_qualification`, `q2_b2b_decision_makers`, `q2_creator_conversion`, `q2_nonprofit_donation_clarity`, `q2_startup_problem_clarity`, `q2_startup_offer_readiness`, `q2_startup_demand_signal`, `q2_conversion_interest_to_action`
- Relationship & Recurrence (`relationship_recurrence`): `q2_local_repeat_customers`, `q2_service_repeat_referral`, `q2_appointments_confirmation_reminders`, `q2_appointments_rebooking`, `q2_professional_followup_after_consult`, `q2_retail_customer_capture`, `q2_ecommerce_cart_followup`, `q2_ecommerce_repeat_purchase`, `q2_b2b_sales_cycle`, `q2_creator_audience_ownership`, `q2_followup_general_process`, `q2_followup_ownership`, `q2_followup_status_visibility`
- Measurement & Optimization (`measurement_optimization`): `q2_ecommerce_traffic_sources`, `q2_local_discovery`, `q2_ecommerce_cart_visibility`, `q2_b2b_lead_source`, `q2_measurement_source_confidence`, `q2_measurement_outcome_tracking`, `q2_measurement_decision_review`
- Digital Readiness (`digital_readiness`): `q2_b2b_pipeline`, `q2_hospitality_peak_capacity`, `q2_b2b_status_visibility`, `q2_creator_monetization_model`, `q2_nonprofit_membership_lifecycle`, `q2_operations_process_ownership`, `q2_operations_handoffs`, `q2_operations_bottleneck`, `q2_operations_manual_impact`, `q2_operations_dependency`, `q2_followup_general_process`, `q2_followup_ownership`, `q2_followup_status_visibility`, `q2_operations_information_base`, `q2_operations_automation_adoption`

### I. Questions by function

- context: `q2_entity`, `q2_other_staff`, `q2_monetization`, `q2_delivery`, `q2_has_customers`, `q2_regularity`, `q2_demand_trend`, `q2_goal`, `q2_friction`, `q2_appointments_noshow`, `q2_sector`, `q2_customer_reach`, `q2_customer_buyer`, `q2_process_systemization`, `q2_capacity_signal`, `q2_service_area_clarity`, `q2_service_quote_practice`, `q2_hospitality_flow_type`, `q2_hospitality_reservation_noshow`, `q2_nonprofit_support_type`, `q2_nonprofit_participation`, `q2_startup_next_milestone`
- direct evidence: `q2_b2b_pipeline`, `q2_local_foot_traffic`, `q2_local_discovery`, `q2_local_presence_consistency`, `q2_local_repeat_customers`, `q2_reputation_flow`, `q2_service_response_speed`, `q2_service_quote_followup`, `q2_service_repeat_referral`, `q2_appointments_booking_method`, `q2_appointments_booking_friction`, `q2_appointments_confirmation_reminders`, `q2_appointments_lead_to_booking`, `q2_appointments_rebooking`, `q2_professional_authority_signals`, `q2_professional_intake_flow`, `q2_professional_referral_dependency`, `q2_professional_followup_after_consult`, `q2_retail_product_visibility`, `q2_retail_customer_capture`, `q2_retail_promotions`, `q2_ecommerce_product_discovery`, `q2_ecommerce_checkout_friction`, `q2_ecommerce_cart_visibility`, `q2_ecommerce_cart_followup`, `q2_ecommerce_repeat_purchase`, `q2_ecommerce_acquisition_dependency`, `q2_hospitality_peak_capacity`, `q2_hospitality_delivery_takeaway`, `q2_b2b_lead_source`, `q2_b2b_qualification`, `q2_b2b_status_visibility`, `q2_b2b_sales_cycle`, `q2_creator_channel_concentration`, `q2_creator_audience_ownership`, `q2_creator_monetization_model`, `q2_creator_conversion`, `q2_nonprofit_donation_clarity`, `q2_nonprofit_membership_lifecycle`, `q2_followup_general_process`, `q2_followup_ownership`, `q2_followup_status_visibility`, `q2_measurement_source_confidence`, `q2_measurement_outcome_tracking`, `q2_measurement_decision_review`, `q2_startup_problem_clarity`, `q2_startup_offer_readiness`, `q2_conversion_interest_to_action`, `q2_operations_information_base`, `q2_operations_automation_adoption`, `q2_presence_offer_clarity`, `q2_presence_digital_base`
- supporting: `q2_ecommerce_traffic_sources`, `q2_local_discovery`, `q2_local_presence_consistency`, `q2_professional_intake_flow`, `q2_retail_product_visibility`, `q2_ecommerce_product_discovery`, `q2_b2b_lead_source`, `q2_b2b_qualification`, `q2_b2b_decision_makers`, `q2_creator_content_consistency`, `q2_nonprofit_donation_clarity`, `q2_operations_process_ownership`, `q2_operations_handoffs`, `q2_operations_bottleneck`, `q2_operations_manual_impact`, `q2_operations_dependency`, `q2_followup_general_process`, `q2_followup_ownership`, `q2_followup_status_visibility`, `q2_startup_problem_clarity`, `q2_startup_validation_evidence`, `q2_startup_offer_readiness`, `q2_startup_demand_signal`, `q2_startup_first_channel`
- routing: `q2_other_staff`, `q2_regularity`, `q2_demand_trend`, `q2_appointments_noshow`, `q2_ecommerce_traffic_sources`, `q2_b2b_pipeline`, `q2_local_foot_traffic`, `q2_process_systemization`, `q2_capacity_signal`, `q2_local_discovery`, `q2_local_presence_consistency`, `q2_local_repeat_customers`, `q2_reputation_flow`, `q2_service_area_clarity`, `q2_service_response_speed`, `q2_service_quote_practice`, `q2_service_quote_followup`, `q2_service_repeat_referral`, `q2_appointments_booking_method`, `q2_appointments_booking_friction`, `q2_appointments_confirmation_reminders`, `q2_appointments_lead_to_booking`, `q2_appointments_rebooking`, `q2_professional_authority_signals`, `q2_professional_intake_flow`, `q2_professional_referral_dependency`, `q2_professional_followup_after_consult`, `q2_retail_product_visibility`, `q2_retail_customer_capture`, `q2_retail_promotions`, `q2_ecommerce_product_discovery`, `q2_ecommerce_checkout_friction`, `q2_ecommerce_cart_visibility`, `q2_ecommerce_cart_followup`, `q2_ecommerce_repeat_purchase`, `q2_ecommerce_acquisition_dependency`, `q2_hospitality_flow_type`, `q2_hospitality_reservation_noshow`, `q2_hospitality_peak_capacity`, `q2_hospitality_delivery_takeaway`, `q2_b2b_lead_source`, `q2_b2b_qualification`, `q2_b2b_status_visibility`, `q2_b2b_sales_cycle`, `q2_b2b_decision_makers`, `q2_creator_channel_concentration`, `q2_creator_audience_ownership`, `q2_creator_content_consistency`, `q2_creator_monetization_model`, `q2_creator_conversion`, `q2_nonprofit_support_type`, `q2_nonprofit_donation_clarity`, `q2_nonprofit_membership_lifecycle`, `q2_nonprofit_participation`, `q2_operations_process_ownership`, `q2_operations_handoffs`, `q2_operations_bottleneck`, `q2_operations_manual_impact`, `q2_operations_dependency`, `q2_followup_general_process`, `q2_followup_ownership`, `q2_followup_status_visibility`, `q2_measurement_source_confidence`, `q2_measurement_outcome_tracking`, `q2_measurement_decision_review`, `q2_startup_problem_clarity`, `q2_startup_validation_evidence`, `q2_startup_offer_readiness`, `q2_startup_demand_signal`, `q2_startup_first_channel`, `q2_startup_next_milestone`, `q2_conversion_interest_to_action`, `q2_operations_information_base`, `q2_operations_automation_adoption`, `q2_presence_offer_clarity`, `q2_presence_digital_base`
- deepening: `q2_local_discovery`, `q2_reputation_flow`, `q2_professional_authority_signals`, `q2_followup_general_process`, `q2_followup_status_visibility`, `q2_conversion_interest_to_action`, `q2_operations_information_base`, `q2_operations_automation_adoption`, `q2_presence_offer_clarity`, `q2_presence_digital_base`
- commercial: `q2_other_staff`, `q2_monetization`, `q2_delivery`, `q2_customer_reach`, `q2_customer_buyer`, `q2_creator_channel_concentration`, `q2_creator_audience_ownership`, `q2_creator_content_consistency`, `q2_creator_monetization_model`, `q2_creator_conversion`, `q2_nonprofit_support_type`, `q2_nonprofit_donation_clarity`, `q2_nonprofit_membership_lifecycle`, `q2_nonprofit_participation`

### J. CORE / ADAPTIVE / COMMERCIAL clarification candidate split

- `CORE_CANDIDATE` (16): `q2_entity`, `q2_other_staff`, `q2_monetization`, `q2_delivery`, `q2_has_customers`, `q2_regularity`, `q2_demand_trend`, `q2_goal`, `q2_friction`, `q2_sector`, `q2_customer_reach`, `q2_customer_buyer`, `q2_process_systemization`, `q2_capacity_signal`, `q2_hospitality_delivery_takeaway`, `q2_creator_monetization_model`
- `ADAPTIVE_CANDIDATE` (10): `q2_local_discovery`, `q2_reputation_flow`, `q2_professional_authority_signals`, `q2_followup_general_process`, `q2_followup_status_visibility`, `q2_conversion_interest_to_action`, `q2_operations_information_base`, `q2_operations_automation_adoption`, `q2_presence_offer_clarity`, `q2_presence_digital_base`
- `COMMERCIAL_CLARIFICATION_CANDIDATE` (0): —
- `REMOVE_CANDIDATE` (0): —
- `UNDECIDED` (59): `q2_appointments_noshow`, `q2_ecommerce_traffic_sources`, `q2_b2b_pipeline`, `q2_local_foot_traffic`, `q2_local_presence_consistency`, `q2_local_repeat_customers`, `q2_service_area_clarity`, `q2_service_response_speed`, `q2_service_quote_practice`, `q2_service_quote_followup`, `q2_service_repeat_referral`, `q2_appointments_booking_method`, `q2_appointments_booking_friction`, `q2_appointments_confirmation_reminders`, `q2_appointments_lead_to_booking`, `q2_appointments_rebooking`, `q2_professional_intake_flow`, `q2_professional_referral_dependency`, `q2_professional_followup_after_consult`, `q2_retail_product_visibility`, `q2_retail_customer_capture`, `q2_retail_promotions`, `q2_ecommerce_product_discovery`, `q2_ecommerce_checkout_friction`, `q2_ecommerce_cart_visibility`, `q2_ecommerce_cart_followup`, `q2_ecommerce_repeat_purchase`, `q2_ecommerce_acquisition_dependency`, `q2_hospitality_flow_type`, `q2_hospitality_reservation_noshow`, `q2_hospitality_peak_capacity`, `q2_b2b_lead_source`, `q2_b2b_qualification`, `q2_b2b_status_visibility`, `q2_b2b_sales_cycle`, `q2_b2b_decision_makers`, `q2_creator_channel_concentration`, `q2_creator_audience_ownership`, `q2_creator_content_consistency`, `q2_creator_conversion`, `q2_nonprofit_support_type`, `q2_nonprofit_donation_clarity`, `q2_nonprofit_membership_lifecycle`, `q2_nonprofit_participation`, `q2_operations_process_ownership`, `q2_operations_handoffs`, `q2_operations_bottleneck`, `q2_operations_manual_impact`, `q2_operations_dependency`, `q2_followup_ownership`, `q2_measurement_source_confidence`, `q2_measurement_outcome_tracking`, `q2_measurement_decision_review`, `q2_startup_problem_clarity`, `q2_startup_validation_evidence`, `q2_startup_offer_readiness`, `q2_startup_demand_signal`, `q2_startup_first_channel`, `q2_startup_next_milestone`

### Routing defect candidates consolidated

41 preguntas contienen al menos un `notEqV2()` evaluable sobre ausencia de respuesta: `q2_appointments_noshow`, `q2_b2b_pipeline`, `q2_local_foot_traffic`, `q2_local_discovery`, `q2_reputation_flow`, `q2_service_response_speed`, `q2_service_quote_practice`, `q2_appointments_booking_method`, `q2_appointments_booking_friction`, `q2_appointments_confirmation_reminders`, `q2_appointments_lead_to_booking`, `q2_appointments_rebooking`, `q2_professional_authority_signals`, `q2_professional_intake_flow`, `q2_professional_referral_dependency`, `q2_professional_followup_after_consult`, `q2_retail_product_visibility`, `q2_retail_customer_capture`, `q2_retail_promotions`, `q2_ecommerce_cart_visibility`, `q2_hospitality_flow_type`, `q2_hospitality_peak_capacity`, `q2_hospitality_delivery_takeaway`, `q2_b2b_lead_source`, `q2_b2b_qualification`, `q2_b2b_status_visibility`, `q2_b2b_sales_cycle`, `q2_b2b_decision_makers`, `q2_creator_audience_ownership`, `q2_creator_monetization_model`, `q2_creator_conversion`, `q2_nonprofit_support_type`, `q2_nonprofit_participation`, `q2_operations_process_ownership`, `q2_operations_handoffs`, `q2_operations_bottleneck`, `q2_operations_manual_impact`, `q2_operations_dependency`, `q2_followup_general_process`, `q2_followup_ownership`, `q2_followup_status_visibility`.

### Completeness validation

| Check | Expected | Actual | Result |
| --- | ---: | ---: | --- |
| PRODUCTIVE_QUESTIONS | 85 | 85 | PASS |
| DOCUMENTED_QUESTIONS | 85 | 85 | PASS |
| MISSING | 0 | 0 | PASS |
| DUPLICATED | 0 | 0 | PASS |
| OPTION_SCHEMA_MISMATCH | 0 | 0 | PASS |
| FIXTURE_ONLY_INCLUDED | 0 | 0 | PASS |

### Triage counts for the final report

- Multi-select candidates (current multi OR single with YES/UNCLEAR coexistence): 4.
- Mixed/broken answer-axis: 2 (0 BROKEN).
- Missing uncertainty candidates (MAYBE/YES without an executable unknown option): 7.
- Missing N/A candidates (MAYBE/YES without an executable not_applicable option): 4.
- Possible redundant/derivable: 1.
- Routing defect candidates: 41.

## Highest preliminary concern — no human decision

- `q2_appointments_noshow` — AMBIGUOUS, MISSING_UNKNOWN
- `q2_b2b_pipeline` — GOOD_AS_IS
- `q2_local_foot_traffic` — MISSING_UNKNOWN
- `q2_local_discovery` — GOOD_AS_IS
- `q2_reputation_flow` — AMBIGUOUS
- `q2_service_response_speed` — GOOD_AS_IS
- `q2_service_quote_practice` — GOOD_AS_IS
- `q2_service_repeat_referral` — TECHNICAL_LANGUAGE, MULTIPLE_CONSTRUCTS, RESPONSE_OPTIONS_INCOMPLETE, RESPONSE_OPTIONS_OVERLAP
- `q2_appointments_booking_method` — RESPONSE_OPTIONS_OVERLAP
- `q2_appointments_booking_friction` — TECHNICAL_LANGUAGE, MISSING_UNKNOWN
- `q2_appointments_confirmation_reminders` — AMBIGUOUS
- `q2_appointments_lead_to_booking` — MISSING_UNKNOWN
- `q2_appointments_rebooking` — GOOD_AS_IS
- `q2_professional_authority_signals` — AMBIGUOUS
- `q2_professional_intake_flow` — AMBIGUOUS
- `q2_professional_referral_dependency` — GOOD_AS_IS
- `q2_professional_followup_after_consult` — GOOD_AS_IS
- `q2_retail_product_visibility` — GOOD_AS_IS
- `q2_retail_customer_capture` — GOOD_AS_IS
- `q2_retail_promotions` — TECHNICAL_LANGUAGE
- `q2_ecommerce_cart_visibility` — TECHNICAL_LANGUAGE
- `q2_hospitality_flow_type` — MISSING_UNKNOWN
- `q2_hospitality_peak_capacity` — GOOD_AS_IS
- `q2_hospitality_delivery_takeaway` — GOOD_AS_IS
- `q2_b2b_lead_source` — TECHNICAL_LANGUAGE
- `q2_b2b_qualification` — AMBIGUOUS
- `q2_b2b_status_visibility` — AMBIGUOUS
- `q2_b2b_sales_cycle` — GOOD_AS_IS
- `q2_b2b_decision_makers` — GOOD_AS_IS
- `q2_creator_audience_ownership` — GOOD_AS_IS
- `q2_creator_monetization_model` — GOOD_AS_IS
- `q2_creator_conversion` — GOOD_AS_IS
- `q2_nonprofit_support_type` — GOOD_AS_IS
- `q2_nonprofit_participation` — GOOD_AS_IS
- `q2_operations_process_ownership` — MISSING_NOT_APPLICABLE
- `q2_operations_handoffs` — GOOD_AS_IS
- `q2_operations_bottleneck` — TECHNICAL_LANGUAGE
- `q2_operations_manual_impact` — MISSING_UNKNOWN
- `q2_operations_dependency` — GOOD_AS_IS
- `q2_followup_general_process` — GOOD_AS_IS
- `q2_followup_ownership` — GOOD_AS_IS
- `q2_followup_status_visibility` — GOOD_AS_IS
- `q2_presence_offer_clarity` — AMBIGUOUS, MULTIPLE_CONSTRUCTS, RESPONSE_OPTIONS_INCOMPLETE, RESPONSE_OPTIONS_OVERLAP

## Completeness statement

El documento contiene exactamente un registro por pregunta productiva y excluye las dos preguntas `confirmation` fixture-only. Todas las decisiones humanas permanecen `PENDIENTE`.

