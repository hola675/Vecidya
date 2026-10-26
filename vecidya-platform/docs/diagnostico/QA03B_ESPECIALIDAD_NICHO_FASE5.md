# QA-03B — Fase 5: evidencia especializada por nicho

**Estado:** candidato aislado; PR #128 abierto como draft. No modifica el banco público de 45 preguntas, el contrato de sesión V8 ni el Worker público.

## Resultado de CI

En el HEAD `facfea068184918aaa3016010f4bd19c9f39fc26`, GitHub Actions run [40254841117](https://github.com/hola675/Vecidya/actions/runs/40254841117) terminó correctamente:
- Typecheck: PASS.
- Build: PASS.
- Diagnostic and Aprende regression: PASS.
- Unit regression: **1.760/1.760 PASS, 0 fallos**.

La matriz de certificación se amplió de 30 a 32 perfiles. El banco candidato quedó en **76 definiciones**: las 74 anteriores más dos pilotos retenidos. La suite pública sigue fijada en 45.

## A/B del planificador — 12 recorridos completos

Comparación del planificador `baseline` frente a `utility_first` sobre las mismas respuestas sintéticas:

| Perfil | Baseline | Utility-first | Diferencia | Evidencia directa / score | Pendientes sin resolver |
|---|---:|---:|---:|---:|---:|
| Proyecto de software en preparación | 14 | 13 | -1 | 3 / 3 en ambos | 5 en ambos |
| Dentista en pausa | 11 | 10 | -1 | 0 / 0 | 2 en ambos |
| Clínica dental activa | 23 | 23 | 0 | 10 / 10 | 6 en ambos |
| Restaurante con reservas | 23 | 22 | -1 | 10 / 10 | 6 en ambos |
| Comercio híbrido | 24 | 24 | 0 | 13 / 14 | 6 en ambos |
| Agencia de marketing B2B | 21 | 21 | 0 | 10 / 10 | 6 en ambos |
| Creador de audiencia | 19 | 18 | -1 | 8 / 8 | 6 en ambos |
| Organización con donaciones | 22 | 21 | -1 | 10 / 10 | 6 en ambos |
| SaaS activo | 21 | 21 | 0 | 10 / 10 | 6 en ambos |
| Marketplace activo | 24 | 24 | 0 | 12 / 13 | 6 en ambos |
| Preparación de impuestos | 23 | 23 | 0 | 10 / 10 | 5 en ambos |
| Agencia de seguros | 24 | 24 | 0 | 12 / 12 | 5 en ambos |
| **Total** | **249** | **244** | **-5** | **Sin cambio por perfil** | **Sin cambio por perfil** |

Cinco recorridos se acortan; siete conservan su duración; ninguno se alarga. En esta comparación de planificador, las preguntas eliminadas son contexto no esencial o inventario de herramientas sin una rama útil. **No se demuestra que el planificador por sí solo resuelva más dimensiones**: las cantidades de evidencia y los pendientes permanecen iguales en los doce recorridos. Los motivos terminales pueden cambiar sin que eso signifique mayor suficiencia.

## Experimentos de especialidad: retener solo evidencia útil

Se evaluaron cuatro definiciones candidatas. Dos quedan fuera del banco por no demostrar todavía un delta útil: `q2_specialty_software_activation` y `q2_specialty_marketplace_balance`. Se conservan en el archivo experimental para auditoría y no pueden consumir preguntas en la ruta candidata.

Se retienen dos preguntas:

### 1. Preparación de impuestos — `q2_specialty_tax_return_cycle`

Pregunta si existe un proceso para volver a contactar clientes anteriores antes de la próxima temporada o vencimiento fiscal.

| Medida | Banco sin pilotos | Banco candidato |
|---|---:|---:|
| Preguntas | 21 | 23 (+2) |
| Evidencias registradas | 9 | 10 (+1) |
| Dimensiones sin resolver | 6 | 5 (-1) |
| Dimensiones con contexto insuficiente | 2 | 2 |

La pregunta añade evidencia directa sobre `relationship_recurrence`. El coste incluye el selector explícito del nicho y la pregunta especializada. El recorrido sigue limitado por presupuesto; la mejora no debe presentarse como diagnóstico completo.

### 2. Agencia de seguros — `q2_specialty_insurance_renewal`

Pregunta si la agencia identifica pólizas próximas a vencer o revisar y contacta a tiempo.

| Medida | Banco sin pilotos | Banco candidato |
|---|---:|---:|
| Preguntas | 23 | 24 (+1 neta) |
| Evidencias registradas | 12 | 12 |
| Dimensiones sin resolver | 6 | 5 (-1) |
| Dimensiones con contexto insuficiente | 2 | 2 |

La pregunta especializada reemplaza `q2_followup_status_visibility` en `utility_first`, porque en esa ruta la revisión genérica de pendientes puede ceder su lugar a un proceso de renovación más concreto. La pregunta de reputación se conserva. El selector de nicho explica el aumento neto de una pregunta. La evidencia de recurrencia cambia de desconocida a parcial en el perfil sintético; no se afirma que las renovaciones reales estén garantizadas.

## Contratos y límites preservados

- Las dos preguntas retenidas solo son elegibles para su nicho declarado, operación activa e historial de clientes.
- `unknown` y `not_applicable` se mantienen como estados distintos y no se convierten en evidencia positiva.
- El mapeo R3 de los pilotos se limita a `relationship_recurrence`.
- Los experimentos de software y marketplace siguen disponibles para inspección, pero están excluidos del banco candidato por una lista explícita de IDs.
- No se cambiaron IDs, opciones ni reglas de las preguntas existentes; no se activó el planificador experimental en producción.
- No se fusionó ni desplegó el PR #128.

## Siguiente paso recomendado

Antes de sumar más nichos, probar si la especialidad puede **reemplazar** una pregunta genérica sin perder cobertura. Para impuestos, el siguiente trabajo debe identificar si hay una pregunta genérica realmente redundante en esa ruta; no eliminar citas/no-shows o reputación solo para compensar el coste. Para software y marketplace, rediseñar la evidencia o el mecanismo de desbloqueo antes de volver a admitirlas. Después, ejecutar replay de Worker, E2E y contrato de sesión antes de plantear cualquier promoción.
