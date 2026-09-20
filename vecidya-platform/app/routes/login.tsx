import { useState } from "react";
import { Form, Link, useNavigate } from "react-router";

import { authClient } from "../lib/auth-client";
import { Alert, Button, Card } from "../components/ui";

export function meta() {
  return [{ title: "Iniciar sesión | Vecidya" }, { name: "robots", content: "noindex" }];
}

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await authClient.signIn.email({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? "Correo o contraseña incorrectos.");
      return;
    }

    const organizations = await authClient.organization.list();
    const firstOrganization = organizations.data?.[0];
    if (firstOrganization) {
      const activeOrganization = await authClient.organization.setActive({
        organizationId: firstOrganization.id,
      });
      if (activeOrganization.error) {
        setSubmitting(false);
        setError("No se pudo seleccionar tu organización activa.");
        return;
      }
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
        <p className="eyebrow">BIENVENIDO</p>
        <h1>Iniciar sesión</h1>
        <p>Accede a tu espacio de organización.</p>
        <Form className="auth-form" method="post" onSubmit={handleSubmit}>
        <label>
          Correo electrónico
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {error ? <Alert>{error}</Alert> : null}
        <Button disabled={submitting} type="submit">
          {submitting ? "Entrando…" : "Entrar"}
        </Button>
        </Form>
        <p className="auth-switch">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </Card>
    </main>
  );
}
