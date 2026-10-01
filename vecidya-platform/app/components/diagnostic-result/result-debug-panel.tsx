import { narrativeBlocks, type DiagnosticNarrative } from "../../features/diagnostic";

/**
 * Solo desarrollo: procedencia de cada bloque (hechos, preguntas, contexto y rango de prioridad). Lo monta
 * únicamente la vista previa local; nunca forma parte de `DiagnosticResult` ni de una ruta de producción.
 */
export function ResultDebugPanel({ narrative }: { narrative: DiagnosticNarrative }) {
  return (
    <details className="dr-debug">
      <summary>Procedencia (solo desarrollo)</summary>
      <table>
        <thead>
          <tr><th scope="col">Bloque</th><th scope="col">Certeza</th><th scope="col">Prioridad</th><th scope="col">Hechos</th><th scope="col">Preguntas</th><th scope="col">Contexto</th></tr>
        </thead>
        <tbody>
          {narrativeBlocks(narrative).map((block) => (
            <tr key={block.id}>
              <th scope="row">{block.id}</th>
              <td>{block.certainty}</td>
              <td>{block.priorityRank ?? ""}</td>
              <td>{block.sourceFactIds.join(", ")}</td>
              <td>{block.sourceQuestionIds.join(", ")}</td>
              <td>{block.sourceContext.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
