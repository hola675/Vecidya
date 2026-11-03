# Diagnóstico V9 — TAX-CLASS: valores literales de q2_sector y puente versionado

Versión 0.1.0 · 2026-10-31 · PLAN_ONLY / CLASS-02 PARCIAL

## Fuentes verificadas
- app/features/diagnostic/qbv2-reviewed-classification.ts, blob 8807cbe1b920923e667b7afb9b64df350b35ae95 (q2_sector reviewed v2).
- app/features/diagnostic/qa03b/specialty-candidate-bank.ts, blob 0bc44cddc1dc2f03230bd5ece30847fce984a12b (candidato v4).
- app/features/diagnostic/taxonomy.ts, blob b95dc3d8ec8cb17b4b6c2df4a57be7115bb806e6.

## Inventario comprobado
El módulo reviewed declara 14 valores específicos más other (15). El candidato QA03B v4 conserva esos valores, excluye temporalmente other al construir el array, añade cuatro valores y reintroduce other. El resultado esperado por lectura es 19 opciones, pero no se ejecutó el banco ni se validó su unicidad.

| Valor reviewed | Permanece en v4 | Interpretación de diseño (NO migración ejecutada) |
| --- | --- | --- |
| health_wellness | sí | actividad salud/bienestar; no implica licencia |
| beauty_personal_care | sí | actividad estética; revisar nichos de mascotas |
| legal | sí | actividad legal; no implica credencial confirmada |
| financial_tax_insurance | sí | actividad financiera/fiscal/seguros |
| professional_services | sí | servicios profesionales; no asignar comprador B2B automáticamente |
| home_services | sí | actividad de servicio al hogar |
| automotive | sí | actividad automotriz |
| real_estate | sí | actividad inmobiliaria |
| food_hospitality | sí | actividad alimentos/hospitalidad |
| retail | sí | comercio minorista; no implica ecommerce |
| education_coaching | sí | educación y acompañamiento |
| creative_media | sí | servicios creativos; no confundir con creator |
| technology_software | sí | actividad tecnológica; no implica SaaS/B2B |
| community_social | sí | actividad comunitaria/social/cultural |
| other | sí | actividad no clasificada; conservar declaración explícita |

## Valores añadidos solo al candidato v4
| Valor | Etiqueta literal de candidato | Riesgo de clasificación |
| --- | --- | --- |
| ecommerce | Comercio electrónico y tiendas online | Canal/modelo, puede coexistir con retail |
| creator | Creadores de contenido y proyectos basados en audiencia | Modelo de monetización, no necesariamente sector |
| b2b_services | Servicios especializados para empresas y organizaciones | Tipo de comprador y actividad mezclados |
| nonprofit_community | Organizaciones sin fines de lucro y proyectos comunitarios | Naturaleza de entidad, no prueba donaciones |

## Contrato propuesto para puente compatible
Conservar siempre (questionId=q2_sector, questionVersion, sourceValue) como declaración histórica. En una migración futura, almacenar atributos derivados solo cuando la fuente los respalde: activityGroup, commercialModel, operatingChannel, entityNature, operationalStage, buyerType. Cada atributo derivado debe registrar provenance, confirmationStatus y migrationVersion; no transformar un valor ambiguo en certeza.

- q2_sector=retail no demuestra operatingChannel=ecommerce.
- q2_sector=ecommerce sí declara canal comercial online, pero no confirma que el checkout esté funcionando.
- q2_sector=b2b_services sugiere comprador empresarial, pero no confirma proceso B2B ni etapa.
- q2_sector=nonprofit_community no confirma membresías ni donaciones.
- q2_sector=creator no implica que tenga audiencia monetizada.
- other no produce un sector específico ni se puntúa como debilidad.

## Criterios de cierre
CLASS-02A: verificar 19 opciones/values únicos con test focal del export v4.
CLASS-02B: revisar compatibilidad de versiones intermedias v3 y respuestas históricas reales.
CLASS-02C: enumerar todos los consumidores de sector y validar guardias/fallback.
CLASS-02D: aprobar reglas de confirmación de atributos, unknown y replay.
CLASS-02E: ejecutar C01–C10 y cambios de sector con tests focales cuando estén autorizados.

Estado: inventario literal v2→v4 documentado; no es migración ejecutada ni cierre de TAX-G1. No código, tests, CI ni despliegue.

## Changelog
- 0.1.0: 15 values reviewed y cuatro añadidos en candidato v4, puente propuesto y gates de validación.
