#!/usr/bin/env pwsh
# run-all-qa.ps1
# Script para ejecutar todos los agentes de QA en orden

param(
    [switch]$SkipTests = $false,
    [switch]$SkipE2E = $false,
    [switch]$SkipSecurity = $false,
    [switch]$Verbose = $false
)

# Colors
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error-Custom { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning-Custom { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Section { param($Message) Write-Host "`n$Message" -ForegroundColor Yellow -BackgroundColor Black }

$Failed = 0
$StartTime = Get-Date

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║     FullColor Cotizador - QA Pipeline Completo           ║
║                                                           ║
║  🧪 Testing Agent  |  ⚡ Performance  |  🔒 Security     ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Info "Iniciando QA Pipeline..."
Write-Info "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# ==========================================
# 1. Pre-checks
# ==========================================
Write-Section "🔍 Pre-checks"

Write-Info "Verificando Node.js..."
$NodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Node.js no está instalado"
    exit 1
}
Write-Success "Node.js $NodeVersion"

Write-Info "Verificando npm..."
$NpmVersion = npm --version
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "npm no está instalado"
    exit 1
}
Write-Success "npm $NpmVersion"

Write-Info "Verificando dependencias..."
if (-not (Test-Path "node_modules")) {
    Write-Warning-Custom "node_modules no existe. Ejecutando npm install..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "npm install falló"
        exit 1
    }
}
Write-Success "Dependencias instaladas"

# ==========================================
# 2. Testing Agent 🧪
# ==========================================
if (-not $SkipTests) {
    Write-Section "🧪 Testing Agent"
    
    Write-Info "Ejecutando tests unitarios..."
    npm run test:unit
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Tests unitarios fallaron"
        $Failed++
    } else {
        Write-Success "Tests unitarios pasaron"
    }
    
    Write-Info "Ejecutando tests de integración..."
    npm run test:integration
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Tests de integración fallaron"
        $Failed++
    } else {
        Write-Success "Tests de integración pasaron"
    }
    
    if (-not $SkipE2E) {
        Write-Info "Ejecutando tests E2E..."
        npm run test:e2e
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Tests E2E fallaron"
            $Failed++
        } else {
            Write-Success "Tests E2E pasaron"
        }
    } else {
        Write-Warning-Custom "Tests E2E omitidos (--SkipE2E)"
    }
    
    Write-Info "Generando reporte de cobertura..."
    npm run test:coverage -- --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Cobertura insuficiente"
        $Failed++
    } else {
        Write-Success "Cobertura alcanzada"
    }
} else {
    Write-Warning-Custom "Testing Agent omitido (--SkipTests)"
}

# ==========================================
# 3. Performance Agent ⚡
# ==========================================
Write-Section "⚡ Performance Agent"

Write-Info "Construyendo proyecto..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Build falló"
    $Failed++
} else {
    Write-Success "Build exitoso"
    
    # Analizar bundle size
    Write-Info "Analizando bundle size..."
    $BuildOutput = npm run build 2>&1 | Out-String
    $FirstLoadJS = $BuildOutput | Select-String -Pattern "First Load JS.*?(\d+\.?\d*)\s*kB" | ForEach-Object { $_.Matches.Groups[1].Value }
    
    if ($FirstLoadJS) {
        $BundleSizeKB = [double]$FirstLoadJS
        if ($BundleSizeKB -gt 200) {
            Write-Warning-Custom "Bundle size: ${BundleSizeKB}KB (límite: 200KB)"
        } else {
            Write-Success "Bundle size: ${BundleSizeKB}KB (OK)"
        }
    } else {
        Write-Info "No se pudo extraer bundle size del build output"
    }
}

# ==========================================
# 4. Security Agent 🔒
# ==========================================
if (-not $SkipSecurity) {
    Write-Section "🔒 Security Agent"
    
    Write-Info "Ejecutando npm audit..."
    $AuditOutput = npm audit --audit-level=moderate 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Vulnerabilidades encontradas"
        Write-Host $AuditOutput -ForegroundColor Gray
        $Failed++
    } else {
        Write-Success "Sin vulnerabilidades críticas"
    }
    
    Write-Info "Verificando secretos en .gitignore..."
    $GitignoreContent = Get-Content .gitignore -ErrorAction SilentlyContinue
    if ($GitignoreContent -match "\.env\.local") {
        Write-Success ".env.local está en .gitignore"
    } else {
        Write-Error-Custom ".env.local NO está en .gitignore"
        $Failed++
    }
    
    Write-Info "Verificando TypeScript strict mode..."
    $TsConfigContent = Get-Content tsconfig.json -ErrorAction SilentlyContinue
    if ($TsConfigContent -match '"strict":\s*true') {
        Write-Success "TypeScript strict mode activo"
    } else {
        Write-Warning-Custom "TypeScript strict mode no detectado"
    }
    
    Write-Info "Ejecutando TypeScript check..."
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Errores de TypeScript encontrados"
        $Failed++
    } else {
        Write-Success "Sin errores de TypeScript"
    }
    
    Write-Info "Ejecutando linter..."
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Warning-Custom "Advertencias de linter encontradas"
    } else {
        Write-Success "Linter pasó"
    }
} else {
    Write-Warning-Custom "Security Agent omitido (--SkipSecurity)"
}

# ==========================================
# 5. Summary
# ==========================================
$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      RESUMEN                              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`nDuración: $($Duration.ToString('mm\:ss'))" -ForegroundColor Gray

if ($Failed -eq 0) {
    Write-Host @"

    ✅✅✅ TODOS LOS CHECKS PASARON ✅✅✅
    
    El proyecto está listo para producción! 🚀
    
"@ -ForegroundColor Green
    exit 0
} else {
    Write-Host @"

    ❌❌❌ $Failed CHECK(S) FALLARON ❌❌❌
    
    Por favor corrige los errores antes de deployar.
    
    Ver logs arriba para detalles.
    
"@ -ForegroundColor Red
    exit 1
}
