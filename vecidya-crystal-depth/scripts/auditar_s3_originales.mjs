#!/usr/bin/env node
// Vecidya Crystal World | Auditoria de fuentes S3 | v1.0.0 | 2026-11-23
// Lee fuentes y metadatos reales, crea galeria en qa/s3/originales; no modifica catalogo ni activos.
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const repo=resolve(root,'..');
const at=(p)=>join(root,p);
const mf=JSON.parse(await readFile(at('assets/s3-replacement-manifest.json'),'utf8'));
const cls=JSON.parse(await readFile(at('assets/asset-classification.json'),'utf8'));
const catRaw=await readFile(at('assets/library-catalog.js'),'utf8');
const cat=JSON.parse(catRaw.replace(/^window\.vecidyaCrystalCatalog\s*=\s*/,'').replace(/;\s*$/,''));
const platform=await readFile(join(repo,'vecidya-platform/app/assets/public-assets.ts'),'utf8').catch(()=>null);
if(mf.items?.length!==12)throw Error('Inventario S3 incompleto: esperado 12');
if(cat.length!==140||cls.assets.length!==140)throw Error('La biblioteca no tiene exactamente 140 entradas');
const entries=[],seen=new Set(); let errors=0;
for(const item of mf.items){
 if(seen.has(item.id))throw Error('ID S3 repetido: '+item.id);seen.add(item.id);
 const source=at(item.original),preview=at(item.originalPreview);
 try {
  const [src,pre]=await Promise.all([stat(source),stat(preview)]);
  const entry=cat.find(x=>x.source===item.original),classified=cls.assets.find(x=>x.source===item.original);
  if(!entry||!classified)throw Error('Fuente ausente del catalogo o de la clasificacion');
  const name=item.original.split('/').pop();
  const platformListed=platform?platform.includes(name):null;
  const record={id:item.id,name:item.name,source:item.original,preview:item.originalPreview,kind:item.kind,originalDimensions:item.dimensions,bytes:src.size,previewBytes:pre.size,platformListed,catalogName:entry.name,review:'SIN APROBACION — ORIGINAL',sourceMatchesCatalog:true};
  entries.push(record);console.log('PASS',item.id,name,platformListed?'referenciado por plataforma':platformListed===null?'plataforma no disponible':'sin evidencia directa en mapeo');
 }catch(e){errors++;entries.push({id:item.id,source:item.original,status:'FAIL',reason:e.message});console.error('FAIL',item.id,e.message);}
}
if(errors){console.error('ERROR: '+errors+' fuentes o previews faltantes; no crear galeria');process.exit(1);}
const q=at('qa/s3/originales');await mkdir(q,{recursive:true});
const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const files=(p)=>'../../../'+p;
const cards=entries.map(x=>{
 const src=files(x.source),preview=files(x.preview),isSmall=x.kind==='vector-operativo';
 const samples=isSmall?[24,32,48,96,160]:[96,160,320];
 return '<article><h2>'+esc(x.id)+' · '+esc(x.name)+'</h2><p>'+esc(x.kind)+' · '+esc(x.originalDimensions.width)+'×'+esc(x.originalDimensions.height)+' · '+esc(x.bytes)+' bytes</p>'+
  '<div class="stage dark"><img src="'+esc(src)+'" alt="'+esc(x.name)+'"></div><div class="stage light"><img src="'+esc(src)+'" alt=""></div>'+
  '<div class="sizes">'+samples.map(size=>'<div><div class="mini dark"><img src="'+esc(src)+'" width="'+size+'" height="'+size+'" alt=""></div><small>'+size+' px</small></div>').join('')+'</div>'+
  '<p class="meta">Origen: '+esc(x.source)+'<br>Referencia de plataforma: '+(x.platformListed?'en mapeo':x.platformListed===null?'no comprobada':'no hallada en mapeo')+'</p></article>';
}).join('\n');
const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>S3 auditoría de originales · Vecidya</title><style>'+
'*{box-sizing:border-box}body{margin:0;background:#06172f;color:#f3f8ff;font:15px system-ui,sans-serif}header{padding:24px 4vw;background:#0d2e54}h1{font-size:clamp(1.4rem,4vw,2rem);margin:0}header p{max-width:70ch;color:#c8e5fc}main{padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:18px}article{border:1px solid #51e3ff55;border-radius:18px;background:#123766;padding:16px;min-width:0}h2{font-size:1.1rem;margin:0 0 6px}article p{color:#d5eafb;font-size:.8rem}.stage{height:190px;display:grid;place-items:center;overflow:hidden;border-radius:14px;margin-top:8px}.stage img{display:block;max-height:90%;max-width:90%;object-fit:contain}.dark{background:linear-gradient(145deg,#06172f,#0754c9)}.light{background:linear-gradient(145deg,#f1f7fe,#a8d9fb)}.sizes{display:flex;gap:8px;overflow:auto;margin:14px 0}.sizes>div{display:grid;gap:4px;text-align:center;flex:none}.mini{width:175px;height:178px;display:flex;align-items:center;justify-content:center;border-radius:8px}.mini img{max-height:170px;object-fit:contain}.meta{overflow-wrap:anywhere}small{color:#b1dbfa}footer{padding:20px;text-align:center;color:#b1dbfa}</style></head><body>'+
'<header><h1>Auditoría S3 · 12 originales reales</h1><p>Esta galería NO presenta nuevos candidatos ni aprobación artística. Compara uso L4 a 24/32/48 px y las ilustraciones L5 a 96/160/320 px sobre fondos de S1. No se ha modificado el catálogo.</p></header><main>'+cards+'</main><footer>S3 sigue bloqueada hasta generar y aprobar 12 recursos nuevos. Contenido y controles interactivos deben ser HTML/CSS.</footer></body></html>';
await writeFile(join(q,'index.html'),html,'utf8');
await writeFile(join(q,'audit.json'),JSON.stringify({version:'1.0.0',date:'2026-11-23',source:'GitHub repo copy; local files',catalogEntries:cat.length,classificationEntries:cls.assets.length,total:12,platformMapChecked:platform!==null,results:entries},null,2)+'\n','utf8');
console.log('PASS AUDITORIA S3: 12 originales, 12 previews, 140 registros. Galeria: qa/s3/originales/index.html');
