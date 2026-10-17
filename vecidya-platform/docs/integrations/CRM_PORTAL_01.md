# CRM-PORTAL-01 — Portal de acceso Vecidya → HighLevel (Starter $97)

Estado: DISEÑO PREPARADO / NO DESPLEGADO — 2026-10-17

## Objetivo
Publicar una entrada de marca en `crm.vecidya.com` y una pantalla `/app/crm` dentro de Mi Vecidya, para clientes con CRM activado en GHL. Starter no ofrece reemplazar el dominio ni el branding dentro de toda la app HighLevel.

## Contrato y fronteras
- Vecidya: usuarios, sesión, organizaciones, licencias, servicios, presentación, control de acceso al enlace.
- GHL: credenciales GHL, login, contactos, oportunidades, calendarios, pipelines, conversaciones, workflows.
- No SSO, no sincronización de contraseñas, no proxy del login, no iframe ni scraping del panel de GHL.
- Un botón redirige al login oficial de HighLevel en nueva pestaña. La sesión de Vecidya no autentica en GHL.
- Nunca se muestra un enlace basado solo en la existencia de `service.code === "crm"` sin una asignación validada de cuenta externa.
- No prometer que `crm.vecidya.com` permanecerá visible después de entrar a GHL.

## Topología recomendada por fases
**Fase A (sin tocar autenticación multi-host):**
1. Crear landing pública ligera independiente en Cloudflare Pages o Worker, con hostname `crm.vecidya.com`.
2. CTA «Entrar con mi cuenta Vecidya» conduce a `https://vecidya.com/login`, y después de login a `/app/crm` mediante una redirección de retorno validada internamente.
3. Página autenticada `/app/crm` en el deployment actual de Vecidya. Usa la sesión existente y muestra estado de activación + CTA seguro a `https://app.gohighlevel.com/`.
4. El destino inicial fijo de GHL evita enlaces modificables o redirecciones abiertas. Si se incorpora enlace directo a una location, exigir allowlist explícita de hosts y path documentado/validado.

**Fase B (opcional, no necesaria para V1):** servir directamente la aplicación autenticada desde `crm.vecidya.com`. Requiere auditar cookies, Better Auth, `APP_URL`, `trustedOrigins`, CSRF, callbacks y multi-host. No asumir que las cookies de `vecidya.com` están disponibles en un subdominio.

## Gating de acceso
Estado de activación calculado del lado del servidor y por organización activa:
- Usuario autenticado + membresía vigente.
- Licencia Barrio o Ciudad activa y con derechos efectivos (cuando el sistema de entitlements esté implementado).
- Asignación CRM real: provider `ghl`/`highlevel`, external location ID, status `active`, y evidencia de provisionamiento externo.
- En ausencia de entitlements, piloto explícito autorizado por admin; nunca inferir acceso de una etiqueta de licencia o servicio.
- No revelar IDs externos, detalles internos ni contactos de otras organizaciones.
- El usuario tipo Account en GHL solo tendrá asignada su propia subcuenta; verificar en GHL.

Estados UI:
- `not_included`: CRM no forma parte del servicio contratado.
- `pending_setup`: CRM contratado y configuración pendiente; sin botón a GHL.
- `ready`: enlace oficial para iniciar sesión en GHL, avisando que son credenciales separadas.
- `suspended`: acceso desde Vecidya deshabilitado; no afirmar que esto revoca sesión o permisos en GHL.
- `unavailable`: integración no verificable, sin enlace operativo.

## UX V1
Landing `crm.vecidya.com`: logo Vecidya, «Tu espacio comercial», mensaje «Accede a Vecidya para consultar el estado de tu CRM», botón «Entrar en Mi Vecidya», enlace a soporte.
Página `/app/crm`: organización activa, badge de estado, explicación de GHL como sistema externo, CTA «Abrir CRM en GoHighLevel» con `target="_blank"`, `rel="noopener noreferrer"`, y aviso de que HighLevel solicitará inicio de sesión independiente.
Incluir en navegación «CRM» solo si hay estado pertinente confirmado; si se muestra acceso contextual desde Servicios, mantener mensaje claro para pendientes.
No recoger correos ni claves GHL en formularios de Vecidya.

## Tareas de implementación (PRs separados)
**PR1 – Portal interno sin integración externa:**
- Añadir `app/routes/crm-app.tsx`, `/app/crm` en `app/routes.ts`.
- Loader: `getActiveOrganization`, `getClientWorkspaceContext`, consulta server-side de servicios + integraciones por organizationId.
- Crear helper tipado `resolveCrmPortalState` y tests por estados (incluyendo organizaciones cruzadas).
- Añadir entrada de navegación segura; accesibilidad, ES, responsive, aviso de proveedor externo.
- No alterar D1 ni licencias en este PR; feature flag o piloto explícito.

**PR2 – Portal público en subdominio:**
- Cloudflare Pages/Worker estático con assets de marca existentes, sin crear otra cuenta ni base de datos.
- Agregar custom domain `crm.vecidya.com` desde Workers & Pages; Cloudflare gestiona DNS según configuración y TLS.
- El CTA lleva a login normal de Vecidya. No desplegar en producción sin smoke en staging.
- Si el dominio está ocupado, no pisar registros existentes.

**PR3 – Provisionamiento CRM real (solo después de activar GHL):**
- Registrar asociación única organización Vecidya ↔ GHL location ID con acceso de admin y auditoría.
- Verificación de cuenta externa y usuario Account asignado; pruebas de segregación.
- Control real de entitlements y estados de desactivación; revocar permisos también en GHL según procedimiento.
- Evitar exponer `externalId` y metadata en APIs de cliente que no lo requieran.

## QA / aceptación
1. Sin login: `/app/crm` lleva al flujo de autenticación autorizado.
2. Sin organización: no hay enlace CRM.
3. Cuadra: no disponible.
4. Barrio/Ciudad sin GHL aprovisionado: pendiente, no se promete acceso.
5. CRM listo: botón abre host oficial, sin iframe ni claves de Vecidya.
6. Cambiar organización: nunca filtra el estado CRM anterior.
7. Usuario eliminado/suspendido: no puede consultar página privada.
8. Estados no verificados/integración caída: fail closed.
9. `crm.vecidya.com` carga con HTTPS, logo, móvil, sin bucles.
10. Verificación manual de roles Account en GHL y aislamiento entre clientes.
11. No alterar MiniWeb, Diagnóstico, Vecindario ni flujos existentes.

## Bloqueos para activar en producción
- Cuenta GHL Starter operativa y primera location real; credenciales para que el cliente entre en GHL.
- Confirmar `crm.vecidya.com` libre y control del DNS/zona Cloudflare.
- Definir soporte y mensaje comercial; no describirlo como SSO ni marca blanca completa.
- Validar derechos reales antes de habilitar clientes (hoy son parciales según auditoría previa).

## Fuentes
- https://help.gohighlevel.com/support/solutions/articles/48000982600
- https://help.gohighlevel.com/support/solutions/articles/155000002543-manage-agency-user-roles-and-permissions-in-highlevel
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-subdomain/
- Código: `vecidya-platform/app/routes.ts`, `app/components/client-area-shell.tsx`, `app/routes/services-app.tsx`, `db/queries/integration-connections.server.ts`.
