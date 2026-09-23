import { useState } from "react";
import { Form, Link, useSearchParams } from "react-router";

import { authClient } from "../lib/auth-client";
import { Alert, Button } from "../components/ui";
import { AuthShell } from "../components/auth-shell";

export function meta() {
  return [{ title: "Nueva contraseña | Vecidya" }, { name: "robots", content: "noindex" }];
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const token = searchParams.get("token") ?? "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const password = String(new FormData(event.currentTarget).get("password"));
    const result = await authClient.resetPassword({ newPassword: password, token });
    setSubmitting(false);
    if (result.error) {
      setError("El enlace no es válido o ya expiró.");
      return;
    }
    setMessage("Tu contraseña fue actualizada. Ya puedes iniciar sesión.");
  }

  return <AuthShell eyebrow="ACCESO SEGURO" title="Elige una nueva contraseña" description="Crea una contraseña segura para volver a acceder a tu espacio.">
    {!token ? <Alert>El enlace de recuperación está incompleto.</Alert> : null}
    <Form className="auth-form" onSubmit={handleSubmit}>
      <label>Nueva contraseña<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      {message ? <p aria-live="polite" className="auth-form__status" role="status">{message}</p> : null}
      {error ? <Alert>{error}</Alert> : null}
      <Button disabled={submitting || !token} type="submit">{submitting ? "Guardando…" : "Actualizar contraseña"}</Button>
    </Form>
    <p className="auth-switch"><Link to="/login">Volver a iniciar sesión</Link></p>
  </AuthShell>;
}
