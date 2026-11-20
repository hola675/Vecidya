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
        const previewAction=page.locator('#r1-preview-link');
        const previewIsVisible=await previewAction.isVisible();
        const previewTarget=await previewAction.getAttribute('data-preview');
        assertStep('guia-con-composicion-'+width,()=>{
          assert.equal(previewIsVisible,true);
          assert.equal(previewTarget,'miniweb');
        });
        await previewAction.click();
        const fromGuide=await page.evaluate(()=>({
          scene:document.querySelector('#composer-tabs [aria-selected="true"]')?.id,
          fragment:location.hash
        }));
        assertStep('guia-abre-miniweb-'+width,()=>{
          assert.equal(fromGuide.scene,'composer-tab-miniweb');
          assert.equal(fromGuide.fragment,'#composiciones');
        });
        await page.locator('#composer-tab-publico').click();
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
        const missingPreview=await page.locator('#r1-preview-link').isHidden();
        const explanatoryNote=await page.locator('#r1-preview-note').textContent();
        assertStep('guia-sin-composicion-'+width,()=>{
          assert.ok(missingPreview);
          assert.match(explanatoryNote,/no tiene composición de página/);
        });
        await page.waitForFunction(()=>document.getElementById('r1-brief-status')?.textContent.includes('registro vigente'),{timeout:7000});
        await page.locator('#r1-intent').selectOption('contenido-editorial');
        await page.locator('#r1-brief-role').selectOption('editorial');
        const editorial=await page.locator('#r1-brief-preview').inputValue();
        assertStep('brief-editorial-registro-'+width,()=>{
          assert.match(editorial,/Colaborador editorial/);
          assert.match(editorial,/cualquier persona/);
          assert.match(editorial,/learn-journey-scene\.webp/);
          assert.match(editorial,/No inventes prestaciones ni resultados/);
        });
        await page.locator('#r1-brief-role').selectOption('quality');
        const quality=await page.locator('#r1-brief-preview').inputValue();
        assertStep('brief-subagente-calidad-'+width,()=>{
          assert.match(quality,/Calidad y certificación focal/);
          assert.match(quality,/pruebas deterministas/);
          assert.notEqual(quality,editorial);
        });
        await page.locator('#r1-intent').selectOption('administrar-plataforma');
        const fallbackBrief=await page.locator('#r1-brief-preview').inputValue();
        assertStep('brief-sin-escena-implícita-'+width,()=>{
          assert.match(fallbackBrief,/No existe una muestra R1\.4 específica/);
          assert.doesNotMatch(fallbackBrief,/Asset oficial:/);
        });
        await page.locator('#r1-intent').selectOption('diagnosticar');
        await page.locator('#r1-brief-role').selectOption('frontend');
        await page.locator('#r1-intent').scrollIntoViewIfNeeded();
        await page.screenshot({path:join(artifacts,'r2-390-guide.png'),animations:'disabled'});

        const motionInitial=await page.evaluate(()=>({
          mode:document.documentElement.dataset.motion,
          intensity:document.documentElement.dataset.motionIntensity,
          demo:!!document.querySelector('#movimiento'),
          stage:!!document.querySelector('#motion-stage.is-playing')
        }));
        assertStep('motion-inicial-390',()=>{
          assert.equal(motionInitial.mode,'enhanced');
          assert.equal(motionInitial.intensity,'standard');
          assert.ok(motionInitial.demo&&motionInitial.stage);
        });
        await page.locator('#motion-intensity').selectOption('subtle');
        const subtle=await page.evaluate(()=>document.documentElement.dataset.motionIntensity);
        assertStep('motion-intensidad-discreta',()=>assert.equal(subtle,'subtle'));
        await page.locator('#motion-play').click();
        const paused=await page.evaluate(()=>({
          state:document.documentElement.dataset.motionPlay,
          pressed:document.querySelector('#motion-play').getAttribute('aria-pressed')
        }));
        assertStep('motion-pausa',()=>assert.deepEqual(paused,{state:'paused',pressed:'true'}));
        await page.locator('#motion-play').click();
        const playing=await page.evaluate(()=>({
          state:document.documentElement.dataset.motionPlay,
          pressed:document.querySelector('#motion-play').getAttribute('aria-pressed')
        }));
        assertStep('motion-reanudar',()=>assert.deepEqual(playing,{state:'playing',pressed:'false'}));
        await page.locator('#motion-replay').click();
        assertStep('motion-replay',()=>assert.ok(true));
        await page.locator('#motion-stage').scrollIntoViewIfNeeded();
        await page.screenshot({path:join(artifacts,'r2-390-motion.png'),animations:'disabled'});
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.waitForFunction(()=>document.documentElement.dataset.motion==='static',{timeout:5000});
        const reduced=await page.evaluate(()=>({
          mode:document.documentElement.dataset.motion,
          playDisabled:document.querySelector('#motion-play').disabled,
          replayDisabled:document.querySelector('#motion-replay').disabled,
          scroll:getComputedStyle(document.documentElement).scrollBehavior,
          hiddenSections:[...document.querySelectorAll('.vx-motion-reveal')].filter(x=>getComputedStyle(x).opacity==='0').length
        }));
        assertStep('motion-reducido',()=>{
          assert.equal(reduced.mode,'static');
          assert.equal(reduced.playDisabled,true);
          assert.equal(reduced.replayDisabled,true);
          assert.equal(reduced.scroll,'auto');
          assert.equal(reduced.hiddenSections,0);
        });
        await page.emulateMedia({reducedMotion:'no-preference'});
        await page.waitForFunction(()=>document.documentElement.dataset.motion==='enhanced',{timeout:5000});

      }
      if(width===390||width===1366){
        const scenes=['publico','vecindario','aprende','miniweb'];
        const initial=await page.evaluate(()=>({
          tabs:document.querySelectorAll('#composer-tabs [role="tab"]').length,
          panels:document.querySelectorAll('#composer [role="tabpanel"]').length,
          selected:document.querySelector('#composer-tabs [aria-selected="true"]')?.id,
          open:[...document.querySelectorAll('#composer [role="tabpanel"]')].filter(x=>!x.hidden).map(x=>x.id)
        }));
        assertStep('compositor-inicial-'+width,()=>{
          assert.equal(initial.tabs,4);assert.equal(initial.panels,4);
          assert.equal(initial.selected,'composer-tab-publico');
          assert.deepEqual(initial.open,['composer-panel-publico']);
        });
        for(const scene of scenes){
          await page.locator('#composer-tab-'+scene).click();
          const state=await page.evaluate(()=>({
            id:document.querySelector('#composer-tabs [aria-selected="true"]')?.id,
            visible:[...document.querySelectorAll('#composer [role="tabpanel"]')].filter(x=>!x.hidden).map(x=>x.id),
            cta:document.querySelector('#composer [role="tabpanel"]:not([hidden]) .composer-cta')?.getAttribute('href')
          }));
          assertStep('compositor-'+scene+'-'+width,()=>{
            assert.equal(state.id,'composer-tab-'+scene);
            assert.deepEqual(state.visible,['composer-panel-'+scene]);
            assert.equal(state.cta,'#guia');
          });
        }
        await page.locator('#composer-tab-vecindario').focus();
        await page.keyboard.press('ArrowRight');
        const fromKeyboard=await page.evaluate(()=>({
          selected:document.querySelector('#composer-tabs [aria-selected="true"]')?.id,
          focused:document.activeElement?.id
        }));
        assertStep('compositor-teclado-'+width,()=>{
          assert.equal(fromKeyboard.selected,'composer-tab-aprende');
          assert.equal(fromKeyboard.focused,'composer-tab-aprende');
        });
        await page.keyboard.press('Home');
        const home=await page.evaluate(()=>document.activeElement?.id);
        assertStep('compositor-home-foco-'+width,()=>assert.equal(home,'composer-tab-publico'));
        await page.locator('#composer-panel-publico').scrollIntoViewIfNeeded();
        await page.screenshot({path:join(artifacts,'r2-'+width+'-composiciones.png'),animations:'disabled'});
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.locator('#composer-tab-vecindario').click();
        const reducedScene=await page.evaluate(()=>({
          selected:document.querySelector('#composer-tabs [aria-selected="true"]')?.id,
          effect:document.querySelector('#composer-panel-vecindario')?.dataset.transition,
          visible:!document.querySelector('#composer-panel-vecindario')?.hidden
        }));
        assertStep('compositor-reduced-motion-'+width,()=>{
          assert.equal(reducedScene.selected,'composer-tab-vecindario');
          assert.equal(reducedScene.effect,'');
          assert.ok(reducedScene.visible);
        });
        await page.emulateMedia({reducedMotion:'no-preference'});
      }
      if(width===390||width===1366){
        for(const stateName of ['idle','loading','empty','error','success']){
          await page.locator('#flow-state').selectOption(stateName);
          const flow=await page.evaluate(()=>({
            state:document.querySelector('#flow-result').dataset.state,
            title:document.querySelector('#flow-title').textContent,
            description:document.querySelector('#flow-description').textContent,
            rule:document.querySelector('#flow-rule').textContent,
            live:document.querySelector('#flow-result').getAttribute('aria-live')
          }));
          assertStep('flujo-'+stateName+'-'+width,()=>{
            assert.equal(flow.state,stateName);
            assert.equal(flow.live,'polite');
            assert.ok(flow.title.length>10&&flow.description.length>30&&flow.rule.length>30);
            if(stateName==='success')assert.match(flow.description,/No se envió información/);
          });
        }
        await page.locator('#flow-state').selectOption('idle');
        await page.locator('#flujos').scrollIntoViewIfNeeded();
        await page.screenshot({path:join(artifacts,'r2-'+width+'-flujos.png'),animations:'disabled'});
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.locator('#flow-state').selectOption('error');
        const noMotion=await page.locator('#flow-result').evaluate(el=>getComputedStyle(el).animationName);
        assertStep('flujo-movimiento-reducido-'+width,()=>assert.equal(noMotion,'none'));
        await page.emulateMedia({reducedMotion:'no-preference'});
      }
      if(width===390||width===1366){
        await page.waitForFunction(()=>document.getElementById('platform-bridge-content')?.hidden===false,{timeout:8000});
        const bridge=await page.evaluate(()=>({
          materials:document.querySelectorAll('#platform-bridge-surfaces article').length,
          components:document.querySelectorAll('#platform-bridge-components li').length,
          tokens:document.querySelectorAll('#platform-bridge-tokens tr').length,
          gaps:document.querySelectorAll('#platform-bridge-gaps li').length,
          stateNote:document.querySelector('#platform-bridge-state')?.textContent,
          status:document.querySelector('#platform-bridge-status').textContent,
          theme:document.documentElement.dataset.theme
        }));
        assertStep('idioma-compartido-'+width,()=>{
          assert.equal(bridge.materials,3);
          assert.equal(bridge.components,11);
          assert.equal(bridge.tokens,10);
          assert.equal(bridge.gaps,6);
          assert.match(bridge.status,/plataforma real sigue siendo la autoridad/);
          assert.match(bridge.stateNote,/acceso denegado/);
          assert.equal(bridge.theme,'dark');
        });
        await page.locator('#idioma').scrollIntoViewIfNeeded();
        await page.screenshot({path:join(artifacts,'r2-'+width+'-idioma.png'),animations:'disabled'});
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
      if(width===390 || width===1366){
        const vicoButtons=page.locator('#vico-workbench-gallery button');
        await vicoButtons.first().waitFor({timeout:10000});
        const vicoCount=await vicoButtons.count();
        assertStep('vico-catalogo-'+width,()=>assert.equal(vicoCount,10));
        await page.getByRole('button',{name:'Seleccionar Vico · vecindario'}).click();
        await page.locator('#vico-workbench-background').selectOption('checker');
        await page.locator('#vico-workbench-position').selectOption('left');
        await page.locator('#vico-workbench-size').evaluate((node)=>{
          node.value='110';
          node.dispatchEvent(new Event('input',{bubbles:true}));
        });
        await page.locator('#vico-workbench-scene').check();
        await page.locator('#vico-workbench-image').evaluate((image)=>image.decode());
        const vico=await page.locator('#vico-workbench').evaluate((root)=>({
          chosen:root.querySelector('#vico-workbench-image').getAttribute('src'),
          loaded:root.querySelector('#vico-workbench-image').naturalWidth>0,
          label:root.querySelector('#vico-workbench-name').textContent,
          background:root.querySelector('#vico-workbench-stage').dataset.background,
          position:root.querySelector('#vico-workbench-stage').dataset.position,
          scale:root.querySelector('#vico-workbench-stage').style.getPropertyValue('--vico-scale'),
          scene:root.querySelector('#vico-workbench-stage').dataset.scene,
          selected:root.querySelectorAll('.vico-workbench__item[aria-pressed="true"]').length
        }));
        assertStep('vico-interaccion-'+width,()=>{
          assert.match(vico.chosen,/vico-vecindario\.webp$/);
          assert.equal(vico.loaded,true);
          assert.match(vico.label,/vecindario/i);
          assert.equal(vico.background,'checker');
          assert.equal(vico.position,'left');
          assert.equal(vico.scale,'1.1');
          assert.equal(vico.scene,'on');
          assert.equal(vico.selected,1);
        });
        await page.locator('#vico-workbench').scrollIntoViewIfNeeded();
        await page.screenshot({path:join(artifacts,'r2-'+width+'-vico-visor.png'),animations:'disabled'});
      }
      const images=await page.locator('.hero-visual img').evaluateAll(imgs=>imgs.filter(img=>img.complete&&!img.naturalWidth).map(img=>img.src));
      assertStep('hero-assets-'+width,()=>assert.equal(images.length,0,'Imágenes rotas: '+images.join(', ')));
    }catch(e){failures.push({name:'error-vista-'+width,error:String(e)});}
    finally{await page.close();}
  }
  // Degradación progresiva: las cuatro páginas deben verse sin JS.
  const noScript=await browser.newPage({viewport:{width:390,height:900},javaScriptEnabled:false});
  try{
    await noScript.goto(addr,{waitUntil:'domcontentloaded',timeout:45000});
    const noJsTabsHidden=await noScript.locator('#composer-tabs').isHidden();
    const noJsPanels=await noScript.locator('#composer [role="tabpanel"]:visible').count();
    const noJsScenes=await noScript.locator('#composer [role="tabpanel"] h3').allTextContents();
    assertStep('compositor-sin-javascript',()=>{
      assert.equal(noJsTabsHidden,true);
      assert.equal(noJsPanels,4);
      assert.equal(noJsScenes.length,4);
      assert.ok(noJsScenes.every(x=>x.trim().length>10));
    });
    const fallbackBridge=await noScript.locator('#platform-bridge-status').textContent();
    const hiddenBridge=await noScript.locator('#platform-bridge-content').isHidden();
    assertStep('idioma-sin-js',()=>{
      assert.match(fallbackBridge,/guía de integración/);
      assert.equal(hiddenBridge,true);
    });
    await noScript.locator('#composer').scrollIntoViewIfNeeded();
    await noScript.screenshot({path:join(artifacts,'r2-390-nojs.png'),animations:'disabled'});
  }catch(error){failures.push({name:'compositor-nojs-error',error:String(error)});}
  finally{await noScript.close();}
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
