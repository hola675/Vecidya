# QA-03B — Fase 4: comparación A/B del planificador por utilidad

**Estado:** experimento en banco candidato, sin activación pública.  
**Fuentes observadas:** GitHub Actions [run 40242484366](https://github.com/hola675/Vecidya/actions/runs/40242484366), SHA `60aef5bf57d895d294cd94f0494f16583b669bbb`: typecheck, build, regresiones focales y **1.754/1.754** pruebas unitarias correctas.  
**Ramas apiladas:** PR #114 (editorial), #115 (especialidad/lote 1), #117 (lote 2), #119 (certificación de 30 perfiles y 8 rutas), #120 (experimento de utilidad).

## Hipótesis y reglas

Comparar en la **misma entrevista sintética** `baseline` (algoritmo certificado) frente a `utility_first`, sin tocar el banco público de 45 preguntas ni la identidad de sesiones V8.

`utility_first`:
- Respeta preguntas `core`, contradicciones y desbloqueos reales.
- No clasifica un mero inventario de herramientas como evidencia de mejora digital ni motivo suficiente de entrevista.
- Solo promociona una pregunta de nicho cuando **alguna respuesta concreta desbloquea una pregunta con utilidad diagnóstica verificable**. En el catálogo actual hay ocho selectores, pero todavía no hay ramas de evidencia específica por nicho que requieran su respuesta. Por tanto, no debe obligar a responder a un nicho solo por enriquecer una ficha.
- Prefiere evidencia directa para el objetivo/problema declarado frente a contexto descriptivo no esencial.
- Mantiene `targetMax=16`, presupuesto base, topes por módulo y `hardMax=24`; no altera ni añade evidencias R3, opciones, condiciones, versiones o identidad de sesiones.

## Resultado real de ocho recorridos completos

| Perfil | Preguntas baseline → utilidad | Motivo terminal baseline → utilidad | Evidencias R3 detectadas | Observación |
|---|---:|---|---:|---|
| Proyecto de software en preparación | 14 → 13 | Sin más preguntas útiles → mismo | 3 → 3 | Se omite nicho no conectado a una rama |
| Dentista en pausa | 11 → 10 | Sin más preguntas útiles → mismo | 0 → 0 | No se inventa operación actual |
| Clínica dental en actividad | 23 → 23 | Presupuesto bloqueado → sin más preguntas útiles | 10 → 10 | Sigue habiendo seis dimensiones aplicables sin score |
| Restaurante con reservas | 23 → 22 | Presupuesto bloqueado → sin más preguntas útiles | 10 → 10 | Se omite nicho no conectado a una rama |
| Comercio híbrido | 24 → 24 | Tope absoluto → sin más preguntas útiles | 14 → 14 | **Sigue llegando a 24**; distinta clasificación terminal no implica suficiencia |
| Agencia B2B | 21 → 21 | Presupuesto bloqueado → mismo | 10 → 10 | La limitación real persiste |
| Creador de audiencia | 19 → 18 | Presupuesto bloqueado → mismo | 8 → 8 | Omite inventario de herramientas sin utilidad |
| Organización con donaciones | 22 → 21 | Presupuesto bloqueado → mismo | 10 → 10 | Omite inventario de herramientas sin utilidad |

**Agregados observados:** 157 → 152 preguntas totales entre las ocho simulaciones (**5 menos**); cinco recorridos reducen una pregunta, tres permanecen iguales, cero aumentan. **Los ocho conservan el número de evidencias R3 y de dimensiones con score desconocido/insuficiencia de contexto.** Ninguno gana evidencia sustantiva adicional con esta política.

**Importante:** omitir tres selectores de nicho que la versión baseline sí preguntaba hace que se pierda esa información descriptiva en esas entrevistas. Por eso no debe describirse el resultado como una mejora integral de personalización. Se trata de una mejora potencial de eficiencia que aún necesita ramas genuinamente diferenciadas por nicho.

## Lectura de las razones terminales

`no_useful_questions` significa **no quedan preguntas que el planificador elija como útiles**, no que todas las dimensiones estén suficientemente observadas.

- Cinco perfiles del recorrido siguen terminando con dimensiones `unresolved` e `insufficient_context`.
- Algunos cambios de `budget_blocked` a `no_useful_questions` son consecuencia de dejar de considerar útiles las preguntas descriptivas; **no se resolvió ninguna dimensión** con ese cambio.
- `hardCapReached` debe permanecer visible por separado del motivo terminal: el comercio híbrido todavía consume 24 preguntas.
- El componente público debe mantener incertidumbres reales y no convertir un motivo terminal en una puntuación positiva.

## Condiciones de promoción / fase siguiente

1. **No activar `utility_first` automáticamente.** Este PR solo prueba una hipótesis sobre 30 escenarios de contexto y 8 entrevistas completas.
2. Para aprovechar de verdad los ocho selectores de nicho, diseñar preguntas y reglas que distingan operaciones concretas (por ejemplo, una clínica con varios profesionales frente a un profesional solo, o modelos de reservas/pedidos propios de distintos tipos de hostelería); no inferir personal, licencias o infraestructura a partir del nicho.
3. Comparar una rama de especialidad frente a una genérica con la misma cuota de preguntas; exigir evidencia nueva o cambio verificable de decisión/recomendación.
4. Añadir perfiles con respuestas no neutrales y pruebas de lectura con usuarios representativos antes de interpretar resultados como calidad de diagnóstico.
5. Completar compatibilidad de sesiones, replay estricto de Worker, E2E móvil/desktop, privacidad y política de rollout antes de cualquier cutover V9.

## Puerta automática de no regresión

`qa03b-planner-utility-shadow.test.ts` protege los ocho recorridos frente a aumento de preguntas, pérdida de evidencias mapeadas y aumento de dimensiones no resueltas/insuficientes, además de probar el mecanismo de desbloqueo mediante un caso ficticio de evidencia específica para dentistas. La prueba sintética **no añade esa pregunta ficticia** al banco de 74; es un escenario unitario de la política.

**Conclusión:** el algoritmo experimental es más eficiente en estos casos, pero todavía no mejora la suficiencia del diagnóstico ni la personalización por nicho. Mantener aislado hasta introducir evidencia sectorial que justifique la clasificación adicional.
