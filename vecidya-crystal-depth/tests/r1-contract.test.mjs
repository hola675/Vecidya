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
  dataset:{material:attrs(x[0],'data-material'),scene:attrs(x[0],'data-scene'),rule:attrs(x[0],'data-rule')}
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
  const els=Object.fromEntries(['r1-route-material','r1-route-scene','r1-route-rule'].map(id=>[id,{textContent:''}]));
  const select={options:routes,selectedIndex:0,addEventListener(k,fn){assert.equal(k,'change');this.change=fn;}};
  const document={getElementById:id=>id==='r1-intent'?select:els[id]};
  vm.runInNewContext(part('const r1Intent = document.getElementById("r1-intent")','document.getElementById("r1-copy").addEventListener'),{document});
  for(let i=0;i<routes.length;i++){
    select.selectedIndex=i;select.change();
    assert.equal(els['r1-route-material'].textContent,routes[i].dataset.material);
    assert.equal(els['r1-route-scene'].textContent,routes[i].dataset.scene);
    assert.equal(els['r1-route-rule'].textContent,routes[i].dataset.rule);
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
