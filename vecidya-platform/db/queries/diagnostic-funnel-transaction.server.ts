export async function withBestEffortFunnelAnalytics<T>(
  operationWithAnalytics: () => Promise<T>,
  operationWithoutAnalytics: () => Promise<T>,
): Promise<T> {
  try {
    return await operationWithAnalytics();
  } catch {
    return operationWithoutAnalytics();
  }
}
