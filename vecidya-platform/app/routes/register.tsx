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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const result = await authClient.signUp.email({
      email,
      name: String(formData.get("name")),
      password: String(formData.get("password")),
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

  return (
    <AuthShell
      description="Empieza con tu espacio Vecidya."
      eyebrow="PRIMER PASO"
      privacyNote="Crea tu cuenta para organizar el perfil de tu negocio o proyecto."
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
