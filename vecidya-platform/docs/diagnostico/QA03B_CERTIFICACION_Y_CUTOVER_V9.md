# QA-03B — Certificación de rutas especializadas y propuesta de cutover V9

**Estado:** diseño de aceptación y pruebas sobre **banco candidato**. No representa autorización para activación ni modifica sesiones públicas.  
**Dependencias:** PR #114 (copy), #115 (clasificación y lote 1), #117 (lote 2); PR #119 contiene la certificación.

## 1. Línea base verificable

| Elemento | Producción QA-03B | Banco candidato |
| --- | --- | --- |
| Total de IDs | 45 | 74 |
| Preguntas de nicho explícito | 0 | 8, por sector |
| Preguntas históricas recuperadas | 0 | 21 |
| Sector | `q2_sector/v3` | `q2_sector/v4` con cuatro categorías más |
| Identidad de banco y sesión | `reviewed-evidence-v8`, esquema 8 | Sin identidad de sesión pública asignada |
| Storage | `vecidya.diagnostic.v3.candidate.session.8` | Sin nueva clave pública |
| TTL de la sesión pública | 14 días | Decisión pendiente |
| Límite por recorrido | 24 preguntas | 24 (no elevar) |

El banco candidato no está importado por `qa03b/qbv2-candidate-session.ts` ni por el pipeline de resultados productivo.

## 2. Certificación de rutas (PR #119)

Matriz declarada de **30 escenarios sintéticos**, sin datos privados, definida en `tests/unit/diagnostic/qa03b-specialty-journeys.ts`.

Cobertura por etapa y perfil: preparación de proyecto (servicio móvil, tienda online, software, organización), pausa con historial, dentista individual/clínica, medicina general, barbería/salón, abogado/impuestos/seguros, plomería y taller, detallado móvil, restaurante/cafetería/food truck, comercio minorista e híbrido, tienda online, agencia y mayorista B2B, creador, donaciones y membresías, consultoría y sector/entrega desconocidos.

Comprobaciones:
1. Cada declaración es válida, elegible y conserva sector/estado; no atribuir arquetipo «varios proveedores» por nicho dental.
2. **Una pregunta de nicho solo puede pertenecer al sector declarado**; ninguna opción `unknown`/«otra» inventa una especialidad.
3. Proyectos sin operación: no recibir preguntas sobre checkout ya ocurrido, clientela existente, ingresos actuales o reservas actuales. Negocios pausados: no confundir historia con operación presente.
4. B2B solo para comprador `b2b/mixed`; hospitalidad solo si hay consumo/estadía en el sitio; checkout solo con venta y pago online; donaciones y membresías requieren financiación de ese tipo.
5. La selección respeta `hardMax <=24`, presupuesto por módulo, rastros de utilidad y orden determinista.
6. **8 recorridos completos**, iniciados desde respuestas vacías, deben concluir siguiendo `buildCandidateQuestionPlanFromBankV3`, sin repetir preguntas. Cada respuesta es explícita en el perfil o `unknown` declarado en las opciones; **no hay elección positiva inventada**.
7. Ediciones de estado, comprador o modalidad de reserva deben borrar respuestas que ya no cumplen las reglas.
8. El lector público v8 debe rechazar IDs/campos de la versión candidata; no se reinterpretan sesiones antiguas.

**Alcance de esta prueba:** simula el mismo planificador, reglas, puntuación y validación del contrato que usa el sistema, pero **no ejecuta el navegador, el Worker ni la entrega real de informes**. La certificación HTTP/E2E es un requisito posterior, no sustituido por estas pruebas.

## 3. Matriz de contratos para un eventual banco público nuevo

Antes de usar el banco candidato en producción se requiere un nuevo contrato V9, separado de V8:
- Nueva identidad de `QUESTION_BANK_ID` que incluya un hash/revisión estable de IDs/versiones/valores, y nueva identidad de planificador cuando su comportamiento cambie.
- Identidad de resultado/pipeline y `WORKER_REPLAY_VERSION` acordes con el nuevo conjunto (no aceptar reportes de identidad v8 como si fueran v9).
- Esquema y clave de sesión **independientes** (p. ej. versión 9), sin sobrescribir la clave v8 en `localStorage`. El nombre preciso debe definirse y probarse en el PR de cutover.
- Vinculación de cada respuesta en `replayTranscript` con el banco/versión correctos; la revalidación server-side ha de utilizar **exactamente** ese banco.
- Revisar las 4 preguntas históricas elevadas a v2 por alternativas `unknown`/`not_applicable` y `q2_sector/v4` antes de aceptar los valores antiguos.
- No modificar automáticamente respuestas ya emitidas, ni fusionar evidencias de contratos distintos; ningún valor puede adquirir una semántica nueva en silencio.
- Si v8 sigue activo durante la transición, el servidor debe poder validar su replay con el banco v8 congelado o comunicar claramente que la sesión debe reiniciarse. **No aceptar un replay v8 frente a un Worker v9 sin una ruta explícita de compatibilidad.**
- Mantener políticas de privacidad, expiración, revocación y autorizaciones del diagnóstico existente; no extender retención por cambiar el banco.

## 4. Estrategia conservadora sugerida

1. Desplegar V9 **solo a staging** con flag y sesiones de prueba sintéticas, sin migrar/reescribir V8.
2. Certificar 30 contextos + 8 recorridos + regresión de los 20 perfiles previos + playbacks del Worker + edición/retroceso y reportes anónimos.
3. Comparación diferencial: respuestas sin evidencias nuevas deben mantener puntuación; cuando se añade evidencia R3 válida se exige explicación de qué dimensión cambió y por qué.
4. Probar que el máximo de preguntas **no aumenta**, y comprobar que los módulos especializados no consumen el presupuesto si no existe utilidad.
5. Elegir política de sesiones en curso: **a)** mantener una ruta v8 paralela hasta vencimiento, o **b)** reinicio explícito informado; no escoger una sin medir viabilidad técnica/operativa y acordar UX.
6. Tras aprobación de privacidad y compatibilidad, desplegar a una cohorte y verificar HTTP/replay/errores sin datos personales.
7. Expandir gradualmente, con rollback por identidad y claves separadas, sin alterar archivos ni resultados v8 persistidos.

## 5. Riesgos pendientes

- `q2_sector/v4` cambia el conjunto de opciones: no se puede activar conservando implícitamente todas las garantías del esquema 8.
- Las preguntas con `evidenceMigration: "pending"` **no pueden convertirse artificialmente en score**; algunas serán útiles solo si desbloquean evidencia posterior.
- El nicho es una declaración descriptiva, no prueba de infraestructura, personal remunerado, licencias ni permisos de contacto.
- El scorer tiene una entrada de prueba que acepta bancos explícitos. La versión productiva sigue fijando el banco v8; **ninguna ruta pública debe aceptar un banco suministrado por un cliente**.
- Las rutas sintéticas prueban el contrato, no la legibilidad con clientes reales. Antes de la activación realizar pruebas de lectura de preguntas y opciones con personas de distintos nichos.
- Las tres ramas apiladas pueden divergir respecto a `main`; requerir fusión/rebase cuidadosamente secuenciados con la matriz completa sobre el SHA final.

## 6. Puerta de salida

No autorizar cutover mientras falte cualquiera de: **CI verde en commit final, regresión de navegador, Worker replay V8/V9 probado, aviso/retención aprobados, ruta explícita de sesiones y verificación de puntuaciones y límites.**

Este documento es una guía de implementación futura y distingue hechos actuales del repositorio de decisiones propuestas.
