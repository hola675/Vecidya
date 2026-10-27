import { useEffect, useRef, useState, type FormEvent } from "react";

import {
  QA03B_CANDIDATE_SECTOR_V4,
  QA03B_SPECIALTY_SELECTORS_V1,
} from "../../features/diagnostic/qa03b/specialty-candidate-bank";
import type { ClassificationSelectionV9 } from "../../features/diagnostic/qa03b/v9-classification-bundle";

import { FlowProgress } from "./question-step";
import type { ProgressV3 } from "../../features/diagnostic/qbv2-session";

export type ClassificationDraftV9 = {
  readonly sector?: string;
  readonly niche?: string;
};

export type ClassificationStepV9Props = {
  readonly value: ClassificationDraftV9;
  readonly progress: ProgressV3;
  readonly error: string | null;
  readonly reviewing: boolean;
  readonly canGoBack: boolean;
  readonly entityType?: string;
  readonly onChange: (value: ClassificationDraftV9) => void;
  readonly onSubmit: (value: ClassificationSelectionV9) => void;
  readonly onBack: () => void;
};

const selectorBySector = new Map(
  QA03B_SPECIALTY_SELECTORS_V1.map((question) => [
    question.id.replace("q2_niche_", ""),
    question,
  ] as const),
);

export function specialtySelectorForSectorV9(sector: string | undefined) {
  return sector ? selectorBySector.get(sector) : undefined;
}

export function classificationSelectionReadyV9(value: ClassificationDraftV9): boolean {
  if (!value.sector) return false;
  const selector = specialtySelectorForSectorV9(value.sector);
  return selector ? !!value.niche && selector.options.some((option) => option.value === value.niche) : value.niche === undefined;
}

/**
 * Filtro editorial local de la taxonomía HISTÓRICA del prototipo V9.
 * La nueva taxonomía compartida requiere migración expresa del replay antes
 * de reemplazar q2_sector. Es una sugerencia, nunca una respuesta inferida.
 */
const SEARCH_HINTS_V9: Readonly<Record<string, readonly string[]>> = {
  food_hospitality: ["restaurante", "cafeteria", "comida", "hotel", "alojamiento"],
  health_wellness: ["dentista", "clinica", "medico", "fisioterapia"],
  home_services: ["limpieza", "plomero", "electricista", "mantenimiento"],
  automotive: ["taller", "mecanico", "automovil", "auto"],
  retail: ["tienda", "ferreteria", "comercio"],
  ecommerce: ["tienda online", "tienda en linea", "venta por internet", "ecommerce"],
  legal: ["abogado", "bufete", "juridico"],
  technology_software: ["software", "programacion", "informatica"],
  b2b_services: ["agencia marketing", "consultoria", "empresa"],
  education_coaching: ["profesor", "academia", "curso", "escuela"],
};
const normalizeSectorSearchV9 = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim().replace(/\s+/g, " ");

export function searchV9LegacySectors(query: string) {
  const normalized = normalizeSectorSearchV9(query);
  if (!normalized) return [];
  return QA03B_CANDIDATE_SECTOR_V4.options
    .filter((option) => {
      const candidates = [option.label, ...(SEARCH_HINTS_V9[option.value] ?? [])];
      return candidates.some((label) => normalizeSectorSearchV9(label).includes(normalized));
    })
    .slice(0, 7);
}

export function classificationPromptV9(entityType: string | undefined): string {
  return entityType === "organization"
    ? "¿A qué se dedica principalmente tu organización?"
    : "¿A qué se dedica principalmente tu negocio o emprendimiento?";
}

/**
 * V9 candidate-only compound classification.
 *
 * Sector and specialty remain two explicit engine answers, but the user handles
 * them in one visible interaction. The specialty field is progressively revealed
 * only for sectors whose taxonomy has a reviewed selector.
 */
export function Qa03bV9ClassificationStep({
  value,
  progress,
  error,
  reviewing,
  canGoBack,
  entityType,
  onChange,
  onSubmit,
  onBack,
}: ClassificationStepV9Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [sectorQuery, setSectorQuery] = useState("");
  const [showAllSectors, setShowAllSectors] = useState(false);
  const specialty = specialtySelectorForSectorV9(value.sector);
  const ready = classificationSelectionReadyV9(value);
  const visibleSectors = sectorQuery.trim()
    ? searchV9LegacySectors(sectorQuery)
    : showAllSectors
      ? QA03B_CANDIDATE_SECTOR_V4.options
      : QA03B_CANDIDATE_SECTOR_V4.options.filter((option) => option.value === value.sector);
  const chooseSector = (sector: string) => {
    onChange({ sector });
    setSectorQuery("");
    setShowAllSectors(false);
  };

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready || !value.sector) return;
    onSubmit({
      sector: value.sector,
      ...(value.niche === undefined ? {} : { niche: value.niche }),
    });
  };

  const describedBy = [
    "df-v9-sector-hint",
    specialty ? "df-v9-specialty-hint" : null,
    error ? "df-v9-classification-error" : null,
  ].filter(Boolean).join(" ");

  return (
    <div className="df-step df-v9-classification">
      <FlowProgress progress={progress} />
      <form className="df-question" noValidate onSubmit={submit}>
        <p className="df-question__kicker">Sobre tu negocio o emprendimiento</p>
        <h1
          className="df-question__title"
          id="df-v9-classification-title"
          ref={headingRef}
          tabIndex={-1}
        >
          {classificationPromptV9(entityType)}
        </h1>

        {reviewing ? (
          <p className="df-question__review">
            Estás revisando tu negocio o emprendimiento. Si cambias el sector o la especialidad, ajustaremos las preguntas siguientes.
          </p>
        ) : null}

        <fieldset
          aria-describedby={describedBy || undefined}
          aria-labelledby="df-v9-classification-title"
          className="df-question__fieldset df-v9-classification__sector"
        >
          <p className="df-question__hint" id="df-v9-sector-hint">
            Busca lo que hace tu negocio o lo que ofrecerá tu emprendimiento. La búsqueda solo sugiere; tú eliges el sector.
          </p>
          <label htmlFor="df-v9-sector-search">Buscar por tipo de negocio o emprendimiento</label>
          <input
            id="df-v9-sector-search"
            aria-controls="df-v9-sector-options"
            aria-describedby="df-v9-sector-hint"
            autoComplete="off"
            type="search"
            value={sectorQuery}
            placeholder="Ej. dentista, taller, restaurante..."
            onChange={(event) => { setSectorQuery(event.currentTarget.value); setShowAllSectors(false); }}
          />
          <div className="df-v9-classification__browse">
            <button
              type="button"
              className="button button--secondary"
              aria-controls="df-v9-sector-options"
              aria-expanded={showAllSectors}
              onClick={() => { setShowAllSectors(!showAllSectors); setSectorQuery(""); }}
            >{showAllSectors ? "Ocultar categorías" : "Ver todas las categorías"}</button>
            <button type="button" className="button button--secondary" onClick={() => chooseSector("other")}>Otro tipo de negocio</button>
            <button type="button" className="button button--secondary" onClick={() => chooseSector("unknown")}>Todavía no lo tengo claro</button>
          </div>
          {sectorQuery.trim() && visibleSectors.length === 0 ? (
            <p className="df-question__hint">No encontramos una categoría exacta. Puedes ver todas o elegir otro tipo de negocio.</p>
          ) : null}
          {value.sector && !sectorQuery && !showAllSectors ? (
            <p className="df-question__hint" role="status">Sector elegido: {QA03B_CANDIDATE_SECTOR_V4.options.find((option) => option.value === value.sector)?.label}</p>
          ) : null}
          <div className="df-options df-options--single" id="df-v9-sector-options">
            {visibleSectors.map((option) => {
              const inputId = `df-v9-sector-${option.value}`;
              const checked = value.sector === option.value;
              return (
                <label className={`df-option${checked ? " is-selected" : ""}`} htmlFor={inputId} key={option.value}>
                  <input
                    checked={checked}
                    className="df-option__input"
                    id={inputId}
                    name="q2_sector"
                    onChange={() => chooseSector(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span aria-hidden="true" className="df-option__mark" />
                  <span className="df-option__label">{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {specialty ? (
          <fieldset
            aria-describedby="df-v9-specialty-hint"
            className="df-question__fieldset df-v9-classification__specialty"
          >
            <legend className="df-v9-classification__legend">
              ¿Cuál es la especialidad de tu negocio o emprendimiento?
            </legend>
            <p className="df-question__hint" id="df-v9-specialty-hint">
              Esto nos permite adaptar las preguntas sin asumir cómo funciona tu negocio. Si ninguna encaja, elige «Otra especialidad».
            </p>
            <div className="df-options df-options--single">
              {specialty.options.map((option) => {
                const inputId = `df-v9-specialty-${option.value}`;
                const checked = value.niche === option.value;
                return (
                  <label className={`df-option${checked ? " is-selected" : ""}`} htmlFor={inputId} key={option.value}>
                    <input
                      checked={checked}
                      className="df-option__input"
                      id={inputId}
                      name={specialty.id}
                      onChange={() => onChange({ sector: value.sector, niche: option.value })}
                      type="radio"
                      value={option.value}
                    />
                    <span aria-hidden="true" className="df-option__mark" />
                    <span className="df-option__label">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : value.sector ? (
          <p className="df-v9-classification__no-specialty" role="status">
            Con este sector no necesitamos una segunda clasificación para continuar.
          </p>
        ) : null}

        <div className="df-actions">
          {error ? (
            <p className="df-question__error" id="df-v9-classification-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="df-actions__buttons">
            {canGoBack ? (
              <button className="button button--secondary" onClick={onBack} type="button">
                Volver
              </button>
            ) : <span />}
            <button aria-disabled={!ready} className="button button--primary" disabled={!ready} type="submit">
              Continuar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
