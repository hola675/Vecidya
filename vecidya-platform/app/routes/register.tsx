import { useState } from "react";
import { Form, Link, useNavigate, useSearchParams } from "react-router";

import { authClient } from "../lib/auth-client";
import { isInvitationPath, safeAppRedirect } from "../lib/safe-redirect";
import { Alert, Button } from "../components/ui";
import { AuthShell } from "../components/auth-shell";

export function meta() {
  return [{ title: "Crear cuenta | Vecidya" }, { name: "robots", content: "noindex" }];
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = safeAppRedirect(searchParams.get("redirectTo"));
  const invitationPath = redirectTo && isInvitationPath(redirectTo) ? redirectTo : null;
  const invitationId = invitationPath ? invitationPath.split("/")[3]?.split("?")[0] : null;
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invitationId) return;
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const result = await authClient.signUp.email({
      email,
      name: String(formData.get("name")),
      password: String(formData.get("password")),
      fetchOptions: { headers: { "X-Vecidya-Invitation": invitationId } },
    });

    if (result.error) {
      setSubmitting(false);
      setError(result.error.message ?? "No se pudo crear la cuenta.");
      return;
    }

    // Quien llega desde una invitación necesita un correo verificado para aceptarla: se envía el
    // enlace ya, con retorno a la invitación, y la página muestra si el envío funcionó.
    if (redirectTo && isInvitationPath(redirectTo)) {
      const verification = await authClient.sendVerificationEmail({ email, callbackURL: redirectTo });
      navigate(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}verificacion=${verification.error ? "fallida" : "enviada"}`);
      return;
    }

    setSubmitting(false);
    navigate(redirectTo ?? "/app");
  }

  if (!invitationId) return <AuthShell description="El alta de usuarios se realiza únicamente mediante invitación." eyebrow="ACCESO CONTROLADO" privacyNote="Los espacios de clientes son gestionados desde Vecidya." title="Registro por invitación"><p>Para crear tu cuenta necesitas un enlace de invitación enviado por Vecidya.</p><p><Link className="button button--primary" to="/login">Iniciar sesión</Link></p></AuthShell>;

  return (
    <AuthShell
      description="Completa tu alta para aceptar la invitación recibida."
      eyebrow="PRIMER PASO"
      privacyNote="Solo puedes registrarte con el correo de la invitación."
      title="Crear cuenta"
    >
      <Form className="auth-form" method="post" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          Correo electrónico
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Contraseña
          <input name="password" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        {error ? <Alert>{error}</Alert> : null}
        <Button disabled={submitting} type="submit">
          {submitting ? "Creando…" : "Registrarme"}
        </Button>
      </Form>
      <p className="auth-switch">¿Ya tienes cuenta? <Link to={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"}>Inicia sesión</Link></p>
    </AuthShell>
  );
}
