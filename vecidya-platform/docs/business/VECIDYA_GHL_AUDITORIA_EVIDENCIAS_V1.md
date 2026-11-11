# Vecidya — Auditoría GHL, expediente de evidencia V1
**Fecha:** 2026-11-11. **Estado:** FASE 1: investigación documental oficial. **Sin auditoría visual de cuenta todavía; sin cambios GHL, pagos, precios o contratos.**

## Propósito
Contrastar capacidades HighLevel contra las licencias **ya aprobadas** de Vecidya (Cuadra 39 USD/mes; Barrio 59; Ciudad 89) y su política de addons 25 % referencia, consumos al uso y cobro inicialmente externo. No cambiar dichas decisiones sin nueva aprobación. El CSV hermano **VECIDYA_GHL_INVENTARIO_MAESTRO_V1.csv** es el registro inicial por funcionalidad (19 campos).

## Niveles de evidencia
- **DOC_OFICIAL_CUENTA_PENDIENTE:** existencia soportada en guías/precios oficiales; NO verificadas visibilidad, acceso, pago, límites o configuración en la cuenta de Vecidya.
- **VISIBLE_CUENTA_PENDIENTE_CONFIG:** aparece en captura, pero no comprobada funcionalmente.
- **CONFIGURADA_PENDIENTE_E2E:** parámetros presentes, sin ejecución de prueba controlada.
- **VERIFICADA_E2E:** prueba y resultado con fecha y evidencia.
- **REQUIERE_PAGO_O_PLAN:** función restringida por proveedor.
- **NO_DISPONIBLE:** incompatibilidad observada/probada.

Ninguna fila del CSV se encuentra todavía en estado VISIBLE_CUENTA o VERIFICADA_E2E.

## Hallazgos documentales prioritarios
1. **Planes GHL:** Starter 97 USD/mes, 3 subcuentas en total; Unlimited 297 USD/mes, subcuentas ilimitadas y paso de ciertos costes sin recargo; Founder (antes Agency Pro) 497 USD/mes, SaaS Mode y refacturación con recargo según elegibilidad. Las tres organizaciones Vecidya no son tres subcuentas GHL para cada cliente.
2. **SaaS Configurator:** permite categorías, niveles, features, snapshots, addons, Marketplace apps, pruebas/créditos y facturación de uso. SaaS V1 depende de Stripe como origen; SaaS V2 del Agency Sub-Account. V2 no admite prorrateo en cambios de plan; funciones y permisos varían. Esto **no justifica prometer upgrades automáticos Vecidya**.
3. **Control de permisos:** feature toggles en subcuenta y permisos individuales My Staff son niveles distintos; usuario no puede acceder a features bloqueadas para su subcuenta. Agencia ≠ usuario cliente.
4. **Snapshots:** copian configuración reutilizable, no contactos, citas, mensajes, conversaciones, integración de pagos, conexiones externas ni actividades. No equivalen a instalación operativa.
5. **Tickets (2026-11-11):** tickets con estados, prioridades, categorías, SLA, respuestas, métricas, permisos, workflows y configuración snapshot. **Candidato fuerte para módulo Atención Ciudad**, sujeto a verificación en cuenta y coste. No tratar ticket como oportunidad comercial por defecto.
6. **Custom Objects:** oficiales para todos los planes, **límite real de 10 por ubicación y 300.000 registros por objeto** según documentación vigente; no inventar restricciones por Barrio/Ciudad. Integraciones no uniformes: por ejemplo, el objeto personalizado no se maneja como dato integrado a todas las bandejas/calendarios/pagos.
7. **Cobro:** conservar servicio externo de Vecidya inicialmente; Unlimited 297 no se confunde con SaaS Mode; no contratar Founder ni modificar billing sin autorización.

## Primera evidencia solicitada (solo una)
**Captura 001 — Agency View > navegación lateral completa**, con selector de contexto agencia/subcuenta visible y, si cabe, los ítems SaaS Configurator, Sub-Accounts, Account Snapshots, Settings. Ocultar correos, teléfonos, datos privados, tarjetas, IDs y enlaces con tokens. No abrir Billing ni modificar funciones. Registrar menús visibles, rol, plan mostrado solo si se ve sin datos sensibles. Posterior captura focalizada se elegirá tras analizar la primera.

## Ciclo de auditoría
Captura → lectura de menú y submódulos → contraste oficial → registro CSV con estado/evidencia → recomendación Cuadra/Barrio/Ciudad/addon/servicio → restricciones y costes → siguiente captura concreta. No activar, crear o desactivar features sin aprobación.

## Documentación oficial
- https://www.gohighlevel.com/pricing
- https://help.gohighlevel.com/support/solutions/articles/155000001156-highlevel-pricing-guide
- https://help.gohighlevel.com/support/solutions/articles/48001180534-introducing-the-highlevel-founder-plan
- https://help.gohighlevel.com/support/solutions/articles/155000008015-getting-started-with-the-saas-configurator
- https://help.gohighlevel.com/support/solutions/articles/48001207110
- https://help.gohighlevel.com/support/solutions/articles/48001184431
- https://help.gohighlevel.com/support/solutions/articles/48000982511
- https://help.gohighlevel.com/support/solutions/articles/155000009663-set-up-and-configure-ticketing
- https://help.gohighlevel.com/support/solutions/articles/155000009670-automate-ticketing-with-workflows
- https://help.gohighlevel.com/support/solutions/articles/155000006631

## Changelog
- 2026-11-11 V1: expediente oficial + inventario preliminar de 19 capacidades; primera captura solicitada, cuenta sin inspección.
