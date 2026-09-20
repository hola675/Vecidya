$sessionName = "vecidya-foundation-check"

npx --yes agent-browser --session $sessionName open http://127.0.0.1:5173
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx --yes agent-browser --session $sessionName wait --load networkidle
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx --yes agent-browser --session $sessionName get title
npx --yes agent-browser --session $sessionName snapshot
npx --yes agent-browser --session $sessionName console
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx --yes agent-browser --session $sessionName open http://127.0.0.1:5173/__health/db
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx --yes agent-browser --session $sessionName wait --load networkidle
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$healthResponse = npx --yes agent-browser --session $sessionName read
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Output $healthResponse
if ($healthResponse -notmatch '"status"\s*:\s*"ok"' -or
    $healthResponse -notmatch '"database"\s*:\s*"d1"' -or
    $healthResponse -notmatch '"environment"\s*:\s*"LOCAL"') {
  Write-Error "D1 browser health response did not match the expected payload."
  exit 1
}

npx --yes agent-browser --session $sessionName console
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npx --yes agent-browser --session $sessionName close
