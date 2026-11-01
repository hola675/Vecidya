export const LEARN_QUEUE_STORAGE_VERSION = 1;
export const LEARN_OPERATION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const LEARN_MAX_QUEUED_OPERATIONS = 200;

export type LearnOperationType = "check-section" | "uncheck-section" | "set-last-section" | "reset-guide" | "favorite" | "unfavorite" | "hide-recent" | "restore-recent";
export type LearnOperationStatus = "pending" | "conflict" | "blocked";

export type LearnSyncOperation = {
  operationId: string;
  deviceId: string;
  clientSequence: number;
  guideId: string;
  type: LearnOperationType;
  sectionId?: string;
  baseVersion: number;
  baseResetEpoch: number;
  createdAt: number;
  status: LearnOperationStatus;
  statusMessage?: string;
};

export type LearnQueueSnapshot = { operations: LearnSyncOperation[]; expiredCount: number; overflowCount: number };
export type LearnStorage = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };

const QUEUE_KEY_PREFIX = "vecidya.learn.sync.v1:";
const DEVICE_KEY_PREFIX = "vecidya.learn.device.v1:";
const SEQUENCE_KEY_PREFIX = "vecidya.learn.sequence.v1:";

function parseOperation(value: unknown): value is LearnSyncOperation {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LearnSyncOperation>;
  return typeof item.operationId === "string" && typeof item.deviceId === "string" && Number.isSafeInteger(item.clientSequence) && (item.clientSequence ?? 0) > 0 && typeof item.guideId === "string" && typeof item.type === "string" && Number.isSafeInteger(item.baseVersion) && Number.isSafeInteger(item.baseResetEpoch) && Number.isSafeInteger(item.createdAt) && ["pending", "conflict", "blocked"].includes(item.status ?? "");
}

function userScope(userId: string | null) { return userId ? `account:${encodeURIComponent(userId)}` : "anonymous"; }
function readJSON(storage: LearnStorage | null, key: string): unknown {
  try { const raw = storage?.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function writeJSON(storage: LearnStorage | null, key: string, value: unknown) {
  try { storage?.setItem(key, JSON.stringify(value)); } catch { /* El cambio sigue disponible en memoria hasta cerrar la página. */ }
}

export class LearnOfflineQueue {
  private readonly storage: LearnStorage | null;
  private readonly idFactory: () => string;

  constructor(storage: LearnStorage | null, idFactory: () => string = () => globalThis.crypto.randomUUID()) {
    this.storage = storage;
    this.idFactory = idFactory;
  }

  deviceId(userId: string | null) {
    const key = `${DEVICE_KEY_PREFIX}${userScope(userId)}`;
    const existing = readJSON(this.storage, key);
    if (typeof existing === "string" && existing.length >= 16) return existing;
    const next = this.idFactory();
    writeJSON(this.storage, key, next);
    return next;
  }

  read(userId: string | null, now = Date.now()): LearnQueueSnapshot {
    const key = `${QUEUE_KEY_PREFIX}${userScope(userId)}`;
    const raw = readJSON(this.storage, key) as { version?: unknown; operations?: unknown } | null;
    if (!raw || raw.version !== LEARN_QUEUE_STORAGE_VERSION || !Array.isArray(raw.operations)) return { operations: [], expiredCount: 0, overflowCount: 0 };
    const parsed = raw.operations.filter(parseOperation);
    const fresh = parsed.filter((operation) => now - operation.createdAt <= LEARN_OPERATION_MAX_AGE_MS);
    const expiredCount = parsed.length - fresh.length;
    const overflowCount = Math.max(0, fresh.length - LEARN_MAX_QUEUED_OPERATIONS);
    const operations = fresh.slice(-LEARN_MAX_QUEUED_OPERATIONS);
    if (expiredCount || overflowCount || parsed.length !== raw.operations.length) this.write(userId, operations);
    return { operations, expiredCount, overflowCount };
  }

  append(userId: string | null, input: Omit<LearnSyncOperation, "operationId" | "deviceId" | "clientSequence" | "createdAt" | "status">, now = Date.now()): LearnSyncOperation | null {
    const snapshot = this.read(userId, now);
    if (snapshot.operations.length >= LEARN_MAX_QUEUED_OPERATIONS) return null;
    const deviceId = this.deviceId(userId);
    const sequenceKey = `${SEQUENCE_KEY_PREFIX}${userScope(userId)}`;
    const storedSequence = Number(readJSON(this.storage, sequenceKey) ?? 0);
    const queuedSequence = snapshot.operations.reduce((maximum, operation) => operation.deviceId === deviceId ? Math.max(maximum, operation.clientSequence) : maximum, 0);
    const nextSequence = Math.max(storedSequence, queuedSequence) + 1;
    writeJSON(this.storage, sequenceKey, nextSequence);
    const operation: LearnSyncOperation = { ...input, operationId: this.idFactory(), deviceId, clientSequence: nextSequence, createdAt: now, status: "pending" };
    this.write(userId, [...snapshot.operations, operation]);
    return operation;
  }

  update(userId: string | null, operations: LearnSyncOperation[]) { this.write(userId, operations); }

  discardDeviceTail(userId: string | null, operationId: string) {
    const operations = this.read(userId).operations;
    const target = operations.find((operation) => operation.operationId === operationId);
    if (!target) return 0;
    const removed = operations.filter((operation) => operation.deviceId === target.deviceId && operation.clientSequence >= target.clientSequence);
    const remaining = operations.filter((operation) => !removed.includes(operation));
    this.write(userId, remaining);
    writeJSON(this.storage, `${SEQUENCE_KEY_PREFIX}${userScope(userId)}`, target.clientSequence - 1);
    return removed.length;
  }

  clear(userId: string | null) {
    try { this.storage?.removeItem(`${QUEUE_KEY_PREFIX}${userScope(userId)}`); } catch { /* Ignore unavailable browser storage. */ }
  }

  retainAfterSignOut(userId: string): boolean { return readJSON(this.storage, `vecidya.learn.retain.v1:${encodeURIComponent(userId)}`) === true; }

  setRetainAfterSignOut(userId: string, retain: boolean) { writeJSON(this.storage, `vecidya.learn.retain.v1:${encodeURIComponent(userId)}`, retain); }

  rebindAnonymousForAccount(operations: LearnSyncOperation[], userId: string, now = Date.now()): LearnSyncOperation[] {
    const deviceId = this.deviceId(userId);
    const sequenceKey = `${SEQUENCE_KEY_PREFIX}${userScope(userId)}`;
    const startingSequence = Number(readJSON(this.storage, sequenceKey) ?? 0);
    const valid = operations.filter((operation) => now - operation.createdAt <= LEARN_OPERATION_MAX_AGE_MS);
    const rebound = valid.map((operation, index) => ({ ...operation, operationId: this.idFactory(), deviceId, clientSequence: startingSequence + index + 1, createdAt: now, status: "pending" as const, statusMessage: undefined }));
    writeJSON(this.storage, sequenceKey, startingSequence + rebound.length);
    return rebound;
  }

  private write(userId: string | null, operations: LearnSyncOperation[]) {
    writeJSON(this.storage, `${QUEUE_KEY_PREFIX}${userScope(userId)}`, { version: LEARN_QUEUE_STORAGE_VERSION, operations });
  }
}
