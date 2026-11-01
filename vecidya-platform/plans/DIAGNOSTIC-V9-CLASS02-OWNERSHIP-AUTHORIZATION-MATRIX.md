# Diagnostic V9 — CLASS-02: matriz documental de autorización y propiedad

**Versión:** 0.1.1  
**Fecha:** 2026-10-31  
**Estado:** PLAN_ONLY · CLASS-02 PARCIAL / NO CERTIFICADA  
**Ámbito:** lectura estática de rama `feat/diagnostic-v9-lex-graph-p1b`. Sin pruebas, SQL, CI, despliegues ni modificaciones funcionales.

## 1. Modelo de propiedad (migración 0031)

Fuente: `db/migrations/0031_diagnostic_v9_identity_ownership.sql` (blob `3cb6102757643af4d57dacb4a314847deb924536`).

- `diagnostic_v9_identities`: `user` o `anonymous`, con restricciones diferenciadas para `user_id` y `credential_hash`; índice único parcial de usuario.
- `diagnostic_v9_run_ownership`: propiedad única por `(workspace_id,run_id)`; la FK vincula ejecución e identidad. Estar en el mismo workspace **no** equivale a ser propietario.
- `diagnostic_v9_run_organizations`: relación organizativa separada de la propiedad; motivo de enlace acotado.
- `diagnostic_v9_identity_claims`: reclamaciones de historial anónimo con estados `pending/completed/rejected/expired`.

## 2. Límite de confianza: rutas HTTP → servicios de identidad

**Rutas inspeccionadas y blobs:**
- `api-diagnostic-v9-runs.ts` — `a24fed8bb5372867abad62d1c761fa89ebcbace3`
- `api-diagnostic-v9-run-events.ts` — `46278601c16ace4f281df726dfe20acc4bb11ba6`
- `api-diagnostic-v9-run-state.ts` — `7d338656f46e386657673de0260dd484b1252c27`
- `api-diagnostic-v9-run-finalize.ts` — `8fe64cb721f4297d8bf07219477ab4e639516294`
- `api-diagnostic-v9-run-result.ts` — `e0b161cfb01eb9502b5c92821136d2ef9dcff531`
- `api-diagnostic-claim-anonymous.ts` — `f5ac0a5c9de6b9494f5d33fb65ab97a2f8d91239`
- `api-diagnostic-anonymous-identity.ts` — `a1b1be53fae34181375af12231c03a8c9516cf50`

Las rutas de ejecución obtienen `userId` de `getSession(env,request)` o `identityId` y `recoveryCredential` desde `readV9AnonymousIdentityCookie(request)`, no desde un `userId` arbitrario del JSON. Usan `DIAGNOSTIC_V9_PUBLIC_WORKSPACE_ID` del servidor para el ámbito público. Las rutas de mutación inspeccionadas exigen origen igual al origen de la URL, control de frecuencia y límites de método/entrada.

La cookie anónima (`anonymous-identity-cookie.server.ts`, blob `c4103e08313a6c039f5db3f6be80bce7fe007149`) se genera con `HttpOnly; SameSite=Lax; Path=/api/diagnostic` y `Secure` cuando la URL usa HTTPS. La cookie contiene identificador y credencial de recuperación, cuya prueba se valida contra hash del servidor.

## 3. Autorización en servicios

Fuente: `qa03b/v9-identity-repository.ts` (blob `b628750de77bf9b38830a5eb8cd7a7abe0a5bcb6`).

- `readOwnedDiagnosticRunV9` (aprox. líneas 454–500): para usuario autenticado, consulta con JOIN entre ejecución, ownership e identidad y compara `i.user_id`; para anónimo, valida credencial, no reclamación y ownership con `assignment_source='anonymous_session'`. Si no encuentra ejecución, `v9_run_not_owned`. Comprueba `last_seq` entero no negativo.
- `appendOwnedDiagnosticEventV9` (aprox. 396–440): exige propiedad antes de delegar escritura; usuario por consulta de `user_id`, anónimo por identidad, credencial y ownership explícito.
- `ingestOwnedDiagnosticEventV9` (`v9-event-ingestion.server.ts`, blob `3f2417225247422bc6838c70fb89bdd629f70b78`): lectura autorizada, comparación de cinco versiones, idempotencia de retries, estado activo, secuencia y replay del evento propuesto **antes** de persistencia.
- `readOwnedDiagnosticRunStateV9` (`v9-run-state.server.ts`, blob `8d00037e1983ec09474f426b3681d0fb920805f3`): lectura autorizada, comparación de versiones y reconstrucción desde auditoría.
- `finalizeOwnedDiagnosticRunV9` (`v9-finalization.server.ts`, blob `8367a67bd5edb15d4d6bd486726bddd23bd06b0f`): lectura autorizada y versionada; para completada lee resultado persistido; para activa reconstruye desde eventos y compara paridad de scoring antes de escribir resultado. No acepta score del navegador.
- `linkOwnedDiagnosticRunToOrganizationV9` (aprox. 203–229): exige propiedad autenticada y vuelve a verificarla en el `INSERT SELECT`.

## 4. Vinculación a organización — punto abierto resuelto documentalmente

Fuente principal: `app/routes/app-diagnostics.tsx` (blob `2ff1b6e03a8f9a7ce8f15ccd1493d1b65e455bb9`).

El `action` que recibe `workspaceId`, `runId` y `organizationId` ejecuta primero `requireSession`, después `requireMembership(env,request,organizationId)` y solo entonces llama a `linkOwnedDiagnosticRunToOrganizationV9` con `linkedByUserId=session.user.id`. El servicio vuelve a comprobar que ese usuario sea propietario del run.

`server/auth/session.server.ts` (blob `5652406409b0e57837a55914797c5e034219f4e4`) implementa `requireMembership`; si `getOrganizationMembership` no encuentra membresía activa para la organización indicada, responde 403. `server/auth/client-workspace.server.ts` (blob `9586590c7c54ba584be3cccd97da3b2445eadd88`) llena la lista de organizaciones mediante `listOrganizationsForUser(database,user.id)`.

**Conclusión estática:** el llamador sí verifica membresía a la organización además de propiedad personal del diagnóstico. No existe en este camino una exigencia adicional de rol específico (`owner/admin`) o permiso granular tipo `diagnostic:link`; la semántica observada es **cualquier miembro autorizado puede vincular su propio diagnóstico a una organización a la que pertenece**. Esto coincide con el copy visible: “una organización en la que tengas acceso”. No clasificar como defecto sin una política de producto más restrictiva.

## 5. Reclamar identidad anónima

`prepareAnonymousIdentityClaimV9` (aprox. líneas 129–163) verifica credencial de identidad anónima no reclamada y existencia de identidad del usuario destino, registrando la reclamación pendiente. `finalizeAnonymousIdentityClaimV9` (aprox. 169–200) agrupa en `db.batch`: marcar identidad reclamada, transferir ownership y completar reclamación. Requiere una actualización de identidad y una de claim; `transferredRuns` puede ser cero. La ruta HTTP deriva `targetUserId` de la sesión, intenta expirar la reclamación pendiente ante error y limpia cookie tras éxito. Sin prueba D1 no declarar certificada atomicidad/concurrencia.

### Recuperación con V9 deshabilitado — comportamiento estático confirmado

`api-diagnostic-claim-anonymous.ts` **no** llama a `isV9PublicRuntimeAvailable`. Exige sesión autenticada, origen same-origin, rate limit y cookie anónima verificable.

`app/routes/app-diagnostics.tsx` calcula `v9Enabled`, pero usa ese flag para seleccionar el enlace “Nuevo diagnóstico” y para mostrar “Continuar diagnóstico”. El componente `ClaimAnonymousHistory` se renderiza cuando el almacenamiento está `available`, independientemente de `v9Enabled`.

**Conclusión estática:** el código actual permite recuperar/vincular a la cuenta un historial V9 ya existente aunque la creación/continuación pública de V9 esté deshabilitada. Esto queda resuelto como **comportamiento implementado**, pero su condición de política intencional todavía debe quedar ratificada en producto/documentación antes de certificar CLASS-02.

## 6. Matriz de aceptación focalizada (NO EJECUTADA)

| ID | Caso | Esperado | Estado |
|---|---|---|---|
| AUTH-01 | Usuario A consulta run de B en mismo workspace | Acceso denegado (404 no propiedad) | Pendiente de prueba |
| AUTH-02 | Usuario A intenta escribir evento en run de B | Denegado sin inserción | Pendiente de prueba |
| AUTH-03 | Usuario A intenta finalizar run de B | Denegado sin resultado | Pendiente de prueba |
| AUTH-04 | Visitante sin cookie/credencial válida intenta acceder | Denegado | Pendiente de prueba |
| AUTH-05 | Credencial anónima correcta pero `identityId` ajeno | Denegado | Pendiente de prueba |
| AUTH-06 | Visitante reclamado intenta reutilizar acceso anónimo | Denegado; ruta autenticada disponible al propietario | Pendiente de prueba |
| AUTH-07 | Dos reclamaciones concurrentes de misma identidad | Máximo un éxito y propiedad coherente | Pendiente de prueba |
| AUTH-08 | Error a mitad de transferencia de claim | Sin ownership parcialmente transferido | Pendiente de prueba |
| AUTH-09 | Usuario sin propiedad intenta asociar run a organización | Denegado | Pendiente de prueba |
| AUTH-10 | Propietario intenta vincular a organización sin membresía | `requireMembership` rechaza antes del vínculo | **Resuelto estáticamente; prueba pendiente** |
| AUTH-11 | Evento duplicado exacto después de completar run | Retry idempotente sin nueva escritura | Pendiente de prueba |
| AUTH-12 | Cambio de una de las cinco versiones tras iniciar run | Respuesta de conflicto; no continuación silenciosa | Pendiente de prueba |
| AUTH-13 | Reclamar historial con V9 deshabilitado | Recuperación disponible; creación/continuación V9 siguen gateadas | **Comportamiento resuelto; política por ratificar** |

## 7. Dependencias de cierre

- Validar aplicación efectiva de migraciones 0030 y 0031 y claves foráneas en entorno autorizado.
- Ejecutar AUTH-01..13 **solo** tras aprobación de ejecución focal.
- Ratificar como política de producto que la recuperación de historial permanezca disponible cuando V9 público esté deshabilitado.
- Decidir si membresía simple es el nivel de autorización definitivo para vincular un diagnóstico a una organización; el código actual la considera suficiente.
- Mantener `CLASS-02: PARCIAL / NO CERTIFICADA` y `PLAN_ONLY`.

## Changelog

- **0.1.1 (2026-10-31):** AUTH-10 resuelto estáticamente mediante `requireMembership`; AUTH-13 caracterizado como comportamiento implementado independiente del gate V9; añadidas evidencias de `app-diagnostics.tsx`, `session.server.ts` y `client-workspace.server.ts`.
- **0.1.0 (2026-10-31):** consolidación documental de migración 0031, frontera HTTP/identidad, autorización de servicios y matriz AUTH-01..13.
