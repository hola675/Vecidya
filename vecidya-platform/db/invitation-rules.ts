// Reglas puras de invitaciones (INVITE-001). Better Auth sigue siendo la única autoridad para
// aceptar; estas reglas solo deciden qué ve cada persona, porque Better Auth responde el mismo
// `INVITATION_NOT_FOUND` para una invitación cancelada, expirada, aceptada o inexistente.

export type InvitationRecord = {
  email: string;
  status: string;
  expiresAt: Date | string;
  role: string | null;
  organizationName: string;
};

export type InvitationViewer = {
  email: string;
  emailVerified: boolean;
  isMember: boolean;
};

export type InvitationView =
  | { state: "sign-in" }
  | { state: "not-found" }
  | { state: "wrong-account"; maskedEmail: string }
  | { state: "canceled" }
  | { state: "rejected" }
  | { state: "expired" }
  | { state: "accepted"; organizationName: string; isMember: boolean }
  | { state: "unverified"; email: string; organizationName: string; role: string }
  | { state: "ready"; email: string; organizationName: string; role: string };

export const invitationViewStatus: Record<InvitationView["state"], number> = {
  "sign-in": 200,
  ready: 200,
  unverified: 200,
  accepted: 200,
  "wrong-account": 403,
  "not-found": 404,
  canceled: 410,
  rejected: 410,
  expired: 410,
};

export type InvitationListState = "pending" | "expired" | "accepted" | "canceled" | "rejected" | "unknown";

export function getInvitationListState(invitation: { status: string; expiresAt: Date | string }, now: Date): InvitationListState {
  if (invitation.status === "pending") return new Date(invitation.expiresAt) > now ? "pending" : "expired";
  if (invitation.status === "accepted" || invitation.status === "canceled" || invitation.status === "rejected") return invitation.status;
  return "unknown";
}

export function maskEmail(email: string) {
  const normalized = email.toLowerCase();
  const at = normalized.indexOf("@");
  if (at < 1) return "***";
  return `${normalized[0]}***${normalized.slice(at)}`;
}

// Sin sesión no se revela nada, ni siquiera si la invitación existe. A otra cuenta solo se le
// muestra el correo enmascarado del destinatario: ni la organización ni el estado.
export function resolveInvitationView(invitation: InvitationRecord | null, viewer: InvitationViewer | null, now: Date): InvitationView {
  if (!viewer) return { state: "sign-in" };
  if (!invitation) return { state: "not-found" };
  if (invitation.email.toLowerCase() !== viewer.email.toLowerCase()) {
    return { state: "wrong-account", maskedEmail: maskEmail(invitation.email) };
  }

  const listState = getInvitationListState(invitation, now);
  if (listState === "accepted") return { state: "accepted", organizationName: invitation.organizationName, isMember: viewer.isMember };
  if (listState === "canceled" || listState === "rejected" || listState === "expired") return { state: listState };
  if (listState !== "pending") return { state: "not-found" };

  const details = { email: invitation.email, organizationName: invitation.organizationName, role: invitation.role ?? "member" };
  return viewer.emailVerified ? { state: "ready", ...details } : { state: "unverified", ...details };
}

const createErrorMessages: Record<string, string> = {
  USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: "Ya hay una invitación pendiente para ese correo.",
  USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: "Esa persona ya es miembro de la organización.",
  INVITATION_LIMIT_REACHED: "La organización alcanzó el límite de invitaciones pendientes.",
};

export function invitationCreateErrorMessage(code: string | undefined) {
  return (code && createErrorMessages[code]) || "No se pudo crear la invitación. Inténtalo de nuevo.";
}
