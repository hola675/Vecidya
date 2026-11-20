# Guía de integración y uso por agentes — Crystal Depth R1

**Corte:** 2026-11-19 · **Estado:** laboratorio R1 candidato en rama de revisión, sin integración en `vecidya-platform/` ni despliegue. **Propósito:** permitir que Kilo Code, subagentes y desarrolladores interpreten solicitudes y seleccionen patrones consistentes, sin usar el laboratorio como si fuera un paquete React listo.

## 1. Punto de entrada obligatorio para agentes

Antes de intervenir una pantalla, leer en este orden:

1. `AGENTS.md` (raíz), `vecidya-platform/docs/GOVERNANCE.md`, `STATUS.md` y `PROJECT_STATE.md`; comprobar estado, rama y límites del checkpoint.
2. `vecidya-crystal-depth/docs/DIRECCION-ARTISTICA.md`: visión, jerarquía L0–L5, tres materiales, paleta y contraste.
3. `vecidya-crystal-depth/assets/pattern-registry.json`: contrato estructurado `intentRouting`, `materials`, `tokens`, `assetRules` y `acceptance`.
4. `vecidya-crystal-depth/biblioteca.html#guia`: ejemplos visibles e interactivos; no copiar directamente HTML/CSS a la aplicación.
5. `vecidya-platform/docs/design-system/VECIDYA-UI-UX.md` y componentes reales de la plataforma; la guía oficial y la implementación existente prevalecen ante divergencias.

**Regla fundamental:** `pattern-registry.json` expresa intención visual R1, no permisos, esquema, API, derechos, contratos publicados ni servicios activados. Para esas decisiones manda el código y los documentos canónicos de plataforma y negocio.

## 2. Protocolo para interpretar cualquier consulta

```text
PETICIÓN: "Mejora la sección X de Vecidya".
1) Identificar destino: marketing / Vecindario / Diagnóstico / Aprende / MiniWeb / app / Admin / licencias.
2) Identificar tarea principal: atraer / encontrar / leer / decidir / editar / operar.
3) Buscar intención exacta o la más cercana en assets/pattern-registry.json → intentRouting.
4) Elegir material: focal (narrativa), quiet (soporte), solid (trabajo/datos).
5) Componer L0–L5 solo donde aporten sentido; ninguna escena debe bloquear L4.
6) Consultar asset real y su origen, licencia, calidad, texto alternativo y tamaño.
7) Confirmar funcionalidades/entitlements efectivas y límites de CRM GHL.
8) Localizar componente real; adaptar tokens/variantes sin duplicar componentes.
9) Diseñar y probar estados: default, hover, focus, active, disabled, loading, empty, error, success.
10) Verificar accesibilidad, tamaño táctil, responsive, reduced-motion, fallback sin blur.
11) Ejecutar QA focal + typecheck/build si cambia plataforma; documentar evidencias del SHA.
12) Abrir PR; NO merge ni deploy sin autorización independiente.
```

Cuando una consulta abarque varias áreas, **dividir en checkpoints por ruta y riesgo**, no implementar simultáneamente cambios visuales, de permisos y de backend. Si la intención no figura en el registro, usar `solid` para lectura/operación por defecto, describir la nueva necesidad y solicitar evaluación de diseño; no inventar un cuarto material.

## 3. Tabla orientadora: intención → patrón → precaución

| Solicitud que puede recibir un agente | Intención `intentRouting` | Material inicial | Riesgo crítico |
|---|---|---|---|
| "Portada premium" / "efecto 3D" | `portada-marketing` | Focal + Quiet | El texto debe ser HTML y Vico un asset separado |
| "Mejorar búsqueda Vecindario" | `buscar-negocios` | Quiet + Solid | No inventar datos, categorías ni resultados |
| "Hacer más claro el diagnóstico" | `diagnosticar` | Solid | No modificar scoring, preguntas ni privacidad |
| "Rediseñar Aprende" | `contenido-editorial` | Solid + Quiet | Lectura larga y semántica editorial dominan |
| "Editor del MiniWeb" | `editar-miniweb` | Solid + Quiet | Borrador/revisión/publicación sin pérdida de datos |
| "Dashboard, equipo, licencias" | `administrar-plataforma` | Solid | No saltarse permisos ni disfrazar estados |
| "Mostrar diferencias entre planes" | `comparar-licencias` | Quiet + un único foco | Cuadra completo; no atribuir GHL no operativo |
| "Formulario conectado a CRM" | `captacion-comercial` | Solid + CTA | GHL externo, integración real por verificar |

## 4. Reglas visuales programables

- `focal` → `vx-r1-focal` (solo demostración de laboratorio): fondo compositivo, bisel de mayor relieve, reflejo contenido; no para lectura densa.
- `quiet` → `vx-r1-quiet`: superficies de apoyo y navegación.
- `solid` → `vx-r1-solid`: campos, tablas y paneles con contraste estable.
- El tema oscuro es el estado inicial de la biblioteca; claro es alternativo. Ambos requieren pruebas individuales y no se infieren mediante `filter: invert()`.
- Mantener una sola receta geométrica por familia; naranja es acción de marca, verde confirmación, ámbar atención y rojo error. Un estado combina icono/texto/contexto, jamás solo color.
- No poner controles en fondos WebP, ni mensajes dentro de escenas rasterizadas. Preservar Vico oficial y fuentes originales.
- La ambientación L0 puede ser estacionaria; L1–L5 se componen según la sección. Reducir complejidad y paralaje en móvil o `prefers-reduced-motion`.

### Selección de assets

`assets/library-catalog.js` enumera 140 fuentes catalogadas de `vecidya-platform/public/assets/` con vistas previas. No confundir vista previa con original; un link `Abrir original` puede requerir el árbol del repositorio para resolver. `assets/pattern-registry.json` orienta por intención, pero la ruta concreta del asset se valida contra archivos existentes, su variante original y la página destino. Las 11 propuestas Crystal PNG no constituyen una sustitución automática de iconos.

## 5. MiniWeb V2 y licencias: contrato de interfaz, no habilitación

`Cuadra`: web profesional completa y editable por organización, con plantilla sectorial legible. `Barrio`: hereda Cuadra; composición orientada a captar consultas y gestionar seguimiento cuando su integración GHL esté operativa. `Ciudad`: hereda Barrio; variaciones de composiciones multiproceso cuando esos procesos estén realmente disponibles. Las diferencias deben responder al valor del producto, **no** a reducir artificialmente la calidad de Cuadra.

La matriz comercial vigente en `vecidya-platform/docs/business/VECIDYA_PRODUCT_CATALOG.md` y los entitlements reales del backend mandan sobre cualquier mock visual. Cambiar de plantilla MiniWeb debe conservar contenido. No crear un CRM paralelo a GHL ni afirmar que los complementos están activos por mostrar una pantalla.

## 6. Contrato de entrega y QA para agentes

Entregar en cada checkpoint un resumen con `alcance`, `intención`, `patrón`, `assets verificados`, `archivos propios`, `pruebas ejecutadas`, `riesgos pendientes`, `commit/PR` y `estado de producción`. Si una prueba no se ejecuta, documentar `NO VERIFICADO`; jamás copiar un PASS anterior como propio.

**Gates de R2 (pendientes):** contraste WCAG en fondos compuestos, zoom 200 %, lectores de pantalla, navegación teclado, 320/390/768/1366/1920 px, foco, estados de error, reduced-motion, ausencia de blur, compatibilidad del tema claro y validación visual humana. El laboratorio puede tener muestras funcionales sin haber pasado estas certificaciones.

### Plantilla corta de instrucción para Kilo Code

```text
Antes de modificar esta pantalla de Vecidya, lee AGENTS.md, los documentos canónicos afectados,
vecidya-crystal-depth/docs/DIRECCION-ARTISTICA.md,
vecidya-crystal-depth/docs/INTEGRACION.md y
vecidya-crystal-depth/assets/pattern-registry.json.
Identifica la intención de interfaz y aplica la receta focal/quiet/solid correspondiente.
Usa assets oficiales y los componentes React ya existentes. Preserva permisos, datos,
contratos de diagnóstico, entitlements y separación Vecidya/GHL.
Prueba solo lo relevante al checkpoint y documenta el SHA; abre PR sin desplegar.
```

## 7. Orden de adopción tras aprobación

1. Aprobar visualmente el laboratorio R1 y su diseño de tokens (aún pendiente).
2. R2: certificar contrastes, responsive, interacción, assets, accesibilidad y documentación.
3. Comparar CSS guía R1 con el sistema ya implementado `visual-system.css`; incorporar nuevos tokens **opt-in**, sin duplicar ni sustituir globalmente su semántica.
4. Crear variantes React tipadas de componentes existentes; no romper el contrato de `Button`, `Card` ni su accesibilidad.
5. Migrar pantallas por lotes pequeños; certificar por ruta y documentar.
6. Solo con autorización y contratos operativos, habilitar controles por licencia en MiniWeb, respetando organización y publicación.

**Estado:** esta entrega no modifica `vecidya-platform/`, no crea migraciones, no altera permisos ni licencia y no despliega.
