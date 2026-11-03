# V9 — CLASS-01: censo focal de consumidores q2_sector en QA03B
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Alcance verificable
Lectura completa de cuatro módulos QA03B en rama feat/diagnostic-v9-lex-graph-p1b. No es un censo exhaustivo del repositorio ni de consumidores externos; el buscador GitHub indexa rama predeterminada y no sustituye el barrido de la rama de trabajo.

## Módulos y coincidencias textuales
| Archivo | Blob SHA | Referencias q2_sector |
|---|---|---:|
| qa03b/specialty-branches-wave1.ts | 12e14f8dc7bd4450ebbcf2b0fb9d02dac033096e | 6 |
| qa03b/recovery-wave2.ts | 59fe5898cc98ba243b4c898b027dd22f2c1153c9 | 1 |
| qa03b/specialty-candidate-bank.ts | 0bc44cddc1dc2f03230bd5ece30847fce984a12b | 4 |
| qa03b/bank.ts | b4772d73e1d8b5044ba2011088db978c364097f0 | 3 |

## Gates explícitos observados
- specialty-branches-wave1.ts: food_hospitality (línea 28), b2b_services (35), education_coaching (233), real_estate (261), creative_media (289), retail (317).
- recovery-wave2.ts: creator se activa por monetización audience O sector creator (línea 34); no es exclusivamente sectorial.
- specialty-candidate-bank.ts: ocho selectores usan eqV2(q2_sector, group) (línea 48).
- bank.ts: condición compuesta de sector health_wellness o education_coaching y otros predicados (línea 11).

## Riesgos y verificación restante
1. No confundir coincidencias textuales con cantidad de consumidores independientes: algunas son definición, transformación o documentación.
2. Comprobar rutas de consumidores fuera de QA03B y referencias indirectas a señales nicheGroup/niche antes de declarar censo exhaustivo.
3. Confirmar que nuevos sectores V4 no se pierdan en gates de igualdad literal; creator y b2b_services tienen consumidores explícitos.
4. Verificar casos other y unknown: no activar ramas sectoriales específicas por inferencia.
5. Comparar efectos de migración en session restore y señales, con pruebas focales solo tras autorización.

## Estado
Censo focal de cuatro módulos actualizado; CLASS-01 continúa PARCIAL. Sin ejecución de pruebas, cambios funcionales o despliegue.

## Changelog
0.1.0: inventario de coincidencias y gates literales con SHA y líneas.