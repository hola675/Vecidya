# DIAGNOSTIC V9 — MASTER FINALIZATION PLAN
Versión: 1.0.0 | Fecha: 2026-10-29 | Estado: PLAN / NO CERTIFICADO
Repositorio: hola675/Vecidya | Rama única: feat/diagnostic-v9-lex-graph-p1b | PR maestro: #162 | Base: main

## 0. Contrato de ejecución para el agente
Objetivo: sustituir de extremo a extremo el motor V8/QBV2 por Diagnóstico V9 autónomo, con banco, grafo, selección, validación, scoring, informe, recomendaciones, identidad, persistencia, vinculación y seguimiento. No confundir documentos, tests escritos, CI y producción.
- Trabajar SOLO en la rama del PR #162. No abrir PR auxiliares ni modificar main; no hacer merge/deploy ni borrar ramas sin autorización.
- Cada tarea: inspeccionar estado real y SHA, anotar evidencia, implementar el menor cambio seguro, ejecutar pruebas FOCALIZADAS, registrar resultado y riesgos, commit acotado. No usar suite general como rutina. No tocar Aprende, Vecindario, MiniWeb ni GHL fuera de contratos de integración aprobados.
- V8 permanece operativo hasta corte explícito; no eliminar datos históricos, migraciones D1 aplicadas ni mecanismos de rollback.
- No afirmar PASS sin comando/log/commit; no convertir decisiones editoriales en aprobaciones automáticas.
- Si hay cambios concurrentes, detener cualquier operación destructiva y reconciliar con el nuevo HEAD.
- Fuente de verdad: código del HEAD + PR/CI + documentación, en ese orden. Documentos antiguos son hipótesis de auditoría.

## 1. Línea base verificada (consulta 2026-10-29)
PR #162 abierto, draft, rama `feat/diagnostic-v9-lex-graph-p1b`, HEAD `b4974d90b6436ddb26e446f9f04820d3c6fb6386` al momento de consulta; 364 commits y 106 archivos cambiados. Los conteos son volátiles: revalidar.
Inventario editorial histórico: 77 preguntas, 387 opciones, 15 variantes; solo 4 copy revisadas, 4 requieren decisión semántica y 69 preguntas pendientes de revisión humana según documentación de 2026-10-27. Recontar en HEAD antes de cerrar.
Existen migraciones V9 0030–0035 y rutas de runs, eventos, finalización, resultado, claim, estado e historial. Existencia no implica certificación.
Auditoría documental detectó imports de QBV2 en `specialty-candidate-bank.ts`, `specialty-branches-wave1.ts` y sesión `qbv2-session.ts`. Deben confirmarse con inspección actual.
La documentación declara CI focalizada y un run previo exitoso para un SHA anterior; NO constituye PASS del HEAD actual.
Ramas V9 auxiliares comparadas: 13 con 0 commits propios frente al PR maestro. `feat/diagnostic-sector-taxonomy-02` diverge (8 ahead, 373 behind; 13 archivos en comparación). No fusionar sin revisión semántica y de propiedad transversal.
PR abiertos a revisar: #161, #163 (CI auxiliares), #157 (taxonomía transversal), #162 (maestro). PR #156, #159, #160, #164–#172 documentados como supersedidos; verificar estado real antes de actuar.

## 2. Arquitectura objetivo y propiedad
- `v9/contracts`: tipos, versionado de esquema, identidad de pregunta/opción/sector y validadores.
- `v9/bank`: catálogo único canónico, metadata editorial, contexto, evidencia y versiones.
- `v9/graph`: reglas de elegibilidad, dependencias, sustituciones, alcanzabilidad y presupuesto.
- `v9/engine`: planificación adaptativa, validación, scoring determinista, incertidumbre, priorización, explicación.
- `v9/session`: eventos, replay idempotente, snapshots, recuperación, finalización, concurrencia.
- `v9/report`: hallazgos, evidencias, resumen público/identificado, plan de acción y versionado.
- `v9/recommendations`: reglas explicables, Aprende, servicios, licencias, prioridades y catálogo versionado.
- `v9/identity`: anónimo, login/claim, propiedad, permisos, organización e historial.
- `v9/integrations`: adaptadores hacia Aprende, catálogo comercial y CRM externo; el motor NO importa GHL ni catálogos legacy.
Los nombres son una arquitectura objetivo, no rutas existentes obligatorias. Adoptar estructura real si satisface las mismas fronteras. Prohibido importar QBV2/V8 desde el núcleo V9; una migración histórica opcional debe ser adaptador externo aislado.

## 3. Fases, entregables y gates
### F00 — Reconciliación Git y fuente única
Auditar ramas/PR/commits/archivos, decidir INCLUDE/ALREADY_IN_MASTER/SUPERSEDED/OUT_OF_SCOPE/REQUIRES_REVIEW; conciliar taxonomía compartida sin duplicarla. Entrega: matriz trazable con SHA y diff; un PR maestro sin cambios útiles pendientes. Gate: ninguna rama pendiente sin decisión. No cerrar/borrar PR sin evidencia.

### F01 — Mapa de dependencias y contrato de migración
Inventariar TODOS los imports/exports/consumidores: `qbv2-*`, `qa03b-*`, `v9-*`, rutas, flags, D1, cron, UI, informes, pruebas, enlaces y servicios. Clasificar REPLACE/SHARED/ADAPTER/RETAIN_UNTIL_CUT/DELETE_AFTER_CUT. Dibujar grafo dirigido y detectar ciclos. Gate: cada dependencia legacy con consumidor, sustituto, test y criterio de eliminación.

### F02 — Banco editorial canónico
Extraer fichas por pregunta y opción con id estable, texto, ayuda, sector, variante, condición, evidencia, puntuación, neutralidad y versión. Decisión KEEP/REWRITE/REMOVE/ADD/DEFER con justificación y revisión humana. Auditar contradicciones (`unknown`, `none`, `not_applicable`, `not_published`), redundancias, sesgos, accesibilidad y preguntas sin valor diagnóstico. Gate: 100% opciones con decisión; ninguna aprobación implícita.

### F03 — Grafo y recorrido adaptativo
Validar alcanzabilidad, exclusión/sustitución genérica, cambios de sector/nicho, reinicio, replay, ausencia de ciclos, casos sin ventas y negocios en preparación/pausa, sectores y especialidades. Medir carga y presupuesto de 24 interacciones donde aplique sin perder evidencia crítica. Gate: escenarios representativos y negativos focalizados ejecutados y registrados.

### F04 — Motor V9 autónomo
Migrar banco/contratos/reglas de QBV2 a V9 sin arrastrar imports. Selección, validación de opciones, evidencias, scoring, confianza, interpretación y resolución deterministas; proteger versiones y cambios de respuestas. Gate: búsqueda estática sin imports QBV2 en núcleo; pruebas de contrato, scoring, determinismo y rutas PASS sobre SHA final.

### F05 — Resultados e informes
Resumen general útil sin identificación forzosa; informe identificado con evidencias, fortalezas, brechas, prioridades, acciones, explicaciones, límites y versión. No inventar certezas ni afirmar diagnóstico con evidencia insuficiente. Gate: consistencia entre respuestas, score, resumen e informe; snapshots reproducibles y exportación si producto la exige.

### F06 — Recomendaciones y relación con producto
Mapear cada brecha a: (a) acciones gratuitas y artículos de Aprende existentes y publicados; (b) servicios Vecidya; (c) licencias/planes vigentes. Contrato: recommendationId, evidenceIds, why, priority, targetType, targetId/URL, eligibility, catalogVersion, disclosure y fallback. Si falta contenido o catálogo, registrar GAP; no inventar enlaces, precio, oferta ni promesa. GHL es destino opcional de CRM, nunca dependencia de scoring. Gate: recomendaciones justificadas, no comerciales por defecto, sin enlaces rotos ni duplicados.

### F07 — Identidad, vinculación y longitudinal
Verificar sesiones anónimas HttpOnly, claim autenticado, permisos por usuario y organización, concurrencia, idempotencia, historial, recuperación, resultados, vínculo explícito a negocio y seguimiento temporal. Migraciones D1 0030–0035 con pruebas SQLite/D1 y rollback lógico. Gate: no acceso cruzado, no doble claim, no pérdida de resultados y propiedad verificable.

### F08 — Calidad, seguridad, UX y escala
Móvil, teclado/lector, accesibilidad, lenguaje claro, estados de carga/error, privacidad/retención, rate limits, transacciones, límites de payload, consistencia, concurrencia, carga y observabilidad. Pruebas unitarias focales durante desarrollo; E2E V9 y regresión de consumidores en puerta de certificación. Gate: hallazgos críticos/altos resueltos, evidencias vinculadas a SHA.

### F09 — Sustitución y limpieza legacy
Solo tras gates F02–F08: conmutación controlada de rutas/consumidores a V9; buscar referencias residuales, eliminar código V8/QBV2 sin uso, flags, endpoints y pruebas obsoletas; conservar migraciones ya aplicadas y datos históricos. La importación de historiales, si procede, será adaptador opcional aislado. Gate: cero imports legacy activos del diagnóstico nuevo; inventario de borrados y prueba de regresión.

### F10 — Lanzamiento
Staging con migraciones, smoke E2E real, piloto con negocios representativos, monitorización, respaldo/rollback, aprobación explícita, corte a producción, verificación postdeploy y cierre documental. Gate: aceptación registrada, métricas y errores revisados, rollback probado y PR listo para merge según política del repositorio.

## 4. Riesgos y decisiones de producto
R1: pérdida de cobertura al reemplazar preguntas genéricas por especializadas. R2: semántica de respuestas ambiguas que altera puntuación. R3: acoplamiento oculto QBV2. R4: identidad/claim y acceso entre organizaciones. R5: catálogo de recomendaciones desactualizado o comercialmente sesgado. R6: doble fuente de verdad de sectores con Vecindario. R7: pérdida histórica por limpieza prematura. R8: CI antiguo no representativo del HEAD. Cada riesgo requiere test, propietario y evidencia de mitigación.

## 5. Definition of Done global
- Un PR maestro, ramas auxiliares conciliadas, matriz de procedencia cerrada.
- Banco y opciones revisados con decisiones humanas; grafo completo y recorridos certificados.
- Motor V9 autónomo y determinista sin dependencias de ejecución QBV2/V8.
- Informe, Aprende, servicios y licencias con enlaces y elegibilidad verificables.
- Persistencia, identidad, recuperación, organización, historial y seguridad certificados.
- Legacy sin consumidores y retirado de forma segura; migraciones históricas preservadas.
- CI focal y certificación E2E PASS con SHA; staging y producción validados; autorización explícita de merge/deploy.
- Registro de evidencias: `plans/DIAGNOSTIC-V9-EXECUTION-LOG.md` (crear al iniciar sprint, actualizar por tarea).

## 6. Ejecución inmediata
Seguir `plans/DIAGNOSTIC-V9-SPRINT-00.md` de manera secuencial. No iniciar F02/F04 ni limpieza legacy antes de cerrar las puertas del sprint 00.
