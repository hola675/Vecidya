# Diagnóstico V9 — Consolidación de ramas, CI y etapa real

Fecha de corte: 2026-10-27. **Estado: desarrollo candidato; no certificado ni desplegado.**

## Rama y PR único
- Rama de trabajo: `feat/diagnostic-v9-lex-graph-p1b`.
- PR maestro: https://github.com/hola675/Vecidya/pull/162 (draft, base `main`).
- Comparación comprobada antes de este documento: 50 commits ahead, 0 behind de `main` (verificación del 2026-10-27, previa a esta actualización).
- Cerrados como auxiliares/supersedidos, sin merge: #156, #159, #160, #164, #165, #166, #167, #168, #169, #170, #171, #172. No se eliminaron ramas ni historial.
- Las ramas antiguas de CI y recuperación comparadas son ancestros de la rama maestra (0 commits propios pendientes en las 13 ramas comparadas). El cierre de PR no implica borrar sus commits.

## CI
- Workflow: `.github/workflows/main-integration-quality.yml`.
- PR V9: solo pruebas focalizadas de matriz editorial, grafo, banco candidato, ramas, recorridos especializados y propuesta gastronómica.
- Se retiraron del **job CI focalizado** las pruebas obsoletas de compatibilidad de sesión histórica y de identidad de opciones legacy. Los archivos de pruebas históricos se conservan por trazabilidad y no bloquean el motor V9.
- CI del HEAD posterior al cambio: **pendiente de confirmar**. No declarar PASS hasta consultar run y logs.
- El workflow amplio de `main` y PR no V9 se conserva sin alteraciones.

## Evaluación frente al plan DIAG-V9-LEX-GRAPH-04
| Etapa | Estado | Evidencia y falta |
|---|---|---|
| P0 — Inventario y grafo estructural | Implementado en candidato, pendiente de certificación de CI actual | Matriz y auditoría de grafo existentes; 77 preguntas, 387 opciones, 15 variantes en prueba |
| P1 — Léxico y semántica | **En curso, no aprobado** | 4 copy revisadas, 4 requieren revisión semántica, 69 pendientes humanos; revisar 387 respuestas individualmente |
| P2 — Dependencias y rutas | Parcial | Auditoría de grafo, recorridos especializados y pruebas existentes; falta certificación completa de escenarios |
| P3 — Simplificación | Pendiente | No hay evidencia de eliminación sistemática de redundancias y carga cognitiva |
| P4 — Cobertura de huecos | Parcial exploratorio | Recuperación de sectores y especialidades existe; faltan fichas de huecos y aprobación de nuevas preguntas |
| P5 — Certificación integral | Pendiente | No existe motor V9 autónomo certificado ni aceptación end-to-end |

## Siguiente lote de trabajo obligatorio
1. Generar fichas editoriales completas de las 77 preguntas y 387 respuestas desde `buildCandidateEditorialMatrixV9()` (fuente transitoria de inventario).
2. Revisar primero preguntas de clasificación/contexto y luego el resto, con decisiones KEEP/REWRITE/REMOVE/ADD/DEFER, riesgos de léxico y evidencia por respuesta.
3. Documentar huecos por caso de negocio y dependencias del grafo.
4. Implementar banco y motor nuevos independientes de QBV2; las pruebas legacy no son puerta de aceptación.

## Reglas de seguridad
No fusionar PR #162 ni desplegar producción hasta aceptación. No borrar ramas ni pruebas V8. Evitar pruebas generales para PR V9 y mantener commits de alcance focalizado.

## Actualización operativa — 2026-10-27

**Comparación GitHub comprobada:** rama maestra 50 commits por delante y 0 por detrás de `main` antes de este commit. No se ha hecho merge ni despliegue. El número cambia con nuevos commits.

### Trabajo nuevo desde la consolidación
- Corrección de elegibilidad sustitutiva para oferta gastronómica y agencias: la pregunta genérica permanece cuando la especializada no es elegible.
- Corrección equivalente para continuidad odontológica y rebooking genérico.
- Pruebas focalizadas añadidas para regresiones de cobertura de especialidades y para opciones de clasificación (`q2_entity`, `q2_operational_status`, `q2_has_customers`). **Guardadas en GitHub; no declaradas PASS sin ejecución verificable.**
- Registro editorial del lote 01 en `docs/diagnostic-v9-p1-lote-01-clasificacion-y-huecos.md`.
- Propuesta `q2_food_menu_visibility` v2 sigue aislada: `not_published` ≠ `not_applicable`; requiere decisión editorial antes de integrar.

### Próximos hitos y puertas de salida
1. **P1a — Clasificación:** revisar todas las opciones de entidad, historial, estado, sector, objetivo y nicho; documentar decisiones y casos de usuarios/beneficiarios sin ventas. Salida: fichas editoriales y pruebas focalizadas.
2. **P1b/P2 — Cobertura:** comprobar rutas con preparación, operación, pausa, objetivo alternativo, presencia desconocida y nichos; ninguna pregunta genérica desaparece sin reemplazo elegible. Salida: matriz de recorridos y tests ejecutados.
3. **P1c — Banco completo:** revisar las 77 preguntas y 387 opciones con decisiones explícitas; resolver `not_published` y otros valores semánticamente ambiguos. Salida: inventario sin decisiones implícitas.
4. **P3/P4 — Optimización:** reducir redundancia y cubrir solo huecos diagnósticos demostrados; conservar evidencia y objetivo de hasta 24 interacciones cuando aplique.
5. **P5 — Motor autónomo:** contratos, banco, grafo, sesión, selección adaptativa, scoring, recomendaciones e informe V9 sin imports de QBV2; pruebas end-to-end y aceptación antes de corte productivo.

**Bloqueos reales:** CI del HEAD no confirmado; aprobación editorial de preguntas pendiente; banco y motor V9 todavía acoplados a componentes QBV2. No confundir tests escritos con tests ejecutados.
