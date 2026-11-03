# V9 — Matriz de compatibilidad semántica de q2_sector
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Procedencia estática
- qbv2-reviewed-classification.ts define q2_sector v2, 15 opciones (14 sectoriales + other); las sectoriales declaran produces nicheGroup con provenance explicit_declaration.
- qa03b/bank.ts evoluciona el banco histórico y agrega unknown en q2_sector v3; el valor unknown no declara produces.
- qa03b/specialty-candidate-bank.ts construye q2_sector v4 a partir de QA03B_EDITORIAL_BASE_QUESTIONS_V9, que procede del export de ./bank: conserva valores distintos de other/unknown, agrega cuatro grupos y repone other/unknown.
- Las cuatro adiciones son ecommerce, creator, b2b_services, nonprofit_community, cada una con produces nicheGroup y provenance explicit_declaration.
- Resultado esperado por composición: 15 opciones v2, 16 v3, 20 v4. Es conteo estático, no test ejecutado.

## Compatibilidad por clases
| Clase | V2 | V3 | V4 | Señal |
|---|---|---|---|---|
| 14 sectores originales | sí | sí | sí | nicheGroup explícito heredado |
| other | sí | sí | sí | sin nicho inferido |
| unknown | no | sí | sí | sin nicho inferido |
| ecommerce, creator, b2b_services, nonprofit_community | no | no | sí | nicheGroup explícito nuevo |

## Riesgos y criterios focales
1. Comparar valor, kind, produces y provenance de cada opción heredada, no solo cantidad de opciones.
2. Reproducir v2 other y v3 unknown sin producir nicheGroup; no tratarlos como sector conocido.
3. Comprobar que los cuatro nuevos valores no puedan reanudarse en banco que no los conoce sin migración.
4. Validar que selector de nicho dependa de sector explícito y que cambio de sector invalide selector incompatible.
5. Separar clasificación sectorial de modelo comercial, checkout, madurez y scoring; nicheGroup no acredita esos hechos.
6. Proteger V8 y no asumir activación pública de V9 por la existencia del export.

## Decisión de cierre
CLASS-01 continúa parcial hasta ejecución focal y censo de consumidores. Ninguna migración automática queda aprobada.

## Changelog
0.1.0: matriz v2/v3/v4 con señales heredadas y nuevas, riesgos de replay y criterios de aceptación.