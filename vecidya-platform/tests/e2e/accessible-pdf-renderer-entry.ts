import { renderAccessiblePdf } from "../../app/features/diagnostic/accessible-pdf-renderer.client";

(window as typeof window & { renderAccessiblePdf: typeof renderAccessiblePdf }).renderAccessiblePdf = renderAccessiblePdf;
