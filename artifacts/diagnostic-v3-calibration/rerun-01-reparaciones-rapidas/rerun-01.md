# DIAG-V3-CAL-RERUN-01 — Reparaciones Rápidas

## 1. Pre-flight

- Browser route: `/__dev/diagnostico/v3` with debug panel, same `DiagnosticFlow` used by `/diagnostico`.
- Application: `0.6.0`
- Planner: v2
- Session schema: 2
- Question bank: v1
- Scoring: v1
- Overall index: v2
- Methodology: 3.0
- Hard cap: 24
- Working tree: FIX-03A/B/C/D local changes; no code changes made during run.
- No Case 02–06 executed.

A first attempted run was discarded. The browser served a stale session/schema-1 bundle and one answer was inconsistent with the frozen persona (`referrals_only` instead of `rarely`). The browser cache/service-worker state was cleared, the Worker was restarted with forced Vite refresh, and the valid rerun below used schema 2 and the exact historical answers.

## 2. Frozen baseline

- Business: Reparaciones Rápidas del Sur
- Baseline score: 14%
- Baseline band: MAL
- Baseline questions: 19
- Baseline confidence: Limitada
- Historical coverage discrepancy:
  - `SUMMARY.md`: 6/8
  - `case-01.md`: 7/8 with Base de trabajo = 0%

## 3. Valid new question trace

| # | Question ID | Answer | Phase observed |
|---:|---|---|---|
| 1 | `q2_delivery` | `travels` | base |
| 2 | `q2_entity` | `business` | base |
| 3 | `q2_friction` | `visibility` | base |
| 4 | `q2_goal` | `opportunities` | base |
| 5 | `q2_has_customers` | `yes` | base |
| 6 | `q2_monetization` | `time_or_project` | base |
| 7 | `q2_customer_buyer` | `b2c` | base |
| 8 | `q2_customer_reach` | `local` | base |
| 9 | `q2_sector` | `home_services` | base |
| 10 | `q2_service_quote_practice` | `varies` | base |
| 11 | `q2_service_response_speed` | `some_lost` | base |
| 12 | `q2_regularity` | `irregular` | base |
| 13 | `q2_process_systemization` | `memory_dependent` | base |
| 14 | `q2_service_repeat_referral` | `rarely` | base |
| 15 | `q2_local_discovery` | `referral` | material |
| 16 | `q2_professional_authority_signals` | `not_really` | material |
| 17 | `q2_presence_digital_base` | `third_party_only` | material |
| 18 | `q2_presence_offer_clarity` | `not_clear` | material |
| 19 | `q2_operations_automation_adoption` | `none_automated` | material |

Deepening questions: **0**.

## 4. Completion

- Total questions: 19
- Base questions: 14 observed answer events, plus material routing in the same adaptive run
- Material questions: 5
- Deepening questions: 0
- Session schema: 2
- Terminal reason: `no_useful_questions`
- Hard cap reached: `false`
- Useful unanswered evidence: none
- Confidence: Limitada
- Applicable areas with reading: 7/8
- Measurement: not evaluated

## 5. Final result

- Score: **14%**
- Band: **MAL**
- Descriptor: **Presencia por fortalecer**
- Heading: **Estado actual de tu presencia digital**
- Confidence: Limitada
- Coverage: 7 de 8 áreas aplicables con lectura

Dimension readings:

| Dimension | Result |
|---|---:|
| Claridad de la oferta | 0% |
| Base digital | 25% |
| Cómo te encuentran | 50% |
| Confianza visible | 0% |
| Del interés a la acción | 25% |
| Seguimiento y relación | 0% |
| Medición | No evaluado |
| Base de trabajo | 0% |

The result text remains coherent with the persona: weak owned presence, weak trust, manual work and low conversion readiness. The current result no longer uses the old global heading or a contradictory maturity label.

Current visible commercial output remained `Cuadra`; license correctness was only recorded, not judged in this phase.

## 6. BEFORE / AFTER comparison

| Area | BEFORE | AFTER | Evidence change |
|---|---:|---:|---|
| Global | 14% MAL | 14% MAL | Same substantive answers; no scoring drift |
| Claridad | 0% | 0% | Same direct evidence |
| Base digital | 25% | 25% | Same direct evidence |
| Descubrimiento | 75% in SUMMARY | 50% | Current evidence mapping/result differs from historical artifact; requires later reconciliation, not a score fix here |
| Confianza | 0% | 0% | Same weak trust evidence |
| Conversión | 25% | 25% | Same response evidence |
| Seguimiento | 0% | 0% | Correct historical `rarely` answer preserved |
| Medición | N/E | No evaluado | No useful direct question remained |
| Base de trabajo | N/E in SUMMARY / 0% in case file | 0% | Current run agrees with case-file interpretation |

The global score is unchanged and therefore classified as **UNCHANGED**. The discovery change is a **CALIBRATION FINDING**, not automatically a regression, because the historical artifacts disagree on the exact dimension matrix and current executable mapping is the evidence to investigate.

## 7. Evidence quality

- Direct evidence covered the operational service, customer profile, local reach, response speed, recurring activity, discovery channel, trust, owned presence, offer clarity and automation.
- Material routing did not add a direct Measurement question.
- No contradictory answer was introduced.
- No favorable answer was invented; all supplied values match the frozen persona.
- The result remains evidence-limited rather than falsely high-confidence.

## 8. Responsive check

At 390px:

- horizontal overflow: false;
- heading: `Estado actual de tu presencia digital`;
- code: `MAL`;
- descriptor: `Presencia por fortalecer`;
- no technical terminal reason exposed in the user-facing result.

Desktop and mobile screenshots are preserved separately.

## 9. PDF

- Generated from the valid current session at `/diagnostico/informe?print=1` using Playwright `page.pdf()` fallback.
- PDF artifact: `result.pdf`.
- HTML report facts matched the web result: 14%, MAL, confidence Limitada and 7/8 coverage.
- Report screenshot: `report-page.png`.
- Native print UI was not certified.

## 10. Calibration findings

### OBSERVATION — stale browser bundle/session risk

A stale browser cache initially served schema-1 behavior and required forced Vite refresh plus service-worker/cache clearing. The valid rerun used schema 2. Future reruns should include this preflight cache check.

### OBSERVATION — historical discovery discrepancy

The baseline SUMMARY reports Discovery 75%, while the case file/current result reports 50%. The new score stayed 14%, but this dimension discrepancy should remain visible for later calibration review.

### PASS

- Routing avoided unnecessary deepening.
- Terminal reason was `no_useful_questions`.
- Hard cap was not reached.
- Score/status/confidence remained semantically consistent.
- Web and PDF showed the same facts.

## 11. Final verdict

**PASS WITH FINDINGS**

The current rerun is more defensible than the frozen baseline in termination semantics and result presentation. The historical Discovery matrix discrepancy and stale-cache risk require follow-up, but do not justify changing scoring during this calibration.

## Artifacts

- `rerun-01.md`
- `result-desktop.png`
- `result-mobile.png`
- `result.pdf`
- `report-page.png`
- `console-errors.txt`
