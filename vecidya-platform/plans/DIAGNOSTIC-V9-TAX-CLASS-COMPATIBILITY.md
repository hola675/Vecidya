# Diagnóstico V9 — TAX-CLASS: compatibilidad de clasificación
Versión 0.1.0 | 2026-10-31 | PLAN_ONLY | Propuesta no aprobada

## Fuentes
Plan maestro V9, secciones 70–77; documento editorial Lote 01, tabla de 82 identidades; matriz TAX-G2. Esta revisión es documental y no ejecuta reglas.

## Problema
El selector q2_sector v4 combina sector económico, modelo de negocio, canal y tipo de entidad. Ocho selectores de nicho dependen de igualdad literal de q2_sector. Cambiar sus values sin puente versionado puede dejar ramas inaccesibles, particularmente marketing_agency.

## Contrato propuesto
Mantener q2_sector y respuestas históricas inmutables por versión. Para V9 futura, derivar cuatro atributos explícitos y distintos: sectorActividad, modeloComercial, canalOperacion y naturalezaEntidad, más etapaOperativa y destinatario. Ningún atributo se infiere exclusivamente de otro. Guardar procedencia y grado de confirmación; desconocido permanece desconocido.

## Matriz de compatibilidad focal
| Valor/grupo legado | Riesgo | Regla de diseño |
| --- | --- | --- |
| b2b_services | Modelo comprador B2B confundido con sector | Conservar puente de elegibilidad de q2_niche_b2b_services y agencia; no asignar B2B por defecto a software |
| ecommerce | Canal digital confundido con actividad | Permitir combinación con retail físico; no exigir checkout a quien no lo ofrece |
| creator | Modelo de audiencia confundido con actividad | Mantener selector y confirmar naturaleza de oferta |
| nonprofit_community | Naturaleza organizativa confundida con monetización | Membresía, donación y participación son modalidades separadas |
| food_hospitality | Restaurante, cafetería, food truck y alojamiento tienen flujos distintos | No equiparar reservas de mesa/habitación con citas clínicas |
| health_wellness | Nichos clínicos heterogéneos | No inferir licencia, información sanitaria ni permiso de contacto |
| beauty_personal_care | mobile_pet_grooming no atiende necesariamente personas | Preservar ID histórico y clasificar especie/servicio sin pérdida |
| technology_software | software_startup y two_sided_marketplace expresan etapa/plataforma | No forzar B2B ni etapa operativa |
| retail | Venta física y digital pueden coexistir | Distinguir catálogo, pago presencial y checkout |
| other / unknown | Sin sector determinado | Ruta genérica, no bloqueo de entrevista ni puntuación negativa |

## Invariantes de migración futura
1. No reescribir answers históricos ni cambiar significado de values ya emitidos.
2. Resolver elegibilidad por atributos confirmados, con fallback a lectura versionada del legado mientras exista.
3. Si se edita sector, invalidar elegibilidad y puntuación derivada, conservando historial y replay.
4. Nunca sustituir una pregunta V3 directa por una pending sin paridad y fallback (caso inmobiliario).
5. Un sector/nicho no demuestra madurez digital, ventas, identidad de cliente ni consentimiento.
6. No activar una pregunta solo por elegibilidad: exigir brecha material y respetar 24+5.

## Gates
CLASS-01: inventario literal de todos los values y ocho selectores con SHA.
CLASS-02: tabla completa oldValue→atributos confirmables, sin inferencias irreversibles.
CLASS-03: reglas y fallbacks de dental, food, agency, real estate.
CLASS-04: C01–C10, híbridos, unknown, cambio de sector y replay.
CLASS-05: aprobación humana, implementación aislada y pruebas focales solo cuando autorizadas.

Estado: CLASS-01–05 OPEN. F02/F03/F05 OPEN. Sin código, tests ni despliegue.

## Changelog
0.1.0: contrato de clasificación y compatibilidad de rutas.
