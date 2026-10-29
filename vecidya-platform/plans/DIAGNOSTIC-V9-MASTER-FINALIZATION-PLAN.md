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

## 7. Actualización operativa — 2026-10-29 (posterior a línea base)
Esta sección prevalece sobre las referencias históricas de PR/SHAs de las secciones 1 y 6, pero no modifica los gates funcionales.
- MiniWeb V2 PR #184: **fusionado en main** mediante squash `d0410496d9d3a422726d9f11d70c93e6ae72d5df`. Su integración no acredita que MiniWeb V2 esté terminado o certificado.
- PR sectorial #157: **cerrado** tras portar a #162 los seis archivos nuevos de catálogo/selector/pregunta candidata/pruebas y conciliar `business-profile.tsx` y estilos. Los cambios documentales históricos no se copiaron a ciegas.
- PR CI auxiliares #161 y #163: **cerrados**. Las 13 ramas auxiliares V9 comparadas previamente no tenían commits exclusivos frente al maestro; las ramas remotas pueden seguir existiendo.
- PR #162: sigue **abierto, draft, no fusionable automáticamente**. Último commit documentado previo a esta actualización: `4ed18727d803b59d70bc604bec42320b62c68145` (revalidar HEAD antes de escribir).
- Se verificó la incompatibilidad de merge con PR temporal #200 (cerrado sin fusionar). La matriz está en `plans/DIAGNOSTIC-V9-MAIN-SYNC-CONFLICT-MATRIX.md`.
- La comparación identifica nueve archivos modificados por ambas líneas; son **candidatos** a conflicto, no nueve conflictos Git confirmados.
- Se creó respaldo `backup/diagnostic-v9-pre-main-sync-20261029` antes de intentar reconciliación.
- **Bloqueo de F00:** fusionar `origin/main` en la rama V9 mediante Git real y resolución de conflictos en worktree aislado, sin force-push, con pruebas focalizadas y verificación de CI. No fusionar #162 a main ni desplegar.
- El PR #199 de Aprende se observó cerrado en una consulta posterior; no se verificó si fue fusionado. No modificar su ámbito.

**Próximo gate:** F00 no puede marcarse DONE hasta que `main` sea ancestro de la rama V9, se verifiquen pruebas pertinentes y quede evidencia de la conciliación. Después revisar con el responsable F01–F10 antes de iniciar implementación del motor.


## 8. Etapa actual: DISEÑO DEL PLAN MAESTRO — SIN IMPLEMENTACIÓN (2026-10-29)
**Decisión expresa del responsable:** detener cualquier implementación de V9. Desde ahora el único trabajo autorizado es inspección de fuentes, definición funcional, consultas al responsable y edición de documentación del plan. No modificar TS/TSX, SQL, tests, CI, rutas, infraestructura, ni ejecutar merges o despliegues. Esta instrucción prevalece sobre las órdenes de ejecución de F00–F10 y Sprint 00: esas fases son **instrucciones para un agente futuro**, no tareas autorizadas ahora.

### 8.1. Estado del material de planificación
- Este plan v1.0.0 contiene fases F00–F10, arquitectura, gates y Definition of Done, pero **no es todavía una especificación aprobada para ejecución**.
- `plans/DIAGNOSTIC-V9-SPRINT-00.md` describe inventario, reconciliación y mapas; su ejecución queda aplazada.
- `plans/DIAGNOSTIC-V9-PRODUCT-DEFINITION-V1.md` contiene recorrido E0–E5, neutralidad comercial y contrato propuesto con Aprende; pendiente de corroboración del responsable.
- `plans/DIAGNOSTIC-V9-EVALUATION-MODEL-V1.md` identifica ocho dimensiones existentes, propone etiquetas y documenta acoplamientos QBV2; sin calibración aprobada.
- `plans/DIAGNOSTIC-V9-EDITORIAL-LOTE-01.md` documenta primera inspección de ocho preguntas; ninguna decisión editorial se considera aprobada.
- El código `app/features/diagnostic/qa03b/v9-context-semantics.ts` y su test `tests/unit/diagnostic/qa03b-v9-context-semantics.test.ts` fueron incorporados anticipadamente antes de esta instrucción. **No ampliar, integrar ni certificar**; el futuro agente deberá revisar si conservar, adaptar o revertir mediante decisión documentada, nunca borrarlos sin inspección.
- El plan maestro todavía incluye referencias históricas a HEAD/PR; el agente futuro debe revalidarlas antes de actuar.

### 8.2. Cómo se completará este plan antes de autorizar código
**P00 — Inventario del producto actual:** registrar rutas, banco efectivo, grafo, dimensiones, scoring, informes, sesiones, identidad, Aprende, MiniWeb, Vecindario y contratos. Etiquetar VERIFIED/DOCUMENTED/INFERRED/UNVERIFIED. Entrega: matriz fuente→comportamiento→hueco→decisión pendiente. Sin ejecutar tests ni cambiar código durante diseño.

**P01 — Definición del producto con el responsable:** decidir audiencia, resultado esperado, dimensiones, etapas del negocio, anónimo/identificado, límite de preguntas, naturaleza de resultados y tratamiento de incertidumbre. Entrega: acta de decisiones con ejemplos y criterios de aceptación.

**P02 — Revisión editorial integral:** planificar fichas de todas las preguntas, opciones, variantes, evidencias y dependencias; para cada una KEEP/REWRITE/REMOVE/ADD/DEFER, justificación y aprobador. No convertir los ocho análisis iniciales en aprobaciones. Entrega: backlog editorial secuenciado, con casos de prueba propuestos.

**P03 — Arquitectura ejecutable por agente:** por cada fase F00–F10 detallar tareas atómicas con ID, prerequisitos, rutas afectadas, cambios permitidos/prohibidos, contrato de entrada/salida, algoritmo/reglas esperadas, pruebas focalizadas, evidencia, rollback y gate. Separar tareas documentales, migraciones, runtime y release.

**P04 — Integraciones y dependencias externas:** inspeccionar contrato real de Aprende (PR #199 reportado fusionado, pero verificar contenido y estado de producción); MiniWeb, Vecindario, catálogo comercial y GHL. Especificar adaptadores y fallbacks sin modificar otros productos. Registrar supuestos no verificados.

**P05 — Plan de validación y migración:** matriz por escenario (sector/etapa/negocio), unitarias focales por tarea, E2E por gate, aislamiento, persistencia, compatibilidad y criterios de corte V8. Comandos exactos solo tras localizar scripts reales; no inventar PASS.

**P06 — Paquete final para agente:** índice único, instrucciones de lectura, orden de ejecución, tareas pequeñas con dependencias, checkpoints, criterios de parada, decisiones bloqueadas, reporte por commit y definición de DONE. El responsable aprueba el plan **antes** de autorizar la primera implementación.

### 8.3. Plantilla obligatoria de tarea para el agente futuro
`ID | objetivo observable | motivo | fuentes verificadas | dependencias | archivos esperados | instrucciones paso a paso | fuera de alcance | decisiones requeridas | pruebas focalizadas y comando | evidencia esperada | riesgos | rollback | gate | estado`.
Cada tarea debe tener una salida verificable, sin frases ambiguas como «mejorar motor» o «probar todo». Las rutas y comandos se validarán contra el repositorio en el momento de ejecución.

### 8.4. Decisiones que requieren respuesta del responsable
- **Q01 — Resultado:** ¿diagnóstico de madurez digital, de funcionamiento integral del negocio, o ambos claramente diferenciados?
- **Q02 — Usuarios:** ¿se dirige a cualquier negocio/organización/proyecto, o existe una audiencia prioritaria?
- **Q03 — Evaluación:** ¿mantener ocho dimensiones como base, o revisar primero dimensiones y criterios desde cero?
- **Q04 — Experiencia:** ¿priorizar una entrevista breve adaptable (referencia 24 interacciones) o máxima profundidad aunque sea más larga?
- **Q05 — Entrega:** ¿qué ve quien termina anónimamente, y qué beneficios exige crear cuenta/vincular negocio?
- **Q06 — Aprende:** ¿debe recomendar formación gratuita automáticamente por brecha, o presentar recursos solo si el usuario los solicita?
- **Q07 — Monetización:** ¿servicios/licencias Vecidya deben aparecer solo como opción secundaria o también como parte del plan principal, siempre diferenciados?
- **Q08 — Priorización:** ¿impacto, urgencia, esfuerzo, objetivos del negocio o combinación explicable?
Estas preguntas no bloquean continuar el inventario documental, pero sí aprobar el diseño final.

### 8.5. Condición de salida de la etapa de planificación
El plan solo pasa a READY_FOR_AGENT cuando: decisiones Q01–Q08 resueltas o expresamente diferidas con fallback; inventario y brechas documentados; cada tarea tiene dependencias y gate; Aprende y productos adyacentes tienen fronteras; pruebas y rollback están especificados; y el responsable autoriza explícitamente empezar a programar. Hasta entonces, **PLAN_ONLY**.

## Changelog del plan
- **1.1.0 / 2026-10-29:** se añade etapa de planificación exclusiva, revisión de material existente, programa P00–P06, plantilla de tareas, preguntas al responsable y prohibición de implementación hasta autorización explícita. Sin cambios de runtime.


## 9. Decisión de producto D-V9-001 — alcance DIGITAL (aprobada 2026-10-29)
**Fuente de aprobación:** respuesta explícita del responsable: «Para el Plan Maestro de Diagnóstico V9 elijo la opción DIGITAL». **Estado:** APPROVED para el alcance, no para implementación.

### 9.1. Propósito aprobado
Diagnóstico de **madurez digital** para negocios, emprendimientos y organizaciones. Evaluar capacidades y prácticas digitales en relación con contexto, etapa y objetivos. No es auditoría empresarial integral, financiera, fiscal ni contable. La operación se considera solo cuando explica una capacidad o fricción digital, sin crear una puntuación empresarial independiente.

### 9.2. Reglas funcionales que el futuro agente deberá respetar
1. No penalizar automáticamente falta de clientes, ventas, sitio web, anuncios, CRM, local físico o automatización; evaluar aplicabilidad, alternativas reales y etapa.
2. Separar clasificación contextual de evidencia de madurez digital. Preparación, pausa y operación no son puntuaciones.
3. Presentar resultados por dimensión con evidencia, incertidumbre y acciones proporcionales; no afirmar hechos sin respuestas que los respalden.
4. No presentar el diagnóstico como asesoría financiera o auditoría de cumplimiento empresarial.
5. Mantener recomendaciones comerciales opcionales y explícitas; Aprende no condiciona la evaluación.

### 9.3. Dimensiones candidatas: pendientes de validación individual
Se utilizarán las ocho dimensiones existentes como **hipótesis de trabajo**, no como catálogo final aprobado: `clarity_positioning`, `digital_foundation`, `discovery`, `trust_reputation`, `conversion_access`, `relationship_recurrence`, `measurement_optimization`, `digital_readiness`. Antes de aprobar cada dimensión se documentarán: definición, límites, aplicabilidad, ejemplos positivos/negativos, preguntas que aportan evidencia, peso o ausencia de peso, tratamiento de incertidumbre y presentación al usuario.

### 9.4. Tareas documentales derivadas
- **PLAN-P01-01 [DONE]:** obtener decisión del alcance DIGITAL; evidencia: confirmación del responsable 2026-10-29.
- **PLAN-P01-02 [TODO]:** acordar audiencia prioritaria y cobertura de proyectos/organizaciones sin ventas; documentar casos límite.
- **PLAN-P01-03 [TODO]:** revisar y aprobar, modificar o eliminar cada una de las ocho dimensiones; sin modificar código.
- **PLAN-P01-04 [TODO]:** definir niveles/estados del resultado, si habrá puntuación numérica, confianza y evidencia mínima.
- **PLAN-P01-05 [TODO]:** fijar presupuesto de preguntas, condiciones de extensión y experiencia de usuario.
- **PLAN-P01-06 [TODO]:** definir informe anónimo, persistencia/identidad y continuidad.
- **PLAN-P01-07 [TODO]:** acordar priorización, Aprende y posición de servicios comerciales.
- **PLAN-P01-08 [TODO]:** traducir las decisiones aprobadas a tareas atómicas F00–F10, con pruebas focalizadas futuras y gates.

### 9.5. Pregunta siguiente al responsable
¿Debe V9 cubrir desde su primera versión **todos los sectores y etapas admitidos por Vecidya**, incluidos proyectos en preparación, organizaciones sin venta directa y negocios en pausa, o conviene priorizar negocios locales activos y ampliar cobertura después? Registrar como D-V9-002 sin asumir respuesta.

### 9.6. Control de alcance
Esta sección es documentación de producto. **PLAN_ONLY** continúa vigente: no editar implementación, tests, migraciones, CI ni ejecutar operaciones de integración o despliegue. La decisión DIGITAL no autoriza programar.

## Changelog adicional
- **1.2.0 / 2026-10-29:** D-V9-001 DIGITAL aprobada; alcance, límites, tareas documentales y siguiente decisión D-V9-002. Sin cambios de código.


## 10. Decisión de producto D-V9-002 — cobertura completa desde V9 (aprobada 2026-10-29)
**Aprobación expresa:** «cobertura completa desde V9». Estado: APPROVED para el diseño del producto; no autoriza implementación.

### 10.1. Alcance y consecuencias
El diagnóstico de madurez digital debe cubrir desde su primera versión negocios activos, proyectos/emprendimientos en preparación, negocios en pausa, profesionales independientes y organizaciones sin venta directa. No limitar el producto a negocios locales operativos ni diferir las demás etapas a otra versión. La elegibilidad de cada pregunta y la interpretación de la evidencia deben depender de la actividad, el sector, la etapa, la modalidad y la relación comprador/beneficiario, cuando corresponda.

**Aclaración de alcance:** cobertura completa significa que todos los escenarios admitidos deben tener un recorrido válido, resultados útiles y criterios de aceptación antes de declarar V9 listo. No significa que todos respondan las mismas preguntas, que todas las dimensiones sean aplicables ni que se deban inventar observaciones ausentes.

### 10.2. Matriz mínima de recorridos para especificar y certificar en el futuro
| Caso | Contexto | Requisito de resultado | Riesgo a prevenir |
| --- | --- | --- | --- |
| C01 | Negocio local activo con clientes | Evaluación digital y prioridades pertinentes | Exigir web o anuncios como requisito universal |
| C02 | Emprendimiento en preparación sin clientes | Plan de preparación digital sin métricas comerciales ficticias | Confundir expectativa con resultado observado |
| C03 | Negocio en pausa con clientes históricos | Diferenciar capacidad previa de disponibilidad actual | Puntuar actividad histórica como actual |
| C04 | Profesional independiente con marca comercial | Identidad y canales de contacto correctos | Forzar clasificación como empresa constituida |
| C05 | Organización sin venta directa | Distinguir aportantes, compradores y beneficiarios | Equiparar impacto con ventas |
| C06 | Servicios por citas | Evaluar acceso y continuidad cuando aplican | Exigir reservas en línea universalmente |
| C07 | Comercio electrónico | Evaluar descubrimiento, compra y seguimiento según consentimiento | Presuponer carrito, publicidad o consentimiento |
| C08 | Gastronomía con menú aún no publicado | Distinguir no publicado de no aplicable | Convertir preparación en fallo |
| C09 | Actividad híbrida o varios canales | Reconocer combinaciones reales sin doble conteo | Forzar modalidad única |
| C10 | Sector/nicho desconocido o cambiado | Ruta general segura y descarte de respuestas incompatibles | Preguntas inalcanzables o evidencia obsoleta |

Esta matriz es un **mínimo de planificación**; no afirma que los diez recorridos estén implementados o certificados. El inventario del código determinará subcasos sectoriales y de accesibilidad adicionales.

### 10.3. Instrucciones obligatorias para el futuro agente (no ejecutar ahora)
1. Auditar taxonomía compartida y banco efectivo; elaborar matriz sector × etapa × modalidad × audiencia, indicando qué combinaciones son admitidas y cómo se resuelven los casos híbridos.
2. Para cada caso C01–C10, especificar datos iniciales, secuencia esperada, preguntas obligatorias/condicionales, exclusiones, evidencia mínima, dimensiones aplicables, resultado esperado y fallbacks.
3. Comprobar que cada rama del grafo termina en un informe útil sin forzar respuestas ficticias, registro, compra ni enlace de Aprende.
4. Identificar preguntas con dependencia de actividad regular, ventas o historial; diseñar alternativas o estados de insuficiencia sin relajar reglas a ciegas.
5. Definir tests focalizados futuros por caso y un gate de cobertura transversal. Registrar comandos exactos solo tras verificar scripts reales.
6. No considerar DONE una fase si un escenario admitido queda sin ruta, si una dimensión no aplicable recibe puntuación o si un cambio de contexto conserva evidencia inválida.

### 10.4. Impacto en las fases del plan
- **F02:** editorial revisa aplicabilidad y variantes para todos los tipos de actividad.
- **F03:** grafo certifica recorridos completos, cambios de contexto y alternativas.
- **F04:** motor separa evidencia observada, declarada, desconocida y no aplicable.
- **F05:** informes expresan cobertura e incertidumbre contextual.
- **F06:** recomendaciones pertinentes sin imponer soluciones comerciales.
- **F08:** matriz C01–C10 se usa en QA focal y certificación transversal.
- **F10:** no se acepta lanzamiento completo mientras existan escenarios admitidos sin certificación.

### 10.5. Próxima decisión D-V9-003
Definir **cómo se comunica el resultado de madurez digital**: (A) diagnóstico cualitativo por dimensión con evidencias y prioridades, (B) puntuación numérica por dimensión y global, o (C) híbrido con niveles claros por dimensión y números solo donde haya suficiente evidencia. No elegir por defecto; requiere aprobación del responsable y revisión de calibración real.

### 10.6. Estado de planificación
D-V9-001 DIGITAL: APPROVED. D-V9-002 cobertura completa: APPROVED. D-V9-003 presentación y puntuación: PENDING. El resto de decisiones permanece pendiente. **PLAN_ONLY** vigente; ninguna autorización de modificar código, pruebas, CI, base de datos o despliegues.

## Changelog adicional
- **1.3.0 / 2026-10-29:** D-V9-002 aprobada, matriz mínima de diez escenarios, implicaciones por fase y siguiente decisión D-V9-003. Solo documentación.
