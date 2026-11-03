# V9 — CLASS-02: conversión literal de monetización y evidencia híbrida
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Fuentes verificadas
signals.ts blob 13b07991320cff0e6abf05b9d07e7cabcf3288a4, líneas 35–83; context-resolver.ts blob d24e50ffdcc2d6e8c27286038e89c1bebf363385, líneas 135–156; qbv2-reviewed-foundation.ts blob ceb66e18d16a1521bef7f5fa82d74782464866d2.

## Tabla canónica de conversión
| MonetizationMechanism | BusinessModel |
|---|---|
| time_or_project_work | services |
| goods_for_resale | products |
| licensed_practice | professional_services |
| commission_or_referral | services |
| own_audience_monetization | creator_audience |
| recurring_access | membership |
| mission_funded | nonprofit |

La tabla de signals.ts contiene siete mecanismos; la pregunta candidata q2_monetization v3 conserva seis mecanismos de ingreso explícitos del banco revisado y opciones de clasificación sin mecanismo. licensed_practice permanece en el banco legado activo hasta la migración R2. No deducir que la tabla equivale exactamente a opciones de una sola versión de pregunta.

## Condición literal de independencia
areIndependent(a,b) exige: ambas señales presentes; valores diferentes; fuerza de procedencia de ambas >= MATERIAL_SIGNAL_STRENGTH (2); al menos una con fuerza 3. La documentación de la función identifica fuerza 3 con explicit_declaration/observed_fact. Dos derived_fact diferentes no bastan.
El context-resolver usa esta condición sobre monetizationMechanism primario y secundario para resolver businessModel=hybrid. Sin mecanismo primario, el resultado no es hybrid.

## Advertencias de compatibilidad
- commission_or_referral mapea a services porque no existe BusinessModel dedicado a comisiones; no equivale a cobro por tiempo.
- nonprofit es una clasificación de modelo por mecanismo mission_funded; no verifica personalidad jurídica.
- creator_audience exige señal de monetización de audiencia; sector creator por sí solo no la produce.
- membership se obtiene por mecanismo recurring_access; no basta seleccionar nonprofit_community.
- licensed_practice no debe confundirse con cualquier profesional o con prueba de licencia válida.
- La evidencia de ingresos futuros en prelaunch no prueba facturación actual.

## Gates restantes
Verificar de dónde se originan señales secundarias, si existen conflictos de procedencia, consumidores de businessModel y casos focales de independencia. CLASS-02 sigue parcial; CLASS-01 no certificado.

## Changelog
0.1.0: siete conversiones literales y condición exacta de independencia, sin pruebas ni cambios de código.