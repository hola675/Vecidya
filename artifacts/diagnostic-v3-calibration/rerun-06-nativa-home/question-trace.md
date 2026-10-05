# Question trace — Nativa Home

Certified route: `/diagnostico` through the real browser UI. Session key: `vecidya.diagnostic.v3.session.2`, schema 2.

| # | Question ID | Visible question | Selected answer | Phase | Target dimensions | Planner reason |
|---:|---|---|---|---|---|---|
| 1 | `q2_delivery` | ¿Cómo se entrega principalmente lo que ofreces? | El cliente compra y paga en línea (`online_checkout`) | base | — | `required_context` |
| 2 | `q2_entity` | ¿Qué describe mejor lo que vas a diagnosticar? | Un negocio en funcionamiento (`business`) | base | — | `required_context` |
| 3 | `q2_friction` | ¿Qué es lo que más te está frenando ahora mismo? | Me falta orden interno (tareas, información o procesos) (`operations`) | base | — | `required_context` |
| 4 | `q2_goal` | ¿Qué te gustaría lograr primero? | Medir y entender qué funciona (`measure`) | base | — | `required_context` |
| 5 | `q2_has_customers` | ¿Ya tienes clientes reales, o personas que compran, usan o apoyan lo que ofreces? | Sí, ya hay actividad real (`yes`) | base | — | `required_context` |
| 6 | `q2_monetization` | ¿Cuál es (o será) tu principal fuente de ingresos? | Venta de productos o mercancía (`goods`) | base | — | `required_context` |
| 7 | `q2_customer_buyer` | ¿A quién se dirige principalmente lo que ofreces? | Personas individuales (`b2c`) | base | — | `required_context` |
| 8 | `q2_customer_reach` | ¿Hasta dónde llegan geográficamente tus clientes? | Todo el país (`national`) | base | — | `required_context` |
| 9 | `q2_sector` | ¿En qué sector o tipo de actividad encaja mejor lo que haces? | Comercio o tienda (`retail`) | base | — | `unlock_routing` |
| 10 | `q2_ecommerce_cart_visibility` | ¿Tu tienda en línea te permite saber cuándo alguien deja productos en el carrito sin terminar la compra? | Sí (`yes`) | base | Medición | `unlock_routing` |
| 11 | `q2_ecommerce_checkout_friction` | ¿Qué tan seguido las personas empiezan a comprar pero no terminan el proceso de pago? | Casi nunca (`rarely`) | base | Del interés a la acción | `goal_or_friction` |
| 12 | `q2_operations_bottleneck` | ¿Qué es lo que más limita tu capacidad para atender más trabajo ahora mismo? | Información dispersa, difícil de encontrar (`scattered_info`) | base | Base de trabajo | `cross_cutting_evidence` |
| 13 | `q2_operations_handoffs` | Cuando un trabajo pasa por más de una persona, ¿la información pasa completa, o se pierde o se duplica? | A veces se pierde o se duplica (`sometimes_lost`) | base | Base de trabajo | `cross_cutting_evidence` |
| 14 | `q2_measurement_decision_review` | ¿Con qué frecuencia revisas tus números o resultados comparándolos con un periodo anterior? | Con cierta regularidad (`regularly`) | base | Medición | `cross_cutting_evidence` |
| 15 | `q2_measurement_outcome_tracking` | ¿Podrías decir, aunque sea de forma aproximada, cuántos de tus contactos terminan en un resultado concreto? | Sí, tengo una cifra aproximada en la que confío (`yes_approx`) | base | Medición | `cross_cutting_evidence` |
| 16 | `q2_measurement_source_confidence` | Cuando alguien se convierte en cliente, ¿sabes con seguridad cómo te conoció? | A veces (`sometimes`) | base | Medición | `cross_cutting_evidence` |
| 17 | `q2_operations_automation_adoption` | De las tareas que se repiten, ¿cuántas ya se hacen solas con alguna herramienta? | La mayoría ya se hace sola (`most_automated`) | material | Base de trabajo | `cross_cutting_evidence` |
| 18 | `q2_operations_information_base` | ¿Dónde se guarda hoy la información con la que trabajas a diario? | En un sistema o herramienta digital que se usa de forma consistente (`shared_system`) | material | Base de trabajo | `cross_cutting_evidence` |
| 19 | `q2_ecommerce_cart_followup` | De esas personas que dejan productos sin comprar, ¿les das seguimiento? | Siempre (`always`) | deepening | Seguimiento y relación | `goal_or_friction` |
| 20 | `q2_professional_authority_signals` | Para alguien que te evalúa por primera vez, ¿qué tan fácil es ver pruebas de que puede confiar en ti? | Es fácil verlas y encontrarlas (`clearly_visible`) | deepening | Confianza visible | `specialized_evidence` |
| 21 | `q2_ecommerce_acquisition_dependency` | ¿Tus visitas y pedidos dependen casi todos de un solo canal, o vienen de varias fuentes? | Varias fuentes reales, ninguna domina (`diverse`) | deepening | Cómo te encuentran; Medición | `specialized_evidence` |
| 22 | `q2_ecommerce_product_discovery` | Cuando alguien llega a tu tienda en línea, ¿puede encontrar fácilmente lo que busca? | Sí, es fácil de navegar (`yes_easy`) | deepening | Base digital; Claridad; Conversión | `specialized_evidence` |
| 23 | `q2_presence_offer_clarity` | Cuando alguien que no te conoce ve tu página, perfil o publicación por primera vez, ¿entiende rápido qué ofreces, para quién y por qué elegirte? | Sí, se entienden las tres cosas (`all_clear`) | deepening | Claridad de la oferta | `specialized_evidence` |

## Deepening information value

- `q2_ecommerce_cart_followup`: **HIGH**. It corrected the historical Follow-up N/A risk by testing an operational ecommerce behavior directly.
- `q2_professional_authority_signals`: **HIGH**. It filled historically missing Trust evidence from the established reviews/UGC reality.
- `q2_ecommerce_acquisition_dependency`: **HIGH**. It filled Discovery and also supported Measurement.
- `q2_ecommerce_product_discovery`: **HIGH**. It supplied direct digital-foundation evidence and supporting evidence for Clarity and Conversion.
- `q2_presence_offer_clarity`: **HIGH**. It supplied direct Clarity evidence and completed the last unresolved applicable dimension.

All five questions outranked generic confirmations because they targeted unresolved dimensions and narrowed the possible global range.
