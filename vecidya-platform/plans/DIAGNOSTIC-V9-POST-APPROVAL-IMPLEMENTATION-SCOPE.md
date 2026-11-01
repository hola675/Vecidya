# Diagnostic V9 — alcance condicional de implementación post-aprobación

**Versión:** 0.1.0  
**Fecha:** 2026-11-01  
**Estado:** PLAN_ONLY · CONDICIONAL · NO AUTORIZA CÓDIGO/PR/CI/DEPLOY  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Objetivo

Definir el orden de ejecución que se recomienda **solo si** el responsable aprueba DEC-A…H y después levanta PLAN_ONLY de forma explícita y acotada.

Este documento:
- no cambia estados A–H;
- no autoriza comandos;
- no ejecuta pruebas;
- no autoriza merge;
- no autoriza migraciones;
- no autoriza staging/producción.

Fuente de decisión: `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md`.

## 2. Principio de ejecución

Cada lote futuro debe seguir:

`inspección SHA → scope mínimo → cambio acotado → prueba focal → evidencia/log → commit → reevaluar gate`.

No usar suites generales como primera prueba.  
No mezclar limpieza legacy, UI, migraciones y scoring en un mismo lote.

## 3. Orden recomendado de waves

### W0 — ratificación humana
Sin código.

Salida:
- A–H con estado humano;
- fallbacks registrados;
- alcance exacto de PLAN_ONLY levantado;
- tareas autorizadas identificadas.

STOP:
- cualquier DEC sigue OPEN/ambigua sin fallback.

---

### W1 — F00: reconciliación Git y migraciones

#### W1.1 — revalidación
- reconsultar `main`, PR #162 y HEAD;
- actualizar ahead/behind/merge-base;
- revalidar archivos overlap;
- verificar si main añadió nuevas migraciones.

#### W1.2 — historia de migraciones
Antes de tocar Git:
- comprobar migraciones 0030+ aplicadas en entornos autorizados;
- clasificar cada migración V9: `NOT_APPLIED | APPLIED_DEV | APPLIED_STAGING | APPLIED_PROD | UNKNOWN`.

#### W1.3 — integración main→V9
Solo con DEC-H aprobada:
- worktree aislado;
- backup/ref;
- merge main hacia rama V9;
- resolución semántica;
- no force-push.

Pruebas focales:
- rutas tocadas;
- Learn/MiniWeb solo si hubo conflicto;
- migration journal;
- archivos diagnósticos afectados.

Gate:
- main ancestro;
- cero pérdida de producto adyacente;
- migraciones con secuencia única y trazabilidad.

STOP:
- migración V9 aplicada con ordinal que requiere renumeración;
- cambios concurrentes materiales;
- conflicto fuera del scope.

---

### W2 — F01: frontera autónoma V9

Objetivo:
- mapa de imports/exports/consumidores;
- REPLACE/SHARED/ADAPTER/RETAIN/DELETE_AFTER_CUT;
- núcleo futuro V9 sin runtime QBV2/V8.

Incluye ADRs:
- storage de resultados identificados;
- separación borrador local / procesamiento / analítica;
- registry de versiones.

Pruebas focales:
- búsqueda estática de imports;
- ciclos;
- consumidores de contratos compartidos.

Gate:
- cada dependencia legacy tiene destino;
- ningún store se asume por conveniencia.

---

### W3 — F02: banco editorial canónico

Aplicar DEC-A/C:

1. 77 baseline;
2. implementar KEEP/REWRITE aprobados con versionado;
3. mantener ADD 82/90 pending salvo aprobación individual;
4. real-estate sin sustitución hasta gate;
5. ES/EN y neutralidad.

Pruebas focales:
- IDs/versions únicos;
- opciones válidas;
- unknown/N-A/other/unanswered;
- routing specialist/fallback;
- copy ES/EN por ítems modificados.

Gate:
- banco canónico versionado;
- ninguna evidence pending activa accidentalmente.

---

### W4 — F03: grafo y presupuesto 24+5

Aplicar DEC-F:

- planner ordinario 0–24;
- gate de evidencia crítica;
- consentimiento no contable;
- extensión 25–29;
- contador idempotente;
- reanudación sin reinicio;
- stop temprano.

Pruebas focales mínimas:
- termina <24 cuando suficiente;
- turno 24 suficiente;
- turno 24 gap crítico;
- consentimiento rechazado;
- consentimiento aceptado;
- stop en 26 al resolver;
- hard stop 29;
- cambio idioma;
- reanudación;
- edición sin doble conteo;
- aclaración nueva sí cuenta.

Gate:
- ningún camino >29;
- ninguna extensión por score/comercial;
- replay reproduce contador.

---

### W5 — F04: motor, correlación y calibración

Orden interno obligatorio:

#### W5.1 — DEC-D
- constructKey;
- overlapGroup;
- eventKey/periodKey;
- fail-closed;
- deduplicación antes del scorer.

#### W5.2 — DEC-B registry
Crear contrato:
`scoring_version → calibration identity/version`.

Prohibir defaults implícitos en:
- Worker replay;
- finalization;
- result pipeline.

#### W5.3 — score
- direct-required;
- supporting capped;
- neutral=null;
- applicability;
- >=3 + >=60%;
- global null cuando insuficiente.

Pruebas focales:
- mismo hecho/dos IDs;
- eventos distintos;
- conflicto;
- supporting-only;
- 0/1/2 directas;
- N/A/unknown;
- run histórico con calibration vieja;
- mismatch version;
- replay/finalization parity.

Gate:
- mismo input/version produce mismo resultado;
- calibration identity reproducible;
- no doble conteo.

---

### W6 — F07: sesión, privacidad e identidad

Aplicar DEC-E antes de publicar informe identificado.

#### W6.1 — borrador
- local-only;
- TTL 7 días;
- estado mínimo;
- texto libre según consentimiento;
- no backup servidor.

#### W6.2 — procesamiento/finalización
Implementar arquitectura aprobada para finalización anónima sin ledger D1 reconstructivo.

#### W6.3 — resultado identificado
- store aprobado separado según DEC-E;
- claim;
- owner personal;
- org link voluntario;
- historial;
- retención/borrado.

Pruebas focales:
- TTL;
- local storage unavailable;
- borrador corrupto;
- claim único;
- claim concurrente;
- cross-user;
- cross-org;
- no marketing/GHL;
- resumen anónimo permanece disponible cuando login falla.

Gate:
- cero acceso cruzado;
- cero respuestas crudas en analytics D1;
- claim no recalcula.

---

### W7 — F05/F06: resultado, prioridades y enriquecimiento

#### F05
- resumen anónimo;
- informe detallado autenticado;
- misma evaluación base;
- evidencia/limitaciones;
- versiones.

#### F06
Aplicar DEC-F/G:
- ranking multicriterio sin pesos inventados;
- acción autónoma;
- Aprende read-only;
- servicios Vecidya read-only;
- GHL opcional y consentido.

Pruebas focales:
- mismo diagnóstico con/sin catálogo;
- recurso despublicado;
- catálogo vacío;
- servicio retirado;
- GHL offline;
- goal sugerido no confirmado;
- goal confirmado;
- dependency ordering.

Gate:
- score/prioridad invariantes frente a catálogos;
- acción útil sin compra.

---

### W8 — F08: certificación integrada

Solo después de W1–W7.

Pruebas:
- C01–C10;
- ES/EN;
- sector/nicho change;
- pause/prelaunch/no-sales;
- hybrid;
- replay;
- seguridad/autorización;
- 24+5;
- accesibilidad;
- reduced motion;
- errores y concurrencia;
- payload/rate limits;
- regresión delimitada de consumidores.

Aquí sí puede autorizarse un gate más amplio, pero debe registrar:
- SHA;
- comandos;
- exit code;
- logs;
- fallos/reintentos;
- entorno.

Gate:
- cero críticos/altos;
- resultados reproducibles;
- rollback probado a nivel de código/flag.

---

### W9 — F09: conmutación V8→V9

Solo con F08 PASS y aprobación de corte.

- switch controlado;
- V8 conservado como rollback inicial;
- smoke focal;
- referencias residuales;
- retirar legacy únicamente después de demostrar cero consumidores.

Nunca:
- borrar migraciones históricas;
- limpiar legacy antes del switch certificado.

---

### W10 — F10: staging, piloto y producción

Orden:
1. staging;
2. migraciones;
3. smoke real;
4. piloto representativo;
5. revisar métricas/logs;
6. rollback real;
7. aceptación;
8. autorización explícita;
9. producción;
10. postdeploy.

Producción no se infiere de CI/staging.

## 4. Matriz bloqueo → wave

| Bloqueo actual | Wave que lo resuelve |
|---|---|
| v2/v4 calibration binding | W5 |
| doble conteo/correlación | W5 |
| local-only vs ledger D1 | W2 + W6 |
| hard cap 24 vs 24+5 | W4 |
| migraciones 0030–0035 | W1 |
| restore/versioning | W2/W3/W5 |
| A–H sin aprobación | W0 |
| CLASS-01…04 sin PASS actual | W3–W8 |

## 5. Scope mínimo recomendado para el primer levantamiento de PLAN_ONLY

Si A–H son aprobadas, **no** levantar PLAN_ONLY para todo V9 de una vez.

Primer permiso recomendado:
- W1/F00 solamente;
- lectura y cambios Git/migración necesarios para reconciliar main;
- pruebas focales de archivos afectados;
- sin F02–F10;
- sin deploy.

Segundo permiso:
- W2/F01.

Después avanzar wave por wave.

## 6. Regla de pruebas focalizadas

El comando exacto NO se fija en este documento porque debe verificarse contra los scripts disponibles en el checkout del SHA de ejecución.

Para cada cambio:
1. localizar test existente más cercano;
2. ejecutar solo ese archivo/grupo;
3. si no existe, añadir el test focal correspondiente dentro del scope autorizado;
4. ampliar solo cuando un gate de integración lo requiera.

No usar “todos los tests” como rutina de cierre de cada commit.

## 7. READY_FOR_AGENT

Este documento no cambia el estado actual:

**NOT_READY / PLAN_ONLY**

READY_FOR_AGENT solo puede declararse cuando:
- A–H tengan decisión humana;
- scope inicial esté autorizado;
- PLAN_ONLY se levante explícitamente para ese scope;
- HEAD se revalide inmediatamente antes de ejecutar.

## Changelog

- **0.1.0 / 2026-11-01:** waves W0–W10, relación con F00–F10, gates P0 y scope incremental recomendado.
