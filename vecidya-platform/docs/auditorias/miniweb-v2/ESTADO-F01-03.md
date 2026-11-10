# F01-03 — Estado y pendientes

Fecha: 2026-11-05. F01 y F06 en curso. No se ejecutaron pruebas.

Fuentes leídas en main: db/schema/miniweb.ts, wrangler.jsonc, app/routes/sitemap.ts.

MW2-019 (P2): sitemap puede cachear durante 3600 segundos un resultado sin MiniWeb V2 si falla solo la consulta V2. Confirmado en lógica; no reproducido en producción. Verificar degradación y TTL.

MW2-020 (P1): revisar consistencia de propietario de cupos tras transferencias y borrados. No es bug confirmado.

MW2-021 (P1): bindings D1/R2 distintos para staging y producción; estado remoto y backups sin verificar. Gate abierto.

MW2-022 (P2): rutas supuestas de migraciones 0044/0045 no encontradas. Localizar nombres reales antes de concluir.

Pendientes heredados: MW2-001 a MW2-018, P-CI-01 a P-CI-10. Sin retirar V1, sin desplegar y sin modificar main.

Próximo: localizar migraciones reales, revisar invariantes D1 y tests; sincronizar HALLAZGOS, BITACORA e INTEGRACION-CONTINUA.
