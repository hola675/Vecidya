import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildMimeMessage,
  createTransactionalMailer,
  EmailConfigurationError,
  isMailConfigured,
} from "../../server/email/mail.server.ts";

test("construye multipart MIME UTF-8 con texto, HTML y Reply-To", () => {
  const message = buildMimeMessage({
    to: "destino@example.com",
    subject: "Invitación ñ",
    text: "Hola, acción.",
    html: "<p>Hola, acción.</p>",
    replyTo: "hola@vecidya.com",
  }, "hola@vecidya.com");
  assert.match(message, /From: hola@vecidya\.com/);
  assert.match(message, /To: destino@example\.com/);
  assert.match(message, /Reply-To: hola@vecidya\.com/);
  assert.match(message, /multipart\/alternative/);
  assert.match(message, /Subject: =\?UTF-8\?B\?/);
});

test("rechaza inyección en headers", () => {
  assert.throws(() => buildMimeMessage({ to: "destino@example.com", subject: "ok\r\nBcc: attacker@example.com", text: "hola" }, "hola@vecidya.com"), EmailConfigurationError);
});

test("fake provider no contacta Gmail", async () => {
  const mailer = createTransactionalMailer({ EMAIL_PROVIDER: "fake", EMAIL_FROM: "hola@vecidya.com" });
  assert.equal(isMailConfigured({ EMAIL_PROVIDER: "fake", EMAIL_FROM: "hola@vecidya.com" }), true);
  assert.deepEqual(await mailer.sendTransactionalEmail({ to: "destino@example.com", subject: "Prueba", text: "Hola" }), { provider: "fake", messageId: "fake-message" });
});

test("Gmail requiere configuración OAuth completa", async () => {
  const mailer = createTransactionalMailer({ EMAIL_PROVIDER: "gmail", EMAIL_FROM: "hola@vecidya.com" });
  await assert.rejects(() => mailer.sendTransactionalEmail({ to: "destino@example.com", subject: "Prueba", text: "Hola" }), EmailConfigurationError);
});
