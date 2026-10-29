import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEmptyV2HoursSection, validateV2HoursSection } from "../../../app/features/miniweb-v2/hours";

describe("MiniWeb V2 hours isolation", () => {
  it("creates a completely empty section without importing V1 hours", () => {
    const section = createEmptyV2HoursSection();
    assert.equal(section.schemaVersion, 2);
    assert.equal(section.timezone, "");
    assert.equal(section.days.length, 7);
    assert.ok(section.days.every((day) => day.closed && day.ranges.length === 0));
  });

  it("requires a timezone for publishing", () => {
    const result = validateV2HoursSection(createEmptyV2HoursSection());
    assert.equal(result.valid, false);
  });

  it("accepts distinct morning and afternoon ranges", () => {
    const section = createEmptyV2HoursSection();
    section.timezone = "America/Bogota";
    section.days[0] = { day: "monday", closed: false, ranges: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "18:00" }] };
    assert.equal(validateV2HoursSection(section).valid, true);
  });

  it("rejects overlaps and inverted ranges", () => {
    const section = createEmptyV2HoursSection();
    section.timezone = "America/Bogota";
    section.days[0] = { day: "monday", closed: false, ranges: [{ start: "09:00", end: "12:00" }, { start: "11:00", end: "13:00" }] };
    assert.equal(validateV2HoursSection(section).valid, false);
    section.days[0].ranges = [{ start: "20:00", end: "08:00" }];
    assert.equal(validateV2HoursSection(section).valid, false);
  });

  it("rejects duplicate weekdays and ranges on closed days", () => {
    const section = createEmptyV2HoursSection();
    section.timezone = "America/Bogota";
    section.days[1] = { ...section.days[0] };
    assert.equal(validateV2HoursSection(section).valid, false);
    section.days[1] = { day: "tuesday", closed: true, ranges: [{ start: "09:00", end: "10:00" }] };
    assert.equal(validateV2HoursSection(section).valid, false);
  });
});
