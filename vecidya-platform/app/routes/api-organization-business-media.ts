import { createDatabase } from "../../db/client.server";
import { getBusinessMediaStorageBytes, MAX_BUSINESS_MEDIA_BYTES, MAX_BUSINESS_MEDIA_STORAGE_BYTES } from "../../db/queries/business-media.server";
import { businessMediaAsset } from "../../db/schema";
import { commitBusinessDraftMutation } from "../../db/queries/business-publication.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { requireOrganization } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-organization-business-media";

const allowedContentTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]);

function matchesSignature(bytes: Uint8Array, contentType: string) {
  if (contentType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (contentType === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (contentType === "video/mp4") return String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
  if (contentType === "video/webm") return bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  return false;
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  if (organization.id !== params.organizationId) return new Response("La organización activa no coincide.", { status: 403 });
  await requireOrganizationPermission(env, request, organization.id, "business-profile:update");

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BUSINESS_MEDIA_BYTES + 64 * 1024) return Response.json({ error: "El archivo supera el tamaño máximo permitido." }, { status: 413 });
  const form = await request.formData();
  const file = form.get("file");
  const altText = form.get("altText");
  const purpose = form.get("purpose");
  const purposeValue = String(purpose);
  const expectedRevision = Number(form.get("draftRevision"));
  if (!(file instanceof File) || typeof altText !== "string" || !altText.trim() || altText.trim().length > 180 || !["cover", "gallery", "logo", "icon"].includes(purposeValue) || !Number.isInteger(expectedRevision) || expectedRevision < 0) {
    return Response.json({ error: "Selecciona un archivo, proporciona texto alternativo y conserva una revisión de borrador válida." }, { status: 400 });
  }
  if (!file.size || file.size > MAX_BUSINESS_MEDIA_BYTES || !allowedContentTypes.has(file.type)) {
    return Response.json({ error: "Solo se aceptan imágenes JPEG, PNG o WebP y videos MP4 o WebM de hasta 32 MB." }, { status: 415 });
  }
  if (purposeValue !== "gallery" && !file.type.startsWith("image/")) return Response.json({ error: "La portada, el logo y el icono deben ser imágenes." }, { status: 415 });

  const database = createDatabase(env.DB);
  const usedBytes = await getBusinessMediaStorageBytes(database, organization.id);
  if (usedBytes + file.size > MAX_BUSINESS_MEDIA_STORAGE_BYTES) return Response.json({ error: "La organización alcanzó su límite de almacenamiento de medios." }, { status: 413 });
  if (purposeValue !== "gallery" && await database.query.businessMediaAsset.findFirst({ where: (table, { and, eq }) => and(eq(table.organizationId, organization.id), eq(table.purpose, purposeValue), eq(table.isActive, true)) })) {
    return Response.json({ error: `Ya existe ${purposeValue === "cover" ? "una portada" : purposeValue === "logo" ? "un logo" : "un icono"}. Retíralo antes de seleccionar otro.` }, { status: 409 });
  }

  const body = new Uint8Array(await file.arrayBuffer());
  if (!matchesSignature(body, file.type)) return Response.json({ error: "El contenido del archivo no coincide con su formato declarado." }, { status: 415 });
  const id = crypto.randomUUID();
  const objectKey = `organizations/${organization.id}/${id}`;
  const now = new Date();
  await env.BUSINESS_MEDIA.put(objectKey, body, {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=3600" },
    customMetadata: { organizationId: organization.id, assetId: id },
  });
  try {
    await commitBusinessDraftMutation(database, organization.id, expectedRevision, (revision, token) => [database.$client.prepare(`INSERT INTO business_media_asset (id, organization_id, object_key, purpose, media_type, content_type, size_bytes, alt_text, created_at)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (
        SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?
      )`)
      .bind(id, organization.id, objectKey, purposeValue, file.type.startsWith("image/") ? "image" : "video", file.type, file.size, altText.trim(), now.getTime(), organization.id, revision, token)]);
  } catch (error) {
    await env.BUSINESS_MEDIA.delete(objectKey);
    if (error instanceof Response && error.status === 409) return Response.json({ error: await error.text() }, { status: 409 });
    throw error;
  }
  return Response.json({ ok: true, draftRevision: expectedRevision + 1, asset: { id, purpose: purposeValue, mediaType: file.type.startsWith("image/") ? "image" : "video", contentType: file.type, sizeBytes: file.size, altText: altText.trim(), createdAt: now } }, { status: 201 });
}
