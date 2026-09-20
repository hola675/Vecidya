import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";

import { createAuth } from "../../server/auth.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requireSession } from "../../server/auth/session.server";
import { Alert, Button, Card } from "../components/ui";

import type { Route } from "./+types/invitation";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requireSession(env, request);
  const invitation = await createAuth(env, request).api.getInvitation({
    headers: request.headers,
    query: { id: params.invitationId },
  });
  return { invitation };
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  await requireSession(env, request);
  try {
    await createAuth(env, request).api.acceptInvitation({
      headers: request.headers,
      body: { invitationId: params.invitationId },
    });
    return { success: "Invitación aceptada. Ya formas parte de la organización." };
  } catch {
    return { error: "No se pudo aceptar la invitación. Comprueba el correo de la sesión y su vigencia." };
  }
}

export default function InvitationPage() {
  const { invitation } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <main className="app-main invitation-page">
      <Link className="back-link" to="/app">← Volver a Mi Vecidya</Link>
      <Card className="invitation-card">
        <p className="eyebrow">INVITACIÓN</p>
        <h1>Unirte a {invitation.organizationName}</h1>
        <p>Esta invitación está dirigida a {invitation.email} y propone el rol {invitation.role}.</p>
        {result?.error ? <Alert>{result.error}</Alert> : null}
        {result?.success ? <p className="success-message" role="status">{result.success}</p> : null}
        {!result?.success ? <Form method="post"><Button disabled={busy} type="submit">{busy ? "Aceptando…" : "Aceptar invitación"}</Button></Form> : null}
      </Card>
    </main>
  );
}
