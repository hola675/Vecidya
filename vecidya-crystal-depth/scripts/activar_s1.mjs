#!/usr/bin/env node
// Crystal World S1 — v1.1.0, 2026-11-23
// Check mode by default; --apply replaces only five catalogue entries after verification.
import { readFile, writeFile, copyFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const checkOnly=!process.argv.includes('--apply');
// QA ARTISTICO ES OBLIGATORIO: ni checksum ni build equivalen a aprobacion.
const reviewManifest=JSON.parse(await readFile(join(project,'assets/s1-replacement-manifest.json'),'utf8'));
const unapproved=(reviewManifest.items||[]).filter(x=>x.visualQa!=='ACEPTADO');
if(unapproved.length || reviewManifest.checks?.releaseAllowed!==true){
  throw new Error('S1 BLOQUEADA por QA visual: '+unapproved.map(x=>x.id+':'+(x.visualQa||'sin revision')).join(', ')+'. No aplicar --apply hasta aprobar TODOS los assets.');
}

const old=[
  ['selected/backgrounds/bg-section-map-wave-dark.webp','bg-crystal-world-master-dark-v1.webp','s1-01','027-bg-section-map-wave-dark.webp'],
  ['selected/backgrounds/bg-soft-map-orange-blue.webp','bg-crystal-world-master-light-v1.webp','s1-02','028-bg-soft-map-orange-blue.webp'],
  ['selected/backgrounds/bg-hero-soft-map-wave.webp','bg-crystal-world-hero-light-v1.webp','s1-03','025-bg-hero-soft-map-wave.webp'],
  ['selected/backgrounds/bg-network-route-pins.webp','bg-crystal-world-network-v1.webp','s1-04','026-bg-network-route-pins.webp'],
  ['selected/decorative/decor-reviews-location-card.png','decor-crystal-world-reviews-v1.webp','s1-05','034-decor-reviews-location-card.webp'],
];
const sourceRoot=join(project,'assets/candidates/crystal-world/s1');
const outputRoot=join(project,'assets/library-assets/crystal-world/s1');
const previewDir=join(project,'assets/catalog-previews');
const oldCatalogPath=join(project,'assets/library-catalog.js');
const classificationPath=join(project,'assets/asset-classification.json');
let catalog=await readFile(oldCatalogPath,'utf8');
const classification=JSON.parse(await readFile(classificationPath,'utf8'));
for(const [original,asset,id,priorPreview] of old){
 const sourceFile=join(sourceRoot,asset);
 await stat(sourceFile);
 const preview=join(previewDir,`${id}-${asset}`);
 await stat(preview);
 const oldLink=`assets/library-assets/${original}`;
 const newLink=`assets/library-assets/crystal-world/s1/${asset}`;
 if(!catalog.includes(oldLink) && !catalog.includes(newLink)) throw new Error('Catálogo no contiene '+oldLink);
 if(catalog.includes(oldLink))catalog=catalog.replaceAll(oldLink,newLink);
 const oldPreviewPath=`assets/catalog-previews/${priorPreview}`;
 const newPreviewPath=`assets/catalog-previews/${id}-${asset}`;
 if(catalog.includes(oldPreviewPath)) catalog=catalog.replaceAll(oldPreviewPath,newPreviewPath);
 const item=classification.assets.find(x=>x.id===original || x.source===oldLink || x.source===newLink);
 if(!item)throw new Error('Clasificación no contiene '+original);
 item.originalSource??=oldLink;
 item.source=newLink;item.id=`crystal-world/s1/${asset}`;
 item.preview=newPreviewPath;
 item.format='webp'; item.dimensions={width:1672,height:941,aspectRatio:1.777};
 item.review={status:'candidato-activado-local-pendiente-qa-visual-publicacion',flags:[]};
}
const mobile=['bg-crystal-world-master-dark-mobile-v1.webp','bg-crystal-world-master-light-mobile-v1.webp'];
for(const f of mobile)await stat(join(sourceRoot,f));
if(checkOnly){console.log('S1 CHECK PASS: 5 candidatos + 5 vistas previas + 2 móviles; sin mutaciones');process.exit(0);}
await mkdir(outputRoot,{recursive:true});
for(const [,asset] of old)await copyFile(join(sourceRoot,asset),join(outputRoot,asset));
for(const f of mobile)await copyFile(join(sourceRoot,f),join(outputRoot,f));
await writeFile(oldCatalogPath,catalog,'utf8');
await writeFile(classificationPath,JSON.stringify(classification,null,2)+'\n','utf8');
console.log('S1 ACTIVADO LOCALMENTE en catálogo: 5/5; originales preservados; ejecutar tests/build antes de commit.');
