# UX-CRYSTAL-R4 · Laboratorio visual local con diez negocios
<!-- Versión: 1.0.0 | 2026-11-20 | Estado: IMPLEMENTADO EN RAMA, SIN CERTIFICACIÓN RUNTIME -->

## Objetivo
Recorrer el producto Vecidya completo desde un servidor de desarrollo local, con diez organizaciones y escenarios sintéticos distintos. Preparar capturas Playwright y dejar un Chromium visible e interactivo para inspección humana antes de evaluar Web, Mi Vecidya y Admin.

## Aislamiento y límites
- Único origen permitido en el seed y en el script de revisión: `http://127.0.0.1:4173`.
- D1 y R2 locales, bajo `.wrangler/local-demo`; variables aisladas `wrangler.local-demo` y correo falso. No se conectan datos, correos ni cuentas comerciales reales.
- Los perfiles, ciudades, nombres, teléfonos y dominios `.test` son escenarios ficticios. Ningún cliente real queda representado.
- No hay licencias comerciales ficticias, checkout, oportunidades CRM GHL ni publicaciones simuladas. Los MiniWeb son **borradores**. Que la aplicación impida una publicación sin licencia es parte de la prueba real, no un defecto a ocultar.
- La cuenta demo es **owner de las diez organizaciones**, no `platform_admin`; una respuesta 403 en Admin es legítima. La inspección autenticada de Admin con permisos de plataforma sigue como gate aparte y no debe evitarse modificando guardas.
- El código de esta rama fue preparado mediante revisión de archivos de GitHub; no ha sido lanzado en el Windows del usuario ni constituye evidencia PASS de Playwright.

## Preparación en el PC Windows
Desde una copia de trabajo limpia del repo (con esta rama descargada), entrar en `vecidya-platform` e instalar dependencias habituales. No aplicar comandos `--remote`.

Terminal PowerShell 1:
```powershell
cd D:\Proyectos\Vecidya\vecidya-platform
pnpm install --frozen-lockfile
pnpm run dev:local-demo
```
Terminal PowerShell 2, una vez responda la web local:
```powershell
cd D:\Proyectos\Vecidya\vecidya-platform
pnpm run seed:local-demo
pnpm run status:local-demo
pnpm exec playwright install chromium
node scripts/ux-r4-local-visual-review.mjs --area=all
```
Para una visita más focal: `--area=public`, `--area=app` o `--area=internal`. Sin `--no-hold`, Chromium permanece visible hasta pulsar Enter. Para recopilar solo capturas sin abrir el navegador visual, añadir `--no-hold`.

**Cuenta QA local solamente:** `qa-owner@vecidya.test` / `VecidyaLocalDemoOnly-2026!`. Son credenciales ficticias de laboratorio, no reutilizables en producción. La sesión se regenera al reiniciar el servidor.

## Diez escenarios de negocio
| ID | Escenario | Objetivo visual |
|---|---|---|
| qa-local-salud | Brisa Clínica Integral | Salud; texto y CTA de consultas |
| qa-local-comercio | Mercado Nativo | Comercio; portada y contacto |
| qa-local-educacion | Aula Horizonte | Educación; bloques descriptivos |
| qa-local-tecnologia | Nodo Claro Tecnología | Tecnología; identidad fría |
| qa-local-gastronomia | Fogón de Barrio | Gastronomía; identidad cálida |
| qa-local-belleza | Estudio Luma | Belleza; contraste rosa/morado |
| qa-local-automotriz | Ruta 27 Taller | Taller automotriz; información de servicios |
| qa-local-hogar | Casa Viva Reparaciones | Hogar; contenido de atención |
| qa-local-profesionales | Norte Contable | Finanzas; texto profesional |
| qa-local-creativos | Taller Marea Diseño | Marketing creativo; combinaciones de superficie |

Cada perfil tiene categoría canónica, ciudad, modalidad, descripción sectorial, email `.test`, portada PNG geométrica y logo PNG. El contenido de MiniWeb utiliza título, subtítulo, descripción, portada y contacto contextualizados. Las imágenes son **placeholders geométricos**, no fotografías sectoriales ni demostraciones de acabado de asset premium. El seed es idempotente: no sobrescribe perfiles que ya existen y no regenera borradores poblados; para un laboratorio completamente nuevo usar una persistencia local-demo nueva tras respaldar cualquier trabajo de prueba que se desee conservar.

## Recorrido visual por área
1. **Web pública**: `/`, `/servicios`, `/vecindario`, `/aprende`, `/diagnostico`; revisar menús, escenas, Vico, filtros, contenido y CTA.
2. **Mi Vecidya**: `/app`, `/app/business-profile`, `/app/miniweb-v2`; alternar organización con el selector de la aplicación, revisar diez perfiles y previews de borrador. No afirmar publicación pública si la interfaz la prohíbe.
3. **Admin**: `/app/internal/businesses`; con owner observar control de permisos/403. La vista legítima con `platform_admin` requiere un fixture/perfil de permisos explícito y pruebas de autorización separadas.

El script crea capturas en `.wrangler/local-demo/visual-review/` (no en Git); confirma respuesta HTTP, exige sesión para rutas privadas y registra errores de consola. Capturas y una ventana visual **no sustituyen** zoom 200 %, lector de pantalla, contraste real ni aceptación humana.

## Gates para cierre de R4
- Contador local `organizaciones=10`, `perfiles=10`, `assets registrados=20`, `MiniWeb=10` y `publicados=0` sobre persistencia nueva. Si hay datos locales anteriores, validar el delta y no asumir estos valores absolutos.
- Inicio de sesión, selección real de organización y 10 borradores accesibles en navegador sin acceso cruzado.
- Capturas públicas y privadas revisadas a 320/390/768/1366/1920; repetir al 200 % real de zoom.
- Registrar fallos por ruta y no compensarlos con datos inventados o permisos falsos.
- Ejecutar tests, typecheck y build sobre SHA exacto; revisión del PR. Sin deploy/merge ni D1 remota hasta evidencia.
- Revisar qué páginas o secciones necesitan contenido de mayor fidelidad, pero mantener claramente marcados los escenarios sintéticos.

## Changelog
- 1.0.0: fixture diez escenarios, seed sectorial, recorrido Playwright público y autenticado, procedimiento PowerShell y gates.
