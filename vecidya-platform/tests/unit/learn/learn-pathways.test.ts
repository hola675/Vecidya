import assert from "node:assert/strict";
import test from "node:test";

import { recommendLearnPathway, summarizeLearnPathways, type LearnPathwayInput } from "../../../app/features/learn/learn-pathways.ts";

const guide = (slug: string, checkedCount: number, lastActivityAt: number | null = null) => ({
  slug, guideId: slug, title: slug, access: "always_free" as const, sectionCount: 2, checkedCount, lastActivityAt,
});

test("shares per-guide progress across every pathway that contains the guide", () => {
  const pathways: LearnPathwayInput[] = [
    { title: "Uno", description: "Primera ruta", guides: [guide("shared", 1)] },
    { title: "Dos", description: "Segunda ruta", guides: [guide("shared", 1), guide("other", 2)] },
  ];

  const summaries = summarizeLearnPathways(pathways);

  assert.deepEqual(summaries.map(({ percent, completedGuides, nextGuide }) => ({ percent, completedGuides, next: nextGuide?.slug })), [
    { percent: 50, completedGuides: 0, next: "shared" },
    { percent: 75, completedGuides: 1, next: "shared" },
  ]);
});

test("recommends the most recently active unfinished path with editorial-order tie breaking", () => {
  const summaries = summarizeLearnPathways([
    { title: "Primero", description: "", guides: [guide("first", 0, 5)] },
    { title: "Segundo", description: "", guides: [guide("second", 0, 9), guide("next", 1, 9)] },
    { title: "Tercero", description: "", guides: [guide("third", 0, 9)] },
  ]);

  assert.equal(recommendLearnPathway(summaries)?.guide.slug, "second");
});

test("returns no recommendation when every guide is complete", () => {
  const summaries = summarizeLearnPathways([{ title: "Completo", description: "", guides: [guide("done", 2)] }]);
  assert.equal(recommendLearnPathway(summaries), null);
});
