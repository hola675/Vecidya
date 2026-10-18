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

## Hallazgo de arquitectura: distinguir versión del contrato y motor activo

- `public-diagnostic-engine-identity.ts` define la identidad persistida `diag-v3-public` y declara explícitamente `questionBank: "QUESTION_BANK_V2"`. No debe confundirse con el registro experimental `getQuestionBank(2)` de `qbv2-engine.ts`.
- `qbv2-engine.ts` documenta que su loader experimental no es llamado por el camino público y que `CURRENT_QUESTION_BANK_VERSION` permanece en 1 para ese contrato. **No interpretar esto como prueba de que todo QBV2 sea inactivo**: hay consumidores del banco V2 en el motor público y en QA03B.
- `qa03b/bank.ts` deriva su banco de `REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3` desde `qbv2-reviewed-evidence.ts`; retirar ese archivo sin sustitución rompería el candidato.
- **Decisión de limpieza:** conservar temporalmente compatibilidad de sesiones/reportes históricos y retirar únicamente exports o módulos demostrablemente sin consumidores. No modificar identidad persistida ni puntuaciones silenciosamente.

## Lotes de implementación

- Lote A: mapa de imports y entrypoints, distinción de motor público/candidato y pruebas de equivalencia.
- Lote B: migración de consumidores del contrato anterior al contrato público único, con adaptación versionada para sesiones históricas.
- Lote C: eliminación de adaptadores, rutas y componentes sin referencias; verificación de cero imports residuales.
- Lote D: certificación de respuestas, puntuaciones, recomendaciones, informes PDF, funnel anónimo/identificado y CI transversal.
