# DIAG-V3 — Six-Case Real Browser Calibration Audit

## Executive verdict

Se ejecutaron seis sesiones independientes en el navegador real contra `/diagnostico`, con respuestas honestas y rutas adaptativas no forzadas. Las bandas del porcentaje separaron correctamente los dos casos bajos, los dos casos en desarrollo y los dos casos fuertes: 14%, 32%, 59%, 69%, 92% y 81%. No se observó inflación por clientes offline, tamaño del equipo, antigüedad, etapa o intención futura. La principal reserva es de cobertura: los casos fuertes recibieron lecturas en solo 6/8 y 3/7 áreas aplicables, pero aun así produjeron porcentajes altos. Además, la narrativa dice “en desarrollo” cuando el porcentaje cae en la banda canónica `BIEN`, debido al cap de confianza. Se observaron preguntas sin hint ni explicación de “por qué” en todos los recorridos. Los seis PDFs se generaron mediante fallback Playwright/Chromium, con tres páginas y sin defectos visuales observados; la descarga nativa no fue certificada.

## Environment tested

- Version: 0.6.0
- Branch: `main`
- SHA: `c165f5ba11b8380d7a5310dce185fa3fa9aba21e`
- Route: `/diagnostico`
- Runtime: local `pnpm run dev` Worker runtime
- Runtime question bank: `QUESTION_BANK_V2` (golden + lots A–G)
- Persisted question-bank version constant: 1; runtime adaptive QBV2 bank is not labeled as persisted V3 in the contract
- Planner: `ADAPTIVE_PLANNER_VERSION = 1`, hard cap 24
- Scoring: `CURRENT_SCORING_VERSION = 1`, QBV2 contextual scoring
- Overall/result engine: `OVERALL_INDEX_VERSION = 1`, eight dimensions, bands `<40`, `40–<70`, `>=70`
- PDF: `/diagnostico/informe`; native print action opens print UI, so audit PDFs use the declared Playwright `page.pdf()` fallback

## Six-case matrix

| Case | Expected | Actual | Band | Match | Verdict | PDF |
|---|---|---:|---|---|---|---|
| Reparaciones Rápidas del Sur | 0–40 MAL | 14% | MAL | YES | PASS | YES, 3 pages |
| María Peña Fotografía | 0–40 MAL | 32% | MAL | YES | PASS | YES, 3 pages |
| VitalCare Wellness Studio | 41–70 EN DESARROLLO | 59% | EN DESARROLLO | YES | PASS | YES, 3 pages |
| Mercado Verde Home | 41–70 EN DESARROLLO | 69% | EN DESARROLLO | YES | PASS | YES, 3 pages |
| AxisPro Business Solutions | 71–100 BIEN | 92% | BIEN | YES | QUESTIONABLE | YES, 3 pages |
| Nativa Home Market | 71–100 BIEN | 81% | BIEN | YES | QUESTIONABLE | YES, 3 pages |

## Main scoring findings

- Principal percentage: broadly calibrated and monotonic across the six realities.
- Low cases: 14% and 32% appropriately remain `MAL`; real paid activity and attractive creative work did not create digital-capability points.
- Developing cases: 59% and 69% appropriately remain `EN DESARROLLO`; website/ecommerce foundations were recognized without treating partial automation and fragmented follow-up as mature.
- Strong cases: 92% and 81% fall in `BIEN` under the canonical audit bands. The numeric values are plausible, but route coverage is too sparse to treat either as a fully confirmed ecosystem reading.
- No excessive global zeroing was observed. Dimension zeros in Cases 1–2 were supported by explicit weak answers; no-reading areas were excluded rather than converted to zero.
- No evidence that business context alone awarded capability points. Context changed route and terminology, not a direct visible score contribution.
- No evidence that future intentions awarded points.
- Main concern: equal-weight aggregation over only observed dimensions can make a strong case look very high before all applicable areas are observed. This is `ROUTING` plus `GLOBAL_AGGREGATION`, not a reason to add business-specific fixtures.

## Dimension findings

- Case 1: 0% offer clarity, 25% base digital, 75% discovery, 0% trust, 25% conversion, 0% follow-up; measurement/work base not evaluated. This is semantically coherent for weak presence.
- Case 2: 50% offer/base/trust/conversion, 25% discovery, 0% follow-up/work base; measurement not applicable. Attractive Instagram work did not inflate the ecosystem.
- Case 3: 100% offer/base, 50% trust/conversion, 44% follow-up, 8% work base. This captures the functioning foundation plus manual fragmentation.
- Case 4: 100% offer/base, 50% discovery/trust/follow-up, 60% conversion, 75% measurement. This is a credible ecommerce-in-development profile.
- Case 5: 100% offer/base/trust/work, 67% conversion, 83% measurement; discovery/follow-up not evaluated. The strong score is plausible but overconfident as a whole-ecosystem percentage without broader direct coverage.
- Case 6: 100% conversion, 69% measurement, 75% work base; four other areas were not evaluated and follow-up was not applicable. An 81% overall value from three readings requires a clear provisional qualifier.

## Confidence findings

Confidence is numerically separated from capability and generally behaves correctly: low/narrow evidence produces `Limitada`, repeated measurement evidence can produce `Alta`, and conflicting or partial observations lower confidence. However, the user-facing status cap changes “solid” results to “en desarrollo” while leaving 92%/81% visible. The system needs an explicit two-line distinction: canonical band `BIEN` plus provisional confidence qualifier, rather than one phrase that appears to contradict the percentage.

## Adaptive routing findings

- Routes differed by archetype as intended: local service, creative professional, appointments/wellness, ecommerce, B2B and mature ecommerce did not receive identical paths.
- Case 3 and Case 4 received meaningful developing-system questions.
- Case 5 received only 6/8 applicable readings; Case 6 only 3/7. Strong profiles therefore can finish with a high mean before their full ecosystem is observed.
- Case 6 itself reports that the declared operations friction conflicts with a strong work-base reading. The result surfaces that contradiction instead of silently changing the answer; this is useful evidence, but the route should probe enough adjacent evidence before treating the contradiction as a principal result.
- Route length stayed below the declared hard cap. No route exceeded 24 questions.

## Narrative and recommendation findings

- Cases 1–4 narrative focus and recommendations agree with the selected answers and broad realities.
- Cases 5–6 narrative says the presence is “en desarrollo hasta confirmarla” despite canonical scores in `BIEN`. This is the main presentation defect.
- Case 5 recommends Landing pages / Barrio even though the supplied reality already includes a modern service website, forms, CRM, pipeline ownership and follow-up. It may be an optimization recommendation, but the evidence-to-solution mapping is not sufficiently explicit and should be reviewed.
- No recommendation to create a website was issued for the mature ecommerce case; advanced personalization remained uncredited as required.

## Hint / explanation defect recorded during every run

The browser capture recorded whether each question had a hint and whether it exposed the expandable “¿Qué significa esta pregunta?” explanation. Every case included questions with neither. Repeated examples include `q2_customer_buyer`, `q2_regularity`, and `q2_demand_trend`; other archetype-specific examples appear in each case Markdown. This is classified as `QUESTION_CONTENT` / `UI`. It can affect answer quality because the audit explicitly asks respondents to distinguish current capability from context and intentions.

## PDF findings

All six report views produced three `.rp-sheet` pages. The fallback PDFs matched the UI’s business context, score, dimension sections, priorities and narrative in the same local result state. No clipping, overlap, browser controls, missing major content, unreadable typography or bad page break was observed in the captured outputs. Native application print/download remains unverified because opening the print action blocks the automation context; the artifacts explicitly identify this limitation.

## Defects grouped by root cause

### ROUTING

Strong cases do not collect enough direct evidence across applicable dimensions before completion. Case 6 is the clearest probe: 3/7 readings and 81%.

### GLOBAL_AGGREGATION

The observed-dimension mean is mathematically consistent with the documented model, but it is vulnerable to optimistic coverage when the planner stops after a few strong dimensions. Do not correct with business fixtures; add general coverage gates or material evidence requirements.

### CONFIDENCE

Confidence appropriately falls with sparse coverage, but the cap has a user-facing meaning that is not clearly separated from the canonical band.

### SEMANTIC_NARRATIVE

Cases 5–6 display a high canonical percentage with an “en desarrollo” narrative. The distinction between capability score, evidence coverage and provisional state must be made explicit.

### QUESTION_CONTENT / UI

A recurring subset of questions has no hint and no “porqué”. Full IDs and exact options are in every case file.

### RECOMMENDATIONS / SOLUTION_MAPPING

Case 5 may receive an overlapping landing/CRM-oriented recommendation despite a mature existing B2B stack. Review direct capability evidence before changing offers.

### PDF

No rendered defect found. Only the audit method is fallback, not native download evidence.

## Correction recommendation — do not implement during this run

1. Add planner/golden-persona coverage assertions so a high overall percentage cannot rely on a small, favorable subset of applicable dimensions without a clearly provisional output.
2. Present `BIEN` as the canonical band and confidence/coverage as a separate qualifier. Keep the numeric score unchanged unless broader evidence proves aggregation wrong.
3. Fill or deliberately justify hint/help omissions in the active question bank and validate them through browser capture.
4. Recheck mature B2B solution mapping against existing website, CRM and pipeline evidence.
5. Rerun this six-case audit plus the complete golden-persona suite before any scoring change.

No corrections were implemented. No commit, push or deploy was performed.

## Artifacts

See `SUMMARY.md` and the six case directories under `artifacts/diagnostic-v3-calibration/`.

- `case-01-reparaciones-rapidas/case-01.md`, `result.pdf`, `result.png`
- `case-02-maria-pena-fotografia/case-02.md`, `result.pdf`, `result.png`
- `case-03-vitalcare/case-03.md`, `result.pdf`, `result.png`
- `case-04-mercado-verde/case-04.md`, `result.pdf`, `result.png`
- `case-05-axispro/case-05.md`, `result.pdf`, `result.png`
- `case-06-nativa-home/case-06.md`, `result.pdf`, `result.png`

## Final decision

**D — INPUT/Routing Problem**

Secondary: **E — RESULT/PRESENTATION PROBLEM**.

The numeric ordering is healthy, but current route coverage and the score/status presentation require correction before calling the calibration fully healthy.
