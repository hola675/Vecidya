# V9 — Censo focal de consumidores de q2_sector
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Fuentes y SHA de archivo
- qa03b/specialty-candidate-bank.ts: 0bc44cddc1dc2f03230bd5ece30847fce984a12b
- qa03b/specialty-branches-wave1.ts: 12e14f8dc7bd4450ebbcf2b0fb9d02dac033096e
- qa03b/recovery-wave2.ts: 59fe5898cc98ba243b4c898b027dd22f2c1153c9
- qa03b/bank.ts: b4772d73e1d8b5044ba2011088db978c364097f0

## Dependencias verificadas
1. specialty-candidate-bank.ts: ocho selectores q2_niche_* usan eqV2(q2_sector, group); q2_sector candidato v4 agrega ecommerce, creator, b2b_services y nonprofit_community.
2. specialty-branches-wave1.ts: foodSpecialistEligible exige sector food_hospitality y nicho restaurant/cafe/food_truck; agencySpecialistEligible exige sector b2b_services y nicho marketing_agency. Ambos participan en el gate de sustitución de oferta genérica.
3. specialty-branches-wave1.ts: cinco ADD condicionan por sector education_coaching, real_estate, creative_media y retail, además de otros requisitos; la quinta ADD nonprofit utiliza otros criterios de entidad/misión. No deducir equivalencia entre ellas.
4. recovery-wave2.ts: creator usa monetización audience O sector creator, junto a operación e historial; no se puede eliminar esa compatibilidad sin revisar la rama.
5. qa03b/bank.ts: existe override de q2_sector y un consumidor contextual de sectores health_wellness/education_coaching.

## Matriz de migración a completar
| Consumidor | Valor sector que utiliza | Protección exigida |
| --- | --- | --- |
| 8 selectores de nicho | 8 grupos declarados en SELECTOR_GROUPS | Puente oldValue/version a atributo confirmado |
| Especialista gastronómico | food_hospitality | Mantener elegibilidad y fallback genérico |
| Especialista agencia | b2b_services | Preservar marketing_agency y comprador B2B |
| ADD educación | education_coaching | No confundir inscripción con intake profesional |
| ADD inmobiliaria | real_estate | No sustituir V3 de professional_intake_flow sin paridad |
| ADD creativo | creative_media | Brief no implica digitalización |
| ADD retail | retail | Venta presencial y checkout online independientes |
| Wave2 creadores | creator o monetización audience | No forzar sector único ni puntuar audiencia por defecto |
| Banco QA03B | health_wellness/education_coaching | Revisar consumidor contextual antes de migrar |

## Límites de evidencia
Este censo cubre cuatro módulos QA03B inspeccionados y NO es una búsqueda exhaustiva de todos los consumidores del repositorio. La búsqueda global no devolvió resultados fiables para la rama. Falta revisar los módulos reviewed, reglas, planner, tests y otros consumidores antes de cerrar CLASS-01. No se han ejecutado tests ni compilación.

## Gates siguientes
- CLASS-01: PARCIAL; censo focal de cuatro módulos con SHA.
- CLASS-02: OPEN; tabla completa de values antiguos y atributos nuevos.
- CLASS-03: OPEN; evaluar expresiones completas y fallbacks.
- CLASS-04: OPEN; C01–C10, cambios de sector y replay.
- CLASS-05: OPEN; aprobación humana y ejecución focal futura.

## Changelog
0.1.0: consumidores de q2_sector identificados en cuatro módulos y riesgos de migración.
