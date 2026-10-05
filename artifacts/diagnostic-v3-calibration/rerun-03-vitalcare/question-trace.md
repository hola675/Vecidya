# Question trace — VitalCare Wellness

Certified route: `/diagnostico` (real browser). Persisted session: `vecidya.diagnostic.v3.session.2`, schema 2.

| # | Question ID | Visible question | Selected answer | Phase | Target dimensions | Route reason |
|---:|---|---|---|---|---|---|
| 1 | `q2_delivery` | ¿Cómo se entrega principalmente lo que ofreces? | Con citas agendadas, entre varias personas o espacios (`scheduled`) | base | — | `required_context` |
| 2 | `q2_entity` | ¿Qué describe mejor lo que vas a diagnosticar? | Un negocio en funcionamiento (`business`) | base | — | `required_context` |
| 3 | `q2_friction` | ¿Qué es lo que más te está frenando ahora mismo? | Se me pierden contactos o pendientes por falta de seguimiento (`follow_up`) | base | — | `required_context` |
| 4 | `q2_goal` | ¿Qué te gustaría lograr primero? | Recibir más consultas u oportunidades (`opportunities`) | base | — | `required_context` |
| 5 | `q2_has_customers` | ¿Ya tienes clientes reales, o personas que compran, usan o apoyan lo que ofreces? | Sí, ya hay actividad real (`yes`) | base | — | `required_context` |
| 6 | `q2_monetization` | ¿Cuál es (o será) tu principal fuente de ingresos? | Cobro por tiempo o por proyecto (`time_or_project`) | base | — | `required_context` |
| 7 | `q2_customer_buyer` | ¿A quién se dirige principalmente lo que ofreces? | Personas individuales (`b2c`) | base | — | `required_context` |
| 8 | `q2_customer_reach` | ¿Hasta dónde llegan geográficamente tus clientes? | Mi zona o ciudad (`local`) | base | — | `required_context` |
| 9 | `q2_sector` | ¿En qué sector o tipo de actividad encaja mejor lo que haces? | Salud y bienestar (`health_wellness`) | base | — | `unlock_routing` |
| 10 | `q2_appointments_confirmation_reminders` | ¿Envías confirmaciones o recordatorios antes de la cita? | Sí, de forma automática (`automatic`) | base | Seguimiento y relación | `goal_or_friction` |
| 11 | `q2_appointments_booking_friction` | ¿Qué tan seguido cuesta encontrar un horario que le sirva a la persona, con varios mensajes o llamadas antes de confirmar? | A veces (`sometimes`) | base | Del interés a la acción | `goal_or_friction` |
| 12 | `q2_followup_ownership` | Cuando hay más de una persona involucrada, ¿está claro quién debe responder y cuándo se considera resuelto? | No, no siempre está claro (`unclear`) | base | Seguimiento y relación; Base de trabajo | `cross_cutting_evidence` |
| 13 | `q2_followup_general_process` | Cuando alguien queda esperando una respuesta o un siguiente paso, ¿cómo te aseguras de retomarlo? | Depende de que alguien se acuerde (`memory_dependent`) | base | Seguimiento y relación; Base de trabajo | `cross_cutting_evidence` |
| 14 | `q2_followup_status_visibility` | ¿Con qué frecuencia repasas de forma activa tus pendientes, para asegurarte de que ninguno se quedó sin resolver? | Solo cuando me acuerdo (`only_when_remember`) | base | Seguimiento y relación; Base de trabajo | `cross_cutting_evidence` |
| 15 | `q2_regularity` | ¿Con qué regularidad tienes actividad con clientes (ventas, servicios, citas o pedidos)? | De forma regular y repetible (`regular`) | base | — | `unlock_routing` |
| 16 | `q2_process_systemization` | En las tareas que se repiten, ¿hay una forma definida de hacerlas o suelen depender de la memoria y el criterio de cada persona? | Es una mezcla: algunas tareas tienen proceso definido y otras todavía dependen de cada persona (`partial`) | base | — | `unlock_routing` |
| 17 | `q2_capacity_signal` | En los últimos meses, ¿qué ha pasado con tu capacidad para atender la demanda? Elige todas las que apliquen. | Ninguna de las anteriores: mi capacidad se ha mantenido estable (`stable`) | base | — | `required_context` |
| 18 | `q2_demand_trend` | En los últimos meses, ¿cómo ha cambiado la cantidad de clientes o pedidos? | Ha aumentado de forma sostenida (`increasing`) | base | — | `required_context` |
| 19 | `q2_professional_authority_signals` | Para alguien que te evalúa por primera vez, ¿qué tan fácil es ver pruebas de que puede confiar en ti (casos, testimonios, opiniones, credenciales o resultados)? | Existen, pero están dispersas o incompletas (`partial`) | material | Confianza visible | `specialized_evidence` |
| 20 | `q2_presence_digital_base` | Si alguien te busca en internet, ¿encuentra un lugar propio y actualizado (página web, ficha en buscadores o mapas, o similar) donde ver lo que haces y cómo contactarte? | Sí, un lugar propio y actualizado (`own_updated`) | material | Base digital | `specialized_evidence` |
| 21 | `q2_presence_offer_clarity` | Cuando alguien que no te conoce ve tu página, perfil o publicación por primera vez, ¿entiende rápido qué ofreces, para quién es y por qué elegirte? | Sí, se entienden las tres cosas (`all_clear`) | material | Claridad de la oferta | `specialized_evidence` |
| 22 | `q2_operations_automation_adoption` | De las tareas que se repiten (confirmaciones, recordatorios, respuestas frecuentes, registro de pedidos), ¿cuántas ya se hacen solas con alguna herramienta? | Ninguna, todo se hace a mano (`none_automated`) | material | Base de trabajo | `cross_cutting_evidence` |
| 23 | `q2_local_discovery` | Cuando alguien de tu zona te descubre por primera vez, ¿cómo suele ocurrir con más frecuencia? | Buscando en Google o en mapas (`maps_search`) | deepening | Cómo te encuentran; Medición (mapping) | `specialized_evidence` |
| 24 | `q2_appointments_rebooking` | Cuando el servicio requiere que la persona vuelva (seguimiento, mantenimiento o control), ¿le ayudas a agendar la siguiente cita antes de que se vaya? | Solo si la persona lo pide (`reactive`) | deepening | Seguimiento y relación | `specialized_evidence` |

## Deepening review

- `q2_local_discovery` added direct discovery evidence and contextual source evidence for Medición, but the final Medición dimension remained without a score because the answer did not satisfy the measurement evidence requirements.
- `q2_appointments_rebooking` targeted the follow-up contradiction. The frozen persona did not explicitly establish proactive rebooking; `reactive` was selected as the conservative, non-favorable interpretation. It added evidence to the mixed follow-up reading but did not resolve the contradiction.
- No unknown/non-informative deepening answer was used in this run.

## Persisted route trace

- Route lengths: 9 base context → 16 base follow-up/operations → 23 base/material plus first deepening → 24 after the second deepening.
- Final persisted status: `completed`.
- Final terminal reason: `no_useful_questions`.
- Final active answers: 24.
- Final queue: empty.
- The final count equals `ROUTE_HARD_CAP=24`; `hardCapReached=true` is therefore reported independently from the terminal reason.
