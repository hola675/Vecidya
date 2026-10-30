import { useCallback, useEffect, useMemo, useState } from "react";
import { LearnOfflineQueue, type LearnSyncOperation } from "../features/learn/learn-offline";

type Props = {
  userId: string | null;
  guideId: string;
  version: number;
  resetEpoch: number;
  sectionIds: string[];
  sectionLabels?: string[];
  initialChecked: string[];
  initialFavorite: boolean;
  initialLastSectionId: string | null;
  access: "always_free" | "licensed";
  showProgress?: boolean;
  onCheckedChange?: (checkedSectionIds: string[]) => void;
};

export function LearnProgressControls(props: Props) {
  const queue = useMemo(() => new LearnOfflineQueue(typeof window === "undefined" ? null : window.localStorage), []);
  const [checked, setChecked] = useState(() => new Set(props.initialChecked));
  const [favorite, setFavorite] = useState(props.initialFavorite);
  const [lastSection, setLastSection] = useState(props.initialLastSectionId);
  const [pending, setPending] = useState(0);
  const [conflicts, setConflicts] = useState<LearnSyncOperation[]>([]);
  const [message, setMessage] = useState("");
  const [version, setVersion] = useState(props.version);
  const [resetEpoch, setResetEpoch] = useState(props.resetEpoch);
  const [anonymousImportCount, setAnonymousImportCount] = useState(0);
  const [retainOnSignOut, setRetainOnSignOut] = useState(false);

  const flush = useCallback(async () => {
    if (!props.userId || !navigator.onLine) return;
    const snapshot = queue.read(props.userId);
    if (props.userId) {
      setAnonymousImportCount(queue.read(null).operations.length);
      setRetainOnSignOut(queue.retainAfterSignOut(props.userId));
    }
    const operations = snapshot.operations.filter((op) => op.status === "pending");
    if (!operations.length) { setPending(snapshot.operations.length); return; }
    try {
      const response = await fetch("/api/learn/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operations: operations.slice(0, 50) }) });
      if (!response.ok) { if (response.status === 401 || response.status === 403) setMessage("No se pudo sincronizar: verifica tu sesión y el acceso a la guía."); return; }
      const result = await response.json() as { results: Array<{ operationId: string; status: string; version?: number; resetEpoch?: number }> };
      const byId = new Map(result.results.map((item) => [item.operationId, item]));
      const remaining = snapshot.operations.flatMap((op) => {
        const item = byId.get(op.operationId);
        if (!item) return [op];
        if (item.status === "applied" || item.status === "duplicate" || item.status === "expired") return [];
        if (item.status === "conflict" && item.resetEpoch !== undefined && item.resetEpoch !== op.baseResetEpoch) return [{ ...op, status: "blocked" as const, statusMessage: "Esta acción pertenece a una época anterior a un reinicio y no se puede volver a aplicar." }];
        return [{ ...op, baseVersion: item.version ?? op.baseVersion, baseResetEpoch: item.resetEpoch ?? op.baseResetEpoch, status: "conflict" as const, statusMessage: "El estado cambió en otra sesión. Confirma si quieres volver a aplicar esta acción." }];
      });
      queue.update(props.userId, remaining);
      setConflicts(remaining.filter((operation) => operation.guideId === props.guideId && operation.status !== "pending"));
      setPending(remaining.length);
      if (remaining.some((operation) => operation.status === "pending")) return flush();
      const latest = result.results.at(-1);
      if (latest?.version !== undefined) setVersion(latest.version);
      if (latest?.resetEpoch !== undefined) setResetEpoch(latest.resetEpoch);
      setMessage(remaining.some((op) => op.status === "conflict") ? "Hay cambios pendientes de resolver desde otro dispositivo." : remaining.length ? "Quedan cambios por sincronizar." : "Avance sincronizado.");
    } catch { setMessage("Sin conexión: tus cambios quedan guardados en este dispositivo."); }
  }, [props.userId, queue]);

  useEffect(() => {
    const snapshot = queue.read(props.userId);
    setConflicts(snapshot.operations.filter((operation) => operation.guideId === props.guideId && operation.status !== "pending"));
    setMessage(typeof navigator === "undefined" || navigator.onLine ? "Avance guardado." : "Sin conexión: los cambios permanecen en este dispositivo.");
    const guideOperations = snapshot.operations.filter((operation) => operation.guideId === props.guideId).sort((a, b) => a.clientSequence - b.clientSequence);
    if (guideOperations.length) {
      const restored = new Set(props.initialChecked);
      let restoredFavorite = props.initialFavorite;
      let restoredLastSection = props.initialLastSectionId;
      for (const operation of guideOperations) {
        if (operation.type === "reset-guide") { restored.clear(); restoredLastSection = null; }
        if (operation.type === "check-section" && operation.sectionId) restored.add(operation.sectionId);
        if (operation.type === "uncheck-section" && operation.sectionId) restored.delete(operation.sectionId);
        if (operation.type === "set-last-section") restoredLastSection = operation.sectionId ?? null;
        if (operation.type === "favorite") restoredFavorite = true;
        if (operation.type === "unfavorite") restoredFavorite = false;
      }
      setChecked(restored);
      props.onCheckedChange?.([...restored]);
      setFavorite(restoredFavorite);
      setLastSection(restoredLastSection);
    }
    setPending(snapshot.operations.length);
    if (snapshot.expiredCount) setMessage(`${snapshot.expiredCount} cambio(s) caducaron y se descartaron por seguridad.`);
    const onOnline = () => { void flush(); };
    window.addEventListener("online", onOnline);
    void flush();
    return () => window.removeEventListener("online", onOnline);
  }, [flush, props.userId, queue]);

  function append(type: LearnSyncOperation["type"], sectionId?: string) {
    const op = queue.append(props.userId, { guideId: props.guideId, type, sectionId, baseVersion: version, baseResetEpoch: resetEpoch });
    if (!op) { setMessage("La cola local llegó a su límite. Conéctate para sincronizar antes de continuar."); return false; }
    setVersion((current) => current + 1);
    if (type === "reset-guide") setResetEpoch((current) => current + 1);
    setPending((value) => value + 1);
    if (props.userId) void flush();
    return true;
  }

  function importAnonymous(accept: boolean) {
    if (!props.userId) return;
    const anonymous = queue.read(null).operations;
    if (accept) {
      const imported = queue.rebindAnonymousForAccount(anonymous, props.userId);
      queue.update(props.userId, [...queue.read(props.userId).operations, ...imported]);
      setPending((current) => current + imported.length);
    }
    queue.clear(null);
    setAnonymousImportCount(0);
    if (accept) void flush();
  }

  function retryConflict(operation: LearnSyncOperation) {
    const operations = queue.read(props.userId).operations.map((item) => item.operationId === operation.operationId ? { ...item, status: "pending" as const, statusMessage: undefined } : item);
    queue.update(props.userId, operations);
    setConflicts(operations.filter((item) => item.guideId === props.guideId && item.status !== "pending"));
    setMessage("Reintentando el cambio confirmado.");
    void flush();
  }

  function discardBlocked(operation: LearnSyncOperation) {
    const removed = queue.discardDeviceTail(props.userId, operation.operationId);
    setConflicts(queue.read(props.userId).operations.filter((item) => item.guideId === props.guideId && item.status !== "pending"));
    setPending((count) => Math.max(0, count - removed));
    setMessage(removed > 1 ? `Se descartaron ${removed} cambios de la cola de este dispositivo para mantener la secuencia.` : "Se descartó el cambio obsoleto.");
  }

  return <div className="learn-progress-controls" aria-live="polite">
    {props.userId && anonymousImportCount > 0 && <aside className="learn-sync-import"><p>Hay {anonymousImportCount} cambio(s) guardado(s) en este dispositivo sin asociar a una cuenta. ¿Quieres importarlos a esta cuenta?</p><button type="button" className="button button--primary" onClick={() => importAnonymous(true)}>Importar a mi cuenta</button><button type="button" className="text-link" onClick={() => importAnonymous(false)}>Descartar cambios anónimos</button></aside>}
    {props.userId && props.showProgress !== false && <label className="learn-sync-retention"><input type="checkbox" checked={retainOnSignOut} onChange={(event) => { setRetainOnSignOut(event.currentTarget.checked); queue.setRetainAfterSignOut(props.userId!, event.currentTarget.checked); }} /> Conservar mis cambios pendientes en este dispositivo al cerrar sesión</label>}
    <div className="learn-progress-panel" role="group" aria-label="Mi avance en esta guía">
      <div className="learn-personal-toolbar">
        <button type="button" className="button button--secondary" onClick={() => { const next = !favorite; if (append(next ? "favorite" : "unfavorite")) setFavorite(next); }}>{favorite ? "Quitar de favoritos" : "Guardar en favoritos"}</button>
        {props.showProgress !== false && <><span>Mi avance: {props.sectionIds.length ? Math.round(checked.size / props.sectionIds.length * 100) : 0}% ({checked.size} de {props.sectionIds.length} secciones) · {checked.size === props.sectionIds.length ? "Completado" : checked.size ? "En curso" : "Sin empezar"}</span>
        {checked.size > 0 && <button type="button" className="text-link" onClick={() => { if (append("reset-guide")) { const updated = new Set<string>(); setChecked(updated); props.onCheckedChange?.([...updated]); setLastSection(null); } }}>Reiniciar mi progreso</button>}</>}
      </div>
      <p className="learn-sync-status">{message || (pending ? `${pending} cambio(s) pendiente(s) de sincronizar.` : "Estado de sincronización listo.")}</p>
      {conflicts.map((operation) => <div className="learn-sync-conflict" key={operation.operationId}><p>{operation.statusMessage}</p>{operation.status === "conflict" ? <button type="button" className="button button--secondary" onClick={() => retryConflict(operation)}>Volver a aplicar este cambio</button> : <button type="button" className="text-link" onClick={() => discardBlocked(operation)}>Descartar el cambio y los posteriores de este dispositivo</button>}</div>)}
      {props.showProgress !== false && <details className="learn-section-progress-disclosure">
        <summary>Actualizar avance por sección <span>{props.sectionIds.length}</span></summary>
        <div className="learn-section-progress-list" role="group" aria-label="Acciones de progreso por sección">{props.sectionIds.map((sectionId, index) => {
          const sectionLabel = props.sectionLabels?.[index] ?? `sección ${index + 1}`;
          return <div className="learn-section-progress" key={sectionId} role="group" aria-label={`Progreso de ${sectionLabel}`}>
            <span className="learn-section-progress__label">{sectionLabel}</span>
            <button type="button" className="button button--secondary" aria-label={`${checked.has(sectionId) ? "Marcar como pendiente" : "Marcar como completada"}: ${sectionLabel}`} onClick={() => { const next = !checked.has(sectionId); if (!append(next ? "check-section" : "uncheck-section", sectionId)) return; const updated = new Set(checked); next ? updated.add(sectionId) : updated.delete(sectionId); setChecked(updated); props.onCheckedChange?.([...updated]); }}>{checked.has(sectionId) ? "Pendiente" : "Completar"}</button>
            <button type="button" className="text-link" aria-pressed={lastSection === sectionId} aria-label={`${lastSection === sectionId ? "Último punto guardado" : "Guardar como último punto"}: ${sectionLabel}`} onClick={() => { if (append("set-last-section", sectionId)) setLastSection(sectionId); }}>{lastSection === sectionId ? "Punto guardado" : "Guardar punto"}</button>
          </div>;
        })}</div>
      </details>}
    </div>
    {props.access === "licensed" && !props.userId && <p>El avance de esta guía requiere iniciar sesión y tener acceso activo.</p>}
  </div>;
}
