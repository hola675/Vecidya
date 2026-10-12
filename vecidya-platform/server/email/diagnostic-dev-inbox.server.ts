type LocalVerificationEmail = { readonly requestId: string; readonly recipient: string; readonly subject: string; readonly text: string; readonly createdAt: number };
type LocalMailboxGlobal = typeof globalThis & { __vecidyaDiagnosticDevInbox?: Map<string, LocalVerificationEmail> };

function inbox(): Map<string, LocalVerificationEmail> {
  const root = globalThis as LocalMailboxGlobal;
  root.__vecidyaDiagnosticDevInbox ??= new Map();
  return root.__vecidyaDiagnosticDevInbox;
}

/** A development-only fake transport. It never calls the configured transactional email provider. */
export function deliverDiagnosticVerificationEmail(input: {
  readonly requestId: string;
  readonly recipient: string;
  readonly token: string;
  readonly origin: string;
  readonly now?: number;
}): void {
  if (!import.meta.env.DEV) throw new Error("LOCAL_EMAIL_TRANSPORT_ONLY");
  const link = new URL("/diagnostico/verificar", input.origin);
  link.hash = new URLSearchParams({ requestId: input.requestId, token: input.token }).toString();
  inbox().set(input.requestId, {
    requestId: input.requestId,
    recipient: input.recipient,
    subject: "Confirma el correo para acceder a tu diagnóstico",
    text: `Abre este enlace local para verificar el acceso al informe. El enlace vence en 24 horas.\n\n${link.toString()}`,
    createdAt: input.now ?? Date.now(),
  });
}

export function readDiagnosticDevInbox(requestId: string): LocalVerificationEmail | null {
  if (!import.meta.env.DEV) return null;
  return inbox().get(requestId) ?? null;
}
