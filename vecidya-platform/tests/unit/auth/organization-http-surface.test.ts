import assert from "node:assert/strict";
import { test } from "node:test";

import { organization } from "better-auth/plugins";

import {
  browserOrganizationEndpoints,
  isBlockedOrganizationHttpCall,
} from "../../../server/auth/organization-http-surface.ts";

const installedPaths = Object.values(organization().endpoints)
  .map((endpoint) => (endpoint as { path?: unknown }).path)
  .filter((path): path is string => typeof path === "string" && path.startsWith("/organization/"));

test("el navegador solo puede crear, listar, activar y aceptar invitaciones", () => {
  assert.deepEqual([...browserOrganizationEndpoints].sort(), [
    "/organization/accept-invitation",
    "/organization/create",
    "/organization/list",
    "/organization/set-active",
  ]);
});

test("cada endpoint permitido existe en el plugin Organization instalado", () => {
  for (const path of browserOrganizationEndpoints) assert.ok(installedPaths.includes(path), `${path} no existe en Better Auth`);
});

test("por HTTP se bloquea todo endpoint del plugin que no está en la allowlist", () => {
  const blocked = installedPaths.filter((path) => !browserOrganizationEndpoints.has(path));
  assert.ok(blocked.length >= 15, `se esperaban al menos 15 endpoints bloqueados, hay ${blocked.length}`);
  for (const path of blocked) assert.equal(isBlockedOrganizationHttpCall(path, true), true, path);
  for (const path of [
    "/organization/update",
    "/organization/delete",
    "/organization/leave",
    "/organization/list-invitations",
    "/organization/get-full-organization",
    "/organization/invite-member",
    "/organization/cancel-invitation",
    "/organization/remove-member",
    "/organization/update-member-role",
  ]) assert.ok(blocked.includes(path), `${path} debería estar bloqueado`);
});

test("un endpoint futuro del plugin queda bloqueado por defecto", () => {
  assert.equal(isBlockedOrganizationHttpCall("/organization/some-future-endpoint", true), true);
});

test("las llamadas desde el servidor (auth.api) nunca se bloquean", () => {
  for (const path of installedPaths) assert.equal(isBlockedOrganizationHttpCall(path, false), false, path);
});

test("los endpoints fuera del plugin Organization no se tocan", () => {
  for (const path of ["/get-session", "/sign-in/email", "/sign-up/email", "/update-user", "/update-session", "/ok", undefined]) {
    assert.equal(isBlockedOrganizationHttpCall(path, true), false, String(path));
  }
});
