type LocalVerificationEmail = { readonly requestId: string; readonly purpose: "verification" | "access_recovery"; readonly recipient: string; readonly subject: string; readonly text: string; readonly createdAt: number };
type LocalMailboxGlobal = typeof globalThis & { __vecidyaDiagnosticDevInbox?: Map<string, Map<string, LocalVerificationEmail>> };

function inbox(): Map<string, Map<string, LocalVerificationEmail>> {
  const root = globalThis as LocalMailboxGlobal;
  root.__vecidyaDiagnosticDevInbox ??= new Map();
  return root.__vecidyaDiagnosticDevInbox;
}

/** A development-only fake transport. It never calls the configured transactional email provider. */
export function deliverDiagnosticVerificationEmail(input: {
  readonly requestId: string;
  readonly challengeId: string;
  readonly recipient: string;
  readonly token: string;
  readonly origin: string;
  readonly purpose?: "verification" | "access_recovery";
  readonly now?: number;
}): void {
  if (!import.meta.env.DEV) throw new Error("LOCAL_EMAIL_TRANSPORT_ONLY");
  const purpose = input.purpose ?? "verification";
  const link = new URL("/diagnostico/verificar", input.origin);
  link.hash = new URLSearchParams({ requestId: input.requestId, token: input.token }).toString();
  const createdAt = input.now ?? Date.now();
  let messages = inbox().get(input.requestId);
  if (!messages) {
    messages = new Map();
    inbox().set(input.requestId, messages);
  }
  messages.set(input.challengeId, {
    requestId: input.requestId,
    purpose,
    recipient: input.recipient,
    subject: purpose === "access_recovery" ? "Recupera el acceso a tu diagnóstico" : "Confirma el correo para acceder a tu diagnóstico",
    text: purpose === "access_recovery"
      ? `Solicitaste un nuevo enlace local para acceder al informe. El enlace vence según la vigencia del informe.\n\n${link.toString()}`
      : `Abre este enlace local para verificar el acceso al informe. El enlace vence en 24 horas.\n\n${link.toString()}`,
    createdAt,
  });
}

export function readDiagnosticDevInbox(requestId: string, challengeId?: string): LocalVerificationEmail | null {
  if (!import.meta.env.DEV) return null;
  const messages = inbox().get(requestId);
  if (!messages) return null;
  if (challengeId) return messages.get(challengeId) ?? null;
  let latest: LocalVerificationEmail | null = null;
  for (const message of messages.values()) if (!latest || message.createdAt >= latest.createdAt) latest = message;
  return latest;
}

export function discardDiagnosticDevInboxMessage(requestId: string): void {
  if (!import.meta.env.DEV) return;
  inbox().delete(requestId);
}
