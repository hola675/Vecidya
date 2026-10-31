# Diagnóstico V9 — Registro de cierre del plan de implementación
Versión: 0.2.0 | Fecha: 2026-10-31 | Estado: PLAN_ONLY / PENDIENTE DE APROBACIÓN
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

## 9. Reconciliación de decisiones existentes (lectura del plan maestro v1.70.0)
**Corrección de interpretación:** DEC-01–DEC-12 del apartado 3 son un índice de verificación técnica, NO doce preguntas de producto nuevas. El plan maestro contiene aprobaciones expresas D-V9-001–033 que deben respetarse. No reabrir decisiones aprobadas por estar pendientes de implementación.

| DEC | Política ya aprobada en plan maestro | Pendiente real |
| --- | --- | --- |
| 01 | D-V9-016 y V9-TAX-A: mantener ocho dimensiones candidatas y auditarlas frente a C01–C10 | Taxonomía final, nombres, aplicabilidad, pesos |
| 02 | D-V9-005: resumen anónimo e informe detallado con cuenta; D-V9-027–033: borrador local anónimo 7 días, datos mínimos y D1 solo analítica agregada anónima | Contrato exacto del informe identificado, propiedad y retención de resultados |
| 03 | D-V9-006: impacto, urgencia, esfuerzo y objetivos; D-V9-011: Ahora/Después/Más adelante | Fórmula, desempates, dependencia y ejemplos; cantidad de prioridades no fijada por D006 |
| 04 | D-V9-004 y D-V9-018–020: objetivo 24, extensión máxima de cinco con consentimiento explícito; cuenta cada turno de decisión/aclaración, no navegación | Algoritmo de presupuesto y trazas por escenario |
| 05 | Política antiduplicación documentada y helper candidate-only 13/13 focal PASS en SHA histórico | Fuente confiable de correlación, consentimiento, conflicto, replay y scorer aislado |
| 06 | D-V9-003 y D-V9-017: modelo híbrido; preguntar adicional solo por evidencia crítica y abstenerse de nivel si sigue insuficiente | Esquema de incertidumbre y contratos exactos |
| 07 | D-V9-003 y D-V9-013: números solo con calibración/cobertura y comparación histórica compatible | Umbrales definitivos, confianza, versiones y pruebas |
| 08 | D-V9-015: núcleo certificado y lotes progresivos con cobertura completa antes de lanzamiento | Revisión humana por pregunta/opción de banco 90; selección final |
| 09 | D-V9-007: Aprende contextual y biblioteca opcional; D-V9-008: servicios contextuales opcionales y sección independiente | Adaptadores reales, elegibilidad y enlaces verificados |
| 10 | D-V9-012: seguimiento manual, revisión voluntaria y reevaluación explícita; D-V9-027–033: reglas de borrador anónimo | Persistencia de informe autenticado, historial, controles y retención |
| 11 | V8 se conserva hasta corte autorizado; D-V9-013 exige compatibilidad para comparar números históricos | Decidir si se ofrece importación histórica opcional, con adaptador aislado |
| 12 | Gates F09/F10: piloto, staging, rollback, aprobación explícita | Checklist operativo y evidencia de certificación |

### Otras aprobaciones que NO deben volver a preguntarse
- D-V9-001 DIGITAL; D-V9-002 cobertura completa desde V9; D-V9-009 objetivos iniciales opcionales, sugeridos y confirmados.
- D-V9-010 conclusiones con explicación breve (sin panel técnico de trazabilidad pública aprobado).
- D-V9-014 español e inglés completos certificados.
- D-V9-021–026 acompañamiento premium, progreso por hitos, tono cercano/elegante, una pregunta principal por vista y autoavance contextual reversible.
- D-V9-029–032 borrador exclusivamente local, consentimiento global reversible para texto libre con exclusiones individuales y avisos contextuales.
- D-V9-033 es SOLO arquitectura simple (borrador local + D1 agregado anónimo). La propuesta homónima anterior de repreguntar textos no persistidos fue retirada y NO está aprobada.

### Lista reducida de decisiones realmente abiertas
A. Taxonomía final de ocho dimensiones, etiquetas y criterios de aplicabilidad tras auditoría 8×10.
B. Calibración, umbrales de puntuación, confianza y condiciones de score global; sin imponer puntuación donde no hay evidencia.
C. Matriz editorial completa y aceptación de preguntas/opciones del catálogo 90.
D. Identidad y fuente de confirmación de eventos correlacionados, consentimiento y versionado de evidencia.
E. Contrato detallado de informe identificado, retención, acceso y seguimiento.
F. Algoritmos de priorización, presupuesto adaptativo y fallbacks, respetando políticas ya aprobadas.
G. Contratos técnicos y aceptación de Aprende/servicios y separación de GHL.
H. Estrategia de reconciliación main→V9, sustitución V8, certificación y rollback.
Ninguna de A–H se considera aprobada por este registro.

## 10. Siguiente paquete documental: backlog atómico
Preparar matriz F00–F10 con: ID, prerequisito, ruta/contrato, cambio permitido, prueba focal, evidencia y condición de parada. En PLAN_ONLY solo documentar tareas; no ejecutarlas.

## Changelog adicional
- 0.2.0 / 2026-10-31: reconciliación de DEC-01–12 con aprobaciones D-V9-001–033; reduce consultas pendientes y evita reabrir decisiones cerradas. Sin runtime ni CI.
