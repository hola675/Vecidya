import assert from "node:assert/strict";
import { test } from "node:test";

import { formatPlatformDate, formatPlatformDateTime } from "../../app/lib/platform-date-format.ts";

test("fecha y hora de plataforma son deterministas en el límite de día UTC", () => {
  const value = new Date(Date.UTC(2026, 10, 2, 3, 21));
  const formatted = formatPlatformDateTime(value);

  assert.equal(formatted, "1 nov 2026, 10:21 p. m.");
  assert.equal(formatted.includes("\u00a0"), false);
  assert.equal(formatPlatformDate("2026-11-02T04:00:00.000Z"), "1/11/2026");
});

test("formato horario mantiene mediodía y minutos con relleno", () => {
  assert.equal(formatPlatformDateTime("2026-11-02T17:05:00.000Z"), "2 nov 2026, 12:05 p. m.");
  assert.equal(formatPlatformDateTime("2026-11-02T16:07:00.000Z"), "2 nov 2026, 11:07 a. m.");
});
