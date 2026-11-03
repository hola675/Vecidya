# Diagnostic V9 — DEC-E: informe, identidad, retención y frontera de persistencia

**Versión:** 0.2.0  
**Fecha:** 2026-11-03  
**Estado:** PLAN_ONLY · DEC-E RATIFICADO · IMPLEMENTACIÓN NO AUTORIZADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Objetivo

DEC-E debe reconciliar cuatro contratos distintos:

1. borrador anónimo incompleto;
2. evaluación/resultados;
3. informe identificado e historial;
4. analítica anónima agregada.

No se modifica almacenamiento, rutas, D1, cookies, migraciones ni políticas de privacidad.

## 2. Decisiones de producto ya aprobadas

### D-V9-005
- resumen anónimo útil al finalizar;
- informe detallado con cuenta;
- identidad no cambia scoring ni prioridades;
- ownership, claim y organización son actos distintos.

### D-V9-028
- borrador anónimo incompleto: 7 días desde último guardado válido.

### D-V9-029
- borrador anónimo incompleto exclusivamente local;
- sin copia de recuperación en servidor;
- no enviar borrador por autosave/telemetría/logs;
- procesamiento necesario para evaluación/resultados debe documentarse por separado.

### D-V9-033
- arquitectura simple;
- borrador local;
- D1 para analítica anónima agregada;
- sin respuestas crudas, texto libre, IDs persistentes de sesión/usuario ni historial individual reconstruible en analítica;
- flujo de informe con cuenta separado de analítica.

## 3. Persistencia V9 actual observada

### Creación de run
`api-diagnostic-v9-runs.ts` (blob `a24fed8bb5372867abad62d1c761fa89ebcbace3`) crea un run D1 para:
- sesión autenticada;
- identidad anónima con cookie/credencial.

`createOwnedDiagnosticRunV9` inserta:
- `diagnostic_v9_runs`;
- `diagnostic_v9_run_ownership`.

### Eventos
`api-diagnostic-v9-run-events.ts` (blob `46278601c16ace4f281df726dfe20acc4bb11ba6`) acepta eventos del visitante/usuario.

`v9-event-ingestion.server.ts` (blob `3f2417225247422bc6838c70fb89bdd629f70b78`) declara explícitamente que almacena el evento en el ledger D1 inmutable.

`diagnostic_v9_events.payload_json` almacena el payload individual del evento.

### Schema
`0030_diagnostic_v9_audit.sql` (blob `08fef3f330766a5b411d7dbfcadbb3371fc59cc9`) define:
- runs;
- events con `payload_json`;
- snapshots con `state_json`;
- results con score/evidence/recommendations;
- feedback.

Esto permite reconstruir una entrevista individual.

## 4. Tensión arquitectónica P0

El prototipo V9 actual persiste en D1 durante la entrevista anónima una secuencia individual de respuestas/eventos.

D-V9-029 exige que el borrador anónimo incompleto:
- viva localmente;
- no tenga respaldo servidor.

D-V9-033 prohíbe en la analítica D1:
- respuestas crudas;
- IDs persistentes;
- historiales individuales reconstruibles.

### Interpretación prudente
No afirmar automáticamente que todo uso de D1 para resultados identificados está prohibido: D-V9-005 dejó la persistencia final pendiente y D-V9-033 también exige separar evaluación/resultados de analítica.

Sí puede afirmarse que el **ledger D1 individual de un run anónimo incompleto** entra en tensión directa con la arquitectura local-only aprobada si funciona como persistencia/reanudación de ese borrador.

**DEC-E debe resolver esta frontera antes de certificar F07/F08.**

## 5. Cuatro dominios de datos propuestos

### E-D1 — Borrador anónimo local
Finalidad:
- continuar una entrevista incompleta en el mismo dispositivo.

Puede contener, sujeto a D-V9-030–032:
- respuestas estructuradas mínimas;
- ruta/versión;
- hitos;
- contador 24+5;
- consentimiento de extensión;
- preferencia de avance;
- texto libre solo según consentimiento aprobado.

Retención:
- 7 días desde guardado válido.

Backend:
- no copia de recuperación.

### E-D2 — Procesamiento autoritativo de evaluación
Finalidad:
- validar eventos/routing/scoring/replay.

**Decisión abierta:** determinar si puede ser:
- stateless/transitorio sin persistencia individual durante fase anónima; o
- otra forma autorizada de procesamiento que no contradiga local-only.

No reutilizar la tabla de analítica como ledger individual por conveniencia.

### E-D3 — Resultado/informe identificado
Finalidad:
- informe detallado;
- historial;
- continuidad;
- asociación voluntaria a organización.

Requiere:
- cuenta/ownership;
- política de retención;
- borrado;
- propósito;
- control de acceso;
- versionado/replay.

**Store final no aprobado todavía.**

### E-D4 — Analítica anónima agregada
Finalidad:
- mejorar V9.

Permitido conceptualmente:
- contadores por período;
- etapas;
- preguntas mostradas/respondidas/omitidas por código;
- errores por categoría;
- extensión ofrecida/aceptada/rechazada;
- agregados con supresión/granularidad segura.

Prohibido:
- respuestas elegidas;
- texto libre;
- runId/userId persistente;
- secuencia individual;
- IP/device fingerprint;
- datos que reconstruyan entrevista.

## 6. Propuesta DEC-E1 — no usar identidad para cambiar evaluación

Regla:
- answers + versions + evidence → mismo resultado;
- login, claim, organización y plan/licencia no cambian score/recommendations diagnósticas.

La identidad solo cambia:
- autorización de lectura;
- persistencia/historial;
- asociación;
- funcionalidades posteriores.

## 7. Propuesta DEC-E2 — resumen anónimo vs informe detallado

### Resumen anónimo
Debe incluir como máximo:
- síntesis cualitativa;
- fortalezas principales sustentadas;
- oportunidades;
- incertidumbre/insuficiencia;
- orientación inicial.

No necesita exponer:
- ledger;
- respuestas crudas;
- evidencia sensible;
- trazas internas;
- IDs/versiones técnicas.

### Informe autenticado
Puede incluir, tras aprobación:
- dimensiones aplicables;
- evidence trace redactada;
- score/level cuando DEC-B lo permita;
- prioridades y recomendaciones;
- limitaciones;
- versión del diagnóstico;
- historial.

No mostrar datos de otro propietario/organización.

## 8. Propuesta DEC-E3 — claim

El claim debe:
1. partir de prueba válida de control del resultado anónimo;
2. requerir sesión autenticada;
3. transferir ownership una sola vez;
4. no recalcular resultado;
5. no alterar respuestas;
6. ser idempotente;
7. fallar cerrado en concurrencia;
8. no asociar automáticamente a organización;
9. no habilitar marketing/GHL.

La implementación actual ya contiene primitives de claim, pero su certificación permanece pendiente CLASS-02.

## 9. Propuesta DEC-E4 — organización

Separar:
- propietario personal del run;
- organización vinculada.

Vinculación:
- voluntaria;
- requiere membership;
- no transfiere propiedad por sí sola;
- no habilita a otros miembros a leer automáticamente el informe salvo política futura explícita.

La política exacta de visibilidad organizativa debe aprobarse antes de compartir informes entre miembros.

## 10. Retención — decisiones separadas

### Ya aprobada
Borrador anónimo incompleto:
- 7 días local.

### No aprobada
- resultado anónimo final;
- resultado identificado;
- event ledger;
- snapshots;
- claims completados;
- feedback;
- analítica agregada;
- logs/telemetría.

**Propuesta:** no reutilizar “7 días” para resultados finales.

Cada categoría necesita:
- propósito;
- mínimo necesario;
- plazo;
- borrado;
- legal/privacy review;
- backup semantics.

## 11. Opciones para resolver el ledger anónimo actual

### Opción A — local-only estricto antes de finalización
- entrevista anónima se mantiene local;
- backend procesa sin persistir ledger individual duradero;
- al finalizar se genera resumen;
- solo tras login/claim se persiste el resultado/historial aprobado.

**Ventaja:** máxima alineación D029/D033.  
**Riesgo:** exige rediseñar replay/autorización actuales.

### Opción B — ledger servidor temporal explícitamente autorizado
- permitir ledger individual temporal para integridad/replay;
- definirlo como procesamiento, no backup;
- TTL corto y borrado;
- sin reutilización analítica.

**Riesgo:** cambia/precisa la política D029 y podría contradecir la lectura estricta “sin respaldo servidor”.

Requiere aprobación humana explícita; no asumirla.

### Opción C — persistir solo al completar
- borrador local durante entrevista;
- al finalizar, enviar transcript/estado firmado para validación y persistencia del resultado según identidad/política.

**Ventaja:** reduce persistencia incompleta.  
**Riesgo:** integridad/replay debe validarse sin confiar en transcript cliente.

### Propuesta DEC-E
**Preferencia documental: A o C**, no B por defecto, porque A/C respetan mejor la intención de simplificar y no guardar borradores anónimos en servidor.

No seleccionar arquitectura técnica hasta revisar seguridad/integridad.

## 12. D1: aclaración necesaria

D-V9-033 dice “D1 exclusivamente analítica anónima agregada”, pero D-V9-005 deja persistencia de informes finales por aprobar.

Se necesita una decisión explícita:

### E-Q1
¿“D1 exclusivamente analítica” significa:
- **Q1-A:** toda la base D1 del producto, por lo que informes identificados deben vivir en otro store; o
- **Q1-B:** las tablas/ruta de analítica anónima, permitiendo tablas separadas D1 para resultados identificados bajo política aprobada?

**No inferir Q1-B por conveniencia técnica.**

Hasta resolver E-Q1:
- no certificar el schema actual `diagnostic_v9_*` como arquitectura final.

## 13. Seguridad/acceso

Requisitos mínimos:
- same-origin en mutaciones;
- rate limit;
- owner check;
- no enumeration;
- no PII en URL/cache/log;
- claims protegidos;
- organization membership;
- audit de exposición;
- cookies HttpOnly/SameSite/Secure donde corresponda;
- no GHL.

CLASS-02 ya trazó estas primitives, pero faltan tests focales.

## 14. Casos futuros de aceptación — NO EJECUTADOS

| ID | Caso | Esperado |
|---|---|---|
| E01 | anónimo incompleto | solo borrador local; sin copia servidor según política aprobada |
| E02 | local TTL vence | no reanuda |
| E03 | finaliza anónimo | resumen útil sin login |
| E04 | login/claim | mismo resultado; no recalcula |
| E05 | claim concurrente | un único owner |
| E06 | usuario ajeno | acceso denegado |
| E07 | org sin membership | vínculo denegado |
| E08 | miembro distinto | no obtiene acceso salvo política explícita |
| E09 | analytics | ningún raw answer/ID reconstruible |
| E10 | borrar borrador | no afecta resultado identificado distinto |
| E11 | borrar cuenta/informe | política definida y verificable |
| E12 | fallo login | resumen anónimo sigue accesible |
| E13 | replay histórico | versiones preservadas |
| E14 | GHL no disponible | evaluación/informe funciona igual |

## 15. Decisiones humanas ratificadas

Registro 2026-11-03:
- E3 replay: **APPROVED** — procesamiento/replay autoritativo transitorio sin ledger individual anónimo persistente;
- E4 comprobante: **APPROVED** — resultado verificable; guardar no recalcula;
- E5 TTL resultado anónimo final: **APPROVED = 24 horas**;
- E6 propiedad: **APPROVED = personal**; organización no obtiene lectura automática;
- E8 backups: **APPROVED = máximo objetivo 30 días**, condicionado a certificación operativa;
- E9 reclamación: **APPROVED = possession**; primera reclamación autenticada válida, atómica e idempotente;
- observaciones humanas: **ninguna**.

Se mantienen además:
- borrador local-only;
- TTL borrador 7 días;
- retención identificada mientras exista cuenta con eliminación voluntaria;
- analítica anónima agregada y no reconstructiva;
- E-Q1-B: tablas D1 separadas para resultados identificados.

Estas decisiones no levantan PLAN_ONLY ni autorizan código, migraciones, CI, PR o deploy.

## 16. Estado

**DEC-E = RATIFICADO A NIVEL DE PRODUCTO/ARQUITECTURA · PLAN_ONLY.**

Ya no son preguntas abiertas E3, E4, E5, E6, E8, E9 ni E-Q1-B.

Condiciones de implementación/verificación todavía pendientes:
- algoritmo/custodia/rotación de claves para el comprobante;
- claim atómico e idempotente;
- prueba real de expiración/restauración de backups ≤30 días;
- plazo operativo de analítica agregada;
- inventario y tratamiento de datos anónimos históricos del prototipo;
- cierre de cuenta y restauración sin resurrección;
- textos finales de privacidad/consentimiento.

El siguiente scope elegible para autorización independiente es F07-L1. No se autoriza automáticamente L2–L6.

## Changelog

- **0.2.0 / 2026-11-03:** DEC-E ratificado: E3 replay transitorio, E4 comprobante sin recalcular, E5 TTL 24 h, E6 propiedad personal, E8 backups 30 d condicionados, E9 possession; E-Q1-B preservado; PLAN_ONLY sigue vigente.
- **0.1.0 / 2026-11-01:** paquete DEC-E; cuatro dominios de datos, tensión ledger anónimo/D029-D033, opciones de arquitectura y pregunta explícita sobre alcance de D1.
