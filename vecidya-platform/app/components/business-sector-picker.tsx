import { useId, useState } from "react";

import { BUSINESS_SECTORS, businessCategoryOptions, searchBusinessSectors } from "../content/business-sectors";

export type BusinessSectorPickerProps = {
  readonly initialCategory: string | null | undefined;
  readonly onSelectionChange?: (label: string) => void;
};

/**
 * Selector asistido (no clasificador automático). El valor que viaja en el
 * formulario sigue siendo exactamente la etiqueta publicada/legacy.
 */
export function BusinessSectorPicker({ initialCategory, onSelectionChange }: BusinessSectorPickerProps) {
  const [selected, setSelected] = useState(initialCategory ?? "");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const searchId = useId();
  const resultsId = useId();
  const options = businessCategoryOptions(initialCategory);
  const match = selected
    ? BUSINESS_SECTORS.find((sector) => sector.label === selected)?.label ?? selected
    : "";
  const results = query.trim() ? searchBusinessSectors(query) : showAll ? BUSINESS_SECTORS : [];

  const choose = (label: string) => {
    setSelected(label);
    setQuery("");
    setShowAll(false);
    onSelectionChange?.(label);
  };

  return (
    <div className="business-sector-picker form-grid__full" role="group" aria-label="Categoría principal del negocio o emprendimiento">
      <input name="category" type="hidden" value={selected} />
      <label className="business-sector-picker__question" htmlFor={searchId}>
        ¿A qué se dedica principalmente tu negocio o emprendimiento?
      </label>
      <p className="form-help">Escribe qué tipo de negocio tienes o estás creando. La búsqueda sugiere categorías: tú eliges la correcta.</p>
      {selected && !query && !showAll ? (
        <div className="business-sector-picker__selected" role="status">
          <strong>{match}</strong>
          {options.legacy === selected ? <span> Categoría anterior conservada</span> : null}
          <button className="button button--secondary" type="button" onClick={() => setShowAll(true)}>Cambiar</button>
        </div>
      ) : null}
      <input
        autoComplete="off"
        className="business-sector-picker__search"
        id={searchId}
        type="search"
        placeholder="Ej. dentista, finca, taller, tienda..."
        value={query}
        onChange={(event) => { setQuery(event.currentTarget.value); setShowAll(false); }}
        aria-controls={resultsId}
        aria-describedby={resultsId}
      />
      <div className="business-sector-picker__results" id={resultsId}>
        {results.length ? (
          <div className="business-sector-picker__options" role="group" aria-label="Categorías sugeridas">
            {results.map((sector) => (
              <button
                aria-pressed={selected === sector.label}
                className={`business-sector-picker__option${selected === sector.label ? " is-selected" : ""}`}
                key={sector.id}
                type="button"
                onClick={() => choose(sector.label)}
              >
                {sector.label}{selected === sector.label ? " ✓" : ""}
              </button>
            ))}
          </div>
        ) : query.trim() ? (
          <p className="form-help">Sin coincidencias exactas. Puedes ver todas las categorías o elegir «Otra actividad».</p>
        ) : null}
      </div>
      <div className="business-sector-picker__actions">
        <button className="button button--secondary" type="button" aria-expanded={showAll} aria-controls={resultsId} onClick={() => { setShowAll(!showAll); setQuery(""); }}>
          {showAll ? "Ocultar categorías" : "Ver todas las categorías"}
        </button>
        <button className="button button--secondary" type="button" onClick={() => choose("Otra actividad")}>
          Otra actividad
        </button>
        {selected ? <button className="button button--secondary" type="button" onClick={() => choose("")}>Borrar selección</button> : null}
      </div>
    </div>
  );
}
