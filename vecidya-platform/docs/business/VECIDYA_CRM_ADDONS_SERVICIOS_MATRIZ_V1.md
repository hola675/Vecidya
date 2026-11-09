# Vecidya — Matriz CRM, addons, consumos y servicios V1

> **Política de addons aprobada (2026-11-09):** [VECIDYA_ADDONS_PRICING_V1.md](./VECIDYA_ADDONS_PRICING_V1.md). Recargo estándar **25 %** sobre cuota base verificable del addon, ajustable **20–30 %**; **consumos adicionales separados y cobrados según uso real**, sin recargo automático del 25 % sobre consumo. Las tarifas individuales de nueve addons del catálogo operativo V1 están aprobadas; verificar disponibilidad y costes reales antes de activar.

> **Ciudad aprobado 2026-11-09:** [Ciudad CRM Standard V1](./VECIDYA_CIUDAD_CRM_STANDARD_V1.md). Los **seis módulos estándar** (ventas, incorporación, atención, reactivación, renovaciones y coordinación) están **incluidos en la biblioteca de Ciudad** y se **activan según corresponda al negocio, sin recargo por módulo estándar**. La aprobación es comercial/funcional; implementación GHL y pruebas E2E pendientes. Cualquier mención anterior a «Ciudad pendiente de aprobación/detalle» queda reemplazada por esta decisión; permanecen pendientes validaciones técnicas y políticas contractuales.
**Fecha:** 2026-11-09. **Estado:** clasificación comercial de trabajo; Barrio y Ciudad APROBADOS; nueve tarifas de addons aprobadas, precios de servicios profesionales por cotizar; implementación GHL NO certificada.

## 1. Cuatro conceptos que nunca se mezclan
| Categoría | Qué paga el cliente | Regla |
|---|---|---|
| Licencia Cuadra / Barrio / Ciudad | Derecho funcional recurrente de Vecidya | No duplicar funciones heredadas |
| Addon | Capacidad adicional opcional, normalmente por organización | No cobrar como addon lo ya incluido en Barrio/Ciudad |
| Consumo de proveedor | Mensajes, minutos, emails, números, IA, anuncios, acciones premium | Separar del precio del addon; verificar tarifas y país |
| Servicio profesional | Trabajo humano extraordinario con alcance y entregables | No cobrar configuración estándar incluida como proyecto a medida |

## 2. Matriz de licencias
| Elemento | Cuadra USD 39/mes; alta USD 0 | Barrio USD 59/mes; alta USD 10 | Ciudad USD 89/mes; alta USD 15 |
|---|---|---|---|
| Capacidad inicial Vecidya | 3 organizaciones | 3 organizaciones | 3 organizaciones |
| MiniWeb / Vecindario | 1 por organización | Hereda Cuadra | Hereda Cuadra |
| CRM asignado a organización | No | 1 organización | 1 organización |
| Contactos, segmentación, notas | No | Incluido | Heredado |
| Pipeline, oportunidades, tareas | No | Incluido para proceso comercial principal | Heredado |
| Formulario, calendario si aplica | No | Incluido estándar | Heredado |
| Workflows internos del proceso | No | Incluidos | Heredados |
| Indicadores comerciales, formación básica | No | Incluidos | Heredados |
| Onboarding/atención/reactivación/renovación/coordinación como procesos diferenciados | No | No | Seis módulos estándar incluidos, activables según necesidad sin recargo |
| Cuarta organización | Cuadra adicional: +3 espacios | Cuadra adicional: +3 espacios | Cuadra adicional: +3 espacios |

**Cuadra adicional no da CRM.** CRM Barrio/Ciudad por organización; la política sobre si una compra CRM adicional afecta capacidad de organizaciones permanece pendiente. No confundir organización Vecidya con subcuenta GHL.

## 3. Addons opcionales (tarifas de nueve productos aprobadas; otros conceptos por uso o cotización)
| Addon | Barrio | Ciudad | Costes y dependencias |
|---|---|---|---|
| WhatsApp CRM | Opcional | Opcional | Habilitación, conversaciones/plantillas, tarifas Meta/GHL, consentimiento |
| Telefonía CRM | Opcional | Opcional | Número, minutos, proveedor, regulación por país |
| SMS | Opcional | Opcional | Segmentos, operadora, consentimiento |
| Email de envío | Opcional según uso/alcance | Opcional según uso/alcance | Envíos, dominios, reputación; no confundir con fichas de contacto |
| Campañas/difusión | Opcional | Opcional | Canal, envíos, anuncios; operación gestionada es servicio |
| Reputación/reseñas automatizadas | Opcional | Opcional | Canal/envíos; sin fabricar reseñas |
| IA conversacional | Opcional | Opcional | Modelo, mensajes, supervisión, transferencia humana |
| IA de voz | Opcional | Opcional | Número, minutos, modelos, pruebas |
| Integración estándar de tercero | Según compatibilidad | Según compatibilidad | Fee/API/acciones premium; desarrollo excepcional = servicio |
| Herramientas SEO/marketing externas | Según producto | Según producto | Licencia externa y operación separada |

**No son addons:** etiquetas, campos necesarios, formulario comercial, pipeline, tareas, calendario aplicable, automatización interna estándar, reportes comerciales de Barrio. Los módulos estándar Ciudad tampoco deben refacturarse.

## 4. Servicios profesionales (precios y alcance por cotizar)
- Migración, limpieza y mapeo de datos históricos complejos.
- Diseño y construcción de procesos fuera del recorrido Barrio o biblioteca estándar Ciudad.
- Integraciones a medida con ERP, sistemas externos y APIs.
- Diseño web distinto de MiniWeb estándar; marca y contenidos.
- Campañas administradas, estrategia publicitaria y optimización.
- Agentes de IA personalizados y bases de conocimiento complejas.
- Capacitación adicional y operación delegada del CRM.
- Consultoría de procesos, diagnóstico e implementación extraordinaria.

**Ejemplo:** workflow interno de asignación en Barrio = incluido; WhatsApp = addon y consumo; integración especial WhatsApp–ERP = servicio profesional adicional. No doble facturación de configuración estándar.

## 5. Recomendación de licencia
- Cuadra: presencia digital, sin gestión de oportunidades.
- Barrio: un proceso comercial principal; cantidad de contactos, usuarios o workflows no obliga a Ciudad.
- Ciudad: segundo proceso diferenciado y traspasos entre ventas y operaciones/atención/onboarding/renovaciones/reactivación; WhatsApp o IA por sí solos no obligan a subir.

## 6. Restricción GHL Starter y responsabilidades
GHL Starter de referencia: USD 97/mes, hasta 3 subcuentas totales para la agencia; NO 3 por organización ni por cliente. Cada negocio independiente con CRM debe tener subcuenta aislada; no mezclar tenants. Comprobar permisos, capacidades, facturación de uso y posibilidad real de implementar y controlar derechos. Plan Unlimited de referencia USD 297/mes: evaluar para escalar; confirmar tarifas vigentes antes de presupuestar.

El catálogo no certifica aprovisionamiento, snapshots, workflows, roles, canales ni operación productiva. No modificar código ni GHL basándose solo en este documento.

## 7. Pendientes de decisión
1. Ciudad: diseño comercial aprobado; quedan implementación, permisos y pruebas estándar.
2. Tarifas individuales de nueve addons aprobadas y recargo 25 % estándar; verificar impuestos, país, soporte y coste real.
3. Políticas de licencia CRM adicional y capacidad de organizaciones; upgrade/downgrade, prorrateo, baja, datos y SLA.
4. Verificación GHL Starter con subcuentas de prueba, seguridad, roles, snapshots y coste real.
5. Condiciones de cada servicio profesional, contrato y criterios de aceptación.

## Referencias
- [Barrio CRM Standard V1 — aprobado](./VECIDYA_BARRIO_CRM_STANDARD_V1.md)
- [Modelo de licencias V2](./VECIDYA_LICENCIAS_ORGANIZACIONES_CRM_V2.md)
- [Catálogo comercial](./VECIDYA_PRODUCT_CATALOG.md)
- https://www.gohighlevel.com/pricing
- https://help.gohighlevel.com/

## Changelog
- 2026-11-09 V1: matriz de licencias, addons, consumos, servicios y pendientes; Barrio y Ciudad aprobados; tarifas de nueve addons aprobadas; implementación pendiente.
