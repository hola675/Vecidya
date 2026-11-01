import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getInvitationListState,
  invitationCreateErrorMessage,
  invitationViewStatus,
  maskEmail,
  resolveInvitationView,
  type InvitationRecord,
} from "../../../db/invitation-rules.ts";
import { safeAppRedirect, safeLearnReturn } from "../../../app/lib/safe-redirect.ts";

const now = new Date("2026-09-25T12:00:00Z");
const tomorrow = new Date("2026-09-26T12:00:00Z");
const yesterday = new Date("2026-09-24T12:00:00Z");
const invitation = (overrides: Partial<InvitationRecord> = {}): InvitationRecord => ({
  email: "Ana@Negocio.com",
  status: "pending",
  expiresAt: tomorrow,
  role: "admin",
  organizationName: "Panadería Ana",
  ...overrides,
});
const recipient = { email: "ana@negocio.com", emailVerified: true, isMember: false };

test("sin sesión se pide entrar o registrarse, sin revelar si la invitación existe", () => {
  assert.deepEqual(resolveInvitationView(invitation(), null, now), { state: "sign-in" });
  assert.deepEqual(resolveInvitationView(null, null, now), { state: "sign-in" });
});

test("una invitación inexistente es un estado controlado", () => {
  assert.deepEqual(resolveInvitationView(null, recipient, now), { state: "not-found" });
});

test("otra cuenta solo ve el correo enmascarado, ni organización ni estado", () => {
  for (const status of ["pending", "canceled", "accepted"]) {
    const view = resolveInvitationView(invitation({ status }), { ...recipient, email: "otra@correo.com" }, now);
    assert.deepEqual(view, { state: "wrong-account", maskedEmail: "a***@negocio.com" });
  }
});

test("el destinatario sin verificar debe verificar antes de aceptar", () => {
  assert.deepEqual(resolveInvitationView(invitation(), { ...recipient, emailVerified: false }, now), {
    state: "unverified", email: "Ana@Negocio.com", organizationName: "Panadería Ana", role: "admin",
  });
});

test("el destinatario verificado con invitación vigente puede aceptar", () => {
  assert.deepEqual(resolveInvitationView(invitation(), recipient, now), {
    state: "ready", email: "Ana@Negocio.com", organizationName: "Panadería Ana", role: "admin",
  });
});

test("cancelada, rechazada y expirada se distinguen aunque Better Auth responda igual", () => {
  assert.deepEqual(resolveInvitationView(invitation({ status: "canceled" }), recipient, now), { state: "canceled" });
  assert.deepEqual(resolveInvitationView(invitation({ status: "rejected" }), recipient, now), { state: "rejected" });
  assert.deepEqual(resolveInvitationView(invitation({ expiresAt: yesterday }), recipient, now), { state: "expired" });
  assert.deepEqual(resolveInvitationView(invitation({ expiresAt: yesterday }), { ...recipient, emailVerified: false }, now), { state: "expired" });
});

test("una invitación aceptada indica si la persona sigue siendo miembro", () => {
  assert.deepEqual(resolveInvitationView(invitation({ status: "accepted" }), { ...recipient, isMember: true }, now), {
    state: "accepted", organizationName: "Panadería Ana", isMember: true,
  });
  assert.deepEqual(resolveInvitationView(invitation({ status: "accepted" }), recipient, now), {
    state: "accepted", organizationName: "Panadería Ana", isMember: false,
  });
});

test("un estado desconocido nunca se trata como aceptable", () => {
  assert.deepEqual(resolveInvitationView(invitation({ status: "weird" }), recipient, now), { state: "not-found" });
});

test("cada estado tiene su código HTTP", () => {
  assert.equal(invitationViewStatus["sign-in"], 200);
  assert.equal(invitationViewStatus.ready, 200);
  assert.equal(invitationViewStatus.unverified, 200);
  assert.equal(invitationViewStatus.accepted, 200);
  assert.equal(invitationViewStatus["wrong-account"], 403);
  assert.equal(invitationViewStatus["not-found"], 404);
  assert.equal(invitationViewStatus.canceled, 410);
  assert.equal(invitationViewStatus.rejected, 410);
  assert.equal(invitationViewStatus.expired, 410);
});

test("en la lista, solo una invitación pendiente y vigente cuenta como pendiente", () => {
  assert.equal(getInvitationListState({ status: "pending", expiresAt: tomorrow }, now), "pending");
  assert.equal(getInvitationListState({ status: "pending", expiresAt: yesterday }, now), "expired");
  assert.equal(getInvitationListState({ status: "canceled", expiresAt: tomorrow }, now), "canceled");
  assert.equal(getInvitationListState({ status: "accepted", expiresAt: tomorrow }, now), "accepted");
  assert.equal(getInvitationListState({ status: "rejected", expiresAt: tomorrow }, now), "rejected");
  assert.equal(getInvitationListState({ status: "pending", expiresAt: tomorrow.toISOString() }, now), "pending");
});

test("el correo enmascarado conserva la inicial y el dominio", () => {
  assert.equal(maskEmail("afiliaciones@gmail.com"), "a***@gmail.com");
  assert.equal(maskEmail("x@y.co"), "x***@y.co");
  assert.equal(maskEmail("sin-arroba"), "***");
});

test("los errores de Better Auth al invitar se explican sin culpar al correo", () => {
  assert.equal(invitationCreateErrorMessage("USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION"), "Ya hay una invitación pendiente para ese correo.");
  assert.equal(invitationCreateErrorMessage("USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION"), "Esa persona ya es miembro de la organización.");
  assert.equal(invitationCreateErrorMessage("INVITATION_LIMIT_REACHED"), "La organización alcanzó el límite de invitaciones pendientes.");
  assert.equal(invitationCreateErrorMessage(undefined), "No se pudo crear la invitación. Inténtalo de nuevo.");
});

test("redirectTo solo acepta destinos internos de app o de una guía pública", () => {
  assert.equal(safeAppRedirect("/app/invitations/abc"), "/app/invitations/abc");
  assert.equal(safeAppRedirect("/app"), "/app");
  assert.equal(safeAppRedirect("/app/organization?tab=1"), "/app/organization?tab=1");
  assert.equal(safeLearnReturn("/aprende/proteger-mi-cuenta#pasos"), "/aprende/proteger-mi-cuenta#pasos");
  for (const unsafe of ["https://evil.example/aprende/guia", "//evil.example/aprende/guia", "/aprende", "/aprende/guia?next=https://evil.example", "/app/admin", "/aprende/%2f%2fevil"]) {
    assert.equal(safeLearnReturn(unsafe), null, String(unsafe));
  }
  for (const unsafe of [null, "", "https://evil.example/app", "//evil.example/app", "/\\evil.example", "/app/../login", "/apple", "/login", "javascript:alert(1)", "app/invitations/x"]) {
    assert.equal(safeAppRedirect(unsafe), null, String(unsafe));
  }
});
