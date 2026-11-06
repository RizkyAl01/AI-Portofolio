param(
    [Parameter(Mandatory)][ValidateSet('pm','security','designer','frontend','backend','qa','tester')][string]$Role,
    [Parameter(Mandatory)][string]$Task,
    [ValidateSet('auto','agy','copilot')][string]$Engine = 'auto'
)

# Satu role = satu model per engine. Ubah di sini untuk mengganti model.
$cfg = @{
    pm       = @{ agy = 'claude-opus-5-5-high';    copilot = 'claude-sonnet-5.5'; mode = 'plan' }
    security = @{ agy = 'claude-opus-5-5-high';    copilot = 'claude-sonnet-5.5'; mode = 'accept-edits' }
    designer = @{ agy = 'gemini-4-argon-high';     copilot = 'gemini-3.8-flash';  mode = 'accept-edits' }
    frontend = @{ agy = 'claude-sonnet-5-5-high';  copilot = 'claude-sonnet-5.5'; mode = 'accept-edits' }
    backend  = @{ agy = 'claude-sonnet-5-5-high';  copilot = 'claude-sonnet-5.5'; mode = 'accept-edits' }
    qa       = @{ agy = 'gemini-4-argon-high';     copilot = 'gpt-6-luna';        mode = 'plan' }
    tester   = @{ agy = 'gemini-3.8-flash-medium'; copilot = 'gemini-3.8-flash';  mode = 'accept-edits' }
}[$Role]

$root = Split-Path $PSScriptRoot -Parent
$persona = (Get-Content (Join-Path $root ".github\agents\$Role.agent.md") -Raw) -replace '(?s)^---.*?---\s*', ''
$prompt = "ROLE: $Role`n$persona`nAturan tambahan: ikuti .clinerules\ (ponytail, antislop) dan docs\TASKS.md.`n`nTUGAS:`n$Task"

function Invoke-Agy {
    agy --model $cfg.agy --mode $cfg.mode -p $prompt
    return $LASTEXITCODE
}

function Invoke-Copilot {
    # QA read-only: tanpa izin tulis. Role lain boleh edit file dan menjalankan shell.
    $perm = if ($Role -eq 'qa') { @('--allow-tool=read') } else { @('--allow-all-tools') }
    # Prompt lewat file di dalam proyek (argumen multi-baris rusak di Windows).
    $dir = Join-Path $PSScriptRoot '.prompts'
    New-Item -ItemType Directory -Force $dir | Out-Null
    $f = Join-Path $dir "$Role.md"
    Set-Content $f $prompt -Encoding utf8
    $loader = Join-Path $PSScriptRoot '.copilot\node_modules\@github\copilot\npm-loader.js'
    node $loader --model $cfg.copilot @perm -p "Baca file $f lalu kerjakan seluruh instruksinya."
    $c = $LASTEXITCODE
    Remove-Item $f -ErrorAction SilentlyContinue
    return $c
}

Push-Location $root
try {
    $code = 1
    if ($Engine -in 'auto','agy') {
        $code = Invoke-Agy
        if ($code -ne 0 -and $Engine -eq 'auto') { Write-Warning "agy gagal (exit $code), pindah ke Copilot." }
    }
    if ($Engine -eq 'copilot' -or ($Engine -eq 'auto' -and $code -ne 0)) { $code = Invoke-Copilot }
    exit $code
}
finally { Pop-Location }
