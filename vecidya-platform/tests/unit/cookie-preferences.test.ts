import assert from "node:assert/strict";
import test from "node:test";
import { COOKIE_PREFERENCES_KEY, canUseOptionalCookies, createCookiePreferences, parseCookiePreferences, readCookiePreferences } from "../../app/lib/cookie-preferences";

const date = new Date("2026-10-24T12:00:00.000Z");
test("sin decisión las categorías opcionales permanecen desactivadas", () => {
  const storage = { getItem: () => null };
  assert.equal(readCookiePreferences(storage), null);
  assert.equal(canUseOptionalCookies("analytics", storage), false);
  assert.equal(canUseOptionalCookies("marketing", storage), false);
});
test("consentimiento explícito y rechazo se interpretan correctamente", () => {
  const accepted = JSON.stringify(createCookiePreferences(true, false, date));
  const storage = { getItem: (key: string) => key === COOKIE_PREFERENCES_KEY ? accepted : null };
  assert.equal(canUseOptionalCookies("analytics", storage), true);
  assert.equal(canUseOptionalCookies("marketing", storage), false);
  assert.equal(parseCookiePreferences(JSON.stringify(createCookiePreferences(false, false, date)))?.necessary, true);
});
test("preferencias antiguas, corruptas o incompletas no autorizan seguimiento", () => {
  for (const raw of ['{"version":1,"necessary":true,"analytics":true,"marketing":true,"savedAt":"2026-10-24"}', '{"version":2,"analytics":true}', "{", "null", "[]"]) {
    assert.equal(parseCookiePreferences(raw), null);
  }
  assert.equal(canUseOptionalCookies("analytics", { getItem: () => { throw Error("blocked"); } }), false);
});
