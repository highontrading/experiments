# Vibe Editing: one-time setup for Windows 10/11.
# Run in PowerShell:  powershell -ExecutionPolicy Bypass -File install\install_windows.ps1
$ErrorActionPreference = "Stop"
$engine = Join-Path $PSScriptRoot "..\skills\vibe-edit\engine\ve.py"
function Refresh-Path { $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User") }
if (-not (Get-Command python -ErrorAction SilentlyContinue) -or ((python --version 2>&1) -match "Microsoft Store")) {
  Write-Host "Installing Python..."
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  Refresh-Path
}
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Write-Host "Installing ffmpeg..."
  winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
  Refresh-Path
}
python $engine setup
Write-Host "If python or ffmpeg is still 'not found', close this window, open a new one and run this script again."
