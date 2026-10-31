# V9 — CLASS-02: consumidores de monetización y censo secundario focal
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Contrato de impacto de señales
qbv2-signals.ts blob 3563ae11c8e385067c240c52cfb741192a67ccba define SIGNAL_PRODUCTION_CONTEXT_FIELD: monetizationMechanism, monetizationClassification y legacyLicensedClassification afectan businessModel. signalProductionContextFields agrega audienceMonetization para monetizationMechanism. Esto es un contrato de impacto, no prueba de que cada campo siempre se resuelva.

## Consumidores directos confirmados
| Consumidor | Fuente | Regla |
|---|---|---|
| resolveBusinessModel | context-resolver.ts líneas 135–156 | Primario resuelve modelo; secundario independiente permite hybrid |
| resolveAudienceMonetization | context-resolver.ts líneas 194–203 | Busca own_audience_monetization entre primario y secundario materiales |
| foldSignalProductions | qbv2-signals.ts líneas 175–269 | Slot primary y secondary se asignan a campos escalares separados, con arbitraje por procedencia y questionId |

## Censo de productores: alcance comprobado
En qbv2-reviewed-foundation.ts blob ceb66e18d16a1521bef7f5fa82d74782464866d2, q2_monetization produce seis mecanismos slot=primary y ninguno slot=secondary. qa03b/bank.ts blob b4772d73e1d8b5044ba2011088db978c364097f0 hereda esas opciones y añade no_revenue_yet sin produces. Esto NO demuestra ausencia de productores secundarios en otros módulos; el censo completo del repositorio está pendiente.

## Escenarios focales para futura autorización
| Caso | Resultado que debe verificarse |
|---|---|
| Primario audience | audienceMonetization resuelto |
| Secundario audience material, primario no audience | audienceMonetization resuelto |
| Primario y secundario iguales | No hybrid |
| Secundario audience débil/no material | No resolver audienceMonetization por esa señal |
| Sin primario, secundario audience material | Resolver audienceMonetization según regla propia, sin inventar businessModel primario |
| Dos productores secondary en conflicto | Ganador determinista; auditar pérdida de procedencia |

## Dictamen y próximos gates
CLASS-02 no certificado. Pendientes: censo completo de producers slot=secondary en todos los bancos, consumidores indirectos de businessModel y audienceMonetization, casos focales de replays y decisión de persistencia de procedencia. Solo análisis documental; no pruebas, cambios de código ni despliegues.

## Changelog
0.1.0: dos consumidores verificados, censo focal de productor primario y seis escenarios propuestos.