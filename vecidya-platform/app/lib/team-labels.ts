import type { InvitationListState } from "../../db/invitation-rules";

// Textos de equipo en español. Los valores internos (owner/admin/member, pending/…) no cambian.
export const roleLabels: Record<string, string> = { owner: "Propietario", admin: "Administrador", member: "Miembro" };

export function roleLabel(role: string | null | undefined) {
  return roleLabels[role ?? "member"] ?? role ?? "Miembro";
}

export const invitationStateLabels: Record<InvitationListState, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  canceled: "Cancelada",
  expired: "Expirada",
  rejected: "Rechazada",
  unknown: "Sin estado",
};

function joinSpanish(items: string[]) {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

// Redacta lo que un rol puede hacer a partir de sus permisos reales (`getPermissionsForRole`), para
// que la ayuda del formulario nunca prometa algo que la matriz de autorización no concede.
export function describeRolePermissions(permissions: readonly string[]) {
  const has = (permission: string) => permissions.includes(permission);
  const profile = has("business-profile:publish")
    ? "editar y publicar el perfil del negocio"
    : has("business-profile:update")
      ? "editar el perfil del negocio"
      : has("business-profile:read") ? "ver el perfil del negocio" : null;
  const teamActions = [
    has("member:invite") ? "invitar personas" : null,
    has("member:role:update") ? "cambiar roles" : null,
    has("member:remove") ? "retirar miembros" : null,
  ].filter((action): action is string => Boolean(action));

  if (teamActions.length) return `Puede ${profile ? `${profile} y ` : ""}gestionar el equipo: ${joinSpanish(teamActions)}.`;

  const views = [profile, has("member:read") ? (profile?.startsWith("ver ") ? "quién forma parte del equipo" : "ver quién forma parte del equipo") : null]
    .filter((view): view is string => Boolean(view));
  const readOnly = !has("business-profile:update");
  return views.length ? `Puede ${joinSpanish(views)}${readOnly ? ", sin hacer cambios" : ""}.` : "Solo puede ver la organización.";
}
