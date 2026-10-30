export function calculateMiniWebCapacity(hasActiveLicense: boolean, activeExplicitCuadraExtensions: number) {
  const extensions = Number.isSafeInteger(activeExplicitCuadraExtensions) && activeExplicitCuadraExtensions > 0
    ? activeExplicitCuadraExtensions
    : 0;
  return hasActiveLicense ? 3 + extensions * 3 : 0;
}
