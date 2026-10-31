# V9 — CLASS-02: fuentes explícitas de atributos y límites
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Evidencia inspeccionada
El módulo qbv2-reviewed-classification.ts contiene tres preguntas: q2_sector, q2_customer_reach y q2_customer_buyer. Se inspeccionaron las opciones y sus produces; esta lista no equivale al inventario exhaustivo de todos los bancos.

| Pregunta | Valores declarables | kind producido | Atributo confirmado |
|---|---|---|---|
| q2_sector v2 | 14 sectores, other | nicheGroup / nicheGroupOther | Grupo declarado, no modelo ni canal |
| q2_customer_reach v2 | local, regional, national, global, mixed | customerReach | Alcance geográfico de destinatarios, NO canal de operación |
| q2_customer_buyer v2 | b2c, b2b, mixed | customerBuyer | Tipo de destinatario, NO modelo de ingresos |

## Matiz de elegibilidad
q2_customer_reach tiene appliesWhen=contextIn(activity,[active,prelaunch]); su presencia depende de contexto de actividad. q2_customer_buyer no muestra appliesWhen en la definición focal revisada. Esto no demuestra que se formulen siempre en el banco público.

## Matriz de fuentes para CLASS-02
| Atributo propuesto | Fuente inspeccionada que lo confirma | Pendiente |
|---|---|---|
| sectorActividad | q2_sector: grupo declarado, con semántica mixta | Confirmar actividad específica |
| modeloComercial | Ninguna de estas tres preguntas | Revisar q2_monetization y demás definiciones reales |
| canalOperacion | Ninguna de estas tres preguntas | Revisar q2_delivery y señales deliveryMode |
| naturalezaEntidad | Ninguna de estas tres preguntas | Identificar pregunta explícita y distinguir contexto de variantes |
| etapaOperativa | Ninguna de estas tres preguntas | Identificar señal activity explícita |
| destinatario | q2_customer_buyer confirma b2c/b2b/mixed | No confundir con customerReach |

## Restricciones
- customerReach=global no demuestra comercio electrónico ni canal remoto.
- customerBuyer=b2b no demuestra suscripción, venta recurrente o empresa legalmente constituida.
- Una variante de redacción condicionada por businessModel/entityType no es evidencia de que la respuesta produzca esos atributos.
- No mapear sector=ecommerce a checkout confirmado ni sector=nonprofit_community a entidad sin fines de lucro confirmada.
- No activar CLASS-02 ni migrar datos con esta matriz parcial.

## Evidencia estática
qbv2-reviewed-classification.ts SHA 8807cbe1b920923e667b7afb9b64df350b35ae95, líneas 7–83; specialty-candidate-bank.ts SHA 0bc44cddc1dc2f03230bd5ece30847fce984a12b.

## Estado y siguientes comprobaciones
CLASS-02 sigue en borrador: faltan las fuentes concretas de modelo, canal, naturaleza y etapa; comprobar los bancos y los consumidores de signals antes de aprobar puente. No se ejecutaron pruebas ni se modificó código.

## Changelog
0.1.0: inventario focal de fuentes de grupo, alcance y comprador; separación de atributos sin inferencias.