# Diagnostic V9 — DEC-A: paquete de decisión de taxonomía y aplicabilidad 8×10

**Versión:** 0.1.0  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · RATIFICADO VÍA HOJA A–H · IMPLEMENTACIÓN NO AUTORIZADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## Nota de autoridad documental

El estado de decisión de este paquete es histórico y queda **supersedido para status** por `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md`. Las propuestas, riesgos y criterios técnicos de este archivo siguen siendo referencia; cualquier frase interna “NO APROBADO”, “READY_FOR_HUMAN_REVIEW” u “OPEN” describe el momento de redacción original y **no reabre** la decisión humana ya registrada. PLAN_ONLY sigue vigente para runtime.

## 1. Objetivo

Cerrar documentalmente DEC-A sin convertir el comportamiento actual en taxonomía aprobada.

DEC-A debe decidir:
1. si se conservan las ocho dimensiones técnicas;
2. sus nombres públicos;
3. qué mide y qué NO mide cada dimensión;
4. su familia de aplicabilidad;
5. los solapamientos que requieren deduplicación;
6. el comportamiento esperado en C01–C10.

No se modifica código, calibración ni banco.

## 2. Evidencia fuente

- `DIAGNOSTIC-V9-TAXONOMY-8X10-REVIEW.md` — blob `7577dae329ebbe4209c40651206680bd46de14f3`.
- `DIAGNOSTIC-V9-EVALUATION-MODEL-V1.md` — blob `b489cc938baf667a612424284f94d9cea213cad7`.
- `qbv2-dimensions.ts` — blob `c06daffb99bda6b3cd6680236b120ae89e013aa2`.
- `qbv2-coverage.ts` — blob `16cae5010bf2584fe89e906d85733f9a56b5c8e2`.
- `qbv2-applicability.ts` — blob `ba174bf5ca455323fb98948d33f1c399001fa48c`.
- `qa03b/v9-candidate-scoring.ts` — blob `339c68a445861a3fea24ccb4b18a96adfc9e59a7`.
- `qbv2-applicability.test.ts` — blob `866c2d87fdbb4f6ab10d8edbb26f3a700734bc0f`.
- `qa03b/specialty-branches-wave1.ts` — blob `12e14f8dc7bd4450ebbcf2b0fb9d02dac033096e`.

## 3. Propuesta DEC-A — conservar ocho IDs técnicos

**Propuesta:** RETAIN los ocho IDs técnicos actuales. No fusionar dimensiones en esta decisión.

Motivo: el código, evidence mappings, scorer, narrativa, observabilidad y replay ya usan estos IDs como contratos internos. Los solapamientos localizados pueden resolverse mediante definiciones y correlación sin asumir que una fusión sea necesaria.

Esto NO aprueba pesos, labels históricos ni score global.

## 4. Propuesta de nombres públicos y fronteras

| ID técnico | Nombre público propuesto | Qué mide | Exclusión obligatoria |
|---|---|---|---|
| `clarity_positioning` | **Claridad de la oferta** | Si una persona comprende a quién se ayuda, qué recibe y qué significa la propuesta | No medir ventas, visibilidad ni facilidad de ejecutar una acción |
| `digital_foundation` | **Base digital** | Si los canales digitales que sí se usan son accesibles, coherentes y mantenibles | No exigir web propia, redes o un número mínimo de canales |
| `discovery` | **Descubrimiento** | Si existe una vía pertinente y comprobable para que nuevas personas encuentren la actividad | No exigir publicidad, tráfico, crecimiento ni atribución avanzada |
| `trust_reputation` | **Confianza** | Si existen señales apropiadas y verificables para reducir incertidumbre antes de avanzar | No exigir reseñas públicas, licencias inferidas ni exposición de datos privados |
| `conversion_access` | **Acceso y siguiente paso** | Si una persona puede entender y ejecutar el primer paso pertinente: contactar, reservar, solicitar, comprar, participar | No equiparar conversión con venta/pago ni medir claridad general de la oferta |
| `relationship_recurrence` | **Seguimiento y continuidad** | Si una interacción que necesita continuidad puede retomarse de forma fiable y consentida | No exigir recurrencia, CRM, automatización ni contacto sin permiso |
| `measurement_optimization` | **Medición y aprendizaje** | Si existe una forma proporcional de observar resultados, comparar y aprender | No exigir analítica avanzada, CRM, porcentajes o actividad inexistente |
| `digital_readiness` | **Capacidad de ejecución digital** | Si las tareas/procesos digitales necesarios pueden ejecutarse y sostenerse | No usar salud general del negocio, procesos manuales o posesión de software como evidencia digital |

### Cambio respecto a labels históricos
Los labels ingleses actuales permanecen como contratos técnicos hasta implementación autorizada. Los nombres anteriores `Presence`, `Conversion`, etc. no se declaran automáticamente lenguaje público final.

## 5. Familias de aplicabilidad observadas en R4-A

El scorer V9 actual usa `evaluateDimensionApplicabilityV3`.

### Familia U — universal
- `clarity_positioning`
- `digital_readiness`

El código las marca `applicable` incluso sin contexto estructural.

**Propuesta:** conservar esta familia, con una condición de producto: “universal” significa que la dimensión puede ser considerada, NO que deba producir score. Sin evidencia directa válida, el resultado puede permanecer null/uncertain.

### Familia O — operación actual
- `digital_foundation`
- `trust_reputation`
- `measurement_optimization`

R4-A:
- operación activa → applicable;
- prelaunch/idea → not_applicable;
- contexto no resuelto/pausa → insufficient_context;
- evidencia V3 válida puede corroborar aplicabilidad.

**Propuesta:** RETAIN como política base. En prelaunch pueden existir recomendaciones `prepare`, pero no debe inventarse un score de capacidad operativa actual.

### Familia S — estructura del recorrido
- `discovery`
- `conversion_access`
- `relationship_recurrence`

R4-A decide mediante archetype, businessModel, buyer y componentes.

**Propuesta:** RETAIN como condicionales estructurales, no universales.

## 6. Reglas de separación entre dimensiones

### OVL-01 — clarity vs conversion
**Regla propuesta:**
- “¿se entiende qué ofreces / para quién / qué obtiene?” → clarity.
- “¿se entiende y puede ejecutarse el primer paso?” → conversion.

Una pregunta sobre “siguiente paso” puede ser ambigua. `q2_professional_intake_flow` permanece en clarity por contrato vigente; la candidata real-estate sigue bloqueada hasta decisión de paridad.

### OVL-02 — foundation vs discovery
- foundation = calidad/coherencia de los activos/canales usados;
- discovery = cómo una persona nueva llega a encontrarlos.

El mismo canal puede aparecer en ambas, pero el **hecho observado** debe ser diferente.

### OVL-03 — relationship vs readiness
- relationship = continuidad de una interacción externa;
- readiness = capacidad interna de ejecutar tareas digitales.

Un proceso manual no debe mejorar readiness solo porque esté organizado.

### OVL-04 — discovery vs measurement
- discovery = existe/funciona una vía de descubrimiento;
- measurement = se puede observar/comparar el resultado.

Conocer “de dónde llegan” puede apoyar measurement, pero no debe convertirse automáticamente en dos evidencias directas independientes.

## 7. Matriz 8×10 propuesta para revisión

Leyenda:
- **A** = aplicable bajo el baseline del escenario.
- **C** = condicional a estructura/evidencia adicional.
- **N** = no aplicable al estado actual.
- **I** = contexto insuficiente por defecto.
- **U** = universal según R4-A.

Baselines usados:
- C01 local activo con clientes.
- C02 preparación sin clientes.
- C03 pausa con historial.
- C04 profesional independiente activo.
- C05 organización activa sin venta directa.
- C06 servicio activo por citas.
- C07 ecommerce activo.
- C08 gastronomía activa.
- C09 híbrido activo retail+online.
- C10 sector/nicho unknown o cambiado, sin asumir modalidad adicional.

| Dimensión | C01 | C02 | C03 | C04 | C05 | C06 | C07 | C08 | C09 | C10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| clarity_positioning | U | U | U | U | U | U | U | U | U | U |
| digital_foundation | A | N | I | A | A | A | A | A | A | C |
| discovery | A | C | C | A | A | A | A | A | A | C |
| trust_reputation | A | N | I | A | A | A | A | A | A | C |
| conversion_access | A | C | C | A | C | A | A | A | A | C |
| relationship_recurrence | C | N | C | A | C | A | C | C | A | C |
| measurement_optimization | A | N | I | A | A | A | A | A | A | C |
| digital_readiness | U | U | U | U | U | U | U | U | U | U |

Esta tabla es una **propuesta de producto basada en la política actual**, no una certificación del runtime.

## 8. Tensiones que requieren aprobación humana

### A-01 — Pausa
En R4-A, foundation/trust/measurement quedan `insufficient_context` en pausa, pero discovery/conversion/relationship pueden volverse applicable si archetype/model/buyer siguen resueltos.

**Propuesta:** mantener `C` en C03 y exigir evidencia actual para score. No interpretar estructura histórica como capacidad vigente.

### A-02 — Digital readiness universal
El código la hace universal, mientras el probe general incluye `not_needed`.

**Propuesta:** conservar universalidad conceptual del diagnóstico DIGITAL, pero permitir N/A a nivel de observación y score null. No penalizar “no necesita esa tarea digital”.

### A-03 — Measurement en toda operación activa
R4-A la marca applicable para cualquier operación activa, incluso sin goal `measure`.

**Propuesta:** conservar. Medición se define como aprendizaje proporcional, no analítica avanzada; goal/friction no debe fabricar ni retirar aplicabilidad.

### A-04 — Prelaunch
Foundation/trust/measurement/relationship son N/A por defecto, pero clarity/readiness siguen activas y discovery/conversion pueden ser condicionales si existe una vía concreta prevista/observable.

**Propuesta:** mantener score de operación separado de recomendaciones de preparación.

### A-05 — Organización sin venta directa
No usar `no_direct_purchase` para desactivar discovery/conversion/relationship globalmente. Donación, membresía, participación o solicitud pueden ser acciones válidas.

**Propuesta:** mantener C en conversion/relationship hasta resolver modelo de apoyo/participación.

## 9. Evidence inventory y observabilidad

El banco V9 actual ya tiene fuentes directas migradas para las ocho dimensiones, incluyendo measurement mediante preguntas QA03B añadidas en `qa03b/bank.ts`.

Los ocho probes generales del banco 90 están deliberadamente `pending` y **NO** deben usarse para concluir que la taxonomía está observada o calibrada.

La decisión TAX-G1 (taxonomía) debe cerrarse antes de TAX-G4 (pesos/umbrales).

## 10. Propuesta de decisión humana DEC-A

Marcar **APPROVED** solo si se acepta explícitamente:

1. RETAIN de los ocho IDs técnicos.
2. Los ocho nombres públicos propuestos o sus reemplazos.
3. Las fronteras “qué mide / qué no mide”.
4. Familias U/O/S de aplicabilidad.
5. Reglas OVL-01..04.
6. Tratamiento A-01..A-05.
7. Matriz 8×10 como baseline para pruebas futuras.

Si cualquier punto no se aprueba, DEC-A permanece OPEN sin bloquear la documentación, pero sí bloquea calibración final y aprobación editorial completa.

## 11. Próximo gate después de DEC-A

Con DEC-A aprobado:
- DEC-C puede revisar cada pregunta/opción contra una taxonomía estable.
- DEC-D puede definir correlación por constructo.
- DEC-B puede calibrar sin redefinir qué significa cada dimensión.

Sin DEC-A aprobado:
- no fijar pesos;
- no aprobar score global;
- no promover probes pending;
- no declarar banco 90 canónico.

## Changelog

- **0.1.0 / 2026-11-01:** paquete DEC-A con nombres públicos, fronteras, familias de aplicabilidad, overlaps, matriz 8×10 y cinco tensiones para aprobación humana.
