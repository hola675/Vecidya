# Diagnostic V9 — DEC-G: Aprende, servicios Vecidya y frontera GHL

**Versión:** 0.1.0  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · READY_FOR_HUMAN_REVIEW · NO APROBADO  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Objetivo

DEC-G debe fijar el contrato técnico futuro de enriquecimiento posterior al diagnóstico:

1. recursos Aprende;
2. acciones autónomas;
3. soluciones/servicios Vecidya;
4. cualquier integración GHL/CRM.

Ninguna de estas capas puede modificar evidencia, aplicabilidad, scoring, prioridades ni acceso al resultado.

No se modifica Aprende, catálogo, servicios, GHL ni runtime.

## 2. Decisiones de producto ya aprobadas

### D-V9-007 — Aprende
- recursos contextuales asociados a acciones;
- biblioteca opcional separada;
- contenido publicado/accesible;
- si no existe recurso, la acción permanece;
- consumo/progreso de Aprende no cambia V9.

### D-V9-008 — Vecidya
- servicios opcionales y contextuales;
- sección independiente de soluciones;
- enriquecimiento comercial **después** del ranking;
- ausencia de servicio no altera la acción;
- GHL no es requisito de diagnóstico, scoring, identidad, informe o plan.

## 3. Estado técnico observado

### Core V9
`worker-replay-v9.server.ts` produce un core que contiene:
- identity;
- interactionCount;
- context;
- terminalReason;
- applicability;
- dimensions.

No contiene catálogo comercial, Learn/Aprende ni PII.

### Finalización V9
`v9-finalization.server.ts` persiste:
- overall;
- evidence;
- recommendations;
- solutions.

No persiste la proyección comercial de `qbv2-candidate-commercial.ts`.

**Conclusión:** la ruta V9 autoritativa inspeccionada mantiene actualmente la capa comercial fuera del core/result finalization observado.

### Candidate commercial boundary
`qbv2-candidate-commercial.ts` (blob `707d9047c5d0b5bbd06d2ad4ff6f5f574b090d3b`) declara una dependencia unidireccional:

`evidence → semantic fact → constraint → priority → recommendation → solution → commercial fit`.

El módulo afirma que disponibilidad comercial nunca retroalimenta:
- score;
- applicability;
- priority;
- recommendation;
- solution.

Es una frontera útil, pero no se considera automáticamente contrato V9 aprobado.

### Offerings legacy/candidate
`qbv2-offerings.ts` contiene un catálogo/proyección de servicios y licencias Vecidya.

Debe tratarse como fuente a auditar, no como catálogo futuro aprobado:
- rutas públicas pueden cambiar;
- precios/licencias requieren fuente vigente;
- algunos contratos pertenecen a capas QBV2/candidate históricas.

### Aprende
La búsqueda focal realizada no localizó un adaptador V9→Aprende en los módulos de diagnóstico inspeccionados.

Esto significa **“no localizado en este censo focal”**, no prueba global de inexistencia.

## 4. Arquitectura propuesta de capas

### G-L0 — Diagnóstico
Produce:
- evaluación;
- incertidumbre;
- prioridades;
- acciones.

No conoce catálogo Aprende ni comercial.

### G-L1 — Acción
Contrato independiente:
- actionId;
- recommendationId;
- evidenceIds;
- motivo;
- dimensión;
- prioridad;
- prerequisites;
- modo `improve|prepare|verify|reduce_dependency`.

Debe ser útil por sí sola.

### G-L2 — Aprende
Adaptador read-only:
- busca recursos publicados;
- verifica URL/accesibilidad;
- vincula recurso a actionId;
- no cambia action/rank.

### G-L3 — Soluciones Vecidya
Adaptador comercial read-only:
- consulta catálogo vigente;
- empareja capacidades/acción;
- etiqueta carácter comercial;
- no cambia action/rank.

### G-L4 — GHL/CRM
Integración operacional opcional, solo tras consentimiento y finalidad explícita.

Nunca participa en L0–L3 como requisito técnico.

## 5. Contrato propuesto V9 → Aprende

Campos semánticos mínimos futuros:

- `resourceId`
- `canonicalUrl`
- `title`
- `status=published|unavailable`
- `topics/capabilities`
- `verifiedAt/catalogVersion`
- `actionId`
- `matchReason`

Reglas:
1. recurso debe existir y estar publicado;
2. URL debe verificarse;
3. recurso despublicado no se enlaza;
4. catálogo vacío no elimina acción;
5. no inventar título/URL;
6. no usar progreso de Aprende para scoring;
7. no exigir login si el recurso es público;
8. no reescribir resultados históricos cuando cambia el catálogo.

## 6. Contrato propuesto V9 → servicio Vecidya

Campos mínimos futuros:

- `offeringId`
- `provider`
- `type`
- `publicName`
- `canonicalUrl`
- `status`
- `capabilities`
- `catalogVersion`
- `actionId`
- `matchReason`
- `commercialDisclosure`

Reglas:
1. acción existe primero;
2. servicio es opcional;
3. ofrecer solo por capability match verificable;
4. no usar ausencia de web/CRM/ads como trigger comercial automático;
5. no inventar precio/ROI/disponibilidad;
6. cambio del catálogo no cambia diagnóstico histórico;
7. sección comercial visualmente separada.

## 7. Acción autónoma obligatoria

Toda prioridad debe tener un camino útil sin compra.

Una recomendación puede tener:
- acción autónoma;
- recurso Aprende;
- servicio Vecidya;
- ambos;
- ninguno.

Pero nunca:
- “compra X” como única acción diagnóstica;
- servicio comercial usado para justificar una brecha;
- link Aprende usado como evidence de madurez.

## 8. Frontera GHL

### Permitido en el futuro, con autorización
- crear/actualizar lead por acción voluntaria;
- iniciar proceso comercial solicitado;
- agendar seguimiento;
- sincronizar campos mínimos aprobados.

### Prohibido por defecto
- enviar respuestas de diagnóstico automáticamente;
- usar GHL como identidad del run;
- exigir GHL para generar informe;
- usar datos GHL como evidence sin un contrato separado y consentimiento;
- modificar score según etapa de pipeline;
- añadir tracking comercial al borrador anónimo;
- cruzar analítica D-V9-033 con leads.

## 9. Datos hacia GHL — propuesta conservadora

Si en el futuro el usuario solicita contacto:

Transmitir solo:
- identidad/contacto que el usuario haya proporcionado para esa finalidad;
- actionId/servicio solicitado;
- contexto mínimo necesario;
- consentimiento/version.

No transmitir por defecto:
- transcript;
- raw answers;
- scores completos;
- evidence ledger;
- texto libre;
- historial anónimo;
- diagnósticos no reclamados.

Cualquier ampliación exige política específica.

## 10. Neutralidad comercial

Dos personas con las mismas answers/versiones deben recibir:
- mismas dimensiones;
- mismo score cuando aplique;
- mismas prioridades;
- mismas acciones;

aunque:
- una tenga cuenta y otra no;
- GHL esté offline;
- un servicio sea retirado;
- Aprende esté vacío;
- una licencia cambie.

Solo las capas de enriquecimiento pueden variar.

## 11. Propuesta de fallback

### Aprende no disponible
Mostrar acción sin recurso.

### Servicio no disponible
Mostrar acción + recurso si existe, sin servicio.

### GHL no disponible
No bloquear diagnóstico ni informe; ofrecer contacto alternativo si existe política aprobada.

### Catálogo desactualizado
Omitir oferta/enlace no verificable; nunca usar cache vieja como promesa vigente sin etiqueta/versión.

## 12. Riesgo de código legacy/candidate

Existen módulos comerciales candidate/QBV2 que pueden asociar soluciones a licencias/servicios.

**Propuesta:** no importarlos automáticamente al núcleo V9. Durante F06:
- auditar cada contrato;
- retener solo reglas compatibles con D-V9-007/008;
- separar catálogo de diagnóstico;
- verificar fuentes vigentes.

## 13. Versionado

Resultado diagnóstico:
- versionado por banco/engine/scoring/recommendations.

Enriquecimiento:
- `learnCatalogVersion`;
- `serviceCatalogVersion`.

No deben formar parte de `scoring_version`.

Un mismo diagnóstico histórico puede mostrar recursos/ofertas actuales solo si UI distingue:
- resultado histórico;
- enriquecimiento vigente.

## 14. Casos futuros — NO EJECUTADOS

| ID | Caso | Esperado |
|---|---|---|
| G01 | Aprende vacío | acción igual, sin recurso |
| G02 | recurso despublicado | enlace omitido |
| G03 | recurso publicado pertinente | aparece con motivo |
| G04 | servicio pertinente | opción comercial separada |
| G05 | servicio retirado | acción permanece |
| G06 | GHL offline | diagnóstico/informe igual |
| G07 | mismo run con catálogo distinto | score/ranking idénticos |
| G08 | anónimo | no filtra evidencia privada en URLs/ofertas |
| G09 | org sin ventas | no empuja CRM sin necesidad |
| G10 | verify recommendation | no fuerza solución comercial |
| G11 | usuario solicita contacto | solo datos autorizados |
| G12 | no consentimiento comercial | cero envío a GHL |

## 15. Decisión humana requerida

DEC-G puede pasar a APPROVED cuando se confirme:

1. arquitectura G-L0…L4;
2. acción autónoma obligatoria;
3. adaptadores Aprende/servicios read-only posteriores al ranking;
4. contratos mínimos/versionado;
5. neutralidad comercial;
6. fallback de catálogo;
7. frontera GHL y datos mínimos;
8. no envío automático de respuestas;
9. separación analytics/GHL;
10. auditoría de catálogos reales antes de implementación.

## 16. Estado

**DEC-G = READY_FOR_HUMAN_REVIEW / NO APROBADO.**

No se localizó integración Aprende V9 activa en el censo focal; el core/finalización V9 inspeccionados no incorporan catálogo comercial, lo cual mantiene una separación compatible con la dirección aprobada.

## Changelog

- **0.1.0 / 2026-11-01:** paquete DEC-G; capas diagnóstico→acción→Aprende→servicios→GHL, neutralidad y fallback.
