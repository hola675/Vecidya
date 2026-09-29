import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { GOLDEN_QUESTIONS_V2 } from "./qbv2-golden";
import { LOTE_A_QUESTIONS_V2 } from "./qbv2-lote-a";
import { LOTE_B_QUESTIONS_V2 } from "./qbv2-lote-b";
import { LOTE_C_QUESTIONS_V2 } from "./qbv2-lote-c";
import { registerQuestionBankV2 } from "./qbv2-engine";

/**
 * Punto único de registro del banco real de QBV2 (DIAG-V3-08B.3, construido por lotes revisables).
 *
 * `registerQuestionBankV2` guarda un único slot mutable (`qbv2-engine.ts`): si más de un módulo lo
 * llamara al importarse, el orden de import decidiría en silencio cuál banco queda registrado — una
 * dependencia incidental exactamente del tipo que esta base de código evita en otros sitios (p. ej. el
 * desempate alfabético documentado en `foldSignalProductions`). Por eso `qbv2-golden.ts` ya NO se
 * autorregistra: este archivo es el ÚNICO lugar donde se llama `registerQuestionBankV2`, con el banco
 * COMPLETO (golden + cada lote de contenido, en el orden en que se van cerrando). `GOLDEN_QUESTIONS_V2`
 * sigue siendo un export independiente y estable para los tests que validan solo el set de arquitectura.
 */
export const QUESTION_BANK_V2: readonly QuestionDefinitionV2[] = [...GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2, ...LOTE_B_QUESTIONS_V2, ...LOTE_C_QUESTIONS_V2];

registerQuestionBankV2(QUESTION_BANK_V2);
