# Vecidya Platform 0.7.2 — preparación de versión

Fecha: 2026-10-24. Estado: **candidata, no desplegada**.

## Alcance de la versión

La aplicación `vecidya-platform` agrupa la web pública, la aplicación de clientes/MiniWeb y el entorno interno. Se avanza la versión de paquete de `0.7.1` a `0.7.2` como actualización de mantenimiento y calidad, **sin atribuir versiones de despliegue independientes** a esas tres superficies.

### Cambios comprobados desde la versión declarada 0.7.1

- Navegación de Aprende: se corrigió el destino `#contenido` en el cuerpo de los artículos (PR #91).
- Endpoint de salud de base de datos: el campo `environment` usa `APP_ENV` en lugar de devolver siempre `LOCAL` (PR #91).
- Suite de Diagnóstico: se actualizó la aserción de accesibilidad para comprobar el encabezado externo asociado mediante `aria-labelledby` y la ayuda mediante `aria-describedby` (PR #93).
- Aprende: las pruebas de integridad reflejan 44 artículos y 8 itinerarios; se separó el número de artículos del estado editorial (PR #93 y #94).
- Certificación de integración: GitHub Actions valida typecheck, build, pruebas focales de Diagnóstico/Aprende y suite unitaria completa en PR y push a `main` (PR #95).

### Evidencia

- CI de PR #95: GitHub Actions run `40104325193`, conclusión `success` antes de fusionar.
- Merge de PR #95: `e670c64993559bc0cf4f761dc08498a68c21449b`.
- No se ha certificado todavía un despliegue público de esta versión, ni E2E completos de las tres superficies, ni correo real de Diagnóstico.

## Criterios para publicar

1. Obtener CI verde en el commit final de la candidata de versión.
2. Validar las rutas representativas de web, aplicación de clientes/MiniWeb y administración con pruebas E2E y responsive.
3. Para habilitar el informe identificado de Diagnóstico: resolver las aprobaciones de privacidad/retención, pruebas de correo real autorizadas y aceptación de informe HTML. No activar calibración V4 por este incremento.
4. Desplegar solo con autorización y comprobar HTTP anónimo, autenticación, aislamiento de organizaciones y rollback.
5. Registrar fecha, SHA, entorno y evidencia de publicación antes de declarar `0.7.2` en producción.

## Nota de alcance

Este incremento documenta cambios verificables de mantenimiento. No implica que las tres superficies hayan recibido un rediseño funcional completo, ni que una rama local o un informe de diseño esté desplegado.
