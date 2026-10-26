# QA-03B — Fase 5: piloto de evidencia realmente específica por nicho

**Estado:** experimento aislado; no está conectado al banco público, sesiones V8 ni Worker.  
**Certificación observada:** [GitHub Actions run `40254444782`](https://github.com/hola675/Vecidya/actions/runs/40254444782), commit `5157a27e03aff6a967c8b7f0d5c1340ce94669c3`: suite **1.760/1.760**, 0 fallos; typecheck, build y regresión Diagnóstico/Aprende PASS.  
**Banco público:** 45 preguntas.  
**Banco candidato tras esta fase:** **76 preguntas** = 74 de la fase anterior + 2 especializadas retenidas.

## 1. Criterio

Una especialidad no merece una pregunta solo por describir mejor al negocio. Debe cumplir simultáneamente:

1. El nicho cambia el proceso que se quiere observar.
2. La pregunta no puede sustituirse por una pregunta genérica ya existente sin perder significado.
3. La respuesta produce evidencia explícita y neutraliza `unknown/not_applicable`.
4. El selector de nicho solo gana prioridad cuando realmente desbloquea esa evidencia.
5. La comparación frente al banco sin el piloto demuestra una ganancia diagnóstica; aumentar preguntas sin ganar evidencia es motivo de rechazo.

## 2. Cuatro experimentos

| Experimento | Dimensión propuesta | Resultado A/B | Decisión |
|---|---|---|---|
| Startup de software — observar si la persona alcanza la acción principal de uso | `measurement_optimization` | El selector de nicho añadía 1 pregunta, la pregunta específica no llegaba a seleccionarse y no aparecía evidencia nueva | **RECHAZADO del banco** |
| Mercado de dos lados — distinguir si una operación falla por un lado, el otro o el emparejamiento | `measurement_optimization` | No apareció evidencia específica; el selector ocupó presupuesto y desplazó `q2_reputation_flow` en el escenario probado | **RECHAZADO del banco** |
| Preparación de impuestos — contacto anticipado antes de la siguiente temporada/vencimiento | `relationship_recurrence` | 21 → 23 preguntas; 9 → 10 evidencias; `relationship_recurrence` deja de estar sin score | **RETENIDO candidato** |
| Agencia de seguros — identificar y contactar renovaciones antes del vencimiento | `relationship_recurrence` | 23 → 24 preguntas; `q2_followup_status_visibility` se sustituye por la pregunta de renovación; `q2_reputation_flow` se conserva; `relationship_recurrence` deja de estar abierta | **RETENIDO candidato; alcanza 24** |

Las dos definiciones rechazadas se conservan en `QA03B_SPECIALTY_EVIDENCE_EXPERIMENTS_V1` para trazabilidad, pero sus IDs están en `QA03B_REJECTED_SPECIALTY_EVIDENCE_IDS_V1` y **no forman parte de `QA03B_SPECIALTY_CANDIDATE_BANK_V1`**.

## 3. Evidencia retenida

### Preparación de impuestos

Pregunta candidata:

> Antes de la próxima temporada o vencimiento fiscal, ¿tienes una forma de volver a contactar a clientes anteriores con tiempo?

La ayuda obliga a distinguir un proceso previsto de esperar a que el cliente vuelva. Permite `not_applicable` y `unknown`. Solo aplica a negocio activo con historial y nicho declarado `tax_preparation`.

Mapeo R3 directo:
- proceso sistemático → `established`
- parcial/inconsistente → `partial`
- reactivo → `weak`
- no aplica → `not_applicable`
- no sabe → `uncertainty`

No mide si el negocio «es bueno» ni si usa un CRM; observa continuidad real del ciclo.

### Seguros

Pregunta candidata:

> Antes de que una póliza venza o deba revisarse, ¿puedes identificar a quién contactar y hacerlo a tiempo?

Solo aplica a `insurance_agency`, activo y con historial. También permite `not_applicable` y `unknown`.

El resultado probado es útil, pero llega al hard cap de 24 en el perfil sintético. Por eso **no debe promocionarse a producción sin resolver el trade-off con otras preguntas**, especialmente reputación y seguimiento general.

## 4. Aislamiento del planificador

La fase detectó y corrigió una regresión antes de cerrar:

- La capacidad de reconocer que un selector de nicho puede desbloquear evidencia en una dimensión `insufficient_context` se había aplicado inicialmente también a `baseline`.
- Eso modificó rutas certificadas anteriores.
- La lógica quedó restringida a `policy === "utility_first"`.
- El planificador público/base vuelve a conservar sus expectativas anteriores y la matriz completa pasa.

Esto es una condición contractual: **ninguna mejora experimental puede cambiar el comportamiento baseline por accidente**.

## 5. Coste real observado

### Impuestos
- Sin piloto: 21 preguntas, 9 evidencias, 6 dimensiones aplicables sin score.
- Con piloto: 23 preguntas, 10 evidencias, 5 dimensiones aplicables sin score.
- Ganancia: una dimensión deja de estar abierta.
- Coste: selector de nicho + pregunta especializada.

### Seguros
- Sin piloto: 23 preguntas, 12 registros de evidencia, 6 dimensiones aplicables sin score.
- Con piloto: 24 preguntas, 12 registros de evidencia, 5 dimensiones aplicables sin score.
- Ganancia: `relationship_recurrence` deja de estar abierta; la observación genérica de seguimiento pasa de `uncertainty` a evidencia específica de renovación en estado `partial`.
- Sustitución verificada: se añade el selector de nicho y la pregunta de renovación; sale `q2_followup_status_visibility` y se conserva `q2_reputation_flow`. El conteo total de evidencias permanece igual porque una fuente R3 sustituye a otra, pero mejora la especificidad del dato y se cierra una dimensión.
- El recorrido termina con motivo `no_useful_questions` y llega a 24 preguntas; esto no equivale a diagnóstico completo: quedan cinco dimensiones aplicables sin score y dos con contexto insuficiente.

Los conteos proceden de perfiles sintéticos con respuestas explícitas; **no son métricas de usuarios reales**.

## 6. Próxima decisión

La siguiente fase no debe crear más preguntas al azar. Debe:

1. Buscar en qué nichos existe un proceso verdaderamente distinto y una dimensión hoy abierta.
2. Para cada candidato, medir primero la ruta genérica y diseñar la pregunta solo si existe un hueco.
3. Intentar que la evidencia especializada **sustituya** una observación genérica de menor utilidad antes de usar slots adicionales.
4. Seguros ya no desplaza reputación: la pregunta especializada sustituye el seguimiento genérico. Mantener pendiente la optimización del presupuesto de 24 preguntas y comprobar si puede reducirse el coste del selector sin mezclar dos preguntas en una.
5. Mantener software y marketplace fuera hasta rediseñar una observación que sí pueda ser seleccionada y demostrar beneficio.
6. Mantener el corte V9 bloqueado hasta E2E/Worker, compatibilidad de sesiones y pruebas con usuarios.

## 7. Estado de aceptación

**Aceptado como experimento candidato:** impuestos.  
**Aceptado con límite explícito:** seguros (24 preguntas, cinco dimensiones aplicables sin score y dos con contexto insuficiente).  
**Rechazados del banco candidato:** software y marketplace.  
**Producción:** sin cambios.


## 8. Comparación independiente del planificador: 12 recorridos

La certificación del planificador `baseline` frente a `utility_first` es un experimento distinto del A/B que decidió qué preguntas especializadas conservar. Sobre los mismos doce perfiles sintéticos:

| Perfil | Baseline | Utility-first | Diferencia |
|---|---:|---:|---:|
| Proyecto de software en preparación | 14 | 13 | -1 |
| Dentista en pausa | 11 | 10 | -1 |
| Clínica dental activa | 23 | 23 | 0 |
| Restaurante con reservas | 23 | 22 | -1 |
| Comercio híbrido | 24 | 24 | 0 |
| Agencia de marketing B2B | 21 | 21 | 0 |
| Creador de audiencia | 19 | 18 | -1 |
| Organización con donaciones | 22 | 21 | -1 |
| SaaS activo | 21 | 21 | 0 |
| Marketplace activo | 24 | 24 | 0 |
| Preparación de impuestos | 23 | 23 | 0 |
| Agencia de seguros | 24 | 24 | 0 |
| **Total** | **249** | **244** | **-5** |

Cinco recorridos se acortan, siete mantienen la duración y ninguno se alarga. Los doce mantienen iguales sus cantidades de evidencia directa/score y sus dimensiones sin resolver o con contexto insuficiente. Por tanto, el planificador `utility_first` ahorra cinco preguntas en esta matriz, pero **no demuestra por sí solo una mejora de suficiencia diagnóstica**. Los cambios de motivo terminal no deben interpretarse como una mejora de score.

La comparación es sintética y determinista; no representa tiempos ni resultados de clientes reales. El resultado no cambia la decisión de mantener el planificador aislado del flujo público.
