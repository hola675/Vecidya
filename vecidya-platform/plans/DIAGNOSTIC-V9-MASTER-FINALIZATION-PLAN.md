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
