import assert from "node:assert/strict";
import test from "node:test";
import { ensureMiniWebV2Hero, miniWebV2EditorKey } from "../../app/features/miniweb-v2/editor-state.ts";

test("editor target identity changes with organization and site", () => {
  assert.notEqual(miniWebV2EditorKey("org-a", "site-1"), miniWebV2EditorKey("org-b", "site-1"));
  assert.notEqual(miniWebV2EditorKey("org-a", "site-1"), miniWebV2EditorKey("org-a", "site-2"));
  assert.notEqual(miniWebV2EditorKey("org-a", null), miniWebV2EditorKey("org-b", null));
});

test("editor inserts an editable hero in an empty persisted draft", () => {
  const result = ensureMiniWebV2Hero({ schemaVersion: 1, sections: [] });
  assert.equal(result.sections.length, 1);
  assert.equal(result.sections[0].type, "hero");
  assert.equal(result.sections[0].content.title, "");
});

test("editor adds a unique first hero when persisted sections have no hero", () => {
  const draft = { schemaVersion: 1 as const, sections: [{ id: "hero-main", type: "about" as const, schemaVersion: 1, order: 0, visible: true, content: { headline: "About", description: "", blocks: [] } }] };
  const result = ensureMiniWebV2Hero(draft);
  assert.equal(result.sections[0].type, "hero");
  assert.notEqual(result.sections[0].id, draft.sections[0].id);
  assert.equal(result.sections[1].order, 1);
});
