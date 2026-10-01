import { Link, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";

import { DiagnosticResult } from "../components/diagnostic-result";
import { ResultDebugPanel } from "../components/diagnostic-result/result-debug-panel";
import { PublicLayout } from "../components/public-layout";
import {
  buildDiagnosticNarrative,
  buildDiagnosticOutcome,
  deriveConstraintsAndPriorities,
  deriveSemanticFacts,
  GOLDEN_PERSONAS,
  runGoldenPersonaPipeline,
  scoreContextualDimensions,
  type DiagnosticNarrative,
  type DiagnosticOutcome,
  type NarrativeBlock,
} from "../features/diagnostic";

/**
 * DIAG-V3-09/10 — vista previa local del resultado sobre las 12 personas golden. Solo existe en desarrollo:
 * `routes.ts` no la registra en el build de producción y el loader responde 404 fuera de `import.meta.env.DEV`.
 * No es un punto de entrada del producto ni muestra resultados reales. Al no existir en typegen (que evalúa
 * `routes.ts` en modo producción), se tipa con los tipos públicos de React Router en lugar de `+types`.
 */

export const meta: MetaFunction = () => [{ title: "Vista previa del resultado (desarrollo)" }, { name: "robots", content: "noindex, nofollow" }];

/** Solo para revisar desbordes: alarga textos, etiquetas y listas de evidencia. Nunca sale de esta vista. */
function stressNarrative(narrative: DiagnosticNarrative): DiagnosticNarrative {
  const long = (block: NarrativeBlock): NarrativeBlock => ({ ...block, text: `${block.text} ${block.text} ${block.text}` });
  return {
    ...narrative,
    executiveSummary: narrative.executiveSummary.map(long),
    currentState: long(narrative.currentState),
    strengths: narrative.strengths.map(long),
    weaknesses: narrative.weaknesses.map(long),
    primaryConstraint: narrative.primaryConstraint ? long(narrative.primaryConstraint) : null,
    priorities: narrative.priorities.map((item) => ({ ...item, statement: long(item.statement), why: long(item.why) })),
    contradictions: narrative.contradictions.map(long),
    uncertainties: narrative.uncertainties.map(long),
    dimensions: narrative.dimensions.map((item) => ({
      ...item,
      label: `${item.label} en organizaciones comunitarias y consultorios con varias sedes`,
      interpretation: long(item.interpretation),
      evidence: Array.from({ length: 9 }, (_, index) => ({ questionId: `stress-${index}`, topic: `la confirmación de citas de pacientes y la recepción de donaciones recurrentes de la comunidad (${index + 1})` })),
    })),
    nextFocus: long(narrative.nextFocus),
  };
}

/** Alarga también el estado general, el plan y las ofertas para revisar desbordes. */
function stressOutcome(outcome: DiagnosticOutcome): DiagnosticOutcome {
  const triple = (text: string) => `${text} ${text} ${text}`;
  return {
    ...outcome,
    overall: { ...outcome.overall, label: `${outcome.overall.label} con un nombre de estado bastante más largo`, explanation: { ...outcome.overall.explanation, text: triple(outcome.overall.explanation.text) } },
    recommendations: { ...outcome.recommendations, items: outcome.recommendations.items.map((item) => ({ ...item, title: triple(item.title), whatToImprove: triple(item.whatToImprove), expectedOutcome: triple(item.expectedOutcome) })) },
    help: {
      ...outcome.help,
      items: outcome.help.items.map((item) => ({
        ...item,
        offerings: item.offerings.map((match) => ({ ...match, offering: { ...match.offering, summary: triple(match.offering.summary) }, condition: match.condition ? triple(match.condition) : null, proof: { ...match.proof, finding: triple(match.proof.finding) } })),
      })),
    },
  };
}

export function loader({ params, request }: LoaderFunctionArgs) {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  const persona = GOLDEN_PERSONAS.find((item) => item.id === (params.personaId ?? GOLDEN_PERSONAS[0]!.id));
  if (!persona) throw new Response("Not Found", { status: 404 });
  const answers = runGoldenPersonaPipeline(persona).answers;
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  const priorities = deriveConstraintsAndPriorities(scoring);
  const semanticFacts = deriveSemanticFacts({ answers, scoring, priorities });
  const narrative = buildDiagnosticNarrative({ answers, scoring, priorities, semanticFacts });
  const outcome = buildDiagnosticOutcome({ scoring, priorities, semanticFacts, narrative });
  const url = new URL(request.url);
  const stress = url.searchParams.get("stress") === "1";
  return {
    personaId: persona.id,
    personas: GOLDEN_PERSONAS.map((item) => ({ id: item.id, label: item.label })),
    narrative: stress ? stressNarrative(narrative) : narrative,
    outcome: stress ? stressOutcome(outcome) : outcome,
    debug: url.searchParams.get("debug") === "1",
    stress,
  };
}

export default function DevDiagnosticResult() {
  const { debug, narrative, outcome, personaId, personas, stress } = useLoaderData<typeof loader>();
  const query = (next: { debug?: boolean; stress?: boolean }) => {
    const params = new URLSearchParams();
    if (next.debug ?? debug) params.set("debug", "1");
    if (next.stress ?? stress) params.set("stress", "1");
    const text = params.toString();
    return text ? `?${text}` : "";
  };
  return (
    <PublicLayout>
      <main className="dr-page">
        <aside aria-label="Vista previa de desarrollo" className="dr-preview-bar">
          <p>Vista previa local con personas golden: no es un resultado real ni una ruta del producto.</p>
          <nav aria-label="Personas golden">
            <ul>
              {personas.map((item) => (
                <li key={item.id}>
                  <Link aria-current={item.id === personaId ? "page" : undefined} to={`/__dev/diagnostico/resultado/${item.id}${query({})}`}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <p>
            <Link to={query({ debug: !debug })}>{debug ? "Ocultar procedencia" : "Ver procedencia"}</Link>
            {" · "}
            <Link to={query({ stress: !stress })}>{stress ? "Contenido normal" : "Contenido extremo"}</Link>
          </p>
        </aside>
        <DiagnosticResult narrative={narrative} outcome={outcome} />
        {debug ? <ResultDebugPanel narrative={narrative} /> : null}
      </main>
    </PublicLayout>
  );
}
