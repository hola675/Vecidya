# Auditoría de privacidad y consentimiento — PR #102

Fecha: 2026-10-24. Estado: **parcial; no certificado**. No se ha desplegado.

## Evidencia inspeccionada

- `app/root.tsx`: `Scripts` y `ScrollRestoration` de React Router; JSON-LD de tipo `application/ld+json` (datos estructurados, no etiqueta de analítica).
- `app/components/public-layout.tsx`: banner de preferencias en el pie público; enlaces externos a WhatsApp activados mediante clic. No se observó un pixel o etiqueta de marketing en este archivo.
- `app/components/cookie-consent.tsx`: almacena preferencias, permite aceptar/rechazar/configurar y sincroniza cambios de almacenamiento entre pestañas.
- `app/lib/cookie-preferences.ts`: preferencias v2, rechazo por defecto, parseo validado y consulta explícita por categoría.
- `app/components/diagnostic-flow/qa03b-diagnostic-flow.tsx`: sesión QA-03B en navegador y POST de replay a `/api/diagnostic/anonymous-summary`.
- `app/features/diagnostic/qa03b/qbv2-candidate-session.ts`: clave de sesión y TTL de 14 días desde última actualización.
- `app/routes/api-diagnostic-anonymous-summary.ts`: replay de respuestas; escritura de analítica de finalización condicionada a `import.meta.env.DEV`.
- `app/routes/api-diagnostic-funnel-analytics.ts`: endpoint de métricas limitado a desarrollo y host loopback.

## Riesgos y limitaciones

1. **No está certificado el inventario completo** de scripts, dependencias, cookies HTTP, encabezados Set-Cookie, almacenamiento local/sesión, integraciones de terceros ni solicitudes de red. No afirmar ausencia global de rastreadores.
2. La autorización v2 constituye un contrato para integraciones opcionales, **no un bloqueador automático de cualquier script**. Cada integración futura debe consultar `canUseOptionalCookies` **antes** de cargar recursos o enviar eventos. Debe implementar revocación, limpieza de datos opcionales y sincronización.
3. El almacenamiento necesario (autenticación, seguridad y progreso) no es lo mismo que analítica opcional. No eliminar cookies de autenticación al rechazar marketing.
4. El flujo identificado del diagnóstico, correo, retención/purga y proveedores debe auditarse de forma independiente antes de publicar promesas sobre plazos o supresión.
5. Las pruebas añadidas están pendientes de ejecución; tampoco se han ejecutado `pnpm typecheck`, `pnpm build` ni Playwright en esta intervención.

## Matriz de aceptación para el cierre

- [ ] Inventariar `document.cookie`, `Set-Cookie`, `localStorage`, `sessionStorage`, `indexedDB`, scripts y endpoints de todos los bundles y rutas.
- [ ] Playwright: primera visita limpia, rechazo, aceptación granular, recarga, revocación, varias pestañas, navegación móvil y bloqueo de almacenamiento.
- [ ] Interceptar peticiones: sin recursos/eventos de analítica o marketing antes de consentimiento; revocación impide nuevos envíos.
- [ ] Validar sesiones necesarias, diagnóstico anónimo e identificado, retención real, purga y divulgación legal.
- [ ] Ejecutar tests unitarios, typecheck, build, E2E y revisión de accesibilidad.
- [ ] Confirmar razón social, NIT, responsable de datos, contacto y proveedores con el equipo antes de aprobar textos legales definitivos.
- [ ] Adjuntar evidencias fechadas al PR y solicitar revisión; sin merge/deploy automático.
