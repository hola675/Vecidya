param([string]$BaseUrl = "http://127.0.0.1:5173")

$parsedBaseUrl = [Uri]$BaseUrl
if ($parsedBaseUrl.Scheme -ne "http" -or $parsedBaseUrl.Host -notin @("localhost", "127.0.0.1")) { throw "Los E2E locales solo permiten localhost/127.0.0.1." }

$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$publishedSession = "vecidya-public-profile-$suffix"
$draftSession = "vecidya-draft-profile-$suffix"
$visitorSession = "vecidya-visitor-$suffix"

function Invoke-Browser($session, [string[]]$Arguments) {
  Write-Verbose "agent-browser $session $Arguments"
  & npx.cmd --yes agent-browser --session $session $Arguments
  if ($LASTEXITCODE -ne 0) { throw "agent-browser failed: $Arguments" }
}

function New-Organization($session, $prefix) {
  $organizationName = "$prefix $suffix"
  $organizationSlug = "$($prefix.ToLower())-$suffix"
  Invoke-Browser $session @("open", "$BaseUrl/register")
  Invoke-Browser $session @("snapshot", "-i") | Out-Null
  Invoke-Browser $session @("fill", "@e4", $organizationName)
  Invoke-Browser $session @("fill", "@e5", "$organizationSlug@vecidya.test")
  Invoke-Browser $session @("fill", "@e6", "test-only-password-$suffix")
  Invoke-Browser $session @("click", "@e2")
  Invoke-Browser $session @("wait", "--url", "**/app")
  Invoke-Browser $session @("snapshot", "-i") | Out-Null
  Invoke-Browser $session @("fill", "@e12", $organizationName)
  Invoke-Browser $session @("fill", "@e13", $organizationSlug)
  Invoke-Browser $session @("click", "@e11")
  Invoke-Browser $session @("wait", "--text", $organizationName)

  $queryOutput = (& pnpm wrangler d1 execute DB --local --command "SELECT id FROM organization WHERE slug = '$organizationSlug';" | Out-String)
  $organizationId = [regex]::Match($queryOutput, '"id"\s*:\s*"([^"]+)"').Groups[1].Value
  if (-not $organizationId) { throw "No se encontró la organización de prueba." }
  $script = "fetch('/api/auth/organization/set-active', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ organizationId: '$organizationId' }) }).then(r => ({ status: r.status }));"
  $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($script))
  $activeResponse = Invoke-Browser $session @("eval", "-b", $encoded) | Out-String
  if ($activeResponse -notmatch '"status"\s*:\s*200') { throw "No se pudo activar la organización de prueba." }
  return $organizationSlug
}

function Save-Profile($session, $slug, [bool]$publish) {
  Invoke-Browser $session @("open", "$BaseUrl/app/business-profile")
  Invoke-Browser $session @("snapshot", "-i") | Out-Null
  Invoke-Browser $session @("fill", "@e5", "Negocio $slug")
  Invoke-Browser $session @("fill", "@e6", $slug)
  Invoke-Browser $session @("fill", "@e7", "Descripción pública de prueba")
  Invoke-Browser $session @("fill", "@e9", "Decoración")
  Invoke-Browser $session @("fill", "@e10", "La Habana")
  Invoke-Browser $session @("fill", "@e11", "Cuba")
  if ($publish) {
    Invoke-Browser $session @("find", "role", "button", "click", "--name", "Publicar perfil")
    Invoke-Browser $session @("wait", "--text", "Edita tu perfil de negocio")
  } else {
    Invoke-Browser $session @("find", "role", "button", "click", "--name", "Guardar")
    Invoke-Browser $session @("wait", "--text", "Perfil guardado como borrador.")
  }
}

try {
  $publishedSlug = "publicado-$suffix"
  New-Organization $publishedSession "Publico"
  Save-Profile $publishedSession $publishedSlug $true

  Invoke-Browser $visitorSession @("open", "$BaseUrl/vecindario/$publishedSlug")
  Invoke-Browser $visitorSession @("wait", "--text", "Negocio $publishedSlug")
  $publicTitle = Invoke-Browser $visitorSession @("get", "title") | Out-String
  if ($publicTitle -notmatch "Negocio $publishedSlug") { throw "El perfil publicado no generó el título SEO esperado." }
  Invoke-Browser $visitorSession @("open", "$BaseUrl/vecindario")
  Invoke-Browser $visitorSession @("wait", "--text", "Negocio $publishedSlug")
  Invoke-Browser $visitorSession @("open", "$BaseUrl/vecindario?q=$publishedSlug")
  Invoke-Browser $visitorSession @("wait", "--text", "Negocio $publishedSlug")
  Invoke-Browser $visitorSession @("open", "$BaseUrl/vecindario?category=Decoración")
  Invoke-Browser $visitorSession @("wait", "--text", "Negocio $publishedSlug")
  Invoke-Browser $visitorSession @("open", "$BaseUrl/vecindario?city=La%20Habana")
  Invoke-Browser $visitorSession @("wait", "--text", "Negocio $publishedSlug")
  Invoke-Browser $visitorSession @("open", "$BaseUrl/vecindario?q=$publishedSlug&city=La%20Habana")
  Invoke-Browser $visitorSession @("wait", "--text", "Negocio $publishedSlug")
  Invoke-Browser $visitorSession @("open", "$BaseUrl/vecindario?q=sin-resultados-$suffix")
  Invoke-Browser $visitorSession @("wait", "--text", "No hay resultados")

  $draftSlug = "borrador-$suffix"
  New-Organization $draftSession "Borrador"
  Save-Profile $draftSession $draftSlug $false
  Invoke-Browser $visitorSession @("open", "$BaseUrl/vecindario/$draftSlug")
  $requests = Invoke-Browser $visitorSession @("network", "requests") | Out-String
  if ($requests -notmatch [regex]::Escape("/vecindario/$draftSlug") + ".* 404") {
    throw "El perfil draft no devolvió 404: $requests"
  }
  Invoke-Browser $visitorSession @("open", "$BaseUrl/vecindario")
  $directorySnapshot = Invoke-Browser $visitorSession @("snapshot", "-i") | Out-String
  if ($directorySnapshot -match [regex]::Escape("Negocio $draftSlug")) {
    throw "El directorio expuso un perfil draft."
  }

  Write-Output "PASS: perfil publicado accesible y listado; perfil draft excluido del detalle y directorio."
}
finally {
  foreach ($session in @($publishedSession, $draftSession, $visitorSession)) {
    & npx.cmd --yes agent-browser --session $session close 2>$null
  }
}
