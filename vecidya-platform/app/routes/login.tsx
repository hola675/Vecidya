import { useState } from "react";
import { Form, Link, useNavigate, useSearchParams } from "react-router";

import { authClient } from "../lib/auth-client";
import { safeAppRedirect } from "../lib/safe-redirect";
import { Alert, Button } from "../components/ui";
import { AuthShell } from "../components/auth-shell";

export function meta() {
  return [{ title: "Iniciar sesión | Vecidya" }, { name: "robots", content: "noindex" }];
}

export default function Login() {
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

    navigate(redirectTo ?? "/app");
  }

  return (
    <AuthShell
      description="Accede a tu espacio de organización."
      eyebrow="BIENVENIDO"
      privacyNote="El acceso está protegido por tu cuenta Vecidya."
      title="Iniciar sesión"
    >
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
      <p className="auth-switch">¿No tienes cuenta? <Link to={redirectTo ? `/register?redirectTo=${encodeURIComponent(redirectTo)}` : "/register"}>Regístrate</Link></p>
    </AuthShell>
  );
}
