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

  readResult(now = Date.now()): DiagnosticV9LocalDraftReadResult {
    if (!this.storage) {
      if (this.memoryEnvelope) return parseDiagnosticV9LocalDraft(JSON.stringify(this.memoryEnvelope), now);
      return this.memoryUnavailable ? { status: "unavailable" } : { status: "empty" };
    }
    try {
      const raw = this.storage.getItem(this.key);
      if (raw === null) return this.memoryEnvelope
        ? parseDiagnosticV9LocalDraft(JSON.stringify(this.memoryEnvelope), now)
        : { status: "empty" };
      const result = parseDiagnosticV9LocalDraft(raw, now);
      if (result.status === "found") this.memoryEnvelope = result.envelope;
      return result;
    } catch {
      this.memoryUnavailable = true;
      return this.memoryEnvelope
        ? { status: "found", envelope: this.memoryEnvelope }
        : { status: "unavailable" };
    }
  }

  async write(session: CandidateSessionV9Prototype): Promise<DiagnosticV9LocalDraftWriteResult> {
    const envelope = buildDiagnosticV9LocalDraftEnvelope(session);
    if (!envelope) return { status: "invalid" };
    const commit = async (): Promise<DiagnosticV9LocalDraftWriteResult> => {
      const latest = this.readResult(session.updatedAt);
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
      // Lock APIs may fail in restricted contexts; retain optimistic revision checks.
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
