/** Crystal Depth R1 · QA focal, Node >=22, sin dependencias de la plataforma. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('biblioteca.html');
const css=read('styles/crystal-depth.css');
const r1css=read('styles/r1-guidance.css');
const registry=JSON.parse(read('assets/pattern-registry.json'));
const part=(start,end)=>{
  const i=html.indexOf(start),j=html.indexOf(end,i+start.length);
  assert.ok(i>=0&&j>i,'No se encontró bloque de script: '+start);
  return html.slice(i,j);
};
const attrs=(tag,key)=>tag.match(new RegExp(key+'="([^"]*)"'))?.[1];
const routes=[...html.matchAll(/<option\b[^>]*\bdata-material="[^"]*"[^>]*>/g)].map(x=>({
  value:attrs(x[0],'value'),
  dataset:{material:attrs(x[0],'data-material'),scene:attrs(x[0],'data-scene'),rule:attrs(x[0],'data-rule'),preview:attrs(x[0],'data-preview')}
}));

test('tema oscuro inicial y alternancia accesible reversible',()=>{
  assert.match(html,/<html\b[^>]*data-theme="dark"/);
  assert.match(html,/<button\b[^>]*id="theme-toggle"[^>]*role="switch"[^>]*aria-checked="true"/);
  const switcher={attrs:{'aria-checked':'true'},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,f){assert.equal(k,'click');this.click=f;}};
  const label={textContent:'Oscuro'},meta={content:'#06172F'};
  const document={documentElement:{dataset:{theme:'dark'}},getElementById:id=>id==='theme-toggle'?switcher:label,querySelector:()=>meta};
  vm.runInNewContext(part('const themeToggle = document.getElementById("theme-toggle")','const r1Intent = document.getElementById("r1-intent")'),{document});
  switcher.click();
  assert.deepEqual([document.documentElement.dataset.theme,switcher.attrs['aria-checked'],label.textContent,meta.content],['light','false','Claro','#F1F7FE']);
  switcher.click();
  assert.deepEqual([document.documentElement.dataset.theme,switcher.attrs['aria-checked'],label.textContent,meta.content],['dark','true','Oscuro','#06172F']);
});

test('enrutador de agentes: ocho intenciones, tres campos consistentes',()=>{
  assert.equal(routes.length,8);
  assert.deepEqual(routes.map(x=>x.value).sort(),registry.intentRouting.map(x=>x.intent).sort());
  const els=Object.fromEntries(['r1-route-material','r1-route-scene','r1-route-rule','r1-preview-link','r1-preview-note'].map(id=>[id,{textContent:'',dataset:{},hidden:false}]));
  const select={options:routes,selectedIndex:0,addEventListener(k,fn){assert.equal(k,'change');this.change=fn;}};
  const document={getElementById:id=>id==='r1-intent'?select:els[id]};
  vm.runInNewContext(part('const r1Intent = document.getElementById("r1-intent")','document.getElementById("r1-copy").addEventListener'),{document});
  for(let i=0;i<routes.length;i++){
    select.selectedIndex=i;select.change();
    assert.equal(els['r1-route-material'].textContent,routes[i].dataset.material);
    assert.equal(els['r1-route-scene'].textContent,routes[i].dataset.scene);
    assert.equal(els['r1-route-rule'].textContent,routes[i].dataset.rule);
    assert.equal(els['r1-preview-link'].hidden,!routes[i].dataset.preview);
    assert.equal(els['r1-preview-link'].dataset.preview,routes[i].dataset.preview||'');
  }
  assert.equal(new Set(routes.map(x=>x.dataset.rule)).size,8);
});

test('patrones, capas, navegación y accesibilidad de R1',()=>{
  assert.deepEqual(registry.materials.map(x=>x.id),['focal','quiet','solid']);
  assert.deepEqual(registry.layers.map(x=>x.id),['L0','L1','L2','L3','L4','L5']);
  for(const m of registry.materials){
    assert.ok(html.includes('.'+m.cssClass),'Muestra ausente: '+m.cssClass);
    assert.ok(r1css.includes('.'+m.cssClass),'CSS ausente: '+m.cssClass);
    assert.ok(m.use.length&&m.avoid.length,'Falta uso/antiuso: '+m.id);
  }
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(new Set(ids).size,ids.length,'IDs duplicados');
  for(const literal of ['id="guia"','href="assets/pattern-registry.json"','href="docs/INTEGRACION.md"']) assert.ok(html.includes(literal));
  assert.match(css,/:focus-visible\s*\{/);
  assert.match(css,/\.skip-link:focus\s*\{/);
  assert.match(r1css,/prefers-reduced-motion\s*:\s*reduce/);
  assert.match(r1css,/@media\s*\(max-width:\s*650px\)/);
});

test('tokens de texto sobre superficies sólidas >= 4.5:1',()=>{
  const luminance=hex=>{
    const x=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
    return 0.2126*x[0]+0.7152*x[1]+0.0722*x[2];
  };
  const pairs=[['color.text.dark','color.surface.dark'],['color.text.muted.dark','color.surface.dark'],['color.text.light','color.surface.light'],['color.brand.orangeInk','color.brand.orange']];
  for(const [a,b] of pairs){
    const [lo,hi]=[luminance(registry.tokens[a]),luminance(registry.tokens[b])].sort((x,y)=>x-y);
    assert.ok((hi+0.05)/(lo+0.05)>=4.5,'Contraste insuficiente: '+a+'/'+b);
  }
});

test('catálogo oficial de activos y estado no productivo',()=>{
  const window={};
  vm.runInNewContext(read('assets/library-catalog.js'),{window});
  assert.equal(window.vecidyaCrystalCatalog.length,140);
  assert.equal(new Set(window.vecidyaCrystalCatalog.map(x=>x.category)).size,17);
  assert.ok(window.vecidyaCrystalCatalog.every(x=>x.source&&x.preview));
  assert.equal(registry.decisions.libraryRole,'internal-review-laboratory');
  assert.match(registry.implementation.doNot,/producci[oó]n/i);
});


test('movimiento R1.1: presets, controles, fallback y reducción',()=>{
  const motionJs=read('assets/motion-system.js');
  const motionCss=read('styles/motion-system.css');
  assert.doesNotThrow(()=>new vm.Script(motionJs));
  assert.equal(registry.motion.presets.length,5);
  assert.deepEqual(registry.motion.modes,['standard','subtle','static']);
  for(const mode of ['page-enter','section-reveal','ui-feedback','ambient-drift','section-navigation']){
    assert.ok(registry.motion.presets.some(x=>x.id===mode),'Falta preset: '+mode);
  }
  for(const id of ['movimiento','motion-stage','motion-intensity','motion-play','motion-replay','motion-message']){
    assert.ok(html.includes('id="'+id+'"'),'Falta demo/control: '+id);
  }
  assert.match(html,/href="#movimiento"/);
  assert.match(html,/href="styles\/motion-system.css"/);
  assert.match(html,/src="assets\/motion-system.js"/);
  assert.match(motionCss,/prefers-reduced-motion\s*:\s*reduce/);
  assert.match(motionCss,/data-motion-play=paused/);
  assert.match(motionCss,/transform/);
  assert.match(motionJs,/IntersectionObserver/);
  assert.match(motionJs,/matchMedia/);
  assert.match(motionJs,/is-in-view/);
  assert.match(motionJs,/addEventListener\("change", applyPreference\)/);
});


test('composición de páginas R1.2: cuatro escenas oficiales y alternativa sin JavaScript',()=>{
  const sceneCss=read('styles/scene-composer.css');
  const sceneJs=read('assets/scene-composer.js');
  assert.doesNotThrow(()=>new vm.Script(sceneJs));
  assert.equal(registry.sceneRecipes.length,4);
  assert.deepEqual(registry.sceneRecipes.map(x=>x.id),['publico','vecindario','aprende','miniweb']);
  assert.match(html,/href="#composiciones"/);
  assert.match(html,/id="composer"/);
  assert.match(html,/id="composer-tabs"[^>]*role="tablist"[^>]*hidden/);
  assert.match(html,/href="styles\/scene-composer.css"/);
  assert.match(html,/src="assets\/scene-composer.js"/);
  for(const scene of registry.sceneRecipes){
    assert.ok(html.includes('id="composer-tab-'+scene.id+'"'));
    assert.ok(html.includes('id="composer-panel-'+scene.id+'"'));
    assert.ok(html.includes('data-scene="'+scene.id+'"'));
    assert.ok(html.includes(scene.asset.replace('vecidya-platform/public/assets','../vecidya-platform/public/assets')));
    assert.equal(scene.status,'demo-only-not-route');
    assert.ok(scene.primaryMaterial&&scene.secondaryMaterial&&scene.motion.length&&scene.contentRule);
  }
  assert.match(sceneCss,/\.composer-tablist\[hidden\]/);
  assert.match(sceneCss,/\.composer-panel\[hidden\]/);
  assert.match(sceneCss,/prefers-reduced-motion\s*:\s*reduce/);
  assert.match(sceneJs,/ArrowRight/);
  assert.match(sceneJs,/ArrowLeft/);
  assert.match(sceneJs,/event\.preventDefault\(\)/);
  assert.match(sceneJs,/root\.classList\.add\("is-interactive"\)/);
  assert.match(sceneJs,/panel\.hidden = !current/);
});

test('enrutador enlaza cuatro escenas reales y explica los contextos sin vista',()=>{
  const options=[...html.matchAll(/<option\b[^>]*\bvalue="([^"]+)"[^>]*>/g)]
    .map(x=>({value:x[1],preview:x[0].match(/\bdata-preview="([^"]+)"/)?.[1]}))
    .filter(x=>registry.intentRouting.some(r=>r.intent===x.value));
  const defined=options.filter(x=>x.preview);
  assert.equal(options.length,8);
  assert.deepEqual(defined.map(x=>[x.value,x.preview]),[
    ['portada-marketing','publico'],['buscar-negocios','vecindario'],
    ['contenido-editorial','aprende'],['editar-miniweb','miniweb']
  ]);
  assert.ok(defined.every(x=>registry.sceneRecipes.some(scene=>scene.id===x.preview&&scene.intent===x.value)));
  assert.match(html,/id="r1-preview-link"/);
  assert.match(html,/id="r1-preview-note"/);
  assert.match(read('assets/scene-composer.js'),/suggested\.addEventListener\("click"/);
  assert.match(read('styles/r1-guidance.css'),/\.r1-preview-action\[hidden\]/);
});

test('estados R1.3: cinco patrones, accesibilidad y demostración no operativa',()=>{
  const script=read('assets/interaction-flows.js');
  const css=read('styles/interaction-flows.css');
  assert.doesNotThrow(()=>new vm.Script(script));
  assert.deepEqual(registry.interactionRecipes.map(x=>x.id),['idle','loading','empty','error','success']);
  for(const x of registry.interactionRecipes){
    assert.equal(x.material,'solid');
    assert.ok(x.purpose&&x.required.length&&x.avoid.length);
    assert.match(script,new RegExp(x.id+':\\s*\\{'));
  }
  for(const id of ['flujos','flow-state','flow-result','flow-title','flow-description','flow-rule']){
    assert.ok(html.includes('id="'+id+'"'),'Falta control '+id);
  }
  assert.match(html,/href="#flujos"/);
  assert.match(html,/href="styles\/interaction-flows.css"/);
  assert.match(html,/src="assets\/interaction-flows.js"/);
  assert.match(html,/id="flow-result"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(css,/prefers-reduced-motion\s*:\s*reduce/);
  assert.match(script,/no se envió información ni se guardó ningún cambio/i);
  assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|localStorage/);
});
