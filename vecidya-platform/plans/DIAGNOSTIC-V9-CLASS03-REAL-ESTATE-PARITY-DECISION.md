# Diagnostic V9 — CLASS-03: decisión de paridad para Real Estate

**Versión:** 0.1.0  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · SUSTITUCIÓN BLOQUEADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Preguntas comparadas

### Fallback vigente
`q2_professional_intake_flow` v2

Fuente: `app/features/diagnostic/qbv2-reviewed-local-appointments-professional.ts`  
Blob: `655c8bcf86613d6d1803971c07f1d4d4ce01d1ed`

Contrato:
- módulo `professional`;
- `routingRole: adaptive`;
- prioridad `normal`;
- aplica a `activeProfessional`, cuyo grupo incluye `real_estate`;
- pregunta por claridad del **siguiente paso** cuando una persona interesada quiere avanzar;
- opciones: `clear / partial / unclear / unknown`.

Su mapping V3 está en `qbv2-reviewed-evidence.ts` (blob `d3bb5edc0b504dd0257a73fccadf38dbc777540e`):
- dimensión: `clarity_positioning`;
- directness: `direct`;
- `clear=established`;
- `partial=partial`;
- `unclear=weak`;
- `unknown=uncertainty`.

El banco QA03B V9 deriva del banco reviewed-evidence; `qa03b/bank.ts` (blob `b4772d73e1d8b5044ba2011088db978c364097f0`) evoluciona reglas sin eliminar ese mapping. Por ello el fallback del banco 77 conserva evidencia V3 migrada.

### Candidata complementaria
`q2_real_estate_inquiry_entry` v1

Fuente: `qa03b/specialty-branches-wave1.ts`  
Blob: `12e14f8dc7bd4450ebbcf2b0fb9d02dac033096e`

Contrato:
- módulo `professional`;
- `routingRole: deepening`;
- prioridad `refinement`;
- historial activo;
- `q2_sector = real_estate`;
- goal `explain|opportunities` o friction `conversion`;
- pregunta si una persona entiende cómo **solicitar información** sobre una propiedad o servicio;
- opciones: `clear / partial / unclear / referral_only / unknown`;
- `referral_only` es `kind: not_applicable`;
- `evidenceMigration: pending`;
- no tiene `evidenceV3`.

## 2. Coincidencias

Hay una zona de solapamiento real:

- ambas observan claridad para avanzar;
- ambas usan `clear / partial / unclear / unknown`;
- ambas pueden interpretar:
  - `clear → established`;
  - `partial → partial`;
  - `unclear → weak`;
  - `unknown → uncertainty`;
- ambas se aplican a actividad profesional inmobiliaria activa en escenarios compatibles.

Esto justifica tratar la candidata como **potencial sustituto especializado**, pero no demuestra paridad completa.

## 3. Diferencias que bloquean sustitución automática

### 3.1 Constructo observado

`q2_professional_intake_flow` mide de forma amplia la claridad del **siguiente paso profesional**.

`q2_real_estate_inquiry_entry` mide un paso más estrecho: la claridad para **enviar una consulta**.

Una consulta puede ser solo una fase previa al siguiente paso comercial real. Por tanto, no son constructos idénticos.

### 3.2 Dimensión ambigua

El fallback vigente puntúa `clarity_positioning`.

Sin embargo, otras observaciones de acceso/entrada puntúan `conversion_access`:
- `q2_service_response_speed`;
- `q2_appointments_booking_friction`.

Además, el draft `QA03B_GENERAL_PROBE_EVIDENCE_DRAFT_V1` propone `q2_general_first_action_path` sobre `conversion_access` y declara solapamiento potencial explícito con:
- `q2_professional_intake_flow`;
- `q2_real_estate_inquiry_entry`;
- otros first-step sectoriales.

Por ello existen dos lecturas posibles:
- **A — sustitución conservadora:** mapear real estate a `clarity_positioning` para preservar el contrato de la genérica;
- **B — clasificación semántica nueva:** mapearla a `conversion_access` por tratarse de un entry path.

Elegir A o B cambia scoring y no puede inferirse por analogía.

### 3.3 `referral_only`

El validator V3 exige que una opción `kind: not_applicable` se mapee a estado `not_applicable`; no puede convertirse en `weak`, `missing` o penalización.

Pero `clarity_positioning` es una dimensión universal en la política R4-A. Un `not_applicable` de esta **pregunta** no hace que toda la dimensión `clarity_positioning` deje de aplicar.

Interpretación segura:
- `referral_only` = esta vía directa de consulta no aplica;
- NO significa que la claridad/posicionamiento global sea N/A;
- NO demuestra que el referral esté bien explicado;
- NO debe bajar score.

Se necesitaría otra evidencia para valorar si el proceso de derivación es claro.

### 3.4 Elegibilidad

La genérica aplica a `activeProfessional` siempre que real estate esté dentro del grupo profesional activo.

La candidata requiere además:
- clientes/historial real;
- sector literal real_estate;
- goal/friction concreto.

Si se suprimiera la genérica solo por sector, aparecerían huecos donde la candidata no es elegible y se perdería evidencia actualmente disponible.

## 4. Riesgo de doble conteo

No deben coexistir como dos observaciones directas independientes si ambas responden al mismo hecho de “cómo empieza una persona interesada”.

El draft general ya marca el constructo `entry_next_step` como solapado con ambas.

Criterio de deduplicación futura:
- si real estate sustituye a professional intake, solo una debe aportar evidencia directa del mismo constructo;
- si ambas permanecen, deben demostrar hechos independientes antes de que las dos contribuyan al scoring;
- distinto `questionId` no basta para demostrar independencia.

## 5. Propuesta de mapping de paridad — NO APROBADA

Solo si producto decide que la candidata **sustituye** a la genérica conservando semántica de scoring, la propuesta mínima sería:

```text
questionId: q2_real_estate_inquiry_entry
questionVersion: 1
dimension: clarity_positioning
directness: direct
clear         -> established
partial       -> partial
unclear       -> weak
referral_only -> not_applicable
unknown       -> uncertainty
```

Esta propuesta conserva el contrato del fallback, pero debe considerarse **hipótesis de paridad**, no evidence V3 aprobada.

Alternativamente, si se decide que “solicitar información” pertenece a `conversion_access`, entonces **no es una sustitución semánticamente equivalente** de `q2_professional_intake_flow`; sería una nueva evidencia sectorial y requiere calibración/deduplicación separadas.

## 6. Regla de fallback propuesta — NO IMPLEMENTAR

Si se aprueba sustitución conservadora en el futuro:

`realEstateSpecialistEligible` debe incluir todos los gates de la candidata.

La genérica solo puede recibir un guard equivalente a:

`NOT realEstateSpecialistEligible`

No usar simplemente `q2_sector != real_estate`.

Así se preserva la genérica cuando:
- real estate aún no tiene historial activo;
- goal/friction no requiere esa observación;
- contexto no permite activar la especializada;
- el banco activo no contiene la candidata.

## 7. Estado actual seguro

**Decisión:** mantener `q2_professional_intake_flow` como evidencia vigente para real estate en el banco 77.

`q2_real_estate_inquiry_entry` permanece como **ADD complementario pending**, no sustituto.

No promoverla al banco fijado del replay ni asignarle evidence V3 hasta resolver:
1. dimensión `clarity_positioning` vs `conversion_access`;
2. semántica de `referral_only`;
3. regla exacta de sustitución;
4. deduplicación con professional intake y general first action;
5. pruebas de fallback y replay.

## 8. Pruebas focales futuras — NO EJECUTADAS

| ID | Caso | Esperado |
|---|---|---|
| RE-01 | real estate activo, sin gates especializados completos | professional intake permanece disponible |
| RE-02 | candidata elegible en banco experimental | no suprimir genérica sin regla explícita |
| RE-03 | `referral_only` | neutral/N-A para la pregunta; no penaliza dimensión |
| RE-04 | candidata + genérica responden al mismo hecho | una sola observación directa efectiva |
| RE-05 | mapping conservador a clarity | paridad de estados con genérica |
| RE-06 | mapping alternativo a conversion_access | tratar como nueva evidencia, no sustitución |
| RE-07 | replay banco 77 | resultado independiente de candidata ausente |
| RE-08 | cambio futuro 77→82+ | requiere versión de banco y política de replay |

## 9. Conclusión CLASS-03 / Real Estate

**REAL ESTATE = BLOCKED FOR SUBSTITUTION / FALLBACK GENÉRICO VIGENTE.**

No se encontró defecto en el comportamiento actual: el diseño evita activar una candidata aún sin evidence V3. El bloqueo es de **paridad semántica y calibración**, no de existencia de código.

## Changelog

- **0.1.0 / 2026-10-31:** comparación de fallback y candidata; ambigüedad clarity vs conversion; semántica de referral_only; propuesta no aprobada de paridad y regla de fallback.
