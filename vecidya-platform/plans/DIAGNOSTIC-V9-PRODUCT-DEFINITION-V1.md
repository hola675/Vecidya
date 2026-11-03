# Diagnóstico V9 — Definición funcional y de producto

**Versión:** 0.1.0 · **Fecha:** 2026-10-29 · **Estado:** PROPUESTA PARA REVISIÓN, NO APROBADA · **PR:** #162

## 0. Evidencia y alcance
- Fuente: `plans/DIAGNOSTIC-V9-MASTER-FINALIZATION-PLAN.md`, `plans/DIAGNOSTIC-V9-SPRINT-00.md`, `docs/diagnostic-v9-question-answer-migration-protocol.md` y `docs/diagnostic-v9-consolidation-status.md`.
- GitHub confirma PR #184 (MiniWeb V2) y PR #199 (Aprende) **merged** en main. Esto no prueba que todas sus funciones estén operativas ni que existan contratos de integración V9.
- PR #162 permanece separado, sin sincronización de merge con main y sin certificación integral.
- Este documento define **producto y criterios propuestos**; no implementa código ni aprueba contenido editorial.

## 1. Problema y resultado esperado
El negocio local necesita comprender su situación y decidir qué mejorar, incluso si está empezando, está en pausa, no vende todavía, no usa CRM o no dispone de presencia digital. El diagnóstico debe convertir respuestas verificables en una explicación comprensible, prioridades realistas y próximos pasos ejecutables. **No es un formulario de captación ni un mecanismo para vender servicios por defecto.**

## 2. Principios de producto
1. **Pertinencia contextual:** no preguntar por ventas a quien no tiene ventas, ni por citas a quien no agenda; separar comprador, cliente, beneficiario e interesado.
2. **Autonomía V9:** banco, grafo, scoring, persistencia, informe y recomendaciones sin imports de ejecución QBV2/V8; V8 sigue operativo hasta corte autorizado.
3. **Evidencia y honestidad:** distinguir `unknown`, `none`, `not_applicable`, `not_published` y ausencia de respuesta; incertidumbre no es desempeño deficiente.
4. **Experiencia ligera:** conversación clara, progreso comprensible, teclado/móvil y recuperación; presupuesto orientativo de hasta 24 interacciones donde aplique, sin omitir evidencia crítica.
5. **Neutralidad comercial:** recomendaciones gratuitas primero cuando resuelven el problema; servicios y licencias como alternativas justificadas, sin promesas ni precios inventados.
6. **Privacidad y propiedad:** resultados generales sin identificación obligatoria; claim e historial sujetos a permisos explícitos y pruebas de aislamiento.
7. **Versionado y trazabilidad:** toda pregunta, opción, regla, interpretación, informe y recomendación tiene identidad y versión; cada conclusión apunta a evidencias.

## 3. Recorrido funcional propuesto
**E0 Contexto** → tipo de actividad, sector/especialidad, estado (preparación/activo/pausa), destinatario, objetivos y limitaciones. Reutilizar la taxonomía compartida cuando su contrato esté validado; no duplicar una segunda fuente de sectores.

**E1 Entrevista adaptativa** → banco canónico con preguntas elegibles, sustituciones solo cuando existe alternativa válida, explicación breve de términos, respuestas exclusivas coherentes, progreso y posibilidad de revisar respuestas.

**E2 Evaluación** → señales observables por dimensión; scoring determinista con nivel de confianza, cobertura y conflictos; no confundir herramienta instalada con proceso funcional.

**E3 Resultado inmediato** → síntesis útil sin registro forzoso: fortalezas, riesgos/brechas, incertidumbres y tres prioridades justificadas. El número tres es una preferencia UX a validar, no una obligación del motor.

**E4 Plan de acción** → para cada prioridad: evidencia, por qué importa, acción gratuita o interna, dificultad/esfuerzo estimado si se puede fundamentar, recurso Aprende verificado y servicio opcional cuando proceda.

**E5 Continuidad** → identificación voluntaria, guardar/recuperar, historial, asociación explícita a organización y reevaluación; control de acceso y consentimiento por contrato.

## 4. Contrato con Aprende (dependencia externa, desacoplada)
- **Estado comprobado:** PR #199 fusionado en main; archivos afectados incluyen `app/components/learn-progress-controls.tsx`, `app/routes/learn-article.tsx`, `tests/e2e/aprende-public-qa-check.mjs` y `plans/aprende/PLAN-V1.md`.
- **No inferir:** la fusión no garantiza que el catálogo, progreso, enlaces o E2E estén certificados en producción.
- **Adaptador V9→Aprende propuesto:** `resourceId`, `canonicalUrl`, `title`, `topicTags`, `published`, `catalogVersion`, `verifiedAt`; campos sujetos a inspección de la estructura real.
- **Elegibilidad:** recomendar solo recursos publicados, accesibles y vinculados a una brecha concreta. No construir URL por conjetura.
- **Fallback:** si Aprende no tiene recurso o falla la consulta, mostrar la acción útil sin enlace y registrar GAP; nunca bloquear informe ni scoring.
- **No acoplamiento:** progreso de lectura, login y métricas de Aprende no son requisitos para completar diagnóstico; no escribir en sus tablas ni modificar sus componentes desde V9 sin contrato acordado.
- **Validación focal futura:** recurso publicado/no publicado, URL inexistente, catálogo vacío, despublicación, cambio de versión y ausencia de red; comprobar que resultado V9 permanece estable.

## 5. Separación Vecidya / MiniWeb / GHL
- **Diagnóstico V9:** conocimiento del negocio, evaluación, informe y plan de mejora.
- **Aprende:** contenido formativo independiente; V9 referencia recursos publicados mediante adaptador.
- **Mi Vecindario / MiniWeb:** perfil público y presencia digital; una recomendación puede señalar oportunidad de presencia, pero no crear perfiles automáticamente ni convertirla en condición del diagnóstico.
- **Servicios Vecidya:** catálogo comercial opcional y versionado, sin sesgo de puntuación.
- **GHL:** CRM externo opcional, nunca motor de diagnóstico, fuente de puntuación ni requisito de acceso.

## 6. Banco editorial y grafo: decisiones obligatorias
- Línea base documental: 77 preguntas, 387 opciones, 15 variantes; 4 `copy_revised`, 4 `needs_semantic_review`, 69 `pending_human_review`. **Recontar en HEAD antes de editar o aprobar.**
- Ficha por pregunta y opción según `docs/diagnostic-v9-question-answer-migration-protocol.md` con KEEP/REWRITE/REMOVE/ADD/DEFER y revisión humana; no aprobar automáticamente.
- Priorizar clasificación, estado, comprador/beneficiario, objetivos, sin ventas, preparación/pausa, gastronomía y comercio electrónico; probar sustituciones especializadas sin pérdida de cobertura genérica.
- Caso explícito: `q2_food_menu_visibility` debe distinguir `not_published` de `not_applicable` solo tras decisión editorial y versión del contrato.
- Ninguna pregunta nueva sin caso de negocio, evidencia faltante y decisión que habilita; ninguna eliminación sin prueba de cobertura del grafo.

## 7. Entregables y criterios de aceptación
| Gate | Entregable | Aceptación |
| --- | --- | --- |
| G0 | Merge controlado main→V9, mapa de dependencias y matriz de PR | main ancestro, sin pérdidas, pruebas focalizadas verificadas |
| G1 | Banco canónico revisado | 100% de preguntas/opciones con decisiones editoriales y evidencia |
| G2 | Grafo adaptativo | recorridos positivos/negativos, sin ciclos ni sustituciones que creen huecos |
| G3 | Motor y sesiones | determinismo, idempotencia, concurrencia y ausencia de imports QBV2 en núcleo |
| G4 | Resultado e informe | cada conclusión trazable a respuestas; incertidumbre y versiones visibles |
| G5 | Integración Aprende y productos | enlaces publicados verificables, fallback y neutralidad comercial |
| G6 | Seguridad y experiencia | aislamiento entre organizaciones, accesibilidad, móvil y recuperación |
| G7 | Certificación y lanzamiento | CI/E2E sobre SHA final, staging, rollback, aprobación expresa antes de main/producción |

## 8. Decisiones de producto por acordar con el responsable
1. ¿Qué dimensiones exactas medirá V9 y qué lenguaje usará el resultado para negocios sin ventas?
2. ¿Cuál es el límite de preguntas por recorrido y cuándo se permite superar 24 para no perder evidencia?
3. ¿Qué nivel de detalle del informe se ofrece anónimamente y qué se guarda tras identificación?
4. ¿Las recomendaciones se ordenan por impacto, urgencia, esfuerzo o combinación explicable?
5. ¿Qué versión del catálogo Aprende y de servicios se considera apta para recomendar?
6. ¿Cómo se presenta incertidumbre o información contradictoria sin penalizar al negocio?
7. ¿Cómo se vincula un diagnóstico a un negocio existente sin acceso cruzado ni vínculo automático?

## 9. Secuencia de trabajo inmediata
1. Resolver sincronización main→V9 en worktree seguro (pendiente; no se simula).
2. Inspeccionar el contrato real de Aprende ya fusionado, sus rutas y QA, sin modificar su implementación.
3. Revisar con responsable secciones 2–8 y fijar decisiones explícitas en acta.
4. Completar Sprint 00: inventario real, matriz de dependencias, huecos y evidencias.
5. Preparar Sprint 01 editorial con lotes pequeños y pruebas focalizadas; **no implementar motor antes de gates**.

## 10. Registro de cambios
- **0.1.0 / 2026-10-29:** primera definición funcional; integración desacoplada Aprende; criterios de resultado, UX, seguridad y gates. No modifica código.
