# V9 — CLASS-01: consumidores indirectos de nicho y grupo
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Alcance
Inspección focal de context-resolver.ts, qbv2-engine.ts y qbv2-signals.ts en la rama V9. No constituye barrido exhaustivo del repositorio.

## Cadena indirecta observada
1. Opciones sectoriales emiten kind=nicheGroup, salvo other que emite nicheGroupOther=true y unknown que no emite señales.
2. qbv2-signals.ts mapea kind=niche a declaredNicheId; nicheGroupOther a declaredNicheGroupOther; nicheGroup a declaredNicheGroup.
3. qbv2-engine.ts obtiene declaredNicheId y, si existe, consulta lookupNicheArchetypeHints; pasa esas pistas por separado al resolvedor.
4. context-resolver.ts resuelve NicheId solo desde declaredNicheId material y busca el grupo de nicho en el registro.
5. resolveNicheGroup combina tres fuentes: grupo derivado de nicho conocido, declaredNicheGroupOther=true y declaredNicheGroup material.
6. Si hay dos grupos distintos, devuelve unresolved(conflicting_evidence) y trace de ambas fuentes; si hay un solo valor, resuelve ese grupo.

## Implicaciones semánticas verificadas
- q2_sector=other por sí solo puede resolver nicheGroup=other, sin declarar un NicheId concreto. Por tanto, NO debe documentarse como 'sin grupo' o 'sin señal'.
- q2_sector=unknown sin otra señal material deja el grupo sin resolver, en vez de marcarlo como other.
- Un nicho concreto puede completar un grupo faltante, pero no reemplazar silenciosamente un grupo declarado incompatible.
- Pistas de arquetipo provenientes de nicho son independientes de la declaración de deliveryMode; no acreditan por sí mismas venta o checkout.

## Matriz focal de aceptación pendiente
| Caso | Expectativa del contrato |
|---|---|
| I01 other solo | nicheGroup=other; niche sin resolver |
| I02 unknown solo | nicheGroup sin resolver; niche sin resolver |
| I03 sector conocido solo | nicheGroup sectorial; niche sin resolver |
| I04 nicho de catálogo sin sector | grupo derivado del nicho |
| I05 nicho y sector incompatibles | conflicting_evidence y fuentes visibles |
| I06 cambio de sector | no retener señal de selector que perdió elegibilidad |

## Evidencia y límites
- context-resolver.ts SHA d24e50ffdcc2d6e8c27286038e89c1bebf363385, líneas 206–251.
- qbv2-engine.ts SHA 3ee64669b626c954495d5b194da6e07a42f252d1, líneas 48–69.
- qbv2-signals.ts SHA 3563ae11c8e385067c240c52cfb741192a67ccba, líneas 192–194.
Sin pruebas ejecutadas, cambios funcionales ni despliegues. CLASS-01 continúa PARCIAL.

## Changelog
0.1.0: trazabilidad indirecta de señales a contexto y seis casos focales.