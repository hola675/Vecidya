import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const browser = await chromium.launch({ executablePath: edgePath });
const output = join(process.cwd(), ".playwright-mcp", "vico-scenes-after");
await mkdir(output, { recursive: true });
const viewports = [[320,720],[390,844],[768,1024],[1366,768],[1920,1080]];
const pages = [
  { path: "/", name: "home", scene: "/assets/selected/illustrations/home-vecidya-companion-v4.webp", vico: "/assets/selected/illustrations/vico-home.webp", sceneSelector: ".home-hero-visual__product", vicoSelector: ".home-hero-visual__vico" },
  { path: "/vecindario", name: "neighborhood", scene: "/assets/selected/illustrations/neighborhood-scene.webp", vico: "/assets/selected/illustrations/vico-vecindario.webp" },
  { path: "/aprende", name: "learn", scene: "/assets/selected/illustrations/learn-journey-scene.webp", vico: "/assets/selected/illustrations/vico-aprende.webp", sceneSelector: ".learn-atlas__map img", vicoSelector: ".learn-atlas__vico" },
  { path: "/diagnostico", name: "diagnostic", scene: "/assets/selected/illustrations/diagnostic-scene.webp", vico: "/assets/selected/illustrations/vico-diagnostico.webp" },
  { path: "/licencias", name: "licenses", scene: "/assets/selected/illustrations/licenses-scene.webp", vico: "/assets/selected/illustrations/vico-licencias.webp" },
  { path: "/servicios", name: "services", scene: "/assets/selected/illustrations/services-scene.webp", vico: "/assets/selected/illustrations/vico-servicios.webp" },
  { path: "/addons", name: "addons", scene: "/assets/selected/illustrations/addons-scene.webp", vico: "/assets/selected/illustrations/vico-addons.webp" },
  { path: "/sobre-nosotros", name: "about", scene: "/assets/selected/illustrations/about-scene.webp", vico: "/assets/selected/illustrations/vico-nosotros.webp" },
  { path: "/contacto", name: "contact", scene: "/assets/selected/illustrations/contact-scene.webp", vico: "/assets/selected/illustrations/vico-contacto.webp" },
  { path: "/unete", name: "join", scene: "/assets/selected/illustrations/join-scene.webp", vico: "/assets/selected/illustrations/vico-unete.webp" },
];
for (const [width, height] of viewports) {
  for (const spec of pages) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(new URL(spec.path, baseUrl).toString(), { waitUntil: "domcontentloaded" });
    if (!response?.ok()) throw new Error(`${spec.name} ${width}: HTTP ${response?.status()}`);
    const rejectCookies = page.getByRole("button", { name: "Rechazar opcionales" });
    if (await rejectCookies.isVisible().catch(() => false)) await rejectCookies.click();
    const root = spec.sceneSelector ? page.locator("main") : page.locator(".public-hero-art").first();
    const scene = spec.sceneSelector ? page.locator(spec.sceneSelector) : root.locator(".public-hero-art__scene");
    const vico = spec.vicoSelector ? page.locator(spec.vicoSelector) : root.locator(".public-hero-art__vico");
    for (const [label, image, src] of [["escena", scene, spec.scene],["Vico", vico, spec.vico]]) {
      if (await image.getAttribute("src") !== src) throw new Error(`${spec.name} ${width}: ${label} usa otro asset.`);
      if (!(await image.evaluate(async (node) => { await node.decode().catch(() => {}); return node.complete && node.naturalWidth > 0; }))) throw new Error(`${spec.name} ${width}: ${label} no cargó.`);
      if (!(await image.getAttribute("alt"))?.trim()) throw new Error(`${spec.name} ${width}: ${label} necesita texto alternativo.`);
      const alpha = await image.evaluate((node) => {
        const canvas = document.createElement("canvas"); canvas.width = node.naturalWidth; canvas.height = node.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true }); context.drawImage(node, 0, 0);
        return [[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]].map(([x,y]) => context.getImageData(x,y,1,1).data[3]);
      });
      if (alpha.some((value) => value !== 0)) throw new Error(`${spec.name} ${width}: ${label} perdió transparencia en una esquina (${alpha.join(",")}).`);
    }
    const metrics = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    if (metrics.scroll > metrics.viewport + 1) throw new Error(`${spec.name} ${width}: overflow ${JSON.stringify(metrics)}`);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const motion = await vico.evaluate((node) => {
      const style = getComputedStyle(node);
      return { name: style.animationName, duration: style.animationDuration.split(",")[0] };
    });
    if (spec.name === "home" ? Number.parseFloat(motion.duration) > 0.2 : motion.name !== "none") throw new Error(`${spec.name} ${width}: Vico no respeta movimiento reducido (${JSON.stringify(motion)}).`);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    if (width === 320 || width === 390 || width === 768 || width === 1366 || width === 1920) {
      await page.screenshot({ path: join(output, `${spec.name}-${width}x${height}.png`), fullPage: true, animations: "disabled" });
    }
    if (errors.length) throw new Error(`${spec.name} ${width}: ${errors.join("; ")}`);
    await page.close();
  }
}
await browser.close();
console.log(`PASS: ${pages.length} páginas × ${viewports.length} tamaños; parejas Vico/escena cargadas, alt, overflow, errores JS y movimiento reducido revisados. Capturas: ${output}`);
