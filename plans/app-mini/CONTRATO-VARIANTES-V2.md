# Contrato propuesto MiniWeb V2 — Plantillas, variantes y licencias

**Estado:** especificación de implementación, no código activo ni decisión de despliegue. **Fecha:** 2026-10-29. **Dependencias:** DEC-07, DEC-10, DEC-17, DEC-18 de `PLAN-V1.md`.

## 1. Diagnóstico verificado del código V1

En `vecidya-platform/app/features/miniweb/registry.ts`, `MiniWebConfiguration.version` es 1; `layoutVariant` y `module.layoutVariant` son strings restringidos a `standard`; cada módulo aparece una sola vez por tipo, con `settings:null`; `validateMiniWebDraft` valida solo plantillas `available` y módulos disponibles; `MAX_MINIWEB_CONFIGURATION_BYTES=4096`. Solo `vecidya-default` está disponible. Las otras cuatro claves figuran `planned`.

En `app/components/miniweb/templates/default.tsx`, los renderizadores se indexan por tipo; `key` e `id` de sección se derivan del tipo y por ello no admiten varias galerías del mismo tipo. El renderer público actualmente usa `data-miniweb-template` y versión, sin variante visual explícita.

## 2. Tipos propuestos (no implementados)

```ts
type TemplateTier = "cuadra" | "barrio" | "ciudad";
type VisualVariantTier = "base" | "pro" | "premium";
type TemplateFamily = "services" | "catalog" | "gastronomy" | "professional";
type VariantKey = "base" | "pro" | "premium";

type VisualVariantDefinition = {
  key: VariantKey;
  label: string;
  minimumTier: TemplateTier;
  composition: {
    hero: "split" | "asymmetric" | "immersive";
    offerings: "uniform-grid" | "editorial-grid" | "narrative";
    gallery: "uniform-grid" | "mosaic" | "editorial-sequence";
    density: "comfortable" | "editorial" | "immersive";
    motion: "none" | "subtle";
  };
};

type TemplateV2Definition = {
  key: string;
  family: TemplateFamily;
  availability: "available" | "planned";
  variants: readonly VisualVariantDefinition[];
};

type MiniWebModuleInstanceV2 = {
  instanceId: string; // identificador persistente y único en la publicación
  type: string;       // validado contra registro de módulos
  moduleVersion: number;
  enabled: boolean;
  sortOrder: number;
  layoutVariant: string;
  settings: unknown;  // validar por tipo, nunca HTML/CSS/JS arbitrario
};

type MiniWebConfigurationV2 = {
  version: 2;
  templateKey: string;
  templateVersion: number;
  variantKey: VariantKey;
  modules: MiniWebModuleInstanceV2[];
};
```

Los tipos anteriores son contrato conceptual, no firmas listas para importar. El validador deberá utilizar uniones discriminadas y esquemas estrictos por módulo para `settings`; no introducir `unknown` sin validación.

## 3. Reglas de autorización y contenido

1. El nivel de acceso visual se obtiene del **mayor plan activo del propietario de facturación** entre organizaciones vinculadas, no del plan CRM de la organización editada.
2. `base` exige Cuadra, `pro` Barrio, `premium` Ciudad. Cada plantilla concreta puede imponer un mínimo mayor; aplicar el máximo entre plantilla y variante.
3. **Nunca** filtrar módulos por nivel de plan. Las familias comerciales y categorías de negocio no determinan elegibilidad; una tienda, restaurante o profesional en Cuadra debe disponer de MiniWeb completa y de diseños Base apropiados.
4. Diferenciar disponibilidad técnica del módulo (p. ej. artículos futuros, video condicionado a DEC-16) de derechos comerciales. No etiquetar un módulo como Premium para ocultarlo.
5. Validar derechos **en servidor al guardar y publicar**, no solo al seleccionar en el editor. Publicación premium existente permanece pública tras downgrade; impedir republish no autorizado, conservar snapshot y contenido.
6. Cuota de publicaciones (DEC-08) y licencias CRM se evalúan por subsistemas independientes; no usar `variantKey` como sustituto de cuota o permisos CRM.
7. Configuración V1 válida debe seguir representándose sin mutación. Un lector V1/V2 resuelve `vecidya-default:standard` a apariencia legacy, sin reescritura automática del snapshot publicado.

## 4. Contrato de identidad y migración

- `instanceId` estable desde la creación hasta edición, ordenación, restauración y publicación; IDs DOM derivados de la instancia, no del tipo.
- Permitir múltiples instancias de módulos repetibles (galería, según DEC-03), y definir explícitamente cuáles no se repiten (hero obligatorio y primero).
- Orden determinista y único; rechazar IDs duplicados, configuraciones sobredimensionadas, variantes desconocidas y módulos no soportados.
- Separar **reader** de snapshots V1/V2 del **writer** V2. No migrar de forma destructiva el histórico ni editar publicaciones vigentes por efecto colateral.
- Restaurar una versión antigua crea borrador nuevo, preservando historial append-only y comprobando licencias al publicar.
- Los límites de tamaño y coste deben medirse; no reutilizar 4096 bytes ciegamente para configuraciones con instancias repetidas.

## 5. Secuencia de PRs pequeños y pruebas focales

| Paso | Entrega | Prueba focal obligatoria |
| --- | --- | --- |
| V2-A | Registro de variantes y tipos puros, sin activar UI | Mapeo `base/pro/premium`, familias, rechazo de variantes desconocidas |
| V2-B | Lector dual V1/V2 y snapshots | Fixture V1 existente produce mismo resultado; V2 conserva instancias |
| V2-C | Autorización server-side visual independiente del CRM | Cuadra no publica Premium; downgrade conserva publicado; propietario multi-org |
| V2-D | Renderer de composición con `instanceId` | Dos galerías sin colisión; mismas secciones en los tres tiers |
| V2-E | Selector y preview en editor tableta/escritorio | Sin edición móvil; preview móvil; permisos y estados vacíos |
| V2-F | QA visual focal 3×3 y accesibilidad | Sin overflow, CTA, teclado, capturas comparadas |

**Puerta de entrada:** aprobar visualmente prototipo HTML y ejecutar su test focal. **No incluir** CI global, cambios de precios, integración GHL, pagos ni despliegue en estos PRs.


## 6. Adenda de precedencia y checkpoints vigentes (2026-10-29)

Esta adenda corrige la secuencia de la §5 **sin reescribir el registro histórico**: los PR reales son V2-A (#188), V2-B (#189), V2-C (#191), V2-D (#194, lector de licencias D1). El **renderer de composición** se denomina desde ahora **V2-E**, el selector/editor **V2-F** y la certificación visual **V2-G**. Los cuatro PR están certificados individualmente y listos para revisión, **no fusionados ni integrados**.

**DEC-17 prevalece:** Mi Vecidya, /internal y el editor se operan en tableta/escritorio; MiniWeb pública es responsive móvil/tableta/escritorio. Las menciones antiguas a edición móvil no autorizan implementarla.

**DEC-18 prevalece:** todos los módulos técnicamente soportados deben poder usarse con Cuadra; Base/Pro/Premium solo diferencian composición visual. **CAT-01 sigue pendiente:** extender Base a todas las familias para Cuadra requiere resolver expresamente la distribución de claves de DEC-12. No alterar el registro de licencias por suposición.

**DEC-15 prevalece:** snapshots y medios históricos referenciados no se eliminan automáticamente en la primera versión. La política de GC futuro necesita aprobación independiente.

**Integración segura:** el lector D1 solo devuelve licencias de un billing_account; el llamador debe resolver y autorizar la identidad y la organización en servidor antes de usarlo. Nunca confiar en el ID suministrado por el navegador. La política pura de entitlements y el reader son piezas separadas hasta integración con rutas reales y pruebas cross-tenant.
