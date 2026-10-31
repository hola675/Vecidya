# V9 — CLASS-02: frontera de sesión y rutas públicas no verificadas
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Evidencia inspeccionada
qbv2-session.ts (fuente de sesión) importa QUESTION_BANK_V2 y define DIAGNOSTIC_SESSION_V3_SCHEMA=2, TTL de 14 días, STORAGE_KEY vecidya.diagnostic.v3.session.2. El tipo DiagnosticSessionV3 guarda answers, answeredQuestionIds, queue, routeTrace, status y metadatos de sesión, pero no una versión de pregunta por respuesta ni identificador de banco. bankOf(options) utiliza options?.bank ?? QUESTION_BANK_V2.

## Riesgo confirmado de contrato
La inyección de otro banco es técnicamente posible, pero el objeto de sesión no conserva la identidad del banco que produjo las respuestas. Por ello, una restauración con un banco distinto requiere política explícita de compatibilidad, invalidación o migración. No se afirma que exista actualmente un incidente real de restauración.

## Estado de localización de ruta
Se intentó consultar app/routes/diagnostico.tsx, pero esa ruta devolvió 404. La búsqueda de código por 'diagnostico' no devolvió resultados útiles. Por tanto, no se ha identificado ni certificado la ruta pública consumidora en esta iteración. No inventar un path de ruta ni afirmar activación V9.

## Decisiones pendientes
1. Localizar la ruta pública mediante inventario real de árbol de archivos y comprobar importadores de sesiones.
2. Elegir versionado de banco/sesión para V9 antes de activación.
3. Preservar respuestas antiguas solo con paridad demostrada de questionId, version y option.value.
4. Distinguir semántica de versión de sesión, banco y versión pública.

## Changelog
0.1.0: límites del contrato de sesión y búsqueda de ruta no concluyente.