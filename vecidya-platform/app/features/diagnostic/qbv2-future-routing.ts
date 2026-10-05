import { archetypeIncludes, contextEquals, contextIn, orV2 } from "./qbv2-rules";

/** Future R2 applicability rules. Keep these out of QUESTION_BANK_V2 until its deliberate migration. */
export const futureB2BApplicability = () => orV2(
  archetypeIncludes("b2b"),
  contextIn("customerBuyer", ["b2b", "mixed"]),
);

export const futureCreatorApplicability = () => orV2(
  archetypeIncludes("creator"),
  contextEquals("audienceMonetization", "own_audience_monetization"),
);

export const futureProfessionalApplicability = () => orV2(
  archetypeIncludes("professional"),
  contextEquals("entity", "individual"),
  contextIn("nicheGroup", ["health_wellness", "legal", "financial_tax_insurance", "professional_services"]),
);
