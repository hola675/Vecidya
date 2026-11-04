import {
  DIAGNOSTIC_V9_FINAL_RESULT_STORAGE_KEY,
  parseDiagnosticV9FinalResult,
  type DiagnosticV9FinalResultEnvelope,
  type DiagnosticV9FinalResultReadResult,
} from "./final-result";

export class DiagnosticV9FinalResultStore {
  private memory: DiagnosticV9FinalResultEnvelope | null = null;
  private unavailable = false;
  constructor(private readonly storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null,
    private readonly key = DIAGNOSTIC_V9_FINAL_RESULT_STORAGE_KEY) {}

  read(now = Date.now()): DiagnosticV9FinalResultReadResult {
    if (!this.storage) return this.memory ? parseDiagnosticV9FinalResult(JSON.stringify(this.memory), now) : { status: "empty" };
    try {
      const raw = this.storage.getItem(this.key);
      if (raw === null) return this.memory ? parseDiagnosticV9FinalResult(JSON.stringify(this.memory), now) : { status: "empty" };
      const parsed = parseDiagnosticV9FinalResult(raw, now);
      if (parsed.status === "found") this.memory = parsed.envelope;
      return parsed;
    } catch {
      this.unavailable = true;
      return this.memory ? parseDiagnosticV9FinalResult(JSON.stringify(this.memory), now) : { status: "unavailable" };
    }
  }

  write(envelope: DiagnosticV9FinalResultEnvelope): "local" | "memory" {
    this.memory = envelope;
    if (!this.storage || this.unavailable) return "memory";
    try { this.storage.setItem(this.key, JSON.stringify(envelope)); return "local"; }
    catch { this.unavailable = true; return "memory"; }
  }

  clear(): "cleared" | "unavailable" {
    this.memory = null;
    if (!this.storage || this.unavailable) return this.unavailable ? "unavailable" : "cleared";
    try { this.storage.removeItem(this.key); return "cleared"; }
    catch { this.unavailable = true; return "unavailable"; }
  }
}

let browserStore: DiagnosticV9FinalResultStore | null = null;
export function createBrowserDiagnosticV9FinalResultStore(): DiagnosticV9FinalResultStore {
  if (browserStore) return browserStore;
  let storage: Storage | null = null;
  try { storage = window.localStorage; } catch { /* Memory fallback is used. */ }
  browserStore = new DiagnosticV9FinalResultStore(storage);
  return browserStore;
}
