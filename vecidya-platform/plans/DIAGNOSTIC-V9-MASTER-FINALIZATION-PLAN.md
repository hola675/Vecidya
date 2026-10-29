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
