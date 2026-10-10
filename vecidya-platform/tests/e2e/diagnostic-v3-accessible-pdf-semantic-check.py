"""Field-level semantic and output audit for ACT-03.3/03.4 candidate PDFs.

Requires PyMuPDF (fitz). The PoC runner writes each report model, its explicit
semantic manifest, and one A4/Carta pair before this script is run.
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

import pymupdf as fitz


ROOT = Path("tmp/pdfs/act03-4b")
MODEL_ROOT = Path("tmp/act03-4b")


def normalized(value: object) -> str:
    value = unicodedata.normalize("NFKD", str(value)).casefold()
    value = "".join(char for char in value if not unicodedata.combining(char))
    return " ".join(re.findall(r"[a-z0-9]+", value))


def leaf_values(value: object, path: str = "$") -> list[tuple[str, object]]:
    if value is None or isinstance(value, bool):
        return []
    if isinstance(value, (str, int, float)):
        return [(path, value)]
    if isinstance(value, list):
        return [leaf for index, item in enumerate(value) for leaf in leaf_values(item, f"{path}[{index}]")]
    if isinstance(value, dict):
        return [leaf for key, item in value.items() for leaf in leaf_values(item, f"{path}.{key}")]
    return []


def difference_category(path: str) -> str | None:
    if path in {"$.generatedAt", "$.completedAt"}:
        return "timestamp-internal-alias"
    if path == "$.overallPresence.state":
        return "enum-alias"
    if path == "$.overallPresence.label":
        return "conditional-alias"
    if path.startswith("$.dimensions[") and path.endswith(".key"):
        return "technical-identifier"
    if path.startswith("$.dimensions[") and path.endswith(".icon"):
        return "asset-path"
    if path.startswith("$.dimensions[") and path.endswith(".status"):
        return "enum-alias"
    if path.startswith("$.dimensions[") and path.endswith(".evidenceLead"):
        return "format-alias"
    if path.startswith("$.dimensions[") and ".context." in path:
        return "non-applicable-detail"
    if path.startswith("$.sources[") and path.endswith(".url"):
        return "link-annotation"
    if path.startswith("$.candidateEngineIdentity."):
        return "technical-metadata"
    return None


def page_text(document: fitz.Document) -> str:
    return "\n".join(page.get_text(sort=True) for page in document)


def occurrence_count(text: str, phrase: str) -> int:
    if not phrase:
        return 0
    return len(re.findall(rf"(?<![a-z0-9]){re.escape(phrase)}(?![a-z0-9])", text))


def inspect_pdf(path: Path, report: dict, manifest: dict) -> dict:
    document = fitz.open(path)
    extracted = page_text(document)
    text = normalized(extracted)
    mandatory = manifest["mandatoryText"]
    missing = [entry for entry in mandatory if normalized(entry["value"]) not in text]
    link_uris = {
        link.get("uri")
        for page in document
        for link in page.get_links()
        if link.get("uri")
    }
    missing_links = [link for link in manifest["links"] if link["url"] not in link_uris]

    expected_sources = [normalized(entry["value"]) for entry in mandatory]
    expected_sources.extend(normalized(heading) for heading in manifest["headingOrder"])
    expected_sources.extend(normalized(link["text"]) for link in manifest["links"])
    expected_counts = Counter()
    for phrase in {source for source in expected_sources if len(source) >= 18}:
        expected_counts[phrase] = sum(occurrence_count(source, phrase) for source in expected_sources)
    duplicates = []
    for value, expected in expected_counts.items():
        actual = occurrence_count(text, value)
        if actual > expected:
            duplicates.append({"value": value, "expectedOccurrences": expected, "actualOccurrences": actual})

    unexplained = []
    classified_details = []
    classified = Counter()
    for path_value, value in leaf_values(report):
        if len(normalized(value)) < 4 or normalized(value) in text:
            continue
        category = difference_category(path_value)
        if category is None:
            unexplained.append({"path": path_value, "value": str(value)})
        else:
            classified[category] += 1
            classified_details.append({"path": path_value, "category": category, "value": str(value)})

    positions = [text.find(normalized(heading)) for heading in manifest["headingOrder"]]
    heading_order_failures = [
        {"heading": heading, "position": position}
        for heading, position in zip(manifest["headingOrder"], positions)
        if position < 0
    ]
    if not heading_order_failures:
        for index in range(1, len(positions)):
            if positions[index] <= positions[index - 1]:
                heading_order_failures.append({"heading": manifest["headingOrder"][index], "position": positions[index], "reason": "order"})

    spans = [
        span
        for page in document
        for block in page.get_text("dict")["blocks"]
        for line in block.get("lines", [])
        for span in line.get("spans", [])
    ]
    sizes = [span["size"] for span in spans]
    outside = [
        span["text"]
        for page in document
        for block in page.get_text("dict")["blocks"]
        for line in block.get("lines", [])
        for span in line.get("spans", [])
        if span["bbox"][0] < -1 or span["bbox"][1] < -1 or span["bbox"][2] > page.rect.width + 1 or span["bbox"][3] > page.rect.height + 1
    ]
    catalog = document.pdf_catalog()
    metadata = document.get_xml_metadata() or ""
    raw = path.read_bytes()
    link_objects = [
        match.group(1)
        for match in re.finditer(rb"\d+\s+0\s+obj\b([\s\S]*?)endobj", raw)
        if b"/Subtype /Link" in match.group(1)
    ]
    embedded_fonts = []
    for page_index in range(len(document)):
        for font in document.get_page_fonts(page_index, full=True):
            extracted_font = document.extract_font(font[0])
            embedded_fonts.append({"page": page_index + 1, "name": font[3], "bytes": len(extracted_font[3])})

    return {
        "file": path.name,
        "scenario": manifest["scenario"],
        "pages": len(document),
        "bytes": path.stat().st_size,
        "mandatoryTextCount": len(mandatory),
        "mandatoryTextComplete": not missing,
        "mandatoryMissing": missing,
        "mandatoryLinksComplete": not missing_links,
        "missingLinks": missing_links,
        "classifiedDifferences": dict(classified),
        "classifiedDifferenceDetails": classified_details,
        "unexplainedDifferences": unexplained,
        "unjustifiedDuplicates": duplicates,
        "headingOrderFailures": heading_order_failures,
        "minimumFontPt": min(sizes) if sizes else None,
        "outsidePageSpans": outside,
        "xmpPresent": bool(metadata),
        "pdfuaPart1": "<pdfuaid:part>1</pdfuaid:part>" in metadata,
        "taggedStructure": document.xref_get_key(catalog, "StructTreeRoot")[0] == "xref",
        "spanLanguage": document.xref_get_key(catalog, "Lang") == ("string", "es"),
        "markedContent": document.xref_get_key(catalog, "MarkInfo")[0] == "xref",
        "sourceLinks": len(link_uris),
        "structuredLinkAnnotations": len(link_objects) == len(manifest["links"]) and all(b"/StructParent" in body for body in link_objects),
        "embeddedFontCount": len(embedded_fonts),
        "embeddedFontsValid": bool(embedded_fonts) and all(font["bytes"] > 0 for font in embedded_fonts),
    }


def main() -> int:
    results = []
    for scenario in ("C01", "C06", "C09", "C13", "C14", "C16", "C24"):
        report = json.loads((MODEL_ROOT / f"{scenario}.json").read_text(encoding="utf-8"))
        manifest = json.loads((MODEL_ROOT / f"{scenario}.semantic-manifest.json").read_text(encoding="utf-8"))
        for paper in ("a4", "letter"):
            path = ROOT / f"candidate-{scenario}-{paper}.pdf"
            results.append(inspect_pdf(path, report, manifest))

    mandatory_loss = sum(len(item["mandatoryMissing"]) + len(item["missingLinks"]) for item in results)
    unexplained = sum(len(item["unexplainedDifferences"]) for item in results)
    duplicates = sum(len(item["unjustifiedDuplicates"]) for item in results)
    technical_failures = [
        item for item in results
        if item["pages"] > 4
        or item["minimumFontPt"] is None
        or item["minimumFontPt"] < 8.5
        or item["outsidePageSpans"]
        or not item["xmpPresent"]
        or not item["pdfuaPart1"]
        or not item["taggedStructure"]
        or not item["spanLanguage"]
        or not item["markedContent"]
        or not item["structuredLinkAnnotations"]
        or not item["embeddedFontsValid"]
        or item["headingOrderFailures"]
    ]
    summary = {
        "pdfs": len(results),
        "MANDATORY_CONTENT_LOSS": mandatory_loss,
        "UNEXPLAINED_SEMANTIC_DIFFERENCES": unexplained,
        "UNJUSTIFIED_DUPLICATES": duplicates,
        "technicalFailures": [item["file"] for item in technical_failures],
        "results": [
            {key: item[key] for key in ("file", "pages", "bytes", "mandatoryTextCount", "mandatoryTextComplete", "mandatoryLinksComplete", "classifiedDifferences", "unexplainedDifferences", "unjustifiedDuplicates", "headingOrderFailures", "minimumFontPt", "outsidePageSpans", "xmpPresent", "pdfuaPart1", "taggedStructure", "spanLanguage", "markedContent", "sourceLinks", "structuredLinkAnnotations", "embeddedFontCount", "embeddedFontsValid")}
            for item in results
        ],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if len(results) != 14 or mandatory_loss or unexplained or duplicates or technical_failures else 0


if __name__ == "__main__":
    sys.exit(main())
