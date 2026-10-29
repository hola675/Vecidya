## 60. Decisiones pendientes de cierre (PLAN_ONLY)

La revisión de `qa03b/specialty-branches-wave1.ts` identifica dos opciones neutrales que requieren validación semántica: `q2_food_menu_visibility.not_applicable` y `q2_marketing_agency_scope_clarity.not_applicable`. No convertirlas automáticamente en evidencia de debilidad ni aceptarlas como exclusión legítima sin revisión. También verificar mediante trazas el retorno a preguntas genéricas al cambiar especialidad. Priorizar inventario exhaustivo y matriz C01-C10 antes de aprobar nuevas preguntas.

Pendientes de decisión humana: taxonomía definitiva, semántica neutral, adiciones editoriales y persistencia de informes autenticados. No se modifica el motor.

## Fase 2 — contratos focales de cobertura y adiciones

Fuentes leídas en la rama: `qa03b/recovery-wave2.ts` blob `59fe5898cc98ba243b4c898b027dd22f2c1153c9`; `qa03b/specialty-candidate-bank.ts` blob `0bc44cddc1dc2f03230bd5ece30847fce984a12b`; `qa03b/specialty-branches-wave1.ts` blob `ec605156f2e974d7b463f44ae76475f8ede1f0e9`.

**Hechos:** `activeWithHistory` exige `operational_status=operating` y `has_customers=yes`; `prelaunch` exige `preparing`; el contexto nonprofit es `entity=organization` o `monetization=mission`. Las preguntas especializadas dependen de condiciones de elegibilidad y sustituyen rutas genéricas. No se ha ejecutado el grafo ni demostrado cobertura por escenario.

**Hipótesis que requieren contraste:** C03 pausado puede quedar fuera de ramas activas; C05 nonprofit sin donaciones no debe depender de `donation_clarity`; C02 prelaunch no debe recibir preguntas de clientes históricos. C10 nicho desconocido necesita fallback genérico y abstención si falta evidencia. Son riesgos, no fallos reproducidos.

**Puertas de aceptación futuras:** para cada C01–C10, registrar perfil inicial, preguntas elegibles, preguntas excluidas, respuesta neutral, dimensión, evidencia obtenida o abstención, coste de interacción y corrección de respuesta. Para ADD: justificar hueco frente al banco actual, proponer sustitución/prioridad, revisar ES/EN y no superar 24+5. No certificar una celda solo porque existe una pregunta en el catálogo.

**Decisiones humanas abiertas:** taxonomía final, semántica neutral, nuevas preguntas y almacenamiento de informes autenticados. No hay aprobación automática por añadir esta ficha.

### Changelog
- **1.1.0 / 2026-10-29:** contratos focales C02/C03/C05/C10 y criterios de cierre de cobertura; sin código ni pruebas.
