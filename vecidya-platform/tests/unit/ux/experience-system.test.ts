import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { clampPercentage, formatCount, nonNegativeCount, relativeBarWidth } from "../../../app/lib/experience-metrics.ts";

const source = (file: string) => readFileSync(new URL(`../../../${file}`, import.meta.url), "utf8");

test("el porcentaje visual nunca excede el rango ni crea valores indefinidos", () => {
  assert.equal(clampPercentage(42.5), 42.5);
  assert.equal(clampPercentage(-10), 0);
  assert.equal(clampPercentage(180), 100);
  assert.equal(clampPercentage(Number.NaN), 0);
  assert.equal(clampPercentage(Infinity), 0);
});

test("comparación usa máximo observado, no población ni tasa de conversión", () => {
  assert.equal(relativeBarWidth(5, 10), 50);
  assert.equal(relativeBarWidth(10, 10), 100);
  assert.equal(relativeBarWidth(0, 10), 0);
  assert.equal(relativeBarWidth(12, 0), 0);
  assert.equal(relativeBarWidth(-5, 10), 0);
  assert.equal(relativeBarWidth(12, 10), 100);
  assert.equal(nonNegativeCount(Number.NaN), 0);
  assert.equal(formatCount(1000), (1000).toLocaleString("es-CO"));
});

test("los tres ámbitos usan la misma guía sin ampliar accesos", () => {
  const component = source("app/components/experience-system.tsx");
  const publicHome = source("app/routes/home.tsx");
  const clientHome = source("app/routes/app.tsx");
  const adminHome = source("app/routes/internal.tsx");
  assert.match(component, /export function JourneyGuide/);
  assert.match(component, /export function MetricCard/);
  assert.match(component, /export function ProgressMeter/);
  assert.match(component, /export function ComparisonBars/);
  assert.match(component, /<ol className="experience-journey__steps"/);
  assert.match(component, /role="progressbar"/);
  assert.match(publicHome, /<JourneyGuide\s+area="public"/);
  assert.match(clientHome, /<JourneyGuide\s+area="client"/);
  assert.match(adminHome, /<JourneyGuide\s+area="admin"/);
  assert.match(adminHome, /requirePlatformAdmin\(env, request\)/);
  assert.match(clientHome, /getActiveOrganization\(env, request\)/);
});

test("el progreso cliente depende de campos reales y la publicación, no de métricas comerciales", () => {
  const sourceClient = source("app/routes/app.tsx");
  assert.match(sourceClient, /businessProfileCompletion\.percentage/);
  assert.match(sourceClient, /businessProfileCompletion\.issues\.length/);
  assert.match(sourceClient, /businessProfile\?\.status === "published"/);
  assert.match(sourceClient, /<ProgressMeter/);
});

test("las gráficas internas conservan origen real, límites y estado vacío honesto", () => {
  const adminHome = source("app/routes/internal.tsx");
  const analytics = source("app/routes/internal-diagnostic-analytics.tsx");
  assert.match(adminHome, /pendingServicesCount: pendingServices\[0\]\?\.total/);
  assert.match(adminHome, /<ComparisonBars/);
  assert.match(analytics, /listFunnelAnalytics\(env.DB\)/);
  assert.match(analytics, /<ComparisonBars/);
  assert.match(analytics, /max === 0 \? <p className="experience-chart-empty"/);
  assert.match(analytics, /no conversiones de cohortes ni usuarios únicos/i);
});

test("los tokens son compartidos y las composiciones móviles no dependen solo de color", () => {
  const css = source("app/app.css");
  assert.match(css, /--experience-ink:\s*var\(--ink\)/);
  assert.match(css, /--experience-accent:\s*var\(--blue\)/);
  assert.match(css, /\.experience-journey--home/);
  assert.match(css, /\.experience-comparison__labels strong/);
  assert.match(css, /@media\(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  const components = source("app/components/experience-system.tsx");
  assert.match(components, /Paso completado/);
  assert.match(components, /Siguiente paso/);
  assert.match(components, /aria-hidden="true" className="experience-comparison__track"/);
});
