import {
  buildDiagnosticV9LocalDraftEnvelope,
  DIAGNOSTIC_V9_LOCAL_DRAFT_STORAGE_KEY,
  parseDiagnosticV9LocalDraft,
  type DiagnosticV9LocalDraftEnvelope,
  type DiagnosticV9LocalDraftReadResult,
} from "./local-draft";
import type { CandidateSessionV9Prototype } from "../../diagnostic/qa03b/v9-session-prototype";

export type DiagnosticV9StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type LockManagerLike = { request<T>(name: string, callback: () => T | Promise<T>): Promise<T> };

export type DiagnosticV9LocalDraftWriteResult =
  | { readonly status: "written"; readonly persistence: "local" | "memory"; readonly envelope: DiagnosticV9LocalDraftEnvelope }
  | { readonly status: "idempotent"; readonly persistence: "local" | "memory"; readonly envelope: DiagnosticV9LocalDraftEnvelope }
  | { readonly status: "conflict"; readonly latest: DiagnosticV9LocalDraftEnvelope }
  | { readonly status: "invalid" }
  | { readonly status: "unavailable" };

export type DiagnosticV9LocalDraftStoreReadResult =
  | Exclude<DiagnosticV9LocalDraftReadResult, { readonly status: "expired" }>
  | { readonly status: "expired"; readonly cleanup: "cleared" | "unavailable" };

export class DiagnosticV9LocalDraftStore {
  private memoryEnvelope: DiagnosticV9LocalDraftEnvelope | null = null;
  private memoryUnavailable = false;
  private readonly storage: DiagnosticV9StorageLike | null;
  private readonly locks?: LockManagerLike;
  private readonly key: string;

  constructor(
    storage: DiagnosticV9StorageLike | null,
    locks?: LockManagerLike,
    key = DIAGNOSTIC_V9_LOCAL_DRAFT_STORAGE_KEY,
  ) {
    this.storage = storage;
    this.locks = locks;
    this.key = key;
  }

  get persistenceMode(): "local" | "memory" {
    return this.storage && !this.memoryUnavailable ? "local" : "memory";
  }

  async readResult(now = Date.now()): Promise<DiagnosticV9LocalDraftStoreReadResult> {
    if (!this.storage) return this.readMemory(now);
    if (!this.locks) return this.readStored(now, false);
    try {
      return await this.locks.request(`vecidya-diagnostic-v9:${this.key}`, () => this.readStored(now, true));
    } catch {
      return this.readStored(now, false);
    }
  }

  private readMemory(now: number): DiagnosticV9LocalDraftStoreReadResult {
    if (!this.memoryEnvelope) return this.memoryUnavailable ? { status: "unavailable" } : { status: "empty" };
    const result = parseDiagnosticV9LocalDraft(JSON.stringify(this.memoryEnvelope), now);
    if (result.status === "expired") {
      this.memoryEnvelope = null;
      return { status: "expired", cleanup: "cleared" };
    }
    return result;
  }

  private readStored(
    now: number,
    mayDeleteExpired: boolean,
    attempts = 0,
  ): DiagnosticV9LocalDraftStoreReadResult {
    let raw: string | null;
    try {
      raw = this.storage!.getItem(this.key);
    } catch {
      this.memoryUnavailable = true;
      const memory = this.readMemory(now);
      return memory.status === "expired" ? { status: "expired", cleanup: "unavailable" } : memory;
    }
    if (raw === null) return this.readMemory(now);

    const result = parseDiagnosticV9LocalDraft(raw, now);
    if (result.status === "found") {
      this.memoryEnvelope = result.envelope;
      return result;
    }
    if (result.status !== "expired") return result;
    if (!mayDeleteExpired || attempts >= 3) {
      this.clearMatchingMemory(raw);
      return { status: "expired", cleanup: "unavailable" };
    }

    try {
      // This branch is reachable only after acquiring the shared Web Lock.
      // Re-read before deleting; without a lock, cleanup is skipped above.
      const current = this.storage!.getItem(this.key);
      if (current !== raw) return this.readStored(now, true, attempts + 1);
      this.storage!.removeItem(this.key);
      const afterRemoval = this.storage!.getItem(this.key);
      if (afterRemoval !== null) return this.readStored(now, true, attempts + 1);
      this.clearMatchingMemory(raw);
      return { status: "expired", cleanup: "cleared" };
    } catch {
      this.memoryUnavailable = true;
      this.clearMatchingMemory(raw);
      return { status: "expired", cleanup: "unavailable" };
    }
  }

  private clearMatchingMemory(raw: string): void {
    if (!this.memoryEnvelope) return;
    try {
      const stored = JSON.parse(raw) as { storageVersion?: unknown; session?: unknown };
      const session = stored.session as Record<string, unknown> | undefined;
      if (stored.storageVersion === this.memoryEnvelope.storageVersion &&
        session?.sessionId === this.memoryEnvelope.session.sessionId &&
        session?.revision === this.memoryEnvelope.session.revision &&
        session?.updatedAt === this.memoryEnvelope.session.updatedAt) {
        this.memoryEnvelope = null;
      }
    } catch {
      // Invalid storage cannot establish that its contents match the memory copy.
    }
  }

  private readResultForWrite(now: number): DiagnosticV9LocalDraftStoreReadResult {
    if (!this.storage) {
      return this.readMemory(now);
    }
    return this.readStored(now, false);
  }

  async write(session: CandidateSessionV9Prototype): Promise<DiagnosticV9LocalDraftWriteResult> {
    const envelope = buildDiagnosticV9LocalDraftEnvelope(session);
    if (!envelope) return { status: "invalid" };
    const commit = async (): Promise<DiagnosticV9LocalDraftWriteResult> => {
      const latest = this.readResultForWrite(session.updatedAt);
      if (latest.status === "found") {
        const current = latest.envelope.session;
        if (current.sessionId !== session.sessionId || current.revision > session.revision) {
          return { status: "conflict", latest: latest.envelope };
        }
        if (current.revision === session.revision) {
          return JSON.stringify(current) === JSON.stringify(session)
            ? { status: "idempotent", persistence: this.storage && !this.memoryUnavailable ? "local" : "memory", envelope: latest.envelope }
            : { status: "conflict", latest: latest.envelope };
        }
      } else if (latest.status === "invalid") {
        return { status: "invalid" };
      } else if (latest.status !== "empty" && latest.status !== "expired" && latest.status !== "unavailable") {
        return { status: "unavailable" };
      }

      this.memoryEnvelope = envelope;
      if (!this.storage || this.memoryUnavailable) {
        return { status: "written", persistence: "memory", envelope };
      }
      try {
        this.storage.setItem(this.key, JSON.stringify(envelope));
        const verified = this.readResultForWrite(session.updatedAt);
        if (verified.status === "found" && (
          verified.envelope.session.sessionId !== session.sessionId ||
          verified.envelope.session.revision > session.revision ||
          (verified.envelope.session.revision === session.revision &&
            JSON.stringify(verified.envelope.session) !== JSON.stringify(session))
        )) {
          return { status: "conflict", latest: verified.envelope };
        }
        return { status: "written", persistence: "local", envelope };
      } catch {
        this.memoryUnavailable = true;
        return { status: "written", persistence: "memory", envelope };
      }
    };
    if (!this.locks) return commit();
    try {
      return await this.locks.request(`vecidya-diagnostic-v9:${this.key}`, commit);
    } catch {
      // Do not bypass a failed shared lock and race a cross-tab localStorage write.
      this.memoryUnavailable = true;
      return commit();
    }
  }

  async clear(): Promise<"cleared" | "unavailable"> {
    const clearStorage = (): "cleared" | "unavailable" => {
      this.memoryEnvelope = null;
      this.memoryUnavailable = false;
      if (!this.storage) return "cleared";
      try {
        this.storage.removeItem(this.key);
        return "cleared";
      } catch {
        this.memoryUnavailable = true;
        return "unavailable";
      }
    };
    if (!this.locks) return clearStorage();
    try {
      return await this.locks.request(`vecidya-diagnostic-v9:${this.key}`, clearStorage);
    } catch {
      return clearStorage();
    }
  }
}

let browserStore: DiagnosticV9LocalDraftStore | null = null;

export function createBrowserDiagnosticV9LocalDraftStore(): DiagnosticV9LocalDraftStore {
  if (browserStore) return browserStore;
  let storage: DiagnosticV9StorageLike | null = null;
  try {
    storage = window.localStorage;
  } catch {
    // The store keeps the current interview in memory and reports the recovery limitation.
  }
  const locks = "locks" in navigator ? navigator.locks : undefined;
  browserStore = new DiagnosticV9LocalDraftStore(storage, locks);
  return browserStore;
}
