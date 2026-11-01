# Diagnostic V9 — CLASS-04: cobertura estática C01–C10, híbridos, unknown, cambio de sector y replay

**Versión:** 0.1.0  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · CLASS-04 PARCIAL / NO CERTIFICADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Contrato

Fuentes:
- `DIAGNOSTIC-V9-TAX-CLASS-COMPATIBILITY.md` (blob `b087853b384c73c04cbbdf60ca7641a38fcd8e77`): CLASS-04 = **C01–C10, híbridos, unknown, cambio de sector y replay**.
- `DIAGNOSTIC-V9-MASTER-FINALIZATION-PLAN.md` (blob `feb73c4d4a73690072a6ac959807e95d8a3e09f2`), §10.2: define la matriz mínima C01–C10.

No se ejecutan pruebas bajo PLAN_ONLY. Este documento inventaría cobertura ya escrita y gaps.

## 2. C01–C10 del plan maestro

| Caso | Contexto |
|---|---|
| C01 | Negocio local activo con clientes |
| C02 | Emprendimiento en preparación sin clientes |
| C03 | Negocio en pausa con clientes históricos |
| C04 | Profesional independiente con marca comercial |
| C05 | Organización sin venta directa |
| C06 | Servicios por citas |
| C07 | Comercio electrónico |
| C08 | Gastronomía con menú aún no publicado |
| C09 | Actividad híbrida o varios canales |
| C10 | Sector/nicho desconocido o cambiado |

## 3. Corpus authored existente

`tests/unit/diagnostic/qa03b-specialty-journeys.ts`  
Blob `0f7f801c709f15658f548734096eb482050a7715`.

Contiene 30 personas authored. Entre las relevantes:

- preparación: `idea-servicio-local`, `idea-tienda-online`, `idea-software`, `idea-organizacion`;
- pausa: `pausa-dentista`, `pausa-restaurante`;
- profesionales individuales activos: `asesoria-legal`, `impuestos`, `plomeria-domicilio`, `consultoria-b2b`;
- appointments: `clinica-dental`, `barberia`, `salon-belleza`, `impuestos`;
- nonprofit/no-direct-purchase: `organizacion-donaciones`, `organizacion-membresias`;
- ecommerce: `ecommerce-puro`;
- multi-canal: `tienda-hibrida` = `retail + online_checkout`;
- incertidumbre: `incertidumbre-inicial` usa sector `other`, buyer `unknown` y sin delivery.

`qa03b-specialty-journey-certification.test.ts` (blob `1263cfff63941756c82f4f212cdd6cb0e30a0083`) inspecciona esas personas, determinismo, límites y fail-closed de cambios de contexto, pero no debe contarse como PASS sin ejecución actual.

## 4. Mapeo preliminar C01–C10

### C01 — local activo con clientes
**Representación existente:** múltiples personas operating + history=yes: barbería, taller, clínica, restaurante, retail, etc.

La suite authored comprueba que capacidades no se infieran solo por sector/nicho y que las preguntas seleccionadas sean elegibles.

**Gap:** el requisito de resultado “evaluación digital y prioridades pertinentes” es más amplio que la existencia de un journey; falta certificación transversal del resultado/recomendaciones de C01.

### C02 — preparación sin clientes
**Representación fuerte:** cuatro personas `preparing + history=no`.

`qa03b-v9-context-semantics.test.ts` (blob `181109200434400f0882e836cdcbc745435a0927`) comprueba que preparación sin clientes no se convierta en operación activa.  
`qa03b-specialty-candidate.test.ts` (blob `b498b7ff0ca5f507dde40d5c7d71c3ad6712cb70`) comprueba que preguntas de preparación aporten claridad sin inventar ventas operativas.

**Estado:** cobertura source relevante; no certificada.

### C03 — pausa con clientes históricos
**Cobertura focal explícita:** `qa03b-v9-c03-c05-c07-c08-focal.test.ts` (blob `80e073cadfa6109b96d6e3331ad9b468e898dfd2`) prueba que pausa + history=yes no acredita operación actual.

La suite de journeys también elimina respuestas operativas al cambiar `q2_operational_status` a paused.

**Estado:** cobertura source fuerte; no certificada.

### C04 — profesional independiente
**Representación:** varias personas `entity=individual` con actividad profesional/servicios.

El resolver base tiene casos donde entidad individual y archetype professional permanecen separados de una empresa.

**Gap:** la frase del plan “con marca comercial” no aparece como condición específica en los fixtures auditados; no afirmar cobertura completa de identidad de marca solo por `entity=individual`.

### C05 — organización sin venta directa
**Cobertura explícita:** personas organization + `buyer=no_direct_purchase`; test focal C05 diferencia donations, membership_dues, grants y mixed.

Las preguntas de donación/membresía están gateadas y no se activan por ser organización sin más.

**Estado:** cobertura source fuerte; no certificada.

### C06 — servicios por citas
**Representación:** clínica dental, barbería, salón e impuestos con `appointments`.

Las suites specialty evitan inferir appointments solo por nicho dental y exigen señales/modalidad explícitas.

**Gap:** certificar resultado/recomendaciones C06 completo, no solo elegibilidad.

### C07 — ecommerce
**Representación:** `ecommerce-puro` y `idea-tienda-online`.

El test focal C07 comprueba que `no_authorized_contact` en seguimiento de carrito sea `not_applicable`, no penalización. La suite candidate exige operación ecommerce real para checkout y mantiene `unknown` como incertidumbre.

**Estado:** cobertura source relevante; no certificada.

### C08 — gastronomía con menú no publicado
**Cobertura focal explícita:** test C08 verifica:
- menu visibility solo con presencia `reliable|partial`;
- ausencia de presencia no se interpreta como claridad;
- `unknown` no se convierte en weak;
- la genérica también respeta el gate de presencia;
- nicho unknown mantiene fallback genérico cuando corresponde.

**Estado:** cobertura source fuerte; no certificada.

### C09 — híbrido / varios canales
**Fixture:** `tienda-hibrida` declara `q2_delivery=[retail,online_checkout]`.

`qa03b-context.test.ts` (blob `578bc59ca8735f0446f23c406858930049a6ea30`) comprueba exactamente ese multi-answer y espera:
- `archetype=hybrid`;
- `archetypeComponents=[ecommerce,retail]`.

`context-resolver.test.ts` (blob `5b2e4068fe127fa87f380814c724330827b667af`) contiene además casos de múltiples componentes, orden determinista y businessModel hybrid cuando existen mecanismos independientes.

**Límite importante:** los censos CLASS-02 no localizaron producers secundarios de monetización en los bancos inspeccionados. Por tanto:
- **archetype hybrid por múltiples delivery modes sí tiene camino observable**;
- **businessModel hybrid por monetización no debe asumirse alcanzable desde el banco actual** solo porque el resolver soporte el tipo.

**Gap:** falta replay V9 focal del journey híbrido `retail + online_checkout` hasta resultado final, para demostrar ausencia de doble conteo.

### C10 — sector/nicho unknown o cambiado
Cobertura existente:

1. selectores de nicho tienen `other` y `unknown` neutrales;
2. `other/unknown` no resuelven un nicho concreto;
3. cambiar sector elimina respuestas de nicho incompatibles;
4. `qa03b-v9-classification-bundle.test.ts` (blob `b8053a1f2bb181b8e43c3fe7c421a257023a0505`) prueba:
   - cambio food→B2B;
   - cambio dental→food;
   - agency→ecommerce;
   - cambio de especialidad dentro del sector;
   - eliminación de evidence especialista obsoleta;
   - replay determinista tras volver a un sector anterior;
   - historial de cambios conserva solo la clasificación activa;
   - reclasificar no amplía el presupuesto.
5. `qa03b-worker-replay-v9.test.ts` (blob `bfaffa71c0068c3bd63bba3424c36d135ef5b666`) falla cerrado ante transcript/answers manipulados, incluyendo cambio inconsistente de `q2_sector`.

**Gap:** no se localizó en las suites anteriores un caso explícito de clasificación V9 con **sector literal `unknown`** a través del bundle principal. `q2_sector_general` tiene opción unknown, pero es una propuesta separada/pending y no sustituye por sí sola al q2_sector del bundle actual.

## 5. Unknown, unanswered y not_applicable

`qa03b-v9-context-semantics.test.ts` distingue explícitamente:
- `unknown`;
- `unanswered`;
- `not_applicable`;
- answered.

También comprueba que:
- unknown aporta `uncertainty`;
- unanswered se omite;
- not_applicable se omite;
- missing dependency permanece `pending`;
- negación y `notEq` no convierten ausencia en una falsa confirmación;
- neutral multi-answer no autoriza un especialista.

**Estado:** semántica bien representada en tests source; no ejecutada.

## 6. Replay

Cobertura source existente:

### Classification replay
`qa03b-v9-classification-bundle.test.ts`:
- replay determinista;
- rechaza IDs companion manipulados;
- elimina stale specialty evidence al editar clasificación;
- volver a sector anterior reproduce solo la clasificación final activa;
- historial de reclasificación respeta budget.

### Worker replay
`qa03b-worker-replay-v9.test.ts`:
- reconstruye route, interaction budget, niche y scoring;
- rechaza envelopes V8/híbridos de identidad de versión;
- falla cerrado ante transcript/count/answers manipulados;
- replay de D1 = replay directo;
- round-trip SQLite;
- recuperación parcial;
- finalización reproduce D1 y persiste resultado confiable.

### Graph
`qa03b-v9-full-bank-graph.test.ts` (blob `046cb46775b01e3537edcc772067b8a27ef73822`):
- 77 nodos sin refs colgantes/ciclos;
- orden determinista;
- pending no consume preguntas;
- transición de contexto restaurant;
- niche unknown inhabilita especialista y conserva genérica.

**Estado:** replay tiene cobertura source significativa, pero no PASS actual.

## 7. Gaps CLASS-04 confirmados

- **B04-01:** ninguna suite fue ejecutada bajo la autorización actual.
- **B04-02:** C01/C04/C06 tienen fixtures representativos, pero falta demostrar el requisito completo de resultado útil/prioridades, no solo ruta.
- **B04-03:** C09 necesita replay V9 focal de `tienda-hibrida` hasta scoring/result para descartar doble conteo.
- **B04-04:** businessModel hybrid está soportado por resolver, pero su alcanzabilidad desde el banco actual no está demostrada por producers secundarios.
- **B04-05:** falta caso explícito de sector literal `unknown` en el bundle principal de clasificación V9.
- **B04-06:** falta una matriz única C01–C10 que conecte fixture → ruta → dimensiones aplicables → resultado esperado → replay.
- **B04-07:** compatibilidad entre versiones de banco para restore histórico sigue siendo contrato pendiente; no asumir que replay de un banco puede trasladarse a otro.

## 8. Estado

**CLASS-04 = PARCIAL / NO CERTIFICADA.**

Hay cobertura estática sustancial para los cinco ejes del contrato, especialmente C03/C05/C07/C08, reclasificación y replay. Los gaps restantes son concretos y ya no requieren inventario amplio, sino matriz transversal y futuros tests focalizados.

## Changelog

- **0.1.0 / 2026-10-31:** inventario C01–C10, 30 perfiles authored, híbridos, semántica unknown/N-A, cambio de sector, replay y siete gaps de certificación.
