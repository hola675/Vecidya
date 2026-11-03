# V9 — CLASS-01: inventario literal y fe de erratas de other/unknown
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Hallazgo correctivo
La documentación previa que describía other y unknown como opciones sin señales necesita precisión: en q2_sector V2, other sí declara produces=[{kind:nicheGroupOther,value:true,provenance:explicit_declaration}]. En q2_sector V3, unknown se añade sin produces. Ambos evitan inferir un nicho concreto, pero NO son semánticamente equivalentes.

## Inventario literal q2_sector
| Valor | Primera versión | Producción |
|---|---|---|
| health_wellness | V2 | nicheGroup=health_wellness |
| beauty_personal_care | V2 | nicheGroup=beauty_personal_care |
| legal | V2 | nicheGroup=legal |
| financial_tax_insurance | V2 | nicheGroup=financial_tax_insurance |
| professional_services | V2 | nicheGroup=professional_services |
| home_services | V2 | nicheGroup=home_services |
| automotive | V2 | nicheGroup=automotive |
| real_estate | V2 | nicheGroup=real_estate |
| food_hospitality | V2 | nicheGroup=food_hospitality |
| retail | V2 | nicheGroup=retail |
| education_coaching | V2 | nicheGroup=education_coaching |
| creative_media | V2 | nicheGroup=creative_media |
| technology_software | V2 | nicheGroup=technology_software |
| community_social | V2 | nicheGroup=community_social |
| other | V2 | nicheGroupOther=true |
| unknown | V3 | ninguna |
| ecommerce | V4 | nicheGroup=ecommerce |
| creator | V4 | nicheGroup=creator |
| b2b_services | V4 | nicheGroup=b2b_services |
| nonprofit_community | V4 | nicheGroup=nonprofit_community |

Las 19 producciones explícitas son heredadas o añadidas en la definición; los 14 sectores V2 y cuatro sectores V4 producen nicheGroup, mientras other produce nicheGroupOther. unknown no produce. Todos los produces citados usan provenance=explicit_declaration.

## Referencias estáticas
- qbv2-reviewed-classification.ts SHA 8807cbe1b920923e667b7afb9b64df350b35ae95.
- qa03b/bank.ts SHA b4772d73e1d8b5044ba2011088db978c364097f0.
- qa03b/specialty-candidate-bank.ts SHA 0bc44cddc1dc2f03230bd5ece30847fce984a12b.
- context-resolver.ts: declaredNicheGroupOther=true es un candidato explícito de grupo other; unknown no tiene esa señal.

## Impacto en aceptación
Corregir A03: other debe producir nicheGroupOther=true, unknown ninguna señal. Ambos deben permanecer sin nicho concreto; comprobar resultado de resolveNicheGroup para cada uno. Los tests no han sido ejecutados. La afirmación anterior de 'other sin produces' queda reemplazada por este documento.

## Changelog
0.1.0: inventario literal de 20 valores y corrección de la semántica other/unknown.