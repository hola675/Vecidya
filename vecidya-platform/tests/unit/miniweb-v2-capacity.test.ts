import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateMiniWebCapacity } from "../../app/features/miniweb-v2/capacity";

test("MiniWeb capacity follows active licenses and explicit Cuadra extensions only", () => {
  assert.equal(calculateMiniWebCapacity(false, 0), 0);
  assert.equal(calculateMiniWebCapacity(false, 1), 0);
  assert.equal(calculateMiniWebCapacity(true, 0), 3);
  assert.equal(calculateMiniWebCapacity(true, 1), 6);
  assert.equal(calculateMiniWebCapacity(true, 2), 9);
  assert.equal(calculateMiniWebCapacity(true, -1), 3);
});
