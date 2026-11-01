export type LearnPathwayGuideProgress = {
  slug: string;
  guideId: string;
  title: string;
  access: "always_free" | "licensed";
  sectionCount: number;
  checkedCount: number;
  lastActivityAt: number | null;
};

export type LearnPathwayInput = {
  title: string;
  description: string;
  guides: readonly LearnPathwayGuideProgress[];
};

export type LearnPathwaySummary = LearnPathwayInput & {
  completedGuides: number;
  percent: number;
  nextGuide: LearnPathwayGuideProgress | null;
  lastActivityAt: number | null;
};

/** Shares the same per-guide progress across every pathway containing that guide. */
export function summarizeLearnPathways(pathways: readonly LearnPathwayInput[]): LearnPathwaySummary[] {
  return pathways.map((pathway) => {
    const totalSections = pathway.guides.reduce((total, guide) => total + guide.sectionCount, 0);
    const checkedSections = pathway.guides.reduce((total, guide) => total + Math.min(guide.checkedCount, guide.sectionCount), 0);
    const completedGuides = pathway.guides.filter((guide) => guide.sectionCount > 0 && guide.checkedCount >= guide.sectionCount).length;
    const activity = pathway.guides.flatMap((guide) => guide.lastActivityAt === null ? [] : [guide.lastActivityAt]);
    return {
      ...pathway,
      completedGuides,
      percent: totalSections ? Math.round((checkedSections / totalSections) * 100) : 0,
      nextGuide: pathway.guides.find((guide) => guide.sectionCount > guide.checkedCount) ?? null,
      lastActivityAt: activity.length ? Math.max(...activity) : null,
    };
  });
}

/** Editorial-order tie breaks make recommendations stable and explainable. */
export function recommendLearnPathway(pathways: readonly LearnPathwaySummary[]): { pathway: LearnPathwaySummary; guide: LearnPathwayGuideProgress } | null {
  const candidate = pathways
    .map((pathway, index) => ({ pathway, index }))
    .filter(({ pathway }) => pathway.nextGuide !== null)
    .sort((left, right) => {
      const activityDelta = (right.pathway.lastActivityAt ?? 0) - (left.pathway.lastActivityAt ?? 0);
      return activityDelta || left.index - right.index;
    })[0]?.pathway;
  return candidate?.nextGuide ? { pathway: candidate, guide: candidate.nextGuide } : null;
}
