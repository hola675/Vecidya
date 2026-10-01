import { spawnSync } from "node:child_process";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

const scripts = [
  "account-personal-settings-check.mjs",
  "business-profile-experience-check.mjs",
  "business-profile-slug-lifecycle-check.mjs",
  "services-experience-check.mjs",
  "admin-shell-check.mjs",
  "admin-business-profiles-check.mjs",
  "admin-organizations-check.mjs",
  "admin-integrations-check.mjs",
  "platform-service-administration-check.mjs",
  "organization-members-check.mjs",
  "organization-invitations-check.mjs",
  "organization-authorization-check.mjs",
  "organization-invitation-flow-check.mjs",
  "organization-team-ui-check.mjs",
  "platform-licensing-check.mjs",
  "product-experience-a-public-review-check.mjs",
  "licenses-experience-check.mjs",
  "addons-experience-check.mjs",
  "diagnostic-experience-check.mjs",
  "diagnostic-persistence-check.mjs",
  "diagnostic-save-resume-check.mjs",
  "diagnostic-analytics-check.mjs",
  "diagnostic-v3-flow-check.mjs",
  "join-contact-experience-check.mjs",
  "about-experience-check.mjs",
  "learn-experience-check.mjs",
  "commercial-experience-review-check.mjs",
  "legal-trust-experience-check.mjs",
  "product-experience-b-client-app-check.mjs",
  "product-evolution-001-b-multi-organization-check.mjs",
  "product-evolution-001-c1-contact-presence-check.mjs",
  "product-evolution-001-c2-business-operations-check.mjs",
  "product-evolution-001-d1-admin-governance-check.mjs",
  "public-growth-c1-real-profile-readiness-check.mjs",
];

for (const script of scripts) {
  console.log(`\n=== E2E local: ${script} ===`);
  const result = spawnSync(process.execPath, [`tests/e2e/${script}`], {
    cwd: process.cwd(),
    env: { ...process.env, BASE_URL: baseUrl },
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`${script} falló con código ${result.status ?? "desconocido"}.`);
  }
}

console.log(`\nPASS: ${scripts.length} E2E locales ejecutados contra ${baseUrl}.`);
