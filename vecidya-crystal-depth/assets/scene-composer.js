/* Crystal Depth R1.2 · escena guiada y transiciones de página simuladas.
   No routing real, no API, no cambios en planes o publicación. */
(() => {
  function init() {
    const root = document.getElementById("composer");
    const tabs = document.getElementById("composer-tabs");
    const status = document.getElementById("composer-status");
    if (!root || !tabs || !status) return;
    const buttons = [...tabs.querySelectorAll('[role="tab"]')];
    const panels = [...root.querySelectorAll('[role="tabpanel"]')];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!buttons.length || buttons.length !== panels.length) return;
    let selected = 0;

    const activate = (index, focus = false) => {
      const next = (index + buttons.length) % buttons.length;
      selected = next;
      for (let i=0;i<buttons.length;i++) {
        const current = i === selected;
        buttons[i].setAttribute("aria-selected", String(current));
        buttons[i].tabIndex = current ? 0 : -1;
        const panel=panels[i];
        panel.hidden = !current;
        panel.dataset.transition = "";
        if (current && !reduced.matches && document.documentElement.dataset.motion !== "static") {
          // Re-trigger only on the selected panel, never transition data operations.
          panel.dataset.transition = "enter";
        }
      }
      const button=buttons[selected];
      status.textContent = button.dataset.description ?? ("Vista de ejemplo: " + button.textContent.trim());
      if (focus) button.focus();
    };
    buttons.forEach((button,i) => {
      button.addEventListener("click", () => activate(i));
      button.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = i + 1;
        else if (event.key === "ArrowLeft") next = i - 1;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length-1;
        else return;
        event.preventDefault();
        activate(next,true);
      });
    });

    const suggested=document.getElementById("r1-preview-link");
    if (suggested) suggested.addEventListener("click", () => {
      const index=buttons.findIndex(button=>button.id==="composer-tab-"+suggested.dataset.preview);
      if (index>=0) activate(index);
    });

    root.classList.add("is-interactive");
    tabs.hidden = false;
    // On JavaScript failure, every panel remains visible as standalone content.
    activate(0);
    const onReduced = () => {
      if (reduced.matches) panels.forEach(panel=>{panel.dataset.transition="";});
    };
    if (typeof reduced.addEventListener === "function") {
      reduced.addEventListener("change",onReduced);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
