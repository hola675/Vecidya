import type { AnonymousDiagnosticSummaryV2 } from "../../features/diagnostic/qa03b/qbv2-candidate-funnel";

export function DiagnosticAreaOverview({ dimensions }: {
  readonly dimensions: AnonymousDiagnosticSummaryV2["dimensions"];
}) {
  return (
    <section aria-labelledby="dr-area-overview-title" className="dr-area-overview">
      <header className="dr-area-overview__header">
        <div>
          <p className="dr-area-overview__eyebrow">Lectura por área</p>
          <h2 className="dr-section__title" id="dr-area-overview-title">Panorama de las ocho áreas</h2>
        </div>
        <span aria-label="Ocho áreas del diagnóstico" className="dr-area-overview__count">08 <span>áreas</span></span>
      </header>
      <p className="dr-area-overview__note">Cada porcentaje conserva la lectura del diagnóstico. «Sin lectura» significa que no hay evidencia suficiente; no equivale a cero.</p>
      <ul className="dr-area-overview__list">
        {dimensions.map((dimension) => (
          <li className="dr-area-overview__item" key={dimension.label}>
            <img alt="" className="dr-area-overview__illustration" decoding="async" height="512" loading="lazy" src={dimension.illustration} width="512" />
            <div className="dr-area-overview__copy">
              <h3>{dimension.label}</h3>
              <p>{dimension.statusLabel}</p>
              {dimension.preliminary ? <span className="dr-area-overview__preliminary">Lectura preliminar</span> : null}
            </div>
            <strong className={dimension.score === null ? "dr-area-overview__value dr-area-overview__value--empty" : "dr-area-overview__value"}>
              {dimension.score === null ? "Sin lectura" : `${dimension.score}%`}
            </strong>
            <span aria-hidden="true" className="dr-area-overview__bar">
              {dimension.score === null ? null : <span className={dimension.preliminary ? "dr-area-overview__bar-fill is-preliminary" : "dr-area-overview__bar-fill"} style={{ width: `${dimension.score}%` }} />}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
