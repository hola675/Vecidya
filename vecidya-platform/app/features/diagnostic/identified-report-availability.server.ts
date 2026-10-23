/** The identified-report journey stays closed outside development until policy and D1 gates pass. */
export function isIdentifiedReportJourneyAvailable(
  env: { readonly DIAGNOSTIC_REPORT_FUNNEL_ENABLED?: string },
  development = import.meta.env.DEV,
): boolean {
  return development || env.DIAGNOSTIC_REPORT_FUNNEL_ENABLED === "true";
}
