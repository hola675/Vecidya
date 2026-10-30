import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEmptyV2HoursSection, getV2LocalDate, splitV2OvernightRange, validateV2HoursSection } from "../../../app/features/miniweb-v2/hours";

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

  it("rejects overlaps and zero-width ranges", () => {
    const section = createEmptyV2HoursSection();
    section.timezone = "America/Bogota";
    section.days[0] = { day: "monday", closed: false, ranges: [{ start: "09:00", end: "12:00" }, { start: "11:00", end: "13:00" }] };
    assert.equal(validateV2HoursSection(section).valid, false);
    section.days[0].ranges = [{ start: "08:00", end: "08:00" }];
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

  it("splits overnight shifts across local dates and rejects next-day overlap", () => {
    const section = createEmptyV2HoursSection();
    section.timezone = "America/New_York";
    section.days[0] = { day: "monday", closed: false, ranges: [splitV2OvernightRange("22:00", "02:00")[0]] };
    section.days[1] = { day: "tuesday", closed: false, ranges: [splitV2OvernightRange("22:00", "02:00")[1]] };
    assert.equal(validateV2HoursSection(section).valid, true);
    section.days[1].ranges.push({ start: "01:00", end: "04:00" });
    assert.equal(validateV2HoursSection(section).valid, false);
    assert.throws(() => splitV2OvernightRange("22:00", "22:00"));
  });

  it("validates IANA zones and calendar exceptions, and resolves DST-local dates", () => {
    const section = createEmptyV2HoursSection();
    section.timezone = "America/New_York";
    section.exceptions = [{ date: "2026-03-08", closed: false, ranges: [{ start: "03:00", end: "05:00" }], note: "Cambio de horario" }];
    assert.equal(validateV2HoursSection(section).valid, true);
    assert.equal(getV2LocalDate(new Date("2026-03-08T07:30:00Z"), section.timezone), "2026-03-08");
    section.exceptions.push({ ...section.exceptions[0] });
    assert.equal(validateV2HoursSection(section).valid, false);
  });
});
