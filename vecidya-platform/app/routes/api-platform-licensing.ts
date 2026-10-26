import { and, eq } from "drizzle-orm";

import { createDatabase } from "../../db/client.server";
import { organizationLicense } from "../../db/schema";
import {
  LicensingError,
  LicensingConflictError,
  LicensingNotFoundError,
  assignOrganizationLicense,
  cancelOrganizationLicense,
  changeOrganizationLicensePlan,
  getBillingAccountPricing,
  getOrganizationLicense,
  isPlanCode,
  reassignOrganizationLicenseBillingAccount,
  reactivateCancelledOrganizationLicense,
  setOrganizationLicenseStatus,
} from "../../db/queries/licensing.server";
import { requirePlatformAdmin, requirePlatformAdminAction } from "../../server/platform-authorization.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-platform-licensing";

// LICENSE-STRATEGY-001. Solo `platform_admin`: no existe todavía checkout ni cobro automático, así
// que asignar, cambiar de plan, suspender/reactivar/cancelar y transferir de billing_account son
// operaciones controladas y auditadas (ver db/queries/licensing.server.ts), no autoservicio.
export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env, request);
  const database = createDatabase(env.DB);

  const license = await getOrganizationLicense(database, params.organizationId);
  if (!license) return Response.json({ license: null, billingAccount: null, pricing: null });

  const pricing = await getBillingAccountPricing(database, license.billingAccountId, new Date());

  return Response.json({ license, billingAccountId: license.billingAccountId, pricing });
}

function errorResponse(error: unknown) {
  if (error instanceof LicensingNotFoundError) return Response.json({ error: error.message }, { status: 404 });
  if (error instanceof LicensingConflictError) return Response.json({ error: error.message }, { status: 409 });
  if (error instanceof LicensingError) return Response.json({ error: error.message }, { status: 400 });
  throw error;
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const admin = await requirePlatformAdminAction(env, request, "organization:license:update");
  const database = createDatabase(env.DB);
  const organizationId = params.organizationId;

  let body: { operation?: unknown; ownerUserId?: unknown; planCode?: unknown; activate?: unknown; status?: unknown; newOwnerUserId?: unknown; currentLicenseId?: unknown; expectedLicenseId?: unknown; expectedBillingAccountId?: unknown };
  try {
    body = await request.json();
  } catch {
    throw new Response("Invalid JSON body", { status: 400 });
  }

  if (body.operation === "assign") {
    if (typeof body.ownerUserId !== "string" || !isPlanCode(body.planCode)) {
      return Response.json({ error: "ownerUserId and a valid planCode are required" }, { status: 400 });
    }
    try {
      const result = await assignOrganizationLicense(database, {
        organizationId,
        ownerUserId: body.ownerUserId,
        planCode: body.planCode,
        actorUserId: admin.userId,
        activate: body.activate === true,
      });
      return Response.json(result, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  }

  if (body.operation === "change-plan") {
    if (!isPlanCode(body.planCode)) return Response.json({ error: "A valid planCode is required" }, { status: 400 });
    if (typeof body.currentLicenseId !== "string" || !body.currentLicenseId) return Response.json({ error: "currentLicenseId is required" }, { status: 400 });
    try {
      const result = await changeOrganizationLicensePlan(database, { organizationId, expectedLicenseId: body.currentLicenseId, newPlanCode: body.planCode, actorUserId: admin.userId });
      return Response.json(result);
    } catch (error) {
      return errorResponse(error);
    }
  }

  if (body.operation === "cancel") {
    if (typeof body.currentLicenseId !== "string" || !body.currentLicenseId) return Response.json({ error: "currentLicenseId is required" }, { status: 400 });
    try {
      const result = await cancelOrganizationLicense(database, { organizationId, expectedLicenseId: body.currentLicenseId, actorUserId: admin.userId });
      return Response.json(result);
    } catch (error) {
      return errorResponse(error);
    }
  }

  if (body.operation === "suspend" || body.operation === "reactivate") {
    if (typeof body.currentLicenseId !== "string" || !body.currentLicenseId) return Response.json({ error: "currentLicenseId is required" }, { status: 400 });
    try {
      if (body.operation === "reactivate") {
        const current = await database.query.organizationLicense.findFirst({ where: and(eq(organizationLicense.id, body.currentLicenseId), eq(organizationLicense.organizationId, organizationId)) });
        if (!current) return Response.json({ error: "Organization license not found" }, { status: 404 });
        if (current.status === "cancelled") {
          return Response.json(await reactivateCancelledOrganizationLicense(database, { organizationId, expectedLicenseId: body.currentLicenseId, actorUserId: admin.userId }));
        }
        if (current.status !== "suspended") throw new LicensingConflictError("Only suspended or manually cancelled licenses can be reactivated");
      }
      const result = await setOrganizationLicenseStatus(database, {
        organizationId,
        expectedLicenseId: body.currentLicenseId,
        expectedStatus: body.operation === "suspend" ? "active" : "suspended",
        status: body.operation === "suspend" ? "suspended" : "active",
        actorUserId: admin.userId,
      });
      return Response.json(result);
    } catch (error) {
      return errorResponse(error);
    }
  }

  if (body.operation === "transfer-billing-account") {
    if (
      typeof body.newOwnerUserId !== "string" || !body.newOwnerUserId ||
      typeof body.expectedLicenseId !== "string" || !body.expectedLicenseId ||
      typeof body.expectedBillingAccountId !== "string" || !body.expectedBillingAccountId
    ) {
      return Response.json({ error: "newOwnerUserId, expectedLicenseId and expectedBillingAccountId are required" }, { status: 400 });
    }
    try {
      const result = await reassignOrganizationLicenseBillingAccount(database, {
        organizationId,
        newOwnerUserId: body.newOwnerUserId,
        expectedLicenseId: body.expectedLicenseId,
        expectedBillingAccountId: body.expectedBillingAccountId,
        actorUserId: admin.userId,
      });
      return Response.json(result);
    } catch (error) {
      return errorResponse(error);
    }
  }

  return Response.json({ error: "Unsupported licensing operation" }, { status: 400 });
}
