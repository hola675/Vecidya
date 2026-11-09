# F06/F07 — Contrato de roles y autorización (revisión 03)

Fecha: 2026-11-05. Revisión estática de main; NO se ejecutaron peticiones ni tests.

## Fuentes y SHA
- server/auth/authorization.server.ts 354feeda00b1912e0d529f74561335bf1f12e7fd
- server/auth/session.server.ts 5652406409b0e57837a55914797c5e034219f4e4
- server/platform-authorization.server.ts 3079a6d0e964eef21eb33963cef1e6428c6fc1fd
- app/routes/miniweb-v2-editor.tsx 549525aae4e9252a0dd4bb51999c2ce59870e884
- app/routes/api-miniweb-v2.ts bb1a3702b3ae27b492e99703ecd095cb029fd43b

## Matriz de roles confirmada en código
| Rol de organización | business-profile:read | business-profile:update | business-profile:publish | Editor V2 puede editar |
|---|---|---|---|---|
| owner | sí | sí | sí | sí |
| admin | sí | sí | sí | sí |
| member | sí | no | no | no |

La comparación estática resuelve la sospecha de desalineación de roles en MW2-038 para el mapa actual. No certifica aislamiento de peticiones ni futuras extensiones de roles.

## Límites y controles observados
- requireOrganizationPermission usa requireMembership para la organización solicitada, luego hasPermission por rol.
- requireOrganization y requireMembership niegan acceso cuando platformOrganizationLifecycle.status es suspended.
- requireSession redirige a /login sin sesión. No asumir HTTP 401: la respuesta de navegación puede ser 302.
- requirePlatformAdminAction exige miembro de plataforma activo, rol platform_admin y acción incluida; staff no tiene permisos de acciones administrativas.
- La suspensión de la organización (lifecycle) es diferente de la suspensión de licencia comercial: no confundir con MW2-027.

## Decisión documental
MW2-038: RESUELTO EN REVISIÓN ESTÁTICA, con evidencia de equivalencia de roles owner/admin/member. Conservar caso T-AUTH-03 como gate dinámico no ejecutado.

## Pendientes preservados
P-F07-12: mapa de roles completado estáticamente; falta prueba HTTP/UI real y posible divergencia por cambios futuros.
P-F07-13: ejecutar T-AUTH-01..10, con casos de suspensión de organización y licencia separados.
P-F07-16: verificar códigos de redirección de sesión, 403 por organización ajena, permisos de staff y auditoría.
P-F07-17: verificar que el usuario suspendido no puede mutar y que la publicación pública responde según política, sin inferirlo de las guardas del editor.
P-F07-18: verificar estados de membresía y cambios de rol durante sesiones abiertas.
Ningún test PASS declarado.
