import assert from "node:assert/strict";
import { test } from "node:test";
import { getTableConfig } from "drizzle-orm/sqlite-core";

import { miniWebModule, miniWebSite } from "../../../db/schema/index.ts";

test("miniweb_site enforces exactly one configuration per organization", () => {
  const config = getTableConfig(miniWebSite);
  const organizationIndex = config.indexes.find((index) => index.config.name === "miniweb_site_organization_unique");

  assert.equal(config.name, "miniweb_site");
  assert.ok(config.columns.some((column) => column.name === "published_configuration_json"));
  assert.equal(organizationIndex?.config.unique, true);
  assert.deepEqual(organizationIndex?.config.columns.map((column) => column.name), ["organization_id"]);
  assert.equal(config.foreignKeys.length, 1);
});

test("miniweb_module has one draft row per module type and belongs to a site", () => {
  const config = getTableConfig(miniWebModule);
  const moduleIndex = config.indexes.find((index) => index.config.name === "miniweb_module_site_type_unique");

  assert.equal(config.name, "miniweb_module");
  assert.equal(config.foreignKeys.length, 1);
  assert.deepEqual(moduleIndex?.config.columns.map((column) => column.name), ["miniweb_site_id", "module_type"]);
  assert.equal(moduleIndex?.config.unique, true);
  assert.ok(config.columns.some((column) => column.name === "enabled"));
  assert.ok(config.columns.some((column) => column.name === "sort_order"));
});
