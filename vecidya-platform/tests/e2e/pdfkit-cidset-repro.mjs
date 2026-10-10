import assert from "node:assert/strict";
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { finished } from "node:stream/promises";
import PDFDocument from "pdfkit";

const [standard, weight, output] = process.argv.slice(2);
assert.ok(["pdfua", "pdfa1", "ordinary"].includes(standard), "standard must be pdfua, pdfa1, or ordinary");
assert.ok(["regular", "bold"].includes(weight), "weight must be regular or bold");
assert.ok(output, "output path is required");

const fontPath = resolve(
  "node_modules/@fontsource/arimo/files",
  weight === "bold" ? "arimo-latin-700-normal.woff" : "arimo-latin-400-normal.woff",
);
const subset = standard === "pdfua" ? "PDF/UA" : standard === "pdfa1" ? "PDF/A-1b" : undefined;
const doc = new PDFDocument({
  pdfVersion: standard === "pdfa1" ? "1.4" : "1.7",
  ...(subset ? { subset } : {}),
  tagged: standard !== "ordinary",
  displayTitle: standard === "pdfua",
  lang: "es",
  info: { Title: "Reproducción mínima CIDSet", Author: "PDFKit fixture" },
});
const destination = resolve(output);
mkdirSync(dirname(destination), { recursive: true });
const stream = createWriteStream(destination);
doc.pipe(stream);
const root = doc.struct("Document");
doc.addStructure(root);
doc.registerFont("Arimo", fontPath).font("Arimo").fontSize(18);
doc.text("Reproducción mínima CIDSet", { structParent: root, structType: "H1" });
doc.fontSize(12).text("Prueba breve en español con fuente Arimo incrustada.", { structParent: root });
doc.end();
await finished(stream);
console.log(JSON.stringify({ standard, weight, output: destination }));
