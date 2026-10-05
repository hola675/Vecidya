# DIAG-V3-CAL-RERUN-06 — Nativa Home

## 1. Pre-flight

- Branch: `main`
- HEAD: `a4a31ae` (`chore: ignore generated assets`)
- Working tree: existing FIX-03A/B/C/D local changes remain uncommitted; no new source changes were made during this run.
- Application: `0.6.0`
- Planner: v2
- Session schema: 2 (`vecidya.diagnostic.v3.session.2`)
- Persisted question-bank version: v1; runtime adaptive bank: `QUESTION_BANK_V2`.
- Scoring: v1
- Overall index: v2
- Methodology: 3.0
- Hard cap: 24
- FIX-03A/B/C/D state remains in the expected local diff.

No commit, push, deploy, migration, secret or remote change was made.

## 2. Environment reset

Before the certified session:

- Worker restarted with `pnpm exec react-router dev --force`.
- Public `/diagnostico` route loaded from the current local bundle.
- `localStorage` and `sessionStorage` cleared.
- Service-worker registrations checked/unregistered; Cache Storage cleared.
- Schema 2 confirmed after starting the session.
- No stale-code attempt or discarded diagnostic run occurred.

The Playwright browser page was lost after the certified result during the later screenshot transition. The certified session had already been persisted and captured in `session-23.json`; exact-answer Chrome fallback was used only to regenerate desktop/report/PDF artifacts.

## 3. Frozen baseline

Source: `artifacts/diagnostic-v3-calibration/case-06-nativa-home/case-06.md`.

- Business: Nativa Home Market
- Baseline questions: 18
- Baseline score: 81%
- Baseline band: BIEN
- Descriptor: Presencia sólida
- Confidence: Limitada
- Coverage: 3/7 applicable dimensions with readings
- Historical Follow-up: N/A

| Dimension | Baseline |
|---|---:|
| Claridad de la oferta | N/E |
| Base digital | N/E |
| Cómo te encuentran | N/E |
| Confianza visible | N/E |
| Del interés a la acción | 100% |
| Seguimiento y relación | N/A |
| Medición | 69% / Alta |
| Base de trabajo | 75% / Alta |

The historical 81% was computed from only three readings and had a forensic possible range around 35%–92%.

## 4. Complete question trace

The complete 23-question trace is preserved in `question-trace.md`.

Breakdown:

- Base: 16
- Material: 2
- Deepening: 5
- Total: 23

All five deepening questions targeted material gaps rather than preserving the baseline score.

## 5. High-score/range stability trace

| Point | Answers | Score/range | Coverage | Band state | Confidence |
|---|---:|---|---:|---|---|
| Primary route | 18 | 81.33%; range 34.86–92 | 3/7 | MAL–BIEN possible | Limitada |
| Deepening 1 | 19 | 86%; range 43–93 | 4/8 | REGULAR–BIEN possible | Media |
| Deepening 2 | 20 | 88.8%; range 55.5–93 | 5/8 | REGULAR–BIEN possible | Limitada |
| Deepening 3 | 21 | 90.67%; range 68–93 | 6/8 | REGULAR–BIEN possible | Limitada |
| Deepening 4 | 22 | 92%; no range crossing | 7/8 | BIEN stable | Limitada |
| Final | 23 | 93%; no range crossing | 8/8 | BIEN stable | Media |

The old fragile 81% was not accepted as complete. The possible band narrowed as missing dimensions were evaluated, and the final BIEN result is based on complete applicable coverage.

## 6. Applicability matrix

| Dimension | Applicability | Reason | Evaluated? | Score | Confidence | Unresolved? |
|---|---|---|---|---:|---|---|
| Claridad de la oferta | applicable | observed_evidence | Yes | 100% | Media | No |
| Base digital | applicable | observed_evidence | Yes | 100% | Limitada | No |
| Cómo te encuentran | applicable | observed_evidence | Yes | 100% | Limitada | No |
| Confianza visible | applicable | observed_evidence | Yes | 100% | Limitada | No |
| Del interés a la acción | applicable | observed_evidence | Yes | 100% | Media | No |
| Seguimiento y relación | applicable | observed_evidence | Yes | 100% | Limitada | No |
| Medición | applicable | observed_evidence | Yes | 69% | Alta | No |
| Base de trabajo | applicable | observed_evidence | Yes | 75% | Alta | No |

Final: 8 applicable, 8 evaluated, 0 N/A, 0 insufficient context, 0 unresolved.

## 7. Follow-up applicability forensic

Historical Follow-up was N/A, but this was premature because the persona had:

- active ecommerce;
- abandoned-cart flows;
- post-purchase flows;
- repeat-customer targeting;
- operational customer history.

The real route correctly treated Follow-up as applicable. It asked `q2_ecommerce_cart_followup` and received `always`.

Final Follow-up:

- Applicability: applicable.
- Reason: `observed_evidence`.
- Score: 100%.
- Confidence: Limitada.
- Direct evidence: 1.
- Supporting evidence: 0.
- Remaining useful evidence: none.

Stage/starting context did not erase stronger observed ecommerce behavior.

## 8. Missing-dimension analysis

### Claridad de la oferta

- New evidence: `q2_presence_offer_clarity=all_clear` direct plus product discovery supporting.
- Score: 100%.
- Confidence: Media.
- Meaningful evidence: yes.

### Base digital

- New evidence: `q2_ecommerce_product_discovery=yes_easy` direct.
- Score: 100%.
- Confidence: Limitada.
- Meaningful but narrow evidence: yes.

### Cómo te encuentran

- New evidence: `q2_ecommerce_acquisition_dependency=diverse` direct.
- Score: 100%.
- Confidence: Limitada.
- Meaningful evidence: yes, though source performance is not deeply measured.

### Confianza visible

- New evidence: `q2_professional_authority_signals=clearly_visible` direct.
- Score: 100%.
- Confidence: Limitada.
- Meaningful evidence: yes, but one direct observation.

The four historical gaps were evaluated rather than silently excluded.

## 9. Before/after dimension matrix

| Dimension | Baseline applicability | New applicability | Baseline | New | Baseline confidence | New confidence | New evidence | Why changed? |
|---|---|---|---:|---:|---|---|---|---|
| Claridad de la oferta | no reading | applicable | N/E | 100 | — | Media | Offer clarity direct + discovery support | New evidence |
| Base digital | no reading | applicable | N/E | 100 | — | Limitada | Product discovery direct | New evidence |
| Cómo te encuentran | no reading | applicable | N/E | 100 | — | Limitada | Diverse acquisition direct | New evidence |
| Confianza visible | no reading | applicable | N/E | 100 | — | Limitada | Authority signals direct | New evidence |
| Del interés a la acción | applicable | applicable | 100 | 100 | historical limited | Media | Checkout direct + discovery support | Unchanged score; stronger support |
| Seguimiento y relación | N/A | applicable | N/A | 100 | — | Limitada | Always follow up abandoned carts direct | Corrected applicability |
| Medición | applicable | applicable | 69 | 69 | Alta | Alta | Four direct signals | Unchanged score |
| Base de trabajo | applicable | applicable | 75 | 75 | Alta | Alta | Four direct/supporting operational signals | Unchanged score |

## 10. Score and band comparison

- Baseline: **81% BIEN**.
- Final raw/displayed score: **93% BIEN**.
- Classification: **JUSTIFIED CHANGE**.
- Descriptor: **Presencia sólida**.

The final score is:

```text
(100 + 100 + 100 + 100 + 100 + 100 + 69 + 75) / 8 = 93
```

The increase is evidence-driven, not a preservation of 81%. Five new applicable readings entered the model, including the correction of Follow-up from N/A to applicable.

## 11. Conversion 100% audit

- Direct evidence: `q2_ecommerce_checkout_friction=rarely`.
- Supporting evidence: `q2_ecommerce_product_discovery=yes_easy`.
- Independent concepts: 2.
- Score: 100%.
- Confidence: Media.
- Confirmation available: no useful confirmation remained at terminal.
- Confirmation asked: no separate mechanical confirmation.
- Remaining useful confirmation: none.

The 100% is materially better supported than a single narrow observation, but it remains an extreme reading and is qualified by dimension confidence.

## 12. Measurement review

- Baseline: 69% / Alta.
- Final: 69% / Alta.
- Direct evidence: 4.
- Supporting evidence: 0.
- Evidence: cart visibility, source confidence, approximate outcome tracking and regular period comparison.
- Contradictions: none.
- Remaining useful evidence: none.

The new acquisition question supports Measurement but does not change the established 69% reading.

## 13. Base de trabajo review

- Baseline: 75% / Alta.
- Final: 75% / Alta.
- Direct evidence: 2 (`shared_system`, `most_automated`).
- Supporting evidence: 2 (`scattered_info`, `sometimes_lost`).
- Operational interpretation: strong central system and automation, with known handoff/information weaknesses.
- Contradiction: the operations friction answer remains visible, but it does not invalidate the broader strong operational base.
- Remaining useful evidence: none.

## 14. Evidence-quality review

| Dimension | Direct/supporting | Diversity | Contradictions | Fragility | Confidence |
|---|---|---|---|---|---|
| Claridad | 1 direct + 1 supporting | 2 concepts | None | Moderate | Media |
| Base digital | 1 direct | Narrow | None | High | Limitada |
| Discovery | 1 direct | Narrow | None | High | Limitada |
| Trust | 1 direct | Narrow | None | High | Limitada |
| Conversion | 1 direct + 1 supporting | 2 concepts | None | Moderate | Media |
| Follow-up | 1 direct | Narrow but relevant | None | High | Limitada |
| Measurement | 4 direct | Broad | None | Low | Alta |
| Base de trabajo | 2 direct + 2 supporting | Broad | Operational tension retained | Low | Alta |

Coverage improved meaningfully from 3/7 to 8/8. The added readings were not merely superficial closure, though four 100% dimensions remain narrow.

## 15. Deepening information value

All five deepening questions were **HIGH** information value:

1. Cart follow-up: corrected Follow-up applicability and added direct evidence.
2. Authority signals: filled Trust.
3. Acquisition dependency: filled Discovery and supported Measurement.
4. Product discovery: filled Base digital and supported Clarity/Conversion.
5. Offer clarity: filled Clarity and completed the final unresolved dimension.

No LOW or NONE deepening question occurred.

## 16. Confidence comparison

- Baseline: Limitada.
- Final: **Media**.
- Basis: 8/8 coverage, 4 dimensions at least Media and 2 High.
- Confidence did not become Alta because Base digital, Discovery, Trust and Follow-up each remain narrow single-observation readings.
- The increase from Limitada to Media is evidence-supported.

## 17. Terminal and hard-cap analysis

Final completion:

```json
{
  "answers": 23,
  "terminalReason": "no_useful_questions",
  "hardCapReached": false,
  "evidenceSufficient": true,
  "usefulQuestionsRemaining": false
}
```

The route completed one question below the hard cap, with evidence sufficient and no useful question remaining.

## 18. Cross-case terminal-priority pattern

`CROSS_CASE_TERMINAL_PRIORITY_PATTERN = YES`.

AxisPro and Nativa both satisfy:

```text
evidenceSufficient = true
usefulQuestionsRemaining = false
terminalReason = no_useful_questions
```

This is not a diagnostic failure, but it is an observability finding: completion semantics distinguish sufficiency and no-useful-question state internally while the primary terminal reason consistently selects `no_useful_questions`.

## 19. Cross-case hard-cap assessment

Nativa did not reach the hard cap:

- Nativa: 23 / no useful questions / evidence sufficient.
- AxisPro: 24 / no useful questions / evidence sufficient.
- Mercado Verde: 24 / hard cap / useful candidates remained.

No general pattern of useful evidence being left pending is established. The specific hard-cap limitation remains isolated to Mercado Verde.

## 20. Cross-case fragile-100 pattern

`DOES NATIVA REINFORCE THE CROSS-CASE FRAGILE-100 PATTERN? YES`.

Nativa has four 100% dimensions with only one direct observation:

- Base digital;
- Discovery;
- Trust;
- Follow-up.

They are correctly qualified with Limitada confidence. Clarity and Conversion have supporting evidence and Media confidence. This is recurring non-blocking evidence debt across the calibration set.

## 21. Result narrative

Rendered result:

- **93%**
- **BIEN**
- **Presencia sólida**
- Confidence: **Media**
- Coverage: **8/8**

The narrative is aligned with the result and does not use the old “en desarrollo hasta confirmarla” contradiction. It accurately says the base is solid while Measurement remains the priority for better decision clarity.

## 22. Current recommendations observed

- Priority: **Saber con más claridad qué funciona**.
- Solution type: Medición de origen y resultados.
- Vecidya offering: no specific current offer; user may proceed independently.
- No license/addon shown.
- Rationale: Measurement remains the main limitation and matches the selected goal.

Commercial output was recorded only and not judged.

## 23. Desktop/mobile validation

At 390px:

- horizontal overflow: false;
- canonical title present;
- public status: BIEN;
- descriptor: Presencia sólida;
- confidence displayed separately: Media;
- 8/8 coverage visible;
- no internal reason codes;
- no broken result cards.

Desktop result screenshot was regenerated from the exact captured session after the browser page was lost during the later transition.

## 24. PDF validation

- Generated using accepted Playwright/Chromium `page.pdf()` fallback.
- Page count: **3**.
- Web/PDF facts match: 93%, BIEN, Presencia sólida, Media, 8/8.
- Dimension scores, priorities and recommendations present.
- Three report sheets checked with no overflow.
- No clipping, overlap, missing content, wrong state or confidence contradiction.
- Native print UI remains uncertified.

## 25. Environment observations

- Worker restarted and storage/cache reset before the certified run.
- No stale-code attempt or discarded diagnostic run.
- Browser page became unavailable during post-result screenshot transition; the certified session and mobile result had already been captured.
- Exact session answers were used only for desktop/report/PDF fallback regeneration.
- Console: 0 errors and 0 warnings.

## 26. Findings by severity

### BLOCKER

None. Coverage, applicability and final narrative are coherent.

### MAJOR

None. The old 3/7 incomplete high-score problem was resolved; all applicable dimensions received evidence before completion.

### MINOR

- Four 100% dimensions remain narrow single-observation readings with Limitada confidence.
- Terminal observability repeatedly reports `no_useful_questions` when `evidenceSufficient=true`; this is a cross-case observability debt, not a scoring defect.

### OBSERVATION

- Follow-up N/A was correctly overturned by operational/ecommerce evidence.
- Final score increased from 81% to 93% for evidence-driven reasons.
- PDF remained three pages.
- Base de trabajo preserved a strong 75% reading while retaining operational friction evidence.

## 27. Acceptance questions

A. **¿Desapareció el problema histórico de 3/7?** Sí. Final 8/8.

B. **¿Se evaluaron las cuatro áreas históricamente ausentes?** Sí, con useful evidence: Clarity, Base digital, Discovery y Trust.

C. **¿Follow-up fue corregido defensiblemente?** Sí. Pasó de N/A a applicable por señales ecommerce/operativas y obtuvo 100% con evidencia directa.

D. **¿Stage/starting dejó de dominar la realidad operativa?** Sí. La actividad ecommerce y los flujos de seguimiento prevalecieron correctamente.

E. **¿Las deepening fueron de alto valor?** Sí. Las cinco fueron HIGH.

F. **¿Quedó evidencia útil sin preguntar?** No según el gate final.

G. **¿El score es más defendible que 81%?** Sí. Se basa en 8/8 y evidencia real de las áreas ausentes.

H. **¿El cambio de banda está justificado?** La banda permanece BIEN; el aumento 81% → 93% está justificado por cinco nuevas lecturas.

I. **¿Conversion 100% está apoyada?** Sí, con una directa y una supporting; confianza Media.

J. **¿Measurement y Base de trabajo están apoyadas?** Sí, con confianza Alta y evidencia diversa.

K. **¿La confianza es honesta?** Sí: Media, no Alta, por cuatro dimensiones estrechas.

L. **¿El terminalReason es veraz?** Sí: no useful questions remained.

M. **¿El hard cap constriñó el resultado?** No; finalizó en 23.

N. **¿Refuerza el patrón fragile-100?** Sí, como finding no bloqueante.

O. **¿Web y PDF coinciden?** Sí.

P. **¿El resultado es más defendible que baseline?** Sí, de forma material.

## 28. Final verdict

**PASS WITH FINDINGS**

No se modificó código. No hubo commit, push ni deploy. No se inicia ninguna implementación ni otra fase diagnóstica. El conjunto de seis casos queda listo para revisión agregada de calibración.

## Artifacts

- `rerun-06.md`
- `question-trace.md`
- `planner-completion.json`
- `session-18.json`
- `session-19.json`
- `session-20.json`
- `session-21.json`
- `session-22.json`
- `session-23.json`
- `result-desktop.png`
- `result-mobile.png`
- `result.pdf`
- `report-page.png`
- `report-page-desktop.png`
- `console-errors.txt`

DIAG-V3-CAL-RERUN-06 COMPLETE

STOP.
