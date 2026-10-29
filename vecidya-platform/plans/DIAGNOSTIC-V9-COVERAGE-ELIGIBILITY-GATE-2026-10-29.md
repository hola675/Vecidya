# V9: puerta de elegibilidad y cobertura

PLAN_ONLY. Version 1.0.0. Fecha: 2026-10-29.

Fuente: qa03b/bank.ts y qa03b/specialty-branches-wave1.ts, rama feat/diagnostic-v9-lex-graph-p1b.

La existencia nominal de una pregunta no certifica su seleccion ni la suficiencia de evidencia. Deben comprobarse appliesWhen, materialAppliesWhen, las sustituciones por nicho y las respuestas neutrales.

C03: las preguntas de actividad historica requieren negocio operativo e historial. La pausa no debe calificarse como fracaso digital.

C05: donaciones y membresias tienen condiciones distintas. Una organizacion sin esas modalidades no debe recibir una penalizacion por omision.

C08: foodSpecialistEligible exige presencia fiable o parcial. La pregunta generica de claridad tambien tiene una condicion material de presencia. La sustitucion no demuestra cobertura de claridad cuando no existe presencia digital.

Siguiente puerta: trazar preguntas elegibles por escenario, mapear evidencia por dimension y registrar abstenciones. No afirmar 80 de 80 celdas cubiertas sin recorridos.

Sin cambios de codigo, tests, CI, despliegue o aprobacion editorial.
