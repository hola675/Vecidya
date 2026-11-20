/** UX-CRYSTAL-R3 · reversión por ruta. Contrato de código, NO un flag remoto.
 *
 * Los cinco pilotos marcados true ya están integrados en main por R1.7-R1.9.
 * Para revertir uno: cambiar únicamente su flag a false, ejecutar CI y
 * desplegar mediante el procedimiento autorizado. No se consulta storage,
 * cookies, querystrings ni variables del servidor: SSR e hidratación coinciden.
 * Las superficies futuras empiezan apagadas.
 */
export const VISUAL_ROLLOUT = Object.freeze({
  publicHomeHeadings: true,
  publicDirectoryResults: true,
  publicServicesHeadings: true,
  adminBusinessSurfaces: true,
  miniWebEditorSolid: true,
  futureLearnLayout: false,
  futureClientShell: false,
} as const);

export type VisualFeature = keyof typeof VISUAL_ROLLOUT;

export function isVisualFeatureEnabled(feature: VisualFeature): boolean {
  return VISUAL_ROLLOUT[feature] === true;
}

/** Una clase de mejora se añade solo al tener el piloto habilitado. */
export function visualClassName(base: string, feature: VisualFeature, enhancement: string): string {
  return isVisualFeatureEnabled(feature) ? base + " " + enhancement : base;
}
