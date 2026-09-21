import { useEffect, useState } from "react";
import { Form, Link, useSearchParams } from "react-router";

import { authClient } from "../lib/auth-client";
import { Alert, Button, Card } from "../components/ui";

export function meta() {
  return [{ title: "Verificar correo | Vecidya" }, { name: "robots", content: "noindex" }];
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) return;
    void authClient.verifyEmail({ query: { token } }).then((result) => {
      if (result.error) setError("El enlace de verificación no es válido o ya expiró.");
      else setMessage("Tu correo fue verificado. Ya puedes continuar en Vecidya.");
    });
  }, [token]);

  async function resend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const email = String(new FormData(event.currentTarget).get("email"));
    const result = await authClient.sendVerificationEmail({ email, callbackURL: `${window.location.origin}/verify-email` });
    setSubmitting(false);
    if (result.error) setError("No pudimos procesar la solicitud. Inténtalo de nuevo más tarde.");
    else setMessage("Si existe una cuenta asociada a ese correo, te enviaremos un enlace de verificación.");
  }

  return <main className="auth-shell"><Card className="auth-card">
    <div className="auth-brand"><span>Vecidya</span></div>
    <p className="eyebrow">VERIFICACIÓN</p>
    <h1>Verifica tu correo</h1>
    {message ? <p role="status">{message}</p> : null}
    {error ? <Alert>{error}</Alert> : null}
    {!token ? <Form className="auth-form" onSubmit={resend}>
      <p>Solicita un nuevo enlace de verificación.</p>
      <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
      <Button disabled={submitting} type="submit">{submitting ? "Enviando…" : "Enviar enlace"}</Button>
    </Form> : null}
    <p className="auth-switch"><Link to="/login">Volver a iniciar sesión</Link></p>
  </Card></main>;
}
