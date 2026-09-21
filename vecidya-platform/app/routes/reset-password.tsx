import { useState } from "react";
import { Form, Link, useSearchParams } from "react-router";

import { authClient } from "../lib/auth-client";
import { Alert, Button, Card } from "../components/ui";

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

  return <main className="auth-shell"><Card className="auth-card">
    <div className="auth-brand"><span>Vecidya</span></div>
    <p className="eyebrow">ACCESO SEGURO</p>
    <h1>Elige una nueva contraseña</h1>
    {!token ? <Alert>El enlace de recuperación está incompleto.</Alert> : null}
    <Form className="auth-form" onSubmit={handleSubmit}>
      <label>Nueva contraseña<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      {message ? <p role="status">{message}</p> : null}
      {error ? <Alert>{error}</Alert> : null}
      <Button disabled={submitting || !token} type="submit">{submitting ? "Guardando…" : "Actualizar contraseña"}</Button>
    </Form>
    <p className="auth-switch"><Link to="/login">Volver a iniciar sesión</Link></p>
  </Card></main>;
}
