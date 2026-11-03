# V9 — CLASS-02: consumo de monetización y estado operativo
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Cadena de monetización inspeccionada
Fuente qbv2-signals.ts blob 3563ae11c8e385067c240c52cfb741192a67ccba: monetizationMechanism y monetizationClassification se tipan como producciones distintas (líneas 39–41); el slot primary se pliega a monetizationMechanism y secondary a secondaryMonetizationMechanism (línea 179).
Fuente context-resolver.ts blob d24e50ffdcc2d6e8c27286038e89c1bebf363385, líneas 135–156:
- Sin mecanismo primario, monetizationClassification=unsure produce businessModel unresolved(declared_unknown); other produce unresolved(insufficient_evidence).
- Sin mecanismo y sin clasificación, businessModel unresolved(not_asked), salvo señal legacyLicensedClassification que produce insufficient_evidence.
- Con mecanismo primario, se aplica MONETIZATION_TO_BUSINESS_MODEL.
- Dos mecanismos independientes primario/secundario pueden resolver businessModel=hybrid; no basta con dos etiquetas repetidas.
- El resolvedor no obtiene businessModel directamente de q2_sector.

## Estado operativo y gates
qa03b/bank.ts blob b4772d73e1d8b5044ba2011088db978c364097f0 define `const operating = eqV2(q2_operational_status, operating)` (línea 6). q2_operational_status v1 tiene preparing/operating/paused/unknown sin produces (línea 201 y siguientes). Es un gate de respuestas; no es automáticamente una señal de contexto. No equiparar `operating` con hasRealCustomers=true ni `preparing` con prelaunch sin verificar transformaciones.

## Riesgos pendientes
1. Revisar MONETIZATION_TO_BUSINESS_MODEL literal y el criterio areIndependent antes de certificar híbridos.
2. Censar todos los consumidores de q2_operational_status en la rama, no solo qa03b/bank.ts.
3. Confirmar comportamiento de sesión y scoring al cambiar etapa o mecanismo.
4. No atribuir ingresos reales a monetización esperada durante prelaunch.

## Dictamen
CLASS-02: procedencia de monetización y gate operativo documentados focalmente, no certificados. No se han ejecutado pruebas, cambiado código ni desplegado.

## Changelog
0.1.0: trazabilidad de consumo de monetización y gate operativo, con límites explícitos.