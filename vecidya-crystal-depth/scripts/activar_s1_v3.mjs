#!/usr/bin/env node
// Vecidya Crystal Depth — activar S1 v3 · v1.0.0 · 2026-11-23
// Activación local explícita, sin borrar originales. Necesita manifiesto aprobado y binarios con SHA-256 correcto.
import { readFile, writeFile, copyFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const path=(p)=>join(root,p);
const apply=process.argv.includes('--apply');
const manifest=JSON.parse(await readFile(path('assets/s1-replacement-manifest.json'),'utf8'));
const expected=[
 {id:'S1-01',old:'selected/backgrounds/bg-section-map-wave-dark.webp',name:'bg-crystal-world-master-dark-v1.webp',oldPreview:'027-bg-section-map-wave-dark.webp'},
 {id:'S1-02',old:'selected/backgrounds/bg-soft-map-orange-blue.webp',name:'bg-crystal-world-master-light-v1.webp',oldPreview:'028-bg-soft-map-orange-blue.webp'},
 {id:'S1-03',old:'selected/backgrounds/bg-hero-soft-map-wave.webp',name:'bg-crystal-world-hero-light-v2.webp',oldPreview:'025-bg-hero-soft-map-wave.webp'},
 {id:'S1-04',old:'selected/backgrounds/bg-network-route-pins.webp',name:'bg-crystal-world-network-v1.webp',oldPreview:'026-bg-network-route-pins.webp'},
 {id:'S1-05',old:'selected/decorative/decor-reviews-location-card.png',name:'decor-crystal-world-reviews-v3.webp',oldPreview:'034-decor-reviews-location-card.webp'}
];
const mobile=['S1-01-mobile','S1-02-mobile'];
const map=new Map((manifest.v3VerifiedCandidates||[]).map(x=>[x.id,x]));
if(manifest.approvals?.s1v3?.status!=='APROBADO-POR-USUARIO')throw Error('S1 v3 no aprobada en el manifiesto');
const all=[...expected.map(x=>x.id),...mobile];
if(all.some(x=>!map.has(x)))throw Error('Faltan candidatos v3 en manifiesto');
const candidateRoot='assets/candidates/crystal-world/s1/';
const destRoot='assets/library-assets/crystal-world/s1/';
for(const id of all){
 const entry=map.get(id),binary=await readFile(path(candidateRoot+entry.name));
 const hash=createHash('sha256').update(binary).digest('hex');
 if(hash!==entry.sha256)throw Error('Checksum incorrecto '+id+' '+entry.name);
 if(binary.length!==entry.bytes)throw Error('Peso incorrecto '+id);
 if(binary.toString('ascii',0,4)!=='RIFF' || binary.toString('ascii',8,12)!=='WEBP')throw Error('Formato WEBP inválido '+id);
}
for(const entry of expected){
 const preview='assets/catalog-previews/'+entry.id.toLowerCase()+'-'+entry.name;
 await stat(path(preview));
 await stat(path('assets/library-assets/'+entry.old));
}
const catalogPath='assets/library-catalog.js';
const classPath='assets/asset-classification.json';
const catalogText=await readFile(path(catalogPath),'utf8');
const classText=await readFile(path(classPath),'utf8');
const classification=JSON.parse(classText);
let catalog=catalogText;
for(const e of expected){
 const oldLink='assets/library-assets/'+e.old,newLink=destRoot+e.name;
 const oldPreview='assets/catalog-previews/'+e.oldPreview;
 const newPreview='assets/catalog-previews/'+e.id.toLowerCase()+'-'+e.name;
 if(!catalog.includes(oldLink))throw Error('Catálogo original ausente o ya activado: '+oldLink);
 if(!catalog.includes(oldPreview))throw Error('Miniatura previa ausente: '+oldPreview);
 catalog=catalog.replaceAll(oldLink,newLink).replaceAll(oldPreview,newPreview);
 const item=classification.assets.find(x=>x.source===oldLink);
 if(!item)throw Error('Item clasificación ausente: '+oldLink);
 item.originalSource=oldLink;
 item.source=newLink;item.preview=newPreview;item.id='crystal-world/s1/'+e.name;
 item.format='webp';item.dimensions={width:1672,height:941,aspectRatio:1672/941};
 item.review={status:'aprobacion-visual-usuario-s1-v3',flags:[],date:'2026-11-23'};
 item.design={...item.design,material:e.id==='S1-05'?'cristal-3d-rgba':'crystal-world-3d',layer:e.id==='S1-05'?'L5':'L0-L1'};
}
if((catalog.match(/assets\/library-assets\/crystal-world\/s1\//g)||[]).length!==5)throw Error('El catálogo no tiene exactamente cinco nuevos enlaces');
if(classification.assets.length!==140)throw Error('Conteo clasificación distinto de 140');
console.log('S1 v3 PREFLIGHT PASS: 7 hashes, 5 rutas y previews, clasificación 140. Modo:',apply?'APPLY':'CHECK');
if(!apply){console.log('Sin cambios. Para integrar localmente: node scripts/activar_s1_v3.mjs --apply');process.exit(0);}
const backup=path('qa/s1-v3/backup-before-activation');
await mkdir(backup,{recursive:true});
await writeFile(join(backup,'library-catalog.js'),catalogText,'utf8');
await writeFile(join(backup,'asset-classification.json'),classText,'utf8');
await mkdir(path(destRoot),{recursive:true});
for(const id of all){const e=map.get(id);await copyFile(path(candidateRoot+e.name),path(destRoot+e.name));}
await writeFile(path(catalogPath),catalog,'utf8');
await writeFile(path(classPath),JSON.stringify(classification,null,2)+'\n','utf8');
console.log('S1 v3 ACTIVADA LOCALMENTE: 5/5, 2 móviles copiados, originales intactos, backup: qa/s1-v3/backup-before-activation');
console.log('Pendiente: node scripts/build-cloudflare.mjs, revisar navegador, git diff y commit/push propios. No despliegue automático.');
