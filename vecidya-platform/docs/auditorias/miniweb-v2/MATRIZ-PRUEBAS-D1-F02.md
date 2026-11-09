# F02 — Matriz de fallos y pruebas D1 (diseño, NO ejecutada)

Fecha: 2026-11-05. Base: main, db/queries/miniweb-v2.server.ts SHA 130a4a7f6054b177543426655f723f43c047dff1 y app/routes/api-miniweb-v2.ts SHA bb1a3702b3ae27b492e99703ecd095cb029fd43b.

## Escenarios de publicación
T-PUB-01: éxito normal [slot=1,snapshot=1,puntero=1]. Verificar slot único, snapshot y puntero.
T-PUB-02: revisión obsoleta con sitio sin slot [1,0,0] si el predicado lo permite. Verificar si queda slot huérfano y cómo afecta al cupo.
T-PUB-03: snapshot insertado pero actualización del puntero afecta cero filas [1,1,0]. Verificar si snapshot inactivo queda persistido y si se ocupa cupo.
T-PUB-04: publicación repetida con slot preexistente [0,0,0]. Verificar respuesta, idempotencia y no duplicación.
T-PUB-05: carrera simultánea de publicación de sitios distintos con un cupo restante. Verificar no sobreventa.
T-PUB-06: excepción SQL en sentencia intermedia. Verificar rollback real del batch.
T-PUB-07: cambio de licencia/capacidad durante publicación. Verificar invariant por titular.

## Escenarios de guardado
T-SAVE-01: éxito [draft=1,site=1].
T-SAVE-02: CAS obsoleto [0,0], sin mutación.
T-SAVE-03: draft actualizado [1] pero site sin cambios [0]; comprobar si queda revisión inconsistente después de batch sin error SQL.
T-SAVE-04: dos editores guardan concurrentemente; solo una revisión debe ganar.

## Creación
T-CREATE-01: crear sitio y borrador inicial con batch; comprobar rollback por excepción.
T-CREATE-02: falla segundo paso de inicialización en action(create), después de crear sitio y borrador revisión cero; comprobar si queda sitio visible sin inicializar y estrategia de recuperación.

## Migración
T-MIG-01: aplicar 0044 y 0045 sobre DB vacía.
T-MIG-02: aplicar 0045 sobre DB con extensión 0044 existente; preservar datos, FK y restricción NOT NULL.
T-MIG-03: verificar orden 0034→0037→0044→0045 contra journal, sin aplicar a remoto.

## Método y criterios
Usar copia local aislada de D1 y pruebas reproducibles. Antes/después: conteo de slots, snapshots, revisión de draft, revisión de site, puntero activo y licencias; registrar SQL, códigos HTTP, SHA, hora, resultado y logs. No declarar PASS hasta ejecutar. No modificar main ni staging/prod sin aprobación.

## Nuevos hallazgos
MW2-029 (P0, investigación): saveMiniWebV2Draft ejecuta batch de dos UPDATE condicionados y comprueba meta.changes al final. Si primer UPDATE afecta una fila y segundo cero, verificar atomicidad lógica; batch no revierte automáticamente por cero filas. Relacionado con MW2-025.
MW2-030 (P1, investigación): action(create) invoca createMiniWebV2Site (batch sitio + borrador revisión cero) y después saveMiniWebV2Draft en otra operación. Si la segunda devuelve conflicto, responde 409 sin limpieza explícita del sitio recién creado. Verificar escenario y recuperación; no afirmar defecto reproducido.

## Pendientes abiertos
- Ejecutar T-PUB-01..07, T-SAVE-01..04, T-CREATE-01..02, T-MIG-01..03.
- Comprobar reproducibilidad de escenarios forzados, fixture y entorno local.
- Localizar workflows y gates; revisar protección de rama.
- Resolver MW2-001, 007, 023, 024, 025, 027, 028 y nuevos MW2-029/030.
- Completar dependencias inversas V1/V2, accesibilidad y certificación DEV.
