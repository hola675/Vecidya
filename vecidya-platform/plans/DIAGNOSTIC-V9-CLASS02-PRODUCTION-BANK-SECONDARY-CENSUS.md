# V9 — CLASS-02: censo del banco productivo y capacidad híbrida
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Alcance y fuentes
qbv2-bank.ts blob 5509c469ffdbabd7d21d2adbf2b89325167467b7 registra QUESTION_BANK_V2 como golden filtrado + lotes A–G. La inspección estática abarcó los ocho módulos de origen; no se ejecutó la aplicación.

| Módulo | Blob SHA | Producciones monetizationMechanism |
|---|---|---|
| qbv2-golden.ts | 48da873ddfb5504a0517f4bcebb8c5c81fe1485a | Siete primary; cero secondary |
| qbv2-lote-a.ts | 8ef296744e0090db9e43dd80d81a8695ecc6f737 | Ninguna coincidencia literal |
| qbv2-lote-b.ts | 2d80dc5d42a36e0ab774fc524d1390b34d0ace5b | Ninguna coincidencia literal |
| qbv2-lote-c.ts | 1567afa25cb693c9f558aff7dae54e9fe2500dc1 | Ninguna coincidencia literal |
| qbv2-lote-d.ts | 4c7d9462b10ee9c73b020af566167722b8ae5720 | Ninguna coincidencia literal |
| qbv2-lote-e.ts | aa83e25ad1905def4c6e96b539a764a7e272d0bb | Ninguna coincidencia literal |
| qbv2-lote-f.ts | 7e8f696641b7cf310562b078b4891321612180f7 | Ninguna coincidencia literal |
| qbv2-lote-g.ts | c2c84f0f255e2346757cfd83ee5337e89a62407f | Ninguna coincidencia literal |

## Distinción de versiones
El banco productivo golden ofrece siete mecanismos primarios: time_or_project_work, goods_for_resale, licensed_practice, commission_or_referral, own_audience_monetization, recurring_access, mission_funded. qbv2-reviewed-foundation.ts, fuente candidata, ofrece seis primarios, sin licensed_practice como opción de esa pregunta. No confundir soporte del tipo MonetizationMechanism con cobertura de preguntas.

## Dictamen focal
El motor soporta secondaryMonetizationMechanism, businessModel=hybrid y audienceMonetization desde secondary. Sin embargo, no se encontró productor literal slot=secondary en los ocho módulos productivos ni en los quince módulos candidatos inspeccionados previamente. Esto no certifica ausencia en cualquier ruta programática, prueba, fixture o inyección externa.

## Gates pendientes
1. Revisar otros productores dinámicos e inyecciones de señales fuera de bancos.
2. Decidir si hybrid debe permanecer capacidad latente o recibir preguntas explícitas y validación independiente; no crear preguntas por inferencia.
3. Evaluar compatibilidad de licensed_practice entre V8 y V9 sin eliminar significado histórico.
4. Preparar matriz de aceptación CLASS-02 con evidencias, límites y pruebas focales pendientes.

## Changelog
0.1.0: censo focal productivo de golden y lotes A–G, diferencia 7 vs 6 y capacidad híbrida no demostrada.