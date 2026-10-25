# Auditoría de arquitectura y rediseño — Mi MiniWeb

Fecha: 2026-10-24. Estado: análisis estático, propuesta pendiente de implementación y pruebas.

## Fuentes revisadas
- app/routes/miniweb-editor.tsx
- app/routes/business-profile.tsx
- app/routes/public-business-profile.tsx
- app/components/public-layout.tsx
- app/components/miniweb/miniweb-renderer.tsx
- app/components/miniweb/templates/default.tsx
- app/components/miniweb/modules/hero.tsx
- app/features/miniweb/{registry,public-model,render,content}.ts

## Arquitectura real
Mi negocio guarda los datos maestros: nombre, slug, categoría, descripción, contacto, redes, ubicación, modalidad y horarios (horarios se guardan con acción independiente). Mi MiniWeb consume estos datos, añade configuración de módulos, ofertas de servicios/productos, preguntas frecuentes y medios. El perfil público se sirve en /vecindario/:slug y usa snapshot de publicación cuando existe. La publicación es explícita; no confundir guardar borrador con publicar.

## Hallazgos
1. El perfil público está envuelto en PublicLayout: header y footer generales de Vecidya; el negocio no domina toda la página.
2. El editor acumula diseño, estructura, contenidos, medios, preview y publicación en una pantalla extensa.
3. La plantilla Esencial es la única disponible; cuatro familias más están planificadas, no operativas.
4. El contrato de MiniWebConfiguration limita layoutVariant a standard, settings a null y no tiene tokens de color, fuentes, variantes de header/footer ni branding.
5. Nueve módulos disponibles: hero, about, contact, hours, services, gallery, location, products y faq. Cuatro planificados: articles, team, certifications, testimonials.
6. Los módulos se filtran por contenido útil antes de mostrarse al público; activar sin contenido no garantiza visibilidad.
7. Servicios/productos comparten BusinessOffering (máximo 12 ofertas totales); FAQ máximo 12. No prometer catálogos ilimitados.

## Arquitectura objetivo
- Mi negocio = fuente única de identidad, datos básicos, contacto, ubicación, horarios, redes y datos administrativos.
- Mi MiniWeb = presentación y contenido editorial adicional: tema, marca visual, portada, orden de módulos, servicios/productos, galerías, FAQ, futuras historias y equipo.
- La publicación pública debe tener header y footer del cliente, con «Creado con Vecidya» discreto y enlaces Volver al Vecindario / Vecidya.
- Preservar URL /vecindario/:slug y snapshot de publicación; no cambiar slug ni URLs existentes sin migración.
- Evitar que edición de perfil publique automáticamente cambios; conservar borrador y revisión concurrente.

## Pestañas propuestas
1. Inicio: estado, completitud y próximo paso.
2. Diseño: colores, tipografía, header, hero, footer y estilo visual.
3. Secciones: activar, ordenar y previsualizar módulos con advertencias de contenido faltante.
4. Contenido: servicios/productos, FAQ, galería y otros contenidos MiniWeb; enlaces a Mi negocio para campos maestros.
5. Publicar: preview desktop/móvil, diferencias, URL y publicación explícita.

## Extensiones priorizadas
P0: layout público independiente y marca del cliente; UX de editor por pestañas sin perder borradores.
P1: tokens de color validados y contrastes, tipografías controladas, variantes de header/hero/footer; CTA contextual; imagen de portada.
P2: bloques de testimonios y equipo con esquema, consentimiento y moderación; certificados verificables; artículos.
P3: familias de plantillas reales y estilos por sector, dominio propio si se aprueba el alcance.

## Guardrails
- No duplicar datos maestros ni integrar GHL por accidente.
- Revisar autorización, accesibilidad, SEO/JSON-LD, enlaces, SSR/hidratación, responsive, reducción de movimiento.
- Versionar configuración y ofrecer migración retrocompatible antes de introducir propiedades.
- Validar que ocultar módulos no exponga datos en HTML/JSON-LD.
- Tests: validación de configuración, snapshots, preview vs publicación, control de versiones 409, medios, permisos y E2E móvil.
- No fusionar ni desplegar sin tests y revisión.
