# Diagnostic V9 — CLASS-03: cobertura de pruebas existente

**Versión:** 0.1.0  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · PRUEBAS NO EJECUTADAS  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Fuente principal

`tests/unit/diagnostic/qa03b-specialty-branches-wave1.test.ts`  
Blob: `47a9059df889ee89540a8c42a28a1fbaed76d32f`

La rama ya contiene pruebas focales explícitas para las tres sustituciones implementadas en el banco 77.

## 2. Dental

Casos escritos:

- cobertura genérica se conserva cuando la especializada no es elegible;
- nicho `dentist` sustituye `q2_appointments_rebooking` por `q2_dental_care_continuation`;
- un nicho distinto vuelve al fallback genérico;
- comparación de planner genérico vs especializado conserva longitud;
- evidencia especializada procede de la pregunta especializada, no del selector;
- selector tardío no duplica una observación ya respondida.

Esto cubre directamente los escenarios documentales C3-D01, C3-D02 y parte de C3-D03.

**Estado:** cobertura escrita, NO ejecutada en esta auditoría.

## 3. Food

Casos escritos:

- `restaurant` sustituye `q2_presence_offer_clarity` por `q2_food_menu_visibility` cuando existe necesidad de claridad;
- nicho `other` mantiene fallback genérico;
- planner especializado conserva longitud frente al genérico;
- evidencia procede de `q2_food_menu_visibility` y no de `q2_niche_food_hospitality`;
- ruta completa mantiene presupuesto <=24;
- una observación genérica ya respondida evita selector tardío duplicado.

Esto cubre C3-F01/F02 a nivel de test source.

**Estado:** cobertura escrita, NO ejecutada.

## 4. Marketing agency

Casos escritos:

- `marketing_agency` sustituye `q2_presence_offer_clarity` por `q2_marketing_agency_scope_clarity` para buyer B2B/mixed;
- `wholesale_distribution` conserva fallback genérico;
- evidencia procede de la pregunta especializada;
- planner conserva longitud;
- una observación genérica respondida evita duplicación posterior.

Esto cubre C3-A01/A02 a nivel de test source.

**Estado:** cobertura escrita, NO ejecutada.

## 5. Pruebas de journeys

`qa03b-specialty-journey-certification.test.ts`  
Blob: `1263cfff63941756c82f4f212cdd6cb0e30a0083`

Contiene:

- 30 personas authored;
- checks de sector/nicho/contexto sin inferir capacidades;
- determinismo del planner;
- límite <=24;
- ocho journeys sectoriales hasta estado terminal explícito;
- casos que incluyen `clinica-dental` y `restaurante-reservas`;
- fail-closed al editar historia/buyer;
- boundary de sesión pública que rechaza answers staged de nicho/wave-2.

Estas pruebas amplían cobertura de rutas, pero no sustituyen un replay CLASS-03 focal sobre el SHA actual.

## 6. Real estate

No se encontró en `qa03b-specialty-branches-wave1.test.ts` un caso que mencione:

- `q2_real_estate_inquiry_entry`;
- `referral_only`;
- paridad con `q2_professional_intake_flow`;
- sustitución/fallback real-estate.

Esto es coherente con el diseño actual: `q2_real_estate_inquiry_entry` vive en el banco complementario 82, no en el banco 77 de las sustituciones wave1 ni en el replay V9 fijado.

**Gap CLASS-03 confirmado:** real estate necesita prueba documental/focal separada antes de cualquier futura sustitución.

## 7. Matriz de cobertura CLASS-03

| Caso | Test source localizado | Estado real |
|---|---|---|
| C3-D01 dental especialista | Sí | No ejecutado |
| C3-D02 dental fallback nicho no dentist | Sí | No ejecutado |
| C3-D03 dental gates incompletos | Parcial | No ejecutado |
| C3-F01 food sustitución | Sí | No ejecutado |
| C3-F02 food fallback | Sí | No ejecutado |
| C3-A01 agency sustitución | Sí | No ejecutado |
| C3-A02 agency fallback | Sí | No ejecutado |
| C3-R01 real estate banco 77 | Evidencia estática, sin caso explícito | Gap |
| C3-R02 real estate banco 82 | No localizado | Gap |
| C3-R03 `referral_only` | No localizado | Gap |

## 8. Gate futuro

CLASS-03 no puede declararse certificada hasta:

1. ejecutar los tests focales existentes dental/food/agency sobre el SHA final;
2. añadir o localizar cobertura explícita para real estate;
3. demostrar que fallback genérico permanece activo en banco 77;
4. si se propone sustitución real-estate en banco futuro, certificar paridad de evidencia y `referral_only`;
5. conservar presupuesto, deduplicación y replay determinista.

No se ejecutaron tests ni se modificó implementación.

## Changelog

- **0.1.0 / 2026-10-31:** inventario de cobertura existente CLASS-03; dental/food/agency con tests escritos; gap real-estate confirmado.
