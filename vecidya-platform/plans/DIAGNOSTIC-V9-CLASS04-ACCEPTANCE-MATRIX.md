# Diagnostic V9 — CLASS-04: matriz de aceptación C01–C10

**Versión:** 0.1.1  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · DEFINIDA / NO EJECUTADA  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Objetivo

Traducir el contrato CLASS-04 a criterios focales medibles sin ejecutar tests ni modificar implementación.

Fuente de contexto:
- `DIAGNOSTIC-V9-CLASS04-C01-C10-STATIC-COVERAGE.md`
- `DIAGNOSTIC-V9-CLASS04-GAP-RESOLUTION-TRACE.md`
- plan maestro V9 §10.2
- suites V9/QA03B ya existentes

## 2. Criterios por escenario

### C01 — negocio local activo con clientes

**Fixture mínimo:** un negocio `operating + history=yes` con sector local válido.

**Debe demostrar:**
1. la entrevista termina o queda budget-blocked de forma explícita;
2. no exige web, ads o ecommerce como requisito universal;
3. solo puntúa dimensiones con evidencia válida;
4. produce prioridades/recomendaciones pertinentes al contexto;
5. replay reproduce exactamente answers, scoring y resultado.

**Cobertura source existente:** personas authored locales y journeys; el pipeline V9 de finalización genera overall/recomendaciones/solutions desde replay y banco fijado.  
**Gap:** validación end-to-end específica de resultado/prioridades C01.

---

### C02 — emprendimiento en preparación sin clientes

**Fixture mínimo:** `entity=project`, `status=preparing`, `history=no`.

**Debe demostrar:**
1. no se afirma operación actual;
2. no se fabrican ventas, demanda, conversión o recurrencia observadas;
3. se permiten preguntas de preparación pertinentes;
4. dimensiones operativas no aplicables no reciben score;
5. unknown permanece incertidumbre, no evidencia negativa.

**Cobertura source existente:** fuerte.

---

### C03 — negocio en pausa con clientes históricos

**Fixture mínimo:** `paused + history=yes`.

**Debe demostrar:**
1. historial previo se conserva;
2. no acredita operación actual;
3. preguntas operativas actuales quedan ineligibles;
4. evidencia histórica no se convierte en capacidad vigente;
5. replay mantiene esa separación.

**Cobertura source existente:** focal explícita.

---

### C04 — profesional independiente con marca comercial

**Fixture mínimo:** `entity=individual`, actividad profesional activa.

**Debe demostrar:**
1. no se reclasifica automáticamente como empresa constituida;
2. sector/nicho no inventan licencia, equipo o capacidad;
3. canales/contacto se evalúan por evidencia propia;
4. identidad comercial y entidad legal no se confunden;
5. resultado sigue siendo útil aunque archetype permanezca parcialmente unresolved.

**Cobertura source existente:** entidad individual/professional y camino V9 de resultado.  
**Gap:** fixture/aceptación explícita de “marca comercial” y resultado final C04.

---

### C05 — organización sin venta directa

**Fixture mínimo:** `entity=organization`, `buyer=no_direct_purchase`.

**Debe demostrar:**
1. no se fuerza B2C/B2B;
2. donations, membership, grants y mixed permanecen distintos;
3. impacto/beneficiario no se interpreta como venta;
4. preguntas de donación/membresía solo aparecen tras soporte correspondiente;
5. N/A no penaliza.

**Cobertura source existente:** focal explícita.

---

### C06 — servicios por citas

**Fixture mínimo:** `delivery includes appointments`.

**Debe demostrar:**
1. appointments procede de modalidad explícita, no del sector/nicho;
2. no exige reserva online;
3. booking, attendance, reminders y rebooking se separan semánticamente;
4. dental especializada solo sustituye genérica cuando sus gates aplican;
5. continuidad N/A no penaliza servicios sin retorno;
6. recomendación concreta de booking solo aparece con evidencia específica.

**Cobertura source existente:** amplia; el matcher V9 solo selecciona `online_booking` ante evidencia directa de `q2_appointments_booking_friction`.  
**Gap:** resultado/prioridades C06 end-to-end.

---

### C07 — ecommerce

**Fixture mínimo:** operación activa + `online_checkout`.

**Debe demostrar:**
1. ecommerce depende de evidencia de checkout real;
2. prelaunch con checkout previsto no se trata como compra operativa;
3. carrito/seguimiento solo se evalúan cuando aplican;
4. `no_authorized_contact` es N/A neutral;
5. no se presume publicidad, consentimiento o retargeting.

**Cobertura source existente:** focal explícita.

---

### C08 — gastronomía con menú no publicado

**Fixture mínimo:** food_hospitality/restaurant con presencia ausente o incompleta.

**Debe demostrar:**
1. menú no publicado no equivale a oferta poco clara puntuada negativamente;
2. specialty menu solo se activa con presencia adecuada;
3. unknown es incertidumbre;
4. si specialty no aplica, fallback genérico solo permanece si su propio gate aplica;
5. no se infieren reservas/citas por sector.

**Cobertura source existente:** focal explícita.

---

### C09 — actividad híbrida / varios canales

**Fixture mínimo:** `q2_delivery=[retail,online_checkout]`.

**Debe demostrar:**
1. archetype = hybrid;
2. componentes = ecommerce + retail, sin duplicados;
3. ambos canales conservan preguntas pertinentes sin doble score por el mismo hecho;
4. orden de opciones/señales no cambia contexto;
5. replay V9 mantiene componentes y scoring;
6. businessModel hybrid solo se acepta si existen mecanismos independientes con procedencia suficiente.

**Cobertura source existente:** `qa03b-context.test.ts` demuestra exactamente `retail+online_checkout → hybrid [ecommerce,retail]`; resolver base prueba independencia/determinismo.  
**Gap:** replay/result/finalization V9 focal del fixture `tienda-hibrida`.

**Nota:** `businessModel=hybrid` está soportado por el resolver, pero el banco 77 inspeccionado solo produce monetización `slot:"primary"`. No declarar alcanzabilidad desde el flujo actual mientras no exista producer secundario real.

---

### C10 — sector/nicho desconocido o cambiado

**Fixtures mínimos:**
- sector/nicho unknown;
- sector other;
- cambio food→B2B;
- cambio dental→food;
- cambio agency→ecommerce;
- retorno a sector previo.

**Debe demostrar:**
1. unknown no se transforma en other ni en un sector concreto;
2. missing ≠ unknown;
3. nicho incompatible se elimina;
4. specialist evidence obsoleta se elimina;
5. respuestas no relacionadas permanecen;
6. replay de eventos de clasificación produce solo el estado final válido;
7. reclasificación no reinicia ni amplía budget;
8. evento manipulado falla cerrado.

**Cobertura source existente:** muy fuerte para cambios. `QA03B_CANDIDATE_SECTOR_V4` conserva literalmente `unknown`, y `applyClassificationInteractionV9` valida sector contra ese catálogo, por lo que el bundle principal lo acepta estáticamente.  
**Gap:** falta test focal explícito `sector=unknown` + replay, no una decisión de implementación.

## 3. Gates transversales

### X04-01 — Unknown / N-A / unanswered
Los tres estados deben permanecer diferenciados desde routing hasta scoring y reporte.

### X04-02 — Híbridos
No producir hybrid por duplicación de la misma señal. Requerir evidencia independiente suficiente. Distinguir `archetype hybrid` alcanzable de `businessModel hybrid` no demostrado desde banco actual.

### X04-03 — Edición de contexto
Cambiar sector, buyer, modalidad o status debe reconciliar respuestas y eliminar solo las que dejan de ser elegibles.

### X04-04 — Replay
El resultado reconstruido desde eventos debe coincidir con el resultado directo del mismo transcript.

### X04-05 — Versionado
Replay/restore no puede asumir compatibilidad entre bancos distintos solo por compartir questionId.

### X04-06 — Presupuesto
Reclasificación, replay o agrupación de sector+nicho no pueden conceder interacciones adicionales fuera del contrato 24+5.

## 4. Evidencia mínima futura por caso

Para declarar un caso PASS se exige registrar:

- SHA exacto probado;
- banco/versiones de runtime;
- fixture/inputs;
- preguntas efectivamente presentadas;
- respuestas activas finales;
- respuestas descartadas por reconcile;
- dimensiones aplicables/N-A/insufficient;
- scoring/evidence final;
- terminalReason;
- interactionCount;
- replay de eventos;
- resultado final reproducible.

No basta un assert de elegibilidad aislado para certificar el caso completo.

## 5. Estado

| Caso | Cobertura source | Certificación |
|---|---|---|
| C01 | Representativa + camino de resultado | NO |
| C02 | Fuerte | NO |
| C03 | Focal | NO |
| C04 | Parcial + camino de resultado | NO |
| C05 | Focal | NO |
| C06 | Fuerte + matcher conservador | NO |
| C07 | Focal | NO |
| C08 | Focal | NO |
| C09 | Hybrid alcanzable en contexto; replay focal pendiente | NO |
| C10 | Fuerte; sector unknown aceptado estáticamente | NO |

**CLASS-04 permanece PARCIAL / NO CERTIFICADA.**

## 6. Changelog

- **0.1.1 / 2026-10-31:** sector unknown resuelto estáticamente; aclarada alcanzabilidad de hybrid; añadida ruta de resultado C01/C04/C06 y matcher conservador C06.
- **0.1.0 / 2026-10-31:** matriz C01–C10, seis gates transversales y evidencia mínima futura.
