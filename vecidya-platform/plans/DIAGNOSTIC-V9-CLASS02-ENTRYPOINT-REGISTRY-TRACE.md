# V9 — CLASS-02: censo de entrypoints y registro del banco
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Fuentes y resultado focal
Inspección de qbv2-engine.ts (blob 3ee64669b626c954495d5b194da6e07a42f252d1), context-resolver.ts (d24e50ffdcc2d6e8c27286038e89c1bebf363385), qbv2-signals.ts (3563ae11c8e385067c240c52cfb741192a67ccba) y qbv2-bank.ts (5509c469ffdbabd7d21d2adbf2b89325167467b7).
| Símbolo | Definición | Uso focal confirmado |
|---|---|---|
| foldSignalProductions | qbv2-signals.ts:228 | qbv2-engine.ts:62 |
| resolveDiagnosticContext | context-resolver.ts:446 | qbv2-engine.ts:69 |
| deriveSignalsV2 | qbv2-engine.ts:46 (interno) | qbv2-engine.ts:66 |
| registerQuestionBankV2 | qbv2-engine.ts:134 | qbv2-bank.ts:29 |

## Registro y versión
qbv2-bank.ts ensambla QUESTION_BANK_V2 desde golden filtrado + lotes A–G y llama registerQuestionBankV2. qbv2-engine.ts mantiene un único bankV2 mutable. getQuestionBank(2) devuelve ese banco si está registrado; getQuestionBank(1) devuelve undefined deliberadamente, porque QBV1 usa otros exports. La nota interna de qbv2-engine.ts afirma que ningún camino público llama todavía al loader experimental y que CURRENT_QUESTION_BANK_VERSION sigue en 1; esta afirmación es comentario del código, no verificación exhaustiva del runtime actual.

## Límite importante
La búsqueda remota de código por los nombres de funciones devolvió cero resultados; por tanto, no puede usarse como prueba de ausencia de otros consumidores. El censo anterior es exclusivamente de cuatro archivos leídos. Además, el comentario de qbv2-engine.ts sobre registro desde qbv2-golden.ts parece desactualizado respecto al registro efectivo en qbv2-bank.ts: usar la llamada ejecutable como evidencia, no el comentario.

## Riesgos y próximos gates
1. Completar búsqueda de importadores en todo el árbol, incluidas rutas públicas y tests.
2. Separar ejecución productiva, uso experimental y fixtures de señales inyectadas.
3. Verificar en runtime qué banco se usa en sesión, sin asumir que V9 se activa por existir como export.
4. No cerrar CLASS-02 sin pruebas focales autorizadas ni trazabilidad de productores secundarios.

## Changelog
0.1.0: entrypoints focales, registro mutable y advertencia sobre comentario desactualizado.