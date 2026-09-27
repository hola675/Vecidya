import assert from "node:assert/strict";
import { test } from "node:test";

import { sha256Hex } from "../../../app/features/diagnostic/hashing.ts";

test("produces a 64-character lowercase hex digest", async () => {
  const digest = await sha256Hex("hello");
  assert.equal(digest.length, 64);
  assert.match(digest, /^[0-9a-f]{64}$/);
});

test("matches the known SHA-256 digest of an empty string", async () => {
  const digest = await sha256Hex("");
  assert.equal(digest, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
});

test("is deterministic", async () => {
  const first = await sha256Hex("diag-v3-08");
  const second = await sha256Hex("diag-v3-08");
  assert.equal(first, second);
});
