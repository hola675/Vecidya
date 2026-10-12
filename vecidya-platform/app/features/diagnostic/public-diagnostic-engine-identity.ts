export type PublicDiagnosticEngineIdentityV1 = {
  readonly version: 1;
  readonly engine: "diag-v3-public";
  readonly engineRevision: number;
  readonly questionBank: "QUESTION_BANK_V2";
  readonly questionBankVersion: number;
  readonly routingVersion: number;
  readonly scoringVersion: number;
  readonly resultSchemaVersion: number;
  readonly sessionSchemaVersion: number;
  readonly methodologyVersion: string;
  readonly reportVersion: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const keys = ["version", "engine", "engineRevision", "questionBank", "questionBankVersion", "routingVersion", "scoringVersion", "resultSchemaVersion", "sessionSchemaVersion", "methodologyVersion", "reportVersion"] as const;

export function hasPublicDiagnosticEngineIdentityV1(value: unknown): value is PublicDiagnosticEngineIdentityV1 {
  if (!isRecord(value) || Object.keys(value).length !== keys.length || !keys.every((key) => Object.hasOwn(value, key))) return false;
  return value.version === 1 && value.engine === "diag-v3-public" && Number.isInteger(value.engineRevision)
    && value.questionBank === "QUESTION_BANK_V2" && Number.isInteger(value.questionBankVersion)
    && Number.isInteger(value.routingVersion) && Number.isInteger(value.scoringVersion)
    && Number.isInteger(value.resultSchemaVersion) && Number.isInteger(value.sessionSchemaVersion)
    && typeof value.methodologyVersion === "string" && typeof value.reportVersion === "string";
}
