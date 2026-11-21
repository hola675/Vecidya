import { MINIWEB_V2_DESIGN_PALETTES, MINIWEB_V2_DESIGN_RANGES, miniWebV2Contrast, validateMiniWebV2Design, type MiniWebV2Design } from "../features/miniweb-v2/visual-design";

type Props = { value: MiniWebV2Design; onChange: (next: MiniWebV2Design) => void; disabled?: boolean };
const ranges = [
  { key: "titleSize", label: "Tamaño del título" },
  { key: "bodySize", label: "Tamaño del texto" },
  { key: "spacing", label: "Espaciado interior" },
  { key: "radius", label: "Redondeo de contenedores" },
  { key: "heroHeight", label: "Altura de portada" },
] as const;

export function MiniWebV2DesignControls({ value, onChange, disabled = false }: Props) {
  const valid = validateMiniWebV2Design(value);
  const update = <K extends keyof MiniWebV2Design>(key: K, next: MiniWebV2Design[K]) => onChange({ ...value, [key]: next });
  return <fieldset className="miniweb-v2-design" disabled={disabled}>
    <legend>Personaliza el aspecto de tu sitio</legend>
    <p className="miniweb-v2-design__intro">Elige los colores, la tipografía y la distribución que representan a tu negocio. Los cambios se ven en la vista previa y solo quedan guardados al pulsar «Guardar cambios».</p>
    <div className="miniweb-v2-design__fields">
      <label>Paleta de partida
        <select value={value.palette} onChange={(event) => {
          const palette = event.currentTarget.value as MiniWebV2Design["palette"];
          onChange(palette === "personalizada" ? { ...value, palette } : { ...value, palette, ...MINIWEB_V2_DESIGN_PALETTES[palette] });
        }}>
          <option value="oceano">Océano azul</option><option value="bosque">Bosque verde</option>
          <option value="coral">Coral cálido</option><option value="ciruela">Ciruela</option>
          <option value="personalizada">Mis colores</option>
        </select>
      </label>
      {([
        ["accentColor", "Color de botones y enlaces"],
        ["backgroundColor", "Color de fondo"],
        ["textColor", "Color del texto"],
      ] as const).map(([key, label]) => <label key={key}>{label}
        <input type="color" value={value[key]} onChange={(event) => onChange({ ...value, palette: "personalizada", [key]: event.currentTarget.value })}/>
      </label>)}
      <label>Tipografía
        <select value={value.font} onChange={(event) => update("font", event.currentTarget.value as MiniWebV2Design["font"])}>
          <option value="moderna">Moderna</option><option value="editorial">Editorial</option><option value="cercana">Cercana</option>
        </select>
      </label>
      <label>Composición de portada
        <select value={value.layout} onChange={(event) => update("layout", event.currentTarget.value as MiniWebV2Design["layout"])}>
          <option value="split">Dos columnas</option><option value="stacked">Elementos apilados</option>
        </select>
      </label>
      <label>Alineación del contenido
        <select value={value.align} onChange={(event) => update("align", event.currentTarget.value as MiniWebV2Design["align"])}>
          <option value="left">Izquierda</option><option value="center">Centrado</option>
        </select>
      </label>
      <label>Posición de imagen
        <select value={value.imagePosition} onChange={(event) => update("imagePosition", event.currentTarget.value as MiniWebV2Design["imagePosition"])}>
          <option value="right">Derecha</option><option value="left">Izquierda</option>
        </select>
      </label>
      {ranges.map(({ key, label }) => <label key={key}>{label}: <output>{value[key]} px</output>
        <input type="range" min={MINIWEB_V2_DESIGN_RANGES[key][0]} max={MINIWEB_V2_DESIGN_RANGES[key][1]} step={1} value={value[key]} onChange={(event) => update(key, Number(event.currentTarget.value))}/>
      </label>)}
    </div>
    {!valid ? <p className="miniweb-v2-design__warning" role="alert">Esta combinación no se puede guardar: verifica los colores y el contraste del texto y los botones (mínimo 4,5:1).</p>
      : <p className="miniweb-v2-design__contrast">Contraste texto/fondo: {miniWebV2Contrast(value.textColor, value.backgroundColor).toFixed(1)}:1. Botón/texto blanco: {miniWebV2Contrast("#ffffff", value.accentColor).toFixed(1)}:1.</p>}
  </fieldset>;
}
