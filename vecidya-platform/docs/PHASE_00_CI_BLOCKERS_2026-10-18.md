# Fase 00 — Bloqueos observados en CI (2026-10-18)

## Evidencia verificable

- [Run 39122181007](https://github.com/hola675/Vecidya/actions/runs/39122181007), commit `bc305fdd`: suite unitaria, build y migraciones D1 locales aprobaron.
- E2E 01B: `6/6 PASS`.
- E2E 01C.3: FAIL en `recovery reemite acceso sin volver a contar email_verified`: el endpoint de verificación devolvió **HTTP 429** (confirmado por la ejecución 39122723833). La verificación utiliza límites por IP y por solicitud (`email-verify:request:<id>`), por lo que cambiar la IP en el test no evita necesariamente el límite por solicitud. Investigar el presupuesto del rate limiter de desarrollo y el número de canjes previos; **no eliminar ni debilitar el límite de producción**. Revisar el código de emisión/consumo de challenges, el límite de solicitudes y los datos del fixture antes de modificar la aserción.
- Limpieza de datos personales D1 posterior a E2E: PASS. La comprobación actual **no demuestra por sí sola** que los agregados anónimos se hayan conservado: verificar explícitamente sus recuentos.
- Aislamiento productivo: FAIL porque el bundle de cliente `build/client/assets/diagnostic-CBfdrias.js` contiene la cadena `/__dev/diagnostico/`. Investigar el origen de la cadena y la inclusión en el bundle; **no eliminar la aserción sin demostrar que el código dev-only queda excluido**.

## Acciones de cierre (sin despliegue)

1. Reproducir la recuperación repetida en D1 local y comprobar el límite por solicitud de `email-verify` tras los canjes previos. Ajustar el fixture o aislar la ventana del test si corresponde, sin debilitar la protección de producción.
2. Rastrear la referencia `/__dev/diagnostico/` en el grafo de importaciones del cliente; retirar dependencias de desarrollo del bundle de producción y repetir el test de aislamiento.
3. Añadir verificación explícita de persistencia de agregados anónimos tras purgar PII en D1 local.
4. Resolver conflictos del PR #6 preservando cambios de `main` y de la rama de diagnóstico; validar unit/typecheck/build/E2E antes de integrar.
5. Mantener PR en draft y no hacer merge, deploy ni modificaciones remotas D1 hasta obtener autorización.

## Rama de conciliación

`integration/phase-00-main-reconcile` contiene copias sin conflicto de 10 archivos procedentes de `main`. Los documentos ARCHITECTURE, CHANGELOG, DATABASE, PROJECT_STATE, ROADMAP, STATUS y TESTING tienen cambios divergentes y requieren conciliación semántica, no sobrescritura.

## Actualización de evidencias — ejecución 39124981779 / 39124981776

- Rama funcional `feat/diagnostic-funnel-01d1`, commit `60845031`: la CI general [39124981776](https://github.com/hola675/Vecidya/actions/runs/39124981776) falló con **1579 PASS / 2 FAIL** en pruebas unitarias de registro de rutas dev (`diagnostic-flow-ui.test.ts` y `result-ui.test.ts`). El cambio a `import.meta.env?.DEV` no responde a la simulación de `process.env.NODE_ENV` que hacen ambas pruebas en Node. Se necesita un contrato de entorno compatible con React Router dev, Node test y build productivo, sin abrir rutas dev en producción.
- La CI especializada [39124981779](https://github.com/hola675/Vecidya/actions/runs/39124981779) llegó a ejecutar 01C.3, pero falló en `snapshot vencido no genera otro mensaje local`; la espera de 65 segundos y los reenvíos previos exigen revisar la expectativa temporal del buzón/fixture. No se ha demostrado que el HTTP 429 anterior esté resuelto en toda la secuencia.
- 01B sigue pasando. El test de aislamiento productivo sigue detectando `/__dev/diagnostico/` en `build/server/assets/server-build-C_UeWmZE.js`; el arreglo del cliente no basta.
- Conciliación documental: los 17 archivos inicialmente divergentes recibieron una primera pasada de preservación; se añadieron los contratos `Eventos y GHL` en ARCHITECTURE y `Analítica del Diagnóstico (DIAG-V3-08)` en DATABASE. **No equivale a un merge Git certificado**: comparación contra `main` aún divergente (8 commits behind al comprobar), requiere revisión semántica, integración y pruebas.

### Próximas comprobaciones independientes

1. Ejecutar pruebas unitarias específicas de rutas dev en los tres contextos: Node con `NODE_ENV=development`, React Router dev y build productivo; comprobar que la ruta realmente responde en dev y es 404 en producción.
2. Rastrear el marcador dev en el artefacto servidor hasta su módulo importador; conservar el test de búsqueda de marcadores y de HTTP 404.
3. Revisar la secuencia de `localMessage.createdAt` en la recuperación tras el vencimiento del snapshot y hacer que el E2E compare contra el último mensaje realmente emitido, sin debilitar la condición de no emisión tras expiración.
4. Repetir E2E 01C.3 y comprobar recuentos anónimos D1 tras limpieza de datos personales.
5. Resolver la divergencia Git en la rama aislada, sin merge a `main`, despliegue ni cambios D1 remotos.
