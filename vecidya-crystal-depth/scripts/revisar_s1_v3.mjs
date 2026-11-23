#!/usr/bin/env node
// Vecidya Crystal Depth S1 v3 — v1.0.0 · 2026-11-23
// No muta catálogo ni publica. Modo por defecto: auditoría local; --stage crea una vista QA en carpeta separada.
import { readFile, mkdir, copyFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const candidates = join(root, 'assets', 'candidates', 'crystal-world', 's1');
const previews = join(root, 'assets', 'catalog-previews');
const stage = join(root, 'qa', 's1-v3');
const entries = [
  { id:'S1-01', name:'bg-crystal-world-master-dark-v1.webp', preview:'s1-01-bg-crystal-world-master-dark-v1.webp', mode:'RGB', level:'L0', title:'Maestro oscuro' },
  { id:'S1-02', name:'bg-crystal-world-master-light-v1.webp', preview:'s1-02-bg-crystal-world-master-light-v1.webp', mode:'RGB', level:'L0', title:'Maestro claro' },
  { id:'S1-03', name:'bg-crystal-world-hero-light-v2.webp', preview:'s1-03-bg-crystal-world-hero-light-v2.webp', mode:'RGB', level:'L0', title:'Portada clara' },
  { id:'S1-04', name:'bg-crystal-world-network-v1.webp', preview:'s1-04-bg-crystal-world-network-v1.webp', mode:'RGB', level:'L0–L1', title:'Conexiones del Vecindario' },
  { id:'S1-05', name:'decor-crystal-world-reviews-v3.webp', preview:'s1-05-decor-crystal-world-reviews-v3.webp', mode:'RGBA', level:'L5', title:'Reseñas (transparente)' },
  { id:'S1-01-mobile', name:'bg-crystal-world-master-dark-mobile-v2.webp', mode:'RGB', level:'L0', title:'Maestro oscuro móvil' },
  { id:'S1-02-mobile', name:'bg-crystal-world-master-light-mobile-v2.webp', mode:'RGB', level:'L0', title:'Maestro claro móvil' }
];
const mime='image/webp';
const report=[];
const wp8x = (buffer) => {
 if (buffer.toString('ascii',0,4)!=='RIFF' || buffer.toString('ascii',8,12)!=='WEBP') throw Error('Cabecera WebP inválida');
 // Iterate RIFF chunks to find VP8X. A non-extended WebP may not contain VP8X; it is not valid as S1-05.
 let offset=12;
 while(offset + 8 <= buffer.length){
  const fourcc=buffer.toString('ascii',offset,offset+4);
  const size=buffer.readUInt32LE(offset+4);
  if(offset+8+size>buffer.length) throw Error('Chunk truncado '+fourcc);
  if(fourcc==='VP8X'){
   if(size<10)throw Error('Chunk VP8X incompleto');
   const flags=buffer[offset+8],w=1+buffer.readUIntLE(offset+12,3),h=1+buffer.readUIntLE(offset+15,3);
   return {alpha:Boolean(flags&0x10),width:w,height:h,extended:true};
  }
  offset+=8+size+(size&1);
 }
 return {alpha:false,width:null,height:null,extended:false};
};
let error=false;
for(const item of entries){
 try{
  const path=join(candidates,item.name),raw=await readFile(path),hdr=wp8x(raw);
  if(raw.length<500)throw Error('Archivo vacío/corto');
  if(hdr.width && (hdr.width!==(item.id.endsWith('-mobile')?960:1672)||hdr.height!==(item.id.endsWith('-mobile')?1280:941))) throw Error('Dimensiones no esperadas '+hdr.width+'x'+hdr.height);
  if(item.mode==='RGBA' && !hdr.alpha)throw Error('El decorativo no contiene indicador ALFA VP8X');
  if(item.preview)await stat(join(previews,item.preview));
  report.push({...item,status:'PASS',sha256:createHash('sha256').update(raw).digest('hex'),bytes:raw.length,alpha:hdr.alpha,width:hdr.width,height:hdr.height});
  console.log('PASS',item.id,item.name,hdr.alpha?'ALFA':'opaco');
 }catch(e){error=true;report.push({...item,status:'FAIL',error:e.message});console.error('FAIL',item.id,e.message);}
}
if(error){console.error('S1 v3: preflight falló; no se generó vista QA.');process.exit(1);}
const catalog=await readFile(join(root,'assets','library-catalog.js'),'utf8');
const oldPaths=[
 'assets/library-assets/selected/backgrounds/bg-section-map-wave-dark.webp',
 'assets/library-assets/selected/backgrounds/bg-soft-map-orange-blue.webp',
 'assets/library-assets/selected/backgrounds/bg-hero-soft-map-wave.webp',
 'assets/library-assets/selected/backgrounds/bg-network-route-pins.webp',
 'assets/library-assets/selected/decorative/decor-reviews-location-card.png'
];
if(oldPaths.some(path=>!catalog.includes(path))){
 console.error('FAIL: catálogo no contiene las cinco referencias originales. No ejecutar con un catálogo ya activado.');
 process.exit(1);
}
console.log('PASS: cinco referencias originales intactas; sin cambios en catálogo.');
if(process.argv.includes('--apply')){console.error('BLOQUEADO: este script es solo QA; --apply no existe.');process.exit(2);}
if(!process.argv.includes('--stage')){console.log('QA S1 v3 preflight PASS 7/7. Ejecuta --stage para crear una galería local sin activación.');process.exit(0);}
await mkdir(join(stage,'images'),{recursive:true});
for(const item of entries)await copyFile(join(candidates,item.name),join(stage,'images',item.name));
const htmlEscape = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const card = item => {
 const name=htmlEscape(item.name),title=htmlEscape(item.title);
 const visual=item.mode==='RGBA'
  ? `<div class="alpha-grid"><img class="isolated" src="images/${name}" alt="${title}"></div><div class="dark-bg"><img class="isolated" src="images/${name}" alt=""></div><div class="light-bg"><img class="isolated" src="images/${name}" alt=""></div>`
  : `<div class="cover"><img src="images/${name}" alt="${title}"><div class="copy"><strong>Tu negocio merece encontrarse.</strong><p>Texto HTML de prueba, no incrustado en la imagen.</p><a href="#" onclick="return false">Elemento visual de prueba</a></div></div>`;
 return `<article><h2>${htmlEscape(item.id)} — ${title} <small>${htmlEscape(item.level)}</small></h2>${visual}<p class="meta">${name}</p></article>`;
};
const page=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QA S1 v3 — Vecidya</title><style>
*{box-sizing:border-box}body{margin:0;background:#06172f;color:#fff;font:16px system-ui,-apple-system,sans-serif}header{padding:24px max(16px,4vw);background:#0d2e54}h1{font-size:clamp(1.4rem,3vw,2.4rem);margin:0 0 8px}header p{margin:0;color:#cce9fa}main{padding:20px;display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));}article{background:#0d2e54;border:1px solid #51e3ff66;border-radius:20px;overflow:hidden}h2{font-size:1.1rem;margin:16px}small{color:#51e3ff}.cover,.alpha-grid,.dark-bg,.light-bg{position:relative;overflow:hidden}.cover{aspect-ratio:1672/941}.cover>img{width:100%;height:100%;object-fit:cover}.copy{position:absolute;top:20%;left:6%;max-width:51%;padding:16px;background:#06172f88;border:1px solid #51e3ff77;border-radius:14px;text-shadow:0 2px 4px #001}.copy strong{font-size:clamp(1rem,2.3vw,1.7rem)}.copy a{display:inline-block;color:#06172f;background:#fff;padding:8px;border-radius:12px}.alpha-grid{background-color:#fff;background-image:linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%);background-size:32px 32px;background-position:0 0,0 16px,16px -16px,-16px 0}.isolated{display:block;width:100%;height:auto}.dark-bg{background:linear-gradient(135deg,#06172f,#0754c9)}.light-bg{background:linear-gradient(135deg,#f3f8ff,#92dfff)}.meta{font-size:.8rem;overflow-wrap:anywhere;margin:12px 16px;color:#b5def5}@media(max-width:600px){main{display:block;padding:8px}article{margin:16px 0}.cover{aspect-ratio:3/4}.cover>img{object-position:60% center}.copy{max-width:90%;left:5%;top:4%;padding:10px}.copy p{display:none}}</style></head><body><header><h1>Vecidya — inspección visual S1 v3</h1><p>Solo QA local: NO activa catálogo, NO certifica contraste, accesibilidad ni publicación. Revisar en móvil y escritorio.</p></header><main>${entries.map(card).join('\n')}</main></body></html>`;
await writeFile(join(stage,'index.html'),page,'utf8');
await writeFile(join(stage,'qa-report.json'),JSON.stringify({version:'1.0.0',status:'PREVIEW_ONLY_NOT_APPROVED',entries:report},null,2)+'\n');
console.log('QA preparado en qa/s1-v3/index.html; catálogo sin modificar. Abre el archivo en el navegador y revisa los siete recursos.');
