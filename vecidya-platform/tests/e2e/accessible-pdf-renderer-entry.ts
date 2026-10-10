import { renderAccessiblePdf } from "./accessible-pdf-renderer";

(window as typeof window & { renderAccessiblePdf: typeof renderAccessiblePdf }).renderAccessiblePdf = renderAccessiblePdf;
