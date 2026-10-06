# Changelog

## 2026-10-06 — DIAG-V3-R3A — contrato de migración de evidencia

Contrato atómico por ID/version y opciones, estados pending/migrated explícitos y rama V3 en el scorer existente sin fallback por ID. Estados/contribuciones e IDs de dimensiones compartidos sin cambios numéricos o de nombres; validación sin registro de bancos. Piloto aislado de Discovery/q20/q22 direct y q65 supporting; ledger derivado 38/4 migrated/34 pending. Unknown/N/A neutros y not_seeking context-only. Diecisiete regresiones; corte R2, banco productivo, mapas/semánticas legacy, planner, calibración, aplicabilidad, UX y caracterización conservados. Sin activación, D1 ni deploy. Validación en TESTING.md; R3B no iniciado.

## 2026-10-06 — DIAG-V3-QBANK-R2-FINAL — certificación y freeze

Nueve regresiones de certificación global: partición independiente del orden 37 KEEP/37 REMOVE/11 DEFER, candidata pura de 38, runtime congelado, evidencia cero, unknown/N/A, contexto/DSL, diez rutas bajo cap y elegibilidad de todas las definiciones. q65 alcanzable por profundización, directness pendiente R3. Solo pruebas y documentación canónica; ninguna definición, scoring, fixture, comportamiento productivo ni despliegue cambia. R2A–R2J completas; entradas R3/R4 separadas y siguiente fase R3 no iniciada. Validación ejecutada en TESTING.md.

## 2026-10-06 — DIAG-V3-QBANK-R2J

Completa revisión candidata con cinco capacidades v2 (q65/q69/q82/q84/q85), sin inferencia de éxito, dolor, herramienta o validación de mercado. Registro explícito de las 85 decisiones (37 KEEP, 37 REMOVE, 11 DEFER) y ocho regresiones de completitud, gates, prelaunch, unknown/N/A, neutralidad, evidencia y rutas. Las pruebas de composición existente pasan a candidata 38; R2I conserva decisiones/rutas. Sin activación, nuevo scoring, rebaseline, cambios comerciales, D1 o deploy. Validación de este corte en TESTING.md.

## 2026-10-06 — DIAG-V3-QBANK-R2I — revisión B2B y audiencia

- Inventario previo q50–q63; solo q52 (acceso al estado de oportunidades) y q56 (contacto directo de audiencia) KEEP v2, adaptativas y con evidencia pendiente. Candidata total 33.
- q50/q53/q54/q55/q57/q58/q59/q63 REMOVE; q51/q60/q61/q62 DEFER por metodología o aplicabilidad/consumidor. Se preservan decisiones cerradas q35/q45.
- Unknown/N/A no producen inferencias; no hay cambios de contexto, DSL, planner, scoring, mapas globales ni caracterización. Banco productivo 85 y versión 1 conservados; sin activación, migración o deploy. Resultados en TESTING.md.

## 2026-10-06 — DIAG-V3-QBANK-R2H — revisión retail, ecommerce y hospitality

- Inventario previo de q37–q49 y contraste con las 28 definiciones revisadas; se implementan solo q37/q38/q40 v2, para un total candidato de 31. Evidencia pendiente R3 y cero contribuciones candidatas.
- q37 separa comprensión de oferta de inventario y entra por meta de claridad; q38 evalúa contacto directo utilizable, con permiso y N/A, ante necesidad de continuidad. q40 evalúa navegación sin asumir catálogo aplicable; incluye N/A/unknown.
- REMOVE q39/q42/q43/q45/q46/q47/q48/q49; DEFER q41 (abandono observado sin consumidor posterior) y q44 (aplicabilidad de recompra). Las instrucciones R2H mantienen q45/q47 eliminadas aunque el artefacto histórico proponía KEEP. Matriz y justificación en `ARCHITECTURE.md`.
- Candidata aislada, sin nuevas señales/campos de contexto ni cambios de planner/scorer. Banco productivo de 85, versión runtime 1, mapas globales y caracterización intactos. Sin activación pública, migración ni deploy. Validación: `TESTING.md`.

## 2026-10-06 — DIAG-V3-QBANK-R2G — candidata local, citas y profesional revisada

- La candidata aislada pasa a 28 preguntas y agrega ocho KEEP v2 para servicio local, citas y profesionales; todas declaran `evidenceMigration: "pending"`.
- Coordinación difícil, recordatorios, continuidad de citas y prueba visible de experiencia se abren solo ante evidencia material. Outcome de cita, fricción de coordinación y seguimiento profesional se mantienen como hechos distintos; las respuestas no producen fricción ni scoring.
- q13/q19/q35 permanecen fuera, q21 sigue DEFER y se retiran los demás constructos redundantes/circunstanciales identificados en la revisión. No se agregan señales/contextos ni se modifica QUESTION_BANK_V2 (85), scoring, mapas globales o runtime. No registrado ni desplegado.
- Validación final: R2G 6/6, candidata 54/54, frozen/legacy 235/235, diagnóstico 833/833 y unit 888/888; typecheck, build y `git diff --check` pasan. Ver `TESTING.md`.

## 2026-10-06 — DIAG-V3-QBANK-R2F — Discovery universal y confianza revisadas

- Se agrega a la candidata aislada q2_discovery_reliable_reach v1, q2_local_presence_consistency v2 y q2_reputation_flow v3; total 20. `QUESTION_BANK_V2` continúa en 85 y sin cambios.
- `discoveryReachReliability` completa el circuito de contexto/traza/DSL. El nuevo módulo `discovery` tiene máximo de ruta 1; el planner mantiene las preguntas adaptativas opcionales y selecciona q22 ante necesidad real de confianza.
- q13 y q19 salen de la candidata; q21 se difiere hasta tener aplicabilidad defendible de recurrencia. No se implementa ninguna de las tres.
- Las definiciones nuevas quedan con evidencia pendiente R3. No cambian mapas/semánticas globales ni la evidencia del banco legacy. Estado local, candidata no registrada ni publicada. Resultados: ver `TESTING.md`.

## 2026-10-06 — DIAG-V3-QBANK-R2E — candidata especializada revisada (preguntas 10–12)

- La candidata aislada pasa a 17 preguntas en orden 01–12 y 14–18; añade q10 `q2_appointments_noshow` v2, q11 `q2_ecommerce_traffic_sources` v3 (incluye `messaging`) y q12 `q2_b2b_pipeline` v2. q13 no se migra y el banco productivo conserva 85 preguntas.
- q10 y q12 agregan `appointmentAttendance` y `b2bFollowupProcess`, con estados desconocidos explícitos y acceso por el DSL/planner. No generan fricción genérica ni evidencia digital; q11 tampoco asigna evidencia en R2E.
- La guarda de evidencia pendiente se limita a definiciones marcadas del candidato con versión distinta a su definición legacy; el scorer no registra ni importa el candidato. `EVIDENCE_MAPPING`, `ANSWER_SEMANTICS` y el resultado legacy permanecen iguales.
- q13 queda diferida hasta R2F, que deberá resolver aplicabilidad de llegada espontánea usando operación real, ubicación física y walk-in; arquetipo local/retail no basta. Validación: ver `TESTING.md`.

## 2026-10-06 — DIAG-V3-QBANK-R2D — candidata revisada de consistencia y capacidad (preguntas 17–18)

- Se agregan q2_process_systemization y q2_capacity_signal a la candidata aislada: ahora 14 preguntas en orden 01–09, 14–18; q10–q13 continúan pendientes.
- `processConsistency` conserva defined/partial/informal y unknown sin colapsar el booleano legacy `systemization`. Solo puede apoyar scaling junto con evidencia de crecimiento independiente.
- `capacitySituation` conserva stable/pressure/expanded/pressure_and_expanded con señales separadas de la evidencia legacy de crecimiento. Las respuestas revisadas no crean crecimiento por sí solas.
- Las dos preguntas son adaptativas, contexto de madurez, versión 2 y sin score digital. El banco productivo de 85 preguntas sigue vigente; sin registro ni deploy. Validación RAN: ver `TESTING.md`.

## 2026-10-05 — DIAG-V3-QBANK-R2C — candidata revisada de clasificación (preguntas 14–16)

- Se añaden sector, alcance geográfico y tipo de comprador como slice aislado al candidato 01–09; el agregado queda en 12 preguntas (01–09, 14–16), sin registrar ni migrar `QUESTION_BANK_V2`.
- `community_social` se incorpora aditivamente. El valor legacy `nonprofit_community`, sus opciones y productores productivos permanecen sin cambios.
- q2_customer_reach solo aparece con `activity` resuelta; el copy prioriza prelaunch y después organización. Las tres preguntas resuelven contexto y no aportan evidencia al diagnóstico.
- Las tres preguntas candidatas usan versión semántica 2. Sin cambio de versión del banco, scoring, recomendaciones, UI, PDF ni publicación. Validación: ver `TESTING.md`.

## 2026-10-05 — DIAG-V3-QBANK-R2B — candidata de contexto revisado (preguntas 06–09)

- Se amplía la candidata aislada de cinco a nueve preguntas con regularidad, tendencia, prioridad personal y fricción percibida. El aggregate no se registra; el banco legacy productivo y sus 85 preguntas siguen vigentes.
- Se agregan `occasional`, `irregular_active`, `flat_observed` y desconocidos explícitos. Las ocho metas concretas resuelven el `primaryGoal` existente como prioridad declarada y contexto de routing, nunca como evidencia digital directa; `other`, `unsure` y no respondido mantienen estados distintos. Fricción declarada sigue siendo contexto de routing, no evidencia.
- No cambia la versión del banco actual, scoring, aplicabilidad dimensional ni resultado público. Validación RAN: ver `TESTING.md`.

## 2026-10-05 — DIAG-V3-QBANK-R2B-FIX — unificación de prioridad y objetivo

- Se elimina el dominio duplicado `userPriority`; q2_goal usa el `primaryGoal` existente para contexto/routing. La elección `other` queda visible en la traza sin inventar una meta conocida.
- Se reemplaza la afirmación de equivalencia dimensional measure/be_found por regresiones de cero evidencia contextual y se registra para R4 la retirada de aplicabilidad dimensional basada en goal. `QUESTION_BANK_V2` y scoring no cambian.
- R2B no rebaselinea la caracterización legacy. La divergencia preexistente continúa registrada; cualquier reconciliación del snapshot requiere una tarea auditada independiente.

## 2026-10-05 — DIAG-V3-QBANK-R2A (candidata revisada de fundación)

- Se preparó una candidata no registrada con las preguntas revisadas 01–05 y señales del dominio existente; únicamente las pruebas candidatas la importan.
- La bank legacy sigue con 85 preguntas, las opciones/mapeos anteriores y sus resultados de contexto. No hay cambio de scoring ni de ruta pública.
- `q2_monetization` requiere `activity` resuelta mediante el DSL existente; q2_has_customers desbloquea el copy presente/futuro sin depender del ranking incidental del planner.
- Se conserva el límite global de hints en 140 caracteres con copy aprobado ajustado. Se fija con pruebas la frontera de entidad producida por `q2_other_staff`.
- Candidata 9/9; suites focalizadas 244/244; unitarias 842/843 con la misma divergencia de caracterización del preflight; typecheck, build y `git diff --check` PASS. R2A y R2A-FIX están versionados en main; sin activación pública ni deploy.

## 2026-10-05 — DIAG-V3-QBANK-R1.2-FIX (frontera de compatibilidad, local)

- Se clasificaron los 17 fallos nuevos: todos eran efectos de activar gates R2 o la reinterpretación de `licensed` sobre fixtures congeladas. No se cambiaron expectativas.
- Se restauró el mapeo legacy `licensed` → `professional_services` y los gates por archetype actuales en Golden/Lotes B y D; no se asignan roles nuevos al banco.
- Los helpers B2B, creator y professional quedaron aislados para fixtures sintéticas. La arquitectura canónica y `other`/`unsure` se mantienen preparadas sin cambiar el comportamiento actual.
- Suites focalizadas 235/235; unitarias 833/834 con solo la divergencia de caracterización ya presente en el preflight; typecheck, build y `git diff --check` PASS. Sin commit/push.

## 2026-10-05 — DIAG-V3-QBANK-R1.2 (contrato de clasificación y routing, local)

- Se define el vocabulario canónico de entrega y se conserva compatibilidad con los valores legacy; solo `online_checkout` significa ecommerce.
- La aplicabilidad B2B usa `customerBuyer`; creator usa monetización real de audiencia; evidencia profesional queda adaptativa y no se deduce de tamaño de equipo ni de licencia.
- `other`/`unsure` permanecen sin clasificación inventada, con trace explícito y ruta de evidencia genérica/completitud. No se añade pregunta contextual.
- Suites focalizadas 206/206, typecheck y build PASS. Unitarias 816/834: una falla histórica de caracterización y 17 incompatibilidades de rutas/salidas en fixtures QBV2 congelados; no se activa QBV2 ni se cambia el resultado público. Ver `TESTING.md`.

## 2026-10-05 — DIAG-V3-QBANK-R1.1 (semántica de routing, local)

- El planner excluye `routingRole: deepening` de la fase base, pero permite su selección por cola material o por evidencia insuficiente. `core`/`adaptive` mantienen precedencia de `unlock_routing`; preguntas sin rol conservan el orden histórico.
- `validateQuestionBankV2` rechaza gates que dependan de respuestas deepening-only; la traza de actividad informa señal, estado o ausencia de `hasRealCustomers`.
- No se migran preguntas ni se cambia scoring, resultado, UI, PDF, recomendación o publicación.
- Suites focalizadas 131/131; unitarias completas 824/825 con la misma divergencia de caracterización registrada en el commit base. Typecheck, build y `git diff --check` PASS; el build advierte que faltan secretos opcionales de Gmail en el entorno local.

## 2026-10-05 — DIAG-V3-QBANK-R1 (preparación arquitectónica, local)

- Se cierra el artefacto humano de revisión de preguntas en 85/85 decisiones y se registran las dos decisiones ecommerce pendientes.
- El contrato QBV2 incorpora rol de routing explícito con fallback histórico; el dominio separa actividad básica de `growthStage`; las entregas admiten N componentes de archetype deterministas; el validador señala gates `notEq(..., "no")` inseguros sin cambiar su semántica actual.
- No se reescribe ni activa el banco, no cambia scoring/resultados visibles y no se ejecutan migraciones ni deploy.
- Suites focalizadas 128/128, typecheck, build y `git diff --check` PASS. Unitarias completas: 821/822; única falla `characterization.test.ts:102`, reproducida en preflight antes de R1.
- La validación estática enumera 41 gates `notEq(..., "no")` existentes que R2 debe revisar y reemplazar deliberadamente.

## 2026-10-05 — COMMERCIAL-UX-001 (solo local, sin deploy)

- El resolver comercial V1 ya no devuelve `none`: Cuadra es la licencia mínima cuando no hay evidencia suficiente para Barrio o Ciudad, incluso con CRM externo o una necesidad de servicio independiente. Nativa Home queda en Cuadra; el porcentaje Digital Health permanece separado.
- Home, Licencias, Complementos y Servicios se compactan alrededor de cards, capacidades, precios y acciones; Complementos publica los siete productos V1 y sus costes de uso aparte; Servicios publica las siete familias comerciales.
- El resultado diagnóstico prioriza licencia, hasta dos necesidades actuales, opciones posteriores y coste; añade una aclaración comercial de una pregunta sin modificar respuestas, scoring ni dimensiones. El informe PDF reutiliza el mismo `CommercialRecommendationV1`.
- Validación local pendiente de cierre en este cambio: unitarias focalizadas, typecheck, build, E2E y revisión visual responsive. No se ejecutaron migraciones ni deploy.

## 2026-10-04 — Vecidya 0.6.1 — catálogo visual, copy público y resultado diagnóstico

- Se incorporan 17 PNG seleccionados desde `C:\Users\Admin\Pictures\Assets` bajo `public/assets/catalog/`: estados del diagnóstico, planes, addons y servicios. Se conservan alpha, dimensiones y los archivos fuente organizados; los assets no usados quedan reservados fuera del bundle público.
- `/diagnostico` usa las tres imágenes nuevas de estado; `/licencias`, `/addons` y `/servicios` reemplazan iconos genéricos solo donde existe correspondencia funcional clara. Home mantiene sus SVG compactos para no mostrar texto ilegible en tamaños pequeños.
- Se centralizan etiquetas de acciones, frontera licencia/addon/servicio y CTA de diagnóstico en `app/content/public-copy.ts`; `/unete`, `/contacto`, `/vecindario`, `/aprende`, `/sobre-nosotros` y perfiles públicos dejan de repetir literales equivalentes.
- En los tres estados con índice del resultado diagnóstico, la imagen conserva su rótulo visual y el HTML muestra únicamente `Estado Actual:`, porcentaje y código público (`MAL`, `REGULAR` o `BIEN`); el estado descriptivo HTML se mantiene solo para lecturas sin índice.
- Se mantiene intacto el motor DIAG-V3: los assets son visuales, no participan en scoring, confianza, recomendaciones ni reglas de diagnóstico. Deploy, migraciones y HTTP anónimo quedan registrados en `docs/ENVIRONMENTS.md` tras la publicación.

## 2026-10-04 — DIAG-V3 0.6.0 release candidate (publicación pendiente)

- Se consolida el núcleo DIAG-V3 cliente-only: planner v2, schema de sesión 2, question bank v1, scoring v1, overall index v2, metodología 3.0 y hard cap 24.
- FIX-03A/B/C/D y FIX-04A quedan validados con seis calibraciones reales de navegador: evidencia adaptativa, deepening, applicability/N-A, bandas MAL/REGULAR/BIEN, confianza separada y precedencia terminal canónica.
- La precedencia terminal distingue `evidence_sufficient`, `no_useful_questions` y `absolute_hard_cap_reached` sin alterar rutas, scores, confianza, cap, recomendaciones ni licencias.
- La calibración confirma deuda no bloqueante en extremos 0/100 y un edge case de hard cap en Mercado Verde; el rediseño comercial/recommendation y GHL siguen fuera de este release.
- Validación local: `test:unit` 797/797, typecheck, build y `git diff --check` PASS. No se ejecutaron migraciones.
- La publicación pública queda pendiente de deploy y verificación HTTP anónima autorizada por DIAG-V3-REL-001.

## 2026-10-03 — Assets del diagnóstico y actualización visual de Vecidya (solo local, sin deploy)

- Se integran ocho WebP circulares reutilizados por el resultado V3 y el PDF mediante el mismo mapeo; la carpeta contiene únicamente esos ocho assets finales, sin recortes temporales ni duplicados.
- Se reemplazan las tres ilustraciones de madurez del resultado y del PDF con recortes optimizados de `Assets Generados/Disnostico Assest.png`; los títulos y explicaciones siguen siendo texto dinámico del resultado.
- Se actualizan el símbolo 3D, la marca completa y el wordmark con `Icono.png`, `Marca.png` y `nombre.png`. El lockup de Auth usa una placa blanca para mantener legible la marca sobre el panel oscuro; el favicon conserva PNG. Los originales generados se mantienen.
- Typecheck, build y `git diff --check` verificados localmente. Sin cambio de versión ni despliegue.

## 2026-10-02 — DIAG-V3-13 Public Diagnostic Cutover (solo local, sin deploy)

- `/diagnostico` reemplaza QBV1 por `DiagnosticFlow` V3 cliente-only; metodología e informe pasan a `/diagnostico/metodologia` y `/diagnostico/informe` (`noindex` para el informe).
- Se separa la lámina «Etapas de madurez de presencia digital» con Motonexo Assets en tres WebP: por fortalecer, en desarrollo y sólida. Cada imagen conserva su rótulo de estado; se excluye el párrafo fijo inferior para que resultado y PDF muestren la explicación personalizada por las respuestas. La misma clasificación V3 selecciona el arte en ambos.
- Se retira el backend experimental de persistencia, recuperación y analítica del diagnóstico, junto con sus rutas, módulos, bindings KV/ratelimit y secreto específico. Las migraciones `0011`–`0013` nunca se aplicaron a D1 remota.
- Privacidad vigente: respuestas solo en `localStorage` durante 14 días; sin telemetría, servidor ni recuperación entre dispositivos. El informe se genera en el navegador.
- Versión local `0.6.0`. Unitarias 775/775, typecheck, build, E2E V3 10/10, informe 26/26 y smoke público C1 PASS. Publicación/deploy y DIAG-V3-14 quedan fuera de este cierre y requieren autorización explícita.


## 2026-10-01 — DIAG-V3-12 Professional Diagnostic PDF Report (solo local, sin deploy; cerrada y congelada en su commit local de cierre)

- Informe PDF del diagnóstico V3 con un límite de **tres páginas**: view model `DiagnosticReportV1` (informe 1.0, metodología 1.0) construido del `DiagnosticNarrative` y el `DiagnosticOutcome` congelados con las mismas traducciones de presentación que la web; no recalcula nada.
- Paginación propia en hojas fijas: bloques cohesivos repartidos en orden, títulos que viajan con su contenido, la mayor densidad tipográfica que cabe (9,5 → 7,5 pt), sin recortes y sin hojas vacías. Sin portada aparte (no cabe en tres páginas): cabecera con marca, título, tipo, etapa, fecha y versiones.
- Generación con el navegador (diálogo de impresión desde la página del informe) y con Playwright `page.pdf` etiquetado y con marcadores para desarrollo y QA; sin dependencias nuevas ni backend. Ruta privada `/__dev/diagnostico/informe/:personaId?` y «Descargar informe PDF» en el resultado de la ruta privada V3.
- Textos de estado vacío del resultado (plan sin pasos, ayuda de Vecidya, freno principal) pasados a constantes compartidas por la web y el informe, sin cambio de texto. Símbolo de marca para impresión de 96 px (5 KB): cada PDF bajaba de ~330 KB a ~175 KB.
- QA: 12 golden en A4 y en Carta + 2 casos de estrés: 26/26 en ≤ 3 páginas (24 de 3 y `appointment_business` de 2), densidad 8–9,5 pt; PDF etiquetado con idioma `es`, marcadores, título y los 8 enlaces de fuentes clicables; texto extraíble con todo el contenido visible del informe; 150–191 KB (mediana 175 KB); generación 0,66–1,15 s (mediana 0,76 s). Revisión visual hoja por hoja (color y grises) y detector `impeccable` 0 avisos tras sustituir tres bordes laterales gruesos. `diagnostic-report.test.ts` 10/10; unitarias 864/864; E2E V3 10/10; `diagnostic-v3-report-check.mjs` registrado en el runner local.
- JS público sin cambios; CSS +8.217 B (antes de la compactación del cierre); `public-assets` +50 B. PDF/UA no validado. Sin cambio de motor, metodología ni versión.
- Cierre de DIAG-V3-12 (legibilidad e impresión): el piso tipográfico sube de 7,5 a **8,5 pt** — nunca se vuelve a bajar de ahí — y el objetivo de tres páginas deja de ser un techo absoluto: un caso excepcional que no quepa ni en el piso puede usar una cuarta hoja (`REPORT_MAX_PAGE_COUNT`) antes que sacrificar legibilidad; con el contenido real de las 12 golden nunca hizo falta. Antes de tocar la tipografía se compactó espaciado y relleno de tarjetas (cabecera, presencia, prioridades, áreas); el resultado, con el mismo contenido, mejoró: la mayoría de los informes ahora usa 9–9,5 pt en vez de 8,5–9 pt. Nueva prueba automática que impide elegir un tamaño por debajo del piso aprobado, y nuevo caso de QA con los fondos de impresión desactivados (la opción habitual del navegador) más uno en escala de grises: el estado, el porcentaje, la confianza y las ocho áreas se siguen leyendo igual, porque el color nunca fue el único portador de significado. `diagnostic-report.test.ts` 11/11; unitarias 865/865; `diagnostic-v3-report-check.mjs` 26/26 (+ caso sin fondos y caso en grises sin fondos). CSS +8.137 B (antes +8.217 B: la compactación redujo el propio CSS). Sin cambio de contenido del diagnóstico, de la metodología ni de versión.

## 2026-10-01 — DIAG-V3-11 Methodology & Credibility (solo local, sin deploy; cerrada y congelada en su commit local de cierre)

- Metodología **1.0** del diagnóstico V3 en `qbv2-methodology.ts` (solo datos, versión propia separada de la de la aplicación, fuera del barrel del dominio): qué evalúa cada una de las ocho áreas y con qué preguntas, qué indica una lectura alta o baja y qué no significa; porcentaje de un área; índice general (mismo peso, sin lectura ≠ 0, mínimos, sin índice antes del lanzamiento, bandas 40/70 sobre la media exacta, topes por freno material o confianza limitada sin cambiar el número); confianza separada del porcentaje; preguntas adaptadas y longitud variable; papel de cada respuesta; la falta de información no es una debilidad; cómo se ordenan las prioridades; cadena de recomendación con el catálogo al final; límites; cálculo determinista y datos de la vista privada.
- Cada afirmación está clasificada (regla interna verificada en código, principio externo con fuentes, criterio de Vecidya o límite) y los números del texto se leen del motor. Investigación de fuentes: 8 aceptadas (Google ×5, OCDE, Eurostat, Spiegel/Northwestern) solo como principios de 6 áreas; rechazadas 8 (detalle en `ARCHITECTURE.md`).
- UI: página reutilizable `MethodologyArticle` (nivel A «Lo esencial» y nivel B) en la ruta privada `/__dev/diagnostico/metodologia`; «Cómo se evaluó» del resultado con cuatro explicaciones breves, «Ver metodología y fuentes» y la versión.
- Ayuda de `q2_friction` (corrección solo de comprensión): «Por qué importa» deja de decir «dónde buscar evidencia» y pasa a «Nos ayuda a enfocar primero las preguntas en el área donde notas más dificultad. Si las demás respuestas apuntan a otra cosa, el diagnóstico lo señala.»; la auditoría de pistas y ayudas incluye ahora «evidencia» a secas.
- Cierre de DIAG-V3-11 (credibilidad de fuentes): se retiran HBR «The Short Life of Online Sales Leads» y HBR «Zero Defections» porque solo se pudo leer su avance (no el contenido que respaldaría el principio); «Del interés a la acción» y «Seguimiento y relación» quedan como criterio de Vecidya, sin cambio de motor. Cada fuente aceptada guarda el pasaje literal verificado (`excerpt`, `verifiedOn`); Eurostat deja de mencionar la gestión de clientes (no figura en la fuente primaria) y la OCDE se verificó en el informe completo. Distinción explícita: el Índice de Intensidad Digital de Eurostat no es el porcentaje de presencia digital de Vecidya ni valida la escala 0–100, los límites 40/70, las ocho áreas o las prioridades.
- Pruebas: `qbv2-methodology.test.ts` 13/13 (atribución: pasaje verificado por fuente, fuentes retiradas ausentes, áreas solo con criterio de Vecidya y Eurostat ≠ índice de Vecidya; versión y contrato del motor, ocho áreas contra los mappings, fuentes únicas y usadas, ninguna fuente sobre la fórmula, ubicación en código de cada regla interna, auditoría de sobreafirmación y jerga, números contra el motor, grafo de imports de la separación comercial, sin red ni modelos, render de la página y de «Cómo se evaluó», ruta solo en desarrollo); unitarias 854/854. QA visual (Visual Quality Loop 01–07) en 320/390/768/1440: 0 desbordes, 0 errores, enlaces ≥ 24 px, teclado e impresión; detector `impeccable` 0 avisos en lo nuevo.
- JS público sin la metodología (+43 B en el chunk compartido solo por la ayuda de `q2_friction`); CSS +5.135 B. Sin cambio de motor, scoring, prioridades, recomendaciones, ruteo ni versión. Las fases siguientes se renumeran (PDF → DIAG-V3-12).

## 2026-10-01 — DIAG-V3-10B Adaptive Diagnostic Frontend (solo local, sin deploy; cerrada y congelada en su commit local de cierre)

- Cuestionario adaptativo V3 sobre el motor congelado en `1ed2bda`: `qbv2-session.ts` (sesión pura) y `app/components/diagnostic-flow/` (inicio, reanudación, pregunta con pista y ayuda, progreso por etapas, listo, preparando, error y resultado V3), en la ruta privada `/__dev/diagnostico/v3` (solo `react-router dev`).
- Contrato de avance: el lote del planner se muestra de una pregunta a la vez, con re-evaluación de elegibilidad tras cada respuesta. Re-planificar el lote completo cambiaba la ruta en el 44 % de las rutas calibradas; la estrategia por lote da 12/12 golden y 4.860/4.860 rutas idénticas al pipeline congelado.
- Volver y editar con reconciliación (sin reactivar respuestas que dejaron de aplicar), persistencia local validada y caducable, reinicio con confirmación, recuperación de datos corruptos y cierre con reintento.
- Defectos encontrados y corregidos en la QA: el indicador de etapa retrocedía con preguntas de contexto tardías (ahora es monótono); las preguntas diagnósticas con propósito `friction`/`goal` se mostraban como «de contexto»; el error de validación quedaba fuera de pantalla en móvil (ahora vive junto a los botones fijos); la pantalla «Listo» no ofrecía reiniciar.
- Hallazgos registrados: `DIAG-QBV1-E2E-SELECTOR-01` (el E2E de QBV1 falla por un selector ambiguo desde DIAG-V3-07; con el selector exacto QBV1 pasa completo) y `DIAG-V3-ANSWER-ORDER-01` (el orden de inserción de las respuestas cambia el orden de la evidencia y los temas que nombra la narrativa, no scores ni prioridades).
- Pruebas: `qbv2-session.test.ts` 13/13, `diagnostic-flow-ui.test.ts` 10/10, E2E `diagnostic-v3-flow-check.mjs` 10/10 (registrado en el runner local); unitarias 837/837. JS público idéntico; CSS +6.948 B. Sin cambio de motor ni de versión; QBV1 intacto.
- Cierre — `DIAG-V3-ANSWER-ORDER-01` resuelta: `deriveContextualEvidence` recorría `Object.entries(answers)`, así que la evidencia (y con ella la explicabilidad, la procedencia de los hechos y los temas que nombra la narrativa) seguía el orden de inserción; con las mismas respuestas, el orden inverso cambiaba la narrativa en 4.675 de 4.860 rutas y la procedencia de recomendaciones y ofertas en 3.475. Ahora la evidencia sigue el orden canónico del banco: 0 rutas sensibles al orden; rutas, scores, confianza, prioridades y selección de estado general, recomendaciones y ofertas sin cambios.
- Cierre — ayuda de `q2_goal`: «Qué estamos preguntando» pasa a «Lo principal que quieres mejorar ahora mismo.» y «Por qué importa» explica su papel sin hablar de puntos («Tu objetivo nos ayuda a orientar el diagnóstico hacia las áreas más relevantes para lo que quieres mejorar. No determina por sí solo si un área está bien o mal.»). IDs, ruteo, scoring y relevancia sin cambios.
- Cierre — pruebas: determinismo por permutaciones, volver/editar y restauración (`qbv2-session.test.ts` 16/16) y auditoría de lenguaje interno en pistas y ayudas (`diagnostic-flow-ui.test.ts` 11/11); unitarias 841/841; E2E V3 10/10; smoke 5/5 en navegador. JS público: solo el chunk compartido `diagnostic-*.js` (+27 B). `DIAG-QBV1-E2E-SELECTOR-01` sigue abierta. Sin cambio de versión.

## 2026-10-01 — DIAG-V3-10 Overall Digital Presence & Recommendation Engine (solo local, sin deploy; cerrada y congelada en su commit local de cierre)

- DIAG-V3-09 y `PRODUCT.md` cerrados en el commit local `cee6ec9` (`feat(diagnostic): add diagnostic result experience`), tras revalidar unitarias 797/797, typecheck, build, diff-check y QA visual (72 renders, 0 desbordes, 0 errores).
- Nueva capa de decisión sobre el resultado congelado (`qbv2-overall.ts`, `qbv2-recommendations.ts`, `qbv2-solutions.ts`, `qbv2-offerings.ts`): Digital Presence Index con cobertura, contrato mínimo de evidencia y confianza general separada; semáforo «Presencia por fortalecer / en desarrollo / sólida» (0–39 / 40–69 / 70–100) con tope por freno material; recomendaciones por prioridad 08D con procedencia; 19 tipos de solución con 7 reglas de exclusión; catálogo comercial canónico separado con roles (servicio, licencia opcional, addon opcional, licencia requerida) y cadena de prueba.
- Calibración: 12 golden + 4.860 rutas generadas; 0 «sólida» con freno material, 0 nulos como cero, 0 ofertas en recomendaciones por verificar, 0 licencias antes del lanzamiento, 0 resultados con dos licencias, 174 combinaciones de recomendaciones distintas.
- UI: tarjeta «Tu presencia digital» con ranura de icono semántico (marcador geométrico hasta el arte final), plan de acción sin repetir los «por qué», riesgos con procedencia separados de las áreas, «Cómo puede ayudarte Vecidya» al final con «¿Por qué te recomendamos esto?», color contenido en medidores y reglas de impresión (bordes que se recortaban en el límite del área imprimible, fondo gris en la última página y desplegables cerrados en papel, corregidos).
- Los defectos revisados con `perfil=project` (caras emocionales, «Prioridad» junto al porcentaje, 7 dimensiones, «Ya diste el primer paso…», «una consulta pierde valor en horas», aviso de impresión) son del QBV1 publicado; registrados como `DIAG-QBV1-PRESENTATION-01` y no corregidos aquí (cambio público fuera de alcance).
- Calibración final del estado general: el estado se clasifica con la media exacta (`rawScore`; `displayScore` solo se muestra) con límites [0, 40) / [40, 70) / [70, 100]; «Presencia sólida» exige además confianza general media o alta (si no, «en desarrollo» sin bajar el número); explicación propia para el caso sin índice. Cambios golden: `professional_appointments` 39,5 → por fortalecer (se muestra «39 %»: el entero visible se trunca cuando el redondeo cruzaría de banda), `physical_retail` (82) y `nonprofit_community` (79) → en desarrollo por confianza limitada. 4.860 rutas: 588 bajan de sólida por confianza, 0 sólidas con confianza limitada; prioridades, recomendaciones y ofertas idénticas.
- `qbv2-outcome.test.ts` 17/17; `result-ui.test.ts` 16/16 actualizada (porcentaje general y riesgos son contratos nuevos intencionales); unitarias 814/814. Sin cambio de motor, lenguaje, narrativa ni versión. ROADMAP: el frontend adaptativo pasa a DIAG-V3-10B.

## 2026-10-01 — PRODUCT.md (solo documentación; commit `cee6ec9`)

- Nuevo documento canónico `vecidya-platform/PRODUCT.md` (16 de 20), autorizado por el usuario: verdad de producto para el trabajo de diseño con la skill `impeccable` (usuarios, propósito, posicionamiento, contexto de uso, límites, voz, evidencia disponible y ausencias que no se fabrican, principios y accesibilidad). Confirmados por el usuario: mercado (Latinoamérica hispana), posicionamiento (Vecindario + diagnóstico honesto + licencias Cuadra/Barrio/Ciudad, sin CRM paralelo a GHL) y estándar WCAG 2.2 AA. No registra estado de implementación: prevalecen `STATUS.md` y `PROJECT_STATE.md`.
- Se instaló localmente el motor de `impeccable` 0.1.6 (fuera del repositorio, SHA-256 verificado); la descarga con `curl` fallaba por `CRYPT_E_REVOCATION_OFFLINE` de Schannel.
- Detector de `impeccable` sobre DIAG-V3-09: 3 avisos `side-tab` en el bloque `dr-*` (bordes laterales gruesos de la restricción principal y de la ayuda) corregidos con fondos de tokens existentes (`--surface-warm`, `--surface-soft`) y una regla de 1 px; 0 avisos restantes en el bloque. Los 12 avisos restantes de `app.css` son previos y quedan fuera de alcance.

## 2026-10-01 — DIAG-V3-09 Result Experience & UI (solo local, sin deploy; commit `cee6ec9`)

- 08G cerrada en el commit local `4bfc6c9` (`feat(diagnostic): add deterministic result narrative`); la capa de narrativa queda congelada.
- Nueva experiencia de resultado en `app/components/diagnostic-result/`: resumen ejecutivo sin puntaje global, restricción principal y prioridades en el orden del dominio, fortalezas confirmadas frente a señales, áreas para fortalecer, señales cruzadas, las 8 áreas como registro con porcentaje + estado + confianza (lecturas preliminares rayadas), estados sin lectura sin `0%`, evidencia legible plegable, ayuda contextual, incertidumbres y reserva «Cómo se evaluó». Consume solo el `DiagnosticNarrative`.
- Vista previa local `/__dev/diagnostico/resultado/:personaId?` con las 12 golden (solo `react-router dev`; excluida del build). Sin integración pública: `/diagnostico` sigue con QBV1.
- `result-ui.test.ts` 16/16 (render real con `react-dom/server`; el cargador de pruebas compila `.tsx` con el transformador Oxc de Vite, sin dependencias nuevas). Unitarias 797/797. QA visual de las 12 golden en 375/768/1280 px y contenido extremo sin desbordes. Sin cambio de motor, lenguaje, narrativa ni versión.
- ROADMAP: por instrucción del usuario, DIAG-V3-09 pasa a ser la experiencia de resultado y el frontend adaptativo se renumera como DIAG-V3-10.

## 2026-10-01 — DIAG-V3-08G Natural Narrative & Result Interpretation (solo local, sin deploy; commit `4bfc6c9`)

- 08F + 08F.1 cerradas en el commit local `da24dee` (`feat(diagnostic): finalize language and answer semantics`); capa de lenguaje congelada.
- Nueva capa `qbv2-narrative.ts` + `qbv2-narrative-phrases.ts`: resultado estructurado y determinista (resumen ejecutivo, estado actual, fortalezas, debilidades/parciales, restricción principal, prioridades 08D con su porqué, contradicciones, incertidumbres, 8 dimensiones y siguiente foco) con procedencia por bloque.
- Consume los Semantic Facts sin recalcular; certeza de 08F; terminología y continuidad de etapa congeladas; pre-lanzamiento descrito como preparación; sin IA en tiempo de ejecución, sin marcado de UI ni recomendaciones tácticas.
- `qbv2-narrative.test.ts` 14/14 (incluye 972 rutas generadas); barrido de 3.240 rutas sin incidencias; unitarias 781/781. Sin cambio de motor, lenguaje ni versión.

## 2026-10-01 — DIAG-V3-08F.1 Answer Scale Closure & Language Freeze (solo local, sin deploy; commit `da24dee`)

- `q2_reputation_flow` pasa a la versión 2 con el nivel intermedio `occasional` («De vez en cuando, pero no de forma constante», partial); `steady` y `rare` conservan su significado y estado.
- `q2_ecommerce_traffic_sources` pasa a la versión 2: `marketplace`, `email`, `direct` y `other` (distinta de `unknown`). Nombrar una fuente apoya Medición sin probarla; correo y visitas directas no cuentan como diversidad de Descubrimiento.
- `QuestionVersionV2 = 1 | 2` en el contrato QBV2 (QBV1 conserva solo la versión 1). Pista y ayuda de ambas preguntas actualizadas.
- Sin cambios de ruta, scoring, prioridades ni hechos en las 12 personas golden ni en 3.240 rutas generadas; huella fuera de las dos preguntas idéntica a `0bd6a73`. `DIAG-V3-08F-ANSWER-SCALE-001` resuelta.
- Capa de lenguaje congelada. `qbv2-answer-scale.test.ts` 9/9; unitarias 767/767. Sin cambio de versión.

## 2026-10-01 — DIAG-V3-08F Language, Terminology & Question Semantics Audit (solo local, sin deploy; commit `da24dee`)

- Motor congelado antes de la auditoría: 08E.1 + 08E.2 + 08E.3 en el commit local `0bd6a73` (`feat(diagnostic): finalize adaptive diagnostic engine`), sin push ni deploy.
- Modelo de terminología (`qbv2-terminology.ts`): 13 perfiles de lenguaje × 10 roles de ciclo de vida, con términos a evitar por perfil. «Pacientes» pasa de todo `health_wellness` (incluía gimnasios y spas) a la práctica clínica con licencia.
- Render determinista (`qbv2-copy.ts`) con variantes por perfil (`terminology`) y etiquetas visibles por opción (`optionLabels`); `helper` pasa a `hint` (pista breve, sin referencias internas); `helpIntent.why` completa la ayuda «qué/cómo/por qué».
- Auditoría de las 85 preguntas (`qbv2-language.ts`): keep 28, copy 31, variante de contexto 13, opciones 7, desalineación semántica 1, ayuda 5. Corregidos: sujeto de `q2_entity`, `q2_ecommerce_traffic_sources` («principalmente» frente a la lectura por número de fuentes), opciones solapadas de `q2_appointments_booking_method` y `q2_measurement_outcome_tracking`, opciones de `q2_presence_offer_clarity` incompatibles con su variante nonprofit, una nota interna visible en `q2_appointments_rebooking`, una pista que contradecía la semántica en `q2_professional_referral_dependency`, lenguaje comercial en preguntas de organizaciones y presupuestos de clientes antes del lanzamiento.
- Valores, tipos, señales, reglas y `ANSWER_SEMANTICS` sin cambios (huella idéntica a `0bd6a73`). Dos refinamientos de escala diferidos: `DIAG-V3-08F-ANSWER-SCALE-001`.
- Contrato de lenguaje de resultados para 08G (sin prosa final): tres certezas, ocho categorías, frases prohibidas por tono y continuidad de etapa pregunta → evidencia → resultado.
- Banco 85, 22 módulos. Sin UI, persistencia, schema, PDF, analytics ni cambio de versión. `qbv2-language.test.ts` 13/13; unitarias 758/758.

## 2026-10-01 — DIAG-V3-08E.3 Goal Taxonomy Alignment & Final Engine Freeze (solo local, sin deploy; commit `0bd6a73`)

- `q2_goal` expone las 8 metas del motor: `be_found`, `opportunities`, `explain`, `trust`, `stop_losing`, `organize`, `automate`, `measure` + `unsure`; copy basado en QBV1 e intención por opción en `helpIntent`. Banco 85 y 22 módulos sin cambios.
- La necesidad material de una meta apunta a su primera dimensión relevante aplicable; seguimiento genérico y conversión genérica describen dónde aplican (negocio con clientes) para que `stop_losing` tenga camino de evidencia.
- `organize` y `automate` resultan indistinguibles en el motor actual (misma relevancia); se conservan sin fusionar.
- Golden: idea, independent_professional y operations_heavy resuelven su meta real (`explain`, `trust`, `organize`); b2b deja de usar una monetización inexistente. Rutas y scores golden sin cambios; operations_heavy reordena Relación antes que Confianza.
- Simulación: 3.240 rutas (etapa × entrega + nonprofit × 9 respuestas de meta × fricción × 2 políticas): 0 huecos materiales solo por presupuesto, 0 `unobservable_in_context`; mín 15, mediana 18, p75 19, p90 21, p95 21, máx 24; ≥ 21 en 12,5 %, 23–24 en 1,0 %; pre-lanzamiento mediana 16, máx 18.
- Sin UI, persistencia, schema, PDF, analytics ni cambio de versión.

## 2026-10-01 — DIAG-V3-08E.2 Route Completeness & Final Engine Stabilization (solo local, sin deploy; commit `0bd6a73`)

- Presupuesto: ruta base 18 (sin cambios), extensión material 19–20, reserva de completitud 21–24; hard cap 20 → 24. Solo evidencia material pasa de la base.
- Ciclo de vida: 41 preguntas operativas excluidas en pre-lanzamiento declarado (`notEqV2("q2_has_customers", "no")`); los alcances materiales exigen clientes confirmados.
- Necesidad material: prerrequisitos solo si bloquean una prioridad principal/secundaria débil o la dimensión de meta/fricción; `capacity_gate` al final; respuestas sin capacidad (`not_applicable`/`constraint`) no cuentan como observación. Rutas sin nada que seleccionar terminan.
- Simulación (1.440 rutas): 0 huecos solo por presupuesto (antes 181/1.296); mediana 18, p90 21, máx 24; ≥ 21 en 15,3 %. Pre-lanzamiento: mediana 16, máx 18.
- Golden: 4 personas usan 21–22 preguntas; resultados numéricos 48 → 51; `insufficient_evidence` 3 → 0; `verify_first` primario sigue en 1 (idea).
- `helpIntent` en las 26 preguntas que el planner puede enrutar como evidencia material. Banco 85 y 22 módulos sin cambios.
- Hallazgo: `q2_goal` solo exponía 3 de las 8 metas del motor (resuelto en DIAG-V3-08E.3).
- Sin UI, persistencia, schema, PDF, analytics ni cambio de versión.

## 2026-09-30 — DIAG-V3-08E.1 Final Evidence Completion (solo local, sin deploy; commit `0bd6a73`)

- DIAG-V3-08E cerrada en el commit local `d927f39` (sin push ni deploy).
- Auditoría parametrizada de 1.296 rutas alcanzables: Clarity y Digital Foundation eran huecos reales del banco; Trust y Readiness, huecos de enrutamiento.
- Banco 83 → 85: `q2_presence_offer_clarity` y `q2_presence_digital_base` (módulo `presence`, material-only). `materialAppliesWhen` de confianza, readiness y descubrimiento local describe aplicabilidad; el planner decide cuándo.
- Planner: las respuestas material-only no consumen el cap base; `material_not_needed` no bloquea la finalización. Secuencia 08D: un prerrequisito solo pasa delante con evidencia al menos tan cierta como la del dependiente.
- Golden: `unobservable_in_context` 12 → 0; resultados numéricos 38 → 48 (44,8 % nulos aplicables); `verify_first` primario sigue en 1 (idea). Simulación: mediana 19, p90 20, máx 20; ninguna ruta > 20.
- Conflicto de presupuesto (181/1.296 rutas, 3/12 golden, prerrequisito sin verificar por el cap 20): resuelto en DIAG-V3-08E.2.
- Sin UI, persistencia, schema, PDF, analytics ni cambio de versión.

## 2026-09-30 — DIAG-V3-08E Semantic Diagnostic Facts foundation (solo local, sin deploy; commit `d927f39`)

- DIAG-V3-08D.1 cerrada en el commit local `a96ce99` (sin push ni deploy) con una política de prioridad: una fricción declarada con evidencia no se desplaza por un prerrequisito de relevancia heredada salvo bloqueo explícito. El motor diagnóstico queda congelado.
- Añadida la capa pura `qbv2-semantic-facts.ts`: 9 tipos de hecho con procedencia, contexto separado, certeza de lectura por banda + confianza + contradicciones, contradicciones explícitas (incluida fricción declarada no observada), cinco clases de gap y orden por bandas guiado por las prioridades 08D.
- Golden 12: conjuntos de hechos distintos para las 12 personas, 3–11 hechos cada una; sin recalcular scoring ni prioridades.
- Sin prosa, recomendaciones, UI, persistencia, schema, PDF, analytics ni cambio de versión.

## 2026-09-30 — DIAG-V3-08D.1 Targeted Evidence Enrichment (solo local, sin deploy; commit `a96ce99`)

- DIAG-V3-08D cerrada y aprobada en el commit local `bfe97fb` (sin push ni deploy).
- Planner: `ROUTE_HARD_CAP` 20 con `materialEvidenceReserve` 2. La ruta base conserva sus reglas y el cap 18; una cola añade evidencia directa solo para necesidades materiales abiertas (fricción declarada ×2, meta ×1, prerrequisito de restricción relevante ×1).
- Contrato: `materialAppliesWhen` (elegible solo como evidencia material, nunca en la ruta base) y `helpIntent` opcional. Nuevo módulo cross-cutting `conversion`.
- Banco 80 → 83: `q2_conversion_interest_to_action`, `q2_operations_information_base`, `q2_operations_automation_adoption`, cada una justificada por una capacidad sin observación directa posible en el banco anterior.
- Gates corregidos: descubrimiento local para local_service/appointments y confianza para cualquier archetype cuando se declaran (material-only); preguntas de tráfico/abandono/dependencia ecommerce exigen clientes existentes.
- Fixture golden: la ejecución dejaba sin responder la última pregunta seleccionada en 11/12 personas; ahora responde cada lote completo.
- Golden 12: `verify_first` primario 9 → 1 (idea pre-lanzamiento, incertidumbre legítima); 38 resultados numéricos (antes 29), 56,3 % aplicables nulos (antes 66,3 %), 13 resultados en 100 (antes 16). Rutas 17–19 (antes 16–17).
- Política de prioridad: una fricción declarada con evidencia no se desplaza por un prerrequisito de relevancia heredada solo por menor score; el prerrequisito pasa delante solo si bloquea esa dimensión. En professional_appointments, follow-up (33) vuelve a primaria y Trust (25) queda secundaria, antes de la conversión que bloquea.
- Scoring 08C sin cambios. Sin UI, persistencia, schema, PDF, analytics ni cambio de versión.

## 2026-09-30 — DIAG-V3-08D Constraints & Priorities foundation (solo local, sin deploy; commit `bfe97fb`)

- DIAG-V3-08C cerrada y aprobada en el commit local `51a7230` (sin push ni deploy).
- Añadido el motor puro `qbv2-priorities.ts`: taxonomía de 10 restricciones, grafo acíclico de dependencias entre dimensiones (`enables`, `sustains`, `feeds`, `informs`), relevancia por goal/friction/etapa y hasta tres prioridades ordenadas con certeza `actionable`/`likely`/`verify_first`.
- La prioridad no es el score más bajo: prerrequisitos, cuellos de botella activos y compuertas de capacidad pasan delante; una capacidad muy débil pero irrelevante no ocupa el primer lugar. `null` se trata como gap de evidencia, nunca como debilidad.
- Golden 12: 1 prioridad primaria con evidencia (follow-up en professional_appointments), 9 de verificación (`verify_first`) y 2 sin restricciones relevantes. Las rutas golden casi nunca recogen evidencia directa débil sobre la dimensión de su goal/fricción; queda registrado como observación de producto.
- Sin cambios de scoring, planner, banco, UI, persistencia, schema, PDF ni analytics. Sin cambio de versión.

## 2026-09-30 — DIAG-V3-08B.7 Coverage Gap Resolution (solo local, sin deploy)

- Resueltos los gaps de `measurement_optimization` y ecommerce → `digital_foundation` reutilizando evidencia de preguntas existentes; no se añadieron preguntas productivas ni se modificó el planner.
- La cobertura ahora considera respuestas activas y preguntas seleccionadas, preservando rutas adaptativas de 15–16 preguntas y el hard cap de 18. Sin scoring, porcentajes, pesos ni confidence.

## 2026-09-30 — DIAG-V3-08C Contextual Scoring V3 foundation (solo local, sin deploy)

- Añadido el motor puro `qbv2-contextual-scoring.ts`: ocho resultados dimensionales con observaciones por pregunta/dimensión, applicability, score, confidence y explainability. Sin score global.
- Scoring reconstruido alrededor del planner adaptativo: se retiró el umbral universal (2 directas, 3 en medición) y el audit set-cover/evidence-budget dejó de ser requisito. Una dimensión con evidencia directa produce score aunque tenga una sola observación; la confianza refleja esa limitación.
- Modelo declarativo: `ANSWER_SEMANTICS` (estado por valor para las 58 preguntas con dimensión, validado sin fallback), `CAPABILITY_CONTRIBUTION`, `SCORING_MODEL` (supporting ≤ mitad del peso directo) y `CONFIDENCE_MODEL` (fuerza de evidencia con penalización por contradicción directa y `unknown`). Solo supporting o sin evidencia → `null`.
- Corregido: el mapeo genérico anterior asignaba `partial` a valores no listados (p. ej. `consistent`, `well_diversified`, `defined_consult`, `maps_search`), puntuando la mejor respuesta como 50.
- Etapa `idea`: Trust/Relationship/Measurement no aplican aunque un módulo haya preguntado; la evidencia permanece en explainability.
- Matriz golden 12 × 8 con la ruta real: 86 celdas aplicables, 29 numéricas, 57 `null` (66,3 %; antes 87/4/83, 95,4 %). 42 nulls no tienen ninguna observación en la ruta y 15 solo tienen evidencia supporting.
- No se modificaron banco, planner, hard cap, contradicciones, dimensiones, maturity, persistencia, schema, UI, PDF ni analytics. Sin cambio de versión, commit, push o deploy.

## 2026-09-30 — DIAG-V3-08B.6R Compact Coverage & Diagnostic State Foundation (solo local, sin deploy)

- Añadidos `MATURITY_MODEL`, `DIGITAL_DIMENSIONS` y `EVIDENCE_MAPPING` en `qbv2-coverage.ts`, con trazabilidad declarativa para las 80 preguntas productivas sin pesos ni porcentajes.
- Añadidas 12 golden personas y análisis de cobertura determinista sobre la ruta adaptativa existente, incluida una matriz generada de 2.400 combinaciones y clasificación explícita de cobertura confirmada, gaps confirmados y mejoras posibles.
- No se modificaron preguntas, planner, contradicciones, scoring, UI, persistencia, schema, auth, analytics ni versión pública. DIAG-V3-08C queda como siguiente fase, no iniciada.

## 2026-09-29 — DIAG-V3-08B.5 Contradictions & Confirmation V1 (solo local, sin deploy)

- Implementados `ContradictionRuleV1`, `CONTRADICTION_RULES_VERSION=1`, validación del registry, detección desde evidencia activa, materialidad `material`/`soft`, orden determinista y triggers explícitos de confirmation. El planner consume reserve 2 solo por triggers materiales y mantiene hard cap 18, máximo 2 confirmations, invalidación upstream, respuestas originales inmutables y recomputación para save/resume.
- El registry V1 contiene 2 reglas: 1 material confirmable y 1 soft trace-only. `q2_confirm_primary_friction` y `q2_confirm_hybrid_friction` permanecen fixture-only; production bank continúa en 80 preguntas y confirmation count productivo = 0. No se declaran confirmations para usuarios.
- Validación local final: `pnpm run test:unit` **692/692 PASS**, contradiction suite **16/16 PASS**, `pnpm run typecheck` PASS, `pnpm run build` PASS y `git diff --check` PASS; sin D1/KV, migraciones ni deploy.

## 2026-09-29 — DIAG-V3-08B.4 Adaptive Planner (solo local, sin deploy)

- Implementado `AdaptivePlannerVersion=1` determinista para QBV2 inactivo: `RouteBudgetV1` con target 10–16, hard cap acumulativo 18 y confirmation reserve 2; `buildQuestionPlan`, `planNextQuestion`, completion status, trace y skip reasons.
- La selección prioriza contexto esencial, routing, goal/friction, componentes especializados y cross-cutting relevante; recalcula desde respuestas activas, cuenta evidencia previa por componente y evita duplicar shared evidence. Professional+appointments, retail+ecommerce y creator+ecommerce tienen fairness acumulativa.
- Resultado final: peor caso **23 elegibles → 11 nuevas → ruta total 16**; 17 fixtures y 20 personas dinámicas permanecen ≤18. `DIAG-V3-08B3-ROUTE-BUDGET-001` queda **RESUELTA por 08B.4**.
- Validación histórica de 08B.4: **674/674 tests PASS**, planner específico 12/12, typecheck PASS, build PASS y diff-check PASS. QBV2 sigue inactive (`CURRENT_QUESTION_BANK_VERSION=1`); sin D1, KV ni deploy. Route-signature design queda preparado documentalmente sin modificar analytics QBV1.

## 2026-09-29 — DIAG-V3-08B.3 Lote F: cierre de contenido QBV2 (solo local, sin deploy)

- **6 preguntas nuevas** en `startup` (`qbv2-lote-f.ts`): claridad problema/público, aprendizaje sobre el problema, oferta lista para probar, demanda observable, canal inicial y próximo hito. Solo para `EntityType=project` con `GrowthStage=idea|starting`; sin exigir empresa, web, marca o CRM. Banco final: **80 preguntas productivas** + 1 `confirmation` golden fixture-only (secondary monetization aún no producible).
- **Gap analysis cerrado con evidencia**: startup/project era el hueco real; mobile no-food, manufacturing/wholesale y two-sided marketplace quedan representados mediante nichos existentes (`local_service`/`b2b`/`ecommerce`) sin nuevos `NicheGroup` ni archetypes.
- Auditorías de reachability, duplicados, variants, unknown/N/A, friction allowlist, scoring-readiness y guard de secondary monetization protegidas por tests. `DIAG-V3-08B3-ROUTE-BUDGET-001` permanece abierta para 08B.4; no se implementó planner ni selection logic. QBV2 continúa inactivo (`CURRENT_QUESTION_BANK_VERSION=1`).
- `pnpm run test:unit`: **657/657 PASS**. Sin D1, KV, UI ni deploy.

## 2026-09-28 — DIAG-V3-08B.3 Lote E: operations/follow_up/measurement (EN PROGRESO, solo local, sin deploy)

- **11 preguntas nuevas** (`qbv2-lote-e.ts`): `operations` (process ownership, handoffs, bottleneck, manual impact, dependencia de una sola persona), `follow_up` (proceso general, ownership, frecuencia de repaso proactivo de pendientes), `measurement` (confianza en el origen de los números, seguimiento de resultado concreto, frecuencia de revisión comparativa). Banco combinado: **75 preguntas** (64 de A+B+C+D + 11 de Lote E).
- **Cross-cutting por diseño, no por archetype**: a diferencia de Lote B/C/D, `operations`/`follow_up` se gatean por `contextEquals("primaryFriction", X)` y `measurement` por `contextEquals("primaryGoal", "measure")` + `q2_has_customers="yes"` — aplican sobre cualquier sector/archetype/businessModel, porque el gate real es la fricción o el objetivo autodeclarado, no el tipo de negocio.
- **Auditoría de duplicados explícita antes de escribir contenido nuevo** (documentada en el header de `qbv2-lote-e.ts`): `q2_process_systemization` (Lote A) mide sistematización de procesos en general, no ownership/handoffs específicos; `q2_b2b_status_visibility` (Lote D) mide confianza puntual en el estado del pipeline B2B, distinto de una frecuencia de repaso proactivo aplicable a cualquier negocio; preguntas de follow-up por archetype (`q2_service_quote_followup`, `q2_appointments_confirmation_reminders`, `q2_ecommerce_cart_followup`, etc.) miden un seguimiento específico de un momento del flujo, no un proceso general de seguimiento.
- **Fresh domain review (agente independiente, sin contexto del diseño) encontró 1 blocker real**: `q2_followup_status_visibility`, tal como se escribió inicialmente, era casi un duplicado literal (prompt y las 4 opciones) de `q2_b2b_status_visibility`. Corregido rediseñando la pregunta por completo hacia un concepto distinto — frecuencia de repaso activo de pendientes ("¿con qué frecuencia repasas...?") con un set de opciones nuevo (regularly/only_when_remember/rarely/unknown), en vez de confianza puntual en el estado actual. Verificado con test que compara los conjuntos de valores de opción de ambas preguntas y confirma que ya no coinciden. Más 3 should-fix menores, todos corregidos: `q2_operations_handoffs` ahora condiciona explícitamente la existencia de más de una persona en el flujo (antes la presuponía como hecho, inconsistente con su par `q2_followup_ownership`); `q2_measurement_decision_review` precisado hacia "tus números o resultados" en vez de la vaga "cómo te está yendo"; `q2_measurement_outcome_tracking` recorta su lista de ejemplos de 5 a 3.
- **Fresh code review (agente independiente) sin blockers**: 1 should-fix (faltaba un test directo de elegibilidad para `q2_measurement_decision_review`, solo cubierta indirectamente por una regla compartida), corregido.
- **Bug de test no relacionado, encontrado y corregido de paso**: `qbv2-lote-b.test.ts` usaba `q.id.includes("review")` para verificar unicidad de la pregunta de reputación — demasiado amplio, empezó a falso-positivar contra el nuevo `q2_measurement_decision_review`. Cambiado a `"resena"` (sin coincidencias, inofensivo).
- **Route pressure recomputada tras los fixes de la revisión fresca** (`DIAG-V3-08B3-ROUTE-BUDGET-001`, actualizada en `STATUS.md` Open Debt): 8 fundación + hasta 7 especializado bajo hybrid + hasta 8 cross-cutting = **23 elegibles en el peor caso combinado**. Verificado explícitamente que las correcciones de contenido de la revisión fresca no alteraron ninguna regla `appliesWhen`/`produces` (solo `prompt`/`options[].label`) y que ninguna otra pregunta del banco depende de la respuesta de `q2_followup_status_visibility` — la aritmética de presión previa a los fixes sigue siendo válida.
- **Sin señales nuevas** (0 productores nuevos: todas las 11 preguntas reutilizan campos de señal ya existentes o no producen señal estructurada, solo friction/diagnóstico puro). **Fricción solo sobre hechos ya allowlisted**, sin categoría nueva de `PrimaryFriction`.
- **`test:unit`: 651/651** (30 nuevas sobre las 621 de Lote D C1): banco combinado pasa los 9 validadores estáticos con 0 issues; sin IDs duplicados; sin gating por sector/nicho; sin herramientas/proveedores ni jerga de marketing (mutación G bank-wide sigue en verde); 10 fixtures foundation/specialized/cross-cutting sin usar profesión como regla de routing. `typecheck`/`build`/`git diff --check` PASS. Sin push todavía (pendiente de autorización explícita), sin cerrar DIAG-V3-08B.3. **No se inicia Lote F.**

## 2026-09-28 — DIAG-V3-08B.3 Lote D C1: nonprofit wording, businessModel hybrid decision, fresh reviews (aprueba Lote D, solo local, sin deploy)

- **`q2_customer_buyer` (Lote A) corregido para nonprofit.** `CopyVariantTarget` (`qbv2-contract.ts`) ampliado con `businessModel` — metadata puramente declarativa, sin romper ningún consumidor (QBV2 no tiene todavía ningún renderer que consulte `variants`). Nuevo variant `{ businessModel: "nonprofit" }` cambia el `prompt` a "¿Con quién se relaciona principalmente tu organización?". El fresh domain review encontró que el prompt-variant NO bastaba solo: la opción `b2c` seguía diciendo "Personas, como consumidor final" (lenguaje comercial) y sonaba fuera de lugar bajo el nuevo prompt. Corregido el label BASE (no un variant por opción, que el contrato actual no soporta) a "Personas individuales" — universal para cualquier `businessModel`. `options`/`produces`/`OptionId` intactos: `customerBuyer` sigue resolviendo exactamente b2c/b2b/mixed.
- **`DIAG-V3-08B3-BUSINESSMODEL-HYBRID-001` investigado con caso reproducible, no aceptado como "deuda futura" sin explicar el comportamiento.** Confirmado: `businessModel` SÍ colapsa a `"hybrid"` con dos `monetizationMechanism` independientes (p. ej. `mission_funded` + `goods_for_resale`), perdiendo el valor exacto `"nonprofit"` del campo estructurado (el `resolutionReason` del trace sí sigue nombrando ambos componentes en texto). **Decisión: DEFER WITH PROOF**, no FIX NOW — verificado explícitamente que `q2_monetization` es de opción única y que NINGUNA pregunta del banco completo produce jamás un mecanismo de monetización secundario, así que este colapso es hoy inalcanzable desde cualquier respuesta real. Nuevo test de gate en `qbv2-architecture.test.ts` que fuerza implementar `businessModelComponents`/`businessModelIncludes` (mismo patrón que `archetypeComponents`/`archetypeIncludes`) ANTES de que una pregunta futura produzca ese segundo mecanismo — no basta con corregir el test si empieza a fallar.
- **Fresh domain review (agente independiente, sin contexto del diseño) sobre B2B/creator/nonprofit**: 1 blocker (la opción `b2c` de `q2_customer_buyer`, corregido arriba) + 3 should-fix menores de anglicismos innecesarios en labels (`"Alianzas o partners"`→`"Alianzas"`, `"Yo los busco activamente (prospección)"`→sin el paréntesis, `"Fondos o subvenciones (grants)"`→sin el paréntesis), todos corregidos. Confirmó: sin vanity metrics en creator, sin lenguaje comercial en nonprofit fuera de lo ya corregido, wording de B2B/decision-makers/referrals neutral.
- **Fresh code review (agente independiente) sobre Lote D + estos cambios**: sin blockers. Confirmó que las cadenas `inV2` de `q2_nonprofit_donation_clarity`/`membership_lifecycle` no repiten el bug de `notEqV2` de Lote B (una respuesta ausente no satisface `in`); que `CopyVariantTarget` es puramente aditivo (ningún switch/exhaustividad lo consume); y que los guard tests de `businessModel` hybrid son gates reales (pinnean el mecanismo — `type: "single"` + ausencia de `slot: "secondary"` — no solo la ausencia actual).
- **Mutación C (Lote D) citada por nombre exacto**: reutiliza la mutación G bank-wide de `qbv2-architecture.test.ts` (no un "cubierto en otra parte" vago) — comentario añadido en `qbv2-lote-d.test.ts`.
- **Sin cambios en `MODULE_REGISTRY` ni en el banco de preguntas** (64 preguntas sin cambios; 3 labels corregidos, no preguntas nuevas). `test:unit` 621/621 (4 nuevas: label b2c, gate de businessModel-hybrid, reproducción de businessModel=hybrid, variant de q2_customer_buyer), `typecheck`/`build`/`git diff --check` PASS. **Lote D queda APROBADO** — push autorizado de `9aeb357` + este commit.

## 2026-09-28 — DIAG-V3-08B.3 Lote D: B2B/creator/nonprofit (EN PROGRESO, solo local, sin deploy)

- **14 preguntas nuevas** (`qbv2-lote-d.ts`): `b2b` (lead source, qualification, status visibility, sales cycle, decision makers — más `q2_b2b_pipeline` de golden, auditada: REUSE, mide visibilidad real, no CRM específico), `creator` (channel concentration, audience ownership, content consistency, monetization model, conversion), `nonprofit` (support type — gate para donation_clarity/membership_lifecycle encadenadas —, participation). Banco combinado: **64 preguntas** (50 de A+B+C + 14 de Lote D).
- **`nonprofit` gateado por `businessModel`, no por archetype** (§27 del checkpoint): `contextEquals("businessModel", "nonprofit")`, consistente con `MODULE_REGISTRY.relevantWhen` ya declarado desde 08B.2.
- **Fixtures reales `creator+ecommerce` y `creator+professional` hybrid**: ambas familias completas quedan elegibles, extendiendo la cobertura de `archetypeComponents`/`archetypeIncludes` (Lote B C1) a un tercer y cuarto par de archetypes.
- **Dos hallazgos de auditoría, documentados como deuda, NO corregidos en este lote** (`STATUS.md` Open Debt): `DIAG-V3-08B3-BUSINESSMODEL-HYBRID-001` (paralelo al bloqueante de `archetype: hybrid` — si `businessModel` resolviera `"hybrid"`, `nonprofit` perdería elegibilidad igual que `professional`/`appointments` antes de C1; no corregido, caso más raro que `retail+ecommerce` y no pedido explícitamente); `DIAG-V3-08B3-CUSTOMERBUYER-NONPROFIT-WORDING-001` (el eje `CustomerBuyer` sigue siendo generalizable a donante individual vs. fundación, pero el wording de `q2_customer_buyer` de Lote A usa lenguaje comercial que no encaja bien mostrado a un nonprofit; `CopyVariantTarget` no admite hoy un variant por `businessModel` para arreglarlo sin ampliar el contrato).
- **Auditoría de `PrimaryGoal` (§25/§40): sin gap demostrado.** Los 8 valores actuales son lo bastante abstractos para nonprofit sin forzar lenguaje de venta; no se añade ningún valor nuevo. Verificado con test que confirma que ningún valor tipo "sell_more" existe ni hace falta.
- **Fricción solo sobre 3 hechos severos/inequívocos** (`q2_b2b_qualification.no`→conversion, `q2_b2b_status_visibility.lose_track`→operations, `q2_nonprofit_donation_clarity.no`→conversion), allowlisted explícitamente. Ninguna pregunta de `creator` produce friction (audiencia concentrada en una plataforma no se interpreta automáticamente como `scale`); `q2_b2b_lead_source` (incluye la opción "referrals") no produce ninguna señal — depender de referidos no se clasifica automáticamente como bueno ni malo.
- **`reputation` NO se extiende a `b2b`/`creator`/`nonprofit`** (§31): la evidencia de confianza en B2B es referidos/casos de estudio, no "reseñas"; no se extiende por simetría sin evidencia.
- **Sin cambios de arquitectura fuera de lo descrito** (los dos hallazgos de auditoría quedan como deuda, no como cambio de código). `test:unit` 617/617 (29 nuevas), `typecheck`/`build`/`git diff --check` PASS. Sin push todavía (pendiente de autorización explícita), sin cerrar DIAG-V3-08B.3.

## 2026-09-28 — DIAG-V3-08B.3 Lote C: retail/ecommerce/hospitality (EN PROGRESO, solo local, sin deploy)

- **13 preguntas nuevas** (`qbv2-lote-c.ts`): `retail` (product visibility, customer capture, promotions), `ecommerce` (product discovery, checkout friction, cart visibility/follow-up encadenados, repeat purchase con `not_applicable` legítimo, dependencia de canal de adquisición — más `q2_ecommerce_traffic_sources` de golden, auditada y conservada), `hospitality` (flow type reservation/walk-in/order-ahead, no-show de reserva encadenado y DELIBERADAMENTE distinto de `q2_appointments_noshow`, capacidad pico, entrega/para-llevar). Banco combinado: **50 preguntas** (37 de A+B + 13 de Lote C).
- **Reuso explícito en vez de duplicación** (§9/§17/§21 del checkpoint): `q2_local_discovery`, `q2_local_presence_consistency`, `q2_local_repeat_customers` y `q2_reputation_flow` (Lote B) extendidas a `retail`/`hospitality` (descubrimiento, consistencia de presencia, recurrencia y reputación son el MISMO concepto sin importar inventario de reventa o consumo en el lugar); `q2_local_foot_traffic` (golden) extendida a `retail`. Sin crear `q2_retail_discovery`/`q2_retail_repeat_purchase`/`q2_hospitality_repeat_visits`/etc. casi idénticas.
- **Hospitality-reserva ≠ appointments, a propósito** (§19/§24): una reserva de mesa/hospedaje usa `deliveryMode: onsite_consumption` (archetype `hospitality`), nunca `scheduled_time_blocks` (archetype `appointments`) — mecanismos operativos distintos aunque el patrón de no-show se parezca. Verificado con test explícito.
- **Fixture real `retail+ecommerce` hybrid**: con contenido real (no solo `deliveryMode` desnudo como en C1), confirma que ambas familias completas quedan elegibles bajo `archetype: hybrid`.
- **`DIAG-V3-08B0-FRICTION-RETENTION-001` RESUELTA** con la evidencia de Lote B+C: retención/postventa permanece dentro de `follow_up`/`operations` existentes — ninguna de las ~9 preguntas de repeat/seguimiento post-interacción produce una fricción causalmente distinta; crear una 7ª categoría diluiría el modelo en vez de afinarlo. Sin cambios en `PRIMARY_FRICTIONS`/taxonomy/resolver.
- **Fricción solo sobre 3 hechos severos/inequívocos** en Lote C (`q2_ecommerce_checkout_friction.often`→conversion, `q2_ecommerce_cart_followup.rarely`→follow_up, `q2_hospitality_reservation_noshow.often`→operations), allowlisted explícitamente en test. `q2_ecommerce_cart_visibility` (solo detecta SI puede identificar carritos abandonados) nunca produce friction por sí sola.
- **`retail`/`hospitality` quedan con menos preguntas PROPIAS de lo que sugeriría `MODULE_REGISTRY` en aislamiento** (`retail`: 3 propias, target 5-8; `hospitality`: 4 propias, target 5-8) precisamente porque reutilizan preguntas compartidas de Lote B/golden en vez de duplicarlas — `retail` reutiliza **5** (`q2_local_discovery`, `q2_local_presence_consistency`, `q2_local_repeat_customers`, `q2_reputation_flow`, `q2_local_foot_traffic`), `hospitality` reutiliza **4** (las mismas cuatro salvo `foot_traffic`, que no se extendió a hospitality por ser redundante con `q2_hospitality_flow_type`). Cobertura EFECTIVA (propias+compartidas, corregido en C1 de Lote C — la primera cuenta de `retail` había omitido `foot_traffic` de la suma): `retail` 3+5=**8**, `hospitality` 4+4=**8**, ambos dentro de su target 5-8. `ecommerce`: 7 (6 nuevas + 1 golden), dentro de 6-10. Reportado, sin cambiar `MODULE_REGISTRY`.
- **Sin cambios de arquitectura fuera de las extensiones de applicability descritas.** `test:unit` 587/587 (31 nuevas), `typecheck`/`build`/`git diff --check` PASS. Sin push todavía (pendiente de autorización explícita), sin cerrar DIAG-V3-08B.3.

## 2026-09-28 — DIAG-V3-08B.3 Lote B C2: reconciliación de MODULE_REGISTRY tras `reputation` (aprueba Lote B, solo local, sin deploy)

- **Micro-cierre antes del push del Lote B/C1:** al añadir el módulo cross-cutting `reputation` (C1), `MODULE_IDS` dejó de tener 19 módulos. Auditado: ahora son **20**. `docs/ARCHITECTURE.md` actualizado para dejar de afirmar "19 módulos" como estado actual (las menciones a "19" en entradas fechadas de este mismo `CHANGELOG.md`/`STATUS.md` quedan intactas como historia real de 08B.2/C1, no se reescribe el pasado).
- **Forecast recalculado** (dinámicamente, nunca hardcodeado): module floor 76→**77**, techo razonable 123→**126** tras `reputation` (target 1-3). El target editorial (100-120) sigue sin tocarse — 120 ≤ 126 sigue cumpliendo la coherencia `moduleFloor <= target.min <= target.max <= moduleCeiling`.
- **`reputation` metadata confirmada coherente, sin rango artificial**: `purpose` describe su rol compartido real; `relevantWhen.archetypes: [local, appointments, professional]` coincide exactamente con el `appliesWhen` real de `q2_reputation_flow`; `targetQuestionRange: {min:1, max:3}` refleja 1 pregunta compartida real hoy, con margen para que Lote C sume reputación de `retail`/`ecommerce`/`hospitality` a la MISMA pregunta/módulo en vez de duplicar.
- **Test nuevo** que fija `MODULE_IDS.length === 20` y valida la metadata de `reputation`, para que un futuro módulo silencioso no vuelva a desalinear el conteo documentado.
- **Sin cambios de contenido ni de arquitectura fuera de esto.** `test:unit` 556/556 (1 nueva), `typecheck`/`build`/`git diff --check` PASS. **Lote B queda APROBADO** con este micro-cierre; autoriza el push de `bbe1bb1`/`07ffcb2`/este commit.

## 2026-09-28 — DIAG-V3-08B.3 Lote B C1: composición de archetypes híbridos (EN PROGRESO, solo local, sin deploy)

- **Bloqueante arquitectónico real corregido:** `archetype: "hybrid"` (dos mecanismos de entrega independientes, p. ej. `professional` + `appointments`) hacía que NINGUNA pregunta gateada con `contextEquals("archetype", "professional")` ni `contextEquals("archetype", "appointments")` volviera a ser elegible — el negocio perdía AMBAS familias de preguntas especializadas. Se habría repetido con `retail` + `ecommerce` en Lote C.
- **`archetypeComponents`** (nuevo campo en `DiagnosticContextV3`, `contracts.ts`): componentes reales de `archetype` — `[valor]` cuando no es hybrid, los ≥2 mecanismos reales cuando sí lo es (nunca `"hybrid"` como componente), `[]` cuando `archetype` está `unresolved`. Derivado de la MISMA evidencia que resuelve `archetype` (`context-resolver.ts`), nunca una segunda fuente de verdad; determinista, sin duplicados, orden alfabético canónico. El adapter legacy (`mappings.ts`) usa `deriveSingleArchetypeComponents` (nuevo helper) — seguro porque QBV1 nunca resuelve `archetype` a `"hybrid"`.
- **Nueva operación de routing `archetypeIncludes`** (`qbv2-rules.ts`), deliberadamente DISTINTA de `contextResolvedEquals`: pertenencia a `archetypeComponents`, no el valor exacto de `archetype`. `contextEquals`/`contextResolvedIn` no cambian de significado. Azúcar `archetypeIncludesAny` para preguntas compartidas entre varios archetypes.
- **Migradas TODAS las preguntas gateadas por archetype** (golden: `q2_appointments_noshow`/`q2_ecommerce_traffic_sources`/`q2_b2b_pipeline`/`q2_local_foot_traffic`; Lote B: las 17 preguntas especializadas) de `contextEquals("archetype", X)` a `archetypeIncludes(X)`.
- **`q2_reputation_flow` se muda a su propio módulo cross-cutting `reputation`** (nuevo en `MODULE_IDS`/`MODULE_REGISTRY`, `relevantWhen.archetypes: [local, appointments, professional]`, target 1-3): `module: "local"` era semánticamente engañoso para una pregunta que también aplica a `appointments`/`professional` — mismo patrón que `operations`/`follow_up`/`measurement` (cross-cutting, no propiedad de un solo archetype). `local` queda en 4 preguntas propias + 1 compartida = cobertura efectiva 5; `professional` en 4 propias + 1 compartida = cobertura efectiva 5.
- **Tests nuevos:** invariantes de `archetypeComponents` (no-hybrid → 1 componente, hybrid → ≥2, unresolved → 0, sin duplicados, orden canónico); `professional + appointments` y `local + appointments` conservan AMBAS familias (antes las perdían); un archetype no-hybrid sigue activando SOLO su propia familia (la corrección no abre compuertas de más); fixture contractual `retail + ecommerce` para proteger la arquitectura antes de escribir Lote C; presión especializada bajo hybrid registrada (§23), no resuelta — sigue siendo trabajo de DIAG-V3-08B.4.
- **Sin cambios en QBV2 público, D1/KV ni deploy.** `test:unit` 555/555 (10 nuevas), `typecheck`/`build`/`git diff --check` PASS. Todavía sin push (pendiente de autorización explícita), todavía no cierra DIAG-V3-08B.3.

## 2026-09-28 — DIAG-V3-08B.3 Lote B: local/local_service/appointments/professional (EN PROGRESO, solo local, sin deploy)

- **18 preguntas nuevas** (`qbv2-lote-b.ts`) en los 4 módulos especializados autorizados: `local` (discovery, presence consistency, repeat customers — más `q2_local_foot_traffic` ya existente), `local_service` (service area, response speed, quote practice/follow-up encadenados, repeat/referral), `appointments` (booking method, booking friction, confirmation/reminders, lead-to-booking, rebooking — más `q2_appointments_noshow` ya existente y auditada, sin reemplazo), `professional` (authority/trust signals, intake flow, referral dependency, follow-up post-consulta). Banco combinado: **37 preguntas** (19 de Lote A + 18 de Lote B).
- **`q2_reputation_flow` compartida entre los 3 módulos que la necesitan** (`local`/`appointments`/`professional`, gateada con `contextIn`), evitando la duplicación `local_reviews`/`appointment_reviews`/`professional_reviews` que el checkpoint pedía evitar explícitamente.
- **Fricción solo sobre hechos severos/inequívocos** (mismo criterio que el "often" ya aceptado en `q2_appointments_noshow` de golden): de 18 preguntas nuevas, solo 7 opciones producen `friction` directamente (el extremo más claro de su pregunta — "informal", "none", "rarely"/"rarely_never", "few", "often", "some_lost"); el resto queda como evidencia puramente diagnóstica (`purpose: "diagnostic"`, `candidateDimensions` sin forzar clasificación). `q2_professional_referral_dependency` no produce ninguna señal — depender de referidos no se interpreta automáticamente como bueno ni malo.
- **Bug real encontrado y corregido durante el lote:** `q2_service_quote_followup` usaba `notEqV2("q2_service_quote_practice", "no")`, que trata una respuesta AUSENTE como "≠ no" — la pregunta quedaba elegible antes de que existiera la respuesta que la habilita. Corregido a `inV2(..., ["yes", "varies"])`, que exige una respuesta real. Test de regresión añadido.
- **Gap conocido confirmado, no una regresión de Lote B:** un archetype `hybrid` (dos mecanismos de entrega independientes, p. ej. professional + appointments) no activa NINGUNA pregunta de ninguno de los dos módulos hoy — `DIAG-V3-08B2-HYBRID-ARCHETYPE-MODULE-001` sigue diferida al Adaptive Planner (DIAG-V3-08B.4), confirmado con un test explícito en vez de fingir una composición que el motor actual no resuelve.
- **10 fixtures sin usar profesión para routing** (dentista/terapeuta/abogado/realtor solo como descripción, nunca como regla): el mismo sector (`health_wellness`) resuelve `professional` o `appointments` según la RESPUESTA de mecanismo de entrega, nunca según el sector; sectores distintos (`real_estate`/`legal`/`automotive`/`home_services`) convergen en el mismo archetype cuando la respuesta operativa es la misma.
- **`professional` queda en 4 preguntas nuevas, por debajo del target `MODULE_REGISTRY` (5-8):** auditado deliberadamente sin rellenar — `capacity`/`reputation` ya los cubre la fundación/pregunta compartida; no se inventó una quinta pregunta solo para cuadrar el rango. Reportado, no corregido en este commit — decisión de dominio pendiente (mantener 4-7 vs. añadir contenido real en un lote posterior).
- **Sin cambios en `MODULE_REGISTRY`** ni en el resto de la arquitectura fuera de lo descrito. `test:unit` 545/545 (29 nuevas), `typecheck`/`build`/`git diff --check` PASS. Todavía sin push (pendiente de autorización explícita), todavía no cierra DIAG-V3-08B.3 (§60).

## 2026-09-28 — DIAG-V3-08B.3 Lote A domain review R2 (EN PROGRESO, solo local, sin deploy)

- **`q2_sector` deja de mezclar sector con modelo operativo/canal.** Retiradas las opciones `ecommerce`, `creator` y `b2b_services`: no son sectores comparables a salud/legal/automotriz, ya son resolubles por `q2_delivery` + monetización + `q2_customer_buyer`, y dejarlas mezcladas reintroducía exactamente la ambigüedad que la regla sector-first buscaba evitar (una agencia B2B o una tienda de cosméticos en línea podían "elegir" tres sectores distintos y ninguno sería incorrecto). `retail` se mantiene deliberadamente: es un mercado ("comercio general"), no un canal — coexiste con su propio `OperationalArchetype` sin la ambigüedad de `ecommerce`. `NicheGroup.ecommerce`/`creator`/`b2b_services` siguen existiendo en el contrato (catálogo/analítica), solo dejan de ofrecerse como elección directa en esta pregunta.
- **`CustomerReach.mixed` redefinido**: ya no es "tengo clientes de distintos lugares" (todo negocio nacional tiene algún cliente local ocasional) sino una combinación operativamente real y habitual — una parte del negocio es local y otra atiende mercados más amplios de forma consistente, no un caso aislado.
- **Corregido un fixture de test semánticamente incorrecto**: un consultor remoto con clientes nacionales había quedado codificado con `deliveryMode=online_checkout`, lo que lo convertía en `archetype=ecommerce` — incorrecto, `online_checkout` describe el mecanismo de ecommerce, no "trabajar remotamente". Corregido a `specialized_individual_practice` (→ `archetype=professional`) y añadido un test explícito que protege la distinción: alcance nacional/en línea nunca implica ecommerce por sí solo.
- **`q2_process_systemization` gana un estado "parcial"**: no fuerza `true`/`false` cuando un negocio tiene procesos definidos para algunas tareas y no para otras — la opción no produce ninguna señal, distinta de "unsure" (que sí es `kind: "unknown"`, para cuando la persona genuinamente no sabe). Prompt acortado, ejemplos movidos al helper.
- **`MODULE_REGISTRY` reconciliado con la auditoría real** (autorizado explícitamente, no una cuota inventada): `core` 4-5→2-3, `classification` 2-4→4-6, `maturity` 2-3→4-6; `goal_friction` sin cambios (2-3, ya coincidía). Sigue siendo metadata de planner, no una cantidad obligatoria mostrada al usuario.
- **Nueva deuda registrada, `DIAG-V3-08B3-ROUTE-BUDGET-001`** (`docs/STATUS.md` Open Debt): la fundación universal sola ya alcanza 13-14 preguntas en el peor caso, contra un presupuesto típico de 10-16; sumar un módulo especializado podría superar 18-24. No bloquea Lote A; es gate obligatorio de DIAG-V3-08B.4 — el Adaptive Planner deberá demostrarlo con rutas/personas reales, no asumirlo.
- **Sin cambios de arquitectura fuera de lo descrito.** `test:unit` 516/516 (8 nuevas), `typecheck`/`build`/`git diff --check` PASS. Todavía sin push, todavía no cierra la fase (§60 de DIAG-V3-08B.3).

## 2026-09-28 — DIAG-V3-08B.3 Lote A: fundación universal (EN PROGRESO, solo local, sin deploy)

- **Regla de producto obligatoria para 08B.3, fijada por el usuario antes de este lote: "sector-first".** El cuestionario nunca debe forzar a elegir un nicho/profesión específico (nada de "¿eres dentista, terapeuta, medspa...?"); descubre el contexto por sector amplio (`NicheGroup`) + modelo operativo + respuestas, y el `NicheId` específico queda como dato interno opcional que puede permanecer `unresolved` sin degradar el diagnóstico.
- **Extensión necesaria (no discrecional) al contrato de señales de 08B.1/08B.2, verificada con el usuario antes de tocar código aprobado:** `DiagnosticSignalsV3` no tenía forma de declarar `NicheGroup` directamente — solo por lookup de un `NicheId` de catálogo o por un escape hatch de "otro". Añadido `declaredNicheGroup?: Signal<NicheGroup>` (`signals.ts`), kind `"nicheGroup"` en el DSL de producción (`qbv2-signals.ts`), y una tercera vía en `resolveNicheGroup` (`context-resolver.ts`): NicheId de catálogo (más específico, gana) → `declaredNicheGroupOther` → declaración directa de sector. Corregido de paso un orden de prioridad incorrecto (un NicheId real podía quedar enmascarado por `declaredNicheGroupOther` si ambos estaban presentes).
- **Único punto de registro del banco real:** `qbv2-golden.ts` deja de autorregistrarse al importarse (competía en silencio con cualquier segundo banco por orden de import). `qbv2-bank.ts` (nuevo) es el único lugar que llama `registerQuestionBankV2`, con `QUESTION_BANK_V2 = [...GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2]`, extendido lote a lote.
- **Lote A** (`qbv2-lote-a.ts`, 5 preguntas universales en `core`/`classification`/`maturity`, ninguna especializada por archetype/nicho todavía): `q2_sector` (17 categorías de sector + "otro sector, no encaja en los anteriores"), `q2_customer_reach`/`q2_customer_buyer` (cierran `CustomerModel`, sin productor hasta ahora en el banco), `q2_process_systemization` y `q2_capacity_signal` (operacionalizan `systemization`/`capacityPressure`/`capacityExpansion` — ADICIONALES a `demandTrend`, ya producido por `q2_demand_trend` de golden, no un sustituto).
- **Desviación de `MODULE_REGISTRY.targetQuestionRange` reportada, no ocultada (metadata de planner, no restricción dura):** `core` queda en 2 preguntas (objetivo 4-5, por debajo), `classification` en 5 (objetivo 2-4, por encima en 1), `maturity` en 5 (objetivo 2-3, por encima en 2) — los rangos de 08B.2 eran una estimación previa a auditar exactamente qué señales de fundación hacían falta. Ningún `min`/`max` de `qbv2-contract.ts` fue modificado para forzar que cuadren.
- **Banco combinado: 19 preguntas (14 golden + 5 Lote A)** — lejos todavía del target editorial de 100-120 (DIAG-V3-08B.2-C1); este lote no cierra la fase (§60), queda pendiente de revisión de dominio antes de Lote B.
- **Sin cambios funcionales fuera de lo descrito.** `test:unit` 495/495 (19 nuevas), `typecheck`/`build`/`git diff --check` PASS. `CURRENT_QUESTION_BANK_VERSION` sigue en `1`; sin UI, sin D1/KV, sin deploy.

## 2026-09-28 — DIAG-V3-08B.2-C1 Bank Size Forecast Reconciliation (solo local, sin deploy)

- **Corrección de cierre sobre el pronóstico de tamaño del banco de DIAG-V3-08B.2** (auditoría solicitada antes de autorizar el push): la redacción original afirmaba "mínimo ~75, máximo ~120" y, por separado, "cae dentro de 100–150" — falso aritméticamente, porque 75 (y el floor exacto, 74) está fuera de 100–150. Auditados los 19 módulos de `MODULE_REGISTRY` uno por uno: suma exacta de mínimos (**module floor**) = **74**; suma exacta de máximos (**techo razonable de módulos**) = **120**.
- **Tres conceptos ahora documentados por separado** en vez de mezclados: (1) **module floor** (74, metadata de planner, puede quedar bajo 100 sin implicar el tamaño final del banco); (2) **target editorial** (lo que se construye de verdad en DIAG-V3-08B.3, derivado de cobertura, no de una cuota — **100–120 preguntas**); (3) **techo razonable** (120, límite antes de producir redundancia evidente).
- **Test corregido** (`tests/unit/diagnostic/qbv2-architecture.test.ts`): el test que afirmaba la comparación tautológica "75–120 ∈ 100–150" fue reemplazado por uno que verifica las propiedades reales — `moduleFloor > 0`, `EDITORIAL_TARGET.min >= 100`, `EDITORIAL_TARGET.max <= moduleCeiling`, `moduleFloor <= EDITORIAL_TARGET.min`. No se modificaron los `min`/`max` de `MODULE_REGISTRY` (`qbv2-contract.ts` intacto) — no era necesario ni deseable inflar/recortar módulos solo para cuadrar una suma.
- **Sin cambios de arquitectura.** DIAG-V3-08B.2 se mantiene aprobada; esta es una corrección de redacción y de test, no una reapertura de código. `test:unit`/`typecheck`/`build`/`git diff --check` PASS. Autoriza el push de los commits de DIAG-V3-08B.0–08B.2 junto con este. Próximo incremento: DIAG-V3-08B.3 — Question Content & Specialized Modules.

## 2026-09-28 — DIAG-V3-08B.2 Question Bank V2 Architecture (solo local, sin deploy)

- **La fábrica del banco adaptativo, no el contenido.** Nuevos módulos `app/features/diagnostic/qbv2-*.ts`: `qbv2-contract.ts` (19 módulos auditados en `MODULE_REGISTRY`, contrato `QuestionDefinitionV2`/`OptionV2` con propósito/prioridad/scoring-readiness/copy variants/contradiction hook), `qbv2-signals.ts` (DSL de producción de señales — una variante discriminada por cada campo de `DiagnosticSignalsV3`, dato puro, nunca una función), `qbv2-rules.ts` (`RuleV2`: `AnswerRefV2` y `ContextFieldRef` como dos tipos de nodo distintos, nunca `field: string` genérico), `qbv2-engine.ts` (`resolveEligibleQuestionsV2`, el motor de convergencia), `qbv2-validators.ts` (9 validadores estáticos), `qbv2-golden.ts` (14 preguntas seed). `CURRENT_QUESTION_BANK_VERSION` sigue en `1`; QBV2 solo se sirve explícitamente vía `getQuestionBank(2)`.
- **Convergencia contexto/routing** (el punto que el usuario pidió examinar con más cuidado antes de escribir contenido encima): mismo algoritmo, deliberadamente, que `deriveActiveAnswers` de QBV1 — empieza optimista con todas las respuestas activas y en cada iteración recalcula señales→contexto→elegibilidad, quedándose solo con lo que sigue pasando; el conjunto nunca puede crecer entre iteraciones, así que la terminación está garantizada incondicionalmente por esa reducción monótona, no por ningún otro mecanismo. Probado de extremo a extremo: responder → producir señal → resolver contexto → habilitar pregunta especializada → cambiar la respuesta original → el contexto se recalcula, la especializada se desactiva, su señal desaparece — todo recomputado desde cero, sin estado intermedio.
- **Dos revisiones independientes (dominio y código).** La de código no encontró hallazgos bloqueantes ni should-fix. La de dominio corrigió una imprecisión real en el propio comentario del motor: la garantía de no-oscilación es de la reducción monótona (incondicional), NO del validador estático `validateNoSelfReferentialContextGating` — ese validador detecta algo distinto y real: una pregunta auto-referencial queda estructuralmente MUERTA (pierde la respuesta del usuario para siempre porque su propia contribución resuelve el campo del que depende antes de evaluarse su elegibilidad). Should-fix aplicados: nuevo validador `AMBIGUOUS_FIELD_PRODUCERS` (el desempate por orden alfabético de `QuestionId` en `foldSignalProductions` no tenía ninguna señal de alerta cuando dos preguntas compiten de verdad por el mismo campo); nueva excepción `purpose: "diagnostic"` en el validador de huérfanas (antes forzaba a preguntas puramente diagnósticas a fabricar una `candidateDimensions` prematura solo para pasar la validación, contradiciendo "no asignar pesos todavía"); corregido el único ejemplo golden de `contradictionRole`/propósito "confirmation" (`q2_confirm_hybrid_friction`), cuyo `targetField` afirmaba confirmar `businessModel` sin alterarlo — ahora apunta a `primaryFriction`, que es lo que realmente decide, y se documenta explícitamente que una confirmación genuina de ambigüedad es estructuralmente imposible bajo este motor sin un mecanismo nuevo (diferido a DIAG-V3-08B.5); añadido un test de cadena de contexto de 2 saltos (el banco golden solo tenía saltos de profundidad 1); documentada como deuda explícita, no resuelta a la fuerza, la falta de módulo propio para `OperationalArchetype: "hybrid"` (decisión del Adaptive Planner, DIAG-V3-08B.4).
- **Matriz de reutilización de las 26 preguntas legacy** (`docs/PROJECT_STATE.md`): 1 REUSE, 6 REPLACE (incluye colapsar las 4 preguntas `proof_*` por perfil en una sola con copy variants), 17 REVISE, 2 LEGACY_ONLY sin destino todavía.
- **Pronóstico de tamaño del banco**: ~75-120 preguntas según los rangos objetivo por módulo (corregido en DIAG-V3-08B.2-C1, ver entrada siguiente: el floor de módulos no "cae dentro de" 100-150, son conceptos distintos).
- **Sin cambios funcionales.** `test:unit` 476/476 (35 nuevas), `typecheck`/`build`/`git diff --check` PASS. Sin scoring contextual, sin Adaptive Planner, sin UI, sin D1/KV, sin deploy. Próximo incremento: DIAG-V3-08B.3 — Question Content & Specialized Modules.

## 2026-09-28 — DIAG-V3-08B.1 Context Resolver (solo local, sin deploy)

- **Resolver determinista** que transforma `DiagnosticSignalsV3` (hechos normalizados del negocio — `app/features/diagnostic/signals.ts`) en el contexto de dominio de DIAG-V3-08B.0, con una traza estructurada por campo que explica cada decisión (`context-resolver.ts`, `resolveDiagnosticContext` + 8 resolvers de campo). El resolver nunca conoce un `QuestionId` ni el wording de ninguna pregunta; `legacy-signal-adapter.ts` traduce el contexto de QBV1 (26 preguntas) a estas señales de forma deliberadamente dispersa — la mayoría de los campos quedan `unresolved`, que es correcto.
- **Los dos bloqueantes diferidos de 08B.0 quedan resueltos:** `organization`/`startup` se retiran de `OperationalArchetype` (10 valores) — ninguno describía un mecanismo de entrega real, solo estructura/ciclo de vida ya cubierto por `EntityType`/`GrowthStage`. `GrowthStage` usa ahora señales observables concretas (`hasRealCustomers`, `operatingRegularity`, `demandTrend`, `capacityPressure`, `capacityExpansion`, `systemization`) en vez de adjetivos; sin evidencia de tendencia/presión/expansión, resuelve `unresolved(insufficient_evidence, [operating, growing])` en vez de elegir arbitrariamente. La etapa legacy "growing" ("estable y quiero crecer") sigue sin resolver nunca como `GrowthStage: growing`, protección probada.
- **Dos revisiones independientes (dominio y código) encontraron 2 hallazgos BLOQUEANTES de dominio, corregidos antes de cerrar la fase:** `scheduled_time_blocks`/`specialized_individual_practice` eran ambiguos para el caso más común (un profesional solo cumple ambas descripciones a la vez) — se resuelve con un diferenciador observable real (¿hay más de un proveedor agendándose?). `DemandTrend` no podía representar declive (`decreasing_observed` añadido); `GrowthStage` sigue sin un valor "en declive" propio, decisión de producto diferida a DIAG-V3-08B.3 (Open Debt).
- **Should-fix aplicados de la misma revisión:** `areIndependent` (detección de `hybrid`) ahora exige que al menos una de las dos señales sea de fuerza máxima, no solo ambas ≥2 — dos inferencias débiles ya no bastan para una conclusión `hybrid` confiada; nueva señal `capacityExpansion` (contratar/expandir observado cuenta como evidencia de `growing` por sí sola); `capacityPressure` redefinida como aumento observado, no una foto fija; `commission_or_referral` añadido a `MonetizationMechanism` (agentes/corredores/afiliados no tenían dónde clasificarse); `licensed_practice` aclarado como señal de licencia, no de mecanismo de pago; piso general de materialidad (`isMaterial`) en todos los resolvers de campo único; `hasOtherPaidStaff` aclarado a personal continuo, no subcontratación puntual.
- **Dos bugs reales encontrados por la propia suite de tests y corregidos:** `resolvePrimaryFriction` no era order-independent (candidatos dependían del orden de inserción del array de entrada); un literal inválido en un fixture de test (`"services"` usado como `MonetizationMechanism`) pasó sin detectarse por la deuda preexistente `TEST-TSC-UNIT-001` (`tests/` fuera de `tsc`).
- **`DiagnosticContextV3` gana `nicheGroup: Resolution<NicheGroup>`**; `ResolutionSource` gana `"signal"`. Sin cambios funcionales en el motor/scoring/routing actual; sin scoring contextual, sin Adaptive Planner, sin preguntas nuevas, sin UI, sin D1/KV. `test:unit` 441/441 (59 nuevas), `typecheck`/`build`/`git diff --check` PASS. Próximo incremento: DIAG-V3-08B.2 — Question Bank Architecture.

## 2026-09-28 — DIAG-V3-08B.0 Taxonomy & Domain Foundation (solo local, sin deploy)

- **Cierre de DIAG-V3-08 antes de empezar 08B.0:** `DIAG-V3-08-CHANGE-RATE-VERSION-E2E-001` tenía código añadido (`changeRate()` en `tests/e2e/diagnostic-analytics-check.mjs` acepta `questionBankVersion`) pero **sin confirmación de PASS**: cuatro intentos de correr el script completo contra el Worker local (incluido un reinicio limpio de `pnpm run dev`) se degradaron progresivamente sin converger — problema de infraestructura Windows/D1 local, no del código. Queda ABIERTA en `STATUS.md`, sin marcarla resuelta sin evidencia. El conteo `34` de `PROJECT_STATE.md` se verificó contra los archivos reales y es correcto; NO se cambió a `38` (son conceptos distintos). Micro-checkpoint separado: `about.tsx` cambia `Edgar` → `Edgar Betin` en la tarjeta de Director Comercial.
- **Taxonomía de dominio para el futuro banco adaptativo** (nichos + preguntas especializadas, DIAG-V3-08B.1 en adelante): 8 conceptos auditados contra los contratos de DIAG-V3-01 y clasificados KEEP/EXTEND/REPLACE con justificación inline en `app/features/diagnostic/contracts.ts`. `OperationalArchetype` gana `retail` (12 valores); `NicheGroup` nuevo, cerrado, 18 valores, para routing/analítica; `NicheId` sigue abierto y validado por formato; `CustomerModel`/`GrowthStage`/`PrimaryGoal`/`EntityType` se mantienen; `PRIMARY_FRICTIONS` se reemplaza por completo (9 valores sin productor ni consumidor → 6 categorías mutuamente distinguibles: `visibility`/`trust`/`conversion`/`follow_up`/`operations`/`scale`). `QuestionBankVersion` se amplía a `1 | 2`, reservando la identidad del banco adaptativo sin activarla (`CURRENT_QUESTION_BANK_VERSION` sigue en `1`).
- **Registro de dominio nuevo** (`app/features/diagnostic/taxonomy.ts`): un `TaxonomyEntry<T>` (label + definición) por cada valor de cada lista cerrada, autorizado como `Record<T,...>` para que TypeScript exija completitud en compilación en vez de un `throw` al cargar el módulo; catálogo inicial de 25 nichos representativos (`NICHE_REGISTRY`, no el catálogo final) con `group`/`archetypeHints` (hints editoriales, nunca hechos resueltos).
- **Dos revisiones independientes (dominio y código, agentes frescos):** la de dominio encontró un hallazgo **BLOQUEANTE** — `BusinessModel` y `OperationalArchetype` compartían `retail`/`ecommerce`/`hospitality`/`appointments` con definiciones idénticas, así que ningún negocio real podía tener uno sin el otro, violando el principio de la fase de no duplicar taxonomías. Corregido: esos 4 valores se retiran de `BusinessModel`, que queda en 7 valores centrados solo en el origen del ingreso. La misma revisión aportó should-fix aplicados: frontera explícita `individual`/`business` (personal remunerado adicional), hint de `real_estate_agent` corregido a `appointments`, `creative_media` añadido al catálogo (antes sin ejemplo), decisión explícita sobre dónde cae la fricción de retención/postventa (`operations`, sin categoría propia todavía). La revisión de código encontró un should-fix — los registros originales validaban completitud con un `throw` en tiempo de carga del módulo, y como se importan vía el barrel `index.ts` que también usan rutas fuera del Diagnóstico (p. ej. la página pública), ese `throw` podía tumbar rutas no relacionadas; corregido migrando a `Record<T,...>` — y dos minor de calidad de tests (roundtrip JSON tautológico, mutation test C que no ejercía la función real), ambos corregidos.
- **Tensiones documentadas, diferidas explícitamente, no resueltas por omisión:** `OperationalArchetype.organization`/`startup` mezclan estructura/ciclo de vida con mecanismo de entrega (decisión para DIAG-V3-08B.1, el Context Resolver); frontera `GrowthStage` `operating`/`growing` sin señal observable concreta todavía (DIAG-V3-08B.3); `NicheGroup.creator` agrupa por mecanismo de monetización en vez de tema — mantenido con justificación explícita, no un error sin resolver. Ver Open Debt en `STATUS.md` (`DIAG-V3-08B0-ARCHETYPE-LIFECYCLE-001`, `DIAG-V3-08B0-GROWTH-STAGE-SIGNAL-001`, `DIAG-V3-08B0-FRICTION-RETENTION-001`, `DIAG-V3-08B0-NICHE-CATALOG-PARTIAL-001`).
- **Sin cambios funcionales.** `deriveContextV3` sigue devolviendo `unresolved("not_asked")` para `businessModel`/`niche`/`customerModel`/`primaryFriction`; el banco actual (QBV1, 26 preguntas) no produce estos campos. `test:unit` 382/382 (41 nuevas), `typecheck`/`build`/`git diff --check` PASS. Sin UI, sin D1/KV, sin deploy. Próximo incremento: DIAG-V3-08B.1 — Context Resolver.

## 2026-09-28 — DIAG-V3-08 Analytics Foundation (solo local, sin deploy)

- **Analítica de eventos anónima del Diagnóstico:** `Browser (AnalyticsEventQueue)` → `POST /api/diagnostic/events` (autenticado por `sessionId`+`writeToken`) → `diagnostic_event` (D1, migración `0013`, aditiva); 4 columnas nuevas en `diagnostic_session` (`save_count`/`resume_count`/`last_saved_at`/`last_resumed_at`). Depende de DIAG-V3-06 (`diagnostic_session`) y DIAG-V3-07 (`diagnostic_saved_snapshot`, cuya vigencia excluye una sesión del abandono derivado).
- **Módulo de dominio puro** (`app/features/diagnostic/analytics.ts`) y firma de ruta determinista (`route-signature.ts`); servicio de consultas `diagnosticAnalytics` de 8 funciones (`db/queries/diagnostic-analytics-metrics.server.ts`: `lifecycle`, `saveResume`, `dropoffByQuestion`, `answerChangeRateByQuestion`, `unknownRateByQuestion`, `naRateByQuestion`, `resultDistribution`, `evidenceCoverageByDimension`, todas con filtro `versions` opcional); el abandono es siempre derivado en el momento de la consulta, nunca un estado almacenado.
- **6 tipos de evento instrumentados en la UI** (`QUESTION_SHOWN`, `ANSWER_SUBMITTED`, `ANSWER_CHANGED`, `QUESTION_INVALIDATED`, `SECTION_ENTERED`, `SAVE_OFFERED`, más `SAME_BROWSER_RESUMED`), cola de cliente pura con lotes, reintento y un tope de pendientes en memoria (`ANALYTICS_QUEUE_MAX_PENDING` = 200, `analytics-queue.ts`), distinto del cupo persistido por sesión que aplica el servidor (`MAX_ANALYTICS_EVENTS_PER_SESSION` = 500, `api-diagnostic-events.ts`: trunca el lote a la capacidad restante y responde 200 con `{ accepted, dropped }`); la analítica se degrada antes que el producto (best-effort). Sin endpoint público ni dashboard; `purgeExpiredAnalyticsEvents` existe sin llamador todavía (sin scheduler en esta fase, permitido explícitamente por el spec). Nueva sentencia honesta en `/privacidad` sobre la ventana de retención de 180 días (objetivo, no garantía activa todavía).
- **Sin cuenta, sin cambio de comportamiento del motor/scoring/routing.** `test:unit` 341/341 (38 nuevas); `diagnostic-analytics-check.mjs` (nuevo) 90/90; `diagnostic-persistence-check.mjs`/`diagnostic-save-resume-check.mjs` reejecutados sin regresión. Dos rondas de revisión independiente (por tarea + rama completa), 4 Important encontrados y corregidos. Ver `STATUS.md` para el detalle completo y el Open Debt registrado.
- **Revisión final de rama (tercera ronda, 4 Important, corregidos en una última ronda):** (I-A) `TESTING.md` afirmaba que las funciones de `diagnosticAnalytics` se verificaron contra D1 local real; lo que el E2E ejecuta es SQL réplica duplicado a mano — ahora lo dice, en línea con `DIAG-V3-08-METRICS-EXEC-001`, y corrige qué cubren `analytics-abandonment.test.ts`/`analytics-queue.test.ts` y cómo se comporta el cupo por sesión (trunca y responde 200, no rechaza). (I-B) Datos incorrectos en `DATABASE.md`/`ARCHITECTURE.md`/`STATUS.md`: ruta real de `purgeExpiredAnalyticsEvents` (`db/queries/diagnostic-analytics.server.ts`), algoritmo real de `route_signature`, valores reales de `answer_kind` (`answered`/`unknown`/`not_applicable`), el marcador de reinicio es solo el cambio de perfil (interpretado por el CTE `resets`, no una emisión especial de la UI), los dos topes (cliente en memoria vs. servidor persistido) son mecanismos distintos, y los 4 Important de la Tarea 16 los encontró la revisión en su pase inicial. (I-C) Open Debt nuevo: `DIAG-V3-08-ANSWER-KIND-RATE-001` (M4), `DIAG-V3-08-EVENT-NUMERIC-BOUNDS-001` (M5) y `DIAG-V3-08-UI-EMISSION-E2E-001`. (I-D) **Código:** `flushAnalytics` (`app/routes/diagnostic.tsx`) ya enviaba en serie los lotes de UNA llamada (I4(c)), pero dos llamadas solapadas (flush por tiempo vs. flush forzado por `visibilitychange`/`pagehide`, o un reintento vs. un envío posterior) podían enviar en paralelo, y un `QUESTION_INVALIDATED` enviado después podía recibir un `id` menor que el `QUESTION_SHOWN` de un lote anterior más lento — la pregunta invalidada quedaba "válida" y podía contar como dropoff. Ahora cada llamada se encadena detrás de la anterior (`analyticsFlushChainRef`); la cola se vacía cuando le toca el turno, con sesión y cola capturadas al llamar; los 6 puntos de llamada siguen siendo `void flushAnalytics(...)`. Límite aceptado y documentado en el código: un flush de `pagehide` encadenado detrás de otro en vuelo puede perderse si la página termina de descargarse antes. Sin prueba comitida de la carrera (es de temporización del cliente; ver `DIAG-V3-08-UI-EMISSION-E2E-001`); verificada con traza de código y una sesión Playwright ad hoc no comitida contra el Worker local (RAN 2026-09-28): con la primera petición a `/api/diagnostic/events` retrasada 4 s y un flush forzado por `visibilitychange` mientras tanto, la segunda petición sale solo después de que termina la primera y todos los `id` del lote 1 quedan por debajo de los del lote 2; con el `diagnostic.tsx` anterior, restaurado temporalmente como control, la misma sesión reproduce la inversión (lote 2 con `id` menores que el lote 1). `test:unit` 341/341, `diagnostic-analytics-check.mjs` 90/90, `diagnostic-persistence-check.mjs` 66/66, `diagnostic-save-resume-check.mjs` 47/47, `typecheck`/`build`/`git diff --check` PASS.

## 2026-09-27 — DIAG-V3-06 Persistence Foundation (solo local, sin deploy)

- **Gate de privacidad resuelto localmente:** `DIAG-V3-PRIVACY-01` exigía reconciliar la promesa pública "no guardamos tus respuestas"/"anónimo y efímero" antes de tocar código de persistencia. `privacy.tsx`, `diagnostic.tsx` (meta, hero, límites del resultado) y el mailto de contacto (`index.ts`) dejan de afirmar de forma absoluta que nada se guarda; la nueva copy explica que no se exige cuenta ni datos de identidad, que se usa un identificador aleatorio para continuar donde quedaste, y que el diagnóstico completo puede conservarse de forma estructurada para operar y mejorar el servicio. Protegido por `tests/unit/diagnostic/privacy-copy.test.ts` (5 pruebas, fija la reconciliación como regresión).
- **Versiones persistidas nuevas (`contracts.ts`):** `QuestionBankVersion`/`RoutingVersion`/`ScoringVersion`/`ResultSchemaVersion` (todas `1` hoy), agrupadas en `PersistedVersions`/`CURRENT_PERSISTED_VERSIONS`, distintas de `DiagnosticVersion` (`"2.0"`) y de `appVersion` (`package.json`). `isCurrentPersistedVersions` exige coincidencia exacta de las cinco; una sesión con una versión distinta produce un error controlado, nunca un cast (spec §45).
- **`DiagnosticBrowserStore` (`app/features/diagnostic/browser-store.ts`, nuevo):** capa de `localStorage` versionada e inyectable (`StorageLike`), única puerta de acceso al snapshot local. `read()` rechaza JSON corrupto, forma inválida, versiones distintas de las vigentes y respuestas que ya no validan contra el registro de preguntas — nunca migra ni castea un snapshot incompatible (spec §12). `sessionId`/`writeToken` empiezan en `null`: el navegador nunca inventa un identificador de servidor (spec §38, modo solo-navegador).
- **`app/features/diagnostic/persistence.ts` (nuevo):** `validateAnswersPayload` es la única puerta de entrada de un objeto de respuestas no confiable — deniega por defecto un `QuestionId` inexistente, un `OptionId` que no pertenece a esa pregunta, o una forma single/multi equivocada (spec §6/§14/§34); no reaplica routing (eso lo hace `explainResult` sobre el resultado ya validado). `buildCanonicalCompletionPayload`/`computeCompletionHash` (SHA-256 vía Web Crypto) son el mecanismo de idempotencia de finalización.
- **`app/features/diagnostic/snapshot-policy.ts` (nuevo):** `shouldFlushSnapshot` decide cuándo el navegador envía un snapshot de red (≈cada 5 respuestas, al cruzar de sección, o siempre antes de completar), con un límite duro de 1 escritura/segundo a la misma key (spec §16). Presupuesto documentado: ~2/3/5 escrituras de red para 10/16/26 preguntas.
- **`server/diagnostic/session-security.server.ts` (nuevo):** `generateSessionId` (UUID v4 vía `crypto.randomUUID`), `generateWriteToken` (256 bits vía `crypto.getRandomValues`, base64url), `hashWriteToken`/`verifyWriteToken` (SHA-256, comparación de tiempo constante). El token en claro nunca se persiste; D1 solo guarda su hash.
- **`server/diagnostic/kv-snapshot.server.ts` (nuevo):** KV es exclusivamente snapshot temporal de trabajo (binding `DIAGNOSTIC_SNAPSHOTS`, TTL = 7 días); nunca se promete lectura-tras-escritura global. El borrado (`deleteDiagnosticSnapshotBestEffort`) es siempre posterior a la confirmación de D1 y nunca lanza si falla (spec §29/§37).
- **Migración `0011_diagnostic-persistence-foundation` (`db/schema/diagnostic.ts`):** `diagnostic_session` (estado, `token_hash`, las cinco versiones, `profile`/`stage`/`goal` solo cuando están resueltos, `revision`, `current_question_id`, contadores, `snapshot_expires_at`), `diagnostic_answer` (una fila por respuesta activa final, único `(session_id, question_id)`) y `diagnostic_result` (`structured_result_json` = `DiagnosticResult` real del Result Engine, `dimension_results_json` = `DimensionResult[]` con evidencia real — sin tabla `diagnostic_dimension_result` separada porque nada en esta fase necesita consultarla por columna SQL, decisión documentada en `DATABASE.md` — `completion_hash`, `retention_until`). Aplicada y verificada solo en D1 local sobre la cadena `0000`–`0010` existente.
- **`db/queries/diagnostic-sessions.server.ts` (nuevo):** `completeDiagnosticSession` es la única autoridad de finalización — valida, deriva respuestas activas con `explainResult` (el mismo motor que ya usaba `runDiagnostic`), recalcula el resultado completo, y persiste answers+result+session en un único `database.batch([...])` (spec §26/§27). Repetir la misma finalización (mismo hash canónico) devuelve el resultado ya guardado (`already_completed`); un payload distinto sobre una sesión completada lanza `DiagnosticCompletionConflictError` (409), nunca sobreescribe. `snapshotDiagnosticSession` rechaza una sesión ya completada o de versión incompatible.
- **Tres rutas API anónimas nuevas**, mismas convenciones que el resto de `app/routes/api-*`: `POST /api/diagnostic/sessions` (crear; sin login, sin `Contact`/`User`/`Organization`), `PATCH /api/diagnostic/sessions/:sessionId` (snapshot; requiere `sessionId` + `writeToken` válido, nunca `sessionId` solo), `POST /api/diagnostic/sessions/:sessionId/complete` (finalizar; ignora cualquier `result`/`overallScore` que el cliente envíe — solo lee `answers`). Límite de payload de 32 KB (spec §34); sin CORS abierto (verificado: la reflexión de `Origin` observada en dev es del servidor Vite, no de estas rutas, y nunca reflaja un origen ajeno).
- **`diagnostic.tsx`: única diferencia funcional visible — restauración automática en el mismo navegador tras recarga** (spec §11/§59), condicionada a que la sesión no esté completada y la versión coincida. Un deep link (`?perfil=`/`?objetivo=`) solo gana sobre lo resumido cuando lo CONTRADICE (perfil u objetivo distinto al guardado); como `answer()` fija `?perfil=` en la URL en cuanto se elige un perfil y esa marca sobrevive el resto del recorrido, tratar cualquier `?perfil=` como "deep link nuevo" habría vaciado la restauración en cada recarga real (corregido tras la revisión independiente, ver abajo). El resto de la wiring (crear sesión al primer contexto real, snapshot coalescido, completar en segundo plano) es best-effort y nunca bloquea la pregunta siguiente ni cambia lo que se renderiza (el resultado mostrado sigue siendo 100% cálculo local del motor, spec §37/§59). Cero rediseño.
- **Revisión independiente (fresh reviewer, `feature-dev:code-reviewer` en `opus`, RAN 2026-09-27):** encontró 1 Critical y 3 Important (0 al cerrar, todos corregidos y verificados en vivo antes de revertir/confirmar):
  - **C1 (Critical):** un snapshot en vuelo podía llegar DESPUÉS de completar y devolver la sesión a `IN_PROGRESS`, rompiendo idempotencia y el orden de borrado de KV. Corregido en dos capas: el cliente nunca envía un snapshot de red mientras `complete` es verdadero (la finalización ya manda las respuestas completas), y el `UPDATE` de `snapshotDiagnosticSession` pasa a ser condicional (`status <> 'COMPLETED'`), rechazando con 409 si afectó 0 filas — no basta el chequeo previo en memoria, hay una carrera real entre leer y escribir.
  - **I1:** `serverCompleted` podía sobrevivir de un diagnóstico ya terminado hacia uno nuevo en el mismo navegador (sin pasar por "Rehacer"), haciendo que el nuevo NUNCA se finalizara en servidor. **I2:** cada recarga con auto-resume creaba una sesión de servidor nueva en vez de reutilizar la existente, dejando la anterior huérfana en D1 para siempre. **I3:** una sesión creada mientras su propio efecto quedaba cancelado (varias respuestas seguidas en menos de un RTT) se descartaba en vez de adoptarse. Las tres se corrigieron reestructurando la restauración: la sesión resumida se adopta en `sessionRef` al restaurar (I2), un `serverCompleted` viejo se limpia si no se resume (I1), y la sesión ya creada por el servidor se adopta siempre aunque el efecto se cancele, coalescida en una única promesa compartida (`ensureServerSession`) con el efecto de finalización (I3).
  - **Hallazgo propio, encontrado al corregir I1/I2 (no reportado por el revisor):** leer el Browser Store dentro del inicializador de `useState` rompía la hidratación SSR (el servidor nunca ve `window`; visto en vivo como "Hydration failed", regenerando el árbol completo en cliente). Y separar la restauración y el guardado en dos `useEffect` distintos permitía que la escritura del efecto de guardado, con las respuestas todavía sin resumir, sobrescribiera el registro completo justo antes de que la restauración terminara de aplicarse — más visible aún bajo la doble invocación de efectos en desarrollo. Corregido moviendo la lectura del Browser Store a un único efecto cliente-only, con un ref (`hasCheckedResumeRef`) que evita que la misma pasada escriba con datos todavía no resumidos.
  - **m1 (Important):** dos finalizaciones concurrentes de la misma sesión podían chocar contra la restricción única y devolver 500 en vez de `already_completed`; `completeDiagnosticSession` ahora captura ese fallo del batch, relee y resuelve exactamente como un reintento secuencial.
  - **Minor, corregidos:** un cuerpo JSON `null` o una D1 caída devolvían 500 sin control (ahora 400/503); una opción `exclusive` combinada con otras en una respuesta multi se persistía (ahora se rechaza); el snapshot guardaba las respuestas validadas crudas en vez de las activas derivadas (ahora aplica `deriveActiveAnswers`, igual que la finalización).
  - **Nueva cobertura de regresión:** `runSameBrowserResume` (E2E, Playwright) confirma que una recarga real conserva la MISMA sesión de servidor y las respuestas posteriores al perfil (no solo el perfil, que ya vivía en la URL); `diagnostic-persistence-check.mjs` reproduce C1 y m1 en vivo contra D1 local con peticiones concurrentes reales.
  - `git status` quedó limpio tras la revisión; commit separado (`cbcf702`) para las correcciones.
- **`kv_namespaces` en `wrangler.jsonc`:** el `id` es un placeholder local explícito (`"local-only-placeholder-diagnostic-snapshots"`, `"remote": false`); no se ejecutó `wrangler kv namespace create` (crearía un recurso remoto real, prohibido sin autorización). Verificado en vivo que `wrangler kv key put/get --local` funciona sin red ni namespace real (spec §61) — no hubo bloqueo que reportar.
- **Migración `0011` verificada en D1 local:** 3 tablas, FK con `onDelete: cascade` hacia `diagnostic_session`, índices únicos (`diagnostic_answer_session_question_unique`, `diagnostic_result_session_unique`), `PRAGMA foreign_key_check` sin violaciones, cadena `d1_migrations` `0000`–`0011` sin huecos.
- **Mutaciones A–J (spec §65), todas reproducidas en vivo vía `diagnostic-persistence-check.mjs` (E2E real contra D1+KV locales) o unitariamente y revertidas sin dejar diff:** A (QuestionId inexistente → 400); B (OptionId inválido → 400); C (respuesta invalidada por routing, ej. `capture` sin `stage` → nunca llega a `diagnostic_answer`); D (completar dos veces con el mismo payload → sin duplicados, mismo resultado); E (colisión deliberada en `diagnostic_result` antes de completar → el batch falla completo: cero `diagnostic_answer` insertados, sesión no queda `COMPLETED` — confirma que `.batch()` de D1 hace rollback atómico real); F (comparar el token en claro contra su hash almacenado nunca coincide; el token se entrega exclusivamente en la respuesta de `POST /api/diagnostic/sessions` y nunca vuelve a aparecer en ninguna respuesta posterior de snapshot, finalización o error — auditoría DIAG-V3-06-C1); G (un `result`/`overallScore` inventado por el cliente en el body de completar se ignora, el servidor recalcula); H (orden de código verificado: `completeDiagnosticSession` siempre antes que el borrado de KV; un fallo de KV delete no lanza); I (versiones incompatibles → error controlado, 409 en snapshot y 400 en completar, nunca 500 ni cast); J (una ráfaga de respuestas inmediatas no dispara una escritura de red por cambio).
- **Sin cambio de comportamiento del motor:** caracterización (46 casos + digest de 1.125) y digest de routing (20.000 contextos) idénticos — `test:unit` de esos dos suites sin tocar. `test:unit` pasa de 237 a **286** (49 nuevas: 13 de validación/hash de persistencia, 11 de Browser Store, 7 del coalescer de snapshot, 7 de seguridad de sesión, 2 de KV, 2 de orden de finalización, 5 de la reconciliación de copy de privacidad). E2E nuevo `diagnostic-persistence-check.mjs`, **59 comprobaciones tras la revisión** (52 iniciales + 7 de C1/m1, RAN contra Worker local + D1/KV locales reales, incluidas peticiones concurrentes de verdad). `diagnostic-experience-check.mjs` reejecutado PASS en 1366/768/390/360 con un escenario nuevo (`runSameBrowserResume`) y aislamiento de `localStorage` entre escenarios del propio script (ver `TESTING.md`); `legal-trust-experience-check.mjs` PASS.
- **DIAG-V3-06-C1 (auditoría de transporte del `writeToken`, RAN 2026-09-27):** el informe de cierre de DIAG-V3-06 afirmaba a la vez que el servidor genera el `writeToken`, que `DiagnosticBrowserStore` lo conserva, y que "nunca aparece en una respuesta HTTP" — las tres afirmaciones son incompatibles con la arquitectura real (mutación F, línea de arriba, tenía la misma imprecisión). Se auditó el flujo real leyendo código y demostrándolo con test, sin inferirlo de la documentación: el servidor SÍ lo devuelve, exactamente una vez, en el body 201 de `POST /api/diagnostic/sessions`; ninguna respuesta posterior (snapshot, finalización, ni ningún error 400/403/404/409) lo repite; D1 solo persiste `SHA-256(writeToken)` (`token_hash`, verificado con 0 apariciones literales del token en las 20 columnas de `diagnostic_session`); el blob de KV no lo replica; y no aparece en pathname/query/fragment/redirect ni en ningún `console.*`. Único hallazgo real: la respuesta de creación no llevaba `Cache-Control: no-store` — corregido en `api-diagnostic-sessions.ts` (única respuesta que entrega el secreto en claro). La comparación de tiempo constante existente (`constantTimeEqual` sobre el hash SHA-256 de longitud fija, nunca sobre el token crudo) ya es la técnica correcta en este runtime: la Web Crypto API (`crypto.subtle`) no define `timingSafeEqual`, y `nodejs_compat` no está activo en `wrangler.jsonc`, así que `node:crypto` no está disponible; verificado que un candidato de 20 KB o con caracteres no base64url resuelve 403 controlado, nunca 500. Documentado el modelo de amenaza (`ARCHITECTURE.md`: credencial de capacidad en `localStorage`, accesible a JS same-origin, comprometible por XSS del sitio, sin identidad de la persona) — no se añadió a la copy pública, que no necesita este detalle. 7 comprobaciones nuevas en `diagnostic-persistence-check.mjs` (RAN contra Worker + D1 + KV locales reales: **66** en total) y 1 en `session-security.test.ts` (`test:unit` **287**). Sin cambios en routing, scoring, Result Engine, schema de D1, TTL, retención, scheduling de KV, UI ni migraciones. Sin deploy.
- **Bundle (medido tras las correcciones de revisión):** chunk de la ruta `diagnostic.tsx` +3.21 kB sin gzip (16.93 → 20.14 kB); chunk del motor +2.96 kB sin gzip (67.56 → 70.52 kB) frente al baseline medido antes de esta fase (verificado con `git stash`/rebuild). Las tres rutas API nuevas son server-only (0.00 kB en el bundle de cliente).
- **Validación:** `typecheck` 0 errores, `build` PASS, `git diff --check` PASS. Sin migraciones ni bindings remotos, sin deploy.

## 2026-09-26 — DIAG-V3-05 Result Engine (solo local, sin deploy)

- **Pipeline estructurado y explicable, mismo comportamiento:** `classifyState → generateIssues → prioritize → recommendations` se reorganiza en `active answers → score → evidence → facts → state → issues → prioritize → recommendations → structured result`, sin cambiar overallScore, dimension scores, estado, hallazgos, orden de prioridades, top 3, recomendaciones ni textos visibles. Cada función pública (`classifyState`, `detectContradictions`, `prioritize`, `recommendLicense`, `recommendServices`, `recommendLearn`, `recommend`, `runDiagnostic`) pasa a ser un envoltorio de una nueva función `explain*` que hace el único cálculo real (mismo patrón que `evaluateRule`/`evaluateRuleTrace` de DIAG-V3-03 y `scoreDimensions`/`explainDimensionScore` de DIAG-V3-04): nunca una segunda implementación que pueda divergir en silencio.
- **`explainStateClassification` (`result.ts`):** única evaluación real de estado. Preserva la cascada de comprobaciones y el orden exacto en que `low(...)` acumula texto en `because` (efecto colateral ya existente), y añade `observations` (qué regla se evaluó, en qué orden, cuál ganó) y `bug01` (traza dedicada de `DIAG-V3-BUG-01`).
- **`DIAG-V3-BUG-01` — CHARACTERIZED / NOT FIXED (no RESUELTA):** el `|| true` en la rama `clarity_weak` sigue exactamente igual, sin tocar el operador ni los thresholds. `bug01.changedOutcome` es el contrafactual explícito por ejecución (verdadero cuando, sin el `|| true`, el caso no habría emparejado esa rama); un test fija un caso real donde `changedOutcome === true` (claridad débil + consultas + contacto/seguimiento fuertes → sigue siendo "base").
- **`explainContradictions`/`ContradictionFact` (`result.ts`):** las tres contradicciones existentes ganan ID estable (`idea_with_prior_sale`, `established_without_sources`, `clear_presence_unclear_offer`) e `inputs` (pregunta/valor observado). `detectContradictions` es un envoltorio (`.map(f => f.message)`); detección, peso, efecto sobre confianza y copy sin cambios.
- **`explainPrioritization`/`PriorityTrace` (`result.ts`):** traza completa del pipeline de prioridad (severidad base → peso por tipo → impulso de objetivo ×1.3 (`GOAL_BOOST_FACTOR`, exclusivo de esta etapa, no movido a scoring) → penalización por tentativo ×0.7 → bloqueo por dependencia ×0.5 → prioridad final → orden). Tests nuevos: impulso de objetivo caracteriza la tabla `goalBoost` completa (no solo la constante ×1.3), determinismo de empates, máximo 3 prioridades visibles.
- **`explainLicenseRecommendation`/`explainServiceRecommendations`/`explainLearnRecommendations`/`explainRecommendations` (`recommendations.ts`):** procedencia de cada recomendación. Servicios y lecturas citan el `sourceIssueId` real cuando existe; el fallback sin hallazgo (servicio "estructuración" en estado "inicio"; lectura de momento sin prioridades) queda marcado `sourceIssueId: null`, no oculto. `foundationalOverrideApplied` es el mismo booleano que decide la única rama que reemplaza Barrio/Ciudad por Cuadra (no una reconstrucción aproximada). Licencia y addons declaran su base como `context_signals`, documentado como tal (no derivan de un hallazgo puntual, y no se inventa uno).
- **`findRecommendationsWithoutProvenance` (`recommendations.ts`):** detector de recomendaciones sin causa rastreable (spec §23). Tras la revisión independiente (ver abajo), vuelve a comprobar la condición real de cada fallback (`state.id === "inicio"` para el servicio; ausencia real de un hallazgo con `.learn`/`.service` coincidente) contra el `state`/`priorities` recibidos, en vez de limitarse a mirar el ID resultante de la traza.
- **`facts.ts` (nuevo): `ResultFacts`/`buildResultFacts`, `ResultTrace`/`explainResult`.** Representación estructurada de los hechos intermedios del motor ACTUAL (scores, evidencia, contradicciones, confianza, traza de estado, borradores de hallazgo, trazas de prioridad, `DimensionResult` por dimensión) — no es `DiagnosticResultV3` (sigue sin construirse ninguno; ver tabla de disposición abajo). `runDiagnostic` pasa a ser `explainResult(...)?.result`: una sola tubería productiva, ningún cálculo repetido.
- **Serializable de verdad, no solo de nombre:** `ResultFacts.applicable` guarda `QuestionId[]`, no los objetos `Question` completos — una `Question` con regla de routing lleva `applies: (context) => boolean`, una función, que rompía la serializabilidad exigida (§40) pese a que el comentario original lo afirmaba (hallazgo de la revisión independiente, corregido). `goalNote` en `ResultTrace` se omite por completo cuando no aplica (antes quedaba como clave con valor `undefined`).
- **`DimensionResult` por dimensión:** `id`, `evaluated` (`score !== null`), `score`, `confidenceInputs` (DIAG-V3-04, sin fórmula de confianza nueva) y `evidence` filtrada por dimensión — transporta lo mínimo pedido (§30) sin inventar un nivel de confianza que ninguna fórmula produce todavía.
- **Invariante 3 de DIAG-V3-04, fortalecido (spec §38):** el Result Engine depende de él para `DimensionResult.evaluated`; ahora se verifica sobre todas las personas/adversariales más un barrido por perfil×etapa, no un único fixture. El invariante 6 (documentado como débil en DIAG-V3-04) queda diferido tal cual — es redundante con el test de determinismo, pertenece a la capa de scoring, y la determinación/orden-independencia del RESULTADO completo ya quedan cubiertas de forma mucho más exigente por las pruebas nuevas de esta fase.
- **`DiagnosticResultV3` — tabla de disposición (ningún campo inventado, ninguno declarado listo sin serlo):**
  - **READY (ya se produce igual que hoy):** `profile`, `state`, `confidence` (global), `dimensions`, `strengths`, `gaps`, `priorities`, `nextActions`, `recommendation`, `goalNote?`, `evidence` (vía `collectEvidence`/`facts.evidence`), `context.profile`/`context.primaryGoal`/`context.answers`.
  - **UNRESOLVED (sin productor; no se inventa uno en esta fase):** `version` (`DiagnosticVersionV3` sigue siendo `never`), `context.entity`/`businessModel`/`archetype`/`niche`/`growthStage`/`customerModel`, `fingerprint` (depende de los anteriores), `overallScore` como `OverallScore` (el caso `"shown"` ya es producible con el valor actual, pero la decisión de cuándo `"withheld"` — `DIAG-V3-UX-01` — no está tomada; requiere autorización de producto, no solo ingeniería), `dimensionConfidence[].level` (sin fórmula derivable sin inventar una nueva, DIAG-V3-04/§30), `primaryBottleneck`/`secondaryBottleneck` (los bloques ya existen — issue, dimensión, evidencia — pero la regla de cuándo un hallazgo cuenta como "bottleneck" V3 no se ha decidido; no se renombra automáticamente `issue = bottleneck`).
  - **FUTURE ROUTING (requiere preguntas nuevas):** `context.primaryFriction` (la pregunta no existe todavía).
- **Revisión independiente (fresh reviewer, `feature-dev:code-reviewer` en `opus`, RAN 2026-09-26):** encontró y se corrigió, cada hallazgo verificado reintroduciendo la mutación en vivo y confirmando el fallo antes de revertir: (1) `ResultFacts.applicable: Question[]` llevaba closures `applies` en tiempo de ejecución, así que la afirmación "serializable en su totalidad" del comentario era falsa — corregido a `QuestionId[]`; (2) la prueba de serializabilidad comparaba un string contra sí mismo (`JSON.stringify` omite en silencio lo no serializable, así que nunca podía fallar) — corregida con un recorrido recursivo real del árbol de valores más un round-trip separado; (3) `findRecommendationsWithoutProvenance` solo miraba el ID resultante (`fit.id !== "estructuracion"`), así que quitar el guardia `state.id === "inicio"` en `explainServiceRecommendations` no se habría detectado — corregido para volver a comprobar la condición real contra `state`/`priorities`; (4) la prueba "goal boost no cambia..." solo comprobaba la constante `1.3`, nunca la tabla `goalBoost` en sí — corregida para fijar la tabla completa y para verificar, goal por goal, qué IDs reciben el impulso. Encontró además, sin acción requerida en esta fase: varias pruebas de paridad (`explain*().campo` vs. el envoltorio correspondiente) solo pueden fallar si el motor deja de ser determinista, no protegen contra un cambio de comportamiento por sí solas — la protección real contra eso es `characterization.test.ts` (documentado, no es un hallazgo a corregir). `git status` quedó limpio tras la revisión (sin ediciones residuales).
- **Mutation tests (A–H, aplicados en vivo y revertidos sin dejar diff):** A (`IssueId` inexistente) → falla de compilación; B (referencia a un ID de catálogo inexistente en `serviceCatalog`, que cumple el rol de "RecommendationId" — no se introdujo un contrato de ID nuevo porque los IDs de catálogo ya son estables y tipados) → falla de compilación; C (threshold de `claridad` en `classifyState`) → falla de caracterización; D (`GOAL_BOOST_FACTOR` de 1.3 a 1.5) → falla de caracterización y de pruebas semánticas; E (recomendación de servicio inventada sin `sourceIssueId`) → falla de caracterización, del detector `findRecommendationsWithoutProvenance` y de pruebas DIAG-002C existentes; F (respuesta invalidada filtrada hacia `generateIssues`) → falla de pruebas existentes de invalidación/irrelevancia sistemática y de la prueba nueva del pipeline completo (tras corregir el fixture inicial, que no ejercitaba el caso real); G (hallazgo duplicado) → falla de caracterización, del nuevo test de duplicados y de una prueba semántica existente; H (tie-breaker de prioridad invertido) → falla de caracterización y del nuevo test de determinismo de empates.
- **Sin cambio de comportamiento:** caracterización de DIAG-V3-01 (46 casos + digest de 1.125) idéntica; digest de routing (20.000 contextos) idéntico; `diagnostic-experience-check.mjs` PASS con las mismas aserciones. Cero cambios de UI, PDF, D1, KV o endpoints.
- **Pruebas:** 31 nuevas (`state-trace.test.ts`: 5; `priority-trace.test.ts`: 8; `contradictions.test.ts`: 4; `recommendation-provenance.test.ts`: 6; `result-engine.test.ts`: 8, tras la revisión), más el fortalecimiento in situ de "invariante 3" en `scoring-trace.test.ts` (sin sumar al conteo, mismo test).
- **Validación:** `test:unit` 237/237 (186 del Diagnóstico: 155 previas + 31 nuevas), `test:email` 4/4, `typecheck` real 0 errores, `build` PASS, `git diff --check` PASS, `diagnostic` E2E PASS. Rendimiento: `characterization.test.ts` (46 personas + adversariales + barrido de 1.125) en ~2.9 s; `routing-equivalence.test.ts` (20.000 contextos) en ~2.4 s — mismo orden de magnitud que fases previas, sin recalcular scoring/evidencia más de una vez por resultado. Bundle del motor del Diagnóstico: `diagnostic-*.js` (chunk del motor) +4.08 kB sin gzip / +1.33 kB gzip frente al baseline pre-fase (el chunk de la ruta `diagnostic.tsx` no cambió, 16.93 kB).

## 2026-09-26 — DIAG-V3-04 Scoring + Evidence Engine (solo local, sin deploy)

- **Evidence estructurada con productor real:** `DiagnosticEvidence` (definida en DIAG-V3-01, sin productor hasta ahora) se deriva de `Contribution` (`questionContribution`, ya existente en `scoring.ts`) mediante `deriveEvidence`/`collectEvidence` (`app/features/diagnostic/evidence.ts`, nuevo). Modelo señal/severity/confidence documentado y mínimo, sin tabla de reglas paralela.
- **Trazas derivadas del mismo cálculo, no una segunda implementación:** `accumulateDimension` (primitivo privado compartido) reemplaza el bucle interno de `scoreDimensions`; `explainDimensionScore` lo reusa para el detalle de una sola dimensión. `computeOverallScore` pasa a ser un envoltorio de `.value` sobre la nueva `explainOverallScore` — mismo patrón que `evaluateRule`/`evaluateRuleTrace` en DIAG-V3-03.
- **Insumos de confianza por dimensión, sin fórmula nueva:** `computeDimensionConfidenceInputs` expone `evidenceCount`/`applicableCount`/`unknownCount`/`contradictionCount`/`coverage`; `contradictionCount` es global (documentado: `detectContradictions` no clasifica hoy por dimensión, y clasificarlo pertenece al Result Engine de DIAG-V3-05).
- **BUG-01 caracterizado, no corregido:** `classifyState`'s `clarityWeak && (… || true)` (`result.ts:94`) existe sin cambios desde el commit de nacimiento del archivo; el contrafactual (quitar `|| true`) permitiría llegar a "sistema"/"consolidado" con claridad débil, contradiciendo el resto del modelo de prioridades del propio archivo. Conclusión: más cerca de C que de A; sin cambio de código en `result.ts` (fuera de alcance).
- **`result.ts`/`recommendations.ts` sin ningún cambio:** confirmado que `goalBoost` (×1.3) vive en `prioritize()`, no en scoring — verificación, no corrección.
- **Sin cambio de comportamiento:** caracterización de DIAG-V3-01 (46 casos + digest de 1.125) idéntica; digest de la tabla de verdad de routing (20.000 contextos) idéntico, sin tocar `questions.ts`/`routing.ts`.
- **Pruebas:** 25 nuevas (`evidence.test.ts`: 8; `scoring-trace.test.ts`: 17). 6 mutaciones manuales (`DimensionId` inexistente, `OptionId` inexistente, contribución modificada, N/A convertido en penalización, evidencia desde una lista `applicable` desactualizada tras invalidación, evidencia duplicada) aplicadas y revertidas para demostrar que las protecciones funcionan (ver `TESTING.md`).
- **Revisión final:** un revisor independiente (`feature-dev:code-reviewer`, modelo `opus`) encontró 5 hallazgos "Important" (0 Critical): `scoreDimensions` no reusaba `explainDimensionScore` (dos implementaciones de la misma fórmula); la prueba de orden-independencia no podía detectar dependencia de orden; las pruebas de "respuesta invalidada" no ejercitaban el contrato propio de `collectEvidence`; `coverage` dejaba que «no aplica» redujera la confianza; `source.answer` no normalizaba la respuesta observada. Los cinco se corrigieron en el mismo corte, cada uno verificado con una prueba nueva más la suite completa en verde.
- **Validación:** `test:unit` 206/206 (155 del Diagnóstico), `test:email` 4/4, `typecheck` real 0 errores, `build` PASS, `git diff --check` PASS, `diagnostic` E2E PASS. Rendimiento: barrido de 1.125 combinaciones (scoring + evidencia) en ~448 ms. Cero cambios de UI, PDF, persistencia, D1 o KV.

## 2026-09-26 — DIAG-V3-03 Routing Engine (solo local, sin deploy)

- **Motor de reglas declarativo:** las 23 closures `applies` de `APPLICABILITY` pasan a `ROUTING_RULES: Partial<Record<QuestionId, Rule>>` (`app/features/diagnostic/routing.ts`), un DSL de datos serializables (`answered`/`eq`/`notEq`/`in`/`multiExcluding`/`multiIntersects`/`and`/`or`/`not`) evaluado por un único evaluador puro (`evaluateRule`, envoltorio de `evaluateRuleTrace`: una sola pasada, sin una segunda semántica para combinar `and`/`or`/`not`).
- **`dependsOn` derivado, no declarado:** `collectDependencies(rule)` recorre el árbol de cada regla; cierra `DIAG-V3-CYCLE-001` (el grafo que valida `findDependencyCycles()` es, por construcción, el mismo que evalúa `evaluateRule()`).
- **Opción safety preservada (DIAG-V3-02):** los builders (`eq`, `notEq`, `isIn`, `multiExcluding`, `multiIntersects`) son genéricos sobre `OptionIdOf<Q>`; un literal que no es opción real de su pregunta no compila.
- **Inspección interna:** `evaluateRuleTrace`/`explainApplicability` añaden traza y código de razón (`stage_mismatch`/`profile_mismatch`/`dependency_unanswered`/`rule_false`/`rule_true`) derivados de la misma evaluación; no se exponen en UI ni se persisten.
- **`routing.ts` sin dependencia de valor hacia `./questions`:** solo importa tipos, así que no depende de qué archivo del módulo se cargue primero.
- **Sin cambio de comportamiento:** las 23 closures originales (congeladas verbatim, nunca importadas en producción) frente al evaluador declarativo sobre 20.000 contextos aleatorios → 0 divergencias, mismo digest SHA-256 antes y después de la migración; caracterización de DIAG-V3-01 (46 casos + digest de 1.125) idéntica.
- **Pruebas:** 30 nuevas (`routing.test.ts`, `routing-equivalence.test.ts`, `routing-standalone.test.ts`, `invalidation.test.ts`). 4 mutaciones manuales (regla con `QuestionId` inexistente, valor de opción inexistente, dependencia circular, auto-dependencia) aplicadas y revertidas para demostrar que las protecciones funcionan (ver `TESTING.md`).
- **Revisión final:** un revisor independiente (`feature-dev:code-reviewer`, modelo `opus`) encontró 6 hallazgos "Important" (option safety débil en los builders, doble semántica de evaluación en `evaluateRuleTrace`, duplicación de `inquiriesArrive`, un ciclo de importación latente entre `routing.ts`/`questions.ts`, una prueba de "cambio hacia atrás" que no podía fallar bajo ningún comportamiento real, y esta entrada de changelog ausente); los seis se corrigieron en el mismo corte, cada uno verificado con TDD o una mutación en vivo, más la suite completa en verde.
- **Validación:** `test:unit` 181/181 (130 del Diagnóstico), `test:email` 4/4, `typecheck` real 0 errores, `build` PASS, `git diff --check` PASS, `diagnostic` E2E PASS. Cero cambios de UI, PDF, persistencia, D1 o KV.

## 2026-09-26 — DIAG-V3-02 Question Registry (solo local, sin deploy)

- **Fuente canónica única:** `QUESTION_DEFINITIONS` en `questions.ts` (26 preguntas, `version: 1`) reemplaza al array `questions` como definición; `QuestionId`/`QUESTION_IDS` se derivan de ahí (antes eran una lista paralela mantenida a mano en `contracts.ts`).
- **Opciones tipadas por pregunta:** `OptionIdOf<Q>` liga cada opción a su pregunta; `AnswerFor<Q>` calcula la forma de la respuesta (opción única o lista); `Answers` pasa a `{ [Q in QuestionId]?: AnswerFor<Q> }`. Una opción de `capture` ya no compila como opción de `follow_up`, y `singleAnswer`/`multiAnswer` sustituyen las comparaciones de string sin tipar en `result.ts` y `recommendations.ts` (cierra `DIAG-V3-DEBT-01`).
- **Opciones single/multi como unión discriminada:** una pregunta `single` no admite `exclusive` ni `kind: "none"` (ni compila); antes eran campos opcionales sin relación con el tipo.
- **Aplicabilidad separada de la definición:** `APPLICABILITY` documenta, por pregunta, su `dependsOn` (qué otras respuestas lee la condición) junto al mismo closure `applies` de siempre; `getDependencyGraph()`/`findDependencyCycles()` confirman que el grafo es acíclico. Las closures no se tocan: eso es DIAG-V3-03.
- **Deuda resuelta:** `inquiriesArrive` y `selectedValues`, antes duplicadas en dos archivos, viven una sola vez en `questions.ts` (`DIAG-V3-DEBT-02`).
- **Sin cambio de comportamiento:** caracterización de DIAG-V3-01 (46 casos + digest de 1.125) idéntica; tabla de verdad de `applies` sobre 20.000 contextos aleatorios con el mismo digest; volcado estructural del banco de preguntas con igualdad profunda exacta (mismo orden, mismas opciones, mismos textos).
- **Pruebas:** 11 nuevas en `registry.test.ts` (integridad, dependencias completas y exactas sobre 150 contextos, ausencia de preguntas inalcanzables y de referencias muertas). 4 mutaciones manuales aplicadas y revertidas para demostrar que las protecciones funcionan (ver `TESTING.md`).
- **Validación:** `test:unit` 161/161 (110 del Diagnóstico), `test:email` 4/4, `typecheck` real 0 errores, `build` PASS, `git diff --check` PASS, `diagnostic` E2E PASS. Cero cambios de UI, PDF, persistencia, D1 o KV.

## 2026-09-26 — G7: migración `0010` en producción (sin redeploy)

- `0010_licensing-foundation` aplicada en `vecidya-prod` con `wrangler d1 migrations apply vecidya-prod --remote` (18:13:50Z–18:13:55Z). Era la única pendiente; el SQL no cambió desde `406268c` y es puramente aditivo.
- Bookmark Time Travel previo: `000000c2-00000000-000050f2-004d78b46378f119dd422e95a4ce30e4` (no usado).
- Verificado en remoto: ninguna migración pendiente; 6 tablas, 6 índices y 6 FK idénticos al SQL; precios Cuadra/Barrio/Ciudad `USD 39/59/89` y 4 tramos de portafolio, cada uno una vez; sin violaciones de FK. Smoke HTTP PASS; rutas protegidas siguen en 302 `/login`; `/__health/db` `ok`.
- Sin redeploy (el Worker sigue en `f7fc35a6`), sin cambios de código, KV, bindings, secretos ni versión (`0.5.7`). Cierra `LICENSE-MIGRATION-001`. Nueva deuda menor: `HEALTH-ENV-001`.

## 2026-09-26 — Release `0.5.7` (G6: reconciliar producción con `main`, LIVE)

- **Publicado:** `pnpm wrangler deploy` a las 17:51Z, Version ID `f7fc35a6-cb4f-48f0-ba73-5d2eea3c34f0`, commit `f5ab660`. Rollback identificado, no usado: `582a5c38-d1d4-4f3c-8ba5-e9424717fcb3`.
- **`LEARN-META-001` resuelta en producción:** antes, los 4 artículos de Aprende salían como «Artículo no encontrado», `noindex, nofollow` y canonical a `/aprende`; ahora tienen título real, `index, follow`, canonical individual y descripción propia. El slug inexistente sigue en 404.
- **Smoke de producción:** HTTP y navegador 14/14 (Home, puerta «Artista o creador de contenido», «Director Comercial», Diagnóstico completo, login, `/app` 302, `www` 301, sin errores JS).
- **Migración `0010`:** pendiente en `vecidya-prod`. El usuario pidió aplicarla, pero el clasificador de permisos del agente bloqueó el `apply` remoto; D1 sin cambios (`LICENSE-MIGRATION-001`, G7).

- **Versión:** `0.5.6` → `0.5.7` (PATCH). Sigue el precedente del proyecto: cada release publicado recibe su versión, y un PATCH es un cambio visible sin capacidad nueva (`0.5.1`). Este release lleva la corrección de producción `LEARN-META-001`, dos cambios de texto visibles (terminología) y cambios internos sin efecto observable (DIAG-V3-01, TYPECHECK-001, REPO-EOL-001).
- **Contenido:** `c60979f`, `0887707`, `905d310`, `d0235d8`, `bdae3fc`, `b0264ce` y este commit. Sin migraciones, bindings, secretos, D1 ni KV.

## 2026-09-26 — DIAG-V3-01 Domain contracts, TYPECHECK-001 y REPO-EOL-001 (solo local, sin deploy)

- **DIAG-V3-01 (`905d310`, cerrada técnicamente y pendiente de aprobación):**
  - `contracts.ts` define:
    - `DiagnosticVersion`: «2.0» es el motor actual; `DiagnosticVersionV3` es `never` hasta que exista un motor V3.
    - `QuestionVersion`, y las listas cerradas `QUESTION_IDS`, `ISSUE_IDS` y `CORE_DIMENSION_IDS`.
    - `Resolution<T>`, una unión discriminada `resolved | unresolved` con motivo y candidatos.
    - Los conceptos V3 `EntityType`, `BusinessModel`, `OperationalArchetype`, `NicheId` (nominal y validado), `GrowthStage`, `CustomerModel` (alcance × comprador), `PrimaryGoal`, `PrimaryFriction`, `DiagnosticEvidence` y `DimensionConfidence`, más `DiagnosticContextV3` y `DiagnosticResultV3`.
  - `mappings.ts` traduce legacy → V3 sin casts:
    - Etapa: solo «idea» se resuelve; el `growing` actual queda sin resolver frente al `growing` V3.
    - Perfil → entidad + arquetipo, solo donde la equivalencia es segura.
    - «unsure» es la ausencia declarada de un objetivo.
  - `Answers`, `Question.id` e `Issue.id`/`after` usan IDs tipados: solo cambian anotaciones y el resultado añade `version`.
  - La caracterización se fijó sobre `0887707` antes del cambio y sigue idéntica. Se añaden 14 pruebas de contrato y 13 afirmaciones de compilación.
- **TYPECHECK-001 (`d0235d8`), por instrucción del usuario («0 errores ni warnings heredados»):**
  - `pnpm run typecheck` ejecutaba `tsc` sin `-b` sobre un tsconfig «solution» y no comprobaba ningún archivo. Ahora usa `tsc -b` e incluye `db/` y los archivos de configuración raíz.
  - Corregidos 20 TS6307, 5 errores reales y 1 TS2883. Uno de ellos era un **defecto de producción** (`LEARN-META-001`): `meta({ data })` no recibe datos en React Router 8, así que cada artículo de Aprende se publica como «Artículo no encontrado», con `noindex, nofollow` (HTTP 2026-09-26T16:40Z). Se añade la regresión en `learn-experience-check.mjs`.
  - Better Auth perdía la inferencia de `activeOrganizationId` cuando el array de plugins salía de una función. Ahora el plugin se crea con un factory y `plugins: [...]` va en línea, con la misma política compartida con el CLI.
- **REPO-EOL-001 (`bdae3fc`):** `.gitattributes` `* text=auto eol=lf`. El working tree se normalizó sin cambios de contenido versionado.
- **Validación:**
  - Estáticas: `test:unit` 150/150, `test:email` 4/4, `typecheck` 0 errores, `build` PASS y `git diff --check` PASS.
  - E2E PASS: `diagnostic`, `learn`, `authz` 143/143, `team-ui` 91/91, `acct`, `bpx` y `admin-business-profiles`.
  - E2E que fallan como en la base: `px-a` y `pe-b` (deuda conocida). `invite-flow` es intermitente en ambos lados (`TEST-INVITE-FLAKY-001`).
- **Sin** cambios de routing, scoring, resultados visibles, PDF, D1, KV, endpoints ni versión. `LEARN-META-001` sigue en producción hasta un deploy autorizado.

## 2026-09-26 — DIAG-V3-00 Auditoría del Diagnóstico y micro-checkpoint de terminología (solo local, sin deploy)

Abre el bloque **DIAG-V3 (Diagnostic Engine V3)**, autorizado por el usuario fase a fase. El prefijo `DIAG-V3-XX` evita reutilizar `DIAG-001/002/003`, que ya pertenecen al historial.

- **DIAG-V3-00 (auditoría de solo lectura, aprobada):** baseline sobre `bb8ba3b` en verde (`test:unit` 135/135, 84 del Diagnóstico; `test:email` 4/4; `typecheck`; `build`; E2E `diagnostic` en 4 viewports). Se trazó el flujo real (entrada por deep link → 26 preguntas filtradas por `applies` → scoring por 7 dimensiones → estado, prioridades y recomendación → sin almacenamiento) y se comparó con el plan V3. Conclusión aceptada: V3 evoluciona el motor existente, no lo reemplaza. Hallazgos registrados en `STATUS.md` (`DIAG-V3-BUG-01`, `-DEBT-01`, `-DEBT-02`, `-UX-01`, `-PDF-01` y `-PRIVACY-01`); el PDF actual mide 4–5 páginas.
- **Terminología (`c60979f`):** la etiqueta visible del perfil `creator` pasa de «Mi marca o trabajo como creador» (Diagnóstico) y «Creador» (puerta de Home) a «Artista o creador de contenido», conservando el ID `creator`. En `/nosotros`, «Gerente Comercial» pasa a «Director Comercial». Solo cambió el E2E que dependía de esas etiquetas. «Cuentas → Clientes» no se aplicó: todas las apariciones actuales de «cuenta» son de autenticación o internas (`billing_account`); la regla queda en `ROADMAP.md`.
- **Documentación:** `ROADMAP.md` registra DIAG-V3 con sus fases, el gate PRIVACY + DATA CONTRACT antes de DIAG-V3-06 y las restricciones de KV. Se corrigen dos desviaciones verificadas: `AGENTS.md` decía 13 documentos canónicos y hay 15 versionados; `TESTING.md` y `TEST-GAPS-001` decían 75 pruebas del Diagnóstico y son 84.
- **Sin cambios de** routing, scoring, resultado, PDF, esquema, migraciones, bindings ni versión (`package.json` sigue en `0.5.6`, que es la versión en producción; la versión sube con el próximo release autorizado).

## 2026-09-26 — DIAG-003 Puntaje global y exportación a PDF (`0.5.6`, LIVE)

Corrige el nombre de un plan externo pegado por el usuario («DIAG-002») al identificador real disponible: DIAG-002/DIAG-002B/DIAG-002C ya estaban cerrados y LIVE, así que este bloque se abrió como `DIAG-003`, aditivo sobre el motor existente (`app/features/diagnostic`) y sin reabrir ninguna decisión ya cerrada de DIAG-002B.

- **`overallScore` (0-100):** `computeOverallScore()` en `scoring.ts` pondera el `score` de cada dimensión evaluada por su propio `evidence`, la misma metodología que ya usa `scoreDimensions()` un nivel abajo — no un promedio simple. Una dimensión débil con poca evidencia no domina el puntaje global (verificado con una persona base de 7/7 dimensiones en 100 y solo `confianza` debilitada a 33: `overallScore` queda en 91, «buen estado», mientras `confianza` sola sería «prioridad»).
- **Clasificación visual de 3 niveles, aditiva:** `visualStatusFor(score)` devuelve `priority` (<50) / `developing` (50-74) / `healthy` (≥75) para colorear cualquier porcentaje (global, por dimensión, por prioridad). Es un sistema **nuevo y separado** del de 4 niveles de madurez ya existente (`levelFor`/`DimensionLevel`, `inicial`/`parcial`/`solida`/`consolidada`): no lo sustituye ni cambia su lógica, solo aporta color/icono a la UI.
- **Porcentaje visible (cierra una brecha de accesibilidad real):** DIAG-002B había decidido deliberadamente no mostrar números en las dimensiones («niveles sin números visibles»); en la práctica esto dejaba el porcentaje real solo insinuado por el ancho de una barra, invisible para cualquiera que no pueda comparar anchos con precisión. Este bloque lo revierte: cada dimensión y cada prioridad muestra su porcentaje como texto (`<strong>NN%</strong>`) con `aria-label` equivalente, además del icono de estado.
- **Prioridades reutilizadas, no recalculadas:** el plan pegado por el usuario proponía «las 3 dimensiones con menor puntuación» como prioridades; el motor ya calcula `result.priorities` de forma más sofisticada (gravedad × clase × relevancia del objetivo × confianza, con dependencias, tope de 3) desde DIAG-002B. Se mantuvo ese cálculo intacto y solo se le agregó una insignia de estado (icono + porcentaje) mostrando la dimensión afectada por cada prioridad.
- **Puntaje global destacado:** un bloque «Tu diagnóstico: NN%» cerca del inicio del resultado, con icono de estado.
- **Exportación a PDF sin dependencias nuevas:** un botón «Descargar mi diagnóstico (PDF)» llama a `window.print()` sobre un bloque `@media print` dedicado (oculta cabecera/pie/stepper/CTAs, agrega una cabecera de impresión con marca y fecha, evita cortes de página dentro de tarjetas y fuerza el color de fondo de badges/barras). Decisión explícita: ninguna librería de generación de PDF, coherente con el minimalismo ya establecido del proyecto (sin gestor de estado, sin kit de UI).
- **Iconos reales, no dibujados a mano:** el usuario corrigió el enfoque a mitad de bloque («usa los iconos de Diagnóstico Assets con el MCP») tras ver un primer intento con 3 SVG dibujados a mano; se extrajeron 3 iconos reales (rostros 3D rojo/amarillo/verde) del sprite `Disnostico Assest.png` que el usuario proveyó, vía el MCP `motonexo-assets` (`extract_assets` directo sobre el original, sin `repair_transparency` — los píxeles de borde ya eran transparentes; un primer intento con `repair_transparency` a radio 10 sí destruyó detalles faciales y se descartó), normalizados a canvas cuadrado y convertidos a WebP (192×192, ~5.5-5.9 KB cada uno). Los 3 SVG dibujados a mano se eliminaron una vez wireados los WebP reales.
- **Limpieza de assets (a pedido explícito del usuario):** verificadas cero referencias a los SVG eliminados antes de borrarlos; borrados los archivos intermedios de la extracción (`diagnostico-status-repaired.png`, `diagnostico-status-extracted/`, `diagnostico-status-extracted-v2/`, `diagnostico-status-final/`) fuera del árbol del producto, en la carpeta de staging del usuario. Auditoría de `public-assets.ts` encontró 13 claves preexistentes sin ningún uso en código, ajenas a este bloque (fondos, ilustraciones, diagramas de Aprende); no se tocaron por disciplina de alcance — quedan registradas como `ASSET-UNUSED-001` en `STATUS.md`.
- **Defecto real encontrado y corregido dentro del mismo bloque, tras el primer deploy:** el usuario reportó por captura que «Tus dimensiones» se veía roto. Reproducido con Playwright en 600-1366px: el icono de estado y el porcentaje de cada dimensión se apilaban verticalmente y se pintaban fuera de su fila, superpuestos con la siguiente — un defecto de pintado (overflow visual, no de layout) que el chequeo de overflow existente (compara solo el borde derecho contra el viewport) no detecta. Causa: un selector preexistente `.diagnostic-dimensions dd span` (pensado solo para la barra de progreso) tiene más especificidad CSS que la nueva clase `.diagnostic-dimensions__value` y le forzaba `display:block; height:0.55rem`, apilando el icono (bloque) sobre el porcentaje (bloque) en vez de dejarlos en línea. Corregido acotando el selector a `dd span.diagnostic-dimensions__bar`. Se añadió una regresión E2E dedicada (confirmada en RED contra el defecto reintroducido a propósito y GREEN tras el fix) antes de redesplegar.
- **TDD:** `computeOverallScore`/`visualStatusFor` con 9 pruebas nuevas (`scoring.test.ts`, RED con el export faltante → GREEN); `diagnostic-experience-check.mjs` con la aserción heredada de DIAG-002 «sin números de puntuación» reemplazada (quedó en RED contra el nuevo porcentaje visible, por diseño) y nuevas aserciones de puntaje global, porcentaje por dimensión/prioridad, iconos y botón de PDF.
- **Pruebas:** `test:unit` pasa de 126 a **135** (84 del motor del Diagnóstico). `diagnostic-experience-check.mjs` PASS en 1366/768/390/360.
- **Validación:** `typecheck`, `build` y `git diff --check` PASS. Sin migraciones (este bloque no toca D1).
- **Reestructuración del resultado, a pedido del usuario tras el 2.º deploy:** la sección «Encaje con Vecidya» (licencia/servicios/addons/Aprende) se movió a después de la fila de botones de acción («Revisar con Vecidya», «Ir a Contacto», «Descargar PDF», «Rehacer»), como lo último del resultado. El título del resultado dejó de usar el tamaño tipo-portada compartido con las preguntas del recorrido y bajó a `clamp(1.6rem,2.6vw,2.35rem)`; los párrafos del resultado pasaron de `max-width:44rem` a `58rem` (menos líneas envueltas, mejor uso del ancho de la tarjeta); el espaciado entre secciones bajó de `1.2rem` a `1rem`; y `@media print` recibió su propio ajuste (gap, título y márgenes más chicos) para un PDF más denso. Verificado con Playwright en pantalla (1366/390) y en vista de impresión antes de desplegar.
- **Deploy** (autorizado explícitamente por el usuario: «y despliega cuando termines», luego «y desplie cuando corrijas» tras el defecto, luego la reestructuración): tres cortes bajo `0.5.6` — el primero (Version ID `1ce335f5-b7dd-422a-80a4-9ac9a6a9ff33`) publicó la funcionalidad completa pero con el defecto visual descrito arriba, encontrado por el usuario después del deploy; el segundo (`f6c3c25e-16fe-4fa4-8b15-ad00fe352bc0`) publica la corrección; el tercero (Version ID **`582a5c38-d1d4-4f3c-8ba5-e9424717fcb3`**) publica la reestructuración del resultado. HTTP anónimo antes/después de cada corte en `ENVIRONMENTS.md`. Resultado final: **`0.5.6 PRODUCTION PASS`**.
- **Deliberadamente fuera de alcance:** auditoría axe automatizada (`DIAG-002-A11Y-AXE` sigue abierta); persistencia con consentimiento; limpieza de los 13 assets preexistentes sin uso ajenos a este bloque.

## 2026-09-25 — LICENSE-STRATEGY-001 Multi-Business Licensing & Pricing Foundation (solo local, sin deploy)

Cierra la foundation del modelo de licencias multi-negocio: separa quién paga (`billing_account`) de la membresía de Better Auth, versiona el precio de cada plan (grandfathering real), configura el descuento por portafolio como datos en vez de `if`s, y prepara —sin implementar el cálculo— un motor de promociones. Sin checkout, sin proveedor de cobro, sin UI de Admin nueva y sin deploy, todo por instrucción explícita del bloque.

- **Principio:** 1 organización = 1 negocio = 1 licencia. La cantidad de organizaciones de una persona nunca depende del plan de ninguna de ellas.
- **`billing_account` ≠ `member`:** pertenecer a una organización (incluida una invitación aceptada) nunca hace que su licencia cuente para el portafolio de otra persona. En V1, una persona controla como máximo un `billing_account` (único `owner_user_id`).
- **6 tablas nuevas** (`db/schema/licensing.ts`, migración `0010`, 23 tablas totales): `billing_account`, `license_price` (versión de precio con `effective_from`/`effective_to`, 3 filas sembradas: Cuadra `USD 39/mes`, Barrio `USD 59/mes`, Ciudad `USD 89/mes`, las mismas que publica `/licencias`), `organization_license` (conserva su `price_id` contratado), `portfolio_pricing_tier` (4 filas sembradas: 1→0%, 2→10%, 3-4→15%, 5+→20%, la escalera aprobada por el usuario), `promotion` y `billing_account_promotion`. Todo en centavos enteros y basis points; ningún `float`.
- **Calculador puro** (`db/pricing/calculator.ts`, sin acceso a base de datos, determinístico): 21 pruebas unitarias, incluidos los montos exactos del usuario (1 Cuadra $39.00, 2 Cuadra $70.20, 3 Cuadra $99.45, 5 Cuadra $156.00, Cuadra+Barrio $88.20, Cuadra+Barrio+Ciudad $158.95), líneas no activas excluidas, y las reglas de promoción: expirada o aún no vigente no se aplica, un mínimo de organizaciones no cumplido no se aplica, una promoción no apilable nunca se combina con otra —ni con una apilable—, y dos apilables sí se suman. `free_license` queda representable en el schema desde V1 pero su cálculo no está implementado, tal como autorizaba el encargo.
- **Grandfathering real:** una licencia ya contratada resuelve su precio por el `price_id` que guarda, nunca por `plan_code` + fecha actual. Publicar un precio nuevo no cambia lo que ya paga quien contrató antes.
- **Cambio de plan sin mutar en el sitio:** `changeOrganizationLicensePlan` cancela la fila vigente (conserva historial) y crea una nueva; nunca toca otras organizaciones del mismo `billing_account`.
- **Solo `platform_admin`:** `/api/platform/organizations/:id/license` (mismo patrón que `/services` e `/integrations`) asigna, cambia de plan, suspende/reactiva y transfiere de `billing_account`, auditado en `platform_audit_log`. Crear una organización no activa una licencia pagada por sí sola.
- **Hallazgo de build:** una ruta de React Router no puede importar directamente un módulo `db/` sin sufijo `.server`, aunque sea puro y sin efectos secundarios (el análisis de fronteras servidor/cliente lo rechaza igual). Se resolvió envolviendo el calculador en la capa `.server`. Detalle en `TESTING.md`.
- **Hallazgo de limpieza de fixtures:** `billing_account.owner_user_id` y `platform_audit_log.organization_id`/`actor_user_id` no cascadan desde `user`/`organization` (a propósito: conservan historial de facturación y auditoría). El orden correcto de borrado es auditoría → organización → billing_account → usuario.
- **Pruebas:** `tests/unit/licensing/calculator.test.ts` (21) y `tests/e2e/platform-licensing-check.mjs` (`platform-licensing`, 27, en `test:e2e`). `test:unit` pasa de 105 a 126. Regresión (`authz`, `psa`, `admin-shell`, `admin-orgs`, `acct`) PASS sin cambios.
- **Validación:** `typecheck`, `build` y `git diff --check` PASS. Migración `0010` aplicada y verificada **solo en D1 local**; no se tocó D1 remota.
- **Deliberadamente fuera de alcance:** UI de Admin (ver `LICENSE-ADMIN-UI-001`), checkout, proveedor de cobro, entitlement enforcement (todavía no se bloquea ninguna capacidad por plan) y aplicar `0010` a remoto.
- **Deuda:** `LICENSE-STRATEGY-001` CERRADA. Nuevas: `LICENSE-ADMIN-UI-001`, `LICENSE-REMOTE-MIGRATION-001`. `AUTH-ABUSE-001` se actualiza: el modelo de «plan activo» ya existe, pero `organization/create` todavía no hace cumplir ningún límite.
- **Siguiente bloque propuesto por el usuario:** `ACCOUNT-001 — Registration & Multi-Business Portfolio`. No autorizado; no se inicia automáticamente.

## 2026-09-25 — Precio público de licencias en USD (`0.5.5`, LIVE)

A pedido explícito del usuario, que confirmó moneda, periodicidad y que es precio real listo para publicar (no un borrador): `/licencias` deja de decir «Aún no hay precios públicos» y muestra el precio mensual de cada licencia.

- **Montos:** Cuadra `USD 39/mes`, Barrio `USD 59/mes`, Ciudad `USD 89/mes`. Son los mismos que ya existían como referencia comercial en `docs/business/VECIDYA_PRODUCT_CATALOG.md` desde UX-002.1 (`$39`/`$59`/`$89`, sin moneda confirmada); ese documento se actualiza para reflejar que ahora son precio público, no borrador.
- **Qué no cambia:** sigue sin existir contratación en línea, checkout ni cobro automático. La nota bajo el título lo aclara y el CTA de cada tarjeta sigue siendo «Consultar disponibilidad» hacia `/contacto`. Addons y servicios siguen sin precio público (`docs/business/VECIDYA_PRODUCT_CATALOG.md` los deja «por definir»); este cambio es solo de licencias.
- **TDD:** `licenses-experience-check.mjs` y `commercial-experience-review-check.mjs` se editaron primero para exigir el precio público y quedaron en RED contra el código anterior (que todavía afirmaba la ausencia de precios). Al mostrar el precio como interpolación de texto simple con `strong`/`span`, el HTML separaba «USD 39» de «/mes» con la etiqueta intermedia y el primer intento de implementación seguía en RED; se resolvió componiendo el texto como una sola cadena (`` `USD ${precio}/mes` ``) antes de interpolarlo, evitando el mismo problema de nodos de texto partidos por comentarios de hidratación ya visto en INVITE-UI-001. GREEN después.
- **Deploy:** autorizado explícitamente por el usuario. Commit `87ca30b`, Version ID **`cebd0a92-3560-4298-8a3b-5df0c6209477`** (2026-09-25T23:20:06Z), sin migraciones. HTTP anónimo antes/después: pie `0.5.4` → `0.5.5`; `/licencias` sin precios → con los tres precios y sin el texto «Aún no hay precios públicos». Resultado: **`0.5.5 PRODUCTION PASS`**. Detalle completo en `ENVIRONMENTS.md`.

## 2026-09-25 — INVITE-UI-001 Team & Invitation UX (`0.5.4`, LIVE)

Pule `/app/organization` sin tocar la lógica de INVITE-001 ni la matriz de AUTHZ-BA-001. Las acciones del servidor conservan las mismas guardas y llamadas a Better Auth; solo cambian la presentación, el feedback y el texto de éxito al crear.

- **Formulario «Invitar miembro»:** reutiliza `.form-grid`, `.field-note` y `Button` («Enviar invitación»). Lleva «Correo electrónico» y «Rol» (Administrador o Miembro, con Miembro por defecto) y el texto de apoyo «La persona recibirá un correo con un enlace para unirse a tu organización.». `.invite-form` no tenía ninguna regla CSS: por eso se veía roto.
- **Ayuda de roles derivada de la matriz real:** el loader pasa `getPermissionsForRole(...)` y `app/lib/team-labels.ts` lo redacta. Administrador: «Puede editar y publicar el perfil del negocio y gestionar el equipo: invitar personas, cambiar roles y retirar miembros.» Miembro: «Puede ver el perfil del negocio y quién forma parte del equipo, sin hacer cambios.»
- **Roles y estados en español:** Propietario, Administrador y Miembro; Pendiente, Aceptada, Cancelada, Expirada y Rechazada. Los valores internos no cambian.
- **Pendientes e historial separados:**
  - Pendientes vigentes: correo, rol, «Enviada el … · vence el …», estado y «Cancelar invitación», con nombre accesible que incluye el correo.
  - Historial (aceptadas, canceladas y expiradas) debajo, sin acciones.
  - Estados vacíos «Todavía no tienes invitaciones pendientes.» y «Aún no hay invitaciones anteriores.».
- **Feedback junto a la tarjeta de la acción** (`role="status"` para éxito, `Alert` con `role="alert"` para error): «Invitación cancelada.», «Rol actualizado.» y los errores. Al crear dice «Invitación creada para …» y ya no «enviada», porque Better Auth no informa si el correo falló (`INVITE-DELIVERY-SILENT-001`). El formulario se vacía tras crear.
- **Texto obsoleto retirado:** «No se simula la entrega: el proveedor de correo está pendiente.» y «Las invitaciones requieren correo transaccional real.».
- **Miembros:** nombre, correo, «Tu cuenta» y rol en español. Los controles de rol y retirada solo aparecen a quien tiene el permiso, y nunca en filas de propietario (Better Auth protege al owner). «Propietario» solo se ofrece si quien mira es propietario. El servidor sigue decidiendo: ocultar no es la guarda.
- **Responsive y jerarquía:** los títulos de tarjeta y de sección tenían el tamaño del texto normal por el reset de Tailwind; ahora `1.4rem` y `800`. En móvil (≤900 px) la identidad va a lo ancho y los badges y controles en línea; la regla nueva usa `.members-list > .member-row` para no depender del orden de la cascada. La cabecera de la tarjeta se envuelve.
- **Pruebas:**
  - `tests/e2e/organization-team-ui-check.mjs` (`team-ui`, en `test:e2e`): 91 comprobaciones en 1366/768/390/360, feedback, vistas de admin y de member y organización vacía.
  - `tests/unit/invitations/team-labels.test.ts` (5).
  - El RED de `team-ui` quedó en 14/16 tras corregir el arnés: Playwright exige declarar `secure` en la cookie `__Secure-` de Better Auth.
  - En el GREEN, 81/91 al principio, por dos motivos: el nombre accesible del selector envuelto en su etiqueta incluía la opción elegida («Rol Miembro»), resuelto con `aria-label="Rol"`; y la lectura del historial justo tras cancelar era una carrera de renderizado, resuelta con una espera explícita. Luego 91/91.
- **Deploy** (autorizado explícitamente por el usuario, mismo criterio que REL-005B): commits `a7a4961` y `0b0797e`, Version ID **`cce6aa0b-7988-4525-81c1-f44a5ef3accd`** (2026-09-25T18:15:33Z), sin migraciones. HTTP anónimo: pie `0.5.4`; CSS de `/login` con `invitation-section`/`role-guide` (misma huella que el bundle local); invitación sin sesión `200` con «Crear cuenta»; allowlist de AUTHZ intacta; WhatsApp sin grupo. Detalle en `ENVIRONMENTS.md`. Resultado: **`0.5.4 PRODUCTION PASS`**.
- **Checks manuales pendientes del usuario** (login y cambio de organización; invitación real con correo controlado): **NOT PERFORMED**, sin cuenta ni buzón controlados; no bloquean el cierre, según indicó el usuario.

## 2026-09-25 — INVITE-001 Functional Invitation & Onboarding Flow (`0.5.3`)

Cierra el flujo funcional de invitaciones sin rediseño visual (`INVITE-UI-001` sigue abierta) y sin tocar la matriz de AUTHZ-BA-001.

- **Reproducción previa (RAN, Better Auth 1.7.5):**
  - Sin sesión, `302 /login` y la invitación se perdía.
  - Con cuenta equivocada, sin verificar, cancelada, expirada, ya aceptada o inexistente, la página daba `500` «Error inesperado».
  - Better Auth responde el mismo `400 INVITATION_NOT_FOUND` a cancelada, expirada, aceptada e inexistente.
  - El registro navegaba fijo a `/app` sin enviar verificación, y recargar tras aceptar daba `500`.
- **Flujo nuevo:**
  - `/app/invitations/:id` resuelve el estado con reglas puras (`db/invitation-rules.ts`) leyendo la invitación en D1. Aceptar sigue siendo exclusivo de Better Auth.
  - Sin sesión: «Crear cuenta» e «Iniciar sesión» con `redirectTo`, restringido a rutas `/app` (`app/lib/safe-redirect.ts`).
  - Registro desde una invitación: envía el enlace de verificación con retorno a la invitación e informa si el envío funcionó. La página permite reenviarlo; si el correo no está configurado responde `503` con un mensaje honesto.
  - Aceptar lleva a `/app` con la organización invitada activa. La membresía toma el rol invitado, nunca owner.
  - Ya aceptada: «Ya formas parte de…» y un botón que activa la organización.
- **Errores controlados:** cuenta equivocada `403`, con el correo enmascarado y sin organización ni estado; inexistente `404`; cancelada, rechazada o expirada `410`, con «Esta invitación fue cancelada.» y «Esta invitación ha expirado.». Solo un fallo inesperado del servidor llega al mensaje genérico.
- **Cancelación:**
  - Solo cuentan como pendientes, y solo se pueden cancelar, las invitaciones pendientes y vigentes. El resto aparece en un historial con su estado.
  - Cancelar algo que ya no está pendiente devuelve `409` por API y un error controlado en la página; Better Auth, por su cuenta, lo volvería a marcar como cancelado. No se borra ninguna invitación.
  - Invitar a un correo que ya tiene invitación pendiente, o que ya es miembro, se explica con precisión en vez de culpar al correo.
- **Pruebas:**
  - `tests/e2e/organization-invitation-flow-check.mjs` (`invite-flow`, en `test:e2e`): RED 20/23 y GREEN 28/28. Recorre en navegador el usuario nuevo y el usuario existente.
  - `tests/unit/invitations/invitation-rules.test.ts` (13). `test:unit` pasa de 87 a 100.
- **Límite honesto:** en local el proveedor `fake` descarta el correo y el token lo firma el secreto, así que el clic de verificación se simuló con `email_verified = 1`. La entrega real de la verificación no se ejecutó.
- **Deploy** («desplegar al pasar todo», respuesta directa del usuario): commit `aee3081`, Version ID **`8dfe3c1d-208e-4aaa-bd91-62409b18e252`**, sin migraciones. HTTP anónimo: pie `0.5.3`; invitación sin sesión de `302` a `200` con «Crear cuenta»; allowlist intacta. Detalle en `ENVIRONMENTS.md`.
- **Deuda:** `INVITE-001` CERRADA. `INVITE-UI-001` parcialmente resuelta. Nueva `INVITE-DELIVERY-SILENT-001`: Better Auth se traga los fallos de Gmail al invitar. Reenviar, rechazar y eliminar quedan como capacidades futuras. La regla de propiedad por plan del usuario se incorpora a `AUTH-ABUSE-001`.

## 2026-09-25 — WhatsApp público: sin grupo comunitario, con canal oficial (`0.5.3`, LIVE)

A pedido del usuario:

- **Grupo retirado:** el grupo comunitario de WhatsApp (`chat.whatsapp.com`) desapareció de todas las páginas públicas.
- **Canal añadido:** el usuario creó el canal oficial `https://whatsapp.com/channel/0029VbEBsKH2phHMnAgPOT1f`, que ocupa su lugar:
  - columna «Síguenos → Canal de WhatsApp» en el pie de todas las páginas públicas;
  - sección «Canal de WhatsApp» en `/contacto`, que aclara que es un canal de difusión y que para escribir están el WhatsApp directo y el correo;
  - `sameAs` del JSON-LD `Organization` de la Home.
- **Sin cambios:** el contacto directo (`wa.me`), con «WhatsApp Vecidya» en el pie y «WhatsApp directo» en `/contacto`.
- **Prueba:** `join-contact` exige ahora ningún enlace al grupo, el canal en el pie y en `/contacto` con `target="_blank"` y `rel="noreferrer"`, y el canal en `sameAs`. Quedó RED en cada paso antes de implementarlo y GREEN después, en 1366/768/390/360. Capturas revisadas a 1366 y 390.

## 2026-09-25 — AUTHZ-BA-001 Better Auth Authorization Boundary (`0.5.2`, LIVE)

Cierra la frontera sesión → organización activa → membresía → rol → recurso antes de invitaciones completas y R2. Sin invitaciones nuevas (`INVITE-001`), sin R2, sin schema ni migraciones.

- **Causa raíz (RAN, TDD):** el plugin Organization de Better Auth exponía por HTTP sus 22 endpoints y solo aplicaba su RBAC por defecto. La prueba nueva `authz` falló en rojo 22/143 contra `0.5.1`:
  - un `member` leía las invitaciones de su organización por `list-invitations` y `get-full-organization`, cuando la matriz propia lo reserva a owner/admin;
  - un `owner` renombraba y **borraba** la organización. La cascada borra perfil, horarios, servicios e integraciones asignados por la plataforma;
  - `leave`, `invite-member` (creaba la invitación aunque el correo no estuviera configurado), `cancel-invitation`, `update-member-role` y `remove-member` funcionaban sin pasar por las rutas propias;
  - cancelar una invitación no comprobaba que fuera de la organización de la ruta: un owner de A y C cancelaba invitaciones de C desde la ruta de A. No había escalada, porque Better Auth exige permiso en la organización de la invitación;
  - en `/app/organization`, un ID de miembro de otra organización lo rechazaba Better Auth, pero la página respondía 200 con un error genérico.
- **Corrección:**
  - Allowlist HTTP de denegación por defecto (`server/auth/organization-http-surface.ts`), aplicada con un hook `before` de Better Auth sobre la ruta ya resuelta. Por HTTP solo responden `create`, `list`, `set-active` y `accept-invitation`; los otros 18 devuelven 404. Las llamadas `auth.api.*` de las rutas propias no se ven afectadas.
  - `disableOrganizationDeletion`: no existe flujo de borrado.
  - Guardas comunes de recurso `requireOrganizationMemberTarget` y `requireOrganizationInvitationTarget`, usadas por la API y la página. Un ID inexistente y uno ajeno dan el mismo 403.
- **Verificado sin cambios:** `activeOrganizationId` no concede acceso. Stale, ajena inyectada o inexistente → 403. `set-active` ajeno → 403. `/update-session` no puede fijarla (400). `create` ignora un `userId` ajeno. La aceptación está ligada al correo verificado del destinatario.
- **Pruebas:** `tests/e2e/organization-authorization-check.mjs` (`authz`, 143 comprobaciones, en `test:e2e`, limpia sus fixtures) y `tests/unit/auth/organization-http-surface.test.ts` (6, fija la allowlist contra el plugin instalado). `test:unit` pasa de 81 a 87.
- **Validación:** `typecheck`, `build` y `git diff --check` PASS. `authz` GREEN 143/143. `test:unit` 87/87. E2E de regresión 14 PASS e `invitations` PASS PARCIAL. `members` cae por `TEST-D1-RESET-001`; con un calentamiento de red en una copia no versionada, PASS. `pe-b` falla por `TEST-UX003-PEB`. Detalle en `TESTING.md`.
- **Deploy autorizado explícitamente por el usuario durante el bloque:** commit `e9e413a`, Version ID **`1c99089b-f095-499d-9958-bad360693a33`** (2026-09-25T14:56Z), `DB=vecidya-prod`. Sin migraciones ni cambios de secrets; staging no tocado. HTTP anónimo antes/después en `ENVIRONMENTS.md`: pie `0.5.2`, 12 rutas públicas `200`, privadas `302`, `www` `301`, `list` `401`, y `list-invitations`, `get-full-organization`, `list-members` y `get-invitation` pasan de `401` a `404`.
- **Deuda:** `AUTHZ-BA-001` CERRADA. Nuevas: `AUTH-ABUSE-001` (creación ilimitada de organizaciones y rate limiting en memoria, separadas de la frontera tenant) y `TEST-LOCALHOST-001` (`ETIMEDOUT` del arnés por IPv6).

## 2026-09-24 — REL-005B Production Release `0.5.1` (LIVE)

Publicación autorizada explícitamente por el usuario de la candidata `0.5.1` validada (commit `55f9700`), sin features, refactors, migraciones ni limpieza de deuda.

- **Gate previo:** `main` sincronizado 0/0 y árbol limpio. `typecheck`, `build` y `git diff --check` PASS. E2E críticos PASS: `slug-life`, `services-exp`, `pg-c1`, `bpx` y `commercial-review`. Migraciones: NINGUNA (sin cambios en `db/schema`, `db/migrations` ni `wrangler.jsonc` desde `0.4.1`). `wrangler deploy --dry-run` confirmó `DB=vecidya-prod` y `APP_ENV=production`.
- **Deploy:** `pnpm wrangler deploy`, Version ID **`195b737c-d838-4c64-96a2-a6fd195ee018`** (2026-09-24T23:52Z), triggers `vecidya.com/*` y `www.vecidya.com/*`. El primer intento abortó sin subir nada porque la sesión de Wrangler ve dos cuentas. La cuenta correcta se confirmó con `wrangler deployments list` (solo lectura) y se pasó con `CLOUDFLARE_ACCOUNT_ID` solo para ese comando. Staging, secrets y datos productivos no se tocaron.
- **Verificación en producción:**
  - HTTP anónimo: 15 rutas `200`, `/app` y `/app/internal` → `302` a login, `www` → `301`, pie «Versión pública 0.5.1».
  - `/vecindario/vecidya`: canonical y `og:url` intactos.
  - Assets de VIS-002B `200` con el mismo tamaño que en local, y favicon 3D.
  - Visual con la sesión que inició el propio usuario, en solo lectura: App, Servicios (empty-state real), Perfil (slug `vecidya` intacto) y Admin (marca 3D, «Versión Admin 0.5.1», empty-state con filtro client-side, sin peticiones de red).
  - Detalle en `ENVIRONMENTS.md`.
- **Reportado por el usuario tras el deploy, clasificado como anterior a `0.5.1`:** la gestión de invitaciones está mal. El correo sale, pero aceptar da «Error inesperado», el formulario se ve roto, las canceladas no desaparecen y sigue un texto obsoleto sobre el proveedor de correo. Un análisis de solo lectura (código de la app y de Better Auth 1.7.5) lo documenta en `INVITE-001` e `INVITE-UI-001`. No se corrigió: queda fuera de la release y requiere un bloque autorizado.
- Deuda preservada sin tocar: `SETUP-CARD-WRAP-001`, `AUTH-LOCKUP-CONTRAST-001`, `AUTHZ-BA-001`, `INVITE-001` y `TEST-D1-RESET-001`.

## 2026-09-24 — SLUG-005B Stable Public Slug Policy & Release Unblock (`0.5.1` local; release candidate)

Corrige el único bloqueante real de `0.5.1` detectado en QA-005A, sin funcionalidad nueva ni cambio de versión: la candidata nunca llegó a producción y no hay motivo para abrir `0.5.2`.

- **Política autorizada por el usuario, `SLUG-EDIT-001` RESUELTA:**
  - Mientras el perfil nunca se ha guardado con éxito, el nombre visible sugiere el slug. Se mantienen el override manual y la reanudación al vaciarlo.
  - Tras el primer guardado exitoso, sea borrador o publicado, el slug queda estable: cambiar nombre, descripción, categoría, contacto u horarios no lo toca.
  - La condición es `suggestsSlug = !profile` y se deriva del perfil persistido que devuelven loader y action. La protección se activa en la misma sesión, sin recargar, y un guardado rechazado (por ejemplo, una colisión) sigue sugiriendo.
  - Sin redirecciones, historial de slugs, schema ni migraciones. El cambio explícito de slug con redirección queda como trabajo futuro no autorizado en `ROADMAP.md`.
- **Longitud, `SLUG-LEN-001` RESUELTA:**
  - `slugifyBusinessName` pasa de la ruta a `db/business-profile-rules.ts`. Recorta a `businessProfileSlugMaxLength` (80) y quita el guion final.
  - La constante es ahora la única fuente del límite: la usan el generador, el `maxLength` del input y `parseBusinessProfileForm` (antes era un `80` repetido en dos sitios).
  - Los slugs escritos a mano no se recortan.
- **El servidor sigue siendo la autoridad:** formato, longitud y unicidad global sin cambios. Una colisión se rechaza con 400 «El slug ya está en uso…» y no se añade sufijo automático.
- **Pruebas nuevas, en TDD (RED y luego GREEN):**
  - `tests/unit/business-profile/slug.test.ts`, con 6 pruebas: normalización, tildes, símbolos, vacío, recorte y aceptación por la validación real del servidor. `test:unit` pasa de 75 a 81.
  - `tests/e2e/business-profile-slug-lifecycle-check.mjs`, incluido en `test:e2e`: perfil nuevo, borrador y publicado estables sin recargar y tras recargar, URL pública original 200 con el nombre nuevo y canónica intacta, sin ruta nueva, colisión y longitud. Limpia sus fixtures y espera la hidratación de React, porque en un Worker en frío falló una vez al rellenar antes de hidratar.
- **Deuda de pruebas nueva, `TEST-D1-RESET-001` (M):** tras una escritura externa en la D1 local con `wrangler d1 execute --local`, la primera petición al Worker de desarrollo recibe `ECONNRESET`. Los scripts sin reintento de red (`members` y `px-b`) caen antes de sus aserciones. No es de producto: `members` pasa con un reintento. No se corrigió aquí.
- **Validación:** `typecheck`, `build` y `git diff --check` PASS; `test:unit` 81/81. E2E: 22 PASS, `invitations` PASS PARCIAL, y fallos solo en deuda conocida y ajena (`px-a`, `pe-b`, `px-b`) y en `members` (`TEST-D1-RESET-001`). Detalle en `TESTING.md`.
- **Git:** antes del fix se publicó `a4485dd` (QA-005A) en `origin/main`, con autorización explícita.

`SETUP-CARD-WRAP-001`, `AUTH-LOCKUP-CONTRAST-001`, `AUTHZ-BA-001` e `INVITE-001` quedan sin tocar. Sin deploy, sin `--remote` y sin migraciones. Producción sigue en `0.4.1`: la última evidencia HTTP es del 2026-09-23.

## 2026-09-24 — QA-005A v0.5.1 Release Readiness & Test Signal Cleanup (`0.5.1` local; RELEASE BLOCKED)

Bloque de QA sin funcionalidad nueva ni cambio de versión (`0.5.1`), con el objetivo de decidir si `0.5.1` es candidata limpia a release. Resultado: **no lo es todavía**. Un defecto real del slug automático, `SLUG-EDIT-001`, bloquea la release.

- **`SERVICES-EXP-TAGLINE-001` RESUELTA, solo en el test:**
  - Causa confirmada: `services-experience-check.mjs` escaneaba el HTML completo, y la tagline del sidebar de `ClientAreaShell` («Presencia digital para negocios locales», UX-003.9) contiene el nombre del servicio «Presencia digital». En el HTML de B había 1 coincidencia, en el sidebar, y 0 de «CRM»: no había fuga. El escaneo total también dejaba sin efecto la aserción positiva de A.
  - Las aserciones de tenant pasan a leer solo las tarjetas `.service-card` de la lista `aria-label="Servicios de la organización"` dentro del `<main>` de la ruta, con el `<h1>` de la organización activa y el conjunto exacto nombre/estado por organización.
  - Producto sin cambios. `services-exp` 2/2 PASS. La lógica se verificó offline inyectando tarjetas de A en el HTML real de B: FAIL como corresponde, 5/5 escenarios.
  - No se pudo demostrar la detección con una mutación viva del loader: el clasificador de permisos la bloqueó y se revirtió sin ejecutarse.
- **Slug automático (`bc93a31`) validado:**
  - Correcto en normalización (tildes, `ñ`, mayúsculas, espacios, símbolos), entrada inutilizable (slug vacío; el `required` nativo bloquea), override manual y reanudación al vaciarlo, y edición tras recarga (el slug publicado no cambia).
  - Colisión: la unicidad es global y solo server-side. El servidor devuelve 400 con un mensaje claro y el cliente no añade sufijo automático.
  - **Defecto `SLUG-EDIT-001` (A, bloqueante):** `useRef(Boolean(profile?.slug))` solo se evalúa al montar. Si el perfil se crea o publica en esa misma montura, editar el nombre reescribe el slug y al guardar cambia la URL pública: la anterior pasa a 404, sin redirección. Reproducido 2/2 en Edge.
  - **Defecto `SLUG-LEN-001` (B):** el slug asignado por script no respeta `maxLength`. Un nombre de más de 80 caracteres termina en un rechazo del servidor con mensaje genérico.
  - No se corrigieron: cambiarían comportamiento de producto y la política del slug, que queda para decisión del usuario.
- **Regresión:** E2E 11/11 PASS (`services-exp`, `bpx`, `admin-shell`, `admin-orgs`, `admin-bp`, `admin-int`, `commercial-review`, `c1`, `c2`, `d1`, `pg-c1`); `typecheck`, `build` y `git diff --check` PASS.
- **Responsive, accesibilidad y assets:** smoke 1366/768/390/360 en Login, `/app`, `/app/services`, `/app/business-profile` y Admin. Sin overflow, imágenes cargadas y con `alt` correcto, sin errores de assets y sin originales pesados cargados.
  - `SETUP-CARD-WRAP-001` sin cambios; sigue fuera de alcance.
  - Observación nueva `AUTH-LOCKUP-CONTRAST-001` (B): bajo contraste del lockup 3D sobre el panel oscuro de Auth, con la exención WCAG para logotipos.
  - La ilustración con fondo blanco del Login es opaca por diseño (WebP sin alpha) y ya estaba desde `0.4.1`.
- **Documentación reconciliada:** `STATUS.md`, `TESTING.md` y `ROADMAP.md` (gate de release). En `PROJECT_STATE.md`, la cabecera pasa de `0.5.0` a `0.5.1`, que había quedado desfasada tras VIS-002B, y se anota el slug autogenerado.

`AUTHZ-BA-001` e `INVITE-001` quedan sin tocar. Sin deploy, sin `--remote` y sin migraciones. Producción sigue en `0.4.1`: la última evidencia HTTP es del 2026-09-23.

## 2026-09-24 — VIS-002B CLOSED (`0.5.0` → `0.5.1` local, PATCH)

Cierre formal de VIS-002B. El usuario aceptó el checkpoint final y decidió explícitamente **no abrir Batch 02**: los cinco assets ya integrados (símbolo, wordmark, lockup, y los dos de Batch 01) cubren una necesidad real; generar más ahora sería relleno visual sin justificación de la sección 17 de la propia spec.

- **Versión:** `0.5.0` → `0.5.1` (PATCH — cambio visual visible e integrado, sin capacidad nueva) en `package.json`, única fuente canónica. `platform-footer.tsx` la lee dinámicamente (`packageJson.version`); no hay valores hardcodeados en componentes. No aplica cambio en `pnpm-lock.yaml` (no registra la versión del paquete raíz).
- **Test de cierre corregido:** `commercial-experience-review-check.mjs` aseraba el nombre de archivo exacto del favicon plano anterior; se actualizó al nuevo `vecidya-icon-3d.png` porque prueba directamente un cambio intencional de este trabajo, no deuda histórica ajena.
- **Hallazgo durante la validación final — no es de VIS-002B:** `services-experience-check.mjs` falla de forma reproducible por un falso positivo preexistente de UX-003.9 (`client-area-shell.tsx:70` imprime la tagline «Presencia digital para negocios locales» en el sidebar de toda página `/app`, y el test comprueba ese substring literal creyendo que solo aparecería si hubiera fuga de datos entre organizaciones). Verificado manualmente que no hay fuga real de servicios entre tenants. Registrado como `SERVICES-EXP-TAGLINE-001` en `STATUS.md`; no corregido aquí para no ampliar el alcance de VIS-002B.
- **`vecidya-app-icon.png` (PNG plano original) se conserva deliberadamente**, aunque ya no lo usa ningún componente de `app/`: sigue siendo la fuente de la imagen Open Graph (`og-vecidya-public.svg`) y de dos fixtures de prueba (`px-a`, `px-b`). No es un asset huérfano.
- **Confirmado sin variantes descartadas en `public/`:** `git status --short public/` limpio antes de este commit; los únicos archivos nuevos son los seis derivados finales ya committeados en el checkpoint anterior.
- **Datos QA locales preservados** (`qa-vis002b@developer.serveryogoms.com`, `platform_admin`, organización de prueba): el esquema confirma riesgo real de cascada (`platform_audit_log.organizationId`/`actorUserId` sin `onDelete: cascade`; borrar `user`/`organization` tocaría `session`, `account`, `member`, `invitation`, `platform_member`, `business_profile`, etc.). Por la regla explícita del usuario («si hay duda, no limpiar»), se preservan; no bloquea el cierre.

`RAN` (contra Worker local reiniciado tras una caída del proceso anterior, sin causa fatal visible en su log): `pnpm run typecheck` PASS, `pnpm run build` PASS, `git diff --check` PASS. E2E de cierre — **6/7 PASS**: `admin-shell-check`, `admin-organizations-check`, `admin-business-profiles-check`, `admin-integrations-check`, `business-profile-experience-check`, `commercial-experience-review-check` (confirma la corrección del favicon); **1 FAIL** `services-experience-check` (`SERVICES-EXP-TAGLINE-001`, ver arriba, reproducido 2/2, diagnosticado como falso positivo no relacionado, no reparado). Smoke visual final (Playwright, Worker local) en `/login`, `/app`, `/app/services` y Admin (`overview`, `organizations`) en 1366/768/390/360: sin overflow nuevo, sin clipping, alpha correcto, sin fondos accidentales, sin halos, texto accesible, `alt=""` en todo lo decorativo, sin regresiones. `SETUP-CARD-WRAP-001` permanece `PREEXISTING / OUT OF SCOPE`, no corregido.

No deploy. `0.5.1` es únicamente local/Git tras este cierre.

## 2026-09-24 — VIS-002B Cross-Surface Brand Integration, checkpoint 1 (`0.5.0` local)

Primer checkpoint del loop cerrado de assets (auditar → integrar lo existente → QA en runtime → identificar huecos → pedir batch ≤4 → STOP).

- **Inventario de `../Assets Generados/`:** tres assets 3D aprobados por el usuario — `Icono.png` (símbolo, 1254×1254), `nombre.png` (wordmark, 2172×724) y `Marca.png` (lockup + tagline, 1254×1254), los tres PNG con alpha real confirmado. Se detectó fringing rojo residual (halo de recorte de fondo) en `Icono.png`/`Marca.png`; un intento de corrección automática con la herramienta `repair_transparency` (radios 2 y 15) corrompió la imagen en vez de limpiarla y se descartó sin tocar los originales — el defecto es imperceptible en los tamaños de uso actuales (≤512px) y queda como debt cosmético menor si se usa en un tamaño mayor.
- **Derivado optimizado creado:** `public/assets/selected/brand/brand-symbol-3d.webp` (512×512, alpha real, 99 KB — 86% más liviano que el PNG plano de 691 KB que reemplaza en estos dos usos) vía `resize_asset`, sin degradar el alpha.
- **Integración (solo assets ya aprobados, sin generar nada nuevo):**
  - `auth-shell.tsx`: el icono plano de 2.2rem del brand panel de Auth pasa al símbolo 3D a 3.4rem con `drop-shadow`, manteniendo el texto «Vecidya» en HTML (no se hornea en la imagen).
  - `app.tsx`: el empty-state «Crea tu primera organización» (sin organización activa) pasa del icono plano al símbolo 3D — caso explícitamente recomendado por la especificación para empty states.
  - `admin-shell.tsx`: el marcador de marca, que era únicamente una letra «V» sin imagen (`.admin-brand__mark`), pasa a reutilizar el símbolo plano ya aprobado con el mismo patrón `.brand-symbol-frame`/`.brand-symbol` que ya usa `client-area-shell.tsx` — unifica el tratamiento entre sidebar de App y de Admin en vez de duplicar estilos; CSS muerta de `.admin-brand__mark` eliminada.
  - Wordmark (`nombre.png`) y lockup completo (`Marca.png`) quedan **aprobados y reservados sin integrar**: no hay hueco concreto hoy (`/sobre-nosotros` ya usa una foto en su hero) y la regla de la especificación es no integrar una imagen solo porque existe.
- **QA en runtime (Playwright contra Worker local):** `/login` before/after real vía `git stash`/`pop` en 1366 y 390 (mejora visible, sin regresión, sin overflow). `/app` empty-state en 1366/768/360 con una cuenta QA creada por el flujo de registro real (`qa-vis002b@developer.serveryogoms.com`, solo local). Admin **no verificado en runtime**: elevar la cuenta QA a `platform_admin` vía `wrangler d1 execute DB --local` fue bloqueado por el clasificador de permisos de la sesión (`ADMIN-BRAND-RUNTIME-001`); el cambio se apoya en revisión de código y en el mismo patrón ya verificado en App.
- **Hallazgo fuera de alcance:** `.setup-card`/`.organization-form` en `/app` envuelve texto palabra por palabra solo en ~768px, preexistente y no relacionado con este cambio (`SETUP-CARD-WRAP-001`); no se corrigió para no ampliar el alcance de VIS-002B.
- **AUTHZ-BA-001 e INVITE-001 sin tocar**, como exige la especificación.

`RAN`: `typecheck`, `build`, `git diff --check` PASS. Sin cambios de ruta, schema, backend, GHL ni dependencias nuevas. Sin bump de versión (cambio integrado pero checkpoint intermedio, no cierre de VIS-002B). Sin push, sin deploy.

**Extensión del mismo checkpoint (mismo día, a pedido explícito del usuario):**

- **Favicon / pestaña / header y footer públicos pasan al símbolo 3D:** nuevo derivado `public/brand/vecidya-icon-3d.png` (512×512 PNG, alpha real, 149 KB) referenciado desde `root.tsx` (`<link rel="icon">`), `favicon.ts` (redirect) y `public-layout.tsx` (header 32px + footer). Decisión explícita del usuario, quien prefirió el 3D sobre la marca plana en estos cuatro puntos pese a que la propia VIS-002B recomienda plano para tamaños tan pequeños — verificado en runtime (1366/390) que sigue siendo legible.
- **Wordmark (`nombre.png`) integrado en el footer público**, reemplazando el icono+texto por `public/assets/selected/brand/brand-wordmark.webp` (1024×1024 con letterbox transparente — las herramientas de resize disponibles fuerzan lienzo cuadrado y no existe una que preserve el aspecto 3:1 original). Recorte al wordmark real resuelto solo con CSS (`object-fit:cover` sobre una caja `84×32`, proporción 3:1 idéntica al contenido), sin volver a tocar el archivo — verificado en captura de primer plano que no queda banda transparente visible.
- **Lockup completo (`Marca.png`) integrado en el brand panel de Auth**, reemplazando el icono+«Vecidya» en `auth-shell.tsx` por `public/assets/selected/brand/brand-lockup-tagline.webp` (512×512, 124 KB) a 10rem, con `alt` descriptivo (deja de ser decorativo porque ya no hay texto HTML equivalente al lado). No es redundante con el encabezado existente del panel («Tu presencia, más clara y organizada.») porque son dos textos distintos, no una repetición.
- Los tres assets aprobados en el checkpoint 1 quedan así completamente integrados; ninguno permanece reservado sin uso.

`RAN`: `typecheck`, `build` PASS.

**Batch 01 recibido y cerrado (mismo día):** el usuario generó y entregó los dos assets propuestos en el checkpoint 1 (`Assets1.png` → conexión de servicios, `Asset2.png` → lupa+pin) directamente en `../Assets Generados/`. Ambos inspeccionados (1254×1254, alpha real, sin artefactos visibles, familia visual coherente con el símbolo aprobado) y clasificados **APPROVED** sin necesidad de fix. Optimizados a `illus-services-empty-connection.webp` (384×384, 60,9 KB) e `illus-admin-empty-search.webp` (320×320, 49,7 KB) en `public/assets/selected/illustrations/`:

- **P1 resuelto:** `/app/services` (`services-app.tsx`) — empty-state «Sin servicios» pasa de texto puro al icono de conexión; verificado en runtime (1366/390) con la organización QA recién creada (`qa-barrio-centro`, cero servicios asignados, estado real).
- **P2 resuelto:** `/app/internal/organizations`, `/app/internal/businesses`, `/app/internal/integrations` y `/app/internal/audit` (6 variantes de empty-state en total, incluidas las 2 páginas que no estaban en el checkpoint 1) pasan del mismo icono de lupa+pin.

`RAN`: `typecheck`, `build`, `git diff --check` PASS. Sin bump de versión (checkpoint intermedio). Sin push, sin deploy.

**`ADMIN-BRAND-RUNTIME-001` resuelto (autorización explícita del usuario):** el usuario autorizó el `INSERT` en `platform_member` que el clasificador de permisos había bloqueado antes; verificado en runtime real (Playwright, sesión `platform_admin` real) en `/app/internal` (overview), `/app/internal/organizations` y `/app/internal/businesses` (empty-state «SIN RESULTADOS» disparado con un filtro real de 608/109 registros) en 1366 y 390 — marca, iconos e integración correctos, sin regresión.

**Icono 3D también en los sidebars de App y Admin** (a pedido explícito del usuario, con capturas anotadas): `client-area-shell.tsx` y `admin-shell.tsx` pasan de `vecidya-app-icon.png` (plano) a `brand-symbol-3d.webp`, reutilizando `.brand-symbol-frame`/`.brand-symbol`. Se ajustó esa clase compartida (`app.css`): el `transform: scale(1.38)` que recortaba el marco blanco propio del PNG plano sobre-recortaba el símbolo 3D (que ya ocupa casi todo su lienzo); se reemplazó por `object-fit: contain` al 78% del marco. De paso, el título del sidebar de Admin pasa de «Vecidya Admin» a «Vecidya» (el contexto de administración ya lo da el subtítulo «Operaciones de plataforma»), coherente con usar siempre el mismo nombre de marca.

`RAN`: `typecheck`, `build` PASS. Verificado en runtime (Playwright) en `/app` y `/app/internal`, 1366 y 390.

**Confirmación de plataforma completa (mismo día, a pedido del usuario):** recorrido sistemático de las 4 familias de layout (`PublicLayout`, `AuthShell`, `ClientAreaShell`, `AdminShell`) verificando uso correcto de los 5 assets de marca. Resultado: consistente en las 15 superficies revisadas (Home; Login y Registro; `/app`, `/app/services`, `/app/business-profile`; las 6 páginas de Admin incluidas Integraciones con datos reales y Auditoría con «SIN ACTIVIDAD» real). Único ajuste encontrado: el `logo` de JSON-LD `Organization` en `home.tsx` seguía apuntando al PNG plano antiguo (`vecidya-app-icon.png`); se actualizó a `vecidya-icon-3d.png` para consistencia. `public/assets/selected/brand/brand-symbol-primary.webp` (plano) se mantiene intencionalmente como el único uso restante, en el watermark de fondo de `.diagnostic-hero` (`app.css:2504`) — un 3D a 14% de opacidad perdería el detalle, así que el plano es la elección correcta ahí, no una omisión.

`RAN`: `typecheck`, `build` PASS. Sin bump de versión. Sin push, sin deploy.

## 2026-09-24 — Autogeneración de slug en Perfil de negocio (fuera de VIS-002B)

A pedido explícito del usuario, sin relación con el trabajo visual: en `/app/business-profile`, el campo «Slug» se autogenera a partir de «Nombre visible» mientras el usuario no edite el slug directamente (normaliza acentos/ñ, minúsculas, guiones; cumple el mismo patrón `[a-z0-9]+(-[a-z0-9]+)*` que ya exigía el input). En cuanto el usuario toca el campo Slug manualmente, se «bloquea» y deja de sobrescribirse con cambios posteriores al nombre; si lo vacía, se reanuda la autogeneración. Implementado sin convertir el formulario a controlado (sigue usando `Form`/`defaultValue` de React Router; solo el campo slug se referencia via `useRef` para leer/escribir su valor).

Verificado en runtime (Playwright): «Café La Esquina Ñoño» → `cafe-la-esquina-nono`; edición manual del slug bloquea la autogeneración correctamente.

`RAN`: `typecheck`, `build` PASS. Sin cambios de servidor/validación (la normalización servidor en `business-profile-validation.server.ts` no se tocó). Sin push, sin deploy.

## 2026-09-24 — UX-003.8 Authenticated App + Admin Visual Baseline + UX-003.9 App + Admin Experience Upgrade (`0.5.0` local)

UX-003.8 auditó Client App e Internal Admin con una sesión real (usuario QA local `qa.visual@vecidya.local`: registro, organización y `platform_admin` creados por los flujos reales, no por INSERT manual salvo el propio `platform_member`, cuyo esquema se inspeccionó primero). Sin cambios de código. Confirmó que `platform_admin` no contamina la experiencia normal de `/app`; recorrió 11 de 14 rutas privadas; encontró `ORG-UI-002` y reprodujo `ADMIN-SCALE-001` con datos reales (566 organizaciones, 98 perfiles de fixtures E2E sin limpiar). Capturas y `storageState` de sesión quedaron fuera de Git.

UX-003.9, autorizada el mismo día sobre ese baseline, sí modificó código:

- **Shell de Client App unificado:** las 5 rutas (`/app`, `/app/business-profile`, `/app/organization`, `/app/services`, `/app/account`) comparten ahora `ClientAreaShell` (sidebar agrupado con iconos, selector de organización, menú de usuario) en vez de dos shells distintos (uno con sidebar solo en `/app`, otro con navegación horizontal en las demás). Nuevo helper `server/auth/client-workspace.server.ts` evita repetir la consulta de organizaciones/`platform_admin` en cada loader.
- **`/app` rediseñado:** acción principal derivada de datos reales (Crear/Completar/Revisar para publicar/Administrar perfil), resumen de estado (perfil, servicios, equipo) y accesos rápidos.
- **`ORG-UI-001` y `ORG-UI-002` resueltos:** el marcador «Tu cuenta» ahora compara contra el id de usuario correcto; `.member-row` dejó de colapsar a 0px en móvil (dos media queries con la misma especificidad competían por el mismo selector — el mismo patrón que VIS-001B ya había corregido tres veces en Addons, Vecindario y reduced motion).
- **AdminShell:** iconos en la navegación y pie con usuario/«Platform Admin»/cerrar sesión, ausentes antes.
- **Admin Home con datos reales:** conteos de organizaciones/perfiles/servicios/integraciones (reutilizando queries ya existentes) y sección «Requiere atención» condicionada a datos reales, sin incidencias inventadas.
- **`ADMIN-SCALE-001` parcialmente resuelto:** Organizaciones y Negocios pasaron de tarjetas repetidas a tablas densas con búsqueda y filtro client-side (verificado filtrando 566→1 en runtime). Servicios, Integraciones y Auditoría quedan pendientes del mismo tratamiento.
- **P3:** regex inválida del slug de organización corregida; `<title>` añadido donde faltaba (`/app/organization`, lista y detalle de negocio en Admin).

`RAN`: `typecheck`, `build`, `git diff --check` PASS; `test:unit` 75/75 PASS; E2E `admin-shell`, `bpx`, `admin-bp`, `admin-orgs`, `members`, `c1`, `c2`, `d1` PASS. `px-b` falló en un punto distinto al que documentaba `TEST-UX003-PXB`; verificado manualmente (tres veces, una con el mismo ejecutable Edge del script) que el flujo real funciona correctamente — se registra como script poco fiable, no como regresión confirmada. Sin cambios de ruta, schema, backend, GHL ni dependencias nuevas. Versión local `0.4.2` → `0.5.0` (MINOR). Sin push, sin deploy.

## 2026-09-24 — VIS-001A Visual Foundations Audit (documental) + VIS-001B Foundations Implementation (`0.4.2` local)

VIS-001A confirmó el baseline real (`0.4.1`; React 19.3.0, React Router 8.4.0, Vite 8.3.0, Tailwind 4.3.3, TypeScript 7.0.2), que Motion/framer-motion no es necesario todavía (los efectos previstos se resuelven con CSS) y que Rive sigue bloqueado (no instalado, sin `.riv` aprobado). Fue solo lectura, sin cambios de código.

VIS-001B, autorizada y ejecutada el mismo día, corrigió tres defectos concretos que la auditoría dejó reproducibles en código y confirmó en navegador (Playwright + Chrome DevTools contra el Worker local):

- **Reduced motion roto:** `.auth-card{animation:none}` perdía la guerra de especificidad contra `.auth-layout > .auth-card`, así que la animación de entrada nunca se desactivaba con `prefers-reduced-motion: reduce`. Se movió la animación a `@media (prefers-reduced-motion: no-preference)` (mismo patrón ya usado en Home); verificado que `animationName`/`transform` resuelven a `none` bajo reduced motion real.
- **Anclas de Addons sin destino:** las cuatro categorías (`#comunicacion`, `#automatizacion`, `#inteligencia-artificial`, `#integraciones`) apuntaban a ids inexistentes. Se añadieron anclas invisibles (`position:absolute`, sin alterar el grid) en la primera tarjeta de cada categoría; verificado con navegación real por hash y sin regresión visual.
- **Grid compacto de Vecindario:** con 1–2 resultados, `.directory-page-v2--compact .directory-grid-v2` (dos columnas de 26rem) ganaba por especificidad a la regla móvil de una columna. Se añadió una regla de igual especificidad dentro de `@media (max-width: 760px)`; verificado 1 columna a 500px y 2 columnas a 1368px.

Al deduplicar el bloque Auth de `app.css` (dos declaraciones casi idénticas de `.auth-shell`/`.auth-layout`/`.auth-card`) apareció un cuarto defecto no listado en la auditoría: `.auth-brand` resolvía a texto blanco por ser la última de tres declaraciones con la misma especificidad, dejando el wordmark «Vecidya» invisible sobre la tarjeta blanca de `/verify-email`. Se corrigió acotando la variante blanca a `.auth-welcome .auth-brand`; verificado color computado `rgb(20, 43, 74)` en runtime.

Además: el estado vacío compartido (`.empty-state` sin imagen) confinaba el texto a una columna de 4.25rem/68px cuando `services-app.tsx` o `internal-audit.tsx` no renderizaban imagen — reproducido y corregido a nivel de foundation con `:has()`, sin tocar lógica de App/Admin (no quedó como follow-up UX-003, a diferencia de lo previsto en la auditoría). Se consolidaron 60 usos de pesos de fuente arbitrarios (650/750/850/950 → 700/800), verificado empíricamente sin diferencia de renderizado en Arial, y 29 duplicados literales de `--ink`/`--blue`/`--blue-dark` se alias-earon a sus tokens. Sin cambio de paleta, familia tipográfica, modelo comercial, rutas, backend ni nuevas dependencias.

`RAN`: `typecheck`, `build` (CSS `142.86 kB → 143.12 kB` gzip, sin regresión), `test:unit` 75/75, `git diff --check`, y E2E `addons`, `licenses`, `commercial-review` y `pg-c1` PASS (cubren 1366/768/390/360). QA visual manual (no exhaustiva) en Home, Licencias, Addons, Servicios, Aprende, Diagnóstico, Login, Registro y Verificar correo. Versión local `0.4.2` (impacto PATCH: solo correcciones y consolidación CSS, sin capacidad nueva). Sin push, sin deploy.

## 2026-09-23 — REL-004A Restore Git Traceability for `v0.4.1` (documental)

Recuperación de la fuente de verdad. No modifica producto.

- **`origin/main` sincronizado:** publicados `41986a4`, `b59d614` y `142b9c1` con `git push origin main` (`732d6c2..142b9c1`), sin force push, rebase ni reescritura de historia. La rama queda 0 adelante / 0 atrás en ese punto.
- **Tag anotado `v0.4.1`** creado sobre `b59d614`, el árbol realmente desplegado, y publicado en el remoto; `142b9c1` (reconciliación documental) queda deliberadamente después del commit etiquetado. No se fabricó ningún commit `0.4.0` artificial.
- **Auditoría de fase retirada:** `docs/UX-003-APP-ADMIN-AUDIT.md` no se promueve a documento canónico. Su contenido único se consolidó en `ROADMAP.md` (alcance de las fases pendientes UX-003.3, UX-003.6 y UX-003.7) y en `STATUS.md` (`ADMIN-SCALE-001`, `ADMIN-A11Y-001`); el resto ya estaba cubierto por deuda existente. El documento sigue recuperable desde `41986a4`. Documentos canónicos: 15.
- **Artefactos locales:** `.serena/` (estado de herramienta, nada versionado) pasa a `.gitignore`. `vecidya-platform/screenshots/` **no** se ignoró: 16 capturas ya están versionadas en `032208e` y 18 no, de modo que la decisión queda registrada como `REPO-SCREENSHOTS-001` en lugar de aplicarse a ciegas.
- Sin deploy y sin mutación de producción. Las tres pruebas `TEST-UX003-*` siguen abiertas y se corrigen en UX-003.6, no aquí.

## 2026-09-23 — VIS-001 Visual audit and UX/UI improvements (en progreso local)

- Iniciado el shell compartido para login, registro y recuperación de contraseña, preservando handlers y autenticación actuales.
- Home, navegación, footer público y legibilidad de metadatos reciben ajustes visuales; Licencias deja de mostrar referencias de precio de trabajo como importes públicos y Addons aclara disponibilidad en un solo punto.
- Aprende cambia la composición de cinco categorías y Vecindario centra/compacta uno o dos resultados y nombra los filtros activos.
- Validado localmente con `typecheck` y `build`; capturas full-page desktop/móvil en `screenshots/` para Login, Registro, Home, Licencias, Addons, Aprende, Vecindario y Nosotros. Sin publicar.

## 2026-09-23 — REL-004 Release Reconciliation `0.4.1` (documental)

Reconciliación de trazabilidad del release ya publicado. No modifica producto: sin cambios de motor, UX, páginas públicas, scoring, recomendaciones ni pruebas.

- **Contenido real de `0.4.1`** (61 archivos en `41986a4` + 5 documentos en `b59d614`): DIAG-002 (motor de Diagnóstico extraído a `app/features/diagnostic`), DIAG-002B (hardening semántico), DIAG-002C (cierre de decisiones de producto), UX-003.1–003.5 (Login, dashboard, shell del área cliente, Home Admin y detalle de negocio), OPS-001 (fundación documental GHL), comunidad/contacto WhatsApp y la corrección de `assets.directory` en `wrangler.jsonc`.
- **Brechas de trazabilidad registradas, no reescritas:** el commit `41986a4` lleva el mensaje `feat(ux): improve client and admin experience`, que describe solo uno de los cuatro bloques que contiene; y la versión salta de `0.3.0` a `0.4.1` sin que exista ningún commit `0.4.0`, pese a que `0.4.0` llegó a desplegarse en staging y producción desde un árbol sin commit.
- **Validación sobre `b59d614`** (`RAN` 2026-09-23): `typecheck`, `build`, `git diff --check` PASS; `test:unit` 75/75 PASS; 25 scripts E2E ejecutados con 21 PASS, 1 PASS PARCIAL (invitaciones, Gmail externo) y 3 FAIL de alcance UX-003 (`px-a`, `px-b`, `pe-b`), registrados como deuda `TEST-UX003-*`. Smoke HTTP anónimo de producción `0.4.1` PASS en 12 rutas públicas.
- **Correcciones documentales:** matriz de capacidades del Diagnóstico actualizada a DIAG-002C y 75 pruebas, con el encaje comercial marcado como publicado; recuento de documentos canónicos corregido a 16 y señalado que `UX-003-APP-ADMIN-AUDIT.md` no figura en la tabla canónica ni consta su autorización.
- Sin push y sin deploy. `origin/main` permanece en `732d6c2` (`0.3.0`), dos commits por detrás del código publicado.

## 2026-09-23 — DIAG-002C Product Decision Closure (`0.4.1`, LIVE)

- Licencia solo por necesidad recurrente real: una operación con registro y seguimiento resueltos y sin capacidad recurrente pendiente recibe «Ninguna necesaria por ahora» aunque un servicio o una lectura ayuden (escenarios G e I dejan de recibir «Barrio opcional»); sin consultas tampoco hay licencia; Barrio exige brecha sustantiva de seguimiento; Ciudad conserva sus prerrequisitos; una prioridad fundacional limita a Cuadra.
- Servicio ≠ licencia, protegido por invariantes: los servicios solo se derivan de prioridades reales y nunca de la licencia; un servicio puede recomendarse con licencia «ninguna».
- Vocabulario público canónico de addons: «IA conversacional» y «Automatizaciones» (con «WhatsApp», «SMS», «Telefonía», «AI Voice» e «Integraciones») unificado en `/addons`, el motor del Diagnóstico y el catálogo comercial; identificadores internos sin cambio; los nombres anteriores solo permanecen en entradas históricas de este CHANGELOG.
- Decisión registrada: Home mantiene cuatro puertas (Negocio, Profesional, Proyecto, Creador); «organización» sigue siendo perfil del motor y `/diagnostico?perfil=organization` sigue válido. Deuda `DIAG-002-HOME-DOORS` cerrada como intencional.
- Pruebas: 5 unitarias nuevas (`test:unit` 75/75); E2E de Addons actualizado al nombre público. Incluido en `0.4.1`; `test:unit` 75/75 PASS; publicado en staging y producción (evidencia en `ENVIRONMENTS.md`).

## 2026-09-23 — Release `0.4.1` DIAG-002C + UX-003 App y Admin (`LIVE`)

- Añadido shell compartido con navegación activa a Cuenta, Organización, Perfil y Servicios; oculta destinos de organización cuando el usuario todavía no pertenece a una.
- El detalle Admin del perfil ahora reúne contacto, sitio, WhatsApp, redes, modalidad, área y horarios guardados para revisión, en modo solo lectura.
- Estilos responsive para desktop y móvil; la navegación conserva landmarks y foco visibles, y sus transiciones respetan movimiento reducido.
- Publicado en staging: `vecidya-platform-staging`, Version ID `c7f7ee8b-e528-42d5-840c-ad7b4c9a9454` (versión #35); en producción: `vecidya-platform`, Version ID `eec3de6a-6711-4eff-91de-b413406e3618`.
- Staging sigue accesible por `workers.dev`; Wrangler no pudo reasignar el trigger de zona `vecidya.com/*` porque ya pertenece al Worker de producción. Sin migraciones remotas ni cambios de secrets.
- Sin cambios de permisos, escrituras, schema, migraciones, datos, dependencias ni proveedores. `test:unit` 75/75 PASS; `typecheck`, `build` y `git diff --check` PASS. Smoke anónimo `2026-09-23`: `/`, `/login`, `/contacto` y SVG WhatsApp `200`; Home/Contacto muestran `v0.4.1`; `/app` y `/app/internal` redirigen a `/login` con `302` en staging y producción.

## 2026-09-23 — Deploy `0.4.0` a staging y producción (`LIVE`)

- Deploy autorizado explícitamente del estado local `0.4.0` (DIAG-002B + primera entrega UX-003.1/003.4) en `vecidya-platform-staging` y `vecidya-platform`.
- Staging: Version ID `57c2f319-7de4-4995-a4ba-2a10db82fa7a`; producción: Version ID `8c7d38e6-d560-4f27-9a40-b9d102033eff`.
- Validación previa: `pnpm run typecheck`, `pnpm run build`, `pnpm run test:unit` (70/70 PASS) y `git diff --check` PASS.
- Smoke HTTP anónimo PASS el 2026-09-23 en ambos entornos para rutas públicas, CSS principal, `/robots.txt` y `/sitemap.xml`; `/app` y `/app/internal` devuelven `302` sin sesión.
- No se ejecutaron migraciones remotas ni se modificaron secrets. Staging continúa accesible por `workers.dev`; su trigger de zona no se reasignó por conflicto con producción.

## 2026-09-23 — DIAG-002B Semantic, Decision & Result Integrity Hardening (`v0.4.0`, PASS técnico local)

- Revisión hostil del recorrido pregunta → respuesta → evidencia → dimensión → estado → prioridad → recomendación → CTA sobre el grafo ejecutable del motor; 17 defectos semánticos reproducidos primero como pruebas y corregidos después.
- Evidencia: los activos ya no fabrican «contacto» (WhatsApp Business) ni «confianza» (web, Google); las reseñas pesan más en la prueba de un negocio; medición, responsabilidades y posventa solo se preguntan cuando llegan consultas.
- Estado: seis estados por reglas; una fuga grave concreta no queda enmascarada por el promedio; sin consultas no se afirma «captas y das seguimiento»; «operación activa con datos por confirmar» cuando registro y seguimiento son «no lo sé»; el estado cita las respuestas que lo originan.
- Hallazgos: sin duplicados entre «presencia escasa» y «no apareces en Google»; «varios canales» solo es brecha sin registro; «pedir reseñas» para negocios con buen proceso y sin reseñas; los hallazgos derivados de «no lo sé» usan lenguaje de comprobación; fortalezas de dimensión solo con evidencia suficiente, sin dudas y sin brecha grave confirmada.
- Contradicciones declaradas (idea + primera venta, actividad regular + sin consultas, presencia clara + propuesta sin resumir) bajan la confianza y se explican; nota de objetivo cuando automatizar, medir, ser encontrado o generar confianza requieren prerrequisitos.
- Licencia alineada con lo que incluye cada nivel: Cuadra cubre una brecha solo de registro; Barrio exige brecha de seguimiento con consultas reales; Ciudad exige captura y seguimiento definidos; una prioridad fundacional limita a Cuadra; las dudas no deciden licencia; sin servicio de relleno cuando no hay prioridades.
- Resultado reordenado (estado → prioridad principal destacada → siguientes pasos → evidencia → dimensiones por nivel sin números → encaje), enunciados por perfil en posventa, anclas reales a `/licencias#<nivel>` (ids añadidos a las tarjetas) y `/addons#<addon>`.
- Vocabulario de addons unificado: `/addons` es la fuente de verdad pública; el catálogo comercial conserva «AI Chat» y «Automatización inteligente» como alias históricos.
- Pruebas: `semantics.test.ts` (27) con personas adversariales A–L; `pnpm run test:unit` 70/70; `diagnostic-experience-check.mjs` actualizado; runner E2E local 25/25; typecheck, build y diff-check PASS. Mismo release candidate `0.4.0`; sin push ni deploy.

## 2026-09-23 — UX-003.1/003.4: primera mejora de App y Admin (`0.4.0`, local)

- Login reorganizado con composición responsive, ilustración existente, foco visible y jerarquía del formulario; el flujo de Better Auth no se alteró.
- Dashboard de cliente prioriza el perfil, muestra completitud con `progressbar` accesible y traduce roles al español.
- Home Admin ahora enlaza organizaciones, perfiles, servicios, integraciones y auditoría existentes; incorpora una ilustración ya versionada.
- Añadidos motion de entrada e interacción para las superficies autenticadas, con `prefers-reduced-motion`; sin librerías, assets binarios, migraciones, cambios de datos, deploy ni push.
- Typecheck y build PASS; login, CSS e imagen dieron HTTP 200 local. Revisión de navegador y E2E autenticado pendientes (Browser integrado no disponible; scripts usan D1 local).

## 2026-09-23 — Pulido de motion en Home (`0.4.0`, local)

- Añadidas entradas breves al copy y la ilustración principal, flotación sutil del pin y realces de interacción en opciones de Diagnóstico y tarjetas del Vecindario, usando el arte ya versionado.
- Las animaciones solo se activan cuando el usuario no solicita movimiento reducido; no se añadieron dependencias, datos, assets nuevos ni cambios de publicación.
- Pendiente ejecutar validación visual y typecheck/build para este cambio; producción continúa en `0.3.0`.

## 2026-09-23 — DIAG-002 Professional Diagnostic Engine (`v0.4.0`, PASS técnico local)

- Extraído el motor del Diagnóstico a `app/features/diagnostic/` (tipos, perfiles, banco de 26 preguntas con propósito y evidencia por opción, respuestas con aislamiento de ramas, secuencia por secciones, puntuación normalizada, estado por reglas, prioridades con dependencias, recomendaciones y contrato de deep link); `diagnostic.tsx` solo renderiza.
- Cinco perfiles (negocio, profesional, creador, proyecto, organización); «idea» pasa a ser un momento y se retira «candidatura o figura pública». Contexto de momento, equipo por rangos y objetivo; recorrido mínimo 6, típico 13–16 y máximo 19 preguntas.
- Siete dimensiones (claridad, presencia, alcance, confianza, contacto, seguimiento, medición) de 0 a 100 sobre evidencia aplicable; «no lo sé» reduce la confianza sin puntuar como «no»; «no aplica» no puntúa ni afecta la confianza; las dimensiones sin evidencia se muestran como «sin evaluar».
- Resultado explicable: estado, cómo llegamos, confianza separada, dimensiones, fortalezas, brechas, hasta tres prioridades con «por qué» (citando la respuesta) y «qué hacer», siguientes pasos en orden y encaje Vecidya (licencia por capacidad, que puede ser «ninguna todavía»; servicios, addons y artículos reales verificados por prueba).
- Contrato canónico `/diagnostico?perfil=<perfil>` con `objetivo=` opcional y lista cerrada; Home (Negocio, Profesional, Proyecto, Creador) y el artículo de CRM entran con contexto sin repetir la selección; valores inválidos caen al inicio normal.
- UI con `fieldset`/`legend`, radios y checkboxes nativos, stepper por secciones, `progressbar` con `aria-valuetext`, foco en cada pregunta, reduced motion y límites explícitos del diagnóstico; `mailto` prellenado sin respuestas crudas.
- Nuevas pruebas: `pnpm run test:unit` (node:test, 43 pruebas: contrato, exclusivas, aislamiento, secuencia, cotas, determinismo, escenarios A–E, invariantes sobre 1.125 combinaciones, catálogo real) y `diagnostic-experience-check.mjs` reescrito (deep links, Home, aislamiento, a11y, resultado, responsive 1366/768/390/360).
- Investigación aplicada y citada en el reporte: marco DMA de la Comisión Europea (normalización por dimensión), Pew Research (opción «no sé»), HBR 2011 (respuesta a leads), guía de ranking local de Google, GOV.UK «one thing per page», NN/g (carga cognitiva), W3C WAI (agrupación de controles) y datos de longitud de encuestas de SurveyMonkey.
- Versión `0.3.0` → `0.4.0` (MINOR, compatible: `/diagnostico` sin parámetros sigue funcionando). Sin persistencia, cookies, `localStorage`, CRM, GHL, migraciones, secretos, push ni deploy.

## 2026-09-23 — Comunidad y contacto WhatsApp (`v0.3.0`, LIVE)

- Añadido el enlace autorizado del grupo de WhatsApp de Vecidya/Vecindario en el footer público y en `/contacto`.
- Incorporado un icono SVG de WhatsApp accesible y CTAs externos que abren el grupo en una pestaña nueva.
- Añadido el WhatsApp comercial directo `https://wa.me/573244321864` como canal de contacto con Vecidya, separado del grupo comunitario.
- No se modificaron precios, modelo de datos, integración GHL, secretos, migraciones ni versión.
- Desplegado en staging (`vecidya-platform-staging`, Version ID `35c0961f-ccdd-4c76-a7d3-5bd347132a91`) y producción (`vecidya-platform`, Version ID `5d7278d3-6db6-4378-b497-39dc82f0aeb8`).
- HTTP anónimo de `/contacto` respondió `200` en staging y producción; ambos enlaces fueron encontrados en el HTML servido.

## 2026-09-23 — Corrección de assets de publicación (`v0.3.0`, LIVE)

- Corregido el despliegue de CSS, JavaScript y assets públicos: `wrangler.jsonc` ahora declara `assets.directory = ./build/client`.
- El incidente se detectó visualmente porque el HTML respondía `200`, pero los recursos estáticos devolvían `404`; no fue una caída del Worker ni un cambio de datos.
- Regenerados tipos Cloudflare, ejecutados build y `git diff --check`; redesplegados staging (`742c4f5b-f8c7-4634-8dba-9fae522cacbb`) y producción (`cd3f247e-64dc-4ca8-aff1-92ce137c0de0`).
- Comprobación HTTP anónima posterior PASS en producción para HTML, CSS, logo PNG, ilustración WebP, icono WhatsApp y `/contacto`.

## 2026-09-23 — OPS-001 GHL Pilot Foundation (`v0.3.0`, PASS DOCUMENTAL)

- Creado `docs/OPS-001-GHL-PILOT-FOUNDATION.md` con inventario de capacidades HighLevel, clasificación de costes, validación documental de Cuadra/Barrio/Ciudad, definición de configuración estándar, mapa de fuente de verdad, modelo de subaccount/location, piloto mínimo y contrato futuro.
- Verificada documentación oficial vigente de HighLevel: Starter USD 97/mes/3 subcuentas, Unlimited USD 297/mes, Agency Pro USD 497/mes, WhatsApp USD 10/location/mes, AI Employee Growth USD 50/location/mes y Unlimited USD 97/location/mes; consumos de telefonía, mensajería e IA permanecen separados.
- La cuenta contratada, plan real, ciclo de facturación, Labs, límites y capacidades habilitadas quedan `NOT VERIFIED` por falta de acceso autenticado; no se presentan referencias públicas como contratación de Vecidya.
- No se crearon tablas, migraciones, OAuth, API calls, webhooks, secretos, CRM propio, checkout, billing automático, páginas, precios públicos ni cambios de producción. La versión se mantiene en `0.3.0`.

## 2026-09-23 — Actualización de fotografía del equipo (`v0.3.0`, LIVE)

- Reemplazadas las fotografías de Yoan Ortiz, Edgar y el equipo por los assets entregados en `C:\Users\Admin\Downloads\fotos`.
- Convertidas a WebP optimizado y conservadas las rutas públicas existentes para no romper referencias.
- Ajustadas las dimensiones declaradas de las imágenes en `/sobre-nosotros` para evitar layout shift.
- Publicado en staging (Version ID `934810c2-db8d-4126-960a-cd302d1d45cb`) y producción (Version ID `fd6d0a4c-da2f-437f-8074-75a989050633`); assets verificados por hash en ambos entornos.

## 2026-09-23 — REL-003.1 Publish `0.3.0` (`LIVE`)

- Push autorizado completado: `origin/main` apunta a `ca629eb`.
- Staging publicado en `vecidya-platform-staging`, Version ID `58365cf8-2e1b-4b7a-b131-8631d9e96f22`, con `DB=vecidya-staging` y `APP_ENV=staging`; la URL workers.dev responde 200.
- Producción publicada en `vecidya-platform`, Version ID `26358c8b-70c4-41f3-8f10-34d1bd60916f`, con `DB=vecidya-prod` y `APP_ENV=production`; `vecidya.com` responde `0.3.0`.
- Smoke HTTP anónimo PASS para rutas públicas, artículo de Aprende, sitemap, robots, canonical/metadata y redirect `/que-debes-saber → /aprende`; no se ejecutaron migraciones ni se modificaron secrets.
- El trigger de zona de staging no se reasignó por conflicto con la ruta existente de producción; el Worker staging queda operativo en `workers.dev`.

## 2026-09-23 — REL-003 Release 0.3.0 Gate (`v0.3.0`, READY TO PUBLISH)

- Reconciliada la documentación canónica para distinguir la release candidate local `0.3.0` de la producción publicada `0.2.0`.
- Ejecutados typecheck, build, diff-check, runner E2E local completo (25 scripts: 24 PASS y 1 PASS PARCIAL por delivery Gmail externo) y smoke responsive/SEO público.
- Confirmadas ausencia de CRM propio, GHL activo, checkout, pagos, Stripe, secretos versionados y migraciones nuevas; el catálogo comercial mantiene la separación Licencia/Addon/Servicio/Consumo y Cuadra/Barrio/Ciudad.
- REL-003 queda **READY TO PUBLISH**. No hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod`.

## 2026-09-23 — Public hardening follow-up (`v0.3.0`)

- Corregidas brechas públicas de accesibilidad y robustez: imágenes del header con dimensiones explícitas, datos de perfil con `overflow-wrap` y auditoría de un único `<main>`, alt/dimensiones, metadata y overflow.
- Ampliado `commercial-experience-review-check.mjs` para verificar `robots.txt`, `favicon.ico`, alias `/que-debes-saber`, `og:image`, sitemap y rutas privadas excluidas.
- `UX-PUBLIC-001` queda resuelta en el alcance público; las pruebas de auth negativa, APIs privadas, CI y auditoría axe permanecen fuera de UX-002 y documentadas como brechas separadas.

## 2026-09-23 — UX-002.7 Commercial Experience Review (`v0.3.0`, PASS técnico local)

- Auditado el recorrido comercial completo `Aprende → Diagnóstico → Licencias → Addons → Servicios → Contacto` sin crear nuevas páginas ni activar funcionalidades comerciales.
- Verificados CTAs cruzados, navegación pública desktop/móvil, separación Licencia/Addon/Servicio/Consumo, referencias Cuadra/Barrio/Ciudad etiquetadas y ausencia de GHL/HighLevel público.
- Añadido `commercial-experience-review-check.mjs` al runner local: sitemap, metadata, exclusión de `/app`, `/api`, `/login` y `/register`, overflow y responsive 1366/768/390/360.
- Añadido «Nosotros» a la navegación desktop para completar la entrada institucional; no se modificó el modelo de datos.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-23 — UX-002.6 Content & Learn Experience (`v0.3.0`, PASS técnico local)

- Evolucionada `/aprende` a centro de conocimiento con cinco categorías y cuatro artículos iniciales atribuidos a Yoan Ortiz.
- Añadidas páginas `/aprende/:slug` con introducción, problema, explicación sencilla, ejemplos, índice accesible, siguiente paso y CTA contextual a Diagnóstico o Servicios.
- Añadidos tres diagramas educativos SVG para CRM, IA y automatización; se reutiliza una ilustración existente para presencia digital.
- Añadidas metadata canonical/Open Graph por artículo y entradas dinámicas en `sitemap.xml`; sin CMS, newsletter, comentarios, cursos ni datos comerciales ficticios.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-23 — UX-002.5 Diagnostic Experience 2.0 (`v0.3.0`, PASS técnico local)

- Evolucionado el resultado de `/diagnostico` sin modificar el algoritmo de scoring: ahora muestra situación actual, observaciones, prioridades y un camino recomendado.
- Añadido mapeo orientativo a licencia Cuadra/Barrio/Ciudad, addons posibles, servicios útiles y hub educativo `/aprende`.
- Conservados posición, confianza, dimensiones, fortalezas, oportunidades, CTAs, reinicio, anonimato, carácter efímero y ausencia de persistencia.
- Actualizada metadata SEO y ampliado el E2E responsive para validar el nuevo resultado y sus enlaces comerciales.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-22 — UX-002.4 Services Experience (`v0.3.0`, PASS técnico local)

- Actualizada `/servicios` para presentar servicios profesionales de Organización del negocio, Formalización de base, Presencia digital, Automatización, Inteligencia artificial y Marketing y crecimiento.
- Añadida la separación pública entre Licencia, Addon, Servicio y Consumo externo, con enlaces a `/licencias` y `/addons` y CTA de Diagnóstico.
- Sustituido el lenguaje de catálogo genérico por resultados, problemas y apoyos posibles; no se publican precios generales ni se expone GHL como producto.
- Ampliado el E2E público para validar las áreas nuevas, el modelo comercial y los enlaces de navegación.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-22 — UX-002.3 Addons Experience (`v0.3.0`, PASS técnico local)

- Añadida la ruta pública `/addons` con hero de expansión, definición de addon, categorías de Comunicación, Automatización, Inteligencia Artificial e Integraciones y cards de capacidades.
- Explicada la diferencia entre licencia, addon, servicio y consumo externo; los consumos variables permanecen separados y no se publican precios de addons.
- Conectada la experiencia con Diagnóstico, Licencias y Servicios; reutilizados el sistema visual y los iconos existentes, sin integración GHL activa.
- Añadido `addons-experience-check.mjs` para metadata, sitemap, categorías, cards, CTAs, keyboard focus y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-22 — UX-002.2 Licencias Experience (`v0.3.0`, PASS técnico local)

- Añadida la ruta pública `/licencias` con hero, definición de licencia, tarjetas Cuadra/Barrio/Ciudad, comparador responsive, evolución por necesidad, addons, FAQ y CTA de Diagnóstico.
- Las referencias `USD 39/mes`, `USD 59/mes` y `USD 89/mes` se muestran como referencias comerciales, sin presentarlas como precio publicado ni activar checkout, pagos o suscripciones.
- Reutilizados el sistema visual, iconos existentes, metadata institucional, navegación pública y footer; no se generaron assets nuevos.
- Añadido `licenses-experience-check.mjs` para metadata, CTAs, accesibilidad básica, comparador desktop/móvil y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-22 — UX-002.1 Product Catalog Foundation (`v0.3.0`, PASS documental)

- Creado `docs/business/VECIDYA_PRODUCT_CATALOG.md` como matriz comercial maestra de licencias Cuadra, Barrio y Ciudad.
- Separadas las categorías licencia, addon, servicio y consumo externo; documentadas las reglas de evolución por necesidad, el diagnóstico inicial/profesional, Aprende y los mapas comerciales.
- Registrada HighLevel como infraestructura externa prevista, con la referencia Starter entregada, sin declarar integración activa ni crear CRM propio.
- No se modificaron páginas públicas, precios publicados, componentes, rutas, schema, migraciones, checkout, push ni deploy.

## 2026-09-22 — UX-001C Public Experience Polish (`v0.3.0`, PASS técnico local)

- Auditada y pulida la experiencia pública como un único recorrido: navegación desktop priorizada, estado activo exacto, menú móvil con Escape/retorno de foco y footer agrupado en Explorar, Empezar y Legal.
- Los resultados filtrados del Vecindario conservan canonical base y pasan a `noindex, follow`; `/que-debes-saber` redirige permanentemente a `/aprende` y deja de competir como ruta indexable.
- Actualizado el E2E público responsive para cubrir noindex, redirect legado y exclusión del alias en sitemap; no se añadieron páginas, funcionalidades, migraciones ni assets nuevos.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas. Producción continúa en `0.2.0`.

## 2026-09-22 — UX-001B.10 Legal & Trust Experience (`v0.3.0`, PASS técnico local)

- Reorganizada `/privacidad` como una experiencia clara de confianza: datos actuales, uso/control, límites, derechos y contacto.
- Confirmado `mailto:hola@vecidya.com`, canonical `/privacidad`, robots indexables y Open Graph institucional.
- El footer conserva enlaces reales a Privacidad, Contacto, Nosotros y Aprende; no se creó `/terminos` porque no existe contenido legal aprobado para esa página.
- Añadido `legal-trust-experience-check.mjs` con 200, metadata, footer, mailto, ausencia de enlaces legales ficticios, keyboard focus y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy ni migraciones remotas.

## 2026-09-22 — Cierre de regresión C2 Business Operations (`v0.3.0`)

- Corregido el render SSR de los horarios compactados del perfil público: la etiqueta completa (`Lun–Vie · 09:00–18:00`) se emite como una unidad legible y estable para HTML/E2E.
- `product-evolution-001-c2-business-operations-check.mjs` vuelve a **PASS** en validación privada, perfil público, JSON-LD y responsive del editor/perfil.
- No se modificaron schema, migraciones, scoring, rutas públicas ni versión; no hubo push ni deploy.

## 2026-09-22 — UX-001B.9 Learn Experience (`v0.3.0`, PASS técnico local)

- Establecida `/aprende` como ruta canónica educativa y conservado `/que-debes-saber` como alias legado; la navegación pública ahora apunta a `/aprende` y el sitemap usa la canonical.
- Rehecha la experiencia con hero, cuatro temas conceptuales, estado editorial honesto sin artículos ficticios, criterio de contenido y CTAs a Diagnóstico/Contacto.
- Reutilizada la ilustración de prioridades existente; no se añadieron CMS, artículos, autores, fechas, lectores, comentarios ni structured data editorial.
- Añadido `learn-experience-check.mjs` con H1, metadata, CTAs, estado vacío, keyboard focus y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.8 About Experience (`v0.3.0`, PASS técnico local)

- Rehecha `/sobre-nosotros` desde una lógica de confianza: propósito real, origen del problema, personas visibles, forma de trabajar y punto de vista sobre lo digital.
- Incorporadas las fotos reales entregadas de Yoan y Edgar como WebP optimizados: imagen conjunta desktop/mobile y perfiles individuales; no se alteró la identidad de las personas ni se añadieron credenciales no verificadas.
- Los CTAs finales mantienen la separación de B.7: Diagnóstico para orientarse y Contacto para hablar con Vecidya.
- Añadido `about-experience-check.mjs` con equipo, propósito, metadata, keyboard focus, ausencia de métricas ficticias y responsive 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.7 Join + Contact Experience (`v0.3.0`, PASS técnico local)

- Separadas las responsabilidades de `/unete` y `/contacto`: Únete explica cómo empezar con dos caminos; Contacto declara el email como canal directo real.
- `/unete` conserva la ilustración de onboarding, reduce el contexto necesario a cinco puntos y el proceso a tres pasos, sin registro, checkout ni promesas operativas.
- `/contacto` mantiene `mailto:hola@vecidya.com`, añade guidance breve, expectativas honestas y enlace a privacidad sin simular teléfono, WhatsApp, chat, booking o formulario persistente.
- Añadido `join-contact-experience-check.mjs` con metadata, H1, CTAs, mailto, privacidad, keyboard focus y responsive 1366/768/390/360; la deuda C2 de horarios permanece independiente.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.6 Diagnostic Experience (`v0.3.0`, PASS técnico local)

- Mejorada `/diagnostico` con selector visual coherente con Home, preguntas con jerarquía clara, `Pregunta X de Y`, progreso accesible y etapas visibles.
- Añadidos foco al encabezado de cada pregunta, navegación anterior/siguiente, estados seleccionados con `aria-pressed`, soporte de teclado y reinicio sin persistencia.
- El resultado ahora explica posición, confianza, dimensiones con labels humanos, fortalezas, oportunidades y próximos focos; las prioridades compatibles enlazan a anchors reales de `/servicios`.
- Corregida la contaminación de respuestas al cambiar de perfil: se limpian respuestas dependientes sin alterar el algoritmo de scoring para respuestas equivalentes.
- Añadido `diagnostic-experience-check.mjs` con selector, keyboard, progreso, back/next, resultado, reinicio y responsive 1366/768/390/360. La deuda C2 de horarios permanece independiente y fuera de alcance.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.5 Services Experience (`v0.3.0`, PASS técnico local)

- Rehecha `/servicios` como guía de decisión: hero breve, selector por necesidades, cuatro áreas core y proceso de tres pasos.
- Cada servicio comunica problema, resultado, apoyo posible y un CTA real; Organización y crecimiento se conserva como área secundaria sin inventar oferta.
- Reutilizados los cuatro SVG de Servicios aprobados en B.2; no se añadieron assets, precios, checkout, paquetes ni structured data comercial.
- Actualizada la prueba pública para validar H1 único, selector, anchors, CTAs, ausencia de «SERVICIOS COMPRABLES» y responsive en 1366/768/390/360.
- Se mantiene `0.3.0`; no hubo push, deploy, migraciones remotas ni cambios en `vecidya-prod` (`0.2.0`).

## 2026-09-22 — UX-001B.4 Public Business Profile (`v0.3.0`, PASS técnico local)

- Mejorada la experiencia de `/vecindario/:slug` como presencia pública del negocio: identidad, ubicación, CTA primario, descripción, detalles operativos, horarios, contacto y redes reales.
- Los canales de contacto conservan la jerarquía WhatsApp → teléfono → website → email, con URLs seguras y nombres accesibles. Los paneles sin datos no se renderizan.
- Los horarios se agrupan visualmente con etiquetas de días y valores de tiempo sin introducir “abierto ahora” ni inferencias de timezone.
- JSON-LD `LocalBusiness` mantiene solo datos existentes e incorpora el website real en `sameAs`; no se agregan reviews, ratings, geo ni servicios comerciales ficticios.
- Actualizadas pruebas de perfil publicado, draft, opcionales vacíos, JSON-LD y cierre contextual. Validado con E2E de perfil, E2E público, Playwright responsive, typecheck, build y diff-check.
- Se mantiene `0.3.0`; no hubo deploy, migraciones remotas ni cambios en `vecidya-prod`.

## 2026-09-22 — UX-001B.3 Vecindario Experience (`v0.3.0`, PASS técnico local)

- Rediseñado `/vecindario` como superficie de descubrimiento: header breve, búsqueda por nombre, filtros exactos de categoría/ciudad, resumen de filtros activos y grid responsive.
- Reutilizada `BusinessCardV2` entre Home y Vecindario; se mantiene información pública mínima y no se agregan badges, rankings ni datos ficticios.
- Diferenciados los estados vacíos de directorio sin perfiles y búsqueda filtrada sin coincidencias.
- La búsqueda escapa `%`, `_` y `\\` para evitar que caracteres LIKE actúen como comodines.
- Validado con E2E público, QA responsive local, `pnpm run typecheck`, `pnpm run build` y `git diff --check`.
- Se mantiene `0.3.0`; no hubo deploy, migraciones remotas ni cambios en `vecidya-prod`.

## 2026-09-22 — UX-001B.2 Public Home Implementation (`v0.3.0`, PASS técnico local)

- Reemplazada la Home extensa por seis bloques de experiencia: Hero/producto, Vecindario real, Diagnóstico interactivo, Servicios visuales, transformación y CTA final.
- La Home lee hasta tres perfiles publicados desde D1 mediante la query pública existente, excluye borradores/suspendidos y mantiene estado honesto cuando no hay perfiles.
- Añadidos ocho SVG individuales: cuatro iconos de Diagnóstico y cuatro iconos de Servicios. Añadida imagen Open Graph institucional `1200×630` (`og-vecidya-public.svg`). No se integraron assets de reviews/ratings.
- Unificada la etiqueta pública `Aprende` en desktop, móvil y footer; añadidas `og:url`, `og:image` y Twitter Cards; corregido el landmark principal de la Home.
- Validado con `pnpm run typecheck`, `pnpm run build`, `git diff --check`, `product-experience-a-public-review-check.mjs` (PASS) y QA Playwright Edge en 1366/768/390/360 sin overflow.
- `0.3.0` queda local/release ready; no hubo deploy, migraciones remotas ni cambio de producción (`0.2.0`).

## 2026-09-22 — EMAIL-001D Password Reset Production E2E (`v0.2.0`, PASS)

- Evidencia manual autorizada del operador para `hola@vecidya.com`: correo real recibido, enlace de producción abierto, formulario `reset-password` ejecutado y contraseña modificada correctamente.
- Flujo verificado: `forgot-password → Gmail real → enlace de recuperación de producción → reset-password → contraseña modificada`.
- EMAIL-001 permanece **PASS / CLOSED** en `v0.2.0`. La autenticación posterior con la nueva contraseña no se afirma sin evidencia separada.
- Verificación de email con cuenta secundaria e invitación completa (entrega + aceptación) permanecen **PENDING / follow-up**.

## 2026-09-22 — EMAIL-001C Production Release (`v0.2.0`, PASS)

- Publicado el commit `6b351c4` en `vecidya-platform` top-level sobre `vecidya-prod`; Version ID `c38ce78b-648c-438c-a796-f20f7bf8e4b3`.
- Smoke público PASS: rutas principales, `forgot-password`, `reset-password`, `verify-email`, `robots.txt`, `sitemap.xml` y `www` → apex; footer público reporta `0.2.0`.
- Solicitud productiva de reset para `hola@vecidya.com` respondió `200` con mensaje genérico; el operador confirmó recepción en inbox. Gmail OAuth refresh, API send y entrega real quedan **PASS**. El detalle del reset E2E fue reconciliado en EMAIL-001D.
- No se modificó D1, no se ejecutaron migraciones ni E2E remotos destructivos, y no se expusieron valores de secretos. Verificación autenticada de esta release e invitaciones requieren una sesión/cuenta controlada y permanecen como follow-up explícito.

## 2026-09-22 — EMAIL-001 Gmail Release Ready (`v0.2.0`, no publicada)

- Confirmada la configuración top-level de producción: `EMAIL_PROVIDER=gmail`, `EMAIL_FROM=hola@vecidya.com` y `EMAIL_REPLY_TO=hola@vecidya.com`.
- Confirmados, sin leer ni versionar sus valores, los secretos requeridos por el código: `GMAIL_OAUTH_CLIENT_ID`, `GMAIL_OAUTH_CLIENT_SECRET` y `GMAIL_OAUTH_REFRESH_TOKEN`.
- Retiradas las rutas y el módulo de bootstrap OAuth temporal; el refresh token ya no se obtiene desde una superficie pública de Vecidya.
- Validación local y E2E ejecutados en este corte. Estado: **RELEASE READY**; no se declara delivery Gmail PASS, no se ejecutó deploy ni push.

## 2026-09-21 — Actualización de dependencias (local, no publicada)

- Actualizadas las dependencias directas de React Router, React, Better Auth, Cloudflare/Vite, TypeScript, tipos de Node/React, Playwright, Wrangler y Drizzle Kit; el lockfile queda sincronizado con pnpm 11.21.0.
- Añadidos overrides seguros para `qs` y `morgan`, corrigiendo sus avisos transitivos conocidos. Permanece un aviso moderado de `esbuild@0.18.20` heredado por `@esbuild-kit` de Drizzle Kit; no se fuerza una versión incompatible con ese loader.
- Validado con `pnpm install --frozen-lockfile`, `pnpm run typecheck`, `pnpm run build`, `pnpm run test:email`, `pnpm audit` y `git diff --check`. No hubo deploy ni cambio de versión publicada.

## 2026-09-21 — EMAIL-001 Gmail Transactional Email Foundation (parcial, no publicada)

- Sustituido el camino activo de Resend por un adaptador server-only provider-independent preparado para Gmail API, con MIME UTF-8 texto/HTML, `Reply-To`, validación de headers y clasificación segura de errores.
- Integrados los callbacks de Better Auth para verificación de email y reset de contraseña, además de UI mínima para solicitar reset, cambiar contraseña y verificar/resolicitar correo, sin activar verificación obligatoria global para no bloquear usuarios existentes.
- Añadido proveedor fake exclusivamente para pruebas/local staging y cuatro pruebas unit-like del adaptador. No se configuraron OAuth client/refresh token, no se enviaron correos Gmail y no hubo deploy ni bump de versión.

## 2026-09-21 — PROD-001 Production Separation & Post-Recovery Baseline (`v0.1.2`, pre-cutover)

- Respaldada fuera del repositorio la D1 pública `vecidya-staging` y verificados su inventario, migraciones `0000`–`0009` e invariantes de identidad, organización, membresía, autoridad de plataforma y perfil publicado.
- Creada `vecidya-prod` (`8edc3f04-258e-4c29-9f33-76fec3d25042`) y clonada mediante migraciones más exportación de datos, con paridad de conteos y relaciones críticas comprobada.
- Preparada la separación explícita de Wrangler: producción apunta al nuevo D1 y `env.staging` conserva `vecidya-staging`; se añadió `APP_ENV` y fallback de origen para staging.
- Endurecidas las pruebas remotas: requieren intención explícita, `TARGET_ENV=staging`, Worker dedicado `vecidya-platform-staging` y `D1_NAME=vecidya-staging`; rechazan hosts y D1 productivos.
- `v0.1.2` es versión de código preparada, no publicada. No hubo deploy, cutover, rotación de secretos ni mutación destructiva de `vecidya-staging`.

## 2026-09-21 — PROD-001B Production Cutover (`v0.1.2`)

- Desplegado `vecidya-platform` con Version ID `2b655f6b-b2ad-461d-9231-fdb96221dfd0`; Wrangler confirmó `DB=vecidya-prod`, UUID `8edc3f04-258e-4c29-9f33-76fec3d25042`, `APP_ENV=production` y rutas `vecidya.com`/`www.vecidya.com`.
- Smoke HTTP anónimo PASS para `/`, `/vecindario`, `/vecindario/vecidya`, `/login`, `/robots.txt`, `/sitemap.xml`, redirect `www` → apex y footer público `0.1.2`.
- `vecidya-staging` permanece existente y preservada; no se ejecutaron E2E remotos destructivos ni se rotaron secretos.

## 2026-09-21 — PROD-001C Authenticated Production Verification

- Verificación manual autorizada en `https://vecidya.com` con `hola@vecidya.com`: login PASS, `/app` PASS y `/app/internal` PASS.
- El flujo `/login → /app → /app/internal` confirmó sesión, organización activa y autorización `platform_admin` contra la producción ya conectada a `vecidya-prod`.
- `/app/business-profile`, `/app/organization` y `/app/internal/businesses` no fueron rechecados en este smoke; no bloquean el cierre de la separación de producción.
- PROD-001 queda **CERRADA**. Version impact: **NONE**. No se ejecutó deploy adicional.

## 2026-09-21 — AUTH-BOOTSTRAP-001 / acceso administrativo

- Recuperada la cuenta existente `hola@vecidya.com` mediante un bootstrap efímero protegido por secreto Cloudflare, usando el hashing y adapter de Better Auth; la contraseña no se guardó en texto plano ni en documentación.
- Comprobados manualmente el login, `/app` y `/app/internal`; `hola` quedó como `platform_admin` activo y `owner` de `Vecidya`.
- Eliminado `soporte@vecidya.com` de la D1 pública junto con sus sesiones, credenciales y membresía en cascada; no quedaron filas de soporte.
- Retiradas las rutas temporales de recuperación y rotación; eliminado el secreto bootstrap. Version ID final: `f8936f89-ef27-4d50-ae56-1b6e4ba35fed`; migraciones remotas no ejecutadas; version impact: **NONE**.

## 2026-09-20 — RP-001A Real Proof / Local Validation

- Añadido `tests/e2e/rp-001a-local-real-proof-check.mjs` como procedimiento reproducible y efímero para validar localmente los tres casos documentados (Edgar/SURA, Asesorar-T y Agrofanescol) sin versionar secretos, datos privados ni publicar pilotos.
- Validado: organizaciones y membresías locales, cambio de contexto, aislamiento cross-tenant, borradores, bloqueo de publicación incompleta, exclusión de Vecindario y ausencia de JSON-LD en perfiles no publicados. Los datos desconocidos permanecen vacíos o `MISSING / UNCONFIRMED`.
- RP-001A: **PASS LOCAL**. Remote D1, publicación remota, deploy y verificación de producción: **NOT PERFORMED**. Version impact: **NONE**.

## 2026-09-20 — PERF-001 Image & Asset Optimization (`v0.1.1`)

- Optimización compatible de assets visuales: inventario inicial de 18 raster PNG, conversión selectiva de 14 assets activos a WebP y conservación del ícono canónico de marca y 3 recursos seleccionados sin uso.
- Reducción de `18,649,999` a `4,369,378` bytes: ahorro de `14,280,621` bytes (`13.619 MiB`, `76.57 %`). Se actualizaron las referencias TS/TSX/CSS, se declararon dimensiones de contenido y se aplicó lazy loading únicamente below-the-fold.
- Validación local: typecheck, build, `git diff --check`, 17 E2E heredados y QA visual desktop/móvil sin imágenes rotas ni overflow. Deploy: **NO**; producción: **NOT PERFORMED**.

## 2026-09-20 — Política de versionado visible

- Añadido `PlatformFooter`, con versión derivada de `package.json` y copyright `© 2026 Vecidya`, compartido por páginas públicas, `/app` y administración interna.
- La política operativa de versiones y publicaciones queda documentada en `AGENTS.md` y `ENVIRONMENTS.md`: una versión publicada exige deploy autorizado y comprobación HTTP anónima fechada.

## 2026-09-20 — Migración a repositorio limpio

- El proyecto actual se separa del historial anterior para publicar un snapshot inicial limpio en `adsmanager-dev/Vecidya`.
- Se conservan código, documentación, configuración, migraciones y pruebas versionadas; se excluyen dependencias generadas, artefactos de build y secretos mediante `.gitignore`.

## 2026-09-20 — RR-001 Release Readiness & Test Baseline

- Corregidos los tests locales stale para usar el binding D1 `DB`, añadido `test:e2e` secuencial y guardas que rechazan destinos remotos; las pruebas remotas exigen `RUN_REMOTE_E2E=1` y permanecen fuera del runner local.
- Corregido PX-B: locators, cliente de sesión, fixture de logo local, repetición por viewport y overflow responsive real de `/app/organization` en 360 px. El flujo de login fija la primera organización mediante Better Auth y la API protege perfiles publicados contra actualizaciones incompletas; el retiro de membresías limpia sesiones activas obsoletas.
- Validación RR-001: `pnpm run test:e2e` **17 PASS / 0 FAIL / 0 SKIP** sobre D1 local limpia; `pnpm run typecheck` PASS; `pnpm run build` PASS; `git diff --check` PASS. No hubo deploy, push, D1 remoto ni migraciones remotas.

## 2026-09-20 — Baseline 2026-09-20 (auditoría y reconciliación)

- Auditoría de solo lectura del repositorio real (código, schema, 10 migraciones, 39 rutas, 25 archivos de prueba, configuración, historial Git) y reconciliación de toda la documentación contra ese código. No se implementó producto, no se creó schema ni migraciones, no se desplegó, no se usó `--remote` y no se tocaron datos reales.
- Validación ejecutada: `git diff --check` limpio; `pnpm run typecheck` PASS; `pnpm run build` PASS; D1 local con migraciones `0000`–`0009`; 12 pruebas E2E locales, **11 PASS / 1 FAIL** (`px-b`: defectos del propio script). Las 2 pruebas remotas y las 9 con nombre D1 obsoleto no se ejecutaron. Detalle en `TESTING.md`.
- Estado público verificado con peticiones anónimas de solo lectura: todas las rutas públicas 200; `/aprende` 404; `www` → apex 301; rutas privadas y APIs 302 → `/login`; `/app/internal/audit` 404. Conclusión: el sitio público **no** contiene el código de `0007`–`0009` (2026-09-07); el sitemap lista 10 URLs con un único vecino real (Vecidya).
- Hallazgos principales: `main` está 35 commits por delante de `origin/main`; `vecidya.com` corre sobre infraestructura staging; 8 archivos de prueba usan el D1 obsoleto `vecidya-dev`; las dos pruebas remotas escriben en la D1 pública; el login no fija organización activa; las invitaciones no pueden aceptarse sin verificación de email; el piloto de Edgar no es reproducible desde el repositorio; el test de app cliente (`px-b`) nunca completa; el Diagnóstico y el sitemap/robots no tienen pruebas. Ver `STATUS.md → Open Debt`.
- Documentación: 13 documentos activos (máximo 20). `STATUS.md` pasa de una tabla de fases con evidencia en celdas a matriz de capacidades + fases declaradas vs reconciliadas + Open Debt; `PROJECT_STATE.md` recoge inventario de Home, campos de Business Profile, capacidades de Admin, piloto y mapa de producto (actual vs FUTURE); `STRUCTURE.md` incorpora el inventario de las 39 rutas; `DATABASE.md` documenta las 16 tablas y elimina narrativa obsoleta de `vecidya-dev`; `ENVIRONMENTS.md` separa Local/Development/Staging/Public/Production; `ARCHITECTURE.md` documenta los dos sistemas de autorización y lo FUTURE; `ROADMAP.md` queda solo con trabajo futuro y un nuevo orden; **nuevo** `TESTING.md` (vacío real: no existía inventario ni instrucciones de pruebas); `docs/README.md` se fusionó en `vecidya-platform/README.md`; `GOVERNANCE.md` sube el límite de 15 a 20, añade vocabulario de capacidades y niveles de evidencia.
- Correcciones a afirmaciones anteriores (la historia no se reescribe; se anota aquí): la entrada de 2026-09-07 «PRODUCT-EVOLUTION-001 Bloque A» afirmó que los documentos canónicos no contenían afirmaciones contradichas por el código — el baseline halló varias (README de plataforma, conteo de pruebas con `vecidya-dev`, selector de organización, «integraciones read-only»); «verificado con datos reales» del bloque E1 no es reproducible; «TEST-002 runner estabilizado» ya no se sostiene.

## 2026-09-07 — Reestructuración del árbol `b1` (commit `ec79b22`, sin documentar en su momento)

- Eliminó del control de versiones ~1.250 archivos: `archive/` (snapshots históricos y experimentos), `resources/assets/` (biblioteca fuente de assets de marca) y `resources/README.md`. Recuperables desde el historial (`git show ec79b22^:resources/assets/…`). Dejó obsoletas las referencias de `README.md` y `AGENTS.md` a esos directorios (corregidas en el baseline).
- Añadió `vecidya-platform/vecidya-platform.zip` (37,9 MB; snapshot de 2026-08-27 que no incluye `0007`–`0009`; sin archivos de secretos por nombre) y el script `product-experience-b-client-app-check.mjs` (nunca terminó de pasar; ver `TEST-PXB-001`).

## 2026-09-07 — Commit `179784a` «test: validate real business pilot readiness»

- A pesar del prefijo `test:`, modificó solo cuatro Markdown (`CHANGELOG`, `PROJECT_STATE`, `ROADMAP`, `STATUS`); no añadió ninguna prueba ni fixture del piloto.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque E1

- `Real Business Pilot — Local Real-Data Readiness`: construidos localmente, con fixtures efímeros eliminados al finalizar, los tres negocios reales de Edgar como organizaciones independientes (Edgar owner de las tres): "Edgar | Asesor de Seguros SURA", "Asesorar-T" y "Agrofanescol". Sin código, schema ni migraciones nuevas — bloque de validación de datos reales sobre la arquitectura ya cerrada (Bloques B, C1, C2, D1).
- Ningún dato faltante fue inventado: sin WhatsApp (no asumido del teléfono confirmado), sin email, sin sitio web, sin redes sociales, sin horarios, sin cobertura, sin logo. No se realizó investigación externa automática.
- Verificado con datos reales: aislamiento multi-organización sostenido entre las tres organizaciones; perfil público, filtro por categoría y JSON-LD (sin `sameAs` ni WhatsApp inventados) correctos; gobierno de plataforma (verificar, badge público, suspender → 404 y exclusión del directorio, reactivar, audit log) ejecutado sobre un caso real.
- No se creó ninguna cuenta real de Edgar: no se dispone de su email real y no se inventó uno; se usó una identidad de fixture local claramente sintética, eliminada al finalizar. Este es un bloqueo real registrado para `Bloque E2`, no una omisión.
- Clasificación de readiness: Organización A (`Edgar | Asesor de Seguros SURA`) queda `BLOCKED` por riesgo de implicar afiliación oficial con SURA sin acreditación confirmada — no por falta de datos de contacto. Organización B (`Asesorar-T`) queda `PARTIAL`, bloqueada específicamente por tener dos nombres públicos candidatos sin confirmación explícita del usuario. Organización C (`Agrofanescol`) queda `PARTIAL`, publicable honestamente; sirvió además como stress test de dominio: su naturaleza de ecosistema/comunidad agropecuaria encaja de forma imperfecta en el modelo `BusinessProfile` actual (categoría y CTA únicos para un negocio, no para una comunidad con múltiples facetas) — evidencia registrada, sin crear `CommunityProfile` ni ningún tipo de perfil nuevo.
- Registrada la deuda `PILOT-IDENTITY-001` (email real de Edgar pendiente), `PILOT-NAME-ASESORAR-T` (nombre público pendiente de confirmación) y `PILOT-BRAND-SURA` (autorización de marca pendiente) en `PROJECT_STATE.md`.
- Sin deploy, sin escritura remota, sin `--remote`. `pnpm run typecheck`, `pnpm run build` y `git diff --check` no encontraron cambios de código que validar, consistente con que este bloque no tocó código de producto.
- Bloque cierra con `REMOTE PILOT AUTHORIZATION REQUIRED`: `Bloque E2 — Remote Pilot Publication` no se ejecuta sin autorización explícita del usuario y sin resolver `PILOT-IDENTITY-001`.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque D1

- `Admin Governance Foundation`: añadida migración aditiva `0009_platform-profile-governance.sql` con dos tablas nuevas, deliberadamente separadas de `business_profile` (no columnas adicionales) para que ninguna escritura tenant pueda tocarlas: `business_profile_governance` (verificación `unverified`/`verified`, estado de plataforma `active`/`suspended`) y `platform_audit_log` (actor, acción, entidad, organización, valor previo/nuevo, timestamp).
- Cada acción de gobierno (verificar, retirar verificación, suspender, reactivar) escribe la fila de gobierno y su fila de auditoría en un único `database.batch([...])` atómico de D1, evitando el estado "perfil cambió pero audit no existe".
- `/app/internal/businesses/:id` gana las cuatro acciones administrativas, mostrando solo las válidas según el estado actual (nunca "Verificar" sobre un perfil ya verificado, nunca "Suspender" sobre uno ya suspendido), con confirmación del navegador para suspender/reactivar por su impacto en visibilidad pública.
- Nueva página `/app/internal/audit` (y nueva entrada de navegación en `AdminShell`) lista la actividad administrativa global; el detalle de cada perfil muestra además su propia actividad contextual.
- Perfiles suspendidos dejan de listarse en `/vecindario` y su página pública devuelve 404 real (sin JSON-LD), vía `LEFT JOIN` con `business_profile_governance` en las consultas públicas (`getPublishedBusinessProfileBySlug`, `listPublishedBusinessProfiles`, `getPublishedBusinessProfileFilterOptions`). El tenant conserva sus datos, ve una señal de solo lectura "Estado de plataforma: Suspendido" en `/app/business-profile`, y republicar no revierte la suspensión porque esa tabla nunca la escribe.
- Perfiles verificados muestran "✓ Perfil verificado por Vecidya" en su página pública y un badge en el listado interno; el copy evita cualquier claim de garantía, certificación legal, solvencia o recomendación comercial. Ninguna propiedad JSON-LD de "verified" se inventó.
- Toda mutación de gobierno sigue `session → requirePlatformAdmin → resource lookup → mutation → audit`; probado con HTTP directo que un owner o admin de organización sin `platform_member` recibe 403, y que un `platform_admin` con `status=inactive` también recibe 403.
- Añadido `tests/e2e/product-evolution-001-d1-admin-governance-check.mjs`, cubriendo las 20 verificaciones del bloque (autorización, verificación, suspensión, reactivación) contra Worker+D1 local real; fixtures eliminados al finalizar.
- Corregido, solo en `admin-shell-check.mjs` y `admin-business-profiles-check.mjs` (las dos regresiones requeridas por este bloque), un identificador de D1 local obsoleto (`vecidya-dev`) heredado de antes de `PUBLIC-PROD-DIRECT-001`; el binding real es `DB`. El mismo defecto persiste en otros 6 tests no tocados, registrado como deuda en `PROJECT_STATE.md`.
- Reconfirmadas sin romperlas las regresiones de Business Profile, multi-organización, Contact & Presence (C1) y Business Operations (C2).
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin gestión de usuarios, ban, transferencia de ownership, impersonation, permisos administrativos granulares, appeals, emails de moderación, galería, R2, reviews, CRM, GHL ni Agency.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque C2

- `Real Business Profile — Business Operations`: añadida migración aditiva `0008_business-profile-operations.sql` con `service_mode` y `service_area` (opcionales) en `business_profile`, y tabla nueva `business_hours` (una fila por día de la semana, ancla `organization_id`, índice único `(organization_id, day_of_week)`). Sin coordenadas, radios, polígonos, geocoding ni mapas interactivos, conforme al alcance mínimo definido.
- Confirmado en auditoría previa que `city`/`country` representan la ubicación de referencia del negocio (mostrada y usada como filtro del Vecindario), sin contradicción respecto al nuevo `service_area`; no fue necesario redefinir su semántica.
- Elegida la alternativa de campo de texto libre para `service_area` (en vez de tabla hija) tras comprobar que los cinco casos objetivo (negocio local, profesional regional, servicio departamental, servicio nacional, híbrido presencial+remoto) se expresan correctamente sin estructura adicional.
- `business_hours` admite día abierto, día cerrado explícito (`is_closed`) y día sin definir (ausencia de fila); no admite dos turnos por día, festivos ni excepciones temporales, fuera de alcance de este bloque.
- `/app/business-profile` añade la sección "Cómo y dónde atiendes" (modalidad + cobertura) en el formulario principal, y una sección "Horarios" independiente con guardado propio (`intent=save-hours`) que reemplaza el set completo de 7 días en cada guardado.
- `/vecindario/:slug` muestra Cómo atiende/Cobertura solo cuando existen y compacta horarios agrupando días consecutivos con horario idéntico (p. ej. "Lun–Vie · 09:00–18:00"), sin fabricar continuidad sobre días sin definir ni mostrar bloques vacíos.
- JSON-LD `LocalBusiness` añade `areaServed` (Text, mapeo válido según Schema.org) y `openingHoursSpecification` únicamente con días realmente abiertos; los días cerrados o sin definir no se emiten.
- `BusinessCardV2` (tarjetas del Vecindario) queda sin cambios y sin filtros nuevos, tal como se definió el alcance.
- Añadido `tests/e2e/product-evolution-001-c2-business-operations-check.mjs`: validación y rechazo de modalidad/horarios inválidos, trim de cobertura, guardado/actualización/reload de horarios en sus tres estados (abierto, cerrado, ausente), aislamiento tenant de los tres campos en el editor privado, jerarquía y compactación del perfil público, JSON-LD sin datos vacíos, y ausencia de overflow horizontal en el editor de horarios (360px) y el perfil público (360/390/desktop); fixtures locales eliminados al finalizar.
- Reconfirmadas sin modificarlas las regresiones de Business Profile, Contact & Presence (C1) y aislamiento tenant multi-organización.
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin galería, R2, verificación, moderación, audit log, reservas, calendario, CRM, GHL ni Agencia.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque C1

- `Real Business Profile — Contact & Presence`: añadida migración aditiva `0007_business-profile-contact-presence.sql` con cuatro columnas opcionales en `business_profile`: `whatsapp`, `instagram_url`, `facebook_url`, `linkedin_url`. Sin datos existentes modificados, sin reset de perfiles, sin campos requeridos nuevos, aplicada únicamente en D1 local.
- WhatsApp se normaliza a formato internacional (`+<8-15 dígitos>`, tolerando espacios/guiones/paréntesis en la entrada) y el perfil público genera el enlace `https://wa.me/<dígitos>` sin asumir indicativo de país.
- Instagram, Facebook y LinkedIn se validan como URL HTTPS/HTTP contra el host esperado de cada plataforma (`instagram.com`, `facebook.com`/`fb.com`, `linkedin.com`); rechazan esquemas inseguros y hosts ajenos.
- `/app/business-profile` añade la sección "Contacto y presencia digital" sin duplicar teléfono/email/web ya existentes.
- `/vecindario/:slug` prioriza WhatsApp → Teléfono → Web como CTA principal (sin cinco acciones con el mismo peso) y muestra Instagram/Facebook/LinkedIn como enlaces secundarios de presencia digital, solo cuando existen.
- JSON-LD `LocalBusiness` añade `sameAs` únicamente con las redes reales publicadas, sin arreglos vacíos; WhatsApp no se transforma en `sameAs`.
- `BusinessCardV2` (tarjetas del Vecindario) queda sin cambios, tal como se definió el alcance.
- Añadido `tests/e2e/product-evolution-001-c1-contact-presence-check.mjs`: validación y rechazo de valores inválidos (UI y API), guardado y reload, aislamiento tenant de los campos nuevos entre dos organizaciones, jerarquía de CTA pública, `wa.me` correcto sin asumir Colombia, `sameAs` sin huecos, y ausencia de overflow horizontal en 360 px/390 px/desktop.
- Reconfirmadas sin modificarlas las regresiones de Business Profile, aislamiento tenant multi-organización y readiness del perfil público real.
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin horarios, galería, R2, cobertura geográfica avanzada, verificación, moderación, reviews, CRM, GHL ni Agencia.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque B

- Cerrada `Multi-Business Foundation`: formalizó documentalmente en `ARCHITECTURE.md` la arquitectura multi-organización que ya existía en código (`member` no restringe un usuario a una sola organización; `session.active_organization_id` selecciona contexto sin modelar ownership).
- Añadido `tests/e2e/product-evolution-001-b-multi-organization-check.mjs`: un mismo usuario propietario de dos organizaciones publica `BusinessProfile` y `organization_service` aislados por tenant, cambia de organización activa, `/app` y el selector reflejan la organización activa, el contexto se restaura al volver a la primera organización, y mutaciones de control en una organización no contaminan la otra en ninguna dirección.
- Auditado el selector de organización de `/app`; funciona correctamente (lista todas las organizaciones del usuario y marca la activa) y se conserva sin cambios (KEEP).
- Reconfirmadas sin modificarlas las regresiones existentes de Business Profile (`business-profile-experience-check.mjs`) y Services (`services-experience-check.mjs`).
- Reconciliado `ROADMAP.md` para que `PRODUCT-EVOLUTION-001` quede como secuencia activa inmediata y `PRODUCT-EXPERIENCE-001 B` pase a en espera; `Real Proof`/vecinos externos se reposiciona como piloto posterior a Business Profile/Admin Readiness.
- Validado con `pnpm run typecheck`, `pnpm run build` y `git diff --check`; sin schema, migración, roles nuevos, segundo sistema de tenancy, `agency`, cambios en Admin ni deploy.

## 2026-09-07 — PRODUCT-EVOLUTION-001 Bloque A

- Ejecutada auditoría de convergencia de producto (`Current Product Convergence Audit`) sobre el estado real de `main`, exclusivamente de lectura: sin cambios de código, schema, migraciones, configuración, assets, CSS, rutas, tests, datos ni documentación.
- Confirmado con evidencia ejecutable que multi-organización por usuario, cambio de organización activa, aislamiento tenant de `BusinessProfile`/`organization_service` y separación de `platform_member` respecto a `member.role` ya existen y funcionan en el código actual; los ocho documentos canónicos auditados no contenían afirmaciones contradichas por el código.
- Identificados gaps reales sin implementarlos: Home pública sin búsqueda ni datos reales, `BusinessProfile` sin WhatsApp/redes sociales/horarios/galería/cobertura/verificación, y Administración interna sin moderación, verificación ni audit log.
- Entregado el informe de auditoría directamente en la conversación, sin crear Markdown nuevo.

## 2026-08-27 — PRODUCT-EXPERIENCE-001 Bloque A

- Abierta la revisión funcional `PRODUCT-EXPERIENCE-001 — Web + Client + Agency Review`.
- `PUBLIC-GROWTH-001 Bloque C2` permanece abierto para vecinos externos, pero deja de bloquear el desarrollo general.
- El perfil público ahora conecta explícitamente hacia `Vecindario`, `Servicios`, `Diagnóstico` y `Contacto` como recorrido de producto.
- Añadido E2E local del recorrido `Home → Vecindario → perfil Vecidya → Servicios → Diagnóstico → Contacto` en desktop 1366 y móvil 390/360 px, con búsqueda, filtro, CTAs, email, web, metadata, JSON-LD y ausencia de patrones ficticios.
- Corregida la referencia histórica a D1 remoto sin perfiles publicados para que no contradiga el estado actual de Vecidya publicada.
- Sin schema, migraciones, CRM, métricas, ratings, perfiles inventados ni cambios de arquitectura.

## 2026-08-27 — PUBLIC-PROD-DIRECT-001

- Reconfigurado `wrangler.jsonc` para que `wrangler deploy` publique directamente el Worker top-level `vecidya-platform` en `vecidya.com/*` y `www.vecidya.com/*`.
- Eliminado `env.staging` como destino operativo del dominio público para evitar despliegues ambiguos con bindings dev/staging.
- Movidos `DB=vecidya-staging`, `APP_URL=https://vecidya.com` y `BETTER_AUTH_URL=https://vecidya.com` a top-level.
- Regenerado `worker-configuration.d.ts` desde la configuración pública directa.
- Movidas las rutas públicas desde `vecidya-platform-staging` hacia `vecidya-platform`; `wrangler deploy` normal quedó validado con Version ID `6cca1801-d638-4b6f-9849-ae9681716e6a`.

## 2026-08-27 — PUBLIC-GROWTH-001 Bloque C2

- Publicada Vecidya como primer vecino real de dogfooding en `https://vecidya.com/vecindario/vecidya`.
- Creadas cuentas reales `soporte@vecidya.com` y `hola@vecidya.com`; ambas quedaron como `admin` de la organización Vecidya y `platform_admin active` para administración interna.
- El perfil público usa datos autorizados: categoría `Servicios digitales y desarrollo empresarial`, Medellín, Colombia, email `hola@vecidya.com`, web `https://vecidya.com` y logo aprobado.
- Validado en remoto `/vecindario/vecidya`, búsqueda, filtro por categoría, asset de logo, JSON-LD `LocalBusiness`, acceso privado y acceso a administración interna con ambas cuentas.
- Desplegado el Worker público `vecidya-platform-staging` como deploy de bloque; Version ID `3159c989-1034-444d-b2e0-8d4ccd7357a4`.
- C2 permanece abierta: Vecidya valida dogfooding, pero el cierre requiere vecinos externos reales.

## 2026-08-27 — PUBLIC-GROWTH-001 Bloque C1

- Ejecutado `Real Profile Readiness` para comprobar el flujo usuario → organización → BusinessProfile → publicación → Vecindario.
- Añadido gate E2E local para validar creación, edición, publicación, slug único, aislamiento tenant por API, exclusión de borradores, filtros del directorio, perfil público, campos opcionales ausentes y JSON-LD `LocalBusiness`.
- Protegida la escritura de `BusinessProfile` contra slugs usados por otra organización antes de llegar a la restricción de D1, devolviendo error 400 claro.
- Confirmado que el schema actual es suficiente para los primeros perfiles comerciales reales; no hubo migraciones, CRM, persistencia nueva, perfiles universales, datos ficticios ni deploy.

## 2026-08-26 — PUBLIC-GROWTH-001 Bloque B

- `/servicios` pasa de descripciones comprimidas a fichas comprables por área.
- Cada servicio presenta `Problema`, `Cómo puede ayudar Vecidya`, `Qué puedes recibir` y `Cuándo tiene sentido`.
- Los entregables se describen como posibilidades reales según situación, sin crear paquetes cerrados, precios, garantías comerciales ni datos ficticios.
- Reforzada la regla consultiva: primero se entiende la necesidad, después se decide si tecnología, CRM, automatización o integración aporta valor.
- Sin cambios de arquitectura, CRM, schema, auth, persistencia, datos ni rutas.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `64e41d4b-0471-4357-b7ab-a99be99a2406`.

## 2026-08-26 — PUBLIC-GROWTH-001 Bloque A

- Abierta la etapa `PUBLIC-GROWTH-001` con foco en conversión del Diagnóstico, no en rediseño global.
- `/diagnostico` comunica antes de empezar qué recibirá la persona: posición digital, fortalezas, oportunidades y hasta tres próximos pasos.
- Eliminado el contador de respuestas activas del panel inicial para evitar lenguaje técnico/debug.
- Reforzado el cierre del resultado con resumen de posición digital y área prioritaria.
- Cambiado el CTA principal del resultado a `mailto:hola@vecidya.com` prellenado en cliente con tipo de presencia, posición digital, área prioritaria y objetivo marcado.
- Se mantiene el alcance del Diagnóstico: sin cambios de preguntas, branching, scoring, persistencia, schema, auth, API, CRM ni almacenamiento de respuestas.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `60ee26d1-76ac-4e48-8b25-6fc683f116a1`.

## 2026-08-26 — DIAG-RUNTIME-001 scoring polish

- Revisado el motor del Diagnóstico con combinaciones múltiples por tipo de presencia.
- Ajustado scoring para que objetivos como visibilidad, confianza, contactos, claridad y comunidad impacten sus dimensiones correspondientes.
- Corregidos obstáculos que antes pesaban poco o nada en resultado: pocos contactos y falta de tiempo.
- Añadidas prioridades específicas para respuestas débiles por perfil: prueba profesional ausente, baja consistencia de creador, canal comunitario ausente, transparencia pública dudosa y ubicación no clara.
- Priorizados los próximos pasos críticos para que no queden ocultos por el límite de tres recomendaciones.
- Verificado en local y remoto que las combinaciones no muestran `NaN`, `undefined`, más de tres próximos pasos ni overflow móvil.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `746b2749-4ff0-48d9-8f5a-8ced8d9676ad`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque E

- Ejecutado el QA final público sin añadir features, rediseño, copy nuevo, schema, auth, tenancy, CRM, persistencia ni datos ficticios.
- Verificadas por HTTP real las rutas `/`, `/diagnostico`, `/vecindario`, `/servicios`, `/que-debes-saber`, `/sobre-nosotros`, `/unete`, `/contacto` y `/privacidad` con status 200, metadata, canonical, Open Graph, footer global nuevo y ausencia de patrones prohibidos.
- Verificado `www.vecidya.com` con redirect 301 a `https://vecidya.com/`.
- Verificados `/robots.txt`, `/sitemap.xml`, sitemap sin rutas privadas, `Organization` JSON-LD y ausencia de `Review`, ratings o artículos ficticios.
- Verificada matriz responsive remota en 360 px, 390 px, tablet y desktop sin overflow horizontal y con un H1 por ruta.
- Verificados enlaces internos, `mailto:hola@vecidya.com`, login/register y empty state del Vecindario.
- Verificado Diagnóstico en las siete puertas de entrada, volver/cambiar respuesta, multiselección, opciones exclusivas, resultado, confianza, CTAs y máximo tres próximos pasos.
- D1 remoto confirma cero perfiles publicados y seis perfiles en draft, por lo que el perfil publicado remoto queda no verificable sin inventar inventario; `/vecindario/:slug` inexistente devuelve 404.
- `PUBLIC-WEB-CONTENT-001` queda cerrada con evidencia técnica vigente y deploy público `b76963a4-6b11-42f0-838a-afa49365e4fe`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque D2

- Implementada la experiencia visual del ecosistema público restante sin tocar Home, motor de Diagnóstico, schema, auth, tenancy, CRM ni persistencia.
- Ajustado hotfix visual de Home para separar el hero del bloque Vecindario y evitar que ambos se perciban pegados en escritorio.
- Vecindario gana hero de exploración, búsqueda protagonista, empty state honesto y CTA para negocios sin crear inventario artificial.
- Perfil público queda preparado para datos completos o escasos con jerarquía visual, logo/fallback, contacto existente y detalles publicados reales.
- Servicios refuerza la lectura `problema → Vecidya → resultado` y publica la corrección “No vendemos tecnología innecesaria”.
- Aprende, Nosotros, Únete y Contacto reciben estructura visual más coherente con categorías editoriales futuras, equipo/propósito, rutas de inicio y canal real de correo.
- Verificado footer global compartido en rutas públicas y ausencia de la cadena antigua “Comunidad digital para negocios locales.”.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID vigente `b76963a4-6b11-42f0-838a-afa49365e4fe`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque D1

- Iniciado el salto visual de Home y Diagnóstico sin cambiar narrativa, motor, datos, auth, schema, tenancy ni persistencia.
- Home incorpora más lenguaje visual Vecidya mediante mapas, pines, fondos por intención y jerarquía diferenciada para Diagnóstico, Servicios, Para quién y Aprende.
- Diagnóstico mejora su experiencia visual con panel de estado, progreso lineal, etapas, tarjetas de respuesta con selección explícita, estados interactivos y resultados diferenciados por dimensiones, fortalezas, oportunidades y próximos pasos.
- Se mantiene una pregunta por pantalla, respuestas efímeras en cliente y ausencia de captación o persistencia.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `835f2ea0-2917-4088-adb4-17421484870e`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque C

- Aplicada consistencia transversal sin crear documentos nuevos ni tocar schema, auth, tenancy, CRM o persistencia del diagnóstico.
- Actualizada la definición corta global de Vecidya en footer y metadata base.
- Corregido el CTA final de Home para evitar tres botones principales compitiendo en el bloque oscuro: Diagnóstico y Vecindario quedan como acciones; Contacto queda como enlace contextual.
- Añadido redirect permanente `www.vecidya.com` → `vecidya.com` en la frontera del Worker para evitar copias públicas divergentes.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `8d3bd7f7-4d05-443a-a251-5d914cb6ec63`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque B

- Aplicado copy público definitivo sin rediseño visual ni cambios de CSS.
- Home conecta Vecindario, problema, Diagnóstico, Servicios, público objetivo, Aprende, FAQ y CTA final.
- Servicios se reescribió con estructura `Problema → Vecidya → Resultado` y se corrigió “No vendemos tecnología innecesaria”.
- Únete separa autodiagnóstico y conversación directa como rutas de inicio.
- Contacto queda centrado en hablar con Vecidya por correo, con Diagnóstico como alternativa previa.
- Aprende incorpora la taxonomía editorial inicial: empezar, organizar y entender.
- Vecindario y perfiles públicos mantienen el criterio de datos reales y alinean CTAs con Diagnóstico/Contacto.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `396530d8-3cb8-448b-969f-9a91f9d571a4`.

## 2026-08-26 — PUBLIC-WEB-CONTENT-001 Bloque A

- Reconciliado el estado documental de `/diagnostico`: ya está publicado en `vecidya.com` como autodiagnóstico anónimo y efímero sin persistencia.
- Cerrada la deuda abierta `DIAG-DEPLOY-001` en la documentación activa; producción final con D1 propio sigue fuera de alcance.
- Integrado Diagnóstico en la narrativa de Home como punto de partida entre problema, servicios y siguientes pasos.
- Corregidos CTAs de Servicios y Contacto para que “diagnóstico” apunte a `/diagnostico`, no a `/unete`.
- Reposicionada Únete como ruta para iniciar proceso o hablar con Vecidya después de entender el punto de partida.
- Desplegado el Worker público `vecidya-platform-staging` para `vecidya.com/*` y `www.vecidya.com/*`; Version ID `5d0c3158-d7df-44f3-ba76-d1438235ddff`.

## 2026-08-26 — DOC-RECON-001

- Reconciliada la documentación activa a 14 archivos Markdown, por debajo del máximo de 15 solicitado.
- Consolidado el contenido vigente de fases, ADRs, planes, diagnóstico, web pública, SEO/GEO, staging, privacidad, navegación, assets y saneamiento de confianza en `PROJECT_STATE.md`, `STATUS.md`, `ARCHITECTURE.md` y `ROADMAP.md`.
- Eliminadas fuentes Markdown duplicadas, históricas o reemplazadas para evitar estados paralelos.
- Actualizadas las reglas de gobierno para no crear nuevos documentos de fase, ADRs, planes o reportes Markdown sin autorización explícita.

## Estado consolidado previo

- Public Experience V2 quedó cerrada con PASS técnico/documental.
- SEO/GEO público quedó implementado con robots, sitemap, favicon y structured data base.
- La entrega pública previa quedó desplegada en `vecidya-platform-staging`, `vecidya.com` y `www.vecidya.com` sobre D1 `vecidya-staging`.
- `PUBLIC-TRUST-SANITIZATION-001` despublicó perfiles de prueba visibles y saneó copy/assets públicos donde no existían reviews o ratings reales.
- `DIAG-RUNTIME-001` implementó `/diagnostico` como autodiagnóstico anónimo y efímero; el estado vigente está reconciliado en la entrada `PUBLIC-WEB-CONTENT-001 Bloque A`.
- `/privacidad`, `/sobre-nosotros`, `/que-debes-saber` y la navegación pública están implementadas.
- `7B.2` invitaciones sigue bloqueada por configuración externa de correo y demostración de delivery real.
