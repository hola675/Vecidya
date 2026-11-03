# V9 — TAX-CLASS: consumidores y pruebas focales
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Hallazgos estáticos
- qa03b/bank.ts: historicalBank.map(evolve) aplica replacement q2_sector v3, incluida unknown.
- qa03b/specialty-candidate-bank.ts: importa desde ./bank; candidato sector v4; ocho selectores condicionados por igualdad de q2_sector.
- qa03b/specialty-branches-wave1.ts: consume QA03B_SPECIALTY_CANDIDATE_BANK_V1, genera QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 y define guardias de 77 preguntas e IDs únicos.
- qa03b/recovery-wave2.ts: creator depende de monetization=audience o sector=creator, además de actividad e historial.

## Matriz focal pendiente de ejecución
1. Valores únicos: sector v2=15, v3=16 y v4=20, con un other y un unknown.
2. Los ocho selectores sectoriales solo se habilitan con su sector explícito; unknown y other no coinciden.
3. Especialistas food y agency requieren sus condiciones adicionales de nicho y objetivo.
4. Creator por sector o monetización exige actividad e historial; no equiparar ambas fuentes.
5. Replay de respuestas v2/v3/v4 preserva questionId, version y value.
6. Al cambiar sector se invalida o recalcula el nicho incompatible.

## Límites
Censo focal, no exhaustivo. Guardias de código leídas, no ejecutadas. Consumidor público final no certificado. Sin cambios funcionales, tests ni deploy.

## Changelog
0.1.0: consumidores focales y matriz de pruebas pendientes.