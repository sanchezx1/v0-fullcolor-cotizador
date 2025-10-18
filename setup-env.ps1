# Script para configurar variables de entorno de Supabase en Windows
# Ejecutar: .\setup-env.ps1

Write-Host "🔧 Configurando variables de entorno para Supabase..." -ForegroundColor Cyan

# Crear archivo .env.local si no existe
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creando archivo .env.local..." -ForegroundColor Yellow
    
    $envContent = @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server/Edge Function Keys (for PDF generation and email)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Email Configuration (for sending quotes)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@fullcolor.com

# WhatsApp Configuration
WHATSAPP_NUMBER=593999999999
WHATSAPP_MESSAGE_TEMPLATE=Hola, necesito información sobre la cotización #{QUOTE_ID}

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_NAME=FullColor
NEXT_PUBLIC_COMPANY_EMAIL=info@fullcolor.com
NEXT_PUBLIC_COMPANY_PHONE=+593 99 123 4567
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Archivo .env.local creado" -ForegroundColor Green
} else {
    Write-Host "⚠️  El archivo .env.local ya existe" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔑 IMPORTANTE: Debes configurar las siguientes variables en .env.local:" -ForegroundColor Red
Write-Host ""
Write-Host "1. NEXT_PUBLIC_SUPABASE_URL - URL de tu proyecto Supabase" -ForegroundColor White
Write-Host "2. NEXT_PUBLIC_SUPABASE_ANON_KEY - Clave anónima de Supabase" -ForegroundColor White
Write-Host ""
Write-Host "📖 Para obtener estas claves:" -ForegroundColor Cyan
Write-Host "   1. Ve a https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   2. Selecciona tu proyecto" -ForegroundColor White
Write-Host "   3. Ve a Settings > API" -ForegroundColor White
Write-Host "   4. Copia la URL y la anon key" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Después de configurar las variables, reinicia el servidor:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor White
