# F07/F06 — Matriz de permisos y superficies V1/V2 (revisión 02)

Fecha: 2026-11-05. Revisión estática, sin ejecutar peticiones autenticadas.

## Evidencia de archivos
- app/routes/api-miniweb-v2.ts SHA bb1a3702b3ae27b492e99703ecd095cb029fd43b.
- app/routes/miniweb-v2-editor.tsx SHA 549525aae4e9252a0dd4bb51999c2ce59870e884.
- app/routes/api-miniweb-config.ts SHA 0ca9a01883fb80a82aad5e516b603a40e5b98903.
- app/routes/internal-organization-miniweb.tsx SHA 73d6260b47b9638f0eb9f47bc67b65c299975fc9.
- app/routes/public-miniweb-v2.tsx SHA 8ebf9293065034569303735351f7709ee04ecd45.
- app/routes/api-public-miniweb-v2-media.ts SHA 7da4863b6d6b627e5bff7fafa0e21581a930132f.

## Matriz de permisos en código
| Superficie | Identidad y organización | Permiso requerido |
|---|---|---|
| API V2 GET | requireOrganization + coincidencia con :organizationId | business-profile:read |
| API V2 POST create/import/save | requireOrganization + coincidencia + requireSession | business-profile:update |
| API V2 POST publish | requireOrganization + coincidencia + requireSession | business-profile:publish |
| Editor V2 GET | requireOrganization | business-profile:read |
| Editor V2 controles mutación | rol owner/admin (interfaz) | no sustituye controles de API |
| API V1 GET | requireOrganization + coincidencia | business-profile:read |
| API V1 POST save | requireOrganization + coincidencia | business-profile:update |
| API V1 POST publish | requireOrganization + coincidencia | business-profile:publish y licencia activa |
| Editor V1 GET | requireOrganization | business-profile:read |
| Admin interno V1 GET | requirePlatformAdminAction | miniweb:save |
| Admin interno V1 POST save/publish | requirePlatformAdminAction | miniweb:save / miniweb:publish |
| Publicación V2 GET | sin sesión | snapshot activo o 404 |
| Media pública V2 GET | sin sesión | snapshot referencia asset, activo, organización, R2; o 404 |

## Observaciones verificadas
- Las rutas administrativas internas /app/internal/.../miniweb y /app/platform/.../miniweb siguen administrando V1, no V2. No deben ser redirigidas o eliminadas sin sustituto y autorización.
- V2 verifica organización activa igual al parámetro en API. Lectura y escritura se separan por permiso.
- La interfaz V2 limita botones a owner/admin; la API usa permisos efectivos, que podrían no ser idénticos a esa comprobación de rol. Comparar política real en authorization.server.ts.
- El editor V2 consulta media de la organización para previsualización; publicación valida IDs y la ruta pública vuelve a validar disponibilidad.
- La API V2 valida tamaño del JSON a 128000 bytes; la V1 usa límites separados de configuración y contenido. No asumir equivalencia de límites.
- La publicación V2 no requiere sesión de visitante; la privacidad depende del snapshot activo y de las comprobaciones de media.

## Hallazgos nuevos
MW2-037 (P1, migración): el panel interno de MiniWeb de organización continúa operando V1 y exige permisos de plataforma. Antes de retirar V1 se necesita plan explícito de migración del panel interno, pruebas de permisos y sustitución funcional. No es vulnerabilidad demostrada.
MW2-038 (P1, autorización/UX): controles V2 habilitados solo para owner/admin, mientras API exige permisos business-profile:update/publish. Validar equivalencia real del modelo de roles y que un rol con permiso legítimo no quede bloqueado por UI. Sin reproducción.
MW2-039 (P2, paridad): límites de payload de API V1 y V2 difieren en su implementación; evaluar tamaños válidos y errores 413 para migraciones masivas, sin afirmar regresión.

## Casos por ejecutar
T-AUTH-01: anónimo contra GET/POST V1/V2 y GET público; esperado protección API y acceso solo a snapshots.
T-AUTH-02: usuario org A contra :organizationId org B, todas las operaciones.
T-AUTH-03: miembros read/update/publish y owner/admin, comparar UI/API.
T-AUTH-04: admin de plataforma contra panel interno y API de otra organización.
T-AUTH-05: usuario suspendido o sin licencia intentando publicar V1 y V2.
T-AUTH-06: medios ajenos, inactivos, ausentes y no referenciados en snapshot.
T-AUTH-07: payload V1/V2 bajo, en y sobre límites.
T-AUTH-08: cambiar organización con edición local pendiente y petición en vuelo.
T-AUTH-09: enlace interno antiguo V1 después de cutover simulado en entorno aislado.
T-AUTH-10: verificar registro de auditoría de operaciones V1/V2 y actores.

## Pendientes
P-F07-11: inventario de paneles internos y reemplazo V2.
P-F07-12: comparar modelo de roles con controles UI y API.
P-F07-13: ejecutar T-AUTH-01..10 con fixtures de organizaciones separadas.
P-F07-14: evaluar límites de payload y paridad de mensajes de error.
P-F07-15: revisar auditoría de actores, consentimiento y logs.
No se ha ejecutado ninguno de estos casos. No modificar código ni producción.
