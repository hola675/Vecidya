# V9 — CLASS-01: selectores especializados y coherencia sector-nicho
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Evidencia estática
- qa03b/specialty-candidate-bank.ts: ocho SELECTOR_GROUPS: health_wellness, beauty_personal_care, financial_tax_insurance, home_services, automotive, food_hospitality, technology_software y b2b_services.
- Cada selector se construye desde NICHE_REGISTRY filtrado por group; exige al menos dos nichos, aplica solo si eqV2(q2_sector, group), y produce kind=niche con explicit_declaration al elegir un nicho concreto.
- Los valores selector other y unknown no tienen produces; no fabrican nicho.
- qbv2-engine.ts: las respuestas activas generan señales únicamente mediante produces; las respuestas cuya elegibilidad deja de cumplirse se eliminan del conjunto activo.
- context-resolver.ts: resolveNiche usa declaredNicheId material; resolveNicheGroup combina grupo derivado del nicho y declaración sectorial, detectando conflicting_evidence si hay grupos diferentes.

## Implicaciones para replay
1. Al editar q2_sector, un selector de grupo anterior deja de aplicar y su respuesta no debe seguir generando señales.
2. Si la selección de nicho y la declaración sectorial son inconsistentes, no debe forzarse una clasificación de grupo; la resolución puede quedar en conflicting_evidence.
3. Un selector other/unknown no acredita nicho concreto, aunque el sector principal siga declarado.
4. No todos los 20 sectores V4 tienen selector especializado: ocho grupos lo tienen; ausencia de selector no implica clasificación errónea.

## Matriz focal propuesta (no ejecutada)
- Sector health_wellness + nicho de ese grupo: señales consistentes.
- Sector health_wellness + edición a retail: invalidación de selector previo y eliminación de señal de nicho.
- Sector other/unknown: ningún selector específico elegible.
- Selector other/unknown: nicho concreto sin resolver.
- Grupo declarado y nicho de otro grupo: comprobar conflicting_evidence en resolver, sin asumir que sea alcanzable por UI normal.
- Sector ecommerce/creator/nonprofit_community: no inventar selector donde no existe.

## Estado de cierre
CLASS-01 sigue PARCIAL: revisión de contratos sí, tests focales no ejecutados, censo final de consumidores no certificado. No modificar scoring, rutas, sesiones ni bancos públicos.

## Changelog
0.1.0: trazabilidad selector→señal→resolver y escenarios focales de compatibilidad.