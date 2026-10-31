# V9 — Replay focal de clasificación desconocida y cambio de sector
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Contratos observados
- q2_sector V2: other produce nicheGroupOther=true, provenance explicit_declaration.
- q2_sector V3: unknown sin produces; V4 conserva ambas opciones.
- Los selectores q2_niche_<group> dependen de eqV2(q2_sector, group), y sus opciones concretas producen niche.
- resolveEligibleQuestionsV2 filtra respuestas que dejan de ser elegibles y vuelve a derivar contexto.
- resolveNicheGroup combina señales declaradas de nicho, grupo y other; una discrepancia de grupos puede resolverse como conflicting_evidence.
- parseSessionV3 valida las respuestas contra el banco proporcionado y reconcilia elegibilidad; el fallback de banco es QUESTION_BANK_V2.

## Casos de replay focal (propuestos, NO ejecutados)
| Caso | Entrada | Resultado exigido |
|---|---|---|
| R01 | q2_sector=other | nicheGroupOther=true, sin niche concreto |
| R02 | q2_sector=unknown | sin nicheGroupOther ni nicheGroup inferido |
| R03 | sector=health_wellness y selector nicho válido | nicho declarado y grupo coherente |
| R04 | cambiar health_wellness a retail conservando respuesta antigua de selector | respuesta de selector inactiva, sin señal niche obsoleta |
| R05 | cambiar health_wellness a unknown | selector inactivo; ninguna clasificación heredada del selector |
| R06 | q2_sector=ecommerce restaurado contra banco V3 | rechazo o política explícita de migración; nunca reinterpretar como retail |
| R07 | q2_sector=other restaurado en banco que conoce el valor | conserva señal other, no unknown |
| R08 | nicho declarado incompatible con grupo explícito en entrada artificial | conflicto visible, no resolución silenciosa |

## Bloqueos y límites
No hay ejecución ni resultado PASS. Las expectativas son criterios propuestos; requieren aprobación y test focal sobre banco y motor concretos. No se autoriza migración, deploy ni cambio de scoring. CLASS-01 permanece PARCIAL.

## Changelog
0.1.0: ocho escenarios de replay semántico y compatibilidad de sesión.