# V9 — CLASS-02: puente conservador de atributos
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Contrato
Separar sectorActividad, modeloComercial, canalOperacion y naturalezaEntidad, además de etapaOperativa y destinatario, sin inferir un atributo exclusivamente desde otro. Mantener questionId, version y oldValue en cualquier migración futura.

## Matriz oldValue → atributos confirmables
La columna categoría declarada registra literalmente la respuesta; no confirma que sea un sector económico puro. Ninguna categoría por sí sola prueba modelo comercial, canal, entidad, etapa o destinatario.

| oldValue | Categoría declarada | Modelo comercial | Canal operación | Naturaleza entidad | Etapa | Destinatario |
|---|---|---|---|---|---|---|
| health_wellness | Categoría declarada: health_wellness | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| beauty_personal_care | Categoría declarada: beauty_personal_care | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| legal | Categoría declarada: legal | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| financial_tax_insurance | Categoría declarada: financial_tax_insurance | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| professional_services | Categoría declarada: professional_services | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| home_services | Categoría declarada: home_services | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| automotive | Categoría declarada: automotive | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| real_estate | Categoría declarada: real_estate | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| food_hospitality | Categoría declarada: food_hospitality | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| retail | Categoría declarada: retail | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| education_coaching | Categoría declarada: education_coaching | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| creative_media | Categoría declarada: creative_media | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| technology_software | Categoría declarada: technology_software | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| community_social | Categoría declarada: community_social | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| other | Fuera de catálogo | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| unknown | Desconocido | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| ecommerce | Categoría declarada: ecommerce | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| creator | Categoría declarada: creator | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| b2b_services | Categoría declarada: b2b_services | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |
| nonprofit_community | Categoría declarada: nonprofit_community | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar | Sin confirmar |

## Distinciones obligatorias
- other: produce nicheGroupOther=true, declaración fuera de catálogo; no equivale a unknown.
- unknown: no produce señal de clasificación.
- ecommerce: no inferir checkout ni pago digital solo por etiqueta.
- creator: no inferir monetización por audiencia.
- b2b_services: no inferir comprador B2B sin confirmación independiente; preservar selector especializado.
- nonprofit_community: no inferir forma jurídica, donación o membresía.
- retail: no inferir venta exclusivamente física ni online.
- technology_software: no inferir etapa startup ni venta B2B.
- food_hospitality: no equiparar reservas de mesa, alojamiento y citas.

## Gates pendientes
CLASS-02 requiere decisión explícita sobre esquema de atributos, fuentes de confirmación, preservación de respuestas y puente de elegibilidad. Esta tabla es propuesta documental, no implementación ni aprobación. CLASS-01 permanece parcial.

## Evidencia
qbv2-reviewed-classification.ts blob 8807cbe1b920923e667b7afb9b64df350b35ae95; qa03b/bank.ts blob b4772d73e1d8b5044ba2011088db978c364097f0; qa03b/specialty-candidate-bank.ts blob 0bc44cddc1dc2f03230bd5ece30847fce984a12b; DIAGNOSTIC-V9-TAX-CLASS-COMPATIBILITY.md.

## Changelog
0.1.0: matriz exhaustiva de veinte values y reglas anti-inferencia.