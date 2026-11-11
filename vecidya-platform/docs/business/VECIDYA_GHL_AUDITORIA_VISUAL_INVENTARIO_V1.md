# VECIDYA — Inventario de auditoría visual GHL V1

**Fecha:** 2026-11-11. **Estado:** auditoría en curso, solo observacional. **Evidencia E01:** captura enviada por el responsable de Vecidya del panel **Agency View > Subcuentas**, imagen de conversación `image(20261111-173655).png`. Contiene datos privados de negocios: el inventario registra únicamente los nombres y hechos necesarios, no teléfonos, direcciones ni identificadores personales.

## Regla de evidencia y clasificación
- **VISIBLE:** elemento mostrado en la captura; NO implica contratación, licencia SaaS, configuración ni funcionamiento.
- **OFICIAL:** característica respaldada por documentación publicada por GHL; no implica habilitación en esta cuenta.
- **PENDIENTE DE INSPECCIÓN:** no se ha examinado la pantalla específica.
- **PROBADO:** únicamente tras evidencia funcional E2E; no existen elementos probados todavía.
- **PROPUESTA COMERCIAL:** posible relación con Cuadra/Barrio/Ciudad/addons/servicios; no modificar las decisiones aprobadas sin consentimiento.

## E01 — Agencia > Subcuentas

### Evidencias directas
1. Se observa interfaz de **Agencia**, sección **Subcuentas**.
2. Encabezado indica **2 Subcuentas**; aparecen **Exterminaya** y **Vecidya**.
3. Ambas incluyen acción **Cambiar a subcuenta**; también se ve **Crear Subcuenta**. La existencia del botón **no certifica** que el plan permita crear otra ni que su provisión sea exitosa.
4. Ambas tienen etiqueta **«Cerrado (Ganado)»**; no permite deducir estado contractual, implantación CRM, cobros o automatizaciones.
5. Vecidya muestra «Último inicio de sesión: N/A». No demuestra inactividad total ni falla técnica.
6. Barra lateral muestra estas 18 entradas: AI Suite; Pregúntale a la IA; Tablero de la agencia; Prospección; Subcuentas; Instantáneas de la cuenta; Reventa; Complementos; Portal de afiliados; Biblioteca de plantillas; Socios; Universidad; Educación en SaaS; Swag de GHL; Ideas; Aplicación móvil; Aplicación de escritorio (texto truncado); Aplicaciones del mercado; además de **Configuración** abajo.
7. **No se observa una entrada rotulada «SaaS Configurator»** en esta vista. **Reventa** y **Educación en SaaS** no acreditan SaaS Mode habilitado. Podría estar restringido por plan, experiencia UI, permisos u otra causa: por verificar.

### Inventario acumulativo — primera sección
| ID | Elemento | Posible utilidad Vecidya | Evidencia de cuenta | Estado de prueba | Siguiente verificación |
|---|---|---|---|---|---|
| GHL-AG-001 | Agency View / Subcuentas | Aislar negocios con CRM Barrio/Ciudad | VISIBLE: 2 | NO PROBADO | Plan real, capacidad, aislamiento |
| GHL-AG-002 | Crear subcuenta | Onboarding CRM | VISIBLE: botón | NO PROBADO | Elegibilidad y flujo sin crear cuenta |
| GHL-AG-003 | Cambiar a subcuenta | Acceso al CRM de negocio | VISIBLE: botón | NO PROBADO | Inspeccionar después con autorización |
| GHL-AG-004 | Instantáneas de la cuenta | Plantillas Barrio/Ciudad | VISIBLE: menú | NO PROBADO | Inventario de snapshots y límites |
| GHL-AG-005 | Reventa | Addons y cargos | VISIBLE: menú | NO PROBADO | Pantalla y disponibilidad real |
| GHL-AG-006 | Complementos | Suscripciones/costos externos | VISIBLE: menú | NO PROBADO | Ver qué está contratado |
| GHL-AG-007 | AI Suite | IA opcional | VISIBLE: menú | NO PROBADO | Modelos, restricciones, usos |
| GHL-AG-008 | Prospección | Servicio o addon diferenciado | VISIBLE: menú | NO PROBADO | Elegibilidad y costes |
| GHL-AG-009 | Aplicaciones del mercado | Integraciones | VISIBLE: menú | NO PROBADO | Accesos, APIs, licencias |
| GHL-AG-010 | Configuración | Plan, facturación, permisos | VISIBLE: menú | NO PROBADO | Captura E02 solo de navegación |
| GHL-AG-011 | SaaS Configurator | Potencial futuro SaaS, upgrades | NO VISIBLE en E01; OFICIAL | NO PROBADO | Confirmar plan y acceso |
| GHL-AG-012 | Biblioteca de plantillas | Recursos y reutilización | VISIBLE: menú | NO PROBADO | Diferenciar de snapshots |

### Contraste con documentación oficial (consultado 2026-11-11)
- Tarifas publicadas: Starter USD 97/mes y 3 subcuentas; Unlimited USD 297/mes y subcuentas ilimitadas, rebilling teléfono/email sin markup; plan superior USD 497/mes incluye modalidad SaaS y otras funciones según edición comercial vigente. **No se conoce el plan real de esta cuenta**. https://www.gohighlevel.com/pricing
- SaaS Configurator gestiona planes, características, snapshots, addons y facturación, incluyendo las arquitecturas SaaS V1/V2; la documentación **no prueba activación en esta cuenta**. https://help.gohighlevel.com/support/solutions/articles/155000008015-getting-started-with-the-saas-configurator
- Reventa tiene opciones separadas para suscripciones/consumos/marketplace, dependientes de la UI y producto. https://help.gohighlevel.com/support/solutions/articles/155000008356-unified-reselling-experience-in-highlevel-wallet

### Clasificación comercial preliminar
- **Cuadra:** no requiere GHL; las 3 organizaciones Vecidya y sus MiniWeb no son subcuentas GHL.
- **Barrio:** proceso comercial estándar **para una organización** en una subcuenta GHL aislada, sujeto a verificación.
- **Ciudad:** hereda Barrio + biblioteca de seis módulos estándar incluida, activados según necesidad, sin recargo; sujeto a verificación de permisos y modelado CRM.
- **Addons:** WhatsApp, IA, SEO/listados y otros según tarifas Vecidya aprobadas; cuota del addon separada del consumo real.
- **Servicios:** implementación extraordinaria/integraciones y operación especializada fuera del estándar, presupuesto individual.
- Mantener **facturación externa** hasta contratación de GHL Unlimited y evaluación real del rebilling; no asumir SaaS Configurator en Unlimited.

### Incertidumbres y restricciones
- Sin pantalla de facturación/plan **no se identifica Starter/Unlimited/otro**.
- Dos subcuentas visibles no garantizan derecho a crear una tercera.
- No comprobados contratos, permisos, facturación, snapshots, workflows, canales ni aislamiento.
- No hacer cambios, crear subcuentas, habilitar reventa/SaaS ni comprar planes durante la auditoría.

### Próxima evidencia E02
**Agency View > Configuración**, mostrar navegación/menú del área de configuración, sin abrir formas de pago ni mostrar credenciales. Objetivo: localizar datos de plan, facturación y permisos, y luego definir una inspección puntual.

## Changelog
- **2026-11-11 V1:** inicio de inventario acumulativo, auditoría de captura E01 y selección de E02.
