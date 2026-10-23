import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const migrationSource = join(projectDirectory, "db/migrations");
const wranglerCli = join(projectDirectory, "node_modules/wrangler/bin/wrangler.js");
if (!existsSync(wranglerCli)) throw new Error("Instala las dependencias del proyecto antes de ejecutar esta certificación.");

const temporaryRoot = mkdtempSync(join(tmpdir(), "vecidya-d1-release-"));
const migrationsDirectory = join(temporaryRoot, "migrations");
const persistenceDirectory = join(temporaryRoot, "persist");
const configPath = join(temporaryRoot, "wrangler.jsonc");
mkdirSync(join(migrationsDirectory, "meta"), { recursive: true });
writeFileSync(configPath, JSON.stringify({
  name: "vecidya-d1-release-certification",
  compatibility_date: "2026-08-13",
  d1_databases: [{ binding: "DB", database_name: "vecidya-d1-release-certification", database_id: "11111111-1111-4111-8111-111111111111", migrations_dir: "migrations" }],
}, null, 2));

const sourceJournal = JSON.parse(readFileSync(join(migrationSource, "meta/_journal.json"), "utf8"));
const copyThrough = (lastIdx) => {
  for (const entry of sourceJournal.entries.filter(({ idx }) => idx <= lastIdx)) {
    cpSync(join(migrationSource, `${entry.tag}.sql`), join(migrationsDirectory, `${entry.tag}.sql`));
  }
  writeFileSync(join(migrationsDirectory, "meta/_journal.json"), JSON.stringify({ ...sourceJournal, entries: sourceJournal.entries.filter(({ idx }) => idx <= lastIdx) }, null, 2));
};

const runWrangler = (args) => execFileSync(process.execPath, [wranglerCli, ...args], {
  cwd: projectDirectory,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
});
const applyLocal = () => runWrangler(["d1", "migrations", "apply", "DB", "--local", "--config", configPath, "--persist-to", persistenceDirectory]);
const executeLocal = (sql) => JSON.parse(runWrangler(["d1", "execute", "DB", "--local", "--config", configPath, "--persist-to", persistenceDirectory, "--json", "--command", sql]));
const rows = (sql) => executeLocal(sql).flatMap((result) => result.results ?? []);
const findSqliteFiles = (directory) => {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...findSqliteFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".sqlite")) found.push(path);
  }
  return found;
};

try {
  // Build a real 0010 database, with representative pre-existing auth, tenancy,
  // profile and active licensing data. Apply later migrations incrementally.
  copyThrough(10);
  applyLocal();
  executeLocal(`
    INSERT INTO user (id,name,email,email_verified,created_at,updated_at)
      VALUES ('release-user','Release User','release@example.invalid',1,1000,1000);
    INSERT INTO organization (id,name,slug,created_at) VALUES ('release-org','Release Org','release-org',1000);
    INSERT INTO member (id,organization_id,user_id,role,created_at)
      VALUES ('release-member','release-org','release-user','owner',1000);
    INSERT INTO business_profile (id,organization_id,display_name,slug,status,created_at,updated_at)
      VALUES ('release-profile','release-org','Release Profile','release-profile','published',1000,1000);
    INSERT INTO billing_account (id,owner_user_id,kind,name,created_at,updated_at)
      VALUES ('release-billing','release-user','individual','Release Billing',1000,1000);
    INSERT INTO organization_license (id,organization_id,billing_account_id,plan_code,price_id,status,started_at,activated_at,created_at,updated_at)
      VALUES ('release-license','release-org','release-billing','cuadra','license-price-cuadra-v1','active',1000,1000,1000,1000);
  `);
  const baseline = rows(`
    SELECT (SELECT count(*) FROM user WHERE id='release-user') AS users,
      (SELECT count(*) FROM organization WHERE id='release-org') AS organizations,
      (SELECT count(*) FROM member WHERE id='release-member') AS members,
      (SELECT count(*) FROM business_profile WHERE id='release-profile') AS profiles,
      (SELECT count(*) FROM organization_license WHERE id='release-license') AS licenses,
      (SELECT count(*) FROM license_price) AS price_seeds
  `)[0];
  assert.deepEqual(baseline, { users: 1, organizations: 1, members: 1, profiles: 1, licenses: 1, price_seeds: 3 });

  copyThrough(18);
  applyLocal();
  executeLocal(`
    INSERT INTO identified_diagnostic_request
      (id,idempotency_key_hash,engine_identity,report_version,methodology_version,status,full_name,email,service_notice_version,service_notice_acknowledged_at,created_at,updated_at,expires_at)
      VALUES ('release-request','idempotency-hash','qa03b-v1','report-v1','method-v1','verified','Synthetic Owner','release@example.invalid','notice-v1',1000,1000,1000,9999999999999);
    INSERT INTO diagnostic_report_snapshot
      (request_id,engine_identity,report_version,methodology_version,report_json,report_sha256,computed_at,expires_at)
      VALUES ('release-request','qa03b-v1','report-v1','method-v1','{}','synthetic-sha',1000,9999999999999);
    INSERT INTO verified_email_challenge
      (id,request_id,purpose,token_digest,status,attempts,issued_at,expires_at,created_at)
      VALUES ('release-challenge-1','release-request','verification','challenge-hash-1','consumed',0,1000,2000,1000),
             ('release-challenge-2','release-request','access_recovery','challenge-hash-2','consumed',0,1000,2000,1000);
    INSERT INTO diagnostic_report_access
      (id,request_id,challenge_id,token_digest,issued_at,expires_at,first_opened_at)
      VALUES ('release-access-1','release-request','release-challenge-1','access-hash-1',1000,9999999999999,3000),
             ('release-access-2','release-request','release-challenge-2','access-hash-2',1000,9999999999999,2000);
  `);

  copyThrough(sourceJournal.entries.length - 1);
  applyLocal();

  const sqliteFiles = findSqliteFiles(persistenceDirectory);
  const databaseFile = sqliteFiles.find((path) => {
    const candidate = new DatabaseSync(path);
    try { return candidate.prepare("SELECT count(*) AS total FROM d1_migrations").get().total === sourceJournal.entries.length; }
    catch { return false; }
    finally { candidate.close(); }
  });
  assert.ok(databaseFile, `no se encontró la D1 efímera con ledger 0000–0021 entre: ${sqliteFiles.join(", ")}`);
  const rawDb = new DatabaseSync(databaseFile);
  const integrity = rawDb.prepare("PRAGMA integrity_check").all();
  const foreignKeyViolations = rawDb.prepare("PRAGMA foreign_key_check").all();
  assert.equal(integrity.length, 1);
  assert.equal(integrity[0].integrity_check, "ok");
  assert.deepEqual(foreignKeyViolations, [], `violaciones FK: ${JSON.stringify(foreignKeyViolations)}`);
  const ledger = rawDb.prepare("SELECT name FROM d1_migrations ORDER BY name").all().map(({ name }) => name);
  const expectedMigrations = sourceJournal.entries.map(({ tag }) => `${tag}.sql`);
  assert.deepEqual(ledger, expectedMigrations, "el ledger debe coincidir exactamente con 0000–0021, sin saltos ni entradas extra");

  const preserved = Object.fromEntries(Object.entries(rawDb.prepare(`
    SELECT (SELECT count(*) FROM user WHERE id='release-user') AS users,
      (SELECT count(*) FROM organization WHERE id='release-org') AS organizations,
      (SELECT count(*) FROM member WHERE id='release-member') AS members,
      (SELECT count(*) FROM business_profile WHERE id='release-profile') AS profiles,
      (SELECT count(*) FROM organization_license WHERE id='release-license') AS licenses,
      (SELECT count(*) FROM license_price) AS price_seeds,
      (SELECT first_report_opened_at FROM identified_diagnostic_request WHERE id='release-request') AS first_open,
      (SELECT count(*) FROM diagnostic_funnel_aggregate) AS aggregates,
      (SELECT count(*) FROM miniweb_site) AS miniweb_sites,
      (SELECT count(*) FROM organization_training_assignment) AS training_assignments,
      (SELECT count(*) FROM platform_owner_invitation) AS owner_invitations
  `).get()));
  assert.deepEqual(preserved, { users: 1, organizations: 1, members: 1, profiles: 1, licenses: 1, price_seeds: 3, first_open: 2000, aggregates: 0, miniweb_sites: 0, training_assignments: 0, owner_invitations: 0 });

  const requiredIndexes = new Set(rawDb.prepare("SELECT name FROM sqlite_master WHERE type='index'").all().map(({ name }) => name));
  for (const indexName of [
    "identified_diagnostic_request_idempotency_uq", "diagnostic_report_access_challenge_uq",
    "diagnostic_event_uuid_unique", "miniweb_site_organization_unique",
    "organization_training_assignment_unique", "platform_owner_invitation_pending_org_unique",
  ]) assert.ok(requiredIndexes.has(indexName), `índice ausente: ${indexName}`);
  const requestColumns = new Set(rawDb.prepare("PRAGMA table_info(identified_diagnostic_request)").all().map(({ name }) => name));
  assert.ok(requestColumns.has("first_report_opened_at"));
  const accessColumns = new Set(rawDb.prepare("PRAGMA table_info(diagnostic_report_access)").all().map(({ name }) => name));
  assert.ok(!accessColumns.has("first_opened_at"), "0019 debe retirar la columna provisional tras el backfill");
  rawDb.close();

  console.log("PASS: D1 sintética 0010 → 0021, datos históricos/licencias preservados, backfill 0019 mínimo, seeds e índices verificados, SQLite integrity_check=ok y foreign_key_check vacío.");
} finally {
  try {
    rmSync(temporaryRoot, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  } catch (error) {
    if (process.platform !== "win32" || error?.code !== "EPERM") throw error;
    console.warn(`La D1 sintética se certificó; Windows retuvo el directorio temporal bloqueado para inspección: ${temporaryRoot}`);
  }
}
