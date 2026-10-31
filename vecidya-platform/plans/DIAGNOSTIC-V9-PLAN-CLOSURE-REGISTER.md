# Diagnóstico V9 — Registro de cierre del plan de implementación
Versión: 0.1.0 | Fecha: 2026-10-31 | Estado: PLAN_ONLY / PENDIENTE DE APROBACIÓN
Repositorio: hola675/Vecidya | PR: #162 | Rama: feat/diagnostic-v9-lex-graph-p1b

## 1. Propósito y fuentes
Convertir el plan maestro F00–F10 en un paquete ejecutable, sin confundir avances parciales, decisiones propuestas y certificación final.
Fuentes: DIAGNOSTIC-V9-MASTER-FINALIZATION-PLAN.md (v1.70.0), DIAGNOSTIC-V9-PRODUCT-DEFINITION-V1.md, DIAGNOSTIC-V9-EVALUATION-MODEL-V1.md y código del scorer/correlador V9 en el HEAD 53e5162b6bc3.
Prevalece el contrato PLAN_ONLY: este registro NO autoriza implementación, merge, CI adicional, migraciones ni despliegue.

## 2. Decisiones ya documentadas
- D-V9-001: alcance DIGITAL aprobado: madurez digital contextual, no auditoría integral empresarial.
- Banco candidato 77/82/90: 90 IDs son catálogo, no turnos obligatorios; ocho generales nuevas siguen sin evidencia migrada y sin puntuación.
- Evidencia: separar contexto, directa, apoyo y neutralidad; desconocido/no aplicable/no publicado no equivalen a cero.
- V8 permanece operativo hasta corte autorizado; GHL no forma parte del scoring.
- Recomendaciones justificadas, gratuitas cuando correspondan; Aprende por adaptador y fallback.
- Referencia de entrevista 24+5 condicionada a pertinencia/consentimiento; no forzar preguntas para obtener puntuaciones.
Estas reglas documentadas NO equivalen a aprobación editorial completa.

## 3. Decisiones pendientes para el responsable
| ID | Decisión necesaria | Propuesta predeterminada para revisión | Cierre requerido |
| --- | --- | --- | --- |
| DEC-01 | Confirmar etiquetas y aplicabilidad de ocho dimensiones | Mantener ocho IDs, revisar nombres públicos y casos de no aplicabilidad | Aprobación funcional |
| DEC-02 | Anónimo vs identificado | Resultado anónimo útil; guardado, historial y vínculo explícito solo con identidad/permiso | Matriz de visibilidad y persistencia |
| DEC-03 | Número de prioridades y orden | Hasta tres prioridades visibles, orden explicable por impacto, urgencia y factibilidad | Regla y ejemplos aprobados |
| DEC-04 | Límite de entrevista | Objetivo 24+5; superar solo por decisión explícita y evidencia crítica | Regla de excepción y UX |
| DEC-05 | Correlación de eventos | Solo correlación explícita/registro verificable; no inferir de questionId | Fuente, consentimiento, replay y versionado |
| DEC-06 | Evidencia insuficiente o contradictoria | Abstención o preliminar etiquetado, nunca porcentaje engañoso | Contrato de resultado y confianza |
| DEC-07 | Calibración y score global | Versionar contribuciones y umbrales; no mostrar índice global cuando no alcanza suficiencia | Tabla de umbrales y casos aprobados |
| DEC-08 | Aprobación editorial 90 | KEEP/REWRITE/REMOVE/ADD/DEFER por pregunta y opción, con aprobador humano | 100 % de decisiones registradas |
| DEC-09 | Recomendaciones | Acción autónoma/gratuita primero; Aprende publicado verificado; oferta comercial secundaria | Contrato y fallback |
| DEC-10 | Persistencia de informes | Versiones, snapshot reproducible y política de retención por definir | Esquema y política aprobados |
| DEC-11 | Migración histórica V8 | Mantener datos; adaptador opcional aislado solo si existe caso de uso aprobado | Política de compatibilidad |
| DEC-12 | Corte y rollback | Staging, piloto, E2E, aprobación expresa; no borrar migraciones históricas | Checklist de lanzamiento |

## 4. Bloqueos técnicos que deben figurar en el plan
- P0-SCORER: correlador candidate-only no conectado a v9-candidate-scoring.ts. Dos preguntas sobre un mismo hecho pueden contar doble si solo se deduplica por observationId. Exigir prueba de duplicado, evento independiente, contradicción, correlación incompleta y calibración.
- AUTONOMÍA: scorer/planner V9 aún importan QBV2; definir sustitutos y orden de retirada sin tocar V8 antes del corte.
- BANCO: siete generales candidatas directas condicionadas y una de apoyo siguen sin evidenceV3 activada; cinco ADD previas tampoco certificadas.
- GRAFO: faltan recorridos C01–C10 completos, presupuesto 24+5, cambios de contexto, fallbacks y casos sin ventas/pausa/ONG.
- F00: PR #162 draft y no fusionable automáticamente; resolver main→rama V9 en tarea independiente con respaldo y verificación, no durante PLAN_ONLY.
- INFORMES/INTEGRACIONES: falta cerrar contrato real de informe, Aprende, servicios, identidad, consentimiento y permisos.

## 5. Paquetes de planificación y criterio de salida
| Paquete | Entrega | Gate |
| --- | --- | --- |
| P00 | Inventario fuente→comportamiento→hueco→decisión con SHA | Sin dependencias desconocidas críticas |
| P01 | Especificación funcional y acta DEC-01–DEC-12 | Decisiones aprobadas o diferidas con fallback explícito |
| P02 | Matriz editorial completa 90 y variantes/opciones | Ninguna aprobación implícita; responsables identificados |
| P03 | Backlog F00–F10 con tareas atómicas | Cada tarea tiene ID, prerequisitos, archivos, contrato, prueba focal, evidencia y rollback |
| P04 | Contratos de Aprende, MiniWeb, Vecindario, servicios, GHL opcional | Fronteras y fallbacks claros |
| P05 | Matriz C01–C10, seguridad, E2E, migración y release | Gates medibles y comandos verificados al ejecutar |
| P06 | Paquete READY_FOR_AGENT con orden, checkpoints y stop conditions | Aprobación expresa del responsable |

## 6. Orden de ejecución futuro (NO AUTORIZADO AÚN)
F00 conciliación Git → F01 dependencias → F02 banco → F03 grafo → F04 motor autónomo → F05 informes → F06 recomendaciones → F07 identidad/persistencia → F08 seguridad/UX/E2E → F09 corte/limpieza legacy → F10 staging/piloto/producción.
Las tareas pueden tener trabajo preparatorio paralelo solo cuando no rompa prerequisitos ni modifique consumidores adyacentes. Las pruebas durante implementación serán focalizadas; E2E y regresión de integración solo en gates definidos.

## 7. Evidencia y prohibiciones
La documentación del plan registra 13/13 PASS en GitHub Actions run 41200765557 para commit 231fba058803, exclusivamente en pruebas focales del banco 90/correlador; NO certifica el HEAD ni F02–F10.
No cambiar TypeScript, SQL, tests, CI, rutas, Workers, D1, Aprende, MiniWeb, Vecindario ni GHL durante esta etapa. No hacer merge, deploy ni afirmar fases DONE sin evidencia.

## 8. Próximo paso documental
Consolidar DEC-01–DEC-12 contra las decisiones aprobadas en secciones posteriores del plan maestro para evitar volver a preguntar lo resuelto; luego elaborar matriz de tareas F00–F10 y paquete de aceptación. Este documento es registro inicial, no decisión aprobada.

## Changelog
- 0.1.0 / 2026-10-31: registro inicial de decisiones, bloqueos, paquetes P00–P06 y gates; solo documentación.
