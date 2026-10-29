import { describe, expect, it } from "vitest";
import { createV2Draft } from "../../../app/features/miniweb-v2/sections";
import { newHoursV2, validateHoursV2, setHoursV2Day } from "../../../app/features/miniweb-v2/hours";
import { importPublishedV1ToV2 } from "../../../app/features/miniweb-v2/migrate";

describe("MiniWeb V2 independent hours and opt-in import", () => {
  it("creates a fresh disabled hours section without legacy data", () => {
    const draft = createV2Draft("services-studio", "premium");
    expect(draft.sections).toEqual([{
      instanceId: "hours-1", type: "hours", enabled: false,
      content: newHoursV2(),
    }]);
  });

  it("never imports legacy hours even when supplied at runtime", () => {
    const legacy = {
      publicationId: "pub-v1", displayName: "Negocio", city: "Medellín",
      hours: [{ day: 1, start: "09:00", end: "18:00" }],
      schedule: "Monday 9-6",
      legacyModules: [{ type: "hours", enabled: true }],
    };
    const result = importPublishedV1ToV2(legacy, "catalog-store", "base");
    expect(result.draft.sourcePublicationId).toBe("pub-v1");
    expect(result.draft.sections.find((section) => section.type === "hours")).toEqual({
      instanceId: "hours-1", type: "hours", enabled: false,
      content: newHoursV2(),
    });
    expect(result.importedFields).toEqual(["displayName", "city"]);
    expect(JSON.stringify(result.draft)).not.toContain("09:00");
    expect(JSON.stringify(result.draft)).not.toContain("Monday");
  });

  it("rejects invalid and overlapping hours in the new contract", () => {
    expect(validateHoursV2({
      schemaVersion: 2, timezone: "America/Bogota", notice: "",
      days: [{ day: 1, closed: false, intervals: [
        { start: "09:00", end: "12:00" },
        { start: "11:00", end: "13:00" },
      ] }],
    })).toContain("overlapping_intervals");
  });

  it("does not accept an empty source publication", () => {
    expect(() => importPublishedV1ToV2({ publicationId: " " }, "vecidya-default", "base"))
      .toThrow("source_publication_required");
  });
  it("rejects unsorted overlaps and invalid timezones", () => {
    const days = Array.from({ length: 7 }, (_, day) => ({
      day: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      closed: day !== 1,
      intervals: day === 1 ? [
        { start: "11:00", end: "14:00" },
        { start: "09:00", end: "12:00" },
      ] : [],
    }));
    const errors = validateHoursV2({ schemaVersion: 2, timezone: "Invalid/Zone", notice: "", days });
    expect(errors).toContain("overlapping_intervals");
    expect(errors).toContain("invalid_timezone");
  });

  it("requires seven explicit days and an interval for an open day", () => {
    const errors = validateHoursV2({
      schemaVersion: 2, timezone: "America/Bogota", notice: "",
      days: [{ day: 1, closed: false, intervals: [] }],
    });
    expect(errors).toContain("seven_days_required");
    expect(errors).toContain("open_day_requires_interval");
  });

  it("creates seven closed days and edits only V2 state", () => {
    const original = newHoursV2();
    expect(original.days).toHaveLength(7);
    expect(original.days.every((day) => day.closed)).toBe(true);
    const updated = setHoursV2Day(original, 1, {
      closed: false, intervals: [{ start: "09:00", end: "17:00" }],
    });
    expect(updated.days[1].intervals).toEqual([{ start: "09:00", end: "17:00" }]);
    expect(original.days[1].intervals).toEqual([]);
  });

});
