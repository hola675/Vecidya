/**
 * Exportación reproducible P1: NO consulta red/DB, NO altera sesiones.
 * Ejecutar en vecidya-platform:
 * node --experimental-strip-types --import ./tests/unit/register-ts.mjs scripts/diagnostic-v9-editorial-matrix.mjs > audit-v9-p1.json
 * Opcional: --summary imprime solo el recuento.
 */
import { buildCandidateEditorialMatrixV9 } from "../app/features/diagnostic/qa03b/v9-editorial-review-matrix.ts";

const result = buildCandidateEditorialMatrixV9();
const onlySummary = process.argv.includes("--summary");
process.stdout.write(JSON.stringify(onlySummary ? result.summary : result, null, 2) + "\n");
