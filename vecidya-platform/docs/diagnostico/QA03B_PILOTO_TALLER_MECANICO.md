# QA-03B — Fase 6: piloto de presupuestos pendientes en talleres mecánicos

**Estado:** candidato en evaluación A/B; no activar ni fusionar hasta certificar.  
**Alcance:** banco candidato de QA-03B únicamente. No modifica las 45 preguntas públicas, sesiones V8, el Worker ni el motor de producción.

## Hueco observado

La pregunta genérica `q2_service_quote_followup` pertenece al arquetipo `local_service` y depende de que `q2_service_quote_practice` indique que se emiten cotizaciones. Un taller mecánico con local físico se clasifica como `local`, no `local_service`; por tanto, el flujo actual no le ofrece esa observación de seguimiento de presupuestos.

No se debe ampliar esa regla genérica a todos los negocios locales ni inferir que un taller siempre deja presupuestos pendientes. El piloto pregunta por ese proceso solo cuando el perfil declara el nicho `auto_repair`, tiene operación e historial reales y declara fricción de seguimiento o conversión.

## Pregunta candidata

**Enunciado:** ¿Cuando un cliente recibe un presupuesto de reparación y no lo aprueba enseguida, qué suele ocurrir después?

**Ayuda:** Piensa en presupuestos reales que quedaron pendientes; no cuentes reparaciones autorizadas en el momento.

Opciones y mapeo R3:
- `systematic` — el presupuesto queda registrado y tiene un siguiente paso definido → `established`.
- `partial` — se hace seguimiento en algunos casos, sin constancia → `partial`.
- `reactive` — se espera a que el cliente vuelva a contactar → `weak`.
- `not_applicable` — no suelen quedar presupuestos pendientes → `not_applicable`.
- `unknown` — falta información suficiente → `uncertainty`.

La dimensión es `relationship_recurrence`, evidencia directa. La pregunta no mide calidad mecánica, satisfacción ni tasa de ventas; observa si se retoma una decisión comercial pendiente.

## Regla experimental de sustitución

Solo bajo `utility_first`, cuando el nicho explícito es `auto_repair` y la pregunta especializada puede aportar evidencia directa sobre una dimensión abierta, se sustituye `q2_followup_status_visibility` por el seguimiento específico de presupuestos. Si la respuesta especializada es `unknown` o `not_applicable`, la pregunta genérica vuelve a estar disponible. La ruta `baseline` no debe cambiar.

## Puertas de aceptación

El piloto solo se retiene si la ejecución real demuestra:

1. La pregunta aparece para un taller mecánico activo con clientes y fricción `follow_up`/`conversion`.
2. No aparece para talleres en preparación, nichos automotrices distintos o perfiles cuya fricción sea solo operativa.
3. El selector `q2_niche_automotive` se prioriza únicamente porque desbloquea esta evidencia.
4. La pregunta especializada reemplaza el seguimiento genérico, conserva la observación de reputación cuando cabe en el presupuesto y no supera 24 preguntas.
5. El A/B frente al banco base de 74 definiciones muestra una mejora de evidencia o una dimensión menos abierta sin aumentar incertidumbre ni perder evidencia directa ajena al proceso sustituido.
6. Typecheck, build, regresiones y suite unitaria pasan.

## Estado de certificación

**Pendiente de CI y de los resultados A/B.** La rama candidata espera comprobar 33 perfiles, 13 recorridos A/B y un banco candidato de 77 definiciones (74 base + 3 preguntas especializadas retenidas provisionalmente). Si no se observa una mejora diagnóstica verificable, el experimento se marcará como rechazado y se excluirá del banco candidato.

La aceptación de este piloto no autoriza un cutover. E2E/Worker, compatibilidad V8/V9, privacidad y pruebas de lectura con usuarios siguen siendo puertas separadas.
