import assert from "node:assert/strict";
import { test } from "node:test";

import { buildMimeMessage } from "../../server/email/mail.server.ts";
import {
  buildDiagnosticAccessEmail,
  buildInvitationEmail,
  buildPasswordResetEmail,
  buildVerificationEmail,
} from "../../server/email/templates.server.ts";
import { createAndDeliverOrganizationInvitation } from "../../server/email/invitation.server.ts";

const link = "https://vecidya.com/app/invitations/demo-token";

test("plantillas preservan marca, identidad visual, texto alternativo y CTA accesible", () => {
  const emails = [
    buildInvitationEmail({ organizationName: "Taller Uno", role: "admin", url: link }),
    buildVerificationEmail("https://vecidya.com/api/auth/verify-email?token=abc"),
    buildPasswordResetEmail("https://vecidya.com/reset-password?token=abc"),
    buildDiagnosticAccessEmail({ purpose: "verification", url: "http://127.0.0.1:5173/diagnostico/verificar#requestId=abc" }),
    buildDiagnosticAccessEmail({ purpose: "access_recovery", url: "http://localhost:5173/diagnostico/verificar#requestId=abc" }),
  ];
  for (const email of emails) {
    assert.match(email.text, /VECIDYA/);
    assert.match(email.text, /Si el botón no funciona/);
    assert.match(email.text, /hola@vecidya\.com/);
    assert.match(email.html ?? "", /lang="es"/);
    assert.match(email.html ?? "", /https:\/\/vecidya\.com\/brand\/vecidya-icon-3d\.png/);
    assert.match(email.html ?? "", /alt="Símbolo de Vecidya"/);
    assert.match(email.html ?? "", /#142b4a/);
    assert.match(email.html ?? "", /#155fc5/);
    assert.match(email.html ?? "", /#bf4700/);
    assert.match(email.html ?? "", /role="presentation"/);
    assert.match(email.html ?? "", /href="/);
    const mime = buildMimeMessage({ ...email, to: "destino@example.com" }, "hola@vecidya.com");
    assert.match(mime, /multipart\/alternative/);
  }
});

test("invitación usa rol en español y evita Vecidya duplicado en asunto", () => {
  const internal = buildInvitationEmail({ organizationName: "Vecidya", role: "admin", url: link });
  assert.equal(internal.subject, "Invitación para unirte al equipo de Vecidya");
  assert.match(internal.text, /como administrador/);
  assert.doesNotMatch(internal.text, /rol admin/);
  const external = buildInvitationEmail({ organizationName: "Taller Uno", role: "member", url: link });
  assert.equal(external.subject, "Invitación a Taller Uno | Vecidya");
  assert.match(external.text, /como miembro/);
});

test("escapa contenido no confiable sin permitir HTML ni URLs inseguras", () => {
  const malicious = buildInvitationEmail({
    organizationName: 'Negocio <script>alert("x")</script>',
    role: "owner",
    url: "https://vecidya.com/app/invitations/abc?next=%22%3E",
  });
  assert.doesNotMatch(malicious.html ?? "", /<script>/);
  assert.match(malicious.html ?? "", /&lt;script&gt;/);
  assert.match(malicious.html ?? "", /como propietario/);
  assert.throws(() => buildVerificationEmail("javascript:alert(1)"), /UNSAFE_EMAIL_ACTION_URL/);
  assert.throws(() => buildPasswordResetEmail("http://evil.example/reset"), /UNSAFE_EMAIL_ACTION_URL/);
});

test("los dos correos del Diagnóstico no adjuntan informes ni afirman publicarlos", () => {
  for (const purpose of ["verification", "access_recovery"] as const) {
    const email = buildDiagnosticAccessEmail({ purpose, url: "http://localhost:5173/diagnostico/verificar#token=example" });
    assert.match(email.text, /El informe no se adjunta/);
    assert.match(email.text, /de un solo uso/);
    assert.doesNotMatch(email.text, /Ya está publicado|Informe adjunto/);
    assert.match(email.text, /http:\/\/localhost:5173/);
  }
});

test("entrega explícita crea una sola invitación y no duplica envíos fake", async () => {
  let creations = 0;
  const result = await createAndDeliverOrganizationInvitation(
    async () => { creations++; return { id: "invite-1", email: "destino@example.com", role: "admin" }; },
    { EMAIL_PROVIDER: "fake", EMAIL_FROM: "hola@vecidya.com", appUrl: "https://vecidya.com" },
    "Vecidya",
  );
  assert.equal(creations, 1);
  assert.equal(result.delivery, "simulated");
  assert.equal(result.invitation.id, "invite-1");
});

test("un error del transporte no se confunde con éxito ni borra la invitación", async () => {
  const result = await createAndDeliverOrganizationInvitation(
    async () => ({ id: "invite-2", email: "destino@example.com", role: "member" }),
    {
      EMAIL_PROVIDER: "unsupported",
      EMAIL_FROM: "hola@vecidya.com",
      GMAIL_OAUTH_CLIENT_ID: "test",
      GMAIL_OAUTH_CLIENT_SECRET: "test",
      GMAIL_OAUTH_REFRESH_TOKEN: "test",
      appUrl: "https://vecidya.com",
    },
    "Vecidya",
  );
  assert.equal(result.invitation.id, "invite-2");
  assert.equal(result.delivery, "unconfirmed");
});

test("fallo de creación se propaga, sin intentar enviar", async () => {
  await assert.rejects(
    () => createAndDeliverOrganizationInvitation(
      async (): Promise<{ id: string; email: string; role: string }> => { throw new Error("CREATE_FAILED"); },
      { EMAIL_PROVIDER: "fake", EMAIL_FROM: "hola@vecidya.com", appUrl: "https://vecidya.com" },
      "Vecidya",
    ),
    /CREATE_FAILED/,
  );
});
