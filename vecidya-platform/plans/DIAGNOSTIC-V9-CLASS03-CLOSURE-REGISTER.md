# Diagnostic V9 — CLASS-03 Closure Register

**Versión:** 0.1.0  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · CLASS-03 PARCIAL / NO CERTIFICADA  
**Rama auditada:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Contrato

Fuente de alcance: `DIAGNOSTIC-V9-TAX-CLASS-COMPATIBILITY.md` (blob `b087853b384c73c04cbbdf60ca7641a38fcd8e77`).

CLASS-03 exige trazar y certificar en el futuro las **reglas y fallbacks de dental, food, agency y real estate**.

## 2. Estado ejecutivo

### Dental
**Regla documentada. Fallback documentado. Test source existente. No certificado.**

`q2_dental_care_continuation` sustituye `q2_appointments_rebooking` solo cuando el especialista dental cumple todos sus gates. La genérica se conserva en contextos no especialistas. Ambas observaciones comparten dimensión `relationship_recurrence` y estados semánticos equivalentes.

### Food
**Regla documentada. Fallback documentado. Test source existente. No certificado.**

`q2_food_menu_visibility` sustituye `q2_presence_offer_clarity` solo para food_hospitality con nicho conocido restaurant/cafe/food_truck y demás gates. La genérica permanece para `other/unknown` o cuando falta la condición especializada. Ambas usan `clarity_positioning` y estados equivalentes.

### Marketing agency
**Regla documentada. Fallback documentado. Test source existente. No certificado.**

`q2_marketing_agency_scope_clarity` sustituye `q2_presence_offer_clarity` para `b2b_services + marketing_agency` con buyer B2B/mixed y demás gates. Nichos no agency conservan la genérica. La evidencia especializada usa `clarity_positioning`.

### Real estate
**Fallback vigente documentado. Sustitución bloqueada.**

El banco 77 fijado por replay conserva `q2_professional_intake_flow` con evidence V3 directa en `clarity_positioning`. `q2_real_estate_inquiry_entry` pertenece al banco complementario 82, está `pending`, no tiene `evidenceV3` y no suprime la genérica.

La sustitución futura queda bloqueada por ambigüedad semántica:
- conservar `clarity_positioning` para paridad;
- o clasificar “solicitar información” como `conversion_access`.

Además, `referral_only` debe permanecer neutral/N-A a nivel de la pregunta y no penalizar por sí sola una dimensión.

## 3. Evidencia documental principal

| Documento | Blob actual | Resultado |
|---|---|---|
| `DIAGNOSTIC-V9-CLASS03-SPECIALTY-FALLBACK-TRACE.md` | `bbbe281f35eaef302da27fc4027c05ef4b2e58e2` | Reglas y fallbacks D/F/A/R |
| `DIAGNOSTIC-V9-CLASS03-EXISTING-TEST-COVERAGE.md` | `0639595cdef3c9d6dd4b317e689d9d23a37f0973` | Tests escritos y gaps |
| `DIAGNOSTIC-V9-CLASS03-REAL-ESTATE-PARITY-DECISION.md` | `f81ca7955cd5871026be0431d1d77386389367ea` | Sustitución RE bloqueada |

## 4. Fuentes runtime relevantes

- `qa03b/specialty-branches-wave1.ts` — blob `12e14f8dc7bd4450ebbcf2b0fb9d02dac033096e`.
- `qa03b/specialty-candidate-bank.ts` — blob `0bc44cddc1dc2f03230bd5ece30847fce984a12b`.
- `qa03b/v9-classification-bundle.ts` — blob `34329d64fa798904e55dd8ed743de20bcdd3c795`.
- `qbv2-reviewed-local-appointments-professional.ts` — blob `655c8bcf86613d6d1803971c07f1d4d4ce01d1ed`.
- `qbv2-reviewed-transversal.ts` — blob `8a389afb1fea1786ac99c553175dcdb3a56ca361`.
- `qbv2-reviewed-evidence.ts` — blob `d3bb5edc0b504dd0257a73fccadf38dbc777540e`.
- `qa03b/bank.ts` — blob `b4772d73e1d8b5044ba2011088db978c364097f0`.

## 5. Pruebas existentes — NO EJECUTADAS

### Fuente focal
`qa03b-specialty-branches-wave1.test.ts`  
Blob `47a9059df889ee89540a8c42a28a1fbaed76d32f`.

Cubre en source:
- sustitución y fallback dental;
- sustitución y fallback food;
- sustitución y fallback marketing agency;
- no duplicación por selector;
- evidencia solo desde pregunta especializada;
- presupuesto/longitud;
- preservación genérica cuando especialista no aplica.

### Journey source
`qa03b-specialty-journey-certification.test.ts`  
Blob `1263cfff63941756c82f4f212cdd6cb0e30a0083`.

Incluye personas/journeys, determinismo, límite <=24 y fail-closed al cambiar contexto.

### Gap real estate
No se localizó caso explícito para:
- `q2_real_estate_inquiry_entry`;
- `referral_only`;
- paridad con `q2_professional_intake_flow`;
- regla de sustitución real estate.

Esto es consistente con que la sustitución no está implementada.

## 6. Bloqueos de certificación

### B03-01 — Tests no ejecutados
La cobertura dental/food/agency existe como código de prueba, pero no hay PASS del SHA actual bajo la autorización vigente.

### B03-02 — Real estate sin evidence V3
`q2_real_estate_inquiry_entry` permanece pending.

### B03-03 — Dimensión real estate no decidida
`clarity_positioning` vs `conversion_access`.

### B03-04 — `referral_only`
Debe aprobarse si la candidata se activa; hoy solo se documenta como N/A neutral de la pregunta.

### B03-05 — Deduplicación
Cualquier futura coexistencia con `q2_professional_intake_flow` o `q2_general_first_action_path` debe evitar doble observación del mismo hecho.

### B03-06 — Replay/bank version
La candidata real estate no puede introducirse en replay sin nueva identidad/versionado de banco y política de compatibilidad.

## 7. Gate futuro de certificación

CLASS-03 puede pasar a CERTIFICADA únicamente cuando:

1. dental/food/agency pasen los tests focales sobre el SHA final;
2. se demuestre fallback correcto cuando el especialista no aplica;
3. se decida explícitamente el estado de real estate:
   - mantener fallback genérico y excluir candidata del banco certificado, **o**
   - aprobar mapping, sustitución, deduplicación y replay de la candidata;
4. si se activa real estate candidata, existan pruebas RE-01..RE-08 o equivalentes;
5. no exista doble conteo por IDs distintos;
6. el banco probado sea el mismo banco identificado en runtime/replay.

## 8. Decisión documental actual

Para el estado actual del repositorio:

- **dental/food/agency:** conservar las sustituciones existentes;
- **real estate:** conservar `q2_professional_intake_flow`;
- **no promover** `q2_real_estate_inquiry_entry` al replay certificado;
- **no asignar** evidence V3 por analogía;
- mantener `CLASS-03 PARCIAL / NO CERTIFICADA`.

## 9. Transición a CLASS-04

El contrato registrado para CLASS-04 es: **C01–C10, híbridos, unknown, cambio de sector y replay**.

Puede iniciarse auditoría documental de CLASS-04 sin cambiar el estado de CLASS-03 y manteniendo `PLAN_ONLY`.

## Changelog

- **0.1.0 / 2026-10-31:** cierre documental consolidado de CLASS-03; D/F/A trazados, real estate bloqueado para sustitución, seis bloqueos y gate futuro.
