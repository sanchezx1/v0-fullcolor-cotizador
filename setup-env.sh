#!/bin/bash

# Script para configurar variables de entorno de Supabase
# Ejecutar: bash setup-env.sh

echo "🔧 Configurando variables de entorno para Supabase..."

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cat > .env.local << 'EOF'
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
EOF
    echo "✅ Archivo .env.local creado"
else
    echo "⚠️  El archivo .env.local ya existe"
fi

echo ""
echo "🔑 IMPORTANTE: Debes configurar las siguientes variables en .env.local:"
echo ""
echo "1. NEXT_PUBLIC_SUPABASE_URL - URL de tu proyecto Supabase"
echo "2. NEXT_PUBLIC_SUPABASE_ANON_KEY - Clave anónima de Supabase"
echo ""
echo "📖 Para obtener estas claves:"
echo "   1. Ve a https://supabase.com/dashboard"
echo "   2. Selecciona tu proyecto"
echo "   3. Ve a Settings > API"
echo "   4. Copia la URL y la anon key"
echo ""
echo "🚀 Después de configurar las variables, reinicia el servidor:"
echo "   npm run dev"
