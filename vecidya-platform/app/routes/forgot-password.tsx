import { useState } from "react";
import { Form, Link } from "react-router";

import { authClient } from "../lib/auth-client";
import { Alert, Button, Card } from "../components/ui";

export function meta() {
  return [{ title: "Restablecer contraseña | Vecidya" }, { name: "robots", content: "noindex" }];
}

export default function ForgotPassword() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const email = String(new FormData(event.currentTarget).get("email"));
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (result.error) {
      setError("No pudimos procesar la solicitud. Inténtalo de nuevo más tarde.");
      return;
    }
    setMessage("Si existe una cuenta asociada a ese correo, te enviaremos las instrucciones.");
  }

  return <main className="auth-shell"><Card className="auth-card">
    <div className="auth-brand"><span>Vecidya</span></div>
    <p className="eyebrow">ACCESO SEGURO</p>
    <h1>Restablece tu contraseña</h1>
    <p>Introduce tu correo y te enviaremos instrucciones si existe una cuenta asociada.</p>
    <Form className="auth-form" onSubmit={handleSubmit}>
      <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
      {message ? <p role="status">{message}</p> : null}
      {error ? <Alert>{error}</Alert> : null}
      <Button disabled={submitting} type="submit">{submitting ? "Enviando…" : "Enviar instrucciones"}</Button>
    </Form>
    <p className="auth-switch"><Link to="/login">Volver a iniciar sesión</Link></p>
  </Card></main>;
}
