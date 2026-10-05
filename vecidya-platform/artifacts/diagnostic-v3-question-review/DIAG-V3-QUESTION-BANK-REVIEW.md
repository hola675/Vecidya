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
| 01 | [`q2_entity`](#01-q2_entity) | ¿Qué describe mejor lo que vas a diagnosticar? | SINGLE_SELECT | context | Contextual / routing | KEEP | PENDIENTE |
| 02 | [`q2_other_staff`](#02-q2_other_staff) | ¿Tienes a alguien más trabajando contigo de forma continua (emple… | SINGLE_SELECT | context, routing, commercial | Contextual / routing | KEEP | PENDIENTE |
| 03 | [`q2_monetization`](#03-q2_monetization) | ¿Cuál es (o será) tu principal fuente de ingresos? | SINGLE_SELECT | context, commercial | Contextual / routing | KEEP | PENDIENTE |
| 04 | [`q2_delivery`](#04-q2_delivery) | La forma principal en que lo que ofreces llega a quien lo recibe. | SINGLE_SELECT | context, commercial | Contextual / routing | REWRITE | PENDIENTE |
| 05 | [`q2_has_customers`](#05-q2_has_customers) | Si ya existe actividad real con las personas a las que se dirige … | SINGLE_SELECT | context | Contextual / routing | KEEP | PENDIENTE |
| 06 | [`q2_regularity`](#06-q2_regularity) | ¿Con qué regularidad tienes actividad con clientes (ventas, servi… | SINGLE_SELECT | context, routing | Contextual / routing | ADD_UNKNOWN | PENDIENTE |
| 07 | [`q2_demand_trend`](#07-q2_demand_trend) | En los últimos meses, ¿cómo ha cambiado la cantidad de clientes o… | SINGLE_SELECT | context, routing | Contextual / routing | REWRITE | PENDIENTE |
| 08 | [`q2_goal`](#08-q2_goal) | Lo principal que quieres mejorar ahora mismo. | SINGLE_SELECT | context | Contextual / routing | REWRITE | PENDIENTE |
| 09 | [`q2_friction`](#09-q2_friction) | El obstáculo que más pesa hoy, según tu experiencia. | SINGLE_SELECT | context | Contextual / routing | REWRITE, ADD_UNKNOWN | PENDIENTE |
| 10 | [`q2_appointments_noshow`](#10-q2_appointments_noshow) | ¿Qué tan seguido tus clientes faltan a su cita? | SINGLE_SELECT | context, routing | Contextual / routing | REWRITE, ADD_UNKNOWN, ROUTING_FIX | PENDIENTE |
| 11 | [`q2_ecommerce_traffic_sources`](#11-q2_ecommerce_traffic_sources) | Qué fuentes traen visitas o pedidos de forma habitual. | MULTI_SELECT | supporting, routing | Discovery | REWRITE | PENDIENTE |
| 12 | [`q2_b2b_pipeline`](#12-q2_b2b_pipeline) | Si existe un proceso definido para dar seguimiento a cada oportun… | SINGLE_SELECT | direct evidence, routing | Digital Readiness | KEEP, ROUTING_FIX | PENDIENTE |
| 13 | [`q2_local_foot_traffic`](#13-q2_local_foot_traffic) | Qué parte de quienes llegan al local lo hace por pasar cerca, sin… | SINGLE_SELECT | direct evidence, routing | Discovery | ADD_UNKNOWN, ROUTING_FIX | PENDIENTE |
| 14 | [`q2_sector`](#14-q2_sector) | ¿En qué sector o tipo de actividad encaja mejor lo que haces? | SINGLE_SELECT | context | Contextual / routing | KEEP | PENDIENTE |
| 15 | [`q2_customer_reach`](#15-q2_customer_reach) | ¿Hasta dónde llegan geográficamente tus clientes? | SINGLE_SELECT | context, commercial | Contextual / routing | REWRITE | PENDIENTE |
| 16 | [`q2_customer_buyer`](#16-q2_customer_buyer) | ¿A quién se dirige principalmente lo que ofreces? | SINGLE_SELECT | context, commercial | Contextual / routing | KEEP | PENDIENTE |
| 17 | [`q2_process_systemization`](#17-q2_process_systemization) | Si las tareas habituales se hacen siempre de la misma forma o dep… | SINGLE_SELECT | context, routing | Contextual / routing | ADD_NOT_APPLICABLE | PENDIENTE |
| 18 | [`q2_capacity_signal`](#18-q2_capacity_signal) | Si en los últimos meses te ha faltado capacidad o la has tenido q… | MULTI_SELECT | context, routing | Contextual / routing | KEEP | PENDIENTE |
| 19 | [`q2_local_discovery`](#19-q2_local_discovery) | Por qué vía te descubre por primera vez la gente nueva de tu zona. | SINGLE_SELECT | direct evidence, supporting, routing, deepening | Discovery | KEEP, DEFER_TO_ADAPTIVE, ROUTING_FIX | PENDIENTE |
| 20 | [`q2_local_presence_consistency`](#20-q2_local_presence_consistency) | Si los datos básicos para encontrarte y contactarte están correct… | SINGLE_SELECT | direct evidence, supporting, routing | Digital Foundation | REWRITE | PENDIENTE |
| 21 | [`q2_local_repeat_customers`](#21-q2_local_repeat_customers) | De las personas que ya te compraron o visitaron una vez, ¿regresa… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | REWRITE | PENDIENTE |
| 22 | [`q2_reputation_flow`](#22-q2_reputation_flow) | Si llegan opiniones nuevas de personas satisfechas que otros pued… | SINGLE_SELECT | direct evidence, routing, deepening | Trust & Reputation | REWRITE, DEFER_TO_ADAPTIVE, ROUTING_FIX | PENDIENTE |
| 23 | [`q2_service_area_clarity`](#23-q2_service_area_clarity) | ¿Tienes definida la zona hasta donde te conviene desplazarte para… | SINGLE_SELECT | context, routing | Contextual / routing | REWRITE | PENDIENTE |
| 24 | [`q2_service_response_speed`](#24-q2_service_response_speed) | Cuando alguien te contacta por primera vez pidiendo tu servicio, … | SINGLE_SELECT | direct evidence, routing | Conversion & Access | KEEP, ROUTING_FIX | PENDIENTE |
| 25 | [`q2_service_quote_practice`](#25-q2_service_quote_practice) | ¿Sueles dar una cotización o estimado antes de hacer el trabajo? | SINGLE_SELECT | context, routing | Contextual / routing | KEEP, ROUTING_FIX | PENDIENTE |
| 26 | [`q2_service_quote_followup`](#26-q2_service_quote_followup) | Después de dar una cotización, si la persona no responde enseguid… | SINGLE_SELECT | direct evidence, routing | Conversion & Access | KEEP | PENDIENTE |
| 27 | [`q2_service_repeat_referral`](#27-q2_service_repeat_referral) | Si los clientes atendidos vuelven a llamar o recomiendan el servi… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | REWRITE, SPLIT, NEEDS_DOMAIN_REVIEW | PENDIENTE |
| 28 | [`q2_appointments_booking_method`](#28-q2_appointments_booking_method) | Cómo se agenda hoy la mayoría de las citas. | SINGLE_SELECT | direct evidence, routing | Conversion & Access | NEEDS_DOMAIN_REVIEW, ROUTING_FIX | PENDIENTE |
| 29 | [`q2_appointments_booking_friction`](#29-q2_appointments_booking_friction) | ¿Qué tan seguido cuesta encontrar un horario que le sirva a la pe… | SINGLE_SELECT | direct evidence, routing | Conversion & Access | REWRITE, ADD_UNKNOWN, ROUTING_FIX | PENDIENTE |
| 30 | [`q2_appointments_confirmation_reminders`](#30-q2_appointments_confirmation_reminders) | ¿Envías confirmaciones o recordatorios antes de la cita? | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | REWRITE, ROUTING_FIX | PENDIENTE |
| 31 | [`q2_appointments_lead_to_booking`](#31-q2_appointments_lead_to_booking) | Qué parte de quienes preguntan por una cita termina agendándola. | SINGLE_SELECT | direct evidence, routing | Conversion & Access | ROUTING_FIX | PENDIENTE |
| 32 | [`q2_appointments_rebooking`](#32-q2_appointments_rebooking) | Cuando el servicio requiere que la persona vuelva (seguimiento, m… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP, ROUTING_FIX | PENDIENTE |
| 33 | [`q2_professional_authority_signals`](#33-q2_professional_authority_signals) | Si alguien que no te conoce encuentra pruebas para confiar antes … | SINGLE_SELECT | direct evidence, routing, deepening | Trust & Reputation | REWRITE, DEFER_TO_ADAPTIVE, ROUTING_FIX | PENDIENTE |
| 34 | [`q2_professional_intake_flow`](#34-q2_professional_intake_flow) | Qué pasa entre el primer interés y el inicio del trabajo. | SINGLE_SELECT | direct evidence, supporting, routing | Clarity & Positioning | REWRITE, ROUTING_FIX | PENDIENTE |
| 35 | [`q2_professional_referral_dependency`](#35-q2_professional_referral_dependency) | Qué tanto dependen los clientes nuevos de recomendaciones persona… | SINGLE_SELECT | direct evidence, routing | Discovery | KEEP, ROUTING_FIX | PENDIENTE |
| 36 | [`q2_professional_followup_after_consult`](#36-q2_professional_followup_after_consult) | Después de una consulta o primera llamada, si la persona no respo… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP, ROUTING_FIX | PENDIENTE |
| 37 | [`q2_retail_product_visibility`](#37-q2_retail_product_visibility) | ¿Alguien que quiera comprarte puede saber qué vendes y si está di… | SINGLE_SELECT | direct evidence, supporting, routing | Clarity & Positioning | KEEP, ROUTING_FIX | PENDIENTE |
| 38 | [`q2_retail_customer_capture`](#38-q2_retail_customer_capture) | Después de que alguien te compra, ¿te queda alguna forma de volve… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP, ROUTING_FIX | PENDIENTE |
| 39 | [`q2_retail_promotions`](#39-q2_retail_promotions) | Si las ofertas llegan a clientes que no están en la tienda en ese… | SINGLE_SELECT | direct evidence, routing | Discovery | REWRITE, ROUTING_FIX | PENDIENTE |
| 40 | [`q2_ecommerce_product_discovery`](#40-q2_ecommerce_product_discovery) | Si quien entra a la tienda en línea encuentra lo que busca sin ay… | SINGLE_SELECT | direct evidence, supporting, routing | Digital Foundation | REWRITE | PENDIENTE |
| 41 | [`q2_ecommerce_checkout_friction`](#41-q2_ecommerce_checkout_friction) | Si quien decide comprar logra terminar el pago. | SINGLE_SELECT | direct evidence, routing | Conversion & Access | KEEP | PENDIENTE |
| 42 | [`q2_ecommerce_cart_visibility`](#42-q2_ecommerce_cart_visibility) | ¿Tu tienda en línea te permite saber cuándo alguien deja producto… | SINGLE_SELECT | direct evidence, routing | Measurement & Optimization | REWRITE, ROUTING_FIX | PENDIENTE |
| 43 | [`q2_ecommerce_cart_followup`](#43-q2_ecommerce_cart_followup) | De esas personas que dejan productos sin comprar, ¿les das seguim… | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP | PENDIENTE |
| 44 | [`q2_ecommerce_repeat_purchase`](#44-q2_ecommerce_repeat_purchase) | Con qué frecuencia un mismo cliente vuelve a comprar. | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP | PENDIENTE |
| 45 | [`q2_ecommerce_acquisition_dependency`](#45-q2_ecommerce_acquisition_dependency) | Si los pedidos dependen de un único canal. | SINGLE_SELECT | direct evidence, routing | Discovery | REWRITE, DEFER_TO_ADAPTIVE | PENDIENTE |
| 46 | [`q2_hospitality_flow_type`](#46-q2_hospitality_flow_type) | ¿Cómo suele llegar la mayoría de tus clientes? | SINGLE_SELECT | context, routing | Contextual / routing | ADD_UNKNOWN, ROUTING_FIX | PENDIENTE |
| 47 | [`q2_hospitality_reservation_noshow`](#47-q2_hospitality_reservation_noshow) | ¿Qué tan seguido las personas no se presentan a una reserva? | SINGLE_SELECT | context, routing | Contextual / routing | ADD_UNKNOWN, ADD_NOT_APPLICABLE | PENDIENTE |
| 48 | [`q2_hospitality_peak_capacity`](#48-q2_hospitality_peak_capacity) | En tus horas o días de más demanda, ¿qué tan seguido tienes que r… | SINGLE_SELECT | direct evidence, routing | Digital Readiness | KEEP, ROUTING_FIX | PENDIENTE |
| 49 | [`q2_hospitality_delivery_takeaway`](#49-q2_hospitality_delivery_takeaway) | Qué formas de consumir fuera del local ofrece hoy el negocio. | SINGLE_SELECT | direct evidence, routing | Conversion & Access | KEEP, ROUTING_FIX | PENDIENTE |
| 50 | [`q2_b2b_lead_source`](#50-q2_b2b_lead_source) | Por qué vía llegan con más frecuencia las oportunidades de negocio. | SINGLE_SELECT | direct evidence, supporting, routing | Discovery | REWRITE, ROUTING_FIX | PENDIENTE |
| 51 | [`q2_b2b_qualification`](#51-q2_b2b_qualification) | Cuando una empresa muestra interés, ¿tienes una forma de distingu… | SINGLE_SELECT | direct evidence, supporting, routing | Clarity & Positioning | REWRITE, ROUTING_FIX | PENDIENTE |
| 52 | [`q2_b2b_status_visibility`](#52-q2_b2b_status_visibility) | De tus oportunidades activas ahora mismo, ¿sabes en qué estado es… | SINGLE_SELECT | direct evidence, routing | Digital Readiness | REWRITE, ROUTING_FIX | PENDIENTE |
| 53 | [`q2_b2b_sales_cycle`](#53-q2_b2b_sales_cycle) | Cuántos contactos suele requerir cerrar una venta. | SINGLE_SELECT | direct evidence, routing | Relationship & Recurrence | KEEP, ROUTING_FIX | PENDIENTE |
| 54 | [`q2_b2b_decision_makers`](#54-q2_b2b_decision_makers) | ¿Normalmente decide una sola persona, o participan varias persona… | SINGLE_SELECT | supporting, routing | Conversion & Access | KEEP, ROUTING_FIX | PENDIENTE |
| 55 | [`q2_creator_channel_concentration`](#55-q2_creator_channel_concentration) | Cuánto depende el alcance de la audiencia de un solo canal. | SINGLE_SELECT | direct evidence, routing, commercial | Discovery | KEEP | PENDIENTE |
| 56 | [`q2_creator_audience_ownership`](#56-q2_creator_audience_ownership) | Más allá de la plataforma donde te siguen, ¿tienes una forma prop… | SINGLE_SELECT | direct evidence, routing, commercial | Relationship & Recurrence | KEEP, ROUTING_FIX | PENDIENTE |
| 57 | [`q2_creator_content_consistency`](#57-q2_creator_content_consistency) | ¿Qué tan seguido publicas o produces contenido nuevo? | SINGLE_SELECT | supporting, routing, commercial | Discovery | KEEP | PENDIENTE |
| 58 | [`q2_creator_monetization_model`](#58-q2_creator_monetization_model) | ¿De qué forma principal monetizas tu audiencia? | SINGLE_SELECT | direct evidence, routing, commercial | Digital Readiness | KEEP, ROUTING_FIX | PENDIENTE |
| 59 | [`q2_creator_conversion`](#59-q2_creator_conversion) | De las personas que siguen tu contenido, ¿qué tan seguido das el … | SINGLE_SELECT | direct evidence, routing, commercial | Conversion & Access | KEEP, ROUTING_FIX | PENDIENTE |
| 60 | [`q2_nonprofit_support_type`](#60-q2_nonprofit_support_type) | ¿Cómo se sostiene principalmente tu organización? | SINGLE_SELECT | context, routing, commercial | Contextual / routing | KEEP, ROUTING_FIX | PENDIENTE |
| 61 | [`q2_nonprofit_donation_clarity`](#61-q2_nonprofit_donation_clarity) | Si apoyar económicamente es fácil para alguien que ya quiere hace… | SINGLE_SELECT | direct evidence, supporting, routing, commercial | Clarity & Positioning | KEEP | PENDIENTE |
| 62 | [`q2_nonprofit_membership_lifecycle`](#62-q2_nonprofit_membership_lifecycle) | Si unirse y renovar la membresía sigue un camino claro y repetible. | SINGLE_SELECT | direct evidence, routing, commercial | Digital Readiness | KEEP | PENDIENTE |
| 63 | [`q2_nonprofit_participation`](#63-q2_nonprofit_participation) | ¿Qué tan seguido las personas de tu comunidad participan activame… | SINGLE_SELECT | context, routing, commercial | Contextual / routing | KEEP, ROUTING_FIX | PENDIENTE |
| 64 | [`q2_operations_process_ownership`](#64-q2_operations_process_ownership) | Cuando hay que hacer una tarea importante que se repite, ¿está cl… | SINGLE_SELECT | supporting, routing | Digital Readiness | ADD_NOT_APPLICABLE, ROUTING_FIX | PENDIENTE |
| 65 | [`q2_operations_handoffs`](#65-q2_operations_handoffs) | Cuando un trabajo pasa por más de una persona (por ejemplo, de qu… | SINGLE_SELECT | supporting, routing | Digital Readiness | KEEP, ROUTING_FIX | PENDIENTE |
| 66 | [`q2_operations_bottleneck`](#66-q2_operations_bottleneck) | ¿Qué es lo que más limita tu capacidad para atender más trabajo a… | SINGLE_SELECT | supporting, routing | Digital Readiness | REWRITE, ROUTING_FIX | PENDIENTE |
| 67 | [`q2_operations_manual_impact`](#67-q2_operations_manual_impact) | Cuánto te cuesta hoy el trabajo manual y repetitivo, sumando tiem… | SINGLE_SELECT | supporting, routing | Digital Readiness | ROUTING_FIX | PENDIENTE |
| 68 | [`q2_operations_dependency`](#68-q2_operations_dependency) | Si tú (o la persona clave) no pudieras trabajar durante dos seman… | SINGLE_SELECT | supporting, routing | Digital Readiness | KEEP, ROUTING_FIX | PENDIENTE |
| 69 | [`q2_followup_general_process`](#69-q2_followup_general_process) | Cómo se retoma un pendiente o un siguiente paso para que no se pi… | SINGLE_SELECT | direct evidence, supporting, routing, deepening | Relationship & Recurrence | KEEP, DEFER_TO_ADAPTIVE, ROUTING_FIX | PENDIENTE |
| 70 | [`q2_followup_ownership`](#70-q2_followup_ownership) | Cuando hay más de una persona involucrada, ¿está claro quién debe… | SINGLE_SELECT | direct evidence, supporting, routing | Relationship & Recurrence | KEEP, ROUTING_FIX | PENDIENTE |
| 71 | [`q2_followup_status_visibility`](#71-q2_followup_status_visibility) | Si los pendientes se repasan de forma activa para que ninguno que… | SINGLE_SELECT | direct evidence, supporting, routing, deepening | Relationship & Recurrence | KEEP, DEFER_TO_ADAPTIVE, ROUTING_FIX | PENDIENTE |
| 72 | [`q2_measurement_source_confidence`](#72-q2_measurement_source_confidence) | Si sabes por qué vía llegó cada persona nueva que empezó a trabaj… | SINGLE_SELECT | direct evidence, routing | Measurement & Optimization | REWRITE | PENDIENTE |
| 73 | [`q2_measurement_outcome_tracking`](#73-q2_measurement_outcome_tracking) | Si podrías estimar qué parte de tus contactos termina en un resul… | SINGLE_SELECT | direct evidence, routing | Measurement & Optimization | NEEDS_DOMAIN_REVIEW | PENDIENTE |
| 74 | [`q2_measurement_decision_review`](#74-q2_measurement_decision_review) | Si los resultados se revisan contra un periodo anterior para deci… | SINGLE_SELECT | direct evidence, routing | Measurement & Optimization | KEEP | PENDIENTE |
| 75 | [`q2_startup_problem_clarity`](#75-q2_startup_problem_clarity) | Cuando explicas este proyecto, ¿puedes decir qué problema concret… | SINGLE_SELECT | direct evidence, supporting, routing | Clarity & Positioning | KEEP | PENDIENTE |
| 76 | [`q2_startup_validation_evidence`](#76-q2_startup_validation_evidence) | Qué has comprobado sobre el problema hablando o probando con pers… | SINGLE_SELECT | supporting, routing | Clarity & Positioning | KEEP | PENDIENTE |
| 77 | [`q2_startup_offer_readiness`](#77-q2_startup_offer_readiness) | Si ya existe algo concreto que una persona podría aceptar o recha… | SINGLE_SELECT | direct evidence, supporting, routing | Clarity & Positioning | KEEP | PENDIENTE |
| 78 | [`q2_startup_demand_signal`](#78-q2_startup_demand_signal) | Cuál es el paso más concreto que alguien ya dio hacia lo que ofre… | SINGLE_SELECT | supporting, routing | Conversion & Access | KEEP | PENDIENTE |
| 79 | [`q2_startup_first_channel`](#79-q2_startup_first_channel) | ¿Tienes claro por qué canal intentarías llegar primero a las pers… | SINGLE_SELECT | supporting, routing | Discovery | REWRITE | PENDIENTE |
| 80 | [`q2_startup_next_milestone`](#80-q2_startup_next_milestone) | ¿Cuál es el siguiente hito que demostraría que el proyecto avanzó… | SINGLE_SELECT | context, routing | Contextual / routing | REWRITE | PENDIENTE |
| 81 | [`q2_conversion_interest_to_action`](#81-q2_conversion_interest_to_action) | Si el interés que ya llega termina en un paso concreto: una compr… | SINGLE_SELECT | direct evidence, routing, deepening | Conversion & Access | REWRITE, DEFER_TO_ADAPTIVE | PENDIENTE |
| 82 | [`q2_operations_information_base`](#82-q2_operations_information_base) | Si existe una base digital sobre la que organizar el trabajo y cr… | SINGLE_SELECT | direct evidence, routing, deepening | Digital Readiness | REWRITE, DEFER_TO_ADAPTIVE | PENDIENTE |
| 83 | [`q2_operations_automation_adoption`](#83-q2_operations_automation_adoption) | Qué parte del trabajo repetitivo ya se sostiene sin intervención … | SINGLE_SELECT | direct evidence, routing, deepening | Digital Readiness | KEEP, DEFER_TO_ADAPTIVE, ADD_NOT_APPLICABLE | PENDIENTE |
| 84 | [`q2_presence_offer_clarity`](#84-q2_presence_offer_clarity) | Si alguien de fuera entiende la oferta sin explicación adicional. | SINGLE_SELECT | direct evidence, routing, deepening | Clarity & Positioning | REWRITE, SPLIT, NEEDS_DOMAIN_REVIEW, DEFER_TO_ADAPTIVE | PENDIENTE |
| 85 | [`q2_presence_digital_base`](#85-q2_presence_digital_base) | Si existe una base digital propia que controlas y mantienes al día. | SINGLE_SELECT | direct evidence, routing, deepening | Digital Foundation | KEEP, DEFER_TO_ADAPTIVE | PENDIENTE |

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo.

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
**¿Podrían ser verdaderas dos o más opciones a la vez?** NO. El copy y la pista piden la forma principal/más habitual; convertirla a multi-select cambiaría el contrato de routing.

### 10. Problemas detectados por auditoría

**Flags candidatos:** `TECHNICAL_LANGUAGE`

**Hallazgo de metadata de auditoría 08F (candidato, no decisión):** Jerga interna («inventario de reventa», «proveedores/recursos», «proceso de pago») en una pregunta que decide la ruta.

**ANSWER_AXIS = CONSISTENT**
Las opciones permanecen en el mismo eje semántico declarado por el prompt y/o por la tabla de semántica de respuestas ejecutable.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `SCORING_REVALIDATION`, `ROUTING_REVALIDATION`, `RECALIBRATION_REQUIRED`, `COMMERCIAL_REVALIDATION`
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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`, `COMMERCIAL_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

No se propone cambio todavía.

### 14. Impacto de cambiarla

- Clasificación: `ROUTING_REVALIDATION`
- Motivo: cambia contexto, applicability o selección del planner sin score dimensional directo. También exige revalidar rutas y prerrequisitos.

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

**Pregunta propuesta — BORRADOR, NO APROBADA**

Cuando alguien que no te conoce ve tu página, perfil o publicación por primera vez, ¿entiende con rapidez qué ofreces y para quién es?

**Respuestas propuestas — BORRADOR, NO APROBADAS**

No se proponen respuestas nuevas todavía; primero debe decidirse si «por qué elegirte» merece una segunda pregunta adaptativa.

La propuesta reduce el eje a comprensión de oferta y público; no se adopta automáticamente.

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

