import assert from "node:assert/strict";
import test from "node:test";

import { LearnOfflineQueue, LEARN_MAX_QUEUED_OPERATIONS, LEARN_OPERATION_MAX_AGE_MS, type LearnStorage } from "../../../app/features/learn/learn-offline.ts";

class MemoryStorage implements LearnStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

function factory() { let next = 0; return () => `learn-device-operation-${++next}`; }

test("stores account queues separately and never exposes them in the anonymous namespace", () => {
  const storage = new MemoryStorage();
  const queue = new LearnOfflineQueue(storage, factory());
  queue.append("user-a", { guideId: "guide", type: "check-section", sectionId: "section", baseVersion: 0, baseResetEpoch: 0 });
  assert.equal(queue.read("user-a").operations.length, 1);
  assert.equal(queue.read("user-b").operations.length, 0);
  assert.equal(queue.read(null).operations.length, 0);
});

test("assigns monotonically increasing sequence numbers and stable device IDs per scope", () => {
  const queue = new LearnOfflineQueue(new MemoryStorage(), factory());
  const first = queue.append("user-a", { guideId: "guide", type: "check-section", sectionId: "one", baseVersion: 0, baseResetEpoch: 0 }, 100);
  const second = queue.append("user-a", { guideId: "guide", type: "uncheck-section", sectionId: "one", baseVersion: 1, baseResetEpoch: 0 }, 101);
  assert.equal(first?.clientSequence, 1);
  assert.equal(second?.clientSequence, 2);
  assert.equal(first?.deviceId, second?.deviceId);
});

test("drops locally expired work and reports its count", () => {
  const queue = new LearnOfflineQueue(new MemoryStorage(), factory());
  queue.append("user-a", { guideId: "guide", type: "check-section", sectionId: "one", baseVersion: 0, baseResetEpoch: 0 }, 100);
  const current = queue.read("user-a", 100 + LEARN_OPERATION_MAX_AGE_MS + 1);
  assert.equal(current.expiredCount, 1);
  assert.equal(current.operations.length, 0);
});

test("bounds the queue and makes account re-import use a fresh device sequence and operation IDs", () => {
  const queue = new LearnOfflineQueue(new MemoryStorage(), factory());
  for (let index = 0; index < LEARN_MAX_QUEUED_OPERATIONS; index += 1) {
    assert.ok(queue.append(null, { guideId: "guide", type: "favorite", baseVersion: 0, baseResetEpoch: 0 }, index + 1));
  }
  assert.equal(queue.append(null, { guideId: "guide", type: "favorite", baseVersion: 0, baseResetEpoch: 0 }, LEARN_MAX_QUEUED_OPERATIONS + 1), null);
  const pending = queue.read(null, LEARN_MAX_QUEUED_OPERATIONS + 2).operations;
  const imported = queue.rebindAnonymousForAccount(pending.slice(0, 2), "user-a", LEARN_MAX_QUEUED_OPERATIONS + 3);
  assert.deepEqual(imported.map((operation) => operation.clientSequence), [1, 2]);
  assert.notEqual(imported[0]?.deviceId, pending[0]?.deviceId);
  assert.notEqual(imported[0]?.operationId, pending[0]?.operationId);
});

test("discarding an obsolete operation removes only its device tail and rewinds that queue cursor", () => {
  const storage = new MemoryStorage();
  const queue = new LearnOfflineQueue(storage, factory());
  const now = Date.now();
  const first = queue.append("user-a", { guideId: "guide", type: "check-section", sectionId: "one", baseVersion: 0, baseResetEpoch: 0 }, now)!;
  const second = queue.append("user-a", { guideId: "guide", type: "check-section", sectionId: "two", baseVersion: 1, baseResetEpoch: 0 }, now + 1)!;
  const otherDevice = { ...second, operationId: "other-device-operation", deviceId: "another-device", clientSequence: 1 };
  queue.update("user-a", [first, second, otherDevice]);
  assert.equal(queue.discardDeviceTail("user-a", first.operationId), 2);
  assert.deepEqual(queue.read("user-a").operations.map((operation) => operation.operationId), [otherDevice.operationId]);
  const replacement = queue.append("user-a", { guideId: "guide", type: "check-section", sectionId: "three", baseVersion: 0, baseResetEpoch: 0 }, now + 2);
  assert.equal(replacement?.clientSequence, 1);
});
