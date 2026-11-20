/* Vecidya Crystal Depth R1.4 · brief por especialidad, sin dependencia externa.
   La fuente estructurada es assets/pattern-registry.json; el HTML contiene el fallback.
   Este módulo no ejecuta acciones de producto ni muta datos. */
(() => {
  const roles = {
    frontend: {
      title: "Implementación frontend",
      instruction: "Localiza el componente real antes de editar. Reutiliza tokens y variantes existentes, realiza cambios mínimos y comprueba estados de interfaz, teclado, tamaño táctil y responsive. Evita duplicar componentes o modificar APIs sin autorización."
    },
    editorial: {
      title: "Colaborador editorial",
      instruction: "Revisa títulos, indicaciones, botones y mensajes para que cualquier persona los comprenda sin conocimientos técnicos. Usa frases naturales, directas y precisas; elimina ambigüedad y jerga; distingue claramente una pregunta, una recomendación y una promesa. No inventes prestaciones ni resultados."
    },
    ux: {
      title: "Diseño UX/UI",
      instruction: "Prioriza la tarea, la jerarquía visual, las relaciones espaciales y el material por contexto. Mantén el foco de lectura, el contraste, las acciones reconocibles y una experiencia premium sin añadir decoración que compita con datos."
    },
    quality: {
      title: "Calidad y certificación focal",
      instruction: "Comprueba únicamente el comportamiento cambiado y sus riesgos. Ejecuta pruebas deterministas, verifica accesibilidad y errores, registra SHA y evidencia; evita duplicar pruebas antiguas y nunca anuncies PASS si no se ejecutaron."
    }
  };
  const compact = value => String(value ?? "").trim();
  const readable = value => Array.isArray(value) ? value.filter(Boolean).join("; ") : compact(value);
  const buildBrief = ({option, role, registry}) => {
    const specialist = roles[role] ?? roles.frontend;
    const intent = compact(option?.value);
    const data = option?.dataset ?? {};
    const routing = registry?.intentRouting?.find(x=>x.intent===intent);
    const scene = registry?.sceneRecipes?.find(x=>x.intent===intent && x.id===data.preview);
    const presetNames = scene?.motion?.map(id=>registry?.motion?.presets?.find(x=>x.id===id)?.id).filter(Boolean) ?? [];
    const states = registry?.interactionRecipes?.map(x=>x.id).join(", ") || "idle, loading, empty, error y success";
    const lines = [
      "VECIDYA · ENCARGO DE SUBAGENTE · GUÍA DE LABORATORIO R1.4",
      "Especialidad: " + specialist.title,
      "Contexto: " + (compact(option?.textContent) || "Interfaz de Vecidya"),
      "Intención: " + intent,
      "Material recomendado: " + compact(data.material),
      "Escena: " + (compact(data.scene) || "No establecida"),
      "Regla prioritaria: " + compact(data.rule),
      "",
      "RESPONSABILIDAD DEL COLABORADOR",
      specialist.instruction
    ];
    if (routing) {
      lines.push("", "PROHIBICIONES DEL CONTEXTO", readable(routing.never));
    }
    if (scene) {
      lines.push("", "COMPOSICIÓN DISPONIBLE SOLO COMO DEMO",
        scene.label + ": " + scene.contentRule,
        "Asset oficial: " + scene.asset,
        "Evitar: " + readable(scene.avoid),
        "Movimiento de referencia: " + (presetNames.join(", ") || "sin efectos obligatorios"));
    } else {
      lines.push("", "COMPOSICIÓN",
        "No existe una muestra R1.4 específica para esta intención; no adaptes otra página por suposición.");
    }
    lines.push("", "ESTADOS Y ACCESIBILIDAD",
      "Considera estados " + states + " únicamente cuando correspondan a una operación real. Confirma éxito solo tras respuesta verificable del servicio.",
      "Conserva foco visible, estructura semántica, contenido legible sin JavaScript, respuesta móvil, contraste real y prefers-reduced-motion.",
      "",
      "FRONTERA DE IMPLEMENTACIÓN",
      "Consulta AGENTS.md, documentos canónicos, contratos actuales y permisos antes de actuar. No asumas funciones GHL, entitlements, datos ni publicación por mostrar este diseño.",
      "Trabaja dentro de la tarea asignada por el agente líder. Registra cambios mínimos, archivos afectados, pruebas realmente ejecutadas, riesgos y SHA.",
      "Esta biblioteca no autoriza por sí sola integración productiva, merge o despliegue."
    );
    return lines.join("\n");
  };
  const init = async () => {
    const select=document.getElementById("r1-intent");
    const role=document.getElementById("r1-brief-role");
    const output=document.getElementById("r1-brief-preview");
    const status=document.getElementById("r1-brief-status");
    if(!select||!role||!output||!status)return;
    let registry=null;
    const render=()=>{
      output.value=buildBrief({option:select.options[select.selectedIndex],role:role.value,registry});
    };
    select.addEventListener("change",render);
    role.addEventListener("change",render);
    render();
    status.textContent="Borrador básico disponible. Consultando el registro de patrones…";
    try{
      const response=await fetch("assets/pattern-registry.json",{cache:"no-store"});
      if(!response.ok)throw Error("No se pudo leer el registro de patrones");
      const data=await response.json();
      if(!Array.isArray(data?.intentRouting)||!Array.isArray(data?.sceneRecipes)||!Array.isArray(data?.interactionRecipes))throw Error("Registro incompleto");
      registry=data;
      render();
      status.textContent="Borrador generado con el registro vigente: intención, composición, estados y especialidad. Revisa antes de copiar.";
    }catch{
      status.textContent="El registro no está disponible en esta vista. Se muestra un borrador básico; consulta el JSON antes de implementar.";
    }
  };
  // Exposición pura de la plantilla para pruebas de contrato; sin acciones de servidor.
  if(typeof window!=="undefined")window.vecidyaCrystalBrief={buildBrief};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else void init();
})();
