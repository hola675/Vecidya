import { useEffect, useMemo, useState } from "react";
import { LearnOfflineQueue, type LearnSyncOperation } from "../features/learn/learn-offline";

export function LearnSyncInbox({ userId }: { userId: string }) {
  const queue = useMemo(() => new LearnOfflineQueue(typeof window === "undefined" ? null : window.localStorage), []);
  const [anonymousCount, setAnonymousCount] = useState(0);
  const [accountCount, setAccountCount] = useState(0);
  const [retain, setRetain] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setAnonymousCount(queue.read(null).operations.length);
    setAccountCount(queue.read(userId).operations.length);
    setRetain(queue.retainAfterSignOut(userId));
  }, [queue, userId]);

  async function synchronize() {
    const operations = queue.read(userId).operations.filter((operation) => operation.status === "pending");
    if (!operations.length || !navigator.onLine) { setStatus(operations.length ? "Sin conexión; los cambios siguen guardados en este dispositivo." : "No hay cambios pendientes."); return; }
    try {
      const response = await fetch("/api/learn/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operations: operations.slice(0, 50) }) });
      if (!response.ok) { setStatus("No se pudo sincronizar. Se conservan los cambios para reintentar."); return; }
      const result = await response.json() as { results: Array<{ operationId: string; status: string; version?: number; resetEpoch?: number }> };
      const byId = new Map(result.results.map((item) => [item.operationId, item]));
      const remaining = queue.read(userId).operations.flatMap((operation) => {
        const item = byId.get(operation.operationId);
        if (!item) return [operation];
        if (["applied", "duplicate", "expired"].includes(item.status)) return [];
        const obsolete = item.resetEpoch !== undefined && item.resetEpoch !== operation.baseResetEpoch;
        return [{ ...operation, baseVersion: item.version ?? operation.baseVersion, baseResetEpoch: item.resetEpoch ?? operation.baseResetEpoch, status: obsolete ? "blocked" as const : "conflict" as const, statusMessage: obsolete ? "La guía se reinició antes de sincronizar este cambio." : "El progreso cambió en otro dispositivo." }];
      });
      queue.update(userId, remaining);
      setAccountCount(remaining.length);
      if (remaining.some((operation) => operation.status === "pending")) return synchronize();
      setStatus(remaining.length ? `${remaining.length} cambio(s) requieren revisión al abrir su guía.` : "Cambios sincronizados.");
    } catch { setStatus("Sin conexión; los cambios siguen guardados en este dispositivo."); }
  }

  function importAnonymous(accept: boolean) {
    const pending = queue.read(null).operations;
    if (accept) {
      const rebound: LearnSyncOperation[] = queue.rebindAnonymousForAccount(pending, userId);
      queue.update(userId, [...queue.read(userId).operations, ...rebound]);
      setAccountCount(queue.read(userId).operations.length);
    }
    queue.clear(null);
    setAnonymousCount(0);
    if (accept) void synchronize();
  }

  return <section className="card learn-sync-inbox" aria-labelledby="learn-sync-title">
    <h2 id="learn-sync-title">Sincronización de este dispositivo</h2>
    {anonymousCount > 0 && <><p>Hay {anonymousCount} cambio(s) anónimos en este dispositivo. Elige si quieres incorporarlos a esta cuenta.</p><button type="button" className="button button--primary" onClick={() => importAnonymous(true)}>Importar cambios</button><button type="button" className="text-link" onClick={() => importAnonymous(false)}>Descartar cambios anónimos</button></>}
    <label className="learn-sync-retention"><input type="checkbox" checked={retain} onChange={(event) => { setRetain(event.currentTarget.checked); queue.setRetainAfterSignOut(userId, event.currentTarget.checked); }} /> Conservar cambios pendientes en este dispositivo al cerrar sesión</label>
    <button type="button" className="button button--secondary" onClick={() => void synchronize()}>Sincronizar ahora</button>
    <p aria-live="polite">{status || `${accountCount} cambio(s) de esta cuenta en cola.`}</p>
  </section>;
}
