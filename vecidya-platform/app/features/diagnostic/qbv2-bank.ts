import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { GOLDEN_QUESTIONS_V2 } from "./qbv2-golden";
import { LOTE_A_QUESTIONS_V2 } from "./qbv2-lote-a";
import { LOTE_B_QUESTIONS_V2 } from "./qbv2-lote-b";
import { LOTE_C_QUESTIONS_V2 } from "./qbv2-lote-c";
import { LOTE_D_QUESTIONS_V2 } from "./qbv2-lote-d";
import { LOTE_E_QUESTIONS_V2 } from "./qbv2-lote-e";
import { LOTE_F_QUESTIONS_V2 } from "./qbv2-lote-f";
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
// El hook golden `q2_confirm_hybrid_friction` queda fixture-only: ninguna respuesta productiva declara
// secondaryMonetizationMechanism todavía y, por tanto, su gate `businessModel=hybrid` sería inalcanzable.
// Se conserva en `qbv2-golden.ts` para proteger el contrato de confirmation y el test sintético de 08B.5,
// pero no se cuenta como pregunta productiva del banco.
const PRODUCTION_GOLDEN_QUESTIONS_V2 = GOLDEN_QUESTIONS_V2.filter((question) => question.id !== "q2_confirm_hybrid_friction");

export const QUESTION_BANK_V2: readonly QuestionDefinitionV2[] = [...PRODUCTION_GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2, ...LOTE_B_QUESTIONS_V2, ...LOTE_C_QUESTIONS_V2, ...LOTE_D_QUESTIONS_V2, ...LOTE_E_QUESTIONS_V2, ...LOTE_F_QUESTIONS_V2];

registerQuestionBankV2(QUESTION_BANK_V2);
