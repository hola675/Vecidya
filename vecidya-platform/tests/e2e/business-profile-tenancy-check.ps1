param([string]$BaseUrl = "http://127.0.0.1:5173")

$parsedBaseUrl = [Uri]$BaseUrl
if ($parsedBaseUrl.Scheme -ne "http" -or $parsedBaseUrl.Host -notin @("localhost", "127.0.0.1")) { throw "Los E2E locales solo permiten localhost/127.0.0.1." }

$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$sessionA = "vecidya-profile-a-$suffix"
$sessionB = "vecidya-profile-b-$suffix"
$slugA = "profile-org-a-$suffix"
$slugB = "profile-org-b-$suffix"

function Invoke-Browser($session, [string[]]$Arguments) {
  & npx --yes agent-browser --session $session @Arguments
  if ($LASTEXITCODE -ne 0) { throw "agent-browser failed: $Arguments" }
}

function Register-And-CreateOrganization($session, $email, $organizationName, $organizationSlug) {
  Invoke-Browser $session @("open", "$BaseUrl/register")
  Invoke-Browser $session @("snapshot", "-i") | Out-Null
  Invoke-Browser $session @("fill", "@e4", $organizationName)
  Invoke-Browser $session @("fill", "@e5", $email)
  Invoke-Browser $session @("fill", "@e6", "test-only-password-$suffix")
  Invoke-Browser $session @("click", "@e2")
  Invoke-Browser $session @("wait", "--url", "**/app")
  Invoke-Browser $session @("snapshot", "-i") | Out-Null
  Invoke-Browser $session @("fill", "@e12", $organizationName)
  Invoke-Browser $session @("fill", "@e13", $organizationSlug)
  Invoke-Browser $session @("click", "@e11")
  Invoke-Browser $session @("wait", "--text", $organizationName)
}

try {
  Register-And-CreateOrganization $sessionA "profile-a-$suffix@vecidya.test" "Organizacion A $suffix" $slugA
  Invoke-Browser $sessionA @("open", "$BaseUrl/app/business-profile")
  Invoke-Browser $sessionA @("snapshot", "-i") | Out-Null
  Invoke-Browser $sessionA @("fill", "@e4", "Negocio A $suffix")
  Invoke-Browser $sessionA @("fill", "@e5", "negocio-a-$suffix")
  Invoke-Browser $sessionA @("click", "@e3")
  Invoke-Browser $sessionA @("wait", "--text", "Perfil guardado como borrador.")

  $queryOutput = (& pnpm wrangler d1 execute DB --local --command "SELECT id FROM organization WHERE slug = '$slugA';" | Out-String)
  $organizationId = [regex]::Match($queryOutput, '"id"\s*:\s*"([^"]+)"').Groups[1].Value
  if (-not $organizationId) { throw "No se encontró la organización de prueba A." }

  Register-And-CreateOrganization $sessionB "profile-b-$suffix@vecidya.test" "Organizacion B $suffix" $slugB
  $target = "$BaseUrl/api/organizations/$organizationId/business-profile"
  $script = "const body = new FormData(); body.set('displayName', 'Acceso indebido'); body.set('slug', 'acceso-indebido-$suffix'); fetch('$target', { method: 'POST', body }).then(async r => ({ status: r.status, body: await r.text() }));"
  $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($script))
  $response = Invoke-Browser $sessionB @("eval", "-b", $encoded) | Out-String
  if ($response -notmatch '"status"\s*:\s*403') { throw "La modificación cross-tenant no devolvió 403: $response" }

  Write-Output "PASS: el propietario guardó un perfil y un tenant ajeno recibió 403 al modificarlo."
}
finally {
  & npx --yes agent-browser --session $sessionA close 2>$null
  & npx --yes agent-browser --session $sessionB close 2>$null
}
