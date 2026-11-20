/**
 * Crystal Depth R2: navegador real sobre los archivos del PR, sin despliegue.
 * Inicia un servidor estático local, comprueba estados y captura evidencias.
 * Node >=22; Playwright instalado desde vecidya-platform.
 */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, extname, join, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const library=join(root,'vecidya-crystal-depth');
const require=createRequire(join(root,'vecidya-platform/package.json'));
const {chromium}=require('playwright');
const artifacts=join(library,'qa-artifacts');
mkdirSync(artifacts,{recursive:true});
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const failures=[],results=[],pageErrors=[],badResponses=[];
const server=createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    const decoded=decodeURIComponent(url.pathname);
    const file=resolve(root,'.'+decoded);
    if(!file.startsWith(root+sep)||!existsSync(file)){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'content-type':MIME[extname(file)]||'application/octet-stream','cache-control':'no-store'});
    createReadStream(file).pipe(res);
  }catch{res.writeHead(400);res.end('Invalid request');}
});
const assertStep=(name,fn)=>{
  try{fn();results.push({name,result:'PASS'});}
  catch(error){failures.push({name,error:String(error)});results.push({name,result:'FAIL',error:String(error)});}
};
const viewportList=[320,390,768,1366,1920];
let browser;
try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const addr='http://127.0.0.1:'+server.address().port+'/vecidya-crystal-depth/biblioteca.html';
  browser=await chromium.launch({channel:process.env.VX_CHROME_CHANNEL||'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const width of viewportList){
    const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
    page.on('pageerror',e=>pageErrors.push({width,message:String(e)}));
    page.on('response',r=>{if(r.status()>=400)badResponses.push({width,status:r.status(),url:r.url()});});
    try{
      await page.goto(addr,{waitUntil:'load',timeout:45000});
      await page.locator('#asset-grid .asset-card').first().waitFor({timeout:15000});
      const state=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,checked:document.getElementById('theme-toggle').getAttribute('aria-checked'),assets:document.querySelectorAll('#asset-grid .asset-card').length,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,focusable:document.querySelectorAll('button,select,input,a[href]').length,overflowNodes:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,className:String(e.className?.baseVal??e.className??'').slice(0,70),left:Math.round(e.getBoundingClientRect().left),right:Math.round(e.getBoundingClientRect().right),scroll:e.scrollWidth,client:e.clientWidth})).filter(e=>e.right>innerWidth+2&&e.left<innerWidth+8).slice(0,14)}));
      assertStep('viewport-'+width,()=>{
        assert.equal(state.theme,'dark');
        assert.equal(state.checked,'true');
        assert.equal(state.assets,140);
        assert.ok(state.scrollWidth<=state.clientWidth+2,'Desbordamiento horizontal: '+JSON.stringify(state));
      });
      await page.screenshot({path:join(artifacts,'r2-'+width+'-dark.png'),animations:'disabled'});
      if(width===390||width===1366){
        await page.locator('#theme-toggle').click();
        const switched=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,checked:document.querySelector('#theme-toggle').getAttribute('aria-checked')}));
        assertStep('tema-claro-'+width,()=>assert.deepEqual(switched,{theme:'light',checked:'false'}));
        await page.screenshot({path:join(artifacts,'r2-'+width+'-light.png'),animations:'disabled'});
        await page.locator('#theme-toggle').click();
        const back=await page.evaluate(()=>document.documentElement.dataset.theme);
        assertStep('retorno-oscuro-'+width,()=>assert.equal(back,'dark'));
      }
      if(width===390){
        await page.locator('#r1-intent').selectOption('editar-miniweb');
        const route=await page.evaluate(()=>({
          material:document.getElementById('r1-route-material').textContent,
          scene:document.getElementById('r1-route-scene').textContent,
          rule:document.getElementById('r1-route-rule').textContent
        }));
        assertStep('selector-miniweb',()=>{
          assert.equal(route.material,'Solid Readable + Quiet');
          assert.match(route.scene,/Sin escena detrás del editor/);
          assert.match(route.rule,/borrador/i);
        });
        await page.locator('#r1-intent').selectOption('diagnosticar');
        const route2=await page.evaluate(()=>({
          material:document.getElementById('r1-route-material').textContent,
          scene:document.getElementById('r1-route-scene').textContent,
          rule:document.getElementById('r1-route-rule').textContent
        }));
        assertStep('selector-diagnostico',()=>{
          assert.equal(route2.material,'Solid Readable');
          assert.equal(route2.scene,'diagnostic-scene');
          assert.match(route2.rule,/puntuación/);
        });
        await page.locator('#r1-intent').scrollIntoViewIfNeeded();
        await page.screenshot({path:join(artifacts,'r2-390-guide.png'),animations:'disabled'});
      }
      if(width===1366){
        // Restablecer foco tras los dos clics del tema; Tab debe empezar en el skip-link.
        await page.goto(addr,{waitUntil:'load',timeout:45000});
        await page.keyboard.press('Tab');
        const focus=await page.evaluate(()=>{
          const e=document.activeElement;
          const style=getComputedStyle(e);
          return {className:e.className||'',href:e.getAttribute('href'),outlineStyle:style.outlineStyle,outlineWidth:style.outlineWidth};
        });
        assertStep('teclado-skip-link',()=>{
          assert.equal(focus.href,'#contenido');
          assert.notEqual(focus.outlineStyle,'none');
          assert.ok(parseFloat(focus.outlineWidth)>=2);
        });
        await page.locator('#tab-overview').focus();
        await page.keyboard.press('ArrowRight');
        const tab=await page.locator('#tab-activity').getAttribute('aria-selected');
        assertStep('tabs-teclado',()=>assert.equal(tab,'true'));
        await page.locator('#open-dialog').click();
        const opened=await page.locator('#sample-dialog').evaluate(el=>el.open);
        await page.keyboard.press('Escape');
        const closed=await page.locator('#sample-dialog').evaluate(el=>!el.open);
        assertStep('dialogo-escape',()=>{assert.ok(opened);assert.ok(closed);});
        await page.locator('#asset-search').fill('Vico');
        const visible=await page.locator('#asset-grid .asset-card:visible').count();
        assertStep('busqueda-vico',()=>assert.ok(visible>=10&&visible<140,'Resultados: '+visible));
        await page.locator('#asset-search').fill('unterminoquenoexiste12345');
        const empty=await page.locator('#asset-empty').isVisible();
        assertStep('estado-vacio',()=>assert.ok(empty));
        await page.locator('#asset-search').fill('');
      }
      const images=await page.locator('.hero-visual img').evaluateAll(imgs=>imgs.filter(img=>img.complete&&!img.naturalWidth).map(img=>img.src));
      assertStep('hero-assets-'+width,()=>assert.equal(images.length,0,'Imágenes rotas: '+images.join(', ')));
    }catch(e){failures.push({name:'error-vista-'+width,error:String(e)});}
    finally{await page.close();}
  }
  const catalog=readFileSync(join(library,'assets/library-catalog.js'),'utf8');
  const previews=[...catalog.matchAll(/"preview": "([^"]+)"/g)].map(x=>x[1]);
  const missing=previews.filter(p=>!existsSync(resolve(library,p)));
  assertStep('catalogo-previews',()=>{assert.equal(previews.length,140);assert.deepEqual(missing,[]);});
  assertStep('errores-js',()=>assert.deepEqual(pageErrors,[]));
  assertStep('respuestas-http',()=>assert.deepEqual(badResponses,[]));
}finally{
  if(browser)await browser.close();
  await new Promise(r=>server.close(r));
  writeFileSync(join(artifacts,'r2-results.json'),JSON.stringify({results,failures,pageErrors,badResponses},null,2));
  console.log(JSON.stringify({passed:results.filter(x=>x.result==='PASS').length,failed:failures.length,failures},null,2));
}
if(failures.length)process.exitCode=1;
