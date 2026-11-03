# Diagnostic V9 — CLASS-03: reglas y fallbacks especializados

**Versión:** 0.1.0  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · CLASS-03 PARCIAL / NO CERTIFICADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Contrato de CLASS-03

Fuente de alcance: `DIAGNOSTIC-V9-TAX-CLASS-COMPATIBILITY.md` (blob `b087853b384c73c04cbbdf60ca7641a38fcd8e77`).

El gate definido para **CLASS-03** es: **“reglas y fallbacks de dental, food, agency, real estate”**.

Este documento inicia esa auditoría sin ejecutar reglas ni tests.

## 2. Bancos relevantes

- `QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2` en `qa03b/specialty-branches-wave1.ts` (blob `12e14f8dc7bd4450ebbcf2b0fb9d02dac033096e`) contiene **77 preguntas** y aplica sustituciones especializadas para dental, food y marketing agency.
- `QA03B_EXTENDED_CANDIDATE_BANK_V3` añade cinco preguntas complementarias y llega a **82**; entre ellas está `q2_real_estate_inquiry_entry`.
- `QA03B_GENERAL_BALANCED_CANDIDATE_BANK_V4` añade ocho probes y llega a **90**.
- El replay V9 actual y el bundle de clasificación usan `QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2` de 77 preguntas, no el banco 82/90. `v9-classification-bundle.ts` (blob `34329d64fa798904e55dd8ed743de20bcdd3c795`) resuelve y planifica contra ese banco; `worker-replay-v9.server.ts` también fija el mismo banco.

Consecuencia: la pregunta complementaria de real estate **no forma parte del banco fijado actual del replay V9**.

## 3. Dental — sustitución estática trazada

### Especializada
`q2_dental_care_continuation` v1.

Elegibilidad:
- `q2_operational_status = operating`
- `q2_has_customers = yes`
- `q2_niche_health_wellness = dentist`
- arquetipo incluye `appointments`
- goal `stop_losing` **o** friction `follow_up`

Evidencia V3:
- dimensión `relationship_recurrence`
- directness `direct`
- estados: `proactive=established`, `partial=partial`, `reactive=weak`, `not_applicable`, `unknown=uncertainty`

### Genérica
`q2_appointments_rebooking` v2 en `qbv2-reviewed-local-appointments-professional.ts` (blob `655c8bcf86613d6d1803971c07f1d4d4ce01d1ed`).

Su evidence V3 en `qbv2-reviewed-evidence.ts` (blob `d3bb5edc0b504dd0257a73fccadf38dbc777540e`) usa **la misma dimensión y los mismos cinco estados semánticos**.

### Fallback
`replaceGenericQuestion` añade `healthGenericGate = NOT dentalSpecialistEligible` al `appliesWhen/materialAppliesWhen` de la genérica. Cuando dental especializada resulta elegible, la genérica queda suprimida; si el nicho dental o las condiciones de especialización no están confirmadas, la genérica permanece disponible según sus reglas originales.

**Estado:** paridad semántica fuerte por lectura estática; falta replay focal.

## 4. Food — sustitución estática trazada

### Especializada
`q2_food_menu_visibility` v1.

Elegibilidad:
- historial activo;
- `q2_sector = food_hospitality`;
- nicho `restaurant|cafe|food_truck`;
- `q2_goal = explain`;
- `q2_presence_digital_base = reliable_presence|partial_presence`.

Evidencia V3:
- `clarity_positioning`, direct;
- `clear=established`, `partial=partial`, `unclear=weak`, `not_applicable`, `unknown=uncertainty`.

### Genérica
`q2_presence_offer_clarity` v2 en `qbv2-reviewed-transversal.ts` (blob `8a389afb1fea1786ac99c553175dcdb3a56ca361`), con evidence V3 en `qbv2-reviewed-evidence.ts`.

La genérica usa la misma dimensión y el mismo mapa de estados.

### Fallback
`offerGenericGate = NOT foodSpecialistEligible AND NOT agencySpecialistEligible` se añade a la regla de la genérica. Food especializada reemplaza esa observación cuando sus condiciones completas son verdaderas; de lo contrario, la genérica conserva su elegibilidad original.

**Estado:** paridad de dimensión/estados fuerte por lectura estática; falta replay focal.

## 5. Marketing agency — sustitución estática trazada

### Especializada
`q2_marketing_agency_scope_clarity` v1.

Elegibilidad:
- historial activo;
- `q2_sector = b2b_services`;
- `q2_niche_b2b_services = marketing_agency`;
- `q2_goal = explain`;
- buyer `b2b|mixed`;
- presencia `reliable_presence|partial_presence`.

Evidencia V3:
- `clarity_positioning`, direct;
- mismo mapa `clear/partial/unclear/not_applicable/unknown` de la genérica.

### Fallback
Comparte `offerGenericGate` con food. Cuando agency especializada es elegible, `q2_presence_offer_clarity` queda suprimida; en caso contrario la pregunta genérica conserva su comportamiento.

**Estado:** paridad de dimensión/estados fuerte por lectura estática; falta replay focal.

## 6. Real estate — fallback genérico vigente; sustitución NO activada

### Genérica vigente
`q2_professional_intake_flow` v2:
- `activeProfessional` incluye `real_estate`;
- evidence V3 directa en `clarity_positioning`;
- estados `clear=established`, `partial=partial`, `unclear=weak`, `unknown=uncertainty`.

### Candidata complementaria
`q2_real_estate_inquiry_entry` v1 existe en `QA03B_COMPLEMENTARY_QUESTIONS_V1`:
- `q2_sector = real_estate`;
- historial activo;
- goal `explain|opportunities` o friction `conversion`;
- respuestas `clear/partial/unclear/referral_only/unknown`;
- `referral_only` es `not_applicable`;
- `evidenceMigration = pending`;
- no contiene `evidenceV3`.

No existe en el banco 77 fijado por el replay V9 actual y no hay gate que suprima `q2_professional_intake_flow` cuando esa candidata sea elegible.

### Decisión documental
El comportamiento actual seguro es **fallback genérico a `q2_professional_intake_flow`**. Una futura sustitución por `q2_real_estate_inquiry_entry` queda **BLOQUEADA** hasta disponer de:

1. evidence V3 explícita;
2. decisión de paridad para `referral_only`;
3. regla de sustitución/fallback;
4. deduplicación demostrada;
5. replay focal.

No convertir el ADD de real estate en sustitución por analogía con dental/food/agency.

## 7. Planner y preguntas pending

Los planners inspeccionados tratan `evidenceMigration !== migrated` como ausencia de fuentes semánticas direct/supporting. Una pregunta `pending` no aporta por sí misma evidence V3 de scoring. Sin embargo, el planner puede conservar preguntas pending cuando cumplen trabajo real de routing/contexto; por tanto, “pending” no equivale automáticamente a “imposible de mostrar” en cualquier banco.

En el caso concreto de real estate, la restricción más fuerte es anterior: el replay/bundle V9 fijado usa el banco 77 donde `q2_real_estate_inquiry_entry` no existe.

## 8. Matriz CLASS-03 propuesta — NO EJECUTADA

| ID | Escenario | Resultado esperado | Estado |
|---|---|---|---|
| C3-D01 | Dental especialista cumple todos los gates | especializada elegible; genérica rebooking suprimida | Pendiente de replay |
| C3-D02 | Health con nicho unknown/no dentist | dental no elegible; genérica disponible si su regla aplica | Pendiente |
| C3-D03 | Dentist sin appointments o sin goal/friction requerido | fallback genérico; no forzar dental | Pendiente |
| C3-F01 | Restaurant/cafe/food_truck + explain + presencia válida | food especializada sustituye offer clarity | Pendiente |
| C3-F02 | food_hospitality con nicho other/unknown | food especializada no elegible; fallback genérico | Pendiente |
| C3-A01 | marketing_agency + B2B/mixed + explain + presencia válida | agency especializada sustituye offer clarity | Pendiente |
| C3-A02 | b2b_services no agency o buyer fuera de B2B/mixed | fallback genérico | Pendiente |
| C3-R01 | real_estate en banco 77 fijado | professional intake sigue siendo fuente; real-estate ADD ausente | Resuelto estáticamente; replay pendiente |
| C3-R02 | banco 82 experimental | real-estate ADD no puntúa; no debe reemplazar genérica sin contrato | Pendiente |
| C3-R03 | `referral_only` | N/A de candidata; no derivar “unclear” ni penalización | Pendiente |

## 9. Estado de CLASS-03

- **Dental:** sustitución documentada, no certificada.
- **Food:** sustitución documentada, no certificada.
- **Agency:** sustitución documentada, no certificada.
- **Real estate:** fallback genérico vigente; sustitución futura bloqueada.
- **CLASS-03 global:** PARCIAL / NO CERTIFICADA.

No se ejecutaron tests, replay, CI ni cambios de implementación.

## Changelog

- **0.1.0 / 2026-10-31:** contrato CLASS-03 identificado; trazadas reglas/fallbacks dental, food, agency y real estate; matriz C3-D/F/A/R definida sin ejecución.
