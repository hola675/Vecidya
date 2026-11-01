# Diagnostic V9 — Hoja ejecutiva de decisión humana A–H

**Versión:** 0.1.0  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · RECOMENDACIÓN DEL AGENTE · REQUIERE APROBACIÓN HUMANA EXPLÍCITA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Propósito

Reducir DEC-A…H a una sola hoja de aprobación sin perder sus condiciones técnicas.

Esta hoja **no aprueba nada por sí sola**. Define la recomendación consolidada del agente a partir de los paquetes documentales y de la lectura estática del código.

Estados posibles tras revisión humana:
- `APPROVED`
- `APPROVED_WITH_FALLBACK`
- `DEFERRED`
- `REJECTED`

## 2. Resumen recomendado

| DEC | Recomendación humana sugerida | Condición principal |
|---|---|---|
| A | APPROVED | conservar 8 dimensiones técnicas + fronteras U/O/S |
| B | APPROVED_WITH_FALLBACK | aprobar modelo base, diferir bandas públicas y corregir binding v2/v4 antes de implementación |
| C | APPROVED_WITH_FALLBACK | 77 baseline; 82/90 permanecen experimentales/pending |
| D | APPROVED | adoptar correlación Opción B: constructKey global + overlapGroup estricto |
| E | APPROVED_WITH_FALLBACK | local-only anónimo + persistencia al completar/reclamar; D1 analytics-only |
| F | APPROVED | 24+5 consentido + multicriterio sin pesos inventados |
| G | APPROVED | Diagnóstico→acción→Aprende→servicios→GHL opcional |
| H | APPROVED_WITH_FALLBACK | main→V9; resolver migraciones antes de F00; V8 permanece activo |

## 3. DEC-A — taxonomía

### Recomendación
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

### Arquitectura recomendada
Para el anónimo:
- **persistencia local durante entrevista**;
- servidor valida/procesa cuando corresponda sin mantener un ledger individual de recuperación;
- al completar, enviar transcript/estado estructurado para replay server-side;
- devolver resumen anónimo;
- persistir informe/historial solo bajo política aprobada al reclamar/autenticar.

Esto corresponde a la dirección de **Opción C**, preservando validación server-side y evitando usar D1 como backup de borrador.

### Interpretación D1 recomendada
**E-Q1 = Q1-A**:
“D1 exclusivamente analítica anónima agregada” se interpreta literalmente para la arquitectura objetivo aprobada.

Por tanto:
- resultados identificados/historial futuro deben tener un store separado aprobado;
- no reutilizar D1 individual por conveniencia;
- el schema `diagnostic_v9_*` actual se considera prototipo, no destino final.

### Condiciones
- el claim no recalcula;
- ownership personal ≠ organización;
- organización requiere autorización/membership;
- no reutilizar TTL de 7 días para resultados;
- definir store/retención/borrado antes de F07/F08.

### Fallback
Resumen anónimo sin historial identificado hasta cerrar persistencia final.

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

## 11. Paquete recomendado de aprobación

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

## 12. Condiciones obligatorias antes de código

Incluso si el responsable aprueba el paquete completo, deben permanecer como gates previos:

1. binding `scoring_version → calibration`;
2. correlation contract;
3. arquitectura anónima local-only / resultado identificado;
4. 24+5 state machine;
5. historia real de migraciones;
6. restore/versioning;
7. plan focal de pruebas.

## 13. Qué autorizar después, no ahora

Tras aprobación humana del paquete:
- actualizar matriz A–H con estados reales;
- convertir bloqueos en tareas F00–F10;
- proponer un **scope de implementación por fases**;
- pedir/registrar levantamiento explícito y parcial de PLAN_ONLY;
- empezar por gates estructurales, no por UI ni deploy.

## 14. Frase de aprobación inequívoca

Si el responsable desea aceptar exactamente este paquete, la instrucción inequívoca sería:

> Apruebo las recomendaciones A–H de la hoja ejecutiva, incluyendo sus fallbacks y condiciones. PLAN_ONLY sigue vigente hasta que se proponga y apruebe el alcance de implementación.

Esta frase es solo una plantilla; este documento no presume dicha aprobación.

## Changelog

- **0.1.0 / 2026-11-01:** consolidación ejecutiva A–H con disposición recomendada, fallbacks y condiciones P0.
