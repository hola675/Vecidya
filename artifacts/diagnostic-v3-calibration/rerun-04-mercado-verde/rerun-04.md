# DIAG-V3-CAL-RERUN-04 — Mercado Verde

## 1. Pre-flight

- Branch: `main`
- HEAD: `a4a31ae` (`chore: ignore generated assets`)
- Working tree: existing FIX-03A/B/C/D local changes remain uncommitted; no new source changes were made during this run.
- Application: `0.6.0`
- Planner: v2 (`ADAPTIVE_PLANNER_VERSION=2`)
- Session schema: 2 (`vecidya.diagnostic.v3.session.2`)
- Persisted question-bank version: v1 (`CURRENT_QUESTION_BANK_VERSION=1`); runtime adaptive bank is `QUESTION_BANK_V2`.
- Scoring: v1
- Overall index: v2
- Methodology: 3.0
- Hard cap: 24
- FIX-03A/B/C/D state: present in the expected local working-tree diff; no dedicated commit, push or deploy was created during calibration.

No commit, push, deploy, migration, secret or remote change was made.

## 2. Environment reset

Before the certified run:

- Worker restarted with `pnpm exec react-router dev --force`.
- Browser opened at the public `/diagnostico` route.
- `localStorage` and `sessionStorage` cleared.
- Service-worker registrations checked/unregistered; Cache Storage cleared.
- Public diagnostic page reloaded and served version `0.6.0`.
- Session key and schema 2 were confirmed after starting the run.
- The certified flow used the actual browser UI, not a fixture completion.

No stale-code or stale-schema attempt was used as evidence. There was no discarded diagnostic attempt. The Playwright browser backend became unavailable while opening the print/report tab after the certified result; the captured session and result were preserved, and the report/PDF was regenerated from the exact captured schema-2 answers in a clean Chrome fallback context.

## 3. Frozen baseline

Source: `artifacts/diagnostic-v3-calibration/case-04-mercado-verde/case-04.md`.

- Business: Mercado Verde
- Business type: local retail + small ecommerce operation
- Baseline questions: 21
- Baseline score: 69%
- Baseline state: REGULAR
- Baseline descriptor: Presencia en desarrollo
- Baseline confidence: Limitada
- Baseline coverage: 7/8 applicable dimensions with readings
- Historical license: none

| Dimension | Baseline score | Baseline confidence |
|---|---:|---|
| Claridad de la oferta | 100% | Media |
| Base digital | 100% | Limitada |
| Cómo te encuentran | 50% | Limitada |
| Confianza visible | 50% | Limitada |
| Del interés a la acción | 60% | Media |
| Seguimiento y relación | 50% | Limitada |
| Medición | 75% | Limitada |
| Base de trabajo | No evaluado | — |

## 4. Complete question trace

The complete 24-row trace is preserved in `question-trace.md`.

Summary of route phases:

- Base: 18 questions.
- Material: 3 questions.
- Deepening: 3 questions.
- Total: 24 questions.

The frozen persona answers were reused wherever the current wording/options permitted. New answers were conservative and consistent:

- Automation: `some_automated`, matching basic abandoned-cart automation and occasional campaigns.
- Cart follow-up: `sometimes`, matching inconsistent lifecycle follow-up.
- Information base: `scattered_digital`, matching loosely connected tools and non-unified customer-service history.

## 5. Base/material/deepening breakdown

- Base: **18**
- Material: **3**
- Deepening: **3**
- Total: **24**

Deepening questions:

1. `q2_operations_automation_adoption` — directly opened the Base de trabajo gap.
2. `q2_ecommerce_cart_followup` — directly tested recovery of abandoned-cart interest.
3. `q2_operations_information_base` — directly tested whether operational information was centralized or dispersed.

All three were relevant. The third consumed the final hard-cap slot and gave the Base de trabajo dimension a defensible reading.

## 6. Band-stability trace

| Point | Answers | Score/range | Band state | Useful evidence |
|---|---:|---|---|---|
| Primary route end | 21 | 69.2857%; possible 60.625–73.125 | REGULAR/BIEN still possible | Yes; Base de trabajo unresolved |
| After deepening 1 | 22 | 66.875% / 67%; no crossing range | REGULAR stable | Yes |
| After deepening 2 | 23 | 66.875% / 67%; unchanged | REGULAR stable | Yes |
| Final | 24 | 66.875% / 67%; unchanged | REGULAR stable | Yes: 3 candidates remained |

The boundary uncertainty was real at the primary-route endpoint: the possible range crossed the 70/71 boundary. The first deepening answer added Base de trabajo evidence and narrowed the global band to REGULAR. The remaining deepening questions did not change the score or band.

Technical ranges were not exposed to the user.

## 7. Applicability

All eight dimensions were applicable with `applicabilityReason=observed_evidence`.

| Dimension | Applicability | Reason | Final score | Evidence quality |
|---|---|---|---:|---|
| Claridad de la oferta | applicable | observed_evidence | 100% | 1 direct + 1 supporting; Media |
| Base digital | applicable | observed_evidence | 100% | 1 direct; Limitada |
| Cómo te encuentran | applicable | observed_evidence | 50% | 1 direct; Limitada |
| Confianza visible | applicable | observed_evidence | 50% | 1 direct; Limitada |
| Del interés a la acción | applicable | observed_evidence | 60% | 2 direct + 1 supporting; Media |
| Seguimiento y relación | applicable | observed_evidence | 50% | 2 direct; Media |
| Medición | applicable | observed_evidence | 75% | 1 direct; Limitada |
| Base de trabajo | applicable | observed_evidence | 50% | 2 direct; Media |

No dimension was silently converted to N/A. Final coverage is 8/8.

## 8. Base de trabajo analysis

Baseline: no reading / insufficient reading.

New evidence:

- `q2_operations_automation_adoption=some_automated`.
- `q2_operations_information_base=scattered_digital`.

Final:

- Score: **50%**
- Status: **Parcial**
- Confidence: **Media**
- Direct observations: 2
- Supporting observations: 0
- Contradictions: none

The reading is sufficiently supported for a partial operational state. It does not claim that the business has no systems; it reflects some automation combined with dispersed information.

The score was not fabricated to obtain 8/8. The additional information question was directly relevant and materially improved coverage.

## 9. Before/after dimension matrix

| Dimension | Baseline applicability | New applicability | Baseline | New | Baseline confidence | New confidence | New evidence | Why changed? |
|---|---|---|---:|---:|---|---|---|---|
| Claridad de la oferta | applicable | applicable | 100 | 100 | Media | Media | Same offer clarity + product discovery support | Unchanged score; independent support retained |
| Base digital | applicable | applicable | 100 | 100 | Limitada | Limitada | Product discovery direct | Unchanged |
| Cómo te encuentran | applicable | applicable | 50 | 50 | Limitada | Limitada | Acquisition dependency direct | Unchanged |
| Confianza visible | applicable | applicable | 50 | 50 | Limitada | Limitada | Authority signals direct | Unchanged |
| Del interés a la acción | applicable | applicable | 60 | 60 | Media | Media | Checkout friction + conversion + product discovery | Unchanged |
| Seguimiento y relación | applicable | applicable | 50 | 50 | Limitada | Media | Cart follow-up + repeat purchase | Confidence strengthened |
| Medición | applicable | applicable | 75 | 75 | Limitada | Limitada | Cart visibility direct | Unchanged |
| Base de trabajo | no reading | applicable | N/E | 50 | — | Media | Automation + scattered information | New dimension reading |

## 10. Score and band comparison

- Baseline: **69% REGULAR**.
- Final raw score: **66.875%**.
- Final displayed score: **67% REGULAR**.
- Descriptor: **Presencia en desarrollo**.
- Classification: **JUSTIFIED CHANGE**.

The score decreased because the final result includes Base de trabajo at 50% instead of excluding that applicable dimension from the average. The final mean is:

```text
(100 + 100 + 50 + 50 + 60 + 50 + 75 + 50) / 8 = 66.875
```

The band did not cross from REGULAR to BIEN. It became stable before completion, after the first deepening answer.

Boundary verification:

- 70 → REGULAR → Presencia en desarrollo.
- 71 → BIEN → Presencia sólida.
- Actual final: 67 → REGULAR → Presencia en desarrollo.
- No 70/71 misclassification occurred.

## 11. 100% dimensions review

### Claridad de la oferta

- Score: 100%.
- Evidence: one direct observation (`q2_presence_offer_clarity`) plus one supporting observation (`q2_ecommerce_product_discovery`).
- Confidence: Media.
- The independent supporting concept improves this over the baseline single-observation pattern.

### Base digital

- Score: 100%.
- Evidence: one direct observation (`q2_ecommerce_product_discovery`).
- Confidence: Limitada.
- `q2_presence_digital_base` remained a useful candidate but was not reached before the hard cap.

Not asking a mechanical confirmation was defensible for route economy, but the remaining useful confirmation and low confidence are recorded as non-blocking calibration debt.

## 12. Evidence-quality review

| Dimension | Directness/diversity | Consistency | Contradiction | Fragility |
|---|---|---|---|---|
| Claridad | 1 direct + 1 supporting | Consistent | None | Moderate |
| Base digital | 1 direct | Consistent | None | High; Limitada |
| Descubrimiento | 1 direct | Partial channel diversity | None | High; Limitada |
| Confianza | 1 direct | Partial/dispersed proof | None | High; Limitada |
| Conversión | 2 direct + 1 supporting | Consistent partial funnel | None | Moderate |
| Seguimiento | 2 direct | Consistent partial recurrence | None | Moderate |
| Medición | 1 direct | Cart visibility only | None | High; Limitada |
| Base de trabajo | 2 direct | Consistent partial operational state | None | Moderate |

Coverage improved from 7/8 to 8/8 and the new dimension has direct evidence. Evidence quality improved materially, not just numerically.

## 13. Confidence comparison

- Baseline: Limitada.
- Final: **Media**.
- Basis: coverage 1.0, 8 scored dimensions, 4 at least Media, 0 High.
- The increase is justified by complete coverage plus stronger evidence in Claridad, Conversión, Seguimiento and Base de trabajo.
- Confidence was not inflated to Alta; four dimensions remain Limitada.

## 14. Terminal reason and hard cap

Final persisted completion:

```json
{
  "terminalReason": "absolute_hard_cap_reached",
  "hardCapReached": true,
  "answers": 24,
  "usefulQuestionsRemaining": true
}
```

This terminal reason is truthful. At 24 questions, useful candidates remained:

- `q2_ecommerce_traffic_sources`
- `q2_reputation_flow`
- `q2_presence_digital_base`

The band was already stable at REGULAR, so the remaining evidence did not leave a materially unstable global band. However, the route did not reach the replay prediction of `evidence_sufficient` at 23 questions; the hard cap stopped further useful confirmation.

## 15. Current recommendations observed

1. **Lograr que más interés llegue a comprar** — Del interés a la acción; recommended; confidence Media.
2. **Hacer más visibles las pruebas de confianza** — Confianza visible; probably convenient; confidence Limitada.
3. **Ordenar la base de trabajo diaria** — Base de trabajo; recommended; confidence Media.

Commercial output observed:

- License: **Cuadra**.
- Service: Ecommerce / Experiencia de comercio electrónico.
- Service: Organización del negocio.
- No addon displayed.

This records the output only; global score was not used to judge license fit.

## 16. Desktop/mobile validation

At 390px:

- horizontal overflow: **false**;
- canonical title present;
- public code: **REGULAR**;
- descriptor: **Presencia en desarrollo**;
- confidence shown separately: **Media**;
- coverage shown as 8/8;
- no internal reason codes;
- no broken sections.

A desktop result screenshot was captured at 1366px.

## 17. PDF validation

- PDF generated with the accepted `page.pdf()` fallback from the exact captured schema-2 answers.
- Page count: **3**.
- Facts match web: 67%, REGULAR, Presencia en desarrollo, Media, 8/8.
- All eight dimension values, priorities and recommendations present.
- Rendered report: 3 sheets, each without horizontal or vertical overflow.
- No clipping, overlap, missing content or wrong state/descriptor observed.
- Native print/download remains uncertified because the print transition closed the Playwright browser backend.

## 18. Environment observations

- No stale-code attempt was used.
- Playwright became unavailable while opening the print/report tab; this did not alter the certified session, which had already been captured in `session-24.json`.
- Clean Chrome fallback loaded the exact answer set, rendered the report, and generated the PDF.
- Console on the rendered report: 0 errors, 0 warnings.
- Worker remained on the current local bundle during the certified questionnaire run.

## 19. Calibration findings by severity

### BLOCKER

None. The 70/71 boundary contract was respected.

### MAJOR

None. The band was stable before completion, even though additional useful evidence remained.

### MINOR

- The final hard cap stopped with three useful confirmation candidates still available. This did not destabilize the REGULAR band, but it prevented the predicted `evidence_sufficient` terminal reason.
- Base digital remains a 100% reading backed by one direct observation and Limitada confidence; a useful confirmation candidate remained unasked.

### OBSERVATION

- First deepening answer stabilized the 70/71 decision: possible range changed from 60.625–73.125 to a stable 66.875.
- Base de trabajo improved from no reading to 50% with two direct observations and Media confidence.
- PDF remained within three pages.
- Print-tab/browser-backend instability was environmental, not diagnostic.

## 20. Acceptance questions

A. **¿Fueron relevantes todas las preguntas?** Sí. Las 24 preguntas correspondieron al contexto ecommerce, conversión, lifecycle y operaciones.

B. **¿Estuvieron justificadas las deepening?** Sí. Las tres abordaron gaps concretos: automatización, carritos abandonados e información operativa.

C. **¿Deepening estabilizó la decisión 70/71?** Sí. La estabilizó después de la primera deepening: de 60.625–73.125 posibles a REGULAR estable en 66.875.

D. **¿Base de trabajo quedó suficientemente evaluada?** Sí, con lectura parcial 50%, dos evidencias directas y confianza Media.

E. **¿Quedó evidencia útil sin preguntar?** Sí: tres candidatos útiles permanecieron al alcanzar el hard cap. No comprometieron la estabilidad de banda.

F. **¿Las decisiones de applicability son defendibles?** Sí. Las ocho dimensiones fueron aplicables por evidencia observada; ninguna se convirtió silenciosamente en N/A.

G. **¿El `terminalReason` es veraz?** Sí: `absolute_hard_cap_reached`.

H. **¿`hardCapReached` es veraz?** Sí: `true` con 24 respuestas.

I. **¿El score final está respaldado?** Sí. El 67% es la media exacta de las ocho lecturas y la caída desde 69% se explica por incorporar Base de trabajo al denominador.

J. **¿El resultado mantiene una banda defendible?** Sí. Permanece REGULAR y la banda quedó estable antes del cierre.

K. **¿La confianza es honesta?** Sí: mejora a Media, pero no a Alta, porque cuatro dimensiones siguen con evidencia Limitada.

L. **¿Los dos scores de 100% están cualificados?** Sí. Claridad tiene confianza Media por evidencia independiente; Base digital permanece Limitada y preliminar.

M. **¿Web y PDF son idénticos en hechos?** Sí.

N. **¿El resultado es más defendible que el baseline?** Sí: cubre 8/8 dimensiones, evalúa Base de trabajo con evidencia directa, estabiliza la banda y eleva la confianza a Media.

## 21. Final verdict

**PASS WITH FINDINGS**

No se modificó código durante la calibración. No hubo commit, push ni deploy. Case 05 queda autorizado después de revisar este informe.

## Artifacts

- `rerun-04.md`
- `question-trace.md`
- `planner-completion.json`
- `session-09.json`
- `session-21.json`
- `session-22.json`
- `session-24.json`
- `result-desktop.png`
- `result-mobile.png`
- `result.pdf`
- `report-page.png`
- `report-page-desktop.png`
- `console-errors.txt`

DIAG-V3-CAL-RERUN-04 COMPLETE

STOP.
