# MI VECIDYA — SERVICIOS, COMPLEMENTOS, CONSUMOS Y PAGOS · PLAN V1
**Fecha:** 2026-10-29. **Estado:** diseño y auditoría documental, NO implementado. **Relación:** PLAN-V1.md F0–F9. **Alcance:** módulo comercial independiente de MiniWeb, integrado con organizaciones, licencias y plataforma administrativa. Sin merge, despliegue, cobro ni cambio público de precios.

## 1. Objetivo y límites
Mi Vecidya será la fuente visible de relación comercial con Vecidya: productos contratados, estado de activación, próximos importes recurrentes, consumos medidos, facturas, pagos, abonos y deuda. Dos vistas: consolidado por billing_account y detalle por organización. El CRM externo sigue siendo sistema de operación; no duplicar conversaciones, contactos, pipelines ni workflows. La administración Vecidya asigna y gestiona los derechos y registra operaciones auditadas; los clientes no activan proveedores mediante la mera visualización.

## 2. Identidades y permisos
- billing_account es titular de cargos y consolidado; organización es destino del servicio; organization_license determina CRM por organización; Cuadra adicional amplía MiniWeb según DEC-08.
- Owner de billing_account y delegados de facturación explícitos: ver consolidado, documentos y métodos de cobro autorizados; un miembro de organización no hereda acceso económico.
- Responsable de organización con permiso comercial específico: ver sus servicios y, si se le concede, cargos de esa organización, nunca de otras del titular.
- platform_admin: asignar productos, aprobar tarifas, registrar cobros, emitir ajustes y conciliar; soporte sin permiso económico no ve métodos ni precios de coste.
- Toda consulta filtra billing_account y organización en servidor; autorización no depende del selector UI. Auditoría de cambios de titular, delegación, precio, asignación, facturas, pagos y devoluciones.

## 3. Catálogo canónico e inventario
**Fuente:** vecidya-platform/docs/business/VECIDYA_PRODUCT_CATALOG.md y app/content/commercial-detail.ts. No cobrar dos veces lo incluido en licencias.
- Licencias: Cuadra, Barrio, Ciudad; precios actuales 39/59/89 USD/mes, fuera del recargo automático de proveedor.
- Complementos: WhatsApp Business; Telefonía/SMS; Reputación y Reseñas; Campañas y Difusión; IA Conversacional; IA de Voz; Conexiones e Integraciones estándar.
- Servicios profesionales: Presencia y Marca; Web y Conversión; Visibilidad y Marketing; Sistema Comercial; Automatización e Integraciones; IA Aplicada; Desarrollo Empresarial.
- Ampliación Cuadra: producto independiente de capacidad MiniWeb, no CRM.
- Costes variables: WhatsApp por mensaje y país/categoría; números, SMS/MMS, minutos, registro A2P, grabaciones/transcripción; email/envíos/verificación; IA por plan o tokens/minutos; APIs y costes externos; medios publicitarios solo cuando se contraten. Diferenciar consumo del proveedor y servicio humano.
- Cada SKU: ID estable, familia, unidad, periodicidad, precio proveedor con fecha/fuente/país, precio Vecidya, activación, consumo, impuestos/comisiones, condiciones, inclusiones, exclusiones, dependencia de licencia, disponibilidad, estado público y fecha de vigencia.

## 4. Revisión de precios: conflicto explícito de políticas
**DEC-BILL-01 APROBADO (2026-10-29):** Vecidya aplicará un **recargo fijo del 20 % sobre el precio base original verificado de GoHighLevel** para los complementos y consumos revendidos del proveedor: precio Vecidya = precio base proveedor × 1,20. El usuario elige expresamente esta regla estable y transparente, **en lugar** de imponer como política comercial un margen bruto del 20 % sobre la venta. La política anterior del catálogo (2026-10-20) de coste / 0,80 queda **sustituida para estos conceptos**; se conserva únicamente como antecedente histórico. Con coste 100, el precio es 120 y el margen bruto antes de otros costes es 16,67 %, no 20 %. No incrementar el porcentaje por defecto ni añadir recargos ocultos.
**Diseño:** conservar `provider_cost`, `markup_percent`, `direct_cost_total`, `gross_margin_percent`, `price_version`, `approval_status`. Aplicar 1.20 al precio base GHL verificado para preparar propuestas; no exigir el margen histórico del 20 % como suelo de venta. Mostrar por separado cualquier coste de activación, comisión, impuesto o soporte que sea realmente aplicable, sin encubrirlo en el recargo fijo ni inventar cobros. No publicar ni cobrar precios sin aprobación de tarifa y contrato. Precios por unidad de consumo mantienen precisión subcentavo; redondear en la línea de factura según política documentada, no cada SMS a centavos.
**Costes oficiales comprobados 2026-10-29 (referencias, no oferta aprobada):**
| Producto | Coste GHL de referencia | ×1.20 ilustrativo | Notas |
| WhatsApp Business | USD 10/subcuenta/mes | USD 12/mes | mensajes aparte; catálogo Vecidya ya propone desde USD 15 |
| AI Employee Growth | USD 50/localización/mes | USD 60/mes | cobertura compartida voz/conversación, límites y excesos |
| AI Employee Unlimited | USD 97/localización/mes | USD 116.40/mes | fair use; no duplicar plan para voz y chat |
| Número local USA/Canadá | USD 1.15/mes | USD 1.38/mes | jurisdicción y tasas adicionales |
| Número toll-free USA/Canadá | USD 2.15/mes | USD 2.58/mes | jurisdicción y tasas adicionales |
| SMS USA/Canadá | USD 0.00747/segmento | USD 0.008964/segmento | carrier fees adicionales |
| LC Email envío | USD 0.675/1000 | USD 0.81/1000 | verificación/forwarding por separado |
**Fuentes:** https://help.gohighlevel.com/support/solutions/articles/155000001428-whatsapp-pricing-and-billing-full-guide ; https://help.gohighlevel.com/support/solutions/articles/155000006652-ai-product-pricing-update ; https://help.gohighlevel.com/support/solutions/articles/48001223556-phone-system-pricing-billing-guide ; https://help.gohighlevel.com/support/solutions/articles/48001220605
**Limitaciones:** tarifas WhatsApp por país/categoría cambiaron 1-oct-2026; los primeros 1000 mensajes de servicio por número/mes son gratuitos y después facturables. GHL indica que rebilling con markup nativo puede requerir plan Agency de USD 497/mes; verificar plan real y permisos antes de automatizar. Coste de activación, comisión de pasarela, impuestos, soporte y cargos carrier no están cubiertos por la tabla. Reputación/campañas/integraciones/servicios humanos no tienen una tarifa nativa universal: precio basado en consumo real o propuesta de trabajo, no inventar cuotas.

## 5. Datos y libro económico
Entidades propuestas (migraciones aditivas):
- `commercial_product`, `provider_price_version`, `selling_price_version` (fuente, vigencia, país, moneda, unidad, regla de cálculo, aprobador).
- `billing_account_member` (rol delegado, permiso y revocación); `billing_payment_method_reference` (solo token/referencia de PSP, nunca PAN/CVV).
- `organization_subscription` (billing_account, organization nullable para servicios globales, SKU, estado, fecha de activación, renovaciones, precio contratado inmutable por periodo, referencia externa GHL).
- `service_order` y `service_fulfillment` (solicitado, aprobado, pendiente de proveedor, activo, suspendido, cancelado, fallido; evidencia de entrega).
- `usage_event` y `usage_aggregate` (proveedor, external_event_id idempotente, periodo, organización, SKU, unidad, cantidad decimal precisa, coste, moneda, reconciliación).
- `invoice`, `invoice_line`, `payment`, `payment_allocation`, `credit_note`, `refund`, `adjustment` (historial inmutable, documento, vencimiento, estado, impuestos, moneda, origen y referencias).
- `billing_audit_log` y `provider_sync_checkpoint` para trazabilidad/reintentos.
**Invariantes:** no borrar facturas/pagos; correcciones con notas de crédito o ajustes; idempotencia en webhooks, consumos y pagos; conciliación importe facturado ≠ cobrado ≠ consumido; fecha de corte y zona horaria explícitas; precios históricos congelados; moneda/tipo de cambio e impuestos visibles; un pago puede cubrir varias facturas y una factura varios servicios/organizaciones.

## 6. Experiencia de usuario
Ruta propuesta `/app/pagos` (etiqueta visible: **Servicios y pagos**), con tabs Resumen, Mis servicios, Consumos, Facturas y pagos, Detalle por organización.
**Consolidado:** cuota recurrente contratada, consumo variable del periodo (estimado hasta cierre), saldo vencido, total pendiente, próxima fecha de cobro, últimos pagos, desglose por organización, método de pago de referencia enmascarado. Mostrar qué cifras son estimaciones y cuáles facturas emitidas.
**Por organización:** licencia CRM, capacidad MiniWeb del titular sin confundirla con CRM, complementos activos/pendientes, servicios puntuales, activación, precio y periodicidad, unidades consumidas, facturas y pagos imputados.
**Sin cobro automático inicial:** método de pago y recibos solo cuando exista PSP e integración real; nunca simular cobros ni afirmar pago por marcar manualmente un servicio como activo. Descarga PDF/CSV solo con documentos auténticos y permiso.

## 7. Administración Vecidya
Panel interno: catálogo y precios versionados; asignación de licencias/add-ons/servicios por cuenta y organización; cotización y aprobación; activación GHL manual o por conector con confirmación; importación/conciliación de uso; facturación y registro de pagos; gestión de incidencias, devoluciones, descuentos y auditoría. La asignación crea derecho/orden pero **no** presume activación en GHL. Roles mínimos: platform_admin, billing_admin, operations, support_readonly. Separar quien cambia precio de quien aprueba cobros.

## 8. Ejecución por fases y gates
- **B0 Inventario:** contrastar todos los SKU del catálogo y app, fuente oficial de coste, activación, límites y dependencia; clasificar incluido/add-on/servicio/consumo. Gate: sin duplicaciones ni tarifas inventadas.
- **B1 Motor de precios:** versionado coste/venta, recargo 20 %, comparación con margen histórico, moneda/decimales, aprobación. Gate: cálculo puro con pruebas focales, sin cambiar precios públicos aún.
- **B2 Entitlements y pedidos:** separar cuenta pagadora, organización consumidora, licencia, Cuadra extra, asignación y activación externa. Gate: tenant isolation, permisos y estados probados.
- **B3 Libro de facturación:** suscripciones, líneas, facturas, pagos, créditos, impuestos y conciliación; importación histórica con procedencia. Gate: balances reproducibles, no doble cobro.
- **B4 Mi Vecidya:** vista general y detalle, estados, históricos, permisos y exportación autorizada. Gate: cifras derivadas del ledger, no estimaciones presentadas como pagadas.
- **B5 Administración interna:** altas, asignación, cambios de plan, control de servicios, costes y activación confirmada. Gate: auditoría y separación de roles.
- **B6 Consumos GHL:** mapeo location/subaccount→organización; importación idempotente de cargos, periodos y reintentos; reconciliación contra factura del proveedor. Gate: diferencias visibles y no cobradas silenciosamente.
- **B7 Catálogo público:** actualizar fichas únicamente con precios aprobados, fecha, periodicidad, costes variables y exclusiones; no mostrar GHL como marca comercial si la política editorial lo reserva para uso interno. Gate: no prometer tarifa no verificada.
- **B8 QA y lanzamiento:** pruebas focales de cálculo, tenant, RBAC, webhook duplicado, devolución, prorrateo, cambio de precio, uso tardío, saldo y privacidad; migración reversible; autorización explícita de merge/deploy.
**Paralelismo:** B0–B1 pueden avanzar junto con F2A/F2B MiniWeb; B2 debe reutilizar billing_account y no crear un segundo sistema de licencias; B4 puede diseñarse antes de B3, pero no presentar cifras reales hasta conectar ledger.

## 9. Decisiones que requieren cierre comercial antes de cobrar
1. **RESUELTO DEC-BILL-01:** recargo fijo 20 % sobre precio base GHL verificado; sustituye el suelo comercial anterior para estos conceptos. Mostrar el margen real solo como métrica interna, sin imponer otro recargo.
2. Pasarela de pagos, facturación legal, jurisdicción, impuestos, moneda y periodicidad; cómo se importarán pagos históricos previos.
3. Activación, prorrateos, reembolsos, suspensión por impago, cobros fallidos, cambios de titular, consumo tardío y tarifas especiales.
4. Acceso a factura/coste por responsables de organización que no sean titulares, delegación y revocación.
5. Si la plataforma GHL permite exportar todos los eventos de consumo con la granularidad requerida; fallback a importación de reportes conciliados.

**Principio de ejecución:** no bloquear el diseño ni B0/B1 por decisiones de pasarela; sí bloquear cobros reales, cambios de tarifa pública y automatizaciones irreversibles hasta validación. No tocar MiniWeb ni CRM operacional fuera de sus interfaces de licenciamiento.


## 10. B0 — Matriz de monetización y reconciliación con catálogo existente (CODE, 2026-10-29)

**Inventario verificado en `app/content/commercial-detail.ts`:** 3 licencias; 7 add-ons (IDs `whatsapp-business`, `telephony-sms`, `reputation-reviews`, `campaigns-diffusion`, `conversational-ai`, `voice-ai`, `connections-integrations`); 7 servicios (IDs `estructuracion`, `formalizacion`, `presencia-digital`, `visibilidad`, `automatizacion`, `inteligencia-artificial`, `desarrollo-empresarial`). **No crear SKUs duplicados** por la diferencia entre el título visible y el ID legacy.

| Grupo | Qué se factura | Regla | Dependencia |
| --- | --- | --- | --- |
| Cuadra/Barrio/Ciudad | Licencia propia de Vecidya | 39/59/89 USD mensuales; sin 20 % automático | `organization_license`; CRM solo en org asignada |
| Cuadra extra | Bloque de +3 publicaciones | Precio contractual por definir; no inventar tarifa | Cuenta titular, registro de ampliación F2A |
| WhatsApp Business | Cuota nativa GHL y mensajes facturables | Cuota base GHL ×1,20; uso por tarifa nativa ×1,20 | Barrio/Ciudad, subcuenta y canal activado |
| Telefonía y SMS | Números, SMS/MMS, llamadas y tasas de proveedor | Solo cargos reales GHL ×1,20; impuestos/tasas separados | Canal y país; no inventar fee mensual |
| Reputación y Reseñas | Uso premium real de mensajes/IA | Función estándar ya incluida en CRM; no fee duplicado | Barrio/Ciudad y canales |
| Campañas y Difusión | Envíos/canales premium reales | Configuración estándar incluida; consumo GHL ×1,20 | Consentimiento y canales |
| IA Conversacional | Plan IA compartido o uso compatible | Un plan por localización, ×1,20 | Barrio/Ciudad; no duplicar plan de voz |
| IA de Voz | Misma suscripción IA compartida + telefonía/uso extra | No segunda cuota IA; uso GHL ×1,20 | Telefonía habilitada y configuración |
| Conexiones e Integraciones | Cargo externo real de app/API/ejecución | GHL ×1,20 si el cargo es GHL; otros proveedores requieren política específica | Integración estándar incluida no se cobra |
| 7 servicios profesionales | Proyecto, implantación o gestión humana pactada | Presupuesto por alcance; **no** multiplicar mano de obra por tarifa GHL | Orden de servicio y aceptación |
| Activaciones y tasas | Solo cargos comprobados y pactados | Desglosar, no camuflar en recargo | Evidencia de coste y contrato |

**Regla aprobada DEC-BILL-01:** el 20 % es un **recargo fijo sobre la tarifa nativa GHL**, no una garantía de margen bruto 20 %. La tarifa histórica comercial del catálogo de 2026-10-20 `coste/0,80` queda obsoleta **para cargos revendidos de GHL**. No modificar precios base de licencias ni aplicar 20 % automáticamente a honorarios propios o proveedores distintos de GHL.

**Deuda de consistencia identificada:** `app/content/commercial-detail.ts` sigue mostrando textos calculados con `PROVIDER_TARGET_MARGIN_PERCENT`, y `docs/business/VECIDYA_PRODUCT_CATALOG.md` contiene la regla anterior, precios piso 12,50/62,50/121,25 y referencia WhatsApp desde 15. **No actualizar páginas públicas parcialmente**: B1 debe unificar una sola fuente de tarifas versionadas y B7 reemplazar en un cambio coordinado toda afirmación antigua, conservando precios contratados en históricos.

### B0.1 — Criterio de tarifas auditables
Por cada cargo: `provider=GHL`, `provider_product_code`, `location_id`, `currency`, `country`, `unit`, `provider_price`, `source_url`, `verified_at`, `effective_from`, `markup_bps=2000`, `sell_price`, `rounding_policy`, `approval_status`. Separar tarifa de proveedor de cargo efectivamente incurrido y de línea facturada; si falta tarifa verificable, estado **pendiente de cotización** sin precio inventado.

### B0.2 — Reglas de interfaz y factura
Mostrar cada concepto con organización, producto, periodo, cantidad, precio unitario, base, consumo, impuestos/tasas externos, importe final y estado. Si una suscripción IA cubre dos funcionalidades, indicar **plan compartido** y no generar dos líneas mensuales. El total consolidado suma todas las organizaciones de la misma cuenta sin duplicar consumos, impuestos ni pagos.

### B0.3 — Siguiente entrega técnica acotada
1. B1-1: módulo puro de precio decimal con recargo fijo 2000 bps, redondeo documentado, casos fraccionarios, moneda y tests focales.
2. B1-2: fuente de tarifas versionada, verificación/aprobación, sin migrar contratos existentes automáticamente.
3. B2-1: asignaciones por cuenta y organización con permisos económicos independientes de Better Auth membership.
4. B4-1: diseño de vista consolidada y detalle con datos tipados simulados claramente, sin fingir pagos reales.
5. B7: cambio coordinado de catálogo público **solo** tras aprobar precios y evidencia; no publicar tarifas sin verificación.

**Estado:** B0 inventario estructural completado por inspección estática; validación de precios unitarios oficiales, pruebas y ejecución de B1 pendientes.
