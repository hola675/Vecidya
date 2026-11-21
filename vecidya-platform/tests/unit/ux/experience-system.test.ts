import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { clampPercentage, formatCount, nonNegativeCount, relativeBarWidth } from "../../../app/lib/experience-metrics.ts";
import { resolveUxTarget, UX_HTTP_ROUTES } from "../../../scripts/ux-verify-http.mjs";

const source = (file: string) => readFileSync(new URL(`../../../${file}`, import.meta.url), "utf8");

test("R1.8: superficies Admin reutilizan lenguaje v-surface sin cambiar acceso ni filtros", () => {
  const route = source("app/routes/internal-businesses.tsx");
  assert.match(route, /requirePlatformAdmin\(env, request\)/);
  assert.match(route, /listPlatformBusinessProfiles\(createDatabase\(env\.DB\)\)/);
  assert.match(route, /isVisualFeatureEnabled\("adminBusinessSurfaces"\)/);
  assert.match(route, /admin-toolbar v-surface/);
  assert.match(route, /data-surface=\{sharedSurfaces \? "glass" : undefined\}/);
  assert.match(route, /admin-table-wrap v-surface/);
  assert.match(route, /data-depth=\{sharedSurfaces \? "rest" : undefined\}/);
  assert.equal((route.match(/empty-state card v-surface/g) ?? []).length, 2);
  assert.match(route, /profile\.platformStatus === "suspended"/);
  assert.match(route, /setStatusFilter/);
});


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
  assert.match(component, /<ol className="experience-journey__steps v-grid v-grid--3">/);
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


test("R1.6 reutiliza los componentes existentes sin inferir derechos ni éxitos", () => {
  const components = source("app/components/visual-contract.tsx");
  for (const name of ["PageHeading", "SharedStatusPanel", "ConsentStatus", "AdminFilterBar", "DiagnosticMetricCard", "DiagnosticTrend"]) {
    assert.match(components, new RegExp("export function " + name + "\\("));
  }
  assert.match(components, /import \{ Card \} from "\.\/ui"/);
  assert.match(components, /surface="solid"/);
  assert.match(components, /data-state=\{state\}/);
  assert.match(components, /state === "access-denied"/);
  assert.match(components, /role=\{urgent \? "alert" : "status"\}/);
  assert.match(components, /"not-authorized": "Consentimiento no autorizado"/);
  assert.match(components, /unknown: "Consentimiento sin confirmar"/);
  assert.match(components, /method="get" role="search"/);
  assert.match(components, /<Link className="button button--secondary" to=\{resetTo\}>Limpiar filtros<\/Link>/);
  assert.match(components, /value === null \? emptyLabel/);
  assert.match(components, /point\.value === null \? "Sin dato"/);
  assert.match(components, /role="region" aria-label=\{title \+ " en tabla"\}/);
  assert.doesNotMatch(components, /fetch\(|localStorage|Math\.random|useEffect\(/);
});

test("R1.6 superficies, foco y tablas del contrato usan tokens productivos y responsive", () => {
  const css = source("app/styles/visual-system.css");
  assert.match(css, /\.v-page-heading\{/);
  assert.match(css, /\.v-status-panel\[data-state="access-denied"\]/);
  assert.match(css, /\.v-admin-filterbar\{/);
  assert.match(css, /\.v-diagnostic-trend__table-wrap\{/);
  assert.match(css, /var\(--v-radius-card\)/);
  assert.match(css, /var\(--v-orange-500\)/);
  assert.match(css, /@media\(max-width:560px\)/);
  assert.match(css, /overflow:auto/);
});

test("R3: comprobador HTTP es anónimo y deniega destinos o acciones no autorizadas", () => {
  assert.deepEqual([...UX_HTTP_ROUTES], ["/", "/vecindario", "/servicios", "/aprende"]);
  assert.equal(resolveUxTarget("http://127.0.0.1:4173/").type, "local");
  assert.equal(resolveUxTarget("https://vecidya-platform-staging.soporte-8a1.workers.dev/").type, "staging");
  assert.throws(() => resolveUxTarget("https://vecidya.com/"), /Destino bloqueado/);
  assert.equal(resolveUxTarget("https://vecidya.com/", true).type, "production");
  for (const target of [
    "https://vecidya.com/?auth=secret",
    "https://vecidya.com/private",
    "https://example.com/",
    "http://169.254.169.254/",
    "http://127.0.0.1:3000/",
    "https://vecidya-platform-staging.fake.workers.dev.evil.example/",
    "https://admin:password@vecidya.com/",
  ]) {
    assert.throws(() => resolveUxTarget(target, true), "Destino debía rechazarse: " + target);
  }
  const source = readFileSync(new URL("../../../scripts/ux-verify-http.mjs", import.meta.url), "utf8");
  assert.match(source, /method: "GET"/);
  assert.match(source, /redirect: "manual"/);
  assert.match(source, /verifiesDeployedSha: false/);
  assert.doesNotMatch(source, /method: "POST"|cookies:|Authorization:/);
});

test("R4: dashboard legible y MiniWeb con vista previa contextual sin cambiar persistencia", () => {
  const css = source("app/styles/workspace-premium.css");
  const editor = source("app/routes/miniweb-v2-editor.tsx");
  const dashboard = source("app/routes/app.tsx");
  assert.match(dashboard, /className="app-primary-action"/);
  assert.match(css, /\.app-shell \.app-main \.app-primary-action :is\(h2, p:not\(\.eyebrow\)\)\s*\{\s*color: var\(--v-ink\)/);
  assert.match(editor, /id="miniweb-v2-preview"/);
  assert.match(editor, /id="miniweb-v2-sections"/);
  assert.match(editor, /href="#miniweb-v2-preview"/);
  assert.match(editor, /href="#miniweb-v2-sections"/);
  assert.match(editor, /isDirty \? "Esta vista refleja los cambios locales aún sin guardar/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) minmax\(22rem, 0\.92fr\)/);
  assert.match(css, /position: sticky/);
  assert.match(css, /@media \(min-width: 1100px\)/);
  assert.match(editor, /<MiniWebV2Renderer document=\{document\}/);
  assert.match(editor, /const blocker = useBlocker/);
  assert.match(editor, /aria-label="Pasos de edición del sitio"/);
  assert.match(editor, /activeSectionId, setActiveSectionId/);
  assert.match(editor, /activeSection \? <Card key=\{activeSection.id\}/);
  assert.match(editor, /sectionGuidance\[activeSection.type\]/);
  assert.match(editor, /onClick=\{\(\) => setActiveSectionId\(item.id\)\}/);
  assert.match(editor, /Sección \{activeSectionIndex \+ 1\} de \{orderedSections.length\}/);
  const fields = source("app/components/miniweb-v2-section-form.tsx");
  assert.match(fields, /const fieldGuidance:/);
  assert.match(fields, /field.help \?\? fieldGuidance\[field.label\]/);
  assert.match(css, /miniweb-v2-editor__steps-list/);
  assert.match(css, /miniweb-v2-form__field-help/);
  assert.match(editor, /mobileView, setMobileView/);
  assert.match(editor, /data-mobile-view=\{mobileView\}/);
  assert.match(css, /data-mobile-view="edit"/);
  assert.match(css, /data-mobile-view="preview"/);
  assert.match(css, /textarea \{ min-height: 7rem/);
});
