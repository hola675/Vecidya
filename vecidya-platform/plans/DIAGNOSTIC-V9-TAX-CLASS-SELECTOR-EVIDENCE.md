# Diagnóstico V9 — TAX-CLASS: evidencia focal del selector de nichos

Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Fuentes comprobadas
- app/features/diagnostic/taxonomy.ts — blob b95dc3d8ec8cb17b4b6c2df4a57be7115bb806e6.
- app/features/diagnostic/qa03b/specialty-candidate-bank.ts — blob 0bc44cddc1dc2f03230bd5ece30847fce984a12b.
- plans/DIAGNOSTIC-V9-TAX-CLASS-COMPATIBILITY.md.

## Hallazgos directos
QA03B_SPECIALTY_SELECTORS_V1 enumera ocho grupos: health_wellness, beauty_personal_care, financial_tax_insurance, home_services, automotive, food_hospitality, technology_software y b2b_services. Cada selector utiliza appliesWhen: eqV2("q2_sector", group). Las opciones de especialidad provienen de NICHE_REGISTRY, más other y unknown. Su rol es clasificación/routing, con evidenceMigration=pending.

QA03B_CANDIDATE_SECTOR_V4 extiende el sector original con ecommerce, creator, b2b_services y nonprofit_community. Esta ampliación está aislada del banco público según la declaración del módulo.

El registro NICHE_GROUP_REGISTRY también distingue legal, professional_services, real_estate, retail, education_coaching, creative_media, community_social y other, entre otros. Que exista un grupo en taxonomy.ts no significa que tenga selector especializado en QA03B.

## Tabla de dependencia comprobada
| Selector | Condición literal |
| --- | --- |
| q2_niche_health_wellness | q2_sector = health_wellness |
| q2_niche_beauty_personal_care | q2_sector = beauty_personal_care |
| q2_niche_financial_tax_insurance | q2_sector = financial_tax_insurance |
| q2_niche_home_services | q2_sector = home_services |
| q2_niche_automotive | q2_sector = automotive |
| q2_niche_food_hospitality | q2_sector = food_hospitality |
| q2_niche_technology_software | q2_sector = technology_software |
| q2_niche_b2b_services | q2_sector = b2b_services |

## Riesgo de migración
Separar modelo B2B de sector sin conservar compatibilidad rompería la condición literal de q2_niche_b2b_services y las ramas que dependen de marketing_agency. Del mismo modo, ecommerce y creator expresan características que pueden coexistir con otras actividades. Los valores históricos no deben sobrescribirse.

## Contrato de diseño pendiente
1. Conservar q2_sector y su versión en el historial.
2. Diseñar atributos explícitos independientes para actividad, canal, modelo, entidad, etapa y destinatario.
3. Mantener un puente de elegibilidad por versión hasta migrar todas las reglas consumidoras.
4. Para other/unknown, permitir fallback genérico y abstención cuando falte evidencia.
5. Comprobar edición de sector, nicho y modelo con replay, sin inferir autorizaciones de contacto.
6. Verificar el resto de consumidores de q2_sector antes de declarar CLASS-01 completo.

## Gates
CLASS-01: PARCIAL — ocho selectores y cuatro adiciones de sector verificados; falta censo exhaustivo de consumidores.
CLASS-02: OPEN — correspondencia completa de valores históricos a atributos.
CLASS-03: OPEN — reglas de sustitución y fallback por escenario.
CLASS-04: OPEN — trazas C01–C10 y edición/replay.
CLASS-05: OPEN — aprobación humana y futura prueba focal.

No se ejecutaron tests, no se cambió runtime, CI, D1, Worker, GHL ni producción.

## Changelog
- 0.1.0: evidencia estática de ocho selectores y sector candidato v4 con SHA de origen.
