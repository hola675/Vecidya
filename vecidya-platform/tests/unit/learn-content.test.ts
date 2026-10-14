import assert from "node:assert/strict";
import { test } from "node:test";

import { getLearnArticle, learnArticles, learnCategories } from "../../app/content/learn.ts";
import type { LearnBlock } from "../../app/content/learn.ts";

const crmSlug = "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo";

test("CRM article exposes practical typed editorial blocks without changing the legacy articles", () => {
  const crmArticle = getLearnArticle(crmSlug);
  assert.ok(crmArticle);
  assert.equal(crmArticle.slug, crmSlug);
  assert.equal(crmArticle.cta.to, "/diagnostico");

  const blocks = crmArticle.sections.flatMap((section) => section.blocks ?? []);
  const blockTypes = new Set(blocks.map((block) => block.type));
  const expectedBlockTypes: LearnBlock["type"][] = ["definitions", "example", "steps", "callout", "faq", "sources", "summary"];
  for (const type of expectedBlockTypes) {
    assert.ok(blockTypes.has(type), `CRM article is missing the ${type} block.`);
  }

  const example = blocks.find((block) => block.type === "example");
  assert.ok(example && example.type === "example" && example.hypothetical, "The practical example must be identified as hypothetical.");

  const nonCrmArticles = learnArticles.filter((article) => article.slug !== crmSlug);
  assert.equal(nonCrmArticles.length, 3);
  assert.ok(nonCrmArticles.every((article) => article.sections.every((section) => !section.blocks)), "Other articles must retain their current legacy content structure.");
  assert.equal(learnCategories.length, 5);
});
