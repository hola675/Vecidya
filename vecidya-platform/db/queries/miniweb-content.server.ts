import { asc, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { businessFaq, businessOffering } from "../schema";
import type { BusinessFaqItem, BusinessOffering } from "../../app/features/miniweb/content";

type BatchItem = ReturnType<Database["$client"]["prepare"]>;

export async function getMiniWebContentForOrganization(database: Database, organizationId: string) {
  const [offerings, faqs] = await Promise.all([
    database.query.businessOffering.findMany({
      where: eq(businessOffering.organizationId, organizationId),
      orderBy: [asc(businessOffering.sortOrder), asc(businessOffering.id)],
    }),
    database.query.businessFaq.findMany({
      where: eq(businessFaq.organizationId, organizationId),
      orderBy: [asc(businessFaq.sortOrder), asc(businessFaq.id)],
    }),
  ]);
  return {
    offerings: offerings.map(({ kind, title, description, priceLabel, imageAssetId, sortOrder, isActive }) => ({
      kind: kind as BusinessOffering["kind"], title, description, priceLabel, imageAssetId, sortOrder, isActive,
    })),
    faqs: faqs.map(({ question, answer, sortOrder, isActive }) => ({ question, answer, sortOrder, isActive })),
  };
}

export function buildMiniWebContentReplacementStatements(
  database: Database,
  organizationId: string,
  offerings: readonly BusinessOffering[],
  faqs: readonly BusinessFaqItem[],
  revision: number,
  token: string,
): BatchItem[] {
  const authorized = `EXISTS (SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?)`;
  const statements: BatchItem[] = [
    database.$client.prepare(`DELETE FROM business_offering WHERE organization_id = ? AND ${authorized}`)
      .bind(organizationId, organizationId, revision, token),
    database.$client.prepare(`DELETE FROM business_faq WHERE organization_id = ? AND ${authorized}`)
      .bind(organizationId, organizationId, revision, token),
  ];

  for (let start = 0; start < offerings.length; start += 2) {
    const chunk = offerings.slice(start, start + 2);
    statements.push(database.$client.prepare(`INSERT INTO business_offering
      (id, organization_id, kind, title, description, price_label, image_asset_id, sort_order, is_active, created_at, updated_at)
      ${chunk.map(() => `SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE ${authorized}`).join(" UNION ALL ")}`)
      .bind(...chunk.flatMap((item) => [crypto.randomUUID(), organizationId, item.kind, item.title, item.description, item.priceLabel, item.imageAssetId, item.sortOrder, item.isActive ? 1 : 0, Date.now(), Date.now(), organizationId, revision, token])));
  }

  for (let start = 0; start < faqs.length; start += 2) {
    const chunk = faqs.slice(start, start + 2);
    statements.push(database.$client.prepare(`INSERT INTO business_faq
      (id, organization_id, question, answer, sort_order, is_active, created_at, updated_at)
      ${chunk.map(() => `SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE ${authorized}`).join(" UNION ALL ")}`)
      .bind(...chunk.flatMap((item) => [crypto.randomUUID(), organizationId, item.question, item.answer, item.sortOrder, item.isActive ? 1 : 0, Date.now(), Date.now(), organizationId, revision, token])));
  }
  return statements;
}
