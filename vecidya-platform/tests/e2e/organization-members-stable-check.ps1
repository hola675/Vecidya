$ErrorActionPreference = "Stop"
$env:BETTER_AUTH_SECRET = "local-hardening-only-secret-32-chars"
$fixture = [System.IO.Path]::GetTempFileName()
$worker = $null
function Start-LocalWorker {
  $script:worker = Start-Process -FilePath "pnpm.cmd" -ArgumentList "exec wrangler dev --local --port 5173 --inspector-port 0" -WorkingDirectory (Get-Location) -PassThru -WindowStyle Hidden
  for ($i = 0; $i -lt 60; $i++) { try { Invoke-WebRequest -Uri "http://127.0.0.1:5173/" -UseBasicParsing -TimeoutSec 1 | Out-Null; return } catch { Start-Sleep -Milliseconds 500 } }
  throw "El Worker no inició en el tiempo esperado."
}
function Stop-LocalWorker {
  if ($script:worker -and -not $script:worker.HasExited) { Stop-Process -Id $script:worker.Id -Force; $script:worker.WaitForExit(5000) | Out-Null }
  $script:worker = $null
}
try {
  Start-LocalWorker
  $env:MEMBERS_FIXTURE_FILE = $fixture
  node tests/e2e/organization-members-setup.mjs
  Stop-LocalWorker
  node tests/e2e/organization-members-apply-fixture.mjs
  Start-LocalWorker
  node tests/e2e/organization-members-check.mjs
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Output "PASS: TEST-002 estable; setup, D1 fixture, restart y matriz HTTP completados."
} finally {
  Stop-LocalWorker
  Remove-Item -LiteralPath $fixture -Force -ErrorAction SilentlyContinue
  Remove-Item Env:MEMBERS_FIXTURE_FILE -ErrorAction SilentlyContinue
}
