# DIAG-V3 Six-Case Calibration — Pre-flight

- DATE: 2026-10-03
- VERSION: 0.6.0 (`vecidya-platform/package.json`)
- BRANCH: `main`
- HEAD: `c165f5ba11b8380d7a5310dce185fa3fa9aba21e`
- WORKING TREE: clean before audit; audit generated only untracked files under `artifacts/`
- ROUTE TESTED: `/diagnostico` (the current browser-exposed adaptive experience; no separate private V3 route was exposed by the current route inventory)
- RUNTIME: local `pnpm run dev` Worker runtime
- QUESTION BANK RUNTIME: `QUESTION_BANK_V2` from `app/features/diagnostic/qbv2-bank.ts` (golden + lots A–G)
- PERSISTED QUESTION BANK VERSION: `CURRENT_QUESTION_BANK_VERSION = 1`; the contract reserves version 2 but it is not the persisted version identifier
- OBSERVED QUESTION SEMANTIC VERSIONS: mostly v1; repository notes `q2_reputation_flow` and `q2_ecommerce_traffic_sources` at v2
- PLANNER: `ADAPTIVE_PLANNER_VERSION = 1`; `ROUTE_BANDS` base 18 / material extension 20 / hard cap 24; routes observed 19–22 questions depending on case
- ROUTING VERSION: `CURRENT_ROUTING_VERSION = 1`
- SCORING VERSION: `CURRENT_SCORING_VERSION = 1`; QBV2 contextual scoring uses direct evidence weight 1, supporting weight 0.5 with a supporting cap ratio 0.5
- RESULT ENGINE: `OVERALL_INDEX_VERSION = 1`; equal-weight mean of applicable dimensions with readings; bands implemented as [0,40), [40,70), [70,100]
- RESULT SCHEMA VERSION: `CURRENT_RESULT_SCHEMA_VERSION = 1`
- DIMENSIONS: eight runtime areas — Claridad de la oferta, Base digital, Cómo te encuentran, Confianza visible, Del interés a la acción, Seguimiento y relación, Medición, Base de trabajo
- PDF IMPLEMENTATION: `/diagnostico/informe`, rendered report has 3 `.rp-sheet` pages and an “Imprimir o guardar PDF” action. Native print UI was not invoked because it blocks the automation context; PDFs were generated with Playwright/Chromium `page.pdf()` as the explicitly identified audit fallback.

## Pre-flight interpretation

The current route is a real adaptive QBV2 flow despite the persisted contract constants still identifying version 1 / diagnostic contract 2.0. This audit records both facts rather than relabeling the runtime as a persisted V3 version. No production code, questions, scoring, remote data, migration, secret, deploy, push or commit was changed.
