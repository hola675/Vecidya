import { escapeHtml, type TransactionalEmail } from "./mail.server";

/**
 * Plantillas transaccionales de Vecidya.
 * Usa el símbolo oficial existente en public/brand y los tokens de app.css.
 * Sin fuentes remotas, CSS externo, trackers, métricas ficticias ni datos sensibles.
 */
const BRAND_ORIGIN = "https://vecidya.com";
const BRAND_ICON_URL = BRAND_ORIGIN + "/brand/vecidya-icon-3d.png";
const SUPPORT_EMAIL = "hola@vecidya.com";

type ActionContent = {
  eyebrow: string;
  heading: string;
  introduction: string;
  details?: readonly string[];
  button: string;
  url: string;
  safety: string;
};

function label(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

function safeLink(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new Error("UNSAFE_EMAIL_ACTION_URL");
  }
  return url.toString();
}

function paragraph(text: string): string {
  return '<p style="margin:0 0 16px;color:#344760;font-size:16px;line-height:1.65;">' + escapeHtml(text) + '</p>';
}

function render(content: ActionContent): Pick<TransactionalEmail, "text" | "html"> {
  const heading = label(content.heading);
  const eyebrow = label(content.eyebrow);
  const introduction = label(content.introduction);
  const details = (content.details ?? []).map(label).filter(Boolean);
  const button = label(content.button);
  const safety = label(content.safety);
  const actionUrl = safeLink(content.url);
  const text = [
    "VECIDYA",
    "",
    heading,
    "",
    introduction,
    ...details.flatMap((line) => ["", line]),
    "",
    button + ":",
    actionUrl,
    "",
    "Si el botón no funciona, copia el enlace anterior en tu navegador.",
    "",
    safety,
    "",
    "¿Necesitas ayuda? Escríbenos a " + SUPPORT_EMAIL + ".",
    "Vecidya · " + BRAND_ORIGIN,
  ].join("\n");

  const html = [
    '<!doctype html><html lang="es"><head><meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="color-scheme" content="light"></head>',
    '<body style="margin:0;padding:0;background:#f7f9fc;font-family:Arial,Helvetica,sans-serif;color:#142b4a;">',
    '<div role="article" aria-roledescription="correo" aria-label="Comunicación de Vecidya">',
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background:#f7f9fc;">',
    '<tr><td align="center" style="padding:30px 14px;">',
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:600px;border-collapse:separate;background:#ffffff;border:1px solid #e1e8f1;border-radius:18px;">',
    '<tr><td style="padding:24px 32px;background:#142b4a;border-radius:18px 18px 0 0;">',
    '<table role="presentation" cellpadding="0" cellspacing="0"><tr>',
    '<td valign="middle" style="width:52px;"><img src="' + BRAND_ICON_URL + '" alt="Símbolo de Vecidya" width="44" height="44" style="display:block;width:44px;height:44px;border:0;background:#ffffff;border-radius:12px;"></td>',
    '<td valign="middle" style="padding-left:12px;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Vecidya</td>',
    '</tr></table></td></tr>',
    '<tr><td style="padding:34px 32px 22px;">',
    '<p style="margin:0 0 12px;color:#bf4700;font-size:12px;font-weight:700;letter-spacing:1.8px;">' + escapeHtml(eyebrow.toUpperCase()) + '</p>',
    '<h1 style="margin:0 0 20px;color:#142b4a;font-size:28px;line-height:1.25;font-weight:700;">' + escapeHtml(heading) + '</h1>',
    paragraph(introduction),
    ...details.map(paragraph),
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background:#155fc5;border-radius:10px;">',
    '<a href="' + escapeHtml(actionUrl) + '" style="display:inline-block;padding:15px 24px;border-radius:10px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;">' + escapeHtml(button) + '</a>',
    '</td></tr></table>',
    '<p style="margin:0 0 8px;color:#617188;font-size:13px;line-height:1.5;">Si el botón no funciona, copia este enlace en tu navegador:</p>',
    '<p style="margin:0 0 20px;font-size:12px;line-height:1.6;overflow-wrap:anywhere;word-break:break-all;"><a href="' + escapeHtml(actionUrl) + '" style="color:#155fc5;text-decoration:underline;">' + escapeHtml(actionUrl) + '</a></p>',
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#f2f6fc;border-left:3px solid #bf4700;">',
    '<tr><td style="padding:14px 16px;color:#344760;font-size:13px;line-height:1.6;">' + escapeHtml(safety) + '</td></tr></table>',
    '</td></tr>',
    '<tr><td style="padding:22px 32px 28px;border-top:1px solid #e1e8f1;">',
    '<p style="margin:0 0 9px;color:#617188;font-size:13px;line-height:1.6;">¿Necesitas ayuda? <a href="mailto:' + SUPPORT_EMAIL + '" style="color:#155fc5;">' + SUPPORT_EMAIL + '</a></p>',
    '<p style="margin:0;color:#617188;font-size:12px;line-height:1.5;">Vecidya · <a href="' + BRAND_ORIGIN + '" style="color:#155fc5;">vecidya.com</a></p>',
    '</td></tr></table></td></tr></table></div></body></html>',
  ].join("");
  return { html, text };
}

export function buildInvitationEmail(input: {
  organizationName: string;
  role: "admin" | "member" | "owner";
  url: string;
}): TransactionalEmail {
  const organizationName = label(input.organizationName) || "tu organización";
  const roles = { admin: "administrador", member: "miembro", owner: "propietario" };
  const role = roles[input.role];
  const nameIsVecidya = organizationName.toLocaleLowerCase("es") === "vecidya";
  return {
    to: "",
    subject: nameIsVecidya ? "Invitación para unirte al equipo de Vecidya" : "Invitación a " + organizationName + " | Vecidya",
    ...render({
      eyebrow: "Invitación de equipo",
      heading: "Te invitaron a colaborar",
      introduction: "Has recibido una invitación para unirte al equipo de " + organizationName + " como " + role + ".",
      details: ["Para continuar, abre el enlace y accede con el mismo correo que recibió la invitación. Si todavía no tienes cuenta, podrás crearla desde allí."],
      button: "Revisar mi invitación",
      url: input.url,
      safety: "La invitación es personal. Si no esperabas recibirla, no necesitas hacer nada. El enlace dejará de funcionar cuando expire o se cancele la invitación.",
    }),
  };
}

export function buildVerificationEmail(url: string): TransactionalEmail {
  return {
    to: "",
    subject: "Confirma tu correo electrónico | Vecidya",
    ...render({
      eyebrow: "Seguridad de la cuenta",
      heading: "Confirma tu correo electrónico",
      introduction: "Solo necesitamos verificar esta dirección para que puedas continuar con tu cuenta de Vecidya.",
      details: ["Abre el enlace y regresa a Vecidya para seguir con tu acceso o invitación."],
      button: "Verificar mi correo",
      url,
      safety: "Si no solicitaste esta verificación, ignora el mensaje. Nunca te pediremos tu contraseña por correo.",
    }),
  };
}

export function buildPasswordResetEmail(url: string): TransactionalEmail {
  return {
    to: "",
    subject: "Restablece tu contraseña | Vecidya",
    ...render({
      eyebrow: "Seguridad de la cuenta",
      heading: "Recupera el acceso a tu cuenta",
      introduction: "Recibimos una solicitud para cambiar la contraseña de tu cuenta Vecidya.",
      details: ["Utiliza este enlace para crear una contraseña nueva. Por seguridad, no compartas el enlace con otras personas."],
      button: "Crear nueva contraseña",
      url,
      safety: "Si no solicitaste cambiar la contraseña, puedes ignorar este mensaje. Tu contraseña actual no cambia por recibirlo.",
    }),
  };
}


export function buildPasswordChangedEmail(): TransactionalEmail {
  return {
    to: "",
    subject: "Tu contraseña se actualizó | Vecidya",
    ...render({
      eyebrow: "Aviso de seguridad",
      heading: "Tu contraseña ha cambiado",
      introduction: "La contraseña de tu cuenta Vecidya se actualizó correctamente.",
      details: ["Este aviso confirma el cambio. No incluye contraseñas ni enlaces para restablecerlas."],
      button: "Entrar a Vecidya",
      url: BRAND_ORIGIN + "/login",
      safety: "Si no reconoces este cambio, comunícate con Vecidya en hola@vecidya.com para revisar la seguridad de tu cuenta.",
    }),
  };
}

export function buildDiagnosticAccessEmail(input: {
  purpose: "verification" | "access_recovery";
  url: string;
}): TransactionalEmail {
  const recovery = input.purpose === "access_recovery";
  return {
    to: "",
    subject: recovery ? "Recupera el acceso a tu informe | Vecidya" : "Confirma el acceso a tu informe | Vecidya",
    ...render({
      eyebrow: "Diagnóstico Vecidya",
      heading: recovery ? "Vuelve a acceder a tu informe" : "Confirma tu correo para ver el informe",
      introduction: recovery
        ? "Recibimos una solicitud para recuperar el acceso a un informe de Diagnóstico Vecidya."
        : "Para proteger el acceso al informe personalizado de tu Diagnóstico Vecidya, primero necesitamos verificar tu correo.",
      details: ["El enlace es personal, de un solo uso y está sujeto a la vigencia de tu solicitud. El informe no se adjunta a este mensaje."],
      button: recovery ? "Recuperar acceso" : "Confirmar correo y continuar",
      url: input.url,
      safety: "Si no solicitaste este acceso, ignora el mensaje. Nunca compartas este enlace con otras personas.",
    }),
  };
}
