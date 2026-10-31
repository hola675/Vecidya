# Diagnóstico V9 — Backlog ejecutable F00–F10 (propuesta)
Versión: 0.1.0 | 2026-10-31 | Estado: PLAN_ONLY / NO AUTORIZADO
Repositorio: hola675/Vecidya | PR #162 | Rama feat/diagnostic-v9-lex-graph-p1b

## Contrato
Este documento convierte el plan maestro y el registro de cierre en tareas verificables **para ejecución futura**. No autoriza escribir código, ejecutar pruebas, merge ni despliegue. No sustituye las decisiones editoriales pendientes.
Fuentes: plans/DIAGNOSTIC-V9-MASTER-FINALIZATION-PLAN.md (1.70.0), plans/DIAGNOSTIC-V9-PLAN-CLOSURE-REGISTER.md (0.2.0), plans/DIAGNOSTIC-V9-PRODUCT-DEFINITION-V1.md y plans/DIAGNOSTIC-V9-EVALUATION-MODEL-V1.md. Revalidar HEAD, archivos y comandos al comenzar cada tarea.

### Invariantes
- Un PR maestro #162; no merge a main ni despliegue sin autorización.
- V8 sigue operativo hasta F09/F10; conservar migraciones y datos históricos.
- Núcleo V9 autónomo sin imports runtime QBV2/V8; GHL opcional.
- Alcance DIGITAL, ES/EN, resumen anónimo e informe con cuenta; no penalizar ausencia de ventas, CRM o web.
- Entrevista adaptativa: 24 turnos objetivo + máximo cinco excepcionales consentidos por evidencia crítica; cada pregunta/aclaración con decisión cuenta, navegación/idioma/consentimiento no.
- Scoring híbrido: números solo con calibración, cobertura y evidencia suficiente; abstenerse si faltan datos.
- Pruebas focalizadas por tarea; E2E/regresión en gates de certificación, con SHA y logs.
- Cambios mínimos; nunca modificar Aprende, Vecindario, MiniWeb, GHL, D1 o infraestructura fuera de contrato aprobado.

## Dependencias y tareas
| ID | Prerrequisito | Entregable observable | Superficie esperada (validar) | Prueba focal / evidencia requerida | STOP / rollback |
| --- | --- | --- | --- | --- | --- |
| F00-01 | autorización de ejecución | Inventario PR/ramas/main/HEAD y matriz INCLUDE/ALREADY/SUPERSEDED/REVIEW | Git + plans/DIAGNOSTIC-V9-MAIN-SYNC-CONFLICT-MATRIX.md | SHA, diff, lista de ramas y PR | Detener ante commits concurrentes o cambios ajenos |
| F00-02 | F00-01 | main ancestro de rama V9, sin pérdida de MiniWeb/Aprende | Worktree aislado, 9 archivos de atención en matriz | conflictos reales, diff, pruebas de archivos afectados y CI | Backup, no force-push; si conflicto transversal, escalar |
| F01-01 | F00-01 | Mapa import/export QBV2/QA03B/V9, rutas y consumidores | app/features/diagnostic, app/routes, db/migrations, tests | grep de imports + tabla consumidor→sustituto→test | No eliminar imports en esta tarea |
| F01-02 | F01-01 | Contrato de separación REPLACE/SHARED/ADAPTER/RETAIN/DELETE | Documento de arquitectura V9 | revisión de ciclos y matriz de eliminación | Bloquear F04 si quedan dependencias desconocidas |
| F02-01 | DEC-C y F01-01 | Inventario exacto 77/82/90, variantes, versiones, opciones ES/EN | qa03b/bank.ts, specialty-branches-wave1.ts, specialty-candidate-bank.ts | validadores focales de IDs/copy/semántica | No migrar pending por conteo |
| F02-02 | F02-01 | Decisión humana KEEP/REWRITE/REMOVE/ADD/DEFER por pregunta y opción | Matriz editorial versionada | 100% de celdas con aprobador, motivo, estado | Si falta aprobación, HOLD por ítem |
| F02-03 | F02-02 | Banco V9 canónico versionado, siete generales directas condicionadas y una de apoyo solo si aprobadas | futuro v9/bank y contratos | unitarias de neutralidad, paridad y versionado | Sin activación de evidenceV3 sin paridad |
| F03-01 | F02-02, F01-02 | Grafo sin ciclos, con sustituciones y fallback genérico | qa03b/v9-candidate-planner.ts, futuro v9/graph | rutas focales por sector/estado/nicho y edición | Si pierde cobertura, restaurar fallback |
| F03-02 | F03-01 | Selector adaptativo con presupuesto 24+5 y consentimiento | futuro v9/engine/selector y UI entrevista | C01–C10, conteo de turnos, abandono y reanudación | No forzar preguntas para fabricar score |
| F04-01 | F01-02, F02-03 | Contratos/banco/scoring V9 sin imports QBV2 | qa03b/v9-candidate-scoring.ts y módulos futuros v9 | búsqueda estática, unitarias determinismo y equivalencia contextual | No modificar scorer público V8 |
| F04-02 | F04-01, DEC-D | Correlación confirmada antes de puntuar, conflicto fail-closed | qa03b/v9-observation-correlation.ts y scorer V9 aislado | mismo evento, eventos independientes, contradicción, unmapped, replay/versiones | No inferir evento desde ID o sector |
| F04-03 | F04-02, DEC-B | Aplicabilidad, scoring y confianza versionados | calibración y motor V9 | casos con 0/1/2 directas, apoyo-only, neutral, prelaunch, no ventas | Abstenerse ante insuficiencia |
| F05-01 | F04-03, DEC-E | Resumen anónimo con explicación breve y sin datos personales | rutas/resultados y report V9 | snapshots ES/EN, privacidad y trazabilidad interna | No exigir cuenta para resumen |
| F05-02 | F05-01, F07-02 | Informe identificado, prioridades y versiones reproducibles | report V9 + persistencia autenticada | snapshots, acceso y replay | Sin acceso cruzado |
| F06-01 | F05-01, DEC-F | Priorización multicriterio y etapas Ahora/Después/Más adelante | recommendations V9 | desempates, dependencias, objetivos confirmados, no plazos inventados | No promesas comerciales |
| F06-02 | F06-01, DEC-G | Adaptador Aprende + catálogo de servicios opcional | integrations V9 | recurso publicado/despublicado, enlace roto, catálogo vacío, fallback | Informe funciona sin Aprende/GHL |
| F07-01 | F01-02, DEC-E | Modelo de sesión anónima, borrador local siete días, privacidad de texto libre | session V9 + UI local | caducidad, exclusión de texto, consentimiento, no PII D1 | No sincronizar borradores anónimos al servidor |
| F07-02 | F07-01 | Claim autenticado, propiedad, organización, historial y seguimiento manual | identity/session + D1 V9 existente | aislamiento, doble claim, concurrencia, idempotencia, rollback lógico | No aplicar migración irreversible |
| F08-01 | F03-02, F05-01, F07-02 | UX premium accesible ES/EN, progreso por hitos, autoavance reversible | UI V9 | teclado, lector, móvil, cambio de idioma, reduced motion | No alterar UI de otros productos |
| F08-02 | F04-03, F06-02, F07-02, F08-01 | Certificación integrada, observabilidad y seguridad | V9 y contratos de consumidores | E2E C01–C10, aislamiento, errores, carga y regresión delimitada | Bloquear F09 si críticos/altos |
| F09-01 | F08-02 + aprobación de corte | Conmutación controlada de consumidores V8→V9 con rollback | rutas y adaptadores diagnóstico | smoke focal, paridad de datos y reversión | Revertir switch si falla |
| F09-02 | F09-01 certificado | Inventario y retiro de legacy sin consumidores | QBV2/QA03B obsoletos, flags y tests | búsqueda referencias, pruebas consumidores y preservación histórica | Nunca borrar migraciones aplicadas |
| F10-01 | F08-02, F09-01 | Staging, migraciones, piloto y rollback probado | entorno staging | E2E real, métricas, logs y aceptación | No prod si no hay aceptación |
| F10-02 | F10-01 + autorización explícita | Corte productivo y verificación postdeploy | producción V9 | smoke real, monitoreo, comparación de resultados, registro de SHA | Rollback definido y ejecutable |

## Gates de decisión antes de tareas
- DEC-A taxonomía definitiva: desbloquea F02-02/F04-03.
- DEC-B calibración/umbrales/confianza: desbloquea F04-03.
- DEC-C banco editorial: desbloquea F02-02/F02-03.
- DEC-D correlación por evento, procedencia y replay: desbloquea F04-02.
- DEC-E informe autenticado, identidad, retención: desbloquea F05-02/F07-02.
- DEC-F priorización y presupuesto: desbloquea F03-02/F06-01; respetar D-V9-004/006/011/018–020.
- DEC-G Aprende/servicios/GHL opcional: desbloquea F06-02.
- DEC-H integración con main, corte y rollback: desbloquea F00-02/F09/F10.

## Criterio de preparación READY_FOR_AGENT
1. DEC-A–H aprobadas o diferidas expresamente con fallback seguro.
2. Matriz editorial y escenarios C01–C10 asignados a tareas, sin afirmar certificación.
3. Cada tarea tiene fuente, alcance, dependencia, prueba focal verificable, evidencia y rollback; los comandos exactos se fijan tras comprobar scripts en checkout.
4. El responsable aprueba iniciar código; PLAN_ONLY deja de aplicar únicamente por instrucción explícita.
5. El agente ejecuta una tarea por vez, reporta commit/SHA/logs y detiene cambios de ámbito o concurrencia no prevista.

## Riesgos de planificación a resolver
- F00 sincronización main puede cambiar rutas y contratos: revalidar tras integración.
- F02 y F04 no son independientes: no puntuar preguntas sin aprobación y paridad.
- F05 informe identificado depende de F07 identidad: preparar esquema sin publicar antes de seguridad.
- F09 limpieza no debe adelantarse a certificación ni confundir migraciones históricas con código muerto.
- Las 13 pruebas focales PASS documentadas corresponden al commit 231fba058803, no a este HEAD ni a aceptación integral.

## Changelog
- 0.1.0 / 2026-10-31: backlog inicial de 23 tareas F00–F10, dependencias, pruebas y stop conditions; solo documentación.
