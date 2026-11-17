# Diagnostic V9 — Hoja ejecutiva de decisión humana A–H

**Versión:** 0.4.0
**Fecha:** 2026-11-14
**Estado:** APROBADA POR RESPONSABLE · FALLBACKS VIGENTES · W1–W5 HISTÓRICO CERRADO · RUNTIME RESTANTE PLAN_ONLY  
**Base reconciliada:** `origin/main@cbdb73e2122722231376c3201b1a240d06ff7255`

## 1. Propósito

Reducir DEC-A…H a una sola hoja de aprobación sin perder sus condiciones técnicas.

Esta hoja **no aprueba nada por sí sola**. Define la recomendación consolidada del agente a partir de los paquetes documentales y de la lectura estática del código.

Estados posibles tras revisión humana:
- `APPROVED`
- `APPROVED_WITH_FALLBACK`
- `DEFERRED`
- `REJECTED`

## 1A. Autoridad de estado

Esta hoja es la **fuente canónica de estado humano para DEC-A…H**. Los paquetes DEC-A/B/C/D/F/G/H conservan su análisis técnico, pero sus frases históricas “READY_FOR_HUMAN_REVIEW”, “NO APROBADO” u “OPEN” no prevalecen sobre esta hoja. DEC-E además fue refinado y ratificado en su paquete v0.2.1 del 2026-11-03.

Aprobación de una decisión ≠ autorización de implementación. El runtime pendiente sigue bajo `PLAN_ONLY` salvo levantamiento explícito y acotado por lote.

## 2. Resumen recomendado

| DEC | Recomendación humana sugerida | Condición principal |
|---|---|---|
| A | APPROVED | conservar 8 dimensiones técnicas + fronteras U/O/S |
| B | APPROVED_WITH_FALLBACK | aprobar modelo base, diferir bandas públicas y corregir binding v2/v4 antes de implementación |
| C | APPROVED_WITH_FALLBACK | 77 baseline; 82/90 permanecen experimentales/pending |
| D | APPROVED | adoptar correlación Opción B: constructKey global + overlapGroup estricto |
| E | APPROVED_WITH_FALLBACK | incompletos: métricas de uso agregadas/coarse-grained, sin valores/transcript de respuestas; preguntas/respuestas solo tras completar y consentimiento explícito para auditoría/mejora, nunca marketing |
| F | APPROVED | 24+5 consentido + multicriterio sin pesos inventados |
| G | APPROVED | Diagnóstico→acción→Aprende→servicios→GHL opcional |
| H | APPROVED_WITH_FALLBACK | main→V9; resolver migraciones antes de F00; V8 permanece activo |

## 3. DEC-A — taxonomía

### Recomendación histórica (2026-11-14; supersedida)
**APPROVED**

Aprobar:
- ocho IDs técnicos actuales;
- nombres públicos propuestos como baseline editorial;
- familias de aplicabilidad:
  - U = universal: clarity + digital_readiness;
  - O = dependiente de operación: foundation + trust + measurement;
  - S = dependiente de estructura: discovery + conversion + relationship;
- reglas de separación OVL-01…04;
- matriz 8×10 como baseline de prueba, no como certificación runtime.

### Por qué
Cambiar ahora la cantidad de dimensiones rompería demasiados contratos sin evidencia suficiente de que una fusión mejore el diagnóstico. Los solapamientos identificados pueden resolverse por semántica/correlación.

### Fallback
Conservar IDs internos y abstenerse de score cuando applicability/evidence sea insuficiente.

## 4. DEC-B — calibración

### Recomendación
**APPROVED_WITH_FALLBACK**

Aprobar:
- contribuciones ordinales `1/.75/.5/.25/0`;
- estados `constraint/uncertainty/not_applicable = null`;
- al menos una directa válida para score;
- supporting weight 0.5, cap 50% del peso directo;
- mínimo 3 dimensiones puntuadas;
- mínimo 60% de dimensiones aplicables cubiertas;
- igual ponderación provisional entre dimensiones;
- confianza interpretada como suficiencia de evidencia, no probabilidad.

### Diferir
- bandas públicas 26/51/76;
- bandas históricas 41/71;
- cualquier afirmación de validación estadística.

### Condición P0
Antes de implementar:
- `scoring_version` debe resolver una calibration identity/version concreta;
- Worker replay y finalization deben recibir esa calibración explícitamente;
- ningún path autoritativo debe caer a un default implícito v2/v4.

### Fallback
Resultado cualitativo + prioridades + incertidumbre, sin score global.

## 5. DEC-C — banco 77/82/90

### Recomendación
**APPROVED_WITH_FALLBACK**

Aprobar:
- 77 como baseline efectivo hasta corte autorizado;
- 18 KEEP como candidatos de continuidad;
- 59 REWRITE como backlog versionado;
- cinco ADD 82 como candidatos experimentales;
- ocho probes 90 como candidatos experimentales;
- `q2_real_estate_inquiry_entry` NO sustituye todavía a `q2_professional_intake_flow`;
- “90” significa catálogo máximo candidato, no 90 turnos ni 90 fuentes de score.

### Condición
ADD/probes no pasan a evidence/scoring hasta DEC-A/D/B y revisión individual.

### Fallback
Banco 77 fijado.

## 6. DEC-D — correlación

### Recomendación
**APPROVED**

Adoptar **Opción B**:
- todo mapping aprobado recibe `constructKey`;
- familias con riesgo reciben `overlapGroup`;
- event/period correlation estricta solo donde exista solapamiento real;
- correlation runtime solo por `explicit_confirmation` o `verified_record`;
- mismo questionId/diferente questionId no decide independencia;
- conflicto/unmapped en overlapGroup = fail-closed;
- replay debe persistir/reproducir accepted/deduplicated/conflict.

### Por qué
Opción A global impone metadata pesada incluso donde no existe riesgo. Opción B cubre el P0 de doble conteo con menor complejidad.

### Fallback
Ante independencia no demostrada, conservar una sola fuente directa o no puntuar.

## 7. DEC-E — identidad, retención e informe

### Recomendación
**APPROVED_WITH_FALLBACK**

Aprobar la separación:
- E-D1 borrador anónimo local;
- E-D2 procesamiento de evaluación;
- E-D3 resultado/informe identificado;
- E-D4 analítica agregada.

La recomendación siguiente registra la decisión humana de 2026-11-14 y queda preservada como historia; la política vigente se actualizó después.

### Arquitectura recomendada (histórica)
Para el anónimo, se recomendó persistencia local durante entrevista, procesamiento server-side al completar, resumen anónimo y storage terminal de Q/A tras consentimiento. **La parte de almacenamiento terminal quedó supersedida el 2026-11-16**; no es política vigente ni autorización de implementación.

### Aclaración humana vigente — 2026-11-16 (supersede la recomendación de storage terminal)
- D1 no guarda respuestas, valores elegidos, transcript, identidad/run individual ni resultado en ningún estado, incluido diagnóstico finalizado.
- Solo se permiten métricas de uso agregadas/coarse-grained que no permitan reconstruir o reidentificar respuestas.
- La entrevista queda local; el replay/finalización ocurre transitoriamente; el resultado firmado permanece local con TTL de 24 horas y el borrador con TTL de siete días.
- Las filas legacy que ya existan se preservan. Las lecturas históricas son owner-only/read-only, sin recálculo ni mutación; no se autoriza aquí borrar ni migrar registros.
- El schema `diagnostic_v9_*` se conserva como prototipo histórico, no como destino para nuevos datos individuales.

### Condiciones vigentes
- No habilitar los endpoints legacy que escriben identidad/run/evento por cada respuesta.
- El consentimiento de extensión de entrevista no autoriza almacenamiento D1 ni se infiere consentimiento para otras finalidades.
- Ownership personal no implica pertenencia organizacional; cualquier lectura histórica requiere prueba de ownership.
- Mantener los TTL separados: draft local siete días, resultado firmado local 24 horas.
- Definir métricas permitidas y su retención, además de política de acceso/retención/backups para las filas legacy existentes, antes de cerrar F07-L4/L5/F08.

### Fallback vigente
La entrevista, replay y resultado permanecen locales/transitorios; no hay persistencia terminal de respuestas en D1 aunque exista consentimiento para otras finalidades.

### Changelog
- **0.5.0 / 2026-11-16:** aclaración posterior del responsable: prohíbe persistir en D1 Q/A, transcript e identidad/run individual incluso después de finalizar; solo métricas agregadas, replay transitorio y resultado local TTL 24 h. Se preserva el texto de 0.4.0 como decisión histórica supersedida.
- **0.4.0 / 2026-11-14:** se precisa DEC-E: métricas agregadas/coarse-grained para intentos incompletos, sin respuestas; el guardado de preguntas/respuestas solo se permite después de completar y consentir, para auditoría/mejora y nunca marketing. Pendientes la implementación terminal, retención, borrado y backups.

## 8. DEC-F — prioridad, presupuesto y fallbacks

### Recomendación
**APPROVED**

Aprobar:
- hasta 24 turnos ordinarios;
- hasta 5 adicionales;
- consentimiento explícito antes del turno 25;
- máximo 29;
- detenerse antes si ya existe evidencia suficiente;
- extensión solo por evidencia crítica;
- mismo contador al cambiar idioma/reanudar;
- selector de preguntas separado del ranking de acciones.

Ranking de acciones:
- evidencia;
- dependencias;
- urgencia contextual;
- objetivo confirmado;
- impacto cualitativo;
- esfuerzo estimado/unknown;
- sin pesos numéricos inventados inicialmente.

### Condición P0
El hard cap técnico actual de 24 debe cambiar solo junto con:
- máquina de consentimiento;
- contador idempotente;
- critical-gap contract;
- replay 24+5.

### Fallback
Finalizar con dimensiones insuficientes sin score inventado.

## 9. DEC-G — Aprende, Vecidya y GHL

### Recomendación
**APPROVED**

Aprobar arquitectura:
`Diagnóstico → Acción → Aprende → Servicios Vecidya → GHL opcional`.

Reglas:
- acción autónoma siempre primero;
- Aprende read-only posterior al ranking;
- servicios read-only posteriores al ranking;
- catálogos no forman parte de scoring_version;
- ausencia de contenido/servicio no cambia diagnóstico;
- GHL solo con finalidad/consentimiento explícito;
- nunca enviar respuestas completas por defecto;
- GHL nunca es identidad, evidence source obligatoria ni dependencia de informe.

### Fallback
Informe completo sin Aprende/servicios/GHL.

## 10. DEC-H — integración, corte y rollback

### Recomendación
**APPROVED_WITH_FALLBACK**

Aprobar dirección:
- integrar `main` hacia rama V9;
- nunca resetear `main`;
- no force-push;
- main prevalece por defecto en Aprende/MiniWeb/UI/plataforma adyacente;
- V9 prevalece dentro de su frontera específica;
- resolver archivos compartidos semánticamente;
- V8 permanece ruta operativa hasta corte explícito.

### Migraciones
Antes de F00:
1. comprobar qué 0030+ se aplicó realmente en cada entorno;
2. si V9 0030–0035 no fueron aplicadas en ningún entorno compartido:
   - **recomendación:** renumerarlas después del último ordinal vigente de main;
3. si alguna fue aplicada:
   - no renumerar silenciosamente;
   - diseñar reconciliación forward-compatible.

### Fallback
Si la historia de migraciones no puede demostrarse:
- no integrar schema V9;
- conservar V8;
- aislar trabajo documental/código no D1 hasta resolverlo.

## 11. Decisión humana registrada — 2026-11-01

El responsable del proyecto aprobó expresamente las recomendaciones A–H, incluidos fallbacks y condiciones:

- A = APPROVED
- B = APPROVED_WITH_FALLBACK
- C = APPROVED_WITH_FALLBACK
- D = APPROVED
- E = APPROVED_WITH_FALLBACK
- F = APPROVED
- G = APPROVED
- H = APPROVED_WITH_FALLBACK

La misma autorización levantó PLAN_ONLY **solo para W1/F00**. W2+ continúa bloqueado hasta nueva autorización.

W1/F00 quedó ejecutado en el merge commit `5a798b5ab36858d12b95752130cc67bf15492f32`.

## 12. Paquete aprobado

La recomendación consolidada es:

- **A = APPROVED**
- **B = APPROVED_WITH_FALLBACK**
- **C = APPROVED_WITH_FALLBACK**
- **D = APPROVED**
- **E = APPROVED_WITH_FALLBACK**
- **F = APPROVED**
- **G = APPROVED**
- **H = APPROVED_WITH_FALLBACK**

Esto **no levanta PLAN_ONLY automáticamente**.

## 13. Estado actual de condiciones técnicas

Los gates que esta hoja exigía antes de W2+ fueron resueltos parcialmente durante W2–W5 y ya no deben presentarse como bloqueos humanos abiertos:

- binding `scoring_version → calibration`: resuelto en F04 con registry explícito;
- correlation contract: resuelto en F04 con fail-closed;
- 24+5 state machine: resuelto en F03;
- restore/versioning del core: resuelto en F03/F04;
- plan focal de pruebas: aplicado en W1–W5.

Condiciones vigentes antes de continuar runtime:
1. **W1R Git revalidation**: la rama volvió a divergir de `main`; revalidar/sincronizar antes de nuevos cambios runtime;
2. F07-L1 local-only debe incluir la ruta de inicio que hoy crea identidad/run D1;
3. F07-L2 debe aplicar TTL máximo de 7 días a la sesión recibida;
4. F07-L3 necesita ADR criptográfico de attestation;
5. F05/F06 deben definir el contrato definitivo de resultado/informe antes de F07-L4/L5/L6.

Estas son condiciones técnicas de ejecución y **no reabren A–H**.

## 14. Estado de autorización actual

- W1–W5: ejecución histórica registrada con evidencia por SHA/run.
- W1R y todo runtime posterior: `PLAN_ONLY`.
- Ninguna autorización previa se encadena automáticamente a un lote nuevo.
- El siguiente runtime elegible, después de W1R, es F07-L1 bajo scope explícito.

## 15. Registro histórico de la frase de aprobación

Si el responsable desea aceptar exactamente este paquete, la instrucción inequívoca sería:

> Apruebo las recomendaciones A–H de la hoja ejecutiva, incluyendo sus fallbacks y condiciones. PLAN_ONLY sigue vigente hasta que se proponga y apruebe el alcance de implementación.

La frase se conserva como registro histórico del mecanismo de autorización; la aprobación A–H ya fue registrada en la sección 11.

## Changelog

- **0.3.0 / 2026-11-03:** hoja declarada fuente canónica de estado A–H; condiciones históricas W2+ reconciliadas con W1–W5; añadido W1R y secuencia técnica vigente sin reabrir decisiones.
- **0.2.0 / 2026-11-01:** aprobación humana A–H registrada; W1/F00 autorizado y ejecutado; W2+ permanece PLAN_ONLY.
- **0.1.0 / 2026-11-01:** consolidación ejecutiva A–H con disposición recomendada, fallbacks y condiciones P0.
