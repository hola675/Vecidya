# DIAG-V3-CAL-RERUN-03 — VitalCare Wellness

## 1. Pre-flight

- Branch: `main`
- HEAD: `a4a31ae` (`chore: ignore generated assets`)
- Working tree: existing local FIX-03A/B/C/D changes remain uncommitted; no new source changes made during this run.
- Application: `0.6.0`
- Planner: v2 (`ADAPTIVE_PLANNER_VERSION=2`)
- Session schema: 2 (`vecidya.diagnostic.v3.session.2`)
- Persisted question-bank version: v1 (`CURRENT_QUESTION_BANK_VERSION=1`); the runtime adaptive bank is `QUESTION_BANK_V2`, and the route trace carries its internal `questionBankVersion=2` identity.
- Scoring: v1
- Overall index: v2
- Methodology: 3.0
- Hard cap: 24
- Recent committed state includes `3043d6b`; FIX-03A/B/C/D changes are present in the expected local diff and are not committed, pushed or deployed.

No commit, push, deploy, migration, secret or remote change was made.

## 2. Environment reset

Before the certified route:

- Worker restarted with `pnpm exec react-router dev --force`.
- Browser opened at the public `/diagnostico` route.
- `localStorage` and `sessionStorage` cleared.
- No service-worker registrations were present; Cache Storage was cleared.
- The page was reloaded and showed the fresh start screen with public version `0.6.0`.
- Session schema was confirmed after start as `vecidya.diagnostic.v3.session.2` with `schemaVersion: 2`.
- The certified run used the real public browser UI, not fixture completion.

The Worker stopped once during the session transition; the run was resumed from the persisted 23-answer session after restarting the Worker. The session id and answers were preserved; the final certified result was completed only after the Worker was running the current bundle. No stale-schema attempt was used as evidence.

## 3. Frozen baseline

Source: `artifacts/diagnostic-v3-calibration/case-03-vitalcare/case-03.md`.

- Business: VitalCare Wellness Studio
- Route: `/diagnostico`
- Baseline questions: 22
- Baseline score: 59%
- Baseline classification: REGULAR
- Baseline descriptor: Presencia en desarrollo
- Baseline confidence: Limitada
- Baseline coverage: 6/8 applicable dimensions with readings
- Historical license: Cuadra

Baseline readings:

| Dimension | Applicability | Score | Confidence |
|---|---|---:|---|
| Claridad de la oferta | applicable | 100% | Limitada |
| Base digital | applicable | 100% | Limitada |
| Cómo te encuentran | applicable but no reading | N/E | — |
| Confianza visible | applicable | 50% | Limitada |
| Del interés a la acción | applicable | 50% | Limitada |
| Seguimiento y relación | applicable | 44% | Media |
| Medición | applicable but no reading | N/E | — |
| Base de trabajo | applicable | 8% | Media |

The frozen baseline explicitly recorded mixed/contradictory follow-up evidence.

## 4. Complete question trace

The complete 24-row trace, including visible question text, answers, phase, target dimensions and planner reason, is preserved in `question-trace.md`.

Route phases:

- Questions 1–9: base context.
- Questions 10–18: base follow-up, conversion and operational context.
- Questions 19–22: material evidence.
- Questions 23–24: deepening.

Substantive persona consistency was preserved for all baseline questions. The two new questions were answered conservatively from the frozen business reality; no favorable answer was invented.

## 5. Base/material/deepening breakdown

- Total: **24**
- Base: **18**
- Material: **4**
- Deepening: **2**
- Terminal queue: empty
- Final active answers: 24

The two deepening questions were:

1. `q2_local_discovery` → `maps_search`: added direct Discovery evidence. Its mapping to Medición was supporting only and did not create a measurement score.
2. `q2_appointments_rebooking` → `reactive`: targeted the follow-up contradiction. It added a conservative partial observation but did not eliminate the contradiction.

No unknown/non-informative answer was used in the deepening phase.

## 6. Applicability

All eight dimensions were reported as `applicable` with `applicabilityReason=observed_evidence`.

| Dimension | Applicability | Applicability reason | Reading | Evidence state |
|---|---|---|---:|---|
| Claridad de la oferta | applicable | observed_evidence | 100% | 1 direct observation; limited confidence |
| Base digital | applicable | observed_evidence | 100% | 1 direct observation; limited confidence |
| Cómo te encuentran | applicable | observed_evidence | 75% | 1 direct observation; limited confidence |
| Confianza visible | applicable | observed_evidence | 50% | 1 direct observation; limited confidence |
| Del interés a la acción | applicable | observed_evidence | 50% | 1 direct observation; limited confidence |
| Seguimiento y relación | applicable | observed_evidence | 45% | 5 direct observations; contradiction retained |
| Medición | applicable | observed_evidence | No evaluado | 1 supporting observation, 0 direct; no score |
| Base de trabajo | applicable | observed_evidence | 8% | 1 direct + 3 supporting observations; medium confidence |

No dimension was marked N/A. No absence of a question was converted into N/A.

## 7. Seguimiento contradiction analysis

The contradiction was not discarded:

- Positive side: automatic appointment confirmations/reminders (`q2_appointments_confirmation_reminders`).
- Negative side: rebooking is reactive, ownership is unclear, pending work depends on memory, and active review happens only when remembered (`q2_appointments_rebooking`, `q2_followup_ownership`, `q2_followup_general_process`, `q2_followup_status_visibility`).
- Current score: **45%**, up from baseline **44%**.
- Current confidence: **Media**.
- Current narrative explicitly says: “Hay señales mixtas en el seguimiento…”.
- The contradiction remains represented in the narrative and scoring metadata (`contradictory=true`, penalty `direct_contradiction`).

The extra question materially added one follow-up observation, but it did not resolve the mixed evidence. This is the honest result for the supplied persona facts.

## 8. Medición analysis

- Applicability: `applicable`.
- `applicabilityReason`: `observed_evidence`.
- Final state: **No evaluado**, score `null`.
- Direct evidence: **0**.
- Supporting evidence: 1, from `q2_local_discovery`.
- Evidence gap: `no_direct_evidence`.
- Useful direct measurement question remaining: none according to the final evidence gate.
- Planner evidence sufficiency: `unresolvedDimensions=[measurement_optimization]`, `usefulQuestionIds=[]`, `usefulQuestionsRemaining=false`.
- The remaining eligible candidates were either hard-cap-skipped generic/supporting questions or `q2_operations_information_base` marked `material_not_needed`; none supplied direct measurement evidence.

Therefore leaving Medición unevaluated is defensible. No score was invented because the session reached the cap.

## 9. Hard-cap and terminal-reason analysis

Final planner completion data:

```json
{
  "ready": true,
  "terminalReason": "no_useful_questions",
  "hardCapReached": true,
  "answers": 24
}
```

The completion reasons included both `no_useful_questions` and `absolute_hard_cap_reached`.

Interpretation:

- `terminalReason=no_useful_questions` is the substantive reason: no useful question remained for the unresolved measurement gap or other actionable evidence target.
- `hardCapReached=true` is independently true because the final answer count equals `ROUTE_HARD_CAP=24`.
- The result is not reported as `absolute_hard_cap_reached` because the gate did not identify useful evidence that the cap alone blocked.

## 10. Before/after dimension matrix

| Dimension | Baseline applicability | New applicability | Baseline score | New score | Baseline confidence | New confidence | New/changed evidence | Why changed? |
|---|---|---|---:|---:|---|---|---|---|
| Claridad de la oferta | applicable | applicable | 100 | 100 | Limitada | Limitada | Same direct `q2_presence_offer_clarity` | Unchanged |
| Base digital | applicable | applicable | 100 | 100 | Limitada | Limitada | Same direct `q2_presence_digital_base` | Unchanged |
| Cómo te encuentran | applicable, no reading | applicable | N/E | 75 | — | Limitada | Direct `q2_local_discovery` | New deepening evidence |
| Confianza visible | applicable | applicable | 50 | 50 | Limitada | Limitada | Same direct `q2_professional_authority_signals` | Unchanged |
| Del interés a la acción | applicable | applicable | 50 | 50 | Limitada | Limitada | Same direct `q2_appointments_booking_friction` | Unchanged |
| Seguimiento y relación | applicable | applicable | 44 | 45 | Media | Media | `q2_appointments_rebooking` added as partial direct evidence | Supported one-point change; contradiction remains |
| Medición | applicable, no reading | applicable | N/E | N/E | — | — | `q2_local_discovery` supporting only | No direct measurement evidence; remains unevaluated |
| Base de trabajo | applicable | applicable | 8 | 8 | Media | Media | Same direct/supporting operational evidence | Unchanged |

## 11. Global score review

- Baseline: **59%**
- New raw score: **61.142857%**
- New displayed score: **61%**
- Classification: **JUSTIFIED CHANGE**
- Band: **REGULAR**
- Descriptor: **Presencia en desarrollo**
- Coverage: **6/8 → 7/8** applicable dimensions with readings

The score change is explainable:

- Discovery gained a direct 75% reading from `q2_local_discovery`.
- Follow-up moved from 44% to 45% after the conservative `reactive` rebooking answer.
- The remaining dimensions were unchanged.

The 61% result is mathematically supported and does not appear suspicious.

## 12. Extreme-score review

- Claridad de la oferta remains 100% from one direct observation (`q2_presence_offer_clarity`), with Limitada confidence and an explicit “señales positivas”/preliminary caveat.
- Base digital remains 100% from one direct observation (`q2_presence_digital_base`), also with Limitada confidence and the same caveat.
- No mechanical second confirmation was required by the gate.
- The result does not present either 100% reading as high-confidence proof; both are visibly limited signals.

Conclusion: the readings are acceptable as observed signals under the current model, but not robust evidence. The confidence presentation is essential and remains honest.

## 13. Evidence-quality review

| Dimension group | Directness | Diversity | Consistency | Contradictions | Fragility |
|---|---|---|---|---|---|
| Claridad / Base digital / Discovery / Confianza / Conversión | One direct observation each | Low | Internally consistent | None | High; confidence Limitada |
| Seguimiento y relación | Five direct observations | Better than baseline | Mixed | Explicit contradiction retained | Moderate; confidence Media |
| Medición | Zero direct, one supporting | Insufficient | No direct measurement claim | None | Very high; correctly not evaluated |
| Base de trabajo | One direct + three supporting | Mixed direct/supporting | Consistent weak signal | None | Moderate; confidence Media |

Did the two deepening questions materially improve the diagnostic? **PARTIAL**.

- Discovery: **YES**, a new direct reading was added.
- Follow-up: **PARTIAL**, one targeted observation was added but the contradiction remains.
- Medición: **NO**, the discovery question provided supporting context only and did not create a direct measurement reading.

## 14. Confidence comparison

- Baseline: Limitada.
- New: Limitada.
- Code-level basis: coverage `0.88`, 7 scored dimensions, only 2 dimensions at least Media, 0 High.
- The five low-confidence single-observation dimensions and unevaluated Medición justify keeping overall confidence Limitada.
- No confidence inflation occurred from reaching the hard cap.

## 15. Current recommendations observed

1. **Ordenar la base de trabajo diaria** — Base de trabajo; recommended; confidence Media; confirmed.
2. **Estabilizar el seguimiento** — Seguimiento y relación; probably convenient; confidence Media; probable; after step 1.
3. **Hacer más visibles las pruebas de confianza** — Confianza visible; probably convenient; confidence Limitada; probable.

Observed commercial output:

- License: **Cuadra**.
- Service: Organización del negocio.
- Service: CRM, after the first prerequisite.
- No additional addon was displayed.

Commercial correctness was recorded only; it was not evaluated in this calibration.

## 16. Desktop/mobile validation

At 390px mobile:

- horizontal overflow: **false**;
- canonical title present: **Estado actual de tu presencia digital**;
- public band code: **REGULAR**;
- descriptor: **Presencia en desarrollo**;
- confidence displayed separately: **Limitada**;
- no internal reason codes exposed;
- no broken result content.

Desktop result screenshot was also captured at 1366px.

## 17. PDF validation

- Generated from the certified browser session through `/diagnostico/informe?print=1` using the `page.pdf()` fallback.
- Rendered report: **4 pages** (`.rp-sheet` count 4).
- Report ready state: `data-ready=true`.
- PDF/web facts match: 61%, REGULAR, Presencia en desarrollo, Confianza general Limitada, 7/8 coverage.
- Dimension values and priorities were present.
- Sheet overflow check: no vertical or horizontal overflow on any of the four report sheets.
- No clipping, overlap, missing content or status/descriptor contradiction observed.
- Native print/download remains uncertified.

## 18. Environment observations

- The Worker stopped during a browser-section transition and was restarted; the persisted session resumed at 23 answers without data loss.
- The final certified route used the restarted current Worker bundle.
- Console capture: 0 errors and 0 warnings.
- No relevant authentication or service-worker error affected the route/result.
- The restart event is environmental and did not alter the certified answers or final output.

## 19. Calibration findings by severity

### BLOCKER

None.

### MAJOR

None. Useful measurement evidence was not demonstrably left unasked, and the follow-up contradiction remained visible rather than being hidden.

### MINOR

- `q2_appointments_rebooking` was relevant and targeted the contradiction, but its conservative `reactive` answer only changed Seguimiento from 44% to 45%; the contradiction remains.
- The two 100% dimensions still rely on one direct observation each. The UI correctly marks them Limitada, but the result remains fragile.

### OBSERVATION

- `q2_local_discovery` adds useful Discovery evidence while contributing only supporting context to Medición; Medición correctly remains unevaluated.
- Generic eligible candidates remain listed in planner trace at the cap, but the evidence gate reports `usefulQuestionIds=[]`; their skip reasons are preserved (`hard_cap` or `material_not_needed`).
- The Worker restart was environmental and unrelated to diagnostic logic.

## 20. Acceptance questions

A. **¿Fueron relevantes todas las preguntas?** Sí. Las 24 preguntas fueron contextualmente relevantes; las dos nuevas preguntas tenían objetivos observables y no fueron filler.

B. **¿Estuvieron materialmente justificadas las deepening?** Sí, con resultado parcial: Discovery añadió evidencia directa y rebooking abordó la contradicción sin resolverla.

C. **¿Se resolvió o preservó honestamente la contradicción de Seguimiento?** Se preservó honestamente y de forma explícita; no desapareció del score ni de la narrativa.

D. **¿Medición quedó correctamente no evaluada si no había evidencia útil?** Sí. Es aplicable, pero tiene solo evidencia supporting y cero directa; no se inventó score.

E. **¿El `terminalReason` es veraz?** Sí: `no_useful_questions`.

F. **¿`hardCapReached` está separado y es veraz?** Sí: `true`, separado de `terminalReason`, con 24 respuestas.

G. **¿Quedó evidencia útil sin preguntar?** No según la evaluación final: `usefulQuestionIds=[]`. Los candidatos restantes eran genéricos, redundantes/materialmente no necesarios o estaban bloqueados por el cap sin ser útiles para la carencia de Medición.

H. **¿Los scores 100% están suficientemente soportados?** Son lecturas válidas bajo el modelo, pero frágiles; una observación directa cada una y confianza Limitada están correctamente expuestas.

I. **¿El score global es defendible?** Sí. El cambio 59% → 61% se explica por la nueva lectura de Discovery y el ajuste de Seguimiento.

J. **¿La confianza es honesta?** Sí: permanece Limitada.

K. **¿Web y PDF contienen los mismos hechos?** Sí.

L. **¿VitalCare es más defendible que el baseline?** Sí: sube la cobertura de 6/8 a 7/8, agrega evidencia directa de Discovery, conserva explícitamente la contradicción y reporta terminalidad/hard cap de forma separada. Medición sigue correctamente abierta.

## 21. Final verdict

**PASS WITH FINDINGS**

No se modificó código durante la calibración. Case 04 queda autorizado después de revisar este reporte.

## Artifacts

- `rerun-03.md`
- `question-trace.md`
- `planner-completion.json`
- `session-final.json`
- `result-desktop.png`
- `result-mobile.png`
- `result.pdf`
- `report-page.png`
- `report-page-desktop.png`
- `console-errors.txt`

DIAG-V3-CAL-RERUN-03 COMPLETE

STOP.
