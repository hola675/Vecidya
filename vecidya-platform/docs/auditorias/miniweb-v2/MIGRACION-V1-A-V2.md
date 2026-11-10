# Plan de sustitución MiniWeb V1 → V2

**Objetivo:** V2 única MiniWeb operativa; V1 retirada solo después de certificar sustitución y reversibilidad.

## Fase A — Inventario (pendiente)

- Enumerar rutas V1/V2, loaders, actions, consultas, tablas, migraciones, cron, sitemap, SEO, medios, navegación App, enlaces Vecindario y tests.
- Identificar consumidores externos y enlaces públicos permanentes.
- Clasificar cada componente: mantener compartido / migrar / redirigir / retirar.
- Registrar referencias cruzadas para no confundir snapshot V1 `business-publication` con publicación V2.

## Fase B — Paridad funcional (pendiente)

- Comparar edición de perfil, horarios, contacto, ofertas, FAQ, galería, logo/portada, SEO, estilos, permisos, vista previa, publicación, despublicación, licencias, dominios y métricas.
- La conversión existente es voluntaria y **no importa horarios V1, estilos/configuración V1 ni CRM**. Decidir y documentar cómo cubrir cada necesidad sin inventar migraciones.
- Confirmar que el perfil de Vecindario y la publicación pública conservan sus datos y enlaces.

## Fase C — Migración segura (pendiente)

- Backup verificable de D1 y referencias R2; ensayo en staging con datos sintéticos y datos autorizados.
- Migración idempotente con registro de origen, destino, consentimiento, errores y reintentos.
- Validar recuentos, medios, SEO, páginas y permisos por tenant.
- Mantener V1 disponible durante coexistencia controlada.

## Fase D — Conmutación (pendiente)

- Certificar VIS-01, SEC-QA, COM-01/OPS-01, accesibilidad y rollback.
- Conmutar navegación y URLs mediante estrategia de compatibilidad/redirección probada.
- Monitorizar 404, 500, enlaces, publicación, imágenes y regresiones.
- Revertir si incumple umbrales acordados.

## Fase E — Retirada (pendiente; NO AUTORIZADA)

- Tras ventana de estabilidad acordada: retirar UI, API, consultas y tests obsoletos.
- Evitar DROP inmediato de tablas/datos históricos; retención y borrado requieren decisión y backup.
- Eliminar V1 solo después de confirmar ausencia de referencias activas.
- Actualizar documentación canónica, changelog y guía de soporte.

**Regla:** no se borra ni despliega nada en esta fase de auditoría.
