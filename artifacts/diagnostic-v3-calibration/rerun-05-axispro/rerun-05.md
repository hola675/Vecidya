# DIAG-V3-CAL-RERUN-05 — AxisPro

## 1. Pre-flight

- Branch: `main`
- HEAD: `a4a31ae` (`chore: ignore generated assets`)
- Working tree: existing FIX-03A/B/C/D changes remain local/uncommitted; no new source changes were made during this run.
- Application: `0.6.0`
- Planner: v2
- Session schema: 2 (`vecidya.diagnostic.v3.session.2`)
- Persisted question-bank version: v1; runtime adaptive bank: `QUESTION_BANK_V2`.
- Scoring: v1
- Overall index: v2
- Methodology: 3.0
- Hard cap: 24
- FIX-03A/B/C/D state remains as expected in the local diff.

No commit, push, deploy, migration, secret or remote change was made.

## 2. Environment reset

Before the certified run:

- Worker restarted with `pnpm exec react-router dev --force`.
- Public `/diagnostico` route loaded from the current local bundle.
- `localStorage` and `sessionStorage` cleared.
- Service-worker registrations checked/unregistered; Cache Storage cleared.
- Fresh schema-2 session confirmed.
- No stale-code attempt was used as evidence.
- No discarded diagnostic attempt occurred.

## 3. Frozen baseline

Source: `artifacts/diagnostic-v3-calibration/case-05-axispro/case-05.md`.

- Business: AxisPro Business Solutions
- Type: B2B professional services
- Questions: 21
- Score: 92%
- State: BIEN
- Descriptor: Presencia sólida
- Confidence: Limitada
- Coverage: 6/8
- Historical recommendation: Barrio / Landing Pages

| Dimension | Baseline |
|---|---:|
| Claridad de la oferta | 100% / Limitada |
| Base digital | 100% / Limitada |
| Cómo te encuentran | No evaluado |
| Confianza visible | 100% / Limitada |
| Del interés a la acción | 67% / Media |
| Seguimiento y relación | No evaluado |
| Medición | 83% / Alta |
| Base de trabajo | 100% / Limitada |

## 4. Complete question trace

The full 24-question trace is preserved in `question-trace.md`.

Summary:

- Base: 18
- Material: 3
- Deepening: 3
- Total: 24

The original persona facts were preserved. New answers were conservative:

- Lead source: inbound presence/content, consistent with active Google/LinkedIn, SEO and educational content.
- Sales cycle: sometimes multi-contact, consistent with B2B services without asserting “almost always”.
- Follow-up process: defined process, supported by CRM ownership, stage, next action, nurturing, reactivation and pipeline facts.

## 5. Base/material/deepening breakdown

The route matched the replay prediction: **21 baseline questions + 3 deepening = 24**.

Deepening questions:

1. `q2_b2b_lead_source`: filled Discovery and supported Measurement.
2. `q2_b2b_sales_cycle`: added direct B2B relationship/sales-cycle evidence.
3. `q2_followup_general_process`: resolved the remaining Follow-up gap and supported Base de trabajo.

All three were relevant and non-duplicate.

## 6. High-score stability trace

| Point | Answers | Score/range | Coverage | Confidence | State |
|---|---:|---|---|---|---|
| Primary route | 21 | 92%; possible 68.75–93.75 | 6/8 | Limitada | BIEN/REGULAR still theoretically possible |
| Deepening 1 | 22 | 89% | 7/8 | Limitada | BIEN stable |
| Deepening 2 | 23 | 89% | 7/8 | Limitada | BIEN stable; Follow-up unresolved |
| Final | 24 | 90% | 8/8 | Limitada | BIEN stable; evidence sufficient |

The high global result remained within BIEN after missing Discovery and Follow-up received evidence. The final result did not preserve 92 artificially; the score moved to 90.125 raw.

## 7. Applicability

All eight dimensions were applicable with `applicabilityReason=observed_evidence`.

- Applicable: 8
- Evaluated with reading: 8
- N/A: 0
- Insufficient context: 0
- Unresolved applicable dimensions: 0
- Final coverage: 8/8

No unasked dimension was silently converted to N/A.

## 8. Discovery analysis

Historical state: not evaluated.

New evidence:

- `q2_b2b_lead_source=inbound`.
- Direct evidence: 1.
- Supporting evidence: 0 for Discovery.
- Score: **75%**.
- Confidence: **Limitada**.
- Status: Señales positivas.

The reading is professionally defensible as a directional signal: opportunities arrive through presence/content, but the answer does not establish channel diversity or source performance. No useful Discovery question remained at terminal state.

## 9. Follow-up analysis

Historical state: not evaluated.

New evidence:

- `q2_b2b_sales_cycle=sometimes`.
- `q2_followup_general_process=defined_process`.
- Direct evidence: 2.
- Supporting evidence: 0.
- Score: **100%**.
- Confidence: **Limitada**.
- Status: Señales positivas.

The 100% is not treated as high-confidence proof. The process answer is strong, while the sales-cycle answer is a constraint-level signal; the global result correctly retains Limitada confidence.

## 10. Before/after dimension matrix

| Dimension | Baseline | New | Baseline confidence | New confidence | New evidence | Why changed? |
|---|---:|---:|---|---|---|---|
| Claridad de la oferta | 100 | 100 | Limitada | Limitada | Qualification direct | Unchanged |
| Base digital | 100 | 100 | Limitada | Limitada | Own updated place direct | Unchanged |
| Cómo te encuentran | N/E | 75 | — | Limitada | B2B lead source direct | New reading |
| Confianza visible | 100 | 100 | Limitada | Limitada | Clearly visible authority direct | Unchanged |
| Del interés a la acción | 67 | 67 | Media | Media | Qualification supporting + conversion direct | Unchanged |
| Seguimiento y relación | N/E | 100 | — | Limitada | Sales cycle + defined follow-up direct | New reading |
| Medición | 83 | 79 | Alta | Alta | Three direct measurement signals + lead-source support | Recomputed with current evidence |
| Base de trabajo | 100 | 100 | Limitada | Media | Status visibility direct + follow-up support | Confidence strengthened |

## 11. Global score comparison

- Baseline: **92% BIEN**.
- Final raw: **90.125%**.
- Final displayed: **90% BIEN**.
- Classification: **JUSTIFIED CHANGE**.
- Final descriptor: **Presencia sólida**.

The change is evidence-supported. The final mean is:

```text
(100 + 100 + 75 + 100 + 67 + 100 + 79 + 100) / 8 = 90.125
```

The score decreased because Discovery entered at 75% and Medición recomputed to 79%; Follow-up entered at 100%. The public band remained BIEN.

## 12. 100% dimension audit

| Dimension | Direct | Supporting | Independent concepts | Confidence | Confirmation available? | Terminal state |
|---|---:|---:|---:|---|---|---|
| Claridad | 1 | 0 | 1 | Limitada | No useful confirmation remained | 100% qualified as preliminary |
| Base digital | 1 | 0 | 1 | Limitada | No useful confirmation remained | 100% qualified as preliminary |
| Confianza visible | 1 | 0 | 1 | Limitada | No useful confirmation remained | 100% qualified as preliminary |
| Seguimiento | 2 | 0 | 2 | Limitada | No useful confirmation remained | 100% qualified as preliminary |
| Base de trabajo | 1 | 1 | 2 | Media | No useful confirmation remained | 100% with stronger support |

Four 100% scores still rely on narrow direct evidence. This is the cross-case recurring minor pattern observed in VitalCare, Mercado Verde and AxisPro. The gate prioritized missing dimensions first and stopped only after it reported no useful questions remaining; it did not mechanically ask confirmation questions for every extreme score.

## 13. Fragile-extreme gate review

- At the primary route, Discovery and Follow-up were missing; their questions outranked extreme-score confirmation.
- `q2_b2b_lead_source` and `q2_b2b_sales_cycle` were more material than confirming existing 100% readings because they filled absent dimensions.
- After Discovery was added, the BIEN band was stable but Follow-up remained unresolved, so the planner continued.
- After Follow-up was added, the evidence gate became sufficient and no useful candidate remained.
- No 100% confirmation was blocked by the hard cap; the planner concluded there was no useful confirmation left under its evidence model.

The extreme gate is directionally correct, but the resulting narrow 100% readings remain a documented confidence limitation rather than broad proof.

## 14. Evidence-quality matrix

| Dimension | Directness / diversity | Consistency | Contradiction | Fragility | Confidence |
|---|---|---|---|---|---|
| Claridad | 1 direct | Consistent | None | High | Limitada |
| Base digital | 1 direct | Consistent | None | High | Limitada |
| Descubrimiento | 1 direct | Established but narrow | None | High | Limitada |
| Confianza | 1 direct | Strong visible proof | None | High | Limitada |
| Conversión | 1 direct + 1 supporting | Partial funnel | None | Moderate | Media |
| Seguimiento | 2 direct, one constraint and one process | Compatible | None | High due 100% reading | Limitada |
| Medición | 3 direct + 1 supporting | Strong | None | Low | Alta |
| Base de trabajo | 1 direct + 1 supporting | Strong | None | Moderate | Media |

The final 90% reflects broad 8/8 coverage, but not uniformly deep evidence. The overall confidence remains appropriately Limitada.

## 15. Confidence comparison

- Baseline: Limitada.
- Final: **Limitada**.
- Evidence basis: coverage 1.0, 8 scored dimensions, 3 dimensions at least Media and 1 High.
- Confidence did not improve to Media because five dimensions remain low-confidence, including four 100% readings.
- No confidence inflation occurred from evidence sufficiency or the hard cap.

## 16. Terminal and hard-cap analysis

Final completion:

```json
{
  "terminalReason": "no_useful_questions",
  "hardCapReached": true,
  "evidenceSufficient": true,
  "usefulQuestionsRemaining": false,
  "answers": 24
}
```

This is valid:

- the physical hard cap was reached;
- the evidence gate was sufficient;
- no useful evidence remained;
- terminal reason was `no_useful_questions`, not an absolute-cap limitation.

## 17. Cross-case hard-cap pattern

AxisPro also reached 24, but unlike Mercado Verde it ended with no useful candidates and evidence sufficient. Current comparison:

- VitalCare: 24 / `no_useful_questions` / no useful evidence.
- Mercado Verde: 24 / `absolute_hard_cap_reached` / useful candidates remained.
- AxisPro: 24 / `no_useful_questions` / evidence sufficient / no useful candidates.

`CROSS_CASE_HARD_CAP_PATTERN = NO` for systematic useful evidence being left pending. Only Mercado Verde currently exhibits that specific pattern.

## 18. Deepening information-value assessment

- `q2_b2b_lead_source`: **HIGH** — filled Discovery and stabilized the global band.
- `q2_b2b_sales_cycle`: **MEDIUM/HIGH** — filled the relationship signal and narrowed remaining uncertainty.
- `q2_followup_general_process`: **HIGH** — filled Follow-up and completed the evidence gate.

No LOW or NONE deepening question was observed.

## 19. Current recommendations observed

- Priority: **Lograr que más interés llegue a contratar**.
- Service: **Landing pages**.
- License: **Barrio**.
- No addon displayed.
- Rationale: conversion remains the primary friction and matches the selected goal/focus.

This output was recorded only. Commercial correctness was not judged in this calibration.

## 20. Result narrative

Rendered global result:

- **90%**
- **BIEN**
- **Presencia sólida**
- Confidence: **Limitada**
- Coverage: **8/8**

The narrative is semantically aligned with the public band. It says the result is a strong but preliminary reading due limited evidence; it does not downgrade BIEN to “Presencia en desarrollo”. No FIX-01-style contradiction was observed.

## 21. Desktop/mobile validation

At 390px:

- horizontal overflow: false;
- canonical title present;
- public state: BIEN;
- descriptor: Presencia sólida;
- confidence displayed separately: Limitada;
- 8/8 coverage visible;
- no technical reason codes;
- no broken result cards.

Desktop result captured at 1366px.

## 22. PDF validation

- Generated with the accepted Playwright `page.pdf()` fallback.
- Page count: **3**.
- Web/PDF facts match: 90%, BIEN, Presencia sólida, Limitada, 8/8.
- Dimension values, priorities and recommendations present.
- Three report sheets checked; no horizontal or vertical overflow.
- No clipping, overlap, missing content, wrong status or confidence contradiction observed.
- Native print UI remains uncertified.

## 23. Environment observations

- Worker restarted before the certified run.
- Browser storage and Cache Storage cleared.
- No stale-code attempt or discarded diagnostic run.
- Report console: 0 errors and 0 warnings.
- No environment issue affected the certified diagnostic result.

## 24. Calibration findings by severity

### BLOCKER

None. The high-result narrative correctly renders BIEN / Presencia sólida and does not contradict the band.

### MAJOR

None. Discovery and Follow-up were evaluated, evidence became sufficient, and no useful question remained.

### MINOR

- Four 100% dimensions still rely on one narrow direct observation and remain Limitada. They are explicitly presented as preliminary.
- Confidence remains Limitada despite 8/8 coverage because five dimensions are low-confidence.

### OBSERVATION

- AxisPro confirms a strong result can remain defensible after adding missing dimensions: 92% → 90%, still BIEN.
- The hard cap was reached with `no_useful_questions`, not because useful evidence was blocked.
- PDF remained three pages.

## 25. Acceptance questions

A. **¿Fueron relevantes todas las preguntas?** Sí. Las 24 preguntas correspondieron al contexto B2B, medición, conversión, descubrimiento y seguimiento.

B. **¿Fueron de alto valor las deepening?** Sí. Las tres llenaron dimensiones faltantes o resolvieron incertidumbre material.

C. **¿Discovery y Follow-up quedaron adecuadamente evaluados?** Sí: Discovery 75% y Follow-up 100%, ambos con evidencia directa.

D. **¿Quedó alguna dimensión aplicable injustificadamente desconocida?** No. Cobertura final 8/8.

E. **¿El score alto está respaldado por evidencia amplia?** Sí en cobertura; la profundidad es desigual y está reflejada en confianza Limitada.

F. **¿Los 100% están suficientemente apoyados o calificados?** Están calificados correctamente como señales preliminares con confianza Limitada, aunque la fragilidad es un finding recurrente.

G. **¿La confianza es honesta?** Sí: permanece Limitada.

H. **¿El terminalReason es veraz?** Sí: `no_useful_questions`.

I. **¿El hard cap impidió evidencia material?** No. El gate reportó evidencia suficiente y ningún candidato útil restante.

J. **¿Aparece un patrón cross-case de hard cap con evidencia útil pendiente?** No. Solo Mercado Verde mostró ese patrón.

K. **¿El cambio 92% → 90% está justificado?** Sí, por incorporar Discovery 75%, Follow-up 100% y recomputar Medición en 79%.

L. **¿La narrativa coincide con BIEN/REGULAR/MAL?** Sí: BIEN / Presencia sólida.

M. **¿Web y PDF contienen los mismos hechos?** Sí.

N. **¿AxisPro es más defendible que el baseline?** Sí: pasa de 6/8 a 8/8, incorpora Discovery y Follow-up, conserva el resultado BIEN y mantiene una confianza Limitada honesta.

## 26. Final verdict

**PASS WITH FINDINGS**

No se modificó código durante la calibración. No hubo commit, push ni deploy. Case 06 queda autorizado después de revisar este informe.

## Artifacts

- `rerun-05.md`
- `question-trace.md`
- `planner-completion.json`
- `session-21.json`
- `session-22` state captured in the browser trace and represented in `planner-completion.json`
- `session-23.json`
- `session-24.json`
- `result-desktop.png`
- `result-mobile.png`
- `result.pdf`
- `report-page.png`
- `report-page-desktop.png`
- `console-errors.txt`

DIAG-V3-CAL-RERUN-05 COMPLETE

STOP.
