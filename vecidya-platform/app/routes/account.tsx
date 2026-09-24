import { useState } from "react";
import { Form, useLoaderData, useRevalidator } from "react-router";

import { cloudflareContext } from "../../server/cloudflare-context";
import { requireSession, getActiveOrganization } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { Alert, Button, Card } from "../components/ui";
import { ClientAreaShell } from "../components/client-area-shell";
import { authClient } from "../lib/auth-client";

import type { Route } from "./+types/account";

export function meta() {
  return [
    { title: "Mi cuenta | Vecidya" },
    { name: "description", content: "Gestiona tu identidad personal en Vecidya." },
    { name: "robots", content: "noindex" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const [{ session, user }, shell, activeOrganization] = await Promise.all([
    requireSession(env, request),
    getClientWorkspaceContext(env, request),
    getActiveOrganization(env, request),
  ]);
  return {
    user: {
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
    },
    session: { expiresAt: session.expiresAt.toISOString() },
    ...shell,
    activeOrganization,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(new Date(value));
}

export default function AccountPage() {
  const { session, user, workspaceUser, organizations, isPlatformAdmin, activeOrganization } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!name) {
      setError("Escribe tu nombre para continuar.");
      setSubmitting(false);
      return;
    }

    const result = await authClient.updateUser({ name });
    setSubmitting(false);
    if (result.error) {
      setError(result.error.message ?? "No se pudo actualizar tu nombre.");
      return;
    }

    setSuccess("Tu nombre se actualizó correctamente.");
    revalidate();
  }

  return <ClientAreaShell active="account" workspaceUser={workspaceUser} organizations={organizations} activeOrganization={activeOrganization} isPlatformAdmin={isPlatformAdmin}><main className="app-main account-page" id="client-page-content"><div className="page-heading"><div><p className="eyebrow">MI CUENTA</p><h1>Tu identidad personal</h1><p>Estos datos te identifican como persona en Vecidya y no modifican tu organización ni el perfil de tu negocio.</p></div></div><div className="account-grid"><Card className="account-card"><h2>Datos personales</h2><Form className="auth-form" method="post" onSubmit={handleSubmit}><label htmlFor="account-name">Nombre<input autoComplete="name" defaultValue={user.name} id="account-name" maxLength={120} name="name" required /></label><label htmlFor="account-email">Correo electrónico<input aria-describedby="email-note" disabled id="account-email" type="email" value={user.email} readOnly /></label><p className="field-note" id="email-note">El cambio de correo no forma parte de esta fase.</p>{error ? <Alert>{error}</Alert> : null}{success ? <p className="success-message" role="status">{success}</p> : null}<Button disabled={submitting} type="submit">{submitting ? "Guardando…" : "Guardar nombre"}</Button></Form></Card><Card className="account-card"><p className="eyebrow">INFORMACIÓN DE CUENTA</p><h2>Estado y sesión</h2><dl className="account-details"><div><dt>Correo</dt><dd>{user.email}</dd></div><div><dt>Verificación</dt><dd>{user.emailVerified ? "Correo verificado" : "Correo pendiente de verificar"}</dd></div><div><dt>Cuenta creada</dt><dd>{formatDate(user.createdAt)}</dd></div><div><dt>Sesión vigente hasta</dt><dd>{formatDate(session.expiresAt)}</dd></div></dl><p className="field-note">Contraseña, acceso multifactor y eliminación de cuenta requieren fases de seguridad específicas.</p></Card></div></main></ClientAreaShell>;
}
