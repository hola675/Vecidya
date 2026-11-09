# VECIDYA — Ciudad CRM Standard V1 (APROBADO)
**Fecha:** 2026-11-09. **Estado:** producto y biblioteca funcional APROBADOS; implementación y pruebas reales GHL PENDIENTES. Este documento complementa Barrio CRM Standard V1 y el modelo de licencias V2.

## 1. Licencia y herencia
**Ciudad USD 89/mes, activación estándar USD 15 una sola vez.** Incluye íntegramente Cuadra y Barrio; no se suman cuotas. Diferencia respecto a Barrio: USD 30/mes. Contratación inicial: **hasta tres organizaciones Vecidya**, **una MiniWeb por organización**, Vecindario; **CRM Ciudad para una única organización expresamente asignada**. Otra organización con CRM requiere licencia propia; ampliación Cuadra (+3 espacios) no añade CRM.

## 2. Decisión aprobada sobre la biblioteca
**Los seis módulos estándar están INCLUIDOS en la biblioteca Ciudad y pueden activarse según las necesidades del negocio, sin cargo adicional por módulo estándar.** No es obligatorio activarlos todos al inicio. La selección, configuración y habilitación de módulos aplicables forman parte de la entrega estándar, sujetas a capacidades y pruebas del proveedor. No confundir «incluido en derecho comercial» con «activado técnicamente» o «certificado en producción».

| Módulo incluido | Entrega estándar y propósito |
|---|---|
| 1. Ventas y oportunidades | Hereda el proceso comercial Barrio y prepara traspasos cuando una venta se gana |
| 2. Incorporación/onboarding | Etapas, requisitos, tareas y responsables para comenzar la relación/servicio |
| 3. Atención y seguimiento | Solicitudes/incidencias, estados, prioridad, asignación y resolución estándar |
| 4. Reactivación | Segmentos de inactividad, listas y tareas de recuperación; contacto externo sujeto a canal y consentimiento |
| 5. Renovaciones | Fechas de vencimiento, seguimiento, tareas y avisos internos |
| 6. Asignación y coordinación | Traspasos entre áreas, responsables, tareas y visibilidad entre procesos |

## 3. Automatizaciones internas incluidas
- Venta ganada → preparar/abrir incorporación y asignar responsable, si aplica.
- Incorporación pendiente → crear tarea y seguimiento.
- Solicitud recibida por fuente configurada → registrar caso y asignarlo.
- Inactividad detectada según reglas del negocio → segmentar y generar revisión/tarea.
- Renovación próxima → crear aviso/tarea interna.
- Traspaso entre responsables → actualizar asignación y próximos pasos.

Los workflows deben ser idempotentes o protegerse contra duplicados, reejecuciones y bucles; documentar disparadores, condiciones, excepciones y acciones. No afirmar que GHL ejecuta estas reglas sin configurarlas y probarlas.

## 4. Accesos y capacitación
- Propietario/dirección: indicadores comerciales y operativos, procesos, responsables y pendientes, conforme a permisos.
- Comercial: contactos, oportunidades, citas, traspasos autorizados.
- Operaciones: incorporación y tareas asignadas.
- Atención: solicitudes, seguimiento y resolución.
- Administración: renovaciones y vencimientos autorizados.
- Vecidya: configuración estructural, workflows críticos, integraciones, seguridad y control de cambios.
Una persona puede cubrir varios perfiles. Verificar permisos reales y aislamiento en GHL; nunca otorgar acceso de agencia a clientes.

**Capacitación estándar incluida** para operar los módulos activados: dirección, traspasos, incorporación, atención, reactivación, renovaciones y coordinación; conserva la capacitación Barrio. Duración, soporte y SLA por definir; formación extraordinaria es servicio profesional.

## 5. Plantilla maestra y pruebas
**Plantilla objetivo:** `VECIDYA_CIUDAD_CRM_V1`, basada en `VECIDYA_BARRIO_CRM_V1`, con módulos estándar seleccionables, campos/estados, tareas, workflows de coordinación, roles y paneles según disponibilidad real. Usar snapshots cuando proceda; no copiar datos/historial como si fueran parte de una plantilla.

**Checklist E2E:** base Barrio sin duplicación; módulos aplicables; venta→incorporación; solicitud→resolución; inactividad→tarea; renovación→aviso; traspasos; permisos; informes separados; prevención de duplicados/bucles; capacitación; acta de aceptación. **No todo proceso operativo debe tratarse como venta:** comprobar modelado en GHL para no contaminar informes comerciales.

## 6. Frontera comercial
- **Barrio:** un proceso comercial principal, independientemente de cantidad de contactos, usuarios, formularios o workflows estándar.
- **Ciudad:** dos o más procesos operativos diferenciados que requieren coordinación, traspasos y responsables. Seis módulos estándar incluidos en biblioteca, se activan cuando corresponda.
- **Addons:** WhatsApp, telefonía/SMS, envío email, campañas, reputación automatizada, IA conversacional/de voz e integraciones externas, con fees y consumos según acuerdo.
- **Servicios profesionales:** ERP/integraciones especiales, migraciones complejas, sistemas de tickets especializados, desarrollos web/IA a medida, campañas gestionadas, operación delegada y capacitación extraordinaria.
- **Sin doble cobro:** módulos Ciudad y sus automatizaciones internas estándar no se revenden como addons ni como proyectos a medida.
- **Sin cupos ficticios** de contactos, usuarios, pipelines o workflows; límites reales del proveedor y alcance contractual aplican.

## 7. Dependencias, límites y pendientes
GHL Starter de referencia tiene hasta 3 subcuentas de agencia en total, independientes de las tres organizaciones Vecidya; verificar disponibilidad, precios, capacidades y permisos actuales. Una organización de cliente independiente con CRM requiere aislamiento de subcuenta. El catálogo comercial no equivale a aprovisionamiento técnico, despliegue o pruebas certificadas.

Pendientes: verificar roles y visibilidad; diseño exacto de registros operativos vs oportunidades comerciales; prueba de snapshots/workflows/reportes; capacidad GHL; precios y condiciones de addons, consumos y servicios; políticas de licencias CRM adicionales, upgrade/downgrade, soporte, cancelación y datos.

## Referencias internas
- [Barrio CRM Standard V1](./VECIDYA_BARRIO_CRM_STANDARD_V1.md)
- [Licencias y organizaciones V2](./VECIDYA_LICENCIAS_ORGANIZACIONES_CRM_V2.md)
- [Matriz de licencias, addons y servicios](./VECIDYA_CRM_ADDONS_SERVICIOS_MATRIZ_V1.md)
- [Catálogo comercial](./VECIDYA_PRODUCT_CATALOG.md)

## Changelog
- 2026-11-09 V1: aprobado Ciudad y sus seis módulos incluidos en biblioteca; activación según necesidad, sin recargo por módulo estándar.
