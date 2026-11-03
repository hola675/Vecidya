# Diagnostic V9 — CLASS-05: registro de aprobación humana y handoff de ejecución

**Versión:** 0.1.0  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · CLASS-05 ABIERTA / NO AUTORIZADA PARA EJECUCIÓN  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Contrato

Fuente: `DIAGNOSTIC-V9-TAX-CLASS-COMPATIBILITY.md`.

CLASS-05 exige:

1. aprobación humana explícita;
2. implementación aislada;
3. pruebas focales solo cuando estén autorizadas.

El plan maestro §8 prevalece: no modificar runtime, tests, SQL, CI, rutas, migraciones ni realizar merge/deploy mientras `PLAN_ONLY` siga vigente.

## 2. Qué ya está aprobado y NO debe reabrirse

El plan maestro contiene decisiones de producto D-V9 ya aprobadas. Entre las relevantes para este handoff:

- alcance DIGITAL;
- cobertura completa desde V9;
- modelo híbrido de resultados con números solo cuando exista evidencia/calibración suficiente;
- entrevista adaptativa con objetivo 24 y extensión controlada;
- resumen anónimo + informe detallado con cuenta;
- priorización explicable multicriterio;
- Aprende contextual/opcional;
- servicios Vecidya opcionales/contextuales y separados;
- objetivos opcionales/confirmados;
- transparencia de evidencia e incertidumbre.

Estas aprobaciones son de **diseño de producto** y no equivalen a autorización de código ni a aprobación de calibración/editorial concreta.

## 3. Decisiones abiertas A–H

Fuente: `DIAGNOSTIC-V9-PLAN-CLOSURE-REGISTER.md` v0.2.0.

### DEC-A — Taxonomía final
**Pendiente real:** aprobar ocho dimensiones, etiquetas públicas y criterios de aplicabilidad tras matriz 8×10.

**Evidencia disponible:**
- CLASS-02 trazó fuentes y consumidores;
- CLASS-04 definió C01–C10 y estados unknown/N-A.

**No aprobar automáticamente:** nombres públicos, universalidad de dimensiones o excepciones.

### DEC-B — Calibración / score / confianza
**Pendiente real:** umbrales, pesos, suficiencia y condiciones de score global.

**Evidencia disponible:**
- scorer y coverage actuales documentados;
- reglas de direct/supporting/neutralidad trazadas;
- real estate y hybrid muestran por qué la semántica debe preceder a la calibración.

**No aprobar automáticamente:** score global actual ni umbrales heredados como contrato V9.

### DEC-C — Banco editorial 90
**Pendiente real:** KEEP/REWRITE/REMOVE/ADD/DEFER por pregunta/opción con aprobador humano.

**Evidencia disponible:**
- 77 base + 5 complementarias + 8 probes = 90 IDs;
- CLASS-03 demuestra que un ADD pending no debe sustituir evidencia migrada;
- real estate sigue bloqueado como sustitución.

**No aprobar automáticamente:** activar banco 82/90 o marcar pending como migrated.

### DEC-D — Correlación/procedencia/replay
**Pendiente real:** contrato final de identidad de observaciones correlacionadas, consentimiento y versionado de evidencia.

**Evidencia disponible:**
- ledger, eventId, seq, replay y versionado trazados en CLASS-02;
- riesgo de doble conteo entre preguntas distintas sigue siendo material.

**No aprobar automáticamente:** independencia solo porque cambie `questionId`.

### DEC-E — Informe identificado / retención / acceso
**Pendiente real:** contrato detallado de informe autenticado, retención y seguimiento.

**Evidencia disponible:**
- ownership, claim y organización trazados;
- resultado persistido y replay reproducible documentados;
- retención final/política de producto no certificada.

### DEC-F — Priorización / presupuesto / fallbacks
**Pendiente real:** algoritmo y desempates finales respetando 24+5 y políticas aprobadas.

**Evidencia disponible:**
- planner actual, presupuestos y fallbacks D/F/A documentados;
- CLASS-04 exige resultado pertinente por C01–C10.

**No aprobar automáticamente:** que el algoritmo actual sea el definitivo solo porque existan tests históricos.

### DEC-G — Aprende / servicios / GHL
**Pendiente real:** contratos técnicos y aceptación.

**Invariante:** diagnóstico debe funcionar sin Aprende/GHL; GHL nunca es requisito de scoring, identidad o resultado.

### DEC-H — Main → V9 / corte / rollback
**Pendiente real:** reconciliación Git, sustitución V8, certificación, staging y rollback.

**Invariante:** V8 permanece operativo hasta corte autorizado; no borrar legacy antes de F08/F09 certificados.

## 4. Bloqueos heredados de CLASS-02

Antes de autorizar F07/F08 deben resolverse o aceptarse explícitamente:

- ejecución focal de ownership/claims;
- gaps AUTH-03/08/10/11/13 y mismatch en finalización;
- verificación de migraciones `0030..0035` en entorno autorizado;
- política de claim con V9 público deshabilitado.

## 5. Bloqueos heredados de CLASS-03

Antes de autorizar F02/F03:

- tests focales dental/food/agency;
- decisión real estate:
  - mantener fallback genérico, o
  - aprobar dimensión, evidence V3, `referral_only`, deduplicación y replay;
- no activar candidata real estate por analogía.

## 6. Bloqueos heredados de CLASS-04

Antes de certificación transversal:

- C01/C04/C06 acceptance end-to-end de resultado;
- C09 replay/finalization del híbrido;
- test explícito de sector unknown + replay;
- decidir si `businessModel hybrid` es no alcanzable en banco certificado o requiere producer futuro;
- política de restore/versionado entre bancos;
- PASS focal asociado al SHA final.

## 7. Secuencia de autorización recomendada

La aprobación humana debe ser granular, no un “sí” global.

### Gate H1 — aprobar especificación
Autorizar únicamente decisiones A–H o diferirlas con fallback explícito.

### Gate H2 — autorizar implementación aislada
Solo después de H1:
- tareas pequeñas F00–F08;
- rutas/archivos delimitados;
- un objetivo observable por commit;
- sin corte V8.

### Gate H3 — autorizar pruebas focales
Para cada cambio:
- lista exacta de archivos de test;
- comando focal;
- SHA;
- criterio PASS/FAIL;
- no suite general salvo gate integrado.

### Gate H4 — autorizar integración/corte
Solo tras F08 certificado:
- reconciliación main;
- staging;
- migraciones verificadas;
- E2E;
- rollback;
- aprobación expresa.

### Gate H5 — producción
Solo F10, con autorización separada de merge/deploy.

## 8. Stop conditions

Detener implementación futura si:

- aparece una decisión A–H no aprobada necesaria para continuar;
- un cambio exige modificar V8/Aprende/GHL fuera de contrato;
- una pregunta pending tendría que puntuar;
- una migración desplegada no coincide con la esperada;
- tests focales fallan;
- HEAD cambia y deja obsoleta la evidencia;
- replay del SHA probado no reproduce el resultado;
- se requiere ampliar presupuesto o score sin calibración aprobada.

## 9. Estado READY_FOR_AGENT

Según el backlog F00–F10, READY_FOR_AGENT requiere:

1. DEC-A–H aprobadas o diferidas con fallback seguro;
2. tareas atómicas con prerequisitos, prueba, evidencia y rollback;
3. decisión explícita del responsable de iniciar código;
4. levantamiento explícito de PLAN_ONLY para el alcance autorizado.

**Estado actual: NO READY FOR EXECUTION.**

La documentación puede estar lista para revisión humana, pero CLASS-02/03/04 continúan no certificadas y A–H no están cerradas.

## 10. Próximo paso documental permitido

Sin cambiar runtime, el siguiente trabajo permitido es construir una **tabla de aprobación A–H** con:

`Decisión | propuesta concreta | alternativas | evidencia | riesgo | fallback seguro | impacto F00–F10 | aprobador | estado`.

Esa tabla será el punto de control humano antes de cualquier código.

## Changelog

- **0.1.0 / 2026-10-31:** registro inicial CLASS-05; decisiones A–H, bloqueos heredados, gates H1–H5, stop conditions y criterio READY_FOR_AGENT.
