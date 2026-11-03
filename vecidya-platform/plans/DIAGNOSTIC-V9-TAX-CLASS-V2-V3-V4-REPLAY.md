# Diagnóstico V9 — TAX-CLASS: puente verificable v2 → v3 → v4
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Referencias inspeccionadas
- qbv2-reviewed-classification.ts, blob 8807cbe1b920923e667b7afb9b64df350b35ae95.
- qa03b/bank.ts, blob b4772d73e1d8b5044ba2011088db978c364097f0.
- qa03b/specialty-candidate-bank.ts, blob 0bc44cddc1dc2f03230bd5ece30847fce984a12b.

## Evolución verificada
| Versión | Fuente | Composición comprobable | Observación |
| --- | --- | --- | --- |
| v2 reviewed | qbv2-reviewed-classification.ts | 14 categorías concretas + other | Cada categoría concreta produce nicheGroup explícito; other produce nicheGroupOther |
| v3 QA03B | qa03b/bank.ts | opciones de historicalBank(q2_sector) + unknown | unknown tiene kind=unknown y no produce nicheGroup |
| v4 candidato | qa03b/specialty-candidate-bank.ts | opciones de QA03B_EDITORIAL_BASE_QUESTIONS_V9, excluye other/unknown, añade ecommerce/creator/b2b_services/nonprofit_community, repone other/unknown | Es candidato aislado, no ruta pública |

IMPORTANTE: el conteo de 20 opciones v4 (15 reviewed + unknown + 4) es una expectativa condicionada a que el banco histórico/editorial conserve las 15 opciones de v2 sin otras modificaciones. No se ha verificado dinámicamente la composición final ni el inventario de historicalBank. El documento anterior TAX-CLASS-VALUE-BRIDGE hablaba de 19 opciones esperadas y omitía el unknown de v3: **corrección documental pendiente de incorporar**; no declarar 19 como resultado certificado.

## Fuentes separadas para atributos
- q2_sector: declaración de grupo de actividad; no es evidencia de digitalización.
- q2_delivery v4: lista de modalidades explícitas physical_location, appointments, travels, remote_service, retail, onsite y online_checkout; otras opciones son other/unsure. En el código examinado remote_service no incluye produces, por lo que no debe asumirse que crea una señal estructurada equivalente a las demás.
- q2_customer_buyer v3: b2c, b2b, mixed, no_direct_purchase, unknown. no_direct_purchase no equivale a b2c ni b2b.
- q2_monetization v3: monetización declarada y no_revenue_yet; etapa prelaunch cambia el copy y no demuestra ingresos actuales.
- q2_entity v3: individual, business, organization, project, unknown.

## Contrato de preservación
1. Guardar questionId + questionVersion + answerValue originales.
2. Distinguir declaración explícita de atributo inferido; no convertir unknown, unsure u other en un valor concreto.
3. Mantener guardias legadas hasta migrar sus consumidores; validar edición y replay por versión.
4. No tratar online_checkout previsto en prelaunch como checkout operativo.
5. No derivar consentimiento de marketing o capacidad digital desde sector, modalidad o monetización.
6. La ausencia de produces en una opción obliga a revisar el mapper real antes de afirmar que existe contexto derivado.

## Validaciones focales futuras (no ejecutadas)
- Clasificación v2, v3, v4: identidad de values, unicidad y compatibilidad de unknown/other.
- Negocio retail + ecommerce; creator con sector distinto; organización comunitaria sin donaciones.
- Cambio de sector y replay de ocho selectores, agencia, gastronomía y cinco ADD.
- Delivery remoto sin produces: comprobar que el sistema no lo interpreta falsamente como señal estructurada.
- Prelaunch con checkout previsto: evitar evidencia de compra digital actual.

## Estado
CLASS-02 PARCIAL: evolución v2→v3→v4 y fuentes explícitas identificadas. Falta inventario completo del historicalBank, reglas de mapping reales, consumidores externos y pruebas focales autorizadas. No se ejecutaron tests ni se modificó runtime.

## Changelog
0.1.0: puente versionado y advertencia de conteo previo sin certificación.
