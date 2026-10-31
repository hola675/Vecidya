# V9 — CLASS-02: fuentes de entidad, monetización, entrega y comprador
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Inspección focal
Fuente qa03b/bank.ts, blob b4772d73e1d8b5044ba2011088db978c364097f0, líneas 15–115. Se revisan definiciones candidatas, no se certifica activación pública.

| Pregunta | Respuestas relevantes | Producción observada | Precaución |
|---|---|---|---|
| q2_entity v3 | individual, business, organization, project, unknown | entity para las primeras cuatro; unknown sin produces | La respuesta describe forma declarada, no personalidad jurídica verificada |
| q2_delivery v4 | physical_location, appointments, travels, retail, onsite, online_checkout | deliveryMode component | No inferir ventas digitales de prestación remota |
| q2_delivery v4 | remote_service | ninguna | Respuesta conservada, pero no canonical deliveryMode |
| q2_delivery v4 | other, unsure | deliveryClassification=other/unsure | Son clasificaciones, no componentes de modalidad |
| q2_monetization v3 | services, goods, commission, audience, recurring, mission | Hereda opciones de banco histórico; comprobar sus produces en origen | Fuente principal declarada, no ingreso demostrado |
| q2_monetization v3 | no_revenue_yet | sin produces, kind=none | No equivale a empresa inexistente |
| q2_customer_buyer v3 | b2c, b2b, mixed | customerBuyer explícito | Comprador directo no siempre es usuario final |
| q2_customer_buyer v3 | no_direct_purchase, unknown | sin produces | No deducir destinatario ni modelo de ingresos |

## Restricciones por contexto temporal
Las variantes prelaunch de q2_delivery y q2_monetization cambian las preguntas a formas planeadas o esperadas. Una respuesta declarada en preparación no demuestra implementación efectiva. La separación de etapa debe acompañar cualquier lectura de modalidad o monetización.

## Consecuencias para CLASS-02
- naturalezaEntidad: q2_entity permite una forma declarada, no prueba registro legal.
- modeloComercial: q2_monetization es candidato para fuente de ingresos, pero se debe inspeccionar la producción heredada antes de cerrar el mapa.
- canalOperacion: q2_delivery aporta componentes concretos; remote_service requiere representación separada si se desea usar como atributo.
- destinatario: q2_customer_buyer aporta comprador directo; no confundir con alcance geográfico ni beneficiario.
- etapaOperativa: esta inspección solo muestra variantes prelaunch; falta identificar la pregunta y señal primaria de etapa.

## Pendientes
Verificar definición histórica literal de q2_monetization, fuente de actividad/etapa y consumo de señales; revisar no_direct_purchase y remote_service sin inventar señales. CLASS-02 continúa parcial, sin aprobación de implementación.

## Changelog
0.1.0: trazabilidad de cuatro preguntas candidatas y límites de sus señales.