# PLAN MAESTRO — Auditoría, finalización y sustitución MiniWeb V2

Versión: 1.0.0 | Fecha: 2026-11-05 | Estado: ACTIVO | Rama: docs/miniweb-v2-auditoria-perfeccionista

## Misión y alcance

Terminar MiniWeb V2, demostrar seguridad, paridad funcional, calidad visual y operativa, migrar/compatibilizar los sitios V1 y retirar V1 **solo tras certificación**. Registrar todas las incoherencias, fallos, dependencias, omisiones y decisiones. No modificar Diagnóstico V9, CRM ni otras superficies salvo dependencia probada. No ejecutar deploy, D1 remoto, borrado R2 ni DROP sin autorización.

## Modelo de revisión: 8 fases y gates

| Fase | Qué se inspecciona | Entregable | Gate |
| --- | --- | --- | --- |
| F01 Inventario | Rutas, módulos, servicios, esquema, migraciones, tests, CI, scripts, flags, documentación y consumidores V1/V2 | INVENTARIO-Y-DEPENDENCIAS.md | Todas las entradas y consumidores identificados, sin suponer ausencias |
| F02 Dominio y persistencia | D1, CAS, licencias, cupos, publicaciones, transacciones, errores, concurrencia, rollback | Hallazgos reproducidos y pruebas | Invariantes críticos comprobados |
| F03 Editor y UX | S01–S12, familias/variantes, formularios, validación, preview, guardado, permisos, navegación, responsive | Matriz UX/funcional | Flujo completo y sin pérdida silenciosa |
| F04 Media y activos | Subida, R2, autorización, referencias, borrado, imágenes, alt, límites, CDN/cache | Matriz de ciclo de vida | Cero acceso cruzado o medios rotos |
| F05 Web pública e integraciones | Render público, SEO, sitemap, metadata, Vecindario, URLs, dominios, enlaces, caché | Mapa de contratos externos | Compatibilidad y contenido público verificados |
| F06 Seguridad, pruebas y calidad | Autenticación, tenant, roles, XSS/URLs, accesibilidad, visual, rendimiento, regresión, CI | Evidencias por gate | P0=0 y P1 bloqueantes=0 |
| F07 Paridad y migración | Matriz V1↔V2, horarios, branding, FAQ, servicios, medios, consentimientos, enlaces, backups, migración | Plan de migración validado | Datos y rutas preservados, rollback ensayado |
| F08 Conmutación y retirada | Staging, aceptación, tráfico, redirecciones, monitoreo, soporte, limpieza V1 | Checklist de release y retiro | Aprobación explícita + estabilidad + cero consumidores |

## Orden de ejecución por paquetes

- **Paquete A (F01)**: recorrer árbol y buscar por símbolos, rutas y tablas; construir grafo de dependencias real. No comenzar a eliminar nada.
- **Paquete B (F02+F04)**: primero invariantes de cupos, snapshot, revisión, licencias y media, porque bloquean publicación segura.
- **Paquete C (F03+F05)**: editor completo, diseños y página pública; revisar experiencia end-to-end.
- **Paquete D (F06)**: adversarial, visual, accesibilidad, rendimiento y regresión.
- **Paquete E (F07)**: paridad, migración y coexistencia; resolver exclusiones explícitas de V1.
- **Paquete F (F08)**: sustitución controlada, observabilidad, retirada y limpieza.

Las fases pueden solaparse para investigar, pero sus gates no se pueden omitir.

## Grafo de relaciones a verificar (hipótesis inicial, NO inventario cerrado)

Usuario/sesión → organización activa → permisos → API MiniWeb V2 → validación de contrato → borrador/revisión CAS → licencia/capacidad → snapshot publicado → render público → SEO/sitemap/Vecindario.

Rama de medios: editor → API de media → autorización por organización → D1 metadatos + R2 objeto → render privado/público → borrado/retención.

Rama de migración: publicación V1 → conversión opt-in → informe de omisiones → borrador V2 → revisión humana → publicación V2 → compatibilidad URL → retirada V1.

En cada flecha: comprobar quién llama, qué datos entrega, permisos, errores, rollback, test y consumidor inverso.

## Checklist de revisión por componente

1. Propósito, owner lógico, ruta y símbolo.
2. Entradas/salidas, esquema, validadores y límites.
3. Dependencias directas e inversas; módulos compartidos.
4. Estados, transiciones, concurrencia, reintentos, idempotencia.
5. Autenticación, autorización, tenant y datos sensibles.
6. Errores, mensajes UX, observabilidad y recuperación.
7. Accesibilidad, responsive, SEO y rendimiento según superficie.
8. Pruebas existentes (evidencia histórica) y pruebas ejecutadas (nuevas).
9. Riesgos de cambio, compatibilidad V1/V2 y plan de reversión.
10. Hallazgos vinculados y decisión: mantener, corregir, sustituir o retirar.

## Registro y clasificación

ID: MW2-###. Tipo: BUG (reproducido), RIESGO (hipótesis), DEUDA (limitación confirmada), INTEGRACION, UX, SEGURIDAD, MIGRACION, PRUEBA o DECISION.
Prioridad: P0 bloquea release; P1 bloquea área crítica/aceptación; P2 mejora importante; P3 pulido.
Estado: DETECTADO → EN_ANALISIS → REPRODUCIDO/DESCARTADO → PROPUESTO → APROBADO → CORREGIDO → VERIFICADO → CERRADO. Un gate pendiente no es un bug.
Campos obligatorios: fecha, SHA/ref, ruta y líneas, comportamiento observado, esperado, impacto, alcance, dependencias, pasos de reproducción, evidencia, corrección mínima, prueba de regresión, estado.
No registrar un supuesto como hecho ni duplicar IDs; vincular hallazgos relacionados.

## Criterios de aceptación global

- No P0 abiertos ni P1 bloqueantes; tests focales y regresión PASS sobre SHA concreto.
- Publicación atómica y coherente; capacidad y licencias consistentes incluso con concurrencia y fallos.
- Aislamiento multitenant y permisos en todas las rutas, incluidas públicas y media.
- Editor completo, sin pérdida silenciosa; variantes y secciones con experiencia validada.
- 5 familias × 3 variantes y viewports representativos inspeccionados; accesibilidad probada.
- R2/D1 y URLs verificadas; SEO/sitemap y Vecindario sin regresiones.
- Paridad V1/V2 documentada; omisiones resueltas; migración idempotente y reversible.
- Backup/restore/rollback ensayados; staging y aceptación humana; autorización de conmutación.
- V1 retirada únicamente cuando cero consumidores activos, compatibilidad probada y retención de datos decidida.

## Primer sprint de auditoría (sin modificar producto)

1. Obtener SHA actual de main y árbol completo de vecidya-platform.
2. Localizar rutas públicas/editor/API, imports y referencias a V1/V2, migraciones, D1/R2, tests y scripts.
3. Dibujar matriz productor→contrato→consumidor y señalar dependencias desconocidas.
4. Revisar MW2-001 con prueba reproducible propuesta, y MW2-002 con búsqueda de API alternativa.
5. Registrar nuevos IDs en HALLAZGOS.md, evidencia en BITACORA.md y actualizar mapa.
6. Emitir informe de fase con cobertura real, riesgos y decisión de avance.

## Disciplina de Git

Rama documental de auditoría separada; commits pequeños y descriptivos. No mezclar correcciones de producto con documentación exploratoria. Para correcciones usar rama/PR específicos, tests y changelog. No desplegar ni borrar V1 sin aprobación.

## Evidencia de ejecución y pendientes de registro (revisión 2026-11-05)

El índice de documentos se mantiene en README.md y el estado global en ESTADO-Y-BACKLOG-CONSOLIDADO-2026-11-05.md. Evidencias de migración 0045: REPRODUCCION-SQLITE-MIGRACION-0045.md, ENSAYO-SQLITE-0045-SEIS-CASOS.md, ENSAYO-RECONSTRUCCION-0045-F02.md, ROLLBACK-0045-SEIS-INYECCIONES-F02.md y REINTENTOS-Y-VOLUMEN-0045-F02.md. Son ensayos SQLite, no D1.

Permisos y migración V1/V2: MATRIZ-PERMISOS-V1-V2-F07.md, REVISION-ROLES-AUTORIZACION-F07.md y MAPA-RUTAS-Y-CORTE-F07.md. MW2-038 resuelto en inspección estática; las pruebas T-AUTH siguen pendientes.

P-REG-06: referencias del plan maestro e índice README sincronizadas. P-REG-01..05 y P-REG-07..09 siguen pendientes según el consolidado. La fase F08 continúa NO-GO; no se autoriza retirada de V1 ni despliegue.
