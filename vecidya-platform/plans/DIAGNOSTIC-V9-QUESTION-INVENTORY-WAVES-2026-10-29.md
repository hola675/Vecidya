# V9 — Inventario verificable de olas y especializaciones

**PLAN_ONLY · versión 1.0.0 · 2026-10-29**

## Alcance

Este documento identifica **24 IDs distintos** presentes en los tres componentes de recuperación y especialización del banco candidato V9. **No es el inventario completo de 77 preguntas**, porque no desglosa la base editorial heredada ni los ocho selectores `q2_niche_*`. Los IDs provienen de inspección textual de las declaraciones y llamadas `find(..., "q2_*")`, no de ejecutar el ensamblaje.

Fuente 1: `qa03b/specialty-candidate-bank.ts` blob `0bc44cddc1dc2f03230bd5ece30847fce984a12b`.

### Piloto de recuperación — 6 IDs

| ID | Observación editorial concreta |
| --- | --- |
| `q2_startup_problem_clarity` | Problema y público; prelaunch; evidencia directa de claridad |
| `q2_startup_validation_evidence` | Pruebas con personas reales; prelaunch; evidencia de apoyo |
| `q2_startup_offer_readiness` | Oferta preparada para probar; prelaunch; evidencia directa |
| `q2_ecommerce_checkout_friction` | Fricción al completar pagos; ecommerce operativo; evidencia directa |
| `q2_nonprofit_support_type` | Tipo de apoyo/financiación; clasificación, `evidenceMigration=pending`, sin evidencia V3 |
| `q2_nonprofit_donation_clarity` | Claridad para donar; requiere donations/mixed; evidencia directa |

Fuente 2: `qa03b/recovery-wave2.ts` blob `59fe5898cc98ba243b4c898b027dd22f2c1153c9`.

### Segunda ola — 15 IDs

`q2_startup_demand_signal`, `q2_ecommerce_cart_visibility`, `q2_ecommerce_cart_followup`, `q2_ecommerce_repeat_purchase`, `q2_hospitality_flow_type`, `q2_hospitality_reservation_noshow`, `q2_hospitality_peak_capacity`, `q2_b2b_qualification`, `q2_creator_channel_concentration`, `q2_nonprofit_membership_lifecycle`, `q2_local_repeat_customers`, `q2_service_area_clarity`, `q2_operations_process_ownership`, `q2_followup_status_visibility`, `q2_measurement_source_confidence`.

Restricciones que no deben perderse: `q2_ecommerce_cart_followup` es v2 y requiere carrito visible y contacto autorizado para interpretar seguimiento; `q2_nonprofit_membership_lifecycle` exige membership_dues/mixed; `q2_b2b_qualification` requiere historial y compradores B2B/mixed; `q2_operations_process_ownership` y `q2_followup_status_visibility` requieren historial y señales de objetivo/fricción correspondientes. La presencia de una pregunta no demuestra cobertura universal.

Fuente 3: `qa03b/specialty-branches-wave1.ts` blob `ec605156f2e974d7b463f44ae76475f8ede1f0e9`.

### Especializaciones — 3 IDs

| ID | Sustitución condicional |
| --- | --- |
| `q2_dental_care_continuation` | Sustituye ruta genérica `q2_appointments_rebooking` si es elegible |
| `q2_food_menu_visibility` | Sustituye ruta genérica `q2_presence_offer_clarity` si es elegible |
| `q2_marketing_agency_scope_clarity` | Sustituye ruta genérica `q2_presence_offer_clarity` si es elegible |

## Próxima puerta de cierre

Completar la base editorial V9 y ocho selectores; cotejar el total de 77 y versiones, opciones y evidencia desde `buildCandidateEditorialMatrixV9()`. Luego contrastar C01–C10 y ocho dimensiones. No se deben confundir preguntas presentes en el catálogo con preguntas efectivamente seleccionadas para una sesión de 24+5.

**Estado:** inventario parcial de 24 IDs, inspección estática. Sin pruebas, CI, cambios del motor, activación ni aprobación editorial.
