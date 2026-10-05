# Question trace — Mercado Verde

Certified route: `/diagnostico` (real browser). Session key: `vecidya.diagnostic.v3.session.2`, schema 2.

| # | Question ID | Visible question | Selected answer | Phase | Target dimensions | Planner reason |
|---:|---|---|---|---|---|---|
| 1 | `q2_delivery` | ¿Cómo se entrega principalmente lo que ofreces? | El cliente compra y paga en línea (`online_checkout`) | base | — | `required_context` |
| 2 | `q2_entity` | ¿Qué describe mejor lo que vas a diagnosticar? | Un negocio en funcionamiento (`business`) | base | — | `required_context` |
| 3 | `q2_friction` | ¿Qué es lo que más te está frenando ahora mismo? | Hay interés, pero pocas veces se concreta (`conversion`) | base | — | `required_context` |
| 4 | `q2_goal` | ¿Qué te gustaría lograr primero? | Recibir más consultas u oportunidades (`opportunities`) | base | — | `required_context` |
| 5 | `q2_has_customers` | ¿Ya tienes clientes reales, o personas que compran, usan o apoyan lo que ofreces? | Sí, ya hay actividad real (`yes`) | base | — | `required_context` |
| 6 | `q2_monetization` | ¿Cuál es (o será) tu principal fuente de ingresos? | Venta de productos o mercancía (`goods`) | base | — | `required_context` |
| 7 | `q2_customer_buyer` | ¿A quién se dirige principalmente lo que ofreces? | Personas individuales (`b2c`) | base | — | `required_context` |
| 8 | `q2_customer_reach` | ¿Hasta dónde llegan geográficamente tus clientes? | Todo el país (`national`) | base | — | `required_context` |
| 9 | `q2_sector` | ¿En qué sector o tipo de actividad encaja mejor lo que haces? | Comercio o tienda (`retail`) | base | — | `unlock_routing` |
| 10 | `q2_ecommerce_cart_visibility` | ¿Tu tienda en línea te permite saber cuándo alguien deja productos en el carrito sin terminar la compra? | Sí (`yes`) | base | Medición | `unlock_routing` |
| 11 | `q2_ecommerce_checkout_friction` | ¿Qué tan seguido las personas empiezan a comprar pero no terminan el proceso de pago? | A veces (`sometimes`) | base | Del interés a la acción | `goal_or_friction` |
| 12 | `q2_regularity` | ¿Con qué regularidad tienes actividad con clientes (ventas, servicios, citas o pedidos)? | De forma regular y repetible (`regular`) | base | — | `unlock_routing` |
| 13 | `q2_process_systemization` | En las tareas que se repiten, ¿hay una forma definida de hacerlas o suelen depender de la memoria y el criterio de cada persona? | Es una mezcla: algunas tareas tienen proceso definido y otras todavía dependen de cada persona (`partial`) | base | — | `unlock_routing` |
| 14 | `q2_ecommerce_acquisition_dependency` | ¿Tus visitas y pedidos dependen casi todos de un solo canal o vienen de varias fuentes? | Dos o tres canales, sin mucho más (`few_channels`) | base | Cómo te encuentran | `specialized_evidence` |
| 15 | `q2_ecommerce_product_discovery` | Cuando alguien llega a tu tienda en línea, ¿puede encontrar fácilmente lo que busca? | Sí, es fácil de navegar (`yes_easy`) | base | Base digital; Claridad; Conversión | `specialized_evidence` |
| 16 | `q2_ecommerce_repeat_purchase` | ¿Qué tan seguido un mismo cliente te vuelve a comprar? | De vez en cuando (`occasionally`) | base | Seguimiento y relación | `specialized_evidence` |
| 17 | `q2_conversion_interest_to_action` | De las personas que muestran interés en tus productos, ¿cuántas terminan comprando? | Más o menos la mitad (`about_half`) | material | Del interés a la acción | `cross_cutting_evidence` |
| 18 | `q2_capacity_signal` | En los últimos meses, ¿qué ha pasado con tu capacidad para atender la demanda? | Ninguna de las anteriores: mi capacidad se ha mantenido estable (`stable`) | base | — | `required_context` |
| 19 | `q2_demand_trend` | En los últimos meses, ¿cómo ha cambiado la cantidad de clientes o pedidos? | Ha aumentado de forma sostenida (`increasing`) | base | — | `required_context` |
| 20 | `q2_professional_authority_signals` | Para alguien que te evalúa por primera vez, ¿qué tan fácil es ver pruebas de que puede confiar en ti? | Existen, pero están dispersas o incompletas (`partial`) | material | Confianza visible | `specialized_evidence` |
| 21 | `q2_presence_offer_clarity` | Cuando alguien que no te conoce ve tu página, perfil o publicación por primera vez, ¿entiende rápido qué ofreces, para quién es y por qué elegirte? | Sí, se entienden las tres cosas (`all_clear`) | material | Claridad de la oferta | `specialized_evidence` |
| 22 | `q2_operations_automation_adoption` | De las tareas que se repiten, ¿cuántas ya se hacen solas con alguna herramienta? | Algunas (`some_automated`) | deepening | Base de trabajo | `cross_cutting_evidence` |
| 23 | `q2_ecommerce_cart_followup` | De esas personas que dejan productos sin comprar, ¿les das seguimiento? | A veces (`sometimes`) | deepening | Seguimiento y relación | `goal_or_friction` |
| 24 | `q2_operations_information_base` | ¿Dónde se guarda hoy la información con la que trabajas a diario? | En archivos digitales, pero dispersos (`scattered_digital`) | deepening | Base de trabajo | `cross_cutting_evidence` |

## Deepening materiality

- `q2_operations_automation_adoption`: targeted the missing Base de trabajo reading. It was more material than generic remaining candidates because it directly measured how much repetitive work was automated, a known gap in the frozen persona.
- `q2_ecommerce_cart_followup`: targeted the ecommerce lifecycle/follow-up gap created by the conversion friction and occasional repeat purchase facts. It was more material than generic confirmation questions because it directly tested whether abandoned-cart interest is recovered.
- `q2_operations_information_base`: remained material after the automation answer because it directly tested whether contacts, orders and pending work were centralized or dispersed. It was selected over the remaining candidates because it completed the unresolved operational evidence needed for Base de trabajo.

## Band-stability snapshots

| Snapshot | Answers | Score/range | Band | Evidence state |
|---|---:|---|---|---|
| Primary route end | 21 | 69.2857%; possible range 60.625–73.125 | REGULAR/BIEN still possible | Base de trabajo unresolved; useful questions remain |
| After deepening 1 | 22 | 66.875%; no band instability | REGULAR stable | Base de trabajo scored 50%; useful questions remain |
| After deepening 2 | 23 | 66.875%; no band instability | REGULAR stable | No score change; useful operational candidate remains |
| Final | 24 | 66.875%; no band instability | REGULAR stable | Useful `q2_ecommerce_traffic_sources` remained, but hard cap reached |

The technical ranges were not exposed to the user.
