#!/usr/bin/env node
// Vecidya Crystal World · activar S2 · v1.0.1 · 2026-11-23
// --check (por defecto): validación sin cambios. --apply: integra diez escenas ya aprobadas con backup.
import {readFile,writeFile,copyFile,stat,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const at=(p)=>join(root,p);
const applying=process.argv.includes('--apply');
if(process.argv.some(a=>a.startsWith('--')&&!['--apply','--check'].includes(a)))throw Error('Parámetro desconocido');
const mf=JSON.parse(await readFile(at('assets/s2-replacement-manifest.json'),'utf8'));
if(mf.approval?.status!=='APROBADO-USUARIO'||mf.items?.length!==10||mf.items.some(x=>x.approved!==true||x.visualQA!=='APROBADO-USUARIO'))throw Error('S2 no está aprobada en su totalidad');
const catalogPath='assets/library-catalog.js',classPath='assets/asset-classification.json';
const catalogRaw=await readFile(at(catalogPath),'utf8'),classRaw=await readFile(at(classPath),'utf8');
if(!catalogRaw.startsWith('window.vecidyaCrystalCatalog = '))throw Error('Formato de catálogo inesperado');
const catalog=JSON.parse(catalogRaw.replace(/^window\.vecidyaCrystalCatalog\s*=\s*/,'').replace(/;\s*$/,''));
const classification=JSON.parse(classRaw);
if(catalog.length!==140||classification.assets?.length!==140)throw Error('Inventario incompleto: se esperaban 140 recursos');
const localPrefix='assets/candidates/crystal-world/s2/';
const activePrefix='assets/library-assets/crystal-world/s2/';
const validated=[];
for(const item of mf.items){
 const original=item.original,newFile=item.deliveryFilename;
 if(!/^s2-\d\d-[a-z-]+-scene-v1\.webp$/.test(newFile))throw Error('Nombre inesperado '+newFile);
 const source=localPrefix+newFile,src=await readFile(at(source));
 const hash=createHash('sha256').update(src).digest('hex');
 if(hash!==item.sha256||src.length!==item.bytes)throw Error('Integridad incorrecta: '+item.id+' '+source);
 if(src.toString('ascii',0,4)!=='RIFF'||src.toString('ascii',8,12)!=='WEBP')throw Error('Formato no WebP '+source);
 const preview='assets/catalog-previews/'+item.id.toLowerCase()+'-'+item.key+'-scene-preview.webp';
 await stat(at(preview));
 await stat(at(original));
 const cat=catalog.find(x=>x.source===original);
 const cls=classification.assets.find(x=>x.source===original);
 if(!cat||!cls)throw Error('Referencia original no encontrada o catálogo ya activado: '+original);
 const newLink=activePrefix+newFile;
 cat.originalSource=original;
 cat.source=newLink;cat.preview=preview;cat.format='WEBP';cat.width=1536;cat.height=1024;
 cat.treatment='Crystal World · WebP transparente';
 cls.originalSource=original;cls.source=newLink;cls.preview=preview;
 cls.id='crystal-world/s2/'+newFile;cls.format='webp';
 cls.dimensions={width:1536,height:1024,aspectRatio:1.5};
 cls.design={...cls.design,material:'crystal-world-3d-rgba',layer:'L1-L2-L5'};
 cls.review={status:'aprobacion-visual-usuario-s2',flags:[],date:'2026-11-23'};
 validated.push({id:item.id,src:source,dest:activePrefix+newFile});
 console.log('PASS '+item.id+' '+newFile);
}
if(new Set(validated.map(x=>x.dest)).size!==10)throw Error('Rutas duplicadas');
if(catalog.filter(x=>x.source.startsWith(activePrefix)).length!==10)throw Error('No hay exactamente 10 escenas nuevas');
const nextCatalog='window.vecidyaCrystalCatalog = '+JSON.stringify(catalog,null,2)+';\n';
const nextClass=JSON.stringify(classification,null,2)+'\n';
console.log('S2 PREFLIGHT PASS: 10 SHA-256 + 10 previews + 10 originales + 140 entradas.');
if(!applying){console.log('Sin mutaciones. Usa --apply para integrar localmente.');process.exit(0);}
const backup=at('qa/s2/backup-before-activation');
await mkdir(backup,{recursive:true});
await writeFile(join(backup,'library-catalog.js'),catalogRaw);
await writeFile(join(backup,'asset-classification.json'),classRaw);
await mkdir(at(activePrefix),{recursive:true});
for(const item of validated)await copyFile(at(item.src),at(item.dest));
await writeFile(at(catalogPath),nextCatalog);
await writeFile(at(classPath),nextClass);
console.log('S2 ACTIVADA EN COPIA LOCAL: 10/10; originales intactos. Backups: qa/s2/backup-before-activation');
console.log('Pendientes: build y prueba real; git diff --check; git add/commit/push a main. Sin deploy automático.');
