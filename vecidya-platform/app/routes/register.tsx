import { useState } from "react";
import { Form, Link, useNavigate } from "react-router";

import { authClient } from "../lib/auth-client";
import { Alert, Button, Card } from "../components/ui";

export function meta() {
  return [{ title: "Crear cuenta | Vecidya" }, { name: "robots", content: "noindex" }];
}

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await authClient.signUp.email({
      email: String(formData.get("email")),
      name: String(formData.get("name")),
      password: String(formData.get("password")),
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? "No se pudo crear la cuenta.");
      return;
    }

    navigate("/app");
  }

  return (
    <main className="auth-shell">
      <Card className="auth-card">
        <div className="auth-brand">
          <img alt="" height="691" src="/brand/vecidya-app-icon.png" width="691" />
          <span>Vecidya</span>
        </div>
        <p className="eyebrow">PRIMER PASO</p>
        <h1>Crear cuenta</h1>
        <p>Comienza con tu espacio Vecidya.</p>
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
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        {error ? <Alert>{error}</Alert> : null}
        <Button disabled={submitting} type="submit">
          {submitting ? "Creando…" : "Registrarme"}
        </Button>
        </Form>
        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </Card>
    </main>
  );
}
