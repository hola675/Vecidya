# V9 — CLASS-02: monetización y estado operativo, procedencia literal
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Monetización: fuente heredada verificada
qbv2-reviewed-foundation.ts blob ceb66e18d16a1521bef7f5fa82d74782464866d2, q2_monetization v2 líneas 43–63. qa03b/bank.ts v3 conserva sus opciones y agrega no_revenue_yet sin produces.

| Valor | Produces kind | Valor de señal |
|---|---|---|
| services | monetizationMechanism primary | time_or_project_work |
| goods | monetizationMechanism primary | goods_for_resale |
| commission | monetizationMechanism primary | commission_or_referral |
| audience | monetizationMechanism primary | own_audience_monetization |
| recurring | monetizationMechanism primary | recurring_access |
| mission | monetizationMechanism primary | mission_funded |
| other | monetizationClassification | other |
| unsure | monetizationClassification | unsure |
| no_revenue_yet (v3) | ninguna | kind=none |

Las seis primeras señales tienen provenance=explicit_declaration y slot=primary. other y unsure también producen clasificación explícita, pero no monetizationMechanism. no_revenue_yet no significa desconocido.

## Etapa operativa: fuente QA03B verificada
qa03b/bank.ts blob b4772d73e1d8b5044ba2011088db978c364097f0 define q2_operational_status v1 con appliesWhen=answeredV2(q2_has_customers). Valores: preparing, operating, paused, unknown. Ninguna opción muestra produces. La pregunta aporta una respuesta explícita utilizable por gates eqV2, pero NO una señal material derivada automáticamente. No equiparar el contexto activity (active/prelaunch) con esta respuesta sin verificar el resolvedor correspondiente.

## Efectos de compatibilidad
- q2_monetization v3 cambia appliesWhen a undefined y ofrece variante prelaunch; no significa ingresos efectivos.
- q2_operational_status distingue estado actual de haber tenido clientes antes.
- Las condiciones de QA03B pueden leer q2_operational_status=operating directamente mediante eqV2 sin pasar por una señal.
- No convertir preparing a ausencia de compradores históricos ni paused a cierre definitivo.
- No atribuir ingresos, digitalización ni consentimiento por escoger una categoría de monetización.

## Pendientes focales
Verificar consumidores de monetizationMechanism y q2_operational_status; confirmar política de representación de etapaOperativa y distinción entre respuesta, señal y contexto. CLASS-02 permanece parcial y no aprobado.

## Changelog
0.1.0: nueve valores de monetización y cuatro estados operativos, con distinción explícita entre produces y gates de respuesta.