/* Vecidya Crystal Depth · R1.3 UI state explorer. All examples are local and never call APIs. */
(() => {
  const examples={
    idle:{icon:"○",title:"Listo para comenzar",subtitle:"La acción está disponible. La persona sabe qué ocurrirá antes de continuar.",rule:"Estado inicial: etiqueta precisa, acción identificable y texto de apoyo cuando sea necesario."},
    loading:{icon:"◷",title:"Procesando una solicitud",subtitle:"Ejemplo visual de espera. No representa una operación real ni un progreso medido.",rule:"Carga real: bloquear envíos duplicados, conservar contexto y anunciar el estado. No inventar porcentajes."},
    empty:{icon:"□",title:"Aún no hay resultados",subtitle:"No encontramos elementos en esta demostración. En producción, ofrece filtros y un siguiente paso útil.",rule:"Vacío: explicar por qué puede ocurrir y cómo continuar, sin fabricar datos de negocios."},
    error:{icon:"!",title:"No se pudo completar",subtitle:"Demostración de error. En producción, explica el fallo comprobado y ofrece una recuperación segura.",rule:"Error: mensaje útil, sin exponer secretos; conservar entradas y señalar el campo si corresponde."},
    success:{icon:"✓",title:"Acción confirmada (ejemplo)",subtitle:"Solo se está mostrando el estado visual. No se envió información ni se guardó ningún cambio.",rule:"Éxito real: confirmar únicamente después de una respuesta verificable del sistema."}
  };
  const init=()=>{
    const select=document.getElementById("flow-state");
    const result=document.getElementById("flow-result");
    const icon=document.getElementById("flow-icon");
    const name=document.getElementById("flow-name");
    const title=document.getElementById("flow-title");
    const description=document.getElementById("flow-description");
    const rule=document.getElementById("flow-rule");
    if(!select||!result||!icon||!name||!title||!description||!rule)return;
    const update=()=>{
      const key=select.value;
      const current=examples[key]||examples.idle;
      result.dataset.state=key in examples?key:"idle";
      result.dataset.animate=String(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      icon.textContent=current.icon;
      name.textContent=key in examples?key.toUpperCase():"IDLE";
      title.textContent=current.title;
      description.textContent=current.subtitle;
      rule.textContent=current.rule;
    };
    select.addEventListener("change",update);
    update();
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
