/* Vecidya Crystal Depth R1.5 · consulta en vivo del contrato de compatibilidad.
   Solo lee la guía local y crea nodos seguros; no modifica la plataforma. */
(() => {
  const init=async()=>{
    const output=document.getElementById("platform-bridge-content");
    const status=document.getElementById("platform-bridge-status");
    if(!output||!status)return;
    const make=(tag,content,cls)=>{
      const node=document.createElement(tag);
      if(cls)node.className=cls;
      node.textContent=String(content??"");
      return node;
    };
    try{
      const response=await fetch("assets/pattern-registry.json",{cache:"no-store"});
      if(!response.ok)throw Error("HTTP");
      const registry=await response.json();
      const bridge=registry?.platformCompatibility;
      if(bridge?.version!=="R1.5"||!Array.isArray(bridge.surfaces)||!Array.isArray(bridge.primitives)||!Array.isArray(bridge.tokens))throw Error("Contrato incompleto");
      const surfaces=document.getElementById("platform-bridge-surfaces");
      const components=document.getElementById("platform-bridge-components");
      const tokens=document.getElementById("platform-bridge-tokens");
      const gaps=document.getElementById("platform-bridge-gaps");
      if(!surfaces||!components||!tokens||!gaps)return;
      surfaces.replaceChildren();
      components.replaceChildren();
      tokens.replaceChildren();
      gaps.replaceChildren();
      bridge.surfaces.forEach(item=>{
        const article=make("article","");
        article.append(make("strong",item.design+" → Card / "+item.platformSurface));
        article.append(make("p",item.context));
        article.append(make("small","Profundidad: "+item.platformDepth+". "+item.boundary));
        surfaces.append(article);
      });
      bridge.primitives.forEach(item=>{
        const li=make("li","");
        li.append(make("strong",item.name+" · "+item.interface));
        li.append(make("span",item.values.join(" / ")));
        components.append(li);
      });
      bridge.tokens.forEach(item=>{
        const row=make("tr","");
        [item.purpose,item.platform,item.value,item.adoption].forEach(value=>row.append(make("td",value)));
        tokens.append(row);
      });
      bridge.proposedNotYetShared.forEach(item=>{
        const li=make("li","");
        li.append(make("strong",item.name+" · "+item.priority));
        li.append(make("span",item.responsibility));
        gaps.append(li);
      });
      const stateNote=document.getElementById("platform-bridge-state");
      if(stateNote && bridge.stateParity)stateNote.textContent=bridge.stateParity.rule;
      output.hidden=false;
      status.textContent="Contrato R1.5 consultado: "+bridge.surfaces.length+" materiales, "+bridge.primitives.length+" componentes existentes, "+bridge.tokens.length+" tokens y "+bridge.proposedNotYetShared.length+" propuestas pendientes. La plataforma real sigue siendo la autoridad.";
    }catch{
      output.hidden=true;
      status.textContent="El registro JSON no está disponible en esta vista. Consulta el contrato y la guía de integración antes de aplicar un patrón; no supongas equivalencias.";
    }
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else void init();
})();
