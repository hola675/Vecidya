import { describe, expect, it } from "vitest";
import { createEmptyV2HoursSection, validateV2HoursSection } from "../../../app/features/miniweb-v2/hours";

describe("MiniWeb V2 hours isolation", () => {
  it("creates a completely empty section without importing V1 hours", () => {
    const section = createEmptyV2HoursSection();
    expect(section.schemaVersion).toBe(2);
    expect(section.timezone).toBe("");
    expect(section.days).toHaveLength(7);
    expect(section.days.every((day) => day.closed && day.ranges.length === 0)).toBe(true);
  });

  it("requires a timezone for publishing", () => {
    const result = validateV2HoursSection(createEmptyV2HoursSection());
    expect(result.valid).toBe(false);
  });

  it("accepts distinct morning and afternoon ranges", () => {
    const section = createEmptyV2HoursSection();
    section.timezone = "America/Bogota";
    section.days[0] = { day: "monday", closed: false, ranges: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "18:00" }] };
    expect(validateV2HoursSection(section).valid).toBe(true);
  });

  it("rejects overlaps and inverted ranges", () => {
    const section = createEmptyV2HoursSection();
    section.timezone = "America/Bogota";
    section.days[0] = { day: "monday", closed: false, ranges: [{ start: "09:00", end: "12:00" }, { start: "11:00", end: "13:00" }] };
    expect(validateV2HoursSection(section).valid).toBe(false);
    section.days[0].ranges = [{ start: "20:00", end: "08:00" }];
    expect(validateV2HoursSection(section).valid).toBe(false);
  });

  it("rejects duplicate weekdays and ranges on closed days", () => {
    const section = createEmptyV2HoursSection();
    section.timezone = "America/Bogota";
    section.days[1] = { ...section.days[0] };
    expect(validateV2HoursSection(section).valid).toBe(false);
    section.days[1] = { day: "tuesday", closed: true, ranges: [{ start: "09:00", end: "10:00" }] };
    expect(validateV2HoursSection(section).valid).toBe(false);
  });
});
