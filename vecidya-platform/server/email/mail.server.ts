export type TransactionalEmail = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type MailEnvironment = {
  EMAIL_PROVIDER?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
  GMAIL_OAUTH_CLIENT_ID?: string;
  GMAIL_OAUTH_CLIENT_SECRET?: string;
  GMAIL_OAUTH_REFRESH_TOKEN?: string;
  GMAIL_OAUTH_BOOTSTRAP_ENABLED?: string;
};

export type MailResult = {
  provider: "gmail" | "fake";
  messageId?: string;
};

export class EmailConfigurationError extends Error {
  constructor(message = "EMAIL_CONFIGURATION_MISSING") {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

export class EmailProviderError extends Error {
  readonly code: "GMAIL_AUTH_FAILED" | "GMAIL_API_FAILED";

  constructor(code: "GMAIL_AUTH_FAILED" | "GMAIL_API_FAILED", message: string) {
    super(message);
    this.name = "EmailProviderError";
    this.code = code;
  }
}

function assertHeader(value: string, label: string): string {
  if (!value || /[\r\n\u0000-\u001f\u007f]/.test(value)) {
    throw new EmailConfigurationError(`Invalid email ${label}`);
  }
  return value;
}

function assertAddress(value: string, label: string): string {
  const address = assertHeader(value.trim(), label);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    throw new EmailConfigurationError(`Invalid email ${label}`);
  }
  return address;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function utf8Base64(value: string): string {
  return bytesToBase64(new TextEncoder().encode(value));
}

function base64Url(value: string): string {
  return utf8Base64(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function encodedHeader(value: string): string {
  return `=?UTF-8?B?${utf8Base64(value)}?=`;
}

function wrappedBase64(value: string): string {
  const encoded = utf8Base64(value);
  return encoded.match(/.{1,76}/g)?.join("\r\n") ?? "";
}

export function buildMimeMessage(email: TransactionalEmail, from: string): string {
  const sender = assertAddress(from, "from");
  const recipients = (Array.isArray(email.to) ? email.to : [email.to]).map((value) => assertAddress(value, "to"));
  const replyTo = email.replyTo ? assertAddress(email.replyTo, "reply-to") : undefined;
  const subject = assertHeader(email.subject, "subject");
  const text = email.text.replace(/\r?\n/g, "\r\n");
  const headers = [
    `From: ${sender}`,
    `To: ${recipients.join(", ")}`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    `Subject: ${encodedHeader(subject)}`,
    "MIME-Version: 1.0",
  ];

  if (!email.html) {
    return `${headers.join("\r\n")}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrappedBase64(text)}`;
  }

  const boundary = `----=_Vecidya_${crypto.randomUUID()}`;
  const html = email.html.replace(/\r?\n/g, "\r\n");
  return `${headers.join("\r\n")}\r\nContent-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrappedBase64(text)}\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrappedBase64(html)}\r\n--${boundary}--`;
}

async function getGmailAccessToken(env: MailEnvironment): Promise<string> {
  if (!env.GMAIL_OAUTH_CLIENT_ID || !env.GMAIL_OAUTH_CLIENT_SECRET || !env.GMAIL_OAUTH_REFRESH_TOKEN) {
    throw new EmailConfigurationError();
  }

  let response: Response;
  try {
    response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GMAIL_OAUTH_CLIENT_ID,
        client_secret: env.GMAIL_OAUTH_CLIENT_SECRET,
        refresh_token: env.GMAIL_OAUTH_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });
  } catch {
    throw new EmailProviderError("GMAIL_AUTH_FAILED", "Gmail OAuth token request failed");
  }

  if (!response.ok) throw new EmailProviderError("GMAIL_AUTH_FAILED", "Gmail OAuth authorization failed");
  const payload = await response.json().catch(() => null) as { access_token?: unknown } | null;
  if (!payload || typeof payload.access_token !== "string" || !payload.access_token) {
    throw new EmailProviderError("GMAIL_AUTH_FAILED", "Gmail OAuth response was invalid");
  }
  return payload.access_token;
}

export function isMailConfigured(env: MailEnvironment): boolean {
  if (!env.EMAIL_FROM) return false;
  if ((env.EMAIL_PROVIDER ?? "gmail") === "fake") return true;
  return Boolean(env.GMAIL_OAUTH_CLIENT_ID && env.GMAIL_OAUTH_CLIENT_SECRET && env.GMAIL_OAUTH_REFRESH_TOKEN);
}

export function createTransactionalMailer(env: MailEnvironment) {
  return {
    async sendTransactionalEmail(email: TransactionalEmail): Promise<MailResult> {
      const provider = env.EMAIL_PROVIDER ?? "gmail";
      if (!isMailConfigured(env)) throw new EmailConfigurationError();
      const raw = base64Url(buildMimeMessage({ ...email, replyTo: email.replyTo ?? env.EMAIL_REPLY_TO }, env.EMAIL_FROM!));
      if (provider === "fake") return { provider: "fake", messageId: "fake-message" };
      if (provider !== "gmail") throw new EmailConfigurationError("EMAIL_PROVIDER_UNSUPPORTED");

      const accessToken = await getGmailAccessToken(env);
      let response: Response;
      try {
        response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ raw }),
        });
      } catch {
        throw new EmailProviderError("GMAIL_API_FAILED", "Gmail API request failed");
      }
      if (!response.ok) throw new EmailProviderError("GMAIL_API_FAILED", "Gmail API rejected the message");
      const payload = await response.json().catch(() => null) as { id?: unknown } | null;
      return { provider: "gmail", messageId: typeof payload?.id === "string" ? payload.id : undefined };
    },
  };
}
