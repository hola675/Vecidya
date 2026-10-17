# Landing `crm.vecidya.com`

Sitio estático independiente, sin credenciales ni sesiones. Su botón lleva a `https://vecidya.com/login?redirectTo=%2Fapp%2Fcrm` y, tras autenticación con Better Auth, a `/app/crm`.

## Deploy Cloudflare
1. Crear proyecto **Pages** con repositorio Vecidya (Git).
2. Directorio raíz / build output: `vecidya-platform/crm-portal`; framework: None; sin comando de build (según configuración de Pages).
3. Añadir dominio personalizado `crm.vecidya.com` desde Workers & Pages > proyecto > Custom domains.
4. Confirmar registro DNS, certificado TLS, HTTP 200 y enlace de login sin redirecciones inesperadas.
5. No cambiar cookies de `vecidya.com`, `APP_URL` ni Better Auth: este host es exclusivamente una landing pública.
6. No publicar antes de verificar que la página principal y la ruta privada estén desplegadas.

No se necesitan credenciales HighLevel ni la API de GHL para esta fase.
