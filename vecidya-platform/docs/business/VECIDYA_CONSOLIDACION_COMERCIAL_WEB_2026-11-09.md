# Vecidya — Consolidación comercial y actualización web V1
**Fecha:** 2026-11-09. **Estado:** documentación y código fuente de web pública actualizados en rama main; sin deploy ni certificación E2E.

## Decisiones aprobadas y vigentes
- Cuadra USD 39/mes, alta USD 0, tres organizaciones Vecidya iniciales, una MiniWeb por organización, Vecindario según aprobación, sin CRM.
- Barrio USD 59/mes, alta USD 10; hereda Cuadra, CRM estándar comercial para **una** organización asignada, configuración, permisos, capacitación y workflows internos estándar incluidos.
- Ciudad USD 89/mes, alta USD 15; hereda Barrio, CRM para **una** organización asignada, seis módulos estándar **incluidos en biblioteca**, activables según necesidad sin recargo: ventas, incorporación, atención, reactivación, renovaciones, coordinación.
- Cuadra adicional suma tres espacios de organizaciones, no CRM. Licencias CRM adicionales para otras organizaciones sujetas a política de contratación y capacidad técnica pendiente.
- No topes ficticios de contactos, usuarios, pipelines, formularios o workflows. No doble cobro de funciones estándar Barrio/Ciudad.
- Addons: coste fijo verificable de GHL × 1,25 de referencia, banda 1,20–1,30; nueve precios aprobados en catálogo operativo. Consumos externos separados según uso real, sin recargo automático del addon.
- Cobro inicial mediante proveedor externo **pendiente de seleccionar/integrar**. Tras adquirir GHL Unlimited USD 297/mes, evaluar rebilling automático compatible; no afirmar que está disponible ni adquirido.
- Servicios profesionales se cotizan por alcance y entregables; no incluyen por defecto funcionalidades estándar ya licenciadas.

## Cambios aplicados a web pública (fuente)
- `app/content/commercial-detail.ts`: fuente de licencias ampliada con reglas de organizaciones, CRM por organización y biblioteca Ciudad; tabla de nueve tarifas aprobadas exportada; WhatsApp actualizado a USD 12.50/mes + consumo real.
- `app/routes/licenses.tsx`: comparativa y explicación de tres organizaciones, MiniWeb por organización, CRM para una, módulos Ciudad y ampliación Cuadra.
- `app/routes/addons.tsx`: tabla pública de nueve cuotas fijas, advertencias de consumo, elegibilidad y cobro externo; siete fichas temáticas anteriores permanecen para orientación.
- `app/routes/services.tsx`: límites de servicios profesionales, cotización y no doble cobro.
- Fichas `/licencias/:slug`, `/addons/:slug`, `/servicios/:slug` consumen `commercial-detail.ts` mediante ruta compartida; no se alteró su lógica.
- Documentos de negocio `VECIDYA_PRODUCT_CATALOG.md`, `VECIDYA_LICENCIAS_ORGANIZACIONES_CRM_V2.md`, `VECIDYA_CRM_ADDONS_SERVICIOS_MATRIZ_V1.md`: estados obsoletos corregidos.

## Advertencias de consistencia
1. El catálogo público contiene siete **familias temáticas** de complementos y una tabla adicional de nueve **productos con tarifa fija**; no son la misma taxonomía. No atribuir a telefonía, SMS, campañas, reseñas o integraciones cuotas mensuales que no se hayan aprobado.
2. El plan IA Growth/Unlimited puede cubrir varias capacidades; no facturar dos veces suscripción por conversación y voz. Telefonía, excesos y exclusiones por separado.
3. IP dedicada solo si el plan de agencia permite activarla; no ofrecer como operativa bajo Starter.
4. El catálogo y los derechos de licencia son promesas comerciales objetivo, no evidencia de provisión GHL ni entitlements implementados.
5. El cambio a Unlimited y la integración de pagos siguen pendientes; la web no incorpora checkout ni cobros automáticos.
6. **No se ha ejecutado typecheck, build ni QA visual/E2E en este entorno**; verificar localmente antes de publicar.
7. Políticas contractuales pendientes: impuestos, prorrateos, bajas, devolución/exportación de datos, soporte/SLA, CRM adicional, renovación, cobros de consumos, alertas de gasto.

## QA recomendado
- `pnpm typecheck`, `pnpm build` desde `vecidya-platform` con el entorno previsto.
- Navegar `/licencias`, `/licencias/cuadra`, `/licencias/barrio`, `/licencias/ciudad`, `/addons`, `/addons/whatsapp-business`, `/servicios` y fichas, en móvil y escritorio.
- Verificar tabla responsive, CTA de contacto, precios, unidades, textos y ausencia de claims de disponibilidad operativa.
- Validar contra Workers DEV tras deploy de staging y luego producción según procedimiento Vecidya; no dar por publicado solo por commit en main.

## Fuentes internas
- [Catálogo comercial](./VECIDYA_PRODUCT_CATALOG.md)
- [Licencias V2](./VECIDYA_LICENCIAS_ORGANIZACIONES_CRM_V2.md)
- [Barrio V1](./VECIDYA_BARRIO_CRM_STANDARD_V1.md)
- [Ciudad V1](./VECIDYA_CIUDAD_CRM_STANDARD_V1.md)
- [Matriz](./VECIDYA_CRM_ADDONS_SERVICIOS_MATRIZ_V1.md)
- [Política addons](./VECIDYA_ADDONS_PRICING_V1.md)
- [Catálogo addons](./VECIDYA_ADDONS_CATALOGO_OPERATIVO_V1.md)

## Changelog
- 2026-11-09 V1: consolidación comercial, cambios fuente web y lista de pruebas y pendientes.
