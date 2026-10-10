import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const output = resolve("tmp/pdfs/act03-4b/cidset");
mkdirSync(output, { recursive: true });
const matrix = [
  ["pdfua", "regular"],
  ["pdfua", "bold"],
  ["pdfa1", "regular"],
  ["ordinary", "regular"],
];
for (const [standard, weight] of matrix) {
  const destination = resolve(output, `${standard}-${weight}.pdf`);
  execFileSync(process.execPath, ["tests/e2e/pdfkit-cidset-repro.mjs", standard, weight, destination], { stdio: "inherit" });
  const raw = readFileSync(destination).toString("latin1");
  assert.match(raw, /^%PDF-/, `${standard}/${weight} is a PDF`);
  if (standard === "pdfa1") assert.match(raw, /\/CIDSet\s+\d+\s+0\s+R/, "PDF/A-1b embeds the required CIDSet");
  else assert.doesNotMatch(raw, /\/CIDSet\s+\d+\s+0\s+R/, `${standard}/${weight} does not emit a PDF/A-only CIDSet`);
  if (standard === "pdfua") {
    assert.match(raw, /\/StructTreeRoot\s+\d+\s+0\s+R/, "PDF/UA has structure tags");
    assert.match(raw, /\/Subtype\s*\/Link/, "PDF/UA has a link annotation");
    assert.match(raw, /\/S\s*\/H1/, "PDF/UA includes a heading");
    assert.match(raw, /\/S\s*\/L\b/, "PDF/UA includes a list");
  }
}
const installedPackage = JSON.parse(readFileSync(resolve("node_modules/pdfkit/package.json"), "utf8"));
assert.equal(installedPackage.version, "0.20.2", "the pinned PDFKit runtime is 0.20.2");
console.log(`pdfkit-cidset-matrix-check: ${matrix.length} cases PASS; PDF/A CIDSet retained; PDF/UA regular and bold include headings, lists, and links.`);
