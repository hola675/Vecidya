# Question trace — AxisPro

Certified route: `/diagnostico` through the real browser UI. Session key: `vecidya.diagnostic.v3.session.2`, schema 2.

| # | Question ID | Visible question | Selected answer | Phase | Target dimensions | Planner reason |
|---:|---|---|---|---|---|---|
| 1 | `q2_delivery` | ¿Cómo se entrega principalmente lo que ofreces? | Vendo a otras empresas, que deciden con su propio proceso (`b2b_pipeline`) | base | — | `required_context` |
| 2 | `q2_entity` | ¿Qué describe mejor lo que vas a diagnosticar? | Un negocio en funcionamiento (`business`) | base | — | `required_context` |
| 3 | `q2_friction` | ¿Qué es lo que más te está frenando ahora mismo? | Hay interés, pero pocas veces se concreta (`conversion`) | base | — | `required_context` |
| 4 | `q2_goal` | ¿Qué te gustaría lograr primero? | Medir y entender qué funciona (`measure`) | base | — | `required_context` |
| 5 | `q2_has_customers` | ¿Ya tienes clientes reales, o personas que compran, usan o apoyan lo que ofreces? | Sí, ya hay actividad real (`yes`) | base | — | `required_context` |
| 6 | `q2_monetization` | ¿Cuál es (o será) tu principal fuente de ingresos? | Cobro por tiempo o por proyecto (`time_or_project`) | base | — | `required_context` |
| 7 | `q2_customer_buyer` | ¿A quién se dirige principalmente lo que ofreces? | Otras empresas u organizaciones (`b2b`) | base | — | `required_context` |
| 8 | `q2_customer_reach` | ¿Hasta dónde llegan geográficamente tus clientes? | Varias ciudades o mi región, sin llegar a todo el país (`regional`) | base | — | `required_context` |
| 9 | `q2_sector` | ¿En qué sector o tipo de actividad encaja mejor lo que haces? | Servicios profesionales (`professional_services`) | base | — | `unlock_routing` |
| 10 | `q2_b2b_qualification` | Cuando una empresa muestra interés, ¿tienes una forma de distinguir si es una oportunidad real o solo curiosidad? | Sí, tengo una forma clara de distinguirlo (`yes_clear`) | base | Claridad; Conversión | `goal_or_friction` |
| 11 | `q2_b2b_status_visibility` | De tus oportunidades activas ahora mismo, ¿sabes en qué estado está cada una sin tener que revisar o preguntar? | Sí, lo sé con claridad (`yes_clear`) | base | Base de trabajo | `goal_or_friction` |
| 12 | `q2_measurement_decision_review` | ¿Con qué frecuencia revisas tus números o resultados comparándolos con un periodo anterior? | Con cierta regularidad (`regularly`) | base | Medición | `cross_cutting_evidence` |
| 13 | `q2_measurement_outcome_tracking` | ¿Podrías decir, aunque sea de forma aproximada, cuántos de tus contactos terminan en un resultado concreto? | Sí, tengo una cifra aproximada en la que confío (`yes_approx`) | base | Medición | `cross_cutting_evidence` |
| 14 | `q2_measurement_source_confidence` | Cuando alguien se convierte en cliente, ¿sabes con seguridad cómo te conoció? | Sí, con seguridad (`yes_confident`) | base | Medición | `cross_cutting_evidence` |
| 15 | `q2_regularity` | ¿Con qué regularidad tienes actividad con clientes? | De forma regular y repetible (`regular`) | base | — | `unlock_routing` |
| 16 | `q2_process_systemization` | En las tareas que se repiten, ¿hay una forma definida de hacerlas? | Hay una forma definida (`documented_process`) | base | — | `unlock_routing` |
| 17 | `q2_conversion_interest_to_action` | De las empresas que muestran interés, ¿cuántas terminan contratando? | Más o menos la mitad (`about_half`) | material | Conversión | `cross_cutting_evidence` |
| 18 | `q2_capacity_signal` | En los últimos meses, ¿qué ha pasado con tu capacidad para atender la demanda? | Mi capacidad se ha mantenido estable (`stable`) | base | — | `required_context` |
| 19 | `q2_demand_trend` | En los últimos meses, ¿cómo ha cambiado la cantidad de clientes o pedidos? | Ha aumentado de forma sostenida (`increasing`) | base | — | `required_context` |
| 20 | `q2_professional_authority_signals` | Para alguien que te evalúa por primera vez, ¿qué tan fácil es ver pruebas de que puede confiar en ti? | Es fácil verlas y encontrarlas (`clearly_visible`) | material | Confianza visible | `specialized_evidence` |
| 21 | `q2_presence_digital_base` | Si alguien te busca en internet, ¿encuentra un lugar propio y actualizado? | Sí, un lugar propio y actualizado (`own_updated`) | material | Base digital | `specialized_evidence` |
| 22 | `q2_b2b_lead_source` | ¿De dónde suelen llegar tus oportunidades de negocio con más frecuencia? | Me contactan por mi presencia o contenido (`inbound`) | deepening | Descubrimiento; Medición | `specialized_evidence` |
| 23 | `q2_b2b_sales_cycle` | ¿Qué tan seguido una venta requiere varios contactos o conversaciones antes de cerrarse? | A veces (`sometimes`) | deepening | Seguimiento y relación | `specialized_evidence` |
| 24 | `q2_followup_general_process` | Cuando alguien queda esperando una respuesta o un siguiente paso, ¿cómo te aseguras de retomarlo? | Hay un proceso definido, no depende de acordarse (`defined_process`) | deepening | Seguimiento; Base de trabajo | `cross_cutting_evidence` |

## Deepening information value

- `q2_b2b_lead_source`: **HIGH**. Filled the previously missing Discovery dimension and also strengthened Measurement. It outranked generic follow-up candidates because Discovery was unresolved and the business context was B2B.
- `q2_b2b_sales_cycle`: **MEDIUM/HIGH**. Added direct evidence about multi-touch sales-cycle reality and supplied the missing Follow-up/relationship signal.
- `q2_followup_general_process`: **HIGH**. Directly resolved the remaining Follow-up uncertainty and strengthened Base de trabajo. Its answer materially improved evidence sufficiency.

All three questions were relevant, non-duplicate and materially connected to the unresolved dimensions.
