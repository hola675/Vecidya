# DIAG-V3 Six-Case Calibration — Summary

## Environment

- Date: 2026-10-03
- Version: 0.6.0
- Branch / SHA: `main` / `c165f5ba11b8380d7a5310dce185fa3fa9aba21e`
- Route: `/diagnostico`
- Runtime: local `pnpm run dev` Worker runtime
- PDF method: Playwright/Chromium `page.pdf()` fallback from `/diagnostico/informe`; native print UI was not invoked

## Final comparison

| Case | Business type | Expected band | Overall | Actual band | Match | Semantic verdict | PDF |
|---|---|---|---:|---|---|---|---|
| 1 — Reparaciones Rápidas del Sur | Local home service | 0–40 MAL | 14% | MAL | YES | PASS | YES · 3 pages |
| 2 — María Peña Fotografía | Independent professional / creative appointments | 0–40 MAL | 32% | MAL | YES | PASS | YES · 3 pages |
| 3 — VitalCare Wellness Studio | Appointment-based wellness | 41–70 EN DESARROLLO | 59% | EN DESARROLLO | YES | PASS | YES · 3 pages |
| 4 — Mercado Verde Home | Retail + ecommerce | 41–70 EN DESARROLLO | 69% | EN DESARROLLO | YES | PASS | YES · 3 pages |
| 5 — AxisPro Business Solutions | B2B professional services | 71–100 BIEN | 92% | BIEN | YES | QUESTIONABLE | YES · 3 pages |
| 6 — Nativa Home Market | Ecommerce + retail brand | 71–100 BIEN | 81% | BIEN | YES | QUESTIONABLE | YES · 3 pages |

## Dimension comparison matrix

`N/E` = no reading because the adaptive route did not include a direct observation; `N/A` = not applicable.

| Dimension | Case 1 | Case 2 | Case 3 | Case 4 | Case 5 | Case 6 |
|---|---:|---:|---:|---:|---:|---:|
| Claridad de la oferta | 0% | 50% | 100% | 100% | 100% | N/E |
| Base digital | 25% | 50% | 100% | 100% | 100% | N/E |
| Cómo te encuentran | 75% | 25% | N/E | 50% | N/E | N/E |
| Confianza visible | 0% | 50% | 50% | 50% | 100% | N/E |
| Del interés a la acción | 25% | 50% | 50% | 60% | 67% | 100% |
| Seguimiento y relación | 0% | 0% | 44% | 50% | N/E | N/A |
| Medición | N/E | N/A | N/E | 75% | 83% | 69% |
| Base de trabajo | N/E | 0% | 8% | N/E | 100% | 75% |

## Confidence observations

- Cases 1–2: overall confidence `Limitada`; this is proportionate to weak and narrow evidence.
- Case 3: overall confidence `Limitada`, with follow-up and work-base medium confidence; this is proportionate to mixed manual/automated evidence.
- Case 4: overall confidence `Limitada` even with several ecommerce signals; the funnel and acquisition evidence remain partial.
- Case 5: measurement confidence `Alta`, but overall confidence remains `Limitada` because only 6/8 applicable areas have readings.
- Case 6: measurement and work-base confidence `Alta`, but only 3/7 applicable areas have readings and overall confidence remains `Limitada`.

## Main findings

1. The percentage separates the six probes in the expected order: low / low / developing / developing / strong / strong.
2. Offline success, team size, stage and future intent did not create visible capability points by themselves.
3. Missing dimensions are excluded rather than converted into zeros, which is consistent with the declared model but creates a coverage risk for strong cases.
4. Cases 5 and 6 expose the principal issue: high percentages (92%, 81%) are calculated from limited route coverage and are presented in the narrative as “en desarrollo” until evidence is confirmed. This is internally defensible but semantically confusing against the audit’s canonical 71–100 `BIEN` band.
5. The adaptive planner routed strong cases toward a small subset of high-scoring dimensions, leaving several applicable areas unobserved. This is primarily a `ROUTING` / `GLOBAL_AGGREGATION` calibration concern, not evidence for a business-name score hack.
6. Several questions visibly had neither a hint nor the expandable “¿Qué significa esta pregunta?” explanation. Every case Markdown records the exact affected IDs in its path table.
7. PDF rendering produced three readable pages per case with UI-equivalent result content in the fallback PDF. Native application print/download was not certified.

## Root-cause classification

- `ROUTING`: strong cases received sparse applicable-dimension coverage; Case 6 had only 3/7 readings.
- `GLOBAL_AGGREGATION`: equal-weight averaging over observed dimensions can produce a high percentage before enough of the applicable digital ecosystem is observed.
- `CONFIDENCE`: confidence is correctly separated from capability numerically, but its cap changes the user-facing status without changing the percentage.
- `SEMANTIC_NARRATIVE`: 92%/81% with “en desarrollo hasta confirmarla” needs an explicit distinction between canonical band and provisional reading.
- `QUESTION_CONTENT` / `UI`: a recurring subset of questions has no hint and no “porqué” explanation.
- `RECOMMENDATIONS` / `SOLUTION_MAPPING`: Case 5’s first recommendation (landing page / Barrio) may overlap with the supplied existing website, CRM and pipeline; verify the evidence-to-offering relationship before changing it.
- `PDF`: no visual defect observed; only test fallback was exercised.

## Principal decision

**D — INPUT/Routing Problem**

Secondary: **E — RESULT/PRESENTATION PROBLEM**.

The six scores broadly calibrate correctly, so no direct scoring rewrite is justified from these probes. The material concern is that the adaptive route can leave too many applicable dimensions unobserved in strong businesses while still producing a high percentage; the result layer then uses confidence to present a lower maturity state without naming the canonical band clearly.

## Correction plan — not implemented

| Problem | Evidence | Likely module/file | Proposed correction | Expected effect | Regression risk | Tests required |
|---|---|---|---|---|---|---|
| Sparse strong-case coverage | Case 5: 6/8 readings at 92%; Case 6: 3/7 readings at 81% | `app/features/diagnostic/qbv2-planner.ts`, `qbv2-coverage.ts`, `qbv2-overall.ts` | Add golden-persona coverage assertions or planner material-evidence requirements for applicable dimensions before exposing a strong percentage; preserve non-applicable exclusion | Reduces high-score volatility and improves representativeness without business fixtures | Longer routes; route budget pressure; could over-question small businesses | Full golden-persona suite, route-budget tests, six probes rerun |
| Canonical band vs provisional narrative ambiguity | Cases 5–6 show 71–100 scores but “en desarrollo hasta confirmarla” | `app/features/diagnostic/qbv2-overall.ts`, result copy components | Show canonical band (`BIEN`) separately from provisional/confidence qualifier; never make users infer that “en desarrollo” is the global band | Aligns percentage, band and confidence semantics | Copy/UI regression and translation consistency | Result snapshot tests and PDF/UI parity tests |
| Missing hints/explanations | Repeated IDs across all six paths, e.g. `q2_customer_buyer`, `q2_regularity`, `q2_demand_trend` | `app/features/diagnostic/qbv2-copy.ts`, question definitions, question-step UI | Audit every runtime question for a short hint and “qué significa / por qué importa” help, or document intentional exceptions | Reduces answer ambiguity and improves calibration quality | More copy; possible route height changes | Question-bank copy validation and browser evidence audit |
| Recommendation overlap for mature B2B | Case 5 already has website, forms, CRM, pipeline and follow-up, but first recommendation is Landing pages / Barrio | `qbv2-recommendations.ts`, `qbv2-offerings.ts`, evidence mapping | Require a direct unmet capability before recommending an equivalent existing capability; keep answer unchanged | More credible next steps | Could suppress useful optimization recommendations | Golden B2B recommendation tests |

No correction was implemented during this audit.

## Artifacts

- `PREFLIGHT.md`
- `case-01-reparaciones-rapidas/case-01.md`
- `case-01-reparaciones-rapidas/result.pdf`
- `case-01-reparaciones-rapidas/result.png`
- `case-02-maria-pena-fotografia/case-02.md`
- `case-02-maria-pena-fotografia/result.pdf`
- `case-02-maria-pena-fotografia/result.png`
- `case-03-vitalcare/case-03.md`
- `case-03-vitalcare/result.pdf`
- `case-03-vitalcare/result.png`
- `case-04-mercado-verde/case-04.md`
- `case-04-mercado-verde/result.pdf`
- `case-04-mercado-verde/result.png`
- `case-05-axispro/case-05.md`
- `case-05-axispro/result.pdf`
- `case-05-axispro/result.png`
- `case-06-nativa-home/case-06.md`
- `case-06-nativa-home/result.pdf`
- `case-06-nativa-home/result.png`
