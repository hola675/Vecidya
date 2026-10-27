# V9: identidad, propiedad personal e historial

## Objetivo

Cada ejecución V9 pertenece primero a una identidad personal. Una identidad puede ser una cuenta Vecidya autenticada o un visitante anónimo. Las organizaciones son asociaciones posteriores y no reemplazan la propiedad personal.

## Estado y seguridad de activación

El runtime público V9 permanece desactivado por defecto mediante `DIAGNOSTIC_V9_PUBLIC_ENABLED=false`. No habilitarlo hasta que el motor candidato, el contrato de consentimiento, la persistencia de eventos y las pruebas de regresión hayan sido certificados.

El identificador de almacenamiento `workspace_id='public'` es un espacio técnico reservado para diagnósticos públicos, no una organización del cliente. El navegador no puede elegir ese valor ni las versiones del motor.

Variables requeridas cuando se apruebe la activación:

- `DIAGNOSTIC_V9_PUBLIC_ENABLED=true`
- `DIAGNOSTIC_V9_BANK_VERSION`
- `DIAGNOSTIC_V9_ENGINE_VERSION`
- `DIAGNOSTIC_V9_SCORING_VERSION`
- `DIAGNOSTIC_V9_RECOMMENDATION_VERSION`
- `DIAGNOSTIC_V9_CONSENT_VERSION`

No rellenar las versiones con etiquetas provisionales: deben corresponder a artefactos certificados.

## Identidad anónima

La página pública solicita `POST /api/diagnostic/anonymous-identity` cuando no hay sesión autenticada y el runtime V9 está habilitado con todas las versiones configuradas. Un único helper de servidor comprueba la bandera y las cinco versiones antes de permitir el bootstrap, crear ejecuciones o guardar eventos. El endpoint requiere origen de mismo sitio, JSON, limitación de solicitudes y tablas V9 disponibles. Crea o reutiliza una identidad anónima y entrega la prueba de posesión mediante una cookie:

- `HttpOnly`, `SameSite=Lax`, `Secure` en HTTPS.
- Limitada a `/api/diagnostic`, con duración máxima de 30 días.
- La credencial original no se devuelve al JavaScript; D1 conserva únicamente SHA-256.

El secreto de la cookie autoriza acciones de esa identidad. Nunca registrarlo en logs, eventos o telemetría.

## Creación y eventos

- `POST /api/diagnostic/v9/runs` crea una ejecución y su propiedad en una única operación D1 por lotes. El endpoint permanece desactivado si falta la bandera o alguna versión certificada.
- `POST /api/diagnostic/v9/runs/:runId/events` valida el contrato del evento, el orden de secuencia y la propiedad antes de escribir. Las solicitudes se limitan por tamaño; las fechas de evento no pueden estar más de 5 minutos en el futuro ni ser anteriores a 30 días, para permitir reintentos tras desconexiones.
- Las escrituras de eventos no aceptan `workspaceId`, `userId` ni `identityId` desde el cuerpo de la petición.

## Reclamación de historial

`POST /api/diagnostic/claim-anonymous` exige sesión autenticada y la cookie de identidad anónima. La reclamación se registra como pendiente y se finaliza con un lote D1 que marca la identidad y transfiere todas sus ejecuciones a la identidad de usuario. La cookie se elimina al completar la reclamación. Una reclamación repetida no debe volver a transferir la propiedad.

Las migraciones `0031`–`0035` establecen propiedad, unicidad de reclamaciones pendientes, guardas contra la carrera entre asignación y reclamación, la inmutabilidad del estado de reclamación y las reglas de finalización de resultados.

## Historial y organizaciones

- `/app/diagnosticos` consulta solo ejecuciones de la identidad autenticada.
- `/app/diagnosticos/:workspaceId/:runId` vuelve a verificar la propiedad antes de mostrar resultados.
- La vinculación a una organización exige sesión, membresía válida y propiedad personal. No concede por sí sola acceso a todos los miembros de la organización.
- Las credenciales anónimas no se exponen a los componentes de la página.

## Pendientes antes de producción

1. Ejecutar CI focalizada y typecheck/build completos para el último conjunto de rutas y componentes.
2. Aplicar las migraciones 0031–0035 únicamente en un entorno de pruebas y validar upgrade desde el esquema actual.
3. Integrar el motor V9 certificado con los endpoints de creación y eventos. El cuestionario público existente sigue en contrato V8; no se debe cambiar a V9 solo por tener estos endpoints.
4. Añadir pruebas E2E para login posterior, reclamación, permisos, pérdida de cookie, conflictos de secuencia y vinculación organizacional.
5. Certificar versiones de banco, motor, puntuación, recomendaciones y consentimiento; mantener la bandera desactivada hasta entonces.
6. Validar política de retención y limpieza de identidades anónimas abandonadas antes de habilitar el bootstrap para todo el tráfico.

No se han aplicado migraciones ni se ha realizado despliegue de producción.
