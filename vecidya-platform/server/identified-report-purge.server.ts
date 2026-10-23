import { purgeExpiredIdentifiedReports, type PurgedIdentifiedReportRows } from "../db/queries/diagnostic-identification.server";

export type IdentifiedReportPurgeEnv = {
  readonly DB: D1Database;
  readonly DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_ENABLED?: string;
  readonly DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_APPROVED?: string;
};

export type IdentifiedReportPurgeResult =
  | { readonly status: "skipped" }
  | { readonly status: "completed"; readonly purged: PurgedIdentifiedReportRows };

/** Both explicit switches must be opened before a destructive sweep can run. */
export function isIdentifiedReportPurgeEnabled(env: Pick<IdentifiedReportPurgeEnv,
  "DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_ENABLED" | "DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_APPROVED">): boolean {
  return env.DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_ENABLED === "true" &&
    env.DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_APPROVED === "true";
}

export async function runIdentifiedReportPurge(env: IdentifiedReportPurgeEnv, now = new Date()): Promise<IdentifiedReportPurgeResult> {
  if (!isIdentifiedReportPurgeEnabled(env)) return { status: "skipped" };
  return { status: "completed", purged: await purgeExpiredIdentifiedReports(env.DB, now) };
}
