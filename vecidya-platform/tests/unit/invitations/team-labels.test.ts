import assert from "node:assert/strict";
import { test } from "node:test";

import {
  describeRolePermissions,
  invitationStateLabels,
  roleLabel,
} from "../../../app/lib/team-labels.ts";

// Permisos reales de `server/auth/authorization.server.ts` (matriz de AUTHZ-BA-001).
const adminPermissions = [
  "organization:read", "organization:update", "member:read", "member:invite", "member:remove",
  "member:role:update", "business-profile:read", "business-profile:update", "business-profile:publish",
];
const memberPermissions = ["organization:read", "member:read", "business-profile:read"];

test("los roles se muestran en español sin cambiar los valores internos", () => {
  assert.equal(roleLabel("owner"), "Propietario");
  assert.equal(roleLabel("admin"), "Administrador");
  assert.equal(roleLabel("member"), "Miembro");
  assert.equal(roleLabel(null), "Miembro");
});

test("los estados de invitación se muestran en español", () => {
  assert.equal(invitationStateLabels.pending, "Pendiente");
  assert.equal(invitationStateLabels.accepted, "Aceptada");
  assert.equal(invitationStateLabels.canceled, "Cancelada");
  assert.equal(invitationStateLabels.expired, "Expirada");
  assert.equal(invitationStateLabels.rejected, "Rechazada");
});

test("la descripción del administrador sale de sus permisos reales", () => {
  assert.equal(
    describeRolePermissions(adminPermissions),
    "Puede editar y publicar el perfil del negocio y gestionar el equipo: invitar personas, cambiar roles y retirar miembros.",
  );
});

test("la descripción del miembro deja claro que solo consulta", () => {
  assert.equal(
    describeRolePermissions(memberPermissions),
    "Puede ver el perfil del negocio y quién forma parte del equipo, sin hacer cambios.",
  );
});

test("un permiso que el rol no tiene nunca aparece en su descripción", () => {
  const withoutPublish = adminPermissions.filter((permission) => permission !== "business-profile:publish");
  assert.equal(
    describeRolePermissions(withoutPublish),
    "Puede editar el perfil del negocio y gestionar el equipo: invitar personas, cambiar roles y retirar miembros.",
  );
  assert.equal(
    describeRolePermissions(["business-profile:read", "member:read", "member:invite"]),
    "Puede ver el perfil del negocio y gestionar el equipo: invitar personas.",
  );
});
