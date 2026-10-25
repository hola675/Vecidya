import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const root = ".playwright-mcp/visual-qa";
const current = JSON.parse(readFileSync(`${root}/current/manifest.json`, "utf8"));
const beforeLegal = JSON.parse(readFileSync(`${root}/before-legal/public-manifest.json`, "utf8"));
const beforeDashboardFiles = readdirSync(`${root}/before-miniweb/dashboard`).filter((file) => file.endsWith(".png") && !file.includes("overflow-debug"));
const routes = [...new Set(current.captures.map(({ route }) => route))];
const widths = current.viewportWidths;
const routeOptions = routes.map((route) => `<option>${route}</option>`).join("");
const widthOptions = widths.map((width) => `<option>${width}</option>`).join("");
const capture = (route, width) => current.captures.find((item) => item.route === route && item.width === width);
const assets = routes.flatMap((route) => widths.map((width) => ({ width, item: capture(route, width) })).filter(({ item }) => item).map(({ width, item }) => `<img data-route="${route}" data-width="${width}" data-area="${item.area}" src="current/${item.screenshot}" alt="${route}, ${width}px" loading="lazy">`)).join("");
const findings = [
  ["P2", "/cookies · 320 px", "Antes: 321 px de ancho de documento; H1 excedía la columna por su ancho mínimo intrínseco.", "Se fijó una columna flexible en el heading legal y se permitió romper la palabra larga del H1.", "Recaptura HTTP 200 a 320/390/1366 px: documento sin overflow."],
  ["P3", "/app/internal/services · 320/390 px", "La captura rápida midió 711 px antes de hidratar el área.", "La tabla conserva su scroll interno; el shell no desborda una vez estable.", "E2E de dashboard y revisión Playwright estabilizada verifican el contenedor y las ocho anchuras; se registra la lectura rápida como anomalía de timing."],
  ["Info", "/cookies y /informacion-legal", "No existían en baseline #102", "Rutas legales incorporadas después del baseline.", "No aplica comparación antes/después.", "Capturas actuales HTTP y layout en ocho anchos."],
].map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");

const legalBefore = beforeLegal.captures.map((item) => `<figure><figcaption>Antes ${item.route} · ${item.width}px · HTTP ${item.status}</figcaption><img src="before-legal/${item.screenshot}" alt="Baseline legal ${item.route} ${item.width}px" loading="lazy"></figure>`).join("");
const dashBefore = beforeDashboardFiles.map((file) => `<figure><figcaption>Antes #105 · ${file.replace("vecidya-", "").replaceAll("-", " ").replace(".png", "")}</figcaption><img src="before-miniweb/dashboard/${file}" alt="Baseline ${file}" loading="lazy"></figure>`).join("");

const html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vecidya · Auditoría visual local</title><style>
:root{color-scheme:light dark;font:16px/1.5 system-ui,sans-serif}body{margin:0;background:#101722;color:#f1f5f9}main{max-width:1480px;margin:auto;padding:28px}h1,h2{line-height:1.2}header,section{margin:0 0 28px}header p{max-width:900px;color:#cbd5e1}.filters{display:flex;gap:12px;flex-wrap:wrap;align-items:end;padding:14px;background:#1e293b;border-radius:12px}.filters label{display:grid;gap:4px}select,input{font:inherit;padding:8px;border-radius:6px}.views{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}.stage{position:relative;overflow:auto;background:#0b1020;border:1px solid #475569;border-radius:8px;min-height:180px}.stage img{display:block;width:100%;height:auto}.stage .after{position:absolute;inset:0;width:var(--split,50%);overflow:hidden;border-right:2px solid #f97316}.stage .after img{width:calc(100vw - 60px);max-width:1480px;min-width:100%}.view{display:none}.view.active{display:block}figure{margin:0 0 18px}figure img{width:100%;height:auto;border:1px solid #475569;border-radius:8px}figcaption{font-size:.9rem;color:#cbd5e1;margin:5px 0}table{border-collapse:collapse;width:100%;font-size:.94rem}td,th{border:1px solid #475569;padding:9px;text-align:left;vertical-align:top}code{background:#1e293b;padding:2px 5px;border-radius:4px}.note{color:#cbd5e1}@media(max-width:750px){main{padding:16px}.views{grid-template-columns:1fr}}
</style><main><header><h1>Auditoría visual integral · Vecidya</h1><p>Evidencia local capturada el ${new Date(current.capturedAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}. D1 y R2 locales; datos sintéticos de prueba. Sin tráfico externo observado: ${current.public?.externalRequests?.length === 0 ? "sí" : "revisar manifiesto"}. Comparación contra baseline legal previo a #102 y Mi Vecidya previo a #105.</p><p class="note">Comparador: vista individual o superposición antes/después. En perfiles de MiniWeb no había captura histórica reproducible; se muestran capturas actuales del editor y el baseline disponible del dashboard. Las rutas nuevas no tienen estado «antes».</p></header>
<section><h2>Comparación de ruta y viewport</h2><div class="filters"><label>Ruta<select id="route">${routeOptions}</select></label><label>Viewport<select id="width">${widthOptions}</select></label><label>Estado<select id="state"><option value="current">Actual</option><option value="before">Antes (cuando existe)</option><option value="overlay">Superposición</option><option value="difference">Diferencia visual</option></select></label><label>Posición de superposición<input id="split" type="range" min="0" max="100" value="50"></label></div><div id="asset-grid">${assets}</div><div id="comparison" class="views"><div><h3>Antes</h3><div id="before" class="stage"></div></div><div><h3>Después</h3><div id="after" class="stage"></div></div></div><p id="no-before" class="note"></p></section>
<section><h2>Capturas baseline legales</h2><div class="views">${legalBefore}</div></section><section><h2>Capturas baseline del panel previo a #105</h2><div class="views">${dashBefore || "<p>El manifiesto no contiene capturas baseline del dashboard.</p>"}<p>Las capturas históricas cubren el dashboard y administración; la comparación directa del editor MiniWeb no está disponible.</p></div></section>
<section><h2>Registro de hallazgos y acciones</h2><div style="overflow:auto"><table><thead><tr><th>Severidad</th><th>Pantalla/evidencia</th><th>Hallazgo</th><th>Corrección o decisión</th><th>Verificación/estado</th></tr></thead><tbody>${findings}</tbody></table></div></section><section><h2>Lectura del manifiesto</h2><p>Capturas: ${current.captures.length}. Rutas cubiertas: ${routes.length}. Viewports: ${widths.join(", ")} px. Errores de consola: ${current.public?.consoleErrors?.length ?? "ver manifiesto"} en público; fallos de requests: ${current.public?.requestFailures?.length ?? "ver manifiesto"}. El manifiesto completo está en <code>current/manifest.json</code>.</p></section></main><script>
const imgs=[...document.querySelectorAll('#asset-grid img')], route=document.querySelector('#route'), width=document.querySelector('#width'), state=document.querySelector('#state'), before=document.querySelector('#before'), after=document.querySelector('#after'), note=document.querySelector('#no-before'), split=document.querySelector('#split');
function update(){
  const r=route.value,w=width.value,mode=state.value,current=imgs.find(i=>i.dataset.route===r&&i.dataset.width===w);
  before.replaceChildren();after.replaceChildren();note.textContent='';after.style.position='';
  if(current){const clone=current.cloneNode();clone.loading='eager';after.append(clone)}
  const comparableRoute=r==='/'||r==='/privacidad'||r==='/terminos';
  const old=comparableRoute?document.querySelector('img[alt="Baseline legal '+r+' '+w+'px"]'):null;
  if(old){const clone=old.cloneNode();clone.loading='eager';before.append(clone)}
  else if(mode!=='current')note.textContent='No hay baseline comparable para esta ruta y anchura.';
  before.parentElement.style.display=mode==='current'?'none':'';
  after.parentElement.style.display=mode==='before'&&old?'none':'';
  if((mode==='overlay'||mode==='difference')&&old&&current){
    const baseline=old.cloneNode(),live=after.querySelector('img');baseline.loading='eager';
    after.style.position='relative';baseline.style.position='absolute';baseline.style.inset='0';baseline.style.width='100%';
    live.style.position='absolute';live.style.inset='0';live.style.width='100%';
    if(mode==='overlay')live.style.clipPath='inset(0 '+(100-Number(split.value))+'% 0 0)';
    if(mode==='difference')live.style.mixBlendMode='difference';
    after.prepend(baseline);
  }
  document.querySelector('#comparison').dataset.state=mode;
}
for(const el of [route,width,state,split])el.addEventListener('input',update);update();
</script></html>`;
writeFileSync(`${root}/index.html`, html);
console.log(`Informe: ${root}/index.html · ${current.captures.length} capturas · ${beforeLegal.captures.length} referencias legales`);
