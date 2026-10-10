/** PDFKit 0.20.2 publishes runtime bundles without TypeScript declarations. */
declare module "pdfkit" {
  const PDFDocument: any;
  export default PDFDocument;
  export const registerStdFonts: any;
}

declare module "pdfkit/standard-fonts/Helvetica" {
  const Helvetica: any;
  export default Helvetica;
}
