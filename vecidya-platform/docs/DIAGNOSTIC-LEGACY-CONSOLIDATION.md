# Consolidación del diagnóstico — inventario y retirada controlada

Fecha: 2026-10-18. Estado: EN PROGRESO. No se ha retirado código de producción.

## Objetivo
Consolidar preguntas, motor, interpretación, recomendaciones e informes en una implementación oficial, retirando estructuras antiguas después de migrar consumidores y verificar compatibilidad.

## Dependencias confirmadas
- `app/features/diagnostic/questions.ts`, `scoring.ts`, `legacy-signal-adapter.ts`: estructura histórica. `index.ts` todavía exporta `deriveSignalsFromLegacyContext`.
- `app/features/diagnostic/qbv2-*.ts`: contratos, banco, reglas, scoring, interpretación, recomendaciones y candidato. El nombre no demuestra que sean obsoletos.
- `app/features/diagnostic/qa03b/`: banco, motor y pipeline candidato; su motor importa reglas, contratos y señales QBV2.
- `app/components/diagnostic-flow/`: varios flujos; el índice público exporta `diagnostic-flow.tsx`.
- `tests/unit/diagnostic/`: conservar regresiones mientras se migra.

## Procedimiento obligatorio
1. Localizar consumidores de cada exportación (rutas, componentes, pruebas, endpoints y cargas dinámicas).
2. Elegir versión única del contrato y definir migración para respuestas e informes persistidos.
3. Sustituir imports y rutas activas por el motor unificado; preservar flujos anónimo/identificado, PDF y funnel.
4. Comparar resultados y recomendaciones en casos canónicos y calibración.
5. Ejecutar unitarias, typecheck, build, E2E diagnóstico, MiniWeb y licencias.
6. Borrar solo módulos sin consumidores y repetir pruebas después de cada lote. No eliminar migraciones D1 aplicadas ni datos históricos.

## Restricción
No borrar a ciegas `legacy-signal-adapter.ts`, `qa03b/` ni `qbv2-*.ts`: existen dependencias comprobadas. La limpieza vive en esta rama separada para no reiniciar CI del PR #11 de Fase 00.
