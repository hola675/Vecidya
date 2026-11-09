# Vecidya — Licencias, organizaciones, MiniWeb y CRM V2

> **Política de addons aprobada (2026-11-09):** [VECIDYA_ADDONS_PRICING_V1.md](./VECIDYA_ADDONS_PRICING_V1.md). Recargo estándar **25 %** sobre cuota base verificable del addon, ajustable **20–30 %**; **consumos adicionales separados y cobrados según uso real**, sin recargo automático del 25 % sobre consumo. Las tarifas concretas de cada addon siguen pendientes de validación; cualquier mención previa a «política de recargos pendiente» queda reemplazada por esta aprobación.

> **Ciudad aprobado 2026-11-09:** [Ciudad CRM Standard V1](./VECIDYA_CIUDAD_CRM_STANDARD_V1.md). Los **seis módulos estándar** (ventas, incorporación, atención, reactivación, renovaciones y coordinación) están **incluidos en la biblioteca de Ciudad** y se **activan según corresponda al negocio, sin recargo por módulo estándar**. La aprobación es comercial/funcional; implementación GHL y pruebas E2E pendientes. Cualquier mención anterior a «Ciudad pendiente de aprobación/detalle» queda reemplazada por esta decisión; permanecen pendientes validaciones técnicas y políticas contractuales.
**Fecha:** 2026-11-07. **Estado:** acuerdo comercial de producto; implementación y políticas contractuales aún por validar. Este documento prevalece sobre reglas anteriores incompatibles del catálogo V1.

## Modelo aprobado
- **Herencia funcional:** Cuadra ⊂ Barrio ⊂ Ciudad. Barrio incluye Cuadra; Ciudad incluye Barrio y Cuadra. Cuadra es independiente. La calidad y funcionalidades base de MiniWeb se heredan sin degradación.
- **Capacidad inicial:** contratar cualquiera de Cuadra, Barrio o Ciudad habilita **tres organizaciones** en Mi Vecidya. Cada organización/negocio dispone de **una sola MiniWeb publicable** y su presencia en Vecindario, siempre sujeta a permisos y controles de publicación.
- **Ampliación:** para registrar una cuarta organización se contrata **Cuadra adicional**, que habilita **tres organizaciones más**. Capacidad 3→6→9… según ampliaciones. Cuadra adicional **no añade CRM**.
- **CRM separado:** Barrio y Ciudad habilitan su CRM **para una organización asignada por licencia**, no para las tres organizaciones de capacidad inicial. Toda otra organización que quiera CRM requiere **su propia licencia Barrio o Ciudad**. Puede haber organizaciones sin CRM, Barrio y Ciudad en una misma cuenta.
- **No confundir derechos:** capacidad de organizaciones, MiniWeb por organización, CRM por organización y complementos/costes de uso son dimensiones diferentes. Una organización creada no se publica automáticamente ni recibe CRM.
- **Conexión GHL:** conectada según el estado comunicado, pero conexión no equivale a aprovisionamiento, permisos, aislamiento y workflows certificados.

## Comparativa comercial
| | Cuadra | Barrio | Ciudad |
|---|---|---|---|
| Precio catálogo | USD 39/mes | USD 59/mes | USD 89/mes |
| Alta inicial estándar | USD 0 | USD 10 | USD 15 |
| Capacidad inicial | 3 organizaciones | 3 organizaciones | 3 organizaciones |
| MiniWeb | 1 por organización | Heredada | Heredada |
| Perfil y Vecindario | Sí | Sí | Sí |
| CRM incluido | No | 1 organización | 1 organización |
| Proceso principal estándar | No | Sí | Sí |
| Multiproceso modular coordinado | No | No | Sí |

**Cuadra:** presencia, identidad de negocio, MiniWeb, Vecindario, información y relación con Vecidya; no CRM operativo.

**Barrio:** todo Cuadra y, para una organización, CRM estándar de un proceso comercial principal: captación/formulario, contactos, oportunidades, pipeline, tareas, seguimiento, agenda cuando corresponda y automatizaciones estándar del mismo recorrido. No volver a cobrar esos flujos como addons.

**Ciudad:** todo Barrio y, para una organización, procesos relacionados, asignaciones y biblioteca de seis módulos estándar seleccionables: ventas y oportunidades; incorporación/onboarding; atención y seguimiento; reactivación; renovaciones; asignación y coordinación. No imponer cupos ficticios de contactos, usuarios, workflows o pipelines; la diferencia es complejidad operativa real.

**Complementos:** WhatsApp Business, telefonía/SMS, reputación/reseñas, campañas, IA conversacional/de voz e integraciones según catálogo y activación. Los cargos recurrentes, servicios a medida y consumos externos deben distinguirse. Ni la licencia CRM ni el nombre de un canal prueban que un workflow esté configurado.

## Ejemplos de contratación
1. **Cuadra inicial:** A, B y C pueden tener cada una su MiniWeb; ninguna tiene CRM.
2. **Cuarta organización D:** requiere Cuadra adicional; capacidad total seis; CRM no cambia.
3. **Barrio inicial:** tres espacios de organización y Barrio CRM solo para la organización expresamente asignada.
4. **Ciudad inicial:** tres espacios de organización y Ciudad CRM solo para la organización expresamente asignada.
5. **Tres negocios distintos:** restaurante Ciudad CRM, barbería Barrio CRM y cafetería sin CRM; las tres MiniWeb independientes.
6. **Ciudad + Cuadra adicional:** seis espacios de organización; sigue habiendo Ciudad CRM solo para el negocio licenciado, salvo contratación individual de más CRM.
7. **Cambio Barrio→Ciudad:** conserva organización y MiniWeb; no deben mantenerse dos derechos CRM activos superpuestos por error.

## Reglas funcionales para implementación (propuesta, no certificada)
- Derecho de cuenta: capacidad total de organizaciones (base 3 + bloques Cuadra adicionales de 3).
- Derecho por organización: una MiniWeb y su estado de publicación; CRM `none|barrio|ciudad` con asignación explícita y estado de aprovisionamiento independiente.
- Complementos por organización y consumos externos separados de licencia.
- Autorización y límites en backend, no solo UI; membresías reales, aislamiento tenant, auditoría, idempotencia y reconciliación con facturación y GHL.
- El cuarto alta se bloquea por capacidad; el número de MiniWeb publicadas no determina cuántas organizaciones ocupan espacios.
- No se alteran contratos, datos ni workflows productivos al publicar este documento.

## Maquetas acordadas
1. **General:** tres planes, herencia, precios, capacidad inicial 3, una MiniWeb por organización, CRM individual, Cuadra adicional para la cuarta y ejemplos.
2. **Cuadra:** presencia y MiniWeb, tres organizaciones, publicación, ampliación y exclusiones.
3. **Barrio:** todo Cuadra, CRM para una organización, recorrido comercial estándar, incluidos, complementos y límites.
4. **Ciudad:** todo Barrio, CRM para una organización, seis módulos y coordinación multiproceso, incluidos y exclusiones.


## Actualización aprobada 2026-11-09 — Barrio CRM Standard V1
**Aprobado:** [Definición operativa, entrega y capacitación de Barrio CRM Standard V1](./VECIDYA_BARRIO_CRM_STANDARD_V1.md). Prevalece como detalle de Barrio sobre descripciones genéricas anteriores.
- Barrio USD 59/mes + USD 10 de alta estándar; hereda Cuadra, pero **CRM para una sola organización**. Cuadra USD 39/mes; diferencia +USD 20/mes, no se suman mensualidades.
- Incluye subcuenta aislada (sujeta a capacidad GHL), identidad, roles, contactos, segmentación, oportunidades, pipeline comercial principal, formulario, calendario si aplica, tareas, workflows internos estándar, indicadores, conversaciones de canales realmente habilitados, capacitación básica y pruebas de entrega.
- **No se cobran como addons** las funciones CRM estándar del recorrido comercial. No imponer topes ficticios de usuarios, contactos o workflows.
- El propietario y equipo operan CRM según permisos; Vecidya supervisa configuración estructural, integraciones y workflows críticos. Roles efectivos pendientes de prueba.
- **Ciudad todavía por definir en detalle y aprobar**: hereda Barrio y diferencia procesos operativos coordinados (incorporación, atención, reactivación, renovaciones, asignación). Precio previamente aprobado USD 89/mes + USD 15 de alta; diferencia +USD 30/mes respecto a Barrio.
- **Addons y servicios:** consultar [matriz de separación CRM/addons/servicios V1](./VECIDYA_CRM_ADDONS_SERVICIOS_MATRIZ_V1.md); precios de addons, consumos y SLA no aprobados.
- **Capacidad GHL:** Starter de referencia admite hasta 3 subcuentas totales de agencia, no por cliente; validar condiciones y cuenta real. Las 3 organizaciones de Vecidya no son 3 subcuentas GHL. Sin despliegue ni aprovisionamiento certificado.

## Pendientes que NO se deben presentar como aprobados
- Tratamiento exacto de capacidad y precio cuando se compran **licencias CRM adicionales** para organizaciones existentes: no asumir que cada CRM adicional añade tres espacios ni que se cobra una nueva capacidad.
- Acumulación y coexistencia de planes, propiedad y transferencia de organizaciones, reutilización de espacios tras bajas, asignación/reasignación CRM.
- Prorrateos, upgrades, downgrades, impuestos, cancelación, reembolsos, exportación/retención, SLA, límites técnicos MiniWeb, consumos de proveedor.
- Validación E2E de Cuadra y publicación, Barrio Standard, módulos Ciudad, compras de ampliación, permisos/aislamiento y aprovisionamiento GHL.

**Control documental:** reflejar estas reglas en web, app, administración, checkout, contratos, onboarding y fichas comerciales una vez aprobadas las políticas pendientes. Mantener la separación entre decisión de producto, desarrollo local y certificación desplegada.

## Changelog
- 2026-11-07 V2: regla de tres organizaciones, una MiniWeb por negocio, ampliación Cuadra +3, CRM por organización, herencia y matriz de pendientes.

- 2026-11-09: Barrio CRM Standard V1 aprobado; matriz de addons/servicios y limitaciones GHL vinculadas; Ciudad pendiente de detalle.
