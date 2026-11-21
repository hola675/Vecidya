# UX-CRYSTAL-R4 · Laboratorio visual local con diez negocios
<!-- Versión: 1.2.0 | 2026-11-21 | Estado: SEED LOCAL VERIFICADO POR USUARIO; ACCESO PRIVADO EN REPRUEBA -->

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
Para una visita más focal: `--area=public`, `--area=app` o `--area=internal`. Sin `--no-hold`, Chromium permanece visible hasta pulsar Enter. Para recopilar capturas **en los cinco anchos 320/390/768/1366/1920** sin abrir ventana interactiva, añadir `--no-hold`:
```powershell
node scripts/ux-r4-local-visual-review.mjs --area=all --no-hold
```
En modo interactivo se captura 1366 px y se deja la aplicación abierta para la revisión manual.

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

El script crea capturas en `.wrangler/local-demo/visual-review/` (no en Git); confirma respuesta HTTP, exige sesión para rutas privadas, detecta redirecciones inesperadas y desbordamiento horizontal, registra errores de JavaScript y produce capturas por ancho cuando se usa `--no-hold`. Un 403 es esperable únicamente en la vista Admin para owner; no certifica acceso `platform_admin`. Capturas y una ventana visual **no sustituyen** zoom 200 %, lector de pantalla, contraste real ni aceptación humana.

## Gates para cierre de R4
- Contador local `organizaciones=10`, `perfiles=10`, `assets registrados=20`, `MiniWeb=10` y `publicados=0` sobre persistencia nueva. Si hay datos locales anteriores, validar el delta y no asumir estos valores absolutos.
- Inicio de sesión, selección real de organización y 10 borradores accesibles en navegador sin acceso cruzado.
- Capturas públicas y privadas revisadas a 320/390/768/1366/1920; repetir al 200 % real de zoom.
- Registrar fallos por ruta y no compensarlos con datos inventados o permisos falsos.
- Ejecutar tests, typecheck y build sobre SHA exacto; revisión del PR. Sin deploy/merge ni D1 remota hasta evidencia.
- Revisar qué páginas o secciones necesitan contenido de mayor fidelidad, pero mantener claramente marcados los escenarios sintéticos.

## Evidencia remitida por el laboratorio (2026-11-21)
- El usuario ejecutó `seed:local-demo` y `status:local-demo`: D1/R2 local registró 10 organizaciones, 10 perfiles, 20 assets, 10 borradores y 0 publicados.
- Revisadas 45 capturas en cinco anchos: públicas 25/25 HTTP 200 y sin overflow reportado; `/app` 5/5 HTTP 200 pero selector sin organización; perfil y editor 10/10 HTTP 403; Admin 5/5 HTTP 403 conforme a owner. Las capturas de las tres rutas 403 son idénticas en cada anchura.
- Diagnóstico del código: el seed activa una organización en su sesión HTTP, pero el navegador Playwright abre otra sesión con `activeOrganizationId` vacío; `requireOrganization` devuelve 403 en rutas privadas.
- Fix R4.2: el auditor obtiene las membresías con `GET /api/auth/organization/list`, selecciona la organización ficticia `qa-local-salud` mediante el endpoint oficial `POST /api/auth/organization/set-active` y comprueba `activeOrganizationId` en sesión antes de capturar. No evita autorización y no activa licencias. **La repetición tras este fix aún no ha sido comprobada en Windows.**
- El aviso de cookies tapa parte del diseño en las capturas públicas; para aceptación visual se requiere un pase con el consentimiento cerrado por la interfaz real (sin inyectar aceptación falsa).

## Revisión visual de las 15 capturas privadas recibidas (2026-11-21)

**Evidencia:** ZIP suministrado por el usuario, 15 PNG; 3 rutas × 320/390/768/1366/1920 px; screenshots de páginas completas. El log anterior confirmó HTTP 200 y `overflow=false` en los 15 casos, selección activa de `qa-local-salud` con diez membresías. **No confundir evidencia de screenshots con pruebas de foco/teclado/zoom/lector o edición funcional.**

### Hallazgos verificables
| ID | Prioridad | Ruta | Hallazgo / evidencia visual | Siguiente acción |
|---|---|---|---|---|
| R4-V01 | P1 | `/app` | En 320/390 el bloque **TU SIGUIENTE PASO** tiene texto explicativo y título casi blancos sobre superficie blanca; contraste manifiestamente insuficiente frente al resto del dashboard. El CTA principal sí conserva relieve y lectura. | Inspeccionar reglas efectivas `.app-primary-action` (incluidos `workspace-premium.css`, capas heredadas y orden CSS); corregir color de título y ayuda con tokens reales. Medir contraste compuesto, no asumir WCAG PASS. |
| R4-V02 | P1/P2 | `/app/miniweb-v2` | Captura 1366/1920: controles y seis bloques editables forman una columna muy larga y la **vista previa aparece únicamente al final**. Captura 390: ~7462 px de alto; para conocer el resultado del primer cambio hay que desplazarse a gran distancia. | Evaluar layout escritorio de dos columnas o preview contextual/sticky solo si no sacrifica controles; en móvil usar pestañas `Editar/Vista previa` o acceso rápido sin perder scroll/borrador. No cambiar motor de render ni guardar automáticamente. |
| R4-V03 | P2 | `/app/miniweb-v2` | Acciones **Subir, Bajar, Quitar sección** se repiten en cada módulo, junto con controles de contenido. Hay densidad operativa y navegación de secciones poco compacta en móvil. | Mejorar jerarquía/agrupación semántica y estados foco. No retirar acciones ni perjudicar reordenación por teclado. |
| R4-V04 | P2 | `/app/business-profile` | En 390 px, título e indicador de completitud están claros; el paso `Identidad` muestra selección de sector, buscador alternativo y varias acciones en una superficie vertical extensa. | Compactar jerarquía de selector de actividad y explicación; conservar `Otra actividad`, búsqueda, categorías y pasos. Verificar textos editorialmente. |
| R4-V05 | P2 | `/app/business-profile` y `/app` | El perfil comunica **100% completo** y **Borrador** a la vez; son estados diferentes (campos completos frente a publicación) y ambos se muestran correctamente, pero pueden confundirse sin explicación contextual. | Reforzar microcopy: 'Datos mínimos completos · Todavía no publicado'; conservar condición de licencia y proceso de publicación. |
| R4-V06 | P2 | Las tres rutas | En escritorio los shells usan área izquierda oscura y lectura blanca; a 390 el header se comprime correctamente, sin desbordamientos reportados. El acabado se percibe más como panel funcional claro que como escena Crystal Depth, coherente con el requisito `solid` de zonas operativas. | Aplicar Crystal Quiet solo a apoyos y reservar Focal para una entrada breve; no imponer fondo oscuro o cristal detrás de formularios. |

**Cierre del acceso:** error HTTP 403 anterior eliminado para estas tres rutas mediante selección de organización en la sesión Playwright. No se ha auditado `platform_admin` ni la independencia entre usuarios, no hay publicaciones reales ni licencias ficticias.

**Próximo checkpoint recomendado:** corregir primero R4-V01 (contraste de contenido del dashboard) y certificar visualmente. Después trabajar R4-V02–V03 como decisión UX del editor con medición y comparación de capturas; no implementar un cambio estructural solo por la estética de la maqueta.

## Changelog
- 1.2.0: selección explícita de organización activa para la sesión de Playwright, sustentada por evidencia de 403 local; pendientes nuevas capturas.
- 1.1.0: capturas automatizadas de cinco anchos, validación de redirects/overflow y errores de página; se conserva exploración interactiva en 1366 px. Sin ejecución de navegador local verificada.
- 1.0.0: fixture diez escenarios, seed sectorial, recorrido Playwright público y autenticado, procedimiento PowerShell y gates.
