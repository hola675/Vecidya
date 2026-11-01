# Diagnostic V9 — CLASS-04 Closure Register

**Versión:** 0.1.0  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · CLASS-04 PARCIAL / NO CERTIFICADA  
**Rama auditada:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Contrato

CLASS-04 exige cubrir documentalmente y certificar en el futuro:

- C01–C10;
- híbridos;
- `unknown`;
- cambio de sector/nicho;
- replay.

Fuentes autoritativas:
- `DIAGNOSTIC-V9-TAX-CLASS-COMPATIBILITY.md`;
- plan maestro V9 §10.2.

## 2. Evidencia documental consolidada

| Documento | Blob | Estado |
|---|---|---|
| `DIAGNOSTIC-V9-CLASS04-C01-C10-STATIC-COVERAGE.md` | `b693ce1dfa89c54b45d30c1fcf4f093cea96005c` | Inventario estático |
| `DIAGNOSTIC-V9-CLASS04-ACCEPTANCE-MATRIX.md` v0.1.1 | `b4fe918c117e6fc4fc41a0ccc6da64065b09ebd3` | Criterios definidos, no ejecutados |
| `DIAGNOSTIC-V9-CLASS04-GAP-RESOLUTION-TRACE.md` | `a6586c1cd773adbc639cf095efbb722e3fe72993` | Gaps acotados |

## 3. Estado C01–C10

### C01 — negocio local activo con clientes
**Cobertura source:** representativa.  
**Resultado V9:** camino técnico existe por finalización/recommendations.  
**Bloqueo:** falta acceptance end-to-end específica de pertinencia del resultado.

### C02 — preparación sin clientes
**Cobertura source:** fuerte.  
Se separa prelaunch de operación actual y no se fabrican métricas comerciales.

### C03 — pausa con clientes históricos
**Cobertura source:** focal explícita.  
Historial ≠ operación actual; preguntas actuales dejan de aplicar.

### C04 — profesional independiente
**Cobertura source:** parcial/fuerte en entidad y contexto.  
**Bloqueo:** falta fixture/aceptación explícita del caso “marca comercial” y resultado final.

### C05 — organización sin venta directa
**Cobertura source:** focal explícita.  
No fuerza buyer B2B/B2C y separa donations/membership/grants.

### C06 — servicios por citas
**Cobertura source:** fuerte.  
Appointments exige modalidad explícita; el matcher V9 solo ofrece `online_booking` con evidencia específica de booking friction.  
**Bloqueo:** aceptación end-to-end del resultado/prioridades.

### C07 — ecommerce
**Cobertura source:** focal explícita.  
Checkout operativo separado de intención prelaunch; consentimiento/N-A preservado.

### C08 — gastronomía/menu no publicado
**Cobertura source:** focal explícita.  
Ausencia de presencia no se transforma en weakness; specialty/fallback están gateados.

### C09 — híbrido/varios canales
**Cobertura source:** contexto real `retail + online_checkout` → `archetype=hybrid`, componentes `ecommerce+retail`.  
**Bloqueo:** falta replay/finalization V9 específico del fixture `tienda-hibrida`.

### C10 — unknown/cambio de sector
**Cobertura source:** muy fuerte para reclasificación.  
`sector=unknown` es aceptado estáticamente por el bundle principal porque `QA03B_CANDIDATE_SECTOR_V4` conserva esa opción.  
**Bloqueo:** falta caso focal explícito unknown + replay.

## 4. Híbridos — distinción obligatoria

### Archetype hybrid
**Alcanzable** mediante múltiples delivery modes observados. Está representado en QA03B.

### BusinessModel hybrid
El resolver lo soporta si recibe mecanismos independientes de monetización. Sin embargo:

- `qbv2-signals.ts` admite `primary|secondary`;
- `qbv2-reviewed-foundation.ts` produce las monetizaciones de `q2_monetization` en `slot:"primary"`;
- los bancos QA03B inspeccionados no agregan producer secundario.

**Conclusión:** la capacidad del resolver no demuestra que `businessModel=hybrid` sea alcanzable desde el banco 77 actual. No fabricar señales de test para certificar una ruta que el banco no produce.

## 5. Unknown / N-A / missing

Las suites source distinguen:

- `unknown` → incertidumbre;
- unanswered/missing → ausencia pendiente;
- `not_applicable` → neutral/no score;
- missing dependency → pending;
- unknown no satisface negaciones o reglas especialistas por omisión.

Este contrato está bien representado documentalmente, no certificado por ejecución actual.

## 6. Cambio de sector y replay

Existe cobertura source para:

- food→B2B;
- dental→food;
- agency→ecommerce;
- cambio de specialty dentro del mismo sector;
- retorno a sector previo;
- eliminación de stale specialist answers;
- replay determinista;
- eventos manipulados fail-closed;
- budget que no crece por reclasificación;
- D1 replay equivalente al transcript directo;
- recuperación parcial;
- finalización con scoring parity.

No se ejecutó ninguna suite bajo este ciclo PLAN_ONLY.

## 7. Bloqueos exactos de certificación

### B04-01 — ejecución focal
No existe PASS asociado al SHA final actual.

### B04-02 — C01/C04/C06 end-to-end
El camino de resultado existe, pero falta aceptación específica de resultado/prioridades.

### B04-03 — C09 replay/finalization
Falta fixture híbrido completo hasta resultado persistido.

### B04-04 — businessModel hybrid
No está demostrada su alcanzabilidad desde el banco 77 actual. Debe resolverse como:
- explícitamente no alcanzable en este banco, o
- añadir un producer secundario futuro con contrato/versionado propio.

### B04-05 — sector unknown
Implementación estática resuelta; falta test focal explícito de clasificación y replay.

### B04-06 — restore entre bancos
Sigue pendiente decidir compatibilidad/migración entre sesiones/runs de bancos distintos. Igualdad de `questionId` no basta.

### B04-07 — evidencia de producto final
Para C01–C10, un PASS de routing no certifica por sí solo la utilidad del resultado. Debe conservarse el vínculo fixture→route→evidence→score→recommendations→replay.

## 8. Gate futuro de CLASS-04

CLASS-04 podrá pasar a CERTIFICADA solo cuando:

1. se ejecute la matriz focal sobre el SHA final;
2. C01–C10 tengan evidencia completa o una exclusión documentada;
3. C09 tenga replay/finalization híbrido;
4. C10 tenga unknown explícito + replay;
5. C01/C04/C06 demuestren resultado final pertinente;
6. se decida formalmente el estado de `businessModel hybrid` para el banco certificado;
7. se defina la política de restore/versionado entre bancos;
8. ningún PASS histórico de otro SHA se use como sustituto.

## 9. Transición a CLASS-05

El contrato de CLASS-05 es **aprobación humana, implementación aislada y pruebas focales solo cuando estén autorizadas**.

Por tanto, con la autorización vigente:
- sí puede prepararse un handoff/decision register;
- no debe ejecutarse ninguna prueba;
- no debe modificarse runtime;
- no debe activarse banco 82/90 ni cambiar replay/versiones.

## 10. Estado final documental

**CLASS-04 = PARCIAL / NO CERTIFICADA.**  
La auditoría ya no tiene gaps de inventario amplios; los bloqueos restantes son de aceptación, política y ejecución autorizada.

## Changelog

- **0.1.0 / 2026-10-31:** cierre documental consolidado de CLASS-04; C01–C10, híbridos, unknown, reclasificación, replay y siete bloqueos exactos.
