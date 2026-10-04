import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("diagnostic dimensions keep a readable full-width content column on desktop", () => {
  const css = readFileSync("app/app.css", "utf8");
  assert.match(css, /\.dr-dim\s*\{\s*grid-template-columns:\s*5rem\s+minmax\(0,\s*1fr\)/);
});
