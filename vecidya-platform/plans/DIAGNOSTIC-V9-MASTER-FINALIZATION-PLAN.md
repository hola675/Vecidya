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


## 11. Decisión de producto D-V9-003 — modelo híbrido de resultados (aprobada 2026-10-29)
**Aprobación expresa:** «modelo híbrido, niveles claros y números solo con evidencia y calibración suficiente». Estado: APPROVED para el diseño; no autoriza implementación.

### 11.1. Contrato funcional de resultados
- **Salida comprensible:** comunicar, para cada dimensión aplicable, un nivel cualitativo sustentado, fortalezas, oportunidades, límites de evidencia y próximos pasos.
- **Insuficiencia de evidencia:** si no hay sustento suficiente para un nivel, mostrar «evidencia insuficiente» (etiqueta provisional), sin sustituirlo por nivel bajo, cero o ausencia de capacidad.
- **Salida numérica condicionada:** permitir puntuación por dimensión solo cuando existan reglas de calibración aprobadas, cobertura mínima, validación de aplicabilidad y pruebas de estabilidad. No asumir que el modelo actual cumple estas condiciones.
- **Puntuación global condicionada:** no calcular ni mostrar una nota global hasta aprobar explícitamente agregación, ponderación, tratamiento de dimensiones no aplicables, incertidumbre y umbral de cobertura transversal.
- **Contexto no equivale a desempeño:** estado preparing/operating/paused, existencia de clientes, sector, modalidad o herramientas instaladas no generan una nota por sí mismos.
- **Explicabilidad:** cada conclusión y prioridad debe enlazar evidencia válida, regla y versión; separar observaciones, inferencias y acciones propuestas.
- **Neutralidad:** no aumentar ni reducir puntuaciones por contratar servicios, tener perfil en Vecindario, usar MiniWeb, GHL o consumir Aprende.

### 11.2. Especificación que el agente deberá completar antes de programar
| ID | Tarea de especificación | Salida verificable | Gate |
| --- | --- | --- | --- |
| PLAN-R01 | Definir etiquetas públicas de niveles y sus significados, sin suponer umbrales | Diccionario de niveles con ejemplos por etapa | Aprobación editorial |
| PLAN-R02 | Definir aplicabilidad por dimensión y estado no evaluable | Matriz dimensión × contexto | Ningún no aplicable recibe nota |
| PLAN-R03 | Definir evidencia directa/de apoyo, contradicción y cobertura | Tabla de fuentes y precedencia | Cada conclusión rastreable |
| PLAN-R04 | Definir reglas de suficiencia cualitativa y numérica | Umbrales y justificación por dimensión | Sin números con evidencia insuficiente |
| PLAN-R05 | Auditar calibración y pesos existentes; proponer cambios sin ejecutarlos | Comparación de algoritmos y casos límite | Aprobación técnica/producto |
| PLAN-R06 | Diseñar informe, representación de incertidumbre y prioridades | Maquetas textuales y ejemplos C01–C10 | Comprensible para negocios sin ventas |
| PLAN-R07 | Determinar si existe score global y condiciones de publicación | Decisión explícita y regla de agregación o prohibición | No publicar nota global por defecto |
| PLAN-R08 | Especificar pruebas focalizadas y regresiones futuras | Matriz entrada→resultado esperado | Cobertura de valores desconocidos y no aplicables |

### 11.3. Casos de aceptación obligatorios (a especificar; no ejecutados)
1. Preparación sin clientes: no recibe nota negativa por ausencia de ventas; puede recibir orientación cualitativa cuando exista evidencia.
2. Negocio en pausa con historial: no se presenta actividad histórica como desempeño digital actual.
3. Organización sin compra directa: la ausencia de ventas no perjudica una dimensión digital no comercial.
4. Dimensión no aplicable: no figura como cero ni contamina agregación.
5. Respuestas unknown/unanswered: incertidumbre visible y no convertida en evidencia negativa.
6. Evidencia contradictoria: resultado no afirma certeza injustificada; explica límites.
7. Cobertura parcial: niveles solo donde se justifican; números omitidos cuando no hay calibración suficiente.
8. Recomendación comercial: no altera puntuación, madurez ni prioridad de una acción por sí misma.

### 11.4. Pendientes deliberados
- Etiquetas finales de niveles: los identificadores históricos initial/functional/structured/ready_to_grow/ready_to_scale son referencia técnica, **no aprobados como lenguaje público V9**.
- Umbrales de suficiencia, pesos, confianza, score global y agregación: PENDING.
- Diseño visual de informe y política de persistencia: PENDING.
- Presupuesto de preguntas y condiciones para excederlo: PENDING.

### 11.5. Siguiente decisión D-V9-004 — duración de la entrevista
A: objetivo de hasta 24 interacciones, ampliación solo por evidencia crítica justificada; B: límite rígido de 24 y resultado parcial cuando falte evidencia; C: recorrido variable según necesidad, sin máximo inicial, con control de fatiga. La cifra 24 procede de la propuesta de producto y **no es un límite aprobado todavía**.

### 11.6. Estado
D-V9-001 DIGITAL: APPROVED. D-V9-002 cobertura completa: APPROVED. D-V9-003 modelo híbrido: APPROVED. D-V9-004 duración: PENDING. **PLAN_ONLY** sin excepciones.

## Changelog adicional
- **1.4.0 / 2026-10-29:** modelo híbrido aprobado; contrato cualitativo/numérico, tareas PLAN-R01–R08, ocho escenarios de aceptación y próxima decisión D-V9-004. Documentación exclusivamente.


## 12. Decisión de producto D-V9-004 — entrevista adaptativa, objetivo de 24 interacciones (aprobada 2026-10-29)
**Aprobación expresa:** «entrevista adaptativa, objetivo hasta 24 interacciones y ampliación solo por evidencia crítica justificada». Estado APPROVED para producto, no para código.

### 12.1. Comportamiento exigido al agente futuro
- La selección prioriza pertinencia contextual, información nueva y cobertura de evidencia para dimensiones aplicables; no se administra el banco completo a cada usuario.
- **24 interacciones es objetivo orientativo**, no máximo rígido ni obligación de llegar a 24. Puede terminar antes si el informe ya es útil y sustentado.
- Superar el objetivo exige una causa documentada de **evidencia crítica faltante**, no conveniencia comercial ni búsqueda de una nota numérica.
- Las respuestas reutilizables pueden informar más de una regla, pero no se contarán como evidencias independientes duplicadas.
- Preguntas de contexto no aportan automáticamente puntuación. `unknown`, omisiones y no aplicabilidad se conservan como estados diferenciados.
- El usuario podrá revisar respuestas y el planificador recalculará elegibilidad sin conservar evidencia inválida de otro sector, nicho o etapa.
- Si la información no crítica es insuficiente, mostrar incertidumbre y recomendaciones prudentes; no alargar artificialmente el recorrido.

### 12.2. Definiciones pendientes, sin asumirlas
- **Unidad de interacción:** decidir si cuenta pregunta presentada, pregunta respondida, confirmación de contradicción, selección múltiple, navegación o revisión de respuesta.
- **Criterio de evidencia crítica:** definición observable por dimensión/escenario; responsable y regla de precedencia.
- **Exceso permitido:** número máximo de interacciones adicionales, si existirá, y política de salida del usuario.
- **Presupuesto dinámico:** reservar preguntas para contradicciones, especialidades y cambio de contexto; validar el coste con casos C01–C10.
- **Progreso:** mostrar avance honesto cuando la longitud final es variable, sin porcentajes ficticios.
- **Finalización anticipada:** especificar condiciones de suficiencia cualitativa, opción de abandonar y recuperación.
- **Telemetría:** medir preguntas realizadas, tiempo, abandono, redundancia y cobertura sin recolectar datos innecesarios.

### 12.3. Tareas documentales de especificación
| ID | Instrucción al planificador | Entregable | Gate |
| --- | --- | --- | --- |
| PLAN-Q01 | Inventariar el comportamiento real del selector/planner candidato y sus presupuestos | Matriz código→regla actual→diferencia V9 | Ningún límite supuesto |
| PLAN-Q02 | Definir la unidad de interacción y ejemplos límite | Contrato de conteo versionado | Casos de navegación y multi-opción coherentes |
| PLAN-Q03 | Definir prioridad de preguntas y eliminación de redundancias | Algoritmo escrito y reglas de desempate | Determinismo y no duplicación |
| PLAN-Q04 | Definir evidencia crítica, condición de ampliación y salida | Tabla dimensión × escenario × condición | Toda ampliación explicable |
| PLAN-Q05 | Diseñar tratamiento de incertidumbre y terminación temprana | Árbol de decisiones y ejemplos | Informe útil sin inventar certeza |
| PLAN-Q06 | Diseñar progreso, revisión y recuperación | Secuencias UX y estados | Progreso no engañoso |
| PLAN-Q07 | Preparar matriz futura de pruebas focalizadas C01–C10 | Casos entrada→preguntas esperadas→salida | Cobertura transversal, sin ejecutar ahora |

### 12.4. Condiciones futuras de aceptación
1. C01 activo: no repetir preguntas equivalentes; terminar al reunir evidencia útil.
2. C02 preparación: no exigir ventas o recurrencia para concluir.
3. C03 pausa: no convertir datos históricos en actividad actual.
4. C05 sin venta directa: no forzar comprador ni conversión comercial.
5. C08 oferta no publicada: conservar distinción semántica de no publicado/no aplicable.
6. C10 cambio de sector/nicho: descartar evidencia incompatible y recalcular recorrido.
7. Al superar 24, registrar dimensión, evidencia crítica faltante, pregunta que la obtiene y motivo de no finalizar con incertidumbre.
8. Si la pregunta adicional no cambia una conclusión ni cubre evidencia crítica, no justificar ampliación por ese motivo.

### 12.5. Próxima decisión D-V9-005 — acceso al resultado y continuidad
El responsable debe aprobar qué recibe quien finaliza anónimamente y qué requiere identificación voluntaria. Opciones para consulta: (A) informe útil completo anónimo y cuenta solo para guardar/historial; (B) resumen anónimo e informe detallado al identificarse; (C) informe completo anónimo con opciones de guardar, descargar y vincular posteriormente. No asumir almacenamiento, exportación ni enlaces públicos hasta inspeccionar contratos de privacidad y persistencia.

### 12.6. Estado
D-V9-001 DIGITAL APPROVED; D-V9-002 cobertura completa APPROVED; D-V9-003 modelo híbrido APPROVED; D-V9-004 entrevista adaptativa objetivo 24 APPROVED; D-V9-005 PENDING. **PLAN_ONLY** permanece vigente.

## Changelog adicional
- **1.5.0 / 2026-10-29:** D-V9-004 aprobada; reglas de entrevista, decisiones aún abiertas, tareas PLAN-Q01–Q07, criterios de aceptación y siguiente consulta. Solo documentación.


## 13. Decisión D-V9-005 — resumen anónimo e informe detallado con cuenta (aprobada 2026-10-29)
**Aprobación expresa del responsable:** «resumen anónimo e informe detallado con cuenta». Estado: APPROVED como comportamiento de producto, NO como implementación.

### 13.1. Dos niveles de presentación
**Anónimo, después de finalizar:** resumen de madurez digital comprensible y útil, con fortalezas principales, oportunidades y orientación inicial. Debe comunicar insuficiencia de evidencia y no prometer puntuaciones no calibradas. No exigir cuenta para finalizar o consultar ese resumen.

**Usuario autenticado:** informe detallado por dimensiones aplicables, evidencias y límites, prioridades justificadas, recomendaciones y continuidad/historial cuando los contratos de persistencia estén aprobados. El registro no modifica respuestas, scoring, calibración ni conclusiones; solo autoriza una vista ampliada y funcionalidades asociadas a identidad.

**No decidido todavía:** campos exactos de cada vista, número de fortalezas/prioridades visibles anónimamente, si existe descarga, cuánto tiempo persiste un run anónimo, qué consentimientos se necesitan, si puede compartirse un enlace, y política de borrado/retención. No inventar valores ni asumir acceso público a resultados personales.

### 13.2. Contratos de seguridad y continuidad para el futuro agente
- Separar motor de evaluación de autorización de lectura: la identidad nunca cambia la nota o prioridad.
- Diseñar ownership de run, claim autenticado y asociación a organización como actos distintos; vincular negocio requiere autorización explícita y verificación de permisos.
- Definir tokens/cookies de sesión anónima, expiración, rotación, idempotencia, reclamación única y protección frente a acceso cruzado. Seleccionar mecanismos concretos tras auditar rutas y migraciones V9 reales.
- Proteger evidencias sensibles del informe detallado frente a exposición en endpoints, caché, logs, URLs o resúmenes públicos.
- Si falla el login/claim, conservar el resumen y ofrecer recuperación segura sin duplicar resultados ni cambiar la evaluación.
- Revisar accesibilidad y UX del paso de resumen a registro, con explicación clara del beneficio y sin bloqueo previo a terminar la entrevista.
- Integrar Aprende y servicios solo según contratos aprobados; no utilizar GHL como requisito para identidad, resultados o scoring.

### 13.3. Tareas de especificación para el agente futuro
| ID | Tarea documental | Entregable / evidencia exigida | Gate |
| --- | --- | --- | --- |
| PLAN-I01 | Inventariar rutas V9 de run, finalización, resultado, claim, estado e historial, y tablas D1 asociadas | Mapa de endpoints, permisos y contratos actuales con rutas/SHA | No asumir que endpoints existentes están certificados |
| PLAN-I02 | Diseñar contrato de resumen anónimo | Campos permitidos/prohibidos y ejemplo con evidencia parcial | Útil sin cuenta y sin datos sensibles |
| PLAN-I03 | Diseñar contrato de informe autenticado | Esquema de dimensiones, evidencias, prioridades y explicaciones | Trazabilidad y consistencia con resumen |
| PLAN-I04 | Diseñar flujo de transición anónimo→cuenta→claim | Diagrama de estados, errores, reintentos, expiración y permisos | No pérdida ni doble claim |
| PLAN-I05 | Diseñar historial, asociación voluntaria a negocio y autorización multi-organización | Matriz de roles, ownership y escenarios negativos | Sin acceso cruzado |
| PLAN-I06 | Proponer retención, borrado, consentimiento y política de datos | Tabla de datos, propósito, plazo propuesto y aprobación pendiente | No establecer plazos sin decisión |
| PLAN-I07 | Especificar pruebas focalizadas futuras de resultados y seguridad | Matriz entrada→vista anónima/autenticada→permiso→resultado esperado | Misma evaluación para ambas vistas |

### 13.4. Casos de aceptación futuros
1. Run anónimo completo: resumen disponible sin iniciar sesión; no filtra informe detallado.
2. Login posterior: informe detallado del mismo run, sin alterar respuestas o resultado.
3. Claim repetido: no duplica ni cambia propietario sin autorización.
4. Dos usuarios/organizaciones: acceso cruzado denegado, incluidos endpoints e historial.
5. Run anónimo caducado o token inválido: respuesta segura, sin acceso a terceros.
6. Evidencia insuficiente: resumen e informe expresan incertidumbre coherente.
7. Fallo de autenticación: no se pierde el resultado de evaluación ni se atribuye a otra cuenta.
8. Recursos Aprende no disponibles: informe sigue siendo útil sin enlace inventado.

### 13.5. Impacto en plan
- F05: contratos de resumen anónimo e informe autenticado separados de cálculo.
- F07: claim, ownership, permisos, historial y privacidad se convierten en gates explícitos.
- F08: pruebas negativas de exposición, accesibilidad y continuidad.
- F10: aceptación de transición anónimo→cuenta antes de lanzamiento.

### 13.6. Próxima decisión D-V9-006 — priorización de acciones
Determinar cómo ordenar acciones del informe: (A) impacto digital esperado; (B) facilidad y rapidez de ejecución; (C) combinación explicable de impacto, urgencia, esfuerzo y objetivo declarado, sin presentar estimaciones como hechos. Requiere aprobación del responsable.

### 13.7. Estado
D-V9-001 DIGITAL APPROVED; D-V9-002 cobertura completa APPROVED; D-V9-003 modelo híbrido APPROVED; D-V9-004 entrevista adaptativa APPROVED; D-V9-005 resumen anónimo / informe con cuenta APPROVED; D-V9-006 PENDING. **PLAN_ONLY**.

## Changelog adicional
- **1.6.0 / 2026-10-29:** D-V9-005 aprobada; contratos de vistas, transición de identidad, seguridad, tareas PLAN-I01–I07 y decisión siguiente. Documentación exclusivamente.


## 14. Decisión D-V9-006 — priorización explicable multicriterio (aprobada 2026-10-29)
**Aprobación expresa:** «priorización explicable combinando impacto, urgencia, esfuerzo y objetivos del negocio». Estado APPROVED para producto, no para algoritmo ni código.

### 14.1. Principio de priorización
Cada acción propuesta debe tener evidencia asociada, brecha u oportunidad concreta, beneficio digital potencial, urgencia contextual, esfuerzo estimado cuando sea justificable y alineación con los objetivos declarados. Ninguno de los cuatro factores se presenta como hecho comprobado cuando solo es inferencia. Las recomendaciones gratuitas o ejecutables internamente deben poder ocupar cualquier prioridad; contratar Vecidya, usar MiniWeb, Vecindario, Aprende o GHL no mejora la clasificación por sí mismo.

### 14.2. Contrato funcional propuesto (campos sujetos a validación técnica)
- Identidad estable de recomendación y versión de regla/catálogo.
- Referencias a evidencias y dimensiones aplicables.
- Descripción del problema u oportunidad y acción concreta.
- Impacto esperado: categoría y justificación; no promesa cuantificada.
- Urgencia: categoría y causa verificable.
- Esfuerzo: categoría, supuestos, recursos/dependencias y estado desconocido si no puede estimarse.
- Objetivos: identificadores declarados por el usuario y explicación de alineación.
- Prioridad final, explicación legible, incertidumbre y regla de desempate.
- Tipo de salida: acción autónoma/gratuita, recurso Aprende verificado, servicio Vecidya opcional u otra alternativa pertinente; enlace solo si está verificado.

### 14.3. Reglas y excepciones que debe detallar el plan
1. No ordenar únicamente por impacto, facilidad o intención comercial: considerar los cuatro factores y hacer visible su razonamiento.
2. No inventar pesos, porcentajes, ROI, precios ni umbrales. Elaborar propuesta de calibración, contrastarla con casos reales y solicitar aprobación.
3. Si un factor es desconocido, conservar la incertidumbre; definir fallback explícito sin convertir desconocido en cero.
4. Separar acciones imprescindibles para corregir riesgos digitales de oportunidades opcionales; validar qué significa «urgente» por escenario.
5. Tratar dependencias: una acción habilitadora puede preceder a otra de mayor impacto, con explicación.
6. Evitar recomendaciones contradictorias, repetidas o no aplicables a preparación, pausa, organizaciones sin venta directa y actividades híbridas.
7. La presentación anónima y el informe con cuenta deben derivarse de la misma evaluación y orden de prioridades; solo cambia el detalle visible.
8. Si Aprende o el catálogo comercial carecen de recursos pertinentes, conservar la acción autónoma y registrar hueco de catálogo, sin enlaces inventados.

### 14.4. Tareas documentales para el futuro agente
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-A01 | Inventariar reglas y fuentes actuales de recomendaciones, servicios, licencias y Aprende | Matriz origen→regla→destino→estado de publicación | Sin suponer contratos existentes |
| PLAN-A02 | Definir escalas semánticas de impacto, urgencia, esfuerzo y alineación | Diccionario con ejemplos y casos desconocidos | Validación de producto |
| PLAN-A03 | Proponer algoritmo determinista, ponderación, dependencias y desempates | Pseudocódigo versionado y ejemplos calculados | Aprobación explícita de calibración |
| PLAN-A04 | Diseñar trazabilidad de evidencia y explicaciones | Contrato de recomendación con referencias y versiones | Ninguna prioridad sin explicación |
| PLAN-A05 | Definir filtros de aplicabilidad y deduplicación | Matriz por escenario C01–C10 | Sin contradicciones ni ventas ficticias |
| PLAN-A06 | Diseñar neutralidad comercial y alternativas gratuitas | Reglas de separación evaluación→acción→oferta | Servicios no alteran prioridad |
| PLAN-A07 | Diseñar presentación de acciones en resumen anónimo e informe autenticado | Ejemplos de ambas vistas sobre un mismo resultado | Consistencia de prioridades |
| PLAN-A08 | Especificar pruebas focalizadas futuras y calibración editorial | Casos entrada→ranking→explicación, empates, incertidumbre y fallbacks | Reproducibilidad sin ejecutar ahora |

### 14.5. Casos de aceptación futuros
- Emprendimiento sin ventas: una acción de preparación digital puede ser prioritaria sin estimar ingresos.
- Negocio activo con contacto inaccesible: urgencia justificada puede superar una mejora estética de alto impacto potencial.
- Organización sin venta directa: objetivos de participación o acceso no se convierten en métricas comerciales.
- Recomendaciones con impacto similar: dependencias y esfuerzo pueden decidir el orden, con explicación.
- Falta información de esfuerzo: no asumir «fácil» ni «difícil» sin evidencia.
- Recurso Aprende no publicado: omitir enlace y conservar recomendación útil.
- Servicio Vecidya disponible: no altera la puntuación ni adelanta una recomendación por ser comercial.
- Dos ejecuciones con mismas respuestas, versiones y reglas: mismo orden y explicaciones.

### 14.6. Próxima decisión D-V9-007 — integración de Aprende
Elegir si V9 (A) propone automáticamente recursos de Aprende publicados y pertinentes dentro del plan de acción; (B) ofrece un apartado de aprendizaje opcional separado; o (C) combina recomendaciones contextuales con una biblioteca opcional, sin condicionar el diagnóstico ni el acceso a resultados. Requiere verificar el contrato real de Aprende y aprobación del responsable.

### 14.7. Estado
D-V9-001 DIGITAL APPROVED; D-V9-002 cobertura completa APPROVED; D-V9-003 híbrido APPROVED; D-V9-004 adaptativo 24 APPROVED; D-V9-005 resumen anónimo/informe con cuenta APPROVED; D-V9-006 multicriterio APPROVED; D-V9-007 PENDING. **PLAN_ONLY**.

## Changelog adicional
- **1.7.0 / 2026-10-29:** D-V9-006 aprobada; contrato de recomendación, tareas PLAN-A01–A08, criterios de aceptación y siguiente decisión. Solo documentación.


## 15. Decisión D-V9-007 — Aprende contextual y biblioteca opcional (aprobada 2026-10-29)
**Aprobación expresa:** «integración contextual de recursos Aprende en el plan de acción y biblioteca opcional separada». Estado APPROVED para el diseño del producto; NO autoriza código.

### 15.1. Alcance funcional aprobado
- **Recomendación contextual:** cada brecha u oportunidad del diagnóstico puede acompañarse de recursos de Aprende que estén publicados, sean accesibles y resulten pertinentes para la acción concreta. La acción debe ser útil incluso sin recurso.
- **Exploración opcional:** ofrecer acceso separado a la biblioteca Aprende, sin condicionar finalización, puntuación, consulta del resumen anónimo ni informe detallado autenticado.
- **Separación:** V9 determina evidencia, madurez, prioridades y acciones. Aprende es una fuente externa de contenido educativo, no un componente del scoring. Lecturas, progreso, login o métricas de Aprende no alteran resultados de V9.
- **No inventar contenido:** si no existe recurso adecuado o el catálogo no está disponible, conservar la acción, omitir el enlace y registrar un hueco de contenido; nunca fabricar rutas, títulos o publicaciones.
- **Coherencia con D-V9-005:** la presencia de recursos educativos no debe filtrar información reservada del informe autenticado en el resumen anónimo. Definir exactamente qué acciones/recursos aparecen en cada vista en el contrato de presentación.

### 15.2. Contrato propuesto V9→Aprende, sujeto a inspección del repositorio
El agente futuro debe inspeccionar primero el esquema real y definir un adaptador con identidad estable del recurso, URL canónica verificada, estado publicado/accesible, versión o fecha de verificación, etiquetas/temas y relación explícita con la brecha. Estos son **requisitos semánticos**, no afirmación de que existan campos homónimos en Aprende. El adaptador no debe modificar datos de Aprende, crear recursos automáticamente ni convertir el catálogo en dependencia de ejecución del motor.

### 15.3. Tareas documentales para especificación ejecutable
| ID | Instrucción al futuro agente | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-L01 | Auditar plan, rutas, modelos y publicación reales de Aprende en HEAD; distinguir PR fusionado de producto certificado | Inventario de archivos, contratos, estados y fuentes con SHA | Ningún campo o enlace supuesto |
| PLAN-L02 | Definir el contrato mínimo de lectura y adaptador V9→Aprende | Esquema versionado y tabla de correspondencia con campos reales | Sin importaciones de motor hacia progreso/login de Aprende |
| PLAN-L03 | Diseñar reglas de elegibilidad por evidencia, acción, tema y etapa | Matriz brecha→acción→recurso y casos sin coincidencia | Cada enlace justificado y publicado |
| PLAN-L04 | Diseñar fallbacks para catálogo vacío, recurso retirado, URL rota y fallo de consulta | Tabla condición→comportamiento→registro de hueco | Informe y acciones siguen disponibles |
| PLAN-L05 | Definir vista contextual y acceso a biblioteca separada, en anónimo y autenticado | Especificación UX y permisos, sin cambios en Aprende | No exposición de informe privado |
| PLAN-L06 | Diseñar actualización de catálogo y control de versiones sin afectar resultados históricos | Política de frescura, resolución de enlaces y trazabilidad | No reescribir scoring histórico |
| PLAN-L07 | Especificar pruebas focalizadas futuras | Casos publicado/no publicado, acceso, URL inválida, vacío, cambio de versión y falta de red | Sin pruebas ejecutadas durante PLAN_ONLY |

### 15.4. Criterios de aceptación futuros
1. Recurso publicado y pertinente: aparece asociado a una acción concreta, con explicación.
2. Recurso no publicado o inaccesible: no se recomienda ni se enlaza.
3. Catálogo vacío/fallo: diagnóstico, prioridades y acciones permanecen completos y coherentes.
4. Recurso despublicado tras diagnóstico: no se promete un enlace válido sin verificar vigencia; conservar trazabilidad histórica.
5. Contenido educativo no pertinente: no aparece solo por llenar una sección.
6. Usuario anónimo: biblioteca opcional no exige registro para consultar recursos realmente públicos; no filtra informe detallado.
7. Usuario autenticado: acceso a informe detallado no cambia la elegibilidad educativa de una misma acción, salvo permisos legítimos del recurso.
8. Consumo o progreso de Aprende: no cambia puntuaciones ni evidencia de V9.

### 15.5. Fronteras y decisiones aún abiertas
La aprobación no autoriza modificar Aprende, su esquema, su catálogo o sus permisos. Verificar primero qué existe. Quedan pendientes: reglas exactas de correspondencia, cantidad de recursos por acción, orden, caducidad/verificación, UX y alcance de recursos visibles en resumen anónimo.

### 15.6. Próxima decisión D-V9-008 — papel de servicios Vecidya
(A) servicios y licencias únicamente en un apartado comercial separado; (B) propuestas comerciales opcionales asociadas a acciones pertinentes, siempre diferenciadas de las acciones gratuitas; (C) ambos: referencias opcionales contextualizadas y sección independiente de soluciones Vecidya, sin afectar scoring, prioridades ni acceso. Requiere aprobación del responsable y revisión de catálogo real.

### 15.7. Estado
D-V9-001 DIGITAL APPROVED; D-V9-002 cobertura completa APPROVED; D-V9-003 híbrido APPROVED; D-V9-004 adaptativo 24 APPROVED; D-V9-005 resumen anónimo/informe con cuenta APPROVED; D-V9-006 prioridades multicriterio APPROVED; D-V9-007 Aprende contextual+biblioteca opcional APPROVED; D-V9-008 PENDING. **PLAN_ONLY**.

## Changelog adicional
- **1.8.0 / 2026-10-29:** D-V9-007 aprobada; contrato conceptual Aprende, tareas PLAN-L01–L07, criterios de aceptación y siguiente decisión. Solo documentación.


## 16. Decisión D-V9-008 — servicios Vecidya contextuales y sección independiente (aprobada 2026-10-29)
**Aprobación expresa:** «servicios Vecidya opcionales y contextuales, más sección independiente de soluciones». Estado APPROVED para diseño de producto; NO autoriza implementación.

### 16.1. Separación de responsabilidades
- **Diagnóstico V9:** evalúa madurez digital, identifica evidencias y prioriza acciones; independiente de catálogo comercial, ventas, licencias, GHL y contratación.
- **Aprende:** ofrece recursos educativos pertinentes para ejecutar acciones autónomamente, según D-V9-007.
- **Vecidya:** puede presentar ayuda profesional **opcional**, claramente identificada como comercial, si una acción priorizada tiene correspondencia verificable con un servicio vigente.
- **Exploración independiente:** incluir acceso separado al catálogo de soluciones Vecidya sin condicionar entrevista, resumen anónimo, informe autenticado ni biblioteca Aprende.
- **Frontera GHL:** distinguir servicios propios de Vecidya, capacidades integradas y servicios externos; GHL no es requisito de diagnóstico, puntuación, identidad, informe o plan de acción.

### 16.2. Reglas obligatorias
1. Calcular evaluación, aplicabilidad, prioridades y acciones **antes** de asociar servicios; el enriquecimiento comercial es posterior y no retroalimenta scoring ni ranking.
2. Mostrar siempre la acción y, cuando exista, una vía autónoma o educativa pertinente; no convertir un servicio pagado en única solución por defecto.
3. Etiquetar con claridad oferta comercial, proveedor, alcance y condiciones verificadas; no inventar precios, licencias, disponibilidad, resultados o integraciones.
4. Vincular oferta solo si su cobertura coincide con una brecha sustentada y una acción aplicable; evitar recomendaciones genéricas o venta por ausencia de evidencia.
5. No ocultar acciones ni alterar prioridades cuando no haya servicio correspondiente o el catálogo esté inaccesible.
6. No confundir «servicio disponible en catálogo» con «servicio recomendado para este negocio» ni «solución Vecidya» con funcionalidad nativa de GHL.
7. Aplicar permisos del resultado: resumen anónimo no revela evidencias o datos reservados del informe detallado; sección pública de servicios no expone datos del diagnóstico.
8. La ausencia de web, CRM, campañas o clientes no genera por sí sola una oportunidad comercial; aplicar reglas de contexto D-V9-001/002.

### 16.3. Contrato conceptual de asociación acción→solución (por verificar)
El agente futuro debe inspeccionar el catálogo real y proponer una interfaz desacoplada con identificador estable, tipo/proveedor, nombre público, descripción y URL canónica verificadas, estado vigente/publicable, capacidades cubiertas, restricciones y versión. La relación debe incluir ID de acción, evidencia pertinente, motivo de correspondencia y carácter opcional. Los campos son requisitos semánticos propuestos, **no afirmación de esquema existente**. Precios, licencias, bundles y disponibilidad requieren fuentes vigentes; omitir si no se pueden confirmar.

### 16.4. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-S01 | Auditar servicios publicados, licencias, rutas y contratos reales de Vecidya, y sus límites frente a GHL | Inventario por fuente/ruta/SHA y matriz de propiedad | No inventar servicios ni confundir proveedores |
| PLAN-S02 | Definir taxonomía de capacidades y reglas de correspondencia acción→solución | Matriz con evidencia y contraejemplos | Ninguna oferta por coincidencia superficial |
| PLAN-S03 | Diseñar adaptador comercial de solo lectura posterior al ranking | Contrato versionado y flujo de datos unidireccional | Scoring/ranking inmutables |
| PLAN-S04 | Definir UX de oferta contextual, alternativa autónoma y sección independiente | Especificación de vistas anónima/autenticada y biblioteca | Separación visual y semántica |
| PLAN-S05 | Definir vigencia, verificación de enlaces, precios/condiciones y fallback | Política de fuente y tabla de errores | No prometer información no verificada |
| PLAN-S06 | Especificar privacidad, consentimientos y frontera de datos hacia GHL/CRM | Diagrama de datos y autorizaciones, incl. casos negativos | Sin envío automático de respuestas |
| PLAN-S07 | Diseñar pruebas focalizadas futuras de neutralidad comercial y separación | Matriz casos con/sin servicio, cambio catálogo y GHL ausente | Misma evaluación y prioridades |

### 16.5. Casos de aceptación futuros
1. Dos usuarios con idénticas respuestas pero distinto acceso al catálogo reciben idéntica evaluación y ranking.
2. Servicio pertinente y vigente: se muestra opcionalmente, con motivo y etiqueta comercial.
3. Servicio retirado o URL inválida: desaparece la oferta, no la acción.
4. Ningún servicio coincide: el informe conserva plan de acción autónomo.
5. GHL no disponible: diagnóstico y plan de acción siguen funcionando.
6. Organización sin ventas: no se empuja CRM o embudo de ventas sin pertinencia.
7. Resumen anónimo: no filtra evidencias privadas por parámetros de oferta o URLs.
8. Catálogo de servicios separado: se puede explorar sin completar el diagnóstico.

### 16.6. Próxima decisión D-V9-009 — objetivos que declara el usuario
Elegir cómo capturar y utilizar objetivos del negocio: (A) seleccionar 1–3 objetivos al inicio y permitir corregirlos; (B) inferir objetivos desde respuestas, confirmándolos antes del plan; (C) combinación de selección inicial opcional, sugerencias contextuales y confirmación antes de priorizar. **Ninguna opción está aprobada**. También queda pendiente definir catálogo de objetivos y tratamiento de organizaciones sin ventas.

### 16.7. Estado
D-V9-001 DIGITAL APPROVED; D-V9-002 cobertura completa APPROVED; D-V9-003 híbrido APPROVED; D-V9-004 adaptativo 24 APPROVED; D-V9-005 resumen anónimo/informe con cuenta APPROVED; D-V9-006 prioridades multicriterio APPROVED; D-V9-007 Aprende contextual+biblioteca opcional APPROVED; D-V9-008 servicios Vecidya contextuales+sección independiente APPROVED; D-V9-009 PENDING. **PLAN_ONLY**.

## Changelog adicional
- **1.9.0 / 2026-10-29:** D-V9-008 aprobada; neutralidad comercial, separación GHL, tareas PLAN-S01–S07, criterios de aceptación y próxima decisión. Exclusivamente documentación.


## 17. Decisión D-V9-009 — objetivos opcionales, sugeridos y confirmados (aprobada 2026-10-29)
**Aprobación expresa:** «selección inicial opcional de objetivos, sugerencias contextuales y confirmación antes de priorizar». Estado APPROVED para diseño de producto; NO autoriza código.

### 17.1. Contrato de objetivos
- **Declarado:** el usuario elige voluntariamente un objetivo al comenzar o durante la entrevista; puede editarlo o retirarlo.
- **Sugerido:** V9 identifica una oportunidad a partir de evidencia pertinente y propone un objetivo con explicación; una sugerencia nunca equivale a voluntad del usuario.
- **Confirmado:** el usuario acepta expresamente un objetivo declarado o sugerido para orientar el plan de acción. La confirmación debe preceder al uso del objetivo como criterio de prioridad.
- **Rechazado o retirado:** no utilizar para alinear prioridades; conservar únicamente los datos mínimos necesarios para evitar reiteraciones, sujetos a privacidad y retención aprobadas.
- **Sin objetivos confirmados:** diagnóstico y plan siguen disponibles, priorizando brechas digitales sustentadas y necesidades básicas; indicar que la personalización por objetivos es limitada.
- **Cambio posterior:** recalcular únicamente la ordenación/explicación afectada y, si corresponde, la aplicabilidad de acciones; no alterar evidencia histórica ni madurez por el hecho de cambiar una preferencia.

### 17.2. Neutralidad contextual y taxonomía pendiente
La taxonomía debe contemplar negocios activos, preparación, pausa, profesionales independientes, organizaciones sin ventas y distintos canales. Ejemplos **ilustrativos no aprobados como catálogo**: aumentar visibilidad, facilitar contacto, generar confianza, ordenar presencia digital, mejorar seguimiento, medir resultados, informar a una comunidad o preparar un lanzamiento. No imponer ventas, captación, CRM, publicidad pagada o comercio electrónico a quien no corresponda. No inventar cantidad máxima de objetivos, prioridades relativas ni jerarquías sin aprobación.

### 17.3. Integración con entrevista y resultados
1. La captura inicial es opcional y no debe bloquear E0/E1.
2. Sugerir solo cuando la evidencia sea suficiente y la sugerencia sea explicable; permitir aceptar, rechazar o posponer.
3. Antes de ordenar acciones por objetivos, ofrecer revisión explícita de la selección final; no inferir confirmación por silencio o por avanzar.
4. Si el usuario no confirma objetivos, la evaluación cualitativa/numérica (D-V9-003) permanece independiente.
5. El criterio «alineación con objetivos» de D-V9-006 usa únicamente objetivos confirmados; la urgencia de una brecha crítica puede seguir justificando prioridad incluso si no hay objetivos.
6. Una pregunta o sugerencia de objetivos cuenta en el presupuesto de D-V9-004 solo según la unidad de interacción aún pendiente de definir; no consumir presupuesto ficticio ni extender entrevista por interés comercial.
7. Resumen anónimo e informe con cuenta (D-V9-005) proceden de una misma evaluación y prioridades; los permisos afectan el detalle, no las preferencias confirmadas.
8. Aprende y servicios Vecidya pueden enriquecer acciones después del ranking; no sugerir objetivos para promover contenido o vender servicios.

### 17.4. Tareas documentales para el futuro agente
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-G01 | Inventariar dónde se preguntan, almacenan o infieren objetivos en V9/QBV2 y otros flujos | Mapa de rutas, preguntas, tipos y dependencias con SHA | No suponer estado actual |
| PLAN-G02 | Diseñar catálogo de objetivos por etapa/sector/organización | Taxonomía con definiciones, sinónimos, exclusiones y ejemplos | Aprobación editorial/producto |
| PLAN-G03 | Definir máquina de estados declarado/sugerido/confirmado/rechazado/retirado | Contrato de transición y ejemplos | Sin consentimiento implícito |
| PLAN-G04 | Especificar reglas de sugerencia, evidencia y prevención de repeticiones | Matriz evidencia→objetivo propuesto→explicación | Sin inventar intenciones |
| PLAN-G05 | Diseñar revisión final, edición y falta de confirmación | Secuencias UX, microcopy y rutas de salida | Diagnóstico válido sin objetivos |
| PLAN-G06 | Diseñar efecto de cambios sobre priorización y resultados históricos | Matriz de invariantes y versionado | Madurez independiente de objetivos |
| PLAN-G07 | Definir persistencia mínima y privacidad de objetivos por run/identidad | Mapa de datos, ownership, borrado y permisos | Sin exposición entre cuentas |
| PLAN-G08 | Especificar pruebas focalizadas futuras para C01–C10 | Matriz de entradas, estados y ranking esperado | Sin ejecución durante PLAN_ONLY |

### 17.5. Casos de aceptación futuros
1. El usuario omite objetivos iniciales: puede completar entrevista y recibir un plan útil.
2. Objetivo sugerido sin confirmar: no influye en ranking.
3. Objetivo sugerido rechazado: no se reintroduce como confirmado ni se insiste sin nueva justificación.
4. Objetivo declarado modificado: la prioridad se actualiza de forma explicable, sin cambiar madurez.
5. Organización sin venta directa: se ofrecen objetivos de alcance, servicio o comunidad pertinentes sin forzar ventas.
6. Emprendimiento preoperativo: objetivos de preparación no implican bajo desempeño comercial.
7. Dos runs con iguales respuestas y objetivos confirmados: mismas prioridades bajo las mismas reglas versionadas.
8. Objetivos confirmados no habilitan automáticamente envío a GHL, marketing, perfil público ni contratación.

### 17.6. Próxima decisión D-V9-010 — transparencia de evidencia e incertidumbre
(A) mostrar únicamente conclusión y explicación breve; (B) permitir desplegar por dimensión qué respuestas sustentan la conclusión, qué falta y cómo corregir errores; (C) ofrecer trazabilidad completa de reglas y versiones al usuario final. Se recomienda estudiar B como equilibrio entre comprensión y legibilidad; ninguna opción está aprobada. Distinguir la vista anónima resumida de la autenticada detallada ya aprobadas.

### 17.7. Estado
D-V9-001 DIGITAL APPROVED; D-V9-002 cobertura completa APPROVED; D-V9-003 híbrido APPROVED; D-V9-004 adaptativo 24 APPROVED; D-V9-005 resumen anónimo/informe con cuenta APPROVED; D-V9-006 prioridades multicriterio APPROVED; D-V9-007 Aprende contextual+biblioteca opcional APPROVED; D-V9-008 servicios Vecidya contextuales+sección independiente APPROVED; D-V9-009 objetivos opcionales+sugerencias+confirmación APPROVED; D-V9-010 PENDING. **PLAN_ONLY**.

## Changelog adicional
- **1.10.0 / 2026-10-29:** D-V9-009 aprobada; estados y reglas de objetivos, tareas PLAN-G01–G08, casos de aceptación y próxima decisión. Exclusivamente documentación.


## 18. Decisión D-V9-010 — conclusiones con explicación breve (aprobada 2026-10-29)
**Aprobación expresa:** «conclusiones con explicación breve». Estado APPROVED para presentación del producto; NO autoriza código ni implica aprobar la opción B o C de la consulta.

### 18.1. Contrato de transparencia para el usuario
- Cada conclusión visible debe incluir una explicación breve, concreta y comprensible de por qué importa para la madurez digital del negocio, con lenguaje apropiado al contexto y etapa.
- Si una conclusión carece de sustento suficiente, comunicar el límite de evidencia; no inventar una causa, una puntuación ni un nivel de certeza.
- El resumen anónimo (D-V9-005) mantiene un alcance resumido. El informe autenticado puede ofrecer más dimensiones, prioridades y acciones, pero sus **conclusiones siguen acompañadas de explicaciones breves**, no de un explorador de evidencias o de fórmulas técnicas.
- Las prioridades de acciones (D-V9-006) requieren explicación legible del motivo de su orden; no es necesario mostrar pesos ni cálculos al usuario.
- Evitar lenguaje categórico, juicios sobre el negocio o promesas de resultados; distinguir hecho observado de interpretación en la redacción.
- No agregar por defecto paneles de evidencia desplegable, trazabilidad técnica completa, visualización de reglas o edición de respuestas desde el informe. Ninguna de esas funciones quedó aprobada por D-V9-010.

### 18.2. Trazabilidad interna sin exposición pública
Para auditoría y certificación futuras, mantener especificación de correspondencia entre conclusión, evidencia aplicable, estado de incertidumbre, reglas, versión de banco y versión de evaluación. Es un requisito interno de verificabilidad, no una autorización para mostrar datos privados ni para persistir información adicional sin contrato de privacidad aprobado. Cualquier mecanismo de rectificación de respuestas o nueva evaluación debe especificarse como flujo separado y someterse a aprobación, sin inferirlo de D-V9-010.

### 18.3. Tareas documentales para el futuro agente
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-T01 | Definir plantilla editorial de conclusión y explicación breve | Guía de microcopy con ejemplos por nivel, etapa y sector | Claridad sin causalidad inventada |
| PLAN-T02 | Definir representación concisa de incertidumbre y no aplicabilidad | Diccionario de mensajes y casos límite | No convertir desconocido en negativo |
| PLAN-T03 | Mapear conclusiones a evidencias y reglas internamente | Contrato de trazabilidad versionado y minimización de datos | No exponer datos sensibles |
| PLAN-T04 | Diseñar diferencias entre resumen anónimo e informe con cuenta | Dos ejemplos completos basados en un mismo resultado | Consistencia con D-V9-005 |
| PLAN-T05 | Revisar accesibilidad, longitud y legibilidad de explicaciones | Criterios editoriales y casos C01–C10 | Comprensible sin jerga |
| PLAN-T06 | Especificar pruebas focalizadas futuras de consistencia, incertidumbre y privacidad | Matriz entrada→conclusión→explicación esperada | Sin ejecutar pruebas en PLAN_ONLY |

### 18.4. Criterios de aceptación futuros
1. Cada conclusión mostrada posee una explicación breve pertinente.
2. Una conclusión con evidencia parcial expresa incertidumbre sin puntuación injustificada.
3. Dos resultados equivalentes bajo las mismas reglas no reciben explicaciones contradictorias.
4. Negocio preoperativo: no se describe falta de ventas como fracaso digital.
5. Organización sin ventas: no se usan justificaciones comerciales inaplicables.
6. Resumen anónimo: no filtra evidencias reservadas del informe autenticado.
7. Informe autenticado: no expone reglas técnicas ni respuestas completas como interfaz predeterminada.
8. La trazabilidad interna permite investigar una conclusión sin cambiarla por motivos comerciales.

### 18.5. Próxima decisión D-V9-011 — estructura del plan de acción
Determinar cómo agrupar recomendaciones: (A) lista única ordenada por prioridad; (B) etapas temporales orientativas (ahora, después, más adelante) con dependencias y sin plazos inventados; (C) hoja de ruta por objetivos con prioridades dentro de cada objetivo y acciones transversales. La recomendación de diseño será B, pero no está aprobada. La elección no sustituye el ranking multicriterio D-V9-006.

### 18.6. Estado
D-V9-001 DIGITAL APPROVED; D-V9-002 cobertura completa APPROVED; D-V9-003 híbrido APPROVED; D-V9-004 adaptativo 24 APPROVED; D-V9-005 resumen anónimo/informe con cuenta APPROVED; D-V9-006 prioridades multicriterio APPROVED; D-V9-007 Aprende contextual+biblioteca opcional APPROVED; D-V9-008 servicios Vecidya contextuales+sección independiente APPROVED; D-V9-009 objetivos opcionales+sugerencias+confirmación APPROVED; D-V9-010 explicaciones breves APPROVED; D-V9-011 PENDING. **PLAN_ONLY**.

## Changelog adicional
- **1.11.0 / 2026-10-29:** D-V9-010 aprobada según opción A; presentación breve, trazabilidad interna no pública, tareas PLAN-T01–T06, criterios de aceptación y siguiente decisión. Solo documentación.


## 19. Decisión D-V9-011 — hoja de ruta «Ahora / Después / Más adelante» (aprobada 2026-10-29)
**Aprobación expresa:** «hoja de ruta por etapas Ahora, Después y Más adelante, respetando prioridades y dependencias, sin plazos inventados». Estado APPROVED para producto; no autoriza implementación.

### 19.1. Semántica de etapas
- **Ahora:** acciones con prioridad o urgencia sustentada, y prerrequisitos que desbloquean otras acciones relevantes. No equivale a «hoy», «esta semana» ni a promesa de ejecución inmediata.
- **Después:** acciones razonables tras completar habilitadores o atender prioridades anteriores; pueden coexistir acciones paralelas cuando no exista dependencia.
- **Más adelante:** mejoras valiosas pero no bloqueantes o con menor prioridad contextual; no implica desinterés ni un calendario determinado.
- La clasificación es una **secuencia relativa**, no un calendario. No inferir fechas, duraciones, costos ni disponibilidad de recursos.
- Mantener ranking multicriterio D-V9-006 y objetivos confirmados D-V9-009. Las dependencias pueden alterar la secuencia de ejecución respecto del ranking, pero la excepción debe explicarse brevemente según D-V9-010.
- No forzar acciones en las tres etapas si la evidencia solo sustenta una o dos. No rellenar etapas artificialmente.

### 19.2. Reglas de planificación
1. Separar prioridad de **orden ejecutable**: una acción de alto impacto puede requerir primero otra habilitadora.
2. Registrar dependencias explícitas entre acciones, identificar ciclos y conflictos antes de producir una secuencia; no inventar relaciones causales.
3. Admitir acciones paralelas y alternativas mutuamente excluyentes; no presentarlas como tareas obligatorias acumulativas.
4. Con esfuerzo, recursos o dependencias desconocidos, mostrar incertidumbre y proponer una primera acción de validación si corresponde; no atribuir fechas.
5. Si cambian objetivos confirmados, evidencia o contexto, versionar la hoja de ruta y recalcular etapas sin modificar arbitrariamente la madurez evaluada.
6. No asignar «Ahora» a ofertas comerciales por disponibilidad del catálogo; servicios Vecidya y Aprende enriquecen las acciones **después** de ordenar y agrupar.
7. Mantener utilidad para preparación, pausa, profesionales independientes, organizaciones sin venta directa y escenarios C01–C10.
8. El resumen anónimo puede mostrar orientación inicial por etapas; el informe detallado autenticado contiene la hoja de ruta desarrollada, según contrato de vistas D-V9-005 aún por precisar.

### 19.3. Contrato documental propuesto para cada acción
Identificador y versión; objetivo confirmado relacionado (si existe); evidencia/área aplicable; prioridad multicriterio y justificación; etapa recomendada y motivo; dependencias con tipo y estado; alternativas/paralelismo; incertidumbres; condición observable para avanzar; recursos Aprende verificados y servicios Vecidya opcionales como enriquecimiento posterior. Estos son requisitos semánticos, no afirmación de campos existentes ni aprobación de esquema.

### 19.4. Tareas para el agente futuro (especificar antes de codificar)
| ID | Tarea documental | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-H01 | Inventariar el planificador actual, estructuras de acciones y dependencias en V9/QBV2 | Mapa de archivos, contratos, reglas y SHA | No asumir motor autónomo |
| PLAN-H02 | Definir reglas de asignación a etapas sin tiempos absolutos | Tabla prioridad×urgencia×dependencias→etapa, con excepciones | Aprobación de producto |
| PLAN-H03 | Especificar grafo de dependencias, alternativas, paralelismo y ciclos | Contrato de relaciones y pseudocódigo determinista | Ningún ciclo sin resolución |
| PLAN-H04 | Definir condición observable de avance y replanificación | Estados, transiciones y eventos que justifican cambios | Sin fechas inventadas |
| PLAN-H05 | Diseñar presentación en resumen anónimo e informe con cuenta | Ejemplos de hoja de ruta para C01–C10 | Coherencia con D-V9-005/010 |
| PLAN-H06 | Definir incertidumbre, vacíos de etapa y ausencia de objetivos | Casos límite y fallbacks | Ninguna etapa rellenada artificialmente |
| PLAN-H07 | Asegurar neutralidad comercial y desacoplamiento de Aprende/GHL | Diagrama de flujo evaluación→ranking→etapas→enriquecimiento | No retroalimentación comercial |
| PLAN-H08 | Preparar pruebas focalizadas futuras de secuenciación y estabilidad | Matriz entradas→etapas/orden/explicaciones | Sin ejecutar en PLAN_ONLY |

### 19.5. Casos de aceptación futuros
1. Acción prioritaria bloqueada por otra: la habilitadora aparece primero, con explicación breve.
2. Acciones independientes: pueden aparecer en paralelo en la misma etapa.
3. Acciones alternativas: no se muestran como acumulativas obligatorias.
4. Solo dos acciones pertinentes: no inventar una tercera etapa.
5. Evidencia parcial: no inferir duración ni dependencia no sustentada.
6. Objetivo modificado: reordenar acciones justificadamente sin alterar evaluación digital.
7. Recurso Aprende retirado o servicio Vecidya no disponible: etapas y prioridades permanecen estables.
8. Negocio en preparación u organización sin ventas: hoja de ruta pertinente sin exigir CRM, campañas o clientes.
9. Ciclo de dependencias: no producir secuencia contradictoria; requerir resolución documentada.
10. Mismas respuestas y reglas versionadas: mismo orden y etapas.

### 19.6. Próxima decisión D-V9-012 — continuidad y seguimiento del plan
Opciones a consultar: (A) hoja de ruta estática tras el diagnóstico, con opción de repetirlo; (B) seguimiento manual de acciones con estados, sin recalcular madurez automáticamente; (C) seguimiento manual, revisión periódica voluntaria y nueva evaluación explícita para actualizar madurez. La opción C parece coherente con continuidad, pero **no está aprobada**. No asumir notificaciones, plazos, automatizaciones ni integración CRM.

### 19.7. Estado
D-V9-001 a D-V9-011: APPROVED según sus secciones individuales; D-V9-012 PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.12.0 / 2026-10-29:** D-V9-011 aprobada; etapas sin fechas, dependencias, paralelismo, tareas PLAN-H01–H08, criterios de aceptación y próxima decisión. Solo documentación.


## 20. Decisión D-V9-012 — seguimiento manual, revisión voluntaria y reevaluación explícita (aprobada 2026-10-29)
**Aprobación expresa:** «seguimiento manual de acciones, revisión voluntaria de prioridades y reevaluación explícita para actualizar madurez». Estado APPROVED para definición de producto; NO autoriza código.

### 20.1. Tres procesos separados
- **Seguimiento manual:** el usuario autenticado registra el estado de cada acción de su hoja de ruta. El seguimiento es una declaración de progreso, no evidencia automática de madurez. Estados candidatos: pendiente, en proceso, completada, descartada/no aplicable; taxonomía definitiva PENDING.
- **Revisión voluntaria de prioridades:** a petición del usuario, revisar objetivos confirmados, contexto, dependencias y esfuerzo; generar nueva versión de la hoja de ruta, con motivos del cambio. No modificar retroactivamente el resultado original ni su puntuación.
- **Reevaluación explícita:** el usuario inicia voluntariamente un nuevo ciclo de evaluación. Solo el nuevo ciclo, con evidencia suficiente y reglas versionadas, puede producir nuevos niveles y, cuando estén calibradas, puntuaciones. No convertir automáticamente acciones marcadas como completadas en respuestas verificadas.

### 20.2. Invariantes y fronteras
1. Resultado de cada evaluación: instantánea histórica inmutable en cuanto a evidencia, versión de reglas, conclusiones y fecha; las correcciones o reevaluaciones se representan mediante versiones o runs nuevos según contrato por definir.
2. Seguimiento y preferencias de prioridades son datos asociados a un plan, no al motor de scoring.
3. «Completada» significa que el usuario reporta haber ejecutado una acción, no que V9 certifica un resultado.
4. La reevaluación debe distinguir respuestas nuevas, reutilizadas con confirmación, desconocidas y obsoletas; no asumir que información histórica sigue vigente.
5. El usuario puede consultar progreso y resultados previos dentro de permisos de identidad aprobados por D-V9-005; nunca exponer historial de otro usuario u organización.
6. No programar reevaluaciones, correos, alertas, tareas GHL, recordatorios ni campañas automáticamente; todo eso requiere decisiones separadas.
7. La disponibilidad de Aprende, servicios Vecidya o GHL no cambia estados de progreso, evidencia ni madurez.
8. Mantener compatibilidad con los escenarios C01–C10 y con cambios de etapa (preparación, activo, pausa) sin asumir fracaso o mejora.
9. El resumen anónimo no habilita seguimiento persistente por sí solo; el diseño de continuidad debe respetar el contrato de cuenta, claim y privacidad.
10. El historial debe permitir distinguir cambios por ejecución del negocio de cambios por nueva versión de reglas; diseñar comparabilidad antes de mostrar flechas o porcentajes de evolución.

### 20.3. Contratos conceptuales sujetos a auditoría
- **Acción seguida:** referencia a plan/acción/versiones, estado manual, autor autorizado, fecha de declaración, nota opcional, historial de cambios y motivo cuando corresponda.
- **Revisión de hoja de ruta:** referencia al diagnóstico de origen, objetivos/contexto vigentes, cambios solicitados, versión anterior/nueva, reglas y explicación breve de cambios.
- **Nueva evaluación:** identidad del nuevo run, referencia opcional al anterior, consentimiento de reutilización, evidencias frescas, reglas/versiones y resultado independiente.
Estos campos son requisitos de especificación, no afirmación de tablas existentes ni aprobación de retención de datos.

### 20.4. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-F01 | Auditar historial, runs, ownership y persistencia existentes en V9/QBV2 | Mapa de archivos, tablas, rutas, permisos y SHA | No suponer continuidad implementada |
| PLAN-F02 | Definir estados manuales y transiciones de acciones | Máquina de estados, reglas de edición y ejemplos | Aprobación editorial/producto |
| PLAN-F03 | Diseñar historial de acciones y auditoría mínima | Esquema conceptual de versiones, autoría y privacidad | No mezclar con scoring |
| PLAN-F04 | Especificar revisión voluntaria de objetivos y prioridades | Contrato de replanificación y ejemplos de cambios | Resultado original inmutable |
| PLAN-F05 | Diseñar reevaluación explícita y reutilización consentida de respuestas | Flujo de nueva evaluación, caducidad y confirmación | Sin mejoras inferidas por checkboxes |
| PLAN-F06 | Definir comparación histórica de resultados y compatibilidad de versiones | Política de comparabilidad, cambios de reglas e incertidumbre | Sin tendencias engañosas |
| PLAN-F07 | Diseñar UX de progreso, revisión y reevaluación, con estados vacíos y errores | Secuencias anónimo/autenticado y accesibilidad | Sin automatizaciones implícitas |
| PLAN-F08 | Especificar permisos multi-organización, minimización y borrado | Matriz de ownership, acceso, retención pendiente y casos negativos | Sin acceso cruzado |
| PLAN-F09 | Preparar pruebas focalizadas futuras | Matriz de estado→cambio→efecto en plan/resultados/historial | No ejecutar en PLAN_ONLY |

### 20.5. Criterios de aceptación futuros
1. Marcar una acción completada no modifica el nivel ni la puntuación del diagnóstico.
2. Cambiar objetivos confirmados permite revisar prioridades voluntariamente sin reescribir el resultado previo.
3. La nueva evaluación requiere inicio explícito; no se ejecuta por completar acciones.
4. Respuestas históricas obsoletas no se reutilizan como evidencia vigente sin validación.
5. Comparar resultados de versiones no equivalentes no produce una mejora numérica ficticia.
6. Usuario de otra organización no accede a acciones, historial ni reevaluaciones ajenas.
7. Sin conexión con GHL o Aprende, el seguimiento y la reevaluación siguen definidos como funciones propias.
8. Usuario anónimo puede obtener su resumen sin crear seguimiento persistente no autorizado.
9. Negocio en pausa o sin ventas puede completar acciones pertinentes sin penalización comercial.
10. Revisión sin cambios relevantes conserva prioridades y explica que no hubo cambios.

### 20.6. Próxima decisión D-V9-013 — comparación histórica
(A) comparar únicamente conclusiones cualitativas y acciones, indicando cambios de contexto; (B) comparar niveles por dimensión y, cuando exista calibración compatible, valores numéricos, con advertencias por cambios de metodología; (C) mostrar evolución visual y metas, con comparaciones solo entre versiones compatibles y evidencia suficiente. Ninguna opción está aprobada; no asumir que ya existe un historial técnicamente compatible.

### 20.7. Estado
D-V9-001 a D-V9-012: APPROVED según sus respectivas secciones; D-V9-013 PENDING. **PLAN_ONLY**: prohibido implementar, ejecutar pruebas, modificar CI, fusionar ramas o desplegar sin autorización expresa.

## Changelog adicional
- **1.13.0 / 2026-10-29:** D-V9-012 aprobada; separación seguimiento/replanificación/reevaluación, invariantes históricos, tareas PLAN-F01–F09, criterios de aceptación y próxima decisión. Solo documentación.


## 21. Decisión D-V9-013 — comparación histórica por dimensiones y calibración compatible (aprobada 2026-10-29)
**Aprobación expresa:** «comparación histórica por dimensiones, niveles cualitativos y números solo con calibración compatible». Estado APPROVED como definición de producto; NO autoriza implementación.

### 21.1. Contrato de comparación
- Mostrar evolución por **dimensión digital aplicable** entre evaluaciones explícitas del mismo negocio/organización y con permisos verificados; conservar contexto, etapa, modalidad y fecha de cada instantánea.
- Comparar **niveles cualitativos** únicamente cuando las definiciones y evidencias permitan comparación significativa. Si una dimensión cambia de aplicabilidad, taxonomía o criterio, indicar «no comparable» y explicar brevemente el motivo.
- Mostrar **puntuaciones y diferencias numéricas** solo cuando ambas evaluaciones tengan evidencia suficiente, calibración validada y una regla explícita de compatibilidad de escalas, pesos, versiones y dimensiones. No inferir compatibilidad por igualdad del nombre del campo.
- Conservar instantáneas históricas y versiones de reglas; prohibir recalcular o sobrescribir resultados anteriores silenciosamente. Una migración o recálculo explícito requiere diseño y aprobación propios.
- No atribuir una variación a una acción completada, un cambio de objetivos o una mejora del negocio sin evidencia causal suficiente.
- No presentar flechas de mejora, porcentajes de progreso o «crecimiento» cuando solo cambió el cuestionario, la metodología, el sector o la evidencia disponible.
- La comparación histórica pertenece a la continuidad autenticada D-V9-005/012; el resumen anónimo no expone historial de cuentas ni de otras organizaciones.

### 21.2. Estados de comparabilidad propuestos (pendientes de contrato definitivo)
**Comparable cualitativa y numéricamente**: versiones compatibles y evidencia/calibración suficiente en ambas; **comparable solo cualitativamente**: niveles compatibles, pero números no habilitados; **comparación contextual limitada**: hay cambios de etapa/cobertura que requieren advertencia; **no comparable**: dimensión no aplicable, evidencia insuficiente o metodología incompatible. Estos estados son hipótesis de especificación y deben validarse con casos C01–C10; no constituyen umbrales aprobados.

### 21.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-C01 | Inventariar snapshots, versiones, resultados, dimensiones y persistencia real V9/QBV2 | Mapa de tablas/rutas/contratos con SHA | No suponer historial certificado |
| PLAN-C02 | Definir identidad de dimensión y reglas de correspondencia entre versiones | Matriz dimensión-vieja→nueva, aplicabilidad y cambios semánticos | Sin equivalencias por nombre |
| PLAN-C03 | Definir compatibilidad de calibraciones, pesos, escalas y evidencia | Política versionada de comparabilidad numérica | Aprobación técnica/producto |
| PLAN-C04 | Diseñar algoritmo conceptual de comparación cualitativa y estados no comparables | Tabla de decisiones y pseudocódigo determinista | No atribuir mejoras falsas |
| PLAN-C05 | Definir manejo de cambios de contexto, etapa, objetivos y organización | Casos C01–C10 y advertencias de interpretación | Separar contexto de madurez |
| PLAN-C06 | Diseñar informe histórico autenticado y explicación breve de diferencias | Ejemplos con niveles, números permitidos/omitidos y advertencias | D-V9-010: explicación breve |
| PLAN-C07 | Diseñar inmutabilidad, permisos, retención y trazabilidad de snapshots | Contrato de ownership, versiones, privacidad y migración | No acceso cruzado ni reescritura |
| PLAN-C08 | Preparar pruebas focalizadas futuras de compatibilidad y regresión | Matriz entradas→comparabilidad→presentación esperada | No ejecutar en PLAN_ONLY |

### 21.4. Casos de aceptación futuros
1. Misma dimensión, metodología compatible y evidencia suficiente: mostrar comparación cualitativa y números solo si calibrados.
2. Niveles compatibles sin calibración numérica: mostrar comparación cualitativa y omitir diferencias numéricas.
3. Escalas o pesos incompatibles: no mostrar diferencia numérica ni porcentaje de mejora.
4. Dimensión que pasa a no aplicable: no convertirla en cero ni describir retroceso.
5. Cambio de etapa (preparación→activo, activo→pausa): advertir el cambio y revisar aplicabilidad antes de comparar.
6. Evidencia incompleta en una evaluación: comunicar límite sin inventar tendencia.
7. Acción marcada completada sin reevaluación: historial de madurez permanece igual.
8. Revisión de objetivos o prioridades: no modifica resultados históricos.
9. Usuario de otra organización: acceso a historial y comparaciones denegado.
10. Reglas nuevas sin tabla de compatibilidad aprobada: comparación numérica bloqueada por defecto.

### 21.5. Próxima decisión D-V9-014 — idiomas del diagnóstico
Determinar alcance inicial de idiomas y traducciones editoriales: (A) español como idioma inicial, arquitectura preparada para otros; (B) español e inglés completos desde V9; (C) idioma adaptativo según preferencia con español/inglés certificados y otros pendientes. Ninguna opción aprobada. No inferir que la presencia de traducciones en el repositorio equivale a cobertura editorial certificada.

### 21.6. Estado
D-V9-001 a D-V9-013: APPROVED según sus secciones; D-V9-014 PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.14.0 / 2026-10-29:** D-V9-013 aprobada; política conceptual de comparación histórica, ocho tareas PLAN-C01–C08, diez criterios de aceptación y próxima decisión. Solo documentación.


## 22. Decisión D-V9-014 — español e inglés completos y certificados desde V9 (aprobada 2026-10-29)
**Aprobación expresa:** «español e inglés completos y certificados desde V9». Estado APPROVED para alcance de producto; NO autoriza implementación ni afirma que la cobertura actual esté certificada.

### 22.1. Alcance obligatorio por idioma
- Certificar **español (es)** e **inglés (en)** en todos los recorridos admitidos C01–C10, desde contexto inicial hasta entrevista adaptativa, resumen anónimo, registro/transición, informe autenticado, hoja de ruta, seguimiento, reevaluación y comparación histórica.
- Traducir y revisar preguntas, opciones, ayudas, etiquetas de niveles, mensajes de insuficiencia de evidencia, explicaciones breves, objetivos, acciones, etapas «Ahora/Después/Más adelante», estados de progreso, errores, accesibilidad y textos legales pertinentes.
- Preservar el **significado**, no una traducción literal: las respuestas equivalentes deben mapear al mismo concepto semántico y producir las mismas decisiones de aplicabilidad, evidencias, prioridades y niveles bajo la misma versión de reglas.
- No usar texto traducido como identificador de scoring, pregunta, respuesta, dimensión u objetivo. Los identificadores semánticos deben permanecer estables e independientes del idioma.
- El cambio de idioma durante el run no debe borrar respuestas ni modificar evidencia o evaluación. Definir política UX de selección y persistencia de preferencia; la detección automática de idioma **no quedó aprobada**.
- Si falta una traducción crítica o no está validada, el recorrido no puede declararse certificado en ese idioma; especificar política de fallback sin presentar un recorrido mixto como completo.
- Recursos externos Aprende y páginas de servicios pueden tener disponibilidad por idioma distinta: el agente debe auditarla y definir fallbacks transparentes. La ausencia de un recurso educativo traducido no invalida la evaluación, pero no permite inventar un enlace o afirmar cobertura completa de un recurso inexistente.
- Mantener separación entre idioma de presentación, país, moneda, mercado y sector; no inferir ubicación o modalidad del negocio a partir de es/en.

### 22.2. Matriz mínima de certificación
| Área | Español | Inglés | Criterio común |
| --- | --- | --- | --- |
| Contexto y rutas C01–C10 | Revisión editorial pendiente | Revisión editorial pendiente | Misma aplicabilidad |
| Banco de preguntas y opciones | Auditoría pendiente | Auditoría pendiente | Identificadores semánticos equivalentes |
| Entrevista adaptativa y progreso | Especificación pendiente | Especificación pendiente | Mismo recorrido para evidencias equivalentes |
| Resumen anónimo y registro | Especificación pendiente | Especificación pendiente | Mismos permisos y conclusiones |
| Informe, niveles e incertidumbre | Calibración pendiente | Calibración pendiente | Misma evaluación |
| Objetivos, acciones y hoja de ruta | Revisión pendiente | Revisión pendiente | Mismo ranking y dependencias |
| Seguimiento, reevaluación e historial | Diseño pendiente | Diseño pendiente | Mismos estados y comparabilidad |
| Errores, accesibilidad y textos legales | Revisión pendiente | Revisión pendiente | Comprensión y seguridad equivalentes |
Ninguna celda se considera PASS por la sola existencia de archivos de localización.

### 22.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-LANG01 | Inventariar i18n real, locales, textos hardcodeados, banco editorial y rutas con SHA | Matriz archivo→idioma→estado→deuda | No asumir cobertura |
| PLAN-LANG02 | Definir glosario bilingüe de conceptos digitales y lenguaje público | Glosario es/en con equivalencias, falsos amigos y revisión humana | Aprobación editorial |
| PLAN-LANG03 | Diseñar contrato de identificadores semánticos independientes del idioma | Mapa pregunta/opción/dimensión/objetivo/acción→localización | Sin divergencia de scoring |
| PLAN-LANG04 | Auditar y planificar revisión de todas las preguntas, opciones y variantes activas | Inventario por ID, estado es/en, responsable y criterios | 100 % de rutas activas cubiertas |
| PLAN-LANG05 | Definir selección/cambio de idioma, persistencia y fallback | Máquina de estados UX y casos de sesión anónima/autenticada | Sin pérdida de respuestas |
| PLAN-LANG06 | Diseñar equivalencia de resultados y recomendaciones entre idiomas | Pares de casos C01–C10 con resultados esperados | Igual semántica, diferente redacción |
| PLAN-LANG07 | Definir política de recursos Aprende/servicios por idioma y enlaces válidos | Matriz disponibilidad/fallback, sin promesas de traducción | Motor independiente de catálogos |
| PLAN-LANG08 | Preparar certificación editorial, accesibilidad y pruebas focalizadas futuras | Checklist bilingüe, responsables, matriz de regresión y evidencia | Ambos idiomas PASS antes de lanzamiento |

### 22.4. Casos de aceptación futuros
1. Respuestas semánticamente idénticas en es/en: mismo conjunto de evidencias, dimensiones, prioridades y niveles.
2. Cambio es→en a mitad de entrevista: conserva respuestas y contexto; no reinicia run.
3. Pregunta u opción sin traducción validada: se detecta como bloqueo de certificación, no se oculta silenciosamente.
4. Negocio en preparación: ninguna traducción transforma «sin clientes aún» en «fracaso».
5. Organización sin ventas: ambos idiomas preservan la no aplicabilidad comercial.
6. Incertidumbre y «no aplicable»: significados equivalentes, sin convertir desconocido en negativo.
7. Resumen anónimo e informe con cuenta: mismo control de acceso en es/en.
8. Acciones «Ahora/Después/Más adelante»: misma secuencia y dependencias; etiquetas localizadas.
9. Recurso Aprende sin versión en inglés: fallback explícito o ausencia de enlace, nunca URL inventada.
10. Errores, mensajes de privacidad y controles accesibles: revisados en ambos idiomas.

### 22.5. Próxima decisión D-V9-015 — alcance del banco editorial V9
Definir política de publicación del cuestionario: (A) depurar y aprobar el banco histórico completo antes del lanzamiento; (B) publicar un núcleo editorial nuevo, pequeño y certificado para C01–C10, manteniendo histórico fuera de rutas activas; (C) núcleo certificado y ampliación progresiva por lotes antes del lanzamiento, con bloqueo de rutas no cubiertas. **Ninguna opción está aprobada**. La cobertura completa D-V9-002 es innegociable; no equivale a publicar todas las preguntas históricas.

### 22.6. Estado
D-V9-001 a D-V9-014: APPROVED según sus respectivas secciones; D-V9-015 PENDING. **PLAN_ONLY**: sin implementación, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.15.0 / 2026-10-29:** D-V9-014 aprobada; cobertura es/en, equivalencia semántica, matriz de certificación, tareas PLAN-LANG01–08, criterios de aceptación y siguiente decisión. Solo documentación.


## 23. Decisión D-V9-015 — núcleo editorial certificado y ampliación progresiva por lotes (aprobada 2026-10-29)
**Aprobación expresa:** «núcleo editorial certificado y ampliación progresiva por lotes, con cobertura completa antes del lanzamiento». Estado APPROVED como política editorial y gate de lanzamiento; NO autoriza implementación.

### 23.1. Estrategia editorial
- Crear un **núcleo mínimo suficiente y certificado** para sostener todas las rutas de negocio C01–C10, dimensiones digitales aplicables y resultados útiles, sin exigir que todas las preguntas históricas se publiquen.
- Ampliar por **lotes editoriales con alcance definido** (brecha de cobertura, sector, etapa, modalidad o evidencia crítica); cada lote requiere revisión semántica, editorial, de aplicabilidad, de accesibilidad y bilingüe es/en antes de entrar en rutas activas.
- Clasificar cada pregunta histórica como **conservar, adaptar, sustituir, retirar o pendiente**, con motivo y referencias a sus opciones, variantes, reglas y dependencias; no asumir que los 77 ítems históricos son válidos o que el lote de ocho preguntas revisadas está aprobado.
- Preguntas, opciones o variantes sin certificación no pueden activar rutas de producción. El inventario debe distinguir **revisado** de **aprobado** y **publicable**.
- «Cobertura completa antes del lanzamiento» significa que cada escenario admitido tiene recorrido adaptativo coherente, evidencia suficiente para un resultado útil, estados desconocido/no aplicable, textos es/en certificados y pruebas de aceptación planificadas; **no** significa activar todo el banco histórico.
- El banco editorial debe permanecer independiente de la oferta comercial Vecidya, GHL y la disponibilidad de recursos Aprende.
- No usar preguntas sobre ventas, CRM, anuncios, web o pagos como requisitos universales; diferenciar contexto de madurez digital según D-V9-001/002.
- Respetar objetivo de hasta 24 interacciones y ampliaciones justificadas D-V9-004; el aumento de preguntas en el banco no implica entrevistas más largas.

### 23.2. Inventario editorial y metadatos propuestos
Para cada pregunta/opción/variante, especificar identificador semántico estable, objetivo de evidencia, dimensión(es), escenarios de aplicabilidad, estados de respuesta, reglas de salto y dependencia, relación con otras preguntas, textos es/en, versión, fuente editorial, estado de revisión, aprobador y fecha. Son requisitos documentales a validar contra los archivos reales, no afirmación de que todos estos campos existan.

### 23.3. Secuencia documental de lotes (propuesta, no aprobación individual)
- **Lote núcleo:** contexto y evidencias digitales transversales necesarias para C01–C10; priorizar neutralidad de etapa y modalidad.
- **Lotes de especialidad:** ampliar solo brechas justificadas para servicios por cita, ecommerce, restauración, híbridos y organizaciones sin venta directa; validar que no reintroduzcan preguntas obligatorias improcedentes.
- **Lotes de refinamiento:** resolver contradicciones, ambigüedades y casos límite observados en certificación; no añadir preguntas por volumen.
- Ningún lote está aprobado automáticamente por pertenecer a una categoría; registrar criterios de entrada/salida y aprobación por separado.

### 23.4. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-E01 | Inventariar banco histórico, variantes, opciones, rutas y dependencias en HEAD | Tabla por ID, archivo/SHA, estado real y trazabilidad | No equiparar revisado con aprobado |
| PLAN-E02 | Definir matriz escenario C01–C10 × dimensión × evidencia crítica | Cobertura requerida y huecos identificados | Todas las rutas justificadas |
| PLAN-E03 | Diseñar núcleo mínimo y justificar cada pregunta | Fichas editoriales y grafo conceptual | Sin redundancia ni sesgo comercial |
| PLAN-E04 | Clasificar preguntas históricas conservar/adaptar/sustituir/retirar/pendiente | Registro de decisiones con razones y dependencias | Aprobación editorial humana |
| PLAN-E05 | Diseñar protocolo de lotes, versionado y publicación | Checklist de entrada/salida y rollback conceptual | Ninguna ruta activa sin certificación |
| PLAN-E06 | Certificar equivalencia semántica es/en de preguntas, opciones y saltos | Pares bilingües y glosario, revisión por ID | D-V9-014 completo |
| PLAN-E07 | Validar coherencia con presupuesto adaptativo y suficiencia de evidencia | Simulaciones documentales C01–C10 y límites | D-V9-003/004 coherentes |
| PLAN-E08 | Preparar matriz futura de pruebas focalizadas y gates de lanzamiento | Casos de ruta, opciones, unknown, contradicción y no aplicabilidad | Sin ejecutar pruebas durante PLAN_ONLY |
| PLAN-E09 | Mapear dependencias de banco con motor, scoring, Aprende y catálogo comercial | Diagrama de contratos, versiones y aislamiento | V9 no depende de QBV2/GHL en destino |

### 23.5. Criterios de aceptación futuros
1. C01–C10 cuentan con rutas documentadas y evidencia suficiente para un informe útil.
2. Las preguntas del núcleo poseen textos es/en certificados y equivalencia de opciones.
3. Ninguna pregunta pendiente de aprobación se ejecuta en un recorrido activo.
4. Preguntas redundantes no consumen presupuesto adaptativo sin justificación.
5. Negocio sin clientes o en preparación no recibe preguntas de ventas obligatorias.
6. Organización sin venta directa no es penalizada por ausencia de ecommerce o CRM.
7. Cambio de etapa/sector invalida saltos y respuestas incompatibles según reglas.
8. La incorporación de un lote no altera silenciosamente resultados históricos.
9. Una brecha de cobertura bloquea el lanzamiento de la ruta correspondiente; no se declara cobertura completa de V9.
10. La certificación de un lote requiere evidencia editorial y bilingüe, además de pruebas focalizadas futuras.
11. La ausencia de Aprende, servicios Vecidya o GHL no afecta la validez del banco.
12. La entrevista no supera el objetivo de 24 interacciones salvo evidencia crítica faltante y justificación documentada.

### 23.6. Próxima decisión D-V9-016 — modelo de dimensiones digitales
Determinar si (A) se mantienen las ocho dimensiones candidatas existentes, tras auditoría y aprobación individual; (B) se redefine desde cero la taxonomía de dimensiones; o (C) se toma el conjunto actual como base de trabajo, se audita contra C01–C10 y se aprueba una versión final ajustada antes de diseñar pesos y calibración. La opción C es recomendación de planificación, **no aprobada**. Las ocho dimensiones actuales no deben considerarse aprobadas solo por existir en código o documentación.

### 23.7. Estado
D-V9-001 a D-V9-015: APPROVED según sus respectivas secciones; D-V9-016 PENDING. **PLAN_ONLY**: sin implementación, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.16.0 / 2026-10-29:** D-V9-015 aprobada; estrategia de núcleo/lotes, inventario editorial, tareas PLAN-E01–E09, doce criterios de aceptación y siguiente decisión. Solo documentación.


## 24. Decisión D-V9-016 — auditar y ajustar las ocho dimensiones candidatas contra C01–C10 (aprobada 2026-10-29)
**Aprobación expresa:** «auditar y ajustar las ocho dimensiones candidatas contra C01–C10, y aprobar posteriormente la taxonomía definitiva». Estado APPROVED como **método de revisión**, no como aprobación de ninguna dimensión ni de sus pesos. Exclusivamente PLAN_ONLY.

### 24.1. Base candidata, no taxonomía aprobada
1. `clarity_positioning`: claridad de propuesta, audiencia y diferenciación.
2. `digital_foundation`: fundamentos de presencia digital pertinentes al contexto.
3. `discovery`: capacidad de ser encontrado por audiencias relevantes.
4. `trust_reputation`: señales digitales de credibilidad y confianza.
5. `conversion_access`: facilidad de contacto, acceso o siguiente acción apropiada; no equivale necesariamente a venta.
6. `relationship_recurrence`: continuidad de relación y comunicación digital; no exige compras repetidas.
7. `measurement_optimization`: observación y aprendizaje sobre resultados digitales, proporcional a la etapa.
8. `digital_readiness`: capacidad realista de adoptar y sostener mejoras digitales; evitar confundir recursos disponibles con madurez conseguida.
Estas definiciones son hipótesis editoriales para contrastar con el repositorio y los escenarios, no rúbricas certificadas.

### 24.2. Criterios obligatorios de auditoría
- **Validez de constructo:** cada dimensión mide una capacidad digital definida, no facturación, tamaño, presupuesto, antigüedad ni adopción de proveedores.
- **Separación:** detectar preguntas/evidencias duplicadas, doble conteo, causalidad circular y solapamientos entre fundamentos, descubrimiento, confianza, acceso, relaciones y preparación.
- **Cobertura:** cruzar cada dimensión con C01–C10, distinguir aplicable/no aplicable/desconocido/evidencia insuficiente y justificar excepciones.
- **Neutralidad de etapa y modelo:** sin penalización automática por carecer de web, CRM, anuncios, ecommerce, clientes o ventas cuando no corresponde.
- **Observabilidad:** especificar evidencia mínima, contradicciones, límites de inferencia y explicaciones breves comprensibles.
- **Independencia comercial:** ninguna dimensión depende de GHL, compra de servicios Vecidya o consumo de Aprende.
- **Equivalencia bilingüe:** nombres, definiciones, preguntas y rúbricas es/en con significado equivalente.
- **Comparabilidad histórica:** cambios de dimensiones, fusiones y divisiones requieren mapeo versionado; no asumir equivalencia de resultados previos.
- **Calibración posterior:** no definir pesos, umbrales numéricos ni score global hasta aprobación expresa de taxonomía, evidencias y metodología.

### 24.3. Matriz de revisión exigida
Por cada candidata y escenario C01–C10 documentar: aplicabilidad razonada; objetivo de medición; evidencia observable; preguntas/variantes vinculadas; riesgo de sesgo; posibles solapamientos; vacíos; tratamiento de desconocido/no aplicable; nivel de confianza; recomendación **mantener / redefinir / fusionar / dividir / retirar / incorporar dimensión nueva**. Registrar referencias a archivos y SHA de HEAD auditado, y decisión editorial humana posterior. La matriz **no** queda rellenada ni validada por esta aprobación.

### 24.4. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-DIM01 | Inventariar definiciones, claves, preguntas, reglas y consumidores actuales V9/QBV2 | Mapa por dimensión con archivos y SHA | No confundir candidato con aprobado |
| PLAN-DIM02 | Definir rúbrica conceptual y límites de cada dimensión candidata | Ocho fichas con constructo, evidencia y exclusiones | Revisión editorial |
| PLAN-DIM03 | Cruzar dimensiones con C01–C10 | Matriz 8×10 de aplicabilidad, evidencias y brechas | Sin rutas huérfanas |
| PLAN-DIM04 | Identificar solapamientos y doble conteo | Matriz de intersecciones y propuesta de separación | Evitar pesos prematuros |
| PLAN-DIM05 | Evaluar neutralidad de etapa, sector, tamaño y ausencia de ventas | Casos negativos y tratamiento de no aplicable | D-V9-001/002 |
| PLAN-DIM06 | Proponer cambios justificados de taxonomía | Opciones mantener/fusionar/dividir/redefinir/añadir/retirar, con impactos | Requiere nueva aprobación explícita |
| PLAN-DIM07 | Diseñar mapeo de versiones y comparabilidad histórica | Contrato conceptual de correspondencia y ruptura | D-V9-013 |
| PLAN-DIM08 | Revisar glosario y rúbricas es/en | Matriz de equivalencia bilingüe | D-V9-014 |
| PLAN-DIM09 | Preparar matriz de pruebas focalizadas futuras | Casos C01–C10 × dimensión × unknown/no aplicable | Sin ejecutar en PLAN_ONLY |
| PLAN-DIM10 | Documentar gate de aprobación de taxonomía final | Acta de decisión, identificadores/versiones y pendientes | Bloquea pesos/calibración |

### 24.5. Criterios de aceptación futuros
1. Cada dimensión retenida posee definición no circular, evidencia observable y exclusiones explícitas.
2. C01–C10 disponen de cobertura suficiente sin obligar a aplicar todas las dimensiones.
3. Ninguna dimensión penaliza ausencia de clientes en prelaunch o pausa por sí sola.
4. Una organización sin venta directa puede evaluarse sin conversiones comerciales obligatorias.
5. El mismo indicador no suma dos veces sin justificación aprobada.
6. Ausencia de CRM, web o anuncios no implica automáticamente baja madurez.
7. Evidencia desconocida no se interpreta como evidencia negativa.
8. Una dimensión fusionada/dividida no se compara numéricamente con su predecesora sin política validada.
9. Los conceptos y rúbricas son equivalentes en español e inglés.
10. La recomendación de cambio distingue propuesta de aprobación.
11. No se fijan pesos, umbrales ni calibraciones antes de aprobar la taxonomía.
12. El inventario del repositorio identifica exactamente qué reglas actuales deben reemplazarse en una futura implementación, sin modificarlas ahora.

### 24.6. Próxima decisión D-V9-017 — tratamiento de evidencia insuficiente
Opciones pendientes: **A**, resultado cualitativo provisional por dimensión con advertencia explícita; **B**, marcar «sin evidencia suficiente» y no asignar nivel a esa dimensión; **C**, solicitar preguntas adicionales solo para evidencias críticas y, si siguen faltando, marcar «sin evidencia suficiente» sin inventar nivel. Se recomienda evaluar C por coherencia con D-V9-003/004, pero **no está aprobada**. No alterar el presupuesto adaptativo sin definición adicional.

### 24.7. Estado
D-V9-001 a D-V9-016: APPROVED en el alcance de sus respectivas secciones; D-V9-017 PENDING. Taxonomía definitiva **PENDING**. **PLAN_ONLY**: no implementar código, ejecutar pruebas, cambiar CI, fusionar ni desplegar.

## Changelog adicional
- **1.17.0 / 2026-10-29:** D-V9-016 aprobada; auditoría 8×10, criterios de validez y neutralidad, diez tareas PLAN-DIM01–10, doce criterios de aceptación y siguiente decisión. Solo documentación.


## 25. Decisión D-V9-017 — evidencia crítica adicional y abstención de nivel (aprobada 2026-10-29)
**Aprobación expresa:** «solicitar preguntas adicionales solo para evidencia crítica y, si sigue siendo insuficiente, no asignar nivel». Estado APPROVED como comportamiento de producto, exclusivamente documental.

### 25.1. Reglas obligatorias
1. Antes de asignar un nivel a una dimensión aplicable, verificar suficiencia, pertinencia, consistencia y vigencia de la evidencia conforme a rúbrica versionada aún por aprobar.
2. Si falta **evidencia crítica** susceptible de obtenerse mediante entrevista, seleccionar la mínima pregunta adicional útil, adaptada al contexto, evitando redundancia, preguntas comerciales obligatorias y repetición de respuestas existentes.
3. Cada extensión debe registrar internamente dimensión afectada, vacío crítico, pregunta elegida, razón, resultado y consumo del presupuesto de interacción; ofrecer al usuario una explicación breve cuando corresponda.
4. Respetar D-V9-004: objetivo de hasta **24 interacciones**, con extensiones excepcionales solo justificadas por evidencia crítica. No interpretar la excepción como permiso para una entrevista ilimitada; número máximo, unidad de conteo y reglas de fatiga quedan **PENDING**.
5. Si la evidencia continúa insuficiente, el resultado de esa dimensión será **«Evidencia insuficiente / Sin nivel asignado»**; no producir nivel tentativo, puntuación cero, promedio imputado, falsa precisión ni clasificación negativa.
6. Distinguir **no aplicable**, **desconocido**, **contradictorio**, **insuficiente** y **sin respuesta**; ninguno se convierte automáticamente en bajo nivel.
7. Una dimensión sin nivel no debe contaminar otras dimensiones válidas ni producir un score global artificioso. Las recomendaciones podrán incluir acciones para obtener evidencia, sin fingir diagnóstico concluyente.
8. Las reglas de suficiencia, selección y abstención deben ser equivalentes en español e inglés y funcionar en C01–C10.
9. El informe autenticado y resumen anónimo deben indicar el límite de manera comprensible, conforme a D-V9-005/010; la explicación técnica completa queda en trazabilidad interna proporcional y respetuosa con privacidad.
10. En reevaluación D-V9-012, una dimensión sin nivel solo podrá obtenerlo mediante nueva evidencia suficiente; no por marcar acciones completadas. Comparaciones históricas D-V9-013 omitirán diferencias donde falte nivel comparable.

### 25.2. Contrato conceptual y decisiones pendientes
- Estados candidatos de evidencia: `sufficient`, `critical_gap`, `insufficient`, `not_applicable`, `contradictory`, `unknown`. Son etiquetas documentales, **no esquema aprobado**.
- Definir por dimensión: evidencia mínima, señales críticas, condiciones de abstención, prioridad de aclaración, máximo de repreguntas, detección de contradicción y salida segura.
- Definir unidad exacta de «interacción», presupuesto de extensión, criterio de detención por fatiga y manejo de abandono. Ningún umbral se inventa en esta decisión.
- La taxonomía final D-V9-016 continúa pendiente; no fijar umbrales de suficiencia definitivos ni calibraciones antes de aprobarla.

### 25.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-EV01 | Auditar reglas reales de suficiencia, salto, repregunta y abstención V9/QBV2 | Inventario de archivos, contratos, rutas y SHA | No asumir cobertura existente |
| PLAN-EV02 | Definir taxonomía de estados de evidencia y precedencias | Tabla de decisión para suficiente/crítica/insuficiente/no aplicable/contradicción | Aprobación técnica/editorial |
| PLAN-EV03 | Vincular vacíos críticos con preguntas del núcleo/lotes certificados | Matriz dimensión×evidencia×pregunta es/en | Solo preguntas aprobadas |
| PLAN-EV04 | Diseñar selección mínima y no redundante de aclaraciones | Pseudocódigo determinista y reglas de parada | Sin bucles ni repreguntas inútiles |
| PLAN-EV05 | Especificar presupuesto, unidad de interacción, extensiones y fatiga | Política cuantificada pendiente de aprobación | Coherencia con D-V9-004 |
| PLAN-EV06 | Diseñar resultados sin nivel, explicaciones y recomendaciones de obtención de evidencia | Ejemplos resumen/informe C01–C10 | Sin puntuaciones inventadas |
| PLAN-EV07 | Diseñar trazabilidad y minimización de datos de decisiones de abstención | Contrato conceptual y permisos | Privacidad/ownership |
| PLAN-EV08 | Preparar pruebas focalizadas futuras y casos de terminación | Matriz entradas→repreguntas→abstención, con casos límite es/en | No ejecutar en PLAN_ONLY |
| PLAN-EV09 | Revisar compatibilidad con seguimiento, reevaluación e historial | Reglas para nuevas evidencias y comparación | No inferir mejoras |

### 25.4. Criterios de aceptación futuros
1. Evidencia suficiente: no se generan preguntas adicionales innecesarias.
2. Falta crítica resoluble: se plantea una aclaración pertinente y certificada.
3. Falta no crítica: no se prolonga la entrevista.
4. Aclaración no respondida: se detiene según política y no se inventa nivel.
5. Respuestas contradictorias: se intenta aclaración justificada; si no se resuelve, abstención cuando afecte suficiencia.
6. No aplicable: no se penaliza ni se fuerza repregunta.
7. Preparación sin clientes: no se obliga a responder métricas de ventas.
8. Organización sin venta directa: no se exige conversión comercial.
9. Misma evidencia semántica en es/en: mismo estado de suficiencia y nivel o abstención.
10. Una dimensión insuficiente no invalida conclusiones sustentadas de otras.
11. Se respeta presupuesto adaptativo y toda excepción queda justificada.
12. El historial no muestra tendencia de una dimensión sin comparabilidad suficiente.
13. La recomendación de buscar evidencia no se convierte en oferta comercial obligatoria.
14. Ningún camino genera un bucle de repreguntas.

### 25.5. Próxima decisión D-V9-018 — control de duración y fatiga
Opciones por aprobar: **A** límite rígido de 24 interacciones; **B** objetivo 24, extensión excepcional acotada con aviso y opción de detenerse; **C** objetivo 24, extensión excepcional acotada y consentimiento explícito antes de continuar. D-V9-004/017 ya permiten extensión por evidencia crítica, por lo que **A requeriría revisar esa decisión previa**. La opción C es recomendación, **no aprobada**; faltan unidad de conteo y presupuesto exacto.

### 25.6. Estado
D-V9-001 a D-V9-017: APPROVED en sus alcances respectivos. D-V9-018 PENDING. Taxonomía y umbrales definitivos PENDING. **PLAN_ONLY**: no código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.18.0 / 2026-10-29:** D-V9-017 aprobada; repreguntas solo por evidencia crítica, abstención de nivel, nueve tareas PLAN-EV01–09, catorce criterios de aceptación y próxima decisión. Solo documentación.


## 26. Decisión D-V9-018 — objetivo 24 interacciones y extensión excepcional consentida (aprobada 2026-10-29)
**Aprobación expresa:** «objetivo de 24 interacciones y extensión excepcional acotada solo con consentimiento explícito del usuario». Estado APPROVED como política de producto; exclusivamente PLAN_ONLY. No se ha aprobado un número concreto de preguntas adicionales.

### 26.1. Reglas de experiencia y consentimiento
1. La entrevista adaptativa apunta a completarse en **hasta 24 interacciones** en condiciones ordinarias, sin rellenar ese objetivo artificialmente ni sacrificar suficiencia de evidencia.
2. Al llegar al objetivo, si falta evidencia crítica resoluble, el sistema debe **detener la continuación automática**, explicar brevemente el vacío y pedir consentimiento explícito antes de realizar preguntas adicionales.
3. El consentimiento debe ser una acción afirmativa inequívoca, específica para la extensión de entrevista; silencio, cierre, navegación o consentimiento general de cuenta no lo sustituyen.
4. La extensión será **excepcional y acotada**; el número máximo, la unidad exacta de interacción, el alcance de un consentimiento y las condiciones de una segunda solicitud quedan **PENDING** de decisión y diseño. No inferir autorización ilimitada.
5. Si el usuario rechaza, retira consentimiento o abandona, terminar o suspender conforme al flujo definido sin asignar nivel a dimensiones con evidencia insuficiente (D-V9-017). Las conclusiones de dimensiones con evidencia suficiente permanecen válidas.
6. Solo preguntar por evidencia crítica pendiente, con preguntas certificadas y no redundantes; nunca extender por motivos comerciales, curiosidad editorial, objetivos no confirmados o para llenar una cuota.
7. Mostrar de manera comprensible la razón de la extensión y la opción de finalizar con la información disponible, sin presión, culpa ni promesa de mejor puntuación.
8. El registro interno debe poder demostrar cuándo se alcanzó el umbral, qué vacío crítico motivó la solicitud, qué opción eligió el usuario y qué preguntas se formularon, con minimización y retención sujetas a política de privacidad.
9. Mantener equivalencia semántica y accesibilidad en español e inglés, y consistencia para C01–C10.
10. La definición de interacciones y límites no puede alterarse silenciosamente al añadir nuevos lotes editoriales D-V9-015 ni al revisar dimensiones D-V9-016.

### 26.2. Modelo conceptual de estados (pendiente de especificación final)
`normal_interview` → `critical_gap_at_target` → `consent_requested` → (`extension_authorized` / `extension_declined`) → `finished` o `insufficient_evidence`. Considerar también `consent_withdrawn`, `session_interrupted` y `extension_budget_exhausted`. Estas etiquetas describen el contrato a diseñar, **no** una máquina implementada ni aprobada al nivel de esquema.

### 26.3. Decisiones técnicas/editoriales aún abiertas
- Qué constituye una «interacción»: pregunta mostrada, respuesta enviada, turno de aclaración, pantalla de consentimiento, reintento o cambio de idioma.
- Presupuesto máximo adicional y si se mide globalmente o por dimensión; criterios para evitar fatiga y bucles.
- Persistencia de consentimiento durante pausas/reanudaciones y política de revocación.
- Criterio verificable de «evidencia crítica» por dimensión, sujeto a taxonomía definitiva.
- Cómo presentar progreso sin prometer un total fijo de preguntas ni revelar datos privados.

### 26.4. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-FAT01 | Inventariar conteos de preguntas, saltos, repreguntas y progreso en V9/QBV2 | Mapa de reglas, archivos, contratos y SHA | No asumir que 24 ya se cumple |
| PLAN-FAT02 | Definir unidad de interacción y eventos contables/no contables | Tabla de eventos y ejemplos bilingües | Aprobación de producto |
| PLAN-FAT03 | Proponer presupuesto adicional máximo y condiciones de parada | Alternativas cuantificadas con riesgos de fatiga | Requiere aprobación expresa |
| PLAN-FAT04 | Diseñar consentimiento explícito y retirada | Flujo UX, copy es/en, accesibilidad y estados | Sin continuación por defecto |
| PLAN-FAT05 | Diseñar selección de preguntas críticas y deduplicación | Contrato con D-V9-017 y banco editorial | Sin extensiones comerciales |
| PLAN-FAT06 | Especificar abandono, rechazo, agotamiento y reanudación | Matriz de salidas seguras y resultados parciales | No asignar niveles sin evidencia |
| PLAN-FAT07 | Diseñar trazabilidad mínima de consentimientos | Modelo conceptual de registro, permisos y retención pendiente | Privacidad por diseño |
| PLAN-FAT08 | Preparar pruebas focalizadas futuras de umbral, consentimiento y fatiga | Matriz entradas→estados→preguntas→salida es/en | No ejecutar durante PLAN_ONLY |

### 26.5. Criterios de aceptación futuros
1. Entrevista suficiente antes de 24 interacciones: finaliza sin extensión.
2. Umbral 24 con evidencia crítica faltante: solicita consentimiento antes de continuar.
3. Umbral 24 sin evidencia crítica: no solicita extensión.
4. Consentimiento rechazado: no formula preguntas adicionales y conserva conclusiones válidas.
5. Consentimiento afirmativo: solo formula aclaraciones críticas dentro de un límite aprobado.
6. Retirada de consentimiento: no continúa preguntando sin nueva autorización válida.
7. Presupuesto excepcional agotado: detiene entrevista y abstiene niveles insuficientes.
8. Cambio es↔en: no reinicia conteo ni invalida consentimiento aplicable.
9. Pregunta ya respondida: no se repite para consumir presupuesto.
10. Ausencia de CRM, anuncios o ventas: no se convierte por sí sola en motivo de extensión.
11. Abandono/reanudación: no duplica preguntas ni presume consentimiento nuevo.
12. Se puede finalizar con dimensiones suficientes y otras sin nivel, sin score global ficticio.
13. Cada extensión cuenta con motivo auditable, sin guardar más datos personales de los necesarios.
14. Ninguna pantalla induce a aceptar por miedo a una calificación peor.

### 26.6. Próxima decisión D-V9-019 — límite de extensión excepcional
Solicitar aprobación del **máximo adicional** tras 24 interacciones: **A** hasta 3 interacciones extra; **B** hasta 5; **C** hasta 8, siempre con consentimiento y solo por evidencia crítica. Son **opciones para deliberar, no umbrales validados ni aprobados**. Antes de codificar deberá definirse qué cuenta como interacción y validarse fatiga con recorridos C01–C10; no suponer que un límite por sí solo garantiza calidad.

### 26.7. Estado
D-V9-001 a D-V9-018: APPROVED en sus alcances. D-V9-019 PENDING; máximo adicional y unidad de conteo PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.19.0 / 2026-10-29:** D-V9-018 aprobada; consentimiento explícito, límites pendientes, ocho tareas PLAN-FAT01–08, catorce criterios de aceptación y próxima decisión. Solo documentación.


## 27. Decisión D-V9-019 — máximo de cinco interacciones adicionales consentidas (aprobada 2026-10-29)
**Aprobación expresa:** «máximo de 5 interacciones adicionales después de las 24, únicamente con consentimiento explícito y por evidencia crítica». Estado APPROVED como límite de producto, exclusivamente PLAN_ONLY.

### 27.1. Presupuesto de entrevista aprobado
- **Objetivo ordinario:** hasta **24 interacciones contabilizadas**; finalizar antes si la evidencia es suficiente.
- **Extensión excepcional:** **hasta 5 interacciones adicionales**, solo ante vacíos de evidencia crítica resolubles y después de consentimiento afirmativo específico, según D-V9-017/018.
- **Techo combinado:** **29 interacciones contabilizadas** por entrevista; no es una cuota a completar ni un permiso de repreguntar sin utilidad.
- El límite de 5 es **global por entrevista**, no por dimensión, bloque, idioma, sesión o reanudación. No reiniciarlo al cambiar idioma, pausar, reabrir o volver a una pregunta.
- No extender por fines comerciales, para cubrir todas las preguntas del banco, por dudas no críticas o para obtener una puntuación mayor.
- Al llegar al techo, concluir con las dimensiones sustentadas y marcar «Evidencia insuficiente / Sin nivel asignado» en las restantes; no fabricar puntuaciones, ceros ni resultados globales.
- Si se rechaza o retira el consentimiento, no consumir interacciones excepcionales adicionales. La opción de finalizar sin extensión debe permanecer accesible y no punitiva.
- El consentimiento no garantiza que se usarán las cinco interacciones: detenerse tan pronto se resuelva el vacío crítico o ya no exista una aclaración pertinente.
- La **unidad exacta de interacción** (pregunta mostrada vs. respuesta efectiva, aclaraciones, reintentos, consentimiento, cambios de idioma) **continúa pendiente**. La regla de 29 se aplica a la unidad que se apruebe posteriormente; no se puede afirmar cumplimiento técnico antes de fijarla.
- La política de fatiga y las pruebas focalizadas futuras deberán comprobar el límite en los diez escenarios C01–C10 y en español/inglés.

### 27.2. Reglas de asignación de las cinco oportunidades
1. Ordenar vacíos críticos por capacidad de desbloquear conclusiones pertinentes y por mínima carga para el usuario, sin alterar el ranking comercialmente.
2. Seleccionar preguntas certificadas, aplicables y no redundantes; deduplicar por evidencia semántica, no solo por texto.
3. Llevar un contador único por evaluación que preserve estado al reanudar y no dependa de la dimensión evaluada.
4. Si varias dimensiones comparten una misma evidencia, preferir una aclaración que resuelva el vacío común.
5. Si quedan vacíos pero ya no hay preguntas críticas útiles o el usuario desea finalizar, detenerse sin consumir el presupuesto restante.
6. Las reglas de suficiencia, abstención y comparación histórica prevalecen sobre el deseo de completar la entrevista.

### 27.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-LIM01 | Precisar la unidad de interacción y eventos contables | Tabla de eventos con ejemplos y excepciones | Requiere aprobación de producto |
| PLAN-LIM02 | Diseñar contador global persistente de 24+5 y estados de consentimiento | Contrato de estado, reanudación y límites | Sin reinicios indebidos |
| PLAN-LIM03 | Definir selección de aclaraciones críticas bajo presupuesto de cinco | Tabla de prioridades de evidencia, deduplicación y parada | Sin repreguntas comerciales |
| PLAN-LIM04 | Diseñar UX de umbral 24, consentimiento, progreso y techo 29 | Flujos y textos es/en accesibles | No consentimiento implícito |
| PLAN-LIM05 | Documentar salida con evidencia parcial, agotamiento y rechazo | Ejemplos por dimensión, resumen e informe | Sin nivel inventado |
| PLAN-LIM06 | Revisar compatibilidad con C01–C10, banco por lotes y versiones | Matriz de cobertura, riesgos de fatiga y decisiones abiertas | No asumir certificación |
| PLAN-LIM07 | Preparar pruebas focalizadas futuras de límites, reanudación e idiomas | Matriz de escenarios, resultados y contadores esperados | Sin ejecutar en PLAN_ONLY |

### 27.4. Casos de aceptación futuros
1. Evidencia suficiente en interacción 17: termina sin alcanzar 24.
2. Evidencia suficiente en interacción 24: termina sin solicitar extensión.
3. Vacío crítico tras 24: solicita consentimiento antes de la primera adicional.
4. Consentimiento denegado: cero interacciones excepcionales.
5. Consentimiento concedido y evidencia resuelta con dos aclaraciones: termina en 26, no fuerza 29.
6. Persisten vacíos después de cinco adicionales: se detiene en 29 y abstiene niveles insuficientes.
7. Dos dimensiones con vacíos: comparten un único presupuesto de cinco, no diez.
8. Cambio de idioma, sesión o reanudación: no reinicia el contador.
9. Pregunta duplicada o no aplicable: no se presenta para gastar presupuesto.
10. Una dimensión insuficiente no invalida otras con evidencia suficiente.
11. Organización sin ventas y negocio en preparación: no se generan extensiones por ausencia de ventas.
12. Consentimiento retirado: no se presentan nuevas aclaraciones.
13. El informe explica brevemente por qué falta nivel sin insinuar fracaso.
14. El sistema no afirma cumplir 24+5 mientras la unidad de conteo siga sin definirse.

### 27.5. Próxima decisión D-V9-020 — qué cuenta como interacción
Opciones por aprobar: **A** contar cada pregunta presentada, incluso si se omite; **B** contar cada pregunta con respuesta enviada (las omitidas no cuentan); **C** contar cada turno de pregunta o aclaración presentado que requiera decisión del usuario, incluyendo «No sé» y «Prefiero omitir», pero excluyendo navegación, consentimiento y cambio de idioma. La opción C es recomendación provisional para evitar eludir el presupuesto y mantener comparabilidad; **no está aprobada**. Precisar el tratamiento de errores técnicos y preguntas reabiertas antes de implementar.

### 27.6. Estado
D-V9-001 a D-V9-019: APPROVED en sus alcances respectivos. D-V9-020 PENDING. Unidad de interacción PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.20.0 / 2026-10-29:** D-V9-019 aprobada; techo 24+5 global, reglas de uso y detención, siete tareas PLAN-LIM01–07, catorce criterios de aceptación y siguiente decisión. Solo documentación.


## 28. Decisión D-V9-020 — unidad de interacción: turno de pregunta o aclaración (aprobada 2026-10-29)
**Aprobación expresa:** opción C: «cada turno de pregunta o aclaración que requiera decisión del usuario, incluidas respuestas No sé y Prefiero omitir; excluir navegación, consentimiento y cambio de idioma». Estado APPROVED; PLAN_ONLY.

### 28.1. Regla de contabilización
- Cuenta **una interacción** cada turno distinto de pregunta o aclaración **presentado** que solicite una respuesta o decisión, independientemente de si se responde, se elige «No sé» o se omite.
- No cuentan: navegación, cambio es/en, solicitud/aceptación/rechazo de consentimiento, animaciones, mensajes de acompañamiento ni visualización de progreso.
- Volver a mostrar una pregunta ya contabilizada para editar respuesta no debe consumir otra interacción; una aclaración semánticamente nueva sí cuenta. Errores técnicos, recargas y duplicación accidental no deben generar consumo adicional.
- El presupuesto **24 ordinarias + 5 excepcionales = máximo 29 turnos contabilizados** es global por evaluación, se conserva entre pausas/reanudaciones y no se reinicia por idioma, dimensión o sesión.
- El consentimiento explícito es requisito previo al primer turno excepcional; el usuario puede terminar sin penalización y las dimensiones sin evidencia suficiente quedan sin nivel.
- La distinción entre «presentado» y «respuesta enviada», el registro idempotente y los casos de pregunta compuesta requieren contrato detallado; no utilizar agrupación artificiosa para eludir el límite.

### 28.2. Tareas documentales
| ID | Tarea | Entregable |
| --- | --- | --- |
| PLAN-COUNT01 | Auditar el modelo actual de turno, navegación, persistencia y repregunta | Mapa de eventos y archivos/SHA |
| PLAN-COUNT02 | Especificar tabla contable y exclusiones, incluidos reintentos y preguntas reabiertas | Contrato de evento idempotente |
| PLAN-COUNT03 | Definir contador único y estado de consentimiento entre sesiones | Máquina de estados conceptual 24+5 |
| PLAN-COUNT04 | Preparar pruebas focalizadas futuras con omisiones, cambios de idioma y fallos de red | Matriz de conteos esperados, sin ejecutar |

### 28.3. Aceptación futura
Una pregunta omitida cuenta; editarla no cuenta dos veces; «No sé» cuenta; cambio de idioma, consentimiento y animación no cuentan; aclaración nueva cuenta; fallos/reintentos no duplican; sin consentimiento no existe turno 25; nunca se supera 29.

## 29. Decisión D-V9-021 — acompañamiento premium y progreso perceptible (solicitud expresa 2026-10-29)
**Solicitud del usuario:** durante el diagnóstico debe sentirse el avance mediante textos variados de acompañamiento («ya casi lo tenemos», «queremos saber más de ti», «solo falta confirmar pocas cosas»), animaciones, progreso, respuestas visuales a cada intervención y experiencia atractiva, interactiva y fluida. **Aprobado como objetivo de experiencia y requisito documental**; detalles visuales, copy definitivo y métricas aún requieren diseño y validación. PLAN_ONLY.

### 29.1. Principios UX
1. La entrevista se percibe como **conversación guiada y acompañada**, no como cuestionario burocrático. Cada respuesta válida recibe retroalimentación inmediata, breve y no distractora.
2. Separar **avance de turnos** (cuántos consumidos respecto al presupuesto ordinario), **cobertura de información** (temas/evidencias abordados) y **suficiencia diagnóstica** (si puede emitirse una conclusión por dimensión). Nunca confundir estas medidas.
3. La barra o indicador de progreso debe ser **honesto y adaptativo**: no prometer porcentaje exacto de finalización si el grafo cambia, no retroceder engañosamente ni simular madurez creciente con cada clic. Diseñar una representación por hitos/etapas y una indicación transparente del tramo excepcional consentido.
4. Textos de acompañamiento **contextuales y variados**, no repetidos mecánicamente ni asociados a una mejora de puntuación. Ejemplos editoriales candidatos, no copy aprobado: «Vamos conociendo mejor tu negocio», «Ya cubrimos varios aspectos importantes», «Estamos revisando los últimos detalles», «Hay un punto importante que conviene aclarar», «Puedes terminar con la información disponible».
5. Frases como «ya tenemos suficiente información» solo cuando la evidencia realmente sea suficiente; «ya casi terminamos» solo si el flujo permite sostener esa afirmación. Evitar promesas falsas de inmediatez, elogios automáticos vacíos o presión para aceptar extensión.
6. Animaciones y microinteracciones sobrias: transición de pregunta, confirmación de respuesta, actualización de hitos, estados de carga y cierre; no bloquear entrada ni introducir demoras artificiales.
7. Respetar `prefers-reduced-motion`, teclado, lectores de pantalla, foco, contraste, anuncios de estado no invasivos y conexiones/dispositivos modestos. Sin animación obligatoria.
8. Certificar textos, tono, estados y equivalencia de intención en español e inglés D-V9-014; la selección del mensaje no cambia scoring, rutas ni prioridades.
9. Respetar anonimato, privacidad, consentimiento y neutralidad comercial. La experiencia premium no es una mecánica para forzar registro o compra.
10. Si falta evidencia crítica al llegar a 24, mostrar explicación clara y consentimiento para hasta cinco turnos adicionales; distinguir progreso ordinario de extensión y permitir salida sin castigo.

### 29.2. Momentos de acompañamiento a especificar
- Inicio: bienvenida breve y expectativa realista de recorrido adaptativo.
- Después de una respuesta: acuse visual sutil, sin afirmar conclusión prematura.
- Hito de cobertura: mensaje sobre el tema completado, no sobre un porcentaje inventado.
- Transición de tema: explicar qué se explorará a continuación y por qué importa.
- Duda/«No sé»/omisión: respuesta neutral, sin culpabilizar ni insistencia repetitiva.
- Contradicción o aclaración: mensaje breve sobre necesidad de precisión.
- Cerca del cierre **solo cuando sea verificable**: orientación honesta sobre pasos restantes.
- Umbral 24: aviso de evidencia crítica, consentimiento explícito para extensión y opción de finalizar.
- Resultado parcial: reconocer dimensiones evaluadas y explicar las no evaluables sin tono negativo.
- Reanudación: restaurar hito y estado sin simular avance nuevo.

### 29.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-UXP01 | Auditar UX real de entrevista, estados de progreso y animaciones V9/QBV2 | Inventario de componentes/rutas/estados con SHA | No asumir UX implementada |
| PLAN-UXP02 | Diseñar modelo de progreso honesto para grafo adaptativo y extensión 24+5 | Contrato de hitos, turnos, cobertura y suficiencia | No porcentajes engañosos |
| PLAN-UXP03 | Elaborar matriz de microcopy es/en por evento, estado y contexto | Biblioteca bilingüe con condiciones de emisión | Revisión editorial humana |
| PLAN-UXP04 | Especificar sistema de movimiento y microinteracciones | Guía de transiciones, estados, duración por validar y reduced motion | Accesibilidad y rendimiento |
| PLAN-UXP05 | Diseñar feedback inmediato sin acoplar UI a scoring | Contrato de eventos de presentación y no interferencia | Evaluación determinista |
| PLAN-UXP06 | Diseñar estados de fatiga, pausa, error, incertidumbre y consentimiento | Flujos y prototipos documentales | Sin presión ni bloqueo |
| PLAN-UXP07 | Preparar pruebas focalizadas futuras de UX, accesibilidad y equivalencia es/en | Matriz de escenarios C01–C10 y casos límite | Sin ejecutar en PLAN_ONLY |
| PLAN-UXP08 | Definir criterios de evaluación de experiencia sin métricas inventadas | Plan de validación de comprensión, fricción y confianza | Sin declarar resultados no medidos |

### 29.4. Criterios de aceptación futuros
1. Cada respuesta tiene feedback perceptible sin demora artificial.
2. Los mensajes cambian por contexto y no se repiten de forma intrusiva.
3. No se anuncia «casi terminado» si quedan ramas o evidencia crítica inciertas.
4. El indicador no confunde preguntas contestadas con mejora de madurez.
5. La extensión consentida no provoca barra engañosa ni supera cinco turnos.
6. Omisiones y «No sé» reciben acompañamiento neutral.
7. Animaciones no impiden navegación por teclado ni lectura de pantalla.
8. Modo de movimiento reducido conserva toda la información funcional.
9. Cambiar es/en mantiene respuestas, contador e hitos.
10. Red lenta, recarga o reanudación no duplican efectos ni avance.
11. No se induce a registrarse ni comprar para «completar» artificialmente la entrevista.
12. Los resultados parciales explican incertidumbre sin aparentar fracaso.
13. Los mensajes no alteran motor, evidencia, ranking ni resultados.
14. El usuario puede avanzar con claridad incluso sin animaciones.

### 29.5. Próxima decisión D-V9-022 — representación principal del progreso
**A:** barra porcentual basada en turnos consumidos, con aviso de adaptabilidad; **B:** hitos de temas/etapas con indicador de avance, sin porcentaje exacto (recomendado para recorrido adaptativo); **C:** combinación de hitos y porcentaje estimado, sujeto a calibración y advertencias. **Ninguna opción está aprobada.** La elección debe respetar D-V9-020 y D-V9-021 y evitar progreso ficticio.

### 29.6. Estado
D-V9-001 a D-V9-020 APPROVED. D-V9-021 aprobado como objetivo UX y alcance documental; diseño definitivo PENDING. D-V9-022 PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.21.0 / 2026-10-29:** D-V9-020 aprobada (unidad de interacción por turno) y D-V9-021 incorporada (acompañamiento premium, microcopy, animaciones y progreso honesto); doce tareas documentales, criterios de aceptación y D-V9-022. Solo documentación.


## 30. Decisión D-V9-022 — progreso visual por hitos y etapas, sin porcentajes exactos engañosos (aprobada 2026-10-29)
**Aprobación expresa:** «progreso visual por hitos y etapas, sin porcentajes exactos engañosos». Estado APPROVED como dirección UX; exclusivamente PLAN_ONLY.

### 30.1. Contrato de progreso honesto
1. Representar avance mediante **hitos temáticos y etapas comprensibles**, determinados por la ruta adaptativa aplicable, no por un porcentaje de finalización inventado.
2. Distinguir hito **pendiente**, **en exploración**, **cubierto** y, cuando corresponda, **sin evidencia suficiente** o **no aplicable**. «Cubierto» significa que se ha recorrido o resuelto la evidencia exigida para ese hito, **no** que la madurez del negocio haya mejorado.
3. No completar hitos por mero número de respuestas ni marcar como completada una dimensión que todavía requiere evidencia crítica.
4. La interfaz puede comunicar progreso de entrevista y cobertura temática, pero nunca presentar el avance de la barra como puntuación, certificación, mejora de negocio o resultado anticipado.
5. Si la entrevista abre una rama relevante, actualizar los hitos sin hacer creer que el usuario perdió trabajo; documentar reglas de adición, ocultación y reordenamiento, y preservar hitos realmente cubiertos.
6. Mantener **separados** el contador interno de interacciones D-V9-020 (objetivo 24 + hasta 5 excepcionales) y la representación de hitos; no convertir automáticamente 12/24 en «50 % completado».
7. En el umbral de 24 con evidencia crítica faltante, presentar una **etapa excepcional de aclaración** únicamente tras consentimiento explícito; no retroceder ni reiniciar hitos ya alcanzados.
8. Al finalizar con evidencia parcial, mostrar los hitos cubiertos y las dimensiones sin nivel con lenguaje neutral y sin barra artificialmente «100 %».
9. Cambios es/en, edición de respuesta, pausa, reanudación, recarga y fallos transitorios no deben duplicar animaciones de éxito ni crear hitos ficticios.
10. Animaciones breves y opcionales, compatibles con movimiento reducido, teclado, lectores de pantalla, contraste y dispositivos modestos. El texto siempre comunica el estado sin depender de movimiento o color.
11. Mensajes de acompañamiento D-V9-021 se disparan por **eventos reales** (tema cubierto, transición, aclaración necesaria, cierre), con variación editorial controlada; «ya casi terminamos» solo cuando el estado lo justifique.
12. Certificar etiquetas, mensajes, accesibilidad y equivalencia semántica en español e inglés, para todos los escenarios C01–C10.

### 30.2. Modelo conceptual de hitos (no esquema implementado)
Cada hito propuesto requiere identificador estable, tema/propósito, condición de activación, evidencias vinculadas, estado, regla de finalización, precedencias o paralelismo, versión editorial, etiqueta es/en y explicación breve. La lista definitiva de hitos se deriva de la taxonomía y del banco aprobados; no se fija ahora un número universal de etapas.

**Ejemplos meramente ilustrativos:** «Conocemos tu negocio» → «Exploramos tu presencia digital» → «Revisamos cómo conectas con tu público» → «Preparamos tus conclusiones». No son nombres ni secuencia aprobados y pueden ser inaplicables en ciertos escenarios.

### 30.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-MILE01 | Auditar indicadores de progreso, componentes, grafo y persistencia V9/QBV2 | Inventario de archivos y SHA | No asumir que ya existe |
| PLAN-MILE02 | Definir taxonomía de hitos adaptativos y estados | Matriz C01–C10 × hito × condición de activación/cierre | Aprobación UX/editorial |
| PLAN-MILE03 | Especificar sincronización con evidencia y turnos 24+5 sin porcentaje falso | Contrato de eventos y transiciones | No confundir progreso con scoring |
| PLAN-MILE04 | Diseñar aparición de ramas, hitos no aplicables y cambios de ruta | Tabla de transiciones sin retroceso engañoso | Coherencia con grafo adaptativo |
| PLAN-MILE05 | Diseñar etapa de aclaración excepcional con consentimiento | Flujos de umbral 24, extensión hasta 5 y cierre parcial | D-V9-017–020 |
| PLAN-MILE06 | Diseñar microcopy contextual y movimiento es/en | Guía de mensajes, animación, reduced motion y accesibilidad | D-V9-014/021 |
| PLAN-MILE07 | Especificar reanudación, edición, idempotencia y errores | Máquina de estados conceptual y casos límite | Sin duplicar hitos |
| PLAN-MILE08 | Preparar pruebas focalizadas futuras de progreso honesto | Matriz eventos→hitos→texto→contador | No ejecutar en PLAN_ONLY |

### 30.4. Criterios de aceptación futuros
1. Una respuesta válida genera feedback sutil, pero no completa un hito sin evidencia suficiente.
2. El avance por hitos no se expresa como porcentaje exacto no sustentado.
3. La aparición de una rama nueva no borra hitos realmente cubiertos.
4. Un hito no aplicable no penaliza ni simula trabajo pendiente.
5. Una dimensión sin nivel puede coexistir con hitos de entrevista ya recorridos, con distinción clara.
6. Cambio de idioma conserva hitos y contador; etiquetas localizadas.
7. Reanudación conserva estados sin repetir efectos engañosos.
8. Editar una respuesta reevalúa pertinencia de hitos sin duplicar interacciones.
9. Al llegar a 24, la extensión solo aparece por evidencia crítica y consentimiento.
10. Hasta cinco aclaraciones excepcionales no convierten progreso previo en retroceso.
11. Mensajes «ya casi» y «suficiente información» solo aparecen cuando son verdaderos.
12. Movimiento reducido, teclado y lectores de pantalla conservan la información de progreso.
13. Negocios C01–C10 tienen hitos pertinentes, no una secuencia universal impuesta.
14. La animación y el texto no afectan el motor de evaluación ni las prioridades comerciales.

### 30.5. Próxima decisión D-V9-023 — estilo de acompañamiento
Opciones pendientes: **A** sobrio/profesional con mensajes discretos; **B** cercano y motivador con microcopy contextual variado y animaciones sutiles (recomendado); **C** expresivo/lúdico con celebraciones frecuentes y mayor movimiento. No aprobada ninguna; la elección no debe comprometer honestidad del progreso, accesibilidad ni fluidez.

### 30.6. Estado
D-V9-001 a D-V9-022: APPROVED en sus alcances; D-V9-023 PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.22.0 / 2026-10-29:** D-V9-022 aprobada; progreso adaptativo por hitos, estados y límites de representación, ocho tareas PLAN-MILE01–08, catorce criterios de aceptación y siguiente decisión. Solo documentación.


## 31. Decisión D-V9-023 — acompañamiento cercano, motivador y elegante (aprobada 2026-10-29)
**Aprobación expresa:** «acompañamiento cercano, motivador y elegante, con mensajes contextuales variados y microanimaciones sutiles». Estado APPROVED como dirección de voz, tono y movimiento; exclusivamente PLAN_ONLY.

### 31.1. Principios de voz y tono
1. La voz de Vecidya será **cercana, clara, motivadora y profesional**, sin infantilizar, tutear de forma intrusiva, exagerar logros ni convertir la entrevista en un juego.
2. Los mensajes acompañan **hechos verificables del flujo**: respuesta recibida, tema cubierto, cambio de enfoque, aclaración crítica, pausa, reanudación y cierre. Nunca simulan conclusiones del motor ni prometen resultados.
3. Variar el microcopy por contexto y evitar repeticiones consecutivas; definir reglas de frecuencia, prioridades, silencio y fallback para que la interfaz no interrumpa cada respuesta con texto innecesario.
4. Reconocer el esfuerzo de responder sin elogios automáticos sobre la calidad del negocio. Evitar culpa, presión, urgencia ficticia, promesas de «mejor puntuación» y persuasión para aceptar extensiones o registrarse.
5. Mensajes como «ya casi terminamos» solo se permiten si el estado adaptativo sustenta proximidad al cierre; «tenemos suficiente información» solo si la evidencia realmente lo confirma.
6. «No sé», «Prefiero omitir» y contradicciones reciben acompañamiento neutral y orientación útil, no reproches.
7. Mantener **equivalencia de intención y naturalidad** en español e inglés; no exigir traducción literal de expresiones coloquiales. Revisar vocabulario de negocio, claridad y accesibilidad editorial.
8. La personalidad pertenece a **Vecidya**, no a GHL ni a un proveedor externo; no incorporar ventas encubiertas al acompañamiento.

### 31.2. Sistema conceptual de microanimaciones
- **Respuesta registrada:** feedback visual breve, estable y reversible si se edita.
- **Transición de pregunta:** cambio suave sin bloquear el foco ni el control del usuario.
- **Hito cubierto:** señal discreta y comprensible por texto; sin confundir cobertura con mejora de madurez.
- **Cambio de tema:** transición espacial o de énfasis consistente, no espectáculo.
- **Aclaración excepcional:** presentación serena del motivo y consentimiento explícito, sin animaciones persuasivas.
- **Carga/error/reanudación:** estados honestos, sin simular procesamiento ni progreso inexistente.
- Preferir movimiento funcional y ligero; documentar límites de duración, frecuencia, rendimiento y contraste **antes** de implementarlo. Respetar movimiento reducido, teclado, lectores de pantalla, foco y dispositivos de recursos limitados.

### 31.3. Biblioteca de microcopy candidata (no aprobada palabra por palabra)
| Momento verificable | Español (ejemplo) | English (example) | Restricción |
| --- | --- | --- | --- |
| Inicio | Vamos a conocer mejor tu negocio. | Let's get to know your business. | No prometer duración exacta |
| Respuesta registrada | Gracias, seguimos con el siguiente aspecto. | Thanks, let's look at the next area. | No afirmar mejora |
| Cambio de tema | Ahora veremos cómo conectas con tu público. | Next, let's explore how you connect with your audience. | Solo si aplica |
| Hito cubierto | Ya revisamos un aspecto importante. | We've covered an important area. | Evidencia de cobertura |
| Omisión | Podemos continuar con lo que sí conoces. | We can continue with what you know. | Sin presión |
| Aclaración crítica | Hay un detalle que nos ayudaría a precisar el resultado. | One detail could help us make the result more precise. | Solo si crítico |
| Cerca del cierre | Estamos revisando los últimos detalles. | We're reviewing the final details. | Solo si verificable |
| Extensión consentida | Podemos hacer unas preguntas adicionales o finalizar aquí. | We can ask a few more questions or finish here. | Consentimiento antes de preguntar |
| Resultado parcial | Algunas áreas necesitan más información para evaluarse. | Some areas need more information to be assessed. | Sin nivel inventado |
Esta tabla es un **borrador editorial**; no constituye textos certificados ni implica que cada mensaje deba mostrarse siempre.

### 31.4. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-TONE01 | Auditar tono, textos, animaciones y componentes actuales V9/QBV2 | Inventario de archivos, estados y SHA | No asumir calidad existente |
| PLAN-TONE02 | Definir guía de voz Vecidya para entrevista es/en | Manual de tono, términos, prohibiciones y ejemplos | Aprobación editorial |
| PLAN-TONE03 | Crear biblioteca versionada de microcopy por evento y condición | Matriz mensaje×estado×idioma×frecuencia | Sin mensajes falsos |
| PLAN-TONE04 | Diseñar política de variedad, repetición, silencio y prioridades | Tabla determinista de selección y fallback | Sin fatiga de mensajes |
| PLAN-TONE05 | Especificar lenguaje de movimiento y feedback funcional | Guía de microinteracciones, reduced motion y rendimiento | Accesibilidad |
| PLAN-TONE06 | Documentar integración desacoplada de motor y UI | Contrato de eventos de presentación | Sin alterar scoring |
| PLAN-TONE07 | Preparar revisión UX bilingüe y pruebas focalizadas futuras | Casos C01–C10, teclado, lector, errores y reanudación | No ejecutar en PLAN_ONLY |
| PLAN-TONE08 | Definir criterios de aceptación editorial y visual premium | Checklist de claridad, consistencia, sobriedad y no manipulación | Validación humana pendiente |

### 31.5. Criterios de aceptación futuros
1. Mensajes cálidos y profesionales, sin infantilización ni entusiasmo excesivo.
2. Cada texto depende de un evento real y un contexto aplicable.
3. Mensajes consecutivos no se repiten mecánicamente.
4. El sistema puede permanecer en silencio cuando otro mensaje distraería.
5. No anuncia «casi terminado» con evidencia crítica o ramas pendientes inciertas.
6. No confunde un hito cubierto con madurez mejorada.
7. «No sé» y omisiones reciben tratamiento neutral.
8. Consentimiento para hasta cinco turnos adicionales sin presión.
9. Español e inglés expresan intención equivalente y natural.
10. Movimiento reducido conserva toda la información y las funciones.
11. Animaciones no bloquean foco, respuesta ni navegación.
12. Errores y reanudación no simulan avances o celebraciones duplicadas.
13. Cambiar microcopy o animaciones no modifica evidencia, niveles ni prioridades.
14. El acompañamiento funciona sin servicios Vecidya, Aprende ni GHL.

### 31.6. Próxima decisión D-V9-024 — formato de presentación de preguntas
Opciones pendientes: **A**, una pregunta por pantalla con transición fluida; **B**, grupos cortos de preguntas por tema; **C**, formato híbrido adaptativo: una pregunta principal por vista y agrupación únicamente de campos breves inseparables (recomendado provisionalmente). **Ninguna opción aprobada**. Debe preservarse la unidad de interacción D-V9-020 y evitar agrupar artificialmente preguntas para eludir 24+5.

### 31.7. Estado
D-V9-001 a D-V9-023: APPROVED en sus alcances respectivos; D-V9-024 PENDING. Textos y animaciones definitivos PENDING de revisión editorial/UX. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.23.0 / 2026-10-29:** D-V9-023 aprobada; guía de tono, biblioteca candidata es/en, sistema de microanimaciones, ocho tareas PLAN-TONE01–08, catorce criterios de aceptación y siguiente decisión. Solo documentación.


## 32. Decisión D-V9-024 — presentación híbrida adaptativa de preguntas (aprobada 2026-10-29)
**Aprobación expresa:** «presentación híbrida adaptativa, una pregunta principal por vista y agrupación solo de campos breves inseparables». Estado APPROVED como criterio de experiencia y estructura de entrevista; exclusivamente PLAN_ONLY.

### 32.1. Reglas de presentación y contabilización
1. Mostrar **una pregunta o decisión principal por vista** como patrón por defecto; evitar pantallas de formulario extensas, ruido visual y desplazamientos innecesarios.
2. Permitir agrupación solo de **campos breves semánticamente inseparables** que integren una misma decisión o respuesta (por ejemplo, un valor con su unidad), cuando ello mejore claridad y accesibilidad.
3. **No agrupar preguntas independientes** bajo un mismo turno para eludir D-V9-020 ni el límite D-V9-019 de 24 + hasta 5 interacciones; si una vista requiere decisiones independientes, modelarlas y contarlas como turnos distintos o separarlas.
4. Una pregunta presentada que requiere decisión consume una interacción aunque se responda «No sé», se omita o se cambie posteriormente; volver atrás o editar una respuesta ya contabilizada no añade una nueva interacción. Una aclaración semánticamente nueva sí cuenta.
5. El formato de vista, las agrupaciones y las transiciones no alteran suficiencia de evidencia, selección adaptativa, ranking, scoring, consentimientos ni comparabilidad histórica.
6. Mantener jerarquía visual clara: pregunta, contexto breve si necesario, opciones/entrada, acciones de avanzar/retroceder y progreso por hitos D-V9-022.
7. La confirmación de respuesta y el paso a la siguiente vista deben ser fluidos pero reversibles; no avanzar de forma sorpresiva cuando haya múltiples selecciones, validación pendiente o riesgo de error.
8. Priorizar uso móvil, controles táctiles accesibles, teclado, lectores de pantalla, foco, errores recuperables, latencia y dispositivos modestos; respetar movimiento reducido.
9. Conservar respuestas, hitos y contador en pausa/reanudación y cambio es/en; evitar duplicación por recargas o fallos de red.
10. La extensión excepcional después de 24 turnos requiere consentimiento explícito y se presenta como etapa diferenciada; el diseño híbrido no permite saltarse ese gate.

### 32.2. Criterios editoriales para agrupar campos
- **Admisible, sujeto a revisión:** campos de una misma respuesta indivisible, como cantidad y unidad, o una selección con precisión contextual breve.
- **No admisible:** dos preguntas que puedan responderse por separado, dos dimensiones independientes, una pregunta comercial añadida, o subpreguntas ocultas en una tarjeta para reducir el contador.
- **Caso dudoso:** documentar unidad semántica, carga cognitiva, posibilidad de omisión parcial y cómo se cuenta cada decisión antes de certificar el ítem.
- La agrupación no convierte un conjunto de evidencias distintas en evidencia suficiente automáticamente.

### 32.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-VIEW01 | Auditar pantallas, componentes, tipos de preguntas y navegación V9/QBV2 | Inventario de rutas, archivos, estados y SHA | No asumir implementación |
| PLAN-VIEW02 | Definir patrón de una pregunta principal por vista | Especificación UX móvil/escritorio y jerarquía | Accesibilidad |
| PLAN-VIEW03 | Establecer criterios formales de agrupación semántica | Matriz de ejemplos admitidos/rechazados es/en | Revisión editorial |
| PLAN-VIEW04 | Alinear agrupaciones con unidad contable D-V9-020 | Contrato vista×decisión×turno y casos de edición | No eludir 24+5 |
| PLAN-VIEW05 | Diseñar transición, validación, autoavance y navegación reversible | Flujos de interacción, errores y estados | Sin pérdida de respuesta |
| PLAN-VIEW06 | Integrar conceptualmente hitos, microcopy y microanimaciones D-V9-021–023 | Especificación de presentación desacoplada | No afectar motor |
| PLAN-VIEW07 | Documentar pausa, reanudación, idioma y recuperación de errores | Máquina de estados conceptual e idempotencia | Sin doble conteo |
| PLAN-VIEW08 | Preparar pruebas focalizadas futuras C01–C10 y accesibilidad | Matriz de casos, conteos y resultados esperados | No ejecutar en PLAN_ONLY |

### 32.4. Criterios de aceptación futuros
1. La vista ordinaria presenta una decisión principal claramente identificable.
2. Campos inseparables pueden convivir sin convertirse en decisiones ocultas.
3. Dos preguntas independientes no consumen un único turno por compartir pantalla.
4. «No sé» y «Prefiero omitir» cuentan como turno presentado.
5. Volver atrás y editar no duplica contador.
6. Una aclaración nueva consume turno y respeta consentimiento si supera 24.
7. Las opciones múltiples no provocan autoavance antes de completar la decisión.
8. La validación de errores no obliga a reiniciar entrevista.
9. Hitos y mensajes reflejan eventos reales, no número de pantallas.
10. Transiciones no bloquean interacción ni lectores de pantalla.
11. En móvil, controles y textos siguen siendo legibles y utilizables.
12. Cambiar idioma conserva respuestas y estructura semántica.
13. Reanudación no repite preguntas ya contabilizadas por accidente.
14. C01–C10 reciben vistas pertinentes sin imponer campos no aplicables.
15. El formato de presentación no altera resultados del motor.
16. El límite global de 29 turnos se mantiene sin agrupaciones artificiosas.

### 32.5. Próxima decisión D-V9-025 — avance automático después de responder
Opciones pendientes: **A** avanzar automáticamente en todas las respuestas válidas; **B** requerir siempre pulsar «Continuar»; **C** avance contextual: automático solo para selección única inequívoca y reversible, manual para múltiples selecciones, texto libre, datos sensibles o validaciones complejas (**recomendado provisionalmente**). Ninguna opción aprobada. Debe respetar accesibilidad, control del usuario, reducción de movimiento y evitar cambios inesperados.

### 32.6. Estado
D-V9-001 a D-V9-024 APPROVED en sus alcances respectivos. D-V9-025 PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.24.0 / 2026-10-29:** D-V9-024 aprobada; patrón híbrido de preguntas, agrupación semántica sin eludir 24+5, ocho tareas PLAN-VIEW01–08, dieciséis criterios de aceptación y siguiente decisión. Solo documentación.


## 33. Decisión D-V9-025 — avance contextual según tipo de respuesta (aprobada 2026-10-29)
**Aprobación expresa:** «avance contextual, automático solo en selección única inequívoca y reversible, y manual en respuestas múltiples, texto libre, datos sensibles o validaciones complejas». Estado APPROVED; exclusivamente PLAN_ONLY.

### 33.1. Contrato de avance
1. **Avance automático** únicamente después de registrar correctamente una respuesta de **selección única, inequívoca y reversible**, cuando la opción no exija confirmación adicional ni active una consecuencia sensible.
2. **Avance manual mediante «Continuar»** para selección múltiple, texto libre, información sensible, validación compleja, respuestas compuestas y cualquier caso de ambigüedad.
3. El avance automático no puede ocultar validaciones pendientes, errores, preguntas complementarias obligatorias ni confirmaciones de consentimiento.
4. La selección debe quedar registrada antes de navegar; ante error de persistencia, mostrar estado recuperable sin duplicar respuestas ni interacciones.
5. Mantener navegación hacia atrás y edición de respuestas, con reevaluación de pertinencia de ramas posteriores; no consumir un turno nuevo al reabrir una pregunta ya contabilizada.
6. Una transición, animación, mensaje de acompañamiento o pulsación de «Continuar» **no es una nueva interacción** según D-V9-020; la unidad sigue siendo el turno de pregunta o aclaración presentado.
7. Respetar presupuesto ordinario de 24 turnos y extensión excepcional de hasta 5, solo con consentimiento explícito previo a la primera pregunta adicional.
8. Evitar avance sorpresivo para personas que usan teclado, lector de pantalla o tecnologías de asistencia; diseñar foco y anuncios accesibles. Si el avance automático no es seguro o predecible en un contexto, usar avance manual.
9. El sistema debe permitir lectura suficiente de la selección y del feedback sin retrasos artificiales; los tiempos concretos y preferencias de interacción quedan pendientes de diseño/validación.
10. Las reglas son independientes de idioma, sector y escenario C01–C10; no alteran selección adaptativa, evidencia, madurez, ranking ni vinculación con GHL.
11. Cambiar idioma, pausar, reanudar o recuperar un fallo no debe disparar avance automático duplicado.
12. El estilo de movimiento y mensajes debe obedecer D-V9-021–023, con `prefers-reduced-motion` y estados honestos.

### 33.2. Matriz de comportamiento candidata
| Tipo de entrada | Avance por defecto | Condición o restricción |
| --- | --- | --- |
| Opción única simple | Automático | Solo si inequívoca, persistida y reversible |
| Opción única con consecuencias sensibles | Manual | Confirmación explícita |
| Selección múltiple | Manual | Permitir seleccionar/deseleccionar antes de continuar |
| Texto libre | Manual | Validación y revisión antes de continuar |
| Datos sensibles | Manual | Minimización, información contextual y control |
| Campos breves inseparables | Manual salvo justificación editorial específica | No convertir decisiones independientes en una sola |
| «No sé» / «Prefiero omitir» | Según tipo de control y seguridad | Cuenta turno; no culpabilizar |
| Consentimiento de extensión | Acción afirmativa separada | No es turno contable ni se autoacepta |
| Error de validación o red | No avanzar | Mensaje recuperable e idempotencia |
La matriz requiere especificación UX detallada; no describe comportamiento ya implementado.

### 33.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-AUTO01 | Auditar controles, navegación, validación y persistencia actuales V9/QBV2 | Inventario de archivos, estados y SHA | No asumir implementación |
| PLAN-AUTO02 | Clasificar preguntas certificadas por tipo y riesgo de avance | Matriz pregunta×entrada×modo de avance | Revisión editorial/UX |
| PLAN-AUTO03 | Especificar secuencia selección→validación→persistencia→feedback→navegación | Contrato de estados, fallos e idempotencia | Sin pérdida ni duplicación |
| PLAN-AUTO04 | Diseñar retroceso, edición y recomputación de ramas posteriores | Diagramas de navegación y conservación del contador | D-V9-020 |
| PLAN-AUTO05 | Definir accesibilidad de avance automático/manual | Reglas de foco, teclado, lector, movimiento reducido | Revisión accesibilidad |
| PLAN-AUTO06 | Integrar hitos, microcopy y microanimaciones sin acoplamiento al motor | Contrato de eventos de presentación | D-V9-021–023 |
| PLAN-AUTO07 | Preparar pruebas focalizadas futuras para cada tipo de entrada | Matriz C01–C10, es/en, errores y 24+5 | No ejecutar en PLAN_ONLY |
| PLAN-AUTO08 | Documentar preferencia opcional de control de avance y sus implicaciones | Alternativas UX con riesgos y decisión pendiente | No presumir aprobación |

### 33.4. Criterios de aceptación futuros
1. Selección única inequívoca, reversible y persistida puede avanzar automáticamente.
2. Selección múltiple no avanza hasta pulsar «Continuar».
3. Texto libre y campos sensibles requieren confirmación manual.
4. Validación fallida o red caída impide avanzar sin perder respuesta.
5. Una opción ambigua no dispara autoavance.
6. Navegar atrás y editar conserva turno ya contado.
7. Cambiar una respuesta puede reabrir ramas sin duplicar contador.
8. Animación o navegación no consume interacción adicional.
9. El consentimiento excepcional no se acepta por autoavance.
10. La pregunta 25 solo aparece tras consentimiento afirmativo.
11. No se supera el máximo global de 29 turnos.
12. Teclado y lector de pantalla mantienen control y foco predecible.
13. Movimiento reducido no elimina información ni controles.
14. Reanudación y cambio de idioma no disparan navegación accidental.
15. Los hitos reflejan cobertura real, no velocidad de respuesta.
16. La política de avance no modifica evaluación ni resultados.

### 33.5. Próxima decisión D-V9-026 — control del usuario sobre el autoavance
Opciones pendientes: **A** autoavance contextual obligatorio sin ajuste; **B** autoavance contextual por defecto con opción visible «Prefiero avanzar manualmente» que se conserva durante la entrevista (recomendado); **C** preguntar antes de iniciar si prefiere automático o manual. Ninguna opción aprobada. La elección debe preservar la política D-V9-025 y accesibilidad.

### 33.6. Estado
D-V9-001 a D-V9-025 APPROVED en sus alcances respectivos; D-V9-026 PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.25.0 / 2026-10-29:** D-V9-025 aprobada; reglas de avance contextual, matriz de tipos de entrada, ocho tareas PLAN-AUTO01–08, dieciséis criterios de aceptación y siguiente decisión. Solo documentación.


## 34. Decisión D-V9-026 — control reversible del avance contextual (aprobada 2026-10-29)
**Aprobación expresa:** «avance contextual por defecto, con opción de desactivarlo y preferencia conservada durante la entrevista». Estado APPROVED; exclusivamente PLAN_ONLY.

### 34.1. Contrato de preferencia y control
1. Iniciar la entrevista con el **avance contextual habilitado por defecto**, según D-V9-025: automático únicamente en selección única inequívoca, reversible y registrada; manual en selección múltiple, texto libre, datos sensibles y validaciones complejas.
2. Ofrecer un control **descubrible y accesible** «Prefiero avanzar manualmente» que desactive el autoavance sin obligar a contestar una pregunta adicional ni interrumpir el flujo.
3. Permitir **volver a activar** el avance contextual durante la entrevista; el ajuste es reversible y no modifica respuestas ni evidencias.
4. Conservar la preferencia en navegación, cambio de idioma, pausa, recarga y reanudación de la **misma evaluación**, sujeto a la política de persistencia/privacidad que se apruebe. No presumir sincronización entre dispositivos o evaluaciones distintas.
5. Cambiar la preferencia no consume una interacción D-V9-020 ni altera el presupuesto global de **24 + hasta 5** turnos D-V9-019.
6. La preferencia nunca habilita autoavance en tipos de respuesta que D-V9-025 exige confirmar manualmente, ni elude validación, consentimiento de extensión o controles sensibles.
7. Aplicar el cambio de modo de forma predecible: no disparar navegación retroactiva ni autoavance de una respuesta ya seleccionada por el mero hecho de activar el ajuste.
8. Mostrar el estado actual del modo con etiqueta comprensible, foco y semántica accesibles; no depender de color, animación o iconografía para entenderlo.
9. Respetar `prefers-reduced-motion` y tecnología asistiva; si el autoavance contextual no puede realizarse de manera segura, priorizar control manual sin pérdida de funcionalidad.
10. Registrar solo la información mínima necesaria para restaurar el modo dentro de la evaluación; definir caducidad y consentimiento de almacenamiento en el diseño de privacidad, sin inventar retención.
11. Mantener textos naturales y equivalentes en español e inglés; no presentar el modo manual como inferior o más lento de forma culpabilizante.
12. El control de avance es puramente de **presentación/interacción** y no altera rutas adaptativas, suficiencia de evidencia, scoring, recomendaciones, hitos de cobertura ni servicios GHL.

### 34.2. Estados conceptuales (sin implementación)
- `contextual_enabled` (predeterminado).
- `manual_selected` (usuario desactiva autoavance).
- `contextual_reenabled` (usuario revierte su preferencia).
- `restored_preference` (se reanuda la misma evaluación con modo conservado).
- `manual_safety_fallback` (contexto de accesibilidad, validación o error impide autoavance seguro).

Los nombres son ilustrativos; no constituyen un esquema ni una API aprobada.

### 34.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-PREF01 | Auditar preferencias, navegación y persistencia de entrevista V9/QBV2 | Inventario de archivos, estados y SHA | No asumir implementación |
| PLAN-PREF02 | Diseñar ubicación, etiquetas y estados del control de modo | Flujos UX móvil/escritorio y es/en | Accesibilidad |
| PLAN-PREF03 | Especificar contrato de preferencia reversible por evaluación | Tabla de transiciones y restauración | Sin navegación retroactiva |
| PLAN-PREF04 | Definir precedencia entre preferencia y restricciones D-V9-025 | Matriz tipo de respuesta × modo × seguridad | Nunca autoavance prohibido |
| PLAN-PREF05 | Documentar persistencia mínima, pausa y reanudación | Contrato conceptual y decisiones de privacidad pendientes | Sin asumir sincronización global |
| PLAN-PREF06 | Integrar mensajes, hitos y animaciones D-V9-021–023 | Reglas de presentación sin acoplar al motor | Sin scoring afectado |
| PLAN-PREF07 | Preparar pruebas focalizadas futuras de cambio de modo y accesibilidad | Matriz es/en, C01–C10, fallos y 24+5 | No ejecutar en PLAN_ONLY |
| PLAN-PREF08 | Definir criterios editoriales de claridad y control del usuario | Checklist UX y validación humana pendiente | Sin presión hacia autoavance |

### 34.4. Criterios de aceptación futuros
1. Una evaluación nueva empieza con avance contextual habilitado.
2. El usuario puede desactivarlo sin salir de la pregunta actual.
3. Con modo manual, una selección única requiere «Continuar».
4. El usuario puede reactivar el modo contextual.
5. Reactivarlo no provoca salto inesperado sobre la pregunta actual.
6. Selecciones múltiples y texto libre siguen siendo manuales en ambos modos.
7. Datos sensibles y validaciones complejas no autoavanzan.
8. El cambio de preferencia no consume turno ni duplica respuestas.
9. Navegar atrás y editar conserva preferencia y contador.
10. Reanudar la misma evaluación restaura el modo elegido cuando existe estado persistido válido.
11. Cambio es/en conserva modo y ofrece etiquetas equivalentes.
12. Errores de red no provocan avance ni pérdida de preferencia confirmada.
13. El control funciona con teclado, lector de pantalla y movimiento reducido.
14. Consentimiento de extensión 24+5 sigue siendo explícito e independiente del modo.
15. Hitos y resultados no cambian por seleccionar manual o contextual.
16. No se requiere cuenta, CRM ni GHL para elegir modo durante una entrevista anónima.

### 34.5. Próxima decisión D-V9-027 — pausa y reanudación del diagnóstico anónimo
Opciones pendientes: **A** solo reanudar en la misma pestaña mientras permanezca abierta; **B** reanudar en el mismo dispositivo durante un período limitado con almacenamiento local y aviso claro (recomendado provisionalmente, sujeto a privacidad); **C** ofrecer enlace o código temporal de reanudación entre dispositivos con medidas de seguridad adicionales. Ninguna opción aprobada. Definir retención, protección, revocación y compatibilidad con el flujo de reclamar resultados D-V9-005 antes de implementar.

### 34.6. Estado
D-V9-001 a D-V9-026 APPROVED en sus alcances respectivos; D-V9-027 PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.26.0 / 2026-10-29:** D-V9-026 aprobada; control reversible del autoavance contextual, persistencia por evaluación, ocho tareas PLAN-PREF01–08, dieciséis criterios de aceptación y siguiente decisión. Solo documentación.


## 35. Decisión D-V9-027 — guardado temporal y reanudación anónima en el mismo dispositivo (aprobada 2026-10-29)
**Aprobación expresa:** «guardado temporal y reanudación del diagnóstico anónimo en el mismo dispositivo, con privacidad y retención limitada». Estado APPROVED como política de experiencia y alcance; exclusivamente PLAN_ONLY.

### 35.1. Contrato de continuidad
1. Permitir que una evaluación **anónima e incompleta** se pause y reanude desde el **mismo dispositivo y contexto de navegador compatible**, sin exigir registro o vínculo con GHL.
2. Conservar el mínimo estado necesario para continuar de forma coherente: respuestas, preguntas/turnos ya presentados, contador único D-V9-020, consentimiento de extensión y su alcance, hitos D-V9-022, versión del cuestionario, posición o ruta adaptativa y preferencia de avance D-V9-026.
3. La reanudación **no reinicia** el presupuesto de 24 turnos ordinarios + hasta 5 excepcionales, no repite preguntas contabilizadas por accidente y no concede nuevo consentimiento implícito.
4. La persistencia debe ser **temporal, con caducidad y eliminación**; el plazo exacto, su punto de inicio y si se renueva con actividad permanecen PENDING de aprobación.
5. Informar con claridad, antes de almacenar información de entrevista, qué se conserva, durante cuánto tiempo una vez aprobado, limitaciones del dispositivo compartido y cómo eliminarlo; definir la base jurídica/consentimiento aplicable antes de implementar.
6. Proporcionar acción comprensible para **descartar progreso local** y empezar de nuevo de manera intencional, con confirmación proporcional y sin fingir que elimina copias de servidor que pudieran existir.
7. Tratar como amenaza principal la exposición de respuestas en **dispositivos compartidos**: evitar mostrar datos sensibles en previsualizaciones, avisar del riesgo y especificar controles de acceso, cifrado y minimización según la arquitectura finalmente elegida.
8. No afirmar que el almacenamiento es «solo local» ni «cifrado» antes de aprobar y verificar una arquitectura concreta. Documentar alternativas (almacenamiento local, sesión, token, backend) y sus límites reales.
9. Si el estado está caducado, corrupto, incompatible con la versión editorial o ausente, presentar una salida honesta y recuperable; no reconstruir respuestas ni resultados inventados.
10. Al reanudar, restaurar idioma, preferencias y hitos sin animaciones de éxito duplicadas; permitir continuar o descartar.
11. La política de reclamo de informe detallado mediante cuenta D-V9-005 debe diseñarse **separada** del guardado anónimo; no convertir la reanudación en registro obligatorio ni transferir datos sin autorización.
12. La evaluación debe seguir funcionando cuando el guardado no esté disponible, con aviso claro de que el progreso podría no recuperarse.
13. Asegurar compatibilidad conceptual con C01–C10, español/inglés, anonimato y separación Vecidya/GHL; no usar datos guardados para marketing por defecto.

### 35.2. Modelo conceptual de estados (no implementación)
`in_progress` → `saved_temporarily` → `resumable` → `resumed` / `discarded` / `expired` / `unavailable` / `incompatible`. Las etiquetas son ilustrativas y no fijan almacenamiento, API ni política de privacidad.

### 35.3. Decisiones abiertas
- Plazo exacto de retención, comienzo del cómputo y renovación por actividad.
- Tipo de almacenamiento y controles de confidencialidad apropiados; protección ante dispositivos compartidos.
- Tratamiento de respuestas potencialmente sensibles y exclusión de datos innecesarios.
- Compatibilidad de versiones y migración o descarte de borradores.
- Diferencia entre descartar datos del dispositivo y eliminación de datos que residan en servidores.
- Reglas de consentimiento de extensión al reanudar, según alcance y vigencia que se especifiquen.
- Integración segura con la reclamación de informe D-V9-005 sin vinculación automática.

### 35.4. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-RES01 | Auditar persistencia, sesiones, privacidad y reanudación existentes V9/QBV2 | Inventario de archivos, contratos y SHA | No asumir implementación |
| PLAN-RES02 | Definir inventario mínimo de datos de borrador anónimo | Matriz dato×necesidad×sensibilidad×retención | Minimización |
| PLAN-RES03 | Comparar arquitecturas de guardado en mismo dispositivo | Análisis de riesgos, seguridad y límites reales | Aprobación técnica/privacidad |
| PLAN-RES04 | Especificar caducidad, limpieza y descarte voluntario | Política versionada con plazo pendiente | Requiere D-V9-028 |
| PLAN-RES05 | Diseñar UX de pausar, continuar, descartar y caducar | Flujos es/en y mensajes para dispositivo compartido | Accesibilidad |
| PLAN-RES06 | Definir restauración idempotente de 24+5, hitos y preferencia | Contrato de estados y reanudación | Sin doble conteo |
| PLAN-RES07 | Documentar compatibilidad editorial y reclamo de informe | Matriz versiones y separación D-V9-005 | Sin vinculación automática |
| PLAN-RES08 | Preparar pruebas focalizadas futuras de privacidad y recuperación | Casos C01–C10, es/en, errores, expiración y cambio de modo | No ejecutar en PLAN_ONLY |

### 35.5. Criterios de aceptación futuros
1. Una evaluación anónima puede reanudarse en el mismo dispositivo compatible sin cuenta.
2. Respuestas y ruta adaptativa se restauran sin inventar datos.
3. Los turnos ya contabilizados no se vuelven a consumir.
4. El presupuesto de extensión 24+5 no se reinicia.
5. No se presume consentimiento nuevo para extensión.
6. Hitos y modo manual/contextual se restauran coherentemente.
7. Cambiar es/en no duplica preguntas ni pierde progreso.
8. El usuario puede descartar el borrador de manera intencional.
9. El borrador caduca según política aprobada y comprobable.
10. El aviso explica limitaciones en dispositivos compartidos.
11. La falta de almacenamiento no impide completar una entrevista en curso.
12. Corrupción o incompatibilidad producen mensaje honesto y salida segura.
13. No se promete borrado remoto sin garantía técnica.
14. No se requiere GHL ni cuenta para la continuidad anónima.
15. Reclamar informe detallado requiere el flujo seguro independiente D-V9-005.
16. No se utilizan respuestas anónimas guardadas para marketing por defecto.

### 35.6. Próxima decisión D-V9-028 — duración del borrador anónimo
Opciones pendientes para **caducidad máxima desde el último guardado válido**, sin renovación silenciosa: **A** 24 horas; **B** 7 días (recomendado provisionalmente por equilibrio entre continuidad y minimización); **C** 30 días. Son alternativas para aprobación, **no plazos validados**. Después habrá que precisar el evento de renovación, avisos y arquitectura antes de implementar.

### 35.7. Estado
D-V9-001 a D-V9-027 APPROVED en sus alcances respectivos. D-V9-028 PENDING; plazo de retención y arquitectura PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.27.0 / 2026-10-29:** D-V9-027 aprobada; continuidad anónima en mismo dispositivo, privacidad, caducidad pendiente, ocho tareas PLAN-RES01–08, dieciséis criterios de aceptación y próxima decisión. Solo documentación.


## 36. Decisión D-V9-028 — retención de siete días desde el último guardado válido (aprobada 2026-10-29)
**Aprobación expresa:** «conservación temporal del diagnóstico anónimo incompleto durante 7 días desde el último guardado válido, con caducidad y eliminación según política de privacidad». Estado APPROVED como política de producto; exclusivamente PLAN_ONLY.

### 36.1. Contrato de retención y caducidad
1. El borrador de una entrevista anónima **incompleta** podrá reanudarse en el mismo dispositivo compatible durante **7 días desde el último guardado válido**.
2. «Guardado válido» deberá definirse como una persistencia **confirmada** de cambios sustantivos del estado de la entrevista (por ejemplo, respuesta, omisión o preferencia de avance modificada); no basta una animación, lectura, navegación, recarga, apertura de página o intento de guardado fallido.
3. Cada nuevo guardado válido **renueva el vencimiento** a siete días desde ese evento confirmado; no existe renovación silenciosa por mera visita.
4. El plazo debe medirse mediante marcas temporales verificables, con tratamiento explícito de relojes alterados, husos horarios, suspensión del dispositivo y estado offline. El método exacto de comprobación depende de la arquitectura por aprobar.
5. Vencido el plazo, el borrador **no debe poder reanudarse**. La limpieza de datos deberá ejecutarse según la arquitectura y política de privacidad, diferenciando eliminación lógica, física y posibles copias de respaldo; no prometer borrado inmediato universal sin garantía.
6. Permitir **eliminación voluntaria** del borrador antes de los siete días, con aviso claro de alcance y confirmación proporcionada.
7. Informar al usuario de que el guardado es temporal, de su duración, del dispositivo compartido y de cómo descartar el progreso; ofrecer mensajes es/en accesibles.
8. Una reanudación válida restaura respuestas, hitos, ruta, preferencias, contador 24+5 y consentimiento aplicable, sin duplicar preguntas ni prolongar el plazo por la mera reanudación.
9. El guardado y la expiración **no exigen cuenta**, no habilitan seguimiento comercial ni vinculan automáticamente el borrador a GHL.
10. Una evaluación **finalizada** y su resumen/informe se rigen por la política de resultados y reclamación D-V9-005; no extender automáticamente la retención de borradores incompletos a datos de resultados.
11. Si la persistencia falla, no declarar «guardado» ni reiniciar el vencimiento. Si el estado es corrupto o incompatible, explicar la limitación y ofrecer salida segura sin inventar respuestas.
12. La implementación futura deberá aprobar antes almacenamiento, seguridad, minimización, jurisdicción, política de privacidad y mecanismo de limpieza; esta decisión **no certifica** una arquitectura concreta.

### 36.2. Ejemplos de comportamiento esperados
| Evento | ¿Renueva 7 días? | Condición |
| --- | --- | --- |
| Respuesta guardada y confirmada | Sí | Persistencia válida |
| Omisión registrada y guardada | Sí | Cambio sustantivo confirmado |
| Preferencia manual/contextual modificada y guardada | Sí | Estado realmente persistido |
| Abrir página o reanudar sin cambios | No | No es nuevo guardado |
| Cambiar idioma sin guardar estado nuevo | No | Solo presentación |
| Animación, progreso visual o lectura | No | No son cambios de borrador |
| Guardado fallido | No | No hay confirmación |
| Borrador vencido | No | No se reactiva por abrirlo |
| Descartar voluntariamente | No | Revoca continuidad y solicita limpieza |
La clasificación de eventos requiere contrato técnico verificable antes de implementar.

### 36.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-TTL01 | Auditar persistencia y limpieza de borradores actuales V9/QBV2 | Inventario de archivos, eventos y SHA | No asumir almacenamiento |
| PLAN-TTL02 | Definir evento de guardado válido y confirmación | Tabla de eventos, errores e idempotencia | Sin renovación silenciosa |
| PLAN-TTL03 | Especificar vencimiento móvil de siete días y tratamiento de reloj/offline | Contrato temporal y casos límite | Seguridad y privacidad |
| PLAN-TTL04 | Comparar alternativas de almacenamiento y eliminación | Matriz de riesgo, cifrado, backups y límites | Aprobación técnica pendiente |
| PLAN-TTL05 | Diseñar avisos, descarte, vencimiento y reanudación es/en | Flujos UX y microcopy certificado | Accesibilidad |
| PLAN-TTL06 | Separar borrador incompleto de resultados/reclamo D-V9-005 | Matriz de ciclos de vida y permisos | Sin vinculación comercial |
| PLAN-TTL07 | Definir restauración idempotente de 24+5, hitos y preferencia | Contrato conceptual de estado | Sin doble conteo |
| PLAN-TTL08 | Preparar pruebas focalizadas futuras de caducidad y borrado | Matriz tiempo×evento×estado×resultado | No ejecutar en PLAN_ONLY |

### 36.4. Criterios de aceptación futuros
1. Guardado confirmado establece vencimiento siete días después.
2. Nuevo guardado válido actualiza el vencimiento a siete días desde ese evento.
3. Abrir o reanudar sin cambios no renueva la caducidad.
4. Una animación o cambio meramente visual no renueva el plazo.
5. Guardado fallido no se presenta como éxito ni cambia vencimiento.
6. Un borrador vigente se reanuda en el mismo dispositivo compatible sin cuenta.
7. Al vencerse, el borrador no se puede recuperar como sesión activa.
8. Abrir un borrador vencido no lo reactiva.
9. El usuario puede descartarlo antes del vencimiento.
10. Los mensajes distinguen eliminación del dispositivo de eliminación remota cuando corresponda.
11. Reloj alterado o estado offline no habilita retención indefinida.
12. Reanudación conserva contador 24+5, hitos y preferencia de avance.
13. Consentimiento de extensión no se presume al recuperar un estado inválido.
14. Cambio de idioma mantiene la semántica y no genera guardado ficticio.
15. Dispositivo compartido recibe advertencia clara y controles de descarte.
16. El ciclo de vida del borrador no determina automáticamente la retención del informe final.
17. No se exige GHL, CRM ni cuenta para reanudar.
18. La arquitectura concreta y las garantías de borrado se validan antes de prometerlas.

### 36.5. Próxima decisión D-V9-029 — dónde persistir el borrador anónimo
Alternativas por aprobar: **A** almacenamiento local en el navegador, sin respaldo de servidor para borradores (simplicidad, riesgo en dispositivos compartidos y limpieza de navegador); **B** borrador cifrado del lado del servidor con identificador temporal en el dispositivo (más control de expiración, mayores obligaciones de seguridad); **C** enfoque híbrido con estado mínimo local y borrador remoto protegido (más complejidad). **Recomendación provisional: A**, condicionada a minimizar datos sensibles y a una evaluación de seguridad/privacidad. Ninguna alternativa está aprobada; no asumir cifrado ni borrado remoto hasta especificarlo.

### 36.6. Estado
D-V9-001 a D-V9-028 APPROVED en sus alcances respectivos. D-V9-029 PENDING; arquitectura de almacenamiento y limpieza PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.28.0 / 2026-10-29:** D-V9-028 aprobada; retención móvil de siete días desde guardado válido, tabla de eventos, ocho tareas PLAN-TTL01–08, dieciocho criterios de aceptación y siguiente decisión. Solo documentación.


## 37. Decisión D-V9-029 — borrador anónimo exclusivamente local, sin respaldo de servidor (aprobada 2026-10-29)
**Aprobación expresa:** «almacenamiento local en el navegador para borradores anónimos, sin respaldo de servidor». Estado APPROVED como decisión arquitectónica de producto; exclusivamente PLAN_ONLY.

### 37.1. Alcance y límites de arquitectura
1. El **borrador anónimo incompleto** de Diagnóstico V9 se guardará en almacenamiento del **navegador del mismo dispositivo**, sin crear una copia de recuperación del borrador en el servidor.
2. La reanudación depende de conservar los datos del navegador y del mismo contexto compatible (origen/perfil/modo de navegación); **no** se promete recuperación tras borrado de datos, modo privado, bloqueo de almacenamiento o cambio de dispositivo.
3. La política de D-V9-028 se mantiene: **7 días desde el último guardado válido confirmado**, con verificación de caducidad **antes de mostrar o restaurar** el borrador; las visitas y animaciones no renuevan el plazo.
4. La expiración impide reanudar y debe desencadenar limpieza local cuando la aplicación vuelva a ejecutarse; **no** prometer eliminación física exacta en el instante del vencimiento mientras el navegador esté cerrado ni eliminación de backups del dispositivo.
5. Proporcionar control de **descartar borrador** y comenzar de nuevo, con alcance y consecuencias explicados en español e inglés.
6. Guardar únicamente el **mínimo estado necesario** para restaurar respuestas, ruta/versión, hitos, contador 24+5, consentimiento de extensión vigente y preferencia de avance; evaluar por campo sensibilidad y necesidad.
7. No guardar tokens de autenticación, secretos, credenciales, información comercial innecesaria ni datos personales opcionales que no sean imprescindibles para la evaluación.
8. El almacenamiento local **no es sinónimo de cifrado, confidencialidad garantizada ni aislamiento frente a scripts del mismo origen, extensiones o personas con acceso al dispositivo**. Requiere revisión de amenazas, CSP/XSS, minimización, acceso y políticas de privacidad.
9. No enviar el borrador al servidor por autosave, telemetría, logs, analytics, error tracking ni servicios terceros; definir controles que impidan capturar respuestas accidentalmente. Las solicitudes necesarias para evaluar preguntas o generar resultados deberán documentarse **separadamente** y no podrán presentarse como respaldo de borrador.
10. No utilizar borradores anónimos para marketing, seguimiento comercial ni GHL. La transición voluntaria a cuenta/reclamo de informe D-V9-005 requiere flujo, autorización y política de datos independientes.
11. Seleccionar la tecnología concreta (por ejemplo, IndexedDB u otra alternativa) **solo tras auditoría técnica** de tamaño, seguridad, compatibilidad, migración y facilidad de eliminación. No afirmar que ya está implementada.
12. Ante cuota agotada, almacenamiento bloqueado, datos corruptos, versión incompatible o fallo de escritura, permitir continuar cuando sea viable, advertir que la reanudación podría no estar disponible y **no** declarar «guardado» si no se confirmó.
13. Reanudar sin duplicar turnos, consentimiento, hitos, mensajes de éxito o efectos; la preferencia de avance se restaura para la misma evaluación.
14. Separar explícitamente el ciclo de vida del **borrador incompleto** del de resultados finales, cuentas, informes y cualquier almacenamiento legítimo del backend, sin inferir políticas de retención de estos últimos.

### 37.2. Riesgos y salvaguardas por diseñar
| Riesgo | Salvaguarda documental requerida |
| --- | --- |
| Dispositivo o perfil compartido | Aviso claro, descarte fácil y minimización |
| Borrado del navegador/modo privado | Explicar que la recuperación no está garantizada |
| XSS/scripts del mismo origen | Auditoría de amenazas, CSP, dependencias y acceso |
| Telemetría o errores que capturen respuestas | Contrato de exclusión/redacción de datos |
| Reloj del dispositivo manipulado | Política de verificación y límites honestos de garantía |
| Caducidad mientras la app está cerrada | No reanudar al volver; limpieza al próximo acceso |
| Estado corrupto/incompatible | Descartar o recuperar solo datos verificables, nunca inventar |
| Cambios de versión editorial | Política de migración compatible o reinicio informado |
| Almacenamiento no disponible | Continuidad en sesión cuando sea viable, aviso explícito |
| Consentimiento de extensión previo | Validar alcance/vigencia antes de usar turnos 25–29 |

### 37.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-LOCAL01 | Auditar almacenamiento, telemetría, red y sesiones V9/QBV2 | Inventario de rutas, archivos y SHA | No asumir que es local hoy |
| PLAN-LOCAL02 | Definir esquema mínimo y clasificación de sensibilidad | Matriz campo×finalidad×retención×riesgo | Minimización |
| PLAN-LOCAL03 | Seleccionar tecnología de navegador y compatibilidad | ADR comparando alternativas y degradación | Revisión de seguridad |
| PLAN-LOCAL04 | Especificar guardado válido, TTL móvil de 7 días y descarte | Contrato de eventos, caducidad y limpieza | D-V9-028 |
| PLAN-LOCAL05 | Auditar amenazas de scripts, extensiones, dispositivos compartidos y telemetría | Modelo de amenazas y mitigaciones | Sin falsas garantías de cifrado |
| PLAN-LOCAL06 | Diseñar UX de guardado, reanudación, eliminación y errores es/en | Flujos y microcopy certificado | Accesibilidad |
| PLAN-LOCAL07 | Definir compatibilidad editorial, idempotencia y restauración 24+5 | Contrato de versión, migración y contadores | Sin duplicación |
| PLAN-LOCAL08 | Separar claramente borrador local de informe final y cuenta | Diagrama de flujos y políticas de datos | D-V9-005; sin GHL |
| PLAN-LOCAL09 | Preparar pruebas focalizadas futuras de almacenamiento y privacidad | Matriz de expiración, corrupción, cuota, idioma y red | No ejecutar en PLAN_ONLY |

### 37.4. Criterios de aceptación futuros
1. Un borrador anónimo incompleto no genera copia de recuperación en servidor.
2. El estado guardado se restaura solo desde el navegador/dispositivo compatible.
3. Borrar datos del navegador puede eliminar irrecuperablemente el progreso, y esto se comunica.
4. Siete días desde el último guardado válido confirmado determinan la caducidad.
5. Visitar la página o animar el progreso no renueva el TTL.
6. Un borrador caducado no se muestra ni se reanuda.
7. La limpieza se efectúa cuando la aplicación vuelve a ejecutarse, sin prometer borrado con navegador cerrado.
8. El usuario puede descartar voluntariamente el borrador.
9. El guardado fallido no se presenta como exitoso.
10. Almacenamiento bloqueado o lleno ofrece salida clara y no bloquea innecesariamente la entrevista.
11. No se incluyen secretos ni datos innecesarios en el borrador.
12. Respuestas no se envían a telemetría, logs ni analytics como respaldo encubierto.
13. La reanudación conserva contador 24+5, hitos y preferencia.
14. El consentimiento excepcional se valida antes de continuar.
15. Cambio de idioma no duplica turnos ni crea copias.
16. Versión incompatible recibe manejo explícito sin inventar respuestas.
17. La privacidad no se describe como cifrado garantizado por el mero almacenamiento local.
18. El borrador no depende de GHL ni de crear cuenta.
19. La reclamación de informe detallado sigue un flujo distinto y voluntario.
20. Se documentan límites de seguridad en dispositivos compartidos.

### 37.5. Próxima decisión D-V9-030 — datos permitidos en borrador local
Alternativas pendientes: **A** guardar todas las respuestas de entrevista, salvo secretos y credenciales; **B** guardar solo respuestas estructuradas y estado mínimo, excluyendo texto libre potencialmente sensible (recomendado provisionalmente por privacidad, con advertencia de pérdida de campos); **C** permitir también texto libre con aviso específico y opción de excluirlo del guardado. Ninguna opción aprobada. Antes de decidir, verificar qué campos reales son necesarios para C01–C10 y evitar perder continuidad de forma sorpresiva.

### 37.6. Estado
D-V9-001 a D-V9-029 APPROVED en sus alcances respectivos; D-V9-030 PENDING. Tecnología concreta, amenazas y reglas de datos PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.29.0 / 2026-10-29:** D-V9-029 aprobada; arquitectura de borrador local sin respaldo servidor, límites de seguridad, nueve tareas PLAN-LOCAL01–09, veinte criterios de aceptación y próxima decisión. Solo documentación.


## 38. Decisión D-V9-030 — persistencia mínima y texto libre opcional (aprobada 2026-10-29)
**Aprobación expresa:** «guardar respuestas estructuradas y estado mínimo, con guardado opcional de texto libre mediante aviso específico y posibilidad de excluirlo». Estado APPROVED; exclusivamente PLAN_ONLY.

### 38.1. Política de datos del borrador
1. Guardar localmente respuestas **estructuradas** y el **estado mínimo indispensable** para reanudar la evaluación anónima, de acuerdo con D-V9-027–029.
2. El **texto libre no se conserva por defecto** en el borrador. Su guardado requiere una decisión afirmativa, informada, específica y reversible del usuario, tras un aviso claro y comprensible en es/en.
3. Ofrecer una opción explícita para **excluir el texto libre del guardado** sin impedir que la persona conteste o complete la entrevista. No emplear casillas premarcadas ni consentimiento implícito.
4. Si el usuario excluye el texto libre, podrá usarse **en la entrevista activa** cuando sea necesario para responder, pero no se incluirá en el borrador local persistente. Al reanudar, explicar que esos campos no se recuperarán; no inventar respuestas.
5. La opción de conservar texto libre no autoriza almacenar **contraseñas, credenciales, secretos, tokens ni datos personales sensibles innecesarios**. Aplicar minimización, límites editoriales y exclusiones independientemente de la preferencia.
6. La decisión sobre texto libre debe ser **reversible**: al desactivarla, eliminar del borrador los textos libres previamente guardados en la medida técnicamente verificable y explicar las limitaciones del navegador; no borrar inadvertidamente la respuesta activa sin aviso.
7. Evitar que texto libre excluido termine persistido por rutas indirectas: cachés de aplicación, telemetría, analytics, registros de error, snapshots, almacenamiento de estado, backups o servicios de terceros. Auditar las rutas reales antes de implementar.
8. Separar el uso temporal de respuestas para calcular el diagnóstico de su **persistencia para reanudación**; documentar cualquier transmisión estrictamente necesaria para evaluación o informe, sin presentarla como respaldo del borrador.
9. Restaurar solo los datos efectivamente guardados; preservar ruta adaptativa, contador de 24+5, hitos y preferencia de avance sin atribuir evidencia a campos de texto libre ausentes.
10. Si una pregunta requiere evidencia crítica que se perdió al reanudar, aplicar D-V9-017–019: solicitar aclaración dentro del presupuesto y con consentimiento excepcional si corresponde, o declarar evidencia insuficiente; no asignar madurez inventada.
11. El borrador local caduca **7 días desde el último guardado válido** y no se replica como copia de recuperación en servidor; los cambios de preferencia confirmados que modifican el borrador siguen el contrato D-V9-028.
12. El aviso debe explicar la diferencia entre «usar mi respuesta ahora» y «guardar mi texto para continuar después», el riesgo de dispositivo compartido y la posibilidad de eliminar el borrador.
13. No exigir cuenta, GHL ni consentimiento comercial para guardar respuestas estructuradas o decidir sobre texto libre; la reclamación de informe detallado D-V9-005 es independiente.
14. La ubicación exacta del control, la granularidad de autorización (global o por campo), el comportamiento ante cierre inesperado y el tratamiento de texto libre sensible requieren especificación y validación editorial/privacidad antes de implementación; **no se presumen aprobados**.

### 38.2. Matriz de persistencia conceptual
| Categoría | Borrador local | Condición |
| --- | --- | --- |
| Respuestas estructuradas necesarias | Sí | Minimización y TTL 7 días |
| Estado mínimo de entrevista | Sí | Solo campos imprescindibles |
| Texto libre ordinario | Opcional | Aceptación afirmativa tras aviso específico |
| Texto libre con exclusión elegida | No | Uso en entrevista activa, sin restauración |
| Credenciales, secretos, tokens | No | Exclusión independientemente de consentimiento |
| Datos sensibles innecesarios | No | Minimización y revisión de riesgos |
| Eventos visuales/animaciones | No | No son datos necesarios para reanudar |
| Copia de recuperación en servidor | No | D-V9-029 |
| Información para marketing/GHL | No | Sin consentimiento ni vinculación comercial |

### 38.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-DATA01 | Inventariar campos reales C01–C10 y fuentes V9/QBV2 | Matriz pregunta×tipo×sensibilidad×necesidad y SHA | No asumir preguntas aprobadas |
| PLAN-DATA02 | Definir esquema mínimo de borrador y exclusiones | Contrato conceptual de campos y ciclo de vida | Minimización |
| PLAN-DATA03 | Diseñar consentimiento específico y revocable para texto libre | Flujos UX es/en y estados de preferencia | Sin casillas premarcadas |
| PLAN-DATA04 | Especificar revocación y limpieza de texto libre guardado | Tabla de transiciones, errores y límites | Sin falsas garantías de borrado |
| PLAN-DATA05 | Auditar persistencia indirecta y telemetría | Modelo de amenazas y rutas de datos | Sin respaldo encubierto |
| PLAN-DATA06 | Definir reanudación con campos excluidos y evidencia insuficiente | Matriz de restauración y adaptación 24+5 | D-V9-017–020 |
| PLAN-DATA07 | Separar procesamiento activo, borrador y reclamación de informe | Diagrama de flujos y responsabilidades | D-V9-005, Vecidya/GHL |
| PLAN-DATA08 | Preparar pruebas focalizadas futuras de consentimiento, caducidad y fallos | Casos es/en, C01–C10 y reversibilidad | No ejecutar en PLAN_ONLY |
| PLAN-DATA09 | Revisar microcopy de privacidad y accesibilidad | Checklist editorial bilingüe | Revisión humana antes de lanzar |

### 38.4. Criterios de aceptación futuros
1. Respuestas estructuradas necesarias se guardan en borrador local con TTL aprobado.
2. Estado mínimo permite reanudar sin duplicar turnos.
3. Texto libre no se guarda sin aceptación afirmativa.
4. El aviso específico es visible y comprensible antes de activar el guardado de texto libre.
5. El usuario puede excluir texto libre sin abandonar la entrevista.
6. Una respuesta libre excluida no reaparece como si hubiera sido guardada tras reanudar.
7. La interfaz informa de la pérdida esperable de texto excluido al cerrar.
8. El usuario puede revocar la autorización de guardado de texto libre.
9. La revocación solicita eliminar textos guardados y comunica límites verificables.
10. Credenciales, secretos y tokens nunca se incluyen en el borrador.
11. Datos sensibles innecesarios quedan excluidos aun con autorización.
12. Telemetría y registros no crean copia indirecta de textos excluidos.
13. El guardado de borrador no envía una copia de recuperación al servidor.
14. La caducidad se rige por siete días desde el último guardado válido.
15. Reanudación conserva contador 24+5 y preferencia de avance.
16. Evidencia perdida no se sustituye por inferencias ficticias.
17. Evidencia crítica faltante sigue reglas de aclaración y suficiencia D-V9-017–019.
18. El consentimiento de texto libre no habilita marketing ni vinculación a GHL.
19. El flujo de informe detallado con cuenta permanece separado.
20. Las instrucciones y controles funcionan en español e inglés con accesibilidad.

### 38.5. Próxima decisión D-V9-031 — granularidad del permiso de texto libre
Opciones pendientes: **A** una preferencia global para toda la entrevista (simple, pero menos control por campo); **B** decisión independiente por cada respuesta libre (máximo control, más fricción); **C** preferencia global explícita y reversible con opción de excluir respuestas libres individuales (recomendado por equilibrio entre control y experiencia). Ninguna opción aprobada; debe diseñarse sin consumir turnos del diagnóstico por controles de privacidad y sin permitir almacenamiento de secretos.

### 38.6. Estado
D-V9-001 a D-V9-030 APPROVED en sus alcances respectivos. D-V9-031 PENDING; granularidad y microcopy final PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.30.0 / 2026-10-29:** D-V9-030 aprobada; persistencia estructurada mínima, guardado opcional de texto libre con aviso específico y exclusión, nueve tareas PLAN-DATA01–09, veinte criterios de aceptación y siguiente decisión. Solo documentación.


## 39. Decisión D-V9-031 — preferencia global reversible de texto libre con exclusiones individuales (aprobada 2026-10-29)
**Aprobación expresa:** «preferencia global explícita y reversible para guardar texto libre, con opción de excluir respuestas individuales». Estado APPROVED; exclusivamente PLAN_ONLY.

### 39.1. Contrato de consentimiento y exclusión
1. El guardado persistente de texto libre en el borrador anónimo empieza **desactivado por defecto**. Requiere una **acción afirmativa expresa** tras aviso específico y comprensible; no usar consentimiento implícito ni casillas premarcadas.
2. Una preferencia global permite **autorizar o desactivar** el guardado de texto libre durante la entrevista, sin exigir decisión repetida por cada campo.
3. Aun con autorización global activa, cada respuesta libre tendrá un control accesible para **excluirla individualmente** del borrador. La exclusión prevalece sobre la autorización global.
4. El usuario puede **revocar** la autorización global en cualquier momento. La revocación desactiva guardados posteriores y exige retirar del borrador los textos libres previamente persistidos, sujeto a garantías técnicas verificables y comunicación honesta de límites.
5. Desactivar la exclusión individual solo podrá habilitar guardado de ese campo si la autorización global sigue activa y el contenido no está prohibido por reglas de minimización.
6. El texto excluido puede utilizarse en la **entrevista activa**, pero no debe persistirse para reanudación. Si se pierde al cerrar, el usuario recibirá información clara; no se inventarán respuestas al restaurar.
7. **Nunca** guardar credenciales, contraseñas, secretos, tokens o datos sensibles innecesarios, incluso con permiso global e inclusión individual.
8. El aviso y el control deben diferenciar claramente **uso durante la evaluación** de **almacenamiento local para continuar después**, sin inducir a autorizar.
9. Los cambios de preferencia y exclusión no cuentan como turnos de pregunta D-V9-020; no alteran el límite 24+5, hitos, madurez, evaluación, ranking ni recomendaciones.
10. Las preferencias y exclusiones pertinentes deben restaurarse con el borrador válido, respetando D-V9-027–030; la restauración nunca convierte una respuesta excluida en almacenada.
11. Persistir solo el **mínimo metadato** necesario para recordar la decisión de privacidad y exclusiones, evitando conservar contenido libre como metadato, historial de versiones, logs o telemetría.
12. Aplicar los siete días desde el último guardado válido confirmado, sin respaldo de borrador en servidor; la eliminación y caducidad se rigen por D-V9-028–029.
13. No vincular el permiso de texto libre a consentimiento comercial, GHL, creación de cuenta o reclamación de informe detallado.
14. La ubicación del control, su semántica exacta, el tratamiento de cambios de exclusión después de introducir texto y la granularidad de limpieza se diseñarán y validarán antes de implementar; no presumir garantías aún no verificadas.

### 39.2. Precedencia conceptual
| Preferencia global | Exclusión individual | Contenido admisible | ¿Persistir texto? |
| --- | --- | --- | --- |
| Desactivada | Cualquiera | Sí | No |
| Activada | Sí | Sí | No |
| Activada | No | Sí | Sí, con guardado confirmado |
| Activada | No | No (secreto o dato innecesario) | No |
| Revocada | Cualquiera | Cualquiera | No; limpiar textos previamente guardados según contrato |
La tabla define intención de producto, no comportamiento ya implementado.

### 39.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-CONS01 | Inventariar campos de texto libre y rutas de persistencia V9/QBV2 | Matriz campo×riesgo×flujo y SHA | Sin asumir implementación |
| PLAN-CONS02 | Especificar preferencia global, exclusiones y precedencia | Contrato de estados/transiciones | Privacidad por defecto |
| PLAN-CONS03 | Diseñar avisos, controles y revocación es/en | Flujos UX móvil/escritorio y microcopy | Accesibilidad |
| PLAN-CONS04 | Definir borrado de textos al revocar o excluir | Política de limpieza y límites verificables | No prometer borrado físico absoluto |
| PLAN-CONS05 | Auditar telemetría, cachés y persistencia indirecta | Modelo de amenazas y controles | Sin copias encubiertas |
| PLAN-CONS06 | Diseñar reanudación con textos ausentes y evidencia crítica | Matriz de recuperación y 24+5 | D-V9-017–020 |
| PLAN-CONS07 | Separar permisos de borrador, procesamiento activo y reclamación de informe | Diagrama de datos y consentimiento | D-V9-005; sin GHL |
| PLAN-CONS08 | Preparar pruebas focalizadas futuras de revocación y exclusión | Matriz global×individual×estado×error | No ejecutar en PLAN_ONLY |
| PLAN-CONS09 | Revisar accesibilidad, comprensión y ausencia de patrones manipulativos | Checklist editorial bilingüe | Validación humana |

### 39.4. Criterios de aceptación futuros
1. El guardado de texto libre comienza desactivado.
2. La autorización global requiere una acción afirmativa informada.
3. El usuario puede autorizar sin aceptar marketing ni crear cuenta.
4. Una exclusión individual prevalece sobre el permiso global.
5. Texto excluido no aparece en el borrador restaurado.
6. El usuario puede revocar el permiso global.
7. Revocación detiene persistencias futuras de texto libre.
8. Revocación elimina del borrador los textos libres previos conforme a garantías verificadas.
9. Revocar no borra silenciosamente la respuesta activa sin advertencia.
10. La reactivación global no anula automáticamente exclusiones individuales.
11. Datos prohibidos no se guardan aunque el usuario autorice.
12. Preferencias se restauran sin recuperar texto excluido.
13. La entrevista sigue siendo utilizable con texto libre no persistente.
14. No se generan copias indirectas en logs, analytics o telemetría.
15. Cambio de preferencia no consume turnos ni modifica puntuación.
16. La caducidad de siete días sigue aplicándose al borrador.
17. No existe respaldo del borrador anónimo en servidor.
18. El control es comprensible en es/en y accesible por teclado/lector.
19. La recuperación de evidencia crítica respeta 24+5 y consentimiento.
20. Los resultados finales y la reclamación de informe tienen política independiente.

### 39.5. Próxima decisión D-V9-032 — aviso sobre pérdida de texto libre al reanudar
Alternativas pendientes: **A** aviso general una sola vez al configurar privacidad; **B** aviso contextual solo al excluir una respuesta libre; **C** aviso general breve más señal contextual discreta en campos excluidos y recordatorio al reanudar si faltan textos (recomendado). Ninguna opción aprobada; debe evitar mensajes repetitivos y no crear interacciones contables.

### 39.6. Estado
D-V9-001 a D-V9-031 APPROVED en sus alcances respectivos; D-V9-032 PENDING. Microcopy y contratos técnicos finales PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.31.0 / 2026-10-29:** D-V9-031 aprobada; permiso global reversible y exclusiones individuales, precedencia, nueve tareas PLAN-CONS01–09, veinte criterios de aceptación y siguiente decisión. Solo documentación.


## 40. Decisión D-V9-032 — aviso general, señales discretas y recordatorio de textos no conservados (aprobada 2026-10-29)
**Aprobación expresa:** «aviso general breve, señales contextuales discretas en campos de texto libre excluidos y recordatorio al reanudar si faltan textos». Estado APPROVED; exclusivamente PLAN_ONLY.

### 40.1. Contrato de comunicación
1. Mostrar **un aviso general breve y comprensible** al configurar la privacidad del borrador: las respuestas estructuradas se conservan temporalmente, mientras el texto libre solo se guarda con autorización global explícita y sin exclusión individual, conforme a D-V9-030–031.
2. En cada campo de texto libre **excluido del guardado**, mostrar una **señal contextual discreta**, accesible y no intrusiva que indique que esa respuesta no estará disponible al reanudar. La señal no debe depender únicamente de color o iconografía.
3. Al **reanudar** una evaluación con respuestas libres no conservadas, mostrar **un recordatorio proporcionado** que explique la ausencia de esos textos y, cuando corresponda, permita revisar o volver a responder sin presentar contenido inexistente como recuperado.
4. Evitar repetir el aviso general en cada pantalla, mostrar advertencias alarmistas o introducir fricción para presionar a activar el guardado.
5. La señal contextual debe reflejar el **estado real**: preferencia global desactivada, exclusión individual activa o texto no recuperable. No afirmar «guardado» antes de una persistencia confirmada.
6. Cuando el usuario active o revoque la preferencia global o modifique exclusiones, actualizar las señales sin navegación inesperada, pérdida silenciosa de respuesta activa ni consentimiento implícito.
7. La reanudación no debe mostrar ni reconstruir texto que no se conservó; el recordatorio debe describir **qué tipo de información falta**, sin revelar el contenido ausente.
8. La ausencia de texto libre puede afectar evidencia crítica: aplicar D-V9-017–020 para aclaración, insuficiencia de evidencia y presupuesto de 24+5; no asignar madurez ficticia ni duplicar turnos previamente contabilizados.
9. Avisos, señales, recordatorios y controles de privacidad **no son interacciones contables** D-V9-020, salvo que se presente una nueva pregunta/aclaración sustantiva que sí requiera respuesta.
10. Ofrecer microcopy equivalente y certificado en **español e inglés**, apto para móvil, teclado y lector de pantalla; respetar movimiento reducido y jerarquía visual premium D-V9-021–023.
11. No utilizar estos avisos para marketing, registro obligatorio ni GHL. Mantener separados borrador anónimo local y reclamación de informe D-V9-005.
12. No almacenar texto excluido para poder generar el recordatorio. Como máximo, usar **metadatos mínimos no sensibles** que indiquen que un campo no fue persistido, sujetos a minimización, caducidad de siete días y auditoría de privacidad.
13. El texto final, ubicación exacta, frecuencia de recordatorios y semántica de estados quedan sujetos a diseño y revisión editorial/accesibilidad; no presumir que existen componentes implementados.

### 40.2. Matriz de momentos y mensajes conceptuales
| Momento | Comunicación esperada | Restricción |
| --- | --- | --- |
| Configuración inicial de privacidad | Aviso general breve | Sin casillas premarcadas ni presión |
| Campo libre excluido | Señal discreta «No se guardará para continuar después» (texto ilustrativo) | Accesible y contextual |
| Campo libre incluido y guardado | Estado veraz de guardado | Solo tras confirmación |
| Revocación de permiso global | Actualizar señales y explicar alcance de limpieza | Sin prometer borrado físico absoluto |
| Reanudación con textos ausentes | Recordatorio breve y opciones de revisión | Sin reconstruir contenido |
| Reanudación sin textos ausentes | Sin recordatorio innecesario | Evitar ruido |
| Caducidad del borrador | Mensaje de vencimiento D-V9-028 | No presentar como texto excluido |
Los ejemplos de microcopy son ilustrativos, no textos editoriales certificados.

### 40.3. Tareas documentales para el agente futuro
| ID | Tarea | Entregable verificable | Gate |
| --- | --- | --- | --- |
| PLAN-NOTICE01 | Inventariar avisos y estados de guardado existentes V9/QBV2 | Archivos, contratos y SHA | No asumir implementación |
| PLAN-NOTICE02 | Definir estados y disparadores de aviso general/señal/recordatorio | Tabla evento×estado×mensaje | Sin avisos duplicados |
| PLAN-NOTICE03 | Diseñar microcopy bilingüe certificado | Banco es/en de mensajes y variantes | Revisión editorial |
| PLAN-NOTICE04 | Diseñar ubicación y accesibilidad de señales | Flujos móvil/escritorio, teclado y lector | Sin dependencia exclusiva de color |
| PLAN-NOTICE05 | Especificar metadatos mínimos de texto no conservado | Matriz dato×finalidad×TTL | Sin persistir texto excluido |
| PLAN-NOTICE06 | Diseñar reanudación con texto faltante y evidencia crítica | Diagrama de aclaración/insuficiencia | D-V9-017–020 |
| PLAN-NOTICE07 | Documentar relación con preferencia global y exclusiones | Tabla de transiciones y revocación | D-V9-030–031 |
| PLAN-NOTICE08 | Preparar pruebas focalizadas futuras de avisos y privacidad | Matriz es/en, C01–C10, reanudación y errores | No ejecutar en PLAN_ONLY |
| PLAN-NOTICE09 | Revisar tono premium no manipulativo y movimiento reducido | Checklist UX y accesibilidad | D-V9-021–023 |

### 40.4. Criterios de aceptación futuros
1. Existe un aviso general breve al configurar privacidad.
2. El aviso distingue uso activo y guardado para reanudación.
3. El guardado de texto libre sigue desactivado por defecto.
4. Cada campo libre excluido muestra una señal contextual comprensible.
5. La señal no depende exclusivamente del color.
6. El estado de «guardado» solo se muestra tras confirmación.
7. Revocar permiso actualiza las señales sin navegación accidental.
8. No se repite el aviso general en cada pregunta.
9. Reanudar con texto no conservado presenta recordatorio proporcionado.
10. Reanudar sin texto faltante no muestra recordatorio innecesario.
11. El recordatorio no revela ni reconstruye texto ausente.
12. El usuario puede revisar el campo faltante cuando corresponda.
13. El sistema no inventa evidencia crítica al reanudar.
14. Aclaraciones nuevas respetan contador 24+5 y consentimiento.
15. Avisos y señales no consumen turnos.
16. Microcopy es/en mantiene equivalencia semántica.
17. Teclado, lector de pantalla y movimiento reducido conservan información.
18. No se crean copias de texto excluido en metadatos o telemetría.
19. Se respeta TTL local de siete días sin respaldo servidor.
20. Los mensajes no condicionan el diagnóstico a cuenta, GHL ni marketing.

### 40.5. Próxima decisión D-V9-033 — recuperar evidencia crítica no persistida
Alternativas pendientes: **A** pedir nuevamente toda respuesta libre ausente; **B** pedir solo textos ausentes que sean evidencia crítica para una conclusión, respetando 24+5 (recomendado); **C** no volver a preguntar y marcar automáticamente evidencia insuficiente. Ninguna opción aprobada. En cualquier caso, no duplicar turnos por reapertura de preguntas ya contabilizadas y no exceder 24+5 sin consentimiento.

### 40.6. Estado
D-V9-001 a D-V9-032 APPROVED en sus alcances respectivos; D-V9-033 PENDING. Microcopy final y detalles de interfaz PENDING. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.32.0 / 2026-10-29:** D-V9-032 aprobada; comunicación general/contextual y recordatorio de texto libre ausente, nueve tareas PLAN-NOTICE01–09, veinte criterios de aceptación y siguiente decisión. Solo documentación.


## 41. Decisión D-V9-033 — arquitectura simple: borrador local 7 días y D1 solo para analítica anónima agregada (aprobada 2026-10-29)
**Instrucción expresa del propietario:** evitar ramificaciones y complejidad como V8; conservar respuestas localmente siete días; usar Cloudflare D1 únicamente para analítica anónima de diagnósticos incompletos y demás información útil para mejorar el diagnóstico; **sin datos de dispositivo ni personales**. Esta decisión **reemplaza la propuesta anterior de D-V9-033 sobre repreguntar evidencia crítica**, que queda SIN APROBAR; no interpretarla como aprobación tácita.

### 41.1. Regla arquitectónica única
- **Navegador:** borrador anónimo, respuestas estructuradas y estado mínimo; texto libre sujeto a D-V9-030–032; retención de **7 días desde último guardado válido** D-V9-028; sin respaldo del borrador en servidor D-V9-029.
- **Cloudflare D1:** **exclusivamente analítica anónima agregada** del uso y calidad del diagnóstico V9, incluyendo inicios, finalizaciones, abandonos/incompletos, etapas y preguntas con dificultades, para mejorar contenido, flujo y experiencia. No contiene borradores ni respuestas individuales.
- **Prohibido en D1 para esta analítica:** nombres, correos, teléfonos, direcciones, IP, user-agent, huellas de navegador/dispositivo, cookies de seguimiento, IDs persistentes de sesión o usuario, tokens de reanudación, texto libre, respuestas crudas, historiales individuales de preguntas o cualquier dato que permita reconstruir una entrevista o vincularla a una persona o dispositivo.
- **No enviar respuestas** a D1, ni directa ni indirectamente a través de telemetría, logs, errores o claves dimensionales de alta cardinalidad. Separar el procesamiento estrictamente necesario para evaluación y resultados del almacenamiento de analítica.
- La palabra «anónimo» exige **revisión real de riesgo de reidentificación**: un registro por sesión sin nombre puede ser seudónimo, no anónimo. Favorecer agregados por períodos y categorías de baja cardinalidad, umbrales mínimos de publicación, supresión de grupos pequeños y límites de granularidad. No afirmar anonimato absoluto sin validación.
- **Diagnósticos incompletos:** medir abandono mediante contadores agregados de hitos/eventos permitidos, sin almacenar un identificador que rastree a una persona durante toda la entrevista. Definir un método estadístico honesto para distinguir abandono de interrupción temporal o reanudación, con sesgos y límites explícitos. No prometer conteos exactos de personas únicas.
- Evitar multiplicar decisiones UX por cada evento: un **contrato de eventos mínimo, versionado y auditable**, orientado a decisiones concretas de mejora. No reintroducir el modelo complejo V8.
- Respetar minimización, base jurídica, avisos y controles de privacidad aplicables. No confundir ausencia de datos personales en tablas D1 con ausencia automática de datos personales en infraestructura, solicitudes o registros operativos; estos últimos requieren auditoría y políticas independientes.
- La analítica es de **producto Vecidya**, no de CRM, publicidad, perfilado individual ni GHL. No cruzar métricas con cuentas, leads o informes individuales.
- No definir por ahora tablas, SQL, Workers, endpoints, herramientas ni código; las elecciones técnicas requieren revisión posterior del agente futuro y autorización de implementación.

### 41.2. Métricas conceptuales permitidas (siempre agregadas y revisadas)
| Métrica | Utilidad | Restricción |
| --- | --- | --- |
| Diagnósticos iniciados por período | Adopción | Contador de eventos, no personas únicas |
| Diagnósticos completados por período | Finalización | Sin IDs individuales |
| Progresión por hitos/etapas | Identificar fricción | Solo grupos suficientes |
| Preguntas mostradas / respondidas / omitidas por código editorial | Mejorar claridad | Sin respuesta elegida ni texto |
| Errores de validación por categoría general | Detectar UX deficiente | Sin valores de entrada ni mensajes crudos |
| Uso del modo manual/contextual por período | Ajustar experiencia | Agregado, sin trayectoria individual |
| Interrupciones detectables de forma fiable | Analizar incompletos | No equiparar automáticamente con abandono definitivo |
| Reanudaciones por período | Medir utilidad de continuidad | Sin vincular sesiones ni deduplicar usuarios |
| Extensión 24+5: ofrecida/aceptada/rechazada | Evaluar fricción | Contadores, sin razones personales |
**No** guardar secuencias de respuestas, segmentos minúsculos, combinaciones de atributos raros ni dimensiones que revelen perfiles individuales. La definición de eventos y sus garantías aún requiere auditoría.

### 41.3. Simplificación y decisiones reemplazadas
- Mantener vigentes D-V9-027–032 en cuanto a continuidad, siete días, borrador local, texto libre opcional y avisos, **sin abrir nuevas ramas de arquitectura de borrador**.
- La anterior pregunta «D-V9-033 — recuperar evidencia crítica no persistida» se retira del siguiente paso y queda **PENDING, no aprobada**. Cuando afecte al diagnóstico, aplicar por ahora principios ya aprobados D-V9-017–020 sin inventar reglas de repregunta.
- No convertir cada posible evento o gráfico en una decisión del propietario. El futuro agente deberá proponer un esquema **mínimo y verificable** con límites de privacidad.
- Priorizar cerrar definición editorial, taxonomía y ejecución futura del Plan Maestro frente a microdecisiones de UX ya cubiertas.

### 41.4. Tareas documentales para el agente futuro
| ID | Tarea | Entregable | Gate |
| --- | --- | --- | --- |
| PLAN-ANA01 | Auditar analítica actual V8/V9, D1 y telemetría | Inventario de fuentes, datos y SHA | Sin ejecutar ni modificar |
| PLAN-ANA02 | Definir contrato mínimo de eventos no identificables | Diccionario de eventos, dimensiones y propósito | Minimización y privacidad |
| PLAN-ANA03 | Diseñar agregación segura y umbrales de supresión | Modelo conceptual y análisis de reidentificación | Sin filas de sesión |
| PLAN-ANA04 | Documentar cómo estimar incompletos sin identificadores | Métricas, sesgos, limitaciones y no-deduplicación | No inventar precisión |
| PLAN-ANA05 | Separar rutas de borrador local, evaluación y analítica | Diagrama de flujo de datos | Sin respuestas en D1 |
| PLAN-ANA06 | Definir retención de agregados y control de acceso | Política propuesta para aprobación técnica/legal | No asumir plazo |
| PLAN-ANA07 | Preparar pruebas focalizadas futuras de no filtración | Matriz de eventos, datos prohibidos y C01–C10 | PLAN_ONLY, no ejecutar |
| PLAN-ANA08 | Integrar decisiones en roadmap F00–F10 sin ramificaciones V8 | Checklist de dependencias y entregables | No implementar |

### 41.5. Criterios de aceptación futuros
1. Borrador anónimo se guarda solo en navegador compatible.
2. TTL de borrador: siete días desde último guardado válido.
3. D1 no contiene borradores ni respuestas crudas.
4. D1 no contiene texto libre.
5. D1 no contiene nombres, contactos, IP ni datos de dispositivo.
6. D1 no contiene identificadores de usuario, sesión o reanudación.
7. Las métricas se almacenan de forma agregada.
8. No existen historiales individuales reconstruibles en analítica.
9. Los eventos tienen finalidad explícita de mejora de V9.
10. Los grupos pequeños se suprimen o agrupan para reducir reidentificación.
11. No se afirma medir usuarios únicos sin método compatible.
12. Los diagnósticos incompletos se interpretan con límites estadísticos explícitos.
13. Telemetría y logs se auditan para evitar filtración indirecta.
14. Analítica no se utiliza para marketing, perfilado ni GHL.
15. El flujo de informe con cuenta sigue separado de la analítica anónima.
16. No se introduce complejidad heredada de V8 sin necesidad probada.
17. Los contratos y decisiones quedan documentados antes de implementación.
18. Las pruebas futuras son focalizadas y no se ejecutan durante PLAN_ONLY.

### 41.6. Próximo paso propuesto
Consolidar en una **única matriz de cierre** las decisiones D-V9-001–033, separar aprobado de pendiente y retomar los bloqueos sustantivos de V9 (taxonomía final C01–C10, banco editorial certificado, suficiencia de evidencia, separación QBV2), sin abrir una cadena de microdecisiones de privacidad. El siguiente trabajo sigue siendo **documental**.

### 41.7. Estado
D-V9-001 a D-V9-032 APPROVED. D-V9-033 APPROVED **solo** para arquitectura simple de borrador local + D1 agregado anónimo; propuesta anterior de repreguntas D-V9-033 RETIRADA/NO APROBADA. **PLAN_ONLY**: sin código, pruebas, CI, merges ni despliegues.

## Changelog adicional
- **1.33.0 / 2026-10-29:** D-V9-033 aprobada para arquitectura simple de continuidad local 7 días y analítica agregada anónima en D1, con exclusión estricta de datos personales y de dispositivo; retirada la propuesta homónima previa de repreguntas. Ocho tareas PLAN-ANA01–08, dieciocho criterios y foco en consolidación del Plan Maestro. Solo documentación.


## 42. Consolidación integral D-V9-001–033 — matriz de cierre y bloqueos (revisión documental 2026-10-29)
**Naturaleza:** revisión del Plan Maestro existente, sin aprobar políticas nuevas ni alterar decisiones previas. Estado PLAN_ONLY. La línea base técnica del apartado 1 es una fotografía documental, **no una inspección renovada del código ni del HEAD de implementación**. Este apartado prevalece como índice de interpretación cuando haya formulaciones antiguas en tensión, pero no sustituye la aprobación del propietario para cambiar contratos.

### 42.1. Matriz consolidada de decisiones
| Grupo | Decisiones aprobadas | Contrato consolidado | Estado de cierre |
| --- | --- | --- | --- |
| Alcance y cobertura | D001–002 | Diagnóstico de madurez DIGITAL; cobertura C01–C10, sin presuponer ventas, web o CRM | Producto APROBADO; banco y escenarios sin certificar |
| Evaluación y evidencia | D003–004, D016–020 | Madurez cualitativa, numérico solo calibrado; 24 turnos, extensión excepcional consentida de hasta 5; abstenerse ante evidencia crítica insuficiente; taxonomía 8 dimensiones aún candidata | Política APROBADA; taxonomía/calibración PENDIENTES |
| Resultados y valor | D005–013 | Resumen anónimo, detalle con cuenta, recomendaciones explicables, Aprende y servicios opcionales, objetivos confirmados, roadmap y seguimiento/reevaluación | Producto APROBADO; contratos de datos y reglas por certificar |
| Idiomas y editorial | D014–015 | Español/inglés certificados; núcleo editorial completo y lotes progresivos, sin aprobación implícita del legado | Política APROBADA; contenido editorial PENDIENTE |
| Experiencia | D021–026 | Progreso por hitos, acompañamiento premium accesible, una pregunta principal, avance contextual reversible y control manual | Política APROBADA; diseño detallado y pruebas PENDIENTES |
| Borrador anónimo | D027–032 | Solo navegador, 7 días desde guardado válido, datos mínimos, texto libre opcional con consentimiento global reversible y exclusión individual, avisos honestos | Política APROBADA; implementación y seguridad PENDIENTES |
| Analítica | D033 | D1 únicamente para **analítica anónima agregada del uso de V9**; sin respuestas, IDs de dispositivo, IP, sesiones individuales ni datos personales | Producto APROBADO; esquema y evaluación de anonimato PENDIENTES |

### 42.2. Tensiones identificadas y resolución documental provisional
**C-01 — D1 analítico frente a D1 de identidad, resultados e historial.** Los apartados originales F07 y arquitectura V9 describen runs, claim, sesiones y tablas D1. D033 restringe **la analítica anónima** a agregados sin identificadores ni respuestas. No se debe inferir que esta decisión elimina el almacenamiento necesario para informes de usuarios autenticados, ni que autoriza guardarlo en las mismas tablas de analítica. **Gate:** elaborar mapa de flujos/almacenes por finalidad (borrador anónimo local / procesamiento de evaluación / resultado reclamado con cuenta / analítica agregada). Cualquier almacenamiento persistente de resultados con cuenta y su retención requieren contrato y revisión de privacidad explícitos. No afirmar que D1 es exclusivamente analítica para toda la plataforma sin resolver este alcance.

**C-02 — Medición de incompletos sin seguimiento individual.** D033 prohíbe IDs de sesión y trayectorias individuales. Los eventos agregados pueden medir inicios, progresiones y finalizaciones, pero **no identifican con exactitud personas únicas, abandonos definitivos ni reanudaciones deduplicadas**. **Gate:** especificar indicadores con nombres honestos, agregación y sesgos; evitar métricas de abandono por persona que requieran identificadores.

**C-03 — Texto libre no persistido y suficiencia de evidencia.** D030–032 permiten no conservar texto libre. D017 exige evidencia crítica suficiente y abstención en caso contrario. La propuesta anterior «D033 recuperar evidencia crítica» fue **retirada y no aprobada**. **Gate:** aplicar la regla existente de suficiencia y contador sin imponer repreguntas automáticas universales; diseñar recuperación mínima como cuestión editorial/técnica futura solo si se necesita.

**C-04 — Plazo de siete días y garantía real de borrado.** D028 fija TTL móvil desde guardado confirmado, D029 limita el soporte al navegador. No es técnicamente honesto prometer borrado físico instantáneo mientras el navegador esté cerrado ni resistencia absoluta a manipulación de reloj. **Gate:** caducidad lógica obligatoria antes de reanudar, limpieza al siguiente acceso y comunicación de límites.

**C-05 — «24 + 5» frente a presentación híbrida.** D020 cuenta turnos de pregunta/aclaración presentados; D024 impide agrupar decisiones independientes para reducir artificialmente el contador. **Gate:** matriz editorial de turnos, sin trucos de empaquetado, consentimiento previo a turno 25 y abstención si faltan pruebas.

**C-06 — Editorial progresiva frente a cobertura total desde lanzamiento.** D002 exige C01–C10 desde V9; D015 permite lotes editoriales progresivos. **Gate:** certificar un núcleo suficiente que cubra todos los escenarios **antes** de lanzar; los lotes posteriores amplían, no sustituyen cobertura inicial.

**C-07 — Taxonomía y puntuación.** D016 aprueba auditar ocho dimensiones candidatas, **no** aprueba ocho dimensiones definitivas, pesos, niveles ni calibraciones. **Gate:** aprobación explícita de taxonomía final y reglas de suficiencia antes de certificar scoring o informe.

**C-08 — Autonomía V9 y legacy.** F01–F04/F09 exigen ausencia de imports QBV2 en el núcleo, mientras la línea base documental reporta acoplamientos. **Gate:** verificar archivos y SHA reales, planificar sustitución y pruebas focalizadas; no confundir la existencia de rutas o tests con certificación.

**C-09 — Anonimato y observabilidad.** La ausencia de columnas personales en D1 no garantiza anonimato en registros de red, Workers, proveedores o telemetría. **Gate:** auditar el flujo extremo a extremo, minimizar registros, impedir reidentificación y documentar límites antes de certificar «anónimo».

**C-10 — Estado documental y cabecera histórica.** La cabecera original aún indica «Versión 1.0.0» y «PLAN / NO CERTIFICADO», mientras el historial append-only llega a v1.33.0. **Gate:** conservar historial; actualizar índice/cabecera mediante una edición documental acotada futura para mostrar versión efectiva y fecha de revisión, sin reescribir decisiones. Hasta entonces, el changelog y este apartado indican la versión documental efectiva.

### 42.3. Bloqueos priorizados para cerrar V9
| Orden | Bloqueo | Qué falta exactamente | Entregable documental antes de implementación |
| --- | --- | --- | --- |
| P0-1 | Taxonomía final C01–C10 | Validar/ajustar 8 dimensiones candidatas, N/A, evidencia y aplicabilidad | Matriz 8×10, propuesta final para aprobación explícita |
| P0-2 | Banco editorial certificado | Resolver 77 preguntas/387 opciones históricas como inventario no aprobado, completar núcleo bilingüe C01–C10 | Banco canónico con decisiones KEEP/REWRITE/REMOVE/ADD, revisión humana |
| P0-3 | Evidencia y evaluación | Definir criterios de suficiencia, abstención, reglas por dimensión y calibración válida | Contrato de evaluación trazable sin números inventados |
| P0-4 | Grafo y presupuesto | Comprobar alcanzabilidad, sustituciones y 24+5 sin ciclos ni preguntas irrelevantes | Matriz de rutas y presupuesto por C01–C10 |
| P0-5 | Desacoplamiento QBV2 | Verificar dependencias reales y plan de sustitución | Inventario de imports/consumidores con SHA, clasificación y pruebas focales futuras |
| P0-6 | Flujos y privacidad | Diferenciar borrador local, evaluación, informe con cuenta y analítica D1 agregada | Diagrama de datos y contrato de retención/propiedad por finalidad |
| P1-1 | Recomendaciones y Aprende | Evidencia, ranking, neutralidad, catálogos y contratos independientes | Reglas explicables y enlaces certificados |
| P1-2 | UX bilingüe y accesible | Integrar decisiones D021–032 sin microdecisiones adicionales | Especificación UX compacta y checklist |
| P1-3 | Integración, historial y lanzamiento | Reconciliar PR #162 con main, gates F00–F10, plan de corte/rollback | Plan de ejecución para agente futuro y certificación por SHA |

### 42.4. Secuencia de cierre documental sin nuevas ramificaciones
1. **CONSOL-01 — Taxonomía:** producir matriz 8×10 con propuestas, no declarar aprobada la versión final sin decisión explícita.
2. **CONSOL-02 — Editorial:** inventariar y certificar el núcleo mínimo es/en con cobertura C01–C10; los conteos históricos son línea base, no certificación actual.
3. **CONSOL-03 — Evaluación:** especificar evidencia crítica, abstención, calibración y resultados interpretables.
4. **CONSOL-04 — Grafo:** presupuestar 24+5 turnos por escenario y verificar rutas/adaptación.
5. **CONSOL-05 — Fronteras:** trazar separación V9/QBV2, borrador local, D1 analítico, resultados con cuenta, Aprende y GHL.
6. **CONSOL-06 — Handoff:** integrar tareas y gates F00–F10, criterios de aceptación y pruebas **focalizadas futuras**; no ejecutar.
Cada paso genera un entregable documental verificable y solo escala al propietario las decisiones de producto realmente bloqueantes.

### 42.5. Registro de aprobaciones y pendientes
- **APROBADO:** D-V9-001–033 en el alcance preciso de sus secciones; D-V9-033 significa analítica agregada en D1, no la propuesta anterior de repregunta.
- **NO APROBADO:** taxonomía definitiva, calibración numérica, banco editorial concreto, repregunta automática de todo texto ausente, persistencia de resultados con cuenta y retención exacta, tecnología concreta de almacenamiento local, esquema D1, umbrales de anonimato, política de logs.
- **NO CERTIFICADO:** implementación actual de V9, cobertura editorial, desacoplamiento QBV2, pruebas, CI, seguridad, producción.
- **REGLA DE CIERRE:** ninguna aprobación de producto implica código implementado; ninguna línea base documental sustituye auditoría del HEAD real.

### 42.6. Próximo trabajo documental
Empezar **CONSOL-01**: construir la matriz de las ocho dimensiones candidatas frente a los diez escenarios y señalar cuáles requieren renombrarse, fusionarse, redefinirse o marcarse no aplicables. Presentar propuesta concreta de taxonomía para aprobación posterior, **sin asumir que ya está aprobada**.

## Changelog adicional
- **1.34.0 / 2026-10-29:** consolidación documental de D-V9-001–033, nueve grupos de decisiones, diez tensiones y gates, nueve bloqueos priorizados, secuencia CONSOL-01–06 y registro explícito de pendientes. No modifica políticas aprobadas; sin código, pruebas, CI, merges ni despliegues.

## 43. CONSOL-01 — Taxonomía preliminar (propuesta, no aprobada)
La matriz conceptual 8×10 requiere inventario real del banco y contraste con C01–C10. Propuesta: conservar provisionalmente ocho dimensiones (claridad, presencia, descubrimiento, confianza, acceso, relación, aprendizaje, capacidad digital), sin pesos ni niveles. Gates pendientes: preguntas/opciones con SHA, solapamientos, rúbricas bilingües, aprobación explícita y versionado. PLAN_ONLY.

## Changelog adicional
- **1.35.0 / 2026-10-29:** apertura documental CONSOL-01; taxonomía NO aprobada.

## 44. CONSOL-01 — auditoría focal de mapeos de evidencia (2026-10-29)
**Solo documentación.** Fuente leída directamente: `app/features/diagnostic/qbv2-coverage.ts`, blob `16cae5010bf2584fe89e906d85733f9a56b5c8e2` en rama maestra V9. Es un mapeo legacy; NO acredita scoring autónomo V9 ni revisión editorial.

| Pregunta | Dimensiones según mapeo | Distinción importante |
| --- | --- | --- |
| q2_local_presence_consistency | digital_foundation + discovery | discovery marcado supporting |
| q2_local_discovery | discovery + measurement_optimization | measurement supporting |
| q2_ecommerce_traffic_sources | discovery + measurement_optimization | ambas supporting |
| q2_retail_product_visibility | clarity_positioning + conversion_access | conversion supporting |
| q2_ecommerce_product_discovery | digital_foundation + clarity_positioning + conversion_access | clarity y conversion supporting |
| q2_nonprofit_donation_clarity | clarity_positioning + conversion_access | clarity supporting |
| q2_startup_problem_clarity | clarity_positioning + conversion_access | conversion supporting |
| q2_followup_general_process | relationship_recurrence + digital_readiness | readiness supporting |
| q2_operations_process_ownership | digital_readiness | supporting |
| q2_startup_validation_evidence | clarity_positioning | supporting |
| q2_nonprofit_support_type | ninguna | contextual |
| q2_hospitality_flow_type | ninguna | contextual |

**Hallazgo:** el código contiene `EVIDENCE_DIRECTNESS` con excepciones direct/supporting y preguntas exclusivamente contextuales. La existencia de dos dimensiones por pregunta **no prueba doble puntuación**; se debe verificar el consumidor real de estos metadatos. El mapeo es parcialmente declarativo y contiene excepciones manuales; no asumir que cada evidencia es válida o aplicable en todos los escenarios.

**Acción TAX-G2:** contrastar estas relaciones con el banco candidato, cada opción, `evidenceV3`, variantes y semántica `unknown/none/not_applicable/not_published/unanswered`; producir tabla exhaustiva con ID, versión, SHA y decisión editorial humana. **Acción TAX-G3:** demostrar alcanzabilidad de evidencia crítica por C01–C10 dentro de 24+5. TAX-G2/TAX-G3 siguen PENDIENTES; la taxonomía definitiva sigue NO APROBADA.

## Changelog adicional
- **1.36.0 / 2026-10-29:** auditoría focal documental de mapeos de evidencia y roles direct/supporting/contextual; no código, tests, CI ni despliegue.

## 45. CONSOL-01 / TAX-G2 — trazabilidad del banco candidato (2026-10-29)
**Estado: PARCIAL, PLAN_ONLY.** Lectura directa de archivos de la rama maestra V9:
- `qa03b/specialty-candidate-bank.ts` blob `0bc44cddc1dc2f03230bd5ece30847fce984a12b`: banco candidato, selectores de nicho, reglas QBV2 y taxonomía compartida; declara no alterar el flujo público.
- `qa03b/specialty-branches-wave1.ts` blob `ec605156f2e974d7b463f44ae76475f8ede1f0e9`: banco de 77 preguntas según aserción del propio módulo; sustituciones de preguntas genéricas por especializadas.
- `qa03b/v9-editorial-review-matrix.ts` blob `5ce3b2520b4a9c4e569aa7a34962a008b46613ab`: matriz por pregunta y opción con roles de evidencia, flags y revisión humana.
- `qa03b/v9-editorial-graph-audit.ts` blob `89bce38ab69d1b5c12d5a339fb8de923894da1c9`: auditoría sintáctica; advierte expresamente que dependencias sintácticas no prueban alcanzabilidad.
**Hallazgo:** la candidata sigue usando `QuestionDefinitionV2`, `qbv2-rules` y componentes del banco QBV2. No certificar autonomía V9.

### Casos prioritarios para revisión humana
| Pregunta o grupo | Riesgo | Validación documental siguiente |
| --- | --- | --- |
| `q2_food_menu_visibility` | `not_applicable` puede confundirse con oferta aún no publicada | Distinguir no aplicable de no publicado en C08 |
| `q2_ecommerce_cart_followup` | Sin permiso para contactar no equivale a seguimiento deficiente | Revisar neutralidad en C07 |
| `q2_demand_trend` | Mezcla ventas, clientes, citas y pedidos | Variantes por C02/C05/C06 |
| `q2_capacity_signal` | Mezcla capacidad y resultado | Separar contexto operativo de evidencia digital |
| `q2_buyer_recipient_relation` | Pagador y beneficiario distintos | C05 y B2B |
| `q2_reputation_flow` | Referencias públicas frente a mensajes privados | Evitar penalización por no tener reseñas |
| `q2_appointments_rebooking` y sustituta dental | Riesgo de duplicidad u omisión | Comprobar exclusión y alcanzabilidad C06 |
| `q2_presence_offer_clarity` y sustitutas de gastronomía/agencia | Riesgo de pérdida de cobertura genérica | Verificar elegibilidad, fallback y C08/C10 |

### Gates
TAX-G2 **PARCIAL**: se identificaron fuentes y casos, pero falta inventario exhaustivo de 77 preguntas, opciones y variantes por dimensión con evidencia. TAX-G3 **PENDIENTE**: no se ha ejecutado recorrido del grafo ni demostrado cobertura C01–C10 o presupuesto 24+5. No aprobar taxonomía, puntuación, banco ni autonomía. Próximo entregable: matriz de inventario exhaustiva y análisis de alcanzabilidad documentales, sin pruebas ni código.

## Changelog adicional
- **1.37.0 / 2026-10-29:** trazabilidad focal del banco candidato, dependencias QBV2, sustituciones especializadas y ocho grupos de revisión editorial. Solo documentación.

## 46. CONSOL-01 — linaje editorial y riesgos de rutas (2026-10-29)
**PLAN_ONLY. Revisión estática focal, no ejecución del grafo.** Fuentes y blobs: `qa03b/bank.ts` `b4772d73e1d8b5044ba2011088db978c364097f0`; `qa03b/recovery-wave2.ts` `59fe5898cc98ba243b4c898b027dd22f2c1153c9`; `qa03b/specialty-candidate-bank.ts` `0bc44cddc1dc2f03230bd5ece30847fce984a12b`; `qa03b/specialty-branches-wave1.ts` `ec605156f2e974d7b463f44ae76475f8ede1f0e9`.

### Linaje comprobado
1. `qa03b/bank.ts` deriva un banco revisado del histórico `qbv2-reviewed-evidence`, con reemplazos y preguntas nuevas.
2. `specialty-candidate-bank.ts` aplica ajustes editoriales, expande `q2_sector` a versión candidata 4, añade ocho selectores sectoriales de nicho, recuperación piloto y wave2.
3. `specialty-branches-wave1.ts` añade ramas especializadas y sustituciones de preguntas genéricas; su aserción exige 77 IDs únicos en el candidato.
4. `v9-editorial-review-matrix.ts` audita el candidato pero no certifica comprensión humana ni rutas ejecutables.
**Importante:** el número 77 es una aserción del código fuente, no un recuento independiente realizado en esta revisión.

### Riesgos concretos de elegibilidad
| Caso | Regla observada | Riesgo para C01–C10 | Gate |
| --- | --- | --- | --- |
| Wave2 ecommerce | `operating` + `has_customers=yes` + arquetipo ecommerce | C02/C03 no deben heredar supuestos de ventas activas | Comprobar rutas prelaunch/pausa |
| Wave2 medición | operación activa con historial y `goal=measure` | Evidencia de medición puede faltar si el objetivo declarado es otro | Evaluar suficiencia sin forzar objetivos |
| Wave2 seguimiento | operación activa con historial y objetivo/fricción de seguimiento | No confundir ausencia de pregunta con buen seguimiento | Probar elegibilidad contextual |
| Wave2 operaciones | operación activa con historial y objetivo/fricción de operaciones | Riesgo de no observar capacidad digital en otros perfiles | Distinguir contexto de evidencia |
| Donaciones | organización/misión + operación + soporte donaciones/mixto | C05 sin donaciones no debe ser penalizado | Comprobar `not_applicable` y alternativas |
| Especialidad dental | operación activa + clientes + nicho dentista + citas + meta/fricción específica | Sustitución de `q2_appointments_rebooking` puede no activarse en rutas alternativas | Probar fallback |
| Especialidad gastronomía/agencia | operación activa + clientes + nicho + objetivo de explicar + presencia declarada | Sustitución de `q2_presence_offer_clarity` podría perder evidencia si falla el contexto | Probar exclusión mutua y fallback |
| Sector desconocido | selector admite `other` y `unknown` | C10 requiere ruta genérica, sin inferir nicho | Probar fallback y abstención |

### Criterios de revisión
- La selección de objetivo no debe convertir una dimensión relevante en «suficiente» sin evidencia; si faltan datos, abstención conforme D017.
- `q2_startup_demand_signal` en wave2 declara `evidenceMigration=pending`: no puntuar ni inferir ventas por interés.
- `q2_ecommerce_cart_visibility` mide visibilidad, no permiso para contactar.
- `q2_measurement_practice` contempla `not_enough_activity` como no aplicable; distinguirlo de no medir.
- El contrato de `QuestionDefinitionV2` y las reglas `qbv2-rules` siguen presentes en el candidato: autonomía V9 NO CERTIFICADA.
- No hay evidencia de cobertura efectiva C01–C10 ni de presupuesto 24+5 hasta verificar rutas; el análisis de condiciones es estático.

### Próximo entregable
Completar inventario exhaustivo por ID/opción/variante/evidenceV3 y matriz de rutas C01–C10 con clasificación `reachable / unreachable / insufficient / unknown`, trazas y SHA. No ejecutar pruebas, no modificar implementación ni afirmar certificación.

## Changelog adicional
- **1.38.0 / 2026-10-29:** linaje del banco candidato y ocho riesgos de elegibilidad contextual documentados con SHA; sin código, pruebas ni despliegue.

## 47. CONSOL-01 — especificación del inventario editorial exhaustivo (2026-10-29)
**PLAN_ONLY.** Fuente revisada: `qa03b/v9-editorial-review-matrix.ts`, blob `5ce3b2520b4a9c4e569aa7a34962a008b46613ab`, y `qa03b/v9-editorial-graph-audit.ts`, blob `89bce38ab69d1b5c12d5a339fb8de923894da1c9`. La existencia de funciones no equivale a su ejecución o certificación.

### Funciones ya disponibles para un futuro agente
| Función | Información obtenible | Límite |
| --- | --- | --- |
| `buildCandidateEditorialMatrixV9` | Filas por pregunta y opciones, versiones, variantes y flags | No certifica interpretación humana |
| `buildEditorialReviewBatchesV9` | Lotes de revisión priorizados por alertas | Prioridad editorial, no severidad clínica ni score |
| `listHighPriorityEditorialQuestionsV9` | IDs y valores con mapeo faltante | No reemplaza revisión completa |
| `buildHighPriorityEditorialReportV9` | Enunciados y opciones prioritarias | No incluye certificación bilingüe |
| `auditMissingEvidenceDimensionsV9` | Opciones migradas sin estado para alguna dimensión | No cubre semántica de opciones no migradas |
| `groupMissingEvidenceByDimensionV9` | Huecos agrupados por dimensión | No demuestra ruta alcanzable |
| `auditQuestionBankV9` | Dependencias, estructura y flags del banco | Auditoría sintáctica, no prueba de ejecución |

### Contrato documental de salida TAX-G2
Por cada pregunta y opción: ID y versión, módulo, texto es/en (si existe), tipo, variante, regla de aplicabilidad, dependencia, opción y `kind`, exclusividad, evidencia `direct/supporting/contextual`, dimensión, estado, bandera de revisión, decisión editorial, procedencia de archivo y blob SHA. Clasificar explícitamente **no disponible** cuando un campo no esté sustentado por fuente; no inventar traducciones ni decisiones.

### Matriz de rutas TAX-G3 pendiente
Para cada C01–C10, documentar al menos una trayectoria representativa y casos alternativos de `unknown`, `none`, `not_applicable`, ausencia de respuesta y cambio de sector. Cada paso debe señalar pregunta, regla de entrada, sustitución, evidencia crítica, consumo de interacción y destino; clasificar como `alcanzable`, `no alcanzable`, `insuficiente` o `no demostrado`. No inferir alcanzabilidad por referencias sintácticas. Comprobar presupuesto base de 24 y extensión excepcional de 5 solo con consentimiento; sin agrupar decisiones independientes para eludirlo.

### Orden de revisión humana propuesto
1. Contexto/estado/destinatario: C02, C03, C05 y C10.
2. Neutralidad de opciones: `q2_food_menu_visibility`, `q2_ecommerce_cart_followup`.
3. Sustituciones: citas dentales, gastronomía y agencia; fallback genérico.
4. Evidencia cruzada: presencia/descubrimiento, claridad/acceso, relación/capacidad.
5. Revisión bilingüe es/en, trazabilidad y cobertura integral.
**Estado:** especificación de inventario DOCUMENTADA; inventario materializado y validación de rutas PENDIENTES. No hay nuevos conteos certificados ni ejecución de pruebas.

## Changelog adicional
- **1.39.0 / 2026-10-29:** especificación TAX-G2/TAX-G3, funciones existentes y criterios de evidencia y rutas; solo documentación.

## 48. CONSOL-01 — ficha de opciones críticas y rutas de sustitución (2026-10-29)
**Estado:** revisión estática parcial, no certificación. PLAN_ONLY. Fuentes: `qa03b/specialty-branches-wave1.ts` blob `ec605156f2e974d7b463f44ae76475f8ede1f0e9`; `qa03b/recovery-wave2.ts` blob `59fe5898cc98ba243b4c898b027dd22f2c1153c9`; `qa03b/v9-editorial-review-matrix.ts` blob `5ce3b2520b4a9c4e569aa7a34962a008b46613ab`.

### Opciones y evidencias inspeccionadas
| ID | Opciones / semántica comprobada | Evidencia candidata | Revisión requerida |
| --- | --- | --- | --- |
| `q2_food_menu_visibility` | `clear=established`, `partial=partial`, `unclear=weak`, `not_applicable=not_applicable`, `unknown=uncertainty` | clarity_positioning / direct | «Todavía no muestro la oferta» no implica que sea realmente no aplicable; distinguir `not_published` de `not_applicable` con migración versionada |
| `q2_dental_care_continuation` | `proactive=established`, `partial=partial`, `reactive=weak`, `not_applicable=not_applicable`, `unknown=uncertainty` | relationship_recurrence / direct | No exigir continuidad a tratamientos de una sola visita |
| `q2_marketing_agency_scope_clarity` | `clear=established`, `partial=partial`, `unclear=weak`, `not_applicable=not_applicable`, `unknown=uncertainty` | clarity_positioning / direct | Diferenciar servicios no presentados de servicios no aplicables |
| `q2_ecommerce_cart_visibility` | `yes=established`, `no=missing`, `unknown=uncertainty` | measurement_optimization / supporting | Visibilidad del carrito no acredita identificación ni permiso de contacto |
| `q2_ecommerce_cart_followup` v2 | `always=established`, `sometimes=partial`, `rarely=weak`, `no_authorized_contact=not_applicable`, `unknown=uncertainty` | relationship_recurrence / direct | Revisar exclusión legítima y no penalizar falta de permiso |
| `q2_startup_demand_signal` | `evidenceMigration=pending`, sin `evidenceV3` | ninguna evidencia aprobada | Interés, prueba y venta no equivalentes; no puntuar |
| `q2_ecommerce_repeat_purchase` | `evidenceMigration=pending`, sin `evidenceV3` | ninguna evidencia aprobada | No inferir recurrencia digital de repetición de compras |
| `q2_hospitality_flow_type` | `evidenceMigration=pending`, sin `evidenceV3` | contexto de modalidad | No confundir reservas de restaurante con citas profesionales |

### Rutas condicionadas, no certificadas
1. Sustitución dental: requiere `operating`, historial de clientes, nicho dentista, arquetipo citas y objetivo/fricción pertinentes. La pregunta genérica `q2_appointments_rebooking` recibe puerta inversa `not(dentalSpecialistEligible)`.
2. Sustitución gastronomía/agencia: requiere operación e historial, nicho concreto, objetivo `explain` y presencia digital declarada; la genérica `q2_presence_offer_clarity` recibe `not(foodSpecialistEligible) AND not(agencySpecialistEligible)`.
3. Ecommerce: `q2_ecommerce_cart_followup` solo se plantea si `q2_ecommerce_cart_visibility=yes`; `no_authorized_contact` preserva exclusión neutral.
4. Preparación: `q2_startup_demand_signal` está disponible por estado `preparing` pero pendiente de evidencia; no cuenta como nivel certificado.
Estas son condiciones leídas en código; **no** se ha probado alcanzabilidad, presupuesto ni ausencia de duplicados en una sesión real.

### Decisiones bloqueadas
- No cambiar automáticamente `not_applicable` a `not_published` sin decisión editorial y versión de opción.
- No reutilizar scores QBV2 para V9 sin separar evidencia y contratos.
- No aprobar nivel de madurez a partir de `pending` o `supporting` aislado.
- No declarar TAX-G2/TAX-G3 completados: falta inventario de todas las opciones y rutas C01–C10.

**Siguiente entrega:** revisión documental de rutas genéricas para C02/C03/C05/C10 y tabla de cobertura por dimensión con evidencia directa alcanzable, no solo mapeada.

## Changelog adicional
- **1.40.0 / 2026-10-29:** fichas de ocho preguntas críticas con estados de opción, cuatro rutas condicionadas y decisiones editoriales bloqueadas. Solo documentación.
