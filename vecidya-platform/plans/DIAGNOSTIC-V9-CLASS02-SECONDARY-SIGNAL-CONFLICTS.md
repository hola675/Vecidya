# V9 — CLASS-02: procedencia secundaria y conflictos de monetización
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Hallazgo focal en plegado de señales
Fuente qbv2-signals.ts blob 3563ae11c8e385067c240c52cfb741192a67ccba, líneas 175–269. La producción monetizationMechanism con slot=primary se asigna a monetizationMechanism y con slot=secondary a secondaryMonetizationMechanism. Ambos son campos escalares que pasan por consider().
El algoritmo ordena entradas por questionId y, ante dos candidatos para el mismo campo, conserva el de procedencia más fuerte. En empate de fuerza, gana el questionId alfabéticamente menor. El orden de inserción de respuestas no decide el ganador. No se conserva en el resultado plegado el listado de candidatos perdedores.

## Matriz focal de conflictos a verificar
| Caso | Comportamiento estático esperado | Riesgo pendiente |
|---|---|---|
| Dos primary distintos, distinta fuerza | Gana el más fuerte | La alternativa queda fuera del contexto plegado |
| Dos primary distintos, igual fuerza | Gana questionId menor | Desacuerdo semántico no se expone como conflicto |
| Dos secondary distintos | Mismo desempate determinista en secondary | Solo queda un secondary |
| Primary y secondary iguales | areIndependent=false | No declarar hybrid |
| Primary y secondary diferentes, ambos débiles derived_fact | areIndependent=false | No declarar hybrid |
| Primary y secondary distintos, ambos >=2, alguno fuerza 3 | areIndependent=true | Revisar independencia real de eventos |
| Sin primary y con secondary | Resolver requiere primary | No asumir modelo principal a partir del secundario |

## Límite de auditoría
El plegado conserva valor y provenance, pero no incluye questionId ganador dentro del objeto Signal final. La trazabilidad completa de contribuciones y descartes necesita una política de registro separada antes de certificar migración V9. No se ha demostrado que existan dos productores reales de monetización en el banco candidato; los casos son escenarios de prueba propuestos, no incidencias reproducidas.

## Próximos gates
1. Censar producciones reales slot=secondary y sus condiciones.
2. Verificar consumidores downstream de businessModel y audienceMonetization.
3. Diseñar pruebas focales de colisión y replay, autorizadas por el plan maestro.
4. No promover CLASS-02 a certificado con solo lectura estática.

## Evidencia adicional
signals.ts blob 13b07991320cff0e6abf05b9d07e7cabcf3288a4 (areIndependent); context-resolver.ts blob d24e50ffdcc2d6e8c27286038e89c1bebf363385 (resolveBusinessModel).

## Changelog
0.1.0: comportamiento de selección por procedencia y matriz de siete escenarios focales.