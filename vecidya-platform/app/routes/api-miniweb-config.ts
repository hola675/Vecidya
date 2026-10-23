import { createDatabase } from "../../db/client.server";
import { listBusinessHoursForOrganization } from "../../db/queries/business-hours.server";
import { getBusinessProfileForOrganization } from "../../db/queries/business-profile.server";
import { getBusinessProfileGovernance } from "../../db/queries/platform-governance.server";
import { getBusinessDraftRevision, publishBusinessPublicationForOrganization } from "../../db/queries/business-publication.server";
import { hasActiveLicenseForOrganizationOwner } from "../../db/queries/business-profile.server";
import {
  getMiniWebConfigurationForOrganization,
  saveMiniWebConfigurationForOrganization,
} from "../../db/queries/miniweb.server";
import { MAX_MINIWEB_CONFIGURATION_BYTES, validateMiniWebDraft } from "../features/miniweb/registry";
import { toMiniWebPublicProfile } from "../features/miniweb/public-model";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { requireOrganization } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-miniweb-config";

const forbidden = () => new Response("La organización activa no coincide.", { status: 403 });
const badRequest = (message: string) => Response.json({ error: message }, { status: 400 });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getOrganizationContext(context: Route.LoaderArgs["context"], request: Request, organizationId: string) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  if (organization.id !== organizationId) throw forbidden();
  const database = createDatabase(env.DB);
  return { env, organization, database };
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env, organization, database } = await getOrganizationContext(context, request, params.organizationId);
  const membership = await requireOrganizationPermission(env, request, organization.id, "business-profile:read");
  const [profile, hours] = await Promise.all([
    getBusinessProfileForOrganization(database, organization.id),
    listBusinessHoursForOrganization(database, organization.id),
  ]);
  const governance = profile ? await getBusinessProfileGovernance(database, profile.id) : null;
  const configuration = await getMiniWebConfigurationForOrganization(database, organization.id, profile, hours);
  const draftRevision = await getBusinessDraftRevision(database, organization.id);

  return Response.json({
    hasPersistedConfiguration: configuration.hasPersistedConfiguration,
    draftConfiguration: configuration.draftConfiguration,
    publishedConfiguration: configuration.publishedConfiguration,
    profile: toMiniWebPublicProfile(profile, governance?.verificationStatus ?? "unverified"),
    hours: hours.map(({ dayOfWeek, isClosed, opensAt, closesAt }) => ({ dayOfWeek, isClosed, opensAt, closesAt })),
    role: membership.role,
    draftRevision,
  });
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env, organization, database } = await getOrganizationContext(context, request, params.organizationId);
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_MINIWEB_CONFIGURATION_BYTES + 256) {
    return Response.json({ error: "La solicitud excede el tamaño permitido." }, { status: 413 });
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_MINIWEB_CONFIGURATION_BYTES + 256) {
    return Response.json({ error: "La solicitud excede el tamaño permitido." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return badRequest("El cuerpo JSON no es válido.");
  }
  if (!isRecord(body) || Object.keys(body).some((key) => !["intent", "configuration", "draftRevision"].includes(key))) {
    return badRequest("La solicitud MiniWeb tiene campos no permitidos.");
  }

  const intent = body.intent;
  if (intent !== "save" && intent !== "publish") return badRequest("La operación MiniWeb no es válida.");
  const expectedRevision = body.draftRevision;
  if (!Number.isInteger(expectedRevision) || Number(expectedRevision) < 0) return Response.json({ error: "La versión del borrador no es válida. Recarga la página." }, { status: 409 });
  await requireOrganizationPermission(env, request, organization.id, intent === "publish" ? "business-profile:publish" : "business-profile:update");

  const [profile, hours] = await Promise.all([
    getBusinessProfileForOrganization(database, organization.id),
    listBusinessHoursForOrganization(database, organization.id),
  ]);
  try {
    if (intent === "save") {
      const configuration = validateMiniWebDraft(body.configuration);
      const saved = await saveMiniWebConfigurationForOrganization(database, organization.id, profile, hours, configuration, undefined, Number(expectedRevision));
      return Response.json({ ok: true, configuration: saved.configuration, draftRevision: saved.draftRevision });
    }
    if (!await hasActiveLicenseForOrganizationOwner(database, organization.id)) return Response.json({ error: "Necesitas una licencia Vecidya activa para publicar en Vecindario." }, { status: 400 });
    const publication = await publishBusinessPublicationForOrganization(database, organization.id, Number(expectedRevision));
    const published = await getMiniWebConfigurationForOrganization(database, organization.id, profile, hours);
    return Response.json({ ok: true, configuration: published.draftConfiguration, draftRevision: publication.state.draftRevision });
  } catch (error) {
    if (error instanceof Response && (error.status === 400 || error.status === 409)) return Response.json({ error: await error.text() }, { status: error.status });
    if (error instanceof TypeError) return badRequest(error.message);
    throw error;
  }
}
