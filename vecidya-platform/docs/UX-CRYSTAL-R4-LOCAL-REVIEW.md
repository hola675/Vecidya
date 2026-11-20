# UX-CRYSTAL-R4 — Laboratorio visual local de diez organizaciones
<!-- v1.0.0 · 2026-11-20 · preparación de revisión, NO certificado -->

## Alcance
Sobre la infraestructura existente `dev:local-demo`, se amplía el fixture a diez organizaciones sintéticas sectoriales, cada una con perfil, portada, logo y borrador MiniWeb V2. Son casos de demostración inventados, no negocios reales. Los textos, categorías canónicas, paletas, ciudades y modalidades varían para identificar defectos de maquetación.

Se añaden tres identidades con roles locales reales:
- Propietario de las diez: `qa-owner@vecidya.test` / `VecidyaLocalDemoOnly-2026!`.
- Administradora de las organizaciones de índice par (1,3,5,7,9): `qa-editor@vecidya.test` / `VecidyaLocalEditor-2026!`.
- Miembro de las organizaciones de índice impar (2,4,6,8,10): `qa-member@vecidya.test` / `VecidyaLocalMember-2026!`.

El rol `admin` es de **organización**; NO concede `platform_admin` ni acceso a administración interna. En la ruta interna un 403/401 puede ser el resultado correcto y debe revisarse, no suprimirse para obtener una captura.

### Escenarios (orden del fixture)
| # | Sector / negocio ficticio | Escenario |
|---|---|---|
| 1 | Clínica Horizonte — Salud | Atención preventiva |
| 2 | Mercado La Esquina — Comercio | Catálogo |
| 3 | Aula Norte Formación — Educación | Formación |
| 4 | NexoTec Soporte — Tecnología | Soporte |
| 5 | Casa Oliva Cocina — Gastronomía | Menú |
| 6 | Taller Ruta Clara — Mantenimiento | Automotriz |
| 7 | Estudio Lirio — Servicios personales | Belleza |
| 8 | Ábaco Consultores — Profesionales | Asesoría |
| 9 | Hogar Vivo Servicios — Mantenimiento | Hogar |
| 10 | Trama Estudio Creativo — Cultura | Portafolio |

## Preparación en Windows / VS Code
Trabajar en checkout local de la rama `feat/ux-crystal-r4-local-review-10org`, no directamente sobre producción. Desde `D:\Proyectos\Vecidya\vecidya-platform` si esa es la ruta real del checkout (adaptar la ruta si es distinta):

```powershell
git fetch origin
git switch feat/ux-crystal-r4-local-review-10org
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm run dev:local-demo
```

Mantener la primera terminal abierta y, desde una segunda en `vecidya-platform`:

```powershell
pnpm run seed:local-demo
pnpm run status:local-demo
pnpm run review:local-demo
```

Para inspección de roles por separado:

```powershell
pnpm run review:local-demo -- --role=admin
pnpm run review:local-demo -- --role=member
```

El navegador Playwright **se abre en modo visible** cuando existe escritorio gráfico. El runner recorre rutas públicas y privadas, crea capturas en `test-results/ux-crystal-r4-manual/<rol>/`, deja la pestaña en `/app` y espera Enter para cerrar. Las capturas solo son evidencia de inspección; no certifican automáticamente accesibilidad ni funcionalidad.

## Sesión interactiva de aceptación con el responsable
Abrir `http://127.0.0.1:4173` en un navegador local. Revisar por lotes, con la persona responsable decidiendo correcciones:
1. **Web pública:** Inicio, Servicios, Vecindario, Aprende, Licencias, Contacto. Preguntar por composición, transparencias, narración y legibilidad.
2. **Mi Vecidya:** selector entre diez organizaciones, perfil, MiniWeb V2, contenido sectorial, portada, logo, borrador y comportamiento de edición. Preguntar por jerarquía de información, estados y edición.
3. **Admin:** usar únicamente identidades habilitadas para entrar en rutas internas; comprobar que el 403 con owner/admin/member no filtra información. Para ver Admin autorizado, usar el E2E de platform-admin con fixtures y permisos propios, **no insertar un privilegio ficticio**.
4. **Responsive:** 320/390/768/1366/1920 px; zoom 200 %, teclado, lector de pantalla y contraste compuesto de manera separada.
5. **Rendimiento:** CPU y red restringidas; registrar métricas reales, no inventarlas.

## Limitaciones importantes
- D1/R2 solo locales en `.wrangler/local-demo`. No acceder a D1 remota, cuentas reales, emails ni secretos de la raíz.
- La clave de sesión es efímera por inicio del Worker; las pestañas autenticadas requieren nuevo login después de reiniciar.
- Los diez MiniWeb quedan **en borrador privado**. No se crean licencias ni se publica contenido artificial para eludir las guardas del producto. El directorio público no mostrará necesariamente esos diez negocios; no declarar paridad de vistas públicas.
- El seed es idempotente para organizaciones/perfiles/assets; refresca contenido de MiniWeb únicamente cuando detecta diferencia del encabezado/imagen. Los perfiles que existieran de una ejecución anterior no se sobrescriben: esto preserva cambios locales de revisión.
- Las nuevas cuentas y su contraseña son exclusivamente locales y sintéticas; nunca usar esos accesos en servidores públicos.
- No se ha ejecutado el servidor ni Playwright del usuario desde GitHub: deben hacerse en el host Windows; registrar logs, duración, defectos y resultados después.

## Gate de cierre
`pnpm run seed:local-demo` debe completar sin errores y `pnpm run status:local-demo` reportar al menos 10 organizaciones, 10 perfiles, 20 assets y 10 MiniWeb. Registrar quién puede editar qué organización y qué rutas devuelven 401/403. Ejecutar `pnpm run typecheck`, `pnpm run build`, pruebas focales y revisión visual. Si faltan evidencias, R4 permanece abierto.

## Changelog
- v1.0.0 (2026-11-20): diez escenarios, roles de propietario/admin/miembro, runner visible y guía de revisión.
