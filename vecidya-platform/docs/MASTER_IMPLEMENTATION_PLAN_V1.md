# VECIDYA — PLAN MAESTRO DE CIERRE V1
Fecha: 2026-10-18 | Rama de trabajo: feat/diagnostic-funnel-01d1
Estado: planificación y auditoría parcial; NO equivale a certificación, despliegue ni aceptación de producción.

## Principios no negociables
- Vecidya es autoridad de usuarios, invitaciones, organizaciones, licencias, perfil/MiniWeb, Vecindario, diagnóstico, servicios y consentimiento.
- GHL es un proveedor CRM externo y opcional: Cuadra USD 39 no incluye GHL; Barrio USD 59 y Ciudad USD 89 habilitan CRM **solo para la organización licenciada**. La licencia activa del propietario habilita cartera de múltiples organizaciones y publicaciones Vecindario; no concede CRM a todas.
- Una primera organización puede crearse como onboarding por invitación sin licencia; publicar requiere licencia válida. Nunca inferir derechos de membresía ajena.
- No borrar migraciones, registros ni sesiones históricas; no reescribir respuestas con otro motor. No sincronizar PII a GHL sin consentimiento/autorización.
- No merge, deploy, correo real ni D1 remota sin autorización. Cada fase entrega código, pruebas, evidencia, documentación y rollback.

## Semáforo de estado
- IMPLEMENTADO PARCIAL: control de organizaciones, licencias y publicación; MiniWeb modular inicial; diagnóstico V3 y funnel de identificación local.
- DOCUMENTADO: inventario de legacy, roadmap de consolidación, separación Vecidya/GHL.
- NO CERTIFICADO: CI funcional de licencias, matriz de permisos, paridad QBV2/QA-03B, correo real, derechos/retención, MiniWeb completo y CRM tenant-scoped.
- BLOQUEADO: FUNNEL-01D.1 según roadmap histórico; GATE_B_PARTIAL y cutover ACT-04. No levantar bloqueos por editar este plan.

## Fases secuenciales y puertas de salida

| ID | Fase / entrega funcional | Trabajo concreto | Criterio de aceptación |
| --- | --- | --- | --- |
| 00 | Línea base y CI | Revisar PR #6, divergencia con main, lockfile, GitHub Actions, typecheck/build, unitarias y D1 local efímera; separar fallos preexistentes | CI ejecutado con logs y baseline reproducible, matriz de bloqueos y rollback |
| 01 | Seguridad y licencias | Una sola función de entitlement: propietario/cuenta, cartera, publicación, expiración y CRM por org; probar roles, invitaciones, 1ª y N organizaciones, revocación | Pruebas positivas/negativas D1 + Better Auth; sin fuga entre tenants |
| 02 | Diagnóstico: inventario y contrato | Matriz de imports y consumidores legacy, sesiones, claves, migraciones; versionar banco/opciones/respuestas/scoring/reporte; comparar QBV2 y QA-03B | Informe diff determinista + fixtures + decisión de identidad destino |
| 03 | Diagnóstico: contenido y motor | Revisar pregunta por pregunta: copy, respuestas, exclusividad, aplicabilidad, contradicciones, rutas, personas, puntuación, evidencia y recomendaciones | Golden personas y adversariales PASS, cobertura y trazabilidad sin regresiones |
| 04 | Embudo e informes | Anónimo sin datos: score/resumen/descarga resumida; detalle solo con identificación voluntaria, verificación email, snapshot y reporte personalizado; accesibilidad/PDF | E2E Worker/D1, privacidad, estados de error, mobile/desktop y cero filtración |
| 05 | Privacidad y analítica | Cerrar 01D.1, después 01D.2: consentimientos separados, revocación, eliminación verificable, retención y métricas agregadas; 01D.3 solo con autorización | Gates aprobados en orden; datos minimizados y evidencia de derechos |
| 06 | Cutover y limpieza legacy | Migración por adaptadores versionados, switch público reversible, eliminar solo imports/rutas/assets muertos; preservar historia/migraciones | Diff de consumidores vacío, sesiones antiguas seguras, CI + E2E + rollback PASS |
| 07 | App cliente y MiniWeb | Oferta negocio/FAQ, medios R2, editor modular, borrador/preview/publicar, dominio/ruta pública, validación móvil, accesibilidad | MiniWeb Cuadra funcional sin GHL; aislamiento y publicación consistente |
| 08 | Vecindario y catálogo | Índice/buscador, filtros, páginas públicas desde MiniWeb, visibilidad por licencia/gobernanza, SEO, links, estados suspendidos | Búsqueda y ficha coherentes, sin negocios sin derecho, E2E y visual |
| 09 | GHL Barrio/Ciudad | Contrato por organización, provisioning autorizado, scopes, secretos, mapeo tenant, estados/reintentos, revocación, UI y auditoría; nada para Cuadra | Pruebas de aislamiento, idempotencia y degradación cuando GHL falla |
| 10 | Operación comercial | Licencias/estados, servicios, onboarding, cobros solo si aprobados, recomendaciones, ayuda y soporte; copy y flujos | Caminos completos por plan y rol; precios coherentes y errores accionables |
| 11 | Certificación V1 | Suite total, seguridad, rendimiento, accesibilidad, SEO, responsividad, observabilidad, backup, migraciones staging y rollback | Checklist firmado, evidencias, cero P0/P1 y aprobación explícita de despliegue |

## Forma de ejecutar cada fase
1. Auditar estado real (código, datos, documentación, riesgos y tests).
2. Redactar contrato y matriz de casos, identificar dependencias y decisiones.
3. Implementar en commits pequeños sin mezclar dominios.
4. Ejecutar tests unitarios, integración D1, E2E, typecheck y build pertinentes.
5. Validar UX, accesibilidad, móvil, seguridad y regresiones.
6. Registrar evidencia PASS/FAIL, deuda y rollback; no marcar «terminado» por haber hecho commit.

## Casos críticos de aceptación
- Usuario invitado sin organizaciones; miembro sin propiedad; primera org sin licencia; propietario con Cuadra y 3 orgs; admin publica org de propietario licenciado; expiración/suspensión/cancelación; licencia Barrio de org A no habilita CRM de org B; perfiles antiguos y sesiones históricas.
- Diagnóstico anónimo no fuerza identificación; imprimir/descargar muestra solo resumen; detalle requiere verificación; la aceptación comercial es opcional y separada; reanudación y cambio de versión no alteran score histórico.
- Fallo GHL no bloquea MiniWeb ni Vecindario. No hay datos de CRM duplicados como fuente autoritativa en Vecidya.

## Orden inmediato (próximos checkpoints)
A. Confirmar CI verde o registrar fallos reales, y corregir cualquier error de compilación introducido.
B. Centralizar entitlement en servidor y escribir tests D1/Better Auth; corregir el modelo para que el derecho de cartera no dependa de licencia de cada org.
C. Generar comparación QBV2 vs QA-03B y matriz de consumidores legacy; decidir versión destino sin borrado.
D. Pulir preguntas/respuestas con tests por rutas; terminar anónimo + identificado.
E. Continuar secuencia 01D.1 → 01D.2 → 01D.3 y luego cutover seguro.
F. Terminar MiniWeb/Vecindario y finalmente GHL, certificación V1.

## Registro de riesgos abiertos
R1: CI nuevo creado pero sin ejecución confirmada. R2: verificaciones actuales de licencias son principalmente estáticas. R3: potencial discrepancia entre licencia de cartera y licencia CRM por organización. R4: banco candidato no equivale automáticamente al motor público. R5: protección de privacidad y retención incompleta. R6: coexistencia legacy con consumidores desconocidos. R7: dependencia de GHL y permisos por tenant aún sin certificar.

**Fuente de detalle histórico:** docs/ROADMAP.md y docs/DIAGNOSTIC_CONSOLIDATION.md. Esta hoja es el orden ejecutivo; no sustituye gates anteriores.
