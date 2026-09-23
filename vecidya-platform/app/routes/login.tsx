import { useState } from "react";
import { Form, Link, useNavigate } from "react-router";

import { authClient } from "../lib/auth-client";
import { Alert, Button, Card } from "../components/ui";
import { publicAssets } from "../assets/public-assets";

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
      <div className="auth-layout">
        <section className="auth-welcome" aria-label="Tu espacio Vecidya">
          <Link className="auth-brand" to="/">
            <img alt="" height="691" src="/brand/vecidya-app-icon.png" width="691" />
            <span>Vecidya</span>
          </Link>
          <div className="auth-welcome__copy">
            <p className="eyebrow">TU ESPACIO DE TRABAJO</p>
            <h2>Todo lo importante de tu organización, en un solo lugar.</h2>
            <p>Gestiona tu perfil, consulta tus servicios y mantén al día la información que compartes en Vecindario.</p>
          </div>
          <img className="auth-welcome__art" alt="Vista ilustrada de descubrimiento local en Vecidya" height={1086} src={publicAssets.illustrations.mobileLocalDiscovery} width={1448} />
          <div className="auth-welcome__note"><span aria-hidden="true">✓</span> Tu información pertenece a tu organización</div>
        </section>
        <Card className="auth-card">
          <div className="auth-card__heading">
            <p className="eyebrow">BIENVENIDO</p>
            <h1>Iniciar sesión</h1>
            <p>Accede a tu espacio de organización.</p>
          </div>
          <Form className="auth-form" method="post" onSubmit={handleSubmit}>
            <label>
              Correo electrónico
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Contraseña
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <p className="auth-switch auth-switch--forgot"><Link to="/forgot-password">¿Olvidaste tu contraseña?</Link></p>
            {error ? <Alert>{error}</Alert> : null}
            <Button disabled={submitting} type="submit">
              {submitting ? "Entrando…" : "Entrar a mi espacio"}
            </Button>
          </Form>
          <p className="auth-switch">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
          <p className="auth-card__privacy">El acceso está protegido por tu cuenta Vecidya.</p>
        </Card>
      </div>
    </main>
  );
}
